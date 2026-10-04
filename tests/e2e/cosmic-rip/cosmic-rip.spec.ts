import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { COSMIC_RIP_TECHNOLOGIES } from "../../../src/content/cosmicRip";
import { LOCALE_IDS } from "../../../src/content/ids";
import { translate } from "../../../src/i18n/messages";
import { cosmicRipText } from "../../../src/i18n/cosmicRipMessages";

test("restores the scanner, researches all Cosmic Rip stages and closes the rip @cosmic-rip", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  const pane = page.getByTestId("cosmic-rip-pane");
  await expect(pane).toBeVisible();
  await expect(pane).toContainText("The Cosmic Rip has been located");
  await expect(page.getByTestId("cosmic-rip-sector-4")).toBeDisabled();

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

  const localizedName: Record<(typeof COSMIC_RIP_TECHNOLOGIES)[number]["id"], string> = {
    stabilizerArray: "Stabilizer Array",
    quantumContainmentField: "Quantum Containment Field",
    dimensionalAnchorMatrix: "Dimensional Anchor Matrix",
    singularityStabilizer: "Singularity Stabilizer",
    realityWeaveRegulator: "Reality Weave Regulator",
  };
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
  await page.getByRole("button", { name: "Save now" }).click();
  await expect(page.getByTestId("save-status")).toContainText("Saved");
  await page.reload();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  await expect(page.getByTestId("cosmic-rip-closed")).toBeVisible();
  for (const locale of LOCALE_IDS) {
    await page.evaluate((nextLocale) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale },
      });
    }, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(
      page.getByRole("tab", { name: new RegExp(translate(locale, "tab.cosmicRip")) }),
    ).toBeVisible();
    await expect(
      page
        .getByTestId("cosmic-rip-pane")
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
