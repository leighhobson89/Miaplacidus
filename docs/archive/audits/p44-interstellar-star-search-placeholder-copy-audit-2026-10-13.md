# P-44 Star Map search placeholder copy audit

**Date:** 13 October 2026

Cosmic Forge `drawTab5Content.js:275,299` uses `placeholderSearchStar` for the enabled Star Map search overlay. The source prompts are `Search Star...`, `Buscar estrella...`, `Procurar estrela...`, `Stern suchen...`, `Cerca stella...`, and `Rechercher une étoile...`.

`src/app/StarMapPane.tsx:690-692` binds the enabled search input's placeholder to `starMapText(locale, "searchPlaceholder")`. The six values in `src/i18n/starMapMessages.ts` now match the source prompt. The separate two-character minimum feedback remains unchanged. Star Data remains a separate Interstellar child and the map remains confined to the Star Map child. Static source/catalogue/renderer comparison; no tests or browser checks were run. P-44 remains open.
