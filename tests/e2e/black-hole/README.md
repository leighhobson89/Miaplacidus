# Black Hole browser coverage

Behavior baseline: Cosmic Forge `game.js`, `resourceDataObject.js`, `constantsAndGlobalVars.js` and `drawTab7Content.js`; rules and source limits are recorded in the archived [meta endgame contract](../../../docs/archive/plans/2026-10-04-meta-endgame.md) and [foundation meta audit](../../../docs/audit/foundation-meta.md).

The browser spec uses a deterministic discovered-hole fixture, researches through the Black Hole child pane in Galactic, and verifies the visible charge countdown and progress advance while that page remains selected. It saves and reloads during charge, advances simulated time through the Ready state, and activates the visible time warp without directly completing the timer. Seeded discovery chance, exact prices/upgrades, offline expiration and timer completion idempotency are covered by `tests/unit/black-hole.spec.ts`.

Verification record (4 October 2026): Chrome `npm.cmd run test:e2e:focused -- tests/e2e/black-hole/black-hole.spec.ts` passed 1 browser journey. The once-only G-31–G-42 unit suite passed 20 files / 205 tests. Later fixes were checked only in affected areas.

P-07 verification: the focused system Chrome journey passed 1/1. It observes visible remaining time and progress increase while the Black Hole pane stays selected, saves and reloads during charge, advances the remaining duration to the visible Ready state, then activates the warp without directly completing the timer.

P-06 affordability verification: the underfunded 999,999 RP fixture shows the 1,000,000 RP Black Hole research cost, keeps the control disabled, and exposes the visible localized shortfall reason through `aria-describedby`. The focused Chrome case passed 1/1 in 2.3 seconds. Typecheck passed; the runner exited 0 after stopping its test-owned Vite server (PID 13712), and port 4173 was confirmed closed.

P-06 upgrade-affordance verification (6 October 2026): the discovered-hole fixture researches through the player pane, shows the 850,000 RP power-upgrade cost, and applies the purchase through the enabled control. The pane updates from 5× to 7× power, subtracts the cost from the 2,000,000 RP balance, and previews the next 960,500 RP price. The focused Chrome case passed 1/1 in 3.3 seconds with Playwright exit 0, using a separately started `dev:test` server; the server was then stopped and port 4173 confirmed closed.

Focused command:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/black-hole/black-hole.spec.ts -g "shows the Black Hole power upgrade cost and applies its effect" --reporter=line --workers=1 --retries=0 --trace=off
```

P-04 live attention verification (7 October 2026): after the charge timer completes, `Ready` appears on both the Galactic main tab and Black Hole child tab. Activating the warp clears both `Ready` indicators. The focused Chrome journey passed 1/1:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/black-hole/black-hole.spec.ts -g 'researches, charges, saves and activates the Black Hole' --reporter=line --workers=1 --retries=0 --trace=off
```

P-20 warp-activation announcement verification (8 October 2026): an initially empty polite, atomic screen-reader-only region receives the localized active-state label only after the accepted black-hole.warp-activated event. It clears when the warp expires and countdown updates remain silent. Unit coverage passed 3/3 across all six locales. The focused Chrome journey passed 1/1 and checks the initial empty state, ARIA settings, activation announcement, existing warp state and cleared navigation badges, and empty output after expiry; it uses the focused command already listed above.

P-08 Black Hole notification follow-up (8 October 2026): successful discovery and charge-completion events now show the localized source notices; failed discovery rolls and unrelated milestones remain silent. Both notices use `special` classification, info styling, and a 3000ms lifetime, verified in all six locales by `black-hole-event-notifications.spec.ts` (3/3). The full Black Hole Chrome spec passed 3/3 after updating number expectations for the Condensed default. Only `black-hole-warp-active.png` was refreshed after the charge toast expired and visually reviewed.

P-64 timer follow-up (8 October 2026): active Black Hole charging and time-warp operations show separate accessible progress bars. The focused player journey verifies the charging bar, hides it when charged, checks the active-warp bar alongside the still-visible stats/upgrades, advances it, and confirms it disappears after expiry. The focused installed Chrome case passed 1/1.

P-65 page identity follow-up (8 October 2026): the player-pane journey checks one visible `Black Hole` heading and exactly one visible artwork row containing the black-hole illustration. The `black-hole-warp-active.png` snapshot was refreshed and visually reviewed. The focused no-update Chrome case passed 1/1 in 8.3 seconds; broader theme, locale, and viewport review remains open under P-65.

P-65 identity matrix follow-up (8 October 2026): the Black Hole page now has a focused matrix for all six locales, nine themes, and 1280px, 390px, and 320px viewports (162 combinations). It checks the localized single heading and shared title class, the one visible black-hole artwork row, and title/artwork/document horizontal bounds. The installed-Chrome case passed 1/1 in 20.8 seconds. This closes the Black Hole identity slice; P-65 still needs remaining page and cross-theme visual evidence.

P-64 timer accessibility assertion follow-up (8 October 2026): charging and time-warp journeys now locate each timer by its exact accessible `progressbar` name and assert native current/maximum values. The focused Chrome journey also confirms the associated status row remains readable and changes as timers advance. Focused installed Chrome command passed 1/1:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/black-hole/black-hole.spec.ts --workers=1 --retries=0 --trace=off --reporter=line -g "researches, charges, saves and activates the Black Hole"
```

P-64 localized timer-name follow-up (8 October 2026): the same live charge and warp journey switches the visible game language through English, Spanish, Portuguese, German, Italian, and French while each timer is active. In every locale it verifies the progress bar's exact localized accessible name, its `aria-label`, and finite native progress `value`/`max` values with the current value below the maximum; the journey restores English before continuing its existing save/reload and expiry checks. Focused installed Chrome command passed 1/1:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/black-hole/black-hole.spec.ts -g 'researches, charges, saves and activates the Black Hole' --reporter=line --workers=1 --retries=0 --trace=off
```

P-49 locale-invariant follow-up (9 October 2026): a separate six-locale browser journey switches language while a Black Hole charge is active and checks that the tab IDs, numeric research/upgrade prices, charge timer identity/status/duration, and saved slot head key remain stable. The timer's elapsed value never resets, and the displayed upgrade prices remain the same numbers with locale formatting. Focused installed Chrome passed 1/1 after a locale-neutral save-status assertion; only the Black Hole route is covered, so whole-game price/identity review remains open.

P-41 number notation follow-up (9 October 2026): the visible Black Hole player
journey now checks both charge and active time-warp status countdowns against
the selected Condensed, Standard, and Scientific number formatter. The focused
installed-Chrome journey passed 1/1 while both timers were active. Run with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4260'
npm.cmd run test:e2e:focused -- tests/e2e/black-hole/black-hole.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g 'researches, charges, saves and activates the Black Hole'
```

**P-41 Black Hole Research Point price (9 October 2026):** the visible
Black Hole research action's RP price and current RP balance are checked
against the active state in Condensed, Standard, and Scientific. The fixture
keeps the discovered Black Hole unresearched and leaves Research Points
unchanged. This case passed as part of the focused installed-Chrome P-41 run
(2/2 in 13.2 seconds on port 4325); the combined command is recorded in the
[Star Map README](../star-map/README.md).

**P-20 purchase-failure status follow-up (9 October 2026):** the underfunded
Black Hole research reason is linked to its disabled research action and now
uses a polite, atomic `role="status"` region. The focused
`@p20-announcements` browser case checks the relationship, role, live settings,
and localized shortfall copy. This verifies one additional failure route; other
disabled purchase surfaces still need a similar acceptance audit.

The same P-20 tag now covers the charge-completion toast: the browser journey
checks that it arrives inside the shared polite notification region and that
the notification itself is atomic, in addition to the dedicated Black Hole
ready-state announcement. Other timer-family notices still need focused
coverage.

## P-20 Black Hole charge completion after leaving its tab (10 October 2026)

`p20-charge-cross-tab.spec.ts` starts Black Hole research through its visible
control, selects Hydrogen before the charge completes, and advances the
deterministic timer. In each of `en`, `es`, `pt`, `de`, `it`, and `fr`, the
localized charge notice appears in the always-mounted global notification
region while Hydrogen remains selected. The browser checks the persistent
region's polite setting and the notice's status role, atomic setting, info
style, and localized text. This verifies the DOM/live-region route only; no
spoken assistive-technology behavior is claimed. No production change was
needed: `src/app/App.tsx` routes the engine event through
`src/app/blackHoleEventNotifications.ts` to `src/app/NotificationStack.tsx`.
Cosmic Forge's `../cosmicForge/cosmicForge/game.js:11192` also sends its
charge-completion notice from the timer callback.

The focused installed-Chrome run passed 6/6 in 14.9 seconds on isolated port
5964:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='5964'; npm.cmd run test:e2e:focused -- tests/e2e/black-hole/p20-charge-cross-tab.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-20 Black Hole warp expiry follow-up (11 October 2026):** the timer emits
`black-hole.warp-ended`, but this event previously only cleared the Black Hole
pane's active-state announcement. Cosmic Forge does not show a visible notice
when the warp ends, so the remake now sends the localized state change to a
global screen-reader-only polite status region. This announces expiry while
another page is selected without adding a visible toast. The new unit case
covers all six locales, and `p20-warp-end-cross-tab.spec.ts` checks the status
region and confirms no visible notification is added. The implementation and
assertions were added; no test, build, typecheck, or format command was run for
this slice.

Focused browser command for later verification:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='5965'; npm.cmd run test:e2e:focused -- tests/e2e/black-hole/p20-warp-end-cross-tab.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

## P-65 durable Black Hole visual review (9 October 2026)

`p65-visual-review.spec.ts` adds four checked-in Black Hole captures: English/Terminal desktop, German/Light phone, French/Supernova desktop, and Portuguese/Galaxy phone. All four reviewed images retain the localized Black Hole title, the black-hole artwork row, and the research action without visible clipping. This complements the existing 6-locale × 9-theme × 3-viewport identity/bounds matrix with representative screenshots. No presentation defect requiring a source change was found. The snapshot-generation run passed as one of two focused visual cases, and the no-update Chrome rerun passed 2/2 across Research and Black Hole.

The files are in `tests/e2e/black-hole/p65-visual-review.spec.ts-snapshots/`:

- `p65-black-hole-terminal-en-desktop.png`
- `p65-black-hole-light-de-phone.png`
- `p65-black-hole-supernova-fr-desktop.png`
- `p65-black-hole-galaxy-pt-phone.png`

## P-13 Black Hole charge context at narrow widths (9 October 2026)

The focused narrow-context case researches the discovered Black Hole, advances
its charge by 30 seconds, then checks the live page at 390×844 and 320×740. At
both widths the current Research Point and Cash balances remain visible; the
status shows the matching 270-second countdown; the charge progress bar and
three Research Point upgrade prices stay visible; and the disabled Charging
action retains its visible reason. The test checks those displayed values
against the current saved state and verifies each context element and the
document fit within the viewport. I reviewed both captures: the stats and
actions stack cleanly at 320px, the description wraps without clipping, and
the full panel stays inside the page. No presentation defect surfaced.

The baselines are `p13-black-hole-charge-390.png` and
`p13-black-hole-charge-320.png` in
`tests/e2e/black-hole/p13-black-hole-narrow-context.spec.ts-snapshots/`.
Snapshot generation passed 1/1 in 6.2 seconds; the final no-update run passed
1/1 in 6.1 seconds in installed Chrome on port 4340.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4340'; npm.cmd run test:e2e:focused -- tests/e2e/black-hole/p13-black-hole-narrow-context.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --update-snapshots
```

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4340'; npm.cmd run test:e2e:focused -- tests/e2e/black-hole/p13-black-hole-narrow-context.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

## P-54 E-57 localized Black Hole research and upgrade context (10 October 2026)

p54-e57-black-hole-locale-context.spec.ts checks the initial research RP price, then starts research and verifies the localized charging status/countdown and native progress indicator. It checks all three visible dynamic upgrade prices (Power, Duration, Recharge) at 390px and 320px across all six locales. Pane, status, upgrade list, and document bounds are checked. The French 320px capture was visually reviewed; the long translated upgrade labels fit their buttons. The case passed in the combined installed-Chrome E-57 Meta/Endgame batch, 13/13 in 57.5 seconds on port 4809.

## P-29 Black Hole audio parity (10 October 2026)

The new visible player-pane audio journey uses `meta-black-hole-discovered`: Research plays the normal `clickButton` action cue, the simulated charge completion is silent, and activating the ready warp plays exactly one `blackHoleActivated.mp3`. This matches Cosmic Forge's generic research-button cue, silent charge timer completion, and explicit `blackHoleActivated` call when the ready charge is consumed. The existing unit route also verifies `blackHoleActivated` for the always-on Recharge upgrade; that specific upgrade is not reached by the current visible fixture. Installed Chrome passed 1/1 as part of the 6-case audio run on isolated port 4936. The focused `audio-event-dispatch.spec.ts` passed 25/25, including explicit silent research/charge events and warp mapping.

## P-45 Black Hole charge completion notice (10 October 2026)

`p45-charge-notice-locales.spec.ts` researches the discovered Black Hole through
its visible control, advances the deterministic charge timer, and verifies the
global completion notice in each of the six locales. Existing Black Hole
coverage already checks the underfunded research reason in all locales; this
adds the rendered timer-result notice. The combined focused Meta run passed
9/9 in installed Chrome on port 5077.

## P-06 Black Hole action affordances (10 October 2026)

`BlackHolePane` now derives each Research, upgrade, and activate/charge control's enabled state and disabled reason from one `selectEconomyAction` selection. This keeps the visible affordance and its localized shortfall/recovery reason tied to the same current state; it does not change engine costs or action behavior.

`p06-black-hole-action-affordances.spec.ts` checks Research and its selector state, buys Power and Duration, then verifies that underfunded Recharge is disabled with its linked reason in all six locales. After adding Research Points through the test-only gateway, the selector and control enable; the test purchases Recharge, checks its price/payment and reduced active-charge duration, then verifies the Charging lock, Ready recovery, and Warp-active lock. The focused installed-Chrome run passed 1/1 on isolated port 4837. `tests/unit/black-hole.spec.ts` passed 8/8, `npm.cmd run typecheck` passed, and Oxfmt check passed.

## P-45 Black Hole fixed page copy (10 October 2026)

`p45-fixed-copy-locales.spec.ts` fills the remaining fixed-copy browser gap without repeating the P-54 price matrix or P-45 completion notice. Across `en`, `es`, `pt`, `de`, `it`, and `fr`, it checks the page heading and status heading, research-points label and research action, researched summary, Power/Duration/Recharge/Status labels, upgrade action names, and the displayed Charging, Charge ready, and Time warp active states/actions. The rendered wording is checked against `blackHoleText(locale)` while the source comparison is Cosmic Forge `localization.json`'s `headerMainBlackHole`, `blackHoleInteractionResearchPointsLabel`, Black Hole button labels, and `textBlackHole*` status keys. No copy mismatch was demonstrated, so this slice changes tests and evidence only.

The focused installed-Chrome case passed 1/1 in 6.8 seconds on isolated port 5126. `npm.cmd run typecheck`, Oxfmt check, and `git diff --check` passed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='5126'; npm.cmd run test:e2e:focused -- tests/e2e/black-hole/p45-fixed-copy-locales.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

This case covers fixed labels/actions in the discovered, researched, charging, ready, and active-warp states. Discovery-only copy shown before the Black Hole tab is available, the always-on end-state, and command-failure messages remain covered by their separate paths or are outside this fixed-copy case.

## P-56 Black Hole charging content matrix (10 October 2026)

`p56-black-hole-content-visual-matrix.spec.ts` uses the discovered-hole
fixture, researches through the visible Black Hole control, and advances the
deterministic charge by 30 seconds. It checks the charging summary, all four
localized stat labels and values, localized countdown and native progress,
all three enabled upgrade controls with their current RP costs, and the
disabled charging action with its localized linked reason across six locales,
nine themes, and 1280px, 390px, and 320px viewports (162 combinations).
Document, pane, text, progress, upgrade, action, and reason bounds are checked
for horizontal and vertical overflow. No presentation defect was found, so no
app code changed.

I reviewed the English/Terminal 1280px, German/Light 390px, and French/Space
320px captures. The long French text wraps within the stats and button cards;
the timer, upgrade costs, and disabled-action reason remain readable and the
page fits the viewport.

The checked-in captures are in
`tests/e2e/black-hole/p56-black-hole-content-visual-matrix.spec.ts-snapshots/`:

- `p56-black-hole-terminal-en-charge-desktop.png`
- `p56-black-hole-light-de-charge-390.png`
- `p56-black-hole-space-fr-charge-320.png`

The installed-Chrome snapshot-generation run passed 1/1 in 33.2 seconds; the
no-update rerun passed 1/1 in 28.9 seconds on isolated port 5521. The focused
typecheck, formatter, and README diff checks passed:

```powershell
npm.cmd run typecheck
node_modules\.bin\oxfmt.cmd --check tests/e2e/black-hole/p56-black-hole-content-visual-matrix.spec.ts
git diff --check -- tests/e2e/black-hole/README.md
```

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='5521'; npm.cmd run test:e2e:focused -- tests/e2e/black-hole/p56-black-hole-content-visual-matrix.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --update-snapshots
```

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='5521'; npm.cmd run test:e2e:focused -- tests/e2e/black-hole/p56-black-hole-content-visual-matrix.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-20 purchase-reason source audit addendum (11 October 2026):** the underfunded research reason remains visible and linked to the disabled research action with `aria-describedby`, but its balance-derived text is no longer a live region. The 9 October status-role browser assertions describe the previous implementation and need reconciliation in the deferred regression pass. Command-level rejection feedback remains politely announced. No checks were run; manual spoken assistive-technology review remains open.

### Saved regression failure replay (14 October 2026)

The two saved Black Hole failures were rerun against the current specs in
installed Chrome: P-06 action affordances and the P-56 localized charging
content matrix. Both passed (**2/2 in 43.8 seconds**) on port 6715 with no
snapshot updates.
The saved P-06 context predates the source-aligned upgrade locators; the saved
P-56 timeout predates its explicit five-minute case timeout. No further
product or test changes were needed. Playwright artifacts are in
`%TEMP%\miaplacidus-black-hole-saved-two-20261014\test-results`.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='6715'; npm.cmd run test:e2e:focused -- tests/e2e/black-hole/p06-black-hole-action-affordances.spec.ts tests/e2e/black-hole/p56-black-hole-content-visual-matrix.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g 'Black Hole Recharge shortfall, recovery, charge, and warp actions match engine selection|P-56 Black Hole charging content fits all locales, themes, and viewports'
```

## P-65 Galactic Black Hole page identity

`p65-meta-identity.spec.ts` verifies the Black Hole child heading, shared title
treatment, Black Hole illustration, Hydrogen title scale, and bounds at 1280px
and 390px. It uses the discovered-hole fixture because the megastructure-route
fixture leaves the Black Hole child locked. The corrected owner-area case
passed 1/1 in 6.4 seconds in installed Chrome on port 6717, without snapshot
updates. The desktop and phone diagnostics are Playwright output attachments
under `%TEMP%\miaplacidus-p65-black-hole-identity-20261014`; no checked-in
snapshot baseline exists for the former catch-all.

### Complete area rerun (14 October 2026)

The canonical Black Hole folder passed **27/27** in installed Chrome in 3.0
minutes on port 6461 with snapshot updates disabled. Screenshot expectations
were checked, and no test or baseline changes were needed. Artifacts are under
`%TEMP%\miaplacidus-black-hole-focused-6461-r1-20261014`.

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/black-hole --project=chrome --workers=1 --retries=0 --update-snapshots=none --trace=retain-on-failure --reporter=line
```
