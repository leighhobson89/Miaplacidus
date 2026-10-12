# P-44 Space Mining and Rocket action copy audit — 12 October 2026

Compared five visible Space Mining/Rocket controls and results in the Cosmic Forge renderer with their current MIAPLACIDUS owners:

- Source `buttonBuildLaunchPad` (`drawTab6Content.js:631-633`) maps to `rocketMessages.buildLaunchPad`, rendered by the Launch Pad child button in `SpaceMiningPane.tsx:1148`. Its six locale values now match: `Build Launch Pad`, `Construir Plataforma de Lanzamiento`, `Construir Plataforma de Lançamento`, `Startplattform Bauen`, `Costruisci Piattaforma di Lancio`, `Construire le Pas de Tir`.
- Source `buttonPillageTheVoid` (`drawTab6Content.js:467-471`) maps to `spaceMessages.pillageVoid`, rendered by the Space Telescope child action in `SpaceMiningPane.tsx:879`. The target now matches `Pillage the Void`, `Saquear el Vacío`, `Saquear o Vazio`, `Die Leere plündern`, `Saccheggia il Vuoto`, `Piller le Vide`.
- Source `notificationSpaceTelescopeBuilt` (`drawTab6Content.js:117`) maps to the target's one-shot build feedback `spaceMessages.feedbackBuilt` (`SpaceMiningPane.tsx:771`). Its six values now match the source, including capitalization and exclamation marks: `Space Telescope Built!`, `¡Telescopio Espacial construido!`, `Telescópio Espacial construído!`, `Weltraumteleskop gebaut!`, `Telescopio Spaziale costruito!`, `Télescope Spatial construit!`. The persistent built-status label remains a separate target message.
- Source `buttonLaunch` (`drawTab6Content.js:1156,1169,1178`) maps to the Rocket child launch action `rocketMessages.launch` (`SpaceMiningPane.tsx:423`), now `Launch!`, `¡Lanzar!`, `Lançar!`, `Starten!`, `Lancia!`, `Lancer!`.
- Source `buttonTravel` (`drawTab6Content.js:1328`) maps to the Rocket child travel action `rocketMessages.travelToAsteroid` (`SpaceMiningPane.tsx:446`), now `Travel`, `Viajar`, `Viajar`, `Reisen`, `Viaggia`, `Voyager`. The selected destination remains displayed separately.

The values above are in `en`, `es`, `pt`, `de`, `it`, `fr` order. These are copy-only corrections; action behavior, destination information, child-page ownership, and source-to-target routing remain unchanged. Galactic Casino remains its own Galactic child, Star Data remains under Interstellar, and the seven Miaplaedia documents remain separate children.

Static source/catalogue and renderer review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for the broader catalogue and rendered-copy review.
