import { expect, test } from "../_harness/fixtures";

test("floats two notices above the game and fades queued notices after three seconds @notifications", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Floating Notice Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);

  const stack = page.getByTestId("notification-stack");
  const notices = stack.getByTestId("game-notification");
  await expect(notices).toHaveCount(0, { timeout: 5_000 });

  const acceptedCollections = await page.evaluate(() =>
    Array.from({ length: 50 }, () =>
      window.miaplacidusTest!.dispatch({ type: "resource.collect", goodId: "hydrogen" }),
    ),
  );
  expect(acceptedCollections.every(Boolean)).toBe(true);
  await expect.poll(() =>
    page.evaluate(() =>
      window.miaplacidusTest!.getState().run.achievements.unlockedIds.includes("collect50Hydrogen"),
    ),
  ).toBe(true);

  const setWeather = async (condition: "clear" | "heavyRain" | "volcano") =>
    page.evaluate(
      (nextCondition) =>
        window.miaplacidusTest!.dispatch({
          type: "space.weather.set-condition",
          condition: nextCondition,
        }),
      condition,
    );
  expect(await setWeather("clear")).toBe(true);
  expect(await setWeather("heavyRain")).toBe(true);
  expect(await setWeather("volcano")).toBe(true);

  await expect(notices).toHaveCount(2);
  await expect(notices.filter({ hasText: "You have collected 50 Hydrogen!" })).toHaveCount(1);
  await expect(notices.filter({ hasText: "Heavy Rain!" })).toHaveCount(1);
  await expect(notices.filter({ hasText: "Volcano Eruption!" })).toHaveCount(0);

  const layout = await page.evaluate(() => {
    const stackElement = document.querySelector<HTMLElement>('[data-testid="notification-stack"]')!;
    const portal = stackElement.closest<HTMLElement>("[data-testid='notification-portal']");
    const stackRect = stackElement.getBoundingClientRect();
    const cardRects = Array.from(stackElement.querySelectorAll<HTMLElement>("[data-testid='game-notification']"))
      .map((card) => card.getBoundingClientRect());
    const style = getComputedStyle(stackElement);
    const cardStyle = getComputedStyle(stackElement.firstElementChild as HTMLElement);
    const heightWithNotices = document.documentElement.scrollHeight;
    stackElement.style.display = "none";
    const heightWithoutNotices = document.documentElement.scrollHeight;
    stackElement.style.removeProperty("display");
    return {
      position: style.position,
      zIndex: Number(style.zIndex),
      portalIsDirectBodyChild: portal?.parentElement === document.body,
      portalZIndex: Number(portal ? getComputedStyle(portal).zIndex : 0),
      right: window.innerWidth - stackRect.right,
      bottom: window.innerHeight - stackRect.bottom,
      cardsShareRow:
        cardRects.length === 2 &&
        Math.abs(cardRects[0]!.bottom - cardRects[1]!.bottom) < 2 &&
        cardRects[0]!.right <= cardRects[1]!.left,
      animationDelay: cardStyle.animationDelay,
      animationDuration: cardStyle.animationDuration,
      noLayoutFootprint: heightWithNotices === heightWithoutNotices,
    };
  });
  expect(layout.position).toBe("fixed");
  expect(layout.zIndex).toBeGreaterThan(100_000);
  expect(layout.portalIsDirectBodyChild).toBe(true);
  expect(layout.portalZIndex).toBe(2_147_483_647);
  expect(layout.right).toBeLessThanOrEqual(20);
  expect(layout.bottom).toBeLessThanOrEqual(20);
  expect(layout.cardsShareRow).toBe(true);
  expect(layout.animationDelay).toBe("3s");
  expect(layout.animationDuration).toBe("0.3s");
  expect(layout.noLayoutFootprint).toBe(true);

  await page.waitForTimeout(3_350);
  await expect(notices).toHaveCount(1);
  await expect(notices).toContainText("Volcano Eruption!");
  await expect(notices).toHaveAttribute("data-visible-duration-ms", "3000");

  await expect(notices).toHaveCount(0, { timeout: 3_800 });
});
