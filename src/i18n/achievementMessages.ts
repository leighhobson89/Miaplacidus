import type { LocaleId } from "../content/ids";

const messages = {
  en: {
    title: "Achievements",
    description: "Milestones and rewards across each civilization.",
    unlocked: "unlocked",
    reward: "Reward",
    permanent: "Permanent",
    thisRun: "This run",
    noReward: "Milestone",
    progress: "progress",
    empty: "No achievements unlocked yet.",
  },
  es: {
    title: "Logros",
    description: "Hitos y recompensas de cada civilización.",
    unlocked: "desbloqueados",
    reward: "Recompensa",
    permanent: "Permanente",
    thisRun: "Esta partida",
    noReward: "Hito",
    progress: "progreso",
    empty: "Aún no hay logros desbloqueados.",
  },
  pt: {
    title: "Conquistas",
    description: "Marcos e recompensas de cada civilização.",
    unlocked: "desbloqueadas",
    reward: "Recompensa",
    permanent: "Permanente",
    thisRun: "Nesta partida",
    noReward: "Marco",
    progress: "progresso",
    empty: "Ainda não há conquistas desbloqueadas.",
  },
  de: {
    title: "Errungenschaften",
    description: "Meilensteine und Belohnungen jeder Zivilisation.",
    unlocked: "freigeschaltet",
    reward: "Belohnung",
    permanent: "Dauerhaft",
    thisRun: "Dieser Durchlauf",
    noReward: "Meilenstein",
    progress: "Fortschritt",
    empty: "Noch keine Errungenschaften freigeschaltet.",
  },
  it: {
    title: "Obiettivi",
    description: "Traguardi e ricompense di ogni civiltà.",
    unlocked: "sbloccati",
    reward: "Ricompensa",
    permanent: "Permanente",
    thisRun: "Questa partita",
    noReward: "Traguardo",
    progress: "progresso",
    empty: "Nessun obiettivo sbloccato.",
  },
  fr: {
    title: "Succès",
    description: "Étapes et récompenses de chaque civilisation.",
    unlocked: "débloqués",
    reward: "Récompense",
    permanent: "Permanent",
    thisRun: "Cette partie",
    noReward: "Étape",
    progress: "progression",
    empty: "Aucun succès débloqué pour le moment.",
  },
} as const satisfies Record<LocaleId, Record<string, string>>;

export type AchievementMessageKey = keyof (typeof messages)["en"];
export function achievementText(locale: LocaleId, key: AchievementMessageKey): string {
  return messages[locale][key];
}

export const LOCALIZATION_VALIDATION_DATA = { messages } as const;
