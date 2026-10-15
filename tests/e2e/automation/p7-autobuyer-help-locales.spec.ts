import { LOCALE_IDS } from "../../../src/content/ids";
import { economyAutobuyerName } from "../../../src/i18n/economyAutobuyerNameMessages";
import { ECONOMY_ACTION_HELP_MESSAGES } from "../../../src/i18n/economyActionHelpMessages";
import { translate } from "../../../src/i18n/messages";
import { setGameLocale } from "../_harness/settings-controls";
import { expect, test } from "../_harness/fixtures";

test("Hydrogen autobuyer description and purchase control follow the selected locale @phase7-locale @automation", async ({
  freshGame,
}) => {
  const autobuyerSection = freshGame.locator("details.hydrogen-autobuyer-section");

  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await expect(freshGame.locator("html")).toHaveAttribute("lang", locale);

    if (!(await autobuyerSection.evaluate((element) => (element as HTMLDetailsElement).open))) {
      await autobuyerSection.locator("summary").click();
    }

    await expect(
      autobuyerSection.getByRole("heading", {
        level: 3,
        name: economyAutobuyerName(locale, "hydrogen", 1),
      }),
    ).toBeVisible();
    await expect(autobuyerSection.locator("#hydrogen-autobuyer-help")).toHaveText(
      ECONOMY_ACTION_HELP_MESSAGES[locale].optionDescHydrogenAutoBuyer1Content1,
    );
    await expect(
      autobuyerSection.getByRole("button", {
        name: translate(locale, "hydrogen.autobuyer.purchase"),
        exact: true,
      }),
    ).toBeVisible();
  }
});
