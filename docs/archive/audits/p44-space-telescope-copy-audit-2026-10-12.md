# P-44 Space Telescope action-copy audit (12 October 2026)

Compared Cosmic Forge's visible Space Telescope build, asteroid-scan, and star-study controls with the active MIAPLACIDUS renderer and its six-locale catalogue.

Cosmic Forge renders these actions in [`drawTab6Content.js`](../../../../cosmicForge/cosmicForge/drawTab6Content.js#L100-L110) and the scan/study controls at [`drawTab6Content.js`](../../../../cosmicForge/cosmicForge/drawTab6Content.js#L279-L287) and [`drawTab6Content.js`](../../../../cosmicForge/cosmicForge/drawTab6Content.js#L367-L379). Their source localization keys are `buttonBuildSpaceTelescope`, `buttonScanAsteroids`, and `dropdownTelescopeStudyStars` in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1816-L1824), with corresponding values in all five other locale blocks.

The target renderer already uses `spaceText(locale, "telescopeBuild" | "scanAsteroids" | "studyStars")` for the matching controls in [`SpaceMiningPane.tsx`](../../../src/app/SpaceMiningPane.tsx#L769-L862). Updated the six locale values in [`spaceMessages.ts`](../../../src/i18n/spaceMessages.ts) to match the source labels:

| Locale | Build | Scan | Study |
| --- | --- | --- | --- |
| en | Build Space Telescope | Scan Asteroids | Study Stars |
| es | Construir Telescopio Espacial | Escanear Asteroides | Estudiar Estrellas |
| pt | Construir Telescópio Espacial | Analisar Asteroides | Estudar Estrelas |
| de | Weltraumteleskop Bauen | Asteroiden Scannen | Sterne Untersuchen |
| it | Costruisci Telescopio Spaziale | Scansiona Asteroidi | Studia Stelle |
| fr | Construire le Télescope Spatial | Scanner les Astéroïdes | Étudier les Étoiles |

This is a label-only correction. The Space Telescope page owner, action commands, costs, and survey behavior are unchanged. Static source/renderer and locale review only; no tests, builds, typechecks, formatters, or browser review were run. P-44 remains open for the broader catalogue crosswalk and rendered-locale review.
