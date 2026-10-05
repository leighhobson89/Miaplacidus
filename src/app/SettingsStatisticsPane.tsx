import { COMPOUND_IDS, GALAXY_SEED_DEFAULT, MATERIAL_IDS } from "../content/ids";
import { ROCKET_IDS, ROCKET_PART_REQUIREMENTS } from "../content/space";
import { RANDOM_EVENT_IDS } from "../content/metaSignals";
import { COSMIC_RIP_SECTOR_COUNT, COSMIC_RIP_TECHNOLOGIES } from "../content/cosmicRip";
import { createStarCatalogue } from "../content/starCatalogue";
import type { GameState } from "../engine/state";
import { currentWeatherForSystem } from "../engine/weather";
import { economyGoodName } from "./economyDisplay";
import {
  settingsSectionName,
  settingsStatisticLabel,
  settingsText,
  themeName,
  type SettingsStatisticId,
} from "../i18n/settingsMessages";
import { randomEventName } from "../i18n/metaSignalMessages";
import {
  eventTrackingNote,
  overviewStatisticLabel,
  runApTrackingNote,
  runStatisticLabel,
} from "../i18n/statisticsMessages";
import { topStatusText } from "../i18n/topStatusMessages";
import { formatCurrency } from "./currencyFormatting";
import { formatNumber } from "./numberFormatting";
import { formatDuration } from "./timeFormatting";

type StatisticsDisplayRow =
  | { readonly label: string; readonly value: string }
  | { readonly label: string; readonly currentRun: string; readonly lifetime: string };

export function SettingsStatisticsPane({ state }: { readonly state: GameState }) {
  const locale = state.settings.locale;
  const statNumber = (value: number) => formatNumber(locale, value, 0, state.settings.notation);
  const money = (value: number) =>
    formatCurrency(locale, value, state.settings.currencyId ?? "usd", 2, state.settings.notation);
  const totalResources = MATERIAL_IDS.reduce(
    (total, id) => total + state.run.goods[id].quantity,
    0,
  );
  const totalCompounds = COMPOUND_IDS.reduce(
    (total, id) => total + state.run.goods[id].quantity,
    0,
  );
  const casino = state.run.casinoStats;
  const lifetimeCasino = state.permanent.galacticCasino.lifetimeStats;
  const cosmicRip = state.permanent.cosmicRip;
  const statRow = (id: SettingsStatisticId, value: string): StatisticsDisplayRow => ({
    label: settingsStatisticLabel(locale, id),
    value,
  });
  const casinoRow = (id: SettingsStatisticId, key: keyof typeof casino): StatisticsDisplayRow => ({
    label: settingsStatisticLabel(locale, id),
    currentRun: statNumber(casino[key]),
    lifetime: statNumber(lifetimeCasino[key]),
  });

  const currentSystem = createStarCatalogue(GALAXY_SEED_DEFAULT).find(
    (star) =>
      star.id === state.run.space.currentSystemId ||
      star.name.toLocaleLowerCase("en") === state.run.space.currentSystemId.toLocaleLowerCase("en"),
  );
  const currentWeather = currentWeatherForSystem(state.run.space);
  const weatherLabel = {
    clear: topStatusText(locale, "weatherClear"),
    cloudy: topStatusText(locale, "weatherCloudy"),
    rain: topStatusText(locale, "weatherRain"),
    heavyRain: topStatusText(locale, "weatherHeavyRain"),
    volcano: topStatusText(locale, "weatherVolcano"),
  }[currentWeather];
  const rocketsBuiltThisRun = ROCKET_IDS.filter(
    (id) => state.run.space.rockets[id].builtParts >= ROCKET_PART_REQUIREMENTS[id],
  ).length;
  const runRows: readonly StatisticsDisplayRow[] = [
    {
      label: runStatisticLabel(locale, "runTime"),
      value: formatDuration(locale, state.run.clock.simulationMs),
    },
    {
      label: runStatisticLabel(locale, "starSystem"),
      value: currentSystem?.name ?? state.run.space.currentSystemId,
    },
    { label: runStatisticLabel(locale, "currentWeather"), value: weatherLabel },
    { label: runStatisticLabel(locale, "cash"), value: money(state.run.cash) },
    {
      label: runStatisticLabel(locale, "apAnticipated"),
      value: runStatisticLabel(locale, "notTracked"),
    },
    {
      label: runStatisticLabel(locale, "antimatter"),
      value: statNumber(state.run.space.antimatter),
    },
  ];
  const snapshotRows: readonly StatisticsDisplayRow[] = [
    statRow("antimatterThisRun", statNumber(state.run.space.antimatterMinedThisRun)),
    statRow("researchPool", statNumber(state.run.researchPoints)),
    statRow("resourceStock", statNumber(totalResources)),
    statRow("compoundStock", statNumber(totalCompounds)),
    statRow("energyStored", statNumber(state.run.economy.power.quantity)),
    statRow("recordedEvents", statNumber(state.run.randomEvents.history.length)),
    statRow(
      "unlockedAchievements",
      statNumber(
        new Set([
          ...state.run.achievements.unlockedIds,
          ...state.permanent.achievements.unlockedIds,
        ]).size,
      ),
    ),
    statRow("rebirths", statNumber(state.permanent.rebirthCount)),
  ];
  const overviewRows: readonly StatisticsDisplayRow[] = [
    statRow("activeTime", formatDuration(locale, state.statistics.lifetimeActiveMs)),
    statRow("pioneer", state.run.pioneerName),
    statRow("ascendencyPoints", statNumber(state.permanent.ascendencyPoints)),
    {
      label: overviewStatisticLabel(locale, "apGain"),
      value: statNumber(state.statistics.lifetimeAscendencyPointsGained),
    },
    statRow("runNumber", statNumber(state.permanent.rebirthCount + 1)),
    {
      label: overviewStatisticLabel(locale, "uniqueNewsTickers"),
      value: statNumber(state.run.newsTicker.seenIds.length),
    },
    {
      label: overviewStatisticLabel(locale, "tickerPrizes"),
      value: statNumber(state.run.newsTicker.claimedPrizeIds.length),
    },
    { label: settingsText(locale, "theme"), value: themeName(locale, state.settings.themeId) },
    statRow("lifetimeAntimatter", statNumber(state.statistics.lifetimeAntimatterMined)),
    {
      label: overviewStatisticLabel(locale, "totalAsteroids"),
      value: statNumber(state.statistics.lifetimeAsteroidsDiscovered),
    },
    {
      label: overviewStatisticLabel(locale, "legendaryAsteroids"),
      value: statNumber(state.statistics.lifetimeLegendaryAsteroidsDiscovered),
    },
    {
      label: overviewStatisticLabel(locale, "rocketsLaunched"),
      value: statNumber(state.statistics.lifetimeRocketsLaunched),
    },
    {
      label: overviewStatisticLabel(locale, "starshipsLaunched"),
      value: statNumber(state.statistics.lifetimeStarshipsLaunched),
    },
  ];
  const spaceMiningRows: readonly StatisticsDisplayRow[] = [
    statRow(
      "spaceTelescopeBuilt",
      settingsStatisticLabel(locale, state.run.space.telescopeBuilt ? "yes" : "no"),
    ),
    statRow(
      "launchPadBuilt",
      settingsStatisticLabel(locale, state.run.space.launchPadBuilt ? "yes" : "no"),
    ),
    {
      label: settingsStatisticLabel(locale, "rocketsBuilt"),
      currentRun: statNumber(rocketsBuiltThisRun),
      lifetime: statNumber(state.statistics.lifetimeRocketsBuilt),
    },
    {
      label: settingsStatisticLabel(locale, "asteroidsFound"),
      currentRun: statNumber(state.run.space.nextAsteroidSequence - 1),
      lifetime: statNumber(state.statistics.lifetimeAsteroidsDiscovered),
    },
    {
      label: settingsStatisticLabel(locale, "asteroidsMined"),
      currentRun: statNumber(state.run.space.asteroidsMinedThisRun),
      lifetime: statNumber(state.statistics.lifetimeAsteroidsMined),
    },
  ];
  const interstellarRows: readonly StatisticsDisplayRow[] = [
    statRow("systemsSettled", statNumber(state.permanent.settledSystemIds.length)),
  ];
  const galacticCasinoRows: readonly StatisticsDisplayRow[] = [
    casinoRow("casinoPointsSpent", "cpSpent"),
    casinoRow("doubleOrNothingPlayed", "doubleOrNothingPlayed"),
    casinoRow("doubleOrNothingWon", "doubleOrNothingWon"),
    casinoRow("wheelPlayed", "wheelPlayed"),
    casinoRow("wheelWon", "wheelWon"),
    casinoRow("wheelSpecialWon", "wheelSpecialWon"),
    casinoRow("higherLowerPlayed", "higherLowerPlayed"),
    casinoRow("higherLowerWon", "higherLowerWon"),
    casinoRow("voidSeerPlayed", "voidSeerPlayed"),
    casinoRow("voidSeerWon", "voidSeerWon"),
  ];
  const cosmicRipRows: readonly StatisticsDisplayRow[] = [
    statRow("cosmicRipTelemetry", statNumber(cosmicRip.telemetryData)),
    statRow("gloryPoints", statNumber(state.permanent.gloryPoints)),
    statRow(
      "cosmicRipSectors",
      `${statNumber(cosmicRip.scannedSectorIndexes.length)} / ${statNumber(COSMIC_RIP_SECTOR_COUNT)}`,
    ),
    statRow(
      "cosmicRipResearch",
      `${statNumber(cosmicRip.researchedTechnologyIds.length)} / ${statNumber(COSMIC_RIP_TECHNOLOGIES.length)}`,
    ),
    statRow(
      "cosmicRipScannerRestored",
      settingsStatisticLabel(locale, cosmicRip.scannerRestored ? "yes" : "no"),
    ),
    statRow("cosmicRipLocated", settingsStatisticLabel(locale, cosmicRip.ripFound ? "yes" : "no")),
    statRow("cosmicRipClosed", settingsStatisticLabel(locale, cosmicRip.closed ? "yes" : "no")),
  ];
  const lifetimeRows: readonly StatisticsDisplayRow[] = [
    statRow("lifetimeCash", money(state.statistics.lifetimeCashEarned)),
    statRow("lifetimeProduction", statNumber(state.statistics.lifetimeGoodsProduced)),
    statRow("acceptedCommands", statNumber(state.statistics.acceptedCommands)),
    statRow("completedTimers", statNumber(state.statistics.completedTimers)),
  ];
  const eventRows: readonly StatisticsDisplayRow[] = RANDOM_EVENT_IDS.map((id) => ({
    label: randomEventName(locale, id),
    currentRun: statNumber(state.run.randomEvents.eventCountsThisRun[id]),
    lifetime: statNumber(state.statistics.lifetimeRandomEventCounts[id]),
  }));
  const resourceProductionRows: readonly StatisticsDisplayRow[] = MATERIAL_IDS.map((id) => ({
    label: economyGoodName(locale, id),
    currentRun: statNumber(state.run.goodsProducedThisRun[id]),
    lifetime: statNumber(state.statistics.lifetimeGoodsProducedByGood[id]),
  }));
  const compoundProductionRows: readonly StatisticsDisplayRow[] = COMPOUND_IDS.map((id) => ({
    label: economyGoodName(locale, id),
    currentRun: statNumber(state.run.goodsProducedThisRun[id]),
    lifetime: statNumber(state.statistics.lifetimeGoodsProducedByGood[id]),
  }));
  const sections: readonly {
    readonly heading: string;
    readonly rows: readonly StatisticsDisplayRow[];
    readonly note?: string;
  }[] = [
    { heading: settingsStatisticLabel(locale, "overviewSection"), rows: overviewRows },
    {
      heading: settingsStatisticLabel(locale, "runSection"),
      rows: runRows,
      note: runApTrackingNote(locale),
    },
    {
      heading: runStatisticLabel(locale, "currentSnapshotSection"),
      rows: snapshotRows,
    },
    {
      heading: settingsSectionName(locale, "events"),
      rows: eventRows,
      note: eventTrackingNote(locale),
    },
    {
      heading: settingsStatisticLabel(locale, "resourcesSection"),
      rows: resourceProductionRows,
    },
    {
      heading: settingsStatisticLabel(locale, "compoundsSection"),
      rows: compoundProductionRows,
    },
    { heading: settingsStatisticLabel(locale, "spaceMiningSection"), rows: spaceMiningRows },
    { heading: settingsStatisticLabel(locale, "interstellarSection"), rows: interstellarRows },
    {
      heading: settingsStatisticLabel(locale, "galacticCasinoSection"),
      rows: galacticCasinoRows,
    },
    {
      heading: settingsStatisticLabel(locale, "cosmicRipChapterSection"),
      rows: cosmicRipRows,
    },
    { heading: settingsStatisticLabel(locale, "lifetime"), rows: lifetimeRows },
  ];

  return (
    <section
      className="settings-library-section"
      aria-labelledby="settings-statistics-heading"
      data-testid="settings-statistics"
    >
      <h3 id="settings-statistics-heading">{settingsSectionName(locale, "statistics")}</h3>
      {sections.map(({ heading, rows, note }) => (
        <section className="settings-stat-section" key={heading}>
          <h4>{heading}</h4>
          {note ? <p className="settings-stat-note">{note}</p> : null}
          <dl className="settings-stat-grid">
            {rows.map((row) => (
              <div className="settings-stat-card" key={row.label}>
                <dt>{row.label}</dt>
                {"value" in row ? (
                  <dd>{row.value}</dd>
                ) : (
                  <dd className="settings-stat-pair-values">
                    <span>
                      <small>{settingsStatisticLabel(locale, "run")}</small>
                      <strong>{row.currentRun}</strong>
                    </span>
                    <span>
                      <small>{settingsStatisticLabel(locale, "lifetime")}</small>
                      <strong>{row.lifetime}</strong>
                    </span>
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </section>
      ))}
    </section>
  );
}
