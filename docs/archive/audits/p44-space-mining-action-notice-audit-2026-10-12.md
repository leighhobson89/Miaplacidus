# P-44 Space Mining action-notice audit — 12 October 2026

## Scope and source evidence

Compared the Cosmic Forge Space Mining UI and event call sites with MIAPLACIDUS's Rocket, Asteroid, and Launch Pad notification routes. Cosmic Forge's Launch Pad button sends `notificationLaunchPadBuilt` when construction succeeds (`drawTab6Content.js:621-653`). Its source game sends asteroid-search failure and ordinary/Legendary discovery notices from `game.js:13681-13715`; Legendary is the source `specialName` state set for Legendary asteroids by `generateAsteroidData()` (`game.js:13751-13874`). Rocket notices are sent when fuel is ready (`game.js:13097`), when a Rocket launches (`game.js:13226`), and when travel completes at an asteroid or returns for refuelling (`game.js:11104-11107`).

Rocket travel start is different: `startTravelToAndFromAsteroidTimer()` changes the Rocket's local progress description to the localized `textTravellingProgress` or `textReturningProgress` (`game.js:11061-11128`). It does not call `showNotification` at that boundary. The global notices appear only when that timer completes.

## Remake routes and correction

MIAPLACIDUS routes Launch Pad construction, asteroid scan failure/discovery, Rocket launch/fuel readiness, and Rocket arrival/return through `spaceEventNotifications.ts` and the six-locale `spaceNotificationMessages.ts` catalogue. The eight corresponding source-backed catalogue values match the source `localization.json` values in all six locales (48 values), after adapting `{rocketName}` to `{rocket}` and `{destination}` to `{asteroid}`. The Legendary notice uses the remake's `rarity === "legendary"`, which is equivalent to the source `specialName` check because source special names are assigned only to Legendary asteroids.

Before this slice, `space.rocket.travel-started` also produced a global toast saying the Rocket was travelling to or returning from an asteroid. The Rocket page already sets local accepted-action feedback and shows its travel timer/progress; Cosmic Forge likewise keeps progress in the Rocket's inline description. Removed the extra global toast route and its two unused catalogue keys across all six locales. The engine travel-start event remains available to other consumers.

No source files were changed. No tests, builds, typechecks, or browser checks were run.
