# P-44 Galactic child ownership audit - 12 October 2026

## Source UI and filtering

Cosmic Forge `index.html:681-746` declares the Galactic child rows in visible DOM order: Rebirth (`option1`), Galactic Market (`option2`), Galactic Casino (`option6`), Ascendency Perks (`option3`), Megastructures (`option4`), and Black Hole (`option5`). Casino, Ascendency Perks, Megastructures, and Black Hole start with the `invisible` class; source UI/game checks reveal each row when eligible. Rebirth is shown after the destination star is scanned (`game.js:9519-9526`); Casino follows `getGalacticCasinoUnlocked()` (`ui.js:8437-8447`); Ascendency Perks appears after run 1 or an AP award (`game.js:9563-9566`); Megastructures appears during a Megastructure run, after the tab unlocks, or when one is captured (`game.js:3897-3912`); Black Hole follows discovery (`game.js:4006-4027`). The Market row is present by default. These visibility checks filter rows without changing the declared order.

The source click handlers select distinct headings/content for options 1-6 (`ui.js:10932-10999`): Rebirth, Galactic Market, Ascendency Perks, Megastructures, Black Hole, and Galactic Casino respectively. `drawTab7Content` has separate page branches for those headings (`drawTab7Content.js:126,233,385,1727,1826,1875`). In particular, Galactic Casino has its own menu row, option-6 handler, heading, and content branch; it is not part of Galactic Market.

## MIAPLACIDUS destination map

`src/app/presentationNavigation.ts:213-278` preserves the source DOM order and option IDs as the following stable child IDs. Conditional entries remain filtered according to the target run/permanent state:

| Source child | Target child ID | Active renderer route |
|---|---|---|
| Rebirth (`option1`) | `galactic-rebirth` | `RebirthPane` (`src/app/App.tsx:2816-2818`; exported from `src/app/AscendencyPane.tsx`) |
| Galactic Market (`option2`) | `galactic-market` | `GalacticMarketPane` (`App.tsx:2818-2820`; `src/app/GalacticMarketPane.tsx`) |
| Galactic Casino (`option6`) | `galactic-casino` | `GalacticCasinoPane` (`App.tsx:2826-2828`; `src/app/GalacticCasinoPane.tsx`) |
| Ascendency Perks (`option3`) | `galactic-ascendency-perks` | `AscendencyPane` (`App.tsx:2820-2822`; `src/app/AscendencyPane.tsx`) |
| Megastructures (`option4`) | `galactic-megastructures` | `MegastructurePane` (`App.tsx:2822-2824`; `src/app/MegastructurePane.tsx`) |
| Black Hole (`option5`) | `galactic-black-hole` | `BlackHolePane` (`App.tsx:2824-2826`; `src/app/BlackHolePane.tsx`) |

`App.tsx:2793-2832` mounts a labelled tab panel per child ID and renders the selected child's route. Casino is explicitly dispatched to its own `GalacticCasinoPane`, after Market and before Ascendency Perks; its ownership remains Galactic and its content stays distinct from Market.

## Finding and limits

The static source-to-target comparison found no mismatch in Galactic child ownership, source option mapping, or visible order. This review records route ownership and sidebar filtering only; it does not certify interactive gate behavior or rendered appearance. No code, checklist, estimate, or test file was changed. No tests or browser checks were run.
