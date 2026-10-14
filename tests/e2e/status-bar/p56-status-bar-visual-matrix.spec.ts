import type { Page, TestInfo } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { topStatusText } from "../../../src/i18n/topStatusMessages";

const VIEWPORTS = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

async function capture(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const path = testInfo.outputPath(name);
  await page.screenshot({ path, fullPage: true, animations: "disabled", caret: "hide" });
  await testInfo.attach(name, { path, contentType: "image/png" });
}

async function expectTooltipWithinViewport(
  page: Page,
  owner: ReturnType<Page["getByTestId"]>,
  focusSelector: string,
  description: string,
): Promise<void> {
  const focusTarget = owner.locator(focusSelector);
  await focusTarget.focus();
  const tooltip = owner.getByRole("tooltip");
  await expect(tooltip, `${description} tooltip is visible`).toBeVisible();
  const bounds = await tooltip.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, viewportWidth: window.innerWidth };
  });
  expect(
    bounds.left,
    `${description} tooltip extends left of the viewport: ${JSON.stringify(bounds)}`,
  ).toBeGreaterThanOrEqual(0);
  expect(
    bounds.right,
    `${description} tooltip extends right of the viewport: ${JSON.stringify(bounds)}`,
  ).toBeLessThanOrEqual(bounds.viewportWidth);
  await focusTarget.evaluate((element) => (element as HTMLElement).blur());
}

test("P-56 status metadata fits every locale, theme, and viewport @p56-status-visual @status-bar @presentation", async ({
  page,
}, testInfo) => {
  test.setTimeout(300_000);
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await expect(page.locator("[data-app-ready]")).toBeVisible();
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

  const captures = new Set(["en/terminal/1280", "de/light/390", "es/summer/320", "fr/space/320"]);
  const wholeGame = page.getByTestId("global-context-bar");
  const currentRun = page.getByTestId("run-status-bar");

  for (const locale of LOCALE_IDS) {
    for (const themeId of THEME_IDS) {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await page.evaluate(
          ({ locale, themeId }) => {
            window.miaplacidusTest!.dispatch({
              type: "settings.update",
              patch: { locale, themeId },
            });
          },
          { locale, themeId },
        );
        await expect(page.locator("html"), `${locale} document language`).toHaveAttribute(
          "lang",
          locale,
        );
        await expect(page.locator(".game-frame:not(.notification-portal)"), `${themeId} theme`).toHaveAttribute(
          "data-theme",
          themeId,
        );
        await expect(wholeGame, `${locale}/${themeId} whole-game status`).toHaveAttribute(
          "aria-label",
          topStatusText(locale, "globalContext"),
        );
        await expect(currentRun, `${locale}/${themeId} current-run status`).toHaveAttribute(
          "aria-label",
          topStatusText(locale, "region"),
        );
        for (const testId of [
          "global-stat-run-number",
          "top-stat-gp",
          "top-stat-ap",
          "location-status",
          "top-stat-time",
          "top-stat-cash",
          "top-stat-rp",
          "top-stat-cp",
          "top-stat-event",
        ]) {
          await expect(page.getByTestId(testId), `${locale}/${themeId} ${testId}`).toBeVisible();
        }

        const bounds = await page.evaluate(() => {
          const groups = Array.from(
            document.querySelectorAll<HTMLElement>(".global-context-bar, .top-status-bar"),
          );
          const groupBounds = groups.map((group) => {
            const groupRect = group.getBoundingClientRect();
            const children = Array.from(group.children).map((child) => {
              const card = child as HTMLElement;
              const cardRect = card.getBoundingClientRect();
              const labels = Array.from(card.querySelectorAll<HTMLElement>(".top-stat-label")).map(
                (label) => {
                  const rect = label.getBoundingClientRect();
                  return {
                    text: label.innerText,
                    left: rect.left,
                    right: rect.right,
                    clientWidth: label.clientWidth,
                    scrollWidth: label.scrollWidth,
                  };
                },
              );
              const values = Array.from(card.querySelectorAll<HTMLElement>(".top-stat-value")).map(
                (value) => {
                  const rect = value.getBoundingClientRect();
                  return {
                    text: value.innerText,
                    left: rect.left,
                    right: rect.right,
                    clientWidth: value.clientWidth,
                    scrollWidth: value.scrollWidth,
                  };
                },
              );
              const locationText = Array.from(
                card.querySelectorAll<HTMLElement>(
                  ".location-status-copy strong, .location-status-copy small",
                ),
              ).map((text) => {
                const rect = text.getBoundingClientRect();
                return {
                  text: text.innerText,
                  left: rect.left,
                  right: rect.right,
                  clientWidth: text.clientWidth,
                  scrollWidth: text.scrollWidth,
                };
              });
              return {
                id: card.dataset.testid ?? card.className,
                left: cardRect.left,
                right: cardRect.right,
                groupLeft: groupRect.left,
                groupRight: groupRect.right,
                labels,
                values,
                locationText,
                buttons: Array.from(card.querySelectorAll<HTMLElement>("button")).map((button) => {
                  const rect = button.getBoundingClientRect();
                  return {
                    name: button.getAttribute("aria-label") ?? button.innerText,
                    left: rect.left,
                    right: rect.right,
                  };
                }),
              };
            });
            const rect = group.getBoundingClientRect();
            return {
              name: group.dataset.testid ?? group.className,
              left: rect.left,
              right: rect.right,
              clientWidth: group.clientWidth,
              scrollWidth: group.scrollWidth,
              children,
            };
          });
          return {
            viewportWidth: document.documentElement.clientWidth,
            documentWidth: Math.max(
              document.documentElement.scrollWidth,
              document.body.scrollWidth,
            ),
            groups: groupBounds,
          };
        });

        expect(bounds.viewportWidth, `${viewport.width}px viewport`).toBe(viewport.width);
        expect(
          bounds.documentWidth,
          `${locale}/${themeId} document width at ${viewport.width}px`,
        ).toBeLessThanOrEqual(viewport.width);
        for (const group of bounds.groups) {
          expect(
            group.left,
            `${locale}/${themeId} ${group.name} starts in viewport`,
          ).toBeGreaterThanOrEqual(-1);
          expect(
            group.right,
            `${locale}/${themeId} ${group.name} ends in viewport`,
          ).toBeLessThanOrEqual(viewport.width + 1);
          expect(
            group.scrollWidth,
            `${locale}/${themeId} ${group.name} has no internal horizontal overflow`,
          ).toBeLessThanOrEqual(group.clientWidth + 1);
          for (const child of group.children) {
            const description = `${locale}/${themeId} ${child.id} at ${viewport.width}px`;
            expect(child.left, `${description} left edge`).toBeGreaterThanOrEqual(group.left - 1);
            expect(child.right, `${description} right edge`).toBeLessThanOrEqual(group.right + 1);
            for (const label of child.labels) {
              expect(label.left, `${description} label left: ${label.text}`).toBeGreaterThanOrEqual(
                child.left - 1,
              );
              expect(label.right, `${description} label right: ${label.text}`).toBeLessThanOrEqual(
                child.right + 1,
              );
              expect(
                label.scrollWidth,
                `${description} label text fits: ${label.text}`,
              ).toBeLessThanOrEqual(label.clientWidth + 2);
            }
            for (const value of child.values) {
              expect(value.left, `${description} value left: ${value.text}`).toBeGreaterThanOrEqual(
                child.left - 1,
              );
              expect(value.right, `${description} value right: ${value.text}`).toBeLessThanOrEqual(
                child.right + 1,
              );
              expect(
                value.scrollWidth,
                `${description} value text fits: ${value.text}`,
              ).toBeLessThanOrEqual(value.clientWidth + 2);
            }
            for (const text of child.locationText) {
              expect(text.left, `${description} location text left`).toBeGreaterThanOrEqual(
                child.left - 1,
              );
              expect(text.right, `${description} location text right`).toBeLessThanOrEqual(
                child.right + 1,
              );
            }
            for (const button of child.buttons) {
              expect(
                button.left,
                `${description} ${button.name} control left`,
              ).toBeGreaterThanOrEqual(child.left - 1);
              expect(
                button.right,
                `${description} ${button.name} control right`,
              ).toBeLessThanOrEqual(child.right + 1);
            }
          }
        }

        if (viewport.width <= 390) {
          await expectTooltipWithinViewport(
            page,
            page.getByTestId("location-status"),
            ".location-status-summary",
            `${locale}/${themeId} location at ${viewport.width}px`,
          );
          await expectTooltipWithinViewport(
            page,
            page.getByTestId("top-stat-event"),
            ".top-stat-value",
            `${locale}/${themeId} Event at ${viewport.width}px`,
          );
        }

        const key = `${locale}/${themeId}/${viewport.width}`;
        if (captures.has(key)) {
          if (key === "de/light/390" || key === "fr/space/320") {
            await page.getByTestId("location-status").locator(".location-status-summary").focus();
            await expect(page.getByTestId("location-status").getByRole("tooltip")).toBeVisible();
          }
          await capture(page, testInfo, `p56-status-${locale}-${themeId}-${viewport.width}.png`);
          await page
            .getByTestId("location-status")
            .locator(".location-status-summary")
            .evaluate((element) => (element as HTMLElement).blur());
        }
      }
    }
  }
});
