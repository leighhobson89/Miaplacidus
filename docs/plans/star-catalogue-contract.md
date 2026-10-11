# Phase 4 active contract: star catalogue and type rules

**Status:** I-21 and I-22 complete. I-23 has its type catalogue, B-type resource autobuyer bonus, and F-type mining multiplier; O-type ownership effects remain linked to settlement and starship-arrival work. The I-24/I-25 map model and pane are implemented, with home milestone persistence pending settlement progression. The owner-directed Star Map scan/presentation follow-up is recorded below; E2E verification of its travel threshold and route states remains pending. I-26's Star Data view depends on the per-system records in I-27. Work remains tracked in the [Phase 4 package](build-checklist/04-space-interstellar.md).

## Source behavior

The original `ui.js:generateStarfield` creates 100 stars on a nominal 1200Ãƒâ€”450 map. It assigns each star a stable name from `descriptions.js:starNames`, then calculates size and x/y/z from the fixed star-field seed and slot number using `Math.sin(seed) * STAR_SEED` (`STAR_SEED = 53`, `STAR_FIELD_SEED = 80`). The 2D projection scales to the current container, but distance uses the unscaled position, star dimensions, and z-depth, then rounds to two decimal light-years.

## Remake ownership

`src/content/starCatalogue.ts` exports a pure catalogue generator, fixed name/type source table, nominal map dimensions, stable ID per `(galaxySeed, slot)`, and the source-compatible 3D distance function. It marks Spica as the starting system and initially settled, and Miaplacidus as the home system gated by its fourth milestone. All seven source types remain on each generated entry; unknown names use the source's A-type fallback. Rendering can project nominal x/y coordinates to a responsive map without affecting distance or persistent identities. The game simulation's random stream is not consumed to draw or inspect the catalogue.

`src/content/starTypeRules.ts` owns the B-type autobuyer values (2/8/25/80 resource units per second, per buyer), F-type 1.5Ãƒâ€” asteroid extraction, and O-type 8Ãƒâ€” power-plant settlement rule. B effects are added only to resource buyer rates while the active system is B; F effects use the asteroid's stored system so rate display and actual extraction share the same modifier. The O-type multiplier helper requires a settled O-type assignment and an enabled mechanic. Runtime O-type assignment, hostile-system generation, and durable mechanic settings will connect with their owning settlement/diplomacy work.

`src/engine/starMap.ts` derives study-range visibility, selection gates and the two-character catalogue search from stable catalogue entries. `src/app/StarMapPane.tsx` renders the fixed 1200x450 map through a responsive SVG viewBox; zoom and pan alter projection only, while distances continue to use nominal 3D coordinates. The Interstellar tab shares the `stellarCartography` research gate with the map pane. The home-star level is an input to the pure model, but is not yet saved in `GameState`.

## Star Map scan and route presentation follow-up (8 October 2026)

### Source comparison

Cosmic Forge sets `STELLAR_SCANNER_RANGE` to `0.75` in [`constantsAndGlobalVars.js`](../../../cosmicForge/cosmicForge/constantsAndGlobalVars.js#L70). The Starship pane reveals Scan System only when `starShipArrowPosition > getStellarScannerRange()` or the ship is already orbiting ([`game.js`](../../../cosmicForge/cosmicForge/game.js#L8683-L8688)). Its arrow position is normalized elapsed travel time divided by the travel duration ([`game.js`](../../../cosmicForge/cosmicForge/game.js#L11367-L11384)), so the source in-flight gate is strictly greater than 75%.

### Owner-directed remake behavior

The requested remake threshold is `>= 70%`, an intentional difference from the source's `> 75%` threshold. `STARSHIP_SCAN_MIN_TRAVEL_PROGRESS` is `0.7`; `starshipTravelProgressFraction` derives progress from the saved timer's `elapsedMs / durationMs`, and `canScanStarshipDestination` permits scanning at or above the threshold or while orbiting ([`spaceRules.ts`](../../src/engine/spaceRules.ts#L23-L49)). The accepted scan creates a per-system encounter record ([`spaceMechanics.ts`](../../src/engine/spaceMechanics.ts#L1362-L1390)). If the player does not scan in flight, the destination remains scannable in orbit; once scanned, its encounter and results are stored and revealable in that arrival state.

The requested Star Map presentation is:

- Color the selected route line and its distance/antimatter cost label green-ready when the route is affordable and red-disabled when it is not.
- During travel, show a dashed route with a ship arrow that moves along it from the saved travel progress.
- On arrival, show an orbit ring and arrow around the destination.
- In Star Data, show each system's weather glyph with its weather chance.

The current map renderer supplies these states: the selected route group applies affordability text roles to its line and cost label; the in-flight marker is positioned by travel progress along a dashed line; arrival renders the orbit ring/arrow; and Star Data pairs its weather icon with a percentage ([`StarMapPane.tsx`](../../src/app/StarMapPane.tsx#L205-L237), [`StarMapPane.tsx`](../../src/app/StarMapPane.tsx#L494-L535), [`StarMapPane.tsx`](../../src/app/StarMapPane.tsx#L644-L706), [map route styles](../../src/styles.css#L3445-L3485)).

The existing E2E case scans an orbiting destination once and verifies that its encounter results are visible ([`starship.spec.ts`](../../tests/e2e/starship/starship.spec.ts#L506-L552)). Focused Chrome coverage now passes for the Star Data weather glyph/chance and selected-route readiness color/cost, plus in-flight/arrival visuals (6/8 in the initial combined Star Map/Starship batch; weather, route, travel arrow and arrival orbit checks were among the passes). After correcting the child-tab selection, the Interstellar child-visibility case passed 1/1. The deterministic space-rules unit suite passed 19/19, including a rejected scan at 69.99%, acceptance at exactly 70%, encounter creation, and incomplete-scanner rejection. The prelaunch-hidden scan check and existing orbiting-scan E2E each passed 1/1. A long simulated E2E advance to 69% was interrupted by the valid `starshipLostInSpace` event resetting the ship; this is not a passing browser threshold check, and production event behavior was not changed. See the [Star Map browser README](../../tests/e2e/star-map/README.md) and [Starship browser README](../../tests/e2e/starship/README.md) for exact outcomes.

The catalogue is static content. Mutable star-system attributes such as the starting system, home-system gate, weather, ownership, and generated diplomacy state will be attached in subsequent star-map sections rather than folded into the coordinate generator.

## Scan-results presentation ownership (8 October 2026)

The source constructs life-detection and destination report details in its Star Ship page (`cosmicForge/cosmicForge/drawTab5Content.js:857-1020`). The owner directs the remake to keep the scan action on **Starship** while presenting life detection and saved scan findings on the **Colonise** child page in a clear report layout. Colonise should become visible once the selected destination has a saved scan; diplomacy, settlement, and battle controls retain their individual encounter, orbit, fleet, and state gates. This is an intentional presentation ownership change; scan results remain attached to their destination encounter in game state. Full page ownership, module presentation, and source timer-bar inventory are in the [Interstellar presentation contract](presentation-navigation-contract.md#owner-directed-interstellar-presentation-follow-up-8-october-2026). Focused validation is pending; no new tests are claimed.

## Acceptance evidence

- Default seed produces 100 uniquely named stars and stable `system:80:<slot>` IDs.
- The first seed-80 names and coordinates match the original generator.
- Spica and Miaplacidus are resolved by stable source names and carry their source system roles and access metadata.
- Default seed's type distribution matches the source table; B-type resource output and F-type mining are checked in their production paths.
- Distances are symmetric, three-dimensional, rounded to two decimal places, and independent of responsive projection.
- Star-map model coverage checks current/studied/uncharted visibility, two-character search, study selection and the fourth-milestone home gate.
- The local test build was visually inspected at desktop width; the full browser suite verified search, gates, selection, zoom, viewport response and distance stability.
- `tests/unit/star-catalogue.spec.ts` and `tests/unit/star-type-rules.spec.ts` pass.
