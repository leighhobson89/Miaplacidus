# Colonise browser tests

This area owns the independent Colonise page, scan report, settlement, and
diplomacy journeys. The page is available after a destination scan produces an
encounter; Starship and Fleet Hangar construction remain in their own areas.

## P-66 visual review

`phase6-interstellar-visual-review.spec.ts` captures Colonise at 1280px in
Terminal and 390px in Light, checks the surface illustration, and verifies the
heading aligns with the launched Starship page. Its two snapshots are stored
beside the spec. The focused three-area installed-Chrome run passed **3/3 in
16.3 seconds** on port 6517, including Colonise 1/1. Both Colonise snapshots
matched without updates. The fixture scans the selected destination to create
the encounter that exposes Colonise; no production code changed.

## Unoccupied arrival settlement

`colonise.spec.ts` verifies that an unoccupied arrival can be settled without
opening battle, and that the saved destination and Ascendency award update
correctly. The case moved from the mixed Battle spec with its fixture setup and
assertions unchanged. It passed **1/1** in the focused four-case installed-
Chrome run on port 6518; no application change was needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='6518'; npm.cmd run test:e2e:focused -- tests/e2e/diplomacy/diplomacy.spec.ts tests/e2e/colonise/colonise.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output="$env:TEMP\miaplacidus-diplomacy-colonise-split-6518"
```
