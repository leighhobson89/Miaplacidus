import type { SpaceWeatherCondition } from "../content/space";

export type CelestialIllustrationId =
  | "asteroid"
  | "black-hole"
  | "cosmic-rip"
  | "fleet"
  | "megastructure"
  | "rocket"
  | "star-system"
  | "weather"
  | "starship";

function weatherArtwork(weather: SpaceWeatherCondition) {
  if (weather === "volcano") {
    return (
      <g>
        <path
          d="m42 148 58-66 29 25 30-49 42 59 32-32 45 63H42Z"
          fill="var(--panel-raised)"
          stroke="var(--blue)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="m147 75 12 18 12-18m-16 18 8 18 8-18"
          stroke="var(--green)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M159 73c-13-15 12-16 0-31m-8 27c-11-11 7-14 3-24m14 24c9-10-5-14-1-24"
          stroke="var(--cyan)"
          strokeOpacity=".75"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle
          cx="246"
          cy="47"
          r="14"
          fill="var(--green)"
          fillOpacity=".28"
          stroke="var(--green)"
          strokeWidth="2"
        />
      </g>
    );
  }

  if (weather === "clear") {
    return (
      <g>
        <circle
          cx="236"
          cy="49"
          r="17"
          fill="var(--green)"
          fillOpacity=".22"
          stroke="var(--green)"
          strokeWidth="2"
        />
        <path
          d="M236 20v-9m0 76v-9m29-29h10m-78 0h10m50-20 7-7m-56 56 7-7m42 0 7 7m-56-56 7 7"
          stroke="var(--cyan)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M20 144c41-35 80-22 116-3 36-25 70-28 117-8 19 8 34 14 48 11v32H20v-32Z"
          fill="var(--panel-raised)"
          stroke="var(--blue)"
          strokeWidth="2"
        />
      </g>
    );
  }

  return (
    <g>
      <path
        d="M82 87c0-16 13-29 29-29 8-19 34-25 49-10 6-4 13-6 21-6 21 0 38 17 38 38 13 2 22 13 22 26 0 15-12 27-27 27H109c-15 0-27-12-27-27 0-8 4-15 10-19Z"
        fill="var(--panel-raised)"
        stroke="var(--cyan)"
        strokeWidth="3"
      />
      {weather === "cloudy" ? (
        <path
          d="M105 153h110"
          stroke="var(--blue)"
          strokeOpacity=".55"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <path
          d={
            weather === "heavyRain"
              ? "m112 146-8 20m30-20-8 20m30-20-8 20m30-20-8 20m30-20-8 20m30-20-8 20"
              : "m120 147-7 17m31-17-7 17m31-17-7 17m31-17-7 17"
          }
          stroke="var(--blue)"
          strokeWidth={weather === "heavyRain" ? 4 : 3}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

function artwork(kind: CelestialIllustrationId, weather: SpaceWeatherCondition) {
  switch (kind) {
    case "asteroid":
      return (
        <g>
          <path
            d="m79 90 19-28 34-10 31 17 14 31-17 32-37 10-34-17-10-35Z"
            fill="var(--panel-raised)"
            stroke="var(--blue)"
            strokeWidth="3"
          />
          <path
            d="m98 72 14-3 7 9-10 8-12-4-4-7m49-2 10 8-4 10-12 1-5-8m-35 35 13-7 9 8-5 11-13 1-6-7"
            fill="var(--muted)"
            fillOpacity=".25"
            stroke="var(--muted)"
            strokeWidth="2"
          />
          <path
            d="m53 111 24-11m112-24 26-11m-35 74 19 16m-94-94L93 43"
            stroke="var(--cyan)"
            strokeOpacity=".52"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="65" cy="58" r="2" fill="var(--cyan)" />
          <circle cx="227" cy="111" r="2.5" fill="var(--cyan)" />
        </g>
      );
    case "black-hole":
      return (
        <g>
          <ellipse cx="160" cy="93" rx="115" ry="42" fill="var(--cyan)" fillOpacity=".08" />
          <ellipse
            cx="160"
            cy="93"
            rx="108"
            ry="34"
            stroke="var(--blue)"
            strokeOpacity=".72"
            strokeWidth="3"
            transform="rotate(-12 160 93)"
          />
          <ellipse
            cx="160"
            cy="93"
            rx="95"
            ry="23"
            stroke="var(--cyan)"
            strokeWidth="5"
            transform="rotate(9 160 93)"
          />
          <path
            d="M59 85c35 17 64 27 101 27s68-11 101-28"
            stroke="var(--green)"
            strokeWidth="2"
            strokeOpacity=".74"
          />
          <circle
            cx="160"
            cy="91"
            r="38"
            fill="var(--panel)"
            stroke="var(--cyan)"
            strokeWidth="3"
          />
          <circle cx="160" cy="91" r="29" fill="#02050a" />
          <path
            d="M131 87c11-7 20-10 29-10 11 0 20 3 29 10"
            stroke="var(--cyan)"
            strokeOpacity=".85"
            strokeWidth="3"
          />
          <circle cx="64" cy="42" r="2" fill="var(--blue)" />
          <circle cx="250" cy="45" r="2.5" fill="var(--green)" />
          <circle cx="272" cy="126" r="1.8" fill="var(--cyan)" />
          <circle cx="44" cy="130" r="1.5" fill="var(--cyan)" />
        </g>
      );
    case "cosmic-rip":
      return (
        <g>
          <path
            d="M160 19c-13 22 8 30-4 48-13 20 12 30-1 49-12 18 8 26-4 46"
            stroke="var(--blue)"
            strokeOpacity=".25"
            strokeWidth="48"
            strokeLinecap="round"
          />
          <path
            d="M160 19c-13 22 8 30-4 48-13 20 12 30-1 49-12 18 8 26-4 46"
            stroke="var(--cyan)"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <path
            d="m155 30 12 17-14 14 12 18-15 15 12 17-15 20 10 16"
            stroke="var(--panel)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M63 89h58m78 0h58M83 49l38 21m78 39 39 22M91 132l31-18m77-48 32-19"
            stroke="var(--blue)"
            strokeOpacity=".7"
            strokeWidth="2"
          />
          <circle cx="160" cy="19" r="4" fill="var(--green)" />
          <circle cx="151" cy="161" r="3" fill="var(--cyan)" />
          <circle cx="69" cy="53" r="2" fill="var(--cyan)" />
          <circle cx="250" cy="133" r="2.5" fill="var(--green)" />
        </g>
      );
    case "fleet":
      return (
        <g>
          <path
            d="m160 41 17 41 55 14-42 15-13 20h-34l-13-20-42-15 55-14 17-41Z"
            fill="var(--panel-raised)"
            stroke="var(--cyan)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="m77 103 11 26 35 9-26 9-9 13h-22l-9-13-26-9 35-9 11-26Zm166 0 11 26 35 9-26 9-9 13h-22l-9-13-26-9 35-9 11-26Z"
            fill="var(--panel-raised)"
            stroke="var(--blue)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="160" cy="91" r="4" fill="var(--green)" />
          <circle cx="77" cy="139" r="2.5" fill="var(--cyan)" />
          <circle cx="243" cy="139" r="2.5" fill="var(--cyan)" />
        </g>
      );
    case "megastructure":
      return (
        <g>
          <ellipse
            cx="160"
            cy="94"
            rx="114"
            ry="42"
            stroke="var(--blue)"
            strokeOpacity=".72"
            strokeWidth="3"
          />
          <ellipse
            cx="160"
            cy="94"
            rx="82"
            ry="28"
            stroke="var(--cyan)"
            strokeWidth="5"
            transform="rotate(-24 160 94)"
          />
          <circle
            cx="160"
            cy="94"
            r="25"
            fill="var(--cyan)"
            fillOpacity=".16"
            stroke="var(--green)"
            strokeWidth="2"
          />
          <circle cx="160" cy="94" r="12" fill="var(--green)" />
          <path d="M46 94h24m180 0h24M160 25v19m0 100v19" stroke="var(--cyan)" strokeWidth="2" />
          <circle cx="252" cy="77" r="5" fill="var(--panel)" stroke="var(--cyan)" strokeWidth="2" />
          <path d="m248 77 4-4 4 4-4 4-4-4Z" fill="var(--green)" />
        </g>
      );
    case "rocket":
      return (
        <g>
          <path
            d="M160 29c28 19 39 46 38 76l-24 28h-28l-24-28c-1-30 10-57 38-76Z"
            fill="var(--panel-raised)"
            stroke="var(--cyan)"
            strokeWidth="3"
          />
          <circle
            cx="160"
            cy="76"
            r="12"
            fill="var(--blue)"
            fillOpacity=".28"
            stroke="var(--blue)"
            strokeWidth="3"
          />
          <path
            d="m122 94-24 18 4 28 32-19m64-27 24 18-4 28-32-19M151 132l-6 19 15-8 15 8-6-19"
            fill="var(--panel-raised)"
            stroke="var(--green)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="m151 147 9 23 9-23" stroke="var(--cyan)" strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "star-system":
      return (
        <g>
          <ellipse
            cx="160"
            cy="92"
            rx="125"
            ry="43"
            stroke="var(--blue)"
            strokeOpacity=".42"
            strokeWidth="2"
          />
          <ellipse
            cx="160"
            cy="92"
            rx="91"
            ry="30"
            stroke="var(--cyan)"
            strokeOpacity=".75"
            strokeWidth="2"
            transform="rotate(-21 160 92)"
          />
          <ellipse
            cx="160"
            cy="92"
            rx="54"
            ry="18"
            stroke="var(--blue)"
            strokeOpacity=".7"
            strokeWidth="2"
            transform="rotate(32 160 92)"
          />
          <circle
            cx="160"
            cy="92"
            r="21"
            fill="var(--green)"
            fillOpacity=".2"
            stroke="var(--green)"
            strokeWidth="2"
          />
          <circle cx="160" cy="92" r="10" fill="var(--green)" />
          <circle cx="264" cy="92" r="6" fill="var(--cyan)" />
          <circle cx="91" cy="54" r="4" fill="var(--blue)" />
          <circle cx="147" cy="40" r="3.5" fill="var(--cyan)" />
          <path
            d="M40 35h5m-2.5-2.5v5m220 107h5m-2.5-2.5v5M70 131h4m-2-2v4"
            stroke="var(--muted)"
            strokeOpacity=".7"
            strokeLinecap="round"
          />
        </g>
      );
    case "weather":
      return weatherArtwork(weather);
    case "starship":
      return (
        <g>
          <path
            d="m160 30 24 59 76 19-58 20-18 27h-48l-18-27-58-20 76-19 24-59Z"
            fill="var(--panel-raised)"
            stroke="var(--cyan)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="m160 40-13 70h26l-13-70Z" fill="var(--blue)" fillOpacity=".55" />
          <path
            d="m121 126-30 20m108-20 30 20m-83 9-7 18m42-18 7 18"
            stroke="var(--green)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="160" cy="119" r="5" fill="var(--green)" />
        </g>
      );
  }
}

export function CelestialIllustration({
  kind,
  className,
  weather = "cloudy",
}: {
  readonly kind: CelestialIllustrationId;
  readonly className?: string;
  readonly weather?: SpaceWeatherCondition;
}) {
  return (
    <svg
      className={className ? `celestial-illustration ${className}` : "celestial-illustration"}
      viewBox="0 0 320 180"
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-celestial-illustration={kind}
    >
      {artwork(kind, weather)}
    </svg>
  );
}
