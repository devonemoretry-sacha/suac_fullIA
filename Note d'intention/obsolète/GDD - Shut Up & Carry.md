# GDD Détaillé : SHUT UP & CARRY!

> Game Design Document — document de travail. Les blocs *Points ouverts* et *Pistes* signalent ce qui reste à trancher.

---

## Sommaire

- [PARTIE 1 : LE PITCH (High Concept)](#partie-1-le-pitch-high-concept)
  - [1.1. Fiche d'identité](#11-fiche-didentité)
  - [1.2. Le Logline (Pitch Elevator)](#12-le-logline-pitch-elevator)
  - [1.3. Les Piliers du Jeu (Game Pillars)](#13-les-piliers-du-jeu-game-pillars)
  - [1.4. L'expérience de jeu (Synopsis)](#14-lexpérience-de-jeu-synopsis)
  - [1.5. Inspirations et Références](#15-inspirations-et-références)
- [PARTIE 2 : GAMEPLAY & UNIVERS (Core Game Design)](#partie-2-gameplay-univers-core-game-design)
  - [2.1. Univers et Narration](#21-univers-et-narration)
  - [2.2. La Boucle de Gameplay (Core Loop)](#22-la-boucle-de-gameplay-core-loop)
  - [2.3. Les 3C (Caméra, Character, Contrôles)](#23-les-3c-caméra-character-contrôles)
  - [2.4. Mécaniques de jeu (Game Mechanics)](#24-mécaniques-de-jeu-game-mechanics)
    - [2.4.1 La Voice-Physics (Mécanique centrale)](#241-la-voice-physics-mécanique-centrale)
    - [2.4.2 Le port et le transport d'objets](#242-le-port-et-le-transport-dobjets)
    - [2.4.3 Le bruit, la détection et les monstres](#243-le-bruit-la-détection-et-les-monstres)
    - [2.4.4 La communication non-verbale](#244-la-communication-non-verbale)
  - [2.5. Objets & Économie (Items & Systems)](#25-objets-économie-items-systems)
  - [2.6. Bestiaire & Obstacles](#26-bestiaire-obstacles)
  - [2.7. Level Design & Environnements](#27-level-design-environnements)
- [PARTIE 3 : DOCUMENT TECHNIQUE & PRODUCTION (Technical Design Document - TDD)](#partie-3-document-technique-production-technical-design-document---tdd)
  - [3.1. Stack Technique (Outils utilisés)](#31-stack-technique-outils-utilisés)
  - [3.2. Gestion de Projet & Collaboration](#32-gestion-de-projet-collaboration)
  - [3.3. Architecture du Projet](#33-architecture-du-projet)
  - [3.4. Pipelines de Production](#34-pipelines-de-production)
  - [3.5. Performances et Contraintes (Target Specs)](#35-performances-et-contraintes-target-specs)

---

## PARTIE 1 : LE PITCH (High Concept)

### 1.1. Fiche d'identité

- **Titre du jeu :** Shut up & Carry!
- **Genre(s) :** Party-Game / Action-Physique / Horreur Comique Coopératif
- **Plateformes cibles :** Steam
- **Public cible :** Créateurs de contenu (Twitch/YouTube), groupes d’amis, fans de Lethal Company / Phasmophobia
- **Moteur / Technologie :** Unity 6.3
- **Joueurs : 2 à 8**

### 1.2. Le Logline (Pitch Elevator)

Vous et vos amis êtes les pires employés de *Karma Logistics*, une entreprise de déménagement interdimensionnelle sous-payée. Votre mission ? Vider les appartements de créatures cosmiques ou de sorciers excentriques. Le problème, c'est que les meubles sont vivants, maudits, et surtout... **hypersensibles au bruit**.

### 1.3. Les Piliers du Jeu (Game Pillars)

#### La Mécanique Centrale : La "Voice-Physics"

Le jeu utilise le microphone des joueurs non pas seulement pour communiquer (chat vocal de proximité), mais comme un contrôleur physique. Le poids, la texture et le comportement des objets portés réagissent en temps réel au volume et au pitch de la voix des joueurs IRL.

> *Règle d'or : La panique entraîne le bruit. Le bruit entraîne le chaos. Le chaos entraîne la chute.*

**Corollaire :** le jeu ne récompense pas le silence, il récompense le contrôle. Si se taire était toujours la meilleure stratégie, tout le reste du jeu deviendrait décoratif. Chaque contrat doit donc contenir au moins un élément qui oblige les joueurs à produire du son (règle détaillée en 2.4.1).

#### La Dissonance Émotionnelle

Le jeu force des situations absurdes où un joueur doit chuchoter une berceuse pendant que ses coéquipiers hurlent de terreur. Ce décalage se joue à deux niveaux : à l'intérieur de chacun, qui lutte contre sa propre panique pour garder la voix calme, et entre les joueurs, dont les états émotionnels se percutent en direct.

L'oscillation constante entre terreur et contrôle de soi crée des moments cinématiques involontaires : un joueur qui tremble de peur en essayant de chanter doucement, un coéquipier qui étouffe un rire pour ne pas réveiller le monstre, une équipe entière figée dans le silence absolu alors qu'une créature fait trembler les murs.

#### La Coopération sous Contrainte

On ne réussit qu'ensemble, mais nos actions se gênent mutuellement. Les objets lourds se portent à plusieurs et les objectifs exigent une vraie coordination, mais la voix de chacun affecte tout le groupe : il ne suffit pas de bien faire sa part, encore faut-il composer avec les autres.

C'est de cette friction que naissent les moments dont on se souvient : les fous rires, les engueulades, les "CHUUUT !" hurlés un peu trop fort. Trois joueurs stabilisent un meuble pendant qu'un quatrième, à côté, jure à voix haute et fait tout basculer.

#### La Maîtrise Progressive du Chaos

Au début, tout est subi. L'environnement est imprévisible, les maps changent à chaque partie, et la panique dicte sa loi. Mais peu à peu, les joueurs apprennent à apprivoiser les objets, à moduler leur voix, à choisir leurs mots et leur timing. La progression n'est pas dans un arbre de talents : elle est dans le joueur lui-même.

Là où une équipe hurlait dans le chaos à ses débuts, elle finit par communiquer en murmures codés et en gestes discrets. C'est cette montée en maîtrise qui donne au jeu sa profondeur et donne envie d'y revenir.

### 1.4. L'expérience de jeu (Synopsis)

Chez Karma Logistique, personne ne vous a formé. On vous confie un camion, une adresse dans une dimension improbable, et une consigne : videz l'appartement avant la tombée de la nuit.

Mais ces appartements ne sont pas ordinaires, et leur mobilier encore moins. Ici, les meubles sont vivants, maudits, et hypersensibles au son. Or dans ce jeu, c'est **votre propre voix** — captée par votre micro — qui agit sur le monde. Le Canapé de Plomb reste léger tant qu'on le porte en chuchotant, mais un cri le plaque au sol d'un coup. Le Matelas à Mémoire de Ton glisse sagement sous une voix grave, puis se change en trampoline incontrôlable dès qu'un rire aigu lui échappe. Et la Télévision Perroquet écoute en silence, enregistrant l'insulte de trop pour la rediffuser au pire moment. Déménager devient un exercice d'équilibriste vocal, où il faut parler juste assez pour se coordonner, mais jamais assez pour tout réveiller.

Car le silence n'est pas seulement une question de meubles. Une créature aveugle rôde entre les pièces, guidée par le seul son. Le joueur vit alors une expérience coopérative en dents de scie : de longues secondes de silence tendu quand le monstre approche, le relâchement quand il s'éloigne, puis le chaos lorsque quelqu'un panique, hurle, et fait tout basculer — le meuble, la mission, le sérieux de la situation. De cette tension naissent les fous rires comme les reproches, dans un jeu où l'on rit de sa propre défaite autant qu'on savoure ses réussites.

La mort n'y est pas douce. Se faire attraper met fin à votre mission, mais pas à votre soirée : les morts rejoignent un espace à part d'où ils observent leurs camarades encore en vie. On repart cependant de zéro à chaque nouveau contrat, tout le monde de retour sur pied — même si récupérer un corps a un coût, et qu'un déménagement qui finit à la morgue ne fait jamais très bonne impression sur l'évaluation finale.

#### Le But et la Progression

Le but est simple à énoncer, difficile à atteindre : bâtir sa réputation. On débute au plus bas, une étoile sur cinq, celle des bras cassés qu'on envoie vider un studio de trois mètres carrés. À force de contrats réussis, les avis clients s'accumulent et les étoiles montent. Mais rien n'est acquis : un déménagement bâclé, des objets abîmés, une équipe qui déguerpit à la nuit tombée, et la note dégringole.

À mesure que la réputation grandit, les mondes s'ouvrent : colocations d'étudiants sorciers, manoirs de vampires, tombeaux de momies — plus vastes, plus riches, plus dangereux. Chaque palier apporte ses objets capricieux et ses nouvelles règles à apprivoiser. Et pour ceux qui décrochent les cinq étoiles pleines, il ne reste qu'à raccrocher le tablier et savourer une retraite méritée.

Mais la chute guette autant que la gloire. Une équipe entière capturée, ou surprise sur place à la nuit tombée, voit son contrat sombrer et sa réputation avec. Et il existe un point de non-retour : celui qui, déjà retombé tout en bas de l'échelle, échoue une fois de trop. Sa dernière étoile s'éteint alors — et avec elle, l'aventure.

### 1.5. Inspirations et Références

- Lethal Company — le socle : le job de l'enfer en entreprise, la coop à 4, le chat de proximité obligatoire et l'esthétique lo-fi / VHS.
- Moving Out — la manipulation d'objets encombrants à plusieurs, et la frustration hilarante quand la coordination déraille.
- Chained Together — la dépendance forcée entre joueurs, où la maladresse d'un seul condamne tout le groupe.
- Phasmophobia (et les mods "Skinwalker") — la paranoïa liée au son, la peur d'être trahi par sa propre voix.

#### La proposition unique : Voice-Physics

Nous n'avons pas trouvé de jeu qui utilise le micro comme **outil de contrôle physique** de manière aussi fine et structurée. L'idée centrale — transformer chaque bande de fréquence vocale en **levier mécanique** sur des objets — ouvre des possibilités qu'aucun titre n'a vraiment explorées à ce jour. C'est à la fois une prise de risque et une opportunité.

---

## PARTIE 2 : GAMEPLAY & UNIVERS (Core Game Design)

> *C'est le cœur du GDD. C'est ici que tu détailles les règles du jeu. Cette partie s'étoffera beaucoup avec le temps.*

### 2.1. Univers et Narration

#### Le Lore

Le monde de Shut Up and Carry est un patchwork d'époques et de genres qui coexistent sans logique apparente. On y croise des créatures fantastiques.

Le joueur est immergé dans une petite entreprise de déménagement, Karma Logistique, qui cherche à se faire une réputation pour devenir la référence de son domaine.

#### Créatures & univers croisés

- Vampires
- Momies
- Sorciers
- Gobelins
- Fées

#### Ton & ambiance

- Ambiance mélangeant sérieux et loufoque, façon Overcooked.
- L'humour naît du sérieux avec lequel les personnages traitent des situations délirantes.
- Univers anachronique assumé : contrats reçus par fax, camion qui lévite façon Retour vers le Futur, déménager la pyramide d'une momie comme on viderait un studio.
- Un univers où toutes les ambiances peuvent se côtoyer.

Le postulat : déménager, c'est déranger. Les lieux qu'on vide ne sont pas inhabités.

#### Le Protagoniste

Le joueur incarne un déménageur. Look volontairement cliché du métier, lisible au premier coup d'œil, poussé vers le comique.

#### Le cliché du déménageur (pistes de skin)

- Silhouettes archétypales : le petit gros en salopette, le grand mince, le costaud tatoué…
- Panoplie visuelle : ceinture lombaire, gants
- Attitude blasée d'ouvrier qui en a vu d'autres

#### Identité visuelle prévue

- Choix homme / femme
- Cosmétiques loufoques (tenues, accessoires) — déblocage / personnalisation

#### L'équipement réglementaire : le Sonomètre

Les chantiers imposent des dosimètres de bruit à leurs ouvriers. Karma Logistique en colle un sur le torse de ses employés — pas pour leur sécurité, pour son assurance. Un boîtier gris, une aiguille de VU-mètre analogique, une échelle sérigraphiée du vert au rouge.

- Ce n'est pas un élément de décor, c'est l'interface de la Voice-Physics. Sans lui, la réaction des objets est une boîte noire ; avec lui, chaque écart vocal devient visible et attribuable.
- L'aiguille analogique plutôt qu'un afficheur numérique : plus lisible de loin, plus cohérente avec l'univers anachronique, et son inertie fait qu'elle tremble quand on chuchote sous tension.
- Il alimente le débriefing : le bruit est mesuré, archivé, et ressorti au tableau des scores de fin de contrat.
- Support cosmétique naturel : boîtiers, cadrans, aiguilles.

**Limite à ne pas franchir :** le sonomètre mesure ce que le joueur émet, jamais ce que cela provoque. Il dit « tu as crié » ; il ne dit pas « il t'a entendu » (cf. 2.4.3).

#### Les Antagonistes / PNJ

Trois familles d'opposition, de la plus vivante à la plus passive. Toutes partagent un dénominateur commun : elles réagissent au bruit, et le bruit vient des joueurs.

#### Les Monstres — antagoniste principal

- Invincibles (on ne les combat jamais) et aveugles (guidés au son).
- Se déplacer lentement et en silence = indétectable, même de près.
- Courir attire leur attention ; parler les fait foncer sur la source ; plus on parle fort, plus le rayon de détection s'étend.
- Tangibles, visibles et effrayants (embuscade, colosse qui fait trembler les murs, créature longeant les murs…).
- Reskinnés selon le biome, débloqués progressivement (une menace à la fois).
- Un seul sur certaines maps, plusieurs cohabitant sur d'autres.

#### Les Pièges de map — antagoniste "architectural"

- Le lieu lui-même est hostile. Ex. : portes qui dévorent si on les franchit bruyamment, tourelles qui repèrent au son, zones de vide / chutes mortelles spectaculaires.
- Même logique sonore que les monstres (pour les pièges qui y réagissent).

#### Les Menaces environnementales — les meubles

- Pas des ennemis : le relais physique entre la voix et le danger.
- Réagissent aux fréquences de la voix (bougent, basculent, font du bruit).
- Le meuble n'attaque pas : il trahit.

### 2.2. La Boucle de Gameplay (Core Loop)

Le jeu s'articule autour de trois boucles imbriquées, à des échelles de temps croissantes. La tension permanente entre contrainte du silence et nécessité d'agir est le moteur émotionnel qui relie l'ensemble.

- Micro-boucle (moment-to-moment, quelques secondes)

Le cycle d'actions que le joueur répète en continu sur la map :

Se déplacer / Explorer → Gérer sa voix → Porter

- Explorer : parcourir le lieu pour repérer les meubles à déménager.
- Gérer sa voix : communiquer et se coordonner tout en maîtrisant l'impact sonore (voice-physics + éveil des trackers).
- Porter : saisir les objets et les ramener au camion.

- Boucle de mission (une manche / un contrat)

Voter un contrat → Arriver sur la map → Vider le lieu (micro-boucle) → Repartir avant la nuit → Être évalué

- Choix du contrat — 2 à 3 contrats proposés

(le nombre et la difficulté dépendent des réussites passées).

Vote collectif à la punaise sur le tableau. En cas d'égalité, la voix de l'Employé du Jour (meilleur joueur de la manche précédente) compte double.

- Objectif — Tout vider (métier de déménageur). Un système de quota qualitatif module la note : objets oubliés, objets abîmés, collègues morts… tout influe sur l'évaluation.
- Extraction — Retour obligatoire au camion. Le camion peut partir dès qu'un joueur le déclenche (source de chaos volontaire, façon Lethal Company). Un timer (tombée de la nuit) force le départ :
- Joueurs absents du camion → réimprimés (avec pénalité).
- Aucun joueur dans le camion à la nuit → partie perdue.
- Évaluation — Note qui fait stagner / monter / descendre la réputation en étoiles.

- Méta-boucle (progression long terme, plusieurs sessions)

Évaluation → Réputation (étoiles) → Argent commun → Boutique → Nouveaux contrats plus durs

- Réputation en étoiles : conditionne l'accès aux contrats et le nombre/difficulté des offres. Bien travailler ouvre de meilleurs contrats (plus d'étoiles, plus d'argent).
- Argent commun (non individuel) : gagné en mission, dépensé dans la boutique du camion (accessoires, objets d'aide type diable).
- Réimpression des collègues : automatique entre les manches (justification narrative du respawn), mais ponctionne l'argent commun → une mort coûte au groupe.
- Sensation de progression : difficulté croissante + accumulation d'accessoires = montée en puissance ressentie.

### 2.3. Les 3C (Caméra, Character, Contrôles)

#### Caméra

- Vue à la première personne (FPS).
- Certains objets encombrants peuvent gêner le champ de vision

#### Character

Le personnage dispose de tous les mouvements de base, tous fortement modulés par le port d'objets :

- Marcher — Déplacement standard, silencieux. Ralenti selon le poids porté.
- Courir — Déplacement rapide, mais génère du bruit. Certains objets empêchent totalement la course.
- S'accroupir — Déplacement lent et discret.
- Sauter — Saut standard. Réduit, voire impossible selon le poids porté.

#### Principes clés

- Le déplacement est une source sonore. Courir alerte les monstres (cf. 2.6). Le son n'est donc pas uniquement vocal : la gestion du bruit est globale (voix + déplacements).
- Le déplacement n'affecte pas les meubles, uniquement les monstres.
- Le port d'objets impacte fortement la mobilité : vitesse, course, hauteur de saut.
- Le poids peut être dynamique : certains objets voient leur poids varier selon la voix des joueurs, modifiant en temps réel la capacité à se déplacer/sauter.

#### Communication non-verbale

- Le personnage peut communiquer sans parler, via des expressions physiques (ex : mouvements de tête, gestes des bras).
- Volontairement imparfaite/imprécise, pour rester une source de confusion et de comique — cohérent avec un jeu où la parole est contrainte.
- Constitue un véritable outil de coordination non-verbal. (mécanique détaillée en 2.4)

#### Contrôles

- Priorité PC — Clavier / Souris (cible Steam).
- Support manette prévu, mais le gameplay est conçu d'abord pour clavier/souris — jamais dépendant de la manette.
- Assignation des touches à définir ultérieurement (point ouvert).

### 2.4. Mécaniques de jeu (Game Mechanics)

#### 2.4.1 La Voice-Physics (Mécanique centrale)

La Voice-Physics est le cœur du jeu. La voix des joueurs n'est pas seulement un canal de communication : c'est un contrôleur physique. Le volume, la hauteur et la texture de la parole agissent en temps réel sur le comportement des objets transportés.

Cette section décrit le modèle universel qui régit toutes les interactions voix-objet. Les règles concrètes de chaque meuble sont détaillées dans le catalogue dédié.

##### Principe fondateur

La voix est une force. Toute émotion émise devient une contrainte physique.

Le jeu ne cherche pas à récompenser le silence absolu, ni le bruit : il récompense le **contrôle**. Chaque objet impose sa propre discipline vocale, et l'équipe doit ajuster sa manière de communiquer à ce qu'elle transporte.

##### Le dilemme sonore

Le silence ne doit jamais devenir la stratégie dominante. Si parler ne rapporte rien et coûte toujours quelque chose, la meilleure équipe est la plus muette — et le jeu perd exactement ce qui fait sa saveur au moment précis où les joueurs deviennent bons.

**Règle opposable :** chaque contrat doit contenir au moins un élément qui exige activement du son. La contrainte porte sur le contrat, pas sur la map : elle se vérifie au moment de la composition, et un seul des trois leviers suivants suffit à la satisfaire.

- **Un élément du lieu** — un dispositif qui réclame du bruit pour fonctionner, ou pour révéler l'espace.
- **Un meuble à déménager** dont la règle vocale impose une émission sonore.
- **Un système transversal** — équipement déployable, contre-mesure face aux monstres, contrainte d'infrastructure.

Alterner ces trois leviers évite que la règle ne devienne un tic de level design visible.

> *La question posée au joueur n'est jamais « est-ce que je me tais ? », mais « combien de bruit puis-je me permettre, ici, maintenant ? ».*

**Piste à l'étude — la Minuterie :** l'éclairage des parties communes fonctionne sur une minuterie à détection sonore ; un silence prolongé plonge le lieu dans le noir. Le bruit devient une dépense d'entretien permanente plutôt qu'une corvée ponctuelle, et la pression monte d'elle-même à mesure que la nuit tombe et que la lumière du jour cesse de compenser. C'est le seul levier identifié qui traite le dilemme au niveau du système et non contrat par contrat. À arbitrer lors de l'écriture du catalogue d'objets, dont il recoupe le territoire.

##### La grille à trois briques

Tout objet sensible à la voix se décrit par la combinaison de trois briques :

**1. Le paramètre d'entrée** — ce que l'objet « écoute » dans la voix :

- **Le volume** — l'intensité sonore (chuchoter ↔ crier).
- **La hauteur (pitch)** — le registre de la voix (grave ↔ aigu).
- **La forme temporelle** — la nature du son dans le temps : **continu** (une note tenue, une parole soutenue) ou **percussif** (un son sec et bref : « tic », claquement de langue, coup).

**2. Le mode de déclenchement** — comment l'objet interprète cette entrée :

- **Proportionnel / continu** — l'objet réagit en temps réel, proportionnellement à l'intensité de l'entrée.
- **À seuil** — l'objet se déclenche au franchissement d'une limite précise.
- **Au cumul multi-joueurs** — le déclenchement dépend du nombre de voix simultanées dans la zone.

**3. La réaction physique** — ce que l'objet fait en réponse :

- Modification d'une propriété physique (masse, friction, stabilité…).
- Déclenchement d'un événement (explosion, flash, enregistrement…).
- Génération d'un effet de perception (sonar, hallucinations, lumière…).

##### Ce que la mesure interdit

Deux contraintes ne viennent pas du design mais de la physique du signal. Elles s'imposent à tout objet présent et futur, et aucune valeur de réglage ne peut les contourner.

- **Le chuchotement n'a pas de hauteur.** Un murmure est un son non-voisé : il ne contient aucune fréquence fondamentale à mesurer. Son volume et sa forme temporelle restent parfaitement lisibles — c'est ce qui fait fonctionner les objets sensibles à la masse — mais sa hauteur n'existe pas. **Aucun objet ne peut donc exiger simultanément de chuchoter et de tenir une hauteur donnée.**
- **Les consonnes non plus.** Fricatives et occlusives sont non-voisées. Un objet sensible à la hauteur ne doit réagir que sur les portions voisées de la parole, sous peine de s'affoler à chaque consonne.

Ces deux règles sont vérifiables : l'analyse indique à chaque instant si la hauteur mesurée est fiable ou non (cf. 3.3).

##### Les deux modulateurs transversaux

Ces deux règles s'appliquent à **tous** les objets, en surcouche de la grille :

- **La distance** — l'impact de chaque voix décroît avec l'éloignement. Chaque joueur possède une zone d'influence sonore ; un joueur éloigné pèse moins qu'un joueur proche.
- **Le cumul** — les voix de tous les joueurs présents dans la zone d'un objet s'additionnent. Un objet ne distingue pas *qui* parle : il subit la somme des voix qui l'entourent. C'est ce qui rend la coordination collective indispensable — un seul joueur indiscipliné peut compromettre l'effort de toute l'équipe.

##### L'équité vocale

Les voix ne sont pas comparables. Une voix grave et une voix aiguë, un micro saturé et un micro faible ne produisent pas les mêmes valeurs pour le même effort. Sur des seuils absolus, certains joueurs seraient structurellement avantagés ou punis : un objet sensible aux graves avantagerait mécaniquement une partie de l'équipe, et le joueur puni accuserait le jeu — à raison.

**Règle :** aucun seuil ne s'exprime en valeur absolue. Chaque joueur est calibré au premier lancement (niveau de repos, hauteur médiane, niveau de cri), et toutes les mesures s'expriment ensuite en écart relatif à cette référence personnelle. Les mutateurs qui déforment la voix s'appliquent après cette normalisation, jamais avant.

**Conséquence technique :** l'analyse porte sur le signal brut du micro, en amont des traitements de confort (détection d'activité vocale, correction automatique de gain, suppression de bruit). Ces traitements sont conçus pour isoler la parole et supprimer le reste : ils effacent l'écart chuchotement/cri et détruisent les sons percussifs, c'est-à-dire deux des trois paramètres d'entrée de la grille. Le jeu utilise donc deux voies distinctes — le signal traité pour la communication, le signal brut pour l'analyse.

##### Intention de design

- **Diversité** : en combinant les trois briques, on génère une immense variété de comportements à partir d'un socle simple et lisible.
- **Data-driven** : chaque objet est une configuration de valeurs sur cette grille, ajustable en playtest sans retoucher le code.
- **Extensibilité** : tout nouvel objet imaginé à l'avenir doit pouvoir se décrire dans cette grille. Si ce n'est pas le cas, c'est le signe qu'il faut réinterroger le modèle — pas le contourner.

#### 2.4.2 Le port et le transport d'objets

##### Principe fondateur

**La prise est magnétique (confort), mais le lien est physique** **(challenge)**.

Attraper un objet est instantané et sans friction. Mais une fois saisi, le joueur est lié physiquement à une masse vivante que la voix vient perturber.

Toute la difficulté vient de la voix — jamais des contrôles.

##### La prise (magnétique)

En s'approchant d'un objet, les bras du personnage se positionnent automatiquement sur des points d'ancrage. Pas de contrôle manuel des bras, pas de « hand simulator ». Attraper = simple et lisible.

La saisie est **instantanée** : pas d'animation longue, on garde l'arcade lisible. Les bras se positionnent façon aimant, visibles seulement **au dernier moment** quand on est très proche. Les points d'ancrage sont signalés par un **repère visuel** sur l'objet (forme exacte à affiner en test). Un **feedback sonore** accompagne la saisie (confort joueur) mais **n'attire jamais les monstres**. **Un seul joueur par point d'ancrage** — pas de partage d'un même ancrage.

##### Le lien (physique / ragdoll)

L'univers est **ragdoll, à physique continue** : un objet lâché **conserve son momentum** (réf. feel *Super Battle Golf*). La prise est **binaire** — on tient ou on ne tient pas, jamais de « demi-prise » qui glisse.

Une fois porté, l'objet et le joueur sont connectés par deux transferts physiques :

- **Transfert de poids (continu)** — le poids de l'objet, modulé par la voix, altère le déplacement : ralentissement, corps tiré, saut réduit. → ex. Canapé de Plomb : léger si chuchote, écrasant si crie.
- **Transfert de mouvement (secousses)** — les vibrations de l'objet, déclenchées par la voix, se propagent au porteur et aux joueurs proches : marche titubante, trajectoire déviée, jusqu'au ragdoll collectif. → ex. Frigo-Fusée : tremble puis embarque toute l'équipe.

##### Portabilité (3 catégories)

- Solo — portable seul. Occupe les joueurs surnuméraires, fluidifie les nombres impairs.
- Collectif obligatoire — plusieurs points d'ancrage à remplir. Cœur de la coopération forcée.
- Hybride — traînable seul avec forte pénalité, bien meilleur à plusieurs. Crée l'entraide organiquement.

##### Le lâcher

- **Volontaire** — le joueur relâche à tout moment. **Léger délai anti-spam** avant re-saisie (non punitif).
- **Subi (canon)** — la Voice-Physics peut rompre le lien. Défini **objet par objet**, généralement **brutal** (pas de glissement progressif) :
  - *Canapé de Plomb* → pas d'arrachage : le joueur reste **coincé/immobilisé** tant que les voix ne se calment pas pour réalléger l'objet.
  - *Frigo-Fusée* → joueurs entraînés puis **éjectés** chacun dans sa direction par l'inertie à la séparation.

##### Règle de design transversale

Aucune friction sur l'attrape. Toute la friction vient de la voix. Le joueur doit toujours penser « c'est galère parce qu'on parle trop fort », jamais « c’est galère d'attraper ».

##### Points ouverts

- Retour visuel du transfert de secousses (caméra ? animation ? les deux ?)
- Feedback quand un objet hybride est « trop lourd en solo » (signal clair d'appel à l'aide)

#### 2.4.3 Le bruit, la détection et les monstres

##### Principe fondateur : les monstres sont le miroir des objets.

Là où la Voice-Physics déforme les meubles, elle attire les monstres. La même voix qui complique le transport est aussi celle qui vous fait repérer. Chaque mot est un double risque.

##### Nature des monstres

- **Invincibles** — on ne les combat pas, on les évite.
- **Visibles** — menace tangible. Certains restent tapis dans l'ombre (effet de surprise), d'autres sont imposants et spectaculaires (font trembler sol et murs).
- **Comportement variable :**
- Certains patrouillent selon une routine à travers le niveau.
- D'autres sont statiques, ancrés à une zone.

##### Ce qui alerte un monstre (le « bruit »)

- **La voix** (source principale) — mesurée sur le volume.
- **Les actions fortes** — courir près d'un monstre, faire tomber un objet.
- **Certains objets bruyants** — ex. la TV perroquet qui répète les sons.

Le déplacement discret n'alerte pas — marcher lentement en silence = sûr.

##### États de détection (progressifs)

- **Routine** — le monstre vaque, ignore les joueurs.
- **Intrigué** — un bruit modéré l'attire ; il vient investiguer la zone. Si les joueurs se figent et se taisent → il finit par repartir et reprend sa routine.
- **Alerté / poursuite** — un bruit franc (voix forte, course) le fait foncer vers la source. Une fenêtre d'évasion existe (temps de course, fuite), mais elle est courte.
- **Capture** — s'il rattrape un joueur : **mort instantanée** du joueur.

**Note de design** : pas de mort-couperet. Être repéré n'est pas une mort instantanée. Il y a toujours un délai, une tentative de fuite possible. La tension vient de l'incertitude, pas d'une punition automatique.

**Note de design :** la portée du bruit n'est jamais affichée. Ni rayon de propagation, ni jauge d'alerte, ni indicateur de détection. Le joueur apprend l'étendue de sa propre zone d'influence par essai et erreur, et son seul retour est la réaction du monstre lui-même : il s'arrête, tourne la tête, change de direction. L'incertitude est la mécanique, pas un manque d'information — un monstre lisible cesse d'être effrayant.

- **Pistes ouverte**s (à trancher au bestiaire — 2.6)

- **Apaisement par le chant** : plutôt que reconnaître une mélodie (trop complexe), détecter un son tenu, stable, dans une bande de fréquence donnée (note maintenue) → « endort » certains monstres. Codable, à tester.
- **Exploitation de la hauteur/fréquence** : un monstre sensible uniquement aux aigus ? Aux graves ? Piste pour diversifier le bestiaire.
- **« Brain » un monstre** : réussir à courir sans bruit pour le semer/le contourner.

#### 2.4.4 La communication non-verbale

##### Principe fondateur

Dans un jeu où parler est dangereux, les joueurs ont besoin de se coordonner autrement. Mais l'outil non-verbal est **volontairement imparfait** : assez expressif pour tenter des choses, assez imprécis pour créer confusion et fous rires.

On ne cherche pas une communication efficace. On cherche une communication *expressive et ambiguë*.

##### Le canal toujours disponible : la tête et les yeux

- La tête du personnage suit la caméra : les coups de souris (droite, gauche, haut, bas) se traduisent en mouvements de tête visibles par les autres.
- Les **yeux « ragdoll »** — physiques et lâches — ballottent dans la direction du mouvement. Volontairement loufoques et imprécis : on saisit l'intention (« par là ! ») sans jamais un pointage net.
- Ce canal reste actif **même les mains pleines**. C'est le langage de base, celui qui survit quand tout le reste est coupé.

##### Les canaux « mains libres » (coupés dès qu'on porte)

- **Pointage du doigt** — touche maintenue, visée à la souris. Précis, idéal pour guider. Ralentit **très légèrement** le joueur (feedback, pas punition). **Purement diégétique** : c'est le bras qui se lève, visible seulement en ligne de vue directe — pas de marqueur à travers les murs.
- **Emotes** — catalogue expressif, orienté fun et contenu plutôt que coordination critique.

##### Aucun son sur le non-verbal

Le canal non-verbal est le seul moyen de communiquer **sans risque** face aux monstres. C'est sa récompense implicite : safe, mais imprécis.

##### Règle d'or

**Plus tu portes, moins tu peux communiquer.** Mains pleines → tête + yeux uniquement. Mains libres → pointage + emotes en plus.

Porter un objet rend **doublement dépendant** : physiquement (cf. 2.4.2) *et* communicationnellement. Le porteur subit et perd la parole utile ; le joueur mains libres devient le guide. Les rôles émergent d'eux-mêmes.

##### Points ouverts

- Liste précise des emotes (à définir plus tard, faible priorité).

  - **Mécaniques secondaires :** (ex: Mini-jeux, crochetage, pêche).

### 2.5. Objets & Économie (Items & Systems)

#### L'équipement — trois catégories

- **Porté** — les meubles à déménager, régis par la Voice-Physics (2.4.1) et les règles de transport (2.4.2).
- **Consommable** — objets d'aide emportés en mission, inventaire limité.
- **Déployable** — matériel installé sur place, acheté à la boutique du camion. Ne se porte pas, ne se consomme pas : il modifie le déroulement du contrat.

#### L'économie

- Argent commun, jamais individuel. Gagné en mission, dépensé à la boutique du camion (cf. 2.2).
- La réimpression des collègues ponctionne cette caisse commune : une mort coûte au groupe.

#### Progression

- Pas d'arbre de compétences, pas de montée en niveau. La progression est celle du joueur lui-même (cf. 1.3), doublée de l'accumulation d'équipement et de la montée en réputation.

#### Le Monte-meuble (déployable)

L'échelle à plateau qu'on colle à la façade pour sortir un meuble par la fenêtre. Il fonctionne à la note tenue : un joueur soutient un son continu depuis la rue et le plateau monte ; la note casse, le plateau redescend.

**Ce qu'il apporte : une seconde route d'extraction.** L'escalier est lent, pénible, et impose le silence. La façade est rapide, spectaculaire, et impose au contraire de produire du son. Les deux routes ne demandent pas la même discipline vocale — c'est le dilemme sonore (2.4.1) sous forme de choix stratégique acheté, plutôt que de contrainte imposée par la map.

- **Acquisition** — achat permanent, cher. Le nombre d'usages assure seul la régulation : pas de double coût.
- **Usages** — trois montées par contrat, rechargées entre les contrats. La question d'équipe devient : quels trois meubles méritent la façade ?
- **Joueurs mobilisés** — deux au minimum : un dehors qui tient la note, un dedans qui charge et détache.
- **Emplacement** — points d'ancrage balisés en façade, placés au level design. Pas n'importe quelle fenêtre.
- **Statut** — toujours optionnel. Aucun meuble ne doit passer uniquement par la façade, sous peine de bloquer une équipe qui n'a pas l'équipement.

**Le transfert d'effet.** Le meuble est sanglé au plateau : sa physique propre est désactivée, il ne peut pas tomber. Mais son profil vocal est reporté sur le plateau — un objet sensible à la masse le fait caler, un objet instable le fait tanguer, un objet sensible à la hauteur exige que la note soit tenue juste et pas seulement tenue. La voix reste donc maîtresse pendant toute la montée, au lieu d'être neutralisée au moment le plus vocal du jeu, et un seul dispositif produit autant de variantes qu'il y a de meubles.

**Les deux modes d'échec.** L'intensité de la note pilote la vitesse, sa durée pilote la distance : il faut relâcher en approchant de la fenêtre.

- **La note casse** (souffle, rire, panique) — le plateau redescend doucement. Aucune montée perdue, on recommence.
- **Dépassement de la hauteur maximale** (trop fort, trop longtemps) — le limiteur de sécurité renvoie le plateau au sol. Une montée perdue sur les trois.

> *On échoue par excès, jamais par insuffisance. Rater par faiblesse est gratuit ; rater par excès se paie.*

**Le relais.** Un joueur ne tient pas une note quinze secondes. Un second la reprend avant que le premier ne craque, et le plateau ne redescend que s'il y a un trou entre les deux.

**La lisibilité.** Une cloche mécanique sonne à chaque étage : on sait où on en est à l'oreille, sans interface. Et comme c'est un son, il porte — l'appareil qui renseigne est aussi celui qui dénonce.

**Le garde-fou.** L'escalier fonctionne toujours. Un monte-meuble entièrement raté coûte de l'argent et du temps, jamais un contrat.

#### Points ouverts

- Largeur de la fenêtre vocale acceptable et lisibilité de l'approche (tuning en playtest).
- Comportement du plateau lorsque le joueur intérieur est encore en train de détacher le meuble.

### 2.6. Bestiaire & Obstacles

- **Types d'ennemis :** (Comportement IA, points faibles, attaques).
- **Boss :** Mécaniques spécifiques.
- **Obstacles environnementaux :** (Pièges, portes fermées, zones toxiques).

### 2.7. Level Design & Environnements

- **Structure du monde :** Monde ouvert, niveaux linéaires, hub central ?
- **Liste des Biomes/Zones :** Description visuelle et contraintes de gameplay de chaque zone.

---

## PARTIE 3 : DOCUMENT TECHNIQUE & PRODUCTION (Technical Design Document - TDD)

> *Cette partie est dédiée à l'équipe de production (dév, artistes, son). Elle organise la manière dont le jeu va être fabriqué.*

### 3.1. Stack Technique (Outils utilisés)

- **Moteur de jeu :** (ex: Unreal Engine 5.3)
- **Logiciels Graphiques :** (ex: Blender pour la 3D, Substance pour les textures, Photoshop pour l'UI).
- **Logiciels Audio :** (ex: FMOD, Wwise, Reaper).
- **Langages & IDE :** (ex: C#, C++, Visual Studio, Rider).

### 3.2. Gestion de Projet & Collaboration

- **Versioning (Gestion de code) :** Git, Perforce, Plastic SCM ?
- **Task Tracking :** Jira, Trello, Notion, HacknPlan ?
- **Communication :** Discord, Slack.

### 3.3. Architecture du Projet

#### Arborescence

Tout le code écrit pour le jeu vit sous **Assets/\_Project/**. Le reste de **Assets/** est réservé aux assets tiers — packages, plugins achetés — pour qu'on distingue toujours d'un coup d'œil notre code de celui des autres. Le tiret bas n'a qu'un rôle : garder le dossier en haut de la fenêtre Project.

- **Runtime/Voice.Core** — le cœur du système vocal : contrat de données, analyse du signal, calibration. C# pur, sans Unity.
- **Runtime/Voice.Capture** — l'accès au microphone et l'orchestration. Dépend d'Unity.
- **Runtime/Gameplay** — les objets qui réagissent à la voix.
- **Tests/EditMode** — les tests unitaires, exécutés sans lancer le jeu.
- **Settings** — les ScriptableObject de réglage. **Scenes** — les scènes.

#### Découpage en assemblies

Chaque module porte un fichier **.asmdef**, qui le compile en assembly séparée. Deux bénéfices : modifier un fichier ne recompile que son assembly, et une assembly ne peut utiliser que celles qu'elle déclare — les dépendances deviennent explicites et vérifiées par le compilateur.

- **SUAC.Voice.Core** — ne dépend de rien.
- **SUAC.Voice.Capture** — dépend de Voice.Core.
- **SUAC.Gameplay** — dépend de Voice.Core et Voice.Capture.
- **SUAC.Tests.EditMode** — dépend de Voice.Core.

**La règle structurante : Voice.Core ne référence pas Unity.** Son .asmdef porte l'option noEngineReferences, qui lui interdit l'accès à UnityEngine. C'est une contrainte volontaire. Cette assembly ne contient que des mathématiques de traitement du signal — mesurer un volume, trouver une hauteur, distinguer un son tenu d'un son percussif — et ces calculs n'ont besoin que de nombres.

- **Tests immédiats** — on vérifie l'analyse sur des sons calculés (sinus pur, bruit blanc, clic) sans micro et sans lancer l'éditeur, en quelques millisecondes.
- **Déterminisme** — mêmes entrées, mêmes sorties, toujours. Une régression devient visible.
- **Compilation rapide** sur toute la durée du projet.

Corollaire : si du code de Voice.Core se met à avoir besoin d'Unity, c'est qu'il n'est pas à sa place — il appartient à Voice.Capture.

#### Conventions de nommage

- **Namespaces** — SUAC.<Domaine>.<SousDomaine>, alignés sur les dossiers.
- **Fichiers** — un fichier par type public, portant son nom.
- **ScriptableObject de réglage** — suffixés Settings (ex. VoiceAnalysisSettings).
- **Conventions d'assets** (textures, matériaux, prefabs) — à définir quand la production artistique démarrera. Point ouvert.

#### Règles de code transversales

- **Aucune valeur de tuning en dur.** Les seuils vivent dans des ScriptableObject, ajustables en playtest sans recompiler — c'est l'exigence data-driven de 2.4.1 appliquée au code.
- **Zéro allocation dans le chemin chaud.** Les tampons de l'analyse audio sont alloués une fois au démarrage ; aucune méthode ne retourne de tableau. Un test vérifie qu'une longue série d'analyses n'alloue pas un octet, pour qu'une régression devienne une build rouge plutôt qu'une microcoupure découverte six mois plus tard.
- **Cadence fixe dans l'espace des échantillons, pas des frames.** L'analyse consomme des fenêtres contiguës de taille constante via un curseur de lecture : une frame lente en traite plusieurs, une frame rapide parfois aucune, mais le signal n'a jamais de trou et le résultat ne dépend pas du framerate.
- **Blocs découplés** — capture, analyse, effet. Chaque bloc a une responsabilité unique et ignore qui le consomme.

#### Le contrat de données

L'analyse produit une structure unique, **VoiceFrame**, qui est aussi ce qui transite sur le réseau : un volume, une hauteur, une continuité, et un indicateur disant si la hauteur est fiable.

Ses trois premiers champs sont exactement **les trois briques de 2.4.1** — volume, hauteur, forme temporelle. Le format n'est pas inventé pour les besoins du code : il est dérivé du game design. Un objet qui ne se décrit pas dans cette structure ne se décrit pas non plus dans la grille, et la règle d'extensibilité du modèle devient vérifiable à la compilation.

**Contrainte imposée par la mesure :** le chuchotement et les consonnes sont non-voisés, donc dépourvus de hauteur mesurable. Le champ Voiced signale à chaque instant si la hauteur est fiable. Les règles de design qui en découlent sont en 2.4.1.

### 3.4. Pipelines de Production

> *Comment on intègre un élément dans le jeu ?*

- **Pipeline 3D :** (ex: Modélisation -> Retopologie -> UV -> Texturing -> Import Moteur -> Création du Prefab/Material).
- **Pipeline UI :** Comment on passe de la maquette Figma au jeu.

### 3.5. Performances et Contraintes (Target Specs)

- **Budget de polygones / textures :** Limites à ne pas dépasser.
- **Framerate cible :** (ex: 60 FPS sur PS5, 30 FPS sur Switch).
- **Poids maximal du jeu.**
