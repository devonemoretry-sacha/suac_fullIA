# Art Bible — Shut Up & Carry !

> **Status**: In Progress — sections 1–4 en cours d'authoring
> **Created**: 2026-09-03
> **Last Updated**: 2026-09-03
> **Review Mode**: `full` — art-director consulté à chaque section
> **Engine**: Unity 6.3 LTS, URP 17.3.0
> **Source**: `design/gdd/game-concept.md`

> Titres de sections en anglais (lus par les skills), corps en français.
>
> **Portée de cette passe** : sections 1 à 4 — le socle d'identité visuelle. Les
> sections 5 à 9 (guides de production) seront écrites après le prototype, quand
> les décisions de gameplay seront stabilisées.

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

[To be designed]

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
