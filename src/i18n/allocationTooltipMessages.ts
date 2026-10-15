import type { LocaleId } from "../content/ids";

export interface AllocationTooltipValues {
  readonly cashPercent: number;
  readonly compoundPercent: number;
  readonly storagePercent: number;
}

export interface AllocationTooltipCopy {
  readonly sliderHeading: string;
  readonly introduction: string;
  readonly storage: string;
  readonly cash: string;
  readonly compounds: string;
  readonly cashHandle: string;
  readonly cashOff: string;
  readonly compoundHandle: string;
  readonly compoundFallback: string;
  readonly storageFull: string;
  readonly cashHandleLabel: string;
  readonly compoundHandleLabel: string;
  readonly compoundOff: string;
  readonly compoundThrottled: string;
  readonly breakdownHint: string;
}

const COPY: Record<LocaleId, AllocationTooltipCopy> = {
  en: {
    sliderHeading: "Using this slider",
    introduction:
      "Eligible production is divided by the shares below: cash first, then compounds, then storage.",
    storage: "Kept in storage: {percent}%",
    cash: "Sold for cash: {percent}%",
    compounds: "Available to auto-created compounds: {percent}%",
    cashHandle:
      "Move the first handle right to sell a larger share. Production beyond it can go to compounds or storage.",
    cashOff: "Set the first handle to 0% to sell none of this production.",
    compoundHandle:
      "The second handle sets the share offered to compounds that auto-create from this material.",
    compoundFallback:
      "If auto-creation is off or a compound cannot use its share, that production remains in storage.",
    storageFull:
      "Storage is full. Production that is not sold or used by compounds cannot be retained.",
    cashHandleLabel: "Share sold for cash",
    compoundHandleLabel: "Share available to compounds",
    compoundOff:
      "Auto-create is off for {compounds}, so that share — {rate} — is going into storage instead.",
    compoundThrottled:
      "{compound} is limited by {resource}, so only the amount it can use is taken and the rest is stored.",
    breakdownHint: "Hover the production figure in the left pane for the full breakdown.",
  },
  es: {
    sliderHeading: "Cómo usar este control",
    introduction:
      "La producción disponible se divide según estas partes: primero efectivo, luego compuestos y después almacén.",
    storage: "Guardado en almacén: {percent}%",
    cash: "Vendido por efectivo: {percent}%",
    compounds: "Disponible para compuestos automáticos: {percent}%",
    cashHandle:
      "Mueve el primer control a la derecha para vender una parte mayor. Lo que queda puede ir a compuestos o al almacén.",
    cashOff: "Pon el primer control en 0% para no vender esta producción.",
    compoundHandle:
      "El segundo control define la parte ofrecida a los compuestos que se crean automáticamente con este material.",
    compoundFallback:
      "Si la creación automática está apagada o un compuesto no puede usar su parte, esa producción queda en el almacén.",
    storageFull:
      "El almacén está lleno. La producción que no se venda ni usen los compuestos no se puede guardar.",
    cashHandleLabel: "Parte vendida por efectivo",
    compoundHandleLabel: "Parte disponible para compuestos",
    compoundOff:
      "La auto-creación está apagada para {compounds}, así que esa parte — {rate} — va al almacén.",
    compoundThrottled:
      "{compound} está limitado por {resource}, así que sólo se toma lo que puede usar y el resto se almacena.",
    breakdownHint:
      "Pasa el ratón por la cifra de producción del panel izquierdo para ver el desglose completo.",
  },
  pt: {
    sliderHeading: "Como usar este controlo",
    introduction:
      "A produção disponível é dividida pelas partes abaixo: primeiro dinheiro, depois compostos e, por fim, armazém.",
    storage: "Guardado no armazém: {percent}%",
    cash: "Vendido por dinheiro: {percent}%",
    compounds: "Disponível para compostos automáticos: {percent}%",
    cashHandle:
      "Move o primeiro controlo para a direita para vender uma parte maior. O restante pode ir para compostos ou para o armazém.",
    cashOff: "Coloca o primeiro controlo em 0% para não vender esta produção.",
    compoundHandle:
      "O segundo controlo define a parte oferecida aos compostos criados automaticamente a partir deste material.",
    compoundFallback:
      "Se a criação automática estiver desligada ou um composto não puder usar a sua parte, essa produção fica no armazém.",
    storageFull:
      "O armazém está cheio. A produção que não for vendida nem usada pelos compostos não pode ser guardada.",
    cashHandleLabel: "Parte vendida por dinheiro",
    compoundHandleLabel: "Parte disponível para compostos",
    compoundOff:
      "A auto-criação está desligada para {compounds}, por isso essa parte — {rate} — vai para o armazém.",
    compoundThrottled:
      "{compound} está limitado por {resource}, por isso só se retira o que consegue usar e o resto é armazenado.",
    breakdownHint:
      "Passa o rato sobre o valor de produção no painel esquerdo para ver a repartição completa.",
  },
  de: {
    sliderHeading: "Diesen Regler verwenden",
    introduction:
      "Die verfügbare Produktion wird nach den Anteilen unten verteilt: zuerst Bargeld, dann Verbindungen, dann Lager.",
    storage: "Im Lager behalten: {percent}%",
    cash: "Für Bargeld verkauft: {percent}%",
    compounds: "Für automatisch erzeugte Verbindungen verfügbar: {percent}%",
    cashHandle:
      "Ziehe den ersten Griff nach rechts, um einen größeren Anteil zu verkaufen. Der Rest kann an Verbindungen oder ins Lager gehen.",
    cashOff: "Setze den ersten Griff auf 0%, um nichts von dieser Produktion zu verkaufen.",
    compoundHandle:
      "Der zweite Griff legt den Anteil fest, der Verbindungen angeboten wird, die automatisch aus diesem Material entstehen.",
    compoundFallback:
      "Wenn die automatische Erzeugung aus ist oder eine Verbindung ihren Anteil nicht nutzen kann, bleibt diese Produktion im Lager.",
    storageFull:
      "Das Lager ist voll. Produktion, die weder verkauft noch von Verbindungen genutzt wird, kann nicht behalten werden.",
    cashHandleLabel: "Anteil für Bargeld verkauft",
    compoundHandleLabel: "Anteil für Verbindungen verfügbar",
    compoundOff:
      "Die Auto-Erzeugung ist für {compounds} aus, also geht dieser Anteil — {rate} — stattdessen ins Lager.",
    compoundThrottled:
      "{compound} wird durch {resource} begrenzt, daher wird nur das Nutzbare entnommen und der Rest eingelagert.",
    breakdownHint:
      "Zeige auf den Produktionswert im linken Bereich für die vollständige Aufschlüsselung.",
  },
  it: {
    sliderHeading: "Come usare questo cursore",
    introduction:
      "La produzione disponibile viene divisa secondo le quote indicate: prima denaro, poi composti e infine deposito.",
    storage: "Tenuto in deposito: {percent}%",
    cash: "Venduto per denaro: {percent}%",
    compounds: "Disponibile per i composti automatici: {percent}%",
    cashHandle:
      "Sposta la prima maniglia a destra per vendere una quota maggiore. Il resto può andare ai composti o al deposito.",
    cashOff: "Imposta la prima maniglia su 0% per non vendere questa produzione.",
    compoundHandle:
      "La seconda maniglia imposta la quota offerta ai composti creati automaticamente da questo materiale.",
    compoundFallback:
      "Se la creazione automatica è disattivata o un composto non può usare la sua quota, la produzione resta in deposito.",
    storageFull:
      "Il deposito è pieno. La produzione non venduta né usata dai composti non può essere conservata.",
    cashHandleLabel: "Quota venduta per contanti",
    compoundHandleLabel: "Quota disponibile per i composti",
    compoundOff:
      "L’auto-creazione è spenta per {compounds}, quindi quella quota — {rate} — finisce nel deposito.",
    compoundThrottled:
      "{compound} è limitato da {resource}, quindi si preleva solo ciò che può usare e il resto va in deposito.",
    breakdownHint:
      "Passa il mouse sul valore di produzione nel pannello di sinistra per il dettaglio completo.",
  },
  fr: {
    sliderHeading: "Utiliser ce curseur",
    introduction:
      "La production disponible est répartie selon les parts ci-dessous : d’abord l’argent, puis les composés, puis le stock.",
    storage: "Conservé en stock : {percent}%",
    cash: "Vendu contre de l’argent : {percent}%",
    compounds: "Disponible pour les composés automatiques : {percent}%",
    cashHandle:
      "Déplacez la première poignée vers la droite pour vendre une part plus importante. Le reste peut aller aux composés ou au stock.",
    cashOff: "Placez la première poignée sur 0% pour ne rien vendre de cette production.",
    compoundHandle:
      "La seconde poignée définit la part proposée aux composés créés automatiquement à partir de ce matériau.",
    compoundFallback:
      "Si la création automatique est désactivée ou si un composé ne peut pas utiliser sa part, cette production reste en stock.",
    storageFull:
      "Le stock est plein. La production qui n’est ni vendue ni utilisée par les composés ne peut pas être conservée.",
    cashHandleLabel: "Part vendue contre de l’argent",
    compoundHandleLabel: "Part disponible pour les composés",
    compoundOff:
      "La création automatique est désactivée pour {compounds}, donc cette part — {rate} — part au stock.",
    compoundThrottled:
      "{compound} est limité par {resource} : seule la quantité utilisable est prélevée, le reste est stocké.",
    breakdownHint:
      "Survolez la valeur de production du panneau de gauche pour le détail complet.",
  },
};

export function allocationTooltipMessages(
  locale: LocaleId,
  values: AllocationTooltipValues,
): AllocationTooltipCopy {
  const template = COPY[locale];
  const fill = (message: string, percent: number) =>
    message.replace("{percent}", String(percent));
  return {
    ...template,
    storage: fill(template.storage, values.storagePercent),
    cash: fill(template.cash, values.cashPercent),
    compounds: fill(template.compounds, values.compoundPercent),
  };
}

export const LOCALIZATION_VALIDATION_DATA = { messages: COPY } as const;
