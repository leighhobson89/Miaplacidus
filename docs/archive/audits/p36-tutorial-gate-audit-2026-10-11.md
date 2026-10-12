# P-36 tutorial gate audit — 11 October 2026

## Research-building pause gate

`src/app/ProgressionTutorial.tsx` previously considered the **Pause a Science Kit** milestone complete only when total research production reached zero. That condition could block a player who started the tutorial after buying Science Clubs or other research producers: disabling the Science Kits would leave the other buildings producing RP, so the tutorial could not continue even though its requested action was complete.

Moved the state-derived milestone check into `src/engine/tutorialProgression.ts` and made the pause gate depend on the three built Science Kits being disabled. The follow-up rate explanation still presents the actual total RP/s, including other active buildings; resuming the kits requires the kits to be enabled again. This also keeps the `pauseScienceKit` and `resumeScienceKit` predicates paired around the actual control state.

Added `tests/unit/progression-tutorial-gates.spec.ts` to cover three paused kits while one Science Club continues producing RP. The test was not run, per the assigned no-test instruction. No tutorial state schema, command sequence, or save migration changed. Save/resume continues to persist the current step through `permanent.progressionTutorial`; the reviewed transition commands accept start once, advance only the active step, and complete only from the final step.
