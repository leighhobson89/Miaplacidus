import { createRequire } from "node:module";
import type { Page } from "@playwright/test";
import { LOCALE_IDS } from "../../../src/content/ids";
import { canonicalJson, makeEnvelope } from "../../../src/persistence/schema";
import { saveErrorText, saveText } from "../../../src/i18n/saveMessages";
import { expect, test } from "../_harness/fixtures";
import { saveNowFromSettings } from "../_harness/save-controls";

const { compressToUTF16 } = createRequire(import.meta.url)(
  "lz-string",
) as typeof import("lz-string");

async function expectStartupNotification(
  page: Page,
  type: "error" | "success",
  message: string,
): Promise<void> {
  await expect(
    page
      .locator(`[data-testid="game-notification"].notification-${type}`)
      .filter({ hasText: message }),
  ).toHaveText(message);
  await expect(
    page.locator(".save-start-panel .save-error, .save-start-panel .save-notice"),
  ).toHaveCount(0);
  await page.clock.runFor(3_300);
}

test("save recovery labels, failures, and success follow all six locales @p46-recovery-locale", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.clock.install();

  for (const [index, locale] of LOCALE_IDS.entries()) {
    if (index > 0) {
      await page.evaluate(() => {
        const prefix = "miaplacidus:v1:";
        for (const storage of [localStorage, sessionStorage]) {
          const keys = Array.from({ length: storage.length }, (_, position) =>
            storage.key(position),
          ).filter((key): key is string => key?.startsWith(prefix) ?? false);
          for (const key of keys) storage.removeItem(key);
        }
      });
    }

    await page.goto("/?testSeed=20261009&testLocale=en");
    await page.locator("#start-locale").selectOption(locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.locator("#pioneer-name").fill("Recovery Locale Pioneer");
    await page.getByTestId("start-game").click();
    await expect(page.locator("[data-app-ready]")).toBeVisible();
    await saveNowFromSettings(page);

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const wrongSlotPayload = compressToUTF16(
      canonicalJson(
        makeEnvelope({
          slotId: "00000000-0000-4000-8000-000000000999",
          pioneerName: state.run.pioneerName,
          createdAt: 0,
          savedAt: 0,
          revision: 1,
          state,
        }),
      ),
    );
    const generations = await page.evaluate(() => {
      const headKey = Object.keys(localStorage).find((key) =>
        key.startsWith("miaplacidus:v1:head:"),
      );
      if (!headKey) throw new Error("The saved slot head was not written.");
      const slotId = headKey.slice("miaplacidus:v1:head:".length);
      const headId = localStorage.getItem(headKey);
      if (!headId) throw new Error("The saved slot head was empty.");
      const prefix = `miaplacidus:v1:slot:${slotId}:`;
      const headPayloadKey = prefix + headId;
      const priorPayloadKey = Object.keys(localStorage).find(
        (key) => key.startsWith(prefix) && key !== headPayloadKey,
      );
      if (!priorPayloadKey) throw new Error("The previous save generation was not retained.");
      const priorPayload = localStorage.getItem(priorPayloadKey);
      if (!priorPayload) throw new Error("The previous save generation was empty.");
      return { headPayloadKey, priorPayloadKey, priorPayload };
    });
    await page.evaluate((headPayloadKey) => {
      localStorage.setItem(headPayloadKey, "broken-generation");
    }, generations.headPayloadKey);
    await page.reload();
    await page.locator("#start-locale").selectOption(locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    const recovery = page.locator(".local-save-recovery");
    const summary = recovery.locator("summary");
    await summary.click();
    await expect(summary).toHaveText(/\S/u);
    await expect(recovery.locator("li small").first()).toHaveText(/\S/u);
    await recovery.locator("li button").first().click();

    const actions = recovery.locator(".slot-recovery-actions").first();
    await expect(actions.locator("button").nth(0)).toHaveText(/\S/u);
    await expect(actions.locator("button").nth(1)).toHaveText(/\S/u);

    await page.evaluate(({ key, payload }) => localStorage.setItem(key, payload), {
      key: generations.priorPayloadKey,
      payload: wrongSlotPayload,
    });
    await actions
      .getByRole("button", { name: saveText(locale, "recoverConfirm"), exact: true })
      .click();
    await expectStartupNotification(page, "error", saveErrorText(locale, "corrupt-slot"));

    await page.evaluate(({ key, payload }) => localStorage.setItem(key, payload), {
      key: generations.priorPayloadKey,
      payload: generations.priorPayload,
    });
    await actions
      .getByRole("button", { name: saveText(locale, "recoverConfirm"), exact: true })
      .click();
    await expectStartupNotification(page, "success", saveText(locale, "recovered"));
  }
});
