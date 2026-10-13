# P-44 Star Data name-column help copy audit

**Date:** 13 October 2026

Cosmic Forge `descriptions.js:512` binds the Star Data name-header tooltip to `infoTooltipStarLegendName`; its six locale strings begin in `localization.json:296` and the matching locale blocks. The source guidance describes alphabetical sorting by Star Name and a globe icon to the left of each name that opens the Star Map and highlights that star.

The remake's `src/app/StarMapPane.tsx:219` binds the name-header tooltip to `starDataNameHelp`. Its table exposes sorting through a separate menu and the map action in a separate `Map` column (`StarMapPane.tsx:250,321-324`), so the six localized help strings now preserve the source's sort-and-highlight purpose while naming the remake's actual controls. This is an intentional wording adaptation for the current renderer, not verbatim source-copy parity. Star Data remains a separate Interstellar child and the map remains visible only on the Star Map child. Static source/catalogue/renderer comparison; no tests or browser checks were run. P-44 remains open.
