# M-02 completion record — local saves and identity

**Date:** 2 October 2026  
**Status:** complete for the Hydrogen vertical slice.  
**Gate:** [M-02](../../plans/master-checklist.md); detailed tasks [S-01–S-58](../../plans/build-checklist/02-local-saves.md).

## Delivered

- Versioned, strictly validated v1 save envelopes with integrity checks, durable engine state and a synthetic v0-to-v1 migration path.
- Namespaced local storage with immutable payload generations, readback validation, atomic head commits, index rebuilding, last-started metadata, quota/security handling and corruption recovery.
- Independent pioneer slots with normalized duplicate-name checks, last-pioneer prefill and a Confirm/Start flow that loads only the confirmed selection.
- Autosave status and controls, timer persistence, explicit save, lifecycle saves, cross-tab single-writer ownership and conflict recovery.
- LZString local and portable codecs; consistent text, clipboard and `.txt` export; validated import preview with replace/new/cancel choices.
- Localized save controls, save manager, startup recovery and temporary unsaved play with export when browser storage is unavailable.
- A localized first-run Hydrogen briefing for fresh slots; its per-slot completion survives reload, resumed/imported/cloned slots skip it, and automatic saves pause until it is completed.
- Player-click browser flows with screenshot checkpoints and checked-in visual baselines, including reload, switching, migration, import, quota, blocked storage and concurrent-tab scenarios.

## Verification

- `$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npx.cmd playwright test tests/e2e/app-boot/hydrogen-boot.spec.ts tests/e2e/save-slots/save-slots.spec.ts --workers=1` — **17 passed** in Chrome; screenshot comparisons enabled.
- `$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npx.cmd playwright test --workers=1` — **21 passed** in Chrome across the full E2E suite; screenshot comparisons enabled.
- `npm.cmd run test:unit:focused -- tests/unit/local-saves.spec.ts tests/unit/foundation-engine.spec.ts --silent=false` — **18 passed** across 2 files.
- `npm.cmd run lint` — passed.
- `npm.cmd run format:check` — passed.
- `npm.cmd run check:boundaries` — passed.
- `npm.cmd run build` — passed; production JavaScript bundle 342.87 KB (102.95 KB gzip), CSS 21.23 KB.
- `rg -ni 'supabase|save-load-cloud|cloud.?save|save.?cloud|account.?lookup' src dist` — no matches.

The browser suite captures and compares screenshots after user interactions. Its shared checks reject a missing app surface, an all-white screen, page or console errors and unexpected external requests.

Representative compressed UTF-16 payloads measured **489**, **1,340** and **2,059 characters** for early, mid and stress-sized late envelopes. Allowing two generations at the largest measurement is about **8.1 KiB**, compared with the app's 5 MiB capacity warning estimate.

## Scope limits

The save gate is complete for the Hydrogen state currently modeled. The full tutorial and rebirth gameplay are later work; the briefing is the scoped first-run prompt required by S-25 and S-55. A fresh slot is created only on Start; an existing slot resumes its saved state. Browser tests import permanent-state fixtures with one and two rebirth counts and verify persistence, without claiming to execute M-05 rebirth behavior. No earlier MIAPLACIDUS schema has shipped, so migration coverage uses a synthetic v0 fixture. The late-size payload is a serialization stress fixture, not an endgame gameplay save. The broader `save-load-local`, `save-slots`, `save-migration` and `migration` parity areas remain partial until full-game coverage is available.
