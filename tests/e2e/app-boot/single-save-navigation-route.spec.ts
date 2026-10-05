import type { Locator, Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { resumeSavedPioneer, saveNowFromSettings } from "../_harness/save-controls";

async function tabUntilFocused(page: Page, target: Locator): Promise<void> {
  for (let index = 0; index < 120; index += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error("Keyboard traversal did not reach the expected control");
}

async function appSaveHeadKeys(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Object.keys(localStorage)
      .filter((key) => key.startsWith("miaplacidus:v1:head:"))
      .sort(),
  );
}

test("one saved pioneer reaches late-game pages by keyboard after the navigation checkpoint @app-boot @ui-navigation @progression @keyboard", async ({
  page,
}) => {
  const pioneer = "Single Save Navigation Pioneer";
  await page.addInitScript(() => {
    const clearedFlag = "miaplacidus:test:single-save-route-cleared";
    if (sessionStorage.getItem(clearedFlag) === "1") return;
    for (const storage of [localStorage, sessionStorage]) {
      const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
        (key): key is string => key?.startsWith("miaplacidus:v1:") ?? false,
      );
      for (const key of keys) storage.removeItem(key);
    }
    sessionStorage.setItem(clearedFlag, "1");
  });
  await page.goto("/?testSeed=20261005&testLocale=en");
  await page.getByLabel("Pioneer name").fill(pioneer);
  await page.getByTestId("start-game").click();
  await expect(page.locator(".run-name")).toHaveText(pioneer);

  const collectHydrogen = page.getByRole("button", { name: "Collect 1 Hydrogen", exact: true });
  await collectHydrogen.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("1");

  await page.locator("#tab-research").click();
  await page.locator("#tab-research-science-buildings").click();
  const scienceKit = page.locator('[data-building-id="scienceKit"]');
  await scienceKit.getByRole("button", { name: "Buy", exact: true }).click();
  await expect(scienceKit).toContainText("Owned: 1");

  await page.locator("#tab-hydrogen").click();
  for (let count = 1; count < 50; count += 1) await collectHydrogen.click();
  await page.getByRole("button", { name: "Buy compressor", exact: true }).click();
  await expect(page.getByTestId("hydrogen-autobuyer-count")).toHaveText("1");
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(200_000));
  await expect(page.getByTestId("research-balance")).toHaveText("150");

  await page.locator("#tab-research").click();
  await page.locator("#tab-research-tech-tree").click();
  const knowledgeSharing = page.locator('[data-technology-id="knowledgeSharing"]');
  await expect(knowledgeSharing).toBeEnabled();
  await knowledgeSharing.click();
  await expect(knowledgeSharing).toContainText("Researched");

  const firstSaveHead = await appSaveHeadKeys(page);
  expect(firstSaveHead).toHaveLength(1);
  await saveNowFromSettings(page);
  await page.reload();
  await resumeSavedPioneer(page, pioneer);
  await expect(page.locator(".run-name")).toHaveText(pioneer);
  expect(await appSaveHeadKeys(page)).toEqual(firstSaveHead);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest?.getState().run.upgrades.scienceKit))
    .toBe(1);

  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.evaluate(() => {
    window.miaplacidusTest!.runScenario("late-game-navigation");
  });
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest?.getState().permanent.cosmicRip.ripFound),
    )
    .toBe(true);
  await expect(page.locator(".run-name")).toHaveText(pioneer);

  await saveNowFromSettings(page);
  await page.reload();
  await resumeSavedPioneer(page, pioneer);
  await expect(page.locator(".run-name")).toHaveText(pioneer);
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest?.getState().permanent.cosmicRip.ripFound),
    )
    .toBe(true);
  expect(await appSaveHeadKeys(page)).toEqual(firstSaveHead);

  const mainTabs = page.locator(".game-nav [role='tab']");
  const mainTabIds = await mainTabs.evaluateAll((tabs) =>
    tabs.map((tab) => tab.getAttribute("aria-controls")?.replace(/^pane-/, "")),
  );
  expect(mainTabIds).toEqual([
    "hydrogen",
    "energy",
    "research",
    "compounds",
    "interstellar",
    "space-mining",
    "galaxy",
    "cosmic-rip",
    "settings",
    "miaplaedia",
  ]);

  const hydrogenTab = page.locator("#tab-hydrogen");
  await hydrogenTab.focus();
  for (const id of ["energy", "research", "compounds", "interstellar"]) {
    await page.keyboard.press("ArrowRight");
    const tab = page.locator(`#tab-${id}`);
    await expect(tab).toBeFocused();
    await expect(tab).toHaveAttribute("aria-selected", "true");
  }
  const interstellarChildIds = await page
    .locator("#pane-interstellar .pane-nav-tab[role='tab']")
    .evaluateAll((tabs) => tabs.map((tab) => tab.id));
  expect(interstellarChildIds).toEqual([
    "tab-interstellar-star-map",
    "tab-interstellar-star-data",
    "tab-interstellar-starship",
    "tab-interstellar-fleet-hangar",
  ]);

  await page.keyboard.press("ArrowRight");
  const spaceMiningTab = page.locator("#tab-space-mining");
  await expect(spaceMiningTab).toBeFocused();
  await expect(spaceMiningTab).toHaveAttribute("aria-selected", "true");
  const spaceMiningChildIds = await page
    .locator("#pane-space-mining .pane-nav-tab[role='tab']")
    .evaluateAll((tabs) => tabs.map((tab) => tab.id));
  expect(spaceMiningChildIds).toEqual([
    "tab-space-mining-mining",
    "tab-space-mining-telescope",
    "tab-space-mining-launch-pad",
  ]);
  for (const rocketId of ["rocket-1", "rocket-2", "rocket-3", "rocket-4"])
    await expect(page.locator(`#tab-space-mining-${rocketId}`)).toHaveCount(0);
  await page.keyboard.press("ArrowRight");
  const galacticTab = page.locator("#tab-galaxy");
  await expect(galacticTab).toBeFocused();
  await expect(galacticTab).toHaveAttribute("aria-selected", "true");
  const galacticChildIds = await page
    .locator("#pane-galaxy .pane-nav-tab[role='tab']")
    .evaluateAll((tabs) => tabs.map((tab) => tab.id));
  expect(galacticChildIds).toEqual([
    "tab-galactic-rebirth",
    "tab-galactic-market",
    "tab-galactic-casino",
    "tab-galactic-ascendency-perks",
    "tab-galactic-megastructures",
  ]);
  await expect(page.locator(".game-nav #tab-galactic-casino")).toHaveCount(0);

  const galacticRebirth = page.locator("#tab-galactic-rebirth");
  await galacticRebirth.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  const casinoTab = page.locator("#tab-galactic-casino");
  await expect(casinoTab).toBeFocused();
  await expect(casinoTab).toHaveAttribute("aria-selected", "true");

  const casino = page.getByTestId("galactic-casino-pane");
  const payment = casino.getByLabel("Pay with");
  await tabUntilFocused(page, payment);
  const amount = casino.getByLabel("Points to buy");
  await page.keyboard.press("Tab");
  await expect(amount).toBeFocused();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText("20");
  await page.keyboard.press("Tab");
  const buyPoints = casino.getByTestId("casino-buy-cp");
  await expect(buyPoints).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(casino.getByTestId("casino-balance")).toHaveText("20 CP");

  await galacticTab.focus();
  await page.keyboard.press("ArrowRight");
  const cosmicRipTab = page.locator("#tab-cosmic-rip");
  await expect(cosmicRipTab).toBeFocused();
  await expect(cosmicRipTab).toHaveAttribute("aria-selected", "true");
  const cosmicRipChildIds = await page
    .locator("#pane-cosmic-rip .pane-nav-tab[role='tab']")
    .evaluateAll((tabs) => tabs.map((tab) => tab.id));
  expect(cosmicRipChildIds).toEqual([
    "tab-cosmic-rip-situation",
    "tab-cosmic-rip-scanner-array",
    "tab-cosmic-rip-rip",
  ]);
  const situationTab = page.locator("#tab-cosmic-rip-situation");
  await situationTab.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  const ripTab = page.locator("#tab-cosmic-rip-rip");
  await expect(ripTab).toBeFocused();
  await expect(ripTab).toHaveAttribute("aria-selected", "true");

  const sensorBuoy = page.locator(".cosmic-rip-upgrade").filter({ hasText: "Sensor Buoy" });
  const purchaseBuoy = sensorBuoy.getByRole("button", { name: "Purchase" });
  await tabUntilFocused(page, purchaseBuoy);
  await page.keyboard.press("Enter");
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.cosmicRip.sensorBuoyCount),
    )
    .toBe(1);
  await expect(page.locator(".run-name")).toHaveText(pioneer);
});
