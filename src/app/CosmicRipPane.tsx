import { useState } from "react";
import {
  COSMIC_RIP_CLOSURE_GP,
  COSMIC_RIP_SCANNER_REPAIR_GP,
  COSMIC_RIP_SECTOR_COUNT,
  COSMIC_RIP_TECHNOLOGIES,
  COSMIC_RIP_UPGRADES,
  type CosmicRipUpgradeId,
} from "../content/cosmicRip";
import type { EconomicGoodId } from "../content/ids";
import type { GameCommand } from "../engine/commands";
import { displayCurrency } from "../engine/precision";
import { selectEconomyAction } from "../engine/selectors";
import {
  cosmicRipTelemetryRate,
  cosmicRipUpgradeCost,
  type CosmicRipFailure,
} from "../engine/cosmicRip";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { cosmicRipText } from "../i18n/cosmicRipMessages";
import { formatCurrency } from "./currencyFormatting";
import { economyGoodName } from "./economyDisplay";
import type { CosmicRipPaneId } from "./presentationNavigation";
import { formatNumber } from "./numberFormatting";
import { formatCountdown } from "./timeFormatting";
import { CelestialIllustration } from "./CelestialIllustration";

interface CosmicRipPaneProps {
  readonly state: GameState;
  readonly store: GameStore;
  readonly activePane: CosmicRipPaneId;
}

function number(state: GameState, value: number, digits = 0): string {
  return formatNumber(state.settings.locale, value, digits, state.settings.notation);
}

function cash(state: GameState, value: number): string {
  return formatCurrency(
    state.settings.locale,
    Number(displayCurrency(value)),
    state.settings.currencyId ?? "usd",
    2,
    state.settings.notation,
  );
}

export function CosmicRipPane({ state, store, activePane }: CosmicRipPaneProps) {
  const [feedback, setFeedback] = useState("");
  const locale = state.settings.locale;
  const copy = cosmicRipText(locale);
  const oneGpCost = `${number(state, 1)} ${copy.gpShort}`;
  const progress = state.permanent.cosmicRip;
  const rate = cosmicRipTelemetryRate(state);
  const affordability = (command: GameCommand) => {
    const result = selectEconomyAction(state, command);
    if (result.enabled) return { enabled: true, reason: null, failureCode: null } as const;
    const code =
      result.failure && result.failure.code in copy.errors
        ? (result.failure.code as CosmicRipFailure["code"])
        : null;
    return {
      enabled: false,
      reason: code ? copy.errors[code] : null,
      failureCode: code,
    } as const;
  };

  const run = (command: GameCommand) => {
    const result = store.dispatch(command);
    if (!result.accepted && result.failure) {
      const error = copy.errors[result.failure.code as keyof typeof copy.errors];
      if (error) setFeedback(error);
      return;
    }
    setFeedback("");
  };
  const techCommands = COSMIC_RIP_TECHNOLOGIES.map((technology) => ({
    technology,
    command: { type: "cosmic-rip.tech.start", technologyId: technology.id } as const,
  }));
  const restoreScannerCommand: GameCommand = { type: "cosmic-rip.scanner.restore" };
  const restoreScannerCheck = affordability(restoreScannerCommand);
  const restoreScannerReasonId = "cosmic-rip-restore-reason";

  return (
    <section
      className="cosmic-rip-pane"
      aria-labelledby="cosmic-rip-title"
      data-testid="cosmic-rip-pane"
    >
      <header className="panel-heading">
        <div>
          <p className="eyebrow">{copy.status}</p>
          <h2 id="cosmic-rip-title">{copy.title}</h2>
        </div>
      </header>
      <div className="deep-space-banner">
        <CelestialIllustration kind="cosmic-rip" />
      </div>
      <p className="cosmic-rip-introduction">{copy.introduction}</p>
      <div className="cosmic-rip-wallet">
        <span>
          {copy.gp}: <strong>{number(state, state.permanent.gloryPoints)}</strong>
        </span>
        <span>
          {copy.telemetry}: <strong>{number(state, progress.telemetryData, 2)}</strong>
        </span>
        <span>
          {copy.rate}: <strong>{number(state, rate, 2)}/s</strong>
        </span>
      </div>

      <section
        id="panel-cosmic-rip-situation"
        className="cosmic-rip-section"
        role="tabpanel"
        aria-labelledby="cosmic-rip-situation-title"
        tabIndex={0}
        hidden={activePane !== "cosmic-rip-situation"}
      >
        <h3 id="cosmic-rip-situation-title">{copy.situationTitle}</h3>
        <p>
          {progress.closed
            ? copy.closed
            : progress.ripFound
              ? copy.ripFound
              : progress.scannerRestored
                ? progress.scannedSectorIndexes.length > 0
                  ? copy.ripMissing
                  : copy.scanInstruction
                : copy.scannerArrayTitle}
        </p>
        {!progress.scannerRestored ? (
          <div className="cosmic-rip-control">
            <button
              className="primary-button"
              type="button"
              data-testid="cosmic-rip-restore-scanner"
              disabled={!restoreScannerCheck.enabled}
              aria-describedby={restoreScannerCheck.reason ? restoreScannerReasonId : undefined}
              onClick={() => run(restoreScannerCommand)}
            >
              {copy.restoreScanner} · {number(state, COSMIC_RIP_SCANNER_REPAIR_GP)} {copy.gpShort}
            </button>
            {restoreScannerCheck.reason && (
              <p className="control-reason" id={restoreScannerReasonId}>
                {restoreScannerCheck.reason}
              </p>
            )}
          </div>
        ) : null}
      </section>

      <section
        id="panel-cosmic-rip-scanner-array"
        className="cosmic-rip-section"
        role="tabpanel"
        aria-labelledby="cosmic-rip-scan-title"
        tabIndex={0}
        hidden={activePane !== "cosmic-rip-scanner-array"}
      >
        <h3 id="cosmic-rip-scan-title">{copy.scannerArrayTitle}</h3>
        {progress.scannerRestored ? (
          <>
            <p>{copy.scannerRestored}</p>
            <p>{copy.scanInstruction}</p>
            <div className="cosmic-rip-sectors">
              {Array.from({ length: COSMIC_RIP_SECTOR_COUNT }, (_, sectorIndex) => {
                const scanned = progress.scannedSectorIndexes.includes(sectorIndex);
                const found = scanned && sectorIndex === progress.ripLocationSectorIndex;
                const command: GameCommand = { type: "cosmic-rip.sector.scan", sectorIndex };
                const check = affordability(command);
                const reasonId = `cosmic-rip-sector-${sectorIndex}-reason`;
                const accessibleStatus = found
                  ? `, ${copy.sectorFound}`
                  : scanned
                    ? `, ${copy.sectorScanned}`
                    : `, ${oneGpCost}`;
                return (
                  <div className="cosmic-rip-sector-control" key={sectorIndex}>
                    <button
                      className={`cosmic-rip-sector${found ? " is-found" : ""}`}
                      type="button"
                      disabled={!check.enabled}
                      onClick={() => run(command)}
                      aria-describedby={check.reason ? reasonId : undefined}
                      aria-label={`${copy.sector} ${sectorIndex + 1}${accessibleStatus}`}
                      data-testid={`cosmic-rip-sector-${sectorIndex}`}
                    >
                      <span>
                        {copy.sector} {sectorIndex + 1}
                      </span>
                      <small>
                        {found ? copy.sectorFound : scanned ? copy.sectorScanned : oneGpCost}
                      </small>
                    </button>
                    {check.reason && (
                      <p className="control-reason" id={reasonId}>
                        {check.reason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <output className="cosmic-rip-status">
              {progress.ripFound
                ? copy.ripFound
                : progress.scannedSectorIndexes.length > 0
                  ? copy.ripMissing
                  : ""}
            </output>
          </>
        ) : null}
      </section>

      <section
        id="panel-cosmic-rip-rip"
        className="cosmic-rip-section"
        role="tabpanel"
        aria-labelledby="cosmic-rip-page-title"
        tabIndex={0}
        hidden={activePane !== "cosmic-rip-rip"}
      >
        <h3 id="cosmic-rip-page-title">{copy.title}</h3>
        {progress.scannerRestored && progress.ripFound && !progress.closed ? (
          <>
            <section className="cosmic-rip-section" aria-labelledby="cosmic-rip-upgrades-title">
              <h3 id="cosmic-rip-upgrades-title">{copy.upgrades}</h3>
              <div className="cosmic-rip-upgrades">
                {(Object.keys(COSMIC_RIP_UPGRADES) as CosmicRipUpgradeId[]).map((upgradeId) => {
                  const definition = COSMIC_RIP_UPGRADES[upgradeId];
                  const cost = cosmicRipUpgradeCost(state, upgradeId);
                  const command: GameCommand = { type: "cosmic-rip.upgrade.purchase", upgradeId };
                  const check = affordability(command);
                  const reasonId = `cosmic-rip-upgrade-${upgradeId}-reason`;
                  const owned = progress[`${upgradeId}Count`];
                  const materials = Object.entries(cost.goods)
                    .map(
                      ([goodId, amount]) =>
                        `${number(state, amount!)} ${economyGoodName(locale, goodId as EconomicGoodId)}`,
                    )
                    .join(" + ");
                  return (
                    <article className="cosmic-rip-upgrade" key={upgradeId}>
                      <h4>
                        {copy.upgradeNames[upgradeId]} <small>×{owned}</small>
                      </h4>
                      <p>
                        +{number(state, definition.telemetryPerSecond, 2)} {copy.rate}
                      </p>
                      <p>
                        {cash(state, cost.cash)} + {materials}
                      </p>
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={!check.enabled}
                        aria-describedby={check.reason ? reasonId : undefined}
                        onClick={() => run(command)}
                      >
                        {copy.purchase}
                      </button>
                      {check.reason && (
                        <p className="control-reason" id={reasonId}>
                          {check.reason}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="cosmic-rip-section" aria-labelledby="cosmic-rip-tech-title">
              <h3 id="cosmic-rip-tech-title">{copy.technologies}</h3>
              <div className="cosmic-rip-technologies">
                {techCommands.map(({ technology, command }) => {
                  const done = progress.researchedTechnologyIds.includes(technology.id);
                  const active = progress.activeResearchTechnologyId === technology.id;
                  const check = affordability(command);
                  const canStart = check.enabled;
                  const prerequisite = technology.requires
                    ? copy.requires.replace("{name}", copy.technologyNames[technology.requires])
                    : "";
                  const reasonId = `cosmic-rip-technology-${technology.id}-reason`;
                  const detailedReason = check.reason
                    ? check.failureCode === "cosmic-rip-tech-hidden"
                      ? `${check.reason} ${copy.hidden.replace("{amount}", number(state, technology.revealAt))}`
                      : check.failureCode === "cosmic-rip-tech-locked" && prerequisite
                        ? `${check.reason} ${prerequisite}`
                        : check.reason
                    : null;
                  return (
                    <article
                      className="cosmic-rip-technology"
                      key={technology.id}
                      data-testid={`cosmic-rip-technology-${technology.id}`}
                    >
                      <h4>{copy.technologyNames[technology.id]}</h4>
                      <p>
                        {number(state, technology.telemetryCost)} {copy.telemetry} ·{" "}
                        {number(state, technology.durationMs / 1000)} s · {oneGpCost}
                      </p>
                      {done ? (
                        <p>{copy.researched}</p>
                      ) : active ? (
                        <>
                          <p>{copy.researching}</p>
                          <div className="cosmic-rip-research-progress">
                            <progress
                              aria-label={`${copy.researching}: ${copy.technologyNames[technology.id]}`}
                              value={progress.researchElapsedMs}
                              max={technology.durationMs}
                            />
                            <small data-testid="cosmic-rip-research-remaining">
                              {copy.remaining.replace(
                                "{time}",
                                formatCountdown(
                                  locale,
                                  technology.durationMs - progress.researchElapsedMs,
                                ),
                              )}
                            </small>
                          </div>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="secondary-button"
                            disabled={!canStart}
                            aria-describedby={detailedReason ? reasonId : undefined}
                            onClick={() => run(command)}
                          >
                            {copy.research}
                          </button>
                          {detailedReason && (
                            <p className="control-reason" id={reasonId}>
                              {detailedReason}
                            </p>
                          )}
                        </>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
            {progress.researchedTechnologyIds.length === COSMIC_RIP_TECHNOLOGIES.length &&
              (() => {
                const command: GameCommand = { type: "cosmic-rip.close" };
                const check = affordability(command);
                const reasonId = "cosmic-rip-close-reason";
                return (
                  <div className="cosmic-rip-control">
                    <button
                      className="primary-button cosmic-rip-close"
                      type="button"
                      disabled={!check.enabled}
                      aria-describedby={check.reason ? reasonId : undefined}
                      onClick={() => run(command)}
                    >
                      {copy.closeRip} · {number(state, COSMIC_RIP_CLOSURE_GP)} {copy.gpShort}
                    </button>
                    {check.reason && (
                      <p className="control-reason" id={reasonId}>
                        {check.reason}
                      </p>
                    )}
                  </div>
                );
              })()}
          </>
        ) : progress.closed ? (
          <output className="cosmic-rip-closed cosmic-rip-status" data-testid="cosmic-rip-closed">
            {copy.closed}
          </output>
        ) : (
          <p>{progress.ripFound ? copy.ripFound : copy.scanInstruction}</p>
        )}
      </section>
      <output className="live-feedback" aria-live="polite" data-testid="cosmic-rip-feedback">
        {feedback}
      </output>
    </section>
  );
}
