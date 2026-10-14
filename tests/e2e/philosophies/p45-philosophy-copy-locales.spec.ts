import { dismissTutorialOfferIfPresent, expect, test } from "../_harness/fixtures";
import { LOCALE_IDS, PHILOSOPHY_IDS } from "../../../src/content/ids";
import {
  PHILOSOPHY_ABILITY_RESEARCH_COST,
  PHILOSOPHY_PATHS,
} from "../../../src/content/philosophy";
import { philosophyText } from "../../../src/i18n/philosophyMessages";
import { formatNumber } from "../../../src/app/numberFormatting";

async function startSpaceFixture(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("miaplacidus:fixture-cleared") === "yes") return;
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
    sessionStorage.setItem("miaplacidus:fixture-cleared", "yes");
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-telescope");
  await page.getByLabel("Pioneer name").fill("P45 Philosophy Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await dismissTutorialOfferIfPresent(page);
}

test("P-45 Philosophy choice and research copy render in all locales @p45-philosophy-copy", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();
  await page.getByRole("button", { name: "Build Space Telescope", exact: true }).click();
  await page.getByRole("button", { name: "Study Stars", exact: true }).click();
  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "timer.complete",
        timerId: "survey:star-study",
      }),
    ),
  ).toBe(true);

  const choice = page.getByTestId("philosophy-choice");
  await expect(choice).toBeVisible();
  for (const locale of LOCALE_IDS) {
    await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const copy = philosophyText(locale);
    await expect(choice.getByRole("heading", { level: 2 })).toHaveText(copy.choiceTitle);
    await expect(choice.locator("p:not(.eyebrow)").first()).toHaveText(copy.choicePrompt);
    await expect(choice.locator(".philosophy-choice-card")).toHaveCount(PHILOSOPHY_IDS.length);

    for (const id of PHILOSOPHY_IDS) {
      const path = PHILOSOPHY_PATHS[id];
      const card = choice.locator(".philosophy-choice-card").nth(PHILOSOPHY_IDS.indexOf(id));
      const ability = copy.abilities[path.abilityId];
      await expect(card.getByRole("heading", { level: 3 })).toHaveText(copy.paths[id].name);
      await expect(card.locator(".philosophy-choice-card-heading p")).toHaveText(
        copy.paths[id].summary,
      );
      await expect(card.getByRole("heading", { level: 4 })).toHaveText(ability.name);
      await expect(card.locator("h4 + p")).toHaveText(ability.effect);
      await expect(card.locator("details summary")).toHaveText(copy.repeatables);
      await expect(
        card.getByRole("button", { name: copy.paths[id].name, exact: true }),
      ).toBeVisible();
      await expect(card.locator("details li")).toHaveCount(path.repeatables.length);
      for (const [index, repeatableId] of path.repeatables.entries()) {
        const upgrade = copy.upgrades[repeatableId];
        await expect(card.locator("details li").nth(index)).toHaveText(
          `${upgrade.name}: ${upgrade.effect}`,
        );
      }
    }
  }

  const expansionist = philosophyText("fr").paths.expansionist.name;
  await choice.getByRole("button", { name: expansionist, exact: true }).click();
  await page.locator("#tab-research").click();
  await page.locator("#tab-research-philosophy").click();
  const pane = page.getByTestId("philosophy-pane");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const path = PHILOSOPHY_PATHS.expansionist;

  for (const locale of LOCALE_IDS) {
    await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const copy = philosophyText(locale);
    await expect(pane.getByRole("heading", { level: 2 })).toHaveText(copy.paths.expansionist.name);
    await expect(
      pane.locator(".philosophy-path-heading > div > p:not(.eyebrow):last-of-type"),
    ).toHaveText(
      copy.paths.expansionist.summary,
    );
    const ability = copy.abilities[path.abilityId];
    const abilityCard = pane.locator('[data-philosophy-ability="rapidExpansion"]');
    await expect(abilityCard.getByRole("heading", { level: 3 })).toHaveText(
      `${copy.ability}: ${ability.name}`,
    );
    await expect(abilityCard.locator("p").first()).toHaveText(ability.effect);
    await expect(abilityCard.locator("p").nth(1)).toHaveText(
      `${copy.nextCost}: ${formatNumber(locale, PHILOSOPHY_ABILITY_RESEARCH_COST, 0, state.settings.notation)} ${copy.researchShort}`,
    );
    await expect(
      abilityCard.getByRole("button", { name: copy.abilityAction, exact: true }),
    ).toBeVisible();
    await expect(pane.getByRole("heading", { name: copy.repeatables, exact: true })).toBeVisible();

    for (const [index, repeatableId] of path.repeatables.entries()) {
      const upgrade = copy.upgrades[repeatableId];
      const card = pane.locator(".philosophy-repeatable").nth(index);
      await expect(card.getByRole("heading", { level: 4 })).toHaveText(upgrade.name);
      await expect(card.locator("p").first()).toHaveText(upgrade.effect);
      await expect(card.getByRole("button", { name: copy.buy })).toBeVisible();
    }
  }
});
