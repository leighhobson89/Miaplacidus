import { describe, expect, it } from "vitest";
import { audioCueForEvent } from "../../src/app/audio";
import { createInitialGameState } from "../../src/engine/state";

describe("Starship audio cue routing", () => {
  it("maps launch and arrival to their source-specific cues", () => {
    const state = createInitialGameState();

    expect(
      audioCueForEvent(
        {
          type: "space.starship.launched",
          systemId: state.run.space.currentSystemId,
          durationMs: 30_000,
          antimatterSpent: 1,
        },
        state,
      ),
    ).toBe("starShipLaunch");

    expect(
      audioCueForEvent(
        { type: "space.starship.arrived", systemId: state.run.space.currentSystemId },
        state,
      ),
    ).toBe("starShipArrive");
  });
});
