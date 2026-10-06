# App boot and navigation: Hydrogen slice

## Rule matrix

| Rule                     | Normal path                                                                                                                                                                                              | Failure/boundary path                                                                      | Evidence                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Fresh run identity       | Enter a pioneer name and locale, press Start, and reach the Hydrogen pane directly with $10, 50 RP, 0/150 Hydrogen and Hydrogen as the only unlocked resource. Miaplaedia has no briefing replay button. | Blank names are blocked by the required input. Locked main gameplay tabs are absent.       | `hydrogen-boot.spec.ts`, unit initialization check. |
| Stable navigation        | Keep visible tabs in source order; Settings and Miaplaedia stay last, and arrow keys move only among visible tabs.                                                                                       | Locked destinations have no top-level tab or placeholder.                                  | `hydrogen-boot.spec.ts`.                            |
| First save-ready state   | Start creates the first safe local checkpoint and exposes stable language-independent engine state. The save status is visible.                                                                          | No slot is read or created before the confirmed name reaches Start.                        | Fresh-run state assertions; M-02 save-slot tests.   |
| Locale and mobile layout | Switch through all six Hydrogen translations; the document language follows. At 390px, the long German labels and collect control remain usable with no document-level horizontal overflow.              | Shared fixture fails on page/console errors or any request outside the local app origin.   | `hydrogen-boot.spec.ts`, shared fixture.            |
| Startup rendering        | The welcome form and first Hydrogen pane render as visible, non-white screens and match screenshot baselines; a new save opens directly into play.                                                       | A server that cannot compile TypeScript shows launch instructions instead of a blank page. | `hydrogen-boot.spec.ts`, committed screenshots.     |

## Deterministic setup and debug commands

The shared fixture clears local/session storage, uses seed `314159` and English, enters `Hydrogen Pioneer`, and starts through the real form. The explicit Spanish first-run test uses seed `90210` and verifies the first Hydrogen screen and the removed Miaplaedia replay control. The Cosmic Forge scenario menu opens with NumpadSubtract (`-`); the Test Lab keeps its separate dialog on NumpadAdd (`+`). Scenario controls are documented in the [debug menu area](../debug-menu/README.md), [autobuyer](../autobuyers/README.md), and [resource](../resources/README.md) READMEs.

Run with `npm run test:e2e:focused -- tests/e2e/app-boot/hydrogen-boot.spec.ts`. Add `MIAPLACIDUS_BROWSER_CHANNEL=chrome` when using an installed Chrome instead of Playwright's bundled browser.

## Observed result

2 October 2026: 5/5 app-boot tests passed in Chrome. The startup, first-run, collected Hydrogen and legacy locked-Energy screens have checked-in historical screenshot baselines; the locked-Energy image predates the current rule that omits unavailable main tabs. The failure-path test confirms an uncompiled/static entry shows Vite instructions instead of a white screen. The current `@ui-navigation` assertions supersede that legacy locked-tab behavior. See the [M-01 record](../../../docs/archive/plans/2026-10-02-hydrogen-vertical-slice.md) and [M-02 record](../../../docs/archive/plans/2026-10-02-local-saves.md).

4 October 2026: the focused `@ui-navigation` area passed 4/4 cases in installed Chrome 154. The fresh-run checks confirmed the filtered sequence `Resources`, `Research`, `Settings`, `Miaplaedia`, absence of the Energy tab, keyboard movement through that visible order, Galactic Casino under Galactic, and Rocket 1 appearing without Rocket 2–4 after Rocket 1 is built. The startup and Hydrogen screenshots were regenerated for the current Terminal theme and startup art after visual comparison.

4 October 2026: the focused `@progression` Chrome case passed 1/1. It opened each visible tab from a technology-unlocked fixture and a later Galactic/Cosmic Rip fixture, checking that missing tabs do not change the relative source order. Both states have checked-in screenshots.

5 October 2026: the focused `navigation-progression.spec.ts` Chrome case passed 1/1 after refreshing its screenshots for the current shell. It checked every visible main tab in technology and meta unlock states, confirmed Space Mining opens on Launch Pad when available, selected Telescope when Launch Pad remained locked, and confirmed Rocket 1–4 child panes remain hidden before construction. The current Miaplaedia screenshot has no opening briefing replay control.

5 October responsive follow-up: all visible tabs in both progression fixtures passed document-width assertions at 390px, including Galactic Casino and Cosmic Rip child pages.

5 October keyboard follow-up: the focused Chrome case passed 1/1 with a full progression fixture. It verified End and ArrowRight wraparound across main tabs, ArrowRight and End across the eight Resources children, and that focus stays on the selected destination. The checked-in `navigation-keyboard-resource-children` screenshot records the selected Iron page. A separate save-slots case confirms Escape closes Save Manager and restores focus to its opener.

5 October source destination identity follow-up: the `navigation-progression.spec.ts` area now also checks Compounds' rendered child pages and their `data-source-option-id` values against Cosmic Forge: Diesel/1, Water/5, Glass/2, Concrete/4, Steel/3, Titanium/6, grouped as Liquids then Solids. The full focused navigation-progression file passed 3/3 in Chrome; its screenshots were refreshed after removing the duplicate Resources rail heading.

5 October tab ownership follow-up: source side menus are scoped to their parent tab. The Chrome progression route now confirms the Resources stock rail is visible only on Resources across every visible tab in technology and meta unlock fixtures; other content uses the full content width. The refreshed progression screenshots were visually reviewed.

5 October Hydrogen pane cleanup: first-run and six-locale browser checks assert the Hydrogen page has no redundant `Resources` heading or `Hydrogen starts unlocked` intro beneath its dedicated overview. Its Spanish screenshot baseline is refreshed from the current live pane.

The `single-save-navigation-route.spec.ts` journey extends that early progression on one local pioneer: it starts a fresh run through the name form, collects Hydrogen, buys a Science Kit, researches Knowledge Sharing, saves and resumes the same slot, then applies the test-only late-game navigation checkpoint to that active save. It saves and resumes the same slot again before using keyboard navigation and actions through Interstellar, Galactic (with Casino third in its child order), and Cosmic Rip. The checkpoint is deterministic navigation integration coverage; it does not claim natural late-game progression, which remains covered by the focused gameplay areas.
