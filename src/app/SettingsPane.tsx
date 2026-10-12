import { memo, useEffect, useRef, useState } from "react";
import { LOCALE_IDS } from "../content/ids";
import { CURRENCY_CODES, CURRENCY_IDS, CURRENCY_SYMBOLS } from "../content/currency";
import { THEME_IDS, type ThemeId } from "../content/themes";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import {
  settingsLabel,
  settingsSectionName,
  settingsText,
  themeName,
} from "../i18n/settingsMessages";
import { saveText } from "../i18n/saveMessages";
import { AchievementsPane } from "./AchievementsPane";
import { MetaJournalPane } from "./MetaJournalPane";
import { CelestialIllustration } from "./CelestialIllustration";
import { InfoTooltip } from "./InfoTooltip";
import { PageArtworkRow } from "./PageArtworkRow";
import { SettingsStatisticsPane } from "./SettingsStatisticsPane";
import { SaveManager, type SaveManagerProps } from "./SaveManager";
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
  readonly onNavigateToPane?: (paneId: string) => void;
  readonly saveStatus: string;
  readonly savePersistent: boolean;
  readonly autoSaveEnabled: boolean;
  readonly autoSaveInterval: 300 | 900 | 1800 | 3600;
  readonly onAutoSaveEnabledChange: (enabled: boolean) => void;
  readonly onAutoSaveIntervalChange: (interval: 300 | 900 | 1800 | 3600) => void;
  readonly onSoundEffectsDisable: () => void;
  readonly onBackgroundAudioToggle: () => void;
  readonly onThemeSelectorInteraction: () => void;
  readonly onSaveNow: () => void;
  readonly activePane: SettingsPaneId;
  readonly onSelectPane: (paneId: SettingsPaneId) => void;
  readonly saveManagerProps: SaveManagerProps;
}

const STATIC_SETTINGS_PANE_IDS = new Set<SettingsPaneId>([
  "settings-visual",
  "settings-game-options",
]);

function settingsPanePropsAreEqual(previous: SettingsPaneProps, next: SettingsPaneProps): boolean {
  return (
    STATIC_SETTINGS_PANE_IDS.has(next.activePane) &&
    previous.activePane === next.activePane &&
    previous.store === next.store &&
    previous.onSoundEffectsDisable === next.onSoundEffectsDisable &&
    previous.onBackgroundAudioToggle === next.onBackgroundAudioToggle &&
    previous.onThemeSelectorInteraction === next.onThemeSelectorInteraction &&
    previous.state.settings === next.state.settings &&
    previous.state.run.navigationAttentionIds === next.state.run.navigationAttentionIds
  );
}

export const SettingsPane = memo(function SettingsPane({
  state,
  store,
  attentionIds,
  attentionLabel,
  onPaneVisit,
  onNavigateToPane,
  saveStatus,
  savePersistent,
  autoSaveEnabled,
  autoSaveInterval,
  onAutoSaveEnabledChange,
  onAutoSaveIntervalChange,
  onSoundEffectsDisable,
  onBackgroundAudioToggle,
  onThemeSelectorInteraction,
  onSaveNow,
  activePane,
  onSelectPane,
  saveManagerProps,
}: SettingsPaneProps) {
  const themeSelectorInteractionPending = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenFailed, setFullscreenFailed] = useState(false);
  const locale = state.settings.locale;
  const save = (key: Parameters<typeof saveText>[1]) => saveText(locale, key);
  const percentage = (value: number) =>
    new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }).format(value);
  const panes = settingsPaneItems(locale);
  const showSettingsArtwork =
    activePane !== "settings-achievements" &&
    activePane !== "settings-events" &&
    activePane !== "settings-statistics";
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
      {showSettingsArtwork && (
        <PageArtworkRow>
          <CelestialIllustration kind="settings" />
        </PageArtworkRow>
      )}
      <PaneNavigation
        items={panes}
        selectedId={activePane}
        label={settingsText(locale, "sections")}
        attentionIds={attentionIds}
        attentionLabel={attentionLabel}
        onSelect={(id) => {
          onPaneVisit(id);
          onSelectPane(id as SettingsPaneId);
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
        {activePane === "settings-visual" && (
          <>
            <h3 className="game-page-title">{settingsSectionName(locale, "visual")}</h3>
            <p className="pane-intro">{settingsText(locale, "visualDescription")}</p>
            <div className="settings-controls">
              <div className="settings-control-help-row">
                <div className="settings-control">
                  <label htmlFor="settings-theme">{settingsText(locale, "theme")}</label>
                  <select
                    id="settings-theme"
                    data-testid="theme-selector"
                    data-tutorial-target="settings-theme"
                    aria-label={settingsText(locale, "theme")}
                    aria-describedby="settings-theme-description"
                    value={state.settings.themeId}
                    onPointerDown={() => {
                      themeSelectorInteractionPending.current = true;
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === " " ||
                        event.key === "Enter" ||
                        event.key.startsWith("Arrow") ||
                        event.key === "Home" ||
                        event.key === "End" ||
                        event.key.length === 1
                      ) {
                        themeSelectorInteractionPending.current = true;
                      }
                    }}
                    onChange={(event) => {
                      const result = store.dispatch({
                        type: "settings.update",
                        patch: { themeId: event.currentTarget.value as ThemeId },
                      });
                      if (result.accepted) onThemeSelectorInteraction();
                    }}
                    onBlur={() => {
                      const interacted = themeSelectorInteractionPending.current;
                      themeSelectorInteractionPending.current = false;
                      if (interacted) onThemeSelectorInteraction();
                    }}
                  >
                    {THEME_IDS.map((id) => (
                      <option key={id} value={id}>
                        {themeName(locale, id)}
                      </option>
                    ))}
                  </select>
                  <small id="settings-theme-description" data-testid="settings-theme-description">
                    {settingsText(locale, "themeRowDescription")}
                  </small>
                </div>
                <InfoTooltip
                  id="settings-theme-help-tooltip"
                  label={settingsText(locale, "optionHelpLabel")}
                  content={settingsText(locale, "themeHelpDescription")}
                  testId="settings-theme-help"
                />
              </div>
              <div className="settings-control-help-row">
                <div className="settings-control">
                  <label htmlFor="settings-currency">{settingsText(locale, "currency")}</label>
                  <select
                    id="settings-currency"
                    aria-describedby="settings-currency-description"
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
                  <small
                    id="settings-currency-description"
                    data-testid="settings-currency-description"
                  >
                    {settingsText(locale, "currencyDescription")}
                  </small>
                </div>
                <InfoTooltip
                  id="settings-currency-help-tooltip"
                  label={settingsText(locale, "optionHelpLabel")}
                  content={settingsText(locale, "currencyHelpDescription")}
                  testId="settings-currency-help"
                />
              </div>
              <div className="settings-control-help-row">
                <div className="settings-control">
                  <label htmlFor="settings-notation">{settingsText(locale, "notation")}</label>
                  <select
                    id="settings-notation"
                    aria-label={settingsText(locale, "notation")}
                    aria-describedby="settings-notation-description"
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
                    <option value="condensed">{settingsText(locale, "condensed")}</option>
                    <option value="standard">{settingsText(locale, "standard")}</option>
                    <option value="scientific">{settingsText(locale, "scientific")}</option>
                  </select>
                  <small id="settings-notation-description" data-testid="settings-notation-description">
                    {settingsText(locale, "notationRowDescription")}
                  </small>
                </div>
                <InfoTooltip
                  id="settings-notation-help-tooltip"
                  label={settingsText(locale, "optionHelpLabel")}
                  content={settingsText(locale, "notationHelpDescription")}
                  testId="settings-notation-help"
                />
              </div>
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
              <div className="settings-toggle-help-row">
                <div className="settings-control">
                  <label className="settings-toggle" htmlFor="settings-notifications">
                    <input
                      id="settings-notifications"
                      type="checkbox"
                      aria-describedby="settings-notifications-description"
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
                  <small
                    id="settings-notifications-description"
                    data-testid="settings-notifications-description"
                  >
                    {settingsText(locale, "notificationsRowDescription")}
                  </small>
                </div>
                <InfoTooltip
                  id="settings-notifications-help-tooltip"
                  label={settingsText(locale, "optionHelpLabel")}
                  content={settingsText(locale, "notificationsHelpDescription")}
                  testId="settings-notifications-help"
                />
              </div>
              <div className="settings-toggle-help-row">
                <label className="settings-toggle" htmlFor="settings-custom-pointer">
                  <input
                    id="settings-custom-pointer"
                    type="checkbox"
                    aria-describedby="settings-custom-pointer-description"
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
                <span className="sr-only" id="settings-custom-pointer-description">
                  {settingsText(locale, "customPointerDescription")}
                </span>
                <InfoTooltip
                  id="settings-custom-pointer-tooltip"
                  label={settingsText(locale, "customPointerHelpLabel")}
                  content={settingsText(locale, "customPointerDescription")}
                  testId="settings-custom-pointer-help"
                />
              </div>
              <div className="settings-toggle-help-row">
                <label className="settings-toggle" htmlFor="settings-pointer-trail">
                  <input
                    id="settings-pointer-trail"
                    type="checkbox"
                    aria-describedby="settings-pointer-trail-description"
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
                <span className="sr-only" id="settings-pointer-trail-description">
                  {settingsText(locale, "pointerTrailDescription")}
                </span>
                <InfoTooltip
                  id="settings-pointer-trail-tooltip"
                  label={settingsText(locale, "pointerTrailHelpLabel")}
                  content={settingsText(locale, "pointerTrailDescription")}
                  testId="settings-pointer-trail-help"
                />
              </div>
              <div className="settings-control">
                <label className="settings-toggle" htmlFor="settings-weather-effects">
                  <input
                    id="settings-weather-effects"
                    type="checkbox"
                    aria-describedby="settings-weather-effects-description"
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
                <small id="settings-weather-effects-description">
                  {settingsText(locale, "weatherEffectsDescription")}
                </small>
              </div>
            </div>
          </>
        )}
      </section>
      <section
        className="subpane-panel"
        id="panel-settings-game-options"
        role="tabpanel"
        aria-labelledby="tab-settings-game-options"
        tabIndex={0}
        hidden={activePane !== "settings-game-options"}
      >
        {activePane === "settings-game-options" && (
          <>
            <h3 className="game-page-title">{settingsSectionName(locale, "gameOptions")}</h3>
            <p className="pane-intro">{settingsText(locale, "gameOptionsDescription")}</p>
            <div className="settings-controls">
              <div className="settings-control">
                <span>{settingsText(locale, "fullscreen")}</span>
                <button
                  className="secondary-button"
                  type="button"
                  aria-describedby="settings-fullscreen-description"
                  disabled={!fullscreenSupported}
                  onClick={() => void toggleFullscreen()}
                >
                  {settingsText(locale, isFullscreen ? "fullscreenExit" : "fullscreenEnter")}
                </button>
                <small
                  id="settings-fullscreen-description"
                  data-testid="settings-fullscreen-description"
                >
                  {settingsText(locale, "fullscreenDescription")}
                </small>
                {!fullscreenSupported && (
                  <small>{settingsText(locale, "fullscreenUnavailable")}</small>
                )}
                {fullscreenFailed && (
                  <output aria-live="polite">{settingsText(locale, "fullscreenFailed")}</output>
                )}
              </div>
              <div className="settings-control">
                <label htmlFor="settings-language">{settingsLabel(locale, "language")}</label>
                <select
                  id="settings-language"
                  aria-label={settingsLabel(locale, "language")}
                  aria-describedby="settings-language-description"
                  value={locale}
                  onChange={(event) =>
                    store.dispatch({
                      type: "settings.update",
                      patch: {
                        locale: event.currentTarget.value as GameState["settings"]["locale"],
                      },
                    })
                  }
                >
                  {LOCALE_IDS.map((id) => (
                    <option key={id} value={id}>
                      {localeNames[id]}
                    </option>
                  ))}
                </select>
                <small id="settings-language-description" data-testid="settings-language-description">
                  {settingsText(locale, "languageRowDescription")}
                </small>
              </div>
              <div className="settings-control">
                <label className="settings-toggle" htmlFor="settings-background-audio">
                  <input
                    id="settings-background-audio"
                    data-tutorial-target="settings-audio"
                    type="checkbox"
                    aria-describedby="settings-background-audio-description"
                    checked={state.settings.backgroundAudioEnabled ?? state.settings.soundEnabled}
                    onChange={(event) => {
                      store.dispatch({
                        type: "settings.update",
                        patch: { backgroundAudioEnabled: event.currentTarget.checked },
                      });
                      onBackgroundAudioToggle();
                    }}
                  />
                  <span>{settingsText(locale, "backgroundAudio")}</span>
                </label>
                <small
                  id="settings-background-audio-description"
                  data-testid="settings-background-audio-description"
                >
                  {settingsText(locale, "backgroundAudioRowDescription")}
                </small>
              </div>
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
              <div className="settings-control">
                <label className="settings-toggle" htmlFor="settings-sound-effects">
                  <input
                    id="settings-sound-effects"
                    type="checkbox"
                    aria-describedby="settings-sound-effects-description"
                    checked={state.settings.soundEffectsEnabled ?? state.settings.soundEnabled}
                    onChange={(event) => {
                      if (!event.currentTarget.checked) onSoundEffectsDisable();
                      store.dispatch({
                        type: "settings.update",
                        patch: { soundEffectsEnabled: event.currentTarget.checked },
                      });
                    }}
                  />
                  <span>{settingsText(locale, "soundEffects")}</span>
                </label>
                <small
                  id="settings-sound-effects-description"
                  data-testid="settings-sound-effects-description"
                >
                  {settingsText(locale, "soundEffectsRowDescription")}
                </small>
              </div>
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
              <div className="settings-control">
                <label className="settings-toggle" htmlFor="settings-news-ticker">
                  <input
                    id="settings-news-ticker"
                    type="checkbox"
                    aria-describedby="settings-news-ticker-description"
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
                <small id="settings-news-ticker-description" data-testid="settings-news-ticker-description">
                  {settingsText(locale, "newsTickerRowDescription")}
                </small>
              </div>
            </div>
          </>
        )}
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
        {activePane === "settings-saves" && (
          <>
            <h3 className="game-page-title">{settingsText(locale, "savingSection")}</h3>
            <p className="pane-intro">{settingsText(locale, "savingSectionDescription")}</p>
            <section className="settings-save-controls">
              <div className="settings-section-heading">
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
                </div>
              </div>
            </section>
            <SaveManager {...saveManagerProps} />
          </>
        )}
      </section>
      <section
        className="subpane-panel"
        id="panel-settings-achievements"
        role="tabpanel"
        aria-labelledby="tab-settings-achievements"
        tabIndex={0}
        hidden={activePane !== "settings-achievements"}
      >
        {activePane === "settings-achievements" && <AchievementsPane state={state} />}
      </section>
      <section
        className="subpane-panel"
        id="panel-settings-events"
        role="tabpanel"
        aria-labelledby="tab-settings-events"
        tabIndex={0}
        hidden={activePane !== "settings-events"}
      >
        {activePane === "settings-events" && <MetaJournalPane state={state} store={store} active />}
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
          {activePane === paneId && (
            <SettingsStatisticsPane
              state={state}
              onNavigateToPane={(targetPaneId) => {
                if (targetPaneId.startsWith("settings-")) {
                  onPaneVisit(targetPaneId);
                }
                onNavigateToPane?.(targetPaneId);
              }}
            />
          )}
        </section>
      ))}
    </section>
  );
}, settingsPanePropsAreEqual);
