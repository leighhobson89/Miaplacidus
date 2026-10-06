import { describe, expect, it } from "vitest";
import {
  COSMIC_RIP_CLOSURE_GP,
  COSMIC_RIP_SCANNER_REPAIR_GP,
  COSMIC_RIP_TECHNOLOGIES,
  COSMIC_RIP_UPGRADES,
} from "../../src/content/cosmicRip";
import { LOCALE_IDS } from "../../src/content/ids";
import { HOME_SYSTEM_NAME, createStarCatalogue } from "../../src/content/starCatalogue";
import { transition } from "../../src/engine/commands";
import { advanceCosmicRip, cosmicRipUpgradeCost } from "../../src/engine/cosmicRip";
import { selectEconomyAction } from "../../src/engine/selectors";
import { makeEnvelope, SAVE_SCHEMA_VERSION } from "../../src/persistence/schema";
import { decodeLocal, encodeLocal } from "../../src/persistence/codec";
import { cosmicRipText } from "../../src/i18n/cosmicRipMessages";
import {
  createInitialGameState,
  createInitialCosmicRipProgress,
  createInitialPermanentAchievementProgress,
  createInitialRunAchievementProgress,
  upgradeGameStateV25,
  upgradeGameStateV26,
  upgradeGameStateV27,
  upgradeGameStateV29,
  upgradeGameStateV30,
  type GameState,
} from "../../src/engine/state";

function unlockedState() {
  const base = createInitialGameState({ pioneerName: "Rip Test", seed: 251 });
  const homeId = createStarCatalogue().find((star) => star.name === HOME_SYSTEM_NAME)!.id;
  return {
    ...base,
    permanent: {
      ...base.permanent,
      gloryPoints: 40,
      settledSystemIds: [...base.permanent.settledSystemIds, homeId],
      cosmicRip: { ...createInitialCosmicRipProgress(), unlocked: true },
    },
  };
}

function readyToResearch() {
  const base = unlockedState();
  return {
    ...base,
    permanent: {
      ...base.permanent,
      cosmicRip: {
        ...base.permanent.cosmicRip,
        scannerRestored: true,
        ripLocationSectorIndex: 2,
        scannedSectorIndexes: [2],
        ripFound: true,
        telemetryData: 200_000,
      },
    },
  };
}

describe("Cosmic Rip", () => {
  it("provides localized Cosmic Rip copy and failure feedback in every shipped language", () => {
    for (const locale of LOCALE_IDS) {
      const messages = cosmicRipText(locale);
      const strings = Object.values(messages).flatMap((value) =>
        typeof value === "string" ? [value] : Object.values(value),
      );
      expect(
        strings.every((value) => typeof value === "string" && value.trim().length > 0),
        locale,
      ).toBe(true);
      expect(messages.hidden).toContain("{amount}");
      expect(messages.requires).toContain("{name}");
      expect(messages.remaining).toContain("{time}");
    }
  });

  it("unlocks after the Miaplacidus story is acknowledged and repairs the scanner for 10 GP", () => {
    const base = createInitialGameState({ pioneerName: "Rip Test", seed: 251 });
    const pending = {
      ...base,
      permanent: {
        ...base.permanent,
        gloryPoints: 10,
        megastructures: { ...base.permanent.megastructures, miaplacidusStoryPending: true },
      },
    };
    const acknowledged = transition(pending, { type: "meta.miaplacidus-story.acknowledge" });
    expect(acknowledged.accepted).toBe(true);
    expect(acknowledged.state.permanent.cosmicRip.unlocked).toBe(true);
    expect(acknowledged.state.permanent.gloryPoints).toBe(10);
    const wrongHome = transition(acknowledged.state, { type: "cosmic-rip.scanner.restore" });
    expect(wrongHome.accepted).toBe(false);
    expect(wrongHome.failure?.code).toBe("cosmic-rip-home-required");
    const homeId = createStarCatalogue().find((star) => star.name === HOME_SYSTEM_NAME)!.id;
    const settled = {
      ...acknowledged.state,
      permanent: {
        ...acknowledged.state.permanent,
        settledSystemIds: [...acknowledged.state.permanent.settledSystemIds, homeId],
      },
    };
    const restored = transition(settled, { type: "cosmic-rip.scanner.restore" });
    expect(restored.accepted).toBe(true);
    expect(restored.state.permanent.gloryPoints).toBe(0);
    expect(restored.state.permanent.cosmicRip.scannerRestored).toBe(true);
    expect(restored.state.permanent.cosmicRip.ripLocationSectorIndex).toBeGreaterThanOrEqual(0);
    expect(restored.state.permanent.cosmicRip.ripLocationSectorIndex).toBeLessThan(9);
  });

  it("charges one GP per unique sector and finds the once-seeded rip", () => {
    let state = unlockedState();
    const restored = transition(state, { type: "cosmic-rip.scanner.restore" });
    expect(restored.accepted).toBe(true);
    state = restored.state;
    const location = state.permanent.cosmicRip.ripLocationSectorIndex!;
    for (let sectorIndex = 0; sectorIndex <= location; sectorIndex += 1) {
      const result = transition(state, { type: "cosmic-rip.sector.scan", sectorIndex });
      expect(result.accepted).toBe(true);
      state = result.state;
    }
    expect(state.permanent.cosmicRip.ripFound).toBe(true);
    expect(state.permanent.cosmicRip.scannedSectorIndexes).toContain(location);
    const duplicate = transition(state, { type: "cosmic-rip.sector.scan", sectorIndex: location });
    expect(duplicate.accepted).toBe(false);
    expect(duplicate.state.permanent.gloryPoints).toBe(state.permanent.gloryPoints);
  });

  it("reports engine-backed failure reasons for each disabled Cosmic Rip action", () => {
    expect(COSMIC_RIP_SCANNER_REPAIR_GP).toBe(10);
    expect(COSMIC_RIP_CLOSURE_GP).toBe(1);

    const scannerState = unlockedState();
    const restoreFailure = selectEconomyAction(
      {
        ...scannerState,
        permanent: { ...scannerState.permanent, gloryPoints: 9 },
      },
      { type: "cosmic-rip.scanner.restore" },
    );
    expect(restoreFailure).toMatchObject({
      enabled: false,
      failure: { code: "cosmic-rip-insufficient-gp" },
    });

    expect(
      selectEconomyAction(scannerState, { type: "cosmic-rip.sector.scan", sectorIndex: 0 }),
    ).toMatchObject({ enabled: false, failure: { code: "cosmic-rip-scanner-required" } });

    const route = readyToResearch();
    const noGpRoute = {
      ...route,
      run: {
        ...route.run,
        cash: 0,
        goods: Object.fromEntries(
          Object.entries(route.run.goods).map(([id, good]) => [id, { ...good, quantity: 0 }]),
        ) as GameState["run"]["goods"],
      },
      permanent: { ...route.permanent, gloryPoints: 0 },
    };
    expect(
      selectEconomyAction(noGpRoute, { type: "cosmic-rip.sector.scan", sectorIndex: 0 }),
    ).toMatchObject({ enabled: false, failure: { code: "cosmic-rip-insufficient-gp" } });
    expect(
      selectEconomyAction(noGpRoute, { type: "cosmic-rip.sector.scan", sectorIndex: 2 }),
    ).toMatchObject({ enabled: false, failure: { code: "cosmic-rip-sector-scanned" } });
    expect(
      selectEconomyAction(noGpRoute, {
        type: "cosmic-rip.upgrade.purchase",
        upgradeId: "sensorBuoy",
      }),
    ).toMatchObject({ enabled: false, failure: { code: "cosmic-rip-insufficient-cost" } });

    const firstTechnology = COSMIC_RIP_TECHNOLOGIES[0];
    expect(
      selectEconomyAction(
        {
          ...route,
          permanent: {
            ...route.permanent,
            gloryPoints: 0,
            cosmicRip: { ...route.permanent.cosmicRip, telemetryData: 0 },
          },
        },
        { type: "cosmic-rip.tech.start", technologyId: firstTechnology.id },
      ),
    ).toMatchObject({ enabled: false, failure: { code: "cosmic-rip-tech-hidden" } });
    expect(
      selectEconomyAction(noGpRoute, {
        type: "cosmic-rip.tech.start",
        technologyId: firstTechnology.id,
      }),
    ).toMatchObject({ enabled: false, failure: { code: "cosmic-rip-insufficient-gp" } });
    expect(
      selectEconomyAction(noGpRoute, {
        type: "cosmic-rip.tech.start",
        technologyId: COSMIC_RIP_TECHNOLOGIES[1].id,
      }),
    ).toMatchObject({ enabled: false, failure: { code: "cosmic-rip-tech-locked" } });

    const complete = {
      ...noGpRoute,
      permanent: {
        ...noGpRoute.permanent,
        cosmicRip: {
          ...noGpRoute.permanent.cosmicRip,
          researchedTechnologyIds: COSMIC_RIP_TECHNOLOGIES.map((technology) => technology.id),
        },
      },
    };
    expect(selectEconomyAction(route, { type: "cosmic-rip.close" })).toMatchObject({
      enabled: false,
      failure: { code: "cosmic-rip-close-incomplete" },
    });
    expect(selectEconomyAction(complete, { type: "cosmic-rip.close" })).toMatchObject({
      enabled: false,
      failure: { code: "cosmic-rip-insufficient-gp" },
    });
  });

  it("keeps scanner and sector rewards guarded after reload, while telemetry follows warp and offline time", () => {
    const state = readyToResearch();
    const envelope = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000027",
      pioneerName: state.run.pioneerName,
      createdAt: 0,
      savedAt: 1,
      revision: 1,
      state,
    });
    const reloaded = decodeLocal(encodeLocal(envelope)).state;
    expect(transition(reloaded, { type: "cosmic-rip.scanner.restore" }).accepted).toBe(false);
    expect(transition(reloaded, { type: "cosmic-rip.sector.scan", sectorIndex: 2 }).accepted).toBe(
      false,
    );

    const telemetryState: GameState = {
      ...reloaded,
      run: {
        ...reloaded.run,
        clock: { ...reloaded.run.clock, wallNowMs: 0 },
        timeWarp: { multiplier: 10, remainingMs: 10_000 },
      },
      permanent: {
        ...reloaded.permanent,
        cosmicRip: { ...reloaded.permanent.cosmicRip, sensorBuoyCount: 1 },
      },
    };
    const beforeTelemetry = telemetryState.permanent.cosmicRip.telemetryData;
    const warped = transition(telemetryState, {
      type: "clock.advance",
      input: { wallNowMs: 1_000, foreground: true },
    });
    expect(warped.state.permanent.cosmicRip.telemetryData).toBe(beforeTelemetry + 0.4);
    const hidden = transition(warped.state, {
      type: "clock.advance",
      input: { wallNowMs: 3_000, foreground: false },
    });
    const returned = transition(hidden.state, {
      type: "clock.advance",
      input: { wallNowMs: 3_000, foreground: true },
    });
    expect(returned.state.permanent.cosmicRip.telemetryData).toBeCloseTo(
      beforeTelemetry + 0.4 + 0.02672,
      8,
    );

    const rebirthReady = {
      ...returned.state,
      run: {
        ...returned.state.run,
        space: { ...returned.state.run.space, ascendencyAwardedThisRun: true },
      },
    };
    const reborn = transition(rebirthReady, { type: "meta.rebirth" });
    expect(reborn.accepted).toBe(true);
    expect(reborn.state.permanent.cosmicRip).toMatchObject({
      scannerRestored: true,
      ripLocationSectorIndex: 2,
      scannedSectorIndexes: [2],
      telemetryData: returned.state.permanent.cosmicRip.telemetryData,
      sensorBuoyCount: 1,
    });
  });

  it("scales telemetry upgrade prices by 1.13 and adds source production rates", () => {
    let state = readyToResearch();
    const first = cosmicRipUpgradeCost(state, "sensorBuoy");
    expect(first).toEqual({ cash: 500_000, goods: { titanium: 100_000, silicon: 600_000 } });
    const goods = {
      ...state.run.goods,
      titanium: { ...state.run.goods.titanium, quantity: 400_000, storageCapacity: 400_000 },
      silicon: { ...state.run.goods.silicon, quantity: 2_000_000, storageCapacity: 2_000_000 },
    };
    state = { ...state, run: { ...state.run, cash: 2_000_000, goods } };
    const purchased = transition(state, {
      type: "cosmic-rip.upgrade.purchase",
      upgradeId: "sensorBuoy",
    });
    expect(purchased.accepted).toBe(true);
    state = purchased.state;
    expect(state.permanent.cosmicRip.sensorBuoyCount).toBe(1);
    expect(state.run.cash).toBe(1_500_000);
    expect(state.run.goods.titanium.quantity).toBe(300_000);
    expect(cosmicRipUpgradeCost(state, "sensorBuoy")).toEqual({
      cash: 565_000,
      goods: { titanium: 113_000, silicon: 678_000 },
    });
    expect(advanceCosmicRip(state, 25_000).state.permanent.cosmicRip.telemetryData).toBe(200_001);
    expect(COSMIC_RIP_UPGRADES.sensorBuoy.telemetryPerSecond).toBe(0.04);
    expect(COSMIC_RIP_UPGRADES.ripResearchOrbiter.telemetryPerSecond).toBe(0.07);
  });

  it("reveals, charges, times and completes the five ordered research stages", () => {
    let state = readyToResearch();
    const first = COSMIC_RIP_TECHNOLOGIES[0];
    const started = transition(state, {
      type: "cosmic-rip.tech.start",
      technologyId: first.id,
    });
    expect(started.accepted).toBe(true);
    expect(started.state.permanent.gloryPoints).toBe(39);
    expect(started.state.permanent.cosmicRip.telemetryData).toBe(190_000);
    state = started.state;
    const halfway = advanceCosmicRip(state, 30_000);
    expect(halfway.state.permanent.cosmicRip.activeResearchTechnologyId).toBe(first.id);
    expect(halfway.state.permanent.cosmicRip.researchElapsedMs).toBe(30_000);
    const finished = advanceCosmicRip(halfway.state, 30_000);
    expect(finished.state.permanent.cosmicRip.activeResearchTechnologyId).toBeNull();
    expect(finished.state.permanent.cosmicRip.researchedTechnologyIds).toEqual([first.id]);
    expect(finished.events).toEqual([
      { type: "cosmic-rip.technology-researched", technologyId: first.id },
    ]);
    const locked = transition(finished.state, {
      type: "cosmic-rip.tech.start",
      technologyId: COSMIC_RIP_TECHNOLOGIES[2].id,
    });
    expect(locked.accepted).toBe(false);
    expect(locked.failure?.code).toBe("cosmic-rip-tech-locked");
  });

  it("closes only after all five technologies and spends the closure GP once", () => {
    const base = readyToResearch();
    const complete = {
      ...base,
      permanent: {
        ...base.permanent,
        cosmicRip: {
          ...base.permanent.cosmicRip,
          researchedTechnologyIds: COSMIC_RIP_TECHNOLOGIES.map((technology) => technology.id),
        },
      },
    };
    const closed = transition(complete, { type: "cosmic-rip.close" });
    expect(closed.accepted).toBe(true);
    expect(closed.state.permanent.cosmicRip.closed).toBe(true);
    expect(closed.state.permanent.gloryPoints).toBe(39);
    const repeated = transition(closed.state, { type: "cosmic-rip.close" });
    expect(repeated.accepted).toBe(false);
    expect(repeated.state.permanent.gloryPoints).toBe(39);
  });

  it("counts each accepted Cosmic Rip GP spend once and preserves the total through save and rebirth", () => {
    let state = unlockedState();
    expect(state.statistics.lifetimeGalacticPointsSpent).toBe(0);

    const insufficientRestore = transition(
      {
        ...state,
        permanent: { ...state.permanent, gloryPoints: COSMIC_RIP_SCANNER_REPAIR_GP - 1 },
      },
      { type: "cosmic-rip.scanner.restore" },
    );
    expect(insufficientRestore.accepted).toBe(false);
    expect(insufficientRestore.state.statistics.lifetimeGalacticPointsSpent).toBe(0);

    const restored = transition(state, { type: "cosmic-rip.scanner.restore" });
    expect(restored.accepted).toBe(true);
    expect(restored.state.statistics.lifetimeGalacticPointsSpent).toBe(10);
    state = {
      ...restored.state,
      permanent: {
        ...restored.state.permanent,
        cosmicRip: { ...restored.state.permanent.cosmicRip, ripLocationSectorIndex: 0 },
      },
    };

    const repeatedRestore = transition(state, { type: "cosmic-rip.scanner.restore" });
    expect(repeatedRestore.accepted).toBe(false);
    expect(repeatedRestore.failure?.code).toBe("cosmic-rip-scanner-restored");
    expect(repeatedRestore.state.statistics.lifetimeGalacticPointsSpent).toBe(10);

    const scanned = transition(state, { type: "cosmic-rip.sector.scan", sectorIndex: 0 });
    expect(scanned.accepted).toBe(true);
    expect(scanned.state.permanent.cosmicRip.ripFound).toBe(true);
    expect(scanned.state.statistics.lifetimeGalacticPointsSpent).toBe(11);
    const duplicateScan = transition(scanned.state, {
      type: "cosmic-rip.sector.scan",
      sectorIndex: 0,
    });
    expect(duplicateScan.accepted).toBe(false);
    expect(duplicateScan.failure?.code).toBe("cosmic-rip-sector-scanned");
    expect(duplicateScan.state.statistics.lifetimeGalacticPointsSpent).toBe(11);

    const readyForResearch: GameState = {
      ...scanned.state,
      permanent: {
        ...scanned.state.permanent,
        cosmicRip: { ...scanned.state.permanent.cosmicRip, telemetryData: 200_000 },
      },
    };
    const firstTechnology = COSMIC_RIP_TECHNOLOGIES[0]!;
    const researchStarted = transition(readyForResearch, {
      type: "cosmic-rip.tech.start",
      technologyId: firstTechnology.id,
    });
    expect(researchStarted.accepted).toBe(true);
    expect(researchStarted.state.statistics.lifetimeGalacticPointsSpent).toBe(12);
    const repeatedResearchStart = transition(researchStarted.state, {
      type: "cosmic-rip.tech.start",
      technologyId: firstTechnology.id,
    });
    expect(repeatedResearchStart.accepted).toBe(false);
    expect(repeatedResearchStart.failure?.code).toBe("cosmic-rip-research-running");
    expect(repeatedResearchStart.state.statistics.lifetimeGalacticPointsSpent).toBe(12);

    const completeRip: GameState = {
      ...researchStarted.state,
      permanent: {
        ...researchStarted.state.permanent,
        cosmicRip: {
          ...researchStarted.state.permanent.cosmicRip,
          activeResearchTechnologyId: null,
          researchElapsedMs: 0,
          researchedTechnologyIds: COSMIC_RIP_TECHNOLOGIES.map((technology) => technology.id),
        },
      },
    };
    const closed = transition(completeRip, { type: "cosmic-rip.close" });
    expect(closed.accepted).toBe(true);
    expect(closed.state.permanent.gloryPoints).toBe(27);
    expect(closed.state.statistics.lifetimeGalacticPointsSpent).toBe(13);
    const repeatedClose = transition(closed.state, { type: "cosmic-rip.close" });
    expect(repeatedClose.accepted).toBe(false);
    expect(repeatedClose.failure?.code).toBe("cosmic-rip-already-closed");
    expect(repeatedClose.state.statistics.lifetimeGalacticPointsSpent).toBe(13);

    const envelope = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000029",
      pioneerName: closed.state.run.pioneerName,
      createdAt: 0,
      savedAt: 1,
      revision: 1,
      state: closed.state,
    });
    const reloaded = decodeLocal(encodeLocal(envelope)).state;
    expect(reloaded.statistics.lifetimeGalacticPointsSpent).toBe(13);
    const rebirthReady: GameState = {
      ...reloaded,
      run: {
        ...reloaded.run,
        space: { ...reloaded.run.space, ascendencyAwardedThisRun: true },
      },
    };
    const reborn = transition(rebirthReady, { type: "meta.rebirth" });
    expect(reborn.accepted).toBe(true);
    expect(reborn.state.statistics.lifetimeGalacticPointsSpent).toBe(13);
  });

  it("credits rounded fractional telemetry gain but not telemetry spent on research", () => {
    const initialTelemetry = 10_000.123456786;
    const base = readyToResearch();
    const prepared: GameState = {
      ...base,
      permanent: {
        ...base.permanent,
        cosmicRip: {
          ...base.permanent.cosmicRip,
          sensorBuoyCount: 1,
          telemetryData: initialTelemetry,
        },
      },
    };
    const firstRoundedTelemetry = Number((initialTelemetry + 0.04).toFixed(8));
    const first = advanceCosmicRip(prepared, 1_000);
    expect(first.state.permanent.cosmicRip.telemetryData).toBe(firstRoundedTelemetry);
    expect(first.state.statistics.lifetimeCosmicRipTelemetryDataEarned).toBeCloseTo(
      firstRoundedTelemetry - initialTelemetry,
      8,
    );

    const secondRoundedTelemetry = Number((firstRoundedTelemetry + 1).toFixed(8));
    const second = advanceCosmicRip(first.state, 25_000);
    const totalCredited = secondRoundedTelemetry - initialTelemetry;
    expect(second.state.permanent.cosmicRip.telemetryData).toBe(secondRoundedTelemetry);
    expect(second.state.statistics.lifetimeCosmicRipTelemetryDataEarned).toBeCloseTo(
      totalCredited,
      8,
    );

    const started = transition(second.state, {
      type: "cosmic-rip.tech.start",
      technologyId: COSMIC_RIP_TECHNOLOGIES[0]!.id,
    });
    expect(started.accepted).toBe(true);
    expect(started.state.permanent.cosmicRip.telemetryData).toBe(
      secondRoundedTelemetry - COSMIC_RIP_TECHNOLOGIES[0]!.telemetryCost,
    );
    expect(started.state.statistics.lifetimeCosmicRipTelemetryDataEarned).toBeCloseTo(
      totalCredited,
      8,
    );

    const roundedWithoutProduction: GameState = {
      ...started.state,
      statistics: {
        ...started.state.statistics,
        lifetimeCosmicRipTelemetryDataEarned: 7.25,
      },
      permanent: {
        ...started.state.permanent,
        cosmicRip: {
          ...started.state.permanent.cosmicRip,
          activeResearchTechnologyId: null,
          telemetryData: 150_000.000000004,
          sensorBuoyCount: 0,
          ripResearchOrbiterCount: 0,
        },
      },
    };
    const normalized = advanceCosmicRip(roundedWithoutProduction, 1);
    expect(normalized.state.permanent.cosmicRip.telemetryData).toBe(150_000);
    expect(normalized.state.statistics.lifetimeCosmicRipTelemetryDataEarned).toBe(7.25);

    const envelope = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000030",
      pioneerName: started.state.run.pioneerName,
      createdAt: 0,
      savedAt: 1,
      revision: 1,
      state: started.state,
    });
    const reloaded = decodeLocal(encodeLocal(envelope)).state;
    expect(reloaded.statistics.lifetimeCosmicRipTelemetryDataEarned).toBeCloseTo(totalCredited, 8);
    const rebirthReady: GameState = {
      ...reloaded,
      run: {
        ...reloaded.run,
        space: { ...reloaded.run.space, ascendencyAwardedThisRun: true },
      },
    };
    const reborn = transition(rebirthReady, { type: "meta.rebirth" });
    expect(reborn.accepted).toBe(true);
    expect(reborn.state.statistics.lifetimeCosmicRipTelemetryDataEarned).toBeCloseTo(
      totalCredited,
      8,
    );
  });

  it("preserves an interrupted research timer in saves and across rebirth", () => {
    const started = transition(readyToResearch(), {
      type: "cosmic-rip.tech.start",
      technologyId: COSMIC_RIP_TECHNOLOGIES[0].id,
    });
    const halfway = advanceCosmicRip(started.state, 30_000).state;
    const envelope = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000026",
      pioneerName: halfway.run.pioneerName,
      createdAt: 0,
      savedAt: 1,
      revision: 1,
      state: halfway,
    });
    const reloaded = decodeLocal(encodeLocal(envelope)).state;
    expect(reloaded.permanent.cosmicRip.activeResearchTechnologyId).toBe("stabilizerArray");
    expect(reloaded.permanent.cosmicRip.researchElapsedMs).toBe(30_000);

    const rebirthReady = {
      ...reloaded,
      run: {
        ...reloaded.run,
        space: { ...reloaded.run.space, ascendencyAwardedThisRun: true },
      },
    };
    const reborn = transition(rebirthReady, { type: "meta.rebirth" });
    expect(reborn.accepted).toBe(true);
    expect(reborn.state.permanent.cosmicRip.activeResearchTechnologyId).toBe("stabilizerArray");
    expect(reborn.state.permanent.cosmicRip.researchElapsedMs).toBe(30_000);
    expect(
      advanceCosmicRip(reborn.state, 30_000).state.permanent.cosmicRip.researchedTechnologyIds,
    ).toContain("stabilizerArray");
  });

  it("upgrades valid version 25 states with empty rip and achievement progress", () => {
    const current = createInitialGameState({ pioneerName: "Migration", seed: 26 });
    const {
      cosmicRip: _cosmicRip,
      achievements: _achievements,
      ...oldPermanent
    } = current.permanent;
    const { achievements: _runAchievements, ...oldRun } = current.run;
    const old = { ...current, schemaVersion: 25 as const, run: oldRun, permanent: oldPermanent };
    const migrated = upgradeGameStateV25(old);
    expect(migrated?.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated?.permanent.cosmicRip).toEqual(createInitialCosmicRipProgress());
    expect(migrated?.permanent.achievements).toEqual(createInitialPermanentAchievementProgress());
    expect(migrated?.run.achievements).toEqual(createInitialRunAchievementProgress());
  });

  it("upgrades valid version 26 Cosmic Rip saves with empty achievement progress", () => {
    const current = createInitialGameState({ pioneerName: "Migration", seed: 27 });
    const { achievements: _runAchievements, ...oldRun } = current.run;
    const { achievements: _achievements, ...oldPermanent } = current.permanent;
    const old = { ...current, schemaVersion: 26 as const, run: oldRun, permanent: oldPermanent };
    const migrated = upgradeGameStateV26(old);
    expect(migrated?.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated?.permanent.cosmicRip).toEqual(current.permanent.cosmicRip);
    expect(migrated?.permanent.achievements).toEqual(createInitialPermanentAchievementProgress());
    expect(migrated?.run.achievements).toEqual(createInitialRunAchievementProgress());
  });

  it("upgrades valid version 27 achievement saves with initial event and news state", () => {
    const current = createInitialGameState({ pioneerName: "Migration", seed: 28 });
    const { randomEvents: _randomEvents, newsTicker: _newsTicker, ...oldRun } = current.run;
    const old = { ...current, schemaVersion: 27 as const, run: oldRun };
    const migrated = upgradeGameStateV27(old);
    expect(migrated?.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated?.run.randomEvents.history).toEqual([]);
    expect(migrated?.run.newsTicker.seenIds).toEqual([]);
  });

  it("upgrades version 29 saves with no accumulated foreground-time statistic", () => {
    const current = createInitialGameState({ pioneerName: "Migration", seed: 29 });
    const { lifetimeActiveMs: _active, ...oldStatistics } = current.statistics;
    const old = { ...current, schemaVersion: 29 as const, statistics: oldStatistics };
    const migrated = upgradeGameStateV29(old);
    expect(migrated?.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated?.statistics.lifetimeActiveMs).toBe(0);
  });

  it("upgrades version 30 theme and active-event state into the current save shape", () => {
    const current = createInitialGameState({ pioneerName: "Migration", seed: 30 });
    const old = {
      ...current,
      schemaVersion: 30 as const,
      settings: { ...current.settings, themeId: "midnight" },
      permanent: {
        ...current.permanent,
        achievements: { unlockedIds: [], bonuses: current.permanent.achievements.bonuses },
      },
      run: {
        ...current.run,
        randomEvents: {
          ...current.run.randomEvents,
          activeEffects: [
            {
              id: "blackHoleInstability" as const,
              remainingMs: 300_000,
              multiplier: 1,
              targetId: null,
              powerMultiplier: 1,
              durationMultiplier: 1,
            },
          ],
        },
      },
    };
    const migrated = upgradeGameStateV30(old);
    expect(migrated?.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated?.settings.themeId).toBe("terminal");
    expect(migrated?.permanent.achievements.themeIdsTried).toEqual(["terminal"]);
    expect(migrated?.run.randomEvents.activeEffects[0]?.nextShiftInMs).toBe(60_000);
  });
});
