# P-44 Star Map mode-label copy audit (12 October 2026)

Compared the visible Star Map mode-button labels in the source UI with the active MIAPLACIDUS Star Map renderer and its localized messages.

Cosmic Forge renders the `Normal`, `Distance`, `Studied`, and `In Range` controls from the `starMapModeStudied` and `starMapModeInRange` source keys alongside its other mode labels in [`drawTab5Content.js`](../../../../cosmicForge/cosmicForge/drawTab5Content.js#L326-L338). The source values are in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1864-L1869) and the equivalent locale blocks. The target `StarMapPane` uses the matching `mapMode*` values in `starMapMessages.ts`.

Corrected the mode label values where they differed: German `Erforscht` → `Untersucht`; Spanish `Al alcance` → `En Alcance`; Portuguese `Ao alcance` → `Ao Alcance`; Italian `A portata` → `A Portata`; and French `À portée` → `À Portée`. Other mode labels already matched the source. The longer target help text remains an intentional remake description of each mode's filtering, search, and affordability behavior. No navigation or map behavior changed; Star Data remains its own Interstellar child page.

Static source/renderer and locale review only; no tests, builds, typechecks, formatters, or browser review were run. P-44 remains open for the broader catalogue crosswalk and rendered-locale review.
