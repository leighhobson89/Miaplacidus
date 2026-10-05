# Local save slots browser coverage

These player flows use real Chrome controls and screenshot checkpoints. They cover:

- `START NEW GAME` creates a local slot immediately; the typed-name search must return and the player must select a save before `RESUME GAME` appears. Two pioneers retain independent Hydrogen balances.
- A fresh slot opens directly into gameplay; Miaplaedia has no first-run briefing replay control. First-access badges appear on available destinations, including Settings and Miaplaedia sections, and clear when each is opened. Pending badges survive save/reload and explicit resume. Reloading still requires explicit selection of the matching local save.
- Save-manager selection that returns to startup; rename collision, save-as-new, and confirmed delete.
- Reload and prefill, durable timer recovery, and permanent state carrying one or two rebirth counts.
- Escape closes Save Manager and returns keyboard focus to the button that opened it.
- Portable code from the live run, clipboard/text/`.txt` equivalence, replace/new/cancel choices, and restore into a separate empty browser profile.
- Synthetic schema migration, damaged-generation recovery, quota failure preserving the old generation, blocked storage export/exit, and two-tab writer ownership.

Every stateful scenario captures a screenshot and compares a checked-in baseline. The shared harness checks that the app surface is visible and non-white and reports page/console errors or external requests.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npx.cmd playwright test tests/e2e/save-slots/save-slots.spec.ts --workers=1
```

For the related evidence ledgers, see [`save-load-local`](../save-load-local/README.md), [`save-migration`](../save-migration/README.md), and [`migration`](../migration/README.md). Live rebirth persistence is exercised through the player controls in the [`rebirth` area](../rebirth/README.md); imported rebirth-count fixtures remain for slot-independence coverage.

5 October 2026: the focused Chrome test `a fresh pioneer starts directly and Miaplaedia has no replay control` passed 1/1. It checks direct entry and the missing briefing/replay UI for fresh and resumed saves.

5 October 2026: all 13 save-slot cases passed in serial Chrome. The tests now follow the name-search picker, read save status in Settings → Saving / Loading, expand the recovery section before inspecting it, and switch sessions through the current controls. Refreshed save-flow screenshots were visually reviewed.
