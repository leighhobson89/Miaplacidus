import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { resumeSavedPioneer, saveNowFromSettings } from "../_harness/save-controls";
import { COSMIC_RIP_TECHNOLOGIES, COSMIC_RIP_UPGRADES } from "../../../src/content/cosmicRip";
import { LOCALE_IDS, type EconomicGoodId } from "../../../src/content/ids";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { translate } from "../../../src/i18n/messages";
import { cosmicRipText } from "../../../src/i18n/cosmicRipMessages";

test("restores the scanner, researches all Cosmic Rip stages and closes the rip @cosmic-rip", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  const childTablist = page
    .getByRole("tabpanel", { name: "Cosmic Rip" })
    .getByRole("tablist", { name: "Pages in this section" });
  await expect(childTablist.getByRole("tab")).toHaveCount(3);
  const sourceDestinations = await childTablist
    .getByRole("tab")
    .evaluateAll((tabs) => tabs.map((tab) => [tab.id, tab.getAttribute("data-source-option-id")]));
  expect(sourceDestinations).toEqual([
    ["tab-cosmic-rip-situation", "option1"],
    ["tab-cosmic-rip-scanner-array", "option2"],
    ["tab-cosmic-rip-rip", "option3"],
  ]);
  const pane = page.getByTestId("cosmic-rip-pane");
  await expect(pane).toBeVisible();
  await expect(pane).toContainText("The Cosmic Rip has been located");
  await page.locator("#tab-cosmic-rip-scanner-array").click();
  await expect(page.getByTestId("cosmic-rip-sector-4")).toBeDisabled();

  await page.locator("#tab-cosmic-rip-rip").click();
  const buoy = pane.locator(".cosmic-rip-upgrade").filter({ hasText: "Sensor Buoy" });
  await buoy.getByRole("button", { name: "Purchase" }).click();
  const orbiter = pane.locator(".cosmic-rip-upgrade").filter({ hasText: "Rip Research Orbiter" });
  await orbiter.getByRole("button", { name: "Purchase" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.cosmicRip.sensorBuoyCount),
    )
    .toBe(1);
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().permanent.cosmicRip.ripResearchOrbiterCount,
      ),
    )
    .toBe(1);

  for (const technology of COSMIC_RIP_TECHNOLOGIES) {
    const researchCard = page.getByTestId(`cosmic-rip-technology-${technology.id}`);
    await researchCard.getByRole("button", { name: "Begin research" }).click();
    await page.evaluate(
      (durationMs) => window.miaplacidusTest!.advanceBy(durationMs + 1),
      technology.durationMs,
    );
    await expect
      .poll(() =>
        page.evaluate(
          (id) =>
            window
              .miaplacidusTest!.getState()
              .permanent.cosmicRip.researchedTechnologyIds.includes(id),
          technology.id,
        ),
      )
      .toBe(true);
  }

  await pane.getByRole("button", { name: "Close Cosmic Rip" }).click();
  await expect(page.getByTestId("cosmic-rip-closed")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().permanent.cosmicRip.closed))
    .toBe(true);
  await saveNowFromSettings(page);
  await expect(page.getByTestId("save-status")).toContainText("Saved");
  await page.reload();
  await resumeSavedPioneer(page, "Ascendency Pioneer");
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  await page.locator("#tab-cosmic-rip-rip").click();
  await expect(page.getByTestId("cosmic-rip-closed")).toBeVisible();
  for (const locale of LOCALE_IDS) {
    await page.evaluate((nextLocale) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale },
      });
    }, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("#tab-cosmic-rip")).toContainText(translate(locale, "tab.cosmicRip"));
    await expect(
      page
        .locator("#panel-cosmic-rip-rip")
        .getByRole("heading", { name: cosmicRipText(locale).title, exact: true }),
    ).toBeVisible();
    await expect(page.getByTestId("cosmic-rip-closed")).toHaveText(cosmicRipText(locale).closed);
  }
  await page.evaluate(() => {
    window.miaplacidusTest!.dispatch({ type: "settings.update", patch: { locale: "en" } });
  });
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await captureVisualCheckpoint(page, testInfo, "cosmic-rip-closed");
});

test("shows the scanner restore cost and localized disabled reason @cosmic-rip", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-restore-affordance");
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  await page.locator("#tab-cosmic-rip-scanner-array").click();

  const copy = cosmicRipText("en");
  const restore = page.getByTestId("cosmic-rip-restore-scanner");
  await expect(restore).toHaveText(`${copy.restoreScanner} · 10 ${copy.gpShort}`);
  await expect(restore).toBeDisabled();
  await expect(restore).toHaveAttribute("aria-describedby", "cosmic-rip-restore-reason");
  await expect(page.locator("#cosmic-rip-restore-reason")).toHaveText(
    copy.errors["cosmic-rip-insufficient-gp"],
  );
});

test("shows scanner, upgrade and technology precondition reasons @cosmic-rip", async ({ page }) => {
  await startMetaFixture(page, "meta-cosmic-rip-action-affordances");
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  await page.locator("#tab-cosmic-rip-scanner-array").click();

  const sector = page.getByTestId("cosmic-rip-sector-0");
  await expect(sector).toBeDisabled();
  await expect(sector).toHaveAttribute("aria-describedby", "cosmic-rip-sector-0-reason");
  for (const locale of LOCALE_IDS) {
    await page.evaluate((nextLocale) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale },
      });
    }, locale);
    const localizedCopy = cosmicRipText(locale);
    await expect(sector).toHaveAttribute(
      "aria-label",
      `${localizedCopy.sector} 1, 1 ${localizedCopy.gpShort}`,
    );
    await expect(page.locator("#cosmic-rip-sector-0-reason")).toHaveText(
      localizedCopy.errors["cosmic-rip-insufficient-gp"],
    );
  }

  const copy = cosmicRipText("fr");
  await page.locator("#tab-cosmic-rip-rip").click();
  const sensorBuoy = page
    .locator(".cosmic-rip-upgrade")
    .filter({ hasText: copy.upgradeNames.sensorBuoy });
  const purchase = sensorBuoy.getByRole("button", { name: copy.purchase });
  await expect(purchase).toBeDisabled();
  await expect(purchase).toHaveAttribute(
    "aria-describedby",
    "cosmic-rip-upgrade-sensorBuoy-reason",
  );
  await expect(page.locator("#cosmic-rip-upgrade-sensorBuoy-reason")).toHaveText(
    copy.errors["cosmic-rip-insufficient-cost"],
  );

  const lockedTechnology = page.getByTestId("cosmic-rip-technology-quantumContainmentField");
  const research = lockedTechnology.getByRole("button", { name: copy.research });
  await expect(research).toBeDisabled();
  await expect(research).toHaveAttribute(
    "aria-describedby",
    "cosmic-rip-technology-quantumContainmentField-reason",
  );
  await expect(page.locator("#cosmic-rip-technology-quantumContainmentField-reason")).toContainText(
    copy.errors["cosmic-rip-tech-locked"],
  );
  await expect(page.locator("#cosmic-rip-technology-quantumContainmentField-reason")).toContainText(
    copy.technologyNames.stabilizerArray,
  );
});

test("localizes Cosmic Rip costs and keeps the live wallet quiet @cosmic-rip", async ({ page }) => {
  await startMetaFixture(page, "meta-cosmic-rip-action-affordances");
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  await page.locator("#tab-cosmic-rip-rip").click();

  const wallet = page.locator(".cosmic-rip-wallet");
  expect(await wallet.getAttribute("aria-live")).toBeNull();

  for (const locale of LOCALE_IDS) {
    await page.evaluate((nextLocale) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, currencyId: "eur" },
      });
    }, locale);
    const copy = cosmicRipText(locale);
    const sensorBuoy = page
      .locator(".cosmic-rip-upgrade")
      .filter({ hasText: copy.upgradeNames.sensorBuoy });
    await expect(sensorBuoy).toContainText(
      formatCurrency(locale, COSMIC_RIP_UPGRADES.sensorBuoy.cash, "eur", 2, "standard"),
    );
    for (const [goodId, amount] of Object.entries(COSMIC_RIP_UPGRADES.sensorBuoy.goods)) {
      await expect(sensorBuoy).toContainText(
        `${formatNumber(locale, amount)} ${economyGoodName(locale, goodId as EconomicGoodId)}`,
      );
    }
    await expect(page.getByTestId("cosmic-rip-technology-stabilizerArray")).toContainText(
      `1 ${copy.gpShort}`,
    );
  }
});

test("shows the Cosmic Rip closure GP cost and disabled reason @cosmic-rip", async ({ page }) => {
  await startMetaFixture(page, "meta-cosmic-rip-close-affordance");
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  await page.locator("#tab-cosmic-rip-rip").click();

  const copy = cosmicRipText("en");
  const close = page.getByRole("button", { name: `${copy.closeRip} · 1 ${copy.gpShort}` });
  await expect(close).toBeDisabled();
  await expect(close).toHaveAttribute("aria-describedby", "cosmic-rip-close-reason");
  await expect(page.locator("#cosmic-rip-close-reason")).toHaveText(
    copy.errors["cosmic-rip-insufficient-gp"],
  );
});
