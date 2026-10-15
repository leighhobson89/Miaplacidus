import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { saveText } from "../../../src/i18n/saveMessages";
import { openSaveManager, saveNowFromSettings } from "../_harness/save-controls";
import { setGameLocale } from "../_harness/settings-controls";

type DeleteWarningDetails = {
  readonly savedProgressAndAchievements: string;
  readonly otherSavesUnaffected: string;
  readonly exportFirst: string;
};

const DELETE_WARNING_DETAILS: Record<LocaleId, DeleteWarningDetails> = {
  en: {
    savedProgressAndAchievements: "saved progress and achievements",
    otherSavesUnaffected: "Other Pioneer saves on this device are unaffected.",
    exportFirst: "Export this save first",
  },
  es: {
    savedProgressAndAchievements: "progreso y los logros guardados de este pionero",
    otherSavesUnaffected: "Las demás partidas de otros pioneros no se verán afectadas.",
    exportFirst: "Exporta esta partida primero",
  },
  pt: {
    savedProgressAndAchievements: "progresso e as conquistas guardados deste pioneiro",
    otherSavesUnaffected: "As gravações dos outros pioneiros não serão afetadas.",
    exportFirst: "Exporta esta gravação primeiro",
  },
  de: {
    savedProgressAndAchievements: "gespeicherte Fortschritt und die Erfolge dieses Pioniers",
    otherSavesUnaffected: "Andere gespeicherte Pioniere sind davon nicht betroffen.",
    exportFirst: "Exportiere diesen Spielstand vorher",
  },
  it: {
    savedProgressAndAchievements: "progressi salvati e gli obiettivi di questo pioniere",
    otherSavesUnaffected: "Gli altri salvataggi dei pionieri non saranno interessati.",
    exportFirst: "Esporta prima questo salvataggio",
  },
  fr: {
    savedProgressAndAchievements: "progression enregistrée et les succès de ce pionnier",
    otherSavesUnaffected: "Les autres sauvegardes de pionniers ne seront pas concernées.",
    exportFirst: "Exportez d’abord cette sauvegarde",
  },
};

for (const locale of LOCALE_IDS) {
  test(`active-slot reset adaptation follows the selected locale (${locale}) @phase7-locale @save-slots @settings @locale`, async ({
    freshGame,
  }) => {
    await setGameLocale(freshGame, locale);
    await saveNowFromSettings(freshGame);
    await openSaveManager(freshGame);

    const manager = freshGame.getByTestId("save-manager-inline");
    await manager.getByRole("button", { name: saveText(locale, "delete"), exact: true }).click();

    const confirmation = manager.locator("fieldset.destructive-confirm");
    await expect(confirmation.locator("legend")).toHaveText(saveText(locale, "confirmDelete"));
    const prompt = confirmation.locator("p");
    const deletePrompt = saveText(locale, "deletePrompt");
    const warningDetails = DELETE_WARNING_DETAILS[locale];
    expect(deletePrompt).toContain(warningDetails.savedProgressAndAchievements);
    expect(deletePrompt).toContain(warningDetails.otherSavesUnaffected);
    expect(deletePrompt).toContain(warningDetails.exportFirst);
    await expect(prompt).toHaveText(deletePrompt);
    await expect(prompt).toContainText(warningDetails.savedProgressAndAchievements);
    await expect(prompt).toContainText(warningDetails.otherSavesUnaffected);
    await expect(prompt).toContainText(warningDetails.exportFirst);
    const exportAcknowledgement = confirmation.getByLabel(saveText(locale, "exportFirst"));
    const confirmDelete = confirmation.getByRole("button", {
      name: saveText(locale, "confirmDelete"),
      exact: true,
    });
    await expect(exportAcknowledgement).not.toBeChecked();
    await expect(confirmDelete).toBeDisabled();
    await exportAcknowledgement.check();
    await expect(confirmDelete).toBeEnabled();
    await confirmDelete.click();

    await expect(
      freshGame
        .getByTestId("notification-stack")
        .getByTestId("game-notification")
        .filter({ hasText: saveText(locale, "saveDeleted") }),
    ).toHaveText(saveText(locale, "saveDeleted"));
    await expect(freshGame.getByTestId("start-game")).toBeVisible();
  });
}
