# Source layout

| Path           | Ownership                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `app/`         | Browser composition root and build metadata.                                                                                   |
| `engine/`      | Framework-free scoped state, commands, transactions, selectors, clock, seeded random, timers and the throttled snapshot store. |
| `content/`     | Immutable definitions and language-independent catalogue IDs.                                                                  |
| `persistence/` | Local save contracts, codecs, migrations and browser storage adapters.                                                         |
| `i18n/`        | Locale catalogues, message keys and formatting.                                                                                |
| `ui/`          | React views, external-store hooks, accessible interaction and render recovery boundaries.                                      |
| `audio/`       | Optional sound adapter and new audio assets.                                                                                   |
| `assets/`      | Locally bundled images, icons and other static files.                                                                          |

The engine may import pure content definitions. It must not import app, UI, persistence or audio code, React, or browser DOM APIs. `main.tsx` is the browser-only entry point; it renders the app and owns no game rules.
