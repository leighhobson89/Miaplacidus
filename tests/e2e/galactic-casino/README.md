# Galactic Casino browser tests

The unlocked casino fixture supplies the current-run AP award, enough cash, stock, and unlocked goods to use the player controls. A separate post-rebirth fixture verifies the Casino child stays hidden until that run receives its AP award. The Casino remains a child pane under Galactic.

Run the focused Casino browser checks with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- tests/e2e/galactic-casino/galactic-casino.spec.ts
```

The browser area checks CP purchase settlement, Wheel special-prize flow, Double or Nothing, Higher or Lower after save/reload and a locale change, Void Seer, keyboard-only navigation and play across all four games, touch-emulated purchase and play at 390px, and a visual checkpoint. Casino stays a Galactic child page throughout.

Verification on 5 October 2026: focused presentation-navigation and Casino unit tests passed 16/16. All three Chrome browser journeys reported passing, including the source child order, the post-rebirth hidden gate, and all four casino games with save/reload. The Playwright process hung during browser shutdown and was interrupted after reporting the passes. The roundtrip screenshot baseline was refreshed and visually reviewed for the current tabbed layout.

The `@ui-navigation` browser checks confirm Galactic Casino appears as a separate child page after opening Galactic, is never a top-level game tab, and remains hidden after rebirth until the current run awards AP. The unlocked child order is Rebirth, Galactic Market, Galactic Casino, then Ascendency Perks.

5 October 2026 follow-up: the rendered child links now also assert stable page IDs and original source option IDs in that order (`option1`, `option2`, `option6`, `option3`). The three focused Chrome cases passed without browser shutdown hangs. The Casino screenshot was refreshed and visually reviewed after the Resources rail was restricted to the Resources tab, giving the Casino its full content width under Galactic.

5 October 2026 keyboard/touch follow-up: the focused Casino browser area passed 5/5 in Chrome. The new keyboard journey traverses the visible main tabs and Galactic child pages, operates purchases and all four game controls without mouse activation, and verifies focus continues to the first Higher or Lower guess after starting a round. That exposed lost focus after arrow-key child-page changes; `PaneNavigation` now restores focus after the selected page renders. Pixel 7 touch emulation resized to 390px confirms users can open the Galactic Casino child, buy CP, play Double or Nothing, and keep the document within the viewport. TypeScript and targeted formatting checks passed.

5 October 2026 P-06 affordance follow-up: Casino purchase cost and availability now come from an engine selector. Disabled Casino actions expose localized precondition reasons through `aria-describedby`; paid games show their exact CP requirement and current CP balance. `tests/unit/action-affordance-selectors.spec.ts` covers purchase boundary pricing, entry fees and six-locale placeholder replacement. The new `disabled Casino actions describe their exact payment and CP shortfalls @p06-affordances` browser case asserts these descriptions and is queued with the root agent; no browser was run for this slice.
