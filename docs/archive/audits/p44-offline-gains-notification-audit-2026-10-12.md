# P-44 Offline Gains notification audit — 12 October 2026

## Source behavior

Cosmic Forge calls `offlineGains(false)` after `restoreGameStatus` adopts a saved run in `constantsAndGlobalVars.js:2316-2318`. At the end of that path, `game.js:12978-12980` emits `notificationOfflineGainsAdded` as an informational `loadSave` notice for 3,000 ms. It does this even when the elapsed interval or calculated gains are zero. The six source strings are `Offline Gains Added!`, `¡Ganancias sin conexión añadidas!`, `Ganhos offline adicionados!`, `Offline-Gewinne hinzugefügt!`, `Guadagni offline aggiunti!`, and `Gains hors ligne ajoutés!` (`localization.json:2358,4981,7604,10227,12850,15473`).

When the player returns to a hidden/focused game, source `ui.js:3257-3292` calls `offlineGains(true)`; that path intentionally does not emit the notice. This keeps ordinary tab switching quiet.

## Remake route and correction

MIAPLACIDUS resumes an existing save with `run.clock.foreground` false in `App.tsx:startSelectedRun`, then the first visible clock advance processes saved-time catch-up. Fresh runs start with the clock in the foreground. Active-save replacement also resets the clock to the nonforeground state in `replaceActiveSave`.

Added the six-locale `offlineGainsAdded` message to the existing save catalogue. A one-shot in-memory flag is set for a resumed save or a successful active-save replacement. The first successful visible clock advance after that load emits the informational `loadSave` notice and consumes the flag. Focus/visibility returns later in the same session do not announce it. The flag and notice are transient UI state and are not written to the save schema.

This is a static source/renderer comparison. No tests, builds, typechecks, or browser checks were run. No estimate changed, and P-44 remains open for the broader notification catalogue and remaining acceptance evidence.
