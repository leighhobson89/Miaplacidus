import { expect, test } from "../_harness/fixtures";

async function startPhilosophyFixture(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(
    "/?testSeed=20261003&testLocale=en&economyFixture=philosophy-notification-routes",
  );
  await page.getByLabel("Pioneer name").fill("Philosophy Notice Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("philosophy purchases show source notices and respect notification settings @p08", async ({
  page,
}) => {
  await startPhilosophyFixture(page);
  await page.getByRole("tab", { name: "Research" }).click();
  await page.getByRole("tab", { name: "Philosophy" }).click();

  const philosophy = page.getByTestId("philosophy-pane");
  const ability = philosophy.locator('[data-philosophy-ability="spaceStorageTankResearch"]');
  await ability.getByRole("button", { name: "Research" }).click();
  const abilityNotice = page
    .getByTestId("game-notification")
    .filter({ hasText: "ABILITY: Base storage expansion multiplier now 5x instead of 2x!" });
  await expect(abilityNotice).toHaveCount(1);
  await expect(abilityNotice).toHaveClass(/notification-info/);
  await expect(abilityNotice).toHaveAttribute("data-classification", "tech");
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.philosophyAbilityActive),
    )
    .toBe(true);
  await expect(abilityNotice).toBeHidden({ timeout: 5_000 });

  const repeatable = philosophy.locator('[data-philosophy-repeatable="efficientAssembly"]');
  await repeatable.getByRole("button", { name: "Research" }).click();
  const repeatableNotice = page
    .getByTestId("game-notification")
    .filter({ hasText: "Space Building costs reduced by 1%!" });
  await expect(repeatableNotice).toHaveCount(1);
  await expect(repeatableNotice).toHaveClass(/notification-info/);
  await expect(repeatableNotice).toHaveAttribute("data-classification", "tech");
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().permanent.philosophyRepeatableRanks.efficientAssembly,
      ),
    )
    .toBe(1);
  await expect(repeatableNotice).toBeHidden({ timeout: 5_000 });

  await page.getByRole("tab", { name: "Settings" }).click();
  await page.locator("#settings-notifications").uncheck();
  await page.getByRole("tab", { name: "Research" }).click();
  await page.getByRole("tab", { name: "Philosophy" }).click();
  await philosophy
    .locator('[data-philosophy-repeatable="laserMining"]')
    .getByRole("button", { name: "Research" })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().permanent.philosophyRepeatableRanks.laserMining,
      ),
    )
    .toBe(1);
  await expect(
    page.getByTestId("game-notification").filter({ hasText: "Resources AutoBuyers 5% cheaper!" }),
  ).toHaveCount(0);
});
