import { decodeLocal, encodeLocal, encodePortable } from "./codec";
import { makeEnvelope, SaveError, type SaveEnvelopeV1 } from "./schema";
import { browserStorage, type StorageAdapter } from "./storage";
import { hasControlCharacters, normalizePioneerName } from "./validation";
import { decompressFromUTF16 } from "lz-string";

export const SAVE_PREFIX = "miaplacidus:v1:";
const INDEX_KEY = SAVE_PREFIX + "index";
const LAST_STARTED_KEY = SAVE_PREFIX + "lastStartedSlot";
const PREFERENCES_KEY = SAVE_PREFIX + "preferences";

export interface SaveIndexEntry {
  readonly slotId: string;
  readonly pioneerName: string;
  readonly lookupKey: string;
  readonly createdAt: number;
  readonly savedAt: number;
  readonly schemaVersion: number;
  readonly revision: number;
  readonly compressedChars: number;
  readonly status: "ready" | "corrupt" | "orphan";
}

export interface SaveRepository {
  list(): SaveIndexEntry[];
  readSlot(slotId: string): SaveEnvelopeV1 | null;
  findByName(name: string): SaveIndexEntry[];
  lastStartedSlot(): string | null;
  activate(slotId: string): void;
  create(slotId: string, state: SaveEnvelopeV1["state"], name: string, now: number): SaveEnvelopeV1;
  commit(
    slotId: string,
    state: SaveEnvelopeV1["state"],
    name: string,
    now: number,
    expectedRevision: number | null,
  ): SaveEnvelopeV1;
  rename(slotId: string, name: string, now: number, expectedRevision: number): SaveEnvelopeV1;
  remove(slotId: string): void;
  getRawSlot(slotId: string): SaveEnvelopeV1 | null;
  exportSlot(slotId: string): string;
  importNew(envelope: SaveEnvelopeV1, slotId: string, name: string, now: number): SaveEnvelopeV1;
  readPreferences(): {
    readonly locale?: string;
    readonly lastConfirmedName?: string;
    readonly autoSaveEnabled?: boolean;
    readonly autoSaveIntervalSeconds?: 300 | 900 | 1800 | 3600;
  };
  writePreferences(value: {
    readonly locale?: string;
    readonly lastConfirmedName?: string;
    readonly autoSaveEnabled?: boolean;
    readonly autoSaveIntervalSeconds?: 300 | 900 | 1800 | 3600;
  }): void;
  estimateStorage(): { readonly appBytes: number; readonly estimatedLimitBytes: number };
  restoreGeneration(reference: string, now: number): SaveEnvelopeV1;
}

function slotHeadKey(slotId: string): string {
  return SAVE_PREFIX + "head:" + slotId;
}
function slotPrefix(slotId: string): string {
  return SAVE_PREFIX + "slot:" + slotId + ":";
}
function payloadKey(slotId: string, commitId: string): string {
  return slotPrefix(slotId) + commitId;
}
function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = (Math.random() * 16) | 0;
    return (character === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
}

export function createSlotId(): string {
  return makeId();
}

function storageFailure(error: unknown): SaveError {
  const name = error instanceof Error ? error.name : "";
  return new SaveError(
    name === "QuotaExceededError" ? "quota" : "storage-unavailable",
    name === "QuotaExceededError"
      ? "There is not enough browser storage. Your previous save is still available; export or remove a save to make room."
      : "Browser storage is unavailable. You can keep playing temporarily and export this run.",
  );
}

function salvageName(encoded: string | null, expectedSlotId: string): string | null {
  if (!encoded) return null;
  try {
    const json = decompressFromUTF16(encoded);
    if (!json || json.length > 1_000_000) return null;
    const value: unknown = JSON.parse(json);
    if (!value || typeof value !== "object") return null;
    const candidate = value as { slotId?: unknown; pioneerName?: unknown };
    if (candidate.slotId !== expectedSlotId || typeof candidate.pioneerName !== "string")
      return null;
    const normalized = normalizePioneerName(candidate.pioneerName);
    if (
      !normalized.display ||
      [...normalized.display].length > 32 ||
      hasControlCharacters(normalized.display)
    )
      return null;
    return normalized.display;
  } catch {
    return null;
  }
}

function salvageRevision(encoded: string | null): number {
  if (!encoded) return 0;
  try {
    const json = decompressFromUTF16(encoded);
    if (!json || json.length > 1_000_000) return 0;
    const value = JSON.parse(json) as { revision?: unknown };
    return Number.isSafeInteger(value.revision) && (value.revision as number) > 0
      ? (value.revision as number)
      : 0;
  } catch {
    return 0;
  }
}

export function createSaveRepository(storage: StorageAdapter = browserStorage()): SaveRepository {
  function rawHead(slotId: string): string | null {
    return storage.getItem(slotHeadKey(slotId));
  }

  function readSlot(slotId: string): SaveEnvelopeV1 | null {
    const commitId = rawHead(slotId);
    if (!commitId) return null;
    const raw = storage.getItem(payloadKey(slotId, commitId));
    if (!raw) throw new SaveError("corrupt-slot", "The saved slot points to a missing generation.");
    try {
      const envelope = decodeLocal(raw);
      if (envelope.slotId !== slotId)
        throw new SaveError("corrupt-slot", "The saved slot identity does not match its payload.");
      return envelope;
    } catch (error) {
      if (error instanceof SaveError) throw new SaveError("corrupt-slot", error.message);
      throw error;
    }
  }

  function rebuildIndex(): SaveIndexEntry[] {
    const ids = new Set<string>();
    const generations = new Map<string, Set<string>>();
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      const headMatch = key?.match(/^miaplacidus:v1:head:([a-f0-9-]{16,64})$/i);
      const slotMatch = key?.match(/^miaplacidus:v1:slot:([a-f0-9-]{16,64}):([a-f0-9-]{16,64})$/i);
      if (headMatch?.[1]) ids.add(headMatch[1]);
      if (slotMatch?.[1] && slotMatch[2]) {
        ids.add(slotMatch[1]);
        const slotGenerations = generations.get(slotMatch[1]) ?? new Set<string>();
        slotGenerations.add(slotMatch[2]);
        generations.set(slotMatch[1], slotGenerations);
      }
    }
    const entries: SaveIndexEntry[] = [];
    for (const slotId of ids) {
      const head = rawHead(slotId);
      if (!head) {
        const slotGenerations = generations.get(slotId) ?? new Set<string>();
        if (slotGenerations.size === 0) {
          entries.push({
            slotId,
            pioneerName: "Recovered save",
            lookupKey: "",
            createdAt: 0,
            savedAt: 0,
            schemaVersion: 0,
            revision: 0,
            compressedChars: 0,
            status: "corrupt",
          });
          continue;
        }
        for (const generation of slotGenerations) {
          const encoded = storage.getItem(payloadKey(slotId, generation));
          try {
            const orphan = encoded ? decodeLocal(encoded) : null;
            if (!orphan || orphan.slotId !== slotId)
              throw new SaveError("corrupt-slot", "Mismatched generation");
            entries.push({
              slotId: "orphan:" + slotId + ":" + generation,
              pioneerName: orphan.pioneerName + " (interrupted first save)",
              lookupKey: "",
              createdAt: orphan.createdAt,
              savedAt: orphan.savedAt,
              schemaVersion: orphan.schemaVersion,
              revision: orphan.revision,
              compressedChars: encoded?.length ?? 0,
              status: "orphan",
            });
          } catch {
            entries.push({
              slotId: "orphan:" + slotId + ":" + generation,
              pioneerName: "Damaged generation",
              lookupKey: "",
              createdAt: 0,
              savedAt: 0,
              schemaVersion: 0,
              revision: 0,
              compressedChars: encoded?.length ?? 0,
              status: "corrupt",
            });
          }
        }
        continue;
      }
      const payload = storage.getItem(payloadKey(slotId, head));
      try {
        if (!payload) throw new SaveError("corrupt-slot", "Missing generation");
        const envelope = decodeLocal(payload);
        if (envelope.slotId !== slotId) throw new SaveError("corrupt-slot", "Mismatched slot");
        entries.push({
          slotId,
          pioneerName: envelope.pioneerName,
          lookupKey: normalizePioneerName(envelope.pioneerName).lookupKey,
          createdAt: envelope.createdAt,
          savedAt: envelope.savedAt,
          schemaVersion: envelope.schemaVersion,
          revision: envelope.revision,
          compressedChars: payload.length,
          status: "ready",
        });
      } catch {
        const damagedName = salvageName(payload, slotId);
        entries.push({
          slotId,
          pioneerName: damagedName ?? "Damaged save",
          lookupKey: damagedName ? normalizePioneerName(damagedName).lookupKey : "",
          createdAt: 0,
          savedAt: 0,
          schemaVersion: 0,
          revision: 0,
          compressedChars: payload?.length ?? 0,
          status: "corrupt",
        });
      }
      for (const generation of generations.get(slotId) ?? []) {
        if (generation === head) continue;
        const oldPayload = storage.getItem(payloadKey(slotId, generation));
        let oldName = "Recoverable generation";
        let oldSavedAt = 0;
        let oldRevision = 0;
        let recoverable = false;
        try {
          const oldEnvelope = oldPayload ? decodeLocal(oldPayload) : null;
          if (oldEnvelope?.slotId === slotId) {
            oldName = oldEnvelope.pioneerName + " (older generation)";
            oldSavedAt = oldEnvelope.savedAt;
            oldRevision = oldEnvelope.revision;
            recoverable = true;
          } else {
            oldName = "Damaged generation";
          }
        } catch {
          oldName = "Damaged generation";
        }
        entries.push({
          slotId: "orphan:" + slotId + ":" + generation,
          pioneerName: oldName,
          lookupKey: "",
          createdAt: 0,
          savedAt: oldSavedAt,
          schemaVersion: 0,
          revision: oldRevision,
          compressedChars: oldPayload?.length ?? 0,
          status: recoverable ? "orphan" : "corrupt",
        });
      }
    }
    entries.sort((a, b) => b.savedAt - a.savedAt || a.slotId.localeCompare(b.slotId));
    try {
      storage.setItem(INDEX_KEY, JSON.stringify({ version: 1, entries }));
    } catch {
      /* Index is a rebuildable cache. */
    }
    return entries;
  }

  function list(): SaveIndexEntry[] {
    try {
      const cached = storage.getItem(INDEX_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as { version?: number; entries?: SaveIndexEntry[] };
          if (parsed.version === 1 && Array.isArray(parsed.entries)) return rebuildIndex();
        } catch {
          /* Invalid cache: scan committed heads. */
        }
      }
      return rebuildIndex();
    } catch {
      return [];
    }
  }

  function estimateStorage(): { appBytes: number; estimatedLimitBytes: number } {
    let characters = 0;
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key?.startsWith(SAVE_PREFIX)) continue;
      characters += key.length + (storage.getItem(key)?.length ?? 0);
    }
    return { appBytes: characters * 2, estimatedLimitBytes: 5 * 1024 * 1024 };
  }

  function commit(
    slotId: string,
    state: SaveEnvelopeV1["state"],
    name: string,
    now: number,
    expectedRevision: number | null,
    allowCorruptCurrent = false,
    minimumRevision = 0,
  ): SaveEnvelopeV1 {
    const normalized = normalizePioneerName(name);
    const currentHead = rawHead(slotId);
    let current: SaveEnvelopeV1 | null = null;
    let corruptRevision = 0;
    if (currentHead) {
      try {
        current = readSlot(slotId);
      } catch {
        if (!allowCorruptCurrent)
          throw new SaveError(
            "corrupt-slot",
            "This slot is damaged. Export or recover it before writing.",
          );
        corruptRevision = salvageRevision(storage.getItem(payloadKey(slotId, currentHead)));
      }
    }
    if ((current?.revision ?? null) !== expectedRevision)
      throw new SaveError(
        "conflict",
        "This slot changed in another tab. Reload or export this run before saving.",
      );
    const duplicate = list().find(
      (entry) =>
        entry.status !== "orphan" &&
        entry.slotId !== slotId &&
        entry.lookupKey === normalized.lookupKey,
    );
    if (duplicate)
      throw new SaveError("duplicate-name", "Another local save already uses this name.");
    const envelope = makeEnvelope({
      slotId,
      pioneerName: normalized.display,
      createdAt: current?.createdAt ?? now,
      savedAt: now,
      revision: Math.max(current?.revision ?? 0, corruptRevision, minimumRevision) + 1,
      state: { ...state, run: { ...state.run, pioneerName: normalized.display } },
    });
    const commitId = makeId();
    const encoded = encodeLocal(envelope);
    try {
      storage.setItem(payloadKey(slotId, commitId), encoded);
      const verified = storage.getItem(payloadKey(slotId, commitId));
      if (!verified || decodeLocal(verified).checksum !== envelope.checksum)
        throw new SaveError("corrupt-slot", "The new save did not pass readback validation.");
      const checkHead = rawHead(slotId);
      let checkRevision: number | null = null;
      if (allowCorruptCurrent && currentHead && !current) {
        if (checkHead !== currentHead)
          throw new SaveError(
            "conflict",
            "This slot changed in another tab. The previous save remains available.",
          );
      } else if (checkHead) {
        const headPayload = storage.getItem(payloadKey(slotId, checkHead));
        if (headPayload) checkRevision = decodeLocal(headPayload).revision;
      }
      if (checkRevision !== expectedRevision)
        throw new SaveError(
          "conflict",
          "This slot changed in another tab. The previous save remains available.",
        );
      storage.setItem(slotHeadKey(slotId), commitId);
    } catch (error) {
      if (error instanceof SaveError) throw error;
      throw storageFailure(error);
    }
    const entry: SaveIndexEntry = {
      slotId,
      pioneerName: envelope.pioneerName,
      lookupKey: normalized.lookupKey,
      createdAt: envelope.createdAt,
      savedAt: envelope.savedAt,
      schemaVersion: envelope.schemaVersion,
      revision: envelope.revision,
      compressedChars: encoded.length,
      status: "ready",
    };
    try {
      const entries = list().filter((candidate) => candidate.slotId !== slotId);
      entries.push(entry);
      entries.sort((a, b) => b.savedAt - a.savedAt);
      storage.setItem(INDEX_KEY, JSON.stringify({ version: 1, entries }));
    } catch {
      /* The committed head is authoritative; rebuild the index next time. */
    }
    return envelope;
  }

  return {
    list,
    readSlot,
    findByName(name) {
      const lookupKey = normalizePioneerName(name).lookupKey;
      return list().filter((entry) => entry.status !== "orphan" && entry.lookupKey === lookupKey);
    },
    lastStartedSlot() {
      try {
        const slotId = storage.getItem(LAST_STARTED_KEY);
        if (!slotId) return null;
        return list().some((entry) => entry.slotId === slotId && entry.status === "ready")
          ? slotId
          : null;
      } catch {
        return null;
      }
    },
    activate(slotId) {
      if (!readSlot(slotId))
        throw new SaveError(
          "not-found",
          "This pioneer has not reached its first saved checkpoint.",
        );
      storage.setItem(LAST_STARTED_KEY, slotId);
    },
    create(slotId, state, name, now) {
      return commit(slotId, state, name, now, null);
    },
    commit,
    rename(slotId, name, now, expectedRevision) {
      const existing = readSlot(slotId);
      if (!existing) throw new SaveError("not-found", "That local save could not be found.");
      return commit(slotId, existing.state, name, now, expectedRevision);
    },
    remove(slotId) {
      let removedName: string | null = null;
      try {
        removedName = readSlot(slotId)?.pioneerName ?? null;
      } catch {
        /* The explicit delete also removes damaged slots. */
      }
      for (let index = storage.length - 1; index >= 0; index -= 1) {
        const key = storage.key(index);
        if (key === slotHeadKey(slotId) || key?.startsWith(slotPrefix(slotId)))
          storage.removeItem(key);
      }
      storage.removeItem(SAVE_PREFIX + "hydrogenBriefing:" + slotId);
      if (storage.getItem(LAST_STARTED_KEY) === slotId) storage.removeItem(LAST_STARTED_KEY);
      const remaining = list().filter((entry) => entry.status === "ready");
      const preferences = this.readPreferences();
      const confirmedNameStillExists = preferences.lastConfirmedName
        ? remaining.some(
            (entry) =>
              entry.lookupKey === normalizePioneerName(preferences.lastConfirmedName!).lookupKey,
          )
        : false;
      if (
        !confirmedNameStillExists ||
        (removedName &&
          preferences.lastConfirmedName &&
          normalizePioneerName(preferences.lastConfirmedName).lookupKey ===
            normalizePioneerName(removedName).lookupKey)
      ) {
        this.writePreferences({ lastConfirmedName: remaining[0]?.pioneerName ?? "Pioneer" });
      }
    },
    getRawSlot: readSlot,
    exportSlot(slotId) {
      const envelope = readSlot(slotId);
      if (!envelope) throw new SaveError("not-found", "That local save could not be found.");
      return encodePortable(envelope);
    },
    importNew(envelope, slotId, name, now) {
      return commit(slotId, envelope.state, name, now, null);
    },
    estimateStorage,
    restoreGeneration(reference, now) {
      const match = reference.match(/^orphan:([a-f0-9-]{16,64}):([a-f0-9-]{16,64})$/i);
      if (!match?.[1] || !match[2])
        throw new SaveError("not-found", "That recovery generation is not available.");
      const [, slotId, generation] = match;
      const encoded = storage.getItem(payloadKey(slotId, generation));
      if (!encoded) throw new SaveError("not-found", "That recovery generation is not available.");
      const recovered = decodeLocal(encoded);
      if (recovered.slotId !== slotId)
        throw new SaveError("corrupt-slot", "The recovery generation belongs to another slot.");
      let revision: number | null = null;
      let corruptCurrent = false;
      try {
        revision = readSlot(slotId)?.revision ?? null;
      } catch {
        corruptCurrent = true;
      }
      return commit(
        slotId,
        recovered.state,
        recovered.pioneerName,
        now,
        revision,
        corruptCurrent,
        recovered.revision,
      );
    },
    readPreferences() {
      try {
        const parsed: unknown = JSON.parse(storage.getItem(PREFERENCES_KEY) ?? "{}");
        if (!parsed || typeof parsed !== "object") return {};
        const value = parsed as {
          locale?: unknown;
          lastConfirmedName?: unknown;
          autoSaveEnabled?: unknown;
          autoSaveIntervalSeconds?: unknown;
        };
        return {
          ...(typeof value.locale === "string" ? { locale: value.locale } : {}),
          ...(typeof value.lastConfirmedName === "string"
            ? { lastConfirmedName: value.lastConfirmedName }
            : {}),
          ...(typeof value.autoSaveEnabled === "boolean"
            ? { autoSaveEnabled: value.autoSaveEnabled }
            : {}),
          ...([300, 900, 1800, 3600].includes(value.autoSaveIntervalSeconds as number)
            ? { autoSaveIntervalSeconds: value.autoSaveIntervalSeconds as 300 | 900 | 1800 | 3600 }
            : [10, 30, 60].includes(value.autoSaveIntervalSeconds as number)
              ? { autoSaveIntervalSeconds: 300 as const }
              : {}),
        };
      } catch {
        return {};
      }
    },
    writePreferences(value) {
      const current = this.readPreferences();
      try {
        storage.setItem(PREFERENCES_KEY, JSON.stringify({ ...current, ...value }));
      } catch {
        /* Boot preferences do not block play. */
      }
    },
  };
}
