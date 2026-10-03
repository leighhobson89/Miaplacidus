import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../../src/engine/state";
import { compressToEncodedURIComponent } from "lz-string";
import { createTimerId } from "../../src/engine/timers";
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

  it("detects payload modification and rejects unmarked old-game codes", () => {
    const source = envelope();
    expect(isSaveEnvelope(source)).toBe(true);
    const changed = { ...source, pioneerName: "Other" };
    expect(isSaveEnvelope(changed)).toBe(false);
    expect(() => decodePortable("CF1:old-game-save")).toThrowError(SaveError);
  });

  it("migrates the synthetic version zero rung into a playable version three envelope", () => {
    const current = envelope("Mira");
    const oldState = {
      schemaVersion: 0,
      run: current.state.run,
      permanent: current.state.permanent,
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
    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.state.run.pioneerName).toBe("Mira");
    expect(migrated.state.statistics).toEqual({
      lifetimeCashEarned: 0,
      lifetimeGoodsProduced: 0,
      acceptedCommands: 0,
      completedTimers: 0,
    });
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
    const futureBody = { ...source, schemaVersion: 4 };
    const future = PORTABLE_PREFIX + compressToEncodedURIComponent(canonicalJson(futureBody));
    expect(() => decodePortable(future)).toThrowError(/newer version/i);
  });

  it("upgrades existing version one local-save state and preserves Hydrogen progress", () => {
    const current = envelope("Aster");
    const { economy: _economy, ...legacyRun } = current.state.run;
    const legacyState = {
      schemaVersion: 1,
      run: legacyRun,
      permanent: current.state.permanent,
      settings: current.state.settings,
      statistics: current.state.statistics,
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
    expect(migrated.schemaVersion).toBe(3);
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
    const oldState = {
      ...current.state,
      schemaVersion: 2,
      run: {
        ...current.state.run,
        economy: { ...current.state.run.economy, power: oldPower },
      },
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
    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.state.run.economy.power.infinitePower).toBe(false);
    expect(migrated.state.run.economy.power.environmentalMultiplier).toBe(1);
    expect(isSaveEnvelope(migrated)).toBe(true);
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
    );
    const midState = {
      ...base,
      run: {
        ...base.run,
        cash: 1250,
        researchPoints: 870,
        goods: { ...base.run.goods, hydrogen: { ...base.run.goods.hydrogen, quantity: 95 } },
        timers: midTimers,
      },
    };
    const lateState = {
      ...midState,
      permanent: {
        rebirthCount: 8,
        ascendencyPoints: 120,
        gloryPoints: 35,
        acquiredPerks: Array.from({ length: 500 }, (_, index) => "perk-" + index),
      },
      statistics: {
        lifetimeCashEarned: 9_000_000,
        lifetimeGoodsProduced: 25_000_000,
        acceptedCommands: 900_000,
        completedTimers: 42_000,
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
  it("persists first-run briefing only for fresh slots and clears it on completion or delete", () => {
    const repository = createSaveRepository(new MemoryStorage());
    const freshId = "00000000-0000-4000-8000-000000000011";
    const fresh = repository.createFresh(
      freshId,
      createInitialGameState({ pioneerName: "New Pioneer" }),
      "New Pioneer",
      100,
    );
    expect(repository.needsHydrogenBriefing(fresh.slotId)).toBe(true);
    repository.completeHydrogenBriefing(fresh.slotId);
    expect(repository.needsHydrogenBriefing(fresh.slotId)).toBe(false);

    const imported = repository.create(
      "00000000-0000-4000-8000-000000000012",
      createInitialGameState({ pioneerName: "Imported Pioneer" }),
      "Imported Pioneer",
      110,
    );
    expect(repository.needsHydrogenBriefing(imported.slotId)).toBe(false);

    const pending = repository.createFresh(
      "00000000-0000-4000-8000-000000000013",
      createInitialGameState({ pioneerName: "Deleted Pioneer" }),
      "Deleted Pioneer",
      120,
    );
    repository.remove(pending.slotId);
    expect(repository.needsHydrogenBriefing(pending.slotId)).toBe(false);
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
      repository.createFresh(
        failedFreshId,
        createInitialGameState({ pioneerName: "Uncommitted Pioneer" }),
        "Uncommitted Pioneer",
        130,
      ),
    ).toThrowError(/not enough browser storage/i);
    expect(repository.needsHydrogenBriefing(failedFreshId)).toBe(false);
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
      repository.createFresh(
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
