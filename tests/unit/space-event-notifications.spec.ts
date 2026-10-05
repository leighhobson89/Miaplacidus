import { describe, expect, it } from "vitest";
import { createStarCatalogue } from "../../src/content/starCatalogue";
import { ROCKET_IDS } from "../../src/content/space";
import { LOCALE_IDS } from "../../src/content/ids";
import { createInitialGameState } from "../../src/engine/state";
import { createGameStore } from "../../src/engine/store";
import type { EngineEvent } from "../../src/engine/commands";
import {
  createSpaceEventNoticeHandler,
  spaceEventNotice,
} from "../../src/app/spaceEventNotifications";
import { withGameAudio } from "../../src/app/audio";
import {
  SPACE_NOTIFICATION_MESSAGES,
  type SpaceNotificationMessageKey,
} from "../../src/i18n/spaceNotificationMessages";

const state = createInitialGameState();
const systemId = createStarCatalogue()[0]!.id;
const rocketId = ROCKET_IDS[0];
const asteroidId = "asteroid-test";

describe("space event notifications", () => {
  it("localizes every routed travel, hazard, and battle notice in all six locales", () => {
    const events: readonly EngineEvent[] = [
      { type: "space.starship.launched", systemId, durationMs: 1000, antimatterSpent: 1 },
      { type: "space.starship.arrived", systemId },
      { type: "space.rocket.launched", rocketId },
      { type: "space.rocket.travel-started", rocketId, asteroidId, direction: "outbound" },
      { type: "space.rocket.travel-started", rocketId, asteroidId, direction: "returning" },
      { type: "space.rocket.arrived", rocketId, asteroidId },
      { type: "space.rocket.returned", rocketId, asteroidId },
      { type: "space.weather.changed", condition: "rain" },
      { type: "space.weather.changed", condition: "heavyRain" },
      { type: "space.weather.changed", condition: "volcano" },
      { type: "space.battle.finished", systemId, result: "victory", scannerBuilt: false },
      { type: "space.battle.finished", systemId, result: "defeat", scannerBuilt: false },
    ];

    for (const locale of LOCALE_IDS) {
      const notices = events.map((event) => spaceEventNotice(locale, event, state));
      expect(notices).toHaveLength(12);
      expect(notices.every((notice) => notice !== null && notice.message.length > 0)).toBe(true);
      expect(notices.map((notice) => notice?.classification)).toEqual([
        "starShip",
        "starShip",
        "rocket",
        "rocket",
        "rocket",
        "rocket",
        "rocket",
        "weather",
        "weather",
        "weather",
        "battle",
        "battle",
      ]);
      expect(notices.every((notice) => !notice?.message.includes("{"))).toBe(true);
      expect(notices[6]?.message).toContain(asteroidId);
    }
  });

  it("keeps message placeholders in parity across all six locales", () => {
    const keys = Object.keys(SPACE_NOTIFICATION_MESSAGES.en) as SpaceNotificationMessageKey[];
    const placeholders = (template: string) =>
      [...template.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]).sort();

    for (const locale of LOCALE_IDS) {
      for (const key of keys) {
        expect(placeholders(SPACE_NOTIFICATION_MESSAGES[locale][key])).toEqual(
          placeholders(SPACE_NOTIFICATION_MESSAGES.en[key]),
        );
      }
    }
  });

  it("includes known star, rocket, and asteroid names and meaningful notice types", () => {
    const starName = createStarCatalogue().find((star) => star.id === systemId)!.name;
    const namedState = {
      ...state,
      run: {
        ...state.run,
        space: {
          ...state.run.space,
          rockets: {
            ...state.run.space.rockets,
            [rocketId]: { ...state.run.space.rockets[rocketId], name: "Pioneer One" },
          },
        },
      },
    };

    const launch = spaceEventNotice(
      "en",
      { type: "space.starship.launched", systemId, durationMs: 1000, antimatterSpent: 1 },
      namedState,
    );
    const rocket = spaceEventNotice(
      "en",
      { type: "space.rocket.arrived", rocketId, asteroidId },
      namedState,
    );
    const victory = spaceEventNotice(
      "en",
      { type: "space.battle.finished", systemId, result: "victory", scannerBuilt: false },
      namedState,
    );
    const defeat = spaceEventNotice(
      "en",
      { type: "space.battle.finished", systemId, result: "defeat", scannerBuilt: false },
      namedState,
    );

    expect(launch?.message).toContain(starName);
    expect(rocket?.message).toContain("Pioneer One");
    expect(rocket?.message).toContain(asteroidId);
    expect(rocket?.type).toBe("success");
    expect(victory?.type).toBe("success");
    expect(defeat?.type).toBe("error");
  });

  it("does not notify on progress, individual rounds, travel shortening, or ordinary weather", () => {
    const ignored: readonly EngineEvent[] = [
      { type: "space.battle.round", systemId, round: 1 },
      { type: "space.starship.travel.shortened", systemId, remainingMs: 100 },
      { type: "space.weather.changed", condition: "clear" },
      { type: "space.weather.changed", condition: "cloudy" },
    ];

    expect(ignored.map((event) => spaceEventNotice("en", event, state))).toEqual([
      null,
      null,
      null,
      null,
    ]);
  });

  it("notifies once when weather enters a hazard and ignores repeat and ordinary cycles", () => {
    const notices: string[] = [];
    const baselineState = {
      ...state,
      run: {
        ...state.run,
        space: { ...state.run.space, currentSystemWeather: "clear" as const },
      },
    };
    expect(
      spaceEventNotice("en", { type: "space.weather.changed", condition: "rain" }, baselineState),
    ).not.toBeNull();
    const handler = createSpaceEventNoticeHandler(
      () => "en",
      () => baselineState,
      (notice) => {
        notices.push(notice.message);
      },
    );

    handler([
      { type: "space.weather.changed", condition: "rain" },
      { type: "space.weather.changed", condition: "rain" },
      { type: "space.weather.changed", condition: "cloudy" },
      { type: "space.weather.changed", condition: "clear" },
    ]);

    expect(notices).toHaveLength(1);
    expect(notices[0]).toContain("blocking rocket launches");
  });

  it("suppresses a hazard notice when notifications are disabled in the same accepted batch", () => {
    const clearState = {
      ...state,
      run: {
        ...state.run,
        space: { ...state.run.space, currentSystemWeather: "clear" as const },
      },
    };
    const engineStore = createGameStore(clearState, { clock: { now: () => 0 } });
    const store = withGameAudio(engineStore);
    const notices: string[] = [];
    store.subscribeEvents(
      createSpaceEventNoticeHandler(
        () => "en",
        () => store.getState(),
        (notice) => notices.push(notice.message),
      ),
    );

    const results = store.dispatchBatch([
      { type: "settings.update", patch: { notificationsEnabled: false } },
      { type: "space.weather.set-condition", condition: "rain" },
    ]);

    expect(results.every((result) => result.accepted)).toBe(true);
    expect(results[1]?.events.some((event) => event.type === "space.weather.changed")).toBe(true);
    expect(notices).toEqual([]);
    store.dispose();
  });
});
