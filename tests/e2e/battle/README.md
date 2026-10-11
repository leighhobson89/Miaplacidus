# Battle and settlement

Chrome coverage follows the diplomacy, war, attrition and colonization controls from an orbiting starship. The fixtures exercise hostile victory, hostile defeat and rebuild/retry, both bully outcomes, vassalization success and failure, forced war, and an unoccupied settlement.

Battle fixtures keep ships and hull grouped by fleet class. Advancing the injected clock runs the same saved timer path used during play, so these cases verify that outcomes, destination identity, fleet losses and settlement rewards survive engine state transitions.

## P-29 battle audio granularity audit and casualty event (10 October 2026)

Cosmic Forge animates individual units. `game.js:15137-15152` checks live unit
targets and uses a 20% random roll for laser fire; `ui.js:13488-13519` chooses
one of the two laser assets and applies an 80 ms playback cooldown. When an
individual unit is destroyed, `game.js:15036` requests an explosion animation;
`ui.js:13440-13454` chooses an explosion asset and applies a separate 140 ms
cooldown. These cues follow animated shots and deaths, rather than a fixed
round sequence.

MIAPLACIDUS still resolves combat as class-level totals in
`src/engine/spaceMechanics.ts:1035-1249`, and saves only class counts and
aggregate health pools in `src/content/space.ts`'s `StarSystemBattleState`.
Each resolver call has exact before/after fleet counts, so it now emits a typed,
non-persistent `space.battle.casualties` event with the round and per-class
player/enemy losses when any ship count decreases. The audio adapter queues one
randomized explosion cue per counted loss, spacing later cues at the source's
140 ms minimum cooldown. Battle completion has no dedicated cue; final-round casualties use the explosion queue, which now drains after the result. This adds no combat
randomness, saved fields, timers or state transitions.

This safely represents **which fleet classes lost how many ships in a round**,
but it cannot reconstruct individual impact order, shot count, firing or target
unit, or animation timestamps. The remake keeps one aggregate laser cue for
each continuing battle round and queues one for the terminal exchange; exact source-cadence audio remains open until
combat has a real ordered impact/animation stream. Unit coverage verifies exact
round loss counts and cue gating; the focused Chrome case verifies an actual
defeat tick plays one explosion while preserving the battle outcome.

Source references: `../../../../cosmicForge/cosmicForge/game.js:15036,
15137-15152`; `../../../../cosmicForge/cosmicForge/ui.js:13440-13454,
13488-13519`.

Run the area with `npm run test:e2e:focused -- tests/e2e/battle/battle.spec.ts`. The broader I-37–I-47 checkpoint also includes the unit and browser suite after the remaining Phase 4 work is complete.

P-29 verification on 10 October 2026: the focused installed-Chrome audio regression passed **1/1**, the focused battle/audio unit files passed **31/31**, and project typecheck passed. The broader battle spec completed **4/7**. Its three unrelated existing suite failures were: victory settlement expected **10 AP** but received **15 AP**; unoccupied settlement expected **5 AP** but received **6 AP**; and defeat/rebuild could not find `starship-fleet-scout` on the Colonise screen. These findings are outside the casualty event/audio slice; no settlement reward or Fleet Hangar selector changes were made here.

P-29 implementation follow-up (11 October 2026): the audio adapter now lets the queued casualty explosion cues drain after the battle result, because the final-round casualty event precedes `space.battle.finished` and Cosmic Forge triggers explosions for unit deaths without a battle-finished cancellation. Mute, zero volume, focus loss and disposal still cancel pending cues. Since the remake stores only per-class losses for the round, a large grouped final batch can leave a longer audible tail than Cosmic Forge's callback throttle. No tests or browser runs were performed for this change.

P-29 catch-up laser follow-up (11 October 2026): each confirmed `space.battle.round` now queues one randomized laser cue, draining the queue at least 81ms apart to honor Cosmic Forge's `>80ms` laser guard. Synchronous catch-up no longer drops later rounds just because `performance.now()` has not advanced between dispatches. Mute, zero volume, focus loss, and disposal cancel the pending queue; battle state and round timing are unchanged. No tests or browser runs were performed.

P-29 battle queue retry and terminal shot follow-up (11 October 2026): timer callbacks now recheck the strict `>80ms` / `>140ms` cooldown before consuming each queued cue, then reschedule for the remaining interval if a callback wakes early. The engine emits `space.battle.finished` rather than `space.battle.round` for its terminal exchange, so the adapter queues that final laser from the finished event while the separate casualty explosion queue drains. Focused unit cases now cover the terminal shot, cooldown retry, cadence, and cancellation; they were added without being run and remain unverified until the final check session. No battle rules or timer durations changed.
