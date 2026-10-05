# Player Learning Log

A quick reference of strategies learned through the visible MIAPLACIDUS UI. These are player observations, not owner answers; uncertain tips are marked tentative.

## 2026-10-04 — First playtest

### Early Hydrogen setup
- Collect 50 H₂ by hand, then buy the Hydrogen Compressor for 50 H₂. The first purchase showed +4 H₂/s; buying a second at 57 H₂ showed +8 H₂/s, although each compressor card says it adds 2/s. Confirm the intended rate before planning around it.
- Selling 5 H₂ returned $0.10 at the shown $0.02 per unit. Keep the first 50 H₂ for the compressor unless cash is the immediate blocker.
- First reaching 50 Hydrogen unlocked “Collect 50 Hydrogen” and awarded $10 this run. Achievements confirmed it; collecting another 50 did not award it again, so treat it as a one-time milestone.
- The storage cap is 150 H₂. At full storage, production displayed +0/s and the “Collect 1 Hydrogen” button was disabled; increasing storage costs 149 H₂ and raises the cap to 300. After switching away and back, the main page caught up to the 150/150 total.
- Two active compressors eventually filled storage to 150. Watch for the cap so compressor output does not go to waste.

### Save conflict recovery — confirmed this session
- If “This save changed in another tab. Reload or export this run before saving” appears after starting a new pioneer, do not reload or overwrite while preserving the run matters. Open Portable save code, enter an unused name in “New pioneer name,” and choose “Save run as a new pioneer.”
- Before recovery, Save Manager showed only the older `Pioneer` slot. Saving under `playTest-20261004-2` removed the warning; later the active heading showed that name and the slot list contained `playTest-20261004` plus `Pioneer`. Verify the active heading and that the requested `playTest-...` entry is listed.

### Research
- A Science Kit costs $5 and shows +0.5 RP/s; the next kits cost $6, $7 and $8, reaching +2 RP/s with four kits. The “Pause” control names the action available: clicking it changes the label to “Resume,” and clicking “Resume” restores “Pause.”
- Knowledge Sharing costs 150 RP; Fusion Theory costs 750 RP and requires Knowledge Sharing. With enough points, researching them unlocked further technologies. The first research technology also paid $30 through the “Research a Technology” achievement.
- Research Points appeared stuck at 50 on the header for a while, but after navigating to Research the page showed 1,365.05. Researching Knowledge Sharing and Fusion Theory left 465.05, and the header then matched. If a counter looks stale, navigate away and back before assuming it is the actual balance.
- Hydrogen and Research did not visibly advance during several tool waits, then Hydrogen filled to capacity while I was navigating the UI. Passive timing may depend on whether the game tab is active; verify on a foreground tab before relying on the output rates.
