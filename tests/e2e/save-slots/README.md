# Local save slots browser coverage

5 October 2026 keyboard/touch follow-up: the startup picker was exercised without mouse activation. Keyboard-only create/search/select/resume and a 390×844 touch-only create/select/resume path both passed. In the combined one-worker Chrome run, these two cases and the Casino cost-preview case passed 3/3; the runner exited 0 after its test-owned Vite server was stopped.

These player flows use real Chrome controls. Layout-focused journeys also capture and compare screenshots. They cover:

- `START NEW GAME` creates a local slot immediately. A loadable last-started save is preselected on startup and shows `RESUME GAME`; editing the name clears that selection, and resuming another save still requires choosing its search result. Two pioneers retain independent Hydrogen balances.
- A fresh slot opens directly into gameplay; Miaplaedia has no first-run briefing replay control. First-access badges appear on available destinations, including Settings and Miaplaedia sections, and clear when each is opened. Pending badges survive save/reload and resume.
- Save-manager selection that returns to startup; rename collision, save-as-new, and confirmed delete.
- Reload and prefill, durable timer recovery, and permanent state carrying one or two rebirth counts.
- Save status, save controls, slot management, export and import stay inline in Settings → Saving and Loading; no manager dialog or opener remains.
- Startup can be completed from the keyboard: create a pioneer, search saved names, select a match with ArrowDown/Enter, then resume with Tab/Enter. Editing the name without choosing a suggestion starts a new game.
- Portable code from the live run through clipboard, text, `.txt` upload, and download; validate each export as a save with the same pioneer and Hydrogen balance while the live clock continues. Also cover replace/new/cancel choices and restore into a separate empty browser profile.
- Synthetic schema migration, damaged-generation recovery, quota failure preserving the old generation, blocked storage export/exit, and two-tab writer ownership.

The shared harness checks that the app surface is visible and non-white and reports page/console errors or external requests.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npx.cmd playwright test tests/e2e/save-slots/save-slots.spec.ts --workers=1
```

For the related evidence ledgers, see [`save-load-local`](../save-load-local/README.md), [`save-migration`](../save-migration/README.md), and [`migration`](../migration/README.md). Live rebirth persistence is exercised through the player controls in the [`rebirth` area](../rebirth/README.md); imported rebirth-count fixtures remain for slot-independence coverage.

5 October 2026: the focused Chrome test `a fresh pioneer starts directly and Miaplaedia has no replay control` passed 1/1. It checks direct entry and the missing briefing/replay UI for fresh and resumed saves.

5 October 2026: all 13 save-slot cases passed in serial Chrome after making the loadable last-started save the preselected startup choice. The tests follow the name-search picker, read save status in Settings → Saving / Loading, expand the recovery section before inspecting it, and switch sessions through the current controls. Save-flow screenshots were regenerated for the current Hydrogen presentation; the `last-started-save-preselected` capture was visually reviewed.

8 October 2026: the fresh-start/direct-entry and no-briefing journey passed 1/1 in installed Chrome after refreshing its first-run Hydrogen and resumed Miaplaedia screenshots for the current status rows and heading scale. Both updated captures were visually reviewed, and the no-update rerun passed 1/1 with a clean process exit. This verifies the owner-directed removal of the first-run briefing and replay control; progression-wide tutorial prompts remain a separate open P-36 question.

**P-20 save-conflict announcement check (9 October 2026):** the two-tab writer-ownership journey now verifies a persistent, initially empty `role="status"` region with `aria-live="polite"` and `aria-atomic="true"`. When the owner tab advances the save head, the stale tab announces the localized conflict in French, keeps it visible in the conflict banner, and exposes it through the Saving and Loading status when that panel is open; the conflict no longer uses an assertive alert. The focused Chrome case passed **1/1** on port 4239. No manual assistive-technology run was performed, so browser assertions verify DOM semantics and localized content but cannot confirm speech timing or pronunciation in a screen reader.

Run the focused P-20 save-conflict case with installed Chrome:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
$env:MIAPLACIDUS_TEST_PORT = "4239"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line -g "@p20-announcements" tests/e2e/save-slots/save-slots.spec.ts
```

**P-21 keyboard-only resume follow-up (9 October 2026):** the keyboard create,
search, select, and resume journey now continues Tab traversal from the
browser's actual focus position after reload. That keeps the path keyboard-only
without assuming the browser discards its restored focus. It passed in the
clean focused P-21 Chrome run (4/4 with the paired Casino keyboard/touch cases).

**P-22 name/import form checks (9 October 2026):** two focused Chrome cases
passed (2/2). The first checks the German long pioneer and import labels at
125% root text sizing, a 320px startup layout, and a reduced-height mobile
viewport while the name and imported-name fields are focused. It previews a
portable save and completes the import using keyboard activation; the import
card remains within the 390px viewport. The second applies 150% mobile pinch
zoom to both startup and import screens, reduces the viewport height to model
the soft keyboard, and confirms each focused field remains visible and usable.
This is browser viewport/zoom emulation; it does not substitute for checking an
on-device virtual keyboard. Run with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npx.cmd playwright test tests/e2e/save-slots/save-slots.spec.ts --grep '@p22-' --workers=1
```

**P-22 rerun (9 October 2026):** the two name/import cases passed again in
installed Chrome (2/2, 8.0 seconds, clean exit) on port 4257. The sandboxed
runner returned `spawn EPERM`; the same focused command completed using the
documented system-Chrome runner. These checks still emulate zoom and a reduced
viewport; an actual mobile virtual keyboard remains unverified.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4257'
npm.cmd run test:e2e:focused -- tests/e2e/save-slots/save-slots.spec.ts -g '@p22-' --workers=1 --retries=0 --trace=off --reporter=line
```

**P-51 Save & Loading visual spot check (9 October 2026):** I reviewed the
existing [390px Light Settings capture](../theme-presentation/phase6-tab-layout.spec.ts-snapshots/phase6-settings-saves-light-mobile.png)
and [1280px Terminal capture](../theme-presentation/phase6-tab-layout.spec.ts-snapshots/phase6-settings-saves-terminal-desktop.png).
At 390px, Save & Loading and the inline Save Manager stay inside the page;
the save-status card, rename/save-as controls, portable-code controls, and
import form stack vertically without visible card or button clipping. At
1280px, rename and portable-code cards fit side by side and the import form
spans the content width. The mobile capture is English; its long prefilled
pioneer name shows only the beginning inside the unfocused rename field, while
the field itself remains within the card. The static image does not establish
whether moving the caret to the end exposes the remaining characters.

The existing German P-22 form cases assert focused name/import fields stay in
the visual viewport at 320px and 390px and that the import card stays within
390px; their coverage is documented above, but they do not save a visual
capture of the Saving and Loading manager in German. No page-level layout defect
was verified in the reviewed captures, so no product change was made. P-51
remains open for a narrow-width, long-locale visual capture of the inline Save
Manager and import preview.

**P-16 unsaved-exit focus routes (9 October 2026):** a focused browser path
creates a temporary Grace run while Hydrogen Pioneer is open in another tab,
then verifies the exit dialog starts with its first choice focused. Escape,
Keep playing, and Manage saves restore focus to Grace's slot; Discard returns
to the name screen with Grace prefilled and the Pioneer name field focused.
The installed-Chrome P-16 batch passed all nine selected routes in 29.8 seconds
on port 4261. The scenario uses the normal save-conflict flow.

## P-51 French unsaved-exit dialog at 320px (9 October 2026)

`save-slots.spec.ts` adds `@p51-unsaved-exit`, which opens the save-conflict
dialog in French at 320x740. It checks the complete localized warning and all
three action names, dialog/warning/action bounds, text overflow, and document
width. The stale tab boots with French selected so the conflict error itself is
localized in French; name and save controls use stable selectors. The focused
installed-Chrome check passed 1/1 on port 4296, with no dialog, warning, action,
or page-width overflow found. P-51 remains open for the broader long-copy,
theme, locale, and viewport review.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4296'
node .\node_modules\playwright\cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line -g '@p51-unsaved-exit' tests/e2e/save-slots/save-slots.spec.ts
```

## P-46/P-51 Save & Loading in all six locales at 320px (9 October 2026)

The focused `p51-save-manager-six-locales-320.spec.ts` case cycles the live
Settings language control through English, Spanish, Portuguese, German, Italian,
and French, then opens Saving and Loading at 320×740. For each locale it asserts
the document language and localized section/Save Manager headings, measures the
Save & Loading and manager bounds, checks every visible control in the panel
stays within the panel and viewport, and confirms the document width is at most
320px. It also opens the import-format error in each locale and verifies the
alert text, bounds, and lack of horizontal or vertical clipping at 320px. It
attaches one full-page capture for each locale to the Playwright test report.
Text areas are checked for placement rather than internal scroll width because
the portable save code is expected to scroll inside its field.

The focused installed-Chrome run passed **1/1** in **7.9 seconds** on port 4374
with a clean exit. This advances the Save & Loading mobile-copy/layout sample;
other save flows, tooltips, themes, viewports and broader clipping review remain
open under P-46/P-51.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4374'
node .\node_modules\playwright\cli.js test --workers=1 --retries=0 --trace=off tests/e2e/save-slots/p51-save-manager-six-locales-320.spec.ts
```

## P-50 Save Manager date follows the selected locale (9 October 2026)

The focused `p50-save-date-locale.spec.ts` journey fixes the browser timestamp,
creates two local pioneers through the startup controls, and opens Settings →
Saving and Loading. It checks the first pioneer's visible Save Manager
`savedAt` value against the localized medium-date/short-time format in `en`,
`es`, `pt`, `de`, `it`, and `fr`. After each locale change it also decodes the
stored local slot and confirms the slot ID, generation ID, and `savedAt`
timestamp are unchanged.

Installed Chrome passed **1/1 in 6.0 seconds** on port 4322 with a clean exit.
This closes the Save Manager's six-locale saved-date behavior sample; other
date and numeric-formatting surfaces remain open under P-50.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4322'
node .\node_modules\playwright\cli.js test --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/save-slots/p50-save-date-locale.spec.ts
```

## P-50 Startup save-picker date follows the selected locale (9 October 2026)

The isolated `p50-start-picker-date-locale.spec.ts` journey creates a local
save at a fixed timestamp, reloads to the startup pioneer picker, and checks its
selected save suggestion in all six locales. Each visible saved-at value must
match that locale's medium-date/short-time format; the slot ID, generation ID,
and stored timestamp stay unchanged through the locale switches.

Installed Chrome passed **1/1 in 4.5 seconds** on port 4323 with a clean exit.
The Save Manager and startup picker each have a focused six-locale date check.
The later P-50 follow-up below records number-formatting coverage.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4323'
node .\node_modules\playwright\cli.js test --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/save-slots/p50-start-picker-date-locale.spec.ts
```

## P-46 Save Manager storage estimate copy (9 October 2026)

The storage-use estimate previously rendered the English phrase “KB app data”
in every locale even though the remaining-capacity sentence was translated.
`SaveManager` now gets the data label from the six-locale save-message catalogue.
The focused `p46-save-storage-copy-locale.spec.ts` case switches the live
Settings language through `en`, `es`, `pt`, `de`, `it`, and `fr`, then checks the
localized label, remaining-capacity copy, and visible KB unit in each locale.

Installed Chrome passed **1/1 in 6.5 seconds** on port 4336 with a clean exit.
This closes the storage-estimate label gap; import errors, conflict copy, and
the broader mobile review remain open under P-46.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4336'
node .\node_modules\playwright\cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/save-slots/p46-save-storage-copy-locale.spec.ts
```

## P-46 quota error copy across locales (9 October 2026)

`p46-save-error-locale.spec.ts` first creates a real local save, then replaces
the browser's save-slot writes with a `QuotaExceededError`. It changes the
active locale through all six supported languages, attempts Save Now, and
checks the visible quota alert against that locale's message. This verifies
the UI error path as well as catalogue completeness. Installed Chrome passed
**1/1 in 10.6 seconds** on port 4369. Additional import error coverage is
recorded below; the broader mobile review remains open under P-46.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4369'
npm.cmd run test:e2e:focused -- tests/e2e/save-slots/p46-save-error-locale.spec.ts --workers=1 --retries=0 --trace=off --reporter=line
```

## P-46 import validation and conflict copy (9 October 2026)

While Saving and Loading remains open, `@p46-save-import-locale` switches
through all six locales and checks the invalid-format error plus the duplicate
local-save conflict prompt against their localized messages. Installed Chrome
passed **1/1 in 6.9 seconds** on port 4372. Other import error variants and
the broader mobile review remain open under P-46. Save-lock conflict
localization is recorded in the focused follow-up below.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4372'
npm.cmd run test:e2e:focused -- tests/e2e/save-slots/p46-save-error-locale.spec.ts --workers=1 --retries=0 --trace=off --reporter=line -g '@p46-save-import-locale'
```

## P-46 save-lock conflict copy follows locale changes (9 October 2026)

`p46-save-lock-conflict-locale.spec.ts` keeps one tab as the slot owner and
loads a stale snapshot in a second tab. After the owner collects Hydrogen and
saves a new generation, the stale tab switches through `en`, `es`, `pt`, `de`,
`it`, and `fr` with the Settings language control. The visible conflict banner
and polite announcement match `saveText(locale, "errConflict")` at each step.
The stale and owner runs keep their pioneer identity and Hydrogen balance, and
the owner's slot head remains on the same saved generation through the locale
changes. Save failures now retain their error code and render the matching
message in the current locale, including conflict banners, status, and exit
warnings.

Installed Chrome passed **1/1 in 7.7 seconds** on port 4419 with a clean exit.
Sandboxed Playwright launches returned `spawn EPERM`; the installed Playwright
CLI command below completed the focused test.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4419'
node .\node_modules\playwright\cli.js test --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/save-slots/p46-save-lock-conflict-locale.spec.ts
```

## P-50 locale-aware number display (9 October 2026)

The focused number-formatting unit area now checks the explicit Standard
grouping/decimal conventions and Condensed decimal separator for all six
locales (6/6 passed). Save Manager's portable, compressed-local, app-data and
remaining-capacity sizes now use locale-aware integer grouping; the existing
six-locale storage-copy browser case verifies each visible `KB` readout against
`Intl.NumberFormat` and passed 1/1 in 5.7 seconds on port 4350. Source search
found the Save Manager and startup picker as the app's date-formatting
surfaces; both have six-locale focused browser coverage above. The P-41
source-wide display audit and visible notation cases cover the remaining game
quantities and durations. Numeric rule values are not changed by formatting.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4350'
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/save-slots/p46-save-storage-copy-locale.spec.ts
```

## P-41 imported Cash notation in portable-save preview (9 October 2026)

The `notation-coverage` fixture supplies a deterministic $1B balance. The
focused browser case exports that run in Condensed, Standard, and Scientific,
then previews each payload while the live run is set to a different notation.
Each preview Cash row matches `formatCurrency` using the imported save's
notation, while the live run's notation and Cash remain unchanged. Installed
Chrome passed **1/1 in 9.7 seconds** on port 4443; `npm.cmd run typecheck` also
passed. No production change was needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4443'
node .\node_modules\playwright\cli.js test tests/e2e/save-slots/p41-import-cash-notation.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g '@p41-import-cash-notation'
```

## P-46 empty import-code copy audit (9 October 2026)

The existing six-locale import journey now also submits an empty portable-code
field before the malformed-code and duplicate-save checks. It asserts the
visible error against `saveText(locale, "errEmpty")` in `en`, `es`, `pt`,
`de`, `it`, and `fr`. The save UI audit found the save, import, quota, conflict,
and recovery copy is routed through the typed `saveMessages.ts` catalogue;
the smallest uncovered validation path was the empty-code import error.

TypeScript passed with `npm.cmd run typecheck`. At the time of the audit, the
focused browser check was pending because the default runner hit `spawn EPERM`.
A later installed-Chrome run verified both cases in this file: quota failure,
malformed import, duplicate-save conflict, and the empty-code error across all
six locales. The focused run passed **2/2 in 13.2 seconds** on port **4463**.
At that point, the other import variants and recovery labels/success were still
open; the follow-up evidence below covers those paths.

```powershell
$env:MIAPLACIDUS_TEST_PORT='4463'
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npm.cmd run test:e2e:focused -- --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/save-slots/p46-save-error-locale.spec.ts
```

## P-46 import-error variants and recovery copy across locales (9 October 2026)

The focused import case now exercises both invalid-code and invalid-JSON inputs,
integrity and future-version failures, oversized and unreadable files, clipboard
read failure, copy success, duplicate-name failure, successful import, and the
visible saved status in each of `en`, `es`, `pt`, `de`, `it`, and `fr`. Together
with the prior quota/empty/unknown-format checks and the six-locale save-lock
conflict case, this covers each mapped Save Manager error message and its visible
import/save notice.

The recovery case verifies the localized recovery summary, corrupt-slot status,
restore and cancel controls, a failed restore alert, and successful recovery in
all six locales. The installed-Chrome focused batch passed **6/6 in 33.6
seconds** on port **4472**. `npm.cmd run typecheck` passed. Playwright required
the approved unsandboxed launch after sandboxed starts returned `spawn EPERM`.

```powershell
$env:MIAPLACIDUS_TEST_PORT='4472'
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npm.cmd run test:e2e:focused -- --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/save-slots/p46-save-error-locale.spec.ts tests/e2e/save-slots/p46-import-error-variants-locale.spec.ts tests/e2e/save-slots/p46-recovery-locale.spec.ts tests/e2e/save-slots/p46-save-lock-conflict-locale.spec.ts tests/e2e/save-slots/p46-save-storage-copy-locale.spec.ts
```

## P-44 clipboard feedback follow-up (9 October 2026)

Clipboard feedback now distinguishes local clipboard access from local save
storage. Successful copy uses the source `notificationDataCopiedToClipboard`
message, copy failure uses the source `notificationErrorCopyingData` message,
and Paste-read failure has separate localized guidance for the remake's added
Paste action. The P-46 locale case checks all three results in all six locales;
installed Chrome passed 1/1 in 11.8 seconds on port 4485. The source-backed
message unit passed 1/1, localization validation passed 4/4, and typecheck and
targeted formatting passed.

## P-45 startup picker copy (10 October 2026)

`p50-start-picker-date-locale.spec.ts` now also follows the visible startup
picker in `en`, `es`, `pt`, `de`, `it`, and `fr`. It checks the localized
pioneer/language labels, required empty-name state, `START NEW GAME` copy,
preselected `RESUME GAME <name>` copy, and the localized duplicate-name error
when a saved name is typed but its suggestion is not selected. It selects the
matching suggestion again before moving to the next locale. The isolated P-45
Chrome batch passed **4/4 in 21.6 seconds** on port 4975, including the paired
early-economy cases. This supplements the existing six-locale saved-date
check; it does not cover Save Manager import/recovery copy, which has separate
P-46 coverage above.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4975'
node .\node_modules\playwright\cli.js test --pass-with-no-tests --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/save-slots/p50-start-picker-date-locale.spec.ts tests/e2e/economy/p45-early-economy-locales.spec.ts --grep '@p45-'
```

## P-44 Save/Import source-key crosswalk (10 October 2026)

The source-key crosswalk in
[`phase-6-handoff-2026-10-07.md`](../../../docs/archive/audits/phase-6-handoff-2026-10-07.md#p-44-saveimport-quota-and-conflict-message-crosswalk-10-october-2026)
records the source-to-remake disposition for Save, Export, Import, quota, and
conflict copy. Direct copy matches for clipboard success/error and the autosave
off notice are checked against Cosmic Forge `localization.json` in all six
locales. Import validation messages split the source's general invalid/load
errors into specific local-code outcomes; local quota and two-tab conflict
messages are remake-only because Cosmic Forge uses cloud saves. Cloud copy is
excluded by the local-save contract. The source demo-save refusal is
intentionally excluded because the local-save contract explicitly gives demo
builds the same save behavior as full builds.

The crosswalk exposed one incorrect error route: an invalid pioneer name was
reported as a damaged save envelope. Name validation now has its own
`invalid-name` error code and localized `errName` message, while damaged
envelopes still use `errIntegrity`. The existing six-locale
`@p46-import-errors-locale` journey asserts the blank-name error before the
duplicate-name and successful-import paths. It passed **1/1 in 14.8 seconds** in
installed Chrome on port 4895. The unit crosswalk passed **18/18**, and
`npm.cmd run typecheck` passed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4895'
npm.cmd run test:e2e:focused -- --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/save-slots/p46-import-error-variants-locale.spec.ts --grep '@p46-import-errors-locale'
```

The expanded P-44 crosswalk in the handoff includes 56 Cosmic Forge Save/Import
and adjacent entry-point keys present in all six source locales. In the remake,
the startup greeting becomes the searchable local-pioneer picker; the former
load hint is replaced by explicit result selection and `START NEW GAME` /
`RESUME GAME <name>` state. Autosave, export, and import controls render inline
under Settings → Saving and Loading. Export shows the current run's read-only
portable code; import previews a selected code before applying it. Source cloud
actions remain excluded by the local-save contract. The source Exit Game
heading/description and save prompt are Electron-only; the browser owns tab
closure, so the remake has no app-level exit control. The eight-key Hard Reset
family is dispositioned below: source reset targets only the current pioneer
name, and the remake provides the same data scope through active-slot deletion
followed by starting a fresh run under that name. This does not expose an
all-slots reset.
The generic source `buttonCancel` is adapted to the local recovery/import
`cancel` control. `notificationSaveTooOldForPhilosophies` is not `errFuture`:
the source warning concerns an old Cosmic Forge schema, while `errFuture` means
a newer MIAPLACIDUS schema; supported remake versions migrate, and Cosmic Forge
codes are not accepted. The demo-only save refusal is intentionally excluded:
demo builds use the same local save behavior as full builds, per
`docs/plans/local-save-contract.md`.

Validation for this expanded inventory:

- `tests/unit/save-message-crosswalk.spec.ts`: **18/18** passed; all 56 source
  keys are nonempty in every locale, mapped target IDs are nonempty, and direct
  source-copy pairs match exactly.
- Six-locale installed-Chrome batch: **4/4** passed on port **4991**. It covers
  the startup selection/duplicate-name copy, import error/success copy, recovery
  labels/notices, and Save and Loading layout at 320px.
- `npm.cmd run typecheck` passed. `oxfmt --check` passed for the crosswalk test
  and this README. A whole-file check of the shared handoff reports formatting
  differences; I left that shared document unformatted to avoid reflowing other
  agents' adjacent P-44 evidence.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4991'
node .\node_modules\playwright\cli.js test --pass-with-no-tests --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/save-slots/p51-save-manager-six-locales-320.spec.ts tests/e2e/save-slots/p46-import-error-variants-locale.spec.ts tests/e2e/save-slots/p46-recovery-locale.spec.ts tests/e2e/save-slots/p50-start-picker-date-locale.spec.ts --grep '@p51-save-manager-six-locales-320|@p46-import-errors-locale|@p46-recovery-locale|@p45-startup-locale'
```

### P-44 demo-save and Hard Reset dispositions (10 October 2026)

The demo refusal `notificationSavingDisabledInDemo` is intentionally excluded.
Cosmic Forge blocks saving in its demo build, but the remake's more specific
[local-save contract](../../../docs/plans/local-save-contract.md) explicitly says
the flagged demo build uses the same local-save behavior as the full build.
The current demo therefore keeps its localized Save Manager actions and has no
refusal notice.

The source Hard Reset is scoped to the currently selected pioneer name:
`destroySaveGameOnCloud()` reads `getSaveName()`, archives only that cloud row
under `graveyard_<name>`, and nulls that row's data. It does not wipe other
pioneer profiles. The remake's existing active-slot delete removes just that
local pioneer; the player can then start a fresh game with the same name. This
provides the same per-pioneer reset scope through a different flow. It does not
add a global all-slots reset or a `localStorage.clear()` call. The source's
graveyard archive is absent from the local-only model; the remake instead
requires its existing export-first confirmation.

The eight source keys are dispositioned in
[`phase-6-handoff-2026-10-07.md`](../../../docs/archive/audits/phase-6-handoff-2026-10-07.md#p-44-hard-reset-source-key-disposition-updated-10-october-2026): six map to the existing six-locale `delete`, `deletePrompt`, and `confirmDelete` messages in the active slot card under Settings → Saving and Loading. The modal cancel label is intentionally omitted because the inline confirmation has no Cancel button; the completion notice is replaced by returning to pioneer selection.

The six-locale unit crosswalk checks source-key presence and nonempty remake
targets for these dispositions. A focused rerun of the existing `@management`
browser case did not reach delete: it timed out while looking for the retired
`dialog` named after the pioneer, before any delete control was used. The
current Save Manager is inline (`data-testid="save-manager-inline"`), so that
legacy locator needs a separate test correction before this browser journey
can serve as current evidence. No app behavior or new user copy was added for
this documentation/crosswalk slice.

Validation on 10 October: `npm.cmd run test:unit:focused --
tests/unit/save-message-crosswalk.spec.ts` passed **18/18**. Focused Oxfmt and
`git diff --check` passed. The browser attempt used installed Chrome on port
4997 with `save-slots.spec.ts --grep 'rename, save-as-new, and delete'`;
the sandbox launch first returned `spawn EPERM`, and the elevated retry started
the app/browser but timed out before deletion at the obsolete dialog locator.
It is not counted as browser behavior evidence for the Hard Reset replacement.

## Focused failure recovery (14 October 2026)

Five current-worktree Save and Loading cases passed in focused Chromium runs:
P-46 import conflict copy, P-50 saved-at date formatting, P-45 startup duplicate
name validation, inline Save Manager keyboard navigation, and the P-51 six-locale
320px Save and Loading layout. The first four passed together **4/4** on port
4192; the P-51 layout passed **1/1** on port 4193. Artifacts were redirected to
system Temp. These targeted results supersede the corresponding failures in the
14 October full-run list; no full suite was rerun.
