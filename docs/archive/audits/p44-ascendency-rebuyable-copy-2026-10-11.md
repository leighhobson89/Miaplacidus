# P-44 Ascendency perk repeatability copy — 11 October 2026

Cosmic Forge `drawTab7Content.js` renders the localized `labelRebuyable` and a
value on each Ascendency perk row: `textNo` for one-time perks, the numeric
`timesRebuyable` cap for repeatable perks, or `textYes` for the `100000`
unlimited-cap sentinel. These values come from the `ascendencyBuffs` catalogue
in `resourceDataObject.js`.

MIAPLACIDUS's `AscendencyPane.tsx` showed perk level and price but omitted this
source-visible repeatability status. The card now shows the six-locale source
label and value. Its value is derived from the existing `ASCENDENCY_PERKS`
purchase limits: one means No, finite limits above one display that limit, and
an absent cap displays Yes. This changes presentation copy only; purchase costs,
caps, and unlocks are unchanged. The pane remains the distinct Galactic child
for Ascendency and its order/gate were not changed.

No tests, build, typecheck, browser checks, or formatting were run, per the
current implementation-only instruction.
