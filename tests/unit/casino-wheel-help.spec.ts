import { describe, expect, it } from "vitest";
import { LOCALE_IDS, type LocaleId } from "../../src/content/ids";
import { casinoText } from "../../src/i18n/casinoMessages";

// Matches Cosmic Forge localization.json infoTooltipGalacticCasinoWheelOfFortune.
const WHEEL_HELP = {
  en: "The drop down will be enabled only if you win the Special Prize, i.e. the Special Colored segment of the wheel where you will be able to choose a prize from it.",
  es: "El menú desplegable solo se habilitará si ganas el Premio Especial, es decir, el segmento de color especial de la rueda donde podrás elegir un premio de él.",
  pt: "O menu suspenso só será habilitado se você ganhar o Prêmio Especial, ou seja, o segmento colorido especial da roda, onde poderá escolher um prêmio.",
  de: "Das Dropdown-Menü wird nur aktiviert, wenn du den Spezialpreis gewinnst, d.h. das spezielle farbige Segment des Rads, wo du einen Preis daraus wählen kannst.",
  it: "Il menu a discesa sarà abilitato solo se vinci il Premio Speciale, cioè il segmento colorato speciale della ruota dove potrai scegliere un premio.",
  fr: "Le menu déroulant ne sera activé que si tu gagnes le Prix Spécial, c'est-à-dire le segment coloré spécial de la roue où tu pourras choisir un prix parmi.",
} as const satisfies Record<LocaleId, string>;

describe("Galactic Casino Wheel of Fortune help", () => {
  it.each(LOCALE_IDS)("provides special-segment guidance in %s", (locale) => {
    expect(casinoText(locale, "wheelHelp")).toBe(WHEEL_HELP[locale]);
  });
});
