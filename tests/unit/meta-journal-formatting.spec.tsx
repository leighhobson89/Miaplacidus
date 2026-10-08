import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MetaJournalPane } from "../../src/app/MetaJournalPane";
import { createInitialGameState } from "../../src/engine/state";
import { createGameStore } from "../../src/engine/store";

describe("Meta Journal durations", () => {
  it("uses the saved number notation for ticker durations", () => {
    const initial = createInitialGameState({ pioneerName: "Journal", seed: 44 });
    const state = {
      ...initial,
      settings: { ...initial.settings, notation: "standard" as const },
      run: {
        ...initial.run,
        newsTicker: {
          ...initial.run.newsTicker,
          remainingMs: 1_000 * 24 * 60 * 60 * 1_000,
        },
      },
    };
    const store = createGameStore(state, { clock: { now: () => 0 } });

    const markup = renderToStaticMarkup(
      <MetaJournalPane state={state} store={store} active={false} />,
    );

    expect(markup).toContain("1,000d 0h 0m 0s");
  });
});
