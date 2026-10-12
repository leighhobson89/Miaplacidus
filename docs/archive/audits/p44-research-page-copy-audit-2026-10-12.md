# P-44 Research page label audit — 12 October 2026

Compared the visible Research tab and its Science Buildings child label with Cosmic Forge's source localization and current page routing.

| UI destination | Cosmic Forge source | MIAPLACIDUS destination | Result |
|---|---|---|---|
| Research top-level tab | `index.html:308` uses `tabHeaderResearch`; `localization.json` defines the localized label | `App.tsx:199` uses `tab.research` | Portuguese was `Pesquisa` in the remake and is now `Investigação` |
| Research → Science Buildings | `drawTab3Content.js` renders the Research option with `headerMainResearch` | `presentationNavigation.ts:139-147` uses `economyLabel(locale, "research")` | Portuguese was `Pesquisa` in the remake and is now `Investigação` |

The source's six values are Research, Investigación, Investigação, Forschung, Ricerca, and Recherche (`en`, `es`, `pt`, `de`, `it`, `fr`). The two Portuguese target labels now use the source value, so the top-level tab and child destination stay consistent. No other locale change or page ownership change was indicated. Research options remain distinct from Energy, and the owner-directed Technology/Tech Tree consolidation is unchanged.

Source evidence: `../../../cosmicForge/cosmicForge/index.html:308`, `../../../cosmicForge/cosmicForge/localization.json` (`tabHeaderResearch`, `headerMainResearch`), and `../../../cosmicForge/cosmicForge/drawTab3Content.js`. Target evidence: `src/app/App.tsx:199`, `src/app/presentationNavigation.ts:139-147`, `src/i18n/messages.ts`, and `src/i18n/economyMessages.ts`.

No tests, builds, typechecks, or browser checks were run. P-44 remains open for the broader catalogue and rendered-copy review.
