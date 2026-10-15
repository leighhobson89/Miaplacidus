import type { Page } from "@playwright/test";
import { createRequire } from "node:module";
import { expect, test } from "../_harness/fixtures";
import { saveNowFromSettings } from "../_harness/save-controls";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

const { decompressFromUTF16 } = createRequire(import.meta.url)("lz-string") as typeof import("lz-string");

async function startFreshPioneer(page: Page, name: string): Promise<void> {
  await page.getByLabel("Pioneer name").fill(name);
  await expect(page.getByTestId("start-game")).toHaveText("START NEW GAME");
  await page.getByTestId("start-game").click();
}

async function resumePioneer(page: Page, name: string): Promise<void> {
  await page.getByLabel("Pioneer name").fill(name);
  await page.getByRole("option").filter({ hasText: name }).click();
  await page.getByTestId("start-game").click();
}

async function prepareSaveVisualCheckpoint(page: Page): Promise<void> {
  const tutorial = page.locator(".progression-tutorial");
  if (await tutorial.count()) {
    const noThanks = tutorial.getByRole("button", { name: "No thanks", exact: true });
    await expect(noThanks).toBeVisible();
    await noThanks.click();
    await expect(tutorial).toHaveCount(0);
  }
  await expect(page.getByTestId("notification-stack").getByTestId("game-notification")).toHaveCount(
    0,
    { timeout: 10_000 },
  );
  await page.locator(".weather-effects-overlay").evaluateAll((overlays) => {
    for (const overlay of overlays) (overlay as HTMLElement).style.visibility = "hidden";
  });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(600);
}

test("durable timer IDs and offline clock anchors survive a player-triggered save and reload @durable-timers @save-load-local", async ({
  page,
}, testInfo) => {
  await page.goto("/?testSeed=76&testLocale=en");
  await startFreshPioneer(page, "Timer Pioneer");
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  const added = await page.evaluate(() =>
    window.miaplacidusTest?.dispatch({
      type: "timer.add",
      timerId: "research:long-study",
      domain: "research",
      durationMs: 60_000,
      repeat: true,
    }),
  );
  expect(added).toBe(true);
  expect(
    await page.evaluate(() => window.miaplacidusTest?.getState().run.timers["research:long-study"]),
  ).toMatchObject({ id: "research:long-study", status: "running" });
  await saveNowFromSettings(page);
  const activePayload = await page.evaluate(() => {
    const headKey = Object.keys(localStorage).find((key) => key.startsWith("miaplacidus:v1:head:"));
    if (!headKey) return null;
    const slotId = headKey.slice("miaplacidus:v1:head:".length);
    const commitId = localStorage.getItem(headKey);
    return commitId ? localStorage.getItem(`miaplacidus:v1:slot:${slotId}:${commitId}`) : null;
  });
  expect(activePayload).not.toBeNull();
  const savedEnvelope = JSON.parse(decompressFromUTF16(activePayload!) ?? "null") as {
    state?: { run?: { timers?: Record<string, unknown> } };
  };
  expect(savedEnvelope.state?.run?.timers?.["research:long-study"]).toMatchObject({
    id: "research:long-study",
    status: "running",
  });
  const savedWallTime = await page.evaluate(
    () => window.miaplacidusTest?.getState().run.clock.wallNowMs,
  );
  expect(savedWallTime).not.toBeNull();
  await page.reload();
  const reloadedPayload = await page.evaluate(() => {
    const headKey = Object.keys(localStorage).find((key) => key.startsWith("miaplacidus:v1:head:"));
    if (!headKey) return null;
    const slotId = headKey.slice("miaplacidus:v1:head:".length);
    const commitId = localStorage.getItem(headKey);
    return commitId ? localStorage.getItem(`miaplacidus:v1:slot:${slotId}:${commitId}`) : null;
  });
  expect(reloadedPayload).not.toBeNull();
  const reloadedEnvelope = JSON.parse(decompressFromUTF16(reloadedPayload!) ?? "null") as {
    state?: { run?: { timers?: Record<string, unknown> } };
  };
  expect(reloadedEnvelope.state?.run?.timers?.["research:long-study"]).toMatchObject({
    id: "research:long-study",
    status: "running",
  });
  await resumePioneer(page, "Timer Pioneer");
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  const restored = await page.evaluate(() => window.miaplacidusTest?.getState());
  expect(restored?.run.timers["research:long-study"]).toMatchObject({
    id: "research:long-study",
    domain: "research",
    durationMs: 60_000,
    repeat: true,
    status: "running",
  });
  expect(restored?.run.clock.wallNowMs).toBeGreaterThanOrEqual(savedWallTime ?? 0);
  await prepareSaveVisualCheckpoint(page);
  await captureVisualCheckpoint(page, testInfo, "durable-timer-after-reload");
});
