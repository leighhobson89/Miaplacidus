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
Translation-quality review, stochastic category-frequency measurement, and
visual comparison of every effect remain part of P-34/P-54/P-56.

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
