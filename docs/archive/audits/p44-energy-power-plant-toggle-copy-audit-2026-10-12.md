# P-44 Energy Power plant toggle copy audit — 12 October 2026

Compared Cosmic Forge's three Power plant toggle actions with the MIAPLACIDUS Power child controls. Source uses `buttonActivate` when a plant is disabled and `buttonDeactivate` when it is enabled. The target's checkbox already toggles the same `buildingEnabled` state, but its visible text used generic Pause/Resume labels; it now uses dedicated Activate/Deactivate messages.

| Locale | Activate | Deactivate |
|---|---|---|
| English | `Activate` | `Deactivate` |
| Spanish | `Activar` | `Desactivar` |
| Portuguese | `Ativar` | `Desativar` |
| German | `Aktivieren` | `Deaktivieren` |
| Italian | `Attiva` | `Disattiva` |
| French | `Activer` | `Désactiver` |

The three source plant rows use these same action keys. MIAPLACIDUS retains its checkbox presentation and current Power page ownership; no plant state, action, or rate behavior changed. Source evidence: `../../../../cosmicForge/cosmicForge/drawTab2Content.js:153-158,242-248,332-338` and the six-locale `buttonActivate`/`buttonDeactivate` values in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: `src/app/EconomyPanes.tsx` and `activatePowerPlant`/`deactivatePowerPlant` in `src/i18n/economyMessages.ts`.

Static source/catalogue and renderer review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
