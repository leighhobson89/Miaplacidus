# Antimatter browser tests

This area owns the Antimatter economy behavior that is separate from asteroid selection, mining-page layout, and Rocket travel. The focused case holds the visible Mining boost with the keyboard, verifies the extraction rate doubles while held, then checks that Antimatter gained is removed from the target asteroid.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npx.cmd playwright test tests/e2e/antimatter/antimatter.spec.ts --workers=1
```

Asteroid targeting and the Mining page's localized presentation remain in [`space-mining`](../space-mining/README.md). Pure extraction formulas remain covered by `tests/unit/space-rules.spec.ts`.

14 October 2026 source-parity follow-up: after correcting F-type mining to use the current system star, this focused Antimatter spec passed **1/1 in installed Chrome** against the shared rate/extraction path. The dedicated current-star behavior case lives in [`star-types`](../star-types/README.md). `npm run typecheck` also passed after the change.
