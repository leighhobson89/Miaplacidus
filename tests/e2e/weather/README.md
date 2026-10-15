# Weather overlay browser coverage

`weather-overlay.spec.ts` drives deterministic rain and volcano weather through
the test command boundary. It checks the overlay is a viewport-fixed,
`aria-hidden` canvas, and reads rendered canvas pixels to confirm rain uses the
active theme text color while lava uses the source orange. A transition journey
checks that changing weather, turning weather effects off, and enabling reduced
motion clear the canvas and stop its animation frames; re-enabling each setting
restores the effect.

`weather-energy-effects.spec.ts` also reads the player-visible Energy chart after
changing weather. It verifies that cloudy, rainy, and volcanic conditions scale
solar output to 60%, 40%, and 5% of clear-weather output.
Its rain case advances five simulated seconds, checks the collected-precipitation
total and Water stock, and verifies the current rain rate in the focused location
tooltip.

The animation is sampled directly instead of being pinned to a screenshot: its
particle positions intentionally vary by run, so a screenshot baseline would
be unstable. On 5 October 2026, the focused system-Chrome run passed both
overlay cases (2/2). On 14 October 2026, the new weather-effects spec passed
both cases (2/2 in 8.1 seconds) on port 6754. The complete focused Weather area
then passed **4/4 in 11.2 seconds** on port 6755 in installed Chrome.

Run the focused area in system Chrome with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- tests/e2e/weather --workers=1
```

Source trajectories are pinned separately in `tests/unit/weather-particle-geometry.spec.ts`: rain crosses one viewport width diagonally and lava stays in its source column. That focused unit file passed 2/2 after a source comparison corrected the X paths on 5 October 2026.
