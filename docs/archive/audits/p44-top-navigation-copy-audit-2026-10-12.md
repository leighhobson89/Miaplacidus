# P-44 top navigation labels and order audit — 12 October 2026

Compared the source's rendered top-level tab order and localized labels with the live MIAPLACIDUS navigation declaration.

Cosmic Forge's `ui.js:10370-10430` sorts unlocked tabs by priority, then appends its locked `tab-not-yet` placeholders and remaining source tab IDs. The source priority order is Resources, Compounds, Research, Energy, Space Mining, Interstellar, Galactic, Cosmic Rip, Settings. The remake uses that same source priority in `App.tsx:197-207` and appends Miaplaedia by owner direction. Per the owner's navigation decision, the remake omits locked gameplay destinations and preserves source order among the visible tabs.

The source values are defined by `tabHeaderResources`, `tabHeaderCompounds`, `tabHeaderResearch`, `tabHeaderEnergy`, `tabHeaderSpaceMining`, `tabHeaderInterstellar`, `tabHeaderGalactic`, `tabHeaderCosmicRip`, and `tabHeaderSettings` in `localization.json`. The target catalog is `src/i18n/messages.ts`. This review found and corrected these untranslated-copy differences:

- Spanish: Space Mining capitalization, Galactic gender, and Cosmic Rip capitalization.
- Portuguese: Research, Space Mining capitalization, Galactic gender, and Cosmic Rip capitalization.
- Italian: Space Mining capitalization, Galactic gender, and the Cosmic Rip name (`Squarcio Cosmico`).
- French: Space Mining wording and Cosmic Rip capitalization.

All other source tab labels match the source wording across `en`, `es`, `pt`, `de`, `it`, and `fr`. Settings remains a readable localized name in MIAPLACIDUS because the owner-directed navigation contract requires names-only labels; Cosmic Forge uses a menu icon for that source tab. No tab ID, visibility gate, or page ownership changed.

Source evidence: `../../../../cosmicForge/cosmicForge/index.html:68-74` for the top-level tab elements, `../../../../cosmicForge/cosmicForge/ui.js:10146-10165` for the label-to-localization mapping, `../../../../cosmicForge/cosmicForge/ui.js:10370-10430` for runtime ordering, and `../../../../cosmicForge/cosmicForge/localization.json` for the nine source localization keys. Target evidence: `src/app/App.tsx:197-207` and `src/i18n/messages.ts`.

No tests, builds, typechecks, or browser checks were run. P-44 remains open for broader rendered-copy review.
