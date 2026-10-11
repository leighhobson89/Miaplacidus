import { expect, test, type Locator, type Page } from "../_harness/fixtures";

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2.625,
  isMobile: true,
  hasTouch: true,
});

async function startFixture(
  page: Page,
  fixture: "space-late-game" | "space-starship-ready" | "space-telescope",
) {
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

async function recordUndersizedTargets(
  container: Locator,
  label: string,
  failures: string[],
): Promise<number> {
  const documentBounds = await container.evaluate((element) => ({
    documentWidth: element.ownerDocument.documentElement.scrollWidth,
    viewportWidth: element.ownerDocument.defaultView?.innerWidth ?? 0,
  }));
  expect(
    documentBounds.documentWidth,
    `${label} document width should fit its viewport`,
  ).toBeLessThanOrEqual(documentBounds.viewportWidth);
  const targets = await container
    .locator(
      "button:visible:not(.pane-nav-tab), input:not([type=hidden]):not([type=checkbox]):visible, select:visible, summary:visible, [role=slider]:visible",
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
    if (target.width < 44 || target.height < 44)
      failures.push(
        `${label} ${target.className || target.label}: ${target.width}×${target.height}px`,
      );
  }
  return targets.length;
}

test("Space Mining and Interstellar mechanics actions meet 44px and keyboard/touch access at 320px and 390px @p05-space-actions @touch @keyboard", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const failures: string[] = [];
  let measuredTargets = 0;
  await startFixture(page, "space-late-game");

  const spaceMiningRoutes = [
    "space-mining-mining",
    "space-mining-telescope",
    "space-mining-asteroids",
    "space-mining-launch-pad",
    "space-mining-rocket-1",
    "space-mining-rocket-2",
    "space-mining-rocket-3",
    "space-mining-rocket-4",
  ] as const;
  for (const width of [320, 390] as const) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator("#tab-space-mining").tap();
    for (const route of spaceMiningRoutes) {
      const tab = page.locator(`#tab-${route}`);
      await expect(tab, `${width}px ${route} route`).toBeVisible();
      await tab.tap();
      const cards = page.locator(".space-card:visible");
      await expect(cards).toHaveCount(1);
      measuredTargets += await recordUndersizedTargets(cards, `${width}px ${route}`, failures);

      if (width === 320 && route === "space-mining-telescope") {
        const study = page.locator("#telescope-study-stars");
        if (await study.isEnabled()) {
          await study.focus();
          await page.keyboard.press("Enter");
          await expect
            .poll(() =>
              page.evaluate(() => window.miaplacidusTest!.getState().run.space.activeSurvey),
            )
            .toBe("stars");
        }
      }
      if (width === 320 && route === "space-mining-asteroids") {
        const asteroid = page.locator(".space-asteroid-entry").nth(1);
        await asteroid.tap();
        await expect(asteroid).toHaveAttribute("aria-pressed", "true");
      }
      if (width === 320 && route === "space-mining-rocket-1") {
        const rocketName = page.locator("#rocket1-name");
        await rocketName.fill("P05");
        const rename = rocketName.locator("xpath=following-sibling::button");
        await rename.focus();
        await page.keyboard.press("Enter");
        await expect
          .poll(() =>
            page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket1.name),
          )
          .toBe("P05");
      }
    }

    await page.locator("#tab-interstellar").tap();
    for (const route of [
      "interstellar-starship",
      "interstellar-fleet-hangar",
      "interstellar-colonise",
    ] as const) {
      const tab = page.locator(`#tab-${route}`);
      await expect(tab, `${width}px ${route} route`).toBeVisible();
      await tab.tap();
      const pane = page.getByTestId("starship-pane");
      await expect(pane).toBeVisible();
      measuredTargets += await recordUndersizedTargets(pane, `${width}px ${route}`, failures);

      if (width === 320 && route === "interstellar-fleet-hangar") {
        const envoy = pane.getByRole("button", { name: "Build Envoy", exact: true });
        if (await envoy.isEnabled()) {
          await envoy.tap();
          await expect
            .poll(() =>
              page.evaluate(() => window.miaplacidusTest!.getState().run.space.fleetEnvoyBuilt),
            )
            .toBe(true);
        }
      }
      if (width === 320 && route === "interstellar-colonise") {
        const message = pane.getByTestId("starship-diplomacy-message-button");
        if (await message.isEnabled()) {
          await message.focus();
          await page.keyboard.press("Enter");
          await expect
            .poll(() =>
              page.evaluate(() => {
                const state = window.miaplacidusTest!.getState();
                const destination = state.run.space.starship.destinationSystemId;
                return state.run.space.systemEncounters.find(
                  (entry) => entry.systemId === destination,
                )?.lastDiplomacyMessage;
              }),
            )
            .not.toBeNull();
        }
      }
    }
  }

  await startFixture(page, "space-telescope");
  for (const width of [320, 390] as const) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator("#tab-space-mining").tap();
    await page.locator("#tab-space-mining-telescope").tap();
    const card = page.locator(".space-card:visible");
    await expect(card).toHaveCount(1);
    const buildTelescope = card.getByRole("button", { name: "Build telescope", exact: true });
    if (await buildTelescope.isVisible()) await buildTelescope.tap();
    const autoTelescope = page.getByTestId("auto-telescope-controls");
    await expect(autoTelescope).toBeVisible();
    measuredTargets += await recordUndersizedTargets(
      autoTelescope,
      `${width}px Auto Telescope controls`,
      failures,
    );
    const mode = autoTelescope.getByLabel("Action");
    if (width === 320) {
      await mode.focus();
      await page.keyboard.press("ArrowDown");
      await expect(mode).toHaveValue("stars");
      const enable = autoTelescope.getByRole("button", { name: "Enable automation", exact: true });
      await enable.focus();
      await page.keyboard.press("Enter");
      await expect
        .poll(() =>
          page.evaluate(() => window.miaplacidusTest!.getState().run.space.autoTelescopeEnabled),
        )
        .toBe(true);
    } else {
      await expect(mode).toHaveValue("stars");
      const disable = autoTelescope.getByRole("button", {
        name: "Disable automation",
        exact: true,
      });
      await disable.tap();
      await expect
        .poll(() =>
          page.evaluate(() => window.miaplacidusTest!.getState().run.space.autoTelescopeEnabled),
        )
        .toBe(false);
    }
  }

  await startFixture(page, "space-starship-ready");
  for (const width of [320, 390] as const) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator("#tab-interstellar").tap();
    await page.locator("#tab-interstellar-star-map").tap();
    const map = page.getByTestId("star-map-pane");
    await map.getByRole("searchbox", { name: "Search stars" }).fill("Sirius");
    await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).tap();
    const setDestination = map
      .getByTestId("star-selection")
      .getByRole("button", { name: "Set as destination" });
    if (await setDestination.count()) await setDestination.tap();
    await page.locator("#tab-interstellar-starship").tap();
    const pane = page.getByTestId("starship-pane");
    await expect(pane).toBeVisible();
    measuredTargets += await recordUndersizedTargets(
      pane,
      `${width}px unlaunched Starship`,
      failures,
    );
    const launch = pane.getByRole("button", { name: "Launch starship" });
    await launch.tap();
    const dialog = page.getByRole("dialog", { name: "Warning: point of no return" });
    await expect(dialog).toBeVisible();
    measuredTargets += await recordUndersizedTargets(
      dialog,
      `${width}px Starship launch dialog`,
      failures,
    );
    const cancel = dialog.getByRole("button", { name: "Cancel", exact: true });
    await cancel.focus();
    await page.keyboard.press("Enter");
    await expect(dialog).not.toBeVisible();
  }

  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
  expect(measuredTargets).toBeGreaterThan(50);
  expect(
    failures,
    "Every measured Space/Interstellar mechanics hit area should be 44×44px or larger",
  ).toEqual([]);
});
