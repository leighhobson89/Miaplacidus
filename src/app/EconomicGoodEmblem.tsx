import type { EconomicGoodId } from "../content/ids";

function mark(goodId: EconomicGoodId) {
  switch (goodId) {
    case "hydrogen":
      return (
        <>
          <ellipse cx="22" cy="22" rx="16" ry="7.5" transform="rotate(-32 22 22)" />
          <ellipse cx="22" cy="22" rx="16" ry="7.5" transform="rotate(32 22 22)" />
          <circle cx="22" cy="22" r="3.4" fill="currentColor" stroke="none" />
          <circle cx="34.4" cy="14.1" r="1.8" fill="currentColor" stroke="none" />
        </>
      );
    case "helium":
      return (
        <>
          <ellipse cx="22" cy="22" rx="16" ry="8" transform="rotate(28 22 22)" />
          <circle cx="19.5" cy="22" r="3" fill="currentColor" stroke="none" />
          <circle cx="24.8" cy="22" r="3" fill="currentColor" stroke="none" />
          <circle cx="34.2" cy="16.1" r="1.8" fill="currentColor" stroke="none" />
        </>
      );
    case "carbon":
      return (
        <>
          <path d="m22 5 14.7 8.5v17L22 39l-14.7-8.5v-17L22 5Z" />
          <path d="m22 14 6.9 4v8L22 30l-6.9-4v-8l6.9-4Z" />
          <circle cx="22" cy="5" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="36.7" cy="13.5" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="36.7" cy="30.5" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="22" cy="39" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="7.3" cy="30.5" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="7.3" cy="13.5" r="1.4" fill="currentColor" stroke="none" />
        </>
      );
    case "neon":
      return (
        <>
          <circle cx="22" cy="22" r="5" />
          <circle cx="22" cy="22" r="10" strokeDasharray="1.5 3" />
          <path d="M22 3v5m0 28v5M3 22h5m28 0h5M8.6 8.6l3.5 3.5m19.8 19.8 3.5 3.5m0-26.8-3.5 3.5m-19.8 19.8-3.5 3.5" />
        </>
      );
    case "oxygen":
      return (
        <>
          <path d="m17 22 10 0" />
          <circle cx="13" cy="22" r="7" />
          <circle cx="31" cy="22" r="7" />
          <circle cx="13" cy="22" r="2" fill="currentColor" stroke="none" />
          <circle cx="31" cy="22" r="2" fill="currentColor" stroke="none" />
        </>
      );
    case "sodium":
      return (
        <>
          <circle cx="22" cy="22" r="4" />
          <ellipse cx="22" cy="22" rx="17" ry="7" transform="rotate(54 22 22)" />
          <ellipse cx="22" cy="22" rx="17" ry="7" transform="rotate(-54 22 22)" />
          <circle cx="22" cy="22" r="1.8" fill="currentColor" stroke="none" />
          <circle cx="35.5" cy="12.8" r="1.7" fill="currentColor" stroke="none" />
        </>
      );
    case "silicon":
      return (
        <>
          <path d="m22 4 16 9v18l-16 9-16-9V13l16-9Z" />
          <path d="m6 13 16 9 16-9M22 22v18M14 8.5v18l16 9M30 8.5v18L14 35.5" />
          <circle cx="22" cy="22" r="2.6" fill="currentColor" stroke="none" />
        </>
      );
    case "iron":
      return (
        <>
          <path d="m8 13 14-8 14 8v17l-14 8-14-8V13Z" />
          <path d="M8 13h28M22 5v33M8 30h28M14 9.5v17l8 4.5 8-4.5v-17" />
        </>
      );
    case "diesel":
      return (
        <>
          <path d="M22 4c-4.6 7.2-13 14.2-13 22a13 13 0 1 0 26 0c0-7.8-8.4-14.8-13-22Z" />
          <path d="M15 27c0 4 2.7 6.5 6.5 7m7-11c-1-3-3-5-5-7" />
        </>
      );
    case "glass":
      return (
        <>
          <path d="M22 5 37 34H7L22 5Z" />
          <path d="m22 5-2 29m2-29 10 29M4 11l9 5m24 0 9-5" />
          <path d="M39 24h4M1 24h4" strokeDasharray="1.5 2.5" />
        </>
      );
    case "steel":
      return (
        <>
          <path d="m8 13 20-7 8 4-20 7-8-4Z" />
          <path d="m8 20 20-7 8 4-20 7-8-4Z" />
          <path d="m8 27 20-7 8 4-20 7-8-4Z" />
          <path d="m8 34 20-7 8 4-20 7-8-4Z" />
        </>
      );
    case "concrete":
      return (
        <>
          <path d="M6 12 22 5l16 7v20l-16 7-16-7V12Z" />
          <path d="m6 12 16 8 16-8M22 20v19" />
          <circle cx="14" cy="14" r="1" fill="currentColor" stroke="none" />
          <circle cx="30" cy="14" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="14" cy="30" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="30" cy="30" r="1" fill="currentColor" stroke="none" />
        </>
      );
    case "water":
      return (
        <>
          <path d="M22 4C17.6 11.2 10 18 10 26a12 12 0 0 0 24 0c0-8-7.6-14.8-12-22Z" />
          <path d="M15 27c.8 4 3.1 6 7 6m-7-11c-.6 1.2-1 2.4-1 3.7m14 1.8c-.4 1.5-1.1 2.8-2.2 3.8" />
        </>
      );
    case "titanium":
      return (
        <>
          <path d="M22 4 36 9v12c0 9-5.6 14.7-14 19-8.4-4.3-14-10-14-19V9l14-5Z" />
          <path d="m22 12 2.4 6.4L31 21l-6.6 2.3L22 30l-2.4-6.7L13 21l6.6-2.6L22 12Z" />
          <path d="M22 4v8m14-3-5 7m5 5h-5M8 9l5 7m-5 5h5" />
        </>
      );
  }
}

export function EconomicGoodEmblem({ goodId }: { readonly goodId: EconomicGoodId }) {
  return (
    <span className="economic-good-emblem" data-good-id={goodId} aria-hidden="true">
      <svg viewBox="0 0 44 44" fill="none" focusable="false" stroke="currentColor">
        {mark(goodId)}
      </svg>
    </span>
  );
}
