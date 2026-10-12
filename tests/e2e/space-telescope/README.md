# Space telescope, asteroids and rockets

## Rule matrix

| Rule                 | Normal path                                                                                                            | Boundary path                                                                                 | Evidence                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Telescope surveys    | Build the telescope, start asteroid/star surveys, and persist their timers. Voidborn Pillage uses the same timer path. | Power, technology, active-survey, scan-miss, philosophy and ability gates are engine-checked. | `space-telescope.spec.ts`, `space-rules.spec.ts` |
| Discovery records    | Use a saved seeded random stream for rarity, distance, stock, ease and commander-derived legendary names.              | Preserve interacted, reserved and depleted asteroids during safe pruning.                     | `space-rules.spec.ts`                            |
| Rocket assembly      | Pay launch-pad and compounded part costs, rename the four rocket records, and fuel through powered pumps.              | Reject incomplete builds, missing fuel technology, no power, and bad launch weather.          | `space-telescope.spec.ts`, `space-rules.spec.ts` |
| Rocket journey       | Reserve a distinct target, complete travel, mine into shared antimatter, return on depletion, and reset for retry.     | Ordinary timer completion and a large offline advance must not duplicate extraction.          | `space-rules.spec.ts`                            |
| Automation and boost | Unlock Auto Telescope through its perk; hold the antimatter boost control to double mining.                            | Stop boosts on pointer release, cancellation, focus loss or pane unmount.                     | `space-rules.spec.ts`                            |

Rules were compared with the locked Cosmic Forge snapshot and are summarized in [`space-mining-contract.md`](../../../docs/plans/space-mining-contract.md).

## Deterministic setup

The browser fixture `space-telescope` starts a named run with researched space technology, stock, power and a stable random seed. Browser tests use real controls and the test clock. Engine tests construct saved-state scenarios for weather holds, timer completion and four concurrent rockets.

Run later with `npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/space-telescope.spec.ts`; the pure rules file is `tests/unit/space-rules.spec.ts`.

## Current evidence

`tests/unit/space-rules.spec.ts` passed 14 tests. `tests/e2e/space-telescope/space-telescope.spec.ts` reported all four browser scenarios passing in system Chrome with Playwright video disabled. The full suite reported all 57 browser cases passing in Chrome with video capture disabled. Playwright remained alive after the final case and was stopped manually; its server had already exited.

On 2026-10-04, the focused Rocket assembly case passed in installed Google Chrome 154 (`MIAPLACIDUS_BROWSER_CHANNEL=chrome`): 1 passed, exit code 0. Running against an already-started test server avoids the Windows web-server shutdown hang.

The same date, the `@ui-navigation` group passed 4/4 cases in Chrome, including checks that all four Rocket child tabs are initially absent and that building Rocket 1 reveals only Rocket 1's page. Unbuilt rocket assembly cards remain available under Launch Pad.

On 2026-10-05, the focused Space Mining browser file passed 4/4 in Chrome. Coverage now reflects page ownership and unlock visibility: Mining is absent before antimatter unlock, telescope construction and auto-survey controls are tested on the Space Telescope child page, and each Rocket child page remains hidden until that rocket is complete.

Also on 2026-10-05, the focused P-07 countdown run passed 5/5 in installed Chrome. The owning Space Telescope page shows decreasing weather and survey timers; each Rocket page shows outbound or return time remaining, and fuel pumping shows a live time-to-full that pauses without production when paused and resumes after restarting. The focused test command also checked the Starship route; see the [Starship evidence](../starship/README.md).

The deterministic Rocket assembly journey captures a full-page visual checkpoint named `space-rocket-1-ready` after Rocket 1 is assembled and its page is selected, before fuel pumping begins. The focused Chrome journey passed 1/1 both during snapshot generation and without snapshot updates. The 1280px Terminal screenshot was reviewed: it shows Rocket 1 under Space Mining, the built-only child tab, weather context and the locked-until-fueled launch control.

The same journey switches to 390×844 after the desktop capture, asserts no document horizontal overflow and that Rocket 1 stays within the Space Mining content pane, and captures `space-rocket-1-mobile`. It restores the 1280px viewport before continuing to fuel-pump actions. The focused Chrome journey passed 1/1 during snapshot generation and again without snapshot updates. The mobile screenshot was reviewed: the Rocket 1 card fits the Space Mining pane, the launch action and fuel requirement remain visible, and the page has no horizontal overflow.

On 2026-10-06, the focused space-telescope browser file passed 7/7 in installed Chrome. The new Rocket journey uses the deterministic fixture and asteroid scenario setup, then builds, fuels and launches two rockets through the UI. With no asteroid selected, Travel is disabled and points to the localized reason via `aria-describedby`; selecting a free asteroid enables travel and reserves it for Rocket 1, while Rocket 2 receives the disabled reason for that reserved target.

The same area now covers the rocket-part cost boundary: one Steel below the first part price disables Build Rocket Part and points to the visible localized requirement through `aria-describedby`; exact stock enables it and the browser journey confirms the quoted cash, Glass, Titanium and Steel costs are all deducted. Focused Chrome results are recorded under P-06 in the Phase 6 checklist.

On 2026-10-06, both cost journeys passed independently in installed Chrome (1/1 each): the shortfall check and the exact-stock purchase. The purchase case also confirms the next displayed quote applies the 13% escalation to each cost, then verifies the second part is disabled with its updated 3,390 Steel requirement connected through `aria-describedby`. The extended exact-stock journey reran after that assertion was added and passed 1/1 in 3.5 seconds with a clean Playwright exit.

The same date, the Rocket fueling case passed 1/1 after adding a real Power grid toggle. Grid loss keeps pump automation enabled, displays “Turn on the power grid before fueling.”, and leaves the fuel quantity unchanged; restoring power resumes the ETA, while a user pause still displays “Fueling is paused.”

After these additions, the complete focused space-telescope Chrome spec passed 8/8 with `MIAPLACIDUS_BROWSER_CHANNEL=chrome`, video disabled and one worker.

The zero-rate Mining boost affordance also passed a focused 1/1 Chrome check using the deterministic late-game fixture. The button is disabled, its visible reason is connected with `aria-describedby`, and its boost state remains inactive.

## Rocket fuel-ready notification (8 October 2026)

When an enabled, powered Rocket pump first reaches capacity, the `space.rocket.fuel-ready` event now produces Cosmic Forge's source-exact localized notice with `rocket` classification, `info` severity, and a 3000ms lifetime. Fuel progress, manual pause, and subsequent full-capacity ticks do not repeat it. The focused Chrome UI journey passed 1/1 with clean exit. The focused `space-event-notifications.spec.ts` unit suite passed 25/25, including six-locale copy and first-transition/no-repeat coverage; `npm.cmd run typecheck` passed.

The Rocket desktop `space-rocket-1-ready` and mobile `space-rocket-1-mobile` screenshots were refreshed and visually reviewed. P-08 remains open for other source notification families and the remaining Casino parity gaps; see the [notification route audit](../../../docs/audit/notification-route-audit.md) and [notification browser evidence](../notifications/README.md).

## Rocket fuel progress at phone width (8 October 2026)

The Rocket fueling journey now checks that the live ETA and accessible fuel progress remain visible at 390px after progress advances, that the progress bar stays within its card, and that the page has no horizontal overflow. Its focused installed-Chrome run passed 1/1 during snapshot refresh and again without updates. The refreshed desktop and mobile Rocket-ready captures were visually reviewed. This adds one narrow timer case for P-13/P-64; P-13 is signed off, while broader theme/locale review remains under P-56.

8 October 2026 P-64 follow-up: the location tooltip now labels its weather-driven amount as “Precipitation rate” in all six locales, alongside “Precipitation collected this run.” The focused Space Mining weather/rocket countdown group passed 2/2 in installed Chrome; the weather rows remain in the header tooltip rather than the Telescope pane.

## Space Mining page-identity matrix (8 October 2026)

The focused presentation matrix covers every available Space Mining child page at 1280px, 390px, and the 320px stress width in all nine themes and six locales. The Space Telescope fixture supplies Telescope, Asteroids (after the visible debug scenario action adds the discovered asteroids), and the unbuilt Launch Pad page; the `space-diplomacy` fixture supplies Mining after antimatter unlock; `space-late-game` is reserved for built Rocket 1–4 pages. Each page check asserts its localized title matches its child tab and Hydrogen's title font size at the same viewport, the shared panel is labelled by that stable tab ID, the expected artwork is present, and the pane/document fit without horizontal overflow. This exercises 1,296 page/theme/locale/viewport combinations across the three fixture states; no screenshots are generated by this matrix.

The 8 October pre-extension Chrome run passed 3/3 at 1280px and 390px (864 combinations). After adding 320×740, the expanded installed-Chrome matrix passed 3/3 in 4.6 minutes with one worker, covering all 1,296 page/theme/locale/viewport combinations. The fixture and route scope are unchanged, and the matrix creates no screenshots.

Run the matrix from PowerShell:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line -g '@space-mining-presentation-matrix' tests/e2e/space-telescope/space-mining-presentation.spec.ts
```

## P-05 Star Study keyboard access (9 October 2026)

At 390×844, the focused keyboard case tabs from Scan for asteroids to Study
stars, confirms the Study action has a visible keyboard-focus indicator and a
44×44px-or-larger target, and activates it with Enter. The live Star Study
status, countdown, and progress bar appear; the action disables while the
survey is active. The first run exposed a 39px button height, so the Telescope
survey action row now keeps its controls at a 44px minimum height. The final
installed-Chrome run passed 1/1 in 5.5 seconds on port 4350, and
`npm.cmd run typecheck` passed after the target-size fix.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4350'; npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/p05-star-study-keyboard.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

P-64 timer accessibility assertion follow-up (8 October 2026): Telescope asteroid scanning, Rocket fuel filling, and outbound asteroid travel now query their exact named `progressbar` roles and assert native current/maximum values. Their visible countdowns/ETA are also asserted, and each journey still checks that the displayed value advances. Focused installed Chrome command passed 3/3:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/space-telescope.spec.ts --workers=1 --retries=0 --trace=off --reporter=line -g "builds a telescope, starts an asteroid scan|assembles a rocket, buys its powered fuel pump, and reports fuel progress|shows the rocket's live outbound countdown"
```

**P-20 timer completion announcement follow-up (9 October 2026):** Star Study
completion feedback remains a persistent native `output`/`status` with
`aria-live="polite"` and explicit `aria-atomic="true"`. Void Pillage now uses
the source-matched localized special/info notification containing its actual
gains. Its `output`/`status` is atomic inside the always-mounted global polite
notification region. The focused `@p20-announcements` browser journey checks
these semantics and verifies the localized completion appears after each
timer finishes and its progressbar disappears; it also confirms Void Pillage
no longer duplicates completion text in the Telescope pane. This is DOM/live-
region evidence only; no manual assistive-technology run was performed. Other
timer families still need an announcement audit. After the completion route
changed, the focused installed-Chrome journey was updated and passed 1/1 on
port 4712:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4712'; node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/space-telescope/space-telescope.spec.ts -g 'exposes live Star Study and Void Pillage progress'
```

P-64 progressbar accessibility follow-up (8 October 2026): asteroid scanning, Star Study, Void Pillage, Rocket fueling, and outbound Rocket travel each expose the expected localized accessible progressbar name in all six locales (`en`, `es`, `pt`, `de`, `it`, `fr`). The Star Study and Void Pillage browser path additionally asserts each native `<progress>` value is within its maximum of 100 and increases after advancing the test clock by one second. The focused installed-Chrome run passed 4/4:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/space-telescope.spec.ts -g "builds a telescope, starts an asteroid scan|exposes live Star Study|assembles a rocket, buys its powered fuel pump|shows the rocket's live outbound countdown" --workers=1 --retries=0 --trace=off --reporter=line
```

The `space-voidborn-pillage` fixture is confined to the test build fixture allowlist. It sets only the preconditions needed to make the visible Pillage action available: one rebirth, the Voidborn philosophy, its active ability, a built telescope, and a powered grid with infinite power. The browser test asserts those state preconditions before starting the survey; no production gameplay path is changed.

P-64 return-travel progress follow-up (8 October 2026): Rocket 1's return journey uses the localized `returning` progressbar label in all six locales (`en`, `es`, `pt`, `de`, `it`, `fr`). The test checks its native progress value is within the 0–100 range and advances after one second of test-clock time. The focused installed-Chrome test passed 1/1:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/space-telescope.spec.ts -g "shows localized live returning-rocket progress across all locales" --workers=1 --retries=0 --trace=off --reporter=line
```

The `space-returning-rocket` fixture is registered only in the test-build fixture allowlist. It reuses the deterministic late-game Rocket/timer/asteroid setup and places Rocket 1 in its returning phase while preserving its active journey timer and asteroid reservation. The browser test verifies the phase and timer are present before reading the visible progressbar; this does not change production behavior.

P-65 presentation follow-up (8 October 2026): the matrix now compares every Space Mining page title's computed font size with Hydrogen at the same locale, theme, and viewport. The expanded installed-Chrome matrix passed 3/3 in 6.8 minutes across all 1,296 combinations; targeted formatting and TypeScript checks passed. This adds title-scale coverage but still creates no screenshots, so visual review remains open.

P-65 visual-review sample (9 October 2026): the focused `@p65-visual-review` case saves current captures for Tech Tree at 1280px/Terminal and 390px/Light, Space Telescope at 1280px/Dark, and Rocket 1 at 390px/Terminal. The test also checks long pioneer-name overflow at phone width. The captures were reviewed: the shared title scale and artwork appear consistent, the Tech Tree stays inside its scrollable graph viewport, and no page-level horizontal overflow or title/art mismatch was found. The review exposed a clipped pioneer name; the header now puts the name in its own ellipsis element. The screenshot update run and the no-update repeat both passed 1/1, and the refreshed screenshots are checked in beside the spec. This is a focused visual sample; wider page/theme/locale review remains open.

P-65 page-heading spacing follow-up (9 October 2026): a focused installed-Chrome geometry check measures the gap from the child-navigation bottom to each page title. Tech Tree and Energy Summary now match Space Telescope within 4px, as does Rocket 1. Hydrogen and Compounds are included as signed-off layout guards and remain aligned with the same title position. The fix scopes the missing top border/margin reset to Research and Energy, then creates a flow root around their heading so the existing heading margin does not collapse; Resources and Compounds rules are unchanged. The focused check passed 1/1 in 7.0 seconds. Broader theme and locale visual review remains open.

Run the visual-review sample in installed Chrome:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/space-mining-presentation.spec.ts -g '@p65-visual-review' --workers=1 --retries=0 --trace=off --reporter=line
```

P-66 Space Mining identity recheck (9 October 2026): Cosmic Forge `index.html:573-656` owns the Space Mining parent and its Mining, Space Telescope, Asteroids, and Launch Pad options; `localization.json` supplies the six-locale child labels. The remake renders one selected-child `h2.game-page-title` from `spaceMiningPaneItems`, labels the shared tabpanel with the selected child tab, and does not render a Space Mining parent heading in the pane. The Telescope route uses the `radio-telescope` SVG artwork. The existing page matrix covers the Telescope, Asteroids, Launch Pad, and Mining pages across six locales, nine themes, and desktop/phone/stress widths, asserting child-tab/title agreement and horizontal fit. Its expected labels are now pinned independently to the source localization values, and it explicitly guards against a duplicate parent heading. The review found localized title drift: German Mining used `Abbau` instead of source `Bergbau`, German Launch Pad used `Startrampe` instead of `Startplattform`, French Launch Pad used `Plateforme de lancement` instead of `Pas de Tir`, and several title labels differed in source capitalization. Those child labels now match the source values. The existing `phase6-space-telescope-dark-desktop.png` capture was reviewed: it shows one Space Telescope heading, the radio-telescope illustration, and no duplicate parent heading. The capture is a visual sample only; the matrix provides the broader locale/theme/viewport checks. The first Chrome matrix run caught the German Launch Pad drift; after correction, the focused installed-Chrome matrix passed 2/2 in 4.2 minutes across all 648 standard/Mining locale-theme-viewport combinations:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/space-mining-presentation.spec.ts -g 'Space Telescope, Asteroids|Mining identity' --workers=1 --retries=0 --trace=off --reporter=line
```

P-65/P-66 Space Mining visual-review expansion (9 October 2026): the focused
`@p66-visual-review` cases now keep desktop and phone screenshots for Asteroids,
Launch Pad, and Mining. The standard Telescope fixture reveals ten asteroids;
the test uses its visible scenario action to add those discoveries, and the
`space-diplomacy` fixture presents Mining as unlocked. I reviewed all six
captures: the expected page title and artwork are visible, Asteroids cards stack
at phone width, and the Launch Pad and Mining content stays inside the phone
pane. The cases also assert that no duplicate Space Mining heading is present.
The focused installed-Chrome snapshot pass generated the six baselines; the
final no-update run passed 3/3 in 11.2 seconds together with the Power switch
visual case. These samples add page-specific screenshots but do not replace the
full theme/locale visual review.

Durable snapshots are in
`tests/e2e/space-telescope/space-mining-presentation.spec.ts-snapshots/`:

- `phase6-asteroids-terminal-desktop.png`
- `phase6-asteroids-light-mobile.png`
- `phase6-launch-pad-terminal-desktop.png`
- `phase6-launch-pad-light-mobile.png`
- `phase6-mining-terminal-desktop.png`
- `phase6-mining-light-mobile.png`

P-07 timer completion presentation follow-up (9 October 2026): Star Study and Void Pillage now advance through their full timer in the browser journey. Each completion removes its progressbar and shows the localized completion feedback; the Star Study check also verifies the range increased. The weather journey expires natural weather windows until the deterministic system produces a different condition, then checks that the launch-pad weather label reflects it and the next countdown is active. The focused installed-Chrome run passed all three affected timer journeys (3/3):

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/space-telescope.spec.ts tests/e2e/cosmic-rip/cosmic-rip.spec.ts --workers=1 --retries=0 --trace=off --reporter=line -g 'exposes live Star Study and Void Pillage progress|keeps launch-pad weather separate|restores the scanner, researches all Cosmic Rip stages and closes the rip'
```

9 October 2026 P-66 Space Telescope visual follow-up: the radio-telescope page
now has a reviewed 390x844 Light full-page capture,
`phase6-space-telescope-light-mobile.png`, complementing the existing 1280x900
Dark desktop capture. It shows one “Space Telescope” heading, the intended
radio-telescope artwork, and no duplicate Space Mining heading or clipped
content. The focused test also asserts the selected title/artwork identity.

**P-20 additional timer-completion checks (9 October 2026):** the asteroid
survey completion and Rocket fuel-ready journeys now assert the existing
atomic polite status output/notification semantics as well as the localized
completion result. The focused `@p20-announcements` run also rechecked Star
Study, Void Pillage, Starship/Rocket journey notices, and keyboard tab changes;
all six selected installed-Chrome cases passed in 41.6 seconds. See the
[notification route evidence](../notifications/README.md) for the exact
combined command and remaining assistive-technology limits.

**P-20 asteroid-search cross-tab audit (9 October 2026):** normal asteroid
search completion emits either `space.asteroid.discovered` or
`space.asteroid.scan-missed`. `App` subscribes to space events independently
of selected pages and sends both outcomes to the always-mounted
`GameNotificationRegion`, whose persistent container is `aria-live="polite"`
and whose localized per-notice `<output>` is atomic. The notification mapper's
six-locale unit case covers both outcomes in `space-event-notifications.spec.ts`;
the focused installed-Chrome Telescope timer journey passed 1/1 and verifies
localized completion feedback through the pane's own polite atomic `<output>`.
The focused installed-Chrome regression now starts a deterministic asteroid
search, switches to Hydrogen before completion, and verifies the localized
found/missed notice appears in the global polite notification region while
Hydrogen remains selected. It also checks the notice's atomic status semantics,
then returns to Telescope and confirms its local completion output. The test
passed 1/1. No engine change was needed; the global event route already handles
completion independently of the selected page. Manual assistive-technology
verification and other timer/purchase routes remain under audit.

**P-20 Star Study cross-tab timer completion (10 October 2026):** Cosmic Forge
completes star study in `cosmicForge/game.js:13455-13462` and emits its localized
`notificationStarStudyComplete` as a 3000ms `info` notice in the `special`
classification. MIAPLACIDUS produces `space.stars.studied` when the study timer
completes in `src/engine/spaceMechanics.ts:2398-2442`; the app-level event
subscriber in `src/app/App.tsx:1313-1322` maps it through
`src/app/spaceEventNotifications.ts:174-175`, and the global notification
region stays mounted at `App.tsx:1751`. This was a weak case in the earlier
progress test, which completed the timer while Telescope remained selected.
The new focused Chrome test starts a German Star Study, switches to Hydrogen,
advances the deterministic clock through completion, and verifies that the
range increases while Hydrogen remains selected and the localized source
notice appears exactly once as an atomic `role=status` card in the global
notification stack. It passed **1/1** on port 4861. No production fix was required. This
proves browser DOM/live-region semantics, not spoken output; no screen reader
or other assistive technology was run.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4861'; npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/p20-star-study-cross-tab.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-16 Telescope build focus (9 October 2026):** after an accepted telescope
build replaces the Build button with the available Scan for asteroids action,
focus now transfers to that next action. A focused no-screenshot Chrome case
checks the target remains focused while the Telescope-built notice is shown
and after it auto-dismisses. This was included in the 7/7 P-16 notification
focus run documented in the [notifications README](../notifications/README.md).

**P-06 Telescope affordability (9 October 2026):** the test-only
`space-telescope-shortfall` fixture leaves Iron exactly one unit below the
Space Telescope requirement. The focused browser case checks the complete
localized cash/material quote, a disabled Build Telescope action, and the
localized Iron shortfall linked by `aria-describedby`. It repeats this check
in all six locales. The focused installed-Chrome run passed 1/1 in 10 seconds:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4300'; npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/telescope-affordability.spec.ts --workers=1 --retries=0 --trace=off --reporter=line
```

**P-41 Rocket part cash notation (9 October 2026):** the Launch Pad Rocket 1
part quote now has a focused visible assertion against the current discounted
part cost in Condensed, Standard, and Scientific. It passed as part of the
three-area installed-Chrome run (3/3 in 15.7 seconds on port 4312). Run with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4312'; npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/p41-space-currency.spec.ts tests/e2e/starship/p41-starship-currency.spec.ts tests/e2e/cosmic-rip/p41-cosmic-rip-currency.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-41 Space Mining cash-cost coverage (9 October 2026):** in addition to
Rocket 1's first part quote, the visible Launch Pad quote and the unpurchased
Rocket 1 fuel-pump quote are checked against their current engine costs in
Condensed, Standard, and Scientific. A dedicated test fixture holds Rocket 1
in its ready-to-fuel state. The complete focused P-41 currency batch passed
9/9 in installed Chrome in 40.8 seconds on port 4320; no production formatter
change was required.

**P-41 Telescope cash-cost coverage (9 October 2026):** a focused real-control
browser case checks the Space Telescope build quote in Condensed, Standard, and
Scientific against the current discounted cost. It verifies the live cash
balance is unchanged, the Telescope remains unbuilt, and Scientific differs
from Standard. The installed-Chrome run passed 1/1 in 7.9 seconds on port 4321;
no production formatter change was required.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4321'; npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/p41-telescope-currency.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g '@p41-telescope-currency'
```

**P-13 Space Mining 320px context (9 October 2026):** two installed-Chrome
cases passed (2/2 in 7.4 seconds on port 4482). The Rocket case checks the
visible pump cash quote, Cash and Antimatter balances, and purchase action, then
checks active fuel amount/progress, ETA, and Pause fueling state at 320px. The
Telescope case checks its visible cash/material build quote and action before
purchase, then the active asteroid-search status, remaining time, progress, and
disabled repeat-scan reason at 320px. Both cases verify the relevant content
stays within the viewport and the document has no horizontal overflow.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4482'; node .\node_modules\playwright\cli.js test tests/e2e/space-telescope/p13-space-mining-narrow-context.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-13 outbound Rocket trip at narrow widths (9 October 2026):** the focused
installed-Chrome case passed 1/1 in 5.6 seconds on port 4484. At both 390px and
320px, it checks visible Cash and Antimatter balances, the Rocket 1 / Travelling
to asteroid task identity, live ETA and accessible progress, and all relevant
bounds plus document width. It also advances the trip and confirms its ETA and
progress change. The current page identifies the rocket and outbound task but
does not render the specific asteroid name while the rocket is in flight.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4484'; node .\node_modules\playwright\cli.js test tests/e2e/space-telescope/p13-space-mining-rocket-travel.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**E-57 Space Mining narrow-locale review (10 October 2026):** the focused Chrome review checks the Space Telescope's discounted multi-good quote and localized material shortfall, all four Rocket assembly part quotes and the one-material disabled reason, and active progress/countdown on Rockets 1–4. Each surface is checked at 390px and 320px in `en`, `es`, `pt`, `de`, `it`, and `fr`; visible quotes, actions, status text, and progress remain inside the viewport with no page-level horizontal overflow. The Telescope and Rocket checks passed 2/2 as part of the six-case E-57 run (6/6 in 1.8 minutes, port 4679). No page-component or shared-CSS correction was needed.

Visual checkpoint: [e57-space-telescope-cost-fr-320.png](e57-space-telescope-cost-fr-320.png), captured in the follow-up focused Chrome run (5/5 in 34.2 seconds, port 4680). The full-page French 320px capture shows the telescope quote wrapping into rows and its localized disabled reason; neither extends past the card or viewport. The build quote has no hover tooltip in this UI, so this checkpoint records the visible quote and shortfall context.

Focused command: `$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4679'; node .\node_modules\playwright\cli.js test --pass-with-no-tests tests/e2e/space-telescope/e57-space-mining-narrow-locale-context.spec.ts tests/e2e/star-map/e57-star-map-data-narrow-locale-context.spec.ts tests/e2e/starship/e57-interstellar-narrow-locale-context.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line`

**E-57 Launch Pad construction context (10 October 2026):**
`e57-launch-pad-cost-locale-context.spec.ts` checks the exact localized cash
and three-material construction quote, the build action, and the Telescope
state at 390px and 320px in all six locales. It checks the cost list, each
price row, action, pane, and document bounds. The French 320px capture was
visually reviewed; the wrapped price chips and build action fit without
clipping. The test then builds the Launch Pad and confirms the state change.
Installed Chrome passed **1/1 in 6.2 seconds** on port 4817. This closes the
Launch Pad construction quote's narrow-width gap; the test uses the existing
`space-telescope` test fixture and makes no app or fixture change.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4817'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-e57-launch-pad-4817 tests/e2e/space-telescope/e57-launch-pad-cost-locale-context.spec.ts
```

The six-locale narrow content coverage for the unlocked Asteroids list and
Mining summary is recorded below; the preceding page-identity matrix only
covered their titles, artwork, and bounds.

**E-57 Asteroids and Mining content (10 October 2026):** the separate
`e57-space-mining-content-locale-context.spec.ts` uses a test-only
`space-asteroid-mining` fixture with all four asteroid rarities, Rocket 1–3
reservations, one depleted asteroid, and one actively mining Rocket. Across
390px and 320px in all six locales, it checks every visible rarity, reservation
or depletion label, distance and remaining-Antimatter value; selects asteroids
through their visible controls; verifies Mining's stored balance, current rate,
run and lifetime totals against the live engine state; and checks the localized
boost action is available and stays in bounds. One keyboard hold/release also
confirms the boost state changes and resets. The focused installed-Chrome run
passed **1/1 in 10.7 seconds** on isolated port 4825. French 320px captures were
reviewed: [Asteroids](e57-asteroids-fr-320.png) and [Mining](e57-mining-fr-320.png)
both fit the visible rows and actions without document-level horizontal
overflow. No app presentation change was needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4825'
node .\node_modules\playwright\cli.js test tests/e2e/space-telescope/e57-space-mining-content-locale-context.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-e57-space-mining-4825
```

## P-54 E-57 fuel-pump quote at narrow widths (10 October 2026)

`e57-fuel-pump-locale-context.spec.ts` checks Rocket 1's localized pump-cost
label, formatted cash quote, enabled purchase action, and card/action/document
bounds at 320px and 390px in all six locales. French captures at both widths
were visually reviewed; the long translated heading and purchase label wrap
inside the Rocket card, and no page-level horizontal overflow appears. The
focused installed-Chrome case passed at both widths as part of the six-case
economy/Space Mining batch, **6/6 in 2.1 minutes** on isolated port 4828. The
existing P-13 case still covers clicking the purchase action and subsequent
fuel timer/progress behavior at 320px; this case concentrates on all-locale
quote and action fit.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4828'
node .\node_modules\playwright\cli.js test tests/e2e/space-telescope/e57-fuel-pump-locale-context.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-e57-phone-costs-4828
```

**P-29 Telescope and Rocket audio routes (10 October 2026):** Cosmic Forge's
`drawTab6Content.js:295` plays `asteroidScan` when an asteroid search starts;
`drawTab6Content.js:387` plays `starStudy` when star study starts;
`drawTab6Content.js:477` uses the same cue when Void Pillage starts;
`drawTab6Content.js:1270` plays `fuelRocket` on pump purchase; and
`drawTab6Content.js:1288` plays `rocketLaunch` on Rocket launch.
`game.js:6945,6982` also plays `rocketLaunch`
when a depleted Rocket begins its return; `game.js:11103` plays `rocketLand`
when that return completes. Outbound asteroid travel and its arrival have no
explicit source cue. The remake's typed event mapping matches these distinctions:
asteroid searches cue `asteroidScan`; star study and Void Pillage cue
`starStudy`; pump purchase cues once; outbound travel and arrival are silent;
return-start cues `rocketLaunch`; and return completion cues `rocketLand`.
The Void Pillage callsite previously fell through to a generic button sound; it
now follows the source cue.

`audio-cues.spec.ts` covers the Telescope build/search/study controls, Rocket
pump purchase and launch controls, a visible outbound travel action and silent
arrival, plus a returning-Rocket arrival. The direct audio dispatch assertions
also check each source event-to-cue mapping, including silent outbound arrival.
Installed Chrome passed **4/4 on port 4899**, and the corrected Void Pillage
case passed again **1/1 on port 4900**; focused
`audio-event-dispatch.spec.ts` passed **24/24**; TypeScript passed. Scheduled
random events can independently play `eventAlarm.mp3` during the long fueling
advance; the route check verifies that this does not repeat the pump cue.

The browser return-arrival check uses the existing `space-returning-rocket`
fixture. A visible natural depletion-to-return-start journey is not part of this
case; the event-level assertion covers its `rocketLaunch` mapping without
changing or accelerating simulation rules. No gameplay or timer code changed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_TEST_AREA='space-telescope'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4899'
npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/audio-cues.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
npm.cmd run test:unit:focused -- tests/unit/audio-event-dispatch.spec.ts
npm.cmd run typecheck
```

## P-06 Space Mining purchase affordances (10 October 2026)

The audit found the Telescope quote and disabled reason use the same discounted
cost and engine precondition as `space.telescope.build`; its existing focused
tests cover the six-locale one-Iron shortfall and the successful build route.
Rocket part quotes and affordability likewise use `rocketPartCost`, already
covered by one-below/exact-stock browser journeys. The fuel-pump cash quote and
purchase precondition share `ROCKET_FUEL_PUMP_BASE_COST`; existing P-13/E-57
cases cover purchase, cost, and subsequent fueling. No price or gate mismatch
appeared in these routes.

The uncovered Launch Pad case now checks its exact discounted quote against
engine state, a below-requirement Iron balance and linked localized reason,
recovery once the required stock is collected, and exact Cash/material payment
through the visible Build action. `selectEconomyAction` unit coverage confirms
that its Launch Pad action selection reports the same one-Iron-short failure
and enables at the exact requirement. Installed Chrome passed **1/1** on
isolated port 4835; the focused selector unit passed **1/1**. Typecheck and
Oxfmt checks passed. No production change was needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4835'; node .\node_modules\playwright\cli.js test tests/e2e/space-telescope/p06-launch-pad-affordance.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p06-launch-pad-affordance-4835
```

## P-29 Antimatter boost audio parity (10 October 2026)

The visible Mining-page hold gesture has a focused Chrome cue assertion using the existing `space-asteroid-mining` fixture with an active Rocket. Pressing the enabled boost starts exactly one immediate `boostAntimatter.mp3`; releasing it stops the boost and does not add a click/switch cue. This matches Cosmic Forge's `ui.js` pointer/mouse handlers and `game.js:boostAntimatterRate`, which only activate/deactivate the repeating boost sound. The paired `audio-event-dispatch.spec.ts` unit case continues to verify the 500ms repeats and now asserts that release adds no extra sound. Installed Chrome passed 1/1 as part of the 6-case `audio-cues.spec.ts` run on isolated port 4936; the unit file passed 25/25.

## P-45 Space Mining locale results (10 October 2026)

The existing E-57 narrow and content cases cover six-locale Telescope quotes
and material-shortfall reasons; Rocket 1-4 part costs, material reasons,
outbound progress names/countdowns; Launch Pad and fuel-pump prices; and
Asteroid/Mining route labels and live readouts at 320px/390px. The new
`tests/e2e/localization/p45-space-interstellar-results.spec.ts` adds rendered
completion copy for Star Study feedback/notification and Void Pillage notices
in all six locales. No untranslated Space result copy was found. These cases
passed as part of the combined P-45 installed-Chrome run, **4/4 in 1.1
minutes** on port 5072; no game code change was needed.

### P-45 Space Mining visible action and status copy (10 October 2026)

The dedicated `p45-space-mining-copy.spec.ts` fills visible-copy gaps left by
the existing six-locale cost/context tests. It checks Telescope build feedback
and status, the asteroid-scan action, Launch Pad build notice, Star Study
completion notice while Hydrogen is selected, asteroid-selection feedback,
and Mining's disabled zero-rate boost reason. On the built Rocket 1 route it
checks the Ready status, empty-tank launch reason, Buy/Pause/Start fueling
actions, no-grid and paused states, the associated no-grid reason, and the
fuel-ready notice while Hydrogen is selected. Expected copy comes from the
typed `spaceText`, `rocketText`, `spaceNotificationText`, and `economyLabel`
catalogues. Existing E-57 checks continue to cover Telescope/Launch Pad/part
prices and material shortfalls, asteroid/Mining live readouts, and Rocket
1–4 travel progress at 320px/390px. No translation defect was found and no
app copy changed.

Installed Chrome passed **3/3 in 1.6 minutes** on port 5097. TypeScript
typecheck and focused Oxfmt checks passed. Rerun this slice with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5097'
node .\node_modules\playwright\cli.js test tests/e2e/space-telescope/p45-space-mining-copy.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-space-mining-copy-5097
```

An independent no-update Chrome rerun passed **3/3 in 1.6 minutes** on port
5181 after the shared agent lane reached its usage limit:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5181'
npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/p45-space-mining-copy.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-space-mining-copy-5181
```

The same spec now covers the completed asteroid scan in each of the six
locales. It starts from a fresh Telescope fixture, uses the visible build and
scan controls, reads the active scan timer's remaining duration, and advances
that timer while Hydrogen is selected. It derives hit or miss from the
post-scan asteroid IDs rather than assuming an RNG result. On a hit it checks
the exact rarity-specific global notice and page feedback, the added asteroid,
and the lifetime discovery increment; on a miss it checks the localized miss
notice and feedback and confirms the asteroid list and lifetime count did not
change. The isolated installed-Chrome case passed **1/1 in 31.1 seconds** on
port 5627; no presentation change was needed.

**P-55 Statistics scope check (10 October 2026):** the existing six-locale
visible Telescope/Launch Pad build journey now opens Settings → Statistics
after both constructions and verifies each row shows This Run Yes and Lifetime
N/A. The source getters use these same run-local flags and return Not
Applicable for All Time; the focused display unit check also covers fresh
No/N/A and both built values across all six locales. Verification results are
recorded in the [Settings Statistics README](../settings/README.md#p-55-space-mining-status-scopes-10-october-2026); the installed-Chrome route passed 2/2 in 52.3 seconds on port 5764.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5627'
npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/p45-space-mining-copy.spec.ts -g "Asteroid scan result feedback" --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-scan-completion-5627
```

## P-51 Space Telescope phone visual sample (10 October 2026)

`p51-space-mining-visual.spec.ts` checks the Telescope quote, build action, and
global location/weather tooltip at 320px and 390px in French Terminal and
French Light (four viewport/theme combinations). It asserts the title, each of
the four cash/material quote rows, build action, tooltip bounds, and no page
horizontal overflow. Installed Chrome passed **1/1 in the two-spec 9.3-second
run** on port 5056. The captures `p51-space-telescope-fr-320-terminal.png`
and `p51-space-telescope-fr-390-light.png` were visually reviewed; the quote
and tooltip remain readable and inside the viewport. No page or CSS fix was
needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5056'
node .\node_modules\playwright\cli.js test tests/e2e/space-telescope/p51-space-mining-visual.spec.ts tests/e2e/economy/p51-research-energy-narrow-visual.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p51-space-research-visual
```

## P-55 Total Asteroids Discovered cap boundary (10 October 2026)

The Overview counter is lifetime-only. Cosmic Forge increments it only after a
successful discovery, after the random-miss and 100-removable-asteroid cap
checks. The source cap protects destroyed, exhausted, mining, selected-target,
and in-transit asteroids, and pruning does not reduce the historical count.
MIAPLACIDUS also increments only on successful completed survey generation;
the new `space-rules.spec.ts` case fills the 100 eligible untouched slots,
completes a survey, then checks the missed-scan event, unchanged asteroid
sequence/list, and unchanged lifetime total. The focused Space Rules suite
passed **20/20**. Existing survey-resume, rebirth, and local-save cases cover
the success, reset, and persistence boundaries. The remake additionally
protects `interacted` asteroids at the cap, unlike the source's status-based
predicate; this cap availability difference is recorded for product review,
with no runtime change made. No controlled source-save comparison was run.

## P-55 Legendary Asteroids Discovered source comparison (10 October 2026)

Cosmic Forge increments its all-time Legendary counter only when a successful
normal discovery has produced and stored an asteroid whose `specialName` is
set; the source generator sets that for Legendary rarity. Missed/cap-blocked
searches return before generation, and the debug-only path suppresses the
statistic. MIAPLACIDUS has the same visible boundary: it generates only when a
survey timer completes, returns early for a missing result, appends the
asteroid, then increments lifetime if its rarity is Legendary. Neither normal
path counts a generated-but-hidden candidate. The existing deterministic
Legendary telescope-resume test asserts zero during the active timer, one when
the asteroid is present in the result list, and no duplicate increment. It
passed **1/1**:

```powershell
npx.cmd vitest run tests/unit/space-rules.spec.ts -t "resumes a telescope search and rocket fueling from saved in-progress state" --reporter=dot
```

Existing rebirth and local-save cases verify lifetime retention. The asteroid
cap eligibility difference above can alter search availability but does not
change the Legendary counter's accepted-discovery boundary. No runtime change
or controlled source-save comparison was made.

### Interstellar System Scanned Statistics cross-reference (10 October 2026)

The Statistics row describes the Starship destination scan and the encounter
report shown on Colonise; it is separate from asteroid/star survey counters on
this Space Telescope page. Its source/selector scope and focused test evidence
are recorded in the [Statistics parity plan](../../../docs/plans/statistics-presentation-parity.md#interstellar-system-scanned-scope-comparison-updated-12-october-2026)
and [Starship README](../starship/README.md#p-55-system-scanned-statistics-source-comparison-10-october-2026).

## P-44 Space Mining header-help inventory (10 October 2026)

The source `infoTooltipMiningHeader`, `infoTooltipLaunchPadHeader`, and
`infoTooltipAsteroidsHeader` each have translated source entries. The remake now
adds title tooltips for Mining, Launch Pad, and Asteroids in all six locales.
They preserve the useful source guidance while matching the current workflow:
Mining's displayed total includes rocket and megastructure output, but holding
the boost changes rocket mining only. The exact six-locale source
`headerDescMining` copy is first in the Mining tooltip, followed by a separate
remake-specific clarification that this page shows the aggregate and Rocket
pages show individual destinations and statuses. The full
`infoTooltipMiningHeader` is not attached: its megastructure-output and
right-side-bar directions conflict with the remake. Asteroids is where the
destination is selected before opening a completed Rocket page to launch. The
Asteroids list exposes the source Complexity value from
`AsteroidState.extractionEase` and the tooltip uses the exact source Complexity
sentence. The other `infoTooltipAsteroidsHeader` details about Destroyed status
and base travel time remain absent because they do not match the remake's data
or travel-duration rules. The six-locale narrow-content case now asserts Mining,
Launch Pad, and Asteroids help placement, the exact copy, and the Complexity
value; it was added but not run. See the
[P-44 handoff](../../../docs/archive/audits/phase-6-handoff-2026-10-07.md#p-44-remaining-cosmic-forge-infotooltip-inventory-10-october-2026)
for the individual source-to-target dispositions.

## P-56 Space Mining page content visual matrix (10 October 2026)

The P-66 route matrix already covered page identity, artwork, heading scale, and
horizontal fit across six locales, nine themes, and 1280/390/320px, but it did
not check each page's content and controls through that matrix. The E-57
content checks cover six locales at 390/320px without a theme sweep. The
existing Space Mining matrix now also asserts content and visible control
bounds for Telescope, Asteroids, Launch Pad, and unlocked Mining. The standard
fixture includes the Telescope cost rows/build action, ten revealed asteroid
entries with distance and remaining-Antimatter labels, and the Launch Pad
weather/timer, four-row quote, and build action. The Mining fixture checks the
unlocked readouts and localized boost control. All visible page controls must
have a name and fit inside both the page pane and viewport; their text must fit
inside the control, and the document must have no horizontal overflow. This
adds 648 content-bearing page states (486 standard-page states and 162 Mining
states) over the requested locale/theme/viewport matrix.

The focused installed-Chrome matrix passed **2/2 in 4.9 minutes** on port 5265.
The standard-page case was rerun after shared artwork styling settled and
passed **1/1 in 2.9 minutes** on port 5266. Final representative captures were
reviewed: French Terminal Telescope at 320px, German Light Asteroids at 390px,
and French Space Launch Pad at 320px from the settled rerun, plus Portuguese
Dark Mining at 1280px from the matrix run. The Telescope price chips wrap above
the build action; the Asteroids cards stack and their localized detail lines
wrap; Launch Pad weather, quote chips, and build control stay inside the pane;
Mining readouts and its boost control fit the desktop card. No page clipping or
horizontal overflow was found, so this slice needed no Space Mining CSS fix.

Settled standard-page captures are under
`test-results-p56-space-mining-standard-5266/space-telescope-space-mini-32433--mining-presentation-matrix-chrome/`:

- `p56-space-mining-telescope-fr-terminal-320.png`
- `p56-space-mining-asteroids-de-light-390.png`
- `p56-space-mining-launch-pad-fr-space-320.png`

The Mining capture is under
`test-results-p56-space-mining-visual-5265/space-telescope-space-mini-feea6--mining-presentation-matrix-chrome/`:

- `p56-space-mining-mining-pt-dark-1280.png`

Verification commands and results:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5265'
npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/space-mining-presentation.spec.ts -g p56-space-mining-content --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p56-space-mining-visual-5265
# 2 passed (4.9m)

$env:MIAPLACIDUS_TEST_PORT='5266'
npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/space-mining-presentation.spec.ts -g "Space Telescope, Asteroids, and Launch Pad" --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p56-space-mining-standard-5266
# 1 passed (2.9m)

npm.cmd run typecheck
# passed

.\node_modules\.bin\oxfmt.cmd --check tests\e2e\space-telescope\space-mining-presentation.spec.ts
# passed
```

The final scoped CSS diff review found the P-44 `auto-create-allocation-help`
rule does not affect Space Mining. The shared artwork-row and Space Mining
control/progress styles were included in the settled standard-page rerun.

**P-56 rendered source-option follow-up (10 October 2026):** the presentation
matrix now checks `data-source-option-id` on each rendered Space Mining child
tab alongside its stable ID and order: Mining/option8, Space Telescope/option6,
Asteroids/option7, Launch Pad/option1, and Rockets 1–4/options 2–5. Installed
Chrome passed the standard children 1/1 in 3.0 minutes on port 5541 and the
Mining plus Rocket fixtures 2/2 in 4.8 minutes on port 5543. The assertion uses
the matrix's first rendered child-tab state for each fixture; its remaining
locale/theme/viewport content checks continue across the full matrix. See the
[navigation audit](../app-boot/README.md#p-56-source-to-rendered-child-navigation-audit-and-follow-up-10-october-2026).

### P-20 live-region source audit addendum (11 October 2026)

The source review removed duplicate pane-local live outputs for asteroid search,
Star Study, and rocket arrival/return, which the app already routes to its
persistent global notification region. The Star Study notice now includes the
updated range in all six locales. The former local `space-feedback` completion
assertions are stale and must be reconciled during the deferred regression
pass; no tests or checks were run for this source change. Spoken screen-reader
verification remains open.
