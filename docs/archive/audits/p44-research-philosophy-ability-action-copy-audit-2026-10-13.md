# P-44 Research Philosophy ability action copy audit — 13 October 2026

Cosmic Forge uses `buttonUnlock` for the four Philosophy ability actions in [`drawTab3Content.js`](../../../../cosmicForge/cosmicForge/drawTab3Content.js#L2727) (also lines 2948, 3162, and 3375). Its values are `UNLOCK`, `DESBLOQUEAR`, `DESBLOQUEAR`, `FREISCHALTEN`, `SBLOCCA`, and `DÉBLOQUER` in the six source locales (`localization.json:2076, 4699, 7322, 9945, 12568, 15191`).

MIAPLACIDUS's Philosophy ability button now uses a dedicated `abilityAction` key (`src/app/PhilosophyPane.tsx:188`), with those same six values in `src/i18n/philosophyMessages.ts:59, 176, 312, 441, 564, 700`. The active state still displays its status text, and the separate repeatable-research action retains its Research wording.

This is a static source-to-renderer comparison. No tests or browser rendering were run; P-44 remains open for the wider localization and presentation review.
