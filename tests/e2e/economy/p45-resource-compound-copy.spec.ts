import { expect, test } from "../_harness/fixtures";
import { economyGoodName, economyGoodPageTitle } from "../../../src/app/economyDisplay";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { COMPOUND_IDS, LOCALE_IDS, MATERIAL_IDS, type LocaleId } from "../../../src/content/ids";
import { displayCurrency } from "../../../src/engine/precision";
import { selectGoodSale } from "../../../src/engine/selectors";
import { economyLabel, formatEconomyMessage } from "../../../src/i18n/economyMessages";
import { economyActionHelp } from "../../../src/i18n/economyActionHelpMessages";
import { translate } from "../../../src/i18n/messages";
import { philosophyCompoundRecipe } from "../../../src/engine/philosophy";

async function startEconomyFixture(
  page: import("@playwright/test").Page,
  fixture: "storage-all" | "full" | "bulk-hydrogen" = "storage-all",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel(translate("en", "app.pioneer")).fill("P-45 Resource Compound Copy");
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

test("Resource and Compound visible actions and statuses use the active locale @p45-resource-compound-copy", async ({
  page,
}) => {
  test.setTimeout(300_000);
  await startEconomyFixture(page);
  const notifications = page.getByTestId("notification-stack").getByTestId("game-notification");

  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);

    await page.locator("#tab-hydrogen").click();
    for (const id of MATERIAL_IDS) {
      const name = economyGoodName(locale, id);
      const tab = page.locator(`#tab-resources-${id}`);
      await expect(tab).toContainText(name);
      await tab.click();

      const panel = page.locator(`#panel-resources-${id}`);
      const resource = id === "hydrogen" ? panel : panel.locator(`[data-resource-id="${id}"]`);
      await expect(resource.locator(".pane-heading h2")).toHaveText(name);
      await expect(resource.locator(".stock-readout .eyebrow")).toHaveText(
        translate(locale, "hydrogen.quantity"),
      );
      await expect(resource.locator(".capacity-line")).toContainText(
        translate(locale, "hydrogen.capacity"),
      );
      await expect(resource.locator(".rate-readout .eyebrow")).toHaveText(
        translate(locale, "hydrogen.production"),
      );

      const collect = resource.locator(".collect-button");
      await expect(collect).toContainText(
        id === "hydrogen"
          ? translate(locale, "hydrogen.collect")
          : economyLabel(locale, "collect"),
      );
      if (await collect.isEnabled()) await collect.click();
      await expect(collect).toBeDisabled();
      const collectReasonId = await collect.getAttribute("aria-describedby");
      expect(collectReasonId, `${locale} ${id} full-storage reason association`).toBeTruthy();
      await expect(resource.locator(`#${collectReasonId}`)).toHaveText(
        id === "hydrogen"
          ? translate(locale, "reason.inventory-full")
          : economyLabel(locale, "collectStorageFull"),
      );

      const storage = resource.locator(".hydrogen-storage-card");
      await expect(storage.locator("h3")).toHaveText(
        id === "hydrogen"
          ? translate(locale, "hydrogen.storage.title")
          : `${economyLabel(locale, "storage")}: ${name}`,
      );
      if (id === "hydrogen") {
        const storageHelp = economyActionHelp(locale, "hydrogen", "storage");
        expect(storageHelp.trim(), `${locale} Hydrogen storage help should be populated`).not.toBe("");
        await expect(storage.locator(".card-copy p")).toHaveText(storageHelp);
        await expect(storage.locator(".cost-line")).toContainText(
          translate(locale, "hydrogen.storage.price"),
        );
        await expect(
          storage.getByRole("button", {
            name: translate(locale, "hydrogen.storage.purchase"),
            exact: true,
          }),
        ).toBeVisible();
      } else {
        const storageButton = storage.getByRole("button");
        await expect(storageButton).toBeVisible();
        await expect(storageButton).toContainText(economyLabel(locale, "increaseStorage"));
      }

      const sale = resource.locator(".hydrogen-sale-controls");
      const sellLabel =
        id === "hydrogen" ? translate(locale, "hydrogen.sell") : economyLabel(locale, "sell");
      const salePreviewLabel =
        id === "hydrogen"
          ? translate(locale, "hydrogen.sale.preview")
          : economyLabel(locale, "salePreview");
      await expect(sale.locator(".card-copy h3")).toHaveText(sellLabel);
      await expect(sale.locator(".card-copy p").last()).toContainText(`${salePreviewLabel}:`);
      const saleAmount =
        id === "hydrogen"
          ? translate(locale, "hydrogen.sell.amount")
          : `${economyLabel(locale, "saleAmount")} ${name}`;
      const saleSelect = sale.getByLabel(saleAmount);
      await expect(saleSelect).toBeVisible();
      await expect(
        saleSelect.getByRole("option", {
          name:
            id === "hydrogen"
              ? translate(locale, "hydrogen.sell.all")
              : economyLabel(locale, "allStock"),
          exact: true,
        }),
      ).toBeAttached();
      await expect(sale.locator(".card-controls button")).toContainText(
        id === "hydrogen" ? sellLabel : `${sellLabel} ${name}`,
      );

      const autoSummary = resource
        .locator("details > summary")
        .filter({ hasText: economyLabel(locale, "autobuyers") });
      await expect(autoSummary).toHaveText(economyLabel(locale, "autobuyers"));
      if (id === "hydrogen") {
        const autoBuyers = resource.locator(".hydrogen-autobuyer-section");
        if (!(await autoBuyers.evaluate((element) => element.hasAttribute("open"))))
          await autoSummary.click();
        await expect(autoBuyers.locator(".autobuyer-card h3")).toHaveText(
          translate(locale, "hydrogen.autobuyer.title"),
        );
        await expect(
          autoBuyers.getByRole("button", {
            name: translate(locale, "hydrogen.autobuyer.purchase"),
            exact: true,
          }),
        ).toBeVisible();
      } else {
        const details = autoSummary.locator("xpath=..");
        if (!(await details.evaluate((element) => element.hasAttribute("open"))))
          await autoSummary.click();
        const firstTier = resource.locator(".resource-autobuyer-tiers .economy-tier").first();
        await expect(firstTier.locator("span")).toContainText(
          `${economyLabel(locale, "buyTier")} 1:`,
        );
        await expect(firstTier.locator(".text-button").first()).toContainText(
          economyLabel(locale, "buy"),
        );
      }
    }

    await page.locator("#tab-compounds").click();
    for (const id of COMPOUND_IDS) {
      const name = economyGoodName(locale, id);
      const tab = page.locator(`#tab-compounds-${id}`);
      await expect(tab).toContainText(name);
      await tab.click();

      const panel = page.locator(`#panel-compounds-${id}`);
      const compound = panel.locator(`[data-compound-id="${id}"]`);
      await expect(compound.locator(".pane-heading h2")).toHaveText(
        economyGoodPageTitle(locale, id),
      );
      const recipe = compound.locator(".compound-recipe");
      await expect(recipe).toContainText(`${economyLabel(locale, "recipe")}:`);
      const state = await page.evaluate(() => window.miaplacidusTest!.getState());
      for (const input of philosophyCompoundRecipe(state, id))
        await expect(recipe).toContainText(economyGoodName(locale, input.goodId));

      const amount = compound.getByRole("spinbutton", {
        name: `${economyLabel(locale, "amount")} ${name}`,
      });
      await expect(amount).toBeVisible();
      await expect(
        compound.getByRole("button", {
          name: `${economyLabel(locale, "create")} ${name}`,
          exact: true,
        }),
      ).toBeVisible();
      await expect(compound.locator(`[data-testid="compound-${id}-preview"]`)).toContainText(
        economyGoodName(locale, id),
      );

      const storage = compound.locator(".hydrogen-storage-card");
      await expect(storage.locator("h3")).toHaveText(
        `${economyLabel(locale, "storage")}: ${name}`,
      );
      await expect(
        storage.getByRole("button"),
      ).toBeVisible();
      await expect(storage.getByRole("button")).toContainText(
        economyLabel(locale, "increaseStorage"),
      );

      const sale = compound.locator(".hydrogen-sale-controls");
      await expect(sale.locator(".card-copy h3")).toHaveText(economyLabel(locale, "sell"));
      await expect(sale.locator(".card-copy p").last()).toContainText(
        `${economyLabel(locale, "salePreview")}:`,
      );
      await expect(sale.getByLabel(`${economyLabel(locale, "saleAmount")} ${name}`)).toBeVisible();
      await expect(sale.locator(".card-controls button")).toHaveText(
        `${economyLabel(locale, "sell")} ${name}`,
      );

      const autoBuyers = compound.locator(".compound-autobuyer-section");
      const autoSummary = autoBuyers.locator("summary");
      await expect(autoSummary).toHaveText(economyLabel(locale, "autobuyers"));
      if (!(await autoBuyers.evaluate((element) => element.hasAttribute("open"))))
        await autoSummary.click();
      const autoCreateLabel = autoBuyers.locator("label.economy-toggle");
      await expect(autoCreateLabel).toContainText(economyLabel(locale, "automaticCreation"));
      await expect(autoCreateLabel.getByRole("checkbox")).toBeEnabled();
      const firstTier = autoBuyers.locator(".economy-tier").first();
      await expect(firstTier.locator("span")).toContainText(
        `${economyLabel(locale, "buyTier")} 1:`,
      );
      await expect(firstTier.locator(".text-button").first()).toContainText(
        economyLabel(locale, "buy"),
      );
      await expect(
        firstTier.getByRole("button", {
          name: economyLabel(locale, "buyMax"),
          exact: true,
        }),
      ).toBeVisible();
    }

    await page.locator("#tab-hydrogen").click();
    await page.locator("#tab-resources-hydrogen").click();
    const hydrogen = page.locator("#panel-resources-hydrogen");
    await expect(notifications).toHaveCount(0, { timeout: 30_000 });
    await hydrogen.locator("#hydrogen-sell-amount").selectOption("1");
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const sale = selectGoodSale(state, "hydrogen", 1);
    const expectedNotice = formatEconomyMessage(locale, "saleNotification", {
      amount: formatNumber(locale, sale.amount, 2, state.settings.notation),
      good: economyGoodName(locale, "hydrogen"),
      cash: formatCurrency(
        locale,
        Number(displayCurrency(sale.proceeds)),
        state.settings.currencyId ?? "usd",
        2,
        state.settings.notation,
      ),
    });
    await hydrogen
      .getByRole("button", {
        name: translate(locale, "hydrogen.sell"),
        exact: true,
      })
      .click();
    await expect(notifications.filter({ hasText: expectedNotice }).last()).toHaveText(
      expectedNotice,
    );
  }
});

test("Compound creation success feedback is rendered in all locales @p45-compound-result", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startEconomyFixture(page, "full");
  await page.locator("#tab-compounds").click();
  await page.locator("#tab-compounds-diesel").click();

  const diesel = page.locator('#panel-compounds-diesel [data-compound-id="diesel"]');
  const autoCreateSection = diesel.locator(".compound-autobuyer-section");
  await autoCreateSection.locator("summary").click();
  const autoCreate = autoCreateSection.locator("input[type=checkbox]");
  if (await autoCreate.isChecked()) await autoCreate.uncheck();
  const notifications = page.getByTestId("notification-stack").getByTestId("game-notification");

  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    await expect(notifications).toHaveCount(0, { timeout: 20_000 });
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const recipe = philosophyCompoundRecipe(state, "diesel");
    const expectedParts = new Intl.ListFormat(locale, {
      style: "long",
      type: "conjunction",
    }).format(
      recipe.map(
        ({ goodId, amount }) =>
          `${formatNumber(locale, amount, 0, state.settings.notation)} ${economyGoodName(locale, goodId)}`,
      ),
    );
    const expectedNotice = formatEconomyMessage(locale, "compoundCreatedNotice", {
      amount: formatNumber(locale, 1, 0, state.settings.notation),
      compound: economyGoodName(locale, "diesel"),
      parts: expectedParts,
    });
    const before = {
      diesel: state.run.goods.diesel.quantity,
    };

    await diesel
      .getByRole("button", {
        name: `${economyLabel(locale, "create")} ${economyGoodName(locale, "diesel")}`,
        exact: true,
      })
      .click();

    const notice = notifications.filter({ hasText: expectedNotice }).last();
    await expect(notice).toHaveAttribute("data-classification", "create");
    await expect(notice).toHaveText(expectedNotice);
    const after = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(after.run.goods.diesel.quantity).toBeCloseTo(before.diesel + 1, 8);
    for (const { goodId, amount } of recipe)
      expect(after.run.goods[goodId].quantity).toBeCloseTo(
        state.run.goods[goodId].quantity - amount,
        8,
      );
  }
});

test("manual Hydrogen collection updates the visible stock in all locales @p45-hydrogen-collection-result", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startEconomyFixture(page, "bulk-hydrogen");
  await page.locator("#tab-hydrogen").click();
  await page.locator("#tab-resources-hydrogen").click();

  const hydrogen = page.locator("#panel-resources-hydrogen");
  const stock = hydrogen.getByTestId("hydrogen-quantity");
  const rate = hydrogen.getByTestId("hydrogen-rate");

  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const before = state.run.goods.hydrogen.quantity;
    const rateBefore = await rate.textContent();
    const collect = hydrogen.getByRole("button", {
      name: translate(locale, "hydrogen.collect"),
      exact: true,
    });
    await expect(collect).toBeEnabled();
    await expect(stock).toContainText(formatNumber(locale, before, 2, state.settings.notation));

    await collect.click();
    await expect
      .poll(() =>
        page.evaluate(() => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity),
      )
      .toBe(before + 1);
    await expect(stock).toContainText(formatNumber(locale, before + 1, 2, state.settings.notation));
    expect(await rate.textContent()).toBe(rateBefore);
  }
});
