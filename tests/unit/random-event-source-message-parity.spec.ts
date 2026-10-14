import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { achievementText } from "../../src/i18n/achievementMessages";
import { economyLabel } from "../../src/i18n/economyMessages";
import { randomEventName } from "../../src/i18n/metaSignalMessages";
import { metaSignalText } from "../../src/i18n/metaSignalMessages";
import { randomEventTriggerNotificationText } from "../../src/i18n/randomEventTriggerNotificationMessages";
import { randomEventEndNotificationText } from "../../src/i18n/randomEventEndNotificationMessages";
import { localizedRocketUserName } from "../../src/i18n/rocketMessages";
import { RANDOM_EVENT_IDS, type RandomEventHistoryEntry, type RandomEventId } from "../../src/content/metaSignals";
import { LOCALE_IDS } from "../../src/content/ids";
import { settingsSectionName, settingsText } from "../../src/i18n/settingsMessages";

const sourceLocales = JSON.parse(
  readFileSync(resolve(process.cwd(), "../cosmicForge/cosmicForge/localization.json"), "utf8"),
) as Record<(typeof LOCALE_IDS)[number], Record<string, string>>;

const triggerNotificationSourceKey: Partial<Record<RandomEventId, string>> = {
  starshipLostInSpace: "notificationRandomEventStarshipLost",
  galacticMarketLockdown: "notificationRandomEventMarketOffline",
  endlessSummer: "notificationRandomEventEndlessSummer",
  minerBrokeDown: "notificationRandomEventMinerBrokeDown",
  supplyChainDisruption: "notificationRandomEventSupplyChain",
  blackHoleInstability: "notificationRandomEventBlackHoleInstability",
};

const eventHistoryById: Partial<Record<RandomEventId, RandomEventHistoryEntry>> = {
  endlessSummer: {
    id: "endlessSummer",
    simulationMs: 1,
    negative: false,
    durationMs: 60 * 60_000,
  },
  minerBrokeDown: {
    id: "minerBrokeDown",
    simulationMs: 1,
    negative: true,
    details: { kind: "minerBrokeDown", rocketId: "rocket1", rocketName: "Prospector" },
  },
  supplyChainDisruption: {
    id: "supplyChainDisruption",
    simulationMs: 1,
    negative: true,
    details: { kind: "supplyChainDisruption", goodId: "hydrogen", percentDown: 60 },
  },
  blackHoleInstability: {
    id: "blackHoleInstability",
    simulationMs: 1,
    negative: true,
    durationMs: 60 * 60_000,
  },
};

describe("Random Event source message parity", () => {
  it("provides populated Achievements and Events child-page titles and overview help", () => {
    for (const locale of LOCALE_IDS) {
      expect(sourceLocales[locale].headerMainAchievements).toBeDefined();
      expect(sourceLocales[locale].headerDescAchievements).toBeDefined();
      expect(sourceLocales[locale].headerMainEvents).toBeDefined();
      expect(sourceLocales[locale].headerDescEvents).toBeDefined();
      expect(settingsText(locale, "achievements").trim()).not.toBe("");
      expect(achievementText(locale, "title").trim()).not.toBe("");
      expect(achievementText(locale, "overview").trim()).not.toBe("");
      expect(settingsSectionName(locale, "events").trim()).not.toBe("");
      expect(metaSignalText(locale, "title").trim()).not.toBe("");
      expect(economyLabel(locale, "eventsOverviewHelp").trim()).not.toBe("");
    }
  });

  it("maps all source event names in all six locales", () => {
    expect(RANDOM_EVENT_IDS).toHaveLength(13);

    for (const id of RANDOM_EVENT_IDS) {
      const sourceKey = `eventName${id.charAt(0).toUpperCase()}${id.slice(1)}`;
      for (const locale of LOCALE_IDS) {
        expect(sourceLocales[locale][sourceKey], `${locale}.${sourceKey} exists`).toBeDefined();
        expect(randomEventName(locale, id), `${locale}.${sourceKey}`).toBe(
          sourceLocales[locale][sourceKey],
        );
      }
    }
  });

  it("renders named and generic trigger notices from their source localization keys", () => {
    for (const id of RANDOM_EVENT_IDS) {
      const noticeKey = triggerNotificationSourceKey[id] ?? "notificationRandomEventGeneric";
      const eventNameKey = `eventName${id.charAt(0).toUpperCase()}${id.slice(1)}`;
      for (const locale of LOCALE_IDS) {
        const replacements: Record<string, string> = {
          eventName: sourceLocales[locale][eventNameKey]!,
          minutes: "60",
          rocketName: "Prospector",
          itemName: "Hydrogen",
        };
        const expected = sourceLocales[locale][noticeKey]!.replace(
          /\{([^{}]+)\}/g,
          (_placeholder, name: string) => replacements[name] ?? `{${name}}`,
        );

        expect(
          randomEventTriggerNotificationText(locale, id, eventHistoryById[id], "Hydrogen"),
          `${locale}.${noticeKey}`,
        ).toBe(expected);
      }
    }
  });

  it("localizes default rocket names in breakdown and repair notices like Cosmic Forge", () => {
    const defaultRocketEntry: RandomEventHistoryEntry = {
      id: "minerBrokeDown",
      simulationMs: 1,
      negative: true,
      details: { kind: "minerBrokeDown", rocketId: "rocket2", rocketName: "Rocket 2" },
    };

    for (const locale of LOCALE_IDS) {
      const localizedDefaultName = sourceLocales[locale].rocketDefaultName!.replace(
        "{index}",
        "2",
      );
      const localizedStoredName = localizedRocketUserName(locale, "Rocket 2");
      expect(localizedStoredName, `${locale}.rocketDefaultName`).toBe(localizedDefaultName);
      expect(
        randomEventTriggerNotificationText(locale, "minerBrokeDown", defaultRocketEntry),
        `${locale}.notificationRandomEventMinerBrokeDown`,
      ).toBe(
        sourceLocales[locale].notificationRandomEventMinerBrokeDown!.replace(
          "{rocketName}",
          localizedDefaultName,
        ),
      );
      expect(
        randomEventEndNotificationText(locale, "minerBrokeDown", localizedStoredName),
        `${locale}.notificationMiningOperationsRestoredNamed`,
      ).toBe(
        sourceLocales[locale].notificationMiningOperationsRestoredNamed!.replace(
          "{rocketName}",
          localizedDefaultName,
        ),
      );
    }
  });
});
