import { expect, test, type Locator, type Page } from "../_harness/fixtures";

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2.625,
  isMobile: true,
  hasTouch: true,
});

async function startFixture(
  page: Page,
  fixture:
    | "meta-casino-ready"
    | "meta-rebirth-ready"
    | "meta-megastructure-route"
    | "meta-black-hole-discovered"
    | "meta-cosmic-rip-route",
): Promise<void> {
  await page.addInitScript(() => {
    for (const storage of [localStorage, sessionStorage]) {
      const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
        (key): key is string => key?.startsWith("miaplacidus:") ?? false,
      );
      for (const key of keys) storage.removeItem(key);
    }
  });
  await page.goto(`/?testSeed=20261009&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill(`P-05 ${fixture}`);
  await page.getByTestId("start-game").tap();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => Boolean(window.miaplacidusTest?.getState())))
    .toBe(true);
}

async function measureTargets(
  container: Locator,
  route: string,
  failures: string[],
): Promise<number> {
  const documentBounds = await container.evaluate((element) => ({
    documentWidth: element.ownerDocument.documentElement.scrollWidth,
    viewportWidth: element.ownerDocument.defaultView?.innerWidth ?? 0,
  }));
  expect(
    documentBounds.documentWidth,
    `${route} document width should fit its viewport`,
  ).toBeLessThanOrEqual(documentBounds.viewportWidth);
  const targets = await container
    .locator(
      "button:visible:not(.pane-nav-tab), input:not([type=hidden]):not([type=checkbox]):visible, select:visible, [role=slider]:visible, label:visible:has(input[type=checkbox])",
    )
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const element = node as HTMLElement;
        const rect = element.getBoundingClientRect();
        return {
          label:
            element.getAttribute("aria-label") ??
            element.textContent?.trim().replace(/\s+/g, " ").slice(0, 40) ??
            element.getAttribute("name") ??
            element.tagName,
          className: typeof element.className === "string" ? element.className : "",
          width: Math.round(rect.width * 10) / 10,
          height: Math.round(rect.height * 10) / 10,
        };
      }),
    );
  for (const target of targets) {
    if (target.width < 44 || target.height < 44) {
      failures.push(
        `${route} ${target.className || target.label}: ${target.width}×${target.height}px`,
      );
    }
  }
  return targets.length;
}

async function measureGalaxyPage(
  page: Page,
  routeId: string,
  paneSelector: string,
  widths: readonly number[],
  failures: string[],
): Promise<number> {
  let count = 0;
  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator("#tab-galaxy").tap();
    const tab = page.locator(`#${routeId}`);
    await expect(tab, `${width}px ${routeId} should be available in this fixture`).toBeVisible();
    await tab.tap();
    const pane = page.locator(paneSelector);
    await expect(pane).toBeVisible();
    count += await measureTargets(pane, `${width}px ${routeId}`, failures);
  }
  return count;
}

test("Meta progression mechanics actions meet 44px target bounds at 320px and 390px @p05-meta-actions", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const widths = [320, 390] as const;
  const failures: string[] = [];
  let measuredTargets = 0;

  await startFixture(page, "meta-casino-ready");
  for (const [routeId, paneSelector] of [
    ["tab-galactic-ascendency-perks", "[data-testid='ascendency-pane']"],
    ["tab-galactic-market", ".galactic-market-pane"],
    ["tab-galactic-casino", "[data-testid='galactic-casino-pane']"],
  ] as const) {
    measuredTargets += await measureGalaxyPage(page, routeId, paneSelector, widths, failures);
  }

  await startFixture(page, "meta-megastructure-route");
  await page.locator("#tab-galaxy").tap();
  for (const [routeId, paneSelector] of [
    ["tab-galactic-megastructures", "[data-testid='megastructure-pane']"],
  ] as const) {
    const tab = page.locator(`#${routeId}`);
    await expect(tab, `${routeId} should be visible in the megastructure fixture`).toBeVisible();
    measuredTargets += await measureGalaxyPage(page, routeId, paneSelector, widths, failures);
  }

  await startFixture(page, "meta-black-hole-discovered");
  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator("#tab-galaxy").tap();
    const blackHoleTab = page.locator("#tab-galactic-black-hole");
    await expect(blackHoleTab).toBeVisible();
    await blackHoleTab.tap();
    const pane = page.locator(".black-hole-pane");
    await expect(pane).toBeVisible();
    measuredTargets += await measureTargets(pane, `${width}px Black Hole`, failures);

    if (width === 320) {
      const research = page.getByTestId("black-hole-research").getByRole("button");
      await research.focus();
      await page.keyboard.press("Enter");
      await expect
        .poll(() =>
          page.evaluate(() => window.miaplacidusTest!.getState().permanent.blackHole.researched),
        )
        .toBe(true);
    } else {
      const powerUpgrade = pane
        .locator(".black-hole-upgrades")
        .getByRole("button")
        .filter({ hasText: "Power" });
      await expect(powerUpgrade).toBeEnabled();
      await powerUpgrade.tap();
      await expect
        .poll(() =>
          page.evaluate(() => window.miaplacidusTest!.getState().permanent.blackHole.power),
        )
        .toBeGreaterThan(1);
    }
  }

  await startFixture(page, "meta-rebirth-ready");
  await page.evaluate(() => {
    window.miaplacidusTest!.dispatch({ type: "news.ticker.force", category: "prize", id: 2000 });
  });
  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator("#tab-galaxy").tap();
    const rebirthTab = page.locator("#tab-galactic-rebirth");
    await expect(rebirthTab).toBeVisible();
    await rebirthTab.tap();
    const rebirthPane = page.getByTestId("rebirth-pane");
    await expect(rebirthPane).toBeVisible();
    measuredTargets += await measureTargets(rebirthPane, `${width}px Rebirth`, failures);

    const rebirth = rebirthPane.getByRole("button", { name: "Rebirth", exact: true });
    if (width === 320) {
      await rebirth.focus();
      await page.keyboard.press("Enter");
    } else {
      await rebirth.tap();
    }
    const dialog = page.getByRole("dialog", { name: "WARNING: REBIRTH!" });
    await expect(dialog).toBeVisible();
    measuredTargets += await measureTargets(dialog, `${width}px Rebirth confirmation`, failures);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
  for (const width of widths) {
    if (width === 390) {
      expect(
        await page.evaluate(
          () => (
            window.miaplacidusTest!.advanceBy(1_000),
            window.miaplacidusTest!.dispatch({
              type: "news.ticker.force",
              category: "prize",
              id: 2000,
            })
          ),
        ),
      ).toBe(true);
    }
    await page.setViewportSize({ width, height: 844 });
    await page.locator("#tab-settings").tap();
    await page.locator("#tab-settings-events").tap();
    const journal = page.getByTestId("meta-journal-pane");
    await expect(journal).toBeVisible();
    measuredTargets += await measureTargets(journal, `${width}px Event Journal`, failures);
    const claim = journal.locator('li[data-news-id="2000"] .text-button').first();
    await expect(claim).toBeEnabled();
    if (width === 320) {
      await claim.focus();
      await page.keyboard.press("Enter");
    } else {
      await claim.tap();
    }
    await expect(claim).toBeDisabled();
  }

  await startFixture(page, "meta-cosmic-rip-route");
  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator("#tab-cosmic-rip").tap();
    const pane = page.getByTestId("cosmic-rip-pane");
    await expect(pane).toBeVisible();
    for (const route of ["situation", "scanner-array", "rip"] as const) {
      const tab = page.locator(`#tab-cosmic-rip-${route}`);
      await expect(tab, `${width}px Cosmic Rip ${route} route`).toBeVisible();
      await tab.tap();
      const panel = pane.locator(`#panel-cosmic-rip-${route}`);
      await expect(panel).toBeVisible();
      measuredTargets += await measureTargets(panel, `${width}px Cosmic Rip ${route}`, failures);
    }
  }

  expect(measuredTargets).toBeGreaterThan(50);
  expect(failures, "Every measured Meta mechanics hit area should be 44×44px or larger").toEqual(
    [],
  );
});
