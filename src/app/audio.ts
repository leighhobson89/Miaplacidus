import type { EngineEvent, EngineResult, GameCommand } from "../engine/commands";
import type { GameState } from "../engine/state";
import type { GameStateReducer, GameStore } from "../engine/store";
import { currentWeatherForSystem } from "../engine/weather";
import {
  miaplacidusForceFieldLevel,
  stageForMegastructureTechnology,
} from "../engine/megastructures";

const AUDIO_URLS = {
  asteroidScan: new URL("../assets/audio/asteroidScan.mp3", import.meta.url).href,
  bgAmbience: new URL("../assets/audio/bgAmbience.mp3", import.meta.url).href,
  blackHoleActivated: new URL("../assets/audio/blackHoleActivated.mp3", import.meta.url).href,
  boostAntimatter: new URL("../assets/audio/boostAntimatter.mp3", import.meta.url).href,
  buildLaunchPad: new URL("../assets/audio/buildLaunchPad.mp3", import.meta.url).href,
  buildTelescope: new URL("../assets/audio/buildTelescope.mp3", import.meta.url).href,
  clickButton: new URL("../assets/audio/clickButton.mp3", import.meta.url).href,
  clickSwitch: new URL("../assets/audio/clickSwitch.mp3", import.meta.url).href,
  eruptionLoop: new URL("../assets/audio/eruptionLoop.mp3", import.meta.url).href,
  eventAlarm: new URL("../assets/audio/eventAlarm.mp3", import.meta.url).href,
  forcefieldTakedown: new URL("../assets/audio/forcefieldTakedown.mp3", import.meta.url).href,
  forcefieldTakedownFinal: new URL("../assets/audio/forcefieldTakedownFinal.mp3", import.meta.url)
    .href,
  fuelRocket: new URL("../assets/audio/fuelRocket.mp3", import.meta.url).href,
  goodPrize: new URL("../assets/audio/goodPrize.mp3", import.meta.url).href,
  increaseStorage: new URL("../assets/audio/increaseStorage.mp3", import.meta.url).href,
  kaching: new URL("../assets/audio/kaching.mp3", import.meta.url).href,
  laserGun1: new URL("../assets/audio/laserGun1.mp3", import.meta.url).href,
  laserGun2: new URL("../assets/audio/laserGun2.mp3", import.meta.url).href,
  megastructureCaptured: new URL("../assets/audio/megastructureCaptured.mp3", import.meta.url).href,
  powerOff: new URL("../assets/audio/powerOff.mp3", import.meta.url).href,
  powerOn: new URL("../assets/audio/powerOn.mp3", import.meta.url).href,
  powerTripped: new URL("../assets/audio/powerTripped.mp3", import.meta.url).href,
  rainLoop: new URL("../assets/audio/rainLoop.mp3", import.meta.url).href,
  rocketLand: new URL("../assets/audio/rocketLand.mp3", import.meta.url).href,
  rocketLaunch: new URL("../assets/audio/rocketLaunch.mp3", import.meta.url).href,
  shipBattleExplode1: new URL("../assets/audio/shipBattleExplode1.mp3", import.meta.url).href,
  shipBattleExplode2: new URL("../assets/audio/shipBattleExplode2.mp3", import.meta.url).href,
  starShipArrive: new URL("../assets/audio/starShipArrive.mp3", import.meta.url).href,
  starShipLaunch: new URL("../assets/audio/starShipLaunch.mp3", import.meta.url).href,
  starStudy: new URL("../assets/audio/starStudy.mp3", import.meta.url).href,
} as const;

type AudioCue = keyof typeof AUDIO_URLS;

export interface AudioPlaybackOptions {
  readonly now?: () => number;
  readonly random?: () => number;
}

const BATTLE_LASER_COOLDOWN_MS = 80;
const BATTLE_EXPLOSION_COOLDOWN_MS = 140;

const activeEffects = new Set<HTMLAudioElement>();
const activeEffectsByCue = new Map<AudioCue, Set<HTMLAudioElement>>();
const ambienceTracks = new Map<string, HTMLAudioElement>();
let audioUnlocked = false;

function createAudio(cue: AudioCue, loop: boolean, volume: number): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  try {
    const audio = new Audio(AUDIO_URLS[cue]);
    audio.loop = loop;
    audio.preload = "none";
    audio.volume = volume;
    return audio;
  } catch {
    return null;
  }
}

function playSafely(audio: HTMLAudioElement, onFailure: () => void = () => {}): void {
  try {
    void audio.play().catch(onFailure);
  } catch {
    onFailure();
  }
}

function playEffect(cue: AudioCue, volume: number): void {
  if (volume <= 0) return;
  const oppositePowerCue = cue === "powerOn" ? "powerOff" : cue === "powerOff" ? "powerOn" : null;
  if (oppositePowerCue) {
    for (const active of activeEffectsByCue.get(oppositePowerCue) ?? []) {
      active.pause();
      active.currentTime = 0;
      activeEffects.delete(active);
    }
    activeEffectsByCue.delete(oppositePowerCue);
  }

  const audio = createAudio(cue, false, volume);
  if (!audio) return;
  const forget = () => {
    activeEffects.delete(audio);
    const cueEffects = activeEffectsByCue.get(cue);
    cueEffects?.delete(audio);
    if (cueEffects?.size === 0) activeEffectsByCue.delete(cue);
  };
  activeEffects.add(audio);
  const cueEffects = activeEffectsByCue.get(cue) ?? new Set<HTMLAudioElement>();
  cueEffects.add(audio);
  activeEffectsByCue.set(cue, cueEffects);
  audio.addEventListener("ended", forget, { once: true });
  playSafely(audio, forget);
}

function stopEffects(): void {
  for (const audio of activeEffects) {
    audio.pause();
    audio.currentTime = 0;
  }
  activeEffects.clear();
  activeEffectsByCue.clear();
}

function setActiveEffectsVolume(volume: number): void {
  for (const audio of activeEffects) audio.volume = volume;
}

function setAmbienceTrack(
  key: string,
  cue: AudioCue | null,
  shouldPlay: boolean,
  volume: number,
): void {
  let audio = ambienceTracks.get(key);
  if (!audio && cue && shouldPlay) {
    audio = createAudio(cue, true, volume) ?? undefined;
    if (audio) ambienceTracks.set(key, audio);
  }
  if (!audio) return;
  audio.volume = volume;
  if (shouldPlay) {
    if (audio.paused) playSafely(audio);
  } else {
    audio.pause();
  }
}

function updateAmbience(state: GameState, focused = true): void {
  const enabled = state.settings.backgroundAudioEnabled ?? state.settings.soundEnabled;
  if (!(state.settings.soundEffectsEnabled ?? state.settings.soundEnabled)) stopEffects();
  if (!focused) {
    for (const audio of ambienceTracks.values()) audio.pause();
    return;
  }
  if (!enabled) {
    for (const audio of ambienceTracks.values()) audio.pause();
    return;
  }
  if (!audioUnlocked) return;

  const volume = state.settings.backgroundAudioVolume ?? 0.5;
  setAmbienceTrack("background", "bgAmbience", volume > 0, volume);
  const weather = currentWeatherForSystem(state.run.space);
  setAmbienceTrack(
    "rain",
    "rainLoop",
    volume > 0 && (weather === "rain" || weather === "heavyRain"),
    volume * 0.6,
  );
  setAmbienceTrack("volcano", "eruptionLoop", volume > 0 && weather === "volcano", volume * 0.6);
}

/** Source cue selection for an accepted game event; kept explicit for parity tests. */
export function audioCueForEvent(event: EngineEvent, state: GameState): AudioCue | null {
  switch (event.type) {
    case "storage.increased":
      return "increaseStorage";
    case "technology.researched":
      switch (stageForMegastructureTechnology(event.technologyId)) {
        case 3:
          return miaplacidusForceFieldLevel(state) >= 4
            ? "forcefieldTakedownFinal"
            : "forcefieldTakedown";
        case 5:
          return "megastructureCaptured";
        default:
          return null;
      }
    case "resource.sold":
    case "meta.market.traded":
    case "meta.market.ap-sold":
    case "meta.market.liquidated":
      return "kaching";
    case "news.prize.claimed":
    case "news.one-off.claimed":
      return "goodPrize";
    case "space.telescope.built":
      return "buildTelescope";
    case "space.launch-pad.built":
      return "buildLaunchPad";
    case "space.survey.started":
      if (event.survey === "asteroids") return "asteroidScan";
      return event.survey === "stars" || event.survey === "pillageVoid" ? "starStudy" : null;
    case "space.starship.system.scanned":
      return "asteroidScan";
    case "space.system.settled":
      return "buildTelescope";
    case "space.rocket.pump.purchased":
      return "fuelRocket";
    case "space.rocket.pump.changed":
      return "clickSwitch";
    case "space.rocket.launched":
      return "rocketLaunch";
    case "space.rocket.travel-started":
      return event.direction === "returning" ? "rocketLaunch" : null;
    case "space.rocket.returned":
      return "rocketLand";
    case "space.starship.launched":
      return "starShipLaunch";
    case "space.starship.arrived":
      return "starShipArrive";
    case "space.antimatter-boost.changed":
      // Cosmic Forge starts/stops the repeating boost audio directly from the
      // hold gesture. Releasing the control does not play a switch cue.
      return null;
    case "space.battle.round":
    case "space.battle.finished":
      // These engine summaries do not create battle audio callbacks.
      return null;
    case "space.battle.casualties":
      // Aggregate losses do not create explosion cues without a rendered death callback.
      return null;
    case "black-hole.warp-activated":
      return "blackHoleActivated";
    case "black-hole.upgrade-purchased":
      return event.upgradeId === "recharge" && state.permanent.blackHole.alwaysOn
        ? "blackHoleActivated"
        : null;
    case "random-event.triggered":
      return "eventAlarm";
    default:
      return null;
  }
}

interface BattleCueSelectors {
  readonly laserCallback: (
    onCue?: (cue: AudioCue) => void,
    callbackAtMs?: number,
  ) => void;
  readonly explosionAttempt: (
    onCue: ((cue: AudioCue) => void) | undefined,
    sourceCrossingAtMs: number,
  ) => void;
}

function createBattleCueSelectors(
  now: () => number,
  random: () => number,
): BattleCueSelectors {
  // Cosmic Forge initializes both source guards at performance time zero.
  let lastLaserAt = 0;
  let lastExplosionAt = 0;
  return {
    laserCallback(onCue, callbackAtMs) {
      const currentTime = callbackAtMs ?? now();
      if (
        !Number.isFinite(currentTime) ||
        currentTime - lastLaserAt <= BATTLE_LASER_COOLDOWN_MS
      ) {
        return;
      }
      lastLaserAt = currentTime;
      const cue = random() < 0.5 ? "laserGun1" : "laserGun2";
      onCue?.(cue);
    },
    explosionAttempt(onCue, sourceCrossingAtMs) {
      if (
        !Number.isFinite(sourceCrossingAtMs) ||
        sourceCrossingAtMs - lastExplosionAt <= BATTLE_EXPLOSION_COOLDOWN_MS
      ) {
        return;
      }
      lastExplosionAt = sourceCrossingAtMs;
      const cue = random() < 0.5 ? "shipBattleExplode1" : "shipBattleExplode2";
      onCue?.(cue);
    },
  };
}

function cuesForEvent(event: EngineEvent, state: GameState): readonly AudioCue[] {
  if (event.type === "economy.power.tripped") return ["powerOff", "powerTripped"];
  const cue = audioCueForEvent(event, state);
  return cue ? [cue] : [];
}

function hasSourceButtonCue(command: GameCommand, result: EngineResult): boolean {
  // Cosmic Forge createButton plays its generic click before calling onClick.
  // The event-specific cue suppresses our fallback, so restore that ordering
  // only for accepted commands whose source handler also played a dedicated cue.
  switch (command.type) {
    case "resource.sell":
      return result.events.some(
        (event) => event.type === "resource.sold" && event.origin === "manual",
      );
    case "economy.building.toggle":
      return command.buildingId.startsWith("powerPlant");
    case "economy.research":
      return result.events.some(
        (event) => event.type === "technology.researched" && audioCueForEvent(event, result.state),
      );
    case "meta.market.trade":
    case "meta.market.sell-ap":
    case "meta.market.liquidate":
      return result.events.some((event) => audioCueForEvent(event, result.state) === "kaching");
    case "space.telescope.build":
    case "space.launch-pad.build":
    case "space.telescope.scan.start":
    case "space.telescope.study.start":
    case "space.telescope.pillage.start":
    case "space.rocket.pump.purchase":
    case "space.starship.system.scan":
      return result.events.some((event) => audioCueForEvent(event, result.state) !== null);
    case "black-hole.activate":
      return result.events.some((event) => event.type === "black-hole.warp-activated");
    case "black-hole.upgrade":
      return result.events.some(
        (event) =>
          event.type === "black-hole.upgrade-purchased" &&
          audioCueForEvent(event, result.state) === "blackHoleActivated",
      );
    default:
      return false;
  }
}

function createBoostSoundLoop(getState: () => GameState) {
  let interval: ReturnType<typeof setInterval> | null = null;
  const effects = new Set<HTMLAudioElement>();

  const play = (state: GameState) => {
    const volume = state.settings.soundEffectsVolume ?? 0.5;
    if (volume <= 0) return;
    const audio = createAudio("boostAntimatter", false, volume);
    if (!audio) return;
    effects.add(audio);
    const forget = () => {
      effects.delete(audio);
    };
    audio.addEventListener("ended", forget, { once: true });
    playSafely(audio, forget);
  };

  const stop = () => {
    if (interval !== null) clearInterval(interval);
    interval = null;
    for (const audio of effects) {
      audio.pause();
      audio.currentTime = 0;
    }
    effects.clear();
  };

  return {
    update(state: GameState, events: readonly EngineEvent[], canPlay: boolean): boolean {
      const transitioned = events.some((event) => event.type === "space.antimatter-boost.changed");
      if (!canPlay || !state.run.space.antimatterBoostActive) {
        stop();
        return transitioned;
      }
      if (transitioned && interval === null) {
        play(state);
        interval = setInterval(() => {
          const currentState = getState();
          const effectsEnabled =
            currentState.settings.soundEffectsEnabled ?? currentState.settings.soundEnabled;
          if (!effectsEnabled || !currentState.run.space.antimatterBoostActive) {
            stop();
            return;
          }
          play(currentState);
        }, 500);
      }
      return transitioned;
    },
    setVolume(volume: number) {
      for (const audio of effects) audio.volume = volume;
    },
    dispose: stop,
  };
}

function handleResult(
  command: GameCommand,
  result: EngineResult,
  boostSoundLoop: ReturnType<typeof createBoostSoundLoop>,
  isAudioFocused: () => boolean,
): void {
  if (!result.accepted) return;
  const isArrivalNoticeMarker = command.type === "space.starship.arrival-notice.mark-notified";
  if (command.type !== "clock.advance" && !isArrivalNoticeMarker) audioUnlocked = true;
  if (command.type === "settings.update") {
    const effectsVolume = result.state.settings.soundEffectsVolume ?? 0.5;
    setActiveEffectsVolume(effectsVolume);
    boostSoundLoop.setVolume(effectsVolume);
  }
  updateAmbience(result.state, isAudioFocused());
  const effectsEnabled =
    result.state.settings.soundEffectsEnabled ?? result.state.settings.soundEnabled;
  const effectsVolume = result.state.settings.soundEffectsVolume ?? 0.5;
  const boostTransitioned = boostSoundLoop.update(
    result.state,
    result.events,
    effectsEnabled && audioUnlocked,
  );
  if (!effectsEnabled || !audioUnlocked || !isAudioFocused() || effectsVolume <= 0) return;

  const cues = new Set<AudioCue>();
  if (hasSourceButtonCue(command, result)) cues.add("clickButton");
  if (command.type === "economy.power.toggle") {
    cues.add(command.enabled ? "powerOn" : "powerOff");
  }
  if (command.type === "economy.building.toggle" && command.buildingId.startsWith("powerPlant")) {
    // The source power-plant button explicitly plays powerOn after its state update.
    cues.add("powerOn");
  }
  for (const event of result.events) {
    if (command.type === "clock.advance" && event.type === "resource.sold") continue;
    if (event.type === "space.battle.death") {
      // Explosion audio is attempted at the renderer's transient unit crossing.
      continue;
    }
    if (
      event.type === "space.battle.round" ||
      event.type === "space.battle.casualties" ||
      event.type === "space.battle.finished"
    ) {
      // State summary events have no separate audio attempt.
      continue;
    }
    for (const cue of cuesForEvent(event, result.state)) cues.add(cue);
  }
  const silentRocketProgress = result.events.some(
    (event) =>
      event.type === "space.rocket.arrived" ||
      (event.type === "space.rocket.travel-started" && event.direction === "outbound"),
  );
  if (
    cues.size === 0 &&
    command.type !== "clock.advance" &&
    command.type !== "timer.complete" &&
    command.type !== "navigation.attention.initialize" &&
    command.type !== "navigation.attention.discover" &&
    command.type !== "navigation.attention.clear" &&
    command.type !== "navigation.attention.clear-many" &&
    !isArrivalNoticeMarker &&
    !silentRocketProgress &&
    !boostTransitioned
  ) {
    const settingsSelectionChanged =
      command.type === "settings.update" &&
      ("themeId" in command.patch ||
        "currencyId" in command.patch ||
        "notation" in command.patch ||
        "locale" in command.patch);
    cues.add(
      command.type === "settings.update"
        ? settingsSelectionChanged
          ? "clickButton"
          : "clickSwitch"
        : command.type.endsWith("toggle")
          ? "clickSwitch"
          : "clickButton",
    );
  }
  for (const cue of cues) playEffect(cue, effectsVolume);
}

export interface AudioGameStore extends GameStore {
  subscribeEvents(listener: (events: readonly EngineEvent[]) => void): () => void;
  playUiCue(cue: "click" | "swipe"): void;
  playBattleLaserCandidate(sourceCallbackAtMs?: number): void;
  playBattleExplosionCandidate(sourceCrossingAtMs: number): void;
  dispose(): void;
}

export function withGameAudio(
  store: GameStore,
  playback: AudioPlaybackOptions = {},
): AudioGameStore {
  const battleCueSelectors = createBattleCueSelectors(
    playback.now ?? (() => globalThis.performance?.now() ?? Date.now()),
    playback.random ?? Math.random,
  );
  const sourceTimeInAudioClock = (sourceAtMs: number): number => {
    const sourceNowMs = globalThis.performance?.now() ?? Date.now();
    const audioNowMs = playback.now?.() ?? sourceNowMs;
    return audioNowMs - (sourceNowMs - sourceAtMs);
  };
  const boostSoundLoop = createBoostSoundLoop(() => store.getState());
  let windowFocused =
    typeof document === "undefined" ||
    typeof document.hasFocus !== "function" ||
    document.hasFocus();
  let documentVisible = typeof document === "undefined" || document.visibilityState !== "hidden";
  let audioFocused = windowFocused && documentVisible;
  const isAudioFocused = () => audioFocused;
  const syncAudioFocus = () => {
    const nextAudioFocused = windowFocused && documentVisible;
    if (audioFocused === nextAudioFocused) return;
    audioFocused = nextAudioFocused;
    if (audioFocused) {
      updateAmbience(store.getState(), true);
    } else {
      stopEffects();
      for (const audio of ambienceTracks.values()) audio.pause();
    }
  };
  const handleWindowBlur = () => {
    windowFocused = false;
    syncAudioFocus();
  };
  const handleWindowFocus = () => {
    windowFocused = true;
    syncAudioFocus();
  };
  const handleVisibilityChange = () => {
    documentVisible = document.visibilityState !== "hidden";
    syncAudioFocus();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
  }
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }
  const eventListeners = new Set<(events: readonly EngineEvent[]) => void>();
  const publishEvents = (events: readonly EngineEvent[]) => {
    if (events.length === 0) return;
    for (const listener of eventListeners) {
      try {
        listener(events);
      } catch {
        // Event consumers must not interfere with the game command result.
      }
    }
  };
  const audioStore: AudioGameStore = {
    getState: () => store.getState(),
    getSnapshot: () => store.getSnapshot(),
    subscribe: (listener) => store.subscribe(listener),
    subscribeEvents(listener) {
      eventListeners.add(listener);
      return () => eventListeners.delete(listener);
    },
    playUiCue(cue) {
      const state = store.getState();
      audioUnlocked = true;
      updateAmbience(state, isAudioFocused());
      const effectsEnabled = state.settings.soundEffectsEnabled ?? state.settings.soundEnabled;
      if (!effectsEnabled || !isAudioFocused()) return;
      playEffect(
        cue === "click" ? "clickButton" : "clickSwitch",
        state.settings.soundEffectsVolume ?? 0.5,
      );
    },
    playBattleLaserCandidate(sourceCallbackAtMs) {
      const state = store.getState();
      const effectsEnabled =
        state.settings.soundEffectsEnabled ?? state.settings.soundEnabled;
      const effectsVolume = state.settings.soundEffectsVolume ?? 0.5;
      const canPlay = effectsEnabled && audioUnlocked && isAudioFocused() && effectsVolume > 0;
      battleCueSelectors.laserCallback(
        canPlay ? (cue) => playEffect(cue, effectsVolume) : undefined,
        sourceCallbackAtMs === undefined
          ? undefined
          : sourceTimeInAudioClock(sourceCallbackAtMs),
      );
    },
    playBattleExplosionCandidate(sourceCrossingAtMs) {
      const state = store.getState();
      const effectsEnabled =
        state.settings.soundEffectsEnabled ?? state.settings.soundEnabled;
      const effectsVolume = state.settings.soundEffectsVolume ?? 0.5;
      const canPlay = effectsEnabled && audioUnlocked && isAudioFocused() && effectsVolume > 0;
      battleCueSelectors.explosionAttempt(
        canPlay ? (cue) => playEffect(cue, effectsVolume) : undefined,
        sourceTimeInAudioClock(sourceCrossingAtMs),
      );
    },
    dispatch(command) {
      const result = store.dispatch(command);
      handleResult(command, result, boostSoundLoop, isAudioFocused);
      if (result.accepted) publishEvents(result.events);
      return result;
    },
    dispatchBatch(commands) {
      const results = store.dispatchBatch(commands);
      commands.forEach((command, index) => {
        const result = results[index];
        if (result) {
          handleResult(command, result, boostSoundLoop, isAudioFocused);
        }
      });
      publishEvents(results.flatMap((result) => (result.accepted ? result.events : [])));
      return results;
    },
    publishIfDue: () => store.publishIfDue(),
    publishNow: () => store.publishNow(),
    recover() {
      store.recover();
      const state = store.getState();
      updateAmbience(state, isAudioFocused());
      const effectsEnabled = state.settings.soundEffectsEnabled ?? state.settings.soundEnabled;
      boostSoundLoop.update(state, [], effectsEnabled && audioUnlocked);
    },
    dispose() {
      eventListeners.clear();
      if (typeof window !== "undefined") {
        window.removeEventListener("blur", handleWindowBlur);
        window.removeEventListener("focus", handleWindowFocus);
      }
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      boostSoundLoop.dispose();
      stopEffects();
      for (const audio of ambienceTracks.values()) {
        audio.pause();
        audio.currentTime = 0;
      }
      ambienceTracks.clear();
      audioUnlocked = false;
    },
  };

  if (import.meta.env.DEV || MIAPLACIDUS_BUILD_MODE === "test") {
    const dispatchReducer = store.dispatchReducer;
    if (dispatchReducer) {
      audioStore.dispatchReducer = (reducer: GameStateReducer) => {
        const result = dispatchReducer(reducer);
        if (result.accepted) {
          updateAmbience(result.state, isAudioFocused());
          const effectsEnabled =
            result.state.settings.soundEffectsEnabled ?? result.state.settings.soundEnabled;
          boostSoundLoop.update(result.state, result.events, effectsEnabled && audioUnlocked);
          publishEvents(result.events);
        }
        return result;
      };
    }
  }

  return audioStore;
}
