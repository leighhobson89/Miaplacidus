import type { GameState } from "../../engine/state";
import { createEconomyFixture } from "./economyFixtures";

/**
 * Builds a late-game navigation checkpoint for a currently active local save.
 * This skips natural late-game progression; tests must use the visible UI for
 * navigation and actions after applying it.
 */
export function createLateGameNavigationCheckpoint(current: GameState): GameState {
  const interstellar = createEconomyFixture("meta-megastructure-route", current.settings.locale);
  const fullTechnology = createEconomyFixture("space-telescope", current.settings.locale);
  const cosmicRip = createEconomyFixture("meta-cosmic-rip-route", current.settings.locale);

  return {
    ...interstellar,
    settings: current.settings,
    run: {
      ...interstellar.run,
      pioneerName: current.run.pioneerName,
      unlockedResources: fullTechnology.run.unlockedResources,
      goods: cosmicRip.run.goods,
      economy: {
        ...interstellar.run.economy,
        unlockedCompounds: fullTechnology.run.economy.unlockedCompounds,
        researchedTechnologies: fullTechnology.run.economy.researchedTechnologies,
        revealedTechnologies: fullTechnology.run.economy.revealedTechnologies,
      },
      space: {
        ...interstellar.run.space,
        ascendencyAwardedThisRun: true,
      },
    },
    permanent: {
      ...interstellar.permanent,
      rebirthCount: cosmicRip.permanent.rebirthCount,
      gloryPoints: cosmicRip.permanent.gloryPoints,
      acquiredPerks: interstellar.permanent.acquiredPerks,
      settledSystemIds: Array.from(
        new Set([
          ...interstellar.permanent.settledSystemIds,
          ...cosmicRip.permanent.settledSystemIds,
        ]),
      ),
      cosmicRip: cosmicRip.permanent.cosmicRip,
    },
  };
}
