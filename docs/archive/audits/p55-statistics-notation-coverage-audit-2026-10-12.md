# P-55 Statistics source notation coverage audit

**Date:** 12 October 2026  
**Scope:** Compare Cosmic Forge's per-key Statistics notation classes with MIAPLACIDUS's selected notation formatter.

Cosmic Forge adds its `.notation` class only for keys in `notationHeaders` (`../../../cosmicForge/cosmicForge/ui.js:5123-5150`). MIAPLACIDUS routes the following Statistics rows through its selected notation formatter in `src/app/SettingsStatisticsPane.tsx` even though the source displays those numeric values raw:

| Group | Source-raw rows formatted by selected remake notation |
|---|---|
| Overview | Time Played, Current AP, AP Gain, Run, Unique News Tickers Seen, News Ticker Prizes Collected, Total Asteroids Discovered, Legendary Asteroids Discovered, Rockets Launched, Star Ships Launched |
| Run | Run Time, AP Anticipated |
| Energy | Total Energy, Total Production, Total Consumption, Total Battery Storage, Times Tripped, Basic Power Plants, Advanced Power Plants, Solar Power Plants, Sodium Ion Batteries, Battery 2, Battery 3 |
| Casino | Double or Nothing Played/Won, Wheel of Fortune Played/Won, Wheel Special Won, Higher or Lower Played/Won, Void Seer Played/Won |

Source exceptions include Overview Antimatter Mined; Run Cash and Antimatter; and Casino Points Spent. Those keys are included in `notationHeaders`. The Energy keys are not.

The shared Statistics notation behavior is covered by the completed P-41 acceptance (`docs/plans/build-checklist/06-presentation.md:183`), which applies the remake's selected formatter across Statistics. Retain that documented remake behavior for the groups above. P-55's later raw-display corrections for AP From Star Voyage and the three named Interstellar rows are explicit row-specific source-format exceptions; they do not reverse P-41's broader policy. No code was changed for the groups in this audit.

This note resolves the formatter-policy ambiguity only. P-55's source-value, accepted-event, save/reload, and rebirth comparisons remain open. No tests or other checks were run.
