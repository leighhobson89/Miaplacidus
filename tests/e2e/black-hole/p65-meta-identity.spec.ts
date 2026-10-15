import { test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { checkMetaPages } from "../_harness/p65-meta-page-identity";

test("P-65 Black Hole child page has matching title and artwork at desktop and phone widths @p65-meta-identity", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-black-hole-discovered");
  await checkMetaPages(page, testInfo, "tab-galaxy", [
    {
      name: "black-hole",
      tabId: "tab-galactic-black-hole",
      paneSelector: ".black-hole-pane",
      expectedTitle: "Black Hole",
      illustration: "black-hole",
    },
  ]);
});
