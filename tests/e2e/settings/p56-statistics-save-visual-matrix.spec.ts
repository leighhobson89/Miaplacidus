import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { saveText } from "../../../src/i18n/saveMessages";

const viewports = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

test("P-56 Settings Statistics groups and research tooltip stay contained @p56-statistics-visual", async ({
  page,
}, testInfo) => {
  test.setTimeout(240_000);
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await page.locator("#tab-settings").click();
  const settings = page.getByTestId("settings-pane");
  const panel = settings.locator("#panel-settings-statistics");
  await settings.locator("#tab-settings-statistics").click();
  const statistics = settings.getByTestId("settings-statistics");

  for (const locale of LOCALE_IDS) {
    for (const themeId of THEME_IDS) {
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.evaluate(
          ({ nextLocale, nextTheme }) => {
            window.miaplacidusTest!.dispatch({
              type: "settings.update",
              patch: { locale: nextLocale, themeId: nextTheme },
            });
            window.scrollTo(0, 0);
          },
          { nextLocale: locale, nextTheme: themeId },
        );
        await settings.locator("#tab-settings-statistics").click();
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", themeId);
        await expect(statistics.locator(".settings-stat-section")).toHaveCount(14);

        const longestGroupIndex = await statistics
          .locator(".settings-stat-section h3")
          .evaluateAll((headings) => {
            let longestIndex = 0;
            let longestLength = -1;
            headings.forEach((heading, index) => {
              const length = heading.textContent?.trim().length ?? 0;
              if (length > longestLength) {
                longestLength = length;
                longestIndex = index;
              }
            });
            return longestIndex;
          });
        const longestGroup = statistics.locator(".settings-stat-section").nth(longestGroupIndex);
        await longestGroup.scrollIntoViewIfNeeded();

        const geometry = await page.evaluate(() => {
          const panelElement = document.querySelector<HTMLElement>("#panel-settings-statistics");
          const statisticsElement = document.querySelector<HTMLElement>(
            "[data-testid='settings-statistics']",
          );
          const frame = document.querySelector<HTMLElement>(".game-frame:not(.notification-portal)");
          if (!panelElement || !statisticsElement || !frame)
            throw new Error("The Statistics page and Settings panel should render.");

          const rect = (element: Element) => {
            const bounds = element.getBoundingClientRect();
            return {
              left: bounds.left,
              right: bounds.right,
              top: bounds.top,
              bottom: bounds.bottom,
            };
          };
          const horizontallyWithin = (child: Element, parent: Element, tolerance = 1) => {
            const childBounds = child.getBoundingClientRect();
            const parentBounds = parent.getBoundingClientRect();
            return (
              childBounds.left >= parentBounds.left - tolerance &&
              childBounds.right <= parentBounds.right + tolerance
            );
          };
          const statisticsSections = Array.from(
            statisticsElement.querySelectorAll<HTMLElement>(".settings-stat-section"),
          );
          const cards = Array.from(
            statisticsElement.querySelectorAll<HTMLElement>(".settings-stat-card"),
          );
          const textElements = Array.from(
            statisticsElement.querySelectorAll<HTMLElement>("h2, h3, p, dt, dd, small, strong"),
          );
          const links = Array.from(statisticsElement.querySelectorAll<HTMLElement>("a"));
          return {
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            documentWidth: document.documentElement.scrollWidth,
            frameWidth: frame.clientWidth,
            frameScrollWidth: frame.scrollWidth,
            panel: rect(panelElement),
            statistics: rect(statisticsElement),
            panelWidthFits: panelElement.scrollWidth <= panelElement.clientWidth + 1,
            statisticsWidthFits: statisticsElement.scrollWidth <= statisticsElement.clientWidth + 1,
            groups: statisticsSections.map((section) => ({
              withinPage: horizontallyWithin(section, statisticsElement),
              headingWithinGroup: Array.from(section.querySelectorAll<HTMLElement>("h3, p")).every(
                (element) => horizontallyWithin(element, section),
              ),
            })),
            cards: cards.map((card) => ({
              withinPage: horizontallyWithin(card, statisticsElement),
              contentsWithinCard: Array.from(card.querySelectorAll<HTMLElement>("dt, dd")).every(
                (element) => horizontallyWithin(element, card),
              ),
              widthFits: card.scrollWidth <= card.clientWidth + 1,
            })),
            textOverflows: textElements
              .filter((element) => element.scrollWidth > element.clientWidth + 1)
              .map((element) => ({
                text: element.textContent?.trim(),
                scrollWidth: element.scrollWidth,
                clientWidth: element.clientWidth,
              })),
            linksInsideCards: links.every((link) => {
              const card = link.closest(".settings-stat-card");
              return Boolean(card && horizontallyWithin(link, card));
            }),
            scrollHeight: document.documentElement.scrollHeight,
          };
        });

        const label = `${locale}/${themeId}/${viewport.width}px`;
        expect(geometry.documentWidth, `${label} document width`).toBeLessThanOrEqual(
          geometry.viewportWidth,
        );
        expect(geometry.frameScrollWidth, `${label} game frame width`).toBeLessThanOrEqual(
          geometry.frameWidth + 1,
        );
        expect(geometry.panelWidthFits, `${label} panel width`).toBe(true);
        expect(geometry.statisticsWidthFits, `${label} Statistics page width`).toBe(true);
        expect(geometry.groups, `${label} group count`).toHaveLength(14);
        expect(
          geometry.groups.every((group) => group.withinPage && group.headingWithinGroup),
          `${label} group headings and notes stay inside the page`,
        ).toBe(true);
        expect(geometry.cards.length, `${label} visible Statistics cards`).toBeGreaterThan(0);
        expect(
          geometry.cards.every(
            (card) => card.withinPage && card.contentsWithinCard && card.widthFits,
          ),
          `${label} cards and values stay contained`,
        ).toBe(true);
        expect(geometry.textOverflows, `${label} Statistics text wrapping`).toEqual([]);
        expect(geometry.linksInsideCards, `${label} owner links stay inside their cards`).toBe(
          true,
        );
        expect(geometry.scrollHeight, `${label} vertical page scrolling`).toBeGreaterThan(
          geometry.viewportHeight,
        );

        const groupCapture =
          (locale === "de" && themeId === "terminal" && viewport.width === 320) ||
          (locale === "es" && themeId === "light" && viewport.width === 390) ||
          (locale === "pt" && themeId === "space" && viewport.width === 1280) ||
          (locale === "fr" && themeId === "supernova" && viewport.width === 320);
        if (groupCapture) {
          const name = `p56-statistics-${locale}-${themeId}-${viewport.width}-long-group.png`;
          await page.waitForTimeout(500);
          const image = await page.screenshot({
            path: testInfo.outputPath(name),
            animations: "disabled",
          });
          await testInfo.attach(name, { body: image, contentType: "image/png" });
        }

        const researchValue = page.getByTestId("top-stat-rp").locator(".top-stat-value");
        const researchTooltip = page.getByTestId("top-stat-rp").getByRole("tooltip");
        await researchValue.focus();
        await expect(researchTooltip).toBeVisible();
        await researchTooltip.scrollIntoViewIfNeeded();
        const tooltipBounds = await researchTooltip.boundingBox();
        expect(tooltipBounds, `${label} research tooltip bounds`).not.toBeNull();
        expect(tooltipBounds!.x, `${label} research tooltip left`).toBeGreaterThanOrEqual(0);
        expect(
          tooltipBounds!.x + tooltipBounds!.width,
          `${label} research tooltip right`,
        ).toBeLessThanOrEqual(viewport.width + 1);
        expect(tooltipBounds!.y, `${label} research tooltip top`).toBeGreaterThanOrEqual(0);
        expect(
          tooltipBounds!.y + tooltipBounds!.height,
          `${label} research tooltip bottom`,
        ).toBeLessThanOrEqual(viewport.height + 1);

        if (
          (locale === "fr" && themeId === "terminal" && viewport.width === 1280) ||
          (locale === "fr" && themeId === "light" && viewport.width === 320)
        ) {
          const name = `p56-statistics-${locale}-${themeId}-${viewport.width}-research-tooltip.png`;
          await page.waitForTimeout(500);
          const image = await page.screenshot({
            path: testInfo.outputPath(name),
            animations: "disabled",
          });
          await testInfo.attach(name, { body: image, contentType: "image/png" });
        }
        if (locale === "es" && themeId === "space" && viewport.width === 1280) {
          const name = "p56-statistics-es-space-1280-full.png";
          await page.waitForTimeout(500);
          const image = await page.screenshot({
            path: testInfo.outputPath(name),
            fullPage: true,
            animations: "disabled",
          });
          await testInfo.attach(name, { body: image, contentType: "image/png" });
        }
      }
    }
  }
});

test("P-56 Save and Loading import controls stay contained @p56-save-visual", async ({
  freshGame,
}, testInfo) => {
  test.setTimeout(240_000);
  await freshGame.locator("#tab-settings").click();
  const settings = freshGame.getByTestId("settings-pane");
  await settings.locator("#tab-settings-saves").click();
  const panel = settings.getByTestId("settings-saves-panel");
  const manager = panel.getByTestId("save-manager-inline");
  await expect(manager).toBeVisible();

  const exportedCode = await manager.locator("textarea[readonly]").inputValue();
  expect(exportedCode.length, "the deterministic fresh save should be exportable").toBeGreaterThan(
    100,
  );
  await manager.locator("#import-code").fill(exportedCode);
  await manager.getByRole("button", { name: saveText("en", "preview"), exact: true }).click();
  await expect(manager.getByTestId("import-preview")).toBeVisible();
  await expect(manager.getByRole("alert")).toBeVisible();

  for (const locale of LOCALE_IDS) {
    for (const themeId of THEME_IDS) {
      for (const viewport of viewports) {
        await freshGame.setViewportSize(viewport);
        await freshGame.evaluate(
          ({ nextLocale, nextTheme }) => {
            window.miaplacidusTest!.dispatch({
              type: "settings.update",
              patch: { locale: nextLocale, themeId: nextTheme },
            });
            window.scrollTo(0, 0);
          },
          { nextLocale: locale, nextTheme: themeId },
        );
        await settings.locator("#tab-settings-saves").click();
        await expect(freshGame.locator("html")).toHaveAttribute("lang", locale);
        await expect(freshGame.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", themeId);
        await expect(manager.getByTestId("import-preview")).toBeVisible();
        await expect(
          manager.getByRole("button", { name: saveText(locale, "replace"), exact: true }),
        ).toBeDisabled();
        await expect(
          manager.getByRole("button", { name: saveText(locale, "importNew"), exact: true }),
        ).toBeVisible();
        await expect(
          manager.getByRole("button", { name: saveText(locale, "cancelImport"), exact: true }),
        ).toBeVisible();

        const importCard = manager.locator(".import-card");
        await importCard.scrollIntoViewIfNeeded();
        const geometry = await freshGame.evaluate(() => {
          const savePanel = document.querySelector<HTMLElement>(
            "[data-testid='settings-saves-panel']",
          );
          const managerElement = document.querySelector<HTMLElement>(
            "[data-testid='save-manager-inline']",
          );
          const importElement = managerElement?.querySelector<HTMLElement>(".import-card");
          const preview = managerElement?.querySelector<HTMLElement>(
            "[data-testid='import-preview']",
          );
          const frame = document.querySelector<HTMLElement>(".game-frame:not(.notification-portal)");
          const replaceButton = managerElement?.querySelector<HTMLButtonElement>(
            ".import-conflict > .danger-button:disabled",
          );
          if (!savePanel || !managerElement || !importElement || !preview || !frame)
            throw new Error("The Save & Loading import preview should render.");
          if (!replaceButton)
            throw new Error("The matching-save replace control should be disabled.");

          const rect = (element: Element) => {
            const bounds = element.getBoundingClientRect();
            return {
              left: bounds.left,
              right: bounds.right,
              top: bounds.top,
              bottom: bounds.bottom,
            };
          };
          const within = (child: Element, parent: Element, tolerance = 1) => {
            const childBounds = child.getBoundingClientRect();
            const parentBounds = parent.getBoundingClientRect();
            return (
              childBounds.left >= parentBounds.left - tolerance &&
              childBounds.right <= parentBounds.right + tolerance &&
              childBounds.top >= parentBounds.top - tolerance &&
              childBounds.bottom <= parentBounds.bottom + tolerance
            );
          };
          const visible = (element: Element) => element.getClientRects().length > 0;
          const disabledTextProbe = document.createElement("span");
          disabledTextProbe.style.cssText =
            "position: absolute; visibility: hidden; color: var(--disabled-text)";
          frame.append(disabledTextProbe);
          const expectedDisabledTextColor = getComputedStyle(disabledTextProbe).color;
          disabledTextProbe.remove();
          const replaceStyle = getComputedStyle(replaceButton);
          const controls = Array.from(
            savePanel.querySelectorAll<HTMLElement>("button, input, textarea, select"),
          ).filter(visible);
          const textElements = Array.from(
            savePanel.querySelectorAll<HTMLElement>(
              "h2, h3, p, label, legend, small, output, summary",
            ),
          ).filter(visible);
          return {
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            documentWidth: document.documentElement.scrollWidth,
            frameWidth: frame.clientWidth,
            frameScrollWidth: frame.scrollWidth,
            panel: rect(savePanel),
            manager: rect(managerElement),
            importCard: rect(importElement),
            preview: rect(preview),
            replaceButtonColor: replaceStyle.color,
            replaceButtonOpacity: replaceStyle.opacity,
            expectedDisabledTextColor,
            panelWidthFits: savePanel.scrollWidth <= savePanel.clientWidth + 1,
            managerWidthFits: managerElement.scrollWidth <= managerElement.clientWidth + 1,
            importCardWidthFits: importElement.scrollWidth <= importElement.clientWidth + 1,
            previewWithinCard: within(preview, importElement),
            previewTextWithin: Array.from(preview.querySelectorAll<HTMLElement>("p, strong")).every(
              (element) =>
                within(element, preview) && element.scrollWidth <= element.clientWidth + 1,
            ),
            controls: controls.map((control) => {
              const parent = control.closest("[data-testid='save-manager-inline']") ?? savePanel;
              return {
                tag: control.tagName,
                type: control.getAttribute("type"),
                bounds: rect(control),
                clientWidth: control.clientWidth,
                scrollWidth: control.scrollWidth,
                overflowX: getComputedStyle(control).overflowX,
                withinPanel: within(control, savePanel),
                withinManager: parent === managerElement ? within(control, managerElement) : true,
                contentWidthFits:
                  control.type === "file" ||
                  control.tagName === "TEXTAREA" ||
                  control.scrollWidth <= control.clientWidth + 1,
              };
            }),
            textOverflows: textElements
              .filter((element) => element.scrollWidth > element.clientWidth + 1)
              .map((element) => ({
                text: element.textContent?.trim(),
                scrollWidth: element.scrollWidth,
                clientWidth: element.clientWidth,
              })),
            scrollHeight: document.documentElement.scrollHeight,
          };
        });

        const label = `${locale}/${themeId}/${viewport.width}px`;
        expect(geometry.documentWidth, `${label} document width`).toBeLessThanOrEqual(
          geometry.viewportWidth,
        );
        expect(geometry.frameScrollWidth, `${label} frame width`).toBeLessThanOrEqual(
          geometry.frameWidth + 1,
        );
        expect(geometry.panelWidthFits, `${label} Save & Loading panel width`).toBe(true);
        expect(geometry.managerWidthFits, `${label} Save Manager width`).toBe(true);
        expect(geometry.importCardWidthFits, `${label} import card width`).toBe(true);
        expect(geometry.previewWithinCard, `${label} import preview containment`).toBe(true);
        expect(geometry.previewTextWithin, `${label} import preview text wrapping`).toBe(true);
        expect(
          geometry.replaceButtonColor,
          `${label} disabled control uses theme disabled text`,
        ).toBe(geometry.expectedDisabledTextColor);
        expect(
          geometry.replaceButtonOpacity,
          `${label} disabled control text remains legible`,
        ).toBe("1");
        expect(geometry.controls.length, `${label} visible save/import controls`).toBeGreaterThan(
          0,
        );
        expect(
          geometry.controls.filter(
            (control) =>
              !control.withinPanel || !control.withinManager || !control.contentWidthFits,
          ),
          `${label} failing save/import control bounds`,
        ).toEqual([]);
        expect(geometry.textOverflows, `${label} save/import labels wrap`).toEqual([]);
        expect(geometry.scrollHeight, `${label} vertical page scrolling`).toBeGreaterThan(
          geometry.viewportHeight,
        );

        const capture =
          (locale === "de" && themeId === "terminal" && viewport.width === 320) ||
          (locale === "es" && themeId === "light" && viewport.width === 390) ||
          (locale === "fr" && themeId === "space" && viewport.width === 1280) ||
          (locale === "pt" && themeId === "supernova" && viewport.width === 390);
        if (capture) {
          const name = `p56-save-${locale}-${themeId}-${viewport.width}-import-preview.png`;
          await freshGame.waitForTimeout(500);
          const image = await freshGame.screenshot({
            path: testInfo.outputPath(name),
            animations: "disabled",
          });
          await testInfo.attach(name, { body: image, contentType: "image/png" });
        }
      }
    }
  }
});
