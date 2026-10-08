import { useEffect, useRef, useState } from "react";
import {
  ASTEROID_SCAN_TIMER_ID,
  LAUNCH_PAD_COST,
  ROCKET_FUEL_CAPACITY,
  ROCKET_FUEL_PUMP_BASE_COST,
  ROCKET_FUEL_PUMP_POWER,
  ROCKET_IDS,
  ROCKET_PART_REQUIREMENTS,
  STAR_STUDY_TIMER_ID,
  TELESCOPE_COST,
  VOID_PILLAGE_TIMER_ID,
  type TelescopeMode,
  type AsteroidRarity,
  type RocketId,
  type RocketPhase,
  type SpaceWeatherCondition,
  type SpacePurchaseCost,
} from "../content/space";
import { economyGoodName } from "./economyDisplay";
import { formatCurrency } from "./currencyFormatting";
import { formatNumber } from "./numberFormatting";
import { formatDuration } from "./timeFormatting";
import { checkPreconditions, type PreconditionResult } from "../engine/commands";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { antimatterMiningRatePerSecond, rocketFuelRatePerSecond } from "../engine/spaceMechanics";
import { spaceText, type SpaceMessageKey } from "../i18n/spaceMessages";
import { economyLabel } from "../i18n/economyMessages";
import { rocketText, type RocketMessageKey } from "../i18n/rocketMessages";
import { rocketPartCost } from "../engine/spaceRules";
import { philosophyDiscountedSpaceCost, philosophyRepeatableRank } from "../engine/philosophy";
import { permanentPerkPurchaseCount } from "../content/economyRules";
import { currentWeatherForSystem, STAR_WEATHER_TIMER_ID } from "../engine/weather";
import type { SpaceMiningPaneId } from "./presentationNavigation";
import { CelestialIllustration } from "./CelestialIllustration";

interface SpaceMiningPaneProps {
  readonly state: GameState;
  readonly store: GameStore;
  readonly activePane: SpaceMiningPaneId;
}

function number(state: GameState, value: number): string {
  return formatNumber(state.settings.locale, value, 0, state.settings.notation);
}

function decimal(state: GameState, value: number): string {
  return formatNumber(state.settings.locale, value, 2, state.settings.notation);
}

function money(state: GameState, value: number): string {
  return formatCurrency(
    state.settings.locale,
    value,
    state.settings.currencyId ?? "usd",
    0,
    state.settings.notation,
  );
}

function costLines(state: GameState, cost: SpacePurchaseCost): string[] {
  const locale = state.settings.locale;
  return [
    money(state, cost.cash),
    ...(cost.antimatter === undefined
      ? []
      : [`${number(state, cost.antimatter)} ${spaceText(locale, "antimatterStored")}`]),
    ...cost.materials.map(
      ({ goodId, amount }) => `${number(state, amount)} ${economyGoodName(locale, goodId)}`,
    ),
  ];
}

const ROCKET_FAILURE_MESSAGES: Readonly<Record<string, RocketMessageKey>> = {
  "space-launch-pad-required": "reasonLaunchPadRequired",
  "space-launch-pad-tech-locked": "reasonLaunchPadTechnology",
  "space-rocket-incomplete": "reasonRocketIncomplete",
  "space-fuel-tech-locked": "reasonFuelTechnology",
  "space-fuel-pump-purchased": "reasonPumpPurchased",
  "space-fuel-pump-required": "reasonPumpRequired",
  "space-rocket-active": "reasonRocketActive",
  "space-rocket-fuel-full": "reasonFuelFull",
  "space-rocket-fuel-empty": "reasonFuelEmpty",
  "space-no-grid": "reasonNoGrid",
  "space-invalid-rocket-name": "reasonBadName",
  "space-rocket-not-orbiting": "reasonNotOrbiting",
  "space-asteroid-unavailable": "reasonAsteroidUnavailable",
  "space-weather-blocked": "reasonWeatherBlocked",
};

const SPACE_FAILURE_MESSAGES: Readonly<Record<string, SpaceMessageKey>> = {
  "space-technology-locked": "reasonTechnologyLocked",
  "space-telescope-required": "reasonTelescopeRequired",
  "space-telescope-built": "reasonTelescopeBuilt",
  "space-survey-active": "reasonSurveyActive",
  "space-no-power": "reasonNoPower",
  "space-automation-locked": "reasonAutomationLocked",
  "space-automation-unavailable": "reasonAutomationUnavailable",
  "space-pillage-locked": "reasonPillageLocked",
};

function disabledReason(state: GameState, result: PreconditionResult): string | null {
  if (result.ok) return null;
  const { failure } = result;
  const locale = state.settings.locale;
  if (failure.code === "insufficient-cash") {
    return spaceText(locale, "reasonInsufficientCash", {
      amount: money(state, failure.required),
    });
  }
  if (failure.code === "insufficient-material") {
    return spaceText(locale, "reasonInsufficientMaterial", {
      material: economyGoodName(locale, failure.goodId),
      amount: number(state, failure.required),
    });
  }
  if (failure.code === "insufficient-antimatter") {
    return spaceText(locale, "reasonInsufficientAntimatter", {
      amount: number(state, failure.required),
    });
  }
  const rocketMessage = ROCKET_FAILURE_MESSAGES[failure.code];
  if (rocketMessage) return rocketText(locale, rocketMessage);
  const spaceMessage = SPACE_FAILURE_MESSAGES[failure.code];
  return spaceMessage ? spaceText(locale, spaceMessage) : null;
}

function rocketPhaseText(
  state: GameState,
  phase: GameState["run"]["space"]["rockets"]["rocket1"]["phase"],
): string {
  return rocketText(state.settings.locale, phase);
}

function RocketAssemblyCard({
  rocketId,
  state,
  store,
}: {
  readonly rocketId: (typeof ROCKET_IDS)[number];
  readonly state: GameState;
  readonly store: GameStore;
}) {
  const locale = state.settings.locale;
  const rocket = state.run.space.rockets[rocketId];
  const [name, setName] = useState(rocket.name);
  const [feedback, setFeedback] = useState("");
  const requiredParts = ROCKET_PART_REQUIREMENTS[rocketId];
  const fuelCapacity = ROCKET_FUEL_CAPACITY[rocketId];
  const partCost = rocketPartCost(
    rocket.builtParts,
    permanentPerkPurchaseCount(state.permanent.acquiredPerks, "launchPadMassProduction") +
      philosophyRepeatableRank(state, "launchPadMassProduction"),
  );
  const partCommand = { type: "space.rocket.part.build" as const, rocketId };
  const pumpCommand = { type: "space.rocket.pump.purchase" as const, rocketId };
  const pumpStartCommand = {
    type: "space.rocket.pump.set-enabled" as const,
    rocketId,
    enabled: true,
  };
  const launchCommand = { type: "space.rocket.launch" as const, rocketId };
  const targetAsteroid = state.run.space.asteroids.find(
    (asteroid) => asteroid.id === state.run.space.selectedAsteroidId,
  );
  const rocketTargetAsteroid = state.run.space.asteroids.find(
    (asteroid) => asteroid.id === rocket.targetAsteroidId,
  );
  const travelCommand = targetAsteroid
    ? { type: "space.rocket.travel" as const, rocketId, asteroidId: targetAsteroid.id }
    : null;
  const partCheck = checkPreconditions(state, partCommand);
  const pumpCheck = checkPreconditions(state, pumpCommand);
  const pumpStartCheck = checkPreconditions(state, pumpStartCommand);
  const launchCheck = checkPreconditions(state, launchCommand);
  const travelCheck = travelCommand ? checkPreconditions(state, travelCommand) : null;
  const partReason = disabledReason(state, partCheck);
  const pumpReason = disabledReason(state, pumpCheck);
  const pumpStartReason = disabledReason(state, pumpStartCheck);
  const launchReason = disabledReason(state, launchCheck);
  const travelReason = travelCheck
    ? disabledReason(state, travelCheck)
    : rocketText(locale, "reasonAsteroidUnavailable");
  const journeyTimer = rocket.timerId ? state.run.timers[rocket.timerId] : null;
  const journeyRemainingMs = journeyTimer
    ? Math.max(0, journeyTimer.durationMs - journeyTimer.elapsedMs)
    : 0;
  const fuelRemaining = Math.max(0, fuelCapacity - rocket.fuelQuantity);
  const pumpRate = rocketFuelRatePerSecond(state);
  const powerAvailable = state.run.economy.power.gridEnabled && !state.run.economy.power.tripped;
  const fuelEtaMs =
    rocket.fuelPumpEnabled && powerAvailable && pumpRate > 0 && fuelRemaining > 0
      ? (fuelRemaining / pumpRate) * 1_000
      : null;

  function dispatch(command: Parameters<GameStore["dispatch"]>[0], success: string) {
    const result = store.dispatch(command);
    if (result.accepted) {
      setFeedback(success);
      return;
    }
    if (result.failure?.code === "insufficient-cash") {
      setFeedback(
        spaceText(locale, "reasonInsufficientCash", {
          amount: money(state, result.failure.required),
        }),
      );
      return;
    }
    if (result.failure?.code === "insufficient-material") {
      setFeedback(
        spaceText(locale, "reasonInsufficientMaterial", {
          material: economyGoodName(locale, result.failure.goodId),
          amount: number(state, result.failure.required),
        }),
      );
      return;
    }
    if (result.failure?.code === "insufficient-antimatter") {
      setFeedback(
        spaceText(locale, "reasonInsufficientAntimatter", {
          amount: number(state, result.failure.required),
        }),
      );
      return;
    }
    const key = result.failure ? ROCKET_FAILURE_MESSAGES[result.failure.code] : undefined;
    setFeedback(
      key && result.failure ? rocketText(locale, key) : (result.failure?.messageKey ?? ""),
    );
  }

  return (
    <article className="space-rocket-card" data-testid={`rocket-card-${rocketId}`}>
      <div className="space-card-heading">
        <h4>{rocketText(locale, "rocketLabel", { index: Number(rocketId.slice(-1)) })}</h4>
        <CelestialIllustration kind="rocket" className="rocket-mark" />
        <span className="status-pill">{rocketPhaseText(state, rocket.phase)}</span>
      </div>
      <div className="space-rocket-rename">
        <label htmlFor={`${rocketId}-name`}>{rocketText(locale, "rocketName")}</label>
        <input
          id={`${rocketId}-name`}
          value={name}
          maxLength={12}
          onChange={(event) => setName(event.currentTarget.value)}
        />
        <button
          className="text-button"
          type="button"
          onClick={() => {
            const cleanName = name.trim();
            setName(cleanName);
            dispatch({ type: "space.rocket.rename", rocketId, name: cleanName }, cleanName);
          }}
        >
          {rocketText(locale, "rename")}
        </button>
      </div>
      <p className="space-rocket-parts">
        {rocketText(locale, "parts")}:{" "}
        <strong>
          {number(state, rocket.builtParts)} / {number(state, requiredParts)}
        </strong>
      </p>
      {rocket.builtParts < requiredParts && (
        <>
          <p className="cost-line">
            {rocketText(locale, "partCost")}: {costLines(state, partCost).join(", ")}
          </p>
          <button
            className="secondary-button"
            type="button"
            disabled={!partCheck.ok}
            aria-describedby={partReason ? `rocket-${rocketId}-part-reason` : undefined}
            onClick={() => dispatch(partCommand, rocketText(locale, "parts"))}
          >
            {rocketText(locale, "buildPart")}
          </button>
          {partReason && (
            <p className="control-reason" id={`rocket-${rocketId}-part-reason`}>
              {partReason}
            </p>
          )}
        </>
      )}
      {rocket.builtParts === requiredParts && (
        <>
          {rocket.phase === "ready" && (
            <>
              <p className="space-rocket-parts">{rocketText(locale, "pumpTitle")}</p>
              <p className="space-rocket-power">
                {decimal(state, rocketFuelRatePerSecond(state))}/s ·{" "}
                {decimal(state, ROCKET_FUEL_PUMP_POWER[rocketId])} {economyLabel(locale, "energy")}
                /s
              </p>
              {!rocket.fuelPumpPurchased ? (
                <>
                  <p className="cost-line">
                    {rocketText(locale, "pumpCost")}:{" "}
                    {money(state, ROCKET_FUEL_PUMP_BASE_COST[rocketId])}
                  </p>
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={!pumpCheck.ok}
                    aria-describedby={pumpReason ? `rocket-${rocketId}-pump-reason` : undefined}
                    onClick={() => dispatch(pumpCommand, rocketText(locale, "startFueling"))}
                  >
                    {rocketText(locale, "buyPump")}
                  </button>
                  {pumpReason && (
                    <p className="control-reason" id={`rocket-${rocketId}-pump-reason`}>
                      {pumpReason}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <label className="space-fuel-meter" htmlFor={`${rocketId}-fuel`}>
                    <span>{rocketText(locale, "fuelLevel")}</span>
                    <strong>
                      {number(state, rocket.fuelQuantity)} / {number(state, fuelCapacity)}
                    </strong>
                  </label>
                  <meter
                    id={`${rocketId}-fuel`}
                    min={0}
                    max={fuelCapacity}
                    value={rocket.fuelQuantity}
                  />
                  {fuelRemaining > 0 && (
                    <p
                      className="space-range-readout"
                      data-testid={`rocket-fuel-eta-${rocketId}`}
                      data-remaining-ms={fuelEtaMs ?? undefined}
                    >
                      {fuelEtaMs === null
                        ? rocket.fuelPumpEnabled && !powerAvailable
                          ? rocketText(locale, "reasonNoGrid")
                          : rocketText(locale, "fuelingPaused")
                        : rocketText(locale, "fuelingTimeRemaining", {
                            time: formatDuration(locale, fuelEtaMs, state.settings.notation),
                          })}
                    </p>
                  )}
                  {rocket.fuelQuantity < fuelCapacity && (
                    <button
                      className="text-button"
                      type="button"
                      disabled={!rocket.fuelPumpEnabled && !pumpStartCheck.ok}
                      aria-describedby={
                        !rocket.fuelPumpEnabled && pumpStartReason
                          ? `rocket-${rocketId}-fueling-reason`
                          : undefined
                      }
                      aria-pressed={rocket.fuelPumpEnabled}
                      onClick={() =>
                        dispatch(
                          {
                            type: "space.rocket.pump.set-enabled",
                            rocketId,
                            enabled: !rocket.fuelPumpEnabled,
                          },
                          rocket.fuelPumpEnabled
                            ? rocketText(locale, "pauseFueling")
                            : rocketText(locale, "startFueling"),
                        )
                      }
                    >
                      {rocket.fuelPumpEnabled
                        ? rocketText(locale, "pauseFueling")
                        : rocketText(locale, "startFueling")}
                    </button>
                  )}
                  {!rocket.fuelPumpEnabled && pumpStartReason && (
                    <p className="control-reason" id={`rocket-${rocketId}-fueling-reason`}>
                      {pumpStartReason}
                    </p>
                  )}
                </>
              )}
              <button
                className="primary-button"
                type="button"
                disabled={!launchCheck.ok}
                aria-describedby={launchReason ? `rocket-${rocketId}-launch-reason` : undefined}
                onClick={() => dispatch(launchCommand, rocketText(locale, "orbit"))}
              >
                {rocketText(locale, "launch")}
              </button>
              {launchReason && (
                <p className="control-reason" id={`rocket-${rocketId}-launch-reason`}>
                  {launchReason}
                </p>
              )}
            </>
          )}
          {rocket.phase === "orbit" && (
            <>
              <p className="space-rocket-parts">
                {rocketText(locale, "destination")}: {targetAsteroid?.name ?? "—"}
              </p>
              <button
                className="primary-button"
                type="button"
                disabled={!travelCheck?.ok}
                aria-describedby={travelReason ? `rocket-${rocketId}-travel-reason` : undefined}
                onClick={() =>
                  travelCommand && dispatch(travelCommand, rocketText(locale, "journeyStarted"))
                }
              >
                {rocketText(locale, "travelToAsteroid")}
              </button>
              {travelReason && (
                <p className="control-reason" id={`rocket-${rocketId}-travel-reason`}>
                  {travelReason}
                </p>
              )}
            </>
          )}
          {(rocket.phase === "outbound" || rocket.phase === "returning") && journeyTimer && (
            <>
              <p
                className="space-range-readout"
                data-testid={`rocket-journey-countdown-${rocketId}`}
                data-remaining-ms={journeyRemainingMs}
              >
                {rocketText(locale, "journeyTimeRemaining", {
                  time: formatDuration(locale, journeyRemainingMs, state.settings.notation),
                })}
              </p>
              <meter
                className="space-survey-progress"
                min={0}
                max={100}
                value={remainingPercent(state, journeyTimer.id)}
                aria-label={rocketPhaseText(state, rocket.phase)}
              />
            </>
          )}
          {rocket.phase === "mining" && rocketTargetAsteroid && (
            <p className="space-rocket-parts">
              {rocketTargetAsteroid.name}: {number(state, rocketTargetAsteroid.remainingAntimatter)}
            </p>
          )}
        </>
      )}
      <output className="live-feedback" aria-live="polite">
        {feedback}
      </output>
    </article>
  );
}

function remainingPercent(state: GameState, timerId: string): number {
  const timer = state.run.timers[timerId];
  if (!timer || timer.durationMs <= 0) return 0;
  return Math.max(0, Math.min(100, (timer.elapsedMs / timer.durationMs) * 100));
}

const RARITY_MESSAGES: Readonly<Record<AsteroidRarity, SpaceMessageKey>> = {
  common: "rarityCommon",
  uncommon: "rarityUncommon",
  rare: "rarityRare",
  legendary: "rarityLegendary",
};

const WEATHER_MESSAGES: Readonly<Record<SpaceWeatherCondition, SpaceMessageKey>> = {
  clear: "weatherClear",
  cloudy: "weatherCloudy",
  rain: "weatherRain",
  heavyRain: "weatherHeavyRain",
  volcano: "weatherVolcano",
};

export function SpaceMiningPane({ state, store, activePane }: SpaceMiningPaneProps) {
  const locale = state.settings.locale;
  const [feedback, setFeedback] = useState("");
  const space = state.run.space;
  const currentWeather = currentWeatherForSystem(space);
  const weatherTimer = state.run.timers[STAR_WEATHER_TIMER_ID];
  const weatherChangeInMs = weatherTimer
    ? Math.max(0, weatherTimer.durationMs - weatherTimer.elapsedMs)
    : 0;
  const antimatterRate = antimatterMiningRatePerSecond(state);
  const autoTelescopeUnlocked =
    space.autoTelescopeUnlocked ||
    permanentPerkPurchaseCount(state.permanent.acquiredPerks, "autoSpaceTelescope") > 0;
  const voidPillageAvailable =
    state.permanent.rebirthCount > 0 &&
    state.permanent.philosophyId === "voidborn" &&
    state.run.philosophyAbilityActive;
  const previousOutcomeState = useRef({
    activeSurvey: space.activeSurvey,
    starStudyRange: space.starStudyRange,
    voidPillageCompletions: space.voidPillageCompletions,
    asteroidIds: new Set(space.asteroids.map((asteroid) => asteroid.id)),
    rocketPhases: Object.fromEntries(
      ROCKET_IDS.map((rocketId) => [rocketId, space.rockets[rocketId].phase]),
    ) as Record<RocketId, RocketPhase>,
    rocketTargets: Object.fromEntries(
      ROCKET_IDS.map((rocketId) => [rocketId, space.rockets[rocketId].targetAsteroidId]),
    ) as Record<RocketId, string | null>,
    rocketJourneys: Object.fromEntries(
      ROCKET_IDS.map((rocketId) => [rocketId, space.rockets[rocketId].journeyCount]),
    ) as Record<RocketId, number>,
  });
  useEffect(
    () => () => {
      if (store.getState().run.space.antimatterBoostActive)
        store.dispatch({ type: "space.antimatter-boost.set-active", active: false });
    },
    [store],
  );
  const built = checkPreconditions(state, { type: "space.telescope.build" });
  const scan = checkPreconditions(state, { type: "space.telescope.scan.start" });
  const study = checkPreconditions(state, { type: "space.telescope.study.start" });
  const pillage = checkPreconditions(state, { type: "space.telescope.pillage.start" });
  const builtReason = disabledReason(state, built);
  const scanReason = disabledReason(state, scan);
  const studyReason = disabledReason(state, study);
  const pillageReason = disabledReason(state, pillage);
  const studyCompletedFeedback = spaceText(locale, "feedbackStudyComplete", {
    range: number(state, space.starStudyRange),
  });
  const surveyTimer =
    space.activeSurvey === "asteroids"
      ? state.run.timers[ASTEROID_SCAN_TIMER_ID]
      : space.activeSurvey === "stars"
        ? state.run.timers[STAR_STUDY_TIMER_ID]
        : space.activeSurvey === "pillageVoid"
          ? state.run.timers[VOID_PILLAGE_TIMER_ID]
          : null;
  const surveyRemainingMs = surveyTimer
    ? Math.max(0, surveyTimer.durationMs - surveyTimer.elapsedMs)
    : 0;

  useEffect(() => {
    const previous = previousOutcomeState.current;
    const nextIds = new Set(space.asteroids.map((asteroid) => asteroid.id));
    const discovered = space.asteroids.find((asteroid) => !previous.asteroidIds.has(asteroid.id));
    const arrived = ROCKET_IDS.find(
      (rocketId) =>
        previous.rocketPhases[rocketId] === "outbound" &&
        space.rockets[rocketId].phase === "mining",
    );
    const returned = ROCKET_IDS.find(
      (rocketId) =>
        (previous.rocketPhases[rocketId] === "returning" &&
          space.rockets[rocketId].phase === "ready") ||
        space.rockets[rocketId].journeyCount > previous.rocketJourneys[rocketId],
    );
    const pillageCompleted = space.voidPillageCompletions > previous.voidPillageCompletions;
    if (discovered) {
      setFeedback(spaceText(locale, "feedbackAsteroidFound", { name: discovered.name }));
    } else if (previous.activeSurvey === "asteroids" && space.activeSurvey !== "asteroids") {
      setFeedback(spaceText(locale, "feedbackScanMissed"));
    } else if (space.starStudyRange > previous.starStudyRange) {
      setFeedback(studyCompletedFeedback);
    } else if (pillageCompleted) {
      setFeedback(spaceText(locale, "feedbackPillageComplete"));
    } else if (arrived) {
      const asteroid = space.asteroids.find(
        (entry) => entry.id === space.rockets[arrived].targetAsteroidId,
      );
      if (asteroid) setFeedback(rocketText(locale, "arrived", { name: asteroid.name }));
    } else if (returned) {
      const asteroid = space.asteroids.find(
        (entry) => entry.id === previous.rocketTargets[returned],
      );
      if (asteroid) setFeedback(rocketText(locale, "returned", { name: asteroid.name }));
    }
    previousOutcomeState.current = {
      activeSurvey: space.activeSurvey,
      starStudyRange: space.starStudyRange,
      voidPillageCompletions: space.voidPillageCompletions,
      asteroidIds: nextIds,
      rocketPhases: Object.fromEntries(
        ROCKET_IDS.map((rocketId) => [rocketId, space.rockets[rocketId].phase]),
      ) as Record<RocketId, RocketPhase>,
      rocketTargets: Object.fromEntries(
        ROCKET_IDS.map((rocketId) => [rocketId, space.rockets[rocketId].targetAsteroidId]),
      ) as Record<RocketId, string | null>,
      rocketJourneys: Object.fromEntries(
        ROCKET_IDS.map((rocketId) => [rocketId, space.rockets[rocketId].journeyCount]),
      ) as Record<RocketId, number>,
    };
  }, [
    locale,
    studyCompletedFeedback,
    space.activeSurvey,
    space.asteroids,
    space.rockets,
    space.starStudyRange,
    space.voidPillageCompletions,
  ]);

  function dispatch(command: Parameters<GameStore["dispatch"]>[0], message: string) {
    const result = store.dispatch(command);
    if (result.accepted) {
      setFeedback(message);
      return;
    }
    const failure = result.failure;
    if (!failure) return;
    if (failure.code === "insufficient-cash") {
      setFeedback(
        spaceText(locale, "reasonInsufficientCash", { amount: money(state, failure.required) }),
      );
    } else if (failure.code === "insufficient-material") {
      setFeedback(
        spaceText(locale, "reasonInsufficientMaterial", {
          material: economyGoodName(locale, failure.goodId),
          amount: number(state, failure.required),
        }),
      );
    } else if (failure.code === "insufficient-antimatter") {
      setFeedback(
        spaceText(locale, "reasonInsufficientAntimatter", {
          amount: number(state, failure.required),
        }),
      );
    } else if (failure.messageKey.startsWith("space.reason.")) {
      const key = failure.messageKey.slice("space.reason.".length);
      const keys = {
        "technology-locked": "reasonTechnologyLocked",
        "telescope-required": "reasonTelescopeRequired",
        "telescope-built": "reasonTelescopeBuilt",
        "survey-active": "reasonSurveyActive",
        "no-power": "reasonNoPower",
        "automation-locked": "reasonAutomationLocked",
        "automation-unavailable": "reasonAutomationUnavailable",
        "pillage-locked": "reasonPillageLocked",
      } as const;
      const messageKey = keys[key as keyof typeof keys];
      const rocketMessageKey = ROCKET_FAILURE_MESSAGES[failure.code];
      setFeedback(
        messageKey
          ? spaceText(locale, messageKey)
          : rocketMessageKey
            ? rocketText(locale, rocketMessageKey)
            : failure.messageKey,
      );
    } else {
      setFeedback(failure.messageKey);
    }
  }

  const buildLines = costLines(
    state,
    philosophyDiscountedSpaceCost(state, TELESCOPE_COST, "efficientAssembly", 0.01, true),
  );
  const launchPadBuildCheck = checkPreconditions(state, { type: "space.launch-pad.build" });
  const launchPadBuildReason = disabledReason(state, launchPadBuildCheck);
  const surveyState = space.surveyPowerBlocked
    ? spaceText(locale, "surveyPowerBlocked")
    : space.activeSurvey === "asteroids"
      ? spaceText(locale, "surveySearching")
      : space.activeSurvey === "stars"
        ? spaceText(locale, "surveyStudying")
        : space.activeSurvey === "pillageVoid"
          ? spaceText(locale, "surveyPillaging")
          : spaceText(locale, "surveyIdle");

  return (
    <div
      id="panel-space-mining"
      className="space-mining-panel"
      role="tabpanel"
      aria-labelledby={`tab-${activePane}`}
      tabIndex={0}
      data-testid="space-mining-pane"
    >
      <div className="pane-heading">
        <div>
          <h2>{spaceText(locale, "title")}</h2>
          <p className="pane-intro">{spaceText(locale, "telescopeDescription")}</p>
        </div>
      </div>

      {activePane === "space-mining-launch-pad" && (
        <div className="space-weather-overview" data-testid="space-weather-overview">
          <div className="space-weather-scene">
            <CelestialIllustration
              kind="weather"
              weather={currentWeather}
              className="weather-mark"
            />
          </div>
          <p className="space-range-readout">
            {spaceText(locale, "systemWeather")}:{" "}
            <strong data-testid="space-current-weather">
              {spaceText(locale, WEATHER_MESSAGES[currentWeather])}
            </strong>
          </p>
          <p
            className="space-range-readout"
            data-testid="space-weather-timer"
            data-remaining-ms={weatherChangeInMs}
          >
            {spaceText(locale, "weatherChangesIn")}:{" "}
            {formatDuration(locale, weatherChangeInMs, state.settings.notation)}
          </p>
        </div>
      )}

      <section
        className="space-card"
        aria-labelledby="space-telescope-title"
        hidden={activePane !== "space-mining-telescope"}
      >
        <div className="space-card-heading">
          <div>
            <p className="eyebrow">{spaceText(locale, "surveyIdle")}</p>
            <h3 id="space-telescope-title">{spaceText(locale, "telescopeTitle")}</h3>
          </div>
          <span className={`status-pill${space.telescopeBuilt ? " is-ready" : ""}`}>
            {space.telescopeBuilt
              ? spaceText(locale, "telescopeBuilt")
              : spaceText(locale, "telescopeCost")}
          </span>
        </div>
        {!space.telescopeBuilt ? (
          <>
            <ul className="space-cost-list" aria-label={spaceText(locale, "telescopeCost")}>
              {buildLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <button
              className="primary-button"
              type="button"
              disabled={!built.ok}
              aria-describedby={builtReason ? "telescope-build-reason" : undefined}
              onClick={() =>
                dispatch({ type: "space.telescope.build" }, spaceText(locale, "feedbackBuilt"))
              }
            >
              {spaceText(locale, "telescopeBuild")}
            </button>
            {builtReason && (
              <p className="control-reason" id="telescope-build-reason">
                {builtReason}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="space-survey-status" data-testid="space-survey-status">
              {surveyState}
            </p>
            {surveyTimer && (
              <>
                <p
                  className="space-range-readout"
                  data-testid="space-survey-countdown"
                  data-remaining-ms={surveyRemainingMs}
                >
                  {spaceText(locale, "surveyTimeRemaining", {
                    time: formatDuration(locale, surveyRemainingMs, state.settings.notation),
                  })}
                </p>
                <meter
                  className="space-survey-progress"
                  data-testid="space-survey-progress"
                  min={0}
                  max={100}
                  value={remainingPercent(state, surveyTimer.id)}
                  aria-label={surveyState}
                />
              </>
            )}
            <div className="space-action-row">
              <button
                className="secondary-button"
                type="button"
                disabled={!scan.ok}
                aria-describedby={scanReason ? "telescope-scan-reason" : undefined}
                onClick={() =>
                  dispatch(
                    { type: "space.telescope.scan.start" },
                    spaceText(locale, "feedbackSurveyStarted"),
                  )
                }
              >
                {spaceText(locale, "scanAsteroids")}
              </button>
              <button
                className="secondary-button"
                type="button"
                disabled={!study.ok}
                aria-describedby={studyReason ? "telescope-study-reason" : undefined}
                onClick={() =>
                  dispatch(
                    { type: "space.telescope.study.start" },
                    spaceText(locale, "feedbackSurveyStarted"),
                  )
                }
              >
                {spaceText(locale, "studyStars")}
              </button>
              {voidPillageAvailable && (
                <button
                  className="secondary-button"
                  type="button"
                  disabled={!pillage.ok}
                  aria-describedby={pillageReason ? "telescope-pillage-reason" : undefined}
                  onClick={() =>
                    dispatch(
                      { type: "space.telescope.pillage.start" },
                      spaceText(locale, "feedbackSurveyStarted"),
                    )
                  }
                >
                  {spaceText(locale, "pillageVoid")}
                </button>
              )}
            </div>
            <div className="space-power-costs">
              <span>
                {spaceText(locale, "scanAsteroids")}: 0.4 {economyLabel(locale, "energy")}/s
              </span>
              <span>
                {spaceText(locale, "studyStars")}: 0.7 {economyLabel(locale, "energy")}/s
              </span>
              {voidPillageAvailable && (
                <span>
                  {spaceText(locale, "pillageVoid")}: 1.1 {economyLabel(locale, "energy")}/s
                </span>
              )}
            </div>
            {scanReason && (
              <p className="control-reason" id="telescope-scan-reason">
                {scanReason}
              </p>
            )}
            {studyReason && (
              <p className="control-reason" id="telescope-study-reason">
                {studyReason}
              </p>
            )}
            {voidPillageAvailable && pillageReason && (
              <p className="control-reason" id="telescope-pillage-reason">
                {pillageReason}
              </p>
            )}
            <p className="space-range-readout">
              {spaceText(locale, "starStudyRange")}:{" "}
              <strong>{number(state, space.starStudyRange)}</strong>
            </p>
            {autoTelescopeUnlocked && (
              <div className="space-auto-telescope" data-testid="auto-telescope-controls">
                <div className="space-card-heading">
                  <h4>{spaceText(locale, "autoTitle")}</h4>
                  <span className="status-pill">
                    {spaceText(locale, space.autoTelescopeEnabled ? "autoEnabled" : "autoDisabled")}
                  </span>
                </div>
                <label htmlFor="auto-telescope-mode">{spaceText(locale, "autoMode")}</label>
                <select
                  id="auto-telescope-mode"
                  value={space.autoTelescopeMode}
                  onChange={(event) =>
                    dispatch(
                      {
                        type: "space.telescope.auto.set-mode",
                        mode: event.currentTarget.value as TelescopeMode,
                      },
                      spaceText(locale, "autoMode"),
                    )
                  }
                >
                  <option value="asteroids">{spaceText(locale, "autoAsteroids")}</option>
                  <option value="stars">{spaceText(locale, "autoStars")}</option>
                  {voidPillageAvailable && (
                    <option value="pillageVoid">{spaceText(locale, "autoPillageVoid")}</option>
                  )}
                </select>
                <button
                  className="secondary-button"
                  type="button"
                  aria-pressed={space.autoTelescopeEnabled}
                  onClick={() =>
                    dispatch(
                      {
                        type: "space.telescope.auto.set-enabled",
                        enabled: !space.autoTelescopeEnabled,
                      },
                      spaceText(locale, space.autoTelescopeEnabled ? "autoTurnOff" : "autoTurnOn"),
                    )
                  }
                >
                  {spaceText(locale, space.autoTelescopeEnabled ? "autoTurnOff" : "autoTurnOn")}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section
        className="space-card"
        aria-labelledby="space-asteroids-title"
        hidden={activePane !== "space-mining-asteroids" && activePane !== "space-mining-mining"}
      >
        <div className="space-card-heading">
          <h3 id="space-asteroids-title">
            {spaceText(
              locale,
              activePane === "space-mining-mining" ? "miningTitle" : "asteroidsTitle",
            )}
          </h3>
          {activePane === "space-mining-asteroids" && (
            <span>{number(state, space.asteroids.length)}</span>
          )}
        </div>
        <div hidden={activePane !== "space-mining-mining"}>
          {space.antimatterUnlocked ? (
            <>
              <p className="space-range-readout">
                {spaceText(locale, "antimatterStored")}:{" "}
                <strong>{number(state, space.antimatter)}</strong>
              </p>
              <p className="space-range-readout" data-testid="antimatter-rate">
                {spaceText(locale, "miningRate")}:{" "}
                <strong>{decimal(state, antimatterRate)} /s</strong>
              </p>
              <p className="space-range-readout">
                {spaceText(locale, "runMined")}:{" "}
                <strong>{number(state, space.antimatterMinedThisRun)}</strong>
              </p>
              <p className="space-range-readout">
                {spaceText(locale, "lifetimeMined")}:{" "}
                <strong>{number(state, state.statistics.lifetimeAntimatterMined)}</strong>
              </p>
              <button
                className="secondary-button"
                type="button"
                disabled={antimatterRate <= 0}
                aria-describedby={antimatterRate <= 0 ? "antimatter-boost-reason" : undefined}
                aria-pressed={space.antimatterBoostActive}
                aria-label={spaceText(locale, "boostHold")}
                data-testid="antimatter-boost"
                onPointerDown={() =>
                  store.dispatch({ type: "space.antimatter-boost.set-active", active: true })
                }
                onPointerUp={() =>
                  store.dispatch({ type: "space.antimatter-boost.set-active", active: false })
                }
                onPointerCancel={() =>
                  store.dispatch({ type: "space.antimatter-boost.set-active", active: false })
                }
                onPointerLeave={() =>
                  store.dispatch({ type: "space.antimatter-boost.set-active", active: false })
                }
                onBlur={() =>
                  store.dispatch({ type: "space.antimatter-boost.set-active", active: false })
                }
                onKeyDown={(event) => {
                  if (event.key === " " || event.key === "Enter") {
                    event.preventDefault();
                    store.dispatch({ type: "space.antimatter-boost.set-active", active: true });
                  }
                }}
                onKeyUp={(event) => {
                  if (event.key === " " || event.key === "Enter")
                    store.dispatch({ type: "space.antimatter-boost.set-active", active: false });
                }}
              >
                {spaceText(locale, "boostHold")}
              </button>
              {antimatterRate <= 0 && (
                <p
                  className="control-reason"
                  id="antimatter-boost-reason"
                  data-testid="antimatter-boost-reason"
                >
                  {spaceText(locale, "reasonAntimatterBoostUnavailable")}
                </p>
              )}
            </>
          ) : (
            <p className="space-empty" data-testid="antimatter-locked">
              {spaceText(locale, "antimatterLocked")}
            </p>
          )}
        </div>
        <div hidden={activePane !== "space-mining-asteroids"}>
          {space.asteroids.length === 0 ? (
            <p className="space-empty">{spaceText(locale, "asteroidsEmpty")}</p>
          ) : (
            <ul className="space-asteroid-list">
              {space.asteroids.map((asteroid) => (
                <li key={asteroid.id} data-testid={`asteroid-${asteroid.id}`}>
                  <button
                    type="button"
                    className="space-asteroid-entry"
                    aria-pressed={space.selectedAsteroidId === asteroid.id}
                    onClick={() =>
                      dispatch(
                        { type: "space.asteroid.select", asteroidId: asteroid.id },
                        spaceText(locale, "feedbackAsteroidSelected", { name: asteroid.name }),
                      )
                    }
                  >
                    <CelestialIllustration kind="asteroid" className="asteroid-mark" />
                    <div className="asteroid-copy">
                      <strong>{asteroid.name}</strong>
                      <span>{spaceText(locale, RARITY_MESSAGES[asteroid.rarity])}</span>
                      {asteroid.depleted && <span>{spaceText(locale, "asteroidDepleted")}</span>}
                      {asteroid.reservedBy && (
                        <span>
                          {spaceText(locale, "asteroidReserved", {
                            rocket: rocketText(locale, "rocketLabel", {
                              index: Number(asteroid.reservedBy.slice(-1)),
                            }),
                          })}
                        </span>
                      )}
                      <span>
                        {spaceText(locale, "asteroidDistance")}: {number(state, asteroid.distance)}
                      </span>
                      <span>
                        {spaceText(locale, "antimatterRemaining")}:{" "}
                        {number(state, asteroid.remainingAntimatter)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <section
        className="space-card"
        aria-labelledby="space-assembly-title"
        hidden={
          activePane === "space-mining-telescope" ||
          activePane === "space-mining-asteroids" ||
          activePane === "space-mining-mining"
        }
      >
        <div className="space-card-heading">
          <h3 id="space-assembly-title">{rocketText(locale, "assemblyTitle")}</h3>
        </div>
        {!space.launchPadBuilt && activePane === "space-mining-launch-pad" ? (
          <>
            <h4>{rocketText(locale, "launchPadTitle")}</h4>
            <ul className="space-cost-list" aria-label={rocketText(locale, "launchPadCost")}>
              {costLines(
                state,
                philosophyDiscountedSpaceCost(
                  state,
                  LAUNCH_PAD_COST,
                  "efficientAssembly",
                  0.01,
                  true,
                ),
              ).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <button
              className="primary-button"
              type="button"
              disabled={!launchPadBuildCheck.ok}
              aria-describedby={launchPadBuildReason ? "launch-pad-build-reason" : undefined}
              onClick={() =>
                dispatch({ type: "space.launch-pad.build" }, rocketText(locale, "launchPadBuilt"))
              }
            >
              {rocketText(locale, "buildLaunchPad")}
            </button>
            {launchPadBuildReason && (
              <p className="control-reason" id="launch-pad-build-reason">
                {launchPadBuildReason}
              </p>
            )}
          </>
        ) : !space.launchPadBuilt ? (
          <p className="control-reason">{rocketText(locale, "reasonLaunchPadRequired")}</p>
        ) : (
          <>
            {activePane === "space-mining-launch-pad" && (
              <p className="space-survey-status">{rocketText(locale, "launchPadBuilt")}</p>
            )}
            <div className="space-rocket-grid">
              {ROCKET_IDS.map((rocketId) => {
                const rocket = space.rockets[rocketId];
                const rocketPaneId = `space-mining-rocket-${rocketId.slice(-1)}`;
                const rocketComplete = rocket.builtParts >= ROCKET_PART_REQUIREMENTS[rocketId];
                const showAssemblyCard =
                  activePane === "space-mining-launch-pad" && !rocketComplete;
                const showCompletedRocket = activePane === rocketPaneId && rocketComplete;
                return (
                  <div key={rocketId} hidden={!showAssemblyCard && !showCompletedRocket}>
                    <RocketAssemblyCard rocketId={rocketId} state={state} store={store} />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
      <output className="live-feedback" aria-live="polite" data-testid="space-feedback">
        {feedback}
      </output>
    </div>
  );
}
