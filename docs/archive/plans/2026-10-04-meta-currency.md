# Meta currency contract: AP, GP and Galactic Market

**Status:** completed source and implementation record for G-09–G-16. The source snapshot is pinned in [foundation-meta](../../audit/foundation-meta.md); AP/GP sources and sinks, market behavior and two-run ledgers are verified below.

## Ascendency Points (AP)

| Source | Amount | Guard / calculation | Display and implementation |
| --- | --- | --- | --- |
| Settle a system | Base 1–50 from star distance; a 20% source roll can subtract up to 10% (rounded up). A battle win or surrender doubles it; O-type and factory systems double it again. VoidBorn adds its repeatable flat rank after run 1. | Once per run. | Current AP wallet is shown in Galaxy → Ascendency. Settlement applies the source curve and multipliers in `spaceMechanics.ts`; star profile generation uses the deterministic system seed as the injected random source. |
| Achievement: research all technologies | 1 AP | Persistent achievement is awarded once. | The achievement panel and AP wallet; achievement implementation is part of G-51–G-53. |
| Achievement: collect 100 Titanium precipitation | 50 AP | Persistent achievement is awarded once. | Same; G-51–G-53. |
| Achievement: perform a Galactic Market transaction | 1 AP | Persistent achievement is awarded once. | Same; market action is G-11 and achievement trigger is G-51–G-53. |
| Achievement: trade 10 AP for cash | 5 AP | Persistent achievement requires one 10-AP sale; it is awarded once. | Same; market sale is G-11 and achievement trigger is G-51–G-53. |
| Diplomacy/settlement achievements | Bully or vassalize: 1 each; conquer: 1; Hive Mind conquer: 2; Belligerent conquer: 3; conquer without scanning: 2; settle unoccupied: no direct AP. | Each persistent achievement is awarded once. | Same; diplomacy achievements follow M-04 and reward dispatch is G-51–G-53. |
| Conquest and long-run achievements | Conquer 10 systems: 10; conquer 50: 100; 50 hours with one pioneer: 50. | Persistent achievement is awarded once. | Same; achievement triggers are G-51–G-53. |
| Galactic Market liquidation | `floor(total liquidatable stock sale value + cash / cash-liquidation modifier) / current AP purchase price`; the VoidBorn repeatable adds its documented flat bonus after run 1. | Explicit player confirmation; one liquidation per run. Consumes eligible stocks and cash. | Galaxy → Galactic Market. Implemented in G-11. |
| Sell AP for cash | Spend 1, 5 or 10 AP at the current AP sale price. | Requires sufficient AP; the 10-AP action also satisfies the one-time achievement above. | Galaxy → Galactic Market. Implemented in G-11. This is an AP sink. |
| Ascendency perk purchase | Catalogue price per stable perk ID, including caps and repeat prices. | Engine validates the next price and cap atomically. | Galaxy → Ascendency. The sixteen IDs and prices are implemented in `content/ascendency.ts`; G-13–G-16 complete modifier and path-wide evidence. This is an AP sink. |

## Glory Points (GP)

| Source or sink | Amount | Guard / calculation | Display and implementation |
| --- | --- | --- | --- |
| Rebirth after settlement | 1 GP for the newly settled destination, plus 1 for each extra system settled by an active Expansionist ability. | Awarded once by successful rebirth; the wallet already reflects prior GP spending. GP is not awarded at settlement. | Cosmic Rip → Situation balance. The ordinary and Expansionist awards are verified by the G-01–G-08 and G-25–G-30 tests. |
| Achievement: win all casino games | Refund 1 GP. | One-time achievement reward. | Cosmic Rip → Situation balance; reward dispatcher is G-51–G-53. |
| Achievement: complete a run on Miaplacidus | Refund 1 GP. | One-time achievement reward. | Same; G-51–G-53. |
| Restore Near Space Scanner Array | Spend 10 GP. | Requires Miaplacidus settled; one-time restore. | Cosmic Rip → Situation; G-43–G-50. |
| Scan a sector | Spend 1 GP. | One-time per each of nine sectors. | Cosmic Rip → Scanner; G-43–G-50. |
| Research a stabilization technology | Spend 1 GP per technology, five total. | Requires prior stage and the telemetry threshold/cost; one-time per stage. | Cosmic Rip → research pane; G-43–G-50. |
| Close Cosmic Rip | Spend 1 GP. | All five stabilization technologies; one-time ending. | Cosmic Rip → Situation; G-47–G-50. |

AP and GP are separate wallets. Rebirth preserves both and grants GP; it does not convert one currency into the other. Galactic Casino Points (CP) are a third wallet and reset to zero on rebirth. See the [casino contract](2026-10-04-meta-casino.md) for CP purchases, game odds, outcomes and save scope. In the reference, Cosmic Rip displays GP and the Tab 7 rebirth confirmation adds its GP gain line only after Cosmic Rip is unlocked.

## Galactic Market rules

The source has eight material goods and six compounds with base prices: Hydrogen 0.02, Helium 0.01, Carbon 0.10, Neon 0.06, Oxygen 0.05, Sodium 0.10, Silicon 0.08, Iron 0.12, Diesel 0.20, Glass 0.80, Steel 1.20, Concrete 0.80, Water 0.08 and Titanium 6.00. Both directions are available between any two distinct unlocked goods. Adjusted unit price is `max(0, baseValue × (1 + marketBias / 100))`; the gross incoming amount is floored after applying the outgoing/incoming price ratio. A trade pays `floor(commissionPercent × outgoingQuantity / 100)` outgoing units as commission, then subtracts the proportional incoming commission and floors the received amount. Every accepted trade raises commission by a seeded 6–13 percentage points up to 80. A 10-second clock adjusts bias toward market balance; every 2–4 minutes the market picks new AP prices, reduces commission by 20 to a minimum of 10, and changes each good's trade volume within the source bounds.

AP sells in batches of 1, 5 or 10 at a price that changes between 60,000 and 140,000 cash per AP. Asset liquidation converts `sum(good.saleValue × quantity) + cash / 10` to `floor(value / currentApBuyPrice)` AP; the AP buy price varies from 1,000,000 to 1,600,000. Liquidation consumes cash and all material/compound stock, requires an explicit confirmation, and is once per run. The source market object is outside the run resource reset, so current prices, commission, bias, trade volume and cycle survive rebirth. Market transactions are locked for 30 minutes by the Galactic Market Lockdown event. The remake stores the remaining lock time in the run and applies it to every market command; random-event initiation is tracked with G-54. A persistent recent-trade list (last 30 entries) is an interface improvement because the source has no saved trade log. Live quotes and engine validation share the same integer calculation, so stock, storage capacity, fee and rounding checks use the amount the command will actually settle.

## Implementation boundary

The AP award curve, normal rebirth GP award, AP market transactions, market trade/price cycles, and all sixteen perk IDs/cost ladders are implemented. G-14 is verified by `tests/unit/meta-progression.spec.ts`: the permanent buyer and power-grid effects match their baselines before and after portable-save reload and rebirth. G-16 is verified in the same area by an exact two-rebirth ledger: AP moves from 80 to 75 after the 10-AP sale and one-time 5-AP achievement; GP starts at 30, earns one casino achievement refund plus the ordinary rebirth award and Miaplacidus run refund, then pays 10 for scanner restoration, 9 for unique sector scans, 5 for research and 1 for closure, ending at 9 after the second rebirth. Repeated achievement triggers and closure do not duplicate awards or charges. A second unit scenario includes two Expansionist extra systems in the first rebirth award, verifies they enter the settled-system ledger, and verifies the second rebirth does not pay them again. The complete achievement catalogue is verified in the archived G-51–G-60 record.
