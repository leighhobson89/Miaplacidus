import { describe, expect, it } from "vitest";
import { galacticPaneItems } from "../../src/app/presentationNavigation";
import { LOCALE_IDS, type LocaleId } from "../../src/content/ids";
import { createInitialGameState } from "../../src/engine/state";
import { casinoText } from "../../src/i18n/casinoMessages";

// Audited against Cosmic Forge localization.json headerMainGalacticCasino
// (en:1602, es:4225, pt:6848, de:9471, it:12094, fr:14717).
const SOURCE_CASINO_TITLES = {
  en: "Galactic Casino",
  es: "Casino Galáctico",
  pt: "Casino Galáctico",
  de: "Galaktisches Casino",
  it: "Casinò Galattico",
  fr: "Casino Galactique",
} as const satisfies Record<LocaleId, string>;

describe("Galactic Casino title parity", () => {
  it.each(LOCALE_IDS)("%s title and child label match Cosmic Forge", (locale) => {
    const sourceTitle = SOURCE_CASINO_TITLES[locale];
    const initial = createInitialGameState({ locale });
    const state = {
      ...initial,
      run: {
        ...initial.run,
        space: { ...initial.run.space, ascendencyAwardedThisRun: true },
      },
    };
    const casinoOption = galacticPaneItems(locale, state).find(
      (item) => item.id === "galactic-casino",
    );

    expect(casinoText(locale, "title")).toBe(sourceTitle);
    expect(casinoOption?.label).toBe(sourceTitle);
  });
});
