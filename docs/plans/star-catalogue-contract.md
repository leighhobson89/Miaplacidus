# Phase 4 active contract: star catalogue and type rules

**Status:** I-21 and I-22 complete. I-23 has its type catalogue, B-type resource autobuyer bonus, and F-type mining multiplier; O-type ownership effects remain linked to settlement and starship-arrival work. The I-24/I-25 map model and pane are implemented, with home milestone persistence pending settlement progression. I-26's Star Data view depends on the per-system records in I-27. Work remains tracked in the [Phase 4 package](build-checklist/04-space-interstellar.md).

## Source behavior

The original `ui.js:generateStarfield` creates 100 stars on a nominal 1200Ãƒâ€”450 map. It assigns each star a stable name from `descriptions.js:starNames`, then calculates size and x/y/z from the fixed star-field seed and slot number using `Math.sin(seed) * STAR_SEED` (`STAR_SEED = 53`, `STAR_FIELD_SEED = 80`). The 2D projection scales to the current container, but distance uses the unscaled position, star dimensions, and z-depth, then rounds to two decimal light-years.

## Remake ownership

`src/content/starCatalogue.ts` exports a pure catalogue generator, fixed name/type source table, nominal map dimensions, stable ID per `(galaxySeed, slot)`, and the source-compatible 3D distance function. It marks Spica as the starting system and initially settled, and Miaplacidus as the home system gated by its fourth milestone. All seven source types remain on each generated entry; unknown names use the source's A-type fallback. Rendering can project nominal x/y coordinates to a responsive map without affecting distance or persistent identities. The game simulation's random stream is not consumed to draw or inspect the catalogue.

`src/content/starTypeRules.ts` owns the B-type autobuyer values (2/8/25/80 resource units per second, per buyer), F-type 1.5Ãƒâ€” asteroid extraction, and O-type 8Ãƒâ€” power-plant settlement rule. B effects are added only to resource buyer rates while the active system is B; F effects use the asteroid's stored system so rate display and actual extraction share the same modifier. The O-type multiplier helper requires a settled O-type assignment and an enabled mechanic. Runtime O-type assignment, hostile-system generation, and durable mechanic settings will connect with their owning settlement/diplomacy work.

`src/engine/starMap.ts` derives study-range visibility, selection gates and the two-character catalogue search from stable catalogue entries. `src/app/StarMapPane.tsx` renders the fixed 1200x450 map through a responsive SVG viewBox; zoom and pan alter projection only, while distances continue to use nominal 3D coordinates. The Interstellar tab shares the `stellarCartography` research gate with the map pane. The home-star level is an input to the pure model, but is not yet saved in `GameState`.

The catalogue is static content. Mutable star-system attributes such as the starting system, home-system gate, weather, ownership, and generated diplomacy state will be attached in subsequent star-map sections rather than folded into the coordinate generator.

## Acceptance evidence

- Default seed produces 100 uniquely named stars and stable `system:80:<slot>` IDs.
- The first seed-80 names and coordinates match the original generator.
- Spica and Miaplacidus are resolved by stable source names and carry their source system roles and access metadata.
- Default seed's type distribution matches the source table; B-type resource output and F-type mining are checked in their production paths.
- Distances are symmetric, three-dimensional, rounded to two decimal places, and independent of responsive projection.
- Star-map model coverage checks current/studied/uncharted visibility, two-character search, study selection and the fourth-milestone home gate.
- The local test build was visually inspected at desktop width; the full browser suite verified search, gates, selection, zoom, viewport response and distance stability.
- `tests/unit/star-catalogue.spec.ts` and `tests/unit/star-type-rules.spec.ts` pass.
