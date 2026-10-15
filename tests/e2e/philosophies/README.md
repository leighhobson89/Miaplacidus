# Philosophies

The first completed star study opens a permanent one-path choice. The Research tab then exposes the selected path's run ability and four repeatables.

## Phase 7 source leader-intro mapping — AUTHORED, NOT RUN

Cosmic Forge loads `modalPlayerLeaderIntroHeaderText` and `modalPlayerLeaderIntroContentText1` through `modalPlayerLeaderIntroContentText4` from `descriptions.js:257-261`. `game.js:15317-15321` selects the matching body for the chosen philosophy after an Ascendency Point is awarded in the first two runs. `ui.js:4854-4857` also uses those four bodies as the choice-button hover copy.

MIAPLACIDUS has no equivalent post-award leader-intro modal. Its localized equivalent is the mandatory first-star-study choice in Space Mining → Telescope, rendered by `PhilosophyPane.tsx` as `data-testid="philosophy-choice"`; the route presents all four philosophy cards before selection. The crosswalk is `modalPlayerLeaderIntroHeaderText` → `philosophyText(locale).choiceTitle`; each `modalPlayerLeaderIntroContentTextN` → that path's localized name, summary, ability name, and ability effect in the matching card. The selected path remains available under Research → Philosophy through the same localized name, summary, and ability content. This keeps the path explanation at the decision point and does not add a second modal after the AP award.

`p45-philosophy-copy-locales.spec.ts` now carries the `@p7-player-leader-intro` tag and identifies this source-to-target adaptation; its rendered choice-card assertions cover all four paths in `en`, `es`, `pt`, `de`, `it`, and `fr`. The Phase 7 mapping update is **AUTHORED, NOT RUN**. No new source values were needed because the existing `philosophyMessages.ts` route supplies non-empty localized content for every mapped field.

## Phase 7 philosophy choice names (16 October 2026; AUTHORED, NOT RUN)

Cosmic Forge `game.js:11569-11572` loads `philosophyNameConstructor`,
`philosophyNameSupremacist`, `philosophyNameVoidborn`, and
`philosophyNameExpansionist` as the four choice-modal button labels; the
corresponding callbacks at `game.js:11525-11567` set those exact four path
identities. MIAPLACIDUS routes each source label to
`philosophyText(locale).paths.<id>.name`. `PhilosophyPane.tsx` renders that same
identity-specific name in the matching choice card heading and selection
button, keyed by `data-philosophy-id`, and reuses it as the selected path title.
The six existing locale records already provide four non-empty, distinct names
per locale, so no catalogue value change was needed.

`p7-philosophy-choice-name-locales.spec.ts` asserts all four card identities,
headings, and selection controls in `en`, `es`, `pt`, `de`, `it`, and `fr`.
This Phase 7 route assertion is **AUTHORED, NOT RUN**.

## Evidence

- `philosophies.spec.ts` checks all four path illustrations and choice controls fit the viewport, then uses the telescope and study controls, selects Expansionist, researches Rapid Expansion and Warp Drive, saves, reloads, and checks that the path, active ability and permanent rank return.
- Screenshot checkpoints cover the path choice artwork and the selected Expansionist header artwork.
- `tests/unit/philosophy.spec.ts` checks all four paths, exact ability/repeatable costs, wrong-path and duplicate-selection rejection, Constructor storage scaling, rebirth reset/retention, v22 migration, save round-trip, and all six locale records.
- `tests/unit/diplomacy.spec.ts` checks the strict Supremacist threshold above 3× fleet power.

Run the focused evidence with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npm.cmd run test:e2e:focused -- tests/e2e/philosophies/philosophies.spec.ts
npm.cmd run test:unit:focused -- tests/unit/philosophy.spec.ts tests/unit/diplomacy.spec.ts
```

The browser path uses the normal `timer.complete` engine command boundary to finish the study. It does not wait the several game minutes represented by the study timer.

Verification record (5 October 2026): the focused Chrome browser journey passed with the artwork checkpoints updated. The runner printed the passing result, then hung during browser shutdown and was interrupted.

8 October 2026 notification follow-up: after the first star study, choosing Expansionist now asserts the visible `special`-classified warning notice. The selected-path artwork checkpoint waits for the 3000ms notice to expire before capture. Only `philosophy-selected-path-artwork.png` was refreshed and visually reviewed; `philosophy-path-choice-artwork.png` was restored. The no-update installed-Chrome rerun passed 1/1. The two focused `philosophy-event-notifications.spec.ts` unit tests verify all four exact path messages and routing across six locales.

**P-45 Philosophy visible-copy follow-up (10 October 2026):** the focused
`p45-philosophy-copy-locales.spec.ts` installed-Chrome journey passed 1/1 in
9.4 seconds on port 5186. It completes a first star study, checks all four
choice cards (summary, ability, repeatable effects, and button) in six locales,
selects Expansionist, then checks the Research > Philosophy page and its ability
and repeatable cards in all six locales. Typecheck and focused Oxfmt passed; no
copy change was needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='5186'; npm.cmd run test:e2e:focused -- tests/e2e/philosophies/p45-philosophy-copy-locales.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-philosophy-copy-5186
```

**P-16 choice-dialog focus (9 October 2026):** the focused path verifies the
choice title receives focus when the first star study opens the dialog, and
Escape cannot dismiss the forced choice or clear its pending state, and
choosing Expansionist returns focus to Study Stars. This caught the dialog
opening after the prior action had lost browser focus; a stable action target
now restores it after selection. The combined installed-Chrome P-16 batch
passed 9/9 selected routes in 29.8 seconds on port 4261.

The focused Escape/focus regression is `returns focus to the star-study action
after the philosophy choice @p16-focus` in `philosophies.spec.ts`. It verifies
Escape leaves the mandatory choice open, keeps focus on the dialog title, and
preserves the pending/no-choice engine state; selecting Expansionist closes it
and restores focus to Study Stars. Installed Chrome passed 1/1 in 5.6 seconds
on port 4297. P-16 remains open for broader navigation and toast-dismissal
routes.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4297'
node .\node_modules\playwright\cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line -g 'returns focus to the star-study action after the philosophy choice' tests/e2e/philosophies/philosophies.spec.ts
```

## P-28 philosophy-path artwork (10 October 2026)

`p28-artwork-review.spec.ts` checks the four original path illustrations in
the forced choice dialog across all nine themes at 1280 x 720 and 390 x 844. It
asserts resolved theme strokes/fills, card containment, decorative SVG
semantics, dialog viewport fit, and vertical scrolling to the final card at
phone width without horizontal page overflow. Terminal desktop and Light and
Supernova phone captures were visually reviewed, including the lower phone
cards. The five-family installed-Chrome P-28 batch passed 5/5 on port 4980.

The full-page choice checkpoint was refreshed after visual review; at that
time, the telescope page made the capture 1280 x 1422. On 14 October, the
telescope layout produced a 1280 x 1165 capture. Review found that the new
checked-in baseline omitted the visible choice-card text and buttons, so it
was replaced with the fresh capture showing all four complete choice cards.
The no-update path-choice rerun passed 1/1 in 11.7 seconds on port 6455. Named
matrix captures are attached in the generated Playwright report at
`playwright-report/index.html`; this focused art matrix does not replace P-56's
broader screenshot review.

## P-45 Philosophy purchase results (10 October 2026)

`p45-philosophy-purchase-results.spec.ts` follows the visible telescope build,
first star study, and Expansionist choice. The test gateway adds Research Points
for setup; Rapid Expansion and one Warp Drive rank are bought with their visible
controls. The case passed in installed Chrome 1/1 in 8.4 seconds on isolated
port 5668. It checks exact Research Point deductions and, after switching
through all six locales, the localized ability Active state, Warp Drive rank,
and next cost. Typecheck and focused Oxfmt passed; no production or copy change
was needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5668'
node .\node_modules\playwright\cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-philosophy-purchases-5668 tests/e2e/philosophies/p45-philosophy-purchase-results.spec.ts --project=chrome
```

**Saved full-run recovery (14 October 2026):** the P-45 purchase check now
uses the localized `abilityAction` label, and the copy check selects the
Expansionist summary paragraph specifically. These correct the old Research
button label and ambiguous paragraph locator; no gameplay or locale values
changed. The saved path-choice image used the earlier 1422px layout; its
replacement was visually reviewed at 1165px and includes all choice content.
The focused Chrome run of `philosophies.spec.ts`,
`p45-philosophy-copy-locales.spec.ts`, and
`p45-philosophy-purchase-results.spec.ts` passed **4/4 in 21.1 seconds** on
port 6453. The count includes the P-16 focus case in the shared
`philosophies.spec.ts` file.
After refreshing the path-choice image, its targeted no-update rerun passed
**1/1 in 11.7 seconds** on port 6455. No source changes were needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6453'
npm.cmd run test:e2e:focused -- tests/e2e/philosophies/philosophies.spec.ts tests/e2e/philosophies/p45-philosophy-copy-locales.spec.ts tests/e2e/philosophies/p45-philosophy-purchase-results.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```


## Economy catchall migration (14 October 2026)
The Philosophy cost-context case formerly in the Economy catchall now lives in [`e57-philosophy-cost-context.spec.ts`](e57-philosophy-cost-context.spec.ts).

## Phase 7 Philosophy source-choice copy (16 October 2026; AUTHORED, NOT RUN)

Cosmic Forge opens its permanent-path choice after the first Star Study with
`modalPlayerLeaderPhilosophyHeaderText` and `modalPlayerLeaderPhilosophyContentText`.
The active MIAPLACIDUS choice dialog routes these to
`philosophyMessages.ts#choiceTitle` and `#choicePrompt`; the prompt adapts the
source narrative to the permanent-choice guidance and review prompt. The
six-locale `p7-philosophy-choice-name-locales.spec.ts` checks both fields along
with each distinct path name in the same first-study modal. It is **AUTHORED,
NOT RUN** for Phase 8.

## Phase 7 Philosophy help copy (16 October 2026; AUTHORED, NOT RUN)

Cosmic Forge `techPhilosophy…Content1` rows map to the selected philosophy
ability's `philosophyText(locale).abilities.<abilityId>.effect` and its 16
repeatable entries' `philosophyText(locale).upgrades.<repeatableId>.effect`.
These render in the Philosophy choice cards and the selected path's Research →
Philosophy page. The existing `p45-philosophy-copy-locales.spec.ts` checks all
four ability effects and all 16 repeatable effects in each of the six locales.

Source `infoTooltipPhilosophyHeader` maps to the three populated
`philosophyText(locale).headerHelp` paragraphs. The same spec now opens the
selected-path page tooltip and checks each paragraph after switching through
all six locales. These assertions are **AUTHORED; NOT RUN** for Phase 8.
