# P-29 battle laser source-callback timestamp audit — 13 October 2026

## Source behavior

Cosmic Forge ui.js:13513-13519 captures performance.now() inside the accepted laser-shot callback. It attempts one of two laser sounds only when the elapsed time since the prior attempt is strictly greater than 80 ms, then stores that callback timestamp as the guard origin. The visible laser is built from the same shot callback (ui.js:13523-13530).

## Current remake mapping

src/app/SpaceBattlePresentation.tsx:593-600 captures one timestamp after the visible-target/current-goal shot roll succeeds. That value is passed to playBattleLaserCandidate and is also the visual laser's createdAt. src/app/audio.ts:537-540, 697-704 converts the timestamp from the browser performance clock into the injected audio clock before the selector applies the strict >80 ms guard (audio.ts:258-268). The random choice between the two laser cues remains in the selector. This removes the earlier split where the visual laser used the RAF frame time and the audio selector read its clock later.

The change is presentation/audio timing only. It does not alter combat damage, battle state, or outcomes.

## Remaining evidence and limits

Explosion audio first reconciles transient renderer crossings against exact confirmed (system, round, side, fleet, unitIndex) identity, then pairs remaining events and candidates one-to-one only when counts match in the same system/round/side/fleet group and each event confirms one loss. Audio uses captured crossing times only; confirmed unmatched visible casualties may use event-receipt time for animation, never audio. Pooled engine health and transient per-unit health can differ, so some confirmed losses remain silent. The engine does not expose native per-ship crossing timestamps. Normal and catch-up cadence, terminal-round behavior, muted/zero-volume/unfocused playback, and runtime lifecycle still need the P-29 evidence listed in the Phase 6 estimate. No tests, builds, typechecks, or browser checks were run for this slice.
