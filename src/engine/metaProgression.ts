import { MATERIAL_IDS, autobuyerUpgradeId, type SystemId } from "../content/ids";
import { COMPOUND_CATALOG, MATERIAL_CATALOG } from "../content/economy";
import { TECHNOLOGY_CATALOG } from "../content/technology";
import {
  ascendencyPerkCost,
  ascendencyPerkLevel,
  ascendencyPerkMaxed,
  isAscendencyPerkId,
  type AscendencyPerkId,
} from "../content/ascendency";
import { initializeStarWeather } from "./weather";
import { createInitialGameState, type GameState } from "./state";
import { ensureDiscoveredStarSystemProfiles } from "./starSystemProfiles";
import {
  applyGalacticMarketCommand,
  checkGalacticMarketCommand,
  isGalacticMarketCommand,
  type GalacticMarketCommand,
  type GalacticMarketEvent,
  type GalacticMarketFailure,
} from "./galacticMarket";
import { resumeBlackHoleCharge } from "./blackHole";
import { restoreMegastructureProgressOnRebirth } from "./megastructures";
import { unlockCosmicRip, type CosmicRipEvent } from "./cosmicRip";

export type MetaProgressionCommand =
  | { readonly type: "meta.rebirth" }
  | { readonly type: "meta.miaplacidus-story.acknowledge" }
  | { readonly type: "meta.perk.purchase"; readonly perkId: AscendencyPerkId }
  | GalacticMarketCommand;

export type MetaProgressionFailure =
  | {
      readonly code:
        | "rebirth-not-awarded"
        | "rebirth-no-destination"
        | "rebirth-current-destination"
        | "rebirth-busy"
        | "miaplacidus-story-not-pending";
      readonly messageKey:
        | "meta.rebirth.not-awarded"
        | "meta.rebirth.no-destination"
        | "meta.rebirth.current-destination"
        | "meta.rebirth.busy"
        | "meta.miaplacidus-story.not-pending";
    }
  | { readonly code: "insufficient-ap"; readonly messageKey: "meta.ap.insufficient" }
  | { readonly code: "perk-maxed"; readonly messageKey: "meta.perk.maxed" }
  | GalacticMarketFailure;

export type MetaProgressionEvent =
  | { readonly type: "meta.miaplacidus-story.acknowledged" }
  | {
      readonly type: "meta.rebirth.completed";
      readonly rebirthCount: number;
      readonly startingSystemId: SystemId;
      readonly ascendencyPointsRetained: number;
      readonly gloryPointsGained: number;
    }
  | {
      readonly type: "meta.perk.purchased";
      readonly perkId: AscendencyPerkId;
      readonly level: number;
      readonly cost: number;
    }
  | GalacticMarketEvent
  | CosmicRipEvent;

export function isMetaProgressionCommand(value: {
  readonly type: string;
}): value is MetaProgressionCommand {
  return (
    value.type === "meta.rebirth" ||
    value.type === "meta.miaplacidus-story.acknowledge" ||
    value.type === "meta.perk.purchase" ||
    isGalacticMarketCommand(value)
  );
}

export function checkMetaProgressionCommand(
  state: GameState,
  command: MetaProgressionCommand,
): MetaProgressionFailure | null {
  if (isGalacticMarketCommand(command)) return checkGalacticMarketCommand(state, command);
  if (command.type === "meta.rebirth") {
    const destination = state.permanent.settledSystemIds.at(-1);
    const busy = Object.values(state.run.timers).some(
      (timer) =>
        timer.status === "running" && (timer.domain === "battle" || timer.domain === "travel"),
    );
    if (busy) return { code: "rebirth-busy", messageKey: "meta.rebirth.busy" };
    if (!state.run.space.ascendencyAwardedThisRun)
      return { code: "rebirth-not-awarded", messageKey: "meta.rebirth.not-awarded" };
    if (destination === undefined)
      return { code: "rebirth-no-destination", messageKey: "meta.rebirth.no-destination" };
    if (destination === state.run.space.currentSystemId)
      return {
        code: "rebirth-current-destination",
        messageKey: "meta.rebirth.current-destination",
      };
    return null;
  }
  if (command.type === "meta.miaplacidus-story.acknowledge") {
    return state.permanent.megastructures.miaplacidusStoryPending
      ? null
      : {
          code: "miaplacidus-story-not-pending",
          messageKey: "meta.miaplacidus-story.not-pending",
        };
  }
  if (!isAscendencyPerkId(command.perkId))
    return { code: "perk-maxed", messageKey: "meta.perk.maxed" };
  if (ascendencyPerkMaxed(state.permanent.acquiredPerks, command.perkId))
    return { code: "perk-maxed", messageKey: "meta.perk.maxed" };
  const cost = ascendencyPerkCost(state.permanent.acquiredPerks, command.perkId);
  return state.permanent.ascendencyPoints >= cost
    ? null
    : { code: "insufficient-ap", messageKey: "meta.ap.insufficient" };
}

function applyRebirth(state: GameState): { state: GameState; event: MetaProgressionEvent } {
  const startingSystemId = state.permanent.settledSystemIds.at(-1)! as SystemId;
  const expansionistExtraSystemIds = state.run.expansionistExtraSystemIds.filter(
    (systemId) => !state.permanent.settledSystemIds.includes(systemId),
  );
  const gloryPointsGained = 1 + expansionistExtraSystemIds.length;
  const settledSystemIds = [
    ...state.permanent.settledSystemIds.filter((systemId) => systemId !== startingSystemId),
    ...expansionistExtraSystemIds,
    startingSystemId,
  ];
  const seed = (state.run.random.seed + state.permanent.rebirthCount + 1) % 2_147_483_647;
  const fresh = createInitialGameState({
    pioneerName: state.run.pioneerName,
    seed,
    locale: state.settings.locale,
  });
  const profiles = ensureDiscoveredStarSystemProfiles(
    state.run.space.systemProfiles,
    startingSystemId,
    0,
  );
  let run: GameState["run"] = {
    ...fresh.run,
    random: { ...fresh.run.random, seed },
    newsTicker: state.run.newsTicker,
    economy: {
      ...fresh.run.economy,
      resourceAllocation: state.run.economy.resourceAllocation,
      autoCreateEnabled: state.run.economy.autoCreateEnabled,
      researchAutobuyerEnabled: state.permanent.acquiredPerks.includes("roboticResearchAutomation")
        ? state.run.economy.researchAutobuyerEnabled
        : fresh.run.economy.researchAutobuyerEnabled,
    },
    space: {
      ...fresh.run.space,
      currentSystemId: startingSystemId,
      systemProfiles: profiles,
      autoTelescopeUnlocked: state.permanent.acquiredPerks.includes("autoSpaceTelescope"),
      autoTelescopeEnabled: state.permanent.acquiredPerks.includes("autoSpaceTelescope")
        ? state.run.space.autoTelescopeEnabled
        : fresh.run.space.autoTelescopeEnabled,
      autoTelescopeMode: state.permanent.acquiredPerks.includes("autoSpaceTelescope")
        ? state.run.space.autoTelescopeMode
        : fresh.run.space.autoTelescopeMode,
    },
  };
  if (state.permanent.acquiredPerks.includes("jumpstartResearch")) {
    const researched = new Set<string>();
    let changed = true;
    while (changed) {
      changed = false;
      for (const technology of TECHNOLOGY_CATALOG) {
        if (
          technology.price <= 4_200 &&
          !researched.has(technology.id) &&
          technology.requires.every((required) => researched.has(required))
        ) {
          researched.add(technology.id);
          changed = true;
        }
      }
    }
    const researchedTechnologies = TECHNOLOGY_CATALOG.filter((technology) =>
      researched.has(technology.id),
    ).map((technology) => technology.id);
    const unlockedCompounds = Object.values(COMPOUND_CATALOG)
      .filter((compound) => researched.has(compound.unlockTechId))
      .map((compound) => compound.id);
    run = {
      ...run,
      economy: {
        ...run.economy,
        researchedTechnologies,
        unlockedCompounds,
        revealedTechnologies: TECHNOLOGY_CATALOG.filter(
          (technology) => 50 > technology.revealThreshold || researched.has(technology.id),
        ).map((technology) => technology.id),
      },
    };
  }
  let next: GameState = {
    ...fresh,
    run,
    permanent: {
      ...state.permanent,
      rebirthCount: state.permanent.rebirthCount + 1,
      gloryPoints: state.permanent.gloryPoints + gloryPointsGained,
      galacticCasino: {
        ...state.permanent.galacticCasino,
        casinoPoints: 0,
        wheelSpecialPending: false,
        higherLower: null,
      },
      settledSystemIds,
    },
    settings: state.settings,
    statistics: state.statistics,
  };
  next = resumeBlackHoleCharge(next).state;
  next = restoreMegastructureProgressOnRebirth(next);
  run = next.run;

  if (state.permanent.acquiredPerks.includes("littleBagOfHydrogen")) {
    run = {
      ...next.run,
      goods: {
        ...next.run.goods,
        hydrogen: {
          ...next.run.goods.hydrogen,
          quantity: MATERIAL_CATALOG.hydrogen.buyerTiers[0].price,
        },
      },
    };
  }
  if (state.permanent.acquiredPerks.includes("nonExhaustiveResources")) {
    const goods = { ...run.goods };
    const autobuyerEnabled = { ...run.economy.autobuyerEnabled };
    for (const goodId of MATERIAL_IDS) {
      goods[goodId] = {
        ...goods[goodId],
        quantity: MATERIAL_CATALOG[goodId].buyerTiers[0].price,
        storageCapacity: Math.max(
          goods[goodId].storageCapacity,
          MATERIAL_CATALOG[goodId].buyerTiers[0].price,
        ),
      };
      autobuyerEnabled[autobuyerUpgradeId(goodId, 1)] = true;
    }
    run = {
      ...run,
      unlockedResources: MATERIAL_IDS,
      goods,
      economy: { ...run.economy, autobuyerEnabled },
    };
  }

  const weathered = initializeStarWeather({ ...next, run });
  return {
    state: weathered,
    event: {
      type: "meta.rebirth.completed",
      rebirthCount: weathered.permanent.rebirthCount,
      startingSystemId,
      ascendencyPointsRetained: weathered.permanent.ascendencyPoints,
      gloryPointsGained,
    },
  };
}

export function applyMetaProgressionCommand(
  state: GameState,
  command: MetaProgressionCommand,
): { readonly state: GameState; readonly events: readonly MetaProgressionEvent[] } {
  if (isGalacticMarketCommand(command)) return applyGalacticMarketCommand(state, command);
  if (command.type === "meta.rebirth") {
    const rebirth = applyRebirth(state);
    return { state: rebirth.state, events: [rebirth.event] };
  }
  if (command.type === "meta.miaplacidus-story.acknowledge") {
    const megastructures = state.permanent.megastructures;
    const unlocked = unlockCosmicRip({
      ...state,
      permanent: {
        ...state.permanent,
        megastructures: {
          ...megastructures,
          miaplacidusStoryPending: false,
          miaplacidusStoryShown: true,
        },
      },
    });
    return {
      state: unlocked.state,
      events: [{ type: "meta.miaplacidus-story.acknowledged" }, ...unlocked.events],
    };
  }
  const level = ascendencyPerkLevel(state.permanent.acquiredPerks, command.perkId);
  const cost = ascendencyPerkCost(state.permanent.acquiredPerks, command.perkId);
  const perkKey = command.perkId === "nanoBrokers" ? `nanoBrokers:${level + 1}` : command.perkId;
  return {
    state: {
      ...state,
      permanent: {
        ...state.permanent,
        ascendencyPoints: state.permanent.ascendencyPoints - cost,
        acquiredPerks: [...state.permanent.acquiredPerks, perkKey],
      },
    },
    events: [{ type: "meta.perk.purchased", perkId: command.perkId, level: level + 1, cost }],
  };
}
