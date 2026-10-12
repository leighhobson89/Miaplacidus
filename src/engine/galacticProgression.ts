import type { GameState } from "./state";

/**
 * Cosmic Forge's synthetic `apAwardedThisRun` tech marker unlocks Galactic on
 * the first Starship arrival and is restored on rebirth. The remake keeps the
 * actual AP-award flag separate, so derive the tab marker from durable travel
 * history and the existing post-arrival state instead.
 */
export function galacticTabUnlocked(state: GameState): boolean {
  return (
    state.permanent.rebirthCount > 0 ||
    state.run.space.ascendencyAwardedThisRun ||
    state.run.space.starshipDistanceTravelledThisRun > 0 ||
    state.run.space.starship.phase === "orbiting"
  );
}
