# P-44 Resources and Compounds bulk-storage action audit — 13 October 2026

## Source action ownership and behavior

Cosmic Forge declares separate `increaseAllStorageResourcesButton` and `increaseAllStorageCompoundsButton` controls in Resources and Compounds (`index.html:87,379`), with separate handlers calling `increaseAllStorage('resources')` and `increaseAllStorage('compounds')` (`ui.js:1858-1869`). They remain category-owned actions in MIAPLACIDUS.

The source gathers eligible goods in source order, reserves shared costs, and adds each good's `usedForFuelPerSec` as a one-second affordability allowance (`game.js:711-792`). Water is considered first where its secondary Concrete cost applies. Eligible purchases spend no more than current stock, increase storage by the active storage multiplier, and produce one aggregate notice (`game.js:10389+`).

## MIAPLACIDUS implementation

- The Resources and Compounds renderers each show an `Increase All Storage` control beside that category's separate Sell All control (`src/app/EconomyPanes.tsx:349-395,407,1614`). The typed `increaseAllStorage` label values match source key `buttonIncreaseAllStorage` in en/es/pt/de/it/fr (`src/i18n/economyMessages.ts:347,553,757,967,1172,1380`; source `localization.json:1408,4031,6654,9277,11900,14523`). This records the current mapping; exact wording is not a localization acceptance gate.
- `economy.storage.increaseAllCategory` scopes candidate selection to one category, retains the unscoped `economy.storage.increaseAll` command, follows source ordering and Water/Concrete costs, reserves shared inputs, and uses the active economy tick plan's one-second fuel demand as the affordability allowance (`src/engine/commands.ts:177-191,615-660,1962-1991`).
- One accepted category command emits the per-good storage events and routes one aggregate result notice (`src/app/economyActionNotifications.ts:48-73`). The typed `storageIncreasedAllNotice` values match source key `notificationIncreasedAllStorage` and are populated in en/es/pt/de/it/fr (`src/i18n/economyMessages.ts:46,227,432,636,846,1052,1260`; source `localization.json:2284,4907,7530,10153,12776,15399`). This is current mapping evidence; translation fluency and phrasing are not acceptance criteria.

This static source-to-command/renderer mapping records the implemented controls and locale-value presence. It does not establish interactive behavior, exact displayed results, or rendered placement in a browser. P-44 remains open for its broader source-key inventory, route/state review, and the rest of its acceptance evidence. No tests or builds were run.
