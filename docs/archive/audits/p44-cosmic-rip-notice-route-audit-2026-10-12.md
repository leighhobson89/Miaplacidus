# P-44 Cosmic Rip notices and completion-copy route audit

Audit date: 12 October 2026. Compared Cosmic Forge's Cosmic Rip notifications and modal outcomes with MIAPLACIDUS `cosmicRipMessages`, notice mapping, and pane destinations. The copy correction is limited to the Cosmic Rip catalog; no mechanics or navigation changed. No tests or checks were run.

## Source-to-target routing

`cosmicForge/cosmicForge/drawTab8Content.js` owns restore, scan, and close controls. `game.js` owns the five completed-research modal outcomes. Their localized source keys and target presentation routes are:

| Cosmic Forge result | Target catalog/message key | Target route and owner |
| --- | --- | --- |
| Scanner restoration failure: `notificationScannerArrayRestoreFailed` | `cosmicRipText(locale).scannerRestoreFailedNotification` | `CosmicRipPane.tsx` reports rejected restore commands through `notify`; the global `NotificationStack` renders the warning. |
| Scanner restoration success toast: `notificationScannerArrayRestored` | `cosmicRipText(locale).scannerRestoredNotification` | `cosmicRipEventNotifications.ts` maps `cosmic-rip.scanner-restored`; `App.tsx` forwards the info notice to the global `NotificationStack`. |
| Scanner restoration success modal: `modalNearSpaceScannerArrayRestoredHeader` / `modalNearSpaceScannerArrayRestoredText` | `cosmicRipMilestoneResultDialogMessages.ts` (`scannerRestored`) | After routing the separate success notice, `cosmicRipEventNotifications.ts` queues the localized shared result dialog. `CosmicRipPane.tsx` retains the restored status and scan instructions. |
| Empty sector scan: `notificationSectorScanEmpty` | `cosmicRipText(locale).sectorScanEmptyNotification` | `cosmicRipEventNotifications.ts` maps `cosmic-rip.sector-scanned` with `found: false`; `App.tsx` routes the info notice to the global `NotificationStack`. Situation/Scanner Array also show the persistent `ripMissing` state after a scan. |
| Rip found scan: `notificationSectorScanFound` | `cosmicRipText(locale).sectorScanFoundNotification` | `cosmicRipEventNotifications.ts` maps `cosmic-rip.sector-scanned` with `found: true`; `App.tsx` routes the info notice to the global `NotificationStack`. The sector button and page status use `sectorFound` / `ripFound` in `CosmicRipPane.tsx`. |
| Rip located modal: `modalCosmicRipLocatedHeader` / `modalCosmicRipLocatedText` | `cosmicRipMilestoneResultDialogMessages.ts` (`ripLocated`) | The found notice remains separate; the event handler queues the localized result dialog with the source 2000 ms delay. `CosmicRipPane.tsx` retains the located state and unlocks containment research in its owner page. |
| Five research completion modals: `modalCosmicRipTech*Header` / `modalCosmicRipTech*Text` | `cosmicRipResearchResultDialogMessages.ts` plus `technologyResearchedNotification` | `App.tsx` keeps the localized info toast and queues the matching milestone result dialog; `CosmicRipPane.tsx` also retains the persistent per-technology status and stability percentage in the owning Cosmic Rip child. The research result uses the shared dialog queue. |
| Cosmic Rip closure modal and ending: modalCosmicRipClosedHeader / modalCosmicRipClosedText / modalEndGameConfirmLabel, followed by playWinCinematic2() | cosmicRipText(locale).closedTitle / .closed / .closedDialogEndLabel, then localized cosmicRipEndingCinematicMessages | cosmicRipEventNotifications.ts queues the confirm-only dialog from accepted cosmic-rip.closed; explicit confirmation after the queue drains starts CosmicRipEndingCinematic.tsx. The persistent pane remains. Canonical Mia'Plac/MIAPLACIDUS identity replaces source identities; source-specific creator credits are omitted. P-28 was reopened for rendered review of the sequence. See the [closure ending audit](p44-cosmic-rip-closure-result-dialog-audit-2026-10-12.md). |

## Correction

The source closure modal and its end-game button address the player by the old title “Cosmic Forger” in each locale (`localization.json` `modalCosmicRipClosedText` and `modalEndGameConfirmLabel`, for example English at lines 216 and 1799). The target's six-locale closure body and end-game label use the canonical player name “Mia'Plac” and do not carry the old title forward. The body is shared by the one-shot result dialog and persistent end-state renderer.

## Remaining presentation difference

The scanner-restoration and Rip-location modals now use localized queued result dialogs alongside their notices and persistent page status; the Rip-location dialog follows its found notice after the source two-second delay. The five research-progress modals also use the queued dialog route. Confirming the closure result after the queue drains now starts the localized ending sequence. P-28 has been reopened for rendered review of this separate source-triggered sequence. See the [focused result-dialog audit](p44-cosmic-rip-megastructure-result-dialog-audit-2026-10-12.md) and [closure ending audit](p44-cosmic-rip-closure-result-dialog-audit-2026-10-12.md).
