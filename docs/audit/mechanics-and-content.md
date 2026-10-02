# Mechanics and content inventory

This is the parity map for the playable game, not a promise to copy its screen layout. The nine tabs below are verified in current [index.html](../../../cosmicForge/cosmicForge/index.html); the detailed loops are cross-checked with [GDD.md](../../../cosmicForge/cosmicForge/docs/GDD.md), the tab renderers, and the [test taxonomy](../../../cosmicForge/cosmicForge/tests/docs/functional-areas.json). The GDD's eight-tab outline is outdated.

The F-02/F-04–F-09 numerical source catalogues now live in [foundation source contract](foundation-source-contract.md), [economy](foundation-economy.md), [space/interstellar](foundation-space.md), and [meta/endgame](foundation-meta.md). These are static source extractions; none claim MIAPLACIDUS implementation parity.

| Current tab | Player-facing scope | Key code |
|---|---|---|
| 1 Resources | Eight material panes; manual gain, storage, sales, autobuyers, production allocation/autosell | `drawTab1Content.js`, `game.js`, `resourceDataObject.js` |
| 2 Energy | Energy storage and batteries; basic, solar, advanced plants; fuel, demand, outages | `drawTab2Content.js`, `game.js` |
| 3 Research | Research generation; technology purchase/tree; philosophy | `drawTab3Content.js`, `game.js` |
| 4 Compounds | Diesel, water, glass, concrete, steel, titanium; crafting and automation | `drawTab4Content.js`, `game.js` |
| 5 Interstellar | Star map/data, starship, fleet hangar, colonization, diplomacy, battle | `drawTab5Content.js`, `game.js` |
| 6 Space Mining | Mining, telescope, asteroids, launch pad, four rockets and antimatter | `drawTab6Content.js`, `game.js` |
| 7 Galactic | Rebirth, market, casino, ascendency perks, megastructures, black hole | `drawTab7Content.js`, `casino.js`, `game.js` |
| 8 Cosmic Rip | Situation, scanner array, sector scanning, telemetry, rip research/closure | `drawTab8Content.js`, `cosmicRip.js`, `game.js` |
| 9 Settings | Cosmicopedia/help/story, achievements, event history, statistics, preferences, save controls | `drawTab9Content.js`, `ui.js` |

## Core and mid-game loop

The initial loop is manual material gain under a storage cap, selling materials for cash, increasing storage, and buying resource autobuyers. The eight resource keys represented by tab 1 are hydrogen, helium, carbon, neon, oxygen, sodium, silicon, and iron. The six compound keys represented by tab 4 are diesel, water, glass, steel, concrete, and titanium. Costs combine cash with up to three material requirements. Upgrades scale in price and quantity. Production allocation now includes cash, compound, and retained-stock shares; its detailed rules live in [p9-production-allocation-guide.md](../../../cosmicForge/cosmicForge/docs/p9-production-allocation-guide.md). A parity implementation must test the actual allocation outcomes, not only the sliders.

Energy adds plant production, fuel consumption, storage, power failure/recovery and automation gates. Weather can change energy output, precipitation and rocket launch readiness. Research generation purchases technologies with prerequisites; the tech tree unlocks tabs, building tiers, space systems, philosophies and repeatable bonuses. Compound recipes and automated crafting consume the material economy. [resourceDataObject.js](../../../cosmicForge/cosmicForge/resourceDataObject.js) is the detailed content source; [buildUpgradeable.md](../../../cosmicForge/cosmicForge/docs/buildUpgradeable.md) explains the old cross-file implementation burden.

The [precision policy](../../../cosmicForge/cosmicForge/precision.js) deliberately aligns affordability, deductions and displays around floating-point tolerance. This is a behavior contract to retain. The old rounding test docs describe several non-obvious sale behaviors, including one-item sales and Sell All treating fractional remnants differently. Record and decide any deliberate rule change before the remake claims parity.

## Space and interstellar loop

A telescope surveys asteroids and studies stars; rockets are built, fueled, launched and returned to mine antimatter. The code has four rocket slots and timers for survey, star study, fuel, and travel. Antimatter is a major starship and endgame gate. The map contains seeded/generated stars and differing star types, weather, resource bonuses, hostile encounters and travel distances. Source constants include 100 stars and named start/home systems; static parity checks should compare the catalogue and generation constraints, while browser tests should verify representative journeys.

The starship is built from parts, launched at a point of no return, and travels to a chosen system. Arrival branches into settlement, diplomacy, vassalization or fleet battle. Fleet composition, defense, damage and star-type bonuses affect outcomes. Losing a battle is recoverable according to the GDD. Colonization and conquest feed the cross-run economy. The test areas for `star-map`, `star-types`, `starship`, `diplomacy`, `battle`, `fleet-hangar`, and `colonise` show the branch breadth to carry forward.

## Meta progression and endgame

Rebirth resets run-scoped progress while retaining permanent currencies/unlocks and starting a new star system. Ascendency Points (AP) come from travel and other actions; Galactic Points (GP) are a separate long-term currency, including Cosmic Rip spending. The Galactic Market trades across the economy. Ascendency perks and repeatable philosophy upgrades alter future runs. The four philosophy paths are Constructor, Supremacist, VoidBorn, and Expansionist, each with its own ability and long-term modifiers. The exact reset and carryover matrix should be extracted into a typed schema before implementation because [resourceDataObject.js](../../../cosmicForge/cosmicForge/resourceDataObject.js) and [constantsAndGlobalVars.js](../../../cosmicForge/cosmicForge/constantsAndGlobalVars.js) currently share this responsibility.

The casino has CP purchase and multiple risk/utility games. [GDD.md](../../../cosmicForge/cosmicForge/docs/GDD.md) details Double or Nothing, Wheel of Fortune, and Higher or Lower; current [casino.js](../../../cosmicForge/cosmicForge/casino.js) and test README also include Void Seer behavior. Timer-completion prizes must converge on normal telescope/travel completion paths so rewards and state stay consistent. The black hole has discovery, charge, research and time-warp upgrades; time warp must specify which timers advance.

Ancient manuscripts, news clues, megastructure stars/tech and a force field lead toward Miaplacidus and the Master AI. Cosmic Rip adds GP-gated scanner restoration, sectors, telemetry, upgrades, research, and closure. This is distinct from the older GDD's main ending. The remake must preserve the current shipped route and expose its objective clearly; do not use the GDD's tab 8 outline to omit the chapter.

## Cross-cutting features

- About 70 achievements are described by the [achievement suite](../../../cosmicForge/cosmicForge/tests/e2e/achievements/README.md); catalogue, rewards, image selection, and rebirth behavior all matter.
- Random instant/timed events, weather, news ticker, notifications and audio change either simulation, feedback, or both. These need deterministic triggers in test builds.
- Onboarding, Cosmicopedia, story, statistics, notation, settings and themes are part of parity, not optional polish. Nine named themes are referenced in the old UI audit; check each theme visually after porting.
- The original has demo/full switches, browser/Electron builds and analytics. MIAPLACIDUS targets desktop and responsive mobile browsers, with a full build by default and an optional flagged demo. Cloud saving, Electron, analytics and original-game save import are excluded by the [product decisions](../plans/open-decisions.md). [Multiple local slots](../plans/local-save-contract.md) and portable exchange are required. All visual/audio assets will be remade.
- Six-language localization has to cover content introduced or rewritten for all of these systems, including dynamic labels, events and save errors.

## Rules extraction backlog

The following needs a mechanical catalogue during implementation. It is too error-prone to transcribe numerical values from prose: every resource and compound, recipe, plant/battery, autobuyer tier, tech/prerequisite, star modifier and seeded star, philosophy ability/repeatable, AP/GP source and sink, achievement/reward, event weight/effect, casino outcome/prize, Cosmic Rip upgrade, timer, unlock gate, and rebirth carryover field. Record each item's source key, numeric formula, display key, save field, owner module and focused test. The source of truth at this stage is current code, not the GDD.
