import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { RANDOM_EVENT_IDS } from "../../../src/content/metaSignals";
import { THEME_IDS } from "../../../src/content/themes";

test("all random-event glyphs render within a theme-aware phone gallery @p28-artwork-review", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  await page.setViewportSize({ width: 1280, height: 900 });

  for (const themeId of THEME_IDS) {
    for (const view of [
      { width: 1280, height: 900 },
      { width: 390, height: 844 },
    ] as const) {
      await page.setViewportSize({ width: view.width, height: view.height });
      await page.evaluate((nextTheme) => {
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: "en", themeId: nextTheme },
        });
      }, themeId);

      await page.evaluate(
        async (ids) => {
          const [react, reactDom, artwork] = await Promise.all([
            import(new URL("/node_modules/.vite/deps/react.js", window.location.origin).href),
            import(
              new URL("/node_modules/.vite/deps/react-dom_client.js", window.location.origin).href
            ),
            import(new URL("/src/app/RandomEventArtwork.tsx", window.location.origin).href),
          ]);
          const host = document.createElement("section");
          host.id = "p28-event-art-gallery";
          host.setAttribute("aria-label", "P-28 random-event artwork review");
          host.style.cssText =
            "display:grid;grid-template-columns:repeat(auto-fit,minmax(3.5rem,1fr));gap:0.75rem;padding:1rem;";
          document.querySelector(".game-frame")!.append(host);
          const root = (reactDom.createRoot ?? reactDom.default?.createRoot)(host);
          const createElement = react.createElement ?? react.default?.createElement;
          root.render(
            createElement(
              "div",
              { style: { display: "contents" } },
              ...ids.map((id) =>
                createElement(
                  "div",
                  {
                    key: id,
                    "data-p28-event-card": id,
                    style: { minWidth: 0, display: "grid", placeItems: "center" },
                  },
                  createElement(artwork.RandomEventArtwork, { id, negative: false }),
                ),
              ),
            ),
          );
        },
        [...RANDOM_EVENT_IDS],
      );

      const gallery = page.locator("#p28-event-art-gallery");
      await expect(gallery.locator("[data-event-art]")).toHaveCount(RANDOM_EVENT_IDS.length);
      const bounds = await gallery.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const glyphs = Array.from(element.querySelectorAll<SVGElement>("[data-event-art]"));
        return {
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          themeBackground: getComputedStyle(
            document.querySelector(".game-frame")!,
          ).getPropertyValue("--bg-color"),
          galleryWithinViewport: rect.left >= 0 && rect.right <= window.innerWidth,
          glyphs: glyphs.map((glyph) => {
            const glyphRect = glyph.getBoundingClientRect();
            const cardRect = glyph.closest("[data-p28-event-card]")!.getBoundingClientRect();
            const mark = glyph.querySelector(".random-event-artwork-mark")!;
            const frame = glyph.querySelector(".random-event-artwork-frame")!;
            return {
              id: glyph.getAttribute("data-event-art"),
              hidden: glyph.getAttribute("aria-hidden") === "true",
              focusable: glyph.getAttribute("focusable"),
              positiveSize: glyphRect.width > 0 && glyphRect.height > 0,
              insideCard:
                glyphRect.left >= cardRect.left &&
                glyphRect.right <= cardRect.right &&
                glyphRect.top >= cardRect.top &&
                glyphRect.bottom <= cardRect.bottom,
              accent: getComputedStyle(glyph).color,
              highlight: getComputedStyle(mark).getPropertyValue("--event-art-highlight"),
              frameStroke: getComputedStyle(frame).stroke,
            };
          }),
        };
      });
      expect(bounds.documentWidth).toBeLessThanOrEqual(bounds.viewportWidth);
      expect(bounds.themeBackground.trim()).not.toBe("");
      expect(bounds.galleryWithinViewport).toBe(true);
      expect(bounds.glyphs.map(({ id }) => id)).toEqual(RANDOM_EVENT_IDS);
      expect(bounds.glyphs.every((glyph) => glyph.hidden && glyph.focusable === "false")).toBe(
        true,
      );
      expect(bounds.glyphs.every((glyph) => glyph.positiveSize && glyph.insideCard)).toBe(true);
      expect(
        bounds.glyphs.every(
          (glyph) =>
            glyph.accent !== "" &&
            glyph.highlight.trim() !== "" &&
            !glyph.highlight.includes("var(") &&
            glyph.frameStroke !== "none",
        ),
      ).toBe(true);

      if (
        (themeId === "terminal" && view.width === 1280) ||
        (themeId === "light" && view.width === 390) ||
        (themeId === "supernova" && view.width === 390)
      ) {
        const name = `p28-random-event-glyphs-${themeId}-${view.width}.png`;
        const image = await gallery.screenshot({
          path: testInfo.outputPath(name),
          animations: "disabled",
        });
        await testInfo.attach(name, {
          body: image,
          contentType: "image/png",
        });
      }
      await page.evaluate(() => {
        document.querySelector("#p28-event-art-gallery")?.remove();
      });
    }
  }
});
