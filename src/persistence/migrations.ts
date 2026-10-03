import type { GameState } from "../engine/state";
import { makeEnvelope, SaveError, type SaveEnvelopeV1 } from "./schema";
import { normalizePioneerName } from "./validation";

export interface SaveEnvelopeV0 {
  readonly format: "miaplacidus.save";
  readonly schemaVersion: 0;
  readonly slotId: string;
  readonly pioneerName: string;
  readonly createdAt: number;
  readonly savedAt: number;
  readonly revision: number;
  readonly state: {
    readonly schemaVersion: 0;
    readonly run: GameState["run"];
    readonly permanent: GameState["permanent"];
    readonly settings: GameState["settings"];
  };
  readonly checksum: string;
}

export function migrateSaveV0(
  value: unknown,
  checksumFor: (body: Omit<SaveEnvelopeV1, "checksum">) => string,
): SaveEnvelopeV1 {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new SaveError("invalid-envelope", "The earlier save is not a valid object.");
  const envelope = value as Partial<SaveEnvelopeV0>;
  const expectedKeys = [
    "format",
    "schemaVersion",
    "slotId",
    "pioneerName",
    "createdAt",
    "savedAt",
    "revision",
    "state",
    "checksum",
  ];
  const actualKeys = Object.keys(value).sort();
  if (
    actualKeys.length !== expectedKeys.length ||
    actualKeys.some((key, index) => key !== [...expectedKeys].sort()[index]) ||
    envelope.format !== "miaplacidus.save" ||
    envelope.schemaVersion !== 0 ||
    typeof envelope.slotId !== "string" ||
    !/^[a-f0-9-]{16,64}$/i.test(envelope.slotId) ||
    typeof envelope.pioneerName !== "string" ||
    normalizePioneerName(envelope.pioneerName).display !== envelope.pioneerName ||
    !Number.isSafeInteger(envelope.createdAt) ||
    envelope.createdAt! < 0 ||
    !Number.isSafeInteger(envelope.savedAt) ||
    envelope.savedAt! < envelope.createdAt! ||
    !Number.isSafeInteger(envelope.revision) ||
    envelope.revision! < 1 ||
    !envelope.state ||
    envelope.state.schemaVersion !== 0 ||
    Object.keys(envelope.state).sort().join(",") !== "permanent,run,schemaVersion,settings" ||
    !envelope.state.run ||
    envelope.state.run.pioneerName !== envelope.pioneerName
  )
    throw new SaveError("invalid-envelope", "The earlier save does not match its declared format.");
  const { checksum, ...body } = envelope as SaveEnvelopeV0;
  if (
    typeof checksum !== "string" ||
    checksumFor(body as unknown as Omit<SaveEnvelopeV1, "checksum">) !== checksum
  ) {
    throw new SaveError("checksum", "The earlier save failed its integrity check.");
  }
  const { state } = envelope;
  const migratedState = {
    schemaVersion: 1 as const,
    run: state.run,
    permanent: state.permanent,
    settings: state.settings,
    statistics: {
      lifetimeCashEarned: 0,
      lifetimeGoodsProduced: 0,
      acceptedCommands: 0,
      completedTimers: 0,
    },
  } satisfies GameState;
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt!,
    savedAt: envelope.savedAt!,
    revision: envelope.revision!,
    state: migratedState,
  });
}
