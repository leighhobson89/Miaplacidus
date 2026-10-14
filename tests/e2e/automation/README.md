# Production allocation browser coverage

`allocation-input.spec.ts` covers the Hydrogen production-allocation control:
its accessible help, keyboard adjustment, touch dragging, share boundaries, and
phone-width fit. Autobuyer purchase and production behavior remains in the
[Autobuyers area](../autobuyers/README.md).

Run it with:

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/automation/allocation-input.spec.ts --project=chrome --workers=1 --retries=0
```

Historical case notes are retained in the [economy README](../economy/README.md).
