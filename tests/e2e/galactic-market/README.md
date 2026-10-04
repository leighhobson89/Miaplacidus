# Galactic Market

The browser case opens the Galaxy tab through the test fixture, selects Hydrogen and Helium using the visible controls, compares the preview with the settled stock change, verifies the trade history, and captures the post-trade screen. Rule boundary cases remain in `tests/unit/meta-progression.spec.ts`.

Focused commands: `npm run test:unit:focused -- tests/unit/meta-progression.spec.ts` and `npm run test:e2e:focused -- tests/e2e/galactic-market/galactic-market.spec.ts`.

Verification: the meta-progression unit area passed (15/15); Chrome browser scenario passed (1/1) on 4 October 2026. The visual baseline was refreshed after adding the casino and perk panes below the market on the Galaxy page.
