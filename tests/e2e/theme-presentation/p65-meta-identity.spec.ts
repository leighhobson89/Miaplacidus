import type { Page, TestInfo } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { THEME_IDS, type ThemeId } from "../../../src/content/themes";
import { cosmicRipText } from "../../../src/i18n/cosmicRipMessages";

interface MetaPageCheck {
  readonly name: string;
  readonly tabId: string;
  readonly paneSelector: string;
  readonly expectedTitle: string;
  readonly illustration: string;
}

async function checkMetaPages(
  page: Page,
  testInfo: TestInfo,
  mainTabId: string,
  pages: readonly MetaPageCheck[],
): Promise<void> {
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    const referenceTitleSize = await page
      .locator("#panel-resources-hydrogen .pane-heading h2")
      .evaluate((element) => getComputedStyle(element).fontSize);
    for (const item of pages) {
      await page.locator(`#${mainTabId}`).click();
      await page.locator(`#${item.tabId}`).click();
      const pane = page.locator(item.paneSelector);
      const headings = pane.locator("h2:visible");
      const artworkRows = pane.locator(".page-artwork-row:visible");
      await expect(headings, `${item.name} should have exactly one visible heading`).toHaveCount(1);
      await expect(headings).toHaveText(item.expectedTitle);
      if (item.name === "cosmic-rip") {
        await expect(
          pane.getByRole("heading", { name: item.expectedTitle, exact: true }),
          "Cosmic Rip should have only one visible heading for its shared page title",
        ).toHaveCount(1);
      }
      await expect(headings, `${item.name} should use the shared page-title treatment`).toHaveClass(
        /game-page-title/,
      );
      await expect(artworkRows, `${item.name} should have exactly one artwork row`).toHaveCount(1);
      const illustration = artworkRows.locator(
        `[data-celestial-illustration='${item.illustration}']`,
      );
      await expect(illustration, `${item.name} should use ${item.illustration} art`).toHaveCount(1);
      await expect(illustration).toBeVisible();

      const titleSize = await headings.evaluate((element) => getComputedStyle(element).fontSize);
      expect(titleSize, `${item.name} title size at ${viewport.width}px`).toBe(referenceTitleSize);
      const contentBounds = await pane.evaluate((element) => {
        const bounds = Array.from(element.querySelectorAll<HTMLElement>("h2, .page-artwork-row"))
          .filter((child) => child.getClientRects().length > 0)
          .map((child) => {
            const rect = child.getBoundingClientRect();
            return { left: rect.left, right: rect.right };
          });
        return {
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
          bounds,
        };
      });
      expect(
        contentBounds.documentWidth,
        `${item.name} document width at ${viewport.width}px`,
      ).toBeLessThanOrEqual(viewport.width);
      for (const bounds of contentBounds.bounds) {
        expect(bounds.left, `${item.name} content left edge`).toBeGreaterThanOrEqual(-1);
        expect(bounds.right, `${item.name} content right edge`).toBeLessThanOrEqual(
          viewport.width + 1,
        );
      }
      await page.screenshot({
        path: testInfo.outputPath(`p65-${item.name}-${viewport.width}.png`),
      });
    }
  }
}

async function setCosmicRipPresentation(
  page: Page,
  locale: LocaleId,
  theme: ThemeId,
): Promise<void> {
  await page.evaluate(
    ({ nextLocale, nextTheme }) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, themeId: nextTheme },
      });
    },
    { nextLocale: locale, nextTheme: theme },
  );
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", theme);
}

async function visibleTabName(page: Page, tabId: string): Promise<string> {
  return page.locator(`#${tabId}`).evaluate((element) => {
    const copy = element.cloneNode(true) as HTMLElement;
    copy.querySelector(".attention-badge")?.remove();
    return copy.innerText.trim();
  });
}

test("P-65 Galactic child pages share title and artwork identity at desktop and phone widths @p65-meta-identity", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-megastructure-route");
  await checkMetaPages(page, testInfo, "tab-galaxy", [
    {
      name: "galactic-market",
      tabId: "tab-galactic-market",
      paneSelector: ".galactic-market-pane",
      expectedTitle: "Galactic Market",
      illustration: "asteroid",
    },
    {
      name: "galactic-casino",
      tabId: "tab-galactic-casino",
      paneSelector: "[data-testid='galactic-casino-pane']",
      expectedTitle: "Galactic Casino",
      illustration: "star-system",
    },
    {
      name: "ascendency-perks",
      tabId: "tab-galactic-ascendency-perks",
      paneSelector: "[data-testid='ascendency-pane']",
      expectedTitle: "Ascendency Perks",
      illustration: "megastructure",
    },
    {
      name: "megastructures",
      tabId: "tab-galactic-megastructures",
      paneSelector: "[data-testid='megastructure-pane']",
      expectedTitle: "Megastructures",
      illustration: "megastructure",
    },
  ]);
});

test("P-65 Cosmic Rip uses one matching title and artwork row at desktop and phone widths @p65-meta-identity", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.cosmicRip.unlocked),
    )
    .toBe(true);
  await checkMetaPages(page, testInfo, "tab-cosmic-rip", [
    {
      name: "cosmic-rip",
      tabId: "tab-cosmic-rip-rip",
      paneSelector: "[data-testid='cosmic-rip-pane']",
      expectedTitle: "Cosmic Rip",
      illustration: "cosmic-rip",
    },
  ]);
});

test("P-65 Cosmic Rip child pages keep localized identity across themes and widths @p65-cosmic-rip-matrix", async ({
  page,
}) => {
  test.setTimeout(300_000);
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const appKeys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of appKeys) localStorage.removeItem(key);
    sessionStorage.removeItem("miaplacidus:test-storage-cleared");
  });
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.cosmicRip.unlocked),
    )
    .toBe(true);

  const viewports = [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ] as const;
  const cosmicRipPages = [
    {
      id: "cosmic-rip-situation",
      labelKey: "situationTitle",
      headingId: "cosmic-rip-situation-title",
    },
    {
      id: "cosmic-rip-scanner-array",
      labelKey: "scannerArrayTitle",
      headingId: "cosmic-rip-scan-title",
    },
    {
      id: "cosmic-rip-rip",
      labelKey: "title",
      headingId: null,
    },
  ] as const;
  const documentOverflowCases: string[] = [];
  const documentOverflowSamples: string[] = [];

  for (const locale of LOCALE_IDS) {
    const copy = cosmicRipText(locale);
    for (const theme of THEME_IDS) {
      await setCosmicRipPresentation(page, locale, theme);
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.locator("#tab-cosmic-rip").click();

        const pane = page.getByTestId("cosmic-rip-pane");
        const parentTitle = pane.locator(":scope > .panel-heading .game-page-title");
        const artworkRow = pane.locator(":scope > .page-artwork-row");
        const hydrogenTitleSize = await page
          .locator("#panel-resources-hydrogen .pane-heading h2")
          .evaluate((element) => getComputedStyle(element).fontSize);
        await expect(parentTitle, `${locale}/${theme} Cosmic Rip parent title`).toHaveText(
          copy.title,
        );
        await expect(
          parentTitle,
          `${locale}/${theme} Cosmic Rip shared title treatment`,
        ).toHaveClass(/game-page-title/);
        await expect(parentTitle, `${locale}/${theme} Cosmic Rip title scale`).toHaveCSS(
          "font-size",
          hydrogenTitleSize,
        );
        await expect(artworkRow, `${locale}/${theme} Cosmic Rip artwork row`).toHaveCount(1);
        await expect(
          artworkRow.locator('[data-celestial-illustration="cosmic-rip"]'),
        ).toBeVisible();

        for (const cosmicRipPage of cosmicRipPages) {
          const tab = page.locator(`#tab-${cosmicRipPage.id}`);
          const expectedPageName = copy[cosmicRipPage.labelKey];
          await expect(tab, `${locale}/${theme} ${cosmicRipPage.id} tab`).toBeVisible();
          await expect
            .poll(() => visibleTabName(page, `tab-${cosmicRipPage.id}`))
            .toBe(expectedPageName);
          await tab.click();
          await expect(tab).toHaveAttribute("aria-selected", "true");
          await expect(tab).toHaveAttribute("aria-controls", `panel-${cosmicRipPage.id}`);

          const activePage = pane.locator(`#panel-${cosmicRipPage.id}`);
          await expect(activePage, `${locale}/${theme} ${cosmicRipPage.id} page`).toBeVisible();
          if (cosmicRipPage.headingId) {
            await expect(
              activePage.locator(`#${cosmicRipPage.headingId}`),
              `${locale}/${theme} ${cosmicRipPage.id} page heading`,
            ).toHaveText(expectedPageName);
          } else {
            await expect(activePage).toHaveAttribute(
              "aria-labelledby",
              `tab-${cosmicRipPage.id}`,
            );
            const tabLabel = page.locator(`#tab-${cosmicRipPage.id}`);
            await expect(activePage).toHaveAccessibleName(
              (await tabLabel.getAttribute("aria-label")) ?? expectedPageName,
            );
            await expect(
              pane.getByRole("heading", { name: expectedPageName, exact: true }),
              `${locale}/${theme} Cosmic Rip uses its shared page title once`,
            ).toHaveCount(1);
          }

          const bounds = await pane.evaluate((element, activePageId) => {
            const page = element.querySelector<HTMLElement>(`#panel-${activePageId}`);
            if (!page) throw new Error(`Cosmic Rip child page ${activePageId} should render`);
            const paneBounds = element.getBoundingClientRect();
            const pageBounds = page.getBoundingClientRect();
            const titleBounds = element
              .querySelector<HTMLElement>(":scope > .panel-heading .game-page-title")!
              .getBoundingClientRect();
            const artworkBounds = element
              .querySelector<HTMLElement>(":scope > .page-artwork-row")!
              .getBoundingClientRect();
            return {
              paneLeft: paneBounds.left,
              paneRight: paneBounds.right,
              paneClientWidth: element.clientWidth,
              paneScrollWidth: element.scrollWidth,
              pageLeft: pageBounds.left,
              pageRight: pageBounds.right,
              titleLeft: titleBounds.left,
              titleRight: titleBounds.right,
              artworkLeft: artworkBounds.left,
              artworkRight: artworkBounds.right,
              documentWidth: document.documentElement.scrollWidth,
              viewportWidth: document.documentElement.clientWidth,
              overflowers: Array.from(document.querySelectorAll<HTMLElement>(".game-frame:not(.notification-portal) *"))
                .map((child) => {
                  const rect = child.getBoundingClientRect();
                  return {
                    tag: child.tagName,
                    className:
                      typeof child.className === "string"
                        ? child.className
                        : (child.getAttribute("class") ?? ""),
                    left: rect.left,
                    right: rect.right,
                  };
                })
                .filter(
                  (child) =>
                    child.left < -1 || child.right > document.documentElement.clientWidth + 1,
                )
                .slice(0, 6),
            };
          }, cosmicRipPage.id);
          const label = `${locale}/${theme} ${cosmicRipPage.id} at ${viewport.width}px`;
          expect(bounds.paneLeft, `${label} pane left`).toBeGreaterThanOrEqual(-1);
          expect(bounds.paneRight, `${label} pane right`).toBeLessThanOrEqual(viewport.width + 1);
          expect(bounds.paneScrollWidth, `${label} pane content overflow`).toBeLessThanOrEqual(
            bounds.paneClientWidth + 1,
          );
          expect(bounds.pageLeft, `${label} page left`).toBeGreaterThanOrEqual(-1);
          expect(bounds.pageRight, `${label} page right`).toBeLessThanOrEqual(viewport.width + 1);
          expect(bounds.titleLeft, `${label} title left`).toBeGreaterThanOrEqual(-1);
          expect(bounds.titleRight, `${label} title right`).toBeLessThanOrEqual(viewport.width + 1);
          expect(bounds.artworkLeft, `${label} artwork left`).toBeGreaterThanOrEqual(-1);
          expect(bounds.artworkRight, `${label} artwork right`).toBeLessThanOrEqual(
            viewport.width + 1,
          );
          if (bounds.documentWidth > bounds.viewportWidth) {
            documentOverflowCases.push(label);
            if (documentOverflowSamples.length < 3) {
              documentOverflowSamples.push(
                `${label}: ${bounds.documentWidth}px > ${bounds.viewportWidth}px; overflowers=${JSON.stringify(bounds.overflowers)}`,
              );
            }
          }
        }
      }
    }
  }
  expect(
    documentOverflowCases.length,
    `Cosmic Rip child pages should not overflow any viewport; samples: ${documentOverflowSamples.join(" | ")}`,
  ).toBe(0);
});
