import { dismissTutorialOfferIfPresent, expect, test, type Page } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { setGameLocale } from "../_harness/settings-controls";
import { LOCALE_IDS, MATERIAL_IDS, COMPOUND_IDS } from "../../../src/content/ids";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { translate } from "../../../src/i18n/messages";
import { economyLabel } from "../../../src/i18n/economyMessages";
import { metaText, marketText } from "../../../src/i18n/metaMessages";
import { philosophyText } from "../../../src/i18n/philosophyMessages";
import { settingsSectionName, settingsText } from "../../../src/i18n/settingsMessages";
import { spaceText } from "../../../src/i18n/spaceMessages";
import { starMapText } from "../../../src/i18n/starMapMessages";
import { starshipText } from "../../../src/i18n/starshipMessages";
import { rocketText } from "../../../src/i18n/rocketMessages";
import { casinoText } from "../../../src/i18n/casinoMessages";
import { megastructureText } from "../../../src/i18n/megastructureMessages";
import { blackHoleText } from "../../../src/i18n/blackHoleMessages";
import { cosmicRipText } from "../../../src/i18n/cosmicRipMessages";

type SourceOption = `option${number}`;

interface ExpectedNavigationItem {
  readonly id: string;
  readonly label: string;
  readonly sourceOptionId?: SourceOption;
  readonly sourceOptionIds?: readonly SourceOption[];
}

/*
 * Cosmic Forge's ui.js localizeTabLabels maps the nine source top-level labels
 * to tabHeaderResources, tabHeaderEnergy, tabHeaderResearch,
 * tabHeaderCompounds, tabHeaderInterstellar, tabHeaderSpaceMining,
 * tabHeaderGalactic, tabHeaderCosmicRip, and tabHeaderSettings. The remake
 * keeps those labels localized while following the owner-approved order in
 * App.tsx/GAME_TABS and adding Miaplaedia as its own top-level destination.
 * Child route sourceOptionIds below are the classes/options attached to the
 * source menu entries in the read-only sibling
 * ../cosmicForge/cosmicForge/index.html.
 */
const TOP_LEVEL_TABS = [
  { id: "hydrogen", key: "tab.hydrogen" },
  { id: "compounds", key: "tab.compounds" },
  { id: "research", key: "tab.research" },
  { id: "energy", key: "tab.energy" },
  { id: "space-mining", key: "tab.spaceMining" },
  { id: "interstellar", key: "tab.interstellar" },
  { id: "galaxy", key: "tab.galaxy" },
  { id: "cosmic-rip", key: "tab.cosmicRip" },
  { id: "settings", key: "tab.settings" },
  { id: "miaplaedia", key: "tab.miaplaedia" },
] as const;

async function startSpaceFixture(
  page: Page,
  fixture: "space-late-game" | "space-voidborn-pillage" = "space-late-game",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261009&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("Phase 7 Navigation Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest?.getState()))).toBe(true);
  await dismissTutorialOfferIfPresent(page);
}

async function expectLabel(
  page: Page,
  item: ExpectedNavigationItem,
): Promise<void> {
  const tab = page.locator(`#tab-${item.id}`);
  await expect(tab).toBeVisible();
  await expect
    .poll(() =>
      tab.evaluate((element) =>
        Array.from(element.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent ?? "")
          .join("")
          .trim(),
      ),
    )
    .toBe(item.label);
  if (item.sourceOptionId) {
    await expect(tab).toHaveAttribute("data-source-option-id", item.sourceOptionId);
  }
  if (item.sourceOptionIds) {
    await expect(tab).toHaveAttribute("data-source-option-ids", item.sourceOptionIds.join(","));
  }
}

async function expectChildLabels(
  page: Page,
  parentId: string,
  items: readonly ExpectedNavigationItem[],
): Promise<void> {
  await page.locator(`#tab-${parentId}`).click();
  for (const item of items) await expectLabel(page, item);
}

test("routes source-owned navigation labels in all six locales @p7-localization @navigation", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startMetaFixture(page, "meta-cosmic-rip-route");

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    const topLevel = page.locator('.game-nav [role="tab"]');
    await expect(topLevel).toHaveCount(TOP_LEVEL_TABS.length);
    await expect
      .poll(() => topLevel.evaluateAll((tabs) => tabs.map((tab) => tab.id)))
      .toEqual(TOP_LEVEL_TABS.map(({ id }) => `tab-${id}`));
    for (const { id, key } of TOP_LEVEL_TABS) {
      await expectLabel(page, { id, label: translate(locale, key) });
    }

    const resourceItems: ExpectedNavigationItem[] = MATERIAL_IDS.map((id) => ({
      id: `resources-${id}`,
      label: economyGoodName(locale, id),
      sourceOptionId: ({
        hydrogen: "option1",
        helium: "option2",
        carbon: "option3",
        neon: "option4",
        oxygen: "option5",
        sodium: "option6",
        silicon: "option7",
        iron: "option8",
      } as const)[id],
    }));
    await expectChildLabels(page, "hydrogen", resourceItems);
    await expect(page.getByRole("button", { name: economyLabel(locale, "gases"), exact: true }))
      .toBeVisible();
    await expect(page.getByRole("button", { name: economyLabel(locale, "solids"), exact: true }))
      .toBeVisible();

    const compoundItems: ExpectedNavigationItem[] = COMPOUND_IDS.map((id) => ({
      id: `compounds-${id}`,
      label: economyGoodName(locale, id),
      sourceOptionId: ({
        diesel: "option1",
        glass: "option2",
        steel: "option3",
        concrete: "option4",
        water: "option5",
        titanium: "option6",
      } as const)[id],
    }));
    await expectChildLabels(page, "compounds", compoundItems);
    await expect(page.getByRole("button", { name: economyLabel(locale, "liquids"), exact: true }))
      .toBeVisible();
    await expect(page.getByRole("button", { name: economyLabel(locale, "solids"), exact: true }))
      .toBeVisible();

    await expectChildLabels(page, "energy", [
      { id: "energy-summary", label: economyLabel(locale, "energySummary") },
      {
        id: "energy-batteries",
        label: economyLabel(locale, "energyStorage"),
        sourceOptionId: "option1",
      },
      {
        id: "energy-power",
        label: economyLabel(locale, "energyPower"),
        sourceOptionIds: ["option2", "option3", "option4"],
      },
    ]);
    await expectChildLabels(page, "research", [
      {
        id: "research-science-buildings",
        label: economyLabel(locale, "research"),
        sourceOptionId: "option1",
      },
      {
        id: "research-tech-tree",
        label: economyLabel(locale, "technologyTree"),
        sourceOptionIds: ["option2", "option3"],
      },
    ]);

    const settingsItems: ExpectedNavigationItem[] = [
      {
        id: "settings-achievements",
        label: settingsText(locale, "achievements"),
        sourceOptionId: "option10",
      },
      {
        id: "settings-events",
        label: settingsSectionName(locale, "events"),
        sourceOptionId: "option14",
      },
      {
        id: "settings-statistics",
        label: settingsSectionName(locale, "statistics"),
        sourceOptionId: "option8",
      },
      {
        id: "settings-visual",
        label: settingsSectionName(locale, "visual"),
        sourceOptionId: "option1",
      },
      {
        id: "settings-game-options",
        label: settingsSectionName(locale, "gameOptions"),
        sourceOptionId: "option3",
      },
      {
        id: "settings-saves",
        label: settingsText(locale, "savingSection"),
        sourceOptionId: "option2",
      },
    ];
    await expectChildLabels(page, "settings", settingsItems);

    const miaplaediaItems: ExpectedNavigationItem[] = [
      {
        id: "miaplaedia-get-started",
        label: settingsSectionName(locale, "getStarted"),
        sourceOptionId: "option4",
      },
      {
        id: "miaplaedia-story",
        label: settingsSectionName(locale, "story"),
        sourceOptionId: "option12",
      },
      {
        id: "miaplaedia-concepts-early",
        label: settingsSectionName(locale, "conceptsEarly"),
        sourceOptionId: "option5",
      },
      {
        id: "miaplaedia-concepts-mid",
        label: settingsSectionName(locale, "conceptsMid"),
        sourceOptionId: "option6",
      },
      {
        id: "miaplaedia-concepts-late",
        label: settingsSectionName(locale, "conceptsLate"),
        sourceOptionId: "option7",
      },
      {
        id: "miaplaedia-end-goal",
        label: settingsSectionName(locale, "endGoal"),
        sourceOptionId: "option13",
      },
      {
        id: "miaplaedia-philosophies",
        label: settingsSectionName(locale, "philosophies"),
        sourceOptionId: "option11",
      },
    ];
    await expectChildLabels(page, "miaplaedia", miaplaediaItems);

    await expectChildLabels(page, "cosmic-rip", [
      {
        id: "cosmic-rip-situation",
        label: cosmicRipText(locale).situationTitle,
        sourceOptionId: "option1",
      },
      {
        id: "cosmic-rip-scanner-array",
        label: cosmicRipText(locale).scannerArrayTitle,
        sourceOptionId: "option2",
      },
      {
        id: "cosmic-rip-rip",
        label: cosmicRipText(locale).ripPaneTitle,
        sourceOptionId: "option3",
      },
    ]);
  }
});

test("routes Interstellar and Space Mining labels in all six locales @p7-localization @navigation", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startSpaceFixture(page);
  const prerequisites = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(prerequisites.run.space.systemProfiles.length).toBeGreaterThan(1);
  expect(prerequisites.run.space.asteroids.length).toBeGreaterThan(0);
  expect(prerequisites.run.space.launchPadBuilt).toBe(true);

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expectChildLabels(page, "interstellar", [
      {
        id: "interstellar-star-map",
        label: starMapText(locale, "title"),
        sourceOptionId: "option1",
      },
      {
        id: "interstellar-star-data",
        label: starMapText(locale, "dataView"),
        sourceOptionId: "option2",
      },
      {
        id: "interstellar-starship",
        label: starshipText(locale, "title"),
        sourceOptionId: "option3",
      },
      {
        id: "interstellar-fleet-hangar",
        label: starshipText(locale, "fleetHangar"),
        sourceOptionId: "option4",
      },
      {
        id: "interstellar-colonise",
        label: starshipText(locale, "coloniseTabLabel"),
        sourceOptionId: "option5",
      },
    ]);

    await expectChildLabels(page, "space-mining", [
      {
        id: "space-mining-mining",
        label: spaceText(locale, "miningTitle"),
        sourceOptionId: "option8",
      },
      {
        id: "space-mining-telescope",
        label: spaceText(locale, "telescopeTitle"),
        sourceOptionId: "option6",
      },
      {
        id: "space-mining-asteroids",
        label: spaceText(locale, "asteroidsTitle"),
        sourceOptionId: "option7",
      },
      {
        id: "space-mining-launch-pad",
        label: rocketText(locale, "launchPadTitle"),
        sourceOptionId: "option1",
      },
      ...([1, 2, 3, 4] as const).map((index) => ({
        id: `space-mining-rocket-${index}`,
        label: rocketText(locale, "rocketLabel", { index }),
        sourceOptionId: `option${index + 1}` as SourceOption,
      })),
    ]);
  }
});

test("keeps Galactic source pages distinct and localized in all six locales @p7-localization @navigation", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startMetaFixture(page, "meta-galactic-identity-matrix");

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expectChildLabels(page, "galaxy", [
      {
        id: "galactic-rebirth",
        label: metaText(locale, "rebirthTabLabel"),
        sourceOptionId: "option1",
      },
      {
        id: "galactic-market",
        label: marketText(locale, "heading"),
        sourceOptionId: "option2",
      },
      {
        id: "galactic-casino",
        label: casinoText(locale, "title"),
        sourceOptionId: "option6",
      },
      {
        id: "galactic-ascendency-perks",
        label: metaText(locale, "perksTitle"),
        sourceOptionId: "option3",
      },
      {
        id: "galactic-megastructures",
        label: megastructureText(locale).title,
        sourceOptionId: "option4",
      },
    ]);
    const casinoTab = page.locator("#tab-galactic-casino");
    await casinoTab.click();
    await expect(casinoTab).toHaveAttribute("aria-selected", "true");
    await expect(casinoTab).toHaveAttribute("aria-controls", "panel-galactic-casino");
  }
});

test("routes the Black Hole child and Research Philosophy label in all six locales @p7-localization @navigation", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startMetaFixture(page, "meta-black-hole-discovered");
  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expectChildLabels(page, "galaxy", [
      {
        id: "galactic-black-hole",
        label: blackHoleText(locale).title,
        sourceOptionId: "option5",
      },
    ]);
    const blackHoleTab = page.locator("#tab-galactic-black-hole");
    await blackHoleTab.click();
    await expect(blackHoleTab).toHaveAttribute("aria-selected", "true");
  }

  await startSpaceFixture(page, "space-voidborn-pillage");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.permanent.philosophyId).toBe("voidborn");
  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expectChildLabels(page, "research", [
      { id: "research-philosophy", label: philosophyText(locale).title, sourceOptionId: "option4" },
    ]);
  }
});
