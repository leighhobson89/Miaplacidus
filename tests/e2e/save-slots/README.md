# Local save slots browser coverage

5 October 2026 keyboard/touch follow-up: the startup picker was exercised without mouse activation. Keyboard-only create/search/select/resume and a 390×844 touch-only create/select/resume path both passed. In the combined one-worker Chrome run, these two cases and the Casino cost-preview case passed 3/3; the runner exited 0 after its test-owned Vite server was stopped.

These player flows use real Chrome controls and screenshot checkpoints. They cover:

- `START NEW GAME` creates a local slot immediately. A loadable last-started save is preselected on startup and shows `RESUME GAME`; editing the name clears that selection, and resuming another save still requires choosing its search result. Two pioneers retain independent Hydrogen balances.
- A fresh slot opens directly into gameplay; Miaplaedia has no first-run briefing replay control. First-access badges appear on available destinations, including Settings and Miaplaedia sections, and clear when each is opened. Pending badges survive save/reload and resume.
- Save-manager selection that returns to startup; rename collision, save-as-new, and confirmed delete.
- Reload and prefill, durable timer recovery, and permanent state carrying one or two rebirth counts.
- Escape closes Save Manager and returns keyboard focus to the button that opened it.
- Startup can be completed from the keyboard: create a pioneer, search saved names, select a match with ArrowDown/Enter, then resume with Tab/Enter. Editing the name without choosing a suggestion starts a new game.
- Portable code from the live run through clipboard, text, `.txt` upload, and download; validate each export as a save with the same pioneer and Hydrogen balance while the live clock continues. Also cover replace/new/cancel choices and restore into a separate empty browser profile.
- Synthetic schema migration, damaged-generation recovery, quota failure preserving the old generation, blocked storage export/exit, and two-tab writer ownership.

Every stateful scenario captures a screenshot and compares a checked-in baseline. The shared harness checks that the app surface is visible and non-white and reports page/console errors or external requests.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npx.cmd playwright test tests/e2e/save-slots/save-slots.spec.ts --workers=1
```

For the related evidence ledgers, see [`save-load-local`](../save-load-local/README.md), [`save-migration`](../save-migration/README.md), and [`migration`](../migration/README.md). Live rebirth persistence is exercised through the player controls in the [`rebirth` area](../rebirth/README.md); imported rebirth-count fixtures remain for slot-independence coverage.

5 October 2026: the focused Chrome test `a fresh pioneer starts directly and Miaplaedia has no replay control` passed 1/1. It checks direct entry and the missing briefing/replay UI for fresh and resumed saves.

5 October 2026: all 13 save-slot cases passed in serial Chrome after making the loadable last-started save the preselected startup choice. The tests follow the name-search picker, read save status in Settings → Saving / Loading, expand the recovery section before inspecting it, and switch sessions through the current controls. Save-flow screenshots were regenerated for the current Hydrogen presentation; the `last-started-save-preselected` capture was visually reviewed.
