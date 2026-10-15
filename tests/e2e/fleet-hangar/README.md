# Fleet Hangar browser tests

This area owns standalone Fleet Hangar purchase and interaction journeys.
Starship launch, Colonise, diplomacy, and shared Interstellar navigation
journeys remain in `../starship/`.

## Current coverage

- Envoy affordability: visible shortfall reason, one-unit recovery, enabled build, and exact payment.
- Fleet-unit affordability: Scout shortfall reason, one-unit recovery, enabled build, and exact payment.
- Keyboard access: Tab order, visible keyboard focus, Enter activation, and minimum control size.
- Touch access: Scout construction at 390px, minimum target size, and no horizontal overflow.

These test blocks moved from `starship/starship.spec.ts` without changing
assertions. The source spec has no snapshots used exclusively by the
extracted tests.

## Run

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/fleet-hangar/fleet-hangar.spec.ts
```

No tests were run during this structural move. The Envoy construction and
follow-up message/harmony scenario remains in the Starship spec because it
also exercises Colonise diplomacy. The P-15 landmark and panel association
journey remains there because it validates Star Map and Fleet Hangar
navigation together.

14 October 2026 P-66 canonical visual split: the Fleet Hangar desktop and phone
capture case and its two snapshots now live in this area. It passed 1/1 in the
focused three-area installed-Chrome run on port 6517; both snapshots matched
without updates. The Starship/Fleet/Colonise heading alignment assertions were
preserved.
