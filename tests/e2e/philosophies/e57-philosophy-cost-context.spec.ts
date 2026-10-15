import { expect, test } from "../_harness/fixtures";
import type { TestInfo } from "@playwright/test";
import { LOCALE_IDS, PHILOSOPHY_IDS, type LocaleId } from "../../../src/content/ids";
import { SCIENCE_BUILDINGS } from "../../../src/content/economy";
import { PHILOSOPHY_PATHS } from "../../../src/content/philosophy";
import { TECHNOLOGY_DESCRIPTIONS } from "../../../src/content/technologyDescriptions";
import { TECHNOLOGY_NAMES } from "../../../src/content/technologyNames";
import { philosophyText } from "../../../src/i18n/philosophyMessages";
import { economyLabel } from "../../../src/i18n/economyMessages";

const VIEWPORTS = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
] as const;

async function startEconomyFixture(
  page: import("@playwright/test").Page,
  fixture: "space-telescope" | "storage-all",
  pioneer: string,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill(pioneer);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => typeof window.miaplacidusTest?.dispatch === "function"))
    .toBe(true);
}

async function setLocale(page: import("@playwright/test").Page, locale: LocaleId): Promise<void> {
  await page.evaluate((nextLocale: LocaleId) => {
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: nextLocale },
    });
  }, locale);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

async function expectNoHorizontalOverflow(
  element: import("@playwright/test").Locator,
  context: string,
): Promise<void> {
  const dimensions = await element.evaluate((node) => ({
    clientWidth: node.clientWidth,
    scrollWidth: node.scrollWidth,
  }));
  expect(dimensions.scrollWidth, `${context} has no horizontal text overflow`).toBeLessThanOrEqual(
    dimensions.clientWidth + 1,
  );
}

async function expectInsideViewport(
  element: import("@playwright/test").Locator,
  width: number,
  context: string,
): Promise<void> {
  const bounds = await element.boundingBox();
  expect(bounds, `${context} has rendered bounds`).not.toBeNull();
  expect(bounds!.x, `${context} stays inside the viewport's left edge`).toBeGreaterThanOrEqual(-1);
  expect(
    bounds!.x + bounds!.width,
    `${context} stays inside the viewport's right edge`,
  ).toBeLessThanOrEqual(width + 1);
}

test("Philosophy choice and selected-path costs fit all phone locales @e57-philosophy-modal @ui @philosophies", async ({
  page,
}, testInfo: TestInfo) => {
  test.setTimeout(180_000);
  await startEconomyFixture(page, "space-telescope", "E-57 Philosophy Modal Pioneer");
  await page.locator("#tab-space-mining").click();
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

  const modal = page.getByTestId("philosophy-choice");
  await expect(modal).toBeVisible();
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    for (const locale of LOCALE_IDS) {
      await setLocale(page, locale);
      const copy = philosophyText(locale);
      await expect(modal.getByRole("heading", { level: 2 })).toHaveText(copy.choiceTitle);
      await expect(modal.locator(":scope > p").nth(1)).toHaveText(copy.choicePrompt);
      await expect(modal.locator(".philosophy-choice-card")).toHaveCount(PHILOSOPHY_IDS.length);
      await expectInsideViewport(modal, viewport.width, `${locale} Philosophy choice dialog`);
      await expectNoHorizontalOverflow(modal, `${locale} Philosophy choice dialog`);
      await expect(page.locator("dialog[open]")).toHaveCount(1);

      for (const [index, id] of PHILOSOPHY_IDS.entries()) {
        const card = modal.locator(".philosophy-choice-card").nth(index);
        await expect(card.locator(".philosophy-choice-card-heading h3")).toHaveText(
          copy.paths[id].name,
        );
        await expect(card.locator(".philosophy-choice-card-heading p")).toHaveText(
          copy.paths[id].summary,
        );
        await expectNoHorizontalOverflow(card, `${locale} ${id} Philosophy choice card`);
      }
      if (viewport.width === 320 && locale === "de") {
        await modal.screenshot({
          path: "test-results/e57-philosophy-choice-de-phone-review.png",
          animations: "disabled",
        });
        await testInfo.attach("e57-philosophy-choice-de-phone.png", {
          body: await modal.screenshot({ animations: "disabled" }),
          contentType: "image/png",
        });
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        viewport.width,
      );
    }
  }

  const expansionist = philosophyText(LOCALE_IDS.at(-1)!).paths.expansionist.name;
  await modal.getByRole("button", { name: expansionist, exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().permanent.philosophyId))
    .toBe("expansionist");

  let repeatablePurchased = false;
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    for (const locale of LOCALE_IDS) {
      await setLocale(page, locale);
      const copy = philosophyText(locale);
      await page.locator("#tab-research").click();
      await page.locator("#tab-research-philosophy").click();
      const philosophyPanel = page.locator("#panel-research-philosophy");
      await expect(page.locator('dialog[open], [role="dialog"]:visible')).toHaveCount(0);
      const ability = philosophyPanel.locator(".philosophy-ability");
      const abilityCost = ability.locator(":scope > p").nth(1);
      await expect(ability).toBeVisible();
      await expect(abilityCost).toContainText(copy.nextCost);
      await expectInsideViewport(ability, viewport.width, `${locale} Philosophy ability cost`);
      await expectNoHorizontalOverflow(ability, `${locale} Philosophy ability`);
      await expect(philosophyPanel.locator(".philosophy-repeatable")).toHaveCount(
        PHILOSOPHY_PATHS.expansionist.repeatables.length,
      );
      const repeatables = philosophyPanel.locator(".philosophy-repeatable");
      for (let index = 0; index < (await repeatables.count()); index += 1) {
        const card = repeatables.nth(index);
        const cost = card.locator(":scope > p").nth(2);
        await expect(cost, `${locale} Philosophy repeatable ${index + 1} cost`).toContainText(
          copy.nextCost,
        );
        await expectInsideViewport(
          card,
          viewport.width,
          `${locale} Philosophy repeatable ${index + 1}`,
        );
        await expectNoHorizontalOverflow(card, `${locale} Philosophy repeatable ${index + 1}`);
      }

      if (!repeatablePurchased && viewport.width === 320 && locale === LOCALE_IDS[0]) {
        const firstCard = repeatables.first();
        const firstCost = firstCard.locator(":scope > p").nth(2);
        const initialCost = await firstCost.textContent();
        await firstCard.getByRole("button", { name: copy.buy, exact: true }).click();
        await expect(firstCost).not.toHaveText(initialCost ?? "");
        repeatablePurchased = true;
      }
    }
  }

  const finalCopy = philosophyText(LOCALE_IDS.at(-1)!);
  const ability = page.locator("#panel-research-philosophy .philosophy-ability");
  await ability.getByRole("button", { name: finalCopy.abilityAction, exact: true }).click();
  await expect(page.locator('dialog[open], [role="dialog"]:visible')).toHaveCount(0);
  await expect(ability).toContainText(finalCopy.active);
});
