import { type Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { THEME_IDS, type ThemeId } from "../../../src/content/themes";
import { cosmicRipText } from "../../../src/i18n/cosmicRipMessages";

const VIEWPORTS = [
  { width: 1280, height: 900, key: "desktop" },
  { width: 390, height: 844, key: "phone" },
  { width: 320, height: 740, key: "narrow" },
] as const;

const PAGES = [
  { id: "situation", headingId: "cosmic-rip-situation-title", copyKey: "situationTitle" },
  { id: "scanner-array", headingId: "cosmic-rip-scan-title", copyKey: "scannerArrayTitle" },
  { id: "rip", headingId: null, copyKey: "title" },
] as const;

async function dismissTutorialIfVisible(page: Page): Promise<void> {
  const dismissButton = page.getByRole("button", { name: "No thanks", exact: true });
  if (await dismissButton.isVisible()) await dismissButton.click();
}

async function setPresentation(
  page: import("@playwright/test").Page,
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

test("Cosmic Rip pages fit every locale, theme, and target viewport @p56-visual-matrix", async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await dismissTutorialIfVisible(page);
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  // The late-game fixture earns many achievements; silence their transient
  // notices so these page-layout captures stay focused and deterministic.
  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { notificationsEnabled: false },
    }),
  );
  await expect(page.locator('[data-testid="game-notification"]')).toHaveCount(0);
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });

  const reviewed = new Set(["en:terminal:desktop", "fr:frosty:phone", "de:space:narrow"]);
  for (const locale of LOCALE_IDS) {
    for (const theme of THEME_IDS) {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await setPresentation(page, locale, theme);
        await page.locator("#tab-cosmic-rip").click();

        const pane = page.getByTestId("cosmic-rip-pane");
        await expect(pane).toBeVisible();
        await expect(pane.locator(":scope > .panel-heading .game-page-title")).toHaveText(
          cosmicRipText(locale).title,
        );

        for (const item of PAGES) {
          const copy = cosmicRipText(locale);
          const heading = copy[item.copyKey];
          const tab = page.locator(`#tab-cosmic-rip-${item.id}`);
          await expect(tab).toBeVisible();
          await tab.click();
          await expect(tab).toHaveAttribute("aria-selected", "true");

          const activePanel = page.locator(`#panel-cosmic-rip-${item.id}`);
          await expect(activePanel).toBeVisible();
          if (item.headingId) {
            await expect(activePanel.locator(`#${item.headingId}`)).toHaveText(heading);
          } else {
            await expect(activePanel).toHaveAttribute("aria-labelledby", tab.id);
            await expect(activePanel.locator("#cosmic-rip-tech-title")).toHaveText(
              copy.technologies,
            );
          }

          const geometry = await page.evaluate((panelId) => {
            const rect = (element: Element) => {
              const { left, right, top, bottom } = element.getBoundingClientRect();
              return { left, right, top, bottom };
            };
            const root = document.querySelector<HTMLElement>('[data-testid="cosmic-rip-pane"]');
            const panel = document.getElementById(panelId);
            const visibleControls = Array.from(
              panel?.querySelectorAll<HTMLElement>("button, input, output, progress") ?? [],
            )
              .filter((element) => element.getClientRects().length > 0)
              .map(rect);
            return {
              viewportWidth: window.innerWidth,
              documentWidth: Math.max(
                document.documentElement.scrollWidth,
                document.body.scrollWidth,
              ),
              root: root ? rect(root) : null,
              panel: panel ? rect(panel) : null,
              visibleControls,
            };
          }, `panel-cosmic-rip-${item.id}`);

          expect(
            geometry.documentWidth,
            `${locale}/${theme}/${viewport.width} document width`,
          ).toBeLessThanOrEqual(viewport.width);
          for (const [name, bounds] of Object.entries({
            root: geometry.root,
            panel: geometry.panel,
          })) {
            expect(bounds, `${name} exists`).not.toBeNull();
            expect(
              bounds!.left,
              `${locale}/${theme}/${viewport.width} ${item.id} ${name} left`,
            ).toBeGreaterThanOrEqual(-1);
            expect(
              bounds!.right,
              `${locale}/${theme}/${viewport.width} ${item.id} ${name} right`,
            ).toBeLessThanOrEqual(viewport.width + 1);
          }
          for (const [index, bounds] of geometry.visibleControls.entries()) {
            expect(
              bounds.left,
              `${locale}/${theme}/${viewport.width} ${item.id} control ${index} left`,
            ).toBeGreaterThanOrEqual(-1);
            expect(
              bounds.right,
              `${locale}/${theme}/${viewport.width} ${item.id} control ${index} right`,
            ).toBeLessThanOrEqual(viewport.width + 1);
          }

          if (item.id === "rip" && reviewed.has(`${locale}:${theme}:${viewport.key}`)) {
            await captureVisualCheckpoint(
              page,
              testInfo,
              `p56-cosmic-rip-${locale}-${theme}-${viewport.key}`,
            );
          }
        }
      }
    }
  }
});
