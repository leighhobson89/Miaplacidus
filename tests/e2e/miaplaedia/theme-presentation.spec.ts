import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { settingsSectionName } from "../../../src/i18n/settingsMessages";

test("Miaplaedia guide content fits all themes at desktop and phone widths @theme-miaplaedia-matrix", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const guidePaneIds = [
    "miaplaedia-get-started",
    "miaplaedia-story",
    "miaplaedia-concepts-early",
    "miaplaedia-concepts-mid",
    "miaplaedia-concepts-late",
    "miaplaedia-end-goal",
    "miaplaedia-philosophies",
  ] as const;
  await startMetaFixture(page, "meta-megastructure-route");
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    await page.setViewportSize(viewport);
    for (const theme of THEME_IDS) {
      await page.locator("#tab-settings").click();
      await page.locator("#tab-settings-visual").click();
      await page.locator("#settings-theme").selectOption(theme);
      await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", theme);

      const apValue = page.getByTestId("top-stat-ap").locator(".top-stat-value");
      await apValue.focus();
      const apTooltip = page.getByTestId("top-stat-ap").getByRole("tooltip");
      await expect(apTooltip).toBeVisible();
      const apBounds = await apTooltip.evaluate((element) => {
        const { left, right } = element.getBoundingClientRect();
        return { left, right, viewportWidth: window.innerWidth };
      });
      expect(
        apBounds.left,
        `${theme} AP tooltip left at ${viewport.width}px: ${JSON.stringify(apBounds)}`,
      ).toBeGreaterThanOrEqual(0);
      expect(
        apBounds.right,
        `${theme} AP tooltip right at ${viewport.width}px: ${JSON.stringify(apBounds)}`,
      ).toBeLessThanOrEqual(viewport.width);
      await apValue.evaluate((element) => element.blur());

      await page.locator("#tab-miaplaedia").click();
      const miaplaedia = page.locator("#pane-miaplaedia");
      await expect(miaplaedia.locator(".page-artwork-row")).toHaveCount(0);
      for (const paneId of guidePaneIds) {
        await page.locator(`#tab-${paneId}`).click();
        const guidePanel = page.locator(`#panel-${paneId}`);
        const guideTitle = guidePanel.locator(".miaplaedia-page .game-page-title");
        const guideContent = guidePanel.locator(".miaplaedia-page");
        await expect(guideTitle, `${theme} ${paneId} title`).toBeVisible();
        const guideBounds = await page.evaluate((id) => {
          const pane = document.querySelector<HTMLElement>("#pane-miaplaedia");
          const content = document.querySelector<HTMLElement>(`#panel-${id} .miaplaedia-page`);
          if (!pane || !content) throw new Error("Miaplaedia pane and guide content should render");
          const paneRect = pane.getBoundingClientRect();
          const contentRect = content.getBoundingClientRect();
          return {
            paneLeft: paneRect.left,
            paneRight: paneRect.right,
            contentLeft: contentRect.left,
            contentRight: contentRect.right,
            contentClientWidth: content.clientWidth,
            contentScrollWidth: content.scrollWidth,
            documentWidth: document.documentElement.scrollWidth,
          };
        }, paneId);
        const label = `${theme} ${paneId} at ${viewport.width}px`;
        expect(guideBounds.paneLeft, `${label} Miaplaedia pane left`).toBeGreaterThanOrEqual(-1);
        expect(guideBounds.paneRight, `${label} Miaplaedia pane right`).toBeLessThanOrEqual(
          viewport.width + 1,
        );
        expect(guideBounds.contentLeft, `${label} guide content left`).toBeGreaterThanOrEqual(
          guideBounds.paneLeft - 1,
        );
        expect(guideBounds.contentRight, `${label} guide content right`).toBeLessThanOrEqual(
          guideBounds.paneRight + 1,
        );
        expect(
          guideBounds.contentScrollWidth,
          `${label} guide content overflow`,
        ).toBeLessThanOrEqual(guideBounds.contentClientWidth);
        expect(guideBounds.documentWidth, `${label} document width`).toBeLessThanOrEqual(
          viewport.width,
        );
        await expect(guideContent).toBeVisible();
      }
    }
  }
});

test("Miaplaedia guide identities fit every locale and viewport width @miaplaedia-locale-matrix", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const guidePaneIds = [
    "miaplaedia-get-started",
    "miaplaedia-story",
    "miaplaedia-concepts-early",
    "miaplaedia-concepts-mid",
    "miaplaedia-concepts-late",
    "miaplaedia-end-goal",
    "miaplaedia-philosophies",
  ] as const;
  const viewports = [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ];

  await startMetaFixture(page, "meta-megastructure-route");
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    const hydrogenTitleSize = await page
      .locator("#panel-resources-hydrogen .pane-heading h2")
      .evaluate((element) => getComputedStyle(element).fontSize);
    await page.locator("#tab-miaplaedia").click();

    for (const locale of LOCALE_IDS) {
      await page.evaluate((nextLocale) => {
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        });
      }, locale);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      const miaplaedia = page.locator("#pane-miaplaedia");
      await expect(miaplaedia.locator(".page-artwork-row")).toHaveCount(0);

      for (const paneId of guidePaneIds) {
        const tab = page.locator(`#tab-${paneId}`);
        await tab.click();
        const title = page.locator(`#panel-${paneId} .miaplaedia-page .game-page-title`);
        await expect(title, `${locale} ${paneId} title`).toBeVisible();
        await expect(tab, `${locale} ${paneId} is selected`).toHaveAttribute(
          "aria-selected",
          "true",
        );
        await expect(title, `${locale} ${paneId} tab/title identity`).toHaveText(
          (await tab.innerText()).trim(),
        );
        await expect(title, `${locale} ${paneId} title scale`).toHaveCSS(
          "font-size",
          hydrogenTitleSize,
        );
        const bounds = await page.evaluate((id) => {
          const pane = document.querySelector<HTMLElement>("#pane-miaplaedia");
          const content = document.querySelector<HTMLElement>(`#panel-${id} .miaplaedia-page`);
          if (!pane || !content) throw new Error("Miaplaedia pane and guide content should render");
          const paneRect = pane.getBoundingClientRect();
          const contentRect = content.getBoundingClientRect();
          return {
            paneLeft: paneRect.left,
            paneRight: paneRect.right,
            contentLeft: contentRect.left,
            contentRight: contentRect.right,
            contentWidth: content.clientWidth,
            contentScrollWidth: content.scrollWidth,
            documentWidth: document.documentElement.scrollWidth,
          };
        }, paneId);
        const label = `${locale} ${paneId} at ${viewport.width}px`;
        expect(bounds.paneLeft, `${label} pane left`).toBeGreaterThanOrEqual(-1);
        expect(bounds.paneRight, `${label} pane right`).toBeLessThanOrEqual(viewport.width + 1);
        expect(bounds.contentLeft, `${label} content left`).toBeGreaterThanOrEqual(
          bounds.paneLeft - 1,
        );
        expect(bounds.contentRight, `${label} content right`).toBeLessThanOrEqual(
          bounds.paneRight + 1,
        );
        expect(bounds.contentScrollWidth, `${label} content overflow`).toBeLessThanOrEqual(
          bounds.contentWidth,
        );
        expect(bounds.documentWidth, `${label} document width`).toBeLessThanOrEqual(viewport.width);
      }
    }
  }
});
