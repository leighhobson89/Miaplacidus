# Galactic Casino browser tests

The Casino fixture supplies enough cash, stock, and unlocked goods to use the player controls. Cosmic Forge unlocks the Casino from the synthetic `apAwardedThisRun` marker on first-run Starship arrival, and seeds that marker again on rebirth; the remake derives the same gate from arrival history/orbit state or rebirth count. The actual current-run AP award is separate and is not required to open the Casino. The Casino remains its own child pane under Galactic.

Run the focused Casino browser checks with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- tests/e2e/galactic-casino/galactic-casino.spec.ts
```

The browser area checks CP purchase settlement, Wheel special-prize flow, Double or Nothing, Higher or Lower after save/reload and a locale change, Void Seer, keyboard-only navigation and play across all four games, touch-emulated purchase and play at 390px, and a visual checkpoint. Casino stays a Galactic child page throughout.

**P-13 narrow Casino action context (9 October 2026):** the focused `p13-casino-narrow-context.spec.ts` case checks the live CP balance, Wheel and Higher-or-Lower entry prices, Double-or-Nothing stake and payout previews, and their actions at 390px and 320px. All checked content stays within the document and viewport without horizontal overflow. Installed Chrome passed **1/1 in 5.8 seconds** on port 4501. This verified the Casino slice of P-13; broader theme and locale review remains under P-51/P-56.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4501'; node .\node_modules\playwright\cli.js test --pass-with-no-tests tests/e2e/galactic-casino/p13-casino-narrow-context.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

Verification on 5 October 2026: focused presentation-navigation and Casino unit tests passed 16/16. The Chrome journeys covered source child order, post-rebirth Casino access, and all four casino games with save/reload. The post-rebirth Casino access expectation was incorrect; its original correction is itself superseded by the 12 October source trace below. An earlier run reported its assertions passing, then hung during shutdown and was interrupted. The roundtrip screenshot baseline was refreshed and visually reviewed for the current tabbed layout.

The `@ui-navigation` browser checks confirm Galactic Casino appears as a separate child page after opening Galactic and is never a top-level game tab. The unlocked child order is Rebirth, Galactic Market, Galactic Casino, then Ascendency Perks.

**9 October 2026 source-gate correction (superseded 12 October):** the then-current target and test expectations incorrectly treated actual AP award as the source Casino gate. A full source trace found that the synthetic marker is restored on first-run Starship arrival and seeded on rebirth; source `galacticMarketChecks()` exposes the Casino from that marker. The code and existing assertions now follow that lifecycle. The 9 October test results below describe the superseded gate and were not rerun after correction.

5 October 2026 follow-up: the rendered child links now also assert stable page IDs and original source option IDs in that order (`option1`, `option2`, `option6`, `option3`). The three focused Chrome cases passed without browser shutdown hangs. The Casino screenshot was refreshed and visually reviewed after the Resources rail was restricted to the Resources tab, giving the Casino its full content width under Galactic.

5 October 2026 keyboard/touch follow-up: the focused Casino browser area passed 5/5 in Chrome. The new keyboard journey traverses the visible main tabs and Galactic child pages, operates purchases and all four game controls without mouse activation, and verifies focus continues to the first Higher or Lower guess after starting a round. That exposed lost focus after arrow-key child-page changes; `PaneNavigation` now restores focus after the selected page renders. Pixel 7 touch emulation resized to 390px confirms users can open the Galactic Casino child, buy CP, play Double or Nothing, and keep the document within the viewport. TypeScript and targeted formatting checks passed.

5 October 2026 P-06 affordance follow-up: Casino purchase cost and availability now come from an engine selector. Disabled Casino actions expose localized precondition reasons through `aria-describedby`; Wheel and Higher-or-Lower show their exact 1 CP and 5 CP entry costs, while Double-or-Nothing previews the current stake and doubled payout. The `Casino entry costs, stake previews, and insufficient-balance guidance are clear @p06-affordances` case checks exact insufficient-balance copy, affordable states, purchased CP, and post-play balances. The focused Chrome run passed 1/1 with a clean runner exit after the test-owned Vite server was stopped. The `casino-entry-cost-previews` screenshot was generated and reviewed; all three cost/payout previews are visible in their game cards. `tests/unit/action-affordance-selectors.spec.ts` covers purchase boundary pricing, entry fees and six-locale placeholder replacement.

**P-20 purchase-failure announcement check (9 October 2026):** the focused insufficient-CP purchase case is also tagged `@p20-announcements`. It asserts the disabled buy control references its localized reason and that the reason is a polite `role="status"` live region. This covers the static purchase-failure announcement route; broader purchase surfaces still need review.

5 October 2026 P-07 follow-up: after a winning Hilo cashout activates a time warp, the global status row keeps the multiplier and remaining time visible while the player switches tabs, localizes the label/value/tooltip in all six languages, fits at 390px, and disappears when the effect expires. The focused Chrome case passed as part of the 2/2 Cosmic Rip/Hilo timer run.

8 October 2026 notification follow-up: the Casino browser journey now asserts the source-exact localized Double-or-Nothing win/loss toast, its single `galacticCasino` classification, and the absence of duplicate inline result feedback. The new Casino notification unit file passed 3/3. The focused Chrome Casino journey passed 1/1 in 9.8 seconds with a clean exit. Its first run found an outdated `galactic-casino-roundtrip` screenshot after the current-status-row redesign; the screenshot was visually reviewed and refreshed, then the no-update rerun passed.

8 October 2026 P-56 visual and queued-notice follow-up: the Casino browser spec now checks the queued Wheel special-prize claim and Double-or-Nothing result notices in order, and includes a Terminal/Light × English/French × 1280px/390px visual matrix. The four Casino screenshots were reviewed; the cards, point balance, and controls remain visible, French copy wraps without clipping on mobile, and the page has no horizontal overflow. The roundtrip baseline was refreshed to show global notification feedback in the current shell. The complete no-update Chrome Casino spec passed 9/9 in 60.0 seconds. This closes the screenshot slice; the broader theme/locale/viewport matrix and remaining P-08 source notification families were still open at that point.

**8 October 2026 full Casino presentation matrix:** `@casino-theme-locale-matrix` passed in Chrome (1/1). It covers all nine themes and six locales at 1280px, 390px, and 320px (162 combinations). Each combination checks the localized Casino title and game headings, the star-system artwork row, title sizing equal to Hydrogen, and that the pane, cards, text, controls, and document stay within their available widths without horizontal overflow. The Terminal/French/320px capture was visually reviewed; the title and wrapped point balance remain legible and the cards fit. This closes the Casino theme/locale/viewport matrix; P-08 notification-family parity remains open.

**9 October 2026 source-title parity:** Cosmic Forge's `headerMainGalacticCasino` title is now matched exactly in all six locales, including German `Galaktisches Casino` and title-case second words in Spanish, Portuguese, Italian, and French. `tests/unit/casino-title-parity.spec.ts` checks both the page heading copy and the Galactic child label against the audited source strings. The four-case Casino visual checkpoint was refreshed and reviewed after the localized title correction.

Run the visual-matrix case with installed Chrome:

```powershell
$env:MIAPLACIDUS_TEST_AREA = "galactic-casino"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line -g "@casino-theme-locale-matrix" tests/e2e/galactic-casino/galactic-casino.spec.ts
```

## Wheel notification route — partial; Wheel slice verified

Accepted Wheel settlements and successful special-prize claims now route to localized `galacticCasino` notices. `casino.wheel.special-ready` emits the ready notice, and the companion `casino.game.played` special-ready result is ignored. The remake Wheel animation is 2.6 seconds versus Cosmic Forge's 5-second spin. In normal motion, settlement/ready notices intentionally wait until the remake's visible animation finishes so they do not precede the result; this is a deliberate timing difference from the source. With reduced motion enabled, they deliver immediately. Successful claims notify immediately. The handler rechecks the notification preference before delayed delivery, and the pane clears duplicate inline feedback. Cosmic Forge emits the settlement notice when its default 5-second spin completes; source special-ready and ordinary prize-win notices last 3.5 seconds, the generic-win fallback 2.5 seconds, and losses 2 seconds, while successful special-claim notices last 3.5 seconds. An earlier 8 October baseline run, before the claim-context, entry-failure, and warp-engine follow-ups, passed 8/8 in `casino-event-notifications.spec.ts` and 1/1 in the focused Chrome Wheel spin/claim journey with clean exit; its typecheck predates those updates. Unit coverage verifies the normal-motion 2600ms delay and immediate reduced-motion delivery. The browser journey confirms the notice follows the visible spin and successful claims notify. Source-matched Wheel copy, timer-prize context, and the generic-win 2500ms lifetime are covered. The 8 October follow-up added localized notices for pending-claim and insufficient-CP spin failures, plus typed claim details for the tested CP, Research, doubled-good, starship/rocket destination, and telescope-completion outcomes. Before the warp-engine update, focused units passed 3 files / 27 tests and focused Chrome Casino cases passed 2/2. The latest reducer unit rerun passed 2 files / 23 tests, covering outbound rocket arrival, rocket return to base with reservation release, and starship arrival via normal timer completion. Chrome was not rerun after that engine change. A subsequent `npm.cmd run typecheck` passed with exit 0 after both the Wheel warp implementation and final continuation fixture. The Wheel warp claim-context gap noted at that point is covered by the 9 October browser case below; P-08 remains open for other source notification families. The Hilo finish-journey mismatch identified on 8 October was corrected in the 9 October entry below. Higher-or-Lower and Void Seer notice routes are implemented: Hilo cash-out events carry `revealedCount`, and Void Seer results carry `clueTemplateIndex` so the selected localized clue variant follows the typed result. The earlier five focused Casino notification unit specs passed 38/38, including six-locale source-copy checks; their typecheck predates the latest Wheel changes. The focused Chrome Hilo/Void notification journey passed 1/1 with clean exit, asserting silent correct Hilo guesses, a visible cash-out notice, and a visible Void Seer result notice. Keep P-08 partial for other source notification families; the active Wheel warp claim-context is covered by the 9 October browser case below. Source keys and acceptance details are in the [notification route audit](../../../docs/audit/notification-route-audit.md).

**Hilo/Void notification refinement (8 October):** final Hilo reveal and accepted cash-out events carry typed prize keys, win state, and reducer-produced award details; cash-out also carries `revealedCount`. All 25 source Hilo prize/detail templates have six-locale verification. The latest five focused Casino notification unit specs pass 38/38, including raw integer Void antimatter formatting for 1234 and deterministic O-type clue-index/star-name coverage; typecheck passes. The earlier focused Hilo/Void Chrome journey passed 1/1; this unit-only refinement did not receive a new browser run. At the time of this 8 October note, separate gameplay parity items included the discovered-profiles-only O-type clue pool, immediate Hilo TimeWarp application instead of the source's 3-second notification delay, and the then-unfixed active finish-prize behavior. The finish-prize issue was corrected in the following 9 October entry. This 8 October note predates the 9 October browser coverage of the Wheel claim context below; P-08 remains open for other source notification families.

**Higher-or-Lower journey prize correction (9 October):** when a tier-seven rocket or starship finish prize finds an active journey, it now shortens that trip to two seconds without adding 150 CP. Its typed award carries the rocket name or destination system, and the localized full-deck notice names the journey result in all six locales. If no eligible journey exists, the source 150 CP fallback remains and the typed outcome makes the notice report that CP award. Focused `galactic-casino.spec.ts` and `casino-hilo-void-notifications.spec.ts` passed 29/29; `npm.cmd run typecheck` passed. The Hilo correction preceded the Wheel browser case below, which now covers that claim-context; P-08 remains open for other source notification families.

**P-12/P-21 narrow-phone follow-up (9 October 2026):** the focused all-four-games
touch journey identified that the Casino header-help tooltip extended the page
to 466px at a 390px viewport. Its narrow-screen placement now aligns to the
trigger's right edge, keeping the tooltip inside the page. The clean combined
P-21 Chrome run passed 4/4 across keyboard/touch save-picker journeys and
keyboard/touch Casino gameplay. The touch Casino journey asserts no document
overflow after buying CP and playing Wheel, Double or Nothing, Higher or Lower,
and Void Seer.

**P-41 special-prize notation check (9 October 2026):** after the Wheel reveals
a special prize, the visible “100,000 Research” option follows the selected
Condensed, Standard, or Scientific notation. The focused installed-Chrome case
passed 1/1 on port 4215. The combined P-41 subset across economy, News Ticker,
and Galactic Casino passed 5/5 on Chrome port 4217. Casino countdown/prize
visuals beyond this option and other currency-precision paths remain part of
the broader open P-41 review.

Run the special-prize notation case with installed Chrome:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
$env:MIAPLACIDUS_TEST_PORT = "4215"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line -g "P-41 Casino special-prize quantities" tests/e2e/galactic-casino/galactic-casino.spec.ts
```

**P-14 Wheel touch-action sequencing (9 October 2026):** the new Pixel 7
touch-emulated journey checks that the special-prize selector and claim affordance
stay unavailable while the visible wheel is spinning, then become usable after
the result lands. It also verifies spin stays disabled while the prize is pending,
and that claiming the selected 100 CP prize settles the balance and clears the
pending result. This matches Cosmic Forge's source flow, where the selector and
claim button are gated on the completed wheel animation and another spin waits
until the prize is claimed. The focused Chrome test passed 1/1 on port 4234.
It exposed and fixed two affordance timing defects: pending engine state exposed
the prize controls before the animation finished, and the spin control remained
enabled while an unclaimed special prize was pending.

Run the P-14 touch regression with installed Chrome:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
$env:MIAPLACIDUS_TEST_PORT = "4234"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line -g "@p14-casino-action" tests/e2e/galactic-casino/galactic-casino.spec.ts
```

**P-16 Casino notice focus (9 October 2026):** a separate Double or Nothing
case starts with a fresh Casino fixture so its result notice cannot queue
behind a Wheel prize. It verifies the focused play control remains focused
while the result notice is shown and after its three-second dismissal. It
passed as part of the 9/9 installed-Chrome P-16 batch on port 4261.

**P-08 final-card finish-journey browser check (9 October 2026):** added a deterministic Casino fixture with a live outbound Prospector rocket and a Hilo round one card from completion. The installed-Chrome regression passed 1/1 and verifies the player-visible final-card toast says Finish Rocket - Finished Rocket Journey Prospector, the active trip timer shortens from 10 seconds to 2 seconds, and the award does not add fallback CP. This closes the missing browser evidence for Hilo finish-journey routing. The separate Wheel claim-context has its own follow-up below; that case now covers it, while other source notification families remain open.

**P-08 Wheel warp claim-context browser check (9 October 2026):** with the same deterministic active-rocket fixture, claiming `special_rocket_warp` completes the outbound travel timer through normal arrival rules immediately. The notification names Rocket 1 Prospector and asteroid SPI-0002B, and the claim awards no fallback 150 CP. Installed Chrome passed 1/1 on port 4264. This Wheel warp behavior is distinct from the Hilo finish-journey prize above, which reduces the timer to 2 seconds; P-08 remains open for other source notification families.

**P-08 Double-or-Nothing source-route audit (9 October 2026):** Cosmic Forge's invalid-stake and insufficient-CP notices are rejected-entry feedback, not accepted outcomes. The remake keeps Play disabled and links a visible localized reason to the button with `aria-describedby`, so no separate toast is emitted for either guard. The focused `@p08-notifications` Chrome case checks fractional and unaffordable stakes and no added Casino toast; it passed with the two existing P-08 Casino journeys, 3/3 on port 4544. `tests/unit/casino-event-notifications.spec.ts` passed 9/9 after comparing Double-or-Nothing win/loss copy against the six source strings. This caught and corrected the Spanish loss suffix to match Cosmic Forge exactly. The remaining Casino accepted-outcome routes have no missing family identified in this pass; overall P-08 remains open.

Focused guard command:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4544'; npm.cmd run test:e2e:focused -- tests/e2e/galactic-casino/galactic-casino.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g '@p08-notifications'
```

**P-47 Casino counter plurals (9 October 2026):** run and lifetime Casino
counters now select translated singular or other-form nouns with
`Intl.PluralRules` for each locale. Numeric values continue through the active
number-notation formatter. The focused rendered browser case covers zero, one,
and multiple counts in English, Spanish, Portuguese, German, Italian, and French;
it passed 1/1 in installed Chrome on port 4690. At the time of this 9 October entry, P-47 remained open for the
separate Rapid Expansion dynamic-count localization review and the rest of its
app-wide audit. The subsequent review and sign-off are recorded in the [Phase 6 checklist](../../../docs/plans/build-checklist/06-presentation.md).

Run the P-47 Casino plural regression with installed Chrome:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4690'; node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/galactic-casino/galactic-casino.spec.ts -g '@p47-casino-count-plurals'
```

## P-45 Casino action reasons and result notices (10 October 2026)

`tests/e2e/localization/p45-market-casino-results.spec.ts` checks the visible
Double-or-Nothing insufficient-CP reason and its `aria-describedby` association
in all six locales, then buys CP and plays through the real control to verify
the rendered win/loss notice matches the localized result. Both outcome
branches are accepted from the current run state. The combined focused Meta
run passed 9/9 in installed Chrome on port 5077; no translation mismatch was
found. E-57's existing Casino context case separately covers translated
purchase costs, game entry prices, previews, help, and responsive bounds.

The follow-up Wheel case resets the deterministic ready fixture for each
locale, then uses the visible purchase, spin, and claim controls. It checks
that the accepted spin produces the localized special-ready notice and that
claiming 100 CP produces the localized claim notice with the expected info
severity. Installed Chrome passed **1/1 in 32.9 seconds** on isolated port
5238. Together with the earlier Double-or-Nothing case, visible Casino result
and status feedback now has six-locale browser assertions for both game
families.

The Hilo/Void Seer follow-up also resets the fixture for each locale. It makes
two correct Hilo guesses and cashes out, then plays tier-one Void Seer. Both
visible notices are checked against the expected localized result and
severity; the accepted correct guesses remain silent. Installed Chrome passed
**1/1 in 29.1 seconds** on isolated port 5239. Together these cases now provide
six-locale rendered result/status assertions for Double-or-Nothing, Wheel,
Hilo cash-out, and Void Seer. `tests/unit/casino-event-notifications.spec.ts`
continues to provide the source-copy mapping checks. No app copy change was
needed.

## P-54 E-57 Casino tooltip, prices, and previews at narrow widths (10 October 2026)

p54-e57-casino-locale-context.spec.ts checks every visible CP-purchase payment option at quantities 1 and 10, including the computed cost, available amount, and matching enabled/disabled state. It also checks variable Double-or-Nothing stakes, Wheel and Higher-or-Lower entry prices, all three Void Seer tier prices, translated counters/balance, and the header help tooltip at 390px and 320px in all six locales. Tooltip text and viewport bounds plus pane/document overflow are asserted. The Spanish 390px tooltip issue found during this work is fixed in GalacticCasinoPane.tsx; Spanish/390px and French/320px captures were visually reviewed. The case passed individually 1/1 in 16.5 seconds on port 4808 and in the combined installed-Chrome E-57 batch, 13/13 in 57.5 seconds on port 4809. No shared stylesheet changed.

## P-54 post-rebirth Casino clean rerun (10 October 2026)

The post-rebirth navigation assertion had previously passed before the combined
Energy/Casino runner hung during shutdown. It was rerun with installed Chrome on
isolated port 4826; `rebirth keeps Casino hidden until this run awards AP while
CP stays visible` passed 1/1. Together with the Energy chart case, the process
completed **2/2 in 8.7 seconds**, exit 0, with clean server/browser shutdown.
This supersedes the older unclean runner status.

**12 October source-gate correction:** the earlier post-rebirth run verified the then-current hidden-until-AP implementation. The source trace established that the rebirth-seeded synthetic marker unlocks Casino before the actual AP award. The existing browser assertion now covers visible navigation and a successful purchase in that state; this revised assertion has not been run.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4826'
node .\node_modules\playwright\cli.js test tests/e2e/energy/economy-energy.spec.ts tests/e2e/galactic-casino/galactic-casino.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p54-energy-casino-4826 --grep 'Energy compares live generator mix with consumption accessibly|rebirth restores the source Casino marker before this run awards AP'
```

## P-56 all-theme Casino visual review (10 October 2026)

The focused Chrome review reran `@casino-theme-locale-matrix` across all nine
themes (`terminal`, `dark`, `misty`, `light`, `frosty`, `summer`, `supernova`,
`galaxy`, and `space`), six locales, and 1280px/390px/320px widths. It also ran
`Casino header help tooltip preserves source guidance across locales and themes`
with a French tooltip at 1280px and 390px in each theme. Both cases passed 2/2
on port 6141. The matrix records base screenshots for each theme at 1280px and
390px; the tooltip case records matching tooltip screenshots at both widths.
French was used for the visual captures because it is the longer copy in this
page. The run artifacts are under
`test-results-p56-casino-visual-6141/`; filenames follow
`casino-{theme}-fr-{width}.png` and
`casino-{theme}-fr-{width}-tooltip.png` (for example,
`casino-space-fr-390.png` and `casino-space-fr-390-tooltip.png`). All nine
base screenshots at desktop and phone widths were visually reviewed; cards and
controls stay within the page. Tooltip viewport bounds are asserted for all
themes at both widths, and refreshed Light/Space/Terminal phone tooltip captures
were visually inspected.

The review exposed two Casino-only presentation defects. On a desktop-to-phone
resize, the French help tooltip was clamped using its old desktop-left position
and rendered 58px beyond the phone's left edge. Its narrow placement now derives
from the help trigger's right edge; the all-theme tooltip case asserts both
viewport edges and document width. The Space theme also split the final `e` of
`Galactique` onto a line by itself at 390px. The Casino heading now takes the
full phone row before the wallet, and the matrix verifies the final title word
stays on one line. A resize-style wait in the matrix prevents measurements of
the stale tooltip position before the responsive anchor update.

Focused command:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6141'
node .\node_modules\playwright\cli.js test tests/e2e/galactic-casino/galactic-casino.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p56-casino-visual-6141 -g '@casino-theme-locale-matrix|Casino header help tooltip'
```

## P-55 Higher-or-Lower final-card Statistics guard (10 October 2026)

Cosmic Forge uses `nextIndex >= cards.length - 1` when a correct guess reveals
the last card in its fixed nine-card deck. It awards the selected tier-seven
prize (or the defined CP fallback for an unavailable special completion),
then increments Higher-or-Lower Won once. An incorrect guess returns before
that branch. MIAPLACIDUS reaches `nextIndex === 8` on the same final reveal and
increments the paired run/lifetime counters when `prize.won` is true. Its
existing deterministic unit case exercises all five legal tier-seven prize
keys, asserting each produces `won: true` and exactly +1 in both scopes; it
passed **1/1**, with six unrelated cases skipped. The two guard expressions
differ in form but agree for all valid full-deck player outcomes, so no test or
gameplay change was needed.

No Higher-or-Lower counter choice is recorded in
[`open-decisions.md`](../../../docs/plans/open-decisions.md). No controlled live
Cosmic Forge UI comparison was run. Source references and the exact reducer
mapping are in the [Statistics parity plan](../../../docs/plans/statistics-presentation-parity.md#higher-or-lower-final-card-counter-guard-follow-up-10-october-2026).

Focused command:

```powershell
npm.cmd run test:unit:focused -- tests/unit/casino-statistics.spec.ts -t "counts one Higher or Lower win for each accepted tier-seven prize or fallback"
```

## P-44 Casino help inventory (updated 11 October 2026)

`infoTooltipGalacticCasinoHeader` is directly reused as the localized
`casinoMessages.headerHelp` behind the focusable Casino title help control.
The all-locale/theme Casino case checks the rendered text and tooltip bounds.
`infoTooltipGalacticCasinoWheelOfFortune` is now wired as exact six-locale
typed copy beneath the Wheel of Fortune entry cost. The prize selector links
to this visible guidance with `aria-describedby`; the remake hides the selector
until the prize is won, while the source describes enabling it at that point.
The focused six-locale unit assertion is in `tests/unit/casino-wheel-help.spec.ts`;
that unit test and the selector-to-guidance association check were not part of
the regression recovery below. See the
[P-44 handoff](../../../docs/archive/audits/phase-6-handoff-2026-10-07.md#p-44-remaining-cosmic-forge-infotooltip-inventory-10-october-2026).


The latest installed-Chrome rerun before adding Wheel help passed **1/1 in
13.8 seconds** on port 5456. A static source/target string comparison also
confirmed exact `headerHelp` equality in all six locales. The added Wheel help
assertions have not yet been run.

The P-44 source-row browser case checks localized heading-help associations and
rendered copy for the purchase card and all four games in six locales. It passed
1/1 in the 14 October focused regression run on port 6821. The separate Wheel
help unit assertion and its selector-to-guidance association were not run.

**P-20 purchase-reason source audit addendum (11 October 2026):** unavailable Casino Point purchases continue to expose their localized reason through the disabled purchase button's `aria-describedby`; the reason is static rather than a live region because affordability follows continuously changing balances. Command rejection feedback remains in the single polite action output. No checks were run; the purchase-shortfall browser expectation should be aligned with the static reason in the deferred regression pass.

## 14 October focused regression recovery

All seven Casino failure titles from the saved 14 October manifest passed in
focused installed-Chrome runs: six in the 17-case recovery batch on port 6821,
and the refreshed Casino visual case in the final no-update batch on port 6827.
The four refreshed Terminal/French/Light captures were visually reviewed; the
cards and disabled-reason copy fit the pane. No Casino source code changed in
this recovery.

The seven saved failure cases were also rerun together in a focused no-update
installed-Chrome batch on port 6521. All **7/7 passed in 1.2 minutes**. The
notification cases matched the current Casino event routing and rendered
outcomes; the help-row assertions matched the visible section guidance; the
visual checkpoint matched the reviewed baselines. No application or snapshot
changes were needed. Output is under
`%TEMP%\miaplacidus-galactic-casino-recovery-6521-20261014`.

```powershell
$env:MIAPLACIDUS_TEST_PORT='6521'
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npm.cmd run test:e2e:focused -- --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output="$env:TEMP\miaplacidus-galactic-casino-recovery-6521-20261014" tests/e2e/galactic-casino/galactic-casino.spec.ts -g "plays all four casino games|Wheel result notice waits for the spin|Hilo finish-rocket prize|Wheel rocket warp claim announces|Casino pane presentation stays clear|Casino source row help is attached|keeps the Double or Nothing control focused"
```

## P-65 Galactic Casino page identity

`p65-meta-identity.spec.ts` checks the Casino child heading and shared title
treatment, star-system illustration, Hydrogen title scale, and bounds at 1280px
and 390px. It keeps the `p65-galactic-casino-{1280,390}.png` diagnostic
captures as Playwright output attachments. The owner-area case passed in the
seven-case installed-Chrome split batch on port 6716 without snapshot updates.
The batch's separate Black Hole fixture failure passed after correction.
Outputs are under `%TEMP%\miaplacidus-p65-meta-identity-split-20261014`.

## Complete area rerun (14 October 2026)

The complete canonical Casino folder passed **23/23** in installed Chrome on
port 6460, with no snapshot updates. This includes all four games, notice and
help cases, and the full theme/locale presentation matrix. No code or baseline
changes were needed. Artifacts are under
`%TEMP%\miaplacidus-galactic-casino-focused-6460-r2-20261014`.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_TEST_PORT='6460'
npm.cmd run test:e2e:focused -- tests/e2e/galactic-casino --project=chrome --workers=1 --retries=0 --trace=retain-on-failure --reporter=line
```
