import { expect, test } from "../_harness/fixtures";
import { formatNumber } from "../../../src/app/numberFormatting";
import { LOCALE_IDS } from "../../../src/content/ids";
import { starshipTravelPlan } from "../../../src/engine/spaceMechanics";
import { starshipText } from "../../../src/i18n/starshipMessages";
import { saveNowFromSettings } from "../_harness/save-controls";
import { setGameLocale } from "../_harness/settings-controls";

test("locale switching preserves Starship travel identity, price, and save slot @locale @p49", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-starship-ready");
  await page.getByLabel("Pioneer name").fill("Starship Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);

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
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(4_000));
  await saveNowFromSettings(page);

  const readInvariant = () =>
    page.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      const starshipState = state.run.space.starship;
      const timer = starshipState.timerId ? state.run.timers[starshipState.timerId] : undefined;
      return {
        pioneerName: state.run.pioneerName,
        tabIds: Array.from(document.querySelectorAll<HTMLElement>('[role="tab"][id]'))
          .map((tab) => tab.id)
          .sort(),
        selectedStarshipTabId: document.querySelector<HTMLElement>("#tab-interstellar-starship")
          ?.id,
        selectedStarshipTab: document
          .querySelector<HTMLElement>("#tab-interstellar-starship")
          ?.getAttribute("aria-selected"),
        locale: state.settings.locale,
        notation: state.settings.notation,
        destinationSystemId: starshipState.destinationSystemId,
        phase: starshipState.phase,
        timerId: starshipState.timerId,
        timer: timer
          ? {
              id: timer.id,
              status: timer.status,
              durationMs: timer.durationMs,
              elapsedMs: timer.elapsedMs,
            }
          : null,
        antimatter: state.run.space.antimatter,
        antimatterSpent: starshipState.antimatterSpent,
        saveHeads: Array.from({ length: localStorage.length }, (_, index) =>
          localStorage.key(index),
        )
          .filter((key): key is string => key?.startsWith("miaplacidus:v1:head:") ?? false)
          .sort(),
        lastStartedSlot: localStorage.getItem("miaplacidus:v1:lastStartedSlot"),
      };
    });

  const baselineState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const destinationId = baselineState.run.space.starship.destinationSystemId;
  expect(destinationId).toBeTruthy();
  const baselineTravelPlan = starshipTravelPlan(baselineState, destinationId!);
  expect(baselineTravelPlan).not.toBeNull();
  const baseline = await readInvariant();
  expect(baseline.pioneerName).toBe("Starship Pioneer");
  expect(baseline.selectedStarshipTabId).toBe("tab-interstellar-starship");
  expect(baseline.selectedStarshipTab).toBe("true");
  expect(baseline.phase).toBe("travelling");
  expect(baseline.timer).toMatchObject({
    id: baseline.timerId,
    status: "running",
    durationMs: baselineTravelPlan!.durationMs,
  });
  expect(baseline.timer!.elapsedMs).toBeGreaterThan(0);
  expect(baseline.antimatterSpent).toBe(baselineTravelPlan!.antimatter);
  expect(baseline.saveHeads).toHaveLength(1);
  expect(baseline.lastStartedSlot).toBe(
    baseline.saveHeads[0]?.slice("miaplacidus:v1:head:".length),
  );

  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await page.locator("#tab-interstellar").click();
    await page.locator("#tab-interstellar-starship").click();
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    const expectedFuelCost = `${starshipText(locale, "fuelCost")}: ${formatNumber(
      locale,
      baselineTravelPlan!.antimatter,
      2,
      baseline.notation,
    )}`;
    await expect(
      starship.locator(".starship-travel-summary .space-cost-list li").nth(1),
    ).toHaveText(expectedFuelCost);
    const current = await readInvariant();
    expect(current.tabIds, `${locale} stable tab IDs`).toEqual(baseline.tabIds);
    expect(current.selectedStarshipTabId, `${locale} stable Starship tab ID`).toBe(
      baseline.selectedStarshipTabId,
    );
    expect(current.selectedStarshipTab, `${locale} selected Starship tab`).toBe("true");
    expect(current.pioneerName, `${locale} canonical pioneer`).toBe(baseline.pioneerName);
    expect(current.destinationSystemId, `${locale} travel destination`).toBe(
      baseline.destinationSystemId,
    );
    expect(current.phase, `${locale} travel phase`).toBe(baseline.phase);
    expect(current.timerId, `${locale} travel timer identity`).toBe(baseline.timerId);
    expect(current.timer, `${locale} active travel timer`).toMatchObject({
      id: baseline.timer!.id,
      status: baseline.timer!.status,
      durationMs: baseline.timer!.durationMs,
    });
    expect(
      current.timer!.elapsedMs,
      `${locale} travel progress must not reset`,
    ).toBeGreaterThanOrEqual(baseline.timer!.elapsedMs);
    expect(current.timer!.elapsedMs, `${locale} voyage remains active`).toBeLessThan(
      baseline.timer!.durationMs,
    );
    expect(current.antimatter, `${locale} antimatter balance`).toBe(baseline.antimatter);
    expect(current.antimatterSpent, `${locale} fuel price charged`).toBe(baseline.antimatterSpent);
    expect(current.saveHeads, `${locale} local save head`).toEqual(baseline.saveHeads);
    expect(current.lastStartedSlot, `${locale} canonical save slot`).toBe(baseline.lastStartedSlot);
  }

  await saveNowFromSettings(page);
  const afterSave = await readInvariant();
  expect(afterSave.saveHeads).toEqual(baseline.saveHeads);
  expect(afterSave.lastStartedSlot).toBe(baseline.lastStartedSlot);
});
