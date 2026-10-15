import { expect, test } from "../_harness/fixtures";

test("Miaplaedia pages have no artwork row and use the resource title scale @phase6-tab-layout", async ({
  freshGame,
}) => {
  const hydrogenTitle = freshGame.locator("#panel-resources-hydrogen .pane-heading h2");
  const miaplaedia = freshGame.locator("#pane-miaplaedia");
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    await freshGame.setViewportSize(viewport);
    const hydrogenFontSize = await hydrogenTitle.evaluate(
      (element) => getComputedStyle(element).fontSize,
    );
    await freshGame.locator("#tab-miaplaedia").click();
    await expect(miaplaedia.locator(".page-artwork-row")).toHaveCount(0);
    for (const paneId of [
      "miaplaedia-get-started",
      "miaplaedia-story",
      "miaplaedia-concepts-early",
      "miaplaedia-concepts-mid",
      "miaplaedia-concepts-late",
      "miaplaedia-end-goal",
      "miaplaedia-philosophies",
    ]) {
      await freshGame.locator(`#tab-${paneId}`).click();
      const pageTitle = miaplaedia.locator(`#panel-${paneId} .game-page-title`);
      await expect(pageTitle, `${paneId} title at ${viewport.width}px`).toBeVisible();
      await expect(pageTitle, `${paneId} title scale at ${viewport.width}px`).toHaveCSS(
        "font-size",
        hydrogenFontSize,
      );
    }
  }
});
