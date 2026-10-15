import { expect, test } from "../_harness/fixtures";
import { startEconomyFixture } from "../_harness/economyFixtures";
import { MEGASTRUCTURE_TECHNOLOGY_IDS, TECHNOLOGY_CATALOG } from "../../../src/content/technology";
import { LOCALE_IDS } from "../../../src/content/ids";
import { TECHNOLOGY_DESCRIPTIONS } from "../../../src/content/technologyDescriptions";
import { technologySummary } from "../../../src/content/technologySummaries";
import { TECHNOLOGY_NAMES } from "../../../src/content/technologyNames";
import { economyLabel } from "../../../src/i18n/economyMessages";

const megastructureTechnologyIds = new Set<string>(MEGASTRUCTURE_TECHNOLOGY_IDS);
const standardTechnologies = TECHNOLOGY_CATALOG.filter(
  (technology) => !megastructureTechnologyIds.has(technology.id),
);

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

async function clearSavedGame(page: import("@playwright/test").Page): Promise<void> {
  await page.evaluate(() => {
    const appKeys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith("miaplacidus:v1:") ?? false);
    for (const key of appKeys) localStorage.removeItem(key);
    sessionStorage.removeItem("miaplacidus:test:economy-storage-cleared");
  });
}

test("standard Tech Tree node names and descriptions render in all six locales @p7-locale @research @technology", async ({
  page,
}) => {
  test.setTimeout(120_000);

  for (const [index, locale] of LOCALE_IDS.entries()) {
    if (index > 0) await clearSavedGame(page);
    await startEconomyFixture(page, "research", locale);
    await page.locator("#tab-research").click();
    await page.locator("#tab-research-tech-tree").click();
    expect(
      await page.evaluate(() => window.miaplacidusTest!.applyDebugAction("grant-all-techs")),
    ).toBe(true);

    const tree = page.getByTestId("technology-tree");
    await expect(tree).toBeVisible();
    const treeHelp = economyLabel(locale, "technologyTreePanHelp");
    expect(treeHelp.trim(), `${locale} combined Technology and Tech Tree help`).not.toBe("");
    await expect(page.locator("#technology-tree-pan-help")).toHaveText(treeHelp);
    await expect(tree.locator("[data-technology-id]")).toHaveCount(standardTechnologies.length);

    for (const technology of standardTechnologies) {
      const name = TECHNOLOGY_NAMES[technology.id][locale];
      const summary = technologySummary(locale, technology.id);
      const description = TECHNOLOGY_DESCRIPTIONS[technology.id][locale];
      expect(name.trim(), `${locale} ${technology.id} name`).not.toBe("");
      expect(summary.trim(), `${locale} ${technology.id} source summary`).not.toBe("");
      expect(description.trim(), `${locale} ${technology.id} description`).not.toBe("");

      const node = tree.locator(`[data-technology-id="${technology.id}"]`);
      await expect(node).toBeVisible();
      await expect(node.locator(".technology-map-node-heading strong")).toHaveText(name);
      await expect(node.locator(".technology-map-tooltip-summary")).toHaveText(summary);
      const renderedDescription = await node
        .locator(".technology-map-tooltip-description")
        .evaluate((element) => element.textContent ?? "");
      expect(normalizeText(renderedDescription), `${locale} ${technology.id} tooltip`).toBe(
        normalizeText(description.replace(/\s*\/\s*\/\s*/g, "\n")),
      );
    }
  }
});
