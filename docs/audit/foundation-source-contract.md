# Foundation source contract (F-01–F-03, F-10)

This is the source-boundary record for the first foundation extraction. It describes the frozen Cosmic Forge snapshot, its current navigation and module ownership, and rule differences that must not be changed silently. The domain catalogues linked below carry the item-level F-02 and F-04–F-09 evidence.

## F-01 — reference snapshot

| Field | Recorded value |
|---|---|
| Read-only source repository | `../cosmicForge/cosmicForge/` |
| Commit | `93e32669c3b35e76cdd4cf82725c14e7215b2fbc` |
| Commit date | 17 September 2026 |
| Audit date | 2 October 2026 |
| Post-audit source commits or working-tree changes | None found; HEAD is the audit snapshot and the source worktree is clean |

The source's `.git` metadata was read to confirm the full commit. The audit did not modify Cosmic Forge. IncrementalGame is a separate, documentation-only project at this point and has no `.git` directory in this workspace.

## F-02 — navigation identity and nine-tab inventory

`index.html` defines the nine tabs (lines 66–74). `ui.js` routes stable `tabN.optionM` menu tokens (navigation handlers around lines 10515–11205; pane dispatch around lines 3535–3591). Those tokens, together with the explicit `data-option-pane` values, are the pane IDs; translated menu labels are display text and are not identity. Tab gates are represented by `data-tab` technology keys in `index.html` and evaluated in `ui.js`'s `updateTabVisibility()` (around lines 10260–10307). The global status strip at `index.html:31–62` shows cash, energy and power state, battery state, antimatter, two phase-dependent values, and Spica percentage.

| Tab | Menu panes | Tab gate | Pane-level action, visible value, and modal inventory |
|---|---|---|---|
| 1 Resources | Hydrogen, Helium, Carbon, Neon, Oxygen, Sodium, Silicon, Iron | None | Manual gain, sale/storage, automation and allocation; stock/cap and production rate. See [economy catalogue](foundation-economy.md). |
| 2 Energy | Energy Storage, Power Plant, Solar Power Plant, Advanced Power Plant | `basicPowerGeneration` | Buy batteries/plants and toggle power; energy, plant output/count, fuel and outage state. See [economy catalogue](foundation-economy.md). |
| 3 Research | Research, Technology, Tech Tree, Philosophy | None | Buy research generation, purchase/inspect technologies, choose a philosophy; research quantity/rate, costs, prerequisites and effects. See [economy catalogue](foundation-economy.md). |
| 4 Compounds | Diesel, Glass, Steel, Concrete, Water, Titanium | `compounds` | Craft/sell, storage and automation; stock/cap and production rate. See [economy catalogue](foundation-economy.md). |
| 5 Interstellar | Star Map, Star Data, Star Ship, Fleet Hangar, Colonise | `stellarCartography` | Select/study destinations, prepare and launch travel, build fleets, settle or fight; map, readiness, travel, population, diplomacy and battle state. See [space catalogue](foundation-space.md). |
| 6 Space Mining | Launch Pad, Rocket 1–4, Space Telescope, Asteroids, Mining | `atmosphericTelescopes` | Build/fuel/launch/return rockets, survey asteroids, study stars and mine; parts/fuel, progress/timers, class/location and yield. See [space catalogue](foundation-space.md). |
| 7 Galactic | Rebirth, Galactic Market, Ascendency Perks, Megastructures, Black Hole, Galactic Casino | `apAwardedThisRun` | Rebirth, trade, buy perks, advance structures, charge/warp and play games; AP/GP/CP, prices, levels, clues, charge and timers. Confirmation/outcome surfaces are detailed in [meta catalogue](foundation-meta.md). |
| 8 Cosmic Rip | Situation, Near Space Scanner Array, Cosmic Rip | `cosmicRip`; also controlled by the build flag | Restore/deploy/scan/research/close; telemetry, sectors, objectives and progress. See [meta catalogue](foundation-meta.md). This gameplay system remains in scope. |
| 9 Settings | Visual, Saving / Loading, Game Options, Get Started, Concepts - Early, Concepts - Mid, Concepts - Late, Statistics, Contact, Achievements, Philosophies, Story, Concepts - End Goal, Events, Exit Game | None | Change appearance/options, manage saves, run help/story and inspect records. Pane IDs, readouts, and confirm/reset surfaces are listed below. Old cloud controls are source-observed but excluded by the owner decision. |

Tabs 1–8 use the exact pane-level IDs, actions, readouts, preconditions and modal/feedback references in their linked catalogues. The current UI mixes `tabN.optionM` classes with explicit `data-option-pane` strings; tab 7's Black Hole pane uses `black hole`, and tab 8 uses `situation`, `near space scanner array`, and `cosmic rip`.

### Tab 9 pane details

| Pane ID / current label | Main action or view | Visible state | Gate / modal or feedback |
|---|---|---|---|
| `9.1` Visual | Change theme, notation and currency display | Selected appearance and number mode | Accessible without a progression gate; preference controls |
| `9.2` Saving / Loading | Save, export/import, old cloud actions and hard reset | Save status and portable save text/file controls | Import/error feedback and hard-reset confirmation; cloud behavior excluded in MIAPLACIDUS |
| `9.3` Game Options | Change language, audio, notification, pointer/fullscreen and autosave options | Current preference values | Preferences generally apply directly; browser permission may constrain fullscreen/clipboard |
| `9.4` Get Started | View or restart onboarding | Tutorial status and instructions | First-run/step conditions govern tutorial progress |
| `9.5` Concepts - Early | Read early-game help | Localized explanatory content | No gameplay gate |
| `9.6` Concepts - Mid | Read mid-game help | Localized explanatory content | No gameplay gate |
| `9.7` Concepts - Late | Read late-game help | Localized explanatory content | No gameplay gate |
| `9.8` Statistics | Inspect run/lifetime statistics | Resource, research, energy, casino, Cosmic Rip and event values | No gameplay gate; view refreshes from tracked state |
| `9.9` Contact | Open contact/community links | Link targets | External navigation affordance |
| `9.10` Achievements | Inspect unlocked/locked achievements | Achievement status, rewards and progress | Individual reward/precondition rules are in the meta catalogue |
| `9.11` Philosophies | Read philosophy details | Four paths and their effects | Unlock/selection gates are covered in economy/meta catalogues |
| `9.12` Story | Read game story | Localized narrative | No gameplay gate |
| `9.13` Concepts - End Goal | Read end-goal help | Cosmic Rip/endgame guidance | Content view; game progression gates are covered in meta catalogue |
| `9.14` Events | Inspect current and completed events | Active effects/timers and event history | Event eligibility and completion behavior are covered in meta catalogue |
| `9.15` Exit Game | Close the game shell | Exit action | Exit confirmation is only offered by the old Electron shell; the browser path returns without an exit modal |

Pane labels and identities are observed in `index.html:829–917`; rendering and actions are in `drawTab9Content.js`. The complete source route includes dynamic text and common notifications, not only static HTML.

## F-03 — current root-module ownership and extraction destination

The new application has no runtime modules yet. The following maps every root JavaScript module from the reference inventory to its intended MIAPLACIDUS boundary. “Extract” means rebuild the behavior/data in the named layer; it does not mean copy the old implementation.

| Cosmic Forge module(s) | Observed responsibility | MIAPLACIDUS owner / treatment |
|---|---|---|
| `game.js` | Frame loop, economy, actions, unlocks, travel, battle and rebirth | Split into deterministic **engine** commands, ticks and domain rules; remove UI/data cycles |
| `precision.js` | Shared affordability, rounding and spend policy | Pure **engine** calculations with source examples and focused tests |
| `timerManagerDelta.js`, `timerManager.js` | Simulation-delta and wall-clock timers | Typed **engine** clock/timer model with explicit scopes and durable IDs |
| `constantsAndGlobalVars.js` | Constants, mutable progression/preferences/statistics, capture/restore | Split immutable constants to **catalogue/config**, mutable fields to typed state, persistence through **adapter** |
| `resourceDataObject.js` | Resource and many subsystem definitions plus mutable stores | Split immutable **catalogue** definitions from run/permanent/settings/statistics state |
| `events.js`, `casino.js`, `cosmicRip.js`, `achievements.js` | Domain effects and progression rules | Extract pure/state-transition rules to **engine** and definitions to **catalogue** |
| `ui.js` | Boot, navigation, handlers, notifications, dialogs, locale redraw and debug tools | **UI**/application shell calling typed commands; dev/test controls behind nonproduction boundary |
| `drawTab1Content.js`–`drawTab9Content.js` | Pane construction and controls for nine tabs | Rebuild as semantic **UI** panes using stable pane IDs and selectors |
| `index.html`, `styles.css` | Static tab shell, sidebar panes, dialogs, themes and layout | Rebuild the accessible responsive **UI shell/styles**; bundle locally and remake visual assets |
| `descriptions.js` | Dynamic descriptions, labels and assembled display text | Keyed **UI/i18n** copy and derived descriptions; keep numeric rules out |
| `localization.js`, `localization.json` | Locale selection, key lookup and six translation catalogues | Typed **i18n** keys/catalogues, parity checks and localized view text |
| `onboarding.js` | First-run prompts and progression | Split state transitions into **engine**; render prompts in **UI**; localize copy |
| `saveLoadGame.js` | Local/cloud save, import/export, compression and autosave | Rebuild local/portable formats in **persistence adapter**; exclude cloud paths |
| `patches.js` | Historical original-save migrations and repair | Reference only for failure modes; new **persistence** schema migrates MIAPLACIDUS saves only |
| `audioManager.js` | Music, ambience and sound effects | Optional **audio adapter**; remake all binary assets |
| `analytics.js` | Analytics collection/queue | **Excluded** by owner decision |
| `main.js` | Electron `BrowserWindow` shell | **Excluded**; browser delivery only |
| `server.js` | Minimal old static server entry | Replace with local Vite **development/build tooling** |
| `buildFlags.js` | Demo, Cosmic Rip and debug flags | Use explicit full/demo/test **build configuration**; full is default; no hidden gameplay backdoor |
| `utilityFunctions.js` | Small formatting/general helpers | Selectively recreate as pure **engine/UI utilities** after use is proven |
| `playwright.config.js`, `tests/run-e2e.mjs` | Old browser test setup and functional-area runner | New **test harness**; preserve area-based approach, not old implementation |
| `validateLocalization.cjs`, `addLocKeys.py` | Localization validation/edit support | New typed **i18n build checks** and maintained source catalogue |
| `create_build.py`, `watch_and_run.py`, `graph.py` | Packaging, local workflow and dependency graph utilities | **Build/dev tooling** references only; use browser bundler, not Electron pipeline |

Supporting source paths: `game.js`, `ui.js`, `constantsAndGlobalVars.js`, `resourceDataObject.js`, the nine `drawTab*Content.js` files, `saveLoadGame.js`, `patches.js`, `localization.js`, `localization.json`, `audioManager.js`, `analytics.js`, and `playwright.config.js`. The complete root inventory and file-size snapshot remains in [source inventory](source-inventory.md).

## F-10 — behavior differences that require an explicit decision

| Classification | Observed evidence | Handling before a remake change |
|---|---|---|
| Legacy sale quirk | The single-sale route sells an integer amount and clears any fractional remainder without paying for that remainder; Sell All sells and pays for the float. The current `rounding` test documentation explicitly records the difference. | Preserve in the parity baseline. If changing, write the numeric example, player impact and acceptance test in the active feature plan before implementation. |
| Shared numerical contract | `precision.js` aligns affordability, settlement and display using one tolerance; holdings round down and costs round up. | Do not simplify or alter the policy as a cosmetic change. A numeric-policy change needs boundary examples and focused tests. |
| Known fixed defects | `bugs.txt`'s 30 August 2026 resolution and `tests/e2e/energy/power-trip-regressions.spec.js` identify a corrected plant toggle label/state mismatch and a zero-quantity plant restored as active. | Carry current fixed behavior forward; do not copy the historical defect description as intended behavior. |
| Stale GDD statement | `docs/GDD.md` describes Tab 8 as Menu/Settings, while current `index.html:66–74` and `drawTab8Content.js` show Cosmic Rip at Tab 8 and Settings at Tab 9. | Current source and functional-area evidence define the baseline. Keep Cosmic Rip; do not reshape the new tab structure to match the stale GDD. |
| Test/report debt | Historical generated coverage labels 50 areas green, but the audit did not rerun the suite; some old issue notes concern flaky performance checks or corrected test assertions. | Treat these as historical evidence, not new-game verification or gameplay rules. Run remake-focused checks when the corresponding implementation exists. |
| Owner-approved product deltas | Cloud save, Electron, analytics and Cosmic Forge save import are excluded; Cosmic Rip telemetry remains an in-game resource. | These are deliberate scope decisions in [open decisions](../plans/open-decisions.md), not parity bugs. Keep gameplay telemetry while omitting analytics collection. |

No other gameplay rule is approved for redesign by this source audit. The domain catalogues distinguish source observations from proposals; any later rule change must be recorded with evidence before code changes.
