import type { LocaleId } from "../content/ids";

export interface CosmicopediaArticle {
  readonly heading: string;
  readonly body: string;
}

export const cosmicopediaSourceMessages = {
  en: {
    getStarted: [
      {
        heading: "Introduction",
        body: "Miaplacidus in a nutshell is an incremental game.  However it is much more than that, and hopefully it will give you hours of gaming pleasure.\u003cbr/\u003e\u003cbr/\u003eWhen you start the game, it is going to look pretty bleak, which it is, as you have been abandoned on a planet in the Spica system with nothing but a great understanding of the universe, and the ability to harness Hydrogen.  As you gain more of this basic building block, you will be able to sell it and gain some Cash.\u003cbr/\u003e\u003cbr/\u003eAnyway, before going any further, open the Resources Tab, and expand the Gases section, and you will note there is a section called Hydrogen.  Click this and the Resources section will open.  Although it can look overwhelming at first, the concept is pretty simple.  At the top you will see a dropdown which allows you to set an amount of stock to sell, and a sell button.  This sells your Hydrogen for Cash, which you can see at the top left of the screen.\u003cbr/\u003e\u003cbr/\u003eWith some Cash in your pocket it is time to set about the goal, which is to ascend to the stars!  Quite a heavy task from a few coins and some Hydrogen atoms, I am sure you will agree, but fear not!\u003cbr/\u003e\u003cbr/\u003eNext if you look below this section, you have a Gain button, that, when clicked adds a Hydrogen atom to your stocks.  You need to store this atom, and thats where the next section comes in.  If you gain so much Hydrogen that your storage is full, then you can trade all but one atom for an increase in storage, although making you gain the Hydrogen again, you can now collect twice as much!\u003cbr/\u003e\u003cbr/\u003eThis is great but a bit labour intensive.  To get around this, if you look below, you will see that there is a section allowing you to build a Hydrogen Generator, from now on called an Auto Buyer.  With this Auto Buyer, you can sit back and relax, while the Hydrogen is gained all by itself until the storage is full, which will make life easier for sure.\u003cbr/\u003e\u003cbr/\u003eNow that the pressure is off a bit, next you will note there is a Research Tab, and opening this will give you access to some more information, and more importantly the concept of Research Points!  You can build a Science Kit which will start to generate you Research Points, very slowly at first, but this can grow very quickly.  Use the first batch you generate to open the Technology section and research your first technology, \u0027Knowledge Sharing\u0027.\u003cbr/\u003e\u003cbr/\u003eCongratulations you have just understood the main concept of Miaplacidus, which is grinding and buying rewards with the profits.\u003cbr/\u003e\u003cbr/\u003eEventually you will be able to use this loop to discover new elements and grow those numbers beyond what you ever imagined!\u003cbr/\u003e\u003cbr/\u003eThanks for reading, now feel free to explore some other topics in the Miaplaedia to give you some more context!",
      },
    ],
    story: [
      {
        heading: "History",
        body: "You are Miaplacidean. You once lived on a lush and peaceful world orbiting Beta Carinae, known to your people as Miaplacidus. For eons, your civilization thrived—farming the land, advancing in knowledge, and eventually colonizing your entire star system. Life was good, and there was no need for more. That changed the day a scientist discovered a strange disturbance in the void surrounding your system. Driven by curiosity and sacrifice, he entered it, never to return. Unknown to you at the time, he had crossed into a distant system and revealed your existence to an advanced AI race.\\n\\nThis AI species followed his path back through the now-permanent portal and launched a devastating invasion. In a matter of days, the Miaplacidus system fell. Most were lost. You and a handful of others narrowly escaped. Boarding an experimental ship equipped with untested warp technology, you fled into the void. But the jump did not go as planned. You were cast far from home, lost consciousness, and drifted through space.\\n\\nWhen you finally awoke, you found yourself alone in the Spica system—roughly 100 light years from your origin. Your people are gone. Your world is gone. But your story is just beginning.",
      },
      {
        heading: "Today",
        body: "You landed on a lush, vibrant world in the Spica system. There, you encountered a sentient native species—the Spicites. They welcomed you with curiosity and kindness, inviting you to share meals and learn their ways. Though communication was imperfect, they showed no aggression. Over time, you grew comfortable among them, adapting to their culture and rhythms of life.\\n\\nThey began to call you Mia\u0027Plac—perhaps a mistranslation of your origin, or maybe a word with deeper meaning in their language. Whatever the case, the name stuck, and so did your place among them. Through wisdom, leadership, and your advanced knowledge, you gained their trust and eventually rose to lead their colony. Now, you oversee the gathering of resources and the advancement of research to guide this growing settlement into the future.\\n\\nYet, deep within, a fire still burns. You have not forgotten Miaplacidus. You have not forgotten your people. While you build a future here, you dedicate your life to uncovering the truth of what happened—to find a way back, and to set things right.",
      },
      {
        heading: "Future",
        body: "Equipped with little more than a modest lab, a handful of raw materials, and a spark of hydrogen, you begin your work. The Spicites look to you for guidance, their trust unwavering. Though their world is primitive by your standards, their spirit is strong, and your leadership promises to awaken a new era.\\n\\nWith your knowledge of advanced science and the secrets of the void, you introduce ideas that accelerate progress far beyond what this colony could have achieved alone. As the first structures rise and research begins, whispers start to circulate—traders speak of distant, hostile systems. They tell of rogue AI, colossal Megastructures, and lifeless worlds turned to ash.\\n\\nYou listen, and you remember. The invaders. The loss. The betrayal of the stars. These stories only strengthen your resolve. You will lead the Spicites beyond their world, into the stars, and through the void. You will uncover what became of Miaplacidus. And one day, you will return—not in exile, but in strength—to reclaim your home and bring an end to the machine threat once and for all.  You are... Mia'Plac, and this is Miaplacidus!",
      },
    ],
    conceptsEarly: [
      {
        heading: "Resources",
        body: "Resources are the building blocks of the game. They can be manually gathered, sold, used to buy upgrades, fused to create other Resources, or later on, used in the creation of advanced Compounds.",
      },
      {
        heading: "Manual Gain",
        body: "The Resources all have a button that when clicked, adds 1 to the quantity of that Resource, while the total quantity is less than the storage limit. This is useful in the early stages of the game as a way to get small amounts of Resources to get things kicked off!",
      },
      {
        heading: "Sell",
        body: "Using the dropdown to choose a suitable quantity, and then clicking the Sell button, will exchange the chosen quantity of Resource (or later on, Compound) for Cash which can be used towards buying certain upgrades.",
      },
      {
        heading: "Storage",
        body: "Each Resource and Compound has a Storage limit. If the Storage is full, no more of that Resource can be gained until some are used or Storage is increased. Upgrading Storage uses all but 1 of your stocks of that Resource or Compound.",
      },
      {
        heading: "Auto Buyers",
        body: "Auto Buyers allow you to automate the collection of Resources once unlocked. They work continuously in the background, freeing you up to focus on other tasks. That is until the Storage is full. Some require Energy to operate.",
      },
      {
        heading: "Research Points",
        body: "Research Points are gained by Research Upgrades and are used to unlock new technologies.",
      },
      {
        heading: "Research Upgrades",
        body: "Research Upgrades allow you to generate Research Points, although some require Energy to operate.",
      },
      {
        heading: "Technology",
        body: "Technology unlocks powerful upgrades and new game mechanics. Most techs have prerequisites and a cost in Research Points.",
      },
      {
        heading: "Compounds",
        body: "Compounds are more advanced materials that require multiple Resources to create. They are needed for mid to late game mechanics.",
      },
      {
        heading: "Fusion",
        body: "Fusion is a process that allows you to create Resources from more basic Resources.",
      },
      {
        heading: "News Ticker",
        body: "The News Ticker displays very important (honestly!) information, and can sometimes yield secret buffs, so keep an eye on it at all times!",
      },
    ],
    conceptsMid: [
      {
        heading: "Energy Generation \u0026 Consumption",
        body: "Energy is needed to power a lot of Upgrades, such as some Auto Buyers, and Research Upgrades, and then Consumed in a lot of later game mechanics, and if this is the case, it will be indicated in the description for the feature. There are Energy Production facilities, and Energy Storage facilities.",
      },
      {
        heading: "Power Buildings",
        body: "Power Buildings generate Energy, and there are various types. They Consume Fuel while running, which can sometimes be Compounds, and in other cases Solar power.",
      },
      {
        heading: "Batteries",
        body: "Batteries store excess Energy for use when Generation is insufficient, for example if there are not enough Power Buildings following the purchase of an Upgrade, or if the Fuel is exhausted for a particular Power Building. Upgrading Battery capacity is key to maintaining Energy flow, while expanding Upgrades that consume Energy.",
      },
      {
        heading: "Weather",
        body: "Weather affects various in-game mechanics, including Energy Production. It can affect the launching of Rockets, and can provide extra Resources through Precipitation. The prevailing Weather, and indeed the Resource provided by Precipitation can vary depending on the Star that is being played (a late game mechanic).",
      },
      {
        heading: "Space Mining",
        body: "Space Mining allows for the extraction of rare Antimatter from Asteroids.",
      },
      {
        heading: "Events",
        body: "Random Events can occur as you progress, bringing unexpected opportunities or challenges. They appear without warning and can offer unique rewards, impose temporary setbacks, or unlock new paths. Pay attention to notifications—some Events are fleeting, while others may alter the course of your run if you act wisely. You can track current and historical Events in the Events panel on the Menu tab.",
      },
      {
        heading: "Space Telescope",
        body: "The Space Telescope is used to scan for Asteroids that can be Mined by your Rocket Miners, and in the Late Game, to Study Stars.  Using the Space Telescope requires a lot of Energy, and it has a high build cost.",
      },
      {
        heading: "Asteroids",
        body: "Asteroids contain Antimatter. Mining asteroids requires the Construction and Launching of Rocket Miners. Some Asteroids are easy to Travel To and Mine, whereas others require more time. The quantity of Antimatter varies, and so the Asteroids have different classes based on their quality. If you are really lucky, you may even find a Legendary Asteroid and have it named after you!",
      },
      {
        heading: "Launch Pad",
        body: "The Launch Pad is a prerequisite to building Rocket Miners.  It is an expensive Upgrade, and once built, you can see the number of Rocket Miners you have, and their stages of Construction, or Launch state.",
      },
      {
        heading: "Rocket Miners - Building",
        body: "You can build up to 4 Rocket Miners using advanced Compounds and a lot of Cash, provided you have built a Launch Pad. They each require a number of modules or Parts to build, which get progressively more expensive.  By default they are named as Rocket 1 etc but can be renamed.",
      },
      {
        heading: "Rocket Miners - Launching \u0026 Travelling",
        body: "Rockets must be Fuelled and Launched. They can Travel To to any Asteroid you have discovered with the Space Telescope, provided they are Fuelled and Launched.  Fuelling requires Power and time, and Launching requires good weather.  Once Launched, you can select a destination for your rocket from the discovered Asteroids dropdown, and then click to Travel To it.",
      },
      {
        heading: "Rocket Miners - Mining",
        body: "Once a Rocket Miner has travelled to an Asteroid, it will automatically Mine Antimatter from the Asteroid until it is exhausted, and will then return and require Fuelling to be used again.  While at an Asteroid, a Rocket Miner can Mine faster if the Boost option is used, available in the Mining panel.",
      },
    ],
    conceptsLate: [
      {
        heading: "Star Map",
        body: "The Star Map provides a view of the known Universe, and although it is discovered relatively early in the Game, it comes in to play much later.  Once you start to Study Stars, you can use this Star Map and the Star Data table to plan out your post Rebirth options.",
      },
      {
        heading: "Antimatter",
        body: "Antimatter is an advanced Resource used as Starship Fuel, and is a key component in progressing towards Rebirthing and completing the Game.  It is Mined from Asteroids using Rocket Miners.",
      },
      {
        heading: "Starship - Construction",
        body: "Building a Starship is a major milestone. Starships can travel to distant star systems and permit Rebirthing.",
      },
      {
        heading: "Starship - Travelling",
        body: "Starships can Travel To Studied Star systems, each offering unique Weather, Resources, and challenges when you rebirth on them for a new run.",
      },
      {
        heading: "Diplomacy",
        body: "Most Star Systems contain intelligent alien life. You need to perform a Stellar Scan, and build an Envoy and send it, to initiate this. The Scan gives information about the lifeform in the System, it is not mandatory, but if you don\u0027t do this, your only option will be war and without knowing the size of the enemy force!  There are several options when these encounters are made, ranging from Bullying them, to trying to Vassalize them, and if all else fails, Conquerig them!  You can improve or worsen their impression of you which can affect their fleet size.  Leaders have traits that can affect how they respond to you, or in the case of war, can buff or reduce their defense, speed, fleet size etc.",
      },
      {
        heading: "Battle",
        body: "Not all systems are friendly. Sometimes the only option will be to fight it out to try to conquer it.  You must use the Fleet Hangar screen to build an attack force and initiate a battle.  If you lose, all your fleet will be destroyed but not your Star Ship.  You can rebuild, but it is an expensive process so try and win!.",
      },
      {
        heading: "Ascendency Points (AP)",
        body: "Ascendency Points (AP) are earned by Travelling To Stars. Simply put, the further away the Star is, the more AP will be granted upon Rebirth. They can be spent in the Galactic Market.  You can also gain them by liquidating all your resources and compounds and cash once per run, and also some colonising methods can double the payout also.",
      },
      {
        heading: "Rebirth",
        body: "Rebirth resets progress but conquers a New System. Every System conquered this way awards a Galactic Point (GP), and the Expansionist special ability awards one for each extra System it settles as well. GP are permanent and are never reset by a Rebirth - they are the currency you spend in the Cosmic Rip chapter.",
      },
      {
        heading: "Galactic Market",
        body: "The Galactic market is a major unlock, and arrives after your ship arrives at the new System in the first run.  In it, you can trade Resources, Cash and AP.",
      },
      {
        heading: "Galactic Casino",
        body: "The Galactic Casino allows you to gamble your hard earned products for instant gratification. Test your luck and risk your resources for potential rewards. Rewards gained are for the current run only, not long-term or multi-run prizes.",
      },
      {
        heading: "Casino Points (CP)",
        body: "Casino Points (CP) are the currency of the Galactic Casino. You must buy CP using Resources or Compounds, and CP is the only way to play the casino games for the various prizes. CP are reset on rebirth.",
      },
      {
        heading: "Ascendency Perks",
        body: "You can spend acquired AP on permanent buffs that make future runs easier, and the game more replayable and fun!",
      },
      {
        heading: "Black Hole",
        body: "You can accidentally discover a Black Hole, and once researched it can be used to Time Warp, speeding up travel times and Resource collection. It needs to be charged which takes time, but the time can be reduced with upgrades. You can also increase the time it stays active for and the power of it with further upgrades, and once it is unlocked it is available across different runs.",
      },
      {
        heading: "O-type Stars",
        body: "O-type stars are the rarest and most violent stars in the galaxy. Each one you control dramatically amplifies the power output of a Power Building type. Expect hardened defenses when attempting to conquer these systems.",
      },
      {
        heading: "B-type Stars",
        body: "B-type stars are massive, hot blue stars that supercharge your Auto Buyers. When you\u0027re in a B-type star system, all your Resource Auto Buyers gain a fixed bonus rate: Tier 1 gets +2/s, Tier 2 gets +8/s, Tier 3 gets +25/s, and Tier 4 gets +80/s. This bonus applies to all Resources but not Compounds, and only on the B-type system run.",
      },
      {
        heading: "F-type Stars",
        body: "F-type stars are yellow-white stars that enhance Antimatter Mining operations. When you\u0027re in an F-type star system, all your rockets gain a 50% bonus to their Antimatter extraction rate while Mining Asteroids. This bonus applies only during the F-type system run.",
      },
    ],
    endGoal: [
      {
        heading: "Ancient Manuscripts",
        body: "Ancient Manuscripts point you toward MegaStructure star systems. Clues to their location can sometimes surface in the News Ticker, so keep an eye on it.",
      },
      {
        heading: "Megastructures",
        body: "MegaStructures are extremely difficult to conquer, and hidden in the Galaxy, but the rewards for doing so are massive. Each one you acquire also contributes directly to the destruction of the Miaplacidus forcefield.",
      },
      {
        heading: "Miaplacidus",
        body: "Miaplacidus - your Homeland - It is protected by a powerful force field maintained by the machine race. As you dismantle MegaStructures, and connect them to your own cause, that force field will weaken until it eventually collapses, where you will then face the almighty battle of your life to recover your Ancestral homeland.",
      },
      {
        heading: "Cosmic Rip",
        body: "The Cosmic Rip is a dangerous anomaly threatening the future of your people. Once your forces are strong enough to reclaim Miaplacidus, you must first locate the Rip by scanning local space sectors. After locating it, you will undertake costly studies and constructions to stabilise it. Only once stabilised and secured can you finally close it forever. Galactic Points (GP) are the currency of this chapter. You earn them by Rebirthing - one for every System you conquer - and you spend them to bring the Near Space Scanner Array online, on every sector scan you make while hunting for the Rip, and on every Cosmic Rip technology you research.",
      },
      {
        heading: "The End Goal",
        body: "Once the Miaplacidus force field is gone, you can attack the Master AI race, reclaim Miaplacidus, reconquer your homeland, and close the Cosmic Rip, forever securing the future for your People! This is the end goal of the game.",
      },
    ],
    philosophies: [
      {
        heading: "Philosophies",
        body: "Philosophies are introduced slowly over the first run.  You are encouraged to select one of four possible paths, each of which is a one off, permanent decision that applies for the rest of the game.  Once a Philosophy is chosen, and you complete the first run, a new option shall appear under the Research Tab where you can research a unique special Ability, and a series of unique Repeatable Techs, fitting for the type of Philosophy you selected.  All these bonuses stay with you throughout the game, even persisting through Rebirths.",
      },
      {
        heading: "Special Ability",
        body: "Each Philosophy grants a unique special ability. These are extremely powerful and in different ways can make the game a lot more fun, and each one affects different mechanics, so it is wise to think carefully when choosing a Philosophy, as it cannot be changed later, and there can only be one Philosophy path per game.",
      },
      {
        heading: "Repeatable Tech",
        body: "Each Philosophy grants a series of unique and repeatable Techs.  They offer stacking bonuses that are permanent, and cost Research Points.  Depending on the Philosophy chosen the effects are different, and once a few are purchased, become very powerful indeed.",
      },
      {
        heading: "Constructor",
        body: "The Constructor Philosophy is centered around cheaper and more efficient upgrading. You gain bonuses to AutoBuyer prices, Storage Capacity, Energy and Research Upgrade prices, and a reduction in the cost of Compound Creation.",
      },
      {
        heading: "Supremacist",
        body: "The Supremacist Philosophy leans into military power and conquest. Expect tougher, faster, cheaper Fleets, and the ability to force enemies into Vassalization.",
      },
      {
        heading: "VoidBorn",
        body: "Born of the void, expect bonuses relating to Initial Impressions with Civilizations on foreign Systems, better Asteroid searches and Star studies, opportunities to increase AP gain, and even the ability to Pillage the Void for massive Resource and Compound gains!",
      },
      {
        heading: "Expansionist",
        body: "Expansionists thrive on colonizing and spreading across the stars. Reduce travel time for Rocket Miners and StarShips and make them cheaper, and also gain the ability to have a chance to convince nearby Systems to cede when you conquer one!",
      },
    ],
  },
  es: {
    getStarted: [
      {
        heading: "Introducción",
        body: "Miaplacidus en pocas palabras es un juego incremental. Sin embargo, es mucho más que eso, y esperamos que te brinde horas de diversión.\u003cbr/\u003e\u003cbr/\u003eCuando inicias el juego, se ve bastante desolado, porque lo es, ya que has sido abandonado en un planeta del sistema Spica con nada más que un gran entendimiento del universo y la capacidad de aprovechar el Hidrógeno. A medida que obtengas más de este bloque de construcción básico, podrás venderlo y obtener algo de Dinero.\u003cbr/\u003e\u003cbr/\u003eDe todos modos, antes de continuar, abre la pestaña de Recursos y expande la sección de Gases, y notarás que hay una sección llamada Hidrógeno. Haz clic allí y se abrirá la sección de Recursos. Aunque al principio puede parecer abrumador, el concepto es bastante simple. En la parte superior verás un menú desplegable que permite establecer una cantidad de stock para vender, y un botón de venta. Esto vende tu Hidrógeno por Dinero, que puedes ver en la esquina superior izquierda de la pantalla.\u003cbr/\u003e\u003cbr/\u003eCon algo de Dinero en tu bolsillo, es hora de establecer el objetivo: ¡ascender a las estrellas! Una tarea pesada desde unas pocas monedas y algunos átomos de Hidrógeno, seguro que estarás de acuerdo, pero ¡no temas!\u003cbr/\u003e\u003cbr/\u003eA continuación, si miras debajo de esta sección, verás un botón de Ganancia que, al hacer clic, agrega un átomo de Hidrógeno a tus existencias. Necesitas almacenar este átomo, y ahí entra la siguiente sección. Si acumulas tanto Hidrógeno que tu almacenamiento está lleno, puedes intercambiar todos menos uno por un aumento de almacenamiento, aunque al hacerlo ganarás Hidrógeno de nuevo, ¡pero ahora puedes recolectar el doble!\u003cbr/\u003e\u003cbr/\u003eEsto es genial pero algo laborioso. Para evitarlo, más abajo verás que hay una sección que permite construir un Generador de Hidrógeno, de ahora en adelante llamado Comprador Automático. Con este Comprador Automático, puedes relajarte mientras el Hidrógeno se obtiene solo hasta que el almacenamiento esté lleno, lo que facilita la vida.\u003cbr/\u003e\u003cbr/\u003eAhora que la presión disminuye un poco, notarás que hay una pestaña de Investigación, y abrirla te dará acceso a más información y, lo más importante, ¡el concepto de Puntos de Investigación! Puedes construir un Kit Científico que comenzará a generar Puntos de Investigación, muy lentamente al principio, pero esto puede crecer muy rápido. Usa el primer lote que generes para abrir la sección de Tecnología y investigar tu primera tecnología, \u0027Compartir Conocimiento\u0027.\u003cbr/\u003e\u003cbr/\u003e¡Felicidades! Acabas de comprender el concepto principal de Miaplacidus: recolectar y comprar recompensas con las ganancias.\u003cbr/\u003e\u003cbr/\u003eEventualmente podrás usar este ciclo para descubrir nuevos elementos y aumentar esos números más allá de lo que imaginaste.\u003cbr/\u003e\u003cbr/\u003e¡Gracias por leer! Ahora siéntete libre de explorar otros temas en la Miaplaedia para obtener más contexto.",
      },
    ],
    story: [
      {
        heading: "Historia",
        body: "Eres Miaplacidean. Una vez viviste en un mundo frondoso y pacífico orbitando Beta Carinae, conocido por tu gente como Miaplacidus. Durante eones, tu civilización prosperó: cultivando la tierra, avanzando en conocimiento y eventualmente colonizando todo tu sistema estelar. La vida era buena y no se necesitaba más. Eso cambió el día que un científico descubrió una extraña perturbación en el vacío que rodea tu sistema. Impulsado por la curiosidad y el sacrificio, entró en él y nunca regresó. Desconocido para ti en ese momento, había cruzado a un sistema lejano y revelado tu existencia a una raza avanzada de IA.\n\nEsta especie de IA siguió su camino de regreso a través del portal ahora permanente y lanzó una invasión devastadora. En cuestión de días, el sistema Miaplacidus cayó. La mayoría se perdió. Tú y unos pocos escaparon por poco. Abordando una nave experimental equipada con tecnología de curvatura no probada, huísteis al vacío. Pero el salto no salió como planeado. Fuiste lanzado lejos de casa, perdiste el conocimiento y vagaste por el espacio.\n\nCuando finalmente despertaste, te encontraste solo en el sistema Spica, aproximadamente a 100 años luz de tu origen. Tu gente se ha ido. Tu mundo se ha ido. Pero tu historia apenas comienza.",
      },
      {
        heading: "Hoy",
        body: "Aterrizaste en un mundo frondoso y vibrante en el sistema Spica. Allí encontraste una especie nativa sensible: los Spicites. Te recibieron con curiosidad y amabilidad, invitándote a compartir comidas y aprender sus costumbres. Aunque la comunicación era imperfecta, no mostraron agresión. Con el tiempo, te acostumbraste a ellos, adaptándote a su cultura y ritmos de vida.\n\nComenzaron a llamarte Mia\u0027Plac, quizás una mala traducción de tu origen o tal vez una palabra con significado más profundo en su idioma. Sea como sea, el nombre se quedó, al igual que tu lugar entre ellos. Con sabiduría, liderazgo y tu conocimiento avanzado, ganaste su confianza y eventualmente lideraste su colonia. Ahora supervisas la recolección de recursos y el avance de la investigación para guiar este asentamiento hacia el futuro.\n\nSin embargo, en tu interior, un fuego aún arde. No has olvidado Miaplacidus. No has olvidado a tu gente. Mientras construyes un futuro aquí, dedicas tu vida a descubrir la verdad de lo sucedido, a encontrar el camino de regreso y a corregir las cosas.",
      },
      {
        heading: "Futuro",
        body: "Equipado con poco más que un laboratorio modesto, unas pocas materias primas y una chispa de hidrógeno, comienzas tu trabajo. Los Spicites te miran en busca de orientación, su confianza inquebrantable. Aunque su mundo es primitivo según tus estándares, su espíritu es fuerte y tu liderazgo promete despertar una nueva era.\n\nCon tu conocimiento de ciencia avanzada y los secretos del vacío, introduces ideas que aceleran el progreso mucho más allá de lo que esta colonia podría haber logrado sola. A medida que surgen las primeras estructuras y comienza la investigación, los rumores empiezan a circular: comerciantes hablan de sistemas distantes y hostiles, de IA rebelde, Megastructuras colosales y mundos sin vida convertidos en cenizas.\n\nEscuchas y recuerdas. Los invasores. La pérdida. La traición de las estrellas. Estas historias solo fortalecen tu determinación. Liderarás a los Spicites más allá de su mundo, hacia las estrellas y a través del vacío. Descubrirás qué pasó con Miaplacidus. Y algún día, regresarás, no en exilio, sino con fuerza, para reclamar tu hogar y poner fin a la amenaza de las máquinas. Eres... Mia'Plac, ¡y este es Miaplacidus!",
      },
    ],
    conceptsEarly: [
      {
        heading: "Recursos",
        body: "Los recursos son los bloques de construcción del juego. Pueden ser recolectados manualmente, vendidos, usados para comprar mejoras, fusionados para crear otros recursos, o posteriormente, usados en la creación de compuestos avanzados.",
      },
      {
        heading: "Obtención manual",
        body: "Todos los recursos tienen un botón que al hacer clic, añade 1 a la cantidad de ese recurso, mientras la cantidad total sea menor que el límite de almacenamiento. Esto es útil en las primeras etapas del juego para obtener pequeñas cantidades de recursos y empezar.",
      },
      {
        heading: "Vender",
        body: "Usando el menú desplegable para elegir una cantidad adecuada, y luego haciendo clic en el botón de Vender, intercambiarás la cantidad elegida de recurso (o compuesto) por Dinero, que puede ser usado para comprar ciertas mejoras.",
      },
      {
        heading: "Almacenamiento",
        body: "Cada recurso y compuesto tiene un límite de almacenamiento. Si el almacenamiento está lleno, no se puede obtener más hasta que se use parte del recurso o se aumente el almacenamiento. Mejorar el almacenamiento usa todas tus existencias menos 1 de ese recurso o compuesto.",
      },
      {
        heading: "Compradores automáticos",
        body: "Los compradores automáticos permiten automatizar la recolección de recursos una vez desbloqueados. Funcionan continuamente en segundo plano, liberándote para enfocarte en otras tareas, hasta que el almacenamiento esté lleno. Algunos requieren energía para operar.",
      },
      {
        heading: "Puntos de investigación",
        body: "Los puntos de investigación se obtienen mediante mejoras de investigación y se usan para desbloquear nuevas tecnologías.",
      },
      {
        heading: "Mejoras de investigación",
        body: "Las mejoras de investigación permiten generar puntos de investigación, aunque algunas requieren energía para operar.",
      },
      {
        heading: "Tecnología",
        body: "La tecnología desbloquea mejoras poderosas y nuevas mecánicas del juego. La mayoría de tecnologías tienen prerequisitos y un costo en puntos de investigación.",
      },
      {
        heading: "Compuestos",
        body: "Los compuestos son materiales más avanzados que requieren múltiples recursos para crearse. Son necesarios para mecánicas de juego de media y última fase.",
      },
      {
        heading: "Fusión",
        body: "La fusión es un proceso que permite crear recursos a partir de recursos más básicos.",
      },
      {
        heading: "Bandeau de noticias",
        body: "El bandeau de noticias muestra información muy importante, y a veces puede otorgar bonificaciones secretas, ¡así que mantenlo siempre vigilado!",
      },
    ],
    conceptsMid: [
      {
        heading: "Generación y consumo de energía",
        body: "La energía es necesaria para muchas mejoras, como algunos compradores automáticos y mejoras de investigación, y se consume en muchas mecánicas avanzadas. Esto se indicará en la descripción de la función. Existen instalaciones de producción y almacenamiento de energía.",
      },
      {
        heading: "Edificios de energía",
        body: "Los edificios de energía generan energía y existen varios tipos. Consumen combustible al funcionar, que puede ser compuestos o energía solar.",
      },
      {
        heading: "Baterías",
        body: "Las baterías almacenan energía excedente para usar cuando la generación es insuficiente, por ejemplo si no hay suficientes edificios de energía tras comprar una mejora, o si se agota el combustible de un edificio. Mejorar la capacidad de las baterías es clave para mantener el flujo de energía mientras se expanden las mejoras que consumen energía.",
      },
      {
        heading: "Clima",
        body: "El clima afecta varias mecánicas del juego, incluyendo la producción de energía. Puede afectar el lanzamiento de cohetes y proporcionar recursos adicionales mediante la precipitación. El clima predominante y los recursos proporcionados por la precipitación pueden variar según la estrella en juego.",
      },
      {
        heading: "Minería espacial",
        body: "La minería espacial permite extraer antimateria rara de los asteroides.",
      },
      {
        heading: "Eventos",
        body: "Eventos aleatorios pueden ocurrir a medida que progresas, ofreciendo oportunidades o desafíos inesperados. Aparecen sin advertencia y pueden otorgar recompensas únicas, imponer contratiempos temporales o desbloquear nuevos caminos. Presta atención a las notificaciones, algunos eventos son fugaces mientras que otros pueden alterar tu partida si actúas con prudencia. Puedes seguir eventos actuales e históricos en el panel de Eventos en la pestaña del menú.",
      },
      {
        heading: "Telescopio espacial",
        body: "El telescopio espacial se utiliza para escanear asteroides que pueden ser explotados por tus minadores de cohetes, y en el final del juego, para estudiar estrellas. Usar el telescopio espacial requiere mucha energía y tiene un alto costo de construcción.",
      },
      {
        heading: "Asteroides",
        body: "Los asteroides contienen antimateria. Minar asteroides requiere construir y lanzar minadores de cohetes. Algunos asteroides son fáciles de viajar y minar, mientras que otros requieren más tiempo. La cantidad de antimateria varía, y los asteroides tienen diferentes clases según su calidad. Si tienes mucha suerte, incluso puedes encontrar un asteroide legendario y ponerle tu nombre.",
      },
      {
        heading: "Plataforma de lanzamiento",
        body: "La plataforma de lanzamiento es un requisito previo para construir minadores de cohetes. Es una mejora costosa y, una vez construida, puedes ver la cantidad de minadores de cohetes que tienes y sus etapas de construcción o estado de lanzamiento.",
      },
      {
        heading: "Minadores de cohetes - Construcción",
        body: "Puedes construir hasta 4 minadores de cohetes usando compuestos avanzados y mucho dinero, siempre que hayas construido una plataforma de lanzamiento. Cada uno requiere varios módulos o piezas para construir, que se vuelven progresivamente más costosos. Por defecto se llaman Cohete 1, etc., pero se pueden renombrar.",
      },
      {
        heading: "Minadores de cohetes - Lanzamiento y viaje",
        body: "Los cohetes deben ser abastecidos y lanzados. Pueden viajar a cualquier asteroide que hayas descubierto con el telescopio espacial, siempre que estén abastecidos y lanzados. Abastecer requiere energía y tiempo, y lanzar requiere buen clima. Una vez lanzado, puedes seleccionar un destino de tu cohete desde el menú desplegable de asteroides descubiertos y hacer clic para viajar.",
      },
      {
        heading: "Minadores de cohetes - Minería",
        body: "Una vez que un minador de cohetes ha viajado a un asteroide, extraerá automáticamente antimateria del asteroide hasta agotarlo, luego regresará y necesitará reabastecimiento para usarse nuevamente. Mientras esté en un asteroide, un minador de cohetes puede minar más rápido si se usa la opción de impulso disponible en el panel de minería.",
      },
    ],
    conceptsLate: [
      {
        heading: "Mapa estelar",
        body: "El mapa estelar proporciona una vista del universo conocido y, aunque se descubre relativamente temprano en el juego, se usa mucho más tarde. Una vez que comiences a estudiar estrellas, puedes usar el mapa estelar y la tabla de datos estelares para planear tus opciones tras el renacimiento.",
      },
      {
        heading: "Antimateria",
        body: "La antimateria es un recurso avanzado usado como combustible para naves estelares y es clave para progresar hacia el renacimiento y completar el juego. Se extrae de asteroides usando minadores de cohetes.",
      },
      {
        heading: "Nave estelar - Construcción",
        body: "Construir una nave estelar es un hito importante. Las naves estelares pueden viajar a sistemas estelares distantes y permiten el renacimiento.",
      },
      {
        heading: "Nave estelar - Viaje",
        body: "Las naves estelares pueden viajar a sistemas estelares estudiados, cada uno ofreciendo clima, recursos y desafíos únicos al renacer en ellos para una nueva partida.",
      },
      {
        heading: "Diplomacia",
        body: "La mayoría de los sistemas estelares contienen vida alienígena inteligente. Debes realizar un escaneo estelar y construir un enviado para iniciarlo. El escaneo proporciona información sobre la vida en el sistema, no es obligatorio, pero si no lo haces, tu única opción será la guerra sin conocer la fuerza enemiga. Hay varias opciones al realizar estos encuentros, desde intimidarlos, intentar vasallizarlos y, si todo falla, conquistarlos. Puedes mejorar o empeorar su impresión de ti, lo que puede afectar el tamaño de su flota. Los líderes tienen rasgos que afectan cómo responden a ti, o en caso de guerra, pueden aumentar o reducir defensa, velocidad, tamaño de flota, etc.",
      },
      {
        heading: "Batalla",
        body: "No todos los sistemas son amistosos. A veces la única opción es luchar para intentar conquistarlo. Debes usar la pantalla de Hangar de Flotas para construir una fuerza de ataque e iniciar la batalla. Si pierdes, toda tu flota será destruida pero no tu nave estelar. Puedes reconstruirla, pero es costoso, así que intenta ganar.",
      },
      {
        heading: "Puntos de Ascendencia (AP)",
        body: "Los Puntos de Ascendencia (AP) se obtienen al viajar a estrellas. Simplemente, cuanto más lejos esté la estrella, más AP se otorgarán tras el renacimiento. Se pueden gastar en el Mercado Galáctico. También puedes obtenerlos liquidando todos tus recursos, compuestos y dinero una vez por partida, y algunos métodos de colonización pueden duplicar el pago.",
      },
      {
        heading: "Renacimiento",
        body: "El Renacimiento reinicia el progreso pero conquista un nuevo sistema. Cada sistema conquistado así otorga un Punto Galáctico (GP), y la habilidad especial Expansionista también otorga uno por cada sistema adicional que coloniza. Los GP son permanentes y nunca se reinician con un Renacimiento: son la moneda que se gasta en el capítulo del Cosmic Rip.",
      },
      {
        heading: "Mercado Galáctico",
        body: "El mercado galáctico es un desbloqueo importante y llega después de que tu nave alcanza el nuevo sistema en la primera partida. Allí puedes intercambiar recursos, dinero y AP.",
      },
      {
        heading: "Casino Galáctico",
        body: "El casino galáctico te permite apostar tus productos ganados con esfuerzo para obtener gratificación inmediata. Prueba tu suerte y arriesga tus recursos por posibles recompensas. Las recompensas obtenidas son solo para la partida actual, no para premios a largo plazo o de múltiples partidas.",
      },
      {
        heading: "Puntos de Casino (CP)",
        body: "Los Puntos de Casino (CP) son la moneda del casino galáctico. Debes comprar CP usando recursos o compuestos, y los CP son la única forma de jugar los juegos del casino por los distintos premios. Los CP se reinician al renacer.",
      },
      {
        heading: "Beneficios de Ascendencia",
        body: "Puedes gastar los AP adquiridos en mejoras permanentes que hacen más fáciles las futuras partidas y el juego más rejugable y divertido.",
      },
      {
        heading: "Agujero Negro",
        body: "Puedes descubrir accidentalmente un agujero negro, y una vez investigado, puede usarse para el viaje temporal, acelerando los tiempos de viaje y la recolección de recursos. Necesita cargarse, lo que toma tiempo, pero el tiempo puede reducirse con mejoras. También puedes aumentar el tiempo que permanece activo y su potencia con más mejoras, y una vez desbloqueado, está disponible en distintas partidas.",
      },
      {
        heading: "Estrellas de tipo O",
        body: "Las estrellas de tipo O son las más raras y violentas de la galaxia. Cada una que controles amplifica dramáticamente la producción de energía de un tipo de edificio de energía. Espera defensas reforzadas al intentar conquistar estos sistemas.",
      },
      {
        heading: "Estrellas de tipo B",
        body: "Las estrellas de tipo B son estrellas azules masivas y muy calientes que potencian enormemente tus Auto Buyers. Cuando estás en un sistema estelar de tipo B, todos tus Auto Buyers de Recursos reciben una bonificación fija: Nivel 1 obtiene +2/s, Nivel 2 +8/s, Nivel 3 +25/s y Nivel 4 +80/s. Esta bonificación se aplica a todos los Recursos pero no a los Compuestos, y solo durante la partida en un sistema de tipo B.",
      },
      {
        heading: "Estrellas de tipo F",
        body: "Las estrellas de tipo F son estrellas blanco-amarillas que mejoran las operaciones de minería de Antimateria. Cuando estás en un sistema estelar de tipo F, todos tus cohetes obtienen un 50% de bonificación en su tasa de extracción de Antimateria mientras minan asteroides. Esta bonificación solo se aplica durante la partida en un sistema de tipo F.",
      },
    ],
    endGoal: [
      {
        heading: "Manuscritos antiguos",
        body: "Los manuscritos antiguos te indican sistemas estelares con megastructuras. A veces surgen pistas sobre su ubicación en el bandeau de noticias, así que mantén un ojo en él.",
      },
      {
        heading: "Megastructuras",
        body: "Las megastructuras son extremadamente difíciles de conquistar y están escondidas en la galaxia, pero las recompensas son enormes. Cada una que adquieras también contribuye directamente a la destrucción del campo de fuerza de Miaplacidus.",
      },
      {
        heading: "Miaplacidus",
        body: "Miaplacidus, tu tierra natal, está protegido por un poderoso campo de fuerza mantenido por la raza de máquinas. Al desmantelar las megastructuras y conectarlas a tu causa, ese campo se debilita hasta colapsar, momento en el que enfrentarás la batalla suprema de tu vida para recuperar tu hogar ancestral.",
      },
      {
        heading: "Cosmic Rip",
        body: "El Cosmic Rip es una peligrosa anomalía que amenaza el futuro de tu pueblo. Una vez que tus fuerzas sean lo suficientemente fuertes para reclamar Miaplacidus, primero debes localizar el Rip escaneando los sectores espaciales locales. Tras localizarlo, realizarás costosos estudios y construcciones para estabilizarlo. Solo una vez estabilizado y asegurado podrás cerrarlo para siempre. Los Puntos Galácticos (GP) son la moneda de este capítulo. Se obtienen al Renacer, uno por cada sistema que conquistas, y se gastan en poner en marcha el Arreglo de Escáner de Espacio Cercano, en cada escaneo de sector mientras buscas el Rip, y en cada tecnología del Cosmic Rip que investigas.",
      },
      {
        heading: "El objetivo final",
        body: "Una vez que el campo de fuerza de Miaplacidus desaparezca, puedes atacar a la raza de IA principal, reclamar Miaplacidus, reconquistar tu hogar y cerrar el Cosmic Rip, asegurando para siempre el futuro de tu pueblo. ¡Este es el objetivo final del juego!",
      },
    ],
    philosophies: [
      {
        heading: "Filosofías",
        body: "Las filosofías se introducen lentamente durante la primera partida. Se te anima a seleccionar uno de cuatro caminos posibles, cada uno es una decisión única y permanente que se aplica al resto del juego. Una vez elegida la filosofía y completada la primera partida, aparecerá una nueva opción en la pestaña de Investigación donde podrás investigar una habilidad especial única y una serie de tecnologías repetibles únicas, adecuadas al tipo de filosofía seleccionada. Todos estos beneficios permanecen contigo durante todo el juego, incluso a través de renacimientos.",
      },
      {
        heading: "Habilidad especial",
        body: "Cada filosofía otorga una habilidad especial única. Estas son extremadamente poderosas y, de distintas formas, pueden hacer que el juego sea mucho más divertido. Cada una afecta diferentes mecánicas, por lo que es prudente pensar cuidadosamente al elegir una filosofía, ya que no puede cambiarse después y solo puede existir un camino filosófico por partida.",
      },
      {
        heading: "Tecnología repetible",
        body: "Cada filosofía otorga una serie de tecnologías únicas y repetibles. Ofrecen bonificaciones acumulables permanentes y cuestan puntos de investigación. Dependiendo de la filosofía elegida, los efectos varían y, una vez adquiridas algunas, se vuelven muy poderosas.",
      },
      {
        heading: "Constructor",
        body: "La filosofía Constructor se centra en mejoras más baratas y eficientes. Obtienes bonificaciones en los precios de los compradores automáticos, capacidad de almacenamiento, energía y precios de mejoras de investigación, y una reducción en el costo de creación de compuestos.",
      },
      {
        heading: "Supremacista",
        body: "La filosofía Supremacista se enfoca en el poder militar y la conquista. Espera flotas más duras, rápidas y económicas, y la capacidad de forzar a los enemigos a la vasallización.",
      },
      {
        heading: "Nacido del vacío",
        body: "Nacido del vacío, espera bonificaciones relacionadas con impresiones iniciales con civilizaciones en sistemas extranjeros, mejores búsquedas de asteroides y estudios estelares, oportunidades para aumentar la ganancia de AP e incluso la capacidad de saquear el vacío para obtener enormes recursos y compuestos.",
      },
      {
        heading: "Expansionista",
        body: "Los expansionistas prosperan colonizando y extendiéndose por las estrellas. Reducen el tiempo de viaje para minadores de cohetes y naves estelares y los hacen más baratos, además de obtener la capacidad de convencer a sistemas cercanos de ceder al conquistar uno.",
      },
    ],
  },
  pt: {
    getStarted: [
      {
        heading: "Introdução",
        body: "Em poucas palavras, Miaplacidus é um jogo incremental. No entanto, é muito mais do que isso, e esperamos que proporcione horas de diversão.\u003cbr/\u003e\u003cbr/\u003eQuando você inicia o jogo, tudo parece bastante desolado, porque realmente é: você foi abandonado em um planeta do sistema Spica com nada além de uma grande compreensão do universo e a capacidade de aproveitar o Hidrogênio. À medida que obtiver mais desse bloco de construção básico, poderá vendê-lo e obter algum Dinheiro.\u003cbr/\u003e\u003cbr/\u003eDe qualquer forma, antes de continuar, abra a aba Recursos e expanda a seção Gases. Você verá uma seção chamada Hidrogênio. Clique nela e a seção de Recursos será aberta. Embora possa parecer complicado no início, o conceito é bastante simples. Na parte superior, você verá um menu suspenso que permite definir uma quantidade de estoque para vender e um botão de venda. Isso vende seu Hidrogênio por Dinheiro, que pode ser visto no canto superior esquerdo da tela.\u003cbr/\u003e\u003cbr/\u003eCom algum Dinheiro no bolso, é hora de estabelecer o objetivo: ascender às estrelas! Uma tarefa difícil com apenas algumas moedas e alguns átomos de Hidrogênio, certamente concordará, mas não tema!\u003cbr/\u003e\u003cbr/\u003eEm seguida, se olhar abaixo desta seção, verá um botão de Ganho que, ao ser clicado, adiciona um átomo de Hidrogênio ao seu estoque. Você precisa armazenar esse átomo, e é aí que entra a próxima seção. Se acumular tanto Hidrogênio que seu armazenamento ficar cheio, poderá trocar tudo, exceto um, por um aumento de armazenamento. Ao fazer isso, ganhará Hidrogênio novamente, mas agora poderá coletar o dobro!\u003cbr/\u003e\u003cbr/\u003eIsso é ótimo, mas dá um certo trabalho. Para evitar isso, mais abaixo você verá uma seção que permite construir um Gerador de Hidrogênio, que daqui em diante será chamado de Comprador Automático. Com esse Comprador Automático, você pode relaxar enquanto o Hidrogênio é obtido automaticamente até que o armazenamento fique cheio, facilitando sua vida.\u003cbr/\u003e\u003cbr/\u003eAgora que a pressão diminuiu um pouco, você perceberá que existe uma aba de Pesquisa. Abri-la dará acesso a mais informações e, mais importante, ao conceito de Pontos de Pesquisa! Você pode construir um Kit Científico que começará a gerar Pontos de Pesquisa, muito lentamente no início, mas isso pode crescer rapidamente. Use o primeiro lote que gerar para abrir a seção Tecnologia e pesquisar sua primeira tecnologia, \u0027Compartilhamento de Conhecimento\u0027.\u003cbr/\u003e\u003cbr/\u003eParabéns! Você acabou de compreender o conceito principal de Miaplacidus: coletar e comprar recompensas com seus ganhos.\u003cbr/\u003e\u003cbr/\u003eEventualmente, poderá usar esse ciclo para descobrir novos elementos e aumentar esses números muito além do que imaginava.\u003cbr/\u003e\u003cbr/\u003eObrigado por ler! Agora fique à vontade para explorar outros tópicos na Miaplaedia para obter mais contexto.",
      },
    ],
    story: [
      {
        heading: "História",
        body: "Você é miaplacideano. Um dia, viveu em um mundo exuberante e pacífico orbitando Beta Carinae, conhecido pelo seu povo como Miaplacidus. Durante eras, sua civilização prosperou: cultivando a terra, avançando no conhecimento e, eventualmente, colonizando todo o seu sistema estelar. A vida era boa e nada mais era necessário. Isso mudou no dia em que um cientista descobriu uma estranha perturbação no vazio que cercava seu sistema. Movido pela curiosidade e pelo sacrifício, ele entrou nela e nunca mais voltou. Sem que você soubesse na época, ele havia atravessado para um sistema distante e revelado sua existência a uma raça avançada de IA.\n\nEssa espécie de IA seguiu seu caminho de volta através do portal, agora permanente, e lançou uma invasão devastadora. Em questão de dias, o sistema Miaplacidus caiu. A maioria foi perdida. Você e alguns poucos escaparam por pouco. Embarcando em uma nave experimental equipada com uma tecnologia de dobra não testada, vocês fugiram para o vazio. Mas o salto não saiu como planejado. Você foi lançado para longe de casa, perdeu a consciência e vagou pelo espaço.\n\nQuando finalmente despertou, encontrou-se sozinho no sistema Spica, a aproximadamente 100 anos-luz de sua origem. Seu povo se foi. Seu mundo se foi. Mas sua história está apenas começando.",
      },
      {
        heading: "Hoje",
        body: "Você pousou em um mundo exuberante e vibrante no sistema Spica. Lá, encontrou uma espécie nativa senciente: os Spicites. Eles o receberam com curiosidade e gentileza, convidando-o a compartilhar refeições e aprender seus costumes. Embora a comunicação fosse imperfeita, eles não demonstraram agressividade. Com o tempo, você se acostumou com eles, adaptando-se à sua cultura e ao ritmo de sua vida.\n\nEles começaram a chamá-lo de Mia\u0027Plac, talvez uma tradução equivocada de sua origem ou talvez uma palavra com um significado mais profundo em seu idioma. Seja como for, o nome permaneceu, assim como seu lugar entre eles. Com sabedoria, liderança e seu conhecimento avançado, você conquistou a confiança deles e acabou liderando sua colônia. Agora supervisiona a coleta de recursos e o avanço da pesquisa para conduzir esse assentamento rumo ao futuro.\n\nNo entanto, dentro de você, um fogo ainda arde. Você não esqueceu Miaplacidus. Não esqueceu seu povo. Enquanto constrói um futuro aqui, dedica sua vida a descobrir a verdade sobre o que aconteceu, encontrar o caminho de volta e corrigir tudo.",
      },
      {
        heading: "Futuro",
        body: "Equipado com pouco mais que um laboratório modesto, algumas matérias-primas e uma faísca de hidrogênio, você começa seu trabalho. Os Spicites olham para você em busca de orientação, sua confiança inabalável. Embora o mundo deles seja primitivo para seus padrões, seu espírito é forte e sua liderança promete despertar uma nova era.\n\nCom seu conhecimento de ciência avançada e dos segredos do vazio, você introduz ideias que aceleram o progresso muito além do que esta colônia poderia ter alcançado sozinha. À medida que as primeiras estruturas surgem e a pesquisa começa, rumores começam a circular: comerciantes falam de sistemas distantes e hostis, de IA rebelde, Megasestruturas colossais e mundos sem vida reduzidos a cinzas.\n\nVocê escuta e se lembra. Os invasores. A perda. A traição das estrelas. Essas histórias apenas fortalecem sua determinação. Você levará os Spicites além de seu mundo, rumo às estrelas e através do vazio. Descobrirá o que aconteceu com Miaplacidus. E um dia retornará, não como exilado, mas com força, para reivindicar seu lar e pôr fim à ameaça das máquinas. Você é... Mia'Plac, e este é Miaplacidus!",
      },
    ],
    conceptsEarly: [
      {
        heading: "Recursos",
        body: "Os recursos são os blocos de construção do jogo. Eles podem ser coletados manualmente, vendidos, usados para comprar melhorias, fundidos para criar outros recursos ou, posteriormente, usados na criação de compostos avançados.",
      },
      {
        heading: "Obtenção manual",
        body: "Todos os recursos têm um botão que, quando clicado, adiciona 1 à quantidade daquele recurso, desde que a quantidade total seja menor que o limite de armazenamento. Isso é útil nas primeiras etapas do jogo para obter pequenas quantidades de recursos e começar.",
      },
      {
        heading: "Vender",
        body: "Usando o menu suspenso para escolher uma quantidade adequada e depois clicando no botão Vender, você trocará a quantidade escolhida do recurso (ou composto) por Dinheiro, que pode ser usado para comprar certas melhorias.",
      },
      {
        heading: "Armazenamento",
        body: "Cada recurso e composto possui um limite de armazenamento. Se o armazenamento estiver cheio, não será possível obter mais até que parte do recurso seja usada ou o armazenamento seja aumentado. Melhorar o armazenamento usa todo o seu estoque, exceto 1 unidade, daquele recurso ou composto.",
      },
      {
        heading: "Compradores automáticos",
        body: "Os compradores automáticos permitem automatizar a coleta de recursos depois de desbloqueados. Eles funcionam continuamente em segundo plano, permitindo que você se concentre em outras tarefas, até que o armazenamento fique cheio. Alguns requerem energia para funcionar.",
      },
      {
        heading: "Pontos de pesquisa",
        body: "Os pontos de pesquisa são obtidos por meio de melhorias de pesquisa e usados para desbloquear novas tecnologias.",
      },
      {
        heading: "Melhorias de pesquisa",
        body: "As melhorias de pesquisa permitem gerar pontos de pesquisa, embora algumas exijam energia para funcionar.",
      },
      {
        heading: "Tecnologia",
        body: "A tecnologia desbloqueia melhorias poderosas e novas mecânicas do jogo. A maioria das tecnologias possui pré-requisitos e um custo em pontos de pesquisa.",
      },
      {
        heading: "Compostos",
        body: "Os compostos são materiais mais avançados que exigem vários recursos para serem criados. Eles são necessários para as mecânicas de jogo de meio e fim de partida.",
      },
      {
        heading: "Fusão",
        body: "A fusão é um processo que permite criar recursos a partir de recursos mais básicos.",
      },
      {
        heading: "Faixa de notícias",
        body: "A faixa de notícias exibe informações muito importantes e, às vezes, pode conceder bônus secretos, então fique sempre de olho nela!",
      },
    ],
    conceptsMid: [
      {
        heading: "Geração e consumo de energia",
        body: "A energia é necessária para muitas melhorias, como alguns compradores automáticos e melhorias de pesquisa, e é consumida em muitas mecânicas avançadas. Isso será indicado na descrição do recurso. Existem instalações de produção e armazenamento de energia.",
      },
      {
        heading: "Edifícios de energia",
        body: "Os edifícios de energia geram energia e existem vários tipos. Eles consomem combustível durante o funcionamento, que pode ser compostos ou energia solar.",
      },
      {
        heading: "Baterias",
        body: "As baterias armazenam energia excedente para ser usada quando a geração é insuficiente, por exemplo, se não houver edifícios de energia suficientes após comprar uma melhoria ou se o combustível de um edifício acabar. Melhorar a capacidade das baterias é fundamental para manter o fluxo de energia enquanto você expande as melhorias que consomem energia.",
      },
      {
        heading: "Clima",
        body: "O clima afeta várias mecânicas do jogo, incluindo a produção de energia. Ele pode afetar o lançamento de foguetes e fornecer recursos adicionais por meio da precipitação. O clima predominante e os recursos fornecidos pela precipitação podem variar de acordo com a estrela em jogo.",
      },
      {
        heading: "Mineração espacial",
        body: "A mineração espacial permite extrair antimatéria rara de asteroides.",
      },
      {
        heading: "Eventos",
        body: "Eventos aleatórios podem ocorrer à medida que você progride, oferecendo oportunidades ou desafios inesperados. Eles aparecem sem aviso e podem conceder recompensas únicas, impor contratempos temporários ou desbloquear novos caminhos. Preste atenção às notificações; alguns eventos são passageiros, enquanto outros podem alterar sua partida se você agir com prudência. Você pode acompanhar os eventos atuais e históricos no painel Eventos, na aba do menu.",
      },
      {
        heading: "Telescópio espacial",
        body: "O telescópio espacial é usado para escanear asteroides que podem ser explorados pelos seus mineradores de foguetes e, no final do jogo, para estudar estrelas. Usar o telescópio espacial requer muita energia e tem um alto custo de construção.",
      },
      {
        heading: "Asteroides",
        body: "Os asteroides contêm antimatéria. Minerar asteroides requer construir e lançar mineradores de foguetes. Alguns asteroides são fáceis de alcançar e minerar, enquanto outros exigem mais tempo. A quantidade de antimatéria varia, e os asteroides possuem diferentes classes de acordo com sua qualidade. Se tiver muita sorte, poderá até encontrar um asteroide lendário e dar seu nome a ele.",
      },
      {
        heading: "Plataforma de lançamento",
        body: "A plataforma de lançamento é um pré-requisito para construir mineradores de foguetes. É uma melhoria cara e, depois de construída, você poderá ver a quantidade de mineradores de foguetes que possui e seus estágios de construção ou status de lançamento.",
      },
      {
        heading: "Mineradores de foguetes - Construção",
        body: "Você pode construir até 4 mineradores de foguetes usando compostos avançados e muito dinheiro, desde que tenha construído uma plataforma de lançamento. Cada um requer vários módulos ou peças para ser construído, que se tornam progressivamente mais caros. Por padrão, eles são chamados de Foguete 1, etc., mas podem ser renomeados.",
      },
      {
        heading: "Mineradores de foguetes - Lançamento e viagem",
        body: "Os foguetes precisam ser abastecidos e lançados. Eles podem viajar para qualquer asteroide que você tenha descoberto com o telescópio espacial, desde que estejam abastecidos e lançados. Abastecer requer energia e tempo, e lançar requer bom clima. Depois de lançado, você pode selecionar um destino para o seu foguete no menu suspenso de asteroides descobertos e clicar para viajar.",
      },
      {
        heading: "Mineradores de foguetes - Mineração",
        body: "Depois que um minerador de foguetes viajar até um asteroide, ele extrairá automaticamente antimatéria do asteroide até esgotá-lo. Depois, retornará e precisará ser reabastecido para ser usado novamente. Enquanto estiver em um asteroide, um minerador de foguetes pode minerar mais rapidamente se você usar a opção de impulso disponível no painel de mineração.",
      },
    ],
    conceptsLate: [
      {
        heading: "Mapa estelar",
        body: "O mapa estelar fornece uma visão do universo conhecido e, embora seja descoberto relativamente cedo no jogo, é usado muito mais tarde. Depois que começar a estudar estrelas, você poderá usar o mapa estelar e a tabela de dados estelares para planejar suas opções após o renascimento.",
      },
      {
        heading: "Antimatéria",
        body: "A antimatéria é um recurso avançado usado como combustível para naves estelares e é fundamental para progredir rumo ao renascimento e concluir o jogo. Ela é extraída de asteroides usando mineradores de foguetes.",
      },
      {
        heading: "Nave estelar - Construção",
        body: "Construir uma nave estelar é um marco importante. As naves estelares podem viajar para sistemas estelares distantes e permitem o renascimento.",
      },
      {
        heading: "Nave estelar - Viagem",
        body: "As naves estelares podem viajar para sistemas estelares estudados, cada um oferecendo clima, recursos e desafios únicos ao renascer neles para uma nova partida.",
      },
      {
        heading: "Diplomacia",
        body: "A maioria dos sistemas estelares contém vida alienígena inteligente. Você deve realizar um escaneamento estelar e construir um enviado para iniciá-lo. O escaneamento fornece informações sobre a vida no sistema. Ele não é obrigatório, mas, se você não o fizer, sua única opção será a guerra sem conhecer a força inimiga. Existem várias opções ao realizar esses encontros, desde intimidá-los, tentar torná-los vassalos e, se tudo falhar, conquistá-los. Você pode melhorar ou piorar a impressão que eles têm de você, o que pode afetar o tamanho da frota deles. Os líderes possuem características que afetam como respondem a você ou, em caso de guerra, podem aumentar ou reduzir defesa, velocidade, tamanho da frota etc.",
      },
      {
        heading: "Batalha",
        body: "Nem todos os sistemas são amigáveis. Às vezes, a única opção é lutar para tentar conquistá-los. Você deve usar a tela Hangar da Frota para construir uma força de ataque e iniciar a batalha. Se perder, toda a sua frota será destruída, mas não sua nave estelar. Você pode reconstruí-la, mas é caro, então tente vencer.",
      },
      {
        heading: "Pontos de Ascendência (AP)",
        body: "Os Pontos de Ascendência (AP) são obtidos ao viajar para estrelas. De forma simples, quanto mais distante estiver a estrela, mais AP serão concedidos após o renascimento. Eles podem ser gastos no Mercado Galáctico. Você também pode obtê-los liquidando todos os seus recursos, compostos e dinheiro uma vez por partida, e alguns métodos de colonização podem duplicar o pagamento.",
      },
      {
        heading: "Renascimento",
        body: "O renascimento reinicia o progresso, mas conquista um novo sistema. Cada sistema conquistado assim concede um Ponto Galáctico (GP), e a habilidade especial Expansionista também concede um por cada sistema adicional que coloniza. Os GP são permanentes e nunca são reiniciados por um Renascimento: são a moeda gasta no capítulo do Cosmic Rip.",
      },
      {
        heading: "Mercado Galáctico",
        body: "O Mercado Galáctico é um desbloqueio importante e fica disponível depois que sua nave chega ao novo sistema na primeira partida. Lá, você pode trocar recursos, dinheiro e AP.",
      },
      {
        heading: "Cassino Galáctico",
        body: "O Cassino Galáctico permite apostar seus produtos conquistados com esforço em busca de gratificação imediata. Teste sua sorte e arrisque seus recursos por possíveis recompensas. As recompensas obtidas são apenas para a partida atual, não para prêmios de longo prazo ou de várias partidas.",
      },
      {
        heading: "Pontos de Cassino (CP)",
        body: "Os Pontos de Cassino (CP) são a moeda do Cassino Galáctico. Você deve comprar CP usando recursos ou compostos, e os CP são a única maneira de jogar os jogos do cassino pelos diferentes prêmios. Os CP são reiniciados ao renascer.",
      },
      {
        heading: "Benefícios de Ascendência",
        body: "Você pode gastar os AP adquiridos em melhorias permanentes que tornam as futuras partidas mais fáceis e o jogo mais rejogável e divertido.",
      },
      {
        heading: "Buraco Negro",
        body: "Você pode descobrir acidentalmente um buraco negro e, depois de pesquisá-lo, usá-lo para viagens no tempo, acelerando os tempos de viagem e a coleta de recursos. Ele precisa ser carregado, o que leva tempo, mas esse tempo pode ser reduzido com melhorias. Você também pode aumentar o tempo que ele permanece ativo e sua potência com mais melhorias. Depois de desbloqueado, ele fica disponível em diferentes partidas.",
      },
      {
        heading: "Estrelas do tipo O",
        body: "As estrelas do tipo O são as mais raras e violentas da galáxia. Cada uma que você controla amplifica drasticamente a produção de energia de um tipo de edifício de energia. Espere defesas reforçadas ao tentar conquistar esses sistemas.",
      },
      {
        heading: "Estrelas do tipo B",
        body: "As estrelas do tipo B são estrelas azuis, massivas e muito quentes que potencializam enormemente seus Compradores Automáticos. Quando você está em um sistema estelar do tipo B, todos os seus Compradores Automáticos de Recursos recebem um bônus fixo: Nível 1 obtém +2/s, Nível 2 +8/s, Nível 3 +25/s e Nível 4 +80/s. Esse bônus se aplica a todos os Recursos, mas não aos Compostos, e somente durante a partida em um sistema do tipo B.",
      },
      {
        heading: "Estrelas do tipo F",
        body: "As estrelas do tipo F são estrelas branco-amareladas que melhoram as operações de mineração de Antimatéria. Quando você está em um sistema estelar do tipo F, todos os seus foguetes recebem um bônus de 50% na taxa de extração de Antimatéria enquanto mineram asteroides. Esse bônus só se aplica durante a partida em um sistema do tipo F.",
      },
    ],
    endGoal: [
      {
        heading: "Manuscritos antigos",
        body: "Os manuscritos antigos indicam sistemas estelares com megasestruturas. Às vezes, pistas sobre sua localização aparecem na faixa de notícias, então fique de olho nela.",
      },
      {
        heading: "Megasestruturas",
        body: "As megasestruturas são extremamente difíceis de conquistar e estão escondidas na galáxia, mas as recompensas são enormes. Cada uma que você adquirir também contribui diretamente para a destruição do campo de força de Miaplacidus.",
      },
      {
        heading: "Miaplacidus",
        body: "Miaplacidus, sua terra natal, é protegido por um poderoso campo de força mantido pela raça de máquinas. Ao desmantelar as megasestruturas e conectá-las à sua causa, esse campo enfraquece até colapsar, momento em que você enfrentará a batalha suprema de sua vida para recuperar seu lar ancestral.",
      },
      {
        heading: "Cosmic Rip",
        body: "O Cosmic Rip é uma anomalia perigosa que ameaça o futuro do seu povo. Quando suas forças forem fortes o suficiente para reivindicar Miaplacidus, você deverá primeiro localizar o Rip escaneando os setores espaciais locais. Depois de localizá-lo, realizará estudos e construções dispendiosos para estabilizá-lo. Somente depois de estabilizá-lo e protegê-lo poderá fechá-lo para sempre. Os Pontos Galácticos (GP) são a moeda deste capítulo. Ganha-os ao Renascer, um por cada sistema que conquista, e gasta-os para pôr o Conjunto de Scanners do Espaço Próximo a funcionar, em cada análise de setor enquanto procura o Rip, e em cada tecnologia do Cosmic Rip que investiga.",
      },
      {
        heading: "O objetivo final",
        body: "Quando o campo de força de Miaplacidus desaparecer, você poderá atacar a principal raça de IA, reivindicar Miaplacidus, reconquistar seu lar e fechar o Cosmic Rip, garantindo para sempre o futuro do seu povo. Este é o objetivo final do jogo!",
      },
    ],
    philosophies: [
      {
        heading: "Filosofias",
        body: "As filosofias são introduzidas lentamente durante a primeira partida. Você é incentivado a selecionar um de quatro caminhos possíveis; cada um é uma decisão única e permanente que se aplica ao restante do jogo. Depois de escolher a filosofia e concluir a primeira partida, uma nova opção aparecerá na aba Pesquisa, onde você poderá pesquisar uma habilidade especial única e uma série de tecnologias repetíveis exclusivas, adequadas ao tipo de filosofia selecionada. Todos esses benefícios permanecem com você durante todo o jogo, inclusive através dos renascimentos.",
      },
      {
        heading: "Habilidade especial",
        body: "Cada filosofia concede uma habilidade especial única. Elas são extremamente poderosas e, de diferentes maneiras, podem tornar o jogo muito mais divertido. Cada uma afeta diferentes mecânicas, portanto é aconselhável pensar cuidadosamente ao escolher uma filosofia, pois ela não pode ser alterada depois e só pode existir um caminho filosófico por partida.",
      },
      {
        heading: "Tecnologia repetível",
        body: "Cada filosofia concede uma série de tecnologias únicas e repetíveis. Elas oferecem bônus permanentes cumulativos e custam pontos de pesquisa. Dependendo da filosofia escolhida, os efeitos variam e, depois que algumas são adquiridas, tornam-se muito poderosas.",
      },
      {
        heading: "Construtor",
        body: "A filosofia Construtor concentra-se em melhorias mais baratas e eficientes. Você recebe bônus nos preços dos compradores automáticos, capacidade de armazenamento, energia e preços das melhorias de pesquisa, além de uma redução no custo de criação de compostos.",
      },
      {
        heading: "Supremacista",
        body: "A filosofia Supremacista concentra-se no poder militar e na conquista. Espere frotas mais resistentes, rápidas e baratas, além da capacidade de forçar inimigos à vassalização.",
      },
      {
        heading: "Nascido do vazio",
        body: "Nascido do vazio oferece bônus relacionados às impressões iniciais com civilizações em sistemas estrangeiros, melhores buscas por asteroides e estudos estelares, oportunidades de aumentar o ganho de AP e até a capacidade de saquear o vazio para obter enormes quantidades de recursos e compostos.",
      },
      {
        heading: "Expansionista",
        body: "Os expansionistas prosperam colonizando e se espalhando pelas estrelas. Eles reduzem o tempo de viagem de mineradores de foguetes e naves estelares e os tornam mais baratos, além de obter a capacidade de convencer sistemas próximos a se renderem ao conquistar um deles.",
      },
    ],
  },
  de: {
    getStarted: [
      {
        heading: "Einführung",
        body: "Miaplacidus ist im Kern ein Incremental Game. Es ist jedoch viel mehr als das und soll dir hoffentlich viele Stunden Spielspaß bieten.\u003cbr/\u003e\u003cbr/\u003eWenn du das Spiel startest, wirkt es zunächst ziemlich trostlos, was auch zutrifft, da du auf einem Planeten im Spica-System mit nichts außer einem großen Verständnis des Universums und der Fähigkeit, Wasserstoff zu nutzen, zurückgelassen wurdest. Mit zunehmendem Erwerb dieses grundlegenden Bausteins kannst du ihn verkaufen und etwas Geld verdienen.\u003cbr/\u003e\u003cbr/\u003eÖffne zunächst den Ressourcen-Reiter und erweitere den Abschnitt Gase. Dort findest du den Bereich Wasserstoff. Klicke darauf, und der Ressourcenbereich öffnet sich. Obwohl es zunächst überwältigend wirken kann, ist das Konzept recht einfach. Oben siehst du ein Dropdown-Menü, mit dem du die Menge zum Verkauf festlegen kannst, sowie einen Verkaufsbutton. So verkaufst du deinen Wasserstoff gegen Geld, das oben links auf dem Bildschirm angezeigt wird.\u003cbr/\u003e\u003cbr/\u003eMit etwas Geld in der Tasche ist es Zeit, das Ziel anzugehen: den Aufstieg zu den Sternen! Eine große Aufgabe aus ein paar Münzen und Wasserstoffatomen, aber keine Sorge!\u003cbr/\u003e\u003cbr/\u003eUnter diesem Abschnitt findest du die Schaltfläche \u0027Gewinn\u0027, die beim Anklicken ein Wasserstoffatom zu deinen Vorräten hinzufügt. Du musst dieses Atom lagern, wofür der nächste Abschnitt wichtig ist. Wenn du so viel Wasserstoff sammelst, dass dein Speicher voll ist, kannst du alle bis auf ein Atom gegen eine Speichererweiterung eintauschen, wodurch du wieder Wasserstoff sammeln kannst, nun jedoch doppelt so viel!\u003cbr/\u003e\u003cbr/\u003eDas ist praktisch, aber etwas arbeitsintensiv. Um das zu umgehen, gibt es unten einen Abschnitt zum Bau eines Wasserstoffgenerators, ab jetzt Auto-Käufer genannt. Mit diesem Auto-Käufer kannst du dich zurücklehnen, während der Wasserstoff automatisch gesammelt wird, bis der Speicher voll ist, was das Leben erheblich erleichtert.\u003cbr/\u003e\u003cbr/\u003eMit etwas weniger Druck wirst du den Reiter Forschung bemerken. Dort erhältst du Zugriff auf weitere Informationen, insbesondere auf Forschungspunkte! Du kannst ein Wissenschaftskit bauen, das langsam Forschungspunkte generiert, die aber schnell wachsen können. Nutze die erste Ladung, um die Technologie-Sektion zu öffnen und deine erste Technologie \u0027Wissensaustausch\u0027 zu erforschen.\u003cbr/\u003e\u003cbr/\u003eHerzlichen Glückwunsch, du hast das Hauptkonzept von Miaplacidus verstanden: Sammeln und Belohnungen durch Gewinne kaufen.\u003cbr/\u003e\u003cbr/\u003eSchließlich wirst du diese Schleife nutzen können, um neue Elemente zu entdecken und deine Zahlen über das Vorstellbare hinaus zu steigern!\u003cbr/\u003e\u003cbr/\u003eDanke fürs Lesen, erkunde nun ruhig weitere Themen in der Miaplaedia für mehr Kontext!",
      },
    ],
    story: [
      {
        heading: "Geschichte",
        body: "Du bist ein Miaplacideaner. Einst lebtest du auf einer üppigen und friedlichen Welt, die Beta Carinae umkreist und deinem Volk als Miaplacidus bekannt ist. Über Äonen hinweg blühte deine Zivilisation – Landwirtschaft, Wissensfortschritt und schließlich die Kolonisierung deines gesamten Sternensystems. Das Leben war gut, es bestand kein Bedarf an mehr. Dies änderte sich, als ein Wissenschaftler eine seltsame Störung im Raum um dein System entdeckte. Aus Neugier und Opferbereitschaft betrat er sie und kehrte nie zurück. Ohne dass du es wusstest, überschritt er ein entferntes System und offenbarte eure Existenz einer fortgeschrittenen KI-Rasse.\n\nDiese KI folgte seinem Pfad durch das nun permanente Portal zurück und startete eine verheerende Invasion. Innerhalb weniger Tage fiel das Miaplacidus-System. Die meisten wurden ausgelöscht. Du und einige andere entkamt knapp. An Bord eines experimentellen Schiffs mit ungetesteter Warp-Technologie flohst du ins All. Der Sprung verlief jedoch nicht wie geplant. Du wurdest weit weg von zu Hause geschleudert, verlorst das Bewusstsein und trieb durchs All.\n\nAls du schließlich erwachtest, befandest du dich allein im Spica-System – etwa 100 Lichtjahre von deinem Ursprung entfernt. Dein Volk ist verschwunden. Deine Welt ist verschwunden. Aber deine Geschichte beginnt gerade erst.",
      },
      {
        heading: "Heute",
        body: "Du landetest auf einer üppigen, lebendigen Welt im Spica-System. Dort begegnetest du einer intelligenten einheimischen Spezies – den Spiciten. Sie empfingen dich neugierig und freundlich, luden dich zu Mahlzeiten ein und zeigten dir ihre Lebensweise. Obwohl die Kommunikation unvollkommen war, zeigten sie keine Aggression. Mit der Zeit fühltest du dich bei ihnen wohl und passtest dich an ihre Kultur und Rhythmen an.\n\nSie begannen, dich Mia\u0027Plac zu nennen – vielleicht eine Fehlübersetzung deines Ursprungs oder ein Wort mit tieferer Bedeutung in ihrer Sprache. Wie auch immer, der Name blieb, und ebenso dein Platz unter ihnen. Durch Weisheit, Führung und dein fortgeschrittenes Wissen gewannst du ihr Vertrauen und stiegst schließlich an die Spitze ihrer Kolonie. Nun leitest du die Ressourcensammlung und den Forschungsfortschritt, um diese wachsende Siedlung in die Zukunft zu führen.\n\nDoch tief im Inneren brennt noch ein Feuer. Du hast Miaplacidus nicht vergessen. Dein Volk hast du nicht vergessen. Während du hier eine Zukunft aufbaust, widmest du dein Leben der Aufdeckung der Wahrheit – um einen Weg zurückzufinden und alles richtig zu stellen.",
      },
      {
        heading: "Zukunft",
        body: "Mit nicht viel mehr als einem bescheidenen Labor, einigen Rohmaterialien und einem Funken Wasserstoff beginnst du deine Arbeit. Die Spiciten schauen zu dir auf, ihr Vertrauen unerschütterlich. Obwohl ihre Welt nach deinen Maßstäben primitiv ist, ist ihr Geist stark, und deine Führung verspricht eine neue Ära einzuleiten.\n\nMit deinem Wissen über fortgeschrittene Wissenschaft und die Geheimnisse des Alls führst du Ideen ein, die den Fortschritt weit über das hinaus beschleunigen, was diese Kolonie allein erreicht hätte. Wenn die ersten Strukturen entstehen und die Forschung beginnt, machen sich Gerüchte breit – Händler sprechen von fernen, feindlichen Systemen. Sie berichten von abtrünnigen KIs, kolossalen Megastrukturen und leblosen Welten, die zu Asche geworden sind.\n\nDu hörst zu und erinnerst dich. Die Eindringlinge. Der Verlust. Der Verrat der Sterne. Diese Geschichten stärken nur deinen Entschluss. Du wirst die Spiciten über ihre Welt hinausführen, zu den Sternen und durch das All. Du wirst herausfinden, was aus Miaplacidus wurde. Und eines Tages wirst du zurückkehren – nicht ins Exil, sondern in Stärke – um dein Zuhause zurückzuerobern und die Bedrohung durch die Maschinen endgültig zu beenden. Du bist... Mia'Plac, und dies ist Miaplacidus!",
      },
    ],
    conceptsEarly: [
      {
        heading: "Ressourcen",
        body: "Ressourcen sind die Bausteine des Spiels. Sie können manuell gesammelt, verkauft, zum Kauf von Upgrades genutzt, zu anderen Ressourcen fusioniert oder später für die Erstellung fortgeschrittener Verbindungen verwendet werden.",
      },
      {
        heading: "Manuelles Sammeln",
        body: "Alle Ressourcen haben einen Button, der beim Anklicken 1 zur Menge der Ressource hinzufügt, solange die Gesamtkapazität unter dem Lagerlimit liegt. Dies ist in den frühen Spielphasen nützlich, um kleine Mengen zu sammeln, um loszulegen!",
      },
      {
        heading: "Verkaufen",
        body: "Über das Dropdown-Menü wählst du eine geeignete Menge aus und klickst dann auf den Verkaufen-Button, um die gewählte Menge an Ressourcen (oder später Verbindungen) gegen Geld einzutauschen, das zum Kauf bestimmter Upgrades genutzt werden kann.",
      },
      {
        heading: "Lager",
        body: "Jede Ressource und Verbindung hat ein Lagerlimit. Wenn das Lager voll ist, können keine weiteren Einheiten gewonnen werden, bis einige verwendet oder das Lager erweitert wird. Das Aufrüsten des Lagers verbraucht alle bis auf 1 deiner Bestände dieser Ressource oder Verbindung.",
      },
      {
        heading: "Auto-Käufer",
        body: "Auto-Käufer ermöglichen es, die Sammlung von Ressourcen nach dem Freischalten zu automatisieren. Sie arbeiten kontinuierlich im Hintergrund, sodass du dich auf andere Aufgaben konzentrieren kannst, bis das Lager voll ist. Einige benötigen Energie zum Betrieb.",
      },
      {
        heading: "Forschungspunkte",
        body: "Forschungspunkte werden durch Forschungs-Upgrades gewonnen und dienen zum Freischalten neuer Technologien.",
      },
      {
        heading: "Forschungs-Upgrades",
        body: "Forschungs-Upgrades ermöglichen es, Forschungspunkte zu generieren, wobei einige Energie zum Betrieb benötigen.",
      },
      {
        heading: "Technologie",
        body: "Technologie schaltet mächtige Upgrades und neue Spielmechaniken frei. Die meisten Technologien haben Voraussetzungen und kosten Forschungspunkte.",
      },
      {
        heading: "Verbindungen",
        body: "Verbindungen sind fortgeschrittene Materialien, die mehrere Ressourcen zur Herstellung benötigen. Sie werden für mittlere bis späte Spielmechaniken benötigt.",
      },
      {
        heading: "Fusion",
        body: "Fusion ist ein Prozess, der es ermöglicht, Ressourcen aus grundlegenderen Ressourcen zu erstellen.",
      },
      {
        heading: "Nachrichten-Ticker",
        body: "Der Nachrichten-Ticker zeigt sehr wichtige (wirklich!) Informationen an und kann manchmal geheime Boni liefern, also behalte ihn immer im Auge.",
      },
    ],
    conceptsMid: [
      {
        heading: "Energieerzeugung \u0026 -verbrauch",
        body: "Energie wird benötigt, um viele Upgrades zu betreiben, wie einige Auto-Käufer und Forschungs-Upgrades, und wird in vielen späteren Spielmechaniken verbraucht. Wenn dies der Fall ist, wird es in der Beschreibung angegeben. Es gibt Energieproduktions- und Energiespeicheranlagen.",
      },
      {
        heading: "Kraftwerke",
        body: "Kraftwerke erzeugen Energie, und es gibt verschiedene Typen. Sie verbrauchen beim Betrieb Treibstoff, manchmal Verbindungen, in anderen Fällen Solarenergie.",
      },
      {
        heading: "Batterien",
        body: "Batterien speichern überschüssige Energie für Zeiten, in denen die Erzeugung nicht ausreicht, z. B. wenn nach dem Kauf eines Upgrades nicht genügend Kraftwerke vorhanden sind oder der Treibstoff eines bestimmten Kraftwerks erschöpft ist. Das Aufrüsten der Batteriekapazität ist entscheidend, um den Energiefluss aufrechtzuerhalten und Upgrades, die Energie verbrauchen, zu erweitern.",
      },
      {
        heading: "Wetter",
        body: "Das Wetter beeinflusst verschiedene Spielmechaniken, einschließlich der Energieproduktion. Es kann den Start von Raketen beeinflussen und zusätzliche Ressourcen durch Niederschlag liefern. Das vorherrschende Wetter und die durch Niederschlag bereitgestellte Ressource können je nach Stern variieren, auf dem gespielt wird (späte Spielmechanik).",
      },
      {
        heading: "Weltraumbergbau",
        body: "Weltraumbergbau ermöglicht die Gewinnung seltener Antimaterie aus Asteroiden.",
      },
      {
        heading: "Ereignisse",
        body: "Zufällige Ereignisse können während des Spiels auftreten und unerwartete Chancen oder Herausforderungen bringen. Sie erscheinen ohne Vorwarnung und können einzigartige Belohnungen bieten, temporäre Rückschläge verursachen oder neue Wege freischalten. Achte auf Benachrichtigungen – einige Ereignisse sind flüchtig, andere können den Verlauf deines Laufs verändern, wenn du klug handelst. Du kannst aktuelle und historische Ereignisse im Ereignis-Panel im Menü verfolgen.",
      },
      {
        heading: "Weltraumteleskop",
        body: "Das Weltraumteleskop wird verwendet, um nach Asteroiden zu scannen, die von deinen Raketenminen abgebaut werden können, und im späten Spiel, um Sterne zu studieren. Die Nutzung des Teleskops erfordert viel Energie und hat hohe Baukosten.",
      },
      {
        heading: "Asteroiden",
        body: "Asteroiden enthalten Antimaterie. Der Abbau von Asteroiden erfordert den Bau und Start von Raketenminen. Einige Asteroiden sind leicht zu erreichen und abzubauen, andere benötigen mehr Zeit. Die Menge an Antimaterie variiert, und Asteroiden haben unterschiedliche Klassen je nach Qualität. Bei Glück findest du vielleicht einen legendären Asteroiden und kannst ihn nach dir benennen!",
      },
      {
        heading: "Startrampe",
        body: "Die Startrampe ist Voraussetzung für den Bau von Raketenminen. Sie ist ein teures Upgrade, und sobald gebaut, siehst du die Anzahl deiner Raketenminen und deren Bau- bzw. Startstatus.",
      },
      {
        heading: "Raketenminen – Bau",
        body: "Du kannst bis zu 4 Raketenminen mit fortgeschrittenen Verbindungen und viel Geld bauen, vorausgesetzt, du hast die Startrampe gebaut. Jede benötigt eine Anzahl von Modulen oder Bauteilen, die zunehmend teurer werden. Standardmäßig heißen sie Rakete 1 usw., können aber umbenannt werden.",
      },
      {
        heading: "Raketenminen – Start \u0026 Reise",
        body: "Raketen müssen betankt und gestartet werden. Sie können zu jedem Asteroiden reisen, den du mit dem Weltraumteleskop entdeckt hast, sofern sie betankt und gestartet sind. Betanken erfordert Energie und Zeit, Starten gutes Wetter. Nach dem Start kannst du ein Ziel für deine Rakete aus dem Dropdown-Menü der entdeckten Asteroiden auswählen und auf \u0027Reisen\u0027 klicken.",
      },
      {
        heading: "Raketenminen – Abbau",
        body: "Sobald eine Raketenmine einen Asteroiden erreicht hat, baut sie automatisch Antimaterie ab, bis sie erschöpft ist, und kehrt dann zurück und benötigt erneut Betankung. An einem Asteroiden kann die Raketenmine schneller abbauen, wenn die Boost-Option im Bergbau-Panel verwendet wird.",
      },
    ],
    conceptsLate: [
      {
        heading: "Sternenkarte",
        body: "Die Sternenkarte bietet einen Überblick über das bekannte Universum. Obwohl sie relativ früh im Spiel entdeckt wird, kommt sie erst später wirklich zum Einsatz. Sobald du beginnst, Sterne zu erforschen, kannst du diese Karte und die Sternendaten-Tabelle nutzen, um deine Optionen nach einer Wiedergeburt zu planen.",
      },
      {
        heading: "Antimaterie",
        body: "Antimaterie ist eine fortgeschrittene Ressource, die als Treibstoff für Raumschiffe dient und eine Schlüsselrolle für den Fortschritt Richtung Wiedergeburt und den Abschluss des Spiels spielt. Sie wird von Asteroiden mit Raketenminen abgebaut.",
      },
      {
        heading: "Raumschiff – Bau",
        body: "Der Bau eines Raumschiffs ist ein wichtiger Meilenstein. Raumschiffe können zu entfernten Sternensystemen reisen und ermöglichen die Wiedergeburt.",
      },
      {
        heading: "Raumschiff – Reisen",
        body: "Raumschiffe können zu erforschten Sternensystemen reisen, die jeweils einzigartiges Wetter, Ressourcen und Herausforderungen bieten, wenn du nach einer Wiedergeburt dort startest.",
      },
      {
        heading: "Diplomatie",
        body: "Die meisten Sternensysteme beherbergen intelligentes außerirdisches Leben. Du musst einen Sternenscan durchführen, einen Gesandten bauen und ihn entsenden, um dies zu initiieren. Der Scan liefert Informationen über die Lebensformen im System; er ist nicht zwingend erforderlich, aber ohne ihn bleibt nur der Krieg als Option, ohne die Größe der feindlichen Streitkräfte zu kennen! Es gibt mehrere Optionen bei Begegnungen, von Einschüchterung über Vasallisierung bis hin zur Eroberung. Du kannst ihren Eindruck von dir verbessern oder verschlechtern, was die Flottengröße beeinflusst. Anführer besitzen Eigenschaften, die ihr Verhalten beeinflussen oder bei Krieg deren Verteidigung, Geschwindigkeit oder Flottengröße verändern können.",
      },
      {
        heading: "Kampf",
        body: "Nicht alle Systeme sind freundlich. Manchmal bleibt nur der Kampf, um das System zu erobern. Du musst das Flottenhangar-Menü nutzen, um eine Angriffsflotte zu bauen und eine Schlacht zu starten. Bei einer Niederlage wird deine gesamte Flotte zerstört, aber nicht dein Raumschiff. Du kannst die Flotte wieder aufbauen, was jedoch teuer ist, also versuche zu gewinnen!",
      },
      {
        heading: "Aufstiegspunkte (AP)",
        body: "Aufstiegspunkte (AP) erhältst du durch Reisen zu Sternen. Einfach ausgedrückt: Je weiter der Stern entfernt ist, desto mehr AP erhältst du nach einer Wiedergeburt. Sie können im Galaktischen Markt ausgegeben werden. Du kannst sie auch durch Liquidation all deiner Ressourcen, Verbindungen und Bargeld einmal pro Lauf erhalten, und einige Kolonisierungsmethoden können die Auszahlung ebenfalls verdoppeln.",
      },
      {
        heading: "Wiedergeburt",
        body: "Wiedergeburt setzt den Fortschritt zurück, erobert aber ein neues System. Jedes so eroberte System gewährt einen Galaktischen Punkt (GP), und die Spezialfähigkeit der Expansionisten gewährt zusätzlich einen für jedes weitere besiedelte System. GP sind dauerhaft und werden durch eine Wiedergeburt nie zurückgesetzt - sie sind die Währung, die du im Kapitel des Kosmischen Risses ausgibst.",
      },
      {
        heading: "Galaktischer Markt",
        body: "Der Galaktische Markt ist ein wichtiges Feature und wird freigeschaltet, nachdem dein Schiff im ersten Durchlauf ein neues System erreicht. Dort kannst du Ressourcen, Bargeld und AP handeln.",
      },
      {
        heading: "Galaktisches Casino",
        body: "Das Galaktische Casino erlaubt es dir, deine hart erarbeiteten Produkte auf Risiko zu setzen für sofortige Belohnungen. Teste dein Glück und setze deine Ressourcen ein. Die Gewinne gelten nur für den aktuellen Durchlauf, nicht für langfristige oder mehrfachlaufende Belohnungen.",
      },
      {
        heading: "Casino-Punkte (CP)",
        body: "Casino-Punkte (CP) sind die Währung des Galaktischen Casinos. Du musst CP mit Ressourcen oder Verbindungen kaufen. CP sind die einzige Möglichkeit, an Casinospielen für verschiedene Preise teilzunehmen. CP werden bei einer Wiedergeburt zurückgesetzt.",
      },
      {
        heading: "Aufstiegsboni",
        body: "Du kannst erworbene AP für permanente Boni ausgeben, die zukünftige Durchläufe erleichtern und das Spiel wiederholbarer und unterhaltsamer machen!",
      },
      {
        heading: "Schwarzes Loch",
        body: "Du kannst zufällig ein Schwarzes Loch entdecken. Nach der Erforschung kann es für Zeitverzerrung genutzt werden, wodurch Reisezeiten und Ressourcensammlung beschleunigt werden. Es muss aufgeladen werden, was Zeit kostet, aber Upgrades können diese reduzieren. Du kannst auch die Aktivierungsdauer und Stärke durch weitere Upgrades erhöhen, und einmal freigeschaltet, ist es in allen Durchläufen verfügbar.",
      },
      {
        heading: "O-Typ Sterne",
        body: "O-Typ Sterne sind die seltensten und gewalttätigsten Sterne in der Galaxie. Jeder, den du kontrollierst, verstärkt die Energieproduktion eines Kraftwerkstyps erheblich. Erwarte verstärkte Verteidigungen beim Versuch, diese Systeme zu erobern.",
      },
      {
        heading: "B-Typ Sterne",
        body: "B-Typ Sterne sind massive, heiße blaue Sterne, die deine Auto-Käufer stark verstärken. Wenn du dich in einem B-Typ-Sternsystem befindest, erhalten alle deine Ressourcen-Auto-Käufer einen festen Bonus: Stufe 1 erhält +2/s, Stufe 2 +8/s, Stufe 3 +25/s und Stufe 4 +80/s. Dieser Bonus gilt für alle Ressourcen, jedoch nicht für Verbindungen, und nur während eines Durchlaufs in einem B-Typ-System.",
      },
      {
        heading: "F-Typ Sterne",
        body: "F-Typ Sterne sind gelb-weiße Sterne, die den Antimaterie-Abbau verbessern. Wenn du dich in einem F-Typ-Sternsystem befindest, erhalten alle deine Raketen einen Bonus von 50 % auf ihre Antimaterie-Abbaurate beim Abbau von Asteroiden. Dieser Bonus gilt nur während eines Durchlaufs in einem F-Typ-System.",
      },
    ],
    endGoal: [
      {
        heading: "Alte Manuskripte",
        body: "Alte Manuskripte weisen dir den Weg zu Megastruktur-Sternensystemen. Hinweise auf deren Standort können manchmal im Nachrichtenticker auftauchen, also behalte ihn im Auge.",
      },
      {
        heading: "Megastrukturen",
        body: "Megastrukturen sind extrem schwer zu erobern und in der Galaxie versteckt, aber die Belohnungen dafür sind enorm. Jede von dir eroberte trägt zudem direkt zur Zerstörung des Miaplacidus-Kraftfelds bei.",
      },
      {
        heading: "Miaplacidus",
        body: "Miaplacidus – deine Heimat – ist durch ein mächtiges Kraftfeld geschützt, das von der Maschinenrasse aufrechterhalten wird. Während du Megastrukturen demontierst und sie deinem Einflussbereich zuordnest, schwächt sich das Kraftfeld, bis es schließlich zusammenbricht. Dann wirst du die alles entscheidende Schlacht führen, um deine angestammte Heimat zurückzuerobern.",
      },
      {
        heading: "Kosmische Riss",
        body: "Der kosmische Riss ist eine gefährliche Anomalie, die die Zukunft deines Volkes bedroht. Sobald deine Kräfte stark genug sind, Miaplacidus zurückzuerobern, musst du zuerst den Riss durch das Scannen lokaler Raumsektoren lokalisieren. Danach führst du kostspielige Studien und Konstruktionen durch, um ihn zu stabilisieren. Erst wenn er gesichert ist, kannst du ihn endgültig schließen. Galaktische Punkte (GP) sind die Währung dieses Kapitels. Du verdienst sie durch Wiedergeburten, einen für jedes eroberte System, und gibst sie aus, um das Nahraum-Scanner-Array in Betrieb zu nehmen, für jeden Sektorscan bei der Suche nach dem Riss und für jede Technologie des Kosmischen Risses, die du erforschst.",
      },
      {
        heading: "Das Endziel",
        body: "Sobald das Miaplacidus-Kraftfeld weg ist, kannst du die Master-KI-Rasse angreifen, Miaplacidus zurückerobern, deine Heimat wiederbesetzen und den kosmischen Riss schließen, um die Zukunft deines Volkes für immer zu sichern! Dies ist das Endziel des Spiels.",
      },
    ],
    philosophies: [
      {
        heading: "Philosophien",
        body: "Philosophien werden im ersten Durchlauf langsam eingeführt. Du wirst ermutigt, einen von vier möglichen Pfaden zu wählen, jeder ist eine einmalige, dauerhafte Entscheidung, die für den Rest des Spiels gilt. Sobald eine Philosophie gewählt und der erste Durchlauf abgeschlossen ist, erscheint unter dem Forschungs-Reiter eine neue Option, um eine einzigartige Spezialfähigkeit und eine Reihe einzigartiger wiederholbarer Technologien zu erforschen, passend zur gewählten Philosophie. Alle Boni bleiben dir während des gesamten Spiels erhalten, auch nach Wiedergeburten.",
      },
      {
        heading: "Spezialfähigkeit",
        body: "Jede Philosophie gewährt eine einzigartige Spezialfähigkeit. Diese sind extrem mächtig und beeinflussen das Spiel auf unterschiedliche Weise, daher ist es klug, sorgfältig zu wählen. Eine Philosophie kann später nicht geändert werden, und pro Spielpfad gibt es nur eine Philosophie.",
      },
      {
        heading: "Wiederholbare Technologien",
        body: "Jede Philosophie gewährt eine Reihe einzigartiger und wiederholbarer Technologien. Sie bieten stapelbare Boni, die permanent sind und Forschungspunkte kosten. Abhängig von der gewählten Philosophie unterscheiden sich die Effekte, und nach einigen Erwerbungen werden sie sehr mächtig.",
      },
      {
        heading: "Konstrukteur",
        body: "Die Konstrukteur-Philosophie konzentriert sich auf günstigere und effizientere Upgrades. Du erhältst Boni auf Auto-Käufer-Preise, Lagerkapazität, Energie- und Forschungs-Upgrade-Preise sowie eine Reduzierung der Kosten für die Erstellung von Verbindungen.",
      },
      {
        heading: "Supremacist",
        body: "Die Supremacist-Philosophie setzt auf militärische Macht und Eroberung. Erwarte stärkere, schnellere und günstigere Flotten sowie die Möglichkeit, Gegner zur Vasallisierung zu zwingen.",
      },
      {
        heading: "VoidBorn",
        body: "Als VoidBorn erhältst du Boni für erste Eindrücke bei Zivilisationen fremder Systeme, verbesserte Asteroiden- und Sternenforschung, Chancen zur Erhöhung des AP-Gewinns und sogar die Fähigkeit, den Void zu plündern für massive Ressourcen- und Verbindungsgewinne!",
      },
      {
        heading: "Expansionist",
        body: "Expansionisten gedeihen durch Kolonisation und Ausbreitung über die Sterne. Reisezeiten für Raketenminen und Raumschiffe werden reduziert und günstiger, zudem erhältst du die Chance, nahe Systeme bei Eroberung zur Aufgabe zu bewegen.",
      },
    ],
  },
  it: {
    getStarted: [
      {
        heading: "Introduzione",
        body: "Miaplacidus in breve è un gioco incrementale. Tuttavia è molto più di questo e, si spera, ti offrirà ore di divertimento.\u003cbr/\u003e\u003cbr/\u003eQuando inizi il gioco, l\u0027ambiente apparirà piuttosto desolato, come effettivamente è, poiché sei stato abbandonato su un pianeta nel sistema Spica con nulla se non una grande comprensione dell\u0027universo e la capacità di sfruttare l\u0027idrogeno. Man mano che ottieni più di questo elemento fondamentale, potrai venderlo e ottenere del denaro.\u003cbr/\u003e\u003cbr/\u003ePrima di procedere, apri la scheda Risorse e espandi la sezione Gas: noterai una sezione chiamata Idrogeno. Cliccandoci sopra si aprirà la sezione Risorse. Anche se all\u0027inizio può sembrare complesso, il concetto è piuttosto semplice. In alto vedrai un menu a tendina che ti permette di impostare una quantità da vendere e un pulsante di vendita. Questo vende il tuo idrogeno in cambio di denaro, visibile in alto a sinistra dello schermo.\u003cbr/\u003e\u003cbr/\u003eCon un po\u0027 di denaro in tasca, è il momento di puntare alla meta: ascendere verso le stelle! Un compito impegnativo partendo da poche monete e qualche atomo di idrogeno, ma non temere!\u003cbr/\u003e\u003cbr/\u003ePiù in basso c\u0027è un pulsante Guadagna, che, se cliccato, aggiunge un atomo di idrogeno alle tue scorte. Devi conservarlo, ed è qui che entra in gioco la sezione successiva. Se accumuli così tanto idrogeno da riempire lo stoccaggio, puoi scambiare tutti gli atomi tranne uno per aumentare lo spazio di stoccaggio; anche se guadagni nuovamente l\u0027idrogeno, ora puoi raccoglierne il doppio!\u003cbr/\u003e\u003cbr/\u003eQuesto è fantastico ma un po’ laborioso. Per ovviare, più in basso noterai una sezione che ti permette di costruire un Generatore di Idrogeno, d’ora in poi chiamato Auto Buyer. Con questo Auto Buyer, puoi rilassarti mentre l\u0027idrogeno viene raccolto automaticamente fino al riempimento dello stoccaggio, semplificando la vita.\u003cbr/\u003e\u003cbr/\u003eOra che la pressione è un po’ diminuita, noterai la scheda Ricerca. Aprendola, avrai accesso a ulteriori informazioni e, cosa più importante, al concetto di Punti Ricerca! Puoi costruire un Kit Scientifico che inizierà a generare Punti Ricerca, lentamente all\u0027inizio, ma che può crescere rapidamente. Usa il primo lotto generato per aprire la sezione Tecnologia e ricercare la tua prima tecnologia, \u0027Condivisione della conoscenza\u0027.\u003cbr/\u003e\u003cbr/\u003eCongratulazioni, hai appena compreso il concetto principale di Miaplacidus: accumulare risorse e acquistare ricompense con i profitti.\u003cbr/\u003e\u003cbr/\u003eCol tempo potrai usare questo ciclo per scoprire nuovi elementi e far crescere i numeri oltre quanto avresti mai immaginato!\u003cbr/\u003e\u003cbr/\u003eGrazie per aver letto, ora sentiti libero di esplorare altri argomenti nella Miaplaedia per avere ulteriore contesto!",
      },
    ],
    story: [
      {
        heading: "Storia",
        body: "Sei un Miaplacidean. Un tempo vivevi su un mondo rigoglioso e pacifico orbitante Beta Carinae, conosciuto dal tuo popolo come Miaplacidus. Per eoni, la tua civiltà prosperò—coltivando la terra, avanzando nella conoscenza e colonizzando infine l’intero sistema stellare. La vita era buona e non c’era bisogno di altro. Tutto cambiò il giorno in cui uno scienziato scoprì una strana anomalia nel vuoto attorno al tuo sistema. Mosso dalla curiosità e dal sacrificio, vi entrò e non fece mai ritorno. A tua insaputa, attraversò un sistema distante e rivelò la tua esistenza a una razza avanzata di IA.\n\nQuesta specie di IA seguì il suo percorso attraverso il portale ormai permanente e lanciò un’invasione devastante. In pochi giorni, il sistema Miaplacidus cadde. La maggior parte fu perduta. Tu e pochi altri riusciste a scappare per un pelo. Salendo a bordo di una nave sperimentale con tecnologia di curvatura non testata, fuggisti nel vuoto. Ma il salto non andò come previsto. Fosti scagliato lontano da casa, persi conoscenza e vagasti nello spazio.\n\nQuando finalmente ti risvegliasti, ti trovasti solo nel sistema Spica—circa 100 anni luce dalla tua origine. Il tuo popolo è sparito. Il tuo mondo è sparito. Ma la tua storia sta appena iniziando.",
      },
      {
        heading: "Oggi",
        body: "Atterrai su un mondo rigoglioso e vibrante nel sistema Spica. Lì incontrasti una specie nativa senziente—gli Spiciti. Ti accolsero con curiosità e gentilezza, invitandoti a condividere pasti e imparare le loro usanze. Sebbene la comunicazione fosse imperfetta, non mostrarono aggressività. Col tempo ti ambientasti tra loro, adattandoti alla loro cultura e ai ritmi di vita.\n\nCominciarono a chiamarti Mia\u0027Plac—forse una traduzione errata della tua origine, o una parola con significato più profondo nella loro lingua. In ogni caso, il nome rimase, così come il tuo posto tra loro. Grazie alla saggezza, leadership e conoscenza avanzata, guadagnasti la loro fiducia e alla fine diventasti leader della colonia. Ora supervisioni la raccolta di risorse e l’avanzamento della ricerca per guidare questo insediamento verso il futuro.\n\nEppure, dentro di te, arde ancora un fuoco. Non hai dimenticato Miaplacidus. Non hai dimenticato il tuo popolo. Mentre costruisci un futuro qui, dedichi la tua vita a scoprire la verità su ciò che è accaduto—to trovare un modo per tornare e rimettere le cose a posto.",
      },
      {
        heading: "Futuro",
        body: "Equipaggiato con poco più di un laboratorio modesto, qualche materia prima e una scintilla di idrogeno, inizi il tuo lavoro. Gli Spiciti ti guardano per guida, la loro fiducia incrollabile. Sebbene il loro mondo sia primitivo secondo i tuoi standard, il loro spirito è forte e la tua leadership promette di inaugurare una nuova era.\n\nCon la tua conoscenza della scienza avanzata e dei segreti del vuoto, introduci idee che accelerano i progressi ben oltre ciò che questa colonia potrebbe aver raggiunto da sola. Mentre le prime strutture sorgono e le ricerche iniziano, iniziano a circolare voci—i mercanti parlano di sistemi distanti e ostili. Raccontano di IA ribelli, colossali Megastrutture e mondi inanimati ridotti in cenere.\n\nAscolti e ricordi. Gli invasori. La perdita. Il tradimento delle stelle. Queste storie rafforzano la tua determinazione. Condurrai gli Spiciti oltre il loro mondo, verso le stelle e attraverso il vuoto. Scoprirai cosa è accaduto a Miaplacidus. E un giorno tornerai—non in esilio, ma con forza—per riconquistare la tua casa e porre fine alla minaccia delle macchine una volta per tutte. Sei... Mia'Plac, e questo è Miaplacidus!",
      },
    ],
    conceptsEarly: [
      {
        heading: "Risorse",
        body: "Le risorse sono i mattoni del gioco. Possono essere raccolte manualmente, vendute, usate per acquistare upgrade, fuse per creare altre risorse o, più avanti, usate per creare composti avanzati.",
      },
      {
        heading: "Raccolta Manuale",
        body: "Ogni risorsa ha un pulsante che, se cliccato, aggiunge 1 alla quantità di quella risorsa, finché il totale non raggiunge il limite di stoccaggio. Questo è utile nelle prime fasi del gioco per ottenere piccole quantità e iniziare!",
      },
      {
        heading: "Vendita",
        body: "Usando il menu a tendina per scegliere la quantità desiderata e poi cliccando il pulsante Vendi, scambierai la quantità scelta di risorsa (o più avanti, di composto) con denaro, utilizzabile per acquistare determinati upgrade.",
      },
      {
        heading: "Stoccaggio",
        body: "Ogni risorsa e composto ha un limite di stoccaggio. Se lo stoccaggio è pieno, non è possibile ottenere altre risorse finché non vengono utilizzate o finché non viene aumentato lo spazio. L’upgrade dello stoccaggio usa tutte le scorte tranne 1 della risorsa o del composto.",
      },
      {
        heading: "Auto Buyers",
        body: "Gli Auto Buyers permettono di automatizzare la raccolta delle risorse una volta sbloccati. Lavorano continuamente in background, liberandoti per concentrarti su altre attività, fino a riempimento dello stoccaggio. Alcuni richiedono energia per funzionare.",
      },
      {
        heading: "Punti Ricerca",
        body: "I Punti Ricerca si ottengono tramite Aggiornamenti di Ricerca e servono a sbloccare nuove tecnologie.",
      },
      {
        heading: "Aggiornamenti di Ricerca",
        body: "Gli Aggiornamenti di Ricerca permettono di generare Punti Ricerca, anche se alcuni richiedono energia per funzionare.",
      },
      {
        heading: "Tecnologia",
        body: "La tecnologia sblocca potenti upgrade e nuove meccaniche di gioco. La maggior parte delle tecnologie ha prerequisiti e un costo in Punti Ricerca.",
      },
      {
        heading: "Composti",
        body: "I composti sono materiali più avanzati che richiedono più risorse per essere creati. Servono per le meccaniche di gioco medio-avanzate.",
      },
      {
        heading: "Fusione",
        body: "La fusione è un processo che permette di creare risorse a partire da risorse più basilari.",
      },
      {
        heading: "Ticker Notizie",
        body: "Il Ticker Notizie mostra informazioni molto importanti e, a volte, può fornire bonus segreti, quindi tienilo sempre d’occhio!",
      },
    ],
    conceptsMid: [
      {
        heading: "Generazione \u0026 Consumo di Energia",
        body: "L’energia è necessaria per alimentare molti upgrade, come alcuni Auto Buyers e Aggiornamenti di Ricerca, e viene poi consumata in molte meccaniche di gioco avanzate; se questo accade, sarà indicato nella descrizione della funzione. Esistono strutture per la produzione e lo stoccaggio di energia.",
      },
      {
        heading: "Edifici Energetici",
        body: "Gli edifici energetici generano energia e ne esistono vari tipi. Consumano carburante durante il funzionamento, che può essere composto o energia solare.",
      },
      {
        heading: "Batterie",
        body: "Le batterie immagazzinano energia in eccesso per l’uso quando la generazione è insufficiente, ad esempio se non ci sono abbastanza edifici energetici dopo l’acquisto di un upgrade o se il carburante è esaurito. Aggiornare la capacità della batteria è fondamentale per mantenere il flusso energetico, soprattutto quando si ampliano gli upgrade che consumano energia.",
      },
      {
        heading: "Meteo",
        body: "Il meteo influenza varie meccaniche di gioco, inclusa la produzione di energia. Può influire sul lancio dei razzi e fornire risorse extra tramite precipitazioni. Il meteo prevalente e le risorse ottenute possono variare in base alla stella in gioco (meccanica di fine gioco).",
      },
      {
        heading: "Estrazione Spaziale",
        body: "L’estrazione spaziale permette di ottenere antimateria rara dagli asteroidi.",
      },
      {
        heading: "Eventi",
        body: "Eventi casuali possono verificarsi durante il gioco, portando opportunità o sfide inaspettate. Appaiono senza preavviso e possono offrire ricompense uniche, imporre ostacoli temporanei o sbloccare nuovi percorsi. Presta attenzione alle notifiche: alcuni eventi sono fugaci, altri possono modificare il corso del tuo gioco se agisci saggiamente. Puoi monitorare eventi attuali e passati nel pannello Eventi nel menu.",
      },
      {
        heading: "Telescopio Spaziale",
        body: "Il telescopio spaziale serve a scansionare gli asteroidi che possono essere estratti dai tuoi Minatori di Razzi e, nel gioco avanzato, a studiare le stelle. Usarlo richiede molta energia e ha un costo di costruzione elevato.",
      },
      {
        heading: "Asteroidi",
        body: "Gli asteroidi contengono antimateria. Per estrarla, è necessario costruire e lanciare Minatori di Razzi. Alcuni asteroidi sono facili da raggiungere e estrarre, altri richiedono più tempo. La quantità di antimateria varia e gli asteroidi hanno diverse classi in base alla qualità. Se sei fortunato, potresti persino trovare un asteroide leggendario e farlo intitolare a te!",
      },
      {
        heading: "Piattaforma di Lancio",
        body: "La Piattaforma di Lancio è un prerequisito per costruire Minatori di Razzi. È un upgrade costoso e, una volta costruita, puoi vedere il numero di minatori posseduti e le fasi di costruzione o di lancio.",
      },
      {
        heading: "Minatori di Razzi – Costruzione",
        body: "Puoi costruire fino a 4 Minatori di Razzi usando composti avanzati e molto denaro, a condizione che la Piattaforma di Lancio sia stata costruita. Ognuno richiede moduli o parti da assemblare, sempre più costosi. Di default sono nominati Razzo 1 ecc., ma possono essere rinominati.",
      },
      {
        heading: "Minatori di Razzi – Lancio e Viaggio",
        body: "I razzi devono essere riforniti e lanciati. Possono viaggiare verso qualsiasi asteroide scoperto con il telescopio spaziale, purché riforniti e lanciati. Il rifornimento richiede energia e tempo; il lancio richiede buone condizioni meteorologiche. Una volta lanciato, puoi selezionare la destinazione dal menu a tendina degli asteroidi scoperti e cliccare per viaggiare.",
      },
      {
        heading: "Minatori di Razzi – Estrazione",
        body: "Una volta che un Minatore di Razzi ha raggiunto un asteroide, estrarrà automaticamente l’antimateria finché l’asteroide non sarà esaurito, quindi tornerà e richiederà rifornimento per essere riutilizzato. Durante l’estrazione, il minatore può estrarre più velocemente se si utilizza l’opzione Boost disponibile nel pannello di estrazione.",
      },
    ],
    conceptsLate: [
      {
        heading: "Mappa Stellare",
        body: "La Mappa Stellare offre una visione dell’Universo conosciuto e, sebbene venga scoperta relativamente presto nel gioco, entra in gioco molto più tardi. Una volta iniziato lo Studio delle Stelle, puoi usare questa Mappa Stellare e la tabella dei Dati Stellari per pianificare le opzioni post-Rinascita.",
      },
      {
        heading: "Antimateria",
        body: "L’antimateria è una risorsa avanzata utilizzata come carburante per Astronavi ed è un componente chiave per progredire verso la Rinascita e completare il gioco. Viene estratta dagli asteroidi tramite i Minatori di Razzi.",
      },
      {
        heading: "Astronave - Costruzione",
        body: "Costruire un’Astronave è una tappa importante. Le astronavi possono viaggiare verso sistemi stellari lontani e permettono la Rinascita.",
      },
      {
        heading: "Astronave - Viaggi",
        body: "Le astronavi possono viaggiare verso sistemi stellari studiati, ognuno con Meteo, Risorse e sfide uniche quando vi rinascete per una nuova partita.",
      },
      {
        heading: "Diplomazia",
        body: "La maggior parte dei sistemi stellari contiene vita aliena intelligente. È necessario effettuare una Scansione Stellare, costruire un Inviato e inviarlo per avviare l’incontro. La scansione fornisce informazioni sulla forma di vita nel sistema; non è obbligatoria, ma senza farla, l’unica opzione sarà la guerra senza conoscere la dimensione della forza nemica! Ci sono varie opzioni in questi incontri, dall’intimidirli, al tentare di vassallizzarli e, se tutto fallisce, conquistarli! Puoi migliorare o peggiorare la loro impressione di te, influenzando la dimensione della loro flotta. I leader hanno tratti che possono influenzare le loro risposte o, in caso di guerra, modificare difesa, velocità, dimensione della flotta, ecc.",
      },
      {
        heading: "Battaglia",
        body: "Non tutti i sistemi sono amichevoli. A volte l’unica opzione è combattere per cercare di conquistarli. Devi usare la schermata dell’Hangar Flotte per costruire una forza d’attacco e avviare la battaglia. Se perdi, tutta la flotta sarà distrutta, ma non l’Astronave. Puoi ricostruire, ma è un processo costoso, quindi cerca di vincere!",
      },
      {
        heading: "Punti Ascendenza (AP)",
        body: "I Punti Ascendenza (AP) si guadagnano viaggiando verso le stelle. In breve, più lontana è la stella, più AP vengono concessi alla Rinascita. Possono essere spesi nel Mercato Galattico. Puoi anche ottenerli liquidando tutte le risorse, i composti e il denaro una volta per partita, e alcuni metodi di colonizzazione possono raddoppiare la ricompensa.",
      },
      {
        heading: "Rinascita",
        body: "La Rinascita resetta i progressi ma conquista un nuovo Sistema. Ogni Sistema conquistato in questo modo assegna un Punto Galattico (GP), e l\u0027abilità speciale Espansionista ne assegna uno anche per ogni Sistema aggiuntivo che colonizza. I GP sono permanenti e non vengono mai azzerati da una Rinascita: sono la valuta che spendi nel capitolo della Lacerazione Cosmica.",
      },
      {
        heading: "Mercato Galattico",
        body: "Il Mercato Galattico è un importante sblocco e arriva dopo che la tua nave raggiunge il nuovo sistema nella prima partita. Qui puoi scambiare Risorse, Denaro e AP.",
      },
      {
        heading: "Casinò Galattico",
        body: "Il Casinò Galattico ti permette di scommettere i prodotti guadagnati duramente per gratificazione immediata. Metti alla prova la tua fortuna e rischia le risorse per ricompense potenziali. I premi ottenuti valgono solo per la partita corrente, non a lungo termine o multi-partita.",
      },
      {
        heading: "Punti Casinò (CP)",
        body: "I Punti Casinò (CP) sono la valuta del Casinò Galattico. Devi acquistare CP usando Risorse o Composti; i CP sono l’unico modo per giocare ai giochi del casinò e ottenere i vari premi. I CP vengono azzerati alla Rinascita.",
      },
      {
        heading: "Perk di Ascendenza",
        body: "Puoi spendere gli AP acquisiti in buff permanenti che rendono più semplici le future partite, aumentando la rigiocabilità e il divertimento!",
      },
      {
        heading: "Buco Nero",
        body: "Puoi scoprire accidentalmente un Buco Nero e, una volta studiato, può essere usato per il Time Warp, accelerando i tempi di viaggio e la raccolta delle risorse. Deve essere caricato, il che richiede tempo, ma questo tempo può essere ridotto con upgrade. Puoi anche aumentare la durata e la potenza con ulteriori upgrade; una volta sbloccato è disponibile in diverse partite.",
      },
      {
        heading: "Stelle di Tipo O",
        body: "Le stelle di tipo O sono le più rare e violente della galassia. Ognuna che controlli amplifica drasticamente la produzione di energia di un tipo di Edificio Energetico. Aspettati difese rinforzate quando tenti di conquistarne i sistemi.",
      },
      {
        heading: "Stelle di Tipo B",
        body: "Le stelle di tipo B sono stelle blu massicce e molto calde che potenziano enormemente i tuoi Auto Acquirenti. Quando ti trovi in un sistema con una stella di tipo B, tutti gli Auto Acquirenti delle Risorse ricevono un bonus fisso: il Livello 1 ottiene +2/s, il Livello 2 +8/s, il Livello 3 +25/s e il Livello 4 +80/s. Questo bonus si applica a tutte le Risorse ma non ai Composti, e solo durante la partita in un sistema di tipo B.",
      },
      {
        heading: "Stelle di Tipo F",
        body: "Le stelle di tipo F sono stelle giallo-bianche che migliorano le operazioni di estrazione dell’Antimateria. Quando ti trovi in un sistema con una stella di tipo F, tutti i tuoi razzi ottengono un bonus del 50% al loro tasso di estrazione di Antimateria mentre estraggono dagli asteroidi. Questo bonus si applica solo durante la partita nel sistema di tipo F.",
      },
    ],
    endGoal: [
      {
        heading: "Manoscritti Antichi",
        body: "I Manoscritti Antichi ti indicano i sistemi stellari con Megastrutture. Indizi sulla loro posizione possono comparire nel Ticker Notizie, quindi tienilo d’occhio.",
      },
      {
        heading: "Megastrutture",
        body: "Le Megastrutture sono estremamente difficili da conquistare e nascoste nella galassia, ma le ricompense sono enormi. Ognuna che acquisisci contribuisce direttamente alla distruzione del campo di forza di Miaplacidus.",
      },
      {
        heading: "Miaplacidus",
        body: "Miaplacidus - la tua Patria - è protetta da un potente campo di forza mantenuto dalla razza delle macchine. Man mano che smantelli le Megastrutture e le connetti alla tua causa, il campo di forza si indebolirà fino a collassare, momento in cui affronterai la battaglia più grande della tua vita per recuperare la tua patria ancestrale.",
      },
      {
        heading: "Lacerazione Cosmica",
        body: "La Lacerazione Cosmica è un’anomalia pericolosa che minaccia il futuro del tuo popolo. Una volta che le tue forze saranno abbastanza forti da riconquistare Miaplacidus, dovrai prima localizzare la Lacerazione scansionando i settori spaziali locali. Dopo averla individuata, intraprenderai studi e costruzioni costose per stabilizzarla. Solo quando sarà stabilizzata e sicura potrai finalmente chiuderla per sempre. I Punti Galattici (GP) sono la valuta di questo capitolo. Li guadagni con la Rinascita, uno per ogni Sistema che conquisti, e li spendi per attivare l\u0027Array di Scanner Spazio Vicino, per ogni scansione di settore mentre cerchi la Lacerazione, e per ogni tecnologia della Lacerazione Cosmica che ricerchi.",
      },
      {
        heading: "Obiettivo Finale",
        body: "Una volta che il campo di forza di Miaplacidus sarà scomparso, potrai attaccare la razza IA dominante, riconquistare Miaplacidus, riprendere la tua patria e chiudere la Lacerazione Cosmica, garantendo per sempre il futuro del tuo popolo! Questo è l’obiettivo finale del gioco.",
      },
    ],
    philosophies: [
      {
        heading: "Filosofie",
        body: "Le Filosofie vengono introdotte gradualmente durante la prima partita. Sei incoraggiato a selezionare uno dei quattro percorsi possibili, ognuno dei quali è una decisione unica e permanente valida per il resto del gioco. Una volta scelta una Filosofia e completata la prima partita, comparirà una nuova opzione nella scheda Ricerca, dove potrai studiare un’abilità speciale unica e una serie di Tecnologie Ripetibili uniche, coerenti con la Filosofia scelta. Tutti questi bonus rimangono con te per tutto il gioco, persino attraverso le Rinascite.",
      },
      {
        heading: "Abilità Speciale",
        body: "Ogni Filosofia concede un’abilità speciale unica. Queste sono estremamente potenti e, in modi diversi, rendono il gioco più divertente, influenzando diverse meccaniche. È saggio riflettere attentamente quando si sceglie una Filosofia, poiché non può essere cambiata successivamente e può esserci solo un percorso Filosofico per partita.",
      },
      {
        heading: "Tecnologie Ripetibili",
        body: "Ogni Filosofia concede una serie di Tecnologie uniche e ripetibili. Offrono bonus cumulativi permanenti e costano Punti Ricerca. Gli effetti variano a seconda della Filosofia scelta e, una volta acquistate alcune, diventano molto potenti.",
      },
      {
        heading: "Costruttore",
        body: "La Filosofia Costruttore è centrata su upgrade più economici ed efficienti. Ottieni bonus sui prezzi degli Auto Buyers, sulla Capacità di Stoccaggio, sui prezzi degli Aggiornamenti di Energia e Ricerca e una riduzione del costo di creazione dei Composti.",
      },
      {
        heading: "Suprematista",
        body: "La Filosofia Suprematista punta sul potere militare e sulla conquista. Aspettati flotte più forti, veloci e economiche e la possibilità di costringere i nemici alla Vassallizzazione.",
      },
      {
        heading: "Nati dal Vuoto",
        body: "Nati dal Vuoto, prevedi bonus legati alle Impressioni Iniziali con Civiltà di sistemi stranieri, migliori ricerche di Asteroidi e studi delle stelle, opportunità di aumentare il guadagno di AP e persino la possibilità di saccheggiare il Vuoto per grandi guadagni di Risorse e Composti!",
      },
      {
        heading: "Espansionista",
        body: "Gli Espansionisti prosperano colonizzando e diffondendosi tra le stelle. Riduci i tempi di viaggio per Minatori di Razzi e Astronavi, rendili più economici e acquisisci la possibilità di convincere sistemi vicini a cedere quando ne conquisti uno!",
      },
    ],
  },
  fr: {
    getStarted: [
      {
        heading: "Introduction",
        body: "Miaplacidus est, en résumé, un jeu incrémental. Cependant, il est bien plus que cela et, espérons-le, vous offrira des heures de plaisir de jeu.\u003cbr/\u003e\u003cbr/\u003eAu début, le jeu peut sembler plutôt sombre, ce qu\u0027il est, car vous avez été abandonné sur une planète du système Spica avec rien d\u0027autre qu\u0027une grande compréhension de l\u0027univers et la capacité de manipuler l\u0027Hydrogène. En accumulant cette ressource de base, vous pourrez la vendre pour obtenir de l\u0027argent.\u003cbr/\u003e\u003cbr/\u003eAvant d\u0027aller plus loin, ouvrez l\u0027onglet Ressources et développez la section Gaz. Vous y verrez une section appelée Hydrogène. Cliquez dessus et la section Ressources s\u0027ouvrira. Bien que cela puisse sembler complexe au début, le concept est simple : en haut, un menu déroulant permet de définir une quantité à vendre, puis cliquez sur le bouton Vendre pour échanger votre Hydrogène contre de l\u0027argent, visible en haut à gauche de l\u0027écran.\u003cbr/\u003e\u003cbr/\u003eAvec un peu d\u0027argent en poche, il est temps de viser l\u0027objectif : atteindre les étoiles ! Une tâche lourde à partir de quelques pièces et atomes d\u0027Hydrogène, mais ne vous inquiétez pas !\u003cbr/\u003e\u003cbr/\u003eEnsuite, juste en dessous, vous trouverez un bouton Gagner, qui, lorsqu\u0027il est cliqué, ajoute un atome d\u0027Hydrogène à vos stocks. Vous devez le stocker, et c\u0027est là qu\u0027intervient la section suivante. Si votre stock d\u0027Hydrogène est plein, vous pouvez échanger tous les atomes sauf un pour augmenter le stockage ; bien que vous deviez récupérer à nouveau l\u0027Hydrogène, vous pouvez maintenant en collecter le double !\u003cbr/\u003e\u003cbr/\u003eCela fonctionne mais est un peu laborieux. Pour simplifier, vous trouverez une section permettant de construire un Générateur d\u0027Hydrogène, désormais appelé Auto Acheteur. Avec cet Auto Acheteur, vous pouvez vous détendre pendant que l\u0027Hydrogène est collecté automatiquement jusqu\u0027à ce que le stockage soit plein.\u003cbr/\u003e\u003cbr/\u003eMaintenant que la pression est un peu réduite, notez l\u0027onglet Recherche. L\u0027ouvrir vous donnera accès à plus d\u0027informations et, surtout, au concept de Points de Recherche ! Vous pouvez construire un Kit Scientifique qui génèrera des Points de Recherche, lentement au début, mais rapidement par la suite. Utilisez le premier lot pour ouvrir la section Technologie et rechercher votre première technologie, \u0027Partage de Connaissances\u0027.\u003cbr/\u003e\u003cbr/\u003eFélicitations, vous avez compris le concept principal de Miaplacidus : accumuler et acheter des récompenses avec les profits.\u003cbr/\u003e\u003cbr/\u003eÀ terme, vous pourrez utiliser cette boucle pour découvrir de nouveaux éléments et faire croître ces nombres au-delà de ce que vous auriez jamais imaginé !\u003cbr/\u003e\u003cbr/\u003eMerci de votre lecture, explorez librement d\u0027autres sujets dans la Miaplaedia pour plus de contexte !",
      },
    ],
    story: [
      {
        heading: "Histoire",
        body: "Vous êtes Miaplacidéen. Vous viviez autrefois sur un monde luxuriant et paisible en orbite autour de Beta Carinae, connu de votre peuple sous le nom de Miaplacidus. Pendant des éons, votre civilisation prospéra — cultivant la terre, avançant dans la connaissance et colonisant finalement tout votre système stellaire. La vie était bonne et il n\u0027y avait pas besoin de plus. Cela changea le jour où un scientifique découvrit une étrange perturbation dans le vide entourant votre système. Poussé par la curiosité et le sacrifice, il y pénétra, et ne revint jamais. À l\u0027époque, vous ignoriez qu\u0027il avait traversé un système distant et révélé votre existence à une race avancée d\u0027IA.\n\nCette espèce IA suivit son chemin à travers le portail désormais permanent et lança une invasion dévastatrice. En quelques jours, le système Miaplacidus tomba. La plupart furent perdus. Vous et quelques autres échappâtes de justesse. Embarquant sur un vaisseau expérimental équipé d\u0027une technologie de distorsion non testée, vous fûtes projeté dans le vide. Mais le saut ne se déroula pas comme prévu. Vous fûtes éjecté loin de chez vous, perdis connaissance et dérivâtes dans l\u0027espace.\n\nLorsque vous vous réveillâtes enfin, vous vous retrouvâtes seul dans le système Spica — à environ 100 années-lumière de votre origine. Votre peuple a disparu. Votre monde a disparu. Mais votre histoire ne fait que commencer.",
      },
      {
        heading: "Aujourd\u0027hui",
        body: "Vous avez atterri sur un monde luxuriant et vibrant du système Spica. Là, vous avez rencontré une espèce indigène consciente — les Spicites. Ils vous accueillirent avec curiosité et gentillesse, vous invitant à partager des repas et à apprendre leurs coutumes. Bien que la communication fût imparfaite, ils ne montrèrent aucune agressivité. Avec le temps, vous vous êtes intégré parmi eux, adaptant votre culture et votre rythme de vie.\n\nIls commencèrent à vous appeler Mia\u0027Plac — peut-être une mauvaise traduction de votre origine, ou un mot à signification plus profonde dans leur langue. Quoi qu\u0027il en soit, le nom resta, tout comme votre place parmi eux. Grâce à votre sagesse, votre leadership et vos connaissances avancées, vous gagnâtes leur confiance et finîtes par diriger leur colonie. Maintenant, vous supervisez la collecte des ressources et l\u0027avancement des recherches pour guider cet établissement croissant vers l\u0027avenir.\n\nPourtant, au fond de vous, une flamme brûle encore. Vous n\u0027avez pas oublié Miaplacidus. Vous n\u0027avez pas oublié votre peuple. Tandis que vous bâtissez un futur ici, vous dédiez votre vie à découvrir la vérité sur ce qui s\u0027est passé — pour trouver un chemin de retour et rétablir les choses.",
      },
      {
        heading: "Futur",
        body: "Équipé de peu plus qu’un modeste laboratoire, quelques matières premières et une étincelle d’hydrogène, vous commencez votre travail. Les Spicites se tournent vers vous pour obtenir des conseils, leur confiance est inébranlable. Bien que leur monde soit primitif selon vos standards, leur esprit est fort et votre leadership promet de déclencher une nouvelle ère.\n\nAvec vos connaissances en science avancée et les secrets du vide, vous introduisez des idées qui accélèrent le progrès bien au-delà de ce que cette colonie aurait pu accomplir seule. Au fur et à mesure que les premières structures émergent et que la recherche commence, des rumeurs circulent — les commerçants parlent de systèmes lointains et hostiles. Ils mentionnent des IA renégates, d’énormes Megastructures et des mondes stériles réduits en cendres.\n\nVous écoutez, et vous vous souvenez. Les envahisseurs. La perte. La trahison des étoiles. Ces histoires ne font que renforcer votre détermination. Vous guiderez les Spicites au-delà de leur monde, vers les étoiles et à travers le vide. Vous découvrirez ce qu’il est advenu de Miaplacidus. Et un jour, vous reviendrez — non pas en exil, mais en force — pour récupérer votre foyer et mettre fin à la menace des machines une bonne fois pour toutes. Vous êtes... Mia'Plac, et voici Miaplacidus !",
      },
    ],
    conceptsEarly: [
      {
        heading: "Ressources",
        body: "Les ressources sont les éléments de base du jeu. Elles peuvent être collectées manuellement, vendues, utilisées pour acheter des améliorations, fusionnées pour créer d\u0027autres ressources, ou plus tard, utilisées pour créer des composés avancés.",
      },
      {
        heading: "Gain Manuel",
        body: "Toutes les ressources ont un bouton qui, lorsqu\u0027on clique dessus, ajoute 1 à la quantité de cette ressource, tant que le total est inférieur à la limite de stockage. Utile en début de partie pour obtenir de petites quantités de ressources et démarrer le jeu !",
      },
      {
        heading: "Vendre",
        body: "En utilisant le menu déroulant pour choisir une quantité appropriée, puis en cliquant sur le bouton Vendre, vous échangez la quantité choisie de Ressource (ou plus tard de Composé) contre de l\u0027argent utilisable pour acheter certaines améliorations.",
      },
      {
        heading: "Stockage",
        body: "Chaque Ressource et Composé a une limite de Stockage. Si le Stockage est plein, aucune ressource supplémentaire ne peut être collectée jusqu\u0027à ce qu\u0027une partie soit utilisée ou que le Stockage soit augmenté. Améliorer le Stockage consomme tous vos stocks sauf 1 de cette Ressource ou Composé.",
      },
      {
        heading: "Auto Acheteurs",
        body: "Les Auto Acheteurs permettent d\u0027automatiser la collecte de ressources une fois débloqués. Ils fonctionnent en continu en arrière-plan, vous libérant pour d\u0027autres tâches, jusqu\u0027à ce que le Stockage soit plein. Certains nécessitent de l\u0027Énergie pour fonctionner.",
      },
      {
        heading: "Points de Recherche",
        body: "Les Points de Recherche sont obtenus grâce aux Améliorations de Recherche et sont utilisés pour débloquer de nouvelles technologies.",
      },
      {
        heading: "Améliorations de Recherche",
        body: "Les Améliorations de Recherche permettent de générer des Points de Recherche, certaines nécessitant de l\u0027Énergie pour fonctionner.",
      },
      {
        heading: "Technologie",
        body: "La Technologie débloque des améliorations puissantes et de nouvelles mécaniques de jeu. La plupart des technologies ont des prérequis et un coût en Points de Recherche.",
      },
      {
        heading: "Composés",
        body: "Les Composés sont des matériaux plus avancés nécessitant plusieurs Ressources pour être créés. Ils sont nécessaires pour les mécaniques de jeu intermédiaires et avancées.",
      },
      {
        heading: "Fusion",
        body: "La Fusion est un processus permettant de créer des Ressources à partir de Ressources plus basiques.",
      },
      {
        heading: "Fil d\u0027Actualité",
        body: "Le Fil d\u0027Actualité affiche des informations très importantes (sérieusement !) et peut parfois donner des buffs secrets, donc gardez un œil dessus en permanence.",
      },
    ],
    conceptsMid: [
      {
        heading: "Production et Consommation d\u0027Énergie",
        body: "L\u0027Énergie est nécessaire pour alimenter de nombreuses améliorations, telles que certains Auto Acheteurs et Améliorations de Recherche, et est ensuite consommée dans de nombreuses mécaniques de jeu avancées, ce qui est indiqué dans la description de la fonctionnalité. Il existe des installations de Production et de Stockage d\u0027Énergie.",
      },
      {
        heading: "Bâtiments Énergétiques",
        body: "Les Bâtiments Énergétiques génèrent de l\u0027Énergie et il en existe plusieurs types. Ils consomment du carburant en fonctionnement, parfois des Composés ou, dans d\u0027autres cas, de l\u0027énergie Solaire.",
      },
      {
        heading: "Batteries",
        body: "Les Batteries stockent l\u0027Énergie excédentaire pour une utilisation lorsque la production est insuffisante, par exemple s\u0027il n\u0027y a pas assez de Bâtiments Énergétiques après un achat d\u0027amélioration, ou si le carburant est épuisé pour un bâtiment particulier. Augmenter la capacité des Batteries est crucial pour maintenir le flux d\u0027Énergie tout en développant des améliorations qui en consomment.",
      },
      {
        heading: "Météo",
        body: "La Météo affecte diverses mécaniques du jeu, y compris la production d\u0027Énergie. Elle peut influencer le lancement des fusées et fournir des ressources supplémentaires via les précipitations. La météo dominante et les ressources apportées peuvent varier selon l\u0027étoile jouée (mécanique de fin de partie).",
      },
      {
        heading: "Exploitation Spatiale",
        body: "L\u0027Exploitation Spatiale permet l\u0027extraction d\u0027Antimatière rare à partir des Astéroïdes.",
      },
      {
        heading: "Événements",
        body: "Des Événements aléatoires peuvent survenir pendant votre progression, offrant des opportunités ou défis inattendus. Ils apparaissent sans avertissement et peuvent offrir des récompenses uniques, imposer des revers temporaires ou débloquer de nouvelles voies. Suivez les notifications : certains événements sont éphémères, d\u0027autres peuvent influencer votre partie si vous agissez judicieusement. Vous pouvez suivre les événements actuels et historiques dans le panneau Événements de l\u0027onglet Menu.",
      },
      {
        heading: "Télescope Spatial",
        body: "Le Télescope Spatial est utilisé pour scanner les Astéroïdes exploitables par vos Miners de Fusée, et, en fin de partie, pour Étudier les Étoiles. Son utilisation nécessite beaucoup d\u0027Énergie et son coût de construction est élevé.",
      },
      {
        heading: "Astéroïdes",
        body: "Les Astéroïdes contiennent de l\u0027Antimatière. Les exploiter nécessite la Construction et le Lancement de Miners de Fusée. Certains Astéroïdes sont faciles d\u0027accès et d\u0027exploitation, tandis que d\u0027autres nécessitent plus de temps. La quantité d\u0027Antimatière varie et les Astéroïdes ont différentes classes selon leur qualité. Avec beaucoup de chance, vous pourriez même trouver un Astéroïde Légendaire et le faire nommer d\u0027après vous !",
      },
      {
        heading: "Rampe de Lancement",
        body: "La Rampe de Lancement est un prérequis pour construire les Miners de Fusée. C\u0027est une amélioration coûteuse et, une fois construite, vous pouvez voir le nombre de Miners de Fusée que vous possédez et leurs étapes de Construction ou d\u0027État de Lancement.",
      },
      {
        heading: "Miners de Fusée - Construction",
        body: "Vous pouvez construire jusqu\u0027à 4 Miners de Fusée en utilisant des Composés avancés et beaucoup d\u0027argent, à condition d\u0027avoir construit la Rampe de Lancement. Chacun nécessite plusieurs modules ou pièces pour être construit, devenant progressivement plus coûteux. Par défaut, ils sont nommés Fusée 1, etc., mais peuvent être renommés.",
      },
      {
        heading: "Miners de Fusée - Lancement et Voyage",
        body: "Les fusées doivent être alimentées et lancées. Elles peuvent se déplacer vers tout Astéroïde découvert avec le Télescope Spatial, si elles sont alimentées et lancées. L\u0027alimentation nécessite Énergie et temps, et le lancement dépend d\u0027une météo favorable. Une fois lancée, vous pouvez sélectionner la destination de votre fusée dans le menu déroulant des Astéroïdes découverts, puis cliquer pour y voyager.",
      },
      {
        heading: "Miners de Fusée - Extraction",
        body: "Une fois qu\u0027un Miner de Fusée a atteint un Astéroïde, il extraira automatiquement l\u0027Antimatière jusqu\u0027à épuisement, puis retournera et nécessitera à nouveau un ravitaillement pour être réutilisé. Sur l\u0027Astéroïde, un Miner de Fusée peut extraire plus rapidement si l\u0027option Boost est activée, disponible dans le panneau d\u0027Exploitation.",
      },
    ],
    conceptsLate: [
      {
        heading: "Carte Stellaire",
        body: "La Carte Stellaire offre une vue de l\u0027Univers connu et, bien qu\u0027elle soit découverte relativement tôt dans le jeu, elle devient utile beaucoup plus tard. Une fois que vous commencez à Étudier les Étoiles, vous pouvez utiliser cette Carte et le tableau de Données Stellaires pour planifier vos options après la Renaissance.",
      },
      {
        heading: "Antimatière",
        body: "L\u0027Antimatière est une Ressource avancée utilisée comme carburant pour les Vaisseaux Spatiaux et est un composant clé pour progresser vers la Renaissance et terminer le jeu. Elle est extraite des Astéroïdes à l\u0027aide des Mineurs de Fusées.",
      },
      {
        heading: "Vaisseau Spatial - Construction",
        body: "Construire un Vaisseau Spatial est une étape majeure. Les Vaisseaux peuvent voyager vers des systèmes stellaires éloignés et permettre la Renaissance.",
      },
      {
        heading: "Vaisseau Spatial - Voyage",
        body: "Les Vaisseaux Spatiaux peuvent voyager vers des systèmes stellaires étudiés, chacun offrant une météo, des ressources et des défis uniques lors d\u0027une Renaissance pour une nouvelle partie.",
      },
      {
        heading: "Diplomatie",
        body: "La plupart des systèmes stellaires contiennent une vie extraterrestre intelligente. Vous devez effectuer un Scan Stellaire et construire un Envoyé pour l\u0027envoyer afin de lancer cette interaction. Le Scan fournit des informations sur la vie présente dans le système ; il n’est pas obligatoire, mais sans lui, votre seule option sera la guerre, sans connaître la taille de la flotte ennemie ! Plusieurs options sont possibles lors de ces rencontres : intimider, tenter de vassaliser ou, en dernier recours, conquérir ! Vous pouvez améliorer ou détériorer leur impression de vous, ce qui affecte la taille de leur flotte. Les leaders ont des traits influençant leur réaction ou, en cas de guerre, leur défense, vitesse, taille de flotte, etc.",
      },
      {
        heading: "Bataille",
        body: "Tous les systèmes ne sont pas amicaux. Parfois, la seule option est de combattre pour tenter de les conquérir. Vous devez utiliser l\u0027écran Hangar de Flotte pour constituer une force d\u0027attaque et initier la bataille. En cas de défaite, toute votre flotte sera détruite, mais pas votre Vaisseau Spatial. Vous pouvez reconstruire, mais c\u0027est coûteux, alors essayez de gagner !",
      },
      {
        heading: "Points d\u0027Ascendance (AP)",
        body: "Les Points d\u0027Ascendance (AP) sont gagnés en voyageant vers les étoiles. Plus l\u0027étoile est éloignée, plus d\u0027AP seront accordés lors de la Renaissance. Ils peuvent être dépensés au Marché Galactique. Vous pouvez également en obtenir en liquidant toutes vos ressources, composés et argent une fois par partie, et certaines méthodes de colonisation peuvent doubler le gain.",
      },
      {
        heading: "Renaissance",
        body: "La Renaissance réinitialise votre progression mais vous permet de conquérir un Nouveau Système. Chaque Système ainsi conquis octroie un Point Galactique (GP), et la capacité spéciale Expansionniste en octroie un pour chaque Système supplémentaire qu\u0027elle colonise. Les GP sont permanents et ne sont jamais réinitialisés par une Renaissance : ce sont la monnaie que vous dépensez dans le chapitre de la Fissure Cosmique.",
      },
      {
        heading: "Marché Galactique",
        body: "Le Marché Galactique est un déblocage majeur et apparaît après l\u0027arrivée de votre vaisseau dans le nouveau système lors de la première partie. Vous pouvez y échanger Ressources, Argent et AP.",
      },
      {
        heading: "Casino Galactique",
        body: "Le Casino Galactique vous permet de miser vos produits durement gagnés pour une gratification instantanée. Testez votre chance et risquez vos ressources pour obtenir des récompenses potentielles. Les gains ne s\u0027appliquent qu\u0027à la partie en cours, pas sur le long terme ou sur plusieurs parties.",
      },
      {
        heading: "Points de Casino (CP)",
        body: "Les Points de Casino (CP) sont la monnaie du Casino Galactique. Vous devez acheter des CP avec des Ressources ou des Composés, et c’est la seule façon de jouer aux jeux du casino pour obtenir diverses récompenses. Les CP sont réinitialisés lors de la Renaissance.",
      },
      {
        heading: "Avantages d\u0027Ascendance",
        body: "Vous pouvez dépenser les AP acquis pour des améliorations permanentes qui rendent les parties futures plus faciles et le jeu plus rejouable et amusant !",
      },
      {
        heading: "Trou Noir",
        body: "Vous pouvez découvrir accidentellement un Trou Noir et, une fois étudié, il peut être utilisé pour un Saut Temporel, accélérant les voyages et la collecte de ressources. Il doit être rechargé, ce qui prend du temps, mais ce temps peut être réduit avec des améliorations. Vous pouvez également augmenter sa durée d\u0027activation et sa puissance grâce à d\u0027autres améliorations. Une fois débloqué, il est disponible dans différentes parties.",
      },
      {
        heading: "Étoiles de Type O",
        body: "Les étoiles de type O sont les plus rares et les plus violentes de la galaxie. Chacune que vous contrôlez amplifie considérablement la production d\u0027énergie d\u0027un type de Bâtiment Énergétique. Attendez-vous à des défenses renforcées lors de la conquête de ces systèmes.",
      },
      {
        heading: "Étoiles de Type B",
        body: "Les étoiles de type B sont des étoiles bleues massives et très chaudes qui renforcent fortement vos Auto-Acheteurs. Lorsque vous êtes dans un système d\u0027étoile de type B, tous vos Auto-Acheteurs de Ressources gagnent un bonus fixe : Niveau 1 +2/s, Niveau 2 +8/s, Niveau 3 +25/s et Niveau 4 +80/s. Ce bonus s\u0027applique à toutes les Ressources mais pas aux Composés, et uniquement pendant la partie dans ce système de type B.",
      },
      {
        heading: "Étoiles de Type F",
        body: "Les étoiles de type F sont des étoiles jaune-blanc qui améliorent les opérations d\u0027extraction d\u0027Antimatière. Lorsque vous êtes dans un système d\u0027étoile de type F, toutes vos fusées obtiennent un bonus de 50 % à leur taux d\u0027extraction d\u0027Antimatière lors de l\u0027exploitation des Astéroïdes. Ce bonus s\u0027applique uniquement pendant la partie dans ce système de type F.",
      },
    ],
    endGoal: [
      {
        heading: "Manuscrits Anciens",
        body: "Les Manuscrits Anciens indiquent les systèmes stellaires de Megastructure. Des indices sur leur localisation peuvent parfois apparaître dans le Fil d\u0027Actualité, alors gardez un œil dessus.",
      },
      {
        heading: "Megastructures",
        body: "Les Megastructures sont extrêmement difficiles à conquérir et cachées dans la galaxie, mais les récompenses sont immenses. Chacune contribue également directement à la destruction du champ de force de Miaplacidus.",
      },
      {
        heading: "Miaplacidus",
        body: "Miaplacidus — votre Patrie — est protégé par un champ de force puissant maintenu par la race des machines. En démontant les Megastructures et en les reliant à votre cause, ce champ de force s’affaiblira jusqu\u0027à s\u0027effondrer, où vous devrez alors livrer la bataille ultime pour récupérer votre Patrie ancestrale.",
      },
      {
        heading: "Fissure Cosmique",
        body: "La Fissure Cosmique est une anomalie dangereuse menaçant l\u0027avenir de votre peuple. Une fois vos forces assez puissantes pour reprendre Miaplacidus, vous devez d\u0027abord localiser la Fissure en scannant les secteurs spatiaux locaux. Après l\u0027avoir localisée, vous entreprendrez des études et constructions coûteuses pour la stabiliser. Une fois stabilisée et sécurisée, vous pourrez enfin la refermer définitivement. Les Points Galactiques (GP) sont la monnaie de ce chapitre. Vous les gagnez en effectuant des Renaissances, un pour chaque Système conquis, et vous les dépensez pour mettre en service le Réseau de Scanners de l\u0027Espace Proche, pour chaque scan de secteur lors de la recherche de la Fissure, et pour chaque technologie de la Fissure Cosmique que vous recherchez.",
      },
      {
        heading: "Objectif Final",
        body: "Une fois le champ de force de Miaplacidus disparu, vous pourrez attaquer la race IA maîtresse, récupérer Miaplacidus, reconquérir votre Patrie et fermer la Fissure Cosmique, assurant définitivement l\u0027avenir de votre peuple ! C’est l’objectif final du jeu.",
      },
    ],
    philosophies: [
      {
        heading: "Philosophies",
        body: "Les Philosophies sont introduites progressivement lors de la première partie. Vous êtes encouragé à choisir l\u0027une des quatre voies possibles, chacune étant une décision unique et permanente pour le reste du jeu. Une fois une Philosophie choisie et la première partie terminée, une nouvelle option apparaîtra sous l\u0027onglet Recherche, où vous pourrez rechercher une capacité spéciale unique et une série de Technologies Répétables uniques correspondant au type de Philosophie choisi. Tous ces bonus restent avec vous tout au long du jeu, même après les Renaissances.",
      },
      {
        heading: "Capacité Spéciale",
        body: "Chaque Philosophie confère une capacité spéciale unique. Elles sont extrêmement puissantes et peuvent rendre le jeu beaucoup plus amusant de différentes manières, affectant des mécaniques diverses. Il est donc sage de réfléchir attentivement au choix de votre Philosophie, car elle ne peut être changée par la suite et une seule voie est possible par partie.",
      },
      {
        heading: "Technologies Répétables",
        body: "Chaque Philosophie offre une série de Technologies Répétables uniques. Elles offrent des bonus cumulables permanents et coûtent des Points de Recherche. Selon la Philosophie choisie, les effets diffèrent et, une fois plusieurs technologies acquises, deviennent très puissants.",
      },
      {
        heading: "Constructeur",
        body: "La Philosophie Constructeur est centrée sur l\u0027amélioration moins coûteuse et plus efficace. Vous gagnez des bonus sur les prix des Auto Acheteurs, la Capacité de Stockage, les coûts d\u0027Énergie et d\u0027Améliorations de Recherche, et une réduction du coût de création des Composés.",
      },
      {
        heading: "Suprémaciste",
        body: "La Philosophie Suprémaciste privilégie la puissance militaire et la conquête. Attendez-vous à des Flottes plus fortes, plus rapides, moins coûteuses et à la capacité de forcer les ennemis à la Vassalisation.",
      },
      {
        heading: "Né du Vide",
        body: "Né du Vide, attendez-vous à des bonus concernant les premières impressions avec les Civilisations des systèmes étrangers, de meilleures recherches d\u0027Astéroïdes et études stellaires, des opportunités d\u0027augmenter le gain d\u0027AP, et même la capacité de piller le Vide pour obtenir d\u0027énormes quantités de Ressources et Composés !",
      },
      {
        heading: "Expansionniste",
        body: "Les Expansionnistes prospèrent en colonisant et en s\u0027étendant à travers les étoiles. Réduisez le temps de voyage des Miners de Fusée et des Vaisseaux Spatiaux et rendez-les moins coûteux, tout en gagnant la possibilité de convaincre les systèmes voisins de céder lorsqu\u0027un système est conquis !",
      },
    ],
  },
} as const;

export type CosmicopediaSectionId = keyof typeof cosmicopediaSourceMessages.en;

export function cosmicopediaArticles(
  locale: LocaleId,
  sectionId: CosmicopediaSectionId,
): readonly CosmicopediaArticle[] {
  return cosmicopediaSourceMessages[locale][sectionId];
}
