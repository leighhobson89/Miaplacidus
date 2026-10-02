# Product decisions for MIAPLACIDUS

These decisions were supplied by the project owner on 2 October 2026 and govern the [master checklist](master-checklist.md). The filename is retained so existing links and work notes continue to resolve. No product decision in the previous table remains open.

| Topic | Decision | Consequence for the rebuild |
|---|---|---|
| Identity and scope | **MIAPLACIDUS** is a from-scratch remake of the shipped Cosmic Forge game. Preserve its player-facing mechanics, content breadth, nine tabs, themes, story/endgame and six languages. | Treat Cosmic Forge code and tests as read-only behavioral evidence. Extract rules and data; write a new application. Record any deliberate rule change. |
| Devices and delivery | Ship a browser game that works on desktop and responsive mobile. **No Electron app or desktop installer.** | Test wide and narrow layouts and current desktop/mobile browsers. A desktop computer uses the browser release. |
| Saving | **No cloud saves, accounts or sync.** Use multiple independent `localStorage` slots and LZString text/clipboard/file export and import. | The name field prefills the last successfully started pioneer. The slot loaded when Start is clicked is the name explicitly confirmed for that start. See the [save contract](local-save-contract.md). |
| Save compatibility | **No import or compatibility with original Cosmic Forge saves.** Saves created in MIAPLACIDUS must remain usable as the game evolves. | Introduce a versioned MIAPLACIDUS schema from the first save, validate imports, and add forward migration rungs for future MIAPLACIDUS versions. Reject old Cosmic Forge codes clearly and without changing a slot. |
| Demo | A demo is desirable, **disabled by default and enabled only by an explicit build flag**. | Full game is the normal build. Preserve the old demo's intended player-facing restrictions only in a deliberately produced demo build; test flag isolation. |
| Balance | Improvements are welcome. | Establish source behavior first, then record proposed changes with examples, player impact and tests in the affected feature plan before applying them. Gameplay parity is the baseline, not a ban on improvements. |
| Visual and audio assets | **Remake all assets.** | Existing images and sounds are references for coverage and art direction only. Make new, appropriately licensed visuals, effects and music; do not copy old binary assets into the release. |
| Localization | Keep `en`, `es`, `pt`, `de`, `it`, `fr`. The project owner gives a **quick OK** on translation quality. | Automated key/placeholder/layout checks accompany a concise review sample and final owner signoff. |
| Analytics | **No analytics system for now.** | Do not implement telemetry collection, consent screens, endpoints or analytics preferences. Cosmic Rip's in-game telemetry is a gameplay resource and stays. |

## Working technical decisions

- TypeScript, Vite and React for the browser UI; semantic HTML and responsive CSS. The simulation remains framework-independent and deterministic.
- Vitest for pure rules and Playwright for browser functional areas, following the old project's area-based test and debug approach.
- LZString 1.5.0 for compressed local slots and portable codes. The package is already pinned in the manifest and lockfile.
- Keep future implementation choices in the feature plan that needs them. Amend this record only when the owner changes a product decision; then update the master checklist and affected contracts together.
