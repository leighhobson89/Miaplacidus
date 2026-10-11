import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { economyLabel } from "../../../src/i18n/economyMessages";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

const VIEWPORTS = [
  { width: 1280, height: 900 },
  { width: 768, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

const ENERGY_ROUTES = [
  { tabId: "tab-energy-summary", labelKey: "energySummary" },
  { tabId: "tab-energy-batteries", labelKey: "energyStorage" },
  { tabId: "tab-energy-power", labelKey: "energyPower" },
] as const satisfies readonly {
  readonly tabId: string;
  readonly labelKey: Parameters<typeof economyLabel>[1];
}[];

async function startFullEconomyFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261008&testLocale=en&economyFixture=full");
  await page.getByLabel("Pioneer name").fill("Energy Presentation Matrix Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function visibleTabLabel(page: Page, tabId: string): Promise<string> {
  return page.locator(`#${tabId}`).evaluate((element) => {
    const copy = element.cloneNode(true) as HTMLElement;
    copy.querySelector(".attention-badge")?.remove();
    return copy.innerText.trim();
  });
}

async function setLocale(page: Page, locale: LocaleId): Promise<void> {
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-game-options").click();
  await page.locator("#settings-language").selectOption(locale);
  await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe(locale);
}

async function setTheme(page: Page, theme: (typeof THEME_IDS)[number]): Promise<void> {
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-visual").click();
  await page.locator("#settings-theme").selectOption(theme);
  await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", theme);
}

test("Energy page identity, order, artwork, and bounds fit all locales and themes @energy-presentation-matrix @p65 @p66 @ui", async ({
  page,
}) => {
  test.setTimeout(300_000);
  await startFullEconomyFixture(page);

  const childTabs = page.locator("#pane-energy .pane-nav [role='tab']");
  await page.getByRole("tab", { name: /Energy/ }).click();
  await expect
    .poll(() => childTabs.evaluateAll((tabs) => tabs.map((tab) => tab.id)))
    .toEqual(ENERGY_ROUTES.map(({ tabId }) => tabId));
  await expect
    .poll(() =>
      childTabs.evaluateAll((tabs) =>
        tabs.map((tab) => [
          tab.id,
          tab.getAttribute("data-source-option-id"),
          tab.getAttribute("data-source-option-ids"),
        ]),
      ),
    )
    .toEqual([
      ["tab-energy-summary", null, null],
      ["tab-energy-batteries", "option1", null],
      ["tab-energy-power", null, "option2,option3,option4"],
    ]);

  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    for (const theme of THEME_IDS) {
      await setTheme(page, theme);
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await page.locator("#tab-energy").click();
        const energy = page.getByTestId("economy-energy");
        const panel = page.locator("#panel-energy");
        const titleSizes: string[] = [];

        for (const route of ENERGY_ROUTES) {
          const expectedTitle = economyLabel(locale, route.labelKey);
          const tab = page.locator(`#${route.tabId}`);
          await expect(tab, `${locale} ${theme} ${route.tabId} is available`).toBeVisible();
          await expect.poll(() => visibleTabLabel(page, route.tabId)).toBe(expectedTitle);
          await tab.click();

          const title = energy.locator(".game-page-title:visible");
          const artwork = energy.locator(".page-artwork-row:visible");
          await expect(title, `${locale} ${theme} ${route.tabId} title`).toHaveCount(1);
          await expect(title).toHaveText(expectedTitle);
          await expect(artwork, `${locale} ${theme} ${route.tabId} artwork row`).toHaveCount(1);
          await expect(
            artwork.locator("[data-emblem-kind='energy-lightning']"),
            `${locale} ${theme} ${route.tabId} lightning artwork`,
          ).toHaveCount(1);
          await expect(panel).toHaveAttribute("aria-labelledby", route.tabId);

          const bounds = await page.evaluate(() => {
            const pane = document.querySelector<HTMLElement>("[data-testid='economy-energy']");
            const panelElement = document.querySelector<HTMLElement>("#panel-energy");
            const titleElement = panelElement?.querySelector<HTMLElement>(".game-page-title");
            const artworkElement = panelElement?.querySelector<HTMLElement>(".page-artwork-row");
            if (!pane || !panelElement || !titleElement || !artworkElement) {
              throw new Error("Energy presentation elements were not found.");
            }

            const rect = (element: HTMLElement) => {
              const box = element.getBoundingClientRect();
              return { left: box.left, right: box.right };
            };
            return {
              viewportWidth: document.documentElement.clientWidth,
              documentWidth: document.documentElement.scrollWidth,
              pane: rect(pane),
              panel: rect(panelElement),
              title: rect(titleElement),
              artwork: rect(artworkElement),
              panelScrollWidth: panelElement.scrollWidth,
              panelClientWidth: panelElement.clientWidth,
              titleFontSize: getComputedStyle(titleElement).fontSize,
            };
          });
          const context = `${locale} ${theme} ${route.tabId} at ${viewport.width}px`;
          titleSizes.push(bounds.titleFontSize);
          for (const [name, box] of [
            ["pane", bounds.pane],
            ["panel", bounds.panel],
            ["title", bounds.title],
            ["artwork", bounds.artwork],
          ] as const) {
            expect(box.left, `${context} ${name} left edge`).toBeGreaterThanOrEqual(-1);
            expect(box.right, `${context} ${name} right edge`).toBeLessThanOrEqual(
              bounds.viewportWidth + 1,
            );
          }
          expect(bounds.documentWidth, `${context} document width`).toBeLessThanOrEqual(
            viewport.width,
          );
          expect(bounds.panelScrollWidth, `${context} panel internal width`).toBeLessThanOrEqual(
            bounds.panelClientWidth,
          );
        }
        expect(
          new Set(titleSizes).size,
          `${locale} ${theme} title scale at ${viewport.width}px`,
        ).toBe(1);
      }
    }
  }
});

test("Power switch states have reviewable desktop and phone visuals @p65-visual-review @p66-visual-review", async ({
  page,
}) => {
  await startFullEconomyFixture(page);
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });

  const energy = page.getByTestId("economy-energy");
  const assertPowerState = async (active: boolean) => {
    const switchLabel = active ? "DEACTIVATE POWER" : "ACTIVATE POWER";
    const powerSwitch = energy.getByRole("button", { name: switchLabel, exact: true });
    await expect(energy.locator(".game-page-title:visible")).toHaveText("Power");
    const lightning = energy.locator(
      ".page-artwork-row:visible [data-emblem-kind='energy-lightning']",
    );
    await expect(lightning).toBeVisible();
    await expect(powerSwitch).toBeVisible();
    await expect(powerSwitch).toHaveAttribute("style", "width: 100%;");
    await expect(energy.getByRole("checkbox", { name: /power grid/i })).toHaveCount(0);
    for (const buildingId of ["powerPlant1", "powerPlant2", "powerPlant3"]) {
      await expect(energy.locator(`[data-building-id='${buildingId}']`)).toBeVisible();
    }
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
    await page.mouse.move(0, 0);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
  };
  const capture = async (active: boolean, name: string) => {
    await assertPowerState(active);
    await expect(page).toHaveScreenshot(name, {
      fullPage: true,
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.05,
    });
  };

  await page.setViewportSize({ width: 1280, height: 900 });
  await setTheme(page, "terminal");
  await page.locator("#tab-energy").click();
  await page.locator("#tab-energy-power").click();
  await capture(true, "phase6-energy-power-active-terminal-desktop.png");
  await energy.getByRole("button", { name: "DEACTIVATE POWER", exact: true }).click();
  await expect(energy.getByRole("button", { name: "ACTIVATE POWER", exact: true })).toBeVisible();
  await capture(false, "phase6-energy-power-inactive-terminal-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await setTheme(page, "dark");
  await page.locator("#tab-energy").click();
  await page.locator("#tab-energy-power").click();
  await capture(false, "phase6-energy-power-inactive-dark-mobile.png");
  await energy.getByRole("button", { name: "ACTIVATE POWER", exact: true }).click();
  await expect(energy.getByRole("button", { name: "DEACTIVATE POWER", exact: true })).toBeVisible();
  await capture(true, "phase6-energy-power-active-dark-mobile.png");
});

test("Energy Summary and Batteries have durable desktop and phone visual captures @p66-visual-review", async ({
  page,
}, testInfo) => {
  await startFullEconomyFixture(page);
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });

  const energy = page.getByTestId("economy-energy");
  const views = [
    { width: 1280, height: 900, theme: "terminal", suffix: "terminal-desktop" },
    { width: 390, height: 844, theme: "light", suffix: "light-mobile" },
  ] as const;
  const pages = [
    {
      tabId: "tab-energy-summary",
      title: "Energy Summary",
      slug: "summary",
    },
    { tabId: "tab-energy-batteries", title: "Batteries", slug: "batteries" },
  ] as const;

  for (const view of views) {
    await page.setViewportSize({ width: view.width, height: view.height });
    await setTheme(page, view.theme);
    await page.locator("#tab-energy").click();
    for (const energyPage of pages) {
      await page.locator(`#${energyPage.tabId}`).click();
      await expect(energy.locator(".game-page-title:visible")).toHaveText(energyPage.title);
      await expect(
        energy.locator(".page-artwork-row:visible [data-emblem-kind='energy-lightning']"),
      ).toBeVisible();
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        window.scrollTo(0, 0);
      });
      await page.mouse.move(0, 0);
      await captureVisualCheckpoint(
        page,
        testInfo,
        `phase6-energy-${energyPage.slug}-${view.suffix}`,
      );
    }
  }
});
