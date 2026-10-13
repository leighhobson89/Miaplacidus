# P-44 Space Mining Telescope study-action copy audit

**Date:** 13 October 2026

**Scope:** the Auto Telescope options for Asteroids and Stars, across all six locales.

Cosmic Forge renders the two option labels from `dropdownTelescopeStudyAsteroid` and `dropdownTelescopeStudyStars` in [`drawTab6Content.js:183-185`](../../../../cosmicForge/cosmicForge/drawTab6Content.js). Their localized source rows are [`localization.json:1819-1820`](../../../../cosmicForge/cosmicForge/localization.json#L1819), [`4442-4443`](../../../../cosmicForge/cosmicForge/localization.json#L4442), [`7065-7066`](../../../../cosmicForge/cosmicForge/localization.json#L7065), [`9688-9689`](../../../../cosmicForge/cosmicForge/localization.json#L9688), [`12311-12312`](../../../../cosmicForge/cosmicForge/localization.json#L12311), and [`14934-14935`](../../../../cosmicForge/cosmicForge/localization.json#L14934). MIAPLACIDUS renders the separate `autoAsteroids` and `autoStars` options in [`SpaceMiningPane.tsx:956-957`](../../../src/app/SpaceMiningPane.tsx), backed by [`spaceMessages.ts`](../../../src/i18n/spaceMessages.ts).

| Locale | Source Asteroids | Target Asteroids | Source Stars | Target Stars |
| --- | --- | --- | --- | --- |
| en | Study Asteroid | Study Asteroid | Study Stars | Study Stars |
| es | Estudiar Asteroide | Estudiar Asteroide | Estudiar Estrellas | Estudiar Estrellas |
| pt | Estudar Asteroide | Estudar Asteroide | Estudar Estrelas | Estudar Estrelas |
| de | Asteroid Untersuchen | Asteroid Untersuchen | Sterne Untersuchen | Sterne Untersuchen |
| it | Studia Asteroide | Studia Asteroide | Studia Stelle | Studia Stelle |
| fr | Étudier un Astéroïde | Étudier un Astéroïde | Étudier les Étoiles | Étudier les Étoiles |

The edits change only the option labels; telescope modes and automation behavior are unchanged.

Static source-catalogue and renderer comparison only. No tests, builds, typechecks, formatters, or browser checks were run; P-44 remains open for the broader catalogue and rendered-locale evidence.
