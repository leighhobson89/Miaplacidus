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
import { GalacticMarketPane } from "./GalacticMarketPane";
import { GalacticCasinoPane } from "./GalacticCasinoPane";

interface Props {
  readonly state: GameState;
  readonly store: GameStore;
}

export function AscendencyPane({ state, store }: Props) {
  const locale = state.settings.locale;
  const [confirmingRebirth, setConfirmingRebirth] = useState(false);
  const confirmationDialog = useRef<HTMLDialogElement>(null);
  const rebirthCheck = checkPreconditions(state, { type: "meta.rebirth" });
  const number = new Intl.NumberFormat(locale);
  useEffect(() => {
    const dialog = confirmationDialog.current;
    if (confirmingRebirth && dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
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
  const cosmicRipUnlocked = state.run.economy.researchedTechnologies.some(
    (technologyId) => String(technologyId) === "cosmicRip",
  );
  const carryClass =
    state.permanent.ascendencyPoints > 0 ? "green-ready-text" : "red-disabled-text";
  return (
    <div className="economy-pane" data-testid="ascendency-pane">
      <div className="pane-heading">
        <div>
          <p className="eyebrow">07 / {metaText(locale, "title")}</p>
          <h2>{metaText(locale, "title")}</h2>
        </div>
      </div>
      <div className="action-grid">
        <article className="upgrade-card">
          <div className="card-copy">
            <h3>{metaText(locale, "ap")}</h3>
            <p data-testid="ascendency-points">{number.format(state.permanent.ascendencyPoints)}</p>
          </div>
        </article>
        <article className="upgrade-card">
          <div className="card-copy">
            <h3>{metaText(locale, "rebirths")}</h3>
            <p>{number.format(state.permanent.rebirthCount)}</p>
          </div>
          <div className="card-controls">
            <button
              className="secondary-button"
              type="button"
              disabled={!rebirthCheck.ok}
              aria-describedby="rebirth-availability"
              onClick={() => setConfirmingRebirth(true)}
            >
              {metaText(locale, "rebirthAction")}
            </button>
            <span id="rebirth-availability" className="control-reason">
              {rebirthLockText(locale, rebirthLockReason)}
            </span>
          </div>
        </article>
      </div>

      {confirmingRebirth && (
        <dialog
          ref={confirmationDialog}
          className="confirmation-dialog"
          aria-labelledby="rebirth-confirm-title"
          onCancel={() => setConfirmingRebirth(false)}
        >
          <h2 id="rebirth-confirm-title">{rebirthText(locale, "title")}</h2>
          <p className="rebirth-confirm-prompt">{rebirthText(locale, "prompt")}</p>
          <p className={carryClass}>{rebirthCarryText(locale, state.permanent.ascendencyPoints)}</p>
          {cosmicRipUnlocked && <p className={carryClass}>{rebirthText(locale, "gp")}</p>}
          <div className="card-controls">
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                const result = store.dispatch({ type: "meta.rebirth" });
                if (result.accepted) setConfirmingRebirth(false);
              }}
            >
              {rebirthText(locale, "confirm")}
            </button>
            <button
              className="text-button"
              type="button"
              onClick={() => setConfirmingRebirth(false)}
            >
              {rebirthText(locale, "cancel")}
            </button>
          </div>
        </dialog>
      )}

      <GalacticMarketPane state={state} store={store} />
      <GalacticCasinoPane state={state} store={store} />

      <div className="action-grid" aria-label={metaText(locale, "title")}>
        {ASCENDENCY_PERKS.map((perk) => {
          const level = ascendencyPerkLevel(state.permanent.acquiredPerks, perk.id);
          const cost = ascendencyPerkCost(state.permanent.acquiredPerks, perk.id);
          const maxed = ascendencyPerkMaxed(state.permanent.acquiredPerks, perk.id);
          const check = checkPreconditions(state, { type: "meta.perk.purchase", perkId: perk.id });
          const [name, description] = metaPerkCopy(locale, perk.id);
          return (
            <article className="upgrade-card" key={perk.id} data-perk-id={perk.id}>
              <div className="card-copy">
                <h3>{name}</h3>
                <p>{description}</p>
                <span className="cost-line">
                  {metaText(locale, "level")}: {number.format(level)} · {metaText(locale, "cost")}:{" "}
                  {maxed ? metaText(locale, "maxed") : number.format(cost)} AP
                </span>
              </div>
              <div className="card-controls">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={maxed || !check.ok}
                  onClick={() => store.dispatch({ type: "meta.perk.purchase", perkId: perk.id })}
                >
                  {maxed ? metaText(locale, "maxed") : metaText(locale, "buy")}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
