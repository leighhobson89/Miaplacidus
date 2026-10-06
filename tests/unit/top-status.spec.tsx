import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LOCALE_IDS, systemIdForStar } from "../../src/content/ids";
import { MEGASTRUCTURE_TRACKS } from "../../src/content/technology";
import { AscendencyBalance, ResearchBalance, TopStatusBar } from "../../src/app/TopStatusBar";
import {
  selectResearchProductionBreakdown,
  selectTopStatusEvent,
} from "../../src/engine/selectors";
import { createInitialGameState, type GameState } from "../../src/engine/state";
import { createGameStore } from "../../src/engine/store";
import { topStatusText } from "../../src/i18n/topStatusMessages";
import { formatNumber } from "../../src/app/numberFormatting";
import { formatCountdown } from "../../src/app/timeFormatting";

function stateWithResearchProduction(gridRunning: boolean): GameState {
  const initial = createInitialGameState({ pioneerName: "Status", seed: 810 });
  const coreTrack = MEGASTRUCTURE_TRACKS.celestialProcessingCore;
  return {
    ...initial,
    run: {
      ...initial.run,
      upgrades: { ...initial.run.upgrades, scienceKit: 2, scienceClub: 1, scienceLab: 3 },
      economy: {
        ...initial.run.economy,
        buildingEnabled: {
          ...initial.run.economy.buildingEnabled,
          scienceKit: true,
          scienceClub: true,
          scienceLab: true,
        },
        power: { ...initial.run.economy.power, gridEnabled: gridRunning, tripped: false },
      },
    },
    permanent: {
      ...initial.permanent,
      megastructures: {
        ...initial.permanent.megastructures,
        ancientManuscripts: [
          {
            position: 1,
            manuscriptSystemId: systemIdForStar(810, 1),
            factorySystemId: initial.run.space.currentSystemId,
            megastructureId: "celestialProcessingCore",
            reported: true,
          },
        ],
        researchedTechnologyIds: [coreTrack[0]!, coreTrack[1]!, coreTrack[3]!],
      },
    },
  };
}

describe("top status selectors and balances", () => {
  it("selects the newest active event and otherwise falls back to the event history", () => {
    const initial = createInitialGameState({ pioneerName: "Events", seed: 811 });
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        randomEvents: {
          ...initial.run.randomEvents,
          history: [
            { id: "researchBreakthrough", simulationMs: 1_000, negative: false },
            { id: "stockLoss", simulationMs: 2_000, negative: true },
          ],
          activeEffects: [
            {
              id: "researchBreakthrough",
              remainingMs: 25_000,
              multiplier: 2,
              targetId: null,
              powerMultiplier: 1,
              durationMultiplier: 1,
              nextShiftInMs: 60_000,
            },
          ],
        },
      },
    };

    expect(selectTopStatusEvent(state)).toEqual({
      eventId: "researchBreakthrough",
      active: true,
      remainingMs: 25_000,
    });
    expect(
      selectTopStatusEvent({
        ...state,
        run: {
          ...state.run,
          randomEvents: { ...state.run.randomEvents, activeEffects: [] },
        },
      }),
    ).toEqual({ eventId: "stockLoss", active: false, remainingMs: null });
    expect(selectTopStatusEvent(initial)).toEqual({
      eventId: null,
      active: false,
      remainingMs: null,
    });
  });

  it("breaks research production into enabled buildings, powered labs, and remaining bonuses", () => {
    expect(selectResearchProductionBreakdown(stateWithResearchProduction(true))).toEqual({
      scienceKits: 1,
      scienceClubs: 8,
      poweredScienceLabs: 60,
      megastructureOtherBonus: 3,
      total: 72,
    });
    expect(selectResearchProductionBreakdown(stateWithResearchProduction(false))).toEqual({
      scienceKits: 1,
      scienceClubs: 8,
      poweredScienceLabs: 0,
      megastructureOtherBonus: 3,
      total: 12,
    });
  });

  it("shows AP, CP and GP at their respective progression gates and exports RP details", () => {
    const initial = createInitialGameState({ pioneerName: "Balances", seed: 812 });
    const hiddenMarkup = renderToStaticMarkup(<AscendencyBalance state={initial} locale="en" />);
    expect(hiddenMarkup).toContain('data-testid="ascendency-balance"');
    expect(hiddenMarkup).not.toContain('data-testid="cp-balance"');
    expect(hiddenMarkup).not.toContain('data-testid="gp-balance"');

    const revealed: GameState = {
      ...initial,
      permanent: {
        ...initial.permanent,
        rebirthCount: 1,
        galacticCasino: { ...initial.permanent.galacticCasino, casinoPoints: 7 },
        gloryPoints: 9,
        cosmicRip: { ...initial.permanent.cosmicRip, unlocked: true },
      },
      run: { ...initial.run, space: { ...initial.run.space, ascendencyAwardedThisRun: false } },
    };
    const balanceMarkup = renderToStaticMarkup(<AscendencyBalance state={revealed} locale="en" />);
    expect(balanceMarkup).toContain('data-testid="cp-balance"');
    expect(balanceMarkup).toContain("Ascendency Points: 0");
    expect(balanceMarkup).toContain("Casino Points: 7");
    expect(balanceMarkup).toContain('data-testid="gp-balance"');
    expect(balanceMarkup).toContain("Galactic Points: 9");

    const researchMarkup = renderToStaticMarkup(
      <ResearchBalance state={stateWithResearchProduction(true)} locale="en" />,
    );
    expect(researchMarkup).toContain('<strong data-testid="research-balance"');
    expect(researchMarkup).toContain("Research Points:");
    expect(researchMarkup).toContain("Science Kits: 1/s");
    expect(researchMarkup).toContain("Science Clubs: 8/s");
    expect(researchMarkup).toContain("Powered Science Labs: 60/s");
    expect(researchMarkup).toContain("Megastructure / other bonuses: 3/s");
  });

  it("renders an initial None event and localizes all new status copy in six locales", () => {
    const state = createInitialGameState({ pioneerName: "Status", seed: 813 });
    const store = createGameStore(state, { clock: { now: () => 0 } });
    const markup = renderToStaticMarkup(<TopStatusBar state={state} store={store} locale="en" />);
    expect(markup).toContain('data-testid="top-stat-event"');
    expect(markup).toContain('class="top-stat-label">Last Event / Ongoing Event</span>');
    expect(markup).toContain(">None<");

    const eventState: GameState = {
      ...state,
      run: {
        ...state.run,
        randomEvents: {
          ...state.run.randomEvents,
          history: [{ id: "researchBreakthrough", simulationMs: 1_000, negative: false }],
          activeEffects: [
            {
              id: "researchBreakthrough",
              remainingMs: 120_000,
              multiplier: 2,
              targetId: null,
              powerMultiplier: 1,
              durationMultiplier: 1,
              nextShiftInMs: 60_000,
            },
          ],
        },
      },
    };
    const activeStore = createGameStore(eventState, { clock: { now: () => 0 } });
    const activeMarkup = renderToStaticMarkup(
      <TopStatusBar state={eventState} store={activeStore} locale="en" />,
    );
    expect(activeMarkup).toContain('class="top-stat-label">Last Event / Ongoing Event</span>');
    expect(activeMarkup).toContain("Research breakthrough");
    expect(activeMarkup).toContain("(2m 0s)");
    expect(activeMarkup).toContain("Remaining: 2m 0s");

    const historicalState: GameState = {
      ...eventState,
      run: {
        ...eventState.run,
        randomEvents: { ...eventState.run.randomEvents, activeEffects: [] },
      },
    };
    const historicalStore = createGameStore(historicalState, { clock: { now: () => 0 } });
    const historicalMarkup = renderToStaticMarkup(
      <TopStatusBar state={historicalState} store={historicalStore} locale="en" />,
    );
    expect(historicalMarkup).toContain('class="top-stat-label">Last Event / Ongoing Event</span>');
    expect(historicalMarkup).toContain("Last recorded event");
    expect(topStatusText("es", "eventLastRecorded")).toBe("Último evento registrado");
    expect(topStatusText("fr", "eventStatusLabel")).toBe("Dernier événement / Événement en cours");

    for (const locale of LOCALE_IDS) {
      expect(topStatusText(locale, "eventStatusLabel")).not.toBe("");
      expect(topStatusText(locale, "eventNone")).not.toBe("");
      expect(topStatusText(locale, "eventRemaining", { time: "1m" })).not.toContain("{time}");
      expect(topStatusText(locale, "casinoPointsName")).not.toBe("");
      expect(topStatusText(locale, "ascendencyPointsName")).not.toBe("");
      expect(topStatusText(locale, "galacticPointsName")).not.toBe("");
      expect(topStatusText(locale, "researchPointsName")).not.toBe("");
      expect(topStatusText(locale, "researchScienceKits")).not.toBe("");
      expect(topStatusText(locale, "researchScienceClubs")).not.toBe("");
      expect(topStatusText(locale, "researchScienceLabs")).not.toBe("");
      expect(topStatusText(locale, "researchMegastructureOther")).not.toBe("");
      expect(topStatusText(locale, "timeWarpLabel")).not.toBe("");
      expect(
        topStatusText(locale, "timeWarpValue", { multiplier: "50", time: "15s" }),
      ).not.toContain("{");
      expect(
        topStatusText(locale, "timeWarpTooltip", { multiplier: "50", time: "15s" }),
      ).not.toContain("{");
    }
  });

  it("shows a localized global time-warp countdown only while the effect is active", () => {
    const initial = createInitialGameState({ pioneerName: "Warp Status", seed: 814 });
    const active: GameState = {
      ...initial,
      run: { ...initial.run, timeWarp: { multiplier: 50, remainingMs: 15_000 } },
    };

    for (const locale of LOCALE_IDS) {
      const localizedState = {
        ...active,
        settings: { ...active.settings, locale },
      };
      const store = createGameStore(localizedState, { clock: { now: () => 0 } });
      const markup = renderToStaticMarkup(
        <TopStatusBar state={localizedState} store={store} locale={locale} />,
      );
      const value = topStatusText(locale, "timeWarpValue", {
        multiplier: formatNumber(locale, 50, 0, localizedState.settings.notation),
        time: formatCountdown(locale, 15_000),
      });
      expect(markup).toContain('data-testid="top-stat-time-warp"');
      expect(markup).toContain(topStatusText(locale, "timeWarpLabel"));
      expect(markup).toContain(value);

      const inactiveState: GameState = {
        ...localizedState,
        run: { ...localizedState.run, timeWarp: { multiplier: 1, remainingMs: 0 } },
      };
      const inactiveStore = createGameStore(inactiveState, { clock: { now: () => 0 } });
      const inactiveMarkup = renderToStaticMarkup(
        <TopStatusBar state={inactiveState} store={inactiveStore} locale={locale} />,
      );
      expect(inactiveMarkup).not.toContain('data-testid="top-stat-time-warp"');
    }
  });
});
