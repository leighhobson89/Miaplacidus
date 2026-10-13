# P-44 Tech Tree zoom-help copy audit

**Date:** 13 October 2026

**Scope:** the Tech Tree pan/zoom help sentence in all six locales.

Cosmic Forge selects `headerDescTechTree` for the Tech Tree view in [`descriptions.js:458`](../../../../cosmicForge/cosmicForge/descriptions.js#L458). Its localized instruction tells players to zoom with the mouse wheel. The source handles wheel input in [`ui.js:10090-10115`](../../../../cosmicForge/cosmicForge/ui.js#L10090).

MIAPLACIDUS renders `technologyTreePanHelp` beneath the zoom controls and associates it with the focusable tree viewport in [`EconomyPanes.tsx:2083-2123`](../../../src/app/EconomyPanes.tsx#L2083). The remake uses plus/minus buttons, a range slider, and Reset; this renderer has no wheel handler. The help text in [`economyMessages.ts`](../../../src/i18n/economyMessages.ts) now tells players to use the controls above, while retaining the existing keyboard-pan guidance.

| Locale | Updated target zoom instruction |
| --- | --- |
| en | Use the zoom controls above to adjust the tree size. |
| es | Usa los controles de zoom de arriba para ajustar el tamaño del árbol. |
| pt | Utiliza os controlos de zoom acima para ajustar o tamanho da árvore. |
| de | Verwende die Zoomregler oben, um die Größe des Baums anzupassen. |
| it | Usa i controlli dello zoom qui sopra per regolare le dimensioni dell'albero. |
| fr | Utilise les commandes de zoom ci-dessus pour ajuster la taille de l'arbre. |

The help adaptation reflects the controls actually rendered in MIAPLACIDUS; it does not change the zoom behavior or the owner-directed Research/Tech Tree page structure. Static source-to-renderer comparison only; no tests, builds, or browser review were run. P-44 remains open.
