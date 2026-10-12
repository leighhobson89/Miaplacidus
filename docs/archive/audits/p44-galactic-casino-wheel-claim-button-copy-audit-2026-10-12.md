# P-44 Galactic Casino wheel claim-button copy audit — 12 October 2026

Compared Cosmic Forge's wheel prize claim action with the MIAPLACIDUS wheel claim button. The source uses `buttonClaim`; the target now matches its uppercase form in all six locales.

| Locale | Claim button |
|---|---|
| English | `CLAIM` |
| Spanish | `RECLAMAR` |
| Portuguese | `RECLAMAR` |
| German | `EINLÖSEN` |
| Italian | `RISCUOTI` |
| French | `RÉCLAMER` |

This control remains on the distinct Galactic Casino child page and keeps its existing selected-prize and claim behavior. Source evidence: `../../../../cosmicForge/cosmicForge/drawTab7Content.js:552` and `buttonClaim` in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: the wheel claim button in `src/app/GalacticCasinoPane.tsx` and `claim` in `src/i18n/casinoMessages.ts`.

Static source/catalogue and renderer review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
