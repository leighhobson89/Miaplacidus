# News Ticker browser area

The focused `@news-ticker` area exercises the visible shell strip through the
test-mode engine command boundary and Settings controls. It checks the blank
empty state (without an idle prompt), localized headline/category routing,
full leftward exit before queued messages replace one another, a 40-second
scroll followed by a randomized 20–35 second wait before the next scheduled
message, continuous scrolling while a wacky message is hovered, un-underlined themed claim
controls, resource and one-off reward claims by keyboard,
keyboard activation for all eight wacky messages (including both feedback
choices), manuscript clue star naming and least-used eligible-manuscript
selection, one-off offer consumption kept separate
from claim history, scheduled category creation and its
20–35 second interval, phone-width overflow, localized headline rendering at
390px in all six locales, and save/reload persistence of the Settings toggle. A unit
check scans every News Ticker string in all six locales for encoding artifacts
and pins accented Spanish, Portuguese, and French copy.

Deterministic timing coverage checks that no scheduled message is generated
during the current 40-second scroll or its following randomized wait, and that
one large simulation step cannot create a batch of queued ticker messages.

5 October 2026 follow-up: the seven-case area passed in installed Chrome with
video capture disabled. The reward journey now confirms that a Hydrogen prize
grants its stored/displayed amount when storage has room, and that the claimed
control still reads `here`, is disabled, and has 50% opacity. The focused unit
case starts at Spica (Type B) and confirms the claim event itself is not
multiplied by the star type. The browser case also compares the visible prize
amount with the pre-rolled prize. Type B's resource autobuyer bonus is passive
per-second production, so it can add Hydrogen between separate stock reads.
The delayed-copy case holds back the first localized ticker chunk, clicks a
fresh prize immediately, and verifies that the temporary fallback still shows
the exact amount and `here` action before and after claiming. A focused unit
case checks the localized amount and action word in the fallback copy for all
six supported locales.

Run with installed Chrome:

```powershell
$env:MIAPLACIDUS_TEST_AREA = "news-ticker"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 tests/e2e/news-ticker/news-ticker.spec.ts
```

5 October 2026: all five browser journeys reported passing in Chrome. This
includes ticker motion staying active during hover, theme-ready claim links
without underlines, and the save/reload path through explicit local-save
selection. The 390px overflow check exposed right-column status tooltips beyond
the viewport; their narrow-screen alignment is now corrected. The Playwright
process hung during browser shutdown after reporting all five passes and was
interrupted. A subsequent focused Chrome run passed both keyboard claim and
wacky-feedback journeys. The live shell check switches through all six locales
at 390px, verifies each headline's full localized copy, and checks page/ticker
width. The six-locale catalog scan
found and repaired 868 Windows-1252/UTF-8 encoding errors, plus the remaining
French ligature and Czech-name sequences. The [random-events](../random-events/README.md)
browser journey separately checks the saved journal and repeat-claim boundary.
Translation-quality review and visual comparison of every effect remain part
of P-34/P-54/P-56. Deterministic category-frequency coverage is recorded below.

6 October 2026 cadence follow-up: the first scheduled bulletin retains its
20–35 second startup delay. Each displayed message now scrolls for the source
40 seconds, then the engine waits a fresh randomized 20–35 seconds before
creating the next one. A large simulation step creates at most one scheduled
message, preventing catch-up bursts from queuing multiple bulletins at once.
The scroll remains active on hover. The deterministic meta-signals unit area
passed 12/12; typecheck and focused formatting checks passed. The Chrome
News Ticker area passed 7/7 in 15.8 seconds with clean Playwright shutdown.

For a clean Chrome run, start the test server in a separate terminal:

```powershell
npm.cmd run dev:test -- --host 127.0.0.1 --port 4173 --strictPort
```

Then run the focused browser area:

```powershell
$env:MIAPLACIDUS_TEST_AREA = "news-ticker"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/news-ticker/news-ticker.spec.ts
```

**P-05 ticker claim touch target (9 October 2026):** the installed-Chrome
390x844 case positions an actual prize message in the ticker viewport, checks
that the `here` claim has a 44px touch area, and taps above its visible text to
claim the Hydrogen prize. The expected amount is added and the same `here`
label becomes disabled at 50% opacity. The transparent target extension keeps
the word's presentation intact; the 44px viewport keeps it inside the ticker's
vertical clip without affecting the horizontal scroll animation. The focused
case passed 1/1 in a five-case regression batch (5/5 in 15.2s) on port 4603.
Three existing P-58 cases also passed in that batch: keyboard claims, localized
prize copy, and full offscreen ticker motion with hover continuity. P-05 remains
open for other mechanics controls.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_TEST_PORT='4603'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/news-ticker/p05-news-ticker-touch.spec.ts
```

9 October 2026 P-41 notation integration: the visible prize-message amount now
follows the selected Condensed, Standard, or Scientific notation. Its focused
installed-Chrome case passed 1/1 on port 4210. The combined P-41 economy and
News Ticker subset passed 4/4 on Chrome port 4212. The later combined P-41
subset across economy, News Ticker, and Galactic Casino passed 5/5 on Chrome
port 4217. Economy checks cover large production-rate and cash readouts, exact
live Run Time text under all three notations while the clock advances, and the
Statistics stock boundary; they also confirm complete Run Time and cash values
in accessible tooltips. The separate Run Time screenshot baseline check passed
1/1 without updates on port 4214, with the Condensed, Standard, and Scientific
captures reviewed. Broader review of other countdowns and currency-precision
displays remains open. These focused cases do not sign off the broader P-41
display audit.

Run the notation integration case with installed Chrome:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
$env:MIAPLACIDUS_TEST_PORT = "4210"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line -g "P-41 ticker prize amounts" tests/e2e/news-ticker/news-ticker.spec.ts
```

Run the combined notation subset with installed Chrome:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
$env:MIAPLACIDUS_TEST_PORT = "4217"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line -g "P-41" tests/e2e/notation/economy-notation.spec.ts tests/e2e/news-ticker/news-ticker.spec.ts tests/e2e/galactic-casino/galactic-casino.spec.ts
```

The timing unit check is `npm.cmd run test:unit:focused -- tests/unit/meta-signals.spec.ts`.

6 October 2026 one-off lifecycle follow-up: generating a one-off adds its ID to
saved `offeredOneOffIds` immediately; it does not add to `claimedPrizeIds` or
award the effect. The displayed offer remains claimable, and only a successful
claim updates claimed history. Version 39 defaults this list for new saves and
migrates v38 saves by deriving prior offers from the one-off IDs in `seenIds`
and `claimedPrizeIds`. Focused tests round-trip an unclaimed offer, reject a
repeat offer after reload, claim it once, and preserve unclaimed/claimed history
in a v38 migration; meta-signals and local-save tests passed 57/57. Run them
with `npm.cmd run test:unit:focused -- tests/unit/meta-signals.spec.ts tests/unit/local-saves.spec.ts`.

6 October 2026 manuscript clue follow-up: selection skips reported, invalid,
and exhausted manuscripts, chooses randomly among the least-used eligible
manuscripts, and then chooses an unused template for that manuscript. Shown
template IDs are stored by stable manuscript system ID, so a template may be
used for another manuscript without repeating for the same one. Global
`seenIds` remains aggregate history and does not block template selection.
Schema v41 migrates v40 clue history from retained ticker entries containing
both the template ID and manuscript system ID; Research and other saved
counters remain intact. Focused meta-signals and local-save coverage passed
62/62 with save/reload and migration assertions.

6 October 2026 reduced-motion follow-up: the News Ticker honors both the OS
`prefers-reduced-motion` setting and the in-game Reduced Motion option. It keeps
each current message in normal wrapping flow, disables scrolling and looping
wacky effects, and still allows keyboard activation and prize claims. The
focused Chrome browser case passed 1/1; it checks phone-width text fit, wacky
activation, a prize claim, and the in-game preference. Run it with:

```powershell
$env:MIAPLACIDUS_TEST_AREA = "news-ticker"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line -g "reduced motion keeps full ticker messages readable and controls usable" tests/e2e/news-ticker/news-ticker.spec.ts
```

8 October 2026 apostrophe rendering follow-up: replaced missing French and
Italian elision marks in the source ticker copy with plain ASCII apostrophes.
The focused installed-Chrome case renders one French and one Italian headline
with reduced motion enabled, verifies their exact apostrophe-bearing copy, and
captures each ticker for visual inspection. It passed 1/1 in 3.9 seconds; both
generated screenshots were reviewed and show the apostrophe glyph in the
Terminal font. Run it with:

```powershell
$env:MIAPLACIDUS_TEST_AREA = "news-ticker"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line -g "French and Italian ticker apostrophes" tests/e2e/news-ticker/news-ticker.spec.ts
```

8 October 2026 P-56 visual follow-up: the prize strip now has four checked-in
screenshots covering Terminal and Light, English and French, and 1280px and
390px in a cross-paired matrix. The focused installed-Chrome screenshot case
passed 1/1 after advancing the deterministic simulation timestamp between
forced prize messages, so the browser error guard remains clean. Visual review
confirms the ready link is distinct without an underline and the French copy
wraps cleanly at 390px. Wacky-effect appearance, the remaining seven themes,
the other four locales, and wider P-56 combinations remain open.

Run that screenshot case with installed Chrome:

```powershell
$env:MIAPLACIDUS_TEST_AREA = "news-ticker"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line -g "the prize ticker keeps its visual treatment" tests/e2e/news-ticker/news-ticker.spec.ts
```

8 October 2026 startup timing note: Cosmic Forge schedules its first ticker
message 20–35 seconds after startup (`cosmicForge/game.js`,
`startNewsTickerTimer`); its live browser test confirms the timer is already
scheduled at boot. The remake seeds the same 20–35 second initial countdown in
`src/engine/state.ts`. The shell is intentionally blank during that delay; it
does not need a fabricated opening headline or “No reports yet” prompt. The
focused shell test asserts an empty ticker at startup, and the cadence journey
advances the initial countdown before checking the first scheduled entry.

8 October 2026 source Boo-effect follow-up: Cosmic Forge's wacky entry 1006
gives `Boo!` a `.boo` class before activation; the source style masks it with a
text-colored fill and a ready-color border, and clicking removes that mask. The
remake now matches this reveal behavior while keeping the word keyboard
accessible. Its Chrome regression asserts the initial fill/border and that
Enter reveals the word.

The first broad ticker rerun exposed two stale browser-test assumptions, not
product regressions. The delayed-copy test tried to intercept `sourceNewsCopy`
after app boot, but that module is already loaded through the app's static
`casinoEventNotifications` dependency; the test now checks the rendered French
claim and prize copy. The fallback text and localized `here` action remain
covered for all six locales by `tests/unit/meta-signals.spec.ts` (20/20 passed).
The hover test
used the far-right window edge before the message reached it; it now positions
the animation at 10 seconds, hovers the measured message bounds, and verifies
that the animation clock keeps advancing. The four relevant Chrome journeys
passed 4/4. With a separately managed test server, the complete ticker browser
file passed 12/12 in 20.9 seconds. Typecheck, targeted formatting and diff
checks passed. Run the focused browser area with:

```powershell
$env:MIAPLACIDUS_TEST_AREA = "news-ticker"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/news-ticker/news-ticker.spec.ts
```

9 October 2026 category-frequency follow-up: the focused unit spec uses
20,000 distinct fixed seeds with all ticker categories eligible. It passed
1 file / 2 tests. The sampled proportions are checked against the source
targets: 3% one-off prizes (accepted range 2.5–3.5%), 10% prizes (9–11%),
15% wacky prompts (14–16%), and 72% ordinary headline opportunities
(71–73%). Among those ordinary opportunities, manuscript clues are checked
at 25% (23–27% accepted range); the remainder are ordinary headlines. A
second deterministic case exhausts one-off and prize eligibility and confirms
either sampled category falls back to an ordinary headline. Translation
quality and visual comparison across every effect remain open for P-58.

9 October 2026 feedback-effect screenshot follow-up: the first checked-in
feedback screenshots were sampled at the 50% midpoint of the 0.4-second
animation. That intentionally moves the positive response above the clipped
ticker window and shrinks the negative response, leaving a blank and tiny
capture even though the live message is present. Cosmic Forge uses the same
keyframes, so the remake behavior is intentional; this was a screenshot timing
artifact, not a rendering defect. The visual cases now verify the message and
running animation before freezing at 10% progress, where both choices remain
legible. Both focused Chrome cases passed 2/2, and the updated positive and
negative captures were visually reviewed.

Run the visual cases with installed Chrome:

```powershell
$env:MIAPLACIDUS_TEST_AREA = "news-ticker-visual"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line -g "captures the ticker (good|bad)-feedback effect" tests/e2e/news-ticker/news-ticker.spec.ts
```

9 October 2026 Phase 6 sign-off: the full installed-Chrome News Ticker browser
area passed 26/26 after refreshing and visually reviewing the seven activated
wacky-effect captures (wave, disco, bounce, fade, glitch, wobble, and Boo).
The effect checks compare source animation subjects and keyframes. Positive and
negative feedback tests assert their distinct source scale/translation keyframes
instead of comparing a timing-sensitive intermediate animation frame; the
refreshed feedback captures were also visually reviewed. Ticker behavior,
prizes, manuscript clues, hover continuity, keyboard activation, reduced motion,
phone width, and persisted settings are covered by the focused browser area.
Human translation-quality approval and the wider presentation matrix remain
tracked separately under P-53/P-54/P-56.

Run the full focused browser area with installed Chrome:

```powershell
$env:MIAPLACIDUS_TEST_AREA = "news-ticker"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/news-ticker/news-ticker.spec.ts
```

**P-45 visible prize claim results (10 October 2026):** a focused installed-Chrome case switches through all six locales, forces a visible prize from the normal ticker flow, checks the localized amount and `here` action, then clicks it and verifies the exact stock payout plus the disabled, 50%-opacity claimed state. The case passed 1/1 in 7.7 seconds on isolated port 5394. Run it with:

```powershell
$env:MIAPLACIDUS_TEST_AREA = "news-ticker"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
$env:MIAPLACIDUS_TEST_PORT = "5394"
npm.cmd run test:e2e:focused -- tests/e2e/news-ticker/news-ticker.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results/p45-news-prize-5394 -g "P-45 visible ticker prize claims"
```

14 October 2026 test follow-up: the full focused News Ticker browser file passed
27/27 in installed Chrome with one worker and no snapshot updates. The disco
capture baseline was refreshed to match the centered message position set by the
capture helper, then passed again in the full run. The separate ticker unit
checks and reduced-motion browser check also passed during the same focused test
session.

The eight News Ticker screenshot cases named in the 14 October full-run manifest
were re-run on isolated Chrome port 6399: all 8 passed without snapshot updates.
I reviewed the seven wacky-effect captures; each shows its activated message at
the centered capture position with its intended effect.
