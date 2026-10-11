import type { Page, TestInfo } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { marketText, metaText, rebirthText } from "../../../src/i18n/metaMessages";

const VIEWPORTS = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

async function capture(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const path = testInfo.outputPath(name);
  await page.screenshot({ path, fullPage: true, animations: "disabled", caret: "hide" });
  await testInfo.attach(name, { path, contentType: "image/png" });
}

async function setPresentation(
  page: Page,
  locale: (typeof LOCALE_IDS)[number],
  themeId: (typeof THEME_IDS)[number],
): Promise<void> {
  await page.evaluate(
    ({ locale, themeId }) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale, themeId },
      });
    },
    { locale, themeId },
  );
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", themeId);
}

async function expectRebirthContained(page: Page, label: string): Promise<void> {
  const bounds = await page.evaluate(() => {
    const pane = document.querySelector<HTMLElement>('[data-testid="rebirth-pane"]');
    const heading = pane?.querySelector<HTMLElement>(".pane-heading h2");
    const grid = pane?.querySelector<HTMLElement>(".action-grid");
    const artwork = pane?.querySelector<HTMLElement>(".page-artwork-row");
    const dialog = pane?.querySelector<HTMLElement>(".rebirth-liquidation-card dialog:modal");
    if (!pane || !heading || !grid || !artwork || !dialog) {
      throw new Error(
        "Expected Rebirth pane, heading, artwork, action grid, and open liquidation dialog",
      );
    }

    const rect = (element: HTMLElement) => {
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
    };
    const visible = (element: HTMLElement) =>
      getComputedStyle(element).display !== "none" &&
      getComputedStyle(element).visibility !== "hidden" &&
      element.getClientRects().length > 0;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(":scope > .upgrade-card"));
    const cardMeasurements = cards.map((card) => ({
      ...rect(card),
      clientWidth: card.clientWidth,
      scrollWidth: card.scrollWidth,
      nodes: Array.from(card.querySelectorAll<HTMLElement>("h3, p, button"))
        .filter((element) => visible(element) && !element.closest("dialog"))
        .map((element) => ({
          tag: element.tagName.toLowerCase(),
          text: element.innerText || element.getAttribute("aria-label") || "",
          ...rect(element),
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
        })),
    }));
    const dialogNodes = Array.from(dialog.querySelectorAll<HTMLElement>("h2, p, button"))
      .filter(visible)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        text: element.innerText || element.getAttribute("aria-label") || "",
        ...rect(element),
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));
    const paneRect = rect(pane);
    const headingRect = rect(heading);
    const gridRect = rect(grid);
    const artworkRect = rect(artwork);
    const dialogRect = rect(dialog);
    return {
      viewportWidth: document.documentElement.clientWidth,
      viewportHeight: document.documentElement.clientHeight,
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      documentHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
      pane: { ...paneRect, clientWidth: pane.clientWidth, scrollWidth: pane.scrollWidth },
      heading: {
        ...headingRect,
        clientWidth: heading.clientWidth,
        scrollWidth: heading.scrollWidth,
      },
      grid: { ...gridRect, clientWidth: grid.clientWidth, scrollWidth: grid.scrollWidth },
      artwork: {
        ...artworkRect,
        clientWidth: artwork.clientWidth,
        scrollWidth: artwork.scrollWidth,
      },
      dialog: { ...dialogRect, clientWidth: dialog.clientWidth, scrollWidth: dialog.scrollWidth },
      cards: cardMeasurements,
      dialogNodes,
    };
  });

  expect(bounds.viewportWidth, `${label} viewport`).toBeGreaterThan(0);
  expect(bounds.viewportHeight, `${label} viewport height`).toBeGreaterThan(0);
  expect(bounds.documentWidth, `${label} document width`).toBeLessThanOrEqual(
    bounds.viewportWidth,
  );
  for (const [name, box] of Object.entries({
    pane: bounds.pane,
    heading: bounds.heading,
    artwork: bounds.artwork,
    grid: bounds.grid,
    dialog: bounds.dialog,
  })) {
    expect(box.left, `${label} ${name} left edge`).toBeGreaterThanOrEqual(-1);
    expect(box.right, `${label} ${name} right edge`).toBeLessThanOrEqual(
      bounds.viewportWidth + 1,
    );
    expect(box.scrollWidth, `${label} ${name} internal width`).toBeLessThanOrEqual(
      box.clientWidth + 1,
    );
  }
  for (const [name, box] of Object.entries({
    pane: bounds.pane,
    heading: bounds.heading,
    artwork: bounds.artwork,
    grid: bounds.grid,
  })) {
    expect(box.top, `${label} ${name} document top`).toBeGreaterThanOrEqual(-1);
    expect(box.bottom, `${label} ${name} document bottom`).toBeLessThanOrEqual(
      bounds.documentHeight + 1,
    );
  }
  expect(bounds.dialog.top, `${label} dialog top in viewport`).toBeGreaterThanOrEqual(-1);
  expect(bounds.dialog.bottom, `${label} dialog bottom in viewport`).toBeLessThanOrEqual(
    bounds.viewportHeight + 1,
  );
  expect(bounds.cards, `${label} AP, rebirth, and liquidation cards`).toHaveLength(3);

  for (const [index, card] of bounds.cards.entries()) {
    const cardLabel = `${label} card ${index + 1}`;
    expect(card.left, `${cardLabel} left edge`).toBeGreaterThanOrEqual(bounds.grid.left - 1);
    expect(card.right, `${cardLabel} right edge`).toBeLessThanOrEqual(bounds.grid.right + 1);
    expect(card.top, `${cardLabel} top edge`).toBeGreaterThanOrEqual(bounds.grid.top - 1);
    expect(card.bottom, `${cardLabel} bottom edge`).toBeLessThanOrEqual(bounds.grid.bottom + 1);
    expect(card.top, `${cardLabel} document top`).toBeGreaterThanOrEqual(-1);
    expect(card.bottom, `${cardLabel} document bottom`).toBeLessThanOrEqual(
      bounds.documentHeight + 1,
    );
    expect(card.scrollWidth, `${cardLabel} internal width`).toBeLessThanOrEqual(
      card.clientWidth + 1,
    );
    for (const node of card.nodes) {
      const nodeLabel = `${cardLabel} ${node.tag} ${node.text}`;
      expect(node.left, `${nodeLabel} left edge`).toBeGreaterThanOrEqual(card.left - 1);
      expect(node.right, `${nodeLabel} right edge`).toBeLessThanOrEqual(card.right + 1);
      expect(node.top, `${nodeLabel} top edge`).toBeGreaterThanOrEqual(card.top - 1);
      expect(node.bottom, `${nodeLabel} bottom edge`).toBeLessThanOrEqual(card.bottom + 1);
      if (["h3", "p", "button"].includes(node.tag)) {
        expect(node.scrollWidth, `${nodeLabel} text fit`).toBeLessThanOrEqual(node.clientWidth + 2);
      }
    }
  }
  for (const node of bounds.dialogNodes) {
    const nodeLabel = `${label} dialog ${node.tag} ${node.text}`;
    expect(node.left, `${nodeLabel} left edge`).toBeGreaterThanOrEqual(bounds.dialog.left - 1);
    expect(node.right, `${nodeLabel} right edge`).toBeLessThanOrEqual(bounds.dialog.right + 1);
    expect(node.top, `${nodeLabel} top edge`).toBeGreaterThanOrEqual(bounds.dialog.top - 1);
    expect(node.bottom, `${nodeLabel} bottom edge`).toBeLessThanOrEqual(
      bounds.dialog.bottom + 1,
    );
    if (["h2", "p", "button"].includes(node.tag)) {
      expect(node.scrollWidth, `${nodeLabel} text fit`).toBeLessThanOrEqual(node.clientWidth + 2);
    }
  }
}

test(
  "P-56 Galactic Rebirth content fits every locale, theme, and viewport @p56-rebirth-content-visual @galactic-market @presentation",
  async ({ page }, testInfo) => {
    test.setTimeout(240_000);
    await startMetaFixture(page, "meta-market-rebirth-ready");
    await expect(page.locator("[data-app-ready]")).toBeVisible();
    await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { notificationsEnabled: false },
      }),
    );
    await expect(page.locator('[data-testid="game-notification"]')).toHaveCount(0);
    await page.addStyleTag({
      content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
    });

    const captures = new Set([
      "en/terminal/1280",
      "de/light/390",
      "pt/galaxy/1280",
      "fr/space/320",
    ]);
    const dialogCapture = "p56-rebirth-fr-space-320-dialog.png";
    const pane = page.getByTestId("rebirth-pane");
    const marketPane = page.locator(".galactic-market-pane");

    for (const locale of LOCALE_IDS) {
      for (const themeId of THEME_IDS) {
        for (const viewport of VIEWPORTS) {
          await page.setViewportSize(viewport);
          await setPresentation(page, locale, themeId);
          await page.locator("#tab-galaxy").click();

          const rebirthTab = page.locator("#tab-galactic-rebirth");
          await expect(rebirthTab, `${locale}/${themeId} Rebirth child tab`).toBeVisible();
          await expect(rebirthTab).toHaveAttribute("data-source-option-id", "option1");
          await expect(page.locator("#tab-galactic-market")).toBeVisible();
          await page.locator("#tab-galactic-market").click();
          await expect(marketPane).toBeVisible();
          await expect(marketPane.locator(".rebirth-liquidation-card")).toHaveCount(0);

          await rebirthTab.click();
          await expect(rebirthTab).toHaveAttribute("aria-selected", "true");
          await expect(pane).toBeVisible();
          await expect(pane).toHaveAttribute("aria-labelledby", "rebirth-pane-title");
          await expect(pane.locator("#rebirth-pane-title")).toHaveText(
            rebirthText(locale, "title"),
          );
          await expect(
            pane.locator('.page-artwork-row [data-celestial-illustration="megastructure"]'),
          ).toBeVisible();
          const cards = pane.locator(".action-grid > .upgrade-card");
          await expect(cards).toHaveCount(3);
          await expect(cards.nth(0).locator("h3")).toContainText(metaText(locale, "ap"));
          await expect(cards.nth(1).locator("h3")).toContainText(metaText(locale, "rebirths"));
          await expect(cards.nth(2).locator("h3")).toContainText(
            marketText(locale, "liquidation"),
          );
          const liquidationCard = pane.locator(".rebirth-liquidation-card");
          await expect(liquidationCard).toHaveCount(1);
          await expect(liquidationCard).toContainText(marketText(locale, "liquidationValue"));
          await expect(liquidationCard).toContainText(marketText(locale, "liquidationAp"));

          const key = `${locale}/${themeId}/${viewport.width}`;
          if (captures.has(key)) {
            await capture(
              page,
              testInfo,
              `p56-rebirth-${locale}-${themeId}-${viewport.width}.png`,
            );
          }

          const liquidationButton = pane.getByRole("button", {
            name: marketText(locale, "liquidate"),
            exact: true,
          });
          await expect(liquidationButton).toBeEnabled();
          await liquidationButton.click();
          const dialog = page.getByRole("dialog", {
            name: marketText(locale, "liquidateTitle"),
            exact: true,
          });
          await expect(dialog).toBeVisible();
          await expect(dialog).toContainText(marketText(locale, "liquidatePrompt"));
          await expect(
            dialog.getByRole("button", {
              name: marketText(locale, "confirmLiquidation"),
              exact: true,
            }),
          ).toBeVisible();
          await expect(
            dialog.getByRole("button", { name: marketText(locale, "cancel"), exact: true }),
          ).toBeVisible();

          const label = `${locale}/${themeId} Rebirth at ${viewport.width}px`;
          await expectRebirthContained(page, label);
          if (key === "fr/space/320") await capture(page, testInfo, dialogCapture);

          await dialog
            .getByRole("button", { name: marketText(locale, "cancel"), exact: true })
            .click();
          await expect(dialog).toBeHidden();
        }
      }
    }
  },
);
