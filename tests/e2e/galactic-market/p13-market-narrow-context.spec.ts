import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { displayCurrency } from "../../../src/engine/precision";
import { quoteGalacticTrade } from "../../../src/engine/galacticMarket";

const NARROW_VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

test("Galactic Market trade quote, balances, and action fit at narrow widths @p13-market-context", async ({
  page,
}, testInfo) => {
  await page.setViewportSize(NARROW_VIEWPORTS[0]);
  await startMetaFixture(page, "meta-market-ready");
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-market").click();

  const market = page.getByRole("region", { name: "Galactic Market" });
  const tradeCard = market.locator(".upgrade-card").first();
  await market.getByLabel("You give").selectOption("hydrogen");
  await market.getByLabel("You receive").selectOption("helium");
  await market.getByLabel("Quantity to trade").fill("10");

  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  const quote = quoteGalacticTrade(before, "hydrogen", "helium", 10);
  expect(quote).not.toBeNull();
  expect(quote).toMatchObject({ commissionQuantity: 1, incomingQuantity: 18 });
  const cashValue = formatCurrency(
    "en",
    Number(displayCurrency(before.run.cash)),
    before.settings.currencyId ?? "usd",
    2,
    before.settings.notation,
  );
  const tradeButton = market.getByRole("button", { name: "Confirm trade", exact: true });

  for (const viewport of NARROW_VIEWPORTS) {
    await page.setViewportSize(viewport);
    await expect(page.locator("#tab-galaxy")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#tab-galactic-market")).toHaveAttribute("aria-selected", "true");
    await expect(market).toBeVisible();
    await expect(tradeCard).toBeVisible();
    await expect(market.getByLabel("You give")).toHaveValue("hydrogen");
    await expect(market.getByLabel("You receive")).toHaveValue("helium");
    await expect(market.getByLabel("Quantity to trade")).toHaveValue("10");
    await expect(market.getByText(/^You give:/)).toContainText("10 Hydrogen");
    await expect(market.getByText(/^You receive:/)).toContainText(
      `${formatNumber("en", quote!.incomingQuantity, 0, before.settings.notation)} Helium`,
    );
    await expect(
      market.getByText(
        `Commission: ${formatNumber("en", quote!.commissionQuantity, 0, before.settings.notation)} Hydrogen`,
        { exact: true },
      ),
    ).toBeVisible();
    await expect(tradeButton).toBeVisible();
    await expect(tradeButton).toBeEnabled();
    await expect(page.getByTestId("cash-balance")).toHaveText(cashValue);
    await expect(page.getByTestId("research-balance")).toHaveText(
      formatNumber("en", before.run.researchPoints, 0, before.settings.notation),
    );

    const bounds = await page.evaluate(() => {
      const rect = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) throw new Error(`Expected visible narrow-context element: ${selector}`);
        const box = element.getBoundingClientRect();
        return { left: box.left, right: box.right };
      };
      return {
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        elements: [
          ["Galactic Market pane", rect(".galactic-market-pane")],
          ["Trade quote and action", rect(".galactic-market-pane .upgrade-card")],
          ["Trade inputs", rect(".galactic-market-pane .upgrade-card label:last-of-type")],
          ["Cash balance", rect('[data-testid="top-stat-cash"]')],
          ["Research Points balance", rect('[data-testid="top-stat-rp"]')],
        ] as const,
      };
    });
    expect(bounds.documentWidth, `${viewport.width}px document width`).toBeLessThanOrEqual(
      viewport.width,
    );
    for (const [name, rect] of bounds.elements) {
      expect(rect.left, `${viewport.width}px ${name} left edge`).toBeGreaterThanOrEqual(-1);
      expect(rect.right, `${viewport.width}px ${name} right edge`).toBeLessThanOrEqual(
        viewport.width + 1,
      );
    }
    await captureVisualCheckpoint(page, testInfo, `p13-market-trade-quote-${viewport.width}`);
  }

  await tradeButton.click();
  const after = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(after.run.goods.hydrogen.quantity).toBe(before.run.goods.hydrogen.quantity - 10);
  expect(after.run.goods.helium.quantity).toBe(before.run.goods.helium.quantity + quote!.incomingQuantity);
  expect(after.permanent.galacticMarket.history).toHaveLength(1);
  expect(after.run.cash).toBe(before.run.cash);
  await expect(page.getByTestId("cash-balance")).toHaveText(cashValue);
  await expect(market.getByRole("listitem")).toContainText("10 Hydrogen");
  await expect(
    page.locator('[data-testid="game-notification"][data-classification="special"]'),
  ).toContainText("You have traded 9 Hydrogen for 18 Helium");
});
