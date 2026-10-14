import { dismissTutorialOfferIfPresent, expect, test } from "../_harness/fixtures";
import { LOCALE_IDS } from "../../../src/content/ids";
import { PHILOSOPHY_ABILITY_RESEARCH_COST } from "../../../src/content/philosophy";
import { philosophyText } from "../../../src/i18n/philosophyMessages";
import { formatNumber } from "../../../src/app/numberFormatting";

async function startSpaceFixture(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("miaplacidus:fixture-cleared") === "yes") return;
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
    sessionStorage.setItem("miaplacidus:fixture-cleared", "yes");
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-telescope");
  await page.getByLabel("Pioneer name").fill("P45 Philosophy Purchases");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await dismissTutorialOfferIfPresent(page);
}

test("P-45 Philosophy purchases show localized active and rank results @p45-philosophy-purchases", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();
  await page.getByRole("button", { name: "Build Space Telescope", exact: true }).click();
  await page.getByRole("button", { name: "Study Stars", exact: true }).click();
  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "timer.complete",
        timerId: "survey:star-study",
      }),
    ),
  ).toBe(true);

  const choice = page.getByTestId("philosophy-choice");
  await expect(choice).toBeVisible();
  await choice.getByRole("button", { name: "Expansionist", exact: true }).click();
  await page.getByRole("tab", { name: "Research" }).click();
  await page.getByRole("tab", { name: "Philosophy" }).click();

  expect(
    await page.evaluate(() => window.miaplacidusTest!.applyDebugAction("give-1m-research")),
  ).toBe(true);
  const pane = page.getByTestId("philosophy-pane");
  const abilityCard = pane.locator('[data-philosophy-ability="rapidExpansion"]');
  const warpDriveCard = pane.locator('[data-philosophy-repeatable="warpDrive"]');
  const researchBefore = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.researchPoints,
  );

  await abilityCard
    .getByRole("button", { name: philosophyText("en").abilityAction, exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() => ({
        active: window.miaplacidusTest!.getState().run.philosophyAbilityActive,
        research: window.miaplacidusTest!.getState().run.researchPoints,
      })),
    )
    .toEqual({ active: true, research: researchBefore - PHILOSOPHY_ABILITY_RESEARCH_COST });

  const researchAfterAbility = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.researchPoints,
  );
  await warpDriveCard.getByRole("button", { name: philosophyText("en").buy }).click();
  await expect
    .poll(() =>
      page.evaluate(() => ({
        rank: window.miaplacidusTest!.getState().permanent.philosophyRepeatableRanks.warpDrive,
        research: window.miaplacidusTest!.getState().run.researchPoints,
      })),
    )
    .toEqual({ rank: 1, research: researchAfterAbility - 10_000 });

  const activeState = await page.evaluate(() => window.miaplacidusTest!.getState());
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
    const copy = philosophyText(locale);
    const ability = copy.abilities.rapidExpansion;
    await expect(abilityCard.getByRole("heading", { level: 3 })).toHaveText(
      `${copy.ability}: ${ability.name}`,
    );
    await expect(abilityCard.locator("p").nth(1)).toHaveText(copy.active);
    await expect(
      abilityCard.getByRole("button", { name: copy.active, exact: true }),
    ).toBeDisabled();

    const warpDrive = copy.upgrades.warpDrive;
    await expect(warpDriveCard.getByRole("heading", { level: 4 })).toHaveText(warpDrive.name);
    await expect(warpDriveCard.locator("p").nth(1)).toHaveText(
      `${copy.rank}: ${formatNumber(locale, 1, 0, activeState.settings.notation)}`,
    );
    await expect(warpDriveCard.locator("p").nth(2)).toHaveText(
      `${copy.nextCost}: ${formatNumber(locale, 11_300, 0, activeState.settings.notation)} ${copy.researchShort}`,
    );
    await expect(warpDriveCard.getByRole("button", { name: copy.buy, exact: true })).toBeEnabled();
  }
});
