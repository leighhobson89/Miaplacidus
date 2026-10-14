import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import "./CosmicRipEndingCinematic.css";
import { createPortal } from "react-dom";
import type { LocaleId } from "../content/ids";
import { cosmicRipEndingCinematicText } from "../i18n/cosmicRipEndingCinematicMessages";

type EndingStage = "voyage" | "credits" | "victory" | "closing" | "blackout" | "end";

interface CosmicRipEndingCinematicProps {
  readonly locale: LocaleId;
  readonly reducedMotion: boolean;
  readonly onComplete: () => void;
}

function systemPrefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function focusableActiveElement(): HTMLElement | null {
  const active = document.activeElement;
  return active instanceof HTMLElement && active !== document.body && active.isConnected
    ? active
    : null;
}

const END_STARS = Array.from({ length: 400 }, (_, index) => ({
  left: `${(((index * 73 + 13) % 400) / 4).toFixed(2)}%`,
  top: `${(((index * 137 + 7) % 400) / 4).toFixed(2)}%`,
  size: `${1 + (index % 3)}px`,
}));

const SHIPS = Array.from({ length: 80 }, (_, index) => {
  const leftToRight = index % 2 === 0;
  return {
    startX: leftToRight ? "-20vw" : "120vw",
    endX: leftToRight ? "120vw" : "-20vw",
    y: `${5 + ((index * 47 + 11) % 90)}vh`,
    rotation: leftToRight ? "90deg" : "-90deg",
    duration: `${5 + (((index * 37 + 17) % 100) / 100) * 5}s`,
    delay: `${0.5 + (((index * 53 + 7) % 100) / 100) * 14}s`,
  };
});

export function CosmicRipEndingCinematic({
  locale,
  reducedMotion,
  onComplete,
}: CosmicRipEndingCinematicProps) {
  const copy = cosmicRipEndingCinematicText(locale);
  const [systemReducedMotion, setSystemReducedMotion] = useState(systemPrefersReducedMotion);
  const startsReduced = reducedMotion || systemReducedMotion;
  const [motionSuppressed, setMotionSuppressed] = useState(startsReduced);
  const [stage, setStage] = useState<EndingStage>(() => (startsReduced ? "end" : "voyage"));
  const overlayRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusTarget = useRef<HTMLElement | null>(null);
  const restoreFocusOnUnmount = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const completionRequested = useRef(false);
  const staticEndingLocked = useRef(startsReduced);

  onCompleteRef.current = onComplete;

  const complete = useCallback(() => {
    if (completionRequested.current) return;
    completionRequested.current = true;
    restoreFocusOnUnmount.current = true;
    onCompleteRef.current();
  }, []);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setSystemReducedMotion(query.matches);
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  useLayoutEffect(() => {
    const appRoot = document.getElementById("root");
    const previousInert = appRoot?.inert ?? false;
    const previousOverflow = document.documentElement.style.overflow;
    returnFocusTarget.current = focusableActiveElement();

    if (appRoot) appRoot.inert = true;
    document.documentElement.style.overflow = "hidden";

    const containFocus = (event: FocusEvent) => {
      const overlay = overlayRef.current;
      if (overlay && event.target instanceof Node && !overlay.contains(event.target)) {
        skipButtonRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("focusin", containFocus, true);
    headingRef.current?.focus({ preventScroll: true });

    return () => {
      document.removeEventListener("focusin", containFocus, true);
      if (appRoot) appRoot.inert = previousInert;
      document.documentElement.style.overflow = previousOverflow;

      if (!restoreFocusOnUnmount.current || previousInert) return;
      window.requestAnimationFrame(() => {
        const target = returnFocusTarget.current;
        if (target?.isConnected && !target.closest("[inert]")) {
          target.focus({ preventScroll: true });
          return;
        }

        const activePanel = document.querySelector<HTMLElement>(
          '#panel-cosmic-rip-situation:not([hidden]), [role="tabpanel"]:not([hidden])',
        );
        activePanel?.focus({ preventScroll: true });
      });
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || systemReducedMotion) {
      staticEndingLocked.current = true;
      setMotionSuppressed(true);
      setStage("end");
      return;
    }

    if (staticEndingLocked.current || completionRequested.current) {
      setMotionSuppressed(true);
      setStage("end");
      return;
    }

    setMotionSuppressed(false);
    setStage("voyage");
    const timers = [
      window.setTimeout(() => setStage("credits"), 4_000),
      window.setTimeout(() => setStage("victory"), 16_280),
      window.setTimeout(() => setStage("closing"), 21_000),
      window.setTimeout(() => setStage("blackout"), 22_000),
      window.setTimeout(() => setStage("end"), 24_000),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [complete, reducedMotion, systemReducedMotion]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      complete();
    } else if (event.key === "Tab") {
      // The skip/continue button is the only tabbable control in this modal.
      event.preventDefault();
      skipButtonRef.current?.focus({ preventScroll: true });
    }
  };

  const announcement = motionSuppressed
    ? `${copy.victory}. ${copy.securedFuture} ${copy.playerIdentity} ${copy.theEnd}`
    : stage === "credits"
      ? `${copy.creditsHeading}. ${copy.credits.join(". ")}`
      : stage === "victory"
        ? `${copy.victory}. ${copy.securedFuture} ${copy.playerIdentity}`
        : stage === "end"
          ? copy.theEnd
          : copy.ariaLabel;

  return createPortal(
    <div
      ref={overlayRef}
      className="cosmic-rip-cinematic"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cosmic-rip-cinematic-title"
      aria-describedby="cosmic-rip-cinematic-announcement"
      data-stage={stage}
      data-reduced-motion={motionSuppressed ? "true" : "false"}
      onKeyDown={onKeyDown}
    >
      <h2 className="sr-only" id="cosmic-rip-cinematic-title" ref={headingRef} tabIndex={-1}>
        {copy.ariaLabel}
      </h2>
      <p
        className="sr-only"
        id="cosmic-rip-cinematic-announcement"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </p>

      <div className="cosmic-rip-cinematic-scene" aria-hidden="true">
        <div className="cosmic-rip-cinematic-stars" />
        <div className="cosmic-rip-cinematic-rip" />
        <div className="cosmic-rip-cinematic-rip-zip" />
        <div className="cosmic-rip-cinematic-flash" />
        <div className="cosmic-rip-cinematic-ships">
          {SHIPS.map((ship, index) => (
            <i
              key={index}
              className="cosmic-rip-cinematic-ship"
              style={
                {
                  "--ship-start-x": ship.startX,
                  "--ship-end-x": ship.endX,
                  "--ship-y": ship.y,
                  "--ship-rotation": ship.rotation,
                  "--ship-duration": ship.duration,
                  "--ship-delay": ship.delay,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div className="cosmic-rip-cinematic-credits">
          <h3>{copy.creditsHeading}</h3>
          <ul>
            {copy.credits.map((credit) => (
              <li key={credit}>{credit}</li>
            ))}
          </ul>
          <p className="cosmic-rip-cinematic-credit-game">{copy.gameName}</p>
        </div>
        <div className="cosmic-rip-cinematic-victory">
          <strong>{copy.victory}</strong>
          <span>{copy.securedFuture}</span>
          <span>{copy.playerIdentity}</span>
        </div>
      </div>

      <div className="cosmic-rip-cinematic-blackout" aria-hidden="true">
        {END_STARS.map((star, index) => (
          <i
            key={index}
            className="cosmic-rip-cinematic-star"
            style={
              {
                "--star-left": star.left,
                "--star-top": star.top,
                "--star-size": star.size,
              } as CSSProperties
            }
          />
        ))}
        <div className="cosmic-rip-cinematic-end green-ready-text">{copy.theEnd}</div>
      </div>

      {motionSuppressed ? (
        <section className="cosmic-rip-cinematic-static-ending" aria-hidden="true">
          <p>{copy.gameName}</p>
          <h3>{copy.victory}</h3>
          <p>{copy.securedFuture}</p>
          <p>{copy.playerIdentity}</p>
          <strong className="green-ready-text">{copy.theEnd}</strong>
        </section>
      ) : null}

      <button
        ref={skipButtonRef}
        className="cosmic-rip-cinematic-skip primary-button"
        type="button"
        onClick={complete}
      >
        {stage === "end" || motionSuppressed ? copy.continue : copy.skip}
      </button>
    </div>,
    document.body,
  );
}
