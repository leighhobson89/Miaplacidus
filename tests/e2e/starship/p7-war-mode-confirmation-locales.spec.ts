import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { starshipText } from "../../../src/i18n/starshipMessages";
import { warModeText } from "../../../src/i18n/warModeMessages";

type WarConfirmationFixture = "space-battle-victory" | "space-battle-victory-blind";

async function startWarFixture(
  page: import("@playwright/test").Page,
  fixture: WarConfirmationFixture,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261016&testLocale=en&economyFixture=${fixture}`);
  await page.locator("#pioneer-name").fill(`Phase 7 War Confirmation ${fixture}`);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-colonise").click();
}

async function setLocale(page: import("@playwright/test").Page, locale: LocaleId): Promise<void> {
  await page.evaluate((nextLocale) => {
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: nextLocale },
    });
  }, locale);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

async function expectWarConfirmation(
  page: import("@playwright/test").Page,
  locale: LocaleId,
  sourceCopyKey: "enterwarModeModalBackOutText" | "enterwarModeModalNoBackOutText",
): Promise<void> {
  const pane = page.getByTestId("starship-pane");
  const dialog = pane.getByTestId("starship-war-confirmation-dialog");
  const sourceCopy = warModeText(locale, sourceCopyKey)
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const expectedCopy =
    sourceCopyKey === "enterwarModeModalNoBackOutText"
      ? `${sourceCopy} ${warModeText(locale, "attackingBlind")}`
      : sourceCopy;

  expect(warModeText(locale, "enterWarModeModalHeader").trim()).not.toBe("");
  expect(sourceCopy, `${locale} war confirmation copy is populated`).not.toBe("");
  await pane.getByTestId("starship-enter-war-button").click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-labelledby", "starship-war-confirmation-title");
  await expect(dialog).toHaveAttribute("aria-describedby", "starship-war-confirmation-copy");
  await expect(dialog.getByTestId("starship-war-confirmation-title")).toHaveText(
    warModeText(locale, "enterWarModeModalHeader"),
  );
  await expect(dialog.getByTestId("starship-war-confirmation-copy")).toHaveText(expectedCopy);
  await expect(dialog.getByTestId("starship-war-confirmation-confirm")).toHaveText(
    warModeText(locale, "confirmWar"),
  );
  if (sourceCopyKey === "enterwarModeModalBackOutText") {
    await expect(dialog.getByTestId("starship-war-confirmation-cancel")).toHaveText(
      warModeText(locale, "cancelWar"),
    );
  } else {
    await expect(dialog.getByTestId("starship-war-confirmation-cancel")).toHaveCount(0);
  }
}

test("routes Cosmic Forge war-entry confirmation copy in all six locales @p7-localization @colonise", async ({
  page,
}) => {
  test.setTimeout(120_000);

  await startWarFixture(page, "space-battle-victory");
  const pane = page.getByTestId("starship-pane");
  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    await expectWarConfirmation(page, locale, "enterwarModeModalBackOutText");
    await pane.getByTestId("starship-war-confirmation-cancel").click();
    await expect(pane.getByTestId("starship-war-confirmation-dialog")).toBeHidden();
    await expect(pane.getByTestId("starship-war-mode")).toHaveCount(0);
  }
  await pane.getByTestId("starship-enter-war-button").click();
  await pane.getByTestId("starship-war-confirmation-confirm").click();
  await expect(pane.getByTestId("starship-war-mode")).toHaveText(
    starshipText("fr", "warModeActive"),
  );

  await startWarFixture(page, "space-battle-victory-blind");
  const blindPane = page.getByTestId("starship-pane");
  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    await expectWarConfirmation(page, locale, "enterwarModeModalNoBackOutText");
    await expect(blindPane.getByTestId("starship-war-confirmation-cancel")).toHaveCount(0);
  }
  await blindPane.getByTestId("starship-enter-war-button").click();
  await blindPane.getByTestId("starship-war-confirmation-confirm").click();
  await expect(blindPane.getByTestId("starship-war-mode")).toHaveText(
    starshipText("fr", "warModeActive"),
  );
});
