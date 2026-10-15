# Notifications

Cosmic Forge creates one notification container per classification in `index.html` / `ui.js`. The first four classifications in arrival order have visible rows (`MAX_STACKS` in `constantsAndGlobalVars.js`); additional classifications keep their messages queued until a visible category empties, then are promoted in order. Ordinary categories show one message at a time. `storage`, `debug`, and `achievement` allow multiple messages within their category, up to four visible cards per category (`MAX_NOTIFICATION_COLUMNS`). `fuse` is an ordinary serialized category.

Owner-directed presentation (14 October 2026): MIAPLACIDUS renders notifications through a portal directly under `document.body`, outside the game frame, in a fixed overlay at the viewport's bottom-right corner. At most two cards are visible side by side; later notices wait in FIFO order and start their lifetime when promoted. Each card stays fully visible for three seconds, fades over 300ms, then leaves the stack. The portal and stack use the maximum CSS z-index, do not contribute to page layout, and leave focus in the active control. Native modal dialogs remain in the browser top layer.

This renderer rule supersedes earlier dated notes below that describe a longer visible lifetime. Handler-level `durationMs` values remain routing metadata; every visible card uses the shared three-second lifetime.

Cosmic Forge keeps notification queues by classification, but the remake intentionally uses a global two-card cap per the owner's presentation decision. The notification setting suppresses delivery and clears queued/visible cards. Reduced-motion mode removes the fade animation while keeping the same automatic dismissal timing.

## Focused checks

```powershell
npm.cmd run test:unit:focused -- tests/unit/notificationScheduler.spec.ts
npm.cmd run test:e2e:focused -- tests/e2e/notifications/floating-notifications.spec.ts --workers=1
npm.cmd run test:e2e:focused -- tests/e2e/notifications/autosave-off-notifications.spec.ts --workers=1
npm.cmd run test:unit:focused -- tests/unit/space-event-notifications.spec.ts tests/unit/audio-event-dispatch.spec.ts
npm.cmd run test:e2e:focused -- tests/e2e/notifications/economy-notifications.spec.ts -g "first fusion discovery reports stored yield" --workers=1
npx.cmd playwright test tests/e2e/notifications/p7-economy-notification-locales.spec.ts --workers=1
npm.cmd run test:e2e:focused -- tests/e2e/notifications/space-event-notifications.spec.ts tests/e2e/starship/starship.spec.ts tests/e2e/battle/battle.spec.ts -g "announces hazardous weather|cancels the point-of-no-return|wins a hostile battle|retains the starship and surviving enemy" --workers=1
```

The scheduler unit cases cover the global two-card cap, FIFO promotion across classifications, manual dismissal, and queue clearing. The floating-notification browser case checks fixed bottom-right placement, side-by-side geometry, stacking order, no document-height change, three-second fade delay, and promotion/dismissal of a queued notice. Space event unit coverage checks localized starship/rocket/weather/battle notices in all six locales, event routing through dispatch, batch, and timer advancement, weather-entry de-duplication, and silent progress/ordinary-weather events. Cosmic Forge source references are `ui.js` (`showNotification`, `processNotificationQueue`, classification queues, row promotion) and `constantsAndGlobalVars.js` (`MAX_STACKS`, `MAX_NOTIFICATION_COLUMNS`, category sets); source is read-only.

**Floating-notification acceptance (14 October 2026):** the focused Chromium run of `floating-notifications.spec.ts` and `autosave-off-notifications.spec.ts` passed 2/2 with a clean exit. It confirms the viewport-fixed bottom-right stack, two side-by-side notices, no page-height change, high stacking order, a three-second visible period followed by a 300ms fade, FIFO promotion, and the autosave warning's three-second lifetime.

**14 October saved-failure recovery:** the 14 notification failures from the full regression artifact were rerun as focused installed-Chrome cases. Thirteen passed in the first focused batch; the Starship arrival focus case passed 1/1 on a clean rerun after it was made to wait for and dismiss the separate asynchronous `random-event-result-dialog`. That native modal correctly takes focus while open; the toast itself leaves the selected Starship tab focused. Across the two focused runs, all 14 saved cases passed. No notification implementation change was needed. The saved contexts are under `%TEMP%\miaplacidus-full-regression-20261014\notifications-*`; focused outputs are under `%TEMP%\miaplacidus-notifications-recovery-6426` and `%TEMP%\miaplacidus-arrival-focus-fixed-6429`.

**14 October full-regression screenshot recovery:** `research completion notifications have a value for all six player languages` passed 1/1 after visual review and refresh of its stale English full-page baseline. The floating notification no longer adds document height; the focused rerun matched with snapshot updates disabled.

The focused scheduler unit run passed 4/4 and TypeScript checking passed. The browser command was:

```powershell
$env:MIAPLACIDUS_TEST_PORT='4185'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/notifications/floating-notifications.spec.ts tests/e2e/notifications/autosave-off-notifications.spec.ts --project=chromium --workers=1 --retries=0 --trace=off --reporter=list
```

**Multi-card cap parity (9 October 2026):** Cosmic Forge sets `MAX_NOTIFICATION_COLUMNS` to four and queues further `storage`, `debug`, or `achievement` notices until a visible card expires. The remake scheduler now applies the same four-card cap and refills each open slot from that category's queue. The focused `notificationScheduler.spec.ts` run passed 5/5, including both live overflow and a capped category promoted from the category queue.

The focused milestone route spec drives deterministic `space-starship-ready`, `space-battle-victory`, and `space-telescope` fixtures through accepted engine commands and the test clock, then checks the visible `starShip`, `rocket`, and `battle` notices. It covers starship launch/arrival, rocket launch/outbound/arrival/return, battle victory, and silence for accepted starship-travel shortening and intermediate battle rounds. On 5 October 2026, the focused system Chrome run reported all three journeys passing. Playwright remained alive after the assertions while shutting down, so it was interrupted; treat the assertions as passed while the process exit remains unclean.

**P-08 notification preference for battle results (9 October 2026):** the focused Chrome case disables Notifications through Settings, starts the deterministic Sirius battle from Colonise, advances the normal battle clock to victory, and verifies the battle-completion toast stays suppressed while the battle itself completes. Installed Chrome passed 1/1 in 6.7 seconds on port 4459 (the target case took 3.1 seconds).

```powershell
$env:MIAPLACIDUS_TEST_PORT='4459'; $env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm run test:e2e:focused -- --workers=1 --project=chrome tests/e2e/notifications/space-milestone-notifications.spec.ts -g 'respects the notification setting for battle completion'
```

Verified command (all three test assertions passed; runner interrupted during shutdown):

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/notifications/space-milestone-notifications.spec.ts --retries=0 --trace=off --workers=1
```

## Clean shutdown follow-up (6 October 2026)

The earlier shutdown-hanging notification runs were rechecked with the `dev:test` server started separately, so Playwright reused the server and did not own its shutdown. Both notification specs passed all four cases in installed Chrome and Playwright exited cleanly (exit code 0) in 33.9 seconds. This covers the hazardous-weather notice and the starship, rocket, and battle milestone notices, including their intentionally silent progress events.

Start the server in a separate terminal:

```powershell
npm.cmd run dev:test -- --host 127.0.0.1 --port 4173 --strictPort
```

Then run the focused browser cases:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/notifications/space-milestone-notifications.spec.ts tests/e2e/notifications/space-event-notifications.spec.ts --reporter=line --workers=1 --retries=0 --trace=off
```

Result: `4 passed (33.9s)`, clean process exit. The prior unclean runs above are retained as run history; this follow-up resolves their pending clean-shutdown verification.

## Rocket fuel-ready notice (8 October 2026)

The accepted `space.rocket.fuel-ready` transition now emits Cosmic Forge's source-exact localized fuel-complete notice under the `rocket` classification, with `info` severity and a 3000ms lifetime. It fires once when an enabled, powered pump first reaches capacity; fuel progress, manual pauses, and later full-capacity ticks stay silent. The current localized rocket name is included in the notice.

The focused `space-event-notifications.spec.ts` unit suite passed 25/25. It covers first-transition behavior, no repeat, and source-copy parity across all six locales; the suite also includes a notification opt-out check for a hazard notice. The clean focused Chrome UI journey passed 1/1. The Rocket desktop and mobile screenshots were refreshed and visually reviewed, and `npm.cmd run typecheck` passed. See the [Space Telescope evidence](../space-telescope/README.md). P-08 remains open for the other source notification families and the remaining Casino parity gaps; this route does not close the notification audit.

## Manual sale notices (8 October 2026)

Manual Resource and Compound UI sales route one accepted `resource.sold` event to one localized notice: Resources use `sold`, Compounds use `special`. The notice includes the sold quantity, good name, and cash amount. Turning notifications off clears existing notices and suppresses subsequent manual sale notices; clock-driven automatic sales remain silent because they do not use the manual UI sale dispatcher.

The focused `resource-sale-notifications.spec.ts` Chrome run passed `1/1` in `4.3s`, verifying the displayed Hydrogen sale amount/cash in its notice and suppression after disabling notifications. `npm.cmd run typecheck` passed. P-08 remains partial while other source notification families are still missing.

P-16 sale-toast focus regression (8 October 2026): after a sale toast appears, the focused, still-enabled Collect control remains focused while the non-focusable output is present and after its 3-second auto-dismiss. The focused installed-Chrome case passed 1/1 in 8.3 seconds; port 4173 was confirmed closed after Playwright exited.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/notifications/resource-sale-notifications.spec.ts --workers=1 --retries=0 --trace=off --reporter=line -g "keeps the selected Hydrogen sale control focused after its notice auto-dismisses"
```

**P-16 focus restoration follow-up (9 October 2026):** the sale-toast
auto-dismiss regression passed again as one of four focused installed-Chrome
P-16 routes (4/4 in 13.7 seconds). That batch also verified Market dialog
Cancel/Escape focus, Star Data `Show on map` focus, and keyboard tab focus. The
dialog focus loss found by the new assertion is fixed; remaining focus routes
are documented in the Phase 6 review.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4254'; npm.cmd run test:e2e:focused -- tests/e2e/galactic-market/galactic-market.spec.ts tests/e2e/star-map/star-map.spec.ts tests/e2e/app-boot/navigation-progression.spec.ts tests/e2e/notifications/resource-sale-notifications.spec.ts -g '@p16-focus' --workers=1 --retries=0 --trace=off --reporter=line
```

## Double-or-Nothing notices (8 October 2026)

The global accepted-event route emits Cosmic Forge's exact localized win/loss copy for Double-or-Nothing in all six locales. It uses `galacticCasino`, `info` for a win and `error` for a loss, with a 2.5-second lifetime. The Double-or-Nothing matcher ignores Wheel and Higher-or-Lower events; Wheel uses a dedicated route. The notification setting suppresses delivery, and the Casino pane does not show a duplicate inline result.

The focused Casino notification unit spec passed 3/3. The clean focused Chrome Casino journey passed 1/1 in 9.8 seconds. Its first run found a stale `galactic-casino-roundtrip` screenshot after the current-status-row redesign; that baseline was visually reviewed and refreshed before the clean no-update rerun passed. P-08 remains partial because other source notification families are still missing.

## Wheel outcome notices — partial; focused Wheel checks passing

Accepted Wheel settlements and successful special-prize claims now route through `casinoEventNotifications.ts` under `galacticCasino`. A dedicated `casino.wheel.special-ready` event emits the ready notice; the companion `casino.game.played` event marked `special-ready` is ignored to avoid duplicates. The remake Wheel animation is 2.6 seconds versus Cosmic Forge's 5-second spin. In normal motion, settlement/ready notices intentionally wait until the remake's visible animation finishes so they do not precede the result; this is a deliberate timing difference from the source. With reduced motion enabled, they deliver immediately. Claim notices are immediate in either mode. Notification preference is checked again at delayed delivery, and accepted results/claims do not remain as duplicate inline Casino feedback. Localized result/claim copy is in `casinoMessages.ts`. Cosmic Forge uses a 5-second default spin and emits settlement notices when it completes; source special-ready and ordinary prize-win notices last 3.5 seconds, the generic-win fallback 2.5 seconds, and losses 2 seconds; successful special claims last 3.5 seconds. On 8 October, `casino-event-notifications.spec.ts` passed 8/8, the focused Chrome Wheel spin/claim journey passed 1/1 with clean exit, and `npm.cmd run typecheck` passed. Unit coverage verifies the 2600ms normal-motion delay and immediate reduced-motion delivery. The browser journey confirms that the notice follows the visible spin and a successful claim gets its notice. Source-matched loss copy, timer-prize context, and the generic-win 2500ms lifetime are covered. Some Wheel special-prize claims still lack full source context. The source notices for a pending prize or insufficient CP are now routed from the rejected Casino UI result; their remaining browser coverage is recorded in the notification route audit. Higher-or-Lower and Void Seer notification routes are implemented: Hilo cash-out events carry `revealedCount`, and Void Seer result events carry `clueTemplateIndex` for source-matched localized clue selection. The five focused Casino notification unit specs passed 38/38, including six-locale source-copy checks; typecheck passed. The focused Chrome Hilo/Void notification journey passed 1/1 with clean exit, asserting silent correct Hilo guesses, a visible cash-out notice, and a visible Void Seer result notice. P-08 remains open for the remaining Wheel gaps and other source notification families. See the [notification route audit](../../../docs/audit/notification-route-audit.md) for the source keys and acceptance scope.

**Hilo/Void notification refinement (8 October):** final Hilo reveal and accepted cash-out events carry typed prize keys, win state, and reducer-produced award details; cash-out also carries `revealedCount`. All 25 source Hilo prize/detail templates have six-locale verification. The latest five focused Casino notification unit specs pass 38/38, including raw integer Void antimatter formatting for 1234 and deterministic O-type clue-index/star-name coverage; typecheck passes. The earlier focused Hilo/Void Chrome journey passed 1/1; this unit-only refinement did not receive a new browser run. At the time of this 8 October note, separate gameplay parity items included the discovered-profiles-only O-type clue pool, immediate Hilo TimeWarp application instead of the source's 3-second notification delay, and the then-unfixed active finish-prize behavior. The finish-prize issue was corrected on 9 October, as recorded below. P-08 remains open for Wheel claim context, Wheel entry-failure notices, and other source notification families.

## Hilo finish-prize correction (9 October 2026)

When a full-deck Higher-or-Lower result awards Finish Rocket or Finish Starship, an eligible active journey now gets a typed `finished-journey` award and its timer is shortened to 2 seconds without also awarding the 150 CP fallback. If no eligible trip is active, the source 150 CP fallback is awarded. The localized notification includes the rocket name or destination star; unit coverage checks both vehicle outcomes across all six locales.

Verified focused command:

```powershell
npm.cmd run test:unit:focused -- tests/unit/galactic-casino.spec.ts tests/unit/casino-hilo-void-notifications.spec.ts
```

Result: `2 files passed; 29 tests passed`. `npm.cmd run typecheck` also passed on 9 October. This direct reducer and notification evidence corrects the older 8 October Hilo mismatch note above. The existing Chrome Hilo/Void route journey does not exercise a full-deck finish-prize result. P-08 remains open for the active Wheel finish-journey claim-context gap and other unported or uncertified source notification families.
## Modal and notification layering (9 October 2026)

The notification region has computed `position: static` and `z-index: auto`; it stays in document flow after the News Ticker and uses `pointer-events: none`. It does not establish a stacking layer or intercept clicks. Critical prompts use native `dialog.showModal()`: the Starship point-of-no-return warning and Galactic Market asset-liquidation confirmation match `:modal`, placing them in the browser top layer above document content. `.confirmation-dialog` and `.starship-launch-dialog` declare no numeric `z-index`; `.save-manager` has CSS `z-index: 20`, but a save-manager dialog opened with `showModal()` also uses the browser top layer, whose ordering is not determined by that CSS value.

The focused regression creates a live Market trade notice, opens the liquidation decision, verifies the notice remains rendered behind the modal, checks that the dialog matches `:modal`, and hit-tests the confirmation button through the browser's top-layer result before exercising Cancel. The Starship prompt check likewise asserts `:modal` and exercises both Cancel and Confirm through the irreversible launch journey.

Verified focused Chrome command (runner started its test server on port 4174):

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/galactic-market/galactic-market.spec.ts tests/e2e/starship/starship.spec.ts -g "keeps a live trade notice behind the asset-liquidation decision|cancels the point-of-no-return prompt and arrives through the saved voyage timer" --reporter=line --workers=1 --retries=0 --trace=off
```

Result: `2 passed (12.2s)`, clean exit code 0. This closes the layering regression for the tested liquidation and Starship decisions. P-08 remains partial: the route audit still identifies unported or uncertified source notification families, and active Wheel finish-journey claim context remains untested. The Hilo journey-prize mismatch was corrected and is covered by the focused 9 October unit run documented above.

## P-20 space timer-completion announcement checks (9 October 2026)

The accepted Starship voyage arrival and Rocket fuel-ready, outbound-arrival,
and return milestones update the global polite live notification region with
atomic `output`/`status` notices. The two Starship and Rocket journeys in
`space-milestone-notifications.spec.ts` and the Rocket fuel journey in
`space-telescope.spec.ts` are tagged `@p20-announcements` and check these
semantics after the corresponding timers complete. Star Study, Void Pillage,
and asteroid-scan completion feedback is covered in the
[Space Telescope browser README](../space-telescope/README.md). Other timer
families and manual assistive-technology coverage remain open.

The Starship arrival case now switches to Hydrogen before the voyage timer
completes, then checks that the global localized polite/atomic notice appears
while Hydrogen remains selected. This confirms the existing app-level event
subscription delivers the source-matched arrival notice across page changes.
Cosmic Forge's `game.js` timer callback likewise calls `showNotification` with
`notificationStarShipReachedOrbit` on arrival. No engine change was needed. The
focused installed-Chrome case passed 1/1:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/notifications/space-milestone-notifications.spec.ts --workers=1 --retries=0 --trace=off --reporter=line -g 'notifies on starship launch and arrival but stays quiet on travel shortening'
```

The focused rerun of all six selected announcement/navigation cases passed in
installed Chrome (`6 passed (41.6s)`) on port 4249. It included Starship and
Rocket milestone notices, fuel-ready, asteroid scan, Star Study/Void Pillage,
and the keyboard main/child tab association journey. The scan and fuel-ready
cases now assert the existing live-region semantics explicitly; no production
accessibility fix was required in this slice.

Verified command:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4249'; npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/space-telescope.spec.ts tests/e2e/app-boot/navigation-progression.spec.ts tests/e2e/notifications/space-milestone-notifications.spec.ts -g 'exposes live Star Study|builds a telescope, starts an asteroid scan|assembles a rocket, buys its powered fuel pump|keyboard focus stays with the selected main and child destination|routes accepted rocket launch, outbound, arrival, and return milestones|notifies on starship launch and arrival but stays quiet on travel shortening' --workers=1 --retries=0 --trace=off --reporter=line
```

**P-20 research timer completion follow-up (9 October 2026):** focused browser
coverage now checks both ordinary Knowledge Sharing research and Cosmic Rip
technology research. Each completion appears as an atomic `role="status"` in
the polite global notification region; the Cosmic Rip case switches to
Resources before completion and confirms the notice arrives without changing
the selected tab. Installed Chrome passed both focused routes (2/2 in 7.8
seconds on distinct port 4632). This validates DOM live-region semantics only.
No screen reader or other assistive technology was run, so spoken timing and
announcement behavior remain unverified; P-20 stays open.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4632'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g 'announces Cosmic Rip research completion|normal research completion reaches the polite atomic' tests/e2e/cosmic-rip/cosmic-rip.spec.ts tests/e2e/notifications/economy-notifications.spec.ts
```

**P-16 toast focus coverage (9 October 2026):** the clean tagged P-16 Chrome
group passed 20/20 in 1.3 minutes. It covers dialog Escape/cancel, selected-tab
navigation, and focus stability through dismissal for research, achievement,
Telescope build, hazardous weather, Rocket return, Starship arrival, battle
victory/defeat, sale, Casino, and Market notices. The Telescope case exposed
focus loss when its Build button disappeared on completion; `SpaceMiningPane`
now moves focus to the newly available Scan for asteroids action, and the test
checks focus through the notice's auto-dismiss.

The achievement engine emits `achievement.unlocked`, and `App.tsx` now routes
it through the `achievement` classification. The notice uses Cosmic Forge's
source copy for all 70 achievements in all six locales and stays visible for
4000ms. The focused Hydrogen achievement path verifies the localized source
message, exactly one notice, and that the Collect control retains focus through
dismissal. The manual screen-reader pass remains separate under P-20; browser
focus assertions do not verify spoken announcements.

Verified focused command (installed Chrome; no screenshots):

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4304'; node .\node_modules\playwright\cli.js test --workers=1 --retries=0 --trace=off --reporter=line -g '@p16-focus' tests/e2e
```

## Achievement unlock notice regression (9 October 2026)

`notice-focus-stability.spec.ts` includes a focused P-08/P-16 regression for
the achievement event route. It starts a clean run, unlocks
`collect50Hydrogen` through the Hydrogen Collect control, and expects one
visible `achievement` classification with Cosmic Forge's English achievement
and reward copy. It also checks the active Collect control keeps focus through
the notice's display and dismissal. The focused installed-Chrome check passed
1/1, and the six-locale unit coverage passed 2/2. The navigation screenshot
was refreshed after visual review to account for the current page layout. The
achievement test also captures the live notice; I reviewed its source-style
gold border and message.

Focused command:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4300'; node .\node_modules\playwright\cli.js test --workers=1 --retries=0 --trace=off --reporter=line -g 'announces the Collect 50 Hydrogen achievement' tests/e2e/notifications/notice-focus-stability.spec.ts
```

## P-20 Rocket return cross-tab announcement (9 October 2026)

Cosmic Forge's `game.js` return-timer callback sends the localized
`notificationRocketReturnedToRefuel` notice as an `info` Rocket notification
for 3000ms. The remake routes the accepted `space.rocket.returned` event through
the app-level subscriber to the global polite live region; its localized
notice includes both Rocket and asteroid names and lasts 3000ms. The remake
now uses the source-matched `info` severity for both Rocket arrival and return.
The focused Spanish Chrome case starts the deterministic returning-Rocket
fixture, selects Settings, advances the return timer, and verifies the
localized message is a polite, atomic status announcement while Settings
stays selected. After correcting the source severity discrepancy, the updated
browser assertion for `notification-info` passed 1/1 in 5.5s; focused unit
assertions verify both Rocket arrival and return mappings.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4375'; npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/notifications/rocket-return-cross-tab.spec.ts
```

Focused severity check:

```powershell
npm.cmd run test:unit:focused -- tests/unit/space-event-notifications.spec.ts
```

## P-08 Galactic Market lockdown entry notice (9 October 2026)

Cosmic Forge `ui.js:10945-49` emits `notificationGalacticMarketOffline` as a
`special` warning for 3000ms when the Market child option is selected during
the timed lockdown. The remake now routes the same source copy at that child
navigation boundary, without adding an engine event. The focused unit test
checks the source message, classification, severity and duration across all
six locales, plus silence outside a lockdown. Its run passed **4/4**; `npm.cmd run typecheck`
passed. The installed-Chrome journey confirms selecting Market without a
lockdown stays quiet, then a forced lockdown followed by selecting Market
shows exactly one matching warning toast; it passed **1/1** in 5.3 seconds
with a clean exit on port 4473.

Focused commands:

```powershell
npm.cmd run test:unit:focused -- tests/unit/galactic-market-event-notifications.spec.ts
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4473'; npm.cmd run test:e2e:focused -- tests/e2e/notifications/galactic-market-lockdown-notification.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

P-08 remains open. The [route audit](../../../docs/audit/notification-route-audit.md#remaining-source-notification-family-matrix-9-october-2026)
records the Megastructure availability-cue equivalence, the implemented
Galactic-unlock notice, the conditional Power Plant sale route, and intentional
local-save, disabled-action and silent event boundaries. Casino gaps also
remain open.

## P-08 Megastructure availability cue (9 October 2026)

Cosmic Forge `game.js:3897-3919` reveals the Megastructure option when the
run is eligible, the tab is unlocked, or a structure has been captured. On the
first eligible Megastructure run, it emits a one-time localized info notice,
then records that the notice was shown. In the remake, `galacticPaneItems()`
reveals `galactic-megastructures` from the corresponding factory-system
manuscript/settlement, capture, or research state. `App.tsx` detects newly
available pane IDs and records navigation attention; `PaneNavigation` displays
the localized `New` badge until that child page is visited. This persistent
page-attention cue already marks the newly available option, so a separate
toast would duplicate the same information and was not added. The focused
`presentation-navigation.spec.ts` unit file passed **18/18**, covering
Megastructure visibility and the generic attention discovery/clear lifecycle.
The installed-Chrome case `@p08-megastructure-attention` passed **1/1 in 7.1
seconds** on port 4548. It starts with the manuscript's factory system neither
current nor settled and confirms that Galactic and Megastructures are absent
with no pending page attention. Settling that factory system through Colonise
reveals the page and adds attention; the persistent `New` cue is checked in all
six locales, remains after navigating away, and clears on visiting
Megastructures. The case also confirms that no Megastructure toast duplicates
the badge. No new notification copy or engine event was needed. P-08 remains
open for the other source families and Casino gaps.

## P-08 Galactic tab unlock notice (9 October 2026; settlement trigger superseded 12 October)

The exact-copy results below are historical for the then-current settlement-target implementation; its assertions were updated on 12 October and have not been rerun. Source review now confirms that the synthetic `apAwardedThisRun` tech-array marker is added on first-run Starship arrival, which reveals Galactic and Casino before settlement; rebirth seeds it again. The remake routes the Galactic notice from first-run `space.starship.arrived`.
The existing inline settlement feedback reports that AP and GP rewards were
recorded, but does not identify the newly revealed Galactic tab, so the toast
adds distinct progression guidance. The exact six-locale copy is asserted
against Cosmic Forge's strings in `space-event-notifications.spec.ts`; the
focused unit file passed 9/9. An installed-Chrome journey wins and settles the
seeded Sirius encounter through visible controls, verifies Galactic changes
from hidden to visible, checks the separate inline reward feedback, and sees
exactly one warning toast; it passed 1/1 in 6.4 seconds on port 4542.
`npm.cmd run typecheck` passed. No separate settlement UI message was removed.

Focused commands:

```powershell
npm.cmd run test:unit:focused -- tests/unit/space-event-notifications.spec.ts
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4542'; npm.cmd run test:e2e:focused -- tests/e2e/notifications/space-milestone-notifications.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g '@p08-galactic-unlock'
```

P-08 remains open for the other source notification families and Casino gaps.

## P-08 Double-or-Nothing guard equivalence (9 October 2026)

Cosmic Forge shows 2500ms informational notices for invalid and unaffordable
Double-or-Nothing stakes. The remake has no accepted engine event for these
rejected attempts; instead, it disables Play and shows the localized reason
next to the action, linked with `aria-describedby`. A focused Chrome case
checks the fractional-stake and insufficient-CP reasons and confirms neither
adds a Casino toast. The case passed in the 3/3 `@p08-notifications` Casino
run on port 4544. The focused Casino notification unit file passed 9/9 after
its Double-or-Nothing win/loss copy was pinned to Cosmic Forge's six locale
strings; that check caught and corrected the Spanish loss suffix. See the
[Casino browser evidence](../../../tests/e2e/galactic-casino/README.md) and
[route audit](../../../docs/audit/notification-route-audit.md).

```powershell
npm.cmd run test:unit:focused -- tests/unit/casino-event-notifications.spec.ts
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4544'; npm.cmd run test:e2e:focused -- tests/e2e/galactic-casino/galactic-casino.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g '@p08-notifications'
```

## Rapid Expansion result notices (9 October 2026)

Rapid Expansion now emits a typed resolution event for peaceful settlement,
non-conquest settlement, extra systems captured, no eligible nearby systems,
and failed capture. The ordinary battle victory/defeat notice stays separate,
and the event carries captured system IDs from the existing outcome without
changing gameplay effects. Expansionist ability activation has its own
localized `tech` notice. Captured-system copy uses full singular/plural
templates in all six locales, `Intl.PluralRules`, the active locale and number
notation for the count, and locale-aware conjunction formatting for star names.

The focused unit run passed **3 files / 33 tests**, covering all five outcomes
in six locales, one-versus-many grammar, Standard notation formatting, and the
Expansionist activation route. The deterministic installed-Chrome battle
journey passed **1/1 in 6.1 seconds** on port 4556 and checks the displayed
captured-system count and names.

```powershell
npm.cmd run test:unit:focused -- tests/unit/space-event-notifications.spec.ts tests/unit/philosophy-event-notifications.spec.ts tests/unit/space-rules.spec.ts
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4556'; npm.cmd run test:e2e:focused -- tests/e2e/notifications/space-milestone-notifications.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g 'announces captured systems from Rapid Expansion'
```

The full project typecheck is currently blocked by concurrent Casino copy-key
errors in `GalacticCasinoPane.tsx` (`plays` and `wins` are not in `CasinoCopy`);
the TypeScript run reported no Rapid Expansion diagnostics. P-08 remains open
while the remaining source-family matrix and edge-case acceptance are reconciled.

## P-08 manual Compound creation and autosave-off notices (10 October 2026)

Manual Compound creation now routes a notice from the clicked command's accepted
result only. It uses localized output and recipe ingredient amounts with the
active notation, `create` classification, info severity, and 3000ms lifetime.
This boundary prevents the `compound.created` events emitted by automatic
production ticks from producing notices. Installed Chrome passed **2/2**:
one visible Diesel creation updates the input/output balances and shows exactly
one notice, while automatic Diesel production increases stock without a
`create` notice. The focused unit and localization run passed **4 files / 32
tests**; `npm.cmd run typecheck` passed.

Turning off the existing autosave preference now shows the exact six-locale
Cosmic Forge reminder with `loadSave` classification, error styling, and a
5000ms lifetime. The installed-Chrome case passed as part of the **3/3** run;
it confirms the warning remains after 3.2 seconds and is dismissed by 5.7
seconds. The six-locale copy is covered in
`tests/unit/save-notification-messages.spec.ts`.

The source-callsite reconciliation also records inline equivalents for empty
Star Map search, rejected Fusion actions, and debug action status; removed bulk
storage and global sell-all actions have no current remake action to notify.
Cloud/offline-save callsites remain excluded by the local-save contract. P-08
remains open pending the rest of the source-route and layering/preference audit.

The Phase 7 locale route in `p7-economy-notification-locales.spec.ts` checks
selected-locale Storage Full copy and Increase Storage actions across six
locales for both resource and compound storage. It checks active Fusion
efficiency and storage-limited notices' localized names and yields, and the
category-level Increase All actions' exact aggregate result across both
categories in all locales. It is **AUTHORED, NOT RUN**; execution is deferred to Phase 8. Cosmic Forge's
`notificationCompoundCreatedWithWaste` has no floating-notice counterpart:
MIAPLACIDUS rejects manual creation that would exceed compound capacity and
renders the existing inline inventory-full reason. Invalid Fusion previews are
also rejected by the typed command path instead of showing the source's
internal parsing-error toast.

```powershell
npm.cmd run test:unit:focused -- tests/unit/compound-created-notifications.spec.ts tests/unit/save-notification-messages.spec.ts tests/unit/space-event-notifications.spec.ts tests/unit/localization-validation.spec.ts
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4569'; npm.cmd run test:e2e:focused -- tests/e2e/notifications/compound-create-notifications.spec.ts tests/e2e/notifications/autosave-off-notifications.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

## P-08 source-wide reconciliation and completion (10 October 2026)

The current source notification callsite sweep is complete. All active supported
player results have a localized route; rejected actions retain visible inline
reasons, the Megastructure unlock uses its persistent `New` cue, debug and
local-save outcomes stay in their UI status surfaces, and automatic production
or progress remains silent. Cloud/offline-save, old Cosmic Forge imports, and
source bulk-sell/storage or power-plant sale actions have no current remake
counterpart. The full dispositions and source references are in the
[notification route audit](../../../docs/audit/notification-route-audit.md#p-08-source-wide-final-reconciliation-and-sign-off-10-october-2026).

Focused verification passed on 10 October: 12 notification/scheduler/localization
unit files, **77/77 tests**; installed Chrome **14/14** across active P-08 routes
and critical-dialog layering; Market-lockdown route **1/1**; and TypeScript
checking. These results supersede the earlier dated notes in this README that
said the source-route or Casino audit was still open. P-08 is signed off.

## P-20 timer-driven weather announcement across tabs (10 October 2026)

Cosmic Forge advances weather in `game.js:10562-10603` and calls `showWeatherNotification` for rain or volcanic hazards; `ui.js:5620-5651` routes those alerts to the global notification system. MIAPLACIDUS emits `space.weather.changed` from `completeSpaceWeatherCycle` when the weather timer completes (`src/engine/spaceMechanics.ts:2038-2054`), and `App` routes the event independently of the selected tab through `spaceEventNotifications.ts`. Existing hazard tests set weather directly, so they did not verify this real timer-completion path off-page. The new focused Chrome regression clears weather, selects Hydrogen, reads the weather timer remaining duration and advances the deterministic test clock through each expiry until a severe condition occurs, then verifies a single localized `role=status` notice in the persistent polite, atomic notification region while Hydrogen stays selected. The clock-driven version passed **1/1 in 5.9 seconds**. No production fix was needed. This proves browser live-region semantics only; no manual screen reader was run, and P-20 remains open.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/notifications/space-event-notifications.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g "announces timer-triggered severe weather"
```


## Economy catchall migration (14 October 2026)
Fusion, research-completion, power-trip, and related notification cases formerly in the Economy catchall now live in [`economy-notifications.spec.ts`](economy-notifications.spec.ts) and [`p45-early-research-notification.spec.ts`](p45-early-research-notification.spec.ts).

The canonical Notifications folder passed **34/34** in installed Chrome on 14 October 2026 with snapshot updates disabled. Visual review found the English Research completion capture's Tech Tree viewport had grown by 110px in the current renderer while all content and controls remained visible; that single stale baseline was refreshed, and the complete area passed on rerun.

## Phase 7 first-arrival Galactic unlock dialog (NOT RUN; Phase 8)

Cosmic Forge `game.js` shows `modalGalacticTabUnlockHeader` and
`modalGalacticTabUnlockText` when the first Starship reaches orbit; confirming
that modal then emits `notificationGalacticTabUnlocked`. MIAPLACIDUS now routes
the six-locale dialog through `spaceProgressionDialogMessages.ts` and
`spaceEventNotifications.ts`, then emits the existing localized
`spaceNotificationMessages.ts#galacticTabUnlocked` toast after confirmation.
The ordinary Starship arrival notice remains separate. Source
`buttonConfirmUpper` maps to the dialog catalogue's `confirmLabel`.

`space-milestone-notifications.spec.ts` now verifies the visible modal,
localized paragraphs and confirm action in all six locales. Its existing
English first-arrival case also checks that the unlock toast follows the
confirmation. These authored assertions are **NOT RUN**; Phase 8 owns browser
execution.
