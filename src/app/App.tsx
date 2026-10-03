import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import type { LocaleId } from "../content/ids";
import { LOCALE_IDS, autobuyerUpgradeId } from "../content/ids";
import {
  HYDROGEN_STORAGE_MULTIPLIER,
  HYDROGEN_STORAGE_PRICE_OFFSET,
  hydrogenAutobuyerPrice,
} from "../content/hydrogen";
import { createEconomyTickPlan } from "../engine/economySimulation";
import { checkPreconditions } from "../engine/commands";
import { createGameStore, type GameStore } from "../engine/store";
import { createInitialGameState, type GameState } from "../engine/state";
import {
  selectHydrogenAutobuyerPurchase,
  selectHydrogenCollection,
  selectHydrogenSale,
  selectHydrogenStoragePurchase,
} from "../engine/selectors";
import { displayCurrency, displayQuantity } from "../engine/precision";
import { translate, type MessageKey } from "../i18n/messages";
import { economyLabel } from "../i18n/economyMessages";
import { GameErrorBoundary } from "../ui/GameErrorBoundary";
import { useGameSnapshot } from "../ui/useGameSnapshot";
import { BUILD_INFO } from "./buildInfo";
import { EconomyPanes, economyGoodName, economyRatePerSecond } from "./EconomyPanes";
import { SpaceMiningPane } from "./SpaceMiningPane";
import { StarMapPane } from "./StarMapPane";
import { StarshipPane } from "./StarshipPane";
import { SaveStartScreen } from "./SaveStartScreen";
import { SaveManager } from "./SaveManager";
import {
  acquireSlotLock,
  browserStorage,
  createSaveRepository,
  createSlotId,
  SaveError,
  validatePioneerName,
  type SaveEnvelopeV1,
  type SaveRepository,
} from "../persistence";
import { saveErrorText, saveText } from "../i18n/saveMessages";

const GAME_TABS = [
  { id: "hydrogen", key: "tab.hydrogen" },
  { id: "energy", key: "tab.energy" },
  { id: "research", key: "tab.research" },
  { id: "compounds", key: "tab.compounds" },
  { id: "interstellar", key: "tab.interstellar" },
  { id: "space-mining", key: "tab.spaceMining" },
  { id: "galaxy", key: "tab.galaxy" },
  { id: "cosmic-rip", key: "tab.cosmicRip" },
  { id: "settings", key: "tab.settings" },
] as const satisfies readonly { id: string; key: MessageKey }[];

interface BootOptions {
  readonly seed: number;
  readonly locale: LocaleId;
}

interface FrameMetrics {
  frames: number;
  firstFrameAt: number | null;
  lastFrameAt: number | null;
}

interface GameSessionProps {
  readonly store: GameStore;
  readonly testClock: TestClock;
  readonly seed: number;
  readonly frameMetrics: FrameMetrics;
  readonly repository: SaveRepository | null;
  readonly slotId: string;
  readonly revision: number;
  readonly persistent: boolean;
  readonly initialHydrogenBriefingPending: boolean;
  readonly initialWarning?: string | undefined;
  readonly onExit: (prefillName?: string) => void;
  readonly onDeleteActive: () => void;
  readonly onReplaceActive: (envelope: SaveEnvelopeV1) => void;
  readonly onSaveAsNew: (envelope: SaveEnvelopeV1, releaseLock: () => void) => void;
}

class TestClock {
  private current = Date.now();

  now(): number {
    return this.current;
  }

  advance(milliseconds: number): number {
    this.current += milliseconds;
    return this.current;
  }

  set(milliseconds: number): void {
    this.current = milliseconds;
  }
}

function bootOptions(): BootOptions {
  if (!BUILD_INFO.isTest) return { seed: 80, locale: "en" };
  const parameters = new URLSearchParams(window.location.search);
  const candidateSeed = Number(parameters.get("testSeed"));
  const requestedLocale = parameters.get("testLocale");
  return {
    seed: Number.isSafeInteger(candidateSeed) && candidateSeed >= 0 ? candidateSeed : 80,
    locale: LOCALE_IDS.includes(requestedLocale as LocaleId) ? (requestedLocale as LocaleId) : "en",
  };
}

function formatNumber(
  locale: LocaleId,
  value: number,
  maximumFractionDigits = 0,
  notation: GameState["settings"]["notation"] = "standard",
): string {
  return new Intl.NumberFormat(
    locale,
    notation === "scientific"
      ? { notation: "scientific", maximumSignificantDigits: Math.max(1, maximumFractionDigits + 1) }
      : { maximumFractionDigits },
  ).format(value);
}

function formatMoney(locale: LocaleId, value: number): string {
  const numericValue = Number(displayCurrency(value));
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

function localizedReason(locale: LocaleId, key: string | undefined, required?: number): string {
  if (key === "ui.hydrogen.inventory-full") return translate(locale, "reason.inventory-full");
  if (key === "ui.hydrogen.no-stock") return translate(locale, "reason.no-stock");
  if (key === "ui.hydrogen.autobuyer-locked") return translate(locale, "reason.autobuyer-locked");
  if (key === "engine.purchase.insufficient-material") {
    return `${translate(locale, "reason.insufficient")} ${formatNumber(locale, required ?? 0)} H\u2082.`;
  }
  return key ?? "";
}

export function App() {
  const initial = useState(bootOptions)[0];
  const repository = useState<SaveRepository | null>(() => {
    if (
      BUILD_INFO.isTest &&
      new URLSearchParams(window.location.search).get("testStorage") === "blocked"
    )
      return null;
    try {
      return createSaveRepository(browserStorage());
    } catch {
      return null;
    }
  })[0];
  const [locale, setLocale] = useState<LocaleId>(() => {
    const preference = repository?.readPreferences().locale;
    return LOCALE_IDS.includes(preference as LocaleId) && !BUILD_INFO.isTest
      ? (preference as LocaleId)
      : initial.locale;
  });
  const [pioneerName, setPioneerName] = useState(() => {
    const lastStarted = repository?.lastStartedSlot();
    if (lastStarted) {
      try {
        const lastSlot = repository?.readSlot(lastStarted);
        if (lastSlot) return lastSlot.pioneerName;
      } catch {
        /* A bad pointer never selects a different slot. */
      }
    }
    try {
      const remembered = repository?.readPreferences().lastConfirmedName;
      return remembered ? validatePioneerName(remembered).display : "Pioneer";
    } catch {
      return "Pioneer";
    }
  });
  const [store, setStore] = useState<GameStore | null>(null);
  const [session, setSession] = useState<{
    slotId: string;
    revision: number;
    persistent: boolean;
    hydrogenBriefingPending: boolean;
    releaseLock: () => void;
    warning?: string;
  } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [selectionError, setSelectionError] = useState("");
  const [selectionNotice, setSelectionNotice] = useState("");
  const [starting, setStarting] = useState(false);
  const [slotRefresh, setSlotRefresh] = useState(0);
  const testClock = useMemo(() => new TestClock(), []);
  const frameMetrics = useMemo<FrameMetrics>(
    () => ({ frames: 0, firstFrameAt: null, lastFrameAt: null }),
    [],
  );
  useEffect(() => {
    document.documentElement.lang = store?.getState().settings.locale ?? locale;
  }, [locale, store]);
  function setDraftName(name: string) {
    setPioneerName(name);
    setConfirmed(false);
    setSelectionError("");
    setSelectionNotice("");
  }
  function setDraftLocale(nextLocale: LocaleId) {
    setLocale(nextLocale);
    setConfirmed(false);
    setSelectionError("");
    setSelectionNotice("");
  }
  function confirmSelection() {
    try {
      const name = validatePioneerName(pioneerName);
      const matches = repository?.findByName(name.display) ?? [];
      if (matches.length > 1)
        throw new SaveError("duplicate-name", "Duplicate local save names need recovery.");
      setPioneerName(name.display);
      repository?.writePreferences({ locale, lastConfirmedName: name.display });
      setConfirmed(true);
      setSelectionError("");
      setSelectionNotice("");
    } catch (error) {
      setSelectionError(
        saveErrorText(locale, error instanceof SaveError ? error.code : "invalid-envelope"),
      );
    }
  }

  async function startConfirmedRun() {
    if (!confirmed || starting) return;
    setStarting(true);
    setSelectionError("");
    setSelectionNotice("");
    let releaseLock = () => {};
    let unsavedWarning = "";
    try {
      const name = validatePioneerName(pioneerName);
      const matches = repository?.findByName(name.display) ?? [];
      if (matches.length > 1)
        throw new SaveError("duplicate-name", "Duplicate local save names need recovery.");
      const existing = matches[0];
      if (existing && existing.status !== "ready")
        throw new SaveError("corrupt-slot", "This save is damaged.");
      const slotId = existing?.slotId ?? createSlotId();
      const hydrogenBriefingPending = existing
        ? (repository?.needsHydrogenBriefing(slotId) ?? false)
        : true;
      let persistent = repository !== null;
      if (!repository) unsavedWarning = saveErrorText(locale, "storage-unavailable");
      if (repository) {
        const acquired = await acquireSlotLock(slotId);
        if (acquired) releaseLock = acquired;
        else {
          persistent = false;
          unsavedWarning = saveErrorText(locale, "conflict");
        }
      }
      const now = Date.now();
      let nextState: GameState;
      let revision = 0;
      if (existing && repository) {
        const envelope = repository.readSlot(slotId);
        if (!envelope) throw new SaveError("not-found", "This save could not be found.");
        nextState = {
          ...envelope.state,
          run: {
            ...envelope.state.run,
            pioneerName: envelope.pioneerName,
            clock: {
              ...envelope.state.run.clock,
              foreground: false,
              hiddenElapsedMs: 0,
              pendingForegroundMs: 0,
            },
          },
          settings: { ...envelope.state.settings, locale },
        };
        revision = envelope.revision;
        try {
          repository.activate(slotId);
        } catch {
          persistent = false;
          unsavedWarning = saveErrorText(locale, "storage-unavailable");
        }
      } else {
        let fresh = createInitialGameState({
          pioneerName: name.display,
          seed: initial.seed,
          locale,
        });
        if (MIAPLACIDUS_BUILD_MODE === "test") {
          const fixture = new URLSearchParams(window.location.search).get("economyFixture");
          if (
            [
              "full",
              "research",
              "infinite-power",
              "power-deficit",
              "battery-cycle",
              "storage",
              "storage-efficient",
              "storage-each",
              "storage-compounds",
              "storage-all",
              "water-storage",
              "water-storage-short",
              "save",
              "bulk-hydrogen",
              "bulk-science",
              "bulk-energy",
              "power-buildings",
              "buyer-tiers",
              "compound-automation",
              "multipliers",
              "space-telescope",
              "space-starship",
              "space-starship-ready",
              "space-starship-scanning",
              "space-diplomacy",
              "space-battle-victory",
              "space-battle-defeat",
              "space-diplomacy-power",
              "space-diplomacy-power-fail",
              "space-diplomacy-aggressive",
              "space-bully-scared",
              "space-bully-surrender",
              "space-unoccupied",
              "space-late-game",
              "space-manuscript-hidden",
            ].includes(fixture ?? "")
          ) {
            const { createEconomyFixture } = await import("./testing/economyFixtures");
            fresh = createEconomyFixture(
              fixture as Parameters<typeof createEconomyFixture>[0],
              locale,
            );
            fresh = { ...fresh, run: { ...fresh.run, pioneerName: name.display } };
          }
        }
        nextState = {
          ...fresh,
          run: { ...fresh.run, clock: { ...fresh.run.clock, wallNowMs: now, foreground: true } },
        };
        if (repository && persistent) {
          try {
            const created = repository.createFresh(slotId, nextState, name.display, now);
            revision = created.revision;
            try {
              repository.activate(slotId);
            } catch {
              persistent = false;
            }
          } catch (error) {
            if (
              error instanceof SaveError &&
              ["duplicate-name", "corrupt-slot"].includes(error.code)
            )
              throw error;
            persistent = false;
            unsavedWarning = saveErrorText(
              locale,
              error instanceof SaveError ? error.code : "storage-unavailable",
            );
          }
        }
      }
      if (BUILD_INFO.isTest || BUILD_INFO.isDevelopment) testClock.set(now);
      const nextStore = createGameStore(nextState, {
        clock: {
          now: () => (BUILD_INFO.isTest || BUILD_INFO.isDevelopment ? testClock.now() : Date.now()),
        },
      });
      setStore(nextStore);
      setSession({
        slotId,
        revision,
        persistent,
        hydrogenBriefingPending,
        releaseLock,
        warning: unsavedWarning,
      });
      setConfirmed(false);
    } catch (error) {
      releaseLock();
      setSelectionError(
        saveErrorText(locale, error instanceof SaveError ? error.code : "storage-unavailable"),
      );
    } finally {
      setStarting(false);
    }
  }

  async function recoverAtBoot(reference: string) {
    if (!repository) return;
    const match = reference.match(/^orphan:([a-f0-9-]{16,64}):([a-f0-9-]{16,64})$/i);
    if (!match?.[1]) return;
    const release = await acquireSlotLock(match[1]);
    if (!release) {
      setSelectionError(saveErrorText(locale, "conflict"));
      return;
    }
    try {
      const recovered = repository.restoreGeneration(reference, Date.now());
      setPioneerName(recovered.pioneerName);
      setSelectionError("");
      setSelectionNotice(saveText(locale, "recovered"));
      setConfirmed(false);
      setSlotRefresh((value) => value + 1);
    } catch (error) {
      setSelectionError(
        saveErrorText(locale, error instanceof SaveError ? error.code : "corrupt-slot"),
      );
    } finally {
      release();
    }
  }

  function exitRun(prefillName?: string) {
    session?.releaseLock();
    if (prefillName) setPioneerName(prefillName);
    else if (store) setPioneerName(store.getState().run.pioneerName);
    setStore(null);
    setSession(null);
    setConfirmed(false);
  }
  function afterDeleteActive() {
    const fallbackName = repository?.readPreferences().lastConfirmedName ?? "Pioneer";
    setPioneerName(fallbackName);
    session?.releaseLock();
    setStore(null);
    setSession(null);
    setConfirmed(false);
  }
  function replaceActiveSave(envelope: SaveEnvelopeV1) {
    if (!session) return;
    try {
      repository?.completeHydrogenBriefing(envelope.slotId);
    } catch {
      /* The imported state remains valid and playable. */
    }
    const nextState = {
      ...envelope.state,
      run: { ...envelope.state.run, clock: { ...envelope.state.run.clock, foreground: false } },
    };
    setStore(
      createGameStore(nextState, {
        clock: {
          now: () => (BUILD_INFO.isTest || BUILD_INFO.isDevelopment ? testClock.now() : Date.now()),
        },
      }),
    );
    setSession({ ...session, revision: envelope.revision });
    setLocale(envelope.state.settings.locale);
  }
  function switchToNewSaved(envelope: SaveEnvelopeV1, newLockRelease: () => void) {
    session?.releaseLock();
    const nextState = {
      ...envelope.state,
      run: {
        ...envelope.state.run,
        clock: {
          ...envelope.state.run.clock,
          foreground: true,
          hiddenElapsedMs: 0,
          pendingForegroundMs: 0,
        },
      },
    };
    setStore(
      createGameStore(nextState, {
        clock: {
          now: () => (BUILD_INFO.isTest || BUILD_INFO.isDevelopment ? testClock.now() : Date.now()),
        },
      }),
    );
    setSession({
      slotId: envelope.slotId,
      revision: envelope.revision,
      persistent: true,
      hydrogenBriefingPending: false,
      releaseLock: newLockRelease,
    });
    setLocale(envelope.state.settings.locale);
  }

  const activeLocale = store?.getState().settings.locale ?? locale;
  const t = (key: MessageKey) => translate(activeLocale, key);
  return (
    <GameErrorBoundary
      onRecover={() => store?.recover()}
      messages={{
        title: t("error.title"),
        detail: t("error.detail"),
        continue: t("error.continue"),
      }}
    >
      <main
        className="application-shell"
        data-app-ready
        data-build-mode={BUILD_INFO.mode}
        data-build-variant={BUILD_INFO.isDemo ? "demo" : "full"}
      >
        {store && session ? (
          <GameSession
            key={session.slotId}
            store={store}
            testClock={testClock}
            seed={initial.seed}
            frameMetrics={frameMetrics}
            repository={repository}
            slotId={session.slotId}
            revision={session.revision}
            persistent={session.persistent}
            initialHydrogenBriefingPending={session.hydrogenBriefingPending}
            initialWarning={session.warning}
            onExit={exitRun}
            onDeleteActive={afterDeleteActive}
            onReplaceActive={replaceActiveSave}
            onSaveAsNew={switchToNewSaved}
          />
        ) : (
          <SaveStartScreen
            key={slotRefresh}
            locale={locale}
            setLocale={setDraftLocale}
            name={pioneerName}
            setName={setDraftName}
            slots={repository?.list() ?? []}
            confirmed={confirmed}
            error={selectionError}
            notice={selectionNotice}
            storageAvailable={repository !== null}
            onConfirm={confirmSelection}
            onStart={() => void startConfirmedRun()}
            onEdit={() => setConfirmed(false)}
            onRecover={(reference) => void recoverAtBoot(reference)}
          />
        )}
      </main>
    </GameErrorBoundary>
  );
}

function GameSession({
  store,
  testClock,
  seed,
  frameMetrics,
  repository,
  slotId,
  revision: initialRevision,
  persistent: initialPersistent,
  initialHydrogenBriefingPending,
  initialWarning,
  onExit,
  onDeleteActive,
  onReplaceActive,
  onSaveAsNew,
}: GameSessionProps) {
  const snapshot = useGameSnapshot(store);
  const [activeTab, setActiveTab] = useState("hydrogen");
  const [sellAmount, setSellAmount] = useState<number | "all">("all");
  const [feedback, setFeedback] = useState("");
  const [saveManagerOpen, setSaveManagerOpen] = useState(false);
  const [saveRevision, setSaveRevision] = useState(initialRevision);
  const saveRevisionRef = useRef(initialRevision);
  const [savePersistent, setSavePersistent] = useState(initialPersistent);
  const [hydrogenBriefingPending, setHydrogenBriefingPending] = useState(
    initialHydrogenBriefingPending,
  );
  const [saveWritesPaused, setSaveWritesPaused] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [saveFailure, setSaveFailure] = useState(initialWarning ?? "");
  const [exitConfirmation, setExitConfirmation] = useState(false);
  const [pendingPioneerName, setPendingPioneerName] = useState<string | null>(null);
  const exitDialogRef = useRef<HTMLDialogElement>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(
    repository?.readPreferences().autoSaveEnabled ?? true,
  );
  const [autoSaveInterval, setAutoSaveInterval] = useState<10 | 30 | 60>(
    repository?.readPreferences().autoSaveIntervalSeconds ?? 10,
  );
  const [debugLabOpen, setDebugLabOpen] = useState(false);
  const currentLocaleRef = useRef(snapshot.locale);
  useEffect(() => {
    currentLocaleRef.current = snapshot.locale;
  }, [snapshot.locale]);
  useEffect(() => {
    if (exitConfirmation && !exitDialogRef.current?.open) exitDialogRef.current?.showModal();
  }, [exitConfirmation]);
  const [DebugTools, setDebugTools] = useState<ComponentType<{
    store: GameStore;
    seed: number;
    open: boolean;
    onClose: () => void;
    advanceBy: (milliseconds: number) => void;
    readFrameMetrics: () => {
      readonly frames: number;
      readonly durationMs: number;
      readonly framesPerSecond: number;
    };
  }> | null>(null);
  const t = (key: MessageKey) => translate(snapshot.locale, key);
  const hydrogen = snapshot.goods.hydrogen;
  const storagePurchase = selectHydrogenStoragePurchase(store.getState());
  const autobuyerPurchase = selectHydrogenAutobuyerPurchase(store.getState());
  const collection = selectHydrogenCollection(store.getState());
  const sale = selectHydrogenSale(store.getState(), sellAmount);
  const buyerCount = snapshot.upgrades[autobuyerUpgradeId("hydrogen", 1)] ?? 0;
  const buyerPrice = hydrogenAutobuyerPrice(buyerCount);
  const saveLabel = useCallback(
    (key: Parameters<typeof saveText>[1]) => saveText(snapshot.locale, key),
    [snapshot.locale],
  );

  const persistCurrent = useCallback(
    (automatic = false) => {
      const current = store.getState();
      const autoSavePaused =
        automatic &&
        (hydrogenBriefingPending ||
          Object.values(current.run.timers).some(
            (timer) =>
              timer.status === "running" &&
              (timer.domain === "battle" || timer.domain === "travel"),
          ));
      if (autoSavePaused) return null;
      if (!repository || !savePersistent) {
        setSaveStatus(saveLabel("unsaved"));
        return null;
      }
      if (saveWritesPaused) return null;
      const durableState: GameState = {
        ...current,
        run: {
          ...current.run,
          clock: {
            ...current.run.clock,
            foreground: false,
            hiddenElapsedMs: 0,
            pendingForegroundMs: 0,
          },
        },
      };
      try {
        const saved = repository.commit(
          slotId,
          durableState,
          current.run.pioneerName,
          Date.now(),
          saveRevisionRef.current,
        );
        saveRevisionRef.current = saved.revision;
        setSaveRevision(saved.revision);
        setSaveStatus(saveLabel("saved"));
        setSaveFailure("");
        return saved;
      } catch (error) {
        const errorCode = error instanceof SaveError ? error.code : "storage-unavailable";
        setSaveFailure(saveErrorText(currentLocaleRef.current, errorCode));
        setSaveStatus("");
        if (errorCode === "conflict" || errorCode === "corrupt-slot") setSaveWritesPaused(true);
        if (errorCode === "storage-unavailable") setSavePersistent(false);
        return null;
      }
    },
    [
      repository,
      savePersistent,
      saveWritesPaused,
      store,
      slotId,
      saveLabel,
      hydrogenBriefingPending,
    ],
  );

  function finishHydrogenBriefing() {
    if (repository && savePersistent && !saveWritesPaused) {
      try {
        repository.completeHydrogenBriefing(slotId);
      } catch (error) {
        setSaveFailure(
          saveErrorText(
            currentLocaleRef.current,
            error instanceof SaveError ? error.code : "storage-unavailable",
          ),
        );
      }
    }
    setHydrogenBriefingPending(false);
  }

  useEffect(() => {
    let timeout: number | null = null;
    const schedule = () => {
      if (!autoSaveEnabled || !savePersistent || saveWritesPaused || timeout !== null) return;
      timeout = window.setTimeout(() => {
        timeout = null;
        persistCurrent(true);
      }, autoSaveInterval * 1000);
    };
    const unsubscribe = store.subscribe(schedule);
    const onPageHide = () => {
      persistCurrent(true);
    };
    window.addEventListener("pagehide", onPageHide);
    return () => {
      if (timeout !== null) window.clearTimeout(timeout);
      unsubscribe();
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [store, autoSaveEnabled, autoSaveInterval, savePersistent, saveWritesPaused, persistCurrent]);

  useEffect(() => {
    if (!repository) return;
    const onStorage = (event: StorageEvent) => {
      if (event.key === "miaplacidus:v1:head:" + slotId) {
        setSaveWritesPaused(true);
        setSaveFailure(saveErrorText(currentLocaleRef.current, "conflict"));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [repository, slotId]);

  function persistRename(name: string) {
    if (!repository || !savePersistent || saveWritesPaused)
      throw new SaveError("storage-unavailable", "The active slot is read-only.");
    const renamed = repository.rename(slotId, name, Date.now(), saveRevisionRef.current);
    saveRevisionRef.current = renamed.revision;
    setSaveRevision(renamed.revision);
    onReplaceActive(renamed);
    setSaveStatus(saveLabel("saved"));
  }

  function switchToPioneerSelection(name: string) {
    if (savePersistent && !saveWritesPaused && persistCurrent()) {
      onExit(name);
      return;
    }
    setPendingPioneerName(name);
    setSaveManagerOpen(false);
    setExitConfirmation(true);
  }

  async function saveRunAsNew(name: string) {
    if (!repository) throw new SaveError("storage-unavailable", "Browser storage is unavailable.");
    const newSlotId = createSlotId();
    const newLockRelease = await acquireSlotLock(newSlotId);
    if (!newLockRelease) throw new SaveError("conflict", "A single-writer lock is not available.");
    const current = store.getState();
    const durableState: GameState = {
      ...current,
      run: {
        ...current.run,
        clock: {
          ...current.run.clock,
          foreground: false,
          hiddenElapsedMs: 0,
          pendingForegroundMs: 0,
        },
      },
    };
    try {
      const created = repository.create(newSlotId, durableState, name, Date.now());
      repository.activate(newSlotId);
      onSaveAsNew(created, newLockRelease);
    } catch (error) {
      newLockRelease();
      throw error;
    }
  }
  const advanceTestClock = useCallback(
    (milliseconds: number) => {
      if (!Number.isFinite(milliseconds) || milliseconds <= 0) return;
      const previous = store.getState().run.clock.wallNowMs ?? 0;
      const next = BUILD_INFO.isTest
        ? testClock.advance(milliseconds)
        : Math.max(Date.now(), previous + milliseconds);
      if (BUILD_INFO.isDevelopment && !BUILD_INFO.isTest) testClock.set(next);
      const state = store.getState();
      const tickPlan = createEconomyTickPlan(state).tickPlan;
      const input = { wallNowMs: next, foreground: true };
      const advanceCommand = {
        type: "clock.advance",
        input,
        tickPlan,
        offlineTickPlan: tickPlan,
      } as const;
      store.dispatch(advanceCommand);
      let catchupCount = 0;
      while (store.getState().run.clock.pendingForegroundMs > 0 && catchupCount < 10_000) {
        store.dispatch(advanceCommand);
        catchupCount += 1;
      }
      store.publishNow();
    },
    [store, testClock],
  );

  useEffect(() => {
    document.documentElement.lang = snapshot.locale;
  }, [snapshot.locale]);

  useEffect(() => {
    const wallNow = () =>
      BUILD_INFO.isTest || BUILD_INFO.isDevelopment ? testClock.now() : Date.now();
    const onVisibilityChange = () => {
      const current = store.getState();
      const tickPlan = createEconomyTickPlan(current).tickPlan;
      store.dispatch({
        type: "clock.advance",
        input: { wallNowMs: wallNow(), foreground: document.visibilityState === "visible" },
        tickPlan,
        offlineTickPlan: tickPlan,
      });
      store.publishNow();
      if (document.visibilityState === "hidden") persistCurrent(true);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    let frame = 0;
    const tick = (timestamp: number) => {
      frameMetrics.frames += 1;
      frameMetrics.firstFrameAt ??= timestamp;
      frameMetrics.lastFrameAt = timestamp;
      const state = store.getState();
      const tickPlan = createEconomyTickPlan(state).tickPlan;
      store.dispatch({
        type: "clock.advance",
        input: {
          wallNowMs: wallNow(),
          foreground: document.visibilityState === "visible",
        },
        tickPlan,
        offlineTickPlan: tickPlan,
      });
      store.publishIfDue();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [store, testClock, frameMetrics, persistCurrent]);

  useEffect(() => {
    if (!import.meta.env.DEV && MIAPLACIDUS_BUILD_MODE !== "test") return;
    const toggleTestLab = (event: KeyboardEvent) => {
      if (event.code !== "NumpadSubtract" || event.repeat) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }
      event.preventDefault();
      setDebugLabOpen((isOpen) => !isOpen);
    };
    window.addEventListener("keydown", toggleTestLab);
    let removeGateway = () => {};
    let cancelled = false;
    void import("./testing/DebugTools").then((module) => {
      if (cancelled) return;
      setDebugTools(() => module.DebugTools);
      removeGateway = module.installDebugGateway({
        store,
        seed,
        advanceBy: advanceTestClock,
        readFrameMetrics: () => {
          const durationMs = Math.max(
            0,
            (frameMetrics.lastFrameAt ?? 0) - (frameMetrics.firstFrameAt ?? 0),
          );
          return {
            frames: frameMetrics.frames,
            durationMs,
            framesPerSecond: durationMs > 0 ? (frameMetrics.frames * 1000) / durationMs : 0,
          };
        },
      });
    });
    return () => {
      cancelled = true;
      removeGateway();
      window.removeEventListener("keydown", toggleTestLab);
    };
  }, [store, seed, frameMetrics, advanceTestClock]);

  function send(command: Parameters<GameStore["dispatch"]>[0], successKey: MessageKey): void {
    const result = store.dispatch(command);
    if (result.accepted) {
      setFeedback(t(successKey));
    } else {
      setFeedback(
        localizedReason(
          snapshot.locale,
          result.failure?.messageKey,
          result.failure?.code === "insufficient-material" ? result.failure.required : undefined,
        ),
      );
    }
  }

  const localeOptions = LOCALE_IDS.map((id) => (
    <option key={id} value={id}>
      {id.toUpperCase()}
    </option>
  ));

  return (
    <div className="game-frame" data-engine-revision={snapshot.revision}>
      <h1 className="sr-only">{t("app.brand")}</h1>
      <header className="game-header">
        <a className="game-wordmark" href="#game" aria-label={t("app.brand")}>
          {t("app.brand")}
        </a>
        <div className="run-name">
          <span className="status-dot" aria-hidden="true" />
          {snapshot.pioneerName}
        </div>
        <div className="header-balances">
          <div>
            <span className="balance-label">{t("header.cash")}</span>
            <strong data-testid="cash-balance">
              {formatMoney(snapshot.locale, snapshot.cash)}
            </strong>
          </div>
          <div>
            <span className="balance-label">{t("header.research")}</span>
            <strong>
              {formatNumber(snapshot.locale, snapshot.researchPoints, 0, snapshot.notation)}
            </strong>
          </div>
        </div>
      </header>
      <section className="save-toolbar" aria-label={saveLabel("manage")}>
        <output
          className={savePersistent ? "save-state saved-state" : "save-state unsaved-state"}
          data-testid="save-status"
        >
          {saveFailure ||
            saveStatus ||
            (savePersistent ? saveLabel("saved") : saveLabel("unsaved"))}
        </output>
        <label className="autosave-toggle">
          <input
            type="checkbox"
            checked={autoSaveEnabled}
            onChange={(event) => {
              const enabled = event.currentTarget.checked;
              setAutoSaveEnabled(enabled);
              repository?.writePreferences({ autoSaveEnabled: enabled });
            }}
          />
          {saveLabel("autoSave")}
        </label>
        <label className="autosave-interval">
          <span>{saveLabel("saveFrequency")}</span>
          <select
            aria-label={saveLabel("saveFrequency")}
            value={autoSaveInterval}
            onChange={(event) => {
              const interval = Number(event.currentTarget.value) as 10 | 30 | 60;
              setAutoSaveInterval(interval);
              repository?.writePreferences({ autoSaveIntervalSeconds: interval });
            }}
          >
            <option value={10}>{saveLabel("every10")}</option>
            <option value={30}>{saveLabel("every30")}</option>
            <option value={60}>{saveLabel("every60")}</option>
          </select>
        </label>
        <button className="secondary-button" type="button" onClick={() => persistCurrent()}>
          {saveLabel("saveNow")}
        </button>
        <button className="secondary-button" type="button" onClick={() => setSaveManagerOpen(true)}>
          {saveLabel("manage")}
        </button>
        <button
          className="text-button"
          type="button"
          onClick={() => {
            if (!savePersistent || saveWritesPaused) {
              setExitConfirmation(true);
              return;
            }
            if (persistCurrent()) onExit();
            else setExitConfirmation(true);
          }}
        >
          {saveLabel("back")}
        </button>
      </section>
      {exitConfirmation && (
        <dialog
          ref={exitDialogRef}
          className="save-manager exit-save-dialog"
          aria-label={saveLabel("unsaved")}
          data-testid="unsaved-exit-dialog"
        >
          <p className="save-warning">{saveFailure || saveLabel("leaveWarning")}</p>
          <div className="save-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setExitConfirmation(false);
                setSaveManagerOpen(true);
              }}
            >
              {saveLabel("manage")}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setExitConfirmation(false);
                setPendingPioneerName(null);
              }}
            >
              {saveLabel("stay")}
            </button>
            <button
              className="danger-button"
              type="button"
              onClick={() => onExit(pendingPioneerName ?? undefined)}
            >
              {saveLabel("discardRun")}
            </button>
          </div>
        </dialog>
      )}
      {saveWritesPaused && (
        <div className="save-conflict-banner" role="alert">
          <span>{saveFailure}</span>
          <button
            className="secondary-button"
            type="button"
            onClick={() => window.location.reload()}
          >
            {saveLabel("reload")}
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => setSaveManagerOpen(true)}
          >
            {saveLabel("export")}
          </button>
        </div>
      )}

      <nav aria-label={t("nav.label")}>
        <div className="game-nav" aria-label={t("nav.label")} role="tablist">
          {GAME_TABS.map((tab, index) => {
            const selected = activeTab === tab.id;
            const currentState = store.getState();
            const available =
              tab.id === "hydrogen" ||
              tab.id === "research" ||
              (tab.id === "energy" &&
                currentState.run.economy.researchedTechnologies.includes("basicPowerGeneration")) ||
              (tab.id === "compounds" &&
                currentState.run.economy.researchedTechnologies.includes("compounds")) ||
              (tab.id === "interstellar" &&
                currentState.run.economy.researchedTechnologies.includes("stellarCartography")) ||
              (tab.id === "space-mining" &&
                currentState.run.economy.researchedTechnologies.includes("atmosphericTelescopes"));
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                className={`nav-tab${selected ? " is-selected" : ""}${!available ? " is-locked" : ""}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`pane-${tab.id}`}
                aria-disabled={!available}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                  event.preventDefault();
                  const direction = event.key === "ArrowRight" ? 1 : -1;
                  const next = (index + direction + GAME_TABS.length) % GAME_TABS.length;
                  const nextTab = GAME_TABS[next];
                  if (!nextTab) return;
                  setActiveTab(nextTab.id);
                  document.getElementById(`tab-${nextTab.id}`)?.focus();
                }}
              >
                <span className="nav-index">0{index + 1}</span>
                <span>{t(tab.key)}</span>
                {!available && (
                  <span className="lock-glyph" aria-hidden="true">
                    {"\u00b7"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {hydrogenBriefingPending && (
        <aside
          className="hydrogen-briefing"
          aria-labelledby="hydrogen-briefing-title"
          data-testid="hydrogen-onboarding"
        >
          <div>
            <p className="eyebrow">{saveLabel("hydrogenBriefingEyebrow")}</p>
            <h2 id="hydrogen-briefing-title">{saveLabel("hydrogenBriefingTitle")}</h2>
            <p>{saveLabel("hydrogenBriefingBody")}</p>
          </div>
          <button className="primary-button" type="button" onClick={finishHydrogenBriefing}>
            {saveLabel("hydrogenBriefingContinue")}
          </button>
        </aside>
      )}

      <div className="main-layout">
        <aside className="resource-rail" aria-label={t("tab.hydrogen")}>
          <div className="rail-heading">{t("tab.hydrogen")}</div>
          {store.getState().run.unlockedResources.map((goodId, index) => {
            const good = store.getState().run.goods[goodId];
            const rate = economyRatePerSecond(store.getState(), goodId);
            return (
              <button
                key={goodId}
                className={`resource-item${goodId === "hydrogen" ? " is-current" : ""}`}
                type="button"
                onClick={() => {
                  setActiveTab("hydrogen");
                  document
                    .querySelector(`[data-resource-id="${goodId}"]`)
                    ?.scrollIntoView({ block: "nearest" });
                }}
              >
                <span className="element-tile" aria-hidden="true">
                  <small>{index + 1}</small>
                  {goodId.slice(0, 1).toUpperCase()}
                </span>
                <span className="resource-item-copy">
                  <strong>
                    {goodId === "hydrogen"
                      ? t("hydrogen.title")
                      : economyGoodName(snapshot.locale, goodId)}
                  </strong>
                  <small>
                    {formatNumber(
                      snapshot.locale,
                      snapshot.notation === "scientific"
                        ? good.quantity
                        : displayQuantity(good.quantity),
                      0,
                      snapshot.notation,
                    )}{" "}
                    / {formatNumber(snapshot.locale, good.storageCapacity, 0, snapshot.notation)}
                  </small>
                </span>
                <span className="resource-rate">
                  {rate >= 0 ? "+" : "−"}
                  {formatNumber(snapshot.locale, Math.abs(rate), 2, snapshot.notation)}/s
                </span>
              </button>
            );
          })}
          <div className="rail-note">
            <span>01</span>
            <span>{t("pane.locked")}</span>
            <span aria-hidden="true">{"\u00b7\u00b7\u00b7"}</span>
          </div>
        </aside>

        <div className="pane-stack">
          {GAME_TABS.map((tab, index) => (
            <section
              key={tab.id}
              id={`pane-${tab.id}`}
              className="game-pane"
              role="tabpanel"
              aria-labelledby={`tab-${tab.id}`}
              hidden={activeTab !== tab.id}
            >
              {index === 0 ? (
                <>
                  <div className="pane-heading">
                    <div>
                      <p className="eyebrow">01 / {t("tab.hydrogen")}</p>
                      <h2>{t("hydrogen.title")}</h2>
                      <p className="pane-intro">{t("hydrogen.description")}</p>
                    </div>
                    <div className="header-display-settings">
                      <label className="locale-switch" htmlFor="hydrogen-locale">
                        <span>{t("app.locale")}</span>
                        <select
                          id="hydrogen-locale"
                          aria-label={t("app.locale")}
                          value={snapshot.locale}
                          onChange={(event) =>
                            store.dispatch({
                              type: "settings.update",
                              patch: { locale: event.currentTarget.value as LocaleId },
                            })
                          }
                        >
                          {localeOptions}
                        </select>
                      </label>
                      <label className="locale-switch" htmlFor="number-notation">
                        <span>{economyLabel(snapshot.locale, "notation")}</span>
                        <select
                          id="number-notation"
                          aria-label={economyLabel(snapshot.locale, "notation")}
                          value={snapshot.notation}
                          onChange={(event) =>
                            store.dispatch({
                              type: "settings.update",
                              patch: {
                                notation: event.currentTarget
                                  .value as GameState["settings"]["notation"],
                              },
                            })
                          }
                        >
                          <option value="standard">
                            {economyLabel(snapshot.locale, "standardNotation")}
                          </option>
                          <option value="scientific">
                            {economyLabel(snapshot.locale, "scientificNotation")}
                          </option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="hydrogen-hero">
                    <div className="atom-art" aria-hidden="true">
                      <span className="orbit orbit-one" />
                      <span className="orbit orbit-two" />
                      <span className="atom-core">H</span>
                      <span className="atom-spark">{"\u2726"}</span>
                    </div>
                    <div className="stock-readout">
                      <span className="eyebrow">{t("hydrogen.quantity")}</span>
                      <strong data-testid="hydrogen-quantity">
                        {formatNumber(snapshot.locale, hydrogen.quantity, 2, snapshot.notation)}{" "}
                        <small>{"H\u2082"}</small>
                      </strong>
                      <span className="capacity-line">
                        {t("hydrogen.capacity")}{" "}
                        <b data-testid="hydrogen-capacity">
                          {formatNumber(
                            snapshot.locale,
                            hydrogen.storageCapacity,
                            0,
                            snapshot.notation,
                          )}
                        </b>
                      </span>
                      <meter
                        className="capacity-track"
                        aria-label={t("hydrogen.capacity")}
                        min={0}
                        max={hydrogen.storageCapacity}
                        value={Math.min(hydrogen.quantity, hydrogen.storageCapacity)}
                      >
                        {formatNumber(snapshot.locale, hydrogen.quantity, 0, snapshot.notation)} /{" "}
                        {formatNumber(
                          snapshot.locale,
                          hydrogen.storageCapacity,
                          0,
                          snapshot.notation,
                        )}
                      </meter>
                    </div>
                    <div className="rate-readout">
                      <span className="eyebrow">{t("hydrogen.production")}</span>
                      <strong data-testid="hydrogen-rate">
                        +
                        {formatNumber(
                          snapshot.locale,
                          snapshot.hydrogenProductionPerSecond,
                          2,
                          snapshot.notation,
                        )}
                        <small>{"H\u2082/s"}</small>
                      </strong>
                    </div>
                  </div>

                  <button
                    className="primary-button collect-button"
                    type="button"
                    disabled={!collection.enabled}
                    aria-describedby="collect-reason"
                    onClick={() =>
                      send({ type: "resource.collect", goodId: "hydrogen" }, "status.collect")
                    }
                  >
                    <span aria-hidden="true">+</span>
                    {t("hydrogen.collect")}
                  </button>
                  {!collection.enabled && (
                    <p className="control-reason" id="collect-reason">
                      {localizedReason(snapshot.locale, collection.reasonKey)}
                    </p>
                  )}

                  <div className="action-grid">
                    <article className="upgrade-card sale-card">
                      <div className="card-icon" aria-hidden="true">
                        {"\u2197"}
                      </div>
                      <div className="card-copy">
                        <h3>{t("hydrogen.sell")}</h3>
                        <p>
                          {t("hydrogen.sale.preview")}:{" "}
                          <strong>{formatMoney(snapshot.locale, sale.cash)}</strong>
                        </p>
                      </div>
                      <div className="card-controls">
                        <label htmlFor="hydrogen-sell-amount">{t("hydrogen.sell.amount")}</label>
                        <select
                          id="hydrogen-sell-amount"
                          value={sellAmount}
                          onChange={(event) =>
                            setSellAmount(
                              event.currentTarget.value === "all"
                                ? "all"
                                : Number(event.currentTarget.value),
                            )
                          }
                        >
                          <option value="all">{t("hydrogen.sell.all")}</option>
                          <option value="1">{t("hydrogen.sell.one")}</option>
                          <option value="10">{t("hydrogen.sell.ten")}</option>
                          <option value="100">{t("hydrogen.sell.hundred")}</option>
                        </select>
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={!sale.enabled}
                          aria-describedby="sell-reason"
                          onClick={() =>
                            send(
                              { type: "resource.sell", goodId: "hydrogen", amount: sellAmount },
                              "status.sell",
                            )
                          }
                        >
                          {t("hydrogen.sell")}
                        </button>
                        {!sale.enabled && (
                          <span className="control-reason" id="sell-reason">
                            {localizedReason(snapshot.locale, sale.reasonKey)}
                          </span>
                        )}
                      </div>
                    </article>

                    <article className="upgrade-card">
                      <div className="card-icon storage-icon" aria-hidden="true">
                        {"\u25c8"}
                      </div>
                      <div className="card-copy">
                        <h3>{t("hydrogen.storage.title")}</h3>
                        <p>{t("hydrogen.storage.description")}</p>
                        <span className="cost-line">
                          {t("hydrogen.storage.price")}:{" "}
                          <strong>
                            {formatNumber(
                              snapshot.locale,
                              storagePurchase.cost,
                              0,
                              snapshot.notation,
                            )}{" "}
                            {"H\u2082"}
                          </strong>{" "}
                          <span aria-hidden="true">{"\u00b7"}</span>{" "}
                          {formatNumber(
                            snapshot.locale,
                            hydrogen.storageCapacity,
                            0,
                            snapshot.notation,
                          )}{" "}
                          {"\u2192"}{" "}
                          {formatNumber(
                            snapshot.locale,
                            storagePurchase.capacityAfterPurchase ??
                              hydrogen.storageCapacity * HYDROGEN_STORAGE_MULTIPLIER,
                            0,
                            snapshot.notation,
                          )}
                        </span>
                      </div>
                      <div className="card-controls">
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={!storagePurchase.enabled}
                          aria-describedby="storage-reason"
                          onClick={() =>
                            send({ type: "storage.purchase", goodId: "hydrogen" }, "status.storage")
                          }
                        >
                          {t("hydrogen.storage.purchase")}
                        </button>
                        <span className="control-reason" id="storage-reason">
                          {storagePurchase.enabled
                            ? ""
                            : localizedReason(
                                snapshot.locale,
                                storagePurchase.reasonKey,
                                storagePurchase.required ??
                                  Math.max(
                                    0,
                                    hydrogen.storageCapacity - HYDROGEN_STORAGE_PRICE_OFFSET,
                                  ),
                              )}
                        </span>
                      </div>
                    </article>

                    <article className="upgrade-card autobuyer-card">
                      <div className="card-icon compressor-icon" aria-hidden="true">
                        {"\u2699"}
                      </div>
                      <div className="card-copy">
                        <h3>{t("hydrogen.autobuyer.title")}</h3>
                        <p>
                          {t("hydrogen.autobuyer.description").replace(
                            "{rate}",
                            formatNumber(
                              snapshot.locale,
                              snapshot.hydrogenAutobuyerRatePerSecond,
                              2,
                              snapshot.notation,
                            ),
                          )}
                        </p>
                        <span className="cost-line">
                          {t("hydrogen.autobuyer.owned")}:{" "}
                          <strong data-testid="hydrogen-autobuyer-count">
                            {formatNumber(snapshot.locale, buyerCount, 0, snapshot.notation)}
                          </strong>
                          <span aria-hidden="true">{" \u00b7 "}</span>
                          {t("hydrogen.autobuyer.price")}:{" "}
                          <strong>
                            {formatNumber(snapshot.locale, buyerPrice, 0, snapshot.notation)}{" "}
                            {"H\u2082"}
                          </strong>
                        </span>
                      </div>
                      <div className="card-controls">
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={!autobuyerPurchase.enabled}
                          aria-describedby="autobuyer-reason"
                          onClick={() =>
                            send({ type: "hydrogen.autobuyer.purchase" }, "status.autobuyer")
                          }
                        >
                          {t("hydrogen.autobuyer.purchase")}
                        </button>
                        {store.getState().permanent.acquiredPerks.includes("bulkPurchasing") && (
                          <button
                            type="button"
                            className="text-button"
                            disabled={
                              !checkPreconditions(store.getState(), {
                                type: "economy.autobuyer.buyMax",
                                goodId: "hydrogen",
                                tier: 1,
                              }).ok
                            }
                            onClick={() =>
                              store.dispatch({
                                type: "economy.autobuyer.buyMax",
                                goodId: "hydrogen",
                                tier: 1,
                              })
                            }
                          >
                            {economyLabel(snapshot.locale, "buyMax")}
                          </button>
                        )}
                        <span className="control-reason" id="autobuyer-reason">
                          {autobuyerPurchase.enabled
                            ? ""
                            : localizedReason(
                                snapshot.locale,
                                autobuyerPurchase.reasonKey,
                                autobuyerPurchase.required ?? buyerPrice,
                              )}
                        </span>
                        {buyerCount > 0 && (
                          <button
                            type="button"
                            className="text-button"
                            aria-pressed={snapshot.hydrogenAutobuyerEnabled}
                            onClick={() =>
                              store.dispatch({
                                type: "hydrogen.autobuyer.toggle",
                                enabled: !snapshot.hydrogenAutobuyerEnabled,
                              })
                            }
                          >
                            {snapshot.hydrogenAutobuyerEnabled
                              ? t("hydrogen.autobuyer.pause")
                              : t("hydrogen.autobuyer.resume")}
                          </button>
                        )}
                      </div>
                    </article>
                  </div>
                  <output className="live-feedback" aria-live="polite">
                    {feedback}
                  </output>
                  <EconomyPanes tabId="resources" state={store.getState()} store={store} />
                </>
              ) : tab.id === "interstellar" &&
                store
                  .getState()
                  .run.economy.researchedTechnologies.includes("stellarCartography") ? (
                <>
                  <StarMapPane state={store.getState()} store={store} />
                  <StarshipPane state={store.getState()} store={store} />
                </>
              ) : tab.id === "space-mining" &&
                store
                  .getState()
                  .run.economy.researchedTechnologies.includes("atmosphericTelescopes") ? (
                <SpaceMiningPane state={store.getState()} store={store} />
              ) : index < 4 ? (
                <EconomyPanes tabId={tab.id} state={store.getState()} store={store} />
              ) : (
                <div className="locked-panel">
                  <span className="locked-mark" aria-hidden="true">
                    {"\u25a0"}
                  </span>
                  <p className="eyebrow">{t("pane.locked")}</p>
                  <h2>{t(tab.key)}</h2>
                  <p>{t("pane.locked.detail")}</p>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
      {saveManagerOpen && (
        <SaveManager
          locale={snapshot.locale}
          repository={repository}
          slots={repository?.list() ?? []}
          activeSlotId={slotId}
          revision={saveRevision}
          state={store.getState()}
          lockHeld={(id) => id === slotId && savePersistent && !saveWritesPaused}
          acquireLock={acquireSlotLock}
          onSave={() => {
            persistCurrent();
          }}
          onRename={persistRename}
          onSaveAsNew={saveRunAsNew}
          onSwitchTo={switchToPioneerSelection}
          onReplaceActive={(envelope) => {
            saveRevisionRef.current = envelope.revision;
            setSaveRevision(envelope.revision);
            setSaveWritesPaused(false);
            setHydrogenBriefingPending(false);
            onReplaceActive(envelope);
          }}
          onDeleted={onDeleteActive}
          onClose={() => setSaveManagerOpen(false)}
        />
      )}
      {DebugTools && (
        <DebugTools
          store={store}
          seed={seed}
          open={debugLabOpen}
          onClose={() => setDebugLabOpen(false)}
          advanceBy={advanceTestClock}
          readFrameMetrics={() => {
            const durationMs = Math.max(
              0,
              (frameMetrics.lastFrameAt ?? 0) - (frameMetrics.firstFrameAt ?? 0),
            );
            return {
              frames: frameMetrics.frames,
              durationMs,
              framesPerSecond: durationMs > 0 ? (frameMetrics.frames * 1000) / durationMs : 0,
            };
          }}
        />
      )}
    </div>
  );
}
