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
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto("/?testSeed=314159&testLocale=en");
    await page.getByLabel("Pioneer name").fill("Hydrogen Pioneer");
    await page.getByRole("button", { name: "Begin exploration" }).click();
    await expect(page.getByRole("heading", { name: "Hydrogen", exact: true })).toBeVisible();
    await expect
      .poll(async () => page.evaluate(() => window.miaplacidusTest?.getState().run.clock.wallNowMs))
      .not.toBeNull();
    await use(page);
  },
});

export { expect };
