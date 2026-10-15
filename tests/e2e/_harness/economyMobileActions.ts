import { expect, type Locator, type Page } from "./fixtures";

export async function startFullEconomyFixture(page: Page, pioneerName: string): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261009&testLocale=en&economyFixture=storage-all");
  await page.getByLabel("Pioneer name").fill(pioneerName);
  await page.getByTestId("start-game").tap();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

export async function expandMechanicsDetails(container: Locator): Promise<void> {
  const closed = container.locator("details:not([open]) > summary:visible");
  while ((await closed.count()) > 0) await closed.first().tap();
}

export async function expectMechanicsTargetsAtLeast44px(
  container: Locator,
  label: string,
): Promise<number> {
  const documentBounds = await container.evaluate((element) => ({
    documentWidth: element.ownerDocument.documentElement.scrollWidth,
    viewportWidth: element.ownerDocument.defaultView?.innerWidth ?? 0,
  }));
  expect(
    documentBounds.documentWidth,
    `${label} document width should fit its viewport`,
  ).toBeLessThanOrEqual(documentBounds.viewportWidth);
  const targets = await container
    .locator(
      "button:visible, select:visible, input[type=number]:visible, summary:visible, [role=slider]:visible, .economy-toggle:visible",
    )
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          label:
            node.getAttribute("aria-label") ??
            node.textContent?.trim().replace(/\s+/g, " ").slice(0, 42) ??
            node.tagName,
          className: typeof node.className === "string" ? node.className : "",
          width: Math.round(rect.width * 10) / 10,
          height: Math.round(rect.height * 10) / 10,
        };
      }),
    );
  for (const target of targets) {
    expect(
      target.width,
      `${label} ${target.className || target.label} hit area width`,
    ).toBeGreaterThanOrEqual(44);
    expect(
      target.height,
      `${label} ${target.className || target.label} hit area height`,
    ).toBeGreaterThanOrEqual(44);
  }
  return targets.length;
}

export async function goodQuantity(page: Page, id: string): Promise<number> {
  return page.evaluate(
    (goodId) => window.miaplacidusTest!.getState().run.goods[goodId]!.quantity,
    id,
  );
}

export async function cash(page: Page): Promise<number> {
  return page.evaluate(() => window.miaplacidusTest!.getState().run.cash);
}

export async function goodCapacity(page: Page, id: string): Promise<number> {
  return page.evaluate(
    (goodId) => window.miaplacidusTest!.getState().run.goods[goodId]!.storageCapacity,
    id,
  );
}
