import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { openSaveManager } from "../_harness/save-controls";
import { THEME_IDS } from "../../../src/content/themes";

const dropdownClasses = [
  "welcome-form",
  "settings-control",
  "galactic-market-pane",
  "galactic-casino-pane",
  "space-auto-telescope",
  "economy-controls",
  "economy-card",
  "star-data-toolbar",
  "autosave-interval",
  "card-controls",
] as const;

test("theme dropdowns keep readable text and themed popup colors @theme-dropdowns", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-casino-ready");
  await page.locator("#tab-settings").click();
  const themeSelect = page.locator("#settings-theme");

  for (const theme of THEME_IDS) {
    await themeSelect.selectOption(theme);
    await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", theme);

    const colors = await page.locator(".game-frame").evaluate((frame) => {
      const select = frame.querySelector<HTMLSelectElement>("#settings-theme");
      if (!select) throw new Error("Theme dropdown should render");
      const option = Array.from(select.options).find((entry) => !entry.selected);
      if (!option) throw new Error("An unselected theme option should render");

      const variables = getComputedStyle(frame);
      const selectStyle = getComputedStyle(select);
      const optionStyle = getComputedStyle(option);
      const panel = frame.querySelector<HTMLElement>(".settings-controls");
      if (!panel) throw new Error("Theme settings panel should render");
      return {
        ink: variables.color,
        panel: getComputedStyle(panel).backgroundColor,
        selectColor: selectStyle.color,
        selectBackground: selectStyle.backgroundColor,
        optionColor: optionStyle.color,
        optionBackground: optionStyle.backgroundColor,
      };
    });

    expect(colors.selectColor).toBe(colors.ink);
    expect(colors.optionColor).toBe(colors.ink);
    expect(colors.optionBackground).toBe(colors.panel);
    expect(colors.selectBackground).not.toBe("rgba(0, 0, 0, 0)");

    const controlClassColors = await page.locator(".game-frame").evaluate(
      (frame, classes) => {
        const fixtureRoot = document.createElement("div");
        fixtureRoot.hidden = true;
        frame.append(fixtureRoot);
        const styles = classes.map((className) => {
          const wrapper = document.createElement("div");
          wrapper.className = className;
          const select = document.createElement("select");
          select.innerHTML =
            '<option value="terminal">Terminal</option><option value="active">Active theme</option>';
          select.value = "active";
          wrapper.append(select);
          fixtureRoot.append(wrapper);
          const option = select.options[0];
          return {
            className,
            selectColor: getComputedStyle(select).color,
            selectBackground: getComputedStyle(select).backgroundColor,
            optionColor: getComputedStyle(option).color,
            optionBackground: getComputedStyle(option).backgroundColor,
            colorScheme: getComputedStyle(select).colorScheme,
          };
        });
        fixtureRoot.remove();
        return styles;
      },
      [...dropdownClasses],
    );
    expect(controlClassColors).toHaveLength(dropdownClasses.length);
    for (const control of controlClassColors) {
      expect(control.selectColor, `${control.className} select text`).toBe(colors.ink);
      expect(control.optionColor, `${control.className} option text`).toBe(colors.ink);
      expect(control.optionBackground, `${control.className} option background`).toBe(colors.panel);
      expect(control.colorScheme).toBe(theme === "light" ? "light" : "dark");
      expect(control.selectBackground).not.toBe("rgba(0, 0, 0, 0)");
    }
  }

  await themeSelect.selectOption("terminal");
  await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", "terminal");
  await page.locator("#tab-hydrogen").click();
  const terminalSurfaces = await page.locator(".game-frame").evaluate((frame) => {
    const selectors = [".hydrogen-hero", ".settings-controls", ".settings-control select"];
    return Object.fromEntries(
      selectors.map((selector) => {
        const element = frame.querySelector<HTMLElement>(selector);
        return [selector, element ? getComputedStyle(element).backgroundColor : null];
      }),
    );
  });
  expect(terminalSurfaces).toEqual({
    ".hydrogen-hero": "rgb(0, 0, 0)",
    ".settings-controls": "rgb(0, 0, 0)",
    ".settings-control select": "rgb(0, 0, 0)",
  });
});

test("economy headings, stock, and rates use the active theme's text palette @theme-dropdowns", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-megastructure-route");
  for (const theme of THEME_IDS) {
    await page.locator("#tab-settings").click();
    await page.locator("#tab-settings-visual").click();
    await page.locator("#settings-theme").selectOption(theme);
    await page.locator("#tab-hydrogen").click();
    await expect(page.getByTestId("hydrogen-quantity")).toBeVisible();
    await expect(
      page.locator('#pane-hydrogen [data-resource-id="hydrogen"] .economy-card-heading'),
    ).toHaveCount(0);

    const paletteChecks = await page.locator(".game-frame").evaluate((frame, selectedTheme) => {
      const sample = document.createElement("span");
      frame.append(sample);
      const token = (value: string) => {
        sample.style.color = value;
        return getComputedStyle(sample).color;
      };
      const ink = token("var(--ink)");
      const muted = token("var(--muted)");
      const focus = token("var(--text-focus-color)");
      const ready = token("var(--ready-text)");
      const positive = token("color-mix(in srgb, var(--green) 68%, var(--ink))");
      const warning = token("color-mix(in srgb, var(--warning-text) 70%, var(--ink))");
      const expected = new Map([
        [".eyebrow", muted],
        [".run-name", muted],
        [".global-context-bar .top-stat-value", ink],
        [".top-status-bar .top-stat-value", ink],
        [".location-status-copy strong", ink],
        [".location-status-copy small", muted],
        [".game-nav .nav-tab:not(.is-selected)", muted],
        [".game-nav .nav-tab.is-selected", selectedTheme === "light" ? ink : focus],
        [".resource-rail .resource-rail-group-toggle", muted],
        [".resource-item-copy strong", ink],
        [".resource-item-copy small", muted],
        [".resource-rate", positive],
        [".pane-intro", muted],
        [".stock-readout > strong", ink],
        [".stock-readout > strong small", muted],
        [".capacity-line", muted],
        [".capacity-line b", ink],
        [".rate-readout > strong", positive],
        [".rate-readout > strong small", muted],
        [".card-copy h3", ink],
        [".card-copy p", muted],
        [".card-copy p strong", positive],
        [".cost-line", muted],
        [".cost-line strong", ink],
        [".card-controls label", muted],
        [".primary-button", ink],
        [".secondary-button", ink],
        [".control-reason", warning],
      ]);
      const channels = (color: string) => {
        const values = color.match(/[\d.]+/g)?.map(Number) ?? [];
        const scale = color.startsWith("color(") ? 255 : 1;
        return [
          (values[0] ?? 0) * scale,
          (values[1] ?? 0) * scale,
          (values[2] ?? 0) * scale,
          values[3] ?? 1,
        ];
      };
      const composite = (foreground: number[], background: number[]) =>
        [0, 1, 2].map(
          (index) => foreground[index] * foreground[3] + background[index] * (1 - foreground[3]),
        );
      const luminance = (color: number[]) => {
        const values = color.slice(0, 3).map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
      };
      const contrastRatio = (foreground: number[], background: number[]) => {
        const [first, second] = [luminance(foreground), luminance(background)].sort(
          (left, right) => right - left,
        );
        return (first + 0.05) / (second + 0.05);
      };
      const frameBackground = channels(getComputedStyle(frame).backgroundColor);
      const backgroundFor = (element: HTMLElement) => {
        const ancestors: HTMLElement[] = [];
        let current: HTMLElement | null = element;
        while (current && current !== frame) {
          ancestors.unshift(current);
          current = current.parentElement;
        }
        return ancestors.reduce(
          (background, ancestor) =>
            composite(channels(getComputedStyle(ancestor).backgroundColor), background),
          frameBackground.slice(0, 3),
        );
      };
      const checks = [...expected].map(([selector, color]) => {
        const element = frame.querySelector<HTMLElement>(selector);
        const actual = element ? getComputedStyle(element).color : null;
        const background = element ? backgroundFor(element) : frameBackground.slice(0, 3);
        const renderedForeground = actual ? composite(channels(actual), background) : null;
        return {
          selector,
          expected: color,
          actual,
          contrast: renderedForeground === null ? 0 : contrastRatio(renderedForeground, background),
        };
      });
      const textContrastFailures = checks
        .filter((check) => check.contrast < 4.5)
        .map((check) => `${check.selector}: ${check.contrast.toFixed(2)}:1`);
      const statusSurface = document.createElement("div");
      statusSurface.className = "top-stat";
      const chargingValue = document.createElement("span");
      chargingValue.className = "top-stat-value is-charging";
      const chargingText = document.createElement("small");
      chargingText.className = "is-charging green-ready-text";
      chargingText.textContent = "00:15";
      chargingValue.append(chargingText);
      const dischargingValue = document.createElement("span");
      dischargingValue.className = "top-stat-value is-discharging";
      const dischargingText = document.createElement("small");
      dischargingText.className = "is-discharging red-disabled-text";
      dischargingText.textContent = "00:15";
      dischargingValue.append(dischargingText);
      const trippedValue = document.createElement("span");
      trippedValue.className = "top-stat-value is-tripped orange-warning-text";
      trippedValue.textContent = "TRIPPED";
      statusSurface.append(chargingValue, dischargingValue, trippedValue);
      frame.append(statusSurface);
      const statusCases = [
        { name: "charging", element: chargingText, expected: token("var(--ready-text)") },
        { name: "discharging", element: dischargingText, expected: token("var(--disabled-text)") },
        { name: "tripped", element: trippedValue, expected: token("var(--warning-text)") },
      ];
      const statusChecks = statusCases.map(({ name, element, expected }) => {
        const actual = getComputedStyle(element).color;
        const background = backgroundFor(element);
        const renderedForeground = composite(channels(actual), background);
        return { name, actual, expected, contrast: contrastRatio(renderedForeground, background) };
      });
      const normalRole = document.createElement("span");
      normalRole.className = "normal-text";
      frame.append(normalRole);
      const normalRoleColor = getComputedStyle(normalRole).color;
      const expectedNormalColor = token("var(--text-color)");
      normalRole.remove();
      statusSurface.remove();
      const location = frame.querySelector<HTMLElement>(".location-status");
      const cash = frame.querySelector<HTMLElement>('[data-testid="cash-balance"]');
      const locationRect = location?.getBoundingClientRect();
      const cashRect = cash?.getBoundingClientRect();
      const statusIcon = frame.querySelector<HTMLElement>(".weather-symbol");
      const iconColor = statusIcon ? getComputedStyle(statusIcon).color : null;
      const iconContrast = statusIcon
        ? contrastRatio(
            composite(channels(getComputedStyle(statusIcon).color), backgroundFor(statusIcon)),
            backgroundFor(statusIcon),
          )
        : 0;
      sample.remove();
      return {
        checks,
        textContrastFailures,
        statusChecks,
        normalRoleColor,
        expectedNormalColor,
        iconColor,
        expectedReadyColor: selectedTheme === "light" ? ink : ready,
        iconContrast,
        locationBeforeCash:
          locationRect !== undefined &&
          cashRect !== undefined &&
          locationRect.right <= cashRect.left,
      };
    }, theme);

    for (const check of paletteChecks.checks) {
      expect(check.actual, `${theme} ${check.selector}`).toBe(check.expected);
    }
    expect(paletteChecks.textContrastFailures, `${theme} text contrast`).toEqual([]);
    for (const check of paletteChecks.statusChecks) {
      expect(check.actual, `${theme} ${check.name} semantic color`).toBe(check.expected);
      expect(check.contrast, `${theme} ${check.name} contrast`).toBeGreaterThanOrEqual(4.5);
    }
    expect(paletteChecks.normalRoleColor, `${theme} normal text role`).toBe(
      paletteChecks.expectedNormalColor,
    );
    expect(paletteChecks.iconColor, `${theme} weather icon color`).toBe(
      paletteChecks.expectedReadyColor,
    );
    expect(paletteChecks.iconContrast, `${theme} weather icon contrast`).toBeGreaterThanOrEqual(3);
    expect(paletteChecks.locationBeforeCash, `${theme} weather before cash`).toBe(true);

    await testInfo.attach(`hydrogen-${theme}-theme.png`, {
      body: await page.screenshot({ fullPage: true, animations: "disabled" }),
      contentType: "image/png",
    });

    await page.locator("#tab-research").click();
    const techTreeTab = page.locator("#tab-research-tech-tree");
    const techTreePanel = page.locator("#panel-research-tech-tree");
    await techTreeTab.click();
    await expect(techTreePanel).toBeVisible();
    await techTreeTab.focus();
    await page.keyboard.press("Tab");
    await expect(techTreePanel).toBeFocused();
    await expect(techTreePanel).toHaveCSS("outline-style", "solid");
    await expect(techTreePanel).toHaveCSS("outline-width", "2px");
    await expect(techTreePanel).toHaveCSS("outline-offset", "2px");
    const focusColors = await techTreePanel.evaluate((panel) => {
      const outline = getComputedStyle(panel).outlineColor;
      const frame = panel.closest<HTMLElement>(".game-frame");
      const sample = document.createElement("span");
      if (!frame) throw new Error("Focused tab panel should belong to the themed game frame");
      const visible = panel.matches(":focus-visible");
      sample.style.color = "var(--text-focus-color)";
      frame.append(sample);
      const expected = getComputedStyle(sample).color;
      sample.remove();
      return { outline, expected, visible };
    });
    expect(focusColors.visible, `${theme} tab-panel keyboard focus`).toBe(true);
    expect(focusColors.outline, `${theme} tab-panel focus color`).toBe(focusColors.expected);
  }
});

test("all themes keep late-game panes and save errors visible at wide and phone widths @theme-matrix", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await startMetaFixture(page, "meta-megastructure-route");
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    for (const theme of THEME_IDS) {
      await page.locator("#tab-settings").click();
      await page.locator("#tab-settings-visual").click();
      await page.locator("#settings-theme").selectOption(theme);
      await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", theme);

      await page.locator("#tab-research").click();
      await page.locator("#tab-research-tech-tree").click();
      await expect(page.getByTestId("technology-tree-viewport")).toBeVisible();
      const researchWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(researchWidth, `${theme} Tech Tree at ${viewport.width}px`).toBeLessThanOrEqual(
        viewport.width,
      );

      await page.locator("#tab-galaxy").click();
      const galacticPane = page.getByRole("tabpanel", { name: "Galactic" });
      await expect(
        page.locator(".game-nav").getByRole("tab", { name: "Galactic Casino" }),
      ).toHaveCount(0);
      const childTabs = galacticPane
        .getByRole("tablist", { name: "Pages in this section" })
        .getByRole("tab");
      await expect(childTabs).toHaveCount(5);
      const childTabLabels = await childTabs.evaluateAll((tabs) =>
        tabs.map((tab) => {
          const label = tab.cloneNode(true) as HTMLElement;
          label.querySelector(".attention-badge")?.remove();
          return label.textContent?.trim() ?? "";
        }),
      );
      expect(childTabLabels).toEqual([
        "Rebirth",
        "Galactic Market",
        "Galactic Casino",
        "Ascendency Perks",
        "Megastructures",
      ]);
      await page.locator("#tab-galactic-casino").click();
      await expect(page.getByTestId("galactic-casino-pane")).toBeVisible();
      const casinoWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(casinoWidth, `${theme} Galactic Casino at ${viewport.width}px`).toBeLessThanOrEqual(
        viewport.width,
      );

      await openSaveManager(page);
      const manager = page.locator(".save-manager");
      await manager.locator("#import-code").fill("not a MIAPLACIDUS save code");
      await manager.getByRole("button", { name: "Preview import" }).click();
      await expect(manager.getByRole("alert")).toBeVisible();
      const errorWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(errorWidth, `${theme} save error at ${viewport.width}px`).toBeLessThanOrEqual(
        viewport.width,
      );
      await manager.getByRole("button", { name: "Cancel", exact: true }).click();
    }
  }
});

test("all top-level tabs fit four viewport widths in Terminal @theme-tab-matrix", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  await startMetaFixture(page, "meta-megastructure-route");
  const unlocked = await page.evaluate(() =>
    window.miaplacidusTest?.applyDebugAction("unlock-all-tabs"),
  );
  expect(unlocked, "the deterministic fixture should expose every top-level tab").toBe(true);

  const tabIds = [
    "hydrogen",
    "compounds",
    "research",
    "energy",
    "space-mining",
    "interstellar",
    "galaxy",
    "cosmic-rip",
    "settings",
    "miaplaedia",
  ] as const;
  const viewports = [
    { width: 1280, height: 900 },
    { width: 768, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ] as const;
  const screenshotWidths = new Set([1280, 768, 390, 320]);

  await expect(page.locator(".game-nav [role=tab]")).toHaveCount(tabIds.length);
  const orderedTabs = await page
    .locator(".game-nav [role=tab]")
    .evaluateAll((tabs) => tabs.map((tab) => tab.id.replace(/^tab-/, "")));
  expect(orderedTabs).toEqual(tabIds);

  const visit = async (tabId: (typeof tabIds)[number], viewport: (typeof viewports)[number]) => {
    await page.locator(`#tab-${tabId}`).click();

    const geometry = await page.evaluate((id) => {
      const tab = document.getElementById(`tab-${id}`);
      const pane = document.getElementById(`pane-${id}`);
      const frame = document.querySelector<HTMLElement>(".game-frame");
      if (!tab || !pane || !frame) throw new Error("Visible top-level tab and pane should render");
      const panel = pane.getBoundingClientRect();
      const frameBounds = frame.getBoundingClientRect();
      return {
        selected: tab.getAttribute("aria-selected") === "true",
        visible: !pane.hidden && pane.getClientRects().length > 0,
        panelLeft: panel.left,
        panelRight: panel.right,
        panelWidth: panel.width,
        frameLeft: frameBounds.left,
        frameRight: frameBounds.right,
        documentWidth: document.documentElement.scrollWidth,
      };
    }, tabId);

    const label = `Terminal ${tabId} at ${viewport.width}px`;
    expect(geometry.selected, `${label} selected`).toBe(true);
    expect(geometry.visible, `${label} visible`).toBe(true);
    expect(geometry.panelWidth, `${label} panel width`).toBeGreaterThan(0);
    expect(geometry.panelLeft, `${label} panel left edge`).toBeGreaterThanOrEqual(-1);
    expect(geometry.panelRight, `${label} panel right edge`).toBeLessThanOrEqual(
      viewport.width + 1,
    );
    expect(geometry.panelLeft, `${label} stays within game frame`).toBeGreaterThanOrEqual(
      geometry.frameLeft - 1,
    );
    expect(geometry.panelRight, `${label} stays within game frame`).toBeLessThanOrEqual(
      geometry.frameRight + 1,
    );
    expect(geometry.documentWidth, `${label} document width`).toBeLessThanOrEqual(viewport.width);

    if (tabId === "miaplaedia" && screenshotWidths.has(viewport.width)) {
      await testInfo.attach(`tab-matrix-terminal-${viewport.width}.png`, {
        body: await page.screenshot({ fullPage: true, animations: "disabled" }),
        contentType: "image/png",
      });
    }
  };

  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-visual").click();
  await page.locator("#settings-theme").selectOption("terminal");
  await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", "terminal");
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const tabId of tabIds) await visit(tabId, viewport);
  }
});

test("the startup illustration uses a black canvas with Terminal accents @theme-dropdowns", async ({
  page,
}) => {
  const assetResponse = await page.request.get("/src/assets/miaplacidus-startup-scene.svg");
  expect(assetResponse.ok()).toBe(true);
  const svg = await assetResponse.text();
  expect(svg).toContain('<rect width="960" height="300" fill="#000000" />');
  expect(svg).toContain("#00FF00");
  const graphicColors = svg.match(/#[0-9a-f]{6}/gi) ?? [];
  expect(graphicColors.length).toBeGreaterThan(0);
  expect(
    graphicColors.every(
      (color) => color.toLowerCase() === "#ffffff" || /^#00[0-9a-f]{2}00$/i.test(color),
    ),
  ).toBe(true);
});

test("Terminal keeps the Star Map canvas on its black theme background @theme-dropdowns", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-telescope");
  await page.getByLabel("Pioneer name").fill("Terminal Map Pioneer");
  await page.getByTestId("start-game").click();

  await page.getByRole("tab", { name: "Settings" }).click();
  await page.locator("#settings-theme").selectOption("terminal");
  await page.getByRole("tab", { name: "Interstellar" }).click();

  const map = page.getByTestId("star-map-pane");
  await expect(map).toBeVisible();
  const canvasColors = await map.getByTestId("star-map-canvas").evaluate((canvas) => {
    const viewport = canvas.parentElement;
    const background = canvas.querySelector("rect");
    if (!viewport || !background) throw new Error("Star Map canvas surface should render");
    return {
      viewport: getComputedStyle(viewport).backgroundColor,
      canvas: getComputedStyle(background).fill,
    };
  });

  expect(canvasColors).toEqual({
    viewport: "rgb(0, 0, 0)",
    canvas: "rgb(0, 0, 0)",
  });
});
