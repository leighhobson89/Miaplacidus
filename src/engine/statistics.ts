export function addLifetimeCount(current: number, added: number): number {
  return Math.min(Number.MAX_SAFE_INTEGER, current + added);
}
