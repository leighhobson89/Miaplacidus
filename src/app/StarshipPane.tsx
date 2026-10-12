import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  STARSHIP_MODULES,
  STARSHIP_MODULE_IDS,
  FLEET_ENVOY_COST,
  PLAYER_FLEETS,
  PLAYER_FLEET_IDS,
  STAR_WEATHER_TYPES,
  type SpacePurchaseCost,
  type PlayerFleetId,
  type StarshipModuleId,
  type StarWeatherType,
} from "../content/space";
import { createStarCatalogue, GALAXY_SEED_DEFAULT } from "../content";
import type { EconomicGoodId } from "../content/ids";
import { permanentPerkPurchaseCount } from "../content/economyRules";
import {
  isStarshipReady,
  starshipModulePartCost,
  starshipTravelProgressFraction,
} from "../engine/spaceRules";
import { starshipTravelPlan } from "../engine/spaceMechanics";
import { philosophyRepeatableRank } from "../engine/philosophy";
import {
  playerFleetBuildCost,
  playerFleetUnitStats,
  totalPlayerFleetPower,
  enemyFleetPower,
} from "../engine/fleetMechanics";
import { checkPreconditions, type PreconditionResult } from "../engine/commands";
import { selectEconomyAction, type EconomyActionSelection } from "../engine/selectors";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { economyGoodName } from "./economyDisplay";
import { formatCurrency } from "./currencyFormatting";
import { formatNumber } from "./numberFormatting";
import { InfoTooltip } from "./InfoTooltip";
import { formatDuration } from "./timeFormatting";
import { spaceText } from "../i18n/spaceMessages";
import { starMapText, type StarMapMessageKey } from "../i18n/starMapMessages";
import {
  starshipScanTokenText,
  starshipText,
  type StarshipMessageKey,
} from "../i18n/starshipMessages";
import { CelestialIllustration } from "./CelestialIllustration";

const MODULE_LABELS: Readonly<Record<StarshipModuleId, StarshipModuleId>> = {
  structural: "structural",
  lifeSupport: "lifeSupport",
  antimatterEngine: "antimatterEngine",
  fleetHangar: "fleetHangar",
  stellarScanner: "stellarScanner",
};

const FLEET_LABELS: Readonly<Record<PlayerFleetId, StarshipMessageKey>> = {
  scout: "fleetScout",
  marauder: "fleetMarauder",
  landStalker: "fleetLandStalker",
  navalStrafer: "fleetNavalStrafer",
};

const FLEET_DESCRIPTION_LABELS: Readonly<Record<PlayerFleetId, StarshipMessageKey>> = {
  scout: "fleetScoutDescription",
  marauder: "fleetMarauderDescription",
  landStalker: "fleetLandStalkerDescription",
  navalStrafer: "fleetNavalStraferDescription",
};

const ENEMY_FLEET_LABELS = {
  air: "fleetAir",
  land: "fleetLand",
  sea: "fleetSea",
} as const;

const SCAN_WEATHER_LABELS: Readonly<Record<StarWeatherType, StarMapMessageKey>> = {
  sunny: "sunny",
  cloudy: "cloudy",
  rain: "rain",
  volcano: "volcano",
};

type StarshipFeedback =
  | {
      readonly kind: "starship";
      readonly key: StarshipMessageKey;
      readonly values?: Readonly<Record<string, string | number>>;
    }
  | { readonly kind: "insufficient-cash"; readonly amount: number }
  | {
      readonly kind: "insufficient-material";
      readonly goodId: EconomicGoodId;
      readonly amount: number;
    }
  | { readonly kind: "insufficient-antimatter"; readonly amount: number };

function number(state: GameState, value: number): string {
  return formatNumber(state.settings.locale, value, 2, state.settings.notation);
}

function fleetPowerNumber(state: GameState, value: number): string {
  return number(state, Math.round(value));
}

function renderStyledMessage(
  message: string,
  values: Readonly<Record<string, { readonly text: string; readonly className: string }>>,
): ReactNode {
  const parts: ReactNode[] = [];
  const placeholder = /\{([^}]+)\}/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = placeholder.exec(message))) {
    if (match.index > cursor) parts.push(message.slice(cursor, match.index));
    const name = match[1]!;
    const replacement = values[name];
    parts.push(
      replacement ? (
        <span className={replacement.className} key={`${match.index}-${name}`}>
          {replacement.text}
        </span>
      ) : (
        match[0]
      ),
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < message.length) parts.push(message.slice(cursor));
  return parts;
}

function money(state: GameState, value: number): string {
  return formatCurrency(
    state.settings.locale,
    value,
    state.settings.currencyId ?? "usd",
    2,
    state.settings.notation,
  );
}

function costLines(state: GameState, cost: SpacePurchaseCost): string[] {
  return [
    money(state, cost.cash),
    ...(cost.antimatter === undefined
      ? []
      : [
          `${number(state, cost.antimatter)} ${spaceText(state.settings.locale, "antimatterStored")}`,
        ]),
    ...cost.materials.map(
      ({ goodId, amount }) =>
        `${number(state, amount)} ${economyGoodName(state.settings.locale, goodId)}`,
    ),
  ];
}

function renderFeedback(state: GameState, feedback: StarshipFeedback | null): string {
  if (!feedback) return "";
  if (feedback.kind === "starship")
    return starshipText(state.settings.locale, feedback.key, feedback.values);
  if (feedback.kind === "insufficient-cash")
    return spaceText(state.settings.locale, "reasonInsufficientCash", {
      amount: money(state, feedback.amount),
    });
  if (feedback.kind === "insufficient-material")
    return spaceText(state.settings.locale, "reasonInsufficientMaterial", {
      material: economyGoodName(state.settings.locale, feedback.goodId),
      amount: number(state, feedback.amount),
    });
  return spaceText(state.settings.locale, "reasonInsufficientAntimatter", {
    amount: number(state, feedback.amount),
  });
}

function actionReason(
  state: GameState,
  result: PreconditionResult | EconomyActionSelection,
  fallback: StarshipMessageKey,
): string {
  if ("ok" in result && result.ok) return "";
  if ("enabled" in result && result.enabled) return "";
  const failure = "ok" in result ? (result.ok ? undefined : result.failure) : result.failure;
  if (!failure) return starshipText(state.settings.locale, fallback);
  if (failure.code === "insufficient-cash")
    return spaceText(state.settings.locale, "reasonInsufficientCash", {
      amount: money(state, failure.required),
    });
  if (failure.code === "insufficient-material")
    return spaceText(state.settings.locale, "reasonInsufficientMaterial", {
      material: economyGoodName(state.settings.locale, failure.goodId),
      amount: number(state, failure.required),
    });
  if (failure.code === "insufficient-antimatter")
    return spaceText(state.settings.locale, "reasonInsufficientAntimatter", {
      amount: number(state, failure.required),
    });
  if (failure.code === "space-starship-incomplete")
    return starshipText(state.settings.locale, "incomplete");
  if (failure.code === "space-starship-already-launched")
    return starshipText(state.settings.locale, "alreadyLaunched");
  if (failure.code === "space-starship-destination-invalid")
    return starshipText(state.settings.locale, "noDestination");
  if (failure.code === "space-starship-ftl-required")
    return starshipText(state.settings.locale, "ftlRequired");
  if (failure.code === "space-starship-module-complete")
    return starshipText(state.settings.locale, "moduleComplete");
  if (
    failure.code === "space-envoy-module-required" ||
    failure.code === "space-fleet-hangar-required"
  )
    return starshipText(state.settings.locale, "fleetHangarRequired");
  if (failure.code === "space-envoy-built")
    return starshipText(state.settings.locale, "envoyComplete");
  if (failure.code === "space-fleet-at-capacity")
    return starshipText(state.settings.locale, "fleetAtCapacity");
  return starshipText(state.settings.locale, fallback);
}

export function StarshipPane({
  state,
  store,
  view = "starship",
}: {
  readonly state: GameState;
  readonly store: GameStore;
  readonly view?: "starship" | "fleet-hangar" | "colonise";
}) {
  const [feedback, setFeedbackState] = useState<StarshipFeedback | null>(null);
  const [settlementFeedback, setSettlementFeedback] = useState(false);
  function setFeedbackText(message: StarshipFeedback | null): void {
    setFeedbackState(message);
    setSettlementFeedback(false);
  }
  const [showLaunchWarning, setShowLaunchWarning] = useState(false);
  const launchDialogRef = useRef<HTMLDialogElement>(null);
  const fleetHelpTooltipRef = useRef<HTMLSpanElement>(null);
  const fleetHelpTooltipOffset = useRef(0);
  const [fleetHelpTooltipLayout, setFleetHelpTooltipLayout] = useState({
    narrow: window.innerWidth <= 860,
    rightOffset: 0,
  });
  const space = state.run.space;
  const fleetPower = totalPlayerFleetPower(space.playerFleetCombatTotals);

  function fitFleetHelpTooltip(): void {
    window.requestAnimationFrame(() => {
      const tooltip = fleetHelpTooltipRef.current;
      if (!tooltip) return;
      const rect = tooltip.getBoundingClientRect();
      const narrow = window.innerWidth <= 860;
      const safeInset = 12;
      const baseLeft = rect.left - fleetHelpTooltipOffset.current;
      const baseRight = rect.right - fleetHelpTooltipOffset.current;
      const rightOffset = narrow
        ? Math.max(0, safeInset - baseLeft) -
          Math.max(0, baseRight - (window.innerWidth - safeInset))
        : 0;
      fleetHelpTooltipOffset.current = rightOffset;
      setFleetHelpTooltipLayout((previous) =>
        previous.narrow === narrow && previous.rightOffset === rightOffset
          ? previous
          : { narrow, rightOffset },
      );
    });
  }

  const visibleModules = STARSHIP_MODULE_IDS.filter((moduleId) => {
    const definition = STARSHIP_MODULES[moduleId];
    return (
      state.run.economy.researchedTechnologies.includes(definition.technology) &&
      space.starshipModules[moduleId].builtParts < definition.parts
    );
  });
  const ready = isStarshipReady(space);
  const constructionComplete = ready && visibleModules.length === 0;
  const catalogue = createStarCatalogue(GALAXY_SEED_DEFAULT);
  const destinationSystemId = space.starship.destinationSystemId;
  const destination = catalogue.find((star) => star.id === destinationSystemId);
  const travelPlan = destinationSystemId ? starshipTravelPlan(state, destinationSystemId) : null;
  const starshipTimer = space.starship.timerId ? state.run.timers[space.starship.timerId] : null;
  const starshipRemainingMs = starshipTimer
    ? Math.max(0, starshipTimer.durationMs - starshipTimer.elapsedMs)
    : 0;
  const launchCommand = { type: "space.starship.launch" as const };
  const launchCheck = checkPreconditions(state, launchCommand);
  const scanCommand = { type: "space.starship.system.scan" as const };
  const scanCheck = checkPreconditions(state, scanCommand);
  const envoyCommand = { type: "space.envoy.build" as const };
  const envoyCheck = selectEconomyAction(state, envoyCommand);
  const messageCommand = { type: "space.diplomacy.choose" as const, choice: "message" as const };
  const harmonyCommand = { type: "space.diplomacy.choose" as const, choice: "harmony" as const };
  const bullyCommand = { type: "space.diplomacy.choose" as const, choice: "bully" as const };
  const vassalizeCommand = {
    type: "space.diplomacy.choose" as const,
    choice: "vassalize" as const,
  };
  const enterWarCommand = { type: "space.diplomacy.enter-war" as const };
  const engageBattleCommand = { type: "space.battle.engage" as const };
  const settleSystemCommand = { type: "space.system.settle" as const };
  const messageCheck = checkPreconditions(state, messageCommand);
  const harmonyCheck = checkPreconditions(state, harmonyCommand);
  const bullyCheck = checkPreconditions(state, bullyCommand);
  const vassalizeCheck = checkPreconditions(state, vassalizeCommand);
  const enterWarCheck = checkPreconditions(state, enterWarCommand);
  const engageBattleCheck = checkPreconditions(state, engageBattleCommand);
  const settleSystemCheck = checkPreconditions(state, settleSystemCommand);
  const scannerComplete =
    space.starshipModules.stellarScanner.builtParts >= STARSHIP_MODULES.stellarScanner.parts;
  const scanReading = (reading: ReactNode): ReactNode =>
    scannerComplete ? reading : <span className="red-disabled-text">???</span>;
  const encounter = space.systemEncounters.find(
    (record) => record.systemId === destinationSystemId,
  );
  const destinationProfile = space.systemProfiles.find(
    (profile) => profile.systemId === destinationSystemId,
  );
  const destinationWeatherType = destinationProfile
    ? STAR_WEATHER_TYPES.reduce((prevailing, candidate) =>
        destinationProfile.weatherChances[candidate] > destinationProfile.weatherChances[prevailing]
          ? candidate
          : prevailing,
      )
    : null;
  // Keep scanning on Starship; P-64 presents the saved life report on Colonise.
  const showSystemScan = view === "starship";
  const systemIsSettled =
    destinationSystemId !== null && state.permanent.settledSystemIds.includes(destinationSystemId);
  const enemyFleetsCount = encounter
    ? encounter.enemyFleets.air + encounter.enemyFleets.land + encounter.enemyFleets.sea
    : 0;
  const coloniseHasNoResistance =
    !!encounter &&
    !encounter.warMode &&
    (encounter.civilizationLevel === "none" ||
      encounter.civilizationLevel === "unsentient" ||
      enemyFleetsCount === 0);
  const coloniseDescription = (() => {
    if (view !== "colonise" || !destination || !encounter) return null;
    if (encounter.warMode) {
      return renderStyledMessage(
        starshipText(state.settings.locale, "coloniseBattleDescription"),
        {
          playerPower: {
            text: fleetPowerNumber(state, fleetPower.attackPower),
            className: "green-ready-text",
          },
          enemyPower: {
            text: fleetPowerNumber(state, enemyFleetPower(encounter.enemyFleets)),
            className: "red-disabled-text",
          },
        },
      );
    }
    if (coloniseHasNoResistance) {
      return renderStyledMessage(
        starshipText(state.settings.locale, "coloniseNoResistance"),
        { system: { text: destination.name, className: "green-ready-text" } },
      );
    }
    if (encounter.patience <= 0 && fleetPower.attackPower === 0) {
      return (
        <>
          <span className="green-ready-text">
            {starshipText(state.settings.locale, "coloniseBuildFleets")}
          </span>{" "}
          <span className="red-disabled-text">
            {fleetPowerNumber(state, fleetPower.attackPower)}
          </span>
        </>
      );
    }
    return renderStyledMessage(starshipText(state.settings.locale, "coloniseDescription"), {
      system: { text: destination.name, className: "green-ready-text" },
      playerPower: {
        text: fleetPowerNumber(state, fleetPower.attackPower),
        className: "green-ready-text",
      },
    });
  })();
  const diplomacyUnavailableKey: StarshipMessageKey = space.fleetEnvoyBuilt
    ? "diplomacyActionUnavailable"
    : "diplomacyLocked";
  const messageReason = actionReason(state, messageCheck, diplomacyUnavailableKey);
  const harmonyReason = actionReason(state, harmonyCheck, diplomacyUnavailableKey);
  const bullyReason = actionReason(
    state,
    bullyCheck,
    !space.fleetEnvoyBuilt
      ? "diplomacyLocked"
      : encounter && fleetPower.attackPower <= enemyFleetsCount
        ? "bullyRequiresPower"
        : "diplomacyActionUnavailable",
  );
  const vassalizeReason = actionReason(
    state,
    vassalizeCheck,
    diplomacyUnavailableKey === "diplomacyLocked" ? "diplomacyLocked" : "vassalizeRequirements",
  );
  const enterWarReason = actionReason(state, enterWarCheck, "warUnavailable");
  const engageBattleReason = actionReason(state, engageBattleCheck, "battleUnavailable");
  const settleReason = actionReason(state, settleSystemCheck, "settlementUnavailable");
  const oTypePowerPlantId = destinationSystemId
    ? Object.entries(state.permanent.oTypePowerPlantAssignments).find(
        ([, systemId]) => systemId === destinationSystemId,
      )?.[0]
    : undefined;

  function launchFailureFeedback(): StarshipFeedback | null {
    if (!destination || !travelPlan) return { kind: "starship", key: "noDestination" };
    if (launchCheck.ok) return null;
    if (launchCheck.failure.code === "insufficient-antimatter")
      return { kind: "insufficient-antimatter", amount: launchCheck.failure.required };
    if (launchCheck.failure.code === "space-starship-ftl-required")
      return { kind: "starship", key: "ftlRequired" };
    if (launchCheck.failure.code === "space-starship-incomplete")
      return { kind: "starship", key: "incomplete" };
    if (launchCheck.failure.code === "space-starship-already-launched")
      return { kind: "starship", key: "alreadyLaunched" };
    return { kind: "starship", key: "noDestination" };
  }

  function confirmLaunch(): void {
    const result = store.dispatch(launchCommand);
    setShowLaunchWarning(false);
    if (result.accepted) {
      setFeedbackText({
        kind: "starship",
        key: "travelling",
        values: { name: destination?.name ?? "" },
      });
    } else if (result.failure?.code === "insufficient-antimatter") {
      setFeedbackText({ kind: "insufficient-antimatter", amount: result.failure.required });
    } else {
      setFeedbackText(launchFailureFeedback());
    }
  }

  function scanDestinationSystem(): void {
    const result = store.dispatch(scanCommand);
    if (!result.accepted) {
      setFeedbackText({ kind: "starship", key: "scanUnavailable" });
      return;
    }

    setFeedbackText(null);
  }

  const starshipStatus =
    space.starship.phase === "travelling" && destination
      ? starshipText(state.settings.locale, "travelling", { name: destination.name })
      : space.starship.phase === "orbiting" && destination
        ? starshipText(state.settings.locale, "orbiting", { name: destination.name })
        : starshipText(state.settings.locale, ready ? "ready" : "building");
  const paneTitle =
    view === "fleet-hangar"
      ? starshipText(state.settings.locale, "fleetHangar")
      : view === "colonise"
        ? starshipText(state.settings.locale, "colonise")
        : starshipText(state.settings.locale, "title");

  useEffect(() => {
    const dialog = launchDialogRef.current;
    if (!dialog) return;
    if (showLaunchWarning && !dialog.open) dialog.showModal();
    else if (!showLaunchWarning && dialog.open) dialog.close();
  }, [showLaunchWarning]);

  useEffect(() => {
    const resize = () => fitFleetHelpTooltip();
    window.addEventListener("resize", resize);
    fitFleetHelpTooltip();
    return () => window.removeEventListener("resize", resize);
  }, [state.settings.locale, view]);

  if (!state.run.economy.researchedTechnologies.includes("orbitalConstruction")) return null;

  function dispatchModule(moduleId: StarshipModuleId) {
    const result = store.dispatch({ type: "space.starship.module.build", moduleId });
    if (result.accepted) {
      setFeedbackText({ kind: "starship", key: "partBuilt" });
    } else if (result.failure?.code === "insufficient-cash") {
      setFeedbackText({ kind: "insufficient-cash", amount: result.failure.required });
    } else if (result.failure?.code === "insufficient-material") {
      setFeedbackText({
        kind: "insufficient-material",
        goodId: result.failure.goodId,
        amount: result.failure.required,
      });
    } else if (result.failure?.code === "insufficient-antimatter") {
      setFeedbackText({ kind: "insufficient-antimatter", amount: result.failure.required });
    } else if (result.failure?.code === "space-starship-module-complete") {
      setFeedbackText({ kind: "starship", key: "moduleComplete" });
    } else {
      setFeedbackText(null);
    }
  }

  function renderTravelSummary() {
    return (
      <div className="starship-travel-summary" hidden={view !== "starship"}>
        <h3>{starshipText(state.settings.locale, "destinationSelected")}</h3>
        {destination && travelPlan ? (
          <>
            <p>
              <strong>{destination.name}</strong>
            </p>
            <ul className="space-cost-list">
              <li>{number(state, travelPlan.distanceLy)} ly</li>
              <li>
                {starshipText(state.settings.locale, "fuelCost")}:{" "}
                {number(state, travelPlan.antimatter)}
              </li>
            </ul>
            <p>
              {starshipText(state.settings.locale, "flightTime", {
                seconds: number(state, Math.floor(travelPlan.durationMs / 1000)),
              })}
            </p>
            {space.starship.phase === "travelling" && starshipTimer && (
              <>
                <p
                  className="space-range-readout"
                  data-testid="starship-journey-countdown"
                  data-remaining-ms={starshipRemainingMs}
                >
                  {starshipText(state.settings.locale, "journeyTimeRemaining", {
                    time: formatDuration(
                      state.settings.locale,
                      starshipRemainingMs,
                      state.settings.notation,
                    ),
                  })}
                </p>
                <progress
                  className="space-survey-progress starship-travel-progress"
                  data-testid="starship-travel-progress"
                  max={100}
                  value={starshipTravelProgressFraction(state) * 100}
                  aria-label={starshipText(state.settings.locale, "journeyProgress")}
                />
              </>
            )}
          </>
        ) : (
          <p>{starshipText(state.settings.locale, "noDestination")}</p>
        )}
        {space.starship.phase === "unlaunched" && (
          <>
            <button
              className="primary-button"
              type="button"
              disabled={!launchCheck.ok}
              aria-describedby={!launchCheck.ok ? "starship-launch-reason" : undefined}
              onClick={() => setShowLaunchWarning(true)}
            >
              {starshipText(state.settings.locale, "launch")}
            </button>
            {!launchCheck.ok && (
              <p className="live-feedback" id="starship-launch-reason">
                {renderFeedback(state, launchFailureFeedback())}
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <section
      className={`space-card starship-card${view !== "starship" || space.starship.phase !== "unlaunched" ? " starship-card-plain" : ""}`}
      aria-labelledby="starship-title"
      data-testid="starship-pane"
      data-starship-ready={ready}
    >
      <div className="space-card-heading">
        <div
          className={
            view === "starship" || view === "fleet-hangar" || (view === "colonise" && destination)
              ? "starship-title-with-help"
              : undefined
          }
        >
          <h2 className="game-page-title" id="starship-title">
            {paneTitle}
          </h2>
          {view === "starship" && (
            <InfoTooltip
              id="starship-page-help"
              label={`${paneTitle} — ${starshipText(state.settings.locale, "scanMoreInfoLabel")}`}
              content={starshipText(state.settings.locale, "starshipHeaderHelp")}
              testId="starship-page-help"
            />
          )}
          {view === "fleet-hangar" && (
            <span
              className="starship-fleet-help"
              onMouseEnter={fitFleetHelpTooltip}
              onFocusCapture={fitFleetHelpTooltip}
            >
              <button
                className="starship-fleet-help-trigger"
                type="button"
                aria-label={starshipText(state.settings.locale, "fleetHangarHelpLabel")}
                aria-describedby="starship-fleet-hangar-help"
                data-testid="starship-fleet-hangar-help-trigger"
              >
                ?
              </button>
              <span
                className="top-stat-tooltip starship-fleet-help-tooltip"
                id="starship-fleet-hangar-help"
                role="tooltip"
                data-testid="starship-fleet-hangar-help-tooltip"
                ref={fleetHelpTooltipRef}
                style={{
                  ...(fleetHelpTooltipLayout.narrow
                    ? { left: "auto", right: `${-fleetHelpTooltipLayout.rightOffset}px` }
                    : { left: "0", right: "auto" }),
                  maxWidth: "min(22rem, calc(100vw - 2rem))",
                }}
              >
                {starshipText(state.settings.locale, "fleetHangarHeaderHelp")}
              </span>
            </span>
          )}
          {view === "colonise" && destination && (
            <InfoTooltip
              id="colonise-page-help"
              label={`${paneTitle} — ${starshipText(state.settings.locale, "scanMoreInfoLabel")}`}
              content={starshipText(state.settings.locale, "coloniseHeaderHelp")
                .replace("{system}", destination.name)
                .replace("{fleetPower}", fleetPowerNumber(state, fleetPower.attackPower))}
              testId="colonise-page-help"
            />
          )}
        </div>
        <span
          className="status-pill"
          data-status={ready ? "ready" : "building"}
          data-testid="starship-readiness"
        >
          {starshipStatus}
        </span>
      </div>
      {ready && renderTravelSummary()}
      {(view !== "starship" || space.starship.phase === "unlaunched") && (
        <div className="space-card-illustration-wrap">
          <CelestialIllustration
            kind={
              view === "fleet-hangar"
                ? "fleet"
                : view === "colonise"
                  ? "colonised-surface"
                  : "starship"
            }
          />
        </div>
      )}
      {coloniseDescription && (
        <p className="starship-colonise-description" data-testid="starship-colonise-description">
          {coloniseDescription}
        </p>
      )}
      {view === "starship" && <p>{starshipText(state.settings.locale, "description")}</p>}
      {view === "fleet-hangar" && (
        <p>
          {starshipText(state.settings.locale, "fleetHangarDescription")} {" "}
          <span className="green-ready-text">
            {fleetPowerNumber(state, fleetPower.attackPower)}
          </span>
        </p>
      )}
      {view === "starship" && !constructionComplete && visibleModules.length > 0 && (
        <div className="starship-module-grid">
          {visibleModules.map((moduleId) => {
            const definition = STARSHIP_MODULES[moduleId];
            const module = space.starshipModules[moduleId];
            const command = { type: "space.starship.module.build" as const, moduleId };
            const check = selectEconomyAction(state, command);
            const nextCost = starshipModulePartCost(
              moduleId,
              module.builtParts,
              permanentPerkPurchaseCount(state.permanent.acquiredPerks, "spaceElevator") +
                philosophyRepeatableRank(state, "spaceElevator"),
            );
            const moduleReason = actionReason(state, check, "incomplete");

            return (
              <article
                className="starship-module-card"
                data-testid={`starship-module-${moduleId}`}
                key={moduleId}
              >
                <div className="space-card-heading">
                  <h3>{starshipText(state.settings.locale, MODULE_LABELS[moduleId])}</h3>
                </div>
                <p className="space-rocket-parts">
                  {starshipText(state.settings.locale, "parts")} {number(state, module.builtParts)}{" "}
                  / {number(state, definition.parts)}
                </p>
                {nextCost && (
                  <>
                    <p className="eyebrow">{starshipText(state.settings.locale, "nextPartCost")}</p>
                    <ul className="space-cost-list">
                      {costLines(state, nextCost).map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </>
                )}
                <button
                  className="primary-button"
                  type="button"
                  disabled={!check.enabled}
                  aria-describedby={
                    !check.enabled ? `starship-module-${moduleId}-reason` : undefined
                  }
                  onClick={() => dispatchModule(moduleId)}
                >
                  {starshipText(state.settings.locale, "buildPart")}
                </button>
                {!check.enabled && (
                  <p className="live-feedback" id={`starship-module-${moduleId}-reason`}>
                    {moduleReason}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
      {space.starshipModules.fleetHangar.builtParts < STARSHIP_MODULES.fleetHangar.parts && (
        <section
          className="starship-fleet-hangar"
          data-testid="starship-fleet-hangar"
          hidden={view !== "fleet-hangar"}
        >
          <h3>{starshipText(state.settings.locale, "fleetHangar")}</h3>
          <p>{starshipText(state.settings.locale, "incomplete")}</p>
        </section>
      )}
      {space.starshipModules.fleetHangar.builtParts >= STARSHIP_MODULES.fleetHangar.parts && (
        <section
          className="starship-fleet-hangar"
          data-testid="starship-fleet-hangar"
          hidden={view !== "fleet-hangar"}
        >
          <h3>{starshipText(state.settings.locale, "envoyTitle")}</h3>
          <p data-testid="starship-envoy-description">
            {starshipText(state.settings.locale, "envoyDescription")}
          </p>
          <p data-testid="player-fleet-power">
            {starshipText(state.settings.locale, "fleetPower", {
              attack: number(state, fleetPower.attackPower),
              defense: number(state, fleetPower.defensePower),
            })}
          </p>
          {!space.fleetEnvoyBuilt && (
            <ul className="space-cost-list">
              {costLines(state, FLEET_ENVOY_COST).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
          <button
            className="primary-button"
            type="button"
            disabled={space.fleetEnvoyBuilt || !envoyCheck.enabled}
            aria-describedby={
              !space.fleetEnvoyBuilt && !envoyCheck.enabled ? "starship-envoy-reason" : undefined
            }
            onClick={() => {
              const result = store.dispatch(envoyCommand);
              if (result.accepted) setFeedbackText({ kind: "starship", key: "envoyBuilt" });
              else if (result.failure?.code === "insufficient-cash")
                setFeedbackText({ kind: "insufficient-cash", amount: result.failure.required });
            }}
          >
            {space.fleetEnvoyBuilt
              ? starshipText(state.settings.locale, "envoyComplete")
              : starshipText(state.settings.locale, "buildEnvoy")}
          </button>
          {!space.fleetEnvoyBuilt && !envoyCheck.enabled && (
            <p className="live-feedback" id="starship-envoy-reason">
              {actionReason(state, envoyCheck, "fleetHangarRequired")}
            </p>
          )}
          <div className="starship-fleet-grid">
            {PLAYER_FLEET_IDS.map((fleetId) => {
              const definition = PLAYER_FLEETS[fleetId];
              const quantity = space.playerFleets[fleetId];
              const stats = playerFleetUnitStats(state, fleetId);
              const cost = playerFleetBuildCost(state, fleetId);
              const command = { type: "space.fleet.build" as const, fleetId };
              const check = selectEconomyAction(state, command);
              const atCapacity = quantity >= definition.maxQuantity;
              const fleetReason = atCapacity
                ? starshipText(state.settings.locale, "fleetAtCapacity")
                : actionReason(state, check, "fleetHangarRequired");
              return (
                <article
                  className="starship-fleet-card"
                  data-testid={`starship-fleet-${fleetId}`}
                  key={fleetId}
                >
                  <h4>{starshipText(state.settings.locale, FLEET_LABELS[fleetId])}</h4>
                  <p data-testid={`starship-fleet-description-${fleetId}`}>
                    {starshipText(state.settings.locale, FLEET_DESCRIPTION_LABELS[fleetId])}
                  </p>
                  <p>
                    {starshipText(state.settings.locale, "fleetQuantity")}:{" "}
                    {number(state, quantity)} / {number(state, definition.maxQuantity)}
                  </p>
                  <p>
                    {starshipText(state.settings.locale, "fleetStats", {
                      attack: number(state, stats.attackPower),
                      defense: number(state, stats.defensePower),
                      speed: number(state, stats.speed),
                      health: number(state, stats.maxHealth),
                    })}
                  </p>
                  {!atCapacity && (
                    <ul className="space-cost-list">
                      {costLines(state, cost).map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  )}
                  <button
                    className="primary-button"
                    type="button"
                    data-testid={`starship-fleet-build-${fleetId}`}
                    disabled={atCapacity || !check.enabled}
                    aria-describedby={
                      atCapacity || !check.enabled ? `starship-fleet-${fleetId}-reason` : undefined
                    }
                    onClick={() => {
                      const result = store.dispatch(command);
                      if (result.accepted) setFeedbackText({ kind: "starship", key: "fleetBuilt" });
                      else if (result.failure?.code === "insufficient-cash")
                        setFeedbackText({
                          kind: "insufficient-cash",
                          amount: result.failure.required,
                        });
                      else if (result.failure?.code === "space-fleet-at-capacity")
                        setFeedbackText({ kind: "starship", key: "fleetAtCapacity" });
                      else if (
                        result.failure?.code === "space-fleet-hangar-required" ||
                        result.failure?.code === "space-envoy-module-required"
                      )
                        setFeedbackText({ kind: "starship", key: "fleetHangarRequired" });
                      else setFeedbackText(null);
                    }}
                  >
                    {starshipText(state.settings.locale, "buildFleetShip")}
                  </button>
                  {(atCapacity || !check.enabled) && (
                    <p className="live-feedback" id={`starship-fleet-${fleetId}-reason`}>
                      {fleetReason}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}
      {!ready && renderTravelSummary()}
      {destination && (space.starship.phase === "orbiting" || scanCheck.ok) && (
        <section
          className="starship-system-scan"
          data-testid="starship-system-scan"
          data-travel-progress={starshipTravelProgressFraction(state)}
          hidden={!showSystemScan}
        >
          <h3>{starshipText(state.settings.locale, "performSystemScan")}</h3>
          {encounter ? (
            <div data-testid="starship-scan-complete">
              <p>{starshipText(state.settings.locale, "scanComplete")}</p>
              {!scannerComplete && (
                <p className="red-disabled-text" data-testid="starship-scan-limited-notice">
                  {starshipText(state.settings.locale, "scanLimited")}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="space-action-help-group">
                <button
                  className="primary-button"
                  type="button"
                  disabled={!scanCheck.ok}
                  aria-describedby={!scanCheck.ok ? "starship-scan-reason" : undefined}
                  onClick={scanDestinationSystem}
                  data-testid="starship-scan-system-button"
                >
                  {starshipText(state.settings.locale, "scanSystem")}
                </button>
                <InfoTooltip
                  id="starship-scan-action-help"
                  label={`${starshipText(state.settings.locale, "scanSystem")} — ${starshipText(state.settings.locale, "scanMoreInfoLabel")}`}
                  content={starshipText(state.settings.locale, "scanActionHelp")}
                  testId="starship-scan-action-help"
                />
              </div>
              {!scanCheck.ok && (
                <p className="live-feedback" id="starship-scan-reason">
                  {actionReason(state, scanCheck, "scanUnavailable")}
                </p>
              )}
            </>
          )}
        </section>
      )}
      {destination && encounter && (
        <section
          className="starship-scan-report"
          data-testid="starship-colonise-scan-report"
          hidden={view !== "colonise"}
        >
          <h3>{starshipText(state.settings.locale, "scanReport")}</h3>
          {!scannerComplete && (
            <p className="red-disabled-text" data-testid="starship-scan-report-limited-notice">
              {starshipText(state.settings.locale, "scanLimited")}
            </p>
          )}
          <p
            className={`starship-scan-report-status ${scannerComplete ? (encounter.lifeDetected ? "green-ready-text" : "normal-text") : "red-disabled-text"}`}
            data-testid="starship-system-scan-results"
          >
            {scannerComplete
              ? starshipText(
                  state.settings.locale,
                  encounter.lifeDetected ? "lifeDetected" : "noLifeDetected",
                )
              : "???"}
          </p>
          <dl>
            <div data-testid="starship-scan-report-system">
              <dt>{starMapText(state.settings.locale, "sortName")}</dt>
              <dd>{destination.name}</dd>
            </div>
            <div data-testid="starship-scan-report-ap">
              <dt>
                {starMapText(state.settings.locale, "ascendency")}
                <InfoTooltip
                  id="starship-scan-ap-help"
                  label={`${starMapText(state.settings.locale, "ascendency")} — ${starshipText(state.settings.locale, "scanMoreInfoLabel")}`}
                  content={starshipText(state.settings.locale, "scanApHelp")}
                  testId="starship-scan-ap-help"
                />
              </dt>
              <dd>
                {destinationProfile ? number(state, destinationProfile.ascendencyPoints) : "???"}
              </dd>
            </div>
            <div data-testid="starship-scan-report-weather">
              <dt>
                {starMapText(state.settings.locale, "weather")}
                <InfoTooltip
                  id="starship-scan-weather-help"
                  label={`${starMapText(state.settings.locale, "weather")} — ${starshipText(state.settings.locale, "scanMoreInfoLabel")}`}
                  content={starshipText(state.settings.locale, "scanWeatherHelp")}
                  testId="starship-scan-weather-help"
                />
              </dt>
              <dd>
                {destinationProfile && destinationWeatherType
                  ? `${starMapText(
                      state.settings.locale,
                      SCAN_WEATHER_LABELS[destinationWeatherType],
                    )} (${number(state, destinationProfile.weatherChances[destinationWeatherType])}%) · ${economyGoodName(
                      state.settings.locale,
                      destinationProfile.precipitationGoodId,
                    )}`
                  : "???"}
              </dd>
            </div>
            <div>
              <dt>{starshipText(state.settings.locale, "raceName")}</dt>
              <dd>{scanReading(encounter.raceName)}</dd>
            </div>
            <div>
              <dt>
                {starshipText(state.settings.locale, "civilization")}
                <InfoTooltip
                  id="starship-scan-civilization-help"
                  label={`${starshipText(state.settings.locale, "civilization")} — ${starshipText(state.settings.locale, "scanMoreInfoLabel")}`}
                  content={starshipText(state.settings.locale, "scanCivilizationHelp")}
                  testId="starship-scan-civilization-help"
                />
              </dt>
              <dd>
                {scanReading(
                  starshipScanTokenText(
                    state.settings.locale,
                    "civilization",
                    encounter.civilizationLevel,
                  ),
                )}
              </dd>
            </div>
            <div>
              <dt>{starshipText(state.settings.locale, "population")}</dt>
              <dd>{scanReading(number(state, encounter.populationEstimate))}</dd>
            </div>
            <div>
              <dt>
                {starshipText(state.settings.locale, "threat")}
                <InfoTooltip
                  id="starship-scan-threat-help"
                  label={`${starshipText(state.settings.locale, "threat")} — ${starshipText(state.settings.locale, "scanMoreInfoLabel")}`}
                  content={starshipText(state.settings.locale, "scanThreatHelp")}
                  testId="starship-scan-threat-help"
                />
              </dt>
              <dd>
                {scanReading(
                  starshipScanTokenText(state.settings.locale, "threat", encounter.threatLevel),
                )}
              </dd>
            </div>
            <div>
              <dt>
                {starshipText(state.settings.locale, "defense")}
                <InfoTooltip
                  id="starship-scan-defense-help"
                  label={`${starshipText(state.settings.locale, "defense")} — ${starshipText(state.settings.locale, "scanMoreInfoLabel")}`}
                  content={starshipText(state.settings.locale, "scanDefenseHelp")}
                  testId="starship-scan-defense-help"
                />
              </dt>
              <dd>{scanReading(number(state, encounter.defenseRating))}</dd>
            </div>
            <div>
              <dt>
                {starshipText(state.settings.locale, "attitude")}
                <InfoTooltip
                  id="starship-scan-reception-help"
                  label={`${starshipText(state.settings.locale, "attitude")} — ${starshipText(state.settings.locale, "scanMoreInfoLabel")}`}
                  content={starshipText(state.settings.locale, "receptionStatusHelp")}
                  testId="starship-scan-reception-help"
                />
              </dt>
              <dd>
                {scanReading(
                  starshipScanTokenText(state.settings.locale, "attitude", encounter.attitude),
                )}
              </dd>
            </div>
            <div>
              <dt>{starshipText(state.settings.locale, "impression")}</dt>
              <dd>
                {scanReading(
                  `${number(state, encounter.initialImpression)} / ${number(state, encounter.currentImpression)}`,
                )}
              </dd>
            </div>
            <div>
              <dt>{starshipText(state.settings.locale, "patience")}</dt>
              <dd>{scanReading(number(state, encounter.patience))}</dd>
            </div>
            <div>
              <dt>
                {starshipText(state.settings.locale, "enemyFleets")}
                <InfoTooltip
                  id="starship-scan-enemy-fleets-help"
                  label={`${starshipText(state.settings.locale, "enemyFleets")} — ${starshipText(state.settings.locale, "scanMoreInfoLabel")}`}
                  content={starshipText(state.settings.locale, "scanEnemyFleetsHelp")}
                  testId="starship-scan-enemy-fleets-help"
                />
              </dt>
              <dd>
                {scanReading(
                  `${number(state, encounter.enemyFleets.air)} / ${number(state, encounter.enemyFleets.land)} / ${number(state, encounter.enemyFleets.sea)}`,
                )}
              </dd>
            </div>
            <div>
              <dt>{starshipText(state.settings.locale, "enemyFleetPower")}</dt>
              <dd>{scanReading(number(state, enemyFleetPower(encounter.enemyFleets)))}</dd>
            </div>
            <div>
              <dt>{starshipText(state.settings.locale, "lifeformTraits")}</dt>
              <dd>
                {scanReading(
                  encounter.lifeformTraits
                    .map((trait) => starshipScanTokenText(state.settings.locale, "trait", trait))
                    .join(", "),
                )}
              </dd>
            </div>
            <div>
              <dt>{starshipText(state.settings.locale, "anomalies")}</dt>
              <dd>
                {scanReading(
                  encounter.anomalies
                    .map((anomaly) =>
                      starshipScanTokenText(state.settings.locale, "anomaly", anomaly),
                    )
                    .join(", ") || "—",
                )}
              </dd>
            </div>
          </dl>
        </section>
      )}
      {space.starship.phase === "orbiting" && destination && encounter && (
        <section
          className="starship-diplomacy"
          data-testid="starship-diplomacy"
          hidden={view !== "colonise"}
        >
          <div className="economy-page-title-row">
            <h3>{starshipText(state.settings.locale, "diplomacyTitle")}</h3>
            <InfoTooltip
              id="starship-diplomacy-options-help"
              label={`${starshipText(state.settings.locale, "diplomacyTitle")} — ${starshipText(state.settings.locale, "scanMoreInfoLabel")}`}
              content={starshipText(state.settings.locale, "diplomacyOptionsHelp")}
              testId="starship-diplomacy-options-help"
            />
          </div>
          {!space.fleetEnvoyBuilt && (
            <p>{starshipText(state.settings.locale, "diplomacyLocked")}</p>
          )}
          {encounter.lastDiplomacyMessage && (
            <p
              className="live-feedback"
              data-testid="starship-diplomacy-message"
              aria-live="polite"
            >
              {starshipText(state.settings.locale, encounter.lastDiplomacyMessage)}
            </p>
          )}
          <div className="starship-diplomacy-actions">
            <button
              type="button"
              disabled={!messageCheck.ok}
              aria-describedby={!messageCheck.ok ? "starship-diplomacy-message-reason" : undefined}
              data-testid="starship-diplomacy-message-button"
              onClick={() => store.dispatch(messageCommand)}
            >
              {starshipText(state.settings.locale, "sendMessage")}
            </button>
            {!messageCheck.ok && (
              <p className="live-feedback" id="starship-diplomacy-message-reason">
                {messageReason}
              </p>
            )}
            <button
              type="button"
              disabled={!harmonyCheck.ok}
              aria-describedby={!harmonyCheck.ok ? "starship-diplomacy-harmony-reason" : undefined}
              data-testid="starship-diplomacy-harmony-button"
              onClick={() => store.dispatch(harmonyCommand)}
            >
              {starshipText(state.settings.locale, "seekHarmony")}
            </button>
            {!harmonyCheck.ok && (
              <p className="live-feedback" id="starship-diplomacy-harmony-reason">
                {harmonyReason}
              </p>
            )}
            <button
              type="button"
              disabled={!bullyCheck.ok}
              aria-describedby={!bullyCheck.ok ? "starship-diplomacy-bully-reason" : undefined}
              data-testid="starship-diplomacy-bully-button"
              onClick={() => store.dispatch(bullyCommand)}
            >
              {starshipText(state.settings.locale, "bullyEnemy")}
            </button>
            {!bullyCheck.ok && (
              <p className="live-feedback" id="starship-diplomacy-bully-reason">
                {bullyReason}
              </p>
            )}
            <button
              type="button"
              disabled={!vassalizeCheck.ok}
              aria-describedby={
                !vassalizeCheck.ok ? "starship-diplomacy-vassalize-reason" : undefined
              }
              data-testid="starship-diplomacy-vassalize-button"
              onClick={() => store.dispatch(vassalizeCommand)}
            >
              {starshipText(state.settings.locale, "vassalizeEnemy")}
            </button>
            {!vassalizeCheck.ok && (
              <p className="live-feedback" id="starship-diplomacy-vassalize-reason">
                {vassalizeReason}
              </p>
            )}
          </div>
          {encounter.warReady &&
            !encounter.warMode &&
            enemyFleetPower(encounter.enemyFleets) > 0 && (
              <button
                type="button"
                className="primary-button"
                disabled={!enterWarCheck.ok}
                aria-describedby={!enterWarCheck.ok ? "starship-enter-war-reason" : undefined}
                data-testid="starship-enter-war-button"
                onClick={() => store.dispatch(enterWarCommand)}
              >
                {starshipText(state.settings.locale, "enterWar")}
              </button>
            )}
          {encounter.warReady && !encounter.warMode && !enterWarCheck.ok && (
            <p className="live-feedback" id="starship-enter-war-reason">
              {enterWarReason}
            </p>
          )}
          {encounter.warMode && (
            <p data-testid="starship-war-mode">
              {starshipText(state.settings.locale, "warModeActive")}
            </p>
          )}
        </section>
      )}
      {space.starship.phase === "orbiting" && destination && encounter && (
        <section
          className="starship-battle"
          data-testid="starship-battle"
          hidden={view !== "colonise"}
        >
          <h3>{starshipText(state.settings.locale, "battleTitle")}</h3>
          <p data-testid="starship-battle-status">
            <span role="status" aria-live="polite" aria-atomic="true">
              {starshipText(
                state.settings.locale,
                `battle${encounter.battle.phase}` as StarshipMessageKey,
              )}
            </span>
            {encounter.battle.phase !== "idle" && (
              <>
                {" "}
                ·{" "}
                {starshipText(state.settings.locale, "battleRound", {
                  round: number(state, encounter.battle.round),
                })}
              </>
            )}
          </p>
          {encounter.battle.phase !== "idle" && (
            <dl>
              <dt>{starshipText(state.settings.locale, "playerBattleHealth")}</dt>
              <dd>
                {PLAYER_FLEET_IDS.map(
                  (fleetId) =>
                    `${starshipText(state.settings.locale, FLEET_LABELS[fleetId])}: ${number(state, encounter.battle.playerHealthPool[fleetId])}`,
                ).join(" · ")}
              </dd>
              <dt>{starshipText(state.settings.locale, "enemyBattleHealth")}</dt>
              <dd>
                {(["air", "land", "sea"] as const)
                  .map(
                    (fleetId) =>
                      `${starshipText(state.settings.locale, ENEMY_FLEET_LABELS[fleetId])}: ${number(state, encounter.battle.enemyHealthPool[fleetId])}`,
                  )
                  .join(" · ")}
              </dd>
            </dl>
          )}
          {encounter.warMode &&
            encounter.battle.phase !== "inProgress" &&
            encounter.battle.phase !== "victory" && (
              <button
                className="primary-button"
                type="button"
                disabled={!engageBattleCheck.ok}
                aria-describedby={
                  !engageBattleCheck.ok ? "starship-battle-engage-reason" : undefined
                }
                data-testid="starship-battle-engage-button"
                onClick={() => store.dispatch(engageBattleCommand)}
              >
                {starshipText(state.settings.locale, "engageBattle")}
              </button>
            )}
          {encounter.warMode &&
            encounter.battle.phase !== "inProgress" &&
            encounter.battle.phase !== "victory" &&
            !engageBattleCheck.ok && (
              <p className="live-feedback" id="starship-battle-engage-reason">
                {engageBattleReason}
              </p>
            )}
          {encounter.battle.phase === "victory" && !systemIsSettled && (
            <button
              className="primary-button"
              type="button"
              disabled={!settleSystemCheck.ok}
              aria-describedby={!settleSystemCheck.ok ? "starship-settle-reason" : undefined}
              data-testid="starship-settle-system-button"
              onClick={() => {
                const result = store.dispatch(settleSystemCommand);
                if (result.accepted) {
                  setFeedbackState(null);
                  setSettlementFeedback(true);
                }
              }}
            >
              {starshipText(state.settings.locale, "settleSystem")}
            </button>
          )}
          {systemIsSettled && (
            <p data-testid="starship-system-settled">
              {starshipText(state.settings.locale, "alreadySettled")}
            </p>
          )}
          {oTypePowerPlantId && (
            <p data-testid="starship-o-type-power-plant-bonus">
              {starshipText(state.settings.locale, "oTypePowerPlantBonus", {
                plant: starshipText(
                  state.settings.locale,
                  `plant${oTypePowerPlantId[0]!.toUpperCase()}${oTypePowerPlantId.slice(1)}` as
                    | "plantPowerPlant1"
                    | "plantPowerPlant2"
                    | "plantPowerPlant3",
                ),
              })}
            </p>
          )}
          {encounter.battle.phase !== "victory" &&
            !systemIsSettled &&
            (encounter.attitude === "surrendered" ||
              encounter.civilizationLevel === "none" ||
              encounter.civilizationLevel === "unsentient" ||
              enemyFleetPower(encounter.enemyFleets) === 0) && (
              <button
                className="primary-button"
                type="button"
                disabled={!settleSystemCheck.ok}
                aria-describedby={!settleSystemCheck.ok ? "starship-settle-reason" : undefined}
                data-testid="starship-settle-system-button"
                onClick={() => {
                  const result = store.dispatch(settleSystemCommand);
                  if (result.accepted) {
                    setFeedbackState(null);
                    setSettlementFeedback(true);
                  }
                }}
              >
                {starshipText(state.settings.locale, "settleSystem")}
              </button>
            )}
          {!systemIsSettled && !settleSystemCheck.ok && (
            <p className="live-feedback" id="starship-settle-reason">
              {settleReason}
            </p>
          )}
        </section>
      )}
      <output className="live-feedback" aria-live="polite" data-testid="starship-feedback">
        {settlementFeedback
          ? starshipText(state.settings.locale, "settlementComplete")
          : renderFeedback(state, feedback)}
      </output>
      <dialog
        ref={launchDialogRef}
        className="starship-launch-dialog"
        aria-labelledby="starship-launch-dialog-title"
        aria-describedby="starship-launch-dialog-warning"
        onCancel={(event) => {
          event.preventDefault();
          setShowLaunchWarning(false);
        }}
      >
        <h3 id="starship-launch-dialog-title">
          {starshipText(state.settings.locale, "pointOfNoReturnTitle")}
        </h3>
        <p id="starship-launch-dialog-warning">
          {starshipText(state.settings.locale, "pointOfNoReturn")}
        </p>
        {destination && travelPlan && (
          <p>
            {destination.name} · {number(state, travelPlan.antimatter)}{" "}
            {spaceText(state.settings.locale, "antimatterStored")}
          </p>
        )}
        <div className="starship-launch-actions">
          <button type="button" onClick={() => setShowLaunchWarning(false)}>
            {starshipText(state.settings.locale, "cancelLaunch")}
          </button>
          <button className="primary-button" type="button" onClick={confirmLaunch}>
            {starshipText(state.settings.locale, "confirmLaunch")}
          </button>
        </div>
      </dialog>
    </section>
  );
}
