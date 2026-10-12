import { describe, expect, it, vi } from "vitest";
import type { EngineEvent } from "../../src/engine/commands";
import { createRandomEventEndNoticeHandler } from "../../src/app/randomEventEndNotifications";

describe("random event end notifications", () => {
  it("routes each timed event expiry to an informational notice", () => {
    const notices: { message: string; classification: string; type: string; durationMs: number }[] =
      [];
    const events: EngineEvent[] = [
      { type: "random-event.ended", id: "galacticMarketLockdown", targetId: null },
      { type: "random-event.ended", id: "endlessSummer", targetId: null },
      { type: "random-event.ended", id: "minerBrokeDown", targetId: null },
      { type: "random-event.ended", id: "supplyChainDisruption", targetId: null },
      { type: "random-event.ended", id: "blackHoleInstability", targetId: null },
    ];

    createRandomEventEndNoticeHandler(
      () => "en",
      () => true,
      (notice) => notices.push(notice),
    )(events);

    expect(notices.map(({ message }) => message)).toEqual([
      "Galactic Market access restored.",
      "Endless Summer has ended.",
      "Mining operations restored.",
      "Supply chains restored.",
      "Black Hole Instability stabilised.",
    ]);
    expect(notices.every((notice) => notice.type === "info" && notice.durationMs === 5000)).toBe(
      true,
    );
  });

  it("includes the repaired rocket and restored good when the event retains a target", () => {
    const notices: { message: string }[] = [];
    const handler = createRandomEventEndNoticeHandler(
      () => "en",
      () => true,
      (notice) => notices.push(notice),
      (eventId, targetId) =>
        eventId === "minerBrokeDown" && targetId === "rocket2"
          ? "Odyssey"
          : eventId === "supplyChainDisruption" && targetId === "steel"
            ? "Steel"
            : null,
    );

    handler([
      { type: "random-event.ended", id: "minerBrokeDown", targetId: "rocket2" },
      { type: "random-event.ended", id: "supplyChainDisruption", targetId: "steel" },
    ]);

    expect(notices.map(({ message }) => message)).toEqual([
      "Mining operations restored, Odyssey has been repaired.",
      "Supply chains restored (Steel).",
    ]);
  });

  it("respects the notification preference", () => {
    const notify = vi.fn();
    const handler = createRandomEventEndNoticeHandler(
      () => "en",
      () => false,
      notify,
    );

    handler([{ type: "random-event.ended", id: "endlessSummer", targetId: null }]);

    expect(notify).not.toHaveBeenCalled();
  });
});
