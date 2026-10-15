# Localization browser checks

The current Localization folder passed **36/36** in installed Chrome on 14
October 2026 (3.9 minutes, port 6443) with no snapshot updates. These checks
cover populated locale values, live label changes, and numeric/state invariants;
translation quality refinement remains deferred to Phase 7.

## P-49 live locale invariants

`p49-cosmic-rip-invariants.spec.ts` starts the Cosmic Rip's first timed research
task, saves the canonical `Ascendency Pioneer` slot, and switches through all
six shipped locales. It checks that translated page/technology/progress labels
change while tab IDs, the active technology, research elapsed time, the
10,000-telemetry and 1-GP costs, current telemetry/GP quantities, and the
committed local-save head/slot stay stable. It saves once more at the end to
confirm the locale update continues to use the same slot.

`p49-starship-invariants.spec.ts` starts a Sirius voyage, saves the canonical
`Starship Pioneer` slot, and switches through all six locales while the voyage
is active. It checks the translated fuel-cost label and locale-formatted price,
stable tab IDs, destination and travel phase, timer identity/duration with
non-resetting elapsed progress, unchanged antimatter balance and charged fuel,
and the same committed save head/slot before and after saving. This adds a third
active-task route alongside the Black Hole charge and Cosmic Rip research
routes; a whole-game identity and price sweep remains open.

`p49-economy-price-invariants.spec.ts` switches through all six locales and
checks the visible storage quote for all eight materials and six compounds
against the active locale formatter and current storage capacity. It also
asserts that every good's quantity/capacity, stable tab IDs, pioneer name,
local-save head keys, and selected slot ID remain unchanged. Together with the
three active-task routes, this covers resource/compound, meta-research, Black
Hole, and Starship price surfaces.

`p49-research-energy-price-invariants.spec.ts` checks the displayed quotes for
all three science buildings, three power plants, and three batteries while
switching through all six locales. It compares each cash/material cost with the
catalogue price and current purchase count, and confirms quantities, stable tab
IDs, and save-slot identity do not change. The focused installed-Chrome run
passed 1/1 in 15.8 seconds on port 4461; typecheck passed.

`p49-tech-autobuyer-price-invariants.spec.ts` checks every standard Tech Tree
node cost, the Hydrogen compressor quote, all material and compound autobuyer
tier prices, and each tier's Buy Max preview across all six live locales. It
compares displayed values with the technology catalogue, current autobuyer
selectors, and purchase scaling rules, while preserving quantities, stable tab
IDs, pioneer identity, and save-slot identity. Installed Chrome passed 1/1 in
30.4 seconds on port 4467; typecheck passed.

`p49-space-build-price-invariants.spec.ts` checks Telescope and Launch Pad
quotes, rocket-part and fuel-pump construction, every Starship module, and
Fleet Envoy/ship costs across all six locales. It compares displayed amounts
with active catalogue/state formulas and verifies stable route/tab IDs, game
state, pioneer identity, and save-slot identity. Installed Chrome passed all
5 tests in 42.9 seconds on port 4464; typecheck passed.

`p49-megastructure-price-invariants.spec.ts` checks visible first and mid-track
Megastructure research costs against the active technology catalogue in all six
locales. It also verifies the localized prerequisite, factory-location, and
settlement reasons for all four structures while preserving stable tab IDs,
current star, RP/cash balances, researched stages, pioneer name, and save slot.
Installed Chrome passed 2/2 in 19.4 seconds on port 4465; typecheck passed.

`p49-galactic-market-invariants.spec.ts` checks live trade rates, outgoing and
incoming quantities, and commission across all six locales against the market
engine quote while preserving goods, cash, stable tab IDs, and the same save
slot. Installed Chrome passed 1/1 in 11.6 seconds on port 4462; typecheck passed.

`p49-gated-route-identities.spec.ts` uses seeded encounter, philosophy,
scanned-destination, late-game rocket/asteroid, and guide states to compare the
gated route IDs before and after live locale changes. It covers Galactic
Rebirth, Research Philosophy, Interstellar Colonise, Asteroids, Rocket 2–4,
and all seven Miaplaedia child pages, while also checking stable visible tab
IDs and canonical save identity. Installed Chrome passed 5/5 in 45.3 seconds
on port 4466; typecheck passed.

The previously identified gated child-route identity gap is now covered. A
source-to-test audit still finds visible price families without focused P-49
live-switch assertions: Philosophy ability/repeatable costs, Ascendency Perk
costs, Galactic Casino entry/reveal costs, and Cosmic Rip cash/material upgrade
costs. These remain open before claiming whole-game price invariance.

Focused installed-Chrome result (9 October 2026): **1 passed** in 11.5 seconds.

```powershell
$env:MIAPLACIDUS_TEST_PORT = '4333'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
node ./node_modules/playwright/cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/localization/p49-cosmic-rip-invariants.spec.ts
```

Focused installed-Chrome Starship result (9 October 2026): **1 passed** in 12.9
seconds.

```powershell
$env:MIAPLACIDUS_TEST_PORT = '4335'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
node ./node_modules/playwright/cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/localization/p49-starship-invariants.spec.ts
```

Focused installed-Chrome economy result (9 October 2026): **1 passed** in 19.9
seconds on port 4457. Typecheck also passed.

```powershell
$env:MIAPLACIDUS_TEST_PORT = '4457'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
node ./node_modules/playwright/cli.js test --pass-with-no-tests --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/localization/p49-economy-price-invariants.spec.ts
```

Focused installed-Chrome Research/Energy result (9 October 2026): **1 passed**
in 15.8 seconds on port 4461. Typecheck also passed.

```powershell
$env:MIAPLACIDUS_TEST_PORT = '4461'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
node ./node_modules/playwright/cli.js test --pass-with-no-tests --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/localization/p49-research-energy-price-invariants.spec.ts
```

Focused installed-Chrome Space/Rocket/Starship/Fleet result (9 October 2026):
**5 passed** in 42.9 seconds on port 4464. Typecheck also passed.

```powershell
$env:MIAPLACIDUS_TEST_PORT = '4464'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
node ./node_modules/playwright/cli.js test --pass-with-no-tests --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/localization/p49-space-build-price-invariants.spec.ts
```

Focused installed-Chrome Megastructure result (9 October 2026): **2 passed**
in 19.4 seconds on port 4465. Typecheck also passed.

```powershell
$env:MIAPLACIDUS_TEST_PORT = '4465'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
node ./node_modules/playwright/cli.js test --pass-with-no-tests --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/localization/p49-megastructure-price-invariants.spec.ts
```

Focused installed-Chrome Galactic Market result (9 October 2026): **1 passed**
in 11.6 seconds on port 4462. Typecheck also passed.

```powershell
$env:MIAPLACIDUS_TEST_PORT = '4462'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
node ./node_modules/playwright/cli.js test --pass-with-no-tests --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/localization/p49-galactic-market-invariants.spec.ts
```

Focused installed-Chrome gated-route identity result (9 October 2026):
**5 passed** in 45.3 seconds on port 4466. Typecheck also passed.

```powershell
$env:MIAPLACIDUS_TEST_PORT = '4466'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
node ./node_modules/playwright/cli.js test --pass-with-no-tests --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/localization/p49-gated-route-identities.spec.ts
```

Focused installed-Chrome Tech Tree/autobuyer result (9 October 2026):
**1 passed** in 30.4 seconds on port 4467. Typecheck also passed.

```powershell
$env:MIAPLACIDUS_TEST_PORT = '4467'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
npm.cmd run test:e2e:focused -- tests/e2e/localization/p49-tech-autobuyer-price-invariants.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

Focused installed-Chrome Casino price invariance result (9 October 2026):
**1 passed** in 12.8 seconds on port 4471; typecheck passed. Across all six
locales the test compares CP purchase quotes for Cash and every economic good
with the active purchase selector, then checks Double or Nothing, Wheel,
Higher or Lower, and all three Void Seer entry prices. Casino state, route IDs,
pioneer and save-slot identity remain stable.

```powershell
$env:MIAPLACIDUS_TEST_PORT = '4471'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
npm.cmd run test:e2e:focused -- tests/e2e/localization/p49-casino-price-invariants.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

Focused installed-Chrome Cosmic Rip upgrade result (9 October 2026): **1
passed** in 11.6 seconds on port 4473; typecheck passed. The existing live
six-locale research/save-identity case now also compares both upgrade cards'
Cash and material costs against `cosmicRipUpgradeCost` and the active localized
formatters.

```powershell
$env:MIAPLACIDUS_TEST_PORT = '4473'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
npm.cmd run test:e2e:focused -- tests/e2e/localization/p49-cosmic-rip-invariants.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

Focused installed-Chrome Ascendency price result (9 October 2026): **1 passed**
in 11.1 seconds on port 4476. The live six-locale case compares every Ascendency
Perk's displayed AP level and next cost with the active perk ladder while
checking AP, purchased perks, selected page, pioneer, and save-slot identity.
Typecheck passed.

```powershell
$env:MIAPLACIDUS_TEST_PORT = '4476'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
npm.cmd run test:e2e:focused -- tests/e2e/localization/p49-ascendency-price-invariants.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

Focused installed-Chrome Philosophy price result (9 October 2026): **1 passed**
in 11.4 seconds on port 4478; typecheck passed. The case selects Expansionist
through the normal first-study flow, then switches live through all six locales
and compares the unpurchased ability and all four repeatable next-cost labels
against active prices. The selected philosophy, ability state, repeatable ranks,
tab IDs, pioneer and save-slot identity remain stable.

```powershell
$env:MIAPLACIDUS_TEST_PORT = '4478'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
npm.cmd run test:e2e:focused -- tests/e2e/localization/p49-philosophy-price-invariants.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

## P-45 Galactic and meta-system rendered-copy audit (10 October 2026)

This cluster reconciles the existing six-locale E-57/P-54 evidence with the
remaining visible dynamic feedback paths. Market already covered all unlocked
trade rows, quotes, AP sale, and liquidation dialog; the new case checks the
accepted trade notice plus lockdown reason and offline notice. Casino already
covered translated price/previews/help and counters; the new case adds the
visible insufficient-CP reason and actual Double-or-Nothing result notice.
Ascendency's 16 perks, AP shortfall, and Rebirth confirmation were already
rendered in all locales. Megastructure stage names/cost/progress were already
covered; the new case checks missing-technology, unsettled-star, and wrong
factory reasons. Black Hole price/status and AP shortfall were already covered;
the new case verifies the charge-completion notice. Cosmic Rip cost/prerequisite
states and its closure/achievement notice were already covered by E-57/P-54 and
the previous P-45 ending slice. No translation mismatch was found.

The new specs are `p45-market-casino-results.spec.ts`,
`p45-charge-notice-locales.spec.ts`, and
`p45-prerequisite-reasons-locales.spec.ts`. The focused installed-Chrome run
passed **9/9 in 1.5 minutes** on port 5077. This closes the identified
Market/Casino/Megastructure/Black Hole rendered-copy gaps in this cluster;
P-45 remains open for other screens and complete startup-to-ending review.

## P-45 Energy, Space Mining, and Interstellar rendered-copy audit (10 October 2026)

This locale cluster combines existing E-57 price, quote, shortfall, dialog,
page, timer, and scan-report coverage recorded in the Economy, Space Telescope,
Star Map, and Starship READMEs with two focused P-45 specs. The new Energy
cases assert an actual disabled Power Plant purchase reason after repricing at
320px/390px and the power-trip result in the Energy Summary for `en`, `es`,
`pt`, `de`, `it`, and `fr`. The route-result case performs Star Study, Void
Pillage, and Starship scans through visible controls and checks the localized
feedback, notifications, and Colonise scan result in all six locales. Energy
has no page-specific timer or purchase-confirmation modal; its grid-trip alert
is the state-change result. Research/Energy pages have no modal; the Philosophy
Choice dialog remains a separate Research flow.

The cases are `p45-energy-locales.spec.ts` and
`p45-space-interstellar-results.spec.ts`. Installed Chrome passed the combined
run **4/4 in 1.1 minutes** on port 5072. No player-facing translation fallback
or mismatch was found in this cluster. P-45 remains open for the other screen
families and the full startup-to-ending audit.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5072'
node .\node_modules\playwright\cli.js test tests/e2e/energy/p45-energy-locales.spec.ts tests/e2e/localization/p45-space-interstellar-results.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-route-locales-5072
```


## Economy catchall migration (14 October 2026)
Localized Resource, Compound, and early-economy cases formerly in the Economy catchall now live in [`economy-localization.spec.ts`](economy-localization.spec.ts), [`p45-early-economy-locales.spec.ts`](p45-early-economy-locales.spec.ts), [`p45-resource-compound-copy.spec.ts`](p45-resource-compound-copy.spec.ts), and [`p51-e57-economy-phone-locale.spec.ts`](p51-e57-economy-phone-locale.spec.ts).
