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
  cosmicRipStabilityProgress,
  cosmicRipTelemetryRate,
  cosmicRipUpgradeCost,
  type CosmicRipFailure,
} from "../engine/cosmicRip";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import {
  cosmicRipObjectiveText,
  cosmicRipStatusDescription,
  cosmicRipTechnologyDescription,
  cosmicRipText,
  cosmicRipUpgradeDescription,
} from "../i18n/cosmicRipMessages";
import { starshipText } from "../i18n/starshipMessages";
import { formatCurrency } from "./currencyFormatting";
import { economyGoodName } from "./economyDisplay";
import type { CosmicRipPaneId } from "./presentationNavigation";
import { formatNumber } from "./numberFormatting";
import { formatCountdown } from "./timeFormatting";
import { CelestialIllustration } from "./CelestialIllustration";
import { cosmicRipScannerRestoreFailureNotice } from "./cosmicRipEventNotifications";
import { useGameNotifications } from "./NotificationStack";
import { InfoTooltip } from "./InfoTooltip";

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

function CosmicRipEndingArtwork() {
  return (
    <svg
      className="cosmic-rip-ending-art"
      viewBox="0 0 640 180"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      data-testid="cosmic-rip-ending-art"
    >
      <path
        d="M66 91c66-39 125-53 190-33 30 9 52 22 64 32-12 10-34 23-64 32-65 20-124 6-190-31Z"
        fill="var(--panel-raised)"
        stroke="var(--star-color-settled)"
        strokeWidth="2"
        opacity=".8"
      />
      <path
        d="M574 91c-66-39-125-53-190-33-30 9-52 22-64 32 12 10 34 23 64 32 65 20 124 6 190-31Z"
        fill="var(--panel-raised)"
        stroke="var(--star-color-settled)"
        strokeWidth="2"
        opacity=".8"
      />
      <ellipse
        cx="320"
        cy="90"
        rx="202"
        ry="61"
        fill="none"
        stroke="var(--accent-bright)"
        strokeWidth="2"
        opacity=".72"
      />
      <ellipse
        cx="320"
        cy="90"
        rx="157"
        ry="46"
        fill="none"
        stroke="var(--text-color)"
        strokeWidth="1.5"
        opacity=".62"
      />
      <circle cx="320" cy="90" r="34" fill="var(--accent-soft)" />
      <path
        d="m320 43 8 34 28 13-28 13-8 31-8-31-28-13 28-13 8-34Z"
        fill="var(--ready-text)"
        stroke="var(--accent-bright)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="320" cy="90" r="8" fill="var(--panel-raised)" />
      <path
        d="m131 48 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Zm376 69 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z"
        fill="var(--text-hover-color)"
      />
      <circle cx="214" cy="43" r="2.5" fill="var(--text-color)" />
      <circle cx="423" cy="137" r="2.5" fill="var(--text-color)" />
      <circle cx="548" cy="49" r="2" fill="var(--text-hover-color)" />
      <circle cx="93" cy="125" r="2" fill="var(--text-hover-color)" />
    </svg>
  );
}

export function CosmicRipPane({ state, store, activePane }: CosmicRipPaneProps) {
  const [feedback, setFeedback] = useState("");
  const notify = useGameNotifications();
  const locale = state.settings.locale;
  const copy = cosmicRipText(locale);
  const objectiveCopy = cosmicRipObjectiveText(locale);
  const oneGpCost = `${number(state, 1)} ${copy.gpShort}`;
  const progress = state.permanent.cosmicRip;
  const latestResearchedTechnology = [...COSMIC_RIP_TECHNOLOGIES]
    .reverse()
    .find((technology) => progress.researchedTechnologyIds.includes(technology.id));
  const ripResearchStatus = latestResearchedTechnology
    ? latestResearchedTechnology.id === "realityWeaveRegulator"
      ? copy.fullyStabilised
      : copy.technologyStatusMessages[latestResearchedTechnology.id]
    : copy.ripFound;
  const nextObjectiveId = !progress.ripFound
    ? "scan"
    : (COSMIC_RIP_TECHNOLOGIES.find(
        (technology) => !progress.researchedTechnologyIds.includes(technology.id),
      )?.id ?? "close");
  const rate = cosmicRipTelemetryRate(state);
  const stability = cosmicRipStabilityProgress(progress);
  const stabilityText = copy.stabilityPercentage.replace("{percentage}", number(state, stability));
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
      if (command.type === "cosmic-rip.scanner.restore") {
        const notice = cosmicRipScannerRestoreFailureNotice(locale);
        notify(notice.message, {
          classification: notice.classification,
          type: notice.type,
          durationMs: notice.durationMs,
        });
      }
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
          <div className="space-mining-title-row">
            <h2 className="game-page-title" id="cosmic-rip-title">
              {copy.title}
            </h2>
            <InfoTooltip
              id="cosmic-rip-header-help"
              label={`${copy.title} — ${starshipText(locale, "scanMoreInfoLabel")}`}
              content={copy.headerHelp}
              testId="cosmic-rip-header-help"
            />
          </div>
        </div>
      </header>
      <div className="deep-space-banner page-artwork-row">
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
      <div className="cosmic-rip-stability" data-testid="cosmic-rip-stability">
        <div className="space-mining-title-row">
          <strong>{copy.stabilityLabel}</strong>
          <InfoTooltip
            id="cosmic-rip-stability-help"
            label={`${copy.stabilityLabel}: ${starshipText(locale, "scanMoreInfoLabel")}`}
            content={cosmicRipStatusDescription(locale)}
            testId="cosmic-rip-stability-help"
          />
        </div>
        <output data-testid="cosmic-rip-stability-value">{stabilityText}</output>
        <progress
          aria-label={copy.stabilityLabel}
          value={stability}
          max={100}
          data-testid="cosmic-rip-stability-progress"
        />
      </div>

      <section
        id="panel-cosmic-rip-situation"
        className="cosmic-rip-section"
        role="tabpanel"
        aria-labelledby="tab-cosmic-rip-situation"
        tabIndex={0}
        hidden={activePane !== "cosmic-rip-situation"}
      >
        <div className="space-mining-title-row">
          <h3 id="cosmic-rip-situation-title">{copy.situationTitle}</h3>
          <InfoTooltip
            id="cosmic-rip-situation-help"
            label={`${copy.situationTitle} — ${starshipText(locale, "scanMoreInfoLabel")}`}
            content={copy.situationHelp}
            testId="cosmic-rip-situation-help"
          />
        </div>
        <p>
          {progress.closed
            ? copy.closed
            : progress.ripFound
              ? ripResearchStatus
              : progress.scannerRestored
                ? progress.scannedSectorIndexes.length > 0
                  ? copy.ripMissing
                  : copy.scanInstruction
                : copy.scannerArrayTitle}
        </p>
        {progress.scannerRestored && (
          <p className="cosmic-rip-next-objective" data-testid="cosmic-rip-next-objective">
            <span data-testid="cosmic-rip-next-objective-label">{objectiveCopy.label}</span>
            <span className="green-ready-text" data-testid="cosmic-rip-next-objective-text">
              {objectiveCopy.objectives[nextObjectiveId]}
            </span>
          </p>
        )}
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
        aria-labelledby="tab-cosmic-rip-scanner-array"
        tabIndex={0}
        hidden={activePane !== "cosmic-rip-scanner-array"}
      >
        <div className="space-mining-title-row">
          <h3 id="cosmic-rip-scan-title">{copy.scannerArrayTitle}</h3>
          <InfoTooltip
            id="cosmic-rip-scanner-array-help"
            label={`${copy.scannerArrayTitle} — ${starshipText(locale, "scanMoreInfoLabel")}`}
            content={copy.scannerArrayHelp}
            testId="cosmic-rip-scanner-array-help"
          />
        </div>
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
        aria-labelledby="tab-cosmic-rip-rip"
        tabIndex={0}
        hidden={activePane !== "cosmic-rip-rip"}
      >
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
                      <div className="cosmic-rip-upgrade-title-row">
                        <h4>
                          {copy.upgradeNames[upgradeId]} <small>×{owned}</small>
                        </h4>
                        <InfoTooltip
                          id={`cosmic-rip-upgrade-${upgradeId}-help`}
                          label={`${copy.upgradeNames[upgradeId]}: ${starshipText(locale, "scanMoreInfoLabel")}`}
                          content={cosmicRipUpgradeDescription(locale, upgradeId)}
                          testId={`cosmic-rip-upgrade-${upgradeId}-help`}
                        />
                      </div>
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
              <div className="space-mining-title-row">
                <h3 id="cosmic-rip-tech-title">{copy.technologies}</h3>
                <InfoTooltip
                  id="cosmic-rip-technologies-help"
                  label={`${copy.technologies} — ${starshipText(locale, "scanMoreInfoLabel")}`}
                  content={copy.technologyHelp}
                  testId="cosmic-rip-technologies-help"
                />
              </div>
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
                      <div className="cosmic-rip-technology-title-row">
                        <h4>{copy.technologyNames[technology.id]}</h4>
                        <InfoTooltip
                          id={`cosmic-rip-technology-${technology.id}-help`}
                          label={`${copy.technologyNames[technology.id]}: ${starshipText(locale, "scanMoreInfoLabel")}`}
                          content={cosmicRipTechnologyDescription(locale, technology.id)}
                          testId={`cosmic-rip-technology-${technology.id}-help`}
                        />
                      </div>
                      <p>
                        {number(state, technology.telemetryCost)} {copy.telemetry} ·{" "}
                        {number(state, technology.durationMs / 1000)} s · {oneGpCost}
                      </p>
                      {done ? (
                        <p>{copy.technologyStatusMessages[technology.id]}</p>
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
                                  state.settings.notation,
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
          <div className="cosmic-rip-closed-state">
            <CosmicRipEndingArtwork />
            <output className="cosmic-rip-closed cosmic-rip-status" data-testid="cosmic-rip-closed">
              {copy.closed}
            </output>
          </div>
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
