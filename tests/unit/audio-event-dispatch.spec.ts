import { describe, expect, it, vi } from "vitest";
import { GALAXY_SEED_DEFAULT, systemIdForStar } from "../../src/content/ids";
import {
  ROCKET_FUEL_PUMP_BASE_COST,
  ROCKET_PART_REQUIREMENTS,
  STARSHIP_MODULES,
  type AsteroidState,
} from "../../src/content/space";
import { MEGASTRUCTURE_TRACKS } from "../../src/content/technology";
import { audioCueForEvent, withGameAudio } from "../../src/app/audio";
import type { EngineEvent, GameCommand } from "../../src/engine/commands";
import { createInitialGameState, isValidGameState, type GameState } from "../../src/engine/state";
import { createGameStore, type GameStore } from "../../src/engine/store";
import { createEconomyFixture } from "../../src/app/testing/economyFixtures";

describe("audio creation fallback", () => {
  it("keeps settings dispatch working when the Audio constructor is unavailable", () => {
    vi.stubGlobal("Audio", undefined);
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

    try {
      expect(() =>
        store.dispatch({ type: "settings.update", patch: { soundEffectsVolume: 0.75 } }),
      ).not.toThrow();
      expect(store.getState().settings.soundEffectsVolume).toBe(0.75);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });

  it("keeps settings dispatch working when Audio construction throws", () => {
    let constructorCalls = 0;
    class ThrowingAudio {
      constructor() {
        constructorCalls += 1;
        throw new Error("Audio is unavailable");
      }
    }
    vi.stubGlobal("Audio", ThrowingAudio);
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

    try {
      expect(() =>
        store.dispatch({ type: "settings.update", patch: { soundEffectsVolume: 0.75 } }),
      ).not.toThrow();
      expect(constructorCalls).toBe(1);
      expect(store.getState().settings.soundEffectsVolume).toBe(0.75);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });

  it("keeps UI actions working when Audio.play throws synchronously", () => {
    class ThrowingPlayAudio {
      loop = false;
      preload = "";
      volume = 1;

      constructor(readonly source: string) {}

      addEventListener() {}

      play() {
        throw new Error("Audio playback is unavailable");
      }

      pause() {}
    }

    vi.stubGlobal("Audio", ThrowingPlayAudio);
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

    try {
      expect(() => store.playUiCue("click")).not.toThrow();
      expect(store.getState().settings.soundEffectsEnabled).toBe(true);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });
});

describe("audio store event forwarding", () => {
  it("maps prize, battle, and megastructure events to the source cue families", () => {
    const initial = createInitialGameState();
    const systemId = initial.run.space.currentSystemId;

    // Cosmic Forge achievements show a notification but do not play a dedicated SFX.
    expect(
      audioCueForEvent(
        { type: "achievement.unlocked", achievementId: "collect50Hydrogen" },
        initial,
      ),
    ).toBeNull();
    expect(
      audioCueForEvent(
        { type: "random-event.triggered", id: "researchBreakthrough", negative: false },
        initial,
      ),
    ).toBe("eventAlarm");
    expect(
      audioCueForEvent({ type: "random-event.ended", id: "researchBreakthrough" }, initial),
    ).toBeNull();

    // Cosmic Forge ui.js plays goodPrize for ordinary and one-off News Ticker claims.
    expect(
      audioCueForEvent(
        { type: "news.prize.claimed", id: 2000, goodId: "hydrogen", amount: 2 },
        initial,
      ),
    ).toBe("goodPrize");
    expect(audioCueForEvent({ type: "news.one-off.claimed", id: 3000 }, initial)).toBe("goodPrize");

    // The source Casino has only its generic accepted-action click, not a goodPrize call site.
    expect(
      audioCueForEvent(
        {
          type: "casino.game.played",
          gameId: "wheel",
          result: "win",
          cpSpent: 1,
          cpAwarded: 2,
        },
        initial,
      ),
    ).toBeNull();
    expect(
      audioCueForEvent(
        {
          type: "casino.wheel.special-claimed",
          prize: "special_100cp",
          detail: "100 CP",
          award: { type: "cp", amount: 100 },
        },
        initial,
      ),
    ).toBeNull();
    expect(
      audioCueForEvent(
        {
          type: "casino.void-seer.result",
          tier: 1,
          first: 1,
          second: 2,
          won: true,
          detail: "A prize",
        },
        initial,
      ),
    ).toBeNull();

    // Cosmic Forge plays kaching after trades, AP sales, and market liquidation.
    expect(
      audioCueForEvent(
        {
          type: "meta.market.traded",
          outgoingGoodId: "hydrogen",
          outgoingQuantity: 1,
          commissionQuantity: 0,
          incomingGoodId: "carbon",
          incomingQuantity: 1,
        },
        initial,
      ),
    ).toBe("kaching");
    expect(
      audioCueForEvent({ type: "meta.market.ap-sold", quantity: 1, cashGained: 1 }, initial),
    ).toBe("kaching");
    expect(
      audioCueForEvent({ type: "meta.market.liquidated", value: 1, apGained: 1 }, initial),
    ).toBe("kaching");
    // Cosmic Forge also uses buildTelescope as the settlement-completion cue.
    expect(
      audioCueForEvent(
        { type: "space.system.settled", systemId, ascendencyPoints: 1 },
        initial,
      ),
    ).toBe("buildTelescope");

    // Cosmic Forge's Black Hole charge has no completion cue; activating the
    // ready warp is the distinct blackHoleActivated source call.
    expect(audioCueForEvent({ type: "black-hole.researched" }, initial)).toBeNull();
    expect(audioCueForEvent({ type: "black-hole.charge-started", durationMs: 300_000 }, initial)).toBeNull();
    expect(audioCueForEvent({ type: "black-hole.charge-completed" }, initial)).toBeNull();
    expect(
      audioCueForEvent(
        { type: "black-hole.warp-activated", durationMs: 3_000, multiplier: 5 },
        initial,
      ),
    ).toBe("blackHoleActivated");

    // Battle cues are selected by the playback adapter to preserve the source random choices
    // and separate cooldowns; the event alone does not identify a cue.
    expect(
      audioCueForEvent({ type: "space.battle.round", systemId, round: 1 }, initial),
    ).toBeNull();
    expect(
      audioCueForEvent(
        { type: "space.battle.finished", systemId, result: "victory", scannerBuilt: false },
        initial,
      ),
    ).toBeNull();

    const forceFieldStages = Object.values(MEGASTRUCTURE_TRACKS).map((track) => track[2]!);
    const stateWithMegastructureResearch = (
      technologyIds: readonly (typeof forceFieldStages)[number][],
    ): GameState => ({
      ...initial,
      permanent: {
        ...initial.permanent,
        megastructures: {
          ...initial.permanent.megastructures,
          researchedTechnologyIds: technologyIds,
        },
      },
    });
    const firstFieldMilestone = stateWithMegastructureResearch([forceFieldStages[0]!]);
    expect(isValidGameState(firstFieldMilestone)).toBe(true);
    expect(
      audioCueForEvent(
        { type: "technology.researched", technologyId: forceFieldStages[0]! },
        firstFieldMilestone,
      ),
    ).toBe("forcefieldTakedown");

    const finalFieldMilestone = stateWithMegastructureResearch(forceFieldStages);
    expect(isValidGameState(finalFieldMilestone)).toBe(true);
    expect(
      audioCueForEvent(
        {
          type: "technology.researched",
          technologyId: forceFieldStages[forceFieldStages.length - 1]!,
        },
        finalFieldMilestone,
      ),
    ).toBe("forcefieldTakedownFinal");
    expect(
      audioCueForEvent(
        { type: "technology.researched", technologyId: MEGASTRUCTURE_TRACKS.dysonSphere[4]! },
        initial,
      ),
    ).toBe("megastructureCaptured");
  });

  it("uses explicit laser candidates and applies the source cooldown boundaries", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;
      playCount = 0;

      constructor(readonly source: string) {
        super();
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
    vi.stubGlobal("performance", { now: () => 1_000 });
    const initial = createInitialGameState({ seed: 93 });
    const state: GameState = {
      ...initial,
      settings: {
        ...initial.settings,
        backgroundAudioEnabled: false,
        soundEffectsEnabled: true,
      },
    };
    let now = 100;
    let events: readonly EngineEvent[] = [];
    const engineStore = createGameStore(state, { clock: { now: () => 0 } });
    const eventStore: GameStore = {
      ...engineStore,
      dispatch: (_command: GameCommand) => ({ accepted: true, state, events }),
      dispatchBatch: (commands) => commands.map(() => ({ accepted: true, state, events })),
    };
    const random = vi.fn().mockReturnValueOnce(0.2).mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.2).mockReturnValueOnce(0.8);
    const store = withGameAudio(eventStore, { now: () => now, random });
    const systemId = initial.run.space.currentSystemId;
    const clockAdvance: GameCommand = {
      type: "clock.advance",
      input: { wallNowMs: 1, foreground: true },
    };
    const playedFiles = () =>
      MockAudio.instances
        .filter((audio) => audio.playCount > 0)
        .map((audio) => audio.source.split("/").at(-1));
    const sourceTimeAt = (audioTimeMs: number) =>
      1_000 + audioTimeMs - now;

    try {
      store.playUiCue("click");
      MockAudio.instances = [];

      events = [
        { type: "space.battle.round", systemId, round: 1 },
        { type: "space.battle.round", systemId, round: 2 },
        { type: "space.battle.round", systemId, round: 3 },
        { type: "space.battle.finished", systemId, result: "victory", scannerBuilt: true },
      ];
      store.dispatch(clockAdvance);
      expect(playedFiles()).toEqual([]);
      expect(random).not.toHaveBeenCalled();

      store.playBattleLaserCandidate(sourceTimeAt(100));
      expect(playedFiles()).toEqual(["laserGun1.mp3"]);

      now = 180;
      store.playBattleLaserCandidate(sourceTimeAt(180));
      expect(playedFiles()).toEqual(["laserGun1.mp3"]);
      expect(random).toHaveBeenCalledTimes(1);

      now = 181;
      store.playBattleLaserCandidate(sourceTimeAt(181));
      expect(playedFiles()).toEqual(["laserGun1.mp3", "laserGun2.mp3"]);

      now = 262;
      store.playBattleLaserCandidate(sourceTimeAt(262));
      expect(playedFiles().slice(-1)).toEqual(["laserGun1.mp3"]);

      now = 343;
      store.playBattleLaserCandidate(sourceTimeAt(343));
      expect(playedFiles().slice(-1)).toEqual(["laserGun2.mp3"]);
      expect(random).toHaveBeenCalledTimes(4);

      events = [{ type: "space.battle.finished", systemId, result: "victory", scannerBuilt: true }];
      store.dispatch(clockAdvance);
      expect(playedFiles()).toHaveLength(4);
      expect(random).toHaveBeenCalledTimes(4);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });

  it("plays explosions on source death callbacks with the strict cooldown boundary", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;
      playCount = 0;

      constructor(readonly source: string) {
        super();
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
    vi.stubGlobal("performance", { now: () => 1_000 });
    const initial = createInitialGameState({ seed: 94 });
    const state: GameState = {
      ...initial,
      settings: {
        ...initial.settings,
        backgroundAudioEnabled: false,
        soundEffectsEnabled: true,
      },
    };
    let now = 141;
    const engineStore = createGameStore(state, { clock: { now: () => 0 } });
    const random = vi.fn().mockReturnValueOnce(0.2).mockReturnValueOnce(0.8);
    const store = withGameAudio(engineStore, { now: () => now, random });
    const playedFiles = () =>
      MockAudio.instances
        .filter((audio) => audio.playCount > 0)
        .map((audio) => audio.source.split("/").at(-1));
    const sourceTimeAt = (audioTimeMs: number) =>
      1_000 + audioTimeMs - now;

    try {
      store.playUiCue("click");
      MockAudio.instances = [];
      store.playBattleExplosionCandidate(sourceTimeAt(141));
      expect(playedFiles()).toEqual(["shipBattleExplode1.mp3"]);
      expect(random).toHaveBeenCalledTimes(1);

      now = 281;
      store.playBattleExplosionCandidate(sourceTimeAt(281));
      expect(playedFiles()).toEqual(["shipBattleExplode1.mp3"]);
      expect(random).toHaveBeenCalledTimes(1);

      now = 282;
      store.playBattleExplosionCandidate(sourceTimeAt(282));
      expect(playedFiles()).toEqual(["shipBattleExplode1.mp3", "shipBattleExplode2.mp3"]);
      expect(random).toHaveBeenCalledTimes(2);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });

  it.each(["muted", "zero-volume", "focus-loss"])(
    "drops suppressed laser attempts without replay on %s",
    (suppressionMode) => {
      class MockAudio extends EventTarget {
        static instances: MockAudio[] = [];
        loop = false;
        paused = true;
        preload = "";
        volume = 1;
        currentTime = 0;
        playCount = 0;

        constructor(readonly source: string) {
          super();
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

      MockAudio.instances = [];
      const mockWindow = new EventTarget();
      vi.stubGlobal("Audio", MockAudio);
      vi.stubGlobal("window", mockWindow);
      vi.stubGlobal("document", new MockDocument());
      vi.stubGlobal("performance", { now: () => 1_000 });
      const initial = createInitialGameState({ seed: 95 });
      let state: GameState = {
        ...initial,
        settings: {
          ...initial.settings,
          backgroundAudioEnabled: false,
          soundEffectsEnabled: true,
          soundEffectsVolume: 0.5,
        },
      };
      let now = 100;
      let events: readonly EngineEvent[] = [];
      const engineStore = createGameStore(state, { clock: { now: () => 0 } });
      const dispatch = (command: GameCommand) => {
        if (command.type === "settings.update") {
          state = { ...state, settings: { ...state.settings, ...command.patch } };
        }
        return { accepted: true, state, events };
      };
      const eventStore: GameStore = {
        ...engineStore,
        getState: () => state,
        dispatch,
        dispatchBatch: (commands) => commands.map(dispatch),
      };
      const random = vi.fn().mockReturnValueOnce(0.2).mockReturnValueOnce(0.8)
        .mockReturnValueOnce(0.2);
      const store = withGameAudio(eventStore, { now: () => now, random });
      const playedFiles = () =>
        MockAudio.instances
          .filter((audio) => audio.playCount > 0)
          .map((audio) => audio.source.split("/").at(-1));
      const playedLaserFiles = () => playedFiles().filter((file) => file?.startsWith("laserGun"));
      const sourceTimeAt = (audioTimeMs: number) =>
        1_000 + audioTimeMs - now;

      try {
        store.playUiCue("click");
        MockAudio.instances = [];
        store.playBattleLaserCandidate(sourceTimeAt(now));
        expect(playedLaserFiles()).toEqual(["laserGun1.mp3"]);

        now = 181;
        if (suppressionMode === "muted") {
          store.dispatch({ type: "settings.update", patch: { soundEffectsEnabled: false } });
        } else if (suppressionMode === "zero-volume") {
          store.dispatch({ type: "settings.update", patch: { soundEffectsVolume: 0 } });
        } else {
          mockWindow.dispatchEvent(new Event("blur"));
        }
        store.playBattleLaserCandidate(sourceTimeAt(now));
        expect(playedLaserFiles()).toEqual(["laserGun1.mp3"]);
        expect(random).toHaveBeenCalledTimes(2);

        now = 220;
        if (suppressionMode === "muted") {
          store.dispatch({ type: "settings.update", patch: { soundEffectsEnabled: true } });
        } else if (suppressionMode === "zero-volume") {
          store.dispatch({ type: "settings.update", patch: { soundEffectsVolume: 0.5 } });
        } else {
          mockWindow.dispatchEvent(new Event("focus"));
        }
        store.playBattleLaserCandidate(sourceTimeAt(now));
        expect(playedLaserFiles()).toEqual(["laserGun1.mp3"]);
        expect(random).toHaveBeenCalledTimes(2);

        now = 262;
        store.playBattleLaserCandidate(sourceTimeAt(now));
        expect(playedLaserFiles()).toEqual(["laserGun1.mp3", "laserGun1.mp3"]);
        expect(random).toHaveBeenCalledTimes(3);
      } finally {
        store.dispose();
        vi.unstubAllGlobals();
      }
    },
  );

  it("does not schedule battle audio to replay after disposal", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;
      playCount = 0;

      constructor(readonly source: string) {
        super();
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
    const initial = createInitialGameState({ seed: 96 });
    const state: GameState = {
      ...initial,
      settings: {
        ...initial.settings,
        backgroundAudioEnabled: false,
        soundEffectsEnabled: true,
      },
    };
    const store = withGameAudio(createGameStore(state, { clock: { now: () => 0 } }), {
      now: () => 100,
      random: () => 0.2,
    });
    const playedFiles = () =>
      MockAudio.instances
        .filter((audio) => audio.playCount > 0)
        .map((audio) => audio.source.split("/").at(-1));

    try {
      store.playUiCue("click");
      MockAudio.instances = [];
      store.playBattleLaserCandidate();
      expect(playedFiles()).toEqual(["laserGun1.mp3"]);
      store.dispose();

      vi.advanceTimersByTime(1_000);
      expect(playedFiles()).toEqual(["laserGun1.mp3"]);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });
  it("plays the source prize cue for News claims and generic clicks for Casino wins", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;
      playCount = 0;

      constructor(readonly source: string) {
        super();
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
    const initial = createInitialGameState({ seed: 701 });
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        space: { ...initial.run.space, ascendencyAwardedThisRun: true },
        newsTicker: {
          ...initial.run.newsTicker,
          entries: [
            {
              id: 2000,
              category: "prize",
              textKey: "news.prize.test",
              simulationMs: 0,
              prizeGoodId: "hydrogen",
              prizeAmount: 2,
              clueSystemId: null,
              claimed: false,
            },
          ],
        },
      },
      permanent: {
        ...initial.permanent,
        galacticCasino: {
          ...initial.permanent.galacticCasino,
          casinoPoints: 5,
          baseWinProbability: 1,
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
      const newsClaim = store.dispatch({ type: "news.prize.claim", id: 2000 });
      expect(newsClaim.failure).toBeUndefined();
      expect(newsClaim.events).toContainEqual(
        expect.objectContaining({ type: "news.prize.claimed" }),
      );
      expect(playedFiles()).toEqual(["goodPrize.mp3"]);

      MockAudio.instances = [];
      const casinoWin = store.dispatch({ type: "casino.double-or-nothing.play", stake: 1 });
      expect(casinoWin.accepted).toBe(true);
      expect(casinoWin.events).toContainEqual(
        expect.objectContaining({ type: "casino.game.played", result: "win", cpAwarded: 2 }),
      );
      expect(playedFiles()).toEqual(["clickButton.mp3"]);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });

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
        expect(audioFiles()).toEqual(["clickButton.mp3", "asteroidScan.mp3"]);

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
        expect(audioFiles()).toEqual([
          "clickButton.mp3",
          "asteroidScan.mp3",
          "clickButton.mp3",
          "starStudy.mp3",
        ]);

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
        expect(audioFiles()).toEqual(["clickButton.mp3", "asteroidScan.mp3"]);
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
      expect(audioFiles()).toEqual(["clickButton.mp3", "fuelRocket.mp3"]);

      const paused = store.dispatch({
        type: "space.rocket.pump.set-enabled",
        rocketId: "rocket1",
        enabled: false,
      });
      expect(paused.events).toContainEqual(
        expect.objectContaining({ type: "space.rocket.pump.changed", enabled: false }),
      );
      expect(audioFiles()).toEqual(["clickButton.mp3", "fuelRocket.mp3", "clickSwitch.mp3"]);

      const resumed = store.dispatch({
        type: "space.rocket.pump.set-enabled",
        rocketId: "rocket1",
        enabled: true,
      });
      expect(resumed.events).toContainEqual(
        expect.objectContaining({ type: "space.rocket.pump.changed", enabled: true }),
      );
      expect(audioFiles()).toEqual(["clickButton.mp3", "fuelRocket.mp3", "clickSwitch.mp3", "clickSwitch.mp3"]);
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
      ).toEqual(["clickButton.mp3", "blackHoleActivated.mp3"]);
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
      expect(
        audioCueForEvent({ type: "space.antimatter-boost.changed", active: false }, stopped.state),
      ).toBeNull();
      expect(vi.getTimerCount()).toBe(0);
      expect(boostSounds().every((audio) => audio.paused && audio.currentTime === 0)).toBe(true);
      expect(MockAudio.instances.map((audio) => audio.source.split("/").at(-1))).toEqual([
        "boostAntimatter.mp3",
        "boostAntimatter.mp3",
        "boostAntimatter.mp3",
      ]);

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

  it("maps Space Mining and Rocket events to the source cue families", () => {
    const state = createInitialGameState();
    const routes = [
      [{ type: "space.survey.started", survey: "asteroids" }, "asteroidScan"],
      [{ type: "space.survey.started", survey: "stars" }, "starStudy"],
      [{ type: "space.survey.started", survey: "pillageVoid" }, "starStudy"],
      [{ type: "space.rocket.pump.purchased", rocketId: "rocket1" }, "fuelRocket"],
      [{ type: "space.rocket.launched", rocketId: "rocket1" }, "rocketLaunch"],
      [
        {
          type: "space.rocket.travel-started",
          rocketId: "rocket1",
          asteroidId: "asteroid-1",
          direction: "outbound",
        },
        null,
      ],
      [
        { type: "space.rocket.arrived", rocketId: "rocket1", asteroidId: "asteroid-1" },
        null,
      ],
      [
        {
          type: "space.rocket.travel-started",
          rocketId: "rocket1",
          asteroidId: "asteroid-1",
          direction: "returning",
        },
        "rocketLaunch",
      ],
      [
        { type: "space.rocket.returned", rocketId: "rocket1", asteroidId: "asteroid-1" },
        "rocketLand",
      ],
    ] as const;

    for (const [event, cue] of routes) {
      expect(audioCueForEvent(event, state)).toBe(cue);
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

      const muted = store.dispatch({
        type: "settings.update",
        patch: { soundEffectsEnabled: false },
      });
      expect(muted.accepted).toBe(true);
      expect(store.getState().settings.soundEffectsEnabled).toBe(false);
      // The Settings control plays its cue before this dispatch; the muted
      // result must suppress any post-dispatch generic cue.
      expect(MockAudio.instances).toHaveLength(2);
      store.playUiCue("click");
      expect(MockAudio.instances).toHaveLength(2);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });

  it("does not play generic click cues for automatic navigation attention updates", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;

      constructor(readonly source: string) {
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
        backgroundAudioEnabled: false,
        soundEffectsEnabled: true,
      },
    };
    const store = withGameAudio(createGameStore(state, { clock: { now: () => 0 } }));

    try {
      store.dispatch({ type: "navigation.attention.initialize", pageIds: ["resources"] });
      store.dispatch({ type: "navigation.attention.discover", pageIds: ["megastructures"] });
      expect(MockAudio.instances).toHaveLength(0);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });

  it("applies sound-effects volume changes to effects that are already playing", () => {
    class MockAudio extends EventTarget {
      static instances: MockAudio[] = [];
      loop = false;
      paused = true;
      preload = "";
      volume = 1;
      currentTime = 0;

      constructor(readonly source: string) {
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
    const state: GameState = {
      ...initial,
      settings: {
        ...initial.settings,
        backgroundAudioEnabled: false,
        soundEffectsEnabled: true,
        soundEffectsVolume: 0.2,
      },
    };
    const store = withGameAudio(createGameStore(state, { clock: { now: () => 0 } }));

    try {
      store.playUiCue("click");
      const activeEffect = MockAudio.instances[0];
      expect(activeEffect.volume).toBe(0.2);

      store.dispatch({ type: "settings.update", patch: { soundEffectsVolume: 0.8 } });

      expect(activeEffect.volume).toBe(0.8);
      expect(MockAudio.instances[1]?.volume).toBe(0.8);
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
      expect(playedFiles()).toEqual(["clickButton.mp3", "kaching.mp3"]);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });

  it("keeps manual Resource and Compound action cues source-matched", () => {
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
    const initial = createEconomyFixture("full", "en");
    const state: GameState = {
      ...initial,
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
      const collection = store.dispatch({ type: "resource.collect", goodId: "hydrogen" });
      expect(collection.accepted).toBe(true);
      expect(playedFiles()).toEqual(["clickButton.mp3"]);

      MockAudio.instances = [];
      const sale = store.dispatch({ type: "resource.sell", goodId: "hydrogen", amount: 1 });
      expect(sale.accepted).toBe(true);
      expect(playedFiles()).toEqual(["clickButton.mp3", "kaching.mp3"]);

      MockAudio.instances = [];
      const autobuyer = store.dispatch({ type: "hydrogen.autobuyer.purchase" });
      expect(autobuyer.accepted).toBe(true);
      expect(autobuyer.events).toContainEqual(
        expect.objectContaining({ type: "purchase.completed", upgradeId: "autobuyer:hydrogen:tier:1" }),
      );
      expect(playedFiles()).toEqual(["clickButton.mp3"]);

      MockAudio.instances = [];
      const creation = store.dispatch({
        type: "economy.compound.create",
        goodId: "diesel",
        amount: 1,
      });
      expect(creation.accepted).toBe(true);
      expect(creation.events).toContainEqual(
        expect.objectContaining({ type: "compound.created", goodId: "diesel", amount: 1 }),
      );
      expect(playedFiles()).toEqual(["clickButton.mp3"]);

      MockAudio.instances = [];
      const compoundSale = store.dispatch({ type: "resource.sell", goodId: "diesel", amount: 1 });
      expect(compoundSale.accepted).toBe(true);
      expect(compoundSale.events).toContainEqual(
        expect.objectContaining({ type: "resource.sold", goodId: "diesel", amount: 1 }),
      );
      expect(playedFiles()).toEqual(["clickButton.mp3", "kaching.mp3"]);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });

  it("uses the dedicated source cue for individual power-plant toggles", () => {
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
      const off = store.dispatch({
        type: "economy.building.toggle",
        buildingId: "powerPlant1",
        enabled: false,
      });
      expect(off.accepted).toBe(true);
      expect(MockAudio.instances.map((audio) => audio.source.split("/").at(-1))).toEqual([
        "clickButton.mp3",
        "powerOn.mp3",
      ]);

      MockAudio.instances = [];
      const on = store.dispatch({
        type: "economy.building.toggle",
        buildingId: "powerPlant1",
        enabled: true,
      });
      expect(on.accepted).toBe(true);
      expect(MockAudio.instances.map((audio) => audio.source.split("/").at(-1))).toEqual([
        "clickButton.mp3",
        "powerOn.mp3",
      ]);

      const activePowerOn = MockAudio.instances.find((audio) => audio.source.endsWith("powerOn.mp3"))!;
      const gridOff = store.dispatch({ type: "economy.power.toggle", enabled: false });
      expect(gridOff.accepted).toBe(true);
      expect(activePowerOn.paused).toBe(true);
      expect(MockAudio.instances.slice(-1).map((audio) => audio.source.split("/").at(-1))).toEqual([
        "powerOff.mp3",
      ]);

      const activePowerOff = MockAudio.instances.at(-1)!;
      const gridOn = store.dispatch({ type: "economy.power.toggle", enabled: true });
      expect(gridOn.accepted).toBe(true);
      expect(activePowerOff.paused).toBe(true);
      expect(MockAudio.instances.slice(-1).map((audio) => audio.source.split("/").at(-1))).toEqual([
        "powerOn.mp3",
      ]);
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
      const rain = MockAudio.instances.find((audio) => audio.source.endsWith("rainLoop.mp3"));
      expect(rain?.loop).toBe(true);
      expect(rain?.paused).toBe(false);

      store.dispatch({ type: "space.weather.set-condition", condition: "volcano" });
      const volcano = MockAudio.instances.find((audio) => audio.source.endsWith("eruptionLoop.mp3"));
      expect(rain?.paused).toBe(true);
      expect(volcano?.loop).toBe(true);
      expect(volcano?.paused).toBe(false);

      store.dispatch({ type: "space.weather.set-condition", condition: "clear" });
      expect(rain?.paused).toBe(true);
      expect(volcano?.paused).toBe(true);

      store.dispose();

      expect(MockAudio.instances.every((audio) => audio.paused)).toBe(true);
      expect(MockAudio.instances.every((audio) => audio.currentTime === 0)).toBe(true);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });

  it("keeps battery charge and discharge transitions silent like the source game", () => {
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
    const initial = createEconomyFixture("battery-cycle", "en");
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        clock: { ...initial.run.clock, wallNowMs: 0 },
        economy: {
          ...initial.run.economy,
          power: { ...initial.run.economy.power, quantity: 50 },
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
      store.dispatch({ type: "settings.update", patch: { newsTickerEnabled: false } });
      MockAudio.instances = [];
      const initialCharge = store.getState().run.economy.power.quantity;

      const charging = store.dispatch({
        type: "clock.advance",
        input: { wallNowMs: 1_000, foreground: true },
        tickPlan: { power: { generationPerSecond: 20, demandPerSecond: 10 } },
      });
      expect(charging.accepted).toBe(true);
      expect(charging.state.run.economy.power.quantity).toBeGreaterThan(initialCharge);
      expect(MockAudio.instances).toHaveLength(0);

      const charged = charging.state.run.economy.power.quantity;
      const discharging = store.dispatch({
        type: "clock.advance",
        input: { wallNowMs: 2_000, foreground: true },
        tickPlan: { power: { generationPerSecond: 0, demandPerSecond: 20 } },
      });
      expect(discharging.accepted).toBe(true);
      expect(discharging.state.run.economy.power.quantity).toBeLessThan(charged);
      expect(MockAudio.instances).toHaveLength(0);
    } finally {
      store.dispose();
      vi.unstubAllGlobals();
    }
  });
});
