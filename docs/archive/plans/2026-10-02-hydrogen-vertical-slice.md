# M-01 completion: Hydrogen-only vertical slice

**Status:** Complete, 2 October 2026.

**Gate:** M-01, F-01 through F-42. The next open gate is M-02, local saves and identity.

## Delivered

- A fresh named run opens from a localized start screen into a semantic nine-tab shell. Hydrogen is the only unlocked resource; the other tabs show stable, keyboard-navigable locked panes.
- The Hydrogen loop runs through typed engine commands and derived selectors: collect 1 Hydrogen, display stock/cap/rate/value, sell stock, buy storage, and buy/pause one Hydrogen compressor. Starting values are $10, 50 RP and 0/150 Hydrogen; sale is $0.02/unit; first storage costs 149 and doubles cap to 300; the compressor costs 50 and produces 2/s. Repeated compressor price ceiling yields 50, 57, 65.
- Affordable/disabled states come from selectors. Purchases reject atomically. The shared precision and ordered resource transaction are exercised by pure tests.
- English, Spanish, Portuguese, German, Italian and French first-slice messages use stable keys. Catalogue keys/placeholders match and browser switching was exercised in all six languages.
- Playwright test configuration and a local test server, deterministic seed/locale fixture, storage clearing, external-request/page/console capture, area tags, failure artifacts, test-only clock/scenario gateway, command replay log, and searchable read-only variable view are present.
- The Test Lab's stock scenarios dispatch normal engine commands. Clock advances preserve the engine's bounded catch-up semantics. The production build has no DebugTools output chunk, scenario installer or `miaplacidusTest` gateway identifier.
- A 390px viewport check with long German labels and a repeatable fresh-screen performance baseline are recorded. The late-game target fixture is designed in [`tests/fixtures/README.md`](../../../tests/fixtures/README.md).

## Source and rule contract

The first Hydrogen resource, its initial state and sale value are recorded in [`foundation-economy.md`](../../audit/foundation-economy.md), with reference data from Cosmic Forge `resourceDataObject.js`. The source behavior for collection, sale, storage and repeated price calculations is recorded against `game.js`; its Hydrogen compressor values and starting prices are in the same catalogue. Pane identity/navigation context is in [`foundation-source-contract.md`](../../audit/foundation-source-contract.md). The implementation rebuilds the UI and does not copy the original giant runtime modules.

There is no player-visible rule difference in this slice. Sale retains the source fractional-remainder settlement rule: after selling whole units, a remainder under one is cleared. The nine-tab visual shell, typography, Hydrogen art and icon are new MIAPLACIDUS presentation.

## Verification

Focused unit command:

```text
npm run test:unit:focused -- tests/unit/hydrogen.spec.ts tests/unit/foundation-engine.spec.ts
11 tests passed across 2 files.
```

Focused browser specs on 2 October 2026: **8 passed** across `app-boot` (4), `resources` (2), `autobuyers` (1), and `performance` (1). The recorded machine used Chrome `153.0.8010.12`, seed `314159`, locale `en`; a separate local `dev:test` server on port 4173 was started and reused by Playwright for a clean run exit. The same fixtures assert the app sends no request outside its local origin and reports no page or console errors.

```text
npm run test:e2e:focused -- tests/e2e/app-boot/hydrogen-boot.spec.ts tests/e2e/resources/hydrogen-loop.spec.ts tests/e2e/autobuyers/hydrogen-compressor.spec.ts tests/e2e/performance/hydrogen-baseline.spec.ts --workers=1 --reporter=list
8 passed (12.8s)
```

The local test run used `MIAPLACIDUS_BROWSER_CHANNEL=chrome` and `MIAPLACIDUS_DISABLE_VIDEO=1` because this machine has system Chrome but not Playwright's bundled Chromium/ffmpeg. The config retains Playwright's default failure screenshot/trace/video behavior when those binaries are available.

### Visual E2E follow-up

After reproducing a plain-white page from VS Code Live Server, the HTML entry was corrected to use a relative module path and now keeps a dark startup screen visible. If the app has not mounted after four seconds, it shows the `npm run dev` instructions. The application also marks its mounted surface for the browser smoke check.

Eight focused player-flow browser tests passed in Chrome 153.0.8010.12: `app-boot` (5), `resources` (2), and `autobuyers` (1). They use real form, tab, collect, sell, storage and compressor controls, compare eleven checked-in screenshots, and attach each captured image to the Playwright report. The startup failure-path test emulates an uncompiled module response and confirms the guidance replaces the blank page. `npm run typecheck` passed; the full suite was not run.

The focused checks `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run check:boundaries` and `npm run build` passed. The production output contained a single app JavaScript bundle and no debug code chunk/gateway identifier. The full test suite was not run.

### Fresh-screen baseline

Chrome `153.0.8010.12`, seed `314159`, locale `en`, viewport `1280x720`, 5.067 seconds: **306 frames / 60.40 FPS**, **9.24 MiB heap used / 13.35 MiB total**, **1,270 DOM nodes**, and **210 event listeners**. This is a local reference point; it is not a cross-browser or late-game threshold.

## Scope boundary

M-01 proves a playable first Hydrogen slice and initializes a named run ready for later save serialization. Save-slot selection, persistence, export/import and migrations remain M-02. All other resources, buyers, research progression, technology, energy, compounds, maps, rebirth, endgame, themes, audio, and broad mobile/browser release coverage remain open. The parity ledger records this partial evidence and leaves all broad feature rows open.
