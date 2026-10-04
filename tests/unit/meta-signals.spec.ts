import { describe, expect, it } from "vitest";
import { ACHIEVEMENT_CATALOGUE, achievementName } from "../../src/content/achievements";
import { LOCALE_IDS } from "../../src/content/ids";
import { THEME_IDS } from "../../src/content/themes";
import { transition } from "../../src/engine/commands";
import { advanceRandomEvents } from "../../src/engine/randomEvents";
import { STAR_WEATHER_TIMER_ID } from "../../src/engine/weather";
import { createInitialGameState, isValidGameState } from "../../src/engine/state";
import { makeEnvelope } from "../../src/persistence/schema";
import { decodeLocal, encodeLocal } from "../../src/persistence/codec";

describe("meta achievements, events, and ticker", () => {
  it("ships all stable achievements with localized names for every supported locale", () => {
    expect(ACHIEVEMENT_CATALOGUE).toHaveLength(70);
    for (const achievement of ACHIEVEMENT_CATALOGUE) {
      for (const locale of LOCALE_IDS) {
        expect(achievementName(achievement.id, locale)).not.toBe(achievement.id);
      }
    }
  });

  it("awards a threshold achievement once at the accepted-command boundary", () => {
    let state = createInitialGameState({ pioneerName: "Achievement", seed: 510 });
    state = {
      ...state,
      run: {
        ...state.run,
        goods: {
          ...state.run.goods,
          hydrogen: { ...state.run.goods.hydrogen, storageCapacity: 1_000 },
        },
      },
    };
    let lastEvents: readonly { readonly type: string }[] = [];
    for (let count = 0; count < 50; count += 1) {
      const result = transition(state, { type: "resource.collect", goodId: "hydrogen" });
      expect(result.accepted).toBe(true);
      state = result.state;
      lastEvents = result.events;
    }
    expect(state.run.achievements.unlockedIds).toContain("collect50Hydrogen");
    expect(state.run.cash).toBe(20);
    expect(lastEvents).toContainEqual({
      type: "achievement.unlocked",
      achievementId: "collect50Hydrogen",
    });
    const next = transition(state, { type: "resource.collect", goodId: "hydrogen" });
    expect(next.state.run.cash).toBe(20);
    expect(next.events.some((event) => event.type === "achievement.unlocked")).toBe(false);
  });

  it("saves deterministic forced random events and their negative-event history", () => {
    const start = createInitialGameState({ pioneerName: "Event", seed: 511 });
    const result = transition(start, { type: "random-event.force", eventId: "scienceTheft" });
    expect(result.accepted).toBe(true);
    expect(result.state.run.researchPoints).toBe(25);
    expect(result.state.run.randomEvents.history.at(-1)).toMatchObject({
      id: "scienceTheft",
      negative: true,
    });
    const duplicate = transition(result.state, {
      type: "random-event.force",
      eventId: "scienceTheft",
    });
    expect(duplicate.accepted).toBe(true);
    expect(duplicate.state.run.randomEvents.history).toHaveLength(2);
  });

  it("reveals a capped news prize and prevents claiming it twice", () => {
    const start = createInitialGameState({ pioneerName: "Ticker", seed: 512 });
    const ticker = transition(start, { type: "news.ticker.force", category: "prize", id: 2000 });
    expect(ticker.accepted).toBe(true);
    const claim = transition(ticker.state, { type: "news.prize.claim", id: 2000 });
    expect(claim.accepted).toBe(true);
    expect(claim.state.run.goods.hydrogen.quantity).toBeGreaterThan(0);
    expect(claim.state.run.goods.hydrogen.quantity).toBeLessThanOrEqual(
      claim.state.run.goods.hydrogen.storageCapacity / 10,
    );
    const duplicate = transition(claim.state, { type: "news.prize.claim", id: 2000 });
    expect(duplicate.accepted).toBe(false);
  });

  it("applies a one-off bulletin exactly once and tracks distinct visual effects", () => {
    let state = createInitialGameState({ pioneerName: "Ticker", seed: 513 });
    const bulletin = transition(state, { type: "news.ticker.force", category: "oneOff", id: 3013 });
    expect(bulletin.accepted).toBe(true);
    const claim = transition(bulletin.state, { type: "news.prize.claim", id: 3013 });
    expect(claim.accepted).toBe(true);
    expect(claim.state.permanent.ascendencyPoints).toBe(1);
    expect(transition(claim.state, { type: "news.prize.claim", id: 3013 }).accepted).toBe(false);
    state = transition(state, { type: "news.ticker.force", category: "wacky", id: 1000 }).state;
    state = transition(state, { type: "news.ticker.force", category: "wacky", id: 1000 }).state;
    expect(state.run.newsTicker.seenIds.filter((id) => id === 1000)).toHaveLength(1);
    expect(state.run.newsTicker.activatedWackyIds).toEqual([1000]);
  });

  it("awards onboarding and lifetime achievements through accepted engine commands", () => {
    const start = createInitialGameState({ pioneerName: "Long Run", seed: 514 });
    const onboarding = transition(start, { type: "onboarding.complete" });
    expect(onboarding.accepted).toBe(true);
    expect(onboarding.state.permanent.achievements.unlockedIds).toContain("completeOnboarding");

    const activeHours = {
      ...onboarding.state,
      statistics: { ...onboarding.state.statistics, lifetimeActiveMs: 50 * 60 * 60 * 1000 },
    };
    const longRun = transition(activeHours, { type: "onboarding.complete" });
    expect(longRun.state.permanent.achievements.unlockedIds).toContain("have50HoursWithOnePioneer");
    expect(longRun.state.permanent.ascendencyPoints).toBe(50);
  });

  it("records all nine selected themes permanently, awards their milestone once, and reloads cleanly", () => {
    let state = createInitialGameState({ pioneerName: "Palette", seed: 517 });
    expect(state.run.newsTicker.remainingMs).toBeGreaterThanOrEqual(20_000);
    expect(state.run.newsTicker.remainingMs).toBeLessThanOrEqual(35_000);
    expect(
      transition(state, { type: "settings.update", patch: { themeId: "unknown-theme" as never } })
        .accepted,
    ).toBe(false);
    for (const themeId of THEME_IDS.slice(1)) {
      const result = transition(state, { type: "settings.update", patch: { themeId } });
      expect(result.accepted).toBe(true);
      state = result.state;
    }
    expect(state.permanent.achievements.themeIdsTried).toEqual(THEME_IDS);
    expect(state.permanent.achievements.unlockedIds).toContain("tryAllThemes");
    expect(isValidGameState(state)).toBe(true);
    const envelope = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000517",
      pioneerName: state.run.pioneerName,
      createdAt: 0,
      savedAt: 1,
      revision: 1,
      state,
    });
    const reloaded = decodeLocal(encodeLocal(envelope)).state;
    expect(reloaded.settings.themeId).toBe("space");
    expect(reloaded.permanent.achievements.themeIdsTried).toEqual(THEME_IDS);
    expect(
      transition(reloaded, { type: "settings.update", patch: { themeId: "terminal" } }).events,
    ).not.toContainEqual({ type: "achievement.unlocked", achievementId: "tryAllThemes" });
  });

  it("keeps endless summer sunny on ten-second weather cycles", () => {
    const start = createInitialGameState({ pioneerName: "Summer", seed: 518 });
    const summer = transition(start, { type: "random-event.force", eventId: "endlessSummer" });
    expect(summer.accepted).toBe(true);
    expect(summer.state.run.space.currentSystemWeather).toBe("clear");
    expect(summer.state.run.timers[STAR_WEATHER_TIMER_ID]?.durationMs).toBe(10_000);
    const summerDuration = summer.state.run.randomEvents.activeEffects.find(
      (effect) => effect.id === "endlessSummer",
    )!.remainingMs;
    const nextCycle = advanceRandomEvents(summer.state, 1_000).state;
    expect(
      nextCycle.run.randomEvents.activeEffects.find((effect) => effect.id === "endlessSummer")
        ?.remainingMs,
    ).toBe(summerDuration - 1_000);
  });

  it("reshifts Black Hole instability after each elapsed minute and samples a new ticker interval", () => {
    const start = createInitialGameState({ pioneerName: "Instability", seed: 519 });
    const researched = {
      ...start,
      permanent: {
        ...start.permanent,
        blackHole: { ...start.permanent.blackHole, discovered: true, researched: true },
      },
    };
    const triggered = transition(researched, {
      type: "random-event.force",
      eventId: "blackHoleInstability",
    });
    expect(triggered.accepted).toBe(true);
    const before = triggered.state.run.random.draws;
    const shifted = advanceRandomEvents(triggered.state, 60_000);
    const effect = shifted.state.run.randomEvents.activeEffects.find(
      (active) => active.id === "blackHoleInstability",
    );
    expect(effect?.nextShiftInMs).toBe(60_000);
    expect(shifted.state.run.random.draws).toBe(before + 2);
    const ticker = transition(start, { type: "news.ticker.force", category: "headline" });
    expect(ticker.state.run.newsTicker.remainingMs).toBeGreaterThanOrEqual(20_000);
    expect(ticker.state.run.newsTicker.remainingMs).toBeLessThanOrEqual(35_000);
  });

  it("uses rebirth count and current-star titanium precipitation for their achievements", () => {
    const start = createInitialGameState({ pioneerName: "Long Run", seed: 515 });
    const atTenRuns = {
      ...start,
      permanent: { ...start.permanent, rebirthCount: 10 },
    };
    const conquered = transition(atTenRuns, { type: "onboarding.complete" });
    expect(conquered.state.permanent.achievements.unlockedIds).toContain("conquer10StarSystems");
    expect(conquered.state.permanent.ascendencyPoints).toBe(10);

    const collectingTitanium = {
      ...start,
      run: {
        ...start.run,
        space: {
          ...start.run.space,
          precipitationCollectedThisRun: 100,
          systemProfiles: start.run.space.systemProfiles.map((profile) => ({
            ...profile,
            precipitationGoodId: "titanium" as const,
          })),
        },
      },
    };
    const collected = transition(collectingTitanium, { type: "onboarding.complete" });
    expect(collected.accepted).toBe(true);
    expect(collected.state.permanent.achievements.unlockedIds).toContain(
      "collect100TitaniumAsPrecipitation",
    );
    expect(collected.state.permanent.ascendencyPoints).toBe(50);
  });
});
