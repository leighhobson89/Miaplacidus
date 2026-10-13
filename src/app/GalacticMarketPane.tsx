import { useState } from "react";
import { ECONOMIC_GOOD_IDS, type EconomicGoodId } from "../content/ids";
import { checkPreconditions } from "../engine/commands";
import {
  galacticMarketUnitPrice,
  quoteGalacticTrade,
} from "../engine/galacticMarket";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { economyGoodName } from "./economyDisplay";
import { formatCurrency } from "./currencyFormatting";
import { formatNumber } from "./numberFormatting";
import { marketFailureText, marketLockCountdownText, marketText } from "../i18n/metaMessages";
import {
  marketBiasHelpLabel,
  marketBiasHelpText,
  marketSourceHelpLabel,
  marketSourceHelpText,
} from "../i18n/marketMessages";
import { CelestialIllustration } from "./CelestialIllustration";
import { InfoTooltip } from "./InfoTooltip";
import { PageArtworkRow } from "./PageArtworkRow";

interface Props {
  readonly state: GameState;
  readonly store: GameStore;
}

function whole(state: GameState, value: number): string {
  return formatNumber(state.settings.locale, value, 0, state.settings.notation);
}

function currency(state: GameState, value: number): string {
  return formatCurrency(
    state.settings.locale,
    value,
    state.settings.currencyId ?? "usd",
    0,
    state.settings.notation,
  );
}

function unitValue(state: GameState, value: number): string {
  return formatCurrency(
    state.settings.locale,
    value,
    state.settings.currencyId ?? "usd",
    4,
    state.settings.notation,
  );
}

export function GalacticMarketPane({ state, store }: Props) {
  const locale = state.settings.locale;
  const market = state.permanent.galacticMarket;
  const unlockedGoods = ECONOMIC_GOOD_IDS.filter(
    (goodId) =>
      state.run.unlockedResources.includes(
        goodId as (typeof state.run.unlockedResources)[number],
      ) ||
      state.run.economy.unlockedCompounds.includes(
        goodId as (typeof state.run.economy.unlockedCompounds)[number],
      ),
  );
  const [outgoingGoodId, setOutgoingGoodId] = useState<EconomicGoodId | "">(unlockedGoods[0] ?? "");
  const [incomingGoodId, setIncomingGoodId] = useState<EconomicGoodId | "">("");
  const [quantityText, setQuantityText] = useState("1");
  const [apSellQuantity, setApSellQuantity] = useState<1 | 5 | 10>(1);
  const [feedback, setFeedback] = useState("");
  const selectedMarketGoods = ECONOMIC_GOOD_IDS.filter(
    (goodId) => goodId === outgoingGoodId || goodId === incomingGoodId,
  );
  const outgoingBias = outgoingGoodId ? market.goods[outgoingGoodId].marketBias : null;
  const incomingBias = incomingGoodId ? market.goods[incomingGoodId].marketBias : null;
  const marketNumber = (value: number) =>
    formatNumber(locale, value, 2, state.settings.notation, "always");
  const quantity = Number(quantityText);
  const quote =
    outgoingGoodId && incomingGoodId
      ? quoteGalacticTrade(state, outgoingGoodId, incomingGoodId, quantity)
      : null;
  const tradeCommand =
    outgoingGoodId && incomingGoodId
      ? { type: "meta.market.trade" as const, outgoingGoodId, incomingGoodId, quantity }
      : null;
  const tradeCheck = tradeCommand
    ? checkPreconditions(state, tradeCommand)
    : { ok: false as const, failure: { code: "market-invalid-trade" } };
  const apSellCheck = checkPreconditions(state, {
    type: "meta.market.sell-ap",
    quantity: apSellQuantity,
  });
  const marketFailureReason = (
    check: { readonly ok: boolean; readonly failure?: { readonly code: string } },
    details: Parameters<typeof marketFailureText>[2] = {},
  ): string => {
    const code =
      state.run.marketLockdownRemainingMs > 0
        ? "market-locked"
        : check.ok
          ? ""
          : (check.failure?.code ?? "");
    if (!code) return "";
    const failure = marketFailureText(locale, code, details);
    return code === "market-locked"
      ? `${failure} ${marketLockCountdownText(locale, state.run.marketLockdownRemainingMs, (value) => whole(state, value))}`
      : failure;
  };
  const tradeFailureCode = tradeCheck.ok ? "" : (tradeCheck.failure?.code ?? "");
  const tradeReason = marketFailureReason(
    tradeCheck,
    tradeFailureCode === "market-insufficient-stock" && outgoingGoodId
      ? {
          required: whole(state, Number.isSafeInteger(quantity) ? quantity : 0),
          available: whole(state, state.run.goods[outgoingGoodId].quantity),
          good: economyGoodName(locale, outgoingGoodId),
        }
      : tradeFailureCode === "market-capacity" && incomingGoodId
        ? {
            required: whole(state, quote?.incomingQuantity ?? 0),
            available: whole(
              state,
              Math.max(
                0,
                state.run.goods[incomingGoodId].storageCapacity -
                  state.run.goods[incomingGoodId].quantity,
              ),
            ),
            good: economyGoodName(locale, incomingGoodId),
            capacity: whole(state, state.run.goods[incomingGoodId].storageCapacity),
          }
        : {},
  );
  const apSellReason = marketFailureReason(apSellCheck, {
    required: whole(state, apSellQuantity),
    available: whole(state, state.permanent.ascendencyPoints),
  });
  function dispatchTrade(): void {
    if (!tradeCommand || !outgoingGoodId || !incomingGoodId) return;
    const result = store.dispatch(tradeCommand);
    if (!result.accepted) {
      setFeedback(marketFailureText(locale, result.failure?.code ?? ""));
      return;
    }
    setQuantityText("");
    setFeedback("");
  }

  function sellAp(): void {
    const result = store.dispatch({ type: "meta.market.sell-ap", quantity: apSellQuantity });
    setFeedback(
      result.accepted
        ? `${whole(state, apSellQuantity)} AP · ${currency(state, apSellQuantity * market.apSellPrice)}`
        : marketFailureText(locale, result.failure?.code ?? ""),
    );
  }

  const disabled = state.run.marketLockdownRemainingMs > 0;
  return (
    <section className="galactic-market-pane" aria-labelledby="galactic-market-title">
      <div className="pane-heading">
        <div>
          <h2
            id="galactic-market-title"
            className="game-page-title"
          >
            {marketText(locale, "heading")}
          </h2>
          <p>{marketText(locale, "description")}</p>
        </div>
      </div>
      <PageArtworkRow>
        <CelestialIllustration kind="asteroid" />
      </PageArtworkRow>
      <div className="action-grid">
        <article className="upgrade-card">
          <div className="card-copy">
            <h3>
              {marketText(locale, "preview")}
              <InfoTooltip
                id="galactic-market-trade-source-help"
                label={marketSourceHelpLabel(locale, "trade")}
                content={marketSourceHelpText(locale, "trade")}
                testId="galactic-market-trade-source-help"
              />
              {(outgoingBias !== null || incomingBias !== null) && (
                <InfoTooltip
                  id="galactic-market-bias-help"
                  label={marketBiasHelpLabel(locale)}
                  content={marketBiasHelpText(locale, outgoingBias, incomingBias)}
                  testId="galactic-market-bias-help"
                />
              )}
            </h3>
            <p>
              {marketText(locale, "commission")}: {whole(state, market.commissionPercent)}%
            </p>
            {selectedMarketGoods.map((goodId) => (
              <p className="market-rate-detail" key={goodId}>
                {economyGoodName(locale, goodId)} — {marketText(locale, "adjustedValue")}:{" "}
                {unitValue(state, galacticMarketUnitPrice(state, goodId))};{" "}
                {marketText(locale, "marketBias")}: {marketNumber(market.goods[goodId].marketBias)}
                %; {marketText(locale, "tradeVolume")}:{" "}
                {whole(state, market.goods[goodId].tradeVolume)}
              </p>
            ))}
            {unlockedGoods.length < 2 ? (
              <p>{marketText(locale, "goodLocked")}</p>
            ) : (
              <>
                <label>
                  {marketText(locale, "tradeRow")}
                  <select
                    aria-label={marketText(locale, "tradeRow")}
                    value={outgoingGoodId}
                    disabled={disabled}
                    onChange={(event) => {
                      const next = event.currentTarget.value as EconomicGoodId;
                      setOutgoingGoodId(next);
                      if (next === incomingGoodId) setIncomingGoodId("");
                    }}
                  >
                    {unlockedGoods.map((goodId) => (
                      <option key={goodId} value={goodId}>
                        {economyGoodName(locale, goodId)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {marketText(locale, "tradeFor")}
                  <select
                    aria-label={marketText(locale, "tradeFor")}
                    value={incomingGoodId}
                    disabled={disabled}
                    onChange={(event) =>
                      setIncomingGoodId(event.currentTarget.value as EconomicGoodId | "")
                    }
                  >
                    <option value="">—</option>
                    {unlockedGoods
                      .filter((goodId) => goodId !== outgoingGoodId)
                      .map((goodId) => (
                        <option key={goodId} value={goodId}>
                          {economyGoodName(locale, goodId)}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  {marketText(locale, "quantity")}
                  <input
                    aria-label={marketText(locale, "quantity")}
                    type="number"
                    min="1"
                    step="1"
                    value={quantityText}
                    disabled={disabled}
                    onChange={(event) => setQuantityText(event.currentTarget.value)}
                  />
                </label>
                <p>{marketText(locale, "confirmRowLabel")}</p>
                <p>
                  {marketText(locale, "summaryOutgoing")}{" "}
                  {whole(state, Number.isSafeInteger(quantity) ? quantity : 0)}{" "}
                  {outgoingGoodId ? economyGoodName(locale, outgoingGoodId) : ""}
                </p>
                <p>
                  {marketText(locale, "summaryIncoming")} {whole(state, quote?.incomingQuantity ?? 0)}{" "}
                  {incomingGoodId ? economyGoodName(locale, incomingGoodId) : ""}
                </p>
                <p>
                  {marketText(locale, "commission")}: {whole(state, quote?.commissionQuantity ?? 0)}{" "}
                  {outgoingGoodId ? economyGoodName(locale, outgoingGoodId) : ""}
                </p>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={!tradeCheck.ok || disabled}
                  aria-describedby={tradeReason ? "galactic-market-trade-reason" : undefined}
                  onClick={dispatchTrade}
                >
                  {marketText(locale, "trade")}
                </button>
                {tradeReason && (
                  <p id="galactic-market-trade-reason" className="control-reason">
                    {tradeReason}
                  </p>
                )}
              </>
            )}
          </div>
        </article>
        <article className="upgrade-card">
          <div className="card-copy">
            <h3>
              {marketText(locale, "sellAp")}
              <InfoTooltip
                id="galactic-market-ap-sale-source-help"
                label={marketSourceHelpLabel(locale, "sellAp")}
                content={marketSourceHelpText(locale, "sellAp")}
                testId="galactic-market-ap-sale-source-help"
              />
            </h3>
            <p>
              {marketText(locale, "apPrice")}: {currency(state, market.apSellPrice)}
            </p>
            <label>
              {marketText(locale, "sellAp")}
              <select
                aria-label={marketText(locale, "sellAp")}
                value={apSellQuantity}
                disabled={disabled}
                onChange={(event) =>
                  setApSellQuantity(Number(event.currentTarget.value) as 1 | 5 | 10)
                }
              >
                {[1, 5, 10].map((amount) => {
                  const label =
                    amount === 1 ? "sellAp1" : amount === 5 ? "sellAp5" : "sellAp10";
                  return (
                    <option key={amount} value={amount}>
                      {marketText(locale, label)}
                    </option>
                  );
                })}
              </select>
            </label>
            <p>
              {marketText(locale, "cashGain")} {" "}
              {currency(state, apSellQuantity * market.apSellPrice)}
            </p>
            <button
              type="button"
              className="secondary-button"
              disabled={!apSellCheck.ok || disabled}
              aria-describedby={apSellReason ? "galactic-market-ap-sale-reason" : undefined}
              onClick={sellAp}
            >
              {marketText(locale, "sellApAction")}
            </button>
            {apSellReason && (
              <p id="galactic-market-ap-sale-reason" className="control-reason">
                {apSellReason}
              </p>
            )}
          </div>
        </article>
      </div>
      <output className="live-feedback" aria-live="polite">
        {feedback}
      </output>
      <section className="market-history" aria-labelledby="market-history-title">
        <h3 id="market-history-title">{marketText(locale, "history")}</h3>
        {market.history.length === 0 ? (
          <p>{marketText(locale, "noHistory")}</p>
        ) : (
          <ol>
            {[...market.history].reverse().map((entry) => (
              <li key={entry.id}>
                {whole(state, entry.outgoingQuantity)}{" "}
                {economyGoodName(locale, entry.outgoingGoodId)} →{" "}
                {whole(state, entry.incomingQuantity)}{" "}
                {economyGoodName(locale, entry.incomingGoodId)} ({marketText(locale, "commission")}:{" "}
                {whole(state, entry.commissionQuantity)})
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}
