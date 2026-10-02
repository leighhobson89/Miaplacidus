# Phase 6 — presentation, localization and remade assets

**Outcome:** all nine Cosmic Forge play surfaces are clear and usable as MIAPLACIDUS on desktop and responsive mobile browsers. This work runs alongside the mechanics phases and expands [M-06](../master-checklist.md). Use the nine tab renderers, `ui.js`, `descriptions.js`, `localization.json`, theme styles, onboarding, audio and presentation test areas as the reference. All visual and audio assets must be newly made.

## Navigation and screen coverage

- [ ] **P-01** Inventory every pane, button, modal, side menu, tooltip, alert and locked state in the nine current tabs.
- [ ] **P-02** Define stable route/panel/action IDs independent of translated display strings.
- [ ] **P-03** Build nine semantic tab views: Resources, Energy, Research, Compounds, Interstellar, Space Mining, Galactic, Cosmic Rip and Settings.
- [ ] **P-04** Preserve unlock order, hidden/locked states, attention indicators and navigation history.
- [ ] **P-05** Make all mechanics actions reachable without relying on hover, tiny icon targets or a mouse.
- [ ] **P-06** Show costs, rate effects, requirements, result previews and disabled reasons from engine selectors.
- [ ] **P-07** Keep long-running tasks and timers visible, including progress, pause/block and completion feedback.
- [ ] **P-08** Define modal, notification and toast layering that does not hide a critical game decision.
- [ ] **P-09** Provide an easily discoverable save manager, export/import controls and unsaved-state indicator.
- [ ] **P-10** Browser-test a representative user path through all nine tabs and their locked/unlocked states.

## Responsive interaction and accessibility

- [ ] **P-11** Set desktop, tablet and narrow-phone layout targets based on real information density and test devices.
- [ ] **P-12** Build responsive navigation, stacked panels and scroll behavior with no horizontal page overflow.
- [ ] **P-13** Keep resource, timer, currency and action context visible when a pane becomes narrow.
- [ ] **P-14** Make map zoom/pan, fleet controls, allocation sliders and casino actions usable by touch and keyboard.
- [ ] **P-15** Use semantic controls, labels, headings and landmarks; preserve a logical focus order.
- [ ] **P-16** Restore focus after dialogs, tab changes and toast dismissal; make escape/cancel behavior clear.
- [ ] **P-17** Add visible focus, adequate contrast and non-color status cues in every theme.
- [ ] **P-18** Respect reduced-motion preferences in visual effects and progress animations.
- [ ] **P-19** Give new images meaningful alternatives where informative, and keep decorative art out of assistive output.
- [ ] **P-20** Test screen reader announcements for purchase failures, save conflicts, timer completion and navigation changes.
- [ ] **P-21** Test keyboard-only and touch-only completion of first run, save selection and representative late-game actions.
- [ ] **P-22** Check zoom, larger text, long translations and mobile soft keyboard behavior at the name and import screens.

## Visual system and assets

- [ ] **P-23** Define MIAPLACIDUS visual direction, typography, icon language and motion principles from a reviewable reference board.
- [ ] **P-24** Inventory every old image, animation, cinematic, icon and sound **as a coverage reference only**.
- [ ] **P-25** Create new logo/title treatment and startup/intro art using the MIAPLACIDUS name.
- [ ] **P-26** Create new resource, compound, technology, building, rocket, starship and fleet illustrations/icons.
- [ ] **P-27** Create new star-map, system, asteroid, weather, black-hole, megastructure and Cosmic Rip visuals.
- [ ] **P-28** Create new achievement badges, philosophy artwork, event imagery and ending/cinematic assets.
- [ ] **P-29** Create new sound effects, ambience and music cues matching the old functional coverage.
- [ ] **P-30** Track each new asset's source, author/license, variant sizes and usage in a manifest.
- [ ] **P-31** Optimize asset formats, preload critical UI assets and lazy-load heavy late-game art.
- [ ] **P-32** Verify the release bundle contains no old Cosmic Forge binary asset copied into MIAPLACIDUS.
- [ ] **P-33** Rebuild all nine named themes using design tokens; retain theme choice across reload and relevant saves.
- [ ] **P-34** Check every theme at narrow and wide widths with unlocked late-game content and error states.

## Onboarding, help and preferences

- [ ] **P-35** Rebuild the startup name, Confirm, intro and Start sequence with the new save contract.
- [ ] **P-36** Port onboarding steps, tutorial prompts, progress, skip/resume and first-run-only conditions.
- [ ] **P-37** Rebuild Cosmicopedia/help and story entries with current shipped feature explanations.
- [ ] **P-38** Show current objectives and next unlocks without revealing content earlier than source progression.
- [ ] **P-39** Rebuild statistics views for run, lifetime, production, space and meta counters.
- [ ] **P-40** Rebuild settings for language, theme, audio, notation, autosave and accessibility choices.
- [ ] **P-41** Port number notation modes consistently across holdings, costs, rates, timers and statistics.
- [ ] **P-42** Add audio mute/volume, autoplay-safe initiation and silent fallback when audio is unavailable.
- [ ] **P-43** Verify settings scope: global pre-boot preferences versus per-slot and per-run choices.

## Six-language localization

- [ ] **P-44** Extract the six current catalogues and map every source key to a typed MIAPLACIDUS message ID.
- [ ] **P-45** Keep `en`, `es`, `pt`, `de`, `it`, `fr` complete from startup through both ending routes.
- [ ] **P-46** Localize newly written save-slot, import, quota, conflict and mobile interaction copy in all six languages.
- [ ] **P-47** Localize dynamic resource/star/event names, plural forms, quantities, dates and timer descriptions without string parsing.
- [ ] **P-48** Validate key equality, required placeholders, rich-text safety and untranslated/fallback strings in CI.
- [ ] **P-49** Make locale switching live without changing stable IDs, save keys, prices or active task state.
- [ ] **P-50** Use locale-aware number/date formatting while preserving numeric rule precision and notation policy.
- [ ] **P-51** Review all menus, long labels, dialogs, tables, tooltips and phone layouts for expansion/clipping.
- [ ] **P-52** Create a concise six-language review sample covering startup, core loop, save failure, travel and ending text.
- [ ] **P-53** Record the project owner's quick OK on translation quality before final release.

## Presentation verification

- [ ] **P-54** Run focused `ui-navigation`, `onboarding`, `cosmicopedia`, `statistics`, `settings`, `notifications`, `notation`, `audio` and `localization` browser areas.
- [ ] **P-55** Compare source screen coverage and confirm all player-facing information and feedback remains available.
- [ ] **P-56** Capture a current screenshot matrix for major tabs, themes, locales and narrow/wide viewports; resolve layout failures.
- [ ] **P-57** Record deliberate UX changes and their reason without silently removing a Cosmic Forge mechanic or story beat.

**Exit gate:** every shipped mechanic is reachable and understandable on desktop and mobile browsers; all visual/audio assets are new; nine themes and six languages have current evidence; the owner has given a quick translation OK.
