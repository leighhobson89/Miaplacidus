# P-45 Rocket default-name notice localization audit

**Date:** 12 October 2026  
**Scope:** Rocket launch, fuel-ready, arrival, and return notices in all six supported locales.

Cosmic Forge passes `getRocketUserName(rocket)` into the Rocket milestone notices (`game.js:11104-11107,13097,13226`). That helper replaces legacy `Rocket 1`–`Rocket 4` defaults with the current locale's `rocketDefaultName` while preserving custom names (`constantsAndGlobalVars.js:4169-4176`). Source values are `Rocket {index}`, `Cohete {index}`, `Foguetão {index}`, `Rakete {index}`, `Razzo {index}`, and `Fusée {index}` (`localization.json:2245,4868,7491,10114,12737,15360`). The six `rocketMessages.ts` values match those source strings.

MIAPLACIDUS initializes those four names in English (`src/content/space.ts:568`), and `src/app/spaceEventNotifications.ts` previously interpolated the stored names directly for launched, fuel-ready, arrived, and returned notices. The route now passes each resolved name through `localizedRocketUserName(locale, name)` from `src/i18n/rocketMessages.ts:348-353`. The helper translates only the legacy default-name pattern and leaves renamed Rockets intact. Notice templates, event timing, and travel state are unchanged.

Static source/renderer and locale-catalogue review only. No tests, builds, typechecks, formatting, or browser checks were run. P-45 remains open for the remaining route families and rendered review.
