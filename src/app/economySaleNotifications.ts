import { COMPOUND_IDS, MATERIAL_IDS, type EconomicGoodId } from "../content/ids";
import type { SaleSelection } from "../content/economyRules";
import { COMPOUND_CATALOG } from "../content/economy";
import { displayCurrency } from "../engine/precision";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { economyGoodName } from "./economyDisplay";
import { formatCurrency } from "./currencyFormatting";
import { formatNumber } from "./numberFormatting";
import { formatEconomyMessage } from "../i18n/economyMessages";
import type { GameNotificationOptions } from "./NotificationStack";

type Notify = (message: string, options?: GameNotificationOptions) => void;

/** Dispatches only a manual sale command; clock-driven auto-sales stay silent. */
export function dispatchEconomySale(
  state: GameState,
  store: GameStore,
  goodId: EconomicGoodId,
  amount: SaleSelection,
  notify: Notify,
): void {
  const result = store.dispatch({ type: "resource.sell", goodId, amount });
  const sold = result.events.find((event) => event.type === "resource.sold");
  if (!result.accepted || !sold || sold.type !== "resource.sold") return;
  if (state.settings.notificationsEnabled === false) return;

  const locale = state.settings.locale;
  const message = formatEconomyMessage(locale, "saleNotification", {
    amount: formatNumber(locale, sold.amount, 2, state.settings.notation),
    good: economyGoodName(locale, goodId),
    cash: formatCurrency(
      locale,
      Number(displayCurrency(sold.cash)),
      state.settings.currencyId ?? "usd",
      2,
      state.settings.notation,
    ),
  });

  notify(message, {
    classification: Object.hasOwn(COMPOUND_CATALOG, goodId) ? "special" : "sold",
    type: "info",
    durationMs: 3000,
  });
}

/** Sells every unlocked resource or compound through the regular sale command. */
export function dispatchEconomySellAll(
  state: GameState,
  store: GameStore,
  category: "resources" | "compounds",
  notify: Notify,
): void {
  let totalAmount = 0;
  let totalCash = 0;

  const sell = (goodId: EconomicGoodId) => {
    const result = store.dispatch({ type: "resource.sell", goodId, amount: "all" });
    const sold = result.events.find((event) => event.type === "resource.sold");
    if (!result.accepted || !sold || sold.type !== "resource.sold") return;
    totalAmount += sold.amount;
    totalCash += sold.cash;
  };

  if (category === "resources") {
    for (const goodId of MATERIAL_IDS) {
      if (state.run.unlockedResources.includes(goodId)) sell(goodId);
    }
  } else {
    for (const goodId of COMPOUND_IDS) {
      if (state.run.economy.unlockedCompounds.includes(goodId)) sell(goodId);
    }
  }

  if (totalAmount <= 0 || state.settings.notificationsEnabled === false) return;
  const locale = state.settings.locale;
  const messageKey =
    category === "resources" ? "sellAllResourcesNotice" : "sellAllCompoundsNotice";
  notify(
    formatEconomyMessage(locale, messageKey, {
      cash: formatCurrency(
        locale,
        Number(displayCurrency(totalCash)),
        state.settings.currencyId ?? "usd",
        2,
        state.settings.notation,
      ),
    }),
    {
      classification: category === "resources" ? "sold" : "special",
      type: "info",
      durationMs: 3000,
    },
  );
}
