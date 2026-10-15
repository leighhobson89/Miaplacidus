import { COMPOUND_IDS, LOCALE_IDS, MATERIAL_IDS } from "../../../src/content/ids";
import { economyAutobuyerName } from "../../../src/i18n/economyAutobuyerNameMessages";
import { economyActionHelp } from "../../../src/i18n/economyActionHelpMessages";
import { economyLabel } from "../../../src/i18n/economyMessages";
import { researchActionHelp } from "../../../src/i18n/researchActionHelpMessages";
import type { Locator } from "@playwright/test";
import { dismissTutorialOfferIfPresent, expect, test } from "../_harness/fixtures";
import { startEconomyFixture } from "../_harness/economyFixtures";
import { setGameLocale } from "../_harness/settings-controls";

const TIERS = [1, 2, 3, 4] as const;

async function openIfClosed(details: Locator): Promise<void> {
  if (!(await details.evaluate((element) => (element as HTMLDetailsElement).open))) {
    await details.locator("summary").click();
  }
}

test("source autobuyer names and help follow the selected locale across Economy and Research @phase7-locale @autobuyers", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startEconomyFixture(page, "full");
  await dismissTutorialOfferIfPresent(page);

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    for (const goodId of MATERIAL_IDS) {
      await page.locator(`#tab-resources-${goodId}`).click();
      const pane = page.locator(`#panel-resources-${goodId}`);
      await expect(pane).toBeVisible();

      if (goodId === "hydrogen") {
        const section = pane.locator("details.hydrogen-autobuyer-section");
        await openIfClosed(section);

        // Hydrogen Tier 1 uses its dedicated localized heading; the current target omits a visible tier numeral.
        await expect(pane.locator("#hydrogen-autobuyer-title")).toHaveText(
          economyAutobuyerName(locale, goodId, 1),
        );
        await expect(pane.locator("#hydrogen-autobuyer-help")).toContainText(
          economyActionHelp(locale, goodId, "autobuyer", { tier: 1 })!,
        );

        for (const tier of [2, 3, 4] as const) {
          await expect(
            pane.locator(`#resource-hydrogen-autobuyer-${tier}-summary`),
          ).toContainText(
            `${economyAutobuyerName(locale, goodId, tier)} · ${economyLabel(locale, "buyTier")} ${tier}:`,
          );
          await expect(pane.locator(`#resource-hydrogen-autobuyer-${tier}-help`)).toContainText(
            economyActionHelp(locale, goodId, "autobuyer", { tier })!,
          );
        }
        continue;
      }

      const resource = pane.locator(`[data-resource-id="${goodId}"]`);
      const autobuyers = resource.locator("details:has(.resource-autobuyer-tiers)");
      await openIfClosed(autobuyers);
      for (const tier of TIERS) {
        await expect(
          resource.locator(`#resource-${goodId}-autobuyer-${tier}-summary`),
        ).toContainText(
          `${economyAutobuyerName(locale, goodId, tier)} · ${economyLabel(locale, "buyTier")} ${tier}:`,
        );
        await expect(resource.locator(`#resource-${goodId}-autobuyer-${tier}-help`)).toContainText(
          economyActionHelp(locale, goodId, "autobuyer", { tier })!,
        );
      }
    }

    await page.locator("#tab-compounds").click();
    for (const goodId of COMPOUND_IDS) {
      await page.locator(`#tab-compounds-${goodId}`).click();
      const pane = page.locator(`#panel-compounds-${goodId}`);
      await expect(pane).toBeVisible();
      const compound = pane.locator(`[data-compound-id="${goodId}"]`);
      const autobuyers = compound.locator("details.compound-autobuyer-section");
      await openIfClosed(autobuyers);

      for (const tier of TIERS) {
        await expect(
          compound.locator(`#compound-${goodId}-autobuyer-${tier}-summary`),
        ).toContainText(
          `${economyAutobuyerName(locale, goodId, tier)} · ${economyLabel(locale, "buyTier")} ${tier}:`,
        );
        await expect(compound.locator(`#compound-${goodId}-autobuyer-${tier}-help`)).toContainText(
          economyActionHelp(locale, goodId, "autobuyer", { tier })!,
        );
      }
    }

    await page.locator("#tab-research").click();
    await page.locator("#tab-research-science-buildings").click();
    await expect(page.locator("#panel-research-science-buildings")).toBeVisible();
    await expect(page.getByTestId("research-autobuyer-help")).toHaveText(
      researchActionHelp(locale, "researchAutoBuyer"),
    );
  }
});
