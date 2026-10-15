import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";

async function startFixture(page: Page, fixture: string, pioneer: string): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261008&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill(pioneer);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function hideAmbientOverlaysForScreenshot(page: Page): Promise<void> {
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });
}

test("Space Mining titles and artwork follow the selected child tab @phase6-tab-layout", async ({
  page,
}) => {
  await startFixture(page, "space-late-game", "Mining Presentation Pioneer");
  await page.getByRole("tab", { name: "Space Mining" }).click();
  const pane = page.getByTestId("space-mining-pane");
  const childTabs = page.locator("#pane-space-mining .pane-nav [role='tab']");
  await expect(page.locator("#tab-space-mining-mining")).toHaveAttribute("aria-label", /Mining/);
  await expect(page.locator("#tab-space-mining-telescope")).toHaveAttribute(
    "aria-label",
    /Space Telescope/,
  );

  const asteroidsTab = page.locator("#tab-space-mining-asteroids");
  await expect
    .poll(() =>
      asteroidsTab.evaluate((element) => {
        const copy = element.cloneNode(true) as HTMLElement;
        copy.querySelector(".attention-badge")?.remove();
        return copy.innerText.trim();
      }),
    )
    .toBe("Asteroids");
  const childLabels = await childTabs.evaluateAll((tabs) =>
    tabs.map((tab) => {
      const copy = tab.cloneNode(true) as HTMLElement;
      copy.querySelector(".attention-badge")?.remove();
      return copy.innerText.trim();
    }),
  );
  expect(childLabels).not.toContain("Discovered Asteroids");

  for (const tab of await childTabs.all()) {
    const id = await tab.getAttribute("id");
    if (!id) throw new Error("Space Mining child tab has no stable ID.");
    const label = await tab.evaluate((element) => {
      const copy = element.cloneNode(true) as HTMLElement;
      copy.querySelector(".attention-badge")?.remove();
      return copy.innerText.trim();
    });
    await tab.click();
    await expect(pane.locator(".game-page-title")).toHaveText(label);
    await expect(pane.locator(".game-page-title")).toHaveCount(1);
  }

  await page.locator("#tab-space-mining-telescope").click();
  await expect(
    pane.locator(".page-artwork-row [data-celestial-illustration='radio-telescope']"),
  ).toHaveCount(1);
});
