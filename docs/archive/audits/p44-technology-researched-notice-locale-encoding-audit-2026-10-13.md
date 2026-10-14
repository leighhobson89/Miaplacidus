# P-44 Technology researched notice locale/encoding audit — 13 October 2026

**Scope:** compare the generic technology-researched fallback used by the app's research notification path with Cosmic Forge's localized notice.

Cosmic Forge uses localization key `notificationTechResearched` in `localization.json` (six locale blocks; English at line 2357, followed by Spanish, Portuguese, German, Italian, and French at lines 4980, 7603, 10226, 12849, and 15472). The research notification path invokes this fallback through [`technologyNotificationText`](../../../src/i18n/technologyNotificationMessages.ts#L629), called from [`App.tsx`](../../../src/app/App.tsx#L1691).

The Spanish fallback now has the opening inverted exclamation mark (`¡{technology} investigado!`); the French fallback now contains the correctly encoded `é` and source punctuation (`{technology} recherché!`). This fixes visible mojibake in those two fallback strings. The other four fallback strings were unchanged.

Static source/catalogue/call-site comparison only. No tests, builds, typechecks, formatting, or browser renders were run. L-03 and P-44 remain open for the broader catalogue and rendered-route review.
