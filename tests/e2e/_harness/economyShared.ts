import { expect, type Locator, type Page } from "./fixtures";
import { formatNumber } from "../../../src/app/numberFormatting";

export async function expandAllDetails(container: Locator): Promise<void> {
  const closedSummaries = container.locator("details:not([open]) > summary:visible");
  while ((await closedSummaries.count()) > 0) await closedSummaries.first().press("Enter");
  await expect(container.locator("details:not([open]) > summary:visible")).toHaveCount(0);
}

export async function collapseAllDetails(container: Locator): Promise<void> {
  const openDetails = container.locator("details[open] > summary:visible");
  while ((await openDetails.count()) > 0) await openDetails.first().press("Enter");
}

export async function expectHydrogenStyleGoodLayout(
  card: Locator,
  options: { readonly hasFusion: boolean; readonly compound?: boolean },
): Promise<void> {
  await expect(card.locator(".economy-card-heading")).toHaveCount(0);
  await expect(card.locator(".pane-intro")).toHaveCount(0);
  const hero = card.locator(".hydrogen-hero");
  const stock = hero.locator(".stock-readout > strong");
  const storage = card.locator(".hydrogen-storage-card");
  const sale = hero.locator(".sale-card");
  await expect(hero).toBeVisible();
  await expect(stock).toBeVisible();
  await expect(storage).toBeVisible();
  await expect(sale).toBeVisible();

  const panelOrder = await card.evaluate((node) =>
    Array.from(node.children)
      .filter((child) => !child.matches(".live-feedback"))
      .map((child) => {
        if (child.matches(".pane-heading")) return "heading";
        if (child.matches(".economy-page-actions")) return "actions";
        if (child.matches(".hydrogen-hero")) return "hero";
        if (child.matches(".hydrogen-storage-card")) return "storage";
        if (child.matches(".economy-details")) {
          const label = child.querySelector("summary")?.textContent?.trim() ?? "";
          return label.toLocaleLowerCase();
        }
        return child.className.toString();
      }),
  );
  expect(panelOrder).toEqual(
    options.compound
      ? ["heading", "actions", "hero", "storage", "autobuyers"]
      : ["heading", "hero", "storage", "autobuyers", "production allocation"],
  );

  const [heroBounds, storageBounds, saleBounds] = await Promise.all([
    hero.boundingBox(),
    storage.boundingBox(),
    sale.boundingBox(),
  ]);
  expect(heroBounds).not.toBeNull();
  expect(storageBounds).not.toBeNull();
  expect(saleBounds).not.toBeNull();
  expect(saleBounds!.y).toBeGreaterThanOrEqual(heroBounds!.y);
  expect(saleBounds!.y + saleBounds!.height).toBeLessThanOrEqual(
    heroBounds!.y + heroBounds!.height + 1,
  );
  expect(heroBounds!.y + heroBounds!.height).toBeLessThanOrEqual(storageBounds!.y + 1);
  expect(Math.abs(heroBounds!.x - storageBounds!.x)).toBeLessThanOrEqual(2);
  expect(Math.abs(heroBounds!.width - storageBounds!.width)).toBeLessThanOrEqual(2);

  const fusion = sale.locator(".resource-fusion-panel");
  if (options.hasFusion) {
    await expect(fusion).toBeVisible();
    await expect(fusion.locator("summary")).toHaveCount(0);
    const fusionBounds = await fusion.boundingBox();
    expect(fusionBounds).not.toBeNull();
    expect(fusionBounds!.y).toBeGreaterThanOrEqual(saleBounds!.y);
    expect(fusionBounds!.x).toBeCloseTo(saleBounds!.x, 0);
    expect(fusionBounds!.width).toBeCloseTo(saleBounds!.width, 0);
  } else {
    await expect(fusion).toHaveCount(0);
  }
}

export async function expectGoodStock(card: Locator, quantity: number, capacity?: number): Promise<void> {
  await expect(card.locator(".stock-readout > strong")).toContainText(formatNumber("en", quantity));
  if (capacity !== undefined) {
    await expect(card.locator(".capacity-line")).toContainText(formatNumber("en", capacity));
  }
}

export async function expectLocalizedContent(locator: Locator): Promise<void> {
  await expect(locator).not.toBeEmpty();
  await expect(locator).not.toContainText("???");
}

export async function dismissRandomEventResultIfOpen(page: Page): Promise<void> {
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  const dialog = page.getByTestId("random-event-result-dialog");
  if (!(await dialog.isVisible())) return;
  await dialog.getByRole("button").click();
  await expect(dialog).not.toBeVisible();
}

export async function clearTransientEconomyOverlays(page: Page): Promise<void> {
  const tutorial = page.locator(".progression-tutorial");
  if (await tutorial.isVisible()) {
    await tutorial.locator("button").last().click();
    await expect(tutorial).toHaveCount(0);
  }
  await expect(page.getByTestId("notification-stack")).toBeEmpty({ timeout: 15_000 });
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await expect(page.locator(".top-stat-tooltip:visible")).toHaveCount(0);
}

export async function clearQueuedNotificationsThroughSettings(page: Page): Promise<void> {
  await page.locator("#tab-settings").click();
  const notifications = page.locator("#settings-notifications");
  await expect(notifications).toBeChecked();
  await notifications.uncheck();
  await expect(page.locator('[data-testid="game-notification"]')).toHaveCount(0);
  await notifications.check();
  await expect(notifications).toBeChecked();
}

export async function expandResearchProduction(page: Page): Promise<void> {
  await page.locator("#tab-research-science-buildings").click();
  await expect(
    page.locator("#panel-research-science-buildings .research-production-section"),
  ).toBeVisible();
}

export async function visibleMainTabIds(page: Page): Promise<(string | null)[]> {
  return page
    .locator(".game-nav [role='tab']")
    .evaluateAll((tabs) =>
      tabs.map((tab) => tab.getAttribute("aria-controls")?.replace(/^pane-/, "") ?? null),
    );
}
