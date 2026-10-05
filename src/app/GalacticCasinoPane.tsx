import { useLayoutEffect, useRef, useState } from "react";
import { type CasinoSpecialPrize } from "../content/galacticCasino";
import { ECONOMIC_GOOD_IDS, type EconomicGoodId } from "../content/ids";
import { availableWheelSpecialPrizes, casinoUnlocked } from "../engine/galacticCasino";
import {
  selectCasinoEntryCost,
  selectCasinoPointPurchase,
  selectEconomyAction,
} from "../engine/selectors";
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
import { economyGoodName } from "./economyDisplay";
import { formatNumber } from "./numberFormatting";

interface Props {
  readonly state: GameState;
  readonly store: GameStore;
}

type PaymentId = EconomicGoodId | "cash";

const VOID_SEER_MAX = { 1: 6, 2: 8, 3: 12 } as const;

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
  const quantity = (numberLocale: GameState["settings"]["locale"], value: number): string =>
    formatNumber(numberLocale, value, 0, state.settings.notation);
  const casino = state.permanent.galacticCasino;
  const [paymentId, setPaymentId] = useState<PaymentId>("cash");
  const [buyAmount, setBuyAmount] = useState("1");
  const [stake, setStake] = useState("1");
  const [specialPrize, setSpecialPrize] = useState<CasinoSpecialPrize>("special_100cp");
  const [voidTier, setVoidTier] = useState<1 | 2 | 3>(1);
  const [feedback, setFeedback] = useState("");
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const pendingHigherLowerFocus = useRef(false);
  const higherGuessButton = useRef<HTMLButtonElement>(null);
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
  const purchasePlan = selectCasinoPointPurchase(state, paymentId, amount);
  const purchaseCost = purchasePlan.cost;
  const paymentAvailable = purchasePlan.available;
  const purchaseCommand: CasinoCommand = { type: "casino.points.buy", goodId: paymentId, amount };
  const purchaseCheck = purchasePlan;
  const stakeAmount = Number(stake);
  const donCommand: CasinoCommand = {
    type: "casino.double-or-nothing.play",
    stake: stakeAmount,
  };
  const donCheck = selectEconomyAction(state, donCommand);
  const spinCheck = selectEconomyAction(state, { type: "casino.wheel.spin" });
  const claimCheck = selectEconomyAction(state, {
    type: "casino.wheel.claim",
    prize: selectedSpecialPrize,
  });
  const startCheck = selectEconomyAction(state, { type: "casino.higher-lower.start" });
  const cashOutCheck = selectEconomyAction(state, { type: "casino.higher-lower.cash-out" });
  const guessHigherCheck = selectEconomyAction(state, {
    type: "casino.higher-lower.guess",
    direction: "higher",
  });
  const guessLowerCheck = selectEconomyAction(state, {
    type: "casino.higher-lower.guess",
    direction: "lower",
  });
  const voidCommand: CasinoCommand = { type: "casino.void-seer.play", tier: voidTier };
  const voidCheck = selectEconomyAction(state, voidCommand);
  const actionReason = (
    check: { readonly enabled: boolean; readonly failure?: { readonly code: string } },
    required?: number,
    payment?: string,
    available?: number,
  ) =>
    check.enabled
      ? ""
      : casinoFailureText(locale, check.failure?.code ?? "", {
          ...(required === undefined ? {} : { required: quantity(locale, required) }),
          ...(available === undefined ? {} : { available: quantity(locale, available) }),
          ...(payment === undefined ? {} : { payment }),
        });
  const purchaseReason = purchaseCheck.enabled
    ? ""
    : casinoFailureText(locale, purchaseCheck.failure?.code ?? "", {
        required: quantity(locale, purchaseCost),
        available: quantity(locale, paymentAvailable),
        payment:
          paymentId === "cash" ? casinoText(locale, "cash") : economyGoodName(locale, paymentId),
      });
  const donReason = actionReason(
    donCheck,
    selectCasinoEntryCost(donCommand) ?? undefined,
    undefined,
    casino.casinoPoints,
  );
  const spinReason = actionReason(spinCheck, 1, undefined, casino.casinoPoints);
  const claimReason = actionReason(claimCheck);
  const startReason = actionReason(startCheck, 5, undefined, casino.casinoPoints);
  const cashOutReason = actionReason(cashOutCheck);
  const voidCost = selectCasinoEntryCost(voidCommand) ?? 0;
  const voidReason = actionReason(voidCheck, voidCost, undefined, casino.casinoPoints);

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

  function spinWheel(): void {
    if (!spinCheck.enabled || wheelSpinning) return;
    const result = store.dispatch({ type: "casino.wheel.spin" });
    if (!result.accepted) {
      setFeedback(casinoFailureText(locale, result.failure?.code ?? ""));
      return;
    }
    const event = result.events.find((entry) => entry.type === "casino.game.played");
    if (event?.type !== "casino.game.played") return;

    const stopIndex = event.result === "special-ready" ? 0 : event.result === "loss" ? 1 : 2;
    const sectorAngle = 360 / 16;
    const sectorCenter = stopIndex * sectorAngle + sectorAngle / 2;
    const currentNormalized = ((wheelRotation % 360) + 360) % 360;
    const desiredNormalized = ((-sectorCenter % 360) + 360) % 360;
    const delta = (desiredNormalized - currentNormalized + 360) % 360;
    setWheelSpinning(true);
    setWheelRotation(wheelRotation + 6 * 360 + delta);
    setFeedback(
      event.result === "special-ready"
        ? casinoText(locale, "specialReady")
        : event.result === "loss"
          ? casinoText(locale, "loss")
          : prettyResult(event.result),
    );
  }

  const higherLower = casino.higherLower;
  const visibleCards = higherLower ? higherLower.deck.slice(0, higherLower.index + 1) : [];
  useLayoutEffect(() => {
    if (!higherLower || !pendingHigherLowerFocus.current) return;
    pendingHigherLowerFocus.current = false;
    higherGuessButton.current?.focus();
  }, [higherLower]);
  const wheelDisabled = !spinCheck.enabled || casino.wheelSpecialPending;
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
            {!purchaseCheck.enabled && (
              <p className="live-feedback" id="casino-buy-reason">
                {purchaseReason}
              </p>
            )}
            <button
              type="button"
              className="secondary-button"
              data-testid="casino-buy-cp"
              disabled={!purchaseCheck.enabled}
              aria-describedby={!purchaseCheck.enabled ? "casino-buy-reason" : undefined}
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
            {!donCheck.enabled && (
              <p className="live-feedback" id="casino-don-reason">
                {donReason}
              </p>
            )}
            <button
              type="button"
              className="secondary-button"
              data-testid="casino-don-play"
              disabled={!donCheck.enabled}
              aria-describedby={!donCheck.enabled ? "casino-don-reason" : undefined}
              onClick={() =>
                dispatch(donCommand, (result) => {
                  const event = result.events.find((entry) => entry.type === "casino.game.played");
                  return event?.type === "casino.game.played"
                    ? `${event.result === "win" ? casinoText(locale, "win") : casinoText(locale, "loss")}: ${quantity(locale, event.cpAwarded)} CP`
                    : "";
                })
              }
            >
              {casinoText(locale, "play")}
            </button>
          </div>
        </article>

        <article className="upgrade-card">
          <div className="card-copy">
            <h3>{casinoText(locale, "wheel")}</h3>
            <div className="casino-wheel-stage">
              <div
                className="casino-wheel"
                data-special-ready={casino.wheelSpecialPending}
                aria-hidden="true"
              >
                <div
                  className="casino-wheel-face"
                  style={{ transform: `rotate(${wheelRotation}deg)` }}
                  onTransitionEnd={(event) => {
                    if (event.propertyName === "transform") setWheelSpinning(false);
                  }}
                />
                <span className="casino-wheel-pointer" />
                <span className="casino-wheel-hub" />
              </div>
            </div>
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
                  disabled={!claimCheck.enabled}
                  aria-describedby={!claimCheck.enabled ? "casino-wheel-claim-reason" : undefined}
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
                {!claimCheck.enabled && (
                  <p className="live-feedback" id="casino-wheel-claim-reason">
                    {claimReason}
                  </p>
                )}
              </>
            ) : null}
            <button
              type="button"
              className="secondary-button"
              data-testid="casino-wheel-spin"
              disabled={wheelDisabled || wheelSpinning}
              aria-describedby={
                wheelDisabled || wheelSpinning ? "casino-wheel-spin-reason" : undefined
              }
              onClick={spinWheel}
            >
              {casinoText(locale, "spin")}
            </button>
            {(wheelDisabled || wheelSpinning) && (
              <p className="live-feedback" id="casino-wheel-spin-reason">
                {wheelSpinning ? casinoText(locale, "reasonWheelSpinning") : spinReason}
              </p>
            )}
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
                    ref={higherGuessButton}
                    type="button"
                    className="secondary-button"
                    disabled={!guessHigherCheck.enabled}
                    aria-describedby={
                      !guessHigherCheck.enabled ? "casino-hilo-guess-reason" : undefined
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
                    disabled={!guessLowerCheck.enabled}
                    aria-describedby={
                      !guessLowerCheck.enabled ? "casino-hilo-guess-reason" : undefined
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
                    disabled={!cashOutCheck.enabled}
                    aria-describedby={
                      !cashOutCheck.enabled ? "casino-hilo-cashout-reason" : undefined
                    }
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
                {!guessHigherCheck.enabled && (
                  <p className="live-feedback" id="casino-hilo-guess-reason">
                    {actionReason(guessHigherCheck)}
                  </p>
                )}
                {!cashOutCheck.enabled && (
                  <p className="live-feedback" id="casino-hilo-cashout-reason">
                    {cashOutReason}
                  </p>
                )}
              </>
            ) : (
              <>
                {!startCheck.enabled && (
                  <p className="live-feedback" id="casino-hilo-start-reason">
                    {startReason}
                  </p>
                )}
                <button
                  type="button"
                  className="secondary-button"
                  data-testid="casino-hilo-start"
                  disabled={!startCheck.enabled}
                  aria-describedby={!startCheck.enabled ? "casino-hilo-start-reason" : undefined}
                  onClick={(event) => {
                    pendingHigherLowerFocus.current =
                      document.activeElement === event.currentTarget;
                    dispatch({ type: "casino.higher-lower.start" });
                  }}
                >
                  {casinoText(locale, "start")}
                </button>
              </>
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
                {([1, 2, 3] as const).map((tier) => (
                  <option key={tier} value={tier}>
                    {quantity(locale, tier)} ·{" "}
                    {quantity(
                      locale,
                      selectCasinoEntryCost({ type: "casino.void-seer.play", tier }) ?? 0,
                    )}{" "}
                    CP · 1/{quantity(locale, VOID_SEER_MAX[tier] + 1)}
                  </option>
                ))}
              </select>
            </label>
            <p>
              {casinoText(locale, "chance")}: 1/{VOID_SEER_MAX[voidTier] + 1}
            </p>
            {!voidCheck.enabled && (
              <p className="live-feedback" id="casino-void-seer-reason">
                {voidReason}
              </p>
            )}
            <button
              type="button"
              className="secondary-button"
              data-testid="casino-void-seer-play"
              disabled={!voidCheck.enabled}
              aria-describedby={!voidCheck.enabled ? "casino-void-seer-reason" : undefined}
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
              {casinoText(locale, "reveal")} · {quantity(locale, voidCost)} CP
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
