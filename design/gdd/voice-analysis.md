# Analyse vocale

> **Status**: In Design
> **Author**: Sacha (devonemoretry-sacha) + Claude
> **Last Updated**: 2026-09-03
> **Implements Pillar**: Pilier 1 — « La Voice-Physics récompense le contrôle, pas le silence »
> **System**: #1 dans `design/gdd/systems-index.md` · Foundation · MVP

> Titres de sections en anglais (lus par les skills), corps en français.
>
> **Portée** : ce document couvre la **chaîne complète**, de la fenêtre d'échantillons
> à la `VoiceFrame` normalisée. Une partie est implémentée et testée ; la couche de
> normalisation ne l'est pas encore. Le document sert donc à la fois de documentation
> de l'existant et de **spécification de ce qui reste à écrire**.

## Overview

L'analyse vocale est la couche qui transforme le son du microphone en une mesure
exploitable par le jeu. Elle reçoit des fenêtres d'échantillons d'environ 20 ms et en
produit une **`VoiceFrame`** : cinq valeurs décrivant la voix à cet instant — son
intensité, sa hauteur, sa texture, la présence ou non d'une vibration des cordes
vocales, et un numéro d'ordre.

Le joueur n'interagit jamais avec ce système. Il n'a ni écran, ni commande, ni réglage
visible en jeu. Mais **tout ce qui réagit à la voix lit une `VoiceFrame` et rien
d'autre** : un meuble qui s'alourdit, un habitant qui tourne la tête, un objet qui
exige une note tenue. C'est le point de passage unique entre le micro et le gameplay.

Sa raison d'être tient en une contrainte : **les valeurs produites sont normalisées par
joueur.** Une intensité de 0,8 signifie « 80 % du chemin vers le cri *de ce joueur-là* »,
pas « 80 % de l'échelle du micro ». Une hauteur de +3 signifie « trois demi-tons au-dessus
de *sa* voix habituelle », pas « 220 Hz ». Sans cette normalisation, deux joueurs
fournissant le même effort obtiendraient des effets différents selon leur timbre et leur
matériel — et celui qui est désavantagé accuserait le jeu, à raison. Le système existe
pour rendre l'effort vocal **comparable entre joueurs** ; c'est ce qui rend la
Voice-Physics jouable à plusieurs.

## Player Fantasy

**Ce système ne produit aucun ressenti. Il en garantit un.**

Le fantasme « ma voix agit sur le monde » appartient à l'effet voix → objets. L'analyse
vocale n'en est pas l'auteur — elle en est la condition. Ce qu'elle doit tenir, c'est ce
sans quoi cette phrase devient fausse : que l'effort vocal de chaque joueur soit mesuré à
*son* échelle, pour que quatre voix différentes fournissant le même effort obtiennent le
même effet.

### Ce que le joueur ne doit jamais pouvoir croire

Le joueur ne sent jamais ce système. Il ne peut le sentir que quand il est faux — et
alors il ne l'accuse pas. Il accuse la physique, le réseau, sa malchance, ses coéquipiers.

Le ressenti que ce système protège est donc un ressenti d'**attribution** :

> **Quand un joueur échoue, il doit pouvoir dire de quoi il est coupable.**
> « J'ai crié. » « J'ai lâché ma note. » Jamais « je ne sais pas ce qui s'est passé. »

Quatre formulations concrètes de ce qui doit être vrai :

- **Quand je chuchote, le jeu entend un chuchotement** — pas du silence. Le chuchotement
  est un registre central du jeu ; une analyse qui le traite comme du bruit de fond le
  supprime du vocabulaire.
- **Quand je fournis le même effort que mon coéquipier, on obtient le même résultat**,
  quels que soient nos timbres et nos micros.
- **Quand je claque la langue, le jeu ne le confond pas avec une note tenue.** Deux
  gestes vocaux différents produisent deux mesures différentes.
- **Quand je me tais, mon objet cesse de réagir.** Aucune entrée fantôme — ni bruit
  ambiant, ni clavier, ni souffle.

**Protocole de vérification en playtest** : après un échec, demander au joueur
« pourquoi ? ». La réponse doit nommer un acte vocal. Si elle nomme autre chose — la
physique, le réseau, la malchance — **l'attribution a échoué, même si le système
fonctionne techniquement.**

### La tension à ne pas résoudre par la mollesse

Ce cadrage est défensif, et sa pente naturelle est dangereuse : on élimine l'injustice en
lissant, en élargissant les seuils, en amortissant la réponse. On obtient alors une mesure
irréprochable et molle — plus personne ne se sent lésé parce que plus rien ne réagit
franchement.

Or Sensation est la troisième esthétique du jeu, et le Pilier 1 exige que **le contrôle
soit une compétence** : il faut donc une mesure assez nerveuse pour qu'on puisse la
maîtriser.

> **L'attribution veut de la stabilité, le contrôle veut de la réactivité.**
> C'est un axe de réglage, pas un problème à supprimer. Les *Tuning Knobs* devront
> l'exposer explicitement plutôt que de figer un compromis implicite.

Formulation positive qui borde le risque : **la mesure doit rester assez rapide pour que
le joueur sente sa propre voix comme un geste, pas comme un curseur.**

### Portée future

Un troisième cadrage a été envisagé et écarté du MVP : le jeu écoute un **corps** —
souffle, tremblement, rire nerveux — et non une commande. Séduisant pour le Pilier 3, mais
il glisse vers « le jeu me punit pour ce que je ne contrôle pas », ce qui heurte le
Pilier 1. À rouvrir seulement si la maîtrise vocale s'avère trop facile en playtest.

---

*Cadrage arbitré le 2026-09-04 avec le `creative-director` (mode `full`) : ossature
« fantasme délégué », cœur « fantasme par la négative », clause de vivacité pour border
le risque de mollesse.*

## Detailed Design

### Core Rules

[To be designed]

### States and Transitions

[To be designed]

### Interactions with Other Systems

[To be designed]

## Formulas

[To be designed]

## Edge Cases

[To be designed]

## Dependencies

[To be designed]

## Tuning Knobs

[To be designed]

## Visual/Audio Requirements

[To be designed]

## UI Requirements

[To be designed]

## Acceptance Criteria

[To be designed]

## Open Questions

[To be designed]
