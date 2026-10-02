# App boot and navigation: Hydrogen slice

## Rule matrix

| Rule                     | Normal path                                                                                                                                                                                 | Failure/boundary path                                                                      | Evidence                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Fresh run identity       | Enter a pioneer name, select a locale and start; reach the Hydrogen pane with $10, 50 RP, 0/150 Hydrogen and Hydrogen as the only unlocked resource.                                        | Blank names are blocked by the required input. All non-Hydrogen tabs stay locked.          | `hydrogen-boot.spec.ts`, unit initialization check.          |
| Stable navigation        | Nine semantic tabs retain IDs and matching panes; left/right arrow keys move selection and focus.                                                                                           | Locked destinations show their placeholder and cannot expose another feature.              | `hydrogen-boot.spec.ts`.                                     |
| First save-ready state   | The valid named run exposes stable language-independent engine state for Phase 2 serialization.                                                                                             | No save slot is read or overwritten before the Phase 2 save flow exists.                   | Fresh-run state assertions; persistence is deferred to M-02. |
| Locale and mobile layout | Switch through all six Hydrogen translations; the document language follows. At 390px, the long German labels and collect control remain usable with no document-level horizontal overflow. | Shared fixture fails on page/console errors or any request outside the local app origin.   | `hydrogen-boot.spec.ts`, shared fixture.                     |
| Startup rendering        | The welcome form and first Hydrogen pane render as visible, non-white screens and match screenshot baselines.                                                                               | A server that cannot compile TypeScript shows launch instructions instead of a blank page. | `hydrogen-boot.spec.ts`, committed screenshots.              |

## Deterministic setup and debug commands

The shared fixture clears local/session storage, uses seed `314159` and English, enters `Hydrogen Pioneer`, and starts through the real form. The explicit Spanish first-run test uses seed `90210`. The Test Lab is not needed for boot/navigation checks; its scenario controls are documented in the [autobuyer](../autobuyers/README.md) and [resource](../resources/README.md) READMEs.

Run with `npm run test:e2e:focused -- tests/e2e/app-boot/hydrogen-boot.spec.ts`. Add `MIAPLACIDUS_BROWSER_CHANNEL=chrome` when using an installed Chrome instead of Playwright's bundled browser.

## Observed result

2 October 2026: 5/5 app-boot tests passed in Chrome 153.0.8010.12. The startup, first-run, collected Hydrogen and locked Energy screens have checked-in screenshot baselines; the failure-path test confirms an uncompiled/static entry shows Vite instructions instead of a white screen. The remaining tests cover keyboard navigation, all six live locales, narrow viewport and local-only requests. See the [M-01 record](../../../docs/archive/plans/2026-10-02-hydrogen-vertical-slice.md).
