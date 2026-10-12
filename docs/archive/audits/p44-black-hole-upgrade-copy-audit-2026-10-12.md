# P-44 Black Hole upgrade-control copy audit (12 October 2026)

Compared the Black Hole upgrade controls and research hint in the current Cosmic Forge UI with the active MIAPLACIDUS renderer and six-locale catalogue.

Cosmic Forge updates the power, duration, and recharge button copy in [`game.js`](../../../../cosmicForge/cosmicForge/game.js#L4283-L4350). The buttons show current-to-next values with the Research Points price; the final recharge upgrade displays the current interval followed by `ALWAYS ACTIVE`; capped duration and recharge use their own maxed labels. The source calculations use the existing power-step rule, a 3-second duration increment, and a 0.88 recharge multiplier clamped to the 30-second minimum. The source button labels are localized in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L2302-L2308) and the equivalent five locale blocks.

MIAPLACIDUS previously rendered only the upgrade name and price. [`BlackHolePane.tsx`](../../../src/app/BlackHolePane.tsx) now shows current-to-next values and the price, switches to the localized `Always active` result for the final recharge purchase, and presents explicit maxed states for duration and recharge. It uses the existing typed Black Hole constants and does not change upgrade commands or mechanics. The new six-locale strings are in [`blackHoleMessages.ts`](../../../src/i18n/blackHoleMessages.ts).

Cosmic Forge also renders `blackHoleValueHint` beneath the research control in [`drawTab7Content.js`](../../../../cosmicForge/cosmicForge/drawTab7Content.js#L2218-L2222). The target `researchHelp` now states that the time warp accelerates production, research, and construction in all six locales.

This corrects a P-44 visible-copy gap while preserving the existing Galactic > Black Hole destination. Static source/renderer review only; no tests, builds, typechecks, formatters, or browser review were run. P-44 remains open for the broader catalogue crosswalk and rendered-locale review.
