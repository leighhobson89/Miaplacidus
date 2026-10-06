import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { STARSHIP_MODULES, STARSHIP_MODULE_IDS } from "../../src/content/space";
import { LOCALE_IDS } from "../../src/content/ids";
import { createStarCatalogue, findStarByName } from "../../src/content/starCatalogue";
import { enemyFleetPower } from "../../src/engine/fleetMechanics";
import { SettingsStatisticsPane } from "../../src/app/SettingsStatisticsPane";
import { createInitialGameState, type GameState } from "../../src/engine/state";
import { generateStarSystemEncounter } from "../../src/engine/starSystemEncounters";
import { selectInterstellarStatistics } from "../../src/engine/selectors";
import { formatNumber } from "../../src/app/numberFormatting";
import { settingsStatisticLabel } from "../../src/i18n/settingsMessages";
import {
  interstellarStatisticLabel,
  interstellarStatisticsTrackingNote,
  type InterstellarStatisticId,
} from "../../src/i18n/interstellarStatisticsMessages";

const interstellarRowIds = [
  "starStudyRange",
  "starShipBuilt",
  "starshipDistanceTravelled",
  "systemScanned",
  "fleetAttackStrength",
  "envoy",
  "scout",
  "marauder",
  "landStalker",
  "navalStrafer",
  "enemy",
  "enemyDefenceOvercome",
  "enemyDefenceRemaining",
  "apFromStarVoyage",
  "blackHoleDiscovered",
  "blackHoleAlwaysActive",
  "blackHoleStrength",
] as const satisfies readonly InterstellarStatisticId[];

const ownerPaneByInterstellarStatistic = {
  starStudyRange: "interstellar-star-map",
  starShipBuilt: "interstellar-starship",
  starshipDistanceTravelled: "interstellar-starship",
  systemScanned: "interstellar-colonise",
  fleetAttackStrength: "interstellar-fleet-hangar",
  envoy: "interstellar-fleet-hangar",
  scout: "interstellar-fleet-hangar",
  marauder: "interstellar-fleet-hangar",
  landStalker: "interstellar-fleet-hangar",
  navalStrafer: "interstellar-fleet-hangar",
  enemy: "interstellar-colonise",
  enemyDefenceOvercome: "interstellar-colonise",
  enemyDefenceRemaining: "interstellar-colonise",
  apFromStarVoyage: "interstellar-star-map",
  blackHoleDiscovered: "galactic-black-hole",
  blackHoleAlwaysActive: "galactic-black-hole",
  blackHoleStrength: "galactic-black-hole",
} satisfies Record<(typeof interstellarRowIds)[number], string>;

function allInterstellarOwnersAvailableState(): GameState {
  const initial = createInitialGameState({ pioneerName: "Interstellar Owners", seed: 995 });
  const destination = findStarByName(createStarCatalogue(), "Sirius")!;
  const encounter = {
    ...generateStarSystemEncounter(destination, false),
    civilizationLevel: "industrial" as const,
  };
  const modules = Object.fromEntries(
    STARSHIP_MODULE_IDS.map((id) => [id, { builtParts: STARSHIP_MODULES[id].parts }]),
  ) as GameState["run"]["space"]["starshipModules"];
  return {
    ...initial,
    run: {
      ...initial.run,
      economy: {
        ...initial.run.economy,
        researchedTechnologies: ["stellarCartography", "orbitalConstruction"],
      },
      space: {
        ...initial.run.space,
        starStudyRange: 123.45,
        starshipDistanceTravelledThisRun: 12.5,
        systemProfiles: [
          ...initial.run.space.systemProfiles.filter(({ systemId }) => systemId !== destination.id),
          {
            ...initial.run.space.systemProfiles[0]!,
            systemId: destination.id,
            ascendencyPoints: 19,
          },
        ],
        systemEncounters: [encounter],
        fleetEnvoyBuilt: true,
        playerFleets: { scout: 2, marauder: 3, landStalker: 4, navalStrafer: 5 },
        playerFleetCombatTotals: {
          scout: { attackPower: 10, defensePower: 4 },
          marauder: { attackPower: 20, defensePower: 6 },
          landStalker: { attackPower: 30, defensePower: 0 },
          navalStrafer: { attackPower: 40, defensePower: 0 },
        },
        starshipModules: modules,
        starship: {
          ...initial.run.space.starship,
          destinationSystemId: destination.id,
          phase: "orbiting",
        },
      },
    },
    permanent: {
      ...initial.permanent,
      rebirthCount: 1,
      blackHole: {
        ...initial.permanent.blackHole,
        discovered: true,
        researched: true,
        alwaysOn: true,
        power: 17,
        rechargeMultiplier: 0.1,
      },
    },
    statistics: { ...initial.statistics, lifetimeStarshipDistanceTravelled: 32.25 },
  };
}

function statisticValues(markup: string, id: (typeof interstellarRowIds)[number]): string[] {
  const identityIndex = markup.indexOf(`data-statistic-id="${id}"`);
  const rowStart = markup.lastIndexOf("<div", identityIndex);
  const nextRow = markup.indexOf('data-statistic-id="', identityIndex + 1);
  const sectionEnd = markup.indexOf("</section>", identityIndex);
  const rowEnd = nextRow < 0 || nextRow > sectionEnd ? sectionEnd : nextRow;
  const rowMarkup = markup.slice(rowStart, rowEnd);
  return Array.from(rowMarkup.matchAll(/<strong>(.*?)<\/strong>/g), (match) => match[1]!);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

function unescapeHtml(value: string): string {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&gt;", ">")
    .replaceAll("&lt;", "<")
    .replaceAll("&amp;", "&");
}

describe("Interstellar Statistics display", () => {
  it("keeps the 17 source rows in order and localizes labels and scope in all six languages", () => {
    for (const locale of LOCALE_IDS) {
      const initial = createInitialGameState({ pioneerName: "Interstellar Statistics", seed: 993 });
      const state = { ...initial, settings: { ...initial.settings, locale } };
      const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);
      const rows = Array.from(
        markup.matchAll(/data-statistic-id="([^"]+)"/g),
        (match) => match[1],
      ).filter((id) => interstellarRowIds.includes(id as (typeof interstellarRowIds)[number]));
      expect(rows).toEqual(interstellarRowIds);

      const sectionHeading = markup.indexOf(
        `<h4>${settingsStatisticLabel(locale, "interstellarSection")}</h4>`,
      );
      const interstellarSection = markup.slice(
        sectionHeading,
        markup.indexOf("</section>", sectionHeading),
      );
      expect(interstellarSection).toContain(escapeHtml(interstellarStatisticsTrackingNote(locale)));
      for (const id of interstellarRowIds) {
        const marker = `data-statistic-id="${id}"`;
        const rowStart = markup.lastIndexOf("<div", markup.indexOf(marker));
        const nextRow = markup.indexOf(
          'data-statistic-id="',
          markup.indexOf(marker) + marker.length,
        );
        const rowMarkup = unescapeHtml(markup.slice(rowStart, nextRow < 0 ? undefined : nextRow));
        expect(rowMarkup).toContain(interstellarStatisticLabel(locale, id));
        expect(rowMarkup).toContain(`<small>${settingsStatisticLabel(locale, "run")}</small>`);
        expect(rowMarkup).toContain(`<small>${settingsStatisticLabel(locale, "lifetime")}</small>`);
      }

      expect(markup).toContain(interstellarStatisticLabel(locale, "notApplicable"));
      expect(statisticValues(markup, "enemy")).toEqual([
        interstellarStatisticLabel(locale, "notApplicable"),
        interstellarStatisticLabel(locale, "notApplicable"),
      ]);
    }
  });

  it("links only to Interstellar or Galactic child pages that are currently available", () => {
    const state = createInitialGameState({ pioneerName: "Locked Interstellar", seed: 994 });
    const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);
    const rowMarkup = (sourceMarkup: string, id: (typeof interstellarRowIds)[number]) => {
      const marker = `data-statistic-id="${id}"`;
      const identityIndex = sourceMarkup.indexOf(marker);
      const rowStart = sourceMarkup.lastIndexOf("<div", identityIndex);
      const nextRow = sourceMarkup.indexOf('data-statistic-id="', identityIndex + marker.length);
      return sourceMarkup.slice(rowStart, nextRow < 0 ? undefined : nextRow);
    };

    for (const id of interstellarRowIds) {
      expect(rowMarkup(markup, id)).not.toContain("<a");
    }

    const blackHoleDiscoveredState: GameState = {
      ...state,
      permanent: {
        ...state.permanent,
        blackHole: { ...state.permanent.blackHole, discovered: true },
      },
    };
    const blackHoleDiscoveredMarkup = renderToStaticMarkup(
      <SettingsStatisticsPane state={blackHoleDiscoveredState} />,
    );
    expect(rowMarkup(blackHoleDiscoveredMarkup, "blackHoleStrength")).not.toContain("<a");

    const cartographyState: GameState = {
      ...blackHoleDiscoveredState,
      run: {
        ...blackHoleDiscoveredState.run,
        economy: {
          ...blackHoleDiscoveredState.run.economy,
          researchedTechnologies: ["stellarCartography"],
        },
      },
    };
    const cartographyMarkup = renderToStaticMarkup(
      <SettingsStatisticsPane state={cartographyState} />,
    );
    for (const id of ["starStudyRange", "apFromStarVoyage"] as const) {
      expect(rowMarkup(cartographyMarkup, id)).toContain('href="#tab-interstellar-star-map"');
    }
    for (const id of interstellarRowIds.filter(
      (id) => id !== "starStudyRange" && id !== "apFromStarVoyage",
    )) {
      expect(rowMarkup(cartographyMarkup, id)).not.toContain("<a");
    }
  });

  it("routes each source statistic label to its currently available owner page", () => {
    const state = allInterstellarOwnersAvailableState();
    const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);
    for (const id of interstellarRowIds) {
      const identityIndex = markup.indexOf(`data-statistic-id="${id}"`);
      const rowStart = markup.lastIndexOf("<div", identityIndex);
      const nextRow = markup.indexOf('data-statistic-id="', identityIndex + 1);
      const rowMarkup = markup.slice(rowStart, nextRow < 0 ? undefined : nextRow);
      expect(rowMarkup).toContain(`href="#tab-${ownerPaneByInterstellarStatistic[id]}"`);
      expect(rowMarkup).toContain("<a");
    }
  });

  it("renders live Interstellar state in the matching run and lifetime scopes", () => {
    const state = allInterstellarOwnersAvailableState();
    const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);
    const locale = state.settings.locale;
    const number = (value: number) => formatNumber(locale, value, 0, state.settings.notation);
    const lightYears = (value: number) =>
      `${formatNumber(locale, value, 2, state.settings.notation)} ${interstellarStatisticLabel(locale, "lightYearUnit")}`;
    const notApplicable = interstellarStatisticLabel(locale, "notApplicable");
    const encounter = state.run.space.systemEncounters[0]!;
    const selected = selectInterstellarStatistics(state);

    expect(statisticValues(markup, "starStudyRange")).toEqual([lightYears(123.45), notApplicable]);
    expect(statisticValues(markup, "starShipBuilt")).toEqual([
      settingsStatisticLabel(locale, "yes"),
      notApplicable,
    ]);
    expect(statisticValues(markup, "starshipDistanceTravelled")).toEqual([
      lightYears(12.5),
      lightYears(32.25),
    ]);
    expect(statisticValues(markup, "systemScanned")).toEqual([
      settingsStatisticLabel(locale, "yes"),
      notApplicable,
    ]);
    expect(statisticValues(markup, "fleetAttackStrength")).toEqual([number(100), notApplicable]);
    expect(statisticValues(markup, "envoy")).toEqual([number(1), notApplicable]);
    expect(statisticValues(markup, "scout")).toEqual([number(2), notApplicable]);
    expect(statisticValues(markup, "marauder")).toEqual([number(3), notApplicable]);
    expect(statisticValues(markup, "landStalker")).toEqual([number(4), notApplicable]);
    expect(statisticValues(markup, "navalStrafer")).toEqual([number(5), notApplicable]);
    expect(statisticValues(markup, "enemy")).toEqual([encounter.raceName, notApplicable]);
    expect(statisticValues(markup, "enemyDefenceOvercome")).toEqual([notApplicable, notApplicable]);
    expect(statisticValues(markup, "enemyDefenceRemaining")).toEqual([
      number(enemyFleetPower(encounter.enemyFleets)),
      notApplicable,
    ]);
    expect(statisticValues(markup, "apFromStarVoyage")).toEqual([
      number(selected.apFromStarVoyage),
      notApplicable,
    ]);
    expect(statisticValues(markup, "blackHoleDiscovered")).toEqual([
      notApplicable,
      settingsStatisticLabel(locale, "yes"),
    ]);
    expect(statisticValues(markup, "blackHoleAlwaysActive")).toEqual([
      notApplicable,
      settingsStatisticLabel(locale, "yes"),
    ]);
    expect(statisticValues(markup, "blackHoleStrength")).toEqual([notApplicable, number(17)]);
  });
});
