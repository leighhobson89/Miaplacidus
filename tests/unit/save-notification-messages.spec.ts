import { describe, expect, it } from "vitest";
import { LOCALE_IDS } from "../../src/content/ids";
import { saveText } from "../../src/i18n/saveMessages";

const SOURCE_AUTO_SAVE_OFF_COPY = {
  en: "AUTOSAVE IS OFF, REMEMBER TO BACK UP SAVES MANUALLY",
  es: "EL GUARDADO AUTOMÁTICO ESTÁ DESACTIVADO, RECUERDA HACER COPIAS MANUALES",
  pt: "O GUARDADO AUTOMÁTICO ESTÁ DESATIVADO, LEMBRE-SE DE FAZER CÓPIAS MANUAIS",
  de: "AUTOMATISCHES SPEICHERN IST AUS, DENK AN MANUELLE SICHERUNGEN",
  it: "IL SALVATAGGIO AUTOMATICO È DISATTIVO, RICORDA DI FARE COPIE MANUALI",
  fr: "LA SAUVEGARDE AUTOMATIQUE EST DÉSACTIVÉE, PENSEZ À SAUVEGARDER MANUELLEMENT",
} as const;

describe("source-matched autosave-off notice", () => {
  it.each(LOCALE_IDS)("matches the Cosmic Forge copy for %s", (locale) => {
    expect(saveText(locale, "autoSaveDisabledWarning")).toBe(SOURCE_AUTO_SAVE_OFF_COPY[locale]);
  });
});
