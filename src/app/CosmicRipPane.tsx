import { useState } from "react";
import {
  COSMIC_RIP_SECTOR_COUNT,
  COSMIC_RIP_TECHNOLOGIES,
  COSMIC_RIP_UPGRADES,
  type CosmicRipUpgradeId,
} from "../content/cosmicRip";
import { checkPreconditions, type GameCommand } from "../engine/commands";
import { cosmicRipTelemetryRate, cosmicRipUpgradeCost } from "../engine/cosmicRip";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { cosmicRipText } from "../i18n/cosmicRipMessages";

interface CosmicRipPaneProps {
  readonly state: GameState;
  readonly store: GameStore;
}

function number(locale: GameState["settings"]["locale"], value: number, digits = 0): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);
}

export function CosmicRipPane({ state, store }: CosmicRipPaneProps) {
  const [feedback, setFeedback] = useState("");
  const locale = state.settings.locale;
  const copy = cosmicRipText(locale);
  const progress = state.permanent.cosmicRip;
  const rate = cosmicRipTelemetryRate(state);

  const run = (command: GameCommand) => {
    const result = store.dispatch(command);
    if (!result.accepted && result.failure) {
      const error = copy.errors[result.failure.code as keyof typeof copy.errors];
      if (error) setFeedback(error);
      return;
    }
    setFeedback("");
  };
  const enabled = (command: GameCommand) => checkPreconditions(state, command).ok;
  const techCommands = COSMIC_RIP_TECHNOLOGIES.map((technology) => ({
    technology,
    command: { type: "cosmic-rip.tech.start", technologyId: technology.id } as const,
  }));

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
      <p className="cosmic-rip-introduction">{copy.introduction}</p>
      <div className="cosmic-rip-wallet" aria-live="polite">
        <span>
          {copy.gp}: <strong>{number(locale, state.permanent.gloryPoints)}</strong>
        </span>
        <span>
          {copy.telemetry}: <strong>{number(locale, progress.telemetryData, 2)}</strong>
        </span>
        <span>
          {copy.rate}: <strong>{number(locale, rate, 2)}/s</strong>
        </span>
      </div>

      {!progress.scannerRestored ? (
        <button
          className="primary-button"
          type="button"
          data-testid="cosmic-rip-restore-scanner"
          disabled={!enabled({ type: "cosmic-rip.scanner.restore" })}
          onClick={() => run({ type: "cosmic-rip.scanner.restore" })}
        >
          {copy.restoreScanner}
        </button>
      ) : (
        <section className="cosmic-rip-section" aria-labelledby="cosmic-rip-scan-title">
          <h3 id="cosmic-rip-scan-title">{copy.scannerRestored}</h3>
          <p>{copy.scanInstruction}</p>
          <div className="cosmic-rip-sectors">
            {Array.from({ length: COSMIC_RIP_SECTOR_COUNT }, (_, sectorIndex) => {
              const scanned = progress.scannedSectorIndexes.includes(sectorIndex);
              const found = scanned && sectorIndex === progress.ripLocationSectorIndex;
              const command: GameCommand = { type: "cosmic-rip.sector.scan", sectorIndex };
              return (
                <button
                  className={`cosmic-rip-sector${found ? " is-found" : ""}`}
                  type="button"
                  key={sectorIndex}
                  disabled={scanned || !enabled(command)}
                  onClick={() => run(command)}
                  aria-label={`${copy.sector} ${sectorIndex + 1}${found ? `, ${copy.sectorFound}` : scanned ? `, ${copy.sectorScanned}` : ""}`}
                  data-testid={`cosmic-rip-sector-${sectorIndex}`}
                >
                  <span>
                    {copy.sector} {sectorIndex + 1}
                  </span>
                  <small>
                    {found ? copy.sectorFound : scanned ? copy.sectorScanned : `1 ${copy.gp}`}
                  </small>
                </button>
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
        </section>
      )}

      {progress.scannerRestored && progress.ripFound && !progress.closed && (
        <>
          <section className="cosmic-rip-section" aria-labelledby="cosmic-rip-upgrades-title">
            <h3 id="cosmic-rip-upgrades-title">{copy.upgrades}</h3>
            <div className="cosmic-rip-upgrades">
              {(Object.keys(COSMIC_RIP_UPGRADES) as CosmicRipUpgradeId[]).map((upgradeId) => {
                const definition = COSMIC_RIP_UPGRADES[upgradeId];
                const cost = cosmicRipUpgradeCost(state, upgradeId);
                const command: GameCommand = { type: "cosmic-rip.upgrade.purchase", upgradeId };
                const owned = progress[`${upgradeId}Count`];
                const materials = Object.entries(cost.goods)
                  .map(([goodId, amount]) => `${number(locale, amount!)} ${goodId}`)
                  .join(" + ");
                return (
                  <article className="cosmic-rip-upgrade" key={upgradeId}>
                    <h4>
                      {copy.upgradeNames[upgradeId]} <small>×{owned}</small>
                    </h4>
                    <p>
                      +{number(locale, definition.telemetryPerSecond, 2)} {copy.rate}
                    </p>
                    <p>
                      {number(locale, cost.cash)} $ + {materials}
                    </p>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={!enabled(command)}
                      onClick={() => run(command)}
                    >
                      {copy.purchase}
                    </button>
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
                const canStart = enabled(command);
                const prerequisite = technology.requires
                  ? copy.requires.replace("{name}", copy.technologyNames[technology.requires])
                  : "";
                return (
                  <article
                    className="cosmic-rip-technology"
                    key={technology.id}
                    data-testid={`cosmic-rip-technology-${technology.id}`}
                  >
                    <h4>{copy.technologyNames[technology.id]}</h4>
                    <p>
                      {number(locale, technology.telemetryCost)} {copy.telemetry} ·{" "}
                      {number(locale, technology.durationMs / 1000)} s · 1 {copy.gp}
                    </p>
                    {done ? (
                      <p>{copy.researched}</p>
                    ) : active ? (
                      <>
                        <p>{copy.researching}</p>
                        <progress
                          aria-label={`${copy.researching}: ${copy.technologyNames[technology.id]}`}
                          value={progress.researchElapsedMs}
                          max={technology.durationMs}
                        />
                      </>
                    ) : (
                      <>
                        {!canStart && progress.telemetryData < technology.revealAt && (
                          <p>
                            {copy.hidden.replace("{amount}", number(locale, technology.revealAt))}
                          </p>
                        )}
                        {!canStart && prerequisite && <p>{prerequisite}</p>}
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={!canStart}
                          onClick={() => run(command)}
                        >
                          {copy.research}
                        </button>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
          {progress.researchedTechnologyIds.length === COSMIC_RIP_TECHNOLOGIES.length && (
            <button
              className="primary-button cosmic-rip-close"
              type="button"
              disabled={!enabled({ type: "cosmic-rip.close" })}
              onClick={() => run({ type: "cosmic-rip.close" })}
            >
              {copy.closeRip}
            </button>
          )}
        </>
      )}

      {progress.closed && (
        <output className="cosmic-rip-closed cosmic-rip-status" data-testid="cosmic-rip-closed">
          {copy.closed}
        </output>
      )}
      <output className="live-feedback" aria-live="polite" data-testid="cosmic-rip-feedback">
        {feedback}
      </output>
    </section>
  );
}
