# Miaplaedia browser tests

`miaplaedia.spec.ts` checks that Settings keeps its six preference/save/statistics/achievement/event destinations and that the seven source guide documents appear under Miaplaedia in source order. It opens every option and checks the section heading, first article heading, correct Mia'Plac player naming, and removal of the old Cosmic Forge game/player names. It captures the full Early Concepts page as a visual checkpoint.

The same browser area sweeps all seven stable Miaplaedia document IDs in all six locales at 1280px and 390px. It checks each locale's section and first article heading against the matching source document, checks the old game/player names stay absent, verifies each document container fills its available game content width, and asserts that neither the article nor page overflows horizontally.

Run the focused area with:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_TEST_AREA='cosmicopedia'
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npm.cmd run test:e2e:focused -- --workers=1 tests/e2e/miaplaedia/miaplaedia.spec.ts
```

5 October 2026: the focused Chrome journey reported 1/1 passing. The runner
hung during browser shutdown and was interrupted after reporting the result.

5 October 2026: the six-locale Miaplaedia phone/desktop sweep passed 1/1 in
Chrome. All seven documents stayed mapped to their localized headings, with no
article or document-level horizontal overflow at either width.
