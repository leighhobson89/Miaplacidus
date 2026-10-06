import { describe, expect, it } from "vitest";
import { COMPOUND_IDS, ECONOMIC_GOOD_IDS } from "../../src/content/ids";
import { LOCALE_IDS } from "../../src/content/ids";
import { STARSHIP_MODULES } from "../../src/content/space";
import { MEGASTRUCTURE_TECHNOLOGY_IDS, MEGASTRUCTURE_TRACKS } from "../../src/content/technology";
import { createStarCatalogue } from "../../src/content/starCatalogue";
import { transition } from "../../src/engine/commands";
import { createEconomyTickPlan } from "../../src/engine/economySimulation";
import {
  applyMegastructureTechnology,
  hasMegastructureTechnology,
  megastructureAntimatterRatePerSecond,
  megastructureResearchAvailable,
  megastructurePowerPlantMultiplier,
  megastructureResourceRateMultiplier,
  megastructureResearchRateBonus,
  miaplacidusForceFieldLevel,
  restoreMegastructureProgressOnRebirth,
} from "../../src/engine/megastructures";
import { createStarMapModel } from "../../src/engine/starMap";
import { createInitialGameState, isValidGameState, type GameState } from "../../src/engine/state";
import { generateStarSystemEncounter } from "../../src/engine/starSystemEncounters";
import { ensureDiscoveredStarSystemProfiles } from "../../src/engine/starSystemProfiles";
import { createTimerId } from "../../src/engine/timers";
import { megastructureText } from "../../src/i18n/megastructureMessages";

const catalogue = createStarCatalogue();
const awaySystemId = catalogue.find((star) => star.name === "Spica")!.id;
const manuscriptSite = catalogue.find((star) => star.name === "Sirius")!;
const factoryStar = catalogue.find((star) => star.name === "Canopus")!;

function factoryState(
  options: {
    readonly megastructureId?:
      | "dysonSphere"
      | "celestialProcessingCore"
      | "plasmaForge"
      | "galacticMemoryArchive";
    readonly researched?: readonly string[];
    readonly reported?: boolean;
    readonly settled?: boolean;
    readonly researchPoints?: number;
  } = {},
): GameState {
  const initial = createInitialGameState({ seed: 411 });
  const reported = options.reported ?? true;
  const settled = options.settled ?? true;
  return {
    ...initial,
    run: {
      ...initial.run,
      researchPoints: options.researchPoints ?? 50_000,
      space: {
        ...initial.run.space,
        currentSystemId: factoryStar.id,
        weatherSystemId: factoryStar.id,
        starStudyRange: 200,
        systemProfiles: ensureDiscoveredStarSystemProfiles(
          initial.run.space.systemProfiles,
          factoryStar.id,
          200,
        ),
      },
      economy: {
        ...initial.run.economy,
        researchedTechnologies: [
          "advancedPowerGeneration",
          ...(options.researched ?? []),
        ] as GameState["run"]["economy"]["researchedTechnologies"],
        revealedTechnologies: [
          ...initial.run.economy.revealedTechnologies,
          "advancedPowerGeneration",
          ...MEGASTRUCTURE_TECHNOLOGY_IDS,
        ],
        power: { ...initial.run.economy.power, quantity: 80, capacity: 100 },
      },
    },
    permanent: {
      ...initial.permanent,
      settledSystemIds: settled
        ? [...initial.permanent.settledSystemIds, factoryStar.id]
        : initial.permanent.settledSystemIds,
      megastructures: {
        ...initial.permanent.megastructures,
        ancientManuscripts: [
          {
            position: 1,
            manuscriptSystemId: manuscriptSite.id,
            factorySystemId: factoryStar.id,
            megastructureId: options.megastructureId ?? "dysonSphere",
            reported,
          },
        ],
        researchedTechnologyIds: (options.researched ??
          []) as GameState["permanent"]["megastructures"]["researchedTechnologyIds"],
      },
    },
  };
}

describe("megastructure progression", () => {
  it("keeps four ordered five-stage tracks with the source research costs", () => {
    expect(MEGASTRUCTURE_TECHNOLOGY_IDS).toHaveLength(20);
    for (const track of Object.values(MEGASTRUCTURE_TRACKS)) {
      expect(track).toHaveLength(5);
      expect(track.map((id) => ({ id, price: awaitlessTechnologyPrice(id) }))).toEqual([
        { id: track[0], price: 50_000 },
        { id: track[1], price: 100_000 },
        { id: track[2], price: 150_000 },
        { id: track[3], price: 200_000 },
        { id: track[4], price: 250_000 },
      ]);
    }
  });

  it("requires a reported manuscript, its settled factory, and the correct star", () => {
    const ready = factoryState();
    const stageOne = MEGASTRUCTURE_TRACKS.dysonSphere[0]!;
    expect(megastructureResearchAvailable(ready, stageOne)).toBe(true);
    expect(megastructureResearchAvailable(factoryState({ reported: false }), stageOne)).toBe(false);
    expect(megastructureResearchAvailable(factoryState({ settled: false }), stageOne)).toBe(false);

    const wrongStructure = factoryState({ megastructureId: "plasmaForge" });
    expect(megastructureResearchAvailable(wrongStructure, stageOne)).toBe(false);
    expect(isValidGameState(ready)).toBe(true);
  });

  it("charges exact research points once and applies the Dyson battery effect", () => {
    const state = factoryState();
    const technologyId = MEGASTRUCTURE_TRACKS.dysonSphere[0]!;
    const insufficient = transition(
      { ...state, run: { ...state.run, researchPoints: 49_999 } },
      { type: "economy.research", technologyId },
    );
    expect(insufficient.accepted).toBe(false);

    const researched = transition(state, { type: "economy.research", technologyId });
    expect(researched.accepted).toBe(true);
    expect(researched.state.run.researchPoints).toBe(0);
    expect(researched.state.permanent.megastructures.researchedTechnologyIds).toEqual([
      technologyId,
    ]);
    expect(researched.state.run.economy.power).toMatchObject({ quantity: 80, capacity: 200 });
    expect(researched.state.run.timers).toEqual(state.run.timers);
    expect(transition(researched.state, { type: "economy.research", technologyId }).accepted).toBe(
      false,
    );
  });

  it("opens the Miaplacidus route and pays the source achievement reward once", () => {
    const disconnects = Object.values(MEGASTRUCTURE_TRACKS).map((track) => track[2]!);
    const archive = MEGASTRUCTURE_TRACKS.galacticMemoryArchive;
    const prerequisites = [
      archive[0]!,
      archive[1]!,
      ...disconnects.filter((technologyId) => technologyId !== archive[2]),
    ];
    const state = factoryState({
      megastructureId: "galacticMemoryArchive",
      researchPoints: 150_000,
      researched: prerequisites,
    });
    const home = catalogue.find((star) => star.name === "Miaplacidus")!;
    const closedGate = createStarMapModel(catalogue, "spica", 0, 0).find(
      (star) => star.id === home.id,
    );
    expect(closedGate?.selectable).toBe(false);
    const breached = transition(state, {
      type: "economy.research",
      technologyId: archive[2]!,
    });
    expect(breached.accepted).toBe(true);
    expect(breached.events).toContainEqual({ type: "megastructure.force-field-breached" });
    expect(breached.state.permanent.achievements.unlockedIds).toContain(
      "bringDownMiaplacideanForceField",
    );

    expect(miaplacidusForceFieldLevel(breached.state)).toBe(4);
    expect(breached.state.permanent.ascendencyPoints).toBe(100);
    expect(breached.state.permanent.megastructures.forceFieldRewardClaimed).toBe(true);
    expect(megastructureAntimatterRatePerSecond(breached.state)).toBe(0.6);
    expect(
      createStarMapModel(catalogue, "spica", 0, 4).find((star) => star.id === home.id)?.selectable,
    ).toBe(true);
    expect(
      transition(breached.state, { type: "economy.research", technologyId: archive[2]! }).state
        .permanent.ascendencyPoints,
    ).toBe(100);
    expect(
      applyMegastructureTechnology(breached.state, archive[2]!).permanent.ascendencyPoints,
    ).toBe(100);
  });

  it("restores permanent stage effects to a fresh run without duplicating capacity", () => {
    const archive = MEGASTRUCTURE_TRACKS.galacticMemoryArchive;
    const dyson = MEGASTRUCTURE_TRACKS.dysonSphere;
    const progressed = factoryState({
      researched: [archive[0]!, archive[1]!, archive[3]!, archive[4]!, dyson[3]!],
    });
    const durable: GameState = {
      ...progressed,
      permanent: {
        ...progressed.permanent,
        megastructures: {
          ...progressed.permanent.megastructures,
          researchedTechnologyIds: [archive[0]!, archive[1]!, archive[3]!, archive[4]!, dyson[3]!],
        },
      },
    };
    const restored = restoreMegastructureProgressOnRebirth(durable);
    const expectedCapacity =
      createInitialGameState().run.goods.hydrogen.storageCapacity +
      100_000 +
      1_000_000 +
      1_000_000_000 +
      10_000_000_000;
    expect(restored.run.goods.hydrogen.storageCapacity).toBe(expectedCapacity);
    expect(restored.run.economy.power).toMatchObject({ infinitePower: true, gridEnabled: true });
    expect(restored.run.economy.researchedTechnologies).toEqual(
      expect.arrayContaining([archive[0], archive[1], archive[3], archive[4], dyson[3]]),
    );
    expect(hasMegastructureTechnology(restored, archive[4]!)).toBe(true);
  });

  it("applies the power, research, and production track modifiers at their source scopes", () => {
    const dyson = MEGASTRUCTURE_TRACKS.dysonSphere;
    const core = MEGASTRUCTURE_TRACKS.celestialProcessingCore;
    const forge = MEGASTRUCTURE_TRACKS.plasmaForge;
    const dysonStageTwo = factoryState({ researched: [dyson[1]!] });
    expect(megastructurePowerPlantMultiplier(dysonStageTwo)).toBe(1.25);

    const localCore = factoryState({
      megastructureId: "celestialProcessingCore",
      researched: [core[0]!, core[1]!, core[3]!],
    });
    const awayCore: GameState = {
      ...localCore,
      run: { ...localCore.run, space: { ...localCore.run.space, currentSystemId: awaySystemId } },
    };
    expect(megastructureResearchRateBonus(localCore)).toBe(3);
    expect(megastructureResearchRateBonus(awayCore)).toBe(0);
    expect(createEconomyTickPlan(localCore).researchPerSecond).toBe(3);
    const completeCore = factoryState({
      megastructureId: "celestialProcessingCore",
      researched: [...core],
    });
    const remoteCompleteCore: GameState = {
      ...completeCore,
      run: {
        ...completeCore.run,
        space: { ...completeCore.run.space, currentSystemId: awaySystemId },
      },
    };
    expect(megastructureResearchRateBonus(completeCore)).toBe(5);
    expect(megastructureResearchRateBonus(remoteCompleteCore)).toBe(5);

    const completeForge = factoryState({ megastructureId: "plasmaForge", researched: [...forge] });
    expect(megastructureResourceRateMultiplier(completeForge)).toBe(32.8125);
    expect(createEconomyTickPlan(completeForge).researchPerSecond).toBe(0);
  });

  it("reports a clue and grants the manuscript reward when its system is settled", () => {
    const initial = createInitialGameState({ seed: 413 });
    const record = {
      position: 1 as const,
      manuscriptSystemId: manuscriptSite.id,
      factorySystemId: factoryStar.id,
      megastructureId: "dysonSphere" as const,
      reported: false,
    };
    const compoundId = COMPOUND_IDS[0]!;
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        cash: 0,
        goods: {
          ...initial.run.goods,
          [compoundId]: {
            ...initial.run.goods[compoundId],
            quantity: 40,
            storageCapacity: 60,
          },
        },
        space: {
          ...initial.run.space,
          currentSystemId: manuscriptSite.id,
          weatherSystemId: manuscriptSite.id,
          systemProfiles: ensureDiscoveredStarSystemProfiles(
            initial.run.space.systemProfiles,
            manuscriptSite.id,
            200,
          ),
          starship: {
            destinationSystemId: manuscriptSite.id,
            phase: "orbiting",
            timerId: null,
            durationMs: 1,
            antimatterSpent: 1,
          },
          systemEncounters: [
            {
              ...generateStarSystemEncounter(manuscriptSite, false),
              civilizationLevel: "none",
              enemyFleets: { air: 0, land: 0, sea: 0 },
              attitude: "none",
            },
          ],
        },
      },
      permanent: {
        ...initial.permanent,
        megastructures: {
          ...initial.permanent.megastructures,
          ancientManuscripts: [record],
        },
      },
    };

    const settled = transition(state, { type: "space.system.settle" });
    expect(settled.accepted).toBe(true);
    expect(settled.events).toContainEqual({
      type: "space.manuscript.reported",
      manuscriptSystemId: manuscriptSite.id,
      factorySystemId: factoryStar.id,
      megastructureId: "dysonSphere",
    });
    expect(settled.state.permanent.megastructures.ancientManuscripts[0]?.reported).toBe(true);
    expect(settled.state.permanent.megastructures.manuscriptRewardClaimed).toBe(true);
    expect(settled.state.run.goods[compoundId].quantity).toBe(60);
    expect(isValidGameState(settled.state)).toBe(true);
  });

  it("forces the factory guardian encounter into robotic hard mode", () => {
    const encounter = generateStarSystemEncounter(factoryStar, true);
    expect(encounter).toMatchObject({
      civilizationLevel: "robotic",
      lifeDetected: true,
      threatLevel: "extreme",
      attitude: "belligerent",
      warReady: true,
      lifeformTraits: ["aggressive", "mechanized", "armored"],
      anomalies: ["stalwart"],
    });
    expect(encounter.lifeformTraits).not.toContain("diplomatic");
    expect(
      encounter.enemyFleets.air + encounter.enemyFleets.land + encounter.enemyFleets.sea,
    ).toBeGreaterThan(0);
    const home = generateStarSystemEncounter(
      catalogue.find((star) => star.name === "Miaplacidus")!,
      false,
    );
    expect(home.warReady).toBe(true);
    expect(home).toMatchObject({
      civilizationLevel: "robotic",
      threatLevel: "extreme",
      raceName: "Miaplacidus Wardens",
      enemyFleets: { air: 100, land: 100, sea: 100 },
    });
    expect(home.anomalies).toContain("aiMasterRace");
  });

  it("keeps a lost factory-guardian fight retryable after the fleet is rebuilt", () => {
    const initial = factoryState();
    const guardian = generateStarSystemEncounter(factoryStar, true);
    const goods = Object.fromEntries(
      ECONOMIC_GOOD_IDS.map((goodId) => [
        goodId,
        { ...initial.run.goods[goodId], quantity: 100_000, storageCapacity: 100_000 },
      ]),
    ) as GameState["run"]["goods"];
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        cash: 1_000_000,
        goods,
        economy: {
          ...initial.run.economy,
          researchedTechnologies: [...initial.run.economy.researchedTechnologies, "starshipFleets"],
          revealedTechnologies: [...initial.run.economy.revealedTechnologies, "starshipFleets"],
        },
        space: {
          ...initial.run.space,
          starshipModules: {
            ...initial.run.space.starshipModules,
            fleetHangar: { builtParts: STARSHIP_MODULES.fleetHangar.parts },
          },
          playerFleets: { ...initial.run.space.playerFleets, scout: 1 },
          playerFleetCombatTotals: {
            ...initial.run.space.playerFleetCombatTotals,
            scout: { attackPower: 6, defensePower: 6 },
          },
          starship: {
            destinationSystemId: factoryStar.id,
            phase: "orbiting",
            timerId: null,
            durationMs: 1_000,
            antimatterSpent: 1,
          },
          systemEncounters: [guardian],
        },
      },
    };
    expect(isValidGameState(state)).toBe(true);
    const entered = transition(state, { type: "space.diplomacy.enter-war" });
    const engaged = transition(entered.state, { type: "space.battle.engage" });
    const battleTimerId = createTimerId("battle", "starship-combat");
    let current = engaged.state;
    for (let round = 0; round < 500; round += 1) {
      const encounter = current.run.space.systemEncounters[0]!;
      if (encounter.battle.phase !== "inProgress") break;
      const completed = transition(current, { type: "timer.complete", timerId: battleTimerId });
      expect(completed.accepted).toBe(true);
      current = completed.state;
    }

    expect(current.run.space.systemEncounters[0]?.battle.phase).toBe("defeat");
    expect(current.run.space.systemEncounters[0]?.enemyFleets.air).toBeGreaterThan(0);
    expect(current.run.space.playerFleets.scout).toBe(0);
    expect(current.run.space.starship).toMatchObject({
      phase: "orbiting",
      destinationSystemId: factoryStar.id,
    });
    expect(isValidGameState(current)).toBe(true);

    const rebuilt = transition(current, { type: "space.fleet.build", fleetId: "scout" });
    expect(rebuilt.accepted).toBe(true);
    const renewedWar = transition(rebuilt.state, { type: "space.diplomacy.enter-war" });
    expect(renewedWar.accepted).toBe(true);
    const retry = transition(renewedWar.state, { type: "space.battle.engage" });
    expect(retry.accepted).toBe(true);
    expect(retry.state.run.space.systemEncounters[0]?.battle.phase).toBe("inProgress");
    expect(retry.state.run.timers[battleTimerId]?.status).toBe("running");
  });
});

describe("megastructure research guidance localization", () => {
  it("provides localized disabled-reason templates in all six locales", () => {
    for (const locale of LOCALE_IDS) {
      const text = megastructureText(locale);
      expect(text.insufficientResearch).toContain("{required}");
      expect(text.insufficientResearch).toContain("{shortfall}");
      expect(text.missingPrerequisites).toContain("{technologies}");
      expect(text.researchUnavailable.trim()).not.toBe("");
      expect(text.notSettled.trim()).not.toBe("");
      expect(text.notAtFactory.trim()).not.toBe("");

      expect(
        text.insufficientResearch.replace("{required}", "200,000").replace("{shortfall}", "50,000"),
      ).not.toMatch(/\{(?:required|shortfall)\}/);
      expect(
        text.missingPrerequisites.replace("{technologies}", "Orbital Construction"),
      ).not.toMatch(/\{technologies\}/);
    }
  });
});

function awaitlessTechnologyPrice(
  technologyId: (typeof MEGASTRUCTURE_TECHNOLOGY_IDS)[number],
): number {
  return {
    dysonSphereUnderstanding: 50_000,
    dysonSphereCapabilities: 100_000,
    dysonSphereDisconnect: 150_000,
    dysonSpherePower: 200_000,
    dysonSphereConnect: 250_000,
    celestialProcessingCoreUnderstanding: 50_000,
    celestialProcessingCoreCapabilities: 100_000,
    celestialProcessingCoreDisconnect: 150_000,
    celestialProcessingCorePower: 200_000,
    celestialProcessingCoreConnect: 250_000,
    plasmaForgeUnderstanding: 50_000,
    plasmaForgeCapabilities: 100_000,
    plasmaForgeDisconnect: 150_000,
    plasmaForgePower: 200_000,
    plasmaForgeConnect: 250_000,
    galacticMemoryArchiveUnderstanding: 50_000,
    galacticMemoryArchiveCapabilities: 100_000,
    galacticMemoryArchiveDisconnect: 150_000,
    galacticMemoryArchivePower: 200_000,
    galacticMemoryArchiveConnect: 250_000,
  }[technologyId];
}
