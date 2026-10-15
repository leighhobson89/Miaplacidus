import { economyGoodName, economyGoodPageTitle } from "../../../src/app/economyDisplay";
import { LOCALE_IDS } from "../../../src/content/ids";
import { economyActionHelp } from "../../../src/i18n/economyActionHelpMessages";
import { economyLabel } from "../../../src/i18n/economyMessages";
import { translate } from "../../../src/i18n/messages";
import { dismissTutorialOfferIfPresent, expect, test } from "../_harness/fixtures";
import { startEconomyFixture } from "../_harness/economyFixtures";
import { setGameLocale } from "../_harness/settings-controls";

const RESOURCE_GOOD_IDS = [
  "hydrogen",
  "helium",
  "neon",
  "oxygen",
  "carbon",
  "silicon",
  "sodium",
  "iron",
] as const;

const FUSION_GOOD_IDS = new Set<string>(["hydrogen", "helium", "carbon", "neon", "oxygen", "silicon"]);

const COMPOUND_GOOD_IDS = [
  "diesel",
  "glass",
  "steel",
  "concrete",
  "water",
  "titanium",
] as const;

test("Resource and compound row controls and help follow the selected locale @phase7-locale @economy", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startEconomyFixture(page, "full");
  await dismissTutorialOfferIfPresent(page);

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    for (const goodId of RESOURCE_GOOD_IDS) {
      await page.locator("#tab-resources-" + goodId).click();
      const resourcePane = page.locator("#panel-resources-" + goodId);
      await expect(resourcePane).toBeVisible();
      const goodPage =
        goodId === "hydrogen"
          ? resourcePane
          : resourcePane.locator('[data-resource-id="' + goodId + '"]');
      const goodName = economyGoodName(locale, goodId);
      const pageTitle =
        goodId === "hydrogen"
          ? translate(locale, "hydrogen.title")
          : economyGoodPageTitle(locale, goodId);
      await expect(goodPage.locator(".pane-heading h2")).toHaveText(pageTitle);

      const collectLabel =
        goodId === "hydrogen"
          ? translate(locale, "hydrogen.collect")
          : economyLabel(locale, "collect");
      await expect(goodPage.getByRole("button", { name: collectLabel })).toBeVisible();

      if (goodId === "hydrogen") {
        await expect(
          goodPage.locator('.hydrogen-sale-controls button[data-tutorial-target="sell-hydrogen"]'),
        ).toHaveText(translate(locale, "hydrogen.sell"));
      } else {
        await expect(
          goodPage.locator(
            ".hydrogen-sale-controls > .card-controls > button.secondary-button",
          ),
        ).toContainText(economyLabel(locale, "sell") + " " + goodName);
      }

      const saleAmount = goodPage.locator(".hydrogen-sale-controls select");
      if (goodId === "hydrogen") {
        await expect(saleAmount).toHaveAttribute("id", "hydrogen-sell-amount");
        await expect(goodPage.locator('label[for="hydrogen-sell-amount"]')).toHaveText(
          translate(locale, "hydrogen.sell.amount"),
        );
        const resourceStockLabels = [
          translate(locale, "hydrogen.sell.all"),
          translate(locale, "hydrogen.sell.one"),
          translate(locale, "hydrogen.sell.ten"),
          translate(locale, "hydrogen.sell.hundred"),
        ];
        expect(resourceStockLabels.every((label) => label.trim().length > 0)).toBe(true);
        await expect(saleAmount.locator("option")).toHaveText(resourceStockLabels);
      } else {
        await expect(saleAmount).toHaveAttribute(
          "aria-label",
          economyLabel(locale, "saleAmount") + " " + goodName,
        );
        const resourceStockLabels = [
          economyLabel(locale, "allStock"),
          economyLabel(locale, "threeQuartersStock"),
          economyLabel(locale, "twoThirdsStock"),
          economyLabel(locale, "halfStock"),
          economyLabel(locale, "oneThirdStock"),
          "1,000",
          "100",
          "10",
          "1",
        ];
        expect(resourceStockLabels.every((label) => label.trim().length > 0)).toBe(true);
        await expect(saleAmount.locator("option")).toHaveText(resourceStockLabels);
      }

      const saleHelp = goodPage.locator(
        ".hydrogen-sale-controls .card-copy > .economy-action-description",
      );
      const possibleSellHelp = [
        economyActionHelp(locale, goodId, "sell"),
        economyActionHelp(locale, goodId, "sell", { fused: true }),
      ].filter((value): value is string => typeof value === "string" && value.length > 0);
      expect(possibleSellHelp).toContain(await saleHelp.textContent());

      if (FUSION_GOOD_IDS.has(goodId)) {
        const fuseLabel = economyLabel(locale, "fuse");
        expect(fuseLabel.trim()).not.toBe("");
        await expect(goodPage.locator(".resource-fusion-details h4")).toHaveText(fuseLabel);
        await expect(
          goodPage.locator(".resource-fusion-details button.secondary-button"),
        ).toHaveText(`${fuseLabel} ${goodName}`);
      }

      const storage =
        goodId === "hydrogen"
          ? goodPage.locator(".hydrogen-storage-card")
          : goodPage.locator('[data-testid="storage-card-' + goodId + '"]');
      if (goodId === "hydrogen") {
        await expect(storage.locator("h3")).toHaveText(translate(locale, "hydrogen.storage.title"));
        await expect(
          storage.getByRole("button", {
            name: translate(locale, "hydrogen.storage.purchase"),
          }),
        ).toBeVisible();
      } else {
        await expect(storage.locator("h3")).toHaveText(economyLabel(locale, "storage"));
        await expect(
          storage.getByRole("button", { name: economyLabel(locale, "increaseStorage") }),
        ).toBeVisible();
      }
      if (goodId === "hydrogen") {
        for (const action of [
          { testId: "economy-sell-all-resources", labelKey: "sellAll" },
          { testId: "economy-increase-all-storage-resources", labelKey: "increaseAllStorage" },
        ] as const) {
          const bulkAction = page.getByTestId(action.testId);
          await expect(bulkAction).toBeVisible();
          await expect(bulkAction).toHaveText(economyLabel(locale, action.labelKey));
          await expect(bulkAction).toHaveAttribute(
            "aria-label",
            `${economyLabel(locale, action.labelKey)} ${economyLabel(locale, "resources")}`,
          );
        }
      }
      await expect(storage.locator(".economy-action-description")).toHaveText(
        economyActionHelp(locale, goodId, "storage") ?? "",
      );

      const allocation = goodPage.locator("details:has(.allocation-slider-group)");
      const allocationLabel = economyLabel(locale, "allocation");
      if (!(await allocation.evaluate((element) => element.hasAttribute("open")))) {
        await allocation.locator("summary").click();
      }
      await expect(allocation.locator("summary")).toHaveText(allocationLabel);
      const allocationGroup = allocation.getByRole("group", {
        name: allocationLabel + " " + goodName,
      });
      await expect(allocationGroup).toBeVisible();
      await expect(allocationGroup.getByRole("slider").first()).toHaveAttribute(
        "aria-disabled",
        "false",
      );
    }

    await page.locator("#tab-compounds").click();
    for (const goodId of COMPOUND_GOOD_IDS) {
      await page.locator("#tab-compounds-" + goodId).click();
      const compoundPane = page.locator("#panel-compounds-" + goodId);
      await expect(compoundPane).toBeVisible();
      const goodPage = compoundPane.locator('[data-compound-id="' + goodId + '"]');
      const goodName = economyGoodName(locale, goodId);
      await expect(goodPage.locator(".pane-heading h2")).toHaveText(
        economyGoodPageTitle(locale, goodId),
      );
      await expect(goodPage.locator(".compound-create-row .primary-button")).toHaveText(
        economyLabel(locale, "create") + " " + goodName,
      );
      await expect(
        goodPage.getByRole("spinbutton", {
          name: economyLabel(locale, "amount") + " " + goodName,
        }),
      ).toBeVisible();
      await expect(
        goodPage.locator(".hydrogen-sale-controls button.secondary-button"),
      ).toHaveText(economyLabel(locale, "sell") + " " + goodName);

      const compoundSaleAmount = goodPage.locator(".hydrogen-sale-controls select");
      const compoundAllStockLabel = economyLabel(locale, "allStock");
      expect(compoundAllStockLabel.trim()).not.toBe("");
      await expect(compoundSaleAmount).toHaveAttribute(
        "aria-label",
        economyLabel(locale, "saleAmount") + " " + goodName,
      );
      await expect(compoundSaleAmount.locator("option")).toHaveText([
        compoundAllStockLabel,
        "100",
        "10",
        "1",
      ]);
      await expect(
        goodPage.locator(".compound-create-controls .economy-action-description"),
      ).toHaveText(economyActionHelp(locale, goodId, "create") ?? "");
      await expect(
        goodPage.locator(".hydrogen-sale-controls .card-copy > .economy-action-description"),
      ).toHaveText(economyActionHelp(locale, goodId, "sell") ?? "");

      const storage = goodPage.locator('[data-testid="storage-card-' + goodId + '"]');
      const storageHeading =
        goodId === "water"
          ? economyLabel(locale, "enlargeReservoir")
          : economyLabel(locale, "storage");
      const storageAction =
        goodId === "water"
          ? economyLabel(locale, "enlargeReservoir")
          : economyLabel(locale, "increaseStorage");
      await expect(storage.locator("h3")).toHaveText(storageHeading);
      await expect(storage.getByRole("button", { name: storageAction })).toBeVisible();
      if (goodId === "diesel") {
        for (const action of [
          { testId: "economy-sell-all-compounds", labelKey: "sellAll" },
          { testId: "economy-increase-all-storage-compounds", labelKey: "increaseAllStorage" },
        ] as const) {
          const bulkAction = compoundPane.getByTestId(action.testId);
          await expect(bulkAction).toBeVisible();
          await expect(bulkAction).toHaveText(economyLabel(locale, action.labelKey));
          await expect(bulkAction).toHaveAttribute(
            "aria-label",
            `${economyLabel(locale, action.labelKey)} ${economyLabel(locale, "compounds")}`,
          );
        }
      }
      await expect(storage.locator(".economy-action-description")).toHaveText(
        economyActionHelp(locale, goodId, "storage") ?? "",
      );
    }
  }
});
