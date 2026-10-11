import { expect, test, type Locator, type Page } from "../_harness/fixtures";

const VIEWPORTS = [320, 390] as const;

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2.625,
  isMobile: true,
  hasTouch: true,
});

async function startFixture(
  page: Page,
  fixture: "research" | "power-buildings" | "philosophy-notification-routes",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261009&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill(`P-05 ${fixture} actions`);
  await page.getByTestId("start-game").tap();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function expectMechanicsTargetsAtLeast44px(panel: Locator, label: string): Promise<number> {
  const documentBounds = await panel.evaluate((element) => ({
    documentWidth: element.ownerDocument.documentElement.scrollWidth,
    viewportWidth: element.ownerDocument.defaultView?.innerWidth ?? 0,
  }));
  expect(
    documentBounds.documentWidth,
    `${label} document width should fit its viewport`,
  ).toBeLessThanOrEqual(documentBounds.viewportWidth);
  const targets = await panel
    .locator(
      "button:visible, select:visible, input:not([type=hidden]):not([type=checkbox]):visible, summary:visible, [role=slider]:visible, .economy-toggle:visible",
    )
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        const element = node as HTMLElement;
        return {
          label:
            element.getAttribute("aria-label") ??
            element.textContent?.trim().replace(/\s+/g, " ").slice(0, 42) ??
            element.tagName,
          className: typeof element.className === "string" ? element.className : "",
          width: Math.round(rect.width * 10) / 10,
          height: Math.round(rect.height * 10) / 10,
        };
      }),
    );
  for (const target of targets) {
    expect(
      target.width,
      `${label} ${target.className || target.label} hit width`,
    ).toBeGreaterThanOrEqual(44);
    expect(
      target.height,
      `${label} ${target.className || target.label} hit height`,
    ).toBeGreaterThanOrEqual(44);
  }
  return targets.length;
}

async function getState(page: Page) {
  return page.evaluate(() => window.miaplacidusTest!.getState());
}

test("Research and Energy mechanics actions meet 44px and keyboard/touch reachability at 320px and 390px @p05-research-energy-actions @touch @keyboard", async ({
  page,
}) => {
  test.setTimeout(240_000);
  let measuredTargets = 0;

  await startFixture(page, "research");
  for (const width of VIEWPORTS) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator("#tab-research").tap();
    await page.locator("#tab-research-science-buildings").tap();
    const sciencePanel = page.locator("#panel-research-science-buildings");
    await expect(sciencePanel).toBeVisible();
    measuredTargets += await expectMechanicsTargetsAtLeast44px(
      sciencePanel,
      `${width}px Research Science`,
    );

    const scienceKit = sciencePanel.locator('[data-building-id="scienceKit"]');
    const buildToggle = scienceKit.locator(":scope > .text-button");
    const initialPressed = await buildToggle.getAttribute("aria-pressed");
    await buildToggle.focus();
    await page.keyboard.press("Enter");
    await expect(buildToggle).toHaveAttribute(
      "aria-pressed",
      initialPressed === "true" ? "false" : "true",
    );
    if (width === 320) {
      const before = (await getState(page)).run.upgrades.scienceKit;
      const buy = scienceKit.getByRole("button", { name: "Buy", exact: true });
      if (await buy.isEnabled()) {
        await buy.tap();
        await expect
          .poll(() =>
            page.evaluate(() => window.miaplacidusTest!.getState().run.upgrades.scienceKit),
          )
          .toBe(before + 1);
      }
    }

    await page.locator("#tab-research-tech-tree").tap();
    const treePanel = page.locator("#panel-research-tech-tree");
    await expect(treePanel).toBeVisible();
    measuredTargets += await expectMechanicsTargetsAtLeast44px(treePanel, `${width}px Tech Tree`);
    const knowledgeSharing = treePanel.locator('[data-technology-id="knowledgeSharing"]');
    await expect(knowledgeSharing).toBeVisible();
    if (width === 320) {
      await expect(knowledgeSharing).toHaveAttribute("aria-disabled", "false");
      await knowledgeSharing.focus();
      await expect(knowledgeSharing).toBeFocused();
      await page.keyboard.press("Enter");
      await expect
        .poll(() =>
          page.evaluate(() =>
            window
              .miaplacidusTest!.getState()
              .run.economy.researchedTechnologies.includes("knowledgeSharing"),
          ),
        )
        .toBe(true);
    }
  }

  await startFixture(page, "philosophy-notification-routes");
  for (const width of VIEWPORTS) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator("#tab-research").tap();
    await page.locator("#tab-research-philosophy").tap();
    const philosophyPanel = page.locator("#panel-research-philosophy");
    await expect(philosophyPanel).toBeVisible();
    measuredTargets += await expectMechanicsTargetsAtLeast44px(
      philosophyPanel,
      `${width}px Philosophy`,
    );
    const ability = philosophyPanel.locator(".philosophy-ability button");
    if (await ability.isEnabled()) {
      await ability.focus();
      await page.keyboard.press("Enter");
      await expect
        .poll(() =>
          page.evaluate(() => window.miaplacidusTest!.getState().run.philosophyAbilityActive),
        )
        .toBe(true);
    }
  }

  await startFixture(page, "power-buildings");
  for (const width of VIEWPORTS) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator("#tab-energy").tap();
    await page.locator("#tab-energy-summary").tap();
    const energyPanel = page.locator("#panel-energy");
    await expect(energyPanel).toBeVisible();
    measuredTargets += await expectMechanicsTargetsAtLeast44px(
      energyPanel,
      `${width}px Energy Summary`,
    );

    await page.locator("#tab-energy-batteries").tap();
    await expect(energyPanel.locator('[data-building-id="battery1"]')).toBeVisible();
    measuredTargets += await expectMechanicsTargetsAtLeast44px(energyPanel, `${width}px Batteries`);
    if (width === 320) {
      const battery = energyPanel.locator('[data-building-id="battery1"]');
      const beforeCapacity = (await getState(page)).run.economy.power.capacity;
      const buy = battery.getByRole("button", { name: "Buy", exact: true });
      await expect(buy).toBeEnabled();
      await buy.tap();
      await expect
        .poll(() =>
          page.evaluate(() => window.miaplacidusTest!.getState().run.economy.power.capacity),
        )
        .toBeGreaterThan(beforeCapacity);
    }

    await page.locator("#tab-energy-power").tap();
    const powerButton = energyPanel.locator(".energy-master-switch");
    await expect(powerButton).toBeVisible();
    measuredTargets += await expectMechanicsTargetsAtLeast44px(energyPanel, `${width}px Power`);
    const powerWasEnabled = (await getState(page)).run.economy.power.gridEnabled;
    if (width === 320) {
      await powerButton.focus();
      await page.keyboard.press("Enter");
    } else {
      await powerButton.tap();
    }
    await expect
      .poll(() =>
        page.evaluate(() => window.miaplacidusTest!.getState().run.economy.power.gridEnabled),
      )
      .toBe(!powerWasEnabled);

    const plant = energyPanel.locator('[data-building-id="powerPlant1"]');
    if (!(await plant.locator(".economy-toggle input").count())) {
      const buyPlant = plant.getByRole("button", { name: "Buy", exact: true });
      if (await buyPlant.isEnabled()) await buyPlant.tap();
    }
    const plantToggle = plant.locator(".economy-toggle input");
    if (await plantToggle.count()) {
      await plantToggle.focus();
      const wasChecked = await plantToggle.isChecked();
      await page.keyboard.press("Space");
      await expect(plantToggle).toBeChecked({ checked: !wasChecked });
      measuredTargets += await expectMechanicsTargetsAtLeast44px(
        energyPanel,
        `${width}px Power Plant`,
      );
    }
  }

  expect(measuredTargets).toBeGreaterThan(25);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
});
