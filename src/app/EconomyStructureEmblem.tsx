export type EconomyStructureEmblemKind = "battery" | "laboratory" | "power-plant" | "technology";

export function EconomyStructureEmblem({ kind }: { readonly kind: EconomyStructureEmblemKind }) {
  return (
    <svg
      className="economy-structure-emblem"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-emblem-kind={kind}
    >
      {kind === "technology" ? (
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="m24 5 16 9v19l-16 10L8 33V14l16-9Z" strokeWidth="2" />
          <path d="M24 15v18m-8-9h16M14 15l6 6m14-6-6 6m-14 12 6-6m14 6-6-6" strokeWidth="1.7" />
          <circle cx="24" cy="24" r="5" fill="var(--panel-raised)" strokeWidth="2" />
          <circle cx="24" cy="7" r="2" fill="currentColor" />
          <circle cx="9" cy="14" r="2" fill="currentColor" />
          <circle cx="39" cy="14" r="2" fill="currentColor" />
          <circle cx="9" cy="33" r="2" fill="currentColor" />
          <circle cx="39" cy="33" r="2" fill="currentColor" />
          <circle cx="24" cy="43" r="2" fill="currentColor" />
        </g>
      ) : kind === "laboratory" ? (
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 38h30M12 35V23l12-9 12 9v12M18 35v-8h12v8" strokeWidth="2" />
          <path d="M20 14V9h8v5m-4-7v-3" strokeWidth="2" />
          <circle cx="24" cy="21" r="2" fill="currentColor" />
          <path d="M8 41h32" strokeWidth="2.5" />
        </g>
      ) : kind === "power-plant" ? (
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 39h32M11 36V20l9-5 8 5v16m0-10 5-4 4 4v10" strokeWidth="2" />
          <path d="M14 20V9h6v8m-6 12h4m-4 4h4m15-3 5-5" strokeWidth="2" />
          <path d="m24 21-4 7h5l-2 6 7-9h-5l2-4" fill="currentColor" strokeWidth="1.5" />
        </g>
      ) : (
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="11" width="30" height="29" rx="4" strokeWidth="2" />
          <path d="M18 7h12m-6 11-6 10h6l-2 8 8-12h-6l2-6" strokeWidth="2" />
          <path d="M39 20h3v11h-3" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}
