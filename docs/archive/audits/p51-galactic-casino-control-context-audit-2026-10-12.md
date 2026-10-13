# P-51 Galactic Casino control-context audit — 12 October 2026

## Source route and controls

Cosmic Forge declares Galactic as source tab 7 in `../../../../cosmicForge/cosmicForge/index.html` and places the `galacticCasinoOption` row inside that tab's child menu (`index.html:705`). `ui.js:10995-10998` handles that option by selecting the `galactic casino` child and calling `updateContent('Galactic Casino', 'tab7', 'content')`. The active content branch is `drawTab7Content.js:385` onward.

The source renderer builds separate rows for Purchase CP, Double or Nothing, Wheel of Fortune, Visiting VoidSeer and Higher or Lower (`drawTab7Content.js:391`, `441`, `490`, `886`, and `1652`). It uses localized row labels plus separate inputs/dropdowns and short action captions such as Buy, Spin, Claim and Play. The source purchase selector starts at `select` and includes cash plus the tradeable-material list; the wheel claim requires a special result and a selected prize. These source rows remain within Galactic; this review does not change navigation ownership or game rules.

## Remake findings

`presentationNavigation.ts` keeps `galactic-casino` as a Galactic child, and `App.tsx` routes that child to `GalacticCasinoPane`. Visited Galactic panes remain mounted while hidden (`App.tsx` around line 2815), so local form choices can outlive a change in run availability.

Before this change, the Casino pane retained `paymentId` even when the filtered `availableGoods` list no longer contained it. After a rebirth or other unlock-state change, the controlled payment select could refer to a missing option while its cost preview and command still used the stale material. The wheel's selected special prize was hidden when its timer-dependent option became unavailable, but the local selection remained and could reappear if that prize became available again.

The action controls were labeled, but their dynamic context was separate from enabled buttons. For example, Buy did not reference the selected CP quantity/payment preview, Double or Nothing did not reference the current stake and payout, and Higher or Lower did not reference the current card or cash-out amount. Disabled reasons were linked when present, but enabled controls generally exposed only their short action caption during control navigation.

## Change made

`GalacticCasinoPane.tsx` now renders a safe cash fallback immediately and clears the local payment selection if that material leaves the available option list. It also clears a selected wheel prize when the prize ceases to be available, keeping the selector, preview and reducer command in sync with current state.

The pane now associates action controls with existing localized dynamic text through `aria-describedby`: the CP quantity/payment/cost preview; Double or Nothing stake and payout; wheel entry cost, help and selected prize; Higher or Lower entry cost, current card and current prize; and the selected VoidSeer tier, cost and odds. Existing disabled reasons are included alongside that context. No new message keys, visible copy, or gameplay behavior were added.

## Evidence limits

This is a static source-to-renderer and JSX review. No tests, builds, typechecks, formatters, browser session or assistive-technology session were run. The six-locale wording reuses existing `casinoMessages` entries, but rendered announcement quality and long-label behavior still need browser review. P-51 remains open.

A separate read-only review confirmed the Casino description IDs exist under the same render conditions as their controls, and the payment/prize fallbacks remain synchronized with the preview and command. It found no concrete accessibility or control-state defect.
