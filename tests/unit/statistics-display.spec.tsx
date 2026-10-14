import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { COSMIC_RIP_SCANNER_REPAIR_GP, COSMIC_RIP_TECHNOLOGIES } from "../../src/content/cosmicRip";
import { LOCALE_IDS, systemIdForStar, type LocaleId } from "../../src/content/ids";
import { createStarCatalogue, HOME_SYSTEM_NAME } from "../../src/content/starCatalogue";
import { formatNumber } from "../../src/app/numberFormatting";
import { formatDuration } from "../../src/app/timeFormatting";
import { SettingsStatisticsPane } from "../../src/app/SettingsStatisticsPane";
import { transition } from "../../src/engine/commands";
import {
  selectRunApAnticipated,
  selectStatisticsUnlockedTechnologyCount,
} from "../../src/engine/selectors";
import { createInitialGameState, type GameState } from "../../src/engine/state";
import { decodePortable, encodePortable } from "../../src/persistence/codec";
import { makeEnvelope } from "../../src/persistence/schema";
import { settingsStatisticLabel } from "../../src/i18n/settingsMessages";
import { interstellarStatisticLabel } from "../../src/i18n/interstellarStatisticsMessages";
import {
  runStatisticLabel,
  statisticsText,
  statisticsNotApplicableLabel,
} from "../../src/i18n/statisticsMessages";

const sourceLocales = JSON.parse(
  readFileSync(resolve(process.cwd(), "../cosmicForge/cosmicForge/localization.json"), "utf8"),
) as Record<LocaleId, Record<string, string>>;

const sourceAreaStatisticLabels = {
  spaceTelescopeBuilt: "statsSpaceMiningSubHeading1",
  launchPadBuilt: "statsSpaceMiningSubHeading2",
  rocketsBuilt: "statsSpaceMiningSubHeading3",
  asteroidsFound: "statsSpaceMiningSubHeading4",
  asteroidsMined: "statsSpaceMiningSubHeading5",
  casinoPointsSpent: "statsGalacticcasinoSubHeading1",
  doubleOrNothingPlayed: "statsGalacticcasinoSubHeading2",
  doubleOrNothingWon: "statsGalacticcasinoSubHeading3",
  wheelPlayed: "statsGalacticcasinoSubHeading4",
  wheelWon: "statsGalacticcasinoSubHeading5",
  wheelSpecialWon: "statsGalacticcasinoSubHeading6",
  higherLowerPlayed: "statsGalacticcasinoSubHeading7",
  higherLowerWon: "statsGalacticcasinoSubHeading8",
  voidSeerPlayed: "statsGalacticcasinoSubHeading9",
  voidSeerWon: "statsGalacticcasinoSubHeading10",
  cosmicRipGalacticPointsEarned: "statsCosmicripchapterSubHeading1",
  cosmicRipGpSpent: "statsCosmicripchapterSubHeading2",
  cosmicRipTelemetryEarned: "statsCosmicripchapterSubHeading3",
  cosmicRipChapterUnlocked: "statsCosmicripchapterSubHeading4",
  cosmicRipScannerRestored: "statsCosmicripchapterSubHeading5",
  cosmicRipLocated: "statsCosmicripchapterSubHeading6",
  cosmicRipStabilised: "statsCosmicripchapterSubHeading7",
} as const;

function stateWithScannedEncounters(): GameState {
  const initial = createInitialGameState({ pioneerName: "Statistics", seed: 821 });
  const systemIds = Array.from({ length: 6 }, (_, index) => systemIdForStar(821, index + 1));
  const profile = (systemId: (typeof systemIds)[number], ascendencyPoints: number) => ({
    ...initial.run.space.systemProfiles[0]!,
    systemId,
    ascendencyPoints,
  });
  const encounter = (
    systemId: (typeof systemIds)[number],
    civilizationLevel: "industrial" | "spacefaring" | "unsentient" | "none" | "robotic",
  ) => ({ systemId, civilizationLevel }) as GameState["run"]["space"]["systemEncounters"][number];

  return {
    ...initial,
    run: {
      ...initial.run,
      space: {
        ...initial.run.space,
        apAnticipatedThisRun: 21,
        systemProfiles: [
          ...initial.run.space.systemProfiles,
          profile(systemIds[0]!, 8),
          profile(systemIds[1]!, 13),
          profile(systemIds[2]!, 21),
          profile(systemIds[3]!, 34),
          profile(systemIds[4]!, 55),
        ],
        systemEncounters: [
          encounter(systemIds[0]!, "industrial"),
          encounter(systemIds[0]!, "industrial"),
          encounter(systemIds[1]!, "spacefaring"),
          encounter(systemIds[2]!, "unsentient"),
          encounter(systemIds[3]!, "none"),
          encounter(systemIds[4]!, "robotic"),
          encounter(systemIds[5]!, "industrial"),
        ],
      },
    },
  };
}

describe("statistics display parity", () => {
  it("maps and renders the source Statistics introduction in all six locales", () => {
    for (const locale of LOCALE_IDS) {
      const description = statisticsText(locale, "description");
      const state = createInitialGameState({ pioneerName: "Statistics", seed: 821, locale });
      const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);

      expect(description).toBe(sourceLocales[locale].headerDescStatistics);
      expect(markup).toContain(`<p class="pane-intro">${description}</p>`);
    }
  });

  it("maps Space Mining, Galactic Casino, and Cosmic Rip row labels to their source subheadings in all six locales", () => {
    for (const locale of LOCALE_IDS) {
      const state = createInitialGameState({ pioneerName: "Statistics", seed: 821, locale });
      const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);

      for (const [rowId, sourceKey] of Object.entries(sourceAreaStatisticLabels)) {
        const rowStart = markup.indexOf(`data-statistic-id="${rowId}"`);
        const termStart = markup.indexOf("<dt>", rowStart);
        const termEnd = markup.indexOf("</dt>", termStart);
        expect(rowStart, `${locale} row ${rowId} is present`).toBeGreaterThanOrEqual(0);
        expect(termStart, `${locale} row ${rowId} has a label`).toBeGreaterThan(rowStart);
        expect(termEnd, `${locale} row ${rowId} label closes`).toBeGreaterThan(termStart);

        const renderedLabel = markup
          .slice(termStart + "<dt>".length, termEnd)
          .replace(/<[^>]+>/g, "");
        expect(renderedLabel, `${locale} row ${rowId} maps to ${sourceKey}`).toBe(
          sourceLocales[locale][sourceKey],
        );
      }
    }
  });

  it("renders Space Mining build status with the source run and lifetime scopes in all locales", () => {
    const sourceStatusRow = (markup: string, id: string) => {
      const start = markup.indexOf(`data-statistic-id="${id}"`);
      const end = markup.indexOf("</div>", start);
      expect(start).toBeGreaterThanOrEqual(0);
      expect(end).toBeGreaterThan(start);
      return markup.slice(start, end);
    };

    for (const locale of LOCALE_IDS) {
      const fresh = createInitialGameState({ pioneerName: "Statistics", seed: 821, locale });
      const freshMarkup = renderToStaticMarkup(<SettingsStatisticsPane state={fresh} />);
      const statusPairs = [
        ["spaceTelescopeBuilt", "no"],
        ["launchPadBuilt", "no"],
      ] as const;
      for (const [id, expectedStatus] of statusPairs) {
        const row = sourceStatusRow(freshMarkup, id);
        expect(row).toContain(
          `<dd class="settings-stat-pair-values"><span><small>${settingsStatisticLabel(locale, "run")}</small><strong>${settingsStatisticLabel(locale, expectedStatus)}</strong></span><span><small>${settingsStatisticLabel(locale, "lifetime")}</small><strong>${statisticsNotApplicableLabel(locale)}</strong></span></dd>`,
        );
      }

      const built: GameState = {
        ...fresh,
        run: {
          ...fresh.run,
          space: { ...fresh.run.space, telescopeBuilt: true, launchPadBuilt: true },
        },
      };
      const builtMarkup = renderToStaticMarkup(<SettingsStatisticsPane state={built} />);
      for (const [id] of statusPairs) {
        const row = sourceStatusRow(builtMarkup, id);
        expect(row).toContain(
          `<dd class="settings-stat-pair-values"><span><small>${settingsStatisticLabel(locale, "run")}</small><strong>${settingsStatisticLabel(locale, "yes")}</strong></span><span><small>${settingsStatisticLabel(locale, "lifetime")}</small><strong>${statisticsNotApplicableLabel(locale)}</strong></span></dd>`,
        );
      }
    }
  });

  it("renders Space Mining build status with the source run and lifetime scopes in all locales", () => {
    const sourceStatusRow = (markup: string, id: string) => {
      const start = markup.indexOf(`data-statistic-id="${id}"`);
      const end = markup.indexOf("</div>", start);
      expect(start).toBeGreaterThanOrEqual(0);
      expect(end).toBeGreaterThan(start);
      return markup.slice(start, end);
    };

    for (const locale of LOCALE_IDS) {
      const fresh = createInitialGameState({ pioneerName: "Statistics", seed: 821, locale });
      const freshMarkup = renderToStaticMarkup(<SettingsStatisticsPane state={fresh} />);
      const statusPairs = [
        ["spaceTelescopeBuilt", "no"],
        ["launchPadBuilt", "no"],
      ] as const;
      for (const [id, expectedStatus] of statusPairs) {
        const row = sourceStatusRow(freshMarkup, id);
        expect(row).toContain(
          `<dd class="settings-stat-pair-values"><span><small>${settingsStatisticLabel(locale, "run")}</small><strong>${settingsStatisticLabel(locale, expectedStatus)}</strong></span><span><small>${settingsStatisticLabel(locale, "lifetime")}</small><strong>${statisticsNotApplicableLabel(locale)}</strong></span></dd>`,
        );
      }

      const built: GameState = {
        ...fresh,
        run: {
          ...fresh.run,
          space: { ...fresh.run.space, telescopeBuilt: true, launchPadBuilt: true },
        },
      };
      const builtMarkup = renderToStaticMarkup(<SettingsStatisticsPane state={built} />);
      for (const [id] of statusPairs) {
        const row = sourceStatusRow(builtMarkup, id);
        expect(row).toContain(
          `<dd class="settings-stat-pair-values"><span><small>${settingsStatisticLabel(locale, "run")}</small><strong>${settingsStatisticLabel(locale, "yes")}</strong></span><span><small>${settingsStatisticLabel(locale, "lifetime")}</small><strong>${statisticsNotApplicableLabel(locale)}</strong></span></dd>`,
        );
      }
    }
  });

  it("shows the source AP Gain counter separately from all earned AP and the current balance", () => {
    const initial = createInitialGameState({ pioneerName: "Statistics", seed: 821 });
    const state: GameState = {
      ...initial,
      permanent: { ...initial.permanent, ascendencyPoints: 19 },
      statistics: {
        ...initial.statistics,
        lifetimeAscendencyPointsGained: 127,
        lifetimeSourceApGain: 5,
      },
    };
    const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);
    const rowValue = (id: string) => {
      const rowStart = markup.indexOf(`data-statistic-id="${id}"`);
      const valueStart = markup.indexOf("<dd>", rowStart);
      const valueEnd = markup.indexOf("</dd>", valueStart);
      expect(rowStart).toBeGreaterThanOrEqual(0);
      expect(valueStart).toBeGreaterThan(rowStart);
      expect(valueEnd).toBeGreaterThan(valueStart);
      return markup.slice(valueStart + "<dd>".length, valueEnd);
    };

    expect(rowValue("apGain")).toBe("5");
    expect(rowValue("ascendencyPoints")).toBe("19");
  });

  it("shows Overview Run as one plus the rebirth count and preserves it on save restore", () => {
    const initial = createInitialGameState({ pioneerName: "Statistics", seed: 821 });
    const runNumber = (state: GameState) => {
      const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);
      const rowStart = markup.indexOf('data-statistic-id="runNumber"');
      const valueStart = markup.indexOf("<dd>", rowStart);
      const valueEnd = markup.indexOf("</dd>", valueStart);
      expect(rowStart).toBeGreaterThanOrEqual(0);
      expect(valueStart).toBeGreaterThan(rowStart);
      expect(valueEnd).toBeGreaterThan(valueStart);
      return markup.slice(valueStart + "<dd>".length, valueEnd);
    };
    expect(runNumber(initial)).toBe("1");

    const nextSystem = createStarCatalogue().find((star) => !star.initiallySettled)!;
    const rebirthReady: GameState = {
      ...initial,
      run: {
        ...initial.run,
        space: { ...initial.run.space, ascendencyAwardedThisRun: true },
      },
      permanent: {
        ...initial.permanent,
        settledSystemIds: [...initial.permanent.settledSystemIds, nextSystem.id],
      },
    };
    const rebirthed = transition(rebirthReady, { type: "meta.rebirth" });
    expect(rebirthed.accepted).toBe(true);
    expect(rebirthed.state.permanent.rebirthCount).toBe(1);
    expect(runNumber(rebirthed.state)).toBe("2");

    const saved = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000821",
      pioneerName: "Statistics",
      createdAt: 10,
      savedAt: 20,
      revision: 1,
      state: rebirthed.state,
    });
    const restored = decodePortable(encodePortable(saved)).state;
    expect(restored.permanent.rebirthCount).toBe(1);
    expect(runNumber(restored)).toBe("2");
  });

  it("renders Time Played from active time and Run Time from simulation time", () => {
    const initial = createInitialGameState({ pioneerName: "Statistics", seed: 821 });
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        clock: { ...initial.run.clock, simulationMs: 7_000 },
      },
      statistics: { ...initial.statistics, lifetimeActiveMs: 2_000 },
    };
    const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);
    const rowValue = (id: string) => {
      const rowStart = markup.indexOf(`data-statistic-id="${id}"`);
      const valueStart = markup.indexOf("<dd>", rowStart);
      const valueEnd = markup.indexOf("</dd>", valueStart);
      expect(rowStart).toBeGreaterThanOrEqual(0);
      expect(valueStart).toBeGreaterThan(rowStart);
      expect(valueEnd).toBeGreaterThan(valueStart);
      return markup.slice(valueStart + "<dd>".length, valueEnd);
    };

    expect(rowValue("activeTime")).toBe(
      formatDuration("en", state.statistics.lifetimeActiveMs, state.settings.notation),
    );
    expect(rowValue("runTime")).toBe(
      formatDuration("en", state.run.clock.simulationMs, state.settings.notation),
    );
  });

  it("renders Unique News Tickers Seen from the distinct seen-ID list", () => {
    const initial = createInitialGameState({ pioneerName: "Statistics", seed: 821 });
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        newsTicker: { ...initial.run.newsTicker, seenIds: [1000, 1001] },
      },
    };
    const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);
    const rowStart = markup.indexOf('data-statistic-id="uniqueNewsTickers"');
    const valueStart = markup.indexOf("<dd>", rowStart);
    const valueEnd = markup.indexOf("</dd>", valueStart);

    expect(rowStart).toBeGreaterThanOrEqual(0);
    expect(valueStart).toBeGreaterThan(rowStart);
    expect(valueEnd).toBeGreaterThan(valueStart);
    expect(markup.slice(valueStart + "<dd>".length, valueEnd)).toBe("2");
  });

  it("renders zero Enemy Total Defence Remaining when no destination encounter exists", () => {
    const initial = createInitialGameState({ pioneerName: "Statistics", seed: 821 });
    const markup = renderToStaticMarkup(<SettingsStatisticsPane state={initial} />);
    const rowStart = markup.indexOf('data-statistic-id="enemyDefenceRemaining"');
    const pairStart = markup.indexOf('<dd class="settings-stat-pair-values"', rowStart);
    const valueEnd = markup.indexOf("</dd>", pairStart);
    const values = Array.from(
      markup.slice(pairStart, valueEnd).matchAll(/<strong>(.*?)<\/strong>/g),
      ([, value]) => value,
    );

    expect(rowStart).toBeGreaterThanOrEqual(0);
    expect(pairStart).toBeGreaterThan(rowStart);
    expect(valueEnd).toBeGreaterThan(pairStart);
    expect(values).toEqual(["0", interstellarStatisticLabel("en", "notApplicable")]);
  });

  it("renders Overview Antimatter Mined from the lifetime total", () => {
    const initial = createInitialGameState({ pioneerName: "Statistics", seed: 821 });
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        space: {
          ...initial.run.space,
          antimatter: 4_321,
          antimatterMinedThisRun: 500,
        },
      },
      statistics: { ...initial.statistics, lifetimeAntimatterMined: 1_234 },
    };
    const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);
    const rowStart = markup.indexOf('data-statistic-id="lifetimeAntimatter"');
    const valueStart = markup.indexOf("<dd>", rowStart);
    const valueEnd = markup.indexOf("</dd>", valueStart);

    expect(rowStart).toBeGreaterThanOrEqual(0);
    expect(valueStart).toBeGreaterThan(rowStart);
    expect(valueEnd).toBeGreaterThan(valueStart);
    expect(markup.slice(valueStart + "<dd>".length, valueEnd)).toBe(
      formatNumber("en", 1_234, 0, state.settings.notation),
    );
  });

  it("renders Overview Total Asteroids Discovered from its lifetime counter, apart from run and legendary counts", () => {
    const initial = createInitialGameState({ pioneerName: "Statistics", seed: 821 });
    const currentRunAsteroids = Array.from({ length: 3 }, (_, index) => ({
      id: `statistics-run-asteroid-${index + 1}`,
      name: `Run asteroid ${index + 1}`,
      systemId: systemIdForStar(821, 1),
      distance: 100 + index,
      rarity: "common" as const,
      extractionEase: 1,
      remainingAntimatter: 100,
      totalAntimatter: 100,
      reservedBy: null,
      depleted: false,
      interacted: false,
    }));
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        space: {
          ...initial.run.space,
          asteroids: currentRunAsteroids,
          nextAsteroidSequence: currentRunAsteroids.length + 1,
        },
      },
      statistics: {
        ...initial.statistics,
        lifetimeAsteroidsDiscovered: 8_765,
        lifetimeLegendaryAsteroidsDiscovered: 1_234,
      },
    };
    const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);
    const cardValue = (id: string) => {
      const rowStart = markup.indexOf(`data-statistic-id="${id}"`);
      const valueStart = markup.indexOf("<dd>", rowStart);
      const valueEnd = markup.indexOf("</dd>", valueStart);

      expect(rowStart).toBeGreaterThanOrEqual(0);
      expect(valueStart).toBeGreaterThan(rowStart);
      expect(valueEnd).toBeGreaterThan(valueStart);
      return markup.slice(valueStart + "<dd>".length, valueEnd);
    };
    const pairedValues = (id: string) => {
      const rowStart = markup.indexOf(`data-statistic-id="${id}"`);
      const pairStart = markup.indexOf('<dd class="settings-stat-pair-values"', rowStart);
      const valueEnd = markup.indexOf("</dd>", pairStart);

      expect(rowStart).toBeGreaterThanOrEqual(0);
      expect(pairStart).toBeGreaterThan(rowStart);
      expect(valueEnd).toBeGreaterThan(pairStart);
      return Array.from(
        markup.slice(pairStart, valueEnd).matchAll(/<strong>(.*?)<\/strong>/g),
        ([, value]) => value,
      );
    };

    expect(state.settings.notation).toBe("condensed");
    expect(state.run.space.asteroids).toHaveLength(3);
    expect(state.run.space.nextAsteroidSequence - 1).toBe(3);
    expect(state.statistics.lifetimeLegendaryAsteroidsDiscovered).toBe(1_234);
    expect(cardValue("totalAsteroids")).toBe("8.7K");
    expect(cardValue("legendaryAsteroids")).toBe(formatNumber("en", 1_234, 0, "condensed"));
    expect(pairedValues("asteroidsFound")).toEqual(["3", "8.7K"]);
  });

  it("renders Overview Rockets Launched from the lifetime counter independently of current rocket state", () => {
    const initial = createInitialGameState({ pioneerName: "Statistics", seed: 821 });
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        space: {
          ...initial.run.space,
          rockets: {
            ...initial.run.space.rockets,
            rocket1: {
              ...initial.run.space.rockets.rocket1,
              phase: "outbound",
              targetAsteroidId: "current-run-target",
              journeyCount: 1,
            },
          },
        },
      },
      statistics: { ...initial.statistics, lifetimeRocketsLaunched: 1_234 },
    };
    const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);
    const cardStart = markup.indexOf('data-statistic-id="rocketsLaunched"');
    const valueStart = markup.indexOf("<dd>", cardStart);
    const valueEnd = markup.indexOf("</dd>", valueStart);

    expect(cardStart).toBeGreaterThanOrEqual(0);
    expect(valueStart).toBeGreaterThan(cardStart);
    expect(valueEnd).toBeGreaterThan(valueStart);
    expect(state.run.space.rockets.rocket1.phase).toBe("outbound");
    expect(state.run.space.rockets.rocket1.journeyCount).toBe(1);
    expect(markup.slice(valueStart + "<dd>".length, valueEnd)).toBe("1.2K");
  });

  it("reads AP anticipated from the persisted current-run counter", () => {
    expect(selectRunApAnticipated(stateWithScannedEncounters())).toBe(21);
  });

  it("counts source synthetic technology markers from the current run", () => {
    const initial = createInitialGameState({ pioneerName: "Statistics", seed: 821 });
    expect(selectStatisticsUnlockedTechnologyCount(initial)).toBe(0);

    const withSourceMarkers: GameState = {
      ...initial,
      run: {
        ...initial.run,
        economy: { ...initial.run.economy, researchedTechnologies: ["knowledgeSharing"] },
        sourceSyntheticTechnologyMarkersThisRun: 2,
      },
      permanent: {
        ...initial.permanent,
        cosmicRip: { ...initial.permanent.cosmicRip, unlocked: true },
      },
    };
    expect(selectStatisticsUnlockedTechnologyCount(withSourceMarkers)).toBe(4);
  });

  it("matches the Cosmic Rip Chapter Unlock row when the endgame story completes", () => {
    const initial = createInitialGameState({ pioneerName: "Statistics", seed: 821 });
    const chapterCard = (state: GameState) => {
      const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);
      const cardStart = markup.indexOf('data-statistic-id="cosmicRipChapterUnlocked"');
      const cardEnd = markup.indexOf("</div>", cardStart);
      return markup.slice(cardStart, cardEnd + "</div>".length);
    };
    const chapterLabel = settingsStatisticLabel("en", "cosmicRipChapterUnlocked");
    const noLabel = settingsStatisticLabel("en", "no");
    const yesLabel = settingsStatisticLabel("en", "yes");

    const lockedCard = chapterCard(initial);
    expect(lockedCard).toContain(`<dt>${chapterLabel}</dt>`);
    expect(lockedCard).toContain(`<strong>${noLabel}</strong>`);
    expect(lockedCard).not.toContain('href="#tab-cosmic-rip-situation"');

    const storyPending: GameState = {
      ...initial,
      permanent: {
        ...initial.permanent,
        megastructures: {
          ...initial.permanent.megastructures,
          miaplacidusStoryPending: true,
        },
      },
    };
    const beforeAcknowledgement = chapterCard(storyPending);
    expect(beforeAcknowledgement).toContain(`<strong>${noLabel}</strong>`);
    expect(beforeAcknowledgement).not.toContain('href="#tab-cosmic-rip-situation"');

    const acknowledged = transition(storyPending, { type: "meta.miaplacidus-story.acknowledge" });
    expect(acknowledged.accepted).toBe(true);
    const availableCard = chapterCard(acknowledged.state);
    expect(availableCard).toContain(`<a href="#tab-cosmic-rip-situation">${chapterLabel}</a>`);
    expect(availableCard).toContain(`<strong>${yesLabel}</strong>`);
  });

  it("marks Cosmic Rip Stabilised only after every source technology is researched", () => {
    const initial = createInitialGameState({ pioneerName: "Statistics", seed: 821 });
    const stabilisedCard = (
      researchedTechnologyIds: GameState["permanent"]["cosmicRip"]["researchedTechnologyIds"],
    ) => {
      const state: GameState = {
        ...initial,
        permanent: {
          ...initial.permanent,
          cosmicRip: {
            ...initial.permanent.cosmicRip,
            unlocked: true,
            researchedTechnologyIds,
          },
        },
      };
      const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);
      const cardStart = markup.indexOf('data-statistic-id="cosmicRipStabilised"');
      const cardEnd = markup.indexOf("</div>", cardStart);
      return markup.slice(cardStart, cardEnd + "</div>".length);
    };
    const notApplicable = statisticsNotApplicableLabel("en");
    const no = settingsStatisticLabel("en", "no");
    const yes = settingsStatisticLabel("en", "yes");

    const fourOfFive = stabilisedCard(COSMIC_RIP_TECHNOLOGIES.slice(0, -1).map(({ id }) => id));
    expect(fourOfFive).toContain(`<strong>${notApplicable}</strong>`);
    expect(fourOfFive).toContain(`<strong>${no}</strong>`);

    const allFive = stabilisedCard(COSMIC_RIP_TECHNOLOGIES.map(({ id }) => id));
    expect(allFive).toContain(`<strong>${notApplicable}</strong>`);
    expect(allFive).toContain(`<strong>${yes}</strong>`);
  });

  it("shows Cosmic Rip Located as a lifetime flag after the matching sector scan", () => {
    const initial = createInitialGameState({ pioneerName: "Statistics", seed: 821 });
    const readyToScan: GameState = {
      ...initial,
      permanent: {
        ...initial.permanent,
        gloryPoints: 2,
        cosmicRip: {
          ...initial.permanent.cosmicRip,
          unlocked: true,
          scannerRestored: true,
          ripLocationSectorIndex: 1,
        },
      },
    };
    const locatedCard = (state: GameState) => {
      const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);
      const cardStart = markup.indexOf('data-statistic-id="cosmicRipLocated"');
      const cardEnd = markup.indexOf("</div>", cardStart);
      return markup.slice(cardStart, cardEnd + "</div>".length);
    };
    const label = settingsStatisticLabel("en", "cosmicRipLocated");
    const no = settingsStatisticLabel("en", "no");
    const yes = settingsStatisticLabel("en", "yes");
    const notApplicable = statisticsNotApplicableLabel("en");

    const beforeScan = locatedCard(readyToScan);
    expect(beforeScan).toContain(`<a href="#tab-cosmic-rip-scanner-array">${label}</a>`);
    expect(beforeScan).toContain(`<strong>${notApplicable}</strong>`);
    expect(beforeScan).toContain(`<strong>${no}</strong>`);

    const wrongSector = transition(readyToScan, {
      type: "cosmic-rip.sector.scan",
      sectorIndex: 0,
    });
    expect(wrongSector.accepted).toBe(true);
    expect(locatedCard(wrongSector.state)).toContain(`<strong>${no}</strong>`);

    const found = transition(wrongSector.state, {
      type: "cosmic-rip.sector.scan",
      sectorIndex: 1,
    });
    expect(found.accepted).toBe(true);
    const afterFind = locatedCard(found.state);
    expect(afterFind).toContain(`<strong>${notApplicable}</strong>`);
    expect(afterFind).toContain(`<strong>${yes}</strong>`);
  });

  it("shows Near Space Scanner Array Restored after the repair command succeeds", () => {
    const initial = createInitialGameState({ pioneerName: "Statistics", seed: 821 });
    const homeSystemId = createStarCatalogue().find((star) => star.name === HOME_SYSTEM_NAME)!.id;
    const readyToRestore: GameState = {
      ...initial,
      permanent: {
        ...initial.permanent,
        gloryPoints: COSMIC_RIP_SCANNER_REPAIR_GP,
        settledSystemIds: [...initial.permanent.settledSystemIds, homeSystemId],
        cosmicRip: { ...initial.permanent.cosmicRip, unlocked: true },
      },
    };
    const restoredCard = (state: GameState) => {
      const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);
      const cardStart = markup.indexOf('data-statistic-id="cosmicRipScannerRestored"');
      const cardEnd = markup.indexOf("</div>", cardStart);
      return markup.slice(cardStart, cardEnd + "</div>".length);
    };
    const label = settingsStatisticLabel("en", "cosmicRipScannerRestored");
    const no = settingsStatisticLabel("en", "no");
    const yes = settingsStatisticLabel("en", "yes");
    const notApplicable = statisticsNotApplicableLabel("en");

    const beforeRestore = restoredCard(readyToRestore);
    expect(beforeRestore).toContain(`<a href="#tab-cosmic-rip-situation">${label}</a>`);
    expect(beforeRestore).toContain(`<strong>${notApplicable}</strong>`);
    expect(beforeRestore).toContain(`<strong>${no}</strong>`);

    const restored = transition(readyToRestore, { type: "cosmic-rip.scanner.restore" });
    expect(restored.accepted).toBe(true);
    const afterRestore = restoredCard(restored.state);
    expect(afterRestore).toContain(`<strong>${notApplicable}</strong>`);
    expect(afterRestore).toContain(`<strong>${yes}</strong>`);
  });

  it("localizes Research history rows, AP anticipated, unlocked techs, and Cosmic Rip flags", () => {
    const scanned = stateWithScannedEncounters();
    const completedRipState: GameState = {
      ...scanned,
      run: {
        ...scanned.run,
        economy: {
          ...scanned.run.economy,
          researchedTechnologies: ["basicPowerGeneration", "knowledgeSharing"],
        },
      },
      permanent: {
        ...scanned.permanent,
        cosmicRip: {
          ...scanned.permanent.cosmicRip,
          unlocked: true,
          scannerRestored: true,
          ripFound: true,
          researchedTechnologyIds: COSMIC_RIP_TECHNOLOGIES.map(({ id }) => id),
          closed: false,
        },
      },
    };

    for (const locale of LOCALE_IDS) {
      const state: GameState = {
        ...completedRipState,
        settings: { ...completedRipState.settings, locale },
      };
      const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />).replaceAll(
        "&#x27;",
        "'",
      );
      const card = (label: string, value: string) => `<dt>${label}</dt><dd>${value}</dd>`;
      const linkedCard = (paneId: string, label: string, value: string) =>
        `<dt><a href="#tab-${paneId}">${label}</a></dt><dd>${value}</dd>`;
      const linkedPairCard = (paneId: string, label: string, lifetime: string) =>
        `<dt><a href="#tab-${paneId}">${label}</a></dt><dd class="settings-stat-pair-values"><span><small>${settingsStatisticLabel(locale, "run")}</small><strong>${statisticsNotApplicableLabel(locale)}</strong></span><span><small>${settingsStatisticLabel(locale, "lifetime")}</small><strong>${lifetime}</strong></span></dd>`;
      const linkedRunLifetimeCard = (paneId: string, label: string, value: string) =>
        `<dt><a href="#tab-${paneId}">${label}</a></dt><dd class="settings-stat-pair-values"><span><small>${settingsStatisticLabel(locale, "run")}</small><strong>${value}</strong></span><span><small>${settingsStatisticLabel(locale, "lifetime")}</small><strong>${value}</strong></span></dd>`;

      expect(markup).toContain(
        linkedRunLifetimeCard(
          "research-tech-tree",
          settingsStatisticLabel(locale, "techsUnlocked"),
          "3",
        ),
      );
      for (const id of [
        "researchPointsEarned",
        "scienceKitsBuilt",
        "scienceClubsBuilt",
        "scienceLabsBuilt",
      ] as const) {
        expect(markup).toContain(
          `<dt><a href="#tab-research-science-buildings">${settingsStatisticLabel(locale, id)}</a></dt>`,
        );
      }
      expect(markup).toContain(
        linkedPairCard(
          "cosmic-rip-situation",
          settingsStatisticLabel(locale, "cosmicRipChapterUnlocked"),
          settingsStatisticLabel(locale, "yes"),
        ),
      );
      expect(markup).toContain(
        linkedPairCard(
          "cosmic-rip-situation",
          settingsStatisticLabel(locale, "cosmicRipGpSpent"),
          "0",
        ),
      );
      expect(markup).toContain(
        linkedPairCard(
          "cosmic-rip-situation",
          settingsStatisticLabel(locale, "cosmicRipTelemetryEarned"),
          "0",
        ),
      );
      expect(markup).toContain(
        linkedPairCard(
          "cosmic-rip-situation",
          settingsStatisticLabel(locale, "cosmicRipScannerRestored"),
          settingsStatisticLabel(locale, "yes"),
        ),
      );
      expect(markup).toContain(
        linkedPairCard(
          "cosmic-rip-scanner-array",
          settingsStatisticLabel(locale, "cosmicRipLocated"),
          settingsStatisticLabel(locale, "yes"),
        ),
      );
      expect(markup).toContain(
        `<dt><a href="#tab-cosmic-rip-situation">${settingsStatisticLabel(locale, "cosmicRipGalacticPointsEarned")}</a></dt>`,
      );
      expect(markup).toContain(
        linkedPairCard(
          "cosmic-rip-rip",
          settingsStatisticLabel(locale, "cosmicRipStabilised"),
          settingsStatisticLabel(locale, "yes"),
        ),
      );
      expect(markup).toContain(
        linkedCard(
          "cosmic-rip-rip",
          settingsStatisticLabel(locale, "cosmicRipClosed"),
          settingsStatisticLabel(locale, "no"),
        ),
      );
      expect(markup).toContain(card(runStatisticLabel(locale, "apAnticipated"), "21"));
      expect(markup).not.toContain("AP anticipated is not tracked separately");
      const cosmicRipLinks: readonly [string, string][] = [
        [settingsStatisticLabel(locale, "cosmicRipGalacticPointsEarned"), "cosmic-rip-situation"],
        [settingsStatisticLabel(locale, "cosmicRipTelemetry"), "cosmic-rip-situation"],
        [settingsStatisticLabel(locale, "gloryPoints"), "cosmic-rip-situation"],
        [settingsStatisticLabel(locale, "cosmicRipGpSpent"), "cosmic-rip-situation"],
        [settingsStatisticLabel(locale, "cosmicRipTelemetryEarned"), "cosmic-rip-situation"],
        [settingsStatisticLabel(locale, "cosmicRipSectors"), "cosmic-rip-scanner-array"],
        [settingsStatisticLabel(locale, "cosmicRipResearch"), "cosmic-rip-rip"],
        [settingsStatisticLabel(locale, "cosmicRipChapterUnlocked"), "cosmic-rip-situation"],
        [settingsStatisticLabel(locale, "cosmicRipScannerRestored"), "cosmic-rip-situation"],
        [settingsStatisticLabel(locale, "cosmicRipLocated"), "cosmic-rip-scanner-array"],
        [settingsStatisticLabel(locale, "cosmicRipStabilised"), "cosmic-rip-rip"],
        [settingsStatisticLabel(locale, "cosmicRipClosed"), "cosmic-rip-rip"],
      ];
      for (const [label, ownerPaneId] of cosmicRipLinks) {
        expect(markup).toContain(`<a href="#tab-${ownerPaneId}">${label}</a>`);
      }
    }
  });

  it("shows source Galactic Points Earned first with Not Applicable and the settled-system proxy", () => {
    const initial = createInitialGameState({ pioneerName: "Statistics", seed: 821 });
    const startingSystemId = initial.permanent.settledSystemIds[0]!;
    const samples = [
      {
        settledSystemIds: [startingSystemId],
        ascendencyAwardedThisRun: false,
        destinationSystemId: null,
        expected: "0",
      },
      {
        settledSystemIds: [startingSystemId, systemIdForStar(821, 1)],
        ascendencyAwardedThisRun: true,
        destinationSystemId: systemIdForStar(821, 1),
        expected: "0",
      },
      {
        settledSystemIds: [startingSystemId, systemIdForStar(821, 1)],
        ascendencyAwardedThisRun: false,
        destinationSystemId: null,
        expected: "1",
      },
      {
        settledSystemIds: [
          startingSystemId,
          systemIdForStar(821, 1),
          systemIdForStar(821, 2),
          systemIdForStar(821, 3),
        ],
        ascendencyAwardedThisRun: true,
        destinationSystemId: systemIdForStar(821, 3),
        expected: "2",
      },
      {
        settledSystemIds: [
          startingSystemId,
          systemIdForStar(821, 1),
          systemIdForStar(821, 2),
          systemIdForStar(821, 3),
        ],
        ascendencyAwardedThisRun: false,
        destinationSystemId: null,
        expected: "3",
      },
    ];
    const sourceRowIds = [
      "cosmicRipGalacticPointsEarned",
      "cosmicRipGpSpent",
      "cosmicRipTelemetryEarned",
      "cosmicRipChapterUnlocked",
      "cosmicRipScannerRestored",
      "cosmicRipLocated",
      "cosmicRipStabilised",
    ];
    const liveRowIds = [
      "cosmicRipTelemetry",
      "gloryPoints",
      "cosmicRipSectors",
      "cosmicRipResearch",
      "cosmicRipClosed",
    ];

    for (const locale of LOCALE_IDS) {
      for (const sample of samples) {
        const state: GameState = {
          ...initial,
          run: {
            ...initial.run,
            space: {
              ...initial.run.space,
              ascendencyAwardedThisRun: sample.ascendencyAwardedThisRun,
              starship: {
                ...initial.run.space.starship,
                destinationSystemId: sample.destinationSystemId,
              },
            },
          },
          permanent: { ...initial.permanent, settledSystemIds: sample.settledSystemIds },
          settings: { ...initial.settings, locale },
        };
        const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />).replaceAll(
          "&#x27;",
          "'",
        );
        const sourceHeading = `<h3>${settingsStatisticLabel(locale, "cosmicRipChapterSection")}</h3>`;
        const liveHeading = `<h3>${settingsStatisticLabel(locale, "cosmicRipLiveStatusSection")}</h3>`;
        const lifetimeHeading = `<h3>${settingsStatisticLabel(locale, "lifetime")}</h3>`;
        const sourceStart = markup.indexOf(sourceHeading);
        const liveStart = markup.indexOf(liveHeading);
        const lifetimeStart = markup.indexOf(lifetimeHeading, liveStart);
        expect(sourceStart).toBeGreaterThanOrEqual(0);
        expect(liveStart).toBeGreaterThan(sourceStart);
        expect(lifetimeStart).toBeGreaterThan(liveStart);

        const sourceMarkup = markup.slice(sourceStart, liveStart);
        const liveMarkup = markup.slice(liveStart, lifetimeStart);
        expect(
          Array.from(sourceMarkup.matchAll(/data-statistic-id="([^"]+)"/g), (match) => match[1]),
        ).toEqual(sourceRowIds);
        expect(
          Array.from(liveMarkup.matchAll(/data-statistic-id="([^"]+)"/g), (match) => match[1]),
        ).toEqual(liveRowIds);
        expect(sourceMarkup).toContain(
          `<dt>${settingsStatisticLabel(locale, "cosmicRipGalacticPointsEarned")}</dt><dd class="settings-stat-pair-values"><span><small>${settingsStatisticLabel(locale, "run")}</small><strong>${statisticsNotApplicableLabel(locale)}</strong></span><span><small>${settingsStatisticLabel(locale, "lifetime")}</small><strong>${sample.expected}</strong></span></dd>`,
        );
      }
    }
  });

  it("does not link Cosmic Rip Statistics to a locked tab", () => {
    const markup = renderToStaticMarkup(
      <SettingsStatisticsPane state={stateWithScannedEncounters()} />,
    );

    expect(markup).not.toContain('href="#tab-cosmic-rip-');
  });
});
