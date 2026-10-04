import type { ClockState } from "./runtimeTypes";

export const MAX_FOREGROUND_STEP_MS = 250;
export const MAX_FOREGROUND_STEPS_PER_ADVANCE = 4;
// The reference has no offline-duration cap. This is only the largest exactly
// representable millisecond interval in a JavaScript number, not a game limit.
export const MAX_OFFLINE_ELAPSED_MS = Number.MAX_SAFE_INTEGER;
export const OFFLINE_GAINS_RATE = 0.334;

export interface ClockInput {
  readonly wallNowMs: number;
  readonly foreground: boolean;
  /** Used at boot to account for time since the last saved wall-clock sample. */
  readonly offlineElapsedMs?: number;
  readonly timeWarpMultiplier?: number;
  /** Saved casino/ability warp duration; omitted for the legacy injected multiplier. */
  readonly timeWarpRemainingMs?: number;
  readonly blackHoleAlwaysOn?: boolean;
  readonly blackHolePower?: number;
}

export interface ClockStep {
  readonly phase: "foreground" | "offline" | "wall";
  readonly elapsedMs: number;
  readonly warpedElapsedMs: number;
  readonly offlineElapsedMs: number;
}

export interface ClockAdvance {
  readonly state: ClockState;
  readonly steps: readonly ClockStep[];
}

export interface ClockSource {
  now(): number;
}

export function createClockState(wallNowMs: number | null = null): ClockState {
  return {
    wallNowMs,
    simulationMs: 0,
    paused: false,
    foreground: true,
    hiddenElapsedMs: 0,
    pendingForegroundMs: 0,
  };
}

function validElapsed(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function advanceClock(state: ClockState, input: ClockInput): ClockAdvance {
  if (!validElapsed(input.wallNowMs)) {
    throw new RangeError("Clock wall time must be finite and non-negative.");
  }
  const effectiveWallNowMs =
    state.wallNowMs === null ? input.wallNowMs : Math.max(state.wallNowMs, input.wallNowMs);
  const wallDelta = state.wallNowMs === null ? 0 : effectiveWallNowMs - state.wallNowMs;
  const steps: ClockStep[] = [];
  let simulationMs = state.simulationMs;
  let hiddenElapsedMs = state.hiddenElapsedMs;
  let pendingForegroundMs = state.pendingForegroundMs;

  if (wallDelta > 0) {
    steps.push({
      phase: "wall",
      elapsedMs: Math.min(wallDelta, MAX_OFFLINE_ELAPSED_MS),
      warpedElapsedMs: 0,
      offlineElapsedMs: 0,
    });
  }

  if (!input.foreground) {
    hiddenElapsedMs = state.paused
      ? 0
      : Math.min(MAX_OFFLINE_ELAPSED_MS, hiddenElapsedMs + wallDelta);
    pendingForegroundMs = state.paused ? 0 : pendingForegroundMs;
    return {
      state: {
        ...state,
        wallNowMs: effectiveWallNowMs,
        foreground: false,
        hiddenElapsedMs,
        pendingForegroundMs,
      },
      steps,
    };
  }

  const returningFromHidden = !state.foreground;
  const rawOfflineElapsed =
    input.offlineElapsedMs ?? (returningFromHidden ? hiddenElapsedMs + wallDelta : 0);
  if (!validElapsed(rawOfflineElapsed)) {
    throw new RangeError("Offline elapsed time must be finite and non-negative.");
  }

  hiddenElapsedMs = 0;
  const foregroundDelta = returningFromHidden ? 0 : wallDelta;
  if (!state.paused && (foregroundDelta > 0 || pendingForegroundMs > 0)) {
    // Keep any backlog as one number and process only four 250 ms slices per
    // call. This preserves elapsed time without an unbounded catch-up loop.
    pendingForegroundMs = Math.min(pendingForegroundMs + foregroundDelta, MAX_OFFLINE_ELAPSED_MS);
    let count = 0;
    let warpedWallElapsedMs = 0;
    const configuredTimeWarpRemaining = input.timeWarpRemainingMs;
    while (pendingForegroundMs > 0 && count < MAX_FOREGROUND_STEPS_PER_ADVANCE) {
      const nominalElapsedMs = Math.min(MAX_FOREGROUND_STEP_MS, pendingForegroundMs);
      const requestedMultiplier = input.blackHoleAlwaysOn
        ? (input.blackHolePower ?? 1)
        : (input.timeWarpMultiplier ?? 1);
      const multiplier =
        Number.isFinite(requestedMultiplier) && requestedMultiplier > 0 ? requestedMultiplier : 1;
      const activeWarpRemaining =
        configuredTimeWarpRemaining === undefined
          ? Infinity
          : Math.max(0, configuredTimeWarpRemaining - warpedWallElapsedMs);
      const warpedChunkMs = Math.min(nominalElapsedMs, activeWarpRemaining);
      if (warpedChunkMs > 0) {
        const warpedChunkSimulationMs = warpedChunkMs * multiplier;
        steps.push({
          phase: "foreground",
          elapsedMs: warpedChunkMs,
          warpedElapsedMs: warpedChunkSimulationMs,
          offlineElapsedMs: 0,
        });
        simulationMs += warpedChunkSimulationMs;
        warpedWallElapsedMs += warpedChunkMs;
      }
      const normalChunkMs = nominalElapsedMs - warpedChunkMs;
      if (normalChunkMs > 0) {
        steps.push({
          phase: "foreground",
          elapsedMs: normalChunkMs,
          warpedElapsedMs: normalChunkMs,
          offlineElapsedMs: 0,
        });
        simulationMs += normalChunkMs;
      }
      pendingForegroundMs -= nominalElapsedMs;
      count += 1;
    }
  } else if (state.paused) {
    pendingForegroundMs = 0;
  }

  if (!state.paused && rawOfflineElapsed > 0) {
    const offlineElapsedMs = Math.min(rawOfflineElapsed, MAX_OFFLINE_ELAPSED_MS);
    const gainedSimulationMs = offlineElapsedMs * OFFLINE_GAINS_RATE;
    steps.push({
      phase: "offline",
      elapsedMs: gainedSimulationMs,
      warpedElapsedMs: gainedSimulationMs,
      offlineElapsedMs,
    });
    simulationMs += gainedSimulationMs;
  }

  return {
    state: {
      ...state,
      wallNowMs: effectiveWallNowMs,
      foreground: true,
      simulationMs,
      hiddenElapsedMs,
      pendingForegroundMs,
    },
    steps,
  };
}

export function pauseClock(state: ClockState): ClockState {
  return { ...state, paused: true, pendingForegroundMs: 0, hiddenElapsedMs: 0 };
}

export function resumeClock(state: ClockState): ClockState {
  return { ...state, paused: false };
}

export function sampleClock(
  source: ClockSource,
  state: ClockState,
  input: Omit<ClockInput, "wallNowMs">,
): ClockAdvance {
  return advanceClock(state, { ...input, wallNowMs: source.now() });
}
