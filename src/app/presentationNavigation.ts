import type { LocaleId } from "../content/ids";
import { blackHoleText } from "../i18n/blackHoleMessages";
import { casinoText } from "../i18n/casinoMessages";
import { marketText, metaText } from "../i18n/metaMessages";
import { megastructureText } from "../i18n/megastructureMessages";
import { settingsSectionName, settingsText } from "../i18n/settingsMessages";
import { starMapText } from "../i18n/starMapMessages";
import { starshipText } from "../i18n/starshipMessages";
import { spaceText } from "../i18n/spaceMessages";
import { rocketText } from "../i18n/rocketMessages";
import { cosmicRipText } from "../i18n/cosmicRipMessages";
import { economyLabel } from "../i18n/economyMessages";
import { philosophyText } from "../i18n/philosophyMessages";
import type { CosmicopediaSectionId } from "../i18n/cosmicopediaMessages";
import { type CompoundId, type MaterialId } from "../content/ids";
import { ECONOMY_BUILDING_NAMES } from "../content/economyBuildingNames";
import {
  ROCKET_IDS,
  ROCKET_PART_REQUIREMENTS,
  STARSHIP_MODULES,
  type StarshipModuleId,
} from "../content/space";
import type { GameState } from "../engine/state";
import type { PaneNavigationItem } from "./PaneNavigation";
import { economyGoodName } from "./economyDisplay";

const RESOURCE_GROUP_DEFINITIONS = [
  { id: "gases", labelKey: "gases", goodIds: ["hydrogen", "helium", "neon", "oxygen"] },
  { id: "solids", labelKey: "solids", goodIds: ["carbon", "silicon", "sodium", "iron"] },
] as const satisfies readonly {
  readonly id: string;
  readonly labelKey: "gases" | "solids";
  readonly goodIds: readonly MaterialId[];
}[];

export const RESOURCE_PANE_ORDER: readonly MaterialId[] = RESOURCE_GROUP_DEFINITIONS.flatMap(
  (group) => group.goodIds,
);
const RESOURCE_SOURCE_OPTION_ID: Record<MaterialId, `option${number}`> = {
  hydrogen: "option1",
  helium: "option2",
  carbon: "option3",
  neon: "option4",
  oxygen: "option5",
  sodium: "option6",
  silicon: "option7",
  iron: "option8",
};
export const RESOURCE_PANE_IDS: readonly string[] = RESOURCE_PANE_ORDER.map(
  (id) => `resources-${id}`,
);
export const ENERGY_PANE_IDS = [
  "energy-storage",
  "energy-power-plant",
  "energy-solar-power-plant",
  "energy-advanced-power-plant",
] as const;
export const RESEARCH_PANE_IDS = [
  "research-science-buildings",
  "research-tech-tree",
  "research-philosophy",
] as const;
const COMPOUND_GROUP_DEFINITIONS = [
  { id: "liquids", labelKey: "liquids", goodIds: ["diesel", "water"] },
  { id: "solids", labelKey: "solids", goodIds: ["glass", "concrete", "steel", "titanium"] },
] as const satisfies readonly {
  readonly id: string;
  readonly labelKey: "liquids" | "solids";
  readonly goodIds: readonly CompoundId[];
}[];

export const COMPOUND_PANE_ORDER: readonly CompoundId[] = COMPOUND_GROUP_DEFINITIONS.flatMap(
  (group) => group.goodIds,
);
export const COMPOUND_PANE_IDS: readonly string[] = COMPOUND_PANE_ORDER.map(
  (id) => `compounds-${id}`,
);

export interface ResourcePaneGroup {
  readonly id: (typeof RESOURCE_GROUP_DEFINITIONS)[number]["id"];
  readonly label: string;
  readonly goodIds: readonly MaterialId[];
  readonly items: readonly PaneNavigationItem[];
}

export function resourcePaneGroups(
  locale: LocaleId,
  unlocked: readonly string[],
): readonly ResourcePaneGroup[] {
  return RESOURCE_GROUP_DEFINITIONS.flatMap((group) => {
    const goodIds = group.goodIds.filter((id) => unlocked.includes(id));
    if (goodIds.length === 0) return [];
    const label = economyLabel(locale, group.labelKey);
    return [
      {
        id: group.id,
        label,
        goodIds,
        items: goodIds.map((id) => ({
          id: `resources-${id}`,
          label: economyGoodName(locale, id),
          groupId: group.id,
          groupLabel: label,
          sourceOptionId: RESOURCE_SOURCE_OPTION_ID[id],
        })),
      },
    ];
  });
}

export function resourcePaneItems(
  locale: LocaleId,
  unlocked: readonly string[],
): readonly PaneNavigationItem[] {
  return resourcePaneGroups(locale, unlocked).flatMap((group) => group.items);
}

export function energyPaneItems(
  locale: LocaleId,
  researched: readonly string[],
): readonly PaneNavigationItem[] {
  const panelId = "panel-energy";
  const items: PaneNavigationItem[] = [
    {
      id: "energy-storage",
      label: economyLabel(locale, "energyStorage"),
      panelId,
      sourceOptionId: "option1",
    },
    {
      id: "energy-power-plant",
      label: ECONOMY_BUILDING_NAMES.powerPlant1[locale],
      panelId,
      sourceOptionId: "option2",
    },
  ];
  if (researched.includes("solarPowerGeneration")) {
    items.push({
      id: "energy-solar-power-plant",
      label: ECONOMY_BUILDING_NAMES.powerPlant2[locale],
      panelId,
      sourceOptionId: "option3",
    });
  }
  if (researched.includes("advancedPowerGeneration")) {
    items.push({
      id: "energy-advanced-power-plant",
      label: ECONOMY_BUILDING_NAMES.powerPlant3[locale],
      panelId,
      sourceOptionId: "option4",
    });
  }
  return items;
}

export function researchPaneItems(
  locale: LocaleId,
  includePhilosophy: boolean,
): readonly PaneNavigationItem[] {
  const items: PaneNavigationItem[] = [
    {
      id: "research-science-buildings",
      label: economyLabel(locale, "research"),
      sourceOptionId: "option1",
    },
    {
      id: "research-tech-tree",
      label: economyLabel(locale, "technologyTree"),
      sourceOptionId: "option3",
    },
  ];
  if (includePhilosophy) {
    items.push({
      id: "research-philosophy",
      label: philosophyText(locale).title,
      sourceOptionId: "option4",
    });
  }
  return items;
}

export interface CompoundPaneGroup {
  readonly id: (typeof COMPOUND_GROUP_DEFINITIONS)[number]["id"];
  readonly label: string;
  readonly goodIds: readonly CompoundId[];
  readonly items: readonly PaneNavigationItem[];
}

const COMPOUND_SOURCE_OPTION_ID: Record<CompoundId, `option${number}`> = {
  diesel: "option1",
  glass: "option2",
  steel: "option3",
  concrete: "option4",
  water: "option5",
  titanium: "option6",
};

export function compoundPaneGroups(
  locale: LocaleId,
  unlocked: readonly string[],
): readonly CompoundPaneGroup[] {
  return COMPOUND_GROUP_DEFINITIONS.flatMap((group) => {
    const goodIds = group.goodIds.filter((id) => unlocked.includes(id));
    if (goodIds.length === 0) return [];
    const label = economyLabel(locale, group.labelKey);
    return [
      {
        id: group.id,
        label,
        goodIds,
        items: goodIds.map((id) => ({
          id: `compounds-${id}`,
          label: economyGoodName(locale, id),
          groupId: group.id,
          groupLabel: label,
          sourceOptionId: COMPOUND_SOURCE_OPTION_ID[id],
        })),
      },
    ];
  });
}

export function compoundPaneItems(
  locale: LocaleId,
  unlocked: readonly string[],
): readonly PaneNavigationItem[] {
  return compoundPaneGroups(locale, unlocked).flatMap((group) => group.items);
}

export const GALACTIC_PANE_IDS = [
  "galactic-rebirth",
  "galactic-market",
  "galactic-casino",
  "galactic-ascendency-perks",
  "galactic-megastructures",
  "galactic-black-hole",
] as const;

export type GalacticPaneId = (typeof GALACTIC_PANE_IDS)[number];

export function galacticPaneItems(
  locale: LocaleId,
  state: GameState,
): readonly PaneNavigationItem[] {
  const items: PaneNavigationItem[] = [
    {
      id: "galactic-rebirth",
      label: metaText(locale, "rebirthAction"),
      sourceOptionId: "option1",
    },
    {
      id: "galactic-market",
      label: marketText(locale, "heading"),
      sourceOptionId: "option2",
    },
  ];
  if (state.run.space.ascendencyAwardedThisRun) {
    items.push({
      id: "galactic-casino",
      label: casinoText(locale, "title"),
      sourceOptionId: "option6",
    });
  }
  if (state.run.space.ascendencyAwardedThisRun || state.permanent.rebirthCount > 0) {
    items.push({
      id: "galactic-ascendency-perks",
      label: metaText(locale, "perksTitle"),
      sourceOptionId: "option3",
    });
  }
  const hasCapturedMegastructure =
    state.permanent.megastructures.conquestRewardClaimed ||
    state.permanent.megastructures.researchedTechnologyIds.length > 0 ||
    state.permanent.megastructures.ancientManuscripts.some(
      (record) =>
        record.factorySystemId === state.run.space.currentSystemId ||
        state.permanent.settledSystemIds.includes(record.factorySystemId),
    );
  if (hasCapturedMegastructure) {
    items.push({
      id: "galactic-megastructures",
      label: megastructureText(locale).title,
      sourceOptionId: "option4",
    });
  }
  if (state.permanent.blackHole.discovered) {
    items.push({
      id: "galactic-black-hole",
      label: blackHoleText(locale).title,
      sourceOptionId: "option5",
    });
  }
  return items;
}

export const MIAPLAEDIA_PANE_IDS = [
  "miaplaedia-get-started",
  "miaplaedia-story",
  "miaplaedia-concepts-early",
  "miaplaedia-concepts-mid",
  "miaplaedia-concepts-late",
  "miaplaedia-end-goal",
  "miaplaedia-philosophies",
] as const;

export type MiaplaediaPaneId = (typeof MIAPLAEDIA_PANE_IDS)[number];

const MIAPLAEDIA_SECTION_BY_PANE: Record<MiaplaediaPaneId, CosmicopediaSectionId> = {
  "miaplaedia-get-started": "getStarted",
  "miaplaedia-story": "story",
  "miaplaedia-concepts-early": "conceptsEarly",
  "miaplaedia-concepts-mid": "conceptsMid",
  "miaplaedia-concepts-late": "conceptsLate",
  "miaplaedia-end-goal": "endGoal",
  "miaplaedia-philosophies": "philosophies",
};

const MIAPLAEDIA_NAME_BY_PANE: Record<MiaplaediaPaneId, Parameters<typeof settingsSectionName>[1]> =
  {
    "miaplaedia-get-started": "getStarted",
    "miaplaedia-story": "story",
    "miaplaedia-concepts-early": "conceptsEarly",
    "miaplaedia-concepts-mid": "conceptsMid",
    "miaplaedia-concepts-late": "conceptsLate",
    "miaplaedia-end-goal": "endGoal",
    "miaplaedia-philosophies": "philosophies",
  };

const MIAPLAEDIA_SOURCE_OPTION_BY_PANE: Record<MiaplaediaPaneId, `option${number}`> = {
  "miaplaedia-get-started": "option4",
  "miaplaedia-story": "option12",
  "miaplaedia-concepts-early": "option5",
  "miaplaedia-concepts-mid": "option6",
  "miaplaedia-concepts-late": "option7",
  "miaplaedia-end-goal": "option13",
  "miaplaedia-philosophies": "option11",
};

export function miaplaediaSectionId(paneId: MiaplaediaPaneId): CosmicopediaSectionId {
  return MIAPLAEDIA_SECTION_BY_PANE[paneId];
}

export function miaplaediaPaneItems(locale: LocaleId): readonly PaneNavigationItem[] {
  return MIAPLAEDIA_PANE_IDS.map((id) => ({
    id,
    label: settingsSectionName(locale, MIAPLAEDIA_NAME_BY_PANE[id]),
    sourceOptionId: MIAPLAEDIA_SOURCE_OPTION_BY_PANE[id],
  }));
}

export const SETTINGS_PANE_IDS = [
  "settings-achievements",
  "settings-events",
  "settings-statistics",
  "settings-visual",
  "settings-game-options",
  "settings-saves",
] as const;

export type SettingsPaneId = (typeof SETTINGS_PANE_IDS)[number];

export const SETTINGS_LIBRARY_PANE_IDS = [
  "settings-statistics",
] as const satisfies readonly SettingsPaneId[];

export function settingsPaneItems(locale: LocaleId): readonly PaneNavigationItem[] {
  return [
    {
      id: "settings-achievements",
      label: settingsText(locale, "achievements"),
      sourceOptionId: "option10",
    },
    {
      id: "settings-events",
      label: settingsSectionName(locale, "events"),
      sourceOptionId: "option14",
    },
    {
      id: "settings-statistics",
      label: settingsSectionName(locale, "statistics"),
      sourceOptionId: "option8",
    },
    {
      id: "settings-visual",
      label: settingsSectionName(locale, "visual"),
      sourceOptionId: "option1",
    },
    {
      id: "settings-game-options",
      label: settingsSectionName(locale, "gameOptions"),
      sourceOptionId: "option3",
    },
    {
      id: "settings-saves",
      label: settingsText(locale, "savingSection"),
      sourceOptionId: "option2",
    },
  ];
}

export const INTERSTELLAR_PANE_IDS = [
  "interstellar-star-map",
  "interstellar-star-data",
  "interstellar-starship",
  "interstellar-fleet-hangar",
  "interstellar-colonise",
] as const;

export type InterstellarPaneId = (typeof INTERSTELLAR_PANE_IDS)[number];

export function interstellarPaneItems(
  locale: LocaleId,
  state: GameState,
): readonly PaneNavigationItem[] {
  const starshipPanelId = "panel-interstellar-starship";
  const items: PaneNavigationItem[] = [
    {
      id: "interstellar-star-map",
      label: starMapText(locale, "title"),
      sourceOptionId: "option1",
    },
  ];
  if (state.run.space.systemProfiles.length > 1) {
    items.push({
      id: "interstellar-star-data",
      label: starMapText(locale, "dataView"),
      sourceOptionId: "option2",
    });
  }
  const hasStarshipTechnology =
    state.run.economy.researchedTechnologies.includes("orbitalConstruction");
  if (hasStarshipTechnology) {
    items.push({
      id: "interstellar-starship",
      label: starshipText(locale, "title"),
      sourceOptionId: "option3",
      panelId: starshipPanelId,
    });
  }
  const requiredModulesBuilt = (Object.keys(STARSHIP_MODULES) as StarshipModuleId[])
    .filter((id) => STARSHIP_MODULES[id].requiredForTravel)
    .every((id) => state.run.space.starshipModules[id].builtParts >= STARSHIP_MODULES[id].parts);
  const hangarBuilt =
    requiredModulesBuilt &&
    state.run.space.starshipModules.fleetHangar.builtParts >= STARSHIP_MODULES.fleetHangar.parts;
  if (hangarBuilt) {
    items.push({
      id: "interstellar-fleet-hangar",
      label: starshipText(locale, "fleetHangar"),
      sourceOptionId: "option4",
      panelId: starshipPanelId,
    });
  }
  const starship = state.run.space.starship;
  const destinationId = starship.destinationSystemId;
  const scannedDestinationEncounter =
    destinationId !== null &&
    state.run.space.systemEncounters.some((encounter) => encounter.systemId === destinationId);
  const hasFleet =
    state.run.space.fleetEnvoyBuilt ||
    Object.values(state.run.space.playerFleets).some((count) => count > 0);
  if (
    scannedDestinationEncounter &&
    starship.phase === "orbiting" &&
    hasFleet &&
    !state.run.space.ascendencyAwardedThisRun
  ) {
    items.push({
      id: "interstellar-colonise",
      label: starshipText(locale, "colonise"),
      sourceOptionId: "option5",
      panelId: starshipPanelId,
    });
  }
  return items;
}

export const SPACE_MINING_PANE_IDS = [
  "space-mining-mining",
  "space-mining-telescope",
  "space-mining-asteroids",
  "space-mining-launch-pad",
  "space-mining-rocket-1",
  "space-mining-rocket-2",
  "space-mining-rocket-3",
  "space-mining-rocket-4",
] as const;

export type SpaceMiningPaneId = (typeof SPACE_MINING_PANE_IDS)[number];

export function spaceMiningPaneItems(
  locale: LocaleId,
  state: GameState,
): readonly PaneNavigationItem[] {
  const items: PaneNavigationItem[] = [];
  if (state.run.space.antimatterUnlocked) {
    items.push({
      id: "space-mining-mining",
      label: spaceText(locale, "miningTitle"),
      sourceOptionId: "option8",
    });
  }
  items.push({
    id: "space-mining-telescope",
    label: spaceText(locale, "telescopeTitle"),
    sourceOptionId: "option6",
  });
  if (state.run.space.asteroids.length > 0) {
    items.push({
      id: "space-mining-asteroids",
      label: spaceText(locale, "asteroidsTitle"),
      sourceOptionId: "option7",
    });
  }
  if (state.run.economy.researchedTechnologies.includes("rocketComposites")) {
    items.push({
      id: "space-mining-launch-pad",
      label: rocketText(locale, "launchPadTitle"),
      sourceOptionId: "option1",
    });
    for (const id of ROCKET_IDS) {
      const rocket = state.run.space.rockets[id];
      if (state.run.space.launchPadBuilt && rocket.builtParts >= ROCKET_PART_REQUIREMENTS[id]) {
        const rocketIndex = (Number(id.slice(-1)) || 1) as 1 | 2 | 3 | 4;
        items.push({
          id: `space-mining-rocket-${rocketIndex}`,
          label: rocketText(locale, "rocketLabel", { index: rocketIndex }),
          sourceOptionId: `option${rocketIndex + 1}` as `option${number}`,
        });
      }
    }
  }
  return items.map((item) => ({ ...item, panelId: "panel-space-mining" }));
}

export const COSMIC_RIP_PANE_IDS = [
  "cosmic-rip-situation",
  "cosmic-rip-scanner-array",
  "cosmic-rip-rip",
] as const;

export type CosmicRipPaneId = (typeof COSMIC_RIP_PANE_IDS)[number];

export function cosmicRipPaneItems(
  locale: LocaleId,
  state: GameState,
): readonly PaneNavigationItem[] {
  const copy = cosmicRipText(locale);
  const items: PaneNavigationItem[] = [
    {
      id: "cosmic-rip-situation",
      label: copy.situationTitle,
      sourceOptionId: "option1",
    },
  ];
  if (state.permanent.cosmicRip.scannerRestored) {
    items.push({
      id: "cosmic-rip-scanner-array",
      label: copy.scannerArrayTitle,
      sourceOptionId: "option2",
    });
  }
  if (state.permanent.cosmicRip.ripFound) {
    items.push({ id: "cosmic-rip-rip", label: copy.title, sourceOptionId: "option3" });
  }
  return items;
}
