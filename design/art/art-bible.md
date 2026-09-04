# Art Bible — Shut Up & Carry !

> **Status**: **Cadre de travail provisoire** — sections 1 à 3 écrites, section 4 différée
> **Created**: 2026-09-03
> **Last Updated**: 2026-09-03
> **Review Mode**: `full` — art-director consulté à chaque section
> **Engine**: Unity 6.3 LTS, URP 17.3.0
> **Source**: `design/gdd/game-concept.md`

> Titres de sections en anglais (lus par les skills), corps en français.

> ## ⚠️ Statut de ce document — à lire avant de s'y fier
>
> **Ce n'est pas une spécification figée. C'est un cadre de travail provisoire.**
>
> La direction visuelle est **explicitement susceptible d'évoluer** le jour où un
> graphiste rejoint le projet. Les principes écrits ici ont été arbitrés entre un
> développeur solo et un directeur artistique consultatif — ils sont cohérents et
> opposables, mais ils n'ont pas été confrontés à la pratique d'un artiste, ni à un
> seul asset produit.
>
> **Pourquoi le document s'arrête à la section 3.** L'identité visuelle ne lève aucun
> risque de gameplay et n'est pas prioritaire : il reste une quantité importante de
> code à écrire avant que la production d'assets ne commence. Poursuivre l'art bible
> maintenant produirait des guides de production détaillés pour des assets que personne
> n'est en mesure de fabriquer.
>
> **Ce qui reste valable malgré tout** : les trois sections écrites contiennent des
> décisions qui touchent le code et le level design, pas seulement l'art —
> l'opposition courbe/angulaire conditionne la modélisation, les points d'ancrage
> conditionnent le portage collectif, et le rationnement des objets courbes par pièce
> contraint la boucle de contrat. Ces contraintes-là valent dès maintenant.
>
> **Section 4 (Color System) — différée.** Elle est déjà partiellement contrainte par
> ce qui précède : palette désaturée, un seul accent saturé par pièce, et interdiction
> pour la couleur de signaler une détection ou une alerte. À écrire quand la production
> d'assets deviendra réelle, avec le graphiste s'il y en a un.
>
> **Sections 5 à 9** — guides de production, hors périmètre tant qu'aucun asset n'est
> produit.

---

## 1. Visual Identity Statement

### La règle

**« L'appartement est un décor qu'on vide ; ce qui refuse de partir est peint à la main. »**

Elle tranche la question la plus fréquente d'une production d'art — *cet objet
mérite-t-il du détail ?* — sans jamais avoir à en débattre. La coquille de
l'appartement est produite avec un petit kit de matériaux réutilisables. Ce qui est
vivant, maudit, ou habite les lieux reçoit une texture peinte à la main. L'écart de
soin n'est pas une incohérence : **c'est la lecture du danger.**

La règle relie l'identité visuelle à la mécanique même du jeu — enlever des choses
qui résistent — ce qui la rend plus difficile à oublier qu'une règle purement
esthétique.

---

### Principe 1 — Matière avant forme

Le jeu est en **vue première personne**, dans des espaces exigus. Le joueur est à
soixante centimètres de ce qu'il porte : il ne voit pas de silhouette, il voit du
grain, des arêtes, la façon dont la lumière accroche la surface.

Le point spéculaire net se lit « plastique photoréaliste ». La bande large et mate se
lit « fait main ». On choisit toujours la seconde.

Matériaux de référence : feutre tissé visible, grain de pinceau sur le bois, coutures
surdimensionnées, chants arrondis larges.

> **Test de conception** — *Quand un objet est ambigu entre détail réaliste et détail
> jouet, choisir la texture peinte à gros grain, jamais le PBR fin.*

**Bénéfice technique** : un fini mat à réflexion large est **moins coûteux à calculer**
sous de nombreuses petites lumières dynamiques que du PBR fin. Le principe sert donc
directement la contrainte URP Forward+ qui a motivé le choix du pipeline.

---

### Principe 2 — Le mignon porte la menace

Un habitant reste rond et attachant. **La peur vient de son comportement, jamais de ses
formes.** C'est la dissonance émotionnelle rendue visuelle : on est mis en danger par
quelque chose qu'on aurait envie de prendre dans ses bras.

La ligne à tenir n'est pas « mignon » contre « effrayant » — c'est **jouet artisanal**
contre **jouet de grande surface**. Référence : Laika (*Coraline*, *ParaNorman*).
Personne ne qualifie *Coraline* d'enfantin.

| Bascule vers l'enfantin | Tient la ligne |
|---|---|
| Couleurs primaires saturées partout | Palette désaturée, **une seule** couleur d'accent saturée par pièce |
| Yeux ronds glacés, reflet blanc unique | Asymétrie volontaire — un œil-bouton plus gros que l'autre, une couture ratée |
| Symétrie parfaite | Usure : taches, éraflures, peinture écaillée |
| Fini brillant, plastique neuf | Fini mat |
| Typographie ronde et neuve | *(voir section 6 — UI, à écrire)* |

> **Test de conception** — *Quand un habitant est ambigu entre mignon-inquiétant et
> mignon-enfantin, choisir l'asymétrie et l'usure plutôt que la symétrie et le neuf.*

**Pilier servi** : Pilier 3 — la dissonance émotionnelle est un pilier, pas un accident.

---

### Principe 3 — Le vide raconte

Le décor ordinaire est un appartement en cours de vidage : carton kraft, ruban adhésif
jauni qui pèle, mur beige institutionnel, ampoule nue à filament comme seule source
chaude. Et surtout, les **rectangles fantômes** — ces zones de mur restées plus claires
là où un cadre a pendu des années.

Le registre est celui de **l'horreur du dernier jour de bail** : sec, administratif, un
peu mélancolique. Il laisse toute la place à la comédie du chaos vocal au lieu de la
combattre.

Ce principe raconte l'occupant précédent **à coût de production nul** — ce qui compte,
puisque le bestiaire de ce jeu n'est pas fait de monstres mais **des occupants** :
« ils ne chassent pas les joueurs par nature, ils réagissent à une intrusion bruyante
dans leur espace ».

> **Test de conception** — *Quand une pièce manque de caractère, ajouter la trace de ce
> qui n'y est plus — rectangle fantôme, marque au sol, adhésif décollé — jamais un
> nouvel objet décoratif.*

**Pilier servi** : sert la strate Narrative (rang 4 de la hiérarchie MDA) sans coût de
production, et renforce le cadrage du bestiaire.

---

### Conformité aux décisions actées

Cette direction **ne rend visible aucun état sonore**. Elle est entièrement découplée du
volume, de la détection et de l'alerte. Elle respecte donc sans condition ni garde-fou la
décision du 2026-07-27 :

> « La portée sonore est de la plomberie interne. Aucun retour visuel, aucune jauge,
> aucun indicateur de détection. L'incertitude *est* la mécanique de paranoïa —
> l'afficher la supprime. »

**Direction écartée** : *Bruthaus Corporate* — corruption visuelle du décor en temps réel,
pilotée par le volume du joueur. Écartée pour deux raisons : elle heurte la décision
ci-dessus, et l'art-director l'a lui-même jugée « en grande partie une redondance
visuelle du sonomètre existant ». Elle reste disponible comme **couche de feedback
optionnelle sur l'objet porté uniquement**, à ne rouvrir qu'en amendant explicitement la
décision du 2026-07-27.

---

### Origine de cette section

Trois directions ont été proposées par l'`art-director` puis développées après retours :
*Bruthaus Corporate*, *Diorama Jouet* et *Balise*. La section retenue est une
**hybridation** — l'identité environnementale de Balise (« l'appartement fraîchement
vidé ») et le principe de créatures de Diorama (« le mignon porte la menace ») — les deux
couvrant des domaines complémentaires plutôt que concurrents.

Une correction majeure est intervenue en cours de route : le principe initial
« silhouette avant texture » a été abandonné, la vue première personne à courte distance
le rendant caduc. Il a été remplacé par « matière avant forme ».

---

## 2. Mood & Atmosphere

Cibles émotionnelles par état de jeu, assez précises pour qu'un éclairagiste puisse
travailler à partir de là.

### Deux règles transverses

**1. L'ampoule nue est le signe qu'on est vivant dans la maison.** Elle est présente dans
les trois états intérieurs actifs — Vidage, Menace proche, Chaos — et **délibérément
absente** de l'Espace des morts et de la Calibration. Son absence marque la sortie de la
fiction.

**2. La tension se joue en saturation et en contraste, jamais en luminance.** Aucun état
ne descend sous le seuil de lecture des parades. C'est la contrainte dure du projet —
trois archétypes du bestiaire ont une parade qui exige de voir, et le noir total durable
est interdit. Elle est respectée ici par construction, pas par vigilance.

---

### 1. Arrivée sur le contrat

| | |
|---|---|
| **Cible émotionnelle** | Appréhension professionnelle banalisée — « encore un contrat », teintée d'un malaise au seuil |
| **Éclairage** | Extérieur, fin d'après-midi haute, ~3400 K chaud rasant, contraste moyen, ombres longues et basses, ciel commençant à ambrer |
| **Atmosphère** | seuil · rasant · banal · chargé · imminent |
| **Énergie** | 2/5 |

**Élément porteur** : la porte entrouverte laisse voir un rectangle intérieur **plus
froid** que l'extérieur. C'est le premier contraste chaud/froid du contrat, posé comme
motif — il sera payé à l'Extraction.

---

### 2. Vidage sous contrainte

| | |
|---|---|
| **Cible émotionnelle** | Concentration coopérative sous tension légère — « on gère, ensemble, prudemment » |
| **Éclairage** | Intérieur, praticables ~2700 K (ampoule nue) + fenêtres ambrées en fond, contraste doux, sources ponctuelles multiples plutôt qu'un fill uniforme |
| **Atmosphère** | encombré · méthodique · domestique · retenu · chaud-piégé |
| **Énergie** | 3/5 |

**Élément porteur** : l'ampoule nue oscille légèrement au passage des porteurs, l'ombre
balaie le mur. Rappel constant qu'on dérange un espace qui n'est pas le nôtre.

---

### 3. Menace proche

> **Comment on fait ressentir la menace sans la signaler.** Cet état n'est **jamais
> déclenché par la proximité réelle d'un habitant** — ce serait un indicateur de
> détection déguisé, exactement ce que la décision du 2026-07-27 interdit.
>
> L'ambiance de tension est **pré-auteurée par zone de level design** : « ceci est la
> chambre de l'occupant, elle est toujours sur le qui-vive ». La pièce a rigoureusement
> la même tête que la créature s'y trouve ou non. Le joueur sent que l'endroit est
> mauvais ; il ne sait toujours pas si quelque chose s'y trouve. L'incertitude reste
> entière.

| | |
|---|---|
| **Cible émotionnelle** | Tension anticipatoire **statique** — pas de peur immédiate |
| **Éclairage** | **Même température que Vidage**, aucun reréglage chromatique. Saturation ambiante −20 à −30 %, contraste resserré : les noirs remontent légèrement plutôt que la lumière ne baisse |
| **Atmosphère** | terne · feutré · statique · oppressant · retenu |
| **Énergie** | 2,5/5 — tension sans mouvement |

**Élément porteur** : le principe « le vide raconte » poussé plus loin — objets à moitié
emballés, abandonnés en plein geste, comme interrompus. Lecture **spatiale**, jamais
temporelle : rien ne dit *quand* c'est arrivé.

> ⚠️ **Point fragile identifié, à tester en priorité.** Vidage et Menace proche forment
> la paire la plus proche du document : même température de couleur, delta porté
> entièrement par la saturation, le cadrage et la densité du dressing interrompu. Si les
> deux états se confondent en jeu, l'anticipation disparaît. **À valider en premier lors
> du vertical slice.**

---

### 4. Chaos

| | |
|---|---|
| **Cible émotionnelle** | Euphorie-panique, comédie du dérapage |
| **Éclairage** | Contraste violent, sources qui s'activent en rafale. **La luminance globale ne baisse jamais.** |
| **Atmosphère** | heurté · sur-exposé · clignotant · cacophonique · vertigineux |
| **Énergie** | 5/5 |

**Élément porteur** : les ombres portées multiples qui se croisent quand plusieurs
sources s'activent simultanément. Le contraste monte, la lisibilité tient.

**Ce qui produit l'intensité** : les objets Voice-Physics qui réagissent au bruit
réellement émis — un canapé qui s'écrase, une lampe qui s'affole. **C'est le système 11
rendu visible, la mécanique centrale du jeu, pas un indicateur d'état.**

> **Ce qui a été retiré.** Une corruption ambiante du décor pilotée par le volume avait
> été proposée pour cet état. Écartée, en cohérence avec l'exclusion de *Bruthaus
> Corporate* en section 1. La distinction qui compte : **un objet qui réagit à la voix
> est du gameplay ; un décor qui se corrompt selon le volume est un indicateur.**

---

### 5. Extraction

| | |
|---|---|
| **Cible émotionnelle** | Urgence de course contre la montre, soulagement fragile |
| **Éclairage** | Retour au seuil extérieur, mais l'arc temporel du contrat a avancé — ciel rouge/violet, soleil bas, fort contre-jour sur la porte de sortie |
| **Atmosphère** | pressant · embrasé · silhouetté · fragile · tranchant |
| **Énergie** | 4,5/5 |

**Élément porteur** : le **même cadrage de porte qu'à l'arrivée, inversé**. Le rectangle
froid du départ est devenu un halo chaud saturé en contre-jour. C'est le payoff direct de
la progression temporelle « avant la tombée de la nuit », et il ne coûte rien à produire.

**Note technique** : un rayon de lumière dans ce contre-jour serait un vrai gain lisible,
mais **URP 6.3 n'a pas de brouillard volumétrique natif**. À simuler par un plan de brume
dithérée en sprite plutôt que par une vraie passe volumétrique. Non requis au MVP, à
provisionner si retenu.

---

### 6. Espace des morts

| | |
|---|---|
| **Cible émotionnelle** | Détachement, frustration muette, voyeurisme |
| **Éclairage** | Désaturation quasi totale — gris-bleu plat, faible contraste. **Aucune source chaude** : l'ampoule nue est absente, marquant la coupure du monde vivant |
| **Atmosphère** | sourd · vitré · spectral · immobile · extérieur |
| **Énergie** | 1/5, avec frustration latente |

**Élément porteur** : vignette d'écran légère — bord assombri, léger grain — évoquant une
vitre. Le mort regarde à travers une fenêtre visuellement distincte de la vue normale.

---

### 7. Calibration

| | |
|---|---|
| **Cible émotionnelle** | Clarté pédagogique, curiosité sans peur |
| **Éclairage** | Neutre, homogène, quasi sans ombres, ~4000 K, haute lisibilité, aucun praticable capricieux |
| **Atmosphère** | net · neutre · didactique · calme · propre |
| **Énergie** | 2/5 |

**Élément porteur** : espace clos générique — camion ou local d'essai — **sans dressing
« le vide raconte »**. Volontairement neutre, pour ne pas mélanger la pédagogie et la
fiction du bestiaire.

---

### Distinctivité

Tous les états sont séparables par au moins deux axes parmi : température de couleur,
saturation, contraste, cadrage, présence ou absence de l'ampoule nue.

La seule paire fragile est **Vidage / Menace proche** — voir l'avertissement en état 3.

---

## 3. Shape Language

### 1. Silhouette des habitants — la reconnaissance par fragment

En vue subjective, dans un couloir, **on ne voit jamais un habitant en entier** : un bras
qui dépasse d'un renfoncement, une forme qui traverse une embrasure à contre-jour, un dos
qui se retourne à bout portant. Une silhouette pensée pour être lue en pied à dix mètres
est un langage mort ici.

**Principe — la zone-signature.** Chaque habitant porte **une seule** zone exagérée,
cohérente d'un individu à l'autre de son espèce : une main disproportionnée, un ruban qui
traîne, un motif de couture. Elle est systématiquement placée dans la **bande 1-2 m**,
celle du regard et de la portée de bras — la zone qui reste dans le cadre quel que soit
le cadrage partiel.

> **Test de conception** — *Quand une partie du corps est ambiguë entre discrète et
> exagérée, l'exagérer sur cette seule zone signature, jamais répartie sur tout le corps.*

**Effet recherché** : montrer un fragment force le cerveau à compléter la forme manquante
— principe de clôture. **La reconnaissance partielle inquiète davantage qu'une silhouette
entière et lisible.** La contrainte de caméra devient un atout.

**Pilier servi** : Pilier 1 et la contrainte des parades — un joueur doit identifier
l'espèce depuis un fragment pour savoir *quoi faire*, pas seulement *qu'il y a danger*.

**Vérification en solo** : encadrer le modèle dans une embrasure de porte à hauteur de
caméra joueur, vérifier que la zone-signature reste dans le cadre. Un aller-retour dans
l'éditeur, pas de suite de tests.

---

### 2. La coquille est angulaire, la vie est courbe

**C'est la distinction unique et suffisante du projet.**

| Forme | Signifie |
|---|---|
| **Courbe organique** | maudit · vivant · **transportable** |
| **Angulaire, arêtes vives** | décor · fixe · **non transportable** |

L'architecture, les cartons, l'adhésif suivent une grille rectiligne stricte — réemploi
modulaire, cohérent avec un appartement réel. Tout ce qui est maudit ou habité casse
cette grille par une courbe organique : affaissement, renflement, bosse.

C'est la traduction géométrique directe de la règle de la section 1 : angulaire et
réemployable = le décor qu'on vide ; courbe et unique = ce qui refuse de partir.

**La courbe ne désigne pas un objectif, elle déclare une catégorie.** Plusieurs objets
courbes cohabitent dans une pièce sans qu'il soit nécessaire de les distinguer entre eux.
Comme le contrat consiste à **vider** l'appartement, tout ce qui est courbe est à sortir —
il n'y a pas d'objectif unique à signaler.

> **Test de conception** — *Quand une forme est ambiguë entre objet maudit et décor
> neutre, lui donner une courbe organique ; tout le reste garde l'angle droit.*

#### Pourquoi ça se lit sans renfort de lumière ni de couleur

Le principe « matière avant forme » fait le travail. Sous un fini mat à réflexion large,
**une courbe produit un dégradé continu de luminance ; un angle produit une rupture de ton
nette entre facettes.** C'est un contraste de *type de transition tonale*, pas de couleur —
il survit donc intact à la désaturation de l'état « Menace proche ».

#### Deux seuils obligatoires

**Amplitude minimale** — la courbure doit rompre la boîte englobante de l'objet d'au moins
**15 à 20 % sur au moins deux faces adjacentes, en continu**. Un simple chanfrein arrondi
ne suffit pas : il se lit comme de l'angulaire adouci.

**Discipline du kit décor** — les pièces modulaires angulaires gardent des arêtes
**strictement vives, zéro arrondi, même décoratif**. ⚠️ C'est contre-intuitif : l'habitude
en temps réel est de biseauter légèrement les arêtes pour qu'elles accrochent la lumière.
Si le kit générique le fait « pour faire propre », **l'opposition binaire s'effondre et
tout le langage de formes avec elle.** Règle de production, pas préférence.

#### Le vide comme matière

Les rectangles fantômes et empreintes au sol sont des **décalques plats**, pas de la
géométrie.

**Leur fonction est rétrospective et narrative uniquement.** Un meuble est resté des
années contre un mur ; on le prend ; la trace apparaît derrière — décoloration, poussière,
lavages. Elle raconte ce qui vient de partir, ou ce qui est parti avant nous.
**Elle n'indique jamais où aller.** Aucune fonction de guidage ne doit lui être assignée.

Ils jouent en revanche un rôle **compositionnel** : zones plates et neutres autour
desquelles les courbes se détachent. Ségrégation figure-fond obtenue par l'espace négatif,
jamais par un projecteur — ce qui hiérarchise la *catégorie*, jamais un individu.

---

### 3. Grammaire de l'UI — l'instrument d'atelier usé

Le seul élément d'interface acté est le **sonomètre diégétique**, qui mesure ce que le
joueur émet et jamais ce que ça provoque.

Il n'emprunte ni la courbe organique — réservée au vivant, ce serait un contresens
fictionnel — ni un langage numérique net, qui se lirait comme une jauge précise et
contredirait son imprécision voulue.

**Principe — instrument corporate bon marché.** Même géométrie angulaire, institutionnelle
et usée que la coquille de l'appartement : cadran mécanique, aiguille, étiquette Karma
Logistics écaillée. **Jamais un HUD à l'écran.**

> **Test de conception** — *Quand un élément d'interface est ambigu entre précision
> technologique et outil low-cost, choisir la forme d'un instrument d'atelier usé, jamais
> un graphisme numérique net.*

**Deux bénéfices de cette forme :**

**L'imprécision mécanique de l'objet justifie diégétiquement** pourquoi la lecture est
floue et retardée — plus besoin de la décréter par une règle de gameplay invisible.

**Partageant la géométrie du décor mort plutôt que la courbe du vivant, il se signale
comme incapable de sentir la créature.** La décision du 2026-07-27 devient un rappel
visuel inscrit dans la forme du prop.

**Pilier servi** : anti-pilier « pas de HUD informatif », et Pilier 1.

*La section 6 précisera l'implémentation.*

---

### 4. Hiérarchie et affordances — sans désignation d'objectif

**Aucun marqueur d'objectif de contrat.** Écartés explicitement : la mise en lumière par
practicable, la règle du plus gros volume, la trace au sol correspondante, le marquage
Karma Logistics apposé par l'entreprise. Le jeu ne désigne pas ses cibles — **les joueurs
apprennent à lire le vocabulaire de formes avec le temps.**

La hiérarchie existe déjà structurellement, sans mise en avant : peint à la main = ce qui
compte, kit réemployé = fond.

#### Points d'ancrage — affordance de proximité

Les points de prise du portage collectif sont **visibles à courte portée uniquement**.
Pas une balise lisible depuis le bout de la pièce : une affordance qu'on découvre en
s'approchant.

**Règle de modélisation** : l'affordance est **dupliquée à chaque point de prise**, par
symétrie de placement. Quel que soit le côté par lequel un joueur aborde l'objet, le même
signal apparaît — sans quoi deux porteurs abordant par des côtés opposés découvriraient
l'information à des instants différents, au pire moment pour improviser une répartition
à la voix sous pression.

**Conséquence utile** : le **nombre d'ancrages visibles dit le nombre de porteurs
nécessaires**. En faisant le tour du meuble, on apprend « il en faut trois » sans une
seule ligne d'interface.

#### Composition — par la densité, jamais par la hiérarchie

Une pièce sans mise en avant individuelle peut devenir du bruit visuel si trop d'objets
courbes s'accumulent. Deux leviers, tous deux compatibles avec l'absence de désignation :

- **Rationner le nombre d'objets courbes par pièce** — règle de placement, pas de rendu.
- **Exploiter le vide** — zones vides et rectangles fantômes servent de fond neutre autour
  des courbes.

> ⚠️ **Conséquence hors art bible** : le rationnement des objets courbes par pièce est une
> contrainte de **level design** (système 11) qui touche aussi la **boucle de contrat**
> (système 16) — le nombre d'objets courbes détermine la quantité de travail d'un contrat,
> donc sa durée et son rythme. À transmettre lors de la rédaction de ces GDD.

---

## 4. Color System

[To be designed]

---

## 5. Character Design Direction

*(hors portée de cette passe — après le prototype)*

## 6. Environment Design Language

*(hors portée de cette passe — après le prototype)*

## 7. UI/HUD Visual Direction

*(hors portée de cette passe — après le prototype)*

## 8. Asset Standards

*(hors portée de cette passe — après le prototype)*

## 9. Reference Direction

*(hors portée de cette passe — après le prototype)*
