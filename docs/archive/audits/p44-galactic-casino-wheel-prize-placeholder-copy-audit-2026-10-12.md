# P-44 Galactic Casino wheel prize placeholder copy audit — 12 October 2026

Compared the Cosmic Forge wheel selector's `dropdownSelectSpecialPrize` placeholder with the MIAPLACIDUS wheel select. The target placeholder now uses the six source-localized values:

| Locale | Placeholder |
|---|---|
| English | `Select Special Prize` |
| Spanish | `Selecciona el premio especial` |
| Portuguese | `Selecione o prémio especial` |
| German | `Sonderpreis wählen` |
| Italian | `Seleziona il premio speciale` |
| French | `Choisir le prix spécial` |

The separate MIAPLACIDUS field label remains `choosePrize` to label its explicitly labelled select; the source placeholder is used for the empty select option and screen-reader context. The selector, selected prize, claim control, and wheel behavior are unchanged. Casino remains its own Galactic child page.

Source evidence: `../../../../cosmicForge/cosmicForge/drawTab7Content.js:524,576` and `dropdownSelectSpecialPrize` in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: the select in `src/app/GalacticCasinoPane.tsx` and `selectPrizePlaceholder` in `src/i18n/casinoMessages.ts`.

Static source/catalogue and renderer review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
