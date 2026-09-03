# SHUT UP & CARRY !

**Game Design Document — Version de travail**

> **Statut du document.** Document vivant. Les sections marquées *(à définir)* sont volontairement laissées ouvertes : elles seront remplies au fur et à mesure des arbitrages. Les **points ouverts** en fin de section listent les décisions identifiées mais non tranchées. Aucune section n'est écrite pour faire nombre.

---

# PARTIE 1 : LE PITCH (High Concept)

## 1.1. Fiche d'identité

| | |
|---|---|
| **Titre du jeu** | Shut Up & Carry ! |
| **Genres** | Party-Game / Action-Physique / Horreur Comique Coopératif |
| **Plateforme cible** | PC — Steam |
| **Public cible** | Créateurs de contenu (Twitch/YouTube), groupes d'amis, fans de Lethal Company / Phasmophobia |
| **Moteur / Technologie** | Unity 6.3 |
| **Joueurs** | 2 à 8 |

## 1.2. Le Logline (Pitch Elevator)

Vous et vos amis êtes les pires employés de **Karma Logistics**, une entreprise de déménagement interdimensionnelle sous-payée. Votre mission ? Vider les appartements de créatures cosmiques ou de sorciers excentriques. Le problème, c'est que les meubles sont vivants, maudits, et surtout… hypersensibles au bruit.

## 1.3. Les Piliers du Jeu (Game Pillars)

### La Mécanique Centrale : la « Voice-Physics »

Le jeu utilise le microphone des joueurs non pas seulement pour communiquer (chat vocal de proximité), mais comme un **contrôleur physique**. Le poids, la texture et le comportement des objets portés réagissent en temps réel au volume et au pitch de la voix des joueurs IRL.

> **Règle d'or : la panique entraîne le bruit. Le bruit entraîne le chaos. Le chaos entraîne la chute.**

**Corollaire :** le jeu ne récompense pas le silence, il récompense le **contrôle**. Si se taire était toujours la meilleure stratégie, tout le reste du jeu deviendrait décoratif. Chaque contrat doit donc contenir au moins un élément qui oblige les joueurs à produire du son (règle détaillée en 2.4.1).

### La Dissonance Émotionnelle

Le jeu force des situations absurdes où un joueur doit chuchoter une berceuse pendant que ses coéquipiers hurlent de terreur. Ce décalage se joue à deux niveaux : **à l'intérieur de chacun**, qui lutte contre sa propre panique pour garder la voix calme, et **entre les joueurs**, dont les états émotionnels se percutent en direct.

L'oscillation constante entre terreur et contrôle de soi crée des moments cinématiques involontaires : un joueur qui tremble de peur en essayant de chanter doucement, un coéquipier qui étouffe un rire pour ne pas réveiller le monstre, une équipe entière figée dans le silence absolu alors qu'une créature fait trembler les murs.

### La Coopération sous Contrainte

On ne réussit qu'ensemble, mais nos actions se gênent mutuellement. Les objets lourds se portent à plusieurs et les objectifs exigent une vraie coordination, mais la voix de chacun affecte tout le groupe : il ne suffit pas de bien faire sa part, encore faut-il composer avec les autres.

C'est de cette friction que naissent les moments dont on se souvient : les fous rires, les engueulades, les « CHUUUT ! » hurlés un peu trop fort. Trois joueurs stabilisent un meuble pendant qu'un quatrième, à côté, jure à voix haute et fait tout basculer.

### La Maîtrise Progressive du Chaos

Au début, tout est subi. L'environnement est imprévisible, les maps changent à chaque partie, et la panique dicte sa loi. Mais peu à peu, les joueurs apprennent à apprivoiser les objets, à moduler leur voix, à choisir leurs mots et leur timing. La progression n'est pas dans un arbre de talents : **elle est dans le joueur lui-même**.

Là où une équipe hurlait dans le chaos à ses débuts, elle finit par communiquer en murmures codés et en gestes discrets. C'est cette montée en maîtrise qui donne au jeu sa profondeur et donne envie d'y revenir.

## 1.4. L'expérience de jeu (Synopsis)

Chez Karma Logistics, personne ne vous a formé. On vous confie un camion, une adresse dans une dimension improbable, et une consigne : videz l'appartement avant la tombée de la nuit.

Mais ces appartements ne sont pas ordinaires, et leur mobilier encore moins. Ici, les meubles sont vivants, maudits, et hypersensibles au son. Or dans ce jeu, c'est votre propre voix — captée par votre micro — qui agit sur le monde. Le Canapé de Plomb reste léger tant qu'on le porte en chuchotant, mais un cri le plaque au sol d'un coup. Le Matelas à Mémoire de Ton glisse sagement sous une voix grave, puis se change en trampoline incontrôlable dès qu'un rire aigu lui échappe. Et la Télévision Perroquet écoute en silence, enregistrant l'insulte de trop pour la rediffuser au pire moment. Déménager devient un exercice d'équilibriste vocal, où il faut parler juste assez pour se coordonner, mais jamais assez pour tout réveiller.

Car le silence n'est pas seulement une question de meubles. Des créatures rôdent entre les pièces, guidées par le son. Le joueur vit alors une expérience coopérative en dents de scie : de longues secondes de silence tendu quand la menace approche, le relâchement quand elle s'éloigne, puis le chaos lorsque quelqu'un panique, hurle, et fait tout basculer — le meuble, la mission, le sérieux de la situation. De cette tension naissent les fous rires comme les reproches, dans un jeu où l'on rit de sa propre défaite autant qu'on savoure ses réussites.

La mort n'y est pas douce. Se faire attraper met fin à votre mission, mais pas à votre soirée : les morts rejoignent un espace à part d'où ils observent leurs camarades encore en vie. On repart cependant de zéro à chaque nouveau contrat, tout le monde de retour sur pied — même si ramener un corps a un coût, et qu'un déménagement qui finit à la morgue ne fait jamais très bonne impression sur l'évaluation finale.

## 1.5. Le But et la Progression

Le but est simple à énoncer, difficile à atteindre : **bâtir sa réputation**. On débute au plus bas, une étoile sur cinq, celle des bras cassés qu'on envoie vider un studio de trois mètres carrés. À force de contrats réussis, les avis clients s'accumulent et les étoiles montent. Mais rien n'est acquis : un déménagement bâclé, des objets abîmés, une équipe qui déguerpit à la nuit tombée, et la note dégringole.

À mesure que la réputation grandit, les mondes s'ouvrent : colocations d'étudiants sorciers, manoirs de vampires, tombeaux de momies — plus vastes, plus riches, plus dangereux. Chaque palier apporte ses objets capricieux et ses nouvelles règles à apprivoiser.

**La victoire.** Décrocher les cinq étoiles pleines et réussir un contrat de ce palier, c'est raccrocher le tablier. La campagne se conclut sur une retraite méritée et un générique de fin.

**La défaite.** Une équipe entière capturée, ou surprise sur place à la nuit tombée, voit son contrat sombrer et sa réputation avec. Et il existe un point de non-retour : celui qui, déjà retombé tout en bas de l'échelle, échoue une fois de trop. Sa dernière étoile s'éteint alors — et avec elle, l'aventure. La progression repart de zéro.

*(Conditions détaillées en 2.2.)*

## 1.6. Inspirations et Références

- **Lethal Company** — le socle : le job de l'enfer en entreprise, la coop à 4, le chat de proximité obligatoire et l'esthétique lo-fi / VHS.
- **Moving Out** — la manipulation d'objets encombrants à plusieurs, et la frustration hilarante quand la coordination déraille.
- **Chained Together** — la dépendance forcée entre joueurs, où la maladresse d'un seul condamne tout le groupe.
- **Phasmophobia** (et les mods « Skinwalker ») — la paranoïa liée au son, la peur d'être trahi par sa propre voix.

### La proposition unique : Voice-Physics

Nous n'avons pas trouvé de jeu qui utilise le micro comme outil de contrôle physique de manière aussi fine et structurée. L'idée centrale — transformer chaque bande de fréquence vocale en levier mécanique sur des objets — ouvre des possibilités qu'aucun titre n'a vraiment explorées à ce jour. C'est à la fois une prise de risque et une opportunité.

---

# PARTIE 2 : GAMEPLAY & UNIVERS (Core Game Design)

> **Principe d'organisation.** Tout ce qui peuple un contrat écoute. La Partie 2 range ces éléments par **intention d'écoute** :
> - **2.5 — Le Bestiaire** : ce qui écoute pour te **tuer**.
> - **2.6 — Le Mobilier** : ce qui écoute pour te **trahir**.
> - **2.7 — Objets & Économie** : ce qui écoute pour t'**obéir**.
>
> Ce qui n'écoute pas — géométrie, fosses, obstacles passifs — relève du level design (2.8).

## 2.1. Univers et Narration

### 2.1.1. Le Lore

Le monde de *Shut Up & Carry* est un patchwork d'époques et de genres qui coexistent sans logique apparente. On y croise des créatures fantastiques.

Le joueur est immergé dans une petite entreprise de déménagement, **Karma Logistics**, qui cherche à se faire une réputation pour devenir la référence de son domaine.

**Créatures & univers croisés :** vampires, momies, sorciers, gobelins, fées.

**Ton & ambiance :**
- Ambiance mélangeant sérieux et loufoque, façon *Overcooked*.
- L'humour naît du sérieux avec lequel les personnages traitent des situations délirantes.
- Univers anachronique assumé : contrats reçus par fax, camion qui lévite façon *Retour vers le Futur*, déménager la pyramide d'une momie comme on viderait un studio.
- Un univers où toutes les ambiances peuvent se côtoyer.

> **Le postulat : déménager, c'est déranger. Les lieux qu'on vide ne sont pas inhabités.**

### 2.1.2. Le Protagoniste

Le joueur incarne un déménageur. Look volontairement cliché du métier, lisible au premier coup d'œil, poussé vers le comique.

**Le cliché du déménageur (pistes de skin) :**
- Silhouettes archétypales : le petit gros en salopette, le grand mince, le costaud tatoué…
- Panoplie visuelle : ceinture lombaire, gants.
- Attitude blasée d'ouvrier qui en a vu d'autres.

**Identité visuelle prévue :**
- Choix homme / femme.
- Cosmétiques loufoques (tenues, accessoires) — déblocage / personnalisation.

*L'équipement réglementaire du personnage — le Sonomètre — est décrit en 2.4.5, car il relève du gameplay avant de relever du costume.*

### 2.1.3. Les habitants (fiction)

Les lieux que l'on vide appartiennent à quelqu'un. Ce quelqu'un est encore là.

Les entités qui peuplent les contrats ne sont pas des monstres au sens classique : ce sont **les occupants**. Ils ne chassent pas les joueurs par nature — ils réagissent à une intrusion bruyante dans leur espace. Cette lecture donne au bestiaire sa cohérence narrative et explique pourquoi le silence, et non la force, est la réponse.

Le comportement, les règles d'écoute et les contre-mesures de chaque habitant sont décrits en **2.5 — Le Bestiaire**.

---

## 2.2. La Boucle de Gameplay (Core Loop)

Le jeu s'articule autour de trois boucles imbriquées, à des échelles de temps croissantes. La tension permanente entre contrainte du silence et nécessité d'agir est le moteur émotionnel qui relie l'ensemble.

### 2.2.1. Micro-boucle (moment-to-moment, quelques secondes)

Le cycle d'actions que le joueur répète en continu sur la map :

**Se déplacer / Explorer → Gérer sa voix → Porter**

- **Explorer** : parcourir le lieu pour repérer les meubles à déménager.
- **Gérer sa voix** : communiquer et se coordonner tout en maîtrisant l'impact sonore (Voice-Physics + éveil des menaces).
- **Porter** : saisir les objets et les ramener au camion.

### 2.2.2. Boucle de mission (une manche / un contrat)

**Voter un contrat → Arriver sur la map → Vider le lieu (micro-boucle) → Repartir avant la nuit → Être évalué**

- **Choix du contrat** — 2 à 3 contrats proposés (le nombre et la difficulté dépendent des réussites passées). Vote collectif à la punaise sur le tableau. En cas d'égalité, la voix de l'**Employé du Jour** (cf. 2.9) compte double.
- **Objectif** — Tout vider (métier de déménageur). Un système de quota qualitatif module la note : objets oubliés, objets abîmés, collègues morts… tout influe sur l'évaluation.
- **Extraction** — Retour obligatoire au camion. Le camion peut partir dès qu'un joueur le déclenche (source de chaos volontaire, façon *Lethal Company*). Un timer (tombée de la nuit) force le départ.
- **Évaluation** — Note qui fait stagner / monter / descendre la réputation en étoiles (cf. 2.9).

### 2.2.3. Méta-boucle (progression long terme, plusieurs sessions)

**Évaluation → Réputation (étoiles) → Argent commun → Boutique → Nouveaux contrats plus durs**

- **Réputation en étoiles** : conditionne l'accès aux contrats et le nombre/difficulté des offres. Bien travailler ouvre de meilleurs contrats (plus d'étoiles, plus d'argent).
- **Argent commun** (non individuel) : gagné en mission, dépensé dans la boutique du camion (accessoires, déployables, consommables).
- **Sensation de progression** : difficulté croissante + accumulation d'équipement = montée en puissance ressentie.

### 2.2.4. La mort, les corps et la réimpression

*Cette section regroupe des règles auparavant dispersées dans le document.*

**La capture tue.** Le joueur touché par une menace est définitivement mort pour la durée du contrat. Il rejoint l'espace des morts, d'où il observe les joueurs encore en vie et discute avec les autres morts. Il ne peut pas communiquer avec les vivants.

**Le corps reste sur la map.** C'est un objet, soumis aux mêmes règles que le mobilier (2.4.2) : traînable seul avec forte pénalité et en faisant du bruit, ou portable proprement à deux.

**Deux coûts de retour, selon ce que l'équipe rapporte :**

| Situation | Conséquence |
|---|---|
| Le corps est ramené au camion | **Réanimation** — coût réduit sur l'argent commun |
| Le corps est laissé sur place, mais au moins un joueur survit | **Réimpression** — tous les absents reviennent, à un coût nettement supérieur |
| Aucun survivant au camion | Contrat perdu (voir ci-dessous) |

**Intention de design.** Récupérer un corps n'est pas une formalité comptable : c'est une décision logistique en fin de contrat, quand le temps manque. Un cadavre occupe deux porteurs ou fait du bruit en le traînant — exactement au moment où l'équipe voudrait être discrète et rapide. Le choix « on le laisse, on paiera » doit être tentant, et doit se payer.

**Note technique :** le micro d'un joueur mort est retiré de l'analyse Voice-Physics. Sans cette règle, les morts qui chahutent dans leur espace font exploser le frigo des vivants.

### 2.2.5. Conditions de victoire et de défaite

**Échec de contrat :**
- Toute l'équipe capturée, ou aucun joueur dans le camion à la tombée de la nuit → le contrat est perdu et la réputation baisse.

**Fin de campagne — victoire :**
- Cinq étoiles atteintes et contrat final rempli → départ à la retraite, générique de fin.

**Fin de campagne — défaite :**
- Une équipe déjà tombée au plus bas de l'échelle qui échoue une fois de trop perd sa dernière étoile. La progression est effacée, la partie recommence de zéro.

### Points ouverts (2.2)

- Les contrats cinq étoiles : contenu, structure, condition d'accès. Pas de boss (cf. 2.5.3). *(à définir)*
- Barème exact de la baisse de réputation par type d'échec.
- Le corps a-t-il une durée de validité (réanimable seulement pendant N minutes) ?

---

## 2.3. Les 3C (Caméra, Character, Contrôles)

### 2.3.1. Caméra

- Vue à la première personne (FPS).
- Certains objets encombrants peuvent gêner le champ de vision.

### 2.3.2. Character

Le personnage dispose de tous les mouvements de base, tous fortement modulés par le port d'objets :

- **Marcher** — Déplacement standard, silencieux. Ralenti selon le poids porté.
- **Courir** — Déplacement rapide, mais génère du bruit. Certains objets empêchent totalement la course.
- **S'accroupir** — Déplacement lent et discret.
- **Sauter** — Saut standard. Réduit, voire impossible selon le poids porté.
- **Esquiver (dash)** — Impulsion brève, impossible en portant un objet. Sert exclusivement de fenêtre de réaction face aux menaces à *telegraph* (cf. 2.5).

**Principes clés :**
- Le déplacement est une source sonore. Courir alerte les habitants (cf. 2.4.3). Le son n'est donc pas uniquement vocal : la gestion du bruit est globale (voix + déplacements + manipulation).
- Le déplacement n'affecte pas les meubles, uniquement les habitants.
- Le port d'objets impacte fortement la mobilité : vitesse, course, hauteur de saut, esquive.
- Le poids peut être dynamique : certains objets voient leur poids varier selon la voix des joueurs, modifiant en temps réel la capacité à se déplacer et à sauter.

**Communication non-verbale :**
- Le personnage peut communiquer sans parler, via des expressions physiques (mouvements de tête, gestes des bras).
- Volontairement imparfaite/imprécise, pour rester une source de confusion et de comique — cohérent avec un jeu où la parole est contrainte.
- Constitue un véritable outil de coordination non-verbal (mécanique détaillée en 2.4.4).

### 2.3.3. Contrôles

- **Priorité PC** — Clavier / Souris (cible Steam).
- Support manette prévu, mais le gameplay est conçu d'abord pour clavier/souris — jamais dépendant de la manette.
- Assignation des touches à définir ultérieurement. *(point ouvert)*

---

## 2.4. Mécaniques de jeu (Game Mechanics)

### 2.4.1. La Voice-Physics (mécanique centrale)

La Voice-Physics est le cœur du jeu. La voix des joueurs n'est pas seulement un canal de communication : c'est un **contrôleur physique**. Le volume, la hauteur et la texture de la parole agissent en temps réel sur le comportement des objets transportés.

Cette section décrit le **modèle universel** qui régit toutes les interactions voix-objet. Les règles concrètes de chaque meuble sont détaillées en 2.6.

#### Principe fondateur

La voix est une force. Toute émotion émise devient une contrainte physique.

Le jeu ne cherche pas à récompenser le silence absolu, ni le bruit : il récompense le **contrôle**. Chaque objet impose sa propre discipline vocale, et l'équipe doit ajuster sa manière de communiquer à ce qu'elle transporte.

#### Le micro est toujours ouvert

**Il n'y a pas de push-to-talk.** Le micro du joueur est capté et analysé en permanence, y compris lorsqu'il ne s'adresse à personne.

Cette décision est structurante et non négociable : un push-to-talk permettrait de relâcher la touche, de hurler, et de ne subir aucune conséquence physique — ce qui viderait la Voice-Physics de son sens. Le corollaire est assumé : un éternuement, un rire, une réaction hors-jeu comptent comme du bruit dans le monde.

**Conséquences à traiter :**
- Le joueur doit être informé clairement, dès le premier lancement, que son micro est écouté en continu pendant la partie.
- Une coupure micro volontaire ne doit jamais être une stratégie gagnante (cf. l'Affamé de Silence, 2.5).
- Le cas du joueur sans micro reste à trancher. *(point ouvert)*

#### Le dilemme sonore

Le silence ne doit jamais devenir la stratégie dominante. Si parler ne rapporte rien et coûte toujours quelque chose, la meilleure équipe est la plus muette — et le jeu perd exactement ce qui fait sa saveur au moment précis où les joueurs deviennent bons.

**Règle opposable :** chaque contrat doit contenir au moins un élément qui exige activement du son. La contrainte porte sur le contrat, pas sur la map : elle se vérifie au moment de la composition, et un seul des leviers suivants suffit à la satisfaire.

- **Un élément du lieu** — un dispositif qui réclame du bruit pour fonctionner, ou pour révéler l'espace.
- **Un meuble à déménager** dont la règle vocale impose une émission sonore.
- **Un système transversal** — équipement déployable, contre-mesure face aux habitants, contrainte d'infrastructure.
- **Un habitant attiré par le silence** — l'Affamé de Silence (2.5) rend le mutisme mortel par sa seule présence.

Alterner ces leviers évite que la règle ne devienne un tic de level design visible.

> **La question posée au joueur n'est jamais « est-ce que je me tais ? », mais « combien de bruit puis-je me permettre, ici, maintenant ? ».**

**Deux leviers systémiques concurrents sont identifiés**, et ils recoupent le même territoire :

1. **L'Affamé de Silence** (2.5) — un habitant dont le comportement rend le mutisme dangereux, partout, sans scénarisation.
2. **La Minuterie** *(piste à l'étude)* — l'éclairage des parties communes fonctionne sur une minuterie à détection sonore ; un silence prolongé plonge le lieu dans le noir. Le bruit devient une dépense d'entretien permanente plutôt qu'une corvée ponctuelle, et la pression monte d'elle-même à mesure que la nuit tombe.

**Arbitrage à mener** : les deux, ou l'un des deux ? Voir les points ouverts en fin de 2.4 — la décision engage aussi l'éclairage, donc le level design et trois parades du bestiaire.

#### La grille à trois briques

Tout objet sensible à la voix se décrit par la combinaison de trois briques :

**1. Le paramètre d'entrée — ce que l'objet « écoute » dans la voix :**
- **Le volume** — l'intensité sonore (chuchoter ↔ crier).
- **La hauteur (pitch)** — le registre de la voix (grave ↔ aigu).
- **La forme temporelle** — la nature du son dans le temps : continu (une note tenue, une parole soutenue) ou percussif (un son sec et bref : « tic », claquement de langue, coup).

**2. Le mode de déclenchement — comment l'objet interprète cette entrée :**
- **Proportionnel / continu** — l'objet réagit en temps réel, proportionnellement à l'intensité de l'entrée.
- **À seuil** — l'objet se déclenche au franchissement d'une limite précise.
- **Au cumul multi-joueurs** — le déclenchement dépend du nombre de voix simultanées dans la zone.

**3. La réaction physique — ce que l'objet fait en réponse :**
- Modification d'une propriété physique (masse, friction, stabilité…).
- Déclenchement d'un événement (explosion, flash, enregistrement…).
- Génération d'un effet de perception (sonar, hallucinations, lumière…).

#### Les modulateurs transversaux

Ces règles s'appliquent à tous les objets, en surcouche de la grille.

**Le rayon d'écoute.** Ce n'est pas le joueur qui émet dans une zone, c'est **l'objet qui écoute dans un rayon**. Chaque objet possède son propre rayon d'écoute, et pondère par la distance chaque voix qu'il y trouve.

Cette formulation a deux avantages : le rayon devient un paramètre de design par objet (un frigo sourd qu'il faut approcher, un miroir qui entend toute la pièce), et un porteur — par définition collé à l'objet — est automatiquement pondéré au maximum. La responsabilité revient d'abord à celui qui porte, sans qu'aucune règle supplémentaire ne soit nécessaire.

**Le cumul logarithmique.** Les voix ne s'additionnent pas linéairement : elles se **dominent**, comme le son réel.

- Deux joueurs qui chuchotent produisent à peine plus qu'un seul.
- Huit joueurs qui chuchotent restent sous le seuil de la voix normale d'un seul joueur.
- Un seul cri écrase la somme de tous les chuchotements.

> **Formulation opposable : le silence collectif est toujours atteignable, quel que soit le nombre de joueurs ; un seul écart suffit à tout compromettre.**

C'est ce qui rend le système **invariant au nombre de joueurs** : aucun seuil n'a besoin d'être ajusté entre 2 et 8. C'est aussi ce qui préserve l'attribution de la faute — un cri sort du lot au lieu de se noyer dans une somme.

#### L'équité vocale

Les voix ne sont pas comparables. Une voix grave et une voix aiguë, un micro saturé et un micro faible ne produisent pas les mêmes valeurs pour le même effort. Sur des seuils absolus, certains joueurs seraient structurellement avantagés ou punis : un objet sensible aux graves avantagerait mécaniquement une partie de l'équipe, et le joueur puni accuserait le jeu — à raison.

**Règle :** aucun seuil ne s'exprime en valeur absolue. Chaque joueur est **calibré au premier lancement** (niveau de repos, hauteur médiane, niveau de cri), et toutes les mesures s'expriment ensuite en **écart relatif** à cette référence personnelle. Les mutateurs qui déforment la voix s'appliquent après cette normalisation, jamais avant.

**Conséquence technique :** l'analyse porte sur le **signal brut** du micro, en amont des traitements de confort (détection d'activité vocale, correction automatique de gain, suppression de bruit). Ces traitements sont conçus pour isoler la parole et supprimer le reste : ils effacent l'écart chuchotement/cri et détruisent les sons percussifs, c'est-à-dire deux des trois paramètres d'entrée de la grille.

Le jeu utilise donc **deux voies audio distinctes** :
- le **signal traité** pour la communication entre joueurs,
- le **signal brut** pour l'analyse Voice-Physics.

Cette séparation ouvre une conséquence exploitable : on peut déformer librement la voie communication (filtres, étouffements, grésillements) **sans jamais fausser le gameplay**. Voir 2.7.

#### Intention de design

- **Diversité** : en combinant les trois briques, on génère une immense variété de comportements à partir d'un socle simple et lisible.
- **Data-driven** : chaque objet est une configuration de valeurs sur cette grille, ajustable en playtest sans retoucher le code.
- **Extensibilité** : tout nouvel objet imaginé à l'avenir doit pouvoir se décrire dans cette grille. Si ce n'est pas le cas, c'est le signe qu'il faut réinterroger le modèle — pas le contourner.

---

### 2.4.2. Le port et le transport d'objets

**Principe fondateur : la prise est magnétique (confort), mais le lien est physique (challenge).**

Attraper un objet est instantané et sans friction. Mais une fois saisi, le joueur est lié physiquement à une masse vivante que la voix vient perturber. **Toute la difficulté vient de la voix — jamais des contrôles.**

#### La prise (magnétique)

En s'approchant d'un objet, les bras du personnage se positionnent automatiquement sur des points d'ancrage. Pas de contrôle manuel des bras, pas de « hand simulator ». Attraper = simple et lisible.

La saisie est instantanée : pas d'animation longue, on garde l'arcade lisible. Les bras se positionnent façon aimant, visibles seulement au dernier moment quand on est très proche. Les points d'ancrage sont signalés par un repère visuel sur l'objet (forme exacte à affiner en test). Un feedback sonore accompagne la saisie (confort joueur) mais n'attire jamais les habitants. Un seul joueur par point d'ancrage — pas de partage d'un même ancrage.

#### Le lien (physique / ragdoll)

L'univers est ragdoll, à physique continue : un objet lâché conserve son momentum. La prise est binaire — on tient ou on ne tient pas, jamais de « demi-prise » qui glisse.

Une fois porté, l'objet et le joueur sont connectés par deux transferts physiques :

- **Transfert de poids (continu)** — le poids de l'objet, modulé par la voix, altère le déplacement : ralentissement, corps tiré, saut réduit. *(ex. Canapé de Plomb : léger si on chuchote, écrasant si on crie.)*
- **Transfert de mouvement (secousses)** — les vibrations de l'objet, déclenchées par la voix, se propagent au porteur et aux joueurs proches : marche titubante, trajectoire déviée, jusqu'au ragdoll collectif. *(ex. Frigo-Fusée : tremble puis embarque toute l'équipe.)*

#### Portabilité — deux catégories, un état

- **Solo** — portable seul. Occupe les joueurs surnuméraires, fluidifie les nombres impairs.
- **Collectif** — plusieurs points d'ancrage à remplir. Cœur de la coopération forcée.

#### Le mode dégradé

> **Un joueur en moins ne bloque jamais un objet. Il le rend bruyant.**

Un objet collectif privé d'un ou plusieurs porteurs bascule en **état traîné** : déplacement très lent, et surtout **raclement continu au sol** — donc production de bruit permanente, donc attraction des habitants, donc déclenchement des meubles alentour.

Trois conséquences :

- **Aucun hard-lock possible.** Une équipe décimée ne se retrouve jamais avec un meuble immobilisable et un contrat bloqué. Elle continue, en pire.
- **La catégorie « hybride » disparaît.** Traîner péniblement un objet n'est pas un type d'objet, c'est un **état** de tout objet collectif. Une brique de moins dans le modèle.
- **Le bruit acquiert une source non vocale permanente.** Le bruit ne vient plus seulement des bouches, il vient du travail lui-même. *Déménager fait du bruit* — la thèse du jeu devient mécanique.

Les corps des joueurs morts (2.2.4) suivent exactement ces règles.

#### Le lâcher

- **Volontaire** — le joueur relâche à tout moment. Léger délai anti-spam avant re-saisie (non punitif).
- **Subi (canon)** — la Voice-Physics peut rompre le lien. Défini objet par objet, généralement brutal (pas de glissement progressif) :
  - *Canapé de Plomb* → pas d'arrachage : le joueur reste coincé/immobilisé tant que les voix ne se calment pas pour réalléger l'objet.
  - *Frigo-Fusée* → joueurs entraînés puis éjectés chacun dans sa direction par l'inertie à la séparation.

#### L'intégrité des objets

Chaque meuble possède une **jauge d'intégrité** (et non un état binaire intact/cassé). Elle se dégrade progressivement : chutes, chocs, lâchers subis, traînage prolongé, esquives précipitées.

L'intégrité finale de chaque objet livré pèse directement sur l'évaluation de fin de contrat (2.9). C'est cette jauge qui donne leur coût réel à plusieurs décisions du jeu : lâcher un meuble pour esquiver, traîner au lieu de porter, sacrifier un objet pour franchir un obstacle.

**Point ouvert :** granularité et lisibilité de la jauge — visible en permanence, à la saisie, ou seulement au débriefing ?

#### Règle de design transversale

**Aucune friction sur l'attrape. Toute la friction vient de la voix.** Le joueur doit toujours penser « c'est galère parce qu'on parle trop fort », jamais « c'est galère d'attraper ».

#### Points ouverts (2.4.2)

- Retour visuel du transfert de secousses (caméra ? animation ? les deux ?).
- Feedback quand un objet collectif est en mode dégradé (signal clair d'appel à l'aide).
- Lisibilité de la jauge d'intégrité.

---

### 2.4.3. Le bruit (modèle d'émission)

*Cette section décrit ce qui produit du bruit. La façon dont chaque entité le perçoit et y réagit est décrite en 2.5.*

**Principe fondateur : les habitants sont le miroir des objets.** Là où la Voice-Physics déforme les meubles, elle attire les habitants. La même voix qui complique le transport est aussi celle qui vous fait repérer. Chaque mot est un double risque.

#### Ce qui produit du bruit

- **La voix** — source principale, mesurée sur le volume (cf. 2.4.1 pour la normalisation et le cumul).
- **Le déplacement** — courir génère du bruit. Marcher lentement et s'accroupir n'en génèrent pas.
- **La manipulation** — chocs, chutes d'objets, meuble cogné contre un chambranle.
- **Le mode dégradé** — un objet traîné racle le sol en continu (2.4.2). C'est la seule source de bruit permanente et non intentionnelle du jeu. *Le son varie selon la surface (parquet, pierre, tapis, métal) — traité au moment de la passe audio.*
- **Certains objets** — la Télévision Perroquet qui rediffuse, le Diable qui grince, le Talkie-Walkie qui grésille (cf. 2.6 et 2.7).

#### Ce qui ne produit pas de bruit

- Le feedback sonore de la saisie d'objet (confort joueur).
- Le cri du Guetteur (2.5), qui est un son strictement local, entendu du seul joueur qui le regarde.
- La communication non-verbale (2.4.4).

**Note de design.** Le déplacement discret n'alerte pas : marcher lentement en silence est sûr — au-delà de quelques mètres. La détection de présence à courte portée (2.5) reste effective.

#### La portée n'est jamais affichée

Ni rayon de propagation, ni jauge d'alerte, ni indicateur de détection. Le joueur apprend l'étendue de son influence sonore par essai et erreur, et son seul retour est la réaction de l'habitant lui-même : il s'arrête, tourne la tête, change de direction.

**L'incertitude est la mécanique, pas un manque d'information — une menace lisible cesse d'être effrayante.**

Le Sonomètre (2.4.5) ne contredit pas cette règle : il mesure ce que le joueur **émet**, jamais ce que cela **provoque**. Il dit « tu as crié » ; il ne dit pas « il t'a entendu ».

---

### 2.4.4. La communication non-verbale

**Principe fondateur :** dans un jeu où parler est dangereux, les joueurs ont besoin de se coordonner autrement. Mais l'outil non-verbal est volontairement imparfait : assez expressif pour tenter des choses, assez imprécis pour créer confusion et fous rires.

**On ne cherche pas une communication efficace. On cherche une communication expressive et ambiguë.**

#### Le canal toujours disponible : la tête et les yeux

- La tête du personnage suit la caméra : les coups de souris (droite, gauche, haut, bas) se traduisent en mouvements de tête visibles par les autres.
- Les yeux « ragdoll » — physiques et lâches — ballottent dans la direction du mouvement. Volontairement loufoques et imprécis : on saisit l'intention (« par là ! ») sans jamais un pointage net.
- Ce canal reste actif même les mains pleines. C'est le langage de base, celui qui survit quand tout le reste est coupé.

#### Les canaux « mains libres » (coupés dès qu'on porte)

- **Pointage du doigt** — touche maintenue, visée à la souris. Précis, idéal pour guider. Ralentit très légèrement le joueur (feedback, pas punition). Purement diégétique : c'est le bras qui se lève, visible seulement en ligne de vue directe — pas de marqueur à travers les murs.
- **Emotes** — catalogue expressif, orienté fun et contenu plutôt que coordination critique.

#### Aucun son sur le non-verbal

Le canal non-verbal est le seul moyen de communiquer sans risque face aux habitants. C'est sa récompense implicite : safe, mais imprécis.

#### Règle d'or

**Plus tu portes, moins tu peux communiquer.** Mains pleines → tête + yeux uniquement. Mains libres → pointage + emotes en plus.

Porter un objet rend doublement dépendant : physiquement (2.4.2) et communicationnellement. Le porteur subit et perd la parole utile ; le joueur mains libres devient le guide. Les rôles émergent d'eux-mêmes.

**Point ouvert :** liste précise des emotes *(faible priorité)*.

---

### 2.4.5. Le Sonomètre (l'interface de la Voice-Physics)

Les chantiers imposent des dosimètres de bruit à leurs ouvriers. Karma Logistics en colle un sur le torse de ses employés — pas pour leur sécurité, pour son assurance. Un boîtier gris, une aiguille de VU-mètre analogique, une échelle sérigraphiée du vert au rouge.

- **Ce n'est pas un élément de décor, c'est l'interface de la Voice-Physics.** Sans lui, la réaction des objets est une boîte noire ; avec lui, chaque écart vocal devient visible et attribuable.
- **L'aiguille analogique plutôt qu'un afficheur numérique** : plus lisible de loin, plus cohérente avec l'univers anachronique, et son inertie fait qu'elle tremble quand on chuchote sous tension.
- **Il alimente le débriefing** : le bruit est mesuré, archivé, et ressorti au tableau des scores de fin de contrat (2.9).
- **Support cosmétique naturel** : boîtiers, cadrans, aiguilles.
- **Il est porté par tous, et lisible par tous.** C'est ce qui en fait le tell de l'Imitateur (2.5) : une créature qui parle sans que son aiguille bouge n'est pas un coéquipier.

> **Limite à ne pas franchir : le Sonomètre mesure ce que le joueur émet, jamais ce que cela provoque.**

---

### Points ouverts (2.4)

- **Arbitrage éclairage — Minuterie vs Lampe Capricieuse.** Trois archétypes du bestiaire ont une parade qui exige de voir (Guetteur, Imitateur, Embusqué). L'éclairage est devenu porteur de gameplay et non d'ambiance. **Contrainte issue des retours du genre : le noir total ne doit jamais être un état durable.**
- **La brique « hauteur (pitch) » n'est utilisée par aucun habitant.** Elle n'est aujourd'hui justifiée que par le mobilier. Soit un archétype la reprend, soit on assume qu'elle est une brique d'objet uniquement.
- **Le joueur sans micro** : exclu, dégradé, ou compensé ?
- Assignation des touches.

---

## 2.5. Le Bestiaire — ce qui écoute pour te tuer

**Principe fondateur :** le bestiaire n'est pas un catalogue de créatures, c'est un ensemble de **règles d'écoute**. Chaque archétype est une configuration de valeurs sur une grille commune, exactement comme les meubles maudits le sont sur la grille à trois briques (2.4.1). Un seul système d'écoute est implémenté ; les entités diffèrent par leurs valeurs, jamais par leur code.

### 2.5.1. Ce qui entre au bestiaire

- **Ce qui écoute pour te tuer** → le bestiaire, qu'il soit vivant ou non, mobile ou fixe.
- **Ce qui écoute pour te trahir** → le mobilier (2.6). Il ne tue jamais, il déclenche.
- **Ce qui écoute pour t'obéir** → les objets (2.7).
- **Ce qui n'écoute pas** → le level design (2.8). Une fosse n'a ni entrée, ni réaction, ni parade : elle a une géométrie. On tombe, on meurt.

Le bestiaire se divise en deux familles : **les habitants** (vivants) et **les dispositifs** (mécaniques).

### 2.5.2. La grille du bestiaire (sept briques)

| Brique | Rôle |
|---|---|
| **Ancrage** | Mobile (circuit) / Statique-zone / Seuil / Ancré à un objet |
| **Signature** | Comment on le perçoit avant qu'il ne soit trop tard |
| **Entrée** | Ce qu'il écoute : volume, hauteur, forme temporelle, mouvement, regard, absence de son |
| **Réaction** | Ce qu'il fait quand il détecte |
| **Prévention** | Comment on évite de le déclencher |
| **Parade** | Comment on s'en sort une fois déclenché |
| **Levier de manipulation** | Ce que les joueurs peuvent en faire les uns contre les autres |

**Intention de design :** data-driven. Un nouvel habitant est une configuration de valeurs, pas une classe. Tout archétype imaginé à l'avenir doit pouvoir se décrire dans cette grille ; si ce n'est pas le cas, c'est le signe qu'il faut réinterroger le modèle — pas le contourner.

### 2.5.3. Règles transversales

#### Prévention ≠ parade

Deux moments distincts, souvent confondus :

- **La prévention** est ce qu'on fait pour ne pas déclencher. Commune à tous, elle relève de la **discipline**.
- **La parade** est ce qu'on fait une fois l'erreur commise. Spécifique à chaque archétype, elle relève de la **connaissance**.

Le débutant ne connaît que la prévention, et il tient. L'expérimenté connaît la parade, et il s'en sort proprement, sans perdre le meuble ni le temps. **C'est l'écart entre les deux qui constitue la profondeur du jeu.**

> **Règle d'or : se faire entendre n'est jamais une condamnation. Il existe toujours un après.**

#### Le plancher universel

Se figer et se taire achète toujours du temps, sur n'importe quel habitant, sans jamais être optimal.

Sans ce plancher, un groupe comprenant des débutants n'a pas une courbe d'apprentissage mais un mur. Le débutant qui fait le réflexe évident — se figer — n'est pas puni pour son ignorance : il est ralenti.

#### Pas de mort-couperet

Être repéré n'est jamais une mort instantanée. Il y a toujours un délai, une tentative de fuite possible, une fenêtre. La tension vient de l'incertitude, pas d'une punition automatique.

**Corollaire :** aucun archétype ne tue au premier contact. Le Squatteur réveillé ne dévore pas son porteur ; il se libère. L'échec produit une escalade, pas une sanction.

#### Aucune contrainte de silence globale

« Tout le monde se tait » est jouable à quatre, impossible à huit : il y a toujours quelqu'un qui tousse. Toute contrainte de silence s'exprime dans le **rayon d'écoute** d'une entité, jamais à l'échelle de la map.

#### La voix est la seule arme

Les habitants sont invincibles et ne se combattent pas. Aucune parade ne passe par un coup porté. Le seul outil offensif du jeu est celui qui crée le danger.

#### Pas de boss

**Décision actée.** Le jeu ne comporte aucun boss. Dans un jeu sans combat, un boss ne pourrait être qu'une créature qu'on n'abat pas — ce qui n'en est pas un.

La montée en intensité de la campagne passe exclusivement par le **peuplement** (2.5.7), le **mobilier** (2.6) et le **level design** (2.8). Le sommet de la campagne est un contrat cinq étoiles, pas un affrontement.

#### Lisibilité opposable

Le comportement d'un habitant doit être **déductible**. L'incertitude vient de la situation — où est-il, m'a-t-il entendu — jamais des règles. Une entité dont on ne peut pas modéliser le comportement produit de l'adhésion pendant dix heures et du rejet ensuite.

### 2.5.4. Le système de détection

Commun à tous les archétypes mobiles.

#### Le point d'intérêt (POI)

Un habitant ne poursuit pas un joueur : **il poursuit un point.** Il mémorise un unique point d'intérêt sonore et s'y rend. Il retrouve les joueurs par accident, jamais par omniscience.

- **Arbitrage** : score `intensité × fraîcheur`, décroissant. Un cri lointain récent bat un bruit proche ancien. Un seul POI en mémoire, jamais deux.
- **Conséquence recherchée** : l'habitant qui change de direction en pleine course parce que quelqu'un vient de craquer ailleurs.
- **Bénéfice réseau** : on réplique un point et un état, pas une logique de ciblage. Le modèle est invariant au nombre de joueurs.

#### Les états

- **Routine** — l'habitant vaque, ignore les joueurs.
- **Investigation** — arrivé au POI sans trouver personne, il ne repart pas : il ratisse les alentours quelques secondes, **rayon d'écoute élargi**. C'est le moment de tension le plus précieux du jeu.
- **Poursuite** — un bruit franc le fait foncer vers la source. Fenêtre d'évasion courte mais réelle.
- **Capture** — mort du joueur (cf. 2.2.4).

#### La détection de présence

À courte portée (ordre de grandeur : 2 à 3 mètres, à régler en playtest), l'habitant détecte un joueur **indépendamment du bruit**, même immobile et silencieux. Il ne le tue pas : il bascule en poursuite.

Sans cette règle, se figer est une invulnérabilité, et l'immobilité devient la stratégie dominante — le dilemme sonore de 2.4.1 transposé au bestiaire.

---

### 2.5.5. Les habitants

*Huit archétypes. Les noms sont **fonctionnels** — ils décrivent un comportement et servent à travailler. Le nommage narratif sera arbitré à l'écriture du lore (pistes en points ouverts).*

---

#### 1 — Le Patrouilleur

*L'archétype de référence. Tous les autres se définissent par rapport à lui.*

| | |
|---|---|
| **Ancrage** | Mobile — circuit défini au level design |
| **Signature** | Pas lourds audibles à distance. Visible en ligne de vue. Aucune dissimulation. |
| **Entrée** | Volume vocal, course, chocs |
| **Réaction** | Boucle POI complète : arbitrage → déplacement → investigation → routine. Détection de présence à courte portée. |
| **Prévention** | Marcher, parler sous le seuil, apprendre son circuit |
| **Levier** | Le plus manipulable du bestiaire |

**Parades :**

- **Le relais de bruit** *(natif, gratuit)* — un joueur produit ailleurs un bruit dont le score dépasse le POI courant. L'habitant change de cap. C'est simultanément l'entraide et le troll : rien n'oblige le sacrifié à être volontaire. Cette parade ne coûte aucune ligne de code : elle découle de la règle d'arbitrage.
- **Le silence** *(plancher universel)* — se figer, subir l'investigation, attendre. Coûte du temps, et suppose de tenir le silence en portant un meuble à masse variable.
- **La boîte à musique** *(déployable acheté, cf. 2.7)* — produit une note tenue en continu dans son rayon ; le Patrouilleur ralentit, s'assoit, s'endort. Version objet du « Kite ASMR », qui libère la voix des joueurs pour autre chose. **Lame à double tranchant :** l'habitant endormi bloque le couloir — y compris la route d'extraction.

**Note de design :** le Patrouilleur est le seul habitant dont on apprend le comportement en une partie. Il est le tutoriel implicite du bestiaire.

---

#### 2 — L'Embusqué

| | |
|---|---|
| **Ancrage** | Statique — recoin sombre, dessous de meuble, angle mort |
| **Signature** | Dissimulé. Visible seulement si on le cherche activement, donc si on a de la lumière. |
| **Entrée** | Volume, dans un rayon court |
| **Réaction** | *Telegraph* (les bras se tendent, son d'aspiration) puis saisie → capture |
| **Prévention** | L'avoir repéré ; passer en silence |
| **Levier** | Le Bouton « Poussette » : pousser un coéquipier dans son rayon |

**Parade — le dash au telegraph.** Une fenêtre courte s'ouvre pendant l'animation de préparation. Un dash en sort.

**Contrainte structurante : le dash est impossible en portant un meuble.** Le joueur doit donc lâcher pour esquiver — et le meuble lâché encaisse des dégâts d'intégrité (2.4.2) qui pèsent sur l'évaluation finale.

La décision se lit en une seconde : **ma peau ou la marchandise.** Et elle a une troisième issue, la plus intéressante : ne pas esquiver, se faire prendre, et laisser le coéquipier survivant repartir avec l'objet en mode dégradé.

**Point ouvert :** l'esquive introduit le premier input d'action-réflexe du jeu. Il est acceptable tant qu'il reste rare et conditionné. D'autres moments réflexes pourront être ajoutés ultérieurement ; ils devront rester des ruptures de rythme, jamais une compétence de fond.

---

#### 3 — L'Agrippeur

| | |
|---|---|
| **Ancrage** | Statique — plafond |
| **Signature** | Visible si on lève les yeux. Invisible sinon. |
| **Entrée** | Volume émis en passant sous lui |
| **Réaction** | Chute, saisie, immobilisation du joueur. Pas de mort immédiate. |
| **Prévention** | Passer sous lui en silence ; lever les yeux (donc : lumière) |
| **Levier** | Laisser un coéquipier accroché est une décision tactique |

**Parade — le cri.** Un cri franc, au-dessus d'un seuil élevé, émis par **n'importe qui à portée, y compris la victime**, force l'Agrippeur à lâcher prise.

C'est la seule parade du jeu qui exige de faire exactement ce que tout le reste a appris à ne pas faire. Elle crée le POI le plus fort de la partie.

**Le dilemme est porté par la victime :**
- **Crier maintenant** : elle se libère seule, et déclenche tout ce qui écoute dans un large rayon.
- **Se taire** : elle reste accrochée, et espère qu'un coéquipier prendra le risque à sa place — ou qu'un Patrouilleur s'éloigne d'abord.

**Note de design :** l'Agrippeur ne produit pas une mort, il produit une **négociation**. C'est l'habitant qui transforme un allié en bombe sonore à retardement.

**Point ouvert :** durée avant consommation de la victime. Un délai trop court supprime la négociation ; l'absence totale de délai autorise le gag consistant à laisser un coéquipier suspendu jusqu'à la fin du contrat.

---

#### 4 — Le Guetteur

*Le seul habitant dont la parade est un état émotionnel et non une action.*

| | |
|---|---|
| **Ancrage** | Statique-zone — se déplace dans un périmètre restreint |
| **Signature** | Visible. Le premier contact visuel déclenche systématiquement un choc audiovisuel. |
| **Entrée** | Le regard (le fige) + le volume (le déclenche) |
| **Réaction** | Figé tant qu'un joueur le regarde. Crie pour faire craquer. Un bruit émis par un joueur qui le regarde → charge. |
| **Prévention** | Le regarder, et se taire |
| **Levier** | Parler à un coéquipier qui le fixe, pour le faire craquer |

**Le cri est strictement local.** Il n'est entendu que des joueurs qui regardent la créature. Les autres n'entendent rien.

Trois conséquences majeures :

- **Coût technique nul.** Son 2D local, aucune réplication réseau.
- **Le cri ne compte jamais comme du bruit dans le monde.** Il n'alimente aucun POI. Seule la réaction réelle du joueur en produit. Sans cette règle, la créature déclencherait elle-même ce qu'elle punit.
- **Il crée un rôle émergent que personne n'a écrit.** Quelqu'un doit le fixer pendant que les autres passent avec le meuble. Ce joueur encaisse tout, en silence, sans pouvoir expliquer ce qu'il subit — et les autres, qui n'entendent rien, voient un coéquipier au comportement absurde et **lui parlent**. Ce qui le fait craquer. **Le Guetteur est l'habitant qui utilise l'entraide comme arme.**

**Parade — le sang-froid.** Tenir. Rompre le regard le libère et il reprend son approche. Un joueur ne peut pas tenir indéfiniment : la pression monte tant que le regard dure, ce qui impose le relais entre joueurs — une coordination à mener en silence.

**Garde-fous de lisibilité :**
- **Cône central, pas champ de vision.** Le déclenchement exige que la créature soit vers le centre de l'écran, non occultée, sous une distance maximale. Au bord de l'écran, rien. Sinon le joueur jurera qu'il ne l'avait pas vu — et il aura raison.
- **Réaction avant le cri.** Une fraction de seconde où la créature tourne la tête vers le joueur, puis le cri. Même sursaut, mais attribuable : « il m'a vu » et non « le jeu m'a agressé ».
- **Décroissance du pic.** Le premier contact est un choc franc. Les suivants montent en pression sans jamais culminer de la même façon. Un jumpscare identique répété cesse de fonctionner à la troisième occurrence et devient pénible à la sixième.

**Note d'accessibilité :** le cri étant local, une option d'atténuation des chocs visuels et sonores n'a aucun impact sur les autres joueurs. Elle peut être offerte sans déséquilibrer la partie.

---

#### 5 — La Porte

*Un filtre logistique déguisé en prédateur.*

| | |
|---|---|
| **Ancrage** | Seuil — architectural |
| **Signature** | Identique aux portes ordinaires du niveau, à un détail près, reconnaissable par un joueur averti |
| **Entrée** | Bruit au moment du franchissement — voix, choc, meuble bruyant |
| **Réaction** | Dévore celui qui franchit |
| **Prévention** | Franchir en silence ; reconnaître le détail |
| **Levier** | Crier au moment où un coéquipier franchit. Le Bouton « Poussette ». |

**Ce qu'elle menace réellement.** Elle ne menace pas les joueurs disciplinés — on se tait, on passe. Elle menace **le transport** : un Frigo qui tremble, un Diable qui grince, un Matelas qui rebondit, un objet en mode dégradé qui racle le sol. Son vrai contenu est : *ce couloir est fermé à cet objet-là.*

Elle reste néanmoins létale pour le joueur distrait. C'est assumé — un joueur qui traverse en riant se fait dévorer, et c'est l'événement le plus lisible du jeu.

**Parades :**
- **Le Spray WD-4000** *(cf. 2.7)* — les gonds lubrifiés, la porte devient sourde un temps.
- **Le contournement** — escalier, autre route, façade et monte-meuble. **Garde-fou : aucun meuble ne doit dépendre exclusivement d'une porte piégée.**
- **La cale** *(à valider)* — un meuble jeté dans la gueule bloque les mâchoires ; le passage est libre, le meuble est détruit et compte dans l'évaluation. Seule parade du jeu qui se paie en marchandise.

**Point ouvert — le détail distinctif.** Visuel (un gond, une usure, une teinte) ou **audio** (un souffle très faible, perceptible seulement si l'équipe se tait) ? La version audio récompense le silence sans le rendre dominant, et fait de l'écoute une compétence.

---

#### 6 — L'Affamé de Silence

*La réponse systémique au dilemme sonore.*

| | |
|---|---|
| **Ancrage** | Mobile |
| **Signature** | Parfaitement visible, lent, aucune surprise. L'horreur est de le voir approcher en sachant qu'on ne devrait pas parler. |
| **Entrée** | **L'absence de son** |
| **Réaction** | POI inversé : il dérive vers le point le plus silencieux depuis le plus longtemps. Contact = capture. |
| **Prévention** | Maintenir du bruit |
| **Parade** | N'importe quel son lui fait perdre l'intérêt. Il ne fuit pas : il dérive ailleurs. |
| **Levier** | Se taire près d'un coéquipier pour le lui envoyer |

**Implémentation :** c'est le système de POI existant, avec le score inversé. Même code, même structure de données, signe opposé. C'est l'archétype le moins coûteux du bestiaire.

**Fonction systémique.** La règle de 2.4.1 — *chaque contrat doit contenir au moins un élément qui exige du son* — est autrement une contrainte de composition à vérifier contrat par contrat, avec le risque de devenir un tic de level design visible. L'Affamé la résout au niveau du peuplement : **sa seule présence rend le mutisme mortel, partout, sans qu'aucun designer n'ait à le scénariser.**

**Fonction anti-exploit.** Un joueur qui coupe son micro pour neutraliser la Voice-Physics devient la cible la plus attirante de la map. Le jeu n'a pas besoin de détecter la triche : il la punit mécaniquement.

**Sa vraie valeur est en cohabitation.** Un Affamé et un Patrouilleur sur la même map, et l'équipe est prise dans un étau : il faut du bruit pour l'un, du silence pour l'autre. Il n'existe plus de stratégie sûre, seulement un dosage.

---

#### 7 — L'Imitateur

| | |
|---|---|
| **Ancrage** | Mobile |
| **Signature** | Apparence d'un coéquipier. **Deux tells :** l'aiguille de son Sonomètre ne bouge pas quand il parle ; sa voix ne subit pas l'atténuation de distance et arrive toujours au même volume. |
| **Entrée** | Une voix émise par un joueur **qui le regarde** — regard et parole simultanés |
| **Réaction** | Il appelle avec un fragment de voix. Chaque réponse le rapproche d'**un tiers de la distance initiale**. Trois réponses : capture. |
| **Prévention** | Vérifier le Sonomètre avant de répondre |
| **Parade** | Cesser de répondre. Le compteur n'avance plus ; il ne redescend pas. |
| **Levier** | Il vise le dernier répondant — on peut donc le coller à un coéquipier, par mégarde ou volontairement |

**Pourquoi cette condition de mort.** La parade est une discipline vocale, comme tout le reste du jeu : cohérence totale avec la Voice-Physics. Et elle produit la scène la plus cruelle possible — **un vrai coéquipier appelle à l'aide, et personne n'ose répondre.** L'Imitateur n'a même pas besoin d'être présent pour faire des dégâts : le simple fait qu'il *puisse* exister empoisonne toute la communication de l'équipe.

**L'information arrive avec le danger.** À la première réponse, il est trop loin pour qu'on lise son Sonomètre. À la deuxième, on peut douter. À la troisième, c'est trop tard. Le jeu fournit la preuve exactement au moment où elle ne sert plus. La tension est produite par la géométrie, pas par une règle supplémentaire.

**Le Sonomètre trouve ici sa justification finale.** Le boîtier que Karma Logistics colle sur le torse de ses employés pour son assurance devient l'outil qui sauve la vie. Cette parade n'est pas un objet : c'est **une habitude d'observation**.

**Point ouvert :** la source vocale. Fragments enregistrés en direct sur les joueurs de la partie, ou banque de répliques pré-enregistrées ? La première option est incomparablement plus forte — et techniquement accessible, le pipeline captant déjà le signal micro brut en continu (piste d'implémentation à documenter en Partie 3).

---

#### 8 — Le Squatteur

*Le seul habitant dont l'existence est garantie par le contrat lui-même.*

| | |
|---|---|
| **Ancrage** | Ancré à un meuble du contrat — état dormant |
| **Signature** | C'est un meuble. Un détail trahit sa nature : le piano dont le clapet du clavier est une bouche. |
| **Entrée** | **Chocs** (forme temporelle percussive) **+ volume**, sur un rayon d'écoute très faible |
| **Réaction** | Réveil → il se libère → devient un **chasseur à vue** autonome pour le reste du contrat |
| **Prévention** | Porter sans cogner ; se coordonner en chuchotant à faible distance |
| **Levier** | Le réveiller volontairement. Le sabotage le plus lourd de conséquences du jeu. |

**La double contrainte.** Le rayon d'écoute étant très faible, seuls les porteurs sont réellement concernés. Ils doivent à la fois **ne rien cogner** et **chuchoter entre eux** pour se coordonner. C'est la seule situation du jeu où la contrainte est simultanément gestuelle et vocale — et elle reproduit exactement le comportement réel face à quelqu'un qui dort.

**Le réveil n'est pas une punition, c'est une escalade.** Le Squatteur ne dévore pas son porteur. Il se détache, se dresse, et le niveau compte désormais un habitant de plus. L'équipe n'a rien perdu — elle vient d'ajouter un antagoniste permanent à un contrat qu'il lui reste à finir. La sanction sociale fait le reste.

**Le chasseur à vue rompt délibérément la grammaire du jeu.** C'est le seul habitant indifférent au bruit. La parade n'est plus acoustique mais **spatiale** : rompre la ligne de vue, mettre un mur, fermer une porte, jouer les angles.

Il est **légèrement plus lent qu'un joueur** : on ne meurt jamais de lui si on le voit venir, mais on ne se repose plus jamais. Il rôde jusqu'à l'extraction.

**Note d'implémentation.** À l'état dormant, ce n'est pas une entité : c'est un composant d'écoute sur un prefab de meuble. Pas de navigation, pas d'IA, pas de comportement — et donc aucun problème d'autorité physique partagée entre une créature et un objet porté à plusieurs. Le réveil est une transition unique : le composant est détruit, un chasseur est instancié à cette position, le meuble redevient un meuble ordinaire.

**Fonction.** Il est impossible de finir le job sans le manipuler. Le Squatteur est l'expression la plus pure du postulat du jeu : **déménager, c'est déranger.**

---

### 2.5.6. Les dispositifs

*Menaces non vivantes qui écoutent pour tuer. Elles partagent le système de détection, mais ne se manipulent pas socialement : elles se désactivent ou se contournent.*

- **La tourelle sonore** — repère au bruit, tire sur la source. *(à définir)*
- **Le Détecteur « T-Rex »** — un laser qui ne capte que le **mouvement de la caméra** (souris/joystick). S'il s'active, il faut lâcher la souris sous peine de tout perdre.

**Point ouvert — taxonomie.** Le Détecteur T-Rex n'écoute rien : il lit un input de contrôle. C'est le seul élément du corpus dont l'entrée n'existe pas dans la grille. Trois options : élargir la grille à une entrée « mouvement de caméra », l'accepter comme exception assumée, ou le reclasser en obstacle de level design (2.8). **À trancher.**

---

### 2.5.7. Le peuplement (2 à 8 joueurs)

Le nombre d'habitants n'est jamais une variable directe. Doubler les menaces ne double pas la difficulté : cela superpose les zones de danger et produit des configurations sans route sûre. Le joueur ne perd plus par erreur, il perd par tirage.

**Règles de peuplement :**

- **La variable est la surface.** La map grandit avec le nombre de joueurs — nécessaire de toute façon, huit personnes dans un studio produisant un embouteillage de ragdolls. À **densité constante menaces/surface**, le nombre d'habitants découle mécaniquement de la taille. Un seul curseur à régler.
- **Zone tampon garantie à l'entrée.** Aucun habitant ne peut apparaître à proximité du point d'arrivée. Un contrat qui commence par une mort avant le premier pas est le défaut le plus reproché aux générateurs du genre.
- **Une menace à la fois en basse réputation.** Les archétypes se débloquent progressivement. La cohabitation est un contenu de haute réputation, pas un état par défaut.
- **Le couple d'étau.** Faire cohabiter un Affamé de Silence avec un archétype attiré par le bruit est le levier de difficulté le plus fort du jeu — bien avant le nombre.
- **La fragmentation comme outil de scaling.** L'horreur vient de l'isolement, et à huit on est rarement seul. Les objets collectifs et le monte-meuble immobilisent des joueurs et découpent le groupe : ce sont des **outils de peuplement**, pas seulement des contraintes de portage. Plus l'équipe est grande, plus le contrat doit contenir de tâches qui fragmentent.

---

### Points ouverts (2.5)

- **La cale de la Porte** : validée ou coupée ?
- **Le détail distinctif d'une porte piégée** : visuel ou audio ?
- **Durée avant consommation par l'Agrippeur.**
- **Endurance du regard sur le Guetteur** : combien de temps un joueur peut-il tenir, et le relais doit-il être limité ?
- **Source vocale de l'Imitateur** : enregistrement en direct ou banque pré-enregistrée.
- **Portée exacte de la détection de présence** (ordre de grandeur 2-3 m, à régler en playtest).
- **Taxonomie du Détecteur T-Rex** (cf. 2.5.6).
- **Aucun archétype n'utilise la brique « hauteur »** (cf. points ouverts 2.4).
- **Nommage narratif.** Les noms fonctionnels seront remplacés à l'écriture du lore. Piste de développement : les habitants portent des noms de voisinage — le Concierge, le Voisin du Dessus, le Syndic, l'Occupant, le Précédent Locataire. Cohérent avec le postulat « déménager, c'est déranger », et coût de production nul.
- **L'événement systémique** : une créature colossale d'arrière-plan dont les pas déclenchent la physique du mobilier. Elle n'écoute pas et ne tue pas — ce n'est pas un habitant, c'est une météo. Renvoyée en 2.8. Sa fonction — introduire un danger qui ne soit pas la faute des joueurs — reste à pourvoir.

---

## 2.6. Le Mobilier — ce qui écoute pour te trahir

> **Section à rédiger.** C'est le contenu principal du jeu : ce que le joueur manipule 90 % du temps.

**Principe fondateur (posé) :** le meuble n'attaque pas, **il trahit**. Il n'est pas un ennemi, mais le relais physique entre la voix et le danger. Il réagit aux paramètres de la voix (masse, stabilité, bruit, perception), et c'est sa réaction qui expose les joueurs aux habitants (2.5) et au level design (2.8).

**Ce que la section devra contenir :**
- Le catalogue des meubles, chacun décrit par la **grille à trois briques** (2.4.1) — entrée, mode de déclenchement, réaction physique — plus son **rayon d'écoute** et sa **catégorie de portabilité** (2.4.2).
- Les paliers de déblocage par niveau de réputation.
- Les meubles déjà identifiés et à passer au crible : Canapé de Plomb (masse), Frigo Fusée / Explosif (pression, cumul), Matelas à Mémoire de Ton (hauteur), Miroir Paranoïaque (direction et vision), Vase de l'Écho (écholocation), Lampe de Chevet Capricieuse (lumière), Télévision Perroquet (enregistrement et rediffusion).
- Les meubles spécifiques aux contrats cinq étoiles.

**Test de validité :** tout meuble doit pouvoir se décrire dans la grille à trois briques. Si ce n'est pas le cas, c'est le modèle qu'il faut réinterroger — pas le contourner.

**Dépendance :** le Squatteur (2.5) est le point de contact entre les deux catalogues. Son état dormant est un meuble ; son état éveillé est un habitant.

---

## 2.7. Objets & Économie — ce qui écoute pour t'obéir

> **Section partiellement rédigée.** Le catalogue des consommables et déployables reste à écrire, en réponse aux menaces définies en 2.5.

### 2.7.1. Les trois catégories d'équipement

- **Porté** — les meubles à déménager, régis par la Voice-Physics (2.4.1) et les règles de transport (2.4.2). *Catalogue en 2.6.*
- **Consommable** — objets d'aide emportés en mission, inventaire limité (1 à 2 slots par joueur).
- **Déployable** — matériel installé sur place, acheté à la boutique du camion. Ne se porte pas, ne se consomme pas : il modifie le déroulement du contrat.

### 2.7.2. L'économie

- **Argent commun, jamais individuel.** Gagné en mission, dépensé à la boutique du camion.
- **Le retour des collègues ponctionne cette caisse commune** : une mort coûte au groupe, à un tarif qui dépend de la récupération ou non du corps (2.2.4).

### 2.7.3. Progression

Pas d'arbre de compétences, pas de montée en niveau. La progression est celle du joueur lui-même (1.3), doublée de l'accumulation d'équipement et de la montée en réputation.

### 2.7.4. Le Monte-meuble (déployable)

L'échelle à plateau qu'on colle à la façade pour sortir un meuble par la fenêtre. Il fonctionne **à la note tenue** : un joueur soutient un son continu depuis la rue et le plateau monte ; la note casse, le plateau redescend.

**Ce qu'il apporte :** une seconde route d'extraction. L'escalier est lent, pénible, et impose le silence. La façade est rapide, spectaculaire, et impose au contraire de produire du son. Les deux routes ne demandent pas la même discipline vocale — c'est le dilemme sonore (2.4.1) sous forme de choix stratégique acheté, plutôt que de contrainte imposée par la map.

- **Acquisition** — achat permanent, cher. Le nombre d'usages assure seul la régulation : pas de double coût.
- **Usages** — trois montées par contrat, rechargées entre les contrats. La question d'équipe devient : quels trois meubles méritent la façade ?
- **Joueurs mobilisés** — deux au minimum : un dehors qui tient la note, un dedans qui charge et détache.
- **Emplacement** — points d'ancrage balisés en façade, placés au level design. Pas n'importe quelle fenêtre.
- **Statut** — toujours optionnel. Aucun meuble ne doit passer uniquement par la façade, sous peine de bloquer une équipe qui n'a pas l'équipement.

**Le transfert d'effet.** Le meuble est sanglé au plateau : sa physique propre est désactivée, il ne peut pas tomber. Mais son profil vocal est **reporté sur le plateau** — un objet sensible à la masse le fait caler, un objet instable le fait tanguer, un objet sensible à la hauteur exige que la note soit tenue juste et pas seulement tenue. La voix reste donc maîtresse pendant toute la montée, au lieu d'être neutralisée au moment le plus vocal du jeu, et un seul dispositif produit autant de variantes qu'il y a de meubles.

**Les deux modes d'échec.** L'intensité de la note pilote la vitesse, sa durée pilote la distance : il faut relâcher en approchant de la fenêtre.

- **La note casse** (souffle, rire, panique) — le plateau redescend doucement. Aucune montée perdue, on recommence.
- **Dépassement de la hauteur maximale** (trop fort, trop longtemps) — le limiteur de sécurité renvoie le plateau au sol. Une montée perdue sur les trois.

> **On échoue par excès, jamais par insuffisance. Rater par faiblesse est gratuit ; rater par excès se paie.**

**Le relais.** Un joueur ne tient pas une note quinze secondes. Un second la reprend avant que le premier ne craque, et le plateau ne redescend que s'il y a un trou entre les deux.

**La lisibilité.** Une cloche mécanique sonne à chaque étage : on sait où on en est à l'oreille, sans interface. Et comme c'est un son, il porte — l'appareil qui renseigne est aussi celui qui dénonce.

**Le garde-fou.** L'escalier fonctionne toujours. Un monte-meuble entièrement raté coûte de l'argent et du temps, jamais un contrat.

**Points ouverts :**
- Largeur de la fenêtre vocale acceptable et lisibilité de l'approche (tuning en playtest).
- Comportement du plateau lorsque le joueur intérieur est encore en train de détacher le meuble.

### 2.7.5. Le catalogue des consommables et déployables *(à rédiger)*

Chaque objet du catalogue devra répondre à trois questions : **à quelle menace répond-il, que coûte-t-il, et quel est son twist chaotique ?**

**Objets déjà identifiés dans les notes, à passer au crible :** boîte à musique, Spray « WD-4000 », Mégaphone Cassé, Pastilles « Miel & Camomille », Grenade « Zone de Vide », Diable de Manutention, Talkie-Walkie « Fisher-Price », Casque Anti-Bruit « Égoïste », Rouleau de Scotch, Bouton « Poussette ».

### 2.7.6. Les filtres de voix (système)

**Décision actée : les altérations de la voix constituent un système à part entière, et non une collection d'effets ponctuels.**

La séparation des deux voies audio (2.4.1) rend ce système possible à coût quasi nul : on peut déformer librement la **voie communication** — ce que les joueurs s'entendent dire — sans jamais toucher à la **voie analyse** qui pilote la Voice-Physics. Un filtre est donc purement social : il ne fausse rien, ne triche pas, ne déséquilibre rien.

**Trois fonctions par filtre :**
- **Lisibilité** — on entend qu'un effet est actif, donc on sait dans quel état est le coéquipier.
- **Chronométrage** — la voix altérée rappelle en continu qu'un compte à rebours tourne.
- **Comédie** — c'est du matériau de stream par définition.

**Objets relevant déjà de cette famille :** Rouleau de Scotch (voix étouffée), Talkie-Walkie « Fisher-Price » (grésillement, Larsen), Pastilles « Miel & Camomille » (voix feutrée sous le seuil de détection).

**À définir :** la liste des filtres, leurs porteurs (objets, zones, mutateurs, états de jeu), et la question de savoir si certains filtres peuvent être purement cosmétiques et achetables.

### 2.7.7. Cosmétiques et améliorations du camion *(à rédiger)*

Éléments identifiés : couleurs de LED, skins de scotch, chapeaux et accessoires, boîtiers et cadrans de Sonomètre, radio de bord, klaxon personnalisé.

---

## 2.8. Level Design & Environnements

> **Section à rédiger.**

**Ce que la section devra contenir :**
- Structure du monde : hub (le camion) + contrats générés.
- Liste des biomes / zones et leurs contraintes de gameplay.
- Les obstacles passifs (ce qui n'écoute pas) : fosses, chutes, portes fermées, géométrie punitive.
- Les zones systémiques déjà identifiées : Gouffre Soufflerie, Salle des Échos, Zone de Vide Spatial, Sol Fragile.
- L'événement systémique renvoyé de 2.5 (créature colossale d'arrière-plan).

### 2.8.1. La génération de niveau *(piste à cadrer)*

L'approche envisagée est l'assemblage de **modules construits à la main**, plutôt qu'une génération purement procédurale.

**Spécificité du projet :** dans un roguelite classique, le générateur garantit des propriétés **spatiales** (la sortie est atteignable, le boss est loin du départ). Ici, il doit garantir des propriétés **acoustiques et logistiques** :

- au moins deux routes d'extraction de coûts différents (l'escalier long et silencieux, la façade courte et bruyante) ;
- une répartition entre poches de silence (refuges) et amplificateurs (couloirs, cages d'escalier) ;
- une corrélation entre le poids d'un meuble et sa distance au camion — **c'est la vraie courbe de difficulté du jeu**, pas le nombre de pièges ;
- la règle du dilemme sonore (2.4.1), vérifiée à la composition du contrat ;
- une zone tampon garantie autour de l'entrée (2.5.7).

**Orientation :** génération d'un **graphe logique** (pièces, connexions, rôles) puis habillage par modules, plutôt qu'une approche purement géométrique qui produirait de l'espace sans garantie de gameplay.

**Note technique :** génération **déterministe par seed**. L'hôte tire une seed et la réplique ; chaque client génère localement. On synchronise un entier, pas des centaines de transforms. *(détail en Partie 3.)*

---

## 2.9. Évaluation & Débriefing

> **Section à définir.** Les principes sont posés, le barème ne l'est pas.

**Ce qu'elle recouvre :** le calcul de la note de fin de contrat, son impact sur la réputation en étoiles, et le tableau des scores qui clôt la mission.

**Principes posés :**
- La note dépend de critères qualitatifs cumulés : objets ramenés, objets oubliés, **intégrité** des objets livrés (2.4.2), collègues morts, corps récupérés ou non, départ avant la nuit.
- Le Sonomètre alimente le débriefing : **le bruit est mesuré, archivé, et ressorti au tableau des scores** (2.4.5).
- Le tableau décerne des **titres passifs-agressifs** avec statistiques à l'appui — « le plus bruyant », « celui qui a coûté le plus cher », « le lâche ». Sa fonction est sociale : lancer les débats et les disputes entre joueurs.
- Le meilleur joueur de la manche est désigné **Employé du Jour** ; sa voix compte double au vote du contrat suivant (2.2.2).

**À définir :**
- Le barème exact et la pondération des critères.
- La liste des statistiques traquées pendant le contrat.
- Les critères qui désignent l'Employé du Jour — et la question de savoir si ce doit être une récompense de performance ou un tirage comique.
- La liste des titres décernés.

---

## 2.10. Interface & Feedback Joueur

> **Section à définir.** Point de discussion ouvert : que contient-elle, et quel est le degré de diégèse acceptable ?

**Principe pressenti :** le jeu privilégie le **feedback diégétique** — le Sonomètre plutôt qu'une jauge d'écran, la cloche du monte-meuble plutôt qu'un indicateur de hauteur, la réaction de l'habitant plutôt qu'un cône de détection. Cette orientation doit être confrontée à ce que le joueur doit impérativement savoir.

**Informations à couvrir :**
- Réputation (étoiles), argent commun, contrats disponibles.
- Slots d'inventaire et objets équipés.
- Objectif du contrat et progression (que reste-t-il à sortir ?).
- Le temps restant avant la tombée de la nuit.
- Intégrité des objets portés (2.4.2).
- État du joueur : porte-t-il, est-il en mode dégradé, peut-il communiquer ?

**Règle déjà posée :** aucune information sur la détection. Ni rayon, ni jauge d'alerte, ni indicateur (2.4.3).

---

## 2.11. Structure de Session Multijoueur

> **Section à définir.** Les décisions d'architecture sont prises ; leurs conséquences de design ne le sont pas.

**Décisions actées :**
- Modèle **hôte-autoritaire en peer-to-peer** : un serveur maître (l'hôte) tranche les décisions de jeu.
- **Migration d'hôte** si l'hôte quitte la partie.

**Questions de design à trancher :**
- Rejoindre en cours de partie : possible, et à quel moment de la boucle ?
- Que se passe-t-il pour un joueur déconnecté en pleine mission — son personnage, son corps, sa part de l'argent commun ?
- Lobby public / privé, invitations, mot de passe.
- Comportement du jeu en dessous de 2 joueurs.

*Détails techniques en Partie 3.*

---

# PARTIE 3 : DOCUMENT TECHNIQUE & PRODUCTION (TDD)

> **Partie à construire.** Elle organise la manière dont le jeu va être fabriqué. L'approche retenue est de s'appuyer sur les solutions éprouvées de jeux existants du genre plutôt que de réinventer.

## 3.1. Stack technique

| | |
|---|---|
| **Moteur** | Unity 6.3 |
| **Réseau** | FishNet — architecture peer-to-peer hôte-autoritaire, avec migration d'hôte |
| **Audio** | *(à définir)* |
| **Graphique / 3D** | *(à définir)* |
| **Langage & IDE** | C# — *(IDE à définir)* |

## 3.2. Architecture réseau *(à rédiger)*

**Points identifiés comme critiques :**

- **L'analyse vocale est locale par nécessité** (le signal brut ne quitte pas la machine du joueur), mais son résultat pilote la physique partagée. En hôte-autoritaire, cela signifie faire confiance au client sur une donnée de gameplay. **C'est le premier risque de désynchronisation et de triche du projet.** À traiter en priorité.
- **L'autorité physique sur un objet porté par plusieurs ragdolls, dont la masse varie en temps réel.** C'est le principal mur technique du projet, avant l'audio.
- **La génération de niveau déterministe par seed** (2.8.1) : on réplique un entier, pas une scène.
- **L'Imitateur** (2.5) : les clients ayant déjà reçu la voix de leurs pairs par le chat de proximité, la rediffusion d'un fragment ne demande de transmettre qu'une référence, pas de l'audio. Piste à valider.
- **Le cri du Guetteur** (2.5) : son 2D strictement local, aucune réplication.

## 3.3. Gestion de projet & collaboration *(à définir)*

- Versioning *(à définir)*
- Task tracking *(à définir)*
- Communication *(à définir)*

## 3.4. Architecture du projet *(à remplir au fur et à mesure)*

- Conventions de nommage.
- Arborescence des dossiers.
- Architecture du code — notamment le format **data-driven** des habitants (2.5.2) et des meubles (2.4.1), chaque entité étant une configuration de valeurs et non une classe.

## 3.5. Pipelines de production *(à définir)*

- Pipeline 3D.
- Pipeline UI.
- Pipeline audio.

## 3.6. Performances et contraintes *(à définir)*

- Cible : PC / Steam.
- Budget polygones et textures.
- Framerate cible.
- Poids maximal du jeu.
- **Contrainte spécifique :** coût CPU de l'analyse audio temps réel, multipliée par 8 joueurs.
