import { createInitialGameState, isValidGameState, type GameState } from "./state";
import { transition, type EngineResult, type GameCommand } from "./commands";
import { selectGameSnapshot, type GameSnapshot } from "./selectors";
import type { ClockSource } from "./clock";

export interface GameStoreOptions {
  readonly clock: ClockSource;
  readonly publishIntervalMs?: number;
  readonly onListenerError?: (error: unknown) => void;
}

export interface GameStore {
  getState(): GameState;
  getSnapshot(): GameSnapshot;
  subscribe(listener: () => void): () => void;
  dispatch(command: GameCommand): EngineResult;
  publishIfDue(): boolean;
  recover(): void;
}

function readClock(clock: ClockSource, fallback: number): number {
  try {
    const now = clock.now();
    return Number.isFinite(now) && now >= 0 ? now : fallback;
  } catch {
    return fallback;
  }
}

/** Framework-free store adapter. Clock ticks can update the model every frame while snapshots publish at most 4 Hz. */
export function createGameStore(initialState: GameState, options: GameStoreOptions): GameStore {
  const publishIntervalMs = options.publishIntervalMs ?? 250;
  if (!Number.isFinite(publishIntervalMs) || publishIntervalMs <= 0) {
    throw new RangeError("Snapshot publish interval must be positive and finite.");
  }
  let state = isValidGameState(initialState) ? initialState : createInitialGameState();
  let lastGoodState = state;
  let snapshot = selectGameSnapshot(state);
  let lastPublishedAt = readClock(options.clock, 0);
  let dirty = false;
  const listeners = new Set<() => void>();

  function publish(nowMs: number): void {
    if (!dirty) return;
    snapshot = selectGameSnapshot(state);
    lastPublishedAt = nowMs;
    dirty = false;
    for (const listener of listeners) {
      try {
        listener();
      } catch (error) {
        try {
          options.onListenerError?.(error);
        } catch {
          // A reporting adapter must not interrupt snapshot publication.
        }
      }
    }
  }

  return {
    getState: () => state,
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispatch(command) {
      const result = transition(state, command);
      if (!result.accepted) return result;
      state = result.state;
      lastGoodState = state;
      dirty = true;
      const nowMs = readClock(options.clock, lastPublishedAt);
      if (command.type !== "clock.advance" || nowMs - lastPublishedAt >= publishIntervalMs) {
        publish(nowMs);
      }
      return result;
    },
    publishIfDue() {
      const nowMs = readClock(options.clock, lastPublishedAt);
      if (!dirty || nowMs - lastPublishedAt < publishIntervalMs) return false;
      publish(nowMs);
      return true;
    },
    recover() {
      state = isValidGameState(lastGoodState) ? lastGoodState : createInitialGameState();
      lastGoodState = state;
      dirty = true;
      publish(readClock(options.clock, lastPublishedAt));
    },
  };
}
