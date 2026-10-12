# P-36 Dark-theme tutorial action gate - 12 October 2026

Cosmic Forge's `onboardingStepSelectDarkTheme` step targets the theme selector and checks the selected theme after the player interacts with it (`../../../cosmicForge/cosmicForge/onboarding.js:221-249,1090-1091`). Before this correction, MIAPLACIDUS treated `settings.themeId === "dark"` as the whole milestone, so an existing Dark preference could auto-advance the step on entry.

`isProgressionTutorialMilestoneSatisfied` no longer advances `chooseDarkTheme` from saved state alone. The Settings theme selector reports an accepted selection and a completed pointer or keyboard interaction; the app advances the step only when the tutorial is currently on `chooseDarkTheme` and the selected theme is Dark. This lets a player keep an existing Dark preference while still requiring interaction with the theme control. Selecting another theme does not satisfy the step.

No tests, builds, typechecks, formatting checks, or browser review were run. The full first-run tutorial flow, save/resume behavior, and spoken assistive-technology output remain open under P-36.
