# P-44 Cosmic Rip notices and completion-copy route audit

Audit date: 12 October 2026. Compared Cosmic Forge's Cosmic Rip notifications and modal outcomes with MIAPLACIDUS `cosmicRipMessages`, notice mapping, and pane destinations. The copy correction is limited to the Cosmic Rip catalog; no mechanics or navigation changed. No tests or checks were run.

## Source-to-target routing

`cosmicForge/cosmicForge/drawTab8Content.js` owns restore, scan, and close controls. `game.js` owns the five completed-research modal outcomes. Their localized source keys and target presentation routes are:

| Cosmic Forge result | Target catalog/message key | Target route and owner |
| --- | --- | --- |
| Scanner restoration failure: `notificationScannerArrayRestoreFailed` | `cosmicRipText(locale).scannerRestoreFailedNotification` | `CosmicRipPane.tsx` reports rejected restore commands through `notify`; the global `NotificationStack` renders the warning. |
| Scanner restoration success toast: `notificationScannerArrayRestored` | `cosmicRipText(locale).scannerRestoredNotification` | `cosmicRipEventNotifications.ts` maps `cosmic-rip.scanner-restored`; `App.tsx` forwards the info notice to the global `NotificationStack`. |
| Scanner restoration success modal: `modalNearSpaceScannerArrayRestoredHeader` / `modalNearSpaceScannerArrayRestoredText` | `scannerRestored` plus `scannerArrayHelp` | No modal in the remake. `CosmicRipPane.tsx` presents the restored status and next scan instructions inside Situation and Scanner Array. The longer source narrative is not reproduced. |
| Empty sector scan: `notificationSectorScanEmpty` | `cosmicRipText(locale).sectorScanEmptyNotification` | `cosmicRipEventNotifications.ts` maps `cosmic-rip.sector-scanned` with `found: false`; `App.tsx` routes the info notice to the global `NotificationStack`. Situation/Scanner Array also show the persistent `ripMissing` state after a scan. |
| Rip found scan: `notificationSectorScanFound` | `cosmicRipText(locale).sectorScanFoundNotification` | `cosmicRipEventNotifications.ts` maps `cosmic-rip.sector-scanned` with `found: true`; `App.tsx` routes the info notice to the global `NotificationStack`. The sector button and page status use `sectorFound` / `ripFound` in `CosmicRipPane.tsx`. |
| Rip located modal: `modalCosmicRipLocatedHeader` / `modalCosmicRipLocatedText` | `ripFound` | No modal in the remake. `CosmicRipPane.tsx` renders the located state and unlocks containment research in its owner page; the global scan-found notice remains separate. |
| Five research completion modals: `modalCosmicRipTech*Header` / `modalCosmicRipTech*Text` | `technologyResearchedNotification` and `technologyStatusMessages[technologyId]` | `App.tsx` detects each newly researched Cosmic Rip technology and routes a localized info toast to `NotificationStack`; `CosmicRipPane.tsx` shows its persistent per-technology status in the matching card. The lengthy source milestone narratives and percentages are not reproduced. |
| Cosmic Rip closure modal: `modalCosmicRipClosedHeader` / `modalCosmicRipClosedText` | `cosmicRipText(locale).closed` | `CosmicRipPane.tsx` renders the completion copy in Situation and in the closed-state output (`data-testid="cosmic-rip-closed"`); it is a persistent page ending rather than a modal. The target copy now addresses the player as Mia'Plac. |

## Correction

The source closure modal addresses the player by the old title “Cosmic Forger” in each locale (`localization.json` `modalCosmicRipClosedText`, for example English at line 216). The target closure copy previously omitted the player identity. Since the remake's player is Mia'Plac, the six localized `closed` messages in `src/i18n/cosmicRipMessages.ts` now include the canonical name “Mia'Plac” and do not carry the old title forward. The copy is owned by the Cosmic Rip end-state renderer described above.

## Remaining presentation difference

The source restore, locate, and five research-progress modals do not have modal equivalents in the remake. The current remake routes concise outcomes to the global notification region and keeps status in the Cosmic Rip page. This audit documents those routes; restoring the source's longer milestone narratives or modal presentation is not included in this small copy correction.
