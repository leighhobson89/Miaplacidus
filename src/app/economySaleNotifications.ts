import type { EconomicGoodId } from "../content/ids";
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
