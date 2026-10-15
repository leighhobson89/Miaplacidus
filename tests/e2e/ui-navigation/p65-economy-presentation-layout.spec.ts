import { expect, test } from "../_harness/fixtures";
import { COMPOUND_IDS } from "../../../src/content/ids";
import { economyLabel } from "../../../src/i18n/economyMessages";

async function startFullEconomyFixture(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    for (const key of Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    )) {
      if (key?.startsWith(prefix)) localStorage.removeItem(key);
    }
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=full");
  await page.getByLabel("Pioneer name").fill("P-65 Layout Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("P-65 standardizes Research and Energy while preserving Resource and Compound layouts @p65 @ui @ui-navigation", async ({
  page,
}) => {
  await startFullEconomyFixture(page);

  await page.getByRole("tab", { name: /Research/ }).click();
  const research = page.getByTestId("economy-research");
  await expect(research.locator(".economy-section-heading h2.game-page-title")).toBeVisible();
  await expect(research.locator(".page-artwork-row [data-emblem-kind='laboratory']")).toBeVisible();

  await page.locator("#tab-research-tech-tree").click();
  await expect(research.locator(".page-artwork-row [data-emblem-kind='technology']")).toBeVisible();

  await page.getByRole("tab", { name: /Energy/ }).click();
  const energy = page.getByTestId("economy-energy");
  const energyTabs = page.locator("#pane-energy .pane-nav [role='tab']");
  expect(await energyTabs.evaluateAll((tabs) => tabs.map((tab) => tab.id))).toEqual([
    "tab-energy-summary",
    "tab-energy-batteries",
    "tab-energy-power",
  ]);
  await expect(energy.locator(".economy-section-heading h2.game-page-title")).toHaveText(
    "Energy Summary",
  );
  await expect(
    energy.locator(".page-artwork-row [data-emblem-kind='energy-lightning']"),
  ).toBeVisible();
  await expect(energy.getByRole("figure", { name: "Power generation mix" })).toBeVisible();
  await page.locator("#tab-energy-batteries").click();
  await expect(energy.locator(".economy-section-heading h2.game-page-title")).toHaveText(
    "Batteries",
  );
  await expect(
    energy.locator(".page-artwork-row [data-emblem-kind='energy-lightning']"),
  ).toBeVisible();
  await expect(energy.getByRole("figure", { name: "Power generation mix" })).toHaveCount(0);
  await page.locator("#tab-energy-power").click();
  await expect(energy.locator(".economy-section-heading h2.game-page-title")).toHaveText("Power");
  await expect(
    energy.locator(".page-artwork-row [data-emblem-kind='energy-lightning']"),
  ).toBeVisible();
  await expect(energy.getByRole("checkbox", { name: /power grid/i })).toHaveCount(0);
  for (const buildingId of ["powerPlant1", "powerPlant2", "powerPlant3"]) {
    await expect(energy.locator(`[data-building-id='${buildingId}']`)).toBeVisible();
  }
  const masterSwitch = energy.getByRole("button", {
    name: economyLabel("en", "deactivatePower"),
    exact: true,
  });
  await expect(masterSwitch).toHaveAttribute("style", "width: 100%;");
  await masterSwitch.click();
  await expect(
    energy.getByRole("button", { name: economyLabel("en", "activatePower"), exact: true }),
  ).toBeVisible();

  await page.locator("#tab-hydrogen").click();
  const hydrogen = page.locator('[data-resource-id="hydrogen"]');
  await expect(hydrogen.locator(".game-page-title")).toBeVisible();
  await expect(hydrogen.locator(".page-artwork-row")).toHaveCount(0);
  await expect(hydrogen.locator(".hydrogen-hero")).toBeVisible();

  await page.getByRole("tab", { name: /Compounds/ }).click();
  await page.getByTestId(`compound-rail-${COMPOUND_IDS[0]}`).click();
  const compound = page.locator(`#pane-compounds [data-compound-id="${COMPOUND_IDS[0]}"]`);
  await expect(compound.locator(".game-page-title")).toBeVisible();
  await expect(compound.locator(".page-artwork-row")).toHaveCount(0);
  await expect(compound.locator(".hydrogen-hero")).toBeVisible();
});

test("P-65 Research and Energy panes keep one heading and artwork row at desktop and phone widths @p65 @ui @p65-identity @ui-navigation", async ({
  page,
}) => {
  await startFullEconomyFixture(page);
  const routes = [
    ["research", "tab-research", "tab-research-science-buildings", "Research", "laboratory"],
    ["tech-tree", "tab-research", "tab-research-tech-tree", "Tech Tree", "technology"],
    ["energy-summary", "tab-energy", "tab-energy-summary", "Energy Summary", "energy-lightning"],
    ["energy-batteries", "tab-energy", "tab-energy-batteries", "Batteries", "energy-lightning"],
    ["energy-power", "tab-energy", "tab-energy-power", "Power", "energy-lightning"],
  ] as const;

  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    const titleSizes: string[] = [];
    for (const [name, mainTab, childTab, expectedTitle, emblem] of routes) {
      await page.locator(`#${mainTab}`).click();
      await page.locator(`#${childTab}`).click();
      const pane = page.locator(mainTab === "tab-research" ? "#pane-research" : "#pane-energy");
      const title = pane.locator(".game-page-title:visible");
      const artwork = pane.locator(".page-artwork-row:visible");
      await expect(title, `${name} should have one visible title`).toHaveCount(1);
      await expect(title).toHaveText(expectedTitle);
      await expect(artwork, `${name} should have one visible artwork row`).toHaveCount(1);
      await expect(
        artwork.locator(`[data-emblem-kind='${emblem}']`),
        `${name} should use its intended artwork`,
      ).toHaveCount(1);
      await expect(artwork).toBeVisible();

      const bounds = await title.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          fontSize: getComputedStyle(element).fontSize,
        };
      });
      titleSizes.push(bounds.fontSize);
      expect(bounds.left, `${name} title left edge at ${viewport.width}px`).toBeGreaterThanOrEqual(
        -1,
      );
      expect(bounds.right, `${name} title right edge at ${viewport.width}px`).toBeLessThanOrEqual(
        viewport.width + 1,
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        `${name} document width at ${viewport.width}px`,
      ).toBeLessThanOrEqual(viewport.width);
    }
    expect(new Set(titleSizes).size, `title scale should match at ${viewport.width}px`).toBe(1);
  }
});
