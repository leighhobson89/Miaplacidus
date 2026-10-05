import type { RandomEventId } from "../content/metaSignals";

function eventMark(id: RandomEventId) {
  switch (id) {
    case "powerPlantExplosion":
      return (
        <g>
          <path d="m24 55 16-32 16 32M31 42h18M28 49h24M40 23v32" />
          <path d="m47 21-7 11 7 2-8 12" stroke="var(--event-art-highlight)" />
          <path d="m20 24 3 4m34-4-3 4m-19-8 2 5" />
        </g>
      );
    case "batteryExplosion":
      return (
        <g>
          <path d="M29 27v-5h22v5m-22 27v5h22v-5M29 27H24v27h5m22-27h5v27h-5" />
          <path d="m44 29-9 13h7l-4 10 12-15h-8l2-8Z" fill="var(--event-art-highlight)" />
        </g>
      );
    case "scienceTheft":
      return (
        <g>
          <ellipse cx="40" cy="40" rx="20" ry="9" transform="rotate(35 40 40)" />
          <ellipse cx="40" cy="40" rx="20" ry="9" transform="rotate(-35 40 40)" />
          <circle cx="40" cy="40" r="4" fill="var(--event-art-highlight)" />
          <path d="m52 51 8 8m-3-11 7 7" />
        </g>
      );
    case "researchBreakthrough":
      return (
        <g>
          <circle cx="40" cy="40" r="6" />
          <path d="M40 16v12m0 24v12M16 40h12m24 0h12M23 23l9 9m16 16 9 9m0-34-9 9m-16 16-9 9" />
          <path
            d="m40 25 4 11 11 4-11 4-4 11-4-11-11-4 11-4 4-11Z"
            fill="var(--event-art-highlight)"
          />
        </g>
      );
    case "rocketInstantArrival":
      return (
        <g>
          <path d="M44 24c9-8 17-8 17-8s0 8-8 17L39 47l-8-8 13-15Z" />
          <circle cx="49" cy="27" r="3" />
          <path d="m31 39-8 2-3 9 11-3m7 0-2 9-9 3 3-11" />
          <path d="M17 25h13M13 33h11M17 41h8" stroke="var(--event-art-highlight)" />
        </g>
      );
    case "starshipLostInSpace":
      return (
        <g>
          <path d="m25 43 15-12 15 12-15 5-15-5Z" />
          <path d="m31 45-3 10 12-7 12 7-3-10M40 48v7" />
          <path
            d="M16 23h7m34 2h8M18 57h6m31-34-2 4m-23 3-2 4"
            stroke="var(--event-art-highlight)"
          />
          <circle cx="40" cy="20" r="2" fill="var(--event-art-highlight)" />
        </g>
      );
    case "antimatterReaction":
      return (
        <g>
          <circle cx="27" cy="40" r="9" />
          <circle cx="53" cy="40" r="9" />
          <path d="M36 40h8m-4-22v9m0 26v9m-22-22h9m26 0h9" />
          <path d="m40 28 3 8 8 4-8 3-3 9-4-9-8-3 8-4 4-8Z" fill="var(--event-art-highlight)" />
        </g>
      );
    case "stockLoss":
      return (
        <g>
          <path d="m22 33 18-10 18 10-18 10-18-10Zm0 0v20l18 10 18-10V33M40 43v20" />
          <path d="M62 23v16m-6-6 6 6 6-6" stroke="var(--event-art-highlight)" />
        </g>
      );
    case "galacticMarketLockdown":
      return (
        <g>
          <path d="M20 58h40M25 58V36m10 22V36m10 22V36m10 22V36M20 36h40L40 21 20 36Z" />
          <rect x="34" y="42" width="12" height="16" rx="2" />
          <path d="M37 42v-4a3 3 0 0 1 6 0v4" stroke="var(--event-art-highlight)" />
        </g>
      );
    case "endlessSummer":
      return (
        <g>
          <circle cx="40" cy="38" r="11" fill="var(--event-art-highlight)" />
          <path d="M40 15v7m0 32v7M17 38h7m32 0h7M24 22l5 5m22 22 5 5m0-32-5 5M29 49l-5 5" />
          <path d="M19 61c9-8 17-8 25-2 7-6 13-7 20-3" />
        </g>
      );
    case "minerBrokeDown":
      return (
        <g>
          <path d="m26 46 10-15 17 2 8 14-10 12-17-1-8-12Z" />
          <path d="m27 24 29 27M51 20l-5 9m5-9 8 7" />
          <path d="m19 54 5 4m39-38 4 4" stroke="var(--event-art-highlight)" />
          <circle cx="39" cy="39" r="3" />
        </g>
      );
    case "supplyChainDisruption":
      return (
        <g>
          <rect x="15" y="34" width="14" height="14" rx="2" />
          <rect x="51" y="21" width="14" height="14" rx="2" />
          <rect x="51" y="49" width="14" height="14" rx="2" />
          <path d="M29 38h9m4 0h9m-22 8h7m6 0h9" />
          <path d="m37 34 5 4-5 4" stroke="var(--event-art-highlight)" />
        </g>
      );
    case "blackHoleInstability":
      return (
        <g>
          <ellipse cx="40" cy="41" rx="26" ry="11" transform="rotate(-18 40 41)" />
          <circle cx="40" cy="40" r="11" fill="var(--panel)" />
          <circle
            cx="40"
            cy="40"
            r="8"
            fill="var(--bg-color)"
            stroke="var(--event-art-highlight)"
          />
          <path d="m22 18 4 4m32-4-4 4m-32 36 4-4m32 4-4-4" stroke="var(--event-art-highlight)" />
        </g>
      );
  }
}

/** Event glyphs distinguish each saved incident and active effect without text. */
export function RandomEventArtwork({
  id,
  negative,
}: {
  readonly id: RandomEventId;
  readonly negative: boolean;
}) {
  return (
    <svg
      className={`random-event-artwork${negative ? " is-negative" : ""}`}
      viewBox="0 0 80 80"
      aria-hidden="true"
      focusable="false"
      data-event-art={id}
    >
      <circle className="random-event-artwork-frame" cx="40" cy="40" r="35" />
      <g className="random-event-artwork-mark">{eventMark(id)}</g>
    </svg>
  );
}
