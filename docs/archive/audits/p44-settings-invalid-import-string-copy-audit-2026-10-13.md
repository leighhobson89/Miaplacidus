# P-44 Settings invalid import-string copy audit

**Date:** 13 October 2026

**Scope:** feedback for an empty or malformed save string in Settings > Saving and Loading, across all six locales.

Cosmic Forge sends `notificationInvalidSaveString` both when the import field is blank and when `validateSaveString` rejects the supplied value ([`saveLoadGame.js:498-509,550-560`](../../../../cosmicForge/cosmicForge/saveLoadGame.js)). The source message appears in [`localization.json:2172`](../../../../cosmicForge/cosmicForge/localization.json#L2172) and the corresponding locale entries. MIAPLACIDUS now uses the dedicated `errInvalidSaveString` key for empty input and decoder errors indicating unsupported format, failed decompression, or invalid JSON ([`SaveManager.tsx:104-126`](../../../src/app/SaveManager.tsx); [`saveMessages.ts`](../../../src/i18n/saveMessages.ts)).

| Locale | Cosmic Forge `notificationInvalidSaveString` | MIAPLACIDUS `errInvalidSaveString` |
| --- | --- | --- |
| en | Invalid game data string. Please check and try again. | Invalid game data string. Please check and try again. |
| es | Cadena de datos de partida no válida. Compruébala e inténtalo de nuevo. | Cadena de datos de partida no válida. Compruébala e inténtalo de nuevo. |
| pt | Cadeia de dados de jogo inválida. Verifica-a e tenta novamente. | Cadeia de dados de jogo inválida. Verifica-a e tenta novamente. |
| de | Ungültige Spieldaten-Zeichenfolge. Bitte überprüfe sie und versuche es erneut. | Ungültige Spieldaten-Zeichenfolge. Bitte überprüfe sie und versuche es erneut. |
| it | Stringa di dati di gioco non valida. Controllala e riprova. | Stringa di dati di gioco non valida. Controllala e riprova. |
| fr | Chaîne de données de jeu invalide. Vérifiez-la et réessayez. | Chaîne de données de jeu invalide. Vérifiez-la et réessayez. |

Oversized inputs, newer save versions, integrity/checksum failures, storage errors, and unrelated failures keep their separate remake messages. This change affects feedback only; import decoding and save behavior are unchanged.

Static source-to-renderer and error-code review only. No tests, builds, typechecks, formatters, or browser checks were run; P-44 remains open for the broader catalogue and rendered-locale evidence.
