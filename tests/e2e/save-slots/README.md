# Local save slots browser coverage

These player flows use real Chrome controls and screenshot checkpoints. They cover:

- Confirm without creating a slot, edit/reconfirm, Start, and two pioneers with independent Hydrogen balances.
- A new slot receives a localized Hydrogen briefing, keeps it pending across reload, and remembers completion; imported and completed slots skip it.
- Save-manager slot selection that prefills a name and still requires Confirm/Start; rename collision, save-as-new, and confirmed delete.
- Reload and prefill, durable timer recovery, and permanent state carrying one or two rebirth counts.
- Portable code from the live run, clipboard/text/`.txt` equivalence, replace/new/cancel choices, and restore into a separate empty browser profile.
- Synthetic schema migration, damaged-generation recovery, quota failure preserving the old generation, blocked storage export/exit, and two-tab writer ownership.

Every stateful scenario captures a screenshot and compares a checked-in baseline. The shared harness checks that the app surface is visible and non-white and reports page/console errors or external requests.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npx.cmd playwright test tests/e2e/save-slots/save-slots.spec.ts --workers=1
```

For the related evidence ledgers, see [`save-load-local`](../save-load-local/README.md), [`save-migration`](../save-migration/README.md), and [`migration`](../migration/README.md). Rebirth counts are imported as deterministic save fixtures because the rebirth mechanic itself belongs to the later meta-progression phase.
