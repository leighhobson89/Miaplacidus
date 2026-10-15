# Rebirth

The browser area checks a rebirth through the visible Tab 7 confirmation, verifies the exact reset/carryover (including the source rule that casino points reset to zero) and next-system identity, then saves/reloads through the ordinary local slot flow. The deterministic rebirth fixture enters with one completed run, a newly settled destination and 12 casino points.

Focused commands: `npm run test:unit:focused -- tests/unit/meta-progression.spec.ts` and `npm run test:e2e:focused -- tests/e2e/rebirth/rebirth.spec.ts`.

Verification: meta-progression unit tests passed (15/15); Chrome rebirth scenario passed (1/1) on 4 October 2026. The browser case verifies that 12 CP clears to zero and stays zero after save/reload.

**P-16 focus follow-up (9 October 2026):** the Rebirth confirmation now
explicitly returns keyboard focus to its Rebirth trigger after either Cancel
or Escape. The focused installed-Chrome case passed 1/1 on port 4256 after the
test exposed the missing restoration and a small trigger-ref fix was added.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4256'
npm.cmd run test:e2e:focused -- tests/e2e/rebirth/rebirth.spec.ts -g '@p16-focus' --workers=1 --retries=0 --trace=off --reporter=line
```

The P-16 follow-up also exercises accepted Rebirth: after the run resets,
focus moves to the Hydrogen tab, the first page of the new run. Cancel and
Escape continue to restore the Rebirth trigger. The combined installed-Chrome
P-16 batch passed 9/9 selected routes in 29.8 seconds on port 4261.

**P-45 Rebirth confirmation locale coverage (10 October 2026):**
`p45-rebirth-confirmation-locales.spec.ts` uses the deterministic
`meta-rebirth-ready` fixture and keeps the real confirmation open while
switching through all six locales. It checks the localized Rebirth trigger,
dialog title and prompt, AP carryover amount, Confirm and Cancel labels, then
confirms once and verifies dialog closure, focus on Hydrogen, rebirth count
increment, settled-destination retention, AP carryover, and Casino Points
reset. Installed Chrome passed **1/1 in 7.0 seconds** on isolated port 5650;
typecheck and focused Oxfmt passed. No application change was needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5650'
npm.cmd run test:e2e:focused -- tests/e2e/rebirth/p45-rebirth-confirmation-locales.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-rebirth-locales-5650
```

## Phase 7 Rebirth confirmation and O-type technology dialogs (AUTHORED; NOT RUN)

Cosmic Forge `drawTab7Content.js` routes `modalRebirthHeader` and
`modalRebirthText` to the Rebirth confirmation. The target maps those to
`metaMessages.ts#REBIRTH_TEXT.title` and `.prompt`. Source
`modalRebirthCarryOverAp` maps to `.carry`, and `modalRebirthConfirmLabel` maps
to `.confirm`. The source replaces its body placeholder with the AP line and,
after Cosmic Rip unlock, appends `modalRebirthGainGp`; the target renders the
six-locale `.gp` line when `permanent.cosmicRip.unlocked` is true. This follows
the active permanent unlock flag and does not change meta progression.

The source `tab7RebirthRowLabel` maps to the target `PACKS.rebirths` count-card
heading. `tab7LiquidateRowLabel` maps to `MARKET_COPY.liquidation` on the
separate asset-liquidation card. Source `tab7RebirthRowDescription` explains
the reset and retained Ascendency Points; it is adapted to `PACKS.rebirthBody`
inside the confirmation, which gives the player the target's fuller list of
reset and retained meta state. `rebirthOverview` remains separate in the
Rebirth page tooltip.

`p45-rebirth-confirmation-locales.spec.ts` now checks these page headings,
confirmation details, and the unlocked Galactic Points line across all six
locales, in addition to the earlier prompt, AP carryover, actions and accepted
transition. This Phase 7 extension is **AUTHORED, NOT RUN**. The P-45 result
above records the earlier version of the spec only; it does not verify these
new assertions or the added body/GP rendering.

Cosmic Forge `game.js` also displays `modalOTypeStarTechAcquiredHeader` and
`modalOTypeStarTechAcquiredText` during rebirth into an O-type system. The
remake now routes the six-locale result through
`spaceProgressionDialogMessages.ts#oTypeStarTechAcquiredDialog` after its
`meta.rebirth.completed` transition in `App.tsx`, using the settled system's
assigned plant name and the shared ×8 power multiplier. The authored
`p7-o-type-technology-dialog-locales.spec.ts` uses an O-type rebirth fixture to
check each locale's title, copy and confirm action. It is **AUTHORED, NOT RUN**.

The source localization keys `newGame` and `menuTitle` have no live source
rendering path: their only JavaScript references are unused DOM lookups in
`constantsAndGlobalVars.js`, and no matching elements or localization calls
exist in the current `index.html`/source scripts. The remake's `saveMessages.ts#startNewGame`
and `debugScenarioMessages.ts#menuTitle` remain routed to their own startup and
debug UI contexts; they are not claimed as mappings of those orphaned source
keys.
