# Ascendency and rebirth

The browser area verifies ordinary UI access to the permanent AP balance, exact-cost perk spending and visible level changes. It also checks that disabled perk purchases expose selector-derived AP shortfalls to keyboard and screen-reader users in all six locales. Unit coverage exercises deterministic rebirth boundaries and exact perk costs.

`ascendency.spec.ts` uses the test-only `meta-rebirth-ready` fixture to prepare a pioneer with AP. The fixture is set up before the player interaction; the perk purchase is performed through the visible controls. The rebirth flow is covered in the matching [`rebirth` area](../rebirth/README.md).

Focused commands: `npm run test:unit:focused -- tests/unit/meta-progression.spec.ts` and `npm run test:e2e:focused -- tests/e2e/ascendency/ascendency.spec.ts`.

Verification: meta-progression unit area passed (15/15). On 5 October 2026, the focused Chrome Ascendency suite passed 2/2: exact-cost perk purchase and disabled AP-shortfall reasons verified in all six locales, with the disabled control linked to its localized explanation. Source cost ladders and all sixteen IDs are checked against docs/audit/foundation-meta.md; G-14 cross-system effects are covered by the portable-save and post-rebirth assertions in tests/unit/meta-progression.spec.ts. G-16 source totals include ordinary and Expansionist rebirth awards, casino and Miaplacidus achievement refunds, AP trades, and each Cosmic Rip GP sink.

## P-54 E-57 Ascendency and Rebirth localized context (10 October 2026)

p54-e57-ascendency-locale-context.spec.ts checks all 16 perk names, descriptions, current levels, and computed AP prices at 390px and 320px in all six locales. A second journey checks the localized Rebirth confirmation prompt, preserved AP amount, and actions, then cancels. Card, dialog, and document bounds are checked throughout; French 320px captures are attached for visual review. Both cases passed in the combined installed-Chrome E-57 Meta/Endgame batch, 13/13 in 57.5 seconds on port 4809. The French perk list and confirmation dialog were visually reviewed at 320px with no horizontal overflow.

## P-56 Ascendency Perks visual matrix (10 October 2026)

`p56-ascendency-visual-matrix.spec.ts` checks the deterministic Ascendency page in six locales, nine themes, and 1280/390/320px (162 locale/theme/viewport variants). Every variant verifies all 16 perk names, descriptions, level/cost rows, purchase controls, visible text fit, and pane/card/copy/control/document bounds. Phone widths also assert at least 180px for each card's copy column.

The first installed-Chrome run on port 6211 failed with 293 layout/text findings, concentrated at 320px. Review of the French/Space/320px capture confirmed that the fixed-width purchase column squeezed headings and descriptions into narrow text columns. At widths up to 600px, Ascendency cards now use one copy column and place their controls below it. The clean Chrome matrix passed 1/1 in 1.2 minutes on port 6212.

I reviewed the English/Terminal/1280px, German/Light/390px, and French/Space/320px captures. The 320px copy now wraps at word boundaries with the purchase control below; all cards stay within the pane and no document overflow remains. Captures are in `test-results-p56-ascendency-visual-6212/ascendency-p56-ascendency--88ff9-endency-visual-presentation-chrome/` (`p56-ascendency-en-terminal-1280.png`, `p56-ascendency-de-light-390.png`, and `p56-ascendency-fr-space-320.png`).

Focused checks passed: `npm.cmd run typecheck`, `.\node_modules\.bin\oxfmt.cmd --check tests/e2e/ascendency/p56-ascendency-visual-matrix.spec.ts src/styles.css`, and `git diff --check -- src/styles.css tests/e2e/ascendency/p56-ascendency-visual-matrix.spec.ts`.

Reproduce the matrix from PowerShell with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='6212'; npm.cmd run test:e2e:focused -- --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p56-ascendency-visual-6212 tests/e2e/ascendency/p56-ascendency-visual-matrix.spec.ts
```

This adds Ascendency content/theme evidence; P-56 remains open for other screen families.
