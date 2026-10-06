import { describe, expect, it } from "vitest";
import {
  compoundPaneItems,
  compoundPaneGroups,
  COMPOUND_PANE_ORDER,
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
  ROCKET_IDS,
  ROCKET_PART_REQUIREMENTS,
  STARSHIP_MODULES,
  STARSHIP_MODULE_IDS,
} from "../../src/content/space";
import { createStarCatalogue } from "../../src/content/starCatalogue";
import { createInitialGameState, type GameState } from "../../src/engine/state";
import { generateStarSystemEncounter } from "../../src/engine/starSystemEncounters";
import { transition } from "../../src/engine/commands";

const ids = (items: readonly { readonly id: string }[]) => items.map(({ id }) => id);

describe("source-mapped child navigation", () => {
  it("pins every child pane to its source option identity and rendered order", () => {
    const initial = createInitialGameState({ locale: "en" });
    const sourceIdentity = (
      items: readonly { readonly id: string; readonly sourceOptionId?: string }[],
    ) => items.map(({ id, sourceOptionId }) => [id, sourceOptionId] as const);

    const resourceGroups = resourcePaneGroups("en", RESOURCE_PANE_ORDER);
    const compoundGroups = compoundPaneGroups("en", COMPOUND_PANE_ORDER);
    const destinationId = initial.run.space.currentSystemId;
    const completedModules = Object.fromEntries(
      STARSHIP_MODULE_IDS.map((moduleId) => [
        moduleId,
        {
          ...initial.run.space.starshipModules[moduleId],
          builtParts: STARSHIP_MODULES[moduleId].parts,
        },
      ]),
    ) as typeof initial.run.space.starshipModules;
    const interstellarState: GameState = {
      ...initial,
      run: {
        ...initial.run,
        economy: {
          ...initial.run.economy,
          researchedTechnologies: ["orbitalConstruction"] as const,
        },
        space: {
          ...initial.run.space,
          systemProfiles: [
            ...initial.run.space.systemProfiles,
            ...initial.run.space.systemProfiles,
          ],
          starshipModules: completedModules,
          starship: {
            ...initial.run.space.starship,
            destinationSystemId: destinationId,
            phase: "orbiting" as const,
          },
          systemEncounters: [
            { systemId: destinationId } as GameState["run"]["space"]["systemEncounters"][number],
          ],
          playerFleets: { ...initial.run.space.playerFleets, scout: 1 },
        },
      },
    };
    const spaceMiningState = {
      ...initial,
      run: {
        ...initial.run,
        economy: {
          ...initial.run.economy,
          researchedTechnologies: ["rocketComposites"] as const,
        },
        space: {
          ...initial.run.space,
          antimatterUnlocked: true,
          asteroids: [
            {
              id: "navigation-source-map-asteroid",
              name: "Navigation Source Map Asteroid",
              systemId: initial.run.space.currentSystemId,
              distance: 1,
              rarity: "common" as const,
              extractionEase: 1,
              remainingAntimatter: 1,
              totalAntimatter: 1,
              reservedBy: null,
              depleted: false,
              interacted: false,
            },
          ],
          launchPadBuilt: true,
          rockets: Object.fromEntries(
            ROCKET_IDS.map((id) => [
              id,
              {
                ...initial.run.space.rockets[id],
                builtParts: ROCKET_PART_REQUIREMENTS[id],
              },
            ]),
          ) as typeof initial.run.space.rockets,
        },
      },
    };
    const galacticState = {
      ...initial,
      run: {
        ...initial.run,
        space: {
          ...initial.run.space,
          ascendencyAwardedThisRun: true,
          systemEncounters: [
            generateStarSystemEncounter(
              createStarCatalogue().find((star) => !star.initiallySettled)!,
              false,
            ),
          ],
        },
      },
      permanent: {
        ...initial.permanent,
        rebirthCount: 1,
        megastructures: {
          ...initial.permanent.megastructures,
          conquestRewardClaimed: true,
        },
        blackHole: { ...initial.permanent.blackHole, discovered: true },
      },
    };
    const cosmicRipState = {
      ...initial,
      permanent: {
        ...initial.permanent,
        cosmicRip: {
          ...initial.permanent.cosmicRip,
          scannerRestored: true,
          ripFound: true,
        },
      },
    };

    const paneCases = [
      {
        domain: "Resources / Gases",
        items: resourceGroups[0].items,
        expected: [
          ["resources-hydrogen", "option1"],
          ["resources-helium", "option2"],
          ["resources-neon", "option4"],
          ["resources-oxygen", "option5"],
        ],
      },
      {
        domain: "Resources / Solids",
        items: resourceGroups[1].items,
        expected: [
          ["resources-carbon", "option3"],
          ["resources-silicon", "option7"],
          ["resources-sodium", "option6"],
          ["resources-iron", "option8"],
        ],
      },
      {
        domain: "Energy",
        items: energyPaneItems("en", ["solarPowerGeneration", "advancedPowerGeneration"]),
        expected: [
          ["energy-storage", "option1"],
          ["energy-power-plant", "option2"],
          ["energy-solar-power-plant", "option3"],
          ["energy-advanced-power-plant", "option4"],
        ],
      },
      {
        domain: "Research",
        items: researchPaneItems("en", true),
        expected: [
          ["research-science-buildings", "option1"],
          ["research-tech-tree", "option3"],
          ["research-philosophy", "option4"],
        ],
      },
      {
        domain: "Compounds / Liquids",
        items: compoundGroups[0].items,
        expected: [
          ["compounds-diesel", "option1"],
          ["compounds-water", "option5"],
        ],
      },
      {
        domain: "Compounds / Solids",
        items: compoundGroups[1].items,
        expected: [
          ["compounds-glass", "option2"],
          ["compounds-concrete", "option4"],
          ["compounds-steel", "option3"],
          ["compounds-titanium", "option6"],
        ],
      },
      {
        domain: "Interstellar",
        items: interstellarPaneItems("en", interstellarState),
        expected: [
          ["interstellar-star-map", "option1"],
          ["interstellar-star-data", "option2"],
          ["interstellar-starship", "option3"],
          ["interstellar-fleet-hangar", "option4"],
          ["interstellar-colonise", "option5"],
        ],
      },
      {
        domain: "Space Mining",
        items: spaceMiningPaneItems("en", spaceMiningState),
        expected: [
          ["space-mining-mining", "option8"],
          ["space-mining-telescope", "option6"],
          ["space-mining-asteroids", "option7"],
          ["space-mining-launch-pad", "option1"],
          ["space-mining-rocket-1", "option2"],
          ["space-mining-rocket-2", "option3"],
          ["space-mining-rocket-3", "option4"],
          ["space-mining-rocket-4", "option5"],
        ],
      },
      {
        domain: "Galactic",
        items: galacticPaneItems("en", galacticState),
        expected: [
          ["galactic-rebirth", "option1"],
          ["galactic-market", "option2"],
          ["galactic-casino", "option6"],
          ["galactic-ascendency-perks", "option3"],
          ["galactic-megastructures", "option4"],
          ["galactic-black-hole", "option5"],
        ],
      },
      {
        domain: "Cosmic Rip",
        items: cosmicRipPaneItems("en", cosmicRipState),
        expected: [
          ["cosmic-rip-situation", "option1"],
          ["cosmic-rip-scanner-array", "option2"],
          ["cosmic-rip-rip", "option3"],
        ],
      },
      {
        domain: "Settings",
        items: settingsPaneItems("en"),
        expected: [
          ["settings-achievements", "option10"],
          ["settings-events", "option14"],
          ["settings-statistics", "option8"],
          ["settings-visual", "option1"],
          ["settings-game-options", "option3"],
          ["settings-saves", "option2"],
        ],
      },
      {
        domain: "Miaplaedia",
        items: miaplaediaPaneItems("en"),
        expected: [
          ["miaplaedia-get-started", "option4"],
          ["miaplaedia-story", "option12"],
          ["miaplaedia-concepts-early", "option5"],
          ["miaplaedia-concepts-mid", "option6"],
          ["miaplaedia-concepts-late", "option7"],
          ["miaplaedia-end-goal", "option13"],
          ["miaplaedia-philosophies", "option11"],
        ],
      },
    ] as const;

    expect(resourceGroups.map(({ id }) => id)).toEqual(["gases", "solids"]);
    expect(compoundGroups.map(({ id }) => id)).toEqual(["liquids", "solids"]);
    for (const { domain, items, expected } of paneCases) {
      expect(sourceIdentity(items), domain).toEqual(expected);
    }
  });

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
  it("keeps Rebirth hidden until the current run scans a destination", () => {
    const fresh = createInitialGameState({ locale: "en" });

    expect(ids(galacticPaneItems("en", fresh))).toEqual(["galactic-market"]);
    expect(galacticPaneItems("en", fresh).map(({ sourceOptionId }) => sourceOptionId)).toEqual([
      "option2",
    ]);
  });

  it("keeps Casino and Perks available after rebirth while Rebirth awaits this run's scan", () => {
    const initial = createInitialGameState({ locale: "en" });
    const state = {
      ...initial,
      permanent: { ...initial.permanent, rebirthCount: 1 },
    };

    expect(ids(galacticPaneItems("en", state))).toEqual([
      "galactic-market",
      "galactic-casino",
      "galactic-ascendency-perks",
    ]);
    expect(
      galacticPaneItems("en", state).map(({ id, sourceOptionId }) => [id, sourceOptionId]),
    ).toEqual([
      ["galactic-market", "option2"],
      ["galactic-casino", "option6"],
      ["galactic-ascendency-perks", "option3"],
    ]);
  });

  it("reveals Rebirth in source order when the current run has scanned a destination", () => {
    const initial = createInitialGameState({ locale: "en" });
    const destination = createStarCatalogue().find((star) => !star.initiallySettled)!;
    const state = {
      ...initial,
      run: {
        ...initial.run,
        space: {
          ...initial.run.space,
          ascendencyAwardedThisRun: true,
          systemEncounters: [generateStarSystemEncounter(destination, false)],
        },
      },
    };

    expect(ids(galacticPaneItems("en", state))).toEqual([
      "galactic-rebirth",
      "galactic-market",
      "galactic-casino",
      "galactic-ascendency-perks",
    ]);
    expect(
      galacticPaneItems("en", state).map(({ id, sourceOptionId }) => [id, sourceOptionId]),
    ).toEqual([
      ["galactic-rebirth", "option1"],
      ["galactic-market", "option2"],
      ["galactic-casino", "option6"],
      ["galactic-ascendency-perks", "option3"],
    ]);
  });

  it("keeps Casino after the Market when the first run awards AP before a scan", () => {
    const initial = createInitialGameState({ locale: "en" });
    const state = {
      ...initial,
      run: {
        ...initial.run,
        space: { ...initial.run.space, ascendencyAwardedThisRun: true },
      },
    };
    expect(state.permanent.rebirthCount).toBe(0);

    const items = galacticPaneItems("en", state);
    expect(ids(items)).toEqual(["galactic-market", "galactic-casino", "galactic-ascendency-perks"]);
    expect(items.map(({ id, sourceOptionId }) => [id, sourceOptionId])).toEqual([
      ["galactic-market", "option2"],
      ["galactic-casino", "option6"],
      ["galactic-ascendency-perks", "option3"],
    ]);
  });

  it("reveals Megastructures at the first factory system before capture", () => {
    const initial = createInitialGameState({ locale: "en" });
    const catalogue = createStarCatalogue();
    const factoryStar = catalogue.find((star) => !star.initiallySettled)!;
    const manuscriptStar = catalogue.find(
      (star) => !star.initiallySettled && star.id !== factoryStar.id,
    )!;
    const state = {
      ...initial,
      run: {
        ...initial.run,
        space: { ...initial.run.space, currentSystemId: factoryStar.id },
      },
      permanent: {
        ...initial.permanent,
        megastructures: {
          ...initial.permanent.megastructures,
          ancientManuscripts: [
            {
              position: 1 as const,
              manuscriptSystemId: manuscriptStar.id,
              factorySystemId: factoryStar.id,
              megastructureId: "celestialProcessingCore" as const,
              reported: false,
            },
          ],
        },
      },
    };

    expect(state.permanent.megastructures.conquestRewardClaimed).toBe(false);
    expect(state.permanent.megastructures.researchedTechnologyIds).toEqual([]);
    expect(state.permanent.settledSystemIds).not.toContain(factoryStar.id);
    expect(ids(galacticPaneItems("en", state))).toContain("galactic-megastructures");
  });

  it("keeps captured Megastructures visible after rebirth", () => {
    const initial = createInitialGameState({ locale: "en" });
    const catalogue = createStarCatalogue();
    const factoryStar = catalogue.find((star) => !star.initiallySettled)!;
    const manuscriptStar = catalogue.find(
      (star) => !star.initiallySettled && star.id !== factoryStar.id,
    )!;
    const captured = {
      ...initial,
      run: {
        ...initial.run,
        space: { ...initial.run.space, ascendencyAwardedThisRun: true },
      },
      permanent: {
        ...initial.permanent,
        megastructures: {
          ...initial.permanent.megastructures,
          ancientManuscripts: [
            {
              position: 1 as const,
              manuscriptSystemId: manuscriptStar.id,
              factorySystemId: factoryStar.id,
              megastructureId: "celestialProcessingCore" as const,
              reported: true,
            },
          ],
          conquestRewardClaimed: true,
        },
      },
    };

    const reborn = transition(captured, { type: "meta.rebirth" });

    expect(reborn.accepted).toBe(true);
    expect(reborn.state.run.space.ascendencyAwardedThisRun).toBe(false);
    expect(reborn.state.permanent.megastructures.conquestRewardClaimed).toBe(true);
    expect(ids(galacticPaneItems("en", reborn.state))).toContain("galactic-megastructures");
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
