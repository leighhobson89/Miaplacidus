import { useState } from "react";
import { BLACK_HOLE_BASE_CHARGE_MS, type BlackHoleUpgradeId } from "../content/blackHole";
import { BLACK_HOLE_CHARGE_TIMER_ID } from "../engine/blackHole";
import { checkPreconditions, type GameCommand } from "../engine/commands";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { blackHoleText } from "../i18n/blackHoleMessages";
import { formatNumber } from "./numberFormatting";
import { CelestialIllustration } from "./CelestialIllustration";

interface BlackHolePaneProps {
  readonly state: GameState;
  readonly store: GameStore;
}

function number(state: GameState, value: number, digits = 0): string {
  return formatNumber(state.settings.locale, value, digits, state.settings.notation);
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
  const disabledReason = (nextCommand: GameCommand): string | null => {
    const result = checkPreconditions(state, nextCommand);
    if (result.ok) return null;
    const failure = result.failure;
    if (!failure || !(failure.code in copy.errors)) return null;
    return copy.errors[failure.code as keyof typeof copy.errors];
  };
  const points = `${number(state, state.run.researchPoints)} ${copy.researchPoints}`;
  const researchCommand = command("black-hole.research");
  const researchReason = disabledReason(researchCommand);
  const activationCommand = command("black-hole.activate");
  const activationReason = disabledReason(activationCommand);

  return (
    <section className="black-hole-pane" aria-labelledby="black-hole-title">
      <header className="panel-heading">
        <div>
          <p className="eyebrow">{copy.status}</p>
          <h2 id="black-hole-title">{copy.title}</h2>
        </div>
      </header>
      <div className="deep-space-banner">
        <CelestialIllustration kind="black-hole" />
      </div>
      {!hole.discovered ? (
        <div className="black-hole-discovery" data-testid="black-hole-discovery">
          <p>{copy.introduction}</p>
          <p>{copy.undiscovered}</p>
          {state.permanent.rebirthCount > 0 && (
            <p>
              {copy.discoveryProgress.replace(
                "{percent}",
                number(state, hole.discoveryProbability),
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
            disabled={!canRun(researchCommand)}
            aria-describedby={researchReason ? "black-hole-research-reason" : undefined}
            onClick={() => runCommand(researchCommand)}
          >
            {copy.researchAction} · {number(state, hole.researchPrice)} RP
          </button>
          {researchReason && (
            <p className="control-reason" id="black-hole-research-reason">
              {researchReason}
            </p>
          )}
        </div>
      ) : (
        <>
          <p className="black-hole-summary">{copy.researched}</p>
          <dl className="black-hole-stats">
            <div>
              <dt>{copy.power}</dt>
              <dd>{number(state, hole.power, 1)}×</dd>
            </div>
            <div>
              <dt>{copy.duration}</dt>
              <dd>{number(state, hole.durationMs / 1000, 1)} s</dd>
            </div>
            <div>
              <dt>{copy.recharge}</dt>
              <dd>
                {number(
                  state,
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
                    ? `${copy.warping} · ${number(state, state.run.timeWarp.remainingMs / 1000, 1)} s`
                    : state.run.blackHoleChargeReady
                      ? copy.ready
                      : charging
                        ? `${copy.charging} · ${number(state, Math.max(0, chargeTimer.durationMs - chargeTimer.elapsedMs) / 1000, 1)} s`
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
              const reason = disabledReason(nextCommand);
              return (
                <div className="black-hole-upgrade" key={upgradeId}>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={!canRun(nextCommand)}
                    aria-describedby={reason ? `black-hole-${upgradeId}-reason` : undefined}
                    onClick={() => runCommand(nextCommand)}
                  >
                    {copy.upgradeNames[upgradeId]} · {number(state, price)} RP
                  </button>
                  {reason && (
                    <p className="control-reason" id={`black-hole-${upgradeId}-reason`}>
                      {reason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="primary-button"
            disabled={!canRun(activationCommand)}
            aria-describedby={activationReason ? "black-hole-activate-reason" : undefined}
            onClick={() => runCommand(activationCommand)}
          >
            {hole.alwaysOn
              ? copy.alwaysOn
              : state.run.blackHoleChargeReady
                ? copy.activate
                : charging || state.run.blackHoleWarpActive
                  ? copy.charging
                  : copy.startCharge}
          </button>
          {activationReason && (
            <p className="control-reason" id="black-hole-activate-reason">
              {activationReason}
            </p>
          )}
        </>
      )}
      <output className="live-feedback" aria-live="polite" data-testid="black-hole-feedback">
        {feedback}
      </output>
    </section>
  );
}
