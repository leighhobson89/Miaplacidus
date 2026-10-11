import type { EconomicGoodId, LocaleId } from "../content/ids";

/** Exact localized optionDesc action text from Cosmic Forge's localization.json. */
export const ECONOMY_ACTION_HELP_MESSAGES = {
  en: {
    optionDescCarbonAutoBuyer1Content1: "Buy a miner to automate the collection of Carbon.",
    optionDescCarbonAutoBuyer2Content1:
      "Install an Advanced Carbon Miner for improved Carbon extraction - Power:",
    optionDescCarbonAutoBuyer3Content1:
      "Add a Carbon Refinery to maximize automated Carbon collection - Power:",
    optionDescCarbonAutoBuyer4Content1:
      "Add a Quantum Carbon Synthesizer for cutting-edge Carbon generation - Power:",
    optionDescCarbonSellContent1: "Here you can sell Carbon for cash",
    optionDescCarbonSellContent2: "Here you can sell Carbon for cash or fuse it into Neon",
    optionDescCarbonStorageContent1: "Expand your Carbon storage.",
    optionDescConcreteAutoBuyer1Content1: "Add a Concrete Mixer to automate Concrete production.",
    optionDescConcreteAutoBuyer2Content1:
      "Install an Advanced Concrete Mixer for enhanced Concrete production - Power:",
    optionDescConcreteAutoBuyer3Content1:
      "Add a Concrete Refinery to maximize Concrete automation - Power:",
    optionDescConcreteAutoBuyer4Content1:
      "Add a Quantum Concrete Synthesizer for cutting-edge Concrete production - Power:",
    optionDescConcreteCreateContent1:
      "Here you can create Concrete, provided you have the materials, and the power is ON.",
    optionDescConcreteSellContent1: "Here you can sell Concrete for cash.",
    optionDescConcreteStorageContent1:
      "Upgrade your Concrete storage capacity to hold more resources.",
    optionDescDieselAutoBuyer1Content1: "Add an Extractor to collect oil and make Diesel.",
    optionDescDieselAutoBuyer2Content1:
      "Add an Advanced Diesel Refinery for enhanced Diesel production - Power:",
    optionDescDieselAutoBuyer3Content1:
      "Install a Diesel Synthesizer for improved Diesel automation - Power:",
    optionDescDieselAutoBuyer4Content1:
      "Add a Quantum Diesel Synthesizer for cutting-edge Diesel generation - Power:",
    optionDescDieselCreateContent1:
      "Here you can create Diesel from its constituent parts, provided you have them, and the power is ON.",
    optionDescDieselSellContent1: "Here you can sell Diesel for cash.",
    optionDescDieselStorageContent1: "Upgrade your Diesel storage capacity to hold more resources.",
    optionDescGlassAutoBuyer1Content1: "Add a Workshop Glass Fabricator to create glass.",
    optionDescGlassAutoBuyer2Content1:
      "Install an Advanced Glass Fabricator for better Glass production - Power:",
    optionDescGlassAutoBuyer3Content1: "Add a Glass Refinery to enhance Glass automation - Power:",
    optionDescGlassAutoBuyer4Content1:
      "Add a Quantum Glass Synthesizer for cutting-edge Glass production - Power:",
    optionDescGlassCreateContent1:
      "Here you can create Glass from its constituent parts, provided you have them, and the power is ON.",
    optionDescGlassSellContent1: "Here you can sell Glass for cash.",
    optionDescGlassStorageContent1: "Upgrade your Glass storage capacity to hold more resources.",
    optionDescHeliumAutoBuyer1Content1:
      "Helium seems lighter than air - add an Atmosphere Scraper to automate Helium collection.",
    optionDescHeliumAutoBuyer2Content1:
      "Add an Advanced Helium Scraper for enhanced Helium collection - Power:",
    optionDescHeliumAutoBuyer3Content1:
      "Install a Helium Refinery to improve automation of Helium generation - Power:",
    optionDescHeliumAutoBuyer4Content1:
      "Add a Quantum Helium Synthesizer for cutting-edge Helium production - Power:",
    optionDescHeliumSellContent1: "Here you can sell Helium for cash",
    optionDescHeliumSellContent2: "Here you can sell Helium for cash or fuse it into Carbon",
    optionDescHeliumStorageContent1: "Increase your Helium storage capacity to store more Helium.",
    optionDescHydrogenAutoBuyer1Content1:
      "Add a Hydrogen Compressor to automate Hydrogen generation.",
    optionDescHydrogenAutoBuyer2Content1:
      "Add an Advanced Hydrogen Compressor for enhanced automation - Power:",
    optionDescHydrogenAutoBuyer3Content1:
      "Install a Hydrogen Refinery to maximize efficiency in Hydrogen generation - Power:",
    optionDescHydrogenAutoBuyer4Content1:
      "Add a Quantum Hydrogen Synthesizer for cutting-edge Hydrogen production - Power:",
    optionDescHydrogenSellContent1: "Here you can sell Hydrogen for cash",
    optionDescHydrogenSellContent2: "Here you can sell Hydrogen for cash or fuse it into Helium",
    optionDescHydrogenStorageContent1:
      "Upgrade your Hydrogen storage capacity to hold more resources.",
    optionDescIronAutoBuyer1Content1: "Add an Iron Extractor to automate Iron generation.",
    optionDescIronAutoBuyer2Content1:
      "Add an Advanced Iron Extractor for enhanced Iron collection - Power:",
    optionDescIronAutoBuyer3Content1:
      "Install an Iron Refinery to maximize Iron production automation - Power:",
    optionDescIronAutoBuyer4Content1:
      "Add a Quantum Iron Synthesizer for advanced Iron generation - Power:",
    optionDescIronSellContent1: "Here you can sell Iron for cash.",
    optionDescIronStorageContent1: "Upgrade your Iron storage capacity to hold more resources.",
    optionDescNeonAutoBuyer1Content1: "Add an Neon Extractor to automate Neon generation.",
    optionDescNeonAutoBuyer2Content1:
      "Add an Advanced Neon Extractor to improve automation of Neon collection - Power:",
    optionDescNeonAutoBuyer3Content1: "Install a Neon Refinery to enhance Neon collection - Power:",
    optionDescNeonAutoBuyer4Content1:
      "Add a Quantum Neon Synthesizer for cutting-edge Neon production - Power:",
    optionDescNeonSellContent1: "Here you can sell Neon for cash",
    optionDescNeonSellContent2: "Here you can sell Neon for cash or fuse it into Oxygen",
    optionDescNeonStorageContent1: "Upgrade your Neon storage capacity to hold more resources.",
    optionDescOxygenAutoBuyer1Content1: "Add an Oxygen Extractor to automate Oxygen generation.",
    optionDescOxygenAutoBuyer2Content1:
      "Install an Advanced Oxygen Extractor for improved Oxygen generation - Power:",
    optionDescOxygenAutoBuyer3Content1:
      "Add an Oxygen Refinery to maximize automation of Oxygen production - Power:",
    optionDescOxygenAutoBuyer4Content1:
      "Add a Quantum Oxygen Synthesizer for advanced Oxygen generation - Power:",
    optionDescOxygenSellContent1: "Here you can sell Oxygen for cash.",
    optionDescOxygenSellContent2: "Here you can sell Oxygen for cash or fuse it into Silicon.",
    optionDescOxygenStorageContent1: "Upgrade your Oxygen storage capacity to hold more resources.",
    optionDescSiliconAutoBuyer1Content1: "Add a Silicon Extractor to automate Silicon generation.",
    optionDescSiliconAutoBuyer2Content1:
      "Add an Advanced Silicon Extractor for improved Silicon collection - Power:",
    optionDescSiliconAutoBuyer3Content1:
      "Install a Silicon Refinery to maximize Silicon automation - Power:",
    optionDescSiliconAutoBuyer4Content1:
      "Add a Quantum Silicon Synthesizer for cutting-edge Silicon production - Power:",
    optionDescSiliconSellContent1: "Here you can sell Silicon for cash.",
    optionDescSiliconSellContent2: "Here you can sell Silicon for cash or fuse it into Iron.",
    optionDescSiliconStorageContent1:
      "Upgrade your Silicon storage capacity to hold more resources.",
    optionDescSodiumAutoBuyer1Content1: "Add a Sodium Extractor to automate Sodium generation.",
    optionDescSodiumAutoBuyer2Content1:
      "Add an Advanced Sodium Extractor for better Sodium automation - Power:",
    optionDescSodiumAutoBuyer3Content1:
      "Install a Sodium Refinery to boost Sodium production - Power:",
    optionDescSodiumAutoBuyer4Content1:
      "Add a Quantum Sodium Synthesizer for advanced Sodium generation - Power:",
    optionDescSodiumSellContent1: "Here you can sell Sodium for cash.",
    optionDescSodiumStorageContent1: "Upgrade your Sodium storage capacity to hold more resources.",
    optionDescSteelAutoBuyer1Content1: "Add a Back Yard Steel Foundry to create steel.",
    optionDescSteelAutoBuyer2Content1:
      "Add an Advanced Steel Foundry for enhanced Steel production - Power:",
    optionDescSteelAutoBuyer3Content1:
      "Install a Steel Refinery to improve Steel automation - Power:",
    optionDescSteelAutoBuyer4Content1:
      "Add a Quantum Steel Synthesizer for advanced Steel generation - Power:",
    optionDescSteelCreateContent1:
      "Here you can create Steel from its constituent parts, provided you have them, and the power is ON.",
    optionDescSteelSellContent1: "Here you can sell Steel for cash.",
    optionDescSteelStorageContent1: "Upgrade your Steel storage capacity to hold more resources.",
    optionDescTitaniumAutoBuyer1Content1: "Add a Titanium Mixer to automate Titanium production.",
    optionDescTitaniumAutoBuyer2Content1:
      "Install an Advanced Titanium Mixer for enhanced Titanium production - Power:",
    optionDescTitaniumAutoBuyer3Content1:
      "Add a Titanium Refinery to maximize Titanium automation - Power:",
    optionDescTitaniumAutoBuyer4Content1:
      "Add a Quantum Titanium Synthesizer for cutting-edge Titanium production - Power:",
    optionDescTitaniumCreateContent1:
      "Here you can create Titanium, provided you have the materials, and the power is ON.",
    optionDescTitaniumSellContent1: "Here you can sell Titanium for cash.",
    optionDescTitaniumStorageContent1:
      "Upgrade your Titanium storage capacity to hold more resources.",
    optionDescWaterAutoBuyer1Content1: "Add a Water Mixer to facilitate water processing.",
    optionDescWaterAutoBuyer2Content1:
      "Add an Advanced Water Mixer for better Water production - Power:",
    optionDescWaterAutoBuyer3Content1:
      "Install a Water Refinery to maximize Water automation - Power:",
    optionDescWaterAutoBuyer4Content1:
      "Add a Quantum Water Synthesizer for advanced Water generation - Power:",
    optionDescWaterCreateContent1:
      "Here you can manage the production of Water, provided you have the materials, and the power is ON.",
    optionDescWaterSellContent1: "Here you can sell Water for cash.",
    optionDescWaterStorageContent1: "Upgrade your Water reservoir capacity to store more water.",
  },
  es: {
    optionDescCarbonAutoBuyer1Content1:
      "Compra un minero para automatizar la recolección de Carbono.",
    optionDescCarbonAutoBuyer2Content1:
      "Instala un Minero Avanzado de Carbono para extracción mejorada de Carbono - Energía:",
    optionDescCarbonAutoBuyer3Content1:
      "Añade una Refinería de Carbono para maximizar la recolección automatizada de Carbono - Energía:",
    optionDescCarbonAutoBuyer4Content1:
      "Añade un Sintetizador Cuántico de Carbono para generación de vanguardia de Carbono - Energía:",
    optionDescCarbonSellContent1: "Aquí puedes vender Carbono por dinero",
    optionDescCarbonSellContent2: "Aquí puedes vender Carbono por dinero o fusionarlo en Neón",
    optionDescCarbonStorageContent1: "Expandir tu almacenamiento de Carbono.",
    optionDescConcreteAutoBuyer1Content1:
      "Añade un Mezclador de Hormigón para automatizar la producción de Hormigón.",
    optionDescConcreteAutoBuyer2Content1:
      "Instala un Mezclador Avanzado de Hormigón para producción mejorada de Hormigón - Energía:",
    optionDescConcreteAutoBuyer3Content1:
      "Añade una Refinería de Hormigón para maximizar la automatización de Hormigón - Energía:",
    optionDescConcreteAutoBuyer4Content1:
      "Añade un Sintetizador Cuántico de Hormigón para producción de vanguardia de Hormigón - Energía:",
    optionDescConcreteCreateContent1:
      "Aquí puedes crear Hormigón, siempre que tengas los materiales y la energía esté ENCENDIDA.",
    optionDescConcreteSellContent1: "Aquí puedes vender Hormigón por dinero.",
    optionDescConcreteStorageContent1:
      "Mejora tu capacidad de almacenamiento de Hormigón para guardar más recursos.",
    optionDescDieselAutoBuyer1Content1:
      "Añade un Extractor para recolectar petróleo y hacer Diésel.",
    optionDescDieselAutoBuyer2Content1:
      "Añade una Refinería Avanzada de Diésel para producción mejorada de Diésel - Energía:",
    optionDescDieselAutoBuyer3Content1:
      "Instala un Sintetizador de Diésel para automatización mejorada de Diésel - Energía:",
    optionDescDieselAutoBuyer4Content1:
      "Añade un Sintetizador Cuántico de Diésel para generación de vanguardia de Diésel - Energía:",
    optionDescDieselCreateContent1:
      "Aquí puedes crear Diésel a partir de sus partes constituyentes, siempre que las tengas y la energía esté ENCENDIDA.",
    optionDescDieselSellContent1: "Aquí puedes vender Diésel por dinero.",
    optionDescDieselStorageContent1:
      "Mejora tu capacidad de almacenamiento de Diésel para guardar más recursos.",
    optionDescGlassAutoBuyer1Content1: "Añade un Fabricador de Vidrio de Taller para crear vidrio.",
    optionDescGlassAutoBuyer2Content1:
      "Instala un Fabricador Avanzado de Vidrio para mejor producción de Vidrio - Energía:",
    optionDescGlassAutoBuyer3Content1:
      "Añade una Refinería de Vidrio para mejorar la automatización de Vidrio - Energía:",
    optionDescGlassAutoBuyer4Content1:
      "Añade un Sintetizador Cuántico de Vidrio para producción de vanguardia de Vidrio - Energía:",
    optionDescGlassCreateContent1:
      "Aquí puedes crear Vidrio a partir de sus partes constituyentes, siempre que las tengas y la energía esté ENCENDIDA.",
    optionDescGlassSellContent1: "Aquí puedes vender Vidrio por dinero.",
    optionDescGlassStorageContent1:
      "Mejora tu capacidad de almacenamiento de Vidrio para guardar más recursos.",
    optionDescHeliumAutoBuyer1Content1:
      "El Helio parece más ligero que el aire - añade un Rascador de Atmósfera para automatizar la recolección de Helio.",
    optionDescHeliumAutoBuyer2Content1:
      "Añade un Rascador Avanzado de Helio para recolección mejorada de Helio - Energía:",
    optionDescHeliumAutoBuyer3Content1:
      "Instala una Refinería de Helio para mejorar la automatización de la generación de Helio - Energía:",
    optionDescHeliumAutoBuyer4Content1:
      "Añade un Sintetizador Cuántico de Helio para producción de vanguardia de Helio - Energía:",
    optionDescHeliumSellContent1: "Aquí puedes vender Helio por dinero",
    optionDescHeliumSellContent2: "Aquí puedes vender Helio por dinero o fusionarlo en Carbono",
    optionDescHeliumStorageContent1:
      "Aumenta tu capacidad de almacenamiento de Helio para guardar más Helio.",
    optionDescHydrogenAutoBuyer1Content1:
      "Añade un Compresor de Hidrógeno para automatizar la generación de Hidrógeno.",
    optionDescHydrogenAutoBuyer2Content1:
      "Añade un Compresor Avanzado de Hidrógeno para automatización mejorada - Energía:",
    optionDescHydrogenAutoBuyer3Content1:
      "Instala una Refinería de Hidrógeno para maximizar la eficiencia en la generación de Hidrógeno - Energía:",
    optionDescHydrogenAutoBuyer4Content1:
      "Añade un Sintetizador Cuántico de Hidrógeno para producción de vanguardia de Hidrógeno - Energía:",
    optionDescHydrogenSellContent1: "Aquí puedes vender Hidrógeno por dinero",
    optionDescHydrogenSellContent2: "Aquí puedes vender Hidrógeno por dinero o fusionarlo en Helio",
    optionDescHydrogenStorageContent1:
      "Mejora tu capacidad de almacenamiento de Hidrógeno para guardar más recursos.",
    optionDescIronAutoBuyer1Content1:
      "Añade un Extractor de Hierro para automatizar la generación de Hierro.",
    optionDescIronAutoBuyer2Content1:
      "Añade un Extractor Avanzado de Hierro para recolección mejorada de Hierro - Energía:",
    optionDescIronAutoBuyer3Content1:
      "Instala una Refinería de Hierro para maximizar la automatización de la producción de Hierro - Energía:",
    optionDescIronAutoBuyer4Content1:
      "Añade un Sintetizador Cuántico de Hierro para generación avanzada de Hierro - Energía:",
    optionDescIronSellContent1: "Aquí puedes vender Hierro por dinero.",
    optionDescIronStorageContent1:
      "Mejora tu capacidad de almacenamiento de Hierro para guardar más recursos.",
    optionDescNeonAutoBuyer1Content1:
      "Añade un Extractor de Neón para automatizar la generación de Neón.",
    optionDescNeonAutoBuyer2Content1:
      "Añade un Extractor Avanzado de Neón para mejorar la automatización de la recolección de Neón - Energía:",
    optionDescNeonAutoBuyer3Content1:
      "Instala una Refinería de Neón para mejorar la recolección de Neón - Energía:",
    optionDescNeonAutoBuyer4Content1:
      "Añade un Sintetizador Cuántico de Neón para producción de vanguardia de Neón - Energía:",
    optionDescNeonSellContent1: "Aquí puedes vender Neón por dinero",
    optionDescNeonSellContent2: "Aquí puedes vender Neón por dinero o fusionarlo en Oxígeno",
    optionDescNeonStorageContent1:
      "Mejora tu capacidad de almacenamiento de Neón para guardar más recursos.",
    optionDescOxygenAutoBuyer1Content1:
      "Añade un Extractor de Oxígeno para automatizar la generación de Oxígeno.",
    optionDescOxygenAutoBuyer2Content1:
      "Instala un Extractor Avanzado de Oxígeno para generación mejorada de Oxígeno - Energía:",
    optionDescOxygenAutoBuyer3Content1:
      "Añade una Refinería de Oxígeno para maximizar la automatización de la producción de Oxígeno - Energía:",
    optionDescOxygenAutoBuyer4Content1:
      "Añade un Sintetizador Cuántico de Oxígeno para generación avanzada de Oxígeno - Energía:",
    optionDescOxygenSellContent1: "Aquí puedes vender Oxígeno por dinero.",
    optionDescOxygenSellContent2: "Aquí puedes vender Oxígeno por dinero o fusionarlo en Silicio.",
    optionDescOxygenStorageContent1:
      "Mejora tu capacidad de almacenamiento de Oxígeno para guardar más recursos.",
    optionDescSiliconAutoBuyer1Content1:
      "Añade un Extractor de Silicio para automatizar la generación de Silicio.",
    optionDescSiliconAutoBuyer2Content1:
      "Añade un Extractor Avanzado de Silicio para recolección mejorada de Silicio - Energía:",
    optionDescSiliconAutoBuyer3Content1:
      "Instala una Refinería de Silicio para maximizar la automatización de Silicio - Energía:",
    optionDescSiliconAutoBuyer4Content1:
      "Añade un Sintetizador Cuántico de Silicio para producción de vanguardia de Silicio - Energía:",
    optionDescSiliconSellContent1: "Aquí puedes vender Silicio por dinero.",
    optionDescSiliconSellContent2: "Aquí puedes vender Silicio por dinero o fusionarlo en Hierro.",
    optionDescSiliconStorageContent1:
      "Mejora tu capacidad de almacenamiento de Silicio para guardar más recursos.",
    optionDescSodiumAutoBuyer1Content1:
      "Añade un Extractor de Sodio para automatizar la generación de Sodio.",
    optionDescSodiumAutoBuyer2Content1:
      "Añade un Extractor Avanzado de Sodio para mejor automatización de Sodio - Energía:",
    optionDescSodiumAutoBuyer3Content1:
      "Instala una Refinería de Sodio para aumentar la producción de Sodio - Energía:",
    optionDescSodiumAutoBuyer4Content1:
      "Añade un Sintetizador Cuántico de Sodio para generación avanzada de Sodio - Energía:",
    optionDescSodiumSellContent1: "Aquí puedes vender Sodio por dinero.",
    optionDescSodiumStorageContent1:
      "Mejora tu capacidad de almacenamiento de Sodio para guardar más recursos.",
    optionDescSteelAutoBuyer1Content1:
      "Añade una Fundición de Acero en el Patio Trasero para crear acero.",
    optionDescSteelAutoBuyer2Content1:
      "Añade una Fundición Avanzada de Acero para producción mejorada de Acero - Energía:",
    optionDescSteelAutoBuyer3Content1:
      "Instala una Refinería de Acero para mejorar la automatización de Acero - Energía:",
    optionDescSteelAutoBuyer4Content1:
      "Añade un Sintetizador Cuántico de Acero para generación avanzada de Acero - Energía:",
    optionDescSteelCreateContent1:
      "Aquí puedes crear Acero a partir de sus partes constituyentes, siempre que las tengas y la energía esté ENCENDIDA.",
    optionDescSteelSellContent1: "Aquí puedes vender Acero por dinero.",
    optionDescSteelStorageContent1:
      "Mejora tu capacidad de almacenamiento de Acero para guardar más recursos.",
    optionDescTitaniumAutoBuyer1Content1:
      "Añade un Mezclador de Titanio para automatizar la producción de Titanio.",
    optionDescTitaniumAutoBuyer2Content1:
      "Instala un Mezclador Avanzado de Titanio para producción mejorada de Titanio - Energía:",
    optionDescTitaniumAutoBuyer3Content1:
      "Añade una Refinería de Titanio para maximizar la automatización de Titanio - Energía:",
    optionDescTitaniumAutoBuyer4Content1:
      "Añade un Sintetizador Cuántico de Titanio para producción de vanguardia de Titanio - Energía:",
    optionDescTitaniumCreateContent1:
      "Aquí puedes crear Titanio, siempre que tengas los materiales y la energía esté ENCENDIDA.",
    optionDescTitaniumSellContent1: "Aquí puedes vender Titanio por dinero.",
    optionDescTitaniumStorageContent1:
      "Mejora tu capacidad de almacenamiento de Titanio para guardar más recursos.",
    optionDescWaterAutoBuyer1Content1:
      "Añade un Mezclador de Agua para facilitar el procesamiento de agua.",
    optionDescWaterAutoBuyer2Content1:
      "Añade un Mezclador Avanzado de Agua para mejor producción de Agua - Energía:",
    optionDescWaterAutoBuyer3Content1:
      "Instala una Refinería de Agua para maximizar la automatización de Agua - Energía:",
    optionDescWaterAutoBuyer4Content1:
      "Añade un Sintetizador Cuántico de Agua para generación avanzada de Agua - Energía:",
    optionDescWaterCreateContent1:
      "Aquí puedes gestionar la producción de Agua, siempre que tengas los materiales y la energía esté ENCENDIDA.",
    optionDescWaterSellContent1: "Aquí puedes vender Agua por dinero.",
    optionDescWaterStorageContent1:
      "Mejora la capacidad de tu reservorio de Agua para almacenar más agua.",
  },
  pt: {
    optionDescCarbonAutoBuyer1Content1: "Compre um minerador para automatizar a coleta de Carbono.",
    optionDescCarbonAutoBuyer2Content1:
      "Instale um Minerador Avançado de Carbono para extração aprimorada de Carbono - Energia:",
    optionDescCarbonAutoBuyer3Content1:
      "Adicione uma Refinaria de Carbono para maximizar a coleta automatizada de Carbono - Energia:",
    optionDescCarbonAutoBuyer4Content1:
      "Adicione um Sintetizador Quântico de Carbono para geração de ponta de Carbono - Energia:",
    optionDescCarbonSellContent1: "Aqui você pode vender Carbono por dinheiro",
    optionDescCarbonSellContent2:
      "Aqui você pode vender Carbono por dinheiro ou fundi-lo em Neônio",
    optionDescCarbonStorageContent1: "Expanda seu armazenamento de Carbono.",
    optionDescConcreteAutoBuyer1Content1:
      "Adicione um Misturador de Concreto para automatizar a produção de Concreto.",
    optionDescConcreteAutoBuyer2Content1:
      "Instale um Misturador Avançado de Concreto para produção aprimorada de Concreto - Energia:",
    optionDescConcreteAutoBuyer3Content1:
      "Adicione uma Refinaria de Concreto para maximizar a automação do Concreto - Energia:",
    optionDescConcreteAutoBuyer4Content1:
      "Adicione um Sintetizador Quântico de Concreto para produção de ponta de Concreto - Energia:",
    optionDescConcreteCreateContent1:
      "Aqui você pode criar Concreto, desde que tenha os materiais e a energia esteja LIGADA.",
    optionDescConcreteSellContent1: "Aqui você pode vender Concreto por dinheiro.",
    optionDescConcreteStorageContent1:
      "Melhore sua capacidade de armazenamento de Concreto para guardar mais recursos.",
    optionDescDieselAutoBuyer1Content1:
      "Adicione um Extrator para coletar petróleo e produzir Diesel.",
    optionDescDieselAutoBuyer2Content1:
      "Adicione uma Refinaria Avançada de Diesel para produção aprimorada de Diesel - Energia:",
    optionDescDieselAutoBuyer3Content1:
      "Instale um Sintetizador de Diesel para automação aprimorada de Diesel - Energia:",
    optionDescDieselAutoBuyer4Content1:
      "Adicione um Sintetizador Quântico de Diesel para geração de ponta de Diesel - Energia:",
    optionDescDieselCreateContent1:
      "Aqui você pode criar Diesel a partir de seus componentes, desde que os tenha e a energia esteja LIGADA.",
    optionDescDieselSellContent1: "Aqui você pode vender Diesel por dinheiro.",
    optionDescDieselStorageContent1:
      "Melhore sua capacidade de armazenamento de Diesel para guardar mais recursos.",
    optionDescGlassAutoBuyer1Content1:
      "Adicione um Fabricador de Vidro de Oficina para criar vidro.",
    optionDescGlassAutoBuyer2Content1:
      "Instale um Fabricador Avançado de Vidro para melhor produção de Vidro - Energia:",
    optionDescGlassAutoBuyer3Content1:
      "Adicione uma Refinaria de Vidro para melhorar a automação do Vidro - Energia:",
    optionDescGlassAutoBuyer4Content1:
      "Adicione um Sintetizador Quântico de Vidro para produção de ponta de Vidro - Energia:",
    optionDescGlassCreateContent1:
      "Aqui você pode criar Vidro a partir de seus componentes, desde que os tenha e a energia esteja LIGADA.",
    optionDescGlassSellContent1: "Aqui você pode vender Vidro por dinheiro.",
    optionDescGlassStorageContent1:
      "Melhore sua capacidade de armazenamento de Vidro para guardar mais recursos.",
    optionDescHeliumAutoBuyer1Content1:
      "O Hélio parece mais leve que o ar - adicione um Raspador de Atmosfera para automatizar a coleta de Hélio.",
    optionDescHeliumAutoBuyer2Content1:
      "Adicione um Raspador Avançado de Hélio para coleta aprimorada de Hélio - Energia:",
    optionDescHeliumAutoBuyer3Content1:
      "Instale uma Refinaria de Hélio para melhorar a automação da geração de Hélio - Energia:",
    optionDescHeliumAutoBuyer4Content1:
      "Adicione um Sintetizador Quântico de Hélio para produção de ponta de Hélio - Energia:",
    optionDescHeliumSellContent1: "Aqui você pode vender Hélio por dinheiro",
    optionDescHeliumSellContent2: "Aqui você pode vender Hélio por dinheiro ou fundi-lo em Carbono",
    optionDescHeliumStorageContent1:
      "Aumente sua capacidade de armazenamento de Hélio para guardar mais Hélio.",
    optionDescHydrogenAutoBuyer1Content1:
      "Adicione um Compressor de Hidrogênio para automatizar a geração de Hidrogênio.",
    optionDescHydrogenAutoBuyer2Content1:
      "Adicione um Compressor Avançado de Hidrogênio para automação aprimorada - Energia:",
    optionDescHydrogenAutoBuyer3Content1:
      "Instale uma Refinaria de Hidrogênio para maximizar a eficiência na geração de Hidrogênio - Energia:",
    optionDescHydrogenAutoBuyer4Content1:
      "Adicione um Sintetizador Quântico de Hidrogênio para produção de ponta de Hidrogênio - Energia:",
    optionDescHydrogenSellContent1: "Aqui você pode vender Hidrogênio por dinheiro",
    optionDescHydrogenSellContent2:
      "Aqui você pode vender Hidrogênio por dinheiro ou fundi-lo em Hélio",
    optionDescHydrogenStorageContent1:
      "Melhore sua capacidade de armazenamento de Hidrogênio para guardar mais recursos.",
    optionDescIronAutoBuyer1Content1:
      "Adicione um Extrator de Ferro para automatizar a geração de Ferro.",
    optionDescIronAutoBuyer2Content1:
      "Adicione um Extrator Avançado de Ferro para coleta aprimorada de Ferro - Energia:",
    optionDescIronAutoBuyer3Content1:
      "Instale uma Refinaria de Ferro para maximizar a automação da produção de Ferro - Energia:",
    optionDescIronAutoBuyer4Content1:
      "Adicione um Sintetizador Quântico de Ferro para geração avançada de Ferro - Energia:",
    optionDescIronSellContent1: "Aqui você pode vender Ferro por dinheiro.",
    optionDescIronStorageContent1:
      "Melhore sua capacidade de armazenamento de Ferro para guardar mais recursos.",
    optionDescNeonAutoBuyer1Content1:
      "Adicione um Extrator de Neônio para automatizar a geração de Neônio.",
    optionDescNeonAutoBuyer2Content1:
      "Adicione um Extrator Avançado de Neônio para melhorar a automação da coleta de Neônio - Energia:",
    optionDescNeonAutoBuyer3Content1:
      "Instale uma Refinaria de Neônio para melhorar a coleta de Neônio - Energia:",
    optionDescNeonAutoBuyer4Content1:
      "Adicione um Sintetizador Quântico de Neônio para produção de ponta de Neônio - Energia:",
    optionDescNeonSellContent1: "Aqui você pode vender Neônio por dinheiro",
    optionDescNeonSellContent2: "Aqui você pode vender Neônio por dinheiro ou fundi-lo em Oxigênio",
    optionDescNeonStorageContent1:
      "Melhore sua capacidade de armazenamento de Neônio para guardar mais recursos.",
    optionDescOxygenAutoBuyer1Content1:
      "Adicione um Extrator de Oxigênio para automatizar a geração de Oxigênio.",
    optionDescOxygenAutoBuyer2Content1:
      "Instale um Extrator Avançado de Oxigênio para geração aprimorada de Oxigênio - Energia:",
    optionDescOxygenAutoBuyer3Content1:
      "Adicione uma Refinaria de Oxigênio para maximizar a automação da produção de Oxigênio - Energia:",
    optionDescOxygenAutoBuyer4Content1:
      "Adicione um Sintetizador Quântico de Oxigênio para geração avançada de Oxigênio - Energia:",
    optionDescOxygenSellContent1: "Aqui você pode vender Oxigênio por dinheiro.",
    optionDescOxygenSellContent2:
      "Aqui você pode vender Oxigênio por dinheiro ou fundi-lo em Silício.",
    optionDescOxygenStorageContent1:
      "Melhore sua capacidade de armazenamento de Oxigênio para guardar mais recursos.",
    optionDescSiliconAutoBuyer1Content1:
      "Adicione um Extrator de Silício para automatizar a geração de Silício.",
    optionDescSiliconAutoBuyer2Content1:
      "Adicione um Extrator Avançado de Silício para coleta aprimorada de Silício - Energia:",
    optionDescSiliconAutoBuyer3Content1:
      "Instale uma Refinaria de Silício para maximizar a automação do Silício - Energia:",
    optionDescSiliconAutoBuyer4Content1:
      "Adicione um Sintetizador Quântico de Silício para produção de ponta de Silício - Energia:",
    optionDescSiliconSellContent1: "Aqui você pode vender Silício por dinheiro.",
    optionDescSiliconSellContent2:
      "Aqui você pode vender Silício por dinheiro ou fundi-lo em Ferro.",
    optionDescSiliconStorageContent1:
      "Melhore sua capacidade de armazenamento de Silício para guardar mais recursos.",
    optionDescSodiumAutoBuyer1Content1:
      "Adicione um Extrator de Sódio para automatizar a geração de Sódio.",
    optionDescSodiumAutoBuyer2Content1:
      "Adicione um Extrator Avançado de Sódio para melhor automação do Sódio - Energia:",
    optionDescSodiumAutoBuyer3Content1:
      "Instale uma Refinaria de Sódio para aumentar a produção de Sódio - Energia:",
    optionDescSodiumAutoBuyer4Content1:
      "Adicione um Sintetizador Quântico de Sódio para geração avançada de Sódio - Energia:",
    optionDescSodiumSellContent1: "Aqui você pode vender Sódio por dinheiro.",
    optionDescSodiumStorageContent1:
      "Melhore sua capacidade de armazenamento de Sódio para guardar mais recursos.",
    optionDescSteelAutoBuyer1Content1: "Adicione uma Fundição de Aço no Quintal para criar aço.",
    optionDescSteelAutoBuyer2Content1:
      "Adicione uma Fundição Avançada de Aço para produção aprimorada de Aço - Energia:",
    optionDescSteelAutoBuyer3Content1:
      "Instale uma Refinaria de Aço para melhorar a automação do Aço - Energia:",
    optionDescSteelAutoBuyer4Content1:
      "Adicione um Sintetizador Quântico de Aço para geração avançada de Aço - Energia:",
    optionDescSteelCreateContent1:
      "Aqui você pode criar Aço a partir de seus componentes, desde que os tenha e a energia esteja LIGADA.",
    optionDescSteelSellContent1: "Aqui você pode vender Aço por dinheiro.",
    optionDescSteelStorageContent1:
      "Melhore sua capacidade de armazenamento de Aço para guardar mais recursos.",
    optionDescTitaniumAutoBuyer1Content1:
      "Adicione um Misturador de Titânio para automatizar a produção de Titânio.",
    optionDescTitaniumAutoBuyer2Content1:
      "Instale um Misturador Avançado de Titânio para produção aprimorada de Titânio - Energia:",
    optionDescTitaniumAutoBuyer3Content1:
      "Adicione uma Refinaria de Titânio para maximizar a automação do Titânio - Energia:",
    optionDescTitaniumAutoBuyer4Content1:
      "Adicione um Sintetizador Quântico de Titânio para produção de ponta de Titânio - Energia:",
    optionDescTitaniumCreateContent1:
      "Aqui você pode criar Titânio, desde que tenha os materiais e a energia esteja LIGADA.",
    optionDescTitaniumSellContent1: "Aqui você pode vender Titânio por dinheiro.",
    optionDescTitaniumStorageContent1:
      "Melhore sua capacidade de armazenamento de Titânio para guardar mais recursos.",
    optionDescWaterAutoBuyer1Content1:
      "Adicione um Misturador de Água para facilitar o processamento de água.",
    optionDescWaterAutoBuyer2Content1:
      "Adicione um Misturador Avançado de Água para melhor produção de Água - Energia:",
    optionDescWaterAutoBuyer3Content1:
      "Instale uma Refinaria de Água para maximizar a automação da Água - Energia:",
    optionDescWaterAutoBuyer4Content1:
      "Adicione um Sintetizador Quântico de Água para geração avançada de Água - Energia:",
    optionDescWaterCreateContent1:
      "Aqui você pode gerenciar a produção de Água, desde que tenha os materiais e a energia esteja LIGADA.",
    optionDescWaterSellContent1: "Aqui você pode vender Água por dinheiro.",
    optionDescWaterStorageContent1:
      "Melhore a capacidade do seu reservatório de Água para armazenar mais água.",
  },
  de: {
    optionDescCarbonAutoBuyer1Content1:
      "Kaufe einen Minenarbeiter, um die Kohlenstoffsammlung zu automatisieren.",
    optionDescCarbonAutoBuyer2Content1:
      "Installiere einen fortgeschrittenen Kohlenstoffminenarbeiter für verbesserte Kohlenstoffgewinnung - Leistung:",
    optionDescCarbonAutoBuyer3Content1:
      "Füge eine Kohlenstoffraffinerie hinzu, um die automatisierte Kohlenstoffsammlung zu maximieren - Leistung:",
    optionDescCarbonAutoBuyer4Content1:
      "Füge einen Quanten-Kohlenstoffsynthetisierer für hochmoderne Kohlenstoffgewinnung hinzu - Leistung:",
    optionDescCarbonSellContent1: "Hier kannst du Kohlenstoff für Bargeld verkaufen",
    optionDescCarbonSellContent2:
      "Hier kannst du Kohlenstoff für Bargeld verkaufen oder in Neon fusionieren",
    optionDescCarbonStorageContent1: "Erweitere deinen Kohlenstoffspeicher.",
    optionDescConcreteAutoBuyer1Content1:
      "Füge einen Betonmischer hinzu, um die Betonproduktion zu automatisieren.",
    optionDescConcreteAutoBuyer2Content1:
      "Installiere einen fortgeschrittenen Betonmischer für verbesserte Betonproduktion - Leistung:",
    optionDescConcreteAutoBuyer3Content1:
      "Füge eine Betonraffinerie hinzu, um die Betonautomatisierung zu maximieren - Leistung:",
    optionDescConcreteAutoBuyer4Content1:
      "Füge einen Quanten-Betonsynthetisierer für hochmoderne Betonproduktion hinzu - Leistung:",
    optionDescConcreteCreateContent1:
      "Hier kannst du Beton herstellen, vorausgesetzt du hast die Materialien und die Energie ist EINGESCHALTET.",
    optionDescConcreteSellContent1: "Hier kannst du Beton für Bargeld verkaufen.",
    optionDescConcreteStorageContent1:
      "Upgrade deine Betonspeicherkapazität, um mehr Ressourcen zu halten.",
    optionDescDieselAutoBuyer1Content1:
      "Füge einen Extraktor hinzu, um Öl zu sammeln und Diesel herzustellen.",
    optionDescDieselAutoBuyer2Content1:
      "Füge eine fortgeschrittene Dieselraffinerie für verbesserte Dieselproduktion hinzu - Leistung:",
    optionDescDieselAutoBuyer3Content1:
      "Installiere einen Dieselsynthetisierer für verbesserte Dieselautomatisierung - Leistung:",
    optionDescDieselAutoBuyer4Content1:
      "Füge einen Quanten-Dieselsynthetisierer für hochmoderne Dieselgewinnung hinzu - Leistung:",
    optionDescDieselCreateContent1:
      "Hier kannst du Diesel aus seinen Bestandteilen herstellen, vorausgesetzt du hast sie und die Energie ist EINGESCHALTET.",
    optionDescDieselSellContent1: "Hier kannst du Diesel für Bargeld verkaufen.",
    optionDescDieselStorageContent1:
      "Upgrade deine Dieselspeicherkapazität, um mehr Ressourcen zu halten.",
    optionDescGlassAutoBuyer1Content1:
      "Füge einen Werkstattglasfabrikator hinzu, um Glas herzustellen.",
    optionDescGlassAutoBuyer2Content1:
      "Installiere einen fortgeschrittenen Glasfabrikator für bessere Glasproduktion - Leistung:",
    optionDescGlassAutoBuyer3Content1:
      "Füge eine Glasraffinerie hinzu, um die Glasautomatisierung zu verbessern - Leistung:",
    optionDescGlassAutoBuyer4Content1:
      "Füge einen Quanten-Glassynthetisierer für hochmoderne Glasproduktion hinzu - Leistung:",
    optionDescGlassCreateContent1:
      "Hier kannst du Glas aus seinen Bestandteilen herstellen, vorausgesetzt du hast sie und die Energie ist EINGESCHALTET.",
    optionDescGlassSellContent1: "Hier kannst du Glas für Bargeld verkaufen.",
    optionDescGlassStorageContent1:
      "Upgrade deine Glasspeicherkapazität, um mehr Ressourcen zu halten.",
    optionDescHeliumAutoBuyer1Content1:
      "Helium scheint leichter als Luft zu sein - füge einen Atmosphärenschaber hinzu, um die Heliumsammlung zu automatisieren.",
    optionDescHeliumAutoBuyer2Content1:
      "Füge einen fortgeschrittenen Heliumschaber für verbesserte Heliumsammlung hinzu - Leistung:",
    optionDescHeliumAutoBuyer3Content1:
      "Installiere eine Heliumraffinerie, um die Automatisierung der Heliumgewinnung zu verbessern - Leistung:",
    optionDescHeliumAutoBuyer4Content1:
      "Füge einen Quanten-Heliumsynthetisierer für hochmoderne Heliumproduktion hinzu - Leistung:",
    optionDescHeliumSellContent1: "Hier kannst du Helium für Bargeld verkaufen",
    optionDescHeliumSellContent2:
      "Hier kannst du Helium für Bargeld verkaufen oder in Kohlenstoff fusionieren",
    optionDescHeliumStorageContent1:
      "Erhöhe deine Heliumspeicherkapazität, um mehr Helium zu speichern.",
    optionDescHydrogenAutoBuyer1Content1:
      "Füge einen Wasserstoffkompressor hinzu, um die Wasserstoffgewinnung zu automatisieren.",
    optionDescHydrogenAutoBuyer2Content1:
      "Füge einen fortgeschrittenen Wasserstoffkompressor für verbesserte Automatisierung hinzu - Leistung:",
    optionDescHydrogenAutoBuyer3Content1:
      "Installiere eine Wasserstoffraffinerie, um die Effizienz der Wasserstoffgewinnung zu maximieren - Leistung:",
    optionDescHydrogenAutoBuyer4Content1:
      "Füge einen Quanten-Wasserstoffsynthetisierer für hochmoderne Wasserstoffproduktion hinzu - Leistung:",
    optionDescHydrogenSellContent1: "Hier kannst du Wasserstoff für Bargeld verkaufen",
    optionDescHydrogenSellContent2:
      "Hier kannst du Wasserstoff für Bargeld verkaufen oder in Helium fusionieren",
    optionDescHydrogenStorageContent1:
      "Upgrade deine Wasserstoffspeicherkapazität, um mehr Ressourcen zu halten.",
    optionDescIronAutoBuyer1Content1:
      "Füge einen Eisen-Extraktor hinzu, um die Eisengewinnung zu automatisieren.",
    optionDescIronAutoBuyer2Content1:
      "Füge einen fortgeschrittenen Eisen-Extraktor für verbesserte Eisensammlung hinzu - Leistung:",
    optionDescIronAutoBuyer3Content1:
      "Installiere eine Eisenraffinerie, um die Eisenproduktionsautomatisierung zu maximieren - Leistung:",
    optionDescIronAutoBuyer4Content1:
      "Füge einen Quanten-Eisensynthetisierer für fortgeschrittene Eisengewinnung hinzu - Leistung:",
    optionDescIronSellContent1: "Hier kannst du Eisen für Bargeld verkaufen.",
    optionDescIronStorageContent1:
      "Upgrade deine Eisenspeicherkapazität, um mehr Ressourcen zu halten.",
    optionDescNeonAutoBuyer1Content1:
      "Füge einen Neon-Extraktor hinzu, um die Neongewinnung zu automatisieren.",
    optionDescNeonAutoBuyer2Content1:
      "Füge einen fortgeschrittenen Neon-Extraktor hinzu, um die Automatisierung der Neonsammlung zu verbessern - Leistung:",
    optionDescNeonAutoBuyer3Content1:
      "Installiere eine Neonraffinerie, um die Neonsammlung zu verbessern - Leistung:",
    optionDescNeonAutoBuyer4Content1:
      "Füge einen Quanten-Neonsynthetisierer für hochmoderne Neonproduktion hinzu - Leistung:",
    optionDescNeonSellContent1: "Hier kannst du Neon für Bargeld verkaufen",
    optionDescNeonSellContent2:
      "Hier kannst du Neon für Bargeld verkaufen oder in Sauerstoff fusionieren",
    optionDescNeonStorageContent1:
      "Upgrade deine Neonspeicherkapazität, um mehr Ressourcen zu halten.",
    optionDescOxygenAutoBuyer1Content1:
      "Füge einen Sauerstoff-Extraktor hinzu, um die Sauerstoffgewinnung zu automatisieren.",
    optionDescOxygenAutoBuyer2Content1:
      "Installiere einen fortgeschrittenen Sauerstoff-Extraktor für verbesserte Sauerstoffgewinnung - Leistung:",
    optionDescOxygenAutoBuyer3Content1:
      "Füge eine Sauerstoffraffinerie hinzu, um die Automatisierung der Sauerstoffproduktion zu maximieren - Leistung:",
    optionDescOxygenAutoBuyer4Content1:
      "Füge einen Quanten-Sauerstoffsynthetisierer für fortgeschrittene Sauerstoffgewinnung hinzu - Leistung:",
    optionDescOxygenSellContent1: "Hier kannst du Sauerstoff für Bargeld verkaufen.",
    optionDescOxygenSellContent2:
      "Hier kannst du Sauerstoff für Bargeld verkaufen oder in Silizium fusionieren.",
    optionDescOxygenStorageContent1:
      "Upgrade deine Sauerstoffspeicherkapazität, um mehr Ressourcen zu halten.",
    optionDescSiliconAutoBuyer1Content1:
      "Füge einen Silizium-Extraktor hinzu, um die Siliziumgewinnung zu automatisieren.",
    optionDescSiliconAutoBuyer2Content1:
      "Füge einen fortgeschrittenen Silizium-Extraktor für verbesserte Siliziumsammlung hinzu - Leistung:",
    optionDescSiliconAutoBuyer3Content1:
      "Installiere eine Siliziumraffinerie, um die Siliziumautomatisierung zu maximieren - Leistung:",
    optionDescSiliconAutoBuyer4Content1:
      "Füge einen Quanten-Siliziumsynthetisierer für hochmoderne Siliziumproduktion hinzu - Leistung:",
    optionDescSiliconSellContent1: "Hier kannst du Silizium für Bargeld verkaufen.",
    optionDescSiliconSellContent2:
      "Hier kannst du Silizium für Bargeld verkaufen oder in Eisen fusionieren.",
    optionDescSiliconStorageContent1:
      "Upgrade deine Siliziumspeicherkapazität, um mehr Ressourcen zu halten.",
    optionDescSodiumAutoBuyer1Content1:
      "Füge einen Natrium-Extraktor hinzu, um die Natriumgewinnung zu automatisieren.",
    optionDescSodiumAutoBuyer2Content1:
      "Füge einen fortgeschrittenen Natrium-Extraktor für bessere Natriumautomatisierung hinzu - Leistung:",
    optionDescSodiumAutoBuyer3Content1:
      "Installiere eine Natriumraffinerie, um die Natriumproduktion zu steigern - Leistung:",
    optionDescSodiumAutoBuyer4Content1:
      "Füge einen Quanten-Natriumsynthetisierer für fortgeschrittene Natriumgewinnung hinzu - Leistung:",
    optionDescSodiumSellContent1: "Hier kannst du Natrium für Bargeld verkaufen.",
    optionDescSodiumStorageContent1:
      "Upgrade deine Natriumspeicherkapazität, um mehr Ressourcen zu halten.",
    optionDescSteelAutoBuyer1Content1:
      "Füge einen Hinterhof-Stahlgießerei hinzu, um Stahl herzustellen.",
    optionDescSteelAutoBuyer2Content1:
      "Füge eine fortgeschrittene Stahlgießerei für verbesserte Stahlproduktion hinzu - Leistung:",
    optionDescSteelAutoBuyer3Content1:
      "Installiere eine Stahlraffinerie, um die Stahlautomatisierung zu verbessern - Leistung:",
    optionDescSteelAutoBuyer4Content1:
      "Füge einen Quanten-Stahlsynthetisierer für fortgeschrittene Stahlerzeugung hinzu - Leistung:",
    optionDescSteelCreateContent1:
      "Hier kannst du Stahl aus seinen Bestandteilen herstellen, vorausgesetzt du hast sie und die Energie ist EINGESCHALTET.",
    optionDescSteelSellContent1: "Hier kannst du Stahl für Bargeld verkaufen.",
    optionDescSteelStorageContent1:
      "Upgrade deine Stahlspeicherkapazität, um mehr Ressourcen zu halten.",
    optionDescTitaniumAutoBuyer1Content1:
      "Füge einen Titanmischer hinzu, um die Titanproduktion zu automatisieren.",
    optionDescTitaniumAutoBuyer2Content1:
      "Installiere einen fortgeschrittenen Titanmischer für verbesserte Titanproduktion - Leistung:",
    optionDescTitaniumAutoBuyer3Content1:
      "Füge eine Titanraffinerie hinzu, um die Titanautomatisierung zu maximieren - Leistung:",
    optionDescTitaniumAutoBuyer4Content1:
      "Füge einen Quanten-Titansynthetisierer für hochmoderne Titanproduktion hinzu - Leistung:",
    optionDescTitaniumCreateContent1:
      "Hier kannst du Titan herstellen, vorausgesetzt du hast die Materialien und die Energie ist EINGESCHALTET.",
    optionDescTitaniumSellContent1: "Hier kannst du Titan für Bargeld verkaufen.",
    optionDescTitaniumStorageContent1:
      "Upgrade deine Titanspeicherkapazität, um mehr Ressourcen zu halten.",
    optionDescWaterAutoBuyer1Content1:
      "Füge einen Wassermischer hinzu, um die Wasseraufbereitung zu erleichtern.",
    optionDescWaterAutoBuyer2Content1:
      "Füge einen fortgeschrittenen Wassermischer für bessere Wasserproduktion hinzu - Leistung:",
    optionDescWaterAutoBuyer3Content1:
      "Installiere eine Wasserraffinerie, um die Wasserautomatisierung zu maximieren - Leistung:",
    optionDescWaterAutoBuyer4Content1:
      "Füge einen Quanten-Wassersynthetisierer für fortgeschrittene Wassergewinnung hinzu - Leistung:",
    optionDescWaterCreateContent1:
      "Hier kannst du die Produktion von Wasser verwalten, vorausgesetzt du hast die Materialien und die Energie ist EINGESCHALTET.",
    optionDescWaterSellContent1: "Hier kannst du Wasser für Bargeld verkaufen.",
    optionDescWaterStorageContent1:
      "Upgrade deine Wasserreservoirkapazität, um mehr Wasser zu speichern.",
  },
  it: {
    optionDescCarbonAutoBuyer1Content1:
      "Compra un minatore per automatizzare la raccolta di Carbonio.",
    optionDescCarbonAutoBuyer2Content1:
      "Installa un Minatore Avanzato di Carbonio per estrazione migliorata di Carbonio - Potenza:",
    optionDescCarbonAutoBuyer3Content1:
      "Aggiungi una Raffineria di Carbonio per massimizzare la raccolta automatizzata di Carbonio - Potenza:",
    optionDescCarbonAutoBuyer4Content1:
      "Aggiungi un Sintetizzatore Quantico di Carbonio per generazione all'avanguardia di Carbonio - Potenza:",
    optionDescCarbonSellContent1: "Qui puoi vendere Carbonio per contanti",
    optionDescCarbonSellContent2: "Qui puoi vendere Carbonio per contanti o fondarlo in Neon",
    optionDescCarbonStorageContent1: "Espandi il tuo stoccaggio di Carbonio.",
    optionDescConcreteAutoBuyer1Content1:
      "Aggiungi un Miscelatore di Cemento per automatizzare la produzione di Cemento.",
    optionDescConcreteAutoBuyer2Content1:
      "Installa un Miscelatore Avanzato di Cemento per produzione migliorata di Cemento - Potenza:",
    optionDescConcreteAutoBuyer3Content1:
      "Aggiungi una Raffineria di Cemento per massimizzare l'automazione del Cemento - Potenza:",
    optionDescConcreteAutoBuyer4Content1:
      "Aggiungi un Sintetizzatore Quantico di Cemento per produzione all'avanguardia di Cemento - Potenza:",
    optionDescConcreteCreateContent1:
      "Qui puoi creare Cemento, a condizione che tu abbia i materiali e l'energia sia ACCESA.",
    optionDescConcreteSellContent1: "Qui puoi vendere Cemento per contanti.",
    optionDescConcreteStorageContent1:
      "Aggiorna la tua capacità di stoccaggio del Cemento per contenere più risorse.",
    optionDescDieselAutoBuyer1Content1:
      "Aggiungi un Estrattore per raccogliere petrolio e fare Diesel.",
    optionDescDieselAutoBuyer2Content1:
      "Aggiungi una Raffineria Avanzata di Diesel per produzione migliorata di Diesel - Potenza:",
    optionDescDieselAutoBuyer3Content1:
      "Installa un Sintetizzatore di Diesel per automazione migliorata di Diesel - Potenza:",
    optionDescDieselAutoBuyer4Content1:
      "Aggiungi un Sintetizzatore Quantico di Diesel per generazione all'avanguardia di Diesel - Potenza:",
    optionDescDieselCreateContent1:
      "Qui puoi creare Diesel dalle sue parti costituenti, a condizione che tu le abbia e l'energia sia ACCESA.",
    optionDescDieselSellContent1: "Qui puoi vendere Diesel per contanti.",
    optionDescDieselStorageContent1:
      "Aggiorna la tua capacità di stoccaggio del Diesel per contenere più risorse.",
    optionDescGlassAutoBuyer1Content1:
      "Aggiungi un Fabbricatore di Vetro da Officina per creare vetro.",
    optionDescGlassAutoBuyer2Content1:
      "Installa un Fabbricatore Avanzato di Vetro per migliore produzione di Vetro - Potenza:",
    optionDescGlassAutoBuyer3Content1:
      "Aggiungi una Raffineria di Vetro per migliorare l'automazione del Vetro - Potenza:",
    optionDescGlassAutoBuyer4Content1:
      "Aggiungi un Sintetizzatore Quantico di Vetro per produzione all'avanguardia di Vetro - Potenza:",
    optionDescGlassCreateContent1:
      "Qui puoi creare Vetro dalle sue parti costituenti, a condizione che tu le abbia e l'energia sia ACCESA.",
    optionDescGlassSellContent1: "Qui puoi vendere Vetro per contanti.",
    optionDescGlassStorageContent1:
      "Aggiorna la tua capacità di stoccaggio del Vetro per contenere più risorse.",
    optionDescHeliumAutoBuyer1Content1:
      "L'Elio sembra più leggero dell'aria - aggiungi un Raschiatore di Atmosfera per automatizzare la raccolta di Elio.",
    optionDescHeliumAutoBuyer2Content1:
      "Aggiungi un Raschiatore Avanzato di Elio per raccolta migliorata di Elio - Potenza:",
    optionDescHeliumAutoBuyer3Content1:
      "Installa una Raffineria di Elio per migliorare l'automazione della generazione di Elio - Potenza:",
    optionDescHeliumAutoBuyer4Content1:
      "Aggiungi un Sintetizzatore Quantico di Elio per produzione all'avanguardia di Elio - Potenza:",
    optionDescHeliumSellContent1: "Qui puoi vendere Elio per contanti",
    optionDescHeliumSellContent2: "Qui puoi vendere Elio per contanti o fondarlo in Carbonio",
    optionDescHeliumStorageContent1:
      "Aumenta la tua capacità di stoccaggio dell'Elio per immagazzinare più Elio.",
    optionDescHydrogenAutoBuyer1Content1:
      "Aggiungi un Compressore di Idrogeno per automatizzare la generazione di Idrogeno.",
    optionDescHydrogenAutoBuyer2Content1:
      "Aggiungi un Compressore Avanzato di Idrogeno per automazione migliorata - Potenza:",
    optionDescHydrogenAutoBuyer3Content1:
      "Installa una Raffineria di Idrogeno per massimizzare l'efficienza nella generazione di Idrogeno - Potenza:",
    optionDescHydrogenAutoBuyer4Content1:
      "Aggiungi un Sintetizzatore Quantico di Idrogeno per produzione all'avanguardia di Idrogeno - Potenza:",
    optionDescHydrogenSellContent1: "Qui puoi vendere Idrogeno per contanti",
    optionDescHydrogenSellContent2: "Qui puoi vendere Idrogeno per contanti o fondarlo in Elio",
    optionDescHydrogenStorageContent1:
      "Aggiorna la tua capacità di stoccaggio dell'Idrogeno per contenere più risorse.",
    optionDescIronAutoBuyer1Content1:
      "Aggiungi un Estrattore di Ferro per automatizzare la generazione di Ferro.",
    optionDescIronAutoBuyer2Content1:
      "Aggiungi un Estrattore Avanzato di Ferro per raccolta migliorata di Ferro - Potenza:",
    optionDescIronAutoBuyer3Content1:
      "Installa una Raffineria di Ferro per massimizzare l'automazione della produzione di Ferro - Potenza:",
    optionDescIronAutoBuyer4Content1:
      "Aggiungi un Sintetizzatore Quantico di Ferro per generazione avanzata di Ferro - Potenza:",
    optionDescIronSellContent1: "Qui puoi vendere Ferro per contanti.",
    optionDescIronStorageContent1:
      "Aggiorna la tua capacità di stoccaggio del Ferro per contenere più risorse.",
    optionDescNeonAutoBuyer1Content1:
      "Aggiungi un Estrattore di Neon per automatizzare la generazione di Neon.",
    optionDescNeonAutoBuyer2Content1:
      "Aggiungi un Estrattore Avanzato di Neon per migliorare l'automazione della raccolta di Neon - Potenza:",
    optionDescNeonAutoBuyer3Content1:
      "Installa una Raffineria di Neon per migliorare la raccolta di Neon - Potenza:",
    optionDescNeonAutoBuyer4Content1:
      "Aggiungi un Sintetizzatore Quantico di Neon per produzione all'avanguardia di Neon - Potenza:",
    optionDescNeonSellContent1: "Qui puoi vendere Neon per contanti",
    optionDescNeonSellContent2: "Qui puoi vendere Neon per contanti o fondarlo in Ossigeno",
    optionDescNeonStorageContent1:
      "Aggiorna la tua capacità di stoccaggio del Neon per contenere più risorse.",
    optionDescOxygenAutoBuyer1Content1:
      "Aggiungi un Estrattore di Ossigeno per automatizzare la generazione di Ossigeno.",
    optionDescOxygenAutoBuyer2Content1:
      "Installa un Estrattore Avanzato di Ossigeno per generazione migliorata di Ossigeno - Potenza:",
    optionDescOxygenAutoBuyer3Content1:
      "Aggiungi una Raffineria di Ossigeno per massimizzare l'automazione della produzione di Ossigeno - Potenza:",
    optionDescOxygenAutoBuyer4Content1:
      "Aggiungi un Sintetizzatore Quantico di Ossigeno per generazione avanzata di Ossigeno - Potenza:",
    optionDescOxygenSellContent1: "Qui puoi vendere Ossigeno per contanti.",
    optionDescOxygenSellContent2: "Qui puoi vendere Ossigeno per contanti o fondarlo in Silicio.",
    optionDescOxygenStorageContent1:
      "Aggiorna la tua capacità di stoccaggio dell'Ossigeno per contenere più risorse.",
    optionDescSiliconAutoBuyer1Content1:
      "Aggiungi un Estrattore di Silicio per automatizzare la generazione di Silicio.",
    optionDescSiliconAutoBuyer2Content1:
      "Aggiungi un Estrattore Avanzato di Silicio per raccolta migliorata di Silicio - Potenza:",
    optionDescSiliconAutoBuyer3Content1:
      "Installa una Raffineria di Silicio per massimizzare l'automazione del Silicio - Potenza:",
    optionDescSiliconAutoBuyer4Content1:
      "Aggiungi un Sintetizzatore Quantico di Silicio per produzione all'avanguardia di Silicio - Potenza:",
    optionDescSiliconSellContent1: "Qui puoi vendere Silicio per contanti.",
    optionDescSiliconSellContent2: "Qui puoi vendere Silicio per contanti o fondarlo in Ferro.",
    optionDescSiliconStorageContent1:
      "Aggiorna la tua capacità di stoccaggio del Silicio per contenere più risorse.",
    optionDescSodiumAutoBuyer1Content1:
      "Aggiungi un Estrattore di Sodio per automatizzare la generazione di Sodio.",
    optionDescSodiumAutoBuyer2Content1:
      "Aggiungi un Estrattore Avanzato di Sodio per migliore automazione del Sodio - Potenza:",
    optionDescSodiumAutoBuyer3Content1:
      "Installa una Raffineria di Sodio per aumentare la produzione di Sodio - Potenza:",
    optionDescSodiumAutoBuyer4Content1:
      "Aggiungi un Sintetizzatore Quantico di Sodio per generazione avanzata di Sodio - Potenza:",
    optionDescSodiumSellContent1: "Qui puoi vendere Sodio per contanti.",
    optionDescSodiumStorageContent1:
      "Aggiorna la tua capacità di stoccaggio del Sodio per contenere più risorse.",
    optionDescSteelAutoBuyer1Content1:
      "Aggiungi una Fonderia di Acciaio in Cortile per creare acciaio.",
    optionDescSteelAutoBuyer2Content1:
      "Aggiungi una Fonderia Avanzata di Acciaio per produzione migliorata di Acciaio - Potenza:",
    optionDescSteelAutoBuyer3Content1:
      "Installa una Raffineria di Acciaio per migliorare l'automazione dell'Acciaio - Potenza:",
    optionDescSteelAutoBuyer4Content1:
      "Aggiungi un Sintetizzatore Quantico di Acciaio per generazione avanzata di Acciaio - Potenza:",
    optionDescSteelCreateContent1:
      "Qui puoi creare Acciaio dalle sue parti costituenti, a condizione che tu le abbia e l'energia sia ACCESA.",
    optionDescSteelSellContent1: "Qui puoi vendere Acciaio per contanti.",
    optionDescSteelStorageContent1:
      "Aggiorna la tua capacità di stoccaggio dell'Acciaio per contenere più risorse.",
    optionDescTitaniumAutoBuyer1Content1:
      "Aggiungi un Miscelatore di Titanio per automatizzare la produzione di Titanio.",
    optionDescTitaniumAutoBuyer2Content1:
      "Installa un Miscelatore Avanzato di Titanio per produzione migliorata di Titanio - Potenza:",
    optionDescTitaniumAutoBuyer3Content1:
      "Aggiungi una Raffineria di Titanio per massimizzare l'automazione del Titanio - Potenza:",
    optionDescTitaniumAutoBuyer4Content1:
      "Aggiungi un Sintetizzatore Quantico di Titanio per produzione all'avanguardia di Titanio - Potenza:",
    optionDescTitaniumCreateContent1:
      "Qui puoi creare Titanio, a condizione che tu abbia i materiali e l'energia sia ACCESA.",
    optionDescTitaniumSellContent1: "Qui puoi vendere Titanio per contanti.",
    optionDescTitaniumStorageContent1:
      "Aggiorna la tua capacità di stoccaggio del Titanio per contenere più risorse.",
    optionDescWaterAutoBuyer1Content1:
      "Aggiungi un Miscelatore d'Acqua per facilitare l'elaborazione dell'acqua.",
    optionDescWaterAutoBuyer2Content1:
      "Aggiungi un Miscelatore Avanzato d'Acqua per migliore produzione d'Acqua - Potenza:",
    optionDescWaterAutoBuyer3Content1:
      "Installa una Raffineria d'Acqua per massimizzare l'automazione dell'Acqua - Potenza:",
    optionDescWaterAutoBuyer4Content1:
      "Aggiungi un Sintetizzatore Quantico d'Acqua per generazione avanzata d'Acqua - Potenza:",
    optionDescWaterCreateContent1:
      "Qui puoi gestire la produzione di Acqua, a condizione che tu abbia i materiali e l'energia sia ACCESA.",
    optionDescWaterSellContent1: "Qui puoi vendere Acqua per contanti.",
    optionDescWaterStorageContent1:
      "Aggiorna la capacità del tuo serbatoio d'Acqua per immagazzinare più acqua.",
  },
  fr: {
    optionDescCarbonAutoBuyer1Content1: "Achète un mineur pour automatiser la collecte de Carbone.",
    optionDescCarbonAutoBuyer2Content1:
      "Installe un Mineur Avancé de Carbone pour une extraction améliorée de Carbone - Puissance:",
    optionDescCarbonAutoBuyer3Content1:
      "Ajoute une Raffinerie de Carbone pour maximiser la collecte automatisée de Carbone - Puissance:",
    optionDescCarbonAutoBuyer4Content1:
      "Ajoute un Synthétiseur Quantique de Carbone pour une génération de pointe de Carbone - Puissance:",
    optionDescCarbonSellContent1: "Ici tu peux vendre du Carbone pour de l'argent",
    optionDescCarbonSellContent2:
      "Ici tu peux vendre du Carbone pour de l'argent ou le fusionner en Néon",
    optionDescCarbonStorageContent1: "Développe ton stockage de Carbone.",
    optionDescConcreteAutoBuyer1Content1:
      "Ajoute un Mélangeur de Béton pour automatiser la production de Béton.",
    optionDescConcreteAutoBuyer2Content1:
      "Installe un Mélangeur Avancé de Béton pour une production améliorée de Béton - Puissance:",
    optionDescConcreteAutoBuyer3Content1:
      "Ajoute une Raffinerie de Béton pour maximiser l'automatisation du Béton - Puissance:",
    optionDescConcreteAutoBuyer4Content1:
      "Ajoute un Synthétiseur Quantique de Béton pour une production de pointe de Béton - Puissance:",
    optionDescConcreteCreateContent1:
      "Ici tu peux créer du Béton, à condition que tu aies les matériaux et que l'énergie soit ALLUMÉE.",
    optionDescConcreteSellContent1: "Ici tu peux vendre du Béton pour de l'argent.",
    optionDescConcreteStorageContent1:
      "Améliore ta capacité de stockage de Béton pour contenir plus de ressources.",
    optionDescDieselAutoBuyer1Content1:
      "Ajoute un Extracteur pour collecter du pétrole et faire du Diesel.",
    optionDescDieselAutoBuyer2Content1:
      "Ajoute une Raffinerie Avancée de Diesel pour une production améliorée de Diesel - Puissance:",
    optionDescDieselAutoBuyer3Content1:
      "Installe un Synthétiseur de Diesel pour une automatisation améliorée du Diesel - Puissance:",
    optionDescDieselAutoBuyer4Content1:
      "Ajoute un Synthétiseur Quantique de Diesel pour une génération de pointe de Diesel - Puissance:",
    optionDescDieselCreateContent1:
      "Ici tu peux créer du Diesel à partir de ses parties constituantes, à condition que tu les aies et que l'énergie soit ALLUMÉE.",
    optionDescDieselSellContent1: "Ici tu peux vendre du Diesel pour de l'argent.",
    optionDescDieselStorageContent1:
      "Améliore ta capacité de stockage de Diesel pour contenir plus de ressources.",
    optionDescGlassAutoBuyer1Content1:
      "Ajoute un Fabricant de Verre d'Atelier pour créer du verre.",
    optionDescGlassAutoBuyer2Content1:
      "Installe un Fabricant Avancé de Verre pour une meilleure production de Verre - Puissance:",
    optionDescGlassAutoBuyer3Content1:
      "Ajoute une Raffinerie de Verre pour améliorer l'automatisation du Verre - Puissance:",
    optionDescGlassAutoBuyer4Content1:
      "Ajoute un Synthétiseur Quantique de Verre pour une production de pointe de Verre - Puissance:",
    optionDescGlassCreateContent1:
      "Ici tu peux créer du Verre à partir de ses parties constituantes, à condition que tu les aies et que l'énergie soit ALLUMÉE.",
    optionDescGlassSellContent1: "Ici tu peux vendre du Verre pour de l'argent.",
    optionDescGlassStorageContent1:
      "Améliore ta capacité de stockage de Verre pour contenir plus de ressources.",
    optionDescHeliumAutoBuyer1Content1:
      "L'Hélium semble plus léger que l'air - ajoute un Grattoir d'Atmosphère pour automatiser la collecte d'Hélium.",
    optionDescHeliumAutoBuyer2Content1:
      "Ajoute un Grattoir Avancé d'Hélium pour une collecte améliorée d'Hélium - Puissance:",
    optionDescHeliumAutoBuyer3Content1:
      "Installe une Raffineries d'Hélium pour améliorer l'automatisation de la production d'Hélium - Puissance:",
    optionDescHeliumAutoBuyer4Content1:
      "Ajoute un Synthétiseur Quantique d'Hélium pour une production d'Hélium de pointe - Puissance:",
    optionDescHeliumSellContent1: "Ici tu peux vendre de l'Hélium pour de l'argent",
    optionDescHeliumSellContent2:
      "Ici tu peux vendre de l'Hélium pour de l'argent ou le fusionner en Carbone",
    optionDescHeliumStorageContent1:
      "Augmente ta capacité de stockage d'Hélium pour stocker plus d'Hélium.",
    optionDescHydrogenAutoBuyer1Content1:
      "Ajoute un Compresseur d'Hydrogène pour automatiser la production d'Hydrogène.",
    optionDescHydrogenAutoBuyer2Content1:
      "Ajoute un Compresseur Avancé d'Hydrogène pour une automatisation améliorée - Puissance:",
    optionDescHydrogenAutoBuyer3Content1:
      "Installe une Raffineries d'Hydrogène pour maximiser l'efficacité de la production d'Hydrogène - Puissance:",
    optionDescHydrogenAutoBuyer4Content1:
      "Ajoute un Synthétiseur Quantique d'Hydrogène pour une production d'Hydrogène de pointe - Puissance:",
    optionDescHydrogenSellContent1: "Ici tu peux vendre de l'Hydrogène pour de l'argent",
    optionDescHydrogenSellContent2:
      "Ici tu peux vendre de l'Hydrogène pour de l'argent ou le fusionner en Hélium",
    optionDescHydrogenStorageContent1:
      "Améliore ta capacité de stockage d'Hydrogène pour contenir plus de ressources.",
    optionDescIronAutoBuyer1Content1:
      "Ajoute un Extracteur de Fer pour automatiser la production de Fer.",
    optionDescIronAutoBuyer2Content1:
      "Ajoute un Extracteur Avancé de Fer pour une collecte améliorée de Fer - Puissance:",
    optionDescIronAutoBuyer3Content1:
      "Installe une Raffineries de Fer pour maximiser l'automatisation de la production de Fer - Puissance:",
    optionDescIronAutoBuyer4Content1:
      "Ajoute un Synthétiseur Quantique de Fer pour une production avancée de Fer - Puissance:",
    optionDescIronSellContent1: "Ici tu peux vendre du Fer pour de l'argent.",
    optionDescIronStorageContent1:
      "Améliore ta capacité de stockage de Fer pour contenir plus de ressources.",
    optionDescNeonAutoBuyer1Content1:
      "Ajoute un Extracteur de Néon pour automatiser la production de Néon.",
    optionDescNeonAutoBuyer2Content1:
      "Ajoute un Extracteur Avancé de Néon pour améliorer l'automatisation de la collecte de Néon - Puissance:",
    optionDescNeonAutoBuyer3Content1:
      "Installe une Raffineries de Néon pour améliorer la collecte de Néon - Puissance:",
    optionDescNeonAutoBuyer4Content1:
      "Ajoute un Synthétiseur Quantique de Néon pour une production de pointe de Néon - Puissance:",
    optionDescNeonSellContent1: "Ici tu peux vendre du Néon pour de l'argent",
    optionDescNeonSellContent2:
      "Ici tu peux vendre du Néon pour de l'argent ou le fusionner en Oxygène",
    optionDescNeonStorageContent1:
      "Améliore ta capacité de stockage de Néon pour contenir plus de ressources.",
    optionDescOxygenAutoBuyer1Content1:
      "Ajoute un Extracteur d'Oxygène pour automatiser la production d'Oxygène.",
    optionDescOxygenAutoBuyer2Content1:
      "Installe un Extracteur Avancé d'Oxygène pour une production améliorée d'Oxygène - Puissance:",
    optionDescOxygenAutoBuyer3Content1:
      "Ajoute une Raffineries d'Oxygène pour maximiser l'automatisation de la production d'Oxygène - Puissance:",
    optionDescOxygenAutoBuyer4Content1:
      "Ajoute un Synthétiseur Quantique d'Oxygène pour une production avancée d'Oxygène - Puissance:",
    optionDescOxygenSellContent1: "Ici tu peux vendre de l'Oxygène pour de l'argent.",
    optionDescOxygenSellContent2:
      "Ici tu peux vendre de l'Oxygène pour de l'argent ou le fusionner en Silicium.",
    optionDescOxygenStorageContent1:
      "Améliore ta capacité de stockage d'Oxygène pour contenir plus de ressources.",
    optionDescSiliconAutoBuyer1Content1:
      "Ajoute un Extracteur de Silicium pour automatiser la production de Silicium.",
    optionDescSiliconAutoBuyer2Content1:
      "Ajoute un Extracteur Avancé de Silicium pour une collecte améliorée de Silicium - Puissance:",
    optionDescSiliconAutoBuyer3Content1:
      "Installe une Raffineries de Silicium pour maximiser l'automatisation du Silicium - Puissance:",
    optionDescSiliconAutoBuyer4Content1:
      "Ajoute un Synthétiseur Quantique de Silicium pour une production de pointe de Silicium - Puissance:",
    optionDescSiliconSellContent1: "Ici tu peux vendre du Silicium pour de l'argent.",
    optionDescSiliconSellContent2:
      "Ici tu peux vendre du Silicium pour de l'argent ou le fusionner en Fer.",
    optionDescSiliconStorageContent1:
      "Améliore ta capacité de stockage de Silicium pour contenir plus de ressources.",
    optionDescSodiumAutoBuyer1Content1:
      "Ajoute un Extracteur de Sodium pour automatiser la production de Sodium.",
    optionDescSodiumAutoBuyer2Content1:
      "Ajoute un Extracteur Avancé de Sodium pour une meilleure automatisation du Sodium - Puissance:",
    optionDescSodiumAutoBuyer3Content1:
      "Installe une Raffineries de Sodium pour augmenter la production de Sodium - Puissance:",
    optionDescSodiumAutoBuyer4Content1:
      "Ajoute un Synthétiseur Quantique de Sodium pour une production avancée de Sodium - Puissance:",
    optionDescSodiumSellContent1: "Ici tu peux vendre du Sodium pour de l'argent.",
    optionDescSodiumStorageContent1:
      "Améliore ta capacité de stockage de Sodium pour contenir plus de ressources.",
    optionDescSteelAutoBuyer1Content1:
      "Ajoute une Fonderie d'Acier en Arrière-cour pour créer de l'acier.",
    optionDescSteelAutoBuyer2Content1:
      "Ajoute une Fonderie Avancée d'Acier pour une production améliorée d'Acier - Puissance:",
    optionDescSteelAutoBuyer3Content1:
      "Installe une Raffinerie d'Acier pour améliorer l'automatisation de l'Acier - Puissance:",
    optionDescSteelAutoBuyer4Content1:
      "Ajoute un Synthétiseur Quantique d'Acier pour une génération avancée d'Acier - Puissance:",
    optionDescSteelCreateContent1:
      "Ici tu peux créer de l'Acier à partir de ses parties constituantes, à condition que tu les aies et que l'énergie soit ALLUMÉE.",
    optionDescSteelSellContent1: "Ici tu peux vendre de l'Acier pour de l'argent.",
    optionDescSteelStorageContent1:
      "Améliore ta capacité de stockage d'Acier pour contenir plus de ressources.",
    optionDescTitaniumAutoBuyer1Content1:
      "Ajoute un Mélangeur de Titane pour automatiser la production de Titane.",
    optionDescTitaniumAutoBuyer2Content1:
      "Installe un Mélangeur Avancé de Titane pour une production améliorée de Titane - Puissance:",
    optionDescTitaniumAutoBuyer3Content1:
      "Ajoute une Raffinerie de Titane pour maximiser l'automatisation du Titane - Puissance:",
    optionDescTitaniumAutoBuyer4Content1:
      "Ajoute un Synthétiseur Quantique de Titane pour une production de pointe de Titane - Puissance:",
    optionDescTitaniumCreateContent1:
      "Ici tu peux créer du Titane, à condition que tu aies les matériaux et que l'énergie soit ALLUMÉE.",
    optionDescTitaniumSellContent1: "Ici tu peux vendre du Titane pour de l'argent.",
    optionDescTitaniumStorageContent1:
      "Améliore ta capacité de stockage de Titane pour contenir plus de ressources.",
    optionDescWaterAutoBuyer1Content1:
      "Ajoute un Mélangeur d'Eau pour faciliter le traitement de l'eau.",
    optionDescWaterAutoBuyer2Content1:
      "Ajoute un Mélangeur Avancé d'Eau pour une meilleure production d'Eau - Puissance:",
    optionDescWaterAutoBuyer3Content1:
      "Installe une Raffinerie d'Eau pour maximiser l'automatisation de l'Eau - Puissance:",
    optionDescWaterAutoBuyer4Content1:
      "Ajoute un Synthétiseur Quantique d'Eau pour une génération avancée d'Eau - Puissance:",
    optionDescWaterCreateContent1:
      "Ici tu peux gérer la production d'Eau, à condition que tu aies les matériaux et que l'énergie soit ALLUMÉE.",
    optionDescWaterSellContent1: "Ici tu peux vendre de l'Eau pour de l'argent.",
    optionDescWaterStorageContent1:
      "Améliore la capacité de ton réservoir d'Eau pour stocker plus d'eau.",
  },
} as const satisfies Record<LocaleId, Record<string, string>>;

export type EconomyActionHelpKey = keyof (typeof ECONOMY_ACTION_HELP_MESSAGES)["en"];
export type EconomyActionHelpAction = "sell" | "storage" | "create" | "autobuyer";

export function economyActionHelp(
  locale: LocaleId,
  goodId: EconomicGoodId,
  action: EconomyActionHelpAction,
  options: { readonly tier?: 1 | 2 | 3 | 4; readonly fused?: boolean } = {},
): string | undefined {
  const sourceGood = `${goodId[0]?.toUpperCase()}${goodId.slice(1)}`;
  let key: string | undefined;
  switch (action) {
    case "sell":
      key = `optionDesc${sourceGood}SellContent${options.fused ? 2 : 1}`;
      break;
    case "storage":
      key = `optionDesc${sourceGood}StorageContent1`;
      break;
    case "create":
      key = `optionDesc${sourceGood}CreateContent1`;
      break;
    case "autobuyer":
      if (options.tier === undefined) return undefined;
      key = `optionDesc${sourceGood}AutoBuyer${options.tier}Content1`;
      break;
  }

  if (!key) return undefined;
  const messages = ECONOMY_ACTION_HELP_MESSAGES[locale] as Readonly<Record<string, string>>;
  return (
    messages[key] ??
    (action === "sell" && options.fused
      ? messages[`optionDesc${sourceGood}SellContent1`]
      : undefined)
  );
}

export const LOCALIZATION_VALIDATION_DATA = { messages: ECONOMY_ACTION_HELP_MESSAGES } as const;
