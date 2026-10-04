import { ACHIEVEMENT_CATALOGUE, type AchievementId } from "../content/achievements";

const PALETTES = ["#6ac7c2", "#b68aea", "#e8bb65", "#e88078", "#8ab5ef", "#87cb89", "#d69bbb"];

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

/** Stable, source-independent vector badge art keyed by achievement ID. */
export function AchievementBadge({
  id,
  locked = false,
}: {
  readonly id: AchievementId;
  readonly locked?: boolean;
}) {
  const index = ACHIEVEMENT_CATALOGUE.findIndex((achievement) => achievement.id === id);
  const motif = stableHash(id) % 7;
  const color = locked ? "#58636e" : PALETTES[stableHash(id) % PALETTES.length]!;
  const points = Array.from({ length: 8 }, (_, offset) => {
    const angle = (offset * 45 - 90) * (Math.PI / 180);
    const radius = offset % 2 === 0 ? 23 : 19;
    return `${30 + Math.cos(angle) * radius},${30 + Math.sin(angle) * radius}`;
  }).join(" ");
  return (
    <svg
      className="achievement-badge"
      viewBox="0 0 60 60"
      aria-hidden="true"
      focusable="false"
      data-achievement-badge={id}
    >
      <polygon points={points} fill="#101923" stroke={color} strokeWidth="2" />
      <circle cx="30" cy="30" r="13" fill={`${color}22`} stroke={color} strokeWidth="1.5" />
      {motif === 0 && (
        <>
          <path d="M30 19v22M19 30h22" stroke={color} strokeWidth="2" />
          <circle cx="30" cy="30" r="5" fill={color} />
        </>
      )}
      {motif === 1 && (
        <>
          <path d="M30 18 41 39H19Z" fill={`${color}55`} stroke={color} strokeWidth="2" />
          <circle cx="30" cy="31" r="3" fill={color} />
        </>
      )}
      {motif === 2 && (
        <>
          <path
            d="M21 26h18v14H21zM25 20h10v6H25z"
            fill={`${color}55`}
            stroke={color}
            strokeWidth="1.5"
          />
          <path d="M25 32h10" stroke={color} strokeWidth="2" />
        </>
      )}
      {motif === 3 && (
        <>
          <path d="M30 18 42 30 30 42 18 30Z" fill={`${color}55`} stroke={color} strokeWidth="2" />
          <circle cx="30" cy="30" r="3" fill={color} />
        </>
      )}
      {motif === 4 && (
        <>
          <path
            d="M21 34c5-13 13-13 18 0M20 29c7 8 13 8 20 0"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          <circle cx="30" cy="30" r="3" fill={color} />
        </>
      )}
      {motif === 5 && (
        <>
          <circle cx="30" cy="30" r="8" fill="none" stroke={color} strokeWidth="2" />
          <path d="M30 17v5m0 16v5M17 30h5m16 0h5" stroke={color} strokeWidth="2" />
        </>
      )}
      {motif === 6 && (
        <>
          <path d="M23 37 30 20l7 17M25 32h10" fill="none" stroke={color} strokeWidth="2.2" />
          <circle cx="30" cy="30" r="2" fill={color} />
        </>
      )}
      <text x="30" y="54" textAnchor="middle" fontSize="6" fill={color}>
        {String(index + 1).padStart(2, "0")}
      </text>
    </svg>
  );
}
