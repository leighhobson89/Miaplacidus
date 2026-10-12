# P-44 Energy page visible-copy audit (12 October 2026)

Compared Cosmic Forge's Energy child-page structure and Power master-switch control with the active MIAPLACIDUS navigation and renderer.

- Source Energy Storage (`option1`) remains Batteries; Power Plant, Solar Power Plant, and Advanced Power Plant (`options2`–`4`) remain grouped on the Power child. Energy Summary is remake-only, as documented in the owner-directed crosswalk (`presentationNavigation.ts:113-135`; `EconomyPanes.tsx:2510-2593`). The master switch and plant cards render on Power.
- Cosmic Forge labels the switch with `buttonPowerOn` / `buttonPowerOff` (`index.html:281-283`); `game.js:13316-13319` changes the button copy with switch state. MIAPLACIDUS renders `economyMessages.activatePower` / `deactivatePower` in the same Power control (`EconomyPanes.tsx:2593-2606`).
- The target labels were unapproved paraphrases. Updated the two existing keys in `en/es/pt/de/it/fr` order to the source values: `Power On` / `Power Off`, `Encender` / `Apagar`, `Ligar` / `Desligar`, `Strom An` / `Strom Aus`, `Accendi` / `Spegni`, and `Activer` / `Désactiver`. The messages have no placeholders. Source locale entries are `cosmicForge/cosmicForge/localization.json:1636-1637,4259-4260,6882-6883,9505-9506,12128-12129,14751-14752`.

The page ownership and Energy/plant descriptions remain as before; no navigation or mechanic changed. This was a static source-renderer and locale comparison. No tests, builds, typechecks, or browser checks were run, and no files in the read-only Cosmic Forge source checkout were edited. P-44 remains open for the wider source catalogue and rendered-locale review.
