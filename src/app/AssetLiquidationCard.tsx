import { useEffect, useRef, useState } from "react";
import { checkPreconditions } from "../engine/commands";
import { marketLiquidationPreview } from "../engine/galacticMarket";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { marketFailureText, marketLockCountdownText, marketText } from "../i18n/metaMessages";
import { marketSourceHelpLabel, marketSourceHelpText } from "../i18n/marketMessages";
import { formatCurrency } from "./currencyFormatting";
import { InfoTooltip } from "./InfoTooltip";
import { formatNumber } from "./numberFormatting";

interface AssetLiquidationCardProps {
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

export function AssetLiquidationCard({ state, store }: AssetLiquidationCardProps) {
  const locale = state.settings.locale;
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const restoreTriggerFocus = useRef(false);
  const restoreHeadingFocus = useRef(false);
  const command = { type: "meta.market.liquidate" as const };
  const check = checkPreconditions(state, command);
  const preview = marketLiquidationPreview(state);
  const failureCode = check.ok ? "" : (check.failure?.code ?? "");
  const locked = state.run.marketLockdownRemainingMs > 0;
  const reason = (() => {
    const code = locked ? "market-locked" : check.ok ? "" : failureCode;
    if (!code) return "";
    const message = marketFailureText(locale, code, {
      value: currency(state, preview.value),
      minimum: currency(state, state.permanent.galacticMarket.apBuyPrice),
    });
    return code === "market-locked"
      ? `${message} ${marketLockCountdownText(locale, state.run.marketLockdownRemainingMs, (value) => whole(state, value))}`
      : message;
  })();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (confirming && dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, [confirming]);

  useEffect(() => {
    if (confirming || !restoreTriggerFocus.current) return;
    restoreTriggerFocus.current = false;
    triggerRef.current?.focus();
  }, [confirming]);

  useEffect(() => {
    if (confirming || !restoreHeadingFocus.current) return;
    restoreHeadingFocus.current = false;
    headingRef.current?.focus();
  }, [confirming]);

  function liquidate(): void {
    const result = store.dispatch(command);
    restoreHeadingFocus.current = result.accepted;
    restoreTriggerFocus.current = !result.accepted;
    setConfirming(false);
    setFeedback(
      result.accepted
        ? `${whole(state, preview.ap)} AP`
        : marketFailureText(locale, result.failure?.code ?? ""),
    );
  }

  return (
    <article className="upgrade-card rebirth-liquidation-card">
      <div className="card-copy">
        <h3 ref={headingRef} tabIndex={-1}>
          {marketText(locale, "liquidation")}
          <InfoTooltip
            id="rebirth-liquidation-source-help"
            label={marketSourceHelpLabel(locale, "liquidation")}
            content={marketSourceHelpText(locale, "liquidation", state.run.marketLiquidatedThisRun)}
            testId="rebirth-liquidation-source-help"
          />
          <InfoTooltip
            id="rebirth-liquidation-help"
            label={marketText(locale, "liquidationHelpLabel")}
            content={marketText(locale, "liquidationHelp")}
            testId="rebirth-liquidation-help"
          />
        </h3>
        <p>
          {marketText(locale, "liquidationValue")}: {currency(state, preview.value)}
        </p>
        <p>
          {marketText(locale, "liquidationAp")}: {whole(state, preview.ap)}
        </p>
        <button
          ref={triggerRef}
          type="button"
          className="secondary-button"
          disabled={!check.ok || locked}
          aria-describedby={reason ? "asset-liquidation-reason" : undefined}
          onClick={() => setConfirming(true)}
        >
          {marketText(locale, "liquidate")}
        </button>
        {reason && (
          <p id="asset-liquidation-reason" className="control-reason">
            {reason}
          </p>
        )}
        <output className="live-feedback" aria-live="polite">
          {feedback}
        </output>
      </div>
      {confirming && (
        <dialog
          ref={dialogRef}
          className="confirmation-dialog"
          aria-labelledby="asset-liquidation-title"
          onCancel={() => {
            restoreTriggerFocus.current = true;
            setConfirming(false);
          }}
        >
          <h2 id="asset-liquidation-title">{marketText(locale, "liquidateTitle")}</h2>
          <p>{marketText(locale, "liquidatePrompt")}</p>
          <p>
            {marketText(locale, "liquidationValue")}: {currency(state, preview.value)}
          </p>
          <p>
            {marketText(locale, "liquidationAp")}: {whole(state, preview.ap)}
          </p>
          <div className="card-controls">
            <button type="button" className="primary-button" onClick={liquidate}>
              {marketText(locale, "confirmLiquidation")}
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                restoreTriggerFocus.current = true;
                setConfirming(false);
              }}
            >
              {marketText(locale, "cancel")}
            </button>
          </div>
        </dialog>
      )}
    </article>
  );
}
