import type { LocaleId, SystemId } from "../content/ids";
import {
  O_TYPE_POWER_PLANT_MULTIPLIER,
  type OTypePowerPlantId,
} from "../content/starTypeRules";
import { createStarCatalogue } from "../content/starCatalogue";
import type { RandomEventDialogCopy } from "./randomEventDialogTypes";
import { spaceNotificationText } from "./spaceNotificationMessages";
import { starshipText } from "./starshipMessages";

interface SpaceProgressionDialogMessages {
  readonly galacticTabUnlockHeader: string;
  readonly galacticTabUnlockText: string;
  readonly oTypeStarTechAcquiredHeader: string;
  readonly oTypeStarTechAcquiredText: string;
  readonly confirmLabel: string;
}

const MESSAGES: Readonly<Record<LocaleId, SpaceProgressionDialogMessages>> = {
  en: {
    galacticTabUnlockHeader: "Star System reached!",
    galacticTabUnlockText:
      "As you approach the new System, your scanners detect a faint communication signal...\n\n'You have shown great innovation, you may now access our Galactic Trading Platform'\n\nGalactic Tab Unlocked!",
    oTypeStarTechAcquiredHeader: "O-TYPE STAR TECHNOLOGY ACQUIRED",
    oTypeStarTechAcquiredText:
      "The conquered enemies of {star} had a special technology that we have obtained!\n\nIt has caused {plant} to become {strengthBoost}x more powerful!",
    confirmLabel: "CONFIRM",
  },
  es: {
    galacticTabUnlockHeader: "¡Sistema Estelar alcanzado!",
    galacticTabUnlockText:
      "Mientras te acercas al nuevo Sistema, tus escáneres detectan una débil señal de comunicación...\n\n'Has mostrado gran innovación, ahora puedes acceder a nuestra Plataforma de Comercio Galáctico'\n\n¡Pestaña Galáctica Desbloqueada!",
    oTypeStarTechAcquiredHeader: "TECNOLOGÍA DE ESTRELLA TIPO O ADQUIRIDA",
    oTypeStarTechAcquiredText:
      "¡Los enemigos conquistados de {star} tenían una tecnología especial que hemos obtenido!\n\n¡Ha hecho que {plant} se vuelva {strengthBoost}x más poderoso!",
    confirmLabel: "CONFIRMAR",
  },
  pt: {
    galacticTabUnlockHeader: "Sistema Estelar alcançado!",
    galacticTabUnlockText:
      "À medida que te aproximas do novo Sistema, os teus scanners detetam um fraco sinal de comunicação...\n\n'Demonstraste grande inovação, agora podes aceder à nossa Plataforma de Comércio Galáctico'\n\nSeparador Galáctico Desbloqueado!",
    oTypeStarTechAcquiredHeader: "TECNOLOGIA DE ESTRELA DE TIPO O ADQUIRIDA",
    oTypeStarTechAcquiredText:
      "Os inimigos conquistados de {star} tinham uma tecnologia especial que obtivemos!\n\nIsso tornou {plant} {strengthBoost}x mais poderoso!",
    confirmLabel: "CONFIRMAR",
  },
  de: {
    galacticTabUnlockHeader: "Sternensystem erreicht!",
    galacticTabUnlockText:
      "Als du dich dem neuen System näherst, erfassen deine Scanner ein schwaches Kommunikationssignal...\n\n'Du hast große Innovation gezeigt, du darfst jetzt auf unsere Galaktische Handelsplattform zugreifen'\n\nGalaktischer Tab freigeschaltet!",
    oTypeStarTechAcquiredHeader: "TYP-O-STERN-TECHNOLOGIE ERWORBEN",
    oTypeStarTechAcquiredText:
      "Die besiegten Feinde von {star} hatten eine spezielle Technologie, die wir erhalten haben!\n\nEs hat {plant} um das {strengthBoost}x mächtiger gemacht!",
    confirmLabel: "BESTÄTIGEN",
  },
  it: {
    galacticTabUnlockHeader: "Sistema Stellare raggiunto!",
    galacticTabUnlockText:
      "Mentre ti avvicini al nuovo Sistema, i tuoi scanner rilevano un debole segnale di comunicazione...\n\n'Hai mostrato grande innovazione, ora puoi accedere alla nostra Piattaforma di Commercio Galattico'\n\nScheda Galattica Sbloccata!",
    oTypeStarTechAcquiredHeader: "TECNOLOGIA STELLA TIPO O ACQUISITA",
    oTypeStarTechAcquiredText:
      "I nemici conquistati di {star} avevano una tecnologia speciale che abbiamo ottenuto!\n\nHa reso {plant} {strengthBoost}x più potente!",
    confirmLabel: "CONFERMA",
  },
  fr: {
    galacticTabUnlockHeader: "Système Stellaire atteint!",
    galacticTabUnlockText:
      "En approchant du nouveau Système, tes scanners détectent un faible signal de communication...\n\n'Tu as montré une grande innovation, tu peux maintenant accéder à notre Plateforme de Commerce Galactique'\n\nOnglet Galactique Débloqué!",
    oTypeStarTechAcquiredHeader: "TECHNOLOGIE ÉTOILE TYPE O ACQUISE",
    oTypeStarTechAcquiredText:
      "Les ennemis conquis de {star} avaient une technologie spéciale que nous avons obtenue!\n\nCela a rendu {plant} {strengthBoost}x plus puissant!",
    confirmLabel: "CONFIRMER",
  },
};

function resultDialog(
  locale: LocaleId,
  title: string,
  text: string,
  highlightFinalLine = false,
): RandomEventDialogCopy {
  const [summary = "", ...paragraphs] = text.split("\n\n");
  return {
    title,
    summary,
    lines: paragraphs.map((paragraph, index) => ({
      text: paragraph,
      ...(highlightFinalLine && index === paragraphs.length - 1
        ? { tone: "green-ready-text" as const }
        : {}),
    })),
    confirmLabel: MESSAGES[locale].confirmLabel,
  };
}

export function galacticTabUnlockDialog(locale: LocaleId): RandomEventDialogCopy {
  const copy = MESSAGES[locale];
  return resultDialog(locale, copy.galacticTabUnlockHeader, copy.galacticTabUnlockText, true);
}

export function oTypeStarReachedDialog(
  locale: LocaleId,
  star: string,
): RandomEventDialogCopy {
  return resultDialog(
    locale,
    spaceNotificationText(locale, "oTypeStarReachedHeader"),
    spaceNotificationText(locale, "oTypeStarReachedText", { star }),
  );
}

const PLANT_MESSAGE_KEYS: Readonly<
  Record<OTypePowerPlantId, "plantPowerPlant1" | "plantPowerPlant2" | "plantPowerPlant3">
> = {
  powerPlant1: "plantPowerPlant1",
  powerPlant2: "plantPowerPlant2",
  powerPlant3: "plantPowerPlant3",
};

export function oTypeStarTechAcquiredDialog(
  locale: LocaleId,
  values: { readonly systemId: SystemId; readonly plantId: OTypePowerPlantId },
): RandomEventDialogCopy {
  const copy = MESSAGES[locale];
  const star =
    createStarCatalogue().find((entry) => entry.id === values.systemId)?.name ?? values.systemId;
  const text = Object.entries({
    star,
    plant: starshipText(locale, PLANT_MESSAGE_KEYS[values.plantId]),
    strengthBoost: O_TYPE_POWER_PLANT_MULTIPLIER,
  }).reduce(
    (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
    copy.oTypeStarTechAcquiredText,
  );
  return resultDialog(locale, copy.oTypeStarTechAcquiredHeader, text, true);
}

export const LOCALIZATION_VALIDATION_DATA = { MESSAGES, PLANT_MESSAGE_KEYS } as const;
