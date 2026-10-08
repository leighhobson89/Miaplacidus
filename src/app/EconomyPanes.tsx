import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import {
  COMPOUND_CATALOG,
  ENERGY_BUILDINGS,
  MATERIAL_CATALOG,
  SCIENCE_BUILDINGS,
  BASE_STORAGE_MULTIPLIER,
  type MaterialDefinition,
} from "../content/economy";
import {
  autobuyerUpgradeId,
  type EconomicGoodId,
  type MaterialId,
  type TechId,
} from "../content/ids";
import {
  repeatedPerkMultiplier,
  scaledPriceAfterPurchases,
  permanentPerkPurchaseCount,
  storageCapacityAfterPurchase,
  storagePurchaseCost,
  type SaleSelection,
} from "../content/economyRules";
import { displayCurrency } from "../engine/precision";
import { createEconomyTickPlan, type EconomyTickPlan } from "../engine/economySimulation";
import { formatCurrency } from "./currencyFormatting";
import { formatNumber } from "./numberFormatting";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { MEGASTRUCTURE_TECHNOLOGY_IDS, TECHNOLOGY_CATALOG } from "../content/technology";
import { TECHNOLOGY_NAMES } from "../content/technologyNames";
import { ECONOMY_BUILDING_NAMES } from "../content/economyBuildingNames";
import { TECHNOLOGY_DESCRIPTIONS } from "../content/technologyDescriptions";
import { economyLabel, formatEconomyMessage } from "../i18n/economyMessages";
import { translate } from "../i18n/messages";
import { checkPreconditions, type CommandFailure } from "../engine/commands";
import {
  selectAutobuyerBuyMax,
  selectBuildingBuyMax,
  selectCompoundCreation,
  selectEconomyAction,
  selectFusionPreview,
  selectGoodSale,
} from "../engine/selectors";
import { philosophyCompoundRecipe, philosophyRepeatableRank } from "../engine/philosophy";
import { PhilosophyPane } from "./PhilosophyPane";
import { EconomicGoodEmblem } from "./EconomicGoodEmblem";
import { EconomyStructureEmblem } from "./EconomyStructureEmblem";
import { economyGoodName } from "./economyDisplay";
import { RESOURCE_PANE_ORDER } from "./presentationNavigation";
import { useGameNotifications } from "./NotificationStack";
import { dispatchEconomySale } from "./economySaleNotifications";

interface EconomyPanesProps {
  readonly tabId: string;
  readonly activePane: string;
  readonly state: GameState;
  readonly store: GameStore;
}

const SYMBOL: Record<EconomicGoodId, string> = {
  hydrogen: "H₂",
  helium: "He",
  carbon: "C",
  neon: "Ne",
  oxygen: "O₂",
  sodium: "Na",
  silicon: "Si",
  iron: "Fe",
  diesel: "C₂₆H₅₂",
  glass: "SiO₂",
  steel: "Fe+C",
  concrete: "SiO₂+CaCO₃",
  water: "H₂O",
  titanium: "Ti",
};

function format(state: GameState, value: number, digits = 2): string {
  return formatNumber(state.settings.locale, value, digits, state.settings.notation);
}
function money(state: GameState, value: number): string {
  return formatCurrency(
    state.settings.locale,
    Number(displayCurrency(value)),
    state.settings.currencyId ?? "usd",
    2,
    state.settings.notation,
  );
}
function name(locale: GameState["settings"]["locale"], id: EconomicGoodId): string {
  return economyGoodName(locale, id);
}
function techName(locale: GameState["settings"]["locale"], id: string): string {
  const technology = TECHNOLOGY_NAMES[id as keyof typeof TECHNOLOGY_NAMES];
  if (technology) return technology[locale];
  const building = ECONOMY_BUILDING_NAMES[id as keyof typeof ECONOMY_BUILDING_NAMES];
  if (building) return building[locale];
  return id.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
}
function count(state: GameState, id: string): number {
  return state.run.upgrades[id as keyof typeof state.run.upgrades] ?? 0;
}
function isPerkAvailable(state: GameState, level: number): boolean {
  return state.permanent.acquiredPerks.some((perk) => {
    if (perk === "nanoBrokers") return level <= 1;
    if (!perk.startsWith("nanoBrokers:")) return false;
    return Number(perk.split(":")[1]) >= level;
  });
}
function isResearchAutomationAvailable(state: GameState): boolean {
  return state.permanent.acquiredPerks.includes("roboticResearchAutomation");
}
function isBulkPurchasingAvailable(state: GameState): boolean {
  return state.permanent.acquiredPerks.includes("bulkPurchasing");
}
function availableTier(tier: number): TechId | null {
  if (tier === 2) return "quantumComputing";
  if (tier === 4) return "rocketComposites";
  return null;
}

function economyActionReason(state: GameState, failure?: CommandFailure): string | null {
  if (!failure) return null;
  const locale = state.settings.locale;
  if (failure.code === "inventory-full") return economyLabel(locale, "collectStorageFull");
  if (failure.code === "no-stock")
    return formatEconomyMessage(locale, "saleNoStock", { good: name(locale, failure.goodId) });
  if (failure.code === "insufficient-material")
    return formatEconomyMessage(locale, "needGoodAmount", {
      amount: format(state, failure.required),
      good: name(locale, failure.goodId),
    });
  if (failure.code === "insufficient-cash")
    return formatEconomyMessage(locale, "needCashAmount", {
      amount: money(state, failure.required),
    });
  return economyLabel(locale, "purchaseUnavailable");
}

function buyMaxPreview(state: GameState, count: number, costs: string, result: string): string {
  return formatEconomyMessage(state.settings.locale, "buyMaxPreview", {
    count: format(state, count),
    costs,
    result,
  });
}

function EconomicGoodHero({
  id,
  state,
  rate,
  blocked,
  children,
}: {
  readonly id: EconomicGoodId;
  readonly state: GameState;
  readonly rate: number;
  readonly blocked: boolean;
  readonly children: ReactNode;
}) {
  const locale = state.settings.locale;
  const good = state.run.goods[id];
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const hydrogenHeading = (
    key: "hydrogen.quantity" | "hydrogen.capacity" | "hydrogen.production",
  ) => translate(locale, key);
  return (
    <div className="hydrogen-hero economy-good-hero">
      <div className="hydrogen-overview">
        <div className="atom-art economy-good-art" aria-hidden="true">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="atom-core economy-good-art-core">
            <EconomicGoodEmblem goodId={id} />
          </span>
          <span className="atom-spark">{"\u2726"}</span>
        </div>
        <div className="stock-readout">
          <span className="eyebrow">{hydrogenHeading("hydrogen.quantity")}</span>
          <strong data-testid={`economy-good-quantity-${id}`}>
            {format(state, good.quantity)} <small>{SYMBOL[id]}</small>
          </strong>
          <span className="capacity-line">
            {hydrogenHeading("hydrogen.capacity")}{" "}
            <b data-testid={`economy-good-capacity-${id}`}>
              {format(state, good.storageCapacity, 0)}
            </b>
          </span>
          <meter
            className="capacity-track"
            aria-label={`${name(locale, id)} ${t("capacity")}`}
            min={0}
            max={good.storageCapacity}
            value={Math.min(good.quantity, good.storageCapacity)}
          >
            {format(state, good.quantity, 0)} / {format(state, good.storageCapacity, 0)}
          </meter>
        </div>
        <div className="rate-readout">
          <span className="eyebrow">{hydrogenHeading("hydrogen.production")}</span>
          <strong data-testid={`economy-good-rate-${id}`}>
            {rate >= 0 ? "+" : "−"}
            {format(state, Math.abs(rate), 2)}
            <small>{SYMBOL[id]}/s</small>
          </strong>
          {blocked && (
            <p className="red-disabled-text" data-testid={`production-blocked-${id}`}>
              {t("automaticProductionBlockedByStorage")}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function GoodStorageCard({
  id,
  state,
  store,
}: {
  readonly id: EconomicGoodId;
  readonly state: GameState;
  readonly store: GameStore;
}) {
  const locale = state.settings.locale;
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const good = state.run.goods[id];
  const storage = selectEconomyAction(state, { type: "storage.purchase", goodId: id });
  const storageReason = economyActionReason(state, storage.failure);
  const efficientStoragePurchases = permanentPerkPurchaseCount(
    state.permanent.acquiredPerks,
    "efficientStorage",
  );
  const nextCapacity = storageCapacityAfterPurchase(
    good.storageCapacity,
    efficientStoragePurchases,
    state.permanent.philosophyId === "constructor" && state.run.philosophyAbilityActive
      ? 5
      : BASE_STORAGE_MULTIPLIER,
  );
  const waterCost = id === "water" ? good.storageCapacity * 0.3 : 0;
  return (
    <article className="upgrade-card hydrogen-storage-card" data-testid={`storage-card-${id}`}>
      <div className="card-icon storage-icon" aria-hidden="true">
        {"\u25c8"}
      </div>
      <div className="card-copy">
        <h3>{t("storage")}</h3>
        <p>
          {t("capacity")}: {format(state, good.storageCapacity, 0)} {"\u2192"}{" "}
          {format(state, nextCapacity, 0)}
        </p>
        <span className="cost-line">
          <strong>
            {format(state, storagePurchaseCost(good.storageCapacity))} {SYMBOL[id]}
          </strong>
          {waterCost > 0 && (
            <>
              {" + "}
              <strong>
                {format(state, waterCost)} {name(locale, "concrete")}
              </strong>
            </>
          )}
        </span>
      </div>
      <div className="card-controls">
        <button
          type="button"
          className="secondary-button"
          disabled={!storage.enabled}
          aria-describedby={storageReason ? `good-${id}-storage-reason` : undefined}
          onClick={() => store.dispatch({ type: "storage.purchase", goodId: id })}
        >
          {t("increaseStorage")}
        </button>
        <span className="control-reason" id={`good-${id}-storage-reason`}>
          {storageReason ?? ""}
        </span>
      </div>
    </article>
  );
}

export function EconomyPanes({ tabId, activePane, state, store }: EconomyPanesProps) {
  if (tabId === "resources")
    return <ResourceCatalogue activePane={activePane} state={state} store={store} />;
  if (tabId === "research")
    return <ResearchPanel activePane={activePane} state={state} store={store} />;
  if (tabId === "energy")
    return <EnergyPanel activePane={activePane} state={state} store={store} />;
  if (tabId === "compounds")
    return <CompoundPanel activePane={activePane} state={state} store={store} />;
  return <p className="pane-intro">{economyLabel(state.settings.locale, "resources")}</p>;
}

function ResourceCatalogue({ activePane, state, store }: Omit<EconomyPanesProps, "tabId">) {
  const locale = state.settings.locale;
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const economyTick = createEconomyTickPlan(state);
  return (
    <section
      className="economy-section"
      aria-label={t("resources")}
      data-testid="economy-resource-cards"
      hidden={activePane === "resources-hydrogen"}
    >
      <div className="resource-subpanes">
        {RESOURCE_PANE_ORDER.filter((id) => id !== "hydrogen").map((id) => (
          <section
            key={id}
            id={`panel-resources-${id}`}
            className="subpane-panel resource-subpane"
            role="tabpanel"
            aria-labelledby={`tab-resources-${id}`}
            tabIndex={0}
            hidden={activePane !== `resources-${id}`}
          >
            {state.run.unlockedResources.includes(id) ? (
              <ResourceHeroCard id={id} state={state} store={store} economyTick={economyTick} />
            ) : (
              <div className="economy-card-grid">
                <ResourceCard id={id} state={state} store={store} economyTick={economyTick} />
              </div>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}

function ResourceCard({
  id,
  state,
  store,
  economyTick,
}: {
  id: MaterialId;
  state: GameState;
  store: GameStore;
  economyTick: EconomyTickPlan;
}) {
  const locale = state.settings.locale;
  const notify = useGameNotifications();
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const material = MATERIAL_CATALOG[id] as MaterialDefinition;
  const stock = state.run.goods[id];
  const isUnlocked = state.run.unlockedResources.includes(id);
  const [saleChoice, setSaleChoice] = useState("all");
  const selection =
    saleChoice === "all" || ["threeQuarters", "twoThirds", "half", "oneThird"].includes(saleChoice)
      ? (saleChoice as "all" | "threeQuarters" | "twoThirds" | "half" | "oneThird")
      : Number(saleChoice);
  const sale = selectGoodSale(state, id, selection);
  const unlocked = isUnlocked;
  const storageCost = storagePurchaseCost(stock.storageCapacity);
  const collect =
    id === "hydrogen" ? null : selectEconomyAction(state, { type: "resource.collect", goodId: id });
  const storage = selectEconomyAction(state, { type: "storage.purchase", goodId: id });
  const collectReason = economyActionReason(state, collect?.failure);
  const storageReason = economyActionReason(state, storage.failure);
  const saleReason = economyActionReason(state, sale.failure);
  return (
    <article className={`economy-card${unlocked ? "" : " is-locked"}`} data-resource-id={id}>
      <header className="economy-card-heading">
        <EconomicGoodEmblem goodId={id} />
        <div>
          <h3>{name(locale, id)}</h3>
          <p>{SYMBOL[id]}</p>
        </div>
        <strong>
          {format(state, stock.quantity)} / {format(state, stock.storageCapacity)}
        </strong>
      </header>
      {unlocked ? (
        <>
          <meter
            aria-label={`${name(locale, id)} ${t("capacity")}`}
            min={0}
            max={stock.storageCapacity}
            value={Math.min(stock.quantity, stock.storageCapacity)}
          />
          <p className="economy-rate">
            {format(state, economyTick.netRatesPerSecond[id] ?? 0, 2)} {t("perSecond")}
          </p>
          {economyTick.capacityBlockedGoodIds.includes(id) && (
            <p className="red-disabled-text" data-testid={`production-blocked-${id}`}>
              {t("automaticProductionBlockedByStorage")}
            </p>
          )}
          {id !== "hydrogen" && (
            <div className="economy-controls">
              <button
                type="button"
                className="primary-button"
                disabled={!collect?.enabled}
                aria-describedby={collectReason ? `resource-${id}-collect-reason` : undefined}
                onClick={() => store.dispatch({ type: "resource.collect", goodId: id })}
              >
                {t("collect")} {name(locale, id)}
              </button>
              {collectReason && (
                <p className="control-reason" id={`resource-${id}-collect-reason`}>
                  {collectReason}
                </p>
              )}
              <button
                type="button"
                className="secondary-button"
                disabled={!storage.enabled}
                aria-describedby={storageReason ? `resource-${id}-storage-reason` : undefined}
                onClick={() => store.dispatch({ type: "storage.purchase", goodId: id })}
              >
                {t("increaseStorage")} · {format(state, storageCost)} {SYMBOL[id]}
              </button>
              {storageReason && (
                <p className="control-reason" id={`resource-${id}-storage-reason`}>
                  {storageReason}
                </p>
              )}
            </div>
          )}
          <ResourceAutobuyerDetails id={id} state={state} store={store} />
          <AllocationControls id={id} state={state} store={store} />
          <div className="economy-good-footer">
            <div className="economy-sale-controls">
              <label>
                {t("saleAmount")}
                <select
                  aria-label={`${t("saleAmount")} ${name(locale, id)}`}
                  value={saleChoice}
                  onChange={(event) => setSaleChoice(event.currentTarget.value)}
                >
                  <option value="all">{t("sellAll")}</option>
                  <option value="threeQuarters">75%</option>
                  <option value="twoThirds">⅔</option>
                  <option value="half">50%</option>
                  <option value="oneThird">⅓</option>
                  <option value="1000">1,000</option>
                  <option value="100">100</option>
                  <option value="10">10</option>
                  <option value="1">1</option>
                </select>
              </label>
              <p>
                {t("salePreview")}: <strong>{money(state, sale.proceeds)}</strong>
              </p>
              <button
                type="button"
                className="secondary-button"
                disabled={!sale.enabled}
                aria-describedby={saleReason ? `resource-${id}-sell-reason` : undefined}
                onClick={() => dispatchEconomySale(state, store, id, selection, notify)}
              >
                {t("sell")} {name(locale, id)} · {money(state, sale.proceeds)}
              </button>
              {saleReason && (
                <p className="control-reason" id={`resource-${id}-sell-reason`}>
                  {saleReason}
                </p>
              )}
            </div>
            <ResourceFusionDetails id={id} state={state} store={store} alwaysOpen />
          </div>
        </>
      ) : (
        <p>
          {t("lockedBy")}: {techName(locale, material.fusionTechId ?? "hydrogenFusion")}
        </p>
      )}
    </article>
  );
}

function ResourceHeroCard({
  id,
  state,
  store,
  economyTick,
}: {
  readonly id: MaterialId;
  readonly state: GameState;
  readonly store: GameStore;
  readonly economyTick: EconomyTickPlan;
}) {
  const locale = state.settings.locale;
  const notify = useGameNotifications();
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const [saleChoice, setSaleChoice] = useState("all");
  const selection =
    saleChoice === "all" || ["threeQuarters", "twoThirds", "half", "oneThird"].includes(saleChoice)
      ? (saleChoice as "all" | "threeQuarters" | "twoThirds" | "half" | "oneThird")
      : Number(saleChoice);
  const sale = selectGoodSale(state, id, selection);
  const saleReason = economyActionReason(state, sale.failure);
  const collect = selectEconomyAction(state, { type: "resource.collect", goodId: id });
  const collectReason = economyActionReason(state, collect.failure);
  const rate = economyTick.netRatesPerSecond[id] ?? 0;
  return (
    <article className="resource-good-page" data-resource-id={id}>
      <div className="pane-heading">
        <div>
          <h2>{name(locale, id)}</h2>
        </div>
      </div>
      <EconomicGoodHero
        id={id}
        state={state}
        rate={rate}
        blocked={economyTick.capacityBlockedGoodIds.includes(id)}
      >
        <button
          type="button"
          className="primary-button collect-button"
          disabled={!collect.enabled}
          aria-describedby={collectReason ? `resource-${id}-collect-reason` : undefined}
          onClick={() => store.dispatch({ type: "resource.collect", goodId: id })}
        >
          {t("collect")} {name(locale, id)}
        </button>
        {collectReason && (
          <p className="control-reason" id={`resource-${id}-collect-reason`}>
            {collectReason}
          </p>
        )}
        <div className="hydrogen-sale-grid">
          <article className="sale-card hydrogen-sale-controls">
            <div className="card-copy">
              <h3>{t("sell")}</h3>
              <p>
                {t("salePreview")}: <strong>{money(state, sale.proceeds)}</strong>
              </p>
            </div>
            <div className="card-controls">
              <label htmlFor={`resource-${id}-sell-amount`}>{t("saleAmount")}</label>
              <select
                id={`resource-${id}-sell-amount`}
                aria-label={`${t("saleAmount")} ${name(locale, id)}`}
                value={saleChoice}
                onChange={(event) => setSaleChoice(event.currentTarget.value)}
              >
                <option value="all">{t("sellAll")}</option>
                <option value="threeQuarters">75%</option>
                <option value="twoThirds">â…”</option>
                <option value="half">50%</option>
                <option value="oneThird">â…“</option>
                <option value="1000">1,000</option>
                <option value="100">100</option>
                <option value="10">10</option>
                <option value="1">1</option>
              </select>
              <button
                type="button"
                className="secondary-button"
                disabled={!sale.enabled}
                aria-describedby={saleReason ? `resource-${id}-sell-reason` : undefined}
                onClick={() => dispatchEconomySale(state, store, id, selection, notify)}
              >
                {t("sell")} {name(locale, id)}
              </button>
              {saleReason && (
                <span className="control-reason" id={`resource-${id}-sell-reason`}>
                  {saleReason}
                </span>
              )}
            </div>
            <ResourceFusionDetails id={id} state={state} store={store} alwaysOpen />
          </article>
        </div>
      </EconomicGoodHero>
      <GoodStorageCard id={id} state={state} store={store} />
      <ResourceAutobuyerDetails id={id} state={state} store={store} />
      <AllocationControls id={id} state={state} store={store} />
    </article>
  );
}

export function HydrogenAutobuyerTiers({
  state,
  store,
}: Omit<EconomyPanesProps, "tabId" | "activePane">) {
  return <ResourceAutobuyerTiers id="hydrogen" state={state} store={store} />;
}

export function HydrogenAllocationControls({
  state,
  store,
}: Omit<EconomyPanesProps, "tabId" | "activePane">) {
  return <AllocationControls id="hydrogen" state={state} store={store} />;
}

export function HydrogenFusionDetails({
  state,
  store,
}: Omit<EconomyPanesProps, "tabId" | "activePane">) {
  return <ResourceFusionDetails id="hydrogen" state={state} store={store} alwaysOpen />;
}

function ResourceAutobuyerDetails({
  id,
  state,
  store,
}: {
  id: MaterialId;
  state: GameState;
  store: GameStore;
}) {
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(state.settings.locale, key);
  return (
    <details className="economy-details">
      <summary>{t("autobuyers")}</summary>
      <ResourceAutobuyerTiers id={id} state={state} store={store} />
    </details>
  );
}

function ResourceAutobuyerTiers({
  id,
  state,
  store,
}: {
  id: MaterialId;
  state: GameState;
  store: GameStore;
}) {
  const locale = state.settings.locale;
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const material = MATERIAL_CATALOG[id] as MaterialDefinition;
  return (
    <div className="resource-autobuyer-tiers">
      {[1, 2, 3, 4]
        .filter((tier) => id !== "hydrogen" || tier !== 1)
        .map((tier) => {
          const tierId = autobuyerUpgradeId(id, tier as 1 | 2 | 3 | 4);
          const buyer = material.buyerTiers[tier - 1]!;
          const owned = count(state, tierId);
          const requiredTech = availableTier(tier);
          const gateMet =
            !requiredTech || state.run.economy.researchedTechnologies.includes(requiredTech);
          const tierPrice = scaledPriceAfterPurchases(
            buyer.price * 0.95 ** philosophyRepeatableRank(state, "laserMining"),
            owned,
          );
          const effectiveRate =
            buyer.ratePerSecond *
            repeatedPerkMultiplier(state.permanent.acquiredPerks, "smartAutoBuyers", 1.5);
          const purchaseCommand = {
            type: "economy.autobuyer.purchase" as const,
            goodId: id,
            tier: tier as 1 | 2 | 3 | 4,
          };
          const purchase = selectEconomyAction(state, purchaseCommand);
          const buyMax = selectAutobuyerBuyMax(state, id, tier as 1 | 2 | 3 | 4);
          const reason = economyActionReason(state, purchase.failure ?? buyMax.failure);
          const buyMaxDetails = buyMaxPreview(
            state,
            buyMax.count,
            `${format(state, buyMax.totalCost)} ${name(locale, id)}`,
            `+${format(state, buyMax.count * effectiveRate, 2)} ${t("perSecond")}`,
          );
          return (
            <div className="economy-tier" key={tier}>
              <span>
                {t("buyTier")} {tier}: {format(state, owned)} · +{format(state, effectiveRate, 2)}/s
                · {format(state, buyer.energyPerSecond)} kJ/s
              </span>
              {gateMet ? (
                <button
                  type="button"
                  className="text-button"
                  disabled={!purchase.enabled}
                  aria-describedby={reason ? `resource-${id}-autobuyer-${tier}-reason` : undefined}
                  onClick={() => store.dispatch(purchaseCommand)}
                >
                  {t("buy")} · {format(state, tierPrice)} {SYMBOL[id]}
                </button>
              ) : (
                <span>
                  {t("lockedBy")}: {techName(locale, requiredTech)}
                </span>
              )}
              {gateMet && isBulkPurchasingAvailable(state) && (
                <button
                  type="button"
                  className="text-button"
                  disabled={!buyMax.enabled}
                  aria-describedby={reason ? `resource-${id}-autobuyer-${tier}-reason` : undefined}
                  onClick={() =>
                    store.dispatch({
                      type: "economy.autobuyer.buyMax",
                      goodId: id,
                      tier: tier as 1 | 2 | 3 | 4,
                    })
                  }
                >
                  {t("buyMax")}
                </button>
              )}
              {gateMet && isBulkPurchasingAvailable(state) && (
                <p className="economy-rate">{buyMaxDetails}</p>
              )}
              {gateMet && reason && (
                <p className="control-reason" id={`resource-${id}-autobuyer-${tier}-reason`}>
                  {reason}
                </p>
              )}
              {owned > 0 && (
                <button
                  type="button"
                  className="text-button"
                  aria-pressed={state.run.economy.autobuyerEnabled[tierId]}
                  onClick={() =>
                    store.dispatch({
                      type: "economy.autobuyer.toggle",
                      goodId: id,
                      tier: tier as 1 | 2 | 3 | 4,
                      enabled: !state.run.economy.autobuyerEnabled[tierId],
                    })
                  }
                >
                  {state.run.economy.autobuyerEnabled[tierId] ? t("pause") : t("resume")}
                </button>
              )}
            </div>
          );
        })}
    </div>
  );
}

function ResourceFusionDetails({
  id,
  state,
  store,
  alwaysOpen = false,
}: {
  id: MaterialId;
  state: GameState;
  store: GameStore;
  alwaysOpen?: boolean;
}) {
  const locale = state.settings.locale;
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const notify = useGameNotifications();
  const material = MATERIAL_CATALOG[id] as MaterialDefinition;
  const stock = state.run.goods[id];
  const [fusionTarget, setFusionTarget] = useState(material.fusionOutputs?.[0]?.goodId ?? "helium");
  const [fusionAmount, setFusionAmount] = useState(1);
  if (!material.fusionOutputs) return null;
  const fusionUnlocked = material.fusionTechId
    ? state.run.economy.researchedTechnologies.includes(material.fusionTechId as TechId)
    : false;
  const validTarget = material.fusionOutputs.find((entry) => entry.goodId === fusionTarget);
  const fusionPreview = selectFusionPreview(state, id, fusionTarget as MaterialId, fusionAmount);
  const validFusionAmount = Number.isSafeInteger(fusionAmount) && fusionAmount > 0;
  const fusionReason = !validFusionAmount
    ? t("fusionWholeAmount")
    : fusionAmount > fusionPreview.sourceAvailable
      ? formatEconomyMessage(locale, "fusionSourceShort", {
          amount: format(state, fusionAmount),
          source: name(locale, id),
          available: format(state, fusionPreview.sourceAvailable),
        })
      : null;
  const fusionPreviewText = formatEconomyMessage(locale, "fusionPreview", {
    sourceAmount: format(state, fusionAmount),
    source: name(locale, id),
    minimum: format(state, fusionPreview.minimumYield),
    maximum: format(state, fusionPreview.maximumYield),
    target: name(locale, fusionTarget as MaterialId),
    stored: format(state, fusionPreview.maximumStored),
  });
  const FusionContainer = alwaysOpen ? "section" : "details";
  return (
    <FusionContainer
      className={`economy-details resource-fusion-details${alwaysOpen ? " resource-fusion-panel" : ""}${alwaysOpen && id === "hydrogen" ? " hydrogen-fusion-panel" : ""}`}
    >
      {alwaysOpen ? <h4>{t("fuse")}</h4> : <summary>{t("fuse")}</summary>}
      <div className="economy-controls">
        {fusionUnlocked ? (
          <>
            <label>
              {t("target")}
              <select
                aria-label={`${t("target")} ${name(locale, id)}`}
                value={fusionTarget}
                onChange={(event) => setFusionTarget(event.currentTarget.value as MaterialId)}
              >
                {material.fusionOutputs.map((target) => (
                  <option key={target.goodId} value={target.goodId}>
                    {name(locale, target.goodId)} · {target.ratio}:1
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("amount")}
              <input
                aria-label={`Fusion ${t("amount")} ${name(locale, id)}`}
                type="number"
                min={1}
                max={Math.floor(stock.quantity)}
                value={fusionAmount}
                onChange={(event) =>
                  setFusionAmount(Math.max(1, Number(event.currentTarget.value)))
                }
              />
            </label>
            <p className="economy-rate">{fusionPreviewText}</p>
            <button
              type="button"
              className="secondary-button"
              disabled={!fusionPreview.canFuse || !validTarget}
              aria-describedby={fusionReason ? `resource-${id}-fusion-reason` : undefined}
              onClick={() => {
                const result = store.dispatch({
                  type: "economy.fuse",
                  sourceId: id,
                  targetId: fusionTarget as MaterialId,
                  amount: fusionAmount,
                });
                const completed = result.events.find(
                  (event) => event.type === "economy.fusion.completed",
                );
                if (!completed) return;
                const noticeKey = completed.firstDiscovery
                  ? "fusionDiscoveredNotice"
                  : completed.storageLost > 0
                    ? "fusionStorageNotice"
                    : completed.efficiencyLost > 0
                      ? "fusionEfficiencyNotice"
                      : "fusionCompleted";
                notify(
                  formatEconomyMessage(locale, noticeKey, {
                    sourceAmount: format(result.state, fusionAmount),
                    source: name(locale, completed.sourceId),
                    outputAmount: format(result.state, completed.amount),
                    target: name(locale, completed.targetId),
                    generatedAmount: format(result.state, completed.generatedAmount),
                    idealAmount: format(result.state, completed.idealAmount),
                    efficiencyLost: format(result.state, completed.efficiencyLost),
                    lostAmount: format(result.state, completed.efficiencyLost),
                    storageLost: format(result.state, completed.storageLost),
                  }),
                  {
                    classification: "fuse",
                    type: completed.storageLost > 0 ? "warning" : "info",
                    durationMs: completed.storageLost > 0 ? 5000 : 3000,
                  },
                );
              }}
            >
              {t("fuse")} {name(locale, id)}
            </button>
            {fusionReason && (
              <p className="control-reason" id={`resource-${id}-fusion-reason`}>
                {fusionReason}
              </p>
            )}
          </>
        ) : (
          <p>
            {t("lockedBy")}: {techName(locale, material.fusionTechId ?? "")}
          </p>
        )}
      </div>
    </FusionContainer>
  );
}

/* oxlint-disable jsx-a11y/prefer-tag-over-role -- The source-matched allocation control uses two separately labeled ARIA slider handles on one segmented track. */
function AllocationControls({
  id,
  state,
  store,
}: {
  id: MaterialId;
  state: GameState;
  store: GameStore;
}) {
  const locale = state.settings.locale;
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const allocation = state.run.economy.resourceAllocation[id];
  const available = isPerkAvailable(state, 1);
  const compoundBoundary = allocation.cashShare + allocation.compoundShare;
  const retained = Math.max(0, 100 - allocation.cashShare - allocation.compoundShare);
  const trackRef = useRef<HTMLFieldSetElement>(null);
  const draggingHandle = useRef<0 | 1 | null>(null);
  const helpId = `allocation-help-${id}`;
  const groupLabel = `${t("allocation")} ${name(locale, id)}`;

  function update(cashShare: number, compoundShare: number, enabled = true) {
    if (cashShare + compoundShare > 100) return;
    store.dispatch({
      type: "economy.allocation.set",
      goodId: id,
      cashShare,
      compoundShare,
      enabled,
    });
  }

  function moveHandle(handleIndex: 0 | 1, requestedValue: number): void {
    if (!available) return;
    const snapped = Math.max(0, Math.min(100, Math.round(requestedValue / 5) * 5));
    const nextCashBoundary = handleIndex === 0 ? snapped : allocation.cashShare;
    const nextCompoundBoundary =
      handleIndex === 0
        ? Math.max(compoundBoundary, nextCashBoundary)
        : Math.max(nextCashBoundary, snapped);
    update(nextCashBoundary, nextCompoundBoundary - nextCashBoundary);
  }

  function pointerValue(event: ReactPointerEvent<HTMLFieldSetElement>): number | null {
    const bounds = trackRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width <= 0) return null;
    return ((event.clientX - bounds.left) / bounds.width) * 100;
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLFieldSetElement>): void {
    if (!available || event.button !== 0) return;
    const value = pointerValue(event);
    if (value === null) return;
    event.preventDefault();
    const handleElement = (event.target as HTMLElement).closest<HTMLElement>("[data-handle-index]");
    const namedHandle = handleElement?.dataset["handleIndex"];
    const handleIndex: 0 | 1 =
      namedHandle === "0" || namedHandle === "1"
        ? (Number(namedHandle) as 0 | 1)
        : Math.abs(value - allocation.cashShare) <= Math.abs(value - compoundBoundary)
          ? 0
          : 1;
    draggingHandle.current = handleIndex;
    event.currentTarget.setPointerCapture(event.pointerId);
    moveHandle(handleIndex, value);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLFieldSetElement>): void {
    if (draggingHandle.current === null || !event.currentTarget.hasPointerCapture(event.pointerId))
      return;
    const value = pointerValue(event);
    if (value !== null) moveHandle(draggingHandle.current, value);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLFieldSetElement>): void {
    draggingHandle.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleSliderKeyDown(
    handleIndex: 0 | 1,
    event: ReactKeyboardEvent<HTMLDivElement>,
  ): void {
    const currentValue = handleIndex === 0 ? allocation.cashShare : compoundBoundary;
    let nextValue: number;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        nextValue = currentValue + 5;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        nextValue = currentValue - 5;
        break;
      case "Home":
        nextValue = 0;
        break;
      case "End":
        nextValue = 100;
        break;
      default:
        return;
    }
    event.preventDefault();
    moveHandle(handleIndex, nextValue);
  }

  return (
    <details className="economy-details">
      <summary>{t("allocation")}</summary>
      {!available && (
        <p>
          {t("lockedBy")}: {t("nanoBrokersRequirement").replace("{level}", "I")}
        </p>
      )}
      <div className="allocation-slider-group">
        <p id={helpId} className="sr-only">
          {t("allocationHelp")}
        </p>
        <fieldset
          ref={trackRef}
          className="allocation-slider-track"
          aria-describedby={helpId}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <legend className="sr-only">{groupLabel}</legend>
          <div className="allocation-slider-segments" aria-hidden="true">
            <span
              className="allocation-slider-segment allocation-slider-cash"
              style={{ width: `${allocation.cashShare}%` }}
            />
            <span
              className="allocation-slider-segment allocation-slider-compounds"
              style={{ width: `${allocation.compoundShare}%` }}
            />
            <span
              className="allocation-slider-segment allocation-slider-retained"
              style={{ width: `${retained}%` }}
            />
          </div>
          <div
            className="allocation-slider-handle allocation-slider-handle-cash"
            data-handle-index="0"
            data-testid={`allocation-cash-handle-${id}`}
            role="slider"
            aria-orientation="horizontal"
            tabIndex={available ? 0 : -1}
            aria-label={`${t("cashShare")} (%)`}
            aria-describedby={helpId}
            aria-disabled={!available}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={allocation.cashShare}
            aria-valuetext={`${t("cashShare")}: ${allocation.cashShare}%`}
            style={{ left: `${allocation.cashShare}%` }}
            onKeyDown={(event) => handleSliderKeyDown(0, event)}
          />
          <div
            className="allocation-slider-handle allocation-slider-handle-compounds"
            data-handle-index="1"
            data-testid={`allocation-compound-handle-${id}`}
            role="slider"
            aria-orientation="horizontal"
            tabIndex={available ? 0 : -1}
            aria-label={`${t("compoundShare")} (%)`}
            aria-describedby={helpId}
            aria-disabled={!available}
            aria-valuemin={allocation.cashShare}
            aria-valuemax={100}
            aria-valuenow={compoundBoundary}
            aria-valuetext={`${t("compoundShare")}: ${allocation.compoundShare}%`}
            style={{ left: `${compoundBoundary}%` }}
            onKeyDown={(event) => handleSliderKeyDown(1, event)}
          />
        </fieldset>
        <div className="allocation-slider-readout">
          <span className="allocation-readout-cash">
            {t("cashShare")}: {allocation.cashShare}%
          </span>
          <span className="allocation-readout-compounds">
            {t("compoundShare")}: {allocation.compoundShare}%
          </span>
          <span className="allocation-readout-retained">
            {t("retainedShare")}: {format(state, retained)}%
          </span>
        </div>
      </div>
      <label className="economy-toggle">
        <input
          type="checkbox"
          checked={allocation.enabled}
          disabled={!available}
          onChange={(event) =>
            update(allocation.cashShare, allocation.compoundShare, event.currentTarget.checked)
          }
        />
        {allocation.enabled ? t("unlocked") : t("disabled")}
      </label>
    </details>
  );
}
/* oxlint-enable jsx-a11y/prefer-tag-over-role */

function LegacyCompoundPanel({ activePane, state, store }: Omit<EconomyPanesProps, "tabId">) {
  const locale = state.settings.locale;
  const notify = useGameNotifications();
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const compoundsAvailable = state.run.economy.researchedTechnologies.includes("compounds");
  const economyTick = createEconomyTickPlan(state);
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [saleChoices, setSaleChoices] = useState<Record<string, string>>({});
  if (!compoundsAvailable)
    return (
      <LockedPane
        locale={locale}
        title={t("technologies")}
        requirement={techName(locale, "compounds")}
      />
    );
  return (
    <section className="economy-section" data-testid="economy-compounds">
      <div className="economy-section-heading">
        <h2>{t("compounds")}</h2>
      </div>
      <div className="compound-subpanes">
        {Object.entries(COMPOUND_CATALOG).map(([rawId, definition]) => {
          const id = rawId as keyof typeof COMPOUND_CATALOG;
          const unlocked = state.run.economy.unlockedCompounds.includes(id);
          const output = state.run.goods[id];
          const amount = amounts[id] ?? 1;
          const saleChoice = saleChoices[id] ?? "all";
          const saleSelection: SaleSelection = saleChoice === "all" ? "all" : Number(saleChoice);
          const sale = selectGoodSale(state, id, saleSelection);
          const recipeText = philosophyCompoundRecipe(state, id)
            .map((input) => `${input.amount} ${name(locale, input.goodId)}`)
            .join(" + ");
          const creation = selectCompoundCreation(state, id, amount);
          const creationReason = economyActionReason(state, creation.failure);
          const storage = selectEconomyAction(state, { type: "storage.purchase", goodId: id });
          const storageReason = economyActionReason(state, storage.failure);
          const requiredInputs = creation.requiredInputs
            .map((input) => `${format(state, input.amount)} ${name(locale, input.goodId)}`)
            .join(" + ");
          const creationPreview = formatEconomyMessage(locale, "compoundPreview", {
            amount: format(state, creation.outputAmount),
            good: name(locale, id),
            inputs: requiredInputs,
          });
          const saleReason = economyActionReason(state, sale.failure);
          return (
            <section
              key={id}
              id={`panel-compounds-${id}`}
              className="subpane-panel compound-subpane"
              role="tabpanel"
              aria-labelledby={`tab-compounds-${id}`}
              tabIndex={0}
              hidden={activePane !== `compounds-${id}`}
            >
              <div className="economy-card-grid">
                <article
                  className={`economy-card${unlocked ? "" : " is-locked"}`}
                  data-compound-id={id}
                >
                  <header className="economy-card-heading">
                    <EconomicGoodEmblem goodId={id} />
                    <div>
                      <h3>{name(locale, id)}</h3>
                      <p>{SYMBOL[id]}</p>
                    </div>
                    <strong>
                      {format(state, output.quantity)} / {format(state, output.storageCapacity)}
                    </strong>
                  </header>
                  {unlocked ? (
                    <>
                      <p>
                        {t("recipe")}: {recipeText}
                      </p>
                      <p className="economy-rate">
                        {format(state, economyTick.netRatesPerSecond[id] ?? 0, 2)} {t("perSecond")}
                      </p>
                      {economyTick.capacityBlockedGoodIds.includes(id) && (
                        <p className="red-disabled-text" data-testid={`production-blocked-${id}`}>
                          {t("automaticProductionBlockedByStorage")}
                        </p>
                      )}
                      <label>
                        {t("amount")}
                        <input
                          aria-label={`${t("amount")} ${name(locale, id)}`}
                          type="number"
                          min={1}
                          value={amount}
                          onChange={(event) =>
                            setAmounts({
                              ...amounts,
                              [id]: Math.max(1, Math.floor(Number(event.currentTarget.value))),
                            })
                          }
                        />
                      </label>
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={!creation.enabled}
                        aria-describedby={
                          creationReason ? `compound-${id}-create-reason` : undefined
                        }
                        onClick={() =>
                          store.dispatch({ type: "economy.compound.create", goodId: id, amount })
                        }
                      >
                        {t("create")} {name(locale, id)}
                      </button>
                      <p className="economy-rate">{creationPreview}</p>
                      {creationReason && (
                        <p className="control-reason" id={`compound-${id}-create-reason`}>
                          {creationReason}
                        </p>
                      )}
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={!storage.enabled}
                        aria-describedby={
                          storageReason ? `compound-${id}-storage-reason` : undefined
                        }
                        onClick={() => store.dispatch({ type: "storage.purchase", goodId: id })}
                      >
                        {t("increaseStorage")} ·{" "}
                        {format(state, storagePurchaseCost(output.storageCapacity))} {SYMBOL[id]}
                        {id === "water"
                          ? ` + ${format(state, output.storageCapacity * 0.3)} ${name(locale, "concrete")}`
                          : ""}
                      </button>
                      {storageReason && (
                        <p className="control-reason" id={`compound-${id}-storage-reason`}>
                          {storageReason}
                        </p>
                      )}
                      <details className="economy-details">
                        <summary>{t("autobuyers")}</summary>
                        {[1, 2, 3, 4].map((tier) => {
                          const buyer = definition.buyerTiers[tier - 1]!;
                          const tierNumber = tier as 1 | 2 | 3 | 4;
                          const key = autobuyerUpgradeId(id, tierNumber);
                          const owned = count(state, key);
                          const requiredTech = availableTier(tier);
                          const compoundGate = isPerkAvailable(state, 3);
                          const gateMet =
                            compoundGate &&
                            (!requiredTech ||
                              state.run.economy.researchedTechnologies.includes(requiredTech));
                          const tierPrice = scaledPriceAfterPurchases(buyer.price, owned);
                          const effectiveRate =
                            buyer.ratePerSecond *
                            repeatedPerkMultiplier(
                              state.permanent.acquiredPerks,
                              "smartAutoBuyers",
                              1.5,
                            );
                          const purchaseCommand = {
                            type: "economy.autobuyer.purchase" as const,
                            goodId: id,
                            tier: tierNumber,
                          };
                          const purchase = selectEconomyAction(state, purchaseCommand);
                          const buyMax = selectAutobuyerBuyMax(state, id, tierNumber);
                          const reason = economyActionReason(
                            state,
                            purchase.failure ?? buyMax.failure,
                          );
                          const maxPreview = buyMaxPreview(
                            state,
                            buyMax.count,
                            `${format(state, buyMax.totalCost)} ${name(locale, id)}`,
                            `+${format(state, buyMax.count * effectiveRate, 2)} ${t("perSecond")}`,
                          );
                          return (
                            <div className="economy-tier" key={tier}>
                              <span>
                                {t("buyTier")} {tier}: {format(state, owned)} · +
                                {format(state, effectiveRate, 2)}/s ·{" "}
                                {format(state, buyer.energyPerSecond)} kJ/s
                              </span>
                              {gateMet ? (
                                <>
                                  <button
                                    type="button"
                                    className="text-button"
                                    disabled={!purchase.enabled}
                                    aria-describedby={
                                      reason ? `compound-${id}-autobuyer-${tier}-reason` : undefined
                                    }
                                    onClick={() => store.dispatch(purchaseCommand)}
                                  >
                                    {t("buy")} · {format(state, tierPrice)} {SYMBOL[id]}
                                  </button>
                                  {isBulkPurchasingAvailable(state) && (
                                    <button
                                      type="button"
                                      className="text-button"
                                      disabled={!buyMax.enabled}
                                      aria-describedby={
                                        reason
                                          ? `compound-${id}-autobuyer-${tier}-reason`
                                          : undefined
                                      }
                                      onClick={() =>
                                        store.dispatch({
                                          type: "economy.autobuyer.buyMax",
                                          goodId: id,
                                          tier: tierNumber,
                                        })
                                      }
                                    >
                                      {t("buyMax")}
                                    </button>
                                  )}
                                  {isBulkPurchasingAvailable(state) && (
                                    <p className="economy-rate">{maxPreview}</p>
                                  )}
                                  {reason && (
                                    <p
                                      className="control-reason"
                                      id={`compound-${id}-autobuyer-${tier}-reason`}
                                    >
                                      {reason}
                                    </p>
                                  )}
                                  {owned > 0 && (
                                    <button
                                      type="button"
                                      className="text-button"
                                      aria-pressed={state.run.economy.autobuyerEnabled[key]}
                                      onClick={() =>
                                        store.dispatch({
                                          type: "economy.autobuyer.toggle",
                                          goodId: id,
                                          tier: tierNumber,
                                          enabled: !state.run.economy.autobuyerEnabled[key],
                                        })
                                      }
                                    >
                                      {state.run.economy.autobuyerEnabled[key]
                                        ? t("pause")
                                        : t("resume")}
                                    </button>
                                  )}
                                </>
                              ) : (
                                <span>
                                  {t("lockedBy")}:{" "}
                                  {!compoundGate
                                    ? t("nanoBrokersRequirement").replace("{level}", "III")
                                    : techName(locale, requiredTech ?? "")}
                                </span>
                              )}
                            </div>
                          );
                        })}
                        <label className="economy-toggle">
                          <input
                            type="checkbox"
                            checked={state.run.economy.autoCreateEnabled[id]}
                            disabled={!isPerkAvailable(state, 2)}
                            aria-describedby={
                              !isPerkAvailable(state, 2)
                                ? `compound-${id}-auto-create-reason`
                                : undefined
                            }
                            onChange={(event) =>
                              store.dispatch({
                                type: "economy.autoCreate.toggle",
                                goodId: id,
                                enabled: event.currentTarget.checked,
                              })
                            }
                          />
                          {t("automaticCreation")}
                          {!isPerkAvailable(state, 2) && (
                            <span id={`compound-${id}-auto-create-reason`}>
                              {` · ${t("lockedBy")}: ${t("nanoBrokersRequirement").replace("{level}", "II")}`}
                            </span>
                          )}
                        </label>
                      </details>
                      <div className="economy-good-footer">
                        <div className="economy-sale-controls">
                          <p>
                            {t("salePreview")}: {money(state, sale.proceeds)}
                          </p>
                          <label>
                            {t("saleAmount")}
                            <select
                              aria-label={`${t("saleAmount")} ${name(locale, id)}`}
                              value={saleChoice}
                              onChange={(event) =>
                                setSaleChoices({ ...saleChoices, [id]: event.currentTarget.value })
                              }
                            >
                              <option value="all">{t("sellAll")}</option>
                              <option value="100">100</option>
                              <option value="10">10</option>
                              <option value="1">1</option>
                            </select>
                          </label>
                          <button
                            type="button"
                            className="secondary-button"
                            disabled={!sale.enabled}
                            aria-describedby={saleReason ? `compound-${id}-sell-reason` : undefined}
                            onClick={() =>
                              dispatchEconomySale(state, store, id, saleSelection, notify)
                            }
                          >
                            {t("sell")} {name(locale, id)}
                          </button>
                          {saleReason && (
                            <p className="control-reason" id={`compound-${id}-sell-reason`}>
                              {saleReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p>
                      {t("lockedBy")}: {techName(locale, definition.unlockTechId)}
                    </p>
                  )}
                </article>
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function CompoundPanel(props: Omit<EconomyPanesProps, "tabId">) {
  if (!props.state.run.economy.researchedTechnologies.includes("compounds")) {
    return <LegacyCompoundPanel {...props} />;
  }
  return <CompoundCatalogue {...props} />;
}

function CompoundCatalogue({ activePane, state, store }: Omit<EconomyPanesProps, "tabId">) {
  const economyTick = createEconomyTickPlan(state);
  return (
    <section className="economy-section" data-testid="economy-compounds">
      <div className="compound-subpanes">
        {Object.keys(COMPOUND_CATALOG).map((rawId) => {
          const id = rawId as keyof typeof COMPOUND_CATALOG;
          const unlocked = state.run.economy.unlockedCompounds.includes(id);
          const rate = economyTick.netRatesPerSecond[id] ?? 0;
          return (
            <CompoundGoodPane
              key={id}
              id={id}
              active={activePane === `compounds-${id}`}
              unlocked={unlocked}
              rate={rate}
              blocked={economyTick.capacityBlockedGoodIds.includes(id)}
              state={state}
              store={store}
            />
          );
        })}
      </div>
    </section>
  );
}

function CompoundGoodPane({
  id,
  active,
  unlocked,
  rate,
  blocked,
  state,
  store,
}: {
  readonly id: keyof typeof COMPOUND_CATALOG;
  readonly active: boolean;
  readonly unlocked: boolean;
  readonly rate: number;
  readonly blocked: boolean;
  readonly state: GameState;
  readonly store: GameStore;
}) {
  const locale = state.settings.locale;
  const notify = useGameNotifications();
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const definition = COMPOUND_CATALOG[id];
  const [amount, setAmount] = useState(1);
  const [saleChoice, setSaleChoice] = useState("all");
  const saleSelection: SaleSelection = saleChoice === "all" ? "all" : Number(saleChoice);
  const sale = selectGoodSale(state, id, saleSelection);
  const saleReason = economyActionReason(state, sale.failure);
  const recipeText = philosophyCompoundRecipe(state, id)
    .map((input) => `${input.amount} ${name(locale, input.goodId)}`)
    .join(" + ");
  const creation = selectCompoundCreation(state, id, amount);
  const creationReason = economyActionReason(state, creation.failure);
  const requiredInputs = creation.requiredInputs
    .map((input) => `${format(state, input.amount)} ${name(locale, input.goodId)}`)
    .join(" + ");
  const creationPreview = formatEconomyMessage(locale, "compoundPreview", {
    amount: format(state, creation.outputAmount),
    good: name(locale, id),
    inputs: requiredInputs,
  });
  return (
    <section
      id={`panel-compounds-${id}`}
      className="subpane-panel compound-subpane"
      role="tabpanel"
      aria-labelledby={`tab-compounds-${id}`}
      tabIndex={0}
      hidden={!active}
    >
      <article
        className={`compound-good-page${unlocked ? "" : " is-locked"}`}
        data-compound-id={id}
      >
        <div className="pane-heading">
          <div>
            <h2>{name(locale, id)}</h2>
          </div>
        </div>
        {unlocked ? (
          <>
            <EconomicGoodHero id={id} state={state} rate={rate} blocked={blocked}>
              <p className="compound-recipe">
                {t("recipe")}: <strong>{recipeText}</strong>
              </p>
              <div className="compound-create-controls">
                <label htmlFor={`compound-${id}-amount`}>{t("amount")}</label>
                <div className="compound-create-row">
                  <input
                    id={`compound-${id}-amount`}
                    aria-label={`${t("amount")} ${name(locale, id)}`}
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(event) =>
                      setAmount(Math.max(1, Math.floor(Number(event.currentTarget.value))))
                    }
                  />
                  <button
                    type="button"
                    className="primary-button"
                    disabled={!creation.enabled}
                    aria-describedby={creationReason ? `compound-${id}-create-reason` : undefined}
                    onClick={() =>
                      store.dispatch({ type: "economy.compound.create", goodId: id, amount })
                    }
                  >
                    {t("create")} {name(locale, id)}
                  </button>
                </div>
                <p className="economy-rate" data-testid={`compound-${id}-preview`}>
                  {creationPreview}
                </p>
                {creationReason && (
                  <p className="control-reason" id={`compound-${id}-create-reason`}>
                    {creationReason}
                  </p>
                )}
              </div>
              <div className="hydrogen-sale-grid">
                <article className="sale-card hydrogen-sale-controls">
                  <div className="card-copy">
                    <h3>{t("sell")}</h3>
                    <p>
                      {t("salePreview")}: <strong>{money(state, sale.proceeds)}</strong>
                    </p>
                  </div>
                  <div className="card-controls">
                    <label htmlFor={`compound-${id}-sell-amount`}>{t("saleAmount")}</label>
                    <select
                      id={`compound-${id}-sell-amount`}
                      aria-label={`${t("saleAmount")} ${name(locale, id)}`}
                      value={saleChoice}
                      onChange={(event) => setSaleChoice(event.currentTarget.value)}
                    >
                      <option value="all">{t("sellAll")}</option>
                      <option value="100">100</option>
                      <option value="10">10</option>
                      <option value="1">1</option>
                    </select>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={!sale.enabled}
                      aria-describedby={saleReason ? `compound-${id}-sell-reason` : undefined}
                      onClick={() => dispatchEconomySale(state, store, id, saleSelection, notify)}
                    >
                      {t("sell")} {name(locale, id)}
                    </button>
                    {saleReason && (
                      <span className="control-reason" id={`compound-${id}-sell-reason`}>
                        {saleReason}
                      </span>
                    )}
                  </div>
                </article>
              </div>
            </EconomicGoodHero>
            <GoodStorageCard id={id} state={state} store={store} />
            <CompoundAutobuyerDetails id={id} state={state} store={store} />
          </>
        ) : (
          <p>
            {t("lockedBy")}: {techName(locale, definition.unlockTechId)}
          </p>
        )}
      </article>
    </section>
  );
}

function CompoundAutobuyerDetails({
  id,
  state,
  store,
}: {
  readonly id: keyof typeof COMPOUND_CATALOG;
  readonly state: GameState;
  readonly store: GameStore;
}) {
  const locale = state.settings.locale;
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const definition = COMPOUND_CATALOG[id];
  return (
    <details className="economy-details compound-autobuyer-section">
      <summary>{t("autobuyers")}</summary>
      {[1, 2, 3, 4].map((tier) => {
        const buyer = definition.buyerTiers[tier - 1]!;
        const tierNumber = tier as 1 | 2 | 3 | 4;
        const key = autobuyerUpgradeId(id, tierNumber);
        const owned = count(state, key);
        const requiredTech = availableTier(tier);
        const compoundGate = isPerkAvailable(state, 3);
        const gateMet =
          compoundGate &&
          (!requiredTech || state.run.economy.researchedTechnologies.includes(requiredTech));
        const tierPrice = scaledPriceAfterPurchases(buyer.price, owned);
        const effectiveRate =
          buyer.ratePerSecond *
          repeatedPerkMultiplier(state.permanent.acquiredPerks, "smartAutoBuyers", 1.5);
        const purchaseCommand = {
          type: "economy.autobuyer.purchase" as const,
          goodId: id,
          tier: tierNumber,
        };
        const purchase = selectEconomyAction(state, purchaseCommand);
        const buyMax = selectAutobuyerBuyMax(state, id, tierNumber);
        const reason = economyActionReason(state, purchase.failure ?? buyMax.failure);
        const maxPreview = buyMaxPreview(
          state,
          buyMax.count,
          `${format(state, buyMax.totalCost)} ${name(locale, id)}`,
          `+${format(state, buyMax.count * effectiveRate, 2)} ${t("perSecond")}`,
        );
        return (
          <div className="economy-tier" key={tier}>
            <span>
              {t("buyTier")} {tier}: {format(state, owned)} · +{format(state, effectiveRate, 2)}/s ·{" "}
              {format(state, buyer.energyPerSecond)} kJ/s
            </span>
            {gateMet ? (
              <>
                <button
                  type="button"
                  className="text-button"
                  disabled={!purchase.enabled}
                  aria-describedby={reason ? `compound-${id}-autobuyer-${tier}-reason` : undefined}
                  onClick={() => store.dispatch(purchaseCommand)}
                >
                  {t("buy")} · {format(state, tierPrice)} {SYMBOL[id]}
                </button>
                {isBulkPurchasingAvailable(state) && (
                  <>
                    <button
                      type="button"
                      className="text-button"
                      disabled={!buyMax.enabled}
                      aria-describedby={
                        reason ? `compound-${id}-autobuyer-${tier}-reason` : undefined
                      }
                      onClick={() =>
                        store.dispatch({
                          type: "economy.autobuyer.buyMax",
                          goodId: id,
                          tier: tierNumber,
                        })
                      }
                    >
                      {t("buyMax")}
                    </button>
                    <p className="economy-rate">{maxPreview}</p>
                  </>
                )}
                {reason && (
                  <p className="control-reason" id={`compound-${id}-autobuyer-${tier}-reason`}>
                    {reason}
                  </p>
                )}
                {owned > 0 && (
                  <button
                    type="button"
                    className="text-button"
                    aria-pressed={state.run.economy.autobuyerEnabled[key]}
                    onClick={() =>
                      store.dispatch({
                        type: "economy.autobuyer.toggle",
                        goodId: id,
                        tier: tierNumber,
                        enabled: !state.run.economy.autobuyerEnabled[key],
                      })
                    }
                  >
                    {state.run.economy.autobuyerEnabled[key] ? t("pause") : t("resume")}
                  </button>
                )}
              </>
            ) : (
              <span>
                {t("lockedBy")}:{" "}
                {!compoundGate
                  ? t("nanoBrokersRequirement").replace("{level}", "III")
                  : techName(locale, requiredTech ?? "")}
              </span>
            )}
          </div>
        );
      })}
      <label className="economy-toggle">
        <input
          type="checkbox"
          checked={state.run.economy.autoCreateEnabled[id]}
          disabled={!isPerkAvailable(state, 2)}
          aria-describedby={
            !isPerkAvailable(state, 2) ? `compound-${id}-auto-create-reason` : undefined
          }
          onChange={(event) =>
            store.dispatch({
              type: "economy.autoCreate.toggle",
              goodId: id,
              enabled: event.currentTarget.checked,
            })
          }
        />
        {t("automaticCreation")}
        {!isPerkAvailable(state, 2) && (
          <span id={`compound-${id}-auto-create-reason`}>
            {` · ${t("lockedBy")}: ${t("nanoBrokersRequirement").replace("{level}", "II")}`}
          </span>
        )}
      </label>
    </details>
  );
}

const TECHNOLOGY_BY_ID = new Map(
  TECHNOLOGY_CATALOG.map((technology) => [technology.id, technology]),
);

function technologyTreeDepth(
  id: TechId,
  visibleIds: ReadonlySet<TechId>,
  cache: Map<TechId, number>,
  visiting = new Set<TechId>(),
): number {
  const cached = cache.get(id);
  if (cached !== undefined) return cached;
  const definition = TECHNOLOGY_BY_ID.get(id);
  if (!definition || visiting.has(id)) return 0;
  const visiblePrerequisites = definition.requires.filter((required) => visibleIds.has(required));
  if (visiblePrerequisites.length === 0) {
    cache.set(id, 0);
    return 0;
  }

  visiting.add(id);
  const depth =
    1 +
    Math.max(
      ...visiblePrerequisites.map((required) =>
        technologyTreeDepth(required, visibleIds, cache, visiting),
      ),
    );
  visiting.delete(id);
  cache.set(id, depth);
  return depth;
}

interface TechnologyPrerequisiteTreeProps {
  readonly active: boolean;
  readonly columns: readonly number[];
  readonly technologies: readonly (typeof TECHNOLOGY_CATALOG)[number][];
  readonly researched: readonly TechId[];
  readonly state: GameState;
  readonly store: GameStore;
}

interface TechnologyTreeGraph {
  readonly width: number;
  readonly height: number;
  readonly edges: readonly {
    readonly sourceId: TechId;
    readonly targetId: TechId;
    readonly path: string;
  }[];
}

function TechnologyPrerequisiteTree({
  active,
  columns,
  technologies,
  researched,
  state,
  store,
}: TechnologyPrerequisiteTreeProps) {
  const locale = state.settings.locale;
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const treeRef = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState<TechnologyTreeGraph>({ width: 0, height: 0, edges: [] });
  const [zoom, setZoom] = useState(1);
  const [focusedTechnologyId, setFocusedTechnologyId] = useState<TechId | null>(null);
  const [hoveredTechnologyId, setHoveredTechnologyId] = useState<TechId | null>(null);
  const activeTechnologyId = hoveredTechnologyId ?? focusedTechnologyId;
  const visibleIds = useMemo(
    () => new Set(technologies.map((technology) => technology.id)),
    [technologies],
  );
  const columnByTechnology = useMemo(() => {
    const cache = new Map<TechId, number>();
    return new Map(
      technologies.map((technology) => [
        technology.id,
        technologyTreeDepth(technology.id, visibleIds, cache),
      ]),
    );
  }, [technologies, visibleIds]);

  useLayoutEffect(() => {
    if (!active) return;
    const tree = treeRef.current;
    if (!tree) return;

    let animationFrame = 0;
    const measure = () => {
      const treeBounds = tree.getBoundingClientRect();
      const nodes = new Map(
        Array.from(tree.querySelectorAll<HTMLElement>("[data-technology-id]")).map((node) => [
          node.dataset["technologyId"] as TechId,
          node,
        ]),
      );
      const edges = technologies.flatMap((technology) =>
        technology.requires.flatMap((sourceId) => {
          const source = nodes.get(sourceId);
          const target = nodes.get(technology.id);
          if (!source || !target) return [];
          const sourceBounds = source.getBoundingClientRect();
          const targetBounds = target.getBoundingClientRect();
          const sourceX = (sourceBounds.right - treeBounds.left) / zoom;
          const sourceY = (sourceBounds.top + sourceBounds.height / 2 - treeBounds.top) / zoom;
          const targetX = (targetBounds.left - treeBounds.left) / zoom;
          const targetY = (targetBounds.top + targetBounds.height / 2 - treeBounds.top) / zoom;
          const controlOffset = Math.max(24, (targetX - sourceX) * 0.45);
          return [
            {
              sourceId,
              targetId: technology.id,
              path: `M ${sourceX} ${sourceY} C ${sourceX + controlOffset} ${sourceY}, ${targetX - controlOffset} ${targetY}, ${targetX} ${targetY}`,
            },
          ];
        }),
      );
      setGraph({ width: tree.scrollWidth, height: tree.scrollHeight, edges });
    };
    const scheduleMeasure = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(measure);
    };

    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(tree);
    tree
      .querySelectorAll<HTMLElement>("[data-technology-id]")
      .forEach((node) => observer.observe(node));
    window.addEventListener("resize", scheduleMeasure);
    scheduleMeasure();
    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [active, technologies, zoom]);

  /* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The scrollable Tech Tree viewport must take keyboard focus so players can pan and scroll the graph. */
  return (
    <div className="technology-tree-shell">
      <fieldset className="technology-tree-zoom">
        <legend className="sr-only">{t("zoom")}</legend>
        <button
          className="secondary-button"
          type="button"
          aria-label={t("zoomOut")}
          disabled={zoom <= 0.5}
          onClick={() => setZoom((value) => Math.max(0.5, Math.round((value - 0.1) * 10) / 10))}
        >
          −
        </button>
        <label>
          <span>
            {t("zoom")}: {formatNumber(locale, Math.round(zoom * 100))}%
          </span>
          <input
            aria-label={t("zoom")}
            type="range"
            min="0.5"
            max="1.6"
            step="0.1"
            value={zoom}
            aria-valuetext={`${Math.round(zoom * 100)}%`}
            onChange={(event) => setZoom(Number(event.currentTarget.value))}
          />
        </label>
        <button
          className="secondary-button"
          type="button"
          aria-label={t("zoomIn")}
          disabled={zoom >= 1.6}
          onClick={() => setZoom((value) => Math.min(1.6, Math.round((value + 0.1) * 10) / 10))}
        >
          +
        </button>
        <button className="text-button" type="button" onClick={() => setZoom(1)}>
          {t("resetZoom")}
        </button>
      </fieldset>
      <section
        className="technology-map-viewport"
        data-testid="technology-tree-viewport"
        aria-label={t("technologyTree")}
        tabIndex={0}
      >
        <div
          className="technology-map-stage"
          style={{ width: graph.width * zoom, height: graph.height * zoom }}
        >
          <div
            className="technology-map"
            data-testid="technology-tree"
            ref={treeRef}
            style={{
              gridTemplateColumns: `repeat(${columns.length}, minmax(19rem, 23rem))`,
              transform: `scale(${zoom})`,
            }}
          >
            <svg
              className="technology-map-edges"
              width={graph.width}
              height={graph.height}
              viewBox={`0 0 ${graph.width} ${graph.height}`}
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="technology-prerequisite-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
                </marker>
              </defs>
              {graph.edges.map((edge) => (
                <path
                  key={`${edge.sourceId}-${edge.targetId}`}
                  className={`technology-map-edge${
                    activeTechnologyId === null
                      ? ""
                      : edge.sourceId === activeTechnologyId || edge.targetId === activeTechnologyId
                        ? " is-related"
                        : " is-muted"
                  }`}
                  d={edge.path}
                  data-prerequisite-from={edge.sourceId}
                  data-prerequisite-to={edge.targetId}
                  markerEnd="url(#technology-prerequisite-arrow)"
                />
              ))}
            </svg>
            {columns.map((column) => (
              <ol className="technology-map-nodes" key={column}>
                {technologies
                  .filter((technology) => columnByTechnology.get(technology.id) === column)
                  .map((technology) => {
                    const done = researched.includes(technology.id);
                    const researchCheck = done
                      ? { ok: false }
                      : checkPreconditions(state, {
                          type: "economy.research",
                          technologyId: technology.id,
                        });
                    const canResearch = !done && researchCheck.ok;
                    const status = done
                      ? t("researched")
                      : canResearch
                        ? t("ready")
                        : t("lockedBy");
                    const technologyLabel = techName(locale, technology.id);
                    const description = TECHNOLOGY_DESCRIPTIONS[technology.id][locale];
                    const tooltipDescription = description.replace(/\s*\/\s*\/\s*/g, "\n");
                    const prerequisites = technology.requires.length
                      ? technology.requires.map((required) => techName(locale, required)).join(", ")
                      : t("initialHydrogen");
                    const tooltipId = `technology-tooltip-${technology.id}`;
                    const tooltipText = `${technologyLabel}. ${tooltipDescription} ${t("points")}: ${format(state, technology.price)}. ${t("prerequisites")}: ${prerequisites}. ${status}.`;
                    const lastColumn = columns.length > 1 && column === columns[columns.length - 1];
                    return (
                      <li className="technology-map-item" key={technology.id}>
                        <button
                          className={`technology-map-node${done ? " is-researched" : canResearch ? " is-ready" : " is-locked"}${lastColumn ? " is-last-column" : ""}`}
                          type="button"
                          data-technology-id={technology.id}
                          data-render-position={technology.renderPosition}
                          aria-label={`${done ? t("researched") : t("researchTech")}: ${technologyLabel}`}
                          aria-describedby={tooltipId}
                          aria-disabled={!canResearch}
                          title={tooltipText}
                          onFocus={() => setFocusedTechnologyId(technology.id)}
                          onBlur={() => setFocusedTechnologyId(null)}
                          onMouseEnter={() => setHoveredTechnologyId(technology.id)}
                          onMouseLeave={() => setHoveredTechnologyId(null)}
                          onClick={() => {
                            if (canResearch)
                              store.dispatch({
                                type: "economy.research",
                                technologyId: technology.id,
                              });
                          }}
                        >
                          <span className="technology-map-node-heading">
                            <strong>{technologyLabel}</strong>
                            <span
                              className={
                                done ? "technology-map-researched" : "technology-map-status"
                              }
                            >
                              {status}
                            </span>
                          </span>
                          <span className="technology-map-node-cost">
                            {format(state, technology.price)} {t("points")}
                          </span>
                          <span className="technology-map-tooltip" id={tooltipId} role="tooltip">
                            <strong>{technologyLabel}</strong>
                            <span className="technology-map-tooltip-description">
                              {tooltipDescription}
                            </span>
                            <span>
                              {t("points")}: {format(state, technology.price)}
                            </span>
                            <span>
                              {t("prerequisites")}: {prerequisites}
                            </span>
                            <span>{status}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
              </ol>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
  /* oxlint-enable jsx-a11y/no-noninteractive-tabindex */
}

function ResearchPanel({ activePane, state, store }: Omit<EconomyPanesProps, "tabId">) {
  const locale = state.settings.locale;
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const researched = state.run.economy.researchedTechnologies;
  const tick = createEconomyTickPlan(state);
  const standardTechCount = TECHNOLOGY_CATALOG.filter(
    (technology) => !MEGASTRUCTURE_TECHNOLOGY_IDS.includes(technology.id),
  ).length;
  const standardResearchedCount = researched.filter(
    (id) => !MEGASTRUCTURE_TECHNOLOGY_IDS.includes(id),
  ).length;
  const researchBuildings = Object.keys(SCIENCE_BUILDINGS) as (keyof typeof SCIENCE_BUILDINGS)[];
  const visibleTechnologies = useMemo(
    () =>
      TECHNOLOGY_CATALOG.filter(
        (technology) =>
          !MEGASTRUCTURE_TECHNOLOGY_IDS.includes(technology.id) &&
          state.run.economy.revealedTechnologies.includes(technology.id),
      ).sort((left, right) => left.renderPosition - right.renderPosition),
    [state.run.economy.revealedTechnologies],
  );
  const visibleTechnologyIds = new Set(visibleTechnologies.map((technology) => technology.id));
  const depthCache = new Map<TechId, number>();
  const treeColumns = [
    ...new Set(
      visibleTechnologies.map((technology) =>
        technologyTreeDepth(technology.id, visibleTechnologyIds, depthCache),
      ),
    ),
  ].sort((left, right) => left - right);
  return (
    <section className="economy-section" data-testid="economy-research">
      <div className="economy-section-heading">
        <h2>{activePane === "research-tech-tree" ? t("technologyTree") : t("research")}</h2>
        <p>
          {t("points")}:{" "}
          <strong data-testid="research-points">{format(state, state.run.researchPoints)}</strong>
        </p>
        <p>
          {t("generated")}:{" "}
          <strong data-testid="research-rate">{format(state, tick.researchPerSecond, 2)}</strong>{" "}
          RP/s
        </p>
      </div>
      <div className="research-subpanes">
        <section
          id="panel-research-science-buildings"
          className="subpane-panel"
          role="tabpanel"
          aria-labelledby="tab-research-science-buildings"
          tabIndex={0}
          hidden={activePane !== "research-science-buildings"}
        >
          <section
            className="research-production-section"
            aria-labelledby="research-buildings-title"
          >
            <h3 id="research-buildings-title">{t("scienceBuildings")}</h3>
            <div className="economy-card-grid">
              {researchBuildings.map((id) => {
                const def = SCIENCE_BUILDINGS[id];
                const owned = count(state, id);
                const price = scaledPriceAfterPurchases(
                  def.price * 0.95 ** philosophyRepeatableRank(state, "energyDrones"),
                  owned,
                );
                const gate = def.techId;
                const gateMet = !gate || researched.includes(gate as TechId);
                const singleCommand = {
                  type: "economy.building.purchase" as const,
                  buildingId: id,
                };
                const bulkCommand = { type: "economy.building.buyMax" as const, buildingId: id };
                const maxPlan = selectBuildingBuyMax(state, id);
                const purchaseCheck = selectEconomyAction(state, singleCommand);
                const purchaseReason = !gateMet
                  ? null
                  : economyActionReason(state, purchaseCheck.failure);
                const bulkReason = !gateMet ? null : economyActionReason(state, maxPlan.failure);
                const maxCosts = [
                  money(state, maxPlan.cashCost),
                  ...maxPlan.materialCosts.map(
                    (item) => `${format(state, item.amount)} ${name(locale, item.goodId)}`,
                  ),
                ].join(" + ");
                const maxResult = `+${format(state, maxPlan.count * def.ratePerSecond, 2)} RP/s`;
                return (
                  <article className="economy-card" key={id} data-building-id={id}>
                    <header className="economy-entity-heading">
                      <EconomyStructureEmblem kind="laboratory" />
                      <h4>{techName(locale, id)}</h4>
                    </header>
                    <p>
                      +{format(state, def.ratePerSecond, 2)} RP/s ·{" "}
                      {format(state, def.energyPerSecond)} kJ/s
                    </p>
                    <p>
                      {t("owned")}: {format(state, owned)}
                    </p>
                    <p>{money(state, price)}</p>
                    {gateMet ? (
                      <div className="economy-building-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={!purchaseCheck.enabled}
                          aria-describedby={
                            purchaseReason ? `research-building-${id}-reason` : undefined
                          }
                          onClick={() => store.dispatch(singleCommand)}
                        >
                          {t("buy")}
                        </button>
                        {isBulkPurchasingAvailable(state) && (
                          <button
                            type="button"
                            className="secondary-button"
                            disabled={!maxPlan.enabled}
                            aria-describedby={
                              bulkReason ? `research-building-${id}-bulk-reason` : undefined
                            }
                            onClick={() => store.dispatch(bulkCommand)}
                          >
                            {t("buyMax")}
                          </button>
                        )}
                      </div>
                    ) : (
                      <p>
                        {t("lockedBy")}: {techName(locale, gate ?? "")}
                      </p>
                    )}
                    {purchaseReason && (
                      <p className="control-reason" id={`research-building-${id}-reason`}>
                        {purchaseReason}
                      </p>
                    )}
                    {gateMet && isBulkPurchasingAvailable(state) && (
                      <p className="economy-rate">
                        {buyMaxPreview(state, maxPlan.count, maxCosts, maxResult)}
                      </p>
                    )}
                    {gateMet && isBulkPurchasingAvailable(state) && bulkReason && (
                      <p className="control-reason" id={`research-building-${id}-bulk-reason`}>
                        {bulkReason}
                      </p>
                    )}
                    {owned > 0 && (
                      <button
                        type="button"
                        className="text-button"
                        aria-pressed={state.run.economy.buildingEnabled[id]}
                        onClick={() =>
                          store.dispatch({
                            type: "economy.building.toggle",
                            buildingId: id,
                            enabled: !state.run.economy.buildingEnabled[id],
                          })
                        }
                      >
                        {state.run.economy.buildingEnabled[id] ? t("pause") : t("resume")}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
            <label className="economy-toggle">
              <input
                type="checkbox"
                checked={state.run.economy.researchAutobuyerEnabled}
                disabled={!isResearchAutomationAvailable(state)}
                aria-describedby={
                  !isResearchAutomationAvailable(state)
                    ? "research-autobuyer-lock-reason"
                    : undefined
                }
                onChange={(event) =>
                  store.dispatch({
                    type: "economy.research.autobuyer.toggle",
                    enabled: event.currentTarget.checked,
                  })
                }
              />
              <span>
                {t("researchAutobuyer")}{" "}
                {!isResearchAutomationAvailable(state) && (
                  <small className="economy-toggle-lock" id="research-autobuyer-lock-reason">
                    {economyLabel(locale, "researchAutobuyerLockedUntil").replace(
                      "{technology}",
                      t("researchAutomation"),
                    )}
                  </small>
                )}
              </span>
            </label>
          </section>
        </section>
        <section
          id="panel-research-tech-tree"
          className="subpane-panel"
          role="tabpanel"
          aria-labelledby="tab-research-tech-tree"
          tabIndex={0}
          hidden={activePane !== "research-tech-tree"}
        >
          <div className="economy-section-heading">
            <p>
              {standardResearchedCount} / {standardTechCount} {t("researched")} ·{" "}
              {visibleTechnologies.length} {t("shown")}
            </p>
          </div>
          {visibleTechnologies.length === 0 ? (
            <p>{t("noAffordableTechnologies")}</p>
          ) : (
            <TechnologyPrerequisiteTree
              active={activePane === "research-tech-tree"}
              columns={treeColumns}
              technologies={visibleTechnologies}
              researched={researched}
              state={state}
              store={store}
            />
          )}
        </section>
        {state.permanent.philosophyId !== null && (
          <section
            id="panel-research-philosophy"
            className="subpane-panel"
            role="tabpanel"
            aria-labelledby="tab-research-philosophy"
            tabIndex={0}
            hidden={activePane !== "research-philosophy"}
          >
            <PhilosophyPane state={state} store={store} />
          </section>
        )}
      </div>
    </section>
  );
}

function EnergyPanel({ activePane, state, store }: Omit<EconomyPanesProps, "tabId">) {
  const locale = state.settings.locale;
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const tick = createEconomyTickPlan(state);
  const energyTech = state.run.economy.researchedTechnologies.includes("basicPowerGeneration");
  const plants = ["powerPlant1", "powerPlant2", "powerPlant3"] as const;
  const batteries = ["battery1", "battery2", "battery3"] as const;
  const plantPaneIds = {
    powerPlant1: "energy-power-plant",
    powerPlant2: "energy-solar-power-plant",
    powerPlant3: "energy-advanced-power-plant",
  } as const;
  const selectedPlant = plants.find((id) => plantPaneIds[id] === activePane);
  if (!energyTech) {
    return (
      <section className="economy-section" data-testid="economy-energy">
        <div className="economy-section-heading">
          <h2>{t("energy")}</h2>
        </div>
        <LockedPane
          locale={locale}
          title={t("energy")}
          requirement={techName(locale, "basicPowerGeneration")}
        />
      </section>
    );
  }
  return (
    <section className="economy-section" data-testid="economy-energy">
      <div className="economy-section-heading">
        <h2>{t("energy")}</h2>
        <p>
          {t("generated")}: {format(state, tick.generationPerSecond)} kJ/s · {t("consumed")}:{" "}
          {format(state, tick.demandPerSecond)} kJ/s
        </p>
        <p>
          {t("unavailable")}:{" "}
          <strong data-testid="power-unavailable">
            {format(state, tick.unavailablePerSecond)}
          </strong>{" "}
          kJ/s
        </p>
        <p>
          {t("stored")}:{" "}
          <strong data-testid="power-quantity">
            {format(state, state.run.economy.power.quantity)}
          </strong>{" "}
          / <strong>{format(state, state.run.economy.power.capacity)}</strong> kJ · {t("capacity")}
        </p>
        {state.run.economy.power.tripped && (
          <p className="control-reason" role="alert">
            {t("trip")}
          </p>
        )}
      </div>
      <EnergyGenerationChart
        state={state}
        generation={tick.generationByPlantPerSecond}
        totalGeneration={tick.generationPerSecond}
        consumption={tick.demandPerSecond}
      />
      <section
        id="panel-energy"
        className="subpane-panel"
        role="tabpanel"
        aria-labelledby={`tab-${activePane}`}
        tabIndex={0}
      >
        {activePane === "energy-storage" && (
          <label className="economy-toggle">
            <input
              type="checkbox"
              checked={state.run.economy.power.gridEnabled}
              onChange={(event) =>
                store.dispatch({
                  type: "economy.power.toggle",
                  enabled: event.currentTarget.checked,
                })
              }
            />
            {t("powerGrid")}
          </label>
        )}
        {activePane === "energy-power-plant" && (
          <>
            <button
              type="button"
              className="text-button"
              disabled={!plants.some((id) => count(state, id) > 0)}
              aria-describedby={
                !plants.some((id) => count(state, id) > 0) ? "power-all-plants-reason" : undefined
              }
              onClick={() => {
                const shouldEnable = plants.some(
                  (id) => count(state, id) > 0 && !state.run.economy.buildingEnabled[id],
                );
                for (const id of plants) {
                  if (
                    count(state, id) > 0 &&
                    state.run.economy.buildingEnabled[id] !== shouldEnable
                  )
                    store.dispatch({
                      type: "economy.building.toggle",
                      buildingId: id,
                      enabled: shouldEnable,
                    });
                }
              }}
            >
              {t("powerAll")}
            </button>
            {!plants.some((id) => count(state, id) > 0) && (
              <p className="control-reason" id="power-all-plants-reason">
                {t("powerAllNeedsPlant")}
              </p>
            )}
          </>
        )}
        {selectedPlant && (
          <div className="economy-card-grid">
            {plants
              .filter((id) => id === selectedPlant)
              .map((id) => {
                const def = ENERGY_BUILDINGS[id];
                const outputMultiplier =
                  repeatedPerkMultiplier(
                    state.permanent.acquiredPerks,
                    "optimizedPowerGrids",
                    1.35,
                  ) * (id === "powerPlant2" ? state.run.economy.power.environmentalMultiplier : 1);
                const owned = count(state, id);
                const energyDroneDiscount = 0.95 ** philosophyRepeatableRank(state, "energyDrones");
                const cashPrice = scaledPriceAfterPurchases(
                  def.price.cash * energyDroneDiscount,
                  owned,
                );
                const materialPrices = def.price.materials.map((item) => ({
                  ...item,
                  amount: scaledPriceAfterPurchases(item.amount * energyDroneDiscount, owned),
                }));
                const gate = def.techId;
                const unlocked = state.run.economy.researchedTechnologies.includes(gate as TechId);
                const costs = materialPrices
                  .map((item) => `${format(state, item.amount)} ${name(locale, item.goodId)}`)
                  .join(" + ");
                const singleCommand = {
                  type: "economy.building.purchase" as const,
                  buildingId: id,
                };
                const bulkCommand = { type: "economy.building.buyMax" as const, buildingId: id };
                const maxPlan = selectBuildingBuyMax(state, id);
                const purchaseCheck = selectEconomyAction(state, singleCommand);
                const purchaseReason = unlocked
                  ? economyActionReason(state, purchaseCheck.failure)
                  : null;
                const bulkReason = unlocked ? economyActionReason(state, maxPlan.failure) : null;
                const maxCosts = [
                  money(state, maxPlan.cashCost),
                  ...maxPlan.materialCosts.map(
                    (item) => `${format(state, item.amount)} ${name(locale, item.goodId)}`,
                  ),
                ].join(" + ");
                const maxResult = `+${format(state, def.ratePerSecond * outputMultiplier * maxPlan.count, 2)} kJ/s`;
                return (
                  <article className="economy-card" key={id} data-building-id={id}>
                    <header className="economy-entity-heading">
                      <EconomyStructureEmblem kind="power-plant" />
                      <h3>{techName(locale, id)}</h3>
                    </header>
                    <p>
                      +{format(state, def.ratePerSecond * outputMultiplier)} kJ/s{" "}
                      {def.fuel
                        ? `· ${format(state, def.fuel.unitsPerSecond)} ${name(locale, def.fuel.goodId)} / s`
                        : ""}
                    </p>
                    <p>
                      {t("owned")}: {format(state, owned)} · {money(state, cashPrice)}{" "}
                      {costs && `+ ${costs}`}
                    </p>
                    {unlocked ? (
                      <div className="economy-building-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={!purchaseCheck.enabled}
                          aria-describedby={
                            purchaseReason ? `energy-building-${id}-reason` : undefined
                          }
                          onClick={() => store.dispatch(singleCommand)}
                        >
                          {t("buy")}
                        </button>
                        {isBulkPurchasingAvailable(state) && (
                          <button
                            type="button"
                            className="secondary-button"
                            disabled={!maxPlan.enabled}
                            aria-describedby={
                              bulkReason ? `energy-building-${id}-bulk-reason` : undefined
                            }
                            onClick={() => store.dispatch(bulkCommand)}
                          >
                            {t("buyMax")}
                          </button>
                        )}
                      </div>
                    ) : (
                      <p>
                        {t("lockedBy")}: {techName(locale, gate)}
                      </p>
                    )}
                    {purchaseReason && (
                      <p className="control-reason" id={`energy-building-${id}-reason`}>
                        {purchaseReason}
                      </p>
                    )}
                    {unlocked && isBulkPurchasingAvailable(state) && (
                      <p className="economy-rate">
                        {buyMaxPreview(state, maxPlan.count, maxCosts, maxResult)}
                      </p>
                    )}
                    {unlocked && isBulkPurchasingAvailable(state) && bulkReason && (
                      <p className="control-reason" id={`energy-building-${id}-bulk-reason`}>
                        {bulkReason}
                      </p>
                    )}
                    {owned > 0 && (
                      <label className="economy-toggle">
                        <input
                          type="checkbox"
                          aria-label={techName(locale, id)}
                          checked={state.run.economy.buildingEnabled[id]}
                          onChange={(event) =>
                            store.dispatch({
                              type: "economy.building.toggle",
                              buildingId: id,
                              enabled: event.currentTarget.checked,
                            })
                          }
                        />
                        {state.run.economy.buildingEnabled[id] ? t("pause") : t("resume")}
                      </label>
                    )}
                  </article>
                );
              })}
          </div>
        )}
        {activePane === "energy-storage" && (
          <div className="economy-card-grid">
            {batteries.map((id) => {
              const def = ENERGY_BUILDINGS[id] as {
                capacity: number;
                price: {
                  cash: number;
                  materials: readonly { goodId: EconomicGoodId; amount: number }[];
                };
                techId: string;
              };
              const owned = count(state, id);
              const energyDroneDiscount = 0.95 ** philosophyRepeatableRank(state, "energyDrones");
              const cashPrice = scaledPriceAfterPurchases(
                def.price.cash * energyDroneDiscount,
                owned,
              );
              const materialPrices = def.price.materials.map((item) => ({
                ...item,
                amount: scaledPriceAfterPurchases(item.amount * energyDroneDiscount, owned),
              }));
              const unlocked = state.run.economy.researchedTechnologies.includes(
                def.techId as TechId,
              );
              const costs = materialPrices
                .map((item) => `${format(state, item.amount)} ${name(locale, item.goodId)}`)
                .join(" + ");
              const singleCommand = { type: "economy.building.purchase" as const, buildingId: id };
              const bulkCommand = { type: "economy.building.buyMax" as const, buildingId: id };
              const maxPlan = selectBuildingBuyMax(state, id);
              const purchaseCheck = selectEconomyAction(state, singleCommand);
              const purchaseReason = unlocked
                ? economyActionReason(state, purchaseCheck.failure)
                : null;
              const bulkReason = unlocked ? economyActionReason(state, maxPlan.failure) : null;
              const maxCosts = [
                money(state, maxPlan.cashCost),
                ...maxPlan.materialCosts.map(
                  (item) => `${format(state, item.amount)} ${name(locale, item.goodId)}`,
                ),
              ].join(" + ");
              const maxResult = `+${format(state, def.capacity * maxPlan.count)} kJ ${t("capacity")}`;
              return (
                <article className="economy-card" key={id} data-building-id={id}>
                  <header className="economy-entity-heading">
                    <EconomyStructureEmblem kind="battery" />
                    <h3>{techName(locale, id)}</h3>
                  </header>
                  <p>
                    +{format(state, def.capacity)} kJ {t("capacity")}
                  </p>
                  <p>
                    {t("owned")}: {format(state, owned)} · {money(state, cashPrice)} + {costs}
                  </p>
                  {unlocked ? (
                    <div className="economy-building-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={!purchaseCheck.enabled}
                        aria-describedby={purchaseReason ? `battery-${id}-reason` : undefined}
                        onClick={() => store.dispatch(singleCommand)}
                      >
                        {t("buy")}
                      </button>
                      {isBulkPurchasingAvailable(state) && (
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={!maxPlan.enabled}
                          aria-describedby={bulkReason ? `battery-${id}-bulk-reason` : undefined}
                          onClick={() => store.dispatch(bulkCommand)}
                        >
                          {t("buyMax")}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p>
                      {t("lockedBy")}: {techName(locale, def.techId)}
                    </p>
                  )}
                  {purchaseReason && (
                    <p className="control-reason" id={`battery-${id}-reason`}>
                      {purchaseReason}
                    </p>
                  )}
                  {unlocked && isBulkPurchasingAvailable(state) && (
                    <p className="economy-rate">
                      {buyMaxPreview(state, maxPlan.count, maxCosts, maxResult)}
                    </p>
                  )}
                  {unlocked && isBulkPurchasingAvailable(state) && bulkReason && (
                    <p className="control-reason" id={`battery-${id}-bulk-reason`}>
                      {bulkReason}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}

function EnergyGenerationChart({
  state,
  generation,
  totalGeneration,
  consumption,
}: {
  readonly state: GameState;
  readonly generation: Readonly<Record<"powerPlant1" | "powerPlant2" | "powerPlant3", number>>;
  readonly totalGeneration: number;
  readonly consumption: number;
}) {
  const locale = state.settings.locale;
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const plantIds = ["powerPlant1", "powerPlant2", "powerPlant3"] as const;
  const plantNames = plantIds.map((id) => techName(locale, id));
  const scale = Math.max(totalGeneration, consumption, 1);
  const descriptionId = "energy-generation-chart-description";
  const values = {
    plant1: plantNames[0] ?? "",
    rate1: format(state, generation.powerPlant1),
    plant2: plantNames[1] ?? "",
    rate2: format(state, generation.powerPlant2),
    plant3: plantNames[2] ?? "",
    rate3: format(state, generation.powerPlant3),
    totalLabel: t("generationTotal"),
    total: format(state, totalGeneration),
    consumptionLabel: t("energyConsumption"),
    consumption: format(state, consumption),
  };
  const power = state.run.economy.power;
  const powerStateMessage = power.tripped
    ? t("powerGridTripped")
    : !power.gridEnabled
      ? t("powerGridOff")
      : power.infinitePower
        ? t("infinitePowerAvailable")
        : null;

  return (
    <figure className="energy-generation-chart" aria-describedby={descriptionId}>
      <figcaption>{t("generationMix")}</figcaption>
      <p className="sr-only" id={descriptionId}>
        {formatEconomyMessage(locale, "generationChartSummary", values)}
      </p>
      <div className="energy-generation-chart-bars" aria-hidden="true">
        <div className="energy-generation-chart-row">
          <div className="energy-generation-chart-label">
            <span>{t("generationTotal")}</span>
            <strong data-testid="energy-generation-total">{values.total} kJ/s</strong>
          </div>
          <div className="energy-generation-chart-track">
            {plantIds.map((id, index) => (
              <span
                className={`energy-generation-segment energy-generation-segment-${index + 1}`}
                key={id}
                style={{ width: `${Math.min(100, (generation[id] / scale) * 100)}%` }}
              />
            ))}
          </div>
        </div>
        <div className="energy-generation-chart-row">
          <div className="energy-generation-chart-label">
            <span>{t("energyConsumption")}</span>
            <strong data-testid="energy-consumption-total">{values.consumption} kJ/s</strong>
          </div>
          <div className="energy-generation-chart-track">
            <span
              className="energy-consumption-segment"
              style={{ width: `${Math.min(100, (consumption / scale) * 100)}%` }}
            />
          </div>
        </div>
      </div>
      <ul className="energy-generation-legend">
        {plantIds.map((id, index) => (
          <li key={id}>
            <span
              className={`energy-generation-legend-swatch energy-generation-segment-${index + 1}`}
              aria-hidden="true"
            />
            <span>{plantNames[index]}</span>
            <strong data-testid={`energy-generation-${id}`}>{format(state, generation[id])}</strong>
            <span>kJ/s</span>
          </li>
        ))}
      </ul>
      {powerStateMessage && <p className="energy-generation-state">{powerStateMessage}</p>}
    </figure>
  );
}

function LockedPane({
  locale,
  title,
  requirement,
}: {
  locale: GameState["settings"]["locale"];
  title: string;
  requirement: string;
}) {
  return (
    <div className="locked-panel economy-locked">
      <span className="locked-mark" aria-hidden="true">
        ·
      </span>
      <p className="eyebrow">{title}</p>
      <p>{economyLabel(locale, "researchToUnlock").replace("{technology}", requirement)}</p>
    </div>
  );
}
