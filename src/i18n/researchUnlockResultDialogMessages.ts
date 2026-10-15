import type { TechId, LocaleId } from "../content/ids";
import type { RandomEventDialogCopy } from "./randomEventDialogTypes";

export type ResearchUnlockResultDialogId =
  | "compounds"
  | "scienceLaboratories"
  | "quantumComputing"
  | "rocketComposites"
  | "compoundMachining"
  | "atmosphericTelescopes"
  | "basicPowerGeneration"
  | "stellarCartography"
  | "knowledgeSharing";

interface SourceDialog {
  readonly title: string;
  readonly bodyHtml: string;
}

const SOURCE_DIALOGS = {
  "en": {
    "compounds": {
      "title": "COMPOUNDS UNLOCKED!",
      "bodyHtml": "You have discovered Fusion, and unlocked the Compounds Tab!<br><br>This is where you can fuse resources into more complex compounds like Diesel, Glass and Steel.<br><br><span class='green-ready-text'>Compounds Tab Unlocked!</span>"
    },
    "scienceLaboratories": {
      "title": "SCIENCE LABS!",
      "bodyHtml": "Scientists now have dedicated laboratories to carry out their experiments.<br>Research will rocket with this advancement!<br><br><span class='green-ready-text'>Science Labs Unlocked!</span>"
    },
    "quantumComputing": {
      "title": "QUANTUM COMPUTING UNLOCKED!",
      "bodyHtml": "Your Researchers have breached the boundaries of classical computation.<br>With Quantum Computing, reality itself bends to optimize processes.<br>This advancement will allow us to extract Resources much faster<br><br><span class='green-ready-text'>Level 2 AutoBuyers Unlocked!</span>"
    },
    "rocketComposites": {
      "title": "ROCKET COMPOSITES!",
      "bodyHtml": "Scientists have developed new materials that can be used in advanced Mining, both here and on Asteroids!<br>With this technology you can now build a Launch Pad and Rockets!<br>Not only that, but also you now have access to the most advanced extraction machinery on the ground too!<br><br><span class='green-ready-text'>LaunchPad and Rockets Unlocked!</span><br><span class='green-ready-text'>Level 3 and 4 AutoBuyers Unlocked!</span>"
    },
    "compoundMachining": {
      "title": "AUTOMATED COMPOUND CREATION!",
      "bodyHtml": "Our scientists have done it again! Now we have advanced machinery capable of automatically<br>creating Compounds at will.  This is extremely powerful indeed!<br>If we cannot conquer the Galaxy now, it is your fault!<br><br><span class='green-ready-text'>Automated Compound Creation Unlocked!</span>"
    },
    "atmosphericTelescopes": {
      "title": "SPACE MINING UNLOCKED!",
      "bodyHtml": "You have successfully developed optics capable of scanning the Stars and Asteroids<br>Perhaps we can use these Asteroids for our benefit and mine them!<br>We will realise our dream of returning to the stars!<br><br><span class='green-ready-text'>Space Mining Tab Unlocked!</span>"
    },
    "basicPowerGeneration": {
      "title": "ENERGY UNLOCKED!",
      "bodyHtml": "Your Engineers have harnessed the power of stored Resources<br>to generate Energy for advanced systems and automation.<br>This marks a pivotal step toward a sustainable future, and opens up possibilities unavailable until now.<br><br><span class='green-ready-text'>Energy Tab Unlocked!</span>"
    },
    "stellarCartography": {
      "title": "INTERSTELLAR UNLOCKED!",
      "bodyHtml": "Your Engineers have begun mapping the Stars!<br>With this capability, you will one day have a reference to explore and Colonise the Galaxy!<br><br><span class='green-ready-text'>Interstellar Tab Unlocked!</span>"
    },
    "knowledgeSharing": {
      "title": "TECH RESEARCH!",
      "bodyHtml": "People are getting together to share knowledge!<br>Scientific research will advance much faster with new Science Clubs where enthusiasts<br>can convene and develop their ideas!<br><br><span class='green-ready-text'>Science Clubs Unlocked!</span>"
    }
  },
  "es": {
    "compounds": {
      "title": "\u00a1COMPUESTOS DESBLOQUEADOS!",
      "bodyHtml": "Tus Cient\u00edficos han experimentado combinando Recursos de Hidr\u00f3geno y Carbono,<br>\u00a1y han descubierto Diesel!  Con este conocimiento, est\u00e1n seguros de que<br>m\u00e1s de estos Compuestos seguir\u00e1n.<br><br><span class='green-ready-text'>\u00a1Pesta\u00f1a de Compuestos Desbloqueada!</span>"
    },
    "scienceLaboratories": {
      "title": "\u00a1LABORATORIOS DE CIENCIA!",
      "bodyHtml": "Los cient\u00edficos ahora tienen laboratorios dedicados para llevar a cabo sus experimentos.<br>\u00a1La investigaci\u00f3n se disparar\u00e1 con este avance!<br><br><span class='green-ready-text'>\u00a1Laboratorios de Ciencia Desbloqueados!</span>"
    },
    "quantumComputing": {
      "title": "\u00a1COMPUTACI\u00d3N CU\u00c1NTICA DESBLOQUEADA!",
      "bodyHtml": "Tus Investigadores han traspasado los l\u00edmites de la computaci\u00f3n cl\u00e1sica.<br>Con la Computaci\u00f3n Cu\u00e1ntica, la realidad misma se dobla para optimizar procesos.<br>Este avance nos permitir\u00e1 extraer Recursos mucho m\u00e1s r\u00e1pido<br><br><span class='green-ready-text'>\u00a1Compradores Autom\u00e1ticos Nivel 2 Desbloqueados!</span>"
    },
    "rocketComposites": {
      "title": "\u00a1COMPUESTOS DE COHETES!",
      "bodyHtml": "Los cient\u00edficos han desarrollado nuevos materiales que pueden usarse en Miner\u00eda avanzada, \u00a1tanto aqu\u00ed como en Asteroides!<br>\u00a1Con esta tecnolog\u00eda ahora puedes construir una Plataforma de Lanzamiento y Cohetes!<br>No solo eso, \u00a1sino que ahora tambi\u00e9n tienes acceso a la maquinaria de extracci\u00f3n m\u00e1s avanzada en tierra!<br><br><span class='green-ready-text'>\u00a1Plataforma de Lanzamiento y Cohetes Desbloqueados!</span><br><span class='green-ready-text'>\u00a1Compradores Autom\u00e1ticos Nivel 3 y 4 Desbloqueados!</span>"
    },
    "compoundMachining": {
      "title": "\u00a1CREACI\u00d3N AUTOMATIZADA DE COMPUESTOS!",
      "bodyHtml": "\u00a1Nuestros cient\u00edficos lo han vuelto a hacer! Ahora tenemos maquinaria avanzada capaz de crear autom\u00e1ticamente<br>Compuestos a voluntad. \u00a1Esto es extremadamente poderoso!<br>\u00a1Si no podemos conquistar la Galaxia ahora, es tu culpa!<br><br><span class='green-ready-text'>\u00a1Creaci\u00f3n Automatizada de Compuestos Desbloqueada!</span>"
    },
    "atmosphericTelescopes": {
      "title": "\u00a1MINER\u00cdA ESPACIAL DESBLOQUEADA!",
      "bodyHtml": "\u00a1Has desarrollado con \u00e9xito \u00f3ptica capaz de escanear las Estrellas y Asteroides<br>Quiz\u00e1s podamos usar estos Asteroides para nuestro beneficio y minarlos!<br>\u00a1Realizaremos nuestro sue\u00f1o de regresar a las estrellas!<br><br><span class='green-ready-text'>\u00a1Pesta\u00f1a de Miner\u00eda Espacial Desbloqueada!</span>"
    },
    "basicPowerGeneration": {
      "title": "\u00a1ENERG\u00cdA DESBLOQUEADA!",
      "bodyHtml": "Tus Ingenieros han aprovechado el poder de los Recursos almacenados<br>para generar Energ\u00eda para sistemas avanzados y automatizaci\u00f3n.<br>Esto marca un paso crucial hacia un futuro sostenible, y abre posibilidades no disponibles hasta ahora.<br><br><span class='green-ready-text'>\u00a1Pesta\u00f1a de Energ\u00eda Desbloqueada!</span>"
    },
    "stellarCartography": {
      "title": "\u00a1INTERESTELAR DESBLOQUEADO!",
      "bodyHtml": "\u00a1Tus Ingenieros han comenzado a mapear las Estrellas!<br>\u00a1Con esta capacidad, alg\u00fan d\u00eda tendr\u00e1s una referencia para explorar y Colonizar la Galaxia!<br><br><span class='green-ready-text'>\u00a1Pesta\u00f1a Interestelar Desbloqueada!</span>"
    },
    "knowledgeSharing": {
      "title": "\u00a1INVESTIGACI\u00d3N T\u00c9CNICA!",
      "bodyHtml": "\u00a1La gente se est\u00e1 reuniendo para compartir conocimiento!<br>\u00a1La investigaci\u00f3n cient\u00edfica avanzar\u00e1 mucho m\u00e1s r\u00e1pido con nuevos Clubes de Ciencia donde entusiastas<br>pueden reunirse y desarrollar sus ideas!<br><br><span class='green-ready-text'>\u00a1Clubes de Ciencia Desbloqueados!</span>"
    }
  },
  "pt": {
    "compounds": {
      "title": "COMPOSTOS DESBLOQUEADOS!",
      "bodyHtml": "Seus Cientistas experimentaram combinar Recursos de Hidrog\u00eanio e Carbono,<br>e descobriram o Diesel! Com esse conhecimento, eles est\u00e3o certos de que<br>muitos outros Compostos vir\u00e3o.<br><br><span class='green-ready-text'>Aba de Compostos Desbloqueada!</span>"
    },
    "scienceLaboratories": {
      "title": "LABORAT\u00d3RIOS DE CI\u00caNCIA!",
      "bodyHtml": "Os cientistas agora t\u00eam laborat\u00f3rios dedicados para realizar seus experimentos.<br>A pesquisa vai disparar com este avan\u00e7o!<br><br><span class='green-ready-text'>Laborat\u00f3rios de Ci\u00eancia Desbloqueados!</span>"
    },
    "quantumComputing": {
      "title": "COMPUTA\u00c7\u00c3O QU\u00c2NTICA DESBLOQUEADA!",
      "bodyHtml": "Seus pesquisadores ultrapassaram os limites da computa\u00e7\u00e3o cl\u00e1ssica.<br>Com a Computa\u00e7\u00e3o Qu\u00e2ntica, a pr\u00f3pria realidade se dobra para otimizar processos.<br>Este avan\u00e7o nos permitir\u00e1 extrair Recursos muito mais rapidamente<br><br><span class='green-ready-text'>Compradores Autom\u00e1ticos de N\u00edvel 2 Desbloqueados!</span>"
    },
    "rocketComposites": {
      "title": "COMPOSTOS DE FOGUETES!",
      "bodyHtml": "Os cientistas desenvolveram novos materiais que podem ser usados em Minera\u00e7\u00e3o avan\u00e7ada, tanto aqui quanto em Asteroides!<br>Com esta tecnologia, agora voc\u00ea pode construir uma Plataforma de Lan\u00e7amento e Foguetes!<br>N\u00e3o s\u00f3 isso, como agora voc\u00ea tamb\u00e9m tem acesso \u00e0s m\u00e1quinas de extra\u00e7\u00e3o mais avan\u00e7adas em terra!<br><br><span class='green-ready-text'>Plataforma de Lan\u00e7amento e Foguetes Desbloqueados!</span><br><span class='green-ready-text'>Compradores Autom\u00e1ticos de N\u00edvel 3 e 4 Desbloqueados!</span>"
    },
    "compoundMachining": {
      "title": "CRIA\u00c7\u00c3O AUTOMATIZADA DE COMPOSTOS!",
      "bodyHtml": "Nossos cientistas fizeram isso novamente! Agora temos m\u00e1quinas avan\u00e7adas capazes de criar automaticamente<br>Compostos \u00e0 vontade. Isso \u00e9 extremamente poderoso!<br>Se n\u00e3o conseguirmos conquistar a Gal\u00e1xia agora, a culpa \u00e9 sua!<br><br><span class='green-ready-text'>Cria\u00e7\u00e3o Automatizada de Compostos Desbloqueada!</span>"
    },
    "atmosphericTelescopes": {
      "title": "MINERA\u00c7\u00c3O ESPACIAL DESBLOQUEADA!",
      "bodyHtml": "Voc\u00ea desenvolveu com sucesso uma \u00f3ptica capaz de escanear Estrelas e Asteroides<br>Talvez possamos usar esses Asteroides a nosso favor e miner\u00e1-los!<br>Vamos realizar nosso sonho de retornar \u00e0s estrelas!<br><br><span class='green-ready-text'>Aba de Minera\u00e7\u00e3o Espacial Desbloqueada!</span>"
    },
    "basicPowerGeneration": {
      "title": "ENERGIA DESBLOQUEADA!",
      "bodyHtml": "Seus Engenheiros aproveitaram o poder dos Recursos armazenados<br>para gerar Energia para sistemas avan\u00e7ados e automa\u00e7\u00e3o.<br>Isso marca um passo crucial rumo a um futuro sustent\u00e1vel e abre possibilidades que antes n\u00e3o estavam dispon\u00edveis.<br><br><span class='green-ready-text'>Aba de Energia Desbloqueada!</span>"
    },
    "stellarCartography": {
      "title": "INTERESTELAR DESBLOQUEADO!",
      "bodyHtml": "Seus Engenheiros come\u00e7aram a mapear as Estrelas!<br>Com essa capacidade, algum dia voc\u00ea ter\u00e1 uma refer\u00eancia para explorar e Colonizar a Gal\u00e1xia!<br><br><span class='green-ready-text'>Aba Interestelar Desbloqueada!</span>"
    },
    "knowledgeSharing": {
      "title": "PESQUISA T\u00c9CNICA!",
      "bodyHtml": "As pessoas est\u00e3o se reunindo para compartilhar conhecimento!<br>A pesquisa cient\u00edfica avan\u00e7ar\u00e1 muito mais rapidamente com novos Clubes de Ci\u00eancia onde entusiastas<br>podem se reunir e desenvolver suas ideias!<br><br><span class='green-ready-text'>Clubes de Ci\u00eancia Desbloqueados!</span>"
    }
  },
  "de": {
    "compounds": {
      "title": "VERBINDUNGEN FREIGESCHALTET!",
      "bodyHtml": "Deine Wissenschaftler haben mit der Kombination von Wasserstoff- und Kohlenstoffressourcen experimentiert,<br>und haben Diesel entdeckt!  Mit diesem Wissen sind sie sicher, dass<br>mehr dieser Verbindungen folgen werden.<br><br><span class='green-ready-text'>Verbindungen-Tab Freigeschaltet!</span>"
    },
    "scienceLaboratories": {
      "title": "WISSENSCHAFTSLABORE!",
      "bodyHtml": "Wissenschaftler haben jetzt dedizierte Laboratorien, um ihre Experimente durchzuf\u00fchren.<br>Forschung wird mit diesem Fortschritt raketenm\u00e4\u00dfig voranschreiten!<br><br><span class='green-ready-text'>Wissenschaftslabore Freigeschaltet!</span>"
    },
    "quantumComputing": {
      "title": "QUANTENCOMPUTING FREIGESCHALTET!",
      "bodyHtml": "Deine Forscher haben die Grenzen der klassischen Berechnung durchbrochen.<br>Mit Quantencomputing beugt sich die Realit\u00e4t selbst, um Prozesse zu optimieren.<br>Dieser Fortschritt wird es uns erm\u00f6glichen, Ressourcen viel schneller zu extrahieren<br><br><span class='green-ready-text'>Stufe 2 AutoK\u00e4ufer Freigeschaltet!</span>"
    },
    "rocketComposites": {
      "title": "RAKETENVERBINDUNGEN!",
      "bodyHtml": "Wissenschaftler haben neue Materialien entwickelt, die im fortschrittlichen Abbau verwendet werden k\u00f6nnen, sowohl hier als auch auf Asteroiden!<br>Mit dieser Technologie kannst du jetzt eine Startrampe und Raketen bauen!<br>Nicht nur das, sondern du hast jetzt auch Zugang zu der fortschrittlichsten Extraktionsmaschinerie am Boden!<br><br><span class='green-ready-text'>Startrampe und Raketen Freigeschaltet!</span><br><span class='green-ready-text'>Stufe 3 und 4 AutoK\u00e4ufer Freigeschaltet!</span>"
    },
    "compoundMachining": {
      "title": "AUTOMATISIERTE VERBINDUNGSHERSTELLUNG!",
      "bodyHtml": "Unsere Wissenschaftler haben es wieder geschafft! Jetzt haben wir fortschrittliche Maschinerie, die automatisch<br>Verbindungen nach Belieben herstellen kann. Das ist in der Tat extrem leistungsf\u00e4hig!<br>Wenn wir jetzt die Galaxis nicht erobern k\u00f6nnen, ist es deine Schuld!<br><br><span class='green-ready-text'>Automatisierte Verbindungsherstellung Freigeschaltet!</span>"
    },
    "atmosphericTelescopes": {
      "title": "WELTRAUMBERGBAU FREIGESCHALTET!",
      "bodyHtml": "Du hast erfolgreich Optik entwickelt, die Sterne und Asteroiden scannen kann<br>Vielleicht k\u00f6nnen wir diese Asteroiden zu unserem Vorteil nutzen und sie abbauen!<br>Wir werden unseren Traum verwirklichen, zu den Sternen zur\u00fcckzukehren!<br><br><span class='green-ready-text'>Weltraumbergbau-Tab Freigeschaltet!</span>"
    },
    "basicPowerGeneration": {
      "title": "ENERGIE FREIGESCHALTET!",
      "bodyHtml": "Deine Ingenieure haben die Kraft gespeicherter Ressourcen nutzbar gemacht<br>um Energie f\u00fcr fortschrittliche Systeme und Automatisierung zu erzeugen.<br>Dies markiert einen entscheidenden Schritt in Richtung einer nachhaltigen Zukunft und er\u00f6ffnet M\u00f6glichkeiten, die bislang nicht verf\u00fcgbar waren.<br><br><span class='green-ready-text'>Energie-Tab Freigeschaltet!</span>"
    },
    "stellarCartography": {
      "title": "INTERSTELLAR FREIGESCHALTET!",
      "bodyHtml": "Deine Ingenieure haben begonnen, die Sterne zu kartieren!<br>Mit dieser F\u00e4higkeit wirst du eines Tages eine Referenz haben, um die Galaxis zu erkunden und zu kolonisieren!<br><br><span class='green-ready-text'>Interstellarer Tab Freigeschaltet!</span>"
    },
    "knowledgeSharing": {
      "title": "TECHNIKFORSCHUNG!",
      "bodyHtml": "Die Menschen kommen zusammen, um Wissen zu teilen!<br>Wissenschaftliche Forschung wird mit neuen Wissenschaftsklubs, in denen Enthusiasten<br>sich treffen und ihre Ideen entwickeln k\u00f6nnen, viel schneller voranschreiten!<br><br><span class='green-ready-text'>Wissenschaftsklubs Freigeschaltet!</span>"
    }
  },
  "it": {
    "compounds": {
      "title": "COMPOSTI SBLOCCATI!",
      "bodyHtml": "I tuoi Scienziati hanno sperimentato combinando Risorse di Idrogeno e Carbonio,<br>e hanno scoperto il Diesel!  Con questa conoscenza, sono sicuri che<br>seguiranno altri di questi Composti.<br><br><span class='green-ready-text'>Scheda Composti Sbloccata!</span>"
    },
    "scienceLaboratories": {
      "title": "LABORATORI SCIENTIFICI!",
      "bodyHtml": "Gli scienziati ora hanno laboratori dedicati per svolgere i loro esperimenti.<br>La ricerca decoller\u00e0 con questo progresso!<br><br><span class='green-ready-text'>Laboratori Scientifici Sbloccati!</span>"
    },
    "quantumComputing": {
      "title": "COMPUTAZIONE QUANTISTICA SBLOCCATA!",
      "bodyHtml": "I tuoi Ricercatori hanno oltrepassato i confini della computazione classica.<br>Con la Computazione Quantistica, la realt\u00e0 stessa si piega per ottimizzare i processi.<br>Questo progresso ci permetter\u00e0 di estrarre Risorse molto pi\u00f9 velocemente<br><br><span class='green-ready-text'>AutoAcquisti Livello 2 Sbloccati!</span>"
    },
    "rocketComposites": {
      "title": "COMPOSITI PER RAZZI!",
      "bodyHtml": "Gli scienziati hanno sviluppato nuovi materiali che possono essere usati nell'Estrazione avanzata, sia qui che sugli Asteroidi!<br>Con questa tecnologia ora puoi costruire una Piattaforma di Lancio e Razzi!<br>Non solo, ma ora hai anche accesso alla macchinaria di estrazione pi\u00f9 avanzata a terra!<br><br><span class='green-ready-text'>Piattaforma di Lancio e Razzi Sbloccati!</span><br><span class='green-ready-text'>AutoAcquisti Livello 3 e 4 Sbloccati!</span>"
    },
    "compoundMachining": {
      "title": "CREAZIONE AUTOMATIZZATA DI COMPOSTI!",
      "bodyHtml": "I nostri scienziati l'hanno fatto di nuovo! Ora abbiamo macchinario avanzato capace di creare automaticamente<br>Composti a volont\u00e0. Questo \u00e8 davvero estremamente potente!<br>Se non possiamo conquistare la Galassia ora, \u00e8 colpa tua!<br><br><span class='green-ready-text'>Creazione Automatizzata di Composti Sbloccata!</span>"
    },
    "atmosphericTelescopes": {
      "title": "ESTRAZIONE SPAZIALE SBLOCCATA!",
      "bodyHtml": "Hai sviluppato con successo ottiche capaci di scansionare le Stelle e gli Asteroidi<br>Forse possiamo usare questi Asteroidi a nostro vantaggio e estrarli!<br>Realizzeremo il nostro sogno di tornare alle stelle!<br><br><span class='green-ready-text'>Scheda Estrazione Spaziale Sbloccata!</span>"
    },
    "basicPowerGeneration": {
      "title": "ENERGIA SBLOCCATA!",
      "bodyHtml": "I tuoi Ingegneri hanno sfruttato il potere delle Risorse memorizzate<br>per generare Energia per sistemi avanzati e automazione.<br>Questo segna un passo fondamentale verso un futuro sostenibile, e apre possibilit\u00e0 non disponibili fino ad ora.<br><br><span class='green-ready-text'>Scheda Energia Sbloccata!</span>"
    },
    "stellarCartography": {
      "title": "INTERSTELLARE SBLOCCATO!",
      "bodyHtml": "I tuoi Ingegneri hanno iniziato a mappare le Stelle!<br>Con questa capacit\u00e0, un giorno avrai un riferimento per esplorare e Colonizzare la Galassia!<br><br><span class='green-ready-text'>Scheda Interstellare Sbloccata!</span>"
    },
    "knowledgeSharing": {
      "title": "RICERCA TECNOLOGICA!",
      "bodyHtml": "La gente si sta riunendo per condividere conoscenza!<br>La ricerca scientifica avanzer\u00e0 molto pi\u00f9 velocemente con nuovi Club Scientifici dove appassionati<br>possono riunirsi e sviluppare le loro idee!<br><br><span class='green-ready-text'>Club Scientifici Sbloccati!</span>"
    }
  },
  "fr": {
    "compounds": {
      "title": "COMPOS\u00c9S D\u00c9BLOQU\u00c9S!",
      "bodyHtml": "Tes Scientifiques ont exp\u00e9riment\u00e9 en combinant des Ressources d'Hydrog\u00e8ne et de Carbone,<br>et ont d\u00e9couvert le Diesel!  Avec cette connaissance, ils sont s\u00fbrs que<br>plus de ces Compos\u00e9s suivront.<br><br><span class='green-ready-text'>Onglet Compos\u00e9s D\u00e9bloqu\u00e9!</span>"
    },
    "scienceLaboratories": {
      "title": "LABORATOIRES SCIENTIFIQUES!",
      "bodyHtml": "Les scientifiques ont maintenant des laboratoires d\u00e9di\u00e9s pour mener leurs exp\u00e9riences.<br>La recherche va d\u00e9coller avec cette avanc\u00e9e!<br><br><span class='green-ready-text'>Laboratoires Scientifiques D\u00e9bloqu\u00e9s!</span>"
    },
    "quantumComputing": {
      "title": "INFORMATIQUE QUANTIQUE D\u00c9BLOQU\u00c9E!",
      "bodyHtml": "Tes Chercheurs ont franchi les limites du calcul classique.<br>Avec l'Informatique Quantique, la r\u00e9alit\u00e9 elle-m\u00eame se plie pour optimiser les processus.<br>Cette avanc\u00e9e nous permettra d'extraire des Ressources beaucoup plus vite<br><br><span class='green-ready-text'>AutoAcheteurs Niveau 2 D\u00e9bloqu\u00e9s!</span>"
    },
    "rocketComposites": {
      "title": "COMPOSITES DE FUS\u00c9ES!",
      "bodyHtml": "Les scientifiques ont d\u00e9velopp\u00e9 de nouveaux mat\u00e9riaux qui peuvent \u00eatre utilis\u00e9s dans l'Extraction avanc\u00e9e, ici et sur les Ast\u00e9ro\u00efdes!<br>Avec cette technologie tu peux maintenant construire une Plateforme de Lancement et des Fus\u00e9es!<br>Non seulement cela, mais tu as maintenant acc\u00e8s \u00e0 la machinerie d'extraction la plus avanc\u00e9e au sol aussi!<br><br><span class='green-ready-text'>Plateforme de Lancement et Fus\u00e9es D\u00e9bloqu\u00e9es!</span><br><span class='green-ready-text'>AutoAcheteurs Niveau 3 et 4 D\u00e9bloqu\u00e9s!</span>"
    },
    "compoundMachining": {
      "title": "CR\u00c9ATION AUTOMATIS\u00c9E DE COMPOS\u00c9S!",
      "bodyHtml": "Nos scientifiques l'ont encore fait! Maintenant nous avons une machinerie avanc\u00e9e capable de cr\u00e9er automatiquement<br>des Compos\u00e9s \u00e0 volont\u00e9. C'est vraiment extr\u00eamement puissant!<br>Si nous ne pouvons pas conqu\u00e9rir la Galaxie maintenant, c'est de ta faute!<br><br><span class='green-ready-text'>Cr\u00e9ation Automatis\u00e9e de Compos\u00e9s D\u00e9bloqu\u00e9e!</span>"
    },
    "atmosphericTelescopes": {
      "title": "EXPLOITATION MINI\u00c8RE SPATIALE D\u00c9BLOQU\u00c9E!",
      "bodyHtml": "Tu as d\u00e9velopp\u00e9 avec succ\u00e8s des optiques capables de scanner les \u00c9toiles et Ast\u00e9ro\u00efdes<br>Peut-\u00eatre pouvons-nous utiliser ces Ast\u00e9ro\u00efdes \u00e0 notre avantage et les exploiter!<br>Nous r\u00e9aliserons notre r\u00eave de retourner aux \u00e9toiles!<br><br><span class='green-ready-text'>Onglet Exploitation Mini\u00e8re Spatiale D\u00e9bloqu\u00e9!</span>"
    },
    "basicPowerGeneration": {
      "title": "\u00c9NERGIE D\u00c9BLOQU\u00c9E!",
      "bodyHtml": "Tes Ing\u00e9nieurs ont exploit\u00e9 la puissance des Ressources stock\u00e9es<br>pour g\u00e9n\u00e9rer de l'\u00c9nergie pour les syst\u00e8mes avanc\u00e9s et l'automatisation.<br>Cela marque une \u00e9tape d\u00e9cisive vers un avenir durable, et ouvre des possibilit\u00e9s indisponibles jusqu'\u00e0 pr\u00e9sent.<br><br><span class='green-ready-text'>Onglet \u00c9nergie D\u00e9bloqu\u00e9!</span>"
    },
    "stellarCartography": {
      "title": "INTERSTELLAIRE D\u00c9BLOQU\u00c9!",
      "bodyHtml": "Tes Ing\u00e9nieurs ont commenc\u00e9 \u00e0 cartographier les \u00c9toiles!<br>Avec cette capacit\u00e9, tu auras un jour une r\u00e9f\u00e9rence pour explorer et Coloniser la Galaxie!<br><br><span class='green-ready-text'>Onglet Interstellaire D\u00e9bloqu\u00e9!</span>"
    },
    "knowledgeSharing": {
      "title": "RECHERCHE TECHNOLOGIQUE!",
      "bodyHtml": "Les gens se r\u00e9unissent pour partager des connaissances!<br>La recherche scientifique progressera beaucoup plus vite avec de nouveaux Clubs Scientifiques o\u00f9 passionn\u00e9s<br>peuvent se r\u00e9unir et d\u00e9velopper leurs id\u00e9es!<br><br><span class='green-ready-text'>Clubs Scientifiques D\u00e9bloqu\u00e9s!</span>"
    }
  }
} satisfies Record<LocaleId, Record<ResearchUnlockResultDialogId, SourceDialog>>;

const CONFIRM_LABELS: Readonly<Record<LocaleId, string>> = {
  "en": "CONFIRM",
  "es": "CONFIRMAR",
  "pt": "CONFIRMAR",
  "de": "BEST\u00c4TIGEN",
  "it": "CONFERMA",
  "fr": "CONFIRMER"
};

const TECHNOLOGY_DIALOG_IDS: Partial<Record<TechId, ResearchUnlockResultDialogId>> = {
  compounds: "compounds",
  scienceLaboratories: "scienceLaboratories",
  quantumComputing: "quantumComputing",
  rocketComposites: "rocketComposites",
  atmosphericTelescopes: "atmosphericTelescopes",
  basicPowerGeneration: "basicPowerGeneration",
  stellarCartography: "stellarCartography",
  knowledgeSharing: "knowledgeSharing",
};

function plainText(sourceHtml: string): string {
  return sourceHtml
    .replace(/<br\s*\/?\s*>/giu, "\n")
    .replace(/<\/?span\b[^>]*>/giu, "")
    .replace(/<[^>]+>/gu, "")
    .trim();
}

export function researchUnlockResultDialog(
  locale: LocaleId,
  id: ResearchUnlockResultDialogId,
): RandomEventDialogCopy {
  const source = SOURCE_DIALOGS[locale][id];
  const greenLines = new Set(
    [...source.bodyHtml.matchAll(/<span\s+class=['"]green-ready-text['"]>([\s\S]*?)<\/span>/giu)]
      .map((match) => plainText(match[1] ?? "")),
  );
  const paragraphs = plainText(source.bodyHtml)
    .split(/\n\s*\n/gu)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const [summary = "", ...remainingParagraphs] = paragraphs;
  const lines = remainingParagraphs.flatMap((paragraph) =>
    paragraph
      .split(/\n/gu)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((text) => ({
        text,
        ...(greenLines.has(text) ? { tone: "green-ready-text" as const } : {}),
      })),
  );
  return { title: source.title, summary, lines, confirmLabel: CONFIRM_LABELS[locale] };
}

export function researchUnlockResultDialogForTechnology(
  locale: LocaleId,
  technologyId: TechId,
): RandomEventDialogCopy | null {
  const dialogId = TECHNOLOGY_DIALOG_IDS[technologyId];
  return dialogId ? researchUnlockResultDialog(locale, dialogId) : null;
}

export const LOCALIZATION_VALIDATION_DATA = { SOURCE_DIALOGS } as const;
