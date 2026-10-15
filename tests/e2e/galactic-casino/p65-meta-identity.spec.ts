import { test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { checkMetaPages } from "../_harness/p65-meta-page-identity";

test("P-65 Galactic Casino child page has matching title and artwork at desktop and phone widths @p65-meta-identity", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-megastructure-route");
  await checkMetaPages(page, testInfo, "tab-galaxy", [
    {
      name: "galactic-casino",
      tabId: "tab-galactic-casino",
      paneSelector: "[data-testid='galactic-casino-pane']",
      expectedTitle: "Galactic Casino",
      illustration: "star-system",
    },
  ]);
});
