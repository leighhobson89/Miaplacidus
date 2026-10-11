import { compressToUTF16 } from "lz-string";
import { describe, expect, it } from "vitest";
import { LOCALE_IDS } from "../../src/content/ids";
import {
  RANDOM_EVENT_DESCRIPTION_KEYS,
  randomEventDescriptionTemplate,
} from "../../src/i18n/randomEventDescriptionMessages";
import { randomEventHistoryDescription } from "../../src/app/randomEventDescription";
import { formatNumber } from "../../src/app/numberFormatting";
import type { RandomEventHistoryEntry } from "../../src/content/metaSignals";
import { RANDOM_EVENT_IDS } from "../../src/content/metaSignals";
import { transition } from "../../src/engine/commands";
import { createInitialGameState, isValidGameState } from "../../src/engine/state";
import { decodeLocal, encodeLocal } from "../../src/persistence/codec";
import { checksumFor, makeEnvelope } from "../../src/persistence/schema";

const sourceValues = {
  building: "Solar Power Plant",
  amount: "1,234",
  rocketName: "Prospector",
  asteroidName: "Aster-12",
  lossText: " -20 antimatter.",
  lostPercent: "64",
  itemName: "Hydrogen",
  percentDown: "72",
};

describe("random event source descriptions", () => {
  it("provides all 26 source templates with translated placeholders in each locale", () => {
    expect(RANDOM_EVENT_DESCRIPTION_KEYS).toHaveLength(26);
    for (const locale of LOCALE_IDS) {
      for (const key of RANDOM_EVENT_DESCRIPTION_KEYS) {
        const description = randomEventDescriptionTemplate(locale, key, sourceValues);
        expect(description.trim()).not.toBe("");
        expect(description).not.toMatch(/\{[^{}]+\}/);
      }
    }
  });

  it("describes production reductions with positive percentages in every locale", () => {
    const itemNames = {
      en: "Hydrogen",
      es: "Hidrógeno",
      pt: "Hidrogénio",
      de: "Wasserstoff",
      it: "Idrogeno",
      fr: "Hydrogène",
    } as const;
    const namedExpected = {
      en: "Hydrogen production reduced by 72%.",
      es: "Producción de Hidrógeno reducida en 72%.",
      pt: "Produção de Hidrogénio reduzida em 72%.",
      de: "Wasserstoff-Produktion um 72% reduziert.",
      it: "Produzione di Idrogeno ridotta del 72%.",
      fr: "Hydrogène : production réduite de 72%.",
    } as const;
    const genericExpected = {
      en: "Production reduced by 72%.",
      es: "Producción reducida en 72%.",
      pt: "Produção reduzida em 72%.",
      de: "Produktion um 72% reduziert.",
      it: "Produzione ridotta del 72%.",
      fr: "Production réduite de 72%.",
    } as const;

    for (const locale of LOCALE_IDS) {
      expect(
        randomEventDescriptionTemplate(locale, "eventDescProductionReducedNamed", {
          itemName: itemNames[locale],
          percentDown: "72",
        }),
      ).toBe(namedExpected[locale]);
      expect(
        randomEventDescriptionTemplate(locale, "eventDescProductionReduced", {
          percentDown: "72",
        }),
      ).toBe(genericExpected[locale]);
    }
  });

  it("uses grammatical Portuguese and French descriptions for destroyed targets", () => {
    expect(
      randomEventDescriptionTemplate("pt", "eventDescBuildingDestroyed", {
        building: "Bateria",
      }),
    ).toBe("Bateria destruída.");

    expect(
      randomEventDescriptionTemplate("fr", "eventDescAntimatterReaction", {
        rocketName: randomEventDescriptionTemplate("fr", "eventDescRocketFallbackName"),
        asteroidName: randomEventDescriptionTemplate("fr", "eventDescAsteroidFallbackName"),
        lossText: "",
      }),
    ).toBe("Une fusée minière a disparu; un astéroïde détruit.");
  });

  it("renders supported history families and source-safe fallbacks in every locale", () => {
    const entries: RandomEventHistoryEntry[] = [
      { id: "powerPlantExplosion", simulationMs: 1, negative: true, details: { kind: "buildingDestroyed", buildingId: "powerPlant2" } },
      { id: "batteryExplosion", simulationMs: 2, negative: true, details: { kind: "buildingDestroyed", buildingId: "battery1" } },
      { id: "scienceTheft", simulationMs: 3, negative: true, details: { kind: "researchHalved", amount: 1234 } },
      { id: "researchBreakthrough", simulationMs: 4, negative: false, details: { kind: "researchDoubled", amount: 5678 } },
      { id: "rocketInstantArrival", simulationMs: 5, negative: false, details: { kind: "rocketInstantArrival", rocketId: "rocket2", rocketName: "Prospector" } },
      {
        id: "antimatterReaction",
        simulationMs: 6,
        negative: true,
        details: {
          kind: "antimatterReaction",
          rocketId: "rocket3",
          rocketName: "Miner 3",
          asteroidId: "asteroid:3",
          asteroidName: "Aster-12",
          antimatterLost: 2100,
        },
      },
      { id: "stockLoss", simulationMs: 7, negative: true, details: { kind: "stockLoss", goodId: "hydrogen", lostPercent: 64 } },
      { id: "starshipLostInSpace", simulationMs: 8, negative: true },
      { id: "galacticMarketLockdown", simulationMs: 9, negative: false },
      { id: "endlessSummer", simulationMs: 10, negative: false },
      { id: "minerBrokeDown", simulationMs: 11, negative: false, details: { kind: "minerBrokeDown", rocketId: "rocket4", rocketName: "Deep Driller" } },
      { id: "supplyChainDisruption", simulationMs: 12, negative: false, details: { kind: "supplyChainDisruption", goodId: "steel", percentDown: 72 } },
      { id: "blackHoleInstability", simulationMs: 13, negative: false },
    ];
    const legacyEntries = RANDOM_EVENT_IDS.map((id, index) => ({
      id,
      simulationMs: index,
      negative: false,
    } satisfies RandomEventHistoryEntry));

    for (const locale of LOCALE_IDS) {
      for (const entry of [...entries, ...legacyEntries]) {
        const description = randomEventHistoryDescription(locale, entry, "standard");
        expect(description.trim()).not.toBe("");
        expect(description).not.toMatch(/\{[^{}]+\}/);
      }
      expect(randomEventHistoryDescription(locale, entries[2]!, "standard")).toBe(
        randomEventDescriptionTemplate(locale, "eventDescResearchHalvedAmount", {
          amount: formatNumber(locale, 1234, 0, "standard"),
        }),
      );
      expect(
        randomEventHistoryDescription(
          locale,
          legacyEntries.find((entry) => entry.id === "supplyChainDisruption")!,
          "standard",
        ),
      ).toBe(randomEventDescriptionTemplate(locale, "eventDescProductionReduced", { percentDown: "?" }));
    }
  });

  it("round-trips event-time details and migrates v46 history without adding fake details", () => {
    const initial = createInitialGameState({ pioneerName: "Event Archive", seed: 4701 });
    const triggered = transition(initial, { type: "random-event.force", eventId: "scienceTheft" });
    const details = triggered.state.run.randomEvents.history.at(-1)?.details;
    expect(details).toEqual({ kind: "researchHalved", amount: 25 });
    const currentEnvelope = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000047",
      pioneerName: "Event Archive",
      createdAt: 1,
      savedAt: 2,
      revision: 1,
      state: triggered.state,
    });
    const roundTrip = decodeLocal(encodeLocal(currentEnvelope));
    expect(roundTrip.state.run.randomEvents.history.at(-1)?.details).toEqual(details);

    const invalidState = {
      ...initial,
      run: {
        ...initial.run,
        randomEvents: {
          ...initial.run.randomEvents,
          history: [
            {
              id: "stockLoss" as const,
              simulationMs: 10,
              negative: true,
              details: {
                kind: "stockLoss",
                goodId: "unknown-good",
                lostPercent: 61,
                extra: true,
              },
            },
          ],
        },
      },
    };
    const { checksum: _roundTripChecksum, ...currentBody } = currentEnvelope;
    const invalidBody = { ...currentBody, state: invalidState };
    const invalidSave = {
      ...invalidBody,
      checksum: checksumFor(invalidBody as unknown as Parameters<typeof checksumFor>[0]),
    };
    expect(() => decodeLocal(compressToUTF16(JSON.stringify(invalidSave)))).toThrow();

    const legacyHistory = [
      { id: "supplyChainDisruption" as const, simulationMs: 10, negative: false },
    ];
    const legacyState = {
      ...initial,
      schemaVersion: 46,
      run: {
        ...initial.run,
        randomEvents: { ...initial.run.randomEvents, history: legacyHistory },
      },
    };
    const { checksum: _currentChecksum, ...legacyCurrentBody } = currentEnvelope;
    const legacyBody = { ...legacyCurrentBody, schemaVersion: 46, state: legacyState };
    const legacySave = {
      ...legacyBody,
      checksum: checksumFor(legacyBody as unknown as Parameters<typeof checksumFor>[0]),
    };
    const migrated = decodeLocal(compressToUTF16(JSON.stringify(legacySave)));
    expect(migrated.schemaVersion).toBe(47);
    expect(migrated.state.schemaVersion).toBe(47);
    expect(migrated.state.run.randomEvents.history).toEqual(legacyHistory);
    expect(migrated.state.run.randomEvents.history[0]?.details).toBeUndefined();
    expect(isValidGameState(migrated.state)).toBe(true);
    expect(decodeLocal(encodeLocal(migrated)).state.run.randomEvents.history).toEqual(legacyHistory);
  });
});
