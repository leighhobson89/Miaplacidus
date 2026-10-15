import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS } from "../../../src/content/ids";
import { translate } from "../../../src/i18n/messages";
import { saveText } from "../../../src/i18n/saveMessages";

test("startup copy and the gameSaveNameCollect route follow the selected locale through Hydrogen @p7-startup-locale @localization @app-boot", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    for (const storage of [localStorage, sessionStorage]) {
      const keys = Array.from({ length: storage.length }, (_, index) =>
        storage.key(index),
      ).filter((key): key is string => key?.startsWith(prefix) ?? false);
      for (const key of keys) storage.removeItem(key);
    }
  });

  for (const locale of LOCALE_IDS) {
    await page.goto(`/?testSeed=20261015&testLocale=${locale}`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(
      page.getByRole("heading", { name: "MIAPLACIDUS", level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    // Cosmic Forge descriptions.js#gameSaveNameCollect routes to this active name-field label.
    await expect(page.locator('label[for="pioneer-name"]')).toHaveText(
      translate(locale, "app.pioneer"),
    );
    await expect(page.locator('label[for="start-locale"]')).toHaveText(
      translate(locale, "app.locale"),
    );
    await expect(page.locator("#start-locale")).toHaveValue(locale);

    const pioneerName = page.getByLabel(translate(locale, "app.pioneer"));
    await pioneerName.fill(`P7 ${locale.toUpperCase()} Pioneer`);
    const start = page.getByTestId("start-game");
    await expect(start).toHaveText(saveText(locale, "startNewGame"));
    await expect(start).toBeEnabled();
    await start.click();

    await expect(page.locator("[data-app-ready]")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const hydrogen = page.locator("#panel-resources-hydrogen");
    await expect(hydrogen).toBeVisible();
    await expect(hydrogen.locator(".pane-heading h2")).toHaveText(
      translate(locale, "hydrogen.title"),
    );
    await expect(
      hydrogen.getByText(translate(locale, "hydrogen.quantity"), { exact: true }),
    ).toBeVisible();
    await expect(
      hydrogen.getByText(translate(locale, "hydrogen.capacity"), { exact: true }),
    ).toBeVisible();
    await expect(hydrogen.getByTestId("hydrogen-quantity")).toContainText("0");
    await expect(hydrogen.getByTestId("hydrogen-capacity")).toHaveText("150");
    await expect(
      hydrogen.getByRole("button", {
        name: translate(locale, "hydrogen.collect"),
        exact: true,
      }),
    ).toBeEnabled();
  }
});
