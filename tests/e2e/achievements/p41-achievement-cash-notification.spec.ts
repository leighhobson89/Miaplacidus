import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { setNumberNotation } from "../_harness/settings-controls";
import { ACHIEVEMENT_CATALOGUE } from "../../../src/content/achievements";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import type { LocaleId } from "../../../src/content/ids";
import { LOCALE_IDS } from "../../../src/content/ids";
import { ACHIEVEMENT_NOTIFICATION_COPY } from "../../../src/i18n/achievementNotificationCopy.generated";
import { translate } from "../../../src/i18n/messages";

async function startAchievementNotificationFixture(
  page: Page,
  locale: LocaleId = "en",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261009&testLocale=${locale}&economyFixture=meta-rebirth-ready`);
  await page.getByLabel(translate(locale, "app.pioneer")).fill("P-47 Achievement Cash Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => Boolean(window.miaplacidusTest?.getState())))
    .toBe(true);
}

test("P-41/P-47 formats cash Achievement notices with localized templates and notation @p41-achievement-cash-notification @p47-achievement-cash-template", async ({
  page,
}, testInfo) => {
  testInfo.setTimeout(90_000);
  const definition = ACHIEVEMENT_CATALOGUE.find(({ id }) => id === "collect50Hydrogen")!;
  expect(definition.reward.type).toBe("cash");
  if (definition.reward.type !== "cash") throw new Error("Expected a cash achievement reward");

  const rendered: Partial<Record<"condensed" | "standard" | "scientific", string>> = {};
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await startAchievementNotificationFixture(page);
    await setNumberNotation(page, notation);

    const before = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(before.run.achievements.unlockedIds).not.toContain("collect50Hydrogen");
    const remaining = Math.max(1, 50 - before.run.goods.hydrogen.quantity);
    const collectHydrogen = page.getByRole("button", {
      name: translate("en", "hydrogen.collect"),
      exact: true,
    });
    for (let count = 0; count < remaining; count += 1) await collectHydrogen.click();

    const after = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(after.settings.notation).toBe(notation);
    expect(after.run.goods.hydrogen.quantity).toBeGreaterThanOrEqual(50);
    expect(after.run.achievements.unlockedIds).toContain("collect50Hydrogen");
    expect(after.run.cash).toBe(before.run.cash + definition.reward.amount);

    const expectedAmount = formatCurrency(
      "en",
      definition.reward.amount,
      after.settings.currencyId ?? "usd",
      0,
      notation,
    );
    const notice = page
      .getByTestId("notification-stack")
      .locator('[data-testid="game-notification"][data-classification="achievement"]')
      .filter({ hasText: "You have collected 50 Hydrogen" });
    await expect(notice).toHaveText(
      ACHIEVEMENT_NOTIFICATION_COPY.en.collect50Hydrogen.replace("{cashReward}", expectedAmount),
    );
    await expect(notice).not.toContainText(`${definition.reward.amount} Cash`);
    rendered[notation] = await notice.innerText();
  }

  expect(rendered.standard).not.toBe(rendered.scientific);

  for (const locale of LOCALE_IDS) {
    await startAchievementNotificationFixture(page, locale);
    const before = await page.evaluate(() => window.miaplacidusTest!.getState());
    const collectHydrogen = page.getByRole("button", {
      name: translate(locale, "hydrogen.collect"),
      exact: true,
    });
    const remaining = Math.max(1, 50 - before.run.goods.hydrogen.quantity);
    await expect(collectHydrogen).toBeEnabled();
    for (let count = 0; count < remaining; count += 1) await collectHydrogen.click();

    const after = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(after.settings.locale).toBe(locale);
    expect(after.run.achievements.unlockedIds).toContain("collect50Hydrogen");
    const expectedAmount = formatCurrency(
      locale,
      definition.reward.amount,
      after.settings.currencyId ?? "usd",
      0,
      after.settings.notation,
    );
    const notice = page
      .getByTestId("notification-stack")
      .locator('[data-testid="game-notification"][data-classification="achievement"]');
    await expect(notice).toHaveCount(1);
    await expect(notice).toHaveText(
      ACHIEVEMENT_NOTIFICATION_COPY[locale].collect50Hydrogen.replace(
        "{cashReward}",
        expectedAmount,
      ),
    );
  }
});
