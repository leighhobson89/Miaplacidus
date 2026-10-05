import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
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
import { createInitialGameState, isValidGameState, type GameState } from "../engine/state";
import {
  selectHydrogenAutobuyerPurchase,
  selectHydrogenCollection,
  selectHydrogenSale,
  selectHydrogenStoragePurchase,
} from "../engine/selectors";
import { displayCurrency, displayQuantity } from "../engine/precision";
import { formatCurrency } from "./currencyFormatting";
import { formatNumber } from "./numberFormatting";
import { translate, type MessageKey } from "../i18n/messages";
import { economyLabel } from "../i18n/economyMessages";
import { GameErrorBoundary } from "../ui/GameErrorBoundary";
import { useGameSnapshot } from "../ui/useGameSnapshot";
import { currentWeatherForSystem } from "../engine/weather";
import { BUILD_INFO } from "./buildInfo";
import { NewsTickerBar } from "./NewsTickerBar";
import { withGameAudio } from "./audio";
import { economyGoodName, economyRatePerSecond } from "./economyDisplay";
import { EconomicGoodEmblem } from "./EconomicGoodEmblem";
import { blackHoleText } from "../i18n/blackHoleMessages";
import { SaveStartScreen } from "./SaveStartScreen";
import { PaneNavigation, type PaneNavigationItem } from "./PaneNavigation";
import { readCollapsedGroupIds, writeCollapsedGroupIds } from "./navigationPreferences";
import {
  galacticPaneItems,
  interstellarPaneItems,
  miaplaediaPaneItems,
  miaplaediaSectionId,
  spaceMiningPaneItems,
  cosmicRipPaneItems,
  resourcePaneGroups,
  energyPaneItems,
  researchPaneItems,
  settingsPaneItems,
  compoundPaneItems,
  type GalacticPaneId,
  type InterstellarPaneId,
  type MiaplaediaPaneId,
  type SpaceMiningPaneId,
  type CosmicRipPaneId,
  type ResourcePaneGroup,
} from "./presentationNavigation";
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
import { AscendencyBalance, LocationStatus, ResearchBalance, TopStatusBar } from "./TopStatusBar";
import { TECHNOLOGY_NAMES } from "../content/technologyNames";
import { cosmicRipText } from "../i18n/cosmicRipMessages";
import { technologyNotificationText } from "../i18n/technologyNotificationMessages";
import { createSpaceEventNoticeHandler } from "./spaceEventNotifications";
import { WeatherEffectsOverlay } from "./WeatherEffectsOverlay";
import {
  GameNotificationProvider,
  GameNotificationRegion,
  useGameNotificationControls,
  useGameNotifications,
} from "./NotificationStack";

const SpaceMiningPane = lazy(() =>
  import("./SpaceMiningPane").then((module) => ({ default: module.SpaceMiningPane })),
);
const EconomyPanes = lazy(() =>
  import("./EconomyPanes").then((module) => ({ default: module.EconomyPanes })),
);
const HydrogenAutobuyerTiers = lazy(() =>
  import("./EconomyPanes").then((module) => ({ default: module.HydrogenAutobuyerTiers })),
);
const HydrogenAllocationControls = lazy(() =>
  import("./EconomyPanes").then((module) => ({ default: module.HydrogenAllocationControls })),
);
const HydrogenFusionDetails = lazy(() =>
  import("./EconomyPanes").then((module) => ({ default: module.HydrogenFusionDetails })),
);
const PhilosophyPane = lazy(() =>
  import("./PhilosophyPane").then((module) => ({ default: module.PhilosophyPane })),
);
const StarMapPane = lazy(() =>
  import("./StarMapPane").then((module) => ({ default: module.StarMapPane })),
);
const StarshipPane = lazy(() =>
  import("./StarshipPane").then((module) => ({ default: module.StarshipPane })),
);
const AscendencyPane = lazy(() =>
  import("./AscendencyPane").then((module) => ({ default: module.AscendencyPane })),
);
const RebirthPane = lazy(() =>
  import("./AscendencyPane").then((module) => ({ default: module.RebirthPane })),
);
const GalacticCasinoPane = lazy(() =>
  import("./GalacticCasinoPane").then((module) => ({ default: module.GalacticCasinoPane })),
);
const GalacticMarketPane = lazy(() =>
  import("./GalacticMarketPane").then((module) => ({ default: module.GalacticMarketPane })),
);
const BlackHolePane = lazy(() =>
  import("./BlackHolePane").then((module) => ({ default: module.BlackHolePane })),
);
const MegastructurePane = lazy(() =>
  import("./MegastructurePane").then((module) => ({ default: module.MegastructurePane })),
);
const MiaplacidusEndgameStory = lazy(() =>
  import("./MiaplacidusEndgameStory").then((module) => ({
    default: module.MiaplacidusEndgameStory,
  })),
);
const CosmicRipPane = lazy(() =>
  import("./CosmicRipPane").then((module) => ({ default: module.CosmicRipPane })),
);
const SettingsPane = lazy(() =>
  import("./SettingsPane").then((module) => ({ default: module.SettingsPane })),
);
const MiaplaediaPane = lazy(() =>
  import("./MiaplaediaPane").then((module) => ({ default: module.MiaplaediaPane })),
);
const SaveManager = lazy(() =>
  import("./SaveManager").then((module) => ({ default: module.SaveManager })),
);

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
  { id: "miaplaedia", key: "tab.miaplaedia" },
] as const satisfies readonly { id: string; key: MessageKey }[];

type GameTabId = (typeof GAME_TABS)[number]["id"];

function isGameTabAvailable(tabId: GameTabId, state: GameState): boolean {
  return (
    tabId === "hydrogen" ||
    tabId === "research" ||
    (tabId === "energy" &&
      state.run.economy.researchedTechnologies.includes("basicPowerGeneration")) ||
    (tabId === "compounds" && state.run.economy.researchedTechnologies.includes("compounds")) ||
    (tabId === "interstellar" &&
      state.run.economy.researchedTechnologies.includes("stellarCartography")) ||
    (tabId === "space-mining" &&
      state.run.economy.researchedTechnologies.includes("atmosphericTelescopes")) ||
    (tabId === "galaxy" &&
      (state.run.space.ascendencyAwardedThisRun || state.permanent.rebirthCount > 0)) ||
    (tabId === "cosmic-rip" && state.permanent.cosmicRip.unlocked) ||
    tabId === "settings" ||
    tabId === "miaplaedia"
  );
}

function ResourceRail({
  groups,
  state,
  activePane,
  hidden,
  storageScope,
  onSelect,
}: {
  readonly groups: readonly ResourcePaneGroup[];
  readonly state: GameState;
  readonly activePane: string;
  readonly hidden: boolean;
  readonly storageScope: string;
  readonly onSelect: (paneId: string) => void;
}) {
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<ReadonlySet<string>>(() =>
    readCollapsedGroupIds(storageScope),
  );
  useEffect(() => {
    writeCollapsedGroupIds(storageScope, collapsedGroupIds);
  }, [collapsedGroupIds, storageScope]);

  return (
    <aside
      className="resource-rail"
      aria-label={economyLabel(state.settings.locale, "resources")}
      hidden={hidden}
    >
      {groups.map((group) => {
        const collapsed = collapsedGroupIds.has(group.id);
        return (
          <section className="resource-rail-group" key={group.id}>
            <button
              className="resource-rail-group-toggle"
              type="button"
              data-testid={`resource-group-toggle-${group.id}`}
              aria-expanded={!collapsed}
              aria-controls={`resource-group-${group.id}`}
              onClick={() =>
                setCollapsedGroupIds((current) => {
                  const next = new Set(current);
                  if (next.has(group.id)) next.delete(group.id);
                  else next.add(group.id);
                  return next;
                })
              }
            >
              {group.label}
              <span aria-hidden="true">{collapsed ? "›" : "⌄"}</span>
            </button>
            <div id={`resource-group-${group.id}`} hidden={collapsed}>
              {group.goodIds.map((goodId) => {
                const good = state.run.goods[goodId];
                const rate = economyRatePerSecond(state, goodId);
                const paneId = `resources-${goodId}`;
                return (
                  <button
                    key={goodId}
                    className={`resource-item${activePane === paneId ? " is-current" : ""}`}
                    type="button"
                    data-testid={`resource-rail-${goodId}`}
                    onClick={() => onSelect(paneId)}
                  >
                    <EconomicGoodEmblem goodId={goodId} />
                    <span className="resource-item-copy">
                      <strong>
                        {goodId === "hydrogen"
                          ? translate(state.settings.locale, "hydrogen.title")
                          : economyGoodName(state.settings.locale, goodId)}
                      </strong>
                      <small>
                        {formatNumber(
                          state.settings.locale,
                          state.settings.notation === "scientific"
                            ? good.quantity
                            : displayQuantity(good.quantity),
                          0,
                          state.settings.notation,
                        )}{" "}
                        /{" "}
                        {formatNumber(
                          state.settings.locale,
                          good.storageCapacity,
                          0,
                          state.settings.notation,
                        )}
                      </small>
                    </span>
                    <span className="resource-rate">
                      {rate >= 0 ? "+" : "−"}
                      {formatNumber(
                        state.settings.locale,
                        Math.abs(rate),
                        2,
                        state.settings.notation,
                      )}
                      /s
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </aside>
  );
}

function PointerTrailLayer({ enabled }: { readonly enabled: boolean }) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const layer = layerRef.current;
    if (!layer) return;
    let lastParticleAt = 0;
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.timeStamp - lastParticleAt < 36) return;
      lastParticleAt = event.timeStamp;
      const particle = document.createElement("span");
      particle.className = "pointer-trail-particle";
      particle.style.left = `${event.clientX}px`;
      particle.style.top = `${event.clientY}px`;
      particle.addEventListener("animationend", () => particle.remove(), { once: true });
      layer.appendChild(particle);
    };
    window.addEventListener("pointermove", onPointerMove);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      layer.replaceChildren();
    };
  }, [enabled]);

  return <div ref={layerRef} className="pointer-trail-layer" aria-hidden="true" />;
}

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
  readonly initialWarning?: string | undefined;
  readonly onExit: (prefillName?: string) => void;
  readonly onDeleteActive: () => void;
  readonly onReplaceActive: (envelope: SaveEnvelopeV1) => void;
  readonly onSaveAsNew: (envelope: SaveEnvelopeV1, releaseLock: () => void) => void;
  readonly onApplyTestCheckpoint: (state: GameState) => boolean;
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

function localizedReason(
  locale: LocaleId,
  key: string | undefined,
  required?: number,
  notation: GameState["settings"]["notation"] = "standard",
): string {
  if (key === "ui.hydrogen.inventory-full") return translate(locale, "reason.inventory-full");
  if (key === "ui.hydrogen.no-stock") return translate(locale, "reason.no-stock");
  if (key === "ui.hydrogen.autobuyer-locked") return translate(locale, "reason.autobuyer-locked");
  if (key === "engine.purchase.insufficient-material") {
    return `${translate(locale, "reason.insufficient")} ${formatNumber(locale, required ?? 0, 0, notation)} H\u2082.`;
  }
  return key ?? "";
}

export function App() {
  return (
    <GameNotificationProvider>
      <AppContent />
    </GameNotificationProvider>
  );
}

function AppContent() {
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
    releaseLock: () => void;
    warning?: string;
  } | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(() => {
    const lastStarted = repository?.lastStartedSlot();
    if (!lastStarted) return null;
    try {
      return repository?.readSlot(lastStarted) ? lastStarted : null;
    } catch {
      return null;
    }
  });
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
    setSelectedSlotId(null);
    setSelectionError("");
    setSelectionNotice("");
  }

  function selectSavedPioneer(slotId: string, name: string) {
    setPioneerName(name);
    setSelectedSlotId(slotId);
    setSelectionError("");
    setSelectionNotice("");
  }

  function setDraftLocale(nextLocale: LocaleId) {
    setLocale(nextLocale);
    setSelectionError("");
    setSelectionNotice("");
  }

  async function startSelectedRun() {
    if (starting) return;
    setStarting(true);
    setSelectionError("");
    setSelectionNotice("");
    let releaseLock = () => {};
    let unsavedWarning = "";
    try {
      const name = validatePioneerName(pioneerName);
      const existing = selectedSlotId
        ? repository?.list().find((slot) => slot.slotId === selectedSlotId)
        : undefined;
      if (selectedSlotId && !existing)
        throw new SaveError("not-found", "This save could not be found.");
      if (existing && existing.status !== "ready")
        throw new SaveError("corrupt-slot", "This save is damaged.");
      if (existing && existing.pioneerName !== name.display)
        throw new SaveError("not-found", "This save could not be found.");
      if (!existing && (repository?.findByName(name.display).length ?? 0) > 0)
        throw new SaveError("duplicate-name", "Choose the matching saved pioneer to resume it.");
      repository?.writePreferences({ locale, lastConfirmedName: name.display });
      const slotId = existing?.slotId ?? createSlotId();
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
              "space-telescope-before-launch-pad",
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
              "meta-rebirth-ready",
              "meta-market-ready",
              "meta-casino-ready",
              "meta-rebirth-before-casino-unlock",
              "meta-black-hole-discovered",
              "meta-megastructure-route",
              "meta-cosmic-rip-route",
              "meta-cosmic-rip-restore-affordance",
              "meta-cosmic-rip-action-affordances",
              "meta-cosmic-rip-close-affordance",
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
            const created = repository.create(slotId, nextState, name.display, now);
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
      if (BUILD_INFO.isTest) testClock.set(now);
      const nextStore = createGameStore(nextState, {
        clock: {
          now: () => (BUILD_INFO.isTest ? testClock.now() : Date.now()),
        },
      });
      setStore(nextStore);
      setSession({
        slotId,
        revision,
        persistent,
        releaseLock,
        warning: unsavedWarning,
      });
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
      setSelectedSlotId(null);
      setSelectionError("");
      setSelectionNotice(saveText(locale, "recovered"));
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
    setSelectedSlotId(null);
    setStore(null);
    setSession(null);
  }
  function afterDeleteActive() {
    const fallbackName = repository?.readPreferences().lastConfirmedName ?? "Pioneer";
    setPioneerName(fallbackName);
    setSelectedSlotId(null);
    session?.releaseLock();
    setStore(null);
    setSession(null);
  }
  function replaceActiveSave(envelope: SaveEnvelopeV1) {
    if (!session) return;
    const nextState = {
      ...envelope.state,
      run: { ...envelope.state.run, clock: { ...envelope.state.run.clock, foreground: false } },
    };
    setStore(
      createGameStore(nextState, {
        clock: {
          now: () => (BUILD_INFO.isTest ? testClock.now() : Date.now()),
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
          now: () => (BUILD_INFO.isTest ? testClock.now() : Date.now()),
        },
      }),
    );
    setSession({
      slotId: envelope.slotId,
      revision: envelope.revision,
      persistent: true,
      releaseLock: newLockRelease,
    });
    setLocale(envelope.state.settings.locale);
  }

  const applyTestCheckpoint = useCallback(
    (checkpoint: GameState): boolean => {
      if ((!BUILD_INFO.isTest && !import.meta.env.DEV) || !store || !session) return false;
      const current = store.getState();
      if (!isValidGameState(checkpoint) || checkpoint.run.pioneerName !== current.run.pioneerName)
        return false;
      const nextState: GameState = {
        ...checkpoint,
        settings: current.settings,
        run: {
          ...checkpoint.run,
          pioneerName: current.run.pioneerName,
          clock: {
            ...checkpoint.run.clock,
            wallNowMs: testClock.now(),
            foreground: true,
            hiddenElapsedMs: 0,
            pendingForegroundMs: 0,
          },
        },
      };
      setStore(
        createGameStore(nextState, {
          clock: {
            now: () => (BUILD_INFO.isTest ? testClock.now() : Date.now()),
          },
        }),
      );
      return true;
    },
    [store, session, testClock],
  );

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
            initialWarning={session.warning}
            onExit={exitRun}
            onDeleteActive={afterDeleteActive}
            onReplaceActive={replaceActiveSave}
            onSaveAsNew={switchToNewSaved}
            onApplyTestCheckpoint={applyTestCheckpoint}
          />
        ) : (
          <SaveStartScreen
            key={slotRefresh}
            locale={locale}
            setLocale={setDraftLocale}
            name={pioneerName}
            setName={setDraftName}
            slots={repository?.list() ?? []}
            selectedSlotId={selectedSlotId}
            error={selectionError}
            notice={selectionNotice}
            storageAvailable={repository !== null}
            onSelectSlot={selectSavedPioneer}
            starting={starting}
            onStart={() => void startSelectedRun()}
            onRecover={(reference) => void recoverAtBoot(reference)}
          />
        )}
      </main>
    </GameErrorBoundary>
  );
}

function GameSession({
  store: engineStore,
  testClock,
  seed,
  frameMetrics,
  repository,
  slotId,
  revision: initialRevision,
  persistent: initialPersistent,
  initialWarning,
  onExit,
  onDeleteActive,
  onReplaceActive,
  onSaveAsNew,
  onApplyTestCheckpoint,
}: GameSessionProps) {
  const store = useMemo(() => withGameAudio(engineStore), [engineStore]);
  useEffect(() => () => store.dispose(), [store]);
  const snapshot = useGameSnapshot(store);
  const notify = useGameNotifications();
  const setNotificationsEnabled = useGameNotificationControls();
  const [activeTab, setActiveTab] = useState<GameTabId>("hydrogen");
  const [visitedTabs, setVisitedTabs] = useState<ReadonlySet<GameTabId>>(
    () => new Set(["hydrogen"]),
  );
  const [visitedPanes, setVisitedPanes] = useState<ReadonlySet<string>>(
    () =>
      new Set([
        "resources-hydrogen",
        "energy-storage",
        "research-science-buildings",
        "research-tech-tree",
        "compounds-diesel",
        "galactic-rebirth",
        "interstellar-star-map",
        "space-mining-telescope",
        "cosmic-rip-situation",
      ]),
  );
  const [activeGalacticPane, setActiveGalacticPane] = useState<GalacticPaneId>("galactic-rebirth");
  const [activeMiaplaediaPane, setActiveMiaplaediaPane] =
    useState<MiaplaediaPaneId>("miaplaedia-get-started");
  const [activeInterstellarPane, setActiveInterstellarPane] =
    useState<InterstellarPaneId>("interstellar-star-map");
  const [activeSpaceMiningPane, setActiveSpaceMiningPane] =
    useState<SpaceMiningPaneId>("space-mining-launch-pad");
  const [activeCosmicRipPane, setActiveCosmicRipPane] =
    useState<CosmicRipPaneId>("cosmic-rip-situation");
  const [activeResourcePane, setActiveResourcePane] = useState("resources-hydrogen");
  const [activeEnergyPane, setActiveEnergyPane] = useState("energy-storage");
  const [activeResearchPane, setActiveResearchPane] = useState("research-science-buildings");
  const [activeCompoundPane, setActiveCompoundPane] = useState("compounds-diesel");
  const [sellAmount, setSellAmount] = useState<number | "all">("all");
  const [feedback, setFeedback] = useState("");
  const [saveManagerOpen, setSaveManagerOpen] = useState(false);
  const [saveRevision, setSaveRevision] = useState(initialRevision);
  const saveRevisionRef = useRef(initialRevision);
  const [savePersistent, setSavePersistent] = useState(initialPersistent);
  const [saveWritesPaused, setSaveWritesPaused] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [saveFailure, setSaveFailure] = useState(initialWarning ?? "");
  const [exitConfirmation, setExitConfirmation] = useState(false);
  const [pendingPioneerName, setPendingPioneerName] = useState<string | null>(null);
  const exitDialogRef = useRef<HTMLDialogElement>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(
    repository?.readPreferences().autoSaveEnabled ?? true,
  );
  const [autoSaveInterval, setAutoSaveInterval] = useState<300 | 900 | 1800 | 3600>(
    repository?.readPreferences().autoSaveIntervalSeconds ?? 300,
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
    applyTestCheckpoint: (state: GameState) => boolean;
    readFrameMetrics: () => {
      readonly frames: number;
      readonly durationMs: number;
      readonly framesPerSecond: number;
    };
  }> | null>(null);
  const t = (key: MessageKey) => translate(snapshot.locale, key);
  const activateTab = (tabId: GameTabId) => {
    setVisitedTabs((current) => (current.has(tabId) ? current : new Set(current).add(tabId)));
    setActiveTab(tabId);
  };
  const activatePane = (paneId: string) => {
    setVisitedPanes((current) => (current.has(paneId) ? current : new Set(current).add(paneId)));
    if (store.getState().run.navigationAttentionIds.includes(paneId)) {
      store.dispatch({ type: "navigation.attention.clear", pageId: paneId });
    }
  };
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
        Object.values(current.run.timers).some(
          (timer) =>
            timer.status === "running" && (timer.domain === "battle" || timer.domain === "travel"),
        );
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
    [repository, savePersistent, saveWritesPaused, store, slotId, saveLabel],
  );

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
    const wallNow = () => (BUILD_INFO.isTest ? testClock.now() : Date.now());
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
    let lastPresentationPublishAt = 0;
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
      if (timestamp - lastPresentationPublishAt >= 250) {
        store.publishNow();
        lastPresentationPublishAt = timestamp;
      }
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
        applyTestCheckpoint: onApplyTestCheckpoint,
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
  }, [store, seed, frameMetrics, advanceTestClock, onApplyTestCheckpoint]);

  function send(command: Parameters<GameStore["dispatch"]>[0]): void {
    const result = store.dispatch(command);
    setFeedback(
      result.accepted
        ? ""
        : localizedReason(
            snapshot.locale,
            result.failure?.messageKey,
            result.failure?.code === "insufficient-material" ? result.failure.required : undefined,
            snapshot.notation,
          ),
    );
  }

  const currentState = store.getState();
  useEffect(() => {
    setNotificationsEnabled(currentState.settings.notificationsEnabled !== false);
  }, [currentState.settings.notificationsEnabled, setNotificationsEnabled]);

  useEffect(() => {
    const routeSpaceEvents = createSpaceEventNoticeHandler(
      () => currentLocaleRef.current,
      () => store.getState(),
      (notice) =>
        notify(notice.message, {
          classification: notice.classification,
          type: notice.type,
          durationMs: 3000,
        }),
    );
    return store.subscribeEvents(routeSpaceEvents);
  }, [notify, store]);

  const previousNotificationState = useRef({
    store,
    rebirthCount: currentState.permanent.rebirthCount,
    economyTechs: currentState.run.economy.researchedTechnologies,
    cosmicRipTechs: currentState.permanent.cosmicRip.researchedTechnologyIds,
  });
  useEffect(() => {
    const previous = previousNotificationState.current;
    const economyTechs = currentState.run.economy.researchedTechnologies;
    const cosmicRipTechs = currentState.permanent.cosmicRip.researchedTechnologyIds;
    if (previous.store !== store || previous.rebirthCount !== currentState.permanent.rebirthCount) {
      previousNotificationState.current = {
        store,
        rebirthCount: currentState.permanent.rebirthCount,
        economyTechs,
        cosmicRipTechs,
      };
      return;
    }

    for (const technologyId of economyTechs) {
      if (previous.economyTechs.includes(technologyId)) continue;
      notify(
        technologyNotificationText(
          snapshot.locale,
          technologyId,
          TECHNOLOGY_NAMES[technologyId][snapshot.locale],
        ),
        { classification: "tech", type: "info", durationMs: 3000 },
      );
    }

    const cosmicRipMessages = cosmicRipText(snapshot.locale);
    for (const technologyId of cosmicRipTechs) {
      if (previous.cosmicRipTechs.includes(technologyId)) continue;
      notify(
        `${cosmicRipMessages.technologyNames[technologyId]} ${cosmicRipMessages.researched}!`,
        {
          classification: "cosmicRip",
          type: "info",
          durationMs: 3000,
        },
      );
    }

    previousNotificationState.current = {
      store,
      rebirthCount: currentState.permanent.rebirthCount,
      economyTechs,
      cosmicRipTechs,
    };
  }, [
    currentState.permanent.cosmicRip.researchedTechnologyIds,
    currentState.permanent.rebirthCount,
    currentState.run.economy.researchedTechnologies,
    notify,
    snapshot.locale,
    store,
  ]);
  const attentionIds = new Set(currentState.run.navigationAttentionIds);
  const galacticPanels = galacticPaneItems(snapshot.locale, currentState);
  const blackHoleReady =
    currentState.permanent.blackHole.researched &&
    currentState.run.blackHoleChargeReady &&
    !currentState.run.blackHoleWarpActive;
  const liveAttentionLabels = new Map<string, string>();
  if (blackHoleReady) {
    liveAttentionLabels.set("galactic-black-hole", blackHoleText(snapshot.locale).ready);
  }
  const interstellarPanels = interstellarPaneItems(snapshot.locale, currentState);
  const spaceMiningPanels = spaceMiningPaneItems(snapshot.locale, currentState);
  const cosmicRipPanels = cosmicRipPaneItems(snapshot.locale, currentState);
  const miaplaediaPanels = miaplaediaPaneItems(snapshot.locale);
  const settingsPanels = settingsPaneItems(snapshot.locale);
  const resourceGroups = resourcePaneGroups(snapshot.locale, currentState.run.unlockedResources);
  const resourcePanels = resourceGroups.flatMap((group) => group.items);
  const energyPanels = energyPaneItems(
    snapshot.locale,
    currentState.run.economy.researchedTechnologies,
  );
  const researchPanels = researchPaneItems(
    snapshot.locale,
    store.getState().permanent.philosophyId !== null,
  );
  const compoundPanels = compoundPaneItems(
    snapshot.locale,
    currentState.run.economy.unlockedCompounds,
  );
  const paneItemsByTab = new Map<string, readonly PaneNavigationItem[]>([
    ["hydrogen", resourcePanels],
    ["energy", energyPanels],
    ["research", researchPanels],
    ["compounds", compoundPanels],
    ["galaxy", galacticPanels],
    ["interstellar", interstellarPanels],
    ["space-mining", spaceMiningPanels],
    ["cosmic-rip", cosmicRipPanels],
    ["settings", settingsPanels],
    ["miaplaedia", miaplaediaPanels],
  ]);
  const availableTabIds = new Set(
    GAME_TABS.filter((tab) => isGameTabAvailable(tab.id, currentState)).map((tab) => tab.id),
  );
  const orderedTabs = GAME_TABS.filter((tab) => availableTabIds.has(tab.id));
  const activeTabIsVisible = orderedTabs.some((tab) => tab.id === activeTab);
  const selectedTabId = activeTabIsVisible ? activeTab : (orderedTabs[0]?.id ?? "hydrogen");
  useEffect(() => {
    if (selectedTabId !== activeTab) {
      setActiveTab(selectedTabId);
      setVisitedTabs((current) =>
        current.has(selectedTabId) ? current : new Set([...current, selectedTabId]),
      );
    }
  }, [activeTab, selectedTabId]);
  const availablePaneItems = [...paneItemsByTab]
    .filter(([tabId]) => availableTabIds.has(tabId as GameTabId))
    .flatMap(([, items]) => items);
  const availabilityKey = [...availableTabIds, ...availablePaneItems.map((item) => item.id)]
    .sort()
    .join("|");
  const previousAvailabilityKey = useRef<string | null>(null);
  useEffect(() => {
    const nextIds = new Set(availabilityKey.split("|").filter(Boolean));
    if (!currentState.run.navigationAttentionInitialized) {
      store.dispatch({
        type: "navigation.attention.initialize",
        pageIds: [...nextIds],
      });
      previousAvailabilityKey.current = availabilityKey;
      return;
    }
    const previousIds = new Set(previousAvailabilityKey.current?.split("|").filter(Boolean) ?? []);
    const newlyAvailableIds = [...nextIds].filter((id) => !previousIds.has(id));
    if (newlyAvailableIds.length > 0) {
      store.dispatch({ type: "navigation.attention.discover", pageIds: newlyAvailableIds });
    }
    previousAvailabilityKey.current = availabilityKey;
  }, [
    availabilityKey,
    currentState.run.navigationAttentionInitialized,
    previousAvailabilityKey,
    store,
  ]);
  const clearAttention = (id: string) => {
    if (store.getState().run.navigationAttentionIds.includes(id)) {
      store.dispatch({ type: "navigation.attention.clear", pageId: id });
    }
  };
  const selectedResourcePane = resourcePanels.some((panel) => panel.id === activeResourcePane)
    ? activeResourcePane
    : (resourcePanels[0]?.id ?? "resources-hydrogen");
  const selectedEnergyPane = energyPanels.some((panel) => panel.id === activeEnergyPane)
    ? activeEnergyPane
    : (energyPanels[0]?.id ?? "energy-storage");
  const selectedResearchPane = researchPanels.some((panel) => panel.id === activeResearchPane)
    ? activeResearchPane
    : (researchPanels[0]?.id ?? "research-tech-tree");
  const selectedInterstellarPane = interstellarPanels.some(
    (panel) => panel.id === activeInterstellarPane,
  )
    ? activeInterstellarPane
    : (interstellarPanels[0]?.id ?? "interstellar-star-map");
  const selectedSpaceMiningPane = spaceMiningPanels.some(
    (panel) => panel.id === activeSpaceMiningPane,
  )
    ? activeSpaceMiningPane
    : ((spaceMiningPanels[0]?.id ?? "space-mining-telescope") as SpaceMiningPaneId);
  const selectedCosmicRipPane = cosmicRipPanels.some((panel) => panel.id === activeCosmicRipPane)
    ? activeCosmicRipPane
    : ((cosmicRipPanels[0]?.id ?? "cosmic-rip-situation") as CosmicRipPaneId);
  const selectedCompoundPane = compoundPanels.some((panel) => panel.id === activeCompoundPane)
    ? activeCompoundPane
    : (compoundPanels[0]?.id ?? "compounds-diesel");
  const selectedGalacticPane = galacticPanels.some((panel) => panel.id === activeGalacticPane)
    ? activeGalacticPane
    : (galacticPanels[0]?.id ?? "galactic-rebirth");
  const activePaneByTab: Partial<Record<GameTabId, string>> = {
    hydrogen: selectedResourcePane,
    energy: selectedEnergyPane,
    research: selectedResearchPane,
    compounds: selectedCompoundPane,
    interstellar: selectedInterstellarPane,
    "space-mining": selectedSpaceMiningPane,
    galaxy: selectedGalacticPane,
    "cosmic-rip": selectedCosmicRipPane,
    miaplaedia: activeMiaplaediaPane,
  };
  const activateNavigationTab = (tabId: GameTabId) => {
    clearAttention(tabId);
    const activePaneId = activePaneByTab[tabId];
    if (activePaneId) activatePane(activePaneId);
    activateTab(tabId);
  };

  return (
    <div
      className="game-frame"
      data-theme={snapshot.themeId}
      data-reduced-motion={store.getState().settings.reducedMotion ? "true" : "false"}
      data-custom-pointer={currentState.settings.customPointerEnabled !== false ? "true" : "false"}
      data-weather-effects={
        currentState.settings.weatherEffectsEnabled === false
          ? "off"
          : currentWeatherForSystem(currentState.run.space)
      }
      data-engine-revision={snapshot.revision}
    >
      <h1 className="sr-only">{t("app.brand")}</h1>
      <WeatherEffectsOverlay
        weather={currentWeatherForSystem(currentState.run.space)}
        enabled={currentState.settings.weatherEffectsEnabled !== false}
        reducedMotion={currentState.settings.reducedMotion}
        themeId={snapshot.themeId}
      />
      <PointerTrailLayer
        enabled={
          currentState.settings.pointerTrailEnabled === true && !currentState.settings.reducedMotion
        }
      />
      <header className="game-header">
        <a className="game-wordmark" href="#game" aria-label={t("app.brand")}>
          {t("app.brand")}
        </a>
        <div className="run-name">
          <span className="status-dot" aria-hidden="true" />
          {snapshot.pioneerName}
        </div>
        <div className="header-balances">
          <LocationStatus state={currentState} locale={snapshot.locale} />
          <AscendencyBalance state={currentState} locale={snapshot.locale} />
          <div>
            <span className="balance-label">{t("header.cash")}</span>
            <strong data-testid="cash-balance">
              {formatCurrency(
                snapshot.locale,
                Number(displayCurrency(snapshot.cash)),
                snapshot.currencyId ?? "usd",
                2,
                snapshot.notation,
              )}
            </strong>
          </div>
          <ResearchBalance state={currentState} locale={snapshot.locale} />
        </div>
      </header>
      <TopStatusBar state={currentState} store={store} locale={snapshot.locale} />
      <NewsTickerBar state={currentState} store={store} />
      <GameNotificationRegion />
      {exitConfirmation && (
        <dialog
          ref={exitDialogRef}
          className="save-manager exit-save-dialog"
          aria-label={saveLabel("unsaved")}
          data-testid="unsaved-exit-dialog"
          onCancel={(event) => {
            event.preventDefault();
            exitDialogRef.current?.close();
            setExitConfirmation(false);
            setPendingPioneerName(null);
          }}
        >
          <p className="save-warning">{saveFailure || saveLabel("leaveWarning")}</p>
          <div className="save-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                exitDialogRef.current?.close();
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
                exitDialogRef.current?.close();
                setExitConfirmation(false);
                setPendingPioneerName(null);
              }}
            >
              {saveLabel("stay")}
            </button>
            <button
              className="danger-button"
              type="button"
              onClick={() => {
                exitDialogRef.current?.close();
                onExit(pendingPioneerName ?? undefined);
              }}
            >
              {saveLabel("discardRun")}
            </button>
          </div>
        </dialog>
      )}
      {saveFailure && !saveWritesPaused && (
        <div className="save-error-banner" role="alert">
          <span>{saveFailure}</span>
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              activateTab("settings");
              setSaveManagerOpen(true);
            }}
          >
            {saveLabel("manage")}
          </button>
        </div>
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
          {orderedTabs.map((tab, index) => {
            const selected = selectedTabId === tab.id;
            const childItems = paneItemsByTab.get(tab.id) ?? [];
            const hasNewAttention =
              attentionIds.has(tab.id) || childItems.some((item) => attentionIds.has(item.id));
            const statusLabel = childItems
              .map((item) => liveAttentionLabels.get(item.id))
              .find((value): value is string => Boolean(value));
            const hasAttention = hasNewAttention || Boolean(statusLabel);
            const attentionReasons = [
              hasNewAttention ? t("nav.new") : undefined,
              statusLabel,
            ].filter((value): value is string => Boolean(value));
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                className={`nav-tab${selected ? " is-selected" : ""}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`pane-${tab.id}`}
                aria-label={hasAttention ? [t(tab.key), ...attentionReasons].join(", ") : undefined}
                tabIndex={selected ? 0 : -1}
                onClick={() => {
                  activateNavigationTab(tab.id);
                }}
                onKeyDown={(event) => {
                  if (
                    event.key !== "ArrowRight" &&
                    event.key !== "ArrowLeft" &&
                    event.key !== "Home" &&
                    event.key !== "End"
                  )
                    return;
                  event.preventDefault();
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? orderedTabs.length - 1
                        : (index + (event.key === "ArrowRight" ? 1 : -1) + orderedTabs.length) %
                          orderedTabs.length;
                  const nextTab = orderedTabs[next];
                  if (!nextTab) return;
                  activateNavigationTab(nextTab.id);
                  document.getElementById(`tab-${nextTab.id}`)?.focus();
                }}
              >
                <span>{t(tab.key)}</span>
                {hasAttention && (
                  <span className="attention-badge" aria-hidden="true">
                    {statusLabel ?? t("nav.new")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className={`main-layout${selectedTabId === "hydrogen" ? " has-resource-rail" : ""}`}>
        <ResourceRail
          groups={resourceGroups}
          state={currentState}
          activePane={selectedResourcePane}
          hidden={selectedTabId !== "hydrogen"}
          storageScope={`${slotId}:resource-rail`}
          onSelect={(paneId) => {
            clearAttention(paneId);
            activateTab("hydrogen");
            activatePane(paneId);
            setActiveResourcePane(paneId);
          }}
        />

        <div className="pane-stack">
          {orderedTabs.map((tab) => {
            const sourceIndex = GAME_TABS.findIndex((item) => item.id === tab.id);
            return (
              <section
                key={tab.id}
                id={`pane-${tab.id}`}
                className="game-pane"
                role="tabpanel"
                aria-labelledby={`tab-${tab.id}`}
                tabIndex={0}
                hidden={selectedTabId !== tab.id}
              >
                {(selectedTabId === tab.id || visitedTabs.has(tab.id)) && (
                  <Suspense fallback={<div className="pane-loading" aria-hidden="true" />}>
                    {tab.id === "hydrogen" ? (
                      <div className="tab-section-layout">
                        <PaneNavigation
                          items={resourcePanels}
                          selectedId={selectedResourcePane}
                          label={t("nav.subsections")}
                          storageScope={`${slotId}:resources`}
                          attentionIds={attentionIds}
                          attentionLabel={t("nav.new")}
                          onSelect={(id) => {
                            clearAttention(id);
                            activatePane(id);
                            setActiveResourcePane(id);
                          }}
                        />
                        <div
                          id="panel-resources-hydrogen"
                          className="subpane-panel resource-subpane"
                          role="tabpanel"
                          aria-labelledby="tab-resources-hydrogen"
                          tabIndex={0}
                          data-resource-id="hydrogen"
                          hidden={selectedResourcePane !== "resources-hydrogen"}
                        >
                          <div className="pane-heading">
                            <div>
                              <h2>{t("hydrogen.title")}</h2>
                              <p className="pane-intro">{t("hydrogen.description")}</p>
                            </div>
                          </div>

                          <div className="hydrogen-hero">
                            <div className="hydrogen-overview">
                              <div className="atom-art" aria-hidden="true">
                                <span className="orbit orbit-one" />
                                <span className="orbit orbit-two" />
                                <span className="atom-core">H</span>
                                <span className="atom-spark">{"\u2726"}</span>
                              </div>
                              <div className="stock-readout">
                                <span className="eyebrow">{t("hydrogen.quantity")}</span>
                                <strong data-testid="hydrogen-quantity">
                                  {formatNumber(
                                    snapshot.locale,
                                    hydrogen.quantity,
                                    2,
                                    snapshot.notation,
                                  )}{" "}
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
                                  {formatNumber(
                                    snapshot.locale,
                                    hydrogen.quantity,
                                    0,
                                    snapshot.notation,
                                  )}{" "}
                                  /{" "}
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
                              onClick={() => send({ type: "resource.collect", goodId: "hydrogen" })}
                            >
                              <span aria-hidden="true">+</span>
                              {t("hydrogen.collect")}
                            </button>
                            {!collection.enabled && (
                              <p className="control-reason" id="collect-reason">
                                {localizedReason(
                                  snapshot.locale,
                                  collection.reasonKey,
                                  undefined,
                                  snapshot.notation,
                                )}
                              </p>
                            )}

                            <div className="hydrogen-sale-grid">
                              <article className="sale-card hydrogen-sale-controls">
                                <div className="card-copy">
                                  <h3>{t("hydrogen.sell")}</h3>
                                  <p>
                                    {t("hydrogen.sale.preview")}:{" "}
                                    <strong>
                                      {formatCurrency(
                                        snapshot.locale,
                                        Number(displayCurrency(sale.cash)),
                                        snapshot.currencyId ?? "usd",
                                        2,
                                        snapshot.notation,
                                      )}
                                    </strong>
                                  </p>
                                </div>
                                <div className="card-controls">
                                  <label htmlFor="hydrogen-sell-amount">
                                    {t("hydrogen.sell.amount")}
                                  </label>
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
                                      send({
                                        type: "resource.sell",
                                        goodId: "hydrogen",
                                        amount: sellAmount,
                                      })
                                    }
                                  >
                                    {t("hydrogen.sell")}
                                  </button>
                                  {!sale.enabled && (
                                    <span className="control-reason" id="sell-reason">
                                      {localizedReason(
                                        snapshot.locale,
                                        sale.reasonKey,
                                        undefined,
                                        snapshot.notation,
                                      )}
                                    </span>
                                  )}
                                </div>
                                <HydrogenFusionDetails state={store.getState()} store={store} />
                              </article>
                            </div>
                          </div>

                          <article className="upgrade-card hydrogen-storage-card">
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
                                  send({ type: "storage.purchase", goodId: "hydrogen" })
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
                                      snapshot.notation,
                                    )}
                              </span>
                            </div>
                          </article>

                          <details className="economy-details hydrogen-autobuyer-section">
                            <summary>{economyLabel(snapshot.locale, "autobuyers")}</summary>
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
                                    {formatNumber(
                                      snapshot.locale,
                                      buyerCount,
                                      0,
                                      snapshot.notation,
                                    )}
                                  </strong>
                                  <span aria-hidden="true">{" \u00b7 "}</span>
                                  {t("hydrogen.autobuyer.price")}:{" "}
                                  <strong>
                                    {formatNumber(
                                      snapshot.locale,
                                      buyerPrice,
                                      0,
                                      snapshot.notation,
                                    )}{" "}
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
                                  onClick={() => send({ type: "hydrogen.autobuyer.purchase" })}
                                >
                                  {t("hydrogen.autobuyer.purchase")}
                                </button>
                                {store
                                  .getState()
                                  .permanent.acquiredPerks.includes("bulkPurchasing") && (
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
                                        snapshot.notation,
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
                            <HydrogenAutobuyerTiers state={store.getState()} store={store} />
                          </details>
                          <HydrogenAllocationControls state={store.getState()} store={store} />
                          <output className="live-feedback" aria-live="polite">
                            {feedback}
                          </output>
                        </div>
                        <EconomyPanes
                          tabId="resources"
                          activePane={selectedResourcePane}
                          state={store.getState()}
                          store={store}
                        />
                      </div>
                    ) : tab.id === "energy" &&
                      currentState.run.economy.researchedTechnologies.includes(
                        "basicPowerGeneration",
                      ) ? (
                      <div className="tab-section-layout">
                        <PaneNavigation
                          items={energyPanels}
                          selectedId={selectedEnergyPane}
                          label={t("nav.subsections")}
                          attentionIds={attentionIds}
                          attentionLabel={t("nav.new")}
                          onSelect={(id) => {
                            clearAttention(id);
                            activatePane(id);
                            setActiveEnergyPane(id);
                          }}
                        />
                        <EconomyPanes
                          tabId={tab.id}
                          activePane={selectedEnergyPane}
                          state={store.getState()}
                          store={store}
                        />
                      </div>
                    ) : tab.id === "research" ? (
                      <div className="tab-section-layout">
                        <PaneNavigation
                          items={researchPanels}
                          selectedId={selectedResearchPane}
                          label={t("nav.subsections")}
                          attentionIds={attentionIds}
                          attentionLabel={t("nav.new")}
                          onSelect={(id) => {
                            clearAttention(id);
                            activatePane(id);
                            setActiveResearchPane(id);
                          }}
                        />
                        <EconomyPanes
                          tabId={tab.id}
                          activePane={selectedResearchPane}
                          state={store.getState()}
                          store={store}
                        />
                      </div>
                    ) : tab.id === "compounds" &&
                      currentState.run.economy.researchedTechnologies.includes("compounds") &&
                      compoundPanels.length > 0 ? (
                      <div className="tab-section-layout">
                        <PaneNavigation
                          items={compoundPanels}
                          selectedId={selectedCompoundPane}
                          label={t("nav.subsections")}
                          storageScope={`${slotId}:compounds`}
                          attentionIds={attentionIds}
                          attentionLabel={t("nav.new")}
                          onSelect={(id) => {
                            clearAttention(id);
                            activatePane(id);
                            setActiveCompoundPane(id);
                          }}
                        />
                        <EconomyPanes
                          tabId={tab.id}
                          activePane={selectedCompoundPane}
                          state={store.getState()}
                          store={store}
                        />
                      </div>
                    ) : tab.id === "galaxy" &&
                      (store.getState().run.space.ascendencyAwardedThisRun ||
                        store.getState().permanent.rebirthCount > 0) ? (
                      <div className="tab-section-layout">
                        <PaneNavigation
                          items={galacticPanels}
                          selectedId={selectedGalacticPane}
                          label={t("nav.subsections")}
                          attentionIds={attentionIds}
                          attentionLabel={t("nav.new")}
                          attentionLabelsById={liveAttentionLabels}
                          onSelect={(id) => {
                            clearAttention(id);
                            activatePane(id);
                            setActiveGalacticPane(id as GalacticPaneId);
                          }}
                        />
                        {galacticPanels.map((panel) => (
                          <section
                            key={panel.id}
                            id={`panel-${panel.id}`}
                            className="subpane-panel"
                            role="tabpanel"
                            aria-labelledby={`tab-${panel.id}`}
                            tabIndex={0}
                            hidden={selectedGalacticPane !== panel.id}
                          >
                            {visitedPanes.has(panel.id) ? (
                              panel.id === "galactic-rebirth" ? (
                                <RebirthPane state={store.getState()} store={store} />
                              ) : panel.id === "galactic-market" ? (
                                <GalacticMarketPane state={store.getState()} store={store} />
                              ) : panel.id === "galactic-ascendency-perks" ? (
                                <AscendencyPane state={store.getState()} store={store} />
                              ) : panel.id === "galactic-megastructures" ? (
                                <MegastructurePane state={store.getState()} store={store} />
                              ) : panel.id === "galactic-black-hole" ? (
                                <BlackHolePane state={store.getState()} store={store} />
                              ) : panel.id === "galactic-casino" ? (
                                <GalacticCasinoPane state={store.getState()} store={store} />
                              ) : null
                            ) : null}
                          </section>
                        ))}
                      </div>
                    ) : tab.id === "interstellar" &&
                      store
                        .getState()
                        .run.economy.researchedTechnologies.includes("stellarCartography") ? (
                      <div className="tab-section-layout">
                        <PaneNavigation
                          items={interstellarPanels}
                          selectedId={selectedInterstellarPane}
                          label={t("nav.subsections")}
                          attentionIds={attentionIds}
                          attentionLabel={t("nav.new")}
                          onSelect={(id) => {
                            clearAttention(id);
                            activatePane(id);
                            setActiveInterstellarPane(id as InterstellarPaneId);
                          }}
                        />
                        {visitedPanes.has("interstellar-star-map") && (
                          <StarMapPane
                            state={store.getState()}
                            store={store}
                            view={
                              selectedInterstellarPane === "interstellar-star-data" ? "data" : "map"
                            }
                            onShowOnMap={() => {
                              activatePane("interstellar-star-map");
                              setActiveInterstellarPane("interstellar-star-map");
                            }}
                          />
                        )}
                        <section
                          id="panel-interstellar-starship"
                          className="subpane-panel"
                          role="tabpanel"
                          aria-labelledby={`tab-${selectedInterstellarPane}`}
                          tabIndex={0}
                          hidden={
                            selectedInterstellarPane !== "interstellar-starship" &&
                            selectedInterstellarPane !== "interstellar-fleet-hangar" &&
                            selectedInterstellarPane !== "interstellar-colonise"
                          }
                        >
                          {(visitedPanes.has("interstellar-starship") ||
                            visitedPanes.has("interstellar-fleet-hangar") ||
                            visitedPanes.has("interstellar-colonise")) && (
                            <StarshipPane
                              state={store.getState()}
                              store={store}
                              view={
                                selectedInterstellarPane === "interstellar-fleet-hangar"
                                  ? "fleet-hangar"
                                  : selectedInterstellarPane === "interstellar-colonise"
                                    ? "colonise"
                                    : "starship"
                              }
                            />
                          )}
                        </section>
                      </div>
                    ) : tab.id === "space-mining" &&
                      store
                        .getState()
                        .run.economy.researchedTechnologies.includes("atmosphericTelescopes") ? (
                      <div className="tab-section-layout">
                        <PaneNavigation
                          items={spaceMiningPanels}
                          selectedId={selectedSpaceMiningPane}
                          label={t("nav.subsections")}
                          attentionIds={attentionIds}
                          attentionLabel={t("nav.new")}
                          onSelect={(id) => {
                            clearAttention(id);
                            activatePane(id);
                            setActiveSpaceMiningPane(id as SpaceMiningPaneId);
                          }}
                        />
                        <SpaceMiningPane
                          state={store.getState()}
                          store={store}
                          activePane={selectedSpaceMiningPane}
                        />
                      </div>
                    ) : tab.id === "cosmic-rip" && store.getState().permanent.cosmicRip.unlocked ? (
                      <div className="tab-section-layout">
                        <PaneNavigation
                          items={cosmicRipPanels}
                          selectedId={selectedCosmicRipPane}
                          label={t("nav.subsections")}
                          attentionIds={attentionIds}
                          attentionLabel={t("nav.new")}
                          onSelect={(id) => {
                            clearAttention(id);
                            activatePane(id);
                            setActiveCosmicRipPane(id as CosmicRipPaneId);
                          }}
                        />
                        <CosmicRipPane
                          state={store.getState()}
                          store={store}
                          activePane={selectedCosmicRipPane}
                        />
                      </div>
                    ) : tab.id === "miaplaedia" ? (
                      <div className="tab-section-layout">
                        <PaneNavigation
                          items={miaplaediaPanels}
                          selectedId={activeMiaplaediaPane}
                          label={t("nav.subsections")}
                          attentionIds={attentionIds}
                          attentionLabel={t("nav.new")}
                          onSelect={(id) => {
                            activatePane(id);
                            setActiveMiaplaediaPane(id as MiaplaediaPaneId);
                          }}
                        />
                        {miaplaediaPanels.map((panel) => (
                          <section
                            key={panel.id}
                            id={`panel-${panel.id}`}
                            className="subpane-panel"
                            role="tabpanel"
                            aria-labelledby={`tab-${panel.id}`}
                            tabIndex={0}
                            hidden={activeMiaplaediaPane !== panel.id}
                          >
                            {activeMiaplaediaPane === panel.id || visitedPanes.has(panel.id) ? (
                              <MiaplaediaPane
                                locale={snapshot.locale}
                                sectionId={miaplaediaSectionId(panel.id as MiaplaediaPaneId)}
                              />
                            ) : null}
                          </section>
                        ))}
                      </div>
                    ) : tab.id === "settings" ? (
                      <SettingsPane
                        state={store.getState()}
                        store={store}
                        attentionIds={attentionIds}
                        attentionLabel={t("nav.new")}
                        onPaneVisit={activatePane}
                        savePersistent={savePersistent}
                        saveStatus={
                          saveFailure ||
                          saveStatus ||
                          (savePersistent ? saveLabel("saved") : saveLabel("unsaved"))
                        }
                        autoSaveEnabled={autoSaveEnabled}
                        autoSaveInterval={autoSaveInterval}
                        onAutoSaveEnabledChange={(enabled) => {
                          setAutoSaveEnabled(enabled);
                          repository?.writePreferences({ autoSaveEnabled: enabled });
                        }}
                        onAutoSaveIntervalChange={(interval) => {
                          setAutoSaveInterval(interval);
                          repository?.writePreferences({ autoSaveIntervalSeconds: interval });
                        }}
                        onSaveNow={() => persistCurrent()}
                        onOpenSaveManager={() => setSaveManagerOpen(true)}
                      />
                    ) : sourceIndex < 4 ? (
                      <EconomyPanes
                        tabId={tab.id}
                        activePane={
                          tab.id === "energy"
                            ? selectedEnergyPane
                            : tab.id === "compounds"
                              ? selectedCompoundPane
                              : selectedResearchPane
                        }
                        state={currentState}
                        store={store}
                      />
                    ) : null}
                  </Suspense>
                )}
              </section>
            );
          })}
        </div>
      </div>
      {saveManagerOpen && (
        <Suspense fallback={<div className="pane-loading" aria-hidden="true" />}>
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
              onReplaceActive(envelope);
            }}
            onDeleted={onDeleteActive}
            onClose={() => setSaveManagerOpen(false)}
          />
        </Suspense>
      )}
      {store.getState().run.philosophyChoicePending && (
        <Suspense fallback={<div className="pane-loading" aria-hidden="true" />}>
          <PhilosophyPane state={store.getState()} store={store} />
        </Suspense>
      )}
      {store.getState().permanent.megastructures.miaplacidusStoryPending && (
        <Suspense fallback={<div className="pane-loading" aria-hidden="true" />}>
          <MiaplacidusEndgameStory state={store.getState()} store={store} />
        </Suspense>
      )}
      {DebugTools && (
        <DebugTools
          store={store}
          seed={seed}
          open={debugLabOpen}
          onClose={() => setDebugLabOpen(false)}
          advanceBy={advanceTestClock}
          applyTestCheckpoint={onApplyTestCheckpoint}
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
