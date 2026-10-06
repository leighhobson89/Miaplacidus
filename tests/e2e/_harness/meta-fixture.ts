import type { Page } from "@playwright/test";
import { expect } from "./fixtures";

export async function startMetaFixture(
  page: Page,
  fixture:
    | "meta-rebirth-ready"
    | "meta-market-ready"
    | "meta-market-action-reasons"
    | "meta-casino-ready"
    | "meta-casino-timewarp"
    | "meta-post-rebirth-casino-access"
    | "meta-black-hole-discovered"
    | "meta-black-hole-underfunded"
    | "meta-megastructure-route"
    | "meta-megastructure-research-reasons"
    | "meta-cosmic-rip-route"
    | "meta-cosmic-rip-restore-affordance"
    | "meta-cosmic-rip-action-affordances"
    | "meta-cosmic-rip-close-affordance"
    | "space-manuscript-hidden" = "meta-rebirth-ready",
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
  await page.getByTestId("start-game").click();
  await expect
    .poll(() => page.evaluate(() => Boolean(window.miaplacidusTest?.getState())))
    .toBe(true);
}
