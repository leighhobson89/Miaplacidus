import type { RandomState } from "./runtimeTypes";

export function createRandomState(seed: number): RandomState {
  if (!Number.isSafeInteger(seed) || seed < 0) {
    throw new RangeError("Random seed must be a non-negative safe integer.");
  }
  return { seed: seed >>> 0, draws: 0 };
}

function mix32(value: number): number {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x21f0aaad);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x735a2d97);
  return (mixed ^ (mixed >>> 15)) >>> 0;
}

export function nextRandom(state: RandomState): {
  readonly value: number;
  readonly state: RandomState;
} {
  if (
    !Number.isSafeInteger(state.seed) ||
    !Number.isSafeInteger(state.draws) ||
    state.draws < 0 ||
    state.draws >= Number.MAX_SAFE_INTEGER
  ) {
    throw new RangeError("Random state is invalid.");
  }
  const input = (state.seed + Math.imul(state.draws + 1, 0x9e3779b9)) >>> 0;
  return {
    value: mix32(input) / 0x1_0000_0000,
    state: { seed: state.seed >>> 0, draws: state.draws + 1 },
  };
}

export function nextRandomInteger(
  state: RandomState,
  minInclusive: number,
  maxInclusive: number,
): { readonly value: number; readonly state: RandomState } {
  if (
    !Number.isSafeInteger(minInclusive) ||
    !Number.isSafeInteger(maxInclusive) ||
    maxInclusive < minInclusive ||
    !Number.isSafeInteger(maxInclusive - minInclusive + 1)
  ) {
    throw new RangeError("Random integer bounds must be ordered safe integers.");
  }
  const next = nextRandom(state);
  return {
    value: minInclusive + Math.floor(next.value * (maxInclusive - minInclusive + 1)),
    state: next.state,
  };
}
