import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatNumber } from "../../../src/app/numberFormatting";
import { COMPOUND_IDS, LOCALE_IDS, MATERIAL_IDS } from "../../../src/content/ids";
import { MATERIAL_CATALOG } from "../../../src/content/economy";
import type { GameCommand } from "../../../src/engine/commands";
import { economyLabel, formatEconomyMessage } from "../../../src/i18n/economyMessages";
import { dismissTutorialOfferIfPresent, expect, test } from "../_harness/fixtures";
import { startEconomyFixture } from "../_harness/economyFixtures";
import { setGameLocale } from "../_harness/settings-controls";

const HYDROGEN_TO_HELIUM_RATIO = MATERIAL_CATALOG.hydrogen.fusionOutputs!.find(
  (output) => output.goodId === "helium",
)!.ratio;

test("storage-full notices and their actions follow the selected locale @phase7-locale @economy @notifications", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startEconomyFixture(page, "storage-each");
  await dismissTutorialOfferIfPresent(page);

  const goodsByCategory = {
    resources: ["hydrogen", "helium", "carbon", "neon", "oxygen", "sodium"],
    compounds: ["diesel", "glass", "steel", "concrete", "water", "titanium"],
  } as const;
  const notifications = page.getByTestId("notification-stack").getByTestId("game-notification");

  for (const [index, locale] of LOCALE_IDS.entries()) {
    await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    for (const category of ["resources", "compounds"] as const) {
      const goodId = goodsByCategory[category][index]!;
      const command: GameCommand =
        category === "resources"
          ? { type: "resource.collect", goodId }
          : { type: "economy.compound.create", goodId, amount: 1 };
      const accepted = await page.evaluate(
        (acceptedCommand) => window.miaplacidusTest!.dispatch(acceptedCommand),
        command,
      );
      expect(accepted).toBe(true);

      const message = formatEconomyMessage(locale, "storageFullNotice", {
        good: economyGoodName(locale, goodId),
      });
      const notice = notifications
        .locator('[data-classification="storage"]')
        .filter({ hasText: message })
        .last();
      await expect(notice).toHaveText(message);
      await expect(
        notice.getByRole("button", { name: economyLabel(locale, "increaseStorage"), exact: true }),
      ).toBeVisible();
      await expect(notice).toHaveAttribute("data-visible-duration-ms", "3000");
    }
  }
});

test("fusion efficiency notices route translated names and yields in all locales @phase7-locale @economy @notifications", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startEconomyFixture(page, "save");
  await dismissTutorialOfferIfPresent(page);
  await page.locator("#tab-resources-hydrogen").click();
  const resourcePane = page.locator("#panel-resources-hydrogen");
  await expect(resourcePane).toBeVisible();
  const notifications = page.getByTestId("notification-stack").getByTestId("game-notification");
  const amount = 100;
  const idealAmount = amount * HYDROGEN_TO_HELIUM_RATIO;

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    const stateBefore = await page.evaluate(() => window.miaplacidusTest!.getState());
    const heliumBefore = stateBefore.run.goods.helium.quantity;
    await resourcePane
      .getByLabel(
        `${economyLabel(locale, "target")} ${economyGoodName(locale, "hydrogen")}`,
        { exact: true },
      )
      .selectOption("helium");
    await resourcePane
      .getByLabel(
        `${economyLabel(locale, "fuse")} ${economyLabel(locale, "amount")} ${economyGoodName(locale, "hydrogen")}`,
        { exact: true },
      )
      .fill(String(amount));
    await resourcePane
      .getByRole("button", {
        name: `${economyLabel(locale, "fuse")} ${economyGoodName(locale, "hydrogen")}`,
        exact: true,
      })
      .click();

    const stateAfter = await page.evaluate(() => window.miaplacidusTest!.getState());
    const outputAmount = stateAfter.run.goods.helium.quantity - heliumBefore;
    expect(outputAmount).toBeGreaterThan(0);
    expect(outputAmount).toBeLessThan(idealAmount);
    const message = formatEconomyMessage(locale, "fusionEfficiencyNotice", {
      sourceAmount: formatNumber(locale, amount, 0, stateAfter.settings.notation),
      source: economyGoodName(locale, "hydrogen"),
      target: economyGoodName(locale, "helium"),
      outputAmount: formatNumber(locale, outputAmount, 0, stateAfter.settings.notation),
      lostAmount: formatNumber(locale, idealAmount - outputAmount, 0, stateAfter.settings.notation),
      idealAmount: formatNumber(locale, idealAmount, 0, stateAfter.settings.notation),
    });
    const notice = notifications
      .locator('[data-classification="fuse"]')
      .filter({ hasText: message })
      .last();
    await expect(notice).toHaveText(message);
    await expect(notice).toHaveAttribute("data-visible-duration-ms", "3000");
  }
});

test("fusion storage-limit notices route translated names and losses in all locales @phase7-locale @economy @notifications", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startEconomyFixture(page, "storage-each");
  await dismissTutorialOfferIfPresent(page);
  await page.locator("#tab-resources-hydrogen").click();
  const resourcePane = page.locator("#panel-resources-hydrogen");
  await expect(resourcePane).toBeVisible();
  const notifications = page.getByTestId("notification-stack").getByTestId("game-notification");
  const amount = 4;
  const generatedAmount = amount * HYDROGEN_TO_HELIUM_RATIO;

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    const stateBefore = await page.evaluate(() => window.miaplacidusTest!.getState());
    const heliumBefore = stateBefore.run.goods.helium.quantity;
    await resourcePane
      .getByLabel(
        `${economyLabel(locale, "target")} ${economyGoodName(locale, "hydrogen")}`,
        { exact: true },
      )
      .selectOption("helium");
    await resourcePane
      .getByLabel(
        `${economyLabel(locale, "fuse")} ${economyLabel(locale, "amount")} ${economyGoodName(locale, "hydrogen")}`,
        { exact: true },
      )
      .fill(String(amount));
    await resourcePane
      .getByRole("button", {
        name: `${economyLabel(locale, "fuse")} ${economyGoodName(locale, "hydrogen")}`,
        exact: true,
      })
      .click();

    const stateAfter = await page.evaluate(() => window.miaplacidusTest!.getState());
    const outputAmount = stateAfter.run.goods.helium.quantity - heliumBefore;
    const storageLost = generatedAmount - outputAmount;
    expect(storageLost).toBeGreaterThan(0);
    const message = formatEconomyMessage(locale, "fusionStorageNotice", {
      sourceAmount: formatNumber(locale, amount, 0, stateAfter.settings.notation),
      source: economyGoodName(locale, "hydrogen"),
      target: economyGoodName(locale, "helium"),
      generatedAmount: formatNumber(locale, generatedAmount, 0, stateAfter.settings.notation),
      outputAmount: formatNumber(locale, outputAmount, 0, stateAfter.settings.notation),
      efficiencyLost: formatNumber(locale, 0, 0, stateAfter.settings.notation),
      storageLost: formatNumber(locale, storageLost, 0, stateAfter.settings.notation),
    });
    const notice = notifications
      .locator('[data-classification="fuse"]')
      .filter({ hasText: message })
      .last();
    await expect(notice).toHaveText(message);
    await expect(notice).toHaveAttribute("data-visible-duration-ms", "3000");
  }
});

test("category Increase All storage actions show localized aggregate results in all locales @phase7-locale @economy @notifications", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startEconomyFixture(page, "storage-each");
  await dismissTutorialOfferIfPresent(page);

  const notificationCards = page.getByTestId("notification-stack").getByTestId("game-notification");
  const categories = ["resources", "compounds"] as const;

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    for (const category of categories) {
      const goodIds =
        category === "resources"
          ? MATERIAL_IDS
          : (["water", ...COMPOUND_IDS.filter((goodId) => goodId !== "water")] as const);
      const firstGoodId = category === "resources" ? "hydrogen" : "diesel";
      const parentTabId = category === "resources" ? "hydrogen" : "compounds";
      await page.locator(`#tab-${parentTabId}`).click();
      await page.locator(`#tab-${category}-${firstGoodId}`).click();
      const activePanel =
        category === "resources"
          ? page.locator("#pane-hydrogen")
          : page.locator(`#panel-compounds-${firstGoodId}`);
      const increaseAllButton = activePanel.getByTestId(
        `economy-increase-all-storage-${category}`,
      );
      await expect(increaseAllButton).toHaveAttribute(
        "aria-label",
        `${economyLabel(locale, "increaseAllStorage")} ${economyLabel(locale, category)}`,
      );
      await expect(increaseAllButton).toBeEnabled();

      const capacitiesBefore = await page.evaluate((ids) => {
        const state = window.miaplacidusTest!.getState();
        return Object.fromEntries(ids.map((goodId) => [goodId, state.run.goods[goodId].storageCapacity]));
      }, goodIds);
      await increaseAllButton.click();
      const capacitiesAfter = await page.evaluate((ids) => {
        const state = window.miaplacidusTest!.getState();
        return Object.fromEntries(ids.map((goodId) => [goodId, state.run.goods[goodId].storageCapacity]));
      }, goodIds);
      const increasedGoods = goodIds.filter(
        (goodId) => capacitiesAfter[goodId]! > capacitiesBefore[goodId]!,
      );
      expect(increasedGoods.length).toBeGreaterThan(0);

      const message = formatEconomyMessage(locale, "storageIncreasedAllNotice", {
        materials: increasedGoods.map((goodId) => economyGoodName(locale, goodId)).join(", "),
      });
      const notice = notificationCards
        .locator('[data-classification="storage"]')
        .filter({ hasText: message })
        .last();
      await expect(notice).toHaveText(message);
      await expect(notice).toHaveClass(/notification-success/);
      await expect(notice).toHaveAttribute("data-visible-duration-ms", "3000");

      const restored = await page.evaluate(() =>
        window.miaplacidusTest!.applyDebugAction("give-1m-all-resources-compounds"),
      );
      expect(restored).toBe(true);
    }
  }
});
