import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { NotificationScheduler } from "./notificationScheduler";

export type GameNotificationType = "info" | "success" | "warning" | "error";

interface GameNotification {
  readonly id: number;
  readonly message: string;
  readonly classification: string;
  readonly type: GameNotificationType;
  readonly durationMs: number;
}

export interface GameNotificationOptions {
  readonly classification?: string;
  readonly type?: GameNotificationType;
  readonly durationMs?: number;
}

type Notify = (message: string, options?: GameNotificationOptions) => void;
type SetNotificationsEnabled = (enabled: boolean) => void;

const NotificationContext = createContext<Notify>(() => {});
const NotificationControlContext = createContext<SetNotificationsEnabled>(() => {});
const NotificationListContext = createContext<readonly GameNotification[]>([]);

export function useGameNotifications(): Notify {
  return useContext(NotificationContext);
}

export function useGameNotificationControls(): SetNotificationsEnabled {
  return useContext(NotificationControlContext);
}

export function GameNotificationProvider({ children }: { readonly children: ReactNode }) {
  const [notifications, setNotifications] = useState<readonly GameNotification[]>([]);
  const nextId = useRef(1);
  const enabled = useRef(true);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const [scheduler] = useState(() => new NotificationScheduler<GameNotification>());
  const dismissRef = useRef<(id: number, classification: string) => void>(() => {});

  const armTimer = useCallback((notification: GameNotification) => {
    if (notification.durationMs <= 0) return;
    timers.current.set(
      notification.id,
      setTimeout(
        () => dismissRef.current(notification.id, notification.classification),
        notification.durationMs,
      ),
    );
  }, []);

  const dismiss = useCallback(
    (id: number, classification: string) => {
      const timer = timers.current.get(id);
      if (timer) clearTimeout(timer);
      timers.current.delete(id);
      if (!enabled.current) return;
      const activated = scheduler.dismiss(classification, id);
      activated.forEach(armTimer);
      setNotifications(scheduler.snapshot());
    },
    [armTimer, scheduler],
  );

  const notify = useCallback<Notify>(
    (message, options = {}) => {
      if (!enabled.current || !message.trim()) return;
      const notification: GameNotification = {
        id: nextId.current++,
        message,
        classification: options.classification ?? "default",
        type: options.type ?? "info",
        durationMs: Math.max(0, options.durationMs ?? 3000),
      };
      const activated = scheduler.enqueue(notification);
      activated.forEach(armTimer);
      setNotifications(scheduler.snapshot());
    },
    [armTimer, scheduler],
  );

  const setNotificationsEnabled = useCallback<SetNotificationsEnabled>(
    (isEnabled) => {
      enabled.current = isEnabled;
      if (isEnabled) return;
      for (const timer of timers.current.values()) clearTimeout(timer);
      timers.current.clear();
      scheduler.clear();
      setNotifications([]);
    },
    [scheduler],
  );

  useEffect(() => {
    dismissRef.current = dismiss;
  }, [dismiss]);

  useEffect(
    () => () => {
      for (const timer of timers.current.values()) clearTimeout(timer);
      timers.current.clear();
    },
    [],
  );

  return (
    <NotificationContext.Provider value={notify}>
      <NotificationControlContext.Provider value={setNotificationsEnabled}>
        <NotificationListContext.Provider value={notifications}>
          {children}
        </NotificationListContext.Provider>
      </NotificationControlContext.Provider>
    </NotificationContext.Provider>
  );
}

export function GameNotificationRegion() {
  const notifications = useContext(NotificationListContext);
  return (
    <div className="notification-stack" data-testid="notification-stack" aria-live="polite">
      {notifications.map((notification) => (
        <output
          key={notification.id}
          className={`notification-card notification-${notification.type} classification-${notification.classification}`}
          data-testid="game-notification"
          data-classification={notification.classification}
          aria-atomic="true"
        >
          {notification.message}
        </output>
      ))}
    </div>
  );
}
