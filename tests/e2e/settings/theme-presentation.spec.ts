import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { achievementText } from "../../../src/i18n/achievementMessages";
import { metaSignalText } from "../../../src/i18n/metaSignalMessages";
import { settingsSectionName } from "../../../src/i18n/settingsMessages";

const settingsSpecialPageIds = [
  "settings-achievements",
  "settings-events",
  "settings-statistics",
] as const;

function isSpecialSettingsPage(paneId: string): paneId is (typeof settingsSpecialPageIds)[number] {
  return (settingsSpecialPageIds as readonly string[]).includes(paneId);
}

function settingsSpecialPageTitle(
  locale: (typeof LOCALE_IDS)[number],
  paneId: (typeof settingsSpecialPageIds)[number],
): string {
  switch (paneId) {
    case "settings-achievements":
      return achievementText(locale, "title");
    case "settings-events":
      return metaSignalText(locale, "title");
    case "settings-statistics":
      return settingsSectionName(locale, "statistics");
    default:
      throw new Error(`No special Settings title is defined for ${paneId}`);
  }
}

function settingsPageHeadingSelector(paneId: string): string {
  return isSpecialSettingsPage(paneId) ? ".pane-heading h2, .game-page-title" : ".game-page-title";
}

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
    await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", theme);

    const colors = await page.locator(".game-frame:not(.notification-portal)").evaluate((frame) => {
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

    const controlClassColors = await page.locator(".game-frame:not(.notification-portal)").evaluate(
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
  await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", "terminal");
  await page.locator("#tab-hydrogen").click();
  const terminalSurfaces = await page.locator(".game-frame:not(.notification-portal)").evaluate((frame) => {
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

    const paletteChecks = await page.locator(".game-frame:not(.notification-portal)").evaluate((frame, selectedTheme) => {
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
        [".top-status-bar .top-stat-value", ready],
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
      const frame = panel.closest<HTMLElement>(".game-frame:not(.notification-portal)");
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

test("Settings pages fit all themes through the 320px layout @theme-settings-matrix", async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  const settingsPaneIds = [
    ...settingsSpecialPageIds,
    "settings-game-options",
    "settings-visual",
    "settings-saves",
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
      const hydrogenTitleSize = await page
        .locator("#panel-resources-hydrogen .pane-heading h2")
        .evaluate((element) => getComputedStyle(element).fontSize);
      const settings = page.locator("#pane-settings");

      for (const paneId of settingsPaneIds) {
        await settings.locator(`#tab-${paneId}`).click();
        const panel = settings.locator(`#panel-${paneId}`);
        const title = panel.locator(settingsPageHeadingSelector(paneId));
        await expect(panel, `${theme} ${paneId} panel`).toBeVisible();
        await expect(title, `${theme} ${paneId} title`).toBeVisible();
        await expect(title, `${theme} ${paneId} title scale`).toHaveCSS(
          "font-size",
          hydrogenTitleSize,
        );
        if (isSpecialSettingsPage(paneId)) {
          await expect(title, `${theme} ${paneId} localized identity`).toHaveText(
            settingsSpecialPageTitle("en", paneId),
          );
          await expect(
            settings.locator(".page-artwork-row"),
            `${theme} ${paneId} artwork row`,
          ).toHaveCount(0);
          await expect(panel.locator(".eyebrow"), `${theme} ${paneId} eyebrow`).toHaveCount(0);
        } else {
          await expect(
            settings.locator(".page-artwork-row [data-celestial-illustration='settings']"),
            `${theme} ${paneId} settings artwork`,
          ).toHaveCount(1);
        }

        const bounds = await page.evaluate((id) => {
          const currentPanel = document.getElementById(`panel-${id}`);
          if (!currentPanel) throw new Error(`Settings panel ${id} should render`);
          const rect = currentPanel.getBoundingClientRect();
          return {
            left: rect.left,
            right: rect.right,
            documentWidth: document.documentElement.scrollWidth,
            viewportWidth: document.documentElement.clientWidth,
          };
        }, paneId);
        const label = `${theme} ${paneId} at ${viewport.width}px`;
        expect(bounds.left, `${label} left edge`).toBeGreaterThanOrEqual(-1);
        expect(bounds.right, `${label} right edge`).toBeLessThanOrEqual(viewport.width + 1);
        expect(bounds.documentWidth, `${label} document width`).toBeLessThanOrEqual(
          bounds.viewportWidth,
        );
        const captureSettingsReview =
          theme === "terminal" &&
          (viewport.width === 320 || isSpecialSettingsPage(paneId));
        if (captureSettingsReview) {
          const screenshotPath = testInfo.outputPath(
            `${paneId}-terminal-${viewport.width}.png`,
          );
          await page.screenshot({
            path: screenshotPath,
            animations: "disabled",
          });
          await testInfo.attach(`${paneId}-terminal-${viewport.width}.png`, {
            path: screenshotPath,
            contentType: "image/png",
          });
        }
      }
    }
  }
});

test("Settings pages fit all six locales at 320px @settings-locale-matrix", async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  await startMetaFixture(page, "meta-megastructure-route");
  await page.setViewportSize({ width: 320, height: 740 });

  const settingsPageIds = [
    ...settingsSpecialPageIds,
    "settings-game-options",
    "settings-visual",
    "settings-saves",
  ] as const;
  for (const locale of LOCALE_IDS) {
    await page.locator("#tab-settings").click();
    await page.locator("#tab-settings-game-options").click();
    await page.locator("#settings-language").selectOption(locale);
    await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe(locale);
    const settings = page.locator("#pane-settings");
    const hydrogenTitleSize = await page
      .locator("#panel-resources-hydrogen .pane-heading h2")
      .evaluate((element) => getComputedStyle(element).fontSize);

    for (const paneId of settingsPageIds) {
      await settings.locator(`#tab-${paneId}`).click();
      const panel = settings.locator(`#panel-${paneId}`);
      await expect(panel, `${locale} ${paneId} panel`).toBeVisible();
      const title = panel.locator(settingsPageHeadingSelector(paneId));
      await expect(title, `${locale} ${paneId} title`).toBeVisible();
      await expect(title, `${locale} ${paneId} title scale`).toHaveCSS(
        "font-size",
        hydrogenTitleSize,
      );
      if (isSpecialSettingsPage(paneId)) {
        await expect(title, `${locale} ${paneId} localized identity`).toHaveText(
          settingsSpecialPageTitle(locale, paneId),
        );
        await expect(
          settings.locator(".page-artwork-row"),
          `${locale} ${paneId} artwork row`,
        ).toHaveCount(0);
        await expect(panel.locator(".eyebrow"), `${locale} ${paneId} eyebrow`).toHaveCount(0);
      }
      if (locale === "de" && paneId === "settings-visual") {
        const lineCharacterCounts = await title.evaluate((element) => {
          const textNode = element.firstChild;
          if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
            throw new Error("German Visual title should contain a text node");
          }
          const text = textNode.textContent ?? "";
          const range = document.createRange();
          const lineCounts = new Map<number, number>();
          for (let index = 0; index < text.length; index += 1) {
            if (text[index] === "\u00ad") continue;
            range.setStart(textNode, index);
            range.setEnd(textNode, index + 1);
            const rect = range.getBoundingClientRect();
            const lineTop = Math.round(rect.top);
            lineCounts.set(lineTop, (lineCounts.get(lineTop) ?? 0) + 1);
          }
          return Array.from(lineCounts.values());
        });
        expect(
          lineCharacterCounts.length,
          "German title should render at least one line",
        ).toBeGreaterThan(0);
        expect(
          lineCharacterCounts.every((count) => count > 1),
          `German Visual title should not orphan its final letter at 320px: ${lineCharacterCounts}`,
        ).toBe(true);
      }
      const bounds = await page.evaluate((id) => {
        const currentPanel = document.getElementById(`panel-${id}`);
        if (!currentPanel) throw new Error(`Settings panel ${id} should render`);
        const rect = currentPanel.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          clientWidth: currentPanel.clientWidth,
          scrollWidth: currentPanel.scrollWidth,
          documentWidth: document.documentElement.scrollWidth,
          overflowers: Array.from(currentPanel.querySelectorAll<HTMLElement>("*"))
            .map((element) => {
              const elementRect = element.getBoundingClientRect();
              return {
                tag: element.tagName,
                className: element.getAttribute("class") ?? "",
                text: (element.innerText ?? element.textContent ?? "").slice(0, 60),
                left: elementRect.left,
                right: elementRect.right,
                clientWidth: element.clientWidth,
                scrollWidth: element.scrollWidth,
              };
            })
            .filter(
              (element) =>
                element.right > rect.right + 0.5 || element.scrollWidth > element.clientWidth + 1,
            )
            .slice(0, 8),
        };
      }, paneId);
      const label = `${locale} ${paneId} at 320px`;
      expect(bounds.left, `${label} left edge`).toBeGreaterThanOrEqual(-1);
      expect(bounds.right, `${label} right edge`).toBeLessThanOrEqual(321);
      expect(
        bounds.scrollWidth,
        `${label} panel overflow: ${JSON.stringify(bounds.overflowers)}`,
      ).toBeLessThanOrEqual(bounds.clientWidth);
      expect(bounds.documentWidth, `${label} document width`).toBeLessThanOrEqual(320);
      if (locale === "de" && paneId === "settings-visual") {
        const screenshotPath = testInfo.outputPath("settings-visual-german-320.png");
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
          animations: "disabled",
        });
        await testInfo.attach("settings-visual-german-320.png", {
          path: screenshotPath,
          contentType: "image/png",
        });
      }
    }
  }
});
