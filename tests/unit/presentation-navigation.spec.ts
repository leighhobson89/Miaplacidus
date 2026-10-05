import { describe, expect, it } from "vitest";
import {
  compoundPaneItems,
  cosmicRipPaneItems,
  energyPaneItems,
  galacticPaneItems,
  interstellarPaneItems,
  miaplaediaPaneItems,
  researchPaneItems,
  resourcePaneGroups,
  RESOURCE_PANE_ORDER,
  resourcePaneItems,
  settingsPaneItems,
  spaceMiningPaneItems,
} from "../../src/app/presentationNavigation";
import {
  createInitialStarSystemBattleState,
  ROCKET_PART_REQUIREMENTS,
  STARSHIP_MODULES,
  STARSHIP_MODULE_IDS,
} from "../../src/content/space";
import { createStarCatalogue } from "../../src/content/starCatalogue";
import { createInitialGameState } from "../../src/engine/state";
import { transition } from "../../src/engine/commands";

const ids = (items: readonly { readonly id: string }[]) => items.map(({ id }) => id);

describe("source-mapped child navigation", () => {
  it("keeps the Resources and Compounds page identities in source order", () => {
    expect(RESOURCE_PANE_ORDER).toEqual([
      "hydrogen",
      "helium",
      "neon",
      "oxygen",
      "carbon",
      "silicon",
      "sodium",
      "iron",
    ]);
    expect(
      ids(
        resourcePaneItems("en", [
          "iron",
          "silicon",
          "sodium",
          "oxygen",
          "neon",
          "carbon",
          "helium",
          "hydrogen",
        ]),
      ),
    ).toEqual([
      "resources-hydrogen",
      "resources-helium",
      "resources-neon",
      "resources-oxygen",
      "resources-carbon",
      "resources-silicon",
      "resources-sodium",
      "resources-iron",
    ]);

    const groups = resourcePaneGroups("en", ["hydrogen", "helium", "neon", "oxygen", "carbon"]);
    expect(groups.map(({ id, label, goodIds }) => ({ id, label, goodIds }))).toEqual([
      { id: "gases", label: "Gases", goodIds: ["hydrogen", "helium", "neon", "oxygen"] },
      { id: "solids", label: "Solids", goodIds: ["carbon"] },
    ]);
    expect(resourcePaneGroups("en", ["hydrogen"]).map(({ id }) => id)).toEqual(["gases"]);

    const translatedGroupNames = [
      { locale: "en", labels: ["Gases", "Solids"] },
      { locale: "es", labels: ["Gases", "Sólidos"] },
      { locale: "pt", labels: ["Gases", "Sólidos"] },
      { locale: "de", labels: ["Gase", "Feststoffe"] },
      { locale: "it", labels: ["Gas", "Solidi"] },
      { locale: "fr", labels: ["Gaz", "Solides"] },
    ] as const;
    for (const { locale, labels } of translatedGroupNames) {
      expect(resourcePaneGroups(locale, ["hydrogen", "carbon"]).map(({ label }) => label)).toEqual(
        labels,
      );
    }

    expect(
      ids(compoundPaneItems("en", ["titanium", "water", "concrete", "steel", "glass", "diesel"])),
    ).toEqual([
      "compounds-diesel",
      "compounds-water",
      "compounds-glass",
      "compounds-concrete",
      "compounds-steel",
      "compounds-titanium",
    ]);
  });

  it("keeps Energy and the unified Tech Tree ahead of their gated destinations", () => {
    expect(ids(energyPaneItems("en", []))).toEqual(["energy-storage", "energy-power-plant"]);
    expect(ids(energyPaneItems("en", ["advancedPowerGeneration", "solarPowerGeneration"]))).toEqual(
      [
        "energy-storage",
        "energy-power-plant",
        "energy-solar-power-plant",
        "energy-advanced-power-plant",
      ],
    );
    expect(ids(researchPaneItems("en", false))).toEqual([
      "research-science-buildings",
      "research-tech-tree",
    ]);
    expect(ids(researchPaneItems("en", true))).toEqual([
      "research-science-buildings",
      "research-tech-tree",
      "research-philosophy",
    ]);
  });

  it("keeps Settings in source-rendered group order and Miaplaedia documents in source order", () => {
    expect(ids(settingsPaneItems("en"))).toEqual([
      "settings-achievements",
      "settings-events",
      "settings-statistics",
      "settings-visual",
      "settings-game-options",
      "settings-saves",
    ]);
    expect(ids(miaplaediaPaneItems("en"))).toEqual([
      "miaplaedia-get-started",
      "miaplaedia-story",
      "miaplaedia-concepts-early",
      "miaplaedia-concepts-mid",
      "miaplaedia-concepts-late",
      "miaplaedia-end-goal",
      "miaplaedia-philosophies",
    ]);
  });

  it("adds Interstellar destinations in their source positions as their gates open", () => {
    const initial = createInitialGameState({ locale: "en" });
    const profile = {
      systemId: initial.run.space.currentSystemId,
      weatherChances: { sunny: 1, cloudy: 0, rain: 0, volcano: 0 },
      precipitationGoodId: "water" as const,
      ascendencyPoints: 0,
      ascendencyDistanceLy: 0,
    };
    const discovered = {
      ...initial,
      run: {
        ...initial.run,
        space: { ...initial.run.space, systemProfiles: [profile, profile] },
      },
    };
    expect(ids(interstellarPaneItems("en", discovered))).toEqual([
      "interstellar-star-map",
      "interstellar-star-data",
    ]);

    const completedModules = Object.fromEntries(
      STARSHIP_MODULE_IDS.map((moduleId) => [
        moduleId,
        {
          ...initial.run.space.starshipModules[moduleId],
          builtParts: STARSHIP_MODULES[moduleId].parts,
        },
      ]),
    ) as typeof initial.run.space.starshipModules;
    const shipReady = {
      ...discovered,
      run: {
        ...discovered.run,
        economy: {
          ...discovered.run.economy,
          researchedTechnologies: ["orbitalConstruction"] as const,
        },
        space: { ...discovered.run.space, starshipModules: completedModules },
      },
    };
    expect(ids(interstellarPaneItems("en", shipReady))).toEqual([
      "interstellar-star-map",
      "interstellar-star-data",
      "interstellar-starship",
      "interstellar-fleet-hangar",
    ]);
  });

  it("shows Colonise only while orbiting a scanned selected destination with a fleet", () => {
    const initial = createInitialGameState({ locale: "en" });
    const destination = createStarCatalogue().find(
      (star) => star.id !== initial.run.space.currentSystemId,
    )!;
    const scannedDestination = {
      systemId: destination.id,
      lifeDetected: true,
      civilizationLevel: "industrial" as const,
      lifeformTraits: ["diplomatic", "terrans", "powerSiphon"] as const,
      raceName: `${destination.name} Envoys`,
      populationEstimate: 2_000_000,
      threatLevel: "low" as const,
      defenseRating: 30,
      enemyFleets: { air: 2, land: 3, sea: 1 },
      anomalies: [],
      initialImpression: 60,
      currentImpression: 60,
      latestDifferenceInImpression: 0,
      attitude: "receptive" as const,
      triedToBully: false,
      patience: 5,
      lastDiplomacyMessage: null,
      warReady: false,
      warMode: false,
      battle: createInitialStarSystemBattleState(),
    } satisfies (typeof initial.run.space.systemEncounters)[number];
    const orbitingAtScannedDestination = {
      ...initial,
      run: {
        ...initial.run,
        space: {
          ...initial.run.space,
          starship: {
            ...initial.run.space.starship,
            destinationSystemId: destination.id,
            phase: "orbiting" as const,
          },
          systemEncounters: [scannedDestination],
          playerFleets: { ...initial.run.space.playerFleets, scout: 1 },
        },
      },
    };

    expect(ids(interstellarPaneItems("en", orbitingAtScannedDestination))).toContain(
      "interstellar-colonise",
    );
    expect(
      ids(
        interstellarPaneItems("en", {
          ...orbitingAtScannedDestination,
          run: {
            ...orbitingAtScannedDestination.run,
            space: {
              ...orbitingAtScannedDestination.run.space,
              starship: {
                ...orbitingAtScannedDestination.run.space.starship,
                phase: "travelling",
              },
            },
          },
        }),
      ),
    ).not.toContain("interstellar-colonise");
  });

  it("keeps Rocket pages hidden until each rocket is complete and preserves later Space Mining order", () => {
    const initial = createInitialGameState({ locale: "en" });
    expect(ids(spaceMiningPaneItems("en", initial))).toEqual(["space-mining-telescope"]);

    const rocketTechnology = {
      ...initial,
      run: {
        ...initial.run,
        economy: {
          ...initial.run.economy,
          researchedTechnologies: ["rocketComposites"] as const,
        },
      },
    };
    expect(ids(spaceMiningPaneItems("en", rocketTechnology))).toEqual([
      "space-mining-telescope",
      "space-mining-launch-pad",
    ]);

    const asteroid = {
      id: "navigation-test-asteroid",
      name: "Navigation Test Asteroid",
      systemId: initial.run.space.currentSystemId,
      distance: 1,
      rarity: "common" as const,
      extractionEase: 1,
      remainingAntimatter: 1,
      totalAntimatter: 1,
      reservedBy: null,
      depleted: false,
      interacted: false,
    };
    const rocketOneComplete = {
      ...rocketTechnology,
      run: {
        ...rocketTechnology.run,
        space: {
          ...rocketTechnology.run.space,
          launchPadBuilt: true,
          rockets: {
            ...rocketTechnology.run.space.rockets,
            rocket1: {
              ...rocketTechnology.run.space.rockets.rocket1,
              builtParts: ROCKET_PART_REQUIREMENTS.rocket1,
            },
          },
          asteroids: [asteroid],
          antimatterUnlocked: true,
        },
      },
    };
    expect(ids(spaceMiningPaneItems("en", rocketOneComplete))).toEqual([
      "space-mining-mining",
      "space-mining-telescope",
      "space-mining-asteroids",
      "space-mining-launch-pad",
      "space-mining-rocket-1",
    ]);
  });

  it("adds Cosmic Rip destinations only after their individual progression gates", () => {
    const initial = createInitialGameState({ locale: "en" });
    expect(ids(cosmicRipPaneItems("en", initial))).toEqual(["cosmic-rip-situation"]);

    const scannerRestored = {
      ...initial,
      permanent: {
        ...initial.permanent,
        cosmicRip: { ...initial.permanent.cosmicRip, scannerRestored: true },
      },
    };
    expect(ids(cosmicRipPaneItems("en", scannerRestored))).toEqual([
      "cosmic-rip-situation",
      "cosmic-rip-scanner-array",
    ]);

    const ripFound = {
      ...scannerRestored,
      permanent: {
        ...scannerRestored.permanent,
        cosmicRip: { ...scannerRestored.permanent.cosmicRip, ripFound: true },
      },
    };
    expect(ids(cosmicRipPaneItems("en", ripFound))).toEqual([
      "cosmic-rip-situation",
      "cosmic-rip-scanner-array",
      "cosmic-rip-rip",
    ]);
  });
});

describe("Galactic child navigation", () => {
  it("keeps the Casino hidden before its AP-award progression gate", () => {
    const fresh = createInitialGameState({ locale: "en" });

    expect(ids(galacticPaneItems("en", fresh))).toEqual(["galactic-rebirth", "galactic-market"]);
    expect(galacticPaneItems("en", fresh).map(({ sourceOptionId }) => sourceOptionId)).toEqual([
      "option1",
      "option2",
    ]);
  });

  it("keeps the Casino hidden after a rebirth until the current run awards AP", () => {
    const initial = createInitialGameState({ locale: "en" });
    const state = {
      ...initial,
      permanent: { ...initial.permanent, rebirthCount: 1 },
    };

    expect(ids(galacticPaneItems("en", state))).toEqual([
      "galactic-rebirth",
      "galactic-market",
      "galactic-ascendency-perks",
    ]);
  });

  it("places Galactic Casino between the Market and Ascendency Perks", () => {
    const initial = createInitialGameState({ locale: "en" });
    const state = {
      ...initial,
      permanent: { ...initial.permanent, rebirthCount: 1 },
      run: {
        ...initial.run,
        space: { ...initial.run.space, ascendencyAwardedThisRun: true },
      },
    };

    const items = galacticPaneItems("en", state);
    expect(ids(items)).toEqual([
      "galactic-rebirth",
      "galactic-market",
      "galactic-casino",
      "galactic-ascendency-perks",
    ]);
    expect(items.map(({ id, sourceOptionId }) => [id, sourceOptionId])).toEqual([
      ["galactic-rebirth", "option1"],
      ["galactic-market", "option2"],
      ["galactic-casino", "option6"],
      ["galactic-ascendency-perks", "option3"],
    ]);
  });
});

describe("persistent navigation attention", () => {
  it("initializes first-access badges once and preserves them across later unlocks", () => {
    const initial = createInitialGameState({ locale: "en" });
    const initialized = transition(initial, {
      type: "navigation.attention.initialize",
      pageIds: ["settings", "settings-visual", "miaplaedia-story", "settings-visual"],
    });

    expect(initialized.accepted).toBe(true);
    expect(initialized.state.run.navigationAttentionInitialized).toBe(true);
    expect(initialized.state.run.navigationAttentionIds).toEqual([
      "settings",
      "settings-visual",
      "miaplaedia-story",
    ]);

    const repeatedInitialization = transition(initialized.state, {
      type: "navigation.attention.initialize",
      pageIds: ["not-a-new-first-access-page"],
    });
    expect(repeatedInitialization.state.run.navigationAttentionIds).toEqual(
      initialized.state.run.navigationAttentionIds,
    );
  });

  it("deduplicates newly available pages and clears each page when opened", () => {
    const base = createInitialGameState({ locale: "en" });
    const initial = {
      ...base,
      run: {
        ...base.run,
        navigationAttentionInitialized: true,
      },
    };
    const discovered = transition(initial, {
      type: "navigation.attention.discover",
      pageIds: ["energy", "energy-power-plant", "energy-power-plant"],
    });

    expect(discovered.accepted).toBe(true);
    expect(discovered.state.run.navigationAttentionIds).toEqual(["energy", "energy-power-plant"]);

    const opened = transition(discovered.state, {
      type: "navigation.attention.clear",
      pageId: "energy-power-plant",
    });
    expect(opened.accepted).toBe(true);
    expect(opened.state.run.navigationAttentionIds).toEqual(["energy"]);
  });
});
