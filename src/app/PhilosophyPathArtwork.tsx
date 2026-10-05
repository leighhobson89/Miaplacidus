import type { PhilosophyId } from "../content/ids";

function pathMark(id: PhilosophyId) {
  switch (id) {
    case "constructor":
      return (
        <g>
          <path d="M18 40h44M40 18v44M24 24l32 32m0-32L24 56" />
          <circle cx="40" cy="40" r="12" fill="var(--panel)" />
          <path d="m40 29 3 7 7 4-7 4-3 7-4-7-7-4 7-4 4-7Z" fill="var(--green)" />
          <circle cx="18" cy="40" r="3" fill="var(--blue)" />
          <circle cx="62" cy="40" r="3" fill="var(--blue)" />
          <circle cx="40" cy="18" r="3" fill="var(--cyan)" />
          <circle cx="40" cy="62" r="3" fill="var(--cyan)" />
        </g>
      );
    case "supremacist":
      return (
        <g>
          <path d="M15 48 24 30l12 11 8-20 12 20 9-11v22H15Z" fill="var(--panel-raised)" />
          <path d="M15 48 24 30l12 11 8-20 12 20 9-11v22H15Z" />
          <path d="M21 54h38M27 60h26" />
          <circle cx="44" cy="21" r="3" fill="var(--green)" />
          <circle cx="24" cy="30" r="2.5" fill="var(--cyan)" />
          <circle cx="56" cy="41" r="2.5" fill="var(--cyan)" />
        </g>
      );
    case "voidborn":
      return (
        <g>
          <ellipse cx="40" cy="40" rx="29" ry="12" transform="rotate(-22 40 40)" />
          <ellipse
            cx="40"
            cy="40"
            rx="24"
            ry="8"
            transform="rotate(25 40 40)"
            stroke="var(--blue)"
          />
          <circle cx="40" cy="40" r="13" fill="var(--panel)" />
          <circle cx="40" cy="40" r="10" fill="var(--bg-color)" stroke="var(--cyan)" />
          <path d="M32 38c5-4 11-4 16 0" stroke="var(--green)" />
          <circle cx="16" cy="20" r="2" fill="var(--blue)" />
          <circle cx="64" cy="59" r="2" fill="var(--green)" />
        </g>
      );
    case "expansionist":
      return (
        <g>
          <path d="M14 53c13-22 27-30 45-20M14 53c19 9 35 8 51-4M24 20c9 16 24 28 41 29" />
          <circle cx="14" cy="53" r="5" fill="var(--panel)" />
          <circle cx="59" cy="33" r="6" fill="var(--panel)" />
          <circle cx="65" cy="49" r="5" fill="var(--panel)" />
          <circle cx="24" cy="20" r="4" fill="var(--panel)" />
          <path d="m59 26 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="var(--green)" />
          <circle cx="14" cy="53" r="2" fill="var(--cyan)" />
          <circle cx="65" cy="49" r="2" fill="var(--blue)" />
        </g>
      );
  }
}

/** Original theme-aware artwork for the four permanent philosophy paths. */
export function PhilosophyPathArtwork({ id }: { readonly id: PhilosophyId }) {
  return (
    <svg
      className="philosophy-path-artwork"
      viewBox="0 0 80 80"
      aria-hidden="true"
      focusable="false"
      data-philosophy-art={id}
    >
      <circle className="philosophy-art-orbit" cx="40" cy="40" r="34" />
      <path className="philosophy-art-mark" d="M40 8v5M72 40h-5M40 72v-5M8 40h5" />
      <g className="philosophy-art-mark">{pathMark(id)}</g>
    </svg>
  );
}
