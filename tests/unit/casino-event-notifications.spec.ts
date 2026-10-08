import { describe, expect, it, vi } from "vitest";
import { LOCALE_IDS } from "../../src/content/ids";
import type { EngineEvent } from "../../src/engine/commands";
import { createInitialGameState } from "../../src/engine/state";
import {
  casinoEventNotice,
  createCasinoEventNoticeHandler,
} from "../../src/app/casinoEventNotifications";
import { casinoText } from "../../src/i18n/casinoMessages";

const donWin: EngineEvent = {
  type: "casino.game.played",
  gameId: "doubleOrNothing",
  result: "win",
  cpSpent: 7,
  cpAwarded: 14,
};

const donLoss: EngineEvent = {
  type: "casino.game.played",
  gameId: "doubleOrNothing",
  result: "loss",
  cpSpent: 7,
  cpAwarded: 0,
};

describe("Casino event notifications", () => {
  it("uses the source-localized Double-or-Nothing win/loss copy and severity", () => {
    for (const locale of LOCALE_IDS) {
      const win = casinoEventNotice(locale, donWin);
      const loss = casinoEventNotice(locale, donLoss);

      expect(win).toEqual({
        message: casinoText(locale, "doubleOrNothingWinNotification"),
        classification: "galacticCasino",
        type: "info",
        durationMs: 2500,
      });
      expect(loss).toEqual({
        message: casinoText(locale, "doubleOrNothingLossNotification"),
        classification: "galacticCasino",
        type: "error",
        durationMs: 2500,
      });
    }
  });

  it("ignores Wheel, Higher-or-Lower, and unrelated Casino events", () => {
    const ignored: readonly EngineEvent[] = [
      {
        type: "casino.game.played",
        gameId: "wheel",
        result: "win",
        cpSpent: 1,
        cpAwarded: 2,
      },
      { type: "casino.wheel.special-ready" },
      {
        type: "casino.higher-lower.revealed",
        index: 1,
        card: { suit: "clubs", rank: 2 },
        correct: true,
      },
      {
        type: "casino.game.played",
        gameId: "higherLower",
        result: "cashout:hilo_cp_10",
        cpSpent: 5,
        cpAwarded: 10,
      },
      {
        type: "casino.void-seer.result",
        tier: 1,
        first: 2,
        second: 3,
        won: false,
        detail: "2 and 3",
      },
    ];

    expect(ignored.map((event) => casinoEventNotice("en", event))).toEqual([
      null,
      null,
      null,
      null,
      null,
    ]);
  });

  it("routes each Double-or-Nothing result once and suppresses it when notifications are disabled", () => {
    const state = createInitialGameState();
    const notify = vi.fn();
    const handler = createCasinoEventNoticeHandler(
      () => "en",
      () => state,
      notify,
    );

    handler([donWin]);
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith(casinoEventNotice("en", donWin));

    const disabledState = {
      ...state,
      settings: { ...state.settings, notificationsEnabled: false },
    };
    const disabledNotify = vi.fn();
    const disabledHandler = createCasinoEventNoticeHandler(
      () => "en",
      () => disabledState,
      disabledNotify,
    );

    disabledHandler([donWin, donLoss]);
    expect(disabledNotify).not.toHaveBeenCalled();
  });
});
