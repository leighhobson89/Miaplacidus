import { describe, expect, it, vi } from "vitest";
import { withGameAudio } from "../../src/app/audio";
import { createInitialGameState } from "../../src/engine/state";
import { createGameStore } from "../../src/engine/store";

describe("audio store event forwarding", () => {
  it("forwards accepted dispatch and batch events exactly once, including timer-driven results", () => {
    const engineStore = createGameStore(createInitialGameState(), { clock: { now: () => 0 } });
    const store = withGameAudio(engineStore);
    const batches: string[][] = [];
    store.subscribeEvents((events) => batches.push(events.map(({ type }) => type)));

    const updated = store.dispatch({
      type: "settings.update",
      patch: { newsTickerEnabled: false },
    });
    expect(updated.accepted).toBe(true);
    expect(batches).toEqual([["settings.changed"]]);

    const batch = store.dispatchBatch([
      { type: "settings.update", patch: { notificationsEnabled: false } },
      { type: "space.weather.set-condition", condition: "rain" },
    ]);
    expect(batch.every((result) => result.accepted)).toBe(true);
    expect(batches).toHaveLength(2);
    expect(batches[1]).toEqual(["settings.changed", "space.weather.changed"]);

    const weatherTimer = Object.values(store.getState().run.timers).find(
      (timer) => timer.domain === "weather",
    )!;
    store.dispatch({
      type: "clock.advance",
      input: { wallNowMs: 0, foreground: true },
    });
    const clockResult = store.dispatch({
      type: "clock.advance",
      input: { wallNowMs: weatherTimer.durationMs + 1, foreground: false },
    });
    expect(clockResult.accepted).toBe(true);
    expect(clockResult.events.some((event) => event.type === "space.weather.changed")).toBe(true);
    expect(batches[2]).toEqual(clockResult.events.map(({ type }) => type));
    store.dispose();
  });

  it("stops active effect and ambience tracks when the session audio store is disposed", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;

      constructor(_source: string) {
        super();
        MockAudio.instances.push(this);
      }

      play() {
        this.paused = false;
        return Promise.resolve();
      }

      pause() {
        this.paused = true;
      }
    }

    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
    const initial = createInitialGameState();
    const state = {
      ...initial,
      settings: {
        ...initial.settings,
        backgroundAudioEnabled: true,
        soundEffectsEnabled: true,
      },
    };
    const store = withGameAudio(createGameStore(state, { clock: { now: () => 0 } }));

    try {
      const result = store.dispatch({ type: "space.weather.set-condition", condition: "rain" });
      expect(result.accepted).toBe(true);
      expect(MockAudio.instances.some((audio) => audio.loop)).toBe(true);
      expect(MockAudio.instances.some((audio) => !audio.loop)).toBe(true);

      store.dispose();

      expect(MockAudio.instances.every((audio) => audio.paused)).toBe(true);
      expect(MockAudio.instances.every((audio) => audio.currentTime === 0)).toBe(true);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });
});
