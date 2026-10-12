# P-44 random-event expiry result-dialog audit

**Date:** 12 October 2026  
**Scope:** Source-backed result dialogs shown when the five timed random events expire.

**Update:** Source event-start dialogs have since been implemented in the shared queue. See the [start-dialog audit](p44-random-event-start-dialog-audit-2026-10-12.md); this record remains scoped to expiry results.

Cosmic Forge emits the expiry notification and opens a distinct result popup for Galactic Market Lockdown, Endless Summer, Miner Broke Down, Supply Chain Disruption, and Black Hole Instability (`../../../cosmicForge/cosmicForge/events.js:110-188`). The `showEventModal` maps the ended-event IDs to their localized headers and bodies, then opens a confirm-only popup with the localized `buttonOk` label (`../../../cosmicForge/cosmicForge/ui.js:15390-15429,15448-15495`). The corresponding `modalEvent*EndedHeader` and `modalEvent*EndedText` entries exist in all six `localization.json` locale blocks.

MIAPLACIDUS emits the preference-enabled five-second informational toast before enqueueing a separate result dialog for each expiry, matching Cosmic Forge's callback order (`showNotification` before `showEventModal`; `events.js:110-188`). The dialog is localized independently of the toast preference; it waits for another open dialog to close, presents one queued result at a time, and returns focus after the queue finishes. Native dialog Escape/cancel and the localized OK button dismiss an entry. No simulation or event-timing rule changed in this slice.

The six-locale result catalogue in `src/i18n/randomEventEndDialogMessages.ts` preserves the source titles, summary text, green-ready result text, and `buttonOk` label. The source placeholders `{rocketName}` and `{itemName}` are adapted to the renderer's `{name}` after the event target is resolved. A static comparison of the 30 localized titles, summaries, and named results against the six source locale blocks found no wording mismatches. The independent static review found no issue in the queue, focus handling, notification gate, or locale routing.

Rendered browser review and the broader P-44 catalogue crosswalk remain open. No tests, builds, typechecks, formatters, or browser checks were run; P-44 remains open.
