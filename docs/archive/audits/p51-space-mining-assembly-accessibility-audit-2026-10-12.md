# P-51 Space Mining Rocket assembly accessibility audit

**Date:** 12 October 2026  
**Scope:** Rocket assembly controls shown together on the Launch Pad child page.

## Source and target routes

Cosmic Forge declares Launch Pad and four separate Rocket child options in `cosmicForge/cosmicForge/index.html:606-650`. Its Launch Pad renderer creates a distinct build row for each Rocket, using that Rocket's localized name as the row label and the localized Build Rocket Part action (`cosmicForge/cosmicForge/drawTab6Content.js:717-831`).

MIAPLACIDUS keeps the Launch Pad and completed Rocket pages as distinct destinations (`IncrementalGame/src/app/presentationNavigation.ts:467-500`). Before a Rocket is complete, its assembly card is shown on Launch Pad; after completion, the card is shown on that Rocket's child page (`IncrementalGame/src/app/SpaceMiningPane.tsx:1165-1170`).

## Finding and correction

The assembly cards had no Rocket heading. On Launch Pad, multiple cards therefore presented the same unlabeled phase, Rocket name field, Rename action, and Build Rocket Part action. The part cost was visible beside its button but was not in the button's accessible description. This lost the source row's per-Rocket identity for keyboard and assistive-technology users.

`RocketAssemblyCard` now displays a localized Rocket heading (including the current custom name), names the article from that heading, and combines the heading with the Rocket name field, Rename, and Build Rocket Part labels. The part-cost line and any disabled reason are associated with Build Rocket Part. Its Buy Fuel Pump control also references the existing localized pump cost and any disabled reason; Cosmic Forge presents the fuel-buyer price beside the corresponding row action (`drawTab6Content.js:1260-1304`). The heading styling handles long custom names. These changes are presentation-only; Rocket commands, prices, progression, and child-page ownership are unchanged.

The Launch Pad's own construction action had a separate context gap: Cosmic Forge places its currency and resource costs in the source purchase row (`cosmicForge/cosmicForge/drawTab6Content.js:621-707`), while MIAPLACIDUS showed a labeled cost list without associating it with Build Launch Pad. The target cost list now has a stable ID referenced by that button along with any disabled reason. The source-style cost values and build behavior are unchanged.

## Limits

This was a static source-to-renderer review. No tests, builds, typechecks, formatters, browser, or screen-reader checks were run. Other Space Mining accessibility and responsive-review work remains open.

A separate read-only review confirmed each Rocket heading, input label, Rename label, part-cost description, and conditional disabled-reason ID resolves to the corresponding control. It found no issue with the per-Rocket associations.
