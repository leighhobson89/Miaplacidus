# P-44 Space Mining reserved-asteroid status copy audit

**Date:** 13 October 2026

Cosmic Forge `drawTab6Content.js:1015-1017` uses `textAsteroidBeingMined` for an asteroid reserved by a rocket. Its six source values are `Being Mined!`, `¡En explotación!`, `Em exploração!`, `Wird abgebaut!`, `In estrazione!`, and `En exploitation!`.

`src/app/SpaceMiningPane.tsx:1099-1101` binds `asteroid.reservedBy` to `spaceText(locale, "asteroidReserved")`. The six `asteroidReserved` catalogue values now match the source; the target-only rocket-name suffix was removed. Assignment and mining behavior are unchanged. Static source/catalogue/renderer comparison; no tests or browser checks were run. P-44 remains open.
