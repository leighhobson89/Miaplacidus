# P-44 Resources and Compounds bulk-sale action audit — 13 October 2026

## Source action ownership

Cosmic Forge declares a separate `sellAllResourcesButton` in Resources (`index.html:86`) and `sellAllCompoundsButton` in Compounds (`index.html:378`); both display the shared `buttonSellAll` label. The source handlers call `sellAllUnlockedResources()` and `sellAllUnlockedCompounds()` respectively (`ui.js:1842-1852`). Each action belongs to its source category; the two destinations are not combined.

## MIAPLACIDUS implementation

- Resources renders the shared category-owned bulk actions before its resource catalogue (`src/app/EconomyPanes.tsx:349-395,407`). Compounds renders them within the Compound parent renderer (`src/app/EconomyPanes.tsx:1614`). The Sell All controls are disabled when no unlocked good can be sold.
- `dispatchEconomySellAll` selects only the relevant unlocked material or compound IDs and dispatches the existing `resource.sell` command with `amount: "all"` for each (`src/app/economySaleNotifications.ts:49-86`). It aggregates accepted sale amounts and cash into one result notice and stays silent when nothing was sold.
- The active copy uses the existing `sellAll` label and adds typed `sellAllResourcesNotice` and `sellAllCompoundsNotice` values in en/es/pt/de/it/fr (`src/i18n/economyMessages.ts:43-44,224-225,429-430,633-634,843-844,1049-1050,1257-1258`). This establishes non-empty value presence in each supported locale; translation fluency and phrasing are not acceptance criteria.

## Remaining boundary

This static source-to-renderer mapping confirms the two bulk-sale controls and their message coverage. It does not replace interactive acceptance. A separate source compound-creation warning about output lost to full storage remains unmatched and needs a mechanics review before adding a truthful remake notice. P-44 remains open for the broader source-key inventory, route review, and remaining message families. No tests or builds were run.
