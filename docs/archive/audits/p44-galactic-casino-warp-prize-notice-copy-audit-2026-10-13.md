# P-44 Galactic Casino warp-prize notice copy audit — 13 October 2026

**Scope:** compare the Starship and Rocket warp special-prize notices with the Cosmic Forge notification assembled after a wheel prize is claimed.

Cosmic Forge emits the Starship result from `casinoNotificationSpecialPrizeStarshipWarpedPrefix` plus the destination star and an empty suffix (`casino.js:362`; six locale values in `localization.json`). The Rocket result uses `casinoNotificationSpecialPrizeRocketWarpedPrefix`, the Rocket name, `casinoNotificationSpecialPrizeRocketWarpedMiddle`, the destination, and an empty suffix (`casino.js:386`). MIAPLACIDUS maps these outcomes to `claimStarshipWarp` and `claimRocketWarp` in [`casinoMessages.ts`](../../../src/i18n/casinoMessages.ts#L1277); [`casinoEventNotifications.ts`](../../../src/app/casinoEventNotifications.ts#L420) supplies the destination values and emits the resulting notification.

The six-locale templates now retain the source's immediate-warp result and omit punctuation absent from the source strings. The Rocket copy previously said the Rocket was already at its destination; it now says that it warped there. The Starship copy likewise no longer adds a final period. Casino remains its own Galactic child page; no route or prize behavior changed.

Static source/catalogue/renderer comparison only. No tests, builds, typechecks, formatting, or browser renders were run. P-44 and Phase 7 remain open.
