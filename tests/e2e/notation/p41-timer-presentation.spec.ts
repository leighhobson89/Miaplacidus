import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { formatDuration } from "../../../src/app/timeFormatting";
import { rocketText } from "../../../src/i18n/rocketMessages";
import { spaceText } from "../../../src/i18n/spaceMessages";
import { starshipText } from "../../../src/i18n/starshipMessages";
import { setNumberNotation } from "../_harness/settings-controls";

async function startSpaceFixture(
  page: import("@playwright/test").Page,
  fixture: "space-telescope" | "space-late-game" | "space-returning-rocket" = "space-late-game",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261003&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("P-41 Timer Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  const tutorial = page.locator(".progression-tutorial");
  if (await tutorial.isVisible()) {
    const dismissButton = page.getByRole("button", { name: "No thanks", exact: true });
    await expect(dismissButton).toBeVisible();
    await dismissButton.click();
  }
  await expect(tutorial).toHaveCount(0);
}

async function openRocketTimer(page: import("@playwright/test").Page) {
  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-rocket-1").click();
  const countdown = page.getByTestId("rocket-journey-countdown-rocket1");
  await expect(countdown).toBeVisible();
  return countdown;
}

async function startStarshipNotationFixture(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-starship-ready");
  await page.getByLabel("Pioneer name").fill("P-41 Starship Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("P-41 formats a live Rocket countdown in every notation @p41-notation", async ({
  page,
}, testInfo) => {
  await startSpaceFixture(page);
  const countdown = await openRocketTimer(page);
  const rocket = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.rockets.rocket1,
  );
  expect(rocket.phase).toBe("outbound");
  expect(rocket.timerId).toBeTruthy();
  const progress = page.getByRole("progressbar", {
    name: rocketText("en", "outbound"),
    exact: true,
  });

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    if (notation !== "condensed") {
      await setNumberNotation(page, notation);
      await expect
        .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().settings.notation))
        .toBe(notation);
      await openRocketTimer(page);
    }

    const remainingMs = Number(await countdown.getAttribute("data-remaining-ms"));
    expect(remainingMs).toBeGreaterThan(0);
    const rocketArtwork = page.locator('.page-artwork-row [data-celestial-illustration="rocket"]');
    const expected = rocketText("en", "journeyTimeRemaining", {
      time: formatDuration("en", remainingMs, notation),
    });
    await expect(countdown).toHaveText(expected);
    await expect(progress).toBeVisible();
    await expect(rocketArtwork).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    });
    await page.waitForTimeout(250);
    const measureRocketArtwork = () =>
      page.evaluate(() => {
        const row = document.querySelector<HTMLElement>(".page-artwork-row");
        const illustration = row?.querySelector<SVGElement>(
          '[data-celestial-illustration="rocket"]',
        );
        const artwork =
          illustration?.tagName.toLowerCase() === "svg"
            ? illustration
            : illustration?.querySelector<SVGElement>("svg");
        if (!row || !artwork) throw new Error("The large Rocket artwork SVG is missing.");
        const rowBounds = row.getBoundingClientRect();
        const artworkBounds = artwork.getBoundingClientRect();
        const style = getComputedStyle(artwork);
        const paths = Array.from(artwork.querySelectorAll<SVGGraphicsElement>("path"));
        return {
          row: {
            width: rowBounds.width,
            height: rowBounds.height,
            display: getComputedStyle(row).display,
          },
          svg: {
            width: artworkBounds.width,
            height: artworkBounds.height,
            viewBox: artwork.getAttribute("viewBox"),
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            fill: style.fill,
            stroke: style.stroke,
            pathCount: paths.length,
            pathBounds: paths.map((path) => {
              const bounds = path.getBoundingClientRect();
              return {
                width: bounds.width,
                height: bounds.height,
                fill: getComputedStyle(path).fill,
                stroke: getComputedStyle(path).stroke,
              };
            }),
          },
        };
      });
    const artworkPath = testInfo.outputPath(`p41-live-rocket-art-row-${notation}.png`);
    const fullPagePath = testInfo.outputPath(`p41-live-rocket-full-page-${notation}.png`);
    console.log(
      `${notation} large Rocket artwork before capture`,
      JSON.stringify(await measureRocketArtwork()),
    );
    await rocketArtwork.screenshot({ path: artworkPath, animations: "disabled" });
    console.log(`${notation} large Rocket artwork image: ${artworkPath}`);
    console.log(
      `${notation} large Rocket artwork after element image`,
      JSON.stringify(await measureRocketArtwork()),
    );
    await page.screenshot({ path: fullPagePath, fullPage: true, animations: "disabled" });
    console.log(`${notation} full-page image: ${fullPagePath}`);
    console.log(
      `${notation} large Rocket artwork after full-page image`,
      JSON.stringify(await measureRocketArtwork()),
    );
    await expect(rocketArtwork).toHaveScreenshot(`p41-rocket-artwork-${notation}.png`, {
      animations: "disabled",
      maxDiffPixelRatio: 0.01,
    });
    await page.mouse.move(1, 1);
    await captureVisualCheckpoint(page, testInfo, `p41-rocket-countdown-${notation}`, true, [
      page.locator('[data-testid="top-stat-time"] .top-stat-value'),
      page.getByTestId("cash-balance"),
      page.getByTestId("research-balance"),
      page.locator('[data-testid="top-stat-antimatter"] .top-stat-value'),
    ]);
  }
});

test("P-41 formats a live Starship countdown in every notation @p41-notation @p41-starship-notation", async ({
  page,
}) => {
  await startStarshipNotationFixture(page);
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
  await starship
    .getByRole("button", { name: starshipText("en", "launch"), exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Warning: point of no return" })
    .getByRole("button", { name: "Confirm launch" })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("travelling");

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    if (notation !== "condensed") await setNumberNotation(page, notation);
    await page.locator("#tab-interstellar").click();
    await page.locator("#tab-interstellar-starship").click();
    const countdown = starship.getByTestId("starship-journey-countdown");
    await expect(countdown).toBeVisible();
    await expect
      .poll(async () => {
        const remainingMs = Number(await countdown.getAttribute("data-remaining-ms"));
        return (
          (await countdown.textContent()) ===
          starshipText("en", "journeyTimeRemaining", {
            time: formatDuration("en", remainingMs, notation),
          })
        );
      })
      .toBe(true);
  }
});

test("P-41 formats the Rocket fueling ETA in every notation @p41-fuel-eta", async ({ page }) => {
  await startSpaceFixture(page, "space-telescope");
  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-launch-pad").click();
  await page.getByRole("button", { name: "Build launch pad" }).click();
  const rocket = page.getByTestId("rocket-card-rocket1");
  for (let part = 0; part < 12; part += 1) {
    await rocket.getByRole("button", { name: "Build Rocket Part" }).click();
  }
  await page.locator("#tab-space-mining-rocket-1").click();
  await rocket.getByRole("button", { name: "Buy fuel pump" }).click();
  const fuelEta = rocket.getByTestId("rocket-fuel-eta-rocket1");

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-rocket-1").click();
    await expect
      .poll(async () => {
        const remainingMs = Number(await fuelEta.getAttribute("data-remaining-ms"));
        const expected = rocketText("en", "fuelingTimeRemaining", {
          time: formatDuration("en", remainingMs, notation),
        });
        return (await fuelEta.textContent())?.trim() === expected;
      })
      .toBe(true);
  }
});

test("P-41 formats a returning Rocket countdown in every notation @p41-returning-rocket", async ({
  page,
}) => {
  await startSpaceFixture(page, "space-returning-rocket");
  const countdown = await openRocketTimer(page);
  const rocket = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.rockets.rocket1,
  );
  expect(rocket.phase).toBe("returning");

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-rocket-1").click();
    await expect
      .poll(async () => {
        const remainingMs = Number(await countdown.getAttribute("data-remaining-ms"));
        const expected = rocketText("en", "journeyTimeRemaining", {
          time: formatDuration("en", remainingMs, notation),
        });
        return (await countdown.textContent())?.trim() === expected;
      })
      .toBe(true);
  }
});

test("P-41 formats Space Mining weather and survey timers in every notation @p41-space-timers", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-launch-pad").click();
  const weatherCountdown = page.getByTestId("space-weather-timer");

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-launch-pad").click();
    await expect(weatherCountdown).toBeVisible();
    await expect
      .poll(async () => {
        const remainingMs = Number(await weatherCountdown.getAttribute("data-remaining-ms"));
        const expected = `${spaceText("en", "weatherChangesIn")}: ${formatDuration("en", remainingMs, notation)}`;
        return (await weatherCountdown.textContent())?.trim() === expected;
      })
      .toBe(true);
  }

  await page.locator("#tab-space-mining-telescope").click();
  await page
    .getByRole("button", { name: spaceText("en", "scanAsteroids"), exact: true })
    .click();
  const surveyCountdown = page.getByTestId("space-survey-countdown");
  await expect(surveyCountdown).toBeVisible();

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-telescope").click();
    await expect
      .poll(async () => {
        const remainingMs = Number(await surveyCountdown.getAttribute("data-remaining-ms"));
        const expected = spaceText("en", "surveyTimeRemaining", {
          time: formatDuration("en", remainingMs, notation),
        });
        return (await surveyCountdown.textContent())?.trim() === expected;
      })
      .toBe(true);
  }
});
