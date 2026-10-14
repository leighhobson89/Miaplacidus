import { describe, expect, it } from "vitest";
import {
  MAX_VISIBLE_GAME_NOTIFICATIONS,
  NotificationScheduler,
} from "../../src/app/notificationScheduler";

interface Notice {
  readonly id: number;
  readonly classification: string;
  readonly message: string;
}

function notice(id: number, classification: string): Notice {
  return { id, classification, message: `${classification}-${id}` };
}

describe("NotificationScheduler", () => {
  it("shows no more than two notices from any classifications", () => {
    const scheduler = new NotificationScheduler<Notice>();
    const categories = ["tech", "weather", "storage", "achievement"];

    categories.forEach((classification, index) => {
      scheduler.enqueue(notice(index + 1, classification));
      expect(scheduler.snapshot().length).toBeLessThanOrEqual(MAX_VISIBLE_GAME_NOTIFICATIONS);
    });

    expect(MAX_VISIBLE_GAME_NOTIFICATIONS).toBe(2);
    expect(scheduler.snapshot().map((item) => item.id)).toEqual([1, 2]);
  });

  it("promotes queued notices in arrival order as visible slots open", () => {
    const scheduler = new NotificationScheduler<Notice>();
    for (let id = 1; id <= 4; id += 1) scheduler.enqueue(notice(id, `category-${id}`));

    expect(scheduler.dismiss(2).map((item) => item.id)).toEqual([3]);
    expect(scheduler.snapshot().map((item) => item.id)).toEqual([1, 3]);
    expect(scheduler.dismiss(1).map((item) => item.id)).toEqual([4]);
    expect(scheduler.snapshot().map((item) => item.id)).toEqual([3, 4]);
    expect(scheduler.dismiss(3)).toEqual([]);
    expect(scheduler.snapshot().map((item) => item.id)).toEqual([4]);
  });

  it("allows manual dismissal and ignores an already inactive id", () => {
    const scheduler = new NotificationScheduler<Notice>();
    scheduler.enqueue(notice(1, "weather"));
    scheduler.enqueue(notice(2, "achievement"));
    scheduler.enqueue(notice(3, "debug"));

    expect(scheduler.dismiss(99)).toEqual([]);
    expect(scheduler.dismiss(1).map((item) => item.id)).toEqual([3]);
    expect(scheduler.snapshot().map((item) => item.id)).toEqual([2, 3]);
  });

  it("clears visible and queued notices", () => {
    const scheduler = new NotificationScheduler<Notice>();
    scheduler.enqueue(notice(1, "tech"));
    scheduler.enqueue(notice(2, "weather"));
    scheduler.enqueue(notice(3, "weather"));

    scheduler.clear();
    expect(scheduler.snapshot()).toEqual([]);
    scheduler.enqueue(notice(4, "achievement"));
    expect(scheduler.snapshot().map((item) => item.id)).toEqual([4]);
    expect(scheduler.dismiss(4)).toEqual([]);
    expect(scheduler.snapshot()).toEqual([]);
  });
});
