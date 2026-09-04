# Game Concept: Shut Up & Carry !

*Created: 2026-09-03*
*Status: Draft*

> Extrait de `Obsedian_SUAC_FIA/GDD_Shut_Up_And_Carry_1.md` (PARTIE 1, canonique) le
> 2026-09-03, dans le cadre de la migration décrite par
> `docs/adoption-plan-2026-09-03.md`. Titres de sections en anglais (lus par les
> skills), corps en français.
>
> **Relecture collaborative effectuée le 2026-09-03.** Les cadres d'analyse que le
> GDD source ne contenait pas explicitement (MDA, PENS, Bartle) ont été proposés
> puis arbitrés avec l'auteur. Les points restés ouverts ne sont pas flous : ils
> portent un **déclencheur nommé** indiquant quand et où ils seront tranchés.

---

## Elevator Pitch

> C'est un party-game d'horreur comique coopératif où votre propre voix — captée
> par votre micro — devient un **contrôleur physique** : avec 1 à 7 amis, pires
> employés d'une entreprise de déménagement interdimensionnelle, vous devez vider
> des appartements hantés par du mobilier vivant et hypersensible au bruit, en
> luttant contre votre propre panique pour ne jamais crier.

---

## Core Identity

| Aspect | Detail |
| ---- | ---- |
| **Genre** | Party-Game / Action-Physique / Horreur Comique Coopératif |
| **Platform** | PC — Steam |
| **Target Audience** | Créateurs de contenu (Twitch/YouTube), groupes d'amis, fans de *Lethal Company* / *Phasmophobia* |
| **Player Count** | Coop 2 à 8 (cible finale) — **MVP : 4**, voir *MVP Definition* |
| **Session Length** | **Variable** — le contrat dure ce qu'il dure. Bornée en haut par l'échéance de la tombée de la nuit ; libre en deçà : les joueurs partent quand ils estiment avoir assez vidé, ou quand la peur l'emporte |
| **Monetization** | *(différé → plan de lancement)* |
| **Estimated Scope** | *(différé → premier `/sprint-plan` réel — inestimable honnêtement avant le MVP construit)* |
| **Comparable Titles** | *Lethal Company*, *Moving Out*, *Chained Together*, *Phasmophobia* |

---

## Core Fantasy

Vous êtes un déménageur minable de **Karma Logistics**, une entreprise
interdimensionnelle qui ne forme personne et paie mal. Ce qui rend ce travail
différent de n'importe quel autre déménagement virtuel : **votre voix réelle**,
celle qui sort de votre bouche en ce moment, est l'instrument qui décide si un
meuble maudit vous obéit ou vous trahit. Chuchoter n'est pas un choix
d'interprétation — c'est une compétence mécanique qui a un effet direct et
mesurable sur le monde.

Personne d'autre ne peut ressentir la panique à votre place. Le jeu ne teste pas
seulement vos réflexes de joueur, il teste votre capacité à garder le contrôle de
votre propre corps sous stress — pendant que vos coéquipiers, eux, hurlent.

---

## Unique Hook

**La proposition unique : Voice-Physics.**

Aucun jeu identifié n'utilise le microphone comme outil de contrôle physique de
façon aussi fine et structurée. L'idée centrale — transformer chaque bande de
fréquence vocale en levier mécanique sur des objets — n'a pas été vraiment
explorée à ce jour. C'est à la fois une prise de risque et une opportunité.

*Test « et aussi »* : c'est comme *Lethal Company* (coop à l'aveugle, chat de
proximité, esthétique lo-fi), **et en plus** votre voix elle-même — pas
seulement ce qu'elle communique, mais son volume et sa hauteur — est un
contrôleur physique qui agit sur les objets que vous portez.

---

## Player Experience Analysis (MDA Framework)

*Arbitré avec l'auteur le 2026-09-03.*

### Target Aesthetics (What the player FEELS)

| Aesthetic | Priority | How We Deliver It |
| ---- | ---- | ---- |
| **Fellowship** | **1** | Coopération sous contrainte forcée : les objets lourds exigent plusieurs porteurs, mais la voix de chacun affecte tout le groupe. **En cas de dilemme, ce qui crée des moments partagés l'emporte sur ce qui récompense la performance individuelle.** |
| **Challenge** | 2 | Maîtriser sa propre voix sous panique ; maîtrise progressive sans arbre de talents |
| **Sensation** | 3 | Le retour physique en temps réel (poids, texture, comportement) réagissant à la voix réelle du joueur |
| **Narrative** | 4 | Karma Logistics, la progression par réputation, le décor (créatures cosmiques, sorciers) — cadre léger, pas un moteur de drame |
| **Discovery** | N/A | **Écarté explicitement** : l'appartement ne cache rien. La redécouverte vient de la variation de disposition, pas d'un secret à trouver |
| **Expression** | N/A | Non mentionné dans le GDD source |
| **Submission** | N/A | À l'opposé du ton du jeu — la tension est un pilier, pas le confort |

### Key Dynamics (Emergent player behaviors)

- Les joueurs développent des codes non-verbaux (murmures, gestes) à mesure
  qu'ils maîtrisent le risque de parler — décrit explicitement en §1.3
  (« La Maîtrise Progressive du Chaos »).
- Un joueur qui panique et crie devient, de fait, la menace pour le reste du
  groupe — la faute est sociale autant que mécanique.

### La comédie doit survivre à la maîtrise

**Contrainte de design actée le 2026-09-03.** Le rire n'est pas un symptôme
d'incompétence qu'on accepte de perdre à mesure que l'équipe progresse : c'est un
objectif permanent. Un groupe expert doit encore rire.

Ce que cela impose : **le jeu doit contenir des sources de chaos qui ne cèdent pas
à la compétence.** La principale existe déjà dans le concept, et c'est la plus solide
qui soit :

> **La maîtrise individuelle est atteignable ; la maîtrise collective ne l'est pas.**

On peut devenir excellent avec sa propre voix. On ne contrôlera jamais celle des trois
autres. C'est le pilier « Coopération sous Contrainte » — « il ne suffit pas de bien
faire sa part, encore faut-il composer avec les autres ». La variable irréductible,
ce sont les autres joueurs, et elle ne s'épuise pas avec l'entraînement.

*Test de conception* : tout système dont la maîtrise supprimerait définitivement une
source de chaos partagé doit être requalifié. Un système qui rendrait une équipe
experte totalement silencieuse et coordonnée violerait à la fois cette contrainte et
le Pilier 1.

### Core Mechanics (Systems we build)

1. Analyse vocale en temps réel (volume, hauteur) → effet physique sur les objets portés (Voice-Physics)
2. Portage collectif d'objets à plusieurs points d'ancrage
3. Perception sonore des habitants (créatures) guidée par le bruit produit

---

## Player Motivation Profile

*Arbitré avec l'auteur le 2026-09-03.*

### Primary Psychological Needs Served

| Need | How This Game Satisfies It | Strength |
| ---- | ---- | ---- |
| **Relatedness** | Coopération sous contrainte, chat de proximité, fous rires et engueulades partagés | **Core — dominant** |
| **Competence** | La progression est explicitement « dans le joueur lui-même » (§1.3) — maîtrise de la voix, pas d'arbre de talents | Core |
| **Autonomy** | Le joueur choisit quand parler, comment moduler sa voix, quel risque prendre, et quand quitter le contrat | Supporting |

### Player Type Appeal (Bartle Taxonomy)

- [x] **Socializers** — **public principal.** Coop forcée, chat vocal de proximité, moments partagés et filmables
- [x] **Achievers** — réputation à cinq étoiles, campagne à progression de palier (§1.5)
- [ ] **Explorers** — **écarté** : l'appartement ne cache rien, la variation vient de la disposition
- [ ] **Killers/Competitors** — non pertinent, jeu coopératif sans PvP

### Flow State Design

- **Onboarding curve**: **calibration vocale explicite, suivie d'un tutoriel court.**
  L'étape de calibration est de toute façon techniquement obligatoire (plancher de bruit,
  repos, médiane et cri par joueur — voir ADR-0004) : elle devient le moment où le joueur
  découvre que chuchoter et crier produisent des effets différents. Le coût de production
  est donc déjà payé par une contrainte technique. Voir le système 13 de `design/mvp-scope.md`.
- **Difficulty scaling**: paliers de réputation débloquant des mondes plus vastes et plus dangereux (§1.5)
- **Feedback clarity**: retour physique immédiat sur les objets (poids, comportement) en fonction de la voix
- **Recovery from failure**: mort définitive pour le contrat en cours (espace des morts, observation) ; nouveau contrat reparti à zéro ; défaite de campagne seulement au point de non-retour (dernière étoile perdue)

---

## Core Loop

### Moment-to-Moment (30 seconds)

Moduler sa voix (volume, hauteur, silence) en portant ou en manipulant un objet
réactif, pour éviter qu'il ne devienne incontrôlable — seul ou à plusieurs porteurs.

### Short-Term (5-15 minutes)

Progresser dans un contrat : localiser et sortir les objets d'un appartement,
gérer la menace d'un ou plusieurs habitants attirés par le bruit, coordonner
l'équipe sans se faire trahir par sa propre voix.

### Session-Level (30-120 minutes)

**Durée variable, non prescrite.** Le contrat dure ce qu'il dure : borné en haut par
l'échéance de la tombée de la nuit, libre en deçà. Les joueurs décident eux-mêmes quand
extraire — assez vidé, ou trop dangereux pour continuer. Le nombre de contrats enchaînés
dans une soirée n'est pas fixé par le design : il émerge de l'endurance du groupe.

*Conséquence de conception* : la décision « on pousse ou on sort ? » devient un moment
de tension sociale à part entière, et elle est **collective** — donc cohérente avec
Fellowship en tête des aesthetics.

### Long-Term Progression

Bâtir sa réputation de une à cinq étoiles ; débloquer des mondes plus vastes et
plus dangereux (colocations d'étudiants sorciers, manoirs de vampires, tombeaux
de momies) ; la progression du joueur lui-même (maîtrise vocale) prime sur toute
progression de personnage (§1.5).

### Retention Hooks

- **Investment**: la réputation accumulée, qu'un contrat raté peut faire chuter
- **Social**: les moments de coop mémorables (fous rires, engueulades) que le
  GDD identifie explicitement comme le cœur de l'expérience recherchée
- **Mastery**: la progression « dans le joueur », pas dans un arbre de talents
- **Curiosity**: **la variation de disposition**, pas le contenu caché. Rien n'est
  dissimulé dans un appartement ; c'est la carte qui change. Les mondes débloqués
  ajoutent de la curiosité à plus long terme *(différé → hors périmètre MVP)*

---

## Game Pillars

### Pillar 1: La Voice-Physics récompense le contrôle, pas le silence

Le poids, la texture et le comportement des objets portés réagissent en temps
réel au volume et au pitch de la voix réelle du joueur. **Règle d'or : la
panique entraîne le bruit ; le bruit entraîne le chaos ; le chaos entraîne la
chute.** Si se taire était toujours la meilleure stratégie, tout le reste du jeu
deviendrait décoratif — chaque contrat doit donc contenir au moins un élément
qui oblige à produire du son.

*Design test*: si un système permettrait de terminer un contrat en restant
silencieux du début à la fin sans coût ni risque, ce pilier dit qu'il faut le
retravailler.

### Pillar 2: La coopération est sous contrainte, jamais confortable

Les objets lourds se portent à plusieurs, mais la voix de chacun affecte tout
le groupe — bien faire sa part ne suffit pas, il faut composer avec les autres.
C'est de cette friction que naissent les moments mémorables.

*Design test*: si un joueur peut réussir un contrat difficile en ignorant
totalement ses coéquipiers, ce pilier dit que le système est mal calibré.

### Pillar 3: La dissonance émotionnelle est un pilier, pas un accident

Le décalage entre panique intérieure et contrôle extérieur affiché — un joueur
qui tremble de peur en essayant de chanter doucement — doit être recherché
activement dans le design des menaces et des objets, pas laissé au hasard.

*Design test*: face à deux implémentations d'une menace, ce pilier fait
choisir celle qui force le plus ce décalage entre ressenti et voix produite.

### Anti-Pillars (What This Game Is NOT)

- **PAS un jeu de compétition** : aucune mécanique PvP ou de classement n'est
  décrite. Introduire de la compétition entre joueurs romprait le pilier 2.
- **PAS un jeu de progression de personnage classique** (arbre de talents,
  statistiques) : le GDD est explicite — « la progression n'est pas dans un
  arbre de talents, elle est dans le joueur lui-même » (§1.3).
- **PAS un jeu où le silence est toujours optimal** : voir Pilier 1 — c'est la
  contrainte de conception la plus stricte du document source.

---

## Inspiration and References

| Reference | What We Take From It | What We Do Differently | Why It Matters |
| ---- | ---- | ---- | ---- |
| *Lethal Company* | Le socle : job de l'enfer en entreprise, coop, chat de proximité obligatoire, esthétique lo-fi/VHS | La voix n'est pas qu'un canal de communication — c'est un contrôleur physique | Valide le format et le ton ; le hook (Voice-Physics) est la différenciation |
| *Moving Out* | Manipulation d'objets encombrants à plusieurs, frustration hilarante quand la coordination déraille | Ajoute la couche vocale : la coordination doit aussi composer avec le bruit produit | Valide que le portage collectif maladroit est une source de comédie fiable |
| *Chained Together* | La dépendance forcée entre joueurs, où la maladresse d'un seul condamne tout le groupe | La dépendance passe par la voix partagée, pas par une chaîne physique | Valide le principe de contrainte collective comme moteur de tension |
| *Phasmophobia* (+ mods « Skinwalker ») | La paranoïa liée au son, la peur d'être trahi par sa propre voix | La trahison n'est pas un mod optionnel, c'est la mécanique centrale du jeu de base | Valide que « ma propre voix peut me trahir » est une peur qui fonctionne déjà en jeu |

**Non-game inspirations**: *(différé → `/art-bible` et direction audio — c'est là que ça sert)*

---

## Target Player Profile

| Attribute | Detail |
| ---- | ---- |
| **Age range** | *(différé → plan de lancement)* |
| **Gaming experience** | *(différé → plan de lancement)* |
| **Time availability** | *(différé → plan de lancement)* |
| **Platform preference** | PC / Steam |
| **Current games they play** | *Lethal Company*, *Phasmophobia*, jeux coop à énigmes physiques |
| **What they're looking for** | Des moments de coop drôles et mémorables, filmables/streamables |
| **What would turn them away** | *(différé → plan de lancement)* |

---

## Technical Considerations

| Consideration | Assessment |
| ---- | ---- |
| **Recommended Engine** | Unity 6.3 LTS (`6000.3.18f1`) — déjà en place, voir `docs/engine-reference/unity/VERSION.md` |
| **Key Technical Challenges** | Analyse vocale temps réel low-latency ; physique répliquée à propriétaire partagé (objet porté par plusieurs joueurs) ; réseau P2P Steam |
| **Art Style** | Lo-fi à pics de qualité ciblés (décision du 2026-09-03, `LOG - Décisions techniques.md`) |
| **Art Pipeline Complexity** | *(différé → `/art-bible`)* |
| **Audio Needs** | Élevé — l'analyse vocale et le chat de proximité sont tous deux critiques au gameplay, pas seulement à l'ambiance |
| **Networking** | P2P Steam, FishNet (voir plan d'adoption — ADR à formaliser) |
| **Content Volume** | MVP : 1 appartement, 2-3 types de mobilier, 1 habitant. Au-delà *(différé → `/art-bible` et hors périmètre MVP)* |
| **Procedural Systems** | Génération de maps envisagée pour la variété (§1.3, §2.8) — **reportée hors MVP**, voir `design/mvp-scope.md` |

---

## Risks and Open Questions

### Design Risks

- La Voice-Physics n'a jamais été validée en jeu avec plusieurs joueurs qui
  paniquent réellement — le pari central du jeu n'a pas de preuve de plaisir.
- Le silence pourrait rester la stratégie dominante si l'obligation de produire
  du son (Pilier 1) est mal calibrée par contrat.

### Technical Risks

- Physique répliquée à propriétaire partagé (portage collectif) — un des
  problèmes les plus difficiles du netcode ; modèle d'autorité déjà décidé
  (host-only, voir plan d'adoption ADR-0002) mais jamais testé en réseau réel.
- Normalisation vocale entre joueurs (micros et voix hétérogènes) — décrite en
  §2.4 du GDD source, dépendante de `Voice.Core`.
- Latence de l'analyse audio en conditions réseau réelles.

### Market Risks

*(différé → plan de lancement. Non traité dans le GDD source, et sans influence sur
un choix de conception à ce stade.)*

### Scope Risks

- Le GDD source décrit un jeu complet (bestiaire multiple, économie,
  déployables, progression, débriefing) largement au-delà du périmètre MVP —
  voir `design/mvp-scope.md` pour la coupe actée.

### Open Questions

- Transport de la voix vs transport gameplay : **résolu** le 2026-09-03
  (Dissonance sur son propre transport Steam P2P, découplé de FishNet) — voir
  `LOG - Décisions techniques.md` et ADR-0005 à formaliser.
- Hotplug microphonique (débranchement en jeu) : différé en phase post-alpha
  (décision du 2026-07-05).

---

## MVP Definition

> **Le détail complet, daté et suivi en révisions vit dans `design/mvp-scope.md`
> — cette section y renvoie plutôt que de le dupliquer, pour éviter deux sources
> de vérité.**

**Core hypothesis**: la boucle de contrat (arrivée → vidage sous contrainte
vocale → menace d'un habitant → extraction ou échec) tient et produit la
tension recherchée, à 4 joueurs.

**Required for MVP**: voir la liste des 14 systèmes « In Scope » dans
`design/mvp-scope.md` (Voice-Physics complète, portage, 2-3 meubles réactifs,
un habitant, chat de proximité, boucle de contrat, mort, réseau 4 joueurs, 3C,
un appartement fait main, résolution de fin minimale).

**Explicitly NOT in MVP**: voir la liste des 8 reports dans
`design/mvp-scope.md` (communication non-verbale, économie/déployables,
bestiaire étendu, mobilier étendu, débriefing détaillé, progression, génération
procédurale, support 6-8 joueurs).

### Scope Tiers (if budget/time shrinks)

| Tier | Content | Features | Timeline |
| ---- | ---- | ---- | ---- |
| **MVP** | Un appartement, 2-3 meubles, un habitant | Boucle de contrat complète, 4 joueurs, calibration | *(différé → premier `/sprint-plan`)* |
| **Vertical Slice** | *(différé → après verdict du MVP)* | *(différé)* | *(différé)* |
| **Alpha** | *(différé → après verdict du MVP)* | *(différé)* | *(différé)* |
| **Full Vision** | Mondes multiples, bestiaire complet, économie | Vision complète du GDD source | *(différé)* |

> **Pourquoi ces cases sont différées et non vides.** Une estimation produite avant que
> le MVP existe serait fausse et servirait néanmoins de référence pendant des mois. Le
> déclencheur est explicite : le premier `/sprint-plan` réel, une fois la vélocité connue.

---

## Next Steps

- [ ] Validation de ce document (relecture des sections « proposition — à valider »)
- [x] `/setup-engine` — Unity 6.3 LTS déjà configuré
- [ ] **Prototype core idea** (`/prototype`) — la Voice-Physics n'a jamais été testée en jeu ; recommandé avant `/map-systems` malgré l'avance déjà prise par `Voice.Core`
- [ ] Formaliser les ADR issues du `LOG - Décisions techniques.md` (voir `docs/adoption-plan-2026-09-03.md`)
- [ ] Décomposer en systèmes (`/map-systems`), limité au périmètre de `design/mvp-scope.md` (14 entrées → 19 systèmes décomposés dans `design/gdd/systems-index.md`)
- [ ] Concevoir chaque système (`/design-system [nom-système]`)
- [ ] Construire la vertical slice (`/vertical-slice`)
- [ ] Valider la boucle avec playtest (`/playtest-report`)
- [ ] Planifier le premier sprint (`/sprint-plan new`)
