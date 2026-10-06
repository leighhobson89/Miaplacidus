# Galactic Market

The browser case opens the Galactic Market child pane under the Galactic tab, selects Hydrogen and Helium using the visible controls, compares the preview with the settled stock change, verifies the trade history, and captures the post-trade screen. Rule boundary cases remain in `tests/unit/meta-progression.spec.ts`.

Focused commands: `npm run test:unit:focused -- tests/unit/meta-progression.spec.ts` and `npm run test:e2e:focused -- tests/e2e/galactic-market/galactic-market.spec.ts`.

Verification: the meta-progression unit area passed (15/15). On 5 October 2026, the focused Chrome trade journey passed 1/1 after regenerating the obsolete screenshot baseline, then passed again without snapshot updates. The reviewed screenshot now shows Galactic Market as a Galactic child alongside the AP/CP header and current trade controls; the former flattened menu and pioneer table are gone.
