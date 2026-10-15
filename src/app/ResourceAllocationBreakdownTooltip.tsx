import { useMemo } from "react";
import type { MaterialId } from "../content/ids";
import { economyGoodName } from "./economyDisplay";
import { economyLabel } from "../i18n/economyMessages";
import { resourceAllocationBreakdownCopy } from "../i18n/resourceAllocationBreakdownMessages";
import { displayCurrency } from "../engine/precision";
import type { GameState } from "../engine/state";
import { formatCurrency } from "./currencyFormatting";
import { formatNumber } from "./numberFormatting";
import { resourceAllocationBreakdown } from "./resourceAllocationBreakdown";
import { InfoTooltip } from "./InfoTooltip";

export function ResourceAllocationBreakdownTooltip({
  goodId,
  state,
}: {
  readonly goodId: MaterialId;
  readonly state: GameState;
}) {
  const locale = state.settings.locale;
  const copy = resourceAllocationBreakdownCopy(locale);
  const breakdown = useMemo(
    () => resourceAllocationBreakdown(state, goodId),
    [goodId, state],
  );
  if (!breakdown) return null;

  const formatRate = (value: number) =>
    `${formatNumber(locale, value, 2, state.settings.notation)} ${economyLabel(locale, "perSecond")}`;
  const fill = (template: string, values: Readonly<Record<string, string>>) =>
    Object.entries(values).reduce(
      (message, [key, value]) => message.split(`{${key}}`).join(value),
      template,
    );
  const currencyRate = `${formatCurrency(
    locale,
    Number(displayCurrency(breakdown.autoSellIncome)),
    state.settings.currencyId ?? "usd",
    2,
    state.settings.notation,
  )} ${economyLabel(locale, "perSecond")}`;
  return (
    <InfoTooltip
      id={`resource-${goodId}-production-breakdown`}
      label={`${economyGoodName(locale, goodId)} — ${copy.heading}`}
      content={
        <div className="production-allocation-breakdown">
          <strong>{copy.heading}</strong>
          <p data-testid={`resource-${goodId}-breakdown-allocatable`}>
            {fill(copy.allocatable, { rate: formatRate(breakdown.allocatable) })}
          </p>
          {breakdown.soldForCash > 0 && (
            <p data-testid={`resource-${goodId}-breakdown-cash`}>
              {fill(copy.soldForCash, { rate: formatRate(breakdown.soldForCash) })}
            </p>
          )}
          {breakdown.compoundCeiling > 0 && (
            <p data-testid={`resource-${goodId}-breakdown-compound-ceiling`}>
              {fill(copy.compoundCeiling, { rate: formatRate(breakdown.compoundCeiling) })}
            </p>
          )}
          {breakdown.compoundDraws.map((draw) => (
            <p
              key={draw.compoundId}
              data-testid={`resource-${goodId}-breakdown-compound-${draw.compoundId}`}
            >
              {fill(copy.divertedToCreate, {
                compound: economyGoodName(locale, draw.compoundId),
                rate: formatRate(draw.rate),
              })}
            </p>
          ))}
          {breakdown.unusedCompoundShare > 0 && (
            <p data-testid={`resource-${goodId}-breakdown-unused-compound-share`}>
              {fill(copy.unusedCompoundShare, {
                rate: formatRate(breakdown.unusedCompoundShare),
              })}
            </p>
          )}
          <p data-testid={`resource-${goodId}-breakdown-storage`}>
            {fill(copy.storage, { rate: formatRate(breakdown.storage) })}
          </p>
          {breakdown.autoSellIncome > 0 && (
            <p data-testid={`resource-${goodId}-breakdown-autosell-income`}>
              {fill(copy.autoSellIncome, { cashRate: currencyRate })}
            </p>
          )}
        </div>
      }
      testId={`resource-${goodId}-production-breakdown`}
    />
  );
}
