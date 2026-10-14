import type { LocaleId } from "../content/ids";

interface MarketBiasHelpCopy {
  readonly outgoingTitle: string;
  readonly outgoingBody: string;
  readonly incomingTitle: string;
  readonly incomingBody: string;
  readonly outlookTitle: string;
  readonly higherOutgoing: string;
  readonly higherIncoming: string;
  readonly balanced: string;
}

const MARKET_BIAS_HELP: Record<LocaleId, MarketBiasHelpCopy> = {
  en: {
    outgoingTitle: "Outgoing Bias",
    outgoingBody:
      "Positive: this resource will be priced lower in the future (you'll get less when selling). Negative: this resource will be priced higher in the future (you'll get more when selling).",
    incomingTitle: "Incoming Bias",
    incomingBody:
      "Positive: this resource costs less than baseline to buy right now. Negative: this resource costs more than baseline to buy right now.",
    outlookTitle: "Market Outlook",
    higherOutgoing:
      "Outgoing bias higher → future selling prices for your exports are trending down.",
    higherIncoming:
      "Incoming bias higher → good time to buy imports as prices are favorable.",
    balanced: "Market is stable with no strong price trends in either direction.",
  },
  es: {
    outgoingTitle: "Sesgo Saliente",
    outgoingBody:
      "Positivo: este recurso tendrá un precio más bajo en el futuro (obtendrás menos al vender). Negativo: este recurso tendrá un precio más alto en el futuro (obtendrás más al vender).",
    incomingTitle: "Sesgo Entrante",
    incomingBody:
      "Positivo: este recurso cuesta menos que la línea base para comprar ahora mismo. Negativo: este recurso cuesta más que la línea base para comprar ahora mismo.",
    outlookTitle: "Perspectiva del Mercado",
    higherOutgoing:
      "Sesgo saliente más alto → los precios de venta futuros para tus exportaciones están tendiendo a la baja.",
    higherIncoming:
      "Sesgo entrante más alto → buen momento para comprar importaciones ya que los precios son favorables.",
    balanced: "El mercado es estable sin tendencias de precios fuertes en ninguna dirección.",
  },
  pt: {
    outgoingTitle: "Tendência de Saída",
    outgoingBody:
      "Positivo: este recurso terá um preço mais baixo no futuro (você ganhará menos ao vender). Negativo: este recurso terá um preço mais alto no futuro (você ganhará mais ao vender).",
    incomingTitle: "Tendência de Entrada",
    incomingBody:
      "Positivo: este recurso custa menos que a linha de base para comprar agora. Negativo: este recurso custa mais que a linha de base para comprar agora.",
    outlookTitle: "Perspectiva do Mercado",
    higherOutgoing:
      "Maior tendência de saída → os preços futuros de venda das suas exportações estão tendendo a cair.",
    higherIncoming:
      "Maior tendência de entrada → bom momento para comprar importações, pois os preços estão favoráveis.",
    balanced: "O mercado está estável, sem fortes tendências de preços em nenhuma direção.",
  },
  de: {
    outgoingTitle: "Ausgehende Tendenz",
    outgoingBody:
      "Positiv: Diese Ressource wird in Zukunft niedriger bewertet (du bekommst weniger beim Verkauf). Negativ: Diese Ressource wird in Zukunft höher bewertet (du bekommst mehr beim Verkauf).",
    incomingTitle: "Eingehende Tendenz",
    incomingBody:
      "Positiv: Diese Ressource kostet weniger als die Basislinie zum jetzigen Kauf. Negativ: Diese Ressource kostet mehr als die Basislinie zum jetzigen Kauf.",
    outlookTitle: "Marktausblick",
    higherOutgoing:
      "Höherer ausgehender Bias → zukünftige Verkaufspreise für deine Exporte zeigen nach unten.",
    higherIncoming:
      "Höherer eingehender Bias → gute Zeit, Importe zu kaufen, da die Preise günstig sind.",
    balanced: "Der Markt ist stabil ohne starke Preistrends in irgendeine Richtung.",
  },
  it: {
    outgoingTitle: "Tendenza in uscita",
    outgoingBody:
      "Positivo: questa risorsa avrà un prezzo più basso in futuro (otterrai meno quando vendi). Negativo: questa risorsa avrà un prezzo più alto in futuro (otterrai di più quando vendi).",
    incomingTitle: "Tendenza in entrata",
    incomingBody:
      "Positivo: questa risorsa costa meno della linea di base da acquistare proprio ora. Negativo: questa risorsa costa più della linea di base da acquistare proprio ora.",
    outlookTitle: "Prospettiva di Mercato",
    higherOutgoing:
      "Bias in uscita più alto → i prezzi di vendita futuri per le tue esportazioni sono in calo.",
    higherIncoming:
      "Bias in entrata più alto → buon momento per comprare importazioni poiché i prezzi sono favorevoli.",
    balanced: "Il mercato è stabile senza forti tendenze dei prezzi in nessuna direzione.",
  },
  fr: {
    outgoingTitle: "Tendance à la vente",
    outgoingBody:
      "Positif: cette ressource sera moins chère à l'avenir (tu obtiendras moins en vendant). Négatif: cette ressource sera plus chère à l'avenir (tu obtiendras plus en vendant).",
    incomingTitle: "Tendance à l'achat",
    incomingBody:
      "Positif: cette ressource coûte moins cher que la ligne de base pour acheter maintenant. Négatif: cette ressource coûte plus cher que la ligne de base pour acheter maintenant.",
    outlookTitle: "Perspective du Marché",
    higherOutgoing:
      "Bias sortant plus élevé → les prix de vente futurs pour tes exportations sont en baisse.",
    higherIncoming:
      "Bias entrant plus élevé → bon moment pour acheter des importations car les prix sont favorables.",
    balanced: "Le marché est stable sans fortes tendances de prix dans aucune direction.",
  },
};

export type MarketSourceHelpKey = "trade" | "sellAp" | "liquidation";

interface MarketSourceHelpCopy {
  readonly label: string;
  readonly text: string;
  readonly alreadyUsedText?: string;
}

/** Galactic Market and Rebirth action help mapped from Cosmic Forge localization.json. */
const MARKET_SOURCE_HELP: Readonly<
  Record<LocaleId, Readonly<Record<MarketSourceHelpKey, MarketSourceHelpCopy>>>
> = {
  en: {
    trade: {
      label: "Trade information",
      text: "Trade Resources and Compounds. There is a commission to pay!",
    },
    sellAp: {
      label: "AP sale information",
      text: "Sell AP for Cash! Be careful as AP are not easy to come by!",
    },
    liquidation: {
      label: "Liquidation information",
      text: "Liquidate ALL Cash, Resources and Compounds, to AP. You can only do this once per run so choose your moment wisely! The Galactic Market Base rate affects this calculation so the value can fluctuate.",
      alreadyUsedText:
        "Liquidate ALL Cash, Resources and Compounds, to AP. The Galactic Market Base rate affects this calculation so the value can fluctuate. Already done this run!",
    },
  },
  es: {
    trade: {
      label: "Informaci\u00f3n sobre el intercambio",
      text: "\u00a1Comercia Recursos y Compuestos. \u00a1Hay una comisi\u00f3n que pagar!",
    },
    sellAp: {
      label: "Informaci\u00f3n sobre la venta de PA",
      text: "\u00a1Vende AP por Dinero! \u00a1Ten cuidado porque los AP no son f\u00e1ciles de conseguir!",
    },
    liquidation: {
      label: "Informaci\u00f3n sobre la liquidaci\u00f3n",
      text: "Liquida TODO el Dinero, Recursos y Compuestos, a AP. Solo puedes hacer esto una vez por partida, as\u00ed que elige tu momento sabiamente! La tasa base del Mercado Gal\u00e1ctico afecta este c\u00e1lculo, as\u00ed que el valor puede fluctuar.",
      alreadyUsedText:
        "Liquida TODO el Dinero, Recursos y Compuestos, a AP. La tasa base del Mercado Gal\u00e1ctico afecta este c\u00e1lculo, as\u00ed que el valor puede fluctuar. \u00a1Ya hecho en esta partida!",
    },
  },
  pt: {
    trade: {
      label: "Informa\u00e7\u00f5es sobre a troca",
      text: "Negocie Recursos e Compostos. H\u00e1 uma comiss\u00e3o a pagar!",
    },
    sellAp: {
      label: "Informa\u00e7\u00f5es sobre a venda de PA",
      text: "Venda AP por Dinheiro! Tenha cuidado, pois AP n\u00e3o \u00e9 f\u00e1cil de obter!",
    },
    liquidation: {
      label: "Informa\u00e7\u00f5es sobre a liquida\u00e7\u00e3o",
      text: "Liquide TODO o Dinheiro, Recursos e Compostos por AP. Voc\u00ea s\u00f3 pode fazer isso uma vez por partida, ent\u00e3o escolha o momento com sabedoria! A taxa base do Mercado Gal\u00e1ctico afeta esse c\u00e1lculo, portanto o valor pode variar.",
      alreadyUsedText:
        "Liquide TODO o Dinheiro, Recursos e Compostos por AP. A taxa base do Mercado Gal\u00e1ctico afeta esse c\u00e1lculo, portanto o valor pode variar. J\u00e1 realizado nesta partida!",
    },
  },
  de: {
    trade: {
      label: "Handelsinformationen",
      text: "Handele mit Ressourcen und Verbindungen. Es gibt eine Provision zu zahlen!",
    },
    sellAp: {
      label: "Informationen zum AP-Verkauf",
      text: "Verkaufe AP f\u00fcr Bargeld! Sei vorsichtig, denn AP sind nicht leicht zu bekommen!",
    },
    liquidation: {
      label: "Informationen zur Liquidation",
      text: "Liquidere ALLES Bargeld, Ressourcen und Verbindungen zu AP. Du kannst dies nur einmal pro Durchlauf tun, also w\u00e4hle deinen Moment weise! Der Galaktische Markt-Basissatz beeinflusst diese Berechnung, also kann der Wert schwanken.",
      alreadyUsedText:
        "Liquidere ALLES Bargeld, Ressourcen und Verbindungen zu AP. Der Galaktische Markt-Basissatz beeinflusst diese Berechnung, also kann der Wert schwanken. Bereits in diesem Durchlauf gemacht!",
    },
  },
  it: {
    trade: {
      label: "Informazioni sullo scambio",
      text: "Commercia Risorse e Composti. C'\u00e8 una commissione da pagare!",
    },
    sellAp: {
      label: "Informazioni sulla vendita di PA",
      text: "Vendi AP per Contanti! Fai attenzione perch\u00e9 gli AP non sono facili da trovare!",
    },
    liquidation: {
      label: "Informazioni sulla liquidazione",
      text: "Liquida TUTTI i Contanti, Risorse e Composti, in AP. Puoi farlo solo una volta per corsa, quindi scegli il momento con saggezza! Il tasso base del Mercato Galattico influenza questo calcolo, quindi il valore pu\u00f2 fluttuare.",
      alreadyUsedText:
        "Liquida TUTTI i Contanti, Risorse e Composti, in AP. Il tasso base del Mercato Galattico influenza questo calcolo, quindi il valore pu\u00f2 fluttuare. Gi\u00e0 fatto in questa corsa!",
    },
  },
  fr: {
    trade: {
      label: "Informations sur l'\u00e9change",
      text: "Commercez des Ressources et Compos\u00e9s. Il y a une commission \u00e0 payer!",
    },
    sellAp: {
      label: "Informations sur la vente de PA",
      text: "Vendez des PA contre de l'Argent! Attention, les PA ne sont pas faciles \u00e0 obtenir!",
    },
    liquidation: {
      label: "Informations sur la liquidation",
      text: "Liquidez TOUT l'Argent, Ressources et Compos\u00e9s, en PA. Vous ne pouvez le faire qu'une fois par partie, alors choisissez votre moment sagement! Le taux de base du March\u00e9 Galactique affecte ce calcul, donc la valeur peut fluctuer.",
      alreadyUsedText:
        "Liquidez TOUT l'Argent, Ressources et Compos\u00e9s, en PA. Le taux de base du March\u00e9 Galactique affecte ce calcul, donc la valeur peut fluctuer. D\u00e9j\u00e0 fait dans cette partie!",
    },
  },
};

export const LOCALIZATION_VALIDATION_DATA = { MARKET_BIAS_HELP, MARKET_SOURCE_HELP } as const;

export function marketSourceHelpLabel(locale: LocaleId, key: MarketSourceHelpKey): string {
  return MARKET_SOURCE_HELP[locale][key].label;
}

export function marketSourceHelpText(
  locale: LocaleId,
  key: MarketSourceHelpKey,
  alreadyUsed = false,
): string {
  const copy = MARKET_SOURCE_HELP[locale][key];
  return alreadyUsed ? (copy.alreadyUsedText ?? copy.text) : copy.text;
}

export function marketBiasHelpLabel(locale: LocaleId): string {
  return MARKET_BIAS_HELP[locale].outlookTitle;
}

export function marketBiasHelpText(
  locale: LocaleId,
  outgoingBias: number | null,
  incomingBias: number | null,
): string {
  const copy = MARKET_BIAS_HELP[locale];
  const sections: string[] = [];

  if (outgoingBias !== null) sections.push(`${copy.outgoingTitle}: ${copy.outgoingBody}`);
  if (incomingBias !== null) sections.push(`${copy.incomingTitle}: ${copy.incomingBody}`);

  if (outgoingBias !== null && incomingBias !== null) {
    const outlook =
      Math.abs(outgoingBias) > Math.abs(incomingBias)
        ? copy.higherOutgoing
        : Math.abs(incomingBias) > Math.abs(outgoingBias)
          ? copy.higherIncoming
          : copy.balanced;
    sections.push(`${copy.outlookTitle}: ${outlook}`);
  }

  return sections.join(" ");
}
