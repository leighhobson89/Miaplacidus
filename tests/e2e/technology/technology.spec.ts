import { expect, test } from "../_harness/fixtures";
import { startEconomyFixture } from "../_harness/economyFixtures";
import { waitForTechnologyTreeLayout } from "../_harness/technologyTree";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { type Page } from "@playwright/test";
import { economyLabel } from "../../../src/i18n/economyMessages";

async function expandResearchProduction(page: Page): Promise<void> {
  await page.locator("#tab-research-science-buildings").click();
  await expect(
    page.locator("#panel-research-science-buildings .research-production-section"),
  ).toBeVisible();
}

test("technology research purchase is atomic while locked energy and compounds tabs stay omitted @research @technology", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "research");
  await page.getByRole("tab", { name: /Research/ }).click();
  await expect(page.locator("#panel-research-science-buildings")).toBeVisible();
  await expect(page.locator("#panel-research-tech-tree")).toBeHidden();
  await page.locator("#tab-research-tech-tree").click();
  await expect(page.locator("#panel-research-tech-tree")).toBeVisible();
  await expect(page.locator("#panel-research-science-buildings")).toBeHidden();
  await expect(page.getByTestId("technology-tree-viewport")).toBeVisible();
  await expect(page.getByTestId("research-points")).toHaveText("150");
  await expect(page.getByTestId("research-rate")).toHaveText("0.5");
  await expect(page.getByTestId("economy-research")).toContainText("0.5 RP/s");
  await waitForTechnologyTreeLayout(page);
  await captureVisualCheckpoint(page, testInfo, "economy-research-ready");
  const knowledgeSharing = page.locator('[data-technology-id="knowledgeSharing"]');
  await knowledgeSharing.click();
  await expect(knowledgeSharing).toHaveAttribute(
    "aria-label",
    /^RESEARCHED:/i,
  );
  await expect(page.getByTestId("game-notification").last()).toContainText(
    "Knowledge Sharing Researched",
  );
  await expect(page.getByTestId("research-points")).toHaveText("0");
  await waitForTechnologyTreeLayout(page);
  await captureVisualCheckpoint(page, testInfo, "economy-research-unlocked");
  await expandResearchProduction(page);
  const researchAutomation = page.getByLabel(economyLabel("en", "researchAutobuyer"));
  await expect(researchAutomation).toBeEnabled();
  await researchAutomation.check();
  await expect(researchAutomation).toBeChecked();
  await researchAutomation.uncheck();
  await expect(researchAutomation).not.toBeChecked();
  await expect(page.getByRole("tab", { name: /Energy/ })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: /Compounds/ })).toHaveCount(0);
});

test("Tech Tree reveals affordable prerequisite-locked research and hides unaffordable nodes @research @technology @presentation", async ({
  page,
}) => {
  await startEconomyFixture(page, "research");
  await page.getByRole("tab", { name: /^Research/ }).click();
  await page.locator("#tab-research-tech-tree").click();
  const research = page.locator("#pane-research");
  await expect(research.locator("[role='tablist'] [role='tab']")).toHaveCount(2);
  await expect(research.getByRole("tab", { name: /^Research/ })).toBeVisible();
  await expect(research.getByRole("tab", { name: /^Tech Tree/ })).toBeVisible();
  const knowledgeSharing = page.locator('[data-technology-id="knowledgeSharing"]');
  const fusionTheory = page.locator('[data-technology-id="fusionTheory"]');
  await expect(knowledgeSharing).toBeVisible();
  await expect(fusionTheory).toHaveCount(0);

  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_200_000));
  await expect(page.getByTestId("research-points")).toHaveText("750");
  await expect(fusionTheory).toBeVisible();
  await expect(fusionTheory).toHaveAttribute("aria-disabled", "true");
  const fusionTooltip = fusionTheory.locator(".technology-map-tooltip");
  await expect(fusionTooltip).toContainText("Fusion Theory");
  await expect(fusionTooltip).toContainText("Research points: 750");
  await expect(fusionTooltip).toContainText("Knowledge Sharing");

  await knowledgeSharing.click();
  await expect(page.getByTestId("game-notification").last()).toContainText(
    "Knowledge Sharing Researched",
  );
  await expect(fusionTheory).toBeVisible();
  await expect(fusionTheory).toHaveAttribute("aria-disabled", "true");
});

test("Tech Tree zoom keeps the wide graph inside a two-axis scroll viewport @research @technology @presentation", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "full");
  await page.getByRole("tab", { name: /^Research/ }).click();
  await page.locator("#tab-research-tech-tree").click();
  const viewport = page.getByTestId("technology-tree-viewport");
  const panHelp = page.locator("#technology-tree-pan-help");
  await expect(panHelp).toContainText("arrow keys or Page Up/Down to pan");
  await expect(viewport).toHaveAttribute("aria-describedby", "technology-tree-pan-help");
  const advancedPower = page.locator('[data-technology-id="advancedPowerGeneration"]');
  const advancedPowerEdges = page.locator(
    '.technology-map-edge[data-prerequisite-to="advancedPowerGeneration"]',
  );
  const edgeSources = await advancedPowerEdges.evaluateAll((edges) =>
    edges
      .map((edge) => edge.getAttribute("data-prerequisite-from"))
      .filter((source): source is string => source !== null)
      .sort(),
  );
  expect(edgeSources).toEqual(["basicPowerGeneration", "giganticTurbines"]);
  await advancedPower.scrollIntoViewIfNeeded();
  await captureVisualCheckpoint(page, testInfo, "technology-tree-dependency-edges");
  await advancedPower.focus();
  await expect
    .poll(() =>
      advancedPowerEdges.evaluateAll((edges) =>
        edges.every((edge) => edge.classList.contains("is-related")),
      ),
    )
    .toBe(true);
  const unrelatedEdges = page.locator(".technology-map-edge.is-muted");
  await expect.poll(() => unrelatedEdges.count()).toBeGreaterThan(0);
  await page.mouse.move(0, 0);
  await expect
    .poll(() =>
      advancedPowerEdges.evaluateAll((edges) =>
        edges.every((edge) => edge.classList.contains("is-related")),
      ),
    )
    .toBe(true);
  await advancedPower.blur();
  await expect(
    page.locator(".technology-map-edge.is-related, .technology-map-edge.is-muted"),
  ).toHaveCount(0);
  await advancedPower.hover();
  await expect
    .poll(() =>
      advancedPowerEdges.evaluateAll((edges) =>
        edges.every((edge) => edge.classList.contains("is-related")),
      ),
    )
    .toBe(true);
  await page.mouse.move(0, 0);
  await expect(
    page.locator(".technology-map-edge.is-related, .technology-map-edge.is-muted"),
  ).toHaveCount(0);
  const initial = await viewport.evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
    overflowX: getComputedStyle(element).overflowX,
    overflowY: getComputedStyle(element).overflowY,
  }));
  expect(initial.overflowX).toBe("auto");
  expect(initial.overflowY).toBe("auto");
  expect(initial.scrollWidth).toBeGreaterThan(initial.clientWidth);
  expect(initial.scrollHeight).toBeLessThanOrEqual(initial.clientHeight);

  const zoom = page.getByRole("slider", { name: "Zoom" });
  await zoom.focus();
  await zoom.press("End");
  await expect(zoom).toHaveAttribute("aria-valuetext", "160%");
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollHeight > element.clientHeight))
    .toBe(true);
  await viewport.evaluate((element) => {
    element.scrollLeft = 0;
    element.scrollTop = 0;
  });
  await viewport.focus();
  await viewport.press("ArrowRight");
  await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await viewport.press("ArrowDown");
  await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
});
