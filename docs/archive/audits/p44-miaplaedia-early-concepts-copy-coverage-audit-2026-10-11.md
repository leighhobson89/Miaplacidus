# Miaplaedia Early Concepts copy coverage

Added the focused `@p44-early-concepts-copy` browser case in `tests/e2e/miaplaedia/miaplaedia.spec.ts`. For each of the six locales, it opens Miaplaedia > Concepts - Early and compares the page title, source `headerDescConceptsEarly`, and all eleven rendered article headings and bodies against Cosmic Forge's `localization.json` keys `headerMainConceptsEarly`, `helpConceptsEarlySubHeading1-11`, and `helpConceptsEarlySubBody1-11`.

The source option remains `option5`; `presentationNavigation.ts` maps it to `miaplaedia-concepts-early`, and `MiaplaediaPane` renders the selected source-backed document. No content, routing, or ownership changed. The new case was not run.
