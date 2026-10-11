import type { Page, TestInfo } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import {
  ASCENDENCY_PERKS,
  ascendencyPerkCost,
  ascendencyPerkLevel,
  ascendencyPerkMaxed,
} from "../../../src/content/ascendency";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { THEME_IDS, type ThemeId } from "../../../src/content/themes";
import { formatNumber } from "../../../src/app/numberFormatting";
import { metaPerkCopy, metaText } from "../../../src/i18n/metaMessages";

const VIEWPORTS = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

async function setPresentation(page: Page, locale: LocaleId, theme: ThemeId): Promise<void> {
  await page.evaluate(
    ({ locale, theme }) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale, themeId: theme },
      });
    },
    { locale, theme },
  );
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", theme);
}

async function capture(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const path = testInfo.outputPath(name);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path, fullPage: true, animations: "disabled", caret: "hide" });
  await testInfo.attach(name, { path, contentType: "image/png" });
}

async function collectLayoutIssues(page: Page, label: string): Promise<string[]> {
  const result = await page.evaluate(() => {
    const pane = document.querySelector<HTMLElement>("[data-testid='ascendency-pane']");
    if (!pane) throw new Error("Ascendency pane should be rendered");
    const rect = (element: HTMLElement) => {
      const bounds = element.getBoundingClientRect();
      return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom };
    };
    const visible = (element: HTMLElement) => {
      const style = getComputedStyle(element);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        !element.closest(".sr-only") &&
        element.getClientRects().length > 0
      );
    };
    const paneBounds = rect(pane);
    const cards = Array.from(pane.querySelectorAll<HTMLElement>("[data-perk-id]"))
      .filter(visible)
      .map((card) => {
        const copy = card.querySelector<HTMLElement>(".card-copy");
        const controls = card.querySelector<HTMLElement>(".card-controls");
        if (!copy || !controls) throw new Error("Each perk card needs copy and controls");
        return {
          id: card.dataset.perkId ?? "unknown",
          card: { ...rect(card), clientWidth: card.clientWidth, scrollWidth: card.scrollWidth },
          copy: { ...rect(copy), clientWidth: copy.clientWidth, scrollWidth: copy.scrollWidth },
          controls: {
            ...rect(controls),
            clientWidth: controls.clientWidth,
            scrollWidth: controls.scrollWidth,
          },
        };
      });
    const textElements = Array.from(
      pane.querySelectorAll<HTMLElement>(
        ".pane-heading h2, .pane-intro, .card-copy h3, .card-copy p, .cost-line, .card-controls button, .control-reason",
      ),
    )
      .filter(visible)
      .map((element) => ({
        text: element.innerText || element.getAttribute("aria-label") || "",
        tag: element.tagName.toLowerCase(),
        ...rect(element),
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));
    return {
      viewportWidth: document.documentElement.clientWidth,
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      pane: { ...paneBounds, clientWidth: pane.clientWidth, scrollWidth: pane.scrollWidth },
      cards,
      textElements,
    };
  });

  const issues: string[] = [];
  if (result.documentWidth > result.viewportWidth)
    issues.push(`document width ${result.documentWidth} > ${result.viewportWidth}`);
  if (result.pane.left < -1 || result.pane.right > result.viewportWidth + 1)
    issues.push("Ascendency pane exceeds the viewport");
  if (result.pane.scrollWidth > result.pane.clientWidth + 1)
    issues.push("Ascendency pane has internal horizontal overflow");

  for (const { id, card, copy, controls } of result.cards) {
    const label = `perk ${id}`;
    for (const [name, box] of [
      [label, card],
      [`${label} copy`, copy],
      [`${label} controls`, controls],
    ] as const) {
      if (box.left < result.pane.left - 2 || box.right > result.pane.right + 2)
        issues.push(`${name} is outside the pane`);
      if (box.scrollWidth > box.clientWidth + 1) issues.push(`${name} has internal overflow`);
    }
    if (result.viewportWidth <= 390 && copy.clientWidth < 180)
      issues.push(`${label} copy width is only ${copy.clientWidth}px at phone width`);
    const overlapX = copy.left < controls.right - 2 && controls.left < copy.right - 2;
    const overlapY = copy.top < controls.bottom - 2 && controls.top < copy.bottom - 2;
    if (overlapX && overlapY) issues.push(`${label} copy and controls overlap`);
  }

  for (const element of result.textElements) {
    if (element.left < result.pane.left - 2 || element.right > result.pane.right + 2)
      issues.push(`${element.tag} text is outside the pane: ${element.text}`);
    if (element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 2)
      issues.push(`${element.tag} text overflows: ${element.text}`);
  }
  return issues.map((issue) => `${label}: ${issue}`);
}

test("P-56 Ascendency perk cards fit every locale, theme, and viewport @p56-ascendency-visual @presentation", async ({
  page,
}, testInfo) => {
  test.setTimeout(300_000);
  await page.setViewportSize(VIEWPORTS[0]);
  await startMetaFixture(page, "meta-galactic-identity-matrix");
  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { notificationsEnabled: false },
    }),
  );

  const pane = page.getByTestId("ascendency-pane");
  const captures = new Set(["en/terminal/1280", "de/light/390", "fr/space/320"]);
  const issues: string[] = [];
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());

  for (const locale of LOCALE_IDS) {
    for (const theme of THEME_IDS) {
      await setPresentation(page, locale, theme);
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await page.locator("#tab-galaxy").click();
        const tab = page.locator("#tab-galactic-ascendency-perks");
        await expect(tab, `${locale}/${theme} Ascendency tab`).toBeVisible();
        await tab.click();
        await expect(pane, `${locale}/${theme} Ascendency pane`).toBeVisible();
        await expect(tab).toHaveAttribute("aria-selected", "true");
        await expect(pane.getByRole("heading", { level: 2 })).toHaveText(
          metaText(locale, "perksTitle"),
        );
        await expect(pane.locator(".pane-intro")).toHaveText(
          `${metaText(locale, "ap")}: ${formatNumber(locale, state.permanent.ascendencyPoints, 0, state.settings.notation)}`,
        );
        await expect(pane.locator("[data-perk-id]")).toHaveCount(ASCENDENCY_PERKS.length);

        for (const perk of ASCENDENCY_PERKS) {
          const card = pane.locator(`[data-perk-id="${perk.id}"]`);
          const [name, description] = metaPerkCopy(locale, perk.id);
          const level = ascendencyPerkLevel(state.permanent.acquiredPerks, perk.id);
          const cost = ascendencyPerkCost(state.permanent.acquiredPerks, perk.id);
          const maxed = ascendencyPerkMaxed(state.permanent.acquiredPerks, perk.id);
          const buttonName = maxed ? metaText(locale, "maxed") : metaText(locale, "buy");
          await expect(card.getByRole("heading", { name, exact: true })).toBeVisible();
          await expect(card.locator(".card-copy p")).toHaveText(description);
          await expect(card.locator(".cost-line")).toContainText(metaText(locale, "level"));
          await expect(card.locator(".cost-line")).toContainText(
            formatNumber(locale, level, 0, state.settings.notation),
          );
          await expect(card.locator(".cost-line")).toContainText(metaText(locale, "cost"));
          if (!maxed) {
            await expect(card.locator(".cost-line")).toContainText(
              formatNumber(locale, cost, 0, state.settings.notation),
            );
          }
          await expect(card.getByRole("button", { name: buttonName, exact: true })).toBeVisible();
        }

        const key = `${locale}/${theme}/${viewport.width}`;
        if (captures.has(key))
          await capture(page, testInfo, `p56-ascendency-${locale}-${theme}-${viewport.width}.png`);
        issues.push(...(await collectLayoutIssues(page, `${locale}/${theme}/${viewport.width}px`)));
      }
    }
  }

  expect(
    issues.slice(0, 30),
    `${issues.length} layout/text issue(s) found; first findings:\n${issues.slice(0, 30).join("\n")}`,
  ).toEqual([]);
});
