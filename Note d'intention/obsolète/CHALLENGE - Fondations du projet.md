# CHALLENGE — Fondations de Shut Up & Carry!
### Relecture critique de l'ensemble des notes d'intention
*Base : les 5 documents de `Note d'intention`, le GDD unifié, et le vault Obsidian (LOG, BACKLOG, SYS).*

---

## 📌 État des arbitrages au 2026-07-27

> *Les quatre points bloquants ont été traités. Le texte critique ci-dessous est conservé comme trace du raisonnement — il ne décrit plus l'état du projet.*

| Point | Statut | Résolution |
|---|---|---|
| 🔴 1 — Simulateur de chuchotement | ✅ **Tranché** | Règle du dilemme sonore inscrite au Pilier 1, **opposable au niveau du contrat** et satisfiable par trois leviers alternatifs. Piste *Minuterie* ouverte comme levier systémique. |
| 🔴 2 — Équité vocale | ✅ **Tranché** | RMS + normalisation par joueur. **Deux voies audio** : analyse sur signal brut, communication sur signal traité — le préprocessing (VAD/AGC/débruitage) détruirait chuchotements et sons percussifs. Consigné au `LOG`, vérification API Dissonance au `BACKLOG`. |
| 🔴 3 — Direction artistique | ✅ **Tranché** | **Le déménageur**, univers anachronique. Le Casque-Égaliseur devient le **Sonomètre Réglementaire** — la fonction est intégralement conservée. |
| 🔴 4 — La Bombe de Saisie | ✅ **Tranché** | Abandonnée. Diagnostic révisé : le défaut n'était pas l'habillage mais la **forme** — un timer-corvée détaché du métier. **La nuit reste le seul timer** ; le besoin de bruit passe dans le travail lui-même (Minuterie, Monte-meuble). |
| 🟠 5 — Plafond de 8 joueurs | ⏳ En attente | Reco : 4 en cible, tester 6. |
| 🟠 6 — R.E.P.O. non cité | ✅ **Traité** | Tableau concurrentiel intégré en §1.6 du pitch. |
| 🟠 7 — Reconnaissance de mélodie | ✅ **Traité** | Verrouillé dans les non-objectifs (§1.9) : jamais de sémantique, jamais de justesse, uniquement le signal. |
| 🟠 8 — Permadeath de campagne | ⏳ En attente | Reco : mode « Retraité » à 5 étoiles, et remontée rapide après wipe. |
| 🟡 9 à 16 | ⏳ En attente | Reportés au journal des arbitrages du pitch (§ fin de document). |

**Décision ajoutée hors de cette liste :** la **portée du bruit n'est jamais affichée** au joueur — apprentissage par essai-erreur, seul retour = la réaction du monstre. Le sonomètre mesure ce que vous émettez, jamais ce que ça provoque. *(§1.9 + `LOG`)*

---

## Ce qui est solide et qu'il ne faut pas toucher

Avant de démolir quoi que ce soit, il faut nommer ce qui tient. Trois choses dans ce projet sont au-dessus du lot :

1. **La grille à trois briques** (paramètre d'entrée × mode de déclenchement × réaction physique). C'est le meilleur morceau de design de tout le corpus. Elle est data-driven, extensible, et transforme « j'ai plein d'idées de meubles rigolos » en un **système**. Le paragraphe « si un objet ne se décrit pas dans la grille, c'est le modèle qu'il faut réinterroger, pas la grille qu'il faut contourner » est exactement la bonne discipline.

2. **Le Casque-Égaliseur.** La waveform du micro affichée sur le personnage résout, en un seul objet diégétique, le problème le plus difficile du jeu : *rendre le son visible*. Sans lui, la Voice-Physics est une boîte noire et les joueurs accuseront le jeu de bugger. Avec lui, chaque erreur est publique et attribuable — d'où les engueulades, d'où les clips. **Cet objet n'est pas un détail de DA, c'est un système d'UX.** Il doit survivre à tout changement de direction artistique.

3. **La règle « plus tu portes, moins tu peux communiquer »** (§2.4.4). Elle fait émerger des rôles sans les imposer, elle crée de la dépendance asymétrique, et elle boucle avec les piliers. Rien à changer.

---

## 🔴 Les quatre points bloquants

*Ceux qui, non tranchés, vont contaminer toute la Partie 2.*

### 🔴 1 — Le jeu peut s'effondrer en simulateur de chuchotement

**Le problème.** Tu as deux systèmes qui punissent le même geste. Crier alourdit l'objet (Voice-Physics) **et** attire le monstre (détection). Ton §2.4.3 le formule d'ailleurs très bien : *« les monstres sont le miroir des objets »*. Sauf qu'un miroir, ici, ce n'est pas de l'élégance : c'est une **double peine**.

Fais le calcul du joueur : si parler ne rapporte jamais rien et coûte toujours quelque chose, la stratégie optimale est le silence total. Or ton pilier dit explicitement que le jeu *« ne récompense pas le silence, il récompense le contrôle »*. À ce stade, c'est une intention, pas un mécanisme. Le jeu, tel qu'écrit, récompense le silence.

**Pourquoi c'est grave.** Le meilleur groupe de joueurs deviendra le plus silencieux. Et un jeu où les meilleurs joueurs ne parlent pas, c'est un jeu où toute la Dissonance Émotionnelle, tout le potentiel de clip, tout le comique disparaît **exactement au moment où les joueurs deviennent bons**. Tu te retrouves avec une courbe d'expérience inversée : le jeu est drôle tant qu'on est mauvais.

**Ce qu'il faut faire.** Ériger le **dilemme sonore** en contrainte de production opposable, au même rang que les piliers :

> *Aucun contrat ne part en production sans au moins un élément qui exige activement du bruit.*

Tu as déjà tout le matériel pour ça, éparpillé dans les notes — il te manque juste la règle qui les rend obligatoires :
- **La Lampe Capricieuse** : silence = noir total. Le silence a un prix.
- **Le Vase de l'Écho** : il faut des claquements de langue pour voir.
- **Le Gouffre Soufflerie** : il faut *hurler* pour s'ancrer au sol.
- **La contre-mesure du chant tenu** face aux monstres : la fuite exige de produire du son.

Le joueur ne doit jamais se demander « est-ce que je me tais ? », mais **« combien de bruit je peux me permettre, maintenant, ici ? »**. C'est une question complètement différente, et c'est celle qui fait le jeu.

> *Et là, la formule « les monstres sont le miroir des objets » devient juste — parce que le miroir a enfin deux faces.*

---

### 🔴 2 — L'équité vocale n'est pas traitée, et elle est fatale

**Le problème.** Nulle part dans les notes ni dans le LOG technique il n'est question de **normaliser les voix entre joueurs**. Le LOG parle de bandes de fréquence absolues (`<100Hz, 100-500Hz, 500-2kHz, >2kHz`) et de seuils par objet. C'est un piège.

Concrètement :
- Le **Matelas à Mémoire de Ton** (« voix grave = glisse, voix aiguë = trampoline ») avantage structurellement les voix graves. Ce n'est pas une difficulté, c'est une **inégalité de traitement selon la morphologie du joueur**. Deux amis, même effort, résultats différents.
- Le **volume** est pire encore : quelqu'un avec un micro mal réglé « crie » en permanence sans avoir élevé la voix une seule fois. Il sera puni sans comprendre pourquoi, et il accusera le jeu — à raison.

**Pourquoi c'est grave.** C'est le genre de défaut qui ne se voit pas en développement solo (tu testes avec ta propre voix) et qui explose au premier playtest à quatre. Et il touche le cœur du jeu : si le joueur ne fait pas confiance à la mesure, il ne fait plus confiance à la mécanique.

**Ce qu'il faut faire.** Une **calibration par joueur au premier lancement** — mesure du niveau de repos, du pitch médian, du niveau de cri. Ensuite, *tous* les seuils du jeu s'expriment en **écart relatif à cette référence personnelle**, jamais en hertz ou en décibels absolus.

Ça a trois conséquences immédiates :
- La calibration entre dans le prototype, pas dans la liste des polish.
- L'architecture audio (`SYS - Audio & Voix`) doit prévoir un profil par joueur transmis au host.
- Le mutateur « Atmosphère à l'Hélium » s'applique **après** normalisation — sinon il ne fait qu'aggraver l'inégalité au lieu de créer un défi commun.

**Bénéfice inattendu :** la calibration devient un moment de jeu. Faire crier le joueur dans son micro au premier lancement, c'est déjà lui apprendre la règle du jeu.

---

### 🔴 3 — Deux directions artistiques incompatibles cohabitent

**Le problème.** Le corpus contient deux jeux différents.

| | Version « spatiale » *(anciennes notes)* | Version « anachronique » *(Partie 1 actuelle)* |
|---|---|---|
| Lieu | Dimensions cosmiques qui s'effondrent | Patchwork d'époques et de genres |
| Personnage | Scaphandre, combinaison rafistolée au scotch, casque à visière LED | Déménageur cliché : salopette, ceinture lombaire, gants |
| Ennemis | « Les Bibliothécaires », entités cosmiques | Créatures reskinnées par biome |
| Clients | Créatures cosmiques, entités interdimensionnelles | Vampires, momies, sorciers, gobelins, fées |
| Registre | Sci-fi lo-fi, « blue-collar de l'espace » | Fantastique domestique, façon Overcooked |
| Timer | Bombe de Saisie qui fait s'effondrer la dimension | Tombée de la nuit |

Ce ne sont pas deux variantes : ce sont **deux univers qui ne partagent presque rien**. Et le glissement s'est fait silencieusement, sans décision écrite.

**Mon avis, tranché.** La version anachronique est la meilleure, pour trois raisons :
- Le **déménageur en salopette** est infiniment plus lisible et plus drôle qu'un astronaute. Le comique du jeu vient du *sérieux professionnel appliqué à l'absurde* — un type avec une ceinture lombaire qui chuchote à un canapé, c'est le pitch en une image. Un astronaute, c'est juste de la sci-fi de plus.
- Le **patchwork d'époques** est un permis de production illimité : tu peux ajouter n'importe quel biome sans justification narrative. La cohérence cosmique, elle, t'oblige à te justifier à chaque nouvelle idée.
- Vampires et momies sont **culturellement pré-chargés** : le joueur sait déjà à quoi s'attendre, tu économises toute l'exposition.

**Mais il faut sauver le Casque-Égaliseur.** C'est le seul élément indispensable de l'ancienne DA. Il se re-diégétise sans effort : un **casque de chantier à visière**, ou une **plaque LED de badge d'employé** sur la poitrine, ou un **brassard fluo** qui pulse avec la voix. L'objet change, la fonction reste : *rendre la voix visible et attribuable*.

**Décisions à prendre dans la foulée :**
- « Karma Logistics » ou « Karma Logistique » — les deux graphies circulent. La version anglaise sonne plus corporate, plus internationale, et fonctionne mieux sur un logo. **Recommandation : Karma Logistics.**
- « Les Bibliothécaires » — un excellent nom, mais il appartient à l'univers cosmique. Dans un manoir de vampire, il ne veut plus rien dire. **À conserver comme nom d'*un* monstre spécifique (celui de la bibliothèque, du manoir), pas comme nom générique de l'espèce.**

---

### 🔴 4 — La Bombe de Saisie a disparu, et c'était ta meilleure boucle

**Le problème.** Dans toutes tes anciennes notes, le timer de mission est une **Bombe de Saisie** : posée près du camion, elle bipe de plus en plus vite, et un joueur doit régulièrement sortir du bâtiment pour lui **chanter une berceuse** et gagner du temps. Dans la Partie 1 actuelle, ce système a été remplacé par « la tombée de la nuit ».

Tu as troqué un système **actif** contre un système **passif**. Regarde ce que la bombe produisait, et que la nuit ne produit pas :

- **Elle force un va-et-vient.** Quelqu'un doit *quitter* le groupe. L'équipe se fragmente, se dégarnit, se met en danger. C'est du level design gratuit.
- **Elle crée un rôle tournant** — « c'est ton tour d'aller chanter » — et donc des négociations, des lâchetés, des sacrifices.
- **Elle est cohérente avec le pilier.** Le timer se recharge *à la voix*. C'est le seul système de ton jeu où **faire du bruit est explicitement l'objectif**. C'est-à-dire : c'est le remède au problème 🔴1, et tu l'as supprimé.
- **Elle est ridicule et magnifique.** Un déménageur qui sort en courant dans le jardin pour chanter « Fais dodo » à une bombe pendant que ses potes hurlent à l'intérieur — c'est *le* clip du jeu.
- **Sa spirale (3 min → 45 s) donne un rythme dramatique** que « la nuit tombe » n'a pas. La nuit est une ligne droite ; la bombe est une accélération.

Et ce qu'elle coûtait : elle est un peu tirée par les cheveux narrativement, et « la nuit » est plus élégant, plus sobre, plus Lethal Company.

**C'est justement le problème : plus Lethal Company.** Tu as remplacé ton idée par celle du jeu auquel tu vas être comparé.

**Ma recommandation — les deux, à des échelles différentes :**
- **La tombée de la nuit** reste le cadre narratif et la limite dure du contrat. Elle est belle, lisible, et elle justifie la fin de mission.
- **Un objet-timer rechargeable à la voix** revient à l'intérieur de ce cadre, sous une forme re-diégétisée compatible avec la nouvelle DA. Ce n'est plus une bombe cosmique : c'est **le camion**. Le camion doit être maintenu en marche — un moteur capricieux qu'il faut aller *rassurer* à voix douce, sinon il cale et le départ est retardé. Ou : un **contrat administratif** qui s'auto-annule s'il n'est pas contresigné vocalement toutes les X minutes, façon bureaucratie absurde.

Le nom change, la mécanique reste. Et tu récupères ta meilleure boucle.

---

## 🟠 Les tensions à surveiller

### 🟠 5 — Le plafond de 8 joueurs est un piège
Ton pilier « Coopération sous Contrainte » repose sur le fait qu'**un seul joueur indiscipliné compromet tout le groupe**. À 4, c'est un accident : c'est drôle, c'est racontable, on désigne un coupable. À 8, ce n'est plus un accident, c'est une **certitude statistique** — il y aura toujours quelqu'un qui parle. La faute cesse d'être imputable, et le comique devient de la frustration. Tu perds le débriefing, tu perds l'engueulade, tu perds le pilier.

Le LOG technique valide par ailleurs la FFT serveur « pour <8 joueurs », ce qui veut dire que 8 est déjà le plafond dur, pas la cible confortable.

**Recommandation : 4 joueurs comme cible de design ferme. Tester 6. Ne promettre 8 nulle part avant de l'avoir joué.** Il est toujours possible d'annoncer plus tard qu'on monte à 6 ; il est impossible de retirer un chiffre d'une page Steam sans se faire incendier.

### 🟠 6 — R.E.P.O. existe, et tu ne le cites nulle part
Ton document dit : *« Nous n'avons pas trouvé de jeu qui utilise le micro comme outil de contrôle physique. »* C'est **vrai au sens strict**, et c'est ta force. Mais la phrase est fragile parce qu'elle ne montre pas que tu as cherché.

R.E.P.O. (2025) fait : coop, extraction d'objets fragiles, physique de préhension, micro de proximité, ennemis attirés par la voix. Content Warning (2024) fait : coop, micro central, horreur comique, boucle d'extraction. **L'espace mental du joueur est déjà occupé.** Ton innovation est réelle mais elle est *fine* : chez eux la voix **alerte**, chez toi la voix **déforme la matière**. C'est une différence énorme en jeu, et invisible sur une capture d'écran.

**Deux conséquences :**
1. Cite-les, dans le document et dans tout pitch externe. Un pitch qui nomme ses concurrents et explique précisément l'écart est infiniment plus crédible qu'un pitch qui dit « personne ne l'a fait ».
2. **Le premier trailer doit montrer la Voice-Physics avant de montrer un monstre.** Si le spectateur voit d'abord un couloir sombre et un micro, il a déjà classé ton jeu.

Et cite aussi ce qui te donne raison : **One Hand Clapping** (2021) prouve que le pitch de la voix est un axe de contrôle jouable ; **Don't Scream** (2023) prouve que « retenir son cri » est viral. Ces deux titres sont des arguments *pour* toi.

### 🟠 7 — La reconnaissance de mélodie : bien vu, mais à verrouiller par écrit
Ton §2.4.3 propose, à raison, de détecter *« un son tenu, stable, dans une bande de fréquence »* plutôt que de reconnaître une berceuse. C'est le bon arbitrage — mais il n'est écrit qu'en « piste ouverte », et il risque de se faire réécraser par la version romantique (« il faut chanter *Fais dodo* ») qui traîne partout ailleurs dans le corpus.

**À graver dans les non-objectifs :** le jeu n'écoute jamais *ce que* tu dis ni *quelle note* tu chantes. Il n'écoute que le **signal**. Sinon tu importes : la dépendance à la langue, la dépendance à l'accent, la punition des gens qui chantent faux, et une charge technique disproportionnée.

### 🟠 8 — La mort de la campagne est plus punitive que tu ne le crois
Ton §1.4 prévoit un point de non-retour : dernière étoile perdue = fin de l'aventure. C'est fort narrativement. Mais c'est un **wipe de sauvegarde dans un jeu de soirée entre amis** — et il arrive potentiellement après 20 heures de campagne partagée.

Lethal Company se le permet parce qu'un run dure une heure. Ici, tu effaces des semaines de soirées, et probablement pas pour le joueur qui a fait la faute.

**Deux garde-fous à considérer :**
- La perte totale doit être **rapide à rejouer** : après un wipe, remonter à 3 étoiles doit prendre une soirée, pas dix.
- Ou la faire porter par **l'équipe qui a lancé la partie**, pas par les sauvegardes individuelles, pour que personne ne perde sa progression personnelle à cause d'un ami.

Et symétriquement, à l'autre bout : **5 étoiles ne doit pas être un écran de fin.** Un party-game n'a pas de fin, il a des soirées. La retraite doit débloquer un mode sans fin, pas fermer la boutique.

---

## 🟡 Les trous à combler

| # | Trou | Pourquoi ça compte |
|---|---|---|
| 9 | **Aucune durée de contrat n'est écrite nulle part** | C'est le chiffre-clé d'un party-game. 12 min et 25 min ne donnent pas le même jeu, pas le même level design, pas la même courbe de tension. À décider avant de dessiner la première map. |
| 10 | **Le mode solo n'est jamais tranché** | Il conditionne tout le catalogue d'objets : si le solo existe, aucun objet ne peut être « collectif obligatoire ». C'est structurel, pas cosmétique. |
| 11 | **Le pilier « Sabotage Systémique » a disparu des piliers actuels** | C'était pourtant ton argument de faisabilité en solo : la profondeur naît de la combinatoire, pas du contenu. Il mérite d'être réintégré, au moins comme sous-principe du pilier « Coopération sous Contrainte ». *(fait dans la version complétée)* |
| 12 | **L'intégration Twitch flotte entre pilier et bonus** | Elle apparaît dans les notes avec le même poids que la Voice-Physics. C'est un accélérateur marketing, pas une mécanique cœur. À déclasser explicitement, sinon elle va parasiter tes priorités de dev. |
| 13 | **Le « Troll Audio »** (faux sons Discord/Windows dans l'ambiance) | Excellente idée pour les streamers, mais c'est une mécanique qui **casse la confiance du joueur envers son propre système d'exploitation**. À réserver à un mutateur opt-in, jamais au jeu de base. |
| 14 | **La TV Perroquet enregistre et rejoue la voix des joueurs** | Aucun risque en P2P sans stockage, mais à documenter clairement : rien n'est écrit sur disque, rien ne quitte la session. Autant l'écrire une fois maintenant. |
| 15 | **Deux variantes du Frigo coexistent** (Explosif / Fusée) | Signalé dans le GDD unifié, jamais tranché. La variante **Fusée** est meilleure : elle a une montée en tension (stable → tremble → explose) là où l'Explosif est un interrupteur binaire. |
| 16 | **Le Miroir Paranoïaque a deux versions** | Ancienne : il *inverse les touches de direction*. Récente : il *tire sur les côtés*. **Garder la récente.** Inverser les contrôles est une punition qui vient des mains, pas de la voix — ça viole ta propre règle transversale (« toute la friction vient de la voix, jamais des contrôles »). |

---

## Les trois questions auxquelles répondre avant d'écrire la suite

1. **Est-ce que faire du bruit rapporte quelque chose ?** *(🔴1)* — Si la réponse n'est pas un système écrit et opposable, le jeu se refermera sur lui-même.
2. **Est-ce que deux joueurs aux voix opposées vivent le même jeu ?** *(🔴2)* — Sans normalisation, non. Et ça se verra au premier playtest.
3. **Quel jeu tu fais : le déménageur en salopette, ou l'ouvrier de l'espace ?** *(🔴3)* — Les deux sont bons. Un seul peut exister, et tout le reste du GDD en découle.
