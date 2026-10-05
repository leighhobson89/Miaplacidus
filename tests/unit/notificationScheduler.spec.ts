import { describe, expect, it } from "vitest";
import {
  MAX_VISIBLE_NOTIFICATION_CLASSIFICATIONS,
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
  it("keeps only four classifications visible and promotes waiting categories in order", () => {
    const scheduler = new NotificationScheduler<Notice>();
    const categories = ["tech", "fuse", "weather", "storage", "debug"];

    categories.forEach((classification, index) => {
      scheduler.enqueue(notice(index + 1, classification));
    });

    expect(MAX_VISIBLE_NOTIFICATION_CLASSIFICATIONS).toBe(4);
    expect(scheduler.snapshot().map((item) => item.classification)).toEqual(categories.slice(0, 4));

    const promoted = scheduler.dismiss("fuse", 2);
    expect(promoted.map((item) => item.classification)).toEqual(["debug"]);
    expect(scheduler.snapshot().map((item) => item.classification)).toEqual([
      "tech",
      "weather",
      "storage",
      "debug",
    ]);
  });

  it("keeps ordinary notices serialized within their category and ahead of later categories", () => {
    const scheduler = new NotificationScheduler<Notice>(2);

    scheduler.enqueue(notice(1, "tech"));
    scheduler.enqueue(notice(2, "fuse"));
    scheduler.enqueue(notice(3, "fuse"));
    scheduler.enqueue(notice(4, "weather"));

    expect(scheduler.snapshot().map((item) => item.id)).toEqual([1, 2]);
    expect(scheduler.dismiss("fuse", 2).map((item) => item.id)).toEqual([3]);
    expect(scheduler.snapshot().map((item) => item.id)).toEqual([1, 3]);
    expect(scheduler.dismiss("fuse", 3).map((item) => item.id)).toEqual([4]);
    expect(scheduler.snapshot().map((item) => item.id)).toEqual([1, 4]);
  });

  it("allows the existing multi-card categories to show together", () => {
    const scheduler = new NotificationScheduler<Notice>(1);

    expect(scheduler.enqueue(notice(1, "storage")).map((item) => item.id)).toEqual([1]);
    expect(scheduler.enqueue(notice(2, "storage")).map((item) => item.id)).toEqual([2]);
    expect(scheduler.snapshot().map((item) => item.id)).toEqual([1, 2]);
  });

  it("promotes every queued multi-card notice when its category becomes visible", () => {
    const scheduler = new NotificationScheduler<Notice>(1);

    scheduler.enqueue(notice(1, "tech"));
    scheduler.enqueue(notice(2, "achievement"));
    scheduler.enqueue(notice(3, "achievement"));

    expect(scheduler.snapshot().map((item) => item.id)).toEqual([1]);
    expect(scheduler.dismiss("tech", 1).map((item) => item.id)).toEqual([2, 3]);
    expect(scheduler.snapshot().map((item) => item.id)).toEqual([2, 3]);
  });
});
