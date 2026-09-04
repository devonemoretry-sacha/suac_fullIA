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

> **La chaîne tourne à cadence fixe et connue (~50 Hz).**
>
> Ce n'est pas une préférence. L'`EnvelopeFollower` convertit ses constantes de temps
> en coefficients à partir de la cadence d'appel — « monter en 50 ms n'exige pas le même
> pas selon qu'on l'appelle 50 ou 200 fois par seconde ». **Une cadence variable casse le
> lissage en silence** : l'attaque et le relâchement ne durent plus ce qu'ils annoncent,
> et rien ne le signale.

| # | Étape | État |
|---|-------|------|
| 1 | `Audio d'entrée` pousse les échantillons bruts (post-AEC). Deux fenêtres glissantes sur **le même flux** : ~21 ms pour le volume, ~46 ms pour la hauteur. Deux vues d'un même tampon, pas deux captures. | S |
| 2 | `LoudnessMeter.Measure(fenêtre 21 ms)` → `RawLoudness{Rms, Peak, CrestFactor}` | **P** |
| 3 | `Decimator` réduit la fenêtre 46 ms à 8 kHz. Tampons pré-alloués dans l'instance, **jamais partagés entre threads** | S |
| 4 | `PitchDetector.Detect(fenêtre décimée, plage)` → `RawPitch{F0Hz, Aperiodicity, IsVoiced}`. **La plage de recherche n'est pas fixe** : une fois le joueur calibré, elle se resserre autour de sa hauteur médiane ± une octave — 4ᵉ défense contre l'erreur d'octave. Non calibré : 70–600 Hz par défaut | S |
| 5 | `EnvelopeFollower.Process(Rms)` → RMS lissé. **Une fois par trame, à la cadence fixe** | S |
| 6 | **Porte de voisement** : périodique selon YIN **ET** RMS lissé au-dessus du plancher calibré + marge **ET** jitter de période au-dessus d'un minimum | **P** |
| 7 | **Filtre médian temporel** : anneau des 5 dernières F0 acceptées, on renvoie la médiane. 3ᵉ défense contre l'erreur d'octave | S |
| 8 | Normalisation du volume et de la hauteur contre le profil calibré — *voir Formulas* | **P** |
| 9 | Conversion crête/RMS → `Continuity` — *voir Formulas* | **P** |
| 10 | Assemblage de la `VoiceFrame`, `Tick++` monotone par instance | S |

**P** = fonction pure, sans état · **S** = porte ou touche à un état

#### Le test de jitter (étape 6)

YIN est **aveugle au volume par construction** : un résidu minuscule mais parfaitement
régulier est déclaré voisé. Un ronflement secteur ou un frigo produit des harmoniques
dans la plage 70–600 Hz et franchirait donc la seule condition de périodicité.

Une marge en dB au-dessus du plancher ne suffit pas : un bourdonnement **fort** la
franchirait aussi.

Mais un bourdonnement est **quasi parfaitement stable période à période**, là où une voix
ne l'est jamais — même tenue, même chantée. Exiger une **variance minimale de période**
sur les 3 à 5 dernières trames filtre ce cas **indépendamment du niveau**, et coûte
presque rien : ce sont des valeurs que YIN calcule déjà.

> **Note sur le chuchotement.** Le vrai chuchotement phonétique est *structurellement
> apériodique* — YIN le déclare non-voisé quelle que soit la porte. Celle-ci ne le pénalise
> donc pas. Le cas à surveiller est le chuchotement **chanté**, voix soufflée conservant un
> reste de périodicité à très bas niveau.

---

### States and Transitions

**L'état vit à deux niveaux.** Le **profil du joueur** persiste entre les sessions ; le
`VoiceAnalyzer` ne porte que l'état d'exécution d'une session.

États : `Uncalibrated → Calibrated ⇄ Degraded`

#### En `Uncalibrated`, la sortie est du silence

`GetFrame()` renvoie `VoiceFrame.Silence(tick)`, `Tick` s'incrémentant normalement.

**Raison** : sans plancher de bruit ni cri de référence, `Loudness` et `Pitch` seraient des
mesures brutes déguisées en valeurs normalisées. Cela violerait la frontière brut/normalisé
en substance, sinon en forme.

#### La calibration est une porte — sur le profil, pas sur la session

- Le joueur crée un **profil personnel** une fois, via le tutoriel : calibration obligatoire.
- Il rejoint ensuite n'importe quelle partie, **y compris en cours**, sans recalibrer.
- Sans profil calibré, il est **obligé d'en créer un avant de pouvoir rejoindre**.
- **La calibration reste accessible à tout moment** — menus du lobby et en jeu. Le joueur
  doit pouvoir en relancer une dès qu'il l'estime nécessaire, sans quitter sa partie.

**Deux avertissements à afficher au joueur :**

- Si **la personne au micro change**, un nouveau profil est nécessaire — un profil
  appartient à une voix, pas à une machine.
- Si **le périphérique change**, une recalibration est *conseillée* : le cri de référence
  a été mesuré sur le gain de l'ancien matériel.

#### Transitions

| Transition | Effet |
|---|---|
| `Uncalibrated → Calibrated` | Profil reçu. **Réinitialise** l'`EnvelopeFollower` et l'anneau médian — un lissage construit sur du bruit non calibré fausserait les premières trames |
| `Calibrated → Degraded` | Coupure micro ou changement de périphérique signalé par `Audio d'entrée`. Réinitialise enveloppe, anneau et tampons du `PitchDetector` (gain et bruit de fond diffèrent d'un périphérique à l'autre). **Conserve le profil** |
| `Degraded` | Renvoie `VoiceFrame.Silence`, mais **`Tick` continue d'avancer** — le réseau doit voir de la continuité, pas un trou |
| `Degraded → Calibrated` | Échantillons valides de retour ; l'état est déjà propre |
| Nouveau joueur | **Nouvelle instance** de `VoiceAnalyzer`, à l'état `Uncalibrated`. Jamais de remise à zéro en place : une instance neuve élimine toute une classe de bugs « oublié de réinitialiser » |

**Le changement de périphérique ne force jamais une recalibration.** Ces événements se
déclenchent souvent à tort, et éjecter un joueur en plein contrat serait le pire moment
possible.

---

### Interactions with Other Systems

| Voisin | Entre | Sort | Propriétaire de l'interface |
|---|---|---|---|
| **Audio d'entrée** (2) | échantillons bruts post-AEC, événements de périphérique | `VoiceFrame` | Audio d'entrée pilote la cadence ; l'analyse est passive |
| **Calibration vocale** (6) | échantillons pendant la session de calibration | `VoiceProfile` | **Vit dans `SUAC.Voice.Core`** — second consommateur des primitives pures |
| **Propagation du son** (3) | `VoiceFrame` par joueur, 20–30 Hz | rien vers Core | consomme uniquement |
| **Couche de retour local** (12) | `VoiceFrame` locale, **avant réseau** | rien | même instance et même trame que le réseau — pas de calcul dupliqué |
| **Réseau** (5) | `VoiceFrame` ; `Tick` sert à repérer les trous | — | le réseau décide de l'échantillonnage 50 Hz → 20–30 Hz, pas Core |

#### La circularité analyse ↔ calibration n'existe pas

Elle semblait poser problème : la sémantique de `VoiceFrame` dépend du profil, mais la
calibration a besoin de l'analyse pour mesurer — et la surface publique verrouillée à
`{ VoiceFrame }` interdirait à un consommateur externe de lire les primitives.

Deux ADR la résolvent déjà :

- **ADR-0006** place la calibration **dans `SUAC.Voice.Core`** (« contrat de données,
  analyse du signal, calibration »). Elle est donc un second consommateur des primitives
  internes, au même niveau que le `VoiceAnalyzer` — pas un appelant externe.
- **ADR-0004** prévoit déjà `VoiceProfile` comme **type public dont les valeurs mesurées
  restent internes**.

Seule conséquence : le test de surface publique passe de `{ VoiceFrame }` à
`{ VoiceFrame, VoiceProfile }`.

#### Persistance

Le profil survivant aux sessions, il crée un **besoin de persistance** que l'index des
systèmes signalait comme sans propriétaire. Il revient au **système 6 (Calibration
vocale)**, pas à ce système.

#### Datation fine des transitoires — différée

Une mécanique d'écholocation par claquements de langue exigerait une datation à 5–20 ms.
La cadence réseau de 20–30 Hz donne ±33 ms — et **même à cadence parfaite, la fenêtre RMS
de 21 ms étale déjà le transitoire** : descendre sous 10–15 ms exigerait un détecteur
d'attaque dédié, séparé du lissage principal.

**±33 ms suffit au périmètre MVP** : l'objet concerné appartient au mobilier explicitement
reporté.

La solution est consignée si le besoin revient : **un événement discret hors cadence**
(horodatage + amplitude, ~10–12 octets, soit ≈ 1 Ko/s à 8 joueurs) plutôt que de monter la
cadence globale, qui coûterait ≈ 8 Ko/s pour un besoin ponctuel.

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
