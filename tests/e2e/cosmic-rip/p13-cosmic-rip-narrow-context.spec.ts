import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { COSMIC_RIP_TECHNOLOGIES } from "../../../src/content/cosmicRip";
import { displayCurrency } from "../../../src/engine/precision";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { formatCountdown } from "../../../src/app/timeFormatting";
import { cosmicRipText } from "../../../src/i18n/cosmicRipMessages";

const NARROW_VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

test("active Cosmic Rip research keeps RP, costs, action, and progress visible at narrow widths @p13-cosmic-rip-context", async ({
  page,
}, testInfo) => {
  await page.setViewportSize(NARROW_VIEWPORTS[0]);
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });

  await page.locator("#tab-cosmic-rip").click();
  const pane = page.getByTestId("cosmic-rip-pane");
  await page.locator("#tab-cosmic-rip-rip").click();

  const technology = COSMIC_RIP_TECHNOLOGIES[0];
  const copy = cosmicRipText("en");
  const card = page.getByTestId(`cosmic-rip-technology-${technology.id}`);
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  const initialTelemetry = before.permanent.cosmicRip.telemetryData;
  const initialGp = before.permanent.gloryPoints;
  const initialResearchPoints = before.run.researchPoints;

  await card.getByRole("button", { name: copy.research, exact: true }).click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(15_000));

  const active = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(active.permanent.cosmicRip.activeResearchTechnologyId).toBe(technology.id);
  expect(active.permanent.cosmicRip.researchElapsedMs).toBe(15_000);
  expect(active.permanent.cosmicRip.telemetryData).toBeLessThan(initialTelemetry);
  expect(active.permanent.gloryPoints).toBe(initialGp - 1);
  expect(active.run.researchPoints).toBe(initialResearchPoints);

  const researchProgress = card.getByRole("progressbar", {
    name: `${copy.researching}: ${copy.technologyNames[technology.id]}`,
  });
  const remaining = card.getByTestId("cosmic-rip-research-remaining");
  const expectedCost = `${formatNumber("en", technology.telemetryCost, 0, active.settings.notation)} ${copy.telemetry} · ${formatNumber("en", technology.durationMs / 1000, 0, active.settings.notation)} s · 1 ${copy.gpShort}`;
  const expectedCash = formatCurrency(
    "en",
    Number(displayCurrency(active.run.cash)),
    active.settings.currencyId ?? "usd",
    2,
    active.settings.notation,
  );

  for (const viewport of NARROW_VIEWPORTS) {
    await page.setViewportSize(viewport);
    await expect(page.locator("#tab-cosmic-rip")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#tab-cosmic-rip-rip")).toHaveAttribute("aria-selected", "true");
    await expect(pane).toBeVisible();
    await expect(card).toBeVisible();
    await expect(card.locator("p").first()).toHaveText(expectedCost);
    await expect(card).toContainText(copy.researching);
    await expect(researchProgress).toBeVisible();
    await expect(researchProgress).toHaveAttribute("max", String(technology.durationMs));
    expect(
      await researchProgress.evaluate((element) => (element as HTMLProgressElement).value),
    ).toBe(15_000);
    await expect(remaining).toHaveText(
      copy.remaining.replace(
        "{time}",
        formatCountdown(
          "en",
          technology.durationMs - active.permanent.cosmicRip.researchElapsedMs,
          active.settings.notation,
        ),
      ),
    );

    const researchBalance = page.getByTestId("research-balance");
    const cashBalance = page.getByTestId("cash-balance");
    await expect(researchBalance).toBeVisible();
    await expect(researchBalance).toHaveText(
      formatNumber("en", active.run.researchPoints, 0, active.settings.notation),
    );
    await expect(cashBalance).toBeVisible();
    await expect(cashBalance).toHaveText(expectedCash);
    await expect(pane.locator(".cosmic-rip-wallet")).toContainText(copy.telemetry);

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
          ["Cosmic Rip pane", rect(".cosmic-rip-pane")],
          ["Cosmic Rip wallet", rect(".cosmic-rip-wallet")],
          ["Technology card", rect('[data-testid="cosmic-rip-technology-stabilizerArray"]')],
          [
            "Research progress",
            rect('[data-testid="cosmic-rip-technology-stabilizerArray"] progress'),
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
      `p13-cosmic-rip-active-research-${viewport.width}`,
    );
  }
});
