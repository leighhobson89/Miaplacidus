import { ECONOMIC_GOOD_IDS, type TechId } from "../content/ids";
import {
  MEGASTRUCTURE_TECHNOLOGY_IDS,
  MEGASTRUCTURE_TRACKS,
  type MegastructureId,
} from "../content/technology";
import type { GameState } from "./state";

const FORCE_FIELD_TECHS = Object.values(MEGASTRUCTURE_TRACKS).map((track) => track[2]!);

export function isMegastructureTechnology(technologyId: TechId): boolean {
  return MEGASTRUCTURE_TECHNOLOGY_IDS.includes(technologyId);
}

export function structureForMegastructureTechnology(technologyId: TechId): MegastructureId | null {
  return (
    (Object.entries(MEGASTRUCTURE_TRACKS).find(([, track]) => track.includes(technologyId))?.[0] as
      | MegastructureId
      | undefined) ?? null
  );
}

export function stageForMegastructureTechnology(technologyId: TechId): number | null {
  const track = Object.values(MEGASTRUCTURE_TRACKS).find((candidate) =>
    candidate.includes(technologyId),
  );
  return track ? track.indexOf(technologyId) + 1 : null;
}

export function megastructureResearchAvailable(state: GameState, technologyId: TechId): boolean {
  const structureId = structureForMegastructureTechnology(technologyId);
  if (!structureId) return true;
  const currentSystemId = state.run.space.currentSystemId;
  return (
    state.permanent.settledSystemIds.includes(currentSystemId) &&
    state.permanent.megastructures.ancientManuscripts.some(
      (record) =>
        record.factorySystemId === currentSystemId &&
        record.megastructureId === structureId &&
        record.reported,
    )
  );
}

export function megastructureForFactorySystem(
  state: GameState,
  systemId: string,
): MegastructureId | null {
  return (
    state.permanent.megastructures.ancientManuscripts.find(
      (record) => record.factorySystemId === systemId,
    )?.megastructureId ?? null
  );
}

export function hasMegastructureTechnology(state: GameState, technologyId: TechId): boolean {
  return state.permanent.megastructures.researchedTechnologyIds.includes(technologyId);
}

export function miaplacidusForceFieldLevel(state: GameState): number {
  return FORCE_FIELD_TECHS.filter((technologyId) => hasMegastructureTechnology(state, technologyId))
    .length;
}

export function megastructureResearchRateBonus(state: GameState): number {
  const core = state.permanent.megastructures.ancientManuscripts.find(
    (record) => record.megastructureId === "celestialProcessingCore",
  );
  const atCore = core?.factorySystemId === state.run.space.currentSystemId;
  const techs = state.permanent.megastructures.researchedTechnologyIds;
  const coreTrack = MEGASTRUCTURE_TRACKS.celestialProcessingCore;
  let bonus = 0;
  if (atCore && techs.includes(coreTrack[0]!)) bonus += 0.5;
  if (atCore && techs.includes(coreTrack[1]!)) bonus += 1;
  if (atCore && techs.includes(coreTrack[3]!)) bonus += 1.5;
  if (techs.includes(coreTrack[4]!)) bonus += atCore ? 2 : 5;
  return bonus;
}

export function megastructurePowerPlantMultiplier(state: GameState): number {
  return hasMegastructureTechnology(state, MEGASTRUCTURE_TRACKS.dysonSphere[1]!) ? 1.25 : 1;
}

export function megastructureBatteryCapacityMultiplier(state: GameState): number {
  return hasMegastructureTechnology(state, MEGASTRUCTURE_TRACKS.dysonSphere[0]!) ? 2 : 1;
}

export function megastructureResourceRateMultiplier(state: GameState): number {
  const track = MEGASTRUCTURE_TRACKS.plasmaForge;
  let multiplier = 1;
  if (hasMegastructureTechnology(state, track[0]!)) multiplier *= 1.25;
  if (hasMegastructureTechnology(state, track[1]!)) multiplier *= 1.5;
  if (hasMegastructureTechnology(state, track[3]!)) multiplier *= 1.75;
  if (hasMegastructureTechnology(state, track[4]!)) multiplier *= 2 * 5;
  return multiplier;
}

export function hasPermanentAntimatterUnlock(state: GameState): boolean {
  return FORCE_FIELD_TECHS.some((technologyId) => hasMegastructureTechnology(state, technologyId));
}

export function megastructureAntimatterRatePerSecond(state: GameState): number {
  return (
    FORCE_FIELD_TECHS.filter((technologyId) => hasMegastructureTechnology(state, technologyId))
      .length * 0.15
  );
}

function addedStorageByStage(stage: number): number {
  if (stage === 1) return 100_000;
  if (stage === 2) return 1_000_000;
  if (stage === 4) return 1_000_000_000;
  if (stage === 5) return 10_000_000_000;
  return 0;
}

function addStorageToAllGoods(state: GameState, amount: number): GameState {
  if (amount === 0) return state;
  const goods = Object.fromEntries(
    ECONOMIC_GOOD_IDS.map((goodId) => [
      goodId,
      {
        ...state.run.goods[goodId],
        storageCapacity: state.run.goods[goodId].storageCapacity + amount,
      },
    ]),
  ) as GameState["run"]["goods"];
  return { ...state, run: { ...state.run, goods } };
}

/** Apply one just-purchased stage after its one-time preconditions have passed. */
export function applyMegastructureTechnology(state: GameState, technologyId: TechId): GameState {
  const structureId = structureForMegastructureTechnology(technologyId);
  const stage = stageForMegastructureTechnology(technologyId);
  if (!structureId || stage === null || hasMegastructureTechnology(state, technologyId))
    return state;

  const oldMilestone = miaplacidusForceFieldLevel(state);
  const researchedTechnologyIds = [
    ...state.permanent.megastructures.researchedTechnologyIds,
    technologyId,
  ];
  const nextMilestone = oldMilestone + (stage === 3 ? 1 : 0);
  const forceFieldRewardClaimed =
    state.permanent.megastructures.forceFieldRewardClaimed || nextMilestone >= 4;
  let next: GameState = {
    ...state,
    permanent: {
      ...state.permanent,
      megastructures: {
        ...state.permanent.megastructures,
        researchedTechnologyIds,
        forceFieldRewardClaimed,
      },
    },
  };

  if (structureId === "dysonSphere" && stage === 1) {
    const power = next.run.economy.power;
    next = {
      ...next,
      run: {
        ...next.run,
        economy: {
          ...next.run.economy,
          power: { ...power, capacity: power.capacity * 2 },
        },
      },
    };
  } else if (structureId === "dysonSphere" && (stage === 4 || stage === 5)) {
    const power = next.run.economy.power;
    next = {
      ...next,
      run: {
        ...next.run,
        economy: {
          ...next.run.economy,
          power: {
            ...power,
            infinitePower: true,
            gridEnabled: true,
            quantity: power.capacity,
            tripped: false,
            deficitMs: 0,
          },
        },
      },
    };
  }

  if (stage === 3) {
    next = {
      ...next,
      run: {
        ...next.run,
        space: { ...next.run.space, antimatterUnlocked: true },
      },
    };
  }

  return structureId === "galacticMemoryArchive"
    ? addStorageToAllGoods(next, addedStorageByStage(stage))
    : next;
}

/** Restore carried stages onto the fresh run at rebirth without charging or re-awarding them. */
export function restoreMegastructureProgressOnRebirth(state: GameState): GameState {
  const researched = state.permanent.megastructures.researchedTechnologyIds;
  let next: GameState = {
    ...state,
    run: {
      ...state.run,
      economy: {
        ...state.run.economy,
        researchedTechnologies: Array.from(
          new Set([...state.run.economy.researchedTechnologies, ...researched]),
        ),
        revealedTechnologies: Array.from(
          new Set([...state.run.economy.revealedTechnologies, ...researched]),
        ),
        power: {
          ...state.run.economy.power,
          ...(researched.some(
            (technologyId) =>
              technologyId === MEGASTRUCTURE_TRACKS.dysonSphere[3] ||
              technologyId === MEGASTRUCTURE_TRACKS.dysonSphere[4],
          )
            ? {
                infinitePower: true,
                gridEnabled: true,
                quantity: state.run.economy.power.capacity,
              }
            : {}),
        },
      },
      space: {
        ...state.run.space,
        antimatterUnlocked:
          state.run.space.antimatterUnlocked || hasPermanentAntimatterUnlock(state),
      },
    },
  };

  const archiveStorage = MEGASTRUCTURE_TRACKS.galacticMemoryArchive.reduce(
    (total, technologyId, index) =>
      total + (researched.includes(technologyId) ? addedStorageByStage(index + 1) : 0),
    0,
  );
  next = addStorageToAllGoods(next, archiveStorage);
  return next;
}
