import { dismissTutorialOfferIfPresent, expect, test } from "../_harness/fixtures";
import { LOCALE_IDS, PHILOSOPHY_IDS } from "../../../src/content/ids";
import { philosophyText } from "../../../src/i18n/philosophyMessages";

async function startSpaceFixture(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("miaplacidus:fixture-cleared") === "yes") return;
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
    sessionStorage.setItem("miaplacidus:fixture-cleared", "yes");
  });
  await page.goto("/?testSeed=20261016&testLocale=en&economyFixture=space-telescope");
  await page.getByLabel("Pioneer name").fill("Phase 7 Philosophy Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await dismissTutorialOfferIfPresent(page);
}

test(
  "Cosmic Forge philosophy choice names route to the matching cards in all locales @p7-philosophy-names @localization",
  async ({ page }) => {
    await startSpaceFixture(page);

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

    const choice = page.getByTestId("philosophy-choice");
    await expect(choice).toBeVisible();

    for (const locale of LOCALE_IDS) {
      await page.evaluate(
        (nextLocale) =>
          window.miaplacidusTest!.dispatch({
            type: "settings.update",
            patch: { locale: nextLocale },
          }),
        locale,
      );
      await expect(page.locator("html")).toHaveAttribute("lang", locale);

      const copy = philosophyText(locale);
      await expect(choice.getByRole("heading", { level: 2 })).toHaveText(copy.choiceTitle);
      await expect(choice.getByText(copy.choicePrompt, { exact: true })).toBeVisible();
      const names = PHILOSOPHY_IDS.map((id) => copy.paths[id].name);
      expect(
        names.every((name) => name.trim().length > 0),
        `${locale} names must be non-empty`,
      ).toBe(true);
      expect(
        new Set(names).size,
        `${locale} must keep the four path identities distinct`,
      ).toBe(PHILOSOPHY_IDS.length);

      for (const id of PHILOSOPHY_IDS) {
        const name = copy.paths[id].name;
        const card = choice.locator(`[data-philosophy-id="${id}"]`);
        await expect(card).toBeVisible();
        await expect(card.getByRole("heading", { level: 3 })).toHaveText(name);
        await expect(card.getByRole("button", { name, exact: true })).toBeVisible();
      }
    }
  },
);
