import { expect, test } from "../_harness/fixtures";

declare global {
  interface Window {
    __battleAudioSources?: string[];
  }
}

type BattleFixture =
  | "space-battle-victory"
  | "space-battle-defeat"
  | "space-diplomacy-power"
  | "space-diplomacy-power-fail"
  | "space-diplomacy-aggressive"
  | "space-bully-scared"
  | "space-bully-surrender"
  | "space-unoccupied";

async function startBattleFixture(
  page: import("@playwright/test").Page,
  fixture: BattleFixture,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261003&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("Battle Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: /Colonise/ }).click();
}

async function advanceBattle(page: import("@playwright/test").Page): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const phase = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase,
    );
    if (phase !== "inProgress") return;
    await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  }
}

test("wins a hostile battle through the starship controls and records settlement rewards @battle @colonise", async ({
  page,
}) => {
  await startBattleFixture(page, "space-battle-victory");
  const pane = page.getByTestId("starship-pane");
  await pane.getByTestId("starship-enter-war-button").click();
  await pane.getByTestId("starship-battle-engage-button").click();
  await advanceBattle(page);

  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase,
      ),
    )
    .toBe("victory");
  // The floating toast shares a two-card FIFO and may be delayed by other notices.
  await expect(pane.getByTestId("starship-battle-status")).toContainText("Victory");
  const victory = await page.evaluate(() => window.miaplacidusTest!.getState());
  const ascendencyBefore = victory.permanent.ascendencyPoints;
  const destinationId = victory.run.space.starship.destinationSystemId;
  const destinationProfile = victory.run.space.systemProfiles.find(
    (profile) => profile.systemId === destinationId,
  );
  expect(destinationProfile).toBeDefined();
  expect(victory.run.space.systemEncounters[0]?.enemyFleets).toEqual({ air: 0, land: 0, sea: 0 });

  await pane.getByTestId("starship-settle-system-button").click();
  await expect(pane.getByTestId("starship-system-settled")).toBeVisible();
  const settled = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(settled.permanent.settledSystemIds).toContain(destinationId);
  expect(settled.permanent.ascendencyPoints).toBe(
    ascendencyBefore + destinationProfile!.ascendencyPoints * 2,
  );
  expect(settled.permanent.gloryPoints).toBe(0);
  expect(settled.run.space.ascendencyAwardedThisRun).toBe(true);
  expect(
    await page.evaluate(() => window.miaplacidusTest!.dispatch({ type: "space.system.settle" })),
  ).toBe(false);
});

test("retains the starship and surviving enemy after defeat, then retries with rebuilt ships @battle", async ({
  page,
}) => {
  await startBattleFixture(page, "space-battle-defeat");
  const pane = page.getByTestId("starship-pane");
  const destinationBefore = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.starship.destinationSystemId,
  );
  await pane.getByTestId("starship-enter-war-button").click();
  await pane.getByTestId("starship-battle-engage-button").click();
  await advanceBattle(page);

  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase,
      ),
    )
    .toBe("defeat");
  // Keep the outcome assertion on the battle panel; floating notices expire after three seconds.
  await expect(pane.getByTestId("starship-battle-status")).toContainText("Defeat");
  const defeat = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(defeat.run.space.playerFleets.scout).toBe(0);
  expect(defeat.run.space.systemEncounters[0]?.enemyFleets.air).toBeGreaterThan(0);
  expect(defeat.run.space.starship.destinationSystemId).toBe(destinationBefore);

  await page.getByRole("tab", { name: /Fleet Hangar/ }).click();
  await pane.getByTestId("starship-fleet-build-scout").click();
  const rebuilt = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(rebuilt.run.space.playerFleets.scout).toBe(1);
  expect(rebuilt.run.space.systemEncounters[0]?.battle.playerHealthPool.scout).toBe(100);

  await page.getByRole("tab", { name: "Colonise" }).click();
  await pane.getByTestId("starship-enter-war-button").click();
  await pane.getByTestId("starship-battle-engage-button").click();
  const retry = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(retry.run.space.systemEncounters[0]?.battle.phase).toBe("inProgress");
  expect(retry.run.space.starship.destinationSystemId).toBe(destinationBefore);
});

test("does not synthesize explosion cues from aggregate casualties without rendered death callbacks @battle @audio", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const sources: string[] = [];
    class MockAudio {
      loop = false;
      preload = "none";
      volume = 1;
      currentTime = 0;
      paused = true;

      constructor(readonly src: string) {}

      addEventListener(): void {}

      play(): Promise<void> {
        sources.push(this.src);
        this.paused = false;
        return Promise.resolve();
      }

      pause(): void {
        this.paused = true;
      }
    }

    Object.defineProperty(window, "Audio", {
      configurable: true,
      writable: true,
      value: MockAudio,
    });
    window.__battleAudioSources = sources;
  });
  await startBattleFixture(page, "space-battle-defeat");
  await page.addStyleTag({
    content: '[data-testid="starship-battle-canvas"] { display: none !important; }',
  });
  await page.evaluate(() => {
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { soundEffectsEnabled: true, backgroundAudioEnabled: false },
    });
    window.__battleAudioSources!.length = 0;
  });
  const pane = page.getByTestId("starship-pane");
  await pane.getByTestId("starship-enter-war-button").click();
  await pane.getByTestId("starship-battle-engage-button").click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));

  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase,
      ),
    )
    .toBe("defeat");
  const explosionSources = await page.evaluate(() =>
    (window.__battleAudioSources ?? []).filter((source) =>
      /shipBattleExplode[12]\.mp3/.test(source),
    ),
  );
  expect(explosionSources).toHaveLength(0);
  expect(
    await page.evaluate(() => window.miaplacidusTest!.getState().run.space.playerFleets.scout),
  ).toBe(0);
});
