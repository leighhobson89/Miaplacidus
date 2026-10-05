# Phase 7 — verification and browser release

**Outcome:** MIAPLACIDUS can be released as a dependable browser game on desktop and responsive mobile, with auditable gameplay coverage and safe local saves. This package expands [M-07](../master-checklist.md). The normal artifact is the full game; an optional demo requires an explicit flag. No Electron, cloud saving, original Cosmic Forge save import or analytics is planned.

## Evidence and functional coverage

- [ ] **V-01** Freeze the tested MIAPLACIDUS commit, dependency lockfile and Cosmic Forge source reference used for parity comparison.
- [ ] **V-02** Ensure each applicable functional area in the [parity ledger](../feature-parity-checklist.md) has a current rule map, normal/failure case and owner.
- [ ] **V-03** Ensure each populated E2E area has a README with setup, deterministic scenarios, commands and latest result.
- [ ] **V-04** Run focused pure-rule tests for precision, tick ordering, timers, randomness, economy, space, combat and meta progression.
- [ ] **V-05** Run focused browser areas as each domain closes, using user controls and observable results.
- [ ] **V-06** Compare fixed early, mid, travel, rebirth and endgame scenarios against the source; record approved deviations.
- [ ] **V-07** Verify the nine source tabs in fixed source order followed by Miaplaedia; locked main gameplay tabs are absent, tab labels show names only, and Settings then Miaplaedia remain directly reachable from a clean save.
- [ ] **V-08** Verify a complete run through both the Miaplacidus and Cosmic Rip end routes.
- [ ] **V-09** Verify event, news, achievement, casino and philosophy branches that a normal happy-path run may miss.
- [ ] **V-10** Check source coverage for eight resources, six compounds, four rockets, four philosophies, nine themes and six locales.
- [ ] **V-11** Confirm no old green test or stale fixture is counted as evidence for the new implementation.
- [ ] **V-12** Review all known source quirks and approved balance changes against documented player impact.

## Save and recovery gates

- [ ] **V-13** Test two independent pioneer slots over several sessions, with different progression and settings.
- [ ] **V-14** Verify last-started pioneer prefill and changed confirmed-name loading exactly at Start.
- [ ] **V-15** Verify that Confirm/cancel without Start creates no slot and mutates no existing save.
- [ ] **V-16** Verify local autosave, manual save, reload and offline return at early, travel, rebirth and endgame states.
- [ ] **V-17** Verify text, clipboard and downloaded file encode the same LZString snapshot and restore it in a fresh browser profile.
- [ ] **V-18** Verify imports from every shipped MIAPLACIDUS schema version through the current migration ladder.
- [ ] **V-19** Verify Cosmic Forge and unknown codes are rejected clearly without altering any save.
- [ ] **V-20** Inject quota, blocked-storage, corrupt payload, stale index and interrupted-write failures; verify recovery paths.
- [ ] **V-21** Test concurrent tabs editing one slot and ensure no silent overwrite after a revision conflict.
- [ ] **V-22** Test rename, delete, replace and import conflict confirmations with an export opportunity.
- [ ] **V-23** Confirm unrelated origin storage keys are never cleared or rewritten.
- [ ] **V-24** Check compressed save growth and warning behavior using representative late-game slots.

## Browser, accessibility and performance

- [ ] **V-25** Define and record supported desktop and mobile browser versions and minimum practical viewport widths.
- [ ] **V-26** Smoke-test the supported browser matrix, including touch and keyboard input where relevant.
- [ ] **V-27** Check portrait/narrow, tablet and wide desktop layouts for overflow and obscured game controls.
- [ ] **V-28** Run keyboard-only navigation through startup, save manager, core loop and representative endgame actions.
- [ ] **V-29** Check accessible names, landmarks, dialog focus, status announcements and all nine themes' contrast.
- [ ] **V-30** Check reduced motion, zoom and larger text without blocking play.
- [ ] **V-31** Run the six-language key/placeholder validator and inspect long text in representative panels.
- [ ] **V-32** Measure first boot, first interactive screen, map open, tab transitions and steady tick frame time.
- [ ] **V-33** Measure heap, DOM node and listener growth during long idle, repeated tab changes and several rebirths.
- [ ] **V-34** Stress concurrent rockets, telescope, weather, event timers, star travel and black-hole warp.
- [ ] **V-35** Confirm background/hidden-tab throttling and long offline return do not duplicate progress or stall the UI.
- [ ] **V-36** Verify no required runtime library loads from a CDN and the game boots without network after assets are available.

## Build, security and distribution

- [ ] **V-37** Define the default full-browser build and an explicit opt-in demo flag with reproducible commands.
- [ ] **V-38** Confirm the default build exposes all nine source tabs in fixed order as their gates unlock, Miaplaedia follows Settings, and full progression is available; no demo restriction is active accidentally.
- [ ] **V-39** If the optional demo is produced, verify its intended restrictions, labels and save rules separately.
- [ ] **V-40** Verify production bundles omit debug menus, test gateway, cheat commands and source-only development tools.
- [ ] **V-41** Verify there are no cloud-save UI controls, account routes, Supabase save calls or network-dependent progression paths.
- [ ] **V-42** Verify there are no analytics collectors, endpoints, analytics preferences or consent flows.
- [ ] **V-43** Verify no Electron code/installer or copied Cosmic Forge binary asset enters the distribution.
- [ ] **V-44** Validate imported save size/schema before parsing and reject unsafe rich text in localized or imported content.
- [ ] **V-45** Review dependencies and bundled licenses for the browser artifact and remade assets.
- [ ] **V-46** Build and smoke-test the production artifact through its real hosted URL/path, including deep reloads.
- [ ] **V-47** Test browser storage behavior under private browsing, disabled storage and cleared site data.
- [ ] **V-48** Document deployment, cache/update strategy and a player-facing export reminder before a release update.

## Final review and handoff

- [ ] **V-49** Reconcile every detailed task and parity row with implemented code and observed evidence.
- [ ] **V-50** Close known critical save-loss, progression-blocking, localization and mobile-control defects.
- [ ] **V-51** Document remaining noncritical issues with player impact and workaround where possible.
- [ ] **V-52** Produce concise player help for multiple slots, confirmed-name Start, exports, imports and browser-storage limits.
- [ ] **V-53** Produce a developer handoff with architecture map, content catalogue, save schema and migration rules.
- [ ] **V-54** Archive completed feature plans and attach the current focused test results to area documentation.
- [ ] **V-55** Obtain the owner's quick OK on the six-language review sample and record it.
- [ ] **V-56** Seek project approval before the repository's **full** test-suite run, as required by [AGENTS.md](../../../AGENTS.md); then run and record it.
- [ ] **V-57** Review the release candidate from a clean browser profile and an existing MIAPLACIDUS save.
- [ ] **V-58** Record release version, artifact hash, known deviations, test summary and owner acceptance in a final release note.

**Exit gate:** the default full browser release is playable on desktop and mobile, current save data is recoverable, feature coverage and testing evidence are linked, and all critical defects are resolved. A demo is a separate, explicitly flagged deliverable if chosen.
