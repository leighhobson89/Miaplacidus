# P-44 Settings notifications label copy audit

**Date:** 13 October 2026

Cosmic Forge renders the Notifications setting row with `tab9ToggleNotificationsRowLabel` in [`drawTab9Content.js:233-237`](../../../../cosmicForge/cosmicForge/drawTab9Content.js#L233). Its six values are `Toggle Notifications:`, `Alternar Notificaciones:`, `Alternar Notificações:`, `Benachrichtigungen Umschalten:`, `Attiva/Disattiva Notifiche:`, and `Basculer les Notifications:` in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1724).

MIAPLACIDUS binds its typed `notifications` message to the visible and accessible checkbox label in [`SettingsPane.tsx`](../../../src/app/SettingsPane.tsx#L333). The six values in [`settingsMessages.ts`](../../../src/i18n/settingsMessages.ts#L108) now preserve the source's trailing colon.

This changes only row-label punctuation. The notification preference, toggle behavior, and six Settings destinations are unchanged. Static source-to-renderer comparison only; no tests, builds, or browser review were run. P-44 remains open for the broader catalogue and rendered-locale evidence.
