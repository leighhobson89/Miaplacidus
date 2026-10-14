# P-29 battle fleet-scoped source-timing audit — 13 October 2026

> Historical implementation snapshot: this audit records the fleet-scoped batch-reconciliation version. It was superseded by transient modeled crossings, then pooled-offset callbacks, and now the confirmed-identity candidate gate documented in the [Phase 6 checklist](../../plans/build-checklist/06-presentation.md) and [battle README](../../../tests/e2e/battle/README.md). The current gate first uses an exact system/round/side/fleet/slot match, then permits one-to-one pairing of remaining events and candidates only inside the same group when counts match and each event confirms one loss. Audio uses captured renderer crossing times and never event-receipt time; confirmed unmatched visible casualties may use receipt time for animation only. Source timing and cadence evidence remain open.

## Source callback

Cosmic Forge's `game.js:15033-15036` handles each target when its health reaches zero, disables that unit, and starts its explosion animation at that unit's crossing. The source's global explosion audio throttle remains strict `>140 ms` in `ui.js:13450-13455`.

## MIAPLACIDUS implementation

- `SpaceBattlePresentation.tsx:428-508` groups pending transient crossings and confirmed death events by side/fleet across the event batch. It sorts source crossings by crossing time and confirmed events by round, then allocates crossings to each confirmed count in round order; exact count equality is no longer required.
- `SpaceBattlePresentation.tsx:902-915` submits only allocated crossings to the shared explosion gate after engine confirmation, carrying each original crossing timestamp and transient source-unit ID. Attempts are ordered by crossing time and source death order; the cooldown uses source timestamps, but playback is not backdated.
- The same matched units drive confirmed casualty visuals and audio. Surplus transient crossings remain silent; confirmed casualties without a crossing retain a receipt-time visual fallback only and receive no fabricated audio timestamp.
- Engine `space.battle.death` events expose confirmed counts by round, side, and fleet, but no victim IDs or source timestamps. The matched identity is from the transient source-shaped presentation model, not an engine-authored victim identity.

## Remaining acceptance

The implementation preserves engine damage and outcomes and avoids speculative explosion audio. It allocates only the intersection of transient crossings and confirmed pooled losses by side/fleet across each event batch, in round order. When the sidecar has fewer crossings than confirmed losses—including hidden or catch-up cases—the remaining deaths have visual fallback but no source-timed audio attempt. Engine events expose no native victim IDs or source timestamps, so matched IDs are presentation-model identities; eligible playback is submitted after engine confirmation using the original crossing timestamp, not backdated. P-29 remains open for full callback coverage and cadence evidence. No tests, builds, typechecks, or browser checks were run.

## Battle navigation lock follow-up

Cosmic Forge's `disableTabsLinksAndAutoSaveDuringBattle` (`game.js:8780-8786`) applies `tab-not-yet` to top tabs and option links when Attack starts (`game.js:9670`) and removes it after the result fade (`game.js:9578`). MIAPLACIDUS disables top-level tabs, pane tabs, Settings child navigation, and Resource/Compound rails; route, keyboard, and callbacks reject navigation changes, and the selected route is pinned to Interstellar > Colonise, including for a resumed in-progress save. The UI behavior follows the source lock lifecycle, though the live browser presentation has not been compared. Browser-background catch-up and pooled engine events without per-unit identities or timestamps remain unresolved. No tests or browser checks were run.
