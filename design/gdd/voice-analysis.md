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

### 1. `Loudness`

```
x        = clamp((Rms_dB − Floor_dB) / (Scream_dB − Floor_dB), 0, 1)
Loudness = x ^ γ
```

| Variable | Symbole | Type | Plage | Description |
|---|---|---|---|---|
| RMS lissé, en dB | `Rms_dB` | float | −∞ … 0 | Sortie de l'`EnvelopeFollower` |
| Plancher de bruit | `Floor_dB` | float | calibré | Profil joueur |
| Cri de référence | `Scream_dB` | float | calibré | Profil joueur |
| Exposant perceptif | `γ` | float | 0,5 … 1,0 · **PROVISOIRE 0,65** | Étire le registre bas |

**Sortie** : 0 à 1. Sous le plancher → 0. Au-dessus du cri → 1.

**Exemple** : `Floor = −50 dB`, `Scream = −10 dB`, `Rms = −30 dB`
→ `x = (−30 − (−50)) / (−10 − (−50)) = 0,5` → `Loudness = 0,5^0,65 ≈ 0,64`.

**Pourquoi `γ` et pas une interpolation linéaire en dB.** Le dB compresse déjà
l'amplitude, mais la sonie perçue croît de façon **convexe** avec le dB. Une
interpolation linéaire ferait correspondre `0,5` à mi-chemin de la *grandeur physique*,
pas de l'*effort ressenti* — et l'écart entre les deux est **maximal dans le registre
bas, celui du chuchotement**, qui est le registre central du jeu.

---

### 2. `Pitch`

```
Pitch = 12 · log2(F0_Hz / F0_habituel)
```

| Variable | Symbole | Type | Plage | Description |
|---|---|---|---|---|
| F0 après filtre médian | `F0_Hz` | float | médiane ± 1 octave | Sortie de l'étape 7 de la chaîne |
| Hauteur habituelle | `F0_habituel` | float | calibré | Médiane de repos du profil |

**Sortie** : **−12 à +12 demi-tons**. La plage n'est pas arbitraire — elle découle de la
4ᵉ défense contre l'erreur d'octave, qui resserre la recherche autour de la médiane du
joueur ± une octave. Hors calibration, l'analyse ne produit que du silence : aucune
`Pitch` n'existe.

**Exemples**, avec `F0_habituel = 120 Hz` :

| `F0_Hz` | `Pitch` |
|---|---|
| 240 | **+12** (une octave au-dessus) |
| 120 | **0** (sa voix normale) |
| 90 | **−4,98** |

**Aux extrêmes** : quand `Voiced` est faux, `VoiceFrame` force `Pitch` à 0. Un
consommateur qui lit `Pitch` sans vérifier `Voiced` lit une valeur qui n'a pas de sens.

---

### 3. `Continuity`

```
CrestDb    = 20 · log10(Peak / Rms)
Continuity = clamp(1 − (CrestDb − CrestMinDb) / (CrestMaxDb − CrestMinDb), 0, 1)
```

| Variable | Symbole | Type | Plage | Description |
|---|---|---|---|---|
| Crête, en dB | `CrestDb` | float | ≥ 0 | Dérivé de `RawLoudness.CrestFactor` |
| Borne son tenu | `CrestMinDb` | float | **PROVISOIRE 8** | Voyelle tenue humaine |
| Borne percussif | `CrestMaxDb` | float | **PROVISOIRE 20** | Claquement de langue |

**Sortie** : 0 à 1. **0 = percussif, 1 = régulier.**

**Exemple** : `Peak/Rms = 3` → `CrestDb = 20·log10(3) = 9,54`
→ `Continuity = 1 − (9,54 − 8)/(20 − 8) ≈ 0,87`.

> **⚠️ Cas limite obligatoire.** Si `Rms = 0`, la formule diverge : `log10(0)` tend vers
> −∞ et `Continuity` serait bornée à 1 — c'est-à-dire « parfaitement tenu » sur du
> **silence**. Garde explicite : **`Rms = 0` → `Continuity = 0`.** Sur du silence, il n'y
> a pas de forme à décrire. Le code existant renvoie déjà `CrestFactor = 0` dans ce cas ;
> la garde doit être portée aussi par la conversion.

**Pourquoi le domaine dB.** La crête a une distribution très asymétrique ; le dB la
linéarise. Les bornes initialement proposées — 1,4 et 6 en linéaire — étaient fausses
dans les deux sens : **1,4 suppose un sinus pur**, or le pouls glottique et les formants
montent la crête de toute voyelle humaine ; et **6 est trop bas** pour un transitoire de
5–20 ms noyé dans une fenêtre de 21 ms à moitié silencieuse.

---

### 4. Porte de voisement

```
Voiced    = IsVoiced_YIN
            AND (Rms_dB > Floor_dB + Margin_dB)
            AND (JitterPct > JitterMin)

JitterPct = 100 · écart-type(T_i) / moyenne(T_i)   sur les N dernières périodes acceptées
```

| Variable | Symbole | Type | Plage | Description |
|---|---|---|---|---|
| Périodicité YIN | `IsVoiced_YIN` | bool | | Apériodicité sous le seuil 0,15 |
| Marge au-dessus du plancher | `Margin_dB` | float | 6 … 8 · **PROVISOIRE 7** | |
| Jitter relatif de période | `JitterPct` | float | % | |
| Jitter minimal | `JitterMin` | float | **PROVISOIRE 0,5** | En dessous : trop stable pour une voix |
| Fenêtre du jitter | `N` | int | 3 … 5 · **PROVISOIRE 4** | |

**Sortie** : booléen.

**Exemples** :

| Source | `JitterPct` | Résultat |
|---|---|---|
| Ronflement de frigo à 100 Hz | ≈ 0,05 % | **non voisé, même fort** |
| Voyelle chantée tenue | 1 – 2 % | voisé |

**Amorçage** : tant que moins de `N` périodes sont disponibles, **le test de jitter passe
par défaut**. Le faire échouer coûterait ~80 ms de silence au début de chaque prise de
parole — soit précisément l'attaque, la partie la plus perceptible d'une voix. Rater
80 ms d'attaque est pire que laisser passer 80 ms de bourdonnement.

---

### ⚠️ Porte de mesure — ces valeurs ne sont pas validées

**Les cinq valeurs marquées PROVISOIRE sont des ordres de grandeur défendables, pas des
mesures.** Elles permettent d'implémenter et de tester ; **elles ne sont pas canon.**

**Protocole A — bornes de crête** *(≈ 3 minutes)*
Enregistrer : une voyelle tenue chuchotée, une voyelle tenue criée, dix claquements de
langue. Lire la crête réelle sur fenêtre de 21 ms.
→ Fixe `CrestMinDb` et `CrestMaxDb`.

**Protocole B — exposant perceptif** *(une courte session de test)*
Quatre ou cinq testeurs notent leur effort ressenti de 1 à 5, du chuchotement au cri ;
relever le `Rms_dB` correspondant. Caler `γ` pour que les paliers ressentis tombent à
intervalles réguliers sur l'échelle 0–1.
→ Fixe `γ`.

Tant que ces protocoles n'ont pas tourné, **aucune de ces valeurs ne doit être citée
ailleurs comme acquise**. Un critère d'acceptation le vérifie en section *Acceptance
Criteria*.

> **Coût de révision : quasi nul.** Tous ces paramètres passent par constructeur —
> rien n'est codé en dur dans le projet (ADR-0004).

## Edge Cases

Chaque entrée nomme la **condition exacte**, la **résolution exacte**, et sa sévérité :
**bloquant** (le système produit une valeur fausse sans le signaler), **dégradant** (valeur
médiocre mais honnête) ou **cosmétique**.

### Profil de calibration dégénéré

> Le profil **persiste sur disque**. Un profil dégénéré empoisonnerait toutes les sessions
> futures — la validation au commit n'est donc pas une précaution, c'est une nécessité.

- **Si l'écart `Scream_dB − Floor_dB` est inférieur à un minimum** *(PROVISOIRE ~20 dB, à
  fixer au Protocole A)* : le profil est **refusé au commit** ; la calibration redemande
  l'étape du cri. **Bloquant** — sans marge dynamique, `x` diverge et `Loudness` devient `NaN`.
- **Si `Floor_dB > Scream_dB`** — recalibration dans un environnement plus bruyant que le
  cri de référence : profil **refusé au commit**. **Bloquant, et c'est le cas le plus
  dangereux de ce document** : le dénominateur devient négatif, `x` s'inverse
  **silencieusement**, et parler plus fort fait *baisser* `Loudness`. Aucun `NaN`
  détectable — juste une valeur plausible et fausse.
- **Si `F0_habituel = 0`** — aucune période voisée captée pendant la calibration : profil
  **refusé au commit**. **Bloquant** — `Pitch` divergerait vers l'infini.
- **Si un profil invalide arrive malgré tout** — chargé du disque, reçu du réseau,
  corrompu : l'analyse **reste `Uncalibrated`** et renvoie `VoiceFrame.Silence`. Elle
  **n'invente jamais** de valeur de remplacement : un plancher artificiel masquerait un
  vrai problème derrière un nombre inventé.

### Extrêmes du profil vocal

- **Si `médiane / 2 < 70 Hz`** — voix très grave : la plage de recherche est recadrée à
  `[70 Hz, médiane × 2]`. **Dégradant si non traité** — chercher sous 70 Hz augmente le
  risque que YIN accroche une sous-harmonique.
- **Si `médiane × 2 > 600 Hz`** — voix aiguë : **la cadence de décimation passe à 12 kHz
  pour ce joueur**, ce qui repousse la limite de résolution vers ~900 Hz.
  **Bloquant si non traité** : le cri de ces joueurs tomberait hors de la plage de
  recherche calibrée, et `IsVoiced` serait faux en permanence **pendant les cris**. C'est
  un défaut d'équité qui touche disproportionnellement les voix aiguës et les enfants,
  dans un jeu dont la mécanique centrale est de crier.
  *(La réponse était déjà nommée par ADR-0004 : « la bonne réponse est de monter la
  cadence décimée à 12 kHz, pas d'élargir la plage de décalages ».)*
- **Si `médiane × 2 > 900 Hz` même à 12 kHz** : la plage est clampée et la perte
  documentée. **Dégradant.** Cas extrême, à surveiller en playtest.

> **Conséquence d'implémentation.** La cadence de décimation dépendant du profil, le
> `Decimator` et le `PitchDetector` doivent être **reconstruits à la réception du profil**,
> pas à la construction de l'analyseur.

### Transitions d'état

- **Si une recalibration est lancée pendant que le joueur porte un meuble** : le nouveau
  profil est construit **dans un tampon** et ne remplace l'ancien qu'à validation complète.
  La bascule est **atomique**. **Bloquant si non traité** — le poids perçu du meuble
  changerait en pleine manipulation.
- **Si un profil est reçu ou mis à jour pendant `Degraded`** : le profil est mis à jour,
  mais **l'état reste `Degraded`**. **Dégradant si non distingué** — recevoir un profil
  valide ne signifie pas que la capture est revenue.
- **Si le micro coupe pendant une étape de calibration** : l'étape en cours est
  **annulée**, aucun profil partiel n'est committé. **Bloquant si non traité** — on
  retomberait exactement dans les cas dégénérés ci-dessus, par exemple `Scream_dB` resté à
  zéro parce que l'étape du cri n'a jamais eu lieu.

### Saturation du signal

- **Si `Peak` atteint le seuil d'écrêtage sur plusieurs échantillons consécutifs** :
  `Continuity` **conserve sa valeur précédente** au lieu d'être recalculée.
  **Bloquant si non traité** : `CrestDb` s'effondre sur un signal écrêté et `Continuity`
  monterait vers 1 — le système rapporterait « voix parfaitement tenue » sur un signal
  distordu, sans aucune alerte. On ne connaît plus la forme du signal, donc **on ne
  modifie pas ce qu'on en affirme**.
- **`Loudness` n'est pas affectée** par l'écrêtage : il implique un signal fort, et la
  valeur est déjà bornée à 1.

### Amorçage et silence prolongé

- **Si l'anneau médian contient moins de 5 valeurs** : la médiane porte sur les valeurs
  disponibles. L'anneau est de **taille impaire (5), délibérément** — la médiane est
  toujours un élément, jamais une moyenne de deux, ce qui la rend testable sans ambiguïté.
- **Si une trame est non voisée** : le `F0` rejeté **n'entre pas** dans l'anneau, qui gèle.
- **Si l'anneau reste figé au-delà d'un délai sans voisement** : il est **vidé**.
  **Dégradant si non traité** — une reprise de parole après trente secondes de silence se
  lisserait contre une hauteur périmée.
- **Si l'enveloppe descend sous un plancher de dénormalisation** : elle est **forcée à
  zéro**. **Dégradant (performance)** — sa décroissance est asymptotique et n'atteint
  jamais zéro exactement, ce qui expose à un blocage CPU par arithmétique dénormalisée.

### Contrat d'usage — hors de `Voice.Core`

- **Si un consommateur compare deux `Tick`** : il doit employer une **différence
  modulaire**, jamais `>`. **Cosmétique en session, bloquant à long terme** — un `uint`
  incrémenté ~50 fois par seconde déborde après **~994 jours**. Sans objet sur une partie,
  mais un process de longue durée l'atteindrait et la comparaison directe casserait en
  silence.

### Décision documentée — pas de `JitterMax`

Le test de jitter n'a qu'un **plancher**. Un jitter anormalement élevé — voix rauque,
éraillée — franchit donc la porte.

**C'est délibéré.** La rugosité vocale varie d'une personne à l'autre, et la plafonner
reproduirait exactement le défaut d'équité identifié sur les voix aiguës. Absence de
plafond **par décision, pas par oubli**.

## Dependencies

### Deux notions à ne pas confondre

L'index des systèmes déclare que ce système **ne dépend de rien**. C'est vrai — et
pourtant l'analyse ne produit **rien du tout** sans le profil de calibration. Les deux
affirmations sont compatibles parce qu'il s'agit de deux dépendances différentes :

- **Dépendance de conception** — on ne peut pas *spécifier* ce système tant que l'autre
  n'est pas spécifié.
- **Dépendance d'exécution** — le système ne *produit rien* sans l'autre, une fois en marche.

Les confondre fabrique des cycles fantômes. Ce document a été écrit de bout en bout sans
qu'aucun système voisin n'ait de GDD : la dépendance de conception est donc bien nulle,
comme l'index l'affirme.

### Le tableau

| Système | Nature | Sens | Interface |
|---|---|---|---|
| **6. Calibration vocale** | **DURE — exécution** | mutuelle | Fournit `VoiceProfile`. **Sans profil valide, la sortie est `Silence`** : le système ne fait littéralement rien |
| **2. Audio d'entrée** | **DURE — exécution** | il appelle | Pousse les échantillons bruts post-AEC à cadence fixe ; reçoit la `VoiceFrame` |
| 3. Propagation du son | consommateur | il lit | `VoiceFrame` par joueur, à la cadence réseau |
| 12. Couche de retour local | consommateur | il lit | `VoiceFrame` **locale, avant réseau** |
| 5. Réseau | consommateur | il lit | `VoiceFrame` ; décide l'échantillonnage 50 Hz → 20–30 Hz |
| 19. UI diégétique | consommateur | il lit | `Loudness` pour le sonomètre — **ce qu'on émet, jamais ce que ça provoque** |

**Une seule dépendance dure, et c'est la calibration.** Tout le reste consomme.

### Les deux cycles apparents, et pourquoi ce n'en sont pas

**Analyse ↔ Audio d'entrée.** L'index dit que 2 dépend de 1 ; à l'exécution, 1 ne peut
rien faire sans que 2 le nourrisse. *Résolution* : `SUAC.Voice.Capture` référence
`SUAC.Voice.Core` à la compilation, mais l'analyse se **spécifie** sans que la capture le
soit — il suffit d'exiger « des échantillons à cadence fixe ». C'est un flux de données,
pas une dépendance de conception.

**Analyse ↔ Calibration.** L'index dit que 6 dépend de 1 et 2 ; l'analyse ne produit rien
sans le profil de 6. *Résolution* : les deux vivent **dans la même assembly** (ADR-0006)
et consomment les mêmes primitives internes. Ce n'est pas un cycle entre modules, c'est
une collaboration interne.

### Ce que les GDD voisins devront porter

Aucun système voisin n'a de GDD à ce jour. Les règles du projet exigent une **cohérence
bidirectionnelle** — voici donc les contrats à reporter le jour où ils s'écriront.

**Système 2 — Audio d'entrée**
- Pousser les échantillons à **cadence fixe et connue** (~50 Hz). Une cadence variable
  casse le lissage **en silence**.
- Livrer le signal **brut** : post-AEC uniquement, jamais de VAD, d'AGC ni de suppression
  de bruit.
- **Posséder le périphérique** et le fourcher — jamais un second lecteur.
- Signaler les événements de périphérique (coupure, changement) pour que l'analyse bascule
  en `Degraded`.

**Système 6 — Calibration vocale**
- Produire `VoiceProfile` : `Floor_dB`, repos, `F0_habituel`, `Scream_dB`.
- **Valider avant de committer** — refuser les trois profils dégénérés listés en *Edge Cases*.
- **Persister le profil entre les sessions.** *(Ce besoin de persistance était signalé
  comme sans propriétaire dans l'index des systèmes — il revient ici.)*
- Être **relançable à tout moment**, depuis le lobby comme en jeu.
- Basculer **atomiquement** : nouveau profil en tampon jusqu'à validation complète.
- Annuler proprement une étape si le micro coupe en cours de calibration.
- **Décider la cadence de décimation** à partir du profil — 12 kHz pour les voix aiguës.

**Système 5 — Réseau**
- Décider l'échantillonnage 50 Hz → 20–30 Hz. Ce n'est pas à Core de le faire.
- Comparer les `Tick` par **différence modulaire**, jamais par `>`.

**Système 12 — Couche de retour local**
- Consommer la `VoiceFrame` **locale, avant réseau** — même instance et même trame que le
  réseau. Pas de calcul dupliqué.

**Système 19 — UI diégétique**
- Le sonomètre lit `Loudness` — **ce que le joueur émet, jamais ce que ça provoque**.

## Tuning Knobs

### L'arbitrage à exposer avant tous les autres

La section *Player Fantasy* a nommé une tension qui gouverne tout ce réglage :

> **L'attribution veut de la stabilité, le contrôle veut de la réactivité.**

Lisser davantage supprime l'injustice — et supprime la vivacité avec elle. Ces curseurs ne
doivent pas figer un compromis implicite : **ils doivent rendre l'arbitrage visible et
réglable.**

### Les curseurs

| Curseur | Provisoire | Plage sûre | Trop haut | Trop bas |
|---|---|---|---|---|
| `γ` exposant perceptif | **0,65** | 0,5 – 1,0 | vers 1,0 : le chuchotement s'écrase, tout le registre bas devient indistinct | < 0,5 : le moindre souffle sature vers 1, plus de nuance dans les forts |
| `CrestMinDb` | **8** | 6 – 12 | une voyelle tenue cesse d'être lue comme régulière | tout devient « tenu », les percussifs disparaissent |
| `CrestMaxDb` | **20** | 15 – 26 | un claquement de langue ne descend jamais à 0 | tout son un peu dynamique est lu comme percussif |
| `Margin_dB` — porte de volume | **7** | 6 – 8 | le chuchotement chanté est coupé : un registre central du jeu disparaît | le bruit de fond franchit la porte |
| `JitterMin` | **0,5 %** | 0,3 – 1,0 | une voix très stable, tenue et posée, est rejetée comme un bourdonnement | un ronflement de frigo passe pour une voix |
| `N` — fenêtre de jitter | **4** | 3 – 5 | réaction plus lente à un changement de source | variance trop bruitée pour discriminer |
| Attaque de l'enveloppe | *à mesurer* | — | le cri met du temps à se voir : le joueur ne sent plus sa voix comme un geste | le poids du meuble vibre sur chaque syllabe |
| Relâchement de l'enveloppe | *à mesurer* | — | le meuble reste lourd longtemps après le cri | clignotement lourd/léger entre deux mots |
| Taille de l'anneau médian | **5** | 3, 5, 7 — **impair obligatoire** | latence de réaction à un vrai changement de hauteur | erreurs d'octave non filtrées |
| TTL de l'anneau | *à définir* | — | reprise de parole lissée contre une hauteur périmée | anneau vidé trop souvent, filtre médian inopérant |
| Écart dynamique minimal du profil | **~20 dB** | — | des joueurs légitimes voient leur calibration refusée | des profils dégénérés passent la validation |
| Cadence de décimation | **8 kHz** ; 12 kHz si voix aiguë | — | coût CPU inutile sur YIN | le cri des voix aiguës sort de la plage de recherche |

### Les interactions — tourner un curseur peut en annuler un autre

**`Margin_dB` contre `JitterMin`.** Ce sont deux filtres du même problème par des chemins
différents. Monter la marge en dB assez haut rend le test de jitter inutile : le
bourdonnement est coupé avant d'être analysé. Mais on coupe le chuchotement chanté avec.
**Le jitter existe précisément pour permettre de garder la marge basse.** Régler l'un sans
regarder l'autre revient à en désactiver un des deux.

**Attaque de l'enveloppe contre `N`.** Les deux ajoutent de la latence, sur des axes
différents — l'une sur le volume, l'autre sur le voisement. Additionnées sans qu'on le
voie, elles produisent un système qui répond mollement **sans qu'aucun curseur ne paraisse
fautif**.

**`γ` contre `Margin_dB`.** `γ` étire le registre bas ; la marge de la porte le coupe par
le bas. Étirer une zone qu'on vient de tronquer ne sert à rien. **Ces deux-là se règlent
ensemble ou pas du tout.**

**`CrestMinDb` contre l'écrêtage.** L'écrêtage gèle `Continuity` ; plus la borne basse est
haute, plus la zone gelée devient fréquente **sur les cris**, là où le signal sature le plus.

### Ce qui n'est pas un curseur

Trois valeurs ressemblent à des réglages et n'en sont pas :

- **La cadence de la chaîne (~50 Hz)** — c'est un **contrat**, pas un curseur. La modifier
  casse le lissage de l'`EnvelopeFollower` en silence.
- **La parité de l'anneau médian** — impaire obligatoire, pour que la médiane soit toujours
  un élément et jamais une moyenne de deux. Sans ça, la définition devient ambiguë et le
  test avec.
- **Le seuil d'apériodicité de YIN (0,15)** — fixé par la littérature et arbitré en
  ADR-0004. Le toucher, c'est rouvrir un ADR.

> **Sur les constantes de temps de l'enveloppe.** Elles sont laissées *à mesurer* plutôt
> qu'inventées : elles gouvernent directement le ressenti « ma voix est un geste » et se
> règlent à l'oreille, pas au raisonnement. Le POC audio ou le prototype les donnera en une
> session.

## Visual/Audio Requirements

Ce système ne produit ni image ni son. Il transforme un micro en quatre nombres. Ses
exigences existent pourtant dans les deux domaines, et elles vont en sens inverse : côté
audio, ce sont des **interdits sur le trajet du signal** ; côté visuel, c'est ce que le
joueur doit **voir de sa propre mesure** pour que la promesse d'attribution tienne.

### Les interdits sur le trajet du signal

Tout traitement situé en aval de la fourche AEC (ADR-0003) reste sur la branche **chat
vocal**. Aucun ne doit toucher la branche d'analyse.

| Traitement interdit | Casse | Pourquoi |
|---|---|---|
| **AGC** — contrôle automatique de gain | `Loudness` | Il égalise chuchotement et cri au même niveau de sortie. C'est exactement la grandeur que `Loudness` mesure |
| **Suppression de bruit** (type RNNoise) | `Continuity`, le chuchotement | Elle écrase le rapport crête/RMS. Et un vrai chuchotement — apériodique, proche du plancher — ressemble à du bruit : il est supprimé au lieu d'être mesuré |
| **VAD tiers** — détecteur de voix du chat | `Voiced` | Il crée une seconde porte de voisement concurrente de la porte interne. Deux vérités sur « est-ce que je parle », dont l'une peut tronquer l'attaque que l'autre mesure |
| **Compression / limiting** | `Continuity`, `Loudness` | Ils écrasent directement le rapport crête/RMS et l'écart plancher–cri sur lesquels les formules reposent |

**Aucun de ces quatre ne lève d'erreur.** Chacun détruit une valeur en silence — c'est ce
qui les rend dangereux, et c'est pourquoi ils sont listés comme interdits plutôt que comme
préférences.

### Sidetone — le joueur doit-il s'entendre ?

**Non.** Le jeu n'injecte pas de retour de la voix du joueur sur le trajet d'analyse.

La raison n'est pas le coût, elle est l'attribution. Un sidetone donnerait au joueur une
**seconde référence de sa propre voix, à une latence différente de celle sur laquelle le
jeu agit**. Deux retours désaccordés du même geste, c'est précisément la confusion que ce
système existe pour éviter.

> **Le coût est réel et assumé** : en casque fermé, le joueur perd le retour acoustique
> naturel de sa voix. Ce manque est porté par le visuel — le sonomètre — et non par l'audio.
> Noter que le sonomètre n'est pas instantané non plus : il lit `Loudness`, donc une valeur
> déjà passée par l'enveloppe. Sa latence est celle du jeu, ce qui est le point.

### `Degraded` est muet, et c'est un défaut d'attribution

`Loudness = 0` parce que le micro est coupé et `Loudness = 0` parce que le joueur se tait
sont **indiscernables**. Le joueur parle, rien ne bouge, et il accuse le jeu — l'échec
d'attribution que *Player Fantasy* interdit nommément.

- Le signalement se déclenche **sans lissage**, dès l'événement du système 2. C'est un
  drapeau d'état, pas une mesure : contrairement à l'enveloppe, il n'a aucune raison de
  traîner.
- Le sonomètre doit afficher un état **visuellement distinct de « je me tais »**. Un
  sonomètre à zéro ne suffit pas : c'est exactement l'ambiguïté à lever.
- Une alerte sonore non diégétique discrète est **recommandée en complément**, à arbitrer
  avec le `sound-designer` et l'UI. Ce n'est pas une exigence audio à elle seule.

### Ce que le joueur doit voir de sa mesure

Les quatre valeurs ne méritent pas le même traitement.

| Valeur | Retour | Raison |
|---|---|---|
| `Loudness` | **Permanent** — le sonomètre du système 19 | Seule valeur dont l'attribution dépend en continu |
| `Continuity` | **Contextuel** — sur les objets qui l'exigent | Un affichage permanent dupliquerait le sonomètre pour une information secondaire |
| `Pitch` | **Contextuel** — sur les mécaniques qui l'utilisent | Un affichage permanent en ferait un curseur qu'on regarde, ce qui contredit « la voix comme geste » |
| `Voiced` | **Aucun** | C'est une porte interne. L'exposer inviterait à surveiller une lampe plutôt qu'à écouter sa propre voix |

### Larsen et contamination croisée

**Garanti.** Chaque `VoiceFrame` n'analyse que la capture locale du joueur, après annulation
de ce que ses haut-parleurs émettent — c'est-à-dire la voix des autres. Aucun mixage
serveur, aucune capture d'un autre client n'entre jamais dans une chaîne d'analyse.

**Gratuit.** Le larsen est déjà couvert sans effort supplémentaire : un effet Larsen est
**quasi parfaitement périodique**, il tombe donc sous le test de jitter au même titre qu'un
ronflement électrique. La porte de voisement le rejette par construction.

**Non garanti, et il faut le dire.** Deux joueurs dans la même pièce : le micro de l'un
capte la voix de l'autre. **Aucun DSP ne sépare deux voix captées par le même micro** — ce
n'est pas un manque d'ingénierie, c'est le problème lui-même. Il n'y a pas de réponse à ce
stade. Il faut des données de playtest en configuration « même pièce » pour juger si cela
casse réellement l'attribution avant d'investir dans une atténuation. Casque recommandé
en attendant.

---

## UI Requirements

### Les écrans requis

- **Écran de calibration** — première utilisation, bloquant tant qu'il n'est pas validé
- **Accès à la calibration** depuis le menu du lobby **et** en surcouche en jeu, sans
  quitter la partie
- **Indicateur d'état vocal permanent** — `Uncalibrated` / `Calibrated` / `Degraded` —
  **distinct du sonomètre diégétique**
- **Sonomètre diégétique** (système 19) — inchangé : il ne montre que ce que le joueur émet
- **Écran de blocage** pour qui tente de rejoindre sans profil calibré

### Le parcours de calibration

Le vrai problème d'UX de ce jeu n'est pas technique : **il faut demander à quelqu'un de
crier dans son micro, et beaucoup de joueurs sont dans un salon avec d'autres gens.** La
calibration doit se présenter comme le réglage d'un instrument, jamais comme une épreuve à
réussir.

L'ordre des étapes fait tout le travail :

1. **D'abord la mesure au repos** — « parle normalement, comme si tu discutais ». Geste
   socialement neutre, qui donne `Floor_dB` et `F0_habituel`.
2. **Ensuite seulement la montée**, progressive, avec une jauge qui répond en temps réel.
   Le joueur pousse **à son rythme** jusqu'à un plateau détecté automatiquement — pas
   d'ordre frontal du type « crie le plus fort possible ».

Deux garanties non négociables :

- **Aucune diffusion vers le lobby pendant la calibration.** C'est un moment privé, même
  en multijoueur. *Contrat à reporter dans le GDD du chat vocal.*
- **L'étape forte se refait seule**, sans repasser par l'étape calme.

> **Couplage à surveiller.** La détection automatique de plateau et la validation du profil
> se contredisent si le plateau est reconnu trop tôt : l'écart `Scream_dB − Floor_dB`
> tombe sous les 20 dB et le profil est refusé — le joueur a coopéré et se fait rejeter.
> **Le seuil de détection du plateau doit être calé sur le seuil de validation, pas
> indépendamment.**

### Le refus de profil

Trois profils sont rejetés par validation. Un message technique est inacceptable ici.

- **Aucun vocabulaire technique** — ni dB, ni écart dynamique, ni F0.
- **Chaque cause a sa formulation**, orientée cause probable et non verdict sur la voix du
  joueur. Par exemple, pour un écart dynamique insuffisant : *« on n'arrive pas à
  distinguer ta voix calme de ta voix forte — essaie avec le micro plus proche »*.
- **L'échec ne renvoie jamais au début** : seule l'étape en cause est relancée.
- Le ton reste celui d'un **réglage technique imparfait** — micro, environnement — jamais
  celui d'une performance vocale insuffisante.

### La porte d'entrée en partie

Un joueur sans profil est bloqué, et ses amis l'attendent déjà. Le blocage doit se lire
comme **une étape restante, pas comme une exclusion** :

- Annoncer une durée courte et estimée (« ~2 min ») et enchaîner sur la calibration **en un
  seul geste**.
- Les autres joueurs du lobby voient un état explicite — *« X termine sa configuration »* —
  plutôt qu'un silence qui laisse croire à un plantage.
- Tout le parcours reste opérable **au clavier et à la souris seuls**, sans exception.

### L'état `Degraded`

Le sonomètre diégétique **ne peut pas porter ce signal** : à zéro, il est indiscernable
d'un joueur qui se tait. Il faut donc un indicateur non diégétique.

- **Toujours visible pendant `Degraded`** — dans le HUD, pas seulement dans un menu.
- **Déclenché en moins d'une à deux secondes** après la perte de signal. Au-delà, le joueur
  conclut au bug plutôt qu'au micro coupé.
- **Accès immédiat au diagnostic** — choix du périphérique, recalibration — sans quitter la
  partie.

> **Il n'existe aucune solution de repli.** La voix n'a pas d'équivalent clavier : la seule
> sortie de secours est de rétablir l'entrée micro, pas de la remplacer.

### La recalibration en cours de partie

La recalibration est autorisée à tout moment, y compris pendant qu'on porte un meuble à
plusieurs. Pendant ces quelques secondes, **la sortie du joueur tombe à zéro** et le poids
perçu par ses coéquipiers sur le même objet peut varier brutalement.

**Ni ce document ni l'UI ne peuvent trancher seuls** si l'objet doit être verrouillé,
lissé, ou laissé tel quel pendant cette fenêtre — c'est une décision de gameplay, traitée
en *Open Questions* (OQ-11).

Ce que l'UI doit garantir dans tous les cas : **tous les porteurs d'un même objet voient
un signal clair identifiant le coéquipier en recalibration.** Sans quoi le comportement
se confond avec un bug.

### Accessibilité

**Garanti** : opérabilité complète au clavier et à la souris sur tous les écrans de
calibration et de menu, texte redimensionnable, sous-titrage de toute instruction, aucun
flash ni pic sonore surprise pendant la calibration.

**Hors de portée, et écrit noir sur blanc plutôt que masqué** : un joueur qui ne peut pas
produire de voix — extinction, trouble de la parole, environnement où parler fort est
impossible — **ne peut pas jouer à la mécanique centrale telle qu'elle est définie**. Aucun
mode clavier ne remplace l'entrée vocale sans redéfinir le pilier du jeu. C'est une
exclusion assumée, pas un oubli.

## Acceptance Criteria

### Ce qu'un critère doit valoir ici

Un critère n'est acceptable que si **un testeur peut le vérifier sans avoir lu ce
document**. Chacun porte une étiquette qui dit ce qu'il coûte :

- **`[UNIT]`** — automatisable hors Unity, en millisecondes, sans micro ni scène.
  `SUAC.Voice.Core` ne référence pas `UnityEngine` : c'est ce qui rend cette colonne
  aussi large. **Ces critères sont bloquants.**
- **`[INTEG]`** — exige plusieurs systèmes assemblés, ou de la persistance. Bloquant.
- **`[HUMAIN]`** — exige une mesure ou un playtest. Consultatif, sauf mention contraire.

---

### A — Formules

| # | Critère | Type |
|---|---|---|
| AC-01 | GIVEN `Floor_dB = −50`, `Scream_dB = −10` WHEN `Rms_dB = −30` THEN `Loudness = 0,64` (± 0,005) | `[UNIT]` |
| AC-02 | GIVEN `Rms_dB = Floor_dB` THEN `Loudness = 0` ; GIVEN `Rms_dB ≥ Scream_dB` THEN `Loudness = 1` — jamais de dépassement des bornes | `[UNIT]` |
| AC-03 | GIVEN `F0_habituel = 120` WHEN `F0 = 240` THEN `Pitch = +12,0` ; WHEN `F0 = 90` THEN `Pitch = −4,98` (± 0,01) | `[UNIT]` |
| AC-04 | GIVEN `Peak / Rms = 3` THEN `CrestDb = 9,54` et `Continuity = 0,87` (± 0,005) | `[UNIT]` |
| AC-05 | GIVEN `Rms = 0` THEN `Continuity = 0` — sans division par zéro, sans NaN propagé dans la `VoiceFrame` | `[UNIT]` |
| AC-06 | GIVEN `CrestDb ≤ CrestMinDb` THEN `Continuity = 1` ; GIVEN `CrestDb ≥ CrestMaxDb` THEN `Continuity = 0` | `[UNIT]` |
| AC-07 | GIVEN n'importe quelle entrée finie THEN aucun champ de la `VoiceFrame` n'est NaN ni infini | `[UNIT]` |

### B — Porte de voisement

| # | Critère | Type |
|---|---|---|
| AC-08 | GIVEN les trois conditions vraies (YIN voisé, `Rms_dB > Floor_dB + Margin_dB`, `JitterPct > JitterMin`) THEN `Voiced = true` | `[UNIT]` |
| AC-09 | GIVEN l'une des trois conditions fausse THEN `Voiced = false` — **un test par condition**, les deux autres tenues vraies | `[UNIT]` |
| AC-10 | GIVEN moins de `N` périodes disponibles THEN le test de jitter **passe par défaut** et n'annule pas `Voiced` à lui seul | `[UNIT]` |
| AC-11 | GIVEN une série de périodes de variance ≈ 0,05 % à niveau fort (ronflement) THEN `Voiced = false` **malgré le niveau** | `[UNIT]` |

### C — Cadence, lissage, `Tick`

| # | Critère | Type |
|---|---|---|
| AC-12 | GIVEN une trame traitée THEN `Tick` s'incrémente d'exactement 1 — y compris quand la sortie est `Silence` | `[UNIT]` |
| AC-13 | GIVEN deux `Tick` A et B WHEN on les ordonne THEN la comparaison se fait par **différence modulaire sur `uint`** (`(int)(B − A) > 0`) et reste correcte au passage `uint.MaxValue → 0` | `[UNIT]` |
| AC-14 | GIVEN un échelon injecté à la cadence nominale THEN le temps de montée de l'`EnvelopeFollower` correspond à la constante déclarée (± 10 %) | `[UNIT]` |
| AC-15 | GIVEN une enveloppe descendue sous le plancher de dénormalisation THEN elle vaut exactement `0f` — pas un résidu `1e-40` | `[UNIT]` |
| AC-16 | GIVEN l'anneau médian **plein** WHEN un point aberrant isolé entre THEN il n'apparaît pas en sortie ; GIVEN un anneau de taille paire passé au constructeur THEN la construction **échoue** | `[UNIT]` |

### D — États et profil

| # | Critère | Type |
|---|---|---|
| AC-17 | GIVEN l'état `Uncalibrated` THEN chaque appel renvoie `VoiceFrame.Silence(tick)` **et `Tick` avance quand même** | `[UNIT]` |
| AC-18 | GIVEN `Calibrated` WHEN le micro se coupe ou change de périphérique THEN état `Degraded`, sortie `Silence`, `Tick` continue, **profil conservé intact** | `[UNIT]` |
| AC-19 | GIVEN un changement de périphérique THEN **aucune recalibration n'est déclenchée** et le profil reste valide | `[UNIT]` |
| AC-20 | GIVEN `Degraded` WHEN un nouveau profil valide est reçu THEN le profil est mis à jour **sans repasser `Calibrated`** | `[UNIT]` |
| AC-21 | GIVEN un joueur portant un meuble WHEN une recalibration aboutit THEN le basculement est **atomique** : aucune trame ne combine l'ancien `Floor_dB` avec le nouveau `Scream_dB` | `[UNIT]` |
| AC-22 | GIVEN un profil calibré en session 1 WHEN le joueur revient en session 2 THEN il rejoint une partie **sans recalibrer** | `[INTEG]` |
| AC-23 | GIVEN un joueur **sans profil calibré** WHEN il tente de rejoindre une partie THEN l'entrée est **refusée** jusqu'à création du profil | `[INTEG]` |
| AC-24 | GIVEN une partie en cours THEN la calibration est atteignable depuis les menus **lobby et en jeu** | `[INTEG]` |

### E — Validation du profil

| # | Critère | Type |
|---|---|---|
| AC-25 | GIVEN `Scream_dB − Floor_dB < 20 dB` THEN le commit du profil est **refusé** | `[UNIT]` |
| AC-26 | GIVEN `Floor_dB > Scream_dB` THEN le commit est **refusé** — c'est le cas le plus dangereux du système, il inverse `x` sans produire ni NaN ni erreur | `[UNIT]` |
| AC-27 | GIVEN `F0_habituel = 0` THEN le commit est **refusé** | `[UNIT]` |
| AC-28 | GIVEN un profil invalide transmis malgré tout à l'analyse THEN l'état **reste `Uncalibrated`** — aucune valeur substituée, aucun défaut inventé | `[UNIT]` |
| AC-29 | GIVEN le micro coupé pendant la calibration THEN l'étape est annulée et **aucun profil partiel** n'est écrit | `[UNIT]` |
| AC-30 | GIVEN `médiane / 2 < 70 Hz` THEN la plage de recherche devient `[70 ; médiane × 2]` | `[UNIT]` |
| AC-31 | GIVEN `médiane × 2 > 600 Hz` THEN la décimation de **ce joueur** passe à 12 kHz, ET un cri à `F0_habituel × 2` reste **voisé** — le critère d'équité des voix aiguës | `[UNIT]` |

### F — Robustesse du signal

| # | Critère | Type |
|---|---|---|
| AC-32 | GIVEN `Peak` saturé sur plusieurs échantillons consécutifs THEN `Continuity` **gèle sa dernière valeur** au lieu de suivre un `CrestDb` faussé | `[UNIT]` |
| AC-33 | GIVEN écrêtage THEN `Loudness` **n'est pas gelée** — elle est déjà bornée à 1 et un signal écrêté est fort | `[UNIT]` |
| AC-34 | GIVEN une trame non voisée THEN son `F0` **n'entre pas dans l'anneau**, et `Pitch` **conserve sa dernière valeur lissée** — il ne retombe pas à 0 | `[UNIT]` |
| AC-35 | GIVEN l'anneau figé au-delà du TTL sans voisement THEN il est **vidé** ; la reprise de parole ne se lisse pas contre une hauteur périmée | `[UNIT]` |

### G — Les ressentis, traduits

Chacun de ces critères tient une promesse nommée en *Player Fantasy*. Ils ont un versant
automatisable et un versant humain ; les deux sont listés.

| # | Critère | Type |
|---|---|---|
| AC-36 | **« Le jeu entend mon chuchotement, pas du silence. »** GIVEN un signal chuchoté au-dessus de `Floor_dB + Margin_dB` THEN `Loudness > 0` **même si `Voiced = false`** — le chuchotement phonétique est apériodique par nature, il ne doit pas pour autant produire du silence | `[UNIT]` |
| AC-37 | **« Même effort, même résultat. »** GIVEN deux profils synthétiques de plages et de `F0_habituel` différents WHEN chacun reçoit un `Rms_dB` occupant la **même position relative** dans sa plage THEN les deux `Loudness` coïncident à ± 0,01 | `[UNIT]` |
| AC-38 | GIVEN quatre à cinq testeurs notant leur effort ressenti de 1 à 5 THEN la courbe effort → `Loudness` est **monotone pour chaque testeur**, et les courbes ne se croisent pas d'un testeur à l'autre | `[HUMAIN]` — **bloquant avant de figer `γ`** |
| AC-39 | **« Un claquement n'est pas une note tenue. »** GIVEN dix claquements de langue et une voyelle tenue, même joueur, même niveau THEN l'écart de `Continuity` entre les deux familles est **d'au moins 0,4**, sans recouvrement | `[UNIT]` sur signaux enregistrés |
| AC-40 | **« Quand je me tais, rien ne bouge. »** GIVEN 30 s de bruit ambiant réel — clavier, ventilateur, respiration, conversation à côté — sous `Floor_dB` THEN `Voiced = false` sur **100 %** des trames | `[HUMAIN]` puis rejouable en `[UNIT]` |

> **Sur AC-40.** Une fois les trente secondes enregistrées, ce critère cesse d'être humain :
> le fichier devient une fixture et le test tourne en CI. C'est le modèle à suivre pour tout
> ce qui touche au signal — **mesurer une fois, rejouer toujours.**

### H — Budget

| # | Critère | Type |
|---|---|---|
| AC-41 | GIVEN 1 000 trames traitées THEN **aucune allocation managée** n'est observée sur la chaîne complète (`GC.GetAllocatedBytesForCurrentThread` identique avant/après) | `[UNIT]` |
| AC-42 | GIVEN la chaîne exécutée sur un profil de charge nominal THEN le coût **thread principal** reste sous 1 ms/frame | `[HUMAIN]` — profilage sur cible, pas en test headless |

### I — La porte de mesure

Six valeurs de ce document sont **provisoires** : `γ`, `Margin_dB`, `JitterMin`,
`CrestMinDb`, `CrestMaxDb`, l'écart dynamique minimal du profil. Deux protocoles les
valideront. Le risque n'est pas qu'elles soient fausses — c'est qu'elles **cessent
silencieusement d'être signalées comme provisoires** en se propageant dans le code et
dans les autres documents.

| # | Critère | Type |
|---|---|---|
| AC-43 | GIVEN le code de `Voice.Core` THEN chacune des six valeurs apparaît **en un seul endroit**, comme constante nommée — aucun littéral dupliqué ailleurs dans l'assembly | `[UNIT]` par inspection statique des sources |
| AC-44 | GIVEN un document de design citant l'une des six valeurs THEN il la marque **provisoire** ou renvoie ici — aucune ne peut être citée comme acquise avant que les deux protocoles aient tourné | `[HUMAIN]` — relecture, à la charge de `/design-review` |

---

### Ce que ces critères ne couvrent pas

Quatre trous subsistent, dont le premier est un **défaut de spécification** et non un
manque de test.

**1. La médiane pendant l'amorçage est ambiguë.** Ce document justifie la taille impaire
de l'anneau en disant que la médiane est alors « toujours un élément, jamais une moyenne
de deux, ce qui la rend testable sans ambiguïté ». Mais il précise aussi qu'avec moins de
cinq valeurs, « la médiane porte sur les valeurs disponibles » — donc parfois sur 2 ou 4.
**L'ambiguïté que la parité impaire devait supprimer revient exactement pendant
l'amorçage.** Il faut trancher : médiane de deux valeurs, c'est laquelle ? Sans réponse,
AC-16 ne couvre pas les premières trames de chaque prise de parole — et ce sont celles
que le joueur remarque le plus.

**2. La sortie de `Degraded` n'est pas spécifiée.** Ce document décrit l'entrée dans
l'état, jamais le retour. Le micro revient : est-ce automatique, ou faut-il une action
du joueur ? AC-18 couvre l'aller ; rien ne couvre le retour.

**3. Le TTL de l'anneau n'a pas de valeur.** AC-35 est écrit mais non exécutable tant que
le curseur reste « à définir ».

**4. Écrêtage et non-voisement simultanés.** Les deux gardes de gel portent sur des cibles
différentes — `Continuity` d'un côté, l'anneau `F0` de l'autre — donc elles ne devraient
pas entrer en conflit. Aucun critère ne le vérifie explicitement.

### Les trois cas difficiles

**L'équité d'effort.** Elle se scinde en deux. AC-37 teste l'équité **mathématique** de la
normalisation, et c'est un test unitaire honnête : deux profils, une position relative
identique, un résultat identique. Ce qu'il ne prouve pas, c'est que deux humains
produisant « le même effort ressenti » atteignent la même position relative — cela dépend
de la qualité du **protocole de calibration**, pas de l'arithmétique. D'où AC-38, qui reste
humain et qu'aucune astuce ne remplacera.

**La porte de mesure.** Un test unitaire ne voit pas au-delà de son assembly : il ne peut
pas vérifier « ailleurs dans le projet ». AC-43 fait ce qui est faisable — une inspection
statique des sources qui échoue si l'une des six valeurs est dupliquée hors de son fichier
de constantes. C'est un test de **discipline**, pas de comportement, et il doit être
documenté comme tel. Le reste (AC-44) est une relecture humaine.

**La cadence fixe.** Pas de bonne réponse en l'état, et il ne faut pas prétendre le
contraire. L'`EnvelopeFollower` dérive ses coefficients de l'`updateRateHz` passé au
constructeur, mais **rien ne vérifie que les appels arrivent réellement à ce rythme** :
une dérive casse le lissage sans lever d'exception, sans NaN, sans rien. Un test qui
affirmerait la casse ne servirait à rien — il documenterait le défaut au lieu de le
détecter.

> **La seule vraie garde est architecturale, pas un test.** Il faudrait que la chaîne
> reçoive un `deltaTime` explicite plutôt qu'une cadence implicite, et signale un écart au
> nominal au-delà d'une tolérance. **AC-14 ne devient un filet qu'après ce changement.**
> À traiter comme une décision technique à part entière, pas comme une ligne de test à
> écrire.

### Ce qui reste hors de portée d'une machine

- Le ressenti « quand j'échoue, je sais de quoi je suis coupable » — c'est de la
  compréhension du joueur ; elle se mesure en playtest et en questionnaire.
- La perception de l'effort équivalent entre deux vraies voix (AC-38).
- Les constantes de temps de l'enveloppe, laissées *à mesurer* : elles se règlent à
  l'oreille.
- La latence perçue bout en bout — analyse, réseau, physique, rendu — qui ne se mesure
  pas sur `Voice.Core` seul.

## Open Questions

### Comment lire cette section

Une question ouverte n'a pas le même poids selon ce qu'elle empêche. Trois catégories, et
c'est l'ordre dans lequel il faut les traiter :

- **Bloque le code** — on ne peut pas écrire le `VoiceAnalyzer` sans trancher. Trois
  questions.
- **Bloque le réglage** — le code s'écrit, mais les valeurs restent des paris. Trois
  questions, toutes résolubles par la mesure.
- **Appartient ailleurs** — la réponse existera dans un autre GDD ; elle est listée ici
  pour ne pas se perdre entre deux documents. Trois questions.

Une quatrième catégorie, à part : **deux risques non levés**, dont le premier peut faire
pivoter l'architecture entière et dont aucun ne se résout par le raisonnement.

---

### Bloque le code

#### OQ-1 — La médiane de l'anneau pendant l'amorçage

**Le défaut.** Ce document justifie la taille impaire de l'anneau (5) en disant que la
médiane est « toujours un élément, jamais une moyenne de deux, ce qui la rend testable sans
ambiguïté ». Il précise aussi qu'avec moins de cinq valeurs, « la médiane porte sur les
valeurs disponibles » — donc parfois sur 2 ou 4. **L'ambiguïté que la parité impaire devait
supprimer revient exactement pendant l'amorçage** : les premières trames de chaque prise de
parole, celles que le joueur remarque le plus.

Trois issues :

| Option | Conséquence |
|---|---|
| **A — convention explicite** : sur un nombre pair, prendre l'élément **bas** des deux centraux | Le filtre tourne dès la deuxième trame. Biais systématique vers le grave à chaque attaque de voix, faible mais réel |
| **B — pas de lissage tant que l'anneau n'est pas plein** : `Pitch` passe brut | Aucun biais, aucune ambiguïté. Les erreurs d'octave de YIN ne sont pas filtrées pendant ~100 ms au début de chaque phrase |
| **C — n'émettre `Pitch` qu'une fois l'anneau plein** | Le plus propre à tester, le pire à jouer : la hauteur arrive en retard sur le volume, et le joueur sent un décalage entre deux composantes du même geste |

> **Recommandation : A.** Le biais est d'une valeur d'anneau, sur deux trames, et il est
> *déterministe* — donc testable et documentable. B laisse passer précisément les erreurs
> d'octave, qui sont le mode d'échec le plus visible de YIN, et au pire moment. C introduit
> une désynchronisation entre `Loudness` et `Pitch` qui heurte le ressenti « ma voix est un
> geste ».

#### OQ-2 — La sortie de `Degraded` n'est pas spécifiée

Ce document décrit l'entrée dans l'état — micro coupé, périphérique changé — et jamais le
retour. Le micro revient : est-ce automatique, ou faut-il une action du joueur ?

L'enjeu n'est pas technique, il est d'attribution. Un retour automatique silencieux
rend le système intermittent sans que le joueur sache pourquoi il l'était. Une action
explicite coûte une friction, mais elle *nomme* l'incident.

**Le volet UI de ce document a répondu à la moitié de la question** : indicateur non
diégétique dans le HUD, déclenché en moins de deux secondes, avec accès immédiat au
diagnostic. Ce qui reste ouvert est la machine à états elle-même — le retour en
`Calibrated` se fait-il tout seul dès que les échantillons reviennent, ou exige-t-il que
le joueur valide ? *Réponse attendue du GDD du système 6.*

#### OQ-3 — Cadence implicite ou `deltaTime` explicite

**C'est la question la plus importante des trois.** L'`EnvelopeFollower` dérive ses
coefficients de l'`updateRateHz` reçu au constructeur, mais **rien ne vérifie que les
appels arrivent réellement à ce rythme**. Une dérive casse le lissage sans exception, sans
NaN, sans trace — le seul symptôme est un jeu qui répond mal, et personne ne remonte de là
jusqu'à la cause.

Deux formes possibles :

- **Garder la cadence implicite** et en faire un contrat écrit, tenu par le système 2.
  Coût zéro, garantie zéro.
- **Passer un `deltaTime` explicite** à chaque trame, recalculer les coefficients ou
  signaler l'écart au nominal au-delà d'une tolérance. Coût réel — cela touche la signature
  publique et le seul type à état de l'assembly.

> **Ceci mérite un ADR, pas une ligne de test.** Tant qu'il n'est pas tranché, le critère
> AC-14 vérifie que le lissage est correct *quand la cadence est correcte* — il ne détecte
> rien du cas qui nous inquiète.

---

### Bloque le réglage

#### OQ-4 — Les six valeurs provisoires

`γ`, `Margin_dB`, `JitterMin`, `CrestMinDb`, `CrestMaxDb`, l'écart dynamique minimal du
profil. Aucune n'est mesurée. Les deux protocoles décrits en *Edge Cases* les donnent en
une session d'enregistrement et une session de playtest. **Rien d'autre dans le projet ne
doit les citer comme acquises avant** — c'est l'objet des critères AC-43 et AC-44.

#### OQ-5 — Les constantes de temps de l'enveloppe

Attaque et relâchement, laissées *à mesurer* plutôt qu'inventées. Elles gouvernent
directement le ressenti « ma voix est un geste » et se règlent à l'oreille, pas au
raisonnement. Le POC audio les donnera.

#### OQ-6 — Le TTL de l'anneau

Sans valeur. Le critère AC-35 est écrit mais non exécutable tant qu'elle manque. Ce n'est
pas un réglage de confort : trop long, une reprise de parole se lisse contre une hauteur
périmée ; trop court, l'anneau se vide entre deux mots et le filtre médian ne sert plus à
rien.

---

### Le risque non levé

#### OQ-7 — Le micro peut-il vraiment être partagé ?

Toute l'architecture repose sur une hypothèse non vérifiée : **le système 2 possède le
périphérique et le fourche** — une branche vers l'analyse, une branche vers le chat vocal —
avec l'AEC en amont de la fourche. Personne n'a testé que c'est faisable sur la cible, avec
la pile audio de Windows, le client Steam et les périphériques réels des joueurs.

Si le partage s'avère impossible ou instable, ce n'est pas un correctif : **c'est un
pivot de conception.** Il faudrait alors choisir entre la voix comme contrôleur et la voix
comme chat, ou reconstruire tout le trajet.

> **Ce test se mène en une demi-journée et n'exige aucun des GDD restants.** Il n'a pas
> besoin d'attendre le POC complet, et il devrait le précéder : c'est la seule question du
> document dont une mauvaise réponse invaliderait le reste.

#### OQ-8 — Deux joueurs dans la même pièce

Le micro de l'un capte la voix de l'autre, et **aucun DSP ne sépare deux voix captées par
le même micro**. Ce n'est pas un manque d'ingénierie : c'est le problème lui-même. Le jeu
étant coopératif et destiné à se jouer entre amis, la configuration « même canapé » n'est
pas marginale.

Il n'y a pas de réponse à ce stade, et il ne faut pas en inventer une. Ce qu'il faut, ce
sont **des données de playtest en configuration même-pièce** avant de décider si cela casse
réellement l'attribution — et donc avant d'investir dans une atténuation. Casque recommandé
en attendant, ce qui est une consigne, pas une solution.

---

### Appartient à un autre système

| # | Question | Propriétaire |
|---|---|---|
| OQ-9 | À quelle fréquence rééchantillonner la `VoiceFrame` pour le réseau — 50 Hz vers 20–30 Hz, et selon quelle règle de décimation ? | **Système 5 — Réseau.** Explicitement hors de `Voice.Core` |
| OQ-10 | Où et sous quel format persiste le `VoiceProfile` entre les sessions ? Local, cloud, lié au compte Steam ? | **Système 6 — Calibration.** Ce besoin était signalé **sans propriétaire** dans l'index des systèmes ; il en a un désormais |
| OQ-11 | Que vivent les coéquipiers pendant qu'un joueur recalibre en portant un meuble à plusieurs ? La bascule est atomique côté données — elle ne dit rien de ce que subit le groupe pendant les quelques secondes de mesure | **Systèmes 6 et 12.** Problème de coopération, pas de DSP |

> **OQ-11 est le seul de ce tableau qui puisse dégrader une partie en cours.** Autoriser la
> recalibration à tout moment était une décision de confort ; elle ouvre une fenêtre où un
> joueur cesse d'agir sur un objet que d'autres portent avec lui — l'objet devient-il plus
> lourd, se verrouille-t-il, ou ne se passe-t-il rien ? Le volet UI a tranché ce qu'il
> pouvait trancher seul : **tous les porteurs doivent voir qui recalibre**, pour ne pas
> confondre le comportement avec un bug. Le reste est une décision de gameplay, à prendre
> avant que la calibration ne s'implémente.

---

### État du code aujourd'hui

Pour mémoire, et parce que cela conditionne la suite : `SUAC.Voice.Core` contient les
primitives — mesure de niveau, décimation, YIN, enveloppe — et 41 tests verts. **Rien ne
produit encore de `VoiceFrame`** : le `VoiceAnalyzer` que ce document spécifie n'existe
pas, et la conversion du rapport crête/RMS vers `Continuity` est explicitement reportée
dans les commentaires du code. Ce document est donc bien une spécification à écrire, pas
une description de l'existant.

