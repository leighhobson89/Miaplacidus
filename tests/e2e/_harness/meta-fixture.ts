import type { Page } from "@playwright/test";
import { expect } from "./fixtures";

export async function startMetaFixture(
  page: Page,
  fixture:
    | "meta-rebirth-ready"
    | "meta-market-ready"
    | "meta-casino-ready"
    | "meta-black-hole-discovered"
    | "meta-megastructure-route"
    | "meta-cosmic-rip-route" = "meta-rebirth-ready",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const clearedKey = "miaplacidus:test-storage-cleared";
    if (sessionStorage.getItem(clearedKey) !== "yes") {
      const keys = Array.from({ length: localStorage.length }, (_, index) =>
        localStorage.key(index),
      ).filter((key): key is string => key?.startsWith(prefix) ?? false);
      for (const key of keys) localStorage.removeItem(key);
      sessionStorage.setItem(clearedKey, "yes");
    }
  });
  await page.goto(`/?testSeed=20261003&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("Ascendency Pioneer");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByTestId("hydrogen-onboarding")).toBeVisible();
  await page.getByRole("button", { name: "Begin exploring" }).click();
}
