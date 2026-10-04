# Meta signals contract — achievements, random events, and news

**Status:** completed and archived 4 October 2026. Covers G-51–G-60. Source rules are mapped from [`foundation-meta.md`](../../audit/foundation-meta.md) and the pinned Cosmic Forge `achievements.js`, `events.js`, `game.js`, `ui.js`, `descriptions.js`, and localization catalogue. The reference application remains read-only.

## Achievement catalogue and state

- `src/content/achievementNames.generated.ts` holds all 70 stable achievement IDs and six localized names. `src/content/achievements.ts` assigns source area, run/permanent ownership, and reward for every ID; unspecified narrative achievements use the explicit no-reward milestone.
- `src/engine/achievements.ts` evaluates accepted engine transitions once. The earned ID list is the idempotency key; reward effects apply at the same boundary and are saved with the owning run or permanent record.
- The nine stable theme IDs are `terminal`, `dark`, `misty`, `light`, `frosty`, `summer`, `supernova`, `galaxy`, and `space`. Theme choices are settings; the separate `permanent.achievements.themeIdsTried` record survives run reset and save/reload. Selecting every theme awards `tryAllThemes` once.
- `src/app/AchievementBadge.tsx` draws new vector badges. Color and one of seven distinct motifs are selected deterministically from the stable achievement ID; the DOM badge marker retains that ID for review and accessible presentation.
- Achievement cards show localized names, reward descriptions, ownership scope and earned state. Resource names in reward descriptions use the six-locale economy catalogue.

## Random events

- `src/content/metaSignals.ts` defines the 13 source event IDs and probability overrides. An event check selects uniformly from currently eligible events, rolls that event's current probability, and occurs at the halfway point at half chance and again at the 45–75 minute run checkpoint. The selected event probability falls by 10% to a 1% floor after a trigger.
- Instant effects and timed effects are in `src/engine/randomEvents.ts`. History, active effects, target IDs, durations, multiplier shifts and probabilities are saved. Event timers advance under the simulation clock; an effect is removed once at expiry.
- Endless Summer forces sunny weather for 40–50 minutes and resets the weather cycle to 10 seconds until it ends. Black Hole Instability lasts 15–25 minutes, chooses power and duration factors in the 0.5–1.5 range, and draws replacement factors each elapsed minute. Always-on Black Holes keep duration fixed at 1×.
- `random-event.force` and `news.ticker.force` are deterministic engine commands used through the test-mode boundary. The production UI does not expose a force control.

## News ticker

- The five stable categories are headline, prize, wacky visual, one-off bulletin and manuscript clue. Selection thresholds are 3% one-off, 10% prize, 15% wacky, and otherwise headline; a headline has a 5% manuscript-clue sub-roll when an unreported clue is available.
- The initial ticker delay and every subsequent interval are seeded values in the 20–35 second range. Headline and clue IDs are shown once per run; the eight wacky IDs are distinct and the 14 one-off reward IDs are claim-once. Resource prizes choose an unlocked good with available capacity and cap the grant at one tenth of storage.
- The remake uses localized bulletin templates keyed by stable IDs instead of copying the original headline prose. Manuscript clue order, category, duplicate guards, prize settlement and one-off effects remain explicit in the saved records.
- The Settings section hosts the saved news/event journal and achievement catalogue. It is always available so a player can inspect early achievements before the Galaxy tab unlocks.

## Save and rebirth behavior

- Permanent theme history and run-scoped event/news state have exact validated shapes. Schema v31 adds `themeIdsTried` and per-minute Black Hole shift timing; `upgradeGameStateV30` normalizes earlier theme names and fills the new event fields. Earlier MIAPLACIDUS migration rungs also produce the current v31 state.
- Rebirth clears run achievements and random-event history with other run state. Permanent achievement IDs, rewards and theme history remain. The news ticker follows its existing rebirth carryover path, including claimed IDs and visual effects.
- Version 30 stored only a current theme preference, not historical choices. Migration therefore normalizes the old preference to a supported theme and records only that theme as tried; it does not fabricate past selections.

## Verification

- Unit: `tests/unit/meta-signals.spec.ts` covers the 70-ID catalogue, award idempotency, all nine themes, event effects and odds state, ticker interval, claim caps, and state persistence. `tests/unit/local-saves.spec.ts` and `tests/unit/cosmic-rip.spec.ts` cover v30 migration.
- Browser: `tests/e2e/achievements/` checks nine visible tabs, all theme choices, permanent reward/save reload and badge IDs. `tests/e2e/random-events/` checks event/news UI, one-time claim, reload and six locales.
- `npm.cmd run test:unit` passed once for G-51–G-60 (20 files, 213 tests).
- Chrome `npm.cmd run test:e2e:focused -- tests/e2e/achievements/achievements.spec.ts tests/e2e/random-events/random-events.spec.ts` passed both browser journeys. The focused Cosmic Rip and Miaplacidus homecoming routes also passed after their affected UI changes.
- `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run check:boundaries`, and `npm.cmd run format:check` passed.

## Source paths

- Cosmic Forge: `achievements.js`, `events.js`, `game.js`, `ui.js`, `descriptions.js`, `localization.json`.
- MIAPLACIDUS: `src/content/achievements.ts`, `src/content/metaSignals.ts`, `src/content/themes.ts`, `src/engine/achievements.ts`, `src/engine/randomEvents.ts`, `src/engine/newsTicker.ts`, `src/persistence/migrations.ts`, `src/app/SettingsPane.tsx`.
