import { useEffect, useRef, useState } from "react";
import {
  STARSHIP_MODULES,
  STARSHIP_MODULE_IDS,
  FLEET_ENVOY_COST,
  PLAYER_FLEETS,
  PLAYER_FLEET_IDS,
  type SpacePurchaseCost,
  type PlayerFleetId,
  type StarshipModuleId,
} from "../content/space";
import { createStarCatalogue, GALAXY_SEED_DEFAULT } from "../content";
import { permanentPerkPurchaseCount } from "../content/economyRules";
import { isStarshipReady, starshipModulePartCost } from "../engine/spaceRules";
import { starshipTravelPlan } from "../engine/spaceMechanics";
import { philosophyRepeatableRank } from "../engine/philosophy";
import {
  playerFleetBuildCost,
  playerFleetUnitStats,
  totalPlayerFleetPower,
  enemyFleetPower,
} from "../engine/fleetMechanics";
import { checkPreconditions, type PreconditionResult } from "../engine/commands";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { economyGoodName } from "./economyDisplay";
import { formatCurrency } from "./currencyFormatting";
import { formatNumber } from "./numberFormatting";
import { spaceText } from "../i18n/spaceMessages";
import { starshipText, type StarshipMessageKey } from "../i18n/starshipMessages";
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

function number(state: GameState, value: number): string {
  return formatNumber(state.settings.locale, value, 2, state.settings.notation);
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

function presentSystemToken(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toLocaleUpperCase("en"));
}

function actionReason(
  state: GameState,
  result: PreconditionResult,
  fallback: StarshipMessageKey,
): string {
  if (result.ok) return "";
  const failure = result.failure;
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
  const [feedbackText, setFeedbackText] = useState("");
  const [showLaunchWarning, setShowLaunchWarning] = useState(false);
  const launchDialogRef = useRef<HTMLDialogElement>(null);
  const space = state.run.space;
  const fleetPower = totalPlayerFleetPower(space.playerFleetCombatTotals);

  const visibleModules = STARSHIP_MODULE_IDS.filter((moduleId) =>
    state.run.economy.researchedTechnologies.includes(STARSHIP_MODULES[moduleId].technology),
  );
  const ready = isStarshipReady(space);
  const catalogue = createStarCatalogue(GALAXY_SEED_DEFAULT);
  const destinationSystemId = space.starship.destinationSystemId;
  const destination = catalogue.find((star) => star.id === destinationSystemId);
  const travelPlan = destinationSystemId ? starshipTravelPlan(state, destinationSystemId) : null;
  const launchCommand = { type: "space.starship.launch" as const };
  const launchCheck = checkPreconditions(state, launchCommand);
  const scanCommand = { type: "space.starship.system.scan" as const };
  const scanCheck = checkPreconditions(state, scanCommand);
  const envoyCommand = { type: "space.envoy.build" as const };
  const envoyCheck = checkPreconditions(state, envoyCommand);
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
  const encounter = space.systemEncounters.find(
    (record) => record.systemId === destinationSystemId,
  );
  const systemIsSettled =
    destinationSystemId !== null && state.permanent.settledSystemIds.includes(destinationSystemId);
  const enemyFleetsCount = encounter
    ? encounter.enemyFleets.air + encounter.enemyFleets.land + encounter.enemyFleets.sea
    : 0;
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

  function launchFailureText(): string {
    if (!destination || !travelPlan) return starshipText(state.settings.locale, "noDestination");
    if (launchCheck.ok) return "";
    if (launchCheck.failure.code === "insufficient-antimatter")
      return spaceText(state.settings.locale, "reasonInsufficientAntimatter", {
        amount: number(state, launchCheck.failure.required),
      });
    if (launchCheck.failure.code === "space-starship-ftl-required")
      return starshipText(state.settings.locale, "ftlRequired");
    if (launchCheck.failure.code === "space-starship-incomplete")
      return starshipText(state.settings.locale, "incomplete");
    if (launchCheck.failure.code === "space-starship-already-launched")
      return starshipText(state.settings.locale, "alreadyLaunched");
    return starshipText(state.settings.locale, "noDestination");
  }

  function confirmLaunch(): void {
    const result = store.dispatch(launchCommand);
    setShowLaunchWarning(false);
    if (result.accepted) {
      setFeedbackText(
        starshipText(state.settings.locale, "travelling", { name: destination?.name ?? "" }),
      );
    } else if (result.failure?.code === "insufficient-antimatter") {
      setFeedbackText(
        spaceText(state.settings.locale, "reasonInsufficientAntimatter", {
          amount: number(state, result.failure.required),
        }),
      );
    } else {
      setFeedbackText(launchFailureText());
    }
  }

  function scanDestinationSystem(): void {
    const result = store.dispatch(scanCommand);
    setFeedbackText(
      result.accepted
        ? starshipText(state.settings.locale, "scanComplete")
        : starshipText(state.settings.locale, "scannerRequired"),
    );
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

  if (!state.run.economy.researchedTechnologies.includes("orbitalConstruction")) return null;

  function dispatchModule(moduleId: StarshipModuleId) {
    const result = store.dispatch({ type: "space.starship.module.build", moduleId });
    if (result.accepted) {
      setFeedbackText(starshipText(state.settings.locale, "partBuilt"));
    } else if (result.failure?.code === "insufficient-cash") {
      setFeedbackText(
        spaceText(state.settings.locale, "reasonInsufficientCash", {
          amount: money(state, result.failure.required),
        }),
      );
    } else if (result.failure?.code === "insufficient-material") {
      setFeedbackText(
        spaceText(state.settings.locale, "reasonInsufficientMaterial", {
          material: economyGoodName(state.settings.locale, result.failure.goodId),
          amount: number(state, result.failure.required),
        }),
      );
    } else if (result.failure?.code === "insufficient-antimatter") {
      setFeedbackText(
        spaceText(state.settings.locale, "reasonInsufficientAntimatter", {
          amount: number(state, result.failure.required),
        }),
      );
    } else if (result.failure?.code === "space-starship-module-complete") {
      setFeedbackText(starshipText(state.settings.locale, "moduleComplete"));
    } else {
      setFeedbackText(result.failure?.messageKey ?? "");
    }
  }

  return (
    <section
      className="space-card starship-card"
      aria-labelledby="starship-title"
      data-testid="starship-pane"
    >
      <div className="space-card-heading">
        <div>
          <p className="eyebrow">{starshipStatus}</p>
          <h3 id="starship-title">{paneTitle}</h3>
        </div>
        <span
          className="status-pill"
          data-status={ready ? "ready" : "building"}
          data-testid="starship-readiness"
        >
          {starshipStatus}
        </span>
      </div>
      <div className="space-card-illustration-wrap">
        <CelestialIllustration
          kind={
            view === "fleet-hangar" ? "fleet" : view === "colonise" ? "megastructure" : "starship"
          }
        />
      </div>
      {view === "starship" && <p>{starshipText(state.settings.locale, "description")}</p>}
      <div className="starship-module-grid" hidden={view !== "starship"}>
        {visibleModules.map((moduleId) => {
          const definition = STARSHIP_MODULES[moduleId];
          const module = space.starshipModules[moduleId];
          const complete = module.builtParts >= definition.parts;
          const command = { type: "space.starship.module.build" as const, moduleId };
          const check = checkPreconditions(state, command);
          const nextCost = complete
            ? null
            : starshipModulePartCost(
                moduleId,
                module.builtParts,
                permanentPerkPurchaseCount(state.permanent.acquiredPerks, "spaceElevator") +
                  philosophyRepeatableRank(state, "spaceElevator"),
              );
          const moduleReason = complete ? "" : actionReason(state, check, "incomplete");

          return (
            <article
              className="starship-module-card"
              data-testid={`starship-module-${moduleId}`}
              key={moduleId}
            >
              <div className="space-card-heading">
                <h4>{starshipText(state.settings.locale, MODULE_LABELS[moduleId])}</h4>
                <span className="status-pill">
                  {starshipText(
                    state.settings.locale,
                    definition.requiredForTravel ? "required" : "optional",
                  )}
                </span>
              </div>
              <p className="space-rocket-parts">
                {starshipText(state.settings.locale, "parts")}: {number(state, module.builtParts)} /{" "}
                {number(state, definition.parts)}
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
                disabled={complete || !check.ok}
                aria-describedby={
                  !complete && !check.ok ? `starship-module-${moduleId}-reason` : undefined
                }
                onClick={() => dispatchModule(moduleId)}
              >
                {complete
                  ? starshipText(state.settings.locale, "moduleComplete")
                  : starshipText(state.settings.locale, "buildPart")}
              </button>
              {!complete && !check.ok && (
                <p className="live-feedback" id={`starship-module-${moduleId}-reason`}>
                  {moduleReason}
                </p>
              )}
            </article>
          );
        })}
      </div>
      {space.starshipModules.fleetHangar.builtParts < STARSHIP_MODULES.fleetHangar.parts && (
        <section
          className="starship-fleet-hangar"
          data-testid="starship-fleet-hangar"
          hidden={view !== "fleet-hangar"}
        >
          <h4>{starshipText(state.settings.locale, "fleetHangar")}</h4>
          <p>{starshipText(state.settings.locale, "incomplete")}</p>
        </section>
      )}
      {space.starshipModules.fleetHangar.builtParts >= STARSHIP_MODULES.fleetHangar.parts && (
        <section
          className="starship-fleet-hangar"
          data-testid="starship-fleet-hangar"
          hidden={view !== "fleet-hangar"}
        >
          <h4>{starshipText(state.settings.locale, "envoyTitle")}</h4>
          <p>{starshipText(state.settings.locale, "envoyDescription")}</p>
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
            disabled={space.fleetEnvoyBuilt || !envoyCheck.ok}
            aria-describedby={
              !space.fleetEnvoyBuilt && !envoyCheck.ok ? "starship-envoy-reason" : undefined
            }
            onClick={() => {
              const result = store.dispatch(envoyCommand);
              if (result.accepted)
                setFeedbackText(starshipText(state.settings.locale, "envoyBuilt"));
              else if (result.failure?.code === "insufficient-cash")
                setFeedbackText(
                  spaceText(state.settings.locale, "reasonInsufficientCash", {
                    amount: money(state, result.failure.required),
                  }),
                );
            }}
          >
            {space.fleetEnvoyBuilt
              ? starshipText(state.settings.locale, "envoyComplete")
              : starshipText(state.settings.locale, "buildEnvoy")}
          </button>
          {!space.fleetEnvoyBuilt && !envoyCheck.ok && (
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
              const check = checkPreconditions(state, command);
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
                  <h5>{starshipText(state.settings.locale, FLEET_LABELS[fleetId])}</h5>
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
                    disabled={atCapacity || !check.ok}
                    aria-describedby={
                      atCapacity || !check.ok ? `starship-fleet-${fleetId}-reason` : undefined
                    }
                    onClick={() => {
                      const result = store.dispatch(command);
                      if (result.accepted)
                        setFeedbackText(starshipText(state.settings.locale, "fleetBuilt"));
                      else setFeedbackText(result.failure?.messageKey ?? "");
                    }}
                  >
                    {starshipText(state.settings.locale, "buildFleetShip")}
                  </button>
                  {(atCapacity || !check.ok) && (
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
      <div className="starship-travel-summary" hidden={view !== "starship"}>
        <h4>{starshipText(state.settings.locale, "destinationSelected")}</h4>
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
                {launchFailureText()}
              </p>
            )}
          </>
        )}
      </div>
      {space.starship.phase === "orbiting" && destination && (
        <section
          className="starship-system-scan"
          data-testid="starship-system-scan"
          hidden={view !== "colonise"}
        >
          <h4>{starshipText(state.settings.locale, "scanSystem")}</h4>
          {!scannerComplete ? (
            <p>{starshipText(state.settings.locale, "scannerRequired")}</p>
          ) : encounter ? (
            <div data-testid="starship-system-scan-results">
              <p>
                {starshipText(
                  state.settings.locale,
                  encounter.lifeDetected ? "lifeDetected" : "noLifeDetected",
                )}
              </p>
              <dl>
                <dt>{starshipText(state.settings.locale, "raceName")}</dt>
                <dd>{encounter.raceName}</dd>
                <dt>{starshipText(state.settings.locale, "civilization")}</dt>
                <dd>{presentSystemToken(encounter.civilizationLevel)}</dd>
                <dt>{starshipText(state.settings.locale, "population")}</dt>
                <dd>{number(state, encounter.populationEstimate)}</dd>
                <dt>{starshipText(state.settings.locale, "threat")}</dt>
                <dd>{presentSystemToken(encounter.threatLevel)}</dd>
                <dt>{starshipText(state.settings.locale, "defense")}</dt>
                <dd>{number(state, encounter.defenseRating)}</dd>
                <dt>{starshipText(state.settings.locale, "attitude")}</dt>
                <dd>{presentSystemToken(encounter.attitude)}</dd>
                <dt>{starshipText(state.settings.locale, "impression")}</dt>
                <dd>
                  {number(state, encounter.initialImpression)} /{" "}
                  {number(state, encounter.currentImpression)}
                </dd>
                <dt>{starshipText(state.settings.locale, "patience")}</dt>
                <dd>{number(state, encounter.patience)}</dd>
                <dt>{starshipText(state.settings.locale, "enemyFleets")}</dt>
                <dd>
                  {number(state, encounter.enemyFleets.air)} /{" "}
                  {number(state, encounter.enemyFleets.land)} /{" "}
                  {number(state, encounter.enemyFleets.sea)}
                </dd>
                <dt>{starshipText(state.settings.locale, "enemyFleetPower")}</dt>
                <dd>{number(state, enemyFleetPower(encounter.enemyFleets))}</dd>
                <dt>{starshipText(state.settings.locale, "lifeformTraits")}</dt>
                <dd>{encounter.lifeformTraits.map(presentSystemToken).join(", ")}</dd>
                <dt>{starshipText(state.settings.locale, "anomalies")}</dt>
                <dd>{encounter.anomalies.map(presentSystemToken).join(", ") || "—"}</dd>
              </dl>
            </div>
          ) : (
            <>
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
              {!scanCheck.ok && (
                <p className="live-feedback" id="starship-scan-reason">
                  {actionReason(state, scanCheck, "scannerRequired")}
                </p>
              )}
            </>
          )}
        </section>
      )}
      {space.starship.phase === "orbiting" && destination && encounter && (
        <section
          className="starship-diplomacy"
          data-testid="starship-diplomacy"
          hidden={view !== "colonise"}
        >
          <h4>{starshipText(state.settings.locale, "diplomacyTitle")}</h4>
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
          <h4>{starshipText(state.settings.locale, "battleTitle")}</h4>
          <p data-testid="starship-battle-status">
            {starshipText(
              state.settings.locale,
              `battle${encounter.battle.phase}` as StarshipMessageKey,
            )}
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
                      `${presentSystemToken(fleetId)}: ${number(state, encounter.battle.enemyHealthPool[fleetId])}`,
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
                if (result.accepted)
                  setFeedbackText(starshipText(state.settings.locale, "settlementComplete"));
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
                  if (result.accepted)
                    setFeedbackText(starshipText(state.settings.locale, "settlementComplete"));
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
        {feedbackText}
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
