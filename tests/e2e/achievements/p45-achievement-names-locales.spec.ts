import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { achievementName, ACHIEVEMENT_IDS } from "../../../src/content/achievements";
import { LOCALE_IDS } from "../../../src/content/ids";
import { setGameLocale } from "../_harness/settings-controls";

test("P-45 all achievement names render from the active locale catalogue @p45-achievement-locales", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-rebirth-ready");

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.locator("#tab-settings").click();
    await page.locator("#tab-settings-achievements").click();

    const cards = page.getByTestId("achievements-pane").locator("[data-achievement-id]");
    await expect(cards).toHaveCount(ACHIEVEMENT_IDS.length);
    const renderedNames = await cards.evaluateAll((elements) =>
      elements.map((element) => [
        element.getAttribute("data-achievement-id"),
        element.querySelector("h3")?.textContent?.trim(),
      ]),
    );
    expect(renderedNames).toEqual(ACHIEVEMENT_IDS.map((id) => [id, achievementName(id, locale)]));
  }
});
