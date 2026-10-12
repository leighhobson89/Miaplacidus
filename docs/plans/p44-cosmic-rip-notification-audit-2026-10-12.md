# P-44 Cosmic Rip notification audit — 12 October 2026

## Scope and evidence

Compared the Cosmic Forge Cosmic Rip action/result feedback with the MIAPLACIDUS notification catalog and dispatch routes. This is a static source review; no browser interaction or automated checks were run.

- Source actions and notices: `../../../cosmicForge/cosmicForge/drawTab8Content.js` (scanner restore and sector scan handlers), `../../../cosmicForge/cosmicForge/game.js` (technology research completion), and `../../../cosmicForge/cosmicForge/localization.json` (six locale catalogs).
- Remake routes: `src/app/CosmicRipPane.tsx`, `src/app/cosmicRipEventNotifications.ts`, and `src/app/App.tsx`.
- Remake copy: `src/i18n/cosmicRipMessages.ts`.

## Notice route comparison

| Action/result | Cosmic Forge | MIAPLACIDUS | Finding |
| --- | --- | --- | --- |
| Scanner restore failure | `warning`, 3000 ms, `cosmicRip` | `warning`, 3000 ms, `cosmicRip` | Severity, duration, route, and localized copy match. |
| Scanner restored | `info`, 3000 ms, `cosmicRip` | `info`, 3000 ms, `cosmicRip` | Severity, duration, route, and localized copy match. |
| Rip found by sector scan | `info`, 4000 ms, `cosmicRip`; substitutes the matching `MIAPLAC-74xx` sector name | `info`, 4000 ms, `cosmicRip`; substitutes the same nine sector names | Placeholder and route match. The Spanish remake wording uses “Desgarro Cósmico” where the source catalog has the apparent typo “Ras Cósmico.” |
| Empty sector scan | `info`, 3500 ms, `cosmicRip` | `info`, 3500 ms, `cosmicRip` | Severity, duration, placeholder, route, and localized copy match. |
| Technology research complete | `info`, 3000 ms, `cosmicRip`; `{tech} Researched!` localized per language | `info`, 3000 ms, `cosmicRip`; localized technology name is interpolated | Route and severity match. The remake’s six message templates used a different paraphrase and punctuation; they now follow the source wording and retain the target `{technology}` placeholder. |

## Technology completion copy correction

Aligned `technologyResearchedNotification` in all six remake locales with Cosmic Forge’s `notificationTechResearched` values:

| Locale | Cosmic Forge | MIAPLACIDUS after correction |
| --- | --- | --- |
| English | `{tech} Researched!` | `{technology} Researched!` |
| Spanish | `¡{tech} investigado!` | `¡{technology} investigado!` |
| Portuguese | `{tech} investigado!` | `{technology} investigado!` |
| German | `{tech} erforscht!` | `{technology} erforscht!` |
| Italian | `{tech} ricercato!` | `{technology} ricercato!` |
| French | `{tech} recherché!` | `{technology} recherché!` |

The target placeholder name differs because the remake’s event notice formatter interpolates `{technology}`. The replacement value is the same localized technology name used by the Cosmic Rip pane.

## Explanatory modal content disposition

Cosmic Forge also opens explanatory popups after scanner restoration, locating the Rip, and completing each of the five technologies. The remake keeps those state updates on their owning pages: scanner restoration appears in the persistent Situation and scanner sections; Rip discovery updates the Situation status and next objective; completed research updates its technology card, effect tooltip, and persistent stability percentage. This maps the source's information to persistent page content rather than reproducing the modal timing. Runtime visibility and locale layout remain unverified.

## Static-review limit

This comparison covers source toast triggers and the above page-content dispositions. No tests, builds, typechecks, or browser checks were run.
