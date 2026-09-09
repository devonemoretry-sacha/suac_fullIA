# Effet voix → objets

> **Status**: In Design
> **Author**: Sacha (devonemoretry-sacha) + Claude
> **Last Updated**: 2026-09-09
> **Implements Pillar**: Pilier 1 — « La Voice-Physics récompense le contrôle, pas le silence »
> et Pilier 2 — « La coopération est sous contrainte, jamais confortable ».
> **Contrairement aux systèmes 1 et 6, celui-ci ne prépare pas les piliers : il les réalise.**
> **System**: #11 dans `design/gdd/systems-index.md` · Feature · MVP
> **Périmètre MVP**: entrée #2 de `design/mvp-scope.md` — « la moitié manquante »
> **Mesures**: `prototypes/charge-vocale/` · cible de ressenti dans `design/voice-weight-response.md`

> Titres de sections en anglais (lus par les skills), corps en français.
>
> **Portée** : ce document couvre la traduction d'une `VoiceFrame` en comportement physique
> d'un objet porté. Il ne couvre ni la mesure de la voix (système 1), ni sa normalisation
> (système 6), ni le portage lui-même (système 9), ni la propagation du son (système 3).

## Overview

**C'est ici que la voix agit enfin.** Le système 1 mesure, le système 6 rend la mesure
juste, le système 2 alimente — et rien de tout cela ne fait bouger quoi que ce soit. Ce
document est le point où la chaîne débouche sur du jeu.

Le Pilier 1 le décrit en une phrase, et c'est littéralement l'énoncé de ce système :

> **« La panique entraîne le bruit ; le bruit entraîne le chaos ; le chaos entraîne la
> chute. »**

Concrètement : un objet porté accumule une **charge** tant que des voix se font entendre
autour de lui, et cette charge le rend progressivement plus difficile à manœuvrer. Un
avertissement précède la gêne, pour que le joueur puisse se taire à temps. Au silence, la
charge retombe et l'objet redevient transportable.

### Le seul système qui ait été ressenti

Tous les autres documents de ce projet sont du papier. **Celui-ci s'ouvre sur des mesures.**

Le banc d'essai `prototypes/charge-vocale/` a établi qu'un humain peut sentir la charge
monter et se taire à temps — l'hypothèse centrale, jamais éprouvée jusque-là. Il a aussi
livré une valeur et tué deux explications :

- **L'avertissement se déclenche à 350 ms**, avec une falaise entre 400 et 430 ms. Ce n'est
  pas une frontière mais **un optimum** : plus tôt est moins bon, parce que le signal se
  met alors à répondre à tout et cesse d'informer.
- La « fenêtre de réaction » et la fraction `avertissement/remplissage` ont été **réfutées**
  comme facteurs, chacune par une mesure qui les contredit directement.

Un seul testeur, qui est le concepteur. C'est peu, mais c'est infiniment plus que zéro.

### Le paradoxe qu'il faut assumer, pas résoudre

**Le jeu punit la parole, et la coopération exige de parler.** Porter un canapé à deux
suppose de se coordonner ; se coordonner alourdit le canapé.

Ce n'est pas un défaut à corriger, **c'est le moteur comique du jeu**. Le Pilier 2 le pose
comme intention : *« bien faire sa part ne suffit pas, il faut composer avec les autres »*.
La friction est le produit, pas l'effet secondaire.

### Ce système, seul, rendrait le silence optimal — et c'est interdit

Le Pilier 1 pose un test de conception explicite : *« si un système permettrait de terminer
un contrat en restant silencieux du début à la fin sans coût ni risque, ce pilier dit qu'il
faut le retravailler. »*

**Pris isolément, ce système échoue à ce test.** Il ne fait que punir le bruit ; sa
stratégie optimale est le mutisme. Il est **délibérément déséquilibré**, et son contrepoids
vit ailleurs — dans l'« élément d'obligation sonore » que le système 13 doit porter et que
le système 16 doit garantir dans chaque contrat.

> **À écrire noir sur blanc parce que c'est un piège classique** : on ne rééquilibre pas ce
> système en l'adoucissant. L'adoucir ne fait que rendre le silence *plus* confortable. Le
> contrepoids est une obligation d'émettre, et elle n'est pas de notre ressort.

### Ce que ce document peut spécifier, et ce qu'il ne peut pas

Contrairement au système 1, celui-ci a de **vraies dépendances de conception** — sur le
portage (9) et la propagation (3), dont aucun n'a de GDD.

| Ce qui est spécifiable maintenant | Ce qui attend un voisin |
|---|---|
| Le modèle de charge, ses constantes de temps, l'avertissement | Ce que « lourd » veut dire mécaniquement — enveloppe de portage, nombre de porteurs, points d'ancrage **(9)** |
| La séparation avertissement / verdict, et son autorité (ADR-0002) | Quelles voix atteignent l'objet, et avec quelle atténuation **(3)** |
| Qui contribue à la charge — tranché par le Pilier 2, voir plus bas | Scalaire ou énergies par bande — décision structurante du système 3 |

Les sections concernées porteront la mention **PROVISOIRE — dépend de 3** ou **de 9**.

### La question du non-porteur est déjà tranchée

L'index des systèmes présente comme *« la question la plus structurante »*, à trancher, le
fait de savoir si la voix d'un **non-porteur** affecte un objet porté par autrui.

**Le Pilier 2 y répond déjà, textuellement** : *« les objets lourds se portent à plusieurs,
mais **la voix de chacun affecte tout le groupe** — bien faire sa part ne suffit pas »*. Et
son test de conception le confirme par la négative : *« si un joueur peut réussir un contrat
difficile en ignorant totalement ses coéquipiers, ce pilier dit que le système est mal
calibré »*.

Restreindre l'effet aux porteurs rendrait précisément possible d'ignorer ses coéquipiers.
**Le principe est donc acquis** ; ce qui reste ouvert est la *forme* — atténuation par la
distance, cumul ou maximum, pondération éventuelle des porteurs — et cela dépend du
système 3.

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

[À écrire]

## Acceptance Criteria

[À écrire]

## Open Questions

[À écrire]
