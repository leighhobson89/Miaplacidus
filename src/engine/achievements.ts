import {
  ACHIEVEMENT_CATALOGUE,
  type AchievementId,
  type AchievementReward,
} from "../content/achievements";
import { ECONOMIC_GOOD_IDS, GALAXY_SEED_DEFAULT } from "../content/ids";
import { createStarCatalogue, HOME_SYSTEM_NAME } from "../content/starCatalogue";
import { TECHNOLOGY_CATALOG } from "../content/technology";
import { THEME_IDS, isThemeId } from "../content/themes";
import type { GameState } from "./state";

export interface AchievementUnlockedEvent {
  readonly type: "achievement.unlocked";
  readonly achievementId: AchievementId;
}

const BOUNDED_RESOURCE_CAP = 1_000_000_000_000;

function event(events: readonly { readonly type: string }[], type: string): boolean {
  return events.some((entry) => entry.type === type);
}

function unlocked(state: GameState, id: AchievementId): boolean {
  return (
    state.run.achievements.unlockedIds.includes(id) ||
    state.permanent.achievements.unlockedIds.includes(id)
  );
}

function currentSystemProfile(state: GameState) {
  const currentSystemId = state.run.space.currentSystemId;
  const currentStar = createStarCatalogue(GALAXY_SEED_DEFAULT).find(
    (star) =>
      star.id === currentSystemId ||
      star.name.toLocaleLowerCase("en") === currentSystemId.toLocaleLowerCase("en"),
  );
  const profileId = currentStar?.id ?? currentSystemId;
  return state.run.space.systemProfiles.find((profile) => profile.systemId === profileId);
}

function completedRunOnMiaplacidus(
  previous: GameState,
  events: readonly { readonly type: string }[],
): boolean {
  if (!event(events, "meta.rebirth.completed")) return false;
  const currentSystem = previous.run.space.currentSystemId;
  const homeSystem = createStarCatalogue(GALAXY_SEED_DEFAULT).find(
    (star) => star.specialRole === "home" || star.name === HOME_SYSTEM_NAME,
  );
  return (
    homeSystem !== undefined &&
    (currentSystem === homeSystem.id ||
      currentSystem.toLocaleLowerCase("en") === HOME_SYSTEM_NAME.toLocaleLowerCase("en"))
  );
}

function qualifies(
  previous: GameState,
  state: GameState,
  events: readonly { readonly type: string }[],
  id: AchievementId,
): boolean {
  const space = state.run.space;
  switch (id) {
    case "collect50Hydrogen":
      return state.run.goods.hydrogen.quantity >= 50;
    case "collect1000Hydrogen":
      return state.run.goods.hydrogen.quantity >= 1_000;
    case "collect5000Carbon":
      return state.run.goods.carbon.quantity >= 5_000;
    case "collect50000Iron":
      return state.run.goods.iron.quantity >= 50_000;
    case "collect100Precipitation":
      return event(events, "precipitation.collected") && space.precipitationCollectedThisRun >= 100;
    case "fuseElement":
      return event(events, "economy.fusion.completed");
    case "createSteel":
      return (
        event(events, "compound.created") &&
        events.some(
          (entry) =>
            entry.type === "compound.created" && "goodId" in entry && entry.goodId === "steel",
        )
      );
    case "createTitanium":
      return (
        event(events, "compound.created") &&
        events.some(
          (entry) =>
            entry.type === "compound.created" && "goodId" in entry && entry.goodId === "titanium",
        )
      );
    case "unlockCompounds":
      return state.run.economy.unlockedCompounds.length > 0;
    case "researchTechnology":
      return (
        event(events, "technology.researched") ||
        state.run.economy.researchedTechnologies.length > 0
      );
    case "researchAllTechnologies":
      return TECHNOLOGY_CATALOG.every((technology) =>
        state.run.economy.researchedTechnologies.includes(technology.id),
      );
    case "achieve100FusionEfficiency":
      return state.run.economy.researchedTechnologies.includes("fusionEfficiencyIII");
    case "have50HoursWithOnePioneer":
      return state.statistics.lifetimeActiveMs >= 50 * 60 * 60 * 1_000;
    case "buildPowerPlant":
      return (state.run.upgrades.powerPlant1 ?? 0) > 0;
    case "buildSolarPowerPlant":
      return (state.run.upgrades.powerPlant2 ?? 0) > 0;
    case "collect100TitaniumAsPrecipitation":
      return (
        currentSystemProfile(state)?.precipitationGoodId === "titanium" &&
        space.precipitationCollectedThisRun >= 100
      );
    case "gain100Cash":
      return state.run.cash >= 100;
    case "gain10000Cash":
      return state.run.cash >= 10_000;
    case "gain100000Cash":
      return state.run.cash >= 100_000;
    case "gain1000000Cash":
      return state.run.cash >= 1_000_000;
    case "seeAllNewsTickers":
      return state.run.newsTicker.seenIds.length >= 246;
    case "activateAllWackyNewsTickers":
      return state.run.newsTicker.activatedWackyIds.length >= 8;
    case "discoverLegendaryAsteroid":
      return (
        event(events, "space.asteroid.discovered") &&
        space.asteroids.some((asteroid) => asteroid.rarity === "legendary")
      );
    case "have4RocketsMiningAntimatter":
      return (
        Object.values(space.rockets).filter(
          (rocket) =>
            rocket.phase === "mining" &&
            !!rocket.targetAsteroidId &&
            space.asteroids.some(
              (asteroid) =>
                asteroid.id === rocket.targetAsteroidId && asteroid.remainingAntimatter > 0,
            ),
        ).length >= 4
      );
    case "tripPower":
      return state.run.economy.power.tripped;
    case "discoverAsteroid":
      return event(events, "space.asteroid.discovered");
    case "launchRocket":
      return event(events, "space.rocket.launched");
    case "mineAllAntimatterAsteroid":
      return events.some(
        (entry) =>
          entry.type === "space.asteroid.mined" &&
          "amount" in entry &&
          typeof entry.amount === "number" &&
          entry.amount > 0,
      );
    case "studyStar":
      return event(events, "space.stars.studied");
    case "studyStarMoreThan5LYAway":
      return event(events, "space.stars.studied") && space.starStudyRange > 5;
    case "studyStarMoreThan20LYAway":
      return event(events, "space.stars.studied") && space.starStudyRange > 20;
    case "launchStarship":
      return event(events, "space.starship.launched");
    case "performGalacticMarketTransaction":
      return event(events, "meta.market.traded");
    case "trade10APForCash":
      return events.some(
        (entry) =>
          entry.type === "meta.market.ap-sold" && "quantity" in entry && entry.quantity === 10,
      );
    case "initiateDiplomacyWithAlienRace":
      return event(events, "space.diplomacy.resolved");
    case "bullyEnemyIntoSubmission":
      return events.some(
        (entry) =>
          entry.type === "space.diplomacy.resolved" &&
          "outcome" in entry &&
          entry.outcome === "bullied",
      );
    case "vassalizeEnemy":
      return events.some(
        (entry) =>
          entry.type === "space.diplomacy.resolved" &&
          "outcome" in entry &&
          entry.outcome === "vassalized",
      );
    case "conquerEnemy":
      return events.some(
        (entry) =>
          entry.type === "space.battle.finished" && "result" in entry && entry.result === "victory",
      );
    case "conquerHiveMindEnemy":
      return events.some(
        (entry) =>
          entry.type === "space.battle.finished" &&
          "result" in entry &&
          entry.result === "victory" &&
          "systemId" in entry &&
          state.run.space.systemEncounters.some(
            (encounter) =>
              encounter.systemId === entry.systemId &&
              encounter.lifeformTraits.includes("hiveMind"),
          ),
      );
    case "conquerBelligerentEnemy":
      return events.some(
        (entry) =>
          entry.type === "space.battle.finished" &&
          "result" in entry &&
          entry.result === "victory" &&
          "systemId" in entry &&
          state.run.space.systemEncounters.some(
            (encounter) =>
              encounter.systemId === entry.systemId && encounter.attitude === "belligerent",
          ),
      );
    case "conquerEnemyWithoutScanning":
      return events.some(
        (entry) =>
          entry.type === "space.battle.finished" &&
          "result" in entry &&
          entry.result === "victory" &&
          "scannerBuilt" in entry &&
          entry.scannerBuilt === false,
      );
    case "settleUnoccupiedSystem":
      return events.some(
        (entry) =>
          entry.type === "space.system.settled" &&
          "systemId" in entry &&
          state.run.space.systemEncounters.some(
            (encounter) =>
              encounter.systemId === entry.systemId && encounter.civilizationLevel === "unsentient",
          ),
      );
    case "discoverSystemWithNoLife":
      return events.some(
        (entry) =>
          entry.type === "space.starship.system.scanned" &&
          "systemId" in entry &&
          !state.run.space.systemEncounters.some(
            (encounter) => encounter.systemId === entry.systemId && encounter.lifeDetected,
          ),
      );
    case "settleSystem":
      return event(events, "space.system.settled");
    case "spendAP":
      return event(events, "meta.perk.purchased");
    case "liquidateAllAssets":
      return event(events, "meta.market.liquidated");
    case "rebirth":
      return event(events, "meta.rebirth.completed");
    case "conquer10StarSystems":
      return state.permanent.rebirthCount >= 10;
    case "conquer50StarSystems":
      return state.permanent.rebirthCount >= 50;
    case "studyAllStarsInOneRun":
      return space.starStudyRange >= 100 && createStarCatalogue().length > 0;
    case "adoptPhilosophy":
      return event(events, "philosophy.selected");
    case "discoverBlackHole":
      return event(events, "black-hole.discovery-checked") && state.permanent.blackHole.discovered;
    case "activateBlackHoleOver10x":
      return event(events, "black-hole.warp-activated") && state.permanent.blackHole.power > 10;
    case "findAncientManuscript":
      return event(events, "space.manuscript.reported");
    case "conquerMegastructureSystem":
      return (
        event(events, "space.system.conquered") &&
        state.permanent.megastructures.conquestRewardClaimed
      );
    case "bringDownMiaplacideanForceField":
      return event(events, "megastructure.force-field-breached");
    case "completeGame":
      return state.permanent.cosmicRip.closed;
    case "completeRunOnMiaplacidus":
      return completedRunOnMiaplacidus(previous, events);
    case "haveFleetSizeOf50EachShipType":
      return Object.values(space.playerFleets).every((quantity) => quantity >= 50);
    case "tryAllThemes":
      return THEME_IDS.every((themeId) =>
        state.permanent.achievements.themeIdsTried.includes(themeId),
      );
    case "buyCasinoPoints":
      return state.run.casinoStats.cpSpent > 0;
    case "winAllCasinoGames":
      return (
        state.run.casinoStats.doubleOrNothingWon > 0 &&
        state.run.casinoStats.wheelWon > 0 &&
        state.run.casinoStats.higherLowerWon > 0 &&
        state.run.casinoStats.voidSeerWon > 0
      );
    case "winWheelSpecialPrize":
      return state.run.casinoStats.wheelSpecialWon > 0;
    case "restoreNearSpaceScannerArray":
      return event(events, "cosmic-rip.scanner-restored");
    case "findCosmicRip":
      return event(events, "cosmic-rip.found");
    case "gain1MTelemetryData":
      return state.permanent.cosmicRip.telemetryData >= 1_000_000;
    case "closeCosmicRip":
      return event(events, "cosmic-rip.closed");
    case "suffer5NegativeEvents":
      return state.run.randomEvents.history.filter((entry) => entry.negative).length >= 5;
    case "enjoyEndlessSummer":
      return (
        event(events, "random-event.triggered") &&
        events.some(
          (entry) =>
            entry.type === "random-event.triggered" &&
            "id" in entry &&
            entry.id === "endlessSummer",
        )
      );
    case "completeOnboarding":
      return event(events, "onboarding.completed");
  }
}

function doubleGoods(state: GameState, compounds: boolean): GameState {
  const goods = { ...state.run.goods };
  for (const goodId of ECONOMIC_GOOD_IDS) {
    const isCompound = ["diesel", "glass", "steel", "concrete", "water", "titanium"].includes(
      goodId,
    );
    if (isCompound !== compounds) continue;
    goods[goodId] = {
      ...goods[goodId],
      quantity: Math.min(goods[goodId].storageCapacity, goods[goodId].quantity * 2),
    };
  }
  return { ...state, run: { ...state.run, goods } };
}

function applyReward(state: GameState, reward: AchievementReward, permanent: boolean): GameState {
  switch (reward.type) {
    case "none":
      return state;
    case "cash":
      return {
        ...state,
        run: { ...state.run, cash: Math.min(BOUNDED_RESOURCE_CAP, state.run.cash + reward.amount) },
      };
    case "ascendency-points":
      return {
        ...state,
        permanent: {
          ...state.permanent,
          ascendencyPoints: Math.min(
            BOUNDED_RESOURCE_CAP,
            state.permanent.ascendencyPoints + reward.amount,
          ),
        },
      };
    case "glory-points":
      return {
        ...state,
        permanent: {
          ...state.permanent,
          gloryPoints: Math.min(BOUNDED_RESOURCE_CAP, state.permanent.gloryPoints + reward.amount),
        },
      };
    case "antimatter":
      return {
        ...state,
        run: {
          ...state.run,
          space: {
            ...state.run.space,
            antimatter: Math.min(BOUNDED_RESOURCE_CAP, state.run.space.antimatter + reward.amount),
          },
        },
      };
    case "good": {
      const good = state.run.goods[reward.goodId];
      return {
        ...state,
        run: {
          ...state.run,
          goods: {
            ...state.run.goods,
            [reward.goodId]: {
              ...good,
              quantity: Math.min(good.storageCapacity, good.quantity + reward.amount),
            },
          },
        },
      };
    }
    case "double-resources":
      return doubleGoods(state, false);
    case "double-compounds":
      return doubleGoods(state, true);
    case "resource-rate": {
      if (permanent) {
        const owner = state.permanent.achievements;
        const updated = {
          ...owner,
          bonuses: {
            ...owner.bonuses,
            resourceRateMultiplier: Math.min(
              1_000_000,
              owner.bonuses.resourceRateMultiplier * reward.multiplier,
            ),
            resourceRateAdditive: Math.min(
              1_000_000,
              owner.bonuses.resourceRateAdditive + (reward.permanentBonus ?? 0),
            ),
          },
        };
        return { ...state, permanent: { ...state.permanent, achievements: updated } };
      }
      const owner = state.run.achievements;
      const updated = {
        ...owner,
        bonuses: {
          ...owner.bonuses,
          resourceRateMultiplier: Math.min(
            1_000_000,
            owner.bonuses.resourceRateMultiplier * reward.multiplier,
          ),
          resourceRateAdditive: Math.min(
            1_000_000,
            owner.bonuses.resourceRateAdditive + (reward.permanentBonus ?? 0),
          ),
        },
      };
      return { ...state, run: { ...state.run, achievements: updated } };
    }
    case "sale-value": {
      const goods = Object.fromEntries(
        ECONOMIC_GOOD_IDS.map((id) => [
          id,
          {
            ...state.run.goods[id],
            saleValue: Math.min(
              BOUNDED_RESOURCE_CAP,
              state.run.goods[id].saleValue * reward.multiplier,
            ),
          },
        ]),
      ) as GameState["run"]["goods"];
      return { ...state, run: { ...state.run, goods } };
    }
    case "compound-recipe-cost": {
      if (permanent) {
        const owner = state.permanent.achievements;
        const updated = {
          ...owner,
          bonuses: {
            ...owner.bonuses,
            compoundRecipeCostMultiplier: Math.max(
              0.01,
              owner.bonuses.compoundRecipeCostMultiplier * reward.multiplier,
            ),
          },
        };
        return { ...state, permanent: { ...state.permanent, achievements: updated } };
      }
      const owner = state.run.achievements;
      const updated = {
        ...owner,
        bonuses: {
          ...owner.bonuses,
          compoundRecipeCostMultiplier: Math.max(
            0.01,
            owner.bonuses.compoundRecipeCostMultiplier * reward.multiplier,
          ),
        },
      };
      return { ...state, run: { ...state.run, achievements: updated } };
    }
  }
}

/** Run once after every accepted transition. The saved ID set is the idempotency key. */
export function applyAchievementBoundary(
  previous: GameState,
  next: GameState,
  events: readonly { readonly type: string }[],
): { readonly state: GameState; readonly events: readonly AchievementUnlockedEvent[] } {
  let state = next;
  const unlockedEvents: AchievementUnlockedEvent[] = [];
  if (previous.settings.themeId !== next.settings.themeId && isThemeId(next.settings.themeId)) {
    const tried = state.permanent.achievements.themeIdsTried;
    if (!tried.includes(next.settings.themeId)) {
      state = {
        ...state,
        permanent: {
          ...state.permanent,
          achievements: {
            ...state.permanent.achievements,
            themeIdsTried: [...tried, next.settings.themeId],
          },
        },
      };
    }
  }
  for (const definition of ACHIEVEMENT_CATALOGUE) {
    if (unlocked(state, definition.id) || !qualifies(previous, state, events, definition.id))
      continue;
    if (definition.resetOnRebirth) {
      const updated = {
        ...state.run.achievements,
        unlockedIds: [...state.run.achievements.unlockedIds, definition.id],
      };
      state = { ...state, run: { ...state.run, achievements: updated } };
    } else {
      const updated = {
        ...state.permanent.achievements,
        unlockedIds: [...state.permanent.achievements.unlockedIds, definition.id],
      };
      state = { ...state, permanent: { ...state.permanent, achievements: updated } };
    }
    state = applyReward(state, definition.reward, !definition.resetOnRebirth);
    unlockedEvents.push({ type: "achievement.unlocked", achievementId: definition.id });
  }
  // The state comparison is intentionally explicit: empty or rejected transitions cannot award.
  void previous;
  return { state, events: unlockedEvents };
}

export function achievementResourceRateMultiplier(state: GameState): number {
  const permanent = state.permanent.achievements.bonuses;
  const currentRun = state.run.achievements.bonuses;
  return (
    (permanent.resourceRateMultiplier + permanent.resourceRateAdditive) *
    (currentRun.resourceRateMultiplier + currentRun.resourceRateAdditive)
  );
}

export function achievementCompoundCostMultiplier(state: GameState): number {
  return (
    state.permanent.achievements.bonuses.compoundRecipeCostMultiplier *
    state.run.achievements.bonuses.compoundRecipeCostMultiplier
  );
}
