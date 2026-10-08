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
    totalEnergy: "Total energy",
    totalProduction: "Total production",
    totalConsumption: "Total consumption",
    totalBatteryStorage: "Total battery storage",
    energyTrips: "Times tripped",
    basicPowerPlants: "Basic power plants",
    advancedPowerPlants: "Advanced power plants",
    solarPowerPlants: "Solar power plants",
    sodiumIonBatteries: "Sodium ion batteries",
    battery2: "Battery2 (Lithium Ion)",
    battery3: "Battery3 (Stellar Capacitor Array)",
    notApplicable: "Not applicable",
  },
  es: {
    energySection: "Energía",
    powerCurrent: "Energía eléctrica",
    totalEnergy: "Energía total",
    totalProduction: "Producción total",
    totalConsumption: "Consumo total",
    totalBatteryStorage: "Almacenamiento total de baterías",
    energyTrips: "Veces desconectado",
    basicPowerPlants: "Plantas de energía básicas",
    advancedPowerPlants: "Plantas de energía avanzadas",
    solarPowerPlants: "Plantas de energía solar",
    sodiumIonBatteries: "Baterías de iones de sodio",
    battery2: "Batería2 (ion-litio)",
    battery3: "Batería3 (matriz de condensadores estelares)",
    notApplicable: "No disponible",
  },
  pt: {
    energySection: "Energia",
    powerCurrent: "Energia elétrica",
    totalEnergy: "Energia total",
    totalProduction: "Produção total",
    totalConsumption: "Consumo total",
    totalBatteryStorage: "Armazenamento total das baterias",
    energyTrips: "Vezes desarmada",
    basicPowerPlants: "Usinas de energia básicas",
    advancedPowerPlants: "Usinas de energia avançadas",
    solarPowerPlants: "Usinas de energia solar",
    sodiumIonBatteries: "Baterias de íons de sódio",
    battery2: "Bateria2 (íons de lítio)",
    battery3: "Bateria3 (conjunto de capacitores estelares)",
    notApplicable: "Não aplicável",
  },
  de: {
    energySection: "Energie",
    powerCurrent: "Stromversorgung",
    totalEnergy: "Gesamtenergie",
    totalProduction: "Gesamtproduktion",
    totalConsumption: "Gesamtverbrauch",
    totalBatteryStorage: "Gesamter Batteriespeicher",
    energyTrips: "Abschaltungen",
    basicPowerPlants: "Einfache Kraftwerke",
    advancedPowerPlants: "Fortgeschrittene Kraftwerke",
    solarPowerPlants: "Solarkraftwerke",
    sodiumIonBatteries: "Natrium-Ionen-Batterien",
    battery2: "Batterie2 (Lithium-Ionen)",
    battery3: "Batterie3 (Stellar-Kondensatorfeld)",
    notApplicable: "Nicht zutreffend",
  },
  it: {
    energySection: "Energia",
    powerCurrent: "Alimentazione",
    totalEnergy: "Energia totale",
    totalProduction: "Produzione totale",
    totalConsumption: "Consumo totale",
    totalBatteryStorage: "Capacità totale delle batterie",
    energyTrips: "Volte scattato",
    basicPowerPlants: "Centrali elettriche di base",
    advancedPowerPlants: "Centrali elettriche avanzate",
    solarPowerPlants: "Centrali solari",
    sodiumIonBatteries: "Batterie agli ioni di sodio",
    battery2: "Batteria2 (ioni di litio)",
    battery3: "Batteria3 (array di condensatori stellari)",
    notApplicable: "Non applicabile",
  },
  fr: {
    energySection: "Énergie",
    powerCurrent: "Alimentation",
    totalEnergy: "Énergie totale",
    totalProduction: "Production totale",
    totalConsumption: "Consommation totale",
    totalBatteryStorage: "Capacité totale des batteries",
    energyTrips: "Déclenchements",
    basicPowerPlants: "Centrales électriques de base",
    advancedPowerPlants: "Centrales électriques avancées",
    solarPowerPlants: "Centrales solaires",
    sodiumIonBatteries: "Batteries sodium-ion",
    battery2: "Batterie2 (lithium-ion)",
    battery3: "Batterie3 (réseau de condensateurs stellaires)",
    notApplicable: "Sans objet",
  },
};

export function energyStatisticLabel(locale: LocaleId, id: EnergyStatisticId): string {
  return labels[locale][id];
}

export const LOCALIZATION_VALIDATION_DATA = { labels } as const;
