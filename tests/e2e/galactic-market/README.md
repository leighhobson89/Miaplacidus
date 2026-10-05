# Galactic Market

The browser case opens the Galactic Market child pane under the Galactic tab, selects Hydrogen and Helium using the visible controls, compares the preview with the settled stock change, verifies the trade history, and captures the post-trade screen. Rule boundary cases remain in `tests/unit/meta-progression.spec.ts`.

Focused commands: `npm run test:unit:focused -- tests/unit/meta-progression.spec.ts` and `npm run test:e2e:focused -- tests/e2e/galactic-market/galactic-market.spec.ts`.

Verification: the meta-progression unit area passed (15/15); the Chrome browser scenario was previously recorded as passing on 4 October 2026. The visual baseline needs a fresh capture after the Galactic child-pane navigation change.
