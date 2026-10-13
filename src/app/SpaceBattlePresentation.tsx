import { useEffect, useRef } from "react";
import {
  ENEMY_FLEET_IDS,
  PLAYER_FLEET_IDS,
  type EnemyFleetId,
  type PlayerFleetId,
  type StarSystemEncounter,
} from "../content/space";
import { playerFleetUnitStats } from "../engine/fleetMechanics";
import { permanentPerkPurchaseCount } from "../content/economyRules";
import { philosophyRepeatableRank } from "../engine/philosophy";
import type { EngineEvent } from "../engine/commands";
import type { GameState } from "../engine/state";
import type { AudioGameStore } from "./audio";
import { starshipText } from "../i18n/starshipMessages";

type BattleSide = "player" | "enemy";
type BattleFleetId = PlayerFleetId | EnemyFleetId;
type ShipKind = "air" | "land" | "sea";

interface BattleUnit {
  readonly id: string;
  readonly side: BattleSide;
  readonly fleetId: BattleFleetId;
  readonly kind: ShipKind;
  readonly index: number;
  readonly order: number;
  readonly size: number;
  readonly columnNumber: number;
  readonly columnNumberWithinType: number;
  formationY: number;
  hasBeenOnCanvas: boolean;
  readonly speed: number;
  readonly acceleration: number;
  readonly visionDistance: number;
  x: number;
  y: number;
  rotation: number;
  currentSpeed: number;
  movementVector: [number, number];
  health: number;
  sourceHealth: number;
  pendingDeathAtMs: number | null;
  pendingDeathRound: number | null;
  pendingDeathOrder: number | null;
  currentGoalId: string | null;
  huntX: number | null;
  huntY: number | null;
  nextHuntUpdateAt: number;
  disabled: boolean;
}

interface BattleLaser {
  readonly fromId: string;
  readonly toId: string;
  readonly createdAt: number;
  readonly color: string;
}

interface BattleExplosion {
  readonly x: number;
  readonly y: number;
  readonly createdAt: number;
}

interface BattleScene {
  readonly systemId: string;
  readonly units: BattleUnit[];
  readonly lasers: BattleLaser[];
  readonly explosions: BattleExplosion[];
  width: number;
  height: number;
  inFormation: boolean;
  sourceCombatActive: boolean;
  sourceDeathOrder: number;
}

const ENEMY_BASE_SPEED: Readonly<Record<EnemyFleetId, number>> = {
  air: 5,
  land: 2,
  sea: 1,
};

const UNIT_ACCELERATION: Readonly<Record<ShipKind, number>> = {
  air: 0.02,
  land: 0.012,
  sea: 0.006,
};

function kindForFleet(fleetId: BattleFleetId): ShipKind {
  if (fleetId === "scout" || fleetId === "marauder" || fleetId === "air") return "air";
  if (fleetId === "landStalker" || fleetId === "land") return "land";
  return "sea";
}

function unitSize(fleetId: BattleFleetId): number {
  if (fleetId === "marauder") return 6;
  if (kindForFleet(fleetId) === "air") return 4;
  if (kindForFleet(fleetId) === "land") return 8;
  return 12;
}

function fleetIds(side: BattleSide): readonly BattleFleetId[] {
  return side === "player" ? PLAYER_FLEET_IDS : ENEMY_FLEET_IDS;
}

function fleetCount(
  state: GameState,
  encounter: StarSystemEncounter,
  side: BattleSide,
  fleetId: BattleFleetId,
): number {
  return side === "player"
    ? state.run.space.playerFleets[fleetId as PlayerFleetId]
    : encounter.enemyFleets[fleetId as EnemyFleetId];
}

function fleetHealth(encounter: StarSystemEncounter, side: BattleSide, fleetId: BattleFleetId): number {
  return side === "player"
    ? encounter.battle.playerHealthPool[fleetId as PlayerFleetId]
    : encounter.battle.enemyHealthPool[fleetId as EnemyFleetId];
}

function playerAccelerationMultiplier(state: GameState): number {
  if (state.permanent.philosophyId !== "supremacist") return 1;
  const rank =
    permanentPerkPurchaseCount(state.permanent.acquiredPerks, "antimatterEngineMinaturization") +
    philosophyRepeatableRank(state, "antimatterEngineMinaturization");
  return 1.05 ** rank;
}

function unitSpeed(state: GameState, encounter: StarSystemEncounter, side: BattleSide, fleetId: BattleFleetId): number {
  if (side === "player") return playerFleetUnitStats(state, fleetId as PlayerFleetId).speed;
  const base = ENEMY_BASE_SPEED[fleetId as EnemyFleetId];
  return encounter.lifeformTraits.includes("hypercharge") ? base * 2 : base;
}

function unitAcceleration(state: GameState, encounter: StarSystemEncounter, side: BattleSide, kind: ShipKind): number {
  const base = UNIT_ACCELERATION[kind];
  if (side === "enemy" && encounter.lifeformTraits.includes("hypercharge")) return base * 2;
  if (side === "player") return base * playerAccelerationMultiplier(state);
  return base;
}

function createUnits(
  state: GameState,
  encounter: StarSystemEncounter,
  width: number,
  height: number,
): BattleUnit[] {
  const units: BattleUnit[] = [];
  const sourceSideOrder: readonly BattleSide[] = ["enemy", "player"];
  const firstFleet = sourceSideOrder
    .flatMap((side) => fleetIds(side).map((fleetId) => ({ side, fleetId })))
    .find(({ side, fleetId }) => fleetCount(state, encounter, side, fleetId) > 0);
  const initialSize = firstFleet ? unitSize(firstFleet.fleetId) : 4;
  const boundingBox = initialSize + 4 * 2;
  const doubleSpacing = boundingBox * 1.5;
  const columns: Record<BattleSide, Record<string, { x: number; y: number; withinType: number }>> = {
    player: {},
    enemy: {},
  };
  const playerColumnOrder: readonly PlayerFleetId[] = ["scout", "marauder", "landStalker", "navalStrafer"];
  const enemyColumnOrder: readonly EnemyFleetId[] = ["air", "land", "sea"];
  playerColumnOrder.forEach((fleetId, index) => {
    columns.player[fleetId] = { x: boundingBox + index * doubleSpacing, y: boundingBox, withinType: 1 };
  });
  enemyColumnOrder.forEach((fleetId, index) => {
    columns.enemy[fleetId] = {
      x: width - boundingBox - index * doubleSpacing,
      y: boundingBox,
      withinType: 1,
    };
  });
  let order = 0;
  for (const side of sourceSideOrder) {
    fleetIds(side).forEach((fleetId, fleetIndex) => {
      const count = Math.max(0, Math.floor(fleetCount(state, encounter, side, fleetId)));
      const kind = kindForFleet(fleetId);
      const size = unitSize(fleetId);
      const typePosition = columns[side][fleetId]!;
      const healthPerUnit = count > 0 ? fleetHealth(encounter, side, fleetId) / count : 0;
      const speed = unitSpeed(state, encounter, side, fleetId);
      const acceleration = unitAcceleration(state, encounter, side, kind);
      const visionDistance = kind === "air" ? 300 : kind === "land" ? 150 : 200;
      for (let index = 0; index < count; index += 1) {
        const fromLeft = side === "player";
        if (typePosition.y + boundingBox > height) {
          typePosition.y = boundingBox;
          typePosition.x += fromLeft ? doubleSpacing : -doubleSpacing;
          typePosition.withinType += 1;
        }
        const formationX = typePosition.x;
        const initialX = formationX + (fromLeft ? -150 : 150);
        const initialY = typePosition.y;
        typePosition.y += boundingBox;
        units.push({
          id: `${side}:${fleetId}:${index}`,
          side,
          fleetId,
          kind,
          index,
          order: order++,
          size,
          columnNumber: fleetIndex + 1,
          columnNumberWithinType: typePosition.withinType,
          formationY: initialY,
          hasBeenOnCanvas: false,
          speed,
          acceleration,
          visionDistance,
          x: initialX,
          y: initialY,
          rotation: fromLeft ? Math.PI / 2 : -Math.PI / 2,
          currentSpeed: 0,
          movementVector: [0, 0],
          health: healthPerUnit,
          sourceHealth: healthPerUnit,
          pendingDeathAtMs: null,
          pendingDeathRound: null,
          pendingDeathOrder: null,
          currentGoalId: null,
          huntX: null,
          huntY: null,
          nextHuntUpdateAt: 0,
          disabled: false,
        });
      }
    });
  }
  setFormationRows(units, height);
  return units;
}

function setFormationRows(units: BattleUnit[], height: number): void {
  const columns = new Map<string, BattleUnit[]>();
  for (const unit of units) {
    const key = `${unit.side}:${unit.columnNumber}:${unit.columnNumberWithinType}`;
    const group = columns.get(key) ?? [];
    group.push(unit);
    columns.set(key, group);
  }
  const columnHeight = height - 4;
  for (const group of columns.values()) {
    const unitSpacing = columnHeight / (group.length + 1);
    group.forEach((unit, index) => {
      unit.formationY = unitSpacing * (index + 1);
    });
  }
}

function allowedTarget(attacker: BattleUnit, target: BattleUnit): boolean {
  if (attacker.side === "player") {
    if (attacker.fleetId === "scout") return target.kind === "air" || target.kind === "sea";
    if (attacker.fleetId === "marauder") return target.kind === "land" || target.kind === "sea";
    if (attacker.fleetId === "landStalker") return target.kind === "air" || target.kind === "land";
    return target.kind === "sea" || target.kind === "land";
  }
  if (attacker.fleetId === "air") return target.kind === "air" || target.kind === "land";
  if (attacker.fleetId === "land") return target.kind === "air" || target.kind === "sea";
  return target.kind === "sea" || target.kind === "land";
}

function targetFor(unit: BattleUnit, visible: readonly BattleUnit[]): BattleUnit | null {
  const candidates = visible.filter(
    (candidate) => !candidate.disabled && candidate.pendingDeathAtMs === null,
  );
  const eligible = candidates.filter((candidate) => allowedTarget(unit, candidate));
  if (eligible.length === 0) {
    return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)]! : null;
  }
  return eligible.reduce(
    (best, candidate) => (best.sourceHealth < candidate.sourceHealth ? best : candidate),
  );
}

function isVisible(unit: BattleUnit, enemy: BattleUnit): boolean {
  const dx = enemy.x - unit.x;
  const dy = enemy.y - unit.y;
  const distance = Math.hypot(dx, dy);
  if (distance > unit.visionDistance) return false;
  const angleToEnemy = Math.atan2(dy, dx);
  const forwardAngle = unit.rotation - Math.PI / 2;
  return Math.cos(angleToEnemy - forwardAngle) >= 0;
}

function reconcileUnits(
  scene: BattleScene,
  state: GameState,
  encounter: StarSystemEncounter,
  visible: boolean,
  now: number,
): void {
  for (const side of ["player", "enemy"] as const) {
    for (const fleetId of fleetIds(side)) {
      const group = scene.units.filter((unit) => unit.side === side && unit.fleetId === fleetId);
      const active = group.filter((unit) => !unit.disabled);
      const desiredCount = Math.min(active.length, fleetCount(state, encounter, side, fleetId));
      for (const unit of active.slice(desiredCount)) {
        unit.disabled = true;
        unit.currentGoalId = null;
        unit.health = 0;
        if (visible) scene.explosions.push({ x: unit.x, y: unit.y, createdAt: now });
      }
      const healthPerUnit =
        desiredCount > 0 ? fleetHealth(encounter, side, fleetId) / desiredCount : 0;
      for (const unit of active.slice(0, desiredCount)) unit.health = healthPerUnit;
    }
  }
}

function resetSourceCombatHealth(
  scene: BattleScene,
  state: GameState,
  encounter: StarSystemEncounter,
): void {
  for (const side of ["player", "enemy"] as const) {
    for (const fleetId of fleetIds(side)) {
      const active = scene.units.filter(
        (unit) => unit.side === side && unit.fleetId === fleetId && !unit.disabled,
      );
      const activeCount = Math.min(active.length, fleetCount(state, encounter, side, fleetId));
      const healthPerUnit =
        activeCount > 0 ? fleetHealth(encounter, side, fleetId) / activeCount : 0;
      for (const unit of active) {
        unit.sourceHealth = healthPerUnit;
        unit.pendingDeathAtMs = null;
        unit.pendingDeathRound = null;
        unit.pendingDeathOrder = null;
      }
    }
  }
}

function clearUnconfirmedSourceDeaths(
  scene: BattleScene,
  state: GameState,
  encounter: StarSystemEncounter,
): void {
  for (const side of ["player", "enemy"] as const) {
    for (const fleetId of fleetIds(side)) {
      const pending = scene.units.filter(
        (unit) =>
          unit.side === side &&
          unit.fleetId === fleetId &&
          !unit.disabled &&
          unit.pendingDeathAtMs !== null,
      );
      if (pending.length === 0) continue;
      const activeCount = Math.min(
        scene.units.filter(
          (unit) => unit.side === side && unit.fleetId === fleetId && !unit.disabled,
        ).length,
        fleetCount(state, encounter, side, fleetId),
      );
      const healthPerUnit =
        activeCount > 0 ? fleetHealth(encounter, side, fleetId) / activeCount : 0;
      for (const unit of pending) {
        unit.sourceHealth = healthPerUnit;
        unit.pendingDeathAtMs = null;
        unit.pendingDeathRound = null;
        unit.pendingDeathOrder = null;
      }
    }
  }
}

/**
 * Engine death events expose confirmed aggregate counts, not per-unit callback
 * times. Modeled source crossings are used only after count reconciliation;
 * aggregate event receipt timestamps must not be treated as source parity.
 */
type DeathCallbackTiming =
  | { readonly kind: "modeled-source-crossing"; readonly callbackAtMs: number }
  | { readonly kind: "aggregate-event-receipt"; readonly callbackAtMs: number };

function presentConfirmedDeath(
  scene: BattleScene,
  unit: BattleUnit,
  visible: boolean,
  timing: DeathCallbackTiming,
): void {
  unit.health = 0;
  unit.sourceHealth = 0;
  unit.disabled = true;
  unit.currentGoalId = null;
  unit.pendingDeathAtMs = null;
  unit.pendingDeathRound = null;
  unit.pendingDeathOrder = null;
  if (!visible) return;
  scene.explosions.push({ x: unit.x, y: unit.y, createdAt: timing.callbackAtMs });
}

function killConfirmedUnits(
  scene: BattleScene,
  side: BattleSide,
  fleetId: BattleFleetId,
  count: number,
  visible: boolean,
  timings: readonly DeathCallbackTiming[],
): void {
  const units = scene.units
    .filter((unit) => unit.side === side && unit.fleetId === fleetId && !unit.disabled)
    .sort((left, right) => right.order - left.order)
    .slice(0, count);
  for (const [index, unit] of units.entries()) {
    const timing = timings[index];
    if (timing) presentConfirmedDeath(scene, unit, visible, timing);
  }
}

type ConfirmedBattleDeath = Extract<EngineEvent, { readonly type: "space.battle.death" }>;

interface ConfirmedDeathEntry {
  readonly eventIndex: number;
  readonly event: ConfirmedBattleDeath;
}

interface SourceTimedCasualty {
  readonly eventIndex: number;
  readonly event: ConfirmedBattleDeath;
  readonly unit: BattleUnit;
  readonly sourceCrossingAtMs: number;
}

interface SourceTimingBatch {
  readonly casualtiesByEvent: ReadonlyMap<number, readonly SourceTimedCasualty[]>;
}

function sourceTimedCasualtiesForBatch(
  scene: BattleScene,
  entries: readonly ConfirmedDeathEntry[],
): SourceTimingBatch {
  const casualtiesByEvent = new Map<number, SourceTimedCasualty[]>();
  if (entries.length === 0) return { casualtiesByEvent };
  const eventGroups = new Map<string, ConfirmedDeathEntry[]>();
  const roundSet = new Set<number>();
  for (const entry of entries) {
    const { event } = entry;
    const key = `${event.round}:${event.side}:${event.fleetId}`;
    const group = eventGroups.get(key) ?? [];
    group.push(entry);
    eventGroups.set(key, group);
    roundSet.add(event.round);
  }

  const pendingGroups = new Map<string, BattleUnit[]>();
  for (const unit of scene.units) {
    if (
      unit.disabled ||
      unit.pendingDeathAtMs === null ||
      unit.pendingDeathRound === null ||
      !roundSet.has(unit.pendingDeathRound)
    ) {
      continue;
    }
    const key = `${unit.pendingDeathRound}:${unit.side}:${unit.fleetId}`;
    const group = pendingGroups.get(key) ?? [];
    group.push(unit);
    pendingGroups.set(key, group);
  }

  const sourceMatchedGroups = new Set<string>();
  for (const key of new Set([...eventGroups.keys(), ...pendingGroups.keys()])) {
    const confirmedCount = (eventGroups.get(key) ?? []).reduce(
      (total, entry) => total + entry.event.confirmedDeathCount,
      0,
    );
    if ((pendingGroups.get(key) ?? []).length === confirmedCount) {
      sourceMatchedGroups.add(key);
    }
  }

  for (const [key, group] of eventGroups) {
    if (!sourceMatchedGroups.has(key)) continue;
    const pending = (pendingGroups.get(key) ?? []).sort(
      (left, right) =>
        left.pendingDeathAtMs! - right.pendingDeathAtMs! ||
        left.pendingDeathOrder! - right.pendingDeathOrder!,
    );
    const casualties: SourceTimedCasualty[] = [];
    let offset = 0;
    for (const entry of group) {
      const confirmedDeathCount = entry.event.confirmedDeathCount;
      for (const unit of pending.slice(offset, offset + confirmedDeathCount)) {
        casualties.push({
          eventIndex: entry.eventIndex,
          event: entry.event,
          unit,
          sourceCrossingAtMs: unit.pendingDeathAtMs!,
        });
      }
      offset += confirmedDeathCount;
    }
    for (const entry of group) {
      casualtiesByEvent.set(
        entry.eventIndex,
        casualties.filter((casualty) => casualty.eventIndex === entry.eventIndex),
      );
    }
  }
  return { casualtiesByEvent };
}

function resizeCanvas(canvas: HTMLCanvasElement, scene: BattleScene): void {
  const rect = canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;
  const width = rect.width;
  const height = rect.height;
  if (width === scene.width && height === scene.height) return;
  const oldWidth = scene.width;
  const oldHeight = scene.height;
  scene.width = width;
  scene.height = height;
  if (oldWidth > 0 && oldHeight > 0) {
    const scaleX = width / oldWidth;
    const scaleY = height / oldHeight;
    for (const unit of scene.units) {
      unit.x *= scaleX;
      unit.y *= scaleY;
      if (unit.huntX !== null) unit.huntX *= scaleX;
      if (unit.huntY !== null) unit.huntY *= scaleY;
    }
  }
  setFormationRows(scene.units, height);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.ceil(width * pixelRatio);
  canvas.height = Math.ceil(height * pixelRatio);
  const context = canvas.getContext("2d");
  context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function visibleTargets(unit: BattleUnit, enemies: readonly BattleUnit[]): BattleUnit[] {
  const result: BattleUnit[] = [];
  for (const enemy of enemies) {
    if (!enemy.disabled && enemy.pendingDeathAtMs === null && isVisible(unit, enemy)) {
      result.push(enemy);
    }
  }
  return result;
}

function updateUnit(
  unit: BattleUnit,
  scene: BattleScene,
): void {
  if (unit.x < 0) unit.x = 10;
  else if (unit.x > scene.width) unit.x = scene.width - 10;
  if (unit.y < 0) unit.y = 10;
  else if (unit.y > scene.height) unit.y = scene.height - 10;

  let movementVector: [number, number] = [0, 0];
  if (unit.currentGoalId === "hunt") {
    const dx = (unit.huntX ?? unit.x) - unit.x;
    const dy = (unit.huntY ?? unit.y) - unit.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 20) {
      movementVector = [(dx / distance) * 100, (dy / distance) * 100];
      unit.movementVector = movementVector;
      unit.rotation = Math.atan2(dy, dx);
    } else {
      unit.huntX = null;
      unit.huntY = null;
      unit.currentGoalId = null;
      movementVector = unit.movementVector;
    }
  } else {
    const target = unit.currentGoalId
      ? scene.units.find((candidate) => candidate.id === unit.currentGoalId) ?? null
      : null;
    if (!target && !scene.inFormation) {
      movementVector = unit.side === "player" ? [100, 0] : [-100, 0];
    } else if (target) {
      const dx = target.x - unit.x;
      const dy = target.y - unit.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 8) {
        if (unit.rotation + Math.PI <= Math.PI * 2) unit.rotation += Math.PI;
        else unit.rotation -= Math.PI;
        unit.currentSpeed = -unit.currentSpeed;
        movementVector = unit.movementVector;
      } else {
        const movementFactor = Math.min(distance / unit.currentSpeed, 1);
        movementVector = [
          (dx / distance) * movementFactor * 100,
          (dy / distance) * movementFactor * 100,
        ];
      }
    }
  }

  unit.currentSpeed = Math.min(unit.speed, unit.currentSpeed + unit.acceleration);
  const horizontalFactor = movementVector[0] / 100;
  const verticalFactor = movementVector[1] / 100;
  let horizontalSpeed = Math.max(-unit.speed, Math.min(unit.speed, unit.currentSpeed * horizontalFactor));
  let verticalSpeed = Math.max(-unit.speed, Math.min(unit.speed, unit.currentSpeed * verticalFactor));
  horizontalSpeed = movementVector[0] < 0 ? -Math.abs(horizontalSpeed) : Math.abs(horizontalSpeed);
  verticalSpeed = movementVector[1] < 0 ? -Math.abs(verticalSpeed) : Math.abs(verticalSpeed);
  unit.x += Math.max(-unit.speed, Math.min(unit.speed, horizontalSpeed));
  unit.y += Math.max(-unit.speed, Math.min(unit.speed, verticalSpeed));
  unit.movementVector = movementVector;
  unit.rotation = Math.atan2(movementVector[1], movementVector[0]) + Math.PI / 2;
}

function assignTargetsAndFire(
  scene: BattleScene,
  store: AudioGameStore,
  encounter: StarSystemEncounter,
  now: number,
): void {
  const attackAnomalyModifier = encounter.anomalies.reduce((sum, anomaly) => {
    if (anomaly === "plasmaInstability") return sum + 15;
    if (anomaly === "energyDampeningField") return sum - 15;
    return sum;
  }, 0);
  const playerDamage = Math.max(0, 0.2 - 0.001 * encounter.defenseRating) *
    (1 + attackAnomalyModifier / 100);
  for (const side of ["player", "enemy"] as const) {
    const own = scene.units.filter(
      (unit) => unit.side === side && !unit.disabled && unit.pendingDeathAtMs === null,
    );
    const enemies = scene.units
      .filter(
        (unit) =>
          unit.side !== side && !unit.disabled && unit.pendingDeathAtMs === null,
      )
      .sort((left, right) => left.order - right.order);
    for (const unit of own) {
      const visible = visibleTargets(unit, enemies);
      for (const candidate of visible) {
        const shotRoll = Math.random();
        if (shotRoll > 0.2 || candidate.id !== unit.currentGoalId) continue;
        store.playBattleLaserCandidate();
        scene.lasers.push({
          fromId: unit.id,
          toId: candidate.id,
          createdAt: now,
          color:
            unit.kind === "air" ? "#ed4bd5" : unit.kind === "sea" ? "#40e0d0" : "#f4d34e",
        });
      }
      const existingGoalId = unit.currentGoalId;
      const goalStillVisible = visible.some((candidate) => candidate.id === existingGoalId);
      if (goalStillVisible) {
        const target = visible.find((candidate) => candidate.id === existingGoalId)!;
        const damage = target.side === "enemy" ? playerDamage : 0.1;
        target.sourceHealth -= damage;
        if (
          unit.side === "enemy" &&
          encounter.lifeformTraits.includes("powerSiphon") &&
          damage > 0
        ) {
          // Cosmic Forge restores 25% of each confirmed per-frame enemy hit,
          // with a hard-coded 100 health ceiling for the attacking unit.
          unit.sourceHealth = Math.min(100, unit.sourceHealth + damage * 0.25);
        }
        if (target.sourceHealth <= 0 && target.pendingDeathAtMs === null) {
          const sourceDeathAtMs = performance.now();
          target.pendingDeathAtMs = sourceDeathAtMs;
          target.pendingDeathRound = encounter.battle.round + 1;
          target.pendingDeathOrder = scene.sourceDeathOrder;
          scene.sourceDeathOrder += 1;
          store.playBattleExplosionCandidate(sourceDeathAtMs);
          unit.currentGoalId = null;
          unit.huntX = null;
          unit.huntY = null;
          continue;
        }
        unit.huntX = null;
        unit.huntY = null;
      } else if (existingGoalId === "hunt") {
        const newTarget = targetFor(unit, visible);
        if (newTarget) {
          unit.currentGoalId = newTarget.id;
          unit.huntX = null;
          unit.huntY = null;
        }
      } else if (existingGoalId === null) {
        const newTarget = targetFor(unit, visible);
        if (newTarget) {
          unit.currentGoalId = newTarget.id;
        } else {
          unit.currentGoalId = "hunt";
          unit.huntX = Math.floor(Math.random() * Math.max(1, scene.width - 20)) + 10;
          unit.huntY = Math.floor(Math.random() * Math.max(1, scene.height - 20)) + 10;
        }
      } else {
        unit.currentGoalId = "hunt";
        unit.huntX = Math.floor(Math.random() * Math.max(1, scene.width - 20)) + 10;
        unit.huntY = Math.floor(Math.random() * Math.max(1, scene.height - 20)) + 10;
        unit.nextHuntUpdateAt = now + 900 + Math.random() * 900;
      }
    }
  }
}

function moveUnitsWithCurrentGoals(scene: BattleScene): void {
  for (const side of ["player", "enemy"] as const) {
    for (const unit of scene.units) {
      if (
        unit.side === side &&
        !unit.disabled &&
        unit.pendingDeathAtMs === null &&
        unit.hasBeenOnCanvas
      ) {
        updateUnit(unit, scene);
      }
    }
  }
}

function moveIntoSourceFormation(scene: BattleScene): void {
  const playerUnits = scene.units.filter((unit) => unit.side === "player");
  const enemyUnits = scene.units.filter((unit) => unit.side === "enemy");
  const lowestPlayerColumn = Math.min(...playerUnits.map((unit) => unit.columnNumber));
  const lowestPlayerWithinType = Math.min(
    ...playerUnits
      .filter((unit) => unit.columnNumber === lowestPlayerColumn)
      .map((unit) => unit.columnNumberWithinType),
  );
  const highestEnemyColumn = Math.max(...enemyUnits.map((unit) => unit.columnNumber));
  const highestEnemyWithinType = Math.max(
    ...enemyUnits
      .filter((unit) => unit.columnNumber === highestEnemyColumn)
      .map((unit) => unit.columnNumberWithinType),
  );
  const lastPlayerUnits = playerUnits.filter(
    (unit) => unit.columnNumber === lowestPlayerColumn && unit.columnNumberWithinType === lowestPlayerWithinType,
  );
  const lastEnemyUnits = enemyUnits.filter(
    (unit) => unit.columnNumber === highestEnemyColumn && unit.columnNumberWithinType === highestEnemyWithinType,
  );
  const playerOnScreen = lastPlayerUnits.some((unit) => unit.x >= 10);
  const enemyOnScreen = lastEnemyUnits.some((unit) => unit.x <= scene.width - 10);
  if (scene.inFormation || (playerOnScreen && enemyOnScreen)) {
    scene.inFormation = true;
    return;
  }
  for (const unit of playerUnits) {
    if (!unit.hasBeenOnCanvas && unit.x > 3 && unit.y >= 0) unit.hasBeenOnCanvas = true;
    unit.x += 1;
    unit.y = unit.formationY;
  }
  for (const unit of enemyUnits) {
    if (!unit.hasBeenOnCanvas && unit.x + unit.size < scene.width + 1 && unit.y >= 0) {
      unit.hasBeenOnCanvas = true;
    }
    unit.x -= 1;
    unit.y = unit.formationY;
  }
}

function drawScene(canvas: HTMLCanvasElement, scene: BattleScene, now: number): void {
  const context = canvas.getContext("2d");
  if (!context || scene.width <= 0 || scene.height <= 0) return;
  const width = scene.width;
  const height = scene.height;
  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "rgba(4, 12, 28, 0.96)");
  background.addColorStop(1, "rgba(12, 24, 42, 0.98)");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);
  for (let index = 0; index < 46; index += 1) {
    const x = ((index * 97 + 29) % 997) / 997 * width;
    const y = ((index * 61 + 13) % 509) / 509 * height;
    context.fillStyle = `rgba(220, 235, 255, ${0.18 + (index % 4) * 0.08})`;
    context.fillRect(x, y, index % 9 === 0 ? 2 : 1, index % 9 === 0 ? 2 : 1);
  }
  const style = getComputedStyle(canvas);
  const playerColor = style.getPropertyValue("--ready-text").trim() || "#79e39a";
  for (const unit of scene.units) {
    if (unit.disabled || unit.x < -16 || unit.x > width + 16 || unit.y < -16 || unit.y > height + 16) continue;
    context.save();
    context.translate(unit.x, unit.y);
    context.rotate(unit.rotation - Math.PI / 2);
    context.fillStyle = unit.side === "player" ? playerColor : "#e77986";
    context.strokeStyle = unit.side === "player" ? "rgba(210,255,220,.72)" : "rgba(255,225,230,.72)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(unit.size, 0);
    context.lineTo(-unit.size * 0.65, unit.size * 0.62);
    context.lineTo(-unit.size * 0.3, 0);
    context.lineTo(-unit.size * 0.65, -unit.size * 0.62);
    context.closePath();
    context.fill();
    context.stroke();
    context.restore();
  }
  for (let index = scene.lasers.length - 1; index >= 0; index -= 1) {
    if (now - scene.lasers[index]!.createdAt >= 125) scene.lasers.splice(index, 1);
  }
  for (const laser of scene.lasers) {
    const source = scene.units.find((unit) => unit.id === laser.fromId);
    const target = scene.units.find((unit) => unit.id === laser.toId);
    if (!source || !target) continue;
    context.globalAlpha = Math.max(0, 1 - (now - laser.createdAt) / 125);
    context.strokeStyle = laser.color;
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(source.x, source.y);
    context.lineTo(target.x, target.y);
    context.stroke();
  }
  context.globalAlpha = 1;
  for (let index = scene.explosions.length - 1; index >= 0; index -= 1) {
    if (now - scene.explosions[index]!.createdAt >= 550) scene.explosions.splice(index, 1);
  }
  for (const explosion of scene.explosions) {
    const age = now - explosion.createdAt;
    const progress = age / 550;
    const radius = 4 + progress * 28;
    context.globalAlpha = 1 - progress;
    context.strokeStyle = "#ffd59b";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2);
    context.stroke();
  }
  context.globalAlpha = 1;
}

export function SpaceBattlePresentation({
  state,
  store,
  encounter,
}: {
  readonly state: GameState;
  readonly store: AudioGameStore;
  readonly encounter: StarSystemEncounter;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<BattleScene | null>(null);
  const stateRef = useRef(state);
  const storeRef = useRef(store);
  stateRef.current = state;
  storeRef.current = store;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const initialEncounter = stateRef.current.run.space.systemEncounters.find(
      (candidate) => candidate.systemId === encounter.systemId,
    );
    if (!initialEncounter) return;
    const initialWidth = canvas.clientWidth || 960;
    const initialHeight = canvas.clientHeight || 240;
    const scene: BattleScene = {
      systemId: encounter.systemId,
      units: createUnits(stateRef.current, initialEncounter, initialWidth, initialHeight),
      lasers: [],
      explosions: [],
      width: initialWidth,
      height: initialHeight,
      inFormation: false,
      sourceCombatActive: false,
      sourceDeathOrder: 0,
    };
    sceneRef.current = scene;

    const unsubscribe = store.subscribeEvents((events) => {
      const currentScene = sceneRef.current;
      const currentCanvas = canvasRef.current;
      if (!currentScene || !currentCanvas) return;
      const eventReceivedAtMs = performance.now();
      const rect = currentCanvas.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0;
      const latestState = store.getState();
      const latestEncounter = latestState.run.space.systemEncounters.find(
        (candidate) => candidate.systemId === currentScene.systemId,
      );
      const battleIsActive = latestEncounter?.battle.phase === "inProgress";
      const terminalEventIndex = events.findIndex(
        (event) => event.type === "space.battle.finished" && event.systemId === currentScene.systemId,
      );
      const confirmedDeathEntries: ConfirmedDeathEntry[] = [];
      for (let eventIndex = 0; eventIndex < events.length; eventIndex += 1) {
        const event = events[eventIndex]!;
        if (event.type !== "space.battle.death" || event.systemId !== currentScene.systemId) {
          continue;
        }
        const precedesTerminal = terminalEventIndex > eventIndex;
        if (
          (terminalEventIndex >= 0 && !precedesTerminal) ||
          (!battleIsActive && !precedesTerminal) ||
          !visible
        ) {
          continue;
        }
        confirmedDeathEntries.push({ eventIndex, event });
      }
      const sourceTimingBatch = visible
        ? sourceTimedCasualtiesForBatch(currentScene, confirmedDeathEntries)
        : {
            casualtiesByEvent: new Map<number, readonly SourceTimedCasualty[]>(),
          };
      // Sidecar timings are source-shaped, not engine-authored. Match confirmed
      // casualties by per-round/per-fleet counts before emitting their audio cues.
      const sourceTimedActions = [...sourceTimingBatch.casualtiesByEvent.values()]
        .flat()
        .sort(
          (left, right) =>
            left.sourceCrossingAtMs - right.sourceCrossingAtMs ||
            left.unit.pendingDeathOrder! - right.unit.pendingDeathOrder!,
        );
      const fallbackVisuals: {
        readonly entry: ConfirmedDeathEntry;
        readonly count: number;
        readonly timings: readonly DeathCallbackTiming[];
      }[] = [];
      for (const entry of confirmedDeathEntries) {
        const sourceCasualties = sourceTimingBatch.casualtiesByEvent.get(entry.eventIndex) ?? [];
        const missingCount = Math.max(
          0,
          entry.event.confirmedDeathCount - sourceCasualties.length,
        );
        if (missingCount === 0) continue;
        const timings = Array.from({ length: missingCount }, () => ({
          kind: "aggregate-event-receipt" as const,
          callbackAtMs: eventReceivedAtMs,
        }));
        fallbackVisuals.push({ entry, count: missingCount, timings });
      }
      for (const casualty of sourceTimedActions) {
        presentConfirmedDeath(currentScene, casualty.unit, true, {
          kind: "modeled-source-crossing",
          callbackAtMs: casualty.sourceCrossingAtMs,
        });
      }
      for (const fallback of fallbackVisuals) {
        killConfirmedUnits(
          currentScene,
          fallback.entry.event.side,
          fallback.entry.event.fleetId,
          fallback.count,
          true,
          fallback.timings,
        );
      }
      if (latestEncounter) {
        for (const event of events) {
          if (
            event.systemId === currentScene.systemId &&
            (event.type === "space.battle.round" || event.type === "space.battle.finished")
          ) {
            clearUnconfirmedSourceDeaths(currentScene, latestState, latestEncounter);
          }
        }
      }
    });

    let animationFrame = 0;
    const animate = (now: number) => {
      const currentScene = sceneRef.current;
      const currentCanvas = canvasRef.current;
      if (!currentScene || !currentCanvas) return;
      resizeCanvas(currentCanvas, currentScene);
      const rect = currentCanvas.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0;
      const latestState = storeRef.current.getState();
      const latestEncounter = latestState.run.space.systemEncounters.find(
        (candidate) => candidate.systemId === currentScene.systemId,
      );
      if (!latestEncounter) return;
      const sourceCombatActive = latestEncounter.battle.phase === "inProgress";
      const enteredSourceCombat = sourceCombatActive && !currentScene.sourceCombatActive;
      currentScene.sourceCombatActive = sourceCombatActive;
      reconcileUnits(currentScene, latestState, latestEncounter, visible, now);
      if (enteredSourceCombat) {
        resetSourceCombatHealth(currentScene, latestState, latestEncounter);
      }
      if (visible) {
        if (latestEncounter.battle.phase === "inProgress") {
          moveUnitsWithCurrentGoals(currentScene);
          assignTargetsAndFire(currentScene, storeRef.current, latestEncounter, now);
        } else if (latestEncounter.warMode && latestEncounter.battle.phase === "idle") {
          moveIntoSourceFormation(currentScene);
        }
        drawScene(currentCanvas, currentScene, now);
      }
      animationFrame = window.requestAnimationFrame(animate);
    };
    animationFrame = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      unsubscribe();
      if (sceneRef.current === scene) sceneRef.current = null;
    };
  }, [encounter.systemId, store]);

  return (
    <canvas
      ref={canvasRef}
      className="starship-battle-canvas"
      data-testid="starship-battle-canvas"
      role="img"
      aria-label={starshipText(state.settings.locale, "battleTitle")}
    />
  );
}
