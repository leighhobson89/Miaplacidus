# Battle and settlement

Chrome coverage follows hostile battle, attrition, settlement rewards, and rebuild/retry from an orbiting starship. Standalone diplomacy outcomes live in the [Diplomacy area](../diplomacy/README.md), and the unoccupied-arrival settlement case lives in the [Colonise area](../colonise/README.md). The battle-owned cases retain the mixed war, battle, and settlement journeys.

Battle fixtures keep ships and hull grouped by fleet class. Advancing the injected clock runs the same saved timer path used during play, so these cases verify that outcomes, destination identity, fleet losses and settlement rewards survive engine state transitions.

Cosmic Forge settles a destination with no sentient defenders directly from the Conquest action (`game.js:14760`), without checking for a player fleet. MIAPLACIDUS now permits the same empty-system settlement path; the Colonise area verifies an unoccupied arrival with zero ships can be settled without starting battle. Battle locators for war and fleet rebuilding use their stable test IDs, while AP assertions measure the award added to the fixture's starting balance.

**Current P-29 implementation (14 October 2026):** the visible battle renderer calls the laser audio callback for each eligible source-shaped shot and the explosion callback when a transient unit crosses zero health. Both callbacks use the captured `performance.now()` time with Cosmic Forge's strict `>80 ms` laser and `>140 ms` explosion guards; audio selection occurs only after a callback passes its guard. Explosion playback no longer waits for an aggregate engine death event or matches synthetic fleet-slot identities. Aggregate battle events continue to govern saved combat outcomes and confirmed death visuals; they do not create audio callbacks. The renderer remains a transient combat sidecar, so its per-unit crossings can differ from the pooled engine health and fleet losses. This changes neither engine damage nor combat outcomes.

**Owner P-29 review closeout (13 October 2026):** the owner manually reviewed and passed the cadence, cooldown-boundary, audio-state, and source-timing acceptance items. P-29 is closed in Phase 6 on that review. The pooled-health and transient per-unit limitations above remain documented behavior; this closeout does not report an automated test or browser run by the agent.

**Focused regression update (14 October 2026, before area split):** `tests/unit/battle.spec.ts` and `tests/unit/audio-event-dispatch.spec.ts` passed **35/35**. At that point `tests/e2e/battle/battle.spec.ts` passed **7/7**, `tests/e2e/space-telescope/audio-cues.spec.ts` passed **6/6**, and the focused battle-completion notification case passed **1/1**. Project typecheck passed. The battle audio unit case checks source callback timing at and beyond the strict cooldown boundary. The aggregate-only browser case confirms that engine casualty events without rendered death callbacks do not invent explosion cues. The saved notification failure came from startup notices in the test fixture; the saved rocket click failure was blocked by queued random-event dialogs, not by cue playback. Both focused cases pass with their fixture queues cleared. These are focused checks, not a full regression run.

## Historical P-29 source and aggregate implementation record (10 October 2026; later paths are marked superseded)

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

Run the area with `npm.cmd run test:e2e:focused -- tests/e2e/battle/battle.spec.ts`. Diplomacy and unoccupied-arrival cases now run from their canonical area specs; focused results are recorded in those READMEs.

14 October 2026 area split: the three diplomacy outcomes and the unoccupied
arrival settlement case moved to `tests/e2e/diplomacy/diplomacy.spec.ts` and
`tests/e2e/colonise/colonise.spec.ts`, preserving their fixture setup and
assertions. Only these four moved cases were run; see the two area READMEs for
their focused Chrome evidence. The remaining Battle cases were not rerun as
part of the split.

P-29 verification on 10 October 2026: the focused installed-Chrome audio regression passed **1/1**, the focused battle/audio unit files passed **31/31**, and project typecheck passed. The broader battle spec completed **4/7**. Its three unrelated existing suite failures were: victory settlement expected **10 AP** but received **15 AP**; unoccupied settlement expected **5 AP** but received **6 AP**; and defeat/rebuild could not find `starship-fleet-scout` on the Colonise screen. These findings are outside the casualty event/audio slice; no settlement reward or Fleet Hangar selector changes were made here.

P-29 implementation follow-up (11 October 2026): the audio adapter now lets the queued casualty explosion cues drain after the battle result, because the final-round casualty event precedes `space.battle.finished` and Cosmic Forge triggers explosions for unit deaths without a battle-finished cancellation. Mute, zero volume, focus loss and disposal still cancel pending cues. Since the remake stores only per-class losses for the round, a large grouped final batch can leave a longer audible tail than Cosmic Forge's callback throttle. No tests or browser runs were performed for this change.

P-29 catch-up laser follow-up (11 October 2026): each emitted `space.battle.round` now queues one randomized laser proxy, with at least 81ms between playback calls. That matches the source guard's numeric minimum separation, but not its per-shot behavior: Cosmic Forge drops shot callbacks made within its `>80ms` guard, while this queue defers each round proxy. The engine emits `space.battle.round` only when the battle continues, so the terminal round has no laser proxy; `space.battle.finished` also clears any pending proxies. Synchronous catch-up no longer loses queued round proxies merely because `performance.now()` has not advanced between dispatches. Mute, zero volume, focus loss, and disposal cancel the pending queue; battle state and round timing are unchanged. No tests or browser runs were performed.

P-29 queue retry follow-up (11 October 2026; corrected 12 October): timer callbacks recheck the strict `>80ms` / `>140ms` playback-spacing guards before consuming queued cues, then reschedule for the remaining interval if a callback wakes early. This guarantees the numeric minimum separation for cues that play; unlike the source's per-shot and per-impact calls, the remake defers queued proxies rather than suppressing calls inside the guard. The engine emits no `space.battle.round` for its terminal round, and `space.battle.finished` clears pending approximate laser proxies without adding a terminal laser. Confirmed casualty explosion cues drain after the result; mute, zero volume, focus loss and disposal still cancel them. The existing unit file still contains an assertion for a terminal laser cue; that assertion does not match the current source-backed contract and has not been run. That intermediate queue implementation was removed on 12 October; its verification record is historical. No battle rules or timer durations changed.

P-29 battle audio event-boundary correction (12 October 2026, superseded later the same day): the intermediate laser and explosion queues described in the preceding dated implementation notes were removed. The adapter then attempted one laser cue at each continuing-round event and at most one explosion cue per grouped casualty event; strict `>80ms`/`>140ms` guards dropped in-window attempts. It did not synthesize a terminal laser or defer cues after catch-up/result. Muted, zero-volume, unfocused, or unavailable playback still advanced cooldown timestamps without playing audio. This event-boundary implementation was not tested or browser-reviewed. The ordered aggregate impact/death follow-up below supersedes this intermediate behavior.

P-29 ordered aggregate impact/death follow-up (12 October 2026; superseded 13 October): typed impact events identified each active fleet volley and its represented shooter count; confirmed death events followed the damage that caused them. The audio adapter made one source-style 20% attempt per represented shooter candidate and applied the strict `>80ms` laser and `>140ms` explosion guards immediately. Death counts were clipped to final fleet losses. Mute, zero volume, focus loss, or locked audio advanced cooldown without playback; catch-up and terminal results left no queued cues. Combat calculations and engine randomness were unchanged. The target still lacked individual unit geometry, visibility, and animation timestamps, so represented shooter candidates and intra-volley death timing remained approximations. The aggregate impact event was later removed when battle laser attempts moved to the live transient unit renderer. No tests, builds, typechecks, or browser checks were run; P-29 remains open for per-death timing and focused cadence evidence.

P-29 transient unit-level presentation follow-up (13 October 2026; superseded by the direct renderer callback summarized at the top):

P-29 visible-shot source-boundary correction (13 October 2026): the renderer draws one random roll for every visible enemy candidate before the current-goal check, then invokes the laser callback only when the roll is `<= 0.2` and the candidate is the current goal. This matches Cosmic Forge's inclusive threshold and roll-before-goal order (`game.js:15132-15152`). It consumes a roll even for a visible non-goal candidate. The engine-side death timestamp boundary and focused cadence evidence remain open; no tests or browser checks were run.

P-29 conditional source-time casualty mapping (13 October 2026; superseded): an earlier renderer version associated modeled zero-health crossings with confirmed deaths only when per-round, per-fleet casualty counts matched. The current renderer callback behavior is summarized at the top of this README.

P-29 prior aggregate casualty event detail (13 October 2026; superseded): the engine records an ordered `space.battle.death` count for each fleet attack that reduces a fleet's aggregate health-pool unit count, then clips those counts to actual final losses. A record contains round, side, fleet, and confirmed count, but no victim identity or per-unit health-crossing timestamp. The renderer consumes these confirmed records and attempts one explosion per reported casualty; if records share an event batch, their callbacks share the batch receipt time. Source-timed death cadence still requires unit-level crossing information that the current combat model does not expose. No estimated hit timing was added because it would be speculative and could diverge from the source; combat damage and outcomes remain unchanged. No tests or browser checks were run.

**P-29 prior direct-crossing model (13 October 2026; superseded):** the transient canvas once attempted explosion audio at its modeled zero-health crossings, independent of engine confirmation. That path has been removed because it could play an unconfirmed casualty cue.

**P-29 prior pooled-offset casualty callbacks (13 October 2026; superseded):** each confirmed final loss once emitted a fleet-local slot and a pooled-health-derived round-relative crossing offset. The global audio adapter attempted that estimated time. That intermediate implementation preferred exact identity matches and residual source-crossing candidates when their counts matched the remaining confirmed deaths in the same round/side/fleet group.

P-29 prior confirmed-identity source-crossing gate (13 October 2026; superseded): an earlier implementation required an exact identity match, then allowed residual count pairing. Its current-state summary is superseded by the direct source-crossing callback summarized at the top of this README.
P-29 confirmed-death catch-up replay (13 October 2026; interim and superseded):

P-29 source-timed casualty mapping refinement (13 October 2026; superseded):

P-29 round-wide explosion audio mapping refinement (13 October 2026; superseded):

P-29 confirmed-only callback refinement (13 October 2026; superseded by direct renderer callbacks on 14 October):

P-29 callback timestamp clarification (13 October 2026): the stored value is named `sourceCrossingAtMs` and is passed to the cooldown to preserve source crossing order. It does not backdate audible playback; matching audio still waits for aggregate casualty confirmation, and mismatched confirmed groups remain silent. No tests or browser checks were run.

P-29 initial speculative source-timed callback implementation (13 October 2026; superseded by batch reconciliation): that intermediate renderer attempted explosion audio immediately at each transient per-unit modeled zero-health crossing, using the shared strict >140 ms global cooldown and crossing order. Aggregate engine events still govern confirmed casualty visuals; combat resolution and damage are unchanged. A modeled cue can differ from the pooled confirmed casualty count, so source/model parity and cadence remain open. This supersedes the preceding confirmed-only delayed-audio note. No tests or browser renders were run.

P-29 batch reconciliation update (13 October 2026; superseded by the confirmed-identity update below): the intermediate renderer allocated transient source-shaped crossings to confirmed losses by side/fleet across an event batch, in round order. Only matched crossings produce audio attempts; their original timestamps pass to the global `>140ms` gate after engine confirmation. Surplus crossings remain silent; confirmed deaths without a crossing receive no fabricated audio timestamp and use only the receipt-time visual fallback. Pooled engine events still lack native victim IDs and source timestamps. No tests, builds, or checks were run; see the [fleet-scoped source-timing audit](../../../docs/archive/audits/p29-battle-fleet-scoped-source-timing-audit-2026-10-13.md).

**P-29 prior modeled-crossing callback behavior (13 October 2026; superseded):** explosion audio was attempted at transient per-unit zero-health crossings without waiting for engine confirmation. Its current source-callback implementation is summarized at the top of this README.

**P-29 prior pooled-offset callback summary (13 October 2026; superseded):** the resolver once emitted a fleet-local slot and pooled-health-derived crossing offset for each final casualty. The audio adapter attempted that estimated timestamp globally. That intermediate implementation preferred full identity matches and also used residual renderer crossing timestamps when their count equaled remaining confirmed deaths in the same round/side/fleet group.

**P-29 confirmed source-crossing gate (13 October 2026; superseded 14 October):** the pooled resolver emitted one confirmed death event per casualty with a synthetic fleet-tail slot. Audio waited for exact identity or safe group pairing before attempting playback. That implementation has been replaced by direct renderer callbacks at visible modeled crossings.


P-29 multi-round catch-up audio update (13 October 2026; superseded 14 October): audio.ts collected distinct settled rounds per system from each dispatch result or dispatchBatch result set. Exact-identity and safe one-to-one group-paired candidates were consumed through explosionAttempt(undefined, timestamp), advancing cooldown without late playback; single-round matches retained playback eligibility after aggregate confirmation. Group pairing was allowed only when remaining event and candidate counts matched and each event confirmed one loss. This buffered path was removed when audio moved to direct renderer crossings.

P-29 laser callback timestamp follow-up (13 October 2026; laser timing retained, explosion mapping superseded 14 October): the visible renderer captures one performance.now() timestamp at each accepted shot and shares it between the laser visual start and the audio cooldown selector. audio.ts maps that value into its injected clock before applying the source's strict >80 ms guard. The explosion path formerly waited for synthetic fleet-slot identity confirmation; it now follows direct renderer crossing callbacks. See the [callback timestamp audit](../../../docs/archive/audits/p29-battle-laser-source-callback-timestamp-audit-2026-10-13.md).
