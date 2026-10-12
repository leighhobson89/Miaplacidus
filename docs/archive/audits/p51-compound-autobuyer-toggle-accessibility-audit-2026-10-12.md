# P-51 Compound autobuyer toggle accessibility audit (12 October 2026)

## Finding

In an unlocked Compound child pane, each owned autobuyer tier exposes a Pause or Resume button. The button's accessible name came only from that short visible action. With multiple tiers, keyboard or screen-reader users could encounter several indistinguishable `Pause` controls without being told which tier they control.

This is reproducible by static inspection when at least two autobuyer tiers are owned: `CompoundAutobuyerDetails` renders each toggle with the same `Pause`/`Resume` text at `src/app/EconomyPanes.tsx:1857-1871`; the per-tier summary and localized help already exist at lines 1802-1810 but were not associated with the toggle.

## Correction

The action now uses a localized Compound-and-tier name (`Autobuyer for {good}, tier {tier}` in English), retains `aria-pressed` for its active state, and references that tier's summary and localized help with `aria-describedby` (`src/app/EconomyPanes.tsx:1871-1889`). Assistive technology can identify the good and tier from the name, then hear its owned count and production rate plus the localized Compound autobuyer description. The visible Pause/Resume text states the next action. This applies to each Compound and tier through the shared renderer.

Cosmic Forge builds each autobuyer as a separate source row, with the row's upgrade name and its adjacent toggle (`../../../cosmicForge/cosmicForge/drawTab4Content.js:165-201`); MIAPLACIDUS keeps the rows distinct and now also provides an explicit accessible description association for the toggle.

No tests, build, typecheck, formatter, or browser review was run. This is a static accessibility correction; P-51's broader locale, viewport, theme, and rendered review remains open.
