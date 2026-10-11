import { expect, test, type Locator, type Page } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { displayCurrency } from "../../../src/engine/precision";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { economyLabel } from "../../../src/i18n/economyMessages";

const PHONE = { width: 320, height: 740 } as const;

async function startFullEconomyFixture(page: Page): Promise<void> {
  await page.setViewportSize(PHONE);
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261009&testLocale=en&economyFixture=full");
  await page.getByLabel("Pioneer name").fill("P-13 Economy Phone Context");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });
}

async function readState(page: Page) {
  return page.evaluate(() => window.miaplacidusTest!.getState());
}

function cashText(state: Awaited<ReturnType<typeof readState>>): string {
  return formatCurrency(
    "en",
    Number(displayCurrency(state.run.cash)),
    state.settings.currencyId ?? "usd",
    2,
    state.settings.notation,
  );
}

async function expectInsidePhone(element: Locator, name: string): Promise<void> {
  const bounds = await element.boundingBox();
  expect(bounds, `${name} has a visible layout box`).not.toBeNull();
  expect(bounds!.x, `${name} left edge`).toBeGreaterThanOrEqual(-1);
  expect(bounds!.x + bounds!.width, `${name} right edge`).toBeLessThanOrEqual(PHONE.width + 1);
}

async function expectPageFits(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(PHONE.width);
}

test("P-13 Hydrogen and Diesel balances, prices, and actions fit at 320px @p13-economy-context", async ({
  page,
}, testInfo) => {
  await startFullEconomyFixture(page);

  await page.locator("#tab-hydrogen").click();
  const hydrogen = page.locator('[data-resource-id="hydrogen"]');
  await expect(hydrogen).toBeVisible();
  const hydrogenInitial = await readState(page);
  const hydrogenStock = hydrogen.locator(".stock-readout > strong");
  const collect = hydrogen.locator(".collect-button");
  const storage = hydrogen.locator(".hydrogen-storage-card");
  const sale = hydrogen.locator(".hydrogen-sale-controls");
  const saleQuantity = sale.locator(".card-controls select");
  const salePreview = sale.locator(".card-copy strong");
  const fuse = hydrogen.locator(".hydrogen-fusion-panel");
  const fuseAction = fuse.getByRole("button", { name: "Fuse Hydrogen", exact: true });

  await expect(hydrogenStock).toContainText(
    formatNumber("en", hydrogenInitial.run.goods.hydrogen.quantity, 0, hydrogenInitial.settings.notation),
  );
  await expect(page.getByTestId("cash-balance")).toHaveText(cashText(hydrogenInitial));
  await expect(page.getByTestId("research-balance")).toHaveText(
    formatNumber("en", hydrogenInitial.run.researchPoints, 0, hydrogenInitial.settings.notation),
  );
  await expect(storage.locator(".cost-line")).toBeVisible();
  await expect(collect).toBeEnabled();
  await expect(saleQuantity).toBeVisible();
  await expect(salePreview).toContainText("$");
  await expect(fuse).toBeVisible();
  await expect(fuse.getByLabel("Output Hydrogen")).toBeVisible();
  await expect(fuse.getByLabel("Fusion Amount Hydrogen")).toBeVisible();
  await expect(fuseAction).toBeEnabled();

  for (const [element, name] of [
    [hydrogen.locator(".hydrogen-hero"), "Hydrogen hero"],
    [hydrogenStock, "Hydrogen quantity"],
    [storage, "Hydrogen storage price/action"],
    [sale, "Hydrogen sale preview/action"],
    [fuse, "Hydrogen fusion controls"],
    [page.getByTestId("top-stat-cash"), "Cash balance"],
    [page.getByTestId("top-stat-rp"), "Research Points balance"],
  ] as const) {
    await expectInsidePhone(element, name);
  }
  await expectPageFits(page);
  await captureVisualCheckpoint(page, testInfo, "p13-hydrogen-actions-320");

  await saleQuantity.selectOption("1");
  const oneUnitSale = await salePreview.textContent();
  await saleQuantity.selectOption("all");
  await expect(salePreview).not.toHaveText(oneUnitSale ?? "");
  await saleQuantity.selectOption("1");
  await sale.getByRole("button", { name: /^Sell/ }).click();
  const hydrogenAfterSale = await readState(page);
  expect(hydrogenAfterSale.run.goods.hydrogen.quantity).toBe(
    hydrogenInitial.run.goods.hydrogen.quantity - 1,
  );
  expect(hydrogenAfterSale.run.cash).toBeGreaterThan(hydrogenInitial.run.cash);
  await expect(hydrogenStock).toContainText(
    formatNumber("en", hydrogenAfterSale.run.goods.hydrogen.quantity, 0, hydrogenAfterSale.settings.notation),
  );
  await expect(page.getByTestId("cash-balance")).toHaveText(cashText(hydrogenAfterSale));

  const beforeCollect = hydrogenAfterSale.run.goods.hydrogen.quantity;
  await collect.click();
  const hydrogenAfterCollect = await readState(page);
  expect(hydrogenAfterCollect.run.goods.hydrogen.quantity).toBe(beforeCollect + 1);
  await expect(hydrogenStock).toContainText(
    formatNumber("en", beforeCollect + 1, 0, hydrogenAfterCollect.settings.notation),
  );

  await fuse.getByLabel("Output Hydrogen").selectOption("helium");
  await fuse.getByLabel("Fusion Amount Hydrogen").fill("100");
  await fuseAction.click();
  const hydrogenAfterFusion = await readState(page);
  expect(hydrogenAfterFusion.run.goods.hydrogen.quantity).toBe(beforeCollect + 1 - 100);
  expect(hydrogenAfterFusion.run.goods.helium.quantity).toBeGreaterThan(
    hydrogenInitial.run.goods.helium.quantity,
  );

  await page.locator("#tab-compounds").click();
  const dieselTab = page.locator("#tab-compounds-diesel");
  await dieselTab.click();
  await expect(dieselTab).toHaveAttribute("aria-selected", "true");
  const diesel = page.locator('[data-compound-id="diesel"]');
  const dieselInitial = await readState(page);
  const dieselStock = diesel.locator(".stock-readout > strong");
  const createAmount = diesel.getByRole("spinbutton", {
    name: `${economyLabel("en", "amount")} ${economyGoodName("en", "diesel")}`,
  });
  const create = diesel.getByRole("button", {
    name: `${economyLabel("en", "create")} ${economyGoodName("en", "diesel")}`,
    exact: true,
  });
  const compoundSale = diesel.locator(".hydrogen-sale-controls");
  const compoundSaleQuantity = compoundSale.locator(".card-controls select");

  await expect(dieselStock).toContainText(
    formatNumber("en", dieselInitial.run.goods.diesel.quantity, 0, dieselInitial.settings.notation),
  );
  await expect(page.getByTestId("cash-balance")).toHaveText(cashText(dieselInitial));
  await expect(page.getByTestId("research-balance")).toHaveText(
    formatNumber("en", dieselInitial.run.researchPoints, 0, dieselInitial.settings.notation),
  );
  await expect(diesel.locator(".hydrogen-storage-card .cost-line")).toBeVisible();
  await expect(diesel.locator(".compound-recipe")).toBeVisible();
  await expect(diesel.locator("[data-testid='compound-diesel-preview']")).toBeVisible();
  await expect(createAmount).toBeVisible();
  await expect(create).toBeEnabled();
  await expect(compoundSaleQuantity).toBeVisible();
  await expect(compoundSale.locator(".card-copy strong")).toContainText("$");

  for (const [element, name] of [
    [diesel.locator(".hydrogen-hero"), "Diesel hero"],
    [dieselStock, "Diesel quantity"],
    [diesel.locator(".compound-recipe"), "Diesel recipe"],
    [diesel.locator(".compound-create-controls"), "Diesel create price/action"],
    [diesel.locator(".hydrogen-storage-card"), "Diesel storage price/action"],
    [compoundSale, "Diesel sale preview/action"],
    [page.getByTestId("top-stat-cash"), "Cash balance"],
    [page.getByTestId("top-stat-rp"), "Research Points balance"],
  ] as const) {
    await expectInsidePhone(element, name);
  }
  await expectPageFits(page);
  await captureVisualCheckpoint(page, testInfo, "p13-diesel-actions-320");

  await createAmount.fill("1");
  const oneUnitCreate = await diesel.locator("[data-testid='compound-diesel-preview']").textContent();
  await createAmount.fill("2");
  await expect(diesel.locator("[data-testid='compound-diesel-preview']")).not.toHaveText(
    oneUnitCreate ?? "",
  );
  await createAmount.fill("1");
  await create.click();
  const dieselAfterCreate = await readState(page);
  expect(dieselAfterCreate.run.goods.diesel.quantity).toBe(
    dieselInitial.run.goods.diesel.quantity + 1,
  );
  await expect(dieselStock).toContainText(
    formatNumber("en", dieselAfterCreate.run.goods.diesel.quantity, 0, dieselAfterCreate.settings.notation),
  );

  await compoundSaleQuantity.selectOption("1");
  await compoundSale.getByRole("button", { name: /^Sell/ }).click();
  const dieselAfterSale = await readState(page);
  expect(dieselAfterSale.run.goods.diesel.quantity).toBe(dieselInitial.run.goods.diesel.quantity);
  expect(dieselAfterSale.run.cash).toBeGreaterThan(dieselInitial.run.cash);
  await expect(page.getByTestId("cash-balance")).toHaveText(cashText(dieselAfterSale));
});
