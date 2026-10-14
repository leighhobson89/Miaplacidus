import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { formatNumber } from "../../../src/app/numberFormatting";
import { BLACK_HOLE_BASE_CHARGE_MS } from "../../../src/content/blackHole";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { THEME_IDS, type ThemeId } from "../../../src/content/themes";
import { BLACK_HOLE_CHARGE_TIMER_ID } from "../../../src/engine/blackHole";
import { blackHoleText } from "../../../src/i18n/blackHoleMessages";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

const VIEWPORTS = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

const UPGRADE_IDS = ["power", "duration", "recharge"] as const;

async function setPresentation(
  page: import("@playwright/test").Page,
  locale: LocaleId,
  theme: ThemeId,
) {
  const result = await page.evaluate(
    ({ nextLocale, nextTheme }) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, themeId: nextTheme },
      }),
    { nextLocale: locale, nextTheme: theme },
  );
  expect(result).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", theme);
}

test("P-56 Black Hole charging content fits all locales, themes, and viewports @p56-black-hole-content", async ({
  page,
}, testInfo) => {
  test.setTimeout(300_000);
  await page.setViewportSize(VIEWPORTS[0]);
  await startMetaFixture(page, "meta-black-hole-discovered");
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-black-hole").click();

  const pane = page.locator(".black-hole-pane");
  const copy = blackHoleText("en");
  await expect(pane.locator("#black-hole-title")).toHaveText(copy.title);
  await pane
    .getByTestId("black-hole-research")
    .locator(".space-action-help-group > .primary-button")
    .click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(30_000));

  const seededState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const seededCharge = seededState.run.timers[BLACK_HOLE_CHARGE_TIMER_ID];
  expect(seededState.permanent.blackHole.researched).toBe(true);
  expect(seededCharge).toMatchObject({
    status: "running",
    durationMs: BLACK_HOLE_BASE_CHARGE_MS,
    elapsedMs: 30_000,
  });

  for (const locale of LOCALE_IDS) {
    const localizedCopy = blackHoleText(locale);
    for (const theme of THEME_IDS) {
      await setPresentation(page, locale, theme);

      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        const state = await page.evaluate(() => window.miaplacidusTest!.getState());
        const hole = state.permanent.blackHole;
        const timer = state.run.timers[BLACK_HOLE_CHARGE_TIMER_ID]!;
        const notation = state.settings.notation;
        const expectedStatus = `${localizedCopy.charging} \u00b7 ${formatNumber(
          locale,
          Math.max(0, timer.durationMs - timer.elapsedMs) / 1_000,
          1,
          notation,
        )} s`;

        await expect(pane).toBeVisible();
        await expect(
          pane.getByRole("heading", { name: localizedCopy.title, exact: true }),
        ).toBeVisible();
        await expect(pane.locator(".panel-heading .eyebrow")).toHaveText(localizedCopy.status);
        await expect(pane.locator(".black-hole-summary")).toHaveText(localizedCopy.researched);
        await expect(pane.locator(".black-hole-stats dt")).toHaveText([
          localizedCopy.power,
          localizedCopy.duration,
          localizedCopy.recharge,
          localizedCopy.status,
        ]);
        await expect(pane.locator(".black-hole-stats dd")).toHaveText([
          `${formatNumber(locale, hole.power, 1, notation)}\u00d7`,
          `${formatNumber(locale, hole.durationMs / 1_000, 1, notation)} s`,
          `${formatNumber(
            locale,
            Math.max(30, (BLACK_HOLE_BASE_CHARGE_MS * hole.rechargeMultiplier) / 1_000),
            0,
            notation,
          )} s`,
          expectedStatus,
        ]);

        const chargeProgress = pane.getByRole("progressbar", {
          name: localizedCopy.charging,
          exact: true,
        });
        await expect(chargeProgress).toBeVisible();
        const progressValues = await chargeProgress.evaluate((element) => {
          const progress = element as HTMLProgressElement;
          return { value: progress.value, max: progress.max };
        });
        expect(progressValues.max).toBe(100);
        expect(progressValues.value).toBeGreaterThan(0);
        expect(progressValues.value).toBeLessThan(100);
        expect(progressValues.value).toBeCloseTo((timer.elapsedMs / timer.durationMs) * 100, 2);

        for (const upgradeId of UPGRADE_IDS) {
          const upgradeButton = pane
            .locator(".black-hole-upgrade")
            .nth(UPGRADE_IDS.indexOf(upgradeId))
            .getByRole("button");
          await expect(upgradeButton).toBeVisible();
          await expect(upgradeButton).toContainText(
            `${formatNumber(locale, hole[`${upgradeId}Price`], 0, notation)} ${localizedCopy.researchPoints}`,
          );
          await expect(upgradeButton).toBeEnabled();
        }

        const chargingAction = pane.getByRole("button", {
          name: localizedCopy.charging,
          exact: true,
        });
        await expect(chargingAction).toBeVisible();
        await expect(chargingAction).toBeDisabled();
        await expect(chargingAction).toHaveAttribute(
          "aria-describedby",
          "black-hole-activate-reason",
        );
        await expect(pane.locator("#black-hole-activate-reason")).toHaveText(
          localizedCopy.errors["black-hole-charge-running"],
        );

        const bounds = await page.evaluate(() => {
          const selectors = [
            ".black-hole-pane",
            ".black-hole-pane .panel-heading",
            ".black-hole-summary",
            ".black-hole-stats",
            ".black-hole-stats > div",
            ".black-hole-stats dt",
            ".black-hole-stats dd",
            ".black-hole-charge-progress",
            ".black-hole-upgrades",
            ".black-hole-upgrade",
            ".black-hole-upgrade button",
            ".black-hole-pane > .primary-button",
            ".black-hole-pane .control-reason",
          ];
          const elements = selectors.flatMap((selector) =>
            Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
              (element) => element.getClientRects().length > 0,
            ),
          );
          return {
            viewport: document.documentElement.clientWidth,
            document: document.documentElement.scrollWidth,
            elements: elements.map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                name: `${element.tagName.toLowerCase()}.${element.className || element.id}`,
                left: rect.left,
                right: rect.right,
                scrollWidth: element.scrollWidth,
                clientWidth: element.clientWidth,
                scrollHeight: element.scrollHeight,
                clientHeight: element.clientHeight,
              };
            }),
          };
        });
        const label = `${locale}/${theme}/${viewport.width}px`;
        expect(bounds.document, `${label} document overflow`).toBeLessThanOrEqual(bounds.viewport);
        expect(bounds.elements.length, `${label} visible layout targets`).toBeGreaterThan(0);
        for (const element of bounds.elements) {
          expect(element.left, `${label} ${element.name} left bound`).toBeGreaterThanOrEqual(-1);
          expect(element.right, `${label} ${element.name} right bound`).toBeLessThanOrEqual(
            bounds.viewport + 1,
          );
          expect(
            element.scrollWidth,
            `${label} ${element.name} horizontal content`,
          ).toBeLessThanOrEqual(element.clientWidth + 1);
          expect(
            element.scrollHeight,
            `${label} ${element.name} vertical content`,
          ).toBeLessThanOrEqual(element.clientHeight + 2);
        }

        if (locale === "en" && theme === "terminal" && viewport.width === 1280) {
          await captureVisualCheckpoint(
            page,
            testInfo,
            "p56-black-hole-terminal-en-charge-desktop",
          );
        } else if (locale === "de" && theme === "light" && viewport.width === 390) {
          await captureVisualCheckpoint(page, testInfo, "p56-black-hole-light-de-charge-390");
        } else if (locale === "fr" && theme === "space" && viewport.width === 320) {
          await captureVisualCheckpoint(page, testInfo, "p56-black-hole-space-fr-charge-320");
        }
      }
    }
  }
});
