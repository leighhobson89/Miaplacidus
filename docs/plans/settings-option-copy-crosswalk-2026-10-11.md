# Settings option copy crosswalk — 11 October 2026

## Audit scope

Compared Cosmic Forge's **Visual** and **Game Options** settings rows with MIAPLACIDUS's **Visual Options** and **Game Options** panels. The read-only workspace sibling reference defines the controls in `cosmicForge/cosmicForge/drawTab9Content.js:128-386,396-578`; tooltip content is mapped in `cosmicForge/cosmicForge/descriptions.js:1721-1739`.

## Control ownership

The page destinations already match. Visual Options owns theme, currency symbol, number notation, notifications, custom pointer, pointer trail, and weather effects. Game Options owns fullscreen, language, background audio, sound effects, and the news ticker. The remake's separate volume sliders remain in Game Options. No control was moved, removed, or given new behavior. Cosmic Forge gates Number Notation behind its debugger flag; MIAPLACIDUS keeps its player-facing selector available as already designed.

## Copy gaps corrected

Cosmic Forge supplies four additional help-tooltip strings through its `optionDescriptions` mapping: `settingsThemeContent1`, `settingsCurrencySymbolContent1`, `settingsNotationContent1`, and `settingsToggleNotificationsContent1` (`descriptions.js:1721-1739`; six translations in `localization.json:670-673,3293-3296,5916-5919,8539-8542,11162-11165,13785-13788`). MIAPLACIDUS now exposes those localized strings through keyboard-accessible `InfoTooltip` controls beside the same Visual Options controls. Currency retains its existing visible row description as well.

The remake was also missing the source's visible row captions for Theme, Number Notation, Notifications, Language, News Ticker, Background Audio, and Sound Effects. Their matching source localization keys are `tab9ThemeRowDescription`, `tab9NotationRowDescription`, `tab9ToggleNotificationsRowDescription`, `settingsLanguageRowDescription`, `tab9NewsTickerRowDescription`, `tab9BackgroundAudioRowDescription`, and `tab9SfxRowDescription`. Their six-locale source blocks are at `localization.json:1626,1711-1751; 4249,4334-4374; 6872,6957-6997; 9495,9580-9620; 12118,12203-12243; 14741,14826-14866`. The localized strings now appear beneath their existing controls and are linked to those controls with `aria-describedby`. Their typed catalogue entries are in `src/i18n/settingsMessages.ts`; control placement and values are unchanged.

Focused six-locale rendered assertions were added to `tests/e2e/settings/settings-accessibility.spec.ts` for the seven row captions and four help strings, including each help trigger's tooltip relationship. They were not run, per the task instruction.

## Source row mapping

| Cosmic Forge source row/control | MIAPLACIDUS control and destination |
| --- | --- |
| `settingsThemeRow` / `themeSelect` | `#settings-theme`, Visual Options |
| `settingsCurrencySymbolRow` / `currencySelect` | `#settings-currency`, Visual Options |
| `settingsNotationRow` / `notationSelect` | `#settings-notation`, Visual Options |
| `settingsToggleNotificationsRow` / `notificationsToggle` | `#settings-notifications`, Visual Options |
| `customPointerToggleRow` / `customPointerToggle` | `#settings-custom-pointer`, Visual Options |
| `mouseTrailToggleRow` / `mouseTrailToggle` | `#settings-pointer-trail`, Visual Options |
| `weatherEffectSettingsRow` / `weatherEffectSettingToggle` | `#settings-weather-effects`, Visual Options |
| `toggleGameFullScreenRow` | Fullscreen button, Game Options |
| `settingsLanguageRow` / `languageSelect` | `#settings-language`, Game Options |
| `newsTickerToggleRow` / `newsTickerSettingToggle` | `#settings-news-ticker`, Game Options |
| `backGroundAudioRow` / `backGroundAudioToggle` | `#settings-background-audio`, Game Options |
| `sfxAudioRow` / `sfxToggle` | `#settings-sound-effects`, Game Options |
