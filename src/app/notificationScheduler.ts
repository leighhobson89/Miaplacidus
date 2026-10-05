export const MAX_VISIBLE_NOTIFICATION_CLASSIFICATIONS = 4;

export const MULTI_CARD_NOTIFICATION_CLASSIFICATIONS = new Set(["storage", "debug", "achievement"]);

export interface ScheduledNotification {
  readonly id: number;
  readonly classification: string;
}

/** Keeps each category's queue intact while limiting visible categories. */
export class NotificationScheduler<T extends ScheduledNotification> {
  private readonly classificationOrder: string[] = [];
  private readonly activeByClassification = new Map<string, T[]>();
  private readonly pendingByClassification = new Map<string, T[]>();

  constructor(
    private readonly maxVisibleClassifications = MAX_VISIBLE_NOTIFICATION_CLASSIFICATIONS,
    private readonly multiCardClassifications = MULTI_CARD_NOTIFICATION_CLASSIFICATIONS,
  ) {}

  enqueue(notification: T): readonly T[] {
    const { classification } = notification;
    if (!this.classificationOrder.includes(classification)) {
      this.classificationOrder.push(classification);
    }

    const active = this.activeByClassification.get(classification);
    if (active && this.multiCardClassifications.has(classification)) {
      this.activeByClassification.set(classification, [...active, notification]);
      return [notification];
    }

    const pending = this.pendingByClassification.get(classification) ?? [];
    this.pendingByClassification.set(classification, [...pending, notification]);
    return this.promoteAvailable();
  }

  dismiss(classification: string, id: number): readonly T[] {
    const active = this.activeByClassification.get(classification);
    if (!active) return [];

    const remaining = active.filter((notification) => notification.id !== id);
    if (remaining.length > 0) {
      this.activeByClassification.set(classification, remaining);
    } else {
      this.activeByClassification.delete(classification);
    }

    return this.promoteAvailable();
  }

  snapshot(): readonly T[] {
    return this.classificationOrder.flatMap(
      (classification) => this.activeByClassification.get(classification) ?? [],
    );
  }

  clear(): void {
    this.classificationOrder.length = 0;
    this.activeByClassification.clear();
    this.pendingByClassification.clear();
  }

  private promoteAvailable(): readonly T[] {
    const activated: T[] = [];

    for (const classification of [...this.classificationOrder]) {
      const pending = this.pendingByClassification.get(classification);
      const active = this.activeByClassification.get(classification);

      if (active) {
        if (this.multiCardClassifications.has(classification) && pending?.length) {
          activated.push(...pending);
          this.activeByClassification.set(classification, [...active, ...pending]);
          this.pendingByClassification.delete(classification);
        }
        continue;
      }

      if (this.activeByClassification.size >= this.maxVisibleClassifications || !pending?.length) {
        continue;
      }

      const newlyActive = this.multiCardClassifications.has(classification)
        ? pending
        : pending.slice(0, 1);
      activated.push(...newlyActive);
      this.activeByClassification.set(classification, newlyActive);

      if (newlyActive.length === pending.length) {
        this.pendingByClassification.delete(classification);
      } else {
        this.pendingByClassification.set(classification, pending.slice(newlyActive.length));
      }
    }

    this.removeEmptyClassifications();
    return activated;
  }

  private removeEmptyClassifications(): void {
    const retainedOrder = this.classificationOrder.filter(
      (classification) =>
        this.activeByClassification.has(classification) ||
        (this.pendingByClassification.get(classification)?.length ?? 0) > 0,
    );
    this.classificationOrder.splice(0, this.classificationOrder.length, ...retainedOrder);
  }
}
