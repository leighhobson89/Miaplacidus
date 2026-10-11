import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { THEME_IDS, type ThemeId } from "../../../src/content/themes";
import { blackHoleText } from "../../../src/i18n/blackHoleMessages";
import { casinoText } from "../../../src/i18n/casinoMessages";
import { marketText, metaText, rebirthText } from "../../../src/i18n/metaMessages";
import { megastructureText } from "../../../src/i18n/megastructureMessages";

const galacticIdentityPages = [
  {
    id: "galactic-rebirth",
    sourceOptionId: "option1",
    label: (locale: LocaleId) => metaText(locale, "rebirthAction"),
    title: (locale: LocaleId) => rebirthText(locale, "title"),
    paneSelector: '[data-testid="rebirth-pane"]',
    artwork: "megastructure",
  },
  {
    id: "galactic-market",
    sourceOptionId: "option2",
    label: (locale: LocaleId) => marketText(locale, "heading"),
    title: (locale: LocaleId) => marketText(locale, "heading"),
    paneSelector: ".galactic-market-pane",
    artwork: "asteroid",
  },
  {
    id: "galactic-casino",
    sourceOptionId: "option6",
    label: (locale: LocaleId) => casinoText(locale, "title"),
    title: (locale: LocaleId) => casinoText(locale, "title"),
    paneSelector: '[data-testid="galactic-casino-pane"]',
    artwork: "star-system",
  },
  {
    id: "galactic-ascendency-perks",
    sourceOptionId: "option3",
    label: (locale: LocaleId) => metaText(locale, "perksTitle"),
    title: (locale: LocaleId) => metaText(locale, "perksTitle"),
    paneSelector: '[data-testid="ascendency-pane"]',
    artwork: "megastructure",
  },
  {
    id: "galactic-megastructures",
    sourceOptionId: "option4",
    label: (locale: LocaleId) => megastructureText(locale).title,
    title: (locale: LocaleId) => megastructureText(locale).title,
    paneSelector: '[data-testid="megastructure-pane"]',
    artwork: "megastructure",
  },
  {
    id: "galactic-black-hole",
    sourceOptionId: "option5",
    label: (locale: LocaleId) => blackHoleText(locale).title,
    title: (locale: LocaleId) => blackHoleText(locale).title,
    paneSelector: ".black-hole-pane",
    artwork: "black-hole",
  },
] as const;

const galacticIdentityViewports = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

test("previews and settles an exact Galactic Market trade", async ({ page }, testInfo) => {
  await startMetaFixture(page, "meta-market-rebirth-ready");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Galactic Market" }).click();
  const market = page.getByRole("region", { name: "Galactic Market" });
  await market.getByLabel("You give").selectOption("hydrogen");
  await market.getByLabel("You receive").selectOption("helium");
  await market.getByLabel("Quantity to trade").fill("10");
  await expect(market.getByText(/You receive:\s*18 Helium/)).toBeVisible();
  await market.getByRole("button", { name: "Confirm trade", exact: true }).click();
  const tradeNotice = page.locator(
    '[data-testid="game-notification"][data-classification="special"]',
  );
  await expect(tradeNotice).toHaveText(
    "You have traded 9 Hydrogen for 18 Helium and paid 1 Hydrogen commission!",
  );
  await expect(market.locator(".live-feedback")).toHaveText("");

  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.goods.hydrogen.quantity).toBe(90);
  expect(state.run.goods.helium.quantity).toBe(18);
  expect(state.permanent.galacticMarket.history).toHaveLength(1);
  await expect(market.getByRole("listitem")).toContainText("10 Hydrogen");

  const apBeforeSale = state.permanent.ascendencyPoints;
  await market.getByLabel("AP to sell").selectOption("10");
  await market.getByRole("button", { name: "Sell AP for cash", exact: true }).click();
  let marketState = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(marketState.permanent.ascendencyPoints).toBe(apBeforeSale - 10 + 5);
  expect(marketState.permanent.achievements.unlockedIds).toContain("trade10APForCash");
  expect(marketState.run.cash).toBeGreaterThanOrEqual(
    state.run.cash + 10 * state.permanent.galacticMarket.apSellPrice,
  );

  await captureVisualCheckpoint(page, testInfo, "galactic-market-trade");
  await page.getByRole("tab", { name: "Rebirth" }).click();
  const rebirth = page.getByTestId("rebirth-pane");
  const liquidationButton = rebirth.getByRole("button", {
    name: "Liquidate all assets",
    exact: true,
  });
  await liquidationButton.click();
  const dialog = page.getByRole("dialog", { name: "Confirm asset liquidation" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "CONFIRM LIQUIDATION" }).click();
  marketState = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(marketState.permanent.ascendencyPoints).toBe(apBeforeSale - 10 + 5 + 1);
  expect(marketState.run.cash).toBe(0);
  expect(marketState.run.goods.hydrogen.quantity).toBe(0);
  expect(marketState.run.marketLiquidatedThisRun).toBe(true);
  await expect(liquidationButton).toBeDisabled();
  await expect(liquidationButton).toHaveAttribute(
    "aria-describedby",
    "asset-liquidation-reason",
  );
  await expect(page.locator("#asset-liquidation-reason")).toContainText(
    "already been liquidated",
  );
  await expect(tradeNotice).toBeHidden();
});

test("keeps a live trade notice behind the asset-liquidation decision @p08 @notifications @p16-focus", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-market-rebirth-ready");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Galactic Market" }).click();
  const market = page.getByRole("region", { name: "Galactic Market" });
  await market.getByLabel("You give").selectOption("hydrogen");
  await market.getByLabel("You receive").selectOption("helium");
  await market.getByLabel("Quantity to trade").fill("10");
  await market.getByRole("button", { name: "Confirm trade", exact: true }).click();

  const notice = page.locator('[data-testid="game-notification"][data-classification="special"]');
  await expect(notice).toContainText("You have traded 9 Hydrogen for 18 Helium");
  const notificationStack = page.getByTestId("notification-stack");
  await expect(notificationStack).toHaveCSS("position", "static");
  await expect(notificationStack).toHaveCSS("z-index", "auto");

  await page.getByRole("tab", { name: "Rebirth" }).click();
  const rebirth = page.getByTestId("rebirth-pane");
  const liquidationButton = rebirth.getByRole("button", { name: "Liquidate all assets" });
  await liquidationButton.click();
  const dialog = page.getByRole("dialog", { name: "Confirm asset liquidation" });
  await expect(dialog).toBeVisible();
  await expect(notice).toBeVisible();
  const modalHitTest = await page.evaluate(() => {
    const modal = document.querySelector<HTMLDialogElement>(
      'dialog[aria-labelledby="asset-liquidation-title"]',
    );
    const confirmButton = modal?.querySelector("button.primary-button");
    const bounds = confirmButton?.getBoundingClientRect();
    const target = bounds
      ? document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2)
      : null;
    return {
      isInBrowserTopLayer: modal?.matches(":modal") ?? false,
      confirmButtonReceivesHit: Boolean(confirmButton && target && confirmButton.contains(target)),
    };
  });
  expect(modalHitTest).toEqual({
    isInBrowserTopLayer: true,
    confirmButtonReceivesHit: true,
  });

  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(notice).toBeVisible();
  await expect(liquidationButton).toBeFocused();

  await liquidationButton.click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(liquidationButton).toBeFocused();
});

test("disabled Galactic Market actions describe live selector reasons", async ({ page }) => {
  await startMetaFixture(page, "meta-market-action-reasons-rebirth-ready");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Galactic Market" }).click();
  const market = page.getByRole("region", { name: "Galactic Market" });
  const tradeButton = market.getByRole("button", { name: "Confirm trade", exact: true });
  const apButton = market.getByRole("button", { name: "Sell AP for cash", exact: true });
  for (const [button, reasonId] of [
    [tradeButton, "galactic-market-trade-reason"],
    [apButton, "galactic-market-ap-sale-reason"],
  ] as const) {
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute("aria-describedby", reasonId);
    await expect(page.locator(`#${reasonId}`)).toContainText("in lockdown");
    await expect(page.locator(`#${reasonId}`)).toContainText("reopens: 1 min");
  }

  await page.getByRole("tab", { name: "Rebirth" }).click();
  const rebirth = page.getByTestId("rebirth-pane");
  const liquidationButton = rebirth.getByRole("button", {
    name: "Liquidate all assets",
    exact: true,
  });
  await expect(liquidationButton).toBeDisabled();
  await expect(liquidationButton).toHaveAttribute("aria-describedby", "asset-liquidation-reason");
  await expect(page.locator("#asset-liquidation-reason")).toContainText("in lockdown");
  await expect(page.locator("#asset-liquidation-reason")).toContainText("reopens: 1 min");

  await page.evaluate(() => window.miaplacidusTest!.advanceBy(3_001));
  await page.getByRole("tab", { name: "Galactic Market" }).click();
  await expect(page.getByText(/in lockdown/)).toHaveCount(0);
  await market.getByLabel("You give").selectOption("hydrogen");
  await market.getByLabel("You receive").selectOption("helium");

  await market.getByLabel("Quantity to trade").fill("101");
  const tradeReason = page.locator("#galactic-market-trade-reason");
  await expect(tradeButton).toBeDisabled();
  await expect(tradeButton).toHaveAttribute("aria-describedby", "galactic-market-trade-reason");
  await expect(tradeReason).toContainText("101");
  await expect(tradeReason).toContainText("100 Hydrogen");

  await market.getByLabel("Quantity to trade").fill("10");
  await expect(tradeReason).toContainText("18 Helium");
  await expect(tradeReason).toContainText("1");
  await expect(tradeReason).toContainText("120");
  await market.getByLabel("Quantity to trade").fill("1");
  await expect(tradeReason).toContainText("2 Helium");

  await market.getByLabel("AP to sell").selectOption("10");
  const apReason = page.locator("#galactic-market-ap-sale-reason");
  await expect(apButton).toBeDisabled();
  await expect(apButton).toHaveAttribute("aria-describedby", "galactic-market-ap-sale-reason");
  await expect(apReason).toContainText("10 AP");
  await expect(apReason).toContainText("3");
  await market.getByLabel("AP to sell").selectOption("1");
  await expect(apButton).toBeEnabled();
  await expect(apReason).toHaveCount(0);
  await expect(apButton).not.toHaveAttribute("aria-describedby", /.+/);
  await apButton.click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().permanent.ascendencyPoints))
    .toBe(2);
  await market.getByLabel("AP to sell").selectOption("5");
  await expect(apButton).toBeDisabled();
  await expect(apReason).toContainText("5 AP");
  await expect(apReason).toContainText("2");

  await page.getByRole("tab", { name: "Rebirth" }).click();
  const liquidationReason = page.locator("#asset-liquidation-reason");
  await expect(liquidationButton).toBeDisabled();
  await expect(liquidationButton).toHaveAttribute(
    "aria-describedby",
    "asset-liquidation-reason",
  );
  await expect(liquidationReason).toContainText("Liquidation is worth");
  await expect(liquidationReason).toContainText("needed for 1 AP");
});

test("Galactic child pages keep localized identity, artwork, and bounds across themes and viewports @galactic-identity-matrix @p65", async ({
  page,
}) => {
  test.setTimeout(600_000);
  await startMetaFixture(page, "meta-galactic-identity-matrix");

  for (const theme of THEME_IDS) {
    await page.locator("#tab-settings").click();
    await page.locator("#tab-settings-visual").click();
    await page.locator("#settings-theme").selectOption(theme);
    await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", theme);

    for (const locale of LOCALE_IDS) {
      await page.locator("#tab-settings").click();
      await page.locator("#tab-settings-game-options").click();
      await page.locator("#settings-language").selectOption(locale);
      await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe(locale);

      for (const viewport of galacticIdentityViewports) {
        await page.setViewportSize(viewport);
        await page.locator("#tab-galaxy").click();
        await expect(page.locator("#pane-galaxy")).toHaveAttribute("aria-labelledby", "tab-galaxy");
        const childTablist = page.locator("#pane-galaxy [role='tablist']");
        const tabs = childTablist.getByRole("tab");
        await expect(tabs).toHaveCount(galacticIdentityPages.length);
        const sourceOrder = await tabs.evaluateAll((items) =>
          items.map((tab) => [tab.id, tab.getAttribute("data-source-option-id")]),
        );
        expect(sourceOrder).toEqual(
          galacticIdentityPages.map((child) => [`tab-${child.id}`, child.sourceOptionId]),
        );

        for (const child of galacticIdentityPages) {
          const tab = page.locator(`#tab-${child.id}`);
          await tab.click();
          await expect(tab).toHaveAttribute("aria-selected", "true");
          await expect(tab).toHaveText(child.label(locale));

          const panel = page.locator(`#panel-${child.id}`);
          await expect(panel).toBeVisible();
          await expect(panel).toHaveAttribute("role", "tabpanel");
          await expect(panel).toHaveAttribute("aria-labelledby", `tab-${child.id}`);
          const pane = panel.locator(child.paneSelector);
          await expect(pane).toBeVisible();
          const title = pane.getByRole("heading", {
            level: 2,
            name: child.title(locale),
            exact: true,
          });
          await expect(title).toBeVisible();
          await expect(
            pane.locator(`.page-artwork-row [data-celestial-illustration='${child.artwork}']`),
          ).toBeVisible();

          const expectedTitleSize = await page
            .locator("#panel-resources-hydrogen .pane-heading h2")
            .evaluate((element) => getComputedStyle(element).fontSize);
          await expect(
            title,
            `${theme}/${locale}/${viewport.width}px ${child.id} title scale`,
          ).toHaveCSS("font-size", expectedTitleSize);

          const geometry = await pane.evaluate((element) => {
            const bounds = element.getBoundingClientRect();
            return {
              left: bounds.left,
              right: bounds.right,
              clientWidth: element.clientWidth,
              scrollWidth: element.scrollWidth,
              documentWidth: document.documentElement.scrollWidth,
              viewportWidth: document.documentElement.clientWidth,
            };
          });
          const context = `${theme}/${locale}/${viewport.width}px ${child.id}`;
          expect(geometry.left, `${context} pane left`).toBeGreaterThanOrEqual(-1);
          expect(geometry.right, `${context} pane right`).toBeLessThanOrEqual(viewport.width + 1);
          expect(geometry.scrollWidth, `${context} pane horizontal overflow`).toBeLessThanOrEqual(
            geometry.clientWidth + 1,
          );
          expect(
            geometry.documentWidth,
            `${context} document horizontal overflow`,
          ).toBeLessThanOrEqual(geometry.viewportWidth);
        }
      }
    }
  }
});

test("moves focus to the Rebirth liquidation heading after successful liquidation @p16-focus", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-market-rebirth-ready");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Rebirth" }).click();
  const rebirth = page.getByTestId("rebirth-pane");
  const trigger = rebirth.getByRole("button", { name: "Liquidate all assets" });
  await trigger.click();
  await page
    .getByRole("dialog", { name: "Confirm asset liquidation" })
    .getByRole("button", { name: "CONFIRM LIQUIDATION" })
    .click();

  await expect(rebirth.locator(".rebirth-liquidation-card h3")).toBeFocused();
  await expect(trigger).toBeDisabled();
});
