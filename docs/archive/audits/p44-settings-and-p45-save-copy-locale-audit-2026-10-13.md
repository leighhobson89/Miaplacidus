# Settings and save-message locale audit — 13 October 2026

**Scope:** correct the Portuguese Settings title, the Italian fullscreen-toggle action, Portuguese save-management wording, and save-capacity terminology.

Cosmic Forge's `headerMainSettings` is “Definições” in Portuguese (`localization.json:6873`); the target Settings title now uses that value in [`settingsMessages.ts`](../../../src/i18n/settingsMessages.ts#L193). The source fullscreen row description is “Attiva o disattiva lo schermo intero. (o F11)” in Italian (`localization.json:12236`); the target button's `fullscreenToggle` now uses “Attiva o disattiva” in the active Settings control at [`SettingsPane.tsx`](../../../src/app/SettingsPane.tsx#L439).

Portuguese save-management copy in [`saveMessages.ts`](../../../src/i18n/saveMessages.ts) now uses the European Portuguese vocabulary and forms already used by the source locale and target Settings copy. The target's multi-save capacity explanation is remake-specific, so its wording remains an intentional adaptation: it describes retaining save generations and manual export/deletion rather than claiming source-game save-slot behavior. Where the target previously used `slot`, the guidance now names a save instead in English, Portuguese, German, Italian, and French; Spanish already used context-appropriate save wording.

These strings render through the existing Settings and save/start surfaces; no routes, persistence rules, or save behavior changed. Static source/catalogue/call-site review only. No tests, builds, typechecks, formatting, or browser renders were run. The broader L-04 and L-05 route/context review remains open; P-44/P-45 remain open.
