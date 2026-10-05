import { describe, expect, it } from "vitest";
import { createInitialGameState, isValidGameState, type GameState } from "../../src/engine/state";
import { createStarCatalogue, findStarByName } from "../../src/content/starCatalogue";
import { createInitialStarSystemBattleState } from "../../src/content/space";
import { compressToEncodedURIComponent, compressToUTF16 } from "lz-string";
import { createTimer, createTimerId } from "../../src/engine/timers";
import { STAR_WEATHER_TIMER_ID } from "../../src/engine/weather";
import {
  decodeLocal,
  decodePortable,
  encodeLocal,
  encodePortable,
  PORTABLE_PREFIX,
} from "../../src/persistence/codec";
import { createSaveRepository, SAVE_PREFIX } from "../../src/persistence/repository";
import {
  canonicalJson,
  checksumFor,
  isSaveEnvelope,
  makeEnvelope,
  SAVE_SCHEMA_VERSION,
  SaveError,
  type SaveEnvelopeV1,
} from "../../src/persistence/schema";
import { MemoryStorage, type StorageAdapter } from "../../src/persistence/storage";
import { normalizePioneerName, validatePioneerName } from "../../src/persistence/validation";

function envelope(name = "Ada Lovelace"): SaveEnvelopeV1 {
  const state = createInitialGameState({ pioneerName: name, seed: 17, locale: "fr" });
  return makeEnvelope({
    slotId: "00000000-0000-4000-8000-000000000001",
    pioneerName: name,
    createdAt: 10,
    savedAt: 20,
    revision: 1,
    state,
  });
}

class HeadFailureStorage implements StorageAdapter {
  failHeadWrites = false;
  constructor(private readonly inner: MemoryStorage) {}
  get length() {
    return this.inner.length;
  }
  key(index: number) {
    return this.inner.key(index);
  }
  getItem(key: string) {
    return this.inner.getItem(key);
  }
  setItem(key: string, value: string) {
    if (this.failHeadWrites && key.startsWith(SAVE_PREFIX + "head:")) {
      const error = new Error("simulated storage failure");
      error.name = "QuotaExceededError";
      throw error;
    }
    this.inner.setItem(key, value);
  }
  removeItem(key: string) {
    this.inner.removeItem(key);
  }
}

class SecurityFailureStorage implements StorageAdapter {
  constructor(private readonly inner: MemoryStorage) {}
  get length() {
    return this.inner.length;
  }
  key(index: number) {
    return this.inner.key(index);
  }
  getItem(key: string) {
    return this.inner.getItem(key);
  }
  setItem(key: string, value: string) {
    const error = new Error("storage access was denied");
    error.name = "SecurityError";
    throw error;
  }
  removeItem(key: string) {
    this.inner.removeItem(key);
  }
}

describe("local save formats and identity", () => {
  it("round-trips the versioned envelope in local and portable LZ formats", () => {
    const source = envelope("Élodie 🚀");
    expect(decodeLocal(encodeLocal(source))).toEqual(source);
    expect(decodePortable(encodePortable(source))).toEqual(source);
    expect(encodePortable(source)).toMatch(/^MIA1:/);
  });

  it("persists per-good production ledgers through local and portable saves", () => {
    const base = envelope("Production Ledger");
    const state = {
      ...base.state,
      run: {
        ...base.state.run,
        goodsProducedThisRun: {
          ...base.state.run.goodsProducedThisRun,
          hydrogen: 12.5,
          water: 7,
        },
      },
      statistics: {
        ...base.state.statistics,
        lifetimeGoodsProducedByGood: {
          ...base.state.statistics.lifetimeGoodsProducedByGood,
          hydrogen: 123.5,
          water: 42,
        },
      },
    };
    const source = makeEnvelope({
      slotId: base.slotId,
      pioneerName: base.pioneerName,
      createdAt: base.createdAt,
      savedAt: base.savedAt,
      revision: base.revision,
      state,
    });

    expect(decodeLocal(encodeLocal(source)).state).toEqual(state);
    expect(decodePortable(encodePortable(source)).state).toEqual(state);
  });

  it("detects payload modification and rejects unmarked old-game codes", () => {
    const source = envelope();
    expect(isSaveEnvelope(source)).toBe(true);
    const changed = { ...source, pioneerName: "Other" };
    expect(isSaveEnvelope(changed)).toBe(false);
    expect(() => decodePortable("CF1:old-game-save")).toThrowError(SaveError);
  });

  it("migrates the synthetic version zero rung into a playable current envelope", () => {
    const current = envelope("Mira");
    const {
      economy: _economy,
      space: _space,
      philosophyAbilityActive: _philosophyAbilityActive,
      ...legacyRun
    } = current.state.run;
    const { philosophyId: _philosophyId, ...legacyPermanent } = current.state.permanent;
    const oldState = {
      schemaVersion: 0,
      run: legacyRun,
      permanent: legacyPermanent,
      settings: current.state.settings,
    };
    const oldBody = {
      format: current.format,
      schemaVersion: 0,
      slotId: current.slotId,
      pioneerName: current.pioneerName,
      createdAt: current.createdAt,
      savedAt: current.savedAt,
      revision: current.revision,
      state: oldState,
    };
    const checksum = checksumFor(oldBody as unknown as Omit<SaveEnvelopeV1, "checksum">);
    const oldCode =
      PORTABLE_PREFIX + compressToEncodedURIComponent(canonicalJson({ ...oldBody, checksum }));
    const migrated = decodePortable(oldCode);
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.pioneerName).toBe("Mira");
    expect(migrated.state.statistics).toMatchObject({
      lifetimeCashEarned: 0,
      lifetimeGoodsProduced: 0,
      lifetimeAntimatterMined: 0,
      lifetimeActiveMs: 0,
      acceptedCommands: 0,
      completedTimers: 0,
    });
    expect(migrated.state.statistics.lifetimeRandomEventCounts).toEqual(
      createInitialGameState().statistics.lifetimeRandomEventCounts,
    );
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("rejects unknown fields and future versions", () => {
    const source = envelope();
    const tamperedBody = { ...source, state: { ...source.state, cloudAccountId: "unexpected" } };
    const tampered = {
      ...tamperedBody,
      checksum: checksumFor(tamperedBody as unknown as Omit<SaveEnvelopeV1, "checksum">),
    };
    expect(isSaveEnvelope(tampered)).toBe(false);
    const futureBody = { ...source, schemaVersion: SAVE_SCHEMA_VERSION + 1 };
    const future = PORTABLE_PREFIX + compressToEncodedURIComponent(canonicalJson(futureBody));
    expect(() => decodePortable(future)).toThrowError(/newer version/i);
  });

  it("upgrades existing version one local-save state and preserves Hydrogen progress", () => {
    const current = envelope("Aster");
    const {
      economy: _economy,
      space: _space,
      philosophyAbilityActive: _philosophyAbilityActive,
      ...legacyRun
    } = current.state.run;
    const { philosophyId: _philosophyId, ...legacyPermanent } = current.state.permanent;
    const { lifetimeAntimatterMined: _lifetimeAntimatterMined, ...legacyStatistics } =
      current.state.statistics;
    const legacyState = {
      schemaVersion: 1,
      run: legacyRun,
      permanent: legacyPermanent,
      settings: current.state.settings,
      statistics: legacyStatistics,
    };
    const { checksum: _checksum, ...currentBody } = current;
    const legacyBody = { ...currentBody, schemaVersion: 1, state: legacyState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...legacyBody,
          checksum: checksumFor(legacyBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );
    const migrated = decodePortable(oldCode);
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.goods.hydrogen).toEqual(current.state.run.goods.hydrogen);
    expect(migrated.state.run.hydrogenAutobuyerEnabled).toBe(
      current.state.run.hydrogenAutobuyerEnabled,
    );
    expect(migrated.state.run.economy.autobuyerEnabled["autobuyer:hydrogen:tier:1"]).toBe(true);
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("migrates v2 power state with neutral weather and no infinite-power effect", () => {
    const current = envelope("Vega");
    const {
      infinitePower: _infinitePower,
      environmentalMultiplier: _environmentalMultiplier,
      ...oldPower
    } = current.state.run.economy.power;
    const {
      space: _space,
      philosophyAbilityActive: _philosophyAbilityActive,
      ...oldRun
    } = current.state.run;
    const { philosophyId: _philosophyId, ...oldPermanent } = current.state.permanent;
    const { lifetimeAntimatterMined: _lifetimeAntimatterMined, ...oldStatistics } =
      current.state.statistics;
    const oldState = {
      ...current.state,
      schemaVersion: 2,
      run: { ...oldRun, economy: { ...current.state.run.economy, power: oldPower } },
      permanent: oldPermanent,
      statistics: oldStatistics,
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 2, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );
    const migrated = decodePortable(oldCode);
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.economy.power.infinitePower).toBe(false);
    expect(migrated.state.run.economy.power.environmentalMultiplier).toBe(1);
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("migrates version three runs with a fresh space state and preserves economy progress", () => {
    const current = envelope("Altair");
    const {
      space: _space,
      philosophyAbilityActive: _philosophyAbilityActive,
      ...oldRun
    } = current.state.run;
    const { philosophyId: _philosophyId, ...oldPermanent } = current.state.permanent;
    const { lifetimeAntimatterMined: _lifetimeAntimatterMined, ...oldStatistics } =
      current.state.statistics;
    const oldState = {
      ...current.state,
      schemaVersion: 3,
      run: oldRun,
      permanent: oldPermanent,
      statistics: oldStatistics,
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 3, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );
    const migrated = decodePortable(oldCode);
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.space.telescopeBuilt).toBe(false);
    expect(migrated.state.run.goods.hydrogen).toEqual(current.state.run.goods.hydrogen);
    expect(migrated.state.run.economy).toEqual(current.state.run.economy);
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("migrates v4 asteroid records by adding the interacted flag", () => {
    const current = envelope("Altair");
    const { philosophyAbilityActive: _philosophyAbilityActive, ...oldRun } = current.state.run;
    const {
      antimatterUnlocked: _antimatterUnlocked,
      antimatterBoostActive: _antimatterBoostActive,
      currentSystemWeather: _currentSystemWeather,
      voidPillageCompletions: _voidPillageCompletions,
      antimatterMinedThisRun: _antimatterMinedThisRun,
      ...oldSpace
    } = oldRun.space;
    const { philosophyId: _philosophyId, ...oldPermanent } = current.state.permanent;
    const { lifetimeAntimatterMined: _lifetimeAntimatterMined, ...oldStatistics } =
      current.state.statistics;
    const oldState = {
      ...current.state,
      schemaVersion: 4,
      run: {
        ...oldRun,
        space: {
          ...oldSpace,
          telescopeBuilt: true,
          asteroids: [
            {
              id: "asteroid-1",
              name: "SPI-0001A",
              systemId: "spica",
              distance: 30_000,
              rarity: "common",
              extractionEase: 1,
              remainingAntimatter: 700,
              totalAntimatter: 700,
              reservedBy: null,
              depleted: false,
            },
          ],
          selectedAsteroidId: "asteroid-1",
          nextAsteroidSequence: 2,
        },
      },
      permanent: oldPermanent,
      statistics: oldStatistics,
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 4, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );
    const migrated = decodePortable(oldCode);
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.space.asteroids[0]).toMatchObject({ interacted: false });
    expect(migrated.state.run.space.selectedAsteroidId).toBe("asteroid-1");
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("migrates v5 space saves with safe weather and inactive boost defaults", () => {
    const current = envelope("Altair");
    const {
      antimatterUnlocked: _antimatterUnlocked,
      antimatterBoostActive: _antimatterBoostActive,
      currentSystemWeather: _currentSystemWeather,
      voidPillageCompletions: _voidPillageCompletions,
      antimatterMinedThisRun: _antimatterMinedThisRun,
      ...oldSpace
    } = current.state.run.space;
    const { philosophyAbilityActive: _philosophyAbilityActive, ...oldRun } = current.state.run;
    const { philosophyId: _philosophyId, ...oldPermanent } = current.state.permanent;
    const { lifetimeAntimatterMined: _lifetimeAntimatterMined, ...oldStatistics } =
      current.state.statistics;
    const oldState = {
      ...current.state,
      schemaVersion: 5,
      run: { ...oldRun, space: oldSpace },
      permanent: oldPermanent,
      statistics: oldStatistics,
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 5, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );
    const migrated = decodePortable(oldCode);
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.space).toMatchObject({
      antimatterBoostActive: false,
      currentSystemWeather: "clear",
      antimatterMinedThisRun: 0,
    });
    expect(migrated.state.statistics.lifetimeAntimatterMined).toBe(0);
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("migrates v6 saves by initializing antimatter totals from held stock", () => {
    const current = envelope("Altair");
    const {
      antimatterUnlocked: _antimatterUnlocked,
      voidPillageCompletions: _voidPillageCompletions,
      antimatterMinedThisRun: _antimatterMinedThisRun,
      ...oldSpace
    } = current.state.run.space;
    const { philosophyAbilityActive: _philosophyAbilityActive, ...oldRun } = current.state.run;
    const { philosophyId: _philosophyId, ...oldPermanent } = current.state.permanent;
    const { lifetimeAntimatterMined: _lifetimeAntimatterMined, ...oldStatistics } =
      current.state.statistics;
    const oldState = {
      ...current.state,
      schemaVersion: 6,
      run: {
        ...oldRun,
        space: { ...oldSpace, antimatter: 42 },
      },
      permanent: oldPermanent,
      statistics: oldStatistics,
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 6, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );

    const migrated = decodePortable(oldCode);
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.space.antimatterMinedThisRun).toBe(42);
    expect(migrated.state.statistics.lifetimeAntimatterMined).toBe(42);
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("migrates v7 saves with inactive philosophy ability defaults", () => {
    const current = envelope("Altair");
    const { philosophyAbilityActive: _philosophyAbilityActive, ...oldRun } = current.state.run;
    const {
      antimatterUnlocked: _antimatterUnlocked,
      voidPillageCompletions: _voidPillageCompletions,
      ...oldSpace
    } = current.state.run.space;
    const { philosophyId: _philosophyId, ...oldPermanent } = current.state.permanent;
    const oldState = {
      ...current.state,
      schemaVersion: 7,
      run: { ...oldRun, space: oldSpace },
      permanent: oldPermanent,
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 7, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );

    const migrated = decodePortable(oldCode);
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.philosophyAbilityActive).toBe(false);
    expect(migrated.state.permanent.philosophyId).toBeNull();
    expect(migrated.state.run.space.voidPillageCompletions).toBe(0);
    expect(migrated.state.statistics.lifetimeAntimatterMined).toBe(
      current.state.statistics.lifetimeAntimatterMined,
    );
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("migrates v8 antimatter totals into the saved unlock state", () => {
    const current = envelope("Nova");
    const { antimatterUnlocked: _antimatterUnlocked, ...oldSpace } = current.state.run.space;
    const oldState = {
      ...current.state,
      schemaVersion: 8,
      run: {
        ...current.state.run,
        space: { ...oldSpace, antimatter: 3, antimatterMinedThisRun: 3 },
      },
      statistics: { ...current.state.statistics, lifetimeAntimatterMined: 3 },
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 8, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );

    const migrated = decodePortable(oldCode);
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.space.antimatterUnlocked).toBe(true);
    expect(migrated.state.run.space.antimatterMinedThisRun).toBe(3);
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("migrates v9 saves by materializing persistent star profiles", () => {
    const current = envelope("Nova");
    const { systemProfiles: _systemProfiles, ...oldSpace } = current.state.run.space;
    const oldState = {
      ...current.state,
      schemaVersion: 9,
      run: { ...current.state.run, space: oldSpace },
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 9, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );

    const migrated = decodePortable(oldCode);
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.space.systemProfiles).toHaveLength(1);
    expect(migrated.state.permanent.megastructures.ancientManuscripts).toEqual([]);
    expect(migrated.state.run.space.systemProfiles[0]).toMatchObject({
      precipitationGoodId: "water",
      weatherChances: { sunny: 30, cloudy: 47, rain: 20, volcano: 3 },
    });
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("migrates v12 starship saves with empty manuscript and encounter records", () => {
    const current = envelope("Nova");
    const {
      systemEncounters: _systemEncounters,
      fleetEnvoyBuilt: _fleetEnvoyBuilt,
      playerFleets: _playerFleets,
      playerFleetCombatTotals: _playerFleetCombatTotals,
      ...oldSpace
    } = current.state.run.space;
    const oldState = {
      ...current.state,
      schemaVersion: 12,
      run: { ...current.state.run, space: oldSpace },
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 12, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );

    const migrated = decodePortable(oldCode);
    expect(migrated.state.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.permanent.megastructures.ancientManuscripts).toEqual([]);
    expect(migrated.state.run.space.systemEncounters).toEqual([]);
    expect(migrated.state.run.space.fleetEnvoyBuilt).toBe(false);
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("migrates v13 diplomacy saves without an Envoy state", () => {
    const current = envelope("Orion");
    const {
      fleetEnvoyBuilt: _fleetEnvoyBuilt,
      playerFleets: _playerFleets,
      playerFleetCombatTotals: _playerFleetCombatTotals,
      ...oldSpace
    } = current.state.run.space;
    const oldState = {
      ...current.state,
      schemaVersion: 13,
      run: { ...current.state.run, space: oldSpace },
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 13, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );

    const migrated = decodePortable(oldCode);
    expect(migrated.state.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.space.fleetEnvoyBuilt).toBe(false);
    expect(migrated.state.run.space.playerFleets).toEqual({
      scout: 0,
      marauder: 0,
      landStalker: 0,
      navalStrafer: 0,
    });
    expect(migrated.state.run.space.systemEncounters).toEqual([]);
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("migrates v14 diplomacy saves with an empty player fleet", () => {
    const current = envelope("Sirius");
    const {
      playerFleets: _playerFleets,
      playerFleetCombatTotals: _playerFleetCombatTotals,
      ...oldSpace
    } = current.state.run.space;
    const oldState = {
      ...current.state,
      schemaVersion: 14,
      run: { ...current.state.run, space: oldSpace },
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 14, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );

    const migrated = decodePortable(oldCode);
    expect(migrated.state.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.space.playerFleets).toEqual({
      scout: 0,
      marauder: 0,
      landStalker: 0,
      navalStrafer: 0,
    });
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("migrates v15 fleets with power totals derived from their saved quantities", () => {
    const current = envelope("Vega");
    const { playerFleetCombatTotals: _playerFleetCombatTotals, ...oldSpace } =
      current.state.run.space;
    const oldState = {
      ...current.state,
      schemaVersion: 15,
      run: {
        ...current.state.run,
        space: {
          ...oldSpace,
          playerFleets: { ...oldSpace.playerFleets, scout: 3 },
        },
      },
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 15, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );

    const migrated = decodePortable(oldCode);
    expect(migrated.state.run.space.playerFleets.scout).toBe(3);
    expect(migrated.state.run.space.playerFleetCombatTotals.scout).toEqual({
      attackPower: 6,
      defensePower: 6,
    });
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("migrates v16 diplomacy encounters with inactive war state", () => {
    const current = envelope("Altair");
    const encounter = {
      systemId: findStarByName(createStarCatalogue(), "Sirius")!.id,
      lifeDetected: true,
      civilizationLevel: "industrial",
      lifeformTraits: ["diplomatic", "terrans", "powerSiphon"],
      raceName: "Sirians",
      populationEstimate: 2_000_000,
      threatLevel: "low",
      defenseRating: 20,
      enemyFleets: { air: 2, land: 3, sea: 1 },
      anomalies: [],
      initialImpression: 50,
      currentImpression: 50,
      latestDifferenceInImpression: 0,
      attitude: "neutral",
      triedToBully: false,
      patience: 4,
      lastDiplomacyMessage: null,
    };
    const oldState = {
      ...current.state,
      schemaVersion: 16,
      run: {
        ...current.state.run,
        space: { ...current.state.run.space, systemEncounters: [encounter] },
      },
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 16, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );

    const migrated = decodePortable(oldCode);
    expect(migrated.state.run.space.systemEncounters[0]).toMatchObject({
      warReady: false,
      warMode: false,
    });
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("migrates v17 war saves to compact battles and default system ownership", () => {
    const current = envelope("Vega");
    const startingSystemId = current.state.permanent.settledSystemIds[0];
    const encounter = {
      systemId: findStarByName(createStarCatalogue(), "Sirius")!.id,
      lifeDetected: true,
      civilizationLevel: "industrial",
      lifeformTraits: ["aggressive", "terrans", "armored"],
      raceName: "Sirius Wardens",
      populationEstimate: 2_000_000,
      threatLevel: "low",
      defenseRating: 20,
      enemyFleets: { air: 2, land: 3, sea: 1 },
      anomalies: [],
      initialImpression: 20,
      currentImpression: 20,
      latestDifferenceInImpression: 0,
      attitude: "belligerent",
      triedToBully: false,
      patience: 4,
      lastDiplomacyMessage: null,
      warReady: true,
      warMode: false,
    };
    const {
      settledSystemIds: _settledSystemIds,
      oTypePowerPlantAssignments: _oTypePowerPlantAssignments,
      ...oldPermanent
    } = current.state.permanent;
    const { ascendencyAwardedThisRun: _ascendencyAwardedThisRun, ...oldSpace } =
      current.state.run.space;
    const oldState = {
      ...current.state,
      schemaVersion: 17,
      permanent: oldPermanent,
      run: {
        ...current.state.run,
        space: { ...oldSpace, systemEncounters: [encounter] },
      },
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 17, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );

    const migrated = decodePortable(oldCode);
    expect(migrated.state.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.permanent.settledSystemIds).toEqual([startingSystemId]);
    expect(migrated.state.run.space.ascendencyAwardedThisRun).toBe(false);
    expect(migrated.state.run.space.systemEncounters[0]).toMatchObject({
      warReady: true,
      warMode: false,
      battle: {
        phase: "idle",
        round: 0,
        playerHealthPool: { scout: 0 },
        enemyHealthPool: { air: 0 },
      },
    });
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("migrates v18 saves and restores O-type plant ownership from settled systems", () => {
    const current = envelope("Vega");
    const initial = current.state;
    const oTypeSystemId = createStarCatalogue().find((star) => star.starType === "O")!.id;
    const { oTypePowerPlantAssignments: _assignments, ...oldPermanent } = initial.permanent;
    const oldState = {
      ...initial,
      schemaVersion: 18,
      permanent: {
        ...oldPermanent,
        settledSystemIds: [...oldPermanent.settledSystemIds, oTypeSystemId],
      },
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 18, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );

    const migrated = decodePortable(oldCode);
    expect(migrated.state.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(Object.values(migrated.state.permanent.oTypePowerPlantAssignments)).toContain(
      oTypeSystemId,
    );
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("migrates v19 saves with a durable system weather timer", () => {
    const current = envelope("Weather Pioneer");
    const initial = current.state;
    const {
      weatherSystemId: _weatherSystemId,
      weatherCycleCount: _weatherCycleCount,
      severeWeatherPeriodCount: _severeWeatherPeriodCount,
      currentPrecipitationRate: _currentPrecipitationRate,
      precipitationCollectedThisRun: _precipitationCollectedThisRun,
      ...oldSpace
    } = initial.run.space;
    const { [STAR_WEATHER_TIMER_ID]: _weatherTimer, ...oldTimers } = initial.run.timers;
    const oldState = {
      ...initial,
      schemaVersion: 19,
      run: {
        ...initial.run,
        timers: oldTimers,
        space: { ...oldSpace, currentSystemWeather: "rain" },
      },
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 19, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );

    const migrated = decodePortable(oldCode);

    expect(migrated.state.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.timers[STAR_WEATHER_TIMER_ID]).toMatchObject({
      domain: "weather",
      status: "running",
      elapsedMs: 0,
    });
    expect(migrated.state.run.space.weatherSystemId).toBe(migrated.state.run.space.currentSystemId);
    expect(migrated.state.run.space.precipitationCollectedThisRun).toBe(0);
    expect(migrated.state.run.space.currentPrecipitationRate).toBe(1);
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("migrates v20 saves with default Galactic Market state", () => {
    const current = envelope("Market Pioneer");
    const initial = current.state;
    const {
      marketLiquidatedThisRun: _liquidated,
      marketLockdownRemainingMs: _lockdown,
      ...oldRun
    } = initial.run;
    const { galacticMarket: _market, ...oldPermanent } = initial.permanent;
    const oldState = {
      ...initial,
      schemaVersion: 20,
      run: {
        ...oldRun,
        goods: {
          ...oldRun.goods,
          hydrogen: { ...oldRun.goods.hydrogen, quantity: 90 },
        },
      },
      permanent: { ...oldPermanent, ascendencyPoints: 42, acquiredPerks: ["smartAutoBuyers:2"] },
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 20, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );

    const migrated = decodePortable(oldCode);

    expect(migrated.state.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.marketLiquidatedThisRun).toBe(false);
    expect(migrated.state.run.marketLockdownRemainingMs).toBe(0);
    expect(migrated.state.permanent.galacticMarket.commissionPercent).toBe(10);
    expect(migrated.state.permanent.galacticMarket.goods.hydrogen.tradeVolume).toBe(100_000);
    expect(migrated.state.permanent.ascendencyPoints).toBe(42);
    expect(migrated.state.permanent.acquiredPerks).toEqual(["smartAutoBuyers:2"]);
    expect(migrated.state.run.goods.hydrogen.quantity).toBe(90);
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("round-trips every interstellar timer with settled-system state after rebirth", () => {
    const initial = createInitialGameState({ pioneerName: "Interstellar Save", seed: 1902 });
    const spaceTimerIds = [
      createTimerId("survey", "asteroid-scan"),
      createTimerId("survey", "star-study"),
      createTimerId("survey", "void-pillage"),
      ...[1, 2, 3, 4].map((index) => createTimerId("travel", `rocket-${index}-journey`)),
      createTimerId("travel", "starship-voyage"),
      createTimerId("battle", "starship-combat"),
    ];
    const timers = {
      ...initial.run.timers,
      ...Object.fromEntries(
        spaceTimerIds.map((id) => [
          id,
          createTimer({
            id,
            domain: id.split(":")[0] as "survey" | "travel" | "battle",
            durationMs: 90_000,
          }),
        ]),
      ),
    };
    const destinationSystemId = findStarByName(createStarCatalogue(), "Sirius")!.id;
    const encounter = {
      systemId: destinationSystemId,
      lifeDetected: true,
      civilizationLevel: "industrial" as const,
      lifeformTraits: ["aggressive", "terrans", "armored"] as const,
      raceName: "Save Testers",
      populationEstimate: 2_000_000,
      threatLevel: "low" as const,
      defenseRating: 0,
      enemyFleets: { air: 1, land: 0, sea: 0 },
      anomalies: [],
      initialImpression: 20,
      currentImpression: 20,
      latestDifferenceInImpression: 0,
      attitude: "belligerent" as const,
      triedToBully: false,
      patience: 0,
      lastDiplomacyMessage: null,
      warReady: false,
      warMode: true,
      battle: {
        ...createInitialStarSystemBattleState(),
        phase: "inProgress" as const,
        playerHealthPool: { scout: 100, marauder: 0, landStalker: 0, navalStrafer: 0 },
        enemyHealthPool: { air: 100, land: 0, sea: 0 },
      },
    };
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        timers,
        space: {
          ...initial.run.space,
          weatherCycleCount: 9,
          severeWeatherPeriodCount: 2,
          currentPrecipitationRate: 3,
          precipitationCollectedThisRun: 42,
          systemEncounters: [encounter],
        },
      },
      permanent: {
        ...initial.permanent,
        rebirthCount: 2,
        ascendencyPoints: 21,
        gloryPoints: 8,
      },
    };
    expect(isValidGameState(state)).toBe(true);
    const saved = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000902",
      pioneerName: "Interstellar Save",
      createdAt: 10,
      savedAt: 20,
      revision: 1,
      state,
    });

    const restored = decodePortable(encodePortable(saved));

    expect(restored.state.run.timers[STAR_WEATHER_TIMER_ID]).toEqual(
      state.run.timers[STAR_WEATHER_TIMER_ID],
    );
    for (const timerId of spaceTimerIds)
      expect(restored.state.run.timers[timerId]).toEqual(state.run.timers[timerId]);
    expect(restored.state.run.space).toMatchObject({
      weatherCycleCount: 9,
      severeWeatherPeriodCount: 2,
      currentPrecipitationRate: 3,
      precipitationCollectedThisRun: 42,
      systemEncounters: [encounter],
    });
    expect(restored.state.permanent).toMatchObject({
      rebirthCount: 2,
      ascendencyPoints: 21,
      gloryPoints: 8,
      settledSystemIds: state.permanent.settledSystemIds,
    });
  });

  it("measures early, middle, and late profile payloads with room for two generations", () => {
    const early = envelope("Aster");
    const base = createInitialGameState({ pioneerName: "Io", seed: 42 });
    const midTimers = Object.fromEntries(
      Array.from({ length: 24 }, (_, index) => {
        const timerId = createTimerId("research", "fixture-" + index);
        return [
          timerId,
          {
            id: timerId,
            domain: "research",
            durationMs: 60_000,
            elapsedMs: index * 500,
            repeat: true,
            completionCount: index,
            status: "running",
            policy: { phase: "simulation", offlineEligible: true, warpable: true },
          },
        ];
      }),
    ) as GameState["run"]["timers"];
    const midState: GameState = {
      ...base,
      run: {
        ...base.run,
        cash: 1250,
        researchPoints: 870,
        goods: { ...base.run.goods, hydrogen: { ...base.run.goods.hydrogen, quantity: 95 } },
        timers: { ...base.run.timers, ...midTimers },
      },
    };
    const lateState = {
      ...midState,
      permanent: {
        rebirthCount: 8,
        ascendencyPoints: 120,
        gloryPoints: 35,
        galacticMarket: base.permanent.galacticMarket,
        galacticCasino: base.permanent.galacticCasino,
        blackHole: base.permanent.blackHole,
        megastructures: base.permanent.megastructures,
        cosmicRip: base.permanent.cosmicRip,
        achievements: base.permanent.achievements,
        oTypePowerPlantAssignments: base.permanent.oTypePowerPlantAssignments,
        acquiredPerks: Array.from({ length: 500 }, (_, index) => "perk-" + index),
        philosophyId: null,
        philosophyRepeatableRanks: base.permanent.philosophyRepeatableRanks,
        settledSystemIds: base.permanent.settledSystemIds,
      },
      statistics: {
        lifetimeCashEarned: 9_000_000,
        lifetimeGoodsProduced: 25_000_000,
        lifetimeAntimatterMined: 100,
        lifetimeAscendencyPointsGained: 0,
        lifetimeAsteroidsDiscovered: 0,
        lifetimeLegendaryAsteroidsDiscovered: 0,
        lifetimeAsteroidsMined: 0,
        lifetimeRocketsBuilt: 0,
        lifetimeRocketsLaunched: 0,
        lifetimeStarshipsLaunched: 0,
        lifetimeGoodsProducedByGood: base.statistics.lifetimeGoodsProducedByGood,
        lifetimeActiveMs: 1_800_000,
        acceptedCommands: 900_000,
        completedTimers: 42_000,
        lifetimeRandomEventCounts: base.statistics.lifetimeRandomEventCounts,
      },
    };
    const profiles = [
      early,
      makeEnvelope({
        slotId: "00000000-0000-4000-8000-000000000002",
        pioneerName: "Io",
        createdAt: 10,
        savedAt: 20,
        revision: 1,
        state: midState,
      }),
      makeEnvelope({
        slotId: "00000000-0000-4000-8000-000000000003",
        pioneerName: "Aster Late",
        createdAt: 10,
        savedAt: 20,
        revision: 1,
        state: { ...lateState, run: { ...lateState.run, pioneerName: "Aster Late" } },
      }),
    ];
    const sizes = profiles.map((profile) => encodeLocal(profile).length);
    console.info("MIAPLACIDUS representative UTF-16 payload sizes", sizes);
    expect(sizes).toHaveLength(3);
    expect(Math.max(...sizes) * 4).toBeLessThan(5 * 1024 * 1024);
  });

  it("normalizes equivalent Unicode names while preserving display spelling", () => {
    expect(normalizePioneerName("  E\u0301lodie   Jane ").display).toBe("Élodie Jane");
    expect(normalizePioneerName("Straße").lookupKey).toBe(
      normalizePioneerName("STRASSE").lookupKey,
    );
    expect(validatePioneerName("  Pioneer  ").display).toBe("Pioneer");
    expect(() => validatePioneerName("   ")).toThrowError(SaveError);
    expect(() => validatePioneerName("x".repeat(33))).toThrowError(SaveError);
  });
});

describe("local save repository", () => {
  it("creates fresh slots without first-run briefing metadata", () => {
    const storage = new MemoryStorage();
    const repository = createSaveRepository(storage);
    const freshId = "00000000-0000-4000-8000-000000000011";
    const fresh = repository.create(
      freshId,
      createInitialGameState({ pioneerName: "New Pioneer" }),
      "New Pioneer",
      100,
    );
    expect(repository.readSlot(fresh.slotId)).not.toBeNull();
    expect(
      Array.from({ length: storage.length }, (_, index) => storage.key(index)).some((key) =>
        key?.includes(":hydrogenBriefing:"),
      ),
    ).toBe(false);

    const imported = repository.create(
      "00000000-0000-4000-8000-000000000012",
      createInitialGameState({ pioneerName: "Imported Pioneer" }),
      "Imported Pioneer",
      110,
    );
    expect(repository.readSlot(imported.slotId)).not.toBeNull();
  });

  it("creates independent slots, enforces normalized uniqueness, and uses an explicit active ID", () => {
    const storage = new MemoryStorage();
    storage.setItem("another-app:data", "preserve");
    const repository = createSaveRepository(storage);
    const first = repository.create(
      "00000000-0000-4000-8000-000000000001",
      createInitialGameState({ pioneerName: "Ada" }),
      "Ada",
      100,
    );
    repository.activate(first.slotId);
    expect(repository.lastStartedSlot()).toBe(first.slotId);
    expect(() =>
      repository.create(
        "00000000-0000-4000-8000-000000000002",
        createInitialGameState({ pioneerName: "ADA" }),
        "ADA",
        110,
      ),
    ).toThrowError(/already uses this name/i);
    expect(storage.getItem("another-app:data")).toBe("preserve");
    expect(repository.list().filter((entry) => entry.status === "ready")).toHaveLength(1);
  });

  it("rebuilds a stale index from heads and preserves an older commit when a new head write fails", () => {
    const backing = new MemoryStorage();
    const storage = new HeadFailureStorage(backing);
    const repository = createSaveRepository(storage);
    const initial = repository.create(
      "00000000-0000-4000-8000-000000000001",
      createInitialGameState({ pioneerName: "Ada" }),
      "Ada",
      100,
    );
    backing.setItem(SAVE_PREFIX + "index", "{broken");
    expect(repository.list().find((entry) => entry.slotId === initial.slotId)?.status).toBe(
      "ready",
    );
    const changed = {
      ...initial.state,
      run: {
        ...initial.state.run,
        goods: {
          ...initial.state.run.goods,
          hydrogen: { ...initial.state.run.goods.hydrogen, quantity: 7 },
        },
      },
    };
    storage.failHeadWrites = true;
    expect(() =>
      repository.commit(initial.slotId, changed, "Ada", 120, initial.revision),
    ).toThrowError(/not enough browser storage/i);
    const failedFreshId = "00000000-0000-4000-8000-000000000014";
    expect(() =>
      repository.create(
        failedFreshId,
        createInitialGameState({ pioneerName: "Uncommitted Pioneer" }),
        "Uncommitted Pioneer",
        130,
      ),
    ).toThrowError(/not enough browser storage/i);
    storage.failHeadWrites = false;
    expect(repository.readSlot(initial.slotId)?.revision).toBe(1);
    expect(repository.readSlot(initial.slotId)?.state.run.goods.hydrogen.quantity).toBe(0);
    expect(repository.list().some((entry) => entry.status === "orphan")).toBe(true);
  });

  it("keeps existing slots intact when an imported generation cannot commit", () => {
    const backing = new MemoryStorage();
    const storage = new HeadFailureStorage(backing);
    const repository = createSaveRepository(storage);
    const existing = repository.create(
      "00000000-0000-4000-8000-000000000001",
      createInitialGameState({ pioneerName: "Ada" }),
      "Ada",
      100,
    );
    const incomingState = createInitialGameState({ pioneerName: "Mira" });
    const incoming = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000009",
      pioneerName: "Mira",
      createdAt: 10,
      savedAt: 20,
      revision: 1,
      state: incomingState,
    });
    storage.failHeadWrites = true;
    expect(() =>
      repository.importNew(incoming, "00000000-0000-4000-8000-000000000002", "Mira", 120),
    ).toThrowError(/not enough browser storage/i);
    storage.failHeadWrites = false;
    expect(repository.readSlot(existing.slotId)?.pioneerName).toBe("Ada");
    expect(repository.readSlot(existing.slotId)?.state.run.goods.hydrogen.quantity).toBe(0);
    expect(
      repository
        .list()
        .filter((entry) => entry.status === "ready")
        .map((entry) => entry.pioneerName),
    ).toEqual(["Ada"]);
    expect(repository.list().some((entry) => entry.status === "orphan")).toBe(true);
  });

  it("detects a stale revision instead of overwriting a concurrent commit", () => {
    const storage = new MemoryStorage();
    const firstTab = createSaveRepository(storage);
    const secondTab = createSaveRepository(storage);
    const created = firstTab.create(
      "00000000-0000-4000-8000-000000000001",
      createInitialGameState({ pioneerName: "Ada" }),
      "Ada",
      100,
    );
    firstTab.commit(created.slotId, created.state, "Ada", 110, 1);
    expect(() => secondTab.commit(created.slotId, created.state, "Ada", 120, 1)).toThrowError(
      /changed in another tab/i,
    );
  });

  it("maps browser SecurityError to an unsaved session without creating a head", () => {
    const storage = new SecurityFailureStorage(new MemoryStorage());
    const repository = createSaveRepository(storage);
    expect(() =>
      repository.create(
        "00000000-0000-4000-8000-000000000001",
        createInitialGameState({ pioneerName: "Storage denied" }),
        "Storage denied",
        100,
      ),
    ).toThrowError(/browser storage is unavailable/i);
    expect(storage.key(0)).toBeNull();
  });

  it("exports without storage and rejects an oversized portable code before decompression", () => {
    expect(PORTABLE_PREFIX).toBe("MIA1:");
    expect(() => decodePortable("MIA1:" + "a".repeat(900_006))).toThrowError(
      /exceeds the supported size/i,
    );
    const repository = createSaveRepository(new MemoryStorage());
    expect(() => repository.exportSlot("00000000-0000-4000-8000-000000000001")).toThrowError(
      /could not be found/i,
    );
  });
});

describe("Black Hole save migration", () => {
  it("adds empty permanent progression and run-local charge fields to v23 saves", () => {
    const current = envelope("Black Hole Pioneer");
    const {
      blackHoleChargeReady: _chargeReady,
      blackHoleWarpActive: _warpActive,
      ...oldRun
    } = current.state.run;
    const { blackHole: _blackHole, ...oldPermanent } = current.state.permanent;
    const oldState = {
      ...current.state,
      schemaVersion: 23,
      run: oldRun,
      permanent: oldPermanent,
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 23, state: oldState };
    const oldCode =
      PORTABLE_PREFIX +
      compressToEncodedURIComponent(
        canonicalJson({
          ...oldBody,
          checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
        }),
      );

    const migrated = decodePortable(oldCode);
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.permanent.blackHole).toMatchObject({
      discovered: false,
      researched: false,
      power: 5,
      durationMs: 3_000,
    });
    expect(migrated.state.run.blackHoleChargeReady).toBe(false);
    expect(migrated.state.run.blackHoleWarpActive).toBe(false);
    expect(isSaveEnvelope(migrated)).toBe(true);
  });
});

describe("lifetime statistics save migration", () => {
  it("preserves source Overview totals through save and reload", () => {
    const initial = createInitialGameState({ pioneerName: "Stats Save", seed: 18 });
    const state: GameState = {
      ...initial,
      statistics: {
        ...initial.statistics,
        lifetimeAscendencyPointsGained: 7,
        lifetimeAsteroidsDiscovered: 3,
        lifetimeLegendaryAsteroidsDiscovered: 1,
        lifetimeAsteroidsMined: 6,
        lifetimeRocketsBuilt: 4,
        lifetimeRocketsLaunched: 2,
        lifetimeStarshipsLaunched: 4,
      },
      run: {
        ...initial.run,
        space: { ...initial.run.space, asteroidsMinedThisRun: 2 },
      },
    };
    const saved = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000913",
      pioneerName: state.run.pioneerName,
      createdAt: 10,
      savedAt: 20,
      revision: 1,
      state,
    });

    const restored = decodePortable(encodePortable(saved));
    expect(restored.state.statistics).toMatchObject({
      lifetimeAscendencyPointsGained: 7,
      lifetimeAsteroidsDiscovered: 3,
      lifetimeLegendaryAsteroidsDiscovered: 1,
      lifetimeAsteroidsMined: 6,
      lifetimeRocketsBuilt: 4,
      lifetimeRocketsLaunched: 2,
      lifetimeStarshipsLaunched: 4,
    });
  });

  it("adds source Overview counters to version 34 saves", () => {
    const current = envelope("Stats Migration");
    const {
      lifetimeAscendencyPointsGained: _apGain,
      lifetimeAsteroidsDiscovered: _asteroids,
      lifetimeLegendaryAsteroidsDiscovered: _legendaryAsteroids,
      lifetimeAsteroidsMined: _asteroidsMined,
      lifetimeRocketsBuilt: _rocketsBuilt,
      lifetimeRocketsLaunched: _rockets,
      lifetimeStarshipsLaunched: _starships,
      lifetimeGoodsProducedByGood: _goodsProduced,
      ...oldStatistics
    } = current.state.statistics;
    const { goodsProducedThisRun: _goodsProducedThisRun, ...oldRun } = current.state.run;
    const { asteroidsMinedThisRun: _minedThisRun, ...oldSpace } = oldRun.space;
    const oldState = {
      ...current.state,
      schemaVersion: 34,
      run: { ...oldRun, space: oldSpace },
      statistics: oldStatistics,
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 34, state: oldState };
    const oldSave = {
      ...oldBody,
      checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
    };

    const migrated = decodeLocal(compressToUTF16(JSON.stringify(oldSave)));
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.statistics).toMatchObject({
      lifetimeAscendencyPointsGained: 0,
      lifetimeAsteroidsDiscovered: 0,
      lifetimeLegendaryAsteroidsDiscovered: 0,
      lifetimeAsteroidsMined: 0,
      lifetimeRocketsBuilt: 0,
      lifetimeRocketsLaunched: 0,
      lifetimeStarshipsLaunched: 0,
      lifetimeActiveMs: current.state.statistics.lifetimeActiveMs,
    });
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("adds Space Mining counters to version 35 saves", () => {
    const current = envelope("Space Mining Migration");
    const {
      lifetimeAsteroidsMined: _asteroidsMined,
      lifetimeRocketsBuilt: _rocketsBuilt,
      lifetimeGoodsProducedByGood: _goodsProduced,
      ...oldStatistics
    } = current.state.statistics;
    const { asteroidsMinedThisRun: _asteroidsMinedThisRun, ...oldSpace } = current.state.run.space;
    const { goodsProducedThisRun: _goodsProducedThisRun, ...oldRun } = current.state.run;
    const oldState = {
      ...current.state,
      schemaVersion: 35,
      run: { ...oldRun, space: oldSpace },
      statistics: oldStatistics,
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 35, state: oldState };
    const oldSave = {
      ...oldBody,
      checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
    };

    const migrated = decodeLocal(compressToUTF16(JSON.stringify(oldSave)));
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.space.asteroidsMinedThisRun).toBe(0);
    expect(migrated.state.statistics).toMatchObject({
      lifetimeAsteroidsMined: 0,
      lifetimeRocketsBuilt: 0,
    });
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("adds per-good production counters to version 36 saves", () => {
    const current = envelope("Production Statistics Migration");
    const { lifetimeGoodsProducedByGood: _goodsProduced, ...oldStatistics } =
      current.state.statistics;
    const { goodsProducedThisRun: _goodsProducedThisRun, ...oldRun } = current.state.run;
    const oldState = {
      ...current.state,
      schemaVersion: 36,
      run: oldRun,
      statistics: oldStatistics,
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 36, state: oldState };
    const oldSave = {
      ...oldBody,
      checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
    };

    const migrated = decodeLocal(compressToUTF16(JSON.stringify(oldSave)));
    const expectedZeros = Object.fromEntries(
      Object.keys(current.state.run.goodsProducedThisRun).map((goodId) => [goodId, 0]),
    );
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.goodsProducedThisRun).toEqual(expectedZeros);
    expect(migrated.state.statistics.lifetimeGoodsProducedByGood).toEqual(expectedZeros);
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("upgrades a version 32 save with an empty pending-navigation list", () => {
    const current = envelope("Navigation Migration Pioneer");
    const {
      navigationAttentionIds: _attention,
      navigationAttentionInitialized: _initialized,
      ...oldRun
    } = current.state.run;
    const oldState = { ...current.state, schemaVersion: 32, run: oldRun };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 32, state: oldState };
    const oldSave = {
      ...oldBody,
      checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
    };

    const migrated = decodeLocal(compressToUTF16(JSON.stringify(oldSave)));
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.navigationAttentionIds).toEqual([]);
    expect(migrated.state.run.navigationAttentionInitialized).toBe(false);
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("upgrades a version 33 save without losing pending attention IDs", () => {
    const current = envelope("First Access Migration Pioneer");
    const { navigationAttentionInitialized: _initialized, ...oldRun } = current.state.run;
    const oldState = {
      ...current.state,
      schemaVersion: 33,
      run: {
        ...oldRun,
        navigationAttentionIds: ["settings-visual", "miaplaedia-story"],
      },
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 33, state: oldState };
    const oldSave = {
      ...oldBody,
      checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
    };

    const migrated = decodeLocal(compressToUTF16(JSON.stringify(oldSave)));
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.run.navigationAttentionIds).toEqual([
      "settings-visual",
      "miaplaedia-story",
    ]);
    expect(migrated.state.run.navigationAttentionInitialized).toBe(false);
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("upgrades a version 29 envelope through the current save decoder", () => {
    const current = envelope("Active-Time Pioneer");
    const { lifetimeActiveMs: _active, ...oldStatistics } = current.state.statistics;
    const oldState = {
      ...current.state,
      schemaVersion: 29,
      statistics: oldStatistics,
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 29, state: oldState };
    const oldSave = {
      ...oldBody,
      checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
    };

    const migrated = decodeLocal(compressToUTF16(JSON.stringify(oldSave)));
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.statistics.lifetimeActiveMs).toBe(0);
    expect(isSaveEnvelope(migrated)).toBe(true);
  });

  it("upgrades a version 30 envelope with the theme-history and active-event state", () => {
    const current = envelope("Theme Migration Pioneer");
    const { themeIdsTried: _themeIdsTried, ...oldAchievements } =
      current.state.permanent.achievements;
    const oldState = {
      ...current.state,
      schemaVersion: 30,
      settings: { ...current.state.settings, themeId: "midnight" },
      permanent: {
        ...current.state.permanent,
        achievements: oldAchievements,
      },
    };
    const { checksum: _checksum, ...currentBody } = current;
    const oldBody = { ...currentBody, schemaVersion: 30, state: oldState };
    const oldSave = {
      ...oldBody,
      checksum: checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]),
    };

    const migrated = decodeLocal(compressToUTF16(JSON.stringify(oldSave)));
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated.state.settings.themeId).toBe("terminal");
    expect(migrated.state.permanent.achievements.themeIdsTried).toEqual(["terminal"]);
    expect(isSaveEnvelope(migrated)).toBe(true);
  });
});
