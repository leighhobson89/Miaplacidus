import { expect, test } from "../_harness/fixtures";
import { startEconomyFixture } from "../_harness/economyFixtures";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";

const knowledgeSharingNotice: Record<LocaleId, string> = {
  en: "Knowledge Sharing Researched\n\nYou can now open Science Clubs!",
  es: "Compartir Conocimiento Investigado\n\n¡Ahora puedes abrir Clubes de Ciencia!",
  pt: "Compartilhamento de Conhecimento Pesquisado\n\nAgora você pode abrir Clubes de Ciência!",
  de: "Wissensaustausch Erforscht\n\nDu kannst jetzt Wissenschaftsklubs eröffnen!",
  it: "Condivisione della Conoscenza Ricercata\n\nOra puoi aprire Club Scientifici!",
  fr: "Partage des Connaissances Recherché\n\nTu peux maintenant ouvrir des Clubs Scientifiques!",
};

test("standard Research Tech Tree shows the Knowledge Sharing result in the selected locale @p7-locale @research", async ({
  page,
}) => {
  test.setTimeout(120_000);

  for (const [index, locale] of LOCALE_IDS.entries()) {
    if (index > 0) {
      await page.evaluate(() => {
        const appKeys = Array.from({ length: localStorage.length }, (_, keyIndex) =>
          localStorage.key(keyIndex),
        ).filter((key): key is string => key?.startsWith("miaplacidus:v1:") ?? false);
        for (const key of appKeys) localStorage.removeItem(key);
        sessionStorage.removeItem("miaplacidus:test:economy-storage-cleared");
      });
    }

    await startEconomyFixture(page, "research", locale);
    await page.locator("#tab-research").click();
    await page.locator("#tab-research-science-buildings").click();
    await expect(page.getByTestId("economy-research")).toBeVisible();

    await page.locator("#tab-research-tech-tree").click();
    const knowledgeSharing = page.locator('[data-technology-id="knowledgeSharing"]');
    await expect(knowledgeSharing).toHaveAttribute("aria-disabled", "false");
    expect(
      await page.evaluate(() => window.miaplacidusTest!.applyDebugAction("give-1m-research")),
    ).toBe(true);
    await knowledgeSharing.click();
    await expect(knowledgeSharing.locator(".technology-map-researched")).toBeVisible();

    const result = page.locator(
      '[data-testid="game-notification"][data-classification="tech"]',
    );
    await expect(result).toHaveText(knowledgeSharingNotice[locale]);

    // The source presents a separate result modal after the toast. Dismiss it
    // so each locale starts and ends with an unobstructed Research route.
    const unlockDialog = page.getByTestId("random-event-result-dialog");
    await expect(unlockDialog).toBeVisible();
    await unlockDialog.getByRole("button").click();
    await expect(unlockDialog).toBeHidden();
  }
});
