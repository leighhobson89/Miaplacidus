import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { formatNumber } from "../../../src/app/numberFormatting";
import { LOCALE_IDS } from "../../../src/content/ids";
import {
  marketText,
  metaText,
  rebirthCarryText,
  rebirthText,
} from "../../../src/i18n/metaMessages";

test("Rebirth confirmation and accepted transition localize across all locales @p45-rebirth-copy", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-rebirth").click();

  const pane = page.getByTestId("rebirth-pane");
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  const destination = before.permanent.settledSystemIds.at(-1);
  expect(destination).toBeTruthy();
  expect(before.permanent.rebirthCount).toBe(1);
  expect(before.permanent.ascendencyPoints).toBe(100);
  expect(before.permanent.galacticCasino.casinoPoints).toBe(12);

  const trigger = pane.getByRole("button", {
    name: metaText("en", "rebirthAction"),
    exact: true,
  });
  await expect(trigger).toBeEnabled();
  await trigger.click();

  for (const locale of LOCALE_IDS) {
    await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    const copy = rebirthText(locale, "title");
    const confirmation = page.getByRole("dialog", { name: copy });
    await expect(confirmation).toBeVisible();
    await expect(
      pane.getByRole("heading", { name: metaText(locale, "rebirths"), exact: true }),
    ).toBeVisible();
    await expect(pane.locator(".rebirth-liquidation-card h3")).toHaveText(
      marketText(locale, "liquidation"),
    );
    await expect(
      pane.getByRole("button", { name: metaText(locale, "rebirthAction"), exact: true }),
    ).toBeVisible();
    await expect(confirmation.getByRole("heading", { name: copy, exact: true })).toBeVisible();
    await expect(confirmation.locator(".rebirth-confirm-prompt")).toHaveText(
      rebirthText(locale, "prompt"),
    );
    await expect(confirmation.locator(".rebirth-confirm-body")).toHaveText(
      metaText(locale, "rebirthBody"),
    );
    await expect(
      confirmation.getByText(
        rebirthCarryText(locale, formatNumber(locale, before.permanent.ascendencyPoints, 0)),
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      confirmation.getByRole("button", { name: rebirthText(locale, "confirm"), exact: true }),
    ).toBeVisible();
    await expect(
      confirmation.getByRole("button", { name: rebirthText(locale, "cancel"), exact: true }),
    ).toBeVisible();
  }

  const finalLocale = LOCALE_IDS.at(-1)!;
  await page
    .getByRole("dialog", { name: rebirthText(finalLocale, "title") })
    .getByRole("button", { name: rebirthText(finalLocale, "confirm"), exact: true })
    .click();

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("#tab-hydrogen")).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().permanent.rebirthCount))
    .toBe(2);
  const reborn = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(reborn.run.space.currentSystemId).toBe(destination);
  expect(reborn.permanent.ascendencyPoints).toBe(before.permanent.ascendencyPoints);
  expect(reborn.permanent.galacticCasino.casinoPoints).toBe(0);
});

test("Rebirth confirmation localizes Galactic Points carryover after Cosmic Rip unlock", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  expect(
    await page.evaluate(() => window.miaplacidusTest!.applyDebugAction("unlock-all-tabs")),
  ).toBe(true);
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-rebirth").click();

  const pane = page.getByTestId("rebirth-pane");
  await pane
    .getByRole("button", { name: metaText("en", "rebirthAction"), exact: true })
    .click();

  for (const locale of LOCALE_IDS) {
    await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    const confirmation = page.getByRole("dialog", { name: rebirthText(locale, "title") });
    await expect(confirmation).toBeVisible();
    await expect(
      confirmation.getByText(rebirthText(locale, "gp"), { exact: true }),
    ).toBeVisible();
    await expect(confirmation.locator(".rebirth-confirm-body")).toHaveText(
      metaText(locale, "rebirthBody"),
    );
  }
});
