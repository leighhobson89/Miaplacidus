# P-44 Space Mining asteroid-row copy audit

**Date:** 13 October 2026

**Scope:** the asteroid exhausted/reserved states and the visible rarity/quantity labels, across all six locales.

Cosmic Forge displays `textAsteroidExhausted` for an empty asteroid and `textAsteroidBeingMined` while a rocket has reserved it (`drawTab6Content.js:1005-1017`); its six-locale source values are in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1844). MIAPLACIDUS uses the same separate states in [`SpaceMiningPane.tsx`](../../../src/app/SpaceMiningPane.tsx#L1091), with localized values in [`spaceMessages.ts`](../../../src/i18n/spaceMessages.ts#L68).

| Locale | Source exhausted | Target exhausted | Source being mined | Target reserved label |
| --- | --- | --- | --- | --- |
| en | Exhausted! | Exhausted! | Being Mined! | Being Mined! ({rocket}) |
| es | ¡Agotado! | ¡Agotado! | ¡En explotación! | ¡En explotación! ({rocket}) |
| pt | Esgotado! | Esgotado! | Em exploração! | Em exploração! ({rocket}) |
| de | Erschöpft! | Erschöpft! | Wird abgebaut! | Wird abgebaut! ({rocket}) |
| it | Esaurito! | Esaurito! | In estrazione! | In estrazione! ({rocket}) |
| fr | Épuisé! | Épuisé! | En exploitation! | En exploitation! ({rocket}) |

Both source status distinctions and their punctuation now match. The remake keeps its existing `{rocket}` detail in parentheses after the source-equivalent reserved status so players can identify which rocket holds the asteroid. Reservation, depletion, and mining behavior are unchanged.

Static source-to-renderer review only. No tests, builds, typechecks, formatters, or browser checks were run; P-44 remains open for the broader catalogue and rendered-locale evidence.

**Uncommon rarity label follow-up (13 October 2026):** the asteroid rarity renderer uses the target `rarityUncommon` key through `RARITY_MESSAGES` in [`SpaceMiningPane.tsx:504-508,1088-1090`](../../../src/app/SpaceMiningPane.tsx). Cosmic Forge maps the `Uncommon` source value to `asteroidRarityUncommon` in [`drawTab6Content.js:28-32`](../../../../cosmicForge/cosmicForge/drawTab6Content.js), with its localized values in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1847).

| Locale | Cosmic Forge `asteroidRarityUncommon` | MIAPLACIDUS `rarityUncommon` |
| --- | --- | --- |
| en | Uncommon | Uncommon |
| es | Poco Común | Poco Común |
| pt | Pouco Comum | Pouco Comum |
| de | Ungewöhnlich | Ungewöhnlich |
| it | Non Comune | Non Comune |
| fr | Peu Commun | Peu Commun |

The correction is limited to source capitalization. No asteroid rarity or mining mechanics changed. This addition was verified by static source/catalogue comparison only; no tests or rendered locale checks were run.

**Antimatter quantity label follow-up (13 October 2026):** Cosmic Forge renders the asteroid quantity label from `textAsteroidAntimatter` in [`drawTab6Content.js:911`](../../../../cosmicForge/cosmicForge/drawTab6Content.js), with localized source values at [`localization.json:1842`](../../../../cosmicForge/cosmicForge/localization.json#L1842). The target asteroid row uses `antimatterRemaining` in [`SpaceMiningPane.tsx:1108`](../../../src/app/SpaceMiningPane.tsx); its six-locale values now match the source.

| Locale | Cosmic Forge `textAsteroidAntimatter` | MIAPLACIDUS `antimatterRemaining` |
| --- | --- | --- |
| en | Antimatter | Antimatter |
| es | Antimateria | Antimateria |
| pt | Antimatéria | Antimatéria |
| de | Antimaterie | Antimaterie |
| it | Antimateria | Antimateria |
| fr | Antimatière | Antimatière |

The target key is used only for this asteroid quantity label; the correction does not affect other copy or change mining behavior. Static comparison only; no tests or rendered locale checks were run.
