# Phase 6 Handoff — updated 6 October 2026

## Resume objective

Continue Phase 6 of `docs/plans/build-checklist/06-presentation.md` until its open presentation, source-parity, and verification items are complete or the owner asks to stop. The owner explicitly asked for work to be parallelized through the project agents, and `IncrementalGame/AGENTS.md` requires using them for independent slices at each continuation. The latest owner message was “continue”; Phase 6 remains active and incomplete.

The user especially cares that screens and child pages stay on the right tabs, retain the source order, and that standalone destinations such as Galactic Casino are not incorrectly made main tabs. Cosmic Forge is available in the adjacent `cosmicForge/cosmicForge` folder for local source comparisons.

## Current presentation requirements

The Event item in the status panel uses the static label **“Last Event / Ongoing Event”** in English, including when its value is `None`; other locales are translated. The current value is the active timed event or, otherwise, the most recent event from the Settings tracker. The status browser area passed 3/3 in system Chrome.

Keep the ten top-level tabs in fixed source order with locked tabs omitted, tab names without numbers, Galactic Casino under Galactic, Star Data under Interstellar, and each Rocket child tab hidden until its rocket is built. Miaplaedia follows Settings and contains the seven guides. The remake uses **Miaplacidus** and the player name **Mia'Plac**; “Cosmic Forge” is the read-only reference game's name. In themed text discussions use the owner's roles `normal text`, `green-ready text`, `red-disabled text`, and `orange-warning text`.

## Recent completed work and verification

- Weather rain/lava overlay: `src/app/WeatherEffectsOverlay.tsx` uses a fixed, pointer-ignoring canvas and bounded particle pool; `src/app/weatherParticleGeometry.ts` matches source trajectories. Focused system Chrome weather area passed **2/2**; geometry unit coverage passed **2/2**.
- Header/status area: AP/CP/GP progression gates and order, localized full-name tooltips, RP source-rate tooltip, static event label/value, and location/weather. Focused unit coverage passed **4/4**; focused system Chrome browser area passed **3/3**.
- Page ownership audit: no confirmed mismatch. Galactic Casino remains Galactic's third child; Star Data remains under Interstellar; guides remain in Miaplaedia; Rocket child pages are revealed one by one only after construction.
- Star Data responsive capture: at 390×844 the localized scroll cue appears, the table region is focusable and keyboard-scrollable, horizontal scrolling stays within that region, and the page has no horizontal overflow. The focused Chrome case passed **1/1** during snapshot generation and again without updates; mobile and desktop screenshots were reviewed.
- Rocket 1 capture: the focused assembly/fuel journey passed **1/1** during snapshot generation and again without updates. Desktop and 390×844 screenshots were reviewed; the mobile card stays within the Space Mining pane without page overflow.
- Save startup: the last loadable pioneer is preselected and immediately shows `RESUME GAME <Pioneer Name>`. The full serial Chrome save-slot area passed **13/13** after refreshing stale screenshots to the current Hydrogen layout. The new startup capture was reviewed. The portable-save check now validates exported envelope identity and Hydrogen balance across an advancing live clock.
- Other current screenshots reviewed include separate Research buildings and Tech Tree pages, Galactic Market, and Hydrogen/Fusion states. Research page ownership is correct: buildings and automation under Research; graph only under Tech Tree.
- `npm.cmd run typecheck`, focused `oxfmt --check` for changed TS/TSX specs, and `git diff --check` passed. The full test suite was not run.
- The working tree is broadly modified from the ongoing Phase 6 effort and has not been committed. Preserve all existing work; inspect `git status` before editing and do not reset/revert broad changes.

## 6 October continuation handoff

The latest owner updates are in [`06-presentation.md`](06-presentation.md) and [`open-decisions.md`](../open-decisions.md). Compounds now follows Resources as the second visible top-level tab whenever unlocked; the other tabs retain declaration order and locked tabs remain hidden. Space Mining's weather summary is shown only on Launch Pad. Precipitation rate and this-run total live in the localized top-screen weather tooltip. The Telescope E2E assertion has been updated; `npm.cmd run typecheck` passed, but the focused browser case was not run.

## Current owner task: Resource and Compound layout parity

The owner narrowed the current scope to the Resource and Compound layouts, then asked to stop. This slice is complete under **P-63** in [`06-presentation.md`](06-presentation.md); Phase 6 overall remains open. Do not continue unrelated Phase 6 work in this handoff.

Hydrogen is the approved layout reference. Compare all eight Resource child pages—Hydrogen, Helium, Carbon, Neon, Oxygen, Sodium, Silicon, and Iron—and all six Compound child pages—Diesel, Water, Glass, Concrete, Steel, and Titanium—against it. Preserve each page's product-specific recipe, collection/creation, storage, automation, sale, and fusion actions where applicable.

`App.tsx` mounts a shared `EconomyRail` in the left column for Resources and Compounds, shows the matching rail for the selected top-level tab, and keeps their item selection and collapsed groups separate. The rail items open their corresponding Resource/Compound child pages. `EconomyPanes.tsx` shares `EconomicGoodHero` and the Hydrogen-style storage-card pattern across the material and compound detail pages, while retaining each good's recipe/create/collect, automation, sale, and fusion behavior where applicable.

**Final focused verification (6 October): passed.** The exact focused Chrome command below passed 1/1 on the final no-update run in 17.0 seconds; the preceding `--update-snapshots=all` run also passed 1/1. It visits all eight Resource and six Compound panes at desktop and 390×844, checking shared hero/labels, selling and fusion where applicable, storage placement/width, panel order, rail position/selection, and no horizontal overflow. All three checked-in snapshots—desktop Materials, desktop Compounds, and 390px Compounds—were reviewed. The art and labels follow Hydrogen's treatment and the mobile layout fits. Typecheck, targeted `oxfmt`, and `git diff --check` passed. The separate six-locale economy sweep checks every Resource heading/hero and Diesel, but does not cover all Compound panes in six locales. The exact command and full acceptance summary are recorded in P-63; broader P-56 screenshot coverage remains open. This requested layout task is complete; stop here. Phase 6 remains open for its other checklist items.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/economy/economy.spec.ts -g "material and compound pages share the Hydrogen layout" --workers=1
```

Other open Phase 6 items remain on the master phase checklist. The current owner instruction narrows this continuation to the layout slice above; do not continue other unrelated tasks before stopping at its requested checkpoint.

## Remaining Phase 6 work

The checklist in `06-presentation.md` is authoritative; do not infer sign-off from this summary. Its exit gate is still open. A read-only audit identified these work groups:

- **P-05/P-06:** finish action reachability and selector-backed costs, rates, requirements, result previews and disabled-reason coverage.
- **P-10/P-11–P-22:** complete a natural later-game path and responsive-density review; finish keyboard/touch-only paths, screen-reader landmarks and announcements, dialog/toast focus return, zoom, text expansion and soft-keyboard checks.
- **P-28–P-34/P-41–P-42:** complete source cue-to-audio/volume review, reduced-motion/effect review, ending/art review, asset/bundle sizing, production-bundle scan, and numeric precision/timer inventory.
- **P-36/P-38:** add progression-wide tutorial step resumption and “current goals / next unlock” guidance beyond the first-run briefing that the owner removed.
- **P-44–P-53:** validate six-locale completeness and runtime switching, placeholders/rich text/fallbacks, dynamic/plural/date/timer formatting, expanded-layout clipping, representative translations and owner translation approval.
- **P-54/P-55:** finish focused areas with clean exits where previous Playwright runs hung; cover onboarding, notation, notification suppression and navigation paths; resolve remaining source Statistics row/value/scope parity and owner semantics in `docs/plans/statistics-presentation-parity.md`.
- **P-56/P-58–P-61:** broaden screenshots across tabs, 9 themes, 6 locales and phone/tablet/desktop; review ticker frequency, translation quality, reduced motion and effects; continue status-strip accessibility, Tech Tree small-screen/path readability and live-value background-throttling review.

This continuation corrected two stale records: P-35 now reflects the auto-preselected last save and its 13/13 browser rerun; the navigation contract now documents the current weather → AP/CP/GP → cash order and current event label instead of the old Glory Points wording. The audit also found no fresh tab/pane ownership mismatch.

At the start of each continuation, check agent capacity and role definitions, delegate independent slices as required by `IncrementalGame/AGENTS.md`, and keep their scopes non-overlapping. Run focused tests for touched areas; ask the owner before any full test-suite run.

## Useful focused commands

Run from `IncrementalGame/` using system Chrome (already available; no browser binary installation needed):

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
npm.cmd run test:e2e:focused -- tests/e2e/weather/weather-overlay.spec.ts --workers=1
```

The weather command passed 2/2 in this session. The status browser area is `tests/e2e/status-bar/status-bar.spec.ts`.
