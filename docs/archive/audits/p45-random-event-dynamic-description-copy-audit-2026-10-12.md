# P-45 Random-event dynamic description copy audit

**Date:** 12 October 2026  
**Scope:** Source-to-remake ownership of Events Journal effect descriptions and six-locale placeholder/copy alignment, excluding the separately recorded number-format and default-Rocket-name checks.

## Source and target paths

Cosmic Forge builds the Events panel in `../../../../cosmicForge/cosmicForge/drawTab9Content.js:985-1060`. `../../../../cosmicForge/cosmicForge/ui.js:775-845` reconstructs instant history descriptions from each event's saved `context`; `ui.js:850-918` renders active timed effects and completed history. Event-specific details are assembled in `../../../../cosmicForge/cosmicForge/events.js:209-269` for instant events and `events.js:856-890` for timed effects; active snapshots call that timed description builder at `events.js:1078-1096`.

MIAPLACIDUS renders active descriptions and completed descriptions separately in `src/app/MetaJournalPane.tsx:168-246`. The active rows call `randomEventActiveEffectDescription()` and history rows call `randomEventHistoryDescription()` from `src/app/randomEventDescription.ts:11-151`. Their localized templates live in `src/i18n/randomEventDescriptionMessages.ts`.

## Dynamic behavior reviewed

- Instant history covers destroyed buildings, Research stolen or gained amounts, named Rocket arrival, Antimatter Reaction with Rocket/Asteroid/loss details, stock loss with item and percentage, and lost Starship state. The target selects those descriptions from saved event-time details and localizes dynamic item names. The Rocket default-name path and amount notation are documented in their separate P-45 audits.
- Active timed details cover Market offline, Sunny weather, the affected Rocket for Miner Broke Down, the affected item and reduction for Supply Chain Disruption, and Black Hole instability. The target reconstructs the two dynamic active rows from validated current effect state; completed rows continue to use event-time history details.
- The six locale catalogs each contain 26 event-description keys. A static comparison against the six corresponding `localization.json` catalogs found the same placeholder names in every key. It found copy differences in `eventDescBuildingDestroyed` (Portuguese), `eventDescAntimatterReaction` (French), and both production-reduction templates (all six locales). The target catalog now matches the source copy for these entries; source and target strings and placeholder sets match across the 26 keys in all six locales.

The production-reduction templates deliberately retain the source's literal `-{percentDown}%` spelling. The target renderer supplies the same positive reduction magnitude as Cosmic Forge, so the catalog's minus sign yields the source's displayed signed percentage for both named and generic descriptions.

This is a static source-data and renderer comparison. No tests, builds, typechecks, formatting, or browser review were run. P-45 remains open for rendered-copy review.
