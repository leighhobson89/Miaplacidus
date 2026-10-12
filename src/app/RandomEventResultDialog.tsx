import { useEffect, useRef } from "react";
import type { RandomEventDialogCopy } from "../i18n/randomEventDialogTypes";

export interface RandomEventDialogEntry extends RandomEventDialogCopy {
  readonly id: number;
  /** App-level action to run only after this result is explicitly confirmed. */
  readonly onConfirm?: () => void;
}

interface RandomEventResultDialogProps {
  readonly entries: readonly RandomEventDialogEntry[];
  readonly onDismiss: (id: number) => void;
}

function hasAnotherOpenDialog(current: HTMLDialogElement): boolean {
  return Array.from(
    document.querySelectorAll('dialog[open], [role="dialog"][aria-modal="true"]'),
  ).some((dialog) => dialog !== current);
}

function activeHTMLElement(): HTMLElement | null {
  const active = document.activeElement;
  return active instanceof HTMLElement && active !== document.body && active.isConnected
    ? active
    : null;
}

export function RandomEventResultDialog({ entries, onDismiss }: RandomEventResultDialogProps) {
  const current = entries[0] ?? null;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const returnFocusTarget = useRef<HTMLElement | null>(null);
  const focusOriginCaptured = useRef(false);
  const confirmedEntryId = useRef<number | null>(null);
  const pendingConfirmedAction = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (entries.length !== 0 || !pendingConfirmedAction.current) return;
    const action = pendingConfirmedAction.current;
    const frame = window.requestAnimationFrame(() => {
      if (entries.length !== 0 || pendingConfirmedAction.current !== action) return;
      pendingConfirmedAction.current = null;
      action();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [entries.length]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!current || !dialog) return;

    let observer: MutationObserver | null = null;
    let openTimer = 0;
    let openFrame = 0;
    let focusFrame = 0;
    const openAfter = Date.now() + (current.openDelayMs ?? 0);

    const openWhenAvailable = () => {
      if (Date.now() < openAfter) return;
      if (
        !dialog.isConnected ||
        dialog.open ||
        hasAnotherOpenDialog(dialog) ||
        openFrame !== 0
      )
        return;

      // Wait a frame after another dialog closes so its native focus restoration can finish.
      openFrame = window.requestAnimationFrame(() => {
        openFrame = 0;
        if (!dialog.isConnected || dialog.open || hasAnotherOpenDialog(dialog)) return;

        if (!focusOriginCaptured.current) {
          returnFocusTarget.current = activeHTMLElement();
          focusOriginCaptured.current = true;
        }

        confirmedEntryId.current = null;
        observer?.disconnect();
        dialog.showModal();
        focusFrame = window.requestAnimationFrame(() => headingRef.current?.focus());
      });
    };

    observer = new MutationObserver(openWhenAvailable);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["open", "aria-modal"],
      childList: true,
      subtree: true,
    });
    // Let dialogs opened by sibling React effects enter the top layer first.
    openTimer = window.setTimeout(openWhenAvailable, current.openDelayMs ?? 0);

    return () => {
      window.clearTimeout(openTimer);
      window.cancelAnimationFrame(openFrame);
      window.cancelAnimationFrame(focusFrame);
      observer?.disconnect();
    };
  }, [current?.id]);

  if (!current) return null;

  return (
    <dialog
      ref={dialogRef}
      className="random-event-result-dialog"
      aria-labelledby="random-event-result-title"
      aria-describedby="random-event-result-copy"
      data-testid="random-event-result-dialog"
      onCancel={() => {
        confirmedEntryId.current = null;
      }}
      onClose={() => {
        if (confirmedEntryId.current === current.id && current.onConfirm) {
          pendingConfirmedAction.current = current.onConfirm;
        }
        confirmedEntryId.current = null;
        onDismiss(current.id);
        if (entries.length > 1) return;

        const focusTarget = returnFocusTarget.current;
        const dialogElement = dialogRef.current;
        returnFocusTarget.current = null;
        focusOriginCaptured.current = false;
        window.requestAnimationFrame(() => {
          if (
            focusTarget?.isConnected &&
            (!dialogElement || !hasAnotherOpenDialog(dialogElement))
          ) {
            focusTarget.focus();
          }
        });
      }}
    >
      <h2 id="random-event-result-title" ref={headingRef} tabIndex={-1}>
        {current.title}
      </h2>
      <div id="random-event-result-copy" className="random-event-result-copy">
        {current.summary ? <p>{current.summary}</p> : null}
        {current.lines.map((line, index) => (
          <p key={index} className={line.tone}>
            {line.parts
              ? line.parts.map((part, partIndex) => (
                  <span key={partIndex} className={part.tone}>
                    {part.text}
                  </span>
                ))
              : line.text}
          </p>
        ))}
      </div>
      <div className="random-event-result-actions">
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            confirmedEntryId.current = current.id;
            dialogRef.current?.close();
          }}
        >
          {current.confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
