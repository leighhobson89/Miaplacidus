import {
  FLEET_BUILD_COST_GROWTH,
  FLEET_COMBAT_REPEATABLE_FACTOR,
  HANGAR_AUTOMATION_COST_FACTOR,
  PLAYER_FLEET_BASE_HEALTH,
  PLAYER_FLEETS,
  type PlayerFleetId,
  type SpacePurchaseCost,
  type StarSystemEncounter,
} from "../content/space";
import { permanentPerkPurchaseCount, scaledPriceAfterPurchases } from "../content/economyRules";
import type { GameState } from "./state";

export interface PlayerFleetUnitStats {
  readonly attackPower: number;
  readonly defensePower: number;
  readonly speed: number;
  readonly maxHealth: number;
  readonly bonusPercentage: number;
  readonly bonusAgainstType: "air" | "land" | "sea";
  readonly bonusRemovedByTrait: "aerialians" | "terrans" | "aquatic";
}

/**
 * The source compounds these repeatables for ships built after each purchase.
 * Existing ships keep the strength already counted in their per-class totals.
 */
export function playerFleetUnitStats(
  state: GameState,
  fleetId: PlayerFleetId,
): PlayerFleetUnitStats {
  const definition = PLAYER_FLEETS[fleetId];
  const perks = state.permanent.acquiredPerks;
  const attackLevel = permanentPerkPurchaseCount(perks, "laserIntensityResearch");
  const speedLevel = permanentPerkPurchaseCount(perks, "antimatterEngineMinaturization");
  const healthLevel = permanentPerkPurchaseCount(perks, "syntheticPlating");
  return {
    attackPower: definition.baseAttackStrength * FLEET_COMBAT_REPEATABLE_FACTOR ** attackLevel,
    defensePower: definition.defenseStrength,
    speed: definition.speed * FLEET_COMBAT_REPEATABLE_FACTOR ** speedLevel,
    maxHealth: PLAYER_FLEET_BASE_HEALTH * FLEET_COMBAT_REPEATABLE_FACTOR ** healthLevel,
    bonusPercentage: definition.bonusPercentage,
    bonusAgainstType: definition.bonusAgainstType,
    bonusRemovedByTrait: definition.bonusRemovedByTrait,
  };
}

/** Price for the next ship in one class, including the source 1.13 curve. */
export function playerFleetBuildCost(state: GameState, fleetId: PlayerFleetId): SpacePurchaseCost {
  const definition = PLAYER_FLEETS[fleetId];
  const quantity = state.run.space.playerFleets[fleetId];
  const discountCount = permanentPerkPurchaseCount(
    state.permanent.acquiredPerks,
    "hangarAutomation",
  );
  const discount = HANGAR_AUTOMATION_COST_FACTOR ** discountCount;
  const price = (base: number) =>
    scaledPriceAfterPurchases(base * discount, quantity, FLEET_BUILD_COST_GROWTH);
  return {
    cash: price(definition.baseCost.cash),
    materials: definition.baseCost.materials.map((item) => ({
      ...item,
      amount: price(item.amount),
    })),
  };
}

export function totalPlayerFleetPower(
  totals: GameState["run"]["space"]["playerFleetCombatTotals"],
): { readonly attackPower: number; readonly defensePower: number } {
  return Object.values(totals).reduce(
    (sum, fleet) => ({
      attackPower: sum.attackPower + fleet.attackPower,
      defensePower: sum.defensePower + fleet.defensePower,
    }),
    { attackPower: 0, defensePower: 0 },
  );
}

/** Source battle strength weights air, land, and sea ships by 2, 4, and 6. */
export function enemyFleetPower(fleets: StarSystemEncounter["enemyFleets"]): number {
  return Math.floor(fleets.air * 2 + fleets.land * 4 + fleets.sea * 6);
}
