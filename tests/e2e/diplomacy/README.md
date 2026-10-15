# Diplomacy browser tests

This area owns standalone envoy outcomes on the Colonise page: successful and
failed vassalization, both bully outcomes, and forced entry into war. The
mixed hostile battle, rebuild, and settlement journeys remain in
[Battle](../battle/README.md).

## Focused evidence

`diplomacy.spec.ts` covers successful and failed vassalization, bully outcomes,
forced war, and a Harmony impression shift that closes the vassalization gate.
The moved cases passed 4/4 across Diplomacy and Colonise on port 6518; after
adding the impression-gate case, the complete Diplomacy folder passed **4/4 in
14.0 seconds** in installed Chrome on port 5202. No application code changed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='6518'; npm.cmd run test:e2e:focused -- tests/e2e/diplomacy/diplomacy.spec.ts tests/e2e/colonise/colonise.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output="$env:TEMP\miaplacidus-diplomacy-colonise-split-6518"
```
