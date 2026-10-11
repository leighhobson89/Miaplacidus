# P-44 Save & Loading import-result copy audit — 11 October 2026

Cosmic Forge's `saveLoadGame.js` calls `notificationGameLoadedSuccessfully`
after `loadGame()` replaces the active run with the imported state. Its
localized text is "Game loaded successfully!" in English, with corresponding
translations in the other five source locales.

MIAPLACIDUS offers two distinct matching-save outcomes in
`src/app/SaveManager.tsx`: replacing the active pioneer immediately loads the
imported state into the current run; replacing a different local pioneer's
slot changes that saved slot and leaves the current run active. Both outcomes
previously used the generic `imported` notice. The active-save path now uses the
typed six-locale `loaded` message, copied from the source localization. Other
slot replacement continues to use `imported`; creating a new slot continues to
use the separate `importedAsNew` instruction to select it from the saved list.

The existing source/target disposition and active-replacement copy expectation
were aligned with this route. No tests were added or run. No save mechanics,
slot selection, or cloud/account behavior changed. The broader P-44 Save/Import
and catalogue crosswalk remains open.
