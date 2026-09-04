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

[To be designed]

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
