# Battle and settlement

Chrome coverage follows the diplomacy, war, attrition and colonization controls from an orbiting starship. The fixtures exercise hostile victory, hostile defeat and rebuild/retry, both bully outcomes, vassalization success and failure, forced war, and an unoccupied settlement.

Battle fixtures keep ships and hull grouped by fleet class. Advancing the injected clock runs the same saved timer path used during play, so these cases verify that outcomes, destination identity, fleet losses and settlement rewards survive engine state transitions.

Run the area with `npm run test:e2e:focused -- tests/e2e/battle/battle.spec.ts`. The broader I-37–I-47 checkpoint also includes the unit and browser suite after the remaining Phase 4 work is complete.
