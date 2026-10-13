import { useEffect, useRef, useState } from "react";
import {
  BLACK_HOLE_BASE_CHARGE_MS,
  BLACK_HOLE_DURATION_INCREMENT_MS,
  BLACK_HOLE_HIGH_POWER_INCREMENT,
  BLACK_HOLE_MINIMUM_CHARGE_MS,
  BLACK_HOLE_POWER_INCREMENT,
  BLACK_HOLE_RECHARGE_FACTOR,
  type BlackHoleUpgradeId,
} from "../content/blackHole";
import { BLACK_HOLE_CHARGE_TIMER_ID } from "../engine/blackHole";
import type { GameCommand } from "../engine/commands";
import { selectEconomyAction, type EconomyActionSelection } from "../engine/selectors";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { blackHoleText } from "../i18n/blackHoleMessages";
import { starshipText } from "../i18n/starshipMessages";
import { blackHoleWarpAnnouncement } from "./blackHoleAnnouncements";
import { formatNumber } from "./numberFormatting";
import { CelestialIllustration } from "./CelestialIllustration";
import { InfoTooltip } from "./InfoTooltip";

interface BlackHolePaneProps {
  readonly state: GameState;
  readonly store: GameStore;
}

function number(state: GameState, value: number, digits = 0): string {
  return formatNumber(state.settings.locale, value, digits, state.settings.notation);
}

export function BlackHolePane({ state, store }: BlackHolePaneProps) {
  const [feedback, setFeedback] = useState("");
  const [warpAnnouncement, setWarpAnnouncement] = useState("");
  const previousLocale = useRef(state.settings.locale);
  const locale = state.settings.locale;
  const copy = blackHoleText(locale);
  const hole = state.permanent.blackHole;
  const nextPower =
    hole.power +
    (hole.power >= 50 ? BLACK_HOLE_HIGH_POWER_INCREMENT : BLACK_HOLE_POWER_INCREMENT);
  const currentChargeMs = Math.round(BLACK_HOLE_BASE_CHARGE_MS * hole.rechargeMultiplier);
  const nextRechargeMultiplier = Math.max(
    BLACK_HOLE_MINIMUM_CHARGE_MS / BLACK_HOLE_BASE_CHARGE_MS,
    hole.rechargeMultiplier * BLACK_HOLE_RECHARGE_FACTOR,
  );
  const nextChargeMs = Math.max(
    BLACK_HOLE_MINIMUM_CHARGE_MS,
    Math.round(BLACK_HOLE_BASE_CHARGE_MS * nextRechargeMultiplier),
  );
  const rechargeMaxed = hole.alwaysOn || currentChargeMs <= BLACK_HOLE_MINIMUM_CHARGE_MS;
  const upgradeValues: Record<
    BlackHoleUpgradeId,
    {
      readonly current: number;
      readonly next: number;
      readonly unit: string;
      readonly digits: number;
    }
  > = {
    power: {
      current: hole.power,
      next: nextPower,
      unit: "×",
      digits: Number.isInteger(hole.power) && Number.isInteger(nextPower) ? 0 : 1,
    },
    duration: {
      current: hole.durationMs / 1000,
      next: (hole.durationMs + BLACK_HOLE_DURATION_INCREMENT_MS) / 1000,
      unit: " s",
      digits: 0,
    },
    recharge: {
      current: Math.max(BLACK_HOLE_MINIMUM_CHARGE_MS, currentChargeMs) / 1000,
      next: nextChargeMs / 1000,
      unit: " s",
      digits: 1,
    },
  };
  const chargeTimer = state.run.timers[BLACK_HOLE_CHARGE_TIMER_ID];
  const charging = chargeTimer?.status === "running";
  const chargeProgress = charging
    ? Math.min(100, (chargeTimer.elapsedMs / chargeTimer.durationMs) * 100)
    : state.run.blackHoleChargeReady
      ? 100
      : 0;
  const instabilityDurationMultiplier =
    state.run.randomEvents.activeEffects.find((effect) => effect.id === "blackHoleInstability")
      ?.durationMultiplier ?? 1;
  const warpDurationMs = Math.round(hole.durationMs * instabilityDurationMultiplier);
  const warpProgress =
    warpDurationMs > 0
      ? Math.max(
          0,
          Math.min(100, ((warpDurationMs - state.run.timeWarp.remainingMs) / warpDurationMs) * 100),
        )
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
      setWarpAnnouncement("");
      return;
    }
    setFeedback("");
    setWarpAnnouncement(
      blackHoleWarpAnnouncement(
        result.events.some((event) => event.type === "black-hole.warp-activated"),
        copy.warping,
      ),
    );
  };
  const disabledReason = (selection: EconomyActionSelection): string | null => {
    if (selection.enabled || !selection.failure) return null;
    const { failure } = selection;
    if (!(failure.code in copy.errors)) return null;
    return copy.errors[failure.code as keyof typeof copy.errors];
  };
  const points = `${number(state, state.run.researchPoints)} ${copy.researchPoints}`;
  const researchCommand = command("black-hole.research");
  const researchSelection = selectEconomyAction(state, researchCommand);
  const researchReason = disabledReason(researchSelection);
  const activationCommand = command("black-hole.activate");
  const activationSelection = selectEconomyAction(state, activationCommand);
  const activationReason = disabledReason(activationSelection);

  useEffect(() => {
    if (!state.run.blackHoleWarpActive || previousLocale.current !== locale)
      setWarpAnnouncement("");
    previousLocale.current = locale;
  }, [locale, previousLocale, state.run.blackHoleWarpActive]);

  return (
    <section className="black-hole-pane" aria-labelledby="black-hole-title">
      <header className="panel-heading">
        <div className="black-hole-title-row">
          <div>
            <p className="eyebrow">{copy.status}</p>
            <h2 className="game-page-title" id="black-hole-title">
              {copy.title}
            </h2>
          </div>
          <InfoTooltip
            id="black-hole-header-help"
            label={`${copy.title} — ${starshipText(locale, "scanMoreInfoLabel")}`}
            content={copy.headerHelp}
            testId="black-hole-header-help"
          />
        </div>
      </header>
      <div className="deep-space-banner page-artwork-row">
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
          <div className="space-action-help-group">
            <button
              type="button"
              className="primary-button"
              disabled={!researchSelection.enabled}
              aria-describedby={researchReason ? "black-hole-research-reason" : undefined}
              onClick={() => runCommand(researchCommand)}
            >
              {copy.researchAction} · {number(state, hole.researchPrice)} RP
            </button>
            <InfoTooltip
              id="black-hole-research-help"
              label={`${copy.researchAction} — ${starshipText(locale, "scanMoreInfoLabel")}`}
              content={copy.researchHelp}
              testId="black-hole-research-help"
            />
          </div>
          {researchReason && (
            <p
              className="control-reason"
              id="black-hole-research-reason"
            >
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
          {state.run.blackHoleWarpActive && (
            <div className="black-hole-charge-progress">
              <progress
                aria-label={copy.warping}
                value={warpProgress}
                max={100}
                data-testid="black-hole-time-warp-progress"
              />
            </div>
          )}
          <div className="black-hole-upgrades">
            {(["power", "duration", "recharge"] as const).map((upgradeId) => {
              const nextCommand = command("black-hole.upgrade", upgradeId);
              const price = hole[`${upgradeId}Price`];
              const selection = selectEconomyAction(state, nextCommand);
              const reason = disabledReason(selection);
              const isMaxed = upgradeId !== "power" && rechargeMaxed;
              const isFinalRechargeUpgrade =
                upgradeId === "recharge" &&
                !rechargeMaxed &&
                nextChargeMs <= BLACK_HOLE_MINIMUM_CHARGE_MS;
              const maxedCopy =
                upgradeId === "duration"
                  ? copy.upgradeMaxed.duration
                  : copy.upgradeMaxed.recharge.replace(
                      "{seconds}",
                      number(state, BLACK_HOLE_MINIMUM_CHARGE_MS / 1000),
                    );
              const value = upgradeValues[upgradeId];
              return (
                <div className="black-hole-upgrade" key={upgradeId}>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={!selection.enabled}
                    aria-describedby={reason ? `black-hole-${upgradeId}-reason` : undefined}
                    onClick={() => runCommand(nextCommand)}
                  >
                    <span>{copy.upgradeNames[upgradeId]}</span>
                    {isMaxed ? (
                      <span>
                        {upgradeId === "duration" ? copy.duration : copy.recharge}: {maxedCopy}
                      </span>
                    ) : isFinalRechargeUpgrade ? (
                      <>
                        <span>
                          {number(state, value.current, value.digits)}
                          {value.unit} → {copy.rechargeFinalUpgrade}
                        </span>
                        <span>
                          {number(state, price)} {copy.researchPoints}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          {number(state, value.current, value.digits)}
                          {value.unit} → {number(state, value.next, value.digits)}
                          {value.unit}
                        </span>
                        <span>
                          {number(state, price)} {copy.researchPoints}
                        </span>
                      </>
                    )}
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
            disabled={!activationSelection.enabled}
            aria-describedby={activationReason ? "black-hole-activate-reason" : undefined}
            onClick={() => runCommand(activationCommand)}
          >
            {hole.alwaysOn
              ? copy.alwaysOn
              : state.run.blackHoleChargeReady
                ? copy.activate
                : charging || state.run.blackHoleWarpActive
                  ? copy.chargingAction
                  : copy.chargeAction}
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
      <output
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        data-testid="black-hole-warp-announcement"
      >
        {warpAnnouncement}
      </output>
    </section>
  );
}
