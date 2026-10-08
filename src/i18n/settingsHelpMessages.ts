import type { LocaleId } from "../content/ids";

export type SettingsHelpId = "early" | "mid" | "late";

const messages: Readonly<Record<LocaleId, Readonly<Record<SettingsHelpId, string>>>> = {
  en: {
    early:
      "Collect Hydrogen to begin, then sell stock for cash. Each material has its own storage cap; the rate shows how quickly production and use change its stock.",
    mid: "Science buildings generate research points. Technologies unlock more systems, compounds use material recipes, and powered buildings share the available energy supply.",
    late: "New space and meta systems appear as their progression gates are met. This guide lists only the systems your civilization has reached.",
  },
  es: {
    early:
      "Recolecta hidrógeno para empezar y vende existencias para obtener dinero. Cada material tiene su propio límite de almacenamiento; la tasa indica cómo cambian las existencias con la producción y el consumo.",
    mid: "Los edificios científicos generan puntos de investigación. Las tecnologías desbloquean sistemas, los compuestos usan recetas de materiales y los edificios comparten la energía disponible.",
    late: "Los nuevos sistemas espaciales y meta aparecen al alcanzar sus requisitos de progreso. Esta guía solo muestra los sistemas a los que ha llegado tu civilización.",
  },
  pt: {
    early:
      "Recolhe hidrogénio para começar e vende o stock para obter dinheiro. Cada material tem o seu limite de armazenamento; a taxa mostra como a produção e o consumo alteram o stock.",
    mid: "Os edifícios científicos geram pontos de pesquisa. As tecnologias desbloqueiam sistemas, os compostos usam receitas de materiais e os edifícios partilham a energia disponível.",
    late: "Os novos sistemas espaciais e meta surgem quando os respetivos requisitos de progresso são cumpridos. Este guia só mostra os sistemas alcançados pela tua civilização.",
  },
  de: {
    early:
      "Sammle Wasserstoff und verkaufe Vorräte für Bargeld. Jedes Material hat ein eigenes Lagerlimit; die Rate zeigt, wie schnell Produktion und Verbrauch den Bestand verändern.",
    mid: "Wissenschaftsgebäude erzeugen Forschungspunkte. Technologien schalten Systeme frei, Verbindungen nutzen Materialrezepte und Gebäude teilen sich die verfügbare Energie.",
    late: "Neue Raumfahrt- und Meta-Systeme erscheinen, sobald ihre Fortschrittsbedingungen erfüllt sind. Diese Hilfe zeigt nur Systeme, die deine Zivilisation erreicht hat.",
  },
  it: {
    early:
      "Raccogli idrogeno per iniziare e vendi le scorte per ottenere denaro. Ogni materiale ha una propria capacità; il tasso mostra come produzione e consumo ne cambiano la quantità.",
    mid: "Gli edifici scientifici generano punti ricerca. Le tecnologie sbloccano sistemi, i composti seguono ricette di materiali e gli edifici condividono l'energia disponibile.",
    late: "I nuovi sistemi spaziali e meta appaiono quando raggiungi i relativi requisiti di progresso. Questa guida mostra solo i sistemi raggiunti dalla tua civiltà.",
  },
  fr: {
    early:
      "Collectez de l'hydrogène pour commencer, puis vendez vos réserves pour gagner de l'argent. Chaque matériau a sa propre capacité ; le taux indique l'évolution du stock par la production et la consommation.",
    mid: "Les bâtiments scientifiques produisent des points de recherche. Les technologies débloquent des systèmes, les composés suivent des recettes et les bâtiments partagent l'énergie disponible.",
    late: "Les systèmes spatiaux et méta apparaissent lorsque leurs conditions de progression sont remplies. Ce guide n'affiche que ceux atteints par votre civilisation.",
  },
};

export function settingsHelpText(locale: LocaleId, id: SettingsHelpId): string {
  return messages[locale][id];
}

export const LOCALIZATION_VALIDATION_DATA = { messages } as const;
