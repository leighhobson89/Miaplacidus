import { describe, expect, it, vi } from "vitest";
import { GALAXY_SEED_DEFAULT, systemIdForStar } from "../../src/content/ids";
import {
  ROCKET_FUEL_PUMP_BASE_COST,
  ROCKET_PART_REQUIREMENTS,
  STARSHIP_MODULES,
  type AsteroidState,
} from "../../src/content/space";
import { withGameAudio } from "../../src/app/audio";
import { createInitialGameState, isValidGameState, type GameState } from "../../src/engine/state";
import { createGameStore } from "../../src/engine/store";

describe("audio store event forwarding", () => {
  it("plays telescope cues when scans start and destination-system scans are performed", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      readonly source: string;
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;
      playCount = 0;

      constructor(source: string) {
        super();
        this.source = source;
        MockAudio.instances.push(this);
      }

      play() {
        this.paused = false;
        this.playCount += 1;
        return Promise.resolve();
      }

      pause() {
        this.paused = true;
      }
    }

    const audioFiles = () =>
      MockAudio.instances
        .filter((audio) => audio.playCount > 0)
        .map((audio) => audio.source.split("/").at(-1));
    const surveyCueFiles = () =>
      audioFiles().filter((file) => file === "asteroidScan.mp3" || file === "starStudy.mp3");

    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
    try {
      const initial = createInitialGameState({ seed: 91 });
      const surveyState: GameState = {
        ...initial,
        run: {
          ...initial.run,
          economy: {
            ...initial.run.economy,
            researchedTechnologies: ["atmosphericTelescopes"],
            revealedTechnologies: [
              ...initial.run.economy.revealedTechnologies,
              "atmosphericTelescopes",
            ],
            power: { ...initial.run.economy.power, infinitePower: true },
          },
          space: { ...initial.run.space, telescopeBuilt: true },
        },
        settings: {
          ...initial.settings,
          backgroundAudioEnabled: false,
          soundEffectsEnabled: true,
        },
      };
      expect(isValidGameState(surveyState)).toBe(true);
      const surveyStore = withGameAudio(createGameStore(surveyState, { clock: { now: () => 0 } }));

      try {
        const scan = surveyStore.dispatch({ type: "space.telescope.scan.start" });
        expect(scan.events).toContainEqual(
          expect.objectContaining({ type: "space.survey.started", survey: "asteroids" }),
        );
        expect(surveyCueFiles()).toEqual(["asteroidScan.mp3"]);

        const scanTimer = Object.values(surveyStore.getState().run.timers).find(
          (timer) => timer.domain === "survey",
        )!;
        surveyStore.dispatch({ type: "timer.complete", timerId: scanTimer.id });
        expect(surveyCueFiles()).toEqual(["asteroidScan.mp3"]);

        const study = surveyStore.dispatch({ type: "space.telescope.study.start" });
        expect(study.events).toContainEqual(
          expect.objectContaining({ type: "space.survey.started", survey: "stars" }),
        );
        expect(surveyCueFiles()).toEqual(["asteroidScan.mp3", "starStudy.mp3"]);

        const studyTimer = Object.values(surveyStore.getState().run.timers).find(
          (timer) => timer.domain === "survey",
        )!;
        surveyStore.dispatch({ type: "timer.complete", timerId: studyTimer.id });
        expect(surveyCueFiles()).toEqual(["asteroidScan.mp3", "starStudy.mp3"]);
      } finally {
        surveyStore.dispose();
      }

      MockAudio.instances = [];
      const destinationId = systemIdForStar(GALAXY_SEED_DEFAULT, 0);
      const starshipState: GameState = {
        ...initial,
        run: {
          ...initial.run,
          space: {
            ...initial.run.space,
            starshipModules: {
              ...initial.run.space.starshipModules,
              stellarScanner: { builtParts: STARSHIP_MODULES.stellarScanner.parts },
            },
            starship: {
              destinationSystemId: destinationId,
              phase: "orbiting",
              timerId: null,
              durationMs: 1,
              antimatterSpent: 1,
              travelDistanceLy: null,
            },
          },
        },
        settings: {
          ...initial.settings,
          backgroundAudioEnabled: false,
          soundEffectsEnabled: true,
        },
      };
      expect(isValidGameState(starshipState)).toBe(true);
      const starshipStore = withGameAudio(
        createGameStore(starshipState, { clock: { now: () => 0 } }),
      );

      try {
        const scan = starshipStore.dispatch({ type: "space.starship.system.scan" });
        expect(scan.events).toContainEqual(
          expect.objectContaining({
            type: "space.starship.system.scanned",
            systemId: destinationId,
          }),
        );
        expect(audioFiles()).toEqual(["asteroidScan.mp3"]);
      } finally {
        starshipStore.dispose();
      }
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("uses the fuel cue for pump purchase and switch cues for pump toggles", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      readonly source: string;
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;
      playCount = 0;

      constructor(source: string) {
        super();
        this.source = source;
        MockAudio.instances.push(this);
      }

      play() {
        this.paused = false;
        this.playCount += 1;
        return Promise.resolve();
      }

      pause() {
        this.paused = true;
      }
    }

    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
    const initial = createInitialGameState();
    const rocketState: GameState = {
      ...initial,
      run: {
        ...initial.run,
        cash: ROCKET_FUEL_PUMP_BASE_COST.rocket1 * 2,
        economy: {
          ...initial.run.economy,
          researchedTechnologies: ["advancedFuels"],
          revealedTechnologies: [...initial.run.economy.revealedTechnologies, "advancedFuels"],
          power: { ...initial.run.economy.power, infinitePower: true },
        },
        space: {
          ...initial.run.space,
          launchPadBuilt: true,
          rockets: {
            ...initial.run.space.rockets,
            rocket1: {
              ...initial.run.space.rockets.rocket1,
              builtParts: ROCKET_PART_REQUIREMENTS.rocket1,
              phase: "ready",
              fuelQuantity: 0,
            },
          },
        },
      },
      settings: {
        ...initial.settings,
        backgroundAudioEnabled: false,
        soundEffectsEnabled: true,
      },
    };
    expect(isValidGameState(rocketState)).toBe(true);
    const store = withGameAudio(createGameStore(rocketState, { clock: { now: () => 0 } }));
    const audioFiles = () =>
      MockAudio.instances
        .filter((audio) => audio.playCount > 0)
        .map((audio) => audio.source.split("/").at(-1));

    try {
      const purchased = store.dispatch({ type: "space.rocket.pump.purchase", rocketId: "rocket1" });
      expect(purchased.events).toContainEqual(
        expect.objectContaining({ type: "space.rocket.pump.purchased", rocketId: "rocket1" }),
      );
      expect(audioFiles()).toEqual(["fuelRocket.mp3"]);

      const paused = store.dispatch({
        type: "space.rocket.pump.set-enabled",
        rocketId: "rocket1",
        enabled: false,
      });
      expect(paused.events).toContainEqual(
        expect.objectContaining({ type: "space.rocket.pump.changed", enabled: false }),
      );
      expect(audioFiles()).toEqual(["fuelRocket.mp3", "clickSwitch.mp3"]);

      const resumed = store.dispatch({
        type: "space.rocket.pump.set-enabled",
        rocketId: "rocket1",
        enabled: true,
      });
      expect(resumed.events).toContainEqual(
        expect.objectContaining({ type: "space.rocket.pump.changed", enabled: true }),
      );
      expect(audioFiles()).toEqual(["fuelRocket.mp3", "clickSwitch.mp3", "clickSwitch.mp3"]);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });

  it("plays the Black Hole activation cue when a recharge purchase makes it always-on", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      readonly source: string;
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;
      playCount = 0;

      constructor(source: string) {
        super();
        this.source = source;
        MockAudio.instances.push(this);
      }

      play() {
        this.paused = false;
        this.playCount += 1;
        return Promise.resolve();
      }

      pause() {
        this.paused = true;
      }
    }

    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
    const initial = createInitialGameState();
    const state: GameState = {
      ...initial,
      run: { ...initial.run, researchPoints: 1_000_000 },
      permanent: {
        ...initial.permanent,
        blackHole: {
          ...initial.permanent.blackHole,
          discovered: true,
          researched: true,
          rechargeMultiplier: 0.11,
        },
      },
      settings: {
        ...initial.settings,
        backgroundAudioEnabled: false,
        soundEffectsEnabled: true,
      },
    };
    expect(isValidGameState(state)).toBe(true);
    const store = withGameAudio(createGameStore(state, { clock: { now: () => 0 } }));

    try {
      const result = store.dispatch({ type: "black-hole.upgrade", upgradeId: "recharge" });
      expect(result.accepted).toBe(true);
      expect(result.state.permanent.blackHole.alwaysOn).toBe(true);
      expect(result.events).toContainEqual(
        expect.objectContaining({ type: "black-hole.upgrade-purchased", upgradeId: "recharge" }),
      );
      expect(
        MockAudio.instances
          .filter((audio) => audio.playCount > 0)
          .map((audio) => audio.source.split("/").at(-1)),
      ).toEqual(["blackHoleActivated.mp3"]);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });

  it("plays both reference power cues only when simulation first trips the grid", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      readonly source: string;
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;
      playCount = 0;

      constructor(source: string) {
        super();
        this.source = source;
        MockAudio.instances.push(this);
      }

      play() {
        this.paused = false;
        this.playCount += 1;
        return Promise.resolve();
      }

      pause() {
        this.paused = true;
      }
    }

    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
    const initial = createInitialGameState();
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        clock: { ...initial.run.clock, wallNowMs: 0 },
        economy: {
          ...initial.run.economy,
          power: { ...initial.run.economy.power, deficitMs: 9_750 },
        },
      },
      settings: {
        ...initial.settings,
        backgroundAudioEnabled: false,
        soundEffectsEnabled: true,
      },
    };
    const store = withGameAudio(createGameStore(state, { clock: { now: () => 0 } }));

    try {
      // Unlock audio, then isolate the cues generated by the power trip itself.
      store.dispatch({ type: "settings.update", patch: { newsTickerEnabled: false } });
      MockAudio.instances = [];

      const tripped = store.dispatch({
        type: "clock.advance",
        input: { wallNowMs: 250, foreground: true },
        tickPlan: { power: { generationPerSecond: 0, demandPerSecond: 1 } },
      });

      expect(tripped.accepted).toBe(true);
      expect(tripped.state.run.economy.power.tripped).toBe(true);
      expect(tripped.events.filter((event) => event.type === "economy.power.tripped")).toHaveLength(
        1,
      );
      expect(MockAudio.instances.map((audio) => audio.source)).toEqual(
        expect.arrayContaining([
          expect.stringContaining("powerOff.mp3"),
          expect.stringContaining("powerTripped.mp3"),
        ]),
      );
      expect(MockAudio.instances).toHaveLength(2);
      expect(MockAudio.instances.every((audio) => audio.playCount === 1)).toBe(true);

      const alreadyTripped = store.dispatch({
        type: "clock.advance",
        input: { wallNowMs: 500, foreground: true },
        tickPlan: { power: { generationPerSecond: 0, demandPerSecond: 1 } },
      });
      expect(alreadyTripped.events.some((event) => event.type === "economy.power.tripped")).toBe(
        false,
      );
      expect(MockAudio.instances).toHaveLength(2);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });

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

  it("plays launch cues for launch and return departure, with only the return arrival landing cue", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      readonly source: string;
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;
      playCount = 0;

      constructor(source: string) {
        super();
        this.source = source;
        MockAudio.instances.push(this);
      }

      play() {
        this.paused = false;
        this.playCount += 1;
        return Promise.resolve();
      }

      pause() {
        this.paused = true;
      }
    }

    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
    const initial = createInitialGameState({ seed: 91 });
    const asteroid: AsteroidState = {
      id: "asteroid-1",
      name: "SPI-0001A",
      systemId: "spica",
      distance: 1_000,
      rarity: "common",
      extractionEase: 1,
      remainingAntimatter: 0.4,
      totalAntimatter: 0.4,
      reservedBy: null,
      depleted: false,
      interacted: true,
    };
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        clock: { ...initial.run.clock, wallNowMs: 1 },
        space: {
          ...initial.run.space,
          launchPadBuilt: true,
          asteroids: [asteroid],
          selectedAsteroidId: asteroid.id,
          nextAsteroidSequence: 2,
          rockets: {
            ...initial.run.space.rockets,
            rocket1: {
              ...initial.run.space.rockets.rocket1,
              builtParts: ROCKET_PART_REQUIREMENTS.rocket1,
              fuelQuantity: 10_000,
              phase: "ready",
            },
          },
        },
      },
      settings: {
        ...initial.settings,
        backgroundAudioEnabled: false,
        soundEffectsEnabled: true,
      },
    };
    expect(isValidGameState(state)).toBe(true);
    const store = withGameAudio(createGameStore(state, { clock: { now: () => 1 } }));

    const playedFiles = () =>
      MockAudio.instances
        .filter((audio) => audio.playCount > 0)
        .map((audio) => audio.source.split("/").at(-1));

    try {
      const launch = store.dispatch({ type: "space.rocket.launch", rocketId: "rocket1" });
      expect(launch.events.map(({ type }) => type)).toContain("space.rocket.launched");
      expect(playedFiles()).toEqual(["rocketLaunch.mp3"]);

      const outbound = store.dispatch({
        type: "space.rocket.travel",
        rocketId: "rocket1",
        asteroidId: asteroid.id,
      });
      expect(outbound.events).toContainEqual(
        expect.objectContaining({ type: "space.rocket.travel-started", direction: "outbound" }),
      );
      expect(playedFiles()).toEqual(["rocketLaunch.mp3"]);

      const outboundTimerId = store.getState().run.space.rockets.rocket1.timerId!;
      const arrived = store.dispatch({ type: "timer.complete", timerId: outboundTimerId });
      expect(arrived.events.map(({ type }) => type)).toContain("space.rocket.arrived");
      expect(playedFiles()).toEqual(["rocketLaunch.mp3"]);

      const returning = store.dispatch({
        type: "clock.advance",
        input: { wallNowMs: 1, foreground: true, offlineElapsedMs: 3_000 },
      });
      expect(returning.events).toContainEqual(
        expect.objectContaining({ type: "space.rocket.travel-started", direction: "returning" }),
      );
      expect(playedFiles()).toEqual(["rocketLaunch.mp3", "rocketLaunch.mp3"]);

      const returnTimerId = store.getState().run.space.rockets.rocket1.timerId!;
      const returned = store.dispatch({ type: "timer.complete", timerId: returnTimerId });
      expect(returned.events.map(({ type }) => type)).toContain("space.rocket.returned");
      expect(playedFiles()).toEqual(["rocketLaunch.mp3", "rocketLaunch.mp3", "rocketLand.mp3"]);
      expect(MockAudio.instances.map((audio) => audio.playCount)).toEqual([1, 1, 1]);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });

  it("repeats the antimatter boost sound every 500 ms and stops it when toggled off", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      readonly source: string;
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;
      playCount = 0;

      constructor(source: string) {
        super();
        this.source = source;
        MockAudio.instances.push(this);
      }

      play() {
        this.paused = false;
        this.playCount += 1;
        return Promise.resolve();
      }

      pause() {
        this.paused = true;
      }
    }

    vi.useFakeTimers();
    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
    const initial = createInitialGameState();
    const state: GameState = {
      ...initial,
      settings: {
        ...initial.settings,
        backgroundAudioEnabled: false,
        soundEffectsEnabled: true,
      },
    };
    const store = withGameAudio(createGameStore(state, { clock: { now: () => 0 } }));
    const boostSounds = () =>
      MockAudio.instances.filter((audio) => audio.source.includes("boostAntimatter.mp3"));

    try {
      const started = store.dispatch({ type: "space.antimatter-boost.set-active", active: true });
      expect(started.accepted).toBe(true);
      expect(boostSounds()).toHaveLength(1);
      expect(boostSounds()[0]?.playCount).toBe(1);
      expect(MockAudio.instances.map((audio) => audio.source.split("/").at(-1))).toEqual([
        "boostAntimatter.mp3",
      ]);
      expect(vi.getTimerCount()).toBe(1);

      vi.advanceTimersByTime(1_000);
      expect(boostSounds()).toHaveLength(3);
      expect(boostSounds().map((audio) => audio.playCount)).toEqual([1, 1, 1]);

      const stopped = store.dispatch({ type: "space.antimatter-boost.set-active", active: false });
      expect(stopped.accepted).toBe(true);
      expect(vi.getTimerCount()).toBe(0);
      expect(boostSounds().every((audio) => audio.paused && audio.currentTime === 0)).toBe(true);

      vi.advanceTimersByTime(1_500);
      expect(boostSounds()).toHaveLength(3);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });

  it("stops boost repeats immediately when mining depletion automatically deactivates it", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      readonly source: string;
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;
      playCount = 0;

      constructor(source: string) {
        super();
        this.source = source;
        MockAudio.instances.push(this);
      }

      play() {
        this.paused = false;
        this.playCount += 1;
        return Promise.resolve();
      }

      pause() {
        this.paused = true;
      }
    }

    vi.useFakeTimers();
    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
    const initial = createInitialGameState({ seed: 91 });
    const asteroid: AsteroidState = {
      id: "asteroid-1",
      name: "SPI-0001A",
      systemId: "spica",
      distance: 1_000,
      rarity: "common",
      extractionEase: 1,
      remainingAntimatter: 0.4,
      totalAntimatter: 0.4,
      reservedBy: "rocket1",
      depleted: false,
      interacted: true,
    };
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        clock: { ...initial.run.clock, wallNowMs: 1 },
        space: {
          ...initial.run.space,
          antimatterUnlocked: true,
          launchPadBuilt: true,
          asteroids: [asteroid],
          selectedAsteroidId: asteroid.id,
          nextAsteroidSequence: 2,
          rockets: {
            ...initial.run.space.rockets,
            rocket1: {
              ...initial.run.space.rockets.rocket1,
              builtParts: ROCKET_PART_REQUIREMENTS.rocket1,
              fuelQuantity: 10_000,
              phase: "mining",
              targetAsteroidId: asteroid.id,
            },
          },
        },
      },
      settings: {
        ...initial.settings,
        backgroundAudioEnabled: false,
        soundEffectsEnabled: true,
      },
    };
    expect(isValidGameState(state)).toBe(true);
    const store = withGameAudio(createGameStore(state, { clock: { now: () => 1 } }));
    const boostSounds = () =>
      MockAudio.instances.filter((audio) => audio.source.includes("boostAntimatter.mp3"));

    try {
      store.dispatch({ type: "space.antimatter-boost.set-active", active: true });
      expect(boostSounds()).toHaveLength(1);
      expect(vi.getTimerCount()).toBe(1);

      const depleted = store.dispatch({
        type: "clock.advance",
        input: { wallNowMs: 1, foreground: true, offlineElapsedMs: 3_000 },
      });
      expect(depleted.state.run.space.antimatterBoostActive).toBe(false);
      expect(depleted.events.some((event) => event.type === "space.asteroid.mined")).toBe(true);
      expect(vi.getTimerCount()).toBe(0);
      expect(boostSounds()[0]?.paused).toBe(true);

      vi.advanceTimersByTime(1_500);
      expect(boostSounds()).toHaveLength(1);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });

  it("clears pending boost repeats and stops their audio when disposed", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      readonly source: string;
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;
      playCount = 0;

      constructor(source: string) {
        super();
        this.source = source;
        MockAudio.instances.push(this);
      }

      play() {
        this.paused = false;
        this.playCount += 1;
        return Promise.resolve();
      }

      pause() {
        this.paused = true;
      }
    }

    vi.useFakeTimers();
    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
    const initial = createInitialGameState();
    const state: GameState = {
      ...initial,
      settings: {
        ...initial.settings,
        backgroundAudioEnabled: false,
        soundEffectsEnabled: true,
      },
    };
    const store = withGameAudio(createGameStore(state, { clock: { now: () => 0 } }));
    const boostSounds = () =>
      MockAudio.instances.filter((audio) => audio.source.includes("boostAntimatter.mp3"));

    try {
      store.dispatch({ type: "space.antimatter-boost.set-active", active: true });
      vi.advanceTimersByTime(500);
      expect(boostSounds()).toHaveLength(2);

      store.dispose();

      expect(vi.getTimerCount()).toBe(0);
      expect(boostSounds().every((audio) => audio.paused && audio.currentTime === 0)).toBe(true);
      vi.advanceTimersByTime(1_500);
      expect(boostSounds()).toHaveLength(2);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });

  it("pauses ambience and one-shot effects out of focus while boost audio keeps its own lifecycle", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      readonly source: string;
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;
      playCount = 0;

      constructor(source: string) {
        super();
        this.source = source;
        MockAudio.instances.push(this);
      }

      play() {
        this.paused = false;
        this.playCount += 1;
        return Promise.resolve();
      }

      pause() {
        this.paused = true;
      }
    }
    class MockDocument extends EventTarget {
      visibilityState: DocumentVisibilityState = "visible";
    }

    const mockWindow = new EventTarget();
    const mockDocument = new MockDocument();
    vi.useFakeTimers();
    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
    vi.stubGlobal("window", mockWindow);
    vi.stubGlobal("document", mockDocument);
    const initial = createInitialGameState();
    const state: GameState = {
      ...initial,
      settings: {
        ...initial.settings,
        backgroundAudioEnabled: true,
        backgroundAudioVolume: 0.5,
        soundEffectsEnabled: true,
      },
    };
    const store = withGameAudio(createGameStore(state, { clock: { now: () => 0 } }));
    const ambience = () => MockAudio.instances.filter((audio) => audio.loop);
    const effects = () => MockAudio.instances.filter((audio) => !audio.loop);
    const boostEffects = () =>
      effects().filter((audio) => audio.source.includes("boostAntimatter"));

    try {
      store.dispatch({ type: "space.weather.set-condition", condition: "rain" });
      store.dispatch({ type: "space.antimatter-boost.set-active", active: true });
      expect(ambience().length).toBeGreaterThan(0);
      expect(effects().some((audio) => audio.source.includes("clickButton"))).toBe(true);
      expect(boostEffects()).toHaveLength(1);

      for (const audio of ambience()) audio.currentTime = 7;
      const oneShot = effects().find((audio) => audio.source.includes("clickButton"))!;
      oneShot.currentTime = 3;
      const ambiencePlayCounts = ambience().map((audio) => audio.playCount);

      mockWindow.dispatchEvent(new Event("blur"));

      expect(ambience().every((audio) => audio.paused && audio.currentTime === 7)).toBe(true);
      expect(oneShot.paused).toBe(true);
      expect(oneShot.currentTime).toBe(0);
      expect(boostEffects()[0]?.paused).toBe(false);

      store.dispatch({
        type: "settings.update",
        patch: { backgroundAudioVolume: 0.25 },
      });
      expect(ambience().map((audio) => audio.playCount)).toEqual(ambiencePlayCounts);

      vi.advanceTimersByTime(500);
      expect(boostEffects()).toHaveLength(2);
      expect(boostEffects().every((audio) => !audio.paused)).toBe(true);

      mockWindow.dispatchEvent(new Event("focus"));
      expect(ambience().every((audio) => !audio.paused && audio.volume <= 0.25)).toBe(true);
      expect(ambience().map((audio) => audio.playCount)).toEqual(
        ambiencePlayCounts.map((count) => count + 1),
      );

      store.dispatch({ type: "settings.update", patch: { newsTickerEnabled: false } });
      const visibilityOneShot = effects().find((audio) => audio.source.includes("clickSwitch"))!;
      expect(visibilityOneShot.playCount).toBe(1);

      mockDocument.visibilityState = "hidden";
      mockDocument.dispatchEvent(new Event("visibilitychange"));
      expect(ambience().every((audio) => audio.paused)).toBe(true);
      expect(visibilityOneShot.paused).toBe(true);
      expect(visibilityOneShot.currentTime).toBe(0);

      mockWindow.dispatchEvent(new Event("focus"));
      expect(ambience().every((audio) => audio.paused)).toBe(true);

      mockDocument.visibilityState = "visible";
      mockDocument.dispatchEvent(new Event("visibilitychange"));
      expect(ambience().every((audio) => !audio.paused)).toBe(true);
      expect(boostEffects().every((audio) => !audio.paused)).toBe(true);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });

  it("plays source-matched UI navigation cues and respects the effects preference", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      readonly source: string;
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;

      constructor(source: string) {
        super();
        this.source = source;
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
        backgroundAudioEnabled: false,
        soundEffectsEnabled: true,
        soundEffectsVolume: 0.65,
      },
    };
    const store = withGameAudio(createGameStore(state, { clock: { now: () => 0 } }));

    try {
      store.playUiCue("click");
      store.playUiCue("swipe");
      expect(MockAudio.instances.map((audio) => audio.source.split("/").at(-1))).toEqual([
        "clickButton.mp3",
        "clickSwitch.mp3",
      ]);
      expect(MockAudio.instances.map((audio) => audio.volume)).toEqual([0.65, 0.65]);

      store.dispatch({ type: "settings.update", patch: { soundEffectsEnabled: false } });
      store.playUiCue("click");
      expect(MockAudio.instances).toHaveLength(2);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });

  it("uses a normal click for purchases, the storage cue for storage, and kaching for sales", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      readonly source: string;
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;
      playCount = 0;

      constructor(source: string) {
        super();
        this.source = source;
        MockAudio.instances.push(this);
      }

      play() {
        this.paused = false;
        this.playCount += 1;
        return Promise.resolve();
      }

      pause() {
        this.paused = true;
      }
    }

    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
    const initial = createInitialGameState();
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        cash: 1_000,
        goods: {
          ...initial.run.goods,
          hydrogen: { ...initial.run.goods.hydrogen, quantity: 150 },
        },
      },
      settings: {
        ...initial.settings,
        backgroundAudioEnabled: false,
        soundEffectsEnabled: true,
      },
    };
    expect(isValidGameState(state)).toBe(true);
    const store = withGameAudio(createGameStore(state, { clock: { now: () => 0 } }));
    const playedFiles = () =>
      MockAudio.instances
        .filter((audio) => audio.playCount > 0)
        .map((audio) => audio.source.split("/").at(-1));

    try {
      const purchase = store.dispatch({
        type: "economy.building.purchase",
        buildingId: "scienceKit",
      });
      expect(purchase.accepted).toBe(true);
      expect(purchase.events).toContainEqual(
        expect.objectContaining({ type: "purchase.completed", upgradeId: "scienceKit" }),
      );
      expect(playedFiles()).toEqual(["clickButton.mp3"]);

      MockAudio.instances = [];
      const storage = store.dispatch({ type: "storage.purchase", goodId: "hydrogen" });
      expect(storage.accepted).toBe(true);
      expect(playedFiles()).toEqual(["increaseStorage.mp3"]);

      MockAudio.instances = [];
      const sale = store.dispatch({ type: "resource.sell", goodId: "hydrogen", amount: 1 });
      expect(sale.accepted).toBe(true);
      expect(playedFiles()).toEqual(["kaching.mp3"]);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });

  it("uses the source event alarm for a power plant explosion", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      readonly source: string;
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;
      playCount = 0;

      constructor(source: string) {
        super();
        this.source = source;
        MockAudio.instances.push(this);
      }

      play() {
        this.paused = false;
        this.playCount += 1;
        return Promise.resolve();
      }

      pause() {
        this.paused = true;
      }
    }

    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
    const initial = createInitialGameState();
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        upgrades: { ...initial.run.upgrades, powerPlant1: 1 },
        economy: {
          ...initial.run.economy,
          buildingEnabled: {
            ...initial.run.economy.buildingEnabled,
            powerPlant1: true,
          },
        },
      },
      settings: {
        ...initial.settings,
        backgroundAudioEnabled: false,
        soundEffectsEnabled: true,
      },
    };
    expect(isValidGameState(state)).toBe(true);
    const store = withGameAudio(createGameStore(state, { clock: { now: () => 0 } }));

    try {
      const result = store.dispatch({ type: "random-event.force", eventId: "powerPlantExplosion" });
      expect(result.accepted).toBe(true);
      expect(result.events).toContainEqual(
        expect.objectContaining({ type: "random-event.triggered", id: "powerPlantExplosion" }),
      );
      expect(MockAudio.instances.map((audio) => audio.source.split("/").at(-1))).toEqual([
        "eventAlarm.mp3",
      ]);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
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
