import type { LocaleId } from "../content/ids";

export interface MiaplacidusStoryMessages {
  readonly title: string;
  readonly pages: readonly [string, string, string, string];
  readonly continue: string;
  readonly page: string;
}

const STORY: Record<LocaleId, MiaplacidusStoryMessages> = {
  en: {
    title: "Miaplacidus Reclaimed",
    pages: [
      "The Wardens' defeat breaks their hold over Miaplacidus. The sealed sky opens, and your people can return to the world they carried in memory.",
      "Your civilization has reclaimed its home. A journey that began in exile reaches its promised shore.",
      "New readings trace the Wardens' arrival to a rupture beyond the system. Their invasion points to a larger threat.",
      "Scouts call the anomaly the Cosmic Rip. Find it, restore the Near Space Scanner Array, and stabilize the rupture to secure the galaxy.",
    ],
    continue: "Continue",
    page: "Chapter {current} of {total}",
  },
  es: {
    title: "Miaplacidus recuperado",
    pages: [
      "La derrota de los Guardianes termina su dominio sobre Miaplacidus. El cielo sellado se abre y tu pueblo puede regresar al mundo que conservó en su memoria.",
      "Tu civilización ha recuperado su hogar. El viaje que comenzó en el exilio alcanza la costa prometida.",
      "Nuevas lecturas sitúan la llegada de los Guardianes en una ruptura más allá del sistema. Su invasión apunta a una amenaza mayor.",
      "Los exploradores llaman a la anomalía el Desgarro Cósmico. Encuéntralo, restaura el conjunto de escáneres del espacio cercano y estabiliza la ruptura para proteger la galaxia.",
    ],
    continue: "Continuar",
    page: "Capítulo {current} de {total}",
  },
  pt: {
    title: "Miaplacidus recuperado",
    pages: [
      "A derrota dos Guardiões encerra o domínio deles sobre Miaplacidus. O céu selado se abre, e seu povo pode voltar ao mundo que guardou na memória.",
      "Sua civilização recuperou seu lar. A jornada iniciada no exílio alcança a costa prometida.",
      "Novas leituras apontam a chegada dos Guardiões para uma ruptura além do sistema. A invasão revela uma ameaça maior.",
      "Os exploradores chamam a anomalia de Rasgo Cósmico. Encontre-o, restaure o conjunto de sensores do espaço próximo e estabilize a ruptura para proteger a galáxia.",
    ],
    continue: "Continuar",
    page: "Capítulo {current} de {total}",
  },
  de: {
    title: "Miaplacidus zurückerobert",
    pages: [
      "Mit der Niederlage der Wächter endet ihre Herrschaft über Miaplacidus. Der versiegelte Himmel öffnet sich, und dein Volk kann in die Welt zurückkehren, die es in Erinnerung bewahrt hat.",
      "Deine Zivilisation hat ihre Heimat zurückgewonnen. Die Reise aus dem Exil erreicht ihr versprochenes Ziel.",
      "Neue Messungen führen die Ankunft der Wächter auf einen Riss jenseits des Systems zurück. Ihre Invasion weist auf eine größere Gefahr hin.",
      "Die Kundschafter nennen die Anomalie den Kosmischen Riss. Finde ihn, stelle das Nahraum-Scannerfeld wieder her und stabilisiere den Riss, um die Galaxie zu schützen.",
    ],
    continue: "Weiter",
    page: "Kapitel {current} von {total}",
  },
  it: {
    title: "Miaplacidus riconquistato",
    pages: [
      "La sconfitta dei Guardiani pone fine al loro dominio su Miaplacidus. Il cielo sigillato si apre e il tuo popolo può tornare al mondo custodito nei suoi ricordi.",
      "La tua civiltà ha riconquistato la propria casa. Il viaggio iniziato in esilio raggiunge la riva promessa.",
      "Nuove letture riconducono l'arrivo dei Guardiani a una frattura oltre il sistema. La loro invasione segnala una minaccia più grande.",
      "Gli esploratori chiamano l'anomalia Squarcio Cosmico. Trovalo, ripristina la rete di scanner dello spazio vicino e stabilizza la frattura per proteggere la galassia.",
    ],
    continue: "Continua",
    page: "Capitolo {current} di {total}",
  },
  fr: {
    title: "Miaplacidus reconquise",
    pages: [
      "La défaite des Gardiens met fin à leur emprise sur Miaplacidus. Le ciel scellé s'ouvre, et ton peuple peut retrouver le monde qu'il a gardé en mémoire.",
      "Ta civilisation a repris son foyer. Le voyage commencé dans l'exil atteint enfin sa terre promise.",
      "De nouvelles mesures situent l'arrivée des Gardiens dans une brèche au-delà du système. Leur invasion révèle une menace plus vaste.",
      "Les éclaireurs nomment l'anomalie la Déchirure Cosmique. Trouve-la, rétablis le réseau de scanners de l'espace proche et stabilise la brèche pour protéger la galaxie.",
    ],
    continue: "Continuer",
    page: "Chapitre {current} sur {total}",
  },
};

export function miaplacidusStoryText(locale: LocaleId): MiaplacidusStoryMessages {
  return STORY[locale];
}
