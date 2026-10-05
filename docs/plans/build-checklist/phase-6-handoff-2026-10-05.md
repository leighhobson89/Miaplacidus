# Phase 6 Handoff — 5 October 2026

## Resume objective

Continue Phase 6 of `docs/plans/build-checklist/06-presentation.md` until its open presentation, source-parity, and verification items are complete. The user explicitly asked for work to be parallelized through the project agents and asked the agents in `IncrementalGame/AGENTS.md` to be used. The user has now asked to stop this session and resume in a new one. Do not treat Phase 6 as complete; resume from this handoff when asked.

The user especially cares that screens and child pages stay on the right tabs, retain the source order, and that standalone destinations such as Galactic Casino are not incorrectly made main tabs. Cosmic Forge is available in the adjacent `cosmicForge/cosmicForge` folder for local source comparisons.

## Latest user request

The Event item in the status panel should say **“Last Event / Ongoing Event”** instead of “Event”. This is implemented: the English static label is exact, other locales have localized equivalents, and it remains the same for `None`, active-event, and most-recent-event states. `tests/e2e/status-bar/status-bar.spec.ts` asserts the translated label in all six locales. The status browser area passed 3/3 in system Chrome.

## Recent completed work and verification

- Weather rain/lava overlay: `src/app/WeatherEffectsOverlay.tsx` uses a fixed, pointer-ignoring canvas and bounded particle pool; `src/app/weatherParticleGeometry.ts` matches source trajectories. Focused system Chrome weather area passed **2/2** after the geometry correction. Geometry unit test passed **2/2**. Browser spec and notes are in `tests/e2e/weather/` and source comparison in `docs/audit/weather-presentation.md`.
- Header/status area: AP/CP/GP gates and order, localized full-name tooltips, RP source-rate tooltip, current/last event, and location/weather. Focused unit spec passed **4/4**; focused system Chrome spec passed **3/3**. See `src/app/TopStatusBar.tsx`, `src/engine/selectors.ts`, `src/i18n/topStatusMessages.ts`, and `tests/e2e/status-bar/`.
- `docs/plans/build-checklist/06-presentation.md` now records the status-bar and weather focused browser results under P-54, P-56 and P-59. Broader screenshot, accessibility, theme/viewport, and source review is still open.
- Selected-file `git diff --check` passed. The working tree is broadly modified from ongoing Phase 6 work; these changes have not been committed. Avoid reverting or overwriting existing user/agent changes.

## Source-to-tab audit findings

The P-55 audit confirmed the remake’s main-tab order and source ownership match Cosmic Forge: Resources, Energy, Research, Compounds, Interstellar, Space Mining, Galactic, Cosmic Rip, Settings, followed by remake-only Miaplaedia. Casino remains Galactic’s third child pane; Star Data stays under Interstellar; guide documents are moved from Settings to Miaplaedia in source order. Locked main tabs are filtered without reordering the remaining tabs.

Open P-55 follow-ups from the audit:

1. **Energy generation comparison is absent.** Cosmic Forge shows stacked PP1/PP2/PP3 output against aggregate consumption on a shared axis, reflecting power state (`cosmicForge/cosmicForge/index.html:281-285`, `ui.js:updateDynamicUiContent` around 8526). The remake has numeric totals and one-plant-at-a-time rates, but no combined comparison (`src/app/EconomyPanes.tsx`, `EnergyPanel`). Recommended action: add a compact accessible HTML/CSS visualization with three generator segments and a consumption bar plus numeric values, or document an intentional redesign if that is not desired.
2. **Casino post-rebirth gate mismatch is confirmed.** Cosmic Forge exposes Casino after rebirth via its retained AP-award sentinel. The remake’s main Galactic tab and Perks appear after rebirth, but Casino pane visibility and `casinoUnlocked()` currently require AP in this run. Audit pointers: `src/app/presentationNavigation.ts:257`, `src/engine/galacticCasino.ts:108`, and existing Casino unit/E2E specs. Recommended source parity: accept `ascendencyAwardedThisRun || rebirthCount > 0` for the pane and engine actions; retain current CP reset behavior; add post-rebirth visibility/action regression coverage.
3. **Megastructures gates need edge-case verification.** Compare first special run before capture, captured structure after rebirth, and a merely settled factory system before capture. Ensure the settled-system clause does not reveal the pane earlier than source possession does (`presentationNavigation.ts:271`; source `game.js:3897, 15801`). No confirmed mismatch yet.
4. Continue progression-gated child-page verification; absence on a fresh run is expected. Casino stays a Galactic child, not a main tab.

## Work interrupted by the stop request

Two agents were interrupted immediately after the user asked to stop. Because agents share the workspace, inspect these files and `git diff` before resuming; partial edits may already be present.

- **P-08 notification/audio review:** found three issues: notifications can leak from a same-batch settings change because the provider setting updates later in an effect; rocket-return names were missing in some locale strings; ambient tracks needed cleanup when `GameSession` unmounts. At interruption, edits had landed for a synchronous settings check and audio disposal/unmount cleanup; localization strings appeared to have been corrected in all six locales. Focused unit tests and typecheck were not yet reported. Relevant files: `src/app/audio.ts`, `src/app/App.tsx`, `src/app/NotificationStack.tsx`, `src/i18n/spaceNotificationMessages.ts`, `tests/unit/audio-event-dispatch.spec.ts`, `tests/unit/space-event-notifications.spec.ts`.
- **Casino repeat-run fix:** the agent was asked to change the engine and pane gate and add a post-rebirth action/visibility regression, but was interrupted before it reported implementation. Last observed `casinoUnlocked()` still returned only `ascendencyAwardedThisRun`, and the Casino child condition in `presentationNavigation.ts` still used that current-run flag only. `tests/unit/galactic-casino.spec.ts` contains an after-rebirth blocked-action case that will likely need updating. Verify current working tree before making edits.

## Suggested next steps on resume

1. Read `IncrementalGame/AGENTS.md` and this handoff; inspect the working tree and interrupted P-08/Casino edits before changing anything.
2. Complete and verify the P-08 notification/audio fixes; run the focused notification/audio unit specs and typecheck.
3. Implement and verify the confirmed Casino post-rebirth parity fix, including a child-pane visibility and available-action regression.
4. Decide and complete the Energy chart parity item; document the implementation and focused visual verification in P-55/P-56.
5. Verify Megastructures gate fixtures and continue P-54/P-55/P-56 open items in `06-presentation.md`, keeping evidence and pending work accurate.
6. Do not sign off Phase 6 until the checklist’s remaining required source mapping, presentation review, and verification are actually complete.

## Useful focused commands

Run from `IncrementalGame/` using system Chrome (already available; no browser binary installation needed):

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
npm.cmd run test:e2e:focused -- tests/e2e/weather/weather-overlay.spec.ts --workers=1
```

The weather command passed 2/2 in this session. The status browser area is `tests/e2e/status-bar/status-bar.spec.ts`.
