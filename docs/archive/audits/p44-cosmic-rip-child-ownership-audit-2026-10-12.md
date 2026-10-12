# P-44 Cosmic Rip child ownership audit — 12 October 2026

## Source and remake page mapping

Cosmic Forge defines three separate Cosmic Rip options in [`index.html`](../../../../cosmicForge/cosmicForge/index.html#L776-L792): Situation (`option1`), Near Space Scanner Array (`option2`), and Cosmic Rip (`option3`). MIAPLACIDUS preserves those three destinations in `src/app/presentationNavigation.ts:516-544`, and `src/app/App.tsx:2896-2915` renders the selected child through `CosmicRipPane`.

The source's [`drawTab8Content.js`](../../../../cosmicForge/cosmicForge/drawTab8Content.js#L98-L305) keeps scanner restoration, current-status controls, and the Close Cosmic Rip row on Situation. [`game.js`](../../../../cosmicForge/cosmicForge/game.js#L1625-L1656) reveals that close row after all five technologies are researched and reflects Galactic Point affordability there. Near Space Scanner Array owns both the sector scanner (`:307-558`) and the Sensor Buoy and Rip Research Orbiter rows (`:559-643`); those telemetry upgrades appear after the array is restored and the Rip is located (`:643-645`). The Cosmic Rip option owns the stabilization progress and five technology rows (`:842-1109`).

The remake had placed the telemetry network cards and final close control under its Cosmic Rip child. Telemetry cards are now rendered after the sector controls in `src/app/CosmicRipPane.tsx:332-437`, gated by the same restored-scanner parent branch and `ripFound` check. The final close control and remake ending state are now on Situation (`src/app/CosmicRipPane.tsx:243-312`); the control is gated on all five technologies and uses the same affordability reason as before. The Cosmic Rip child owns its technology research (`src/app/CosmicRipPane.tsx:470-561`). This preserves the source ownership boundary while retaining the remake's accessible controls and upgrade descriptions.

## Localization and copy review

Reviewed the source pane labels, header tooltips, row names, statuses, and notices in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json) for `en`, `es`, `pt`, `de`, `it`, and `fr`, alongside the rendered strings in `src/i18n/cosmicRipMessages.ts`. The remake routes the Situation, scanner, and Cosmic Rip headings and help through the localized pane catalog; section headings, sector status, costs, upgrade/technology names, action labels, progress, and failure messages are also localized. Cosmic Forge closure uses separate `modalCosmicRipClosedHeader` and `modalCosmicRipClosedText` keys (`drawTab8Content.js:252-255`); MIAPLACIDUS now preserves that heading/body split with six-locale `closedTitle` and `closed` values. The body keeps the owner-directed player identity `Mia'Plac` instead of the source's “Cosmic Forger.”

The tooltips remain attached to the matching destination/content: Situation help to Situation, scanner instructions to Near Space Scanner Array, and stabilization/technology help to Cosmic Rip research. The target uses concise remake copy rather than reproducing the legacy tooltip paragraphs verbatim.

## Scanner state after locating the Rip

Cosmic Forge defines nine locale-independent sector IDs in `drawTab8Content.js:422-428`: `MIAPLAC-7411`, `MIAPLAC-7412`, `MIAPLAC-7413`, `MIAPLAC-7422`, `MIAPLAC-7423`, `MIAPLAC-7424`, `MIAPLAC-7432`, `MIAPLAC-7433`, and `MIAPLAC-7434`. A successful scan disables the interactive overlay (`:463-470`); the one-sector view shows the found sector's exact ID (`:762-780`). The target now keeps those IDs in `src/content/cosmicRip.ts`, displays them on the scanner controls and found-sector view, and renders only the found sector after discovery (`CosmicRipPane.tsx`). After discovery, the engine rejects scans of any remaining sector with a localized already-located reason (`engine/cosmicRip.ts`; `i18n/cosmicRipMessages.ts`); duplicate scans retain their existing already-scanned reason. Neither command can spend additional Galactic Points.

## Evidence limits

This is a static comparison of the read-only source UI and current MIAPLACIDUS renderer. No browser session, tests, build, or typecheck was run for this slice. The focused ownership and source-copy corrections do not close P-44 or alter its estimate.
