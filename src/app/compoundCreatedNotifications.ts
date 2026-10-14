import { COMPOUND_IDS, type LocaleId, type CompoundId } from "../content/ids";
import type { EngineEvent } from "../engine/commands";
import { philosophyCompoundRecipe } from "../engine/philosophy";
import type { GameState } from "../engine/state";
import { economyGoodName } from "./economyDisplay";
import { formatNumber } from "./numberFormatting";
import type { GameNotificationOptions, GameNotificationType } from "./NotificationStack";
import type { GameStore } from "../engine/store";
import { formatEconomyMessage } from "../i18n/economyMessages";

export interface CompoundCreatedNotice {
  readonly message: string;
  readonly classification: "create";
  readonly type: GameNotificationType;
  readonly durationMs: number;
}

/** Build the source-style success notice only from an accepted manual create result. */
export function compoundCreatedNotice(
  locale: LocaleId,
  event: EngineEvent,
  state: GameState,
): CompoundCreatedNotice | null {
  if (
    event.type !== "compound.created" ||
    !COMPOUND_IDS.includes(event.goodId as CompoundId)
  )
    return null;

  const parts = new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(
    philosophyCompoundRecipe(state, event.goodId as CompoundId).map(
      ({ goodId, amount }) =>
        `${formatNumber(locale, amount * event.amount, 0, state.settings.notation)} ${economyGoodName(locale, goodId)}`,
    ),
  );
  const message = formatEconomyMessage(locale, "compoundCreatedNotice", {
    amount: formatNumber(locale, event.amount, 0, state.settings.notation),
    compound: economyGoodName(locale, event.goodId),
    parts,
  });
  return { message, classification: "create", type: "info", durationMs: 3000 };
}

/**
 * Dispatch a player-requested create and route only that command's accepted
 * result. Automatic compound production emits the same engine event during
 * simulation ticks, but it never passes through this manual UI boundary.
 */
export function dispatchManualCompoundCreation(
  store: GameStore,
  goodId: CompoundId,
  amount: number,
  notify: (message: string, options?: GameNotificationOptions) => void,
): void {
  const result = store.dispatch({ type: "economy.compound.create", goodId, amount });
  if (!result.accepted || result.state.settings.notificationsEnabled === false) return;
  const event = result.events.find(
    (candidate) => candidate.type === "compound.created" && candidate.goodId === goodId,
  );
  if (!event) return;
  const notice = compoundCreatedNotice(result.state.settings.locale, event, result.state);
  if (!notice) return;
  notify(notice.message, {
    classification: notice.classification,
    type: notice.type,
    durationMs: notice.durationMs,
  });
}
