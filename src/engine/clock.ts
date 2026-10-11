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
  /** Limits synchronous foreground catch-up work for animation-frame callers. */
  readonly maxForegroundSteps?: number;
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
    pendingForegroundSegments: [],
  };
}

function validElapsed(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function advanceClock(state: ClockState, input: ClockInput): ClockAdvance {
  if (!validElapsed(input.wallNowMs)) {
    throw new RangeError("Clock wall time must be finite and non-negative.");
  }
  const maxForegroundSteps = input.maxForegroundSteps ?? MAX_FOREGROUND_STEPS_PER_ADVANCE;
  if (
    !Number.isSafeInteger(maxForegroundSteps) ||
    maxForegroundSteps < 1 ||
    maxForegroundSteps > MAX_FOREGROUND_STEPS_PER_ADVANCE
  ) {
    throw new RangeError("Foreground step budget must be a positive integer no greater than four.");
  }
  const effectiveWallNowMs =
    state.wallNowMs === null ? input.wallNowMs : Math.max(state.wallNowMs, input.wallNowMs);
  const wallDelta = state.wallNowMs === null ? 0 : effectiveWallNowMs - state.wallNowMs;
  const steps: ClockStep[] = [];
  let simulationMs = state.simulationMs;
  let hiddenElapsedMs = state.hiddenElapsedMs;
  let pendingForegroundMs = state.pendingForegroundMs;
  let pendingForegroundSegments = [...state.pendingForegroundSegments];

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
    return {
      state: {
        ...state,
        wallNowMs: effectiveWallNowMs,
        foreground: false,
        hiddenElapsedMs,
        pendingForegroundMs,
        pendingForegroundSegments,
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
  if (!state.paused && foregroundDelta > 0) {
    // Assign the multiplier when wall time enters the queue. Catch-up may run
    // after a finite warp has expired, so each queued interval keeps its own
    // original rate until its simulation step is applied.
    const appendSegment = (elapsedMs: number, multiplier: number) => {
      if (elapsedMs <= 0) return;
      const previous = pendingForegroundSegments.at(-1);
      if (previous?.multiplier === multiplier) {
        pendingForegroundSegments[pendingForegroundSegments.length - 1] = {
          elapsedMs: previous.elapsedMs + elapsedMs,
          multiplier,
        };
      } else {
        pendingForegroundSegments.push({ elapsedMs, multiplier });
      }
    };
    const safeMultiplier = (value: number | undefined) =>
      value !== undefined && Number.isFinite(value) && value > 0 ? value : 1;
    const acceptedForegroundDelta = Math.min(
      foregroundDelta,
      Math.max(0, MAX_OFFLINE_ELAPSED_MS - pendingForegroundMs),
    );
    if (input.blackHoleAlwaysOn) {
      appendSegment(acceptedForegroundDelta, safeMultiplier(input.blackHolePower));
    } else if (input.timeWarpRemainingMs !== undefined) {
      const warpMs = Math.min(acceptedForegroundDelta, Math.max(0, input.timeWarpRemainingMs));
      appendSegment(warpMs, safeMultiplier(input.timeWarpMultiplier));
      appendSegment(acceptedForegroundDelta - warpMs, 1);
    } else {
      appendSegment(acceptedForegroundDelta, safeMultiplier(input.timeWarpMultiplier));
    }
    pendingForegroundMs += acceptedForegroundDelta;
  }

  if (!state.paused && pendingForegroundMs > 0) {
    let count = 0;
    while (pendingForegroundSegments.length > 0 && count < maxForegroundSteps) {
      const segment = pendingForegroundSegments[0]!;
      const elapsedMs = Math.min(MAX_FOREGROUND_STEP_MS, segment.elapsedMs);
      const warpedElapsedMs = elapsedMs * segment.multiplier;
      steps.push({ phase: "foreground", elapsedMs, warpedElapsedMs, offlineElapsedMs: 0 });
      simulationMs += warpedElapsedMs;
      pendingForegroundMs = Math.max(0, pendingForegroundMs - elapsedMs);
      const remainder = segment.elapsedMs - elapsedMs;
      if (remainder <= 1e-9) pendingForegroundSegments.shift();
      else pendingForegroundSegments[0] = { ...segment, elapsedMs: remainder };
      count += 1;
    }
    if (pendingForegroundSegments.length === 0 || pendingForegroundMs <= 1e-9) {
      pendingForegroundMs = 0;
      pendingForegroundSegments = [];
    }
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
      pendingForegroundSegments,
    },
    steps,
  };
}

export function pauseClock(state: ClockState): ClockState {
  return { ...state, paused: true, hiddenElapsedMs: 0 };
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
