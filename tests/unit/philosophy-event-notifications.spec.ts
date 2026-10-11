import { describe, expect, it } from "vitest";
import {
  LOCALE_IDS,
  PHILOSOPHY_IDS,
  type LocaleId,
  type PhilosophyId,
} from "../../src/content/ids";
import {
  PHILOSOPHY_REPEATABLE_IDS,
  philosophyForRepeatable,
} from "../../src/content/philosophy";
import type { PhilosophyUpgradeNoticeId } from "../../src/i18n/philosophyMessages";
import type { EngineEvent } from "../../src/engine/commands";
import {
  createPhilosophyEventNoticeHandler,
  philosophyEventNotice,
} from "../../src/app/philosophyEventNotifications";

const SOURCE_COPY: Record<LocaleId, Record<PhilosophyId, string>> = {
  en: {
    constructor: "You are a CONSTRUCTOR!",
    supremacist: "You are a SUPREMACIST!",
    voidborn: "You are VOIDBORN!",
    expansionist: "You are an EXPANSIONIST!",
  },
  es: {
    constructor: "¡Eres un CONSTRUCTOR!",
    supremacist: "¡Eres un SUPREMACISTA!",
    voidborn: "¡Eres NACIDO DEL VACÍO!",
    expansionist: "¡Eres un EXPANSIONISTA!",
  },
  pt: {
    constructor: "És um CONSTRUTOR!",
    supremacist: "És um SUPREMACISTA!",
    voidborn: "És NASCIDO DO VAZIO!",
    expansionist: "És um EXPANSIONISTA!",
  },
  de: {
    constructor: "Du bist ein KONSTRUKTEUR!",
    supremacist: "Du bist ein SUPREMATIST!",
    voidborn: "Du bist LEERENGEBOREN!",
    expansionist: "Du bist ein EXPANSIONIST!",
  },
  it: {
    constructor: "Sei un COSTRUTTORE!",
    supremacist: "Sei un SUPREMATISTA!",
    voidborn: "Sei NATO DAL VUOTO!",
    expansionist: "Sei un ESPANSIONISTA!",
  },
  fr: {
    constructor: "Vous êtes un CONSTRUCTEUR!",
    supremacist: "Vous êtes un SUPRÉMACISTE!",
    voidborn: "Vous êtes NÉ DU VIDE!",
    expansionist: "Vous êtes un EXPANSIONNISTE!",
  },
};

const RAPID_EXPANSION_SOURCE_COPY: Record<LocaleId, string> = {
  en: "ABILITY: You now have a chance of capturing up to 3 nearby Systems for every 1!",
  es: "HABILIDAD: ¡Ahora tienes la oportunidad de capturar hasta 3 sistemas cercanos por cada 1!",
  pt: "HABILIDADE: Agora tens a possibilidade de capturar até 3 sistemas próximos por cada 1!",
  de: "FÄHIGKEIT: Du hast jetzt die Chance, pro System bis zu 3 nahegelegene Systeme zu erobern!",
  it: "ABILITÀ: Ora hai la possibilità di conquistare fino a 3 sistemi vicini per ognuno!",
  fr: "CAPACITÉ: Vous avez désormais une chance de capturer jusqu'à 3 systèmes proches pour chaque système!",
};

const UPGRADE_SOURCE_COPY: Record<LocaleId, Record<PhilosophyUpgradeNoticeId, string>> = {
  en: {
    spaceStorageTankResearch: "ABILITY: Base storage expansion multiplier now 5x instead of 2x!",
    fleetHolograms: "ABILITY: You can now always Vassalize enemies provided your fleet is 3x larger than theirs!",
    voidSeers: "ABILITY: Space Telescope can now scan for instant Resources and Compounds!",
    efficientAssembly: "Space Building costs reduced by 1%!",
    laserMining: "Resources AutoBuyers 5% cheaper!",
    massCompoundAssembly: "Compounds recipes cheaper by 5%!",
    energyDrones: "Energy and Research Buildings 5% cheaper!",
    hangarAutomation: "Fleet build costs reduced by 5%!",
    syntheticPlating: "Fleet Armor increased by 5%!",
    antimatterEngineMinaturization: "Fleet Speed increased by 5%!",
    laserIntensityResearch: "Fleet Attack Power increased by 5%! (Applicable to Newly Built Ships)",
    stellarWhispers: "Initial Impression of enemies improved by 1%!",
    stellarInsightManifold: "Star Study speed increased by 1%!",
    asteroidDwellers: "Asteroid Search speed increased by 1%!",
    ascendencyPhilosophy: "Base Ascendency Point gain +1!",
    spaceElevator: "Starship Parts cost reduced by 5%!",
    launchPadMassProduction: "Rocket Parts cost reduced by 5%!",
    asteroidAttractors: "Rocket Travel time reduced by 5%!",
    warpDrive: "Starship Travel time reduced by 5%!",
  },
  es: {
    spaceStorageTankResearch: "HABILIDAD: ¡El multiplicador base de ampliación de almacenamiento ahora es 5x en vez de 2x!",
    fleetHolograms: "HABILIDAD: ¡Ahora siempre puedes vasallizar enemigos si tu flota es 3 veces mayor que la suya!",
    voidSeers: "HABILIDAD: ¡El Telescopio Espacial ya puede buscar recursos y compuestos instantáneos!",
    efficientAssembly: "¡Los costes de construcción espacial se reducen un 1%!",
    laserMining: "¡Los autocompradores de recursos son un 5% más baratos!",
    massCompoundAssembly: "¡Las recetas de compuestos son un 5% más baratas!",
    energyDrones: "¡Los edificios de energía e investigación son un 5% más baratos!",
    hangarAutomation: "¡Los costes de construcción de flota se reducen un 5%!",
    syntheticPlating: "¡El blindaje de la flota aumenta un 5%!",
    antimatterEngineMinaturization: "¡La velocidad de la flota aumenta un 5%!",
    laserIntensityResearch: "¡El poder de ataque de la flota aumenta un 5%! (Aplicable a las naves recién construidas)",
    stellarWhispers: "¡La impresión inicial de los enemigos mejora un 1%!",
    stellarInsightManifold: "¡La velocidad de estudio estelar aumenta un 1%!",
    asteroidDwellers: "¡La velocidad de búsqueda de asteroides aumenta un 1%!",
    ascendencyPhilosophy: "¡Ganancia base de Puntos de Ascendencia +1!",
    spaceElevator: "¡El coste de las piezas de nave estelar se reduce un 5%!",
    launchPadMassProduction: "¡El coste de las piezas de cohete se reduce un 5%!",
    asteroidAttractors: "¡El tiempo de viaje de los cohetes se reduce un 5%!",
    warpDrive: "¡El tiempo de viaje de la nave estelar se reduce un 5%!",
  },
  pt: {
    spaceStorageTankResearch: "HABILIDADE: O multiplicador base de expansão do armazenamento é agora 5x em vez de 2x!",
    fleetHolograms: "HABILIDADE: Agora podes sempre vassalizar inimigos se a tua frota for 3 vezes maior do que a deles!",
    voidSeers: "HABILIDADE: O Telescópio Espacial pode agora procurar instantaneamente recursos e compostos!",
    efficientAssembly: "Os custos de construção espacial são reduzidos em 1%!",
    laserMining: "Os autocompradores de recursos são 5% mais baratos!",
    massCompoundAssembly: "As receitas de compostos são 5% mais baratas!",
    energyDrones: "Os edifícios de energia e investigação são 5% mais baratos!",
    hangarAutomation: "Os custos de construção de frotas são reduzidos em 5%!",
    syntheticPlating: "A blindagem da frota aumenta em 5%!",
    antimatterEngineMinaturization: "A velocidade da frota aumenta em 5%!",
    laserIntensityResearch: "O poder de ataque da frota aumenta em 5%! (Aplicável às naves recém-construídas)",
    stellarWhispers: "A impressão inicial dos inimigos melhora em 1%!",
    stellarInsightManifold: "A velocidade do estudo estelar aumenta em 1%!",
    asteroidDwellers: "A velocidade de procura de asteroides aumenta em 1%!",
    ascendencyPhilosophy: "Ganho base de Pontos de Ascendência +1!",
    spaceElevator: "O custo das peças de nave estelar é reduzido em 5%!",
    launchPadMassProduction: "O custo das peças de foguetão é reduzido em 5%!",
    asteroidAttractors: "O tempo de viagem dos foguetões é reduzido em 5%!",
    warpDrive: "O tempo de viagem da nave estelar é reduzido em 5%!",
  },
  de: {
    spaceStorageTankResearch: "FÄHIGKEIT: Der Basis-Multiplikator für Lagererweiterung ist jetzt 5x statt 2x!",
    fleetHolograms: "FÄHIGKEIT: Du kannst Feinde jetzt immer unterwerfen, solange deine Flotte 3x größer ist als ihre!",
    voidSeers: "FÄHIGKEIT: Das Weltraumteleskop kann jetzt nach sofortigen Ressourcen und Verbindungen suchen!",
    efficientAssembly: "Kosten für Weltraumgebäude um 1% gesenkt!",
    laserMining: "Ressourcen-Autokäufer 5% günstiger!",
    massCompoundAssembly: "Verbindungsrezepte 5% günstiger!",
    energyDrones: "Energie- und Forschungsgebäude 5% günstiger!",
    hangarAutomation: "Flottenbaukosten um 5% gesenkt!",
    syntheticPlating: "Flottenpanzerung um 5% erhöht!",
    antimatterEngineMinaturization: "Flottengeschwindigkeit um 5% erhöht!",
    laserIntensityResearch: "Angriffskraft der Flotte um 5% erhöht! (Gilt für neu gebaute Schiffe)",
    stellarWhispers: "Erster Eindruck bei Feinden um 1% verbessert!",
    stellarInsightManifold: "Geschwindigkeit der Sternenstudie um 1% erhöht!",
    asteroidDwellers: "Geschwindigkeit der Asteroidensuche um 1% erhöht!",
    ascendencyPhilosophy: "Basis-Gewinn an Aufstiegspunkten +1!",
    spaceElevator: "Kosten für Sternenschiffteile um 5% gesenkt!",
    launchPadMassProduction: "Kosten für Raketenteile um 5% gesenkt!",
    asteroidAttractors: "Reisezeit der Raketen um 5% verkürzt!",
    warpDrive: "Reisezeit des Sternenschiffs um 5% verkürzt!",
  },
  it: {
    spaceStorageTankResearch: "ABILITÀ: Il moltiplicatore base di espansione dello stoccaggio ora è 5x invece di 2x!",
    fleetHolograms: "ABILITÀ: Ora puoi sempre vassallizzare i nemici se la tua flotta è 3 volte più grande della loro!",
    voidSeers: "ABILITÀ: Il Telescopio Spaziale può ora cercare risorse e composti istantanei!",
    efficientAssembly: "Costi delle costruzioni spaziali ridotti dell'1%!",
    laserMining: "Auto acquirenti di risorse più economici del 5%!",
    massCompoundAssembly: "Ricette dei composti più economiche del 5%!",
    energyDrones: "Edifici di energia e ricerca più economici del 5%!",
    hangarAutomation: "Costi di costruzione della flotta ridotti del 5%!",
    syntheticPlating: "Corazzatura della flotta aumentata del 5%!",
    antimatterEngineMinaturization: "Velocità della flotta aumentata del 5%!",
    laserIntensityResearch: "Potenza d'attacco della flotta aumentata del 5%! (Valido per le navi appena costruite)",
    stellarWhispers: "Impressione iniziale dei nemici migliorata dell'1%!",
    stellarInsightManifold: "Velocità dello studio stellare aumentata dell'1%!",
    asteroidDwellers: "Velocità di ricerca degli asteroidi aumentata dell'1%!",
    ascendencyPhilosophy: "Guadagno base di Punti Ascendenza +1!",
    spaceElevator: "Costo dei pezzi di astronave ridotto del 5%!",
    launchPadMassProduction: "Costo dei pezzi di razzo ridotto del 5%!",
    asteroidAttractors: "Tempo di viaggio dei razzi ridotto del 5%!",
    warpDrive: "Tempo di viaggio dell'astronave ridotto del 5%!",
  },
  fr: {
    spaceStorageTankResearch: "CAPACITÉ: Le multiplicateur de base d'extension du stockage passe de 2x à 5x!",
    fleetHolograms: "CAPACITÉ: Vous pouvez désormais toujours vassaliser vos ennemis si votre flotte est 3 fois plus grande que la leur!",
    voidSeers: "CAPACITÉ: Le Télescope Spatial peut désormais chercher des ressources et composés instantanés!",
    efficientAssembly: "Coûts des constructions spatiales réduits de 1%!",
    laserMining: "Auto-acheteurs de ressources 5% moins chers!",
    massCompoundAssembly: "Recettes de composés 5% moins chères!",
    energyDrones: "Bâtiments d'énergie et de recherche 5% moins chers!",
    hangarAutomation: "Coûts de construction de la flotte réduits de 5%!",
    syntheticPlating: "Blindage de la flotte augmenté de 5%!",
    antimatterEngineMinaturization: "Vitesse de la flotte augmentée de 5%!",
    laserIntensityResearch: "Puissance d'attaque de la flotte augmentée de 5%! (Applicable aux vaisseaux nouvellement construits)",
    stellarWhispers: "Première impression des ennemis améliorée de 1%!",
    stellarInsightManifold: "Vitesse d'étude stellaire augmentée de 1%!",
    asteroidDwellers: "Vitesse de recherche d'astéroïdes augmentée de 1%!",
    ascendencyPhilosophy: "Gain de base de Points d'Ascendance +1!",
    spaceElevator: "Coût des pièces de vaisseau réduit de 5%!",
    launchPadMassProduction: "Coût des pièces de fusée réduit de 5%!",
    asteroidAttractors: "Temps de voyage des fusées réduit de 5%!",
    warpDrive: "Temps de voyage du vaisseau réduit de 5%!",
  },
};

describe("philosophy selection notifications", () => {
  it("matches Cosmic Forge copy, severity, classification, and lifetime in all locales", () => {
    for (const locale of LOCALE_IDS) {
      for (const philosophyId of PHILOSOPHY_IDS) {
        const notice = philosophyEventNotice(locale, {
          type: "philosophy.selected",
          philosophyId,
        });

        expect(notice).toEqual({
          message: SOURCE_COPY[locale][philosophyId],
          classification: "special",
          type: "warning",
          durationMs: 3000,
        });
      }
    }
  });

  it("routes only selection events", () => {
    const notices: unknown[] = [];
    const route = createPhilosophyEventNoticeHandler(
      () => "en",
      (notice) => notices.push(notice),
    );
    const events: readonly EngineEvent[] = [
      { type: "onboarding.completed" },
      { type: "philosophy.selected", philosophyId: "expansionist" },
    ];

    route(events);

    expect(notices).toEqual([
      {
        message: SOURCE_COPY.en.expansionist,
        classification: "special",
        type: "warning",
        durationMs: 3000,
      },
    ]);
  });

  it("notifies when Rapid Expansion is activated with source copy in all locales", () => {
    for (const locale of LOCALE_IDS) {
      expect(
        philosophyEventNotice(locale, {
          type: "philosophy.ability.activated",
          philosophyId: "expansionist",
        }),
      ).toEqual({
        message: RAPID_EXPANSION_SOURCE_COPY[locale],
        classification: "tech",
        type: "info",
        durationMs: 3000,
      });
      expect(
        philosophyEventNotice(locale, {
          type: "philosophy.ability.activated",
          philosophyId: "constructor",
        }),
      ).toEqual({
        message: UPGRADE_SOURCE_COPY[locale].spaceStorageTankResearch,
        classification: "tech",
        type: "info",
        durationMs: 3000,
      });
    }
  });

  it("routes each non-Expansionist ability and all repeatable purchases as source tech notices", () => {
    const abilityByPhilosophy = [
      ["constructor", "spaceStorageTankResearch"],
      ["supremacist", "fleetHolograms"],
      ["voidborn", "voidSeers"],
    ] as const;

    for (const locale of LOCALE_IDS) {
      for (const [philosophyId, abilityId] of abilityByPhilosophy) {
        expect(
          philosophyEventNotice(locale, {
            type: "philosophy.ability.activated",
            philosophyId,
          }),
        ).toEqual({
          message: UPGRADE_SOURCE_COPY[locale][abilityId],
          classification: "tech",
          type: "info",
          durationMs: 3000,
        });
      }

      for (const repeatableId of PHILOSOPHY_REPEATABLE_IDS) {
        expect(
          philosophyEventNotice(locale, {
            type: "philosophy.repeatable.purchased",
            philosophyId: philosophyForRepeatable(repeatableId),
            repeatableId,
            rank: 1,
            cost: 10_000,
          }),
        ).toEqual({
          message: UPGRADE_SOURCE_COPY[locale][repeatableId],
          classification: "tech",
          type: "info",
          durationMs: 3000,
        });
      }
    }
  });

  it("routes each accepted purchase once and keeps Expansionist out of the repeatable route", () => {
    const notices: unknown[] = [];
    createPhilosophyEventNoticeHandler(
      () => "en",
      (notice) => notices.push(notice),
    )([
      { type: "philosophy.ability.activated", philosophyId: "expansionist" },
      {
        type: "philosophy.repeatable.purchased",
        philosophyId: "expansionist",
        repeatableId: "spaceElevator",
        rank: 1,
        cost: 10_000,
      },
    ]);

    expect(notices).toEqual([
      {
        message: RAPID_EXPANSION_SOURCE_COPY.en,
        classification: "tech",
        type: "info",
        durationMs: 3000,
      },
      {
        message: UPGRADE_SOURCE_COPY.en.spaceElevator,
        classification: "tech",
        type: "info",
        durationMs: 3000,
      },
    ]);
  });
});
