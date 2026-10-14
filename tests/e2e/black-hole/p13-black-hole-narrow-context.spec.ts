import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { displayCurrency } from "../../../src/engine/precision";
import { blackHoleText } from "../../../src/i18n/blackHoleMessages";

test("Black Hole charge context stays visible at 390px and 320px @p13-black-hole-narrow-context", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-black-hole-discovered");
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });
  await page.locator("#tab-galaxy").click();
  const blackHoleTab = page.locator("#tab-galactic-black-hole");
  await blackHoleTab.click();

  const copy = blackHoleText("en");
  const pane = page.locator(".black-hole-pane");
  const research = page.getByTestId("black-hole-research");
  const stateBeforeResearch = await page.evaluate(() => window.miaplacidusTest!.getState());
  const initialResearchPoints = stateBeforeResearch.run.researchPoints;
  const researchPrice = stateBeforeResearch.permanent.blackHole.researchPrice;
  await research.locator(".space-action-help-group > .primary-button").click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(30_000));

  const stateDuringCharge = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(stateDuringCharge.run.researchPoints).toBe(initialResearchPoints - researchPrice);
  expect(stateDuringCharge.run.timers["black-hole:charge"]).toMatchObject({
    status: "running",
    elapsedMs: 30_000,
  });

  const researchBalance = page.getByTestId("research-balance");
  const cashBalance = page.getByTestId("cash-balance");
  const chargeProgress = page.getByRole("progressbar", { name: copy.charging, exact: true });
  const stats = pane.locator(".black-hole-stats");
  const status = stats.locator("div").filter({ has: page.getByText(copy.status, { exact: true }) });
  const activation = pane.getByRole("button", { name: copy.charging, exact: true });
  const activationReason = page.locator("#black-hole-activate-reason");
  const upgradeButtons = pane.locator(".black-hole-upgrades button");
  const remainingSeconds =
    (stateDuringCharge.run.timers["black-hole:charge"]!.durationMs -
      stateDuringCharge.run.timers["black-hole:charge"]!.elapsedMs) /
    1000;
  const expectedCash = formatCurrency(
    "en",
    Number(displayCurrency(stateDuringCharge.run.cash)),
    stateDuringCharge.settings.currencyId ?? "usd",
    2,
    stateDuringCharge.settings.notation,
  );
  const upgradePrices = [
    stateDuringCharge.permanent.blackHole.powerPrice,
    stateDuringCharge.permanent.blackHole.durationPrice,
    stateDuringCharge.permanent.blackHole.rechargePrice,
  ];

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(blackHoleTab).toHaveAttribute("aria-selected", "true");
    await expect(pane).toBeVisible();
    await expect(researchBalance).toBeVisible();
    await expect(researchBalance).toHaveText(
      formatNumber(
        "en",
        stateDuringCharge.run.researchPoints,
        0,
        stateDuringCharge.settings.notation,
      ),
    );
    await expect(cashBalance).toBeVisible();
    await expect(cashBalance).toHaveText(expectedCash);
    await expect(chargeProgress).toBeVisible();
    await expect(chargeProgress).toHaveAttribute("max", "100");
    expect(
      await chargeProgress.evaluate((element) => (element as HTMLProgressElement).value),
    ).toBeGreaterThan(0);
    await expect(status.locator("dd")).toHaveText(
      `${copy.charging} · ${formatNumber("en", remainingSeconds, 1, stateDuringCharge.settings.notation)} s`,
    );
    await expect(upgradeButtons).toHaveCount(3);
    for (let index = 0; index < upgradePrices.length; index += 1) {
      const button = upgradeButtons.nth(index);
      await expect(button).toBeVisible();
      await expect(button).toContainText(
        `${formatNumber("en", upgradePrices[index]!, 0, stateDuringCharge.settings.notation)} ${copy.researchPoints}`,
      );
    }
    await expect(activation).toBeVisible();
    await expect(activation).toBeDisabled();
    await expect(activation).toHaveAttribute("aria-describedby", "black-hole-activate-reason");
    await expect(activationReason).toBeVisible();
    await expect(activationReason).toHaveText(copy.errors["black-hole-charge-running"]);

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
          ["Black Hole pane", rect(".black-hole-pane")],
          ["Research Point balance", rect('[data-testid="top-stat-rp"]')],
          ["Cash balance", rect('[data-testid="top-stat-cash"]')],
          ["Charge progress", rect(".black-hole-charge-progress")],
          ["Upgrade actions", rect(".black-hole-upgrades")],
          ["Charge action", rect("#black-hole-activate-reason")],
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
      viewport.width === 390 ? "p13-black-hole-charge-390" : "p13-black-hole-charge-320",
    );
  }
});
