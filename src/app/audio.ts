import type { EngineEvent, EngineResult, GameCommand } from "../engine/commands";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { currentWeatherForSystem } from "../engine/weather";

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

const activeEffects = new Set<HTMLAudioElement>();
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

function playEffect(cue: AudioCue, volume: number): void {
  if (volume <= 0) return;
  const audio = createAudio(cue, false, volume);
  if (!audio) return;
  activeEffects.add(audio);
  audio.addEventListener("ended", () => activeEffects.delete(audio), { once: true });
  void audio.play().catch(() => activeEffects.delete(audio));
}

function stopEffects(): void {
  for (const audio of activeEffects) {
    audio.pause();
    audio.currentTime = 0;
  }
  activeEffects.clear();
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
    if (audio.paused) void audio.play().catch(() => {});
  } else {
    audio.pause();
  }
}

function updateAmbience(state: GameState): void {
  const enabled = state.settings.backgroundAudioEnabled ?? state.settings.soundEnabled;
  if (!(state.settings.soundEffectsEnabled ?? state.settings.soundEnabled)) stopEffects();
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

function cueForEvent(event: EngineEvent): AudioCue | null {
  switch (event.type) {
    case "storage.increased":
      return "increaseStorage";
    case "purchase.completed":
      return "kaching";
    case "technology.researched":
      return event.technologyId === "dysonSphereConnect" ? "megastructureCaptured" : null;
    case "resource.sold":
      return "kaching";
    case "news.prize.claimed":
    case "casino.wheel.special-claimed":
      return "goodPrize";
    case "casino.game.played":
      return event.cpAwarded > event.cpSpent ? "goodPrize" : null;
    case "casino.void-seer.result":
      return event.won ? "goodPrize" : null;
    case "space.telescope.built":
      return "buildTelescope";
    case "space.launch-pad.built":
      return "buildLaunchPad";
    case "space.asteroid.discovered":
    case "space.asteroid.scan-missed":
      return "asteroidScan";
    case "space.stars.studied":
      return "starStudy";
    case "space.rocket.pump.changed":
      return event.enabled ? "fuelRocket" : "clickSwitch";
    case "space.rocket.launched":
      return "rocketLaunch";
    case "space.rocket.returned":
    case "space.rocket.arrived":
      return "rocketLand";
    case "space.starship.launched":
      return "starShipLaunch";
    case "space.starship.arrived":
      return "starShipArrive";
    case "space.antimatter-boost.changed":
      return event.active ? "boostAntimatter" : "clickSwitch";
    case "space.battle.round":
      return event.round % 2 === 0 ? "laserGun2" : "laserGun1";
    case "space.battle.finished":
      return event.result === "victory" ? "shipBattleExplode1" : "shipBattleExplode2";
    case "black-hole.warp-activated":
      return "blackHoleActivated";
    case "megastructure.force-field-breached":
      return "forcefieldTakedown";
    case "space.miaplacidus.story-ready":
    case "cosmic-rip.closed":
      return "forcefieldTakedownFinal";
    case "random-event.triggered":
      return event.id === "powerPlantExplosion" ? "powerTripped" : "eventAlarm";
    default:
      return null;
  }
}

function handleResult(command: GameCommand, result: EngineResult): void {
  if (!result.accepted) return;
  if (command.type !== "clock.advance") audioUnlocked = true;
  updateAmbience(result.state);
  const effectsEnabled =
    result.state.settings.soundEffectsEnabled ?? result.state.settings.soundEnabled;
  if (!effectsEnabled || !audioUnlocked) return;

  const cues = new Set<AudioCue>();
  if (command.type === "economy.power.toggle") {
    cues.add(command.enabled ? "powerOn" : "powerOff");
  }
  for (const event of result.events) {
    if (command.type === "clock.advance" && event.type === "resource.sold") continue;
    const cue = cueForEvent(event);
    if (cue) cues.add(cue);
  }
  if (cues.size === 0 && command.type !== "clock.advance") {
    cues.add(
      command.type === "settings.update" || command.type.endsWith("toggle")
        ? "clickSwitch"
        : "clickButton",
    );
  }
  const volume = result.state.settings.soundEffectsVolume ?? 0.5;
  for (const cue of cues) playEffect(cue, volume);
}

export interface AudioGameStore extends GameStore {
  subscribeEvents(listener: (events: readonly EngineEvent[]) => void): () => void;
  dispose(): void;
}

export function withGameAudio(store: GameStore): AudioGameStore {
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
  return {
    getState: () => store.getState(),
    getSnapshot: () => store.getSnapshot(),
    subscribe: (listener) => store.subscribe(listener),
    subscribeEvents(listener) {
      eventListeners.add(listener);
      return () => eventListeners.delete(listener);
    },
    dispatch(command) {
      const result = store.dispatch(command);
      handleResult(command, result);
      if (result.accepted) publishEvents(result.events);
      return result;
    },
    dispatchBatch(commands) {
      const results = store.dispatchBatch(commands);
      commands.forEach((command, index) => {
        const result = results[index];
        if (result) handleResult(command, result);
      });
      publishEvents(results.flatMap((result) => (result.accepted ? result.events : [])));
      return results;
    },
    publishIfDue: () => store.publishIfDue(),
    publishNow: () => store.publishNow(),
    recover() {
      store.recover();
      updateAmbience(store.getState());
    },
    dispose() {
      eventListeners.clear();
      stopEffects();
      for (const audio of ambienceTracks.values()) {
        audio.pause();
        audio.currentTime = 0;
      }
      ambienceTracks.clear();
      audioUnlocked = false;
    },
  };
}
