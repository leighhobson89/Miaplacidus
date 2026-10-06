import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { COSMIC_RIP_TECHNOLOGIES } from "../../src/content/cosmicRip";
import { LOCALE_IDS, systemIdForStar } from "../../src/content/ids";
import { SettingsStatisticsPane } from "../../src/app/SettingsStatisticsPane";
import { selectRunApAnticipated } from "../../src/engine/selectors";
import { createInitialGameState, type GameState } from "../../src/engine/state";
import { settingsStatisticLabel } from "../../src/i18n/settingsMessages";
import { overviewStatisticLabel, runStatisticLabel } from "../../src/i18n/statisticsMessages";

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
  it("counts each eligible scanned system once using its base AP and ignores ineligible or missing profiles", () => {
    expect(selectRunApAnticipated(stateWithScannedEncounters())).toBe(21);
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

      expect(markup).toContain(
        linkedCard("research-tech-tree", settingsStatisticLabel(locale, "techsUnlocked"), "2"),
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
        linkedCard(
          "cosmic-rip-situation",
          settingsStatisticLabel(locale, "cosmicRipChapterUnlocked"),
          settingsStatisticLabel(locale, "yes"),
        ),
      );
      expect(markup).toContain(
        linkedCard(
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
        [settingsStatisticLabel(locale, "cosmicRipTelemetry"), "cosmic-rip-situation"],
        [settingsStatisticLabel(locale, "gloryPoints"), "cosmic-rip-situation"],
        [overviewStatisticLabel(locale, "cosmicRipGpSpent"), "cosmic-rip-situation"],
        [overviewStatisticLabel(locale, "cosmicRipTelemetryEarned"), "cosmic-rip-situation"],
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

  it("does not link Cosmic Rip Statistics to a locked tab", () => {
    const markup = renderToStaticMarkup(
      <SettingsStatisticsPane state={stateWithScannedEncounters()} />,
    );

    expect(markup).not.toContain('href="#tab-cosmic-rip-');
  });
});
