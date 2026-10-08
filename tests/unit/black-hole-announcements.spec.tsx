import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BlackHolePane } from "../../src/app/BlackHolePane";
import {
  blackHoleChargeAnnouncement,
  blackHoleWarpAnnouncement,
} from "../../src/app/blackHoleAnnouncements";
import { LOCALE_IDS } from "../../src/content/ids";
import { createInitialGameState } from "../../src/engine/state";
import { createGameStore } from "../../src/engine/store";
import { blackHoleText } from "../../src/i18n/blackHoleMessages";

describe("Black Hole charge completion announcement", () => {
  it("announces the localized ready state only when charging completes", () => {
    for (const locale of LOCALE_IDS) {
      const ready = blackHoleText(locale).ready;
      expect(blackHoleChargeAnnouncement(false, true, ready)).toBe(ready);
      expect(blackHoleChargeAnnouncement(false, false, ready)).toBe("");
      expect(blackHoleChargeAnnouncement(true, true, ready)).toBe("");
      expect(blackHoleChargeAnnouncement(true, false, ready)).toBe("");
    }
  });

  it("announces only accepted warp activations in every locale", () => {
    for (const locale of LOCALE_IDS) {
      const warping = blackHoleText(locale).warping;
      expect(blackHoleWarpAnnouncement(true, warping)).toBe(warping);
      expect(blackHoleWarpAnnouncement(false, warping)).toBe("");
    }
  });

  it("keeps an empty polite announcement region mounted before charge completes", () => {
    const state = createInitialGameState({ pioneerName: "Black Hole", seed: 2026 });
    const markup = renderToStaticMarkup(
      <BlackHolePane state={state} store={createGameStore(state, { clock: { now: () => 0 } })} />,
    );

    expect(markup).toContain(
      '<output class="sr-only" aria-live="polite" aria-atomic="true" data-testid="black-hole-charge-announcement"></output>',
    );
    expect(markup).toContain(
      '<output class="sr-only" aria-live="polite" aria-atomic="true" data-testid="black-hole-warp-announcement"></output>',
    );
  });
});
