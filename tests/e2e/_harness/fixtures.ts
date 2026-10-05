import { expect, test as base, type Page } from "@playwright/test";

interface HydrogenFixtures {
  readonly freshGame: Page;
  readonly browserErrors: string[];
}

export const test = base.extend<HydrogenFixtures>({
  browserErrors: [
    async ({ page, baseURL }, use) => {
      const errors: string[] = [];
      const localOrigin = new URL(baseURL ?? "http://127.0.0.1:4173").origin;
      page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(`console: ${message.text()}`);
      });
      page.on("request", (request) => {
        if (new URL(request.url()).origin !== localOrigin) {
          errors.push(`external request: ${request.url()}`);
        }
      });
      await use(errors);
      expect(errors, "the app should stay error-free and use only local requests").toEqual([]);
    },
    { auto: true },
  ],
  freshGame: async ({ page }, use) => {
    await page.addInitScript(() => {
      const appPrefix = "miaplacidus:v1:";
      const clearedFlag = "miaplacidus:test:fresh-game-cleared";
      if (sessionStorage.getItem(clearedFlag) === "1") return;
      for (const storage of [localStorage, sessionStorage]) {
        const appKeys = Array.from({ length: storage.length }, (_, index) =>
          storage.key(index),
        ).filter((key): key is string => key?.startsWith(appPrefix) ?? false);
        for (const key of appKeys) storage.removeItem(key);
      }
      sessionStorage.setItem(clearedFlag, "1");
    });
    await page.goto("/?testSeed=314159&testLocale=en");
    await page.getByLabel("Pioneer name").fill("Hydrogen Pioneer");
    await page.getByTestId("start-game").click();
    await expect(
      page.getByRole("heading", { name: "Hydrogen", exact: true, level: 2 }),
    ).toBeVisible();
    await expect
      .poll(async () => page.evaluate(() => window.miaplacidusTest?.getState().run.clock.wallNowMs))
      .not.toBeNull();
    await use(page);
  },
});

export { expect };
