# P-44 Galactic Casino copy audit — 11 October 2026

## Scope

Compared the Galactic Casino page's visible heading and introduction, page and game help, purchase and Void Seer selectors, and win/loss notifications against the current read-only Cosmic Forge source and its six locale blocks (`en`, `es`, `pt`, `de`, `it`, `fr`). The existing Galactic > Galactic Casino child-page ownership and order were left unchanged.

## Evidence and findings

- Cosmic Forge renders the Casino heading and distinct Casino content in `../../../../cosmicForge/cosmicForge/drawTab7Content.js:385-389`. The localized heading uses `headerMainGalacticCasino`; the target heading in `src/app/GalacticCasinoPane.tsx` uses the corresponding `casinoText(locale, "title")`. The existing `tests/unit/casino-title-parity.spec.ts` records the six-locale title and child-label comparison.
- Cosmic Forge supplies the Casino introduction through `headerDescGalacticCasino` (`../../../../cosmicForge/cosmicForge/descriptions.js:484`) and page help through `infoTooltipGalacticCasinoHeader` (`descriptions.js:526`). The Wheel selector explanation uses `infoTooltipGalacticCasinoWheelOfFortune` (`descriptions.js:527`). MIAPLACIDUS routes these to `casinoHeaderDescription`, `casinoText(locale, "headerHelp")`, and `casinoText(locale, "wheelHelp")` in `src/i18n/casinoMessages.ts`, rendered by `src/app/GalacticCasinoPane.tsx:404-408` and `:548-553`.
- Cosmic Forge attaches purchase and game row descriptions to their Casino controls through `descriptions.js:1697-1702`; the six-locale keys are `galacticCasinoPurchaseCpContent1` and `galacticCasinoGame1Content1` through `galacticCasinoGame4Content1`. The target help is rendered at each corresponding card in `GalacticCasinoPane.tsx:428, 496, 551, 655, 801`. The purchase helper had added a Cash clause not present in the source key; `casinoMessages.ts` now matches the source wording in all six locales. Game help already matched its source keys.
- Cosmic Forge labels Void Seer options with their prize names and cost (`../../../../cosmicForge/cosmicForge/drawTab7Content.js:721-723`; `casinoVoidSeerPrizeLabel1-3` in `../../../../cosmicForge/cosmicForge/localization.json`). MIAPLACIDUS previously displayed only a numeric tier, cost, and chance. `casinoMessages.ts` now includes the three source prize names for all six locales, and `GalacticCasinoPane.tsx:817` displays the matching name. The target retains its accurate `1/(max + 1)` chance display rather than the source label's `{odds}/1` wording, because the source passes its reel maximum into that placeholder.
- Source notification routes are in `../../../../cosmicForge/cosmicForge/casino.js:1000-1008,1124-1172` (Double or Nothing and Wheel), `drawTab7Content.js:838-869` (Void Seer), and `drawTab7Content.js:1503,1549,1612` (Higher or Lower). MIAPLACIDUS maps those event outcomes in `src/app/casinoEventNotifications.ts:123-182,258-292,473-510` using the dedicated six-locale strings in `src/i18n/casinoMessages.ts`. The existing focused Casino notification specs contain the source-copy assertions for the localized win/loss, clue, prize, and cash-out outcomes. This audit found no additional missing outcome route or contradictory result copy.

## Result

The purchase description and Void Seer selector gaps are corrected. No further Casino copy change was warranted by this audit. Existing focused coverage includes `tests/unit/casino-title-parity.spec.ts`, `tests/unit/casino-wheel-help.spec.ts`, `tests/unit/casino-event-notifications.spec.ts`, and `tests/unit/casino-hilo-void-notifications.spec.ts`. No test, build, typecheck, formatter, or browser check was run in this implementation pass.

## Visible row-label follow-up (12 October 2026)

Cosmic Forge renders `tab7VisitingVoidSeerRowLabel` as the fourth Casino game's visible row label (`../../../../cosmicForge/cosmicForge/drawTab7Content.js:882-895`; locale values in `localization.json:1984,4608,7230,9853,12476,15099`). The remake used the shorter game name for the corresponding card heading and tooltip label (`src/app/GalacticCasinoPane.tsx:803-807`). Updated `casinoMessages.voidSeer` in all six locales to restore the source's “Visiting VoidSeer” label and translated equivalents. The Spanish label preserves the source's valid `Vacío` spelling. The card remains within the separate Galactic Casino child page.

No tests, builds, typechecks, formatting checks, or browser review were run; P-44 remains open.

## Purchase section heading correction (12 October 2026)

The source menu places the Galactic Casino option (`../../../../cosmicForge/cosmicForge/index.html:703-713`) after Galactic Market; the target inserts `galactic-casino` after `galactic-market` and maps it to source `option6` (`src/app/presentationNavigation.ts:236-247`). `App.tsx:2826-2828` routes that distinct child page to `GalacticCasinoPane`. Inside the source Casino page, `drawTab7Content.js:391-395` renders `tab7PurchaseCpRowLabel` as the heading for the CP purchase row. MIAPLACIDUS rendered the same section as a card heading through `casinoText(locale, "buyTitle")` (`src/app/GalacticCasinoPane.tsx:426-435`), but the catalogue wording was a generic "Buy casino points" paraphrase. Updated the six `buyTitle` values to match the source row label, including its localized CP/PC currency naming and colon. Source locale values are `../../../../cosmicForge/cosmicForge/localization.json:1970,4593,7216,9839,12462,15085`.

No tests, builds, typechecks, formatting, or rendered browser review were run; P-44 remains open.
