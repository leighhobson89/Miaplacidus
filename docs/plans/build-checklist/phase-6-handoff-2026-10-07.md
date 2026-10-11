# Phase 6 Handoff — 8 October 2026

## Continuation checkpoint

This checkpoint carries forward the parallel audits and edits from 7 October, plus verification completed on 8 October. Phase 6 remains active and incomplete. The authoritative checklist is [06-presentation.md](06-presentation.md). The previous [6 October handoff](phase-6-handoff-2026-10-05.md) preserves the earlier Phase 6 history and the completed Resource/Compound layout slice (P-63).

## Current source-to-navigation finding

The focused source audit confirms that Galactic Casino is a Galactic child, not a top-level tab. Cosmic Forge renders it third, between Market and Ascendency, while retaining `option6` as its source identity. Its visibility is gated by the Casino unlock; no renderer or top-level sorter reorders it. The remake's `galacticPaneOrder`, route IDs, and existing browser assertion match that rendered order. An 8 October navigation audit rechecked top-level order and the child ownership/order/source IDs across Resources, Compounds, Settings, Cosmic Rip, Interstellar, Space Mining and Galactic; it found no ownership or ordering mismatch. This confirms the map, while the P-56 theme/locale/viewport matrix remains the highest-risk navigation presentation review. See the 7 October source references in [the navigation contract](../presentation-navigation-contract.md).

P-04 remains open for its wider destination gate, attention-marker, history, and source-parity review. Phase 6 remains open; this Casino finding is not a sign-off.

## Interaction audit and unverified work

The interaction agent recorded its P-05/P-06/P-14/P-20/P-21 findings in [the interaction handoff](../../audit/phase6-interaction-handoff-2026-10-07.md). On 8 October, the revised Casino test passed cleanly for both purchase-shortfall announcement semantics and the expanded 390px touch journey through all four games. Starship scan-result status semantics also passed a focused Chrome journey after correcting the test to use the Starship construction page. A broader assistive-technology review has not been run.

The 7 October checkpoint recorded the Casino purchase-status and expanded touch edits as unverified because earlier browser runs did not exit cleanly. That note is superseded: on 8 October the focused Chrome command passed 2/2 with a clean exit, covering status semantics and the 390px journey through Wheel/claim, Double or Nothing, Higher or Lower/cash-out, and Void Seer. The same day, a focused Starship scan journey passed 1/1 after it was corrected to select Starship construction; its localized life-detection summary now updates a persistent polite atomic status region. Typecheck, targeted lint and formatting checks passed for the Starship change. The Black Hole activation path now also announces the localized warp-active state through a mounted polite atomic region after the accepted engine event and clears it at expiry; its focused Chrome journey passed 1/1 and the all-locale announcement unit suite passed 3/3. A broader assistive-technology review remains open.

## Localization handoff

The localization documentation update is complete in P-44–P-53 of [06-presentation.md](06-presentation.md): P-44–P-51 are marked partial with evidence and explicit coverage gaps, P-52 remains complete, and P-53 remains open pending owner approval. The update changed no source or test files and ran no tests. The named artifacts and remaining whole-game/source audits are recorded in the checklist; do not infer broader localization completion from the partial evidence.

## Phase 6 status and resume guidance

The current checklist contains many open items across navigation, action affordance, timers, notifications, accessibility, audio/assets, localization, visual coverage, and final browser verification. Use its checkboxes and evidence as the source of truth; do not mark Phase 6 complete from the audits summarized here. The P-63 Resource/Compound Hydrogen-layout task and 8 October heading-to-hero spacing follow-up are complete. The 390px snapshot was refreshed to reflect the P-59 status row; the three relevant images were reviewed, and a focused no-update Chrome run passed 1/1 with a clean exit when reusing a separately started test server. See the detailed result and exact command in P-63 and the [economy browser README](../../../tests/e2e/economy/README.md).

Continue with:

- Inspect `git status` and preserve the shared working tree.
- Continue the P-56 presentation review matrix and remaining P-05/P-06/P-20 accessibility and interaction gaps.
- Continue using independent project agents for parallel slices, as required by `IncrementalGame/AGENTS.md` and the owner's standing instruction.
- Run focused checks for touched areas; do not run the full suite without owner approval.
- Keep Phase 6 open until the checklist exit gate and owner translation review are satisfied.

## P-16 focus-route inventory (9 October 2026)

The focused installed-Chrome P-16 batch passed **9/9 routes in 29.8 seconds** on port 4261. It covers:

- Save-conflict exit choices: initial dialog focus, Escape, Keep playing, Manage saves, and Discard focus destinations; Discard returns to the Pioneer name input with the current name prefilled.
- Galactic > Rebirth: Cancel and Escape restore the liquidation trigger while the trade notice stays behind the modal; successful liquidation moves focus to the Rebirth heading after its trigger becomes disabled.
- Rebirth: Cancel and Escape restore the Rebirth trigger; successful reset moves focus to the Hydrogen tab for the new run.
- Philosophy and endgame story: the Philosophy choice title receives initial focus and selection returns focus to Study Stars; the four-page homecoming dialog resists Escape and focuses Cosmic Rip after acknowledgement.
- Notices: Hydrogen Collect stays focused through sale-notice dismissal; the Notifications toggle stays focused when clearing/suppressing notices; Casino Double or Nothing stays focused through its result-notice dismissal in an isolated no-Wheel fixture.
- Existing P-16 journeys continue to cover main/child tab keyboard navigation, Star Data `Show on map` focus, and Starship-launch dialog close restoration.

Run the nine-case P-16 batch with installed Chrome:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4261'
npm.cmd run test:e2e:focused -- tests/e2e/save-slots/save-slots.spec.ts tests/e2e/galactic-market/galactic-market.spec.ts tests/e2e/rebirth/rebirth.spec.ts tests/e2e/philosophies/philosophies.spec.ts tests/e2e/megastructures/megastructures.spec.ts tests/e2e/galactic-casino/galactic-casino.spec.ts tests/e2e/notifications/resource-sale-notifications.spec.ts -g '@p16-focus' --workers=1 --retries=0 --trace=off --reporter=line
```

**P-16 toast-family follow-up (9 October 2026):** the focused installed-Chrome
`notice-focus-stability.spec.ts` run passed **7/7 in 43.5 seconds**. It covers
research, Telescope build completion, hazardous weather, Rocket return,
Starship arrival, battle victory, and battle defeat notices. The Telescope
test found and fixed a focus-loss case: when Build is replaced by the next
available Scan for asteroids action, focus now moves to Scan and remains there
through notice dismissal. See the [notification evidence](../../../tests/e2e/notifications/README.md)
and [Space Telescope evidence](../../../tests/e2e/space-telescope/README.md).

The previous 9-route evidence remains in the [Save Slots](../../../tests/e2e/save-slots/README.md),
[Market](../../../tests/e2e/galactic-market/README.md), [Rebirth](../../../tests/e2e/rebirth/README.md),
[Philosophies](../../../tests/e2e/philosophies/README.md), [Megastructures](../../../tests/e2e/megastructures/README.md),
[Casino](../../../tests/e2e/galactic-casino/README.md), and [Notifications](../../../tests/e2e/notifications/README.md) READMEs.

**P-16 modal inventory follow-up (9 October 2026):** source review found eight
native modal-dialog routes: unsaved-exit, Rebirth, Rebirth liquidation,
Philosophy choice, the endgame story, Starship launch, Debug Scenario Menu,
and Test Lab. The existing focused routes cover the first six; a new debug
case found that closing the last debug dialog left focus inactive. `DebugTools`
now restores focus to the element that opened the first debug dialog, including
when switching between the two dialogs. The focused installed-Chrome case
passed 1/1 in 5.1 seconds. Main/child tab changes and Star Data `Show on map`
are covered by the existing keyboard routes. All notification cards share the
non-focusable `NotificationStack` output; focused cases cover sale, Casino,
research, build, weather, Rocket, Starship, and both battle outcomes, and no
notification route calls `.focus()`. A read-only reconciliation found one
remaining P-16 verification gap: the forced-choice Philosophy dialog prevents
Escape and can only be exited by choosing a path, but the existing route does
not assert that Escape keeps focus on the dialog title. Keep P-16 open until
that behavior is verified. The absent achievement toast is a separate P-08
route gap, and manual screen-reader verification/announcement timing belongs
to P-20.

**P-16 forced-choice verification (9 October 2026):** the focused Philosophy
route now confirms Escape leaves the mandatory choice visible, focus stays on
its heading, and the engine keeps the choice pending with no path selected.
Choosing Expansionist closes the dialog and restores focus to Study Stars.
Installed Chrome passed 1/1 in 5.6 seconds on port 4297. P-16 remains open for
broader programmatic navigation and toast-dismissal routes.

Verified focused Chrome command for the Debug Scenario Menu and Test Lab:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4267'; npm.cmd run test:e2e:focused -- tests/e2e/debug-menu/debug-menu.spec.ts -g '@p16-focus' --workers=1 --retries=0 --trace=off --reporter=line
```

## P-22 name/import accessibility rerun (9 October 2026)

After the P-16 route inventory was recorded, both focused name/import Chrome
cases passed again (2/2 in 8.0 seconds, clean exit) on port 4257. Coverage
checks 125% root text sizing, long German labels, narrow and reduced-height
viewports, keyboard completion of the import flow, and 150% mobile zoom while
the name/import fields are focused. These browser emulations do not validate
an actual Android or iOS soft keyboard. Exact command and case scope are in
the [save-slots README](../../../tests/e2e/save-slots/README.md). The sandboxed
runner returned `spawn EPERM`; the same focused command completed with the
documented installed-Chrome runner. No P-22 implementation changes were
needed at that time. On 10 October, the pioneer-name field gained the mobile
keyboard `Go` action; the portable-code field gained `Done` plus disabled
autocapitalization, autocorrection and spellcheck to preserve code input.
Typecheck passed; these markup changes still need physical-device review.

## P-20 announcement audit (9 October 2026)

Read-only review of existing browser evidence found focused announcement
checks for representative purchase failures, save conflicts, timer completion,
and navigation changes. The save-conflict journey checks a persistent polite
atomic status region and no assertive alert; the timer journeys check localized
polite atomic completion/ready messages across Star Study, Void Pillage,
asteroid scans, Rocket fueling, Starship milestones, and Black Hole charge and
warp. Navigation checks named tablists, focus, selected state, and tab-panel
association. No manual screen reader was used, so spoken content and timing
remain unverified; other purchase-failure and timer families also remain to
audit. P-20 stays open. Evidence pointers: app boot, Casino, Black Hole, Save
Slots, Notifications, and Space Telescope browser READMEs.

## P-15 semantic review (9 October 2026)

Read-only review found useful existing checks for Interstellar headings,
landmarks, selected child tabs, and tab-panel association, plus named main and
child tablists. The broader semantic sweep remains incomplete: Miaplaedia pages
start at `h3` under the shell's visually hidden `h1`; Statistics uses `h2`
followed by `h4` subsection headings; and focus/landmark structure has not been
reviewed across Settings, Miaplaedia, Research, Energy, and Galactic. P-15 stays
open. See the Miaplaedia, Settings Statistics, Starship, and app-boot browser
evidence.

## P-44 Settings localization crosswalk (9 October 2026)

Read-only key-family mapping found source headings `headerMain*` and `headerDesc*`
for all six Settings destinations. Destination labels map to
`settingsSectionName`/`settingsText` in `settingsMessages.ts`; visual and game
options map source setting keys across `settingsText` and `settingsLabel`.
Source per-row `RowDescription` and destination `headerDesc*` keys have direct,
adapted, or omitted dispositions recorded in the crosswalk below; they do not
follow a single one-to-one assumption.
The clipboard success/error pair has its own mapping below, while the Settings
row-label and row-description mapping is detailed in the focused catalog audit.
A complete Save/Import action, validation, error, and recovery key crosswalk is
still open. Cloud saving and original Cosmic Forge save imports are explicitly
excluded by the [local-save contract](../local-save-contract.md) and [product
decisions](../open-decisions.md). The source Hard Reset affects the currently
named pioneer only; the remake replaces it with active-slot deletion followed
by starting a fresh run under that name. Its localized target dispositions are
recorded below. Statistics, Achievements, and
Events distribute across typed Settings Statistics, achievement/reward, and
event-journal catalogues. No tests were added or run for this documentation
audit.

### P-44 Settings heading and helper-copy crosswalk (9 October 2026)

The source Settings menu and `headerDescriptions` map expose seven destination
headings/descriptions. The source localization file contains the 27 Settings
heading/description keys below in each of its six locale blocks (`en`, `es`,
`pt`, `de`, `it`, `fr`). The remake's target catalogs also carry localized
entries for each of the six locales.

| Cosmic Forge source key(s) | MIAPLACIDUS target | Disposition |
| --- | --- | --- |
| `headerMainSettings` | `settingsText(locale, "title")` | Mapped |
| `headerDescSettings` | `economyMessages.settingsOverviewHelp` on the top-level Settings tab (`App.tsx` `title` / `aria-description`); visible `settingsText(locale, "description")` below the page title | Exact source copy is available on the Settings tab in all six locales. The visible Settings intro is target-specific summary copy, not a replacement for the source mapping. |
| `headerMainVisual` | `settingsSectionName(locale, "visual")`; rendered by `SettingsPane.tsx` | Mapped with the requested target label “Visual Options” |
| `headerMainGameOptions` | `settingsSectionName(locale, "gameOptions")`; rendered by `SettingsPane.tsx` | Mapped |
| `headerMainSavingLoading` | `settingsText(locale, "savingSection")`; rendered by `SettingsPane.tsx` | Mapped; target wording is “Saving and Loading” |
| `headerMainStatistics` | `settingsSectionName(locale, "statistics")`; rendered by `SettingsStatisticsPane.tsx` | Mapped |
| `headerMainAchievements` | `settingsText(locale, "achievements")`; rendered by `AchievementsPane.tsx` | Mapped |
| `headerMainEvents` | `settingsSectionName(locale, "events")`; rendered by `MetaJournalPane.tsx` | Mapped |
| `headerDescVisual`, `headerDescGameOptions`, `headerDescSavingLoading` | `settingsText(locale, "visualDescription" / "gameOptionsDescription" / "savingSectionDescription")` | Mapped; exact localized source copy now appears immediately below each destination heading |
| `headerDescStatistics` | `statisticsText(locale, "description")` (`StatisticsMessageId`) in `statisticsMessages.ts`, rendered in `SettingsStatisticsPane.tsx` | Direct source copy shown below the Statistics page title in all six locales; verified by source-backed rendering coverage |
| `headerDescAchievements` | `achievementText(locale, "overview")` in the accessible `AchievementsPane.tsx` title tooltip; `description` remains the page intro | Exact source header-help copy in all six locales; the target intro remains adapted to milestones and rewards. |
| `headerDescEvents` | `metaSignalText(locale, "description")` | Replaced by the target journal intro about the saved ticker, event effects, and recent history |
| `tab9CustomPointerRowDescription` | `settingsMessages.customPointerDescription`; Settings > Visual Options `#settings-custom-pointer` | Adapted source meaning in an accessible tooltip: the custom cursor is MIAPLACIDUS's mouse cursor; the legacy Cosmic Forge brand is removed. |
| `tab9MouseTrailRowDescription` | `settingsMessages.pointerTrailDescription`; Settings > Visual Options `#settings-pointer-trail` | Exact source description is available in an accessible tooltip and as the checkbox's screen-reader description in all six locales. |
| `tab9WeatherEffectsRowDescription` | `settingsMessages.weatherEffectsDescription`; Settings > Visual Options `#settings-weather-effects` | Exact source description is visible below and associated with the checkbox in all six locales. |
| `settingsLanguageRowDescription`, `tab9ThemeRowDescription`, `tab9NotationRowDescription`, `tab9ToggleNotificationsRowDescription`, `tab9NewsTickerRowDescription`, `tab9BackgroundAudioRowDescription`, `tab9SfxRowDescription` | `settingsText(locale, "languageRowDescription" / "themeRowDescription" / "notationRowDescription" / "notificationsRowDescription" / "newsTickerRowDescription" / "backgroundAudioRowDescription" / "soundEffectsRowDescription")`; corresponding `#settings-*-description` controls in `SettingsPane.tsx` | Direct source copy in all six locales. Each description is visible beside its selector/checkbox and linked to that control with `aria-describedby`; the fact that each sentence restates the setting action is not an omission. |
| `tab9CurrencyRowDescription` | `settingsText(locale, "currencyDescription")`; `#settings-currency` | Mapped; the source's visual-only detail is visible and associated with the control |
| `tab9ToggleFullScreenRowDescription` | `settingsText(locale, "fullscreenDescription")`; fullscreen button | Mapped; the source F11 hint is visible and associated with the control |
| `tab9HardResetRowLabel`, `buttonHardResetAllProgress` | `saveText(locale, "delete")` in the active slot card under Settings → Saving and Loading | Adapted: source clears only the current pioneer name's cloud profile, not every pioneer. Deleting the active local slot removes that profile's progress; Start can create a fresh run with the same name. |
| `tab9HardResetRowDescription`, `hardResetWarningText` | `saveText(locale, "deletePrompt")` inside the inline destructive-confirmation section | Adapted to the local export-first warning and per-slot scope. |
| `hardResetWarningHeader`, `modalHardResetConfirmLabel` | `saveText(locale, "confirmDelete")` as the inline confirmation legend/button | Adapted from a separate modal to the existing confirmation section. |
| `modalHardResetCancelLabel` | None | Intentionally omitted with the modal: the remake keeps an inline confirmation section and exposes no separate cancel button. |
| `notificationHardResetComplete` | None; `afterDeleteActive` returns to pioneer selection | Intentionally replaced by the existing route transition; a browser refresh and completion notification are unnecessary. |

Source wiring is in [`index.html`](../../../../cosmicForge/cosmicForge/index.html#L816),
[`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L441) (overall
Settings description) and its destination entries at
[`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L501). The
localized source text is in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L64)
and the Settings row-description family begins at
[`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1626).
Target headings and controls are wired in [`settingsMessages.ts`](../../../src/i18n/settingsMessages.ts#L40),
[`presentationNavigation.ts`](../../../src/app/presentationNavigation.ts#L350),
and [`SettingsPane.tsx`](../../../src/app/SettingsPane.tsx#L132). Statistics,
Achievements, and Events use [`SettingsStatisticsPane.tsx`](../../../src/app/SettingsStatisticsPane.tsx#L759),
[`achievementMessages.ts`](../../../src/i18n/achievementMessages.ts#L5), and
[`metaSignalMessages.ts`](../../../src/i18n/metaSignalMessages.ts#L30).

The three page intros and two helper details are now localized in all six
locales with the exact source copy where applicable. A focused
`@p44-settings-copy` browser test asserts all five strings and the two
`aria-describedby` associations. Typecheck passed; the browser runner and direct
test server both failed before launching because Vite config resolution hit
`spawn EPERM` in `optimizeSafeRealPathSync`. No browser result is established.
Most other source row descriptions repeat the action already expressed by the
remake's control label. See the Settings browser README for the focused command
and exact failure.

### P-44 Settings source-key inventory and dispositions (10 October 2026)

This bounded audit covers the seven Settings destinations' headings and
descriptions, the Settings language and `tab9` row labels/descriptions, and the
six non-row Hard Reset support strings. Cosmic Forge has 46 page/row keys
(14 destination header keys, 19 row labels, 13 row descriptions) in each of
`en`, `es`, `pt`, `de`, `it`, and `fr`: 276 localized values. Six additional
Hard Reset warning/button/modal/completion keys are also present in every
locale, for 52 scoped source keys and 312 localized values total. No key in
these groups is missing from a source locale block. The two Hard Reset row keys
are included in the 46 page/row keys. All eight Hard Reset keys are now
dispositioned: six map to the active-slot delete flow's existing six-locale
messages, while the modal cancel label and completion notice are intentionally
replaced by the inline confirmation and return-to-start behavior.

The source key counts come from [Cosmic Forge localization.json](../../../../cosmicForge/cosmicForge/localization.json),
the Settings row construction in [drawTab9Content.js](../../../../cosmicForge/cosmicForge/drawTab9Content.js),
and destination lookup in [descriptions.js](../../../../cosmicForge/cosmicForge/descriptions.js).

The destination heading keys use typed six-locale targets as follows:

| Cosmic Forge source key | MIAPLACIDUS typed target | Disposition |
| --- | --- | --- |
| `headerMainSettings` | `settingsText(locale, "title")` | Direct |
| `headerMainVisual`, `headerMainGameOptions`, `headerMainStatistics` | `settingsSectionName(locale, "visual" / "gameOptions" / "statistics")` | Direct; Statistics is rendered by `SettingsStatisticsPane.tsx` |
| `headerMainSavingLoading` | `settingsText(locale, "savingSection")` | Direct; target wording is Saving and Loading |
| `headerMainAchievements` | `achievementText(locale, "title")`; the Settings tab label uses `settingsText(locale, "achievements")` | Direct |
| `headerMainEvents` | `metaSignalText(locale, "title")`; the Settings tab label uses `settingsSectionName(locale, "events")` | Adapted: the target journal combines ticker and event history |
| `headerDescVisual`, `headerDescGameOptions`, `headerDescSavingLoading` | `settingsText(locale, "visualDescription" / "gameOptionsDescription" / "savingSectionDescription")` | Direct source copy in all six locales |
| `headerDescStatistics` | `statisticsText(locale, "description")` (`StatisticsMessageId`) | Direct source copy in all six locales |
| `headerDescSettings` | `economyMessages.settingsOverviewHelp` on the top-level Settings tab (`App.tsx` `title` / `aria-description`); visible `settingsText(locale, "description")` below the page title | Exact source copy is available on the Settings tab in all six locales. The visible Settings intro is target-specific summary copy, not a replacement for the source mapping. |
| `headerDescAchievements` | `achievementText(locale, "overview")` in the accessible `AchievementsPane.tsx` title tooltip; `description` remains the page intro | Exact source header-help copy in all six locales; the target intro remains adapted to milestones and rewards. |
| `headerDescEvents` | `metaSignalText(locale, "description")` | Adapted to describe the saved ticker, event effects, and recent history |

All 14 source destination-header keys have typed targets in the six-locale
catalogues. Six descriptions preserve source copy, including the Settings tab
overview and Achievements' accessible title tooltip; Events uses explicit
journal copy. The visible Settings intro is additional target-specific text.
Of the seven page-heading labels, Events is adapted because its target page
combines the ticker with event history.

All 19 source row labels occur in each locale. Their typed target dispositions
are:

| Cosmic Forge source key(s) | MIAPLACIDUS typed target | Disposition |
| --- | --- | --- |
| `settingsLanguageRowLabel` | `settingsLabel(locale, "language")` | Mapped to the label on the language select |
| `tab9CurrencyRowLabel`, `tab9NotationRowLabel`, `tab9ThemeRowLabel`, `tab9ToggleNotificationsRowLabel`, `tab9CustomPointerRowLabel`, `tab9MouseTrailRowLabel`, `tab9WeatherEffectsRowLabel`, `tab9NewsTickerRowLabel`, `tab9BackgroundAudioRowLabel`, `tab9SfxRowLabel`, `tab9ToggleFullScreenRowLabel` | `settingsText(locale, "currency" / "notation" / "theme" / "notifications" / "customPointer" / "pointerTrail" / "weatherEffects" / "newsTicker" / "backgroundAudio" / "soundEffects" / "fullscreen")` | Mapped to the corresponding visual/game-option control labels |
| `tab9AutoSaveRowLabel` | `saveText(locale, "autoSave")` | Mapped to the autosave control; interval choices follow the owner's 5/15/30/60-minute request rather than the source 2/3/5/10-minute choices |
| `tab9ExportSaveRowLabel`, `tab9ImportSaveRowLabel` | `saveText(locale, "export" / "import")` in `SaveManager.tsx` | Mapped to local portable-save export/import cards |
| `tab9ExitGameRowLabel` | None | Intentional browser-platform omission: Cosmic Forge only reveals this Electron exit screen (`ui.js:11032-11045`), whose save-and-exit flow has no browser equivalent. The browser owns tab closure; no return-to-start control is implied. |
| `tab9ExportCloudSaveRowLabel`, `tab9ImportCloudSaveRowLabel` | None | Intentionally omitted by the no-cloud-save decision in the local-save contract |
| `tab9HardResetRowLabel` | `saveText(locale, "delete")` in the active save card | Adapted: the source targets only the current pioneer name, so deleting that local slot and starting a fresh run with the same name provides the same reset scope. |

The 13 row-description keys have these dispositions:

| Cosmic Forge source key(s) | MIAPLACIDUS typed target | Disposition |
| --- | --- | --- |
| `tab9CurrencyRowDescription` | `settingsText(locale, "currencyDescription")` | Direct source detail is visible and associated with the currency control |
| `tab9ToggleFullScreenRowDescription` | `settingsText(locale, "fullscreenDescription")` | Direct source hint is visible and associated with the fullscreen button |
| `tab9CustomPointerRowDescription` | `settingsMessages.customPointerDescription`; `#settings-custom-pointer` | Adapted tooltip names the MIAPLACIDUS mouse cursor instead of retaining the Cosmic Forge brand. |
| `tab9MouseTrailRowDescription` | `settingsMessages.pointerTrailDescription`; `#settings-pointer-trail` | Exact source copy in an accessible tooltip and screen-reader description. |
| `tab9WeatherEffectsRowDescription` | `settingsMessages.weatherEffectsDescription`; `#settings-weather-effects` | Exact source copy visible and associated with the input. |
| `settingsLanguageRowDescription` | `settingsText(locale, "languageRowDescription")`; `#settings-language-description` | Direct source copy is visible beneath the Language selector and associated with it through `aria-describedby` in all six locales. |
| `tab9ThemeRowDescription` | `settingsText(locale, "themeRowDescription")`; `#settings-theme-description` | Direct source copy is visible beneath the Theme selector and associated with it through `aria-describedby` in all six locales. |
| `tab9NotationRowDescription` | `settingsText(locale, "notationRowDescription")`; `#settings-notation-description` | Direct source copy is visible beneath Number Notation and associated with it through `aria-describedby` in all six locales. |
| `tab9ToggleNotificationsRowDescription` | `settingsText(locale, "notificationsRowDescription")`; `#settings-notifications-description` | Direct source copy is visible beneath Notifications and associated with the checkbox through `aria-describedby` in all six locales. |
| `tab9NewsTickerRowDescription` | `settingsText(locale, "newsTickerRowDescription")`; `#settings-news-ticker-description` | Direct source copy is visible beneath News Ticker and associated with the checkbox through `aria-describedby` in all six locales. |
| `tab9BackgroundAudioRowDescription` | `settingsText(locale, "backgroundAudioRowDescription")`; `#settings-background-audio-description` | Direct source copy is visible beneath Background Audio and associated with the checkbox through `aria-describedby` in all six locales. |
| `tab9SfxRowDescription` | `settingsText(locale, "soundEffectsRowDescription")`; `#settings-sound-effects-description` | Direct source copy is visible beneath Sound Effects and associated with the checkbox through `aria-describedby` in all six locales. |
| `tab9HardResetRowDescription` | `saveText(locale, "deletePrompt")` | Adapted to the inline local-slot deletion and export-first warning |

The six additional source keys `hardResetWarningHeader`,
`hardResetWarningText`, `buttonHardResetAllProgress`,
`modalHardResetConfirmLabel`, `modalHardResetCancelLabel`, and
`notificationHardResetComplete` are localized in all six source locales. The
first four map to the active-slot delete button, warning, and inline
confirmation messages. The cancel label has no target because the remake uses
an inline confirmation without a cancel button; the completion notice is
replaced by returning to pioneer selection. Together with the two row keys,
the eight-key family is fully dispositioned rather than unresolved.
Mapped targets are held in typed six-locale catalogues in
[settingsMessages.ts](../../../src/i18n/settingsMessages.ts),
[saveMessages.ts](../../../src/i18n/saveMessages.ts),
[achievementMessages.ts](../../../src/i18n/achievementMessages.ts),
[statisticsMessages.ts](../../../src/i18n/statisticsMessages.ts), and
[metaSignalMessages.ts](../../../src/i18n/metaSignalMessages.ts). The audit
found no unregistered target IDs for the mapped entries. Five source entries in
the counted scope have no matching typed target: the Hard Reset cancel and
completion strings, the two excluded cloud-save row labels, and the browser-only
Exit Game row, now dispositioned as an Electron-specific platform omission.
Settings-specific theme and
currency option labels, generic button copy, `tab9Events*` table text, and
Save/Import result/error/recovery keys are outside these counts and need their
own source-family accounting where not already covered by the clipboard and
Hard Reset sections.

This historical slice does not close P-44 because the broader Save/Import
action/error/recovery inventory remains incomplete. Exit Game is resolved as a
browser-platform omission; the Hard Reset family maps to the remake's active-
slot deletion flow. No code or tests were changed or run for this slice.

### P-44 Save/Import clipboard feedback crosswalk (9 October 2026)

| Cosmic Forge source key | MIAPLACIDUS target | Disposition |
| --- | --- | --- |
| `notificationDataCopiedToClipboard` | `saveText(locale, "clipboardCopied")` | Direct source copy in all six locales; shown after a successful portable-code copy |
| `notificationErrorCopyingData` | `saveText(locale, "clipboardCopyError")` | Direct source copy in all six locales; shown for clipboard-write failure |
| No source paste action/error | `saveText(locale, "clipboardReadError")` | New localized guidance for the remake's Paste control; clipboard-read errors are no longer mislabeled as local-storage failures |

The source success/error strings are checked directly against all six
`localization.json` catalogues by `save-clipboard-messages.spec.ts`. The focused
installed-Chrome P-46 import-errors case passed 1/1 on 9 October, verifying
paste-read failure, copy-write failure, and successful copy feedback in all
locales; typecheck and targeted formatting passed. Cloud saving and importing
Cosmic Forge-format saves remain excluded by the local-save contract. The
hard-reset source family is dispositioned below as a per-pioneer local-slot
reset flow.

### P-44 Hard Reset source-key disposition (updated 10 October 2026)

| Cosmic Forge source key(s) | MIAPLACIDUS target | Disposition |
| --- | --- | --- |
| `tab9HardResetRowLabel`, `buttonHardResetAllProgress` | `saveText(locale, "delete")` in the active slot card | Adapted per-pioneer reset: source selects `getSaveName()` and only archives/clears that one cloud profile; it does not wipe every pioneer. Deleting the active local slot removes that pioneer, and the player can start a fresh run under the same name. |
| `tab9HardResetRowDescription`, `hardResetWarningText` | `saveText(locale, "deletePrompt")` in the inline confirmation section | Adapted to the export-first local deletion warning. |
| `hardResetWarningHeader`, `modalHardResetConfirmLabel` | `saveText(locale, "confirmDelete")` | Adapted from modal header/action to the inline confirmation legend/button. |
| `modalHardResetCancelLabel` | None | Intentionally omitted: the remake uses an inline confirmation section with no separate Cancel button. |
| `notificationHardResetComplete` | None; deletion returns to pioneer selection | Intentionally replaced by the route transition; the browser needs no refresh or separate completion notice. |

The source function selects `getSaveName()` and changes only that
pioneer-name row: it archives the row as `graveyard_<name>`, nulls that row's
cloud data, then shows the hard-reset completion notice and refresh overlay.
The lookup/confirmation is in
[`drawTab9Content.js`](../../../../cosmicForge/cosmicForge/drawTab9Content.js#L780),
and the archive/null operation is in
[`saveLoadGame.js`](../../../../cosmicForge/cosmicForge/saveLoadGame.js#L104).
It does not clear every pioneer. The [local-save contract](../local-save-contract.md)
defines multiple local slots, portable MIAPLACIDUS saves, explicit confirmation
before deletion, and no cloud save or original save import. The remake's
active-slot delete removes that pioneer from this device; starting a new run
under the same name creates the fresh state. This is the same per-pioneer reset
scope through a different flow. The hidden source cloud archive is intentionally
absent from the local-only model.

The demo notice `notificationSavingDisabledInDemo` is intentionally excluded:
the local-save contract explicitly says demo builds use the same save behavior
as full builds. The six-locale unit crosswalk checks source presence and every
mapped typed target. Keep P-44 open for other source families; the browser-exit
disposition is recorded as a platform omission. This slice adds no new control
or copy.
In Cosmic Forge the refusal notification is raised by the demo exit-save path
and manual file/clipboard export guards in
[`drawTab9Content.js`](../../../../cosmicForge/cosmicForge/drawTab9Content.js#L65)
and [`saveLoadGame.js`](../../../../cosmicForge/cosmicForge/saveLoadGame.js#L379).
The same file silently stops demo autosave and `saveGame` at lines 67 and 273.
The remake's explicit `demo` build variant remains, but its save behavior is
governed by the same-save rule in the local-save contract.
Validation on 10 October: `npm.cmd run test:unit:focused --
tests/unit/save-message-crosswalk.spec.ts` passed 18/18 across the six locales;
focused Oxfmt and `git diff --check` passed. The attempted active-slot delete
browser rerun is documented in the [Save Slots README](../../../tests/e2e/save-slots/README.md#p-44-demo-save-and-hard-reset-dispositions-10-october-2026); it stops at a stale test locator before exercising deletion.

### P-44 Statistics, Achievements, and Events crosswalk (9 October 2026)

Compared source keys and render paths with the Settings destinations. The
Cosmic Forge source has all listed localized key families in each of `en`,
`es`, `pt`, `de`, `it`, and `fr`. Remake catalogs are represented by six-locale
records keyed by `LocaleId`; this is a source/structure audit, not a browser
rendering result.

#### Statistics

`headerMainStatistics` maps to `settingsSectionName(locale, "statistics")`,
rendered by `SettingsStatisticsPane.tsx`. The source `headerDescStatistics`
copy maps to the typed `statisticsText(locale, "description")` message in
`statisticsMessages.ts` and is
shown immediately under the heading. The direct six-locale source comparison
and rendered-copy check passed in the focused Statistics unit suite on 9
October.

Cosmic Forge's 102 `stats*SubHeading*` keys are localized in all six source
locales and grouped as follows. They map by subject to typed target section and
row labels; the changed data model means individual source rows do not have a
stable one-to-one target message ID.

| Exact Cosmic Forge key family | Target typed label / renderer | Disposition |
| --- | --- | --- |
| `headerDescStatistics` | `statisticsText(locale, "description")` (`StatisticsMessageId`); `SettingsStatisticsPane.tsx` | Direct source copy rendered below the page title; source parity and all-six-locale rendering passed in the focused unit test |
| `statsOverviewSubHeading1`-`statsOverviewSubHeading13` | `settingsStatisticLabel(locale, SettingsStatisticId)`; Overview rows in `SettingsStatisticsPane.tsx` | Adapted to current run overview fields |
| `statsRunSubHeading1`-`statsRunSubHeading6` | `settingsStatisticLabel` and `runStatisticLabel(locale, RunStatisticLabelId)`; Run and Current snapshot sections | Adapted to run snapshot fields |
| `statsEventsSubHeading1`-`statsEventsSubHeading13` | `settingsSectionName(locale, "events")`, `randomEventName`, and `settingsStatisticLabel`; event rows | Adapted to current event history and counts |
| `statsResourcesSubHeading1`-`statsResourcesSubHeading8` | `settingsStatisticLabel` plus `economyGoodName`; Resources rows | Adapted to resource production and totals |
| `statsCompoundsSubHeading1`-`statsCompoundsSubHeading6` | `settingsStatisticLabel` plus `economyGoodName`; Compounds rows | Adapted to compound production and totals |
| `statsResearchSubHeading1`-`statsResearchSubHeading5` | `settingsStatisticLabel`; Research rows | Adapted to current research metrics |
| `statsEnergySubHeading1`-`statsEnergySubHeading12` | `energyStatisticLabel(locale, EnergyStatisticId)`; Energy rows | Adapted to tracked power and battery metrics |
| `statsSpaceMiningSubHeading1`-`statsSpaceMiningSubHeading5` | `settingsStatisticLabel`; Space Mining rows | Adapted to current telescope, launch, and asteroid metrics |
| `statsInterstellarSubHeading1`-`statsInterstellarSubHeading17` | `settingsStatisticLabel`; Interstellar rows | Adapted to current starship, system, and settlement metrics |
| `statsGalacticcasinoSubHeading1`-`statsGalacticcasinoSubHeading10` | `settingsStatisticLabel`; Galactic Casino rows | Adapted to current casino counters |
| `statsCosmicripchapterSubHeading1`-`statsCosmicripchapterSubHeading7` | `settingsStatisticLabel`; Cosmic Rip Chapter and live-status rows | Adapted and split across two target sections |

The target also localizes the source table's hard-coded `Current Run` and `All
Time` labels through `settingsStatisticLabel(locale, "run" / "lifetime")`.
Target headings and labels live in [`settingsMessages.ts`](../../../src/i18n/settingsMessages.ts#L450),
[`statisticsMessages.ts`](../../../src/i18n/statisticsMessages.ts#L55), and
[`energyStatisticsMessages.ts`](../../../src/i18n/energyStatisticsMessages.ts#L3).
The source section keys are assembled in Cosmic Forge
[`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L2402)
and displayed by [`ui.js`](../../../../cosmicForge/cosmicForge/ui.js#L5093).
The target section and row renderer is
[`SettingsStatisticsPane.tsx`](../../../src/app/SettingsStatisticsPane.tsx#L700).

#### Achievements

| Exact Cosmic Forge key | Target typed message / renderer | Disposition |
| --- | --- | --- |
| `headerMainAchievements` | `settingsText(locale, "achievements")`; `AchievementsPane.tsx` | Mapped |
| `headerDescAchievements` | `achievementText(locale, "overview")` in the accessible `AchievementsPane.tsx` title tooltip; `description` remains the page intro | Exact source header-help copy in all six locales; the target intro remains adapted to milestones and rewards. |
| `achievement<Name>` (70 tooltip-description keys) | `ACHIEVEMENT_DESCRIPTIONS[id][locale]` in `achievementDescriptions.generated.ts`, rendered by the keyboard-accessible description control in `AchievementsPane.tsx` | Direct source copy in all six locales; all 70 descriptions are shown in the rendered grid, and sampled long descriptions are keyboard/hover accessible and stay within the viewport. Unit and focused Chrome coverage passed 1/1 each on 9 October. |
| `achievementNotification<Name>` (70 notice-copy keys) | `ACHIEVEMENT_NOTIFICATION_COPY[locale][event.achievementId]`, rendered through `achievementEventNotice` | Direct source notice wording, keyed by stable remake achievement IDs in all six locales; the numeric reward suffix intentionally adapts through `formatCurrency` using event-time locale, currency, and notation, verified in three modes |
| Source earned/locked grid imagery and hover tooltip | `AchievementBadge` and achievement cards | Badge imagery is adapted to responsive text-and-badge cards; source tooltip descriptions are rendered in an accessible localized description control |

**9 October achievement-description follow-up:** all 70 source description
keys are mapped by stable achievement ID in all six locales and shown in the
Achievements grid. Each description is connected to its keyboard-accessible
help button with `aria-describedby`; focused coverage verifies the full grid's
rendered copy and that the longest tooltip for each locale stays in the
viewport. The source-map unit check and installed-Chrome browser case passed
1/1 each.

The owner requested no artwork row and removal of the old `meta / 14 / 70`
strapline. The current pane has neither; it uses a localized unlocked count and
the new intro. Source heading/description keys are in
[`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L504)
and [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L116).
Tooltip copy and hover behavior are in
[`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L2859)
and [`ui.js`](../../../../cosmicForge/cosmicForge/ui.js#L4780). Target names,
tooltip descriptions, notice copy, and pane wiring are in
[`achievementNames.generated.ts`](../../../src/content/achievementNames.generated.ts),
[`achievementDescriptions.generated.ts`](../../../src/content/achievementDescriptions.generated.ts),
[`achievementNotificationCopy.generated.ts`](../../../src/i18n/achievementNotificationCopy.generated.ts#L5),
[`achievementMessages.ts`](../../../src/i18n/achievementMessages.ts#L1),
[`achievementEventNotifications.ts`](../../../src/app/achievementEventNotifications.ts#L15),
and [`AchievementsPane.tsx`](../../../src/app/AchievementsPane.tsx#L59).

#### Events

| Exact Cosmic Forge key/family | Target typed message / renderer | Disposition |
| --- | --- | --- |
| `headerMainEvents` | `settingsSectionName(locale, "events")`; `MetaJournalPane.tsx` | Mapped |
| `headerDescEvents` | `metaSignalText(locale, "description")`; `MetaJournalPane.tsx` | Adapted to describe the saved ticker, event effects, and recent history |
| `tab9EventsActiveTitle` | `metaSignalText(locale, "active")` | Adapted as the active-effects count label |
| `tab9EventsHistoryTitle` | `metaSignalText(locale, "history")` | Mapped to the history heading |
| `tab9EventsColumnEvent` | `randomEventName(locale, RandomEventId)` | Mapped to localized event names |
| `tab9EventsColumnActiveUntil` | Localized “Active Until” label beside the countdown in each active-effects row | Mapped into six-locale `activeUntil` copy (11 October 2026) |
| `tab9EventsColumnEffect` | `randomEventHistoryDescription(locale, entry, notation)` in `MetaJournalPane.tsx` | Adapted into source event descriptions below active effects and history entries |
| `tab9EventsColumnTotalDuration` | `journalLabel(locale, "totalDuration")` and `eventTotalDuration()` in `MetaJournalPane.tsx` | Mapped for new history entries; positive durations use the source's rounded-minute `m` format, instant events are localized, and older entries without saved duration show `--` |
| `tab9EventsNoneActive` | No active-effects list is rendered when empty | Added as a distinct localized empty-state message below Active Effects; history keeps its separate empty copy (11 October 2026) |
| `tab9EventsNoneCompleted` | `metaSignalText(locale, "noCompletedEvents")` | Source-matched copy in all six locales (11 October 2026) |
| `eventName<Name>` (13 event-name keys) | `randomEventName(locale, id)` in active effects, history, and Statistics | Mapped by event identity; localized target names cover all 13 current event IDs in all six locales |
| `eventDesc<Name>` (26 effect-description variants) | `randomEventDescriptionMessages.ts` and `randomEventHistoryDescription()`; rendered in `MetaJournalPane.tsx` | 24 source variants/fragments map to the 13 supported `RandomEventId`s; legacy supply-chain history without saved context uses the source's generic `eventDescProductionReduced` with `?` for the unavailable percent, not a fabricated value; `eventDescOngoingTimedEffect` and `eventDescUnknownAction` remain unused source-only fallbacks |

The source event table is constructed in
[`drawTab9Content.js`](../../../../cosmicForge/cosmicForge/drawTab9Content.js#L985);
dynamic effect text is assembled in
[`events.js`](../../../../cosmicForge/cosmicForge/events.js#L209), with event-time
inputs captured at its event handlers (`:295-640`, `:856-890`). The remake
stores stable building/good/rocket/asteroid IDs and numeric outcomes in
schema-v47 `RandomEventHistoryEntry.details`; variable rocket and asteroid
names are kept with their stable IDs so old journal rows retain the event-time
display name after later changes. Names for goods and buildings are resolved
from the typed locale catalogs when rendered. Schema-v46 saves remain valid and
migrate without fabricating missing history context. The exact localized
templates are in
[`randomEventDescriptionMessages.ts`](../../../src/i18n/randomEventDescriptionMessages.ts#L3),
the formatter is in
[`randomEventDescription.ts`](../../../src/app/randomEventDescription.ts#L10),
and the visible journal row is in
[`MetaJournalPane.tsx`](../../../src/app/MetaJournalPane.tsx#L159).

The static headings and 13 event names remain mapped to the six-locale
`metaSignalMessages.ts` catalog. The localized 26-key source event-description
catalog has six-locale coverage. Focused unit checks cover all source templates,
all supported event families, fallback handling, event-time history round trips,
and the v46 migration. The browser regression checks the visible Research Halved
description across all six locales after save/reload; results are recorded in the
random-events README.

**P-45 description-copy review (11 October 2026):** the catalog includes all 26
source keys with matching placeholders. Fourteen strings intentionally adapt
the source wording: positive supply-chain reduction magnitudes no longer carry a
misleading minus sign in any locale; Portuguese uses feminine agreement for the
localized building names; and the French rocket-loss wording uses a non-gendered completed-action verb,
so the text works with the feminine rocket fallback and arbitrary rocket names. The other 142 locale/key strings
match source text exactly. Focused assertions were added for these copy cases
but remain unrun.

The Statistics intro and achievement tooltip-copy gaps are now covered.
Event effect descriptions and new-entry total durations are covered;
timed events still enter remake history at trigger rather than source
completion. Achievement tooltip descriptions were
completed on 9 October as recorded below. Legacy supply-chain entries use the source event's generic
production-reduced template with `?` in the unavailable percent placeholder.

**P-44 total-duration implementation (10 October 2026):** `RandomEventHistoryEntry`
has an optional validated `durationMs`. Event triggers record zero for instant
events or the initialized active-effect duration for timed events. The journal
shows six-locale Total duration/Instant labels and `--` for older history with
no recoverable value; no save data is fabricated or backfilled. Typecheck and
formatting passed; no tests/browser checks were run. The source lifecycle
difference remains: the remake logs timed events at trigger instead of only at
completion. P-44 remains open.

### P-44 Cosmicopedia Concepts - Early message-key crosswalk (9 October 2026)

This slice inventories the complete Early Concepts guide family: **24 unique
source keys × six locales = 144 localized values** in Cosmic Forge's
`localization.json`. The menu key maps to the typed `conceptsEarly` section
label. The 11 numbered heading/body pairs are consumed by `descriptions.js`
and map by their numeric suffix to the matching zero-based entry in
`cosmicopediaSourceMessages[locale].conceptsEarly`; the catalogue's
`CosmicopediaSectionId` type includes `conceptsEarly`. Existing source-copy
comparison evidence covers all 330 guide article headings/bodies across six
locales. This table records the source-ID mapping for this family:

| Cosmic Forge source key | MIAPLACIDUS target | Disposition |
| --- | --- | --- |
| `headerMainConceptsEarly` | `settingsSectionName(locale, "conceptsEarly")` (`SettingsSectionId`) | Direct mapping: Miaplaedia section/menu name |
| `headerDescConceptsEarly` | `cosmicopediaDescription(locale, "conceptsEarly")` | Direct mapping: rendered immediately under the Early Concepts page heading and before its article list, matching the source header-description position |
| `helpConceptsEarlySubHeading1` | `cosmicopediaSourceMessages[locale].conceptsEarly[0].heading` | Direct mapping |
| `helpConceptsEarlySubBody1` | `cosmicopediaSourceMessages[locale].conceptsEarly[0].body` | Direct mapping |
| `helpConceptsEarlySubHeading2` | `cosmicopediaSourceMessages[locale].conceptsEarly[1].heading` | Direct mapping |
| `helpConceptsEarlySubBody2` | `cosmicopediaSourceMessages[locale].conceptsEarly[1].body` | Direct mapping |
| `helpConceptsEarlySubHeading3` | `cosmicopediaSourceMessages[locale].conceptsEarly[2].heading` | Direct mapping |
| `helpConceptsEarlySubBody3` | `cosmicopediaSourceMessages[locale].conceptsEarly[2].body` | Direct mapping |
| `helpConceptsEarlySubHeading4` | `cosmicopediaSourceMessages[locale].conceptsEarly[3].heading` | Direct mapping |
| `helpConceptsEarlySubBody4` | `cosmicopediaSourceMessages[locale].conceptsEarly[3].body` | Direct mapping |
| `helpConceptsEarlySubHeading5` | `cosmicopediaSourceMessages[locale].conceptsEarly[4].heading` | Direct mapping |
| `helpConceptsEarlySubBody5` | `cosmicopediaSourceMessages[locale].conceptsEarly[4].body` | Direct mapping |
| `helpConceptsEarlySubHeading6` | `cosmicopediaSourceMessages[locale].conceptsEarly[5].heading` | Direct mapping |
| `helpConceptsEarlySubBody6` | `cosmicopediaSourceMessages[locale].conceptsEarly[5].body` | Direct mapping |
| `helpConceptsEarlySubHeading7` | `cosmicopediaSourceMessages[locale].conceptsEarly[6].heading` | Direct mapping |
| `helpConceptsEarlySubBody7` | `cosmicopediaSourceMessages[locale].conceptsEarly[6].body` | Direct mapping |
| `helpConceptsEarlySubHeading8` | `cosmicopediaSourceMessages[locale].conceptsEarly[7].heading` | Direct mapping |
| `helpConceptsEarlySubBody8` | `cosmicopediaSourceMessages[locale].conceptsEarly[7].body` | Direct mapping |
| `helpConceptsEarlySubHeading9` | `cosmicopediaSourceMessages[locale].conceptsEarly[8].heading` | Direct mapping |
| `helpConceptsEarlySubBody9` | `cosmicopediaSourceMessages[locale].conceptsEarly[8].body` | Direct mapping |
| `helpConceptsEarlySubHeading10` | `cosmicopediaSourceMessages[locale].conceptsEarly[9].heading` | Direct mapping |
| `helpConceptsEarlySubBody10` | `cosmicopediaSourceMessages[locale].conceptsEarly[9].body` | Direct mapping |
| `helpConceptsEarlySubHeading11` | `cosmicopediaSourceMessages[locale].conceptsEarly[10].heading` | Direct mapping |
| `helpConceptsEarlySubBody11` | `cosmicopediaSourceMessages[locale].conceptsEarly[10].body` | Direct mapping |

Source wiring: [`index.html`](../../../../cosmicForge/cosmicForge/index.html#L844),
[`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L2746),
its [`headerDescriptions` map](../../../../cosmicForge/cosmicForge/descriptions.js#L496),
and the header/description/content ordering in [`ui.js`](../../../../cosmicForge/cosmicForge/ui.js#L3511)
and [`index.html`](../../../../cosmicForge/cosmicForge/index.html#L926). The six locale
records begin in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L108).
Target wiring: [`cosmicopediaMessages.ts`](../../../src/i18n/cosmicopediaMessages.ts#L30),
[`settingsMessages.ts`](../../../src/i18n/settingsMessages.ts#L330), and
[`MiaplaediaPane.tsx`](../../../src/app/MiaplaediaPane.tsx#L9).

The installed-Chrome `@p44-description` case initially passed 1/1 across all
six locales, asserting the Early Concepts description text and its position
between the page heading and article list. It has now been expanded to check all
seven Miaplaedia guide descriptions in all six locales, including each localized
heading, description, first article, and page order (42 page/locale combinations);
the focused run passed 1/1. This closes the ID-level mapping for all 24 Early
Concepts keys and the seven guide-header description keys. The Story, Get
Started, Concepts - End Goal, and Philosophies article families are now mapped
and browser-checked. Concepts - Late (16 articles) is the remaining guide
article family; the source-only Contact family has 3 articles and its omission
is explicitly documented below. The non-guide catalogues need per-key mapping
and classification.

### P-44 Miaplaedia guide header-description crosswalk (9 October 2026)

Cosmic Forge's `headerDescriptions` map selects these keys for the seven guide
pages. MIAPLACIDUS uses `cosmicopediaDescription` to return each typed localized
value immediately below that page's title and above its article list. All six
locales are covered. The Get Started sentence uses `Miaplacidus` in place of the
old game's name, following the owner's naming instruction.

| Cosmic Forge source key | MIAPLACIDUS target | Disposition |
| --- | --- | --- |
| `headerDescGetStarted` | `cosmicopediaDescription(locale, "getStarted")` | Direct mapping; game name updated per owner instruction |
| `headerDescStory` | `cosmicopediaDescription(locale, "story")` | Direct mapping |
| `headerDescConceptsEarly` | `cosmicopediaDescription(locale, "conceptsEarly")` | Direct mapping; rendered between heading and articles |
| `headerDescConceptsMid` | `cosmicopediaDescription(locale, "conceptsMid")` | Direct mapping |
| `headerDescConceptsLate` | `cosmicopediaDescription(locale, "conceptsLate")` | Direct mapping |
| `headerDescConceptsEndGoal` | `cosmicopediaDescription(locale, "endGoal")` | Direct mapping |
| `headerDescPhilosophies` | `cosmicopediaDescription(locale, "philosophies")` | Direct mapping |

Source selection is in [`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L494)
and the header/description/content sequence is in [`ui.js`](../../../../cosmicForge/cosmicForge/ui.js#L3511)
and [`index.html`](../../../../cosmicForge/cosmicForge/index.html#L926). The target
catalogue and page rendering are in [`cosmicopediaMessages.ts`](../../../src/i18n/cosmicopediaMessages.ts#L1430)
and [`MiaplaediaPane.tsx`](../../../src/app/MiaplaediaPane.tsx#L9). The focused
installed-Chrome case passed 1/1, covering all 42 page/locale combinations.

### P-44 Miaplaedia Get Started article-key crosswalk (9 October 2026)

Cosmic Forge's `descriptions.js` maps one heading/body pair to the Get Started
guide. MIAPLACIDUS now uses that source article in all six locales. The body
copy follows the source, with the old game name changed to `Miaplacidus` and the
guide name changed to `Miaplaedia` (including the French source spelling
`Cosmicopédie`). Its 18 source `<br/>` markers now render as line breaks rather
than visible markup. The focused installed-Chrome case checks the localized
heading, single-article order, full visible copy, current names, and all 18
breaks in each locale; it passed 1/1.

| Cosmic Forge source key | MIAPLACIDUS target | Disposition |
| --- | --- | --- |
| `helpGetStartedSubHeading1` | `cosmicopediaArticles(locale, "getStarted")[0].heading` | Direct mapping |
| `helpGetStartedSubBody1` | `cosmicopediaArticles(locale, "getStarted")[0].body` | Direct mapping with owner-required game and guide name corrections; source breaks rendered semantically |

Source wiring is [`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L2733)
and the six-locale source values begin in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1058).
The target catalogue and renderer are [`cosmicopediaMessages.ts`](../../../src/i18n/cosmicopediaMessages.ts#L10)
and [`MiaplaediaPane.tsx`](../../../src/app/MiaplaediaPane.tsx#L47). Results are
recorded in the [Miaplaedia README](../../../tests/e2e/miaplaedia/README.md#p-44-get-started-article-copy-9-october-2026).

### P-44 Miaplaedia Story article-key crosswalk (9 October 2026)

Cosmic Forge's `descriptions.js` maps three Story subheadings and bodies to
six localization keys (`helpStorySubHeading1` through `helpStorySubBody3`).
MIAPLACIDUS stores these in the matching three `cosmicopediaSourceMessages`
Story entries for all six locales. The final article's closing identity line is
adapted to the owner's naming instruction: it names Mia'Plac and Miaplacidus
instead of the old player/game names. The remaining Story copy retains the
source content. The focused Chrome case compares every visible heading and
paragraph to the typed locale catalogue, checks paragraph breaks, and verifies
the corrected player/game naming in all six locales; it passed 1/1.

| Cosmic Forge source key | MIAPLACIDUS target | Disposition |
| --- | --- | --- |
| `helpStorySubHeading1` | `cosmicopediaArticles(locale, "story")[0].heading` | Direct mapping |
| `helpStorySubBody1` | `cosmicopediaArticles(locale, "story")[0].body` | Direct mapping |
| `helpStorySubHeading2` | `cosmicopediaArticles(locale, "story")[1].heading` | Direct mapping |
| `helpStorySubBody2` | `cosmicopediaArticles(locale, "story")[1].body` | Direct mapping |
| `helpStorySubHeading3` | `cosmicopediaArticles(locale, "story")[2].heading` | Direct mapping |
| `helpStorySubBody3` | `cosmicopediaArticles(locale, "story")[2].body` | Direct mapping with the closing player/game identity updated per owner instruction |

Source wiring is [`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L2737)
and the six-locale source values begin in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1060).
The target catalogue is [`cosmicopediaMessages.ts`](../../../src/i18n/cosmicopediaMessages.ts),
rendered by [`MiaplaediaPane.tsx`](../../../src/app/MiaplaediaPane.tsx#L26).
The focused browser result is recorded in the [Miaplaedia README](../../../tests/e2e/miaplaedia/README.md#p-44-story-article-copy-9-october-2026).

### P-44 Miaplaedia Philosophies article-key crosswalk (9 October 2026)

Cosmic Forge maps seven ordered Philosophy articles through fourteen
`helpPhilosophiesSubHeadingN`/`helpPhilosophiesSubBodyN` keys. Direct comparison
found all 84 localized values (seven heading/body pairs in six locales) match
the target `philosophies` catalogue exactly. The installed-Chrome
`@p44-philosophies-copy` case checks the page title and description, all seven
rendered headings and bodies, source order, and paragraph-break rendering in
all six locales; it passed 1/1 in 10.9 seconds. No obsolete game or player name
appears in the rendered page.

| Cosmic Forge source key | MIAPLACIDUS target | Disposition |
| --- | --- | --- |
| `helpPhilosophiesSubHeading1` | `cosmicopediaArticles(locale, "philosophies")[0].heading` | Direct mapping |
| `helpPhilosophiesSubBody1` | `cosmicopediaArticles(locale, "philosophies")[0].body` | Direct mapping |
| `helpPhilosophiesSubHeading2` | `cosmicopediaArticles(locale, "philosophies")[1].heading` | Direct mapping |
| `helpPhilosophiesSubBody2` | `cosmicopediaArticles(locale, "philosophies")[1].body` | Direct mapping |
| `helpPhilosophiesSubHeading3` | `cosmicopediaArticles(locale, "philosophies")[2].heading` | Direct mapping |
| `helpPhilosophiesSubBody3` | `cosmicopediaArticles(locale, "philosophies")[2].body` | Direct mapping |
| `helpPhilosophiesSubHeading4` | `cosmicopediaArticles(locale, "philosophies")[3].heading` | Direct mapping |
| `helpPhilosophiesSubBody4` | `cosmicopediaArticles(locale, "philosophies")[3].body` | Direct mapping |
| `helpPhilosophiesSubHeading5` | `cosmicopediaArticles(locale, "philosophies")[4].heading` | Direct mapping |
| `helpPhilosophiesSubBody5` | `cosmicopediaArticles(locale, "philosophies")[4].body` | Direct mapping |
| `helpPhilosophiesSubHeading6` | `cosmicopediaArticles(locale, "philosophies")[5].heading` | Direct mapping |
| `helpPhilosophiesSubBody6` | `cosmicopediaArticles(locale, "philosophies")[5].body` | Direct mapping |
| `helpPhilosophiesSubHeading7` | `cosmicopediaArticles(locale, "philosophies")[6].heading` | Direct mapping |
| `helpPhilosophiesSubBody7` | `cosmicopediaArticles(locale, "philosophies")[6].body` | Direct mapping |

Source wiring is [`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L2841);
the six locale source records begin at [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1154).
The target catalogue and renderer are [`cosmicopediaMessages.ts`](../../../src/i18n/cosmicopediaMessages.ts#L214)
and [`MiaplaediaPane.tsx`](../../../src/app/MiaplaediaPane.tsx#L26). The focused
test result is recorded in the [Miaplaedia README](../../../tests/e2e/miaplaedia/README.md#p-44-philosophies-article-copy-9-october-2026).

### P-44 Miaplaedia Concepts - End Goal article-key crosswalk (9 October 2026)

Cosmic Forge's `descriptions.js` maps five ordered subheading/body pairs to
Concepts - End Goal. The target `endGoal` catalogue contains the same five
articles in all six locales. A direct source comparison found all 60 localized
heading/body values exact. The focused installed-Chrome case checks the page
heading and description plus every rendered article heading, body, order, and
line-break count across all six locales; it passed 1/1.

| Cosmic Forge source key | MIAPLACIDUS target | Disposition |
| --- | --- | --- |
| `helpConceptsEndGoalSubHeading1` | `cosmicopediaArticles(locale, "endGoal")[0].heading` | Direct mapping |
| `helpConceptsEndGoalSubBody1` | `cosmicopediaArticles(locale, "endGoal")[0].body` | Direct mapping |
| `helpConceptsEndGoalSubHeading2` | `cosmicopediaArticles(locale, "endGoal")[1].heading` | Direct mapping |
| `helpConceptsEndGoalSubBody2` | `cosmicopediaArticles(locale, "endGoal")[1].body` | Direct mapping |
| `helpConceptsEndGoalSubHeading3` | `cosmicopediaArticles(locale, "endGoal")[2].heading` | Direct mapping |
| `helpConceptsEndGoalSubBody3` | `cosmicopediaArticles(locale, "endGoal")[2].body` | Direct mapping |
| `helpConceptsEndGoalSubHeading4` | `cosmicopediaArticles(locale, "endGoal")[3].heading` | Direct mapping |
| `helpConceptsEndGoalSubBody4` | `cosmicopediaArticles(locale, "endGoal")[3].body` | Direct mapping |
| `helpConceptsEndGoalSubHeading5` | `cosmicopediaArticles(locale, "endGoal")[4].heading` | Direct mapping |
| `helpConceptsEndGoalSubBody5` | `cosmicopediaArticles(locale, "endGoal")[4].body` | Direct mapping |

Source wiring is [`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L2829)
and the six-locale values begin in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1144).
The target catalogue is [`cosmicopediaMessages.ts`](../../../src/i18n/cosmicopediaMessages.ts#L192),
rendered by [`MiaplaediaPane.tsx`](../../../src/app/MiaplaediaPane.tsx#L26).
The test result is recorded in the [Miaplaedia README](../../../tests/e2e/miaplaedia/README.md#p-44-concepts---end-goal-article-copy-9-october-2026).

### P-44 Miaplaedia Concepts - Mid article-key crosswalk (9 October 2026)

Cosmic Forge maps twelve ordered Concepts - Mid heading/body pairs to 24
`helpConceptsMidSubHeadingN`/`helpConceptsMidSubBodyN` keys. Direct comparison
found all 144 localized values (12 pairs in six locales) match the target
`conceptsMid` catalogue exactly; the source family contains no obsolete game or
player names and no explicit HTML breaks. The installed-Chrome
`@p44-concepts-mid-copy` case checks the page title and description, all twelve
rendered headings and bodies, source order, and paragraph-break rendering in
all six locales; it passed 1/1 in 9.9 seconds.

| Cosmic Forge source key | MIAPLACIDUS target | Disposition |
| --- | --- | --- |
| `helpConceptsMidSubHeading1` | `cosmicopediaArticles(locale, "conceptsMid")[0].heading` | Direct mapping |
| `helpConceptsMidSubBody1` | `cosmicopediaArticles(locale, "conceptsMid")[0].body` | Direct mapping |
| `helpConceptsMidSubHeading2` | `cosmicopediaArticles(locale, "conceptsMid")[1].heading` | Direct mapping |
| `helpConceptsMidSubBody2` | `cosmicopediaArticles(locale, "conceptsMid")[1].body` | Direct mapping |
| `helpConceptsMidSubHeading3` | `cosmicopediaArticles(locale, "conceptsMid")[2].heading` | Direct mapping |
| `helpConceptsMidSubBody3` | `cosmicopediaArticles(locale, "conceptsMid")[2].body` | Direct mapping |
| `helpConceptsMidSubHeading4` | `cosmicopediaArticles(locale, "conceptsMid")[3].heading` | Direct mapping |
| `helpConceptsMidSubBody4` | `cosmicopediaArticles(locale, "conceptsMid")[3].body` | Direct mapping |
| `helpConceptsMidSubHeading5` | `cosmicopediaArticles(locale, "conceptsMid")[4].heading` | Direct mapping |
| `helpConceptsMidSubBody5` | `cosmicopediaArticles(locale, "conceptsMid")[4].body` | Direct mapping |
| `helpConceptsMidSubHeading6` | `cosmicopediaArticles(locale, "conceptsMid")[5].heading` | Direct mapping |
| `helpConceptsMidSubBody6` | `cosmicopediaArticles(locale, "conceptsMid")[5].body` | Direct mapping |
| `helpConceptsMidSubHeading7` | `cosmicopediaArticles(locale, "conceptsMid")[6].heading` | Direct mapping |
| `helpConceptsMidSubBody7` | `cosmicopediaArticles(locale, "conceptsMid")[6].body` | Direct mapping |
| `helpConceptsMidSubHeading8` | `cosmicopediaArticles(locale, "conceptsMid")[7].heading` | Direct mapping |
| `helpConceptsMidSubBody8` | `cosmicopediaArticles(locale, "conceptsMid")[7].body` | Direct mapping |
| `helpConceptsMidSubHeading9` | `cosmicopediaArticles(locale, "conceptsMid")[8].heading` | Direct mapping |
| `helpConceptsMidSubBody9` | `cosmicopediaArticles(locale, "conceptsMid")[8].body` | Direct mapping |
| `helpConceptsMidSubHeading10` | `cosmicopediaArticles(locale, "conceptsMid")[9].heading` | Direct mapping |
| `helpConceptsMidSubBody10` | `cosmicopediaArticles(locale, "conceptsMid")[9].body` | Direct mapping |
| `helpConceptsMidSubHeading11` | `cosmicopediaArticles(locale, "conceptsMid")[10].heading` | Direct mapping |
| `helpConceptsMidSubBody11` | `cosmicopediaArticles(locale, "conceptsMid")[10].body` | Direct mapping |
| `helpConceptsMidSubHeading12` | `cosmicopediaArticles(locale, "conceptsMid")[11].heading` | Direct mapping |
| `helpConceptsMidSubBody12` | `cosmicopediaArticles(locale, "conceptsMid")[11].body` | Direct mapping |

Source wiring is [`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L2770);
the six locale source records begin at [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1088).
The target catalogue and renderer are [`cosmicopediaMessages.ts`](../../../src/i18n/cosmicopediaMessages.ts#L76)
and [`MiaplaediaPane.tsx`](../../../src/app/MiaplaediaPane.tsx#L26). The focused
test result is recorded in the [Miaplaedia README](../../../tests/e2e/miaplaedia/README.md#p-44-concepts---mid-article-copy-9-october-2026).

### P-44 Miaplaedia Concepts - Late article-key crosswalk (9 October 2026)

Cosmic Forge maps sixteen ordered Concepts - Late heading/body pairs to 32
`helpConceptsLateSubHeadingN`/`helpConceptsLateSubBodyN` keys. A fresh read-only
comparison confirmed that all 192 localized values (16 pairs in six locales)
match the target `conceptsLate` catalogue exactly, in the same order. All six
`headerDescConceptsLate` descriptions also match. This source family contains
neither the obsolete game nor player name, so no owner-name replacement is
needed. It contains no explicit HTML `<br>` markup; its paragraph newlines are
rendered at the same boundaries. The installed-Chrome
`@p44-concepts-late-copy` case checks the localized page title and description,
all sixteen rendered headings and bodies in source order, and exact paragraph-
break placement in all six locales; it passed 1/1 in 10.3 seconds.

| Cosmic Forge source key | MIAPLACIDUS target | Disposition |
| --- | --- | --- |
| `helpConceptsLateSubHeading1` | `cosmicopediaArticles(locale, "conceptsLate")[0].heading` | Direct mapping |
| `helpConceptsLateSubBody1` | `cosmicopediaArticles(locale, "conceptsLate")[0].body` | Direct mapping |
| `helpConceptsLateSubHeading2` | `cosmicopediaArticles(locale, "conceptsLate")[1].heading` | Direct mapping |
| `helpConceptsLateSubBody2` | `cosmicopediaArticles(locale, "conceptsLate")[1].body` | Direct mapping |
| `helpConceptsLateSubHeading3` | `cosmicopediaArticles(locale, "conceptsLate")[2].heading` | Direct mapping |
| `helpConceptsLateSubBody3` | `cosmicopediaArticles(locale, "conceptsLate")[2].body` | Direct mapping |
| `helpConceptsLateSubHeading4` | `cosmicopediaArticles(locale, "conceptsLate")[3].heading` | Direct mapping |
| `helpConceptsLateSubBody4` | `cosmicopediaArticles(locale, "conceptsLate")[3].body` | Direct mapping |
| `helpConceptsLateSubHeading5` | `cosmicopediaArticles(locale, "conceptsLate")[4].heading` | Direct mapping |
| `helpConceptsLateSubBody5` | `cosmicopediaArticles(locale, "conceptsLate")[4].body` | Direct mapping |
| `helpConceptsLateSubHeading6` | `cosmicopediaArticles(locale, "conceptsLate")[5].heading` | Direct mapping |
| `helpConceptsLateSubBody6` | `cosmicopediaArticles(locale, "conceptsLate")[5].body` | Direct mapping |
| `helpConceptsLateSubHeading7` | `cosmicopediaArticles(locale, "conceptsLate")[6].heading` | Direct mapping |
| `helpConceptsLateSubBody7` | `cosmicopediaArticles(locale, "conceptsLate")[6].body` | Direct mapping |
| `helpConceptsLateSubHeading8` | `cosmicopediaArticles(locale, "conceptsLate")[7].heading` | Direct mapping |
| `helpConceptsLateSubBody8` | `cosmicopediaArticles(locale, "conceptsLate")[7].body` | Direct mapping |
| `helpConceptsLateSubHeading9` | `cosmicopediaArticles(locale, "conceptsLate")[8].heading` | Direct mapping |
| `helpConceptsLateSubBody9` | `cosmicopediaArticles(locale, "conceptsLate")[8].body` | Direct mapping |
| `helpConceptsLateSubHeading10` | `cosmicopediaArticles(locale, "conceptsLate")[9].heading` | Direct mapping |
| `helpConceptsLateSubBody10` | `cosmicopediaArticles(locale, "conceptsLate")[9].body` | Direct mapping |
| `helpConceptsLateSubHeading11` | `cosmicopediaArticles(locale, "conceptsLate")[10].heading` | Direct mapping |
| `helpConceptsLateSubBody11` | `cosmicopediaArticles(locale, "conceptsLate")[10].body` | Direct mapping |
| `helpConceptsLateSubHeading12` | `cosmicopediaArticles(locale, "conceptsLate")[11].heading` | Direct mapping |
| `helpConceptsLateSubBody12` | `cosmicopediaArticles(locale, "conceptsLate")[11].body` | Direct mapping |
| `helpConceptsLateSubHeading13` | `cosmicopediaArticles(locale, "conceptsLate")[12].heading` | Direct mapping |
| `helpConceptsLateSubBody13` | `cosmicopediaArticles(locale, "conceptsLate")[12].body` | Direct mapping |
| `helpConceptsLateSubHeading14` | `cosmicopediaArticles(locale, "conceptsLate")[13].heading` | Direct mapping |
| `helpConceptsLateSubBody14` | `cosmicopediaArticles(locale, "conceptsLate")[13].body` | Direct mapping |
| `helpConceptsLateSubHeading15` | `cosmicopediaArticles(locale, "conceptsLate")[14].heading` | Direct mapping |
| `helpConceptsLateSubBody15` | `cosmicopediaArticles(locale, "conceptsLate")[14].body` | Direct mapping |
| `helpConceptsLateSubHeading16` | `cosmicopediaArticles(locale, "conceptsLate")[15].heading` | Direct mapping |
| `helpConceptsLateSubBody16` | `cosmicopediaArticles(locale, "conceptsLate")[15].body` | Direct mapping |

Source wiring is [`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L2795).
The six locale article records start in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1112)
at lines 1112 (en), 3735 (es), 6358 (pt), 8981 (de), 11604 (it), and 14227
(fr); the matching page descriptions are at lines 110, 2733, 5356, 7979,
10602, and 13225. The target locale arrays begin in
[`cosmicopediaMessages.ts`](../../../src/i18n/cosmicopediaMessages.ts#L126)
at lines 126, 362, 598, 834, 1070, and 1306; `MiaplaediaPane.tsx` renders the
ordered entries and paragraph boundaries at lines 26-45. The focused result
is recorded in the [Miaplaedia README](../../../tests/e2e/miaplaedia/README.md#p-44-concepts---late-article-copy-9-october-2026).

**P-44 scope refinement:** the `achievementNotification<Name>` source family
now maps to the localized remake notification catalogue as recorded above; it
is not an absent-copy gap. The journal does omit the source Effect description
and total-duration fields. The owner requested a redesigned Events destination
and removal of its old `meta / signals` strapline, but no instruction found in
this handoff directs removal of those event details, so keep their disposition
open rather than marking them as owner-approved omissions. Cloud save transfer
and original Cosmic Forge save import remain explicitly excluded by product
decision; the Hard Reset family maps to the per-pioneer active-slot deletion
flow described above, and Exit Game is not part of the browser remake. Source
guide panes moved to Miaplaedia.

### P-44 source Contact pane disposition (9 October 2026)

Cosmic Forge places a Contact pane under Cosmicopedia. Its localized headings
describe contact channels, Discord, and email; the pane body hardcodes the
Cosmic Forge Discord invite and exposes the original game's email address.
The target has no owner-provided Miaplacidus support channel. Reusing those
links would send players to the old game's community/contact endpoint, while
inventing a new endpoint would be unsupported. Therefore the Contact pane and
its description are intentionally omitted from Miaplaedia; the seven player
guides remain available. This is an explicit source-key disposition, not an
unmapped guide family.

| Cosmic Forge source key/content | Disposition |
| --- | --- |
| `headerDescContact` | Omitted with the old-game Contact pane; no target description is needed |
| `helpContactSubHeading1` and empty `subBody1` | Omitted; these introduce the old-game contact channels |
| `helpContactSubHeading2` and literal Discord invite URL | Omitted; the invite belongs to Cosmic Forge's community |
| `helpContactSubHeading3` and `helpContactSubBody3` | Omitted; the email belongs to the old game |

Source menu wiring is [`index.html`](../../../../cosmicForge/cosmicForge/index.html#L829),
and the pane's literal invite/address wiring is
[`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L2725).
Localized strings are in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1054).

### P-44 Save/Import, quota, and conflict message crosswalk (10 October 2026)

This slice compares the Cosmic Forge Settings save/import controls and
`saveLoadGame.js` feedback with the typed `saveMessages.ts` IDs. A focused unit
crosswalk checks the scoped source keys and their target IDs in all six source
and remake locales, and checks exact equality for direct source-copy matches.

| Cosmic Forge source key | MIAPLACIDUS target | Disposition |
| --- | --- | --- |
| `tab9AutoSaveRowLabel` | `saveText(locale, "autoSave")` | Adapted label |
| `dropdownAutoSave2Minutes`, `dropdownAutoSave3Minutes`, `dropdownAutoSave5Minutes`, `dropdownAutoSave10Minutes` | `every5Minutes`, `every15Minutes`, `every30Minutes`, `everyHour` | Source interval set is intentionally replaced by the owner's 5/15/30/60-minute options; no one-to-one duration mapping |
| `notificationAutoSaveOff` | `saveText(locale, "autoSaveDisabledWarning")` | Exact source copy in all six locales |
| `tab9ExportSaveRowLabel` | `saveText(locale, "export")` | Adapted to portable local-save code |
| `placeholderExportSaveArea` | None | Replaced by a prefilled, read-only code generated from the current playable run |
| `buttonExport` | `saveText(locale, "copy")` | Adapted action label; the source button copies its code |
| `buttonManualSave` | `saveText(locale, "download")` | Adapted action label; the source button downloads a text file |
| `tab9ImportSaveRowLabel`, `placeholderImportSaveArea` | `saveText(locale, "import" / "importText")` | Adapted local portable-code form |
| `buttonImport` | `saveText(locale, "preview")`, then `saveText(locale, "applyImport")` | Adapted to preview and explicit confirmation before importing |
| `buttonManualLoad` | `saveText(locale, "file")` | Adapted file-picker label |
| `notificationDataCopiedToClipboard`, `notificationErrorCopyingData` | `clipboardCopied`, `clipboardCopyError` | Exact source copy in all six locales; checked against `localization.json` |
| `notificationInvalidSaveString` | `errEmpty`, `errFormat`, `errCode` | Split into empty, unmarked-format, and malformed-code feedback |
| `notificationErrorLoadingSaveString` | `errCode`, `errIntegrity`, `errGeneric` | Split into decode, integrity, and general import errors |
| `notificationErrorInitializingGame` | `errImport` | Adapted retryable failure while applying a validated local import; see the implementation follow-up below |
| `notificationGameLoadedSuccessfully` | `imported` | Adapted local-import success |
| `notificationNoSaveDataToExport` | None | Not applicable: the current playable state remains exportable even without a stored slot |
| `notificationSaveCompressionUnavailable` | None | No matching runtime condition: the remake imports its codec as a bundled dependency |
| `notificationSavingDisabledInDemo` | None | Intentionally excluded: the local-save contract explicitly gives the flagged demo build the same local-save behavior as the full build |
| `notificationCannotSaveDuringOnboarding` | None | No source-style onboarding save lock exists; the remake retains an onboarding-completed statistic but not this mode restriction |
| Cloud export/import controls and their cloud success, failure, missing-save, and name-reuse notices | None | Intentionally excluded by the local-save contract; `notificationPioneerNameReused` describes a cloud lifecycle state and is not the local duplicate-name error |
| No source key for local browser quota or two-tab writer conflict | `errQuota`, `errConflict` | New local-storage feedback; not source omissions |

The audit also found and corrected a target wiring error. `validatePioneerName`
previously emitted `invalid-envelope`, which `saveErrorText` correctly maps to
save-integrity feedback for damaged payloads. A blank/invalid import name could
therefore show the integrity message. Name validation now emits the distinct
`invalid-name` code and six-locale `errName` text; `invalid-envelope` remains
mapped to `errIntegrity` for actual envelope failures. The six-locale import
journey verifies this path.

Evidence: `tests/unit/save-message-crosswalk.spec.ts` passed **18/18**, including
all scoped source keys across six locales, direct source-copy equality, and
quota/conflict/name error routing. The installed-Chrome import journey passed
**1/1 in 14.8 seconds** on isolated port 4895. `npm.cmd run typecheck` passed.
The Save Slots README records the focused browser command and the updated
disposition. Cloud-save strings remain intentionally excluded. The source demo
refusal is intentionally excluded by the more specific local-save contract;
the source Hard Reset is represented by deleting only the active pioneer slot
and then starting a fresh run with the same name. This audit does not close
P-44.

#### P-44 Save/Import source inventory and visible positions (10 October 2026)

The source inventory is now **56 Save/Import and adjacent entry-point keys** in
each of `en`, `es`, `pt`, `de`, `it`, and `fr` (336 nonempty localized source
values). The inventory combines the 37 Settings/save-manager/cloud keys already
checked by `save-message-crosswalk.spec.ts` with the 19 startup-picker, exit,
legacy-version, shared-cancel, and hard-reset keys listed below. The six-locale
unit assertion checks that every key exists and has nonempty source text;
existing typed-target and browser tests verify the mapped remake messages at
their actual controls.

| Cosmic Forge source key(s) | MIAPLACIDUS target and visible position | Disposition |
| --- | --- | --- |
| `gameSaveNameCollect` | `saveText(locale, "choose")` eyebrow and the localized `app.pioneer` label on the startup SaveStartScreen | Adapted to the requested local-pioneer search picker; the greeting is not copied verbatim. |
| `gameSaveNameLoadHint` | `saveText(locale, "selectSavedPioneerHint")` below the startup pioneer input and associated with it | Adapted to the remake's explicit selection contract: select a saved suggestion to resume; typing a matching name alone does not load it. |
| No dedicated source roster heading | `saveText(locale, "otherPioneers")` on the local-slot roster heading and its accessible label in Save Manager | New six-locale label, “Other saved pioneers” in English, distinguishing the other local saves from the active save. |
| `buttonCancel` | `saveText(locale, "cancel")` on local recovery and import-cancel controls | Adapted shared action label; the source exit modal where it is used is not rendered. |
| `tab9AutoSaveRowLabel`; `dropdownAutoSave2Minutes`, `dropdownAutoSave3Minutes`, `dropdownAutoSave5Minutes`, `dropdownAutoSave10Minutes` | `autoSave`, `saveFrequency`, and `every5Minutes` / `every15Minutes` / `every30Minutes` / `everyHour` in Settings → Saving and Loading | Label adapted; interval options intentionally follow the owner's 5/15/30/60-minute set, not source durations. |
| `notificationAutoSaveOff` | `autoSaveDisabledWarning` notification when autosave is turned off | Exact source copy in all six locales. |
| `tab9ExportSaveRowLabel`, `placeholderExportSaveArea`, `buttonExport`, `buttonManualSave` | `export` heading, generated read-only code field, `copy`, and `download` controls in the inline Save Manager under Settings → Saving and Loading | Adapted to local portable codes. The source placeholder is replaced by the current run's generated code. |
| `notificationDataCopiedToClipboard`, `notificationErrorCopyingData` | `clipboardCopied` / `clipboardCopyError` status in the inline Save Manager | Exact source copy in all six locales. |
| `tab9ImportSaveRowLabel`, `placeholderImportSaveArea`, `buttonImport`, `buttonManualLoad` | `import` heading, `importText` label, `preview` then `applyImport`, and `file` control in the same inline Save Manager | Adapted to a marked MIAPLACIDUS code, preview, and explicit local import; file selection fills the same preview flow. |
| `notificationInvalidSaveString`, `notificationErrorLoadingSaveString`, `notificationErrorInitializingGame`, `notificationGameLoadedSuccessfully` | `errEmpty` / `errFormat` / `errCode` / `errIntegrity` / `errImport` alerts and `imported` notice in the Save Manager | Source's broad invalid/load outcomes are split by the actual local-code validation stage; unexpected failures while applying an import use `errImport`, typed local storage failures keep their specific messages, and success wording is adapted to local import. |
| `notificationNoSaveDataToExport`, `notificationSaveCompressionUnavailable` | None | No matching runtime condition: the current run is exportable and the portable-code codec is bundled. |
| `notificationCannotSaveDuringOnboarding` | None | No source-style onboarding save lock exists in the remake. |
| `notificationSavingDisabledInDemo` | None | Intentionally excluded by the local-save contract: demo builds use the same local saves as full builds, so no refusal notice should render. |
| `notificationSaveTooOldForPhilosophies` | None; supported MIAPLACIDUS schemas use migrations, and `errFuture` is reserved for a save newer than this remake | Source warning concerns an old Cosmic Forge schema/Philosophy compatibility state; it is not equivalent to `errFuture`, and Cosmic Forge saves are not accepted. |
| `tab9ExportCloudSaveRowLabel`, `buttonSaveToCloud`, `tab9ImportCloudSaveRowLabel`, `labelPioneerName`, `buttonLoadFromCloud`, `notificationErrorSavingToCloud`, `notificationErrorSavingToCloudNoPioneerName`, `notificationGameSavedToCloud`, `notificationGameUpdatedInCloud`, `notificationCloudSaveDeleted`, `notificationCloudSaveDeleteFailed`, `notificationErrorLoadingFromCloud`, `notificationNoSavedGameDataFound`, `notificationPioneerNameReused` | None | Intentionally excluded by the local-save contract; cloud lifecycle notices are not local duplicate-name or local-storage errors. |
| `headerMainExitGame`, `headerDescExitGame`, `tab9ExitGameRowLabel`, `modalExitGameText`, `modalExitGameConfirmLabel`, `modalExitGameExtra1Label` | None | The source route is an Electron exit screen and its save-and-exit action depends on cloud saving. The browser owns tab closure; no app-level exit control is rendered. |
| `tab9HardResetRowLabel`, `buttonHardResetAllProgress` | `delete` control in the active slot card under Settings → Saving and Loading | Adapted to the source's actual scope: `destroySaveGameOnCloud()` selects only `getSaveName()`, archives that one profile as `graveyard_<name>`, then nulls its cloud payload. The remake deletes only the active named slot; it does not wipe other pioneers. Starting a fresh game with the same name restores the reset outcome. |
| `tab9HardResetRowDescription`, `hardResetWarningText` | `deletePrompt` inside the inline confirmation section | Adapted to per-slot local deletion and the export-first safeguard. |
| `hardResetWarningHeader`, `modalHardResetConfirmLabel` | `confirmDelete` inline legend/button | Adapted from a modal to the Save Manager's inline confirmation. |
| `modalHardResetCancelLabel` | None | Intentionally omitted because the inline confirmation has no separate Cancel button. |
| `notificationHardResetComplete` | `saveDeleted` notice on the pioneer-selection screen after deleting the active local save | Adapted to per-slot local deletion: confirms the save is gone and the same pioneer name can start a new game; no cloud reset or browser refresh. |

Together with the existing P-44 crosswalk table above, these rows account for
all 56 keys found in the source entry point, Settings save rows, `saveLoadGame.js`,
and the save-name description. The original expanded unit crosswalk passed
**18/18**. The 10 October startup-hint follow-up now maps `gameSaveNameLoadHint`
to `selectSavedPioneerHint` in the existing unit crosswalk; that updated case
has not been rerun. The six-locale installed-Chrome startup, import-error, and
recovery checks are recorded in the [Save Slots README](../../../tests/e2e/save-slots/README.md#p-44-saveimport-source-key-crosswalk-10-october-2026).
The demo-save refusal is intentionally excluded by the save contract. The
eight-key Hard Reset family is fully dispositioned: seven keys map to localized
per-slot delete controls, warnings, confirmation, or completion feedback; the
source cancel control is replaced by the inline-confirmation flow. Other P-44
scope remains open; this slice does not close P-44.

#### Settings save-controls disposition (11 October 2026)

A scoped six-locale review of Settings > Saving and Loading found the source
description, autosave, local export, local import, and applicable feedback
already wired to the corresponding typed messages and Save Manager controls.
The 5/15/30/60-minute autosave choices remain the owner's requested replacement
for Cosmic Forge's interval set. The source `notificationErrorInitializingGame`
maps to `errImport`, which is the retryable failure shown by
`SaveManager.showImportError`; the unit crosswalk previously named `errGeneric`
and is corrected to match the runtime. No player-facing copy change was needed.
Cloud saving, original Cosmic Forge save import, global reset, and clipboard
messages were outside this review. The crosswalk correction has not been run.

## P-46 empty import-code audit (9 October 2026)

The current Save Start, Settings save controls, inline Save Manager, and
recovery actions route their visible labels and error messages through the
typed six-locale `saveMessages.ts` catalogue; TypeScript's locale/key record
passed `npm.cmd run typecheck`. The smallest uncovered visible validation path
was an empty portable-code import. `p46-save-error-locale.spec.ts` now checks
`errEmpty` before its existing malformed-format and duplicate-save assertions
in all six locales. The focused installed-Chrome command and the npm-wrapped
runner both failed before test startup with `spawn EPERM`, so this new browser
assertion is not yet verified. Existing six-locale evidence covers quota,
malformed format, duplicate-save prompt, and stale-tab lock-conflict copy.

P-46 remains open: additional import error variants and the recovery labels and
success notice still need six-locale browser coverage, along with the broader
mobile review. See the [Save Slots README](../../../tests/e2e/save-slots/README.md#p-46-empty-import-code-copy-audit-9-october-2026).

## P-44 Starship, Fleet, and Colonise source crosswalk (10 October 2026)

The Cosmic Forge Starship/Fleet/Colonise route surface contributes 102
feature-specific source keys in six locale blocks (`en`, `es`, `pt`, `de`,
`it`, `fr`): six headings, five module names, 19 `tab5*` row/status/intro
strings, seven Starship/Fleet tooltips, two Starship row hints, five Fleet unit
descriptions, eight fleet labels, two launch-warning strings, 14 diplomacy
strings, 22 battle strings, two settlement result tokens, and ten journey,
arrival, or loss-event strings. A source JSON inventory confirmed all 102 keys
exist in every source locale. Generic button and quantity labels are shared
source keys and are not included in that page-specific count.

| Cosmic Forge source keys | MIAPLACIDUS target | Disposition |
| --- | --- | --- |
| `headerMainStarShip`, `headerMainFleetHangar`, `headerMainColonise` | `starshipText(locale, "title" / "fleetHangar" / "colonise")`, with the Fleet Hangar panel titled `envoyTitle` after its module is complete; `presentationNavigation.ts` supplies the child-tab names | Mapped to the remake's three child pages. |
| `headerDescStarShip`, `headerDescFleetHangar` | `starshipMessages.description`, Fleet Hangar's live `fleetPower`, and the Fleet Hangar title help | Starship uses its target-specific required-module summary; Fleet Hangar shows the current fleet-power value alongside the source-backed title help. The source subtitles are redistributed or shortened for the pane layout. |
| `headerDescColonise` | `starshipMessages.coloniseHeaderHelp` in a title-side `InfoTooltip` on the Colonise page | Exact localized source description with the selected destination and current attack fleet power supplied dynamically; see the dated mapping below. |
| `starShipModuleStructural`, `starShipModuleLifeSupport`, `starShipModuleAntimatterEngine`, `starShipModuleFleetHangar`, `starShipModuleStellarScanner` | `structural`, `lifeSupport`, `antimatterEngine`, `fleetHangar`, `stellarScanner` | Direct module-label mapping. |
| `tab5TravellingToRowLabel`, `tab5PerformSystemScanRowLabel`, `tab5ScanSystemDescription`, `tab5StarNameRowLabel`, `tab5CivilizationRowLabel`, `tab5PopulationRowLabel`, `tab5ThreatLevelRowLabel`, `tab5EnemyFleetsRowLabel`, `tab5AnomaliesRowLabel`, `tab5RelationsRowLabel`, `tab5AttitudeRowLabel`, `tab5IntelligenceRowLabel`, `tab5ScanResultsAnalyse`, `tab5ScanResultsNoScanner`, `tab5FleetHangarDescription`, `tab5BattleDescription`, `tab5BuildFleetsToEngage`, `tab5ColoniseDescription`, `tab5SettleNoResistance` | `travelling`, `journeyTimeRemaining`, `scanSystem`, `scanReport`, scan-report IDs (`raceName`, `civilization`, `population`, `threat`, `enemyFleets`, `anomalies`, `impression`, `attitude`, `patience`, `lifeformTraits`, `defense`), `scanLimited`, `fleetPower`, `battleTitle`/battle statuses, diplomacy and settlement controls/reasons, `settleNoResistance` | The target scan-report heading represents the source Intelligence group; civilization, traits, and defense remain distinct labeled readings. Source `tab5SettleNoResistance` now has six-locale action guidance on Colonise when a non-war destination has no sentient defenders or no enemy fleets. Other narrative row introductions are shortened or replaced by named sections and visible action reasons; they are not exact-copy mappings. |
| `spaceStarShipStellarScannerContent1`, `spaceStarShipDestinationReminderContent1` | `scanSystem`, `scanUnavailable`, `noDestination` | Their source help is presented through the target action and its visible prerequisite state rather than a separate tooltip. |
| `infoTooltipStarShipScanAP` | `scanApHelp` on the Star Data AP column; accessible name uses `scanMoreInfoLabel` | Direct copy in six locales; the table shows the system's base AP value. |
| `infoTooltipStarShipScanPrecipitation` | `scanWeatherHelp` on the Star Data Weather column | Direct copy in six locales; the remake displays prevailing weather chance and received compound in adjacent columns. |
| `infoTooltipStarShipScanType`, `infoTooltipStarShipScanDefense`, `infoTooltipStarShipScanEnemyFleets`, `infoTooltipStarShipScanThreatLevel` | `scanCivilizationHelp`, `scanDefenseHelp`, `scanEnemyFleetsHelp`, `scanThreatHelp` beside matching labels in the Colonise scan report | Direct copy in six locales. The remake's scanned civilization, defense, enemy fleet and threat readings live in the Colonise report, following the owner-directed report relocation. |
| `buttonBuildModule`, `buttonBuild`, `buttonScanSystem`, `buttonBully`, `buttonPassive`, `buttonHarmony`, `buttonVassalize`, `buttonConquest` | `buildPart`, `buildEnvoy`/`buildFleetShip`, `scanSystem`, `bullyEnemy`, `sendMessage`, `seekHarmony`, `vassalizeEnemy`, `enterWar` | Shared action text is wired to native remake buttons; `buttonPassive` is the Send Message action. |
| `fleetShipEnvoy`, `fleetShipScout`, `fleetShipMarauder`, `fleetShipLandStalker`, `fleetShipNavalStrafer`; `labelFleetAir`, `labelFleetLand`, `labelFleetSea` | `buildEnvoy`, `fleetScout`, `fleetMarauder`, `fleetLandStalker`, `fleetNavalStrafer`; `fleetAir`, `fleetLand`, `fleetSea` | Player-unit names and enemy class labels are localized. The enemy health breakdown previously capitalized raw `air`/`land`/`sea` identifiers in English; `interstellar-localization.spec.ts` asserts all three labels in every locale. |
| `spaceFleetEnvoyBuildContent1` | Existing `envoyDescription`; the Envoy paragraph in `fleetHangarHeaderHelp` | Adapted to the remake's one-time diplomacy action. The separate source claim about gathering information has no corresponding Envoy action in the remake, so copy does not promise a new mechanic. |
| `spaceFleetScoutBuildContent1`, `spaceFleetMarauderBuildContent1`, `spaceFleetLandStalkerBuildContent1`, `spaceFleetNavalStraferBuildContent1` | New `fleetScoutDescription`, `fleetMarauderDescription`, `fleetLandStalkerDescription`, `fleetNavalStraferDescription` | Source descriptions now appear under their four matching Fleet card headings in all six locales. |
| `infoTooltipFleetHangarHeader` | New `fleetHangarHeaderHelp` and accessible `fleetHangarHelpLabel` | The helper is rendered from a focusable question-mark control beside the Fleet Hangar title. Source `<br><br>` separators become paragraph breaks; unit classes, speeds, and target types match remake fleet definitions and battle target lists. |
| `launchStarShipWarningHeader`, `launchStarShipWarningText` and shared confirm/cancel buttons | `pointOfNoReturnTitle`, `pointOfNoReturn`, `confirmLaunch`, `cancelLaunch` | Mapped to the localized Starship launch dialog. |
| `enterWarModeModalHeader`, `enterwarModeModalBackOutText`, `enterwarModeModalNoBackOutText`, `enterWarModeInsultedText`, `enterWarModeSurrenderText`, `enterWarModeNotVassalizedText`, `enterWarModeScaredText`, `enterWarModeModalLaughAtProspect`, `enterWarModeModalLaughAndEnterWar`, `enterWarModeModalImproveToReceptive`, `enterWarModeModalNeutral`, `enterWarModeModalReserved`, `enterWarModeModalPatience`, `diplomacyOptionsContent1` | `enterWar`, `warModeActive`, typed message/harmony/bully/vassalization outcomes, `diplomacyActionUnavailable`, and inline disabled reasons | The remake resolves diplomacy directly in the Colonise pane instead of source modal copy. This is a behavior/layout redesign; `diplomacyOptionsContent1` has no tooltip equivalent. |
| `modalBattleHeaderText`, `modalBattleWonText`, `modalBattleLostText`, `modalBattleNoSentientLifeHeader`, `modalBattleNoSentientLifeText`, `textBattleWon`, `textBattleLost`, `textFleetDestroyed`, and the `battle*` outcome keys | `battleTitle`, `battleidle`/`battleinProgress`/`battlevictory`/`battledefeat`, health labels, `battleVictory`/`battleDefeat` notices | Outcome is shown inline and in the notice stack rather than the source battle modal. This is an explicit UI redesign, not an exact wording match. |
| `textSettled`, `textColonised`, `tab5SettleNoResistance` | `settleSystem`, `alreadySettled`, `settlementComplete`, `settlementUnavailable` | Settlement state and action are mapped; the source's short no-resistance prompt has no separate success-only target ID. |
| `notificationSystemScanned`, `notificationStarShipCanBeLaunched`, `notificationStarShipReachedOrbit` | `starshipSystemScanned`, `starshipReady`, `starshipLaunched`/`starshipArrived` in `spaceNotificationMessages.ts`, routed by `spaceEventNotifications.ts` | Mapped into the localized notification system. |
| `eventDescStarshipLost`, `randomEventTriggerStarshipLostInSpace`, `modalEventStarshipLostInSpaceHeader`, `modalEventStarshipLostInSpaceText` | `randomEventDescriptionMessages.starshipLostInSpace`, `metaSignalMessages.starshipLostInSpace`, and the random-event outcome/effect log | The loss consequence is recorded through the remake's event system. The source's modal wording is not preserved as a modal. |
| `modalOStarReachedHeader`, `modalOStarReachedText` | `spaceNotificationMessages.oTypeStarReachedHeader` / `oTypeStarReachedText`, routed from `space.starship.arrived` when `starTypeForSystem(systemId) === "O"` | Source title and narrative are preserved in all six locales; source span markup is rendered as plain accessible text with paragraph breaks and the star name substituted for `X`. Cosmic Forge uses a blocking popup once per O-type star; the remake adapts this to a scrollable, non-blocking 20-second arrival notice and now persists notified O-star system IDs across rebirths. |
| `modalStarshipArrivedFactoryStarText` | `spaceNotificationMessages.factoryStarReachedText`, routed from `space.starship.arrived` when a `reported` `ancientManuscripts` record matches the destination; `{structure}` comes from localized `megastructureText` | Source narrative is preserved in all six locales and the source's hard-coded `MEGASTRUCTURE` title is retained. The remake emits it as a scrollable, non-blocking 20-second notice. The target already assigns the structure when the manuscript reveal is recorded, earlier than Cosmic Forge's arrival callback; this slice adds no assignment behavior. |

The bounded key list is in the source [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L88), with live source use in [`drawTab5Content.js`](../../../../cosmicForge/cosmicForge/drawTab5Content.js#L889), [`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L515), and [`game.js`](../../../../cosmicForge/cosmicForge/game.js#L4814). The remake routes all three child tabs through [`App.tsx`](../../../src/app/App.tsx#L2510) and renders them from [`StarshipPane.tsx`](../../../src/app/StarshipPane.tsx#L420), using [`starshipMessages.ts`](../../../src/i18n/starshipMessages.ts#L11), [`spaceNotificationMessages.ts`](../../../src/i18n/spaceNotificationMessages.ts#L4), and [`spaceEventNotifications.ts`](../../../src/app/spaceEventNotifications.ts#L136).

Existing browser evidence covers all six locales for Starship module/Fleet quotes,
travel and confirmation, Colonise scan-report fields, diplomacy actions and
disabled reasons at 320px and 390px (E-57, 6/6); the P-45 journey checks scan
completion notices and saved Colonise results in all six locales (4/4). After
P-29 fixed the shared `battle` declaration order, the focused installed-Chrome
run of `interstellar-localization.spec.ts` passed **1/1 in 16.4 seconds** on
isolated port 5299, including the six-locale enemy-class assertion. The focused
`@p44-fleet-copy` case passed **1/1 in 11.4 seconds** at 320px on port 5301,
asserting all five Fleet names/descriptions, the complete localized header help,
tooltip viewport bounds, and no horizontal document overflow in all six
locales. The route test also corrected stale selectors for sibling Star
Map/Star Data tabs and the current Launch Pad heading; no app behavior changed.
`npm.cmd run typecheck`, all four localization-validation unit cases, and Oxfmt
checks for all changed TypeScript/CSS files passed. Initial sandbox test starts
returned `spawn EPERM` before runner startup; the installed-Chrome and Vitest
escalated retries completed normally.

The six source `infoTooltipStarShipScan*` descriptions are now localized in
`starshipMessages.ts` and appear on their matching Star Data or Colonise scan
report labels. The `@p44-star-scan-info` installed-Chrome case passed **1/1 in
18.9 seconds** at 320×900 on port 5338. In all six locales it focuses each of
the six info controls, checks the source-backed tooltip copy and accessible
label, and verifies every tooltip stays within the viewport. A first run
revealed edge overflow and scroll-relative placement; the shared tooltip now
fits against measured viewport geometry. The test starts with the documented
`spawn EPERM` sandbox restriction; the installed-Chrome retry passed.
See the [Starship browser README](../../../tests/e2e/starship/README.md#p-44-starship-fleet-and-colonise-source-crosswalk-10-october-2026).

**P-44 O-type and factory-star arrival narratives (10 October 2026):** the
source's two arrival contexts are represented by the existing
`space.starship.arrived` event and current system data. O-type systems use the
catalogue star type; factory stars use the reported ancient-manuscript record
and its assigned structure ID. Their full source narratives are present in all
six `spaceNotificationMessages` catalogues. Cosmic Forge displays these as
blocking popups; MIAPLACIDUS keeps its notification presentation and shows the
localized narrative as a scrollable, non-blocking 20-second notice. The remake
now stores notified O-star system IDs in permanent save state and
marks an ID only after its enabled notice has been enqueued. The marker survives
rebirth and is written immediately through the current save path. Notifications
disabled at arrival are not marked, allowing a later visit to show the narrative.
Schema v49 migrates v48 saves with an empty marker list because v48 did not
record whether an O-star narrative had been delivered; an older save may
therefore show the narrative once after migration. The auto-dismissing notice
tracks delivery, not whether the player read it, unlike the source modal's
Confirm action. Factory assignment already happens when the manuscript reveal
is recorded rather than on arrival.

The source-copy parity unit case passed **14/14**. The installed-Chrome
`@p44-arrival-narratives` browser case passed **1/1** on port 5341, exercising
both arrival branches in all six locales at 320px, including notice scrolling
and no horizontal overflow. Those runs predate the durable marker change; no
test has been run for that change. `npm.cmd run typecheck` passes after it. See the
[Starship browser README](../../../tests/e2e/starship/README.md#p-44-arrival-narratives-10-october-2026).

## P-44 Research and Energy source tooltip crosswalk (10 October 2026)

The source tooltip registry in [`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L510)
contains 21 distinct `infoTooltip*` keys in each of the six locale blocks (126
localized values). None names or describes Science Buildings, Tech Tree, Energy
Summary, Batteries, or Power. The rendered source registry likewise creates no
info control for those five pages. There is therefore no source `infoTooltip*`
key that can be wired into those target screens as an exact tooltip mapping.

| Source key / family | Current MIAPLACIDUS target | Disposition |
| --- | --- | --- |
| No `infoTooltip*` key for Science Buildings | `economyMessages` Science Buildings label and live science-building cards | Source has no matching tooltip. Target presents each building's localized rate, energy use, price, ownership and accessible purchase reason directly in the page. |
| No `infoTooltip*` key for Tech Tree | `TECHNOLOGY_DESCRIPTIONS` node tooltips plus `economyMessages.technologyTreePanHelp` | The node tooltip provides localized per-technology description, cost, prerequisites and status. The page help explains the remake's pan/keyboard interaction; it is not a translation of source help. Both have existing six-locale browser coverage. |
| No `infoTooltip*` key for Energy Summary | Energy Summary page and `generationChartSummary` accessible description in `economyMessages` | Energy Summary is a remake page. Its generated description reports the three plant rates, total generation and consumption, rather than reusing source tooltip copy. |
| No `infoTooltip*` key for Batteries | Battery cards and `economyMessages` purchase reasons | Source has no matching tooltip. The target shows capacity, price and purchase state on each card. |
| No `infoTooltip*` key for Power | Power page, localized plant cards, master switch and status/reason messages | Source has no matching tooltip. The owner-directed remake consolidates source power-plant pages into one Power page. |
| `infoTooltipPhilosophyHeader` | `PhilosophyPane` body: localized path summary, ability and repeatable cards; `philosophyMessages.intro` in the pre-selection state | The longer source tooltip remains adapted across the page's visible intro and path/upgrade cards. The title's accessible info tooltip uses the separate `headerDescPhilosophy` source description, not this longer `infoTooltip*` key. |
| `infoTooltipAutoCreateAllocation` | Resource/Compound allocation, outside this Research/Energy slice | Source key belongs to automated compound allocation, not any of the five audited pages. |

The adjacent source `headerDesc*` family is separate from the tooltip registry:
`headerDescResearch`, `headerDescResearchUpgrades`, `headerDescTechnology`,
`headerDescTechTree`, `headerDescEnergy`, `headerDescEnergyStorage`,
`headerDescPowerPlant`, `headerDescAdvancedPowerPlant`,
`headerDescSolarPowerPlant`, `headerDescSpaceTelescope`, `headerDescMining`,
`headerDescAsteroids`, `headerDescLaunchPad`, `headerDescGalacticCasino`,
`headerDescCosmicRip`, `headerDescSituation`, `headerDescNearSpaceScannerArray`,
`headerDescCosmicRipTab`, `headerDescMegastructures`, and `headerDescPhilosophy`
each exist in all six source locales. These are page/section descriptions distinct from the source
`infoTooltip*` registry;
the remake may present them inline or through an accessible tooltip to fit the
destination page layout.

| Source header description | Current target option | Disposition |
| --- | --- | --- |
| `headerDescResearch` | Research > Science Buildings heading, via `economyMessages.researchSectionHelp` in `EconomyPanes.tsx` | Exact source copy is now available in an accessible `InfoTooltip` beside the Research heading in all six locales; the points and production readouts remain visible below. |
| `headerDescPhilosophy` | Philosophy heading, via `philosophyMessages.headerHelp` in `PhilosophyPane.tsx` | Exact source header-help copy is available in an accessible `InfoTooltip` in all six locales; the target's choice-timing intro remains visible. |
| `headerDescResearchUpgrades` | Research > Science Buildings, via `scienceBuildingsHelp` | The exact Cosmic Forge source copy about buying upgrades to generate RP and unlock technology is wired beneath the page heading in all six locales. |
| `headerDescTechnology`, `headerDescTechTree` | Research > Tech Tree, via `technologyTreePanHelp` | Both source descriptions are merged in source order into one typed help string in all six locales: `headerDescTechnology` first, then the `headerDescTechTree` explanation of visualizing technology benefits and mouse-wheel zoom. Remake-specific keyboard-panning instructions follow. This matches the owner's single consolidated Tech Tree page. |
| `headerDescEnergy` | Energy > Power, via `economyMessages.energyPowerHelp` below the Power heading in `EconomyPanes.tsx` | Exact source text is wired in all six locales to the page where generator upgrades are bought. It belongs to Power, not Energy Summary. |
| `headerDescEnergyStorage` | Energy > Batteries, via `batteryStorageHelp` | The typed six-locale help includes the source guidance, followed by target-specific explanation of storing surplus energy for later use. German is grammatically corrected in the target: `Jedes Gebäude jenseits der ersten Stufe benötigt Energie für den Betrieb; diese Energie kannst du hier speichern. Batterien speichern überschüssig erzeugte Energie und geben sie ab, wenn die Generatoren den Bedarf nicht decken können.` The help appears with the battery cards rather than as a separate page strap. |
| `headerDescPowerPlant` | Energy > Power > Power Plant (`powerPlant1`) card | Exact source string is wired to this card in all six locales. |
| `headerDescSolarPowerPlant` | Energy > Power > Solar Power Plant (`powerPlant2`) card | Exact source string remains wired to this card in all six locales; it explains that solar generation is renewable and uses no resources. |
| `headerDescAdvancedPowerPlant` | Energy > Power > Advanced Power Plant (`powerPlant3`) card | Exact source string is wired to this card in all six locales. |
| `headerDescSpaceTelescope` | Space Mining > Space Telescope title tooltip in `SpaceMiningPane.tsx` | Exact source header copy is shown first in all six locales, followed by target-specific `telescopeDescription` guidance about asteroid searches, star study, and telescope power. |
| `headerDescMining` | Space Mining > Mining title tooltip in `SpaceMiningPane.tsx` | Exact source header copy is shown first in all six locales, followed by target-specific `miningHelp`: the displayed rate includes rockets and megastructures, while holding boost affects rocket mining only. |
| `headerDescAsteroids` | Space Mining > Asteroids title tooltip in `SpaceMiningPane.tsx` | Exact source header copy is shown first in all six locales, followed by target-specific `asteroidsHelp` covering discovered-asteroid details and selecting an available destination. |
| `headerDescLaunchPad` | Space Mining > Launch Pad title tooltip in `SpaceMiningPane.tsx` | Exact source header copy is shown first in all six locales, followed by target-specific `launchPadHelp` for completing rocket parts, choosing an asteroid, and launching from the completed Rocket page. |
| `rocketDescription` | Space Mining > Rocket 1–4 pages, via `rocketMessages.rocketPageDescription` in `SpaceMiningPane.tsx` | The source page description is assigned to each Rocket child page, matching Cosmic Forge's `currentPane.startsWith('rocket')` routing. Its literal “build the launch pad” instruction is stale after entering those pages, so the six-locale target copy explains their live workflow: fuel, launch into orbit, then travel to an available asteroid. Source labels `rocketMinerName1`–`rocketMinerName4` are represented by the target's localized `Rocket {index}` page/card labels; rocket names remain editable. |
| `headerDescGalacticCasino` | Galactic Casino accessible header tooltip in `GalacticCasinoPane.tsx`, before the existing `infoTooltipGalacticCasinoHeader` guidance | `casinoHeaderDescription(locale)` supplies the six-locale static overview. The source's trailing delimiter and dynamic CP balance are omitted; the live CP wallet is shown separately. This is an adapted mapping and is not included in the exact source-string comparison count. |
| `headerDescCosmicRip` | Cosmic Rip page-title `InfoTooltip` via `cosmicRipMessages.headerHelp` | Adapted six-locale greeting preserves the source message while replacing the legacy Cosmic Forger epithet with the canonical Mia'Plac name. |
| `headerDescSituation`, `headerDescNearSpaceScannerArray`, `headerDescCosmicRipTab` | Situation, Scanner Array, and Technologies title tooltips via `situationHelp`, `scannerArrayHelp`, and `technologyHelp` in `CosmicRipPane.tsx` | Their static source descriptions are represented in the matching six-locale tooltips; the dynamic `GP:` suffix is omitted because the live GP wallet is already visible. |
| `headerDescMegastructures` | Megastructures title-side `InfoTooltip` via `megastructureMessages.headerHelp` in `MegastructurePane.tsx` | Exact source copy is present in all six locales; a static comparison against `localization.json` confirmed all six values. |
| `tab9WeatherEffectsRowDescription` | Settings > Visual Options weather-effects checkbox in `SettingsPane.tsx`, via `settingsMessages.ts` | Exact source description is visible below and associated with the checkbox in all six locales. |
| `tab9CustomPointerRowDescription` | Settings > Visual Options custom-pointer checkbox and `InfoTooltip` in `SettingsPane.tsx` | Adapted six-locale source help identifies this as the MIAPLACIDUS mouse cursor; the old Cosmic Forge product name is not carried into the remake. |
| `tab9MouseTrailRowDescription` | Settings > Visual Options pointer-trail checkbox and `InfoTooltip` in `SettingsPane.tsx` | Exact six-locale source help adds that the trail uses mouse particles; the checkbox references the localized copy for assistive technology. |

These rows combine exact localized source-message mappings and intentional
page-structure adaptations. The target exposes the corresponding details in
its cards, node descriptions, live rates, purchase rows, and chart description.
There is no standalone Batteries or Energy Summary source page to map.

Existing focused browser evidence covers the target-native explanatory surfaces:
the Tech Tree node tooltip and localized dynamic costs in
[`e57-tech-tree-tooltip-locale.spec.ts`](../../../tests/e2e/economy/e57-tech-tree-tooltip-locale.spec.ts),
and the Research Points production tooltip across locales in
[`status-bar.spec.ts`](../../../tests/e2e/status-bar/status-bar.spec.ts#L526).
These do not claim exact source-tooltip parity. The new
[`p44-research-philosophy-help.spec.ts`](../../../tests/e2e/economy/p44-research-philosophy-help.spec.ts)
case verifies the adapted Philosophy summary, ability and repeatable content
in all six locales at 320px; it does not claim exact source-copy parity. No new
source-tooltip browser assertion was added for the five named pages because
they have no source tooltip key or matching info control. The focused case
passed **1/1 in 6.5 seconds** on port 5349 after an initial selector correction.
This crosswalk does not close P-44. See the
[Economy browser README](../../../tests/e2e/economy/README.md#p-44-research-and-energy-source-tooltip-crosswalk-10-october-2026).

## P-44 remaining Cosmic Forge `infoTooltip*` inventory (10 October 2026)

The source registry in [`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L510)
contains 21 distinct tooltip keys. This audit covers 13 keys beyond the
previous Starship/Fleet/Colonise mapping and five-page Research/Energy review;
the AutoCreate key previously noted as outside those Research/Energy pages is
resolved here. All 13 keys have non-empty entries in each source locale block
(`en`, `es`, `pt`,
`de`, `it`, `fr`): 78 localized source values. Eleven keys have a source render
callsite; `infoTooltipGalacticCasinoWheelOfFortune` and
`infoTooltipRebirthLiquidation` are registry entries only and are not attached
to a rendered source element.

| Source key | Current MIAPLACIDUS target | Disposition |
| --- | --- | --- |
| `infoTooltipAutoCreateAllocation` | Compound automatic-creation toggle via `economyMessages.autoCreateAllocationHelp` | **Direct source guidance reuse.** The existing helper beside each auto-create checkbox now carries the source rule in all six locales: auto-creation draws only from each ingredient's compound share, which is split among compounds using that ingredient. The separate `allocationHelp` continues to explain slider operation. |
| `infoTooltipStarLegendName` | `starMapMessages.starDataNameHelp` in the Star Data Name column heading in `StarMapPane.tsx` | **Adapted six-locale tooltip.** It explains that the sort menu orders systems alphabetically by star name and the per-row Show on map button opens the map and highlights that system. The source says to click the Name header and globe icon; the target uses an explicit sort menu and a separate map-action column, so the instructions are updated to match current controls. |
| `infoTooltipStarLegendWeather` | Star Data Weather `InfoTooltip`, using `starshipMessages.scanWeatherHelp` | **Consolidated help.** The target text explains prevailing-weather percentages and adds the precipitation-compound detail also present in source `infoTooltipStarShipScanPrecipitation`. A static comparison confirmed the target message exactly matches the longer scan-tooltip source value in all six locales; the shorter legend source text has the same interpretation (Portuguese has a minor phrasing variation). The two source help keys share one target Weather tooltip; there is no weather-help field in the target Colonise report. Existing Star Data tooltip cases assert the rendered target copy; there is no separate Star Legend weather message ID. |
| `infoTooltipStarMapModes` | `StarMapPane.tsx` mode group and `starMapMessages.mapModesHelp` | **Mapped by the 10 October mode implementation below.** The remake has Normal/Distance/Studied/In Range modes with localized guidance, search availability and clearing, studied-node filtering, distance/affordability colors, and UI-local selection. |
| `infoTooltipMiningHeader` | `spaceMessages.miningHelp` beside the Mining title | **Source guidance adapted to current rules.** In all six locales, help explains that the shown rate includes rocket and megastructure output, while holding the boost affects rocket mining only. This corrects the source tooltip's stale claim that megastructure output is omitted from the displayed rate. |
| `infoTooltipLaunchPadHeader` | `rocketMessages.launchPadHelp` beside the Launch Pad title | **Source workflow adapted to current navigation.** In all six locales, help explains completing every rocket part, selecting a destination on Asteroids, and opening a completed Rocket page to launch. |
| `infoTooltipAsteroidsHeader` | Asteroids title tooltip assembled in `SpaceMiningPane.tsx` from `spaceMessages.asteroidsTableHelp`, `asteroidDistanceHelp`, `asteroidComplexityHelp`, `asteroidAntimatterHelp`, and `asteroidsHelp` | **Source guidance mapped with behavior adaptations.** In all six locales, the tooltip explains asteroid status, distance/travel time, complexity, and available antimatter, then adds destination-selection guidance. It omits the unsupported destroyed-asteroid state and explains MIAPLACIDUS's actual base duration (0.5 seconds per 100 distance) instead of Cosmic Forge's 1-second formula. |
| `infoTooltipGalacticCasinoHeader` | `casinoMessages.headerHelpLabel` / `headerHelp` beside the Casino title | **Direct source guidance reuse.** Static comparison confirmed exact source/target string equality in all six locales, including the current-run CP/gambling/reset guidance. `galactic-casino.spec.ts` and `p54-e57-casino-locale-context.spec.ts` assert the visible localized help, with the six-locale/theme case also checking its viewport bounds. |
| `infoTooltipGalacticCasinoWheelOfFortune` | `casinoMessages.specialReady` and `choosePrize` in the special-prize claim state | **Source key is not rendered.** The source has no element with the registered key's ID outside `descriptions.js`. In the target, the prize selector only appears after a special win, so the condition is communicated by the state and control; no separate help text is shown. |
| `infoTooltipRebirthLiquidation` | `marketText(locale, "liquidationHelp")` on the Galactic > Rebirth liquidation card in `AssetLiquidationCard.tsx`; live preview and confirmation remain in `metaMessages.ts` | **Adapted six-locale calculation help; source key has no render callsite.** The accessible tooltip explains current per-unit resource/compound sale values, cash at one tenth of face value, division by the current price to buy 1 AP, and rounding down. This preserves the source's useful valuation guidance while omitting its obsolete claim that the AP price fluctuates every 2–4 minutes. The six-locale E-57 Market/Rebirth case checks the preview and dialog. |
| `infoTooltipCosmicRipHeader` | `cosmicRipMessages.introduction`, status/stability, technology cards, and next-objective text | **Guide distributed into the staged page.** The target communicates current state, costs, durations, and objective beside the relevant controls rather than showing the source's long title tooltip. The target introduction is a short narrative, not a sentence-level translation of the source guide. |
| `infoTooltipNearSpaceScannerArrayHeader` | `cosmicRipMessages.scannerArrayTitle`, `scanInstruction`, sector labels/costs, and telemetry-network upgrade cards | **Mechanic adapted.** Scanning and the per-sector GP cost are explicit in the target. The source's science-vessel telemetry step is replaced with Sensor Buoy/Rip Research Orbiter network upgrades; no source-equivalent science-vessel control exists. |
| `infoTooltipSituationHeader` | `cosmicRipMessages.situationTitle`, status/stability readouts, scan state and localized next objective; `closeRip` is on the separate Cosmic Rip child page | **Page ownership adapted.** Situation presents status and next action. The final close control lives on the Cosmic Rip page, so the source phrase that this screen is where the player ends the game is not literally carried over. |

Source callsites were checked in `game.js`, `drawTab5Content.js`,
`drawTab6Content.js`, `drawTab7Content.js`, and `drawTab8Content.js`; the two
registry-only keys above have no rendered ID. Current target paths are six-
locale typed in their owning catalogues. Existing locale evidence is linked in
the [Economy](../../../tests/e2e/economy/README.md#p-44-auto-creation-allocation-source-tooltip-disposition-10-october-2026),
[Star Map](../../../tests/e2e/star-map/README.md#p-44-star-data-help-inventory-10-october-2026),
[Space Mining](../../../tests/e2e/space-telescope/README.md#p-44-space-mining-header-help-inventory-10-october-2026),
[Casino](../../../tests/e2e/galactic-casino/README.md#p-44-casino-help-inventory-10-october-2026),
[Market](../../../tests/e2e/galactic-market/README.md#p-44-liquidation-help-disposition-10-october-2026),
and [Cosmic Rip](../../../tests/e2e/cosmic-rip/README.md#p-44-cosmic-rip-help-inventory-10-october-2026)
READMEs. Static source/target comparisons were run for the long Casino header
help and weather/precipitation copy. The existing focused installed-Chrome
Star scan-tooltip and Casino header-help cases were rerun and passed 1/1 each:
19.6 seconds on port 5455 and 13.8 seconds on port 5456. Both cases exercise
the target copy across all six locales; the Casino case also covers themes. The
10 October Space Mining implementation adds three six-locale title tooltips
adapted to the current Mining, Launch Pad, and Asteroids workflows; typecheck
and focused formatting passed, and no tests were run. At the time of this
inventory, `infoTooltipStarMapModes` was recorded as unmapped; the Star Map
mode implementation below now maps it. Cosmic Rip's long guides are still
distributed through its staged page. The Name guide now has a six-locale
tooltip beside the target's Name column that explains its explicit sort menu
and map buttons; the two registry-only entries are documented as not rendered
by the source. Keep P-44 open.

**P-44 Save/Import generic failure wording (10 October 2026):** `errGeneric` is
also used for not-found and other Save Manager operations such as rename/delete.
Its six-locale fallback now says the action could not be completed and invites
retry, without incorrectly implying that an import code is still available.
The source cloud-save/no-save-data notices have no local-save equivalent. No
tests were run.

**P-44 Save import application feedback (10 October 2026):** Cosmic Forge's
`notificationErrorInitializingGame` has a distinct import/application failure
message after code decoding. MIAPLACIDUS now has six-locale `errImport` feedback
for unexpected failures while applying an import as a new local save or
replacing a matching save. Typed `SaveError` cases still retain their specific
quota, conflict, name, and validation messages. The wording is adapted to local
save import, with no cloud or account behavior. Typecheck and focused formatting
passed; no tests were run. The broader Save/Import catalogue crosswalk remains
open.

### P-44 remaining Save/Import action-copy review (11 October 2026)

A source-callsite and live-target comparison of the local Save Manager's
remaining visible copy found no additional missing message mapping. The
in-scope copy is accounted for as follows:

| Cosmic Forge source family | MIAPLACIDUS target | Disposition |
| --- | --- | --- |
| `tab9AutoSaveRowLabel`, the four `dropdownAutoSave*` values, `notificationAutoSaveOff` | `autoSave`, owner-selected `every5Minutes` / `every15Minutes` / `every30Minutes` / `everyHour`, and `autoSaveDisabledWarning` | The label and warning are localized; interval choices intentionally follow the owner's requested set. |
| `tab9ExportSaveRowLabel`, `placeholderExportSaveArea`, `buttonExport`, `buttonManualSave` | `export`, generated read-only portable code, `copy`, and `download` | Adapted to local portable-save export; no source prompt is needed for the generated code. |
| `tab9ImportSaveRowLabel`, `placeholderImportSaveArea`, `buttonImport`, `buttonManualLoad` | `import`, `importText`, `preview` then `applyImport`, and `file` | Adapted to local code/file preview and explicit confirmation. |
| `notificationInvalidSaveString`, `notificationErrorLoadingSaveString`, `notificationErrorInitializingGame`, `notificationGameLoadedSuccessfully` | `errEmpty` / `errFormat` / `errCode`, `errCode` / `errIntegrity` / `errGeneric`, `errImport`, and `imported` | Split by the remake's local validation, decode, apply, and success states. `notificationErrorInitializingGame` maps to `errImport`, correcting the stale `errGeneric` disposition above. |

The onboarding save lock, missing export payload, unavailable compression,
demo save refusal, and old-Cosmic-Forge-schema warning have no equivalent
runtime condition under the local-save/migration contract. Cloud-only notices
remain excluded as already recorded in the Save/Import crosswalk. Clipboard,
quota/conflict, generic fallback, reset, and deletion items are outside this
slice. No code change was warranted. No tests or browser runs were performed;
P-44 remains open.

**P-44 local save deletion confirmation (10 October 2026):** source
`notificationHardResetComplete` follows the destructive reset action. MIAPLACIDUS
now carries adapted completion feedback to pioneer selection after deleting the
active local save, confirming that the same pioneer name can start a new game.
The notice is localized in all six locales. The local per-slot delete and return
flow remain intact; no cloud reset or browser refresh is added. Typecheck and
focused formatting passed; no tests or browser runs were performed.

**P-29 battle loss audio cadence (11 October 2026):** the audio adapter queues
one randomized explosion cue per confirmed ship loss, paced at the source's
>140 ms cooldown. The first cue plays on the casualty event; remaining cues now
drain after the final round resolves rather than being cut off by the battle
result. Mute, zero volume, focus loss, and disposal still clear the queue. Exact
per-impact timestamps remain unavailable in the remake's aggregate battle
event model; a large final batch can therefore leave a longer cue tail than
Cosmic Forge's callback throttle. The unsupported separate battle-finished
explosion cue was removed. No tests were run for the final-round queue-drain
correction.

**P-36 progression tutorial expansion (10 October 2026):** the optional,
per-pioneer tutorial now covers Hydrogen collection, sale, and autobuying;
Science Kit production/pause/resume and the Research rate; Hydrogen storage;
the consolidated Tech Tree; Visual/Game Options; and Miaplaedia Get Started,
Story, Early Concepts, Mid Game Concepts, and Late Game Concepts. It retains the
existing step IDs and adds `sellHydrogenAction` after the persisted
`sellHydrogen` stock gate; skip/resume state and schema v48 migration continue
to suppress prompts for existing saves. No tests were run. Keep P-36 open:
source Knowledge Sharing assumes a separate Technology page and 150 RP, and the
remaining source wait/quantity gates need review against the remake's flow.

**P-20 discrete timer-route audit (10 October 2026):** survey, star study, void
pillage, rocket/starship travel, battle, and Black Hole charge outcomes already
route through localized global polite notifications. Adverse weather changes
are announced; ordinary weather cycles remain silent to avoid progress chatter.
No code change or test run was needed. Actual spoken screen-reader output and
the remaining purchase-failure routes still require validation.

**P-36 tutorial implementation update (10 October 2026; supersedes the earlier Knowledge Sharing disposition below):** the optional
per-pioneer tutorial now uses source-aligned milestones of 50 Hydrogen and 3
Science Kits. Its localized `researchKnowledgeSharing` step opens the remake's
consolidated Tech Tree. The persisted `sellHydrogen` step waits until Hydrogen
stock reaches 300 and auto-advances. The new `sellHydrogenAction` step advances
only on an actual manual Hydrogen `resource.sold` event tagged `manual`; an
automatic sale tagged `automatic` does not satisfy it. A localized CASH
explanation follows. Tutorial completion emits `onboarding.completed`, so the
existing tutorial-completion achievement can trigger. Active tutorial content
is in a polite live region. Continue stays disabled until the current step's
source wait/action milestone or required destination is satisfied; native tab
navigation counts as visiting the requested destination. The 300-Hydrogen
wait/manual-sale flow, source action/quantity gates, and destination gate are
implemented but untested. Skip exits the tutorial. No browser, unit, or
assistive-technology spoken-output checks were run, and the full source timing
sequence still needs an end-to-end review. Keep P-36 open.

**P-36 timed explanations and source actions (10 October 2026):** tutorial steps for Cash, Research rate, Hydrogen storage, Tech Tree, Science Club, Visual Options, Audio Options, and selected Miaplaedia guides now require the requested page to remain open for the source-aligned 3-4 second reading interval before Continue unlocks. The Audio Options action advances to a persisted reading step only after an actual Background audio toggle; returning to Game Options starts its 4-second explanation interval again. After the Hydrogen storage purchase, a 3-second page-open step explains the doubled capacity and how AutoBuyers refill it. After Knowledge Sharing is researched, a new Science Club step points to the Research buildings page and explains its starting 200 Cash price and 8 RP/s output. The Visual Options sequence asks the player to select the Dark theme and advances when `settings.themeId` becomes `dark`; Skip remains available. The waiting hint and Dark-theme prompt are localized in all six locales. Typecheck and formatting passed. No unit, browser, or assistive-technology tests were run; keep P-36 open for the final full tutorial review.

**P-36 standalone AutoBuyer prompt (10 October 2026):** source review found one separate timed spotlight after storage is expanded and before the 300-Hydrogen milestone: Cosmic Forge `onboarding.js` prompts the player to click Gain to help the AutoBuyer along. The remake now inserts the equivalent three-second Resources page-open/read-gated step between `confirmHydrogenStorageUpgrade` and `sellHydrogen`, localized for all six languages using the remake's Collect wording. The storage explanation no longer repeats the manual-collection advice. Formatting and typecheck passed; no tests were run. P-36 remains open for full tutorial-flow and assistive-technology review.

**P-20 named Random Event expiry notices (10 October 2026):** timer-end events now retain their target ID through the engine event boundary. The localized completion notice names the repaired rocket and restored good for Miner Breakdown and Supply Chain Disruption, matching Cosmic Forge's named variants; generic fallback remains available for old or missing targets. Notification class/type/duration and the notification preference gate are unchanged. Unit assertions were updated but not run; typecheck and formatting passed. Spoken assistive-technology verification remains open.

**P-51 navigation-label spacing (10 October 2026):** an existing Spanish Terminal Miaplaedia capture showed NEW attention pills crowding localized navigation labels. `.attention-badge` now adds 0.3rem of logical inline-start spacing. No screenshot was regenerated; keep this change unverified and P-51 open.

## P-44 Star Map display-mode crosswalk (10 October 2026)

Cosmic Forge's Star Map controls and mode help are in
`cosmicForge/cosmicForge/drawTab5Content.js:286–379`; mode changes, search
availability/clearing, node filtering, and color selection are in
`cosmicForge/cosmicForge/ui.js:6183–6470`. MIAPLACIDUS implements the same four
named modes in `src/app/StarMapPane.tsx`, localized controls and mode help in
`src/i18n/starMapMessages.ts`, and theme-aware colors in `src/styles.css`.

- **Normal:** shows the full starfield, including unstudied stars; search is available.
- **Distance:** shows the full starfield; studied nodes are colored by relative distance, with the farthest at the red-disabled endpoint; search is available.
- **Studied:** filters out unstudied nodes and clears/disables search.
- **In Range:** filters out unstudied nodes and clears/disables search; a destination beyond current Antimatter is red-disabled, while an affordable destination is green-ready. Current, settled, and orbiting-destination status styling is retained.

Mode selection is held in `StarMapPane` React component state (`useState`), not
in engine state or the save. Selecting Studied or In Range clears the query; the
search input is disabled in both modes. The help is localized in all six
locales and maps source `infoTooltipStarMapModes` to the target mode group.

The implementation agent reported typecheck, formatting, and diff checks passed.
No browser or unit tests were run, so the UI behavior remains unverified. This
closes the Star Map mode mapping gap only; P-44 remains open for the remaining
source catalogue crosswalk.

**P-44 Solar Power Plant source explanation (10 October 2026):** `headerDescSolarPowerPlant` now appears as an inline card explanation on the consolidated Energy > Power screen. It preserves the source statement that solar plants provide renewable energy without using resources, localized in all six languages; the other generator-page straps remain represented by the consolidated live cards. Typecheck and formatting passed; no tests were run. P-44 remains open for the rest of the catalogue crosswalk.

**P-44 Galactic Casino Higher/Lower cards (11 October 2026):** visible cards now use the source-style rank plus suit glyphs, with separate accessible card names localized across all six languages. `oxfmt` and `npm.cmd run typecheck` passed; no tests were run. P-44 remains open for the remaining source catalogue crosswalk.

### P-44 Economy sale-selector stock-label crosswalk (11 October 2026)

The dropdownOptionAllStock catalogue key now maps to the distinct typed allStock
value in all six catalogues. All four Resource/Compound sale selectors use it
for the source-matched 75%, 67%, 50%, and 33% stock options. The separate
sellAll button key remains unchanged. No tests were run. P-44 remains open for
the remaining catalogue crosswalk.

### P-44 Research science-building explanation crosswalk (11 October 2026)

Cosmic Forge source `headerDescResearchUpgrades` explains that buying upgrades
generates RP used to unlock new technology. The typed `scienceBuildingsHelp`
copy beneath the Research > Science Buildings heading now uses that exact
source text in all six locales. This replaces the previous adapted-copy
disposition. Typecheck and formatting passed; no tests were run. P-44 remains
open for the remaining catalogue crosswalk.

### P-44/P-45 localized label and action-fallback follow-up (11 October 2026)

The local Save Manager roster now uses the dedicated typed `otherPioneers`
label ("Other saved pioneers" in English) for its heading and accessible name,
with values in all six locales. Energy > Batteries now includes the source-
backed `batteryStorageHelp` explanation in all six locales: batteries keep
surplus generated energy available when generators cannot meet demand. The
Spanish Cosmic Rip tab label is now `Desgarro Cósmico`.

For shared actions, unrecognized failure keys now resolve to localized generic
action-unavailable copy. Space Mining also maps unknown or unsupported failure
keys to its own localized generic action-unavailable message; known failure
reasons keep their specific localized copy. Its disabled-action helper now also
uses localized generic copy for unmapped precondition failures, with invalid
selection explicitly mapped to its specific reason in all six locales. These
fallbacks prevent internal message keys from reaching the player. Formatting
and `npm.cmd run typecheck` passed; tests remain deferred. P-44 and P-45 remain
open for their broader source catalogue and visible-copy reviews.

### P-44 Energy generator-card source descriptions (11 October 2026)

The Power page now wires the exact localized Cosmic Forge source descriptions
to their corresponding cards: `headerDescPowerPlant` to Power Plant
(`powerPlant1`), `headerDescSolarPowerPlant` to Solar Power Plant
(`powerPlant2`), and `headerDescAdvancedPowerPlant` to Advanced Power Plant
(`powerPlant3`). The three descriptions are present in all six locales. This
preserves the consolidated Power page while assigning each source explanation
to its matching generator card. Formatting and `npm.cmd run typecheck` passed;
no tests were run. P-44 remains open for the remaining source-catalogue
crosswalk.

### P-36/P-44/P-45 implementation update (11 October 2026)

During a minimum-read tutorial step, changing locale now restarts the timed
reading gate in `ProgressionTutorial.tsx`, so the newly displayed translation
receives its full interval. The source-sequence and migration audit found no
other concrete implementation gap.

Galactic Market now has typed trade-bias/outlook help in `marketMessages.ts`,
localized in all six supported languages and wired as an accessible tooltip in
`GalacticMarketPane`; the new catalogue is registered with global localization
validation. Its source references are
[`descriptions.js:602-610`](../../../../cosmicForge/cosmicForge/descriptions.js#L602)
and [`ui.js:8978-9040`](../../../../cosmicForge/cosmicForge/ui.js#L8978).
The existing Galactic Market page description now reuses source
`headerDescGalacticMarket` verbatim in all six locales through
`marketText(locale, "description")` in `GalacticMarketPane` (`metaMessages.ts`),
replacing the previous target-only strap. Source values are in
`localization.json` at lines 97, 2720, 5343, 7966, 10589, and 13212.
Italian `advancedPowerPlantHelp` agreement is corrected to `molti macchinari`.
Cosmic Rip closing text now preserves the exact source outcome in `en`, `es`,
`pt`, `de`, `it`, and `fr`, removing only the legacy player epithet. Typecheck
and formatting have since passed after localization-validator registration;
the separate localization-validation command remains pending. No tests were
run; they remain deferred. P-36, P-44, and P-45 remain open.

### P-44 Energy overview description mapping (11 October 2026)

`headerDescEnergy` is now mapped exactly in all six locales to
`economyMessages.energyPowerHelp`, wired below the Power heading in
`EconomyPanes.tsx`. Power is where generator upgrades are bought, so the source
description belongs there rather than on Energy Summary. Typecheck and
formatting passed; no tests were run. P-44 remains open.

### P-44 Tech Tree help mapping (11 October 2026)

Source `headerDescTechnology` and `headerDescTechTree` now map in source order
to the same typed `technologyTreePanHelp` string in all six locales on Research
> Tech Tree. The technology-unlock description comes first, followed by the
visualization and mouse-wheel zoom explanation, then remake-specific keyboard-
panning instructions. This matches the owner's single consolidated Tech Tree
page and supersedes the previous omission/adaptation dispositions. Typecheck
and formatting passed; no tests were run. P-44 remains open.

### P-45 Casino result-copy crosswalk (11 October 2026)

The visible outcome and recent-history copy was checked against Cosmic Forge
`casino.js` and localized across all six supported languages:

| Source outcome/data | MIAPLACIDUS presentation | Copy mapping |
| --- | --- | --- |
| Wheel doubled-good prize | Wheel claim notice | Localized notice names the doubled amount and good. |
| Rocket-warp prize | Wheel notice and recent history | Rocket base and asteroid names are shown as localized names rather than raw result codes. |
| Recent Casino history | Outcome, prize, and star-clue details | Each value is translated into player-facing text; internal result codes are not displayed. |

Starship and Rocket warp notifications now use grammatical full-message
templates in all six languages. Default Rocket names are localized without
duplicating the default name; custom names remain intact.

`oxfmt`, typecheck, and the scoped diff check passed. No tests were run. P-45
remains open for broader visible-copy review.

### P-44 Interstellar and Space Mining heading/help audit (11 October 2026)

Star Map, Star Data, Space Mining, Asteroids, Space Telescope, and Launch Pad
headings/help were checked against Cosmic Forge in all six locales. The only
clear translation flaw found was German Space Telescope `Umfragen`, corrected
to `Untersuchungen` in `spaceMessages.ts`. No translation-driven pane rewiring
was needed at that time. A later Star Map/Star Data header-help implementation
is recorded in the crosswalk below. No tests were run; P-44 remains open.

### P-44 Batteries help crosswalk update (11 October 2026)

`batteryStorageHelp` now includes the source `headerDescEnergyStorage` guidance
in all six locales, followed by the target-specific explanation of battery
surplus/storage use. German now renders the corrected grammar:
`Jedes Gebäude jenseits der ersten Stufe benötigt Energie für den Betrieb; diese Energie kannst du hier speichern. Batterien speichern überschüssig erzeugte Energie und geben sie ab, wenn die Generatoren den Bedarf nicht decken können.`
Root reported `oxfmt`, typecheck, and scoped diff-check passed; no tests were
run. P-44 remains open.

### P-45 Interstellar localized feedback crosswalk (11 October 2026)

The six-locale feedback audit covered Star Map destination errors, Star Study
notices, Starship launch/scan/arrival notices, and settlement outcomes. It found
no other clear raw-ID leak or translation issue.

| Feedback surface | Localization update | Result |
| --- | --- | --- |
| Settlement action and completion | `starshipMessages.ts` now uses explicit colonization wording in Spanish, Portuguese, and Italian. | The action/completion text describes settling a system rather than using ambiguous wording. |
| Blocked settlement | Feedback now includes the system name in Spanish, Portuguese, German, Italian, and French. | The player can identify which system could not be settled. |
| Star Map destination errors, Star Study, and Starship launch/scan/arrival | Audited across all six locales. | No other clear raw-ID or translation issue was found. |

`oxfmt` and typecheck passed; no tests were run. P-45 remains open.

### P-44 Galactic Market accepted-trade notification (11 October 2026)

| Cosmic Forge source key | MIAPLACIDUS target | Mapping |
| --- | --- | --- |
| `notificationTradedForCommission` | `marketText(locale, "tradeCompleteNotification")` after an accepted trade | Exact source copy in all six locales. |
| `notificationGalacticMarketOffline` | `marketOfflineNotificationText` | Exact source copy in all six locales. `MARKET_OFFLINE_NOTIFICATION_COPY` is registered in `metaMessages.LOCALIZATION_VALIDATION_DATA` so it participates in global localization validation. |

The offline-copy validation registration is a code change in `metaMessages.ts`;
typecheck and formatting are pending rerun after that integration. No tests were
run. P-44 remains open.

### P-45 Black Hole and Cosmic Rip source-copy audit (11 October 2026)

| Surface | Source/remake mapping | Result |
| --- | --- | --- |
| Black Hole maximum-upgrade feedback | `black-hole-upgrade-maxed` in all six locales | Copy now states that the upgrade is at its maximum level, replacing the misleading “source limit” wording. The engine emits this reason when duration/recharge reaches its cap. |
| Cosmic Rip scan/result feedback | Localized scan and result messages plus all failure-code mappings | Copy aligns with Cosmic Forge and every failure code is covered; the audit found no code change necessary. |

`oxfmt`, typecheck, and scoped diff-check passed; no tests were run. P-45
remains open.

### P-45 Startup and Save/Import localization audit (11 October 2026)

The startup/save picker, import/export, and error/recovery copy was audited in
all six locales against matching Cosmic Forge concepts while retaining the
remake's local-only saves. German `saveMessages.export` now reads
`Übertragbarer Spielstandcode` rather than `Mobiler Spielstandcode`, correctly
describing a portable transfer code. The other sampled messages were fully
localized, with no raw IDs or clear meaning gaps found. `oxfmt` and typecheck
passed; no tests were run. P-45 remains open.

### P-44 Black Hole header-description crosswalk (11 October 2026)

| Cosmic Forge source | MIAPLACIDUS target | Mapping |
| --- | --- | --- |
| `descriptions.js` `headerDescBlackHole` header description | Accessible title-side `InfoTooltip` in `BlackHolePane.tsx`, using `blackHoleMessages.ts` | Exact source copy in all six locales; the Black Hole discovery introduction remains. |

Typecheck and focused Oxfmt passed; no tests were run. P-44 remains open.

### P-44 Research and Galactic Market calculation help (11 October 2026)

The Research > Science Buildings heading now has an accessible tooltip using
the exact `headerDescResearch` source copy in all six locales. The Galactic >
Rebirth liquidation card now has an accessible tooltip explaining the live
valuation formula in all six locales: resources and compounds use current
per-unit sale values, cash counts at one tenth, and the total is divided by
the current price to buy 1 AP and rounded down. The source's rate-cadence
claim is intentionally omitted. No tests were run. P-44 remains open pending
end-stage verification; neither tooltip closes the ticket.

**P-20/P-29 implementation audit:** the bounded implementation pass found no
safe additional code-only gap. P-20 still needs spoken assistive-technology
verification and remaining purchase-failure route review. P-29 still needs
focused verification of the battle-loss queue and its battle-finish cancellation;
source-exact individual impact timing remains unrepresentable with aggregate
battle events.

### P-44 Achievements and Philosophy header help (11 October 2026)

The exact source `headerDescAchievements` and `headerDescPhilosophy` copy is
now available through accessible title-side `InfoTooltip`s in all six
locales, using `achievementMessages.ts` and `philosophyMessages.ts`. The
target-specific Achievements and Philosophy page introductions remain. P-44
is open pending end-stage verification; no tests were run.

### P-44 Star Map and Star Data header-help crosswalk (11 October 2026)

| Cosmic Forge source key | MIAPLACIDUS target | Mapping |
| --- | --- | --- |
| `headerDescStarMap` | `starMapMessages.mapHeaderHelp` in `StarMapPane.tsx` | Exact source overview copy is available in an accessible title-side `InfoTooltip` in all six locales; the actionable map description remains. |
| `headerDescStarData` | `starMapMessages.dataHeaderHelp` in `StarMapPane.tsx` | Exact source overview copy is available in an accessible title-side `InfoTooltip` in all six locales; the actionable Star Data description remains. |

No tests were run. P-44 remains open pending end-stage verification.

### P-45 Navigation-label encoding fix (11 October 2026)

Literal `?` corruption is fixed in the Portuguese `News & Events` label and
the French `News & Events` and `Achievements` labels (`tab.metaJournal` and
`tab.achievements` in `src/i18n/messages.ts`). P-45 remains open pending full
route review and end-stage verification. No tests were run.

### P-44 Ascendency, Rebirth, and Cosmic Rip source-help mapping (11 October 2026)

| Cosmic Forge source key | MIAPLACIDUS target | Mapping |
| --- | --- | --- |
| `headerDescAscendencyPerks` (`descriptions.js:3863-3866`) | `metaMessages.perksOverview` in `AscendencyPane.tsx` | Exact six-locale overview in an accessible title-side `InfoTooltip`; omit the dynamic AP tail because the live AP balance is already visible. |
| `headerDescRebirth`, `headerDescRebirthMega` (`descriptions.js:479-481`) | `metaMessages.rebirthOverview` / `rebirthMegastructureOverview` in `AscendencyPane.tsx` | Select the mega variant when the current system matches a recorded factory system; its accessible tooltip keeps the shared overview first, then renders the disconnect-before-rebirth requirement in a separate `orange-warning-text` span. `InfoTooltip` accepts ReactNode content; dynamic wallet suffixes are omitted. |
| `modalRebirthHeader`, `modalRebirthText` (`localization.json:145-146`) | `rebirthText(locale, "title" / "prompt")` and `rebirthCarryText` in `AscendencyPane.tsx` | Already represented in the native confirmation dialog across all six locales. The reset warning, explicit confirmation question, and live AP carryover sentence match the source; its markup paragraphs are split into semantic text nodes. MIAPLACIDUS additionally reports the 1 GP earned when Cosmic Rip is unlocked. |
| Cosmic Rip Situation, Scanner Array, and Containment Research header help | `cosmicRipMessages.ts` in `CosmicRipPane.tsx` | Localized contextual title-side tooltips are adapted from source help; the greeting uses canonical Mia'Plac and the dynamic GP suffix is omitted because GP is already in the live wallet. |

No tests were run. P-44 remains open pending end-stage verification.

### P-44 Resources and Compounds overview-help crosswalk (11 October 2026)

| Cosmic Forge source key | MIAPLACIDUS target | Mapping |
| --- | --- | --- |
| `headerDescResources` plus item keys `headerDescHydrogen`, `headerDescHelium`, `headerDescCarbon`, `headerDescNeon`, `headerDescOxygen`, `headerDescSodium`, `headerDescSilicon`, and `headerDescIron` | Group help in `economyMessages.resourcesOverviewHelp`; Hydrogen custom markup in `App.tsx`; the other seven pages use `ResourceHeroCard` in `EconomyPanes.tsx` | Group and item copy are verbatim source text from `localization.json`; each item has its own accessible title-adjacent `InfoTooltip` in all six locales. Hydrogen uses custom markup; the other resource pages use `ResourceHeroCard`. |
| `headerDescCompounds` plus item keys `headerDescDiesel`, `headerDescGlass`, `headerDescSteel`, `headerDescWater`, `headerDescConcrete`, and `headerDescTitanium` | Group help in `economyMessages.compoundsOverviewHelp`; item titles use `CompoundCard` in `EconomyPanes.tsx` | Group and per-compound copy are verbatim source text from `localization.json`; each item description is the second paragraph of its accessible title-adjacent `InfoTooltip` in all six locales. |
| `headerDescResources`, `headerDescCompounds`, `headerDescResearch`, `headerDescEnergy`, `headerDescSpaceMining`, `headerDescInterstellar`, `headerDescGalactic`, and `headerDescSettings` | Matching top-level tabs | Localized descriptions are attached to the corresponding tab with `title` and `aria-description` in all six locales. Resource/Compound item descriptions remain in their respective page title tooltips. |
| Cosmic Rip overview in `cosmicRipText` | Cosmic Rip top-level tab | Reuses the existing canonical Mia'Plac adapted source help; the legacy Cosmic Forger name is not restored. |
| `headerDescEvents` | Settings > Events title-side `InfoTooltip` in `MetaJournalPane.tsx`, using `economyMessages.ts` | Verbatim source description in all six locales; the intro strapline was removed per owner direction. |

Exact localized-source comparison passed for 180 strings across six locales, including the 24 Space Mining, six Megastructures, six Weather Effects, and six Pointer Trail row-description values. The adapted Casino header description and adapted Custom Pointer text are documented separately and excluded from that exact-string count.
The tooltips add no straplines or layout-panel changes beyond the owner-directed
removal of the Events intro. Oxfmt, typecheck, and scoped diff-check passed; no
tests were run. P-44 remains open pending end-stage verification.

### P-55 Total Consumption source-parity update (11 October 2026)

The Statistics row now uses `statisticsConsumptionPerSecond` for source-style
active load, independently of whether the power grid is on. Operational
`demandPerSecond` remains grid-gated for simulation. No tests or browser runs
were done; the existing E2E oracle still compares the row to
`demandPerSecond` and remains pending the final regression pass. P-55 stays
open; estimates are unchanged.

### P-44 Settings row-description disposition update (updated 12 October 2026)

Mapped Cosmic Forge `tab9WeatherEffectsRowDescription` to the corresponding
Settings > Visual Options checkbox. `settingsMessages.ts` supplies the exact
localized source sentence in all six locales; `SettingsPane.tsx` renders it
below the checkbox and associates it with the input using `aria-describedby`.
`tab9MouseTrailRowDescription` now has the exact source explanation in an
accessible tooltip and a screen-reader description for its checkbox.
`tab9CustomPointerRowDescription` has a localized tooltip adapted to identify
the MIAPLACIDUS mouse cursor without retaining the Cosmic Forge name. Pointer
Trail adds six exact localized values. A 12 October renderer-by-renderer review
found that seven descriptions previously classed as omissions already render
the exact source text in the target catalogues: language, theme, notation,
notifications, News Ticker, background audio, and SFX. Their visible
descriptions are associated with the corresponding controls using
`aria-describedby`; their source-to-target key and control mapping is in the
Settings crosswalk above. These seven keys add 42 exact localized source values,
bringing the recorded exact-source count to 222. The adapted Custom Pointer
values remain excluded from the exact count. No tests or browser runs were
performed, and P-44 remains open.

### P-44 Star Data Name help adaptation (11 October 2026)

Cosmic Forge `infoTooltipStarLegendName` explains alphabetical sorting from
the Name heading and using the adjacent globe icon to show a star on the map.
The target Star Data table instead has a sort menu and a separate Show on map
column. `starMapMessages.starDataNameHelp` now explains those actual controls
in all six locales, and an accessible `InfoTooltip` appears beside the Name
column heading in `StarMapPane.tsx`. The help is adapted because verbatim
“click the Name heading”/globe instructions would be incorrect for the target.
Typecheck and formatting passed; no tests or browser runs were performed.
P-44 remains open.

### P-44 Star Data settled-status source copy (11 October 2026)

| Cosmic Forge source key | MIAPLACIDUS target | Mapping |
| --- | --- | --- |
| `textSettled` | `starMapMessages.settled` in the Star Data name, Distance, and Antimatter columns in `StarMapPane.tsx` | Settled rows now appear after unsettled rows while preserving the selected sort within each group, at 50% opacity and in themed `--star-color-settled`. Distance and Antimatter display the source's localized Settled label; Weather, Precipitation, and AP are blank. Unsettled weather symbols and percentages remain unchanged. The remake's existing Show on map and Set destination controls are preserved on settled rows; no new engine gate was added. |

The adjacent Star Map copy in this inspected slice has explicit dispositions:
`placeholderSearchStar`, `placeholderSearchModeUnavailable`, and
`textNoMatches` map to the typed search placeholder, unavailable-mode message,
and no-match status, with the remake adding its two-character search guidance.
`tooltipShowStarOnMap` maps to the visible and accessible Show on map button;
another tooltip would repeat its label and the Name-column help. The source
`notificationStarNotFoundOnMap` is not needed: target map actions come from
existing Star Data rows and select from that shared Star Catalogue, so there is
no missing-star result path. Typecheck and formatting passed; no tests or
browser runs were performed. P-44 remains open.

### P-44 Galactic Casino purchase-description crosswalk (11 October 2026)

| Cosmic Forge source key | MIAPLACIDUS target | Mapping |
| --- | --- | --- |
| `galacticCasinoPurchaseCpContent1` (`descriptions.js:1697`) | `casinoMessages.description`, rendered below the Galactic Casino page title in `GalacticCasinoPane.tsx` | Adapted in all six locales: the intro explicitly says Casino Points can be bought with resources or compounds, preserving the source's purchase guidance while retaining the target's four-games overview. |

The previous English, Spanish, Portuguese, and Italian target descriptions said
only “resources” even though the purchase control accepts compounds too. The
six-locale copy now names both valid payment groups; German's generic
`Vorräte` is replaced with the direct term `Ressourcen`, and French preserves
its existing formal address. This is a target-position adaptation of the
source purchase-row text, not an exact-string match. No tests or browser runs
were performed; P-44 remains open.

### P-44 Black Hole instability end-notice crosswalk (11 October 2026)

| Cosmic Forge source key | MIAPLACIDUS target | Mapping |
| --- | --- | --- |
| `modalEventBlackHoleInstabilityEndedText` | `randomEventEndNotificationMessages.ts` `blackHoleInstability`, delivered by `randomEventEndNotifications.ts` on `random-event.ended` | Adapted into the existing informational toast in all six locales. It preserves the source's singularity returning to equilibrium and Black Hole strength/duration returning to standard, while removing source `<br>` and green-ready markup for the one-line toast. |
| `modalEventBlackHoleInstabilityEndedHeader` | No separate toast heading | The target uses a single informational notification; the body identifies the Black Hole and reports the restored state. A second heading would repeat it. |

The source ended-text key has no dynamic placeholders. The focused unit
expectation now reflects the English toast text; no tests or browser runs were
performed. P-44 remains open.

### P-44 Miaplacidus force-field completion copy (11 October 2026)

| Cosmic Forge source key | MIAPLACIDUS target | Mapping |
| --- | --- | --- |
| `textCanMoveToMiaplacidus` (`cosmicForge/cosmicForge/ui.js:1363-1364`, localized in `localization.json`) | `megastructureMessages.forceFieldCleared`, rendered in `MegastructurePane.tsx` when `miaplacidusForceFieldLevel(state) >= 4` | Exact source sentence in all six locales, preceded by the remake's live 4/4 force-field progress. The completed state now tells the player they can move to Miaplacidus instead of repeating the already-satisfied requirement to complete all four structures. |

The incomplete state retains `megastructureMessages.forceField` and its actionable stage-3 requirement. Existing exact-copy expectations were updated to select the completion or incomplete message from the same force-field level. No tests or browser runs were performed; P-44 remains open.

### P-44 Galactic Market lockdown start-notice crosswalk (11 October 2026)

| Cosmic Forge source key | MIAPLACIDUS target | Mapping |
| --- | --- | --- |
| `notificationRandomEventMarketOffline` (`cosmicForge/cosmicForge/events.js:552-565`) | Existing `randomEventTriggerNotificationMessages.marketOffline`, delivered by `randomEventTriggeredNotifications.ts` for `random-event.triggered` with ID `galacticMarketLockdown` | Exact six-locale source notice, including its 30-minute duration, is already delivered as an informational notification when the event starts. Delivery respects the game's notification setting. |

One app-level trigger route now sends the source-matched Market Offline notice when `galacticMarketLockdown` begins. The same six-locale handler covers all 13 Random Event IDs with the six named source notification variants and the generic source event-name fallback, one five-second informational toast per trigger, and the existing notification-preference gate. This avoids a duplicate Market-start toast and does not change simulation behavior. The Market page's separate active-lockdown notice remains available when the player opens that page. Typecheck, formatting, and scoped diff-check passed; no tests or browser runs were performed. P-44 remains open.

### P-44 Colonise page-help mapping (11 October 2026)

| Cosmic Forge source key | MIAPLACIDUS target | Mapping |
| --- | --- | --- |
| `headerDescColonise` (`cosmicForge/cosmicForge/descriptions.js:472`) | `starshipMessages.coloniseHeaderHelp`, available from the Colonise heading via `InfoTooltip` in `StarshipPane.tsx` | The source description is localized in all six locales. With a selected destination, the tooltip inserts its star name and the live attack fleet power, formatted with the player's current notation. |

The Colonise screen previously had no page-level guidance: its scan report,
diplomacy, battle, and settlement sections were present, but the source's
purpose statement was not. The tooltip now explains the page's Diplomacy/War
purpose and the destination it applies to. The source table entry above now
replaces the prior Colonise redesign-only disposition. Typecheck, formatting,
and scoped diff-check passed; no tests or browser runs were performed. P-44
remains open.

### P-44 Starship page-help mapping (11 October 2026)

Cosmic Forge `headerDescStarShip` now appears as an accessible title-side
`InfoTooltip` on the Starship page in all six locales. The text is exact source
copy; the Fleet Hangar and Colonise header-help surfaces remain distinct.
Typecheck, scoped formatting, and diff-check passed. No tests or browser runs
were performed; P-44 remains open.

### P-44 Star Data Weather column help correction (11 October 2026)

The 10 October inventory above recorded `infoTooltipStarLegendWeather` as
combined with `infoTooltipStarShipScanPrecipitation` in the Star Data column.
The target now uses the distinct `infoTooltipStarLegendWeather` text from
`localization.json` in `starMapMessages.starDataWeatherHelp`, rendered beside
the Weather column header in `StarMapPane.tsx`. Scan-report precipitation
guidance remains a separate tooltip. A source-JSON comparison case covers all
six locales; it was added but not run. Star Data remains under Interstellar.
P-44 remains open.

### P-55 Techs Unlocked sentinel mapping (11 October 2026)

The Statistics selector now mirrors the source's extra
`apAwardedThisRun` entry only after rebirth. Cosmic Forge's run-1 initialization
removes the initial marker when it handles `run1`; later rebirths restore the
marker and preserve the separate Cosmic Rip unlock when applicable. The
remake displays the matching count without adding a synthetic technology to
engine state. Typecheck, formatting, and scoped diff-check passed. No tests or
browser runs were performed; controlled source values and the wider P-55 row
audit remain open.

### P-20 Philosophy Repeatable purchase accessibility (11 October 2026)

Each disabled Philosophy Repeatable Buy button now points to its visible
localized unavailable reason with `aria-describedby`. The reason remains
static explanatory text rather than a live region, avoiding repeated
announcements as Research Points change. A static review found the sampled
Galactic Market, Cosmic Rip, Starship/Fleet, and Space Mining purchase/action
failures already reference visible reasons or reach the global live output. No
copy or purchase behavior changed. Typecheck, scoped formatting, and
diff-check passed; no tests or browser runs were performed. Manual spoken
assistive-technology output remains part of the final P-20 verification.

### P-45 Research and Energy notification-copy audit (11 October 2026)

Cosmic Forge's `techNotifyCarbonFusion` and `techNotifySodiumIonPowerStorage`
source strings were cross-checked against the remake's typed technology
notification catalogue. Their researched-tech notices already route through
`App.tsx`; Research and Energy purchase controls already expose localized
owned/rate state and disabled reasons, and Cosmic Forge has no per-building
purchase-completion notices to reproduce. Corrected two Spanish catalogue
defects in `technologyNotificationMessages.ts`: the Carbon Fusion notice had a
stray `º` and missing blank-line separation, and Sodium Ion Power Storage said
“Energión” instead of “Energía”. No gameplay behavior changed. No tests or
browser runs were performed; P-45 remains open.

### P-45 Space Mining action feedback and Star Map orthography (11 October 2026)

The Space Telescope's accepted Void pillage command previously displayed the
generic “Telescope survey started” feedback, which misnamed the action. It now
uses a dedicated six-locale “Void pillage started” message; asteroid scan and
star study retain their existing survey message. A focused spelling review of
`starMapMessages.ts` also restored obvious missing diacritics in Spanish,
Portuguese, German, and French labels/help (including precipitation,
ascension, distance, antimatter, and French weather/data terms). Terminology
and meaning were preserved. No mechanics changed. No tests or browser runs
were performed; P-45 remains open.

### P-36 tutorial audio action audit (11 October 2026)

Source-sequence review confirmed that Background Audio is an action step, not a page-visit step: the `visitAudioSettings` step is intentionally advanced only by `recordTutorialBackgroundAudioToggle` when the player changes the control. Adding a generic destination gate would have enabled Continue without that action, so no source change was retained. The following `readAudioSettings` step still requires Game Options to be open for four seconds. No tests or browser runs were performed. P-36 remains open for the full sequence and save/resume review.
### P-20 live-region source audit (11 October 2026)

The app already routes Black Hole charge completion, Starship scan completion,
asteroid search outcomes, Star Study, and rocket arrival/return through its
always-mounted global notification region. Three pane-local live outputs were
announcing the same results when their owning pane was selected: Black Hole
charge readiness, Starship scan success, and Space Mining's asteroid, study,
and rocket outcome watcher. Those duplicates are removed. The Space Mining
observer no longer mirrors app-level timer events into local feedback; the
Star Study global notice now includes the updated study range in English,
Spanish, Portuguese, German, Italian, and French. Each global notification
card exposes `role="status"` with atomic text; the stack container has no
separate live semantics, avoiding nested polite regions. Save-conflict copy continues through the persistent global status
output, purchase controls retain their localized visible reasons or action
feedback, and native tab semantics announce selected destinations without an
extra live region. No tests or other checks were run. Remaining P-20 gates:
manual spoken screen-reader verification; source-level purchase-reason coverage is complete.
The existing Space Telescope/Starship browser assertions still refer to the
removed local live outputs and need reconciliation in the deferred regression
pass.

### P-20 discrete purchase-reason audit (11 October 2026)

Source/target review of Space Mining, Starship/Fleet, Galactic Market/Casino,
Black Hole, Cosmic Rip, Ascendency, and Megastructures found the disabled
purchase controls already connect their visible localized reason through
`aria-describedby`; command rejection paths retain a single local polite
feedback output. Two exceptions used live-region semantics for continuously
balance-derived disabled reasons: Casino CP/resource purchase and Black Hole RP
research. Their reason paragraphs are now static descriptions connected to
the corresponding disabled button, so each RP/CP balance update does not
trigger another live announcement. No new locale copy was required. The
Economy/Research audit also found controls already expose localized linked
reasons, including Tech Tree's all-six-locale current/required/missing RP
shortfall in its visible status and `aria-describedby` tooltip. No extra
locale strings or code changes were needed for that Tech Tree route. The
source/target purchase-reason audit is complete; spoken screen-reader
verification remains open. No tests or checks were run.

### P-44 Resource and Compound action-description crosswalk (11 October 2026)

Cosmic Forge descriptions.js:613-1060 defines action help for selling,
storage, autobuyer tiers 1-4, and creating Compounds. ui.js:3695-3700
places each description in the option row; drawTab3Content.js:3654-3673
replaces six sale descriptions with their full Content2 copy after fusion
research. The remake now includes all 96 matching source keys from
localization.json in src/i18n/economyActionHelpMessages.ts, with the
catalog registered in localizationValidation.ts.

The matching help is displayed beside Sell, Storage, Compound Create, and
autobuyer tier controls across Hydrogen, the other Resources, and Compounds.
The six fusion-capable Resource sale descriptions change only after their
matching technology is researched. For autobuyer tiers 2-4, the remake appends
the live energy demand to the source's Power: suffix. A source-parity unit
spec covers all 96 keys and six locales but remains unrun for the requested
end-stage regression pass; no browser layout check has been made. P-44 remains
open.
