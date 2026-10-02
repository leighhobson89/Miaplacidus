import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type FormEvent,
} from "react";
import type { LocaleId } from "../content/ids";
import { LOCALE_IDS, autobuyerUpgradeId } from "../content/ids";
import {
  HYDROGEN_STORAGE_MULTIPLIER,
  HYDROGEN_STORAGE_PRICE_OFFSET,
  hydrogenAutobuyerPrice,
  hydrogenTickPlan,
} from "../content/hydrogen";
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
import { GameErrorBoundary } from "../ui/GameErrorBoundary";
import { useGameSnapshot } from "../ui/useGameSnapshot";
import { BUILD_INFO } from "./buildInfo";

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
}

class TestClock {
  private current = 0;

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

function formatNumber(locale: LocaleId, value: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
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

function snapshotBuyerCount(state: GameState): number {
  return state.run.upgrades[autobuyerUpgradeId("hydrogen", 1)] ?? 0;
}

function localizedReason(locale: LocaleId, key: string | undefined, required?: number): string {
  if (key === "ui.hydrogen.inventory-full") return translate(locale, "reason.inventory-full");
  if (key === "ui.hydrogen.no-stock") return translate(locale, "reason.no-stock");
  if (key === "ui.hydrogen.autobuyer-locked") return translate(locale, "reason.autobuyer-locked");
  if (key === "engine.purchase.insufficient-material") {
    return `${translate(locale, "reason.insufficient")} ${formatNumber(locale, required ?? 0)} H₂.`;
  }
  return key ?? "";
}

export function App() {
  const initial = useState(bootOptions)[0];
  const [locale, setLocale] = useState<LocaleId>(initial.locale);
  const [pioneerName, setPioneerName] = useState("Pioneer");
  const [store, setStore] = useState<GameStore | null>(null);
  const testClock = useMemo(() => new TestClock(), []);
  const frameMetrics = useMemo<FrameMetrics>(
    () => ({ frames: 0, firstFrameAt: null, lastFrameAt: null }),
    [],
  );
  useEffect(() => {
    document.documentElement.lang = store?.getState().settings.locale ?? locale;
  }, [locale, store]);

  const startRun = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = pioneerName.trim();
    if (!name) return;
    setStore(
      createGameStore(createInitialGameState({ pioneerName: name, locale, seed: initial.seed }), {
        clock: { now: () => (BUILD_INFO.isTest ? testClock.now() : performance.now()) },
      }),
    );
  };

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
        {store ? (
          <GameSession
            store={store}
            testClock={testClock}
            seed={initial.seed}
            frameMetrics={frameMetrics}
          />
        ) : (
          <section className="welcome-panel" aria-labelledby="welcome-title">
            <div className="wordmark" aria-hidden="true">
              ✦
            </div>
            <p className="eyebrow">{t("app.tagline")}</p>
            <h1 id="welcome-title">{t("app.brand")}</h1>
            <form className="welcome-form" onSubmit={startRun}>
              <label htmlFor="pioneer-name">{t("app.pioneer")}</label>
              <input
                id="pioneer-name"
                maxLength={32}
                required
                value={pioneerName}
                onChange={(event) => setPioneerName(event.currentTarget.value)}
              />
              <label htmlFor="start-locale">{t("app.locale")}</label>
              <select
                id="start-locale"
                value={locale}
                onChange={(event) => setLocale(event.currentTarget.value as LocaleId)}
              >
                {LOCALE_IDS.map((id) => (
                  <option key={id} value={id}>
                    {id.toUpperCase()}
                  </option>
                ))}
              </select>
              <button className="primary-button start-button" type="submit">
                {t("app.start")}
              </button>
            </form>
          </section>
        )}
      </main>
    </GameErrorBoundary>
  );
}

function GameSession({ store, testClock, seed, frameMetrics }: GameSessionProps) {
  const snapshot = useGameSnapshot(store);
  const [activeTab, setActiveTab] = useState("hydrogen");
  const [sellAmount, setSellAmount] = useState<number | "all">("all");
  const [feedback, setFeedback] = useState("");
  const [DebugTools, setDebugTools] = useState<ComponentType<{
    store: GameStore;
    seed: number;
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
  const advanceTestClock = useCallback(
    (milliseconds: number) => {
      if (!Number.isFinite(milliseconds) || milliseconds <= 0) return;
      const previous = store.getState().run.clock.wallNowMs ?? 0;
      const next = BUILD_INFO.isTest
        ? testClock.advance(milliseconds)
        : Math.max(performance.now(), previous + milliseconds);
      if (BUILD_INFO.isDevelopment && !BUILD_INFO.isTest) testClock.set(next);
      const state = store.getState();
      const tickPlan = hydrogenTickPlan(
        snapshotBuyerCount(state),
        state.run.hydrogenAutobuyerEnabled,
      );
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
    let frame = 0;
    const tick = (timestamp: number) => {
      frameMetrics.frames += 1;
      frameMetrics.firstFrameAt ??= timestamp;
      frameMetrics.lastFrameAt = timestamp;
      const state = store.getState();
      const tickPlan = hydrogenTickPlan(
        snapshotBuyerCount(state),
        state.run.hydrogenAutobuyerEnabled,
      );
      store.dispatch({
        type: "clock.advance",
        input: {
          wallNowMs: BUILD_INFO.isTest ? testClock.now() : performance.now(),
          foreground: document.visibilityState === "visible",
        },
        tickPlan,
        offlineTickPlan: tickPlan,
      });
      store.publishIfDue();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [store, testClock, frameMetrics]);

  useEffect(() => {
    if (!import.meta.env.DEV && MIAPLACIDUS_BUILD_MODE !== "test") return;
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
            <strong>{formatMoney(snapshot.locale, snapshot.cash)}</strong>
          </div>
          <div>
            <span className="balance-label">{t("header.research")}</span>
            <strong>{formatNumber(snapshot.locale, snapshot.researchPoints)}</strong>
          </div>
        </div>
      </header>

      <nav aria-label={t("nav.label")}>
        <div className="game-nav" aria-label={t("nav.label")} role="tablist">
          {GAME_TABS.map((tab, index) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                className={`nav-tab${selected ? " is-selected" : ""}${index > 0 ? " is-locked" : ""}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`pane-${tab.id}`}
                aria-disabled={index > 0}
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
                {index > 0 && (
                  <span className="lock-glyph" aria-hidden="true">
                    ·
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="main-layout">
        <aside className="resource-rail" aria-label={t("tab.hydrogen")}>
          <div className="rail-heading">{t("tab.hydrogen")}</div>
          <button
            className="resource-item is-current"
            type="button"
            onClick={() => setActiveTab("hydrogen")}
          >
            <span className="element-tile" aria-hidden="true">
              <small>1</small>H
            </span>
            <span className="resource-item-copy">
              <strong>{t("hydrogen.title")}</strong>
              <small>
                {formatNumber(snapshot.locale, displayQuantity(hydrogen.quantity))} /{" "}
                {formatNumber(snapshot.locale, hydrogen.storageCapacity)}
              </small>
            </span>
            <span className="resource-rate">
              +{formatNumber(snapshot.locale, snapshot.hydrogenProductionPerSecond, 2)}/s
            </span>
          </button>
          <div className="rail-note">
            <span>01</span>
            <span>{t("pane.locked")}</span>
            <span aria-hidden="true">···</span>
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
                  </div>

                  <div className="hydrogen-hero">
                    <div className="atom-art" aria-hidden="true">
                      <span className="orbit orbit-one" />
                      <span className="orbit orbit-two" />
                      <span className="atom-core">H</span>
                      <span className="atom-spark">✦</span>
                    </div>
                    <div className="stock-readout">
                      <span className="eyebrow">{t("hydrogen.quantity")}</span>
                      <strong data-testid="hydrogen-quantity">
                        {formatNumber(snapshot.locale, hydrogen.quantity, 2)} <small>H₂</small>
                      </strong>
                      <span className="capacity-line">
                        {t("hydrogen.capacity")}{" "}
                        <b data-testid="hydrogen-capacity">
                          {formatNumber(snapshot.locale, hydrogen.storageCapacity)}
                        </b>
                      </span>
                      <meter
                        className="capacity-track"
                        aria-label={t("hydrogen.capacity")}
                        min={0}
                        max={hydrogen.storageCapacity}
                        value={Math.min(hydrogen.quantity, hydrogen.storageCapacity)}
                      >
                        {formatNumber(snapshot.locale, hydrogen.quantity)} /{" "}
                        {formatNumber(snapshot.locale, hydrogen.storageCapacity)}
                      </meter>
                    </div>
                    <div className="rate-readout">
                      <span className="eyebrow">{t("hydrogen.production")}</span>
                      <strong data-testid="hydrogen-rate">
                        +{formatNumber(snapshot.locale, snapshot.hydrogenProductionPerSecond, 2)}
                        <small>H₂/s</small>
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
                    <span aria-hidden="true">＋</span>
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
                        ↗
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
                        ▤
                      </div>
                      <div className="card-copy">
                        <h3>{t("hydrogen.storage.title")}</h3>
                        <p>{t("hydrogen.storage.description")}</p>
                        <span className="cost-line">
                          {t("hydrogen.storage.price")}:{" "}
                          <strong>{formatNumber(snapshot.locale, storagePurchase.cost)} H₂</strong>{" "}
                          <span aria-hidden="true">·</span>{" "}
                          {formatNumber(snapshot.locale, hydrogen.storageCapacity)} →{" "}
                          {formatNumber(
                            snapshot.locale,
                            storagePurchase.capacityAfterPurchase ??
                              hydrogen.storageCapacity * HYDROGEN_STORAGE_MULTIPLIER,
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
                        ⌁
                      </div>
                      <div className="card-copy">
                        <h3>{t("hydrogen.autobuyer.title")}</h3>
                        <p>{t("hydrogen.autobuyer.description")}</p>
                        <span className="cost-line">
                          {t("hydrogen.autobuyer.owned")}:{" "}
                          <strong data-testid="hydrogen-autobuyer-count">
                            {formatNumber(snapshot.locale, buyerCount)}
                          </strong>
                          <span aria-hidden="true"> · </span>
                          {t("hydrogen.autobuyer.price")}:{" "}
                          <strong>{formatNumber(snapshot.locale, buyerPrice)} H₂</strong>
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
                </>
              ) : (
                <div className="locked-panel">
                  <span className="locked-mark" aria-hidden="true">
                    ⌑
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
      {DebugTools && (
        <DebugTools
          store={store}
          seed={seed}
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
