import { createRequire } from "node:module";
import { LOCALE_IDS } from "../../../src/content/ids";
import { canonicalJson, makeEnvelope } from "../../../src/persistence/schema";
import { saveText } from "../../../src/i18n/saveMessages";
import { expect, test } from "../_harness/fixtures";
import { saveNowFromSettings } from "../_harness/save-controls";

const { compressToUTF16 } = createRequire(import.meta.url)(
  "lz-string",
) as typeof import("lz-string");

test("save recovery labels, failures, and success follow all six locales @p46-recovery-locale", async ({
  page,
}) => {
  test.setTimeout(120_000);

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
    await expect(summary).toHaveText(saveText(locale, "recover"));
    await expect(
      recovery.getByText(saveText(locale, "corrupt"), { exact: true }).first(),
    ).toBeVisible();
    await recovery
      .getByRole("button", { name: saveText(locale, "recover"), exact: true })
      .first()
      .click();

    const actions = recovery.locator(".slot-recovery-actions").first();
    await expect(
      actions.getByRole("button", { name: saveText(locale, "recoverConfirm"), exact: true }),
    ).toBeVisible();
    await expect(
      actions.getByRole("button", { name: saveText(locale, "cancel"), exact: true }),
    ).toBeVisible();

    await page.evaluate(({ key, payload }) => localStorage.setItem(key, payload), {
      key: generations.priorPayloadKey,
      payload: wrongSlotPayload,
    });
    await actions
      .getByRole("button", { name: saveText(locale, "recoverConfirm"), exact: true })
      .click();
    await expect(page.getByRole("alert")).toHaveText(saveText(locale, "errCorrupt"));

    await page.evaluate(({ key, payload }) => localStorage.setItem(key, payload), {
      key: generations.priorPayloadKey,
      payload: generations.priorPayload,
    });
    await actions
      .getByRole("button", { name: saveText(locale, "recoverConfirm"), exact: true })
      .click();
    await expect(page.locator(".save-notice")).toHaveText(saveText(locale, "recovered"));
  }
});
