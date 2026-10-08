# Phase 6 interaction audit handoff — 7 October 2026

Scope: focused audit of P-05, P-06, P-14, P-20 and P-21, emphasizing Galactic Casino controls, shortfall explanations, and mouse-independent use. This is a partial audit, not a Phase 6 sign-off.

## Findings

- **P-05 — mechanics actions:** Casino actions are semantic buttons; payment, stake, prize and tier inputs have labels. The wheel artwork is `aria-hidden`; spinning and claiming use separate buttons, so the artwork itself is not a mouse-only control. Existing keyboard coverage operates all four games. This slice did not audit every other game mechanic. Casino secondary buttons currently have a CSS minimum height of `2.45rem` (39.2px with a 16px root font); no touch-target measurement was run, so the “tiny target” criterion remains unverified.
- **P-06 — costs and failure reasons:** Casino UI uses engine selectors for purchase affordability and game action availability. The focused affordance case checks purchase, Wheel, Higher or Lower, and Double or Nothing shortfalls, verifies visible localized reasons and `aria-describedby`, then checks exact costs, stake/payout previews and resulting balances. Existing evidence is documented in [the Casino browser README](../../tests/e2e/galactic-casino/README.md). No fresh test completed during this audit.
- **P-14 — touch and keyboard:** Existing keyboard coverage buys CP, claims a Wheel prize, plays Double or Nothing, guesses in Higher or Lower, and uses Void Seer. The expanded 390px touch journey now passes cleanly through point purchase, Wheel/claim, Double or Nothing, Higher or Lower/cash-out, and Void Seer. This verifies the four Casino games' touch path; other game touch paths remain open.
- **P-20 — screen-reader announcements:** The Casino result output already has `aria-live="polite"`, and its keyboard test observes the Wheel result through a status role. The CP purchase shortfall exposes `role="status"` and `aria-live="polite"`; the focused browser check verified the semantics. Starship construction now keeps an initially empty, visually hidden polite atomic status output mounted before scan; a successful scan fills it with the localized life-detection result. The focused Chrome journey passed and asserts the empty-to-populated transition after selecting Starship construction. The announcement is scoped to destination and Rebirth so a new encounter clears old status text. No assistive-technology run has been recorded. P-20 remains open across Casino, Starship and the rest of the application.
- **P-21 — keyboard/touch completion:** The save-picker keyboard and touch paths cover new-game creation, saved-name selection and resume. Casino has separate keyboard coverage and partial touch coverage, not a single end-to-end late-game completion journey. Representative late-game completion remains open.

## Casino slice status

The Casino source/test edits are:

- [`GalacticCasinoPane.tsx`](../../src/app/GalacticCasinoPane.tsx): made the CP purchase shortfall paragraph a polite status region.
- [`galactic-casino.spec.ts`](../../tests/e2e/galactic-casino/galactic-casino.spec.ts): added assertions for that status semantics and expanded the 390px touch test to exercise all four games.

The initial run was interrupted while I was complying with a stop request. The first combined rerun exposed a stale expanded-number expectation and a fixture-order issue; both were corrected. On 8 October the focused Chrome command below passed 2/2 in 10.3 seconds with a clean runner exit, covering purchase-shortfall status semantics and the complete 390px touch journey. This resolves the outstanding Casino verification in this slice; broader P-14/P-20 review remains open.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/galactic-casino/galactic-casino.spec.ts -g 'touch users can buy points|Casino entry costs' --workers=1 --reporter=line
```

Previously recorded 5 October Casino keyboard/touch and P-06 browser results predate these edits; they remain historical evidence only.

## P-20 Black Hole timer announcement slice

The Black Hole pane showed `Charge ready` after the charge timer completed, but did not announce that transition. Added a localized, screen-reader-only polite announcement on the charging-to-ready edge. Countdown refreshes remain silent; a pane that mounts with an already-ready save does not announce a false completion. The focused unit spec [black-hole-announcements.spec.tsx](../../tests/unit/black-hole-announcements.spec.tsx) passed 2/2, checking the transition behavior in all six locales and the persistent polite live-region markup. Typecheck, targeted Oxlint, and Oxfmt checks passed. No Playwright or assistive-technology run was performed for this slice; P-20 remains open outside this narrow coverage.
