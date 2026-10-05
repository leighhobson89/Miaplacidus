import { useEffect, useState } from "react";
import { LOCALE_IDS } from "../content/ids";
import { CURRENCY_CODES, CURRENCY_IDS, CURRENCY_SYMBOLS } from "../content/currency";
import { THEME_IDS, type ThemeId } from "../content/themes";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { settingsLabel, settingsText, themeName } from "../i18n/settingsMessages";
import { saveText } from "../i18n/saveMessages";
import { AchievementsPane } from "./AchievementsPane";
import { MetaJournalPane } from "./MetaJournalPane";
import { SettingsStatisticsPane } from "./SettingsStatisticsPane";
import { PaneNavigation } from "./PaneNavigation";
import {
  SETTINGS_LIBRARY_PANE_IDS,
  settingsPaneItems,
  type SettingsPaneId,
} from "./presentationNavigation";

const localeNames = {
  en: "English",
  es: "Español",
  pt: "Português",
  de: "Deutsch",
  it: "Italiano",
  fr: "Français",
} as const;

interface SettingsPaneProps {
  readonly state: GameState;
  readonly store: GameStore;
  readonly attentionIds: ReadonlySet<string>;
  readonly attentionLabel: string;
  readonly onPaneVisit: (id: string) => void;
  readonly saveStatus: string;
  readonly savePersistent: boolean;
  readonly autoSaveEnabled: boolean;
  readonly autoSaveInterval: 300 | 900 | 1800 | 3600;
  readonly onAutoSaveEnabledChange: (enabled: boolean) => void;
  readonly onAutoSaveIntervalChange: (interval: 300 | 900 | 1800 | 3600) => void;
  readonly onSaveNow: () => void;
  readonly onOpenSaveManager: () => void;
}

export function SettingsPane({
  state,
  store,
  attentionIds,
  attentionLabel,
  onPaneVisit,
  saveStatus,
  savePersistent,
  autoSaveEnabled,
  autoSaveInterval,
  onAutoSaveEnabledChange,
  onAutoSaveIntervalChange,
  onSaveNow,
  onOpenSaveManager,
}: SettingsPaneProps) {
  const [activePane, setActivePane] = useState<SettingsPaneId>("settings-visual");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenFailed, setFullscreenFailed] = useState(false);
  const locale = state.settings.locale;
  const save = (key: Parameters<typeof saveText>[1]) => saveText(locale, key);
  const percentage = (value: number) =>
    new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }).format(value);
  const panes = settingsPaneItems(locale);
  const fullscreenSupported =
    typeof document !== "undefined" &&
    typeof document.documentElement.requestFullscreen === "function" &&
    typeof document.exitFullscreen === "function";

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      setFullscreenFailed(false);
    };
    document.addEventListener("fullscreenchange", syncFullscreenState);
    syncFullscreenState();
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  async function toggleFullscreen(): Promise<void> {
    setFullscreenFailed(false);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setFullscreenFailed(true);
    }
  }

  return (
    <section
      className="feature-pane settings-pane"
      aria-labelledby="settings-title"
      data-testid="settings-pane"
    >
      <div className="pane-heading">
        <div>
          <p className="eyebrow">{settingsLabel(locale, "profile")}</p>
          <h2 id="settings-title">{settingsText(locale, "title")}</h2>
          <p className="pane-intro">{settingsText(locale, "description")}</p>
        </div>
      </div>
      <PaneNavigation
        items={panes}
        selectedId={activePane}
        label={settingsText(locale, "sections")}
        attentionIds={attentionIds}
        attentionLabel={attentionLabel}
        onSelect={(id) => {
          onPaneVisit(id);
          setActivePane(id as SettingsPaneId);
        }}
      />
      <section
        className="subpane-panel"
        id="panel-settings-visual"
        role="tabpanel"
        aria-labelledby="tab-settings-visual"
        tabIndex={0}
        hidden={activePane !== "settings-visual"}
      >
        <div className="settings-controls">
          <label className="settings-control" htmlFor="settings-theme">
            <span>{settingsText(locale, "theme")}</span>
            <select
              id="settings-theme"
              data-testid="theme-selector"
              aria-label={settingsText(locale, "theme")}
              value={state.settings.themeId}
              onChange={(event) =>
                store.dispatch({
                  type: "settings.update",
                  patch: { themeId: event.currentTarget.value as ThemeId },
                })
              }
            >
              {THEME_IDS.map((id) => (
                <option key={id} value={id}>
                  {themeName(locale, id)}
                </option>
              ))}
            </select>
          </label>
          <label className="settings-control" htmlFor="settings-currency">
            <span>{settingsText(locale, "currency")}</span>
            <select
              id="settings-currency"
              value={state.settings.currencyId ?? "usd"}
              onChange={(event) =>
                store.dispatch({
                  type: "settings.update",
                  patch: {
                    currencyId: event.currentTarget.value as NonNullable<
                      GameState["settings"]["currencyId"]
                    >,
                  },
                })
              }
            >
              {CURRENCY_IDS.map((id) => (
                <option key={id} value={id}>
                  {CURRENCY_SYMBOLS[id]} ({CURRENCY_CODES[id]})
                </option>
              ))}
            </select>
          </label>
          <label className="settings-control" htmlFor="settings-notation">
            <span>{settingsText(locale, "notation")}</span>
            <select
              id="settings-notation"
              aria-label={settingsText(locale, "notation")}
              value={state.settings.notation}
              onChange={(event) =>
                store.dispatch({
                  type: "settings.update",
                  patch: {
                    notation: event.currentTarget.value as GameState["settings"]["notation"],
                  },
                })
              }
            >
              <option value="standard">{settingsText(locale, "standard")}</option>
              <option value="scientific">{settingsText(locale, "scientific")}</option>
            </select>
          </label>
          <label className="settings-toggle" htmlFor="settings-motion">
            <input
              id="settings-motion"
              type="checkbox"
              checked={state.settings.reducedMotion}
              onChange={(event) =>
                store.dispatch({
                  type: "settings.update",
                  patch: { reducedMotion: event.currentTarget.checked },
                })
              }
            />
            <span>{settingsText(locale, "reducedMotion")}</span>
          </label>
          <label className="settings-toggle" htmlFor="settings-notifications">
            <input
              id="settings-notifications"
              type="checkbox"
              checked={state.settings.notificationsEnabled !== false}
              onChange={(event) =>
                store.dispatch({
                  type: "settings.update",
                  patch: { notificationsEnabled: event.currentTarget.checked },
                })
              }
            />
            <span>{settingsText(locale, "notifications")}</span>
          </label>
          <label className="settings-toggle" htmlFor="settings-custom-pointer">
            <input
              id="settings-custom-pointer"
              type="checkbox"
              checked={state.settings.customPointerEnabled !== false}
              onChange={(event) =>
                store.dispatch({
                  type: "settings.update",
                  patch: { customPointerEnabled: event.currentTarget.checked },
                })
              }
            />
            <span>{settingsText(locale, "customPointer")}</span>
          </label>
          <label className="settings-toggle" htmlFor="settings-pointer-trail">
            <input
              id="settings-pointer-trail"
              type="checkbox"
              checked={state.settings.pointerTrailEnabled === true}
              onChange={(event) =>
                store.dispatch({
                  type: "settings.update",
                  patch: { pointerTrailEnabled: event.currentTarget.checked },
                })
              }
            />
            <span>{settingsText(locale, "pointerTrail")}</span>
          </label>
          <label className="settings-toggle" htmlFor="settings-weather-effects">
            <input
              id="settings-weather-effects"
              type="checkbox"
              checked={state.settings.weatherEffectsEnabled !== false}
              onChange={(event) =>
                store.dispatch({
                  type: "settings.update",
                  patch: { weatherEffectsEnabled: event.currentTarget.checked },
                })
              }
            />
            <span>{settingsText(locale, "weatherEffects")}</span>
          </label>
        </div>
      </section>
      <section
        className="subpane-panel"
        id="panel-settings-game-options"
        role="tabpanel"
        aria-labelledby="tab-settings-game-options"
        tabIndex={0}
        hidden={activePane !== "settings-game-options"}
      >
        <div className="settings-controls">
          <div className="settings-control">
            <span>{settingsText(locale, "fullscreen")}</span>
            <button
              className="secondary-button"
              type="button"
              disabled={!fullscreenSupported}
              onClick={() => void toggleFullscreen()}
            >
              {settingsText(locale, isFullscreen ? "fullscreenExit" : "fullscreenEnter")}
            </button>
            {!fullscreenSupported && <small>{settingsText(locale, "fullscreenUnavailable")}</small>}
            {fullscreenFailed && (
              <output aria-live="polite">{settingsText(locale, "fullscreenFailed")}</output>
            )}
          </div>
          <label className="settings-control" htmlFor="settings-language">
            <span>{settingsLabel(locale, "language")}</span>
            <select
              id="settings-language"
              aria-label={settingsLabel(locale, "language")}
              value={locale}
              onChange={(event) =>
                store.dispatch({
                  type: "settings.update",
                  patch: { locale: event.currentTarget.value as GameState["settings"]["locale"] },
                })
              }
            >
              {LOCALE_IDS.map((id) => (
                <option key={id} value={id}>
                  {localeNames[id]}
                </option>
              ))}
            </select>
          </label>
          <label className="settings-toggle" htmlFor="settings-background-audio">
            <input
              id="settings-background-audio"
              type="checkbox"
              checked={state.settings.backgroundAudioEnabled ?? state.settings.soundEnabled}
              onChange={(event) =>
                store.dispatch({
                  type: "settings.update",
                  patch: { backgroundAudioEnabled: event.currentTarget.checked },
                })
              }
            />
            <span>{settingsText(locale, "backgroundAudio")}</span>
          </label>
          <label
            className="settings-control settings-range-control"
            htmlFor="settings-background-volume"
          >
            <span>{settingsText(locale, "backgroundAudioVolume")}</span>
            <input
              id="settings-background-volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={state.settings.backgroundAudioVolume ?? 0.5}
              aria-valuetext={percentage(state.settings.backgroundAudioVolume ?? 0.5)}
              onChange={(event) =>
                store.dispatch({
                  type: "settings.update",
                  patch: { backgroundAudioVolume: Number(event.currentTarget.value) },
                })
              }
            />
            <output>{percentage(state.settings.backgroundAudioVolume ?? 0.5)}</output>
          </label>
          <label className="settings-toggle" htmlFor="settings-sound-effects">
            <input
              id="settings-sound-effects"
              type="checkbox"
              checked={state.settings.soundEffectsEnabled ?? state.settings.soundEnabled}
              onChange={(event) =>
                store.dispatch({
                  type: "settings.update",
                  patch: { soundEffectsEnabled: event.currentTarget.checked },
                })
              }
            />
            <span>{settingsText(locale, "soundEffects")}</span>
          </label>
          <label
            className="settings-control settings-range-control"
            htmlFor="settings-sound-effects-volume"
          >
            <span>{settingsText(locale, "soundEffectsVolume")}</span>
            <input
              id="settings-sound-effects-volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={state.settings.soundEffectsVolume ?? 0.5}
              aria-valuetext={percentage(state.settings.soundEffectsVolume ?? 0.5)}
              onChange={(event) =>
                store.dispatch({
                  type: "settings.update",
                  patch: { soundEffectsVolume: Number(event.currentTarget.value) },
                })
              }
            />
            <output>{percentage(state.settings.soundEffectsVolume ?? 0.5)}</output>
          </label>
          <label className="settings-toggle" htmlFor="settings-news-ticker">
            <input
              id="settings-news-ticker"
              type="checkbox"
              checked={state.settings.newsTickerEnabled !== false}
              onChange={(event) =>
                store.dispatch({
                  type: "settings.update",
                  patch: { newsTickerEnabled: event.currentTarget.checked },
                })
              }
            />
            <span>{settingsText(locale, "newsTicker")}</span>
          </label>
        </div>
      </section>
      <section
        className="subpane-panel"
        id="panel-settings-saves"
        role="tabpanel"
        aria-labelledby="tab-settings-saves"
        tabIndex={0}
        hidden={activePane !== "settings-saves"}
        data-testid="settings-saves-panel"
      >
        <section className="settings-save-controls" aria-labelledby="settings-save-title">
          <div className="settings-section-heading">
            <h3 id="settings-save-title">{save("manage")}</h3>
            <output
              className={savePersistent ? "save-state saved-state" : "save-state unsaved-state"}
              data-testid="save-status"
              aria-live="polite"
            >
              {saveStatus}
            </output>
          </div>
          <div className="settings-save-options">
            <label className="settings-toggle" htmlFor="settings-autosave">
              <input
                id="settings-autosave"
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(event) => onAutoSaveEnabledChange(event.currentTarget.checked)}
              />
              <span>{save("autoSave")}</span>
            </label>
            <label className="settings-control" htmlFor="settings-save-frequency">
              <span>{save("saveFrequency")}</span>
              <select
                id="settings-save-frequency"
                value={autoSaveInterval}
                onChange={(event) =>
                  onAutoSaveIntervalChange(
                    Number(event.currentTarget.value) as 300 | 900 | 1800 | 3600,
                  )
                }
              >
                <option value={300}>{save("every5Minutes")}</option>
                <option value={900}>{save("every15Minutes")}</option>
                <option value={1800}>{save("every30Minutes")}</option>
                <option value={3600}>{save("everyHour")}</option>
              </select>
            </label>
            <div className="settings-save-actions">
              <button
                className="secondary-button"
                type="button"
                data-testid="save-now"
                onClick={onSaveNow}
              >
                {save("saveNow")}
              </button>
              <button
                className="secondary-button"
                type="button"
                data-testid="save-manager-open"
                onClick={onOpenSaveManager}
              >
                {save("manage")}
              </button>
            </div>
          </div>
        </section>
      </section>
      <section
        className="subpane-panel"
        id="panel-settings-achievements"
        role="tabpanel"
        aria-labelledby="tab-settings-achievements"
        tabIndex={0}
        hidden={activePane !== "settings-achievements"}
      >
        <AchievementsPane state={state} />
      </section>
      <section
        className="subpane-panel"
        id="panel-settings-events"
        role="tabpanel"
        aria-labelledby="tab-settings-events"
        tabIndex={0}
        hidden={activePane !== "settings-events"}
      >
        <MetaJournalPane state={state} store={store} active={activePane === "settings-events"} />
      </section>
      {SETTINGS_LIBRARY_PANE_IDS.map((paneId) => (
        <section
          className="subpane-panel"
          id={`panel-${paneId}`}
          key={paneId}
          role="tabpanel"
          aria-labelledby={`tab-${paneId}`}
          tabIndex={0}
          hidden={activePane !== paneId}
        >
          <SettingsStatisticsPane state={state} />
        </section>
      ))}
    </section>
  );
}
