import { describe, expect, it } from "vitest";
import { LOCALE_IDS, PHILOSOPHY_IDS } from "../../src/content/ids";
import {
  PHILOSOPHY_ABILITY_RESEARCH_COST,
  PHILOSOPHY_PATHS,
  PHILOSOPHY_REPEATABLE_BASE_COST,
  PHILOSOPHY_REPEATABLE_IDS,
} from "../../src/content/philosophy";
import { transition } from "../../src/engine/commands";
import { philosophyRepeatablePrice } from "../../src/engine/philosophy";
import { createStarCatalogue } from "../../src/content/starCatalogue";
import {
  createInitialGameState,
  isValidGameState,
  upgradeGameStateV22,
  type GameState,
} from "../../src/engine/state";
import { decodePortable, encodePortable } from "../../src/persistence/codec";
import { makeEnvelope } from "../../src/persistence/schema";
import { philosophyText } from "../../src/i18n/philosophyMessages";

function pendingChoice(state: GameState, researchPoints = 0): GameState {
  return {
    ...state,
    run: { ...state.run, philosophyChoicePending: true, researchPoints },
  };
}

describe("philosophy paths", () => {
  it("defines exactly four exclusive paths, each with one ability and four repeatables", () => {
    expect(Object.keys(PHILOSOPHY_PATHS)).toEqual(PHILOSOPHY_IDS);
    expect(PHILOSOPHY_REPEATABLE_IDS).toHaveLength(16);
    for (const path of Object.values(PHILOSOPHY_PATHS)) {
      expect(path.abilityId).toBeTruthy();
      expect(path.repeatables).toHaveLength(4);
      expect(new Set(path.repeatables).size).toBe(4);
    }
  });

  it("localizes every choice consequence, ability and repeatable in all six languages", () => {
    for (const locale of LOCALE_IDS) {
      const copy = philosophyText(locale);
      for (const pathId of PHILOSOPHY_IDS) {
        const path = PHILOSOPHY_PATHS[pathId];
        expect(copy.paths[pathId].name.trim()).not.toBe("");
        expect(copy.paths[pathId].summary.trim()).not.toBe("");
        expect(copy.abilities[path.abilityId].name.trim()).not.toBe("");
        expect(copy.abilities[path.abilityId].effect.trim()).not.toBe("");
        for (const repeatableId of path.repeatables) {
          expect(copy.upgrades[repeatableId].name.trim()).not.toBe("");
          expect(copy.upgrades[repeatableId].effect.trim()).not.toBe("");
        }
      }
    }
  });

  it.each(PHILOSOPHY_IDS)(
    "selects %s and activates its matching path in the same seeded run",
    (id) => {
      const initial = createInitialGameState({ seed: 1810 });
      const selected = transition(pendingChoice(initial, 510_000), {
        type: "philosophy.select",
        philosophyId: id,
      });
      expect(selected.accepted).toBe(true);
      expect(selected.state.permanent.philosophyId).toBe(id);
      expect(selected.state.run.philosophyChoicePending).toBe(false);

      const ability = transition(selected.state, { type: "philosophy.ability.purchase" });
      expect(ability.accepted).toBe(true);
      expect(ability.state.run.philosophyAbilityActive).toBe(true);
      const firstRepeatable = PHILOSOPHY_PATHS[id].repeatables[0]!;
      const repeatable = transition(ability.state, {
        type: "philosophy.repeatable.purchase",
        repeatableId: firstRepeatable,
      });
      expect(repeatable.accepted).toBe(true);
      expect(repeatable.state.permanent.philosophyRepeatableRanks[firstRepeatable]).toBe(1);

      const destination = createStarCatalogue().find(
        (star) => star.id !== repeatable.state.run.space.currentSystemId,
      )!.id;
      const readyForRebirth: GameState = {
        ...repeatable.state,
        run: {
          ...repeatable.state.run,
          space: { ...repeatable.state.run.space, ascendencyAwardedThisRun: true },
        },
        permanent: {
          ...repeatable.state.permanent,
          settledSystemIds: [...repeatable.state.permanent.settledSystemIds, destination],
        },
      };
      const reborn = transition(readyForRebirth, { type: "meta.rebirth" });
      expect(reborn.accepted).toBe(true);
      expect(reborn.state.permanent.philosophyId).toBe(id);
      expect(reborn.state.run.philosophyAbilityActive).toBe(false);
      expect(reborn.state.permanent.philosophyRepeatableRanks[firstRepeatable]).toBe(1);
      const envelope = makeEnvelope({
        slotId: "22222222-2222-4222-8222-222222222222",
        pioneerName: reborn.state.run.pioneerName,
        createdAt: 1,
        savedAt: 1,
        revision: 1,
        state: reborn.state,
      });
      const reloaded = decodePortable(encodePortable(envelope));
      expect(reloaded.state.permanent.philosophyId).toBe(id);
      expect(reloaded.state.run.philosophyAbilityActive).toBe(false);
      expect(reloaded.state.permanent.philosophyRepeatableRanks[firstRepeatable]).toBe(1);
    },
  );

  it("offers the choice only after the first completed star study", () => {
    const initial = createInitialGameState({ seed: 1801 });
    const selectedTooEarly = transition(initial, {
      type: "philosophy.select",
      philosophyId: "constructor",
    });
    expect(selectedTooEarly.accepted).toBe(false);
    expect(selectedTooEarly.failure?.code).toBe("choice-not-pending");

    const studyReady: GameState = {
      ...initial,
      run: {
        ...initial.run,
        space: {
          ...initial.run.space,
          telescopeBuilt: true,
        },
        economy: {
          ...initial.run.economy,
          researchedTechnologies: ["atmosphericTelescopes"],
          revealedTechnologies: ["atmosphericTelescopes"],
          power: { ...initial.run.economy.power, infinitePower: true },
        },
      },
    };
    const started = transition(studyReady, { type: "space.telescope.study.start" });
    expect(started.accepted, JSON.stringify(started.failure)).toBe(true);
    expect(started.state.run.philosophyChoicePending).toBe(false);

    const completed = transition(started.state, {
      type: "timer.complete",
      timerId: "survey:star-study",
    });
    expect(completed.accepted).toBe(true);
    expect(completed.state.run.philosophyChoicePending).toBe(true);
    expect(completed.state.run.space.starStudyRange).toBeGreaterThan(0);
    expect(isValidGameState(completed.state)).toBe(true);
  });

  it("locks the selected path, charges exact ability and repeatable prices, and retains ranks through rebirth and reload", () => {
    const initial = createInitialGameState({ seed: 1802 });
    const selected = transition(pendingChoice(initial, 510_000), {
      type: "philosophy.select",
      philosophyId: "expansionist",
    });
    expect(selected.accepted).toBe(true);
    expect(
      transition(selected.state, { type: "philosophy.select", philosophyId: "voidborn" }).failure
        ?.code,
    ).toBe("philosophy-already-chosen");

    expect(philosophyRepeatablePrice(selected.state, "warpDrive")).toBe(
      PHILOSOPHY_REPEATABLE_BASE_COST,
    );
    expect(
      transition(selected.state, {
        type: "philosophy.repeatable.purchase",
        repeatableId: "laserMining",
      }).failure?.code,
    ).toBe("wrong-philosophy-path");

    const ability = transition(selected.state, { type: "philosophy.ability.purchase" });
    expect(ability.accepted).toBe(true);
    expect(ability.state.run.researchPoints).toBe(10_000);
    expect(ability.state.run.philosophyAbilityActive).toBe(true);
    expect(PHILOSOPHY_ABILITY_RESEARCH_COST).toBe(500_000);

    const upgraded = transition(ability.state, {
      type: "philosophy.repeatable.purchase",
      repeatableId: "warpDrive",
    });
    expect(upgraded.accepted).toBe(true);
    expect(upgraded.state.permanent.philosophyRepeatableRanks.warpDrive).toBe(1);
    expect(philosophyRepeatablePrice(upgraded.state, "warpDrive")).toBe(11_300);

    const destination = createStarCatalogue().find(
      (star) => star.id !== upgraded.state.run.space.currentSystemId,
    )!.id;
    const readyForRebirth: GameState = {
      ...upgraded.state,
      run: {
        ...upgraded.state.run,
        space: { ...upgraded.state.run.space, ascendencyAwardedThisRun: true },
      },
      permanent: {
        ...upgraded.state.permanent,
        settledSystemIds: [...upgraded.state.permanent.settledSystemIds, destination],
      },
    };
    const reborn = transition(readyForRebirth, { type: "meta.rebirth" });
    expect(reborn.accepted).toBe(true);
    expect(reborn.state.run.philosophyAbilityActive).toBe(false);
    expect(reborn.state.permanent.philosophyRepeatableRanks.warpDrive).toBe(1);
    expect(philosophyRepeatablePrice(reborn.state, "warpDrive")).toBe(11_300);

    const envelope = makeEnvelope({
      slotId: "11111111-1111-4111-8111-111111111111",
      pioneerName: reborn.state.run.pioneerName,
      createdAt: 1,
      savedAt: 1,
      revision: 1,
      state: reborn.state,
    });
    const restored = decodePortable(encodePortable(envelope));
    expect(restored.state.permanent.philosophyRepeatableRanks.warpDrive).toBe(1);
  });

  it("applies Constructor ability to storage capacity for this run", () => {
    const initial = createInitialGameState({ seed: 1804 });
    const enabled: GameState = {
      ...initial,
      run: {
        ...initial.run,
        philosophyAbilityActive: true,
        goods: {
          ...initial.run.goods,
          hydrogen: {
            ...initial.run.goods.hydrogen,
            quantity: initial.run.goods.hydrogen.storageCapacity - 1,
          },
        },
      },
      permanent: { ...initial.permanent, philosophyId: "constructor" },
    };
    const purchased = transition(enabled, { type: "storage.purchase", goodId: "hydrogen" });
    expect(purchased.accepted).toBe(true);
    expect(purchased.state.run.goods.hydrogen.storageCapacity).toBe(
      initial.run.goods.hydrogen.storageCapacity * 5,
    );
  });

  it("migrates v22 philosophy state and reconstructs a pending first choice for an already studied save", () => {
    const current = createInitialGameState({ seed: 1803 });
    const legacy = JSON.parse(JSON.stringify(current)) as Record<string, unknown>;
    const run = legacy["run"] as Record<string, unknown>;
    const space = run["space"] as Record<string, unknown>;
    const permanent = legacy["permanent"] as Record<string, unknown>;
    legacy["schemaVersion"] = 22;
    space["starStudyRange"] = 200;
    delete run["philosophyChoicePending"];
    delete run["expansionistExtraSystemIds"];
    delete permanent["philosophyRepeatableRanks"];

    const upgraded = upgradeGameStateV22(legacy);
    expect(upgraded).not.toBeNull();
    expect(upgraded?.run.philosophyChoicePending).toBe(true);
    expect(upgraded?.permanent.philosophyRepeatableRanks.warpDrive).toBe(0);
    expect(upgraded && isValidGameState(upgraded)).toBe(true);
  });
});
