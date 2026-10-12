# P-44 Research Tech Tree heading copy audit — 12 October 2026

Compared the source Tech Tree menu label and heading with MIAPLACIDUS's Research child navigation and page renderer. Cosmic Forge maps the visible `Tech Tree` option to `headerMainTechTree` in `ui.js`; its localized values are in `localization.json`. The target uses `economyMessages.technologyTree` for the Research > Tech Tree child label and page heading.

| Locale | Cosmic Forge `headerMainTechTree` | MIAPLACIDUS `technologyTree` |
|---|---|---|
| English | `Tech Tree` | `Tech Tree` |
| Spanish | `Árbol Tecnológico` | `Árbol Tecnológico` |
| Portuguese | `Árvore Tecnológica` | `Árvore Tecnológica` |
| German | `Technologiebaum` | `Technologiebaum` |
| Italian | `Albero Tecnologico` | `Albero Tecnologico` |
| French | `Arbre Technologique` | `Arbre Technologique` |

The correction restores source capitalization in Spanish, Portuguese, Italian, and French. English and German already matched. Cosmic Forge's visible Technology and Tech Tree source options remain represented by the owner-directed Research > Tech Tree destination; Research itself and Philosophy retain their distinct destinations. The target's technology node names were also compared with source `techName*` values and already matched. Pan help remains adapted to include the remake's keyboard controls.

Source evidence: `../../../../cosmicForge/cosmicForge/ui.js:3410`, the `headerMainTechTree` locale entries in `../../../../cosmicForge/cosmicForge/localization.json`, and the Tech Tree container in `../../../../cosmicForge/cosmicForge/drawTab3Content.js:2686-2707`. Target evidence: `src/app/presentationNavigation.ts` (`research-tech-tree`) and `src/app/EconomyPanes.tsx` (heading and node renderer), with copy in `src/i18n/economyMessages.ts`.

Static source/catalogue review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
