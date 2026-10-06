# Notifications

Cosmic Forge creates one notification container per classification in `index.html` / `ui.js`. The first four classifications in arrival order have visible rows (`MAX_STACKS` in `constantsAndGlobalVars.js`); additional classifications keep their messages queued until a visible category empties, then are promoted in order. Ordinary categories show one message at a time. `storage`, `debug`, and `achievement` allow multiple messages within their category, up to four visible cards per category (`MAX_NOTIFICATION_COLUMNS`). `fuse` is an ordinary serialized category.

MIAPLACIDUS keeps its notification region in flow beneath the News Ticker so notices do not cover game choices. `NotificationScheduler` caps concurrently visible classifications at four and promotes waiting categories by arrival order. It preserves the current remake category rules: ordinary notices queue one at a time, while `storage`, `debug`, and `achievement` can show together without a per-category card cap. The `fuse` classification remains an ordinary category. Only visible notices start their dismissal timers; queued notices start their timer when promoted.

## Focused checks

```powershell
npm.cmd run test:unit:focused -- tests/unit/notificationScheduler.spec.ts
npm.cmd run test:unit:focused -- tests/unit/space-event-notifications.spec.ts tests/unit/audio-event-dispatch.spec.ts
npm.cmd run test:e2e:focused -- tests/e2e/economy/economy.spec.ts -g "first fusion discovery reports stored yield" --workers=1
npm.cmd run test:e2e:focused -- tests/e2e/notifications/space-event-notifications.spec.ts tests/e2e/starship/starship.spec.ts tests/e2e/battle/battle.spec.ts -g "announces hazardous weather|cancels the point-of-no-return|wins a hostile battle|retains the starship and surviving enemy" --workers=1
```

The scheduler unit cases cover the four-category cap, FIFO category promotion, ordinary same-category serialization, and multi-card behavior. Space event unit coverage checks localized starship/rocket/weather/battle notices in all six locales, event routing through dispatch, batch, and timer advancement, weather-entry de-duplication, and silent progress/ordinary-weather events. A focused system Chrome attempt of the hazardous-weather notification case reported 1 passed, then Playwright hung during shutdown and was interrupted (runner exit 1). A `--reporter=line` retry hung before reporting a result and was also interrupted; this does not establish a clean run. The focused milestone-route spec and its system Chrome result are recorded below. The existing fusion browser journey covers the rendered `fuse` notification class. Cosmic Forge source references are `ui.js` (`showNotification`, classification queues, row promotion) and `constantsAndGlobalVars.js` (`MAX_STACKS`, category sets); source is read-only.

The focused milestone route spec drives deterministic `space-starship-ready`, `space-battle-victory`, and `space-telescope` fixtures through accepted engine commands and the test clock, then checks the visible `starShip`, `rocket`, and `battle` notices. It covers starship launch/arrival, rocket launch/outbound/arrival/return, battle victory, and silence for accepted starship-travel shortening and intermediate battle rounds. On 5 October 2026, the focused system Chrome run reported all three journeys passing. Playwright remained alive after the assertions while shutting down, so it was interrupted; treat the assertions as passed while the process exit remains unclean.

Verified command (all three test assertions passed; runner interrupted during shutdown):

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/notifications/space-milestone-notifications.spec.ts --retries=0 --trace=off --workers=1
```

## Clean shutdown follow-up (6 October 2026)

The earlier shutdown-hanging notification runs were rechecked with the `dev:test` server started separately, so Playwright reused the server and did not own its shutdown. Both notification specs passed all four cases in installed Chrome and Playwright exited cleanly (exit code 0) in 33.9 seconds. This covers the hazardous-weather notice and the starship, rocket, and battle milestone notices, including their intentionally silent progress events.

Start the server in a separate terminal:

```powershell
npm.cmd run dev:test -- --host 127.0.0.1 --port 4173 --strictPort
```

Then run the focused browser cases:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/notifications/space-milestone-notifications.spec.ts tests/e2e/notifications/space-event-notifications.spec.ts --reporter=line --workers=1 --retries=0 --trace=off
```

Result: `4 passed (33.9s)`, clean process exit. The prior unclean runs above are retained as run history; this follow-up resolves their pending clean-shutdown verification.
