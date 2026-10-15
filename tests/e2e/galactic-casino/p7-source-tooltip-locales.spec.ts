import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import {
  casinoSectionHelpText,
  casinoText,
  casinoVoidSeerPrizeName,
} from "../../../src/i18n/casinoMessages";

// Source keys: infoTooltipGalacticCasinoHeader, infoTooltipGalacticCasinoWheelOfFortune,
// galacticCasinoPurchaseCpContent1, and galacticCasinoGame1Content1 through
// galacticCasinoGame4Content1.
test("Casino source help copy routes in all six locales @p7-localization @galactic-casino", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-casino-ready");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();

  const casino = page.getByTestId("galactic-casino-pane");
  const headerTrigger = casino.getByTestId("casino-header-help-trigger");
  const headerTooltip = casino.getByTestId("casino-header-help-tooltip");
  const wheelHelp = casino.getByTestId("casino-wheel-help");

  for (const locale of LOCALE_IDS) {
    const headerHelpCopy = casinoText(locale, "headerHelp").trim();
    const wheelHelpCopy = casinoText(locale, "wheelHelp").trim();
    expect(headerHelpCopy, `${locale} header source help is populated`).not.toBe("");
    expect(wheelHelpCopy, `${locale} Wheel source help is populated`).not.toBe("");

    const accepted = await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    expect(accepted, `${locale} locale selection is accepted`).toBe(true);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    // Cosmic Forge Tab 7 row labels are rendered as the corresponding section headings.
    for (const sectionKey of [
      "buyTitle",
      "doubleOrNothing",
      "wheel",
      "voidSeer",
      "higherLower",
    ] as const) {
      await expect(
        casino.getByRole("heading", { name: casinoText(locale, sectionKey), exact: true }),
      ).toBeVisible();
    }

    const sourceGameHelp = [
      {
        key: "purchase",
        testId: "casino-purchase-source-help",
        tooltipId: "casino-purchase-source-help",
      },
      {
        key: "doubleOrNothing",
        testId: "casino-double-or-nothing-source-help",
        tooltipId: "casino-double-or-nothing-source-help",
      },
      {
        key: "wheel",
        testId: "casino-wheel-source-help",
        tooltipId: "casino-wheel-source-help",
        price: "1",
      },
      {
        key: "higherLower",
        testId: "casino-higher-lower-source-help",
        tooltipId: "casino-higher-lower-source-help",
        price: "5",
      },
      {
        key: "voidSeer",
        testId: "casino-void-seer-source-help",
        tooltipId: "casino-void-seer-source-help",
      },
    ] as const;
    for (const help of sourceGameHelp) {
      const trigger = casino.getByTestId(`${help.testId}-trigger`);
      await expect(trigger).toHaveAttribute("aria-describedby", help.tooltipId);
      await trigger.focus();
      const expectedCopy = casinoSectionHelpText(locale, help.key).replace(
        "{price}",
        "price" in help ? help.price : "{price}",
      );
      expect(expectedCopy, `${locale} ${help.key} source help is populated`).not.toBe("");
      await expect(page.getByTestId(help.testId)).toHaveText(expectedCopy);
      await expect(page.getByTestId(help.testId)).toBeVisible();
    }

    const voidSeerTier = casino.getByLabel(casinoText(locale, "tier"));
    for (const tier of [1, 2, 3] as const) {
      const prizeName = casinoVoidSeerPrizeName(locale, tier);
      expect(prizeName, `${locale} Void Seer tier ${tier} name is populated`).not.toBe("");
      await expect(voidSeerTier.locator(`option[value="${tier}"]`)).toContainText(
        prizeName,
      );
    }

    await expect(headerTrigger).toHaveAttribute(
      "aria-label",
      casinoText(locale, "headerHelpLabel"),
    );
    await expect(headerTrigger).toHaveAttribute(
      "aria-describedby",
      "galactic-casino-header-help",
    );
    await expect(headerTooltip).toHaveAttribute("role", "tooltip");
    await expect(headerTooltip).toHaveText(headerHelpCopy);
    await headerTrigger.focus();
    await expect(headerTooltip).toBeVisible();

    await expect(wheelHelp).toHaveText(wheelHelpCopy);
    const prizeSelect = casino.getByLabel(casinoText(locale, "choosePrize"));
    await expect(prizeSelect).toHaveAttribute("aria-describedby", "casino-wheel-help");
  }
});
