import { test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { checkMetaPages } from "../_harness/p65-meta-page-identity";

test("P-65 Ascendency Perks child page has matching title and artwork at desktop and phone widths @p65-meta-identity", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-megastructure-route");
  await checkMetaPages(page, testInfo, "tab-galaxy", [
    {
      name: "ascendency-perks",
      tabId: "tab-galactic-ascendency-perks",
      paneSelector: "[data-testid='ascendency-pane']",
      expectedTitle: "Ascendency Perks",
      illustration: "megastructure",
    },
  ]);
});
