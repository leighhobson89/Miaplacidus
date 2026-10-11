# P-44 Miaplaedia source crosswalk — 11 October 2026

## Scope and evidence

Compared the seven Cosmic Forge Cosmicopedia documents in `cosmicForge/cosmicForge/index.html:819-865`, the source assembly in `cosmicForge/cosmicForge/descriptions.js:494-500,2734-2855`, and their six-locale copy in `cosmicForge/cosmicForge/localization.json` against `IncrementalGame/src/app/presentationNavigation.ts`, `src/app/MiaplaediaPane.tsx`, `src/i18n/cosmicopediaMessages.ts`, and the Miaplaedia section labels in `src/i18n/settingsMessages.ts`.

## Crosswalk result

All seven source options are wired to their matching Miaplaedia child and render the corresponding title, intro, and ordered article list:

| Cosmic Forge option | Source document | MIAPLACIDUS child |
| --- | --- | --- |
| option4 | Get Started | `miaplaedia-get-started` |
| option12 | Story | `miaplaedia-story` |
| option5 | Concepts - Early | `miaplaedia-concepts-early` |
| option6 | Concepts - Mid | `miaplaedia-concepts-mid` |
| option7 | Concepts - Late | `miaplaedia-concepts-late` |
| option13 | Concepts - End Goal | `miaplaedia-end-goal` |
| option11 | Philosophies | `miaplaedia-philosophies` |

The localized child labels map to the corresponding `headerMain*` keys in all six locales. Page introductions map to `headerDesc*`; article headings and bodies map in source order to the matching `help*SubHeading*` and `help*SubBody*` keys. The 330 article heading/body pairs have existing six-locale source-comparison evidence in `docs/plans/feature-parity-checklist.md` under the Cosmicopedia entry.

## Finding

No wrong-document or wrong-option mapping, missing source copy, or page-label mismatch was found. The owner-directed transfer of these documents from Settings to Miaplaedia remains in place. The Events article's destination says Settings to reflect the owner's remapped Events page; the source originally says Menu. The Get Started text also uses the owner's requested Miaplacidus and Miaplaedia names. These are intentional adaptations. No application code or test file was changed, and no checks were run.
