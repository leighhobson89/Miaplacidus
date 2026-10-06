# Weather overlay browser coverage

`weather-overlay.spec.ts` drives deterministic rain and volcano weather through
the test command boundary. It checks the overlay is a viewport-fixed,
`aria-hidden` canvas, and reads rendered canvas pixels to confirm rain uses the
active theme text color while lava uses the source orange. A transition journey
checks that changing weather, turning weather effects off, and enabling reduced
motion clear the canvas and stop its animation frames; re-enabling each setting
restores the effect.

The animation is sampled directly instead of being pinned to a screenshot: its
particle positions intentionally vary by run, so a screenshot baseline would
be unstable. On 5 October 2026, the focused system-Chrome run passed both
browser cases (2/2).

Run the focused area in system Chrome with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- tests/e2e/weather/weather-overlay.spec.ts --workers=1
```

Source trajectories are pinned separately in `tests/unit/weather-particle-geometry.spec.ts`: rain crosses one viewport width diagonally and lava stays in its source column. That focused unit file passed 2/2 after a source comparison corrected the X paths on 5 October 2026.
