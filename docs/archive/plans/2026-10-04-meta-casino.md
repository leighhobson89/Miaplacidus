# Galactic Casino contract (G-17–G-24)

**Status:** completed and archived 4 October 2026; focused-verified against the pinned Cosmic Forge source catalogue in [foundation-meta](../../audit/foundation-meta.md). The reference remains read-only. Its complete prize keys and amounts are recorded in the casino appendix there.

## Rules

- The casino unlocks after the current run's AP award or any completed rebirth. Buy whole CP amounts with cash or unlocked resources/compounds at `ceil(amount × 100000 / valueOfOneCP)`. The supported exchange values and the default 0.4 Double-or-Nothing probability are in `src/content/galacticCasino.ts`.
- The CP balance is stored with casino progression but resets to zero on rebirth. Rebirth also clears unclaimed wheel prizes and an unfinished Higher-or-Lower hand. The configured probability, games won, lifetime counters and recent history remain; run counters reset.
- Double or Nothing accepts a positive integer stake no larger than the wallet. It deducts the stake once; a seeded draw below the configured probability awards twice the stake, otherwise the stake is lost.
- Wheel costs 1 CP. Its 16 equally likely sectors contain one special result, eight losses and seven ordinary prizes. Ordinary prizes choose evenly among resources, compounds, cash, research, time or CP. Each outcome is revalidated before a player claims it.
- Higher or Lower costs 5 CP for a saved nine-card deck drawn from ranks 2–14. Consecutive cards cannot share a rank; ties therefore cannot occur. Strictly correct guesses advance. A prize is selected for each available tier; the player can cash out starting after the third card, while reaching card nine awards tier seven automatically. A wrong guess loses the entry cost. Unavailable stock-doubling prizes return 20 CP; unavailable tier-seven finish prizes return 150 CP.
- Void Seer has three paid choices: 7 CP for matching two 0–6 reels, 10 CP for matching 0–8, and 15 CP for matching 0–12. Matching reels reveal an eligible O-type or manuscript clue for the first two choices, or add 10–30% of current antimatter (at least 1) for the third.
- Casino draws use the saved seeded random stream. Telescope and travel prizes update the original timer/state and pass through normal completion handlers, so discoveries, arrival, and completion counters use the same engine path as ordinary play.

## State and source mapping

| State | Scope and reset |
| --- | --- |
| CP wallet, unfinished Higher-or-Lower deck, pending wheel claim | Saved casino state; wallet and unfinished actions clear on rebirth. |
| Double-or-Nothing probability, games-won IDs, recent history, lifetime counters | Persistent casino state; retained through rebirth and save/export reload. |
| Per-game plays/wins and CP spent this run | Run statistics; reset on rebirth. |
| Draw sequence | Run random state; each accepted game draw advances and saves the shared stream. |

Source paths: Cosmic Forge `casino.js`, `drawTab7Content.js`, `game.js`, `resourceDataObject.js`, and `constantsAndGlobalVars.js`; MIAPLACIDUS `src/content/galacticCasino.ts`, `src/engine/galacticCasino.ts`, `src/engine/metaProgression.ts`, `src/app/GalacticCasinoPane.tsx`, and save schema/migration v22.

Saving active rounds and recent result history makes casino play recoverable after reload. These are persistence/interface improvements; game prices, odds and prize values remain source-backed. Rebirth's CP reset matches `game.js` calling `setGalacticCasinoDataObject(0, 'casinoPoints', ['quantity'])` after resetting run state.

## Verification evidence

- Unit: `npm.cmd run test:unit` passed once for this section (15 files, 146 tests). After that section run, only affected unit areas were rerun for fixes: `galactic-casino.spec.ts` and `meta-progression.spec.ts` passed (12 tests and 15 tests). The full-suite result predates those final targeted fixes.
- Browser: Chrome `galactic-casino.spec.ts` passed (1 test) with a visual baseline at `tests/e2e/galactic-casino/galactic-casino.spec.ts-snapshots/galactic-casino-roundtrip.png`; it covers purchase, all four games, special claim, saved active hand/reload, locale change, visible history and Void Seer.
- Browser rebirth: Chrome `rebirth.spec.ts` passed (1 test), including a 12 CP pre-rebirth wallet and zero CP after rebirth and save/reload.
- Static: `npm.cmd run typecheck` passed after the casino and rebirth changes.

Black Hole and Cosmic Rip timer policy is recorded in the completed [endgame contract](2026-10-04-meta-endgame.md). Broader translation review and layout belong to Phase 6.
