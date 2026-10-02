import { useState } from "react";
import { createGameStore } from "../engine/store";
import { createInitialGameState } from "../engine/state";
import { GameErrorBoundary } from "../ui/GameErrorBoundary";
import { useGameSnapshot } from "../ui/useGameSnapshot";
import { BUILD_INFO } from "./buildInfo";

export function App() {
  const [store] = useState(() =>
    createGameStore(createInitialGameState(), { clock: { now: () => performance.now() } }),
  );
  const snapshot = useGameSnapshot(store);

  return (
    <GameErrorBoundary onRecover={store.recover}>
      <main
        className="application-shell"
        data-build-mode={BUILD_INFO.mode}
        data-build-variant={BUILD_INFO.isDemo ? "demo" : "full"}
        data-engine-revision={snapshot.revision}
      >
        <h1>MIAPLACIDUS</h1>
      </main>
    </GameErrorBoundary>
  );
}
