# P-44 Settings mouse-trail label copy audit — 12 October 2026

The Settings > Visual pointer-trail checkbox now uses Cosmic Forge's localized mouse-trail terminology and capitalization in all six locales. Source key `tab9MouseTrailRowLabel` is rendered before the toggle and includes a trailing colon; MIAPLACIDUS places the text inside the checkbox label, so the target omits that punctuation. The description, toggle behavior, six Settings destinations, and their order are unchanged.

| Locale | Cosmic Forge source wording | MIAPLACIDUS checkbox label |
|---|---|---|
| English | `Mouse Trail:` | `Mouse Trail` |
| Spanish | `Rastro del Ratón:` | `Rastro del Ratón` |
| Portuguese | `Rasto do Rato:` | `Rasto do Rato` |
| German | `Mausspur:` | `Mausspur` |
| Italian | `Scia del Mouse:` | `Scia del Mouse` |
| French | `Traînée de Souris:` | `Traînée de Souris` |

Source UI evidence: `../../../cosmicForge/cosmicForge/drawTab9Content.js:297-302`; source locale values are `localization.json` entries for `tab9MouseTrailRowLabel` at lines 1728, 4351, 6974, 9597, 12220, and 14843. Target evidence: `src/app/SettingsPane.tsx` and `src/i18n/settingsMessages.ts` (`pointerTrail`).

No tests, builds, typechecks, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
