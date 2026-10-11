import type { Page, TestInfo } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { LOCALE_IDS } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";

const VIEWPORTS = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

async function capture(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const path = testInfo.outputPath(name);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path, fullPage: true, caret: "hide" });
  await testInfo.attach(name, { path, contentType: "image/png" });
}

async function setPresentation(
  page: Page,
  locale: (typeof LOCALE_IDS)[number],
  themeId: (typeof THEME_IDS)[number],
): Promise<void> {
  await page.evaluate(
    ({ locale, themeId }) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale, themeId },
      });
    },
    { locale, themeId },
  );
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", themeId);
}

async function expandAllDetails(container: ReturnType<Page["locator"]>): Promise<void> {
  const closed = container.locator("details:not([open]) > summary:visible");
  while ((await closed.count()) > 0) await closed.first().click();
}

async function collectLayoutIssues(
  page: Page,
  panelSelector: string,
  contentSelector: string,
  label: string,
): Promise<string[]> {
  const result = await page.evaluate(
    ({ panelSelector, contentSelector }) => {
      const panel = document.querySelector<HTMLElement>(panelSelector);
      const content = document.querySelector<HTMLElement>(contentSelector);
      if (!panel || !content) throw new Error(`Missing ${panelSelector} / ${contentSelector}`);
      const rect = (element: HTMLElement) => {
        const box = element.getBoundingClientRect();
        return { left: box.left, right: box.right };
      };
      const visible = (element: HTMLElement) =>
        getComputedStyle(element).display !== "none" &&
        getComputedStyle(element).visibility !== "hidden" &&
        !element.closest(".sr-only") &&
        element.getClientRects().length > 0;
      const contentBounds = rect(content);
      const descendants = Array.from(content.querySelectorAll<HTMLElement>("*"))
        .filter(visible)
        .map((element) => ({
          text: element.innerText || element.getAttribute("aria-label") || "",
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === "string" ? element.className : "",
          ...rect(element),
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
          directText: Array.from(element.childNodes).some(
            (node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()),
          ),
        }));
      const textSelectors = "h2, h3, h4, p, label, button, summary, .cost-line, .compound-recipe";
      const textNodes = Array.from(content.querySelectorAll<HTMLElement>(textSelectors))
        .filter(visible)
        .map((element) => ({
          text: element.innerText || element.getAttribute("aria-label") || "",
          tag: element.tagName.toLowerCase(),
          ...rect(element),
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
        }));
      return {
        viewportWidth: document.documentElement.clientWidth,
        documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        panel: {
          ...rect(panel),
          clientWidth: panel.clientWidth,
          scrollWidth: panel.scrollWidth,
        },
        content: {
          ...contentBounds,
          clientWidth: content.clientWidth,
          scrollWidth: content.scrollWidth,
        },
        descendants,
        textNodes,
      };
    },
    { panelSelector, contentSelector },
  );

  const issues: string[] = [];
  if (result.documentWidth > result.viewportWidth)
    issues.push(`${label} document width ${result.documentWidth} > ${result.viewportWidth}`);
  if (result.panel.left < -1 || result.panel.right > result.viewportWidth + 1)
    issues.push(`${label} tab panel exceeds the viewport`);
  if (result.panel.scrollWidth > result.panel.clientWidth + 1)
    issues.push(`${label} tab panel has internal horizontal overflow`);
  if (result.content.left < result.panel.left - 1 || result.content.right > result.panel.right + 1)
    issues.push(`${label} content page exceeds its tab panel`);
  if (result.content.scrollWidth > result.content.clientWidth + 1)
    issues.push(`${label} content page has internal horizontal overflow`);

  for (const element of result.descendants) {
    const target = `${element.tag}.${element.className || "(no class)"} ${element.text}`.trim();
    if (element.left < result.content.left - 2 || element.right > result.content.right + 2)
      issues.push(`${label} element outside content: ${target}`);
    if (
      element.directText &&
      element.clientWidth > 0 &&
      element.scrollWidth > element.clientWidth + 2
    )
      issues.push(`${label} text overflow: ${target}`);
  }
  for (const element of result.textNodes) {
    if (element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 2)
      issues.push(`${label} ${element.tag} text overflow: ${element.text}`);
  }
  return issues;
}

test("P-56 Hydrogen and Diesel pages fit every locale, theme, and viewport @p56-resource-compound-visual @presentation", async ({
  page,
}, testInfo) => {
  test.setTimeout(300_000);
  await page.setViewportSize(VIEWPORTS[0]);
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261009&testLocale=en&economyFixture=storage-all");
  await page.getByLabel("Pioneer name").fill("P-56 Resource Compound Matrix");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { notificationsEnabled: false },
    }),
  );
  await expect(page.locator('[data-testid="game-notification"]')).toHaveCount(0);

  const captures = new Set(["en/terminal/1280", "de/light/390", "fr/space/320"]);
  const issues: string[] = [];
  const hydrogenPanel = page.locator("#panel-resources-hydrogen");
  const hydrogen = hydrogenPanel;
  const dieselPanel = page.locator("#panel-compounds-diesel");
  const diesel = dieselPanel.locator('[data-compound-id="diesel"]');

  for (const locale of LOCALE_IDS) {
    for (const themeId of THEME_IDS) {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await setPresentation(page, locale, themeId);

        await page.locator("#tab-hydrogen").click();
        const hydrogenTab = page.locator("#tab-resources-hydrogen");
        await expect(hydrogenTab, `${locale}/${themeId} Hydrogen tab`).toBeVisible();
        await hydrogenTab.click();
        await expect(hydrogenPanel, `${locale}/${themeId} Hydrogen pane`).toBeVisible();
        await expect(hydrogenTab).toHaveAttribute("aria-selected", "true");
        await expect(hydrogen.locator(".pane-heading h2")).toHaveText(
          economyGoodName(locale, "hydrogen"),
        );
        await expect(hydrogen.locator(".hydrogen-hero .stock-readout > strong")).toBeVisible();
        await expect(hydrogen.locator(".hydrogen-storage-card .cost-line")).toBeVisible();
        await expect(hydrogen.locator(".hydrogen-sale-controls .card-copy strong")).toBeVisible();
        await expect(hydrogen.locator(".collect-button")).toBeVisible();
        await expandAllDetails(hydrogen);
        const compressorCopy = hydrogen.locator(
          ".hydrogen-autobuyer-section .autobuyer-card .card-copy",
        );
        await expect(compressorCopy, `${locale}/${themeId} Hydrogen Compressor copy`).toBeVisible();
        if (viewport.width <= 390) {
          const compressorCopyBounds = await compressorCopy.boundingBox();
          expect(
            compressorCopyBounds,
            `${locale}/${themeId} Compressor copy bounds`,
          ).not.toBeNull();
          expect(
            compressorCopyBounds!.width,
            `${locale}/${themeId}/${viewport.width}px Compressor copy minimum width`,
          ).toBeGreaterThanOrEqual(120);
        }

        const key = `${locale}/${themeId}/${viewport.width}`;
        if (captures.has(key))
          await capture(
            page,
            testInfo,
            `p56-resource-hydrogen-${locale}-${themeId}-${viewport.width}.png`,
          );
        issues.push(
          ...(await collectLayoutIssues(
            page,
            "#panel-resources-hydrogen",
            "#panel-resources-hydrogen",
            `${locale}/${themeId}/${viewport.width}px Hydrogen`,
          )),
        );

        await page.locator("#tab-compounds").click();
        const dieselTab = page.locator("#tab-compounds-diesel");
        await expect(dieselTab, `${locale}/${themeId} Diesel tab`).toBeVisible();
        await dieselTab.click();
        await expect(dieselPanel, `${locale}/${themeId} Diesel pane`).toBeVisible();
        await expect(dieselTab).toHaveAttribute("aria-selected", "true");
        await expect(diesel.locator(".pane-heading h2")).toHaveText(
          economyGoodName(locale, "diesel"),
        );
        await expect(diesel.locator(".hydrogen-hero .stock-readout > strong")).toBeVisible();
        await expect(diesel.locator(".compound-recipe")).toBeVisible();
        await expect(diesel.locator(".compound-create-row")).toBeVisible();
        await expect(diesel.locator(".compound-create-controls")).toBeVisible();
        await expect(diesel.locator('[data-testid="compound-diesel-preview"]')).toBeVisible();
        await expect(diesel.locator(".hydrogen-storage-card .cost-line")).toBeVisible();
        await expect(diesel.locator(".hydrogen-sale-controls .card-copy strong")).toBeVisible();
        await expandAllDetails(diesel);

        if (captures.has(key))
          await capture(
            page,
            testInfo,
            `p56-compound-diesel-${locale}-${themeId}-${viewport.width}.png`,
          );
        issues.push(
          ...(await collectLayoutIssues(
            page,
            "#panel-compounds-diesel",
            '[data-compound-id="diesel"]',
            `${locale}/${themeId}/${viewport.width}px Diesel Compound`,
          )),
        );
      }
    }
  }

  expect(
    issues.slice(0, 30),
    `${issues.length} layout/text issue(s) found; first findings:\n${issues.slice(0, 30).join("\n")}`,
  ).toEqual([]);
});
