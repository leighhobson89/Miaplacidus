import { dismissTutorialOfferIfPresent, expect, test } from "../_harness/fixtures";
import { THEME_IDS } from "../../../src/content/themes";

async function startPhilosophyChoiceFixture(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("miaplacidus:fixture-cleared") === "yes") return;
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
    sessionStorage.setItem("miaplacidus:fixture-cleared", "yes");
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-telescope");
  await page.getByLabel("Pioneer name").fill("P-28 Philosophy Art");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await dismissTutorialOfferIfPresent(page);

  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();
  await page.getByRole("button", { name: "Build Space Telescope", exact: true }).click();
  await page.getByRole("button", { name: "Study Stars", exact: true }).click();
  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "timer.complete",
        timerId: "survey:star-study",
      }),
    ),
  ).toBe(true);
  await expect(page.getByTestId("philosophy-choice")).toBeVisible();
}

test("philosophy path artwork fits every theme on desktop and phone @p28-artwork-review", async ({
  page,
}, testInfo) => {
  await startPhilosophyChoiceFixture(page);
  const dialog = page.getByTestId("philosophy-choice");
  const expectedPaths = ["constructor", "supremacist", "voidborn", "expansionist"];

  for (const themeId of THEME_IDS) {
    for (const viewport of [
      { width: 1280, height: 720 },
      { width: 390, height: 844 },
    ] as const) {
      await page.setViewportSize(viewport);
      await dialog.evaluate((element) => {
        element.scrollTop = 0;
      });
      await page.evaluate((nextTheme) => {
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { themeId: nextTheme },
        });
      }, themeId);
      await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", themeId);
      const measurements = await dialog.evaluate((element) => {
        const dialogRect = element.getBoundingClientRect();
        const frameStyle = getComputedStyle(document.querySelector(".game-frame:not(.notification-portal)")!);
        return {
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          dialogLeft: dialogRect.left,
          dialogRight: dialogRect.right,
          dialogScrollsVertically: element.scrollHeight > element.clientHeight,
          backgroundToken: frameStyle.getPropertyValue("--bg-color").trim(),
          panelToken: frameStyle.getPropertyValue("--panel").trim(),
          art: Array.from(element.querySelectorAll<SVGElement>("[data-philosophy-art]")).map(
            (svg) => {
              const rect = svg.getBoundingClientRect();
              const cardRect = svg.closest(".philosophy-choice-card")!.getBoundingClientRect();
              const orbit = svg.querySelector(".philosophy-art-orbit")!;
              const mark = svg.querySelector(".philosophy-art-mark")!;
              const coloredDot = svg.querySelector("circle[fill]")!;
              return {
                id: svg.getAttribute("data-philosophy-art"),
                width: rect.width,
                height: rect.height,
                insideCard:
                  rect.left >= cardRect.left &&
                  rect.right <= cardRect.right &&
                  rect.top >= cardRect.top &&
                  rect.bottom <= cardRect.bottom,
                hiddenFromAssistiveTech: svg.getAttribute("aria-hidden") === "true",
                notFocusable: svg.getAttribute("focusable") === "false",
                orbitStroke: getComputedStyle(orbit).stroke,
                markStroke: getComputedStyle(mark).stroke,
                accentFill: getComputedStyle(coloredDot).fill,
              };
            },
          ),
        };
      });

      expect(measurements.documentWidth).toBeLessThanOrEqual(measurements.viewportWidth);
      expect(measurements.dialogLeft).toBeGreaterThanOrEqual(0);
      expect(measurements.dialogRight).toBeLessThanOrEqual(measurements.viewportWidth);
      expect(measurements.backgroundToken).not.toBe("");
      expect(measurements.panelToken).not.toBe("");
      if (viewport.width === 390) expect(measurements.dialogScrollsVertically).toBe(true);
      expect(measurements.art.map(({ id }) => id)).toEqual(expectedPaths);
      expect(
        measurements.art.every(
          (art) =>
            art.width > 0 &&
            art.height > 0 &&
            art.insideCard &&
            art.hiddenFromAssistiveTech &&
            art.notFocusable &&
            art.orbitStroke !== "none" &&
            art.markStroke !== "none" &&
            art.accentFill !== "none" &&
            !art.markStroke.includes("var(") &&
            !art.accentFill.includes("var("),
        ),
      ).toBe(true);

      if (
        (themeId === "terminal" && viewport.width === 1280) ||
        (themeId === "light" && viewport.width === 390) ||
        (themeId === "supernova" && viewport.width === 390)
      ) {
        const image = await dialog.screenshot({
          path: testInfo.outputPath(`p28-philosophy-choice-${themeId}-${viewport.width}.png`),
          animations: "disabled",
        });
        await testInfo.attach(`p28-philosophy-choice-${themeId}-${viewport.width}.png`, {
          body: image,
          contentType: "image/png",
        });
        if (viewport.width === 390) {
          const lastCard = dialog.locator(".philosophy-choice-card").last();
          await lastCard.scrollIntoViewIfNeeded();
          const lastCardBounds = await lastCard.evaluate((card) => {
            const cardRect = card.getBoundingClientRect();
            const dialogRect = card.closest("dialog")!.getBoundingClientRect();
            return {
              insideDialog:
                cardRect.top >= dialogRect.top &&
                cardRect.bottom <= dialogRect.bottom &&
                cardRect.left >= dialogRect.left &&
                cardRect.right <= dialogRect.right,
            };
          });
          expect(lastCardBounds.insideDialog).toBe(true);
          const bottomImage = await dialog.screenshot({
            path: testInfo.outputPath(`p28-philosophy-choice-${themeId}-390-bottom.png`),
            animations: "disabled",
          });
          await testInfo.attach(`p28-philosophy-choice-${themeId}-390-bottom.png`, {
            body: bottomImage,
            contentType: "image/png",
          });
        }
      }
    }
  }
});
