import {
  COMPOUND_IDS,
  MATERIAL_IDS,
  type CompoundId,
  type EconomicGoodId,
  type MaterialId,
} from "./ids";

export const ECONOMY_PRICE_MULTIPLIER = 1.13;
export const MANUAL_RESOURCE_GAIN = 1;
export const BASE_STORAGE_MULTIPLIER = 2;

export interface BuyerTierDefinition {
  readonly price: number;
  readonly ratePerSecond: number;
  readonly energyPerSecond: number;
}

export interface FusionOutputDefinition {
  readonly goodId: MaterialId;
  readonly ratio: number;
}

export interface MaterialDefinition {
  readonly id: MaterialId;
  readonly symbol: string;
  readonly storageCapacity: number;
  readonly saleValue: number;
  readonly buyerTiers: readonly [
    BuyerTierDefinition,
    BuyerTierDefinition,
    BuyerTierDefinition,
    BuyerTierDefinition,
  ];
  readonly fusionTechId?: string;
  readonly fusionOutputs?: readonly FusionOutputDefinition[];
}

const buyer = (
  price: number,
  ratePerSecond: number,
  energyPerSecond: number,
): BuyerTierDefinition => ({ price, ratePerSecond, energyPerSecond });

/** Source values are per-second units converted from Cosmic Forge's 10 ms tick fields. */
export const MATERIAL_CATALOG = {
  hydrogen: {
    id: "hydrogen",
    symbol: "H₂",
    storageCapacity: 150,
    saleValue: 0.02,
    buyerTiers: [buyer(50, 2, 0), buyer(400, 10, 3), buyer(2_000, 50, 12), buyer(10_000, 250, 60)],
    fusionTechId: "hydrogenFusion",
    fusionOutputs: [{ goodId: "helium", ratio: 0.5 }],
  },
  helium: {
    id: "helium",
    symbol: "He",
    storageCapacity: 120,
    saleValue: 0.03,
    buyerTiers: [
      buyer(75, 2, 0),
      buyer(600, 7.5, 3),
      buyer(3_000, 37.5, 9),
      buyer(15_000, 187.5, 45),
    ],
    fusionTechId: "heliumFusion",
    fusionOutputs: [{ goodId: "carbon", ratio: 0.3 }],
  },
  carbon: {
    id: "carbon",
    symbol: "C",
    storageCapacity: 130,
    saleValue: 0.1,
    buyerTiers: [buyer(80, 2, 0), buyer(640, 10, 3), buyer(3_200, 50, 12), buyer(16_000, 250, 60)],
    fusionTechId: "carbonFusion",
    fusionOutputs: [
      { goodId: "neon", ratio: 0.3 },
      { goodId: "sodium", ratio: 0.2 },
    ],
  },
  neon: {
    id: "neon",
    symbol: "Ne",
    storageCapacity: 200,
    saleValue: 0.12,
    buyerTiers: [
      buyer(120, 2, 0),
      buyer(960, 12.5, 3),
      buyer(4_800, 62.5, 15),
      buyer(24_000, 312.5, 75),
    ],
    fusionTechId: "neonFusion",
    fusionOutputs: [{ goodId: "oxygen", ratio: 0.3 }],
  },
  oxygen: {
    id: "oxygen",
    symbol: "O₂",
    storageCapacity: 170,
    saleValue: 0.05,
    buyerTiers: [
      buyer(140, 2, 0),
      buyer(1_120, 15, 3),
      buyer(5_600, 75, 18),
      buyer(28_000, 375, 90),
    ],
    fusionTechId: "oxygenFusion",
    fusionOutputs: [{ goodId: "silicon", ratio: 0.2 }],
  },
  sodium: {
    id: "sodium",
    symbol: "Na",
    storageCapacity: 200,
    saleValue: 0.1,
    buyerTiers: [
      buyer(300, 2, 0),
      buyer(2_400, 25, 3),
      buyer(12_000, 125, 24),
      buyer(60_000, 625, 120),
    ],
  },
  silicon: {
    id: "silicon",
    symbol: "Si",
    storageCapacity: 150,
    saleValue: 0.08,
    buyerTiers: [
      buyer(200, 2, 0),
      buyer(1_600, 17.5, 3),
      buyer(8_000, 87.5, 21),
      buyer(40_000, 437.5, 105),
    ],
    fusionTechId: "siliconFusion",
    fusionOutputs: [{ goodId: "iron", ratio: 0.2 }],
  },
  iron: {
    id: "iron",
    symbol: "Fe",
    storageCapacity: 180,
    saleValue: 0.17,
    buyerTiers: [
      buyer(250, 2, 0),
      buyer(2_000, 20, 3),
      buyer(10_000, 100, 27),
      buyer(50_000, 500, 135),
    ],
  },
} as const satisfies Record<MaterialId, MaterialDefinition>;

export interface RecipeInput {
  readonly goodId: MaterialId;
  readonly amount: number;
}

export interface CompoundDefinition {
  readonly id: CompoundId;
  readonly formula: string;
  readonly storageCapacity: number;
  readonly saleValue: number;
  readonly unlockTechId: string;
  readonly recipe: readonly RecipeInput[];
  readonly buyerTiers: readonly [
    BuyerTierDefinition,
    BuyerTierDefinition,
    BuyerTierDefinition,
    BuyerTierDefinition,
  ];
  readonly waterStorageConcreteRate?: number;
}

export const COMPOUND_CATALOG = {
  diesel: {
    id: "diesel",
    formula: "C₂₆H₅₂",
    storageCapacity: 500,
    saleValue: 0.3,
    unlockTechId: "hydroCarbons",
    recipe: [
      { goodId: "hydrogen", amount: 26 },
      { goodId: "carbon", amount: 12 },
    ],
    buyerTiers: [
      buyer(1_000, 2, 0),
      buyer(400_000, 10, 3),
      buyer(2_000_000, 50, 12),
      buyer(10_000_000, 250, 60),
    ],
  },
  glass: {
    id: "glass",
    formula: "SiO₂",
    storageCapacity: 200,
    saleValue: 0.8,
    unlockTechId: "glassManufacture",
    recipe: [
      { goodId: "silicon", amount: 4 },
      { goodId: "oxygen", amount: 2 },
      { goodId: "sodium", amount: 1 },
    ],
    buyerTiers: [
      buyer(70_000, 2, 0),
      buyer(600_000, 8, 8),
      buyer(1_250_000, 40, 31),
      buyer(2_500_000, 150, 150),
    ],
  },
  steel: {
    id: "steel",
    formula: "Fe+C",
    storageCapacity: 250,
    saleValue: 1.8,
    unlockTechId: "steelFoundries",
    recipe: [
      { goodId: "iron", amount: 4 },
      { goodId: "carbon", amount: 1 },
    ],
    buyerTiers: [
      buyer(80_000, 2, 0),
      buyer(700_000, 10, 10),
      buyer(1_500_000, 50, 35),
      buyer(3_000_000, 200, 180),
    ],
  },
  concrete: {
    id: "concrete",
    formula: "SiO₂+CaCO₃",
    storageCapacity: 50,
    saleValue: 0.8,
    unlockTechId: "aggregateMixing",
    recipe: [
      { goodId: "silicon", amount: 5 },
      { goodId: "sodium", amount: 2 },
      { goodId: "hydrogen", amount: 3 },
    ],
    buyerTiers: [
      buyer(95_000, 1, 0),
      buyer(800_000, 8, 20),
      buyer(1_800_000, 50, 70),
      buyer(4_200_000, 200, 360),
    ],
  },
  water: {
    id: "water",
    formula: "H₂O",
    storageCapacity: 100,
    saleValue: 1.6,
    unlockTechId: "neonFusion",
    recipe: [
      { goodId: "hydrogen", amount: 20 },
      { goodId: "oxygen", amount: 10 },
    ],
    buyerTiers: [
      buyer(95_000, 2, 0),
      buyer(800_000, 8, 20),
      buyer(1_800_000, 50, 70),
      buyer(4_200_000, 200, 360),
    ],
    waterStorageConcreteRate: 0.3,
  },
  titanium: {
    id: "titanium",
    formula: "Ti",
    storageCapacity: 50,
    saleValue: 12.5,
    unlockTechId: "neutronCapture",
    recipe: [
      { goodId: "iron", amount: 22 },
      { goodId: "sodium", amount: 18 },
      { goodId: "neon", amount: 40 },
    ],
    buyerTiers: [
      buyer(105_000, 1, 0),
      buyer(850_000, 8, 40),
      buyer(1_880_000, 50, 130),
      buyer(4_800_000, 500, 510),
    ],
  },
} as const satisfies Record<CompoundId, CompoundDefinition>;

const materialDefaults: [EconomicGoodId, { storageCapacity: number; saleValue: number }][] =
  MATERIAL_IDS.map((id) => [id, MATERIAL_CATALOG[id]]);
const compoundDefaults: [EconomicGoodId, { storageCapacity: number; saleValue: number }][] =
  COMPOUND_IDS.map((id) => [id, COMPOUND_CATALOG[id]]);

export const INITIAL_GOODS = Object.fromEntries([
  ...materialDefaults.map(
    ([id, definition]) =>
      [
        id,
        { storageCapacity: definition.storageCapacity, saleValue: definition.saleValue },
      ] as const,
  ),
  ...compoundDefaults.map(
    ([id, definition]) =>
      [
        id,
        { storageCapacity: definition.storageCapacity, saleValue: definition.saleValue },
      ] as const,
  ),
]) as Record<EconomicGoodId, { storageCapacity: number; saleValue: number }>;

export const INITIAL_RESEARCH = 50;
export const SCIENCE_BUILDINGS = {
  scienceKit: { price: 5, ratePerSecond: 0.5, energyPerSecond: 0, techId: null },
  scienceClub: { price: 200, ratePerSecond: 8, energyPerSecond: 0, techId: "knowledgeSharing" },
  scienceLab: {
    price: 1_500,
    ratePerSecond: 20,
    energyPerSecond: 35,
    techId: "scienceLaboratories",
  },
} as const;

export const ENERGY_BUILDINGS = {
  powerPlant1: {
    price: { cash: 300, materials: [{ goodId: "carbon", amount: 100 }] },
    ratePerSecond: 5,
    fuel: { goodId: "carbon", unitsPerSecond: 3 },
    techId: "basicPowerGeneration",
  },
  powerPlant2: {
    price: {
      cash: 1_000,
      materials: [
        { goodId: "glass", amount: 150 },
        { goodId: "steel", amount: 200 },
      ],
    },
    ratePerSecond: 20,
    fuel: null,
    techId: "solarPowerGeneration",
  },
  powerPlant3: {
    price: {
      cash: 700,
      materials: [
        { goodId: "hydrogen", amount: 800 },
        { goodId: "helium", amount: 500 },
      ],
    },
    ratePerSecond: 35,
    fuel: { goodId: "diesel", unitsPerSecond: 1 },
    techId: "advancedPowerGeneration",
  },
  battery1: {
    price: {
      cash: 5_000,
      materials: [
        { goodId: "sodium", amount: 500 },
        { goodId: "carbon", amount: 1_000 },
      ],
    },
    capacity: 15_000,
    techId: "sodiumIonPowerStorage",
  },
  battery2: {
    price: {
      cash: 50_000,
      materials: [
        { goodId: "steel", amount: 3_000 },
        { goodId: "glass", amount: 1_500 },
        { goodId: "sodium", amount: 2_000 },
      ],
    },
    capacity: 150_000,
    techId: "advancedPowerGeneration",
  },
  battery3: {
    price: {
      cash: 500_000,
      materials: [
        { goodId: "titanium", amount: 25_000 },
        { goodId: "neon", amount: 12_000 },
        { goodId: "silicon", amount: 18_000 },
      ],
    },
    capacity: 1_500_000,
    techId: "orbitalConstruction",
  },
} as const;
