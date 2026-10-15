# P-44 Achievements and Events source audit — 11 October 2026

This bounded audit compared the Settings child-page owners, labels, overview help, achievement tooltips/notices, and Random Event names/notices with Cosmic Forge. No test, build, typecheck, formatter, or browser run was performed.

## Page ownership and headings

Cosmic Forge routes Settings option 10 to Achievements and option 14 to Events (`cosmicForge/cosmicForge/drawTab9Content.js`, `createAchievementsSectionRow` and `createEventsSectionRow`; source headings in `descriptions.js`). MIAPLACIDUS preserves those child IDs and source option IDs in `src/app/presentationNavigation.ts`; `src/app/SettingsPane.tsx` renders `AchievementsPane` and `MetaJournalPane` in the corresponding panels.

The Settings tab labels and Achievements pane title already use the source `headerMainAchievements` / `headerMainEvents` strings. The Events pane heading had instead read “News & Events” in six translations. It now uses the source `headerMainEvents` label; the news history remains a separate section within the page. `headerDescAchievements` is shown by the Achievements title tooltip, and `headerDescEvents` is shown by the Events title tooltip. The target-specific Achievements intro and Events summary remain descriptive additions.

## Achievement descriptions and notices

The Achievements cards use the 70 source `achievement<Name>` descriptions from `src/content/achievementDescriptions.generated.ts`; the existing `tests/unit/achievement-descriptions.spec.ts` maps each ID and locale directly to `localization.json`. Unlock notices route `achievement.unlocked` through `src/app/achievementEventNotifications.ts` to `ACHIEVEMENT_NOTIFICATION_COPY` by stable achievement ID. Cash rewards are formatted at display time for the active locale/currency/notation; the remaining notice wording follows the source key family `achievementNotification<Name>`.

Four existing `closeCosmicRip` translations (`es`, `pt`, `it`, `fr`) use localized “cosmic rift” wording that differs from the source's literal phrase. They are retained as localized wording adaptations; the earlier claim that every one of the 420 notice strings is an exact source copy needs this exception recorded. This audit found no missing achievement result route.

## Events names and notifications

Cosmic Forge `events.js` uses `eventName<Name>` keys for journal/generic notification names and the source `notificationRandomEvent*` keys for six named triggers plus `notificationRandomEventGeneric` for the other seven. The target had two separately translated 13-name tables; those phrases diverged from the source, changing both Events labels and generic trigger notices. `src/i18n/metaSignalMessages.ts` now carries all 78 source event-name strings directly, and `src/i18n/randomEventTriggerNotificationMessages.ts` uses that shared catalogue rather than a duplicate. Named trigger notices retain their source message templates and event-time substitutions.

The source Events page is owned by `option14`. `headerDescEvents` remains on the accessible title tooltip. Active effect names, effect details, countdowns, history, durations, and empty states are rendered by `MetaJournalPane.tsx`; event result descriptions are wired through `randomEventDescription.ts` from the 26 `eventDesc*` source templates. The P-45 description review's 14 copy adaptations remain documented separately. Triggered notices cover all 13 IDs; the five timed completion notices cover the source expiry callbacks, with target-specific named rocket/good details where available.

`tests/unit/random-event-source-message-parity.spec.ts` now compares the two page titles/overview-help keys, all 13 event names in six locales, and each named/generic trigger notice against the corresponding source keys. The test is added but unrun. The Events heading expectation in `tests/e2e/settings/phase6-tab-layout.spec.ts` was updated to “Events”; browser verification remains deferred.
