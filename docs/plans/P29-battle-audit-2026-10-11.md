# P-29 Battle Audio Source Audit — 11 October 2026

## Finding

MIAPLACIDUS's battle sound scheduling is a presentation approximation over
aggregate, deterministic battle events. Its cooldown comparisons match the
source thresholds: a cue is allowed only after more than 80 ms for lasers and
more than 140 ms for explosions. The queue spaces accepted cues at 81 ms and
141 ms. Cosmic Forge, however, calls audio at individual shot and death
animation callbacks and drops calls that arrive within the cooldown; it does
not queue the suppressed calls for later playback.

The current engine has no ordered per-shot or per-impact timestamps from which
to reproduce those callbacks. The closest currently available signals are one
`space.battle.round` per continuing 250 ms combat resolution and a
`space.battle.casualties` event with exact per-class loss counts at a resolved
round boundary. Queued audio cannot be interpreted as exact source cadence.

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
to zero. The remake now uses the same zero start and suppresses elapsed values
`<= 80`/`<= 140`, which is equivalent at the boundary. Its queued retry
intervals of 81 ms and 141 ms are the minimum integer millisecond waits that
satisfy those comparisons.

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
- `src/app/audio.ts:246-287` applies the source cooldown thresholds and random
  sound variants. `src/app/audio.ts:432-454` queues one laser cue for each
  round event and one explosion cue for each confirmed ship loss. The queues
  recheck current sound settings, focus, volume, and disposal before playback.

This adapter does not alter engine damage, fleet counts, resource accrual,
timers, or saved state. Its injected cue randomness is separate from the
engine's deterministic battle state.

## Bounded correction

`space.battle.finished` reports an outcome; its payload does not confirm a
laser shot. The adapter no longer invents a final laser cue from that event.
It also cancels pending approximate laser/explosion cues when the battle ends,
so queued sounds cannot spill into the next screen. A casualty event processed
before the finish can still play its first cue immediately; any remaining
loss-count cues are canceled at finish. This means a final grouped casualty
batch can produce fewer sounds than ships lost.

## Remaining parity boundary

One cue per round is a coarse laser proxy, not the source's per-visible-target
20% shot trigger. One cue per loss uses the exact casualty count but schedules
events in an order and cadence the engine does not provide; the source's 140 ms
guard suppresses close callbacks while the remake queue defers them. The final
batch may therefore be underrepresented when the battle ends. No exact
per-impact model can be derived from the current event payload without adding
shot/impact timing to the battle presentation model. Do not change battle
simulation or consume engine randomness merely to manufacture sound events.

P-29 remains open for source-parity and broader audio verification. No tests,
build, typecheck, formatting, or browser run were performed for this audit.
