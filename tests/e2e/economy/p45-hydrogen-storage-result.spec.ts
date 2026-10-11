import { expect, test } from "../_harness/fixtures";
import { setGameLocale } from "../_harness/settings-controls";
import { formatNumber } from "../../../src/app/numberFormatting";
import { LOCALE_IDS } from "../../../src/content/ids";
import { translate } from "../../../src/i18n/messages";

for (const locale of LOCALE_IDS) {
  test(`Hydrogen storage purchase result stays exact in ${locale} @p45-hydrogen-storage-result`, async ({
    freshGame,
  }) => {
    await freshGame.evaluate(() => window.miaplacidusTest!.runScenario("storage-ready"));
    await setGameLocale(freshGame, locale);

    const before = await freshGame.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      return {
        pioneerName: state.run.pioneerName,
        hydrogen: state.run.goods.hydrogen,
        notation: state.settings.notation,
        activeSlotId: localStorage.getItem("miaplacidus:v1:lastStartedSlot"),
      };
    });

    expect(before.pioneerName).toBe("Hydrogen Pioneer");
    expect(before.activeSlotId).toBeTruthy();
    expect(before.hydrogen.quantity).toBe(before.hydrogen.storageCapacity - 1);
    await expect(freshGame.locator("#tab-hydrogen")).toHaveAttribute("aria-selected", "true");
    await expect(freshGame.locator("#panel-resources-hydrogen")).toBeVisible();

    const cost = before.hydrogen.storageCapacity - 1;
    const newCapacity = before.hydrogen.storageCapacity * 2;
    const storageCard = freshGame.locator("#panel-resources-hydrogen .hydrogen-storage-card");
    await expect(storageCard.locator(".cost-line")).toContainText(
      translate(locale, "hydrogen.storage.price"),
    );
    await expect(storageCard.locator(".cost-line")).toContainText(
      `${formatNumber(locale, cost, 0, before.notation)} H₂`,
    );
    await expect(storageCard.locator(".cost-line")).toContainText(
      `${formatNumber(locale, before.hydrogen.storageCapacity, 0, before.notation)} → ${formatNumber(locale, newCapacity, 0, before.notation)}`,
    );

    await storageCard
      .getByRole("button", {
        name: translate(locale, "hydrogen.storage.purchase"),
        exact: true,
      })
      .click();

    const after = await freshGame.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      return {
        pioneerName: state.run.pioneerName,
        hydrogen: state.run.goods.hydrogen,
        activeSlotId: localStorage.getItem("miaplacidus:v1:lastStartedSlot"),
      };
    });

    expect(after.pioneerName).toBe(before.pioneerName);
    expect(after.activeSlotId).toBe(before.activeSlotId);
    expect(after.hydrogen.storageCapacity).toBe(newCapacity);
    expect(before.hydrogen.quantity - after.hydrogen.quantity).toBe(cost);
    expect(after.hydrogen.quantity).toBe(0);
    await expect(freshGame.getByTestId("hydrogen-capacity")).toHaveText(
      formatNumber(locale, newCapacity, 0, before.notation),
    );
    await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText(
      formatNumber(locale, 0, 2, before.notation),
    );
    await expect(freshGame.locator("#tab-hydrogen")).toHaveAttribute("aria-selected", "true");
    await expect(freshGame.locator("#panel-resources-hydrogen")).toBeVisible();
  });
}
