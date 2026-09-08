# Calibration vocale

> **Status**: In Design
> **Author**: Sacha (devonemoretry-sacha) + Claude
> **Last Updated**: 2026-09-07
> **Enables Pillar**: Pilier 1 — « La Voice-Physics récompense le contrôle, pas le silence ».
> Comme le système 1, celui-ci ne réalise pas le pilier : **il le rend possible.** Sans lui,
> le jeu récompenserait le matériel et la physiologie.
> **System**: #6 dans `design/gdd/systems-index.md` · Core · MVP
> **Périmètre MVP**: entrée #13 de `design/mvp-scope.md`

> Titres de sections en anglais (lus par les skills), corps en français.
>
> **Portée** : ce document couvre la production, la validation, la persistance et la
> reprise du `VoiceProfile`, ainsi que le parcours joueur qui l'accompagne. Rien n'en est
> implémenté à ce jour.

## Overview

**La calibration est ce qui rend le jeu juste.**

La mécanique centrale mesure l'effort vocal. Mais un micro-casque à 200 € et une voix de
baryton ne produisent pas les mêmes décibels qu'un micro de portable et une voix d'enfant,
à effort strictement identique. Sans calibration, le jeu ne récompenserait pas le contrôle
vocal : il récompenserait **l'équipement et la physiologie**. Le Pilier 1 deviendrait faux,
et personne ne saurait pourquoi.

Ce système résout cela en mesurant, une fois par joueur, les bornes de sa propre échelle :
le bruit de fond de sa pièce, sa voix au repos, sa hauteur habituelle et son cri. Il en
produit un **`VoiceProfile`** — quatre valeurs plus un drapeau de qualité — contre lequel
le système 1 normalise toutes ses mesures. Après quoi « fort » ne veut plus dire *un
certain nombre de décibels*, mais **fort pour cette personne, dans cette pièce, sur ce
micro**.

Sa portée dépasse la mesure. Trois traits le distinguent des autres systèmes :

- **Il est bloquant.** Sans profil valide, l'analyse vocale renvoie du silence et le joueur
  ne peut pas rejoindre une partie. C'est le seul système du MVP qui puisse refuser
  l'entrée.
- **Il appartient au joueur, pas à la session.** Le profil persiste entre les parties et
  entre les sessions. On le crée une fois ; on rejoint ensuite n'importe quelle partie, y
  compris en cours, sans rien refaire.
- **Il porte l'onboarding.** C'est le premier moment où le jeu demande au joueur de faire
  quelque chose avec sa voix — et donc l'endroit où il comprend, ou non, que sa voix est
  une manette.

Ce dernier point est aussi le risque principal du système, et il n'est pas technique :
**il faut demander à quelqu'un de crier dans son micro**, souvent dans un salon où d'autres
personnes l'entendent. Une calibration mal conçue ne produit pas des mesures fausses. Elle
produit des joueurs qui n'osent pas, donc des profils au registre écrasé, donc un jeu qui
ne réagit plus — et le défaut se lit alors comme un problème de gameplay, jamais comme un
problème de calibration.

> **Le système est donc à double nature : un instrument de mesure, et le premier contrat
> social du jeu avec son joueur.** Les deux se contraignent mutuellement. Ce document ne
> peut pas traiter la mesure sans traiter la gêne.

## Player Fantasy

**Comme le système 1, la calibration ne produit pas de fantasme : elle en garantit un.
Mais contrairement au système 1, le joueur la traverse — et pendant deux minutes, elle
est le jeu tout entier.**

C'est ce qui rend cette section différente de son homologue dans `voice-analysis.md`.
L'analyse doit être invisible ; la calibration est vue, vécue, et jugée.

### Le meilleur moment d'apprentissage du jeu, et le seul

La calibration est **le premier instant où le joueur voit sa voix agir sur quelque chose**.
La jauge qui répond en temps réel pendant qu'il monte en puissance n'est pas un
accessoire de mesure : c'est la promesse centrale du jeu, livrée avant que le jeu commence.

Ce moment ne se représentera pas. Si la calibration se donne l'air d'un formulaire de
réglages, on aura gaspillé la meilleure occasion d'onboarding qu'on aura jamais — et il
faudra réexpliquer plus tard, moins bien, dans une situation où le joueur est occupé à
autre chose.

> **Le fantasme à tenir tient en une phrase : « ma voix fait bouger le truc ».**
> Le joueur doit sortir de la calibration en ayant compris ce qu'est ce jeu, sans qu'on
> le lui ait dit.

### Les deux métiers se renforcent, et c'est la clé du système

La calibration doit **mesurer juste** et **enseigner**. Ces deux exigences pourraient se
contredire — elles s'alimentent :

- Un joueur qui voit la jauge répondre **pousse plus loin**, ce qui donne une meilleure
  mesure de son registre haut.
- Un joueur qui ne voit rien **se retient**, ce qui donne un registre écrasé et un profil
  médiocre.

**L'enseignement est donc la technique de mesure**, pas une couche ajoutée par-dessus. Le
retour visuel temps réel n'est pas de l'habillage : c'est l'instrument qui obtient du
joueur l'amplitude dont il a besoin.

### Ce que le joueur ne doit jamais ressentir

- **« Je passe un test. »** Un test appelle l'effort minimal suffisant pour le réussir —
  exactement la mauvaise mesure. On ne veut pas qu'il passe, on veut qu'il montre son
  amplitude.
- **« Je me ridiculise. »** La gêne comprime le registre. Un joueur intimidé produit
  mécaniquement un profil dégradé, et le défaut se manifestera plus tard comme un jeu qui
  ne réagit pas.
- **« Le jeu juge ma voix. »** Un refus de profil doit se lire comme un problème de micro
  ou de pièce, **jamais** comme un verdict sur la personne.
- **« C'est un réglage, je verrai plus tard. »** La calibration est obligatoire ; elle ne
  doit pas ressembler à un panneau d'options qu'on peut remettre à demain.

### La tension à ne pas résoudre

> **La mesure veut l'extrême, le joueur veut la retenue.**

Il nous faut le vrai sommet de son registre. Lui, dans un salon avec d'autres gens, veut
en faire le moins possible. Ce n'est pas un défaut de motivation : c'est une situation
sociale, et elle ne se corrige pas par de la pédagogie.

**La résolution naïve empire les choses.** Insister, redemander plus fort, gamifier le cri
(« pousse la jauge au maximum ! ») transforme une demande en injonction et ajoute de
l'anxiété de performance à une situation déjà inconfortable. On obtient moins d'amplitude,
pas plus.

> **La bonne direction est inverse : rendre la mesure tolérante plutôt que le joueur plus
> fort.**

C'est la raison d'être du drapeau **`LowRange`** — décidé en revue le 2026-09-07 et
formalisé dans les *Edge Cases* du système 1. Un joueur qui ne veut pas, ou ne peut pas,
crier **joue quand même** : son profil est accepté, marqué, et son lissage renforcé. Sa
mesure est plus molle, honnêtement signalée comme telle, et il n'est pas exclu.

Ce qui était une décision technique trouve ici sa raison : **elle convertit un problème
social insoluble en un problème technique gradué.**

### Il y a deux calibrations, et elles n'ont pas le même fantasme

La même mécanique sert deux situations opposées, ce que le parcours doit refléter.

| | **La première** | **Les suivantes** |
|---|---|---|
| Situation | Le joueur découvre le jeu | Le joueur sent que le jeu ne l'écoute plus |
| Fantasme | **La découverte** — « ma voix fait bouger le truc » | **La reprise de contrôle** — « je répare, et je retourne jouer » |
| Ce qu'il veut | Comprendre, prendre son temps | Que ce soit fini |
| Ce qu'il faut lui donner | De la démonstration, du retour visuel, aucune hâte | De la vitesse, aucune pédagogie, aucune cérémonie |

**Traiter la seconde comme la première est une faute de conception.** Un joueur qui
recalibre en pleine partie parce que sa voix ne porte plus n'a aucune envie qu'on lui
réexplique le principe : il a un problème et il veut le régler. Le contrat de voisinage du
système 1 exige déjà que la calibration soit relançable à tout moment ; ce tableau dit
qu'être *relançable* ne suffit pas — il faut être **relançable vite**.

### Portée future

Deux idées écartées du MVP, notées pour ne pas les réinventer :

- **Recalibration passive**, où le jeu affinerait le profil en observant le joueur pendant
  qu'il joue. Séduisant — plus aucune friction — mais il violerait la promesse
  d'attribution du système 1 : le référentiel bougerait sous les pieds du joueur sans qu'il
  le sache, et un même effort ne produirait plus le même effet d'une minute à l'autre. À ne
  rouvrir que si l'on trouve comment le rendre **visible**.
- **Profils multiples par joueur** — casque du soir, micro de portable en déplacement. Vrai
  besoin, mais qui suppose un gestionnaire de profils et une logique de sélection.
  Différé : le contrat actuel dit qu'un changement de périphérique ne force jamais de
  recalibration, ce qui suffit au MVP.

## Detailed Rules

[À écrire]

## Formulas

[À écrire]

## Edge Cases

[À écrire]

## Dependencies

[À écrire]

## Tuning Knobs

[À écrire]

## Visual/Audio Requirements

[À écrire]

## UI Requirements

[À écrire — **rapatriement** de la section homonyme de `voice-analysis.md`, qui la porte
en dépôt et la déclare « contrat hérité, à migrer vers le système 6 ».]

## Acceptance Criteria

[À écrire]

## Open Questions

[À écrire]
