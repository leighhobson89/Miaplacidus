# Energy browser coverage

Energy-only browser cases live here. Cases that exercise Energy alongside
Research or other systems remain in the cross-area [economy coverage](../economy/README.md).

- `energy-presentation-matrix.spec.ts` covers Energy page identity, ordering,
  artwork, bounds, power switch states, and desktop/phone captures.
- `p45-energy-locales.spec.ts` covers localized Energy purchase reasons and grid-trip feedback.

Run this area with:

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/energy --project=chrome --workers=1 --retries=0
```

The Energy matrix snapshots are in
[`energy-presentation-matrix.spec.ts-snapshots/`](energy-presentation-matrix.spec.ts-snapshots/).
Historical review notes and exact earlier commands remain in the economy README.
