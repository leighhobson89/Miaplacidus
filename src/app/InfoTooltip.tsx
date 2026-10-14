import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

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
  const portalRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const [position, setPosition] = useState<TooltipPosition>({ left: 12, top: 12 });
  const fitFrameRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const portal = portalRef.current;
    if (!anchor || !portal) return;

    const anchorStyle = window.getComputedStyle(anchor);
    portal.style.color = anchorStyle.color;
    portal.style.fontFamily = anchorStyle.fontFamily;
    for (const property of ["--text", "--panel-raised", "--line-strong"]) {
      const value = anchorStyle.getPropertyValue(property);
      if (value) portal.style.setProperty(property, value);
    }
  });

  const calculatePosition = useCallback((): TooltipPosition | null => {
    if (!openRef.current) return null;
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return null;

    const triggerBounds = trigger.getBoundingClientRect();
    const tooltipBounds = tooltip.getBoundingClientRect();
    if (tooltipBounds.width <= 0 || tooltipBounds.height <= 0) return null;
    const safeInset = 12;
    const targetWidth = Math.min(352, window.innerWidth - safeInset * 2);
    const left = Math.min(
      Math.max(safeInset, triggerBounds.left),
      Math.max(safeInset, window.innerWidth - targetWidth - safeInset),
    );
    const preferredTop = triggerBounds.bottom + safeInset / 2;
    const proposedTop =
      preferredTop + tooltipBounds.height + safeInset <= window.innerHeight
        ? preferredTop
        : triggerBounds.top - tooltipBounds.height - safeInset / 2;
    const top = Math.min(
      Math.max(safeInset, proposedTop),
      Math.max(safeInset, window.innerHeight - tooltipBounds.height - safeInset),
    );
    return { left, top };
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    const nextPosition = calculatePosition();
    if (!nextPosition) return;
    setPosition((current) =>
      current.left === nextPosition.left && current.top === nextPosition.top
        ? current
        : nextPosition,
    );
  });

  const fitTooltip = useCallback(() => {
    if (fitFrameRef.current !== null) window.cancelAnimationFrame(fitFrameRef.current);
    fitFrameRef.current = window.requestAnimationFrame(() => {
      fitFrameRef.current = null;
      const nextPosition = calculatePosition();
      if (!nextPosition) return;
      setPosition((current) =>
        current.left === nextPosition.left && current.top === nextPosition.top
          ? current
          : nextPosition,
      );
    });
  }, [calculatePosition]);

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!anchorRef.current?.contains(event.target as Node)) {
        openRef.current = false;
        setOpen(false);
      }
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
    openRef.current = true;
    setOpen(true);
    fitTooltip();
  };

  const hideWhenUnfocused = () => {
    if (!anchorRef.current?.contains(document.activeElement)) {
      openRef.current = false;
      setOpen(false);
    }
  };

  return (
    <>
      <span
        ref={anchorRef}
        className="scan-info-tooltip-anchor"
        onMouseEnter={show}
        onMouseLeave={hideWhenUnfocused}
        onFocusCapture={show}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            openRef.current = false;
            setOpen(false);
          }
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
      </span>
      {typeof document !== "undefined" &&
        createPortal(
          <div ref={portalRef} className="scan-tooltip-portal">
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
          </div>,
          document.body,
        )}
    </>
  );
}
