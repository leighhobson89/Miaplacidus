import { expect, type Locator, type Page } from "./fixtures";
import type { LocaleId } from "../../../src/content/ids";

export async function expandHydrogenAutobuyers(container: Locator): Promise<void> {
  const section = container.locator(".hydrogen-autobuyer-section");
  if ((await section.getAttribute("open")) === null) await section.locator("summary").click();
}

export async function setAllocationSlider(
  allocation: Locator,
  label: "Cash share" | "Compound share",
  value: number,
): Promise<void> {
  const slider = allocation.getByRole("slider", { name: `${label} (%)` });
  const currentValue = Number(await slider.getAttribute("aria-valuenow"));
  const distance = Math.abs(value - currentValue);
  if (distance % 5 !== 0) throw new Error("Allocation values must use five-point increments.");
  const key = value > currentValue ? "ArrowRight" : "ArrowLeft";
  for (let step = 0; step < distance / 5; step += 1) await slider.press(key);
}

export async function startEconomyFixture(
  page: Page,
  fixture:
    | "full"
    | "notation-coverage"
    | "research"
    | "infinite-power"
    | "power-deficit"
    | "battery-cycle"
    | "storage"
    | "storage-efficient"
    | "storage-each"
    | "storage-compounds"
    | "storage-all"
    | "water-storage"
    | "water-storage-short"
    | "storage-production"
    | "save"
    | "bulk-hydrogen"
    | "bulk-science"
    | "bulk-energy"
    | "power-buildings"
    | "buyer-tiers"
    | "compound-automation"
    | "multipliers"
    | "meta-megastructure-factory-dysonSphere"
    | "meta-megastructure-visual-dysonSphere",
  locale: LocaleId = "en",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const clearedFlag = "miaplacidus:test:economy-storage-cleared";
    if (sessionStorage.getItem(clearedFlag) === "1") return;
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
    sessionStorage.setItem(clearedFlag, "1");
  });
  await page.goto(`/?testSeed=20261003&testLocale=${locale}&economyFixture=${fixture}`);
  await page.locator("#pioneer-name").fill(`Economy ${fixture}`);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}
