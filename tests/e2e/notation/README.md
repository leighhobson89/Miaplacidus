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

Run these cases with:

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/notation --project=chrome --workers=1 --retries=0
```

Historical results and scenario notes are retained in the [economy README](../economy/README.md).
