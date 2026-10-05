# Cosmic Rip browser area

`cosmic-rip.spec.ts` drives the normal tab and command path from a deterministic, already-located Rip. It restores the in-game telemetry network, completes all five timed technologies through the test clock, closes the Rip, and verifies the saved ending after reload. `cosmic-rip.spec.ts` also captures the closed state for the visual checkpoint.

The fixture skips the long Miaplacidus route while leaving scanner, research, GP spending, save, and closure controls in the production UI. The route gate itself is covered by the Miaplacidus journey in `tests/e2e/megastructures/` and the acknowledgement command unit test.

P-06 affordance coverage is also in `cosmic-rip.spec.ts`: dedicated deterministic fixtures check the 10 GP scanner restore and 1 GP closure costs, and visible localized precondition reasons with `aria-describedby` for scanner restore, sector scans, telemetry purchases, locked technology research, and closure. Sector accessible names include the 1 GP scan cost in all six locales. Upgrade cash uses the selected currency and material names localize in all six locales; the rapidly changing telemetry wallet is not an `aria-live` region. These additions still need a serialized focused browser run.

Verification record (4 October 2026): Chrome `npm.cmd run test:e2e:focused -- tests/e2e/cosmic-rip/cosmic-rip.spec.ts` passed 1 browser journey after status output styling was aligned with the existing visual baseline. The once-only G-43–G-50 unit suite passed 20 files / 207 tests. The Chrome channel was used because the bundled Chromium executable is not installed.
