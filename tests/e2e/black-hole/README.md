# Black Hole browser coverage

Behavior baseline: Cosmic Forge `game.js`, `resourceDataObject.js`, `constantsAndGlobalVars.js` and `drawTab7Content.js`; rules and source limits are recorded in the archived [meta endgame contract](../../../docs/archive/plans/2026-10-04-meta-endgame.md) and [foundation meta audit](../../../docs/audit/foundation-meta.md).

The browser spec uses a deterministic discovered-hole fixture, researches through the Black Hole child pane in Galactic, saves and reloads during charge, completes the normal engine timer command, and activates the visible time warp. Seeded discovery chance, exact prices/upgrades, offline expiration and timer completion idempotency are covered by `tests/unit/black-hole.spec.ts`.

Verification record (4 October 2026): Chrome `npm.cmd run test:e2e:focused -- tests/e2e/black-hole/black-hole.spec.ts` passed 1 browser journey. The once-only G-31–G-42 unit suite passed 20 files / 205 tests. Later fixes were checked only in affected areas.
