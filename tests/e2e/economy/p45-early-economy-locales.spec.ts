import { expect, test } from "../_harness/fixtures";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { ECONOMY_BUILDING_NAMES } from "../../../src/content/economyBuildingNames";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { TECHNOLOGY_NAMES } from "../../../src/content/technologyNames";
import { philosophyCompoundRecipe } from "../../../src/engine/philosophy";
import { formatNumber } from "../../../src/app/numberFormatting";
import { economyLabel, formatEconomyMessage } from "../../../src/i18n/economyMessages";
import { translate } from "../../../src/i18n/messages";
import { technologyNotificationText } from "../../../src/i18n/technologyNotificationMessages";

async function startEconomyFixture(
  page: import("@playwright/test").Page,
  fixture: "research" | "storage-all" | "water-storage-short",
  locale: LocaleId = "en",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=${locale}&economyFixture=${fixture}`);
  await page.getByLabel(translate(locale, "app.pioneer")).fill(`P-45 ${fixture} Pioneer`);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function setLocale(page: import("@playwright/test").Page, locale: LocaleId): Promise<void> {
  await page.evaluate((nextLocale) => {
    window.miaplacidusTest!.dispatch({ type: "settings.update", patch: { locale: nextLocale } });
  }, locale);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

test("early economy panels render localized names and actions @p45-early-economy-locales", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startEconomyFixture(page, "storage-all");

  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    const hydrogenName = economyGoodName(locale, "hydrogen");
    await page.locator("#tab-hydrogen").click();
    const hydrogen = page.locator("#panel-resources-hydrogen");
    await expect(hydrogen.locator(".pane-heading h2")).toHaveText(hydrogenName);
    await expect(
      hydrogen.getByRole("button", { name: translate(locale, "hydrogen.collect"), exact: true }),
    ).toBeVisible();
    await expect(hydrogen.locator(".hydrogen-storage-card h3")).toHaveText(
      translate(locale, "hydrogen.storage.title"),
    );
    await expect(hydrogen.locator(".hydrogen-sale-controls h3")).toHaveText(
      translate(locale, "hydrogen.sell"),
    );
    await expect(hydrogen).not.toContainText("???");

    await page.locator("#tab-compounds").click();
    await page.locator("#tab-compounds-diesel").click();
    const dieselName = economyGoodName(locale, "diesel");
    const diesel = page.locator("#panel-compounds-diesel [data-compound-id=diesel]");
    await expect(diesel.locator(".pane-heading h2")).toHaveText(dieselName);
    await expect(diesel.locator(".compound-recipe")).toContainText(
      `${economyLabel(locale, "recipe")}:`,
    );
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const dieselRecipe = philosophyCompoundRecipe(state, "diesel").map(({ goodId, amount }) => ({
      goodId,
      amount: formatNumber(state.settings.locale, amount, 0, state.settings.notation),
    }));
    for (const input of dieselRecipe)
      await expect(diesel.locator(".compound-recipe")).toContainText(
        economyGoodName(locale, input.goodId),
      );
    await expect(
      diesel.getByRole("spinbutton", {
        name: `${economyLabel(locale, "amount")} ${dieselName}`,
      }),
    ).toBeVisible();
    await expect(
      diesel.getByRole("button", {
        name: `${economyLabel(locale, "create")} ${dieselName}`,
        exact: true,
      }),
    ).toBeVisible();
    await expect(diesel).not.toContainText("???");

    await page.locator("#tab-research").click();
    await page.locator("#tab-research-science-buildings").click();
    const scienceKit = page.locator(
      '#panel-research-science-buildings [data-building-id="scienceKit"]',
    );
    await expect(scienceKit.locator("h4")).toHaveText(ECONOMY_BUILDING_NAMES.scienceKit[locale]);
    const sciencePurchase = scienceKit.locator(".economy-building-actions button").first();
    await expect(sciencePurchase).toBeVisible();
    await expect(sciencePurchase).toHaveAccessibleName(/\S/);
    await expect(page.locator("#panel-research-science-buildings")).not.toContainText("???");

    await page.locator("#tab-research-tech-tree").click();
    await expect(page.locator("#pane-research h2")).toHaveText(
      economyLabel(locale, "technologyTree"),
    );
    await expect(
      page.locator('[data-technology-id="knowledgeSharing"] .technology-map-node-heading strong'),
    ).toHaveText(TECHNOLOGY_NAMES.knowledgeSharing[locale]);
  }
});

test("compound storage shortfall is localized for the first Water purchase @p45-economy-shortfall-locale", async ({
  page,
}) => {
  await startEconomyFixture(page, "water-storage-short");
  await page.locator("#tab-compounds").click();
  await page.locator("#tab-compounds-water").click();
  const water = page.locator('#panel-compounds-water [data-compound-id="water"]');
  const storage = water.locator(".hydrogen-storage-card");
  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    const concreteName = economyGoodName(locale, "concrete");
    const storageButton = storage.getByRole("button", {
      name: economyLabel(locale, "increaseStorage"),
    });
    await expect(storageButton).toBeDisabled();
    const describedBy = await storageButton.getAttribute("aria-describedby");
    expect(describedBy, `${locale} disabled storage action description`).toBeTruthy();
    const reasonId = describedBy?.split(/\s+/).at(-1);
    expect(reasonId, `${locale} storage reason is associated with its action`).toBe(
      "good-water-storage-reason",
    );
    const reason = storage.locator(`#${reasonId}`);
    await expect(reason).toHaveText(
      formatEconomyMessage(locale, "needGoodAmount", { amount: "30", good: concreteName }),
    );
    await expect(storage.locator(".cost-line")).toContainText(concreteName);
    await expect(water).not.toContainText("???");
  }
});

test("first research completion notice uses the active locale @p45-early-research-notification", async ({
  page,
}) => {
  for (const locale of LOCALE_IDS) {
    await startEconomyFixture(page, "research", locale);
    await page.locator("#tab-research").click();
    await page.locator("#tab-research-tech-tree").click();
    const knowledgeSharing = page.locator('[data-technology-id="knowledgeSharing"]');
    await expect(knowledgeSharing).toBeVisible();
    await expect(knowledgeSharing).toHaveAttribute("aria-disabled", "false");
    await knowledgeSharing.click();
    await expect(page.getByTestId("game-notification").last()).toHaveText(
      technologyNotificationText(
        locale,
        "knowledgeSharing",
        TECHNOLOGY_NAMES.knowledgeSharing[locale],
      ),
    );
  }
});
