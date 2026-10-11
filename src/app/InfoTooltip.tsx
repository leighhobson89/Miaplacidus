import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface InfoTooltipProps {
  readonly id: string;
  readonly label: string;
  readonly content: ReactNode;
  readonly testId: string;
}

interface TooltipPosition {
  readonly left: number;
  readonly top: number;
}

export function InfoTooltip({ id, label, content, testId }: InfoTooltipProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ left: 12, top: 12 });
  const positionRef = useRef(position);
  const fitFrameRef = useRef<number | null>(null);

  const fitTooltip = useCallback(() => {
    if (fitFrameRef.current !== null) window.cancelAnimationFrame(fitFrameRef.current);
    fitFrameRef.current = window.requestAnimationFrame(() => {
      fitFrameRef.current = null;
      const trigger = triggerRef.current;
      const tooltip = tooltipRef.current;
      if (!trigger || !tooltip) return;

      const triggerBounds = trigger.getBoundingClientRect();
      const tooltipBounds = tooltip.getBoundingClientRect();
      const safeInset = 12;
      const targetWidth = Math.min(352, window.innerWidth - safeInset * 2);
      const targetLeft = Math.min(
        Math.max(safeInset, triggerBounds.left),
        Math.max(safeInset, window.innerWidth - targetWidth - safeInset),
      );
      const preferredTop = triggerBounds.bottom + safeInset / 2;
      const proposedTop =
        preferredTop + tooltipBounds.height + safeInset <= window.innerHeight
          ? preferredTop
          : triggerBounds.top - tooltipBounds.height - safeInset / 2;
      const targetTop = Math.min(
        Math.max(safeInset, proposedTop),
        Math.max(safeInset, window.innerHeight - tooltipBounds.height - safeInset),
      );
      const originLeft = tooltipBounds.left - positionRef.current.left;
      const originTop = tooltipBounds.top - positionRef.current.top;
      const nextPosition = {
        left: targetLeft - originLeft,
        top: targetTop - originTop,
      };
      positionRef.current = nextPosition;
      setPosition(nextPosition);
    });
  }, []);

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!anchorRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("resize", fitTooltip);
    window.addEventListener("scroll", fitTooltip, true);
    window.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      if (fitFrameRef.current !== null) window.cancelAnimationFrame(fitFrameRef.current);
      window.removeEventListener("resize", fitTooltip);
      window.removeEventListener("scroll", fitTooltip, true);
      window.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [fitTooltip]);

  const show = () => {
    setOpen(true);
    fitTooltip();
  };

  const hideWhenUnfocused = () => {
    if (!anchorRef.current?.contains(document.activeElement)) setOpen(false);
  };

  return (
    <span
      ref={anchorRef}
      className="scan-info-tooltip-anchor"
      onMouseEnter={show}
      onMouseLeave={hideWhenUnfocused}
      onFocusCapture={show}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        className="scan-info-tooltip-trigger"
        type="button"
        aria-label={label}
        aria-describedby={id}
        data-testid={`${testId}-trigger`}
      >
        <span aria-hidden="true">i</span>
      </button>
      <span
        ref={tooltipRef}
        className={`top-stat-tooltip scan-info-tooltip${open ? " is-open" : ""}`}
        id={id}
        role="tooltip"
        data-testid={testId}
        style={{ left: `${position.left}px`, top: `${position.top}px` }}
      >
        {content}
      </span>
    </span>
  );
}
