import { describe, expect, it } from "vitest";
import { createStarCatalogue, starTypeForSystem } from "../../src/content/starCatalogue";
import {
  ROCKET_IDS,
  type AsteroidState,
  type SpaceWeatherCondition,
} from "../../src/content/space";
import { LOCALE_IDS } from "../../src/content/ids";
import { createInitialGameState, type GameState } from "../../src/engine/state";
import { STARSHIP_MODULES } from "../../src/content/space";
import { createGameStore } from "../../src/engine/store";
import type { EngineEvent } from "../../src/engine/commands";
import {
  createSpaceEventNoticeHandler,
  spaceEventNotice,
} from "../../src/app/spaceEventNotifications";
import { withGameAudio } from "../../src/app/audio";
import {
  SPACE_NOTIFICATION_MESSAGES,
  type SpaceNotificationMessageKey,
} from "../../src/i18n/spaceNotificationMessages";
import { formatNumber } from "../../src/app/numberFormatting";
import { economyGoodName } from "../../src/app/economyDisplay";
import { precipitationForCurrentWeather } from "../../src/engine/weather";
import { spaceNotificationText } from "../../src/i18n/spaceNotificationMessages";
import { megastructureText } from "../../src/i18n/megastructureMessages";

const state = createInitialGameState();
const systemId = createStarCatalogue()[0]!.id;
const rocketId = ROCKET_IDS[0];
const asteroidId = "asteroid-test";

function stateWithAsteroid(rarity: AsteroidState["rarity"]): GameState {
  const asteroid: AsteroidState = {
    id: asteroidId,
    name: "Pioneer Crown",
    systemId,
    distance: 1,
    rarity,
    extractionEase: 1,
    remainingAntimatter: 1,
    totalAntimatter: 1,
    reservedBy: null,
    depleted: false,
    interacted: false,
  };
  return {
    ...state,
    run: {
      ...state.run,
      space: { ...state.run.space, asteroids: [asteroid] },
    },
  };
}

function stateWithReadyStarship(): GameState {
  return {
    ...state,
    run: {
      ...state.run,
      space: {
        ...state.run.space,
        starshipModules: {
          ...state.run.space.starshipModules,
          structural: { builtParts: STARSHIP_MODULES.structural.parts },
          lifeSupport: { builtParts: STARSHIP_MODULES.lifeSupport.parts },
          antimatterEngine: { builtParts: STARSHIP_MODULES.antimatterEngine.parts },
          fleetHangar: { builtParts: STARSHIP_MODULES.fleetHangar.parts },
        },
      },
    },
  };
}

function stateWithWeather(
  condition: SpaceWeatherCondition,
  technologies: readonly ("rocketComposites" | "solarPowerGeneration")[] = [],
  precipitationUnlocked = false,
): GameState {
  const space: GameState["run"]["space"] = {
    ...state.run.space,
    currentSystemWeather: condition,
    weatherSystemId: state.run.space.currentSystemId,
  };
  const precipitation = precipitationForCurrentWeather(space);
  return {
    ...state,
    run: {
      ...state.run,
      space,
      economy: {
        ...state.run.economy,
        researchedTechnologies: [
          ...new Set([...state.run.economy.researchedTechnologies, ...technologies]),
        ],
        unlockedCompounds:
          precipitationUnlocked && precipitation
            ? [...new Set([...state.run.economy.unlockedCompounds, precipitation.goodId])]
            : state.run.economy.unlockedCompounds,
      },
    },
  };
}

describe("space event notifications", () => {
  it("preserves Cosmic Forge O-type and factory-star arrival copy in all locales", () => {
    const source = {
      en: {
        oHeader: "TYPE O STAR REACHED",
        oText:
          "Your Starship has reached orbit of the <span class='o-star-text'>X</span> System.<br><br>The star burns with a ferocity you have only ever seen in theory.<br>An O-type sun: rare, impossibly bright, and violently alive.<br><br>The crew falls silent.<br>Even the instruments hesitate before agreeing on the readings.",
        factoryText:
          "Your Starship arrived at the {star} System!<br>You gasp at what you see! The main star has been completely enveloped by a gigantic structure!<br>It looks to be some kind of {structure}<br>No wonder we didn't discover this System before,<br>the star is not visible due to the size of this structure!<br>This system is going to be heavily defended for sure, but if we can conquer it,<br>for sure it will open up vast opportunities for us...",
      },
      es: {
        oHeader: "ESTRELLA TIPO O ALCANZADA",
        oText:
          "Tu Nave Estelar ha alcanzado la órbita del Sistema <span class='o-star-text'>X</span>.<br><br>La estrella arde con una ferocidad que solo has visto en teoría.<br>Un sol tipo O: raro, increíblemente brillante, y violentamente vivo.<br><br>La tripulación calla.<br>Incluso los instrumentos dudan antes de ponerse de acuerdo en las lecturas.",
        factoryText:
          "¡Tu nave estelar ha llegado al sistema {star}!<br>¡Te quedas boquiabierto! ¡La estrella principal está completamente envuelta por una estructura gigantesca!<br>Parece ser una especie de {structure}<br>Con razón no habíamos descubierto este sistema antes:<br>¡la estrella no se ve debido al tamaño de esta estructura!<br>Seguro que este sistema estará fuertemente defendido, pero si logramos conquistarlo,<br>sin duda nos abrirá enormes oportunidades...",
      },
      pt: {
        oHeader: "ESTRELA DE TIPO O ALCANÇADA",
        oText:
          "A tua Nave Estelar alcançou a órbita do Sistema <span class='o-star-text'>X</span>.<br><br>A estrela arde com uma ferocidade que só viste em teoria.<br>Uma estrela de tipo O: rara, incrivelmente brilhante e violentamente viva.<br><br>A tripulação fica em silêncio.<br>Até os instrumentos hesitam antes de concordarem com as leituras.",
        factoryText:
          "A tua nave estelar chegou ao sistema {star}!<br>Ficas boquiaberto! A estrela principal está completamente envolta por uma estrutura gigantesca!<br>Parece ser uma espécie de {structure}<br>Não é de admirar que não tivéssemos descoberto este sistema antes:<br>a estrela não é visível devido ao tamanho desta estrutura!<br>Certamente este sistema será fortemente defendido, mas se conseguirmos conquistá-lo,<br>sem dúvida abrirá enormes oportunidades para nós...",
      },
      de: {
        oHeader: "TYP-O-STERN ERREICHT",
        oText:
          "Dein Sternenschiff hat die Umlaufbahn des <span class='o-star-text'>X</span>-Systems erreicht.<br><br>Der Stern brennt mit einer Wildheit, die du nur in der Theorie gesehen hast.<br>Eine Sonne vom Typ O: selten, unglaublich hell und gewaltsam lebendig.<br><br>Die Crew verstummt.<br>Selbst die Instrumente zögern, bevor sie sich über die Messwerte einig sind.",
        factoryText:
          "Dein Raumschiff hat das System {star} erreicht!<br>Du staunst über das, was du siehst! Der Hauptstern ist vollständig von einer gigantischen Struktur umhüllt!<br>Es scheint sich um eine Art {structure} zu handeln<br>Kein Wunder, dass wir dieses System bisher nicht entdeckt haben,<br>der Stern ist wegen der Größe dieser Struktur nicht sichtbar!<br>Dieses System wird sicher stark verteidigt sein, aber wenn wir es erobern können,<br>eröffnet es uns ganz sicher gewaltige Möglichkeiten...",
      },
      it: {
        oHeader: "STELLA TIPO O RAGGIUNTA",
        oText:
          "La tua Nave Stellare ha raggiunto l'orbita del Sistema <span class='o-star-text'>X</span>.<br><br>La stella brucia con una ferocia che hai visto solo in teoria.<br>Un sole di tipo O: raro, incredibilmente luminoso, e violentemente vivo.<br><br>L'equipaggio tace.<br>Persino gli strumenti esitano prima di concordare sulle letture.",
        factoryText:
          "La tua astronave è arrivata al sistema {star}!<br>Resti a bocca aperta! La stella principale è completamente avvolta da una struttura gigantesca!<br>Sembra essere una specie di {structure}<br>Non c'è da stupirsi che non avessimo scoperto prima questo sistema:<br>la stella non è visibile a causa delle dimensioni di questa struttura!<br>Questo sistema sarà sicuramente ben difeso, ma se riusciamo a conquistarlo,<br>ci aprirà di certo enormi opportunità...",
      },
      fr: {
        oHeader: "ÉTOILE TYPE O ATTEINTE",
        oText:
          "Ton Vaisseau Stellaire a atteint l'orbite du Système <span class='o-star-text'>X</span>.<br><br>L'étoile brûle avec une férocité que tu n'as vue qu'en théorie.<br>Un soleil de type O: rare, incroyablement brillant, et violemment vivant.<br><br>L'équipage se tait.<br>Même les instruments hésitent avant de s'accorder sur les lectures.",
        factoryText:
          "Votre vaisseau est arrivé dans le système {star}!<br>Vous restez bouche bée! L'étoile principale est entièrement enveloppée par une structure gigantesque!<br>Cela semble être une sorte de {structure}<br>Pas étonnant que nous n'ayons pas découvert ce système plus tôt,<br>l'étoile est invisible à cause de la taille de cette structure!<br>Ce système sera sûrement lourdement défendu, mais si nous parvenons à le conquérir,<br>il nous ouvrira à coup sûr d'immenses opportunités...",
      },
    } satisfies Record<
      (typeof LOCALE_IDS)[number],
      { oHeader: string; oText: string; factoryText: string }
    >;
    const oStar = createStarCatalogue().find((star) => star.starType === "O")!;
    const factoryStar = createStarCatalogue().find((star) => star.name === "Sirius")!;
    const reportedFactoryState: GameState = {
      ...state,
      permanent: {
        ...state.permanent,
        megastructures: {
          ...state.permanent.megastructures,
          ancientManuscripts: [
            {
              position: 1,
              manuscriptSystemId: systemId,
              factorySystemId: factoryStar.id,
              megastructureId: "dysonSphere",
              reported: true,
            },
          ],
        },
      },
    };

    const normalizeSource = (copy: string) =>
      copy.replace(/<span[^>]*>X<\/span>/g, "{star}").replace(/<br\s*\/?>/g, "\n");

    for (const locale of LOCALE_IDS) {
      const expectedSource = source[locale];
      expect(SPACE_NOTIFICATION_MESSAGES[locale].oTypeStarReachedHeader).toBe(
        expectedSource.oHeader,
      );
      expect(SPACE_NOTIFICATION_MESSAGES[locale].oTypeStarReachedText).toBe(
        normalizeSource(expectedSource.oText),
      );
      expect(SPACE_NOTIFICATION_MESSAGES[locale].factoryStarReachedText).toBe(
        normalizeSource(expectedSource.factoryText),
      );

      const oNotice = spaceEventNotice(
        locale,
        { type: "space.starship.arrived", systemId: oStar.id },
        state,
      );
      expect(oNotice).toMatchObject({
        message: `${expectedSource.oHeader}\n\n${normalizeSource(expectedSource.oText).replace("{star}", oStar.name)}`,
        classification: "starshipNarrative",
        type: "info",
        durationMs: 20_000,
      });

      const factoryNotice = spaceEventNotice(
        locale,
        { type: "space.starship.arrived", systemId: factoryStar.id },
        reportedFactoryState,
      );
      expect(factoryNotice).toMatchObject({
        message: `MEGASTRUCTURE\n\n${normalizeSource(expectedSource.factoryText)
          .replace("{star}", factoryStar.name)
          .replace("{structure}", megastructureText(locale).structureNames.dysonSphere)}`,
        classification: "starshipNarrative",
        type: "info",
        durationMs: 20_000,
      });
    }

    expect(starTypeForSystem(oStar.id)).toBe("O");
    expect(
      spaceEventNotice(
        "en",
        { type: "space.starship.arrived", systemId: factoryStar.id },
        {
          ...reportedFactoryState,
          permanent: {
            ...reportedFactoryState.permanent,
            megastructures: {
              ...reportedFactoryState.permanent.megastructures,
              ancientManuscripts:
                reportedFactoryState.permanent.megastructures.ancientManuscripts.map((record) => ({
                  ...record,
                  reported: false,
                })),
            },
          },
        },
      ),
    ).toMatchObject({
      message: "StarShip has reached orbit of the Sirius system!",
      classification: "starShip",
    });
  });

  it("localizes the Starship-ready notice in all six locales", () => {
    const readyState = stateWithReadyStarship();
    for (const locale of LOCALE_IDS) {
      expect(
        spaceEventNotice(
          locale,
          { type: "space.starship.module.part.built", moduleId: "fleetHangar", builtParts: 1 },
          readyState,
        ),
      ).toMatchObject({
        message: SPACE_NOTIFICATION_MESSAGES[locale].starshipReady,
        classification: "starShip",
        type: "info",
        durationMs: 3000,
      });
    }
  });

  it("lists actual Void Pillage gains in a source-style four-second notice for every locale", () => {
    const headings = {
      en: ["Resources Gained:", "Compounds Gained:"],
      es: ["Recursos obtenidos:", "Compuestos obtenidos:"],
      pt: ["Recursos obtidos:", "Compostos obtidos:"],
      de: ["Erhaltene Ressourcen:", "Erhaltene Verbindungen:"],
      it: ["Risorse ottenute:", "Composti ottenuti:"],
      fr: ["Ressources obtenues:", "Composés obtenus:"],
    } as const;
    const titles = {
      en: "Pillage Void Complete!",
      es: "¡Saqueo del Vacío completado!",
      pt: "Pilhagem do Vazio concluída!",
      de: "Leerenplünderung abgeschlossen!",
      it: "Saccheggio del Vuoto completato!",
      fr: "Pillage du Vide terminé !",
    } as const;
    for (const locale of LOCALE_IDS) {
      const notice = spaceEventNotice(
        locale,
        {
          type: "space.void-pillage.completed",
          gains: { hydrogen: 12, silicon: 4, steel: 0 },
        },
        state,
      );
      expect(notice).toEqual({
        message: [
          titles[locale],
          `${headings[locale][0]}\n12 ${economyGoodName(locale, "hydrogen")}\n4 ${economyGoodName(locale, "silicon")}`,
          `${headings[locale][1]}\n0 ${economyGoodName(locale, "steel")}`,
        ].join("\n\n"),
        classification: "special",
        type: "info",
        durationMs: 4000,
      });
    }

    const largeGainEvent = {
      type: "space.void-pillage.completed" as const,
      gains: { hydrogen: 12_345, steel: 67_890 },
    };
    const standardNotice = spaceEventNotice("en", largeGainEvent, {
      ...state,
      settings: { ...state.settings, notation: "standard" },
    });
    const condensedNotice = spaceEventNotice("en", largeGainEvent, state);
    expect(standardNotice?.message).toContain("12,345 Hydrogen");
    expect(standardNotice?.message).toContain("67,890 Steel");
    expect(condensedNotice?.message).toContain("12.3K Hydrogen");
    expect(condensedNotice?.message).toContain("67.8K Steel");
  });

  it("localizes every routed travel, hazard, and battle notice in all six locales", () => {
    const events: readonly EngineEvent[] = [
      { type: "space.starship.launched", systemId, durationMs: 1000, antimatterSpent: 1 },
      { type: "space.starship.arrived", systemId },
      { type: "space.rocket.launched", rocketId },
      { type: "space.rocket.travel-started", rocketId, asteroidId, direction: "outbound" },
      { type: "space.rocket.travel-started", rocketId, asteroidId, direction: "returning" },
      { type: "space.rocket.arrived", rocketId, asteroidId },
      { type: "space.rocket.returned", rocketId, asteroidId },
      { type: "space.weather.changed", condition: "rain" },
      { type: "space.weather.changed", condition: "heavyRain" },
      { type: "space.weather.changed", condition: "volcano" },
      { type: "space.battle.finished", systemId, result: "victory", scannerBuilt: false },
      { type: "space.battle.finished", systemId, result: "defeat", scannerBuilt: false },
      { type: "space.telescope.built" },
      { type: "space.launch-pad.built" },
      { type: "space.starship.system.scanned", systemId },
      { type: "space.stars.studied", range: 2 },
      { type: "space.asteroid.scan-missed" },
      { type: "space.asteroid.discovered", asteroidId, name: "Pioneer Crown" },
    ];

    for (const locale of LOCALE_IDS) {
      const notices = events.map((event) => spaceEventNotice(locale, event, state));
      expect(notices).toHaveLength(18);
      expect(notices.every((notice) => notice !== null && notice.message.length > 0)).toBe(true);
      expect(notices.map((notice) => notice?.classification)).toEqual([
        "starShip",
        "starShip",
        "rocket",
        "rocket",
        "rocket",
        "rocket",
        "rocket",
        "weather",
        "weather",
        "weather",
        "battle",
        "battle",
        "special",
        "special",
        "starShip",
        "special",
        "special",
        "special",
      ]);
      expect(notices.every((notice) => !notice?.message.includes("{"))).toBe(true);
      expect(notices[6]?.message).toContain(asteroidId);
    }
  });

  it("matches all eight conditional rain and volcano source variants in every locale", () => {
    const rainBranches = [
      {
        technologies: ["rocketComposites"] as const,
        precipitationUnlocked: true,
        key: "weatherHeavyRainNoLaunchWithBenefit",
        classification: "weather",
      },
      {
        technologies: ["rocketComposites"] as const,
        precipitationUnlocked: false,
        key: "weatherHeavyRainNoLaunch",
        classification: "default",
      },
      {
        technologies: [] as const,
        precipitationUnlocked: true,
        key: "weatherHeavyRainWithBenefit",
        classification: "weather",
      },
      {
        technologies: [] as const,
        precipitationUnlocked: false,
        key: "weatherHeavyRain",
        classification: "weather",
      },
    ] as const;
    for (const condition of ["rain", "heavyRain"] as const) {
      for (const branch of rainBranches) {
        const branchState = stateWithWeather(
          condition,
          branch.technologies,
          branch.precipitationUnlocked,
        );
        const precipitation = precipitationForCurrentWeather(branchState.run.space);
        if (branch.precipitationUnlocked) expect(precipitation).toBeDefined();
        for (const locale of LOCALE_IDS) {
          const localizedValues =
            branch.precipitationUnlocked && precipitation
              ? { material: economyGoodName(locale, precipitation.goodId) }
              : {};
          expect(
            spaceEventNotice(locale, { type: "space.weather.changed", condition }, branchState),
          ).toEqual({
            message: spaceNotificationText(locale, branch.key, localizedValues),
            classification: branch.classification,
            type: "warning",
            durationMs: 3000,
          });
        }
      }
    }

    const volcanoBranches = [
      {
        technologies: ["rocketComposites", "solarPowerGeneration"] as const,
        key: "weatherVolcanoNoLaunchAndSolar",
        type: "error",
      },
      {
        technologies: ["rocketComposites"] as const,
        key: "weatherVolcanoNoLaunch",
        type: "error",
      },
      {
        technologies: ["solarPowerGeneration"] as const,
        key: "weatherVolcanoSolarAffected",
        type: "error",
      },
      { technologies: [] as const, key: "weatherVolcano", type: "warning" },
    ] as const;
    for (const branch of volcanoBranches) {
      const branchState = stateWithWeather("volcano", branch.technologies);
      for (const locale of LOCALE_IDS) {
        expect(
          spaceEventNotice(
            locale,
            { type: "space.weather.changed", condition: "volcano" },
            branchState,
          ),
        ).toEqual({
          message: spaceNotificationText(locale, branch.key),
          classification: "weather",
          type: branch.type,
          durationMs: 3000,
        });
      }
    }
  });

  it("routes every Rapid Expansion outcome with source copy in all six locales", () => {
    const starNames = createStarCatalogue()
      .slice(0, 2)
      .map(({ name }) => name);
    const outcomes: readonly EngineEvent[] = [
      {
        type: "space.rapid-expansion.resolved",
        systemId,
        outcome: { type: "peaceful-settlement" },
      },
      {
        type: "space.rapid-expansion.resolved",
        systemId,
        outcome: { type: "non-conquest" },
      },
      {
        type: "space.rapid-expansion.resolved",
        systemId,
        outcome: {
          type: "captured",
          systemIds: createStarCatalogue()
            .slice(0, 2)
            .map(({ id }) => id),
        },
      },
      {
        type: "space.rapid-expansion.resolved",
        systemId,
        outcome: { type: "no-eligible-systems" },
      },
      {
        type: "space.rapid-expansion.resolved",
        systemId,
        outcome: { type: "capture-failed" },
      },
    ];
    const keys = [
      "rapidExpansionPeaceful",
      "rapidExpansionNonConquest",
      "rapidExpansionCapturedMany",
      "rapidExpansionNoEligible",
      "rapidExpansionFailed",
    ] as const satisfies readonly SpaceNotificationMessageKey[];
    const sourceCopy = {
      en: [
        "Rapid Expansion cannot capture extra systems when settling lifeless or unsentient worlds.",
        "Rapid Expansion only triggers after conquest victories. No extra systems were captured.",
        "Rapid Expansion captured {count} extra systems! - {starNames}",
        "Rapid Expansion found no eligible nearby systems.",
        "Rapid Expansion failed to capture any extra systems.",
      ],
      es: [
        "La Expansión Rápida no puede capturar sistemas adicionales al colonizar mundos sin vida o no conscientes.",
        "La Expansión Rápida solo se activa tras victorias por conquista. No se capturaron sistemas adicionales.",
        "¡La Expansión Rápida capturó {count} sistemas adicionales! - {starNames}",
        "La Expansión Rápida no encontró sistemas cercanos elegibles.",
        "La Expansión Rápida no logró capturar ningún sistema adicional.",
      ],
      pt: [
        "A Expansão Rápida não pode capturar sistemas adicionais ao colonizar mundos sem vida ou não conscientes.",
        "A Expansão Rápida só é ativada após vitórias por conquista. Não foram capturados sistemas adicionais.",
        "A Expansão Rápida capturou {count} sistemas adicionais! - {starNames}",
        "A Expansão Rápida não encontrou sistemas próximos elegíveis.",
        "A Expansão Rápida não conseguiu capturar nenhum sistema adicional.",
      ],
      de: [
        "Schnelle Expansion kann keine zusätzlichen Systeme erobern, wenn leblose oder nicht empfindungsfähige Welten besiedelt werden.",
        "Schnelle Expansion wird nur nach Eroberungssiegen ausgelöst. Es wurden keine zusätzlichen Systeme erobert.",
        "Schnelle Expansion hat {count} zusätzliche Systeme erobert! - {starNames}",
        "Schnelle Expansion hat keine geeigneten nahen Systeme gefunden.",
        "Schnelle Expansion konnte keine zusätzlichen Systeme erobern.",
      ],
      it: [
        "L'Espansione Rapida non può conquistare sistemi extra quando si colonizzano mondi senza vita o non senzienti.",
        "L'Espansione Rapida si attiva solo dopo vittorie di conquista. Nessun sistema extra è stato conquistato.",
        "L'Espansione Rapida ha conquistato {count} sistemi extra! - {starNames}",
        "L'Espansione Rapida non ha trovato sistemi vicini idonei.",
        "L'Espansione Rapida non è riuscita a conquistare sistemi extra.",
      ],
      fr: [
        "L'Expansion Rapide ne peut pas capturer de systèmes supplémentaires en colonisant des mondes sans vie ou non sensibles.",
        "L'Expansion Rapide ne se déclenche qu'après des victoires par conquête. Aucun système supplémentaire n'a été capturé.",
        "L'Expansion Rapide a capturé {count} systèmes supplémentaires ! - {starNames}",
        "L'Expansion Rapide n'a trouvé aucun système proche éligible.",
        "L'Expansion Rapide n'a réussi à capturer aucun système supplémentaire.",
      ],
    } satisfies Record<(typeof LOCALE_IDS)[number], readonly string[]>;

    for (const locale of LOCALE_IDS) {
      for (const [index, event] of outcomes.entries()) {
        const template = sourceCopy[locale][index]!;
        const expectedNames = new Intl.ListFormat(locale, {
          style: "long",
          type: "conjunction",
        }).format(starNames);
        const expected = template
          .replace("{count}", formatNumber(locale, 2, 0, state.settings.notation))
          .replace("{starNames}", expectedNames);
        expect(spaceEventNotice(locale, event, state)).toMatchObject({
          message: expected,
          classification: "battle",
          type: "info",
          durationMs: 3000,
        });
      }

      const firstStarId = createStarCatalogue()[0]!.id;
      const oneSystemNotice = spaceEventNotice(
        locale,
        {
          type: "space.rapid-expansion.resolved",
          systemId,
          outcome: { type: "captured", systemIds: [firstStarId] },
        },
        state,
      );
      expect(oneSystemNotice?.message).toBe(
        SPACE_NOTIFICATION_MESSAGES[locale].rapidExpansionCapturedOne
          .replace("{count}", formatNumber(locale, 1, 0, state.settings.notation))
          .replace("{starNames}", createStarCatalogue()[0]!.name),
      );
    }
  });

  it("formats Rapid Expansion capture counts with the active notation", () => {
    const standardState: GameState = {
      ...state,
      settings: { ...state.settings, notation: "standard" },
    };
    const notice = spaceEventNotice(
      "en",
      {
        type: "space.rapid-expansion.resolved",
        systemId,
        outcome: {
          type: "captured",
          systemIds: Array.from({ length: 1_000 }, () => systemId),
        },
      },
      standardState,
    );
    const expectedPrefix = SPACE_NOTIFICATION_MESSAGES.en.rapidExpansionCapturedMany
      .replace("{count}", formatNumber("en", 1_000, 0, "standard"))
      .split("{starNames}")[0]!;
    expect(notice?.message.startsWith(expectedPrefix)).toBe(true);
  });

  it("announces the Galactic tab on first-run Starship arrival using source copy in all locales", () => {
    const event: EngineEvent = { type: "space.starship.arrived", systemId };
    const firstArrivalState: GameState = {
      ...state,
      run: {
        ...state.run,
        space: {
          ...state.run.space,
          starshipDistanceTravelledThisRun: 4,
          starship: { ...state.run.space.starship, phase: "orbiting" },
        },
      },
    };
    const sourceCopy = {
      en: "Galactic Tab Unlocked!",
      es: "¡Pestaña Galáctica desbloqueada!",
      pt: "Separador Galáctico desbloqueado!",
      de: "Galaktischer Tab freigeschaltet!",
      it: "Scheda Galattica sbloccata!",
      fr: "Onglet Galactique débloqué!",
    } satisfies Record<(typeof LOCALE_IDS)[number], string>;

    for (const locale of LOCALE_IDS) {
      expect(SPACE_NOTIFICATION_MESSAGES[locale].galacticTabUnlocked).toBe(sourceCopy[locale]);
      const notices: Array<{
        message: string;
        classification: string;
        type: string;
        durationMs: number;
      }> = [];
      createSpaceEventNoticeHandler(
        () => locale,
        () => firstArrivalState,
        (notice) => notices.push(notice),
      )([event]);
      expect(notices).toContainEqual({
        message: sourceCopy[locale],
        classification: "special",
        type: "warning",
        durationMs: 3000,
      });
    }

    const settlement: EngineEvent = { type: "space.system.settled", systemId, ascendencyPoints: 6 };
    expect(spaceEventNotice("en", settlement, firstArrivalState)).toBeNull();
    expect(
      createSpaceEventNoticeHandler(
        () => "en",
        () => ({
          ...firstArrivalState,
          permanent: { ...firstArrivalState.permanent, rebirthCount: 1 },
        }),
        () => {},
      )([event]),
    ).toBeUndefined();
  });

  it("keeps message placeholders in parity across all six locales", () => {
    const keys = Object.keys(SPACE_NOTIFICATION_MESSAGES.en) as SpaceNotificationMessageKey[];
    const placeholders = (template: string) =>
      [...template.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]).sort();

    for (const locale of LOCALE_IDS) {
      for (const key of keys) {
        expect(placeholders(SPACE_NOTIFICATION_MESSAGES[locale][key])).toEqual(
          placeholders(SPACE_NOTIFICATION_MESSAGES.en[key]),
        );
      }
    }
  });

  it("includes known star, rocket, and asteroid names and meaningful notice types", () => {
    const starName = createStarCatalogue().find((star) => star.id === systemId)!.name;
    const namedState = {
      ...state,
      run: {
        ...state.run,
        space: {
          ...state.run.space,
          rockets: {
            ...state.run.space.rockets,
            [rocketId]: { ...state.run.space.rockets[rocketId], name: "Pioneer One" },
          },
        },
      },
    };

    const launch = spaceEventNotice(
      "en",
      { type: "space.starship.launched", systemId, durationMs: 1000, antimatterSpent: 1 },
      namedState,
    );
    const rocket = spaceEventNotice(
      "en",
      { type: "space.rocket.arrived", rocketId, asteroidId },
      namedState,
    );
    const rocketReturned = spaceEventNotice(
      "en",
      { type: "space.rocket.returned", rocketId, asteroidId },
      namedState,
    );
    const victory = spaceEventNotice(
      "en",
      { type: "space.battle.finished", systemId, result: "victory", scannerBuilt: false },
      namedState,
    );
    const defeat = spaceEventNotice(
      "en",
      { type: "space.battle.finished", systemId, result: "defeat", scannerBuilt: false },
      namedState,
    );
    const systemScan = spaceEventNotice(
      "en",
      { type: "space.starship.system.scanned", systemId },
      namedState,
    );
    const standardAsteroid = spaceEventNotice(
      "en",
      { type: "space.asteroid.discovered", asteroidId, name: "Pioneer Crown" },
      stateWithAsteroid("common"),
    );
    const legendaryAsteroid = spaceEventNotice(
      "en",
      { type: "space.asteroid.discovered", asteroidId, name: "Pioneer Crown" },
      stateWithAsteroid("legendary"),
    );

    expect(launch?.message).toContain(starName);
    expect(rocket?.message).toContain("Pioneer One");
    expect(rocket?.message).toContain(asteroidId);
    expect(rocket).toMatchObject({ classification: "rocket", type: "info", durationMs: 3_000 });
    expect(rocketReturned?.message).toContain("Pioneer One");
    expect(rocketReturned?.message).toContain(asteroidId);
    expect(rocketReturned).toMatchObject({
      classification: "rocket",
      type: "info",
      durationMs: 3_000,
    });
    expect(victory?.type).toBe("success");
    expect(defeat?.type).toBe("error");
    expect(systemScan).toMatchObject({
      message: `${starName} System Scanned!`,
      classification: "starShip",
      type: "info",
    });
    expect(standardAsteroid?.message).toBe("Asteroid Discovered!\n\nPioneer Crown");
    expect(standardAsteroid).toMatchObject({ classification: "special", type: "info" });
    expect(legendaryAsteroid?.message).toBe(
      "Legendary Asteroid Discovered!\n\nThey named it after you!\n\nPioneer Crown",
    );
    expect(legendaryAsteroid).toMatchObject({ classification: "special", type: "info" });
    expect(spaceEventNotice("en", { type: "space.asteroid.scan-missed" }, state)).toMatchObject({
      message: "Asteroid not found after search!",
      classification: "special",
      type: "warning",
    });
    expect(spaceEventNotice("en", { type: "space.stars.studied", range: 2 }, state)).toMatchObject({
      message: "Star Study Complete!\n\nTake a look at the Star Map!",
      classification: "special",
      type: "info",
    });
    expect(spaceEventNotice("en", { type: "space.telescope.built" }, state)).toMatchObject({
      message: "Space Telescope Built!",
      classification: "special",
      type: "info",
    });
    expect(spaceEventNotice("en", { type: "space.launch-pad.built" }, state)).toMatchObject({
      message: "Launch Pad Built!",
      classification: "special",
      type: "info",
    });
  });

  it("localizes a 3000ms rocket fuel-ready notice with the renamed rocket in all locales", () => {
    const renamedState: GameState = {
      ...state,
      run: {
        ...state.run,
        space: {
          ...state.run.space,
          rockets: {
            ...state.run.space.rockets,
            [rocketId]: { ...state.run.space.rockets[rocketId], name: "Pioneer One" },
          },
        },
      },
    };
    const expectedMessages: Record<(typeof LOCALE_IDS)[number], string> = {
      en: "Pioneer One is ready for Launch!",
      es: "¡Pioneer One está listo para el lanzamiento!",
      pt: "Pioneer One está pronto para o lançamento!",
      de: "Pioneer One ist startbereit!",
      it: "Pioneer One è pronto al lancio!",
      fr: "Pioneer One est prêt au lancement!",
    };

    for (const locale of LOCALE_IDS) {
      const notice = spaceEventNotice(
        locale,
        { type: "space.rocket.fuel-ready", rocketId },
        renamedState,
      );
      expect(notice).toMatchObject({
        message: expectedMessages[locale],
        classification: "rocket",
        type: "info",
        durationMs: 3_000,
      });
    }
  });

  it("does not notify on progress, individual rounds, travel shortening, or ordinary weather", () => {
    const ignored: readonly EngineEvent[] = [
      { type: "space.battle.round", systemId, round: 1 },
      { type: "space.starship.travel.shortened", systemId, remainingMs: 100 },
      { type: "space.weather.changed", condition: "clear" },
      { type: "space.weather.changed", condition: "cloudy" },
    ];

    expect(ignored.map((event) => spaceEventNotice("en", event, state))).toEqual([
      null,
      null,
      null,
      null,
    ]);
  });

  it("notifies once when weather enters a hazard and ignores repeat and ordinary cycles", () => {
    const notices: string[] = [];
    const baselineState = {
      ...state,
      run: {
        ...state.run,
        space: { ...state.run.space, currentSystemWeather: "clear" as const },
      },
    };
    expect(
      spaceEventNotice("en", { type: "space.weather.changed", condition: "rain" }, baselineState),
    ).not.toBeNull();
    const handler = createSpaceEventNoticeHandler(
      () => "en",
      () => baselineState,
      (notice) => {
        notices.push(notice.message);
      },
    );

    handler([
      { type: "space.weather.changed", condition: "rain" },
      { type: "space.weather.changed", condition: "rain" },
      { type: "space.weather.changed", condition: "cloudy" },
      { type: "space.weather.changed", condition: "clear" },
    ]);

    expect(notices).toHaveLength(1);
    expect(notices[0]).toBe(SPACE_NOTIFICATION_MESSAGES.en.weatherHeavyRain);
  });

  it("suppresses a hazard notice when notifications are disabled in the same accepted batch", () => {
    const clearState = {
      ...state,
      run: {
        ...state.run,
        space: { ...state.run.space, currentSystemWeather: "clear" as const },
      },
    };
    const engineStore = createGameStore(clearState, { clock: { now: () => 0 } });
    const store = withGameAudio(engineStore);
    const notices: string[] = [];
    store.subscribeEvents(
      createSpaceEventNoticeHandler(
        () => "en",
        () => store.getState(),
        (notice) => notices.push(notice.message),
      ),
    );

    const results = store.dispatchBatch([
      { type: "settings.update", patch: { notificationsEnabled: false } },
      { type: "space.weather.set-condition", condition: "rain" },
    ]);

    expect(results.every((result) => result.accepted)).toBe(true);
    expect(results[1]?.events.some((event) => event.type === "space.weather.changed")).toBe(true);
    expect(notices).toEqual([]);
    store.dispose();
  });
});
