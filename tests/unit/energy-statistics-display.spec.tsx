import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ENERGY_BUILDINGS } from "../../src/content/economy";
import { LOCALE_IDS } from "../../src/content/ids";
import { SettingsStatisticsPane } from "../../src/app/SettingsStatisticsPane";
import { createEconomyTickPlan } from "../../src/engine/economySimulation";
import { createInitialGameState, type GameState } from "../../src/engine/state";
import { energyStatisticLabel } from "../../src/i18n/energyStatisticsMessages";
import { settingsStatisticLabel } from "../../src/i18n/settingsMessages";

const energyStatisticIds = [
  "powerCurrent",
  "totalEnergy",
  "totalProduction",
  "totalConsumption",
  "totalBatteryStorage",
  "energyTrips",
  "basicPowerPlants",
  "advancedPowerPlants",
  "solarPowerPlants",
  "sodiumIonBatteries",
  "battery2",
  "battery3",
] as const;

const ownerPaneByEnergyStatistic: Record<(typeof energyStatisticIds)[number], string> = {
  powerCurrent: "energy-summary",
  totalEnergy: "energy-summary",
  totalProduction: "energy-power",
  totalConsumption: "energy-power",
  totalBatteryStorage: "energy-batteries",
  energyTrips: "energy-summary",
  basicPowerPlants: "energy-power",
  advancedPowerPlants: "energy-power",
  solarPowerPlants: "energy-power",
  sodiumIonBatteries: "energy-batteries",
  battery2: "energy-batteries",
  battery3: "energy-batteries",
};

function unlockedEnergyState(locale: GameState["settings"]["locale"]): GameState {
  const initial = createInitialGameState({ pioneerName: "Energy Statistics Display", seed: 772 });
  return {
    ...initial,
    settings: { ...initial.settings, locale },
    run: {
      ...initial.run,
      economy: {
        ...initial.run.economy,
        researchedTechnologies: ["basicPowerGeneration"],
        revealedTechnologies: ["basicPowerGeneration"],
      },
    },
  };
}

function statisticCard(markup: string, id: string): string {
  const identityIndex = markup.indexOf(`data-statistic-id="${id}"`);
  if (identityIndex < 0) throw new Error(`Statistics row ${id} was not rendered.`);
  const startIndex = markup.lastIndexOf("<div", identityIndex);
  const tag = /<div\b|<\/div>/g;
  tag.lastIndex = startIndex;
  let depth = 0;
  for (const match of markup.matchAll(tag)) {
    if (match[0] === "<div") depth += 1;
    else depth -= 1;
    if (depth === 0) return markup.slice(startIndex, match.index! + match[0].length);
  }
  throw new Error(`Statistics row ${id} did not have a balanced card wrapper.`);
}

describe("Energy Statistics display", () => {
  it("matches the source nameplate production statistic when plants are disabled", () => {
    const initial = unlockedEnergyState("en");
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        upgrades: {
          ...initial.run.upgrades,
          powerPlant1: 2,
          powerPlant2: 1,
          powerPlant3: 3,
        },
        economy: {
          ...initial.run.economy,
          buildingEnabled: {
            ...initial.run.economy.buildingEnabled,
            powerPlant1: false,
            powerPlant2: false,
            powerPlant3: false,
          },
          power: { ...initial.run.economy.power, gridEnabled: false },
        },
      },
    };
    const sourceNameplateRate = Math.floor(
      ENERGY_BUILDINGS.powerPlant1.ratePerSecond * 2 +
        ENERGY_BUILDINGS.powerPlant2.ratePerSecond +
        ENERGY_BUILDINGS.powerPlant3.ratePerSecond * 3,
    );
    const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);

    expect(createEconomyTickPlan(state).generationPerSecond).toBe(0);
    expect(statisticCard(markup, "totalProduction")).toContain(
      `<strong>${sourceNameplateRate} kJ/s</strong>`,
    );
  });

  it("keeps all twelve source rows visible in order and localizes them in all six languages", () => {
    const lockedMarkup = renderToStaticMarkup(
      <SettingsStatisticsPane
        state={createInitialGameState({ pioneerName: "Locked Energy", seed: 773 })}
      />,
    );
    expect(
      Array.from(lockedMarkup.matchAll(/data-statistic-id="([^"]+)"/g), (match) => match[1]),
    ).toEqual(expect.arrayContaining(energyStatisticIds));
    const lockedEnergyRows = Array.from(
      lockedMarkup.matchAll(/data-statistic-id="([^"]+)"/g),
      (match) => match[1],
    ).filter((id): id is (typeof energyStatisticIds)[number] =>
      energyStatisticIds.includes(id as (typeof energyStatisticIds)[number]),
    );
    expect(lockedEnergyRows).toEqual(energyStatisticIds);
    for (const id of energyStatisticIds) {
      expect(statisticCard(lockedMarkup, id)).not.toContain("<a");
    }

    for (const locale of LOCALE_IDS) {
      const markup = renderToStaticMarkup(
        <SettingsStatisticsPane state={unlockedEnergyState(locale)} />,
      );
      const actualEnergyRows = Array.from(
        markup.matchAll(/data-statistic-id="([^"]+)"/g),
        (match) => match[1],
      ).filter((id): id is (typeof energyStatisticIds)[number] =>
        energyStatisticIds.includes(id as (typeof energyStatisticIds)[number]),
      );
      expect(actualEnergyRows).toEqual(energyStatisticIds);

      for (const id of energyStatisticIds) {
        const card = statisticCard(markup, id);
        expect(card).toContain(energyStatisticLabel(locale, id));
        expect(card).toContain(`<small>${settingsStatisticLabel(locale, "run")}</small>`);
        expect(card).toContain(`<small>${settingsStatisticLabel(locale, "lifetime")}</small>`);
        expect(card).toContain(`href="#tab-${ownerPaneByEnergyStatistic[id]}"`);
      }

      for (const id of energyStatisticIds.slice(0, 5)) {
        const card = statisticCard(markup, id);
        const values = Array.from(card.matchAll(/<strong>(.*?)<\/strong>/g), (match) => match[1]);
        expect(values).toHaveLength(2);
        expect(values[1]).toBe(energyStatisticLabel(locale, "notApplicable"));
      }

      for (const id of energyStatisticIds.slice(5)) {
        const values = Array.from(
          statisticCard(markup, id).matchAll(/<strong>(.*?)<\/strong>/g),
          (match) => match[1],
        );
        expect(values).toEqual(["0", "0"]);
      }
    }
  });

  it("renders Times Tripped from its current-run and lifetime counters in all six languages", () => {
    for (const locale of LOCALE_IDS) {
      const initial = unlockedEnergyState(locale);
      const state: GameState = {
        ...initial,
        run: { ...initial.run, energyTripsThisRun: 3 },
        statistics: { ...initial.statistics, lifetimeEnergyTrips: 5 },
      };
      const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);
      const card = statisticCard(markup, "energyTrips");
      const values = Array.from(card.matchAll(/<strong>(.*?)<\/strong>/g), (match) => match[1]);

      expect(card).toContain(energyStatisticLabel(locale, "energyTrips"));
      expect(values).toEqual(["3", "5"]);
    }
  });
});
