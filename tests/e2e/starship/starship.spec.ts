import type { BrowserContext, Page } from "@playwright/test";
import { createRequire } from "node:module";
import { expect, test } from "../_harness/fixtures";
import { formatNumber } from "../../../src/app/numberFormatting";
import { createStarCatalogue } from "../../../src/content/starCatalogue";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { starshipTravelPlan } from "../../../src/engine/spaceMechanics";
import { playerFleetBuildCost } from "../../../src/engine/fleetMechanics";
import { starshipModulePartCost } from "../../../src/engine/spaceRules";
import type { GameState } from "../../../src/engine/state";
import { spaceText } from "../../../src/i18n/spaceMessages";
import {
  LOCALIZATION_VALIDATION_DATA as STARSHIP_LOCALIZATION,
  starshipScanTokenText,
  starshipText,
} from "../../../src/i18n/starshipMessages";
import { canonicalJson, makeEnvelope, type SaveEnvelopeV1 } from "../../../src/persistence/schema";
import { saveNowFromSettings, resumeSavedPioneer } from "../_harness/save-controls";
import { setGameLocale } from "../_harness/settings-controls";

type StoredEntry = readonly [string, string];

const { compressToUTF16, decompressFromUTF16 } = createRequire(import.meta.url)(
  "lz-string",
) as typeof import("lz-string");

function saveWithAntimatter(entries: readonly StoredEntry[], quantity: number): StoredEntry[] {
  const values = new Map(entries);
  const slotId = values.get("miaplacidus:v1:lastStartedSlot") ?? null;
  if (!slotId) throw new Error("The Starship test save was not marked as the latest save.");
  const commitId = values.get(`miaplacidus:v1:head:${slotId}`);
  if (!commitId) throw new Error("The Starship test save has no committed generation.");
  const payloadKey = `miaplacidus:v1:slot:${slotId}:${commitId}`;
  const payload = values.get(payloadKey);
  if (!payload) throw new Error("The Starship test save payload could not be read.");
  const json = decompressFromUTF16(payload);
  if (!json) throw new Error("The Starship test save payload could not be decompressed.");
  const envelope = JSON.parse(json) as SaveEnvelopeV1;
  const state: GameState = {
    ...envelope.state,
    run: {
      ...envelope.state.run,
      space: { ...envelope.state.run.space, antimatter: quantity },
    },
  };
  const updated = makeEnvelope({
    slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: Math.max(Date.now(), envelope.savedAt),
    revision: envelope.revision + 1,
    state,
  });
  values.set(payloadKey, compressToUTF16(canonicalJson(updated)));
  return [...values.entries()];
}

async function openSavedPioneer(
  context: BrowserContext,
  entries: readonly StoredEntry[],
): Promise<Page> {
  const page = await context.newPage();
  await page.addInitScript(
    (storedEntries: StoredEntry[]) => {
      const prefix = "miaplacidus:v1:";
      const keys = Array.from({ length: localStorage.length }, (_, index) =>
        localStorage.key(index),
      ).filter((key): key is string => key?.startsWith(prefix) ?? false);
      for (const key of keys) localStorage.removeItem(key);
      for (const [key, value] of storedEntries) localStorage.setItem(key, value);
    },
    [...entries],
  );
  await page.goto("/");
  await resumeSavedPioneer(page, "Starship Pioneer");
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  return page;
}

async function browserLocalStorageEntries(page: Page): Promise<StoredEntry[]> {
  return page.evaluate(() => {
    const prefix = "miaplacidus:v1:";
    const entries: StoredEntry[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith(prefix)) continue;
      const value = localStorage.getItem(key);
      if (value !== null) entries.push([key, value]);
    }
    return entries;
  });
}

async function startStarshipFixture(
  page: import("@playwright/test").Page,
  fixture:
    | "space-starship"
    | "space-starship-ready"
    | "space-starship-scanning"
    | "space-starship-scanning-blind"
    | "space-diplomacy" = "space-starship",
  locale: LocaleId = "en",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261003&testLocale=${locale}&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("Starship Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function prepareStarshipTowardSirius(
  page: import("@playwright/test").Page,
  buildScanner = false,
): Promise<string> {
  await page.getByRole("tab", { name: "Interstellar" }).click();
  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: "Search stars" }).fill("Sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: "Set as destination" })
    .click();
  const destinationId = (await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.starship.destinationSystemId,
  ))!;

  await page.getByRole("tab", { name: "Starship" }).click();
  const pane = page.getByTestId("starship-pane");
  if (buildScanner) {
    const scanner = pane.getByTestId("starship-module-stellarScanner");
    const buildPart = scanner.getByRole("button", { name: "Build one part" });
    for (let part = 0; part < 8; part += 1) await buildPart.click();
    await expect(scanner).toHaveCount(0);
  }
  return destinationId;
}

async function launchPreparedStarship(
  page: import("@playwright/test").Page,
  destinationId: string,
): Promise<{ destinationId: string; durationMs: number }> {
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Starship" }).click();
  const pane = page.getByTestId("starship-pane");
  const launchButton = pane.getByRole("button", { name: "Launch starship" });
  await launchButton.click();
  await page
    .getByRole("dialog", { name: "Warning: point of no return" })
    .getByRole("button", { name: "Confirm launch" })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("travelling");

  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const timerId = state.run.space.starship.timerId!;
  return {
    destinationId,
    durationMs: state.run.timers[timerId]!.durationMs,
  };
}

async function launchStarshipTowardSirius(
  page: import("@playwright/test").Page,
  buildScanner = false,
): Promise<{ destinationId: string; durationMs: number }> {
  const destinationId = await prepareStarshipTowardSirius(page, buildScanner);
  return launchPreparedStarship(page, destinationId);
}

async function expectSelectedRouteReadiness(
  page: import("@playwright/test").Page,
  className: "green-ready-text" | "red-disabled-text",
): Promise<void> {
  const route = page.getByTestId("star-map-selected-route");
  await expect(route).toBeVisible();
  await expect(route).toHaveAttribute(
    "data-affordable",
    className === "green-ready-text" ? "true" : "false",
  );
  await expect(route).toHaveClass(new RegExp(className));
  const label = route.getByTestId("star-map-selected-route-label");
  await expect(label).toContainText("Distance:");
  await expect(label).toContainText("Antimatter required:");
}

test("builds required modules at discounted costs while the scanner stays optional @starship", async ({
  page,
}) => {
  await startStarshipFixture(page);
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Starship" }).click();

  const pane = page.getByTestId("starship-pane");
  await expect(pane.locator("[data-testid^='starship-module-']")).toHaveCount(5);
  await expect(pane.locator(".starship-module-badge")).toHaveCount(0);
  await expect(pane.getByTestId("starship-readiness")).toHaveAttribute("data-status", "building");

  const structural = pane.getByTestId("starship-module-structural");
  await expect(structural).toContainText(`${formatNumber("en", 3_610)} Steel`);
  await expect(structural).toContainText(`${formatNumber("en", 1_353.75)} Titanium`);
  await expect(structural).toContainText(`${formatNumber("en", 4_061.25)} Silicon`);
  await expect(structural).toContainText(`$${formatNumber("en", 2_707.5, 2)}`);

  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  await structural.getByRole("button", { name: "Build one part" }).click();
  const afterFirstPart = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(afterFirstPart.run.cash).toBeCloseTo(before.run.cash - 2_707.5, 6);
  expect(afterFirstPart.run.goods.steel.quantity).toBeCloseTo(
    before.run.goods.steel.quantity - 3_610,
    6,
  );
  expect(afterFirstPart.run.goods.titanium.quantity).toBeCloseTo(
    before.run.goods.titanium.quantity - 1_353.75,
    6,
  );
  expect(afterFirstPart.run.goods.silicon.quantity).toBeCloseTo(
    before.run.goods.silicon.quantity - 4_061.25,
    6,
  );

  const requiredModules = [
    ["structural", 20],
    ["lifeSupport", 10],
    ["antimatterEngine", 16],
    ["fleetHangar", 1],
  ] as const;
  for (const [moduleId, partCount] of requiredModules) {
    const card = pane.getByTestId(`starship-module-${moduleId}`);
    const builtParts =
      moduleId === "structural"
        ? afterFirstPart.run.space.starshipModules.structural.builtParts
        : 0;
    for (let index = builtParts; index < partCount; index += 1) {
      await card.getByRole("button", { name: "Build one part" }).click();
    }
    await expect(card).toHaveCount(0);
  }

  await expect(pane.getByTestId("starship-readiness")).toHaveAttribute("data-status", "ready");
  const readyNotice = page.locator(
    '[data-testid="game-notification"][data-classification="starShip"]',
  );
  await expect(readyNotice).toHaveText("Starship can now be launched!");
  await expect(readyNotice).toHaveClass(/notification-info/);
  const scanner = pane.getByTestId("starship-module-stellarScanner");
  await expect(scanner).toBeVisible();
  await expect(scanner.getByRole("button", { name: "Build one part" })).toBeEnabled();
  const travelSummary = pane.locator(".starship-travel-summary");
  await expect(travelSummary).toBeVisible();
  const summaryPrecedesIllustration = await travelSummary.evaluate((summary) => {
    const illustration = summary.parentElement?.querySelector(".space-card-illustration-wrap");
    return Boolean(
      illustration &&
      summary.compareDocumentPosition(illustration) & Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
  expect(summaryPrecedesIllustration).toBe(true);
  for (let part = 0; part < 8; part += 1) {
    await scanner.getByRole("button", { name: "Build one part" }).click();
  }
  await expect(scanner).toHaveCount(0);
  await expect(pane.locator(".starship-module-grid")).toHaveCount(0);
});

test("cancels the point-of-no-return prompt and arrives through the saved voyage timer @starship", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-starship-ready");
  await page.getByRole("tab", { name: "Interstellar" }).click();

  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: "Search stars" }).fill("Sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: "Set as destination" })
    .click();

  const starship = page.getByTestId("starship-pane");
  await page.getByRole("tab", { name: "Starship" }).click();
  const launchButton = starship.getByRole("button", { name: "Launch starship" });
  await expect(launchButton).toBeEnabled();
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  await launchButton.click();

  const warning = page.getByRole("dialog", { name: "Warning: point of no return" });
  await expect(warning).toBeVisible();
  expect(await warning.evaluate((element) => element.matches(":modal"))).toBe(true);
  await expect(warning).toContainText("cannot be recovered in this run");
  await warning.getByRole("button", { name: "Cancel" }).click();
  await expect(warning).toBeHidden();
  await expect(launchButton).toBeFocused();
  const afterCancel = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(afterCancel.run.space.starship.phase).toBe("unlaunched");
  expect(afterCancel.run.space.antimatter).toBe(before.run.space.antimatter);

  await launchButton.click();
  await page.keyboard.press("Escape");
  await expect(warning).toBeHidden();
  await expect(launchButton).toBeFocused();
  const afterEscape = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(afterEscape.run.space.starship.phase).toBe("unlaunched");
  expect(afterEscape.run.space.antimatter).toBe(before.run.space.antimatter);

  await launchButton.click();
  await page
    .getByRole("dialog", { name: "Warning: point of no return" })
    .getByRole("button", { name: "Confirm launch" })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("travelling");
  await expect(
    page.locator('[data-testid="game-notification"][data-classification="starShip"]'),
  ).toContainText("Starship launched toward Sirius");

  const travelling = await page.evaluate(() => window.miaplacidusTest!.getState());
  const voyageTimerId = travelling.run.space.starship.timerId!;
  expect(travelling.run.space.starship.destinationSystemId).not.toBeNull();
  expect(travelling.run.space.antimatter).toBe(
    before.run.space.antimatter - travelling.run.space.starship.antimatterSpent,
  );
  const voyageDuration = travelling.run.timers[voyageTimerId]!.durationMs;
  for (let elapsed = 0; elapsed < voyageDuration + 1; elapsed += 1_000_000) {
    await page.evaluate(
      (milliseconds) => window.miaplacidusTest!.advanceBy(milliseconds),
      Math.min(1_000_000, voyageDuration + 1 - elapsed),
    );
  }

  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("orbiting");
  const arrived = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(arrived.run.space.currentSystemId).toBe("spica");
  expect(arrived.run.space.starship.destinationSystemId).toBe(
    travelling.run.space.starship.destinationSystemId,
  );
  expect(arrived.run.timers[voyageTimerId]?.status).toBe("complete");
});

test("blocks the irreversible Starship launch one antimatter short @starship-fuel-shortfall", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-starship-ready");
  await page.getByRole("tab", { name: "Interstellar" }).click();

  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: "Search stars" }).fill("Sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: "Set as destination" })
    .click();
  await page.getByRole("tab", { name: "Starship" }).click();
  await saveNowFromSettings(page);

  const savedState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const destinationId = savedState.run.space.starship.destinationSystemId;
  expect(destinationId).not.toBeNull();
  const plan = starshipTravelPlan(savedState, destinationId!);
  expect(plan).not.toBeNull();
  const requiredFuel = plan!.antimatter;
  expect(requiredFuel).toBeGreaterThan(0);
  const formattedFuel = formatNumber(
    savedState.settings.locale,
    requiredFuel,
    2,
    savedState.settings.notation,
  );
  const savedEntries = await browserLocalStorageEntries(page);
  const context = page.context();
  await page.close();

  const shortfallEntries = saveWithAntimatter(savedEntries, requiredFuel - 1);
  const shortfallPage = await openSavedPioneer(context, shortfallEntries);
  try {
    await shortfallPage.getByRole("tab", { name: "Interstellar" }).click();
    await expectSelectedRouteReadiness(shortfallPage, "red-disabled-text");
    await shortfallPage.getByRole("tab", { name: "Starship" }).click();
    const starship = shortfallPage.getByTestId("starship-pane");
    const travelSummary = starship.locator(".starship-travel-summary");
    await expect(travelSummary.locator(".space-cost-list")).toContainText(
      `${starshipText("en", "fuelCost")}: ${formattedFuel}`,
    );
    const launchButton = travelSummary.getByRole("button", { name: "Launch starship" });
    await expect(launchButton).toBeDisabled();
    await expect(launchButton).toHaveAttribute("aria-describedby", "starship-launch-reason");
    await expect(travelSummary.locator("#starship-launch-reason")).toHaveText(
      spaceText(savedState.settings.locale, "reasonInsufficientAntimatter", {
        amount: formattedFuel,
      }),
    );
    const shortfallState = await shortfallPage.evaluate(() => window.miaplacidusTest!.getState());
    expect(shortfallState.run.space.antimatter).toBe(requiredFuel - 1);
  } finally {
    await shortfallPage.close();
  }

  const exactStockEntries = saveWithAntimatter(savedEntries, requiredFuel);
  const exactStockPage = await openSavedPioneer(context, exactStockEntries);
  try {
    await exactStockPage.getByRole("tab", { name: "Interstellar" }).click();
    await expectSelectedRouteReadiness(exactStockPage, "green-ready-text");
    await exactStockPage.getByRole("tab", { name: "Starship" }).click();
    const starship = exactStockPage.getByTestId("starship-pane");
    const travelSummary = starship.locator(".starship-travel-summary");
    await expect(travelSummary.locator(".space-cost-list")).toContainText(
      `${starshipText("en", "fuelCost")}: ${formattedFuel}`,
    );
    const launchButton = travelSummary.getByRole("button", { name: "Launch starship" });
    await expect(launchButton).toBeEnabled();
    await expect(launchButton).not.toHaveAttribute("aria-describedby", "starship-launch-reason");
    const beforeCancel = await exactStockPage.evaluate(() => window.miaplacidusTest!.getState());
    expect(beforeCancel.run.space.antimatter).toBe(requiredFuel);

    await launchButton.click();
    const warning = exactStockPage.getByRole("dialog", { name: "Warning: point of no return" });
    await expect(warning).toBeVisible();
    await warning.getByRole("button", { name: starshipText("en", "cancelLaunch") }).click();
    await expect(warning).toBeHidden();
    await expect(launchButton).toBeEnabled();
    const afterCancel = await exactStockPage.evaluate(() => window.miaplacidusTest!.getState());
    expect(afterCancel.run.space.starship.phase).toBe("unlaunched");
    expect(afterCancel.run.space.antimatter).toBe(requiredFuel);
  } finally {
    await exactStockPage.close();
  }
});

test("shows the starship's live journey countdown on its page @starship-live-countdown", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-starship-ready");
  await page.getByRole("tab", { name: "Interstellar" }).click();

  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: "Search stars" }).fill("Sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: "Set as destination" })
    .click();

  await page.getByRole("tab", { name: "Starship" }).click();
  const starship = page.getByTestId("starship-pane");
  await starship.getByRole("button", { name: "Launch starship" }).click();
  await page
    .getByRole("dialog", { name: "Warning: point of no return" })
    .getByRole("button", { name: "Confirm launch" })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("travelling");

  const journeyCountdown = starship.getByTestId("starship-journey-countdown");
  await expect(journeyCountdown).toBeVisible();
  await expect(journeyCountdown).toContainText("Journey time remaining:");
  const journeyProgress = starship.getByRole("progressbar", {
    name: starshipText("en", "journeyProgress"),
    exact: true,
  });
  await expect(journeyProgress).toBeVisible();
  await expect(journeyProgress).toHaveAttribute(
    "aria-label",
    starshipText("en", "journeyProgress"),
  );
  const initialProgress = await journeyProgress.evaluate((element) => {
    const progress = element as HTMLProgressElement;
    return { value: progress.value, max: progress.max };
  });
  expect(initialProgress).toEqual({ value: expect.any(Number), max: 100 });
  expect(initialProgress.value).toBeGreaterThanOrEqual(0);
  expect(initialProgress.value).toBeLessThan(initialProgress.max);
  const initialRemainingMs = Number(await journeyCountdown.getAttribute("data-remaining-ms"));
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(async () => Number(await journeyCountdown.getAttribute("data-remaining-ms")))
    .toBeLessThan(initialRemainingMs);
  await expect
    .poll(() => journeyProgress.evaluate((progress) => (progress as HTMLProgressElement).value))
    .toBeGreaterThan(initialProgress.value);
});

test("localizes Starship journey progress name and values in every locale @starship-locale-timers", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-starship-ready");
  await page.locator("#tab-interstellar").click();

  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: "Search stars" }).fill("Sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: "Set as destination" })
    .click();
  await page.locator("#tab-interstellar-starship").click();
  const starship = page.getByTestId("starship-pane");
  await starship.getByRole("button", { name: "Launch starship" }).click();
  await page
    .getByRole("dialog", { name: "Warning: point of no return" })
    .getByRole("button", { name: "Confirm launch" })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("travelling");

  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await page.locator("#tab-interstellar").click();
    await page.locator("#tab-interstellar-starship").click();

    expect(STARSHIP_LOCALIZATION.messages[locale].journeyProgress).toBeTruthy();
    expect(STARSHIP_LOCALIZATION.messages[locale].journeyTimeRemaining).toBeTruthy();
    const countdown = starship.getByTestId("starship-journey-countdown");
    const progress = starship.getByRole("progressbar", {
      name: starshipText(locale, "journeyProgress"),
      exact: true,
    });
    await expect(countdown).toContainText(
      starshipText(locale, "journeyTimeRemaining", { time: "" }).trim(),
    );
    await expect(progress).toBeVisible();
    await expect(progress).toHaveAttribute("aria-label", starshipText(locale, "journeyProgress"));
    await expect(progress).toHaveAttribute("max", "100");
    const values = await progress.evaluate((element) => {
      const bar = element as HTMLProgressElement;
      return { value: bar.value, max: bar.max };
    });
    expect(values.max).toBe(100);
    expect(values.value).toBeGreaterThanOrEqual(0);
    expect(values.value).toBeLessThan(values.max);

    await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
    await expect
      .poll(() => progress.evaluate((element) => (element as HTMLProgressElement).value))
      .toBeGreaterThan(values.value);
  }
});

test("localizes Colonise scan report labels and numeric readings in every locale @starship-locale-report", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-starship-scanning");
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-starship").click();
  const starship = page.getByTestId("starship-pane");
  await starship.getByTestId("starship-scan-system-button").click();
  await expect(starship.getByTestId("starship-scan-complete")).toBeVisible();

  const scanState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const encounter = scanState.run.space.systemEncounters[0];
  expect(encounter).toBeDefined();
  const labelKeys = [
    "raceName",
    "civilization",
    "population",
    "threat",
    "defense",
    "attitude",
    "impression",
    "patience",
    "enemyFleets",
    "enemyFleetPower",
    "lifeformTraits",
    "anomalies",
  ] as const;

  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await page.locator("#tab-interstellar").click();
    await page.locator("#tab-interstellar-colonise").click();

    for (const key of labelKeys) {
      expect(STARSHIP_LOCALIZATION.messages[locale][key], `${locale} copy for ${key}`).toBeTruthy();
    }
    const statusKey = encounter!.lifeDetected ? "lifeDetected" : "noLifeDetected";
    expect(STARSHIP_LOCALIZATION.messages[locale][statusKey]).toBeTruthy();
    const report = starship.getByTestId("starship-colonise-scan-report");
    await expect(report).toBeVisible();
    await expect(
      report.getByRole("heading", { name: starshipText(locale, "scanReport") }),
    ).toBeVisible();
    const labels = report.locator("dt");
    await expect(labels).toHaveText(labelKeys.map((key) => starshipText(locale, key)));
    await expect(report.getByTestId("starship-system-scan-results")).toHaveText(
      starshipText(locale, encounter!.lifeDetected ? "lifeDetected" : "noLifeDetected"),
    );
    const readings = report.locator("dd");
    await expect(readings).toHaveCount(labelKeys.length);
    for (const reading of await readings.allTextContents()) {
      expect(reading.trim().length).toBeGreaterThan(0);
    }
    await expect(readings.nth(0)).toHaveText(encounter!.raceName);
    await expect(readings.nth(2)).toHaveText(
      formatNumber(locale, encounter!.populationEstimate, 2, scanState.settings.notation),
    );
    await expect(readings.nth(4)).toHaveText(
      formatNumber(locale, encounter!.defenseRating, 2, scanState.settings.notation),
    );
    await expect(readings.nth(1)).toHaveText(
      starshipScanTokenText(locale, "civilization", encounter!.civilizationLevel),
    );
    await expect(readings.nth(3)).toHaveText(
      starshipScanTokenText(locale, "threat", encounter!.threatLevel),
    );
    await expect(readings.nth(5)).toHaveText(
      starshipScanTokenText(locale, "attitude", encounter!.attitude),
    );
    await expect(readings.nth(7)).toHaveText(
      formatNumber(locale, encounter!.patience, 2, scanState.settings.notation),
    );
    await expect(readings.nth(10)).toHaveText(
      encounter!.lifeformTraits
        .map((trait) => starshipScanTokenText(locale, "trait", trait))
        .join(", "),
    );
    await expect(readings.nth(11)).toHaveText(
      encounter!.anomalies
        .map((anomaly) => starshipScanTokenText(locale, "anomaly", anomaly))
        .join(", ") || "—",
    );
  }
});

test("shows the travelling ship progress and destination orbit on Star Map @starship-flight-visuals", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-starship-ready");
  const { destinationId, durationMs } = await launchStarshipTowardSirius(page);
  await page.locator("#tab-interstellar-star-map").click();

  const map = page.getByTestId("star-map-pane");
  const travel = map.getByTestId("starship-route-travel");
  const shipMarker = map.getByTestId("starship-route-ship-marker");
  await expect(map).toBeVisible();
  await expect(map.locator(".star-map-travel-line")).toBeVisible();
  await expect(travel).toBeVisible();
  await expect(shipMarker).toBeVisible();
  const initialTransform = await shipMarker.getAttribute("transform");

  await page.evaluate(
    (milliseconds) => window.miaplacidusTest!.advanceBy(milliseconds),
    Math.floor(durationMs * 0.35),
  );
  await expect
    .poll(async () => Number(await travel.getAttribute("data-travel-progress")))
    .toBeGreaterThanOrEqual(0.35);
  await expect.poll(() => shipMarker.getAttribute("transform")).not.toBe(initialTransform);

  await page.evaluate(
    (milliseconds) => window.miaplacidusTest!.advanceBy(milliseconds),
    durationMs,
  );
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("orbiting");
  const arrived = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(arrived.run.space.starship.destinationSystemId).toBe(destinationId);
  await expect(map.getByTestId("starship-route-travel")).toHaveCount(0);
  await expect(map.getByTestId("starship-route-orbit")).toBeVisible();
  await expect(map.getByTestId("starship-route-orbit-arrow")).toBeVisible();
  const destinationMarker = map.getByTestId(`star-marker-${destinationId}`);
  const destinationCenter = await destinationMarker.evaluate((marker) => {
    const svg = marker.closest(".star-map-layout")?.querySelector(".star-map-canvas");
    if (!(svg instanceof SVGSVGElement)) throw new Error("Star Map SVG was not found.");
    const bounds = marker.getBoundingClientRect();
    const point = svg.createSVGPoint();
    point.x = bounds.left + bounds.width / 2;
    point.y = bounds.top + bounds.height / 2;
    const local = point.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: local.x, y: local.y };
  });
  const orbitCenter = await map
    .getByTestId("starship-route-orbit")
    .locator(".star-map-orbit-ring")
    .evaluate((ring) => ({
      x: Number(ring.getAttribute("cx")),
      y: Number(ring.getAttribute("cy")),
    }));
  expect(orbitCenter.x).toBeCloseTo(destinationCenter.x, 1);
  expect(orbitCenter.y).toBeCloseTo(destinationCenter.y, 1);
});

test("keeps Starship scanning unavailable before travel even with the scanner built @starship-scan-threshold", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-starship-ready");
  await prepareStarshipTowardSirius(page, true);
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.space.starship.phase).toBe("unlaunched");
  await expect(page.getByTestId("starship-system-scan")).toHaveCount(0);
});

test("scans an orbiting destination once and persists stable hostility data @starship", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-starship-scanning");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Starship" }).click();

  const pane = page.getByTestId("starship-pane");
  const scanButton = pane.getByTestId("starship-scan-system-button");
  const scanAnnouncement = pane.getByTestId("starship-scan-announcement");
  await expect(scanButton).toBeEnabled();
  await expect(scanAnnouncement).toBeEmpty();
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  await scanButton.click();
  const scannedSystemName = createStarCatalogue().find(
    ({ id }) => id === before.run.space.starship.destinationSystemId,
  )!.name;
  const scanNotice = page.locator(
    '[data-testid="game-notification"][data-classification="starShip"]',
  );
  await expect(scanNotice).toHaveText(`${scannedSystemName} System Scanned!`);
  await expect(scanNotice).toHaveClass(/notification-info/);
  await expect(pane.getByTestId("starship-scan-complete")).toBeVisible();
  await expect(pane.getByTestId("starship-system-scan-results")).toBeHidden();
  await expect(scanAnnouncement).toHaveAttribute("aria-live", "polite");
  await expect(scanAnnouncement).toHaveAttribute("aria-atomic", "true");
  await expect(scanAnnouncement).toHaveText("System scan complete");
  await page.getByRole("tab", { name: "Colonise" }).click();
  const scanReport = pane.getByTestId("starship-colonise-scan-report");
  await expect(scanReport).toBeVisible();
  await expect(scanReport.getByTestId("starship-system-scan-results")).toContainText(
    /Life detected|No life detected/,
  );

  const scanned = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(scanned.run.space.systemEncounters).toHaveLength(1);
  expect(scanned.run.space.systemEncounters[0]?.systemId).toBe(
    before.run.space.starship.destinationSystemId,
  );
  expect(scanned.run.space.systemEncounters[0]?.raceName.length).toBeGreaterThan(0);
  expect(scanned.run.space.systemEncounters[0]?.currentImpression).toBe(
    scanned.run.space.systemEncounters[0]?.initialImpression,
  );
  expect(scanned.run.space.systemEncounters[0]?.latestDifferenceInImpression).toBe(0);
  expect(scanned.run.random).toEqual(before.run.random);
  expect(scanned.run.space.systemEncounters[0]?.anomalies.length).toBeLessThanOrEqual(2);

  const repeated = await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({ type: "space.starship.system.scan" }),
  );
  expect(repeated).toBe(false);
  const afterRepeatedScan = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(afterRepeatedScan.run.space.systemEncounters).toHaveLength(1);
});

test("allows a scan without a Stellar Scanner and marks its readings unknown @starship", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-starship-scanning-blind");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Starship" }).click();

  const pane = page.getByTestId("starship-pane");
  const stateBefore = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(stateBefore.run.space.starshipModules.stellarScanner.builtParts).toBe(0);
  const scanButton = pane.getByTestId("starship-scan-system-button");
  await expect(scanButton).toBeEnabled();
  await scanButton.click();
  await expect(pane.getByTestId("starship-scan-limited-notice")).toContainText(
    "No Stellar Scanner is installed",
  );

  await page.getByRole("tab", { name: "Colonise" }).click();
  const report = pane.getByTestId("starship-colonise-scan-report");
  await expect(report.getByTestId("starship-scan-report-limited-notice")).toBeVisible();
  await expect(report.getByTestId("starship-system-scan-results")).toHaveText("???");
  await expect(report.getByTestId("starship-system-scan-results")).toHaveClass(/red-disabled-text/);
  await expect(report.locator("dd")).toHaveText(Array(12).fill("???"));

  const scanned = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(scanned.run.space.systemEncounters).toHaveLength(1);
});

test("builds an Envoy and records message and harmony effects @starship", async ({ page }) => {
  await startStarshipFixture(page, "space-diplomacy");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Fleet Hangar" }).click();

  const pane = page.getByTestId("starship-pane");
  const hangar = pane.getByTestId("starship-fleet-hangar");
  const diplomacy = pane.getByTestId("starship-diplomacy");
  const initial = await page.evaluate(() => window.miaplacidusTest!.getState());
  await page.getByRole("tab", { name: "Colonise" }).click();
  const messageButton = diplomacy.getByRole("button", { name: "Send a message" });
  await expect(messageButton).toBeDisabled();
  await expect(messageButton).toHaveAttribute(
    "aria-describedby",
    "starship-diplomacy-message-reason",
  );
  await expect(diplomacy.locator("#starship-diplomacy-message-reason")).toContainText(
    "Scan a sentient civilization and build an Envoy",
  );
  await page.getByRole("tab", { name: "Fleet Hangar" }).click();
  await hangar.getByRole("button", { name: "Build Envoy" }).click();

  const built = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(built.run.space.fleetEnvoyBuilt).toBe(true);
  expect(built.run.cash).toBe(initial.run.cash - 2_000);
  expect(built.run.goods.hydrogen.quantity).toBe(initial.run.goods.hydrogen.quantity - 8_000);
  expect(built.run.goods.silicon.quantity).toBe(initial.run.goods.silicon.quantity - 300);
  expect(built.run.goods.titanium.quantity).toBe(initial.run.goods.titanium.quantity - 120);

  await pane
    .getByTestId("starship-fleet-scout")
    .getByRole("button", { name: "Build one ship" })
    .click();
  const scoutBuilt = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(scoutBuilt.run.space.playerFleets.scout).toBe(1);
  expect(scoutBuilt.run.cash).toBe(built.run.cash - 5_000);
  expect(scoutBuilt.run.goods.hydrogen.quantity).toBe(built.run.goods.hydrogen.quantity - 14_000);
  expect(scoutBuilt.run.goods.silicon.quantity).toBe(built.run.goods.silicon.quantity - 1_000);
  expect(scoutBuilt.run.goods.titanium.quantity).toBe(built.run.goods.titanium.quantity - 300);

  await page.getByRole("tab", { name: "Colonise" }).click();
  await diplomacy.getByRole("button", { name: "Send a message" }).click();
  await expect(pane.getByTestId("starship-diplomacy-message")).toBeVisible();
  const messaged = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(messaged.run.space.systemEncounters[0]?.lastDiplomacyMessage).toMatch(/^message/);
  expect(messaged.run.space.systemEncounters[0]?.patience).toBe(4);

  await diplomacy.getByRole("button", { name: "Seek harmony" }).click();
  const harmonized = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(harmonized.run.space.systemEncounters[0]?.lastDiplomacyMessage).toMatch(/^harmony/);
  expect(harmonized.run.space.systemEncounters[0]?.patience).toBeLessThanOrEqual(2);
});

test("shows the Envoy shortfall one unit below cost and enables it at exact stock @starship-affordability", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-diplomacy");

  // Shape the deterministic fixture with valid sale commands; the Envoy
  // action itself is checked and completed through its visible UI control.
  await page.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    const targets = { hydrogen: 7_999, silicon: 300, titanium: 120 } as const;
    for (const [goodId, target] of Object.entries(targets)) {
      const quantity = state.run.goods[goodId as keyof typeof targets].quantity;
      if (
        !window.miaplacidusTest!.dispatch({
          type: "resource.sell",
          goodId: goodId as keyof typeof targets,
          amount: quantity - target,
        })
      ) {
        throw new Error(`Could not prepare ${goodId} stock for the Envoy affordability check.`);
      }
    }
  });

  const underfunded = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(underfunded.run.goods.hydrogen.quantity).toBe(7_999);
  expect(underfunded.run.goods.silicon.quantity).toBe(300);
  expect(underfunded.run.goods.titanium.quantity).toBe(120);

  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Fleet Hangar" }).click();
  const hangar = page.getByTestId("starship-fleet-hangar");
  const envoyButton = hangar.getByRole("button", { name: "Build Envoy" });
  await expect(envoyButton).toBeDisabled();
  await expect(envoyButton).toHaveAttribute("aria-describedby", "starship-envoy-reason");
  await expect(hangar.locator("#starship-envoy-reason")).toHaveText(
    `Not enough Hydrogen. Required: ${formatNumber("en", 8_000)}.`,
  );

  await page.getByRole("tab", { name: "Resources" }).click();
  await page.getByRole("button", { name: "Collect 1 Hydrogen", exact: true }).click();
  const exactlyAffordable = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(exactlyAffordable.run.goods.hydrogen.quantity).toBe(8_000);
  expect(exactlyAffordable.run.goods.silicon.quantity).toBe(300);
  expect(exactlyAffordable.run.goods.titanium.quantity).toBe(120);

  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Fleet Hangar" }).click();
  await expect(envoyButton).toBeEnabled();
  await envoyButton.click();

  const built = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(built.run.space.fleetEnvoyBuilt).toBe(true);
  expect(built.run.goods.hydrogen.quantity).toBe(0);
  expect(built.run.goods.silicon.quantity).toBe(0);
  expect(built.run.goods.titanium.quantity).toBe(0);
  expect(built.run.cash).toBe(exactlyAffordable.run.cash - 2_000);
});

test("shows the module-part shortfall and enables construction once stock covers the quote @p06-starship-purchase-affordances", async ({
  page,
}) => {
  await startStarshipFixture(page);
  const cost = starshipModulePartCost("structural", 0, 2)!;
  const shortfall = cost.materials.find((material) => material.goodId === "silicon")!;
  const shortStock = Math.floor(shortfall.amount);

  const shaped = await page.evaluate(
    ({ target }) => {
      const state = window.miaplacidusTest!.getState();
      const quantity = state.run.goods.silicon.quantity;
      if (quantity < target + 1)
        throw new Error("The Starship fixture lacks Silicon for the boundary.");
      const result = window.miaplacidusTest!.dispatch({
        type: "resource.sell",
        goodId: "silicon",
        amount: quantity - target,
      });
      if (!result) throw new Error("Could not prepare the below-quote Silicon balance.");
      return window.miaplacidusTest!.getState();
    },
    { target: shortStock },
  );
  expect(shaped.run.goods.silicon.quantity).toBe(shortStock);

  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Starship" }).click();
  const structural = page.getByTestId("starship-module-structural");
  const buildButton = structural.getByRole("button", { name: "Build one part" });
  const costLines = structural.locator(".space-cost-list");
  await expect(costLines).toContainText(`${formatNumber("en", shortfall.amount)} Silicon`);
  await expect(buildButton).toBeDisabled();
  await expect(buildButton).toHaveAttribute(
    "aria-describedby",
    "starship-module-structural-reason",
  );
  await expect(structural.locator("#starship-module-structural-reason")).toHaveText(
    spaceText("en", "reasonInsufficientMaterial", {
      material: "Silicon",
      amount: formatNumber("en", shortfall.amount),
    }),
  );

  const collected = await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({ type: "resource.collect", goodId: "silicon", amount: 1 }),
  );
  expect(collected).toBe(true);
  await expect(buildButton).toBeEnabled();
  const beforeBuild = await page.evaluate(() => window.miaplacidusTest!.getState());
  await buildButton.click();
  const afterBuild = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(afterBuild.run.space.starshipModules.structural.builtParts).toBe(1);
  expect(afterBuild.run.cash).toBeCloseTo(beforeBuild.run.cash - cost.cash, 6);
  for (const material of cost.materials) {
    expect(afterBuild.run.goods[material.goodId].quantity).toBeCloseTo(
      beforeBuild.run.goods[material.goodId].quantity - material.amount,
      6,
    );
  }
});

test("shows the fleet-unit shortfall and enables purchase at exact stock @p06-starship-purchase-affordances", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-diplomacy");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const cost = playerFleetBuildCost(state, "scout");
  const shortfall = cost.materials.find((material) => material.goodId === "hydrogen")!;

  const shaped = await page.evaluate(
    ({ target }) => {
      const current = window.miaplacidusTest!.getState().run.goods.hydrogen.quantity;
      if (current < target + 1)
        throw new Error("The Fleet fixture lacks Hydrogen for the boundary.");
      const result = window.miaplacidusTest!.dispatch({
        type: "resource.sell",
        goodId: "hydrogen",
        amount: current - (target - 1),
      });
      if (!result) throw new Error("Could not prepare the one-unit-short Hydrogen balance.");
      return window.miaplacidusTest!.getState();
    },
    { target: shortfall.amount },
  );
  expect(shaped.run.goods.hydrogen.quantity).toBeCloseTo(shortfall.amount - 1, 6);

  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Fleet Hangar" }).click();
  const hangar = page.getByTestId("starship-fleet-hangar");
  const scout = hangar.getByTestId("starship-fleet-scout");
  const buildButton = scout.getByTestId("starship-fleet-build-scout");
  await expect(scout.locator(".space-cost-list")).toContainText(
    `${formatNumber("en", shortfall.amount)} Hydrogen`,
  );
  await expect(buildButton).toBeDisabled();
  await expect(buildButton).toHaveAttribute("aria-describedby", "starship-fleet-scout-reason");
  await expect(scout.locator("#starship-fleet-scout-reason")).toHaveText(
    spaceText("en", "reasonInsufficientMaterial", {
      material: "Hydrogen",
      amount: formatNumber("en", shortfall.amount),
    }),
  );

  const collected = await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({ type: "resource.collect", goodId: "hydrogen", amount: 1 }),
  );
  expect(collected).toBe(true);
  await expect(buildButton).toBeEnabled();
  const beforeBuild = await page.evaluate(() => window.miaplacidusTest!.getState());
  await buildButton.click();
  const afterBuild = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(afterBuild.run.space.playerFleets.scout).toBe(
    beforeBuild.run.space.playerFleets.scout + 1,
  );
  expect(afterBuild.run.cash).toBeCloseTo(beforeBuild.run.cash - cost.cash, 6);
  for (const material of cost.materials) {
    expect(afterBuild.run.goods[material.goodId].quantity).toBeCloseTo(
      beforeBuild.run.goods[material.goodId].quantity - material.amount,
      6,
    );
  }
});

test("Interstellar landmarks, panel names, headings, and focus order are coherent @p15 @accessibility", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-diplomacy");

  const main = page.getByRole("main");
  await expect(main).toHaveCount(1);
  await expect(main.getByRole("heading", { level: 1 })).toHaveCount(1);

  const gameNavigation = main.getByRole("navigation", { name: "Game sections" });
  const gameTablist = gameNavigation.getByRole("tablist", { name: "Game sections" });
  const interstellarTab = gameTablist.getByRole("tab", { name: "Interstellar" });
  await interstellarTab.click();
  await expect(interstellarTab).toHaveAttribute("aria-selected", "true");
  await expect(gameTablist.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);

  const interstellarPanel = main.locator("#pane-interstellar");
  await expect(interstellarPanel).toBeVisible();
  await expect(interstellarPanel).toHaveAttribute("role", "tabpanel");
  await expect(interstellarPanel).toHaveAttribute("aria-labelledby", "tab-interstellar");

  const childNavigation = main.getByRole("navigation", { name: "Pages in this section" });
  const childTablist = childNavigation.getByRole("tablist");
  const mapTab = childTablist.getByRole("tab", { name: "Star Map" });
  await mapTab.click();
  await expect(mapTab).toHaveAttribute("aria-selected", "true");
  await expect(childTablist.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
  const mapPanel = main.getByRole("tabpanel", { name: "Star Map" });
  await expect(mapPanel).toHaveAttribute("aria-labelledby", "tab-interstellar-star-map");
  await expect(
    mapPanel.getByRole("heading", { name: "Star Map", exact: true, level: 2 }),
  ).toBeVisible();
  await mapTab.focus();
  await page.keyboard.press("Tab");
  await expect(mapPanel).toBeFocused();

  const fleetTab = childTablist.getByRole("tab", { name: "Fleet Hangar" });
  await fleetTab.click();
  await expect(fleetTab).toHaveAttribute("aria-selected", "true");
  const fleetPanel = main.getByRole("tabpanel", { name: "Fleet Hangar" });
  await expect(fleetPanel).toBeVisible();
  await expect(fleetPanel).toHaveAttribute("aria-labelledby", "tab-interstellar-fleet-hangar");
  await expect(
    fleetPanel.getByRole("heading", { name: "Fleet Hangar", exact: true, level: 2 }),
  ).toBeVisible();
  await expect(fleetPanel.getByRole("heading", { level: 3 }).first()).toBeVisible();
  await expect(fleetPanel.getByRole("heading", { level: 4 }).first()).toBeVisible();
  await fleetTab.focus();
  await page.keyboard.press("Tab");
  await expect(fleetPanel).toBeFocused();
});

test("Fleet Hangar build controls support keyboard focus and activation @fleet-controls", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-diplomacy");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Fleet Hangar" }).click();

  const hangar = page.getByTestId("starship-fleet-hangar");
  const envoyButton = hangar.getByRole("button", { name: "Build Envoy" });
  const scoutButton = hangar.getByTestId("starship-fleet-build-scout");
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());

  await envoyButton.focus();
  await page.keyboard.press("Tab");
  await expect(scoutButton).toBeFocused();
  expect(await scoutButton.evaluate((button) => button.matches(":focus-visible"))).toBe(true);
  const touchTarget = await scoutButton.boundingBox();
  expect(touchTarget?.height).toBeGreaterThanOrEqual(44);
  expect(touchTarget?.width).toBeGreaterThanOrEqual(44);

  await page.keyboard.press("Enter");
  await expect(scoutButton).toBeFocused();
  const after = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(after.run.space.playerFleets.scout).toBe(before.run.space.playerFleets.scout + 1);
});

test.describe("Fleet Hangar touch controls", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test("touch users can build a fleet ship at a narrow viewport @fleet-controls", async ({
    page,
  }) => {
    await startStarshipFixture(page, "space-diplomacy");
    await expect.poll(() => page.evaluate(() => navigator.maxTouchPoints)).toBeGreaterThan(0);
    await page.getByRole("tab", { name: "Interstellar" }).tap();
    await page.getByRole("tab", { name: "Fleet Hangar" }).tap();

    const hangar = page.getByTestId("starship-fleet-hangar");
    const scoutButton = hangar.getByTestId("starship-fleet-build-scout");
    const before = await page.evaluate(() => window.miaplacidusTest!.getState());
    const touchTarget = await scoutButton.boundingBox();
    expect(touchTarget?.height).toBeGreaterThanOrEqual(44);
    expect(touchTarget?.width).toBeGreaterThanOrEqual(44);

    await scoutButton.tap();
    const after = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(after.run.space.playerFleets.scout).toBe(before.run.space.playerFleets.scout + 1);
    const pageWidth = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(pageWidth.document).toBeLessThanOrEqual(pageWidth.viewport);
  });
});
