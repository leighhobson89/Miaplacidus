import { expect, test } from "../_harness/fixtures";

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
});

test("Star Map search and destination actions accept phone touch targets @p05-map-actions", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-manuscript-hidden");
  await page.getByLabel("Pioneer name").fill("Star Map P05 Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);

  await page.getByRole("tab", { name: "Interstellar" }).click();
  const interstellar = page.getByRole("tabpanel", { name: /Interstellar/ });
  const map = page.getByTestId("star-map-pane");
  const search = map.getByRole("searchbox", { name: "Search stars" });
  await search.fill("Sirius");
  const searchResult = map.locator(".star-map-search-results button").filter({ hasText: "Sirius" });
  await expect(searchResult).toBeVisible();
  await searchResult.scrollIntoViewIfNeeded();
  const searchBounds = await searchResult.boundingBox();
  expect(searchBounds).not.toBeNull();
  const searchHit = await searchResult.evaluate((button) => {
    const bounds = button.getBoundingClientRect();
    const hitArea = getComputedStyle(button, "::after");
    return {
      width: bounds.width - 2 * Number.parseFloat(hitArea.left),
      height: bounds.height - 2 * Number.parseFloat(hitArea.top),
      topInset: hitArea.top,
    };
  });
  expect(searchHit.width).toBeGreaterThanOrEqual(44);
  expect(searchHit.height).toBeGreaterThanOrEqual(44);
  expect(searchHit.topInset).toBe("-6px");
  const searchTap = { x: searchBounds!.x + searchBounds!.width / 2, y: searchBounds!.y - 4 };
  expect(
    await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.closest(".star-map-search-results") !== null,
      searchTap,
    ),
  ).toBe(true);
  await page.touchscreen.tap(searchTap.x, searchTap.y);
  await expect(map.getByTestId("star-selection")).toContainText("Sirius");

  await interstellar.getByRole("tab", { name: "Star Data" }).click();
  const table = page.getByTestId("star-data-table");
  const tableScroll = table.locator("xpath=..");
  await tableScroll.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
  });
  const keyboardButton = table
    .locator('tbody tr td:last-child button:not(:disabled)[aria-pressed="false"]')
    .first();
  const keyboardRowIndex = await keyboardButton.evaluate((button) => {
    const row = button.closest("tr")!;
    return Array.prototype.indexOf.call(row.parentElement!.children, row) as number;
  });
  const keyboardRow = table.locator("tbody tr").nth(keyboardRowIndex);
  await keyboardButton.scrollIntoViewIfNeeded();
  await keyboardButton.focus();
  await expect(keyboardButton).toBeFocused();
  await keyboardButton.press("Enter");
  await expect(keyboardRow.locator("td:last-child button")).toHaveAttribute("aria-pressed", "true");
  const destinationBeforeTouch = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.starship.destinationSystemId,
  );

  const targetButton = table
    .locator('tbody tr td:last-child button:not(:disabled)[aria-pressed="false"]')
    .first();
  await expect(targetButton).toBeVisible();
  await targetButton.scrollIntoViewIfNeeded();
  const targetBounds = await targetButton.boundingBox();
  expect(targetBounds).not.toBeNull();
  const destinationHit = await targetButton.evaluate((button) => {
    const bounds = button.getBoundingClientRect();
    const hitArea = getComputedStyle(button, "::after");
    return {
      height: bounds.height - 2 * Number.parseFloat(hitArea.top),
      topInset: hitArea.top,
    };
  });
  expect(destinationHit.height).toBeGreaterThanOrEqual(44);
  expect(destinationHit.topInset).toBe("-6px");
  const destinationTap = {
    x: targetBounds!.x + targetBounds!.width / 2,
    y: targetBounds!.y - 4,
  };
  expect(
    await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.getAttribute("aria-label"),
      destinationTap,
    ),
  ).toBe(await targetButton.getAttribute("aria-label"));
  await page.touchscreen.tap(destinationTap.x, destinationTap.y);
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.starship.destinationSystemId,
      ),
    )
    .not.toBe(destinationBeforeTouch);
  await expect(table.locator('tbody tr td:last-child button[aria-pressed="true"]')).toHaveCount(1);
});
