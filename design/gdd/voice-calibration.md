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

[À écrire]

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
