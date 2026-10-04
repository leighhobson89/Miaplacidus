import { useState } from "react";
import { BLACK_HOLE_BASE_CHARGE_MS, type BlackHoleUpgradeId } from "../content/blackHole";
import { BLACK_HOLE_CHARGE_TIMER_ID } from "../engine/blackHole";
import { checkPreconditions, type GameCommand } from "../engine/commands";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { blackHoleText } from "../i18n/blackHoleMessages";

interface BlackHolePaneProps {
  readonly state: GameState;
  readonly store: GameStore;
}

function number(locale: GameState["settings"]["locale"], value: number, digits = 0): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);
}

export function BlackHolePane({ state, store }: BlackHolePaneProps) {
  const [feedback, setFeedback] = useState("");
  const locale = state.settings.locale;
  const copy = blackHoleText(locale);
  const hole = state.permanent.blackHole;
  const chargeTimer = state.run.timers[BLACK_HOLE_CHARGE_TIMER_ID];
  const charging = chargeTimer?.status === "running";
  const chargeProgress = charging
    ? Math.min(100, (chargeTimer.elapsedMs / chargeTimer.durationMs) * 100)
    : state.run.blackHoleChargeReady
      ? 100
      : 0;
  const command = (type: GameCommand["type"], upgradeId?: BlackHoleUpgradeId): GameCommand =>
    type === "black-hole.upgrade"
      ? { type, upgradeId: upgradeId! }
      : type === "black-hole.research"
        ? { type }
        : { type: "black-hole.activate" };
  const runCommand = (nextCommand: GameCommand) => {
    const result = store.dispatch(nextCommand);
    if (!result.accepted && result.failure && result.failure.code in copy.errors) {
      setFeedback(copy.errors[result.failure.code as keyof typeof copy.errors]);
      return;
    }
    setFeedback("");
  };
  const canRun = (nextCommand: GameCommand) => checkPreconditions(state, nextCommand).ok;
  const points = `${number(locale, state.run.researchPoints)} ${copy.researchPoints}`;

  return (
    <section className="black-hole-pane" aria-labelledby="black-hole-title">
      <header className="panel-heading">
        <div>
          <p className="eyebrow">{copy.status}</p>
          <h2 id="black-hole-title">{copy.title}</h2>
        </div>
      </header>
      {!hole.discovered ? (
        <div className="black-hole-discovery" data-testid="black-hole-discovery">
          <p>{copy.introduction}</p>
          <p>{copy.undiscovered}</p>
          {state.permanent.rebirthCount > 0 && (
            <p>
              {copy.discoveryProgress.replace(
                "{percent}",
                number(locale, hole.discoveryProbability),
              )}
            </p>
          )}
        </div>
      ) : !hole.researched ? (
        <div className="black-hole-research" data-testid="black-hole-research">
          <p>{points}</p>
          <button
            type="button"
            className="primary-button"
            disabled={!canRun(command("black-hole.research"))}
            onClick={() => runCommand(command("black-hole.research"))}
          >
            {copy.researchAction} · {number(locale, hole.researchPrice)} RP
          </button>
        </div>
      ) : (
        <>
          <p className="black-hole-summary">{copy.researched}</p>
          <dl className="black-hole-stats">
            <div>
              <dt>{copy.power}</dt>
              <dd>{number(locale, hole.power, 1)}×</dd>
            </div>
            <div>
              <dt>{copy.duration}</dt>
              <dd>{number(locale, hole.durationMs / 1000, 1)} s</dd>
            </div>
            <div>
              <dt>{copy.recharge}</dt>
              <dd>
                {number(
                  locale,
                  Math.max(30, (BLACK_HOLE_BASE_CHARGE_MS * hole.rechargeMultiplier) / 1000),
                )}{" "}
                s
              </dd>
            </div>
            <div>
              <dt>{copy.status}</dt>
              <dd>
                {hole.alwaysOn
                  ? copy.alwaysOn
                  : state.run.blackHoleWarpActive
                    ? `${copy.warping} · ${number(locale, state.run.timeWarp.remainingMs / 1000, 1)} s`
                    : state.run.blackHoleChargeReady
                      ? copy.ready
                      : charging
                        ? `${copy.charging} · ${number(locale, Math.max(0, chargeTimer.durationMs - chargeTimer.elapsedMs) / 1000, 1)} s`
                        : copy.startCharge}
              </dd>
            </div>
          </dl>
          {!hole.alwaysOn && !state.run.blackHoleWarpActive && !state.run.blackHoleChargeReady && (
            <div className="black-hole-charge-progress">
              <progress
                aria-label={copy.charging}
                value={chargeProgress}
                max={100}
                data-testid="black-hole-charge-progress"
              />
            </div>
          )}
          <div className="black-hole-upgrades">
            {(["power", "duration", "recharge"] as const).map((upgradeId) => {
              const nextCommand = command("black-hole.upgrade", upgradeId);
              const price = hole[`${upgradeId}Price`];
              return (
                <button
                  type="button"
                  className="secondary-button"
                  key={upgradeId}
                  disabled={!canRun(nextCommand)}
                  onClick={() => runCommand(nextCommand)}
                >
                  {copy.upgradeNames[upgradeId]} · {number(locale, price)} RP
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="primary-button"
            disabled={!canRun(command("black-hole.activate"))}
            onClick={() => runCommand(command("black-hole.activate"))}
          >
            {hole.alwaysOn
              ? copy.alwaysOn
              : state.run.blackHoleChargeReady
                ? copy.activate
                : charging || state.run.blackHoleWarpActive
                  ? copy.charging
                  : copy.startCharge}
          </button>
        </>
      )}
      <output className="live-feedback" aria-live="polite" data-testid="black-hole-feedback">
        {feedback}
      </output>
    </section>
  );
}
