import { createRequire } from "node:module";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { saveText } from "../../../src/i18n/saveMessages";
import { expect, test } from "../_harness/fixtures";
import { openSaveSettings, saveNowFromSettings } from "../_harness/save-controls";
import { setGameLocale } from "../_harness/settings-controls";

const { decompressFromUTF16 } = createRequire(import.meta.url)("lz-string") as typeof import("lz-string");

test("save-lock conflict copy follows live locale changes across six locales @p46-save-lock-conflict-locale", async ({
  freshGame,
}) => {
  const ownerTab = freshGame;
  const staleTab = await ownerTab.context().newPage();
  await staleTab.goto("/?testSeed=75&testLocale=en");
  await staleTab.getByLabel("Pioneer name").fill("Hydrogen Pioneer");
  await staleTab.getByRole("option").filter({ hasText: "Hydrogen Pioneer" }).click();
  await staleTab.getByTestId("start-game").click();
  await expect(staleTab.locator(".run-name")).toHaveText("Hydrogen Pioneer");
  await openSaveSettings(staleTab);
  await expect(staleTab.getByTestId("save-status")).toContainText("another tab");
  const staleManager = staleTab.getByTestId("save-manager-inline");
  const readOnlyReason = staleManager.getByTestId("save-readonly-reason");
  await expect(readOnlyReason).toHaveText(/\S/u);
  const renameButton = staleManager.getByRole("button", { name: saveText("en", "rename") });
  const deleteButton = staleManager.getByRole("button", { name: saveText("en", "delete") });
  await expect(renameButton).toBeDisabled();
  await expect(renameButton).toHaveAttribute(
    "aria-describedby",
    "save-active-slot-readonly-reason",
  );
  await expect(deleteButton).toBeDisabled();
  await expect(deleteButton).toHaveAttribute(
    "aria-describedby",
    "save-active-slot-readonly-reason",
  );

  const headKey = await ownerTab.evaluate(
    () => Object.keys(localStorage).find((key) => key.startsWith("miaplacidus:v1:head:")) ?? null,
  );
  expect(headKey).not.toBeNull();
  const slotId = headKey!.slice("miaplacidus:v1:head:".length);
  const priorHead = await ownerTab.evaluate((key) => localStorage.getItem(key!), headKey);
  expect(priorHead).not.toBeNull();
  const staleHydrogen = await staleTab.evaluate(
    () => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity,
  );

  await ownerTab.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await saveNowFromSettings(ownerTab);
  await expect(ownerTab.getByTestId("hydrogen-quantity")).toContainText("1");
  const ownerHead = await ownerTab.evaluate((key) => localStorage.getItem(key!), headKey);
  expect(ownerHead).not.toBeNull();
  expect(ownerHead).not.toBe(priorHead);
  const savedPayload = await ownerTab.evaluate(
    ({ slotId: savedSlotId, head }) =>
      localStorage.getItem(`miaplacidus:v1:slot:${savedSlotId}:${head}`),
    { slotId, head: ownerHead },
  );
  expect(savedPayload).not.toBeNull();
  const savedJson = decompressFromUTF16(savedPayload!);
  expect(savedJson).not.toBeNull();
  const savedEnvelope = JSON.parse(savedJson ?? "null") as {
    slotId: string;
    pioneerName: string;
    state: { run: { goods: { hydrogen: { quantity: number } } } };
  };
  expect(savedEnvelope.slotId).toBe(slotId);
  expect(savedEnvelope.pioneerName).toBe("Hydrogen Pioneer");
  expect(savedEnvelope.state.run.goods.hydrogen.quantity).toBe(1);
  const ownerHydrogen = await ownerTab.evaluate(
    () => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity,
  );

  await expect(staleTab.locator("html")).toHaveAttribute("lang", "en");
  await expect(staleTab.locator(".save-conflict-banner > span")).toHaveText(/\S/u);
  const conflictAnnouncement = staleTab.getByTestId("save-conflict-announcement");
  await expect(conflictAnnouncement).toHaveAttribute("role", "status");
  await expect(conflictAnnouncement).toHaveAttribute("aria-live", "polite");
  await expect(conflictAnnouncement).toHaveAttribute("aria-atomic", "true");
  await expect(conflictAnnouncement).toHaveText(/\S/u);
  await expect(staleManager.getByTestId("save-readonly-reason")).toHaveText(/\S/u);
  const exportedCode = await staleManager
    .getByRole("textbox", { name: saveText("en", "export") })
    .inputValue();
  await staleManager.locator("#import-code").fill(exportedCode);
  await staleManager.getByRole("button", { name: saveText("en", "preview") }).click();
  await staleManager.getByLabel(saveText("en", "exportFirst")).check();
  const replaceButton = staleManager.getByRole("button", { name: saveText("en", "replace") });
  await expect(replaceButton).toBeDisabled();
  await expect(replaceButton).toHaveAttribute(
    "aria-describedby",
    "save-replace-readonly-reason",
  );
  await expect(staleManager.getByTestId("save-replace-readonly-reason")).toHaveText(/\S/u);
  const localeSequence: readonly LocaleId[] = LOCALE_IDS;
  for (const locale of localeSequence) {
    await setGameLocale(staleTab, locale);
    await expect(staleTab.locator("html")).toHaveAttribute("lang", locale);
    await expect(staleTab.locator(".save-conflict-banner > span")).toHaveText(/\S/u);
    await expect(staleTab.getByTestId("save-conflict-announcement")).toHaveText(/\S/u);
    await expect(staleTab.locator(".run-name")).toHaveText("Hydrogen Pioneer");
    expect(
      await staleTab.evaluate(
        () => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity,
      ),
    ).toBe(staleHydrogen);
    await expect(ownerTab.locator(".run-name")).toHaveText("Hydrogen Pioneer");
    expect(
      await ownerTab.evaluate(
        () => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity,
      ),
    ).toBe(ownerHydrogen);

    const currentHead = await ownerTab.evaluate((key) => localStorage.getItem(key!), headKey);
    expect(currentHead, `${locale} leaves the owner's saved generation unchanged`).toBe(ownerHead);
    expect(headKey!.slice("miaplacidus:v1:head:".length)).toBe(slotId);
  }
  await staleTab.close();
});
