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

The scheduler unit cases cover the four-category cap, FIFO category promotion, ordinary same-category serialization, and multi-card behavior. Space event unit coverage checks localized starship/rocket/weather/battle notices in all six locales, event routing through dispatch, batch, and timer advancement, weather-entry de-duplication, and silent progress/ordinary-weather events. The weather, starship and battle browser journeys assert the rendered `weather`, `starShip` and `battle` notices. Those browser assertions are staged for the serialized browser run and have not been run in this implementation slice. The existing fusion browser journey covers the rendered `fuse` notification class. Cosmic Forge source references are `ui.js` (`showNotification`, classification queues, row promotion) and `constantsAndGlobalVars.js` (`MAX_STACKS`, category sets); source is read-only.
