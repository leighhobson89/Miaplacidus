import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { THEME_IDS, type ThemeId } from "../../../src/content/themes";
import { economyLabel } from "../../../src/i18n/economyMessages";
import { philosophyText } from "../../../src/i18n/philosophyMessages";

const VIEWPORTS = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

const RESEARCH_ROUTES = [
  {
    id: "research-science-buildings",
    tabId: "tab-research-science-buildings",
    panelId: "panel-research-science-buildings",
    labelKey: "research",
    titleSelector: ".economy-section-heading > .game-page-title",
    artworkSelector: ":scope > .page-artwork-row",
    emblemSelector: "[data-emblem-kind='laboratory']",
    sourceOptionId: "option1",
  },
  {
    id: "research-tech-tree",
    tabId: "tab-research-tech-tree",
    panelId: "panel-research-tech-tree",
    labelKey: "technologyTree",
    titleSelector: ".economy-section-heading > .game-page-title",
    artworkSelector: ":scope > .page-artwork-row",
    emblemSelector: "[data-emblem-kind='technology']",
    sourceOptionId: "option3",
  },
  {
    id: "research-philosophy",
    tabId: "tab-research-philosophy",
    panelId: "panel-research-philosophy",
    labelKey: null,
    titleSelector: ".philosophy-path-heading .game-page-title",
    artworkSelector: ".philosophy-section .page-artwork-row",
    emblemSelector: "[data-philosophy-art='expansionist']",
    sourceOptionId: "option4",
  },
] as const satisfies readonly {
  readonly id: string;
  readonly tabId: string;
  readonly panelId: string;
  readonly labelKey: Parameters<typeof economyLabel>[1] | null;
  readonly titleSelector: string;
  readonly artworkSelector: string;
  readonly emblemSelector: string;
  readonly sourceOptionId: string;
}[];

async function startExpansionistResearchFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261008&testLocale=en&economyFixture=space-telescope");
  await page.getByLabel("Pioneer name").fill("Research Presentation Matrix Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => typeof window.miaplacidusTest?.dispatch === "function"))
    .toBe(true);
  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-telescope").click();
  await page.getByRole("button", { name: "Build telescope", exact: true }).click();
  await page.getByRole("button", { name: "Study stars", exact: true }).click();
  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "timer.complete",
        timerId: "survey:star-study",
      }),
    ),
  ).toBe(true);
  await page.getByTestId("philosophy-choice").getByRole("button", { name: "Expansionist" }).click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().permanent.philosophyId))
    .toBe("expansionist");
}

async function setPresentation(page: Page, locale: LocaleId, theme: ThemeId): Promise<void> {
  await page.evaluate(
    ({ nextLocale, nextTheme }) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, themeId: nextTheme },
      }),
    { nextLocale: locale, nextTheme: theme },
  );
  await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe(locale);
  await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", theme);
}

async function visibleTabLabel(page: Page, tabId: string): Promise<string> {
  return page.locator(`#${tabId}`).evaluate((element) => {
    const copy = element.cloneNode(true) as HTMLElement;
    copy.querySelector(".attention-badge")?.remove();
    return copy.innerText.trim();
  });
}

test("Research, Tech Tree, and Philosophy identity fits every locale, theme, and viewport @research-presentation-matrix @p65 @ui", async ({
  page,
}) => {
  test.setTimeout(300_000);
  await startExpansionistResearchFixture(page);

  for (const locale of LOCALE_IDS) {
    for (const theme of THEME_IDS) {
      await setPresentation(page, locale, theme);
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await page.locator("#tab-hydrogen").click();
        const hydrogenTitleSize = await page
          .locator("#panel-resources-hydrogen .pane-heading h2")
          .evaluate((element) => getComputedStyle(element).fontSize);

        await page.locator("#tab-research").click();
        const researchTab = page.locator("#tab-research");
        await expect(researchTab).toHaveAttribute("aria-selected", "true");
        const researchTabPanel = page.locator("#pane-research");
        await expect(researchTabPanel).toBeVisible();
        await expect(researchTabPanel).toHaveAttribute("aria-labelledby", "tab-research");
        const researchPage = researchTabPanel.getByTestId("economy-research");

        const childTabs = page.locator("#pane-research .pane-nav [role='tab']");
        await expect
          .poll(() => childTabs.evaluateAll((tabs) => tabs.map((tab) => tab.id)))
          .toEqual(RESEARCH_ROUTES.map(({ tabId }) => tabId));
        await expect
          .poll(() =>
            childTabs.evaluateAll((tabs) =>
              tabs.map((tab) => [
                tab.id,
                tab.getAttribute("data-source-option-ids") ??
                  tab.getAttribute("data-source-option-id"),
              ]),
            ),
          )
          .toEqual([
            ["tab-research-science-buildings", "option1"],
            ["tab-research-tech-tree", "option2,option3"],
            ["tab-research-philosophy", "option4"],
          ]);

        const titleSizes: string[] = [];
        for (const route of RESEARCH_ROUTES) {
          const expectedTabLabel = route.labelKey
            ? economyLabel(locale, route.labelKey)
            : philosophyText(locale).title;
          const expectedTitle =
            route.id === "research-philosophy"
              ? philosophyText(locale).paths.expansionist.name
              : expectedTabLabel;
          const tab = page.locator(`#${route.tabId}`);
          const panel = page.locator(`#${route.panelId}`);
          await expect(tab, `${locale} ${theme} ${route.id} tab`).toBeVisible();
          await expect.poll(() => visibleTabLabel(page, route.tabId)).toBe(expectedTabLabel);
          await expect(tab).toHaveAttribute("aria-controls", route.panelId);
          await tab.click();

          await expect(tab).toHaveAttribute("aria-selected", "true");
          await expect(
            page.locator("#pane-research .pane-nav [role='tab'][aria-selected='true']"),
            `${locale} ${theme} exactly one Research child is selected`,
          ).toHaveCount(1);
          await expect(panel, `${locale} ${theme} ${route.id} associated panel`).toBeVisible();
          await expect(panel).toHaveAttribute("aria-labelledby", route.tabId);
          const title = researchPage.locator(route.titleSelector);
          const artwork = researchPage.locator(route.artworkSelector);
          await expect(title, `${locale} ${theme} ${route.id} title`).toHaveText(expectedTitle);
          await expect(artwork, `${locale} ${theme} ${route.id} artwork`).toBeVisible();
          await expect(
            artwork.locator(route.emblemSelector),
            `${locale} ${theme} ${route.id} emblem`,
          ).toHaveCount(1);
          await expect(
            page.locator("#pane-research .subpane-panel:visible"),
            `${locale} ${theme} only the selected Research child panel is visible`,
          ).toHaveCount(1);

          const bounds = await page.evaluate(({ panelId, titleSelector, artworkSelector }) => {
            const pane = document.querySelector<HTMLElement>("#pane-research");
            const panelElement = document.getElementById(panelId);
            const researchElement = pane?.querySelector<HTMLElement>(
              "[data-testid='economy-research']",
            );
            const titleElement = researchElement?.querySelector<HTMLElement>(titleSelector);
            const artworkElement = researchElement?.querySelector<HTMLElement>(artworkSelector);
            if (!pane || !panelElement || !titleElement || !artworkElement) {
              throw new Error("Research presentation elements were not found.");
            }
            const horizontalBounds = (element: HTMLElement) => {
              const rect = element.getBoundingClientRect();
              return { left: rect.left, right: rect.right };
            };
            return {
              viewportWidth: document.documentElement.clientWidth,
              documentWidth: document.documentElement.scrollWidth,
              pane: horizontalBounds(pane),
              panel: horizontalBounds(panelElement),
              title: horizontalBounds(titleElement),
              artwork: horizontalBounds(artworkElement),
              panelScrollWidth: panelElement.scrollWidth,
              panelClientWidth: panelElement.clientWidth,
              titleFontSize: getComputedStyle(titleElement).fontSize,
            };
          }, route);
          const context = `${locale} ${theme} ${route.id} at ${viewport.width}px`;
          titleSizes.push(bounds.titleFontSize);
          expect(bounds.titleFontSize, `${context} title scale matches Hydrogen`).toBe(
            hydrogenTitleSize,
          );
          for (const [name, box] of [
            ["Research pane", bounds.pane],
            ["selected panel", bounds.panel],
            ["page title", bounds.title],
            ["artwork row", bounds.artwork],
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
            bounds.panelClientWidth + 1,
          );
        }
        expect(
          new Set(titleSizes).size,
          `${locale} ${theme} Research title scale at ${viewport.width}px`,
        ).toBe(1);
      }
    }
  }
});
