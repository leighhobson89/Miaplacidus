import { LOCALE_IDS } from "../content/ids";
import { THEME_IDS, type ThemeId } from "../content/themes";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { settingsLabel, settingsText, themeName } from "../i18n/settingsMessages";
import { AchievementsPane } from "./AchievementsPane";
import { MetaJournalPane } from "./MetaJournalPane";

const localeNames = {
  en: "English",
  es: "Español",
  pt: "Português",
  de: "Deutsch",
  it: "Italiano",
  fr: "Français",
} as const;

export function SettingsPane({
  state,
  store,
}: {
  readonly state: GameState;
  readonly store: GameStore;
}) {
  const locale = state.settings.locale;
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
      <div className="settings-controls">
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
        <label className="settings-control" htmlFor="settings-notation">
          <span>{settingsText(locale, "notation")}</span>
          <select
            id="settings-notation"
            aria-label={settingsText(locale, "notation")}
            value={state.settings.notation}
            onChange={(event) =>
              store.dispatch({
                type: "settings.update",
                patch: { notation: event.currentTarget.value as GameState["settings"]["notation"] },
              })
            }
          >
            <option value="standard">{settingsText(locale, "standard")}</option>
            <option value="scientific">{settingsText(locale, "scientific")}</option>
          </select>
        </label>
        <label className="settings-toggle" htmlFor="settings-sound">
          <input
            id="settings-sound"
            type="checkbox"
            checked={state.settings.soundEnabled}
            onChange={(event) =>
              store.dispatch({
                type: "settings.update",
                patch: { soundEnabled: event.currentTarget.checked },
              })
            }
          />
          <span>{settingsText(locale, "sound")}</span>
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
      </div>
      <AchievementsPane state={state} />
      <MetaJournalPane state={state} store={store} />
    </section>
  );
}
