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
import { economyGoodName } from "./EconomyPanes";
import { checkPreconditions } from "../engine/commands";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { antimatterMiningRatePerSecond, rocketFuelRatePerSecond } from "../engine/spaceMechanics";
import { spaceText, type SpaceMessageKey } from "../i18n/spaceMessages";
import { economyLabel } from "../i18n/economyMessages";
import { rocketText, type RocketMessageKey } from "../i18n/rocketMessages";
import { rocketPartCost } from "../engine/spaceRules";
import { permanentPerkPurchaseCount } from "../content/economyRules";
import { currentWeatherForSystem, STAR_WEATHER_TIMER_ID } from "../engine/weather";

interface SpaceMiningPaneProps {
  readonly state: GameState;
  readonly store: GameStore;
}

function number(locale: GameState["settings"]["locale"], value: number): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

function decimal(locale: GameState["settings"]["locale"], value: number): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
}

function money(locale: GameState["settings"]["locale"], value: number): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function costLines(state: GameState, cost: SpacePurchaseCost): string[] {
  const locale = state.settings.locale;
  return [
    money(locale, cost.cash),
    ...(cost.antimatter === undefined
      ? []
      : [`${number(locale, cost.antimatter)} ${spaceText(locale, "antimatterStored")}`]),
    ...cost.materials.map(
      ({ goodId, amount }) => `${number(locale, amount)} ${economyGoodName(locale, goodId)}`,
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
  const partCost = rocketPartCost(rocket.builtParts);
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
  const journeyTimer = rocket.timerId ? state.run.timers[rocket.timerId] : null;

  function dispatch(command: Parameters<GameStore["dispatch"]>[0], success: string) {
    const result = store.dispatch(command);
    if (result.accepted) {
      setFeedback(success);
      return;
    }
    if (result.failure?.code === "insufficient-cash") {
      setFeedback(
        spaceText(locale, "reasonInsufficientCash", {
          amount: money(locale, result.failure.required),
        }),
      );
      return;
    }
    if (result.failure?.code === "insufficient-material") {
      setFeedback(
        spaceText(locale, "reasonInsufficientMaterial", {
          material: economyGoodName(locale, result.failure.goodId),
          amount: number(locale, result.failure.required),
        }),
      );
      return;
    }
    if (result.failure?.code === "insufficient-antimatter") {
      setFeedback(
        spaceText(locale, "reasonInsufficientAntimatter", {
          amount: number(locale, result.failure.required),
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
          {number(locale, rocket.builtParts)} / {number(locale, requiredParts)}
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
            onClick={() => dispatch(partCommand, rocketText(locale, "parts"))}
          >
            {rocketText(locale, "buildPart")}
          </button>
        </>
      )}
      {rocket.builtParts === requiredParts && (
        <>
          {rocket.phase === "ready" && (
            <>
              <p className="space-rocket-parts">{rocketText(locale, "pumpTitle")}</p>
              <p className="space-rocket-power">
                {decimal(locale, rocketFuelRatePerSecond(state))}/s ·{" "}
                {decimal(locale, ROCKET_FUEL_PUMP_POWER[rocketId])} {economyLabel(locale, "energy")}
                /s
              </p>
              {!rocket.fuelPumpPurchased ? (
                <>
                  <p className="cost-line">
                    {rocketText(locale, "pumpCost")}:{" "}
                    {money(locale, ROCKET_FUEL_PUMP_BASE_COST[rocketId])}
                  </p>
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={!pumpCheck.ok}
                    onClick={() => dispatch(pumpCommand, rocketText(locale, "startFueling"))}
                  >
                    {rocketText(locale, "buyPump")}
                  </button>
                  {!pumpCheck.ok && pumpCheck.failure.code === "space-fuel-tech-locked" && (
                    <p className="control-reason">{rocketText(locale, "reasonFuelTechnology")}</p>
                  )}
                </>
              ) : (
                <>
                  <label className="space-fuel-meter" htmlFor={`${rocketId}-fuel`}>
                    <span>{rocketText(locale, "fuelLevel")}</span>
                    <strong>
                      {number(locale, rocket.fuelQuantity)} / {number(locale, fuelCapacity)}
                    </strong>
                  </label>
                  <meter
                    id={`${rocketId}-fuel`}
                    min={0}
                    max={fuelCapacity}
                    value={rocket.fuelQuantity}
                  />
                  {rocket.fuelQuantity < fuelCapacity && (
                    <button
                      className="text-button"
                      type="button"
                      disabled={!rocket.fuelPumpEnabled && !pumpStartCheck.ok}
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
                  {!pumpStartCheck.ok && pumpStartCheck.failure.code === "space-no-grid" && (
                    <p className="control-reason">{rocketText(locale, "reasonNoGrid")}</p>
                  )}
                </>
              )}
              <button
                className="primary-button"
                type="button"
                disabled={!launchCheck.ok}
                onClick={() => dispatch(launchCommand, rocketText(locale, "orbit"))}
              >
                {rocketText(locale, "launch")}
              </button>
              {!launchCheck.ok && launchCheck.failure.code === "space-weather-blocked" && (
                <p className="control-reason">{rocketText(locale, "reasonWeatherBlocked")}</p>
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
                onClick={() =>
                  travelCommand && dispatch(travelCommand, rocketText(locale, "journeyStarted"))
                }
              >
                {rocketText(locale, "travelToAsteroid")}
              </button>
              {travelCheck &&
                !travelCheck.ok &&
                (travelCheck.failure.code === "space-asteroid-unavailable" ||
                  travelCheck.failure.code === "space-rocket-not-orbiting") && (
                  <p className="control-reason">
                    {rocketText(
                      locale,
                      ROCKET_FAILURE_MESSAGES[travelCheck.failure.code] ??
                        "reasonAsteroidUnavailable",
                    )}
                  </p>
                )}
            </>
          )}
          {(rocket.phase === "outbound" || rocket.phase === "returning") && journeyTimer && (
            <meter
              className="space-survey-progress"
              min={0}
              max={100}
              value={remainingPercent(state, journeyTimer.id)}
              aria-label={rocketPhaseText(state, rocket.phase)}
            />
          )}
          {rocket.phase === "mining" && rocketTargetAsteroid && (
            <p className="space-rocket-parts">
              {rocketTargetAsteroid.name}:{" "}
              {number(locale, rocketTargetAsteroid.remainingAntimatter)}
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

export function SpaceMiningPane({ state, store }: SpaceMiningPaneProps) {
  const locale = state.settings.locale;
  const [feedback, setFeedback] = useState("");
  const space = state.run.space;
  const currentWeather = currentWeatherForSystem(space);
  const weatherTimer = state.run.timers[STAR_WEATHER_TIMER_ID];
  const weatherChangeInSeconds = weatherTimer
    ? Math.max(0, Math.ceil((weatherTimer.durationMs - weatherTimer.elapsedMs) / 1000))
    : 0;
  const currentPrecipitationRate =
    currentWeather === "rain" || currentWeather === "heavyRain"
      ? space.currentPrecipitationRate
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
  const surveyTimer =
    space.activeSurvey === "asteroids"
      ? state.run.timers[ASTEROID_SCAN_TIMER_ID]
      : space.activeSurvey === "stars"
        ? state.run.timers[STAR_STUDY_TIMER_ID]
        : space.activeSurvey === "pillageVoid"
          ? state.run.timers[VOID_PILLAGE_TIMER_ID]
          : null;

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
      setFeedback(
        spaceText(locale, "feedbackStudyComplete", { range: number(locale, space.starStudyRange) }),
      );
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
        spaceText(locale, "reasonInsufficientCash", { amount: money(locale, failure.required) }),
      );
    } else if (failure.code === "insufficient-material") {
      setFeedback(
        spaceText(locale, "reasonInsufficientMaterial", {
          material: economyGoodName(locale, failure.goodId),
          amount: number(locale, failure.required),
        }),
      );
    } else if (failure.code === "insufficient-antimatter") {
      setFeedback(
        spaceText(locale, "reasonInsufficientAntimatter", {
          amount: number(locale, failure.required),
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

  const buildLines = costLines(state, TELESCOPE_COST);
  const launchPadBuildCheck = checkPreconditions(state, { type: "space.launch-pad.build" });
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
    <div className="space-mining-panel" data-testid="space-mining-pane">
      <div className="pane-heading">
        <div>
          <p className="eyebrow">04 / {spaceText(locale, "title")}</p>
          <h2>{spaceText(locale, "title")}</h2>
          <p className="pane-intro">{spaceText(locale, "telescopeDescription")}</p>
        </div>
      </div>

      <section className="space-card" aria-labelledby="space-telescope-title">
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
              onClick={() =>
                dispatch({ type: "space.telescope.build" }, spaceText(locale, "feedbackBuilt"))
              }
            >
              {spaceText(locale, "telescopeBuild")}
            </button>
          </>
        ) : (
          <>
            <p className="space-survey-status" data-testid="space-survey-status">
              {surveyState}
            </p>
            {surveyTimer && (
              <meter
                className="space-survey-progress"
                data-testid="space-survey-progress"
                min={0}
                max={100}
                value={remainingPercent(state, surveyTimer.id)}
                aria-label={surveyState}
              />
            )}
            <div className="space-action-row">
              <button
                className="secondary-button"
                type="button"
                disabled={!scan.ok}
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
            {!scan.ok && scan.failure?.code === "space-no-power" && (
              <p className="control-reason">{spaceText(locale, "reasonNoPower")}</p>
            )}
            <p className="space-range-readout">
              {spaceText(locale, "starStudyRange")}:{" "}
              <strong>{number(locale, space.starStudyRange)}</strong>
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

      <section className="space-card" aria-labelledby="space-asteroids-title">
        <div className="space-card-heading">
          <h3 id="space-asteroids-title">{spaceText(locale, "asteroidsTitle")}</h3>
          <span>{number(locale, space.asteroids.length)}</span>
        </div>
        {space.antimatterUnlocked ? (
          <>
            <p className="space-range-readout">
              {spaceText(locale, "antimatterStored")}:{" "}
              <strong>{number(locale, space.antimatter)}</strong>
            </p>
            <p className="space-range-readout" data-testid="antimatter-rate">
              {spaceText(locale, "miningRate")}:{" "}
              <strong>{decimal(locale, antimatterRate)} /s</strong>
            </p>
            <p className="space-range-readout">
              {spaceText(locale, "runMined")}:{" "}
              <strong>{number(locale, space.antimatterMinedThisRun)}</strong>
            </p>
            <p className="space-range-readout">
              {spaceText(locale, "lifetimeMined")}:{" "}
              <strong>{number(locale, state.statistics.lifetimeAntimatterMined)}</strong>
            </p>
            <button
              className="secondary-button"
              type="button"
              disabled={antimatterRate <= 0}
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
          </>
        ) : (
          <p className="space-empty" data-testid="antimatter-locked">
            {spaceText(locale, "antimatterLocked")}
          </p>
        )}
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
                    {spaceText(locale, "asteroidDistance")}: {number(locale, asteroid.distance)}
                  </span>
                  <span>
                    {spaceText(locale, "antimatterRemaining")}:{" "}
                    {number(locale, asteroid.remainingAntimatter)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="space-card" aria-labelledby="space-assembly-title">
        <div className="space-card-heading">
          <h3 id="space-assembly-title">{rocketText(locale, "assemblyTitle")}</h3>
        </div>
        <p className="space-range-readout">
          {spaceText(locale, "systemWeather")}:{" "}
          <strong data-testid="space-current-weather">
            {spaceText(locale, WEATHER_MESSAGES[currentWeather])}
          </strong>
        </p>
        <p className="space-range-readout" data-testid="space-weather-timer">
          {spaceText(locale, "weatherChangesIn")}: {number(locale, weatherChangeInSeconds)} s
        </p>
        <p className="space-range-readout" data-testid="space-precipitation-rate">
          {spaceText(locale, "precipitationRate")}: {decimal(locale, currentPrecipitationRate)} / s
        </p>
        <p className="space-range-readout" data-testid="space-precipitation-this-run">
          {spaceText(locale, "precipitationThisRun")}:{" "}
          {decimal(locale, space.precipitationCollectedThisRun)}
        </p>
        {!space.launchPadBuilt ? (
          <>
            <h4>{rocketText(locale, "launchPadTitle")}</h4>
            <ul className="space-cost-list" aria-label={rocketText(locale, "launchPadCost")}>
              {costLines(state, LAUNCH_PAD_COST).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <button
              className="primary-button"
              type="button"
              disabled={!launchPadBuildCheck.ok}
              onClick={() =>
                dispatch({ type: "space.launch-pad.build" }, rocketText(locale, "launchPadBuilt"))
              }
            >
              {rocketText(locale, "buildLaunchPad")}
            </button>
            {!launchPadBuildCheck.ok &&
              launchPadBuildCheck.failure.code === "space-launch-pad-tech-locked" && (
                <p className="control-reason">{rocketText(locale, "reasonLaunchPadTechnology")}</p>
              )}
          </>
        ) : (
          <div className="space-rocket-grid">
            {ROCKET_IDS.map((rocketId) => (
              <RocketAssemblyCard key={rocketId} rocketId={rocketId} state={state} store={store} />
            ))}
          </div>
        )}
      </section>
      <output className="live-feedback" aria-live="polite" data-testid="space-feedback">
        {feedback}
      </output>
    </div>
  );
}
