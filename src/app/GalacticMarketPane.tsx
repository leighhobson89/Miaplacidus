import { useEffect, useRef, useState } from "react";
import { ECONOMIC_GOOD_IDS, type EconomicGoodId } from "../content/ids";
import { checkPreconditions } from "../engine/commands";
import {
  galacticMarketUnitPrice,
  marketLiquidationPreview,
  quoteGalacticTrade,
} from "../engine/galacticMarket";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { economyGoodName } from "./EconomyPanes";
import { marketFailureText, marketLockCountdownText, marketText } from "../i18n/metaMessages";

interface Props {
  readonly state: GameState;
  readonly store: GameStore;
}

function whole(locale: GameState["settings"]["locale"], value: number): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

function currency(locale: GameState["settings"]["locale"], value: number): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function unitValue(locale: GameState["settings"]["locale"], value: number): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 4,
  }).format(value);
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
  const [confirmLiquidation, setConfirmLiquidation] = useState(false);
  const [feedback, setFeedback] = useState("");
  const liquidationDialog = useRef<HTMLDialogElement>(null);
  const selectedMarketGoods = ECONOMIC_GOOD_IDS.filter(
    (goodId) => goodId === outgoingGoodId || goodId === incomingGoodId,
  );
  const marketNumber = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    signDisplay: "always",
  });
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
  const liquidationCommand = { type: "meta.market.liquidate" as const };
  const liquidationCheck = checkPreconditions(state, liquidationCommand);
  const liquidation = marketLiquidationPreview(state);

  useEffect(() => {
    const dialog = liquidationDialog.current;
    if (confirmLiquidation && dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, [confirmLiquidation]);

  function dispatchTrade(): void {
    if (!tradeCommand || !outgoingGoodId || !incomingGoodId) return;
    const result = store.dispatch(tradeCommand);
    if (!result.accepted) {
      setFeedback(marketFailureText(locale, result.failure?.code ?? ""));
      return;
    }
    setQuantityText("");
    setFeedback(
      `${whole(locale, quantity)} ${economyGoodName(locale, outgoingGoodId)} → ${whole(locale, quote?.incomingQuantity ?? 0)} ${economyGoodName(locale, incomingGoodId)}`,
    );
  }

  function sellAp(): void {
    const result = store.dispatch({ type: "meta.market.sell-ap", quantity: apSellQuantity });
    setFeedback(
      result.accepted
        ? `${whole(locale, apSellQuantity)} AP · ${currency(locale, apSellQuantity * market.apSellPrice)}`
        : marketFailureText(locale, result.failure?.code ?? ""),
    );
  }

  function liquidate(): void {
    const result = store.dispatch(liquidationCommand);
    setConfirmLiquidation(false);
    setFeedback(
      result.accepted
        ? `${whole(locale, liquidation.ap)} AP`
        : marketFailureText(locale, result.failure?.code ?? ""),
    );
  }

  const disabled = state.run.marketLockdownRemainingMs > 0;
  return (
    <section className="galactic-market-pane" aria-labelledby="galactic-market-title">
      <div className="pane-heading">
        <div>
          <h2 id="galactic-market-title">{marketText(locale, "heading")}</h2>
          <p>{marketText(locale, "description")}</p>
        </div>
      </div>
      <div className="action-grid">
        <article className="upgrade-card">
          <div className="card-copy">
            <h3>{marketText(locale, "preview")}</h3>
            <p>
              {marketText(locale, "commission")}: {whole(locale, market.commissionPercent)}%
            </p>
            {selectedMarketGoods.map((goodId) => (
              <p className="market-rate-detail" key={goodId}>
                {economyGoodName(locale, goodId)} — {marketText(locale, "adjustedValue")}:{" "}
                {unitValue(locale, galacticMarketUnitPrice(state, goodId))};{" "}
                {marketText(locale, "marketBias")}:{" "}
                {marketNumber.format(market.goods[goodId].marketBias)}%;{" "}
                {marketText(locale, "tradeVolume")}:{" "}
                {whole(locale, market.goods[goodId].tradeVolume)}
              </p>
            ))}
            {unlockedGoods.length < 2 ? (
              <p>{marketText(locale, "goodLocked")}</p>
            ) : (
              <>
                <label>
                  {marketText(locale, "outgoing")}
                  <select
                    aria-label={marketText(locale, "outgoing")}
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
                  {marketText(locale, "incoming")}
                  <select
                    aria-label={marketText(locale, "incoming")}
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
                <p>
                  {marketText(locale, "outgoing")}:{" "}
                  {whole(locale, Number.isSafeInteger(quantity) ? quantity : 0)}{" "}
                  {outgoingGoodId ? economyGoodName(locale, outgoingGoodId) : ""}
                </p>
                <p>
                  {marketText(locale, "incoming")}: {whole(locale, quote?.incomingQuantity ?? 0)}{" "}
                  {incomingGoodId ? economyGoodName(locale, incomingGoodId) : ""}
                </p>
                <p>
                  {marketText(locale, "commission")}:{" "}
                  {whole(locale, quote?.commissionQuantity ?? 0)}{" "}
                  {outgoingGoodId ? economyGoodName(locale, outgoingGoodId) : ""}
                </p>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={!tradeCheck.ok || disabled}
                  onClick={dispatchTrade}
                >
                  {marketText(locale, "trade")}
                </button>
              </>
            )}
          </div>
        </article>
        <article className="upgrade-card">
          <div className="card-copy">
            <h3>{marketText(locale, "sellAp")}</h3>
            <p>
              {marketText(locale, "apPrice")}: {currency(locale, market.apSellPrice)}
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
                {[1, 5, 10].map((amount) => (
                  <option key={amount} value={amount}>
                    {amount} AP
                  </option>
                ))}
              </select>
            </label>
            <p>{currency(locale, apSellQuantity * market.apSellPrice)}</p>
            <button
              type="button"
              className="secondary-button"
              disabled={!apSellCheck.ok || disabled}
              onClick={sellAp}
            >
              {marketText(locale, "sellApAction")}
            </button>
          </div>
        </article>
        <article className="upgrade-card">
          <div className="card-copy">
            <h3>{marketText(locale, "liquidation")}</h3>
            <p>
              {marketText(locale, "liquidationValue")}: {currency(locale, liquidation.value)}
            </p>
            <p>
              {marketText(locale, "liquidationAp")}: {whole(locale, liquidation.ap)}
            </p>
            <button
              type="button"
              className="secondary-button"
              disabled={!liquidationCheck.ok || disabled}
              onClick={() => setConfirmLiquidation(true)}
            >
              {marketText(locale, "liquidate")}
            </button>
          </div>
        </article>
      </div>
      {disabled && (
        <p className="control-reason">
          {marketText(locale, "locked")}{" "}
          {marketLockCountdownText(locale, state.run.marketLockdownRemainingMs)}
        </p>
      )}
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
                {whole(locale, entry.outgoingQuantity)}{" "}
                {economyGoodName(locale, entry.outgoingGoodId)} →{" "}
                {whole(locale, entry.incomingQuantity)}{" "}
                {economyGoodName(locale, entry.incomingGoodId)} ({marketText(locale, "commission")}:{" "}
                {whole(locale, entry.commissionQuantity)})
              </li>
            ))}
          </ol>
        )}
      </section>
      {confirmLiquidation && (
        <dialog
          ref={liquidationDialog}
          className="confirmation-dialog"
          aria-labelledby="market-liquidation-title"
          onCancel={() => setConfirmLiquidation(false)}
        >
          <h2 id="market-liquidation-title">{marketText(locale, "liquidateTitle")}</h2>
          <p>{marketText(locale, "liquidatePrompt")}</p>
          <p>
            {marketText(locale, "liquidationValue")}: {currency(locale, liquidation.value)}
          </p>
          <p>
            {marketText(locale, "liquidationAp")}: {whole(locale, liquidation.ap)}
          </p>
          <div className="card-controls">
            <button type="button" className="primary-button" onClick={liquidate}>
              {marketText(locale, "confirmLiquidation")}
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => setConfirmLiquidation(false)}
            >
              {marketText(locale, "cancel")}
            </button>
          </div>
        </dialog>
      )}
    </section>
  );
}
