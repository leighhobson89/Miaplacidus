import { devices } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

test.use({ ...devices["Pixel 7"] });

test("keeps Gases and Solids grouped in the source order @ui-navigation @resources", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-megastructure-route");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => navigator.maxTouchPoints)).toBeGreaterThan(0);

  const rail = page.getByRole("complementary", { name: "Resources" });
  const gasesToggle = rail.getByTestId("resource-group-toggle-gases");
  const solidsToggle = rail.getByTestId("resource-group-toggle-solids");
  await expect(gasesToggle).toContainText("Gases");
  await expect(solidsToggle).toContainText("Solids");
  await expect(gasesToggle).toHaveAttribute("aria-expanded", "true");
  await expect(solidsToggle).toHaveAttribute("aria-expanded", "true");

  const resourceTablist = page.getByRole("navigation", { name: "Pages in this section" });
  await expect
    .poll(() => resourceTablist.getByRole("tab").evaluateAll((tabs) => tabs.map((tab) => tab.id)))
    .toEqual([
      "tab-resources-hydrogen",
      "tab-resources-helium",
      "tab-resources-neon",
      "tab-resources-oxygen",
      "tab-resources-carbon",
      "tab-resources-silicon",
      "tab-resources-sodium",
      "tab-resources-iron",
    ]);
  await captureVisualCheckpoint(page, testInfo, "resource-groups-mobile");

  await solidsToggle.tap();
  await expect(solidsToggle).toHaveAttribute("aria-expanded", "false");
  await expect(rail.getByTestId("resource-rail-carbon")).toBeHidden();
  await resourceTablist.getByRole("tab", { name: "Carbon" }).tap();
  await expect(page.locator("#panel-resources-carbon")).toBeVisible();
  await expect(rail.getByTestId("resource-rail-carbon")).toBeHidden();

  await gasesToggle.tap();
  await expect(gasesToggle).toHaveAttribute("aria-expanded", "false");
  await expect(rail.getByTestId("resource-rail-hydrogen")).toBeHidden();
  await expect(page.locator("#panel-resources-carbon")).toBeVisible();
  const documentWidth = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(documentWidth.page).toBeLessThanOrEqual(documentWidth.viewport);

  await expect
    .poll(async () =>
      page.evaluate(() => {
        const entry = Object.entries(localStorage).find(
          ([key]) =>
            key.startsWith("miaplacidus:v1:ui:collapsed-pane-groups:") &&
            key.endsWith(":resource-rail"),
        );
        return entry ? JSON.parse(entry[1]) : [];
      }),
    )
    .toEqual(["solids", "gases"]);
  await page.reload();
  await expect(page.getByTestId("start-game")).toHaveText("RESUME GAME Ascendency Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.getByTestId("resource-group-toggle-gases")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(page.getByTestId("resource-group-toggle-solids")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test("only shows the Gases section before a solid resource is unlocked @ui-navigation @resources", async ({
  freshGame,
}) => {
  await freshGame.setViewportSize({ width: 390, height: 844 });
  const rail = freshGame.getByRole("complementary", { name: "Resources" });
  await expect(rail.getByTestId("resource-group-toggle-gases")).toBeVisible();
  await expect(rail.getByTestId("resource-group-toggle-solids")).toHaveCount(0);
  await expect(freshGame.getByTestId("resource-rail-hydrogen")).toBeVisible();
  const documentWidth = await freshGame.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(documentWidth.page).toBeLessThanOrEqual(documentWidth.viewport);
});
