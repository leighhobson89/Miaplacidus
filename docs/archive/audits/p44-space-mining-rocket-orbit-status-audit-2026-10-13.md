# P-44 Space Mining Rocket orbit status audit — 13 October 2026

## Source behavior

Cosmic Forge ui.js:8801-8807 shows Ready To Travel for a launched Rocket when a destination exists, and Select Destination when it does not.

## Current remake mapping

src/app/SpaceMiningPane.tsx:136-158, 274-283 maps the orbit Rocket phase to Ready To Travel when state.run.space.selectedAsteroidId is non-null and to Select Destination otherwise. The separate travel button continues to use the full space.rocket.travel precondition and its existing disabled reason; the status does not claim that every travel prerequisite is satisfied. The typed readyToTravel and selectDestination keys in src/i18n/rocketMessages.ts:35-36 have populated values in en/es/pt/de/it/fr.

This does not change the Space Mining tab or Rocket child ownership. It is a static source/renderer and locale-presence review; no tests, builds, typechecks, or browser renders were run. P-44's broader inventory and interactive route/state evidence remain open, and translation quality is not a closure gate.

The source catalogue keys are textReadyToTravelShort and textSelectDestinationShort. Their en/es/pt/de/it/fr values match the corresponding target readyToTravel and selectDestination values.
