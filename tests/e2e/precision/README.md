# Precision browser coverage

`hydrogen-sale-currency-precision.spec.ts` checks that a binary-tail sale
amount is rounded consistently in the visible preview and accepted-sale notice.

Run it with:

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/precision/hydrogen-sale-currency-precision.spec.ts --project=chrome --workers=1 --retries=0
```

Historical case notes are retained in the [economy README](../economy/README.md).
