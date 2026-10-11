# Rebirth

The browser area checks a rebirth through the visible Tab 7 confirmation, verifies the exact reset/carryover (including the source rule that casino points reset to zero) and next-system identity, then saves/reloads through the ordinary local slot flow. The deterministic rebirth fixture enters with one completed run, a newly settled destination and 12 casino points.

Focused commands: `npm run test:unit:focused -- tests/unit/meta-progression.spec.ts` and `npm run test:e2e:focused -- tests/e2e/rebirth/rebirth.spec.ts`.

Verification: meta-progression unit tests passed (15/15); Chrome rebirth scenario passed (1/1) on 4 October 2026. The browser case verifies that 12 CP clears to zero and stays zero after save/reload.

**P-16 focus follow-up (9 October 2026):** the Rebirth confirmation now
explicitly returns keyboard focus to its Rebirth trigger after either Cancel
or Escape. The focused installed-Chrome case passed 1/1 on port 4256 after the
test exposed the missing restoration and a small trigger-ref fix was added.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4256'
npm.cmd run test:e2e:focused -- tests/e2e/rebirth/rebirth.spec.ts -g '@p16-focus' --workers=1 --retries=0 --trace=off --reporter=line
```

The P-16 follow-up also exercises accepted Rebirth: after the run resets,
focus moves to the Hydrogen tab, the first page of the new run. Cancel and
Escape continue to restore the Rebirth trigger. The combined installed-Chrome
P-16 batch passed 9/9 selected routes in 29.8 seconds on port 4261.

**P-45 Rebirth confirmation locale coverage (10 October 2026):**
`p45-rebirth-confirmation-locales.spec.ts` uses the deterministic
`meta-rebirth-ready` fixture and keeps the real confirmation open while
switching through all six locales. It checks the localized Rebirth trigger,
dialog title and prompt, AP carryover amount, Confirm and Cancel labels, then
confirms once and verifies dialog closure, focus on Hydrogen, rebirth count
increment, settled-destination retention, AP carryover, and Casino Points
reset. Installed Chrome passed **1/1 in 7.0 seconds** on isolated port 5650;
typecheck and focused Oxfmt passed. No application change was needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5650'
npm.cmd run test:e2e:focused -- tests/e2e/rebirth/p45-rebirth-confirmation-locales.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-rebirth-locales-5650
```
