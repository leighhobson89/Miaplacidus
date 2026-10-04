import type { ClockStep } from "./clock";
import type { GameTimer, TimerDomain, TimerId, TimerMap, TimerPolicy } from "./runtimeTypes";

export type TimerEvent = {
  readonly type: "timer.completed";
  readonly timerId: TimerId;
  readonly completions: number;
  readonly eventId?: GameTimer["eventId"];
};

const DOMAIN_POLICIES: Readonly<Record<TimerDomain, TimerPolicy>> = {
  autobuyer: { phase: "simulation", offlineEligible: true, warpable: true },
  production: { phase: "simulation", offlineEligible: true, warpable: true },
  research: { phase: "simulation", offlineEligible: true, warpable: true },
  travel: { phase: "simulation", offlineEligible: true, warpable: true },
  survey: { phase: "simulation", offlineEligible: true, warpable: true },
  battle: { phase: "simulation", offlineEligible: false, warpable: true },
  weather: { phase: "wall", offlineEligible: false, warpable: false },
  casino: { phase: "simulation", offlineEligible: false, warpable: false },
  "black-hole": { phase: "simulation", offlineEligible: true, warpable: true },
  "cosmic-rip": { phase: "simulation", offlineEligible: true, warpable: true },
  wall: { phase: "wall", offlineEligible: false, warpable: false },
};

export function timerPolicyFor(domain: TimerDomain): TimerPolicy {
  return DOMAIN_POLICIES[domain];
}

export function createTimerId(domain: TimerDomain, stableKey: string): TimerId {
  if (!/^[a-zA-Z0-9._-]+$/.test(stableKey)) {
    throw new TypeError("Timer key must be a stable identifier.");
  }
  return `${domain}:${stableKey}` as TimerId;
}

export interface CreateTimerOptions {
  readonly id: TimerId;
  readonly domain: TimerDomain;
  readonly durationMs: number;
  readonly repeat?: boolean;
  readonly paused?: boolean;
  readonly eventId?: GameTimer["eventId"];
  readonly goodId?: GameTimer["goodId"];
}

export function createTimer(options: CreateTimerOptions): GameTimer {
  if (!Number.isFinite(options.durationMs) || options.durationMs < 1) {
    throw new RangeError("Timer duration must be at least one millisecond.");
  }
  return {
    id: options.id,
    domain: options.domain,
    durationMs: options.durationMs,
    elapsedMs: 0,
    repeat: options.repeat ?? false,
    completionCount: 0,
    status: options.paused ? "paused" : "running",
    policy: timerPolicyFor(options.domain),
    ...(options.eventId === undefined ? {} : { eventId: options.eventId }),
    ...(options.goodId === undefined ? {} : { goodId: options.goodId }),
  };
}

function elapsedForTimer(timer: GameTimer, step: ClockStep): number {
  if (timer.policy.phase === "wall") {
    return step.phase === "wall" ? step.elapsedMs : 0;
  }
  if (step.phase === "foreground") {
    return timer.policy.warpable ? step.warpedElapsedMs : step.elapsedMs;
  }
  if (step.phase === "offline" && timer.policy.offlineEligible) {
    // The source charges the Black Hole against elapsed wall time on return,
    // while ordinary offline production receives the global offline rate.
    if (timer.domain === "black-hole") return step.offlineElapsedMs;
    return step.elapsedMs;
  }
  return 0;
}

/** Arithmetic catch-up avoids loops after long offline intervals; repeated completions are counted. */
export function advanceTimers(
  timers: TimerMap,
  steps: readonly ClockStep[],
): { readonly timers: TimerMap; readonly events: readonly TimerEvent[] } {
  const next: Record<string, GameTimer> = { ...timers };
  const events: TimerEvent[] = [];
  for (const timer of Object.values(timers)) {
    if (timer.status !== "running") {
      continue;
    }
    let elapsedMs = timer.elapsedMs;
    let changed = false;
    for (const step of steps) {
      elapsedMs += elapsedForTimer(timer, step);
      changed = true;
    }
    if (!changed || elapsedMs === timer.elapsedMs) {
      continue;
    }
    const completions = Math.floor(elapsedMs / timer.durationMs);
    if (completions > 0) {
      const completed = timer.repeat ? completions : 1;
      events.push({
        type: "timer.completed",
        timerId: timer.id,
        completions: completed,
        ...(timer.eventId === undefined ? {} : { eventId: timer.eventId }),
      });
      if (timer.repeat) {
        const remainder = elapsedMs % timer.durationMs;
        next[timer.id] = {
          ...timer,
          elapsedMs: remainder,
          completionCount: Math.min(Number.MAX_SAFE_INTEGER, timer.completionCount + completions),
        };
      } else {
        next[timer.id] = {
          ...timer,
          elapsedMs: timer.durationMs,
          completionCount: Math.min(Number.MAX_SAFE_INTEGER, timer.completionCount + 1),
          status: "complete",
        };
      }
    } else {
      next[timer.id] = { ...timer, elapsedMs };
    }
  }
  return { timers: next, events };
}

export function completeTimer(
  timers: TimerMap,
  id: TimerId,
): {
  readonly timers: TimerMap;
  readonly events: readonly TimerEvent[];
  readonly completed: boolean;
} {
  const timer = timers[id];
  if (!timer || timer.status === "complete") {
    return { timers, events: [], completed: false };
  }
  const completedTimer: GameTimer = {
    ...timer,
    elapsedMs: timer.durationMs,
    completionCount: Math.min(Number.MAX_SAFE_INTEGER, timer.completionCount + 1),
    status: "complete",
  };
  return {
    timers: { ...timers, [id]: completedTimer },
    events: [
      {
        type: "timer.completed",
        timerId: id,
        completions: 1,
        ...(timer.eventId === undefined ? {} : { eventId: timer.eventId }),
      },
    ],
    completed: true,
  };
}
