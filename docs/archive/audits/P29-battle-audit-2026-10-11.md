# P-29 Battle Audio Source Audit — 11 October 2026

## Finding

At the initial 11 October review, MIAPLACIDUS's battle sound scheduling was a
presentation approximation over aggregate, deterministic battle events. At
that point the adapter attempted one laser cue for each continuing-round event
and one explosion cue for each casualty event with losses. Its selectors allow a cue only after more than 80 ms for
lasers and more than 140 ms for explosions; attempts inside those windows are
dropped immediately. Playback suppression does not pause the remake cooldown clocks: even when sound is muted, unavailable, unfocused, or at zero volume, battle attempts still pass through selectors and update eligible timestamps. Cosmic Forge updates its timestamps before its audio manager applies mute. Cosmic Forge makes per-shot and per-death-animation calls
and also drops calls within its cooldown; neither implementation queues those
suppressed calls.

At that review, the engine had no ordered per-shot or per-impact timestamps from which
to reproduce those callbacks. At that stage, the closest available signals were one
`space.battle.round` per continuing 250 ms combat resolution and a
`space.battle.casualties` event with exact per-class loss counts at a resolved
round boundary. Event-boundary attempts cannot be interpreted as exact source
cadence.

## Cosmic Forge call sites

- `cosmicForge/cosmicForge/ui.js:12741-12742` initializes the global last-laser
  and last-explosion timestamps to zero.
- `cosmicForge/cosmicForge/ui.js:13440-13453` runs `explosionAnimation` for a
  destroyed unit. It reads `performance.now()` and plays one random
  `shipBattleExplode1`/`shipBattleExplode2` cue only when
  `now - lastShipBattleExplodeSfxAt > 140`; otherwise that invocation produces
  no sound. The same function creates the visual explosion.
- `cosmicForge/cosmicForge/game.js:14991-15037` calls `explosionAnimation`
  after a targeted unit reaches zero health and is marked disabled. This is a
  per-unit update callback, not a round summary.
- `cosmicForge/cosmicForge/ui.js:13488-13517` plays a random laser cue only
  when `shootLaser` resolves a non-transparent stroke and its timestamp guard
  passes `> 80` ms.
- `cosmicForge/cosmicForge/game.js:15139-15152` calls `shootLaser` from the
  visibility-cone checks only when the enemy is visible, a 20% random check
  passes, and the firing unit's current target matches that enemy.

The source guards are strict `>` comparisons and initialize their timestamps
to zero. The remake uses the same zero start and suppresses elapsed values
`<= 80`/`<= 140`, which is equivalent at the boundary. The current adapter
does not schedule retries or retain a pending cue after an attempt is
suppressed.

## MIAPLACIDUS event and audio model

- `src/engine/spaceMechanics.ts:1574-1582` starts the repeating battle timer
  with a 250 ms duration.
- `src/engine/spaceMechanics.ts:1150-1178` compares fleet counts around one
  aggregate resolution and emits `space.battle.casualties` with exact class
  loss counts and the round number. It does not identify a particular ship's
  destruction order or timestamp.
- `src/engine/spaceMechanics.ts:1247-1265` emits `space.battle.round` only when
  the battle continues; a terminal result emits `space.battle.finished`
  instead. `completeSpaceBattles` can resolve several timer completions in a
  single engine advance.
- `src/engine/spaceCommands.ts:236-252` defines the typed payloads. There is no
  shot event, unit-level impact event, animation timestamp, or ordered list of
  losses.
- `src/app/audio.ts:246-278` applies the source cooldown thresholds and random
  sound variants. `src/app/audio.ts:417-442` makes one laser attempt for each
  round event and one explosion attempt for each casualty event with losses,
  regardless of the number of ships in that grouped event. A cooldown-
  suppressed attempt is discarded at that event boundary.

This adapter does not alter engine damage, fleet counts, resource accrual,
timers, or saved state. Its injected cue randomness is separate from the
engine's deterministic battle state.

## Intermediate bounded adapter (12 October 2026; superseded later the same day)

`space.battle.finished` reports an outcome; its payload does not confirm a
laser shot or impact, so it produces no battle cue. Each continuing
`space.battle.round` makes one randomized laser attempt. A casualty event with
one or more losses makes one randomized explosion attempt, regardless of the
count in that grouped event. The same strict cooldown comparisons discard
attempts inside the windows; there are no deferred attempts, timers, or audio
tails after catch-up or battle completion. Simulation outcomes and engine
randomness are unchanged. Muted or otherwise suppressed playback still advances cooldown timestamps, matching source call order.

## Boundary recorded for the intermediate adapter

One cue attempt per continuing round is a coarse laser proxy, not the source's
per-visible-target 20% shot trigger. Because the engine emits
`space.battle.round` only when the battle continues, the terminal round has no
laser proxy; `space.battle.finished` adds none. A casualty event carries an
exact grouped loss count but no individual impact order or timing, so the
current adapter can attempt at most one explosion cue for that event. No exact
per-impact model can be derived from the current event payload without adding
shot/impact timing to the battle presentation model. Do not change battle
simulation or consume engine randomness merely to manufacture sound events.

P-29 remains open for exact source-cadence parity and broader audio
verification. The 12 October scheduling correction has not been tested,
built, typechecked, formatted, or browser-reviewed.

## Ordered aggregate impact/death implementation (12 October 2026)

The intermediate round/casualty proxies were replaced with typed
`space.battle.impact` and `space.battle.death` events. Their payloads are
defined in [`spaceCommands.ts`](../../../src/engine/spaceCommands.ts#L245),
emitted during damage resolution in
[`spaceMechanics.ts`](../../../src/engine/spaceMechanics.ts#L1115), and consumed
synchronously by the [`audio.ts` adapter](../../../src/app/audio.ts#L239). Each
active fleet volley records its attacker, target, round, and represented
shooter count before its damage; deaths caused by that damage follow the impact
event and are clipped to the final fleet losses after aggregate battle
resolution. This preserves the player-then-enemy volley ordering without
changing damage calculations or engine randomness.

`src/app/audio.ts` now makes one source-style 20% roll per represented shooter
candidate, then selects a laser cue only when the strict `>80 ms` guard admits
it. It makes one explosion attempt for each confirmed death under the strict
`>140 ms` guard. Attempts are synchronous, including during catch-up; muted,
zero-volume, unfocused, or locked playback still advances cooldown state, and
there are no deferred cues after a battle result.

This improves granularity but remains an aggregate approximation. The engine
does not model source unit positions/visibility or animation timestamps, so a
fleet count cannot establish how many individual shooter-target pairs are
visible, and deaths within a volley have no source-equivalent timing. Power
Siphon also heals at a different point in aggregate resolution; death cues
are clipped to confirmed final losses. No tests, builds, typechecks, formatting,
or browser checks were run. P-29 remains open for focused cadence evidence and
the documented source-model boundary.

The boundary is also temporal: `clock.advance` can resolve multiple 250 ms
battle ticks into one synchronous event result, with no timestamp on each
impact or death. The audio adapter samples `performance.now()` while draining
that result, rather than at the original visual callback time. Reproducing the
source cooldown windows across catch-up therefore needs a timed battle
presentation model; queuing old cues after catch-up would not match the source.
Cosmic Forge's visibility helper also filters by unit position, rotation, vision
distance, disabled state, and current target (`game.js:15110-15156`), none of
which are represented by the remake's aggregate fleet counts. The current
Starship battle view exposes phase/round and aggregate per-class health pools
(`src/app/StarshipPane.tsx:1222-1263`); it has no unit-level presentation model
to supply those values.

## Transient unit-level presentation callbacks (13 October 2026)

The current implementation adds [SpaceBattlePresentation.tsx](../../../src/app/SpaceBattlePresentation.tsx) to the visible Starship Colonise battle view. It creates transient unit positions, headings, goals, and visibility state from current fleet counts; it adds no saved fields and does not participate in combat calculations. During each visible animation frame, units first move using their previous goals. The renderer then checks source-shaped visibility by direction and vision distance, makes a 20% roll for each visible enemy candidate, and invokes the laser callback only when that candidate is the unit's current goal. Goal selection happens after movement and shot checks, following the source call order.

[audio.ts](../../../src/app/audio.ts) now exposes presentation callbacks instead of deriving battle audio from aggregate impact counts. Each callback uses the source strict >80 ms laser or >140 ms explosion guard and chooses a random sound variant only after the guard admits playback. Mute, zero volume, focus loss, locked audio, or unavailable playback still advances the corresponding cooldown. No audio is queued for later playback.

The former `space.battle.impact` engine event and its adapter branch have been removed. Laser eligibility now comes from the visible renderer's transient per-unit state; the engine publishes only confirmed aggregate death counts for this presentation path.

The engine still publishes confirmed casualty counts per fleet and round, not source unit identities or death-animation timestamps. For each confirmed count, the renderer now selects a visual unit proxy, sets its transient health to zero, and invokes the explosion attempt only on that proxy's positive-to-zero transition. Multiple losses in one aggregate publication still transition synchronously at the same event-receipt timestamp; this is a confirmed visual state transition, not a source-equivalent per-hit damage crossing. It preserves per-loss callback attempts without reproducing Cosmic Forge's individual death-animation cadence. Same-batch final-round death events are accepted only before `space.battle.finished` and only for the latest round; later terminal callbacks and stale rounds are suppressed. Damage, fleet totals, engine randomness, and battle outcomes are unchanged.

The presentation seeds each proxy's health from its fleet aggregate, but it still does not track individual hits. Cosmic Forge calls `explosionAnimation` when damage to a targeted unit reaches zero health (`game.js:15023,15036`; `ui.js:13440-13453`). MIAPLACIDUS now changes a proxy to zero only after the engine confirms a casualty, so audio cannot announce an unconfirmed loss; however, that transition occurs at the aggregate 250 ms round boundary, not at the source hit time. Replaying speculative per-frame damage in the renderer would create a second damage model. A source-timed implementation still needs authoritative per-unit crossing data or equivalent timing from the engine path while preserving current damage and outcomes.

This is a substantial source-shaped presentation step, not P-29 acceptance evidence. The final-death timestamp boundary remains unresolved, and the new slice has not been tested or browser-reviewed. P-29 remains open for that implementation gap and the later focused cadence checks. The earlier aggregate descriptions in this file are historical and superseded by this section.

### Visible-shot roll ordering correction (13 October 2026)

Cosmic Forge tests `Math.random() <= 0.2` for each visible enemy candidate before checking whether it is the current goal (`game.js:15132-15152`). The renderer now rejects only when `shotRoll > 0.2` or the candidate is not the shooter's current goal (`SpaceBattlePresentation.tsx:425-429`). Equality therefore succeeds, and visible non-goal candidates still consume their roll. This aligns shot-attempt eligibility; it does not resolve individual death timestamps, which remain unavailable at the engine's aggregate 250 ms casualty boundary. No tests or browser checks were run.

### Confirmed casualty event detail (13 October 2026)

The current engine preserves ordered `space.battle.death` records for fleet attacks that cross aggregate health-pool unit boundaries (`spaceMechanics.ts:1120-1182`). Each record identifies the round, side, fleet, and confirmed loss count; final records are clipped to actual end-of-round fleet losses (`spaceMechanics.ts:1230-1243`). These are authoritative aggregate counts, not per-unit hits: the event has no victim identity or crossing timestamp (`spaceCommands.ts:245-260`). The presentation consumes the ordered events and makes one attempt per confirmed loss, but event-batch delivery gives callbacks a shared receipt time. Adding per-unit IDs or estimated offsets would invent data and could change parity with current combat outcomes. No safe engine change was identified; the source-timed per-death cadence remains open. No tests or browser checks were run.
### Confirmed casualty catch-up replay correction (13 October 2026)

SpaceBattlePresentation.tsx lines 634-657 now walks every ordered space.battle.death record in a received event batch, including records from earlier rounds before a same-batch terminal result. For each visible confirmed loss, killConfirmedUnits creates its proxy explosion and synchronously calls the audio adapter; it samples performance.now once per reported loss (SpaceBattlePresentation.tsx lines 294-312). The source cooldown continues to suppress attempts within 140 ms, with no queued retry. This prevents earlier-round confirmed casualties in a clock catch-up batch from being discarded just because the store has already reached the terminal state.

The change still cannot recover Cosmic Forge's per-unit hit/crossing time: engine events carry aggregate confirmed counts, not victim identities or health-crossing timestamps. Per-callback wall-clock sampling at receipt time is not source timing, and no offsets or speculative presentation damage were added. Combat state, damage, and outcomes are unchanged. This static code review is not P-29 acceptance evidence; no tests or browser checks were run.

### Independent casualty-group mapping refinement (13 October 2026)

`sourceTimedCasualtiesForBatch` now reconciles each `(round, side, fleet)` group independently. Matching groups preserve their modeled source-shaped crossing times even when another group in the same round differs. Unmatched groups still use the explicitly typed aggregate-event-receipt fallback, which is not source parity. The change does not alter engine combat damage or outcomes. No tests or browser checks were run; P-29 remains open for source-equivalent timing across all confirmed deaths and cadence evidence.

### Round-wide explosion audio mapping refinement (13 October 2026)

The source explosion cooldown is global across fleets. If source-sidecar crossings and engine-confirmed casualties have the same total for a round, `SpaceBattlePresentation.tsx` now gives the audio cooldown all individual source-shaped crossing times in global timestamp order, even when a fleet's aggregate casualty count differs. Per-fleet source matches still place explosion visuals on the corresponding units; the remaining confirmed visuals use the remaining crossing timestamps when the round total matches. A mismatch in round totals still requires event-receipt timing for unmatched confirmed casualties. Combat damage and outcomes are unchanged; that fallback remains outside acceptance. No tests or browser checks were run.

### Confirmed-only callback correction (13 October 2026)

The preceding round-wide fallback was superseded. Direct sidecar audio was removed because it could sound for an unconfirmed casualty. The renderer now attempts audio only for a modeled `(round, side, fleet)` group whose count matches the engine-confirmed death count; mismatched groups have no audio fallback. `sourceCrossingAtMs` preserves cooldown order, but does not backdate playback: the sound still waits until the aggregate 250 ms resolution confirms the death. This avoids speculative audio but leaves source audible timing and catch-up cadence open. Combat damage and outcomes are unchanged. No tests or browser checks were run.
