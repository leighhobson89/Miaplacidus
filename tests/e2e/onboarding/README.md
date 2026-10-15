# Onboarding E2E coverage

The focused onboarding case checks the progression tutorial's technology explanation and its two read gates. It seeds a clean local run, advances to the technology-options step through the test command boundary, and uses the visible tutorial and Tech Tree controls to verify that each explanation must be read before continuing.

## Phase 7 onboarding localization route

Cosmic Forge localizes `onboardingModalHeader` and `onboardingModalText` in `descriptions.js` and shows them through the one-time Yes/No onboarding modal in `onboarding.js`. MIAPLACIDUS intentionally removed the one-screen first-run briefing and replay flow by owner decision (`docs/plans/open-decisions.md`, “Opening briefing”). These source modal keys therefore have no direct target key. Their optional-start purpose is adapted into the resumable progression tutorial: `tutorial.title`, `tutorial.offer`, `tutorial.start`, and `tutorial.noThanks` render in the `ProgressionTutorial` available state; the first localized step is `step.collectHydrogen.title` / `.body`. `App.tsx` mounts this tutorial in the game shell, and `ProgressionTutorial.tsx` routes the visible offer into the active guided sequence. The tutorial catalogue is populated for all six locales and is included in the localization validator.

`p7-tutorial-offer-locales.spec.ts` covers the actual new-game route for all six locales, confirms that the offer is a non-dialog tutorial aside, and starts the first locale-matched step. The new spec was authored for Phase 7 and has **NOT BEEN RUN**; test execution is deferred to Phase 8.

### Cosmic Forge step, result, and control routes

Cosmic Forge `onboarding.js#onboardingChecks` localizes the guided steps and
their completion result. MIAPLACIDUS keeps the active tutorial sequence in
`ProgressionTutorial.tsx`; its player-facing titles, bodies, and destination
controls use `tutorialMessages.ts` in all six locales. The P7 spec now walks
the complete active sequence through the test command boundary and checks each
rendered title, body, destination button, Continue/Finish action, and Skip
control in every locale. It also retains the actual first-run offer and first
step assertions. All direct target values were already populated, so no
tutorial message value or production behavior needed changing. Coverage is
**AUTHORED, NOT RUN**.

| Cosmic Forge source copy | Active MIAPLACIDUS route |
| --- | --- |
| `onboardingStepClickHydrogenOption` / `onboardingStepClickGainButton` / `onboardingStepKeepClickingGain` | `step.collectHydrogen.title/body`, with `openResources`. |
| `onboardingStepBuyHydrogenAutoBuyer` | `step.buyHydrogenAutobuyer.title/body`, with `openResources`. |
| `onboardingStepClickResearchTab` / `onboardingStepClickResearch` / `onboardingStepBuyThreeScienceKits` | `step.buildScienceKit.title/body`, with `openResearch`. |
| `onboardingStepTurnOffScienceKit` / `onboardingStepTogglesExplained` / `onboardingStepTurnOnScienceKit` | `step.pauseScienceKit`, `step.explainResearchRate`, and `step.resumeScienceKit`, with `openResearch`. |
| `onboardingStepReturnToResourcesTab` / `onboardingStepStorageFillsUp` / `onboardingStepClickIncreaseStorage` / `onboardingStepStorageDoubled` / `onboardingStepHelpAutoBuyerAlong` | `step.inspectHydrogenStorage`, `step.increaseHydrogenStorage`, `step.confirmHydrogenStorageUpgrade`, and `step.helpAutobuyerAlong`, with `openResources`. |
| `onboardingStepClickSellButton` / `onboardingStepCashShownHere` | `step.sellHydrogenAction` and `step.explainCashStat`, with `openResources`. |
| `onboardingStepReturnToResearchTab` / `onboardingStepClickTechnology` / `onboardingStepTechnologyExplained` | `step.explainTechnologyOptions`, with `openTechTree`. |
| `onboardingStepClickTechTree` / `onboardingStepTechTreeExplained` / `onboardingStepReturnToTechnology` / `onboardingStepResearchKnowledgeSharing` | `step.exploreTechTree` and `step.researchKnowledgeSharing`, with `openTechTree`. |
| `onboardingStepScienceClubHint` | `step.inspectScienceClub`, with `openResearch`. |
| `onboardingStepLookAtSettingsTab` / `onboardingStepChangeLookAndFeel` / `onboardingStepVisualMenuExplained` / `onboardingStepClickDropdown` / `onboardingStepSelectDark` | `step.visitVisualSettings`, `step.openThemeDropdown`, and `step.chooseDarkTheme`, with `openVisualSettings`. |
| `onboardingStepClickGameOptions` / `onboardingStepClickAmbienceToggle` / `onboardingStepAmbienceAndHelp` | `step.visitAudioSettings` and `step.readAudioSettings`, with `openAudioSettings`; the help-file handoff continues to `step.visitMiaplaediaGetStarted`. |
| `onboardingStepClickCosmicopedia` / `onboardingStepGetStartedExplained` / `onboardingStepStoryExplained` / `onboardingStepClickConceptsEarly` / `onboardingStepClickConceptsMid` / `onboardingStepClickConceptsLate` | `step.visitMiaplaediaGetStarted`, `step.visitMiaplaediaStory`, and the three `step.visitMiaplaediaConcepts*` routes with their matching open-page controls. |
| `onboardingStepFinished` / `onboardingCompleteHeader` / `onboardingCompleteText` | `step.completeGuidedTour.title/body`; source `buttonContinue` adapts to the final `finish` control. |
| `buttonYes` / `buttonNo` / `onboardingExitButton` | The persisted offer's `start` / `noThanks` controls and the active tutorial's `skip` control. |

The removed `onboardingModalHeader` and `onboardingModalText` remain without a
direct target copy route under the owner decision cited above; their optional
start intent is represented by the tutorial offer. `onboarding.js` also uses
the generic `buttonAddPerSecond` label as a spotlight text needle. The current
tutorial has page-opening controls rather than source-style rate-button
spotlights, so that needle is not assigned a tutorial-copy route here.

## P-36 saved regression recovery — 14 October 2026

The saved full-run failure was a strict-locator ambiguity: the explanatory sentence appeared both in the tutorial paragraph and in the screen-reader live announcement. The current spec uses an exact text match, which selects the visible tutorial paragraph. The focused Chrome rerun passed **1/1 in 7.8 seconds** on port 6550. No application or test change was needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_TEST_PORT='6550'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npm.cmd run test:e2e:focused -- --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output="$env:TEMP\miaplacidus-onboarding-p36-6550" tests/e2e/onboarding/progression-tutorial.spec.ts --grep '@p36'
```
