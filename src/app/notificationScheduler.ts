export const MAX_VISIBLE_GAME_NOTIFICATIONS = 2;

export interface ScheduledNotification {
  readonly id: number;
  readonly classification: string;
}

/** Keeps a FIFO queue while limiting the floating notification region to two cards. */
export class NotificationScheduler<T extends ScheduledNotification> {
  private readonly active: T[] = [];
  private readonly pending: T[] = [];

  enqueue(notification: T): readonly T[] {
    if (this.active.length < MAX_VISIBLE_GAME_NOTIFICATIONS) {
      this.active.push(notification);
      return [notification];
    }
    this.pending.push(notification);
    return [];
  }

  dismiss(id: number): readonly T[] {
    const index = this.active.findIndex((notification) => notification.id === id);
    if (index < 0) return [];

    this.active.splice(index, 1);
    const promoted = this.pending.splice(0, MAX_VISIBLE_GAME_NOTIFICATIONS - this.active.length);
    this.active.push(...promoted);
    return promoted;
  }

  snapshot(): readonly T[] {
    return [...this.active];
  }

  clear(): void {
    this.active.length = 0;
    this.pending.length = 0;
  }
}
