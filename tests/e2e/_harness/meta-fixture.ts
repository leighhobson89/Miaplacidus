import type { Page } from "@playwright/test";
import { expect } from "./fixtures";

export async function startMetaFixture(
  page: Page,
  fixture:
    | "meta-rebirth-ready"
    | "meta-market-ready"
    | "meta-market-rebirth-ready"
    | "meta-market-action-reasons"
    | "meta-market-action-reasons-rebirth-ready"
    | "meta-casino-ready"
    | "meta-casino-timewarp"
    | "meta-casino-finish-rocket-journey"
    | "meta-post-rebirth-casino-access"
    | "meta-black-hole-discovered"
    | "meta-black-hole-underfunded"
    | "meta-galactic-identity-matrix"
    | "meta-megastructure-route"
    | "meta-megastructure-audio"
    | `meta-megastructure-factory-${
        | "celestialProcessingCore"
        | "plasmaForge"
        | "galacticMemoryArchive"
        | "dysonSphere"}`
    | `meta-megastructure-visual-${
        | "celestialProcessingCore"
        | "plasmaForge"
        | "galacticMemoryArchive"
        | "dysonSphere"}`
    | "meta-megastructure-research-reasons"
    | "meta-cosmic-rip-route"
    | "meta-cosmic-rip-objective-scan"
    | "meta-cosmic-rip-restore-affordance"
    | "meta-cosmic-rip-action-affordances"
    | "meta-cosmic-rip-close-affordance"
    | "meta-cosmic-rip-ending-ready"
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
