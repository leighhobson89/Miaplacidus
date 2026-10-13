# P-44 Settings overview description copy audit — 13 October 2026

Cosmic Forge maps the Settings page description to localized `headerDescSettings` ([`descriptions.js:441`](../../../../cosmicForge/cosmicForge/descriptions.js#L441)). Its six translations are `Change the game settings to your liking.`, `Cambia la configuración del juego a tu gusto.`, `Altera as definições do jogo ao teu gosto.`, `Ändere die Spieleinstellungen nach deinen Wünschen.`, `Cambia le impostazioni di gioco a tuo piacimento.`, and `Change les paramètres du jeu selon tes préférences.` (`localization.json:64, 2687, 5310, 7933, 10556, 13179`).

MIAPLACIDUS displays the same source-matched intro through `settingsText(locale, "description")` ([`SettingsPane.tsx:147`](../../../src/app/SettingsPane.tsx#L147); [`settingsMessages.ts`](../../../src/i18n/settingsMessages.ts)). This is the visible Settings overview description. Its six child destinations and their ordering are unchanged.

Static source-to-renderer comparison only. No tests or browser rendering were run; P-44 remains open for the broader source-key catalogue and rendered-locale review.
