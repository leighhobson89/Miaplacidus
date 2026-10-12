import type { LocaleId } from "../content/ids";
import type { SaveErrorCode } from "../persistence/schema";

export type SaveMessageKey =
  | "confirm"
  | "start"
  | "startNewGame"
  | "resumeGame"
  | "starting"
  | "edit"
  | "cancel"
  | "choose"
  | "otherPioneers"
  | "selectSavedPioneerHint"
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
  | "clipboardCopied"
  | "clipboardCopyError"
  | "clipboardReadError"
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
  | "importedAsNew"
  | "loaded"
  | "offlineGainsAdded"
  | "conflict"
  | "readOnlyLock"
  | "errEmpty"
  | "errTooLarge"
  | "errFormat"
  | "errCode"
  | "errIntegrity"
  | "errFuture"
  | "errDuplicate"
  | "errName"
  | "errCorrupt"
  | "errConflict"
  | "errQuota"
  | "errStorage"
  | "errImport"
  | "errNotFound"
  | "errGeneric"
  | "paste"
  | "autoSave"
  | "autoSaveDisabledWarning"
  | "saveFrequency"
  | "every5Minutes"
  | "every15Minutes"
  | "every30Minutes"
  | "everyHour"
  | "reload"
  | "saveAsNew"
  | "recover"
  | "recoverConfirm"
  | "saveDeleted"
  | "capacity"
  | "recovered"
  | "leaveWarning"
  | "stay"
  | "discardRun"
  | "portableSize"
  | "localSaveSize"
  | "remainingCapacity"
  | "appData";

const messages: Record<LocaleId, Record<SaveMessageKey, string>> = {
  en: {
    startNewGame: "START NEW GAME",
    resumeGame: "RESUME GAME",
    starting: "Starting…",
    confirm: "Confirm",
    start: "Start",
    edit: "Edit selection",
    cancel: "Cancel",
    choose: "Choose a local pioneer",
    otherPioneers: "Other saved pioneers",
    selectSavedPioneerHint:
      "To resume a saved pioneer, select it from the suggestions. Typing its name alone will not load that save.",
    empty: "No other saved pioneers on this device.",
    corrupt: "Needs recovery",
    confirmed: "Ready to begin",
    confirmedName: "Confirmed pioneer",
    manage: "Manage saves",
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
    clipboardCopied: "Data copied to clipboard!",
    clipboardCopyError:
      "Error copying data! If on Chrome, this could be expected.  Select and copy the text string manually!",
    clipboardReadError: "Could not read the clipboard. Paste the save code into the field instead.",
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
    importedAsNew: "Save imported. Choose its pioneer from the saved list to resume it.",
    loaded: "Game loaded successfully!",
    offlineGainsAdded: "Offline Gains Added!",
    conflict: "A local save already uses this pioneer name. Choose what to do.",
    readOnlyLock:
      "This tab cannot change the save because it does not hold the save lock. Reload or export this run before making changes.",
    errEmpty: "Paste a save code first.",
    errTooLarge: "This save exceeds the supported size.",
    errFormat: "This is not a marked MIAPLACIDUS save code.",
    errCode: "The code is incomplete or uses an unsupported format.",
    errIntegrity: "The save is incomplete or failed its integrity check.",
    errFuture: "This save was made by a newer game version.",
    errDuplicate: "Another local save already uses this name.",
    errName: "Enter a valid pioneer name.",
    errCorrupt: "This save is damaged and needs recovery.",
    errConflict: "This save changed in another tab. Reload or export this run before saving.",
    errQuota:
      "Browser storage is full. The previous save remains available; export or remove a save to make room.",
    errStorage: "Browser storage is unavailable. This run is temporary; export it before leaving.",
    errImport: "The save could not be imported. Check that its data is valid and try again.",
    errNotFound: "No saved game data found.",
    errGeneric: "That action could not be completed. Please try again.",
    paste: "Paste",
    autoSave: "Automatic saving",
    autoSaveDisabledWarning: "AUTOSAVE IS OFF, REMEMBER TO BACK UP SAVES MANUALLY",
    saveFrequency: "Save interval",
    every5Minutes: "5 minutes",
    every15Minutes: "15 minutes",
    every30Minutes: "30 minutes",
    everyHour: "1 hour",
    reload: "Reload saved version",
    saveAsNew: "Save run as a new pioneer",
    recover: "Review recovery",
    recoverConfirm: "Restore this validated generation",
    saveDeleted: "Save deleted. You can start a new game with the same pioneer name.",
    capacity:
      "A save keeps the previous and next generations until the new head is verified. Export or delete a save intentionally; no slot is removed automatically.",
    recovered: "The saved generation was restored. Review the pioneer before starting it.",
    leaveWarning: "This run has not been saved. Export it before leaving or discard it now.",
    stay: "Keep playing",
    discardRun: "Discard temporary run",
    portableSize: "Portable code size",
    localSaveSize: "Compressed local save",
    remainingCapacity: "Estimated space left after this save:",
    appData: "App data",
  },
  es: {
    startNewGame: "EMPEZAR JUEGO NUEVO",
    resumeGame: "REANUDAR JUEGO",
    starting: "Iniciando…",
    confirm: "Confirmar",
    start: "Comenzar",
    edit: "Editar selección",
    cancel: "Cancelar",
    choose: "Elige un pionero local",
    otherPioneers: "Otros pioneros guardados",
    selectSavedPioneerHint:
      "Para reanudar un pionero guardado, selecciónalo en las sugerencias. Escribir solo su nombre no cargará esa partida.",
    empty: "No hay otros pioneros guardados en este dispositivo.",
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
    clipboardCopied: "¡Datos copiados al portapapeles!",
    clipboardCopyError:
      "¡Error al copiar los datos! En Chrome esto puede ser normal. ¡Selecciona y copia el texto manualmente!",
    clipboardReadError: "No se pudo leer el portapapeles. Pega el código de guardado en el campo.",
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
    importedAsNew: "Partida importada. Elige su pionero de la lista para reanudarla.",
    loaded: "¡Partida cargada correctamente!",
    offlineGainsAdded: "¡Ganancias sin conexión añadidas!",
    conflict: "Ya existe una partida local con este nombre. Elige qué hacer.",
    readOnlyLock:
      "Esta pestaña no puede cambiar la partida porque no tiene su bloqueo. Recarga o exporta esta sesión antes de modificarla.",
    errEmpty: "Pega primero un código.",
    errTooLarge: "La partida supera el tamaño permitido.",
    errFormat: "El código no está marcado como una partida de MIAPLACIDUS.",
    errCode: "El código está incompleto o usa un formato no compatible.",
    errIntegrity: "La partida está incompleta o no supera la comprobación de integridad.",
    errFuture: "La partida se creó con una versión más reciente.",
    errDuplicate: "Ya existe otra partida local con este nombre.",
    errName: "Introduce un nombre de pionero válido.",
    errCorrupt: "La partida está dañada y necesita recuperación.",
    errConflict:
      "La partida cambió en otra pestaña. Recárgala o exporta esta sesión antes de guardar.",
    errQuota:
      "El almacenamiento está lleno. La partida anterior sigue disponible; exporta o elimina una partida.",
    errStorage:
      "El almacenamiento no está disponible. Esta sesión es temporal; expórtala antes de salir.",
    errImport:
      "No se pudo importar la partida. Comprueba que los datos sean válidos e inténtalo de nuevo.",
    errNotFound: "No se encontraron datos de partida guardada.",
    errGeneric: "No se pudo completar la operación. Inténtalo de nuevo.",
    paste: "Pegar",
    autoSave: "Guardado automático",
    autoSaveDisabledWarning:
      "EL GUARDADO AUTOMÁTICO ESTÁ DESACTIVADO, RECUERDA HACER COPIAS MANUALES",
    saveFrequency: "Intervalo de guardado",
    every5Minutes: "5 minutos",
    every15Minutes: "15 minutos",
    every30Minutes: "30 minutos",
    everyHour: "1 hora",
    reload: "Cargar versión guardada",
    saveAsNew: "Guardar como pionero nuevo",
    recover: "Revisar recuperación",
    recoverConfirm: "Restaurar esta generación validada",
    saveDeleted:
      "Partida eliminada. Puedes empezar una partida nueva con el mismo nombre de pionero.",
    capacity:
      "Cada guardado conserva la generación anterior hasta verificar la nueva. Exporta o elimina partidas de forma intencionada; ninguna se borra automáticamente.",
    recovered: "Se restauró la generación guardada. Revisa el pionero antes de iniciarlo.",
    leaveWarning: "Esta partida no se ha guardado. Expórtala antes de salir o descártala ahora.",
    stay: "Seguir jugando",
    discardRun: "Descartar partida temporal",
    portableSize: "Tamaño del código portátil",
    localSaveSize: "Tamaño comprimido local",
    remainingCapacity: "Espacio estimado restante tras este guardado:",
    appData: "Datos de la aplicación",
  },
  pt: {
    startNewGame: "COMEÇAR NOVO JOGO",
    resumeGame: "RETOMAR JOGO",
    starting: "A iniciar…",
    confirm: "Confirmar",
    start: "Começar",
    edit: "Editar seleção",
    cancel: "Cancelar",
    choose: "Escolha um pioneiro local",
    otherPioneers: "Outros pioneiros guardados",
    selectSavedPioneerHint:
      "Para retomar um pioneiro guardado, selecione-o nas sugestões. Escrever apenas o nome não carrega esse salvamento.",
    empty: "Não há outros pioneiros guardados neste dispositivo.",
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
    clipboardCopied: "Dados copiados para a área de transferência!",
    clipboardCopyError:
      "Erro ao copiar os dados! No Chrome isto pode ser normal. Seleciona e copia o texto manualmente!",
    clipboardReadError:
      "Não foi possível ler a área de transferência. Cola o código de gravação no campo.",
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
    importedAsNew: "Salvamento importado. Escolha o pioneiro na lista para o retomar.",
    loaded: "Jogo carregado com sucesso!",
    offlineGainsAdded: "Ganhos offline adicionados!",
    conflict: "Já existe um salvamento local com este nome. Escolha uma ação.",
    readOnlyLock:
      "Esta aba não pode alterar o salvamento porque não possui o bloqueio. Recarregue ou exporte esta sessão antes de fazer alterações.",
    errEmpty: "Cole um código primeiro.",
    errTooLarge: "O salvamento excede o tamanho permitido.",
    errFormat: "Este código não está marcado como salvamento MIAPLACIDUS.",
    errCode: "O código está incompleto ou usa formato incompatível.",
    errIntegrity: "O salvamento está incompleto ou falhou na verificação de integridade.",
    errFuture: "Este salvamento foi criado em uma versão mais recente.",
    errDuplicate: "Outro salvamento local já usa este nome.",
    errName: "Insira um nome de pioneiro válido.",
    errCorrupt: "Este salvamento está danificado e precisa de recuperação.",
    errConflict:
      "O salvamento mudou em outra aba. Recarregue ou exporte esta sessão antes de salvar.",
    errQuota:
      "O armazenamento está cheio. O salvamento anterior continua disponível; exporte ou remova um salvamento.",
    errStorage:
      "O armazenamento não está disponível. Esta sessão é temporária; exporte antes de sair.",
    errImport:
      "Não foi possível importar o salvamento. Verifique se os dados estão corretos e tente novamente.",
    errNotFound: "Não foram encontrados dados de jogo guardados.",
    errGeneric: "Não foi possível concluir a operação. Tente novamente.",
    paste: "Colar",
    autoSave: "Salvamento automático",
    autoSaveDisabledWarning:
      "O GUARDADO AUTOMÁTICO ESTÁ DESATIVADO, LEMBRE-SE DE FAZER CÓPIAS MANUAIS",
    saveFrequency: "Intervalo de salvamento",
    every5Minutes: "5 minutos",
    every15Minutes: "15 minutos",
    every30Minutes: "30 minutos",
    everyHour: "1 hora",
    reload: "Recarregar versão salva",
    saveAsNew: "Salvar como novo pioneiro",
    recover: "Revisar recuperação",
    recoverConfirm: "Restaurar esta geração validada",
    saveDeleted:
      "Salvamento excluído. Você pode começar um novo jogo com o mesmo nome de pioneiro.",
    capacity:
      "Cada salvamento mantém a geração anterior até verificar a nova. Exporte ou exclua salvamentos manualmente; nenhum slot é removido automaticamente.",
    recovered: "A geração salva foi restaurada. Revise o pioneiro antes de começar.",
    leaveWarning: "Esta sessão não foi salva. Exporte antes de sair ou descarte agora.",
    stay: "Continuar jogando",
    discardRun: "Descartar sessão temporária",
    portableSize: "Tamanho do código portátil",
    localSaveSize: "Tamanho comprimido local",
    remainingCapacity: "Espaço estimado restante após este salvamento:",
    appData: "Dados do aplicativo",
  },
  de: {
    startNewGame: "NEUES SPIEL STARTEN",
    resumeGame: "SPIEL FORTSETZEN",
    starting: "Spiel startet…",
    confirm: "Bestätigen",
    start: "Starten",
    edit: "Auswahl bearbeiten",
    cancel: "Abbrechen",
    choose: "Lokalen Pionier auswählen",
    otherPioneers: "Weitere gespeicherte Pioniere",
    selectSavedPioneerHint:
      "Um einen gespeicherten Pionier fortzusetzen, wähle ihn in den Vorschlägen aus. Die Eingabe seines Namens allein lädt diesen Spielstand nicht.",
    empty: "Keine weiteren gespeicherten Pioniere auf diesem Gerät.",
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
    export: "Übertragbarer Spielstandcode",
    copy: "Code kopieren",
    clipboardCopied: "Daten in die Zwischenablage kopiert!",
    clipboardCopyError:
      "Fehler beim Kopieren der Daten! In Chrome kann das normal sein. Markiere und kopiere den Text manuell!",
    clipboardReadError:
      "Die Zwischenablage konnte nicht gelesen werden. Füge den Spielstandcode in das Feld ein.",
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
    importedAsNew: "Spielstand importiert. Wähle den Pionier in der Liste aus, um fortzufahren.",
    loaded: "Spiel erfolgreich geladen!",
    offlineGainsAdded: "Offline-Gewinne hinzugefügt!",
    conflict: "Ein lokaler Spielstand verwendet diesen Namen bereits. Wähle eine Aktion.",
    readOnlyLock:
      "Dieser Tab kann den Spielstand nicht ändern, weil er die Sperre nicht besitzt. Lade neu oder exportiere diesen Lauf, bevor du Änderungen vornimmst.",
    errEmpty: "Füge zuerst einen Spielstandcode ein.",
    errTooLarge: "Der Spielstand überschreitet die zulässige Größe.",
    errFormat: "Dieser Code ist nicht als MIAPLACIDUS-Spielstand gekennzeichnet.",
    errCode: "Der Code ist unvollständig oder verwendet ein unbekanntes Format.",
    errIntegrity:
      "Der Spielstand ist unvollständig oder die Integritätsprüfung ist fehlgeschlagen.",
    errFuture: "Dieser Spielstand stammt aus einer neueren Spielversion.",
    errDuplicate: "Ein anderer lokaler Spielstand verwendet diesen Namen bereits.",
    errName: "Gib einen gültigen Pioniernamen ein.",
    errCorrupt: "Dieser Spielstand ist beschädigt und muss wiederhergestellt werden.",
    errConflict:
      "Der Spielstand wurde in einem anderen Tab geändert. Lade neu oder exportiere diesen Lauf vor dem Speichern.",
    errQuota:
      "Der Browserspeicher ist voll. Der vorherige Spielstand ist noch verfügbar; exportiere oder lösche einen Spielstand.",
    errStorage:
      "Browserspeicher ist nicht verfügbar. Dieser Lauf ist temporär; exportiere ihn vor dem Verlassen.",
    errImport:
      "Der Spielstand konnte nicht importiert werden. Prüfe die Daten und versuche es erneut.",
    errNotFound: "Keine gespeicherten Spieldaten gefunden.",
    errGeneric: "Der Vorgang konnte nicht abgeschlossen werden. Bitte versuche es erneut.",
    paste: "Einfügen",
    autoSave: "Automatisches Speichern",
    autoSaveDisabledWarning: "AUTOMATISCHES SPEICHERN IST AUS, DENK AN MANUELLE SICHERUNGEN",
    saveFrequency: "Speicherintervall",
    every5Minutes: "5 Minuten",
    every15Minutes: "15 Minuten",
    every30Minutes: "30 Minuten",
    everyHour: "1 Stunde",
    reload: "Gespeicherte Version laden",
    saveAsNew: "Lauf als neuen Pionier speichern",
    recover: "Wiederherstellung prüfen",
    recoverConfirm: "Diese geprüfte Generation wiederherstellen",
    saveDeleted:
      "Spielstand gelöscht. Du kannst mit demselben Pioniernamen ein neues Spiel starten.",
    capacity:
      "Beim Speichern bleibt die vorherige Generation bestehen, bis die neue geprüft ist. Exportiere oder lösche Spielstände bewusst; kein Slot wird automatisch entfernt.",
    recovered:
      "Die gespeicherte Generation wurde wiederhergestellt. Prüfe den Pionier vor dem Start.",
    leaveWarning:
      "Dieser Lauf wurde nicht gespeichert. Exportiere ihn vor dem Verlassen oder verwerfe ihn jetzt.",
    stay: "Weiter spielen",
    discardRun: "Temporären Lauf verwerfen",
    portableSize: "Größe des portablen Codes",
    localSaveSize: "Komprimierter lokaler Spielstand",
    remainingCapacity: "Geschätzter freier Speicher nach diesem Spielstand:",
    appData: "App-Daten",
  },
  it: {
    startNewGame: "INIZIA NUOVA PARTITA",
    resumeGame: "RIPRENDI PARTITA",
    starting: "Avvio…",
    confirm: "Conferma",
    start: "Inizia",
    edit: "Modifica selezione",
    cancel: "Annulla",
    choose: "Scegli un pioniere locale",
    otherPioneers: "Altri pionieri salvati",
    selectSavedPioneerHint:
      "Per riprendere un pioniere salvato, selezionalo tra i suggerimenti. Digitare solo il suo nome non caricherà quel salvataggio.",
    empty: "Non ci sono altri pionieri salvati su questo dispositivo.",
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
    clipboardCopied: "Dati copiati negli appunti!",
    clipboardCopyError:
      "Errore nella copia dei dati! Su Chrome può essere normale. Seleziona e copia il testo manualmente!",
    clipboardReadError:
      "Impossibile leggere gli appunti. Incolla il codice di salvataggio nel campo.",
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
    importedAsNew: "Salvataggio importato. Scegli il pioniere nell'elenco per riprenderlo.",
    loaded: "Partita caricata con successo!",
    offlineGainsAdded: "Guadagni offline aggiunti!",
    conflict: "Esiste già un salvataggio locale con questo nome. Scegli un'azione.",
    readOnlyLock:
      "Questa scheda non può modificare il salvataggio perché non ne detiene il blocco. Ricarica o esporta questa sessione prima di apportare modifiche.",
    errEmpty: "Incolla prima un codice.",
    errTooLarge: "Il salvataggio supera le dimensioni supportate.",
    errFormat: "Questo codice non è contrassegnato come salvataggio MIAPLACIDUS.",
    errCode: "Il codice è incompleto o usa un formato non supportato.",
    errIntegrity: "Il salvataggio è incompleto o non supera il controllo d'integrità.",
    errFuture: "Il salvataggio proviene da una versione più recente.",
    errDuplicate: "Un altro salvataggio locale usa già questo nome.",
    errName: "Inserisci un nome di pioniere valido.",
    errCorrupt: "Questo salvataggio è danneggiato e richiede recupero.",
    errConflict:
      "Il salvataggio è cambiato in un'altra scheda. Ricarica o esporta questa sessione prima di salvare.",
    errQuota:
      "Lo spazio del browser è pieno. Il salvataggio precedente è disponibile; esporta o rimuovine uno.",
    errStorage:
      "Lo spazio del browser non è disponibile. Questa sessione è temporanea; esportala prima di uscire.",
    errImport:
      "Impossibile importare il salvataggio. Verifica che i dati siano corretti e riprova.",
    errNotFound: "Nessun dato di salvataggio trovato.",
    errGeneric: "Operazione non riuscita. Riprova.",
    paste: "Incolla",
    autoSave: "Salvataggio automatico",
    autoSaveDisabledWarning: "IL SALVATAGGIO AUTOMATICO È DISATTIVO, RICORDA DI FARE COPIE MANUALI",
    saveFrequency: "Intervallo di salvataggio",
    every5Minutes: "5 minuti",
    every15Minutes: "15 minuti",
    every30Minutes: "30 minuti",
    everyHour: "1 ora",
    reload: "Carica la versione salvata",
    saveAsNew: "Salva la partita come nuovo pioniere",
    recover: "Verifica il recupero",
    recoverConfirm: "Ripristina questa generazione verificata",
    saveDeleted:
      "Salvataggio eliminato. Puoi iniziare una nuova partita con lo stesso nome del pioniere.",
    capacity:
      "Ogni salvataggio conserva la generazione precedente finché la nuova non è verificata. Esporta o elimina i salvataggi manualmente; nessuno slot viene rimosso automaticamente.",
    recovered:
      "La generazione salvata è stata ripristinata. Controlla il pioniere prima di avviarla.",
    leaveWarning: "Questa partita non è stata salvata. Esportala prima di uscire o scartala ora.",
    stay: "Continua a giocare",
    discardRun: "Scarta la partita temporanea",
    portableSize: "Dimensione del codice portatile",
    localSaveSize: "Dimensione del salvataggio locale compresso",
    remainingCapacity: "Spazio stimato disponibile dopo questo salvataggio:",
    appData: "Dati dell'app",
  },
  fr: {
    startNewGame: "NOUVELLE PARTIE",
    resumeGame: "REPRENDRE LA PARTIE",
    starting: "Démarrage…",
    confirm: "Confirmer",
    start: "Commencer",
    edit: "Modifier la sélection",
    cancel: "Annuler",
    choose: "Choisir un pionnier local",
    otherPioneers: "Autres pionniers enregistrés",
    selectSavedPioneerHint:
      "Pour reprendre un pionnier enregistré, sélectionnez-le dans les suggestions. Saisir son nom seul ne chargera pas cette sauvegarde.",
    empty: "Aucun autre pionnier n'est enregistré sur cet appareil.",
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
    clipboardCopied: "Données copiées dans le presse-papiers!",
    clipboardCopyError:
      "Erreur lors de la copie des données! Sur Chrome, cela peut être normal. Sélectionnez et copiez le texte manuellement!",
    clipboardReadError:
      "Impossible de lire le presse-papiers. Collez le code de sauvegarde dans le champ.",
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
    importedAsNew: "Sauvegarde importée. Choisissez le pionnier dans la liste pour la reprendre.",
    loaded: "Partie chargée avec succès!",
    offlineGainsAdded: "Gains hors ligne ajoutés!",
    conflict: "Une sauvegarde locale utilise déjà ce nom. Choisissez une action.",
    readOnlyLock:
      "Cet onglet ne peut pas modifier la sauvegarde, car il n'en détient pas le verrou. Rechargez ou exportez cette partie avant d'y apporter des modifications.",
    errEmpty: "Collez d'abord un code.",
    errTooLarge: "Cette sauvegarde dépasse la taille autorisée.",
    errFormat: "Ce code n'est pas identifié comme une sauvegarde MIAPLACIDUS.",
    errCode: "Le code est incomplet ou utilise un format non pris en charge.",
    errIntegrity: "La sauvegarde est incomplète ou la vérification d'intégrité a échoué.",
    errFuture: "Cette sauvegarde provient d'une version plus récente.",
    errDuplicate: "Une autre sauvegarde locale utilise déjà ce nom.",
    errName: "Saisissez un nom de pionnier valide.",
    errCorrupt: "Cette sauvegarde est endommagée et doit être récupérée.",
    errConflict:
      "La sauvegarde a changé dans un autre onglet. Rechargez ou exportez cette partie avant d'enregistrer.",
    errQuota:
      "Le stockage du navigateur est plein. La sauvegarde précédente est disponible ; exportez-en ou supprimez-en une.",
    errStorage:
      "Le stockage du navigateur est indisponible. Cette partie est temporaire ; exportez-la avant de quitter.",
    errImport: "La sauvegarde n'a pas pu être importée. Vérifiez les données et réessayez.",
    errNotFound: "Aucune donnée de sauvegarde trouvée.",
    errGeneric: "L'opération n'a pas pu aboutir. Réessayez.",
    paste: "Coller",
    autoSave: "Enregistrement automatique",
    autoSaveDisabledWarning:
      "LA SAUVEGARDE AUTOMATIQUE EST DÉSACTIVÉE, PENSEZ À SAUVEGARDER MANUELLEMENT",
    saveFrequency: "Fréquence d'enregistrement",
    every5Minutes: "5 minutes",
    every15Minutes: "15 minutes",
    every30Minutes: "30 minutes",
    everyHour: "1 heure",
    reload: "Recharger la version enregistrée",
    saveAsNew: "Enregistrer comme nouveau pionnier",
    recover: "Examiner la récupération",
    recoverConfirm: "Restaurer cette génération validée",
    saveDeleted:
      "Sauvegarde supprimée. Vous pouvez commencer une nouvelle partie avec le même nom de pionnier.",
    capacity:
      "Chaque sauvegarde conserve la génération précédente jusqu'à la validation de la nouvelle. Exportez ou supprimez les sauvegardes volontairement ; aucun slot n'est supprimé automatiquement.",
    recovered:
      "La génération enregistrée a été restaurée. Vérifiez le pionnier avant de le lancer.",
    leaveWarning:
      "Cette partie n'a pas été enregistrée. Exportez-la avant de partir ou abandonnez-la maintenant.",
    stay: "Continuer à jouer",
    discardRun: "Abandonner la partie temporaire",
    portableSize: "Taille du code portable",
    localSaveSize: "Taille de la sauvegarde locale compressée",
    remainingCapacity: "Espace estimé restant après cette sauvegarde :",
    appData: "Données de l'application",
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
        "invalid-name": "errName",
        "corrupt-slot": "errCorrupt",
        conflict: "errConflict",
        quota: "errQuota",
        "storage-unavailable": "errStorage",
        "not-found": "errNotFound",
      } as Record<string, SaveMessageKey>
    )[code] ?? "errGeneric";
  return saveText(locale, key);
}

export const LOCALIZATION_VALIDATION_DATA = { messages } as const;
