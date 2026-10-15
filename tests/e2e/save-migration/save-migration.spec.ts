import type { Page } from "@playwright/test";
import { createRequire } from "node:module";
import { expect, test } from "../_harness/fixtures";
import { openSaveManager } from "../_harness/save-controls";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { createInitialGameState } from "../../../src/engine/state";
import { saveText } from "../../../src/i18n/saveMessages";
import {
  canonicalJson,
  checksumFor,
  SAVE_SCHEMA_VERSION,
} from "../../../src/persistence/schema";

const { compressToEncodedURIComponent } = createRequire(import.meta.url)("lz-string") as typeof import("lz-string");

function syntheticV0Code(name: string): string {
  const state = createInitialGameState({ pioneerName: name, seed: 2026 });
  const oldBody = {
    format: "miaplacidus.save",
    schemaVersion: 0,
    slotId: "00000000-0000-4000-8000-000000000100",
    pioneerName: name,
    createdAt: 100,
    savedAt: 200,
    revision: 1,
    state: {
      schemaVersion: 0,
      run: state.run,
      permanent: state.permanent,
      settings: state.settings,
    },
  };
  const checksum = checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]);
  return "MIA1:" + compressToEncodedURIComponent(canonicalJson({ ...oldBody, checksum }));
}

async function resumePioneer(page: Page, name: string): Promise<void> {
  await page.getByLabel("Pioneer name").fill(name);
  await page.getByRole("option").filter({ hasText: name }).click();
  await page.getByTestId("start-game").click();
}

test("a synthetic MIAPLACIDUS v0 save migrates and starts as a playable slot @save-migration", async ({
  freshGame,
}, testInfo) => {
  await openSaveManager(freshGame);
  const manager = freshGame.getByTestId("save-manager-inline");
  await manager.locator("#import-code").fill(syntheticV0Code("Legacy Pioneer"));
  await manager.getByRole("button", { name: "Preview import" }).click();
  await expect(manager.getByTestId("import-preview")).toContainText(
    `Save version: ${SAVE_SCHEMA_VERSION}`,
  );
  await expect(manager.getByTestId("import-preview")).toContainText("Hydrogen");
  await manager.locator("#import-new-name").fill("Migrated Pioneer");
  await manager.getByRole("button", { name: "Import as a new pioneer" }).click();
  await expect(
    freshGame
      .locator('[data-testid="game-notification"].notification-success')
      .filter({ hasText: saveText("en", "importedAsNew") }),
  ).toHaveText(saveText("en", "importedAsNew"));
  await freshGame.locator("#tab-hydrogen").click();
  await freshGame.reload();
  await resumePioneer(freshGame, "Migrated Pioneer");
  await expect(freshGame.locator(".run-name")).toHaveText("Migrated Pioneer");
  await expect(freshGame.locator(".hydrogen-briefing")).toHaveCount(0);
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("0");
  await captureVisualCheckpoint(freshGame, testInfo, "synthetic-v0-migrated-playable");
});
