# P-31 asset optimization audit — 14 October 2026

## Scope and implementation

The production build was measured before and after a focused split of the Cosmic Rip ending cinematic. `App.tsx` now imports `CosmicRipEndingCinematic` lazily, and the component's scene CSS, responsive rules, reduced-motion rules, and keyframes are in `CosmicRipEndingCinematic.css`, which is imported by that lazy component. The component is requested only after the accepted Cosmic Rip closure result starts the ending. The existing startup/save/game routes do not request these ending-only JavaScript or CSS chunks. The cinematic's animation, dialog, focus handling, and completion callback were otherwise left intact.

The startup scene remains an `image` preload with `fetchpriority="high"` in `index.html`. Vite rewrites it to its hashed production asset. No raster images or font files are present under `src/assets`; its three SVGs total 5,664 bytes (startup scene 3,291; emblem 1,498; favicon 875). No conversion or resizing was warranted.

The 30 owner-approved MP3s total 6,555,278 bytes and remain unchanged. The largest are `bgAmbience.mp3` (2,400,478 bytes), `eruptionLoop.mp3` (2,040,480 bytes), and `rainLoop.mp3` (753,024 bytes). `audio.ts` sets `HTMLAudioElement.preload` to `none`, so these files are not eagerly fetched at startup. Their unchanged formats follow the owner's explicit reuse decision.

## Production build comparison

Both builds used Vite 8.3.2 in production mode, writing to separate temporary output directories outside the worktree. The baseline reflects the existing modified worktree before the cinematic split; no source was reverted or cleaned.

| Initially loaded bundle | Before | After | Change |
| --- | ---: | ---: | ---: |
| Entry JavaScript, raw | 1,264,794 B | 1,257,585 B | −7,209 B |
| Entry JavaScript, gzip | 342,411 B | 339,857 B | −2,554 B |
| Entry CSS, raw | 139,681 B | 130,314 B | −9,367 B |
| Entry CSS, gzip | 26,548 B | 24,516 B | −2,032 B |
| Combined entry, gzip | 368,959 B | 364,373 B | −4,586 B |

After the split, the deferred cinematic JavaScript is 7,642 B raw (2,673 B gzip), and its deferred CSS is 9,368 B raw (2,482 B gzip). The complete emitted build grew by 434 B because of chunk-loading metadata; the combined initially loaded entry fell by 16,576 B raw and 4,586 B gzip. The production HTML references the startup preload and does not include the cinematic chunk.

The initial JavaScript entry remains 1,257,585 B raw, above Vite's default 500 kB chunk warning threshold. This is the main remaining large emitted module; it was recorded rather than addressed with broad changes to shared game and localization code. The large MP3s also remain as described above and are not startup preloads.

## Evidence status

The production build succeeded and emitted the separate ending JS/CSS chunks. No images, fonts, or audio were converted. No tests were run during the implementation pass; the full regression run is recorded in the Phase 6 checklist after completion.
