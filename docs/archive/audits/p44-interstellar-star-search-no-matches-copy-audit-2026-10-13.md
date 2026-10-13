# P-44 Star Map no-search-results copy audit

**Date:** 13 October 2026

Cosmic Forge `drawTab5Content.js:405` renders localized `textNoMatches` in the search overlay when a query has no results. The six source values are `No matches`, `Sin resultados`, `Sem resultados`, `Keine Treffer`, `Nessun risultato`, and `Aucun résultat`.

`src/app/StarMapPane.tsx:430-436` derives the empty-query feedback from `starMapText(locale, "noMatches")`, and the renderer presents it in a polite `<output>` status region (`StarMapPane.tsx:697-700`). The six values in `src/i18n/starMapMessages.ts` now match the source. Cosmic Forge renders its string as a `role="option"` entry in the result list; the remake retains its accessible status-output treatment. Search filtering and Star Data/Star Map ownership are unchanged. Static source/catalogue/renderer comparison; no tests or browser checks were run. P-44 remains open.
