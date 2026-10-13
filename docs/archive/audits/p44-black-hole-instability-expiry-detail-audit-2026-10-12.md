# P-44 Black Hole Instability expiry result detail audit

**Superseded status (12 October 2026):** the five timed-event expiry results now use separate localized confirm dialogs. The earlier toast-only route described below was the state before that implementation; see the [source-matched expiry dialog audit](p44-random-event-expiry-dialog-audit-2026-10-12.md).

**Date:** 12 October 2026  
**Scope:** Static comparison of Cosmic Forge's Black Hole Instability expiry feedback with the active MIAPLACIDUS random-event end notification route and its six-locale copy.

## Source behavior

When the timed event ends, Cosmic Forge `../../../../cosmicForge/cosmicForge/events.js:166–187` emits the stabilization notice and opens the `blackHoleInstabilityEnded` result modal. `../../../../cosmicForge/cosmicForge/ui.js:15408–15429,15448–15500` resolves that modal. The six source `modalEventBlackHoleInstabilityEndedText` values explain that the singularity calms and returns to equilibrium, and that Black Hole strength and duration are restored to standard (`../../../../cosmicForge/cosmicForge/localization.json:180,2801,5424,8047,10670,13293`).

## Remake route

The initial implementation sent the end event through the global informational notification as a five-second toast and appended the localized result detail from `src/i18n/randomEventEndDetailMessages.ts` to that same status message. That toast-only route is superseded. After the owner's decision to preserve both source outputs, `src/app/randomEventEndNotifications.ts` queues the separate localized `RandomEventResultDialog` result while retaining the preference-gated five-second stabilization toast. The six-locale copy preserves the source facts, and the existing localization validation registers the detail catalogue. The shared [expiry dialog audit](p44-random-event-expiry-dialog-audit-2026-10-12.md) records the current route and dialog copy.

Static route and copy review for this expiry result is complete. No tests, builds, typechecks, formatting checks, or rendered browser review were run; P-44 remains open for the remaining Phase 6 evidence.

**Owner decision (12 October 2026):** add the separate source result modal and keep the stabilization toast. The current expiry route queues `RandomEventResultDialog` independently of the notification preference, then retains the localized five-second toast when notifications are enabled. Black Hole uses the six-locale result detail recorded in the shared expiry-dialog audit. Static route and copy review is complete; rendered browser review remains open.
