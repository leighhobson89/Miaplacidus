import { useEffect, useRef, useState } from "react";
import {
  ASCENDENCY_PERKS,
  ascendencyPerkCost,
  ascendencyPerkLevel,
  ascendencyPerkMaxed,
} from "../content/ascendency";
import { checkPreconditions } from "../engine/commands";
import type { GameStore } from "../engine/store";
import type { GameState } from "../engine/state";
import {
  metaPerkCopy,
  metaText,
  rebirthCarryText,
  rebirthLockText,
  rebirthText,
} from "../i18n/metaMessages";
import { formatNumber } from "./numberFormatting";
import { CelestialIllustration } from "./CelestialIllustration";
import { InfoTooltip } from "./InfoTooltip";
import { PageArtworkRow } from "./PageArtworkRow";
import { starshipText } from "../i18n/starshipMessages";
import { AssetLiquidationCard } from "./AssetLiquidationCard";

function number(state: GameState, value: number): string {
  return formatNumber(state.settings.locale, value, 0, state.settings.notation);
}

interface Props {
  readonly state: GameState;
  readonly store: GameStore;
}

export function RebirthPane({ state, store }: Props) {
  const locale = state.settings.locale;
  const [confirmingRebirth, setConfirmingRebirth] = useState(false);
  const confirmationDialog = useRef<HTMLDialogElement>(null);
  const rebirthTrigger = useRef<HTMLButtonElement>(null);
  const restoreRebirthFocus = useRef(false);
  const rebirthCheck = checkPreconditions(state, { type: "meta.rebirth" });
  useEffect(() => {
    const dialog = confirmationDialog.current;
    if (confirmingRebirth && dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, [confirmingRebirth]);
  useEffect(() => {
    if (confirmingRebirth || !restoreRebirthFocus.current) return;
    restoreRebirthFocus.current = false;
    rebirthTrigger.current?.focus();
  }, [confirmingRebirth]);
  const rebirthFailureCode = rebirthCheck.ok ? undefined : rebirthCheck.failure.code;
  const rebirthLockReason = [
    "rebirth-not-awarded",
    "rebirth-no-destination",
    "rebirth-current-destination",
    "rebirth-busy",
  ].includes(rebirthFailureCode ?? "")
    ? (rebirthFailureCode as
        | "rebirth-not-awarded"
        | "rebirth-no-destination"
        | "rebirth-current-destination"
        | "rebirth-busy")
    : undefined;
  const cosmicRipUnlocked = state.permanent.cosmicRip.unlocked;
  const isMegastructureRun = state.permanent.megastructures.ancientManuscripts.some(
    (record) => record.factorySystemId === state.run.space.currentSystemId,
  );
  const overview = metaText(locale, "rebirthOverview");
  const carryClass =
    state.permanent.ascendencyPoints > 0 ? "green-ready-text" : "red-disabled-text";

  return (
    <section
      className="economy-pane"
      aria-labelledby="rebirth-pane-title"
      data-testid="rebirth-pane"
    >
      <div className="pane-heading">
        <div>
          <div className="economy-page-title-row">
            <h2 id="rebirth-pane-title">{rebirthText(locale, "title")}</h2>
            <InfoTooltip
              id="rebirth-page-help"
              label={`${rebirthText(locale, "title")} — ${starshipText(locale, "scanMoreInfoLabel")}`}
              content={
                isMegastructureRun ? (
                  <>
                    <span>{overview}</span>
                    <span className="orange-warning-text">
                      {metaText(locale, "rebirthMegastructureWarning")}
                    </span>
                  </>
                ) : (
                  overview
                )
              }
              testId="rebirth-page-help"
            />
          </div>
        </div>
      </div>
      <PageArtworkRow>
        <CelestialIllustration kind="megastructure" />
      </PageArtworkRow>
      <div className="action-grid">
        <article className="upgrade-card">
          <div className="card-copy">
            <h3>{metaText(locale, "ap")}</h3>
            <p data-testid="ascendency-points">{number(state, state.permanent.ascendencyPoints)}</p>
          </div>
        </article>
        <article className="upgrade-card">
          <div className="card-copy">
            <h3>{metaText(locale, "rebirths")}</h3>
            <p>{number(state, state.permanent.rebirthCount)}</p>
          </div>
          <div className="card-controls">
            <div className="rebirth-action-with-help">
              <button
                ref={rebirthTrigger}
                className="secondary-button"
                type="button"
                disabled={!rebirthCheck.ok}
                aria-describedby="rebirth-availability"
                onClick={() => setConfirmingRebirth(true)}
              >
                {metaText(locale, "rebirthAction")}
              </button>
              <InfoTooltip
                id="rebirth-action-source-help"
                label={`${metaText(locale, "rebirthAction")} — ${starshipText(locale, "scanMoreInfoLabel")}`}
                content={metaText(locale, "rebirthSourceHelp")}
                testId="rebirth-action-source-help"
              />
            </div>
            <span id="rebirth-availability" className="control-reason">
              {rebirthLockText(locale, rebirthLockReason)}
            </span>
          </div>
        </article>
        <AssetLiquidationCard state={state} store={store} />
      </div>

      {confirmingRebirth && (
        <dialog
          ref={confirmationDialog}
          className="confirmation-dialog"
          aria-labelledby="rebirth-confirm-title"
          onCancel={() => {
            restoreRebirthFocus.current = true;
            setConfirmingRebirth(false);
          }}
        >
          <h2 id="rebirth-confirm-title">{rebirthText(locale, "title")}</h2>
          <p className="rebirth-confirm-prompt">{rebirthText(locale, "prompt")}</p>
          <p className="rebirth-confirm-body">{metaText(locale, "rebirthBody")}</p>
          <p className={carryClass}>
            {rebirthCarryText(locale, number(state, state.permanent.ascendencyPoints))}
          </p>
          {cosmicRipUnlocked && <p className={carryClass}>{rebirthText(locale, "gp")}</p>}
          <div className="card-controls">
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                const result = store.dispatch({ type: "meta.rebirth" });
                if (result.accepted) {
                  restoreRebirthFocus.current = false;
                  window.requestAnimationFrame(() => {
                    document.getElementById("tab-hydrogen")?.focus();
                  });
                  setConfirmingRebirth(false);
                }
              }}
            >
              {rebirthText(locale, "confirm")}
            </button>
            <button
              className="text-button"
              type="button"
              onClick={() => {
                restoreRebirthFocus.current = true;
                setConfirmingRebirth(false);
              }}
            >
              {rebirthText(locale, "cancel")}
            </button>
          </div>
        </dialog>
      )}
    </section>
  );
}

export function AscendencyPane({ state, store }: Props) {
  const locale = state.settings.locale;

  return (
    <section
      className="economy-pane"
      aria-labelledby="ascendency-pane-title"
      data-testid="ascendency-pane"
    >
      <div className="pane-heading">
        <div>
          <div className="economy-page-title-row">
            <h2 id="ascendency-pane-title" className="game-page-title">
              {metaText(locale, "perksTitle")}
            </h2>
            <InfoTooltip
              id="ascendency-perks-page-help"
              label={`${metaText(locale, "perksTitle")} — ${starshipText(locale, "scanMoreInfoLabel")}`}
              content={metaText(locale, "perksOverview")}
              testId="ascendency-perks-page-help"
            />
          </div>
          <p className="pane-intro">
            {metaText(locale, "ap")}: {number(state, state.permanent.ascendencyPoints)}
          </p>
        </div>
      </div>
      <PageArtworkRow>
        <CelestialIllustration kind="megastructure" />
      </PageArtworkRow>
      <div className="action-grid" aria-label={metaText(locale, "title")}>
        {ASCENDENCY_PERKS.map((perk) => {
          const level = ascendencyPerkLevel(state.permanent.acquiredPerks, perk.id);
          const cost = ascendencyPerkCost(state.permanent.acquiredPerks, perk.id);
          const maxed = ascendencyPerkMaxed(state.permanent.acquiredPerks, perk.id);
          const maximumPurchases = "maxPurchases" in perk ? perk.maxPurchases : undefined;
          const rebuyableValue =
            maximumPurchases === undefined
              ? metaText(locale, "yes")
              : maximumPurchases > 1
                ? number(state, maximumPurchases)
                : metaText(locale, "no");
          const check = checkPreconditions(state, { type: "meta.perk.purchase", perkId: perk.id });
          const [name, description] = metaPerkCopy(locale, perk.id);
          const reasonId = `ascendency-perk-${perk.id}-reason`;
          const insufficientAp = !check.ok && check.failure.code === "insufficient-ap" && !maxed;
          const reason = insufficientAp
            ? metaText(locale, "perkInsufficient")
                .replace("{required}", number(state, cost))
                .replace("{available}", number(state, state.permanent.ascendencyPoints))
            : undefined;
          return (
            <article className="upgrade-card" key={perk.id} data-perk-id={perk.id}>
              <div className="card-copy">
                <h3>{name}</h3>
                <p>{description}</p>
                <span className="cost-line">
                  {metaText(locale, "rebuyable")} {rebuyableValue} ·{" "}
                  {metaText(locale, "level")}: {number(state, level)} · {metaText(locale, "cost")}:{" "}
                  {maxed ? metaText(locale, "maxed") : number(state, cost)} AP
                </span>
              </div>
              <div className="card-controls">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={maxed || !check.ok}
                  aria-describedby={reason ? reasonId : undefined}
                  onClick={() => store.dispatch({ type: "meta.perk.purchase", perkId: perk.id })}
                >
                  {maxed ? metaText(locale, "maxed") : metaText(locale, "buy")}
                </button>
                {reason && (
                  <span id={reasonId} className="control-reason">
                    {reason}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
