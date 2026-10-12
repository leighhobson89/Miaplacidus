# P-44 Settings Notifications label copy audit — 12 October 2026

Compared Cosmic Forge's `tab9ToggleNotificationsRowLabel` with the MIAPLACIDUS Notifications checkbox. The target now uses the source's action wording in each locale and omits the trailing colon for the inline checkbox.

| Locale | Checkbox label |
|---|---|
| English | `Toggle Notifications` |
| Spanish | `Alternar Notificaciones` |
| Portuguese | `Alternar Notificações` |
| German | `Benachrichtigungen Umschalten` |
| Italian | `Attiva/Disattiva Notifiche` |
| French | `Basculer les Notifications` |

The control, description, and Settings destination are unchanged. Source evidence: `../../../../cosmicForge/cosmicForge/drawTab9Content.js:235` and the six `tab9ToggleNotificationsRowLabel` entries in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: the checkbox in `src/app/SettingsPane.tsx` and `notifications` in `src/i18n/settingsMessages.ts`.

Static source/catalogue and renderer review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
