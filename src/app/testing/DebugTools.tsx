import { useEffect, useRef, useState } from "react";
import type { GameCommand } from "../../engine/commands";
import type { GameStore } from "../../engine/store";
import type { GameState } from "../../engine/state";
import { hydrogenAutobuyerPrice } from "../../content/hydrogen";
import { LOCALE_IDS, autobuyerUpgradeId, type LocaleId } from "../../content/ids";
import { RANDOM_EVENT_IDS, type RandomEventId } from "../../content/metaSignals";
import { randomEventEligible } from "../../engine/randomEvents";
import { randomEventName } from "../../i18n/metaSignalMessages";
import { STARSHIP_MODULES, STARSHIP_MODULE_IDS } from "../../content/space";
import { useGameSnapshot } from "../../ui/useGameSnapshot";
import { translate, type MessageKey } from "../../i18n/messages";
import { debugScenarioText, type DebugScenarioCopy } from "../../i18n/debugScenarioMessages";
import {
  applyDebugScenario,
  DEBUG_TIMEWARP_DURATIONS_MS,
  DEBUG_TIMEWARP_MULTIPLIERS,
  type DebugNewsCategory,
  type DebugNewsInterval,
  type DebugScenarioId,
  type DebugScenarioOptions,
} from "./debugScenarioActions";
import { createLateGameNavigationCheckpoint } from "./navigationCheckpoint";

type ScenarioId = "compressor-ready" | "storage-ready" | "late-game-navigation";
type ResourceScenarioId = Exclude<ScenarioId, "late-game-navigation">;

interface DebugMetrics {
  readonly frames: number;
  readonly durationMs: number;
  readonly framesPerSecond: number;
}

interface DebugToolsProps {
  readonly store: GameStore;
  readonly seed: number;
  advanceBy(milliseconds: number): void;
  applyTestCheckpoint(state: GameState): boolean;
  readonly readFrameMetrics: () => DebugMetrics;
}

interface DebugToolsComponentProps extends DebugToolsProps {
  readonly open: boolean;
  readonly testLabOpen: boolean;
  readonly onClose: () => void;
  readonly onTestLabClose: () => void;
}

interface DebugGateway extends Omit<DebugToolsProps, "applyTestCheckpoint"> {
  dispatch(command: GameCommand): boolean;
  runScenario(scenario: ScenarioId): GameState;
  applyDebugAction(action: DebugScenarioId, options?: DebugScenarioOptions): boolean;
  recordDebugAction(
    action: DebugScenarioId,
    options: DebugScenarioOptions,
    accepted: boolean,
  ): void;
  getState(): GameState;
  getCommandLog(): readonly string[];
}

declare global {
  interface Window {
    miaplacidusTest?: DebugGateway;
  }
}

let debugCommandLog: string[] = [];
let debugLogPioneerName: string | null = null;

const LOCALE_NAMES: Readonly<Record<LocaleId, string>> = {
  en: "English",
  es: "Español",
  pt: "Português",
  de: "Deutsch",
  it: "Italiano",
  fr: "Français",
};

const ACTION_GROUPS = [
  {
    heading: "core",
    actions: [
      "set-language",
      "timewarp",
      "trigger-event",
      "prepare-run-starship-launch",
      "clear-weather",
    ],
  },
  {
    heading: "resources",
    actions: [
      "give-1b",
      "give-100",
      "give-1b-all-resources-compounds",
      "give-1m-all-resources-compounds",
      "give-1m-research",
      "grant-all-techs",
    ],
  },
  {
    heading: "progression",
    actions: ["study-star", "add-100-ap", "unlock-all-tabs", "add-10000-cp", "reset-gp-spent"],
  },
  {
    heading: "space",
    actions: [
      "add-10-asteroids",
      "build-launch-pad-scanner-rockets",
      "gain-10000-antimatter",
      "add-fleets-envoy",
      "build-starship",
    ],
  },
  {
    heading: "endgame",
    actions: [
      "hold-enter-to-gain",
      "play-miaplacidus-cinematic",
      "play-end-game-cinematic",
      "set-news-ticker",
    ],
  },
] as const satisfies readonly {
  heading: keyof DebugScenarioCopy;
  actions: readonly DebugScenarioId[];
}[];

const ACTION_COPY_KEYS: Readonly<Record<DebugScenarioId, keyof DebugScenarioCopy>> = {
  "set-language": "setLanguage",
  timewarp: "timewarp",
  "trigger-event": "triggerEvent",
  "prepare-run-starship-launch": "prepareRunStarshipLaunch",
  "clear-weather": "clearWeather",
  "give-1b": "give1b",
  "give-100": "give100",
  "give-1b-all-resources-compounds": "give1bAllResourcesCompounds",
  "give-1m-all-resources-compounds": "give1mAllResourcesCompounds",
  "give-1m-research": "give1mResearch",
  "grant-all-techs": "grantAllTechs",
  "add-10-asteroids": "add10Asteroids",
  "study-star": "studyStar",
  "build-launch-pad-scanner-rockets": "buildLaunchPadScannerRockets",
  "gain-10000-antimatter": "gain10000Antimatter",
  "add-100-ap": "add100Ap",
  "unlock-all-tabs": "unlockAllTabs",
  "add-fleets-envoy": "addFleetsEnvoy",
  "build-starship": "buildStarship",
  "hold-enter-to-gain": "holdEnterToGain",
  "add-10000-cp": "add10000Cp",
  "reset-gp-spent": "resetGpSpent",
  "play-miaplacidus-cinematic": "playMiaplacidusCinematic",
  "play-end-game-cinematic": "playEndGameCinematic",
  "set-news-ticker": "setNewsTicker",
};

function clonedState(store: GameStore): GameState {
  return JSON.parse(JSON.stringify(store.getState())) as GameState;
}

function applyExistingScenario(
  store: GameStore,
  scenario: ResourceScenarioId,
  dispatchBatch: (commands: readonly GameCommand[]) => void,
): GameState {
  const target =
    scenario === "compressor-ready"
      ? hydrogenAutobuyerPrice(
          store.getState().run.upgrades[autobuyerUpgradeId("hydrogen", 1)] ?? 0,
        )
      : Math.max(0, store.getState().run.goods.hydrogen.storageCapacity - 1);
  let attempts = 0;
  const currentQuantity = store.getState().run.goods.hydrogen.quantity;
  const commands: GameCommand[] = [];
  let quantity = currentQuantity;
  while (quantity < target && attempts < 300) {
    commands.push({ type: "resource.collect", goodId: "hydrogen" });
    quantity += 1;
    attempts += 1;
  }
  dispatchBatch(commands);
  return clonedState(store);
}

export function installDebugGateway(props: DebugToolsProps): () => void {
  const { applyTestCheckpoint, ...gatewayProps } = props;
  const pioneerName = props.store.getState().run.pioneerName;
  if (debugLogPioneerName !== pioneerName) {
    debugCommandLog = [];
    debugLogPioneerName = pioneerName;
  }
  const commandLog = debugCommandLog;
  const dispatch = (command: GameCommand): boolean => {
    commandLog.push(JSON.stringify(command));
    return props.store.dispatch(command).accepted;
  };
  const dispatchBatch = (commands: readonly GameCommand[]): void => {
    commandLog.push(...commands.map((command) => JSON.stringify(command)));
    props.store.dispatchBatch(commands);
  };
  const recordDebugAction = (
    action: DebugScenarioId,
    options: DebugScenarioOptions,
    accepted: boolean,
  ) => {
    commandLog.push(
      JSON.stringify({ type: "debug.scenario", action, options, seed: props.seed, accepted }),
    );
  };
  const applyAction = (action: DebugScenarioId, options: DebugScenarioOptions = {}): boolean => {
    let accepted = false;
    if (action === "set-language" && options.locale) {
      accepted = dispatch({ type: "settings.update", patch: { locale: options.locale } });
    } else if (action === "trigger-event" && options.eventId) {
      accepted = dispatch({ type: "random-event.force", eventId: options.eventId });
    } else if (action !== "hold-enter-to-gain") {
      const next = applyDebugScenario(props.store.getState(), action, options);
      accepted = next !== null && applyTestCheckpoint(next);
    }
    recordDebugAction(action, options, accepted);
    return accepted;
  };
  const gateway: DebugGateway = {
    ...gatewayProps,
    advanceBy(milliseconds) {
      commandLog.push(JSON.stringify({ type: "test.clock.advance", milliseconds }));
      props.advanceBy(milliseconds);
    },
    dispatch,
    runScenario: (scenario) => {
      if (scenario === "late-game-navigation") {
        const checkpoint = createLateGameNavigationCheckpoint(props.store.getState());
        if (!applyTestCheckpoint(checkpoint)) {
          throw new Error("The late-game navigation checkpoint is only available in test builds.");
        }
        commandLog.push(
          JSON.stringify({ type: "test.checkpoint.apply", checkpoint: "late-game-navigation" }),
        );
        return checkpoint;
      }
      return applyExistingScenario(props.store, scenario, dispatchBatch);
    },
    applyDebugAction: applyAction,
    recordDebugAction,
    getState: () => clonedState(props.store),
    getCommandLog: () => [...commandLog],
  };
  window.miaplacidusTest = gateway;
  return () => {
    if (window.miaplacidusTest === gateway) delete window.miaplacidusTest;
  };
}

function flatten(
  value: unknown,
  prefix = "",
  entries: [string, string][] = [],
): [string, string][] {
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, entries);
    }
  } else {
    entries.push([prefix, String(value)]);
  }
  return entries;
}

function eventAvailableReason(eventId: RandomEventId, locale: LocaleId): string {
  return `${randomEventName(locale, eventId)}: ${debugScenarioText(locale).eventUnavailableReason}`;
}

export function DebugTools(props: DebugToolsComponentProps) {
  const { store, seed, open, testLabOpen, onClose, onTestLabClose, readFrameMetrics } = props;
  const scenarioDialogRef = useRef<HTMLDialogElement>(null);
  const labDialogRef = useRef<HTMLDialogElement>(null);
  const hoveredButton = useRef<HTMLButtonElement | null>(null);
  const holdEnterEnabledRef = useRef(false);
  const snapshot = useGameSnapshot(store);
  const [search, setSearch] = useState("");
  const [commandCount, setCommandCount] = useState(0);
  const [selectedLocale, setSelectedLocale] = useState<LocaleId>(snapshot.locale);
  const [selectedEvent, setSelectedEvent] = useState<RandomEventId>("researchBreakthrough");
  const [timewarpDuration, setTimewarpDuration] =
    useState<(typeof DEBUG_TIMEWARP_DURATIONS_MS)[number]>(5_000);
  const [timewarpMultiplier, setTimewarpMultiplier] =
    useState<(typeof DEBUG_TIMEWARP_MULTIPLIERS)[number]>(50);
  const [newsCategory, setNewsCategory] = useState<DebugNewsCategory>("random");
  const [newsInterval, setNewsInterval] = useState<DebugNewsInterval>("default");
  const [holdEnterEnabled, setHoldEnterEnabled] = useState(false);
  const [actionStatus, setActionStatus] = useState("");
  const t = (key: MessageKey) => translate(snapshot.locale, key);
  const copy = debugScenarioText(snapshot.locale);
  const values = flatten(store.getState()).filter(([path]) =>
    path.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    setSelectedLocale(snapshot.locale);
  }, [snapshot.locale]);

  useEffect(() => {
    const dialog = scenarioDialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = labDialogRef.current;
    if (!dialog) return;
    if (testLabOpen && !dialog.open) dialog.showModal();
    else if (!testLabOpen && dialog.open) dialog.close();
  }, [testLabOpen]);

  useEffect(() => {
    holdEnterEnabledRef.current = holdEnterEnabled;
  }, [holdEnterEnabled]);

  useEffect(() => {
    let repeatTimer: number | null = null;
    const stop = () => {
      if (repeatTimer !== null) window.clearInterval(repeatTimer);
      repeatTimer = null;
    };
    const onMouseOver = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element) hoveredButton.current = target.closest("button");
    };
    const onMouseOut = (event: MouseEvent) => {
      const target = event.target;
      const related = event.relatedTarget;
      if (!(target instanceof Element)) return;
      const button = target.closest("button");
      if (button && (!related || !(related instanceof Node) || !button.contains(related)))
        hoveredButton.current = null;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!holdEnterEnabledRef.current || event.code !== "Enter" || event.repeat) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      )
        return;
      if (!hoveredButton.current || hoveredButton.current.disabled) return;
      event.preventDefault();
      event.stopPropagation();
      repeatTimer = window.setInterval(() => {
        const button = hoveredButton.current;
        if (!button?.isConnected || button.disabled) return;
        button.click();
      }, 35);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Enter") return;
      if (repeatTimer !== null) {
        event.preventDefault();
        event.stopPropagation();
      }
      stop();
    };
    document.addEventListener("mouseover", onMouseOver, true);
    document.addEventListener("mouseout", onMouseOut, true);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      stop();
      document.removeEventListener("mouseover", onMouseOver, true);
      document.removeEventListener("mouseout", onMouseOut, true);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  function refreshCommandCount(): void {
    setCommandCount(window.miaplacidusTest?.getCommandLog().length ?? 0);
  }

  function runScenario(scenario: ScenarioId): void {
    window.miaplacidusTest?.runScenario(scenario);
    refreshCommandCount();
  }

  function advanceClock(): void {
    window.miaplacidusTest?.advanceBy(10_000);
    refreshCommandCount();
  }

  function runAction(action: DebugScenarioId, options: DebugScenarioOptions = {}): void {
    if (action === "hold-enter-to-gain") {
      const next = !holdEnterEnabled;
      setHoldEnterEnabled(next);
      window.miaplacidusTest?.recordDebugAction(action, { holdEnterEnabled: next }, true);
      setActionStatus(next ? copy.holdEnterOn : copy.holdEnterOff);
      refreshCommandCount();
      return;
    }
    const accepted = window.miaplacidusTest?.applyDebugAction(action, options) ?? false;
    const actionLocale =
      action === "set-language" ? (options.locale ?? snapshot.locale) : snapshot.locale;
    const actionCopy = debugScenarioText(actionLocale);
    setActionStatus(accepted ? actionCopy.scenarioApplied : actionCopy.scenarioUnavailable);
    refreshCommandCount();
  }

  function renderAction(action: DebugScenarioId) {
    const actionCopyKey = ACTION_COPY_KEYS[action];
    const label = copy[actionCopyKey];
    const eventStates = RANDOM_EVENT_IDS.map((id) => ({
      id,
      eligible: randomEventEligible(store.getState(), id),
    }));
    const selectedEventEligible =
      eventStates.find((entry) => entry.id === selectedEvent)?.eligible ?? false;
    const categorySupported = newsCategory !== "feedback";
    const fleetEnvoyAvailable = STARSHIP_MODULE_IDS.every(
      (id) =>
        store.getState().run.space.starshipModules[id].builtParts >= STARSHIP_MODULES[id].parts,
    );
    const isPlaceholder =
      action === "play-miaplacidus-cinematic" || action === "play-end-game-cinematic";
    let reason: string | null = null;
    if (action === "play-miaplacidus-cinematic") reason = copy.cinematicMiaplacidusReason;
    if (action === "play-end-game-cinematic") reason = copy.cinematicEndGameReason;
    if (action === "add-fleets-envoy" && !fleetEnvoyAvailable) reason = copy.fleetEnvoyReason;
    const disabled =
      isPlaceholder ||
      (action === "trigger-event" && !selectedEventEligible) ||
      (action === "set-news-ticker" && !categorySupported) ||
      (action === "add-fleets-envoy" && !fleetEnvoyAvailable);

    let controls = null;
    if (action === "set-language") {
      controls = (
        <>
          <select
            data-testid="debug-control-set-language"
            aria-label={copy.languageControl}
            value={selectedLocale}
            onChange={(event) => setSelectedLocale(event.currentTarget.value as LocaleId)}
          >
            {LOCALE_IDS.map((locale) => (
              <option key={locale} value={locale}>
                {LOCALE_NAMES[locale]}
              </option>
            ))}
          </select>
          <button
            data-testid="debug-action-set-language"
            type="button"
            onClick={() => runAction(action, { locale: selectedLocale })}
          >
            {copy.apply}
          </button>
        </>
      );
    } else if (action === "timewarp") {
      controls = (
        <>
          <label>
            <span>{copy.timewarpDurationControl}</span>
            <select
              data-testid="debug-control-timewarp-duration"
              value={timewarpDuration}
              onChange={(event) =>
                setTimewarpDuration(Number(event.currentTarget.value) as typeof timewarpDuration)
              }
            >
              {DEBUG_TIMEWARP_DURATIONS_MS.map((duration) => (
                <option key={duration} value={duration}>
                  {duration} ms
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{copy.timewarpMultiplierControl}</span>
            <select
              data-testid="debug-control-timewarp-multiplier"
              value={timewarpMultiplier}
              onChange={(event) =>
                setTimewarpMultiplier(
                  Number(event.currentTarget.value) as typeof timewarpMultiplier,
                )
              }
            >
              {DEBUG_TIMEWARP_MULTIPLIERS.map((multiplier) => (
                <option key={multiplier} value={multiplier}>
                  ×{multiplier}
                </option>
              ))}
            </select>
          </label>
          <button
            data-testid="debug-action-timewarp"
            type="button"
            onClick={() =>
              runAction(action, { timewarpDurationMs: timewarpDuration, timewarpMultiplier })
            }
          >
            {copy.apply}
          </button>
        </>
      );
    } else if (action === "trigger-event") {
      const eventReason = selectedEventEligible
        ? null
        : eventAvailableReason(selectedEvent, snapshot.locale);
      controls = (
        <>
          <label>
            <span>{copy.eventControl}</span>
            <select
              data-testid="debug-control-trigger-event"
              value={selectedEvent}
              onChange={(event) => setSelectedEvent(event.currentTarget.value as RandomEventId)}
            >
              {RANDOM_EVENT_IDS.map((id) => {
                const eligible = eventStates.find((entry) => entry.id === id)?.eligible ?? false;
                return (
                  <option key={id} value={id}>
                    {randomEventName(snapshot.locale, id)} —{" "}
                    {eligible
                      ? copy.available
                      : `${copy.unavailable}: ${copy.eventUnavailableReason}`}
                  </option>
                );
              })}
            </select>
          </label>
          <button
            data-testid="debug-action-trigger-event"
            type="button"
            disabled={disabled}
            onClick={() => runAction(action, { eventId: selectedEvent })}
          >
            {copy.apply}
          </button>
          <small
            id="debug-reason-trigger-event"
            data-testid="debug-reason-trigger-event"
            className={selectedEventEligible ? undefined : "red-disabled-text"}
          >
            {selectedEventEligible ? copy.eventAvailabilityHint : eventReason}
          </small>
        </>
      );
    } else if (action === "set-news-ticker") {
      const feedbackReason = copy.feedbackCategoryReason;
      controls = (
        <>
          <label>
            <span>{copy.newsCategoryControl}</span>
            <select
              data-testid="debug-control-set-news-ticker-category"
              value={newsCategory}
              onChange={(event) => setNewsCategory(event.currentTarget.value as DebugNewsCategory)}
            >
              <option value="random">{copy.categoryRandom}</option>
              <option value="oneOff">{copy.categoryOneOff}</option>
              <option value="prize">{copy.categoryPrize}</option>
              <option value="wackyEffects">{copy.categoryWackyEffects}</option>
              <option value="feedback" disabled>
                {copy.categoryFeedback}
              </option>
              <option value="manuscriptClue">{copy.categoryManuscriptClue}</option>
            </select>
          </label>
          <label>
            <span>{copy.newsIntervalControl}</span>
            <select
              data-testid="debug-control-set-news-ticker-interval"
              value={newsInterval}
              onChange={(event) =>
                setNewsInterval(
                  event.currentTarget.value === "default"
                    ? "default"
                    : (Number(event.currentTarget.value) as 10_000 | 20_000),
                )
              }
            >
              <option value="default">{copy.intervalDefault}</option>
              <option value="20000">{copy.interval20000}</option>
              <option value="10000">{copy.interval10000}</option>
            </select>
          </label>
          <button
            data-testid="debug-action-set-news-ticker"
            type="button"
            disabled={disabled}
            onClick={() => runAction(action, { newsCategory, newsInterval })}
          >
            {copy.apply}
          </button>
          <small
            id="debug-reason-set-news-ticker-feedback"
            data-testid="debug-reason-set-news-ticker-feedback"
            className="red-disabled-text"
          >
            {feedbackReason}
          </small>
        </>
      );
    } else {
      const placeholderReason = reason;
      controls = (
        <>
          <button
            data-testid={`debug-action-${action}`}
            type="button"
            disabled={disabled}
            aria-describedby={placeholderReason ? `debug-reason-${action}` : undefined}
            onClick={() => runAction(action)}
          >
            {action === "hold-enter-to-gain"
              ? `${label} (${holdEnterEnabled ? copy.holdEnterOn : copy.holdEnterOff})`
              : label}
          </button>
          {placeholderReason && (
            <small
              id={`debug-reason-${action}`}
              data-testid={`debug-reason-${action}`}
              className="red-disabled-text"
            >
              {placeholderReason}
            </small>
          )}
        </>
      );
    }

    return (
      <div className="debug-scenario-row" key={action}>
        <div className="debug-scenario-label">{label}</div>
        <div className="debug-scenario-controls">{controls}</div>
      </div>
    );
  }

  return (
    <>
      <dialog
        ref={scenarioDialogRef}
        className="debug-tools debug-scenario-menu"
        data-testid="debug-scenario-menu"
        aria-label={copy.menuTitle}
        onCancel={(event) => {
          event.preventDefault();
          onClose();
        }}
        onClose={onClose}
      >
        <div className="debug-titlebar">
          <strong>{copy.menuTitle}</strong>
          <button type="button" className="debug-close" onClick={onClose}>
            {copy.close}
          </button>
        </div>
        <div className="debug-content">
          <dl className="debug-meta">
            <div>
              <dt>{copy.seed}</dt>
              <dd>{seed}</dd>
            </div>
            <div>
              <dt>{copy.clock}</dt>
              <dd>{Math.round(store.getState().run.clock.wallNowMs ?? 0)} ms</dd>
            </div>
            <div>
              <dt>{copy.commandCount}</dt>
              <dd>{commandCount}</dd>
            </div>
            <div>
              <dt>{copy.fps}</dt>
              <dd>{readFrameMetrics().framesPerSecond.toFixed(1)}</dd>
            </div>
          </dl>
          <div className="debug-scenario-groups">
            {ACTION_GROUPS.map((group) => (
              <section className="debug-scenario-group" key={group.heading}>
                <h3>{copy[group.heading]}</h3>
                {group.actions.map(renderAction)}
              </section>
            ))}
          </div>
          <p className="debug-scenario-status" role="status" aria-live="polite">
            {actionStatus}
          </p>
          <details className="debug-test-lab-link">
            <summary>{copy.testLab}</summary>
            <p>Numpad +</p>
          </details>
        </div>
      </dialog>

      <dialog
        ref={labDialogRef}
        className="debug-tools"
        aria-label={t("test.title")}
        onCancel={(event) => {
          event.preventDefault();
          onTestLabClose();
        }}
        onClose={onTestLabClose}
      >
        <div className="debug-titlebar">
          <strong>{t("test.title")}</strong>
          <button type="button" className="debug-close" onClick={onTestLabClose}>
            {t("test.close")}
          </button>
        </div>
        <div className="debug-content">
          <dl className="debug-meta">
            <div>
              <dt>{t("test.seed")}</dt>
              <dd>{seed}</dd>
            </div>
            <div>
              <dt>{t("test.clock")}</dt>
              <dd>{Math.round(store.getState().run.clock.wallNowMs ?? 0)} ms</dd>
            </div>
            <div>
              <dt>{t("test.commands")}</dt>
              <dd>{commandCount}</dd>
            </div>
            <div>
              <dt>{t("test.fps")}</dt>
              <dd>{readFrameMetrics().framesPerSecond.toFixed(1)}</dd>
            </div>
          </dl>
          <div className="debug-actions">
            <button type="button" onClick={() => runScenario("compressor-ready")}>
              {t("test.ready")}
            </button>
            <button type="button" onClick={() => runScenario("storage-ready")}>
              {t("test.storageReady")}
            </button>
            <button type="button" onClick={advanceClock}>
              {t("test.advance")}
            </button>
          </div>
          <label className="debug-search">
            <span>{t("test.search")}</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
            />
          </label>
          <section className="debug-variables" aria-label={t("test.search")}>
            {values.slice(0, 50).map(([path, value]) => (
              <div className="debug-variable" key={path}>
                <code>{path}</code>
                <span>{value}</span>
              </div>
            ))}
            {values.length === 0 && <p>{t("test.search")}</p>}
          </section>
          <details className="debug-log">
            <summary>{t("test.commands")}</summary>
            <ol>
              {(window.miaplacidusTest?.getCommandLog() ?? []).map((entry, index) => (
                <li key={`${entry}-${index}`}>
                  <code>{entry}</code>
                </li>
              ))}
            </ol>
          </details>
        </div>
      </dialog>
    </>
  );
}
