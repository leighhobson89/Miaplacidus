# Compounds E2E coverage

Compounds is a separate Cosmic Forge source area and has its own focused runner directory. The P-05 mobile-action case visits each compound page and exercises its visible create, sell, storage, and autobuyer controls with touch and keyboard input.

## Deterministic setup

The spec starts a clean `storage-all` fixture, then uses the test-only engine gateway to grant deterministic stock and room for one create action. It verifies that the auto-create toggle changes state before buying or creating. Test stock is prepared through the engine boundary; gameplay outcomes are checked through visible controls and state changes.

Run with:

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/compounds/p05-compound-actions.spec.ts
```

## Focused result — 14 October 2026

The P-05 case passed **1/1 in 11.9 seconds** in installed Chrome on port 6553. The Resources and Compounds split then passed together in default Chromium, **2/2 in 21.6 seconds** on port 6554. Both widths (320px and 390px) stayed within the viewport, and every measured interactive target met the 44px minimum. Output is under `%TEMP%\miaplacidus-p05-compounds-6553` and `%TEMP%\miaplacidus-p05-resource-compounds-6554`.


## Economy catchall migration (14 October 2026)
Compound-owned cases from the retired Economy catchall now live in [`economy-compounds.spec.ts`](economy-compounds.spec.ts), [`economy-compounds-navigation.spec.ts`](economy-compounds-navigation.spec.ts), [`p45-compound-result-locale.spec.ts`](p45-compound-result-locale.spec.ts), and [`p45-water-storage-shortfall-locale.spec.ts`](p45-water-storage-shortfall-locale.spec.ts).

The canonical Compounds folder passed **8/8** in installed Chrome on 14 October 2026, with snapshot updates disabled.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6429'
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/compounds
```
