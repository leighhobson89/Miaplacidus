import type { LocaleId } from "../content/ids";

type WarModeMessageKey =
  | "enterWarModeModalHeader"
  | "enterwarModeModalBackOutText"
  | "enterwarModeModalNoBackOutText"
  | "attackingBlind"
  | "confirmWar"
  | "cancelWar";

const COPY: Readonly<Record<LocaleId, Readonly<Record<WarModeMessageKey, string>>>> = {
  en: {
    enterWarModeModalHeader: "CONQUEST!",
    enterwarModeModalBackOutText:
      "You are disengaging diplomacy.<br><br>This means you can no longer engage in diplomacy,<br>and must undertake the conquest when ready to try and conquer the new System.",
    enterwarModeModalNoBackOutText:
      "You are now going to start the conquest.<br>Without intelligence you need to prepare your fleet thoroughly, good luck!",
    attackingBlind: "Attacking Blind!",
    confirmWar: "CONFIRM",
    cancelWar: "CANCEL",
  },
  es: {
    enterWarModeModalHeader: "¡CONQUISTA!",
    enterwarModeModalBackOutText:
      "Estás desenganchando la diplomacia.<br><br>Esto significa que ya no puedes participar en diplomacia,<br>y debes emprender la conquista cuando estés listo para intentar conquistar el nuevo Sistema.",
    enterwarModeModalNoBackOutText:
      "Ahora vas a comenzar la conquista.<br>Sin inteligencia necesitas preparar tu flota a fondo, ¡buena suerte!",
    attackingBlind: "¡Atacando a ciegas!",
    confirmWar: "CONFIRMAR",
    cancelWar: "CANCELAR",
  },
  pt: {
    enterWarModeModalHeader: "CONQUISTA!",
    enterwarModeModalBackOutText:
      "Estás a abandonar a diplomacia.<br><br>Isto significa que já não podes participar na diplomacia,<br>e terás de iniciar a conquista quando estiveres pronto para tentar conquistar o novo Sistema.",
    enterwarModeModalNoBackOutText:
      "Agora vais começar a conquista.<br>Sem informações, precisas de preparar a tua frota cuidadosamente. Boa sorte!",
    attackingBlind: "A atacar às cegas!",
    confirmWar: "CONFIRMAR",
    cancelWar: "CANCELAR",
  },
  de: {
    enterWarModeModalHeader: "EROBERUNG!",
    enterwarModeModalBackOutText:
      "Du beendest die Diplomatie.<br><br>Das bedeutet, dass du nicht mehr an Diplomatie teilnehmen kannst,<br>und die Eroberung durchführen musst, wenn du bereit bist, das neue System zu erobern.",
    enterwarModeModalNoBackOutText:
      "Du wirst jetzt die Eroberung beginnen.<br>Ohne Aufklärung musst du deine Flotte gründlich vorbereiten, viel Glück!",
    attackingBlind: "Blindangriff!",
    confirmWar: "BESTÄTIGEN",
    cancelWar: "ABBRECHEN",
  },
  it: {
    enterWarModeModalHeader: "CONQUISTA!",
    enterwarModeModalBackOutText:
      "Stai disimpegnando la diplomazia.<br><br>Questo significa che non puoi più impegnarti in diplomazia,<br>e devi intraprendere la conquista quando sei pronto per provare a conquistare il nuovo Sistema.",
    enterwarModeModalNoBackOutText:
      "Ora stai per iniziare la conquista.<br>Senza intelligence devi preparare la tua flotta a fondo, buona fortuna!",
    attackingBlind: "Attacco alla cieca!",
    confirmWar: "CONFERMA",
    cancelWar: "ANNULLA",
  },
  fr: {
    enterWarModeModalHeader: "CONQUÊTE!",
    enterwarModeModalBackOutText:
      "Tu te désengages de la diplomatie.<br><br>Cela signifie que tu ne peux plus participer à la diplomatie,<br>et tu dois entreprendre la conquête quand tu es prêt pour essayer de conquérir le nouveau Système.",
    enterwarModeModalNoBackOutText:
      "Tu vas maintenant commencer la conquête.<br>Sans renseignement, tu dois préparer ta flotte en profondeur, bonne chance!",
    attackingBlind: "Attaque à l'aveugle!",
    confirmWar: "CONFIRMER",
    cancelWar: "ANNULER",
  },
};

export function warModeText(locale: LocaleId, key: WarModeMessageKey): string {
  return COPY[locale][key];
}
