import { useSyncExternalStore } from "react";
import type { GameStore } from "../engine/store";

export function useGameSnapshot(store: GameStore) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
