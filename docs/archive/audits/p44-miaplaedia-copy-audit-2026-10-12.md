# P-44 Miaplaedia localized copy and ownership audit — 12 October 2026

## Source UI and target ownership

Compared the actual Cosmic Forge Settings/Cosmicopedia menu and page renderers with the active MIAPLACIDUS navigation catalogue and renderer. In source `index.html:834-864`, each document is a separate clickable entry with its own `data-option-pane` and `tab9.optionN` identity; `ui.js:11088-11200` selects the corresponding option page, and `drawTab9Content.js:11-17,849-862` plus `descriptions.js:494-500,2734-2855` render its own heading and article. The target keeps seven pane IDs, source-option mappings, and section IDs (`src/app/presentationNavigation.ts:280-333`), creates the Miaplaedia panel list (`src/app/App.tsx:1679,1699-1710`), then gives each child a separate labelled tabpanel and passes its mapped section to `MiaplaediaPane` (`App.tsx:2938-2968`; `src/app/MiaplaediaPane.tsx:28-75`). Localized content is in `src/i18n/cosmicopediaMessages.ts`; source strings are in `cosmicForge/cosmicForge/localization.json` under `headerMain*`, `headerDesc*`, and `help*SubHeading*` / `help*SubBody*` keys.

The seven source options remain seven distinct Miaplaedia child pages, in source menu order:

| Cosmic Forge option | Source document | MIAPLACIDUS owner page |
| --- | --- | --- |
| `option4` | Get Started | `miaplaedia-get-started` |
| `option12` | Story | `miaplaedia-story` |
| `option5` | Concepts - Early | `miaplaedia-concepts-early` |
| `option6` | Concepts - Mid | `miaplaedia-concepts-mid` |
| `option7` | Concepts - Late | `miaplaedia-concepts-late` |
| `option13` | Concepts - End Goal | `miaplaedia-end-goal` |
| `option11` | Philosophies | `miaplaedia-philosophies` |

Each target child ID maps to its own section ID, localized label, and source option ID. `App.tsx` gives each child its own labelled panel and renders the selected section through `MiaplaediaPane`; no guide document is folded into Settings or another page.

## Copy comparison

Across `en`, `es`, `pt`, `de`, `it`, and `fr`, compared **42 localized page titles**, **42 page introductions**, and **660 article heading/body fields** in source order. No unintended title, content, localization, ordering, or ownership mismatch was found. The observed content differences are the four owner-directed adaptation categories:

- **Game identity:** Get Started and its page introduction call the remake Miaplacidus instead of Cosmic Forge.
- **Guide identity:** Get Started refers to the guide library as Miaplaedia instead of Cosmicopedia.
- **Player identity:** Story's closing identity replaces the source's Cosmic Forger / “your Forge” wording with Mia'Plac / Miaplacidus.
- **Destination wording:** Get Started names the remake's Tech Tree destination, and the Events article points to Settings instead of the source Menu tab, following the owner-directed page mapping.

This was a static comparison of the source UI, source localization catalogue, and current remake renderer/catalogue. No files outside this note and the Phase 6 checklist were changed; no tests, builds, typechecks, or browser checks were run.
