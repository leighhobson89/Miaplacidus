# P-44 Space Mining renderer ownership audit — 12 October 2026

## Scope

Compared the rendered Space Mining child menu and each source page renderer in Cosmic Forge against MIAPLACIDUS's active navigation and page renderer. This static audit found no child-ownership or page-section collapse. P-44 remains open for rendered and broader catalogue review.

## Source menu and routing

The source `tab6ContainerGroup` menu in `../../../../cosmicForge/cosmicForge/index.html:565-659` renders these child rows in this order: Mining (`option8`), Space Telescope (`option6`), Asteroids (`option7`), Launch Pad (`option1`), and Rockets 1–4 (`option2`–`option5`). Some source rows start with the `invisible` class and become available at their progression gates. The option click handlers in `../../../../cosmicForge/cosmicForge/ui.js:10843-10928` select the corresponding source heading and call `updateContent`, which dispatches Space Mining to `drawTab6Content` (`ui.js:3561-3569`).

The target preserves the same rendered order and source IDs in `src/app/presentationNavigation.ts:454-513`: Mining is added when antimatter is unlocked; Telescope is present; Asteroids is added after asteroid discovery; Launch Pad is added after Rocket Composites; and each Rocket child is added only after its part requirement is complete. `src/app/App.tsx:2894-2915` provides the Space Mining child navigation and passes its selected child ID to `SpaceMiningPane`.

| Source child and renderer | Target destination and renderer |
| --- | --- |
| Mining, `option8`; `drawTab6Content.js:1121-1143` | `space-mining-mining`; `SpaceMiningPane.tsx:949-1083` selects the Mining content while keeping Asteroids hidden |
| Space Telescope, `option6`; `drawTab6Content.js:91-618` | `space-mining-telescope`; `SpaceMiningPane.tsx:720-947` |
| Asteroids, `option7`; `drawTab6Content.js:849-1119` | `space-mining-asteroids`; `SpaceMiningPane.tsx:949-1083` selects the Asteroids content while keeping Mining hidden |
| Launch Pad, `option1`; `drawTab6Content.js:619-835` | `space-mining-launch-pad`; `SpaceMiningPane.tsx:1084-1145` |
| Rocket 1–4, `option2`–`option5`; `drawTab6Content.js:839-845` dispatches to the matching `createRocketUI` | `space-mining-rocket-1`–`space-mining-rocket-4`; the active Rocket page shows its completed Rocket card, while incomplete Rocket part assembly stays on Launch Pad (`SpaceMiningPane.tsx:1127-1141`) |

The target page has one outer tabpanel for the selected child (`SpaceMiningPane.tsx:666-688`); the active child controls its heading and the visibility of its content. Mining and Asteroids share an enclosing JSX section, but their visible bodies are independently selected and hidden by `activePane`; neither source page's content is shown as part of the other page. Launch Pad retains the four source Rocket-part build rows, and the built Rocket pages remain separate children.

## Presentation differences recorded

Cosmic Forge can show a tab-level introduction before the first child visit and then remembers its last child. MIAPLACIDUS enters a child page instead: it selects Launch Pad when that page is available, otherwise the first visible child. The source and target therefore differ in initial selection, not in the ownership of the child content.

The target includes a launch-specific weather overview on Launch Pad (`SpaceMiningPane.tsx:694-718`), as recorded in the navigation contract. Precipitation rate and current-run collection remain in the top weather tooltip rather than being repeated in that overview. Mining also includes target status/rate/boost controls alongside the source antimatter illustration. These target additions do not merge the Mining, Asteroids, Launch Pad, or Rocket destinations.

## Result and review gap

No code change was indicated by this source/renderer ownership review. The review used source markup and handlers plus target navigation and renderer code; no rendered browser review was performed. P-44 remains open for that review and the remaining presentation requirements.
