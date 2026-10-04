import { useState } from "react";
import {
  CASINO_CP_BASE_COST,
  CASINO_CP_VALUES,
  type CasinoSpecialPrize,
} from "../content/galacticCasino";
import { ECONOMIC_GOOD_IDS, type EconomicGoodId } from "../content/ids";
import { availableWheelSpecialPrizes, casinoUnlocked } from "../engine/galacticCasino";
import { checkPreconditions } from "../engine/commands";
import type { CasinoCommand } from "../engine/galacticCasino";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import {
  casinoFailureText,
  casinoGameName,
  casinoPrizeText,
  casinoSpecialName,
  casinoText,
} from "../i18n/casinoMessages";
import { economyGoodName } from "./EconomyPanes";

interface Props {
  readonly state: GameState;
  readonly store: GameStore;
}

type PaymentId = EconomicGoodId | "cash";

const VOID_SEER_COSTS = { 1: 7, 2: 10, 3: 15 } as const;
const VOID_SEER_MAX = { 1: 6, 2: 8, 3: 12 } as const;

function quantity(locale: GameState["settings"]["locale"], value: number): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

function cardText(locale: GameState["settings"]["locale"], rank: number, suit: string): string {
  const rankText =
    ({ 11: "J", 12: "Q", 13: "K", 14: "A" } as Record<number, string>)[rank] ?? String(rank);
  const suitText: Record<string, string> = {
    clubs:
      locale === "en"
        ? "clubs"
        : locale === "es"
          ? "tréboles"
          : locale === "pt"
            ? "paus"
            : locale === "de"
              ? "Kreuz"
              : locale === "it"
                ? "fiori"
                : "trèfle",
    diamonds:
      locale === "en"
        ? "diamonds"
        : locale === "es"
          ? "diamantes"
          : locale === "pt"
            ? "ouros"
            : locale === "de"
              ? "Karo"
              : locale === "it"
                ? "quadri"
                : "carreau",
    hearts:
      locale === "en"
        ? "hearts"
        : locale === "es"
          ? "corazones"
          : locale === "pt"
            ? "copas"
            : locale === "de"
              ? "Herz"
              : locale === "it"
                ? "cuori"
                : "cœur",
    spades:
      locale === "en"
        ? "spades"
        : locale === "es"
          ? "picas"
          : locale === "pt"
            ? "espadas"
            : locale === "de"
              ? "Pik"
              : locale === "it"
                ? "picche"
                : "pique",
  };
  return `${rankText} ${suitText[suit] ?? suit}`;
}

function prettyResult(value: string): string {
  return value.replaceAll(":", " · ").replaceAll("_", " ").replaceAll("-", " ");
}

export function GalacticCasinoPane({ state, store }: Props) {
  const locale = state.settings.locale;
  const casino = state.permanent.galacticCasino;
  const [paymentId, setPaymentId] = useState<PaymentId>("cash");
  const [buyAmount, setBuyAmount] = useState("1");
  const [stake, setStake] = useState("1");
  const [specialPrize, setSpecialPrize] = useState<CasinoSpecialPrize>("special_100cp");
  const [voidTier, setVoidTier] = useState<1 | 2 | 3>(1);
  const [feedback, setFeedback] = useState("");
  const availableGoods = ECONOMIC_GOOD_IDS.filter(
    (goodId) =>
      state.run.unlockedResources.includes(
        goodId as (typeof state.run.unlockedResources)[number],
      ) ||
      state.run.economy.unlockedCompounds.includes(
        goodId as (typeof state.run.economy.unlockedCompounds)[number],
      ),
  );
  const availableSpecials = availableWheelSpecialPrizes(state);
  const selectedSpecialPrize = availableSpecials.includes(specialPrize)
    ? specialPrize
    : (availableSpecials[0] ?? specialPrize);
  const amount = Number(buyAmount);
  const purchaseCost =
    Number.isSafeInteger(amount) && amount > 0
      ? Math.ceil((amount * CASINO_CP_BASE_COST) / CASINO_CP_VALUES[paymentId])
      : 0;
  const paymentAvailable =
    paymentId === "cash" ? state.run.cash : state.run.goods[paymentId].quantity;
  const purchaseCommand: CasinoCommand = { type: "casino.points.buy", goodId: paymentId, amount };
  const purchaseCheck = checkPreconditions(state, purchaseCommand);
  const stakeAmount = Number(stake);
  const donCheck = checkPreconditions(state, {
    type: "casino.double-or-nothing.play",
    stake: stakeAmount,
  });
  const spinCheck = checkPreconditions(state, { type: "casino.wheel.spin" });
  const startCheck = checkPreconditions(state, { type: "casino.higher-lower.start" });
  const cashOutCheck = checkPreconditions(state, { type: "casino.higher-lower.cash-out" });
  const voidCheck = checkPreconditions(state, { type: "casino.void-seer.play", tier: voidTier });

  function dispatch(
    command: CasinoCommand,
    successText?: (result: ReturnType<GameStore["dispatch"]>) => string,
  ): void {
    const result = store.dispatch(command);
    if (!result.accepted) {
      setFeedback(casinoFailureText(locale, result.failure?.code ?? ""));
      return;
    }
    setFeedback(successText?.(result) ?? "");
  }

  const higherLower = casino.higherLower;
  const visibleCards = higherLower ? higherLower.deck.slice(0, higherLower.index + 1) : [];
  const wheelDisabled = !spinCheck.ok || casino.wheelSpecialPending;
  const gameName = (gameId: (typeof casino.history)[number]["gameId"]) =>
    casinoGameName(locale, gameId);
  const specialLabel = (prize: CasinoSpecialPrize) =>
    prize.startsWith("special_double_")
      ? casinoText(locale, "doubleGood").replace(
          "{good}",
          economyGoodName(locale, prize.slice("special_double_".length) as EconomicGoodId),
        )
      : casinoSpecialName(locale, prize);
  const prizeLabel = (prizeKey: string) =>
    prizeKey.startsWith("special_double_")
      ? casinoText(locale, "doubleGood").replace(
          "{good}",
          economyGoodName(locale, prizeKey.slice("special_double_".length) as EconomicGoodId),
        )
      : casinoPrizeText(locale, prizeKey);
  const gameCounter = (key: "doubleOrNothing" | "wheel" | "higherLower" | "voidSeer") => {
    const played = `${key}Played` as keyof typeof casino.lifetimeStats;
    const won = `${key}Won` as keyof typeof casino.lifetimeStats;
    return `${quantity(locale, casino.lifetimeStats[played])} ${casinoText(locale, "plays").toLocaleLowerCase(locale)} · ${quantity(locale, casino.lifetimeStats[won])} ${casinoText(locale, "wins").toLocaleLowerCase(locale)}`;
  };

  return (
    <section
      className="galactic-casino-pane"
      aria-labelledby="galactic-casino-title"
      data-testid="galactic-casino-pane"
    >
      <div className="pane-heading">
        <div>
          <h2 id="galactic-casino-title">{casinoText(locale, "title")}</h2>
          <p>{casinoText(locale, "description")}</p>
        </div>
        <div className="casino-wallet">
          <span>{casinoText(locale, "balance")}</span>
          <strong data-testid="casino-balance">{quantity(locale, casino.casinoPoints)} CP</strong>
        </div>
      </div>
      {!casinoUnlocked(state) ? <p>{casinoText(locale, "locked")}</p> : null}

      <div className="action-grid casino-grid">
        <article className="upgrade-card">
          <div className="card-copy">
            <h3>{casinoText(locale, "buyTitle")}</h3>
            <label>
              {casinoText(locale, "payment")}
              <select
                aria-label={casinoText(locale, "payment")}
                value={paymentId}
                onChange={(event) => setPaymentId(event.currentTarget.value as PaymentId)}
              >
                <option value="cash">{casinoText(locale, "cash")}</option>
                {availableGoods.map((goodId) => (
                  <option key={goodId} value={goodId}>
                    {economyGoodName(locale, goodId)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {casinoText(locale, "amount")}
              <input
                aria-label={casinoText(locale, "amount")}
                type="number"
                min="1"
                step="1"
                value={buyAmount}
                onChange={(event) => setBuyAmount(event.currentTarget.value)}
              />
            </label>
            <p>
              {casinoText(locale, "cost")}: {quantity(locale, purchaseCost)}{" "}
              {paymentId === "cash"
                ? casinoText(locale, "cash")
                : economyGoodName(locale, paymentId)}{" "}
              · {quantity(locale, paymentAvailable)} {casinoText(locale, "available")}
            </p>
            <button
              type="button"
              className="secondary-button"
              data-testid="casino-buy-cp"
              disabled={!purchaseCheck.ok}
              onClick={() =>
                dispatch(purchaseCommand, () =>
                  casinoText(locale, "purchaseResult")
                    .replace("{amount}", quantity(locale, amount))
                    .replace("{cost}", quantity(locale, purchaseCost)),
                )
              }
            >
              {casinoText(locale, "buy")}
            </button>
          </div>
        </article>

        <article className="upgrade-card">
          <div className="card-copy">
            <h3>{casinoText(locale, "doubleOrNothing")}</h3>
            <p>
              {casinoText(locale, "probability")}: {Math.round(casino.baseWinProbability * 100)}%
            </p>
            <label>
              {casinoText(locale, "stake")}
              <input
                aria-label={casinoText(locale, "stake")}
                type="number"
                min="1"
                step="1"
                value={stake}
                onChange={(event) => setStake(event.currentTarget.value)}
              />
            </label>
            <p>
              {casinoText(locale, "runStats")}:{" "}
              {quantity(locale, state.run.casinoStats.doubleOrNothingPlayed)}{" "}
              {casinoText(locale, "plays").toLocaleLowerCase(locale)} ·{" "}
              {quantity(locale, state.run.casinoStats.doubleOrNothingWon)}{" "}
              {casinoText(locale, "wins").toLocaleLowerCase(locale)}
            </p>
            <p>
              {casinoText(locale, "allTimeStats")}: {gameCounter("doubleOrNothing")}
            </p>
            <button
              type="button"
              className="secondary-button"
              data-testid="casino-don-play"
              disabled={!donCheck.ok}
              onClick={() =>
                dispatch(
                  { type: "casino.double-or-nothing.play", stake: stakeAmount },
                  (result) => {
                    const event = result.events.find(
                      (entry) => entry.type === "casino.game.played",
                    );
                    return event?.type === "casino.game.played"
                      ? `${event.result === "win" ? casinoText(locale, "win") : casinoText(locale, "loss")}: ${quantity(locale, event.cpAwarded)} CP`
                      : "";
                  },
                )
              }
            >
              {casinoText(locale, "play")}
            </button>
          </div>
        </article>

        <article className="upgrade-card">
          <div className="card-copy">
            <h3>{casinoText(locale, "wheel")}</h3>
            <p>
              {casinoText(locale, "runStats")}:{" "}
              {quantity(locale, state.run.casinoStats.wheelPlayed)}{" "}
              {casinoText(locale, "plays").toLocaleLowerCase(locale)} ·{" "}
              {quantity(locale, state.run.casinoStats.wheelWon)}{" "}
              {casinoText(locale, "wins").toLocaleLowerCase(locale)}
            </p>
            {casino.wheelSpecialPending ? (
              <>
                <output>{casinoText(locale, "specialReady")}</output>
                <label>
                  {casinoText(locale, "choosePrize")}
                  <select
                    aria-label={casinoText(locale, "choosePrize")}
                    value={selectedSpecialPrize}
                    onChange={(event) =>
                      setSpecialPrize(event.currentTarget.value as CasinoSpecialPrize)
                    }
                  >
                    {availableSpecials.map((prize) => (
                      <option key={prize} value={prize}>
                        {specialLabel(prize)}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="secondary-button"
                  data-testid="casino-wheel-claim"
                  disabled={!availableSpecials.length}
                  onClick={() =>
                    dispatch(
                      { type: "casino.wheel.claim", prize: selectedSpecialPrize },
                      (result) => {
                        const event = result.events.find(
                          (entry) => entry.type === "casino.wheel.special-claimed",
                        );
                        return event?.type === "casino.wheel.special-claimed"
                          ? casinoText(locale, "prizeClaimed").replace(
                              "{prize}",
                              specialLabel(event.prize),
                            )
                          : "";
                      },
                    )
                  }
                >
                  {casinoText(locale, "claim")}
                </button>
              </>
            ) : null}
            <button
              type="button"
              className="secondary-button"
              data-testid="casino-wheel-spin"
              disabled={wheelDisabled}
              onClick={() =>
                dispatch({ type: "casino.wheel.spin" }, (result) => {
                  const event = result.events.find((entry) => entry.type === "casino.game.played");
                  if (event?.type !== "casino.game.played") return "";
                  return event.result === "special-ready"
                    ? casinoText(locale, "specialReady")
                    : `${event.result === "loss" ? casinoText(locale, "loss") : prettyResult(event.result)}`;
                })
              }
            >
              {casinoText(locale, "spin")}
            </button>
          </div>
        </article>

        <article className="upgrade-card">
          <div className="card-copy">
            <h3>{casinoText(locale, "higherLower")}</h3>
            <p>
              {casinoText(locale, "runStats")}:{" "}
              {quantity(locale, state.run.casinoStats.higherLowerPlayed)}{" "}
              {casinoText(locale, "plays").toLocaleLowerCase(locale)} ·{" "}
              {quantity(locale, state.run.casinoStats.higherLowerWon)}{" "}
              {casinoText(locale, "wins").toLocaleLowerCase(locale)}
            </p>
            {higherLower ? (
              <>
                <p>
                  {casinoText(locale, "currentCard")}:{" "}
                  {cardText(
                    locale,
                    higherLower.deck[higherLower.index]!.rank,
                    higherLower.deck[higherLower.index]!.suit,
                  )}
                </p>
                <div className="casino-card-row" aria-label={casinoText(locale, "currentCard")}>
                  {visibleCards.map((card, index) => (
                    <span
                      className="casino-card"
                      key={`${card.rank}-${card.suit}`}
                      aria-label={cardText(locale, card.rank, card.suit)}
                    >
                      {cardText(locale, card.rank, card.suit)}
                      {index === visibleCards.length - 1 ? " ←" : ""}
                    </span>
                  ))}
                  {Array.from({ length: 8 - higherLower.index }, (_, index) => (
                    <span
                      className="casino-card casino-card-hidden"
                      key={`hidden-${index}`}
                      aria-hidden="true"
                    >
                      ◆
                    </span>
                  ))}
                </div>
                <p>
                  {casinoText(locale, "currentPrize")}:{" "}
                  {higherLower.prizeKey ? prizeLabel(higherLower.prizeKey) : "—"}
                </p>
                <div className="casino-button-row">
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={
                      !checkPreconditions(state, {
                        type: "casino.higher-lower.guess",
                        direction: "higher",
                      }).ok
                    }
                    onClick={() =>
                      dispatch(
                        { type: "casino.higher-lower.guess", direction: "higher" },
                        (result) => {
                          const event = result.events.find(
                            (entry) => entry.type === "casino.higher-lower.revealed",
                          );
                          return event?.type === "casino.higher-lower.revealed"
                            ? event.correct
                              ? casinoText(locale, "cardCorrect")
                              : casinoText(locale, "cardWrong")
                            : "";
                        },
                      )
                    }
                  >
                    {casinoText(locale, "higher")}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={
                      !checkPreconditions(state, {
                        type: "casino.higher-lower.guess",
                        direction: "lower",
                      }).ok
                    }
                    onClick={() =>
                      dispatch(
                        { type: "casino.higher-lower.guess", direction: "lower" },
                        (result) => {
                          const event = result.events.find(
                            (entry) => entry.type === "casino.higher-lower.revealed",
                          );
                          return event?.type === "casino.higher-lower.revealed"
                            ? event.correct
                              ? casinoText(locale, "cardCorrect")
                              : casinoText(locale, "cardWrong")
                            : "";
                        },
                      )
                    }
                  >
                    {casinoText(locale, "lower")}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={!cashOutCheck.ok}
                    onClick={() =>
                      dispatch({ type: "casino.higher-lower.cash-out" }, (result) => {
                        const event = result.events.find(
                          (entry) => entry.type === "casino.game.played",
                        );
                        return event?.type === "casino.game.played"
                          ? casinoText(locale, "cashOutResult").replace(
                              "{prize}",
                              prettyResult(event.result.split(":").slice(1).join(":")),
                            )
                          : "";
                      })
                    }
                  >
                    {casinoText(locale, "cashOut")}
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="secondary-button"
                data-testid="casino-hilo-start"
                disabled={!startCheck.ok}
                onClick={() => dispatch({ type: "casino.higher-lower.start" })}
              >
                {casinoText(locale, "start")}
              </button>
            )}
          </div>
        </article>

        <article className="upgrade-card">
          <div className="card-copy">
            <h3>{casinoText(locale, "voidSeer")}</h3>
            <p>
              {casinoText(locale, "runStats")}:{" "}
              {quantity(locale, state.run.casinoStats.voidSeerPlayed)}{" "}
              {casinoText(locale, "plays").toLocaleLowerCase(locale)} ·{" "}
              {quantity(locale, state.run.casinoStats.voidSeerWon)}{" "}
              {casinoText(locale, "wins").toLocaleLowerCase(locale)}
            </p>
            <label>
              {casinoText(locale, "tier")}
              <select
                aria-label={casinoText(locale, "tier")}
                value={voidTier}
                onChange={(event) => setVoidTier(Number(event.currentTarget.value) as 1 | 2 | 3)}
              >
                <option value={1}>1 · 7 CP · 1/7</option>
                <option value={2}>2 · 10 CP · 1/9</option>
                <option value={3}>3 · 15 CP · 1/13</option>
              </select>
            </label>
            <p>
              {casinoText(locale, "chance")}: 1/{VOID_SEER_MAX[voidTier] + 1}
            </p>
            <button
              type="button"
              className="secondary-button"
              data-testid="casino-void-seer-play"
              disabled={!voidCheck.ok}
              onClick={() =>
                dispatch({ type: "casino.void-seer.play", tier: voidTier }, (result) => {
                  const event = result.events.find(
                    (entry) => entry.type === "casino.void-seer.result",
                  );
                  if (event?.type !== "casino.void-seer.result") return "";
                  return event.won
                    ? casinoText(locale, "voidWin").replace("{detail}", prettyResult(event.detail))
                    : casinoText(locale, "voidLoss");
                })
              }
            >
              {casinoText(locale, "reveal")} · {quantity(locale, VOID_SEER_COSTS[voidTier])} CP
            </button>
          </div>
        </article>
      </div>

      <output className="live-feedback" aria-live="polite">
        {feedback}
      </output>
      <section className="casino-history" aria-labelledby="casino-history-heading">
        <div className="pane-heading">
          <h3 id="casino-history-heading">{casinoText(locale, "history")}</h3>
        </div>
        {casino.history.length === 0 ? (
          <p>{casinoText(locale, "noHistory")}</p>
        ) : (
          <ol>
            {[...casino.history].reverse().map((entry) => (
              <li key={entry.id}>
                <span>{gameName(entry.gameId)}</span>
                <span>{prettyResult(entry.result)}</span>
                <span>
                  {quantity(locale, entry.cpSpent)} {casinoText(locale, "cpIn")}
                </span>
                <span>
                  {quantity(locale, entry.cpAwarded)} {casinoText(locale, "cpOut")}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}
