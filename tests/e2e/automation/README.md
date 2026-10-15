# Production allocation browser coverage

`allocation-input.spec.ts` covers the Hydrogen production-allocation control:
its accessible help, keyboard adjustment, touch dragging, share boundaries, and
phone-width fit. Autobuyer purchase and production behavior remains in the
[Autobuyers area](../autobuyers/README.md).

`p7-autobuyer-help-locales.spec.ts` follows the Hydrogen Autobuyers section in
the real game UI through all six locales. It checks the source-routed Hydrogen
Compressor label (`autoBuyerNameHydrogenCompressor`) and purchase control, plus
the routed `optionDescHydrogenAutoBuyer1Content1` description in
`#hydrogen-autobuyer-help`. Setup uses the shared fresh-game fixture and
changes language through Settings. **NOT RUN**; execution is deferred to Phase
8.

Run it with:

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/automation/allocation-input.spec.ts --project=chrome --workers=1 --retries=0
```

Historical case notes are retained in the [economy README](../economy/README.md).
