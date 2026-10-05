# Status bar browser coverage

`status-bar.spec.ts` checks the event stat's static label and `None`, active,
and last-recorded values and tooltips in all six locales. A deterministic
Science Kit purchase verifies the `RP` tooltip names Research Points and shows
per-second production by source. It verifies AP is always available, CP appears
with the Galactic progression fixture, and GP appears with the Cosmic Rip
fixture. Each balance exposes its full localized points name on keyboard focus;
the order remains AP, CP, GP, cash, RP. A 320px viewport checks that the status
cards and page remain within the viewport.

On 5 October 2026, the focused system-Chrome run passed all three cases (3/3),
including six-locale event labels and AP/CP/GP tooltip names.

Run only this browser area in system Chrome with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- tests/e2e/status-bar/status-bar.spec.ts --workers=1
```
