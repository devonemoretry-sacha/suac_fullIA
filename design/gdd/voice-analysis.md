# Analyse vocale

> **Status**: In Design — en révision après la re-revue du 2026-09-14 (verdict NEEDS REVISION),
> selon les décisions du propriétaire du 2026-09-15 ; premier document de la passe groupée
> **Author**: Sacha (devonemoretry-sacha) + Claude
> **Last Updated**: 2026-09-15
> **Enables Pillar**: Pilier 1 — « La Voice-Physics récompense le contrôle, pas le silence ».
> **Ce système n'implémente pas le Pilier 1 : il en garantit la précondition.** Le pilier
> appartient à l'effet voix → objets. Quiconque parcourt l'index des systèmes en cherchant
> la couverture du Pilier 1 ne doit pas s'arrêter ici.
> **System**: #1 dans `design/gdd/systems-index.md` · Foundation · MVP
> **Revue**: `design/gdd/reviews/voice-analysis-2026-09-14.md` (re-revue ; décisions en §6) ·
> précédente : `design/gdd/reviews/voice-analysis-2026-09-07.md`

> Titres de sections en anglais (lus par les skills), corps en français.
>
> **Portée** : ce document couvre la **chaîne complète**, de la fenêtre d'échantillons
> à la `VoiceFrame` normalisée. Les primitives de mesure sont implémentées et testées ; la
> conversion en dB, le `VoiceAnalyzer` et la normalisation ne le sont pas (*Open Questions*,
> « État du code aujourd'hui »). Le document sert donc à la fois de documentation
> de l'existant et de **spécification de ce qui reste à écrire**.

## Overview

L'analyse vocale est la couche qui transforme le son du microphone en une mesure
exploitable par le jeu. Elle reçoit des fenêtres d'échantillons d'environ 20 ms et en
produit une **`VoiceFrame`** : cinq valeurs décrivant la voix à cet instant — son
intensité, sa hauteur, sa texture, la présence ou non d'une vibration des cordes
vocales, et un numéro d'ordre.

Le joueur n'interagit jamais avec ce système. Il n'a ni écran, ni commande, ni réglage
visible en jeu. Mais **tout ce qui réagit à la voix lit une `VoiceFrame`, jamais une
mesure brute** : un meuble qui s'alourdit, un habitant qui tourne la tête, un objet qui
exige une note tenue. C'est le point de passage unique entre le micro et le gameplay. Un
seul nombre tiré du profil l'accompagne vers l'hôte : `r'`, la place de la voix posée du
joueur dans sa plage (*Formulas* §1, « Position, repos, et où chaque grandeur existe »).

Sa raison d'être tient en une contrainte : **les valeurs produites sont normalisées par
joueur.** Une position de 0,8 signifie « 80 % du chemin, en décibels, entre *sa* porte — le
point où le jeu commence à l'entendre, au-dessus du bruit de sa pièce — et le cri *de ce
joueur-là* », pas « 80 % de l'échelle du micro » ; `Loudness` en est la version perceptive
(*Formulas* §1). Une hauteur de +3 signifie « trois demi-tons au-dessus
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

- **Quand je chante doucement, le jeu m'entend ; quand je chuchote au-dessus de ma porte
  de voix, il entend un chuchotement.** Toute note que le jeu déclare voisée, même la plus
  douce, compte (*Formulas* §5 : `Voiced ⇒ Loudness > 0`). Plus bas, un chuchotement
  soufflé plus faible que la porte `Gate_dB` donne du silence : **sûr, mais invisible**.
  C'est le prix assumé pour que « quand je me tais » reste vrai (*Formulas* §1, « Pourquoi
  le zéro se place à `Gate_dB` »). Où tombe un vrai chuchotement par rapport à cette porte
  se mesure au prototype navigateur (B1, renvoi défini en tête de *Formulas*), et la suite
  est écrite pour les deux résultats possibles (même sous-section, déclencheur de scission).
- **Quand je fournis le même effort que mon coéquipier, on obtient le même résultat**,
  quels que soient nos timbres et nos micros.
- **Quand je claque la langue, le jeu ne le confond pas avec une note tenue.** Deux
  gestes vocaux différents produisent deux mesures différentes.
- **Quand je me tais, mon objet cesse de réagir.** Aucune entrée fantôme — ni bruit
  ambiant, ni clavier, ni souffle : tout ce qui reste sous ma porte pèse exactement 0
  (*Formulas* §1).

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
> C'est un axe de réglage, pas un problème à supprimer. Les *Tuning Knobs* l'exposent en
> tête (« L'arbitrage à exposer avant tous les autres ») plutôt que de figer un compromis
> implicite.

Formulation positive qui borde le risque : **la mesure doit rester assez rapide pour que
le joueur sente sa propre voix comme un geste, pas comme un curseur.**

### Portée future

Un troisième cadrage a été envisagé et écarté du MVP : le jeu écoute un **corps** —
souffle, tremblement, rire nerveux — et non une commande. Séduisant pour le Pilier 3, mais
il glisse vers « le jeu me punit pour ce que je ne contrôle pas », ce qui heurte le
Pilier 1. À rouvrir seulement si la maîtrise vocale s'avère trop facile en playtest.

**Ce cadrage n'entre plus par la bande.** Un zéro de `Loudness` posé au plancher calibré
laissait le souffle au-dessus du plancher peser sur l'objet : le jeu écoutait un peu le
corps sans l'avoir décidé. Le zéro est la porte `Gate_dB` (*Formulas* §1) : ce qui reste
sous la porte pèse exactement 0. Rouvrir ce cadrage serait donc un choix de conception, pas
la régularisation d'une fuite — et où tombe la respiration par rapport à la porte se
mesure (B1).

## Detailed Rules

### Core Rules

> **La chaîne reçoit, à chaque trame, l'intervalle réel écoulé : elle ne suppose aucune
> cadence.**
>
> `SUAC.Voice.Capture` fournit avec les échantillons un `AnalysisTiming { DeltaSeconds,
> SampleRate }` (ADR-0007:138–141, 169–170). Les constantes de temps — attaque,
> relâchement, fenêtre de jitter, TTL de l'anneau, fenêtre de gel — s'expriment en secondes
> et sont la référence ; cadence d'appel et fréquence d'échantillonnage ne sont que des
> données d'entrée (ADR-0007:146–158). **~50 Hz reste la cadence nominale que le système 2
> s'engage à pousser : ce contrat subsiste, mais l'analyse cesse d'en dépendre
> aveuglément** (ADR-0007:273).
>
> Ce n'est pas une préférence. Aucun mécanisme Unity ne fournit 50 Hz fixes (ADR-0007:10–11),
> et l'`EnvelopeFollower` convertit ses constantes de temps en coefficients : **un
> intervalle supposé casserait le lissage en silence** — l'attaque et le relâchement ne
> dureraient plus ce qu'ils annoncent, et rien ne le signalerait. Le coefficient se calcule
> donc sur l'intervalle mesuré (*Formulas* §1a, qui porte aussi l'état du code et sa
> migration). Un écart au nominal est **exposé** (AC-42b) ; un intervalle nul, négatif ou
> aberrant est **signalé, jamais substitué** (ADR-0007:176–180 ; AC-14d).

| # | Étape | État |
|---|-------|------|
| 1 | `Audio d'entrée` pousse les échantillons **bruts, sans traitement** — ni AEC, ni VAD, ni AGC, ni suppression de bruit (ADR-0003:5–11) —, avec leur `AnalysisTiming`. Deux fenêtres glissantes sur **le même flux** : ~21 ms pour le volume ; pour la hauteur, la fenêtre YIN plus le plus long décalage testé (`PitchDetector.cs:67`), soit ≈ 46 ms sur la plage non calibrée. Deux vues d'un même tampon, pas deux captures | S |
| 2 | `LoudnessMeter.Measure(fenêtre 21 ms)` → `RawLoudness{Rms, Peak, CrestFactor}`, en **linéaire** | **P** |
| 3 | **Conversion en dB** : `RawRms_dB = 20 · log10(max(Rms, 10^(MinDb/20)))`, bornée par `MinDb` avant le logarithme — *Formulas* §1. **N'existe pas encore dans le code** | **P** |
| 4 | `EnvelopeFollower.Process(RawRms_dB, Δt)` → `Rms_dB`, lissé **en dB**. Une fois par trame, sur l'intervalle mesuré, partie de `MinDb` — *Formulas* §1a, qui dit aussi ce que le code actuel n'a pas encore migré | S |
| 5 | `Decimator` réduit le tampon de hauteur à la cadence décimée (*Formulas*, « Décisions d'ADR-0004 ») ; un facteur non entier est refusé à la construction, jamais arrondi (ADR-0007:171–175), et la branche des voix aiguës n'existe que là où elle est réalisable (*Formulas* §5). Filtre et ligne à retard pré-alloués dans l'instance, **jamais partagés entre threads** | S |
| 6 | `PitchDetector.Detect(tampon décimé)` → `RawPitch{F0Hz, Aperiodicity, IsVoiced}`. **La plage de recherche n'est pas fixe** : fixée à la construction (`PitchDetector.cs:94`), elle se resserre, une fois le joueur calibré, à ± une octave autour de `F0_habituel`, recadrée en bas et plafonnée en haut (*Formulas* §5, ligne « `Pitch`, voisé ») — 4ᵉ défense contre l'erreur d'octave (ADR-0004:133). Non calibré, c'est-à-dire pendant la calibration : la plage par défaut d'ADR-0004. Un profil `Unavailable` n'a pas de plage recalibrée : la détection n'a rien à produire pour lui (*Formulas* §4) | S |
| 7 | **Porte de voisement** : périodique selon YIN **ET** `Rms_dB` au-dessus de `Gate_dB` — la même porte que le zéro de `Loudness`, lue sur le même `Rms_dB` de la même trame — **ET** jitter de période au-dessus d'un minimum. Porte complète pour un profil `Full` ; `NoJitter` et `Unavailable` suivent *Formulas* §4 | **P** |
| 8 | **Filtre médian temporel** : anneau des dernières F0 acceptées, de taille impaire et provisoire (*Formulas*, « Porte de mesure ») ; on renvoie la médiane. 3ᵉ défense contre l'erreur d'octave. Hors voisement, l'anneau gèle et `Pitch` vaut 0 (*Formulas* §2) | S |
| 9 | Normalisation : `Loudness` entre `Gate_dB` et `Scream_dB`, `Pitch` contre `F0_habituel` — *Formulas* §1 et §2 | **P** |
| 10 | Conversion crête/RMS → `Continuity` — *Formulas* §3 | **P** |
| 11 | Assemblage de la `VoiceFrame` ; `Tick` avance d'une unité par trame traitée, **cyclique** (*Formulas* §5, ligne `Tick`) | S |

**P** = fonction pure, sans état · **S** = porte ou touche à un état

#### Le test de jitter (étape 7)

YIN est **aveugle au volume par construction** (ADR-0004:107–108) : un résidu minuscule
mais parfaitement régulier est déclaré voisé. Un ronflement secteur ou un frigo produit des
harmoniques dans la plage de recherche et franchirait donc la seule condition de
périodicité.

La porte de sonie `Gate_dB` ne suffit pas : un bourdonnement **fort** la franchit aussi.

Mais un bourdonnement est **quasi parfaitement stable période à période**, et une voix
humaine, même tenue, ne l'est normalement pas. Exiger une **variabilité minimale de
période** sur la fenêtre `N` (*Formulas* §4) filtre ce cas **indépendamment du niveau**, et
coûte presque rien : le test réutilise les périodes que YIN estime déjà. **Qu'aucune voix
humaine ne tombe sous ce minimum n'est vérifié dans aucun sens** — note tenue d'une voix
entraînée, parole monotone : la session de mesure hors ligne le tranche (C9).

> **Note sur le chuchotement.** Le vrai chuchotement phonétique est *structurellement
> apériodique* — YIN le déclare non voisé quelle que soit la porte. Le test de jitter ne le
> pénalise donc pas. Ce qui le touche, c'est le zéro de `Loudness` : sous `Gate_dB`, il pèse
> exactement 0 — sûr, mais invisible ; au-dessus, il pèse sans être voisé (*Formulas* §1).
> Le cas à surveiller ici est le chuchotement **chanté**, voix soufflée conservant un reste
> de périodicité à très bas niveau.

**Aucun détecteur ne refuse seul un profil.** Ni ce test ni le seuil d'apériodicité de YIN
n'excluent un joueur du jeu : une voix qu'ils lisent mal est acceptée avec un `PitchStatus`
— `NoJitter` ou `Unavailable` — et le drapeau « hauteur indisponible » ; `Loudness`, donc le
portage, n'en dépend pas. Règle, ensembles de trames et prix : *Formulas* §4, « Une voix que
les détecteurs lisent mal — jamais un refus seul ».

---

### States and Transitions

**L'état vit à deux niveaux.** Le **profil du joueur** persiste entre les sessions ; le
`VoiceAnalyzer` ne porte que l'état d'exécution d'une session.

États : `Uncalibrated → Calibrated ⇄ Degraded`

#### En `Uncalibrated`, la sortie est du silence

`GetFrame()` renvoie `VoiceFrame.Silence(tick)`, `Tick` s'incrémentant normalement.

**Raison** : sans profil — donc sans `Gate_dB`, `Scream_dB` ni `F0_habituel` —, `Loudness`
et `Pitch` seraient des mesures brutes déguisées en valeurs normalisées. Cela violerait la
frontière brut/normalisé en substance, sinon en forme.

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
| `Uncalibrated → Calibrated` | Profil reçu. L'analyse le **valide**, reconstruit `Decimator` et `PitchDetector` sur la plage du profil — un profil `Unavailable` n'en a pas (*Formulas* §4) —, **pose l'enveloppe à `MinDb`** et vide l'anneau médian — un lissage construit sur du bruit non calibré fausserait les premières trames. Jamais l'enveloppe à 0 : en dB, 0 est la pleine échelle, et chaque transition produirait une entrée fantôme (*Formulas* §1a). Mécanisme et fils d'exécution : *Edge Cases*, « Conséquence d'implémentation » |
| `Calibrated → Degraded` | Coupure micro ou changement de périphérique signalé par `Audio d'entrée`. **Pose l'enveloppe à `MinDb`**, vide l'anneau, la ligne à retard du `Decimator` (`Decimator.cs:46, 173`) et les fenêtres glissantes : gain et bruit de fond diffèrent d'un périphérique à l'autre. Le `PitchDetector` ne garde rien d'un appel à l'autre — ses tableaux de travail sont réécrits à chaque détection (`PitchDetector.cs:172–217`). **Conserve le profil** |
| `Degraded` | Renvoie `VoiceFrame.Silence`, mais **`Tick` continue d'avancer** — le réseau doit voir de la continuité, pas un trou |
| `Degraded → Calibrated` | Sur l'événement **« capture reprise »** émis par le système 2 (*Dependencies*, contrat du système 2), anti-rebondi à la source (AC-20c). L'état est déjà propre. L'analyse ne déduit pas la reprise des échantillons : pendant la panne, elle ne reçoit rien |
| Recalibration en cours de partie (`Calibrated`, profil remplacé) | Se lance **depuis le menu** : ouvrir le menu immobilise le personnage, qui **pose ce qu'il porte** — aucun objet porté ne change donc de poids en pleine manipulation (`voice-calibration.md`, « La recalibration en cours de partie »). Pendant la calibration, la sortie du joueur vers le jeu est **forcée à `Silence`** (même document, « Pendant la calibration, la voix du joueur ne joue plus »). L'ancien profil reste en vigueur jusqu'à validation complète du nouveau ; au commit, même réinitialisation qu'à la réception d'un premier profil, et `r'` repart vers l'hôte (*Formulas* §1, « Position, repos, et où chaque grandeur existe ») |
| Nouveau joueur | **Nouvelle instance** de `VoiceAnalyzer`, à l'état `Uncalibrated`. Jamais de remise à zéro en place : une instance neuve élimine toute une classe de bugs « oublié de réinitialiser » |

**Le changement de périphérique ne force jamais une recalibration.** Ces événements se
déclenchent souvent à tort, et éjecter un joueur en plein contrat serait le pire moment
possible.

---

### Interactions with Other Systems

| Voisin | Vers l'analyse | Depuis l'analyse | Contrat, et propriétaire de l'interface |
|---|---|---|---|
| **Audio d'entrée** (2) | échantillons **bruts, sans traitement**, avec leur `AnalysisTiming` à chaque trame ; événements de périphérique | `VoiceFrame` | Audio d'entrée pousse à la cadence nominale ; l'analyse consomme l'intervalle réel sans le supposer (ADR-0007:273) |
| **Calibration vocale** (6) | `VoiceProfile`, drapeaux `LowRange` et `PitchStatus` compris (*Formulas* §4) | les primitives internes, pendant la session de calibration | **Vit dans `SUAC.Voice.Core`** (ADR-0006:79) — second consommateur des primitives pures. **Le profil ne quitte jamais la machine du joueur** (décision 3 · E5) |
| **Réseau** (5) | — | `VoiceFrame`, ses cinq champs ; **`r'`, un seul nombre, à la connexion et à chaque recalibration** — domaine : *Formulas* §5 | Client → hôte. `VoiceFrame` : ADR-0003:134, 224. `r'` : ADR-0003, *Decision*, chaîne d'analyse, étape 5 — le `VoiceProfile` ne quitte jamais le client (*Formulas* §1, « Position, repos, et où chaque grandeur existe »). Le réseau décide de l'échantillonnage vers sa cadence (ADR-0003:224), pas Core ; `Tick` y sert à repérer les trous |
| **Effet voix → objets** (11) | — | les `VoiceFrame` reçues, dont `Loudness` ; `r'_i` par joueur ; la fonction publique `ToPosition` | **Sur l'hôte.** Compare la position `x'_i = ToPosition(Loudness_i)` à un seuil posé sur `r'_i` — jamais `Loudness` elle-même (*Formulas* §1). Les seuils appartiennent à `voice-object-effect.md` |
| **Propagation du son** (3) | — | `VoiceFrame` par joueur, à la cadence réseau | consomme uniquement |
| **Couche de retour local** (12) | — | `VoiceFrame` locale, **avant réseau** | même instance et même trame que le réseau — pas de calcul dupliqué |

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

Seule conséquence : `VoiceProfile` s'inscrit sur la liste blanche de la surface publique —
liste complète ci-dessous.

#### `Degraded` sort par l'état de l'analyseur, pas par la trame

**`Degraded` doit être distinguable d'un joueur qui se tait**, sous peine d'échec
d'attribution (*Visual/Audio Requirements*), et `VoiceFrame` ne porte pas de drapeau de
confiance (*Edge Cases*, « Saturation du signal »). L'information passe donc par un autre
canal, que lisent les systèmes 12 et 19.

**L'état est exposé comme propriété de l'analyseur, pas comme champ de trame.** La
distinction est de fond : une `VoiceFrame` décrit *ce que le joueur a émis au tick N* ;
`Degraded` décrit *le fait que l'analyseur ne peut rien mesurer en ce moment*. Ce n'est pas
une donnée par trame, c'est un état de session.

**La surface publique visée est donc `{ VoiceFrame, VoiceProfile, AnalyzerState }`, plus
`ToPosition`**, sous la forme — nouveau type, ou méthode statique d'un type déjà public —
que choisira l'amendement d'ADR-0004 (*Formulas* §1, « Position, repos, et où chaque
grandeur existe »). Aujourd'hui, `AllowedPublicTypes` ne contient que `VoiceFrame`
(`PublicSurfaceTests.cs:32–35`) : chaque type s'y inscrit quand il existe.

> **La règle d'ADR-0004 n'est pas relâchée, sa liste blanche s'allonge.** C'est la seule
> manière correcte de la faire évoluer (`voice-chain-td-review-2026-09-08.md:143–144`) :
> quand un type doit devenir public, on l'inscrit, **on ne desserre pas la règle**.
> Aucune valeur brute ne franchit la frontière pour autant : `AnalyzerState` est une
> énumération de trois états, pas une mesure, et `ToPosition` convertit une grandeur
> normalisée en une autre.

#### Persistance

Le profil survivant aux sessions, il crée un **besoin de persistance** que l'index des
systèmes signalait comme sans propriétaire. Il revient au **système 6 (Calibration
vocale)**, pas à ce système.

#### Datation fine des transitoires — différée

Une mécanique d'écholocation par claquements de langue exigerait une datation à 5–20 ms.
La cadence réseau de 20–30 Hz espace les trames de 33 à 50 ms : l'incertitude de datation
vaut au plus une période, soit ±17 à ±25 ms une fois centrée — et **la fenêtre RMS de 21 ms
étale déjà le transitoire**, indépendamment du réseau : descendre sous 10–15 ms exigerait un détecteur
d'attaque dédié, séparé du lissage principal.

**Cette incertitude suffit au périmètre MVP** : l'objet concerné appartient au mobilier explicitement
reporté.

La solution est consignée si le besoin revient : **un événement discret hors cadence**
(horodatage + amplitude, ~10–12 octets, soit ≈ 1 Ko/s à 8 joueurs) plutôt que de monter la
cadence globale, qui coûterait ≈ 8 Ko/s pour un besoin ponctuel.

## Formulas

Les renvois **B1 … B7** et **C1 … C11** désignent les listes B (ce que mesure le prototype
navigateur) et C (ce qui précède l'écriture du `VoiceAnalyzer`) de
`design/gdd/reviews/voice-analysis-2026-09-14.md`, §2. Toute valeur provisoire citée ici vit
dans la **liste canonique** en fin de section, avec son propriétaire ; les nombres des
exemples sont des témoins calculés avec ces valeurs, pas des valeurs à recopier.

### 1. `Loudness`

```
RawRms_dB = 20 · log10( max(Rms , 10^(MinDb / 20)) )          conversion, avant l'enveloppe
Rms_dB    = enveloppe( RawRms_dB )                             §1a
Gate_dB   = Floor_dB + Margin_dB
x'        = clamp( (Rms_dB − Gate_dB) / (Scream_dB − Gate_dB) , 0 , 1 )
Loudness  = x' ^ γ
```

| Variable | Symbole | Type | Plage | Description |
|---|---|---|---|---|
| RMS de la fenêtre de 21 ms | `Rms` | float | [0 ; 1] | `RawLoudness.Rms`, **linéaire** — échantillons compris entre −1 et +1 (`LoudnessMeter.cs:32`) |
| Plancher de conversion | `MinDb` | float, dBFS | liste canonique | Constante absolue de `Voice.Core`, **jamais** `Floor_dB` : la conversion tourne avant qu'un profil existe |
| RMS instantané, en dB | `RawRms_dB` | float | [`MinDb` ; 0] | Entrée de l'enveloppe |
| RMS lissé, en dB | `Rms_dB` | float | [`MinDb` ; 0] | Sortie de l'enveloppe (§1a). **La seule grandeur de niveau que lisent `Loudness`, la porte de voisement (§4) et la calibration** |
| Plancher calibré | `Floor_dB` | float, dB | profil | **Défini, mesuré et possédé par le système 6** (`voice-calibration.md`, *Formulas* §1). Ce document ne le redéfinit pas |
| Marge au-dessus du plancher | `Margin_dB` | float, dB | liste canonique | Constante `Voice.Core` à **double rôle** : zéro de `Loudness` et porte de voisement (§4) |
| Porte de sonie et de voisement | `Gate_dB` | float, dB | dérivé | `Floor_dB + Margin_dB` — **le seul zéro du système** |
| Cri de référence | `Scream_dB` | float, dB | profil | Possédé par le système 6 |
| Écart dynamique | `Δ` | float, dB | profil | `Scream_dB − Floor_dB` — n'entre pas dans la formule ; il sert aux témoins des options rejetées ci-dessous |
| Plage utile | `Δ'` | float, dB | profil, > 0 | `Scream_dB − Gate_dB = Δ − Margin_dB` — le dénominateur de `x'` |
| Position | `x'` | float | [0 ; 1] | Place de `Rms_dB` entre `Gate_dB` et `Scream_dB`, en dB, avant `γ`. **Jamais transmise** |
| Exposant perceptif | `γ` | float | liste canonique | Règle **la perception seule** : aucun seuil aval ne le lit (« Position, repos », ci-dessous) |

**Sortie** : `Loudness ∈ [0 ; 1]`. **`Loudness = 0` exactement dès que `Rms_dB ≤ Gate_dB`** —
pas seulement au plancher `Floor_dB`. `Loudness = 1` dès que `Rms_dB ≥ Scream_dB`. Domaines
complets : §5.

**Exemple** : `Floor_dB = −50`, `Margin_dB = 7` → `Gate_dB = −43` ; `Scream_dB = −10`,
`Rms_dB = −30`
→ `x' = (−30 − (−43)) / (−10 − (−43)) = 13 / 33 ≈ 0,394` → `Loudness = 0,394^0,65 ≈ 0,546`.

#### La conversion en dB précède l'enveloppe

`LoudnessMeter` mesure `Rms` en linéaire, et **aucune conversion en décibels n'existe
aujourd'hui dans `Voice.Core`**. La conversion est une étape à part entière de la chaîne,
entre la mesure de niveau et le lissage.

- **La garde n'est pas optionnelle.** `log10(0)` diverge vers −∞, et le silence est le cas
  le plus fréquent du système. La borne se pose **avant** le logarithme, sur l'amplitude
  `10^(MinDb / 20)`, sous un seul nom de constante : `MinDb`, en dB.
- **L'enveloppe lisse en dB, pas en linéaire — c'est une décision de ressenti.** Une
  décroissance exponentielle en amplitude est une rampe droite en décibels, et
  réciproquement : deux courbes différentes. C'est le problème du variateur de lampe :
  baisser la *puissance* régulièrement fait voir à l'œil un effondrement brutal suivi d'une
  traîne interminable, et l'oreille fonctionne pareil. Les constantes d'attaque et de
  relâchement sont pensées en dB ; appliquées en linéaire, elles donneraient « ça retombe
  sec puis ça traîne » au lieu de « ça retombe régulièrement » — précisément sur le meuble
  qui s'allège quand on cesse de crier.
- **Trois conséquences.** AC-14 se mesure en dB. Le facteur `LowRange` multiplie des
  constantes de temps du domaine dB (§1a). `Peak` reste **linéaire** : il ne sert qu'au
  rapport crête/RMS, converti une seule fois en `CrestDb` (§3).

#### Garde et plancher dur — les deux seuls refus fondés sur l'écart

**Garde : `Scream_dB > Gate_dB`, strictement.** Sinon le dénominateur `Δ'` casse la formule
sans rien signaler. Négatif, `x'` s'inverse, et parler plus fort fait *baisser*
`Loudness`. Nul, `x'` devient une marche 0/1 — et vaut `NaN` au point exact
`Rms_dB = Gate_dB` : `0/0`, que `Math.Clamp` laisse passer (`VoiceFrame.cs:98`).

- **Aucune calibration ne l'atteint.** Au commit, `Rest_dB > Gate_dB` (§5) et l'ordre
  strict `Rest_dB < Scream_dB` du système 6 (V1) impliquent `Scream_dB > Gate_dB`.
- **Témoin atteignable** : un profil persisté, **revalidé au chargement** sous une
  configuration où `Margin_dB` a monté (CAL-30 du système 6), ou un fichier édité sur
  disque.
- **Propriétaire du refus : le système 6**, au commit et à chaque chargement. Le plancher
  dur l'implique dès que `HardFloor_dB > 0` ; la garde reste écrite parce qu'elle protège la
  formule même d'un plancher dur mal réglé.

**Plancher dur : on ne refuse qu'une plage inexploitable.** Un profil n'est refusé sur son
écart que si sa **plage utile `Δ'`** est trop étroite pour que le joueur y produise **deux
niveaux distincts**. Témoin, à mesurer : `Δ'` inférieure à environ **deux fois
l'oscillation trame à trame de `Rms_dB` sur une voix tenue**. C'est la détection d'une
mesure cassée — la seule chose qu'une constante a le droit d'attraper dans la chaîne
vocale. Une voix faible, timide ou qui ne peut pas crier n'est pas refusée : au-dessus du
plancher dur et sous la bande de qualité, elle est acceptée et marquée `LowRange`.

`HardFloor_dB` et `QualityBand_dB` sont **définis, chiffrés et appliqués par le système 6**
(`voice-calibration.md`), sur `Δ'` et non sur `Δ`. Leur valeur viendra des enregistrements
bruts (B7) et de la session hors ligne (C9), pas d'un pari.

#### Le vacillement à la porte — déplacé, pas supprimé

**Le décalage du zéro déplace l'oscillation trame à trame de `Rms_dB` (≈ 2 dB, ordre de
grandeur non mesuré) au-dessus de `Gate_dB` ; il ne la supprime pas.** Une voix posée sur la
porte clignote entre 0 et une petite valeur ; posée juste au-dessus, elle oscille entre
deux valeurs dont l'écart absolu croît quand `Δ'` rétrécit :

| `Rms_dB` oscillant entre | `Δ' = 38 dB` | `Δ' = 13 dB` |
|---|---|---|
| `Gate_dB − 1` et `Gate_dB + 1` | 0 ↔ 0,094 | 0 ↔ 0,189 |
| `Gate_dB + 1` et `Gate_dB + 3` | 0,094 ↔ 0,192 | 0,189 ↔ 0,386 |

**Aucun seuil ne le supprime. Ce que fait chaque mécanisme voisin :**

- **`FloorMargin_dB` (système 6) ne le traite plus.** Il garde le bruit stationnaire sous
  `Floor_dB`, donc `Margin_dB` sous la porte, où `Loudness` vaut déjà 0. Le monter
  rétrécit `Δ'` et **aggrave** le vacillement.
- **Le plancher dur ne le réduit pas** : il refuse la plage où deux niveaux deviennent
  indiscernables.
- **Le lissage `LowRange` l'amortit**, entre le plancher dur et la bande de qualité (§1a).
- **Le scintillement à la porte lui-même** — un chuchotement ou une note douce posés sur
  `Gate_dB` font-ils clignoter l'objet après lissage ? — **est mesuré par le prototype
  navigateur (B3)**.

#### Pourquoi le zéro se place à `Gate_dB` — et pourquoi les quatre autres options sont rejetées

Arbitrage (a) de la revue, accepté par le propriétaire.

| Option | Verdict |
|---|---|
| **1 — Zéro au plancher `Floor_dB`** (formule antérieure) | **Rejetée.** Le bruit stationnaire y est déjà à 0, puisque `Floor_dB` porte la marge du système 6. Mais **tout transitoire au-dessus pèse** — souffle, clavier, bruit de bouche : 2 dB au-dessus de `Floor_dB` valent 0,14 à `Δ = 40 dB` et 0,30 à `Δ = 13 dB`. Et **la note voisée la plus douce, posée à `Gate_dB`, vaut déjà `(Margin_dB / Δ)^γ`** : 0,32 à `Δ = 40 dB`, 0,51 à 20 dB, **0,67 à 13 dB** — entre un tiers et deux tiers de l'échelle dépensés sous la porte, précisément chez les profils `LowRange`. **Contredit la promesse « quand je me tais, mon objet cesse de réagir » (*Player Fantasy*), et rend le silence collectif du système 11 inatteignable** |
| **2 — Zéro à `Gate_dB`, dénominateur `Δ` inchangé** | **Rejetée.** `Loudness` saute de 0 à `(Margin_dB / Δ)^γ` — 0,32 à `Δ = 40 dB` — à l'instant où la porte de voisement s'ouvre : une discontinuité, pas un zéro |
| **3 — Conditionner `Loudness` par `Voiced`** | **Rejetée.** Supprime le chuchotement phonétique, apériodique par nature — contredit la promesse « quand je chuchote, le jeu entend un chuchotement » |
| **4 — Rampe douce entre `Floor_dB` et `Gate_dB`** | **Rejetée.** Le souffle garde un poids, alors que le régime SILENCE du système 11 est un état discret |
| **5 — Décalage continu du domaine** | **Retenue.** `Loudness` part de 0 exactement à `Gate_dB`, sans saut, et tout ce que le jeu déclare voisé reste strictement positif. C'est le même ancrage que le `r'` du système 6 et que les seuils du système 11 : trois documents, un seul point de départ |

**Le coût réel, et seulement lui.**

- **Nul pour tout ce que le jeu déclare voisé.** La porte de voisement exige déjà
  `Rms_dB > Gate_dB` (§4) : toute note chantée qui la franchit, même douce, reste
  au-dessus de 0 — et gagne en finesse, puisqu'elle part de 0 au lieu de
  `(Margin_dB / Δ)^γ`. Le Pilier 3, « chanter doucement », en profite.
- **Le coût tombe sur ce qui reste sous `Gate_dB`** : le chuchotement phonétique d'abord,
  et une note soufflée trop douce pour franchir la porte, qui n'était déjà pas voisée mais
  pesait jusqu'ici. Il devient 0 : sûr, mais invisible. `Gate_dB` se situe à
  `FloorMargin_dB + Margin_dB` au-dessus du P95 du bruit de la pièce mesuré par le
  système 6 — **≈ 10 dB avec les valeurs provisoires des deux systèmes**.
- **Où tombe le vrai chuchotement, aucune position avancée en revue ne le dit de façon
  vérifiable.** La mesure B1 tranche.

**Déclencheur de scission, à deux branches** (mesure B1) :

- si respiration < chuchotement < `Gate_dB`, on descend **seul** le zéro de sonie —
  `Margin_sonie < Margin_voisement` —, et la porte de voisement ne bouge pas ;
- si le chuchotement tombe sous la respiration, aucune marge ne les sépare : **le prix est
  accepté**.

**Conformité au principe des seuils personnels.** `Gate_dB` est personnel : il part du
bruit de *ta* pièce, mesuré par le système 6. `Margin_dB` est une constante, et le principe
l'autorise parce qu'elle **détecte du bruit, elle ne juge pas une voix**. La respiration
entre dans `Floor_dB` : l'étape de silence du système 6 dure assez longtemps pour la
capter et se fait en respirant normalement (`voice-calibration.md`, *Detailed Rules*,
étape 1).

**Pourquoi `γ` et pas une interpolation linéaire en dB.** Le dB compresse déjà
l'amplitude, mais la sonie perçue croît de façon **convexe** avec le dB. Une
interpolation linéaire ferait correspondre `0,5` à mi-chemin de la *grandeur physique*,
pas de l'*effort ressenti* — et l'écart entre les deux est **maximal dans le registre
bas, celui du chuchotement**, qui est le registre central du jeu.

#### Position, repos, et où chaque grandeur existe

**`γ` ne règle que la perception ; tout seuil aval compare des positions.** Si un
consommateur — le système 11 — comparait ses seuils à `Loudness`, recalibrer `γ`
déplacerait tous ces seuils sans le vouloir : à `x'` fixe, `Loudness = x'^γ` change avec
`γ`. Témoin : recaler `γ` de 0,65 à 0,5 fait passer la `Loudness` d'une position `x' = 0,8`
de 0,865 à 0,894 (**+3 %**), et celle de `x' = 0,2` de 0,351 à 0,447 (**+27 %**). Le
registre bas, que `γ` existe pour étirer, est celui où un recalage déplace le plus les
seuils aval.

```
r'             = (Rest_dB − Gate_dB) / (Scream_dB − Gate_dB)      position de repos du joueur
ToPosition(L)  = L ^ (1 / γ)                                       inverse de Loudness = x'^γ
```

- **`r'`** situe la voix posée du joueur dans sa plage utile, en position ; domaine
  `]0 ; 1[` (§5). `Rest_dB` est possédé par le système 6.
- **`ToPosition`** est une fonction pure et publique de `Voice.Core`. Elle rend `x'` à
  partir d'une `Loudness` reçue, avec le `γ` de la configuration locale, pour qu'**aucun
  consommateur ne détienne une seconde copie de `γ`** — ce qui recréerait, à l'envers, le
  défaut « un seul `γ` pour deux métiers ». Elle ne fait franchir la frontière à **aucune
  valeur brute** : ni dB ni Hz, une grandeur normalisée vers une autre.
- **`γ` est validé au chargement de la configuration** : toute valeur hors de sa plage
  sûre (liste canonique) est refusée, ce qui exclut en particulier `γ ≤ 0`. Témoin : à
  `γ = 0`, un silence (`x' = 0`) donnerait `Loudness = 0^0 = 1`, et `ToPosition` diviserait
  par zéro. Même classe de défaut que `CrestMaxDb ≤ CrestMinDb` (§3).
- **C'est un amendement de la surface publique d'ADR-0004**, qui la déclare « exactement
  `{ VoiceFrame }` » (ADR-0004:86). Si la fonction vit sur un nouveau type, celui-ci
  s'inscrit dans `AllowedPublicTypes` (`PublicSurfaceTests.cs:32`) ; si elle devient une
  méthode statique d'un type déjà public, ce test ne la voit pas — raison de plus pour
  l'inscrire dans l'ADR. Le choix de forme appartient à cet amendement.
- **Le format de la `VoiceFrame` ne change pas.** `x'` n'est pas transmise ; `Loudness`
  l'est, avec les quatre autres champs.
- **Repli**, si l'inversion côté hôte s'avère impraticable : scinder `γ` (perception) et
  `γ_seuil` (déclenchement) — revue, A1.4.

| Grandeur | Calculée où | À partir de | Disponible où | Routage |
|---|---|---|---|---|
| `Loudness` | client, `VoiceAnalyzer` | `Rms_dB`, profil local, `γ` local | client ; hôte | `VoiceFrame`, paquet de features client → hôte : ADR-0003:134, 224 ; ADR-0004:115 |
| `VoiceProfile` | client, système 6 | calibration | **client seulement** | ne quitte jamais la machine — décision E5 |
| `r'` | client, à chaque commit de profil | profil local, `Margin_dB` local | client ; hôte | envoyé à l'hôte **à la connexion et à chaque recalibration** (décision E5), acheminé par ADR-0003 (*Decision*, chaîne d'analyse, étape 5) |
| `x'_i` | hôte, système 11 | `ToPosition(Loudness_i)`, avec le `γ` de la configuration de l'hôte | hôte | calcul local — **exact seulement si le `γ` de l'hôte est celui du client** ; aucun ADR ne garantit encore cette égalité (ADR de réplication des curseurs, rappelé en revue §5) |
| Comparaison des positions | hôte, système 11 | `x'_i` et `r'_i` — forme recommandée : `x'_i` contre `T_objet · r'_i` (revue, A1.4) | hôte | les seuils appartiennent à `voice-object-effect.md` |

---

### 1a. Le coefficient de l'enveloppe (`EnvelopeFollower`)

```
c    = exp(−Δt / τ)          τ = τ_attaque si RawRms_dB,n > E_n−1 ; sinon τ_relâchement
E_n  = RawRms_dB,n + (E_n−1 − RawRms_dB,n) · c
E_0  = MinDb                 à la construction et à toute réinitialisation
Rms_dB = E_n
```

| Variable | Symbole | Type | Plage | Description |
|---|---|---|---|---|
| Intervalle réel entre deux trames | `Δt` | float, s | > 0 | `AnalysisTiming.DeltaSeconds`, fourni à chaque trame par `SUAC.Voice.Capture` (ADR-0007:138–141, 169–170). **Mesuré, pas supposé** |
| Constante de temps (attaque ou relâchement) | `τ` | float, s | ≥ 0 · liste canonique | Temps pour parcourir ≈ 63 % de l'écart restant. `τ = 0` : pas de lissage, `c = 0` (`EnvelopeFollower.cs:122–125`). Multipliée par le facteur `LowRange` pour un profil `LowRange` |
| Coefficient du filtre | `c` | float | [0 ; 1[ | Recalculé quand `Δt` s'écarte du précédent au-delà d'un epsilon — ADR-0007:154–155 donne la règle de recalcul, pas la formule |
| État de l'enveloppe | `E` | float, dBFS | [`MinDb` ; 0] | Moyenne pondérée d'entrées de ce domaine, partie de `MinDb` : il ne peut pas en sortir |

**Sortie** : `c` tend vers 1 quand `Δt → 0` (rien ne bouge en un instant infinitésimal),
vers 0 quand `Δt → ∞` (on saute directement sur la cible).

**Exemple** : `τ = 0,15 s` (relâchement), `Δt = 0,02 s` (une trame à 50 Hz)
→ `c = exp(−0,02 / 0,15) = exp(−0,133) ≈ 0,875`.

**Réinitialiser l'enveloppe, c'est la poser à `MinDb`, pas à 0.** En dB, 0 est la **pleine
échelle**. Le code actuel initialise et réinitialise à `0f` (`EnvelopeFollower.cs:89, 113`) :
juste en linéaire, faux en dB. Témoin : après une remise à 0 dB, dans une pièce à
−60 dBFS, avec `Gate_dB = −43`, `Scream_dB = −10` et `τ = 150 ms`, la première trame lit
`Loudness = 1`, et `Loudness` reste positive pendant `τ · ln(60 / 17) ≈ 190 ms` de silence
— une entrée fantôme à chaque transition qui réinitialise l'enveloppe (*States and
Transitions*). Partie de `MinDb`, l'enveloppe monte vers −60 dBFS sans jamais franchir la
porte.

**Le facteur `LowRange` multiplie `τ`, jamais `c`.** Témoin : relâchement `τ = 200 ms`,
`Δt = 20 ms` → `c = exp(−0,1) ≈ 0,905`. Multiplier `c` par 1,5 donne 1,36 > 1, et le
filtre diverge. Multiplier `τ` donne `c = exp(−0,02 / 0,3) ≈ 0,936` : un lissage plus lent,
comme voulu.

**Pourquoi cette formule est normative dès maintenant.** Le prototype navigateur tourne à
cadence variable — c'est la même règle de provenance que celle qui interdit de mesurer une
constante dans un modèle différent de celui qu'on spécifie. Une attaque ou un relâchement
réglés là-bas sous un coefficient figé ne se transposeraient pas au jeu final.

**État du code.** `EnvelopeFollower` prend aujourd'hui `updateRateHz` au constructeur et
calcule `c = exp(−1 / (τ · rate))` (`EnvelopeFollower.cs:130`) — **c'est la même loi**, avec
`Δt = 1 / rate` constant. ADR-0007 est Accepted et bloque l'écriture du `VoiceAnalyzer` ;
la migration vers un `Δt` par appel, la réinitialisation à `MinDb` et le critère AC-14e
qui les vérifiera restent à faire (C1).

---

### 2. `Pitch`

```
Pitch = 12 · log2(F0_Hz / F0_habituel)       si Voiced
Pitch = 0                                    sinon
```

| Variable | Symbole | Type | Plage | Description |
|---|---|---|---|---|
| F0 après filtre médian | `F0_Hz` | float, Hz | domaine du détecteur sur la plage recalibrée — §5 | Sortie de l'étape 7 de la chaîne |
| Hauteur habituelle | `F0_habituel` | float, Hz | domaine du détecteur non calibré — §5 | Médiane de la parole posée, **possédée par le système 6**. Absente pour un profil `Unavailable` (§4) |

**Sortie** : des demi-tons, sur un **domaine asymétrique qui dépend de `F0_habituel`** —
formule et témoins en §5. ±12 n'est pas une garantie. La plage de recherche vient de la
4ᵉ défense contre l'erreur d'octave — ± une octave autour de `F0_habituel`, recadrée à
70 Hz et plafonnée en haut (*Edge Cases*, « Extrêmes du profil vocal ») — et le détecteur
la déborde d'au plus un pas de décalage. Hors calibration, l'analyse ne produit que du
silence : aucune `Pitch` n'existe.

**Exemples**, avec `F0_habituel = 120 Hz` :

| `F0_Hz` | `Pitch` |
|---|---|
| 240 | **+12** (une octave au-dessus) |
| 120 | **0** (sa voix normale) |
| 90 | **−4,98** |

**Hors voisement, `Pitch = 0`** (`VoiceFrame.cs:103`), et `VoiceFrame.Silence()` aussi
(`VoiceFrame.cs:113`). **0 hors voisement n'est pas une mesure, c'est l'absence de mesure :
lire `Voiced`.** Pourquoi 0 plutôt que la dernière valeur : un consommateur qui oublie
`Voiced` voit alors la note casser à chaque consonne, dès le premier playtest ; avec « garder
la dernière valeur », chanter une fois puis se taire tiendrait la note indéfiniment, sans
aucun symptôme. **On préfère la panne bruyante.** En interne, l'anneau médian gèle
(*Edge Cases*) ; en public, le champ vaut 0. La tolérance aux micro-coupures d'une note
tenue appartient au système 13.

---

### 3. `Continuity`

```
CrestDb    = 20 · log10(Peak / Rms)
Continuity = clamp(1 − (CrestDb − CrestMinDb) / (CrestMaxDb − CrestMinDb), 0, 1)
```

| Variable | Symbole | Type | Plage | Description |
|---|---|---|---|---|
| Crête, en dB | `CrestDb` | float | [0 ; 10 · log10(n)] — §5 | Dérivé de `RawLoudness.CrestFactor`, sur `Rms` et `Peak` **linéaires** |
| Borne son tenu | `CrestMinDb` | float, dB | liste canonique | Voyelle tenue humaine |
| Borne percussif | `CrestMaxDb` | float, dB | liste canonique | Claquement de langue |

**Précondition sur les bornes** : `CrestMaxDb > CrestMinDb` **strictement**, validé au
chargement de la configuration. C'est l'un des trois dénominateurs du document qui dépendent
d'un réglage, avec `Δ'` (§1) et `1/γ` (§1), et il souffre du même défaut que la garde de §1
empêche : transposées, les bornes inversent `Continuity`, et un claquement se lit comme une
note tenue, sans `NaN` ni erreur. Voir *Edge Cases* et AC-26b.

**Sortie** : 0 à 1. **0 = percussif, 1 = régulier.**

**Exemple** : `Peak/Rms = 3` → `CrestDb = 20·log10(3) = 9,54`
→ `Continuity = 1 − (9,54 − 8)/(20 − 8) ≈ 0,87`.

**Cas limite obligatoire : `Rms = 0` → `Continuity = 0`.** Sans garde, la formule diverge :
`log10(0)` tend vers −∞ et `Continuity` serait bornée à 1 — « parfaitement tenu » sur du
**silence**. Sur du silence, il n'y a pas de forme à décrire. Le code renvoie déjà
`CrestFactor = 0` quand `Rms = 0` (`RawLoudness.cs:67`) ; la conversion doit porter la
garde aussi, puisque `log10(0)` y reviendrait.

**Pourquoi le domaine dB.** La crête a une distribution très asymétrique ; le dB la
linéarise. Les bornes initialement proposées — 1,4 et 6 en linéaire — étaient fausses
dans les deux sens : **1,4 suppose un sinus pur**, or le pouls glottique et les formants
montent la crête de toute voyelle humaine ; et **6 est trop bas** pour un transitoire de
5–20 ms noyé dans une fenêtre de 21 ms à moitié silencieuse.

---

### 4. Porte de voisement

```
Voiced    = IsVoiced_YIN
            AND (Rms_dB > Gate_dB)
            AND (JitterPct > JitterMin)

JitterPct = 100 · écart-type(T_i) / moyenne(T_i)   sur les N dernières périodes acceptées
```

| Variable | Symbole | Type | Plage | Description |
|---|---|---|---|---|
| Périodicité YIN | `IsVoiced_YIN` | bool | | Un creux de la différence normalisée passe sous le seuil d'apériodicité (`PitchDetector.cs:231–249`) — décision d'ADR-0004, liste à part |
| Porte de sonie et de voisement | `Gate_dB` | float, dB | dérivé | Définie en §1 : **la même porte que le zéro de `Loudness`**, lue sur **le même `Rms_dB` lissé de la même trame** |
| Jitter relatif de période | `JitterPct` | float | % | |
| Jitter minimal | `JitterMin` | float | liste canonique | En dessous : trop stable pour une voix |
| Fenêtre du jitter | `N` | int | liste canonique | |

**Sortie** : booléen. **`Voiced = true` implique `Rms_dB > Gate_dB`, donc `Loudness > 0`**
— c'est la seule garantie mutuelle entre les deux formules, et elle tient pour chacun des
trois états ci-dessous. Voir §5.

**Exemples** :

| Source | `JitterPct` | Résultat |
|---|---|---|
| Ronflement de frigo à 100 Hz | ≈ 0,05 % | **non voisé, même fort** |
| Voyelle chantée tenue | 1 – 2 % | voisé |

**Amorçage** : tant que moins de `N` périodes sont disponibles, **le test de jitter passe
par défaut**. Le faire échouer coûterait ~80 ms de silence au début de chaque prise de
parole — soit précisément l'attaque, la partie la plus perceptible d'une voix. Rater
80 ms d'attaque est pire que laisser passer 80 ms de bourdonnement.

#### Une voix que les détecteurs lisent mal — jamais un refus seul

**Un détecteur ne refuse jamais seul un profil.** `JitterMin` et le seuil d'apériodicité
sont des constantes globales ; le principe des seuils personnels ne les autorise qu'à
reconnaître une source non humaine, et cela n'est vérifié dans aucun sens (C9). Or une voix
qu'ils rejettent n'atteint jamais le compte minimal de trames voisées du système 6 :
**sans cette règle, elle serait exclue du jeu entier**, pas seulement des mécaniques de
hauteur — voix soufflée, basse très profonde, chanteur très stable.

Le système 6 évalue la règle sur l'étape de parole posée, avec trois ensembles emboîtés de
trames et son propre compte minimal `VoicedMin` :

```
G = { trames : Rms_dB > Gate_dB }                  la porte de sonie seule
Y = { trames de G : IsVoiced_YIN }                  + la périodicité
V = { trames de Y : JitterPct > JitterMin }         la porte complète
```

| Condition | `PitchStatus` du profil | Porte de voisement pour ce joueur | Ce que calcule le système 6 |
|---|---|---|---|
| `n(V) ≥ VoicedMin` | **`Full`** | complète, ci-dessus | `Rest_dB` et `F0_habituel` sur `V` |
| `n(V) < VoicedMin ≤ n(Y)` — le jitter bloquait | **`NoJitter`** | `Voiced = IsVoiced_YIN AND Rms_dB > Gate_dB` : **le jitter est désactivé** ; `Pitch` reste disponible | `Rest_dB` sur `G` ; `F0_habituel` sur `Y` |
| `n(Y) < VoicedMin ≤ n(G)` — l'apériodicité bloquait | **`Unavailable`** | `Voiced = false` et `Pitch = 0` sur toute trame ; sans `F0_habituel`, aucune plage recalibrée n'existe : la détection de hauteur n'a rien à produire pour lui | `Rest_dB` sur `G` ; **pas de `F0_habituel`**, ce qui n'est pas un refus |
| `n(G) < VoicedMin` | — | — | aucune voix n'a franchi la porte de sonie : ce n'est pas un détecteur qui bloque, **l'étape se rejoue** |

**Le repli de `Rest_dB`** — la médiane de `Rms_dB` sur `G` — reste strictement au-dessus de
`Gate_dB`, puisque toutes les trames de `G` le sont : `r' > 0` tient sur les trois chemins
(§5). Le prototype navigateur, qui n'implémente ni YIN ni jitter, calcule `Rest_dB` sur `G`
et éprouve donc ce chemin au passage.

**Pourquoi un état à trois valeurs, et non un booléen.** Les deux détecteurs n'entraînent
pas la même conséquence — le jitter se désactive, l'apériodicité rend `Voiced` indisponible
—, et l'analyseur doit savoir laquelle appliquer à chaque trame. Un booléen obligerait à
traiter les deux cas pareil, donc à retirer `Pitch` à une voix que YIN lit très bien. Le
drapeau visible **« hauteur indisponible »**, du même ordre que `LowRange`, se lève pour
`NoJitter` comme pour `Unavailable` ; `PitchStatus` est porté par le `VoiceProfile`, comme
`LowRange`, et revalidé avec lui.

**Le prix, pour ce joueur seulement.**

- **`NoJitter`** : un bourdonnement fort et périodique — frigo, ventilateur — au-dessus de
  `Gate_dB` peut passer pour une voix sur `Voiced`, et recevoir une `Pitch`. Les mécaniques
  de hauteur et de note tenue peuvent être trompées.
- **`Unavailable`** : les mécaniques de hauteur et de note tenue lui sont indisponibles.
- **Dans les deux cas, `Loudness` — donc le portage — n'en dépend pas** : elle ne lit jamais
  `Voiced` (option 3 rejetée, §1). `Continuity` non plus.

---

### 5. Table des domaines atteignables

**Ce que les systèmes 6 et 11 citent, sans re-dériver.** Cette table donne des **formules
de bornes** ; les nombres de la colonne « Témoin » sont calculés une fois ici, avec les
constantes actuelles, pour que la formule reste vérifiable sans machine. Ils ne se
recopient pas.

| Sortie | Domaine atteignable | Formule et source de la garantie | Témoin |
|---|---|---|---|
| `RawRms_dB`, `Rms_dB` (internes) | `[MinDb ; 0]` dBFS | Conversion bornée par `MinDb` (§1) ; échantillons dans [−1 ; 1] (`LoudnessMeter.cs:32`), donc `Rms ≤ 1`. L'enveloppe est une moyenne pondérée d'entrées de ce domaine, partie de `MinDb` (§1a) | `Rms = 0` → `MinDb`. Conséquence pour le système 6 : `Floor_dB ≥ MinDb + FloorMargin_dB` ; un plancher plus bas est inatteignable |
| `x'`, `Loudness` | `[0 ; 1]` ; `Loudness = 0 ⇔ x' = 0 ⇔ Rms_dB ≤ Gate_dB` ; `Loudness = 1 ⇔ Rms_dB ≥ Scream_dB` | §1, sous la garde `Scream_dB > Gate_dB` | `Rms_dB = Gate_dB` → 0 ; exemple de §1 : `x' ≈ 0,394`, `Loudness ≈ 0,546` |
| `Voiced ⇒ Loudness > 0` | implication, pour les trois `PitchStatus` | La porte (§4) teste `Rms_dB > Gate_dB` sur le même `Rms_dB` lissé et la même trame que §1 | Contraposée : `Loudness = 0 ⇒ Voiced = false` |
| `Voiced`, selon le profil | `Full`, `NoJitter` : `{false, true}` ; `Unavailable` : `{false}` | §4, « jamais un refus seul » | Profil `Unavailable` : `Voiced = false` sur toute trame, même chantée |
| `r'` — position de repos | `]0 ; 1[` pour tout profil commité | `r' = (Rest_dB − Gate_dB) / (Scream_dB − Gate_dB)`. **`Rest_dB > Gate_dB`** : médiane de trames toutes au-dessus de `Gate_dB` — `V` ou `G` selon le chemin (§4) —, **à condition que le système 6 prenne la médiane du même `Rms_dB` lissé que la porte**. **`Rest_dB < Scream_dB`** : ordre strict V1 du système 6 | `Gate_dB = −48`, `Rest_dB = −30`, `Scream_dB = −10` → `r' = 18 / 38 ≈ 0,47` |
| `F0_habituel`, et tout `F0_Hz` non calibré | `[SR_d / maxLag ; SR_d / (minLag − 1)]`, `SR_d` cadence décimée | `minLag = ⌊SR_d / maxHz⌋`, `maxLag = ⌈SR_d / minHz⌉` (`PitchDetector.cs:120–121`). L'interpolation parabolique décale le creux retenu d'au plus un pas, `offset ∈ [−1 ; 1]` (`PitchDetector.cs:299–308`), et ne s'applique pas à `maxLag` (l. 283) — d'où `minLag − 1` en haut et `maxLag` en bas. **`minLag ≥ 2` est garanti** : le constructeur refuse `maxHz ≥ SR_d / 2` (l. 105–109), donc le `Math.Max(1, …)` de la l. 120 ne mord jamais et le dénominateur ne s'annule pas. *(Le commentaire l. 301 parle d'un demi-échantillon ; le test l. 303 accepte un pas entier : la borne suit le code)* | 8 kHz, plage 70–600 Hz (ADR-0004:101–103) : `minLag = 13`, `maxLag = 115` → **[69,6 ; 666,7] Hz**. Une valeur hors de ce domaine ne vient pas d'une calibration : profil corrompu ou édité sur disque |
| `Pitch`, voisé | `[12 · log2(SR_d / (maxLag · F0_habituel)) ; 12 · log2(SR_d / ((minLag − 1) · F0_habituel))]` | Mêmes bornes, sur la plage recalibrée `[minHz ; maxHz] = [max(70 ; F0_habituel / 2) ; min(Plafond ; 2 · F0_habituel)]`, `SR_d = 12 000` si `2 · F0_habituel > 600`, sinon 8 000, `Plafond` = 600 Hz à 8 kHz et 900 Hz à 12 kHz (*Edge Cases*, « Extrêmes du profil vocal » ; décidé par le système 6, `voice-calibration.md` §5). `VoiceFrame` ne borne pas `Pitch` (`VoiceFrame.cs:103`) : le domaine vient du détecteur, pas du contrat | 200 Hz → `minLag = 20`, `maxLag = 80`, [100 ; 421,05] Hz → **[−12,00 ; +12,89]**. 286 Hz → `minLag = 13`, `maxLag = 56` → **[−12,02 ; +14,65]**. 666 Hz, 12 kHz → `minLag = 13`, `maxLag = 37` → **[−12,46 ; +7,04]**. 120 Hz → `minLag = 33`, `maxLag = 115` → **[−9,44 ; +12,71]**. **−12 n'est atteignable que si `F0_habituel ≥ 139,13 Hz`** — c'est-à-dire dès que le recadrage à 70 Hz ne mord plus, `SR_d / maxLag ≤ F0_habituel / 2` — **et +12 que si `F0_habituel ≤ 500 Hz`.** Enveloppe sur tous les `F0_habituel` valides, avec ces constantes : ≈ [−12,5 ; +14,7] |
| `Pitch`, non voisé, et tout profil `Unavailable` | `{0}` | `Pitch = voiced ? pitch : 0f` (`VoiceFrame.cs:103`) | **0 hors voisement n'est pas une mesure, c'est l'absence de mesure. Lire `Voiced`** |
| `Continuity` | `[0 ; 1]`, les deux bornes atteintes | `Peak ≥ Rms` toujours, donc `CrestDb ≥ 0` ; au plus `10 · log10(n)` pour `n` échantillons, atteint par une impulsion isolée. `Rms = 0` → 0 (§3) | Fenêtre de 21 ms à 48 kHz, `n = 1 008` : `CrestDb ≤ 30,0 dB`, au-delà de `CrestMaxDb` → un clic atteint 0. Sinus : `CrestDb = 3,0 dB`, sous `CrestMinDb` → 1 |
| Branche de décimation à `R` Hz | réalisable **si et seulement si** le `SampleRate` d'entrée est un multiple entier de `R` | `Decimator(int factor, …)` (`Decimator.cs:74`) ne représente qu'un facteur entier ; un facteur non entier est refusé à la construction, jamais arrondi (ADR-0007:171–175) | 48 kHz → 6 (8 kHz) et 4 (12 kHz). 96 kHz → 12 et 8. 16 kHz → 2 vers 8 kHz, mais 1,33 vers 12 kHz. 44,1 kHz → 5,5125 et 3,675 : **aucune des deux**. **Être multiple de 8 000 ne suffit pas pour la branche 12 kHz** : les deux branches exigent un multiple de 24 000 — parmi les fréquences courantes, 48 et 96 kHz. Ailleurs, la bascule 12 kHz des voix aiguës n'existe pas ; le contrat de fréquence du système 2 (C7) en décide |
| `Tick` | `[0 ; uint.MaxValue]`, cyclique | Compte les **trames traitées** — les appels —, pas le temps. Avance même en `Silence` | Déborde après `2³² / 50` s ≈ **994 jours** à 50 appels/s réels ; comparer par différence modulaire, jamais par `>` |

---

### Porte de mesure — la liste canonique des valeurs provisoires

**Les valeurs de cette liste sont des ordres de grandeur défendables, pas des mesures.**
Elles permettent d'implémenter et de tester ; **elles ne sont pas canon.** C'est la seule
liste du document : ailleurs, on y renvoie.

**Critère d'entrée : une valeur y figure si et seulement si elle attend une mesure.** Une
valeur fixée par un ADR n'y entre pas ; une valeur possédée par un autre système y est
nommée, jamais chiffrée.

| Valeur | Provisoire | Plage sûre | Propriétaire | Statut | Se fixe par |
|---|---|---|---|---|---|
| `γ` — exposant perceptif | 0,65 | 0,5 – 1,0 ; **hors plage, refusé au chargement** (§1) | Système 1 | PROVISOIRE | Protocole B |
| `MinDb` — plancher de conversion | −120 dBFS | toute valeur finie sous le bruit de pièce le plus bas mesuré | Système 1 | PROVISOIRE | Enregistrements bruts (B7) |
| `Margin_dB` — zéro de sonie et porte de voisement | 7 dB | 6 – 8 | Système 1 | PROVISOIRE | B1 — où tombent chuchotement, respiration, clavier ; tranche la scission de §1 |
| `CrestMinDb` | 8 dB | 6 – 12 | Système 1 | PROVISOIRE | Protocole A |
| `CrestMaxDb` | 20 dB | 15 – 26 | Système 1 | PROVISOIRE | Protocole A |
| `JitterMin` | 0,5 % | 0,3 – 1,0 | Système 1 | PROVISOIRE | Session hors ligne (C9) |
| `N` — fenêtre de jitter | 4 | 3 – 5 | Système 1 | PROVISOIRE | C9 ; exprimée en secondes à la migration ADR-0007 (C1) |
| Attaque de l'enveloppe | 10–20 ms | 5 – 40 ms | Système 1 | PROVISOIRE | B4, en dB, sous `c = exp(−Δt/τ)` |
| Relâchement de l'enveloppe | 120–200 ms | 80 – 400 ms | Système 1 | PROVISOIRE | B4 |
| Facteur `LowRange`, sur `τ` | ×1,5 | 1,2 – 2,5 | Système 1 | PROVISOIRE | B5 — le ressenti d'un cri volontairement retenu |
| Fenêtre de gel sur écrêtage | ~250 ms | 100 – 500 ms | Système 1 | PROVISOIRE | Enregistrements de cris saturés, avec le seuil d'écrêtage (ligne « Seuil d'écrêtage ») — hors prototype |
| TTL de l'anneau médian | — | — | Système 1 | **EN ATTENTE** | OQ-6 |
| Taille de l'anneau médian | 5 | 3 – 9, **impaire** | Système 1 | PROVISOIRE | C9 — erreurs d'octave réellement observées. Origine : « ~5 trames », ADR-0004:132, qui n'en fixe ni la valeur ni la parité ; la parité est une décision de ce document (*Tuning Knobs*, « Ce qui n'est pas un curseur ») |
| Seuil d'écrêtage | — | — | Système 1 | **EN ATTENTE** | C6 — enregistrements de cris saturés, hors prototype ; valeur et nombre d'échantillons consécutifs (*Edge Cases*, « Saturation du signal ») |
| `p` — part des trames à `Loudness = 0` sur bruit ambiant (AC-40) | — | — | Mesure : système 1 ; part suffisante : système 11, cible `p ≥ 0,84` (`voice-object-effect.md`, *Formulas* §3) | **EN ATTENTE** | B2 — étape de silence du prototype navigateur |
| `HardFloor_dB`, `QualityBand_dB`, `FloorMargin_dB`, `VoicedMin` | — | — | **Système 6** | voir `voice-calibration.md` | voir `voice-calibration.md` |

**Décisions d'ADR-0004 — hors de la liste, parce qu'elles n'attendent pas de mesure :**

| Décision | Valeur | Source | Pour la changer |
|---|---|---|---|
| Cadence de décimation | 8 kHz ; 12 kHz pour une voix aiguë | ADR-0004:101–103, 202 ; bascule décidée par le système 6 (`voice-calibration.md` §5) ; réalisabilité en §5 | Rouvrir ADR-0004 |
| Seuil d'apériodicité de YIN | 0,15 | ADR-0004:101–103 — vérifié sur enregistrements (C9), jamais refus seul (§4) | Rouvrir ADR-0004 |
| Plage de recherche non calibrée | 70–600 Hz, fenêtre de 256 échantillons | ADR-0004:101–103 | Rouvrir ADR-0004 |

**Protocole A — bornes de crête** *(≈ 3 minutes)*
Enregistrer : une voyelle tenue chuchotée, une voyelle tenue criée, dix claquements de
langue. Lire la crête réelle sur fenêtre de 21 ms.
→ Fixe `CrestMinDb` et `CrestMaxDb`.

**Protocole B — exposant perceptif** *(une courte session de test)*
Quatre ou cinq testeurs notent leur effort ressenti de 1 à 5, du chuchotement au cri ;
relever le `Rms_dB` correspondant. Caler `γ` pour que les paliers ressentis tombent à
intervalles réguliers sur l'échelle 0–1.
→ Fixe `γ`.

Tant qu'une valeur n'a pas été fixée par sa mesure, **elle ne doit être citée comme
acquise** ni dans le code ni dans un autre document : AC-43 et AC-44 le vérifient,
pour chaque valeur de cette liste.

> **Coût de révision : quasi nul.** Chaque valeur est une constante nommée, passée par
> constructeur ou par configuration — ADR-0004:101–103 l'impose pour la détection, et rien ne
> s'écrit en littéral (AC-43).

## Edge Cases

Chaque entrée nomme la **condition exacte**, la **résolution exacte**, et sa sévérité :
**bloquant** (le système produit une valeur fausse sans le signaler), **dégradant** (valeur
médiocre mais honnête) ou **cosmétique**.

### Profil de calibration dégénéré

> Le profil **persiste sur disque**, et les seuils qui le jugent peuvent changer d'une
> version à l'autre. Un profil dégénéré empoisonnerait toutes les sessions futures : la
> validation — **au commit et à chaque chargement**, par le système 6 — n'est pas une
> précaution, c'est une nécessité.

#### La plage utile fait deux métiers — deux seuils, possédés par le système 6

Un seul seuil ne peut pas à la fois attraper une mesure cassée et signaler une mesure
médiocre : les fusionner oblige à choisir entre exclure des joueurs légitimes et accepter
des mesures inexploitables. **Ils se séparent.** `HardFloor_dB` et `QualityBand_dB` sont
**définis, chiffrés et appliqués par le système 6** (`voice-calibration.md`), sur la plage
utile `Δ' = Scream_dB − Gate_dB` — *Formulas* §1, « Garde et plancher dur ». Ce document ne
les chiffre pas.

- **Si `Δ' < HardFloor_dB`** — une plage où le joueur ne peut plus produire deux niveaux
  distincts, donc une **mesure cassée** (témoin à mesurer : *Formulas* §1) : profil
  **refusé au commit**, et le système 6 fait rejouer l'étape en cause. **Après deux refus,
  il propose un profil approximatif** (décision D2, `voice-calibration.md`) — qui doit
  encore passer la garde `Scream_dB > Gate_dB`, faute de quoi l'analyse reste
  `Uncalibrated` (« Un profil invalide qui atteint malgré tout l'analyse », ci-dessous).
  **Bloquant si non traité** : sans refus, une plage inexploitable piloterait le portage ;
  sans la sortie D2, un joueur resterait bloqué pendant que ses amis attendent.
- **Si `HardFloor_dB ≤ Δ' < QualityBand_dB`** — voix faible, timide, ou qui ne peut pas
  crier : profil **accepté et marqué `LowRange`** ; le facteur `LowRange` allonge les
  constantes de temps de l'enveloppe de ce joueur (*Formulas* §1a). **Dégradant** : il joue,
  avec une mesure plus molle et honnêtement signalée comme telle.

> **Pourquoi ce découpage.** Un joueur qui ne peut pas crier — voisinage, timidité, voix
> faible — fournit un effort *relatif* parfaitement exploitable. Le refuser au nom d'une
> exigence de qualité, c'est exclure quelqu'un que le système sait mesurer, ce que le
> principe des seuils personnels interdit : une constante n'a le droit d'attraper qu'une
> mesure cassée, et une plage où deux niveaux se confondent en est une. Ce que le plancher
> dur et le lissage `LowRange` font — et ne font pas — à l'oscillation de `Rms_dB` près de
> la porte est écrit une seule fois : *Formulas* §1, « Le vacillement à la porte — déplacé,
> pas supprimé ».

#### Les retournements silencieux — un diviseur qui dépend d'un réglage

- **Si `Scream_dB ≤ Gate_dB`** : profil **refusé par le système 6, au commit et à chaque
  chargement** (garde de *Formulas* §1). **Aucune calibration ne l'atteint** : V1 et
  `Rest_dB > Gate_dB` (§5) l'excluent au commit. **Témoins atteignables** : un profil
  revalidé au chargement sous une configuration où `Margin_dB` a monté (CAL-30), ou un
  fichier édité sur disque. **Bloquant** : négatif, le dénominateur inverse `x'`, et parler
  plus fort fait *baisser* `Loudness` — une valeur plausible et fausse, sans `NaN` ; nul,
  `x'` devient une marche 0/1, et `NaN` au point exact `Rms_dB = Gate_dB` (*Formulas* §1).
  `Floor_dB ≥ Scream_dB` en est un cas particulier, puisque `Margin_dB > 0`.
- **Si `CrestMaxDb ≤ CrestMinDb`** — bornes transposées ou égales, par édition de config
  ou par un réglage mal recopié : la configuration est **refusée au chargement**
  (*Formulas* §3). **Bloquant, même classe de défaut** : transposées, `Continuity`
  s'inverse et un claquement percussif se lit comme une note parfaitement tenue, sans `NaN`
  ni exception ; égales, `Continuity` devient une marche 0/1, et `NaN` au point
  `CrestDb = CrestMinDb`, que `Math.Clamp` laisse passer (`VoiceFrame.cs:99`).
- **Si `γ` sort de sa plage sûre** — en particulier `γ ≤ 0`, par édition de config : la
  configuration est **refusée au chargement** (*Formulas* §1, « Position, repos, et où
  chaque grandeur existe »). **Bloquant, même classe** : à `γ = 0`, un silence pèserait
  autant qu'un cri, et `ToPosition` diviserait par zéro.

> **Ils se ressemblent, et ce n'est pas un hasard.** Chaque fois qu'une formule de ce
> document divise par une grandeur qui dépend d'un réglage, cette grandeur est validée à la
> source — *Formulas* §3 les recense. C'est la règle générale dont ces cas sont les
> instances connues ; toute formule ajoutée plus tard y est soumise.

#### `F0_habituel` hors du domaine du détecteur — un fichier, jamais une voix

- **Si la calibration ne capte pas assez de trames voisées** — une voix que YIN ou le
  jitter rejettent, pas une hauteur « nulle » : **ce n'est pas un refus**. Le profil suit
  « Une voix que les détecteurs lisent mal — jamais un refus seul » (*Extrêmes du profil
  vocal*, ci-dessous). Un profil `Unavailable` ne porte **pas de `F0_habituel`**, et **une
  valeur absente n'est pas une valeur hors domaine** : le test qui suit ne vise que les
  profils qui en portent une.
- **Si un profil porte un `F0_habituel` hors du domaine** de *Formulas* §5 (ligne
  « `F0_habituel`, et tout `F0_Hz` non calibré ») : profil **refusé au chargement** par le
  système 6. **Témoin atteignable : un fichier corrompu ou édité sur disque** — une
  calibration ne produit pas une hauteur que son détecteur ne sait pas mesurer. Au commit,
  le même test est une **assertion défensive sans témoin**, gardée comme telle. Il s'écrit
  comme une **appartenance** au domaine, qui rejette aussi une valeur non finie.
  - **Précondition, écrite par le système 6** (`voice-calibration.md`, *Formulas* §2) : `F0_habituel` se mesure toujours sous la
    configuration non calibrée, recalibration comprise. Mesurée sous une plage recalibrée
    à 12 kHz, une hauteur légitime peut dépasser la borne haute du domaine, et serait
    refusée à tort.
  - **Bloquant si non traité**, pour deux raisons vérifiées sur le code. Si la plage
    recalibrée de §5 est vide — `2 · F0_habituel ≤ 70 Hz`, ou `F0_habituel / 2 ≥ Plafond`
    —, le constructeur de `PitchDetector` lève (`PitchDetector.cs:100–104`) **sur le fil
    d'analyse**, pendant la reconstruction. Sous le domaine, sans aller jusque-là, la plage
    existe et ment : témoin `F0_habituel = 50 Hz`, plage [70 ; 100] Hz, qui ne contient même
    pas la hauteur habituelle, et une `Pitch` voisée qui ne descend jamais sous ≈ +5,7
    demi-tons.

#### Un profil invalide qui atteint malgré tout l'analyse

- **Si un profil invalide arrive jusqu'à l'analyse** — chargé du disque ou corrompu sans
  que la revalidation l'arrête : l'analyse **valide avant de reconstruire**, **reste
  `Uncalibrated`** et renvoie `VoiceFrame.Silence`. Valider ici n'est pas une redondance :
  reconstruire sur une plage vide ferait lever le `PitchDetector` sur le fil d'analyse
  (ci-dessus). Elle **n'invente jamais** de valeur de remplacement : un plancher artificiel
  masquerait un vrai problème derrière un nombre inventé. **Aucun profil n'arrive par le
  réseau** : le `VoiceProfile` ne quitte jamais la machine du joueur (*Formulas* §1,
  « Position, repos, et où chaque grandeur existe », décision E5).

### Extrêmes du profil vocal

- **Si `F0_habituel / 2 < 70 Hz`** — voix grave : la plage recalibrée est recadrée à
  `[70 Hz ; 2 · F0_habituel]` (*Formulas* §5, ligne « `Pitch`, voisé »). **Dégradant si non
  traité** — chercher sous 70 Hz allonge `maxLag` et rapproche la recherche d'une
  sous-harmonique. Sous `F0_habituel = 125 Hz`, ce serait même **bloquant** : la fenêtre de
  256 échantillons d'ADR-0004 ne contiendrait plus deux périodes de la note la plus grave,
  et le constructeur de `PitchDetector` refuserait la plage (`PitchDetector.cs:123–127`).
- **Si le F0 réel du joueur est sous 70 Hz** — une vraie voix de basse, rare : **limite
  documentée, non corrigée**. Le détecteur ne voit rien sous la borne basse de son domaine
  (*Formulas* §5). YIN accroche alors `2 × F0`, ou déclare la trame non voisée ; lequel des
  deux est **NON VÉRIFIABLE** sans signal. S'il accroche, `Pitch` reste cohérent autour de
  la voix habituelle et ne se trompe qu'aux hauteurs qui entrent dans la plage. S'il
  déclare non voisé, le joueur n'est pas exclu : profil `Unavailable`, selon « jamais un
  refus seul » (ci-dessous). **Dégradant.** Le correctif — une plage basse à 50 Hz — n'est
  pas retenu : `maxLag` passerait de 115 à 160, la fenêtre YIN de 256 à au moins 320
  échantillons, le tampon de hauteur de ≈ 46 à 60 ms, et le coût de YIN serait multiplié
  par ≈ 1,74 (`PitchDetector.cs:67, 123–127, 179–182`). **Déclencheur** : l'enregistrement
  d'une vraie voix de basse, dans la session de mesure hors ligne (C9).
- **Si `2 · F0_habituel > 600 Hz`** — voix aiguë : **la décimation de ce joueur passe à
  12 kHz**, et `Plafond` avec elle (*Formulas* §5, ligne « `Pitch`, voisé » ; bascule
  décidée par le système 6, `voice-calibration.md` §5). **Seulement si la branche 12 kHz
  est réalisable** pour le `SampleRate` d'entrée (*Formulas* §5, ligne « Branche de
  décimation à `R` Hz ») ; ailleurs, la bascule n'existe pas, et le contrat de fréquence
  d'échantillonnage du système 2 (C7) décide. **Bloquant si non traité** : le cri de ces
  joueurs tomberait au-dessus de la plage recalibrée, où YIN l'accroche à l'octave du
  dessous ou le déclare non voisé — un défaut d'équité qui touche d'abord les voix aiguës
  et les enfants, dans un jeu dont la mécanique centrale est de crier. **Tant que C7 n'est
  pas tranché, ce défaut reste entier partout où la branche n'existe pas.** *(La réponse
  est celle d'ADR-0004:202 : monter la cadence décimée à 12 kHz, pas élargir la plage de
  décalages.)*
- **Si `2 · F0_habituel > Plafond` même à 12 kHz** — atteignable pour tout `F0_habituel`
  au-dessus de `Plafond / 2`, jusqu'à la borne haute du domaine (§5) : la plage est
  plafonnée, et les cris au-delà de `Plafond` se lisent comme ci-dessus. **Dégradant** —
  perte documentée, à surveiller en playtest.

#### Une voix que les détecteurs lisent mal — jamais un refus seul

La règle est normative en *Formulas* §4, sous le même titre : ensembles de trames,
`PitchStatus` à trois valeurs, repli de `Rest_dB`. Ce qui suit en est l'entrée de cas
limite ; rien n'y est redéfini.

- **Condition** : à l'étape de parole posée, assez de trames franchissent `Gate_dB`, mais
  `JitterMin` ou le seuil d'apériodicité de YIN en rejettent assez pour que la porte
  complète n'atteigne pas `VoicedMin` (système 6). **Candidats, non vérifiés** (C9) : une
  parole très monotone pour le jitter, une voix soufflée pour l'apériodicité, une voix de
  basse sous 70 Hz que YIN déclare non voisée (ci-dessus).
- **Résolution** : profil **accepté** — `NoJitter` si le jitter bloquait, `Unavailable` si
  c'est l'apériodicité —, drapeau visible **« hauteur indisponible »** dans les deux cas,
  et `Rest_dB` replié sur les trames au-dessus de `Gate_dB`, ce qui garde `r' > 0`. Si même
  la porte de sonie n'est pas franchie assez souvent, ce n'est pas un détecteur qui bloque :
  **l'étape se rejoue**.
- **Sévérité** : **bloquant si non traité** — la voix serait exclue du jeu entier, pas
  seulement des mécaniques de hauteur. Traité, **dégradant pour ce joueur seulement** : ses
  mécaniques de hauteur et de note tenue peuvent être trompées (`NoJitter`) ou
  indisponibles (`Unavailable`) ; `Loudness`, donc le portage, et `Continuity` n'en
  dépendent pas.

#### Conséquence d'implémentation — et la règle de fils d'exécution qui va avec

La plage de recherche et la cadence de décimation dépendant du profil, le `Decimator` et le
`PitchDetector` sont **reconstruits à la réception du profil**, pas à la construction de
l'analyseur. Un profil `Unavailable` n'a pas de plage recalibrée à construire (*Formulas*
§4).

**Or ces objets sont à état**, et c'est là que se cache le vrai problème d'atomicité.

**Ce qui est facile.** Le `VoiceProfile` lui-même. Une **classe immuable** publiée par
affectation de référence est atomique gratuitement en .NET : `Volatile.Read` côté analyse,
`Interlocked.Exchange` côté commit, et aucune trame ne peut lire un `Floor_dB` neuf avec
un `Scream_dB` ancien.

> **Piège à écrire noir sur blanc :** « optimiser » le profil en `readonly struct` pour
> éviter une allocation **casserait l'atomicité** — l'écriture d'une structure de plusieurs
> champs n'est pas indivisible — et produirait exactement le bug qu'on voulait empêcher.
> Le profil est une **classe**, et c'est délibéré.

**Ce qui ne l'est pas.** `Decimator` porte 81 coefficients et une ligne à retard ;
`PitchDetector` deux tableaux de travail. Ils ne se remplacent pas atomiquement, et **le
fil qui commite ne doit jamais y toucher.**

**La règle :**

1. Le fil de calibration **publie la référence du profil, rien d'autre.**
2. Le fil d'analyse **lit la référence en tête de trame**, constate qu'elle a changé,
   **valide le profil** (« Un profil invalide qui atteint malgré tout l'analyse »),
   reconstruit ses propres instances, puis **pose l'enveloppe à `MinDb` et vide l'anneau**.
   Jamais l'enveloppe à 0 : en dB, 0 est la pleine échelle, et chaque reconstruction
   produirait une entrée fantôme (*Formulas* §1a).
3. Aucune trame n'est produite pendant la reconstruction : elle renvoie `Silence`.

Sans cette règle écrite, **AC-21, AC-41b et CAL-24 ne sont pas testables** — ils décrivent
une garantie dont personne ne connaît le mécanisme.

### Transitions d'état

- **Si une recalibration est lancée pendant que le joueur porte un meuble** : le nouveau
  profil est construit **dans un tampon** et ne remplace l'ancien qu'à validation complète.
  La bascule est **atomique**. **Bloquant si non traité** — le poids perçu du meuble
  changerait en pleine manipulation.
- **Si un profil est publié ou mis à jour pendant `Degraded`** : le profil est mis à jour,
  mais **l'état reste `Degraded`**. **Dégradant si non distingué** — disposer d'un profil
  valide ne signifie pas que la capture est revenue.
- **Si le micro coupe pendant une étape de calibration** : l'étape en cours est
  **annulée**, aucun profil partiel n'est committé. **Bloquant si non traité** — un champ
  jamais mesuré qui garderait la valeur par défaut d'un `float`, `0`, vaudrait la pleine
  échelle en dB : un `Scream_dB = 0` **passerait la garde et le plancher dur** sans rien
  signaler. Témoin : `Gate_dB = −43`, cri réel à −10 dBFS → `Loudness ≈ 0,84` au lieu
  de 1.

### Saturation du signal

- **Si le signal atteint le seuil d'écrêtage sur plusieurs échantillons consécutifs** —
  une détection au niveau de l'échantillon, que `Peak`, une seule valeur par fenêtre, ne
  sait pas exprimer (C6) : `Continuity` **conserve sa valeur précédente** au lieu d'être
  recalculée.
  **Bloquant si non traité** : `CrestDb` s'effondre sur un signal écrêté et `Continuity`
  monterait vers 1 — le système rapporterait « voix parfaitement tenue » sur un signal
  distordu, sans aucune alerte. On ne connaît plus la forme du signal, donc **on ne
  modifie pas ce qu'on en affirme**.
- **Le gel se relâche dès la première trame non écrêtée.** Il n'y a rien à temporiser :
  le signal est redevenu lisible, on reprend la mesure.
- **Si l'écrêtage dure au-delà de la fenêtre de gel** (*Formulas*, liste canonique) :
  `Continuity` **dérive vers 0,5** au lieu de tenir indéfiniment sa dernière valeur.
  **Dégradant si non traité** — un cri prolongé peut saturer plusieurs secondes, et geler
  une valeur extraite d'une trame vieille de trois secondes revient à affirmer avec
  certitude quelque chose qu'on ne mesure plus. Dériver vers le milieu d'échelle **affirme moins**, ce qui est la
  seule chose honnête à faire quand on ne sait pas.

> **La trame incohérente qui en résulte.** Pendant un cri saturé, la `VoiceFrame` peut
> porter simultanément `Voiced = true`, `Loudness ≈ 1` et une `Continuity` gelée ou en
> dérive — trois champs dont l'un ne décrit plus le même instant que les deux autres. Ce
> n'est pas un bug, c'est le prix assumé du gel, mais **les consommateurs doivent le
> savoir** : un système qui croise `Loudness` et `Continuity` pour décider quelque chose
> se trompera pendant ces fenêtres-là.
>
> *L'alternative serait d'ajouter un drapeau de confiance à `VoiceFrame`. Elle est écartée
> pour l'instant — elle élargit la seule surface publique de l'assembly. À rouvrir si le
> playtest montre que la fenêtre gêne réellement.*
- **`Loudness` n'est pas affectée** par l'écrêtage : il implique un signal fort, et la
  valeur est déjà bornée à 1.

### Amorçage et silence prolongé

- **Si l'anneau médian n'est pas plein** : la médiane porte sur les valeurs disponibles ;
  sur un nombre pair, elle prend **l'élément bas des deux centraux** (OQ-1, option A). La
  taille de l'anneau est **impaire par décision de ce document** (*Tuning Knobs*, « Ce qui
  n'est pas un curseur » ; valeur dans la liste canonique) : plein, la médiane est toujours un élément, jamais une moyenne de deux, ce
  qui la rend testable sans ambiguïté.
- **Si une trame est non voisée** : son `F0` **n'entre pas** dans l'anneau, qui gèle en
  interne ; le champ public `Pitch` vaut 0 (*Formulas* §2).
- **Si l'anneau reste figé au-delà de son TTL sans voisement** : il est **vidé**. Le TTL
  est EN ATTENTE (OQ-6). **Dégradant si non traité** — une reprise de parole après trente
  secondes de silence se lisserait contre une hauteur périmée.
- **L'enveloppe opère en dB bornés à [`MinDb` ; 0]** : ses états restent dans un domaine où
  les dénormaux n'ont pas de sens pratique, et aucune garde de type *flush-to-zero* n'est
  requise (*Formulas* §1a).

### Contrat d'usage — hors de `Voice.Core`

- **Si un consommateur compare deux `Tick`** : il doit employer une **différence
  modulaire**, jamais `>`. **Cosmétique en session, bloquant à long terme** — `Tick` est
  cyclique et déborde (*Formulas* §5, ligne `Tick`). Sans objet sur une partie, mais un
  process de longue durée l'atteindrait, et la comparaison directe casserait en silence.
- **Si un consommateur lit `Pitch` sans lire `Voiced`** : il prend l'absence de mesure pour
  la hauteur habituelle — 0 hors voisement n'est pas une mesure (*Formulas* §2).
  **Dégradant, et visible** : la note casse à chaque consonne dès le premier playtest ;
  c'est la panne bruyante choisie.
- **Si un consommateur compare `Loudness` à un seuil** : un recalage de `γ` déplacerait ce
  seuil en silence. Il compare des positions, via `ToPosition` (*Formulas* §1, « Position,
  repos, et où chaque grandeur existe »). **Bloquant si non traité.**

### Décision documentée — pas de `JitterMax`

Le test de jitter n'a qu'un **plancher**. Un jitter anormalement élevé — voix rauque,
éraillée — franchit donc la porte.

**C'est délibéré.** La rugosité vocale varie d'une personne à l'autre, et la plafonner
reproduirait exactement le défaut d'équité identifié sur les voix aiguës. Absence de
plafond **par décision, pas par oubli**. Côté plancher, un jitter trop faible n'exclut pas
davantage : « Une voix que les détecteurs lisent mal — jamais un refus seul », ci-dessus.

## Dependencies

### Deux notions à ne pas confondre

L'index des systèmes déclare que ce système **ne dépend de rien**. C'est vrai — et
pourtant l'analyse ne produit **rien du tout** sans le profil de calibration. Les deux
affirmations sont compatibles parce qu'il s'agit de deux dépendances différentes :

- **Dépendance de conception** — on ne peut pas *spécifier* ce système tant que l'autre
  n'est pas spécifié.
- **Dépendance d'exécution** — le système ne *produit rien* sans l'autre, une fois en marche.

Les confondre fabrique des cycles fantômes. Ce document a été écrit de bout en bout alors
qu'aucun système voisin n'avait de GDD : la dépendance de conception était bien nulle, comme
l'index l'affirme. **Les systèmes 6 et 11 en ont un désormais** (`voice-calibration.md`,
`voice-object-effect.md`). Cela n'ajoute aucune dépendance de conception — les contrats
étaient déjà écrits ici — mais rend la cohérence **bidirectionnelle** : ce qui suit est à
reporter là-bas, et une divergence se corrige dans le document qui possède la valeur,
jamais des deux côtés à la fois. Une seule convention lie les deux sens : `Rest_dB` doit
être la médiane du **même `Rms_dB` lissé** que la porte, faute de quoi `r' > 0` cesse
d'être garanti (*Formulas* §5, ligne `r'`).

### Le tableau

| Système | Nature | Sens | Interface |
|---|---|---|---|
| **6. Calibration vocale** | **DURE — exécution** | mutuelle | Fournit `VoiceProfile`. **Sans profil valide, la sortie est `Silence`** : le système ne fait littéralement rien |
| **2. Audio d'entrée** | **DURE — exécution** | il appelle | Pousse les échantillons **bruts, sans traitement**, avec leur `AnalysisTiming { DeltaSeconds, SampleRate }` (ADR-0007) ; reçoit la `VoiceFrame` |
| 3. Propagation du son | consommateur | il lit | `VoiceFrame` par joueur, à la cadence réseau |
| 12. Couche de retour local | consommateur | il lit | `VoiceFrame` **locale, avant réseau** ; `AnalyzerState` pour l'état de la capture |
| 5. Réseau | consommateur | il lit | `VoiceFrame` ; décide l'échantillonnage 50 Hz → 20–30 Hz ; achemine `r'` du client vers l'hôte |
| 11. Effet voix → objets | consommateur | il lit | Sur l'hôte : `Loudness` des `VoiceFrame` reçues, `r'` par joueur, et `ToPosition` — il compare des **positions**, jamais des `Loudness` |
| 19. UI diégétique | consommateur | il lit | `Loudness` pour le sonomètre — **ce qu'on émet, jamais ce que ça provoque** ; `AnalyzerState` pour l'icône « micro coupé » |

**Deux dépendances d'exécution, de natures différentes** : le système 2 appelle l'analyse et
la nourrit ; le système 6 conditionne sa sortie — sans profil valide, elle est `Silence`.
Aucune des deux n'est une dépendance de conception (ci-dessous). Tout le reste consomme.

### Les deux cycles apparents, et pourquoi ce n'en sont pas

**Analyse ↔ Audio d'entrée.** L'index dit que 2 dépend de 1 ; à l'exécution, 1 ne peut
rien faire sans que 2 le nourrisse. *Résolution* : `SUAC.Voice.Capture` référence
`SUAC.Voice.Core` à la compilation, mais l'analyse se **spécifie** sans que la capture le
soit — il suffit d'exiger « des échantillons accompagnés de leur intervalle réel et de
leur fréquence d'échantillonnage » (ADR-0007). C'est un flux de données, pas une
dépendance de conception.

**Analyse ↔ Calibration.** L'index dit que 6 dépend de 1 et 2 ; l'analyse ne produit rien
sans le profil de 6. *Résolution* : les deux vivent **dans la même assembly** (ADR-0006)
et consomment les mêmes primitives internes. Ce n'est pas un cycle entre modules, c'est
une collaboration interne.

### Ce que les GDD voisins doivent porter

Les règles du projet exigent une **cohérence bidirectionnelle**. Les systèmes 6 et 11 ont
un GDD : les contrats ci-dessous y sont reportés, et c'est là-bas qu'ils font loi pour les
valeurs que ces documents possèdent. Les autres s'écriront plus tard ; le contrat les
attend.

**Système 2 — Audio d'entrée**
- Pousser les échantillons accompagnés de leur **`AnalysisTiming { DeltaSeconds, SampleRate }`**
  (ADR-0007:138–141) : l'intervalle **réellement écoulé** et la fréquence du signal entrant,
  **mesurés, pas supposés**. C'est l'appelant — `SUAC.Voice.Capture` — qui les fournit, parce
  qu'il a le droit de connaître Unity (ADR-0007:169–170). **~50 Hz est un nominal, pas un
  contrat** : la chaîne absorbe l'écart (*Formulas* §1a), mais elle doit le connaître.
- **Signaler un intervalle nul, négatif ou aberrant plutôt que de le remplacer**
  (ADR-0007:176–180). Réutiliser le dernier intervalle valide rendrait le lissage faux sans
  que rien ne l'indique.
- **Livrer une fréquence d'échantillonnage dont la décimation demandée est réalisable** : le
  facteur doit être **entier**, et les deux branches — 8 kHz par défaut, 12 kHz pour les voix
  aiguës — exigent un multiple de 24 000, soit 48 ou 96 kHz parmi les fréquences courantes
  (*Formulas* §5, ligne « Branche de décimation à `R` Hz »). À défaut, **rééchantillonner sur
  la branche d'analyse**, avec une qualité de rééchantillonneur déclarée : ce travail
  appartient au système 2, pas à `Voice.Core`, qui refuse un facteur non entier à la
  construction (ADR-0007:171–175).
- **Déclarer cette fréquence, jamais la supposer.** `PitchDetector` calcule
  `F0 = SampleRate / période` (`PitchDetector.cs:162`) : croire 48 000 quand le micro délivre
  44 100 fausse **toutes les hauteurs de 8,8 %** — `12 · log2(48 000 / 44 100) ≈ 1,5`
  demi-ton, soit près d'un ton entier —, en permanence, sans exception ni `NaN`. C'est le
  phénomène des films PAL accélérés de 4 % : rien ne « plante », tout est faux.
- **Livrer le signal brut, sans aucun traitement** : ni AEC, ni VAD, ni AGC, ni suppression
  de bruit (ADR-0003:5–11).
- **Nommer et neutraliser les traitements que le jeu n'ajoute pas, mais subit.** Windows
  applique par défaut son AGC de communication et les APO du constructeur dès que la capture
  passe en **mode partagé** WASAPI ; un casque basculé en profil **Bluetooth HFP** arrive en
  bande étroite, AGC et réduction de bruit embarqués dans son firmware. Ces traitements sont
  **invisibles à l'API de capture** — aucune ligne de code du jeu ne les détecte après coup.
  Le système 2 documente donc le mode obtenu, demande au joueur de désactiver les
  « améliorations micro », et mesure la dérive de `Floor_dB` et `Scream_dB` sur 20–30 min avec
  et sans ces réglages. L'enjeu n'est pas cosmétique : un AGC en amont égalise chuchotement et
  cri, c'est-à-dire **exactement la grandeur que `Loudness` mesure**.
- **Posséder le périphérique** et le fourcher — jamais un second lecteur.
- Signaler les événements de périphérique (coupure, changement) pour que l'analyse bascule
  en `Degraded`.
- **Signaler aussi la reprise.** La sortie de `Degraded` est l'événement **« capture
  reprise »**, émis par le système 2 une fois la capture rétablie. L'analyse ne peut pas la
  déduire seule : pendant la panne elle ne reçoit rien, et « rien » ne dit pas si la capture
  est morte, en train de revenir, ou revenue.
- **Anti-rebondir ces événements avant de les signaler.** Ce document note lui-même qu'ils
  « se déclenchent souvent à tort ». Sans anti-rebond, l'état clignote entre `Calibrated`
  et `Degraded`, et le joueur voit une alerte apparaître et disparaître sans rien
  comprendre — **pire que l'un ou l'autre état tenu**. C'est le système 2 qui filtre, pas
  l'analyse : elle n'a pas l'information pour juger.
- Le crochet moteur présumé est **`AudioSettings.OnAudioConfigurationChanged`** — **à
  vérifier au POC**. La documentation Unity 6.3 ne décrit cet événement que pour le
  périphérique de **sortie** (« the user changes the default output device ») ; rien n'y
  garantit qu'il se déclenche sur un changement de périphérique de **capture**. **Repli** :
  sondage périodique de `Microphone.devices`, seul mécanisme connu côté entrée. Le choix
  entre les deux appartient au système 2 ; l'analyse n'exige qu'une chose, recevoir
  l'événement.

> **Piège Unity 6.3 pour qui implémentera ce système.** `[SerializeField]` est désormais
> **réservé aux champs** : l'appliquer à une propriété est une **erreur de compilation**,
> plus un avertissement. Pour une propriété auto-implémentée, écrire
> `[field: SerializeField]`.

**Système 6 — Calibration vocale**
- Produire `VoiceProfile` : `Floor_dB`, `Rest_dB`, `Scream_dB`, `F0_habituel` — **absent
  pour un profil `Unavailable`**, ce qui n'est pas un refus —, plus **`LowRange`** et
  **`PitchStatus`** (`Full` | `NoJitter` | `Unavailable`), portés par le profil et
  revalidés avec lui comme `LowRange` l'est déjà. Le drapeau visible **« hauteur
  indisponible »** se lève pour les deux états non `Full` (*Formulas* §4, « Une voix que
  les détecteurs lisent mal — jamais un refus seul »).
- **`Rest_dB` entre dans une formule de ce document** : il donne `r'`, la position de repos
  du joueur (*Formulas* §1, « Position, repos, et où chaque grandeur existe »), et reste
  l'ancrage de validation qui rend une calibration vérifiable comme *plausible*, et pas
  seulement comme suffisamment étalée. Le prendre sur le **même `Rms_dB` lissé** que la
  porte : c'est cette convention, et elle seule, qui garantit `r' > 0` (*Formulas* §5).
- **Suivre le repli de `Rest_dB`** : médiane sur les trames voisées `V` quand la porte
  complète tient, sur les trames au-dessus de `Gate_dB` (`G`) sinon. Les deux ensembles sont
  strictement au-dessus de la porte, donc `r' > 0` tient sur les trois chemins
  (*Formulas* §4).
- **Valider avant de committer** — refuser les profils dégénérés listés en *Edge Cases*.
  **Le refus porte sur la plage utile `Δ' = Scream_dB − Gate_dB`, jamais sur `Δ`** :
  `HardFloor_dB` et `QualityBand_dB` sont définis, valués et appliqués par le système 6
  (*Formulas* §1, « Garde et plancher dur »). Entre les deux, marquer `LowRange` au lieu de
  refuser. Et **aucun détecteur ne refuse seul** : jitter ou apériodicité donnent un
  `PitchStatus`, pas un rejet.
- **Mesurer `Floor_dB` avec une marge déclarée (`FloorMargin_dB`) au-dessus du bruit de la
  pièce.** Ce que cette marge garantit, c'est que le bruit stationnaire reste **sous
  `Gate_dB`**, donc à `Loudness = 0` : elle ferme l'entrée fantôme. Elle ne traite pas le
  vacillement de la voix juste au-dessus de la porte — aucun seuil ne le traite, il est
  déplacé, pas supprimé (*Formulas* §1, « Le vacillement à la porte — déplacé, pas
  supprimé ») —, et une marge plus grande l'aggraverait en rétrécissant `Δ'`.
- **Caler le seuil de détection de plateau sur le seuil de validation**, pas
  indépendamment. Sinon un plateau reconnu trop tôt produit une plage utile sous le
  plancher dur, et le profil est refusé alors que le joueur a coopéré.
- **Persister le profil entre les sessions.** *(Ce besoin de persistance était signalé
  comme sans propriétaire dans l'index des systèmes — il revient ici.)*
- Être **relançable à tout moment**, depuis le lobby comme en jeu.
- Basculer **atomiquement** : nouveau profil en tampon jusqu'à validation complète.
- Annuler proprement une étape si le micro coupe en cours de calibration.
- **Décider la cadence de décimation** à partir du profil — 12 kHz pour les voix aiguës,
  **quand l'entrée le permet** : la branche n'existe que si le `SampleRate` livré par le
  système 2 est un multiple entier de 12 000 (*Formulas* §5). Sinon la plage recalibrée
  reste bornée par le plafond de la branche 8 kHz.

**Système 5 — Réseau**
- Décider l'échantillonnage 50 Hz → 20–30 Hz. Ce n'est pas à Core de le faire.
- **Acheminer `r'` vers l'hôte** — un flottant dont le domaine est `]0 ; 1[` (*Formulas*
  §5), calculé sur le client à chaque commit de profil — **à la connexion et après chaque
  recalibration**. **C'est la
  seule grandeur du profil qui voyage** : le `VoiceProfile` ne quitte jamais la machine du
  joueur (décision E5). **Routage en attente** : ADR-0003:337 transmet encore « la
  calibration » entière et son amendement n'est pas écrit — tant qu'il ne l'est pas, la
  comparaison côté hôte n'a pas de donnée pour tourner (*Formulas* §1, tableau « où chaque
  grandeur existe »).
- Comparer les `Tick` par **différence modulaire**, jamais par `>` : `Tick` est un `uint`
  cyclique qui compte les **appels**, pas le temps (`VoiceFrame.cs:89` ; bornes et
  débordement en *Formulas* §5). Sous cadence variable, un écart de `Tick` ne traduit donc
  pas un intervalle constant — c'est un compte de trames manquantes, pas une durée.

**Système 11 — Effet voix → objets**
- Lire `Loudness` dans les `VoiceFrame` reçues, **sur l'hôte**. Aucune valeur brute ne lui
  parvient : ni dB, ni Hz, ni profil.
- **Comparer des positions, jamais des `Loudness`** : `x'_i = ToPosition(Loudness_i)` contre
  `T_objet · r'_i`, forme recommandée. `ToPosition` et `r'` sont définis en *Formulas* §1,
  « Position, repos, et où chaque grandeur existe » ; les seuils `T_objet` appartiennent à
  `voice-object-effect.md`.
- **Ne jamais détenir une seconde copie de `γ`** : la conversion passe par `ToPosition`, qui
  applique le `γ` de la configuration locale. L'exactitude suppose que le `γ` de l'hôte soit
  celui du client, ce qu'aucun ADR ne garantit encore — la réplication des curseurs reste à
  décider.
- **Le zéro est commun** : `Loudness = 0` dès que `Rms_dB ≤ Gate_dB` (*Formulas* §1). Un
  seuil du système 11 placé sous cette porte ne se déclencherait jamais — sous elle, il n'y
  a rien à lire, pas même un frémissement.

**Système 12 — Couche de retour local**
- Consommer la `VoiceFrame` **locale, avant réseau** — même instance et même trame que le
  réseau. Pas de calcul dupliqué.
- Lire `AnalyzerState` pour le retour local : l'état ne voyage pas dans la trame, c'est une
  propriété de l'analyseur (*States and Transitions*).

**Système 19 — UI diégétique**
- Le sonomètre lit `Loudness` — **ce que le joueur émet, jamais ce que ça provoque**.
- **Lire `AnalyzerState`** et porter l'icône **« micro coupé »** : non diégétique, visible du
  seul joueur concerné, affichée tant que la capture est perdue. Aucun sens corporel ne
  détecte un micro mort, et le sonomètre ne se lit que sur les autres — sans cette icône, le
  joueur croit qu'il n'a pas assez crié.
- Concevoir l'**option d'accessibilité, désactivée par défaut**, qui affiche au joueur son
  propre volume. Le principe est acquis (décision F3) ; la forme appartient à ce GDD.

## Tuning Knobs

### L'arbitrage à exposer avant tous les autres

La section *Player Fantasy* a nommé une tension qui gouverne tout ce réglage :

> **L'attribution veut de la stabilité, le contrôle veut de la réactivité.**

Lisser davantage supprime l'injustice — et supprime la vivacité avec elle. Ces curseurs ne
doivent pas figer un compromis implicite : **ils doivent rendre l'arbitrage visible et
réglable.**

### Les curseurs

**Les valeurs provisoires et leurs plages sûres ne s'écrivent pas ici.** Elles vivent dans
la liste canonique (*Formulas*, « Porte de mesure — la liste canonique des valeurs
provisoires »), avec leur propriétaire et la mesure qui les fixera. Ce tableau dit la seule
chose que la liste ne dit pas : **ce qu'on casse en tournant le curseur**, dans un sens et
dans l'autre.

| Curseur | Trop haut | Trop bas |
|---|---|---|
| `γ` — exposant perceptif | vers 1,0 : le chuchotement s'écrase, tout le registre bas devient indistinct | le moindre souffle au-dessus de la porte sature vers 1, plus de nuance dans les forts |
| `MinDb` — plancher de conversion | il remonte dans le bruit des pièces les plus silencieuses, et `Floor_dB` ne peut plus descendre assez bas (*Formulas* §5, ligne `RawRms_dB`, `Rms_dB`) | aucun effet audible : c'est une borne de sécurité, pas un réglage de ressenti |
| `Margin_dB` — porte de voisement **et** zéro de `Loudness` | le chuchotement chanté est coupé, et le chuchotement phonétique devient invisible : il pèse exactement 0 | le bruit de fond et la respiration franchissent la porte, l'objet frémit tout seul, et le silence collectif du système 11 devient inatteignable |
| `CrestMinDb` | une voyelle tenue cesse d'être lue comme régulière | tout devient « tenu », les percussifs disparaissent |
| `CrestMaxDb` | un claquement de langue ne descend jamais à 0 | tout son un peu dynamique est lu comme percussif |
| `JitterMin` | une voix très stable, tenue et posée, est rejetée comme un bourdonnement | un ronflement de frigo passe pour une voix |
| `N` — fenêtre de jitter | réaction plus lente à un changement de source | variance trop bruitée pour discriminer |
| Attaque de l'enveloppe (`τ`) | le cri met du temps à se voir : le joueur ne sent plus sa voix comme un geste | le poids du meuble vibre sur chaque syllabe |
| Relâchement de l'enveloppe (`τ`) | le meuble reste lourd longtemps après le cri | clignotement lourd/léger entre deux mots |
| Facteur `LowRange`, sur `τ` | un joueur à plage étroite joue au ralenti : le lissage mange son geste | le drapeau redevient décoratif — profil marqué, lissage inchangé |
| Fenêtre de gel sur écrêtage | `Continuity` affirme trop longtemps une valeur périmée sur un cri tenu | dérive vers 0,5 dès un cri normal, on perd l'information |
| TTL de l'anneau médian | reprise de parole lissée contre une hauteur périmée | anneau vidé trop souvent, filtre médian inopérant |
| Taille de l'anneau médian | latence de réaction à un vrai changement de hauteur | erreurs d'octave non filtrées |
| Cadence de décimation *(ADR-0004)* | **surcoût non mesuré** sur YIN | le cri des voix aiguës sort de la plage de recherche |

**Une ligne de ce tableau n'attend pas de mesure.** La cadence de décimation est tranchée par
ADR-0004 (*Formulas*, « Décisions d'ADR-0004 ») : la tourner, c'est rouvrir l'ADR, pas régler
un curseur.

**Le plancher dur et la bande de qualité ne sont pas des curseurs de ce document.** Ils sont
définis, chiffrés et appliqués par le système 6 — `voice-calibration.md`, *Formulas*, « Porte de mesure du système 6 » —
et ils portent sur la plage utile `Δ' = Scream_dB − Gate_dB` (*Formulas* §1, « Garde et
plancher dur »).

**Les constantes d'enveloppe se règlent à l'oreille.** Elles gouvernent le ressenti « ma voix
est un geste », et le relâchement gouverne à lui seul « le meuble s'allège quand je me
tais » : le prototype navigateur les mesure en dB sous `c = exp(−Δt / τ)` (B4).

**Le facteur `LowRange` vient du système 6.** Le `VoiceProfile` porte un drapeau `LowRange`,
levé quand la plage utile `Δ'` du joueur passe le plancher dur sans atteindre la bande de
qualité (`voice-calibration.md`). L'`EnvelopeFollower` multiplie alors ses **constantes de
temps `τ`**, jamais le coefficient `c` (*Formulas* §1a). Sans cela le drapeau est décoratif :
un profil marqué, un lissage inchangé, et l'inclusion qu'on croyait avoir gagnée reste sur le
papier. C'est le seul réglage de ce document qui dépend du profil du joueur plutôt que d'une
valeur globale — la contrepartie assumée d'accepter les registres étroits au lieu de les
refuser. Sa forme, palier ou progression continue, se tranche après la mesure B5.

#### `Margin_dB` règle deux frontières avec un seul nombre

`Margin_dB` place la porte de voisement (*Formulas* §4) **et** le zéro de `Loudness`
(*Formulas* §1) : `Gate_dB = Floor_dB + Margin_dB` est lu sur le même `Rms_dB` lissé de la
même trame. Le tourner déplace donc les deux frontières à la fois, et c'est voulu — **un seul
point de départ**, partagé par les systèmes 1, 6 et 11.

**La scission reste possible, et son déclencheur est nommé.** La mesure B1 du prototype dit où
tombent un vrai chuchotement, la respiration, le clavier et les bruits de bouche par rapport à
la porte. Si le chuchotement se loge entre la respiration et la porte, on descend **seul** le
zéro de sonie — `Margin_sonie < Margin_voisement` — et la porte de voisement ne bouge pas ;
sinon le prix est accepté. Les deux branches sont écrites en *Formulas* §1, « Pourquoi le zéro
se place à `Gate_dB` » ; ce tableau ne les recopie pas. **Tant que la mesure n'a pas eu lieu,
il n'y a qu'un nombre à régler.**

**Conformité au principe des seuils personnels.** La part personnelle du seuil est `Floor_dB`,
mesuré chez le joueur par le système 6. `Margin_dB` reste une constante, et le principe
l'autorise parce qu'elle **détecte du bruit, elle ne juge pas une voix** (*Formulas* §1).

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

**`γ` contre `Margin_dB`.** Ils ne se disputent plus le même terrain, mais ils se
multiplient. `Margin_dB` fixe **où commence** la plage utile et la raccourcit d'autant
(`Δ' = Scream_dB − Gate_dB`) ; `γ` ne fait que **redistribuer ce que la marge a laissé** — il
ne restitue rien de ce qui passe sous la porte, où `Loudness` vaut exactement 0. Monter la
marge rétrécit `Δ'`, donc chaque dB pèse plus lourd, **y compris le vacillement trame à trame
au voisinage de la porte** (*Formulas* §1, « Le vacillement à la porte ») ; descendre ensuite
`γ` pour étirer le bas amplifie ce vacillement au lieu de gagner en finesse. **Ces deux-là se
règlent ensemble ou pas du tout** — avec une asymétrie à garder en tête : `Margin_dB` déplace
des seuils, `γ` n'en déplace aucun, puisque tout seuil aval compare des positions et jamais
des `Loudness` (*Formulas* §1, « Position, repos, et où chaque grandeur existe »).

**`CrestMinDb` contre l'écrêtage.** L'écrêtage gèle `Continuity` ; plus la borne basse est
haute, plus la zone gelée devient fréquente **sur les cris**, là où le signal sature le plus.

### Ce qui n'est pas un curseur

Ces valeurs ressemblent à des réglages et n'en sont pas :

- **L'intervalle entre deux trames** — ce n'est pas un curseur parce que c'est une **donnée
  d'entrée** : chaque appel porte son `AnalysisTiming { DeltaSeconds, SampleRate }`
  (ADR-0007, *Accepted*), et les constantes de temps de l'enveloppe s'expriment en secondes
  (*Formulas* §1a). Les ~50 Hz de la chaîne sont un ordre de grandeur nominal, pas un
  contrat ; un intervalle nul, négatif ou aberrant est **signalé, jamais substitué**
  (AC-14d).
- **La parité de l'anneau médian** — impaire obligatoire, **par décision de ce document** et
  non d'ADR-0004 (qui n'écrit que « ~5 trames ») : la médiane est alors toujours un élément et
  jamais une moyenne de deux. Sa **taille**, elle, est provisoire (liste canonique). Sans ça, la définition devient ambiguë et le
  test avec.
- **Le seuil d'apériodicité de YIN** — fixé par la littérature et arbitré en ADR-0004
  (valeur en *Formulas*, « Décisions d'ADR-0004 »). Le toucher, c'est rouvrir un ADR.

**Règle générale de report.** Ce document diffère plusieurs décisions, et c'est légitime —
mais un report n'est acceptable que s'il porte **une valeur provisoire, un déclencheur nommé,
et un propriétaire**. Sans les trois, ce n'est pas un report, c'est un trou avec un paragraphe
dessus. **Les reports incomplets** — propriétaire et déclencheur nommés, valeur absente — sont
marqués **EN ATTENTE** et non PROVISOIRE dans la liste canonique (*Formulas*, « Porte de
mesure »), qui en est la seule énumération.

## Visual/Audio Requirements

Ce système ne produit ni image ni son. Il transforme un micro en une `VoiceFrame`. Ses
exigences existent pourtant dans les deux domaines, et elles vont en sens inverse : côté
audio, ce sont des **interdits sur le trajet du signal** ; côté visuel, c'est ce que le
joueur voit d'une voix — **presque rien de la sienne, l'essentiel de celle des autres**.

### Les interdits sur le trajet du signal

Tout traitement situé en aval de la fourche du signal (ADR-0003) reste sur la branche **chat
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

**Non.** Le jeu n'injecte pas de retour de la voix du joueur.

La raison n'est pas le coût, elle est l'attribution. Un sidetone donnerait au joueur une
**seconde référence de sa propre voix, à une latence différente de celle sur laquelle le
jeu agit**. Deux retours désaccordés du même geste, c'est précisément la confusion que ce
système existe pour éviter.

**Et rien de visuel ne compense ce refus.** Le Sonomètre est *« collé sur le torse »* du
personnage, *« porté par tous, et lisible par tous »* (GDD canonique § 2.4.5) : **on lit celui
des autres, jamais le sien.** Hors l'icône « micro coupé » ci-dessous, **le joueur n'a aucun
retour instrumenté sur sa propre voix.** Ce n'est pas un manque à combler, c'est la structure
du jeu : **la connaissance de soi est proprioceptive, la connaissance des autres est
instrumentée.** Ce qui renseigne un joueur sur son propre écart n'est pas un cadran — c'est
**la réaction de l'objet qu'il porte**, donc le système 11. Le refus du sidetone tient, et son
coût se paie en entier.

### `Degraded` ne doit pas se lire sur un sonomètre à zéro

`Loudness = 0` parce que le micro est coupé et `Loudness = 0` parce que le joueur se tait
sont **indiscernables**. Le joueur parle, rien ne bouge, et il accuse le jeu — l'échec
d'attribution que *Player Fantasy* interdit nommément. Le sonomètre ne peut pas lever
l'ambiguïté pour l'intéressé, **puisqu'il ne le lit pas**.

- **Une icône « micro coupé », visible du seul joueur concerné, non diégétique** (décision
  F3). Aucun sens corporel ne détecte un micro mort : c'est la seule exception assumée à « la
  connaissance de soi est proprioceptive ». Elle est affichée tant que la capture est perdue.
- **Sans lissage**, dès l'événement du système 2. C'est un drapeau d'état, pas une mesure :
  contrairement à l'enveloppe, il n'a aucune raison de traîner.
- **Côté coéquipiers**, le sonomètre doit afficher un état **visuellement distinct de « il se
  tait »**. Un sonomètre à zéro ne suffit pas : l'ambiguïté existe aussi pour eux, et c'est
  elle qu'il faut lever.
- **Une option d'accessibilité, désactivée par défaut, affiche au joueur son propre volume.**
  Le principe est acquis (décision F3) ; elle sert d'abord les joueurs sourds et
  malentendants, qui n'entendent pas leur propre voix. **Sa conception appartient au
  système 19**, pas à ce document (*Dependencies*).
- Une alerte sonore non diégétique discrète est **recommandée en complément**, à arbitrer
  avec le `sound-designer` et l'UI. Ce n'est pas une exigence audio à elle seule.

### Ce que le joueur doit voir de sa mesure

Les champs de mesure de la trame (`Loudness`, `Pitch`, `Continuity`, `Voiced` ; `Tick` n'est
pas une mesure) ne méritent pas le même traitement — et **aucun n'est affiché au joueur qui
le produit**. Le seul retour qu'il reçoit sur lui-même porte sur l'état de
l'analyseur, pas sur sa voix.

| Valeur | Retour | Raison |
|---|---|---|
| `Loudness` | **Permanent, chez les autres** — le sonomètre du système 19, lu par les coéquipiers, **jamais par soi** | La connaissance de soi est proprioceptive ; ce qui renseigne le joueur sur son propre écart, c'est la réaction de l'objet qu'il porte (système 11) |
| `Continuity` | **Contextuel** — sur les objets qui l'exigent | Un affichage permanent dupliquerait le sonomètre pour une information secondaire |
| `Pitch` | **Contextuel** — sur les mécaniques qui l'utilisent | Un affichage permanent en ferait un curseur qu'on regarde, ce qui contredit « la voix comme geste » |
| `Voiced` | **Aucun** | C'est une porte interne. L'exposer inviterait à surveiller une lampe plutôt qu'à écouter sa propre voix |
| `AnalyzerState` *(hors trame)* | **Permanent, pour soi seul** — icône « micro coupé », non diégétique, sans lissage | Un micro mort ne se sent pas. Sans ce retour, le joueur conclut qu'il n'a pas assez crié |

L'option d'accessibilité ci-dessus est **le seul chemin par lequel un joueur peut voir son
propre `Loudness`**, et elle est désactivée par défaut : la ligne du tableau vaut telle quelle
pour tout le monde tant qu'on n'y touche pas.

### Larsen et contamination croisée

**Garanti sur le chemin réseau.** Chaque `VoiceFrame` n'analyse que **la capture locale du
joueur**. Aucun mixage serveur, aucune capture d'un autre client n'entre jamais dans une
chaîne d'analyse **par le réseau**.

**Aucune annulation d'écho ne protège l'analyse, et ce ne sera pas corrigé.** L'AEC de
Dissonance s'applique en aval de la fourche, sur sa propre branche de transmission ; la
branche d'analyse n'en reçoit aucune (ADR-0003, décision du 2026-09-08, option A). Par voie
acoustique, sur haut-parleurs, la voix des autres entre donc bel et bien dans l'analyse — et
**nos trois défenses la laissent passer**, puisqu'une vraie voix humaine franchit la porte de
volume, est déclarée voisée par YIN, et jitte comme il faut. **Il n'existe pas de
discriminant.** C'est la raison pour laquelle **le casque est un prérequis du jeu** et non un
conseil.

**Gratuit.** Le larsen est déjà couvert sans effort supplémentaire : un effet Larsen est
**quasi parfaitement périodique**, il tombe donc sous le test de jitter au même titre qu'un
ronflement électrique. La porte de voisement le rejette par construction.

**Non garanti, et le casque n'y peut rien.** Deux joueurs dans la même pièce : le micro de
l'un capte la voix de l'autre, qui lui arrive **par l'air et non par les haut-parleurs** — le
prérequis du casque ne règle donc pas ce cas. **Aucun DSP ne sépare deux voix captées par le
même micro** : ce n'est pas un manque d'ingénierie, c'est le problème lui-même. Il n'y a pas
de réponse à ce stade, et il ne faut pas en improviser une. Ce qu'il faut, ce sont des
données : le premier test à plusieurs comporte une **session en même pièce, casque sur les
deux**, dont la mesure est celle-ci — la voix de A, captée par le micro de B, franchit-elle
le `Gate_dB` de B ? La condition est bloquante et sa durée appartient à `mvp-scope.md`
(décision 10).

---

## UI Requirements

**Ce système n'a pas d'interface.** Il transforme un micro en une `VoiceFrame`, et rien de ce
qu'il produit n'est affiché par lui.

- **Le parcours de calibration et ses écrans** appartiennent au système 6 :
  `voice-calibration.md`, *UI Requirements*.
- **Le sonomètre, l'icône « micro coupé » et l'option d'accessibilité** appartiennent au
  système 19, qui les conçoit ; ce document n'écrit que ce qu'ils doivent rendre lisible, et
  le contrat qu'il leur passe est en *Dependencies*.
- **Ce qui reste ici** n'est pas une interface mais une **exigence de retour** : ce que le
  joueur doit voir de sa propre mesure, et pourquoi `Degraded` ne peut pas se lire sur un
  sonomètre à zéro. Les deux vivent en *Visual/Audio Requirements*.

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

> **Les valeurs attendues se dérivent, elles ne se recopient pas.** Certains critères de
> cette section n'ont la valeur annoncée que pour un jeu précis de valeurs provisoires
> (*Formulas*, « Porte de mesure — la liste canonique des valeurs provisoires ») : AC-01 ne
> donne ≈ 0,546 que si `γ = 0,65` **et** `Margin_dB = 7` — la porte, donc le zéro, dépend de
> la seconde —, et AC-04 ne donne 0,87 que si `CrestMinDb = 8` et `CrestMaxDb = 20`. Les
> écrire en dur ferait exactement ce qu'AC-43 et AC-44 interdisent — transformer un pari en
> acquis, dans le document qui l'interdit.
>
> **Règle : le test calcule sa valeur attendue à partir des constantes nommées**, et les
> nombres ci-dessous sont des repères de lecture, pas des littéraux à copier. Quand une
> constante bouge après mesure, ces critères suivent **sans être réécrits**.

| # | Critère | Type |
|---|---|---|
| AC-01 | GIVEN `Floor_dB = −50`, `Margin_dB` et `Scream_dB = −10` WHEN `Rms_dB = −30` THEN `Loudness = ((Rms_dB − Gate_dB) / (Scream_dB − Gate_dB))^γ`, valeur attendue **calculée depuis les constantes** — repère de lecture ≈ 0,546 avec `Margin_dB = 7` et `γ = 0,65` (± 0,005) | `[UNIT]` |
| AC-02 | GIVEN `Rms_dB ≤ Gate_dB` THEN `Loudness = 0` — **le seul zéro du système**, et il n'est pas au plancher de la pièce. Frontière obligatoire : `Rms_dB = Gate_dB` donne exactement 0, `Rms_dB = Gate_dB + ε` donne une valeur strictement positive. GIVEN `Rms_dB ≥ Scream_dB` THEN `Loudness = 1` — jamais de dépassement des bornes | `[UNIT]` |
| AC-03 | GIVEN `F0_habituel = 120` WHEN `F0 = 240` THEN `Pitch = +12,0` ; WHEN `F0 = 90` THEN `Pitch = −4,98` (± 0,01) | `[UNIT]` |
| AC-04 | GIVEN `Peak / Rms = 3` THEN `CrestDb = 9,54` et `Continuity = 0,87` (± 0,005) | `[UNIT]` |
| AC-05 | GIVEN `Rms = 0` THEN `Continuity = 0` — sans division par zéro, sans NaN propagé dans la `VoiceFrame` | `[UNIT]` |
| AC-06 | GIVEN `CrestDb ≤ CrestMinDb` THEN `Continuity = 1` ; GIVEN `CrestDb ≥ CrestMaxDb` THEN `Continuity = 0` | `[UNIT]` |
| AC-07 | GIVEN n'importe quelle entrée finie THEN aucun champ de la `VoiceFrame` n'est NaN ni infini | `[UNIT]` |

### B — Porte de voisement

| # | Critère | Type |
|---|---|---|
| AC-08 | GIVEN les trois conditions vraies (YIN voisé, `Rms_dB > Gate_dB`, `JitterPct > JitterMin`) THEN `Voiced = true` | `[UNIT]` |
| AC-09 | GIVEN l'une des trois conditions fausse THEN `Voiced = false` — **un test par condition**, les deux autres tenues vraies | `[UNIT]` |
| AC-10 | GIVEN moins de `N` périodes disponibles THEN le test de jitter **passe par défaut** et n'annule pas `Voiced` à lui seul | `[UNIT]` |
| AC-11 | GIVEN une série de périodes de variance ≈ 0,05 % à niveau fort (ronflement) THEN `Voiced = false` **malgré le niveau** | `[UNIT]` |
| AC-11b | GIVEN un profil `NoJitter` THEN la porte vaut `IsVoiced_YIN AND Rms_dB > Gate_dB` — le test de jitter est **désactivé pour ce joueur**, et `Pitch` reste disponible ; GIVEN un profil `Unavailable` THEN `Voiced = false` et `Pitch = 0` sur **toute** trame, même chantée. Dans les deux cas `Loudness` et `Continuity` sont inchangées (*Formulas* §4) | `[UNIT]` |

### C — Cadence, lissage, `Tick`

| # | Critère | Type |
|---|---|---|
| AC-12 | GIVEN une trame traitée THEN `Tick` s'incrémente d'exactement 1 — y compris quand la sortie est `Silence` | `[UNIT]` |
| AC-13 | GIVEN deux `Tick` A et B WHEN on les ordonne THEN la comparaison se fait par **différence modulaire sur `uint`** (`(int)(B − A) > 0`) et reste correcte au passage `uint.MaxValue → 0` | `[UNIT]` |
| AC-14 | GIVEN un échelon injecté **à intervalle constant** THEN le temps de montée de l'`EnvelopeFollower` correspond à la constante de temps déclarée (± 10 %), **mesuré dans le domaine dB** — le lissage opère en décibels (*Formulas* §1a) | `[UNIT]` |
| AC-14b | GIVEN `Rms = 0` THEN `Rms_dB` vaut le plancher `MinDb` et **ne diverge pas** vers −∞ | `[UNIT]` |
| AC-14c | GIVEN un `SampleRate` dont la décimation demandée ne donnerait pas un facteur entier THEN la construction **échoue explicitement** — jamais d'arrondi silencieux | `[UNIT]` |
| AC-14d | GIVEN un intervalle nul, négatif ou aberrant THEN la trame est **signalée**, et aucune valeur n'est substituée en silence | `[UNIT]` |
| AC-14e | GIVEN le **même échelon** injecté à deux cadences d'appel différentes THEN le temps de montée mesuré en dB est **le même** (± 10 %) — ce que garantit `c = exp(−Δt / τ)` et qu'une cadence supposée ne garantit pas ; GIVEN une réinitialisation ou une reconstruction THEN l'enveloppe repart de `MinDb`, **jamais de 0**, qui est la pleine échelle et ferait valoir `Loudness = 1` à la première trame de silence. **EN ATTENTE** de la migration de l'`EnvelopeFollower` vers un `Δt` par appel (*Formulas* §1a) | `[UNIT]` |
| AC-16 | GIVEN l'anneau médian **plein** WHEN un point aberrant isolé entre THEN il n'apparaît pas en sortie ; GIVEN un anneau de taille paire passé au constructeur THEN la construction **échoue** | `[UNIT]` |

### D — États et profil

| # | Critère | Type |
|---|---|---|
| AC-17 | GIVEN l'état `Uncalibrated` THEN chaque appel renvoie `VoiceFrame.Silence(tick)` **et `Tick` avance quand même** | `[UNIT]` |
| AC-18 | GIVEN `Calibrated` WHEN le micro se coupe ou change de périphérique THEN état `Degraded`, sortie `Silence`, `Tick` continue, **profil conservé intact** | `[UNIT]` |
| AC-19 | GIVEN un changement de périphérique THEN **aucune recalibration n'est déclenchée** et le profil reste valide | `[UNIT]` |
| AC-20 | GIVEN `Degraded` WHEN un nouveau **profil** valide est reçu THEN le profil est mis à jour **sans repasser `Calibrated`** — recevoir un profil ne prouve pas que la capture est revenue | `[UNIT]` |
| AC-20b | GIVEN `Degraded` WHEN le système 2 émet l'événement **« capture reprise »** THEN l'état repasse `Calibrated`. **Ce critère et AC-20 se lisent ensemble** : un profil ne rétablit pas `Calibrated`, l'événement de reprise si | `[UNIT]` |
| AC-20c | GIVEN une série d'événements de périphérique en rafale THEN l'état ne bascule pas à chaque événement : l'anti-rebond du système 2 les absorbe. Un `Calibrated ⇄ Degraded` clignotant est pire que l'un ou l'autre état | `[INTEG]` |
| AC-21 | GIVEN un joueur portant un meuble WHEN une recalibration aboutit THEN le basculement est **atomique** : aucune trame ne combine l'ancien `Floor_dB` avec le nouveau `Scream_dB` | `[UNIT]` |
| AC-22 | GIVEN un profil calibré en session 1 WHEN le joueur revient en session 2 THEN il rejoint une partie **sans recalibrer** | `[INTEG]` |

> **Deux critères ont un seul propriétaire, et ce n'est pas ce document.** L'entrée en
> partie sans profil calibré — CAL-32 — et l'accès à la calibration depuis les
> menus lobby et en jeu — CAL-55 — sont des critères de la calibration : ils vivent dans
> `voice-calibration.md`, et ne sont plus redoublés ici. Ce document ne teste que ce que
> `Voice.Core` produit.

### E — Validation du profil

| # | Critère | Type |
|---|---|---|
| AC-25 | GIVEN une **plage utile** `Δ' = Scream_dB − Gate_dB` sous `HardFloor_dB` THEN le commit est **refusé** ; GIVEN `HardFloor_dB ≤ Δ' < QualityBand_dB` THEN le profil est **accepté et marqué `LowRange`**, avec lissage renforcé. L'écart se calcule sur `Δ'`, **jamais sur `Scream_dB − Floor_dB`** ; les deux seuils appartiennent au système 6 (`voice-calibration.md`) et sont lus depuis leurs constantes nommées, jamais recopiés | `[UNIT]` |
| AC-26 | GIVEN `Scream_dB ≤ Gate_dB` THEN le commit est **refusé** — le dénominateur `Δ'` inverse `x'` ou le réduit à une marche, sans produire ni NaN ni erreur (*Formulas* §1). Cas obligatoires : `Scream_dB = Gate_dB`, `Floor_dB < Scream_dB < Gate_dB`, et `Floor_dB > Scream_dB` comme cas particulier | `[UNIT]` |
| AC-26b | GIVEN `CrestMaxDb ≤ CrestMinDb` THEN la configuration est **refusée au chargement** — même classe de retournement silencieux qu'AC-26, sur l'autre dénominateur du document | `[UNIT]` |
| AC-26c | GIVEN un `γ` hors de sa plage sûre (liste canonique) — cas obligatoires `γ = 0`, `γ < 0`, et une valeur juste hors de chaque borne, calculées depuis les constantes nommées — THEN la configuration est **refusée au chargement**. Sans ce refus, `Loudness = 0^0 = 1` sur du silence et `ToPosition` divise par zéro (*Formulas* §1, « Position, repos, et où chaque grandeur existe ») | `[UNIT]` |
| AC-27 | GIVEN un profil **chargé du disque** portant un `F0_habituel` hors du domaine du détecteur (*Formulas* §5, ligne « `F0_habituel`, et tout `F0_Hz` non calibré ») THEN il est **refusé au chargement**, et l'analyse reste `Uncalibrated`. **Témoin : un fichier corrompu ou édité sur disque** — une calibration ne produit pas une hauteur que son détecteur ne sait pas mesurer. Cas obligatoires : `0,01`, `0`, une valeur non finie, et une valeur juste hors de chaque borne ; les bornes se calculent depuis les constantes du détecteur, jamais recopiées. Un profil `Unavailable` **ne porte pas** de `F0_habituel` : une valeur absente n'est pas une valeur hors domaine, et ce n'est pas un refus | `[UNIT]` |
| AC-27b | GIVEN une étape de parole posée où assez de trames franchissent `Gate_dB`, mais où `JitterMin` ou le seuil d'apériodicité en rejettent assez pour que la porte complète n'atteigne pas `VoicedMin` THEN le profil est **accepté** — `NoJitter` si le jitter bloquait, `Unavailable` si c'est l'apériodicité —, le drapeau « hauteur indisponible » est levé dans les deux cas, et `Rest_dB` est replié sur les trames au-dessus de `Gate_dB`, donc `r' > 0`. **Aucun détecteur ne refuse un profil à lui seul** (*Formulas* §4) | `[INTEG]` |
| AC-28 | GIVEN un profil invalide transmis malgré tout à l'analyse THEN l'état **reste `Uncalibrated`** — aucune valeur substituée, aucun défaut inventé | `[UNIT]` |
| AC-29 | GIVEN le micro coupé pendant la calibration THEN l'étape est annulée et **aucun profil partiel** n'est écrit | `[UNIT]` |
| AC-30 | GIVEN un `F0_habituel` dont la moitié tombe sous la borne basse de la plage non calibrée THEN la plage recalibrée est recadrée en bas sur cette borne, selon *Formulas* §5 (ligne « `Pitch`, voisé ») ; les bornes se calculent depuis les constantes du détecteur, jamais recopiées | `[UNIT]` |
| AC-31 | GIVEN `2 · F0_habituel` au-dessus du plafond de la plage non calibrée (*Formulas* §5) **et une branche 12 kHz réalisable pour le `SampleRate` d'entrée** (*Formulas* §5, ligne « Branche de décimation à `R` Hz ») THEN la décimation de **ce joueur** passe à 12 kHz, ET un cri à `F0_habituel × 2` reste **voisé** — le critère d'équité des voix aiguës. Là où la branche n'existe pas, c'est le contrat de fréquence d'échantillonnage du système 2 qui décide, et le critère n'a rien à vérifier | `[UNIT]` |

### F — Robustesse du signal

| # | Critère | Type |
|---|---|---|
| AC-32 | GIVEN `Peak` saturé sur plusieurs échantillons consécutifs THEN `Continuity` **gèle sa dernière valeur** au lieu de suivre un `CrestDb` faussé | `[UNIT]` |
| AC-32b | GIVEN un écrêtage qui cesse THEN `Continuity` **reprend la mesure dès la première trame non écrêtée** — le gel ne se temporise pas au relâchement | `[UNIT]` |
| AC-32c | GIVEN un écrêtage **prolongé au-delà de la fenêtre de gel** THEN `Continuity` dérive vers 0,5 au lieu de tenir indéfiniment une valeur périmée | `[UNIT]` |
| AC-32d | GIVEN une trame de cri saturé THEN elle peut légitimement porter `Voiced = true`, `Loudness ≈ 1` et une `Continuity` gelée — **la trame est incohérente par conception**, et ce critère existe pour que personne ne la traite comme un bug | `[UNIT]` |
| AC-33 | GIVEN écrêtage THEN `Loudness` **n'est pas gelée** — elle est déjà bornée à 1 et un signal écrêté est fort | `[UNIT]` |
| AC-34 | GIVEN une trame non voisée THEN son `F0` **n'entre pas dans l'anneau**, qui **gèle en interne**, ET le champ public `VoiceFrame.Pitch` vaut **0** (`VoiceFrame.cs:103`). **0 hors voisement n'est pas une mesure, c'est l'absence de mesure : lire `Voiced`** | `[UNIT]` |
| AC-35 | GIVEN l'anneau figé au-delà du TTL sans voisement THEN il est **vidé** ; la reprise de parole ne se lisse pas contre une hauteur périmée. **EN ATTENTE** — le TTL n'a pas de valeur (OQ-6) | `[UNIT]` |

### G — Les ressentis, traduits

Chacun de ces critères tient une promesse nommée en *Player Fantasy*. Ils ont un versant
automatisable et un versant humain ; les deux sont listés.

| # | Critère | Type |
|---|---|---|
| AC-36 | **« Le jeu entend mon chuchotement, pas du silence. »** GIVEN un signal chuchoté au-dessus de `Gate_dB` THEN `Loudness > 0` **même si `Voiced = false`** — le chuchotement phonétique est apériodique par nature, il ne doit pas pour autant produire du silence. Sous `Gate_dB`, il ne pèse rien : c'est le prix assumé du zéro unique (*Formulas* §1) | `[UNIT]` |
| AC-37 | **« Même effort, même résultat. »** GIVEN deux profils synthétiques de plages et de `F0_habituel` différents WHEN chacun reçoit un `Rms_dB` occupant la **même position relative** dans sa plage THEN les deux `Loudness` coïncident à ± 0,01 | `[UNIT]` |
| AC-38 | GIVEN quatre à cinq testeurs notant leur effort ressenti de 1 à 5 THEN la courbe effort → `Loudness` est **monotone pour chaque testeur**, et les courbes ne se croisent pas d'un testeur à l'autre | `[HUMAIN]` — **bloquant avant de figer `γ`** |
| AC-39 | **« Un claquement n'est pas une note tenue. »** GIVEN dix claquements de langue et une voyelle tenue, même joueur, même niveau THEN l'écart de `Continuity` entre les deux familles est **d'au moins 0,4**, sans recouvrement | `[UNIT]` sur signaux enregistrés |
| AC-40 | **« Quand je me tais, rien ne bouge. »** GIVEN 30 s de bruit ambiant réel enregistré — clavier, ventilateur, respiration, conversation à côté — et un profil calibré **dans la même pièce** THEN `Loudness = 0` sur au moins **p %** des trames. `p` est **EN ATTENTE** : le prototype navigateur mesure la part réellement atteinte sur une étape de silence (B2), et le système 11 en dérive la cible, `p ≥ 0,84` sous hypothèse d'indépendance (`voice-object-effect.md`, *Formulas* §3) — la part réelle ne se fixe pas sur le papier | `[HUMAIN]` puis rejouable en `[UNIT]` |
| AC-40b | GIVEN `Rms_dB ∈ [Floor_dB ; Gate_dB)` THEN `Loudness = 0` **exactement** — c'est le test qui prouve qu'il n'y a qu'un seul zéro, et qu'il est à la porte, pas au plancher de la pièce | `[UNIT]` |

> **Sur AC-40.** Une fois les trente secondes enregistrées **et `p` fixé**, ce critère cesse
> d'être humain : le fichier devient une fixture et le test tourne en CI. C'est le modèle à
> suivre pour tout ce qui touche au signal — **mesurer une fois, rejouer toujours.**

### H — Budget

#### Le profil de charge nominal — une instance, pas huit

**Il n'existe qu'un seul `VoiceAnalyzer` par client, quel que soit le nombre de joueurs.**
ADR-0003 est explicite : chaque client analyse son propre micro en local et ne transmet
que des features. Les `VoiceFrame` des autres joueurs **arrivent par le réseau** ; elles ne
sont jamais recalculées. Le coût de l'analyse ne dépend donc pas de la taille de la partie.

Le pire cas nominal n'est pas une partie pleine — et **ce n'est pas non plus la voix aiguë
par principe.** Deux profils de charge coexistent, et **aucun des deux n'est mesuré** : la
voix aiguë, dont le profil impose la décimation à 12 kHz, et la **plage par défaut à
8 kHz**, où une voix grave recadrée porte `maxLag = 115` sur une fenêtre YIN de 256
échantillons — 32 ms de fenêtre, et un tampon de `fenêtre + maxLag` ≈ 46 ms
(ADR-0004:101–102 ; `PitchDetector.cs:67`). Le coût de YIN vaut `maxLag × fenêtre`
(ADR-0004:218–219), et la fenêtre à 12 kHz **n'est pas spécifiée** : aucun rapport de coût
entre les deux profils ne se pose sur le papier. **Ce sont ces deux profils qu'il faut
mesurer, et non une moyenne.**

**Propriété du thread.** L'analyse ne tourne pas sur le thread principal (ADR-0007:200). Ce
que le budget de 1 ms/frame doit couvrir n'est donc pas le calcul mais **la remise de la
`VoiceFrame` au thread principal** — le point de synchronisation, pas la chaîne DSP. Le
mécanisme de cette remise — fil de travail ou rappel — n'est pas tranché : il revient à
l'ADR de fils d'exécution, et tant qu'il n'est pas écrit, **ce que « 1 ms » couvre
exactement reste ouvert**.

| # | Critère | Type |
|---|---|---|
| AC-41 | GIVEN 1 000 trames traitées THEN **aucune allocation managée** n'est observée sur la chaîne complète. Méthode obligatoire : boucle de chauffe puis `GC.Collect()` **avant** la fenêtre mesurée, sinon la première trame porte les allocations de la JIT et le test ment | `[UNIT]` |
| AC-41b | GIVEN une bascule de profil à chaud pendant la mesure THEN elle est **explicitement dans ou hors** du périmètre d'AC-41 — la reconstruction du `Decimator` et du `PitchDetector` alloue par nature, et confondre les deux rend le critère ininterprétable | `[UNIT]` |
| AC-42 | GIVEN **un** analyseur mesuré sur **les deux** profils de charge ci-dessus — voix aiguë à 12 kHz, puis plage par défaut à 8 kHz — THEN le coût **thread principal** reste sous 1 ms/frame dans les deux cas, et l'écart entre les deux est **relevé, pas supposé** | `[HUMAIN]` — profilage sur cible |
| AC-42b | GIVEN une exécution en jeu THEN une instrumentation continue expose le coût par instance en µs/frame **et l'écart entre l'intervalle réel et la cadence nominale** — tant que l'`EnvelopeFollower` n'a pas migré, c'est la seule chose qui rende cet écart visible. Elle se scinde par assembly : `SUAC.Voice.Core` est déclaré `noEngineReferences`, donc le chronomètre y vit en .NET pur et le compteur Unity côté capture | `[INTEG]` |

### I — La porte de mesure

Les valeurs provisoires de ce document sont énumérées **à un seul endroit**, avec leur
propriétaire, leur plage sûre et la mesure qui les fixera : *Formulas*, « Porte de mesure —
la liste canonique des valeurs provisoires ». Aucune section n'en recopie ni le contenu ni
le compte, et les deux critères ci-dessous portent sur la liste, pas sur une énumération
qui vieillirait ici.

Le risque n'est pas que ces valeurs soient fausses — c'est qu'elles **cessent
silencieusement d'être signalées comme provisoires** en se propageant dans le code et dans
les autres documents.

| # | Critère | Type |
|---|---|---|
| AC-43 | GIVEN le code de `Voice.Core` THEN **chaque valeur de la liste canonique** apparaît **en un seul endroit**, comme constante nommée — aucun littéral dupliqué ailleurs dans l'assembly | `[UNIT]` par inspection statique des sources |
| AC-44 | GIVEN un document de design citant une valeur de la liste canonique THEN il la marque **provisoire** ou renvoie à la liste — aucune ne peut être citée comme acquise avant que la mesure qui la fixe ait eu lieu | `[HUMAIN]` — relecture, à la charge de `/design-review` |

---

### Ce que ces critères ne couvrent pas

Deux trous subsistent, et le premier est un **défaut de spécification** avant d'être un
manque de test.

**1. Le TTL de l'anneau n'a pas de valeur.** AC-35 est écrit mais non exécutable tant
qu'elle manque (OQ-6).

**2. Écrêtage et non-voisement simultanés.** Les deux gardes de gel portent sur des cibles
différentes — `Continuity` d'un côté, l'anneau `F0` de l'autre — donc elles ne devraient
pas entrer en conflit. Aucun critère ne le vérifie explicitement.

> **La sortie de `Degraded` est spécifiée** (*Detailed Rules*, table des transitions) : c'est
> l'événement « capture reprise » du système 2. AC-20 ne la contredit pas — recevoir un
> *profil* ne rétablit pas `Calibrated`, recevoir l'événement si (AC-20b). L'anti-rebond est
> porté par le contrat du système 2 et couvert par AC-20c.

### Les trois cas difficiles

**L'équité d'effort.** Elle se scinde en deux. AC-37 teste l'équité **mathématique** de la
normalisation, et c'est un test unitaire honnête : deux profils, une position relative
identique, un résultat identique. Ce qu'il ne prouve pas, c'est que deux humains
produisant « le même effort ressenti » atteignent la même position relative — cela dépend
de la qualité du **protocole de calibration**, pas de l'arithmétique. D'où AC-38, qui reste
humain et qu'aucune astuce ne remplacera.

**La porte de mesure.** Un test unitaire ne voit pas au-delà de son assembly : il ne peut
pas vérifier « ailleurs dans le projet ». AC-43 fait ce qui est faisable — une inspection
statique des sources qui échoue si une valeur de la liste canonique est dupliquée hors de
son fichier de constantes. C'est un test de **discipline**, pas de comportement, et il doit
être documenté comme tel. Le reste (AC-44) est une relecture humaine.

**La cadence réelle des appels.** Ce n'est plus un arbitrage : **ADR-0007 est Accepted**, la
chaîne reçoit son intervalle à chaque appel et les constantes de temps sont la référence
(*Formulas* §1a). Ce qui reste est un **état du code**, et il se voit dans les critères :
l'`EnvelopeFollower` dérive encore ses coefficients de l'`updateRateHz` passé au
constructeur, donc rien ne vérifie aujourd'hui que les appels arrivent au rythme supposé —
une dérive casse le lissage sans lever d'exception, sans NaN, sans rien. **AC-14 ne vérifie
le lissage que lorsque l'intervalle est constant** ; **AC-14e ne devient un filet qu'après
la migration**, et AC-42b est d'ici là la seule instrumentation qui rende l'écart visible.

### Ce qui reste hors de portée d'une machine

- Le ressenti « quand j'échoue, je sais de quoi je suis coupable » — c'est de la
  compréhension du joueur ; elle se mesure en playtest et en questionnaire.
- La perception de l'effort équivalent entre deux vraies voix (AC-38).
- Les constantes de temps de l'enveloppe, qui portent des valeurs **provisoires**
  (*Formulas*, liste canonique) : elles se règlent à l'oreille, pas au raisonnement.
- La latence perçue bout en bout — analyse, réseau, physique, rendu — qui ne se mesure
  pas sur `Voice.Core` seul.

## Open Questions

### Comment lire cette section

Une question ouverte n'a pas le même poids selon ce qu'elle empêche. Trois catégories, et
c'est l'ordre dans lequel il faut les traiter :

- **Bloque le code** — on ne peut pas écrire le `VoiceAnalyzer` sans trancher. **Les trois
  questions de cette catégorie sont fermées** : deux tranchées ici, une promue en ADR. Elles
  restent écrites, avec leur résolution — un document de fondation doit garder la trace de ce
  qu'il a décidé, pas seulement de ce qu'il ignore. Ce qui reste d'OQ-3 n'est plus une
  question mais **un travail** : la migration du code vers ADR-0007.
- **Bloque le réglage** — le code s'écrit, mais les valeurs restent des paris. Trois
  questions, toutes résolubles par la mesure.
- **Appartient ailleurs** — la réponse existe, ou existera, dans un autre GDD ; elle est
  listée ici pour ne pas se perdre entre deux documents. Trois questions, dont une est
  désormais résolue par son propriétaire.

Une quatrième catégorie, à part : **deux risques non levés**, dont aucun ne se résout par le
raisonnement. Le premier n'est plus un choix d'architecture — il est arrêté — mais une
vérification sur la cible, dont l'échec ferait pivoter la conception.

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

**TRANCHÉ — option A.** Sur un nombre pair de valeurs disponibles, la médiane prend
**l'élément bas des deux centraux**. Le biais vaut une valeur d'anneau, sur deux trames, et
il est *déterministe* — donc testable et documentable. B laisse passer précisément les
erreurs d'octave de YIN, qui sont son mode d'échec le plus visible, et au pire moment. C
introduit entre `Loudness` et `Pitch` une désynchronisation qui heurte le ressenti « ma voix
est un geste ».

#### OQ-2 — ~~La sortie de `Degraded` n'est pas spécifiée~~

**FERMÉ.** La sortie est spécifiée : *Detailed Rules*, table des transitions — `Degraded →
Calibrated` sur l'événement **« capture reprise »** émis par le système 2 (*Dependencies*,
contrat du système 2). Recevoir un **profil** ne rétablit pas `Calibrated` (AC-20) ; recevoir
l'événement, si (AC-20b).

**Ce qui manquait réellement** n'était pas la transition mais son **anti-rebond** : ces
événements de périphérique se déclenchent souvent à tort, et sans filtrage l'état clignote.
C'est un contrat du système 2, et AC-20c le couvre.

#### OQ-3 — Cadence implicite ou `deltaTime` explicite

Ce document présentait deux options. **La première n'existe pas.** Garder la cadence
implicite comme simple contrat écrit supposait qu'une cadence fixe à 50 Hz soit *atteignable*
sous Unity. Elle ne l'est pas :

| Mécanisme | Pourquoi il ne donne pas 50 Hz fixe |
|---|---|
| `Update` | Couplé à l'affichage — donc variable par nature |
| `FixedUpdate` | Ordonnanceur à rattrapage : zéro, une ou plusieurs exécutions par frame |
| `Microphone` | Interrogation seule, aucun rappel |
| `OnAudioFilterRead` | Piloté par le nombre d'échantillons, avec une taille de tampon **modifiable à l'exécution** |

Il reste donc une seule voie : **passer l'intervalle réel à chaque appel**. Ce n'est pas un
arbitrage coût contre garantie, c'est la seule forme réalisable. Elle touche la signature
publique du seul type à état de l'assembly, ce qui la rend structurante.

**TRANCHÉ — → ADR-0007, *Accepted*.** Chaque appel porte son
`AnalysisTiming { DeltaSeconds, SampleRate }`, les constantes de temps s'expriment en
secondes, et le coefficient se calcule sur l'intervalle mesuré (*Formulas* §1a). Les ~50 Hz
de la chaîne sont un ordre de grandeur nominal, pas un contrat.

**Ce qui reste n'est plus une question, c'est une migration.** L'`EnvelopeFollower` dérive
encore ses coefficients de l'`updateRateHz` reçu au constructeur, et repart de `0f` au lieu
de `MinDb` ; `N`, le TTL de l'anneau et la fenêtre de gel s'expriment encore en trames.
*Formulas* §1a porte l'état du code et la liste de ce qu'il faut reprendre. Deux conséquences
tant que ce n'est pas fait :

- **ADR-0007 bloque l'écriture du `VoiceAnalyzer`.** Bâtir l'analyseur sur un suiveur à
  cadence implicite figerait dans le code la forme même que l'ADR écarte.
- **Aucun critère ne voit la dérive.** AC-14 ne vérifie le lissage que lorsque l'intervalle
  est constant ; AC-14e, qui compare deux cadences sur le même échelon, est **EN ATTENTE** de
  la migration ; AC-42b est d'ici là la seule instrumentation qui rende l'écart visible.

---

### Bloque le réglage

#### OQ-4 — Les valeurs provisoires

Aucune n'est mesurée. **Elles sont énumérées à un seul endroit** — *Formulas*, « Porte de
mesure — la liste canonique des valeurs provisoires » —, avec leur propriétaire, leur plage
sûre et la mesure qui les fixera ; ni leur contenu ni leur compte ne se recopient ailleurs.
Les deux protocoles qui en donnent la plupart, A pour les bornes de crête et B pour `γ`,
vivent dans la même sous-section et tiennent en une session d'enregistrement et une session
de playtest. Les constantes d'enveloppe se règlent séparément, à l'oreille, au POC audio.
**Rien d'autre dans le projet ne doit les citer comme acquises avant** — c'est l'objet des
critères AC-43 et AC-44.

#### L'ordre de mesure

Ces valeurs — celles de ce document comme celles du système 6 — **ne sont pas
indépendantes**, et l'ordre n'était écrit nulle part alors que les deux documents en
contenaient les morceaux.

| Rang | Ce qu'on règle | Pourquoi à ce moment |
|---|---|---|
| **1** | `FloorMargin_dB` **et** `Margin_dB` — **ensemble** | Ce sont **deux marges empilées au-dessus du même plancher** : leur somme est la hauteur de `Gate_dB` au-dessus du P95 du bruit de la pièce (*Formulas* §1). Les régler séparément les double sans que personne ne s'en aperçoive |
| **2** | `HardFloor_dB`, `QualityBand_dB` — système 6 | Ils portent sur la **plage utile** `Δ' = Scream_dB − Gate_dB` (*Formulas* §1, « Garde et plancher dur »), que le rang 1 vient de déplacer |
| **3** | `CrestMinDb`, `CrestMaxDb`, `JitterMin`, `N` | Indépendants des précédents ; se dérivent des mêmes enregistrements |
| **4** | Les constantes d'enveloppe, la fenêtre de gel, le TTL | À l'oreille, au POC — **en domaine dB**, et en **secondes** une fois la migration d'OQ-3 faite |
| **5** | `γ` | Protocole B : la courbe effort → `Loudness` **passe par la normalisation**, donc `Gate_dB` et `Scream_dB` doivent déjà être stables |

**Deux mesures ont quitté cet ordre, et ce n'est pas un oubli.** Les bornes de plausibilité du
repos n'ont plus d'objet : `r'` tombe dans `]0 ; 1[` par construction pour tout profil commité
(*Formulas* §5), et `Rest_dB` lui-même appartient au système 6. Une borne haute de hauteur
habituelle n'en a pas davantage : ce qu'une hauteur habituelle peut valoir est **le domaine du
détecteur** (*Formulas* §5), pas un nombre à établir sur des sujets.

> **La règle qui rend tout ça soutenable : enregistrer une fois, dériver hors ligne,
> rejouer toujours.** Une seule session capture le **signal brut**, et les rangs 1 à 3 s'en
> dérivent par calcul, sans micro. Sinon chaque révision de seuil coûte une nouvelle
> session de mesure — et il y en aura plusieurs.
>
> C'est la règle d'AC-40 — « mesurer une fois, rejouer toujours » — généralisée à la liste
> canonique et à celle du système 6.

#### OQ-5 — Les constantes de temps de l'enveloppe

Attaque et relâchement portent des valeurs **PROVISOIRES** (*Formulas*, liste canonique) : un
vide ne se teste ni ne se conteste, un pari explicite fait les deux. Elles gouvernent le
ressenti « ma voix est un geste » et **se règlent à l'oreille, pas au raisonnement** — le POC
audio les tranchera. Il les tranchera en domaine dB et sous `c = exp(−Δt / τ)` (*Formulas*
§1a) : réglées ailleurs, sous un coefficient figé, elles ne se transposeraient pas au jeu.

#### OQ-6 — Le TTL de l'anneau

Sans valeur : la liste canonique le marque **EN ATTENTE** et non PROVISOIRE, et AC-35 est
écrit mais reste EN ATTENTE avec lui. Ce n'est pas un réglage de confort — trop long, une
reprise de parole se lisse contre une hauteur périmée ; trop court, l'anneau se vide entre
deux mots et le filtre médian ne sert plus à rien. Il s'exprimera en secondes, comme les
autres durées, à la migration d'OQ-3.

---

### Les risques non levés

#### OQ-7 — Le micro peut-il vraiment être partagé ?

Toute l'architecture repose sur une hypothèse : **le système 2 possède le périphérique et le
fourche** — une branche vers l'analyse, une branche vers le chat vocal. La branche d'analyse
reçoit le signal **brut, sans traitement** ; ce que le backend fait du sien ne la concerne
pas (*Visual/Audio Requirements*, « Larsen et contamination croisée »).

**La question a d'abord été reformulée, et c'est ce qui l'a rendue utile.** Posée comme « le
micro se partage-t-il », c'est une affaire de pile audio, réglée par une demi-journée de
test. Mais ce test **présuppose** ce qui n'était pas acquis : que le SDK de chat vocal
accepte du **PCM fourni de l'extérieur** au lieu de posséder lui-même la capture. **La
plupart des SDK possèdent la capture** — et si le nôtre la possédait, il n'y aurait rien à
fourcher, quel que soit le résultat du test de partage.

**Ce point est arrêté. → ADR-0008, *Accepted*** : l'ingestion de PCM externe est le critère
éliminatoire, et le **backend retenu est Dissonance**, dont l'interface `IMicrophoneCapture`
permet de **remplacer intégralement** son système de capture par le nôtre (ADR-0008:161). Le
principe d'ADR-0005 — interface maison, implémentation interchangeable — tient ;
l'interchangeabilité n'est réelle que parmi les backends capables d'ingérer du PCM externe,
ce qui fait tomber son implémentation par défaut (ADR-0008, *Status*).

**Ce qui reste à vérifier.** Ces quatre points sont listés **sans ordre** : l'ordre
d'activation est contesté entre ADR-0008:383–388 et
`Assets/_Project/ThirdParty/DissonanceFishNet~/VENDORING.md:152–155`, et c'est au
technical-director de le trancher.

- **Compiler** contre Dissonance 9.0.7 et FishNet 4.7.2R. Personne n'a publiquement confirmé
  la compatibilité de l'intégration vendorisée avec Dissonance 9 (ADR-0008:294–299).
- **Partager le périphérique sur la cible** — pile audio Windows, client Steam, périphériques
  réels des joueurs. C'est le test d'origine, désormais posable.
- **Vérifier que FishNet expose un canal non fiable et non ordonné**, ce que Dissonance exige
  nommément.
- **Corriger le démarrage avant authentification** de l'intégration vendorisée.

**Le risque résiduel n'est pas un correctif.** Si le partage s'avère impossible ou instable
sur la cible, il faudrait choisir entre la voix comme contrôleur et la voix comme chat, ou
reconstruire tout le trajet : **c'est un pivot de conception.**

#### OQ-8 — Deux joueurs dans la même pièce

Le micro de l'un capte la voix de l'autre, et **aucun DSP ne sépare deux voix captées par le
même micro**. Ce n'est pas un manque d'ingénierie : c'est le problème lui-même. Le jeu étant
coopératif et destiné à se jouer entre amis, la configuration « même canapé » n'est pas
marginale — pas plus que la configuration d'assistance, où un aidant est assis à côté du
joueur.

**Le casque est un prérequis du jeu, et il ne règle pas ce cas** : la voix de l'autre arrive
**par l'air**, pas par les haut-parleurs. La mesure à faire et sa condition bloquante sont en
*Visual/Audio Requirements*, « Larsen et contamination croisée ». Il n'y a pas de réponse à
ce stade et il ne faut pas en improviser une : ce qu'il faut, ce sont **des données de
playtest en configuration même-pièce**, avant de décider si cela casse réellement
l'attribution — et donc avant d'investir dans une atténuation.

> **Déclencheur, pas mise en garde.** Ce playtest doit avoir lieu **avant l'écriture des
> GDD des systèmes 3 et 12**. Les deux encoderont l'hypothèse « une voix par `VoiceFrame` »
> dans leurs propres règles ; la remettre en cause après coup coûterait deux documents,
> alors qu'une soirée de test la valide ou l'invalide maintenant.

---

### Appartient à un autre système

| # | Question | Propriétaire | État |
|---|---|---|---|
| OQ-9 | À quelle fréquence rééchantillonner la `VoiceFrame` pour le réseau — 50 Hz vers 20–30 Hz, et selon quelle règle de décimation ? | **Système 5 — Réseau.** Explicitement hors de `Voice.Core` | Ouverte, sans GDD à ce jour |
| OQ-10 | Où et sous quel format persiste le `VoiceProfile` entre les sessions ? Local, cloud, lié au compte Steam ? | **Système 6 — Calibration** | Reprise en OQ-C1 de `voice-calibration.md` : recommandation posée, décision non arrêtée |
| OQ-11 | Que vivent les coéquipiers pendant qu'un joueur recalibre en portant un meuble à plusieurs ? | **Système 6 — Calibration** | **Résolue** |

> **OQ-11 est résolue par suppression du cas, pas par une règle de plus.** Autoriser la
> recalibration à tout moment semblait ouvrir une fenêtre où un joueur cesse d'agir sur un
> objet que d'autres portent avec lui. **Ce cas n'existe pas** : la recalibration se lance
> depuis le menu, ouvrir le menu immobilise le personnage, et un personnage immobilisé
> **pose ce qu'il porte** (`voice-calibration.md`, « La recalibration en cours de partie » ;
> *Detailed Rules*, table des transitions). Il reste une exigence, et elle est sociale :
> **les autres joueurs doivent comprendre pourquoi leur coéquipier vient de poser sa moitié
> de canapé et de se figer**, faute de quoi le comportement se confond avec une déconnexion.
> Il reste aussi une dépendance à confirmer : le portage doit prévoir qu'un porteur **lâche**
> en cours de transport (OQ-C9 du système 6, propriétaire système 9). Si ce chemin
> n'existait pas, OQ-11 se rouvrirait.

---

### État du code aujourd'hui

Pour mémoire, et parce que cela conditionne la suite : `SUAC.Voice.Core` contient les
primitives — mesure de niveau, décimation, YIN, enveloppe — et 41 tests verts. **Rien ne
produit encore de `VoiceFrame`** : le `VoiceAnalyzer` que ce document spécifie n'existe pas,
et la conversion du rapport crête/RMS vers `Continuity` est explicitement reportée dans les
commentaires du code (`RawLoudness.cs:60`). Ce document est donc bien une spécification à
écrire, pas une description de l'existant.

**Et il ne s'écrit pas dans cet ordre.** L'`EnvelopeFollower` **n'est pas migré vers
ADR-0007** : il dérive ses deux coefficients de l'`updateRateHz` reçu au constructeur
(`EnvelopeFollower.cs:87–88, 118–130`) et repart de `0f` — la pleine échelle — au lieu de
`MinDb` (`EnvelopeFollower.cs:89, 113`). **ADR-0007 bloque l'écriture du `VoiceAnalyzer` tant
que cette migration n'est pas faite** : bâtir l'analyseur sur un suiveur à cadence implicite
figerait dans le code la forme que l'ADR écarte (OQ-3 ; *Formulas* §1a).

## Revision History

**Les corrections se font en place, dans le texte normatif.** Ce tableau garde la trace de ce
qui a changé et d'où venait la décision ; il n'y a donc pas d'encadré daté au milieu des
règles, où il finirait tôt ou tard par contredire le texte qu'il était censé corriger.

| Date | Changement | Source |
|---|---|---|
| 2026-09-04 | Cadrage de *Player Fantasy* : ossature « fantasme délégué », cœur « fantasme par la négative », clause de vivacité pour border le risque de mollesse | Arbitrage avec le `creative-director`, mode `full` |
| 2026-09-07 | OQ-1 tranchée — option A, l'élément bas des deux centraux sur un nombre pair | `reviews/voice-analysis-2026-09-07.md` |
| 2026-09-07 | OQ-2 fermée — la sortie de `Degraded` était spécifiée depuis le début ; ce qui manquait était l'anti-rebond, passé au contrat du système 2 (AC-20c). Une version antérieure du document et la revue affirmaient à tort qu'elle ne l'était pas | idem |
| 2026-09-07 | OQ-3 tranchée — aucun mécanisme Unity ne donne 50 Hz fixes ; l'intervalle explicite est la seule forme réalisable, promue en ADR-0007 | idem |
| 2026-09-07 | OQ-7 recadrée — le critère éliminatoire n'est pas le partage du périphérique mais l'ingestion de PCM externe, promue en ADR-0008 | idem |
| 2026-09-07 | Quatre valeurs jusque-là vides reçoivent une valeur provisoire et une plage sûre : un vide ne se teste ni ne se conteste | idem |
| 2026-09-08 | La conversion en décibels devient une **étape à part entière** de la chaîne : `RawLoudness.Rms` est linéaire, et le lissage doit opérer en dB | `docs/architecture/voice-chain-td-review-2026-09-08.md` |
| 2026-09-08 | La **fréquence d'échantillonnage** est nommée : le `Decimator` n'accepte qu'un facteur entier, et `PitchDetector` en dépend pour convertir une période en hertz | idem |
| 2026-09-08 | Le champ de repos devient `Rest_dB`, avec un rôle explicite | idem |
| 2026-09-08 | `LowRange` devient un contrat entrant du système 6 : le drapeau multiplie les constantes de temps de l'enveloppe, sans quoi il resterait décoratif | idem |
| 2026-09-08 | Atomicité précisée : les objets à état sont reconstruits à la réception du profil, pas à la construction de l'analyseur | idem |
| 2026-09-08 | L'ordre de mesure des valeurs provisoires est écrit, à cheval sur les systèmes 1 et 6 | idem |
| 2026-09-08 | **Aucune annulation d'écho ne protège l'analyse, et ce ne sera pas corrigé** : l'AEC du backend s'applique sur sa seule branche de transmission | ADR-0003, décision du 2026-09-08, option A |
| 2026-09-08 | `AnalyzerState` devient une **propriété de l'analyseur**, pas un champ de trame ; la liste blanche de la surface publique s'allonge à `{ VoiceFrame, VoiceProfile, AnalyzerState }` — la règle d'ADR-0004 n'est pas relâchée, sa liste s'allonge | `docs/architecture/voice-chain-td-review-2026-09-08.md` |
| 2026-09-08 | ADR-0007 élargi : quatre horloges implicites subsistaient au-delà de l'enveloppe | `docs/architecture/adr-0007-analysis-cadence-explicit-delta-time.md` |
| 2026-09-08 | La section UI est migrée : le parcours de calibration vers `voice-calibration.md` ; le sonomètre, l'icône « micro coupé » et l'option d'accessibilité reviennent au système 19. L'écrire ici était une erreur de rangement | Revue du 2026-09-07 |
| 2026-09-11 | **Le sonomètre ne compense rien** : porté sur le torse, il est lu par les coéquipiers et jamais par soi — le joueur n'a aucun retour visuel sur sa propre voix | `game-concept.md` § 2.4.5 |
| 2026-09-15 | Révision groupée, premier document de la passe 1 → ADR → 6 → 11. Zéro unique de `Loudness` porté à `Gate_dB` ; `r'` et `ToPosition` remplacent `L_repos` ; enveloppe normative en `c = exp(−Δt / τ)` ; `PitchStatus` à trois valeurs, aucun détecteur ne refusant un profil à lui seul ; plancher dur redéfini sur la plage utile `Δ'` ; création de la table des domaines atteignables et de la liste canonique des valeurs provisoires ; ADR-0007 et ADR-0008 signalés *Accepted* ; encadrés datés repliés dans ce tableau | `reviews/voice-analysis-2026-09-14.md` §2, §3 et §6 ; décisions du propriétaire du 2026-09-15 |
| 2026-09-15 | Vérification adverse de la révision : la sortie de `Degraded` devient l'événement « capture reprise » du système 2 (table des transitions, AC-20b, OQ-2) ; la taille de l'anneau médian rejoint la liste canonique, sa parité étant une décision de ce document et non d'ADR-0004 ; le seuil d'écrêtage et `p` y entrent EN ATTENTE ; AC-26c ajouté ; borne exacte de −12 demi-tons ; datation réseau corrigée ; deux dépendances d'exécution | Passe groupée, étape 1 — vérificateurs de complétude et de cohérence |
| 2026-09-16 | Renvois alignés sur la révision du système 6 : la respiration entre dans `Floor_dB` ; la précondition de mesure de `F0_habituel` est écrite ; le plancher dur et la bande de qualité sont chiffrés dans la liste canonique du système 6, pas dans ses *Tuning Knobs* ; l'accès à la calibration depuis les menus porte l'identifiant CAL-55 | Passe groupée, étape 3 |
| 2026-09-16 | Le système 11 fixe la cible de `p` (AC-40 et liste canonique) | Passe groupée, étape 4 |
