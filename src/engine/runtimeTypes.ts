import type { EventId, EconomicGoodId } from "../content/ids";

export interface RandomState {
  readonly seed: number;
  readonly draws: number;
}

export const TIMER_DOMAINS = [
  "autobuyer",
  "production",
  "research",
  "travel",
  "survey",
  "battle",
  "casino",
  "black-hole",
  "cosmic-rip",
  "wall",
] as const;
export type TimerDomain = (typeof TIMER_DOMAINS)[number];

declare const timerIdBrand: unique symbol;
export type TimerId = string & { readonly [timerIdBrand]: "TimerId" };

export type TimerPhase = "simulation" | "wall";

export interface TimerPolicy {
  readonly phase: TimerPhase;
  readonly offlineEligible: boolean;
  readonly warpable: boolean;
}

export interface GameTimer {
  readonly id: TimerId;
  readonly domain: TimerDomain;
  readonly durationMs: number;
  readonly elapsedMs: number;
  readonly repeat: boolean;
  readonly completionCount: number;
  readonly status: "running" | "paused" | "complete";
  readonly policy: TimerPolicy;
  readonly eventId?: EventId;
  readonly goodId?: EconomicGoodId;
}

export type TimerMap = Readonly<Record<string, GameTimer>>;

export interface ClockState {
  readonly wallNowMs: number | null;
  readonly simulationMs: number;
  readonly paused: boolean;
  readonly foreground: boolean;
  readonly hiddenElapsedMs: number;
  readonly pendingForegroundMs: number;
}
