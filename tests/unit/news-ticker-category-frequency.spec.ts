import { describe, expect, it } from "vitest";
import { COMPOUND_IDS, MATERIAL_IDS, systemIdForStar } from "../../src/content/ids";
import { ONE_OFF_NEWS_IDS } from "../../src/content/metaSignals";
import { forceNewsTicker } from "../../src/engine/newsTicker";
import { nextRandom } from "../../src/engine/random";
import { createInitialGameState, type GameState } from "../../src/engine/state";

const SAMPLE_COUNT = 20_000;
const MANUSCRIPT_SYSTEM_ID = systemIdForStar(80, 1);

function withEligibleTickerEntries(state: GameState): GameState {
  return {
    ...state,
    run: {
      ...state.run,
      unlockedResources: MATERIAL_IDS,
      goods: Object.fromEntries(
        Object.entries(state.run.goods).map(([id, good]) => [
          id,
          { ...good, quantity: 0, storageCapacity: 1_000 },
        ]),
      ) as GameState["run"]["goods"],
      economy: {
        ...state.run.economy,
        unlockedCompounds: COMPOUND_IDS,
      },
    },
    permanent: {
      ...state.permanent,
      megastructures: {
        ...state.permanent.megastructures,
        ancientManuscripts: [
          {
            position: 1,
            manuscriptSystemId: MANUSCRIPT_SYSTEM_ID,
            factorySystemId: systemIdForStar(80, 2),
            megastructureId: "dysonSphere",
            reported: false,
          },
        ],
      },
    },
  };
}

function seedForRoll(predicate: (value: number) => boolean): number {
  for (let seed = 0; seed < 10_000; seed += 1) {
    if (predicate(nextRandom({ seed, draws: 0 }).value)) return seed;
  }
  throw new Error("No matching deterministic random seed found.");
}

describe("scheduled News Ticker category frequencies", () => {
  it("keeps seeded category proportions and the manuscript-clue opportunity", () => {
    const base = withEligibleTickerEntries(createInitialGameState({ seed: 7301 }));
    const counts = {
      oneOff: 0,
      prize: 0,
      wacky: 0,
      headline: 0,
      manuscriptClue: 0,
    };

    // Each sample starts from identical eligibility but a distinct, fixed seed.
    // This keeps all categories available while making the regression repeatable.
    for (let seed = 0; seed < SAMPLE_COUNT; seed += 1) {
      const state = {
        ...base,
        run: { ...base.run, random: { seed, draws: 0 } },
      };
      const scheduled = forceNewsTicker(state);
      expect(scheduled).not.toBeNull();
      counts[scheduled!.state.run.newsTicker.entries.at(-1)!.category] += 1;
    }

    const proportion = (count: number) => count / SAMPLE_COUNT;
    expect(proportion(counts.oneOff)).toBeGreaterThanOrEqual(0.025);
    expect(proportion(counts.oneOff)).toBeLessThanOrEqual(0.035);
    expect(proportion(counts.prize)).toBeGreaterThanOrEqual(0.09);
    expect(proportion(counts.prize)).toBeLessThanOrEqual(0.11);
    expect(proportion(counts.wacky)).toBeGreaterThanOrEqual(0.14);
    expect(proportion(counts.wacky)).toBeLessThanOrEqual(0.16);

    const ordinaryHeadlineOpportunities = counts.headline + counts.manuscriptClue;
    expect(proportion(ordinaryHeadlineOpportunities)).toBeGreaterThanOrEqual(0.71);
    expect(proportion(ordinaryHeadlineOpportunities)).toBeLessThanOrEqual(0.73);
    const manuscriptClueRate = counts.manuscriptClue / ordinaryHeadlineOpportunities;
    expect(manuscriptClueRate).toBeGreaterThanOrEqual(0.23);
    expect(manuscriptClueRate).toBeLessThanOrEqual(0.27);
  });

  it("falls back to an ordinary headline when a sampled category has no eligible entry", () => {
    const base = createInitialGameState({ seed: 7302 });
    const fullGoods = Object.fromEntries(
      Object.entries(base.run.goods).map(([id, good]) => [
        id,
        { ...good, quantity: good.storageCapacity },
      ]),
    ) as GameState["run"]["goods"];
    const exhausted = {
      ...base,
      run: {
        ...base.run,
        goods: fullGoods,
        newsTicker: {
          ...base.run.newsTicker,
          offeredOneOffIds: ONE_OFF_NEWS_IDS,
        },
      },
    };

    const oneOffSeed = seedForRoll((value) => value < 0.03);
    const prizeSeed = seedForRoll((value) => value >= 0.03 && value < 0.13);
    for (const seed of [oneOffSeed, prizeSeed]) {
      const scheduled = forceNewsTicker({
        ...exhausted,
        run: { ...exhausted.run, random: { seed, draws: 0 } },
      });
      expect(scheduled?.state.run.newsTicker.entries.at(-1)?.category).toBe("headline");
    }
  });
});
