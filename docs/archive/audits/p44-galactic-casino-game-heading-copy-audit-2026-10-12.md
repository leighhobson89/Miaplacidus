# P-44 Galactic Casino game-heading copy audit — 12 October 2026

The three Casino game headings now match Cosmic Forge's source row-label copy in all six locales. The target pane renders the same localized values as headings, while `casinoGameName` removes the trailing colon when a game name appears in history.

| Source key | Target key | `en` | `es` | `pt` | `de` | `it` | `fr` |
|---|---|---|---|---|---|---|---|
| `tab7DoubleOrNothingRowLabel` | `doubleOrNothing` | Double Or Nothing: | Doble o Nada: | Dobrar ou Nada: | Alles oder Nichts: | Doppio o Niente: | Quitte ou Double: |
| `tab7WheelOfFortuneRowLabel` | `wheel` | Wheel Of Fortune: | Rueda de la Fortuna: | Roda da Fortuna: | Glücksrad: | Ruota della Fortuna: | Roue de la Fortune: |
| `tab7HigherOrLowerRowLabel` | `higherLower` | Higher Or Lower: | Mayor o Menor: | Maior ou Menor: | Höher oder Tiefer: | Più Alta o Più Bassa: | Plus ou Moins: |

Source UI evidence: `../../../cosmicForge/cosmicForge/drawTab7Content.js:468,597,1655`; source values are in `../../../cosmicForge/cosmicForge/localization.json` under the three listed keys. Target evidence: `src/app/GalacticCasinoPane.tsx` renders the labels as the three game headings and `src/i18n/casinoMessages.ts` defines them; `casinoGameName` strips the colon for history display.

The Casino remains its own Galactic child after Market. No navigation or gameplay behavior changed. No tests, builds, typechecks, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
