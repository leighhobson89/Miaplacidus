import type { LocaleId } from "../content/ids";
import type { SaveErrorCode } from "../persistence/schema";

export type SaveMessageKey =
  | "confirm"
  | "start"
  | "edit"
  | "cancel"
  | "choose"
  | "empty"
  | "corrupt"
  | "confirmed"
  | "confirmedName"
  | "manage"
  | "saveNow"
  | "saved"
  | "unsaved"
  | "back"
  | "rename"
  | "newName"
  | "delete"
  | "deletePrompt"
  | "confirmDelete"
  | "exportFirst"
  | "export"
  | "copy"
  | "download"
  | "import"
  | "importText"
  | "preview"
  | "previewName"
  | "previewVersion"
  | "applyImport"
  | "replace"
  | "importNew"
  | "cancelImport"
  | "file"
  | "imported"
  | "conflict"
  | "errEmpty"
  | "errTooLarge"
  | "errFormat"
  | "errCode"
  | "errIntegrity"
  | "errFuture"
  | "errDuplicate"
  | "errCorrupt"
  | "errConflict"
  | "errQuota"
  | "errStorage"
  | "errGeneric"
  | "paste"
  | "autoSave"
  | "saveFrequency"
  | "every10"
  | "every30"
  | "every60"
  | "reload"
  | "saveAsNew"
  | "recover"
  | "recoverConfirm"
  | "capacity"
  | "recovered"
  | "leaveWarning"
  | "stay"
  | "discardRun"
  | "hydrogenBriefingEyebrow"
  | "hydrogenBriefingTitle"
  | "hydrogenBriefingBody"
  | "hydrogenBriefingContinue"
  | "portableSize"
  | "localSaveSize"
  | "remainingCapacity";

const messages: Record<LocaleId, Record<SaveMessageKey, string>> = {
  en: {
    confirm: "Confirm",
    start: "Start",
    edit: "Edit selection",
    cancel: "Cancel",
    choose: "Choose a local pioneer",
    empty: "No local saves yet. Confirm a name, then Start to create the first pioneer.",
    corrupt: "Needs recovery",
    confirmed: "Ready to begin",
    confirmedName: "Confirmed pioneer",
    manage: "Save manager",
    saveNow: "Save now",
    saved: "Saved on this device",
    unsaved: "This run is temporary and has not been saved on this device.",
    back: "Pioneer selection",
    rename: "Rename save",
    newName: "New pioneer name",
    delete: "Delete this save",
    deletePrompt:
      "Deleting removes this pioneer from this device. Export it first if you may need it later.",
    confirmDelete: "Confirm delete",
    exportFirst: "I exported this save or do not need it",
    export: "Portable save code",
    copy: "Copy code",
    download: "Download .txt",
    import: "Import a save",
    importText: "Paste a MIAPLACIDUS save code",
    preview: "Preview import",
    previewName: "Pioneer",
    previewVersion: "Save version",
    applyImport: "Import save",
    replace: "Replace matching save",
    importNew: "Import as a new pioneer",
    cancelImport: "Cancel import",
    file: "Choose .txt save file",
    imported: "Save imported.",
    conflict: "A local save already uses this pioneer name. Choose what to do.",
    errEmpty: "Paste a save code first.",
    errTooLarge: "This save exceeds the supported size.",
    errFormat: "This is not a marked MIAPLACIDUS save code.",
    errCode: "The code is incomplete or uses an unsupported format.",
    errIntegrity: "The save is incomplete or failed its integrity check.",
    errFuture: "This save was made by a newer game version.",
    errDuplicate: "Another local save already uses this name.",
    errCorrupt: "This save is damaged and needs recovery.",
    errConflict: "This save changed in another tab. Reload or export this run before saving.",
    errQuota:
      "Browser storage is full. The previous save remains available; export or remove a save to make room.",
    errStorage: "Browser storage is unavailable. This run is temporary; export it before leaving.",
    errGeneric: "The save could not be completed. Your supplied code is still available to retry.",
    paste: "Paste",
    autoSave: "Automatic saving",
    saveFrequency: "Save interval",
    every10: "10 seconds",
    every30: "30 seconds",
    every60: "60 seconds",
    reload: "Reload saved version",
    saveAsNew: "Save run as a new pioneer",
    recover: "Review recovery",
    recoverConfirm: "Restore this validated generation",
    capacity:
      "A save keeps the previous and next generations until the new head is verified. Export or delete a save intentionally; no slot is removed automatically.",
    recovered: "The saved generation was restored. Review the pioneer before starting it.",
    leaveWarning: "This run has not been saved. Export it before leaving or discard it now.",
    stay: "Keep playing",
    discardRun: "Discard temporary run",
    hydrogenBriefingEyebrow: "First voyage",
    hydrogenBriefingTitle: "Hydrogen briefing",
    hydrogenBriefingBody:
      "Collect H₂ by hand, sell it for cash, then use Hydrogen to expand storage or build a compressor. This pioneer is saved locally on this device.",
    hydrogenBriefingContinue: "Begin exploring",
    portableSize: "Portable code size",
    localSaveSize: "Compressed local save",
    remainingCapacity: "Estimated space left after this save:",
  },
  es: {
    confirm: "Confirmar",
    start: "Comenzar",
    edit: "Editar selección",
    cancel: "Cancelar",
    choose: "Elige un pionero local",
    empty:
      "Aún no hay partidas locales. Confirma un nombre y pulsa Comenzar para crear el primer pionero.",
    corrupt: "Necesita recuperación",
    confirmed: "Listo para comenzar",
    confirmedName: "Pionero confirmado",
    manage: "Partidas guardadas",
    saveNow: "Guardar ahora",
    saved: "Guardado en este dispositivo",
    unsaved: "Esta partida es temporal y no se ha guardado en este dispositivo.",
    back: "Elegir pionero",
    rename: "Cambiar nombre",
    newName: "Nombre del nuevo pionero",
    delete: "Eliminar esta partida",
    deletePrompt:
      "Al eliminarla, esta partida desaparecerá del dispositivo. Expórtala si podrías necesitarla.",
    confirmDelete: "Confirmar eliminación",
    exportFirst: "He exportado esta partida o no la necesito",
    export: "Código de partida",
    copy: "Copiar código",
    download: "Descargar .txt",
    import: "Importar partida",
    importText: "Pega un código de MIAPLACIDUS",
    preview: "Vista previa",
    previewName: "Pionero",
    previewVersion: "Versión de partida",
    applyImport: "Importar partida",
    replace: "Reemplazar partida coincidente",
    importNew: "Importar como pionero nuevo",
    cancelImport: "Cancelar importación",
    file: "Elegir archivo .txt",
    imported: "Partida importada.",
    conflict: "Ya existe una partida local con este nombre. Elige qué hacer.",
    errEmpty: "Pega primero un código.",
    errTooLarge: "La partida supera el tamaño permitido.",
    errFormat: "El código no está marcado como una partida de MIAPLACIDUS.",
    errCode: "El código está incompleto o usa un formato no compatible.",
    errIntegrity: "La partida está incompleta o no supera la comprobación de integridad.",
    errFuture: "La partida se creó con una versión más reciente.",
    errDuplicate: "Ya existe otra partida local con este nombre.",
    errCorrupt: "La partida está dañada y necesita recuperación.",
    errConflict:
      "La partida cambió en otra pestaña. Recárgala o exporta esta sesión antes de guardar.",
    errQuota:
      "El almacenamiento está lleno. La partida anterior sigue disponible; exporta o elimina una partida.",
    errStorage:
      "El almacenamiento no está disponible. Esta sesión es temporal; expórtala antes de salir.",
    errGeneric:
      "No se pudo completar la operación. El código sigue disponible para volver a intentarlo.",
    paste: "Pegar",
    autoSave: "Guardado automático",
    saveFrequency: "Intervalo de guardado",
    every10: "10 segundos",
    every30: "30 segundos",
    every60: "60 segundos",
    reload: "Cargar versión guardada",
    saveAsNew: "Guardar como pionero nuevo",
    recover: "Revisar recuperación",
    recoverConfirm: "Restaurar esta generación validada",
    capacity:
      "Cada guardado conserva la generación anterior hasta verificar la nueva. Exporta o elimina partidas de forma intencionada; ninguna se borra automáticamente.",
    recovered: "Se restauró la generación guardada. Revisa el pionero antes de iniciarlo.",
    leaveWarning: "Esta partida no se ha guardado. Expórtala antes de salir o descártala ahora.",
    stay: "Seguir jugando",
    discardRun: "Descartar partida temporal",
    hydrogenBriefingEyebrow: "Primer viaje",
    hydrogenBriefingTitle: "Guía del hidrógeno",
    hydrogenBriefingBody:
      "Recolecta H₂ a mano, véndelo para obtener dinero y usa el hidrógeno para ampliar el almacenamiento o construir un compresor. Este pionero se guarda localmente en este dispositivo.",
    hydrogenBriefingContinue: "Empezar a explorar",
    portableSize: "Tamaño del código portátil",
    localSaveSize: "Tamaño comprimido local",
    remainingCapacity: "Espacio estimado restante tras este guardado:",
  },
  pt: {
    confirm: "Confirmar",
    start: "Começar",
    edit: "Editar seleção",
    cancel: "Cancelar",
    choose: "Escolha um pioneiro local",
    empty:
      "Ainda não há salvamentos locais. Confirme um nome e comece para criar o primeiro pioneiro.",
    corrupt: "Precisa de recuperação",
    confirmed: "Pronto para começar",
    confirmedName: "Pioneiro confirmado",
    manage: "Gerenciar salvamentos",
    saveNow: "Salvar agora",
    saved: "Salvo neste dispositivo",
    unsaved: "Esta sessão é temporária e não foi salva neste dispositivo.",
    back: "Escolher pioneiro",
    rename: "Renomear salvamento",
    newName: "Nome do novo pioneiro",
    delete: "Excluir este salvamento",
    deletePrompt:
      "Excluir remove este pioneiro do dispositivo. Exporte antes se precisar dele depois.",
    confirmDelete: "Confirmar exclusão",
    exportFirst: "Já exportei este salvamento ou não preciso dele",
    export: "Código portátil",
    copy: "Copiar código",
    download: "Baixar .txt",
    import: "Importar salvamento",
    importText: "Cole um código MIAPLACIDUS",
    preview: "Pré-visualizar",
    previewName: "Pioneiro",
    previewVersion: "Versão do salvamento",
    applyImport: "Importar salvamento",
    replace: "Substituir salvamento correspondente",
    importNew: "Importar como novo pioneiro",
    cancelImport: "Cancelar importação",
    file: "Escolher arquivo .txt",
    imported: "Salvamento importado.",
    conflict: "Já existe um salvamento local com este nome. Escolha uma ação.",
    errEmpty: "Cole um código primeiro.",
    errTooLarge: "O salvamento excede o tamanho permitido.",
    errFormat: "Este código não está marcado como salvamento MIAPLACIDUS.",
    errCode: "O código está incompleto ou usa formato incompatível.",
    errIntegrity: "O salvamento está incompleto ou falhou na verificação de integridade.",
    errFuture: "Este salvamento foi criado em uma versão mais recente.",
    errDuplicate: "Outro salvamento local já usa este nome.",
    errCorrupt: "Este salvamento está danificado e precisa de recuperação.",
    errConflict:
      "O salvamento mudou em outra aba. Recarregue ou exporte esta sessão antes de salvar.",
    errQuota:
      "O armazenamento está cheio. O salvamento anterior continua disponível; exporte ou remova um salvamento.",
    errStorage:
      "O armazenamento não está disponível. Esta sessão é temporária; exporte antes de sair.",
    errGeneric: "Não foi possível concluir. O código continua disponível para tentar novamente.",
    paste: "Colar",
    autoSave: "Salvamento automático",
    saveFrequency: "Intervalo de salvamento",
    every10: "10 segundos",
    every30: "30 segundos",
    every60: "60 segundos",
    reload: "Recarregar versão salva",
    saveAsNew: "Salvar como novo pioneiro",
    recover: "Revisar recuperação",
    recoverConfirm: "Restaurar esta geração validada",
    capacity:
      "Cada salvamento mantém a geração anterior até verificar a nova. Exporte ou exclua salvamentos manualmente; nenhum slot é removido automaticamente.",
    recovered: "A geração salva foi restaurada. Revise o pioneiro antes de começar.",
    leaveWarning: "Esta sessão não foi salva. Exporte antes de sair ou descarte agora.",
    stay: "Continuar jogando",
    discardRun: "Descartar sessão temporária",
    hydrogenBriefingEyebrow: "Primeira viagem",
    hydrogenBriefingTitle: "Guia do hidrogênio",
    hydrogenBriefingBody:
      "Colete H₂ manualmente, venda para ganhar dinheiro e use o hidrogênio para ampliar o armazenamento ou construir um compressor. Este pioneiro fica salvo localmente neste dispositivo.",
    hydrogenBriefingContinue: "Começar a explorar",
    portableSize: "Tamanho do código portátil",
    localSaveSize: "Tamanho comprimido local",
    remainingCapacity: "Espaço estimado restante após este salvamento:",
  },
  de: {
    confirm: "Bestätigen",
    start: "Starten",
    edit: "Auswahl bearbeiten",
    cancel: "Abbrechen",
    choose: "Lokalen Pionier auswählen",
    empty:
      "Noch keine lokalen Spielstände. Bestätige einen Namen und starte, um den ersten Pionier anzulegen.",
    corrupt: "Wiederherstellung nötig",
    confirmed: "Bereit zum Start",
    confirmedName: "Bestätigter Pionier",
    manage: "Spielstände",
    saveNow: "Jetzt speichern",
    saved: "Auf diesem Gerät gespeichert",
    unsaved: "Dieser Lauf ist temporär und wurde auf diesem Gerät nicht gespeichert.",
    back: "Pionier auswählen",
    rename: "Spielstand umbenennen",
    newName: "Name des neuen Pioniers",
    delete: "Spielstand löschen",
    deletePrompt:
      "Beim Löschen wird dieser Pionier vom Gerät entfernt. Exportiere ihn vorher, falls du ihn später brauchst.",
    confirmDelete: "Löschen bestätigen",
    exportFirst: "Ich habe diesen Spielstand exportiert oder brauche ihn nicht",
    export: "Mobiler Spielstandcode",
    copy: "Code kopieren",
    download: ".txt herunterladen",
    import: "Spielstand importieren",
    importText: "MIAPLACIDUS-Code einfügen",
    preview: "Importvorschau",
    previewName: "Pionier",
    previewVersion: "Spielstandversion",
    applyImport: "Spielstand importieren",
    replace: "Passenden Spielstand ersetzen",
    importNew: "Als neuen Pionier importieren",
    cancelImport: "Import abbrechen",
    file: ".txt-Spielstand auswählen",
    imported: "Spielstand importiert.",
    conflict: "Ein lokaler Spielstand verwendet diesen Namen bereits. Wähle eine Aktion.",
    errEmpty: "Füge zuerst einen Spielstandcode ein.",
    errTooLarge: "Der Spielstand überschreitet die zulässige Größe.",
    errFormat: "Dieser Code ist nicht als MIAPLACIDUS-Spielstand gekennzeichnet.",
    errCode: "Der Code ist unvollständig oder verwendet ein unbekanntes Format.",
    errIntegrity:
      "Der Spielstand ist unvollständig oder die Integritätsprüfung ist fehlgeschlagen.",
    errFuture: "Dieser Spielstand stammt aus einer neueren Spielversion.",
    errDuplicate: "Ein anderer lokaler Spielstand verwendet diesen Namen bereits.",
    errCorrupt: "Dieser Spielstand ist beschädigt und muss wiederhergestellt werden.",
    errConflict:
      "Der Spielstand wurde in einem anderen Tab geändert. Lade neu oder exportiere diesen Lauf vor dem Speichern.",
    errQuota:
      "Der Browserspeicher ist voll. Der vorherige Spielstand ist noch verfügbar; exportiere oder lösche einen Spielstand.",
    errStorage:
      "Browserspeicher ist nicht verfügbar. Dieser Lauf ist temporär; exportiere ihn vor dem Verlassen.",
    errGeneric:
      "Der Vorgang ist fehlgeschlagen. Der eingefügte Code bleibt für einen neuen Versuch erhalten.",
    paste: "Einfügen",
    autoSave: "Automatisches Speichern",
    saveFrequency: "Speicherintervall",
    every10: "10 Sekunden",
    every30: "30 Sekunden",
    every60: "60 Sekunden",
    reload: "Gespeicherte Version laden",
    saveAsNew: "Lauf als neuen Pionier speichern",
    recover: "Wiederherstellung prüfen",
    recoverConfirm: "Diese geprüfte Generation wiederherstellen",
    capacity:
      "Beim Speichern bleibt die vorherige Generation bestehen, bis die neue geprüft ist. Exportiere oder lösche Spielstände bewusst; kein Slot wird automatisch entfernt.",
    recovered:
      "Die gespeicherte Generation wurde wiederhergestellt. Prüfe den Pionier vor dem Start.",
    leaveWarning:
      "Dieser Lauf wurde nicht gespeichert. Exportiere ihn vor dem Verlassen oder verwerfe ihn jetzt.",
    stay: "Weiter spielen",
    discardRun: "Temporären Lauf verwerfen",
    hydrogenBriefingEyebrow: "Erste Reise",
    hydrogenBriefingTitle: "Wasserstoff-Einführung",
    hydrogenBriefingBody:
      "Sammle H₂ von Hand, verkaufe es für Geld und erweitere mit Wasserstoff den Speicher oder baue einen Kompressor. Dieser Pionier wird lokal auf diesem Gerät gespeichert.",
    hydrogenBriefingContinue: "Erkundung beginnen",
    portableSize: "Größe des portablen Codes",
    localSaveSize: "Komprimierter lokaler Spielstand",
    remainingCapacity: "Geschätzter freier Speicher nach diesem Spielstand:",
  },
  it: {
    confirm: "Conferma",
    start: "Inizia",
    edit: "Modifica selezione",
    cancel: "Annulla",
    choose: "Scegli un pioniere locale",
    empty:
      "Non ci sono ancora salvataggi locali. Conferma un nome e inizia per creare il primo pioniere.",
    corrupt: "Richiede recupero",
    confirmed: "Pronto per iniziare",
    confirmedName: "Pioniere confermato",
    manage: "Gestione salvataggi",
    saveNow: "Salva ora",
    saved: "Salvato su questo dispositivo",
    unsaved: "Questa sessione è temporanea e non è stata salvata sul dispositivo.",
    back: "Scelta pioniere",
    rename: "Rinomina salvataggio",
    newName: "Nome del nuovo pioniere",
    delete: "Elimina salvataggio",
    deletePrompt:
      "L'eliminazione rimuove il pioniere dal dispositivo. Esportalo prima se potrebbe servirti.",
    confirmDelete: "Conferma eliminazione",
    exportFirst: "Ho esportato questo salvataggio o non mi serve",
    export: "Codice portatile",
    copy: "Copia codice",
    download: "Scarica .txt",
    import: "Importa salvataggio",
    importText: "Incolla un codice MIAPLACIDUS",
    preview: "Anteprima importazione",
    previewName: "Pioniere",
    previewVersion: "Versione salvataggio",
    applyImport: "Importa salvataggio",
    replace: "Sostituisci salvataggio corrispondente",
    importNew: "Importa come nuovo pioniere",
    cancelImport: "Annulla importazione",
    file: "Scegli file .txt",
    imported: "Salvataggio importato.",
    conflict: "Esiste già un salvataggio locale con questo nome. Scegli un'azione.",
    errEmpty: "Incolla prima un codice.",
    errTooLarge: "Il salvataggio supera le dimensioni supportate.",
    errFormat: "Questo codice non è contrassegnato come salvataggio MIAPLACIDUS.",
    errCode: "Il codice è incompleto o usa un formato non supportato.",
    errIntegrity: "Il salvataggio è incompleto o non supera il controllo d'integrità.",
    errFuture: "Il salvataggio proviene da una versione più recente.",
    errDuplicate: "Un altro salvataggio locale usa già questo nome.",
    errCorrupt: "Questo salvataggio è danneggiato e richiede recupero.",
    errConflict:
      "Il salvataggio è cambiato in un'altra scheda. Ricarica o esporta questa sessione prima di salvare.",
    errQuota:
      "Lo spazio del browser è pieno. Il salvataggio precedente è disponibile; esporta o rimuovine uno.",
    errStorage:
      "Lo spazio del browser non è disponibile. Questa sessione è temporanea; esportala prima di uscire.",
    errGeneric: "Operazione non riuscita. Il codice fornito è ancora disponibile per riprovare.",
    paste: "Incolla",
    autoSave: "Salvataggio automatico",
    saveFrequency: "Intervallo di salvataggio",
    every10: "10 secondi",
    every30: "30 secondi",
    every60: "60 secondi",
    reload: "Carica la versione salvata",
    saveAsNew: "Salva la partita come nuovo pioniere",
    recover: "Verifica il recupero",
    recoverConfirm: "Ripristina questa generazione verificata",
    capacity:
      "Ogni salvataggio conserva la generazione precedente finché la nuova non è verificata. Esporta o elimina i salvataggi manualmente; nessuno slot viene rimosso automaticamente.",
    recovered:
      "La generazione salvata è stata ripristinata. Controlla il pioniere prima di avviarla.",
    leaveWarning: "Questa partita non è stata salvata. Esportala prima di uscire o scartala ora.",
    stay: "Continua a giocare",
    discardRun: "Scarta la partita temporanea",
    hydrogenBriefingEyebrow: "Primo viaggio",
    hydrogenBriefingTitle: "Guida all'idrogeno",
    hydrogenBriefingBody:
      "Raccogli H₂ a mano, vendilo per ottenere denaro e usa l'idrogeno per ampliare lo stoccaggio o costruire un compressore. Questo pioniere viene salvato localmente su questo dispositivo.",
    hydrogenBriefingContinue: "Inizia a esplorare",
    portableSize: "Dimensione del codice portatile",
    localSaveSize: "Dimensione del salvataggio locale compresso",
    remainingCapacity: "Spazio stimato disponibile dopo questo salvataggio:",
  },
  fr: {
    confirm: "Confirmer",
    start: "Commencer",
    edit: "Modifier la sélection",
    cancel: "Annuler",
    choose: "Choisir un pionnier local",
    empty:
      "Aucune sauvegarde locale. Confirmez un nom puis commencez pour créer le premier pionnier.",
    corrupt: "Récupération nécessaire",
    confirmed: "Prêt à commencer",
    confirmedName: "Pionnier confirmé",
    manage: "Gestion des sauvegardes",
    saveNow: "Enregistrer",
    saved: "Enregistré sur cet appareil",
    unsaved: "Cette partie est temporaire et n'a pas été enregistrée sur cet appareil.",
    back: "Choisir un pionnier",
    rename: "Renommer la sauvegarde",
    newName: "Nom du nouveau pionnier",
    delete: "Supprimer cette sauvegarde",
    deletePrompt:
      "La suppression retire ce pionnier de l'appareil. Exportez-le avant si vous pouvez en avoir besoin.",
    confirmDelete: "Confirmer la suppression",
    exportFirst: "J'ai exporté cette sauvegarde ou je n'en ai pas besoin",
    export: "Code de sauvegarde",
    copy: "Copier le code",
    download: "Télécharger .txt",
    import: "Importer une sauvegarde",
    importText: "Collez un code MIAPLACIDUS",
    preview: "Aperçu de l'importation",
    previewName: "Pionnier",
    previewVersion: "Version de sauvegarde",
    applyImport: "Importer la sauvegarde",
    replace: "Remplacer la sauvegarde correspondante",
    importNew: "Importer comme nouveau pionnier",
    cancelImport: "Annuler l'importation",
    file: "Choisir un fichier .txt",
    imported: "Sauvegarde importée.",
    conflict: "Une sauvegarde locale utilise déjà ce nom. Choisissez une action.",
    errEmpty: "Collez d'abord un code.",
    errTooLarge: "Cette sauvegarde dépasse la taille autorisée.",
    errFormat: "Ce code n'est pas identifié comme une sauvegarde MIAPLACIDUS.",
    errCode: "Le code est incomplet ou utilise un format non pris en charge.",
    errIntegrity: "La sauvegarde est incomplète ou la vérification d'intégrité a échoué.",
    errFuture: "Cette sauvegarde provient d'une version plus récente.",
    errDuplicate: "Une autre sauvegarde locale utilise déjà ce nom.",
    errCorrupt: "Cette sauvegarde est endommagée et doit être récupérée.",
    errConflict:
      "La sauvegarde a changé dans un autre onglet. Rechargez ou exportez cette partie avant d'enregistrer.",
    errQuota:
      "Le stockage du navigateur est plein. La sauvegarde précédente est disponible ; exportez-en ou supprimez-en une.",
    errStorage:
      "Le stockage du navigateur est indisponible. Cette partie est temporaire ; exportez-la avant de quitter.",
    errGeneric: "L'opération a échoué. Le code fourni reste disponible pour réessayer.",
    paste: "Coller",
    autoSave: "Enregistrement automatique",
    saveFrequency: "Fréquence d'enregistrement",
    every10: "10 secondes",
    every30: "30 secondes",
    every60: "60 secondes",
    reload: "Recharger la version enregistrée",
    saveAsNew: "Enregistrer comme nouveau pionnier",
    recover: "Examiner la récupération",
    recoverConfirm: "Restaurer cette génération validée",
    capacity:
      "Chaque sauvegarde conserve la génération précédente jusqu'à la validation de la nouvelle. Exportez ou supprimez les sauvegardes volontairement ; aucun slot n'est supprimé automatiquement.",
    recovered:
      "La génération enregistrée a été restaurée. Vérifiez le pionnier avant de le lancer.",
    leaveWarning:
      "Cette partie n'a pas été enregistrée. Exportez-la avant de partir ou abandonnez-la maintenant.",
    stay: "Continuer à jouer",
    discardRun: "Abandonner la partie temporaire",
    hydrogenBriefingEyebrow: "Premier voyage",
    hydrogenBriefingTitle: "Guide de l'hydrogène",
    hydrogenBriefingBody:
      "Collectez H₂ à la main, vendez-le pour gagner de l'argent, puis utilisez l'hydrogène pour agrandir le stockage ou construire un compresseur. Ce pionnier est enregistré localement sur cet appareil.",
    hydrogenBriefingContinue: "Commencer l'exploration",
    portableSize: "Taille du code portable",
    localSaveSize: "Taille de la sauvegarde locale compressée",
    remainingCapacity: "Espace estimé restant après cette sauvegarde :",
  },
};

export function saveText(locale: LocaleId, key: SaveMessageKey): string {
  return messages[locale][key];
}

export function saveErrorText(locale: LocaleId, code: SaveErrorCode | string): string {
  const key: SaveMessageKey =
    (
      {
        empty: "errEmpty",
        "too-large": "errTooLarge",
        "unknown-format": "errFormat",
        "invalid-code": "errCode",
        "invalid-json": "errCode",
        checksum: "errIntegrity",
        "invalid-envelope": "errIntegrity",
        "future-version": "errFuture",
        "duplicate-name": "errDuplicate",
        "corrupt-slot": "errCorrupt",
        conflict: "errConflict",
        quota: "errQuota",
        "storage-unavailable": "errStorage",
        "not-found": "errGeneric",
      } as Record<string, SaveMessageKey>
    )[code] ?? "errGeneric";
  return saveText(locale, key);
}
