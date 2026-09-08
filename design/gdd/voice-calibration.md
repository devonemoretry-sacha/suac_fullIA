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

### Le produit : `VoiceProfile`

| Champ | Type | Mesuré par | Rôle |
|---|---|---|---|
| `Floor_dB` | float | **Étape 1 — silence** | Plancher de bruit : pièce + bruit propre du micro. Borne basse de l'échelle de `Loudness` |
| `Rest_dB` | float | **Étape 2 — parole normale** | Niveau de la voix posée. **Point d'ancrage de validation** — voir plus bas |
| `F0_habituel` | float | **Étape 2 — parole normale** | Médiane de hauteur. Référence de `Pitch`, et décide la cadence de décimation |
| `Scream_dB` | float | **Étape 3 — montée** | Borne haute de l'échelle de `Loudness` |
| `LowRange` | bool | Validation | Registre étroit mais exploitable : profil accepté, lissage renforcé |

Le profil **appartient au joueur**, persiste entre les sessions, et n'est jamais lié à une
partie.

> ### ⚠️ Correction d'un défaut hérité — il faut **trois** étapes, pas deux
>
> La section *UI Requirements* de `voice-analysis.md` décrit un parcours en deux temps dont
> la première étape, « parle normalement », est censée fournir `Floor_dB` **et**
> `F0_habituel`. **C'est impossible :** `Floor_dB` est le plancher de bruit, il se mesure
> quand le joueur **ne parle pas**. Le mesurer pendant qu'il parle donnerait un plancher
> situé au niveau de sa voix posée — après quoi `Loudness` vaudrait 0 sur toute parole
> normale, et le jeu ne réagirait qu'aux cris.
>
> Le parcours correct compte donc **trois mesures**. La bonne nouvelle est que l'étape
> ajoutée est la **plus** neutre socialement de toutes : ne rien dire pendant quelques
> secondes. L'intention de l'UX — commencer par un geste qui n'expose pas — est préservée
> et même renforcée.

> ### ⚠️ Deuxième correction — `Rest_dB` ne servait à rien
>
> Le contrat de voisinage réclame un champ « repos » dans le profil. Or **aucune formule du
> système 1 ne l'utilise** : `Loudness` ne connaît que `Floor_dB` et `Scream_dB`, `Pitch` ne
> connaît que `F0_habituel`. Un champ mesuré, persisté et transmis sans consommateur est du
> poids mort — ou le symptôme d'un besoin non formulé.
>
> **Il en a un, et c'est la validation.** Deux points ne permettent de vérifier qu'une
> chose : que l'écart est suffisant. Trois points permettent de vérifier que la mesure est
> **plausible** — `Rest_dB` doit tomber franchement entre les deux autres. C'est ce
> troisième point qui distingue une calibration honnête d'une calibration dégénérée que le
> contrôle d'écart laisserait passer. Voir *Formulas*.

---

### Les trois mesures

**Étape 1 — le silence.** *« Ne dis rien pendant quelques secondes. »*
On mesure le niveau ambiant, micro ouvert, joueur muet. Produit `Floor_dB`.

Cette valeur ne peut pas être le minimum brut observé : un creux instantané descendrait
sous le bruit réel de la pièce et placerait le plancher trop bas. **`Floor_dB` est un
niveau haut de la distribution du bruit**, avec une marge déclarée au-dessus du bruit
propre du micro — c'est l'exigence que le système 1 nous adresse nommément, et c'est elle,
et non le seuil d'écart dynamique, qui empêche une oscillation de 2 dB de faire doubler
`Loudness`. Formule en *Formulas*.

**Étape 2 — la parole posée.** *« Parle normalement, comme si tu discutais. »*
Produit `Rest_dB` et `F0_habituel`. La hauteur est prise comme **médiane** des trames
voisées, jamais comme moyenne : une seule erreur d'octave de YIN déplacerait une moyenne,
elle ne déplace pas une médiane.

Il faut un **minimum de trames voisées** pour que la médiane ait un sens. En dessous,
l'étape n'a pas abouti et se rejoue — le joueur a peut-être chuchoté, ou parlé hors axe du
micro.

**Étape 3 — la montée.** *« Monte progressivement, à ton rythme. »*
Produit `Scream_dB`. Le joueur pousse ; une jauge répond en temps réel. **Aucune
injonction à crier fort** — la section *Player Fantasy* explique pourquoi l'insistance
produit moins d'amplitude, pas plus.

L'étape se termine de trois façons : **plateau détecté**, **arrêt demandé par le joueur**,
ou **expiration du délai**. Dans tous les cas, la valeur retenue est le maximum atteint, et
c'est la validation qui décide ensuite si le profil est bon, `LowRange`, ou refusé.

#### La détection de plateau, et son calage obligatoire

Un plateau est déclaré quand le maximum courant **cesse de progresser** de plus de
`PlateauDelta_dB` pendant `PlateauHold_s`.

> **Mais il ne peut pas être déclaré tant que le profil ne validerait pas.** Tant que
> `max − Floor_dB` reste sous le **plancher dur**, aucun plateau n'est reconnu : l'étape
> continue. C'est le calage exigé par le système 1, et sa raison est entièrement humaine —
> un plateau reconnu trop tôt ferait refuser le profil d'un joueur **qui a coopéré**.
>
> Au-dessus du plancher dur mais sous la bande de qualité, le plateau **est** reconnu et le
> profil sera marqué `LowRange`. Le joueur discret est mesuré, signalé, et joue.

---

### States and Transitions

```
Idle → MeasuringFloor → MeasuringRest → MeasuringPeak → Validating → Committed
                                                             ↓
                                                          Rejected → (retour à l'étape en cause)
```

| Transition | Règle |
|---|---|
| `Idle → MeasuringFloor` | Lancement explicite. Le profil existant, s'il y en a un, **reste actif** |
| entre étapes | Chaque étape produit ses valeurs dans un **tampon**, jamais dans le profil actif |
| `→ Validating` | Les trois étapes ont abouti. La validation est décrite en *Formulas* |
| `Validating → Committed` | **Bascule atomique.** Le profil complet remplace l'ancien en une opération — aucune trame ne peut lire un `Floor_dB` neuf avec un `Scream_dB` ancien |
| `Validating → Rejected` | Aucune écriture. Le parcours revient à **l'étape en cause**, jamais au début |
| n'importe où → `Idle` | Annulation, ou coupure micro. **Le tampon est jeté en entier ; le profil actif est intact** |

**Une étape interrompue ne se conserve pas partiellement.** Si le micro coupe pendant la
montée, on ne garde pas « le `Scream_dB` atteint jusque-là » : c'est exactement ainsi qu'on
fabrique les profils dégénérés que la validation existe pour refuser.

#### Pendant la calibration, la voix du joueur ne joue plus

**Règle non négociable, et elle manquait :** tant que la calibration est en cours, la
sortie du joueur vers le jeu est **forcée au silence**.

Sans elle, une recalibration en pleine partie ferait agir les cris de calibration sur le
monde — le joueur mesurerait son registre en projetant les meubles à travers la pièce. Le
système 1 nomme déjà `VoiceFrame.Silence` comme sortie d'un état non exploitable ; c'est le
même mécanisme.

> **Cette règle a un coût, et il appartient à quelqu'un d'autre.** Un joueur qui recalibre
> en portant un meuble à plusieurs cesse d'y contribuer pendant plusieurs secondes. Ce que
> subit l'objet — il s'alourdit, il se verrouille, ou rien — est une décision de gameplay
> traitée en **OQ-11**, partagée avec les systèmes 9 et 12.

---

### Interactions

| Système | Ce qu'il attend de nous | Ce qu'on attend de lui |
|---|---|---|
| **1. Analyse vocale** | Un `VoiceProfile` valide, ou rien. Jamais un profil partiel | Les règles de validation et les bornes ; il est la raison d'être de chaque champ |
| **2. Audio d'entrée** | Rien — nous ne possédons pas le micro | Les échantillons, à la même cadence fixe qu'en jeu ; et le signalement d'une coupure |
| **5. Réseau** | Rien. **La calibration est strictement locale** | Rien. Le profil ne traverse jamais le réseau — voir ci-dessous |
| **8. Session / lobby** | Le verdict « ce joueur a un profil valide » | Le point de blocage à l'entrée, et un état visible par les autres joueurs pendant l'attente |
| **14. Chat vocal** | Rien | **Aucune diffusion pendant la calibration.** C'est un moment privé, même en multijoueur |
| **19. UI diégétique** | La jauge de l'étape 3, en temps réel | Un affichage qui ne soit pas le sonomètre de jeu — le contexte est différent |

> **Le profil ne part jamais sur le réseau, et ce n'est pas un oubli.** ADR-0003 pose que
> chaque client analyse sa propre voix en local et ne transmet que des `VoiceFrame` déjà
> normalisées. Les autres joueurs n'ont donc aucun usage du profil : il resterait sur le
> fil sans consommateur, en exposant une donnée personnelle — le niveau sonore du domicile
> et la hauteur de voix — pour rien.

#### Le mode « réparation »

*Player Fantasy* distingue la première calibration des suivantes. Deux règles en découlent,
qui ne concernent que les relances :

- **Aucune étape pédagogique.** Pas de démonstration, pas d'explication du principe.
- **L'étape en cause se rejoue seule.** Un joueur dont seul le bruit ambiant a changé —
  fenêtre ouverte, ventilateur — rejoue l'étape 1 et rien d'autre. Le profil n'est
  recommité qu'après une **validation complète** sur les trois valeurs, anciennes et
  nouvelles mélangées.

Ce dernier point est la seule subtilité : **une étape rejouée seule doit repasser la
validation entière.** Un `Floor_dB` remesuré peut très bien devenir incompatible avec un
`Scream_dB` ancien, et l'accepter sans revérifier rouvrirait la porte au retournement
silencieux que le système 1 traque.

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
