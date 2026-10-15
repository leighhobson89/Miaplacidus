import { test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { checkMetaPages } from "../_harness/p65-meta-page-identity";

test("P-65 Megastructures child page has matching title and artwork at desktop and phone widths @p65-meta-identity", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-megastructure-route");
  await checkMetaPages(page, testInfo, "tab-galaxy", [
    {
      name: "megastructures",
      tabId: "tab-galactic-megastructures",
      paneSelector: "[data-testid='megastructure-pane']",
      expectedTitle: "Megastructures",
      illustration: "megastructure",
    },
  ]);
});
