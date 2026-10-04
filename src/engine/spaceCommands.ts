import type { EconomicGoodId, SystemId } from "../content/ids";
import type {
  DiplomacyChoice,
  PlayerFleetId,
  RocketId,
  SpaceWeatherCondition,
  StarDiplomacyOutcome,
  TelescopeMode,
  TelescopeSurvey,
  StarshipModuleId,
} from "../content/space";
import type { MegastructureId } from "../content/technology";

export type SpaceCommand =
  | { readonly type: "space.telescope.build" }
  | { readonly type: "space.asteroid.select"; readonly asteroidId: string | null }
  | { readonly type: "space.launch-pad.build" }
  | { readonly type: "space.rocket.part.build"; readonly rocketId: RocketId }
  | { readonly type: "space.starship.module.build"; readonly moduleId: StarshipModuleId }
  | {
      readonly type: "space.starship.destination.select";
      readonly systemId: SystemId | null;
    }
  | { readonly type: "space.starship.launch" }
  | { readonly type: "space.starship.system.scan" }
  | { readonly type: "space.envoy.build" }
  | { readonly type: "space.fleet.build"; readonly fleetId: PlayerFleetId }
  | { readonly type: "space.diplomacy.choose"; readonly choice: DiplomacyChoice }
  | { readonly type: "space.diplomacy.enter-war" }
  | { readonly type: "space.battle.engage" }
  | { readonly type: "space.system.settle" }
  | { readonly type: "space.starship.travel.warp" }
  | { readonly type: "space.rocket.rename"; readonly rocketId: RocketId; readonly name: string }
  | { readonly type: "space.rocket.pump.purchase"; readonly rocketId: RocketId }
  | { readonly type: "space.rocket.launch"; readonly rocketId: RocketId }
  | { readonly type: "space.antimatter-boost.set-active"; readonly active: boolean }
  | {
      readonly type: "space.weather.set-condition";
      readonly condition: SpaceWeatherCondition;
    }
  | {
      readonly type: "space.rocket.travel";
      readonly rocketId: RocketId;
      readonly asteroidId: string;
    }
  | {
      readonly type: "space.rocket.pump.set-enabled";
      readonly rocketId: RocketId;
      readonly enabled: boolean;
    }
  | { readonly type: "space.telescope.scan.start" }
  | { readonly type: "space.telescope.study.start" }
  | { readonly type: "space.telescope.pillage.start" }
  | { readonly type: "space.telescope.auto.set-enabled"; readonly enabled: boolean }
  | { readonly type: "space.telescope.auto.set-mode"; readonly mode: TelescopeMode };

export type SpaceCommandFailure =
  | {
      readonly code: "space-technology-locked";
      readonly messageKey: "space.reason.technology-locked";
    }
  | {
      readonly code: "space-telescope-required";
      readonly messageKey: "space.reason.telescope-required";
    }
  | { readonly code: "space-telescope-built"; readonly messageKey: "space.reason.telescope-built" }
  | { readonly code: "space-survey-active"; readonly messageKey: "space.reason.survey-active" }
  | { readonly code: "space-no-power"; readonly messageKey: "space.reason.no-power" }
  | {
      readonly code: "space-automation-locked";
      readonly messageKey: "space.reason.automation-locked";
    }
  | {
      readonly code: "space-automation-unavailable";
      readonly messageKey: "space.reason.automation-unavailable";
    }
  | { readonly code: "space-invalid-mode"; readonly messageKey: "space.reason.invalid-mode" }
  | { readonly code: "space-pillage-locked"; readonly messageKey: "space.reason.pillage-locked" }
  | {
      readonly code: "space-invalid-selection";
      readonly messageKey: "space.reason.invalid-selection";
    }
  | {
      readonly code: "space-launch-pad-built";
      readonly messageKey: "space.reason.launch-pad-built";
    }
  | {
      readonly code: "space-launch-pad-tech-locked";
      readonly messageKey: "space.reason.launch-pad-tech-locked";
    }
  | {
      readonly code: "space-launch-pad-required";
      readonly messageKey: "space.reason.launch-pad-required";
    }
  | { readonly code: "space-rocket-complete"; readonly messageKey: "space.reason.rocket-complete" }
  | {
      readonly code: "space-rocket-incomplete";
      readonly messageKey: "space.reason.rocket-incomplete";
    }
  | {
      readonly code: "space-fuel-tech-locked";
      readonly messageKey: "space.reason.fuel-tech-locked";
    }
  | {
      readonly code: "space-fuel-pump-purchased";
      readonly messageKey: "space.reason.fuel-pump-purchased";
    }
  | {
      readonly code: "space-fuel-pump-required";
      readonly messageKey: "space.reason.fuel-pump-required";
    }
  | { readonly code: "space-rocket-active"; readonly messageKey: "space.reason.rocket-active" }
  | { readonly code: "space-invalid-rocket"; readonly messageKey: "space.reason.invalid-rocket" }
  | {
      readonly code: "space-invalid-rocket-name";
      readonly messageKey: "space.reason.invalid-rocket-name";
    }
  | {
      readonly code: "space-rocket-fuel-full";
      readonly messageKey: "space.reason.rocket-fuel-full";
    }
  | {
      readonly code: "space-rocket-fuel-empty";
      readonly messageKey: "space.reason.rocket-fuel-empty";
    }
  | {
      readonly code: "space-rocket-not-orbiting";
      readonly messageKey: "space.reason.rocket-not-orbiting";
    }
  | {
      readonly code: "space-asteroid-unavailable";
      readonly messageKey: "space.reason.asteroid-unavailable";
    }
  | { readonly code: "space-no-grid"; readonly messageKey: "space.reason.no-grid" }
  | { readonly code: "space-weather-blocked"; readonly messageKey: "space.reason.weather-blocked" }
  | { readonly code: "space-invalid-weather"; readonly messageKey: "space.reason.invalid-weather" }
  | {
      readonly code: "space-invalid-starship-module";
      readonly messageKey: "space.reason.invalid-starship-module";
    }
  | {
      readonly code: "space-starship-module-locked";
      readonly messageKey: "space.reason.starship-module-locked";
    }
  | {
      readonly code: "space-starship-module-complete";
      readonly messageKey: "space.reason.starship-module-complete";
    }
  | {
      readonly code: "space-starship-incomplete";
      readonly messageKey: "space.reason.starship-incomplete";
    }
  | {
      readonly code: "space-starship-already-launched";
      readonly messageKey: "space.reason.starship-already-launched";
    }
  | {
      readonly code: "space-starship-destination-invalid";
      readonly messageKey: "space.reason.starship-destination-invalid";
    }
  | {
      readonly code: "space-starship-ftl-required";
      readonly messageKey: "space.reason.starship-ftl-required";
    }
  | {
      readonly code: "space-envoy-module-required";
      readonly messageKey: "space.reason.envoy-module-required";
    }
  | { readonly code: "space-envoy-built"; readonly messageKey: "space.reason.envoy-built" }
  | {
      readonly code: "space-fleet-hangar-required";
      readonly messageKey: "space.reason.fleet-hangar-required";
    }
  | { readonly code: "space-invalid-fleet"; readonly messageKey: "space.reason.invalid-fleet" }
  | {
      readonly code: "space-fleet-at-capacity";
      readonly messageKey: "space.reason.fleet-at-capacity";
    }
  | {
      readonly code: "space-diplomacy-unavailable";
      readonly messageKey: "space.reason.diplomacy-unavailable";
    };

export type SpaceEvent =
  | { readonly type: "space.telescope.built" }
  | { readonly type: "space.asteroid.selected"; readonly asteroidId: string | null }
  | { readonly type: "space.launch-pad.built" }
  | {
      readonly type: "space.rocket.part.built";
      readonly rocketId: RocketId;
      readonly builtParts: number;
    }
  | {
      readonly type: "space.starship.module.part.built";
      readonly moduleId: StarshipModuleId;
      readonly builtParts: number;
    }
  | {
      readonly type: "space.starship.destination.selected";
      readonly systemId: SystemId | null;
    }
  | {
      readonly type: "space.starship.launched";
      readonly systemId: SystemId;
      readonly durationMs: number;
      readonly antimatterSpent: number;
    }
  | { readonly type: "space.starship.arrived"; readonly systemId: SystemId }
  | { readonly type: "space.starship.system.scanned"; readonly systemId: SystemId }
  | { readonly type: "space.envoy.built" }
  | {
      readonly type: "space.fleet.built";
      readonly fleetId: PlayerFleetId;
      readonly quantity: number;
    }
  | {
      readonly type: "space.diplomacy.resolved";
      readonly systemId: SystemId;
      readonly choice: DiplomacyChoice;
      readonly outcome: StarDiplomacyOutcome;
    }
  | { readonly type: "space.diplomacy.war-entered"; readonly systemId: SystemId }
  | { readonly type: "space.battle.started"; readonly systemId: SystemId }
  | { readonly type: "space.battle.round"; readonly systemId: SystemId; readonly round: number }
  | {
      readonly type: "space.battle.finished";
      readonly systemId: SystemId;
      readonly result: "victory" | "defeat";
      readonly scannerBuilt: boolean;
    }
  | {
      readonly type: "space.system.settled";
      readonly systemId: SystemId;
      readonly ascendencyPoints: number;
      readonly oTypePlantId?: "powerPlant1" | "powerPlant2" | "powerPlant3";
    }
  | {
      readonly type: "space.manuscript.reported";
      readonly manuscriptSystemId: SystemId;
      readonly factorySystemId: SystemId;
      readonly megastructureId: MegastructureId;
    }
  | { readonly type: "space.miaplacidus.story-ready" }
  | {
      readonly type: "space.starship.travel.shortened";
      readonly systemId: SystemId;
      readonly remainingMs: number;
    }
  | { readonly type: "space.rocket.renamed"; readonly rocketId: RocketId; readonly name: string }
  | { readonly type: "space.rocket.pump.purchased"; readonly rocketId: RocketId }
  | { readonly type: "space.rocket.launched"; readonly rocketId: RocketId }
  | { readonly type: "space.antimatter-boost.changed"; readonly active: boolean }
  | { readonly type: "space.weather.changed"; readonly condition: SpaceWeatherCondition }
  | {
      readonly type: "space.rocket.travel-started";
      readonly rocketId: RocketId;
      readonly asteroidId: string;
      readonly direction: "outbound" | "returning";
    }
  | {
      readonly type: "space.rocket.arrived";
      readonly rocketId: RocketId;
      readonly asteroidId: string;
    }
  | {
      readonly type: "space.rocket.returned";
      readonly rocketId: RocketId;
      readonly asteroidId: string;
    }
  | {
      readonly type: "space.asteroid.mined";
      readonly rocketId: RocketId;
      readonly asteroidId: string;
      readonly amount: number;
    }
  | {
      readonly type: "space.rocket.pump.changed";
      readonly rocketId: RocketId;
      readonly enabled: boolean;
    }
  | { readonly type: "space.survey.started"; readonly survey: TelescopeSurvey }
  | { readonly type: "space.survey.blocked-for-power"; readonly survey: TelescopeSurvey }
  | { readonly type: "space.asteroid.scan-missed" }
  | {
      readonly type: "space.asteroid.discovered";
      readonly asteroidId: string;
      readonly name: string;
    }
  | { readonly type: "space.stars.studied"; readonly range: number }
  | {
      readonly type: "black-hole.discovery-checked";
      readonly probability: number;
      readonly discovered: boolean;
    }
  | {
      readonly type: "space.void-pillage.completed";
      readonly gains: Readonly<Partial<Record<EconomicGoodId, number>>>;
    }
  | { readonly type: "space.auto-telescope.changed"; readonly enabled: boolean };

export function isSpaceCommand(command: { readonly type: string }): command is SpaceCommand {
  return (
    command.type === "space.telescope.build" ||
    command.type === "space.asteroid.select" ||
    command.type === "space.launch-pad.build" ||
    command.type === "space.rocket.part.build" ||
    command.type === "space.starship.module.build" ||
    command.type === "space.starship.destination.select" ||
    command.type === "space.starship.launch" ||
    command.type === "space.starship.system.scan" ||
    command.type === "space.envoy.build" ||
    command.type === "space.fleet.build" ||
    command.type === "space.diplomacy.choose" ||
    command.type === "space.diplomacy.enter-war" ||
    command.type === "space.battle.engage" ||
    command.type === "space.system.settle" ||
    command.type === "space.starship.travel.warp" ||
    command.type === "space.rocket.rename" ||
    command.type === "space.rocket.pump.purchase" ||
    command.type === "space.rocket.launch" ||
    command.type === "space.antimatter-boost.set-active" ||
    command.type === "space.weather.set-condition" ||
    command.type === "space.rocket.travel" ||
    command.type === "space.rocket.pump.set-enabled" ||
    command.type === "space.telescope.scan.start" ||
    command.type === "space.telescope.study.start" ||
    command.type === "space.telescope.pillage.start" ||
    command.type === "space.telescope.auto.set-enabled" ||
    command.type === "space.telescope.auto.set-mode"
  );
}
