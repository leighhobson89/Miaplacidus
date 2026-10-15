# Star Types E2E coverage

The focused case checks the F-type Antimatter Mining bonus through the active Mining page. It holds the asteroid fixed in Spica, changes the saved current star to an F-type system, verifies the visible rate rises by 1.5×, then advances five seconds and checks actual asteroid depletion against the boosted rate. This keeps the asteroid's generation system distinct from the player's current system.

## Source parity and result

Cosmic Forge uses the current star system for both the displayed Mining rate and extraction. MIAPLACIDUS now uses `currentSystemId` for both calculations as well. The canonical area runner passed **1/1 in 8.6 seconds** in installed Chrome on port 6752; adjacent Antimatter coverage is recorded separately in [`antimatter`](../antimatter/README.md).
