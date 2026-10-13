# P-44 Space Mining studying-stars status-copy audit

**Date:** 13 October 2026  
**Scope:** Source-to-remake localized status text for active star study in the Space Mining Telescope view.

## Source mapping

Cosmic Forge `ui.js:8701` selects the `textStudyingStars` status label for an active star study. The six values in `localization.json:2510, 5133, 7756, 10379, 13002, 15625` are `Studying Stars`, `Estudiando estrellas`, `A estudar estrelas`, `Studiere Sterne`, `Studio delle stelle`, and `Étude des étoiles`.

## Remake mapping

MIAPLACIDUS selects `spaceText(locale, "surveyStudying")` for the active star-study state in `src/app/SpaceMiningPane.tsx:634–638`. The six catalogue values in `src/i18n/spaceMessages.ts:39, 147, 251, 355, 457, 562` now match the source.

This updates status copy only; telescope study timing, energy use, and Space Mining page ownership are unchanged. This was a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.
