import { ECONOMIC_GOOD_IDS, type EconomicGoodId, type LocaleId } from "../content/ids";
import type { EconomyStorageCategory, EngineEvent, GameCommand } from "../engine/commands";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { formatNumber } from "./numberFormatting";
import { economyGoodName } from "./economyDisplay";
import { economyLabel, formatEconomyMessage } from "../i18n/economyMessages";
import type { GameNotificationOptions } from "./NotificationStack";

type Notify = (message: string, options?: GameNotificationOptions) => void;
type AutobuyerPurchaseCommand = Extract<
  GameCommand,
  {
    readonly type:
      | "hydrogen.autobuyer.purchase"
      | "economy.autobuyer.purchase"
      | "economy.autobuyer.buyMax";
  }
>;

/** Route an accepted storage upgrade to a localized notification. */
export function dispatchEconomyStoragePurchase(
  store: GameStore,
  goodId: EconomicGoodId,
  notify: Notify,
): boolean {
  const result = store.dispatch({ type: "storage.purchase", goodId });
  if (!result.accepted) return false;
  const increased = result.events.find(
    (event) => event.type === "storage.increased" && event.goodId === goodId,
  );
  if (!increased || increased.type !== "storage.increased") return false;

  if (result.state.settings.notificationsEnabled === false) return true;

  const locale = result.state.settings.locale;
  notify(
    formatEconomyMessage(locale, "storageIncreasedNotice", {
      good: economyGoodName(locale, goodId),
      capacity: formatNumber(locale, increased.capacity, 0, result.state.settings.notation),
    }),
    { classification: "storage", type: "success", durationMs: 3000 },
  );
  return true;
}

/** Increase affordable storage within one source-owned category and report one aggregate result. */
export function dispatchEconomyStorageIncreaseAll(
  store: GameStore,
  category: EconomyStorageCategory,
  notify: Notify,
): boolean {
  const result = store.dispatch({ type: "economy.storage.increaseAllCategory", category });
  if (!result.accepted) return false;

  const increasedGoods = result.events
    .filter((event) => event.type === "storage.increased")
    .map((event) => event.goodId);
  if (increasedGoods.length === 0) return true;
  if (result.state.settings.notificationsEnabled === false) return true;

  const locale = result.state.settings.locale;
  notify(
    formatEconomyMessage(locale, "storageIncreasedAllNotice", {
      materials: increasedGoods.map((goodId) => economyGoodName(locale, goodId)).join(", "),
    }),
    { classification: "storage", type: "success", durationMs: 4000 },
  );
  return true;
}

/** Route accepted single or bulk autobuyer purchases to one localized notification. */
export function dispatchEconomyAutobuyerPurchase(
  store: GameStore,
  command: AutobuyerPurchaseCommand,
  goodId: EconomicGoodId,
  tier: 1 | 2 | 3 | 4,
  notify: Notify,
): void {
  const result = store.dispatch(command);
  if (!result.accepted || result.state.settings.notificationsEnabled === false) return;
  const purchase = result.events.find((event) => event.type === "purchase.completed");
  if (!purchase || purchase.type !== "purchase.completed" || purchase.count <= 0) return;

  const locale = result.state.settings.locale;
  notify(
    formatEconomyMessage(locale, "autobuyerPurchaseNotice", {
      count: formatNumber(locale, purchase.count, 0, result.state.settings.notation),
      good: economyGoodName(locale, goodId),
      tier: formatNumber(locale, tier, 0, result.state.settings.notation),
    }),
    { classification: "economy", type: "success", durationMs: 3000 },
  );
}

/** Notify once when a good fills, then re-arm after the source-style 2% release margin. */
export function createStorageFullNoticeHandler(
  getLocale: () => LocaleId,
  getState: () => GameState,
  notify: Notify,
  purchaseStorage: (goodId: EconomicGoodId) => boolean,
): (events: readonly EngineEvent[]) => void {
  const initiallyFull = new Set(
    ECONOMIC_GOOD_IDS.filter((goodId) => {
      const { quantity, storageCapacity } = getState().run.goods[goodId];
      return storageCapacity > 0 && quantity >= storageCapacity;
    }),
  );

  return (events) => {
    if (events.length === 0) return;
    const state = getState();
    const locale = getLocale();
    for (const goodId of ECONOMIC_GOOD_IDS) {
      const { quantity, storageCapacity } = state.run.goods[goodId];
      if (storageCapacity <= 0) continue;
      const releaseMargin = Math.max(1, storageCapacity * 0.02);
      if (quantity <= storageCapacity - releaseMargin) initiallyFull.delete(goodId);
      if (quantity < storageCapacity || initiallyFull.has(goodId)) continue;

      initiallyFull.add(goodId);
      notify(
        formatEconomyMessage(locale, "storageFullNotice", {
          good: economyGoodName(locale, goodId),
        }),
        {
          classification: "storage",
          type: "info",
          durationMs: 8000,
          action: {
            label: economyLabel(locale, "increaseStorage"),
            onClick: () => {
              const current = getState().run.goods[goodId];
              if (current.quantity < current.storageCapacity) return;
              if (purchaseStorage(goodId)) return;

              const currentState = getState();
              notify(economyLabel(currentState.settings.locale, "purchaseUnavailable"), {
                classification: "storage",
                type: "warning",
                durationMs: 3000,
              });
            },
          },
        },
      );
    }
  };
}
