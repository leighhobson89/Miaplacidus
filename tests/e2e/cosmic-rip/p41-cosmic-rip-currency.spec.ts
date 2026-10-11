import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { setNumberNotation } from "../_harness/settings-controls";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { COSMIC_RIP_UPGRADES } from "../../../src/content/cosmicRip";
import { cosmicRipUpgradeCost } from "../../../src/engine/cosmicRip";
import { cosmicRipText } from "../../../src/i18n/cosmicRipMessages";

test("P-41 formats Cosmic Rip upgrade cash costs in every notation @p41-cosmic-rip-currency", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-route");

  for (const upgradeId of ["sensorBuoy", "ripResearchOrbiter"] as const) {
    const renderedCosts: Record<"condensed" | "standard" | "scientific", string> = {
      condensed: "",
      standard: "",
      scientific: "",
    };
    for (const notation of ["condensed", "standard", "scientific"] as const) {
      await setNumberNotation(page, notation);
      await page.getByRole("tab", { name: "Cosmic Rip" }).click();
      await page.locator("#tab-cosmic-rip-rip").click();

      const state = await page.evaluate(() => window.miaplacidusTest!.getState());
      expect(state.settings.notation).toBe(notation);
      const cost = cosmicRipUpgradeCost(state, upgradeId);
      const expected = formatCurrency(
        "en",
        cost.cash,
        state.settings.currencyId ?? "usd",
        2,
        notation,
      );
      const upgrade = page.locator(".cosmic-rip-upgrade").filter({
        has: page.getByRole("heading", { name: cosmicRipText("en").upgradeNames[upgradeId] }),
      });
      await expect(upgrade.locator("p").nth(1)).toContainText(expected);
      expect(cost.cash).toBe(COSMIC_RIP_UPGRADES[upgradeId].cash);
      renderedCosts[notation] = expected;
    }

    expect(renderedCosts.scientific).not.toBe(renderedCosts.standard);
  }
});
