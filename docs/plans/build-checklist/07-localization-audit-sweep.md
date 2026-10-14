# Phase 7 — localization audit and sweep

**Status:** active for correction and audit work (13 October 2026). The owner directed that localization remain held while non-localization Phase 6 implementation proceeded. The current non-localization work has passed its owner-reviewed evidence gates; M-06 remains open for P-31 asset optimization, while this package owns the transferred localization coverage. L-04 is closed on mapped-catalogue value-presence evidence; L-01 through L-03 and L-05 through L-09 remain open.

**Outcome:** every applicable player-facing message is mapped to its active MIAPLACIDUS catalogue and renderer, has a non-empty value in all six supported locales (`en`, `es`, `pt`, `de`, `it`, `fr`), and is available on its intended route. Locale-specific layout is reviewed separately as a presentation concern.

This phase resumes the held localization scope already tracked under **P-44**, **P-45**, and the locale-specific parts of **P-51** in the [Phase 6 checklist](06-presentation.md) and [Phase 6 estimates](phase-6-estimations.md). Existing completed source comparisons, locale checks, and dated audits remain valid evidence; do not repeat them without a concrete reason. Keep the P-ticket estimates and percentages unchanged unless the owner revises them. L-07 also covers the translated-text and locale-fit cases held out of P-56 and E-57; Phase 6 P-56 remains limited to non-locale theme/viewport presentation.

**Phase 6 owner-review transfer (13 October 2026):** the owner passed all estimate entries marked `MANUAL REVIEW REQUIRED`. P-44 and P-45 are closed as Phase 6 tickets because their remaining localization work is assigned here; their L-01 through L-03 and L-05 through L-06 scope remains active; L-04 closed on 14 October. P-51 locale-fit and E-57 economy review, plus P-56 translated-label and locale-fit captures, remain under L-07. This transfer does not close any Phase 7 checklist item or establish translation-quality acceptance. P-55 source/remake value review passed; its deferred selector/render assertions remain in Phase 9.

## Source and catalogue coverage

- [ ] **L-01** Inventory remaining player-facing Cosmic Forge source keys, including visible labels, help, notices, dialogs, dynamic results, errors, and accessibility names. Record a mapped, intentionally adapted/replaced, or excluded disposition for every applicable source key.
- [ ] **L-02** For each mapped or adapted message, record its source key, target catalogue/key, the six locale entries, and active page/control owner in the crosswalk. Preserve separate source outcomes and distinct destination ownership.
- [ ] **L-03** Review typed catalogue entries and runtime locale selection across all six locales. Add a value where a required locale entry is missing or empty, and correct routing that prevents a populated selected-locale value from appearing. Translation wording and placeholder/style quality are not coverage gates.
- [x] **L-04** Confirm that every applicable mapped key has a non-empty string in `en`, `es`, `pt`, `de`, `it`, and `fr`. Record missing or empty locale entries as open coverage; do not require grammar, fluency, exact source phrasing, or linguistic sign-off.

## Player-facing route sweep

- [ ] **L-05** Complete the remaining visible-copy route coverage in each locale from startup through ordinary play, Settings/save/import, notifications and dialogs, gameplay action results, achievements/events/news, and both ending routes. Record the route and states covered for each locale and confirm required strings are populated there.
- [ ] **L-06** Exercise dynamic and state-dependent copy with representative values and outcomes, including zero/maximum values, named entities, unavailable actions, success/failure, expiry, save conflict, rebirth, and ending states where applicable. Confirm the selected locale's populated value is rendered; language quality is not assessed for closure.
- [ ] **L-07** Review locale-sensitive layout at 320, 390, 768, and 1280 CSS-pixel widths with enlarged text and the longest available locale strings across the nine themes. Include startup and Save & Loading/import screens, dialogs, tooltips, tables, and dynamic result cards. Fix only reproduced clipping, overflow, overlap, focus, or readability defects and record the affected locale/theme/viewport/state.

## Corrections and acceptance evidence

- [ ] **L-08** For each confirmed missing/empty locale value, locale-routing, or rendering correction, record the corrected key, locale values, and intended route. Use existing validation where available, inspect the affected result in all six locales, and recapture the relevant visual state where layout changed. Adding tests is not a closure requirement under current owner direction.
- [ ] **L-09** Update the source-to-target crosswalk and parity ledger with key coverage, corrections, intentional adaptations/exclusions, route/layout evidence, commands/results, and remaining owner decisions. Link dated audits from the relevant work packages.

## Exit gate

Phase 7 closes when all applicable source messages have a documented disposition; every required key has a non-empty value in all six locales and is available on its intended route; every planned route and dynamic outcome has recorded coverage; locale-sensitive layouts have no unresolved reproduced defects in the reviewed matrix; and the crosswalk, parity ledger, and evidence agree. Translation quality, exact source phrasing, placeholder style, and linguistic sign-off are not closure gates. Source files under `../cosmicForge/cosmicForge/` remain read-only.

## Active correction slices — 13 October 2026

- **Resources and Compounds bulk actions:** added separate source-owned Sell All and Increase All Storage controls and aggregate result routes. Their action labels and result values are populated in all six locales and available from their owning pane renderers; the Increase All Storage label and aggregate result map to the corresponding source keys. This records value presence and route ownership, not translation quality; interactive route/state coverage remains open under L-05/L-06. See the [P-44 bulk-sale audit](../../archive/audits/p44-economy-bulk-sale-action-audit-2026-10-13.md) and [bulk-storage audit](../../archive/audits/p44-economy-bulk-storage-action-audit-2026-10-13.md).
- **News Ticker and Meta Journal:** repaired the incomplete English “3 million dollars” value using the five complete source locales, matched the source's `Boo!` click ownership, and made lazy-loaded source-news copy locale-specific during loading in both surfaces. Static coverage review of `src/i18n/sourceNewsCopy.ts` found 200 headline entries, 8 wacky effects, 14 prizes, 14 one-offs, and 10 manuscript clues in each of the six locales, with populated `here` values. Array order/counts align across locales; this is a coverage spot-check, not a translation-quality sign-off, and the route/layout matrix remains open. See the [source-news copy audit](../../archive/audits/p44-news-ticker-copy-and-link-ownership-audit-2026-10-13.md).
- **Casino warp-prize notices:** changed Starship and Rocket special-prize result copy to retain the source's warp outcome and punctuation across six locales. Casino stays a distinct Galactic child. See the [Casino audit](../../archive/audits/p44-galactic-casino-warp-prize-notice-copy-audit-2026-10-13.md).
- **Technology researched notice:** fixed the Spanish and French fallback encoding/punctuation. See the [technology notice audit](../../archive/audits/p44-technology-researched-notice-locale-encoding-audit-2026-10-13.md).
- **Settings and save copy:** corrected the Portuguese Settings title and Italian fullscreen-toggle wording; standardized Portuguese save copy and removed untranslated `slot` wording from capacity guidance. Static coverage review of `src/i18n/saveMessages.ts` confirms a typed `Record<LocaleId, Record<SaveMessageKey, string>>` with no empty values across `en`, `es`, `pt`, `de`, `it`, and `fr`. This verifies catalogue presence only; route/state coverage in L-03 through L-06 remains open. See the [Settings/save audit](../../archive/audits/p44-settings-and-p45-save-copy-locale-audit-2026-10-13.md).
- **Casino, Market, Settings, and technology notice value-presence spot-check:** a static scan of `src/i18n/casinoMessages.ts`, `src/i18n/marketMessages.ts`, `src/i18n/settingsMessages.ts`, and `src/i18n/technologyNotificationMessages.ts` found no empty-string entries. The main Casino, Market, and Settings copy maps are typed across `LocaleId`; sparse researched-technology notices resolve through populated per-locale fallback text, and their existing callers route to the relevant pane or global notice. This is limited catalogue/call-site evidence, not full key or runtime route/state coverage; L-03 through L-06 remain open. Translation quality was not assessed.
- **Galactic Market bias help:** replaced the German, Italian, and French English loanword in the outgoing/incoming bias titles with the corresponding localized source terminology. This is a terminology mapping correction; translation fluency is not assessed. See the [Market terminology audit](../../archive/audits/p44-galactic-market-bias-terminology-audit-2026-10-13.md).
- **Meta Journal lazy source copy:** the pane now ties loaded copy to the locale that requested it, preventing a previous locale's text from appearing during a locale switch. This is a route-selection correction, not a language-quality gate. See the [Meta Journal locale-switch audit](../../archive/audits/p45-meta-journal-lazy-copy-locale-switch-audit-2026-10-13.md).

- **Star Map unidentified-star value:** `StarMapPane.tsx:945` reads the `unidentifiedStar` label. The English-fallback scan found this key absent from `es`, `pt`, `de`, `it`, and `fr`; non-empty values were added for those locales. The registered catalogue scan found no locale-root/key/empty-value issues in its catalogue set. Six additional player-facing modules and Starship English-fallback paths were also checked and had populated locale values. This closes the confirmed value correction only; complete source-key disposition and route/state coverage remain open under L-01 through L-03 and L-05 through L-06. No tests, builds, or typechecks were run.

- **Galactic Casino Wheel special-ready value and route:** the six locale values are populated and the active result renderer presents the source action; no copy correction was needed. This focused check does not close the broader P-44 inventory or runtime review. See the [Casino audit](../../archive/audits/p44-galactic-casino-special-ready-locale-copy-audit-2026-10-13.md).
- **Random-event catalog coverage:** the bounded six-locale source/target value and selected-locale routing check is complete; runtime trigger, active-effect, expiry, and history outcomes remain open. See the [P-45 random-event locale audit](../../archive/audits/p45-random-event-locale-coverage-audit-2026-10-13.md). Translation quality is not assessed or required.

These are static copy/catalogue/call-site corrections only. No tests, builds, typechecks, formatting, or browser renders were run. Phase 7's localization coverage remains open under L-01 through L-03 and L-05 through L-09; L-04 closed on 14 October. Its P-44/P-45/P-51 scope is closed only as a Phase 6 transfer. Estimates were not changed.


### Additional active correction evidence — 13 October 2026

- **Galactic Casino Void Seer results:** the target now reveals both reducer result numbers with 4.2-second and 5.1-second reels and announces the final values once after the second reel. The two result labels have non-empty values in all six locales and remain on the dedicated Galactic Casino child page. Cosmic Forge applies its outcome after the reel promises resolve, while the remake engine applies the outcome and notice at dispatch; that timing difference and broader route/state coverage remain open. See the [Void Seer audit](../../archive/audits/p44-galactic-casino-void-seer-results-audit-2026-10-13.md).
- **Space Mining Rocket orbit status:** Ready To Travel and Select Destination now have non-empty values in all six locales and render according to whether a destination is selected. The travel action still uses its full disabled-state precondition. See the [Rocket status audit](../../archive/audits/p44-space-mining-rocket-orbit-status-audit-2026-10-13.md).

These are value-presence and source/renderer ownership checks, not translation-quality reviews. P-44's full key inventory, selected-locale route/state coverage, and rendered review remain open; no estimate subtask was removed.

The Void Seer First hand / Second hand strings are target-only accessible labels for numeric reels, not source text-key mappings. Rocket status maps source textReadyToTravelShort and textSelectDestinationShort to target readyToTravel and selectDestination; the six target values were checked against the source locale values. Neither review assessed translation fluency.


- **Galactic Market AP-sale selection:** the source and current Market renderer both start at the Select Quantity state, show a zero cash preview, and block sale until a valid quantity is selected. The target placeholder is populated in all six locales. See the [Market AP sale audit](../../archive/audits/p44-galactic-market-ap-sale-selection-audit-2026-10-13.md).
- **Interstellar Starship scan result:** a successful scan now routes a named three-second info notification through the selected-locale catalogue; all six values are non-empty. Starship remains separate from Star Data and Star Map. See the [Starship scan notice audit](../../archive/audits/p44-interstellar-starship-scan-result-notice-audit-2026-10-13.md).

These bounded source and value-presence checks did not assess translation quality, which is not a closure gate. P-44's full source-key inventory and route/state coverage remain open.

### Validation catalogue coverage - 14 October 2026

Registered previously uncovered raw message maps for Tutorial, Cosmic Rip ending cinematic, Cosmic Rip milestone and research result dialogs, Megastructure research results, and random-event end details in the six-locale validator. Static review found matching required locale keys and no empty player-facing values in these maps: Megastructure research contains 20 matching technology IDs and 27 benefit lines per locale; Tutorial contains 75 matching keys; the ending cinematic contains 10 matching fields; milestone results have matching IDs and fields; and research results have matching required paths. The optional German `researchedSuffix` is a grammar fragment appended after the technology name, not a standalone message, so the validator projection omits only that leaf while runtime copy remains unchanged. Advisory English-equality candidates remain informational under the owner-directed value-presence rule.

After registration, `npm.cmd run test:unit -- --reporter=dot` passed 637 tests across 73 files, including `tests/unit/localization-validation.spec.ts`, and `npm.cmd run typecheck` passed. The static map review and validator unit coverage do not establish full source-key disposition, runtime route coverage, or rendered locale coverage; L-01 through L-03 and L-05 through L-06 remain open, while L-04 is closed as documented above.

### Tutorial theme-selector value correction (14 October 2026)

Cosmic Forge's [onboarding.js](../../../../cosmicForge/cosmicForge/onboarding.js#L1089) calls source key onboardingStepClickDropdown for the selector action; its six values are in [localization.json](../../../../cosmicForge/cosmicForge/localization.json#L1675). The remake adds a separate openThemeDropdown step on Visual Settings: [ProgressionTutorial.tsx](../../../src/app/ProgressionTutorial.tsx#L158) resolves step.openThemeDropdown.title and .body through tutorialText(locale, key) from [tutorialMessages.ts](../../../src/i18n/tutorialMessages.ts#L167). The title adapts the source action prompt; the body is target-authored guidance. The five non-English target records previously repeated the English values and now contain locale-specific non-empty values. This is static catalogue and route evidence only; no rendered six-locale review was performed.

| Locale | Title | Body |
| --- | --- | --- |
| en | Open the theme selector | Open the theme selector. In the next step, choose Dark. |
| es | Abrir el selector de tema | Abre el selector de tema. En el siguiente paso, elige Oscuro. |
| pt | Abrir o seletor de tema | Abra o seletor de tema. Na próxima etapa, escolha Escuro. |
| de | Themenauswahl öffnen | Öffne die Themenauswahl. Wähle im nächsten Schritt Dunkel aus. |
| it | Apri il selettore del tema | Apri il selettore del tema. Nel passaggio successivo, scegli Scuro. |
| fr | Ouvrir le sélecteur de thème | Ouvrez le sélecteur de thème. À l’étape suivante, choisissez Sombre. |

This records one bounded value correction under L-08. It does not close L-08 or establish full tutorial route, state, or layout coverage; translation quality was not assessed.
