import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { type CasinoCardSuit, type CasinoSpecialPrize } from "../content/galacticCasino";
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
  casinoCountNoun,
  casinoHeaderDescription,
  casinoFailureText,
  casinoGameName,
  casinoHistoryText,
  casinoPrizeText,
  casinoSectionHelpLabel,
  casinoSectionHelpText,
  casinoSpecialName,
  casinoText,
  casinoVoidSeerCurrency,
  casinoVoidSeerPrizeName,
} from "../i18n/casinoMessages";
import { InfoTooltip } from "./InfoTooltip";
import { economyGoodName } from "./economyDisplay";
import { formatNumber } from "./numberFormatting";
import { useGameNotifications } from "./NotificationStack";
import { casinoWheelAttemptFailureNotice, starNameFromIdentity } from "./casinoEventNotifications";
import { CelestialIllustration } from "./CelestialIllustration";
import { PageArtworkRow } from "./PageArtworkRow";

interface Props {
  readonly state: GameState;
  readonly store: GameStore;
}

type PaymentId = EconomicGoodId | "cash";

const VOID_SEER_MAX = { 1: 6, 2: 8, 3: 12 } as const;

const CARD_SUIT_SYMBOLS: Readonly<Record<CasinoCardSuit, string>> = {
  clubs: "♣",
  diamonds: "♦",
  hearts: "♥",
  spades: "♠",
};

const CARD_SUIT_COPY_KEYS: Readonly<
  Record<CasinoCardSuit, "cardSuitClubs" | "cardSuitDiamonds" | "cardSuitHearts" | "cardSuitSpades">
> = {
  clubs: "cardSuitClubs",
  diamonds: "cardSuitDiamonds",
  hearts: "cardSuitHearts",
  spades: "cardSuitSpades",
};

const CARD_RANK_SYMBOLS: Readonly<Record<number, string>> = {
  11: "J",
  12: "Q",
  13: "K",
  14: "A",
};

const CARD_RANK_COPY_KEYS: Readonly<
  Record<number, "cardJack" | "cardQueen" | "cardKing" | "cardAce">
> = {
  11: "cardJack",
  12: "cardQueen",
  13: "cardKing",
  14: "cardAce",
};

function cardRankSymbol(rank: number): string {
  return CARD_RANK_SYMBOLS[rank] ?? String(rank);
}

function cardAccessibleName(
  locale: GameState["settings"]["locale"],
  rank: number,
  suit: CasinoCardSuit,
): string {
  const rankKey = CARD_RANK_COPY_KEYS[rank];
  const rankName = rankKey ? casinoText(locale, rankKey) : String(rank);
  const suitName = casinoText(locale, CARD_SUIT_COPY_KEYS[suit]);
  return casinoText(locale, "cardAccessibleName")
    .replace("{rank}", rankName)
    .replace("{suit}", suitName);
}

export function GalacticCasinoPane({ state, store }: Props) {
  const notify = useGameNotifications();
  const locale = state.settings.locale;
  const formatQuantity = (value: number, maximumFractionDigits = 0): string =>
    formatNumber(locale, value, maximumFractionDigits, state.settings.notation);
  const quantity = (numberLocale: GameState["settings"]["locale"], value: number): string =>
    formatNumber(numberLocale, value, 0, state.settings.notation);
  const casino = state.permanent.galacticCasino;
  const [paymentId, setPaymentId] = useState<PaymentId>("cash");
  const [buyAmount, setBuyAmount] = useState("1");
  const [stake, setStake] = useState("1");
  const [specialPrize, setSpecialPrize] = useState<CasinoSpecialPrize | null>(null);
  const [voidTier, setVoidTier] = useState<1 | 2 | 3>(1);
  const [feedback, setFeedback] = useState("");
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [helpTooltipLayout, setHelpTooltipLayout] = useState({
    narrow: window.innerWidth <= 860,
    rightOffset: 0,
  });
  const helpTooltipRef = useRef<HTMLSpanElement>(null);
  const helpTooltipOffset = useRef(0);
  const pendingHigherLowerFocus = useRef(false);
  const higherGuessButton = useRef<HTMLButtonElement>(null);
  const fitHelpTooltip = () => {
    window.requestAnimationFrame(() => {
      const tooltip = helpTooltipRef.current;
      if (!tooltip) return;
      const rect = tooltip.getBoundingClientRect();
      const narrow = window.innerWidth <= 860;
      const safeInset = 12;
      const baseRight = narrow
        ? (tooltip.parentElement?.getBoundingClientRect().right ?? rect.right)
        : rect.right;
      const baseLeft = baseRight - rect.width;
      const rightOffset = narrow
        ? Math.max(0, safeInset - baseLeft) -
          Math.max(0, baseRight - (window.innerWidth - safeInset))
        : 0;
      helpTooltipOffset.current = rightOffset;
      setHelpTooltipLayout((previous) =>
        previous.narrow === narrow && previous.rightOffset === rightOffset
          ? previous
          : { narrow, rightOffset },
      );
    });
  };

  useLayoutEffect(() => {
    const resize = () => fitHelpTooltip();
    window.addEventListener("resize", resize);
    fitHelpTooltip();
    return () => window.removeEventListener("resize", resize);
  }, [locale]);
  const availableGoods = ECONOMIC_GOOD_IDS.filter(
    (goodId) =>
      state.run.unlockedResources.includes(
        goodId as (typeof state.run.unlockedResources)[number],
      ) ||
      state.run.economy.unlockedCompounds.includes(
        goodId as (typeof state.run.economy.unlockedCompounds)[number],
      ),
  );
  const paymentSelectionAvailable =
    paymentId === "cash" || availableGoods.includes(paymentId);
  const activePaymentId = paymentSelectionAvailable ? paymentId : "cash";
  useEffect(() => {
    if (!paymentSelectionAvailable) setPaymentId("cash");
  }, [paymentSelectionAvailable]);
  const availableSpecials = availableWheelSpecialPrizes(state);
  const specialPrizeSelectionAvailable =
    specialPrize !== null && availableSpecials.includes(specialPrize);
  const selectedSpecialPrize = specialPrizeSelectionAvailable ? specialPrize : null;
  useEffect(() => {
    if (specialPrize !== null && !specialPrizeSelectionAvailable) setSpecialPrize(null);
  }, [specialPrize, specialPrizeSelectionAvailable]);
  const claimPrize = selectedSpecialPrize ?? availableSpecials[0] ?? "special_100cp";
  const amount = Number(buyAmount);
  const purchasePlan = selectCasinoPointPurchase(state, activePaymentId, amount);
  const purchaseCost = purchasePlan.cost;
  const paymentAvailable = purchasePlan.available;
  const purchaseCommand: CasinoCommand = {
    type: "casino.points.buy",
    goodId: activePaymentId,
    amount,
  };
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
    prize: claimPrize,
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
  const donEntryCost = selectCasinoEntryCost(donCommand) ?? 0;
  const wheelEntryCost = selectCasinoEntryCost({ type: "casino.wheel.spin" }) ?? 0;
  const higherLowerEntryCost = selectCasinoEntryCost({ type: "casino.higher-lower.start" }) ?? 0;
  const casinoAmountPreview = (
    key: "entryCostPreview" | "currentStakePreview" | "doubledWinPreview",
    value: number,
  ) =>
    casinoText(locale, key)
      .replace("{amount}", quantity(locale, value))
      .replace(" CP", ` ${casinoText(locale, "wheelCurrencyCp")}`);
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
          activePaymentId === "cash"
            ? casinoText(locale, "cash")
            : economyGoodName(locale, activePaymentId),
      });
  const donReason = actionReason(donCheck, donEntryCost, undefined, casino.casinoPoints);
  const spinReason = actionReason(spinCheck, 1, undefined, casino.casinoPoints);
  const claimReason = actionReason(claimCheck);
  const startReason = actionReason(startCheck, 5, undefined, casino.casinoPoints);
  const cashOutReason = actionReason(cashOutCheck);
  const voidCost = selectCasinoEntryCost(voidCommand) ?? 0;
  const voidReason = actionReason(voidCheck, voidCost, undefined, casino.casinoPoints);

  function dispatch(
    command: CasinoCommand,
    successText?: (result: ReturnType<GameStore["dispatch"]>) => string,
  ): boolean {
    const result = store.dispatch(command);
    if (!result.accepted) {
      setFeedback(casinoFailureText(locale, result.failure?.code ?? ""));
      return false;
    }
    setFeedback(successText?.(result) ?? "");
    return true;
  }

  function spinWheel(): void {
    if (wheelSpinning) return;
    const result = store.dispatch({ type: "casino.wheel.spin" });
    if (!result.accepted) {
      setFeedback(casinoFailureText(locale, result.failure?.code ?? ""));
      const notice = casinoWheelAttemptFailureNotice(locale, result.failure?.code ?? "");
      if (notice) {
        notify(notice.message, {
          classification: notice.classification,
          type: notice.type,
          durationMs: notice.durationMs,
        });
      }
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
    setFeedback("");
  }

  const higherLower = casino.higherLower;
  const visibleCards = higherLower ? higherLower.deck.slice(0, higherLower.index + 1) : [];
  useLayoutEffect(() => {
    if (!higherLower || !pendingHigherLowerFocus.current) return;
    pendingHigherLowerFocus.current = false;
    higherGuessButton.current?.focus();
  }, [higherLower]);
  const wheelDisabled = !spinCheck.enabled || casino.wheelSpecialPending;
  const wheelClaimReady = casino.wheelSpecialPending && !wheelSpinning;
  const gameName = (gameId: (typeof casino.history)[number]["gameId"]) =>
    casinoGameName(locale, gameId);
  const specialLabel = (prize: CasinoSpecialPrize) =>
    prize.startsWith("special_double_")
      ? casinoText(locale, "doubleGood").replace(
          "{good}",
          economyGoodName(locale, prize.slice("special_double_".length) as EconomicGoodId),
        )
      : casinoSpecialName(locale, prize, formatQuantity);
  const prizeLabel = (prizeKey: string) =>
    casinoPrizeText(
      locale,
      prizeKey,
      prizeKey.startsWith("special_double_")
        ? economyGoodName(locale, prizeKey.slice("special_double_".length) as EconomicGoodId)
        : undefined,
      formatQuantity,
    );
  const historyPrizeLabel = (value: string): string => {
    if (value.startsWith("special_double_")) {
      const goodId = value.slice("special_double_".length) as EconomicGoodId;
      return casinoText(locale, "doubleGood").replace("{good}", economyGoodName(locale, goodId));
    }
    if (value.startsWith("special_")) return specialLabel(value as CasinoSpecialPrize);
    const amountResult = /^(cash|research|cp|antimatter|[a-z]+):(\d+(?:\.\d+)?)$/.exec(value);
    if (amountResult) {
      const [, kind, amountText] = amountResult;
      const amount = formatQuantity(Number(amountText));
      if (kind && ECONOMIC_GOOD_IDS.includes(kind as EconomicGoodId)) {
        return `${amount} ${economyGoodName(locale, kind as EconomicGoodId)}`;
      }
      if (kind === "cash") return `${amount} ${casinoText(locale, "cash")}`;
      if (kind === "research") return `${amount} ${casinoText(locale, "researchPoints")}`;
      if (kind === "cp") return `${amount} ${casinoText(locale, "wheelCurrencyCp")}`;
      if (kind === "antimatter") {
        return casinoText(locale, "voidAntimatterWinNotification").replace("{amount}", amount);
      }
    }
    if (value.startsWith("hilo_")) return prizeLabel(value);
    return value.replaceAll("_", " ");
  };
  const historyResult = (value: string): string => {
    if (value === "win") return casinoText(locale, "win");
    if (value === "loss") return casinoText(locale, "loss");
    if (value === "special-ready") return casinoHistoryText(locale, "specialReady");
    const clueMatch = /^(o-type-clue|manuscript-clue):(.+)$/.exec(value);
    if (clueMatch) {
      const [, kind, identity] = clueMatch;
      return casinoHistoryText(
        locale,
        kind === "o-type-clue" ? "oTypeClue" : "manuscriptClue",
      ).replace("{star}", starNameFromIdentity(identity!));
    }
    const [kind, ...parts] = value.split(":");
    const detail = parts.join(":");
    if (kind === "special") return historyPrizeLabel(detail);
    if (kind === "cash-out") {
      return casinoText(locale, "cashOutResult").replace("{prize}", historyPrizeLabel(detail));
    }
    if (kind === "win") {
      return casinoHistoryText(locale, "winResult").replace("{prize}", historyPrizeLabel(detail));
    }
    if (kind === "no-award") {
      return casinoHistoryText(locale, "noAward").replace("{prize}", historyPrizeLabel(detail));
    }
    if (kind === "o-type-clue")
      return casinoHistoryText(locale, "oTypeClue").replace(": {star}", "");
    if (kind === "manuscript-clue")
      return casinoHistoryText(locale, "manuscriptClue").replace(": {star}", "");
    if (kind === "cash" || kind === "research" || kind === "cp" || kind === "antimatter") {
      return historyPrizeLabel(value);
    }
    if (kind && ECONOMIC_GOOD_IDS.includes(kind as EconomicGoodId)) {
      return historyPrizeLabel(value);
    }
    return value.replaceAll(":", " · ").replaceAll("_", " ").replaceAll("-", " ");
  };
  const counterText = (played: number, won: number) =>
    `${quantity(locale, played)} ${casinoCountNoun(locale, "play", played)} · ${quantity(locale, won)} ${casinoCountNoun(locale, "win", won)}`;
  const gameCounter = (key: "doubleOrNothing" | "wheel" | "higherLower" | "voidSeer") => {
    const played = `${key}Played` as keyof typeof casino.lifetimeStats;
    const won = `${key}Won` as keyof typeof casino.lifetimeStats;
    return counterText(casino.lifetimeStats[played], casino.lifetimeStats[won]);
  };
  const runGameCounter = (key: "doubleOrNothing" | "wheel" | "higherLower" | "voidSeer") => {
    const played = `${key}Played` as keyof typeof state.run.casinoStats;
    const won = `${key}Won` as keyof typeof state.run.casinoStats;
    return counterText(state.run.casinoStats[played], state.run.casinoStats[won]);
  };

  return (
    <section
      className="galactic-casino-pane"
      aria-labelledby="galactic-casino-title"
      data-testid="galactic-casino-pane"
    >
      <div className="pane-heading">
        <div>
          <div className="casino-title-with-help">
            <h2 id="galactic-casino-title" className="game-page-title">
              {casinoText(locale, "title")}
            </h2>
            <span
              className="casino-header-help"
              onMouseEnter={fitHelpTooltip}
              onFocusCapture={fitHelpTooltip}
            >
              <button
                className="casino-header-help-trigger"
                type="button"
                aria-label={casinoText(locale, "headerHelpLabel")}
                aria-describedby="galactic-casino-header-help"
                data-testid="casino-header-help-trigger"
              >
                ?
              </button>
              <span
                className="top-stat-tooltip casino-header-help-tooltip"
                id="galactic-casino-header-help"
                role="tooltip"
                data-testid="casino-header-help-tooltip"
                ref={helpTooltipRef}
                style={{
                  ...(helpTooltipLayout.narrow
                    ? { left: "auto", right: `${-helpTooltipLayout.rightOffset}px` }
                    : { left: "0", right: "auto" }),
                  maxWidth: "min(22rem, calc(100vw - 4rem))",
                }}
              >
                <span>{casinoText(locale, "headerHelp")}</span>
              </span>
            </span>
          </div>
          <p>{casinoHeaderDescription(locale)}</p>
        </div>
        <div className="casino-wallet">
          <span>{casinoText(locale, "balance")}</span>
          <strong data-testid="casino-balance">
            {quantity(locale, casino.casinoPoints)} {casinoText(locale, "wheelCurrencyCp")}
          </strong>
        </div>
      </div>
      <PageArtworkRow>
        <CelestialIllustration kind="star-system" />
      </PageArtworkRow>
      {!casinoUnlocked(state) ? <p>{casinoText(locale, "locked")}</p> : null}

      <div className="action-grid casino-grid">
        <article className="upgrade-card">
          <div className="card-copy">
            <div className="casino-title-with-help">
              <h3>{casinoText(locale, "buyTitle")}</h3>
              <InfoTooltip
                id="casino-purchase-source-help"
                label={casinoSectionHelpLabel(locale, casinoText(locale, "buyTitle"))}
                content={casinoSectionHelpText(locale, "purchase")}
                testId="casino-purchase-source-help"
              />
            </div>
            <label>
              {casinoText(locale, "payment")}
              <select
                aria-label={casinoText(locale, "payment")}
                value={activePaymentId}
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
              {activePaymentId === "cash"
                ? casinoText(locale, "cash")
                : economyGoodName(locale, activePaymentId)}{" "}
              · {quantity(locale, paymentAvailable)} {casinoText(locale, "available")}
            </p>
            <p className="sr-only" id="casino-purchase-action-context">
              {casinoText(locale, "buyTitle")} {casinoText(locale, "amount")}: {quantity(
                locale,
                Number.isSafeInteger(amount) && amount > 0 ? amount : 0,
              )} {casinoText(locale, "wheelCurrencyCp")}. {casinoText(locale, "cost")}: {quantity(
                locale,
                purchaseCost,
              )} {activePaymentId === "cash"
                ? casinoText(locale, "cash")
                : economyGoodName(locale, activePaymentId)}. {quantity(locale, paymentAvailable)}{" "}
              {casinoText(locale, "available")}.
            </p>
            {!purchaseCheck.enabled && (
              <p className="control-reason" id="casino-buy-reason">
                {purchaseReason}
              </p>
            )}
            <button
              type="button"
              className="secondary-button"
              data-testid="casino-buy-cp"
              disabled={!purchaseCheck.enabled}
              aria-describedby={
                purchaseCheck.enabled
                  ? "casino-purchase-action-context"
                  : "casino-purchase-action-context casino-buy-reason"
              }
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
            <div className="casino-title-with-help">
              <h3>{casinoText(locale, "doubleOrNothing")}</h3>
              <InfoTooltip
                id="casino-double-or-nothing-source-help"
                label={casinoSectionHelpLabel(locale, casinoText(locale, "doubleOrNothing"))}
                content={casinoSectionHelpText(locale, "doubleOrNothing")}
                testId="casino-double-or-nothing-source-help"
              />
            </div>
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
            <p id="casino-don-stake-preview" data-testid="casino-don-stake-preview">
              {casinoAmountPreview("currentStakePreview", donEntryCost)}
            </p>
            <p id="casino-don-win-preview" data-testid="casino-don-win-preview">
              {casinoAmountPreview("doubledWinPreview", donEntryCost * 2)}
            </p>
            <p data-testid="casino-run-stats-doubleOrNothing">
              {casinoText(locale, "runStats")}: {runGameCounter("doubleOrNothing")}
            </p>
            <p data-testid="casino-lifetime-stats-doubleOrNothing">
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
              aria-describedby={
                donCheck.enabled
                  ? "casino-don-stake-preview casino-don-win-preview"
                  : "casino-don-stake-preview casino-don-win-preview casino-don-reason"
              }
              onClick={() => dispatch(donCommand)}
            >
              {casinoText(locale, "doubleOrNothingSpin")}
            </button>
          </div>
        </article>

        <article className="upgrade-card">
          <div className="card-copy">
            <div className="casino-title-with-help">
              <h3>{casinoText(locale, "wheel")}</h3>
              <InfoTooltip
                id="casino-wheel-source-help"
                label={casinoSectionHelpLabel(locale, casinoText(locale, "wheel"))}
                content={casinoSectionHelpText(locale, "wheel").replace(
                  "{price}",
                  quantity(locale, wheelEntryCost),
                )}
                testId="casino-wheel-source-help"
              />
            </div>
            <p id="casino-wheel-entry-cost" data-testid="casino-wheel-entry-cost">
              {casinoAmountPreview("entryCostPreview", wheelEntryCost)}
            </p>
            <p id="casino-wheel-help" data-testid="casino-wheel-help">
              {casinoText(locale, "wheelHelp")}
            </p>
            <div className="casino-wheel-stage">
              <div className="casino-wheel" data-special-ready={wheelClaimReady} aria-hidden="true">
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
            <p data-testid="casino-run-stats-wheel">
              {casinoText(locale, "runStats")}: {runGameCounter("wheel")}
            </p>
            {wheelClaimReady ? <output>{casinoText(locale, "specialReady")}</output> : null}
            <label>
              {casinoText(locale, "choosePrize")}
              <select
                aria-label={casinoText(locale, "choosePrize")}
                aria-describedby="casino-wheel-help"
                value={selectedSpecialPrize ?? ""}
                disabled={!wheelClaimReady}
                onChange={(event) =>
                  setSpecialPrize(
                    event.currentTarget.value
                      ? (event.currentTarget.value as CasinoSpecialPrize)
                      : null,
                  )
                }
              >
                <option value="">{casinoText(locale, "selectPrizePlaceholder")}</option>
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
              disabled={!wheelClaimReady || !selectedSpecialPrize || !claimCheck.enabled}
              aria-describedby={
                wheelClaimReady && !claimCheck.enabled
                  ? "casino-wheel-claim-context casino-wheel-claim-reason"
                  : "casino-wheel-claim-context"
              }
              onClick={() => {
                if (
                  selectedSpecialPrize &&
                  dispatch({ type: "casino.wheel.claim", prize: selectedSpecialPrize })
                ) {
                  setSpecialPrize(null);
                }
              }}
            >
              {casinoText(locale, "claim")}
            </button>
            <p className="sr-only" id="casino-wheel-claim-context">
              {casinoText(locale, "wheel")}. {wheelClaimReady
                ? `${casinoText(locale, "choosePrize")}: ${selectedSpecialPrize ? specialLabel(selectedSpecialPrize) : casinoText(locale, "selectPrizePlaceholder")}`
                : casinoText(locale, "wheelHelp")}
            </p>
            {wheelClaimReady && !claimCheck.enabled && (
              <p className="live-feedback" id="casino-wheel-claim-reason">
                {claimReason}
              </p>
            )}
            <button
              type="button"
              className="secondary-button"
              data-testid="casino-wheel-spin"
              disabled={wheelDisabled || wheelSpinning}
              aria-describedby={
                wheelDisabled || wheelSpinning
                  ? "casino-wheel-entry-cost casino-wheel-help casino-wheel-spin-reason"
                  : "casino-wheel-entry-cost casino-wheel-help"
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
            <div className="casino-title-with-help">
              <h3>{casinoText(locale, "higherLower")}</h3>
              <InfoTooltip
                id="casino-higher-lower-source-help"
                label={casinoSectionHelpLabel(locale, casinoText(locale, "higherLower"))}
                content={casinoSectionHelpText(locale, "higherLower").replace(
                  "{price}",
                  quantity(locale, higherLowerEntryCost),
                )}
                testId="casino-higher-lower-source-help"
              />
            </div>
            <p id="casino-hilo-entry-cost" data-testid="casino-hilo-entry-cost">
              {casinoAmountPreview("entryCostPreview", higherLowerEntryCost)}
            </p>
            <p data-testid="casino-run-stats-higherLower">
              {casinoText(locale, "runStats")}: {runGameCounter("higherLower")}
            </p>
            {higherLower ? (
              <>
                <p id="casino-hilo-current-card">
                  {casinoText(locale, "currentCard")}:{" "}
                  {cardAccessibleName(
                    locale,
                    higherLower.deck[higherLower.index]!.rank,
                    higherLower.deck[higherLower.index]!.suit,
                  )}
                </p>
                <div
                  className="casino-card-row"
                  role="group"
                  aria-label={casinoText(locale, "currentCard")}
                >
                  {visibleCards.map((card, index) => (
                    <span
                      className={`casino-card${card.suit === "hearts" || card.suit === "diamonds" ? " casino-card-red-suit" : ""}`}
                      key={`${card.rank}-${card.suit}`}
                      role="img"
                      aria-label={cardAccessibleName(locale, card.rank, card.suit)}
                    >
                      <span className="casino-card-rank" aria-hidden="true">
                        {cardRankSymbol(card.rank)}
                      </span>
                      <span className="casino-card-suit" aria-hidden="true">
                        {CARD_SUIT_SYMBOLS[card.suit]}
                      </span>
                      {index === visibleCards.length - 1 && (
                        <span className="casino-card-current-indicator" aria-hidden="true">
                          ←
                        </span>
                      )}
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
                <p id="casino-hilo-current-prize">
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
                      guessHigherCheck.enabled
                        ? "casino-hilo-current-card"
                        : "casino-hilo-current-card casino-hilo-guess-reason"
                    }
                    onClick={() =>
                      dispatch({ type: "casino.higher-lower.guess", direction: "higher" })
                    }
                  >
                    {casinoText(locale, "higher")}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={!guessLowerCheck.enabled}
                    aria-describedby={
                      guessLowerCheck.enabled
                        ? "casino-hilo-current-card"
                        : "casino-hilo-current-card casino-hilo-guess-reason"
                    }
                    onClick={() =>
                      dispatch({ type: "casino.higher-lower.guess", direction: "lower" })
                    }
                  >
                    {casinoText(locale, "lower")}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={!cashOutCheck.enabled}
                    aria-describedby={
                      cashOutCheck.enabled
                        ? "casino-hilo-current-prize"
                        : "casino-hilo-current-prize casino-hilo-cashout-reason"
                    }
                    onClick={() => dispatch({ type: "casino.higher-lower.cash-out" })}
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
                  aria-describedby={
                    startCheck.enabled
                      ? "casino-hilo-entry-cost"
                      : "casino-hilo-entry-cost casino-hilo-start-reason"
                  }
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
            <div className="casino-title-with-help">
              <h3>{casinoText(locale, "voidSeer")}</h3>
              <InfoTooltip
                id="casino-void-seer-source-help"
                label={casinoSectionHelpLabel(locale, casinoText(locale, "voidSeer"))}
                content={casinoSectionHelpText(locale, "voidSeer")}
                testId="casino-void-seer-source-help"
              />
            </div>
            <p data-testid="casino-run-stats-voidSeer">
              {casinoText(locale, "runStats")}: {runGameCounter("voidSeer")}
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
                    {casinoVoidSeerPrizeName(locale, tier)} ·{" "}
                    {quantity(
                      locale,
                      selectCasinoEntryCost({ type: "casino.void-seer.play", tier }) ?? 0,
                    )}{" "}
                    {casinoVoidSeerCurrency(locale)} · 1/
                    {quantity(locale, VOID_SEER_MAX[tier] + 1)}
                  </option>
                ))}
              </select>
            </label>
            <p>
              {casinoText(locale, "chance")}: 1/{VOID_SEER_MAX[voidTier] + 1}
            </p>
            <p className="sr-only" id="casino-void-seer-action-context">
              {casinoText(locale, "voidSeer")} {casinoText(locale, "tier")}: {casinoVoidSeerPrizeName(
                locale,
                voidTier,
              )}. {casinoText(locale, "cost")}: {quantity(locale, voidCost)}{" "}
              {casinoVoidSeerCurrency(locale)}. {casinoText(locale, "chance")}: 1/
              {quantity(locale, VOID_SEER_MAX[voidTier] + 1)}.
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
              aria-describedby={
                voidCheck.enabled
                  ? "casino-void-seer-action-context"
                  : "casino-void-seer-action-context casino-void-seer-reason"
              }
              onClick={() => dispatch({ type: "casino.void-seer.play", tier: voidTier })}
            >
              {casinoText(locale, "voidSeerSpin")} · {quantity(locale, voidCost)}{" "}
              {casinoVoidSeerCurrency(locale)}
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
                <span>{historyResult(entry.result)}</span>
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
