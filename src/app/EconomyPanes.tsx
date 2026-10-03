import { useEffect, useRef, useState } from "react";
import {
  COMPOUND_CATALOG,
  ENERGY_BUILDINGS,
  MATERIAL_CATALOG,
  SCIENCE_BUILDINGS,
  type MaterialDefinition,
} from "../content/economy";
import {
  MATERIAL_IDS,
  autobuyerUpgradeId,
  type EconomicGoodId,
  type MaterialId,
  type TechId,
} from "../content/ids";
import {
  repeatedPerkMultiplier,
  selectedSaleAmount,
  scaledPriceAfterPurchases,
  storagePurchaseCost,
} from "../content/economyRules";
import { createEconomyTickPlan } from "../engine/economySimulation";
import { displayCurrency } from "../engine/precision";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { TECHNOLOGY_CATALOG } from "../content/technology";
import { TECHNOLOGY_NAMES } from "../content/technologyNames";
import { ECONOMY_BUILDING_NAMES } from "../content/economyBuildingNames";
import { TECHNOLOGY_DESCRIPTIONS } from "../content/technologyDescriptions";
import { economyLabel } from "../i18n/economyMessages";
import { buildingBuyMaxPlan, checkPreconditions } from "../engine/commands";

interface EconomyPanesProps {
  readonly tabId: string;
  readonly state: GameState;
  readonly store: GameStore;
}

const NAMES = {
  en: {
    hydrogen: "Hydrogen",
    helium: "Helium",
    carbon: "Carbon",
    neon: "Neon",
    oxygen: "Oxygen",
    sodium: "Sodium",
    silicon: "Silicon",
    iron: "Iron",
    diesel: "Diesel",
    glass: "Glass",
    steel: "Steel",
    concrete: "Concrete",
    water: "Water",
    titanium: "Titanium",
  },
  es: {
    hydrogen: "Hidrógeno",
    helium: "Helio",
    carbon: "Carbono",
    neon: "Neón",
    oxygen: "Oxígeno",
    sodium: "Sodio",
    silicon: "Silicio",
    iron: "Hierro",
    diesel: "Diésel",
    glass: "Vidrio",
    steel: "Acero",
    concrete: "Hormigón",
    water: "Agua",
    titanium: "Titanio",
  },
  pt: {
    hydrogen: "Hidrogénio",
    helium: "Hélio",
    carbon: "Carbono",
    neon: "Néon",
    oxygen: "Oxigénio",
    sodium: "Sódio",
    silicon: "Silício",
    iron: "Ferro",
    diesel: "Diesel",
    glass: "Vidro",
    steel: "Aço",
    concrete: "Betão",
    water: "Água",
    titanium: "Titânio",
  },
  de: {
    hydrogen: "Wasserstoff",
    helium: "Helium",
    carbon: "Kohlenstoff",
    neon: "Neon",
    oxygen: "Sauerstoff",
    sodium: "Natrium",
    silicon: "Silizium",
    iron: "Eisen",
    diesel: "Diesel",
    glass: "Glas",
    steel: "Stahl",
    concrete: "Beton",
    water: "Wasser",
    titanium: "Titan",
  },
  it: {
    hydrogen: "Idrogeno",
    helium: "Elio",
    carbon: "Carbonio",
    neon: "Neon",
    oxygen: "Ossigeno",
    sodium: "Sodio",
    silicon: "Silicio",
    iron: "Ferro",
    diesel: "Diesel",
    glass: "Vetro",
    steel: "Acciaio",
    concrete: "Calcestruzzo",
    water: "Acqua",
    titanium: "Titanio",
  },
  fr: {
    hydrogen: "Hydrogène",
    helium: "Hélium",
    carbon: "Carbone",
    neon: "Néon",
    oxygen: "Oxygène",
    sodium: "Sodium",
    silicon: "Silicium",
    iron: "Fer",
    diesel: "Diesel",
    glass: "Verre",
    steel: "Acier",
    concrete: "Béton",
    water: "Eau",
    titanium: "Titane",
  },
} as const;

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
  const { locale, notation } = state.settings;
  return new Intl.NumberFormat(
    locale,
    notation === "scientific"
      ? { notation: "scientific", maximumSignificantDigits: Math.max(1, digits + 1) }
      : { maximumFractionDigits: digits },
  ).format(value);
}
function money(locale: GameState["settings"]["locale"], value: number): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(displayCurrency(value)));
}
export function economyGoodName(
  locale: GameState["settings"]["locale"],
  id: EconomicGoodId,
): string {
  return NAMES[locale][id];
}
function name(locale: GameState["settings"]["locale"], id: EconomicGoodId): string {
  return economyGoodName(locale, id);
}

export function economyRatePerSecond(state: GameState, id: EconomicGoodId): number {
  return createEconomyTickPlan(state).netRatesPerSecond[id] ?? 0;
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

export function EconomyPanes({ tabId, state, store }: EconomyPanesProps) {
  if (tabId === "resources") return <ResourceCatalogue state={state} store={store} />;
  if (tabId === "research") return <ResearchPanel state={state} store={store} />;
  if (tabId === "energy") return <EnergyPanel state={state} store={store} />;
  if (tabId === "compounds") return <CompoundPanel state={state} store={store} />;
  return <p className="pane-intro">{economyLabel(state.settings.locale, "resources")}</p>;
}

function ResourceCatalogue({ state, store }: Omit<EconomyPanesProps, "tabId">) {
  const locale = state.settings.locale;
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  return (
    <section
      className="economy-section"
      aria-labelledby="economy-resources-title"
      data-testid="economy-resource-cards"
    >
      <div className="economy-section-heading">
        <p className="eyebrow">02 / {t("resources")}</p>
        <h2 id="economy-resources-title">{t("resources")}</h2>
        <p>{t("initialHydrogen")}</p>
      </div>
      <button
        type="button"
        className="secondary-button"
        onClick={() => store.dispatch({ type: "economy.storage.increaseAll" })}
        disabled={!checkPreconditions(state, { type: "economy.storage.increaseAll" }).ok}
      >
        {t("increaseAllStorage")}
      </button>
      <div className="economy-card-grid">
        {MATERIAL_IDS.map((id) => (
          <ResourceCard key={id} id={id} state={state} store={store} />
        ))}
      </div>
    </section>
  );
}

function ResourceCard({
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
  const stock = state.run.goods[id];
  const isUnlocked = state.run.unlockedResources.includes(id);
  const [saleChoice, setSaleChoice] = useState("all");
  const [fusionTarget, setFusionTarget] = useState(material.fusionOutputs?.[0]?.goodId ?? "helium");
  const [fusionAmount, setFusionAmount] = useState(1);
  const selection =
    saleChoice === "all" || ["threeQuarters", "twoThirds", "half", "oneThird"].includes(saleChoice)
      ? (saleChoice as "all" | "threeQuarters" | "twoThirds" | "half" | "oneThird")
      : Number(saleChoice);
  const amount = selectedSaleAmount(stock.quantity, selection);
  const unlocked = isUnlocked;
  const fusionUnlocked = material.fusionTechId
    ? state.run.economy.researchedTechnologies.includes(material.fusionTechId as TechId)
    : false;
  const validTarget = material.fusionOutputs?.find((entry) => entry.goodId === fusionTarget);
  const storageCost = storagePurchaseCost(stock.storageCapacity);
  return (
    <article className={`economy-card${unlocked ? "" : " is-locked"}`} data-resource-id={id}>
      <header className="economy-card-heading">
        <span className="element-tile" aria-hidden="true">
          <small>{SYMBOL[id]}</small>
          {id.slice(0, 1).toUpperCase()}
        </span>
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
            {format(state, economyRatePerSecond(state, id), 2)} {t("perSecond")}
          </p>
          {id !== "hydrogen" && (
            <div className="economy-controls">
              <button
                type="button"
                className="primary-button"
                disabled={stock.quantity + 1 > stock.storageCapacity}
                onClick={() => store.dispatch({ type: "resource.collect", goodId: id })}
              >
                {t("collect")} {name(locale, id)}
              </button>
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
                {t("salePreview")}: <strong>{money(locale, amount * stock.saleValue)}</strong>
              </p>
              <button
                type="button"
                className="secondary-button"
                disabled={
                  !checkPreconditions(state, {
                    type: "resource.sell",
                    goodId: id,
                    amount: selection,
                  }).ok
                }
                onClick={() =>
                  store.dispatch({ type: "resource.sell", goodId: id, amount: selection })
                }
              >
                {t("sell")} {name(locale, id)} · {money(locale, amount * stock.saleValue)}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={!checkPreconditions(state, { type: "storage.purchase", goodId: id }).ok}
                onClick={() => store.dispatch({ type: "storage.purchase", goodId: id })}
              >
                {t("increaseStorage")} · {format(state, storageCost)} {SYMBOL[id]}
              </button>
            </div>
          )}
          <details className="economy-details">
            <summary>{t("autobuyers")}</summary>
            {[1, 2, 3, 4]
              .filter((tier) => id !== "hydrogen" || tier !== 1)
              .map((tier) => {
                const tierId = autobuyerUpgradeId(id, tier as 1 | 2 | 3 | 4);
                const buyer = material.buyerTiers[tier - 1]!;
                const owned = count(state, tierId);
                const requiredTech = availableTier(tier);
                const gateMet =
                  !requiredTech || state.run.economy.researchedTechnologies.includes(requiredTech);
                const tierPrice = scaledPriceAfterPurchases(buyer.price, owned);
                const effectiveRate =
                  buyer.ratePerSecond *
                  repeatedPerkMultiplier(state.permanent.acquiredPerks, "smartAutoBuyers", 1.5);
                return (
                  <div className="economy-tier" key={tier}>
                    <span>
                      {t("buyTier")} {tier}: {format(state, owned)} · +
                      {format(state, effectiveRate, 2)}/s · {format(state, buyer.energyPerSecond)}{" "}
                      kJ/s
                    </span>
                    {gateMet ? (
                      <button
                        type="button"
                        className="text-button"
                        disabled={
                          !checkPreconditions(state, {
                            type: "economy.autobuyer.purchase",
                            goodId: id,
                            tier: tier as 1 | 2 | 3 | 4,
                          }).ok
                        }
                        onClick={() =>
                          store.dispatch({
                            type: "economy.autobuyer.purchase",
                            goodId: id,
                            tier: tier as 1 | 2 | 3 | 4,
                          })
                        }
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
                        disabled={
                          !checkPreconditions(state, {
                            type: "economy.autobuyer.buyMax",
                            goodId: id,
                            tier: tier as 1 | 2 | 3 | 4,
                          }).ok
                        }
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
          </details>
          <AllocationControls id={id} state={state} store={store} />
          {material.fusionOutputs && (
            <details className="economy-details">
              <summary>{t("fuse")}</summary>
              <div className="economy-controls">
                {fusionUnlocked ? (
                  <>
                    <label>
                      {t("target")}
                      <select
                        aria-label={`${t("target")} ${name(locale, id)}`}
                        value={fusionTarget}
                        onChange={(event) =>
                          setFusionTarget(event.currentTarget.value as MaterialId)
                        }
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
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={
                        !Number.isSafeInteger(fusionAmount) ||
                        fusionAmount > stock.quantity ||
                        !validTarget
                      }
                      onClick={() =>
                        store.dispatch({
                          type: "economy.fuse",
                          sourceId: id,
                          targetId: fusionTarget as MaterialId,
                          amount: fusionAmount,
                        })
                      }
                    >
                      {t("fuse")} {name(locale, id)}
                    </button>
                  </>
                ) : (
                  <p>
                    {t("lockedBy")}: {techName(locale, material.fusionTechId ?? "")}
                  </p>
                )}
              </div>
            </details>
          )}
        </>
      ) : (
        <p>
          {t("lockedBy")}: {techName(locale, material.fusionTechId ?? "hydrogenFusion")}
        </p>
      )}
    </article>
  );
}

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
  const retained = Math.max(0, 100 - allocation.cashShare - allocation.compoundShare);
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
  return (
    <details className="economy-details">
      <summary>{t("allocation")}</summary>
      {!available && (
        <p>
          {t("lockedBy")}: {t("nanoBrokersRequirement").replace("{level}", "I")}
        </p>
      )}
      <label>
        {t("cashShare")} (%)
        <input
          type="number"
          min={0}
          max={100 - allocation.compoundShare}
          value={allocation.cashShare}
          disabled={!available}
          onChange={(event) =>
            update(
              Number(event.currentTarget.value),
              Math.min(allocation.compoundShare, 100 - Number(event.currentTarget.value)),
            )
          }
        />
      </label>
      <label>
        {t("compoundShare")} (%)
        <input
          type="number"
          min={0}
          max={100 - allocation.cashShare}
          value={allocation.compoundShare}
          disabled={!available}
          onChange={(event) => update(allocation.cashShare, Number(event.currentTarget.value))}
        />
      </label>
      <p>
        {t("retainedShare")}: {format(state, retained)}%
      </p>
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

function CompoundPanel({ state, store }: Omit<EconomyPanesProps, "tabId">) {
  const locale = state.settings.locale;
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const compoundsAvailable = state.run.economy.researchedTechnologies.includes("compounds");
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
        <p className="eyebrow">04 / {t("recipe")}</p>
        <h2>{t("recipe")}</h2>
      </div>
      <div className="economy-card-grid">
        {Object.entries(COMPOUND_CATALOG).map(([rawId, definition]) => {
          const id = rawId as keyof typeof COMPOUND_CATALOG;
          const unlocked = state.run.economy.unlockedCompounds.includes(id);
          const output = state.run.goods[id];
          const amount = amounts[id] ?? 1;
          const saleChoice = saleChoices[id] ?? "all";
          const saleSelection = saleChoice === "all" ? ("all" as const) : Number(saleChoice);
          const saleAmount = selectedSaleAmount(output.quantity, saleSelection);
          const recipeText = definition.recipe
            .map((input) => `${input.amount} ${name(locale, input.goodId)}`)
            .join(" + ");
          const canCreate = checkPreconditions(state, {
            type: "economy.compound.create",
            goodId: id,
            amount,
          }).ok;
          return (
            <article
              key={id}
              className={`economy-card${unlocked ? "" : " is-locked"}`}
              data-compound-id={id}
            >
              <header className="economy-card-heading">
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
                    {format(state, economyRatePerSecond(state, id), 2)} {t("perSecond")}
                  </p>
                  <p>
                    {t("salePreview")}: {money(locale, saleAmount * output.saleValue)}
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
                    disabled={
                      !checkPreconditions(state, {
                        type: "resource.sell",
                        goodId: id,
                        amount: saleSelection,
                      }).ok
                    }
                    onClick={() =>
                      store.dispatch({ type: "resource.sell", goodId: id, amount: saleSelection })
                    }
                  >
                    {t("sell")} {name(locale, id)}
                  </button>
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
                    disabled={!canCreate}
                    onClick={() =>
                      store.dispatch({ type: "economy.compound.create", goodId: id, amount })
                    }
                  >
                    {t("create")} {name(locale, id)}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={
                      !checkPreconditions(state, { type: "storage.purchase", goodId: id }).ok
                    }
                    onClick={() => store.dispatch({ type: "storage.purchase", goodId: id })}
                  >
                    {t("increaseStorage")} ·{" "}
                    {format(state, storagePurchaseCost(output.storageCapacity))} {SYMBOL[id]}
                    {id === "water"
                      ? ` + ${format(state, output.storageCapacity * 0.3)} ${name(locale, "concrete")}`
                      : ""}
                  </button>
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
                                disabled={
                                  !checkPreconditions(state, {
                                    type: "economy.autobuyer.purchase",
                                    goodId: id,
                                    tier: tierNumber,
                                  }).ok
                                }
                                onClick={() =>
                                  store.dispatch({
                                    type: "economy.autobuyer.purchase",
                                    goodId: id,
                                    tier: tierNumber,
                                  })
                                }
                              >
                                {t("buy")} · {format(state, tierPrice)} {SYMBOL[id]}
                              </button>
                              {isBulkPurchasingAvailable(state) && (
                                <button
                                  type="button"
                                  className="text-button"
                                  disabled={
                                    !checkPreconditions(state, {
                                      type: "economy.autobuyer.buyMax",
                                      goodId: id,
                                      tier: tierNumber,
                                    }).ok
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
                        onChange={(event) =>
                          store.dispatch({
                            type: "economy.autoCreate.toggle",
                            goodId: id,
                            enabled: event.currentTarget.checked,
                          })
                        }
                      />
                      {t("automaticCreation")}
                      {!isPerkAvailable(state, 2) &&
                        ` · ${t("lockedBy")}: ${t("nanoBrokersRequirement").replace("{level}", "II")}`}
                    </label>
                  </details>
                </>
              ) : (
                <p>
                  {t("lockedBy")}: {techName(locale, definition.unlockTechId)}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ResearchPanel({ state, store }: Omit<EconomyPanesProps, "tabId">) {
  const locale = state.settings.locale;
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const researched = state.run.economy.researchedTechnologies;
  const previousResearch = useRef<readonly TechId[]>(researched);
  const [newlyResearched, setNewlyResearched] = useState<readonly TechId[]>([]);
  useEffect(() => {
    const added = researched.filter((id) => !previousResearch.current.includes(id));
    previousResearch.current = researched;
    if (added.length > 0) setNewlyResearched(added);
  }, [researched]);
  const tick = createEconomyTickPlan(state);
  const researchBuildings = Object.keys(SCIENCE_BUILDINGS) as (keyof typeof SCIENCE_BUILDINGS)[];
  const revealed = state.run.economy.revealedTechnologies
    .map((id) => TECHNOLOGY_CATALOG.find((entry) => entry.id === id)!)
    .sort((left, right) => left.path - right.path || left.renderPosition - right.renderPosition);
  const paths = [...new Set(revealed.map((technology) => technology.path))];
  return (
    <section className="economy-section" data-testid="economy-research">
      <div className="economy-section-heading">
        <p className="eyebrow">03 / {t("research")}</p>
        <h2>{t("research")}</h2>
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
      {newlyResearched.length > 0 && (
        <output className="live-feedback" data-testid="research-feedback">
          {t("technologiesResearched").replace(
            "{technologies}",
            newlyResearched.map((id) => techName(locale, id)).join(", "),
          )}
        </output>
      )}
      <div className="economy-card-grid">
        {researchBuildings.map((id) => {
          const def = SCIENCE_BUILDINGS[id];
          const owned = count(state, id);
          const price = scaledPriceAfterPurchases(def.price, owned);
          const gate = def.techId;
          const gateMet = !gate || researched.includes(gate as TechId);
          const singleCommand = { type: "economy.building.purchase" as const, buildingId: id };
          const bulkCommand = { type: "economy.building.buyMax" as const, buildingId: id };
          const maxPlan = buildingBuyMaxPlan(state, id);
          return (
            <article className="economy-card" key={id} data-building-id={id}>
              <h3>{techName(locale, id)}</h3>
              <p>
                +{format(state, def.ratePerSecond, 2)} RP/s · {format(state, def.energyPerSecond)}{" "}
                kJ/s
              </p>
              <p>
                {t("owned")}: {format(state, owned)}
              </p>
              <p>{money(locale, price)}</p>
              {gateMet ? (
                <div className="economy-building-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={!checkPreconditions(state, singleCommand).ok}
                    onClick={() => store.dispatch(singleCommand)}
                  >
                    {t("buy")}
                  </button>
                  {isBulkPurchasingAvailable(state) && (
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={maxPlan.count === 0 || !checkPreconditions(state, bulkCommand).ok}
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
          onChange={(event) =>
            store.dispatch({
              type: "economy.research.autobuyer.toggle",
              enabled: event.currentTarget.checked,
            })
          }
        />
        {t("researchAutobuyer")}
      </label>
      {!isResearchAutomationAvailable(state) && (
        <p>
          {t("lockedBy")}: {t("researchAutomation")}
        </p>
      )}
      <div className="economy-section-heading">
        <h2>{t("technologies")}</h2>
        <p>
          {researched.length} / {TECHNOLOGY_CATALOG.length} ·{" "}
          {state.run.economy.revealedTechnologies.length} {t("unlocked")}
        </p>
      </div>
      <div className="technology-tree" data-testid="technology-tree">
        {paths.map((path) => (
          <section className="technology-path" key={path} data-tech-path={path}>
            <h3>
              {t("path")} {path}
            </h3>
            <div className="economy-card-grid">
              {revealed
                .filter((technology) => technology.path === path)
                .map((def) => {
                  const id = def.id;
                  const done = researched.includes(id);
                  const prereqsMet = def.requires.every((required) =>
                    researched.includes(required),
                  );
                  const canResearch =
                    !done &&
                    checkPreconditions(state, { type: "economy.research", technologyId: id }).ok;
                  return (
                    <article
                      className="economy-card tech-card"
                      key={id}
                      data-technology-id={id}
                      data-render-position={def.renderPosition}
                    >
                      <h3>{techName(locale, id)}</h3>
                      <p className="tech-effect">{TECHNOLOGY_DESCRIPTIONS[id][locale]}</p>
                      <p>
                        {t("points")}: {format(state, def.price)}
                      </p>
                      <p>
                        {t("prerequisites")}:{" "}
                        {def.requires.length
                          ? def.requires.map((required) => techName(locale, required)).join(", ")
                          : "—"}
                      </p>
                      <p>{done ? t("researched") : prereqsMet ? t("ready") : t("lockedBy")}</p>
                      {done ? (
                        <span className="status-pill">{t("researched")}</span>
                      ) : (
                        <button
                          type="button"
                          className="secondary-button"
                          aria-label={`${t("researchTech")}: ${techName(locale, id)}`}
                          disabled={!canResearch}
                          onClick={() =>
                            store.dispatch({ type: "economy.research", technologyId: id })
                          }
                        >
                          {t("researchTech")}
                        </button>
                      )}
                    </article>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function EnergyPanel({ state, store }: Omit<EconomyPanesProps, "tabId">) {
  const locale = state.settings.locale;
  const t = (key: Parameters<typeof economyLabel>[1]) => economyLabel(locale, key);
  const tick = createEconomyTickPlan(state);
  const energyTech = state.run.economy.researchedTechnologies.includes("basicPowerGeneration");
  const plants = ["powerPlant1", "powerPlant2", "powerPlant3"] as const;
  const batteries = ["battery1", "battery2", "battery3"] as const;
  return (
    <section className="economy-section" data-testid="economy-energy">
      <div className="economy-section-heading">
        <p className="eyebrow">05 / {t("energy")}</p>
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
      <label className="economy-toggle">
        <input
          type="checkbox"
          checked={state.run.economy.power.gridEnabled}
          onChange={(event) =>
            store.dispatch({ type: "economy.power.toggle", enabled: event.currentTarget.checked })
          }
        />
        {t("powerGrid")}
      </label>
      <button
        type="button"
        className="text-button"
        disabled={!plants.some((id) => count(state, id) > 0)}
        onClick={() => {
          const shouldEnable = plants.some(
            (id) => count(state, id) > 0 && !state.run.economy.buildingEnabled[id],
          );
          for (const id of plants) {
            if (count(state, id) > 0 && state.run.economy.buildingEnabled[id] !== shouldEnable)
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
      {!energyTech && (
        <LockedPane
          locale={locale}
          title={t("energy")}
          requirement={techName(locale, "basicPowerGeneration")}
        />
      )}
      <div className="economy-card-grid">
        {plants.map((id) => {
          const def = ENERGY_BUILDINGS[id];
          const outputMultiplier =
            repeatedPerkMultiplier(state.permanent.acquiredPerks, "optimizedPowerGrids", 1.35) *
            (id === "powerPlant2" ? state.run.economy.power.environmentalMultiplier : 1);
          const owned = count(state, id);
          const cashPrice = scaledPriceAfterPurchases(def.price.cash, owned);
          const materialPrices = def.price.materials.map((item) => ({
            ...item,
            amount: scaledPriceAfterPurchases(item.amount, owned),
          }));
          const gate = def.techId;
          const unlocked = state.run.economy.researchedTechnologies.includes(gate as TechId);
          const costs = materialPrices
            .map((item) => `${format(state, item.amount)} ${name(locale, item.goodId)}`)
            .join(" + ");
          const singleCommand = { type: "economy.building.purchase" as const, buildingId: id };
          const bulkCommand = { type: "economy.building.buyMax" as const, buildingId: id };
          const maxPlan = buildingBuyMaxPlan(state, id);
          return (
            <article className="economy-card" key={id} data-building-id={id}>
              <h3>{techName(locale, id)}</h3>
              <p>
                +{format(state, def.ratePerSecond * outputMultiplier)} kJ/s{" "}
                {def.fuel
                  ? `· ${format(state, def.fuel.unitsPerSecond)} ${name(locale, def.fuel.goodId)} / s`
                  : ""}
              </p>
              <p>
                {t("owned")}: {format(state, owned)} · {money(locale, cashPrice)}{" "}
                {costs && `+ ${costs}`}
              </p>
              {unlocked ? (
                <div className="economy-building-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={!checkPreconditions(state, singleCommand).ok}
                    onClick={() => store.dispatch(singleCommand)}
                  >
                    {t("buy")}
                  </button>
                  {isBulkPurchasingAvailable(state) && (
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={maxPlan.count === 0 || !checkPreconditions(state, bulkCommand).ok}
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
          const cashPrice = scaledPriceAfterPurchases(def.price.cash, owned);
          const materialPrices = def.price.materials.map((item) => ({
            ...item,
            amount: scaledPriceAfterPurchases(item.amount, owned),
          }));
          const unlocked = state.run.economy.researchedTechnologies.includes(def.techId as TechId);
          const costs = materialPrices
            .map((item) => `${format(state, item.amount)} ${name(locale, item.goodId)}`)
            .join(" + ");
          const singleCommand = { type: "economy.building.purchase" as const, buildingId: id };
          const bulkCommand = { type: "economy.building.buyMax" as const, buildingId: id };
          const maxPlan = buildingBuyMaxPlan(state, id);
          return (
            <article className="economy-card" key={id} data-building-id={id}>
              <h3>{techName(locale, id)}</h3>
              <p>
                +{format(state, def.capacity)} kJ {t("capacity")}
              </p>
              <p>
                {t("owned")}: {format(state, owned)} · {money(locale, cashPrice)} + {costs}
              </p>
              {unlocked ? (
                <div className="economy-building-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={!checkPreconditions(state, singleCommand).ok}
                    onClick={() => store.dispatch(singleCommand)}
                  >
                    {t("buy")}
                  </button>
                  {isBulkPurchasingAvailable(state) && (
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={maxPlan.count === 0 || !checkPreconditions(state, bulkCommand).ok}
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
            </article>
          );
        })}
      </div>
    </section>
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
