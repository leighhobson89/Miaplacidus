# P-44 Settings Achievements description copy audit — 13 October 2026

Cosmic Forge maps the Achievements destination description to `headerDescAchievements` in [`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L505). Its six localized values are recorded in `localization.json:117, 2740, 5363, 7986, 10609, 13232`.

MIAPLACIDUS renders the `description` message as the visible intro in `AchievementsPane.tsx:79`; its existing overview tooltip already used the same source wording. The six visible intro values in `src/i18n/achievementMessages.ts:6, 20, 34, 48, 62, 76` now match those source translations. Settings ownership and achievement behavior are unchanged.

This is a static source-to-renderer comparison. No tests or browser rendering were run; P-44 remains open for the wider localization and presentation review.
