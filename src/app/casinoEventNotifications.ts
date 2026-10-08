import type { LocaleId } from "../content/ids";
import type { EngineEvent } from "../engine/commands";
import type { GameState } from "../engine/state";
import { casinoText } from "../i18n/casinoMessages";
import type { GameNotificationType } from "./NotificationStack";

export interface CasinoEventNotice {
  readonly message: string;
  readonly classification: "galacticCasino";
  readonly type: GameNotificationType;
  readonly durationMs: number;
}

/** Maps the source Double-or-Nothing result notices without catching other casino games. */
export function casinoEventNotice(locale: LocaleId, event: EngineEvent): CasinoEventNotice | null {
  if (event.type !== "casino.game.played" || event.gameId !== "doubleOrNothing") return null;
  if (event.result !== "win" && event.result !== "loss") return null;

  const won = event.result === "win";
  return {
    message: casinoText(
      locale,
      won ? "doubleOrNothingWinNotification" : "doubleOrNothingLossNotification",
    ),
    classification: "galacticCasino",
    type: won ? "info" : "error",
    durationMs: 2500,
  };
}

export function createCasinoEventNoticeHandler(
  getLocale: () => LocaleId,
  getState: () => GameState,
  notify: (notice: CasinoEventNotice) => void,
): (events: readonly EngineEvent[]) => void {
  return (events) => {
    if (getState().settings.notificationsEnabled === false) return;
    for (const event of events) {
      const notice = casinoEventNotice(getLocale(), event);
      if (notice) notify(notice);
    }
  };
}
