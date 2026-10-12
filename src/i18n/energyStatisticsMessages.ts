import type { LocaleId } from "../content/ids";

export type EnergyStatisticId =
  | "energySection"
  | "powerCurrent"
  | "totalEnergy"
  | "totalProduction"
  | "totalConsumption"
  | "totalBatteryStorage"
  | "energyTrips"
  | "basicPowerPlants"
  | "advancedPowerPlants"
  | "solarPowerPlants"
  | "sodiumIonBatteries"
  | "battery2"
  | "battery3"
  | "notApplicable";

const labels: Record<LocaleId, Record<EnergyStatisticId, string>> = {
  en: {
    energySection: "Energy",
    powerCurrent: "Power",
    totalEnergy: "Total Energy",
    totalProduction: "Total Production",
    totalConsumption: "Total Consumption",
    totalBatteryStorage: "Total Battery Storage",
    energyTrips: "Times Tripped",
    basicPowerPlants: "Basic Power Plants",
    advancedPowerPlants: "Advanced Power Plants",
    solarPowerPlants: "Solar Power Plants",
    sodiumIonBatteries: "Sodium Ion Batteries",
    battery2: "Battery2",
    battery3: "Battery3",
    notApplicable: "N/A",
  },
  es: {
    energySection: "Energía",
    powerCurrent: "Energía",
    totalEnergy: "Energía total",
    totalProduction: "Producción total",
    totalConsumption: "Consumo total",
    totalBatteryStorage: "Almacenamiento total de baterías",
    energyTrips: "Veces desconectado",
    basicPowerPlants: "Plantas de energía básicas",
    advancedPowerPlants: "Plantas de energía avanzadas",
    solarPowerPlants: "Plantas de energía solar",
    sodiumIonBatteries: "Baterías de ion sodio",
    battery2: "Batería2",
    battery3: "Batería3",
    notApplicable: "N/D",
  },
  pt: {
    energySection: "Energia",
    powerCurrent: "Energia",
    totalEnergy: "Energia total",
    totalProduction: "Produção total",
    totalConsumption: "Consumo total",
    totalBatteryStorage: "Armazenamento total das baterias",
    energyTrips: "Vezes desconectado",
    basicPowerPlants: "Usinas de energia básicas",
    advancedPowerPlants: "Usinas de energia avançadas",
    solarPowerPlants: "Usinas de energia solar",
    sodiumIonBatteries: "Baterias de íons de sódio",
    battery2: "Bateria2",
    battery3: "Bateria3",
    notApplicable: "N/D",
  },
  de: {
    energySection: "Energie",
    powerCurrent: "Energie",
    totalEnergy: "Gesamtenergie",
    totalProduction: "Gesamtproduktion",
    totalConsumption: "Gesamtverbrauch",
    totalBatteryStorage: "Gesamte Batteriespeicherung",
    energyTrips: "Auslösungen",
    basicPowerPlants: "Einfache Kraftwerke",
    advancedPowerPlants: "Fortgeschrittene Kraftwerke",
    solarPowerPlants: "Solarkraftwerke",
    sodiumIonBatteries: "Natrium-Ionen-Batterien",
    battery2: "Batterie2",
    battery3: "Batterie3",
    notApplicable: "K.A.",
  },
  it: {
    energySection: "Energia",
    powerCurrent: "Energia",
    totalEnergy: "Energia totale",
    totalProduction: "Produzione totale",
    totalConsumption: "Consumo totale",
    totalBatteryStorage: "Capacità totale delle batterie",
    energyTrips: "Volte scattato",
    basicPowerPlants: "Centrali elettriche di base",
    advancedPowerPlants: "Centrali elettriche avanzate",
    solarPowerPlants: "Centrali solari",
    sodiumIonBatteries: "Batterie agli ioni di sodio",
    battery2: "Batteria2",
    battery3: "Batteria3",
    notApplicable: "N/D",
  },
  fr: {
    energySection: "Énergie",
    powerCurrent: "Énergie",
    totalEnergy: "Énergie totale",
    totalProduction: "Production totale",
    totalConsumption: "Consommation totale",
    totalBatteryStorage: "Stockage total des batteries",
    energyTrips: "Nombre de déclenchements",
    basicPowerPlants: "Centrales électriques de base",
    advancedPowerPlants: "Centrales électriques avancées",
    solarPowerPlants: "Centrales solaires",
    sodiumIonBatteries: "Batteries sodium-ion",
    battery2: "Batterie2",
    battery3: "Batterie3",
    notApplicable: "S.O.",
  },
};

export function energyStatisticLabel(locale: LocaleId, id: EnergyStatisticId): string {
  return labels[locale][id];
}

export const LOCALIZATION_VALIDATION_DATA = { labels } as const;
