import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";

test("all top-level tabs fit four viewport widths in Terminal @theme-tab-matrix", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  await startMetaFixture(page, "meta-megastructure-route");
  const unlocked = await page.evaluate(() =>
    window.miaplacidusTest?.applyDebugAction("unlock-all-tabs"),
  );
  expect(unlocked, "the deterministic fixture should expose every top-level tab").toBe(true);

  const tabIds = [
    "hydrogen",
    "compounds",
    "research",
    "energy",
    "space-mining",
    "interstellar",
    "galaxy",
    "cosmic-rip",
    "settings",
    "miaplaedia",
  ] as const;
  const viewports = [
    { width: 1280, height: 900 },
    { width: 768, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ] as const;
  const screenshotWidths = new Set([1280, 768, 390, 320]);

  await expect(page.locator(".game-nav [role=tab]")).toHaveCount(tabIds.length);
  const orderedTabs = await page
    .locator(".game-nav [role=tab]")
    .evaluateAll((tabs) => tabs.map((tab) => tab.id.replace(/^tab-/, "")));
  expect(orderedTabs).toEqual(tabIds);

  const visit = async (tabId: (typeof tabIds)[number], viewport: (typeof viewports)[number]) => {
    await page.locator(`#tab-${tabId}`).click();

    const geometry = await page.evaluate((id) => {
      const tab = document.getElementById(`tab-${id}`);
      const pane = document.getElementById(`pane-${id}`);
      const frame = document.querySelector<HTMLElement>(".game-frame:not(.notification-portal)");
      if (!tab || !pane || !frame) throw new Error("Visible top-level tab and pane should render");
      const panel = pane.getBoundingClientRect();
      const frameBounds = frame.getBoundingClientRect();
      return {
        selected: tab.getAttribute("aria-selected") === "true",
        visible: !pane.hidden && pane.getClientRects().length > 0,
        panelLeft: panel.left,
        panelRight: panel.right,
        panelWidth: panel.width,
        frameLeft: frameBounds.left,
        frameRight: frameBounds.right,
        documentWidth: document.documentElement.scrollWidth,
        energyTooltipRight:
          document
            .querySelector<HTMLElement>(
              '.top-status-bar [data-testid="top-stat-energy"] .top-stat-tooltip',
            )
            ?.getBoundingClientRect().right ?? null,
      };
    }, tabId);

    const label = `Terminal ${tabId} at ${viewport.width}px`;
    expect(geometry.selected, `${label} selected`).toBe(true);
    expect(geometry.visible, `${label} visible`).toBe(true);
    expect(geometry.panelWidth, `${label} panel width`).toBeGreaterThan(0);
    expect(geometry.panelLeft, `${label} panel left edge`).toBeGreaterThanOrEqual(-1);
    expect(geometry.panelRight, `${label} panel right edge`).toBeLessThanOrEqual(
      viewport.width + 1,
    );
    expect(geometry.panelLeft, `${label} stays within game frame`).toBeGreaterThanOrEqual(
      geometry.frameLeft - 1,
    );
    expect(geometry.panelRight, `${label} stays within game frame`).toBeLessThanOrEqual(
      geometry.frameRight + 1,
    );
    expect(geometry.documentWidth, `${label} document width`).toBeLessThanOrEqual(viewport.width);
    expect(geometry.energyTooltipRight, `${label} energy tooltip viewport bound`).not.toBeNull();
    expect(
      geometry.energyTooltipRight,
      `${label} energy tooltip stays on-screen`,
    ).toBeLessThanOrEqual(viewport.width);

    if (tabId === "miaplaedia" && screenshotWidths.has(viewport.width)) {
      await testInfo.attach(`tab-matrix-terminal-${viewport.width}.png`, {
        body: await page.screenshot({ fullPage: true, animations: "disabled" }),
        contentType: "image/png",
      });
    }
  };

  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-visual").click();
  await page.locator("#settings-theme").selectOption("terminal");
  await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", "terminal");
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const tabId of tabIds) await visit(tabId, viewport);
  }
});
