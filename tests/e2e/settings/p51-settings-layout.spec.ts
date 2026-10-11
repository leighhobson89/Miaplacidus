import { expect, test } from "../_harness/fixtures";
import { settingsText } from "../../../src/i18n/settingsMessages";
import { saveText } from "../../../src/i18n/saveMessages";

const SETTINGS_PANES = [
  "settings-game-options",
  "settings-visual",
  "settings-saves",
  "settings-achievements",
  "settings-events",
  "settings-statistics",
] as const;

test("P-51 Settings pages stay contained at narrow widths in Terminal and Light @p51-settings-layout @settings @presentation", async ({
  freshGame,
}, testInfo) => {
  test.setTimeout(120_000);

  await freshGame.locator("#tab-settings").click();
  const settings = freshGame.getByTestId("settings-pane");
  await settings.locator("#tab-settings-game-options").click();
  await settings.locator("#settings-language").selectOption("fr");

  for (const width of [320, 390] as const) {
    await freshGame.setViewportSize({ width, height: 844 });

    for (const theme of ["terminal", "light"] as const) {
      await settings.locator("#tab-settings-visual").click();
      await settings.locator("#settings-theme").selectOption(theme);
      await expect(freshGame.locator(".game-frame")).toHaveAttribute("data-theme", theme);

      for (const paneId of SETTINGS_PANES) {
        await settings.locator(`#tab-${paneId}`).click();
        const panel = settings.locator(`#panel-${paneId}`);
        await expect(panel).toBeVisible();

        if (paneId === "settings-achievements") {
          const infoButton = panel.locator(".achievement-description-help > button").first();
          await infoButton.focus();
          const tooltip = panel.getByRole("tooltip").first();
          await expect(tooltip).toBeVisible();
          const tooltipBounds = await tooltip.evaluate((element) => {
            const rect = element.getBoundingClientRect();
            return {
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            };
          });
          expect(
            tooltipBounds.left,
            `achievement tooltip left edge at ${width}px ${theme}`,
          ).toBeGreaterThanOrEqual(0);
          expect(
            tooltipBounds.right,
            `achievement tooltip right edge at ${width}px ${theme}`,
          ).toBeLessThanOrEqual(width + 1);
        }

        if (paneId === "settings-events") {
          const probabilities = panel.locator(".journal-event-odds");
          await probabilities.locator("summary").click();
          await expect(probabilities).toHaveAttribute("open", "");
        }

        if (paneId === "settings-saves") {
          const deleteButton = panel.getByRole("button", { name: saveText("fr", "delete") });
          await deleteButton.click();
          await expect(panel.getByText(saveText("fr", "deletePrompt"))).toBeVisible();
          await expect(
            panel.getByRole("checkbox", { name: saveText("fr", "exportFirst") }),
          ).toBeVisible();
        }

        const geometry = await settings.evaluate((root, activePanelId) => {
          const viewportWidth = document.documentElement.clientWidth;
          const rootElement = root as HTMLElement;
          const panelElement = rootElement.querySelector<HTMLElement>(`#panel-${activePanelId}`);
          if (!panelElement) throw new Error(`Missing active Settings panel: ${activePanelId}`);

          const visible = Array.from(rootElement.querySelectorAll<HTMLElement>("*")).filter(
            (element) => {
              if (element.closest("[hidden]")) return false;
              const style = getComputedStyle(element);
              return (
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                element.getClientRects().length > 0
              );
            },
          );
          const outsideViewport = visible
            .map((element) => ({
              selector:
                element.id ||
                element.getAttribute("data-testid") ||
                element.className ||
                element.tagName,
              left: Math.round(element.getBoundingClientRect().left),
              right: Math.round(element.getBoundingClientRect().right),
            }))
            .filter(({ left, right }) => left < -1 || right > viewportWidth + 1);
          const clippedControls = visible
            .filter((element) => element.matches("button, select, input, textarea"))
            .filter((element) => element.scrollWidth > element.clientWidth + 2)
            .map((element) => ({
              selector:
                element.id ||
                element.getAttribute("data-testid") ||
                element.className ||
                element.tagName,
              scrollWidth: element.scrollWidth,
              clientWidth: element.clientWidth,
            }));
          const clippedLabels = visible
            .filter((element) =>
              element.matches("h1, h2, h3, h4, p, label, dt, dd, summary, legend, small"),
            )
            .filter((element) => {
              const overflowX = getComputedStyle(element).overflowX;
              return (
                (overflowX === "hidden" || overflowX === "clip") &&
                element.scrollWidth > element.clientWidth + 2
              );
            })
            .map((element) => ({
              selector:
                element.id ||
                element.getAttribute("data-testid") ||
                element.className ||
                element.tagName,
              scrollWidth: element.scrollWidth,
              clientWidth: element.clientWidth,
            }));

          return {
            viewportWidth,
            documentWidth: document.documentElement.scrollWidth,
            panelWidth: Math.round(panelElement.getBoundingClientRect().width),
            outsideViewport,
            clippedControls,
            clippedLabels,
          };
        }, paneId);

        expect(geometry.panelWidth, `${paneId} panel width at ${width}px ${theme}`).toBeGreaterThan(
          0,
        );
        expect(geometry.documentWidth, `${paneId} at ${width}px ${theme}`).toBeLessThanOrEqual(
          geometry.viewportWidth,
        );
        expect(geometry.outsideViewport, `${paneId} elements outside ${width}px ${theme}`).toEqual(
          [],
        );
        expect(
          geometry.clippedControls,
          `${paneId} controls clipped at ${width}px ${theme}`,
        ).toEqual([]);
        expect(geometry.clippedLabels, `${paneId} labels clipped at ${width}px ${theme}`).toEqual(
          [],
        );

        const screenshotName = `p51-${paneId}-${width}-${theme}.png`;
        const screenshotPath = testInfo.outputPath(screenshotName);
        await freshGame.screenshot({
          path: screenshotPath,
          fullPage: false,
          animations: "disabled",
        });
        await testInfo.attach(screenshotName, {
          path: screenshotPath,
          contentType: "image/png",
        });
      }
    }
  }

  await settings.locator("#tab-settings-achievements").click();
  await expect(settings.locator("#panel-settings-achievements")).toContainText(
    settingsText("fr", "achievements"),
  );
});
