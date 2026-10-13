# P-44 Space Mining telescope bought-status copy audit

**Date:** 13 October 2026

Cosmic Forge `drawTab6Content.js:143` renders localized `textBought` after the telescope is purchased; its launch-pad flow uses the same key at line 675. The six source values are `Bought`, `Comprado`, `Comprado`, `Gekauft`, `Acquistato`, and `Acheté`.

`src/app/SpaceMiningPane.tsx:768-771` binds the built telescope status to `spaceText(locale, "telescopeBuilt")`. The corresponding six values in `src/i18n/spaceMessages.ts` now match `textBought`. Purchase behavior and the Telescope child page are unchanged. Static source/catalogue/renderer comparison; no tests or browser checks were run. P-44 remains open.
