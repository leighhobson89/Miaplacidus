import type { LocaleId } from "../content/ids";
import type { EngineEvent } from "../engine/commands";
import type { GameState } from "../engine/state";
import { marketOfflineNotificationText, marketText } from "../i18n/metaMessages";
import { economyGoodName } from "./economyDisplay";
import { formatNumber } from "./numberFormatting";
import type { GameNotificationType } from "./NotificationStack";

export interface GalacticMarketEventNotice {
  readonly message: string;
  readonly classification: "special";
  readonly type: GameNotificationType;
  readonly durationMs: number;
}

export function galacticMarketEventNotice(
  locale: LocaleId,
  event: EngineEvent,
  state: GameState,
): GalacticMarketEventNotice | null {
  if (event.type !== "meta.market.traded") return null;

  const format = (value: number) =>
    formatNumber(locale, value, 0, state.settings.notation ?? "condensed");
  const outgoing = `${format(Math.floor(event.outgoingQuantity - event.commissionQuantity))} ${economyGoodName(locale, event.outgoingGoodId)}`;
  const incoming = `${format(event.incomingQuantity)} ${economyGoodName(locale, event.incomingGoodId)}`;
  const commission = `${format(event.commissionQuantity)} ${economyGoodName(locale, event.outgoingGoodId)}`;
  const message = marketText(locale, "tradeCompleteNotification")
    .replace("{outgoing}", outgoing)
    .replace("{incoming}", incoming)
    .replace("{commission}", commission);

  return { message, classification: "special", type: "info", durationMs: 5000 };
}

export function galacticMarketLockdownEntryNotice(
  locale: LocaleId,
  state: GameState,
): GalacticMarketEventNotice | null {
  if (state.run.marketLockdownRemainingMs <= 0) return null;
  return {
    message: marketOfflineNotificationText(locale),
    classification: "special",
    type: "warning",
    durationMs: 3000,
  };
}

export function createGalacticMarketEventNoticeHandler(
  getLocale: () => LocaleId,
  getState: () => GameState,
  notify: (notice: GalacticMarketEventNotice) => void,
): (events: readonly EngineEvent[]) => void {
  return (events) => {
    for (const event of events) {
      const notice = galacticMarketEventNotice(getLocale(), event, getState());
      if (notice) notify(notice);
    }
  };
}
