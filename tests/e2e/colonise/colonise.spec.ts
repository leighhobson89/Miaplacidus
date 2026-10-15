import { expect, test } from "../_harness/fixtures";

async function startUnoccupiedFixture(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-unoccupied");
  await page.getByLabel("Pioneer name").fill("Battle Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: /Colonise/ }).click();
}

test("settles an unoccupied arrival without opening battle @colonise", async ({ page }) => {
  await startUnoccupiedFixture(page);
  const pane = page.getByTestId("starship-pane");
  const stateBefore = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(stateBefore.run.space.systemEncounters[0]?.civilizationLevel).toBe("unsentient");
  const destinationProfile = stateBefore.run.space.systemProfiles.find(
    (profile) => profile.systemId === stateBefore.run.space.starship.destinationSystemId,
  );
  expect(destinationProfile).toBeDefined();
  await expect(pane.getByTestId("starship-battle-engage-button")).toHaveCount(0);

  await pane.getByTestId("starship-settle-system-button").click();
  const stateAfter = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(stateAfter.permanent.settledSystemIds).toContain(
    stateBefore.run.space.starship.destinationSystemId,
  );
  expect(stateAfter.permanent.ascendencyPoints).toBe(
    stateBefore.permanent.ascendencyPoints + destinationProfile!.ascendencyPoints,
  );
  expect(stateAfter.permanent.gloryPoints).toBe(0);
});
