# P-44 Space notification audit — 12 October 2026

## Scope

Compared Cosmic Forge's ordinary Space and Interstellar notification copy with the remake's Space event routes. This is a source-to-target copy, placeholder, and notification-type correction; event ownership and gameplay are unchanged.

## Source evidence

When travel completes, Cosmic Forge calls `showNotification` with `notificationStarShipReachedOrbit`, substitutes the capitalized destination into `{star}`, and uses the `starShip` classification with an informational notice for 3,000 ms ([`game.js`](../../../cosmicForge/cosmicForge/game.js#L11258)). The six source translations all say the Starship reached the system's orbit ([`localization.json`](../../../cosmicForge/cosmicForge/localization.json#L2351), [Spanish](../../../cosmicForge/cosmicForge/localization.json#L4974), [Portuguese](../../../cosmicForge/cosmicForge/localization.json#L7597), [German](../../../cosmicForge/cosmicForge/localization.json#L10220), [Italian](../../../cosmicForge/cosmicForge/localization.json#L12843), [French](../../../cosmicForge/cosmicForge/localization.json#L15466)). The source notice goes through the shared notification stack (`ui.js:5659`).

## Remake route and correction

The engine emits `space.starship.arrived` when the travel timer completes ([`spaceMechanics.ts`](../../src/engine/spaceMechanics.ts#L2027)). `spaceEventNotifications.ts` routes ordinary arrivals to the global notification stack through `App.tsx:1378-1395`; the notice interpolates the destination name. Before this audit, all six `starshipArrived` strings only said the ship arrived at the system and the adapter passed `{system}`. They omitted the source outcome, reaching orbit, and used a different placeholder.

Updated `starshipArrived` in `spaceNotificationMessages.ts` for `en`, `es`, `pt`, `de`, `it`, and `fr` to say that the ship reached orbit, and changed the adapter to pass `{star}`. The source's Starship name and system destination remain localized through the existing name resolver.

The existing O-type and reported-factory arrival narratives remain as their separate, scrollable 20-second notice adaptations; this correction only affects ordinary arrivals. Star Data remains its own Interstellar child page.

No automated tests, builds, typechecks, or browser checks were run; this was a static source and catalogue comparison.

## Ordinary Space and Interstellar notice crosswalk

Compared the source-backed Space/Interstellar notices in `spaceNotificationMessages.ts` with Cosmic Forge's exact locale entries across `en`, `es`, `pt`, `de`, `it`, and `fr`. The source translations are grouped in `localization.json` at the corresponding locale blocks: English lines 2309–2453, Spanish 4932–5076, Portuguese 7555–7699, German 10178–10322, Italian 12801–12945, and French 15424–15568.

The crosswalk covers these 29 target entries (174 target-locale values):

- Starship ready, travel, and arrival: `starshipReady` → `notificationStarShipCanBeLaunched`; `starshipLaunched` → `textTravellingToStar`; `starshipArrived` → `notificationStarShipReachedOrbit`.
- Galactic unlock and telescope milestones: `galacticTabUnlocked` → `notificationGalacticTabUnlocked`; `telescopeBuilt` → `notificationSpaceTelescopeBuilt`; `launchPadBuilt` → `notificationLaunchPadBuilt`; `starshipSystemScanned` → `notificationSystemScanned`; `starStudyComplete` → `notificationStarStudyComplete`.
- Asteroid outcomes: `asteroidScanMissed` → `notificationAsteroidNotFound`; `asteroidDiscovered` → `notificationAsteroidDiscovered`; `legendaryAsteroidDiscovered` → `notificationLegendaryAsteroidDiscovered`.
- Rocket milestones: `rocketLaunched` → `notificationRocketLaunched`; `rocketFuelReady` → `notificationRocketReadyForLaunch`; `rocketArrived` → `notificationRocketReachedAsteroid`; `rocketReturned` → `notificationRocketReturnedToRefuel`.
- Weather: the eight `weatherHeavyRain*` and `weatherVolcano*` entries map to source entries with the same IDs.
- Rapid Expansion: `rapidExpansionPeaceful`, `rapidExpansionNonConquest`, `rapidExpansionNoEligible`, and `rapidExpansionFailed` map to their matching `notificationRapidExpansion*` keys. `rapidExpansionCapturedOne` and `rapidExpansionCapturedMany` both map to `notificationRapidExpansionCaptured`, whose `{plural}` suffix is resolved into separate localized target strings.

## Corrections and retained adaptations

- `starshipLaunched` previously said that the ship had launched toward its destination. Cosmic Forge uses `textTravellingToStar` when travel starts (`game.js:6600`; the key appears in each locale block listed above). Updated all six target strings to that exact source wording, retaining the adapter's `{system}` placeholder for the source `{star}` destination.
- `rocketLaunched` previously used a different sentence in each locale. It now matches `notificationRocketLaunched` in all six locales (`game.js:13226`), with `{rocket}` standing for source `{rocketName}`.
- The ordinary Starship arrival route now uses `info`, matching `game.js:11258`. In the remake, `info` and `success` are distinct `GameNotificationType` values; `success` adds a green left border in `src/styles.css`, while the default `info` border uses the ready-text color. The previous `success` state made this source informational notice look like a success alert.
- The Starship-ready English spelling remains `Starship` rather than source `Star Ship`, following the owner-directed Interstellar page name in `presentation-navigation-contract.md`. French keeps its standard space before the exclamation mark.
- `starStudyComplete` retains the added localized range result. This is the documented P-20 live-region adaptation: the persistent global notice reports the new range as well as the source completion and Star Map prompt (`feature-parity-checklist.md`, P-20 live-region route audit).
- The target Rapid Expansion one/many variants preserve grammatical localized forms where mechanically appending the source `{plural}` suffix makes the source template ungrammatical in Spanish, Portuguese, German, and Italian. French keeps locale-appropriate spacing before `!`.
- Cosmic Forge's Portuguese `weatherHeavyRainNoLaunchWithBenefit` source string has an unclosed `{material` placeholder. The target keeps the correctly closed `{material}` placeholder; the other weather strings match in all six locales.

Rocket travel-start/returning copy and the battle, Void Pillage, and O-type/factory narrative entries are not direct ordinary-notification copies from this source-key family; they remain separate remake result or narrative routes. No further direct copy or locale mismatch was found in the 29-entry source-backed comparison. This was a static source/catalogue review only; no tests, builds, typechecks, browser work, or save interaction were performed.
