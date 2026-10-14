# P-44 Interstellar Starship scan result notice audit - 13 October 2026

## Source behavior

Cosmic Forge drawTab5Content.js:965-980 performs a successful destination system scan and shows an info notification for 3,000 ms using notificationSystemScanned with the destination star name. The source key has values in all six locale blocks of localization.json (1891,4514,7137,9760,12383,15006).

## Current remake mapping

On an accepted scan, `StarshipPane.tsx` dispatches the scan command and clears its inline feedback. The engine emits `space.starship.system.scanned`; `App.tsx` subscribes to that event and `spaceEventNotifications.ts` maps it to the source-matched `starshipSystemScanned` message in `spaceNotificationMessages.ts`, with `starShip` classification, info severity, and a 3,000 ms display duration. Rejected scans remain on the inline failure path. The pane does not emit a second local toast, so the same scan produces one notice. Starship remains an Interstellar child page; Star Data and Star Map keep their separate child-page ownership.

The shared notification stack displays at most two cards and queues additional notices FIFO. A scan notice can therefore wait behind earlier visible notices; its three-second display begins when it is promoted. The full-run P-45 failure snapshot showed a completed scan and startup achievement announcements but no scan card, so its focused copy check now clears the startup queue before performing the scan.

The target notification catalogue has a non-empty `starshipSystemScanned` value in en, es, pt, de, it, and fr. The obsolete `starshipMessages.scanCompleteNotice` entry is not the rendered notification route.

## Status

This is a source, catalogue, and active-renderer route comparison. The duplicate pane-level notification was removed on 14 October 2026 in favor of the existing event-owned route. No tests, builds, or rendered checks were run for this correction. Translation quality was not assessed and is not a closure gate. P-44's full source-key inventory and route/state review remain open; this slice does not complete an estimate subtask.
