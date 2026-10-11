import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { saveNowFromSettings } from "../_harness/save-controls";
import { COSMIC_RIP_TECHNOLOGIES } from "../../../src/content/cosmicRip";
import { LOCALE_IDS } from "../../../src/content/ids";
import { formatNumber } from "../../../src/app/numberFormatting";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { COSMIC_RIP_UPGRADES, type CosmicRipUpgradeId } from "../../../src/content/cosmicRip";
import type { EconomicGoodId } from "../../../src/content/ids";
import { cosmicRipUpgradeCost } from "../../../src/engine/cosmicRip";
import { displayCurrency } from "../../../src/engine/precision";
import { cosmicRipText } from "../../../src/i18n/cosmicRipMessages";

test("locale switching preserves Cosmic Rip research identity, prices, quantities, and save slot @locale @p49", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await page.locator("#tab-cosmic-rip").click();
  const ripTab = page.locator("#tab-cosmic-rip-rip");
  await ripTab.click();

  const technology = COSMIC_RIP_TECHNOLOGIES[0];
  const card = page.getByTestId(`cosmic-rip-technology-${technology.id}`);
  await card.getByRole("button", { name: cosmicRipText("en").research }).click();
  const progress = card.getByRole("progressbar");
  await expect(progress).toBeVisible();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(5_000));
  await saveNowFromSettings(page);

  const readInvariant = () =>
    page.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      const ripProgress = state.permanent.cosmicRip;
      return {
        pioneerName: state.run.pioneerName,
        tabIds: Array.from(document.querySelectorAll<HTMLElement>('[role="tab"][id]'))
          .map((tab) => tab.id)
          .sort(),
        selectedRipTabId: document.querySelector<HTMLElement>("#tab-cosmic-rip-rip")?.id,
        selectedRipTab: document
          .querySelector<HTMLElement>("#tab-cosmic-rip-rip")
          ?.getAttribute("aria-selected"),
        activeResearchTechnologyId: ripProgress.activeResearchTechnologyId,
        researchElapsedMs: ripProgress.researchElapsedMs,
        telemetryData: ripProgress.telemetryData,
        gloryPoints: state.permanent.gloryPoints,
        notation: state.settings.notation,
        saveHeads: Array.from({ length: localStorage.length }, (_, index) =>
          localStorage.key(index),
        )
          .filter((key): key is string => key?.startsWith("miaplacidus:v1:head:") ?? false)
          .sort(),
        lastStartedSlot: localStorage.getItem("miaplacidus:v1:lastStartedSlot"),
      };
    });

  const baseline = await readInvariant();
  expect(baseline.pioneerName).toBe("Ascendency Pioneer");
  expect(baseline.selectedRipTabId).toBe("tab-cosmic-rip-rip");
  expect(baseline.selectedRipTab).toBe("true");
  expect(baseline.activeResearchTechnologyId).toBe(technology.id);
  expect(baseline.researchElapsedMs).toBeGreaterThan(0);
  expect(baseline.telemetryData).toBe(190_000);
  expect(baseline.gloryPoints).toBe(19);
  expect(baseline.saveHeads).toHaveLength(1);
  expect(baseline.lastStartedSlot).toBe(baseline.saveHeads[0]?.slice("miaplacidus:v1:head:".length));

  for (const locale of LOCALE_IDS) {
    await page.locator("#tab-settings").click();
    await page.locator("#tab-settings-game-options").click();
    await page.locator("#settings-language").selectOption(locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.locator("#tab-cosmic-rip").click();
    await ripTab.click();

    const copy = cosmicRipText(locale);
    await expect(page.getByTestId("cosmic-rip-pane").locator("#cosmic-rip-title")).toHaveText(
      copy.title,
    );
    await expect(card.locator("h4")).toHaveText(copy.technologyNames[technology.id]);
    await expect(progress).toHaveAttribute(
      "aria-label",
      `${copy.researching}: ${copy.technologyNames[technology.id]}`,
    );
    await expect(card.locator("p").first()).toHaveText(
      `${formatNumber(locale, technology.telemetryCost, 0, baseline.notation)} ${copy.telemetry} · ${formatNumber(locale, technology.durationMs / 1000, 0, baseline.notation)} s · ${formatNumber(locale, 1, 0, baseline.notation)} ${copy.gpShort}`,
    );
    const wallet = page.getByTestId("cosmic-rip-pane").locator(".cosmic-rip-wallet");
    await expect(wallet.locator("span").nth(0)).toHaveText(
      `${copy.gp}: ${formatNumber(locale, baseline.gloryPoints, 0, baseline.notation)}`,
    );
    await expect(wallet.locator("span").nth(1)).toHaveText(
      `${copy.telemetry}: ${formatNumber(locale, baseline.telemetryData, 2, baseline.notation)}`,
    );

    const upgradeIds = Object.keys(COSMIC_RIP_UPGRADES) as CosmicRipUpgradeId[];
    const upgradeCards = page.locator(".cosmic-rip-upgrade");
    await expect(upgradeCards).toHaveCount(upgradeIds.length);
    const liveState = await page.evaluate(() => window.miaplacidusTest!.getState());
    for (const [index, upgradeId] of upgradeIds.entries()) {
      const upgrade = upgradeCards.nth(index);
      const cost = cosmicRipUpgradeCost(liveState, upgradeId);
      const cash = formatCurrency(
        locale,
        Number(displayCurrency(cost.cash)),
        liveState.settings.currencyId ?? "usd",
        2,
        baseline.notation,
      );
      const materials = Object.entries(cost.goods)
        .map(
          ([goodId, amount]) =>
            `${formatNumber(locale, amount!, 0, baseline.notation)} ${economyGoodName(locale, goodId as EconomicGoodId)}`,
        )
        .join(" + ");
      await expect(upgrade.locator("p").nth(1), `${locale} ${upgradeId} cost`).toHaveText(
        `${cash} + ${materials}`,
      );
    }

    const current = await readInvariant();
    expect(current.tabIds, `${locale} stable tab IDs`).toEqual(baseline.tabIds);
    expect(current.selectedRipTabId, `${locale} stable Rip tab ID`).toBe(baseline.selectedRipTabId);
    expect(current.selectedRipTab, `${locale} active Rip tab`).toBe("true");
    expect(current.pioneerName, `${locale} canonical pioneer`).toBe(baseline.pioneerName);
    expect(current.activeResearchTechnologyId, `${locale} active research`).toBe(
      baseline.activeResearchTechnologyId,
    );
    expect(current.researchElapsedMs, `${locale} research must not reset`).toBeGreaterThanOrEqual(
      baseline.researchElapsedMs,
    );
    expect(current.telemetryData, `${locale} telemetry quantity`).toBe(baseline.telemetryData);
    expect(current.gloryPoints, `${locale} GP quantity`).toBe(baseline.gloryPoints);
    expect(current.saveHeads, `${locale} local save head`).toEqual(baseline.saveHeads);
    expect(current.lastStartedSlot, `${locale} canonical save slot`).toBe(baseline.lastStartedSlot);
  }

  await saveNowFromSettings(page);
  const afterSave = await readInvariant();
  expect(afterSave.saveHeads).toEqual(baseline.saveHeads);
  expect(afterSave.lastStartedSlot).toBe(baseline.lastStartedSlot);
});
