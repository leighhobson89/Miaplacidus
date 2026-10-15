import { expect, test, type Page } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { setGameLocale } from "../_harness/settings-controls";
import { LOCALE_IDS } from "../../../src/content/ids";
import { economyLabel } from "../../../src/i18n/economyMessages";
import { translate } from "../../../src/i18n/messages";
import { blackHoleText } from "../../../src/i18n/blackHoleMessages";
import { casinoHeaderDescription, casinoText } from "../../../src/i18n/casinoMessages";
import { marketText, metaText, rebirthText } from "../../../src/i18n/metaMessages";
import {
  marketBiasHelpText,
  marketSourceHelpText,
} from "../../../src/i18n/marketMessages";
import { megastructureText } from "../../../src/i18n/megastructureMessages";

async function expectInfoTooltip(page: Page, testId: string, expectedCopy: string): Promise<void> {
  await page.getByTestId(`${testId}-trigger`).focus();
  await expect(page.getByTestId(testId)).toHaveText(expectedCopy);
}

test("routes source-owned Galactic page titles, descriptions, and action-row labels in all six locales @p7-localization @galactic", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startMetaFixture(page, "meta-galactic-identity-matrix");

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    const galacticTab = page.locator("#tab-galaxy");
    await expect
      .poll(() =>
        galacticTab.evaluate((element) =>
          Array.from(element.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent ?? "")
            .join("")
            .trim(),
        ),
      )
      .toBe(translate(locale, "tab.galaxy"));
    await expect(galacticTab).toHaveAttribute(
      "aria-description",
      economyLabel(locale, "galacticOverviewHelp"),
    );
    await galacticTab.click();

    const rebirthTab = page.locator("#tab-galactic-rebirth");
    await rebirthTab.click();
    await expect(rebirthTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { name: rebirthText(locale, "title"), exact: true }))
      .toBeVisible();
    await page.getByTestId("rebirth-page-help-trigger").focus();
    const rebirthHelp = page.getByTestId("rebirth-page-help");
    await expect(rebirthHelp).toContainText(metaText(locale, "rebirthOverview"));
    await expect(rebirthHelp).toContainText(metaText(locale, "rebirthMegastructureWarning"));
    await expectInfoTooltip(
      page,
      "rebirth-liquidation-source-help",
      marketSourceHelpText(locale, "liquidation"),
    );

    const marketTab = page.locator("#tab-galactic-market");
    await marketTab.click();
    await expect(marketTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { name: marketText(locale, "heading"), exact: true }))
      .toBeVisible();
    await expect(page.locator(".galactic-market-pane .pane-heading p")).toHaveText(
      marketText(locale, "description"),
    );
    const marketPane = page.locator(".galactic-market-pane");
    await expectInfoTooltip(
      page,
      "galactic-market-trade-source-help",
      marketSourceHelpText(locale, "trade"),
    );
    await expectInfoTooltip(
      page,
      "galactic-market-ap-sale-source-help",
      marketSourceHelpText(locale, "sellAp"),
    );
    const outgoingSelect = marketPane.getByLabel(marketText(locale, "tradeRow"));
    const incomingSelect = marketPane.getByLabel(marketText(locale, "tradeFor"));
    await expect(outgoingSelect).toHaveAccessibleName(marketText(locale, "tradeRow"));
    const quantityInput = marketPane.getByLabel(marketText(locale, "quantity"));
    await expect(quantityInput).toHaveAccessibleName(marketText(locale, "quantity"));
    await expect(
      marketPane.getByText(marketText(locale, "confirmRowLabel"), { exact: true }),
    ).toBeVisible();
    const marketCards = marketPane.locator(".action-grid .upgrade-card");
    await expect(
      marketCards.nth(1).getByRole("heading", { name: marketText(locale, "sellAp"), exact: true }),
    ).toBeVisible();
    await expect(marketCards.nth(1).getByLabel(marketText(locale, "sellAp"))).toHaveAccessibleName(
      marketText(locale, "sellAp"),
    );
    const outgoingId = await outgoingSelect.inputValue();
    const incomingIds = await incomingSelect.locator("option").evaluateAll((options) =>
      options.map((option) => (option as HTMLOptionElement).value),
    );
    const incomingId = incomingIds.find((id) => id && id !== outgoingId);
    expect(incomingId).toBeDefined();
    await incomingSelect.selectOption(incomingId!);
    const [outgoingBias, incomingBias] = await page.evaluate(
      ([outgoingGoodId, incomingGoodId]) => {
        const goods = window.miaplacidusTest!.getState().permanent.galacticMarket.goods;
        return [
          goods[outgoingGoodId as keyof typeof goods].marketBias,
          goods[incomingGoodId as keyof typeof goods].marketBias,
        ];
      },
      [outgoingId, incomingId!],
    );
    await expectInfoTooltip(
      page,
      "galactic-market-bias-help",
      marketBiasHelpText(locale, outgoingBias, incomingBias),
    );

    const casinoTab = page.locator("#tab-galactic-casino");
    await casinoTab.click();
    await expect(casinoTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { name: casinoText(locale, "title"), exact: true }))
      .toBeVisible();
    await expect(page.locator(".galactic-casino-pane > .pane-heading > div > p")).toHaveText(
      casinoHeaderDescription(locale),
    );
    await page.getByTestId("casino-header-help-trigger").focus();
    await expect(page.getByTestId("casino-header-help-tooltip")).toHaveText(
      casinoText(locale, "headerHelp"),
    );
    const perksTab = page.locator("#tab-galactic-ascendency-perks");
    await perksTab.click();
    await expect(perksTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { name: metaText(locale, "perksTitle"), exact: true }))
      .toBeVisible();
    await expectInfoTooltip(page, "ascendency-perks-page-help", metaText(locale, "perksOverview"));
    await expect(page.getByTestId("ascendency-points")).toBeVisible();

    const megastructuresTab = page.locator("#tab-galactic-megastructures");
    await megastructuresTab.click();
    await expect(megastructuresTab).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByRole("heading", { name: megastructureText(locale).title, exact: true }),
    ).toBeVisible();
    await expectInfoTooltip(
      page,
      "megastructure-header-help",
      megastructureText(locale).headerHelp,
    );

    const blackHoleTab = page.locator("#tab-galactic-black-hole");
    await blackHoleTab.click();
    await expect(blackHoleTab).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByRole("heading", { name: blackHoleText(locale).title, exact: true }),
    ).toBeVisible();
    await expectInfoTooltip(page, "black-hole-header-help", blackHoleText(locale).headerHelp);
  }
});
