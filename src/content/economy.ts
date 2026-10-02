import type { EconomicGoodId } from "./ids";

/** Fresh-template capacities and sale values extracted from foundation-economy.md F-04. */
export const INITIAL_GOODS = {
  hydrogen: { storageCapacity: 150, saleValue: 0.02 },
  helium: { storageCapacity: 120, saleValue: 0.03 },
  carbon: { storageCapacity: 130, saleValue: 0.1 },
  neon: { storageCapacity: 200, saleValue: 0.12 },
  oxygen: { storageCapacity: 170, saleValue: 0.05 },
  silicon: { storageCapacity: 150, saleValue: 0.08 },
  iron: { storageCapacity: 180, saleValue: 0.17 },
  sodium: { storageCapacity: 200, saleValue: 0.1 },
  diesel: { storageCapacity: 500, saleValue: 0.3 },
  glass: { storageCapacity: 200, saleValue: 0.8 },
  steel: { storageCapacity: 250, saleValue: 1.8 },
  concrete: { storageCapacity: 50, saleValue: 0.8 },
  water: { storageCapacity: 100, saleValue: 1.6 },
  titanium: { storageCapacity: 50, saleValue: 12.5 },
} as const satisfies Record<EconomicGoodId, { storageCapacity: number; saleValue: number }>;
