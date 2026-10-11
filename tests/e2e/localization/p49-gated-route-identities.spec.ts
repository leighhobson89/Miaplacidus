import { expect, test, type Page } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { saveNowFromSettings } from "../_harness/save-controls";
import { setGameLocale } from "../_harness/settings-controls";
import { LOCALE_IDS } from "../../../src/content/ids";
import { MIAPLAEDIA_PANE_IDS } from "../../../src/app/presentationNavigation";

type SpaceIdentityFixture = "space-late-game" | "space-voidborn-pillage" | "space-starship-scanning";

async function startSpaceIdentityFixture(page: Page, fixture: SpaceIdentityFixture): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    for (const key of Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    )) {
      if (key?.startsWith(prefix)) localStorage.removeItem(key);
    }
  });
  await page.goto(`/?testSeed=20261009&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("Ascendency Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest?.getState()))).toBe(true);
}

async function readIdentity(page: Page) {
  return page.evaluate(() => ({
    pioneerName: window.miaplacidusTest!.getState().run.pioneerName,
    tabIds: Array.from(document.querySelectorAll<HTMLElement>('[role="tab"][id]'))
      .map((tab) => tab.id)
      .sort(),
    saveHeads: Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .filter((key): key is string => key?.startsWith("miaplacidus:v1:head:") ?? false)
      .sort(),
    lastStartedSlot: localStorage.getItem("miaplacidus:v1:lastStartedSlot"),
  }));
}

function expectSameIdentity(
  current: Awaited<ReturnType<typeof readIdentity>>,
  baseline: Awaited<ReturnType<typeof readIdentity>>,
  locale: (typeof LOCALE_IDS)[number],
): void {
  expect(current.tabIds, `${locale} stable visible tab IDs`).toEqual(baseline.tabIds);
  expect(current.pioneerName, `${locale} pioneer/save identity`).toBe(baseline.pioneerName);
  expect(current.saveHeads, `${locale} save head keys`).toEqual(baseline.saveHeads);
  expect(current.lastStartedSlot, `${locale} selected save slot`).toBe(baseline.lastStartedSlot);
}

async function selectRoute(page: Page, mainTabId: string, childTabId: string): Promise<void> {
  await page.locator(`#${mainTabId}`).click();
  await page.locator(`#${childTabId}`).click();
  await expect(page.locator(`#${childTabId}`)).toHaveAttribute("aria-selected", "true");
}

async function expectRouteStableAcrossLocales(
  page: Page,
  mainTabId: string,
  childTabId: string,
): Promise<void> {
  await selectRoute(page, mainTabId, childTabId);
  const baseline = await readIdentity(page);
  expect(baseline.pioneerName).toBe("Ascendency Pioneer");
  expect(baseline.saveHeads).toHaveLength(1);
  expect(baseline.lastStartedSlot).toBe(
    baseline.saveHeads[0]?.slice("miaplacidus:v1:head:".length),
  );

  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await selectRoute(page, mainTabId, childTabId);
    const current = await readIdentity(page);
    expectSameIdentity(current, baseline, locale);
  }

  await saveNowFromSettings(page);
  const afterSave = await readIdentity(page);
  expect(afterSave.saveHeads).toEqual(baseline.saveHeads);
  expect(afterSave.lastStartedSlot).toBe(baseline.lastStartedSlot);
}

test("live locale changes preserve the gated Galactic Rebirth child ID @locale @p49", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startMetaFixture(page, "meta-galactic-identity-matrix");
  await saveNowFromSettings(page);
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.space.systemEncounters.length).toBeGreaterThan(0);

  await expectRouteStableAcrossLocales(page, "tab-galaxy", "tab-galactic-rebirth");
});

test("live locale changes preserve the selected Research Philosophy child ID @locale @p49", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startSpaceIdentityFixture(page, "space-voidborn-pillage");
  await saveNowFromSettings(page);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().permanent.philosophyId))
    .toBe("voidborn");

  await expectRouteStableAcrossLocales(page, "tab-research", "tab-research-philosophy");
});

test("live locale changes preserve Asteroids and Rocket 2–4 child IDs @locale @p49", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startSpaceIdentityFixture(page, "space-late-game");
  await saveNowFromSettings(page);
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.space.asteroids.length).toBeGreaterThan(0);
  expect(state.run.space.launchPadBuilt).toBe(true);

  await page.locator("#tab-space-mining").click();
  const expectedChildIds = [
    "tab-space-mining-asteroids",
    "tab-space-mining-rocket-2",
    "tab-space-mining-rocket-3",
    "tab-space-mining-rocket-4",
  ];
  for (const id of expectedChildIds) await expect(page.locator(`#${id}`)).toBeVisible();
  const baseline = await readIdentity(page);
  expect(baseline.pioneerName).toBe("Ascendency Pioneer");
  expect(baseline.saveHeads).toHaveLength(1);

  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.locator("#tab-space-mining").click();
    const currentIds = await readIdentity(page);
    expectSameIdentity(currentIds, baseline, locale);
    for (const id of expectedChildIds) {
      const route = page.locator(`#${id}`);
      await expect(route).toBeVisible();
      await route.click();
      await expect(route).toHaveAttribute("aria-selected", "true");
    }
  }

  await saveNowFromSettings(page);
  const afterSave = await readIdentity(page);
  expect(afterSave.saveHeads).toEqual(baseline.saveHeads);
  expect(afterSave.lastStartedSlot).toBe(baseline.lastStartedSlot);
});

test("live locale changes preserve the gated Interstellar Colonise child ID @locale @p49", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startSpaceIdentityFixture(page, "space-starship-scanning");
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-starship").click();
  await page.getByTestId("starship-scan-system-button").click();
  await expect(page.getByTestId("starship-scan-complete")).toBeVisible();
  await expect(page.locator("#tab-interstellar-colonise")).toBeVisible();
  await page.locator("#tab-interstellar-colonise").click();
  await expect(page.locator("#tab-interstellar-colonise")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await saveNowFromSettings(page);

  const scanned = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(scanned.run.space.systemEncounters).toHaveLength(1);
  expect(scanned.run.space.starship.destinationSystemId).toBe(
    scanned.run.space.systemEncounters[0]?.systemId,
  );
  await expectRouteStableAcrossLocales(page, "tab-interstellar", "tab-interstellar-colonise");
});

test("live locale changes preserve all seven Miaplaedia child IDs @locale @p49", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startMetaFixture(page, "meta-rebirth-ready");
  await saveNowFromSettings(page);
  await page.locator("#tab-miaplaedia").click();

  const expectedChildIds = MIAPLAEDIA_PANE_IDS.map((id) => `tab-${id}`).sort();
  await expect
    .poll(() =>
      page.locator('[role="tab"][id^="tab-miaplaedia-"]').evaluateAll((tabs) =>
        tabs.map((tab) => tab.id).sort(),
      ),
    )
    .toEqual(expectedChildIds);
  const baseline = await readIdentity(page);
  expect(baseline.pioneerName).toBe("Ascendency Pioneer");
  expect(baseline.saveHeads).toHaveLength(1);

  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.locator("#tab-miaplaedia").click();
    const childIds = await page
      .locator('[role="tab"][id^="tab-miaplaedia-"]')
      .evaluateAll((tabs) => tabs.map((tab) => tab.id).sort());
    expect(childIds, `${locale} seven guide route IDs`).toEqual(expectedChildIds);
    expectSameIdentity(await readIdentity(page), baseline, locale);

    for (const paneId of MIAPLAEDIA_PANE_IDS) {
      const route = page.locator(`#tab-${paneId}`);
      await route.click();
      await expect(route).toHaveAttribute("aria-selected", "true");
      await expect(route).toHaveAttribute("aria-controls", `panel-${paneId}`);
      await expect(page.locator(`#panel-${paneId}`)).toBeVisible();
    }
  }

  await saveNowFromSettings(page);
  const afterSave = await readIdentity(page);
  expect(afterSave.saveHeads).toEqual(baseline.saveHeads);
  expect(afterSave.lastStartedSlot).toBe(baseline.lastStartedSlot);
});
