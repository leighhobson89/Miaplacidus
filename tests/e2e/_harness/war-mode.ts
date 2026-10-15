import type { Locator } from "@playwright/test";

export async function confirmStarshipWarEntry(pane: Locator): Promise<void> {
  await pane.getByTestId("starship-enter-war-button").click();
  await pane.getByTestId("starship-war-confirmation-confirm").click();
}
