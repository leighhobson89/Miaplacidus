import type { ReactNode } from "react";
import type { LocaleId } from "../content/ids";
import { GALAXY_SEED_DEFAULT } from "../content/ids";
import { ECONOMY_BUILDING_NAMES } from "../content/economyBuildingNames";
import { createStarCatalogue, starTypeForSystem } from "../content/starCatalogue";
import { createEconomyTickPlan } from "../engine/economySimulation";
import { selectResearchProductionBreakdown, selectTopStatusEvent } from "../engine/selectors";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import {
  currentWeatherForSystem,
  precipitationForCurrentWeather,
  weatherGenerationMultiplier,
} from "../engine/weather";
import { topStatusText } from "../i18n/topStatusMessages";
import { randomEventName } from "../i18n/metaSignalMessages";
import { economyGoodName } from "./economyDisplay";
import { formatNumber } from "./numberFormatting";
import { formatDuration } from "./timeFormatting";

interface Props {
  readonly state: GameState;
  readonly store: GameStore;
  readonly locale: LocaleId;
}

interface StatProps {
  readonly id: string;
  readonly label: string;
  readonly value: ReactNode;
  readonly tooltip: ReactNode;
  readonly valueClassName?: string | undefined;
  readonly action?: {
    readonly label: string;
    readonly disabled: boolean;
    readonly onClick: () => void;
  };
}

function TopStat({ id, label, value, tooltip, valueClassName, action }: StatProps) {
  const tooltipId = `top-stat-tooltip-${id}`;
  const valueClasses = ["top-stat-value", valueClassName, action ? "top-stat-toggle" : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="top-stat" data-testid={`top-stat-${id}`}>
      <span className="top-stat-label">{label}</span>
      {action ? (
        <button
          className={valueClasses}
          type="button"
          aria-label={action.label}
          aria-describedby={tooltipId}
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {value}
        </button>
      ) : (
        <span className={valueClasses} tabIndex={0} aria-describedby={tooltipId}>
          {value}
        </span>
      )}
      <span className="top-stat-tooltip" id={tooltipId} role="tooltip">
        {tooltip}
      </span>
    </div>
  );
}

export function AscendencyBalance({ state, locale }: Pick<Props, "state" | "locale">) {
  const number = (value: number) => formatNumber(locale, value, 0, state.settings.notation);
  const balances = [
    {
      id: "ap",
      label: "AP",
      value: state.permanent.ascendencyPoints,
      name: translated(locale, "ascendencyPointsName"),
      visible: true,
    },
    {
      id: "cp",
      label: "CP",
      value: state.permanent.galacticCasino.casinoPoints,
      name: translated(locale, "casinoPointsName"),
      visible: state.run.space.ascendencyAwardedThisRun || state.permanent.rebirthCount > 0,
    },
    {
      id: "gp",
      label: "GP",
      value: state.permanent.gloryPoints,
      name: translated(locale, "galacticPointsName"),
      visible: state.permanent.cosmicRip.unlocked,
    },
  ].filter((balance) => balance.visible);
  return (
    <>
      {balances.map((balance) => {
        const tooltipId = `header-${balance.id}-tooltip`;
        return (
          <div
            className="header-ap"
            data-testid={balance.id === "ap" ? "ascendency-balance" : `${balance.id}-balance`}
            key={balance.id}
          >
            <span className="balance-label">{balance.label}</span>
            <strong tabIndex={0} aria-describedby={tooltipId}>
              {number(balance.value)}
            </strong>
            <span className="top-stat-tooltip" id={tooltipId} role="tooltip">
              {balance.name}: {number(balance.value)}
            </span>
          </div>
        );
      })}
    </>
  );
}

export function ResearchBalance({ state, locale }: Pick<Props, "state" | "locale">) {
  const number = (value: number) => formatNumber(locale, value, 1, state.settings.notation);
  const production = selectResearchProductionBreakdown(state);
  const perSecond = (value: number) => translated(locale, "perSecond", { value: number(value) });
  const tooltipId = "header-rp-tooltip";
  return (
    <div className="header-ap">
      <span className="balance-label">RP</span>
      <strong data-testid="research-balance" tabIndex={0} aria-describedby={tooltipId}>
        {formatNumber(locale, state.run.researchPoints, 0, state.settings.notation)}
      </strong>
      <span className="top-stat-tooltip" id={tooltipId} role="tooltip">
        <div>
          {translated(locale, "researchPointsName")}: {formatNumber(
            locale,
            state.run.researchPoints,
            0,
            state.settings.notation,
          )}
        </div>
        <strong>{translated(locale, "researchProduction")}</strong>
        <div>
          {translated(locale, "researchScienceKits")}: {perSecond(production.scienceKits)}
        </div>
        <div>
          {translated(locale, "researchScienceClubs")}: {perSecond(production.scienceClubs)}
        </div>
        <div>
          {translated(locale, "researchScienceLabs")}: {perSecond(production.poweredScienceLabs)}
        </div>
        <div>
          {translated(locale, "researchMegastructureOther")}: {perSecond(
            production.megastructureOtherBonus,
          )}
        </div>
        <div>
          {translated(locale, "researchTotalRate")}: {perSecond(production.total)}
        </div>
      </span>
    </div>
  );
}

function translated(
  locale: LocaleId,
  key: Parameters<typeof topStatusText>[1],
  values: Readonly<Record<string, string | number>> = {},
) {
  return topStatusText(locale, key, values);
}

function WeatherIcon({
  weather,
}: {
  readonly weather: ReturnType<typeof currentWeatherForSystem>;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {weather === "clear" && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </>
      )}
      {weather === "cloudy" && (
        <path d="M7.1 18.4a4.1 4.1 0 0 1-.6-8.15 5.7 5.7 0 0 1 10.8-.72A4.45 4.45 0 1 1 18 18.4H7.1Z" />
      )}
      {(weather === "rain" || weather === "heavyRain") && (
        <>
          <path d="M3 12a9 9 0 0 1 18 0H3Z" />
          <path d="M12 12v6.2a2 2 0 0 0 4 0" />
          <path d="m7 15-1 2m6-2-1 2m6-2-1 2" />
          {weather === "heavyRain" && <path d="m5 20-.6 1.2m6-1.2L9.8 21m6.2-1-.6 1.2" />}
        </>
      )}
      {weather === "volcano" && (
        <>
          <path d="M3 20h18L16 9l-2.1 3.2-2-4.1L9.8 12 8 10 3 20Z" />
          <path d="m10.8 8.1.5-2.4m2.4 2.8 1.2-2.1m-5.6 3.3-1-2" />
        </>
      )}
    </svg>
  );
}

export function LocationStatus({ state, locale }: Pick<Props, "state" | "locale">) {
  const number = (value: number, digits = 0) =>
    formatNumber(locale, value, digits, state.settings.notation);
  const perSecond = (value: number) => `${number(value, 1)}/s`;
  const system = createStarCatalogue(GALAXY_SEED_DEFAULT).find(
    (star) =>
      star.id === state.run.space.currentSystemId ||
      star.name.toLocaleLowerCase("en") === state.run.space.currentSystemId.toLocaleLowerCase("en"),
  );
  const systemName = system?.name ?? state.run.space.currentSystemId;
  const starType = starTypeForSystem(state.run.space.currentSystemId);
  const weather = currentWeatherForSystem(state.run.space);
  const solarOutput =
    state.run.economy.power.environmentalMultiplier *
    weatherGenerationMultiplier(state.run.space) *
    100;
  const precipitation = precipitationForCurrentWeather(state.run.space);
  const precipitationName = precipitation
    ? economyGoodName(locale, precipitation.goodId)
    : translated(locale, "unavailable");
  const weatherLabels = {
    clear: translated(locale, "weatherClear"),
    cloudy: translated(locale, "weatherCloudy"),
    rain: translated(locale, "weatherRain"),
    heavyRain: translated(locale, "weatherHeavyRain"),
    volcano: translated(locale, "weatherVolcano"),
  };
  const tooltipId = "location-status-tooltip";

  return (
    <div className="location-status" data-testid="location-status">
      <span
        className="location-status-summary"
        tabIndex={0}
        aria-label={`${systemName}, ${weatherLabels[weather]}`}
        aria-describedby={tooltipId}
      >
        <span className={`weather-symbol weather-symbol-${weather}`}>
          <WeatherIcon weather={weather} />
        </span>
        <span className="location-status-copy">
          <strong data-testid="top-location-system">{systemName}</strong>
          <small data-testid="top-location-weather">{weatherLabels[weather]}</small>
        </span>
      </span>
      <span className="top-stat-tooltip location-status-tooltip" id={tooltipId} role="tooltip">
        <div>
          {systemName} · {translated(locale, "starType")}: {starType}
        </div>
        <div>
          {translated(locale, "solarEfficiency")}: {number(solarOutput)}%
        </div>
        <div>
          {translated(locale, "weather")}: {weatherLabels[weather]}
        </div>
        <div>
          {translated(locale, "precipitation")}: {precipitationName}
        </div>
        {precipitation && (
          <div>
            {translated(locale, "precipitationRate")}: {perSecond(precipitation.unitsPerSecond)}
          </div>
        )}
      </span>
    </div>
  );
}

export function TopStatusBar({ state, store, locale }: Props) {
  const notation = state.settings.notation;
  const number = (value: number, digits = 0) => formatNumber(locale, value, digits, notation);
  const perSecond = (value: number) => `${number(value, 1)}/s`;
  const tickPlan = createEconomyTickPlan(state);
  const power = state.run.economy.power;
  const powerUnlocked = state.run.economy.researchedTechnologies.includes("basicPowerGeneration");
  const gridRunning = power.gridEnabled && !power.tripped;
  const generation = power.infinitePower ? Number.POSITIVE_INFINITY : tickPlan.generationPerSecond;
  const demand = tickPlan.demandPerSecond;
  const netEnergy = power.infinitePower ? Number.POSITIVE_INFINITY : generation - demand;
  const plantIds = ["powerPlant1", "powerPlant2", "powerPlant3"] as const;
  const plantLines = plantIds.map((id) => {
    const count = state.run.upgrades[id] ?? 0;
    const online = gridRunning && state.run.economy.buildingEnabled[id] && count > 0;
    const name = ECONOMY_BUILDING_NAMES[id][locale];
    return {
      id,
      text: translated(locale, "plantStatus", {
        name,
        count: number(count),
        status: translated(locale, online ? "online" : "offline"),
      }),
    };
  });
  const activeBuyerCount = Object.entries(state.run.economy.autobuyerEnabled).reduce(
    (total, [id, enabled]) =>
      total + (enabled ? (state.run.upgrades[id as keyof typeof state.run.upgrades] ?? 0) : 0),
    0,
  );
  const labCount = state.run.economy.buildingEnabled.scienceLab
    ? (state.run.upgrades.scienceLab ?? 0)
    : 0;
  const pumpCount = Object.values(state.run.space.rockets).filter(
    (rocket) => rocket.fuelPumpEnabled,
  ).length;
  const surveyName = state.run.space.activeSurvey
    ? translated(
        locale,
        state.run.space.activeSurvey === "asteroids"
          ? "surveyAsteroids"
          : state.run.space.activeSurvey === "stars"
            ? "surveyStars"
            : "surveyPillageVoid",
      )
    : translated(locale, "noSurvey");
  const energyTooltip = (
    <>
      <div>
        {translated(locale, "net")}: {perSecond(netEnergy)}
      </div>
      <div>
        {translated(locale, "generated")}: {perSecond(generation)}
      </div>
      <div>
        {translated(locale, "consumed")}: {perSecond(demand)}
      </div>
      <strong>{translated(locale, "generators")}</strong>
      {plantLines.map((line) => (
        <div key={line.id}>{line.text}</div>
      ))}
      <strong>{translated(locale, "consumers")}</strong>
      <div>{translated(locale, "activeBuyers", { count: number(activeBuyerCount) })}</div>
      <div>{translated(locale, "scienceLabs", { count: number(labCount) })}</div>
      <div>{translated(locale, "survey", { name: surveyName })}</div>
      <div>{translated(locale, "rocketPumps", { count: number(pumpCount) })}</div>
    </>
  );
  const batteryCapacity = power.capacity;
  const batteryPercent =
    batteryCapacity > 0 ? Math.min(100, (power.quantity / batteryCapacity) * 100) : 0;
  const batteryRate = gridRunning ? generation - demand : 0;
  const batteryStatus =
    batteryRate > 0
      ? translated(locale, "charging")
      : batteryRate < 0
        ? translated(locale, "depleting")
        : translated(locale, "steady");
  const batterySecondsRemaining =
    batteryRate < 0
      ? power.quantity / -batteryRate
      : demand > 0
        ? power.quantity / demand
        : Number.POSITIVE_INFINITY;
  const powerValueClassName = power.tripped
    ? "is-tripped orange-warning-text"
    : gridRunning && batteryCapacity > 0 && batteryRate < 0
      ? "is-discharging"
      : gridRunning && batteryCapacity > 0 && batteryRate > 0
        ? "is-charging"
        : undefined;
  const batteryDirectionTextClassName =
    batteryCapacity > 0 && batteryRate < 0
      ? "red-disabled-text"
      : batteryCapacity > 0 && batteryRate > 0
        ? "green-ready-text"
        : undefined;
  const powerValue = power.tripped ? (
    translated(locale, "trippedShort")
  ) : !power.gridEnabled ? (
    translated(locale, "off")
  ) : batteryCapacity <= 0 ? (
    <>
      {translated(locale, "on")} <small>({translated(locale, "noBatteryShort")})</small>
    </>
  ) : (
    <>
      {translated(locale, "on")}{" "}
      <small
        className={[powerValueClassName, batteryDirectionTextClassName].filter(Boolean).join(" ")}
      >
        (
        {Number.isFinite(batterySecondsRemaining)
          ? formatDuration(locale, batterySecondsRemaining * 1000)
          : "∞"}
        )
      </small>
    </>
  );
  const powerTooltip = (
    <>
      <div>
        {translated(locale, "powerStatus", {
          status: translated(locale, power.tripped ? "trippedShort" : gridRunning ? "on" : "off"),
        })}
      </div>
      {power.tripped && <div>{translated(locale, "tripped")}</div>}
      {batteryCapacity > 0 ? (
        <>
          <div>
            {translated(locale, "batteryStored")}: {number(power.quantity, 0)}
          </div>
          <div>
            {translated(locale, "batteryCapacity")}: {number(batteryCapacity, 0)}
          </div>
          <div>
            {translated(locale, "batteryLevel")}: {number(batteryPercent)}%
          </div>
          <div>
            {translated(locale, "batteryRate")}: {perSecond(batteryRate)} ({batteryStatus})
          </div>
        </>
      ) : (
        <div>{translated(locale, "noBattery")}</div>
      )}
      <strong>{translated(locale, "generators")}</strong>
      {plantLines.map((line) => (
        <div key={line.id}>{line.text}</div>
      ))}
    </>
  );

  const antimatterVisible =
    state.run.space.launchPadBuilt ||
    state.permanent.megastructures.researchedTechnologyIds.length > 0;
  const antimatterTooltip = antimatterVisible ? (
    <>
      <div>
        {translated(locale, "antimatterAmount")}: {number(state.run.space.antimatter)}
      </div>
      <div>
        {translated(locale, "antimatterLifetime")}: {number(state.run.space.antimatterMinedThisRun)}
      </div>
    </>
  ) : (
    <div>{translated(locale, "antimatterLocked")}</div>
  );
  const runTime = formatDuration(locale, state.run.clock.simulationMs);
  const totalTime = formatDuration(locale, state.statistics.lifetimeActiveMs);
  const timeValue = runTime;
  const timeTooltip = (
    <>
      <div>
        {translated(locale, "runNumber")}: {number(state.permanent.rebirthCount + 1)}
      </div>
      <div>
        {translated(locale, "runDuration")}: {runTime}
      </div>
      <div>
        {translated(locale, "totalDuration")}: {totalTime}
      </div>
      <div>
        {translated(locale, "rebirths")}: {number(state.permanent.rebirthCount)}
      </div>
      {state.permanent.gloryPoints > 0 && (
        <div>
          {translated(locale, "gloryPoints")}: {number(state.permanent.gloryPoints)}
        </div>
      )}
    </>
  );
  const latestEvent = selectTopStatusEvent(state);
  const latestEventName = latestEvent.eventId
    ? randomEventName(locale, latestEvent.eventId)
    : translated(locale, "eventNone");
  const eventRemaining =
    latestEvent.active && latestEvent.remainingMs !== null
      ? formatDuration(locale, latestEvent.remainingMs)
      : null;
  const eventValue = eventRemaining ? (
    <>
      {latestEventName} <small>({eventRemaining})</small>
    </>
  ) : (
    latestEventName
  );
  const eventTooltip = latestEvent.eventId ? (
    <>
      <div>{latestEventName}</div>
      {eventRemaining ? (
        <div>{translated(locale, "eventRemaining", { time: eventRemaining })}</div>
      ) : (
        <div>{translated(locale, "eventLastRecorded")}</div>
      )}
    </>
  ) : (
    <div>{translated(locale, "eventNone")}</div>
  );

  return (
    <section className="top-status-bar" aria-label={translated(locale, "region")}>
      <TopStat
        id="time"
        label={translated(locale, "time")}
        value={timeValue}
        tooltip={timeTooltip}
      />
      <TopStat
        id="event"
        label={translated(locale, "eventStatusLabel")}
        value={eventValue}
        tooltip={eventTooltip}
      />
      {powerUnlocked && (
        <TopStat
          id="energy"
          label={translated(locale, "energy")}
          value={perSecond(netEnergy)}
          tooltip={energyTooltip}
        />
      )}
      {powerUnlocked && (
        <TopStat
          id="power"
          label={translated(locale, "power")}
          value={powerValue}
          valueClassName={powerValueClassName}
          tooltip={powerTooltip}
          action={{
            label: translated(locale, gridRunning ? "turnGridOff" : "turnGridOn"),
            disabled: false,
            onClick: () => store.dispatch({ type: "economy.power.toggle", enabled: !gridRunning }),
          }}
        />
      )}
      {antimatterVisible && (
        <TopStat
          id="antimatter"
          label={translated(locale, "antimatter")}
          value={number(state.run.space.antimatter)}
          tooltip={antimatterTooltip}
        />
      )}
    </section>
  );
}
