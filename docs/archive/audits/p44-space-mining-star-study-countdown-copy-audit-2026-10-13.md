# P-44 Space Mining star-study countdown copy audit

**Date:** 13 October 2026  
**Scope:** Localized progress text and remaining seconds for an active Stars survey.

## Source mapping

Cosmic Forge `game.js:11513–11514, 11586` floors remaining milliseconds to seconds and renders the `textStudyingProgress` template for the active star investigation. The six source values are at `localization.json:2292, 4915, 7538, 10161, 12784, 15407`.

## Remake mapping

`src/app/SpaceMiningPane.tsx:813–823` selects the star-specific progress key only when `space.activeSurvey === "stars"`, using `Math.floor(surveyRemainingMs / 1_000)`. The six `surveyStudyingProgress` values live in `src/i18n/spaceMessages.ts:43, 152, 257, 362, 465, 571`. Other surveys retain their own timer wording. Timer behavior, energy use, and page ownership are unchanged.

This is a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.