import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import type { EconomicGoodId, LocaleId } from "../content/ids";
import { isEconomicGoodId, LOCALE_IDS, autobuyerUpgradeId } from "../content/ids";
import { DEFAULT_THEME_ID } from "../content/themes";
import {
  HYDROGEN_STORAGE_MULTIPLIER,
  HYDROGEN_STORAGE_PRICE_OFFSET,
  hydrogenAutobuyerPrice,
} from "../content/hydrogen";
import { createEconomyTickPlan } from "../engine/economySimulation";
import { MAX_FOREGROUND_STEP_MS } from "../engine/clock";
import { createGameStore, type GameStore } from "../engine/store";
import { createInitialGameState, type GameState } from "../engine/state";
import { galacticTabUnlocked } from "../engine/galacticProgression";
import { starTypeForSystem } from "../content/starCatalogue";
import { O_TYPE_POWER_PLANT_IDS } from "../content/starTypeRules";
import {
  selectAutobuyerBuyMax,
  selectHydrogenAutobuyerPurchase,
  selectHydrogenCollection,
  selectHydrogenSale,
  selectHydrogenStoragePurchase,
} from "../engine/selectors";
import { displayCurrency, displayQuantity } from "../engine/precision";
import { formatCurrency } from "./currencyFormatting";
import { formatNumber } from "./numberFormatting";
import { translate, type MessageKey } from "../i18n/messages";
import {
  economyGoodOverviewHelp,
  economyLabel,
  formatEconomyMessage,
} from "../i18n/economyMessages";
import { economyActionHelp } from "../i18n/economyActionHelpMessages";
import { economyAutobuyerName } from "../i18n/economyAutobuyerNameMessages";
import { GameErrorBoundary } from "../ui/GameErrorBoundary";
import { useGameSnapshot } from "../ui/useGameSnapshot";
import { currentWeatherForSystem } from "../engine/weather";
import { philosophyRepeatableRank } from "../engine/philosophy";
import { BUILD_INFO } from "./buildInfo";
import { NewsTickerBar } from "./NewsTickerBar";
import { ProgressionTutorial, type ProgressionTutorialCommand } from "./ProgressionTutorial";
import { withGameAudio } from "./audio";
import { economyGoodName, economyRatePerSecond } from "./economyDisplay";
import { EconomicGoodEmblem } from "./EconomicGoodEmblem";
import { blackHoleText } from "../i18n/blackHoleMessages";
import { SaveStartScreen } from "./SaveStartScreen";
import { InfoTooltip } from "./InfoTooltip";
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
  compoundPaneGroups,
  energyPaneItems,
  researchPaneItems,
  settingsPaneItems,
  compoundPaneItems,
  type GalacticPaneId,
  type InterstellarPaneId,
  type MiaplaediaPaneId,
  type SpaceMiningPaneId,
  type CosmicRipPaneId,
  type SettingsPaneId,
} from "./presentationNavigation";
import {
  acquireSlotLock,
  browserStorage,
  createSaveRepository,
  createSlotId,
  SaveError,
  validatePioneerName,
  type SaveEnvelopeV1,
  type SaveErrorCode,
  type SaveRepository,
} from "../persistence";
import { saveErrorText, saveText } from "../i18n/saveMessages";
import { GlobalContextBar, TopStatusBar } from "./TopStatusBar";
import { TECHNOLOGY_NAMES } from "../content/technologyNames";
import { cosmicRipText } from "../i18n/cosmicRipMessages";
import { starshipText } from "../i18n/starshipMessages";
import { localizedRocketUserName } from "../i18n/rocketMessages";
import { technologyNotificationText } from "../i18n/technologyNotificationMessages";
import { spaceNotificationText } from "../i18n/spaceNotificationMessages";
import { oTypeStarTechAcquiredDialog } from "../i18n/spaceProgressionDialogMessages";
import { createSpaceEventNoticeHandler } from "./spaceEventNotifications";
import { createCasinoEventNoticeHandler } from "./casinoEventNotifications";
import type { VoidSeerOutcome } from "../engine/galacticCasino";
import { VOID_SEER_RESULT_DELAY_MS } from "./galacticCasinoTiming";
import { createBlackHoleEventNoticeHandler } from "./blackHoleEventNotifications";
import {
  createCosmicRipEventNoticeHandler,
  cosmicRipTechnologyResearchedNotice,
} from "./cosmicRipEventNotifications";
import { cosmicRipResearchResultDialog } from "../i18n/cosmicRipResearchResultDialogMessages";
import { megastructureResearchResultCopy } from "../i18n/megastructureResearchResultMessages";
import {
  researchUnlockResultDialog,
  researchUnlockResultDialogForTechnology,
} from "../i18n/researchUnlockResultDialogMessages";
import {
  createGalacticMarketEventNoticeHandler,
  galacticMarketLockdownEntryNotice,
} from "./galacticMarketEventNotifications";
import { createPhilosophyEventNoticeHandler } from "./philosophyEventNotifications";
import { createAchievementEventNoticeHandler } from "./achievementEventNotifications";
import { createRandomEventEndNoticeHandler } from "./randomEventEndNotifications";
import {
  RandomEventResultDialog,
  type RandomEventDialogEntry,
} from "./RandomEventResultDialog";
import type { RandomEventDialogCopy } from "../i18n/randomEventDialogTypes";
import { createRandomEventInstabilityNoticeHandler } from "./randomEventInstabilityNotifications";
import { createRandomEventTriggeredNoticeHandler } from "./randomEventTriggeredNotifications";
import { dispatchEconomySale } from "./economySaleNotifications";
import {
  createStorageFullNoticeHandler,
  dispatchEconomyAutobuyerPurchase,
  dispatchEconomyStoragePurchase,
} from "./economyActionNotifications";
import { WeatherEffectsOverlay } from "./WeatherEffectsOverlay";
import {
  GameNotificationProvider,
  GameNotificationRegion,
  useGameNotificationControls,
  useGameNotifications,
  useGameScreenReaderAnnouncements,
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
const HydrogenAllocationBreakdownTooltip = lazy(() =>
  import("./EconomyPanes").then((module) => ({ default: module.HydrogenAllocationBreakdownTooltip })),
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
const CosmicRipEndingCinematic = lazy(() =>
  import("./CosmicRipEndingCinematic").then((module) => ({
    default: module.CosmicRipEndingCinematic,
  })),
);

// The parent tab panel controls visibility, so preserve the last child tree as
// soon as it becomes inactive and refresh it only when the player returns.
const FreezeInactiveTabContent = memo(
  function FreezeInactiveTabContent({
    render,
  }: {
    readonly active: boolean;
    readonly render: () => ReactNode;
  }) {
    return <>{render()}</>;
  },
  (_previous, next) => !next.active,
);
const GAME_TABS = [
  { id: "hydrogen", key: "tab.hydrogen", overviewKey: "resourcesOverviewHelp" },
  { id: "compounds", key: "tab.compounds", overviewKey: "compoundsOverviewHelp" },
  { id: "research", key: "tab.research", overviewKey: "researchOverviewHelp" },
  { id: "energy", key: "tab.energy", overviewKey: "energyOverviewHelp" },
  { id: "space-mining", key: "tab.spaceMining", overviewKey: "spaceMiningOverviewHelp" },
  { id: "interstellar", key: "tab.interstellar", overviewKey: "interstellarOverviewHelp" },
  { id: "galaxy", key: "tab.galaxy", overviewKey: "galacticOverviewHelp" },
  { id: "cosmic-rip", key: "tab.cosmicRip" },
  { id: "settings", key: "tab.settings", overviewKey: "settingsOverviewHelp" },
  { id: "miaplaedia", key: "tab.miaplaedia" },
] as const satisfies readonly {
  id: string;
  key: MessageKey;
  overviewKey?: Parameters<typeof economyLabel>[1];
}[];

const DEBUG_ENABLED = true;

type GameTabId = (typeof GAME_TABS)[number]["id"];
const ECONOMY_TAB_IDS = new Set<GameTabId>(["compounds", "research", "energy"]);

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
    (tabId === "galaxy" && galacticTabUnlocked(state)) ||
    (tabId === "cosmic-rip" && state.permanent.cosmicRip.unlocked) ||
    tabId === "settings" ||
    tabId === "miaplaedia"
  );
}

function EconomyRail({
  groups,
  state,
  activePane,
  hidden,
  storageScope,
  panePrefix,
  label,
  testId,
  className,
  navigationDisabled = false,
  onSelect,
}: {
  readonly groups: readonly {
    readonly id: string;
    readonly label: string;
    readonly goodIds: readonly EconomicGoodId[];
  }[];
  readonly state: GameState;
  readonly activePane: string;
  readonly hidden: boolean;
  readonly storageScope: string;
  readonly panePrefix: "resources" | "compounds";
  readonly label: string;
  readonly testId: string;
  readonly className?: string;
  readonly navigationDisabled?: boolean;
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
      className={`resource-rail${className ? ` ${className}` : ""}`}
      aria-label={label}
      data-testid={testId}
      hidden={hidden}
    >
      {groups.map((group) => {
        const collapsed = collapsedGroupIds.has(group.id);
        const groupPanelId = `${panePrefix}-rail-group-${group.id}`;
        return (
          <section className="resource-rail-group" key={group.id}>
            <button
              className="resource-rail-group-toggle"
              type="button"
              data-testid={`resource-group-toggle-${group.id}`}
              aria-expanded={!collapsed}
              aria-controls={groupPanelId}
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
            <div id={groupPanelId} hidden={collapsed}>
              {group.goodIds.map((goodId) => {
                const good = state.run.goods[goodId];
                const rate = economyRatePerSecond(state, goodId);
                const paneId = `${panePrefix}-${goodId}`;
                return (
                  <button
                    key={goodId}
                    className={`resource-item${activePane === paneId ? " is-current" : ""}`}
                    type="button"
                    disabled={navigationDisabled}
                    aria-disabled={navigationDisabled || undefined}
                    data-testid={
                      panePrefix === "resources"
                        ? `resource-rail-${goodId}`
                        : `compound-rail-${goodId}`
                    }
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

const FreezeInactiveEconomyRail = memo(
  EconomyRail,
  (previous, next) => previous.hidden && next.hidden,
);

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
  readonly offlineGainsNoticeOnStart: boolean;
  readonly testClock: TestClock;
  readonly seed: number;
  readonly frameMetrics: FrameMetrics;
  readonly repository: SaveRepository | null;
  readonly slotId: string;
  readonly revision: number;
  readonly persistent: boolean;
  readonly initialWarning?: SaveErrorCode | undefined;
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

function localizedReason(
  locale: LocaleId,
  key: string | undefined,
  required?: number,
  notation: GameState["settings"]["notation"] = "condensed",
): string {
  if (key === "ui.hydrogen.inventory-full") return translate(locale, "reason.inventory-full");
  if (key === "ui.hydrogen.no-stock") return translate(locale, "reason.no-stock");
  if (key === "ui.hydrogen.autobuyer-locked") return translate(locale, "reason.autobuyer-locked");
  if (key === "engine.purchase.insufficient-material") {
    return `${translate(locale, "reason.insufficient")} ${formatNumber(locale, required ?? 0, 2, notation)} H\u2082.`;
  }
  return key ? translate(locale, "error.actionUnavailable") : "";
}

export function App() {
  return (
    <GameNotificationProvider>
      <AppContent />
    </GameNotificationProvider>
  );
}

function AppContent() {
  const notify = useGameNotifications();
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
    offlineGainsNoticeOnStart: boolean;
    warning?: SaveErrorCode;
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
  const [starting, setStarting] = useState(false);
  const [focusNameOnStartup, setFocusNameOnStartup] = useState(false);
  const [slotRefresh, setSlotRefresh] = useState(0);
  const startScreenThemeId = useMemo(() => {
    if (!repository || !selectedSlotId) return DEFAULT_THEME_ID;
    try {
      return repository.readSlot(selectedSlotId)?.state.settings.themeId ?? DEFAULT_THEME_ID;
    } catch {
      return DEFAULT_THEME_ID;
    }
  }, [repository, selectedSlotId]);
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
  }

  function selectSavedPioneer(slotId: string, name: string) {
    setPioneerName(name);
    setSelectedSlotId(slotId);
  }

  function setDraftLocale(nextLocale: LocaleId) {
    setLocale(nextLocale);
  }

  async function startSelectedRun() {
    if (starting) return;
    setStarting(true);
    let releaseLock = () => {};
    let unsavedWarning: SaveErrorCode | "" = "";
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
      if (!repository) unsavedWarning = "storage-unavailable";
      if (repository) {
        const acquired = await acquireSlotLock(slotId);
        if (acquired) releaseLock = acquired;
        else {
          persistent = false;
          unsavedWarning = "conflict";
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
            },
          },
          settings: { ...envelope.state.settings, locale },
        };
        revision = envelope.revision;
        try {
          repository.activate(slotId);
        } catch {
          persistent = false;
          unsavedWarning = "storage-unavailable";
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
              "philosophy-notification-routes",
              "hydrogen-sale-currency-tail",
              "notation-coverage",
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
              "storage-production",
              "save",
              "bulk-hydrogen",
              "bulk-science",
              "bulk-energy",
              "power-buildings",
              "buyer-tiers",
              "compound-automation",
              "multipliers",
              "space-telescope",
              "space-telescope-shortfall",
              "space-telescope-before-launch-pad",
              "space-asteroid-mining",
              "space-rocket-part-shortfall",
              "space-rocket-part-exact",
              "space-rocket-fuel-pump",
              "space-starship",
              "space-starship-ready",
              "space-starship-scanning",
              "space-starship-scanning-blind",
              "space-starship-o-arrival",
              "space-starship-factory-arrival",
              "space-diplomacy",
              "space-battle-victory",
              "space-rapid-expansion-victory",
              "space-battle-defeat",
              "space-diplomacy-power",
              "space-diplomacy-power-fail",
              "space-diplomacy-aggressive",
              "space-bully-scared",
              "space-bully-surrender",
              "space-unoccupied",
              "space-megastructure-attention",
              "meta-rebirth-ready",
              "meta-o-type-rebirth-ready",
              "meta-market-ready",
              "meta-market-rebirth-ready",
              "meta-market-action-reasons",
              "meta-market-action-reasons-rebirth-ready",
              "meta-casino-ready",
              "meta-casino-timewarp",
              "meta-casino-finish-rocket-journey",
              "meta-casino-telescope-asteroid-prize",
              "meta-casino-telescope-star-study-prize",
              "meta-casino-telescope-void-pillage-prize",
              "meta-post-rebirth-casino-access",
              "meta-black-hole-discovered",
              "meta-black-hole-underfunded",
              "meta-galactic-identity-matrix",
              "meta-megastructure-route",
              "meta-megastructure-audio",
              "meta-megastructure-factory-dysonSphere",
              "meta-megastructure-factory-celestialProcessingCore",
              "meta-megastructure-factory-plasmaForge",
              "meta-megastructure-factory-galacticMemoryArchive",
              "meta-megastructure-visual-dysonSphere",
              "meta-megastructure-visual-celestialProcessingCore",
              "meta-megastructure-visual-plasmaForge",
              "meta-megastructure-visual-galacticMemoryArchive",
              "meta-megastructure-research-reasons",
              "meta-cosmic-rip-route",
              "meta-cosmic-rip-objective-scan",
              "meta-cosmic-rip-restore-affordance",
              "meta-cosmic-rip-sector-action-affordances",
              "meta-cosmic-rip-action-affordances",
              "meta-cosmic-rip-close-affordance",
              "meta-cosmic-rip-ending-ready",
              "space-late-game",
              "space-returning-rocket",
              "space-voidborn-pillage",
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
            unsavedWarning = error instanceof SaveError ? error.code : "storage-unavailable";
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
        offlineGainsNoticeOnStart: Boolean(existing),
        ...(unsavedWarning ? { warning: unsavedWarning } : {}),
      });
    } catch (error) {
      releaseLock();
      notify(
        saveErrorText(locale, error instanceof SaveError ? error.code : "storage-unavailable"),
        { classification: "save", type: "error" },
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
      notify(saveErrorText(locale, "conflict"), { classification: "save", type: "error" });
      return;
    }
    try {
      const recovered = repository.restoreGeneration(reference, Date.now());
      setPioneerName(recovered.pioneerName);
      setSelectedSlotId(null);
      notify(saveText(locale, "recovered"), { classification: "save", type: "success" });
      setSlotRefresh((value) => value + 1);
    } catch (error) {
      notify(
        saveErrorText(locale, error instanceof SaveError ? error.code : "corrupt-slot"),
        { classification: "save", type: "error" },
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
    setFocusNameOnStartup(true);
  }
  function afterDeleteActive() {
    const fallbackName = repository?.readPreferences().lastConfirmedName ?? "Pioneer";
    const currentLocale = store?.getState().settings.locale ?? locale;
    setPioneerName(fallbackName);
    setSelectedSlotId(null);
    notify(saveText(currentLocale, "saveDeleted"), { classification: "save", type: "success" });
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
      offlineGainsNoticeOnStart: false,
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
            offlineGainsNoticeOnStart={session.offlineGainsNoticeOnStart}
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
          />
        ) : (
          <SaveStartScreen
            key={slotRefresh}
            locale={locale}
            themeId={startScreenThemeId}
            setLocale={setDraftLocale}
            name={pioneerName}
            setName={setDraftName}
            slots={repository?.list() ?? []}
            selectedSlotId={selectedSlotId}
            focusNameOnMount={focusNameOnStartup}
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
  offlineGainsNoticeOnStart,
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
}: GameSessionProps) {
  const store = useMemo(() => withGameAudio(engineStore), [engineStore]);
  const isBattleNavigationLocked = () =>
    store
      .getState()
      .run.space.systemEncounters.some(({ battle }) => battle.phase === "inProgress");
  const battleInProgressAtMount = isBattleNavigationLocked();
  useEffect(() => () => store.dispose(), [store]);
  const snapshot = useGameSnapshot(store);
  const notify = useGameNotifications();
  const announceScreenReader = useGameScreenReaderAnnouncements();
  const setNotificationsEnabled = useGameNotificationControls();
  const [activeTab, setActiveTab] = useState<GameTabId>(
    battleInProgressAtMount ? "interstellar" : "hydrogen",
  );
  const [visitedTabs, setVisitedTabs] = useState<ReadonlySet<GameTabId>>(
    () =>
      new Set<GameTabId>(
        battleInProgressAtMount ? ["hydrogen", "interstellar"] : ["hydrogen"],
      ),
  );
  const [visitedPanes, setVisitedPanes] = useState<ReadonlySet<string>>(
    () =>
      new Set([
        "resources-hydrogen",
        "energy-summary",
        "research-science-buildings",
        "research-tech-tree",
        "compounds-diesel",
        "galactic-rebirth",
        "interstellar-star-map",
        "space-mining-telescope",
        "cosmic-rip-situation",
        ...(battleInProgressAtMount ? ["interstellar-colonise"] : []),
      ]),
  );
  const [activeGalacticPane, setActiveGalacticPane] = useState<GalacticPaneId>("galactic-rebirth");
  const [pendingVoidSeerPresentation, setPendingVoidSeerPresentation] = useState<{
    readonly outcome: VoidSeerOutcome;
    readonly startedAt: number;
  } | null>(null);
  const [activeMiaplaediaPane, setActiveMiaplaediaPane] =
    useState<MiaplaediaPaneId>("miaplaedia-get-started");
  const [activeSettingsPane, setActiveSettingsPane] = useState<SettingsPaneId>("settings-visual");
  const [activeInterstellarPane, setActiveInterstellarPane] =
    useState<InterstellarPaneId>(
      battleInProgressAtMount ? "interstellar-colonise" : "interstellar-star-map",
    );
  const [activeSpaceMiningPane, setActiveSpaceMiningPane] =
    useState<SpaceMiningPaneId>("space-mining-launch-pad");
  const [activeCosmicRipPane, setActiveCosmicRipPane] =
    useState<CosmicRipPaneId>("cosmic-rip-situation");
  const [activeResourcePane, setActiveResourcePane] = useState("resources-hydrogen");
  const [activeEnergyPane, setActiveEnergyPane] = useState("energy-summary");
  const [activeResearchPane, setActiveResearchPane] = useState("research-science-buildings");
  const [activeCompoundPane, setActiveCompoundPane] = useState("compounds-diesel");
  const [sellAmount, setSellAmount] = useState<number | "all">("all");
  const [feedback, setFeedback] = useState("");
  const [saveRevision, setSaveRevision] = useState(initialRevision);
  const saveRevisionRef = useRef(initialRevision);
  const [savePersistent, setSavePersistent] = useState(initialPersistent);
  const [saveWritesPaused, setSaveWritesPaused] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [saveFailure, setSaveFailure] = useState<SaveErrorCode | null>(initialWarning ?? null);
  const [exitConfirmation, setExitConfirmation] = useState(false);
  const [pendingPioneerName, setPendingPioneerName] = useState<string | null>(null);
  const exitDialogRef = useRef<HTMLDialogElement>(null);
  const [randomEventResultDialogs, setRandomEventResultDialogs] = useState<
    readonly RandomEventDialogEntry[]
  >([]);
  const [cosmicRipEndingVisible, setCosmicRipEndingVisible] = useState(false);
  const showCosmicRipEnding = useCallback(() => setCosmicRipEndingVisible(true), []);
  const completeCosmicRipEnding = useCallback(() => {
    setCosmicRipEndingVisible(false);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[data-testid="cosmic-rip-closed"]')?.focus();
    });
  }, []);
  const randomEventDialogSequence = useRef(0);
  const enqueueRandomEventResultDialog = useCallback(
    (dialog: RandomEventDialogCopy, onConfirm?: () => void) => {
    randomEventDialogSequence.current += 1;
    const id = randomEventDialogSequence.current;
      setRandomEventResultDialogs((current) => [
        ...current,
        { ...dialog, id, ...(onConfirm ? { onConfirm } : {}) },
      ]);
    },
    [],
  );
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(
    repository?.readPreferences().autoSaveEnabled ?? true,
  );
  const [autoSaveInterval, setAutoSaveInterval] = useState<300 | 900 | 1800 | 3600>(
    repository?.readPreferences().autoSaveIntervalSeconds ?? 300,
  );
  const [debugScenarioOpen, setDebugScenarioOpen] = useState(false);
  const [debugLabOpen, setDebugLabOpen] = useState(false);
  const currentLocaleRef = useRef(snapshot.locale);
  const offlineGainsNoticePending = useRef(offlineGainsNoticeOnStart);
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
    testLabOpen: boolean;
    onClose: () => void;
    onTestLabClose: () => void;
    advanceBy: (milliseconds: number) => void;
    readFrameMetrics: () => {
      readonly frames: number;
      readonly durationMs: number;
      readonly framesPerSecond: number;
    };
  }> | null>(null);
  const t = (key: MessageKey) => translate(snapshot.locale, key);
  const activateTab = (tabId: GameTabId) => {
    if (isBattleNavigationLocked()) return;
    store.playUiCue("click");
    setVisitedTabs((current) => (current.has(tabId) ? current : new Set(current).add(tabId)));
    setActiveTab(tabId);
  };
  const visitNavigationPages = (pageIds: readonly string[]) => {
    const current = store.getState();
    const attentionIds = new Set(current.run.navigationAttentionIds);
    const visitedIds = new Set(current.permanent.navigationVisitedIds);
    const pagesToVisit = [...new Set(pageIds)].filter(
      (pageId) => attentionIds.has(pageId) || !visitedIds.has(pageId),
    );
    if (pagesToVisit.length === 0) return;
    store.dispatch({ type: "navigation.attention.clear-many", pageIds: pagesToVisit });
  };
  const clearAttention = (pageId: string) => visitNavigationPages([pageId]);
  const activatePane = (paneId: string, playClick = true) => {
    if (isBattleNavigationLocked()) return;
    if (playClick) store.playUiCue("click");
    setVisitedPanes((current) => (current.has(paneId) ? current : new Set(current).add(paneId)));
    visitNavigationPages([paneId]);
  };
  const playSoundEffectsDisableCue = useCallback(() => store.playUiCue("swipe"), [store]);
  const openSavingAndLoading = () => {
    if (isBattleNavigationLocked()) return;
    setActiveSettingsPane("settings-saves");
    activatePane("settings-saves", false);
    activateTab("settings");
  };
  const hydrogen = snapshot.goods.hydrogen;
  const buyerCount = snapshot.upgrades[autobuyerUpgradeId("hydrogen", 1)] ?? 0;
  const buyerPrice = hydrogenAutobuyerPrice(
    buyerCount,
    0.95 ** philosophyRepeatableRank(store.getState(), "laserMining"),
  );
  const saveLabel = useCallback(
    (key: Parameters<typeof saveText>[1]) => saveText(snapshot.locale, key),
    [snapshot.locale],
  );
  const saveFailureText = saveFailure ? saveErrorText(snapshot.locale, saveFailure) : "";
  const saveConflictAnnouncement = saveWritesPaused
    ? `${saveFailureText.replace(/[.!?]\s*$/, "")}. ${[saveLabel("reload"), saveLabel("export")]
        .map((label) => label.replace(/[:;]\s*$/, ""))
        .join("; ")}.`
    : "";

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
      const savedAt = Date.now();
      const durableState: GameState = {
        ...current,
        run: {
          ...current.run,
          clock: {
            ...current.run.clock,
            wallNowMs: savedAt,
            foreground: false,
            hiddenElapsedMs: 0,
          },
        },
      };
      try {
        const saved = repository.commit(
          slotId,
          durableState,
          current.run.pioneerName,
          savedAt,
          saveRevisionRef.current,
        );
        saveRevisionRef.current = saved.revision;
        setSaveRevision(saved.revision);
        setSaveStatus(saveLabel("saved"));
        setSaveFailure(null);
        return saved;
      } catch (error) {
        const errorCode = error instanceof SaveError ? error.code : "storage-unavailable";
        setSaveFailure(errorCode);
        setSaveStatus("");
        if (errorCode === "conflict" || errorCode === "corrupt-slot") setSaveWritesPaused(true);
        if (errorCode === "storage-unavailable") setSavePersistent(false);
        return null;
      }
    },
    [repository, savePersistent, saveWritesPaused, store, slotId, saveLabel],
  );
  const persistCurrentRef = useRef(persistCurrent);
  useEffect(() => {
    persistCurrentRef.current = persistCurrent;
  }, [persistCurrent]);

  const dispatchTutorialCommand = useCallback(
    (command: ProgressionTutorialCommand) => {
      const result = store.dispatch(command);
      if (result.accepted) persistCurrent();
    },
    [persistCurrent, store],
  );
  const recordTutorialBackgroundAudioToggle = useCallback(() => {
    const tutorial = store.getState().permanent.progressionTutorial;
    if (tutorial.status === "active" && tutorial.stepId === "visitAudioSettings") {
      dispatchTutorialCommand({ type: "tutorial.advance", stepId: "visitAudioSettings" });
    }
  }, [dispatchTutorialCommand, store]);
  const recordTutorialThemeSelectorInteraction = useCallback(() => {
    const state = store.getState();
    const tutorial = state.permanent.progressionTutorial;
    if (tutorial.status === "active" && tutorial.stepId === "openThemeDropdown") {
      dispatchTutorialCommand({ type: "tutorial.advance", stepId: "openThemeDropdown" });
      return;
    }
    if (
      tutorial.status === "active" &&
      tutorial.stepId === "chooseDarkTheme" &&
      state.settings.themeId === "dark"
    ) {
      dispatchTutorialCommand({ type: "tutorial.advance", stepId: "chooseDarkTheme" });
    }
  }, [dispatchTutorialCommand, store]);

  useEffect(
    () =>
      store.subscribeEvents((events) => {
        if (
          !events.some(
            (event) =>
              event.type === "resource.sold" &&
              event.goodId === "hydrogen" &&
              event.origin === "manual",
          )
        )
          return;
        const tutorial = store.getState().permanent.progressionTutorial;
        if (tutorial.status !== "active" || tutorial.stepId !== "sellHydrogenAction") return;
        dispatchTutorialCommand({ type: "tutorial.advance", stepId: "sellHydrogenAction" });
      }),
    [dispatchTutorialCommand, store],
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
        setSaveFailure("conflict");
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
    setExitConfirmation(true);
  }

  async function saveRunAsNew(name: string) {
    if (!repository) throw new SaveError("storage-unavailable", "Browser storage is unavailable.");
    const newSlotId = createSlotId();
    const newLockRelease = await acquireSlotLock(newSlotId);
    if (!newLockRelease) throw new SaveError("conflict", "A single-writer lock is not available.");
    const current = store.getState();
    const savedAt = Date.now();
    const durableState: GameState = {
      ...current,
      run: {
        ...current.run,
        clock: {
          ...current.run.clock,
          wallNowMs: savedAt,
          foreground: false,
          hiddenElapsedMs: 0,
        },
      },
    };
    try {
      const created = repository.create(newSlotId, durableState, name, savedAt);
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
      const announceOfflineGains =
        offlineGainsNoticePending.current &&
        document.visibilityState === "visible" &&
        !current.run.clock.foreground;
      const result = store.dispatch({
        type: "clock.advance",
        input: {
          wallNowMs: wallNow(),
          foreground: document.visibilityState === "visible",
          maxForegroundSteps: 1,
        },
        tickPlan,
        offlineTickPlan: tickPlan,
      });
      if (announceOfflineGains && result.accepted) {
        offlineGainsNoticePending.current = false;
        notify(saveText(currentLocaleRef.current, "offlineGainsAdded"), {
          classification: "loadSave",
          type: "info",
          durationMs: 3000,
        });
      }
      store.publishNow();
      if (document.visibilityState === "hidden") persistCurrent(true);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    let frame = 0;
    let lastPresentationPublishAt = 0;
    let lastSimulationTickAt: number | null = null;
    const tick = (timestamp: number) => {
      frameMetrics.frames += 1;
      frameMetrics.firstFrameAt ??= timestamp;
      frameMetrics.lastFrameAt = timestamp;
      const currentClock = store.getState().run.clock;
      const catchUpPending = currentClock.pendingForegroundMs > 0;
      const simulationTickDue =
        lastSimulationTickAt === null ||
        timestamp - lastSimulationTickAt >= MAX_FOREGROUND_STEP_MS ||
        catchUpPending;
      if (simulationTickDue) {
        const state = store.getState();
        const tickPlan = createEconomyTickPlan(state).tickPlan;
        const announceOfflineGains =
          offlineGainsNoticePending.current &&
          document.visibilityState === "visible" &&
          !state.run.clock.foreground;
        const result = store.dispatch({
          type: "clock.advance",
          input: {
            wallNowMs: wallNow(),
            foreground: document.visibilityState === "visible",
            // A long frame can leave several 250 ms slices queued. Process one
            // per animation frame so catch-up never monopolizes one frame.
            maxForegroundSteps: 1,
          },
          tickPlan,
          offlineTickPlan: tickPlan,
        });
        if (announceOfflineGains && result.accepted) {
          offlineGainsNoticePending.current = false;
          notify(saveText(currentLocaleRef.current, "offlineGainsAdded"), {
            classification: "loadSave",
            type: "info",
            durationMs: 3000,
          });
        }
        store.publishIfDue();
        if (timestamp - lastPresentationPublishAt >= MAX_FOREGROUND_STEP_MS) {
          store.publishNow();
          lastPresentationPublishAt = timestamp;
        }
        lastSimulationTickAt = timestamp;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [store, testClock, frameMetrics, notify, persistCurrent]);

  useEffect(() => {
    if (!DEBUG_ENABLED || (!import.meta.env.DEV && MIAPLACIDUS_BUILD_MODE !== "test")) return;
    const toggleDebugWindow = (event: KeyboardEvent) => {
      if (event.code !== "NumpadSubtract" && event.code !== "NumpadAdd") return;
      if (event.repeat) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }
      event.preventDefault();
      if (event.code === "NumpadSubtract") {
        setDebugLabOpen(false);
        setDebugScenarioOpen((isOpen) => !isOpen);
      } else {
        setDebugScenarioOpen(false);
        setDebugLabOpen((isOpen) => !isOpen);
      }
    };
    window.addEventListener("keydown", toggleDebugWindow);
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
      window.removeEventListener("keydown", toggleDebugWindow);
    };
  }, [store, seed, frameMetrics, advanceTestClock]);

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
  const battleNavigationLocked = isBattleNavigationLocked();
  useEffect(() => {
    setNotificationsEnabled(currentState.settings.notificationsEnabled !== false);
  }, [currentState.settings.notificationsEnabled, setNotificationsEnabled]);

  useEffect(() => {
    const state = store.getState();
    const megastructures = state.permanent.megastructures;
    if (
      megastructures.megastructureOptionNotificationShown ||
      !megastructures.ancientManuscripts.some(
        (record) => record.factorySystemId === state.run.space.currentSystemId,
      )
    )
      return;

    const result = store.dispatch({ type: "megastructure.option-notice.mark-shown" });
    if (
      !result.accepted ||
      !result.state.permanent.megastructures.megastructureOptionNotificationShown
    )
      return;
    notify(spaceNotificationText(snapshot.locale, "megastructureOptionAvailable"), {
      classification: "tech",
      type: "info",
      durationMs: 3000,
    });
    persistCurrent();
  }, [
    currentState.permanent.megastructures.ancientManuscripts,
    currentState.permanent.megastructures.megastructureOptionNotificationShown,
    currentState.run.space.currentSystemId,
    notify,
    persistCurrent,
    snapshot.locale,
    store,
  ]);

  useEffect(() => {
    const routeSpaceEvents = createSpaceEventNoticeHandler(
      () => currentLocaleRef.current,
      () => store.getState(),
      (notice) =>
        notify(notice.message, {
          classification: notice.classification,
          type: notice.type,
          durationMs: notice.durationMs,
        }),
      (systemId) => {
        const result = store.dispatch({
          type: "space.starship.arrival-notice.mark-notified",
          systemId,
        });
        if (result.accepted) void persistCurrent();
      },
      enqueueRandomEventResultDialog,
    );
    return store.subscribeEvents(routeSpaceEvents);
  }, [enqueueRandomEventResultDialog, notify, persistCurrent, store]);

  useEffect(() => {
    const routeCasinoEvents = createCasinoEventNoticeHandler(
      () => currentLocaleRef.current,
      () => store.getState(),
      (notice) =>
        notify(notice.message, {
          classification: notice.classification,
          type: notice.type,
          durationMs: notice.durationMs,
        }),
    );
    return store.subscribeEvents(routeCasinoEvents);
  }, [notify, store]);

  useEffect(() => {
    const timers = new Map<number, number>();
    const resolveAfterReels = (outcome: VoidSeerOutcome, startedAt: number) => {
      if (timers.has(outcome.playId)) return;
      setPendingVoidSeerPresentation({ outcome, startedAt });
      const delayMs = Math.max(
        0,
        VOID_SEER_RESULT_DELAY_MS - (performance.now() - startedAt),
      ) + 1;
      const timeoutId = window.setTimeout(() => {
        timers.delete(outcome.playId);
        const result = store.dispatch({ type: "casino.void-seer.resolve", outcome });
        if (result.accepted) {
          setPendingVoidSeerPresentation((current) =>
            current?.outcome.playId === outcome.playId ? null : current,
          );
          persistCurrentRef.current();
        }
      }, delayMs);
      timers.set(outcome.playId, timeoutId);
    };
    const unsubscribe = store.subscribeEvents((events) => {
      for (const event of events) {
        if (event.type === "casino.void-seer.started") {
          resolveAfterReels(event.outcome, performance.now());
        }
      }
    });
    return () => {
      unsubscribe();
      for (const timeoutId of timers.values()) window.clearTimeout(timeoutId);
      timers.clear();
    };
  }, [store]);

  useEffect(() => {
    const routeCosmicRipEvents = createCosmicRipEventNoticeHandler(
      () => currentLocaleRef.current,
      (notice) =>
        notify(notice.message, {
          classification: notice.classification,
          type: notice.type,
          durationMs: notice.durationMs,
        }),
      enqueueRandomEventResultDialog,
      showCosmicRipEnding,
    );
    return store.subscribeEvents(routeCosmicRipEvents);
  }, [enqueueRandomEventResultDialog, notify, showCosmicRipEnding, store]);

  useEffect(() => {
    const routeGalacticMarketEvents = createGalacticMarketEventNoticeHandler(
      () => currentLocaleRef.current,
      () => store.getState(),
      (notice) =>
        notify(notice.message, {
          classification: notice.classification,
          type: notice.type,
          durationMs: notice.durationMs,
        }),
    );
    return store.subscribeEvents(routeGalacticMarketEvents);
  }, [notify, store]);

  useEffect(() => {
    const routePhilosophyEvents = createPhilosophyEventNoticeHandler(
      () => currentLocaleRef.current,
      (notice) =>
        notify(notice.message, {
          classification: notice.classification,
          type: notice.type,
          durationMs: notice.durationMs,
        }),
    );
    return store.subscribeEvents(routePhilosophyEvents);
  }, [notify, store]);

  useEffect(() => {
    const routeAchievementEvents = createAchievementEventNoticeHandler(
      () => currentLocaleRef.current,
      () => store.getState(),
      (notice) =>
        notify(notice.message, {
          classification: notice.classification,
          type: notice.type,
          durationMs: notice.durationMs,
        }),
    );
    return store.subscribeEvents(routeAchievementEvents);
  }, [notify, store]);

  useEffect(() => {
    const routeBlackHoleEvents = createBlackHoleEventNoticeHandler(
      () => currentLocaleRef.current,
      (notice) => {
        if (notice.route === "screen-reader") {
          announceScreenReader(notice.message);
          return;
        }
        if (notice.resultDialog) enqueueRandomEventResultDialog(notice.resultDialog);
        notify(notice.message, {
          classification: notice.classification,
          type: notice.type,
          durationMs: notice.durationMs,
        });
      },
    );
    return store.subscribeEvents(routeBlackHoleEvents);
  }, [announceScreenReader, enqueueRandomEventResultDialog, notify, store]);

  useEffect(() => {
    const routeRandomEventInstabilityNotices = createRandomEventInstabilityNoticeHandler(
      () => currentLocaleRef.current,
      () => store.getState().settings.notificationsEnabled !== false,
      (notice) =>
        notify(notice.message, {
          classification: notice.classification,
          type: notice.type,
          durationMs: notice.durationMs,
        }),
    );
    return store.subscribeEvents(routeRandomEventInstabilityNotices);
  }, [notify, store]);

  useEffect(() => {
    const routeRandomEventTriggeredNotices = createRandomEventTriggeredNoticeHandler(
      () => currentLocaleRef.current,
      () => store.getState(),
      (notice) =>
        notify(notice.message, {
          classification: notice.classification,
          type: notice.type,
          durationMs: notice.durationMs,
        }),
      enqueueRandomEventResultDialog,
    );
    return store.subscribeEvents(routeRandomEventTriggeredNotices);
  }, [enqueueRandomEventResultDialog, notify, store]);

  useEffect(() => {
    const routeRandomEventEndNotices = createRandomEventEndNoticeHandler(
      () => currentLocaleRef.current,
      () => store.getState().settings.notificationsEnabled !== false,
      (notice) =>
        notify(notice.message, {
          classification: notice.classification,
          type: notice.type,
          durationMs: notice.durationMs,
        }),
      (eventId, targetId) => {
        if (eventId === "minerBrokeDown" && targetId) {
          const rockets = store.getState().run.space.rockets;
          return Object.hasOwn(rockets, targetId)
            ? localizedRocketUserName(
                currentLocaleRef.current,
                rockets[targetId as keyof typeof rockets]!.name,
              )
            : null;
        }
        if (eventId === "supplyChainDisruption" && isEconomicGoodId(targetId)) {
          return economyGoodName(currentLocaleRef.current, targetId);
        }
        return null;
      },
      enqueueRandomEventResultDialog,
    );
    return store.subscribeEvents(routeRandomEventEndNotices);
  }, [enqueueRandomEventResultDialog, notify, store]);

  useEffect(() => {
    const routeStorageFullNotices = createStorageFullNoticeHandler(
      () => currentLocaleRef.current,
      () => store.getState(),
      (message, options) => notify(message, options),
      (goodId) => dispatchEconomyStoragePurchase(store, goodId, notify),
    );
    return store.subscribeEvents(routeStorageFullNotices);
  }, [notify, store]);

  useEffect(
    () =>
      store.subscribeEvents((events) => {
        if (store.getState().permanent.rebirthCount !== 0) return;
        for (const event of events) {
          if (
            event.type === "meta.perk.purchased" &&
            event.perkId === "nanoBrokers" &&
            event.level === 2
          ) {
            enqueueRandomEventResultDialog(
              researchUnlockResultDialog(currentLocaleRef.current, "compoundMachining"),
            );
          }
        }
      }),
    [enqueueRandomEventResultDialog, store],
  );

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
    if (previous.store !== store) {
      previousNotificationState.current = {
        store,
        rebirthCount: currentState.permanent.rebirthCount,
        economyTechs,
        cosmicRipTechs,
      };
      return;
    }
    if (previous.rebirthCount !== currentState.permanent.rebirthCount) {
      const currentSystemId = currentState.run.space.currentSystemId;
      const acquiredPlantId = O_TYPE_POWER_PLANT_IDS.find(
        (plantId) => currentState.permanent.oTypePowerPlantAssignments[plantId] === currentSystemId,
      );
      if (
        currentState.permanent.rebirthCount > previous.rebirthCount &&
        starTypeForSystem(currentSystemId) === "O" &&
        acquiredPlantId
      ) {
        enqueueRandomEventResultDialog(
          oTypeStarTechAcquiredDialog(snapshot.locale, {
            systemId: currentSystemId,
            plantId: acquiredPlantId,
          }),
        );
      }
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
      const megastructureResult = megastructureResearchResultCopy(snapshot.locale, technologyId);
      if (megastructureResult) enqueueRandomEventResultDialog(megastructureResult);
      if (currentState.permanent.rebirthCount === 0) {
        const unlockResult = researchUnlockResultDialogForTechnology(snapshot.locale, technologyId);
        if (unlockResult) enqueueRandomEventResultDialog(unlockResult);
      }
    }

    for (const technologyId of cosmicRipTechs) {
      if (previous.cosmicRipTechs.includes(technologyId)) continue;
      const notice = cosmicRipTechnologyResearchedNotice(snapshot.locale, technologyId);
      notify(notice.message, {
        classification: notice.classification,
        type: notice.type,
        durationMs: notice.durationMs,
      });
      enqueueRandomEventResultDialog(
        cosmicRipResearchResultDialog(snapshot.locale, technologyId),
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
    enqueueRandomEventResultDialog,
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
  const stateInterstellarPanels = interstellarPaneItems(snapshot.locale, currentState);
  const interstellarPanels =
    battleNavigationLocked &&
    !stateInterstellarPanels.some((panel) => panel.id === "interstellar-colonise")
      ? [
          ...stateInterstellarPanels,
          {
            id: "interstellar-colonise",
            label: starshipText(snapshot.locale, "coloniseTabLabel"),
            sourceOptionId: "option5" as const,
            panelId: "panel-interstellar-starship",
          },
        ]
      : stateInterstellarPanels;
  const spaceMiningPanels = spaceMiningPaneItems(snapshot.locale, currentState);
  const cosmicRipPanels = cosmicRipPaneItems(snapshot.locale, currentState);
  const miaplaediaPanels = miaplaediaPaneItems(snapshot.locale);
  const settingsPanels = settingsPaneItems(snapshot.locale);
  const resourceGroups = resourcePaneGroups(snapshot.locale, currentState.run.unlockedResources);
  const resourcePanels = resourceGroups.flatMap((group) => group.items);
  const compoundGroups = compoundPaneGroups(
    snapshot.locale,
    currentState.run.economy.unlockedCompounds,
  );
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
  const orderedTabs = GAME_TABS.filter(
    (tab) => availableTabIds.has(tab.id) || (battleNavigationLocked && tab.id === "interstellar"),
  );
  const activeTabIsVisible = orderedTabs.some((tab) => tab.id === activeTab);
  const selectedTabId = battleNavigationLocked
    ? "interstellar"
    : activeTabIsVisible
      ? activeTab
      : (orderedTabs[0]?.id ?? "hydrogen");
  useLayoutEffect(() => {
    const selectedTab = document.getElementById(`tab-${selectedTabId}`);
    const navigation = selectedTab?.closest<HTMLElement>(".game-nav");
    if (!selectedTab || !navigation) return;

    const navigationRect = navigation.getBoundingClientRect();
    const visibleLeft = navigationRect.left + navigation.clientLeft;
    const visibleRight = visibleLeft + navigation.clientWidth;
    const selectedRect = selectedTab.getBoundingClientRect();
    if (selectedRect.left < visibleLeft) {
      navigation.scrollLeft += selectedRect.left - visibleLeft;
    } else if (selectedRect.right > visibleRight) {
      navigation.scrollLeft += selectedRect.right - visibleRight;
    }
  }, [selectedTabId]);
  useEffect(() => {
    if (selectedTabId !== activeTab && !battleNavigationLocked) {
      setActiveTab(selectedTabId);
      setVisitedTabs((current) =>
        current.has(selectedTabId) ? current : new Set([...current, selectedTabId]),
      );
    }
  }, [activeTab, battleNavigationLocked, selectedTabId]);
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
    if (previousAvailabilityKey.current === null) {
      const pendingIds = new Set(store.getState().run.navigationAttentionIds);
      const previouslyVisitedPageIds = [...nextIds].filter((id) => !pendingIds.has(id));
      if (previouslyVisitedPageIds.length > 0)
        store.dispatch({
          type: "navigation.attention.clear-many",
          pageIds: previouslyVisitedPageIds,
        });
      previousAvailabilityKey.current = availabilityKey;
      return;
    }
    const previousIds = new Set(previousAvailabilityKey.current.split("|").filter(Boolean));
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
  const selectedResourcePane = resourcePanels.some((panel) => panel.id === activeResourcePane)
    ? activeResourcePane
    : (resourcePanels[0]?.id ?? "resources-hydrogen");
  const selectedEnergyPane = energyPanels.some((panel) => panel.id === activeEnergyPane)
    ? activeEnergyPane
    : (energyPanels[0]?.id ?? "energy-summary");
  const selectedResearchPane = researchPanels.some((panel) => panel.id === activeResearchPane)
    ? activeResearchPane
    : (researchPanels[0]?.id ?? "research-tech-tree");
  const selectedInterstellarPane = battleNavigationLocked
    ? "interstellar-colonise"
    : interstellarPanels.some((panel) => panel.id === activeInterstellarPane)
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
  const hydrogenActions = useMemo(() => {
    if (selectedTabId !== "hydrogen" || selectedResourcePane !== "resources-hydrogen") return null;
    const state = store.getState();
    return {
      storagePurchase: selectHydrogenStoragePurchase(state),
      autobuyerPurchase: selectHydrogenAutobuyerPurchase(state),
      autobuyerBuyMax: selectAutobuyerBuyMax(state, "hydrogen", 1),
      collection: selectHydrogenCollection(state),
      sale: selectHydrogenSale(state, sellAmount),
    };
  }, [selectedResourcePane, selectedTabId, sellAmount, snapshot.revision, store]);
  const hydrogenFusionResearched =
    currentState.run.economy.researchedTechnologies.includes("hydrogenFusion");
  const hydrogenAutobuyerBulkReason = hydrogenActions?.autobuyerBuyMax.failure
    ? hydrogenActions.autobuyerBuyMax.failure.code === "insufficient-material"
      ? formatEconomyMessage(snapshot.locale, "buyMaxInsufficientMaterials", {
          required: formatNumber(
            snapshot.locale,
            hydrogenActions.autobuyerBuyMax.failure.required,
            2,
            snapshot.notation,
          ),
          good: t("hydrogen.title"),
          available: formatNumber(snapshot.locale, hydrogen.quantity, 2, snapshot.notation),
        })
      : economyLabel(snapshot.locale, "purchaseUnavailable")
    : "";
  const hydrogenAutobuyerBulkPreview = hydrogenActions
    ? formatEconomyMessage(snapshot.locale, "buyMaxPreview", {
        count: formatNumber(
          snapshot.locale,
          hydrogenActions.autobuyerBuyMax.count,
          0,
          snapshot.notation,
        ),
        costs: `${formatNumber(
          snapshot.locale,
          hydrogenActions.autobuyerBuyMax.totalCost,
          2,
          snapshot.notation,
        )} ${t("hydrogen.title")}`,
        result: `+${formatNumber(
          snapshot.locale,
          hydrogenActions.autobuyerBuyMax.count * snapshot.hydrogenAutobuyerRatePerSecond,
          2,
          snapshot.notation,
        )} ${t("hydrogen.title")} ${economyLabel(snapshot.locale, "perSecond")}`,
      })
    : "";
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
    settings: activeSettingsPane,
    miaplaedia: activeMiaplaediaPane,
  };
  const activateNavigationTab = (tabId: GameTabId) => {
    if (isBattleNavigationLocked()) return;
    const activePaneId = activePaneByTab[tabId];
    visitNavigationPages(activePaneId ? [tabId, activePaneId] : [tabId]);
    if (activePaneId) {
      setVisitedPanes((current) =>
        current.has(activePaneId) ? current : new Set(current).add(activePaneId),
      );
    }
    activateTab(tabId);
  };
  const openTutorialResources = () => {
    if (isBattleNavigationLocked()) return;
    activateTab("hydrogen");
    setActiveResourcePane("resources-hydrogen");
    activatePane("resources-hydrogen", false);
  };
  const openTutorialResearch = () => {
    if (isBattleNavigationLocked()) return;
    activateTab("research");
    setActiveResearchPane("research-science-buildings");
    activatePane("research-science-buildings", false);
  };
  const openTutorialTechTree = () => {
    if (isBattleNavigationLocked()) return;
    activateTab("research");
    setActiveResearchPane("research-tech-tree");
    activatePane("research-tech-tree", false);
  };
  const openTutorialVisualSettings = () => {
    if (isBattleNavigationLocked()) return;
    activateTab("settings");
    setActiveSettingsPane("settings-visual");
    activatePane("settings-visual", false);
  };
  const openTutorialAudioSettings = () => {
    if (isBattleNavigationLocked()) return;
    activateTab("settings");
    setActiveSettingsPane("settings-game-options");
    activatePane("settings-game-options", false);
  };
  const openTutorialMiaplaediaPane = (paneId: MiaplaediaPaneId) => {
    if (isBattleNavigationLocked()) return;
    activateTab("miaplaedia");
    setActiveMiaplaediaPane(paneId);
    activatePane(paneId, false);
  };
  const activateGalacticPane = (paneId: GalacticPaneId) => {
    if (isBattleNavigationLocked()) return;
    const notice =
      paneId === "galactic-market"
        ? galacticMarketLockdownEntryNotice(snapshot.locale, store.getState())
        : null;
    if (notice) {
      notify(notice.message, {
        classification: notice.classification,
        type: notice.type,
        durationMs: notice.durationMs,
      });
    }
    activatePane(paneId);
    setActiveGalacticPane(paneId);
  };

  return (
    <div
      className="game-frame"
      onClickCapture={(event) => {
        if (event.target instanceof Element && event.target.closest("summary")) {
          store.playUiCue("swipe");
        }
      }}
      onPointerDownCapture={(event) => {
        if (event.target instanceof HTMLSelectElement && !event.target.disabled) {
          store.playUiCue("swipe");
        }
      }}
      onKeyDownCapture={(event) => {
        if (
          event.target instanceof HTMLSelectElement &&
          !event.target.disabled &&
          (event.key === "Enter" ||
            event.key === " " ||
            (event.altKey && event.key === "ArrowDown"))
        ) {
          store.playUiCue("swipe");
        }
      }}
      data-theme={snapshot.themeId}
      data-reduced-motion={store.getState().settings.reducedMotion ? "true" : "false"}
      data-custom-pointer={currentState.settings.customPointerEnabled !== false ? "true" : "false"}
      data-weather-effects={
        currentState.settings.weatherEffectsEnabled === false
          ? "off"
          : currentWeatherForSystem(currentState.run.space)
      }
      data-engine-revision={snapshot.revision}
      data-tutorial-step={
        currentState.permanent.progressionTutorial.status === "active"
          ? (currentState.permanent.progressionTutorial.stepId ?? undefined)
          : undefined
      }
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
          <span className="run-name-label">{snapshot.pioneerName}</span>
        </div>
        <GlobalContextBar state={currentState} locale={snapshot.locale} />
      </header>
      <TopStatusBar state={currentState} store={store} locale={snapshot.locale} />
      <NewsTickerBar state={currentState} store={store} />
      <ProgressionTutorial
        state={currentState}
        locale={snapshot.locale}
        selectedTabId={selectedTabId}
        activePaneId={activePaneByTab[selectedTabId] ?? ""}
        onCommand={dispatchTutorialCommand}
        onOpenResources={openTutorialResources}
        onOpenResearch={openTutorialResearch}
        onOpenTechTree={openTutorialTechTree}
        onOpenVisualSettings={openTutorialVisualSettings}
        onOpenAudioSettings={openTutorialAudioSettings}
        onOpenMiaplaediaPane={openTutorialMiaplaediaPane}
      />
      <GameNotificationRegion
        themeId={snapshot.themeId}
        reducedMotion={currentState.settings.reducedMotion}
        customPointerEnabled={currentState.settings.customPointerEnabled !== false}
      />
      <RandomEventResultDialog
        entries={randomEventResultDialogs}
        onDismiss={(id) =>
          setRandomEventResultDialogs((current) => current.filter((entry) => entry.id !== id))
        }
      />
      {cosmicRipEndingVisible ? (
        <Suspense fallback={null}>
          <CosmicRipEndingCinematic
            locale={snapshot.locale}
            reducedMotion={currentState.settings.reducedMotion}
            onComplete={completeCosmicRipEnding}
          />
        </Suspense>
      ) : null}
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
          <p className="save-warning">{saveFailureText || saveLabel("leaveWarning")}</p>
          <div className="save-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                exitDialogRef.current?.close();
                setExitConfirmation(false);
                openSavingAndLoading();
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
          <span>{saveFailureText}</span>
          <button className="secondary-button" type="button" onClick={openSavingAndLoading}>
            {saveLabel("manage")}
          </button>
        </div>
      )}
      <div
        className="sr-only"
        data-testid="save-conflict-announcement"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {saveConflictAnnouncement}
      </div>
      {saveWritesPaused && (
        <div className="save-conflict-banner">
          <span>{saveFailureText}</span>
          <button
            className="secondary-button"
            type="button"
            onClick={() => window.location.reload()}
          >
            {saveLabel("reload")}
          </button>
          <button className="secondary-button" type="button" onClick={openSavingAndLoading}>
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
            const overview =
              tab.id === "cosmic-rip"
                ? cosmicRipText(snapshot.locale).headerHelp
                : "overviewKey" in tab
                  ? economyLabel(snapshot.locale, tab.overviewKey)
                  : undefined;
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
                disabled={battleNavigationLocked}
                role="tab"
                aria-disabled={battleNavigationLocked || undefined}
                title={overview}
                aria-description={overview}
                aria-selected={selected}
                aria-controls={`pane-${tab.id}`}
                aria-label={hasAttention ? [t(tab.key), ...attentionReasons].join(", ") : undefined}
                tabIndex={selected ? 0 : -1}
                onClick={() => {
                  activateNavigationTab(tab.id);
                }}
                onKeyDown={(event) => {
                  if (isBattleNavigationLocked()) {
                    event.preventDefault();
                    return;
                  }
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

      <div
        className={`main-layout${selectedTabId === "hydrogen" || selectedTabId === "compounds" ? " has-economy-rail" : ""}`}
      >
        <FreezeInactiveEconomyRail
          groups={resourceGroups}
          state={currentState}
          activePane={selectedResourcePane}
          hidden={selectedTabId !== "hydrogen"}
          navigationDisabled={battleNavigationLocked}
          panePrefix="resources"
          label={economyLabel(snapshot.locale, "resources")}
          testId="resource-rail"
          storageScope={`${slotId}:resource-rail`}
          onSelect={(paneId) => {
            if (isBattleNavigationLocked()) return;
            activateTab("hydrogen");
            activatePane(paneId, false);
            setActiveResourcePane(paneId);
          }}
        />
        <FreezeInactiveEconomyRail
          groups={compoundGroups}
          state={currentState}
          activePane={selectedCompoundPane}
          hidden={selectedTabId !== "compounds"}
          navigationDisabled={battleNavigationLocked}
          panePrefix="compounds"
          label={economyLabel(snapshot.locale, "compounds")}
          testId="compound-rail"
          className="compound-rail"
          storageScope={`${slotId}:compound-rail`}
          onSelect={(paneId) => {
            if (isBattleNavigationLocked()) return;
            activateTab("compounds");
            activatePane(paneId, false);
            setActiveCompoundPane(paneId);
          }}
        />

        <div className="pane-stack">
          {orderedTabs.map((tab) => {
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
                <FreezeInactiveTabContent
                  active={selectedTabId === tab.id}
                  render={() =>
                    (selectedTabId === tab.id || visitedTabs.has(tab.id)) && (
                      <Suspense fallback={<div className="pane-loading" aria-hidden="true" />}>
                        {tab.id === "hydrogen" ? (
                          <div
                            className={`tab-section-layout${selectedResourcePane !== "resources-hydrogen" ? " resource-page-selected" : ""}`}
                          >
                            <PaneNavigation
                              items={resourcePanels}
                              selectedId={selectedResourcePane}
                              label={t("nav.subsections")}
                              navigationDisabled={battleNavigationLocked}
                              storageScope={`${slotId}:resources`}
                              attentionIds={attentionIds}
                              attentionLabel={t("nav.new")}
                              onSelect={(id) => {
                                if (isBattleNavigationLocked()) return;
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
                                  <div className="economy-page-title-row">
                                    <h2 className="game-page-title">{t("hydrogen.title")}</h2>
                                    <InfoTooltip
                                      id="resource-hydrogen-overview-help"
                                      label={`${t("hydrogen.title")} — ${starshipText(snapshot.locale, "scanMoreInfoLabel")}`}
                                      content={economyGoodOverviewHelp(snapshot.locale, "hydrogen")}
                                      testId="resource-hydrogen-overview-help"
                                    />
                                  </div>
                                </div>
                              </div>

                              {hydrogenActions && (
                                <>
                                  <div className="hydrogen-hero">
                                    <div className="hydrogen-overview">
                                      <div className="atom-art" aria-hidden="true">
                                        <span className="orbit orbit-one" />
                                        <span className="orbit orbit-two" />
                                        <span className="atom-core">H</span>
                                        <span className="atom-spark">{"\u2726"}</span>
                                      </div>
                                      <div
                                        className="stock-readout"
                                        data-tutorial-target="hydrogen-storage"
                                      >
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
                                          value={Math.min(
                                            hydrogen.quantity,
                                            hydrogen.storageCapacity,
                                          )}
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
                                        <HydrogenAllocationBreakdownTooltip state={store.getState()} />
                                        {snapshot.hydrogenProductionBlockedByStorage && (
                                          <p
                                            className="red-disabled-text"
                                            data-testid="production-blocked-hydrogen"
                                          >
                                            {economyLabel(
                                              snapshot.locale,
                                              "automaticProductionBlockedByStorage",
                                            )}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <button
                                      className="primary-button collect-button"
                                      type="button"
                                      data-tutorial-target="collect-hydrogen"
                                      disabled={!hydrogenActions.collection.enabled}
                                      aria-describedby="collect-reason"
                                      onClick={() =>
                                        send({ type: "resource.collect", goodId: "hydrogen" })
                                      }
                                    >
                                      <span aria-hidden="true">+</span>
                                      {t("hydrogen.collect")}
                                    </button>
                                    {!hydrogenActions.collection.enabled && (
                                      <p className="control-reason" id="collect-reason">
                                        {localizedReason(
                                          snapshot.locale,
                                          hydrogenActions.collection.reasonKey,
                                          undefined,
                                          snapshot.notation,
                                        )}
                                      </p>
                                    )}

                                    <div className="hydrogen-sale-grid">
                                      <article className="sale-card hydrogen-sale-controls">
                                        <div className="card-copy">
                                          <h3>{t("hydrogen.sell")}</h3>
                                          <p className="economy-action-description">
                                            {economyActionHelp(
                                              snapshot.locale,
                                              "hydrogen",
                                              "sell",
                                              {
                                                fused: hydrogenFusionResearched,
                                              },
                                            )}
                                          </p>
                                          <p>
                                            {t("hydrogen.sale.preview")}:{" "}
                                            <strong>
                                              {formatCurrency(
                                                snapshot.locale,
                                                Number(displayCurrency(hydrogenActions.sale.cash)),
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
                                            <option value="100">
                                              {t("hydrogen.sell.hundred")}
                                            </option>
                                          </select>
                                          <button
                                            type="button"
                                            className="secondary-button"
                                            data-tutorial-target="sell-hydrogen"
                                            disabled={!hydrogenActions.sale.enabled}
                                            aria-describedby="sell-reason"
                                            onClick={() => {
                                              setFeedback("");
                                              dispatchEconomySale(
                                                store.getState(),
                                                store,
                                                "hydrogen",
                                                sellAmount,
                                                notify,
                                              );
                                            }}
                                          >
                                            {t("hydrogen.sell")}
                                          </button>
                                          {!hydrogenActions.sale.enabled && (
                                            <span className="control-reason" id="sell-reason">
                                              {localizedReason(
                                                snapshot.locale,
                                                hydrogenActions.sale.reasonKey,
                                                undefined,
                                                snapshot.notation,
                                              )}
                                            </span>
                                          )}
                                        </div>
                                        <HydrogenFusionDetails
                                          state={store.getState()}
                                          store={store}
                                        />
                                      </article>
                                    </div>
                                  </div>

                                  <article className="upgrade-card hydrogen-storage-card">
                                    <div className="card-icon storage-icon" aria-hidden="true">
                                      {"\u25c8"}
                                    </div>
                                    <div className="card-copy">
                                      <h3 id="hydrogen-storage-title">
                                        {t("hydrogen.storage.title")}
                                      </h3>
                                      <p
                                        className="economy-action-description"
                                        id="hydrogen-storage-help"
                                      >
                                        {economyActionHelp(snapshot.locale, "hydrogen", "storage")}
                                      </p>
                                      <span className="cost-line" id="hydrogen-storage-cost">
                                        {t("hydrogen.storage.price")}:{" "}
                                        <strong>
                                          {formatNumber(
                                            snapshot.locale,
                                            hydrogenActions.storagePurchase.cost,
                                            0,
                                            snapshot.notation,
                                          )}{" "}
                                          {"H\u2082"}
                                        </strong>{" "}
                                        <span aria-hidden="true">{"\u00b7"}</span>{" "}
                                        <span id="hydrogen-storage-capacity">
                                          <span className="sr-only">
                                            {economyLabel(snapshot.locale, "capacity")}: {" "}
                                          </span>
                                          {formatNumber(
                                            snapshot.locale,
                                            hydrogen.storageCapacity,
                                            0,
                                            snapshot.notation,
                                          )}
                                          {" \u2192 "}
                                          {formatNumber(
                                            snapshot.locale,
                                            hydrogenActions.storagePurchase.capacityAfterPurchase ??
                                              hydrogen.storageCapacity * HYDROGEN_STORAGE_MULTIPLIER,
                                            0,
                                            snapshot.notation,
                                          )}
                                        </span>
                                      </span>
                                    </div>
                                    <div className="card-controls">
                                      <button
                                        type="button"
                                        className="secondary-button"
                                        data-tutorial-target="hydrogen-storage-purchase"
                                        disabled={!hydrogenActions.storagePurchase.enabled}
                                        aria-describedby={[
                                          "hydrogen-storage-title",
                                          "hydrogen-storage-help",
                                          "hydrogen-storage-cost",
                                          "hydrogen-storage-capacity",
                                          "storage-reason",
                                        ].join(" ")}
                                        onClick={() =>
                                          dispatchEconomyStoragePurchase(store, "hydrogen", notify)
                                        }
                                      >
                                        {t("hydrogen.storage.purchase")}
                                      </button>
                                      <span className="control-reason" id="storage-reason">
                                        {hydrogenActions.storagePurchase.enabled
                                          ? ""
                                          : localizedReason(
                                              snapshot.locale,
                                              hydrogenActions.storagePurchase.reasonKey,
                                              hydrogenActions.storagePurchase.required ??
                                                Math.max(
                                                  0,
                                                  hydrogen.storageCapacity -
                                                    HYDROGEN_STORAGE_PRICE_OFFSET,
                                                ),
                                              snapshot.notation,
                                            )}
                                      </span>
                                    </div>
                                  </article>

                                  <details
                                    className="economy-details hydrogen-autobuyer-section"
                                    open={
                                      currentState.permanent.progressionTutorial.status ===
                                        "active" &&
                                      currentState.permanent.progressionTutorial.stepId ===
                                        "buyHydrogenAutobuyer"
                                    }
                                  >
                                    <summary>{economyLabel(snapshot.locale, "autobuyers")}</summary>
                                    <article className="upgrade-card autobuyer-card">
                                      <div className="card-icon compressor-icon" aria-hidden="true">
                                        {"\u2699"}
                                      </div>
                                      <div className="card-copy">
                                        <h3 id="hydrogen-autobuyer-title">
                                          {economyAutobuyerName(snapshot.locale, "hydrogen", 1)}
                                        </h3>
                                        <p
                                          className="economy-action-description"
                                          id="hydrogen-autobuyer-help"
                                        >
                                          {economyActionHelp(
                                            snapshot.locale,
                                            "hydrogen",
                                            "autobuyer",
                                            {
                                              tier: 1,
                                            },
                                          )}
                                        </p>
                                        <p className="economy-rate" id="hydrogen-autobuyer-rate">
                                          +
                                          {formatNumber(
                                            snapshot.locale,
                                            snapshot.hydrogenAutobuyerRatePerSecond,
                                            2,
                                            snapshot.notation,
                                          )}{" "}
                                          {economyLabel(snapshot.locale, "perSecond")}
                                        </p>
                                        <span className="cost-line" id="hydrogen-autobuyer-price">
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
                                              2,
                                              snapshot.notation,
                                            )}{" "}
                                            {"H\u2082"}
                                          </strong>
                                        </span>
                                        {store
                                          .getState()
                                          .permanent.acquiredPerks.includes("bulkPurchasing") && (
                                          <>
                                            <p
                                              className="economy-rate"
                                              id="hydrogen-autobuyer-buy-max-preview"
                                            >
                                              {hydrogenAutobuyerBulkPreview}
                                            </p>
                                            <span
                                              className="control-reason"
                                              id="autobuyer-buy-max-reason"
                                            >
                                              {hydrogenAutobuyerBulkReason}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                      <div className="card-controls">
                                        <button
                                          type="button"
                                          className="secondary-button"
                                          data-tutorial-target="hydrogen-autobuyer-purchase"
                                          disabled={!hydrogenActions.autobuyerPurchase.enabled}
                                          aria-describedby={[
                                            "hydrogen-autobuyer-title",
                                            "hydrogen-autobuyer-help",
                                            "hydrogen-autobuyer-rate",
                                            "hydrogen-autobuyer-price",
                                            "autobuyer-reason",
                                          ].join(" ")}
                                          onClick={() =>
                                            dispatchEconomyAutobuyerPurchase(
                                              store,
                                              { type: "hydrogen.autobuyer.purchase" },
                                              "hydrogen",
                                              1,
                                              notify,
                                            )
                                          }
                                        >
                                          {t("hydrogen.autobuyer.purchase")}
                                        </button>
                                        {store
                                          .getState()
                                          .permanent.acquiredPerks.includes("bulkPurchasing") && (
                                          <>
                                            <button
                                              type="button"
                                              className="text-button"
                                              disabled={!hydrogenActions.autobuyerBuyMax.enabled}
                                              aria-describedby={[
                                                "hydrogen-autobuyer-title",
                                                "hydrogen-autobuyer-help",
                                                "hydrogen-autobuyer-rate",
                                                "hydrogen-autobuyer-price",
                                                "hydrogen-autobuyer-buy-max-preview",
                                                "autobuyer-buy-max-reason",
                                              ].join(" ")}
                                              onClick={() =>
                                                dispatchEconomyAutobuyerPurchase(
                                                  store,
                                                  {
                                                    type: "economy.autobuyer.buyMax",
                                                    goodId: "hydrogen",
                                                    tier: 1,
                                                  },
                                                  "hydrogen",
                                                  1,
                                                  notify,
                                                )
                                              }
                                            >
                                              {economyLabel(snapshot.locale, "buyMax")}
                                            </button>
                                          </>
                                        )}
                                        <span className="control-reason" id="autobuyer-reason">
                                          {hydrogenActions.autobuyerPurchase.enabled
                                            ? ""
                                            : localizedReason(
                                                snapshot.locale,
                                                hydrogenActions.autobuyerPurchase.reasonKey,
                                                hydrogenActions.autobuyerPurchase.required ??
                                                  buyerPrice,
                                                snapshot.notation,
                                              )}
                                        </span>
                                        {buyerCount > 0 && (
                                          <button
                                            type="button"
                                            className="text-button"
                                            aria-label={formatEconomyMessage(
                                              snapshot.locale,
                                              "autobuyerToggleLabel",
                                              {
                                                good: economyGoodName(snapshot.locale, "hydrogen"),
                                                tier: "1",
                                              },
                                            )}
                                            aria-pressed={snapshot.hydrogenAutobuyerEnabled}
                                            aria-describedby={[
                                              "hydrogen-autobuyer-title",
                                              "hydrogen-autobuyer-help",
                                              "hydrogen-autobuyer-rate",
                                              "hydrogen-autobuyer-price",
                                            ].join(" ")}
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
                                    <HydrogenAutobuyerTiers
                                      state={store.getState()}
                                      store={store}
                                    />
                                  </details>
                                  <HydrogenAllocationControls
                                    state={store.getState()}
                                    store={store}
                                  />
                                  <output className="live-feedback" aria-live="polite">
                                    {feedback}
                                  </output>
                                </>
                              )}
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
                          <div className="tab-section-layout energy-page-selected">
                            <PaneNavigation
                              items={energyPanels}
                              selectedId={selectedEnergyPane}
                              label={t("nav.subsections")}
                              navigationDisabled={battleNavigationLocked}
                              attentionIds={attentionIds}
                              attentionLabel={t("nav.new")}
                              onSelect={(id) => {
                                if (isBattleNavigationLocked()) return;
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
                          <div className="tab-section-layout research-page-selected">
                            <PaneNavigation
                              items={researchPanels}
                              selectedId={selectedResearchPane}
                              label={t("nav.subsections")}
                              navigationDisabled={battleNavigationLocked}
                              attentionIds={attentionIds}
                              attentionLabel={t("nav.new")}
                              onSelect={(id) => {
                                if (isBattleNavigationLocked()) return;
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
                          <div className="tab-section-layout compound-page-selected">
                            <PaneNavigation
                              items={compoundPanels}
                              selectedId={selectedCompoundPane}
                              label={t("nav.subsections")}
                              navigationDisabled={battleNavigationLocked}
                              storageScope={`${slotId}:compounds`}
                              attentionIds={attentionIds}
                              attentionLabel={t("nav.new")}
                              onSelect={(id) => {
                                if (isBattleNavigationLocked()) return;
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
                          galacticTabUnlocked(store.getState()) ? (
                          <div className="tab-section-layout">
                            <PaneNavigation
                              items={galacticPanels}
                              selectedId={selectedGalacticPane}
                              label={t("nav.subsections")}
                              navigationDisabled={battleNavigationLocked}
                              attentionIds={attentionIds}
                              attentionLabel={t("nav.new")}
                              attentionLabelsById={liveAttentionLabels}
                              onSelect={(id) => activateGalacticPane(id as GalacticPaneId)}
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
                                    <GalacticCasinoPane
                                      state={store.getState()}
                                      store={store}
                                      pendingVoidSeerPresentation={pendingVoidSeerPresentation}
                                    />
                                  ) : null
                                ) : null}
                              </section>
                            ))}
                          </div>
                        ) : tab.id === "interstellar" &&
                          (battleNavigationLocked ||
                            store
                              .getState()
                              .run.economy.researchedTechnologies.includes("stellarCartography")) ? (
                          <div className="tab-section-layout">
                            <PaneNavigation
                              items={interstellarPanels}
                              selectedId={selectedInterstellarPane}
                              label={t("nav.subsections")}
                              navigationDisabled={battleNavigationLocked}
                              attentionIds={attentionIds}
                              attentionLabel={t("nav.new")}
                              onSelect={(id) => {
                                if (isBattleNavigationLocked()) return;
                                activatePane(id);
                                setActiveInterstellarPane(id as InterstellarPaneId);
                              }}
                            />
                            {(selectedInterstellarPane === "interstellar-star-map" ||
                              selectedInterstellarPane === "interstellar-star-data") && (
                              <StarMapPane
                                state={store.getState()}
                                store={store}
                                view={
                                  selectedInterstellarPane === "interstellar-star-data"
                                    ? "data"
                                    : "map"
                                }
                                onShowOnMap={() => {
                                  if (isBattleNavigationLocked()) return;
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
                              {(battleNavigationLocked ||
                                visitedPanes.has("interstellar-starship") ||
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
                            .run.economy.researchedTechnologies.includes(
                              "atmosphericTelescopes",
                            ) ? (
                          <div className="tab-section-layout">
                            <PaneNavigation
                              items={spaceMiningPanels}
                              selectedId={selectedSpaceMiningPane}
                              label={t("nav.subsections")}
                              navigationDisabled={battleNavigationLocked}
                              attentionIds={attentionIds}
                              attentionLabel={t("nav.new")}
                              onSelect={(id) => {
                                if (isBattleNavigationLocked()) return;
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
                        ) : tab.id === "cosmic-rip" &&
                          store.getState().permanent.cosmicRip.unlocked ? (
                          <div className="tab-section-layout">
                            <PaneNavigation
                              items={cosmicRipPanels}
                              selectedId={selectedCosmicRipPane}
                              label={t("nav.subsections")}
                              navigationDisabled={battleNavigationLocked}
                              attentionIds={attentionIds}
                              attentionLabel={t("nav.new")}
                              onSelect={(id) => {
                                if (isBattleNavigationLocked()) return;
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
                              navigationDisabled={battleNavigationLocked}
                              attentionIds={attentionIds}
                              attentionLabel={t("nav.new")}
                              onSelect={(id) => {
                                if (isBattleNavigationLocked()) return;
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
                            activePane={activeSettingsPane}
                            navigationDisabled={battleNavigationLocked}
                            onSelectPane={(paneId) => {
                              if (!isBattleNavigationLocked()) setActiveSettingsPane(paneId);
                            }}
                            onPaneVisit={activatePane}
                            onNavigateToPane={(paneId) => {
                              if (isBattleNavigationLocked()) return;
                              activatePane(paneId, false);
                              if (paneId.startsWith("settings-")) {
                                setActiveSettingsPane(paneId as SettingsPaneId);
                                clearAttention("settings");
                                activateTab("settings");
                              } else if (paneId.startsWith("resources-")) {
                                clearAttention("hydrogen");
                                setActiveResourcePane(paneId);
                                activateTab("hydrogen");
                              } else if (paneId.startsWith("energy-")) {
                                clearAttention("energy");
                                setActiveEnergyPane(paneId);
                                activateTab("energy");
                              } else if (paneId.startsWith("research-")) {
                                clearAttention("research");
                                setActiveResearchPane(paneId);
                                activateTab("research");
                              } else if (paneId.startsWith("interstellar-")) {
                                clearAttention("interstellar");
                                setActiveInterstellarPane(paneId as InterstellarPaneId);
                                activateTab("interstellar");
                              } else if (paneId.startsWith("galactic-")) {
                                clearAttention("galaxy");
                                setActiveGalacticPane(paneId as GalacticPaneId);
                                activateTab("galaxy");
                              } else if (paneId.startsWith("cosmic-rip-")) {
                                clearAttention("cosmic-rip");
                                setActiveCosmicRipPane(paneId as CosmicRipPaneId);
                                activateTab("cosmic-rip");
                              } else if (paneId.startsWith("compounds-")) {
                                clearAttention("compounds");
                                setActiveCompoundPane(paneId);
                                activateTab("compounds");
                              } else if (paneId.startsWith("space-mining-")) {
                                clearAttention("space-mining");
                                setActiveSpaceMiningPane(paneId as SpaceMiningPaneId);
                                activateTab("space-mining");
                              }
                            }}
                            savePersistent={savePersistent}
                            saveStatusAnnouncementEnabled={!saveWritesPaused}
                            saveStatus={
                              saveFailureText ||
                              saveStatus ||
                              (savePersistent ? saveLabel("saved") : saveLabel("unsaved"))
                            }
                            autoSaveEnabled={autoSaveEnabled}
                            autoSaveInterval={autoSaveInterval}
                            onAutoSaveEnabledChange={(enabled) => {
                              setAutoSaveEnabled(enabled);
                              repository?.writePreferences({ autoSaveEnabled: enabled });
                              if (!enabled) {
                                notify(saveText(snapshot.locale, "autoSaveDisabledWarning"), {
                                  classification: "loadSave",
                                  type: "error",
                                  durationMs: 5000,
                                });
                              }
                            }}
                            onAutoSaveIntervalChange={(interval) => {
                              setAutoSaveInterval(interval);
                              repository?.writePreferences({ autoSaveIntervalSeconds: interval });
                            }}
                            onSoundEffectsDisable={playSoundEffectsDisableCue}
                            onBackgroundAudioToggle={recordTutorialBackgroundAudioToggle}
                            onThemeSelectorInteraction={recordTutorialThemeSelectorInteraction}
                            onSaveNow={() => persistCurrent()}
                            saveManagerProps={{
                              locale: snapshot.locale,
                              repository,
                              slots: repository?.list() ?? [],
                              activeSlotId: slotId,
                              revision: saveRevision,
                              state: currentState,
                              readOnlyReasonCode: saveFailure,
                              lockHeld: (id) =>
                                id === slotId && savePersistent && !saveWritesPaused,
                              acquireLock: acquireSlotLock,
                              onRename: persistRename,
                              onSaveAsNew: saveRunAsNew,
                              onSwitchTo: switchToPioneerSelection,
                              onReplaceActive: (envelope) => {
                                saveRevisionRef.current = envelope.revision;
                                setSaveRevision(envelope.revision);
                                setSaveWritesPaused(false);
                                offlineGainsNoticePending.current = true;
                                onReplaceActive(envelope);
                              },
                              onDeleted: onDeleteActive,
                            }}
                          />
                        ) : ECONOMY_TAB_IDS.has(tab.id) ? (
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
                    )
                  }
                />
              </section>
            );
          })}
        </div>
      </div>
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
          open={debugScenarioOpen}
          testLabOpen={debugLabOpen}
          onClose={() => setDebugScenarioOpen(false)}
          onTestLabClose={() => setDebugLabOpen(false)}
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
