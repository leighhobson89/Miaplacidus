import { describe, expect, it } from "vitest";
import { ACHIEVEMENT_CATALOGUE, achievementName } from "../../src/content/achievements";
import { LOCALE_IDS, systemIdForStar, type SystemId } from "../../src/content/ids";
import { MANUSCRIPT_CLUE_NEWS_IDS } from "../../src/content/metaSignals";
import { THEME_IDS } from "../../src/content/themes";
import { starTypeForSystem } from "../../src/content/starCatalogue";
import { transition } from "../../src/engine/commands";
import {
  advanceNewsTicker,
  checkNewsPrizeClaim,
  forceNewsTicker,
} from "../../src/engine/newsTicker";
import { advanceRandomEvents } from "../../src/engine/randomEvents";
import { STAR_WEATHER_TIMER_ID } from "../../src/engine/weather";
import { createInitialGameState, isValidGameState, type GameState } from "../../src/engine/state";
import { makeEnvelope } from "../../src/persistence/schema";
import { decodeLocal, encodeLocal } from "../../src/persistence/codec";
import { metaSignalText, newsEntryText } from "../../src/i18n/metaSignalMessages";

function withManuscripts(
  state: ReturnType<typeof createInitialGameState>,
  records: readonly ReturnType<
    typeof createInitialGameState
  >["permanent"]["megastructures"]["ancientManuscripts"][number][],
  manuscriptCluesShown: ReturnType<
    typeof createInitialGameState
  >["permanent"]["megastructures"]["manuscriptCluesShown"] = {},
  seenIds: readonly number[] = [],
) {
  return {
    ...state,
    run: {
      ...state.run,
      newsTicker: { ...state.run.newsTicker, seenIds },
    },
    permanent: {
      ...state.permanent,
      megastructures: {
        ...state.permanent.megastructures,
        ancientManuscripts: records,
        manuscriptCluesShown,
      },
    },
  };
}

function manuscriptRecord(
  position: 1 | 2 | 3 | 4,
  manuscriptSystemId: SystemId,
  factorySystemId: SystemId,
  reported = false,
) {
  return {
    position,
    manuscriptSystemId,
    factorySystemId,
    megastructureId: "dysonSphere" as const,
    reported,
  };
}

describe("meta achievements, events, and ticker", () => {
  it("ships all stable achievements with localized names for every supported locale", () => {
    expect(ACHIEVEMENT_CATALOGUE).toHaveLength(70);
    const encodingArtifacts = /Ã[\u0080-\u00bf]|Â[\u0080-\u00bf]|â[€‚œ]|Å“|ÄŒ/u;
    for (const achievement of ACHIEVEMENT_CATALOGUE) {
      for (const locale of LOCALE_IDS) {
        const name = achievementName(achievement.id, locale);
        expect(name).not.toBe(achievement.id);
        expect(name).not.toMatch(encodingArtifacts);
      }
    }
    expect(achievementName("collect50Hydrogen", "es")).toBe("Recoge 50 Hidrógeno");
    expect(achievementName("collect50Hydrogen", "pt")).toBe("Colete 50 de Hidrogênio");
    expect(achievementName("collect50Hydrogen", "fr")).toBe("Collectez 50 Hydrogène");
  });

  it("awards a threshold achievement once at the accepted-command boundary", () => {
    let state = createInitialGameState({ pioneerName: "Achievement", seed: 510 });
    state = {
      ...state,
      run: {
        ...state.run,
        goods: {
          ...state.run.goods,
          hydrogen: { ...state.run.goods.hydrogen, storageCapacity: 1_000 },
        },
      },
    };
    let lastEvents: readonly { readonly type: string }[] = [];
    for (let count = 0; count < 50; count += 1) {
      const result = transition(state, { type: "resource.collect", goodId: "hydrogen" });
      expect(result.accepted).toBe(true);
      state = result.state;
      lastEvents = result.events;
    }
    expect(state.run.achievements.unlockedIds).toContain("collect50Hydrogen");
    expect(state.run.cash).toBe(20);
    expect(lastEvents).toContainEqual({
      type: "achievement.unlocked",
      achievementId: "collect50Hydrogen",
    });
    const next = transition(state, { type: "resource.collect", goodId: "hydrogen" });
    expect(next.state.run.cash).toBe(20);
    expect(next.events.some((event) => event.type === "achievement.unlocked")).toBe(false);
  });

  it("saves deterministic forced random events and their negative-event history", () => {
    const start = createInitialGameState({ pioneerName: "Event", seed: 511 });
    const result = transition(start, { type: "random-event.force", eventId: "scienceTheft" });
    expect(result.accepted).toBe(true);
    expect(result.state.run.researchPoints).toBe(25);
    expect(result.state.run.randomEvents.history.at(-1)).toMatchObject({
      id: "scienceTheft",
      negative: true,
    });
    const duplicate = transition(result.state, {
      type: "random-event.force",
      eventId: "scienceTheft",
    });
    expect(duplicate.accepted).toBe(true);
    expect(duplicate.state.run.randomEvents.history).toHaveLength(2);
  });

  it("reveals a capped news prize and prevents claiming it twice", () => {
    const start = createInitialGameState({ pioneerName: "Ticker", seed: 512 });
    const ticker = transition(start, { type: "news.ticker.force", category: "prize", id: 2000 });
    expect(ticker.accepted).toBe(true);
    expect(starTypeForSystem(ticker.state.run.space.currentSystemId)).toBe("B");
    const entry = ticker.state.run.newsTicker.entries.at(-1);
    expect(entry?.prizeAmount).toBeGreaterThan(0);
    const hydrogenBeforeClaim = ticker.state.run.goods.hydrogen.quantity;
    const claim = transition(ticker.state, { type: "news.prize.claim", id: 2000 });
    expect(claim.accepted).toBe(true);
    const prize = claim.events.find((event) => event.type === "news.prize.claimed");
    expect(prize?.type).toBe("news.prize.claimed");
    if (prize?.type === "news.prize.claimed") {
      expect(prize.amount).toBe(entry?.prizeAmount);
      expect(claim.state.run.goods.hydrogen.quantity - hydrogenBeforeClaim).toBe(prize.amount);
    }
    expect(claim.state.run.goods.hydrogen.quantity).toBeLessThanOrEqual(
      claim.state.run.goods.hydrogen.storageCapacity / 10,
    );
    if (prize?.type === "news.prize.claimed") {
      expect(claim.state.run.goodsProducedThisRun[prize.goodId]).toBe(prize.amount);
      expect(claim.state.statistics.lifetimeGoodsProducedByGood[prize.goodId]).toBe(prize.amount);
      expect(claim.state.statistics.lifetimeGoodsProduced).toBe(prize.amount);
    }
    const duplicate = transition(claim.state, { type: "news.prize.claim", id: 2000 });
    expect(duplicate.accepted).toBe(false);
  });

  it("caps a rolled prize to the room remaining when the player claims it", () => {
    const start = createInitialGameState({ pioneerName: "Ticker claim room", seed: 521 });
    const offer = transition(start, { type: "news.ticker.force", category: "prize", id: 2000 });
    expect(offer.accepted).toBe(true);
    const roomAtClaim = 3;
    const offeredAmount = 10;
    const stateAtClaim = {
      ...offer.state,
      run: {
        ...offer.state.run,
        goods: {
          ...offer.state.run.goods,
          hydrogen: {
            ...offer.state.run.goods.hydrogen,
            quantity: offer.state.run.goods.hydrogen.storageCapacity - roomAtClaim,
          },
        },
        newsTicker: {
          ...offer.state.run.newsTicker,
          entries: offer.state.run.newsTicker.entries.map((entry) =>
            entry.id === 2000 ? { ...entry, prizeAmount: offeredAmount } : entry,
          ),
        },
      },
    };
    const offeredEntry = stateAtClaim.run.newsTicker.entries.find((entry) => entry.id === 2000)!;
    expect(offeredEntry.prizeAmount).toBeGreaterThan(roomAtClaim);

    const claim = transition(stateAtClaim, { type: "news.prize.claim", id: 2000 });
    expect(claim.accepted).toBe(true);
    expect(claim.events).toContainEqual({
      type: "news.prize.claimed",
      id: 2000,
      goodId: "hydrogen",
      amount: roomAtClaim,
    });
    expect(claim.state.run.goods.hydrogen.quantity).toBe(
      claim.state.run.goods.hydrogen.storageCapacity,
    );
    expect(claim.state.run.newsTicker.entries.find((entry) => entry.id === 2000)).toMatchObject({
      prizeAmount: roomAtClaim,
      claimed: true,
    });
  });

  it("rejects a prize claim without changing state when its resource store is full", () => {
    const start = createInitialGameState({ pioneerName: "Ticker full store", seed: 522 });
    const offer = transition(start, { type: "news.ticker.force", category: "prize", id: 2000 });
    expect(offer.accepted).toBe(true);
    const stateAtClaim = {
      ...offer.state,
      run: {
        ...offer.state.run,
        goods: {
          ...offer.state.run.goods,
          hydrogen: {
            ...offer.state.run.goods.hydrogen,
            quantity: offer.state.run.goods.hydrogen.storageCapacity,
          },
        },
      },
    };

    expect(checkNewsPrizeClaim(stateAtClaim, 2000)).toBe(false);
    const claim = transition(stateAtClaim, { type: "news.prize.claim", id: 2000 });
    expect(claim.accepted).toBe(false);
    expect(claim.events).toEqual([]);
    expect(claim.state).toBe(stateAtClaim);
  });

  it("credits fractional prize room by the exact balance delta and production totals", () => {
    const start = createInitialGameState({ pioneerName: "Ticker fractional room", seed: 523 });
    const offer = transition(start, { type: "news.ticker.force", category: "prize", id: 2000 });
    expect(offer.accepted).toBe(true);
    const roomAtClaim = 0.5;
    const offeredAmount = 10;
    const stateAtClaim = {
      ...offer.state,
      run: {
        ...offer.state.run,
        goods: {
          ...offer.state.run.goods,
          hydrogen: {
            ...offer.state.run.goods.hydrogen,
            quantity: offer.state.run.goods.hydrogen.storageCapacity - roomAtClaim,
          },
        },
        newsTicker: {
          ...offer.state.run.newsTicker,
          entries: offer.state.run.newsTicker.entries.map((entry) =>
            entry.id === 2000 ? { ...entry, prizeAmount: offeredAmount } : entry,
          ),
        },
      },
    };
    const offeredEntry = stateAtClaim.run.newsTicker.entries.find((entry) => entry.id === 2000)!;
    const quantityBefore = stateAtClaim.run.goods.hydrogen.quantity;
    const producedBefore = stateAtClaim.run.goodsProducedThisRun.hydrogen;
    const lifetimeGoodBefore = stateAtClaim.statistics.lifetimeGoodsProducedByGood.hydrogen;
    const lifetimeTotalBefore = stateAtClaim.statistics.lifetimeGoodsProduced;

    const claim = transition(stateAtClaim, {
      type: "news.prize.claim",
      id: 2000,
      simulationMs: offeredEntry.simulationMs,
    });

    expect(claim.accepted).toBe(true);
    const prize = claim.events.find((event) => event.type === "news.prize.claimed");
    expect(prize?.type).toBe("news.prize.claimed");
    if (prize?.type !== "news.prize.claimed") return;
    const balanceDelta = claim.state.run.goods.hydrogen.quantity - quantityBefore;
    expect(prize.amount).toBe(roomAtClaim);
    expect(balanceDelta).toBe(prize.amount);
    expect(claim.state.run.goodsProducedThisRun.hydrogen - producedBefore).toBe(balanceDelta);
    expect(
      claim.state.statistics.lifetimeGoodsProducedByGood.hydrogen - lifetimeGoodBefore,
    ).toBe(balanceDelta);
    expect(claim.state.statistics.lifetimeGoodsProduced - lifetimeTotalBefore).toBe(balanceDelta);
    expect(
      claim.state.run.newsTicker.entries.find(
        (entry) => entry.id === 2000 && entry.simulationMs === offeredEntry.simulationMs,
      ),
    ).toMatchObject({ prizeAmount: balanceDelta, claimed: true });
  });

  it("claims repeated prize IDs by displayed-entry time without blocking the other offer", () => {
    const start = createInitialGameState({ pioneerName: "Ticker repeated prizes", seed: 524 });
    const firstOffer = transition(start, {
      type: "news.ticker.force",
      category: "prize",
      id: 2000,
    });
    expect(firstOffer.accepted).toBe(true);
    const firstEntry = firstOffer.state.run.newsTicker.entries.at(-1)!;
    const laterOfferState = {
      ...firstOffer.state,
      run: {
        ...firstOffer.state.run,
        clock: {
          ...firstOffer.state.run.clock,
          simulationMs: firstEntry.simulationMs + 1_000,
        },
      },
    };
    const secondOffer = transition(laterOfferState, {
      type: "news.ticker.force",
      category: "prize",
      id: 2000,
    });
    expect(secondOffer.accepted).toBe(true);
    const secondEntry = secondOffer.state.run.newsTicker.entries.at(-1)!;
    expect(secondEntry.id).toBe(firstEntry.id);
    expect(secondEntry.simulationMs).not.toBe(firstEntry.simulationMs);

    const secondClaim = transition(secondOffer.state, {
      type: "news.prize.claim",
      id: secondEntry.id,
      simulationMs: secondEntry.simulationMs,
    });
    expect(secondClaim.accepted).toBe(true);
    expect(
      secondClaim.state.run.newsTicker.entries.find(
        (entry) => entry.id === firstEntry.id && entry.simulationMs === secondEntry.simulationMs,
      )?.claimed,
    ).toBe(true);
    expect(
      secondClaim.state.run.newsTicker.entries.find(
        (entry) => entry.id === firstEntry.id && entry.simulationMs === firstEntry.simulationMs,
      )?.claimed,
    ).toBe(false);
    expect(secondClaim.state.run.newsTicker.claimedPrizeIds).toEqual([firstEntry.id]);
    expect(checkNewsPrizeClaim(secondClaim.state, firstEntry.id, firstEntry.simulationMs)).toBe(
      true,
    );

    const firstClaim = transition(secondClaim.state, {
      type: "news.prize.claim",
      id: firstEntry.id,
      simulationMs: firstEntry.simulationMs,
    });
    expect(firstClaim.accepted).toBe(true);
    expect(
      firstClaim.state.run.newsTicker.entries
        .filter((entry) => entry.id === firstEntry.id)
        .every((entry) => entry.claimed),
    ).toBe(true);
    expect(firstClaim.state.run.newsTicker.claimedPrizeIds).toEqual([firstEntry.id]);
  });

  it("can generate an ordinary headline again after every headline ID has been seen", () => {
    const seenHeadlineIds = Array.from({ length: 200 }, (_, id) => id);
    const start = createInitialGameState({ pioneerName: "Ticker repeats", seed: 520 });
    const state = {
      ...start,
      run: {
        ...start.run,
        newsTicker: { ...start.run.newsTicker, seenIds: seenHeadlineIds },
      },
    };

    const result = forceNewsTicker(state, "headline");

    expect(result).not.toBeNull();
    const entry = result!.state.run.newsTicker.entries.at(-1)!;
    expect(entry.category).toBe("headline");
    expect(seenHeadlineIds).toContain(entry.id);
    expect(result!.state.run.newsTicker.seenIds).toEqual(seenHeadlineIds);
  });

  it("keeps the exact prize amount and localized here action in fallback copy", () => {
    const start = createInitialGameState({ pioneerName: "Ticker", seed: 514 });
    const ticker = transition(start, { type: "news.ticker.force", category: "prize", id: 2000 });
    const entry = ticker.state.run.newsTicker.entries.at(-1)!;

    for (const locale of LOCALE_IDS) {
      const fallbackCopy = newsEntryText(locale, entry);
      expect(fallbackCopy).toContain(new Intl.NumberFormat(locale).format(entry.prizeAmount ?? 0));
      expect(fallbackCopy).toContain(metaSignalText(locale, "here"));
    }
  });

  it("waits for one full ticker scroll and its randomized delay before the next message", () => {
    const start = createInitialGameState({ pioneerName: "Ticker timing", seed: 515 });
    const firstDelay = start.run.newsTicker.remainingMs;
    const first = advanceNewsTicker(start, firstDelay);
    expect(first.state.run.newsTicker.entries).toHaveLength(1);
    expect(first.events).toHaveLength(1);
    expect(first.state.run.newsTicker.remainingMs).toBeGreaterThanOrEqual(60_000);
    expect(first.state.run.newsTicker.remainingMs).toBeLessThanOrEqual(75_000);

    const afterScroll = advanceNewsTicker(first.state, 40_000);
    expect(afterScroll.state.run.newsTicker.entries).toHaveLength(1);
    expect(afterScroll.state.run.newsTicker.remainingMs).toBeGreaterThanOrEqual(20_000);
    expect(afterScroll.state.run.newsTicker.remainingMs).toBeLessThanOrEqual(35_000);

    const oneMillisecondEarly = advanceNewsTicker(
      afterScroll.state,
      afterScroll.state.run.newsTicker.remainingMs - 1,
    );
    expect(oneMillisecondEarly.state.run.newsTicker.entries).toHaveLength(1);
    const next = advanceNewsTicker(oneMillisecondEarly.state, 1);
    expect(next.state.run.newsTicker.entries).toHaveLength(2);
    expect(next.state.run.newsTicker.remainingMs).toBeGreaterThanOrEqual(60_000);
    expect(next.state.run.newsTicker.remainingMs).toBeLessThanOrEqual(75_000);

    const catchUp = advanceNewsTicker(next.state, 5 * 60_000);
    expect(catchUp.state.run.newsTicker.entries).toHaveLength(3);
    expect(catchUp.events).toHaveLength(1);
  });

  it("applies a one-off bulletin exactly once and tracks distinct visual effects", () => {
    let state = createInitialGameState({ pioneerName: "Ticker", seed: 513 });
    const bulletin = transition(state, { type: "news.ticker.force", category: "oneOff", id: 3013 });
    expect(bulletin.accepted).toBe(true);
    const claim = transition(bulletin.state, { type: "news.prize.claim", id: 3013 });
    expect(claim.accepted).toBe(true);
    expect(claim.state.permanent.ascendencyPoints).toBe(1);
    expect(claim.state.statistics.lifetimeAscendencyPointsGained).toBe(1);
    expect(transition(claim.state, { type: "news.prize.claim", id: 3013 }).accepted).toBe(false);
    const wacky = transition(state, { type: "news.ticker.force", category: "wacky", id: 1000 });
    expect(wacky.accepted).toBe(true);
    state = wacky.state;
    const activation = transition(state, { type: "news.wacky.activate", id: 1000 });
    expect(activation.accepted).toBe(true);
    state = activation.state;
    const repeatedWacky = transition(state, {
      type: "news.ticker.force",
      category: "wacky",
      id: 1000,
    });
    expect(repeatedWacky.accepted).toBe(true);
    expect(repeatedWacky.state.run.newsTicker.seenIds.filter((id) => id === 1000)).toHaveLength(1);
    expect(repeatedWacky.state.run.newsTicker.activatedWackyIds).toEqual([1000]);
    expect(state.run.newsTicker.seenIds.filter((id) => id === 1000)).toHaveLength(1);
    expect(state.run.newsTicker.activatedWackyIds).toEqual([1000]);
  });

  it("persists a consumed unclaimed one-off offer without treating it as claimed", () => {
    const start = createInitialGameState({ pioneerName: "Offer History", seed: 516 });
    const offer = transition(start, {
      type: "news.ticker.force",
      category: "oneOff",
      id: 3013,
    });
    expect(offer.accepted).toBe(true);
    expect(offer.state.permanent.ascendencyPoints).toBe(0);
    expect(offer.state.run.newsTicker.offeredOneOffIds).toEqual([3013]);
    expect(offer.state.run.newsTicker.claimedPrizeIds).not.toContain(3013);
    expect(offer.state.run.newsTicker.entries.at(-1)).toMatchObject({
      id: 3013,
      category: "oneOff",
      claimed: false,
    });

    const envelope = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000516",
      pioneerName: offer.state.run.pioneerName,
      createdAt: 0,
      savedAt: 1,
      revision: 1,
      state: offer.state,
    });
    const restored = decodeLocal(encodeLocal(envelope)).state;
    expect(restored.run.newsTicker.offeredOneOffIds).toEqual([3013]);
    expect(restored.run.newsTicker.claimedPrizeIds).not.toContain(3013);
    expect(checkNewsPrizeClaim(restored, 3013)).toBe(true);
    expect(
      transition(restored, { type: "news.ticker.force", category: "oneOff", id: 3013 }).accepted,
    ).toBe(false);
    expect(
      isValidGameState({
        ...restored,
        run: {
          ...restored.run,
          newsTicker: { ...restored.run.newsTicker, offeredOneOffIds: [3013, 3013] },
        },
      }),
    ).toBe(false);
    expect(
      isValidGameState({
        ...restored,
        run: {
          ...restored.run,
          newsTicker: { ...restored.run.newsTicker, offeredOneOffIds: [3014] },
        },
      }),
    ).toBe(false);
    expect(
      isValidGameState({
        ...restored,
        run: {
          ...restored.run,
          newsTicker: { ...restored.run.newsTicker, offeredOneOffIds: [3013.5] },
        },
      }),
    ).toBe(false);

    const claim = transition(restored, { type: "news.prize.claim", id: 3013 });
    expect(claim.accepted).toBe(true);
    expect(claim.state.permanent.ascendencyPoints).toBe(1);
    expect(claim.state.run.newsTicker.offeredOneOffIds).toEqual([3013]);
    expect(claim.state.run.newsTicker.claimedPrizeIds).toContain(3013);
    expect(claim.state.run.newsTicker.entries.at(-1)?.claimed).toBe(true);
    expect(transition(claim.state, { type: "news.prize.claim", id: 3013 }).accepted).toBe(false);
  });

  it("selects a least-used eligible manuscript, records its clue, and reloads the history", () => {
    const first = systemIdForStar(91, 1);
    const second = systemIdForStar(91, 2);
    const third = systemIdForStar(91, 3);
    const reported = systemIdForStar(91, 4);
    const allTemplates = [...MANUSCRIPT_CLUE_NEWS_IDS];
    const start = withManuscripts(
      createInitialGameState({ pioneerName: "Clue History", seed: 618 }),
      [
        manuscriptRecord(1, first, systemIdForStar(91, 11)),
        manuscriptRecord(2, second, systemIdForStar(91, 12)),
        manuscriptRecord(3, third, systemIdForStar(91, 13)),
        manuscriptRecord(4, reported, systemIdForStar(91, 14), true),
      ],
      {
        [first]: [4000, 4001],
        [second]: [4000],
        [third]: [4000, 4001, 4002],
      },
      allTemplates,
    );
    expect(isValidGameState(start)).toBe(true);

    const result = transition(start, { type: "news.ticker.force", category: "manuscriptClue" });
    expect(result.accepted).toBe(true);
    const entry = result.state.run.newsTicker.entries.at(-1)!;
    expect(entry.clueSystemId).toBe(second);
    expect(entry.id).not.toBe(4000);
    expect(result.state.permanent.megastructures.manuscriptCluesShown[second]).toEqual([
      4000,
      entry.id,
    ]);
    expect(result.state.permanent.megastructures.manuscriptCluesShown[reported]).toBeUndefined();
    expect(
      isValidGameState({
        ...result.state,
        permanent: {
          ...result.state.permanent,
          megastructures: {
            ...result.state.permanent.megastructures,
            manuscriptCluesShown: { [second]: [entry.id, entry.id] },
          },
        },
      }),
    ).toBe(false);
    expect(
      isValidGameState({
        ...result.state,
        permanent: {
          ...result.state.permanent,
          megastructures: {
            ...result.state.permanent.megastructures,
            manuscriptCluesShown: { [second]: [4999] },
          },
        },
      }),
    ).toBe(false);
    expect(
      isValidGameState({
        ...result.state,
        permanent: {
          ...result.state.permanent,
          megastructures: {
            ...result.state.permanent.megastructures,
            manuscriptCluesShown: { [systemIdForStar(91, 90)]: [entry.id] },
          },
        },
      }),
    ).toBe(false);

    const envelope = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000618",
      pioneerName: result.state.run.pioneerName,
      createdAt: 0,
      savedAt: 1,
      revision: 1,
      state: result.state,
    });
    const reloaded = decodeLocal(encodeLocal(envelope)).state;
    expect(reloaded.permanent.megastructures.manuscriptCluesShown[second]).toEqual([
      4000,
      entry.id,
    ]);
  });

  it("filters reported, invalid, and exhausted manuscripts without globally blocking clue templates", () => {
    const invalidFactory = "not-a-system-id" as SystemId;
    const active = systemIdForStar(92, 1);
    const exhausted = systemIdForStar(92, 2);
    const reported = systemIdForStar(92, 3);
    const activeShown = MANUSCRIPT_CLUE_NEWS_IDS.slice(1);
    const invalidState = withManuscripts(
      createInitialGameState({ pioneerName: "Clue Eligibility", seed: 619 }),
      [
        manuscriptRecord(1, systemIdForStar(92, 4), invalidFactory),
        manuscriptRecord(2, active, systemIdForStar(92, 12)),
        manuscriptRecord(3, exhausted, systemIdForStar(92, 13)),
        manuscriptRecord(4, reported, systemIdForStar(92, 14), true),
      ],
      {
        [active]: activeShown,
        [exhausted]: [...MANUSCRIPT_CLUE_NEWS_IDS],
      },
      [...MANUSCRIPT_CLUE_NEWS_IDS],
    );
    expect(isValidGameState(invalidState)).toBe(false);

    const clue = forceNewsTicker(
      invalidState as unknown as GameState,
      "manuscriptClue",
      MANUSCRIPT_CLUE_NEWS_IDS[0],
    );
    expect(clue).not.toBeNull();
    expect(clue!.state.run.newsTicker.entries.at(-1)).toMatchObject({
      id: MANUSCRIPT_CLUE_NEWS_IDS[0],
      clueSystemId: active,
    });
    expect(clue!.state.permanent.megastructures.manuscriptCluesShown[active]).toEqual([
      ...activeShown,
      MANUSCRIPT_CLUE_NEWS_IDS[0],
    ]);
    expect(forceNewsTicker(clue!.state, "manuscriptClue")).toBeNull();
  });

  it("awards onboarding and lifetime achievements through accepted engine commands", () => {
    const start = createInitialGameState({ pioneerName: "Long Run", seed: 514 });
    const onboarding = transition(start, { type: "onboarding.complete" });
    expect(onboarding.accepted).toBe(true);
    expect(onboarding.state.permanent.achievements.unlockedIds).toContain("completeOnboarding");

    const activeHours = {
      ...onboarding.state,
      statistics: { ...onboarding.state.statistics, lifetimeActiveMs: 50 * 60 * 60 * 1000 },
    };
    const longRun = transition(activeHours, { type: "onboarding.complete" });
    expect(longRun.state.permanent.achievements.unlockedIds).toContain("have50HoursWithOnePioneer");
    expect(longRun.state.permanent.ascendencyPoints).toBe(50);
    expect(longRun.state.statistics.lifetimeAscendencyPointsGained).toBe(50);
  });

  it("records all nine selected themes permanently, awards their milestone once, and reloads cleanly", () => {
    let state = createInitialGameState({ pioneerName: "Palette", seed: 517 });
    expect(state.run.newsTicker.remainingMs).toBeGreaterThanOrEqual(20_000);
    expect(state.run.newsTicker.remainingMs).toBeLessThanOrEqual(35_000);
    expect(
      transition(state, { type: "settings.update", patch: { themeId: "unknown-theme" as never } })
        .accepted,
    ).toBe(false);
    for (const themeId of THEME_IDS.slice(1)) {
      const result = transition(state, { type: "settings.update", patch: { themeId } });
      expect(result.accepted).toBe(true);
      state = result.state;
    }
    expect(state.permanent.achievements.themeIdsTried).toEqual(THEME_IDS);
    expect(state.permanent.achievements.unlockedIds).toContain("tryAllThemes");
    expect(isValidGameState(state)).toBe(true);
    const envelope = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000517",
      pioneerName: state.run.pioneerName,
      createdAt: 0,
      savedAt: 1,
      revision: 1,
      state,
    });
    const reloaded = decodeLocal(encodeLocal(envelope)).state;
    expect(reloaded.settings.themeId).toBe("space");
    expect(reloaded.permanent.achievements.themeIdsTried).toEqual(THEME_IDS);
    expect(
      transition(reloaded, { type: "settings.update", patch: { themeId: "terminal" } }).events,
    ).not.toContainEqual({ type: "achievement.unlocked", achievementId: "tryAllThemes" });
  });

  it("keeps endless summer sunny on ten-second weather cycles", () => {
    const start = createInitialGameState({ pioneerName: "Summer", seed: 518 });
    const summer = transition(start, { type: "random-event.force", eventId: "endlessSummer" });
    expect(summer.accepted).toBe(true);
    expect(summer.state.run.space.currentSystemWeather).toBe("clear");
    expect(summer.state.run.timers[STAR_WEATHER_TIMER_ID]?.durationMs).toBe(10_000);
    const summerDuration = summer.state.run.randomEvents.activeEffects.find(
      (effect) => effect.id === "endlessSummer",
    )!.remainingMs;
    const nextCycle = advanceRandomEvents(summer.state, 1_000).state;
    expect(
      nextCycle.run.randomEvents.activeEffects.find((effect) => effect.id === "endlessSummer")
        ?.remainingMs,
    ).toBe(summerDuration - 1_000);
  });

  it("reshifts Black Hole instability after each elapsed minute and samples a new ticker interval", () => {
    const start = createInitialGameState({ pioneerName: "Instability", seed: 519 });
    const researched = {
      ...start,
      permanent: {
        ...start.permanent,
        blackHole: { ...start.permanent.blackHole, discovered: true, researched: true },
      },
    };
    const triggered = transition(researched, {
      type: "random-event.force",
      eventId: "blackHoleInstability",
    });
    expect(triggered.accepted).toBe(true);
    const before = triggered.state.run.random.draws;
    const shifted = advanceRandomEvents(triggered.state, 60_000);
    const effect = shifted.state.run.randomEvents.activeEffects.find(
      (active) => active.id === "blackHoleInstability",
    );
    expect(effect?.nextShiftInMs).toBe(60_000);
    expect(shifted.state.run.random.draws).toBe(before + 2);
    const ticker = transition(start, { type: "news.ticker.force", category: "headline" });
    expect(ticker.state.run.newsTicker.remainingMs).toBeGreaterThanOrEqual(60_000);
    expect(ticker.state.run.newsTicker.remainingMs).toBeLessThanOrEqual(75_000);
  });

  it("uses rebirth count and current-star titanium precipitation for their achievements", () => {
    const start = createInitialGameState({ pioneerName: "Long Run", seed: 515 });
    const atTenRuns = {
      ...start,
      permanent: { ...start.permanent, rebirthCount: 10 },
    };
    const conquered = transition(atTenRuns, { type: "onboarding.complete" });
    expect(conquered.state.permanent.achievements.unlockedIds).toContain("conquer10StarSystems");
    expect(conquered.state.permanent.ascendencyPoints).toBe(10);

    const collectingTitanium = {
      ...start,
      run: {
        ...start.run,
        space: {
          ...start.run.space,
          precipitationCollectedThisRun: 100,
          systemProfiles: start.run.space.systemProfiles.map((profile) => ({
            ...profile,
            precipitationGoodId: "titanium" as const,
          })),
        },
      },
    };
    const collected = transition(collectingTitanium, { type: "onboarding.complete" });
    expect(collected.accepted).toBe(true);
    expect(collected.state.permanent.achievements.unlockedIds).toContain(
      "collect100TitaniumAsPrecipitation",
    );
    expect(collected.state.permanent.ascendencyPoints).toBe(50);
  });
});
