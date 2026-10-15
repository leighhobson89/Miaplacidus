# Energy browser coverage

Energy-focused browser cases live here. Tests use shared scenario setup from
the E2E harness when they need an Energy fixture; independent Research cases
belong in the [Research area](../research/README.md). Cross-area journey cases formerly in the Economy catchall now have their primary feature owners listed below.

Installed Chrome passed the complete Energy area **15/15 in 3.0 minutes** on
14 October 2026 (port 6442), with snapshot updates disabled. The run includes
the all-locale/theme/viewport presentation matrix and did not require snapshot
changes.

- `energy-presentation-matrix.spec.ts` covers Energy page identity, ordering,
  artwork, bounds, power switch states, and desktop/phone captures.
- `p45-energy-locales.spec.ts` covers localized Energy purchase reasons and grid-trip feedback.
- `p7-energy-tier-copy-locales.spec.ts` covers all Battery and Power row
  names, the Battery section help paragraph, all six individual plant and
  battery tooltips, Advanced Power Plant help, the generation legend,
  capacity/rate purchase controls, and the per-plant activate/deactivate labels
  across all six locales (AUTHORED, NOT RUN).
- `p13-energy-narrow-context.spec.ts` verifies Battery I affordability, purchase effects on Power capacity, and visible balances at 390px and 320px.

Run this area with:

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/energy --project=chrome --workers=1 --retries=0
```

The Energy matrix snapshots are in
[`energy-presentation-matrix.spec.ts-snapshots/`](energy-presentation-matrix.spec.ts-snapshots/).
Historical review notes and exact earlier commands remain in the economy README.

## P-13 Battery purchase context (14 October 2026)

The focused case checks Battery I's visible price and enabled action, purchases
it through the Energy pane, verifies cash is spent and Power capacity increases,
then checks Research Points and Power balances plus layout bounds at 390px and
320px. The original two screenshots were moved unchanged from the former mixed
Research/Energy spec into this area. Installed Chrome passed **1/1 in 6.4s** on
port 6531 with no snapshot update:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6531'
npm.cmd run test:e2e:focused -- tests/e2e/energy/p13-energy-narrow-context.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```


## Economy catchall migration (14 October 2026)
Energy-owned cases from the retired Economy catchall now live in [`economy-energy.spec.ts`](economy-energy.spec.ts), [`e57-research-energy-cost-context.spec.ts`](e57-research-energy-cost-context.spec.ts), and [`p45-energy-copy.spec.ts`](p45-energy-copy.spec.ts). Research-owned cases are in the [Research area](../research/README.md).

## Phase 7: Cosmic Forge Tab 2 row labels

Cosmic Forge `index.html` defines the Energy Storage, Power Plant, Solar Power
Plant, and Advanced Power Plant sections with `headerMainEnergyStorage`,
`headerMainPowerPlant`, `headerMainSolarPowerPlant`, and
`headerMainAdvancedPowerPlant`. `drawTab2Content.js` renders six row labels:
`tab2Battery1RowLabel` through `tab2Battery3RowLabel` and
`tab2PowerPlant1RowLabel` through `tab2PowerPlant3RowLabel`.

The remake maps `headerMainEnergyStorage` to the localized Batteries child
route (`economyLabel("energyStorage")`, `#tab-energy-batteries`). The three
source Power Plant sections stay as distinct building cards grouped under the
owner-directed Power route (`economyLabel("energyPower")`, `#tab-energy-power`).
Battery row keys map to `ECONOMY_BUILDING_NAMES.battery1..3`; Power row keys map
to `ECONOMY_BUILDING_NAMES.powerPlant1..3`. `techName(locale, id)` renders the
card headings and Summary generation legend; the renderer adds the source
row-label colon. These catalogue values already match the source in all six
locales, so no catalogue or renderer change was needed.

| Cosmic Forge key | MIAPLACIDUS value and route |
| --- | --- |
| `tab2Battery1RowLabel` / `tab2Battery2RowLabel` / `tab2Battery3RowLabel` | `ECONOMY_BUILDING_NAMES.battery1..3[locale]` at each `data-building-id="batteryN"` card heading on `#tab-energy-batteries`. |
| `tab2PowerPlant1RowLabel` / `tab2PowerPlant2RowLabel` / `tab2PowerPlant3RowLabel` | `ECONOMY_BUILDING_NAMES.powerPlant1..3[locale]` at each `data-building-id="powerPlantN"` card heading on `#tab-energy-power`. |
| `buttonAddCapacityMj` | `economyMessages.ts#addEnergyCapacity` on each unlocked Battery card's purchase button. |
| `buttonAddRateKjPerSecond` | `economyMessages.ts#addPowerPlantRate` on Power Plant 1 and Advanced Power Plant cards. |
| `buttonAddMaxRateKjPerSecond` | `economyMessages.ts#addMaxPowerPlantRate` on the Solar Power Plant card. |
| `buttonActivate` / `buttonDeactivate` | `economyMessages.ts#activatePowerPlant` / `#deactivatePowerPlant` on the owned plant's `label.economy-toggle`; the grid-wide switch has separate `activatePower` / `deactivatePower` labels. |
| `buttonSellOne` | No target value or route: MIAPLACIDUS has no Energy building sell command or control. See the existing [notification route audit](../../../docs/audit/notification-route-audit.md). |

`p7-energy-tier-copy-locales.spec.ts` now checks all six Battery and Power
headings against the actual target name catalogue, the three Summary legend
names, capacity/rate controls, and plant help copy. This corrects its earlier
lookup through `TECHNOLOGY_NAMES`, which does not own these building labels.
It buys each plant before cycling the selected locale so both target plant
toggle labels are visible and checked. `buttonActivate` and `buttonDeactivate`
map to `economyMessages.ts#activatePowerPlant` and
`economyMessages.ts#deactivatePowerPlant` on the owned plant card; the distinct
grid-wide control continues to use `activatePower` / `deactivatePower`.

Source section descriptions also retain their own routes: Cosmic Forge
`descriptions.js` uses `headerDescEnergyStorage` for Energy Storage, which
MIAPLACIDUS renders as `economyMessages.ts#batteryStorageHelp` in the heading
of Energy > Batteries (`#tab-energy-batteries`). The same source file uses
`headerDescAdvancedPowerPlant` for Advanced Power Plant; MIAPLACIDUS renders
`economyMessages.ts#advancedPowerPlantHelp` in the Advanced Power Plant card's
`#energy-building-powerPlant3-purchase-help` paragraph on Energy > Power. The
Phase 7 spec asserts both populated values for each selected locale.

Cosmic Forge `descriptions.js` also assigns one `content1` description to each
of its three power plant rows and three battery rows. The active remake already
routes each description through the corresponding building's focusable
`InfoTooltip`; no pane or catalogue change was needed:

| Cosmic Forge key | MIAPLACIDUS value and route |
| --- | --- |
| `energyPowerPlant1Content1` / `energyPowerPlant2Content1` / `energyPowerPlant3Content1` | `economyMessages.ts#powerPlant1Help` / `#powerPlant2Help` / `#powerPlant3Help` in the matching Power card tooltip (`#energy-building-powerPlantN-help`). |
| `energyBattery1Content1` / `energyBattery2Content1` / `energyBattery3Content1` | `economyMessages.ts#battery1Help` / `#battery2Help` / `#battery3Help` in the matching Batteries card tooltip (`#energy-batteryN-help`). |

The Phase 7 spec focuses each of these six tooltip controls and checks the
selected locale's populated value against its corresponding
`economyMessages.ts` entry. These descriptions remain attached to their own
building rows rather than being represented only by the broader Energy page
help. Coverage is **AUTHORED, NOT RUN**; execution is deferred to Phase 8.

The remaining source action, `buttonSellOne`, has no active target route:
Energy plant cards have no sale command or sale control. The existing
[notification route audit](../../../docs/audit/notification-route-audit.md)
records this target behavior. It remains an uncovered source action rather
than being mis-mapped to the resource-sale label.

Status: **AUTHORED, NOT RUN**; execution is deferred to Phase 8.

## Phase 7: Cosmic Forge grid power toggle labels

Cosmic Forge `index.html` creates the grid-wide `#activateGridButton` with
`data-loc="buttonPowerOn"`. `game.js#handlePowerAllButtonState` changes its label
to `buttonPowerOff` while any power plant is active, or back to `buttonPowerOn`
when none is active. MIAPLACIDUS keeps this source control distinct from each
plant card's activate/deactivate switch: the equivalent is the grid-wide
`.energy-master-switch` on Energy > Power, backed by
`economyMessages.ts#activatePower` / `#deactivatePower`. These entries already
have non-empty values in all six locales and are included in the economy
catalogue's localization validation data.

`p7-energy-grid-toggle-locales.spec.ts` covers both grid-wide label states in
all six locales (**AUTHORED, NOT RUN**). It does not substitute the per-plant
`activatePowerPlant` / `deactivatePowerPlant` labels for the source grid
control.
