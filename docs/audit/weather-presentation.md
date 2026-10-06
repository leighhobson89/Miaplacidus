# Weather presentation comparison

## Cosmic Forge source behavior

The fixed `#weatherEffectOverlay` is in [`index.html`](../../../cosmicForge/cosmicForge/index.html#L941). [`styles.css`](../../../cosmicForge/cosmicForge/styles.css#L4061) makes it transparent and pointer-ignoring. Rain drops are 2×5 px, use the active theme's `--text-color`, and move diagonally down and right. Volcano lava drops are 5×12 px in `rgb(193, 60, 11)` and fall vertically. Both use 80% opacity. The source does not add a weather tint, flash, or screen shake.

[`ui.js`](../../../cosmicForge/cosmicForge/ui.js#L12232) creates one particle every 20 ms, gives it a three-second CSS animation, and removes it afterwards. This maintains about 150 active DOM particles while the effect is running.

## MIAPLACIDUS presentation

[`WeatherEffectsOverlay.tsx`](../../src/app/WeatherEffectsOverlay.tsx) draws the same bounded particle count, drop sizes, colors, opacity, and motion vectors into one full-viewport canvas. The fixed pool avoids per-particle DOM creation and removal. The canvas is capped at eight million backing pixels, runs only for enabled rain/heavy rain/volcano, pauses while the page is hidden, and clears when the effect stops or reduced motion is enabled. Rain color follows the active theme. The existing Settings weather-effects preference still gates the overlay.

## Verification

- `tests/unit/weather-particle-geometry.spec.ts` pins source-compatible trajectories: rain travels diagonally from `sourceX - viewport width` to `sourceX + viewport width`; lava keeps its source X while falling vertically. A 5 October source comparison corrected both horizontal paths.
- `tests/e2e/weather/weather-overlay.spec.ts` passed 2/2 in system Chrome, confirming source-colored rain/lava pixels in the fixed viewport canvas and cleanup when weather effects are disabled, weather changes, or reduced motion is enabled.
- Broader visual review of particle legibility across themes and viewport sizes remains open under P-56.
