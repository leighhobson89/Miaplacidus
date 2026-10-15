# Onboarding E2E coverage

The focused onboarding case checks the progression tutorial's technology explanation and its two read gates. It seeds a clean local run, advances to the technology-options step through the test command boundary, and uses the visible tutorial and Tech Tree controls to verify that each explanation must be read before continuing.

## P-36 saved regression recovery — 14 October 2026

The saved full-run failure was a strict-locator ambiguity: the explanatory sentence appeared both in the tutorial paragraph and in the screen-reader live announcement. The current spec uses an exact text match, which selects the visible tutorial paragraph. The focused Chrome rerun passed **1/1 in 7.8 seconds** on port 6550. No application or test change was needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_TEST_PORT='6550'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npm.cmd run test:e2e:focused -- --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output="$env:TEMP\miaplacidus-onboarding-p36-6550" tests/e2e/onboarding/progression-tutorial.spec.ts --grep '@p36'
```
