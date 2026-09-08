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

> ### ✅ Le coût de cette règle est tranché — décision du 2026-09-08
>
> On craignait qu'un joueur recalibrant en portant un meuble à plusieurs devienne une charge
> muette accrochée à l'objet. **Ce cas n'existe pas.** La recalibration se lance depuis le
> menu ; ouvrir le menu immobilise le personnage, et **un personnage immobilisé pose ce
> qu'il porte**.
>
> La force de cette réponse est qu'elle **n'invente aucun cas particulier**. La calibration
> ne demande pas au portage un comportement spécial : elle emprunte un chemin que le
> système 9 doit gérer de toute façon — celui d'un porteur qui lâche, volontairement ou non.
> Ce qui advient de l'objet est donc une question de portage, pas de calibration.
>
> Il reste une conséquence sociale, et elle est acceptable : les coéquipiers voient un
> joueur poser sa moitié de canapé et se figer. C'est visible, lisible, et sans ambiguïté —
> à condition que l'UI dise **pourquoi**, ce qui est déjà une exigence de la section *UI
> Requirements*.

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

Toutes les valeurs chiffrées de cette section sont **PROVISOIRES**. Elles sont des paris
explicites, réglables et testables — pas des mesures. Elles rejoignent la porte de mesure
du système 1 : rien ailleurs ne doit les citer comme acquises.

### 1. `Floor_dB` — le plancher de bruit, avec sa marge

```
Bruit     = P95( Rms_dB(t) )   sur l'étape 1, joueur muet
Floor_dB  = Bruit + FloorMargin_dB          FloorMargin_dB PROVISOIRE 3
```

| Variable | Description |
|---|---|
| `P95` | 95ᵉ centile des niveaux observés pendant l'étape de silence |
| `FloorMargin_dB` | Marge au-dessus du bruit mesuré, exigée par le contrat du système 1 |

**Pourquoi un centile haut et pas le minimum.** Le minimum attrape un creux instantané, en
dessous du bruit réel de la pièce : le plancher se poserait trop bas et le bruit ambiant
produirait ensuite une `Loudness` non nulle. Le maximum, lui, attrape une porte qui claque.
Le P95 dit « le bruit est presque toujours sous cette valeur », ce qui est exactement la
propriété recherchée.

**Pourquoi une marge au-dessus.** Sans elle, `Floor_dB` tombe *dans* le bruit : les
fluctuations le franchissent une fois sur vingt et produisent de l'entrée fantôme. Avec
elle, le bruit ambiant est écrasé à zéro par le `clamp` de `Loudness`. C'est la garantie
que *Player Fantasy* du système 1 formule ainsi : **« quand je me tais, mon objet cesse de
réagir. »**

> **C'est cette marge, et non le seuil d'écart dynamique, qui empêche une oscillation de
> 2 dB de faire doubler `Loudness`.** Le système 1 l'a établi en revue ; c'est ici que
> l'exigence se réalise.

**Exemple** : pièce calme, `P95 = −58 dB` → `Floor_dB = −55 dB`.

### 2. `Rest_dB` et `F0_habituel` — la parole posée

```
V         = { trames de l'étape 2 telles que Voiced = true }
Rest_dB   = médiane( Rms_dB )  sur V
F0_habituel = médiane( F0 )    sur V

garde obligatoire : |V| ≥ VoicedMin      VoicedMin PROVISOIRE 100 trames
```

**Médiane, jamais moyenne.** Pour `F0`, une seule erreur d'octave de YIN déplacerait une
moyenne d'une demi-octave ; elle ne déplace pas une médiane. Pour `Rest_dB`, une toux ou un
raclement de gorge ferait le même dégât.

**Sur les trames voisées seulement.** Inclure les silences entre les mots tirerait
`Rest_dB` vers le plancher et décrirait les pauses du joueur plutôt que sa voix.

> **Cette formule crée une dépendance d'ordre entre les étapes.** Savoir quelles trames
> sont voisées exige `Floor_dB`, puisque la porte de voisement du système 1 s'écrit
> `Rms_dB > Floor_dB + Margin_dB`. **L'étape 1 doit donc précéder l'étape 2 pour une raison
> arithmétique**, en plus de la raison sociale déjà donnée. Les deux justifications
> pointent dans le même sens, ce qui est rassurant.

À `~50 Hz`, `VoicedMin = 100` représente **2 secondes de parole effectivement voisée** —
soit environ 3 secondes de parole réelle, les pauses comprises. Sous ce seuil, l'étape
n'a pas abouti et se rejoue.

### 3. `Scream_dB` — la montée et son plateau

```
M(t)      = max( Rms_dB )  sur [début , t]

Plateau   ⟺  M(t) − M(t − PlateauHold_s) < PlateauDelta_dB
          ET  M(t) − Floor_dB ≥ HardFloor_dB          ← le calage, obligatoire

Scream_dB = M(t_fin)
```

| Variable | Provisoire | Rôle |
|---|---|---|
| `PlateauDelta_dB` | **1,5** | Progression en deçà de laquelle on considère que ça ne monte plus |
| `PlateauHold_s` | **1,2** | Durée sur laquelle cette stagnation doit tenir |
| `PeakTimeout_s` | **10** | Au-delà, l'étape se termine sur le maximum atteint |

**La seconde condition est la plus importante des deux.** Tant que le maximum n'a pas
franchi le plancher dur, **aucun plateau n'est reconnu** : l'étape continue. Sans ce
calage, un joueur qui monte lentement verrait son plateau détecté trop tôt, puis son profil
refusé — **alors qu'il a coopéré**. C'est le défaut nommé par le système 1, et cette ligne
est sa correction.

Au-dessus du plancher dur mais sous la bande de qualité, le plateau **est** reconnu : le
profil part en `LowRange` plutôt qu'au rebut.

### 4. La validation — quatre contrôles, dans cet ordre

#### V1 — l'ordre strict

```
Floor_dB < Rest_dB < Scream_dB          sinon REFUS
```

Absorbe le contrôle `Floor_dB > Scream_dB` du système 1 et le renforce : c'est le
retournement silencieux du dénominateur, celui qui fait *baisser* `Loudness` quand on parle
plus fort.

#### V2 — l'écart dynamique, en deux paliers

```
Δ = Scream_dB − Floor_dB

Δ <  HardFloor_dB                    → REFUS
HardFloor_dB ≤ Δ < QualityBand_dB    → ACCEPTÉ, LowRange = true
Δ ≥ QualityBand_dB                   → ACCEPTÉ, LowRange = false

HardFloor_dB PROVISOIRE 13 · QualityBand_dB PROVISOIRE 20
```

#### V3 — la plausibilité, par l'ancrage `Rest_dB`

**C'est le contrôle qui justifie l'existence du troisième champ.**

```
r = (Rest_dB − Floor_dB) / (Scream_dB − Floor_dB)      r ∈ ]0,1[ garanti par V1

RestMin ≤ r ≤ RestMax                 sinon REFUS
RestMin PROVISOIRE 0,15 · RestMax PROVISOIRE 0,70
```

`r` situe la voix posée dans le registre mesuré. Une calibration honnête la place
franchement au-dessus du bruit et franchement en dessous du cri.

**Ce que ce contrôle attrape et que V2 laisse passer** — deux cas réels :

| Cas | Mesures | Δ | `r` | Verdict |
|---|---|---|---|---|
| Pièce très calme, faux cri | Floor −70 · Rest −25 · Scream −22 | **48 dB, excellent** | **0,94** | **REFUS** — le « cri » est à peine au-dessus de la conversation ; le grand écart vient du silence de la pièce, pas de l'amplitude vocale |
| Étape 2 ratée | Floor −50 · Rest −48 · Scream −25 | **25 dB, correct** | **0,08** | **REFUS** — la voix posée colle au plancher : le joueur n'a pas parlé, ou a parlé hors axe du micro |

Dans les deux cas, l'écart dynamique paraît sain et la calibration est inexploitable.
**Deux points ne mesurent que l'étendue ; trois points mesurent la vraisemblance.**

#### V4 — la hauteur de référence

```
F0Min ≤ F0_habituel ≤ F0Max           sinon REFUS
F0Min = 20 Hz · F0Max PROVISOIRE 500 Hz
```

La borne basse reprend celle du système 1 : à 0,01 Hz, `Pitch` vaudrait +162 demi-tons sans
jamais diverger. La borne haute attrape une accroche d'harmonique ou une source qui n'est
pas une voix.

> **⚠️ `F0Max` est une valeur sensible à l'équité, et elle n'est pas mesurée.** Les voix
> d'enfant montent couramment à 300–400 Hz de médiane. Une borne mal placée les refuserait
> — dans un jeu dont la mécanique est de crier, et dont le système 1 a déjà dû corriger un
> défaut d'équité visant exactement cette population. **Cette valeur ne doit pas être figée
> sans avoir été confrontée à de vraies voix d'enfant.**

### 5. La cadence de décimation, décidée par le profil

```
DecimationHz = ( F0_habituel × 2 > 600 )  ?  12000  :  8000

Plage de recherche = [ max(70 , F0_habituel / 2) ,  min(PlafondHz , F0_habituel × 2) ]
   PlafondHz = 600 à 8 kHz · 900 à 12 kHz
```

Ces règles ne sont pas décidées ici : elles reprennent les *Edge Cases* du système 1, qui
les tient d'ADR-0004. Ce document se contente d'être **l'endroit où la décision est prise**,
puisque c'est le profil qui la détermine.

**Conséquence d'implémentation.** La cadence dépendant du profil, le `Decimator` et le
`PitchDetector` du système 1 sont **reconstruits à la réception du profil**, jamais à la
construction de l'analyseur.

### Récapitulatif des valeurs provisoires

Dix valeurs, aucune mesurée. Elles s'ajoutent aux dix du système 1.

| Valeur | Provisoire | Se règle par |
|---|---|---|
| `FloorMargin_dB` | 3 | Mesure d'entrée fantôme en pièce réelle |
| `VoicedMin` | 100 trames | Essai : combien de parole avant que la médiane se stabilise |
| `PlateauDelta_dB` | 1,5 | Essai sur montées réelles |
| `PlateauHold_s` | 1,2 | Essai — trop court coupe la montée, trop long fatigue |
| `PeakTimeout_s` | 10 | Essai |
| `HardFloor_dB` | 13 | Protocole A du système 1 |
| `QualityBand_dB` | 20 | Protocole A du système 1 |
| `RestMin` | 0,15 | Statistiques sur calibrations réelles |
| `RestMax` | 0,70 | Statistiques sur calibrations réelles |
| `F0Max` | 500 Hz | **Doit passer par de vraies voix d'enfant** |

## Edge Cases

Chaque entrée nomme la **condition exacte**, la **résolution exacte**, et sa sévérité :
**bloquant** (le système produit un profil faux sans le signaler), **dégradant** (profil
médiocre mais honnête) ou **cosmétique**.

### Pendant la mesure

- **Si le micro coupe ou change pendant une étape** : l'étape est annulée, **le tampon est
  jeté en entier**, retour à `Idle`, profil actif intact. **Bloquant si non traité** —
  conserver « le `Scream_dB` atteint jusque-là » fabrique exactement les profils dégénérés
  que la validation existe pour refuser.

- **Si le joueur parle pendant l'étape de silence** : `P95` remonte au niveau de sa voix,
  `Floor_dB` se pose beaucoup trop haut, et **toute parole normale donnera ensuite
  `Loudness = 0`** — le jeu ne réagirait plus qu'aux cris. **Bloquant.** Détection : si
  l'étape 1 contient des trames voisées, ou si l'écart `P95 − P50` dépasse un seuil, l'étape
  n'a pas été respectée et se rejoue.

- **Si un bruit transitoire survient pendant l'étape de silence** — porte, chien,
  notification : le `P95` y est robuste par construction, un transitoire court ne déplace
  pas un centile haut. **Cosmétique.** En revanche un bruit *soutenu* — aspirateur,
  circulation — élève légitimement le plancher : ce n'est pas une erreur de mesure, c'est
  l'environnement réel du joueur, et `Floor_dB` doit le refléter.

- **Si le joueur ne parle pas assez à l'étape 2** : `|V| < VoicedMin`, l'étape n'a pas
  abouti et se rejoue. **Dégradant.**

- **Si le joueur chuchote à l'étape 2** : le chuchotement phonétique est **structurellement
  apériodique**, YIN le déclare non voisé, `|V|` reste sous le seuil et on retombe sur le
  cas précédent. **Le système se protège tout seul**, mais le message au joueur doit le
  dire — « on ne t'entend pas assez » — et non le laisser recommencer à l'identique.

- **Si le signal écrête pendant l'étape 3** : `Scream_dB` mesure alors **le plafond du
  micro, pas celui de la voix**. Le profil reste utilisable — le haut de l'échelle est le
  haut de ce que le matériel sait porter — mais **tout ce que le joueur produit au-delà
  devient indiscernable**, et son registre haut est aplati pour toute la partie.
  **Dégradant, et à signaler** : c'est le seul cas où la bonne réponse est de demander au
  joueur de **baisser le gain d'entrée** de son micro, puis de recommencer.

- **Si le joueur monte très vite à l'étape 3** : le plateau est reconnu presque
  immédiatement, la porte de calage étant franchie. Ce n'est pas un défaut — la mesure est
  valide. **Cosmétique.**

- **Si le joueur change de distance au micro entre les étapes** : la calibration mélange
  deux référentiels. S'éloigner abaisse `Rest_dB` et `Scream_dB` sans toucher `Floor_dB`,
  donc l'écart se resserre et V2 ou V3 attrapent les cas francs. **Mais les cas légers
  passent.** **Dégradant, partiellement détectable** — l'UI doit demander de ne pas bouger,
  ce qui est moins coûteux que de tenter de le mesurer.

### À la validation

- **Si l'écart tombe juste sous le plancher dur** : refus, et **le joueur a coopéré**. Le
  message porte sur le micro et la pièce, jamais sur sa voix. **Bloquant, mais c'est le
  comportement voulu** — ce que ce refus protège, c'est un dénominateur exploitable.

- **Si la source n'est pas une voix humaine** — télévision, musique, une autre personne qui
  parle à côté : **aucun contrôle ne l'attrape.** Les quatre validations vérifient la
  cohérence des mesures, pas leur provenance. Un profil calibré sur la télé sera
  parfaitement valide et parfaitement inutile. **Dégradant, non détectable, et il faut le
  dire plutôt que prétendre l'inverse.**

- **Si `F0_habituel × 2` tombe près de 600 Hz** : deux calibrations successives de la même
  personne peuvent basculer entre 8 kHz et 12 kHz de décimation. Les deux chaînes
  fonctionnent, mais le joueur n'a pas exactement le même pipeline d'une fois sur l'autre.
  **Cosmétique** — à traiter par une hystérésis si le playtest montre une différence
  perceptible.

- **Si `F0_habituel × 2` dépasse 900 Hz même à 12 kHz** : la plage est clampée et la perte
  documentée. **Dégradant, non résolu** — c'est le reliquat du défaut d'équité des voix
  très aiguës, que le système 1 a corrigé jusqu'à 900 Hz et pas au-delà. Cas extrême, à
  surveiller en playtest **avec de vraies voix d'enfant**.

### Persistance et reprise

- **Si le profil sur disque est illisible ou corrompu** : il est traité comme **absent**.
  Calibration forcée. **Jamais de chargement partiel** — un profil à moitié lu est un
  profil dégénéré qui a contourné la validation.

- **Si le profil sur disque vient d'une version antérieure du format** : soit il se migre,
  soit il est traité comme absent. **Le profil doit donc porter un numéro de version de
  schéma** — sans quoi un ajout de champ transformerait tous les profils existants en
  données silencieusement mal interprétées. **Bloquant si non prévu**, et c'est un besoin
  de conception, pas un cas limite d'exécution.

> ### ⚠️ Le cas que les valeurs provisoires nous préparent
>
> **Si un profil valide à l'écriture devient invalide parce que les seuils ont changé.**
> Ce document porte dix valeurs provisoires, dont `HardFloor_dB`, `RestMin`, `RestMax` et
> `F0Max` — toutes utilisées par la validation. Le jour où la mesure les déplace, **des
> profils déjà enregistrés cesseront de passer les contrôles.**
>
> **Résolution : revalider à chaque chargement**, jamais seulement à l'écriture. Un profil
> qui échoue redevient absent et déclenche une calibration, avec un message honnête —
> « nos réglages ont changé, il faut refaire une mesure ». **Bloquant si non traité** :
> sans revalidation au chargement, un profil devenu hors normes continuerait de piloter la
> normalisation sans que rien ne le signale.
>
> C'est le prix, prévu et accepté, d'assumer des valeurs provisoires plutôt que de les
> inventer définitives.

- **Si une étape est rejouée seule** : le profil n'est recommité qu'après une **validation
  complète sur les quatre contrôles**, valeurs anciennes et nouvelles mélangées. **Bloquant
  si non traité** — un `Floor_dB` remesuré peut devenir incompatible avec un `Scream_dB`
  ancien, et l'accepter sans revérifier rouvre la porte au retournement silencieux.

### Le profil qui devient faux sans que rien ne casse

C'est la famille de cas la plus insidieuse, parce qu'aucune erreur ne se produit nulle part.

- **Si le joueur calibre dans un environnement et joue dans un autre** — calibré au calme le
  matin, joue le soir avec la télévision allumée : `Floor_dB` est désormais **sous** le
  bruit ambiant réel. Le bruit franchit la porte de voisement, et le joueur subit de
  l'**entrée fantôme** — ses objets réagissent quand il se tait. **Dégradant.**

- **Si le joueur change de micro** — casque le soir, micro du portable en déplacement : le
  contrat du système 1 pose qu'**un changement de périphérique ne force jamais de
  recalibration**. C'est un choix délibéré, parce que ces événements se déclenchent souvent
  à tort et qu'éjecter un joueur en plein contrat serait le pire moment possible. **Mais le
  prix est réel : le profil peut devenir faux en silence.**

> **Ces deux cas ne se détectent pas de façon fiable, et c'est précisément pourquoi la
> calibration doit être relançable à tout moment et rapidement.** L'exigence d'accessibilité
> permanente n'est pas un confort d'ergonomie : c'est **la seule mitigation** d'une classe
> de défauts que rien ne signale. Le joueur est le capteur.
>
> Cela redonne son poids au mode « réparation » de *Player Fantasy* : ce n'est pas un
> parcours secondaire, c'est le filet de sécurité de tout le système.

## Dependencies

Ce document reprend la distinction posée par `voice-analysis.md`, qui a fait ses preuves :
une **dépendance de conception** empêche de *spécifier* tant que l'autre ne l'est pas ; une
**dépendance d'exécution** empêche de *fonctionner* une fois en marche. Les confondre
fabrique des cycles fantômes.

### Le tableau

| Système | Nature | Sens | Interface |
|---|---|---|---|
| **1. Analyse vocale** | **DURE — conception** | mutuelle | **Chaque champ du profil existe parce qu'une de ses formules le réclame.** On ne pouvait pas spécifier ce système avant lui — et c'est fait, il est `Designed` |
| **2. Audio d'entrée** | **DURE — exécution** | il nous pousse | Les échantillons, **à la même cadence et par le même trajet qu'en jeu**. Plus les événements de périphérique |
| 8. Session / lobby | consommateur | il lit | Le verdict « ce joueur a un profil valide », et la porte d'entrée qui en découle |
| 14. Chat vocal | contraint | il se tait | **Aucune diffusion pendant la calibration** — et davantage, voir plus bas |
| 19. UI diégétique | consommateur | il lit | La jauge temps réel de l'étape 3 |
| 5. Réseau | **aucune** | — | **Le profil ne traverse jamais le réseau.** Décidé en *Detailed Rules* |

**Une seule dépendance de conception, et elle est déjà satisfaite.** C'est ce qui rend ce
document écrivable maintenant.

### Le cycle apparent 1 ↔ 6, et pourquoi ce n'en est pas un

L'index déclare que 6 dépend de 1 et 2 ; le système 1, lui, ne produit rien sans notre
profil. Cela ressemble à un cycle et n'en est pas un : **les deux vivent dans la même
assembly** (ADR-0006) et partagent les mêmes primitives internes. Ce n'est pas une
dépendance entre modules, c'est une collaboration interne. `voice-analysis.md` le
démontre en détail ; ce document s'y range.

### La calibration vit dans deux assemblies, et la ligne compte

| Ce qui vit où | Assembly | Testable sans Unity |
|---|---|---|
| Mesures, médianes, détection de plateau, **les quatre validations** | `SUAC.Voice.Core` — `noEngineReferences` | **Oui** |
| Parcours, écrans, jauge, persistance sur disque | Couche Unity | Non |

**Tout ce qui peut produire un profil faux est du côté testable.** C'est la conséquence
directe d'ADR-0006, et elle n'est pas un hasard : les quatre contrôles de validation sont
précisément ce qu'on veut pouvoir exercer en millisecondes, sans micro et sans scène, avec
des profils synthétiques dégénérés.

La couche Unity, elle, ne décide rien — elle collecte, affiche et range.

---

### Ce que les GDD voisins devront porter

Cohérence bidirectionnelle exigée par les règles du projet. Aucun de ces systèmes n'a
encore de GDD.

**Système 2 — Audio d'entrée**
- Livrer les échantillons **par le même trajet qu'en jeu** : post-AEC, sans VAD, sans AGC,
  sans suppression de bruit. **Un AGC actif pendant la calibration rendrait la mesure
  absurde** — il égaliserait justement l'écart qu'on cherche à mesurer.
- Même **cadence fixe** qu'en jeu. Calibrer sur un trajet et jouer sur un autre invaliderait
  la mesure sans que rien ne le signale.
- Être **déjà en marche** avant le lancement de la calibration.
- Signaler coupure et changement de périphérique, pour l'annulation d'étape.

**Système 8 — Session / lobby**
- Porter la **porte d'entrée** : un joueur sans profil valide ne rejoint pas.
- Rendre l'attente lisible pour les autres — « X termine sa configuration » — plutôt qu'un
  silence qui se lit comme un plantage.

**Système 14 — Chat vocal**
- **Ne rien diffuser** de ce que le joueur produit pendant sa calibration. C'est un moment
  privé, même en multijoueur.
- *(La réciproque — ne pas lui faire entendre les autres — n'a pas besoin d'être demandée :
  elle découle de l'état de pause. Voir la décision du 2026-09-08 plus bas.)*

**Système 19 — UI diégétique**
- La jauge de l'étape 3, en temps réel, et **distincte du sonomètre de jeu** : le contexte
  n'est pas le même, et confondre les deux affichages reviendrait à dire au joueur qu'il
  joue alors qu'il se règle.

**Systèmes 7 et 9 — 3C et Portage : rien à ajouter, mais une confirmation à obtenir**
- La décision du 2026-09-08 fait reposer la recalibration en jeu sur un comportement
  générique : ouvrir le menu immobilise le personnage, et un personnage immobilisé **pose
  ce qu'il porte**. **Nous ne demandons donc aucun comportement spécial** — nous empruntons
  un chemin que le portage doit gérer de toute façon, celui d'un porteur qui lâche.
- La seule chose à vérifier au moment d'écrire ces GDD est que ce chemin **existe bien**.
  Si le portage ne prévoyait pas qu'un porteur puisse lâcher en cours de transport, notre
  élégance s'effondrerait et il faudrait rouvrir OQ-11.

---

### Une interaction que personne n'avait vue : la calibration en jeu écoute le salon

Un joueur qui recalibre **en cours de partie** a les voix de ses coéquipiers dans les
oreilles. S'il joue sur haut-parleurs, ces voix rentrent dans son micro — et pendant
l'étape 1, elles sont mesurées comme **bruit ambiant**.

La conséquence est le pire mode d'échec du système : **`Floor_dB` gonflé**. Un plancher
placé au niveau de la conversation de ses amis écrase ensuite toute sa parole normale à
`Loudness = 0`. Il ne réagirait plus qu'aux cris, sans qu'aucune validation ne s'en
aperçoive — les quatre contrôles vérifieraient un profil parfaitement cohérent.

**L'AEC couvre ce cas en principe**, puisqu'elle est en amont de la fourche (ADR-0003) et
retire du signal ce que les haut-parleurs émettent. Mais s'en remettre à elle seule, sur
l'étape la plus sensible du parcours, serait un pari inutile — d'autant que la réponse
tient en une ligne.

> ### ✅ Tranché le 2026-09-08 — **le casque est un prérequis du jeu**
>
> *Shut Up & Carry !* est un jeu bâti sur le son et le micro. **Jouer au casque avec un
> micro est une condition d'entrée, pas une recommandation de confort.** Les joueurs sur
> haut-parleurs sont pénalisés d'office, et c'est assumé : on n'investit pas d'énergie à
> rattraper ce cas.
>
> ADR-0003 posait déjà le casque comme repli — « sans AEC → casque obligatoire ». Cette
> décision l'en sort : **le casque n'est plus un repli, c'est la ligne de base.** Ce qui ne
> retire rien à l'AEC, un casque ouvert fuyant largement assez pour la justifier ; cela
> borne simplement le pire cas.
>
> **La solution facile est prise quand même**, parce qu'elle ne coûte rien : la
> recalibration se fait depuis le menu, donc **en pause — le son du jeu est coupé de toute
> façon**, chat vocal compris. Il n'y a pas de règle spéciale à écrire pour le système 14 :
> le silence pendant la mesure découle de l'état de pause, pas d'une exception.
>
> C'est la deuxième fois que le passage par le menu résout gratuitement un problème de ce
> document — après la question de l'objet porté. Ce n'est probablement pas un hasard : **la
> calibration a besoin que le monde s'arrête, et le menu est exactement ça.**

## Tuning Knobs

### L'arbitrage à exposer avant tous les autres

> **L'inclusion contre la qualité de mesure.**

C'est l'axe unique de ce système. **Chaque seuil qu'on desserre pour accepter un joueur de
plus accepte aussi un profil un peu plus mauvais**, et chaque seuil qu'on resserre pour
garantir la mesure exclut quelqu'un qui aurait pu jouer.

Il n'y a pas de réglage qui fasse gagner sur les deux. Ce que ces curseurs doivent faire,
c'est **rendre l'arbitrage visible** plutôt que le figer implicitement — même discipline
qu'au système 1, et même raison.

Le drapeau `LowRange` est ce qui rend cet axe supportable : il transforme un choix binaire
— j'accepte ou j'exclus — en **gradation**. Sans lui, chaque desserrage serait une
concession sèche sur la qualité.

### Les curseurs

| Curseur | Provisoire | Plage sûre | Trop haut | Trop bas |
|---|---|---|---|---|
| `FloorMargin_dB` | **3** | 1 – 6 | le plancher monte, l'écart dynamique se resserre, des profils légitimes deviennent `LowRange` ou refusés | le bruit ambiant franchit la porte : entrée fantôme, l'objet réagit quand le joueur se tait |
| Durée de l'étape 1 | **3 s** | 2 – 5 s | le joueur attend en silence, ce qui est plus inconfortable qu'il n'y paraît | le `P95` porte sur trop peu d'échantillons, un seul transitoire le déplace |
| Centile du plancher | **P95** | P90 – P98 | on capture les transitoires et le plancher monte | on descend sous le bruit réel de la pièce |
| Écart `P95 − P50` toléré | *à définir* | — | on ne détecte plus qu'un joueur a parlé pendant l'étape de silence | on rejoue l'étape pour une pièce simplement vivante |
| `VoicedMin` | **100 trames** | 60 – 200 | l'étape 2 s'éternise — insupportable en mode réparation | la médiane est instable, une erreur d'octave pèse trop lourd |
| `PlateauDelta_dB` | **1,5** | 1 – 3 | le plateau se déclare pendant que le joueur monte encore : `Scream_dB` sous-estimé | le plateau ne se déclare jamais et le délai devient le vrai terminateur |
| `PlateauHold_s` | **1,2** | 0,8 – 2 | le joueur doit tenir son cri longtemps : fatigant, et désagréable à faire | une inspiration suffit à déclencher un faux plateau |
| `PeakTimeout_s` | **10** | 8 – 15 | on laisse pousser trop longtemps, ce qui n'est bon pour aucune voix | on coupe la montée d'un joueur qui monte lentement |
| `HardFloor_dB` | **13** | 10 – 16 | exclut des joueurs légitimes, discrets ou mal équipés | des profils inexploitables passent la validation |
| `QualityBand_dB` | **20** | 16 – 24 | trop de joueurs marqués `LowRange` et lissés sans nécessité | des profils instables jouent sans lissage renforcé |
| `RestMin` | **0,15** | 0,08 – 0,25 | refuse des joueurs dont la voix posée est naturellement basse | laisse passer une étape 2 ratée, voix hors axe du micro |
| `RestMax` | **0,70** | 0,60 – 0,85 | laisse passer un faux cri à peine au-dessus de la conversation | refuse un joueur qui parle fort naturellement |
| `F0Max` | **500 Hz** | **à mesurer** | accepte une accroche d'harmonique ou une source qui n'est pas une voix | **refuse des voix d'enfant** |
| Renforcement `LowRange` | **×1,5** | 1,2 – 2,5 | la voix des joueurs concernés devient molle : on les inclut pour leur donner un jeu terne | le lissage ne compense pas leur registre étroit, `Loudness` sautille |

### Le curseur qui n'agit pas ici — et le contrat qu'il crée

**`LowRange` est décidé par ce système et appliqué par le système 1.** Le drapeau ne fait
rien en lui-même : il demande à l'`EnvelopeFollower` d'allonger ses constantes de temps
pour ce joueur.

> **Contrat à reporter dans `voice-analysis.md` :** le système 1 doit **lire `LowRange` et
> multiplier ses constantes d'attaque et de relâchement** par le facteur ci-dessus. Sans
> cela, le drapeau est décoratif — un profil marqué, un lissage inchangé, et l'inclusion
> qu'on croyait avoir gagnée reste sur le papier.

### Les interactions — tourner un curseur peut en annuler un autre

**`FloorMargin_dB` contre `HardFloor_dB`.** Ils agissent sur la **même grandeur par les
deux bouts** : monter la marge relève `Floor_dB`, donc rétrécit `Δ = Scream_dB − Floor_dB`,
donc rapproche le profil du refus. Durcir la protection contre l'entrée fantôme **exclut
mécaniquement des joueurs**, sans qu'on ait touché au seuil d'exclusion.

**`RestMax` contre `HardFloor_dB`.** Ce sont deux chemins vers la même défense — le faux
cri. Un `HardFloor_dB` élevé le refuse par l'écart ; un `RestMax` bas le refuse par la
position. **Baisser les deux ensemble ouvre la porte en grand**, et c'est tentant, puisque
baisser chacun se justifie séparément au nom de l'inclusion.

**Le trio du plateau — `PlateauDelta_dB`, `PlateauHold_s`, `PeakTimeout_s`.** Si le plateau
devient difficile à déclencher, **le délai devient le vrai terminateur de l'étape** : la
mesure ne dépend plus de l'endroit où le joueur a plafonné, mais de sa patience. Le
plateau est alors décoratif. **Ces trois-là se règlent ensemble ou pas du tout.**

**`VoicedMin` contre le mode réparation.** Plus de trames donnent une meilleure médiane et
une étape plus longue. Or *Player Fantasy* pose qu'une relance doit être **rapide** : le
joueur qui recalibre a un problème et veut le régler, pas passer un examen. Régler
`VoicedMin` sur la qualité seule dégrade le parcours qui compte le plus.

**Le renforcement `LowRange` contre la réactivité.** C'est la tension centrale du système 1
— l'attribution veut de la stabilité, le contrôle veut de la réactivité — appliquée à une
sous-population. On lisse pour que leur mesure ne sautille pas, et on leur donne un jeu
plus mou qu'aux autres. **Inclure quelqu'un dans un jeu terne n'est pas l'inclure.**

### Ce qui n'est pas un curseur

Cinq choses ressemblent à des réglages et n'en sont pas :

- **L'ordre des trois étapes.** Silence, puis parole, puis montée. C'est un **contrat**,
  doublement : l'étape 2 a besoin de `Floor_dB` pour savoir quelles trames sont voisées, et
  commencer par le geste le moins exposant est ce qui rend la suite acceptable.
- **Le calage du plateau sur `HardFloor_dB`.** On peut déplacer `HardFloor_dB` ; on ne peut
  pas **découpler** la détection de plateau de la validation. Les découpler ramène le
  défaut que ce calage corrige : refuser un joueur qui a coopéré.
- **V1, l'ordre strict `Floor < Rest < Scream`.** Ce n'est pas un seuil, c'est une garde de
  correction. Il n'y a pas de valeur à choisir.
- **Médiane et non moyenne.** C'est une méthode, choisie pour la robustesse aux erreurs
  d'octave. La changer ne règle rien, elle casse.
- **La revalidation au chargement.** Elle n'est pas négociable tant qu'une seule valeur de
  ce document reste provisoire — c'est-à-dire aujourd'hui, pour les quatorze.

> **Sur les valeurs marquées *à définir*.** Il n'en reste qu'une, l'écart `P95 − P50`
> toléré à l'étape 1. Elle échoue au test des trois critères posé par le système 1 — pas de
> valeur provisoire, pas de déclencheur nommé — et elle rejoint le TTL de l'anneau comme
> seul manquement de cette catégorie dans les deux documents. À combler par la mesure, en
> même temps que le reste.

## Visual/Audio Requirements

**Contrairement au système 1, celui-ci a bel et bien une image et un son.** Le système 1
transforme un micro en quatre nombres et n'affiche rien ; la calibration est un écran qu'on
regarde pendant deux minutes, et c'est le premier du jeu.

Comme ailleurs dans ce projet, la section reste au niveau **exigence** — ce qui doit être
communiqué, jamais à quoi cela ressemble. La direction visuelle évoluera quand un graphiste
entrera dans l'équation.

### Le principe qui gouverne toute la section

> **Les canaux de retour de la calibration doivent être ceux du jeu.**

Si la calibration donne au joueur un retour qu'il n'aura plus ensuite, elle ne l'entraîne
pas : **elle lui apprend un mensonge**, et il devra désapprendre au premier contrat. Ce
principe tranche à lui seul trois questions qu'on se poserait sinon une par une — le
sidetone, l'exemple à imiter, la réécoute.

### La jauge de l'étape 3

C'est le seul élément visuel qui compte vraiment, et *Player Fantasy* explique pourquoi :
**l'enseignement est la technique de mesure.** Un joueur qui voit sa voix agir pousse plus
loin, donc se mesure mieux. Une jauge molle ne produit pas seulement un écran terne, elle
produit **des profils au registre écrasé**.

- **Réponse en temps réel**, sans lissage qui la découplerait de la voix. Le joueur doit
  sentir le lien de cause à effet, c'est tout l'objet du moment.
- **Aucune cible, aucun plafond, aucun score.** Ce point est le plus important de la
  section, et il est contre-intuitif.

> **Pourquoi une cible ruinerait la mesure.** Montrer une zone à atteindre transforme
> l'étape en test — et *Player Fantasy* établit qu'un test appelle **l'effort minimal
> suffisant pour le réussir**. Le joueur pousserait jusqu'à la ligne puis s'arrêterait, et
> on mesurerait notre propre seuil au lieu de son amplitude.
>
> La jauge doit donc **toujours conserver de la marge** : quoi que produise le joueur, il
> reste de la place au-dessus. On ne mesure pas s'il atteint quelque chose, on mesure où il
> s'arrête tout seul.

### Ce qu'on ne montre jamais

- **Aucun indicateur de niveau pendant l'étape 1.** Un vumètre vivant pendant l'étape de
  silence **invite à le faire bouger** — exactement le comportement qui ruine la mesure du
  plancher. L'attente se signale par une progression neutre, qui ne réagit pas à la voix.
- **Aucune valeur chiffrée.** Ni décibels, ni hertz, ni pourcentage de « qualité ». Le
  joueur n'a rien à en faire et cela transformerait un réglage en bulletin de notes.
- **Aucun exemple à imiter.** L'idée de faire écouter « voilà un cri correct » reviendra —
  elle est doublement mauvaise : elle pose une cible, et elle transforme une mesure en
  imitation, donc en performance jugée.
- **Aucune réécoute.** Faire entendre au joueur ce qu'on a enregistré de lui est
  désagréable pour beaucoup, et suppose de conserver de l'audio — voir plus bas.

### Les trois étapes doivent se distinguer au premier regard

Elles demandent trois choses différentes, et un joueur qui ne remarque pas le changement de
consigne exécute la précédente. **La distinction se porte visuellement**, pas par un
texte qu'on suppose lu.

Corollaire : la transition entre étapes ne doit **pas** être signalée par un son — voir la
règle suivante.

### L'étape de silence doit être vraiment silencieuse

> **Aucun son n'est émis pendant l'étape 1. Aucun.** Pas de clic d'interface, pas
> d'ambiance, pas de musique, pas de bip de transition.

Le jeu se joue au casque (décision du 2026-09-08), mais un casque fuit, et le pire mode
d'échec de tout le système est un **`Floor_dB` gonflé** — un plancher posé au-dessus du
bruit réel écrase ensuite toute parole normale à zéro. Trois secondes de silence complet
coûtent moins qu'un profil définitivement faux.

Le reste du parcours peut sonner normalement. Une confirmation à la fin est bienvenue : la
mesure est terminée, plus rien ne peut être pollué.

### Pas de sidetone, et c'est la même raison qu'au système 1

Le jeu n'injecte pas de retour de la voix du joueur — ni en jeu, ni ici. La règle vient du
système 1, mais elle se justifie doublement pendant la calibration : **un sidetone
présent à la calibration et absent en jeu apprendrait au joueur à s'écouter, alors que le
jeu lui demandera de regarder.**

C'est le principe de tête de section, appliqué : la calibration doit se sentir comme le jeu
se sentira.

### `LowRange` — visible, actionnable, jamais un verdict

Le drapeau change ce que le joueur vivra ensuite : sa mesure sera plus lissée. Le lui
cacher serait malhonnête ; le lui annoncer comme un défaut serait pire.

- **Toujours accompagné d'une action possible.** « Ta plage est un peu étroite, le jeu s'y
  adapte — si tu peux rapprocher ton micro, tu gagneras en précision. »
- **Jamais un badge, un score, ni une couleur d'alerte.** Ce n'est pas un échec : c'est le
  système qui fait son travail d'inclusion.
- **Jamais visible par les autres joueurs.** C'est une information sur le matériel et le
  logement de quelqu'un.

### Le langage visuel du refus

Un refus est un **réglage à reprendre**, pas une erreur commise. Le vocabulaire visuel de
l'erreur — rouge, croix, icône d'alerte — dirait au joueur qu'il a raté quelque chose,
alors que la cause est presque toujours son micro ou sa pièce.

*Player Fantasy* l'exige : le joueur ne doit jamais ressentir que **le jeu juge sa voix**.

### Ce qu'on ne conserve pas

> **La calibration ne garde aucun audio. Jamais.** Le profil est constitué de **quatre
> nombres et un drapeau** — rien d'autre n'est écrit sur le disque, et rien ne part sur le
> réseau (décidé en *Detailed Rules*).

Ce n'est pas une exigence technique, c'est une exigence de confiance. Un jeu qui demande
l'accès au micro dès le premier lancement et fait crier ses joueurs doit pouvoir dire, en
clair et sans qu'on le lui demande, **ce qu'il garde et ce qu'il ne garde pas**. Le fait
que ce soit déjà vrai par conception ne coûte rien à énoncer — et ne pas l'énoncer laisse
la question ouverte dans la tête du joueur.

## UI Requirements

> **Section rapatriée le 2026-09-08** depuis `voice-analysis.md`, qui la portait en dépôt
> faute de destinataire. La revue du 2026-09-07 avait raison : un système sans interface
> n'avait pas à porter cette section. Elle est chez elle ici.
>
> Elle n'arrive pas telle quelle. **Cinq points de la version d'origine sont devenus faux ou
> incomplets** depuis, et sont corrigés ci-dessous — le parcours à deux étapes, le nombre de
> causes de refus, la recalibration en cours de partie, l'exclusion d'accessibilité, et
> l'absence de distinction entre première calibration et relance.

### Les écrans requis

- **Écran de calibration** — première utilisation, bloquant tant qu'il n'est pas validé
- **Accès à la calibration** depuis le menu du lobby **et** depuis le menu en jeu
- **Indicateur d'état vocal permanent** — `Uncalibrated` / `Calibrated` / `Degraded` —
  **distinct du sonomètre diégétique**
- **Écran de blocage** pour qui tente de rejoindre sans profil calibré
- **Message de prérequis matériel** — voir *Le casque* plus bas

### Le parcours

Le vrai problème d'UX de ce jeu n'est pas technique : **il faut demander à quelqu'un de
crier dans son micro, et beaucoup de joueurs sont dans un salon avec d'autres gens.** La
calibration doit se présenter comme **le réglage d'un instrument**, jamais comme une épreuve
à réussir.

L'ordre des étapes fait tout le travail :

1. **Le silence** — « ne dis rien pendant quelques secondes ». L'étape la plus neutre
   socialement de toutes, et la seule qui puisse donner `Floor_dB`.
2. **La parole posée** — « parle normalement, comme si tu discutais ». Donne `Rest_dB` et
   `F0_habituel`.
3. **La montée**, progressive, avec **une jauge qui répond en temps réel**. Le joueur pousse
   à son rythme jusqu'à un plateau détecté automatiquement — **jamais d'ordre frontal** du
   type « crie le plus fort possible ».

Trois garanties non négociables :

- **Aucune diffusion vers les autres joueurs** pendant la calibration. Moment privé, même en
  multijoueur.
- **Ne pas demander au joueur de bouger** — et le lui dire. Changer de distance au micro
  entre les étapes mélange deux référentiels, et les cas légers passent toutes les
  validations.
- **Une étape se rejoue seule**, sans repasser par les précédentes.

> **La jauge de l'étape 3 n'est pas un accessoire.** *Player Fantasy* établit que
> l'enseignement **est** la technique de mesure : un joueur qui voit sa voix agir pousse
> plus loin, donc se mesure mieux. Une étape 3 sans retour visuel temps réel ne produit pas
> seulement une expérience terne — elle produit **des profils au registre écrasé**.

### Deux modes, et ils ne se ressemblent pas

C'est l'ajout le plus important de ce rapatriement.

| | **Découverte** — la première fois | **Réparation** — toutes les suivantes |
|---|---|---|
| Ce que veut le joueur | Comprendre | Que ce soit fini |
| Rythme | Aucune hâte | **Le plus court possible** |
| Explications | Oui, c'est le moment d'onboarding | **Aucune** |
| Point d'entrée | Le parcours complet | **L'étape en cause, directement** |

**Traiter une relance comme une première fois est une faute.** Un joueur qui recalibre a un
problème et veut le régler ; lui réexpliquer le principe le punit d'avoir eu un incident.

### Le refus de profil

**Quatre contrôles peuvent refuser, et V3 refuse dans deux directions opposées** — la
version d'origine n'en comptait que trois, avant que `Rest_dB` n'ait un rôle.

| Cause | Ce qu'on dit, en substance | Étape à rejouer |
|---|---|---|
| V1 — ordre incohérent | « Quelque chose ne colle pas dans la mesure, on recommence » | Tout |
| V2 — écart trop faible | « On n'arrive pas à distinguer ta voix calme de ta voix forte — essaie avec le micro plus proche » | 3, puis 1 si ça persiste |
| V3 haut — faux cri | « Ta voix forte ressemble trop à ta voix normale — tu peux pousser un peu plus ? » | **3 seulement** |
| V3 bas — voix posée collée au plancher | « On ne t'a pas bien entendu parler — vérifie que le micro est bien orienté » | **2 seulement** |
| V4 — hauteur aberrante | « On n'arrive pas à lire ta voix — vérifie le micro sélectionné » | 2 |
| Écrêtage détecté | « Ton micro sature : baisse son volume d'entrée dans les réglages de ton système » | 3, **après action du joueur** |

Règles de rédaction, valables pour toutes :

- **Aucun vocabulaire technique** — ni dB, ni écart dynamique, ni F0.
- **Orienté cause probable, jamais verdict sur la personne.** Le ton est celui d'un réglage
  matériel imparfait — micro, pièce — jamais celui d'une performance vocale insuffisante.
- **Ne jamais renvoyer au début** quand une seule étape est en cause.

> **Le cas de l'écrêtage est le seul qui exige une action hors du jeu.** C'est aussi le seul
> où ne rien dire aurait un coût durable : un micro qui sature aplatit tout le registre haut
> du joueur **pour toute la partie**, et il n'en saura jamais rien.

### La porte d'entrée en partie

Un joueur sans profil est bloqué, et ses amis l'attendent déjà. Le blocage doit se lire
comme **une étape restante, pas comme une exclusion** :

- Annoncer une durée courte et estimée, et enchaîner sur la calibration **en un seul geste**.
- Les autres joueurs du lobby voient un état explicite — *« X termine sa configuration »* —
  plutôt qu'un silence qui se lit comme un plantage.
- Tout le parcours reste opérable **au clavier et à la souris seuls**, sans exception.

### Le casque

Décidé le 2026-09-08 : **le casque avec micro est une condition d'entrée du jeu.** L'UI doit
le dire, et le dire **avant** que le joueur découvre que ça marche mal.

- Message **au premier lancement**, avant la calibration — pas enterré dans un menu d'options.
- Formulé comme un **prérequis matériel**, au même titre que la configuration minimale : ce
  n'est pas un conseil de confort.
- **Aucun blocage technique.** On ne peut pas détecter un casque de façon fiable, et tenter
  de le faire produirait des faux positifs qui empêcheraient des joueurs équipés de jouer.
  On informe, on n'interdit pas.

### La recalibration en cours de partie

> **Résolu le 2026-09-08 — il n'y a presque rien à faire.**
>
> La version d'origine de cette section décrivait un problème réel : un joueur recalibrant
> en portant un meuble à plusieurs, dont la sortie tombe à zéro pendant que ses coéquipiers
> subissent le changement de poids.
>
> **Ce cas n'existe pas.** La recalibration se lance depuis le menu, ouvrir le menu
> immobilise le personnage, et un personnage immobilisé **pose ce qu'il porte**. Il n'y a
> plus de porteur fantôme, plus de poids qui varie, et le monde est en pause pour lui.

Il reste une seule exigence, et elle est sociale : **les autres joueurs doivent comprendre
pourquoi leur coéquipier vient de poser sa moitié de canapé et de se figer.** Un état
lisible sur son avatar ou dans le bandeau d'équipe suffit — sans quoi le comportement se
confond avec une déconnexion ou un joueur parti manger.

### L'état `Degraded`

Il appartient au système 1, mais **c'est vers nous qu'il doit conduire**.

- **Toujours visible pendant `Degraded`** — dans le HUD, pas seulement dans un menu. Un
  sonomètre à zéro est indiscernable d'un joueur qui se tait.
- **Déclenché en moins d'une à deux secondes.** Au-delà, le joueur conclut au bug.
- **Accès immédiat au diagnostic** : choix du périphérique et relance de la calibration, en
  un geste depuis l'alerte.

> **Il n'existe aucune solution de repli.** La voix n'a pas d'équivalent clavier : la seule
> sortie de secours est de rétablir l'entrée micro, pas de la remplacer.

### Quand nos propres réglages invalident un profil

Les *Edge Cases* établissent qu'un profil valide à l'écriture peut devenir invalide quand
les seuils bougent, et qu'il faut donc **revalider à chaque chargement**. L'UI porte la
conséquence :

> **Le message doit endosser la responsabilité, pas la faire porter au joueur.** « Nos
> réglages ont changé, il faut refaire une mesure » — et surtout pas « ton profil est
> invalide », qui laisserait croire qu'il a mal fait quelque chose il y a trois semaines.

### Accessibilité

**Garanti** : opérabilité complète au clavier et à la souris sur tous les écrans, texte
redimensionnable, sous-titrage de toute instruction, aucun flash ni pic sonore surprise
pendant la calibration.

> ### L'exclusion est plus étroite qu'écrit à l'origine — révisé le 2026-09-08
>
> La version d'origine excluait trois populations : qui ne peut pas produire de voix, qui a
> un trouble de la parole, et **qui vit dans un environnement où parler fort est
> impossible**. La revue du 2026-09-07 demandait de rouvrir ce point une fois `LowRange`
> existant. Il existe.
>
> **La troisième population n'est plus exclue.** Un joueur qui ne peut pas crier — voisinage,
> enfant qui dort, timidité — obtient un profil `LowRange` : accepté, marqué, lissé, et
> jouable. C'est exactement ce que ce drapeau a été créé pour faire.
>
> **Ce qui reste exclu, et qui l'est franchement** : un joueur qui ne peut pas produire de
> voix du tout. Aucun mode clavier ne remplace l'entrée vocale sans redéfinir le pilier du
> jeu. C'est une exclusion assumée, pas un oubli — mais elle ne concerne plus qu'un cas au
> lieu de trois.

## Acceptance Criteria

[À écrire]

## Open Questions

[À écrire]
