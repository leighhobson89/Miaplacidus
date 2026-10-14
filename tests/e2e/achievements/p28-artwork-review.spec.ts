import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";

test("achievement badge artwork stays within its cards on desktop and phone @p28-artwork-review", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.locator("#tab-settings-achievements").click();
  const pane = page.getByTestId("achievements-pane");
  const cards = pane.locator("[data-achievement-id]");
  const badges = pane.locator("[data-achievement-badge]");
  await expect(cards).toHaveCount(70);
  await expect(badges).toHaveCount(70);

  for (const themeId of THEME_IDS) {
    for (const view of [
      { width: 1280, height: 900 },
      { width: 390, height: 844 },
    ] as const) {
      await page.setViewportSize({ width: view.width, height: view.height });
      await page.evaluate((nextTheme) => {
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: "en", themeId: nextTheme },
        });
      }, themeId);
      await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", themeId);

      const bounds = await page.evaluate(() => {
        const paneElement = document.querySelector<HTMLElement>(
          "[data-testid='achievements-pane']",
        );
        if (!paneElement) throw new Error("Achievement pane is missing.");
        const paneRect = paneElement.getBoundingClientRect();
        const background = getComputedStyle(
          document.querySelector(".game-frame:not(.notification-portal)")!,
        ).getPropertyValue("--bg-color");
        const badges = Array.from(
          paneElement.querySelectorAll<SVGElement>("[data-achievement-badge]"),
        );
        return {
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          background: background.trim(),
          badges: badges.map((badge) => {
            const rect = badge.getBoundingClientRect();
            const cardRect = badge.closest("[data-achievement-id]")!.getBoundingClientRect();
            const frame = badge.querySelector("polygon")!;
            return {
              hidden: badge.getAttribute("aria-hidden") === "true",
              focusable: badge.getAttribute("focusable"),
              positiveSize: rect.width > 0 && rect.height > 0,
              insideCard:
                rect.left >= cardRect.left &&
                rect.right <= cardRect.right &&
                rect.top >= cardRect.top &&
                rect.bottom <= cardRect.bottom,
              stroke: getComputedStyle(frame).stroke,
              fill: getComputedStyle(frame).fill,
            };
          }),
          paneWithinViewport: paneRect.left >= 0 && paneRect.right <= window.innerWidth,
        };
      });
      expect(bounds.documentWidth).toBeLessThanOrEqual(bounds.viewportWidth);
      expect(bounds.paneWithinViewport).toBe(true);
      expect(bounds.background).not.toBe("");
      expect(bounds.badges).toHaveLength(70);
      expect(bounds.badges.every((badge) => badge.hidden && badge.focusable === "false")).toBe(
        true,
      );
      expect(bounds.badges.every((badge) => badge.positiveSize && badge.insideCard)).toBe(true);
      expect(
        bounds.badges.every(
          (badge) =>
            badge.stroke !== "none" && badge.fill !== "none" && badge.stroke !== bounds.background,
        ),
      ).toBe(true);

      if (
        (themeId === "terminal" && view.width === 1280) ||
        (themeId === "light" && view.width === 390) ||
        (themeId === "supernova" && view.width === 390)
      ) {
        const name = `p28-achievement-badges-${themeId}-${view.width}.png`;
        const image = await page.screenshot({
          path: testInfo.outputPath(name),
          fullPage: true,
          animations: "disabled",
        });
        await testInfo.attach(name, {
          body: image,
          contentType: "image/png",
        });
      }
    }
  }

  for (const locale of LOCALE_IDS) {
    await page.evaluate((nextLocale) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale },
      });
    }, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(badges).toHaveCount(70);
  }
});
