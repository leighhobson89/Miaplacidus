import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LOCALE_IDS } from "../../src/content/ids";
import { SettingsStatisticsPane } from "../../src/app/SettingsStatisticsPane";
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
  powerCurrent: "energy-storage",
  totalEnergy: "energy-storage",
  totalProduction: "energy-power-plant",
  totalConsumption: "energy-power-plant",
  totalBatteryStorage: "energy-storage",
  energyTrips: "energy-storage",
  basicPowerPlants: "energy-power-plant",
  advancedPowerPlants: "energy-storage",
  solarPowerPlants: "energy-storage",
  sodiumIonBatteries: "energy-storage",
  battery2: "energy-storage",
  battery3: "energy-storage",
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
  it("keeps all twelve source rows visible in order and localizes them in all six languages", () => {
    const lockedMarkup = renderToStaticMarkup(
      <SettingsStatisticsPane
        state={createInitialGameState({ pioneerName: "Locked Energy", seed: 773 })}
      />,
    );
    expect(Array.from(lockedMarkup.matchAll(/data-statistic-id="([^"]+)"/g), (match) => match[1]))
      .toEqual(expect.arrayContaining(energyStatisticIds));
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
      const markup = renderToStaticMarkup(<SettingsStatisticsPane state={unlockedEnergyState(locale)} />);
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
});
