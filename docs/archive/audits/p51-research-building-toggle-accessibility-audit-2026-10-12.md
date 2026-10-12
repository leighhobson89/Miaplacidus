# P-51 Research building toggle context audit — 12 October 2026

## Cosmic Forge source UI

Cosmic Forge renders each Science Kit, Science Club, and Science Lab as its own Research row. The Science Kit row includes a named row label and its own `scienceKitToggle` (`cosmicForge/cosmicForge/drawTab3Content.js:127-156`); the Science Lab has the corresponding row and `scienceLabToggle` at lines 223-248. Each switch controls only that building's active state.

## MIAPLACIDUS target renderer

`ResearchPanel` in `src/app/EconomyPanes.tsx` renders one Pause/Resume button for each owned research building. Before this correction, each button exposed only the repeated Pause or Resume name and its pressed state, while the building heading, action description, and RP/energy rates were adjacent but unassociated.

Each toggle now uses its own localized building heading as a stable name through `aria-labelledby`, retains `aria-pressed` for active state, and references the action description and RP/energy rate through `aria-describedby`. The visible Pause/Resume text still states the next action. Purchasing, production, and activation behavior are unchanged.

This is a static source/UI comparison and accessibility correction. No tests, builds, typechecks, formatters, or browser review were run. Broader P-51/E-57 layout and assistive-technology review remains open.
