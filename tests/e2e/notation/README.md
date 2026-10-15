# Number and time notation browser coverage

Cross-screen tests whose subject is the selected number/time notation live here.
The source screens remain distinct in the application; these specs share the
notation behavior they verify.

- `p41-building-currency-costs.spec.ts` and `p41-building-buymax-currency-costs.spec.ts`
  cover building cash prices and Buy Max totals across all three notations.
- `p41-compound-sale-currency.spec.ts` and `p41-hydrogen-sale-notation.spec.ts`
  cover accepted sale previews/results across all three notations.
- `p41-timer-presentation.spec.ts` covers Rocket, Starship, and Space Mining
  countdowns and ETAs across all three notations.
- `p41-statistics-notation-layout.spec.ts` covers Resource Stock, Lifetime Cash,
  and Active Time in all three notations at 320px without document, pane, or card
  overflow.

Run these cases with:

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/notation --project=chrome --workers=1 --retries=0
```

Historical results and scenario notes are retained in the [economy README](../economy/README.md).


## Economy catchall migration (14 October 2026)
Economy notation and number-format cases now live in [`economy-notation.spec.ts`](economy-notation.spec.ts). Achievement reward and notice notation remains in [Achievements](../achievements/README.md).

## Focused area verification (14 October 2026)

The complete Notation folder passed **14/14** in installed Chrome on 14 October
2026 (27.5 seconds, port 6444), with snapshot updates disabled. Diagnostic
Rocket artwork captures were written only under `%TEMP%`.
