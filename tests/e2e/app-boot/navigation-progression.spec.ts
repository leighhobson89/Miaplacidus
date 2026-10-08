import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

async function startFixture(
  page: import("@playwright/test").Page,
  fixture:
    | "full"
    | "space-telescope"
    | "space-telescope-before-launch-pad"
    | "meta-cosmic-rip-route",
  pioneer: string,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261003&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill(pioneer);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
}

async function expectTabSequence(
  page: import("@playwright/test").Page,
  tabs: readonly (readonly [string, string])[],
): Promise<void> {
  const visibleTabs = page.locator(".game-nav [role='tab']");
  await expect(visibleTabs).toHaveCount(tabs.length);
  const tabIds = await visibleTabs.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("aria-controls")),
  );
  expect(tabIds).toEqual(tabs.map(([, id]) => `pane-${id}`));
  const resourceRail = page.getByRole("complementary", { name: "Resources" });

  for (const [label, id] of tabs) {
    const tab = page.locator(`#tab-${id}`);
    await expect(tab.locator(":scope > span:first-child")).toHaveText(label);
    await tab.click();
    await expect(page.locator(`#pane-${id}`)).toBeVisible();
    if (id === "hydrogen") await expect(resourceRail).toBeVisible();
    else await expect(resourceRail).toBeHidden();
  }
}

async function expectSelectedChildPanelAssociation(
  page: import("@playwright/test").Page,
  parentPaneId: string,
): Promise<void> {
  const tabs = page.locator(`#pane-${parentPaneId} .pane-nav-tab[role='tab']`);
  for (const tab of await tabs.all()) {
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    const tabId = await tab.getAttribute("id");
    const panelId = await tab.getAttribute("aria-controls");
    expect(tabId).toBeTruthy();
    expect(panelId).toBeTruthy();
    const panel = page.locator(`#${panelId}`);
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("role", "tabpanel");
    await expect(panel).toHaveAttribute("aria-labelledby", tabId!);
  }
}

test("keyboard focus stays with the selected main and child destination @app-boot @keyboard @ui-navigation", async ({
  page,
}, testInfo) => {
  await startFixture(page, "full", "Keyboard Navigation Pioneer");

  const resourcesTab = page.locator("#tab-hydrogen");
  const miaplaediaTab = page.locator("#tab-miaplaedia");
  await resourcesTab.focus();
  await resourcesTab.press("End");
  await expect(miaplaediaTab).toHaveAttribute("aria-selected", "true");
  await expect
    .poll(() => page.evaluate(() => (document.activeElement as HTMLElement | null)?.id))
    .toBe("tab-miaplaedia");

  await miaplaediaTab.press("ArrowRight");
  await expect(resourcesTab).toHaveAttribute("aria-selected", "true");
  await expect
    .poll(() => page.evaluate(() => (document.activeElement as HTMLElement | null)?.id))
    .toBe("tab-hydrogen");

  const resourceHydrogenTab = page.locator("#tab-resources-hydrogen");
  await resourceHydrogenTab.focus();
  await resourceHydrogenTab.press("ArrowRight");
  const resourceHeliumTab = page.locator("#tab-resources-helium");
  await expect(resourceHeliumTab).toHaveAttribute("aria-selected", "true");
  await expect
    .poll(() => page.evaluate(() => (document.activeElement as HTMLElement | null)?.id))
    .toBe("tab-resources-helium");

  const resourceIronTab = page.locator("#tab-resources-iron");
  await resourceHeliumTab.press("End");
  await expect(resourceIronTab).toHaveAttribute("aria-selected", "true");
  await expect
    .poll(() => page.evaluate(() => (document.activeElement as HTMLElement | null)?.id))
    .toBe("tab-resources-iron");
  await expect(page.locator("#panel-resources-iron")).toBeVisible();
  await captureVisualCheckpoint(page, testInfo, "navigation-keyboard-resource-children");
});

test("progressive unlock states keep main tabs in source order @app-boot @ui-navigation @progression", async ({
  page,
}, testInfo) => {
  await startFixture(page, "space-telescope", "Space Navigation Pioneer");
  const technologyUnlockedTabs = [
    ["Resources", "hydrogen"],
    ["Compounds", "compounds"],
    ["Research", "research"],
    ["Energy", "energy"],
    ["Space Mining", "space-mining"],
    ["Interstellar", "interstellar"],
    ["Settings", "settings"],
    ["Miaplaedia", "miaplaedia"],
  ] as const;
  await expectTabSequence(page, technologyUnlockedTabs);
  const spaceMining = page.locator("#pane-space-mining");
  await expect(spaceMining.locator("#tab-space-mining-launch-pad")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  for (const rocket of [1, 2, 3, 4])
    await expect(spaceMining.locator(`#tab-space-mining-rocket-${rocket}`)).toHaveCount(0);
  await captureVisualCheckpoint(page, testInfo, "navigation-technology-unlocks");

  await page.setViewportSize({ width: 390, height: 844 });
  for (const [, id] of technologyUnlockedTabs) {
    await page.locator(`#tab-${id}`).click();
    await expect(page.locator(`#pane-${id}`)).toBeVisible();
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(documentWidth, `${id} caused horizontal page overflow at 390px`).toBeLessThanOrEqual(
      390,
    );
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  const unlockedAllTabs = await page.evaluate(() =>
    window.miaplacidusTest?.applyDebugAction("unlock-all-tabs"),
  );
  expect(unlockedAllTabs).toBe(true);
  const allTabsUnlocked = [
    ["Resources", "hydrogen"],
    ["Compounds", "compounds"],
    ["Research", "research"],
    ["Energy", "energy"],
    ["Space Mining", "space-mining"],
    ["Interstellar", "interstellar"],
    ["Galactic", "galaxy"],
    ["Cosmic Rip", "cosmic-rip"],
    ["Settings", "settings"],
    ["Miaplaedia", "miaplaedia"],
  ] as const;
  await expectTabSequence(page, allTabsUnlocked);
  await page.locator("#tab-hydrogen").click();
  await captureVisualCheckpoint(page, testInfo, "navigation-all-tabs-source-order-1280");
  await page.setViewportSize({ width: 390, height: 844 });
  const fullOrderAtPhoneWidth = await page
    .locator(".game-nav [role='tab']")
    .evaluateAll((tabs) =>
      tabs.map((tab) => tab.getAttribute("aria-controls")?.replace("pane-", "")),
    );
  expect(fullOrderAtPhoneWidth).toEqual(allTabsUnlocked.map(([, id]) => id));
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await captureVisualCheckpoint(page, testInfo, "navigation-all-tabs-source-order-390");

  await startFixture(page, "space-telescope-before-launch-pad", "Telescope First Pioneer");
  await page.locator("#tab-space-mining").click();
  const telescopeOnlySpaceMining = page.locator("#pane-space-mining");
  await expect(telescopeOnlySpaceMining).toBeVisible();
  await expect(telescopeOnlySpaceMining.locator("#tab-space-mining-telescope")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(telescopeOnlySpaceMining.locator("#tab-space-mining-launch-pad")).toHaveCount(0);

  await page.setViewportSize({ width: 1280, height: 900 });
  await startFixture(page, "meta-cosmic-rip-route", "Meta Navigation Pioneer");
  const metaUnlockedTabs = [
    ["Resources", "hydrogen"],
    ["Compounds", "compounds"],
    ["Research", "research"],
    ["Galactic", "galaxy"],
    ["Cosmic Rip", "cosmic-rip"],
    ["Settings", "settings"],
    ["Miaplaedia", "miaplaedia"],
  ] as const;
  await expectTabSequence(page, metaUnlockedTabs);
  await captureVisualCheckpoint(page, testInfo, "navigation-meta-unlocks");

  await page.setViewportSize({ width: 390, height: 844 });
  for (const [, id] of metaUnlockedTabs) {
    await page.locator(`#tab-${id}`).click();
    await expect(page.locator(`#pane-${id}`)).toBeVisible();
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(documentWidth, `${id} caused horizontal page overflow at 390px`).toBeLessThanOrEqual(
      390,
    );
  }
  await page.locator("#tab-galaxy").click();
  const galacticPane = page.locator("#pane-galaxy");
  await galacticPane.locator("#tab-galactic-casino").click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.locator("#tab-cosmic-rip").click();
  await page.locator("#tab-cosmic-rip-rip").click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("Energy, Space Mining, Galactic and Miaplaedia child tabs target their selected page @ui-navigation", async ({
  page,
}) => {
  await startFixture(page, "space-telescope", "Page Association Pioneer");

  await page.locator("#tab-energy").click();
  await expectSelectedChildPanelAssociation(page, "energy");

  await page.locator("#tab-space-mining").click();
  await expectSelectedChildPanelAssociation(page, "space-mining");

  await page.locator("#tab-miaplaedia").click();
  await expectSelectedChildPanelAssociation(page, "miaplaedia");

  await startFixture(page, "meta-cosmic-rip-route", "Meta Page Association Pioneer");
  await page.locator("#tab-galaxy").click();
  await expectSelectedChildPanelAssociation(page, "galaxy");
});

test("renders Compounds sections and source option identities in menu order @app-boot @ui-navigation", async ({
  page,
}) => {
  await startFixture(page, "space-telescope", "Compound Navigation Pioneer");
  const resourceRail = page.getByRole("complementary", { name: "Resources" });
  await expect(resourceRail).toBeVisible();
  await page.locator("#tab-compounds").click();
  await expect(page.locator("#pane-compounds")).toBeVisible();
  await expect(resourceRail).toBeHidden();

  const navigation = page.getByRole("navigation", { name: "Pages in this section" });
  await expect(navigation.locator(".pane-nav-group-heading > span:first-child")).toHaveText([
    "Liquids",
    "Solids",
  ]);
  const destinations = await navigation
    .getByRole("tab")
    .evaluateAll((tabs) => tabs.map((tab) => [tab.id, tab.getAttribute("data-source-option-id")]));
  expect(destinations).toEqual([
    ["tab-compounds-diesel", "option1"],
    ["tab-compounds-water", "option5"],
    ["tab-compounds-glass", "option2"],
    ["tab-compounds-concrete", "option4"],
    ["tab-compounds-steel", "option3"],
    ["tab-compounds-titanium", "option6"],
  ]);
  await page.locator("#tab-hydrogen").click();
  await expect(resourceRail).toBeVisible();
});
