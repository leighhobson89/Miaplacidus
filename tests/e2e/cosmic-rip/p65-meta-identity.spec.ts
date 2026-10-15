import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { checkMetaPages } from "../_harness/p65-meta-page-identity";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { THEME_IDS, type ThemeId } from "../../../src/content/themes";
import { cosmicRipText } from "../../../src/i18n/cosmicRipMessages";

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
  await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute(
    "data-theme",
    theme,
  );
}

async function visibleTabName(page: Page, tabId: string): Promise<string> {
  return page.locator(`#${tabId}`).evaluate((element) => {
    const copy = element.cloneNode(true) as HTMLElement;
    copy.querySelector(".attention-badge")?.remove();
    return copy.innerText.trim();
  });
}

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
            await expect(activePage).toHaveAttribute("aria-labelledby", `tab-${cosmicRipPage.id}`);
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
              overflowers: Array.from(
                document.querySelectorAll<HTMLElement>(".game-frame:not(.notification-portal) *"),
              )
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
