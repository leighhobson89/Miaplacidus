import { describe, expect, it } from "vitest";
import { createInitialGameState, isValidGameState } from "../../src/engine/state";
import { createGameStore } from "../../src/engine/store";

describe("game store publication", () => {
  it("does not publish an eventless transition that leaves state unchanged", () => {
    const store = createGameStore(createInitialGameState({ seed: 1122 }), {
      clock: { now: () => 0 },
    });
    let publications = 0;
    store.subscribe(() => {
      publications += 1;
    });

    const firstVisit = store.dispatch({ type: "navigation.attention.clear", pageId: "settings" });
    const publishedSnapshot = store.getSnapshot();
    const repeatedVisit = store.dispatch({
      type: "navigation.attention.clear",
      pageId: "settings",
    });

    expect(firstVisit.accepted).toBe(true);
    expect(repeatedVisit.accepted).toBe(true);
    expect(repeatedVisit.state).toBe(firstVisit.state);
    expect(store.getState()).toBe(firstVisit.state);
    expect(store.getSnapshot()).toBe(publishedSnapshot);
    expect(publications).toBe(1);
  });

  it("keeps store-owned clock transitions fully validated", () => {
    const store = createGameStore(createInitialGameState({ seed: 1177 }), {
      clock: { now: () => 0 },
    });

    const firstTick = store.dispatch({
      type: "clock.advance",
      input: { wallNowMs: 250, foreground: true, maxForegroundSteps: 1 },
    });
    const secondTick = store.dispatch({
      type: "clock.advance",
      input: { wallNowMs: 500, foreground: true, maxForegroundSteps: 1 },
    });

    expect(firstTick.accepted).toBe(true);
    expect(secondTick.accepted).toBe(true);
    expect(isValidGameState(firstTick.state)).toBe(true);
    expect(isValidGameState(secondTick.state)).toBe(true);
    expect(store.getState()).toBe(secondTick.state);
  });

  it("validates and publishes a batch of first visits once", () => {
    const store = createGameStore(createInitialGameState({ seed: 2233 }), {
      clock: { now: () => 0 },
    });
    let publications = 0;
    store.subscribe(() => {
      publications += 1;
    });

    const results = store.dispatchBatch([
      { type: "navigation.attention.clear", pageId: "settings" },
      { type: "navigation.attention.clear", pageId: "settings-visual" },
    ]);

    expect(results.every((result) => result.accepted)).toBe(true);
    expect(store.getState().permanent.navigationVisitedIds).toEqual(
      expect.arrayContaining(["settings", "settings-visual"]),
    );
    expect(isValidGameState(store.getState())).toBe(true);
    expect(publications).toBe(1);
  });

  it("keeps full state validation for development reducers", () => {
    const initial = createInitialGameState({ seed: 3344 });
    const store = createGameStore(initial, { clock: { now: () => 0 } });
    const invalidState = { ...initial, unexpected: true };

    const result = store.dispatchReducer!(() => ({
      accepted: true,
      state: invalidState as typeof initial,
      events: [],
    }));

    expect(result).toMatchObject({ accepted: false, failure: { code: "invalid-state" } });
    expect(store.getState()).toBe(initial);
  });
});
