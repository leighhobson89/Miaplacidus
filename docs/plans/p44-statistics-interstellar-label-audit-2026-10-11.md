# P-44 Statistics label crosswalk: Interstellar

Audit date: 11 October 2026. Compared the source Statistics help and Interstellar labels in Cosmic Forge with the target catalogs and the row IDs rendered by `SettingsStatisticsPane.tsx`. No row values, scope, order, ownership, or calculations changed.

## Statistics help

| Cosmic Forge source key | Target catalog key | Rendered destination |
| --- | --- | --- |
| `headerDescStatistics` | `statisticsMessages.description` | `SettingsStatisticsPane.tsx` intro paragraph below the Statistics heading |

The source and target description strings match in all six locales.

## Interstellar row-label mapping

`SettingsStatisticsPane.tsx` builds `interstellarRows` in source order and delegates each label to `interstellarStatisticLabel(locale, id)`. The source key, target catalog ID, and rendered `data-statistic-id` are:

| Cosmic Forge source key | Target catalog key → rendered `data-statistic-id` |
| --- | --- |
| `statsInterstellarSubHeading1` | `labels.starStudyRange` → `starStudyRange` |
| `statsInterstellarSubHeading2` | `labels.starShipBuilt` → `starShipBuilt` |
| `statsInterstellarSubHeading3` | `labels.starshipDistanceTravelled` → `starshipDistanceTravelled` |
| `statsInterstellarSubHeading4` | `labels.systemScanned` → `systemScanned` |
| `statsInterstellarSubHeading5` | `labels.fleetAttackStrength` → `fleetAttackStrength` |
| `statsInterstellarSubHeading6` | `labels.envoy` → `envoy` |
| `statsInterstellarSubHeading7` | `labels.scout` → `scout` |
| `statsInterstellarSubHeading8` | `labels.marauder` → `marauder` |
| `statsInterstellarSubHeading9` | `labels.landStalker` → `landStalker` |
| `statsInterstellarSubHeading10` | `labels.navalStrafer` → `navalStrafer` |
| `statsInterstellarSubHeading11` | `labels.enemy` → `enemy` |
| `statsInterstellarSubHeading12` | `labels.enemyDefenceOvercome` → `enemyDefenceOvercome` |
| `statsInterstellarSubHeading13` | `labels.enemyDefenceRemaining` → `enemyDefenceRemaining` |
| `statsInterstellarSubHeading14` | `labels.apFromStarVoyage` → `apFromStarVoyage` |
| `statsInterstellarSubHeading15` | `labels.blackHoleDiscovered` → `blackHoleDiscovered` |
| `statsInterstellarSubHeading16` | `labels.blackHoleAlwaysActive` → `blackHoleAlwaysActive` |
| `statsInterstellarSubHeading17` | `labels.blackHoleStrength` → `blackHoleStrength` |

The target-only `systemsSettled` row remains after these 17 source rows.

## Corrections

A six-locale source comparison found label differences in the typed `interstellarStatisticsMessages.ts` catalog. The corrected catalog now follows the exact corresponding source strings for these locale/row pairs:

- Spanish: `navalStrafer`, `apFromStarVoyage`, and `blackHoleStrength`.
- Portuguese: `starStudyRange`, `systemScanned`, and `apFromStarVoyage`.
- German: `starStudyRange`, `starshipDistanceTravelled`, `fleetAttackStrength`, `navalStrafer`, `enemyDefenceOvercome`, `enemyDefenceRemaining`, and `apFromStarVoyage`.
- Italian: `starShipBuilt`, `starshipDistanceTravelled`, `fleetAttackStrength`, `navalStrafer`, and `apFromStarVoyage`.
- French: `starStudyRange`, `fleetAttackStrength`, `marauder`, `navalStrafer`, `enemyDefenceOvercome`, `enemyDefenceRemaining`, and `apFromStarVoyage`.

These corrections align the copy with `localization.json` keys `statsInterstellarSubHeading1` through `statsInterstellarSubHeading17`. Existing row IDs, values, owner links, and paired This Run/All Time display are unchanged. No tests, build, typecheck, or formatter were run, per the deferred end-of-phase regression plan.
