# P-44 Space Mining Auto Telescope label copy audit (13 October 2026)

Cosmic Forge renders `tab6AutoSpaceTelescopeName` as the Auto Telescope heading and `tab6AutoSpaceTelescopeRowLabel` as the automation-control row label in [`drawTab6Content.js:199-205`](../../../../cosmicForge/cosmicForge/drawTab6Content.js#L199). MIAPLACIDUS now uses separate `autoTitle` and `autoRowLabel` catalogue entries at [`SpaceMiningPane.tsx:943-950`](../../../src/app/SpaceMiningPane.tsx), preserving the source distinction between heading and row caption.

| Locale | Source/target heading | Source/target row label |
| --- | --- | --- |
| en | Auto Space Telescope | Auto Space Telescope: |
| es | Telescopio Espacial Automático | Telescopio Espacial Automático: |
| pt | Telescópio Espacial Automático | Telescópio Espacial Automático: |
| de | Automatisches Weltraumteleskop | Automatisches Weltraumteleskop: |
| it | Telescopio Spaziale Automatico | Telescopio Spaziale Automatico: |
| fr | Télescope Spatial Automatique | Télescope Spatial Automatique: |

The previous target row label reused the generic `Action` string. The correction changes only the label; telescope mode selection and automation behavior are unchanged. The Telescope remains a distinct Space Mining child page.

Static source-to-renderer comparison only. No tests, builds, typechecks, formatting, or browser review were run; P-44 remains open for the broader catalogue and rendered-locale evidence.
