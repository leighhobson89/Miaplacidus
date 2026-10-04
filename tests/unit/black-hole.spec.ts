import { describe, expect, it } from "vitest";
import { LOCALE_IDS } from "../../src/content/ids";
import { BLACK_HOLE_CHARGE_TIMER_ID, rollBlackHoleDiscovery } from "../../src/engine/blackHole";
import { transition } from "../../src/engine/commands";
import { createInitialGameState, isValidGameState, type GameState } from "../../src/engine/state";
import { createClockState } from "../../src/engine/clock";
import { nextRandom } from "../../src/engine/random";
import { STAR_STUDY_TIMER_ID } from "../../src/content/space";
import { createTimer } from "../../src/engine/timers";
import { advanceTimers, createTimerId, timerPolicyFor } from "../../src/engine/timers";
import { decodePortable, encodePortable } from "../../src/persistence/codec";
import { makeEnvelope } from "../../src/persistence/schema";
import { blackHoleText } from "../../src/i18n/blackHoleMessages";

function stateWithHole(
  options: {
    readonly seed?: number;
    readonly rebirthCount?: number;
    readonly discovered?: boolean;
    readonly researched?: boolean;
    readonly researchPoints?: number;
  } = {},
): GameState {
  const base = createInitialGameState({ seed: options.seed ?? 80 });
  return {
    ...base,
    run: {
      ...base.run,
      researchPoints: options.researchPoints ?? 0,
    },
    permanent: {
      ...base.permanent,
      rebirthCount: options.rebirthCount ?? 1,
      blackHole: {
        ...base.permanent.blackHole,
        discovered: options.discovered ?? true,
        researched: options.researched ?? false,
        discoveryProbability: options.discovered ? 3 : 0,
      },
    },
  };
}

function seedBetween(minimum: number, maximum: number, draws = 0): number {
  for (let seed = 0; seed < 100_000; seed += 1) {
    const value = nextRandom({ seed, draws }).value;
    if (value >= minimum && value < maximum) return seed;
  }
  throw new Error("No matching Black Hole discovery seed was found.");
}

describe("Black Hole progression", () => {
  it("starts discovery on the second run and adds three percent before each seeded roll", () => {
    const seed = seedBetween(0, 0.03);
    const firstRun = rollBlackHoleDiscovery(stateWithHole({ seed, rebirthCount: 0 }));
    expect(firstRun.events).toEqual([]);
    expect(firstRun.state.run.random.draws).toBe(0);

    const secondRun = rollBlackHoleDiscovery(
      stateWithHole({ seed, rebirthCount: 1, discovered: false }),
    );
    expect(secondRun.state.permanent.blackHole.discoveryProbability).toBe(3);
    expect(secondRun.state.permanent.blackHole.discovered).toBe(true);
    expect(secondRun.events).toEqual([
      { type: "black-hole.discovery-checked", probability: 3, discovered: true },
    ]);

    let laterSeed = -1;
    for (let seed = 0; seed < 100_000; seed += 1) {
      const first = nextRandom({ seed, draws: 0 }).value;
      const second = nextRandom({ seed, draws: 1 }).value;
      if (first >= 0.03 && second < 0.06) {
        laterSeed = seed;
        break;
      }
    }
    expect(laterSeed).toBeGreaterThanOrEqual(0);
    const firstFailed = rollBlackHoleDiscovery(
      stateWithHole({ seed: laterSeed, discovered: false }),
    );
    expect(firstFailed.state.permanent.blackHole.discoveryProbability).toBe(3);
    expect(firstFailed.state.permanent.blackHole.discovered).toBe(false);
    const secondPassed = rollBlackHoleDiscovery(firstFailed.state);
    expect(secondPassed.state.permanent.blackHole.discoveryProbability).toBe(6);
    expect(secondPassed.state.permanent.blackHole.discovered).toBe(true);
  });

  it("rolls discovery at the completed star-study command boundary", () => {
    const seed = seedBetween(0, 0.03);
    const state = stateWithHole({ seed, discovered: false });
    const studying: GameState = {
      ...state,
      run: {
        ...state.run,
        timers: {
          ...state.run.timers,
          [STAR_STUDY_TIMER_ID]: createTimer({
            id: STAR_STUDY_TIMER_ID,
            domain: "survey",
            durationMs: 400_000,
          }),
        },
        space: { ...state.run.space, activeSurvey: "stars", telescopeBuilt: true },
      },
    };

    expect(isValidGameState(studying)).toBe(true);
    const result = transition(studying, { type: "timer.complete", timerId: STAR_STUDY_TIMER_ID });
    expect(result.accepted, JSON.stringify(result.failure)).toBe(true);
    expect(result.state.permanent.blackHole.discovered).toBe(true);
    expect(result.state.permanent.blackHole.discoveryProbability).toBe(3);
    expect(result.events).toContainEqual({
      type: "black-hole.discovery-checked",
      probability: 3,
      discovered: true,
    });
  });

  it("requires discovery and exact research affordability, then auto-starts the 300-second charge", () => {
    const undiscovered = stateWithHole({ discovered: false, researchPoints: 1_000_000 });
    expect(transition(undiscovered, { type: "black-hole.research" }).failure?.code).toBe(
      "black-hole-undiscovered",
    );
    const short = stateWithHole({ researchPoints: 999_999 });
    expect(transition(short, { type: "black-hole.research" }).failure?.code).toBe(
      "black-hole-insufficient-research",
    );

    const researched = transition(stateWithHole({ researchPoints: 1_000_000 }), {
      type: "black-hole.research",
    });
    expect(researched.accepted).toBe(true);
    expect(researched.state.run.researchPoints).toBe(0);
    expect(researched.state.permanent.blackHole.researched).toBe(true);
    expect(researched.state.run.timers[BLACK_HOLE_CHARGE_TIMER_ID]).toMatchObject({
      domain: "black-hole",
      durationMs: 300_000,
      elapsedMs: 0,
      status: "running",
    });
    expect(isValidGameState(researched.state)).toBe(true);
  });

  it("applies source upgrade costs and effects, including the final always-on recharge", () => {
    const initial = stateWithHole({ researched: true, researchPoints: 10_000_000 });
    const power = transition(initial, { type: "black-hole.upgrade", upgradeId: "power" });
    expect(power.state.permanent.blackHole.power).toBe(7);
    expect(power.state.run.researchPoints).toBe(9_150_000);
    expect(power.state.permanent.blackHole.powerPrice).toBe(960_500);

    const duration = transition(power.state, {
      type: "black-hole.upgrade",
      upgradeId: "duration",
    });
    expect(duration.state.permanent.blackHole.durationMs).toBe(6_000);
    expect(duration.state.permanent.blackHole.durationPrice).toBe(678_000);

    const recharged = transition(duration.state, {
      type: "black-hole.upgrade",
      upgradeId: "recharge",
    });
    expect(recharged.state.permanent.blackHole.rechargeMultiplier).toBe(0.88);
    expect(recharged.state.permanent.blackHole.rechargePrice).toBe(1_017_000);

    const nearlyAlwaysOn: GameState = {
      ...recharged.state,
      permanent: {
        ...recharged.state.permanent,
        blackHole: {
          ...recharged.state.permanent.blackHole,
          rechargeMultiplier: 0.1056,
          rechargePrice: 1,
        },
      },
    };
    const lastRecharge = transition(nearlyAlwaysOn, {
      type: "black-hole.upgrade",
      upgradeId: "recharge",
    });
    expect(lastRecharge.state.permanent.blackHole.alwaysOn).toBe(true);
    expect(lastRecharge.state.permanent.blackHole.rechargeMultiplier).toBe(0.1);
    expect(isValidGameState(lastRecharge.state)).toBe(true);
  });

  it("completes charge once, activates a finite warp, then resumes charge after wall-time expiry", () => {
    const charging = transition(stateWithHole({ researched: true }), {
      type: "black-hole.activate",
    });
    const completed = transition(charging.state, {
      type: "timer.complete",
      timerId: BLACK_HOLE_CHARGE_TIMER_ID,
    });
    expect(completed.state.run.blackHoleChargeReady).toBe(true);
    expect(completed.events).toContainEqual({ type: "black-hole.charge-completed" });

    const repeated = transition(completed.state, {
      type: "timer.complete",
      timerId: BLACK_HOLE_CHARGE_TIMER_ID,
    });
    expect(repeated.events).not.toContainEqual({ type: "black-hole.charge-completed" });

    const active = transition(completed.state, { type: "black-hole.activate" });
    expect(active.state.run.blackHoleWarpActive).toBe(true);
    expect(active.state.run.timeWarp).toEqual({ multiplier: 5, remainingMs: 3_000 });
    const saved = decodePortable(
      encodePortable(
        makeEnvelope({
          slotId: "11111111-1111-4111-8111-111111111111",
          pioneerName: active.state.run.pioneerName,
          createdAt: 1,
          savedAt: 1,
          revision: 1,
          state: active.state,
        }),
      ),
    ).state;
    expect(saved.run.blackHoleWarpActive).toBe(true);
    expect(saved.run.timeWarp.remainingMs).toBe(3_000);

    let ending = transition(active.state, {
      type: "clock.advance",
      input: { wallNowMs: 1_000, foreground: true },
    }).state;
    for (let tick = 1; tick <= 12; tick += 1) {
      ending = transition(ending, {
        type: "clock.advance",
        input: { wallNowMs: 1_000 + tick * 250, foreground: true },
      }).state;
    }
    expect(ending.run.blackHoleWarpActive).toBe(false);
    expect(ending.run.timeWarp).toEqual({ multiplier: 1, remainingMs: 0 });
    expect(ending.run.timers[BLACK_HOLE_CHARGE_TIMER_ID]?.status).toBe("running");
    expect(isValidGameState(ending)).toBe(true);
  });

  it("expires a warp while hidden, accounts for the remaining offline charge, and reloads cleanly", () => {
    const state = stateWithHole({ researched: true });
    const warping: GameState = {
      ...state,
      run: {
        ...state.run,
        clock: { ...createClockState(1_000), foreground: true },
        blackHoleWarpActive: true,
        timeWarp: { multiplier: 5, remainingMs: 1_000 },
      },
    };
    const hidden = transition(warping, {
      type: "clock.advance",
      input: { wallNowMs: 1_000, foreground: false },
    });
    const returned = transition(hidden.state, {
      type: "clock.advance",
      input: { wallNowMs: 5_000, foreground: true },
    });
    expect(returned.state.run.blackHoleWarpActive).toBe(false);
    expect(returned.state.run.timers[BLACK_HOLE_CHARGE_TIMER_ID]).toMatchObject({
      status: "running",
      elapsedMs: 3_000,
      durationMs: 300_000,
    });
    expect(returned.events.filter((event) => event.type === "black-hole.warp-ended")).toHaveLength(
      1,
    );

    const saved = decodePortable(
      encodePortable(
        makeEnvelope({
          slotId: "22222222-2222-4222-8222-222222222222",
          pioneerName: returned.state.run.pioneerName,
          createdAt: 1,
          savedAt: 1,
          revision: 1,
          state: returned.state,
        }),
      ),
    ).state;
    expect(saved.run.timers[BLACK_HOLE_CHARGE_TIMER_ID]?.elapsedMs).toBe(3_000);
    expect(isValidGameState(saved)).toBe(true);
  });

  it("keeps the timer domains on their named warp, offline and wall-clock policies", () => {
    expect(timerPolicyFor("black-hole")).toEqual({
      phase: "simulation",
      offlineEligible: true,
      warpable: true,
    });
    expect(timerPolicyFor("casino")).toEqual({
      phase: "simulation",
      offlineEligible: false,
      warpable: false,
    });
    expect(timerPolicyFor("weather")).toEqual({
      phase: "wall",
      offlineEligible: false,
      warpable: false,
    });
    expect(timerPolicyFor("cosmic-rip")).toEqual({
      phase: "simulation",
      offlineEligible: true,
      warpable: true,
    });

    const blackHoleTimer = createTimer({
      id: BLACK_HOLE_CHARGE_TIMER_ID,
      domain: "black-hole",
      durationMs: 1_500,
    });
    const casinoTimer = createTimer({
      id: createTimerId("casino", "spin"),
      domain: "casino",
      durationMs: 1_000,
    });
    const weatherTimer = createTimer({
      id: createTimerId("weather", "cycle"),
      domain: "weather",
      durationMs: 1_000,
    });
    const advanced = advanceTimers(
      {
        [blackHoleTimer.id]: blackHoleTimer,
        [casinoTimer.id]: casinoTimer,
        [weatherTimer.id]: weatherTimer,
      },
      [
        { phase: "foreground", elapsedMs: 100, warpedElapsedMs: 500, offlineElapsedMs: 0 },
        { phase: "offline", elapsedMs: 334, warpedElapsedMs: 334, offlineElapsedMs: 1_000 },
        { phase: "wall", elapsedMs: 200, warpedElapsedMs: 0, offlineElapsedMs: 0 },
      ],
    );
    expect(advanced.timers[BLACK_HOLE_CHARGE_TIMER_ID]?.status).toBe("complete");
    expect(advanced.timers[casinoTimer.id]?.elapsedMs).toBe(100);
    expect(advanced.timers[weatherTimer.id]?.elapsedMs).toBe(200);
  });

  it("provides complete localized status and upgrade copy in every shipped language", () => {
    for (const locale of LOCALE_IDS) {
      const copy = blackHoleText(locale);
      expect(copy.title.trim()).not.toBe("");
      expect(copy.researchAction.trim()).not.toBe("");
      expect(copy.errors["black-hole-warp-running"].trim()).not.toBe("");
      expect(Object.values(copy.upgradeNames).every((value) => value.trim())).toBe(true);
    }
  });
});
