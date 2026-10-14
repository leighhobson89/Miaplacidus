import type { Page, TestInfo } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { marketText } from "../../../src/i18n/metaMessages";

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
  await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", themeId);
}

async function expectMarketContained(page: Page, label: string): Promise<void> {
  const bounds = await page.evaluate(() => {
    const pane = document.querySelector<HTMLElement>(".galactic-market-pane");
    const grid = pane?.querySelector<HTMLElement>(".action-grid");
    if (!pane || !grid) throw new Error("Galactic Market content grid is missing");

    const rect = (element: HTMLElement) => {
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
    };
    const visible = (element: HTMLElement) =>
      getComputedStyle(element).display !== "none" &&
      getComputedStyle(element).visibility !== "hidden" &&
      element.getClientRects().length > 0;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(":scope > .upgrade-card"));
    const cardMeasurements = cards.map((card) => {
      const cardBounds = rect(card);
      const nodes = Array.from(
        card.querySelectorAll<HTMLElement>("h3, p, label, select, input, button"),
      )
        .filter(visible)
        .map((element) => ({
          tag: element.tagName.toLowerCase(),
          text: element.innerText || element.getAttribute("aria-label") || element.value || "",
          ...rect(element),
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
        }));
      return {
        ...cardBounds,
        clientWidth: card.clientWidth,
        scrollWidth: card.scrollWidth,
        nodes,
      };
    });
    const copyNodes = Array.from(
      pane.querySelectorAll<HTMLElement>(
        ".pane-heading h2, .pane-heading p, .market-rate-detail, .market-history h3, .market-history p, .market-history li",
      ),
    )
      .filter(visible)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        text: element.innerText,
        ...rect(element),
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));
    const paneRect = rect(pane);
    const gridRect = rect(grid);
    return {
      viewportWidth: document.documentElement.clientWidth,
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      pane: {
        ...paneRect,
        clientWidth: pane.clientWidth,
        scrollWidth: pane.scrollWidth,
      },
      grid: { ...gridRect, clientWidth: grid.clientWidth, scrollWidth: grid.scrollWidth },
      cards: cardMeasurements,
      copyNodes,
    };
  });

  expect(bounds.viewportWidth, `${label} viewport`).toBeGreaterThan(0);
  expect(bounds.documentWidth, `${label} document width`).toBeLessThanOrEqual(bounds.viewportWidth);
  expect(bounds.pane.left, `${label} Market pane left edge`).toBeGreaterThanOrEqual(-1);
  expect(bounds.pane.right, `${label} Market pane right edge`).toBeLessThanOrEqual(
    bounds.viewportWidth + 1,
  );
  expect(bounds.pane.scrollWidth, `${label} Market pane internal width`).toBeLessThanOrEqual(
    bounds.pane.clientWidth + 1,
  );
  expect(bounds.grid.left, `${label} action grid left edge`).toBeGreaterThanOrEqual(
    bounds.pane.left - 1,
  );
  expect(bounds.grid.right, `${label} action grid right edge`).toBeLessThanOrEqual(
    bounds.pane.right + 1,
  );
  expect(bounds.grid.scrollWidth, `${label} action grid internal width`).toBeLessThanOrEqual(
    bounds.grid.clientWidth + 1,
  );
  expect(bounds.cards, `${label} trade and AP sale cards`).toHaveLength(2);

  for (const [index, card] of bounds.cards.entries()) {
    const cardLabel = `${label} card ${index + 1}`;
    expect(card.left, `${cardLabel} left edge`).toBeGreaterThanOrEqual(bounds.grid.left - 1);
    expect(card.right, `${cardLabel} right edge`).toBeLessThanOrEqual(bounds.grid.right + 1);
    expect(card.scrollWidth, `${cardLabel} internal width`).toBeLessThanOrEqual(
      card.clientWidth + 1,
    );
    for (const node of card.nodes) {
      const nodeLabel = `${cardLabel} ${node.tag} ${node.text}`;
      expect(node.left, `${nodeLabel} left edge`).toBeGreaterThanOrEqual(card.left - 1);
      expect(node.right, `${nodeLabel} right edge`).toBeLessThanOrEqual(card.right + 1);
      if (["h3", "p", "label", "button"].includes(node.tag)) {
        expect(node.scrollWidth, `${nodeLabel} text fit`).toBeLessThanOrEqual(node.clientWidth + 2);
      }
    }
  }
  for (const node of bounds.copyNodes) {
    const nodeLabel = `${label} ${node.tag} ${node.text}`;
    expect(node.left, `${nodeLabel} left edge`).toBeGreaterThanOrEqual(bounds.pane.left - 1);
    expect(node.right, `${nodeLabel} right edge`).toBeLessThanOrEqual(bounds.pane.right + 1);
    expect(node.scrollWidth, `${nodeLabel} text fit`).toBeLessThanOrEqual(node.clientWidth + 2);
  }
}

test("P-56 Galactic Market quote content fits every locale, theme, and viewport @p56-market-content-visual @galactic-market @presentation", async ({
  page,
}, testInfo) => {
  test.setTimeout(240_000);
  await startMetaFixture(page, "meta-market-ready");
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

  const captures = new Set(["en/terminal/1280", "de/light/390", "pt/galaxy/1280", "fr/space/320"]);
  const market = page.locator(".galactic-market-pane");
  for (const locale of LOCALE_IDS) {
    for (const themeId of THEME_IDS) {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await setPresentation(page, locale, themeId);
        await page.locator("#tab-galaxy").click();
        const marketTab = page.locator("#tab-galactic-market");
        await expect(marketTab, `${locale}/${themeId} Market child tab`).toBeVisible();
        await marketTab.click();
        await expect(market, `${locale}/${themeId} Market pane`).toBeVisible();
        await expect(marketTab).toHaveAttribute("aria-selected", "true");
        await expect(market).toHaveAttribute("aria-labelledby", "galactic-market-title");
        await expect(market.locator("#galactic-market-title")).toHaveText(
          marketText(locale, "heading"),
        );
        await expect(market.locator(".pane-heading p")).toHaveText(
          marketText(locale, "description"),
        );
        await expect(
          market.locator(".page-artwork-row [data-celestial-illustration='asteroid']"),
        ).toBeVisible();
        await expect(market.locator(".action-grid > .upgrade-card")).toHaveCount(2);

        const outgoing = market.getByLabel(marketText(locale, "tradeRow"));
        const incoming = market.getByLabel(marketText(locale, "tradeFor"));
        const quantity = market.getByLabel(marketText(locale, "quantity"));
        await outgoing.selectOption("hydrogen");
        await incoming.selectOption("helium");
        await quantity.fill("10");
        await expect(
          market.getByRole("heading", { name: marketText(locale, "preview") }),
        ).toBeVisible();
        await expect(market.locator(".market-rate-detail")).toHaveCount(2);
        await expect(
          market.getByRole("button", { name: marketText(locale, "trade") }),
        ).toBeVisible();
        await expect(
          market.getByRole("heading", { name: marketText(locale, "history") }),
        ).toBeVisible();
        await expect(market.locator(".market-history")).toContainText(
          marketText(locale, "noHistory"),
        );

        const label = `${locale}/${themeId} Market at ${viewport.width}px`;
        await expectMarketContained(page, label);

        const key = `${locale}/${themeId}/${viewport.width}`;
        if (captures.has(key)) {
          await capture(page, testInfo, `p56-market-${locale}-${themeId}-${viewport.width}.png`);
        }
      }
    }
  }
});
