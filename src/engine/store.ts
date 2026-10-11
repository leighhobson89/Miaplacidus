import { createInitialGameState, isValidGameState, type GameState } from "./state";
import { transitionFromKnownValidState, type EngineResult, type GameCommand } from "./commands";
import { selectGameSnapshot, type GameSnapshot } from "./selectors";
import type { ClockSource } from "./clock";

export interface GameStoreOptions {
  readonly clock: ClockSource;
  readonly publishIntervalMs?: number;
  readonly onListenerError?: (error: unknown) => void;
}

export type GameStateReducer = (state: GameState) => EngineResult;

export interface GameStore {
  getState(): GameState;
  getSnapshot(): GameSnapshot;
  subscribe(listener: () => void): () => void;
  dispatch(command: GameCommand): EngineResult;
  /** Present only in development and test builds for typed scenario reducers. */
  dispatchReducer?: (reducer: GameStateReducer) => EngineResult;
  dispatchBatch(commands: readonly GameCommand[]): readonly EngineResult[];
  publishIfDue(): boolean;
  publishNow(): void;
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
  let publishing = false;
  const listeners = new Set<() => void>();

  function publish(nowMs: number): void {
    if (!dirty || publishing) return;
    publishing = true;
    let publishedAt = nowMs;
    try {
      while (dirty) {
        snapshot = selectGameSnapshot(state);
        lastPublishedAt = publishedAt;
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
        publishedAt = readClock(options.clock, lastPublishedAt);
      }
    } finally {
      publishing = false;
    }
  }

  function reject(stateValue: GameState, code: "invalid-state" | "transition-failed") {
    const failure =
      code === "invalid-state"
        ? ({ code: "invalid-state", messageKey: "engine.error.invalid-state" } as const)
        : ({ code: "transition-failed", messageKey: "engine.error.recovered" } as const);
    return {
      accepted: false,
      state: stateValue,
      events: [],
      failure,
    } satisfies EngineResult;
  }

  function validateResult(result: EngineResult, previous: GameState): EngineResult {
    if (!result.accepted) return result;
    if (!isValidGameState(result.state)) return reject(previous, "invalid-state");
    if (result.state.run.pioneerName !== previous.run.pioneerName)
      return reject(previous, "transition-failed");
    return result;
  }

  function validateTransitionResult(result: EngineResult, previous: GameState): EngineResult {
    if (result.accepted && result.state.run.pioneerName !== previous.run.pioneerName)
      return reject(previous, "transition-failed");
    return result;
  }

  function commit(
    result: EngineResult,
    publishImmediately: boolean,
    nowMs: number,
    transitionValidated = false,
  ): EngineResult {
    const validated = transitionValidated
      ? validateTransitionResult(result, state)
      : validateResult(result, state);
    if (!validated.accepted) return validated;
    if (validated.state === state && validated.events.length === 0) return validated;
    state = validated.state;
    lastGoodState = state;
    dirty = true;
    if (publishImmediately || nowMs - lastPublishedAt >= publishIntervalMs) publish(nowMs);
    return validated;
  }

  const store: GameStore = {
    getState: () => state,
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispatch(command) {
      const result = transitionFromKnownValidState(state, command);
      const nowMs = readClock(options.clock, lastPublishedAt);
      return commit(result, command.type !== "clock.advance", nowMs, true);
    },
    dispatchBatch(commands) {
      const results: EngineResult[] = [];
      for (const command of commands) {
        const result = validateTransitionResult(transitionFromKnownValidState(state, command), state);
        results.push(result);
        if (!result.accepted) continue;
        state = result.state;
        lastGoodState = state;
        dirty = true;
      }
      if (dirty) publish(readClock(options.clock, lastPublishedAt));
      return results;
    },
    publishIfDue() {
      const nowMs = readClock(options.clock, lastPublishedAt);
      if (!dirty || nowMs - lastPublishedAt < publishIntervalMs) return false;
      publish(nowMs);
      return true;
    },
    publishNow() {
      publish(readClock(options.clock, lastPublishedAt));
    },
    recover() {
      state = isValidGameState(lastGoodState) ? lastGoodState : createInitialGameState();
      lastGoodState = state;
      dirty = true;
      publish(readClock(options.clock, lastPublishedAt));
    },
  };

  if (import.meta.env.DEV || MIAPLACIDUS_BUILD_MODE === "test") {
    store.dispatchReducer = (reducer) => {
      let result: EngineResult;
      try {
        result = reducer(state);
      } catch {
        return reject(state, "transition-failed");
      }
      return commit(result, true, readClock(options.clock, lastPublishedAt));
    };
  }

  return store;
}
