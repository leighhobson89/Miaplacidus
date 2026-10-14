import type { LocaleId } from "../content/ids";
import type { RandomEventDialogCopy } from "./randomEventDialogTypes";

export type CosmicRipMilestoneResultDialogId = "scannerRestored" | "ripLocated";

interface CosmicRipMilestoneResultMessage {
  readonly title: string;
  readonly firstBefore: string;
  readonly highlighted: string;
  readonly firstAfter: string;
  readonly secondParagraph: string;
  readonly confirmLabel: string;
}

const messages: Readonly<
  Record<LocaleId, Readonly<Record<CosmicRipMilestoneResultDialogId, CosmicRipMilestoneResultMessage>>>
> = {
  en: {
    scannerRestored: {
      title: "Near Space Scanner Array Restored!",
      firstBefore: "We have restored the strange ",
      highlighted: "Near Space Scanner Array",
      firstAfter: " orbiting Miaplacidus inside the ruined force field.",
      secondParagraph:
        "With Galactic Points (GP), we can bring it fully online and scan Miaplacidus' local space to locate the source of the AI invasion!",
      confirmLabel: "CONFIRM",
    },
    ripLocated: {
      title: "Cosmic Rip Located!",
      firstBefore: "The ",
      highlighted: "Cosmic Rip",
      firstAfter: " opened by the scientist, through which the evil AI race travelled has been located.",
      secondParagraph: "We will dispatch science teams to investigate at once!",
      confirmLabel: "CONFIRM",
    },
  },
  es: {
    scannerRestored: {
      title: "¡Matriz de Escáner de Espacio Cercano Restaurada!",
      firstBefore: "Hemos restaurado la extraña ",
      highlighted: "Matriz de Escáner de Espacio Cercano",
      firstAfter: " orbitando Miaplacidus dentro del campo de fuerza en ruinas.",
      secondParagraph:
        "¡Con Puntos Galácticos (PG), podemos ponerla completamente en línea y escanear el espacio local de Miaplacidus para localizar la fuente de la invasión de IA!",
      confirmLabel: "CONFIRMAR",
    },
    ripLocated: {
      title: "¡Desgarro Cósmico Localizado!",
      firstBefore: "¡El ",
      highlighted: "Desgarro Cósmico",
      firstAfter:
        " abierto por el científico, a través del cual viajó la raza malvada de IA ha sido localizado!",
      secondParagraph: "¡Despacharemos equipos de ciencia para investigar de inmediato!",
      confirmLabel: "CONFIRMAR",
    },
  },
  pt: {
    scannerRestored: {
      title: "MATRIZ DE SCANNER DO ESPAÇO PRÓXIMO RESTAURADA!",
      firstBefore: "Restaurámos a estranha ",
      highlighted: "Matriz de Scanner do Espaço Próximo",
      firstAfter: " que orbita Miaplacidus dentro do campo de força em ruínas.",
      secondParagraph:
        "Com Pontos Galácticos (PG), podemos colocá-la totalmente online e explorar o espaço local de Miaplacidus para localizar a fonte da invasão da IA!",
      confirmLabel: "CONFIRMAR",
    },
    ripLocated: {
      title: "RASGO CÓSMICO LOCALIZADO!",
      firstBefore: "O ",
      highlighted: "Rasgo Cósmico",
      firstAfter:
        " aberto pelo cientista, através do qual viajou a raça maléfica de IA, foi localizado!",
      secondParagraph: "Enviaremos imediatamente equipas de ciência para investigar!",
      confirmLabel: "CONFIRMAR",
    },
  },
  de: {
    scannerRestored: {
      title: "Nahraum-Scanner-Array Wiederhergestellt!",
      firstBefore: "Wir haben das seltsame ",
      highlighted: "Nahraum-Scanner-Array",
      firstAfter: " wiederhergestellt, das Miaplacidus im zerstörten Kraftfeld umkreist.",
      secondParagraph:
        "Mit Galaktischen Punkten (GP) können wir es vollständig online bringen und Miaplacidus' lokalen Raum scannen, um die Quelle der KI-Invasion zu lokalisieren!",
      confirmLabel: "BESTÄTIGEN",
    },
    ripLocated: {
      title: "Kosmischer Riss Lokalisiert!",
      firstBefore: "Der vom Wissenschaftler geöffnete ",
      highlighted: "Kosmische Riss",
      firstAfter: ", durch den das böse KI-Volk gereist ist, wurde lokalisiert.",
      secondParagraph: "Wir werden sofort Wissenschaftsteams entsenden, um zu untersuchen!",
      confirmLabel: "BESTÄTIGEN",
    },
  },
  it: {
    scannerRestored: {
      title: "Matrice Scanner Spazio Vicino Ripristinata!",
      firstBefore: "Abbiamo ripristinato la strana ",
      highlighted: "Matrice Scanner Spazio Vicino",
      firstAfter: " che orbita attorno a Miaplacidus all'interno del campo di forza in rovina.",
      secondParagraph:
        "Con i Punti Galattici (PG), possiamo portarla completamente online e scansionare lo spazio locale di Miaplacidus per localizzare la fonte dell'invasione IA!",
      confirmLabel: "CONFERMA",
    },
    ripLocated: {
      title: "Squarcio Cosmico Localizzato!",
      firstBefore: "Lo ",
      highlighted: "Squarcio Cosmico",
      firstAfter:
        " aperto dallo scienziato, attraverso il quale ha viaggiato la malvagia razza IA, è stato localizzato.",
      secondParagraph: "Invieremo immediatamente squadre scientifiche per indagare!",
      confirmLabel: "CONFERMA",
    },
  },
  fr: {
    scannerRestored: {
      title: "Matrice de Scanner de l'Espace Proche Restaurée!",
      firstBefore: "Nous avons restauré l'étrange ",
      highlighted: "Matrice de Scanner de l'Espace Proche",
      firstAfter: " orbitant Miaplacidus à l'intérieur du champ de force en ruines.",
      secondParagraph:
        "Avec des Points Galactiques (PG), nous pouvons la mettre complètement en ligne et scanner l'espace local de Miaplacidus pour localiser la source de l'invasion IA!",
      confirmLabel: "CONFIRMER",
    },
    ripLocated: {
      title: "Déchirure Cosmique Localisée!",
      firstBefore: "La ",
      highlighted: "Déchirure Cosmique",
      firstAfter:
        " ouverte par le scientifique, à travers laquelle la race maléfique d'IA a voyagé, a été localisée.",
      secondParagraph: "Nous enverrons immédiatement des équipes scientifiques pour enquêter!",
      confirmLabel: "CONFIRMER",
    },
  },
};

export function cosmicRipMilestoneResultDialogCopy(
  locale: LocaleId,
  resultId: CosmicRipMilestoneResultDialogId,
): RandomEventDialogCopy {
  const message = messages[locale][resultId];
  return {
    title: message.title,
    summary: "",
    lines: [
      {
        text: "",
        parts: [
          { text: message.firstBefore },
          { text: message.highlighted, tone: "green-ready-text" },
          { text: message.firstAfter },
        ],
      },
      { text: message.secondParagraph },
    ],
    confirmLabel: message.confirmLabel,
    ...(resultId === "ripLocated" ? { openDelayMs: 2000 } : {}),
  };
}

export const LOCALIZATION_VALIDATION_DATA = { messages } as const;
