# P-44 Settings child ownership audit — 11 October 2026

## Scope

Compared Cosmic Forge's Visual, Game Options, and Saving / Loading settings content, labels, help, and relevant save errors against the corresponding MIAPLACIDUS child pages in all six supported locales. This audit does not reconsider the Settings navigation map or page names.

## Source and target evidence

Cosmic Forge builds the Visual rows in `cosmicForge/cosmicForge/drawTab9Content.js:129-358`: theme, currency symbol, number notation, notifications, custom pointer, pointer trail, and weather effects. MIAPLACIDUS renders these controls in `src/app/SettingsPane.tsx` under `panel-settings-visual`. The row captions and source help are in `src/i18n/settingsMessages.ts`; custom-pointer help changes the old product name to MIAPLACIDUS, while preserving the toggle meaning.

Cosmic Forge builds the Game Options rows in `drawTab9Content.js:398-569`: fullscreen, language, News Ticker, background audio, and sound effects. MIAPLACIDUS places these controls and their volume sliders in `panel-settings-game-options`. The source row captions are mapped to their matching controls and `aria-describedby` descriptions in all six locales.

Cosmic Forge begins its Saving / Loading page at `drawTab9Content.js:577`. MIAPLACIDUS keeps autosave, the owner-requested 5/15/30/60-minute intervals, manual save, local pioneer management, and portable import/export together in `panel-settings-saves`; the management interface is inline rather than a separate window. The source intervals (2/3/5/10 minutes) are intentionally replaced by the owner's requested intervals. Cloud save controls and cloud-specific errors remain excluded under the local-save contract.

The source warns when autosave is disabled (`drawTab9Content.js:593-599`, localization key `notificationAutoSaveOff`). MIAPLACIDUS sends the corresponding localized `autoSaveDisabledWarning` from the settings callback in `src/app/App.tsx`; this warning is not missing. Local import, storage, quota, and save-lock failures use typed local error codes through `src/app/SaveManager.tsx` and `src/i18n/saveMessages.ts`, rather than cloud-specific source failures. Import-as-new and active-save replacement have distinct success messages because the former stores a new slot without loading it.

## Finding

No control, row caption, help string, or local save error was found under the wrong child page or with incorrect source meaning. Owner-directed adaptations are preserved: MIAPLACIDUS branding for the pointer, the 5/15/30/60-minute autosave choices, local-only save management, and the requested “Saving and Loading” page name.

The existing `tests/e2e/settings/settings-accessibility.spec.ts` covers localized row descriptions and their control associations; this audit additionally traced each control's owning panel in `src/app/SettingsPane.tsx`. No test files were changed, and no test, build, typecheck, formatter, or browser check was run.
