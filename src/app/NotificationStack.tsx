import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { MAX_VISIBLE_GAME_NOTIFICATIONS, NotificationScheduler } from "./notificationScheduler";

export const GAME_NOTIFICATION_VISIBLE_MS = 3000;
export const GAME_NOTIFICATION_FADE_MS = 300;
export const GAME_NOTIFICATION_LIFETIME_MS =
  GAME_NOTIFICATION_VISIBLE_MS + GAME_NOTIFICATION_FADE_MS;

export type GameNotificationType = "info" | "success" | "warning" | "error";

export interface GameNotificationAction {
  readonly label: string;
  readonly onClick: () => void;
}

interface GameNotification {
  readonly id: number;
  readonly message: string;
  readonly classification: string;
  readonly type: GameNotificationType;
  readonly action?: GameNotificationAction;
}

export interface GameNotificationOptions {
  readonly classification?: string;
  readonly type?: GameNotificationType;
  /** @deprecated All floating notices use the same three-second visible lifetime. */
  readonly durationMs?: number;
  readonly action?: GameNotificationAction;
}

type Notify = (message: string, options?: GameNotificationOptions) => void;
type SetNotificationsEnabled = (enabled: boolean) => void;
type Announce = (message: string) => void;

interface ScreenReaderAnnouncement {
  readonly id: number;
  readonly message: string;
}

const NotificationContext = createContext<Notify>(() => {});
const NotificationControlContext = createContext<SetNotificationsEnabled>(() => {});
const NotificationListContext = createContext<readonly GameNotification[]>([]);
const AnnouncementContext = createContext<Announce>(() => {});
const AnnouncementListContext = createContext<readonly ScreenReaderAnnouncement[]>([]);

export function useGameNotifications(): Notify {
  return useContext(NotificationContext);
}

export function useGameNotificationControls(): SetNotificationsEnabled {
  return useContext(NotificationControlContext);
}

export function useGameScreenReaderAnnouncements(): Announce {
  return useContext(AnnouncementContext);
}

export function GameNotificationProvider({ children }: { readonly children: ReactNode }) {
  const [notifications, setNotifications] = useState<readonly GameNotification[]>([]);
  const [announcements, setAnnouncements] = useState<readonly ScreenReaderAnnouncement[]>([]);
  const nextId = useRef(1);
  const nextAnnouncementId = useRef(1);
  const enabled = useRef(true);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const [scheduler] = useState(() => new NotificationScheduler<GameNotification>());
  const dismissRef = useRef<(id: number) => void>(() => {});

  const armTimer = useCallback((notification: GameNotification) => {
    timers.current.set(
      notification.id,
      setTimeout(
        () => dismissRef.current(notification.id),
        GAME_NOTIFICATION_LIFETIME_MS,
      ),
    );
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      const timer = timers.current.get(id);
      if (timer) clearTimeout(timer);
      timers.current.delete(id);
      if (!enabled.current) return;
      const activated = scheduler.dismiss(id);
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
        ...(options.action
          ? {
              action: {
                label: options.action.label,
                onClick: () => {
                  try {
                    options.action?.onClick();
                  } finally {
                    dismissRef.current(notification.id);
                  }
                },
              },
            }
          : {}),
      };
      const activated = scheduler.enqueue(notification);
      activated.forEach(armTimer);
      setNotifications(scheduler.snapshot());
    },
    [armTimer, scheduler],
  );

  const announce = useCallback<Announce>((message) => {
    if (!message.trim()) return;
    const entry = { id: nextAnnouncementId.current++, message };
    setAnnouncements((previous) => [...previous, entry].slice(-4));
  }, []);

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
      <AnnouncementContext.Provider value={announce}>
        <NotificationControlContext.Provider value={setNotificationsEnabled}>
          <NotificationListContext.Provider value={notifications}>
            <AnnouncementListContext.Provider value={announcements}>
              {children}
            </AnnouncementListContext.Provider>
          </NotificationListContext.Provider>
        </NotificationControlContext.Provider>
      </AnnouncementContext.Provider>
    </NotificationContext.Provider>
  );
}

export function GameNotificationRegion({
  themeId,
  reducedMotion,
  customPointerEnabled,
}: {
  readonly themeId: string;
  readonly reducedMotion: boolean;
  readonly customPointerEnabled: boolean;
}) {
  const notifications = useContext(NotificationListContext);
  const announcements = useContext(AnnouncementListContext);
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="game-frame notification-portal"
      data-testid="notification-portal"
      data-theme={themeId}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      data-custom-pointer={customPointerEnabled ? "true" : "false"}
    >
      <div
        className="notification-stack"
        data-testid="notification-stack"
        data-visible-limit={MAX_VISIBLE_GAME_NOTIFICATIONS}
      >
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-card notification-${notification.type} classification-${notification.classification}${notification.action ? " notification-card-has-action" : ""}`}
            data-testid="game-notification"
            data-classification={notification.classification}
            data-visible-duration-ms={GAME_NOTIFICATION_VISIBLE_MS}
            role="status"
            aria-atomic="true"
          >
            {notification.message}
            {notification.action && (
              <button
                type="button"
                className="secondary-button notification-action-button"
                onClick={notification.action.onClick}
              >
                {notification.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
      <div
        className="sr-only"
        data-testid="screen-reader-announcements"
        role="status"
        aria-live="polite"
        aria-atomic="false"
      >
        {announcements.map((announcement) => (
          <span data-testid="screen-reader-announcement" key={announcement.id}>
            {announcement.message}
          </span>
        ))}
      </div>
    </div>,
    document.body,
  );
}
