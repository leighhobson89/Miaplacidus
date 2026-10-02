export const PRECISION_ABSOLUTE_TOLERANCE = 1e-9;
export const PRECISION_RELATIVE_TOLERANCE = 1e-13;

export function toleranceFor(value: number): number {
  return Number.isFinite(value)
    ? Math.max(PRECISION_ABSOLUTE_TOLERANCE, Math.abs(value) * PRECISION_RELATIVE_TOLERANCE)
    : PRECISION_ABSOLUTE_TOLERANCE;
}

export function isAtLeast(value: number, threshold: number): boolean {
  return (
    Number.isFinite(value) &&
    Number.isFinite(threshold) &&
    value >= threshold - toleranceFor(threshold)
  );
}

export function canAfford(quantity: number, cost: number): boolean {
  return isAtLeast(quantity, cost);
}

export function isEffectivelyEqual(left: number, right: number): boolean {
  return (
    Number.isFinite(left) &&
    Number.isFinite(right) &&
    Math.abs(left - right) <= Math.max(toleranceFor(left), toleranceFor(right))
  );
}

export function settleSpend(quantity: number, cost: number): number {
  if (!Number.isFinite(quantity) || !Number.isFinite(cost)) return 0;
  const remainder = quantity - cost;
  return remainder < 0 ? 0 : remainder;
}

export function displayQuantity(value: number): number {
  return Number.isFinite(value) ? Math.floor(value + toleranceFor(value)) : 0;
}

export function displayCost(value: number): number {
  return Number.isFinite(value) ? Math.ceil(value - toleranceFor(value)) : 0;
}

/** Truncates toward zero so a displayed balance never overstates cash held. */
export function displayCurrency(value: number): string {
  if (!Number.isFinite(value)) {
    return "0.00";
  }
  const sign = value < 0 ? "-" : "";
  const magnitude = Math.abs(value);
  const slack = Math.min(toleranceFor(magnitude), 0.005);
  return `${sign}${(Math.floor((magnitude + slack) * 100) / 100).toFixed(2)}`;
}

export function truncateToDecimals(value: number, decimals: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(decimals)) return 0;
  const factor = 10 ** decimals;
  const sign = value < 0 ? -1 : 1;
  const magnitude = Math.abs(value);
  const slack = magnitude * 4 * Number.EPSILON;
  return sign * (Math.floor((magnitude + slack) * factor) / factor);
}

export interface UpgradeStepFormat {
  readonly current: string;
  readonly next: string;
  readonly decimals: number;
  readonly distinct: boolean;
}

export interface UpgradeStepFormatOptions {
  readonly decimals?: number;
  readonly maxDecimals?: number;
}

export function formatUpgradeStep(
  currentValue: number,
  nextValue: number,
  options: UpgradeStepFormatOptions = {},
): UpgradeStepFormat {
  const preferred = Number.isFinite(options.decimals) ? Math.floor(options.decimals ?? 0) : 0;
  const ceiling = Number.isFinite(options.maxDecimals) ? Math.floor(options.maxDecimals ?? 3) : 3;
  const low = Math.max(0, Math.min(20, preferred));
  const high = Math.max(low, Math.min(20, ceiling));
  if (!Number.isFinite(currentValue) || !Number.isFinite(nextValue)) {
    return {
      current: String(currentValue),
      next: String(nextValue),
      decimals: low,
      distinct: false,
    };
  }
  for (let decimals = low; decimals <= high; decimals += 1) {
    const current = currentValue.toFixed(decimals);
    const next = nextValue.toFixed(decimals);
    if (current !== next) return { current, next, decimals, distinct: true };
  }
  return {
    current: currentValue.toFixed(high),
    next: nextValue.toFixed(high),
    decimals: high,
    distinct: false,
  };
}
