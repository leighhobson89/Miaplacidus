import { createRequire } from "node:module";
import { expect, test } from "../_harness/fixtures";
import { openSaveManager } from "../_harness/save-controls";
import { createInitialGameState } from "../../../src/engine/state";
import { saveText } from "../../../src/i18n/saveMessages";
import { canonicalJson, checksumFor, SAVE_SCHEMA_VERSION } from "../../../src/persistence/schema";

const { compressToEncodedURIComponent } = createRequire(import.meta.url)("lz-string") as typeof import("lz-string");

function version54SaveCode(name: string): string {
  const current = createInitialGameState({ pioneerName: name, seed: 5455 });
  const { megastructureOptionNotificationShown: _noticeShown, ...legacyMegastructures } =
    current.permanent.megastructures;
  const oldBody = {
    format: "miaplacidus.save",
    schemaVersion: 54,
    slotId: "00000000-0000-4000-8000-000000000055",
    pioneerName: name,
    createdAt: 100,
    savedAt: 200,
    revision: 1,
    state: {
      ...current,
      schemaVersion: 54,
      permanent: {
        ...current.permanent,
        megastructures: legacyMegastructures,
      },
    },
  };
  const checksum = checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]);
  return "MIA1:" + compressToEncodedURIComponent(canonicalJson({ ...oldBody, checksum }));
}

test("a version 54 save initializes the v55 Megastructure notice guard and remains playable @migration", async ({
  freshGame,
}) => {
  await openSaveManager(freshGame);
  const manager = freshGame.getByTestId("save-manager-inline");
  await manager.locator("#import-code").fill(version54SaveCode("Version 54 Pioneer"));
  await manager.getByRole("button", { name: "Preview import" }).click();
  await expect(manager.getByTestId("import-preview")).toContainText(
    `Save version: ${SAVE_SCHEMA_VERSION}`,
  );
  await expect(manager.getByTestId("import-preview")).toContainText("Hydrogen");
  await manager.locator("#import-new-name").fill("Migrated 54 Pioneer");
  await manager.getByRole("button", { name: "Import as a new pioneer" }).click();
  await expect(
    freshGame
      .locator('[data-testid="game-notification"].notification-success')
      .filter({ hasText: saveText("en", "importedAsNew") }),
  ).toHaveText(saveText("en", "importedAsNew"));
  await freshGame.locator("#tab-hydrogen").click();
  await expect
    .poll(() =>
      freshGame.evaluate(
        () =>
          window.miaplacidusTest?.getState().permanent.megastructures
            .megastructureOptionNotificationShown,
      ),
    )
    .toBe(false);
  await freshGame.reload();
  await freshGame.getByLabel("Pioneer name").fill("Migrated 54 Pioneer");
  await freshGame.getByRole("option").filter({ hasText: "Migrated 54 Pioneer" }).click();
  await freshGame.getByTestId("start-game").click();
  await expect(freshGame.locator(".run-name")).toHaveText("Migrated 54 Pioneer");
  await expect
    .poll(() =>
      freshGame.evaluate(
        () =>
          window.miaplacidusTest?.getState().permanent.megastructures
            .megastructureOptionNotificationShown,
      ),
    )
    .toBe(false);
});
