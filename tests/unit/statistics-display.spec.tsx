import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { COSMIC_RIP_TECHNOLOGIES } from "../../src/content/cosmicRip";
import { LOCALE_IDS, systemIdForStar } from "../../src/content/ids";
import { SettingsStatisticsPane } from "../../src/app/SettingsStatisticsPane";
import { selectRunApAnticipated } from "../../src/engine/selectors";
import { createInitialGameState, type GameState } from "../../src/engine/state";
import { settingsStatisticLabel } from "../../src/i18n/settingsMessages";
import { runStatisticLabel, statisticsNotApplicableLabel } from "../../src/i18n/statisticsMessages";

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
      const linkedPairCard = (paneId: string, label: string, lifetime: string) =>
        `<dt><a href="#tab-${paneId}">${label}</a></dt><dd class="settings-stat-pair-values"><span><small>${settingsStatisticLabel(locale, "run")}</small><strong>${statisticsNotApplicableLabel(locale)}</strong></span><span><small>${settingsStatisticLabel(locale, "lifetime")}</small><strong>${lifetime}</strong></span></dd>`;

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
      { settledSystemIds: [startingSystemId], expected: "0" },
      {
        settledSystemIds: [startingSystemId, systemIdForStar(821, 1)],
        expected: "1",
      },
      {
        settledSystemIds: [
          startingSystemId,
          systemIdForStar(821, 1),
          systemIdForStar(821, 2),
          systemIdForStar(821, 3),
        ],
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
          permanent: { ...initial.permanent, settledSystemIds: sample.settledSystemIds },
          settings: { ...initial.settings, locale },
        };
        const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />).replaceAll(
          "&#x27;",
          "'",
        );
        const sourceHeading = `<h4>${settingsStatisticLabel(locale, "cosmicRipChapterSection")}</h4>`;
        const liveHeading = `<h4>${settingsStatisticLabel(locale, "cosmicRipLiveStatusSection")}</h4>`;
        const lifetimeHeading = `<h4>${settingsStatisticLabel(locale, "lifetime")}</h4>`;
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
