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
player/enemy losses when any ship count decreases. The current audio adapter makes at most one randomized explosion attempt per grouped casualty event with losses, regardless of the number lost; attempts inside the strict `>140 ms` cooldown are dropped. Cosmic Forge calls audio from each unit-death animation and drops calls inside its guard; grouped MIAPLACIDUS losses do not provide individual impact order or timestamps. Battle completion has no dedicated cue, and no casualty cue is deferred after the result. This adds no combat randomness, saved fields, timers or state
transitions.

This safely represents **which fleet classes lost how many ships in a round**,
but it cannot reconstruct individual impact order, shot count, firing or target
unit, or animation timestamps. The current adapter makes one aggregate laser attempt per continuing battle round and immediately drops attempts inside the strict `>80 ms` cooldown. Since the engine emits no `space.battle.round` for its terminal round, there is no terminal-round laser attempt; the finish event adds no cue. It does not infer an additional
laser from `space.battle.finished`, because that result does not identify a
shot.
A casualty event with losses makes at most one explosion attempt regardless of the grouped count; exact source-cadence audio remains open until combat has a real ordered impact/animation stream. Unit coverage verifies exact
round loss counts and cue gating; the focused Chrome case verifies an actual
defeat tick plays one explosion while preserving the battle outcome.

Source references: `../../../../cosmicForge/cosmicForge/game.js:15036,
15137-15152`; `../../../../cosmicForge/cosmicForge/ui.js:13440-13454,
13488-13519`.

Run the area with `npm run test:e2e:focused -- tests/e2e/battle/battle.spec.ts`. The broader I-37–I-47 checkpoint also includes the unit and browser suite after the remaining Phase 4 work is complete.

P-29 verification on 10 October 2026: the focused installed-Chrome audio regression passed **1/1**, the focused battle/audio unit files passed **31/31**, and project typecheck passed. The broader battle spec completed **4/7**. Its three unrelated existing suite failures were: victory settlement expected **10 AP** but received **15 AP**; unoccupied settlement expected **5 AP** but received **6 AP**; and defeat/rebuild could not find `starship-fleet-scout` on the Colonise screen. These findings are outside the casualty event/audio slice; no settlement reward or Fleet Hangar selector changes were made here.

P-29 implementation follow-up (11 October 2026): the audio adapter now lets the queued casualty explosion cues drain after the battle result, because the final-round casualty event precedes `space.battle.finished` and Cosmic Forge triggers explosions for unit deaths without a battle-finished cancellation. Mute, zero volume, focus loss and disposal still cancel pending cues. Since the remake stores only per-class losses for the round, a large grouped final batch can leave a longer audible tail than Cosmic Forge's callback throttle. No tests or browser runs were performed for this change.

P-29 catch-up laser follow-up (11 October 2026): each emitted `space.battle.round` now queues one randomized laser proxy, with at least 81ms between playback calls. That matches the source guard's numeric minimum separation, but not its per-shot behavior: Cosmic Forge drops shot callbacks made within its `>80ms` guard, while this queue defers each round proxy. The engine emits `space.battle.round` only when the battle continues, so the terminal round has no laser proxy; `space.battle.finished` also clears any pending proxies. Synchronous catch-up no longer loses queued round proxies merely because `performance.now()` has not advanced between dispatches. Mute, zero volume, focus loss, and disposal cancel the pending queue; battle state and round timing are unchanged. No tests or browser runs were performed.

P-29 queue retry follow-up (11 October 2026; corrected 12 October): timer callbacks recheck the strict `>80ms` / `>140ms` playback-spacing guards before consuming queued cues, then reschedule for the remaining interval if a callback wakes early. This guarantees the numeric minimum separation for cues that play; unlike the source's per-shot and per-impact calls, the remake defers queued proxies rather than suppressing calls inside the guard. The engine emits no `space.battle.round` for its terminal round, and `space.battle.finished` clears pending approximate laser proxies without adding a terminal laser. Confirmed casualty explosion cues drain after the result; mute, zero volume, focus loss and disposal still cancel them. The existing unit file still contains an assertion for a terminal laser cue; that assertion does not match the current source-backed contract and has not been run. That intermediate queue implementation was removed on 12 October; its verification record is historical. No battle rules or timer durations changed.

P-29 battle audio event-boundary correction (12 October 2026, superseded later the same day): the intermediate laser and explosion queues described in the preceding dated implementation notes were removed. The adapter then attempted one laser cue at each continuing-round event and at most one explosion cue per grouped casualty event; strict `>80ms`/`>140ms` guards dropped in-window attempts. It did not synthesize a terminal laser or defer cues after catch-up/result. Muted, zero-volume, unfocused, or unavailable playback still advanced cooldown timestamps without playing audio. This event-boundary implementation was not tested or browser-reviewed. The ordered aggregate impact/death follow-up below supersedes this intermediate behavior.

P-29 ordered aggregate impact/death follow-up (12 October 2026): typed impact events now identify each active fleet volley and its represented shooter count; confirmed death events follow the damage that caused them. The audio adapter makes one source-style 20% attempt per represented shooter candidate and applies the strict `>80ms` laser and `>140ms` explosion guards immediately. Death counts are clipped to final fleet losses. Mute, zero volume, focus loss, or locked audio advances cooldown without playback; catch-up and terminal results leave no queued cues. Combat calculations and engine randomness are unchanged. The target still lacks individual unit geometry, visibility, and animation timestamps, so represented shooter candidates and intra-volley death timing remain approximations. No tests, builds, typechecks, or browser checks were run; P-29 remains open for focused cadence evidence and the source-model boundary.
