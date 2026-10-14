import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { TECHNOLOGY_BY_ID, MEGASTRUCTURE_TRACKS } from "../../../src/content/technology";
import { displayCurrency } from "../../../src/engine/precision";
import {
  megastructureStageProgress,
  megastructureText,
} from "../../../src/i18n/megastructureMessages";
import { TECHNOLOGY_NAMES } from "../../../src/content/technologyNames";

const NARROW_VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

function cashText(state: Awaited<ReturnType<typeof readState>>): string {
  return formatCurrency(
    "en",
    Number(displayCurrency(state.run.cash)),
    state.settings.currencyId ?? "usd",
    2,
    state.settings.notation,
  );
}

async function readState(page: import("@playwright/test").Page) {
  return page.evaluate(() => window.miaplacidusTest!.getState());
}

test("Megastructure stage cost, RP balance, action, and progress fit at narrow widths @p13-megastructure-context", async ({
  page,
}, testInfo) => {
  await page.setViewportSize(NARROW_VIEWPORTS[0]);
  await startMetaFixture(page, "meta-megastructure-route");
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-megastructures").click();

  const before = await readState(page);
  const trackId = "galacticMemoryArchive" as const;
  const stages = MEGASTRUCTURE_TRACKS[trackId];
  const nextTechnologyId = stages[2]!;
  const nextStagePrice = TECHNOLOGY_BY_ID[nextTechnologyId].price;
  const copy = megastructureText("en");
  const pane = page.getByTestId("megastructure-pane");
  const archive = page.getByTestId(`megastructure-track-${trackId}`);
  const researchButton = archive.getByRole("button", { name: copy.researchAction, exact: true });
  const expectedPrice = copy.researchCost.replace(
    "{cost}",
    formatNumber("en", nextStagePrice, 0, before.settings.notation),
  );
  const expectedResearchBalance = formatNumber(
    "en",
    before.run.researchPoints,
    0,
    before.settings.notation,
  );

  expect(before.run.researchPoints).toBeGreaterThanOrEqual(nextStagePrice);
  expect(before.permanent.megastructures.researchedTechnologyIds).toContain(stages[0]);
  expect(before.permanent.megastructures.researchedTechnologyIds).toContain(stages[1]);
  await expect(archive.getByTestId("megastructure-next-stage")).toContainText(
    TECHNOLOGY_NAMES[nextTechnologyId].en,
  );
  await expect(archive.getByTestId("megastructure-next-stage")).toContainText(expectedPrice);
  await expect(archive).toContainText(
    megastructureStageProgress("en", 2, stages.length, (value) =>
      formatNumber("en", value, 0, before.settings.notation),
    ),
  );
  await expect(researchButton).toBeEnabled();

  for (const viewport of NARROW_VIEWPORTS) {
    await page.setViewportSize(viewport);
    await expect(page.locator("#tab-galaxy")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#tab-galactic-megastructures")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(pane).toBeVisible();
    await expect(archive).toBeVisible();
    await expect(archive.getByTestId("megastructure-next-stage")).toContainText(expectedPrice);
    await expect(researchButton).toBeVisible();
    await expect(researchButton).toBeEnabled();
    await expect(page.getByTestId("research-balance")).toHaveText(expectedResearchBalance);
    await expect(page.getByTestId("cash-balance")).toHaveText(cashText(before));
    await expect(page.getByTestId("megastructure-force-field")).toBeVisible();

    const bounds = await page.evaluate(() => {
      const rect = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) throw new Error(`Expected visible narrow-context element: ${selector}`);
        const box = element.getBoundingClientRect();
        return { left: box.left, right: box.right };
      };
      return {
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        elements: [
          ["Megastructure pane", rect(".megastructure-pane")],
          ["Archive stage card", rect('[data-testid="megastructure-track-galacticMemoryArchive"]')],
          ["Next stage requirement", rect('[data-testid="megastructure-next-stage"]')],
          [
            "Research action",
            rect('[data-testid="megastructure-track-galacticMemoryArchive"] button'),
          ],
          ["Research Points balance", rect('[data-testid="top-stat-rp"]')],
          ["Cash balance", rect('[data-testid="top-stat-cash"]')],
        ] as const,
      };
    });
    expect(bounds.documentWidth, `${viewport.width}px document width`).toBeLessThanOrEqual(
      viewport.width,
    );
    for (const [name, rect] of bounds.elements) {
      expect(rect.left, `${viewport.width}px ${name} left edge`).toBeGreaterThanOrEqual(-1);
      expect(rect.right, `${viewport.width}px ${name} right edge`).toBeLessThanOrEqual(
        viewport.width + 1,
      );
    }
    await captureVisualCheckpoint(
      page,
      testInfo,
      `p13-megastructure-stage-ready-${viewport.width}`,
    );
  }

  const researchPointsBefore = before.run.researchPoints;
  const cashBefore = before.run.cash;
  await researchButton.click();
  const after = await readState(page);
  expect(after.permanent.megastructures.researchedTechnologyIds).toContain(nextTechnologyId);
  expect(after.run.researchPoints).toBe(researchPointsBefore - nextStagePrice);
  expect(after.run.cash).toBe(cashBefore);
  const resultDialog = page.getByTestId("random-event-result-dialog");
  await expect(resultDialog).toBeVisible();
  await expect(resultDialog).toContainText("DISCONNECTING THE GALACTIC MEMORY ARCHIVE");
  await resultDialog.getByRole("button", { name: copy.confirmLabel, exact: true }).click();
  await expect(resultDialog).toHaveCount(0);
  await expect(archive).toContainText(
    megastructureStageProgress("en", 3, stages.length, (value) =>
      formatNumber("en", value, 0, after.settings.notation),
    ),
  );
  await expect(page.getByTestId("megastructure-force-field")).toContainText("4/4");

  const nextResearchButton = archive.getByRole("button", {
    name: copy.researchAction,
    exact: true,
  });
  await expect(nextResearchButton).toBeDisabled();
  await expect(nextResearchButton).toHaveAttribute(
    "aria-describedby",
    `megastructure-research-reason-${trackId}`,
  );
  await expect(page.getByTestId(`megastructure-research-reason-${trackId}`)).toHaveText(
    copy.insufficientResearch
      .replace(
        "{required}",
        formatNumber("en", TECHNOLOGY_BY_ID[stages[3]!].price, 0, after.settings.notation),
      )
      .replace(
        "{shortfall}",
        formatNumber(
          "en",
          TECHNOLOGY_BY_ID[stages[3]!].price - after.run.researchPoints,
          0,
          after.settings.notation,
        ),
      ),
  );
  await expect(page.getByTestId("notification-stack")).toBeEmpty({ timeout: 5_000 });

  for (const viewport of NARROW_VIEWPORTS) {
    await page.setViewportSize(viewport);
    await expect(page.getByTestId("research-balance")).toHaveText(
      formatNumber("en", after.run.researchPoints, 0, after.settings.notation),
    );
    await expect(
      archive.getByRole("button", { name: copy.researchAction, exact: true }),
    ).toBeDisabled();
    await expect(page.getByTestId(`megastructure-research-reason-${trackId}`)).toBeVisible();
    await captureVisualCheckpoint(
      page,
      testInfo,
      `p13-megastructure-stage-progress-${viewport.width}`,
    );
  }
});
