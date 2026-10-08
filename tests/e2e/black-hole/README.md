# Black Hole browser coverage

Behavior baseline: Cosmic Forge `game.js`, `resourceDataObject.js`, `constantsAndGlobalVars.js` and `drawTab7Content.js`; rules and source limits are recorded in the archived [meta endgame contract](../../../docs/archive/plans/2026-10-04-meta-endgame.md) and [foundation meta audit](../../../docs/audit/foundation-meta.md).

The browser spec uses a deterministic discovered-hole fixture, researches through the Black Hole child pane in Galactic, and verifies the visible charge countdown and progress advance while that page remains selected. It saves and reloads during charge, advances simulated time through the Ready state, and activates the visible time warp without directly completing the timer. Seeded discovery chance, exact prices/upgrades, offline expiration and timer completion idempotency are covered by `tests/unit/black-hole.spec.ts`.

Verification record (4 October 2026): Chrome `npm.cmd run test:e2e:focused -- tests/e2e/black-hole/black-hole.spec.ts` passed 1 browser journey. The once-only G-31–G-42 unit suite passed 20 files / 205 tests. Later fixes were checked only in affected areas.

P-07 verification: the focused system Chrome journey passed 1/1. It observes visible remaining time and progress increase while the Black Hole pane stays selected, saves and reloads during charge, advances the remaining duration to the visible Ready state, then activates the warp without directly completing the timer.

P-06 affordability verification: the underfunded 999,999 RP fixture shows the 1,000,000 RP Black Hole research cost, keeps the control disabled, and exposes the visible localized shortfall reason through `aria-describedby`. The focused Chrome case passed 1/1 in 2.3 seconds. Typecheck passed; the runner exited 0 after stopping its test-owned Vite server (PID 13712), and port 4173 was confirmed closed.

P-06 upgrade-affordance verification (6 October 2026): the discovered-hole fixture researches through the player pane, shows the 850,000 RP power-upgrade cost, and applies the purchase through the enabled control. The pane updates from 5× to 7× power, subtracts the cost from the 2,000,000 RP balance, and previews the next 960,500 RP price. The focused Chrome case passed 1/1 in 3.3 seconds with Playwright exit 0, using a separately started `dev:test` server; the server was then stopped and port 4173 confirmed closed.

Focused command:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/black-hole/black-hole.spec.ts -g "shows the Black Hole power upgrade cost and applies its effect" --reporter=line --workers=1 --retries=0 --trace=off
```

P-04 live attention verification (7 October 2026): after the charge timer completes, `Ready` appears on both the Galactic main tab and Black Hole child tab. Activating the warp clears both `Ready` indicators. The focused Chrome journey passed 1/1:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/black-hole/black-hole.spec.ts -g 'researches, charges, saves and activates the Black Hole' --reporter=line --workers=1 --retries=0 --trace=off
```

P-20 warp-activation announcement verification (8 October 2026): an initially empty polite, atomic screen-reader-only region receives the localized active-state label only after the accepted black-hole.warp-activated event. It clears when the warp expires and countdown updates remain silent. Unit coverage passed 3/3 across all six locales. The focused Chrome journey passed 1/1 and checks the initial empty state, ARIA settings, activation announcement, existing warp state and cleared navigation badges, and empty output after expiry; it uses the focused command already listed above.
