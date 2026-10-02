# Existing tests and debug tooling

## What Cosmic Forge actually uses

The planned focused remake checks for source-extraction scenarios are in the [foundation test plan](foundation-test-plan.md). No test specification or harness script was added by F-01–F-10.

The active suite is Playwright E2E under [tests/e2e](../../../cosmicForge/cosmicForge/tests/e2e/README.md), organized into **50 functional area folders**. There are **103 `.spec.js` files** in the snapshot. [playwright.config.js](../../../cosmicForge/cosmicForge/playwright.config.js) uses Chromium, a local static server, HTML and JSON output, a custom progress reporter, screenshots on failure, and trace/video retention on failure. [tests/run-e2e.mjs](../../../cosmicForge/cosmicForge/tests/run-e2e.mjs) runs each populated area separately and produces an aggregate index. It supports area selection, headed/slow mode, Playwright pass-through args and migration-version runs. [running-tests.md](../../../cosmicForge/cosmicForge/tests/docs/running-tests.md) is the operator guide.

The [functional-area taxonomy](../../../cosmicForge/cosmicForge/tests/docs/functional-areas.json) is more useful than the older GDD for planning parity. It groups foundation, economy, space, interstellar, meta, endgame, simulation and presentation. The generated coverage report calls every area green, but no tests were run during this audit; treat that as prior project status.

## Fixture design worth retaining

The [game fixture](../../../cosmicForge/cosmicForge/tests/e2e/_harness/game-fixture.mjs) starts a fresh session, handles the real pioneer/fullscreen/onboarding flow, optionally seeds language, exposes real game modules, captures page errors, navigates tabs and panes, advances delta timers, and supports in-app debug tools. The browser fixture avoids old cloud-save fixtures because they are below the minimum supported version and create a production network dependency. The [navigation helper](../../../cosmicForge/cosmicForge/tests/e2e/_harness/navigation.mjs) walks every `tabN.optionM` row and records the rendered pane. That is a strong basis for localization/notation and information parity checks.

Prefer the fixture's philosophy: a real browser, a clean save per test, deterministic scenario setup, and observable outcomes through the interface. The remake can improve on it by using stable semantic selectors and typed test APIs. Avoid routine `new Function`/module injection or bypassing unlocks in behavior tests; reserve direct state inspection for a narrow diagnostic layer. Separate pure domain tests from E2E checks so each does the work it is best at.

## In-game debug surfaces

Cosmic Forge has two debug windows in [index.html](../../../cosmicForge/cosmicForge/index.html), wired by [ui.js](../../../cosmicForge/cosmicForge/ui.js): `Numpad -` opens scenario actions and `Numpad *` opens a variable editor. The `Test1981` pioneer name is accepted by the old hotkey gate. The scenario menu can grant cash/materials/technology/AP/CP, set up rockets and starship, choose events, change weather/news, time warp, and jump to late-game states. `prepareRunForStarshipLaunch()` chains those actions in the fixture. The variable editor can force casino outcomes. These controls are powerful and should be **recreated as test/development-only domain commands**, with UI affordances in a non-production build; do not copy the player-name backdoor.

Debug commands should use the same reducers/services as player actions where possible, validate preconditions, log the scenario seed, and be callable by the Playwright fixture. Add a deterministic random source and controllable clock. A test that asserts an unlock rule must reach the state through a normal player path or assert the rule directly; setup cheats are only for reaching a distant prerequisite state.

## Test debt to address in the remake

- Some old specs use `page.evaluate` to call modules or dispatch synthetic clicks, which can prove internal state while skipping pointer/focus/accessibility behavior. Use role/label locators for normal interaction, then inspect state only as a secondary assertion.
- The old fixture suppresses some network/favicon console errors and attaches unexpected errors without globally failing. The remake should classify expected faults explicitly and fail boot/critical-path tests on unexpected errors.
- Existing reports mix generated area status and actual test results. The remake should publish one current result manifest with run commit, browser, area, counts and trace paths.
- Browser-only Chromium covers the old baseline. After the browser MVP, add Firefox/WebKit and keyboard/mobile checks where support is intended, without making all 50 areas run on every small edit.
- The new project must not depend on Cosmic Forge source paths or production cloud. Copy scenario intent into new fixtures as each feature is implemented.

The concrete new [test harness plan](../plans/test-harness.md) and empty area folders are ready for future specs. No test or harness scripts were created in this setup phase.
