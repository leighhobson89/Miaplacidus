# News Ticker browser area

The focused `@news-ticker` area exercises the visible shell strip through the
test-mode engine command boundary and Settings controls. It checks the blank
empty state (without an idle prompt), localized headline/category routing,
full leftward exit before queued messages replace one another, continuous
scrolling while a wacky message is hovered, un-underlined themed claim
controls, resource and one-off reward claims by keyboard,
keyboard activation for all eight wacky messages (including both feedback
choices), manuscript clue star naming, scheduled category creation and its
20–35 second interval, phone-width overflow, localized headline rendering at
390px in all six locales, and save/reload persistence of the Settings toggle. A unit
check scans every News Ticker string in all six locales for encoding artifacts
and pins accented Spanish, Portuguese, and French copy.

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
Translation-quality review, stochastic category-frequency measurement,
reduced-motion review, and visual comparison of every effect remain part of
P-34/P-54/P-56.
