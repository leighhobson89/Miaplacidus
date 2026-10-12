export type RandomEventDialogTone =
  | "green-ready-text"
  | "red-disabled-text"
  | "orange-warning-text";

export interface RandomEventDialogPart {
  readonly text: string;
  readonly tone?: RandomEventDialogTone;
}

export interface RandomEventDialogLine {
  readonly text: string;
  readonly tone?: RandomEventDialogTone;
  /** Optional inline formatting used when the source colors only a placeholder. */
  readonly parts?: readonly RandomEventDialogPart[];
}

export interface RandomEventDialogCopy {
  readonly title: string;
  readonly summary: string;
  readonly lines: readonly RandomEventDialogLine[];
  readonly confirmLabel: string;
  /** Optional source-matched wait before opening the result dialog. */
  readonly openDelayMs?: number;
}
