# Calibration vocale

> **Status**: In Design — révisé le 2026-09-16 après la revue du 2026-09-11 (verdict MAJOR
> REVISION NEEDED), selon les décisions du propriétaire du 2026-09-15 ; troisième document de
> la passe groupée
> **Author**: Sacha (devonemoretry-sacha) + Claude
> **Last Updated**: 2026-09-16
> **Enables Pillar**: Pilier 1 — « La Voice-Physics récompense le contrôle, pas le silence ».
> Comme le système 1, celui-ci ne réalise pas le pilier : **il le rend possible.** Sans lui,
> le jeu récompenserait le matériel et la physiologie.
> **System**: #6 dans `design/gdd/systems-index.md` · Core · MVP
> **Périmètre MVP**: entrée #13 de `design/mvp-scope.md`
> **Revue**: `design/gdd/reviews/voice-calibration-2026-09-11.md` ; décisions consolidées dans
> `design/gdd/reviews/voice-analysis-2026-09-14.md` §6

> Titres de sections en anglais (lus par les skills), corps en français.
>
> **Portée** : ce document couvre la production, la validation, la persistance et la
> reprise du `VoiceProfile`, ainsi que le parcours joueur qui l'accompagne. Rien n'en est
> implémenté à ce jour.
>
> **Ce qu'il ne redéfinit pas.** Les grandeurs du système 1 — `Gate_dB`, `r'`, la règle
> « un détecteur ne refuse jamais seul », la table des domaines atteignables et la liste
> canonique de ses valeurs provisoires — vivent dans `voice-analysis.md`. Ce document les
> **cite** et ne les recopie pas.

## Overview

**La calibration est ce qui rend le jeu juste.**

La mécanique centrale mesure l'effort vocal. Mais un micro-casque à 200 € et une voix de
baryton ne produisent pas les mêmes décibels qu'un micro de portable et une voix d'enfant,
à effort strictement identique. Sans calibration, le jeu ne récompenserait pas le contrôle
vocal : il récompenserait **l'équipement et la physiologie**. Le Pilier 1 deviendrait faux,
et personne ne saurait pourquoi.

Ce système résout cela en mesurant, une fois par joueur, les bornes de sa propre échelle :
le bruit de fond de sa pièce, sa voix au repos, sa hauteur habituelle et son cri. Il en
produit un **`VoiceProfile`** contre lequel le système 1 normalise toutes ses mesures. Après
quoi « fort » ne veut plus dire *un certain nombre de décibels*, mais **fort pour cette
personne, dans cette pièce, sur ce micro**.

**Les seuils sont personnels, et c'est tout l'objet du système.** Une constante de la
calibration n'a le droit de détecter qu'une **mesure physiquement cassée** — ordre inversé,
plage inexploitable, trop peu de voix captée, micro coupé. Elle ne juge jamais une **voix
inhabituelle** : une voix aiguë, grave, soufflée, étroite ou très stable est acceptée, au
besoin signalée (`LowRange`, « hauteur indisponible »), jamais refusée.

Sa portée dépasse la mesure. Trois traits le distinguent des autres systèmes :

- **On le traverse une fois, et il se termine toujours.** Sans profil valide, l'analyse
  vocale renvoie du silence et le joueur ne peut pas rejoindre une partie : c'est le seul
  système du MVP qui puisse retenir l'entrée. Mais la porte ne peut pas rester fermée à
  quelqu'un qui a coopéré : après deux refus, un **profil approximatif** consenti lui ouvre
  le jeu.
- **Il appartient au joueur, pas à la session.** Le profil persiste entre les parties et
  entre les sessions, **sur la machine du joueur**. On le crée une fois ; on rejoint ensuite
  n'importe quelle partie, y compris en cours, sans rien refaire. Un seul nombre en est
  dérivé vers l'hôte, `r'` ; le profil lui-même ne quitte jamais la machine.
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

L'analyse doit être invisible ; la calibration est vue, vécue, et jugée.

### Le meilleur moment d'apprentissage du jeu, et le seul

La calibration est **le premier instant où le joueur voit sa voix agir sur quelque chose**.
Ce moment ne se représentera pas. Si la calibration se donne l'air d'un formulaire de
réglages, on aura gaspillé la meilleure occasion d'onboarding qu'on aura jamais — et il
faudra réexpliquer plus tard, moins bien, dans une situation où le joueur est occupé à
autre chose.

> **Le fantasme à tenir tient en une phrase : « ma voix fait bouger le truc ».**
> Le joueur doit sortir de la calibration en ayant compris ce qu'est ce jeu, sans qu'on
> le lui ait dit.

**Et il doit comprendre la bonne chose.** Dans le jeu, la voix qui monte **alourdit** le
meuble qu'on porte. Une jauge qui monte quand on pousse enseignerait l'inverse — « fort,
c'est bien » —, dans le seul moment d'apprentissage que le jeu se donne. C'est pourquoi
l'étape de montée ne montre pas un niveau mais **une conséquence** : un objet qui
s'alourdit, frémit, devient récalcitrant à mesure que la voix monte (*Visual/Audio
Requirements*). Le joueur apprend « ma voix fait bouger le truc », et il apprend dans quel
sens.

### Mesurer et enseigner — ensemble à l'étape de montée, en tension ailleurs

La calibration doit **mesurer juste** et **enseigner**. À l'étape de montée, ces deux
exigences s'alimentent :

- Un joueur qui voit l'objet réagir **pousse plus loin**, ce qui donne une meilleure
  mesure de son registre haut.
- Un joueur qui ne voit rien **se retient**, ce qui donne un registre écrasé et un profil
  médiocre.

Là, **l'enseignement est la technique de mesure**, pas une couche ajoutée par-dessus.

**Ce n'est pas une loi générale, et l'étape de silence en est le contre-exemple.** Y montrer
un retour de la voix inviterait le joueur à le faire bouger — exactement ce qui ruine la
mesure du plancher. Là, enseigner nuirait à mesurer, et c'est la mesure qui gagne : aucun
indicateur de niveau. Un futur lecteur ne doit pas étendre la doctrine « montrer, c'est
mesurer » aux autres étapes au nom de la pédagogie.

### Ce que le joueur ne doit jamais ressentir

- **« Je passe un test. »** Un test appelle l'effort minimal suffisant pour le réussir —
  exactement la mauvaise mesure. On ne veut pas qu'il passe, on veut qu'il montre son
  amplitude.
- **« Je me ridiculise. »** La gêne comprime le registre. Un joueur intimidé produit
  mécaniquement un profil dégradé, et le défaut se manifestera plus tard comme un jeu qui
  ne réagit pas.
- **« Le jeu juge ma voix. »** Un refus de profil doit se lire comme un problème de micro
  ou de pièce, **jamais** comme un verdict sur la personne. Et une voix inhabituelle ne
  produit pas de refus du tout.
- **« Je suis coincé. »** Un joueur qui a coopéré deux fois ne se voit pas redemander la même
  chose une troisième : le jeu lui propose d'entrer.
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

C'est la raison d'être du drapeau **`LowRange`**. Un joueur qui ne veut pas, ou ne peut pas,
crier **joue quand même** : son profil est accepté, marqué, et son lissage renforcé. Sa
mesure est plus molle, honnêtement signalée comme telle, et il n'est pas exclu. **Elle
convertit un problème social insoluble en un problème technique gradué.**

`LowRange` recouvre deux causes différentes, et une seule appelle un lissage durable. Un
registre **physiologiquement ou matériellement étroit** est une vraie propriété du joueur.
Une **retenue passagère**, par gêne, ne l'est pas : le joueur qui s'est retenu doit pouvoir
refaire sa mesure plus tard, seul, sans prétexte technique (*UI Requirements*, « Refaire ma
mesure »).

### Il y a deux calibrations, et elles n'ont pas le même fantasme

| | **La première** | **Les suivantes** |
|---|---|---|
| Situation | Le joueur découvre le jeu | Le joueur sent que le jeu ne l'écoute plus, ou veut refaire sa mesure |
| Fantasme | **La découverte** — « ma voix fait bouger le truc » | **La reprise de contrôle** — « je répare, et je retourne jouer » |
| Ce qu'il veut | Comprendre, prendre son temps | Que ce soit fini |
| Ce qu'il faut lui donner | De la démonstration, du retour visuel, aucune hâte | De la vitesse, aucune pédagogie, aucune cérémonie |

**Traiter la seconde comme la première est une faute de conception.** Un joueur qui
recalibre en pleine partie parce que sa voix ne porte plus n'a aucune envie qu'on lui
réexplique le principe : il a un problème et il veut le régler. Être *relançable* ne suffit
pas — il faut être **relançable vite**.

**Et l'inverse aussi est une faute** : un refus survenu **pendant la toute première
calibration** garde le ton de la découverte. C'est le moment où l'anxiété est la plus haute ;
la sécheresse du mode réparation y serait lue comme un verdict.

### Portée future

Deux idées écartées du MVP, notées pour ne pas les réinventer :

- **Recalibration passive**, où le jeu affinerait le profil en observant le joueur pendant
  qu'il joue. Séduisant — plus aucune friction — mais il violerait la promesse
  d'attribution du système 1 : le référentiel bougerait sous les pieds du joueur sans qu'il
  le sache, et un même effort ne produirait plus le même effet d'une minute à l'autre. À ne
  rouvrir que si l'on trouve comment le rendre **visible**.
- **Profils multiples par joueur** — casque du soir, micro de portable en déplacement. Vrai
  besoin, mais qui suppose un gestionnaire de profils et une logique de sélection.
  Différé : un changement de périphérique ne force jamais de recalibration, ce qui suffit
  au MVP.

## Detailed Rules

### Le produit : `VoiceProfile`

| Champ | Type | Mesuré ou décidé par | Rôle |
|---|---|---|---|
| `Floor_dB` | float | **Étape 1 — silence** | Plancher de bruit : pièce, bruit propre du micro, respiration normale. Base de la porte `Gate_dB = Floor_dB + Margin_dB` du système 1 |
| `Whisper_dB` | float | **Étape 2 — chuchotement** | Médiane du chuchotement. Ancre du seuil de murmure du système 11, et entrée du diagnostic de chaîne écrasée (*Formulas* §2a) |
| `Rest_dB` | float | **Étape 3 — parole posée** | Niveau de la voix posée. Point d'ancrage de la validation **et** de `r'`, donc des seuils du système 11 |
| `F0_habituel` | float, **absent si `PitchStatus = Unavailable`** | **Étape 3 — parole posée** | Médiane de hauteur. Référence de `Pitch`, et décide la cadence de décimation |
| `Scream_dB` | float | **Étape 4 — montée** | Borne haute de l'échelle de `Loudness` |
| `LowRange` | bool | Validation | Registre étroit mais exploitable : profil accepté, lissage renforcé par le système 1 |
| `PitchStatus` | `Full` · `NoJitter` · `Unavailable` | Étape 3 | Ce que les détecteurs du système 1 ont pu lire de cette voix — `voice-analysis.md`, *Formulas* §4. Lève le drapeau visible **« hauteur indisponible »** hors `Full` |
| `DynamiqueEcrasee` | bool | **Diagnostic**, *Formulas* §4a | La chaîne de capture a rendu une dynamique trop plate pour que les registres se distinguent. **N'empêche rien** : ni refus, ni `LowRange`, aucun effet sur une formule. Sert au message de fin de calibration et au rappel en jeu |
| `Approximate` | bool | Sortie de boucle de refus | **Profil approximatif consenti** après deux refus. Accepté, marqué, et accompagné d'une invitation durable à refaire la mesure |
| `SchemaVersion` | int | Format | Permet de migrer ou d'écarter un profil d'un format antérieur |

**Grandeur dérivée, pas un champ : `r'`.** Calculée au commit, sur le client, par la formule
du système 1 (`voice-analysis.md`, *Formulas* §1, « Position, repos, et où chaque grandeur
existe »). C'est **le seul nombre tiré du profil qui quitte la machine** : envoyé à l'hôte à
la connexion et à chaque recalibration (ADR-0003, *Decision*, chaîne d'analyse, étape 5).

> **Un second scalaire, si le seuil ancré est retenu.** Le système 11 étudie un seuil de murmure
> ancré sur le chuchotement mesuré plutôt que sur une fraction de la voix posée
> (`voice-object-effect.md`, OQ-11.20). S'il l'est, la position du chuchotement `w` (*Formulas* §2a)
> quitte la machine **avec** `r'`, et la décision E5 d'ADR-0003 — « un seul scalaire par joueur » —
> doit être amendée. Tant que la question est ouverte, `w` reste local.

Le profil **appartient au joueur**, persiste entre les sessions sur sa machine, et n'est
jamais lié à une partie.

**Pourquoi quatre mesures et non deux.** `Floor_dB` se mesure quand le joueur **ne parle
pas** : le mesurer pendant qu'il parle poserait le plancher au niveau de sa voix posée, et le
jeu ne réagirait plus qu'aux cris. Et `Rest_dB` a deux métiers. Il **valide** : deux points
ne vérifient qu'un écart, trois points vérifient que la mesure est **plausible** et ordonnée.
Et il **ancre le jeu** : `r'` situe la voix posée entre la porte et le cri, et le système 11 y
pose ses seuils. Un `Rest_dB` mal mesuré ne produit donc plus seulement un profil douteux —
il déplace le seuil de déclenchement du joueur.

**Et le chuchotement ?** Il ne valide rien : aucune validation ne le lit, et un profil sans lui
reste cohérent. Il est là parce que le registre que le jeu protège est le seul dont il ne savait
**rien** — les seuils de murmure se posaient sur une fraction de la voix posée, en pariant que le
chuchotement de chacun tombe dessous. La mesure remplace le pari (*Formulas* §2a), et sert une
seconde fois à reconnaître une chaîne de capture qui écrase les registres (§4a).

---

### Le parcours : une préparation, puis quatre mesures

> **Chaque mesure attend que le joueur la lance.** La consigne s'affiche, et rien ne se mesure avant
> qu'il ait dit qu'il est prêt. Sans cette porte, les étapes s'enchaînent à la vitesse de la machine :
> au prototype, le mot de l'étape 0 a débordé sur le silence, puis la montée a démarré pendant que le
> joueur parlait encore, et le profil a été mesuré sur une voix qui n'avait pas commencé
> (*Revision History*, 2026-09-17). **Le mode découverte promet « aucune hâte » ; cette porte est ce
> qui la garantit.**
>
> **L'étape de silence ajoute un compte à rebours** de quelques secondes après ce départ, le temps que
> le clic et le dernier mot retombent.

**Étape 0 — la préparation.** *Pas une mesure : rien n'est écrit dans le profil.*

1. **La permission micro** est demandée sur un écran dédié, **avant** l'étape de silence :
   la fenêtre du système ne doit jamais tomber sur l'écran délibérément inerte de l'étape 1.
   Un refus de permission est un cas de blocage à part entière, avec un renvoi aux réglages
   du système (*UI Requirements*).
2. **Le périphérique est vérifié par un geste actif** : « dis un mot ». Si rien n'arrive sur
   le périphérique sélectionné dans le délai `DeviceCheck_s`, le sélecteur de périphérique
   s'affiche. Sans ce test, un micro mort traverserait l'étape de silence — le silence d'un
   micro mort ressemble à du silence — et échouerait deux étapes plus loin avec le mauvais
   message.
3. **L'amorce sociale** : une phrase qui prévient, sans détailler la mesure, qu'il faudra
   parler puis hausser un peu la voix — pour laisser le temps de fermer une porte ou de
   prévenir quelqu'un.
4. **Le casque** : au premier lancement, rappel du prérequis et de sa raison (*UI
   Requirements*, « Le casque et les améliorations micro »).

**Étape 1 — le silence.** *« Ne dis rien pendant quelques secondes, respire normalement. »*
On mesure le niveau ambiant, micro ouvert, joueur muet, **respiration comprise**. Produit
`Floor_dB`.

- **Durée : 6 à 8 secondes.** Trois secondes ne donnaient que ~150 trames : un centile haut
  repose alors sur les 7 à 8 échantillons de queue, et deux calibrations de la même pièce
  différaient de plusieurs décibels par pur tirage.
- **La respiration fait partie du plancher, et c'est voulu.** Un plancher mesuré en apnée se
  poserait sous la respiration réelle du joueur, que le jeu entendrait ensuite comme de la
  voix. Mesuré en respirant, il la range sous la porte.
- **La mesure porte sur le `Rms_dB` lissé du système 1** — le même que la porte et que
  `Rest_dB` —, après un temps de chauffe de l'enveloppe (`WarmUp_s`), qui part de `MinDb`.
- **Détecter une parole sans plancher.** Le plancher n'existe pas encore pendant qu'on le
  mesure : la porte de sonie ne peut donc pas servir à reconnaître une parole. L'étape la
  reconnaît par les deux composantes de la porte de voisement qui n'en dépendent pas —
  **périodicité YIN ET jitter au-dessus de `JitterMin`** —, sur `SpeechRun` trames
  consécutives. Une voix, même chuchotée chantée, est alors reconnue quel que soit son
  niveau ; un bourdonnement stable, sans jitter, ne l'est pas et entre légitimement dans le
  plancher.

**Étape 2 — le chuchotement.** *« Chuchote, comme pour confier un secret à quelqu'un juste à côté. »*
Produit `Whisper_dB`, la **médiane** de tout le chuchotement, porte comprise.

- **Pourquoi elle existe.** Le chuchotement est le registre que le Pilier 1 protège, et le seul dont le
  jeu ne savait rien. Mesuré, il sert deux fois : le système 11 y ancre le seuil au-dessus duquel un
  objet bascule en alarme, et la calibration s'en sert pour reconnaître une chaîne de capture qui écrase
  la dynamique (*Formulas* §2a et §4a).
- **Médiane de toutes les trames, porte comprise.** Un chuchotement entièrement sous la porte donne une
  ancre sous la porte, ce qui est juste : il ne pèse rien. **Pas un centile haut** — au micro-perche,
  les bouffées de souffle montent au niveau de la voix posée et feraient croire à une voix écrasée
  (*Revision History*, 2026-09-18).
- **Aucune pulsation, aucun retour de niveau.** Montrer qu'on l'entend pousserait à chuchoter plus fort,
  c'est-à-dire à mesurer autre chose que son chuchotement — même raison qu'à l'étape de silence.
- **L'étape se termine quand le joueur le dit**, une fois `WhisperMin_s` écoulées, ou à l'expiration de
  `WhisperTimeout_s`.

**Étape 3 — la parole posée.** *« Parle normalement, comme si tu discutais. »*
Produit `Rest_dB`, `F0_habituel` et `PitchStatus`.

- **Trois ensembles de trames**, sur le `Rms_dB` lissé et la porte `Gate_dB` du profil en
  cours : `G` (au-dessus de la porte), `Y` (`G` et périodique), `V` (`Y` et jitter
  suffisant). Leur définition et la règle qui en tire `PitchStatus` sont celles du système 1
  (`voice-analysis.md`, *Formulas* §4, « Une voix que les détecteurs lisent mal — jamais un
  refus seul »). Ce document fixe `VoicedMin`, le délai de l'étape et le parcours.
- **L'étape se termine quand le joueur le dit.** Dès que `n(V) ≥ VoicedMin`, un bouton apparaît et
  l'invite à s'arrêter quand il veut ; s'il ne le fait pas, l'étape se termine à l'expiration de
  `Step2Timeout_s`. **Elle ne se coupe pas d'elle-même au minimum atteint** : au prototype, deux
  secondes de voix suffisaient et l'étape s'arrêtait au milieu d'une phrase, ce qui donnait une
  médiane prise sur trop peu de matière et un joueur pris de court (*Revision History*, 2026-09-17).
  Plus de trames ne peuvent que stabiliser la médiane.
- À la fin, la table du système 1 décide : `Full`, `NoJitter`, `Unavailable`, ou — si
  `n(G) < VoicedMin` — l'étape se rejoue.
- **Un profil `Unavailable` n'est accepté qu'à la deuxième tentative consécutive.** Un
  chuchotement par erreur donne le même ensemble qu'une voix réellement apériodique. La
  première fois, le parcours redemande une voix posée (« parle à voix normale, pas en
  chuchotant ») ; la seconde, il accepte, et le drapeau « hauteur indisponible » se lève.
- **La hauteur est prise sous la configuration non calibrée**, recalibration comprise : 8 kHz,
  plage par défaut. Un profil existant ne resserre jamais la recherche pendant qu'on le
  remesure, sans quoi une erreur d'octave de l'ancien profil se reproduirait dans le nouveau.
- **Médiane, jamais moyenne**, pour `Rest_dB` comme pour `F0_habituel` : une erreur d'octave
  ou une toux déplace une moyenne, pas une médiane.
- **Une pulsation « on t'entend »**, non quantitative, s'allume sur chaque trame de `G`. Elle
  n'a pas d'amplitude — ce n'est pas un niveau, et elle ne pose aucune cible. Elle répond à
  trois besoins que rien d'autre ne couvre : le joueur sourd ou malentendant n'aurait sinon
  aucun retour sur trois étapes sur quatre ; tout joueur se demande « est-ce que ça marche » ; et
  un périphérique qui décroche se voit tout de suite.

**Étape 4 — la montée.** *« Monte progressivement, à ton rythme. »*
Produit `Scream_dB`. Le joueur pousse ; un objet réagit en temps réel. **Aucune injonction à
crier fort.**

L'étape se termine de trois façons : **plateau détecté**, **arrêt demandé par le joueur** —
un bouton toujours visible, jamais présenté comme un objectif —, ou **expiration du délai**.
Dans tous les cas, la valeur retenue est le maximum atteint, et c'est la validation qui
décide ensuite si le profil est bon, `LowRange`, ou refusé.

#### La détection de plateau, et son calage obligatoire

Un plateau est déclaré quand le maximum courant **cesse de progresser** de plus de
`PlateauDelta_dB` pendant `PlateauHold_s`, et **jamais avant `PlateauMinDuree_s`**.

> **Ce plancher de durée n'est pas un confort.** Sans lui, une montée progressive se fait couper : au
> prototype, deux montées se sont arrêtées à 1,8 s sur un maximum atteint en 0,6 s, et le `Scream_dB`
> retenu était **plus faible que le plus fort moment de la parole posée** (*Revision History*,
> 2026-09-18). Le profil passait la validation, avec une voix posée artificiellement proche du cri.

> **Mais il ne peut pas être déclaré tant que le profil ne validerait pas.** Tant que la
> plage utile atteinte `M(t) − Gate_dB` reste sous le **plancher dur**, aucun plateau n'est
> reconnu : l'étape continue. Un plateau reconnu trop tôt ferait refuser le profil d'un
> joueur **qui a coopéré**.
>
> Au-dessus du plancher dur mais sous la bande de qualité, le plateau **est** reconnu et le
> profil sera marqué `LowRange`. Le joueur discret est mesuré, signalé, et joue.

---

### States and Transitions

```
Idle → Preparing → MeasuringFloor → MeasuringWhisper → MeasuringRest → MeasuringPeak → Validating → Committed
                                                                                              │
                                                                                              └→ Rejected → (retour à l'étape en cause)
                                                                                                      │
                                                                                                      └→ (2ᵉ refus) OfferingApproximate → Committed | Idle
```

| Transition | Règle |
|---|---|
| `Idle → Preparing` | Lancement explicite. Le profil existant, s'il y en a un, **reste actif** |
| `Preparing → MeasuringFloor` | Permission accordée **et** signal reçu du périphérique sélectionné. Sinon, écran de blocage ou sélecteur de périphérique |
| **entrée dans une étape de mesure** | La consigne s'affiche et l'étape reste en attente ; **aucune trame n'est accumulée** avant le geste « Je suis prêt » et le décompte qui le suit. Aucun délai d'étape ne court pendant l'attente |
| entre étapes | Chaque étape produit ses valeurs dans un **tampon**, jamais dans le profil actif |
| `MeasuringWhisper →` | Sur le geste du joueur après `WhisperMin_s`, ou à `WhisperTimeout_s`. **Ne refuse jamais** : un chuchotement entièrement sous la porte est une mesure valide |
| `→ Validating` | Les quatre mesures ont abouti. Validation décrite en *Formulas* |
| `Validating → Committed` | **Bascule atomique** : le profil complet remplace l'ancien en une opération — voir ci-dessous. `r'` est calculé et remis au système 5 |
| `Validating → Rejected` | Aucune écriture. Le parcours revient à **l'étape en cause**, jamais au début |
| `Rejected → OfferingApproximate` | **Deuxième refus consécutif** dans la même calibration. Le joueur choisit : entrer avec un profil approximatif, ou recommencer. Voir *Formulas* §6 |
| n'importe où → `Idle` | Annulation, ou coupure micro. **Le tampon est jeté en entier ; le profil actif est intact** |

**Une étape interrompue ne se conserve pas partiellement.** Si le micro coupe pendant la
montée, on ne garde pas « le `Scream_dB` atteint jusque-là » : c'est exactement ainsi qu'on
fabrique les profils dégénérés que la validation existe pour refuser.

#### Comment la bascule est atomique, concrètement

Le `VoiceProfile` est une **classe immuable**. Le commit se réduit alors à **publier une
référence**, ce qui est atomique par construction en .NET : `Interlocked.Exchange` côté
commit, `Volatile.Read` côté analyse.

> **Le profil est une classe, et c'est délibéré.** Le transformer en `readonly struct` pour
> économiser une allocation **casserait l'atomicité** : écrire ses champs n'est pas une
> opération indivisible, et on obtiendrait précisément la trame mixte que cette règle existe
> pour empêcher.

**Nous ne touchons à rien d'autre.** Le `Decimator` et le `PitchDetector` doivent être
reconstruits puisque la cadence de décimation dépend du profil — mais ils sont à état, et
c'est **le fil d'analyse** qui s'en charge, en constatant le changement de référence en tête
de trame. La règle vit dans `voice-analysis.md`, *Edge Cases*, « Conséquence
d'implémentation — et la règle de fils d'exécution qui va avec ».

#### Pendant la calibration, la voix du joueur ne joue plus — et le chat se tait

**Tant que la calibration est en cours, la sortie du joueur vers le jeu est forcée à
`Silence`.** Sans cette règle, une recalibration en pleine partie ferait agir les cris de
calibration sur le monde.

**Le chat vocal se tait dans les deux sens**, au lobby comme en jeu : rien de ce que le
joueur produit n'est diffusé, et **rien de ce que disent les autres ne lui est restitué**.
Une voix de coéquipier entendue pendant l'étape de silence — par la fuite d'un casque —
entrerait dans le plancher et gonflerait `Floor_dB`, le pire mode d'échec du système, que
les validations ne voient pas. **Ce silence n'est pas un effet de la pause** : ouvrir un menu
ne gèle que le client local, et la première calibration a lieu au lobby, qui n'est pas en
pause. C'est une exigence adressée au système 14 (*Dependencies*).

#### La recalibration en cours de partie

La recalibration se lance **depuis le menu** ; ouvrir le menu immobilise le personnage, et
**un personnage immobilisé pose ce qu'il porte**. Aucun objet porté ne change donc de poids
en pleine manipulation, et la calibration n'invente aucun cas particulier : elle emprunte
le chemin qu'un porteur qui lâche emprunte de toute façon (système 9).

Il reste une conséquence sociale, et elle est acceptable : les coéquipiers voient un joueur
poser sa moitié de canapé et se figer. C'est lisible **à condition que l'UI dise pourquoi**
(*UI Requirements*).

---

### Interactions

| Système | Ce qu'il attend de nous | Ce qu'on attend de lui |
|---|---|---|
| **1. Analyse vocale** | Un `VoiceProfile` valide, ou rien. Jamais un profil partiel | `Gate_dB`, `r'`, la règle `PitchStatus`, la table des domaines, la liste canonique de ses valeurs — `voice-analysis.md` |
| **2. Audio d'entrée** | Rien — nous ne possédons pas le micro | Les échantillons **par le même trajet qu'en jeu**, signal brut ; la liste des périphériques ; le signalement d'une coupure et de la reprise |
| **5. Réseau** | `r'`, à la connexion et à chaque recalibration | L'acheminement de `r'` vers l'hôte. **Le profil ne traverse jamais le réseau** |
| **8. Session / lobby** | Le verdict « ce joueur a un profil valide » ; son avancement dans le parcours | La porte d'entrée, et un état lisible par les autres joueurs pendant l'attente |
| **11. Effet voix → objets** | `r'` de chaque joueur, sur l'hôte | Rien — il consomme |
| **14. Chat vocal** | **Silence dans les deux sens pendant la calibration**, lobby et jeu | Rien d'autre |
| **19. UI diégétique** | Rien de la jauge de calibration | L'icône « micro coupé » et le sonomètre, hors calibration |

> **Le profil ne part jamais sur le réseau, et ce n'est pas un oubli.** Il contient le
> niveau sonore du domicile et la hauteur de voix du joueur. ADR-0003 fait analyser chaque
> voix en local et ne transmet que des features normalisées. **Un seul scalaire en est
> dérivé vers l'hôte, `r'`** : sans lui, l'hôte ne peut poser aucun seuil personnel
> (système 11) ; il ne révèle ni décibels, ni hauteur.

#### Le mode « réparation »

*Player Fantasy* distingue la première calibration des suivantes. Deux règles en découlent,
qui ne concernent que les relances :

- **Aucune étape pédagogique.** Pas de démonstration, pas d'explication du principe.
- **L'étape en cause se rejoue seule.** Un joueur dont seul le bruit ambiant a changé —
  fenêtre ouverte, ventilateur — rejoue l'étape 1 et rien d'autre. Le profil n'est
  recommité qu'après une **validation complète**, valeurs anciennes et nouvelles mélangées :
  un `Floor_dB` remesuré peut très bien devenir incompatible avec un `Scream_dB` ancien, et
  l'accepter sans revérifier rouvrirait la porte au retournement silencieux.
- **« Refaire ma mesure »**, sans prétexte technique, rejoue le parcours complet au rythme du
  mode réparation. C'est la seconde chance du joueur qui s'est retenu par gêne.

## Formulas

**Chaque valeur provisoire de ce document vit dans une seule liste**, en fin de section
(« Porte de mesure du système 6 »). Les nombres cités ailleurs sont des **témoins de
lecture**, calculés avec les valeurs actuelles ; un test lit la constante nommée, jamais le
nombre recopié. Les valeurs du système 1 — `Margin_dB`, `JitterMin`, `N`, `γ`, `MinDb`, le
facteur `LowRange` — vivent dans sa propre liste canonique (`voice-analysis.md`, *Formulas*,
« Porte de mesure »). Les repères **B2, B7 et C9** désignent des mesures — prototype
navigateur, enregistrements bruts, session hors ligne — classées par la re-revue du système 1
(`design/gdd/reviews/voice-analysis-2026-09-14.md`, §2, listes B et C).

### 1. `Floor_dB` — le plancher de bruit, avec sa marge

```
Bruit     = P95( Rms_dB(t) )     sur l'étape 1, après WarmUp_s, joueur muet respirant normalement
Floor_dB  = Bruit + FloorMargin_dB
Gate_dB   = Floor_dB + Margin_dB                       porte du système 1 — voice-analysis.md §1
```

| Variable | Description |
|---|---|
| `Rms_dB` | Le `Rms_dB` **lissé** du système 1 (*Formulas* §1a) — le même que lisent la porte et `Rest_dB` |
| `P95` | 95ᵉ centile des niveaux observés pendant l'étape de silence |
| `FloorMargin_dB` | Marge au-dessus du bruit mesuré |
| `WarmUp_s` | Durée écartée en tête d'étape : l'enveloppe part de `MinDb` et doit rejoindre le bruit réel |

**Domaine atteignable** : `Floor_dB ≥ MinDb + FloorMargin_dB` (`voice-analysis.md`, *Formulas*
§5, ligne `Rms_dB`). Un plancher plus bas n'est produit par aucune calibration.

**Pourquoi un centile haut et pas le minimum.** Le minimum attrape un creux instantané, sous
le bruit réel de la pièce : le plancher se poserait trop bas. Le maximum, lui, attrape une
porte qui claque. Le P95 dit « le bruit est presque toujours sous cette valeur ».

**Ce que fait la marge, et ce qu'elle ne fait pas.** `FloorMargin_dB` place le bruit
stationnaire et la respiration **sous** `Floor_dB` ; `Margin_dB` du système 1 ajoute par-dessus
la marge de la porte. Les deux s'empilent : **le premier niveau que le jeu entend est
`P95 + FloorMargin_dB + Margin_dB`**, soit une dizaine de décibels au-dessus du bruit avec les
valeurs actuelles. Sous cette porte, `Loudness` vaut exactement 0 : c'est la garantie « quand
je me tais, mon objet cesse de réagir ».

**La marge ne traite pas le vacillement d'une voix posée juste au-dessus de la porte** : le
zéro unique le déplace sans le supprimer, et monter `FloorMargin_dB` rétrécit la plage utile,
donc l'aggrave (`voice-analysis.md`, *Formulas* §1, « Le vacillement à la porte »).

**Exemple** : pièce calme, `P95 = −58 dB` → `Floor_dB = −55 dB` → `Gate_dB = −48 dB`.

#### Reconnaître une parole pendant l'étape de silence

```
Parole ⟺ il existe SpeechRun trames consécutives telles que  IsVoiced_YIN ET JitterPct > JitterMin
```

Si `Parole` est vraie, l'étape est **rejetée et rejouée**, et aucun `Floor_dB` n'est écrit.

- **Aucune porte de niveau** : `Floor_dB` n'existe pas encore. Les deux composantes de la porte
  de voisement qui ne dépendent pas du plancher suffisent à reconnaître une voix, même
  faible — y compris un chuchotement chanté que la porte complète ne verrait pas.
- **Témoin** : un joueur qui dit « ok » pendant l'étape produit ~10 trames périodiques et
  jittées → `Parole` vraie avec `SpeechRun = 5`.
- **Ce que cette garde laisse passer, délibérément** : un bourdonnement stable (sans jitter) et
  le bruit apériodique. Ils font partie de l'environnement du joueur et entrent dans le
  plancher, ce qui est juste.
- **Seconde garde, la stabilité de la pièce** : une pièce **instable** — ventilateur qui démarre,
  rue bruyante par intermittence — produit un bruit fort, non voisé, que la première garde laisse
  passer. Elle se reconnaît à l'écart `P95 − P50 > StabilityMax_dB`.
  **Témoins mesurés** (prototype, 17–18 septembre 2026) : silences propres **2,4 à 4,8 dB** ;
  silence capté derrière la porte de bruit d'un casque **8,3 dB** — chaîne traitée, pièce stable,
  à ne pas rejeter ; étape polluée par un mot de l'étape 0 **57,8 dB**. La valeur provisoire, 12 dB,
  se pose entre la chaîne traitée et la mesure cassée (OQ-C3).

### 2. `Rest_dB`, `F0_habituel` et `PitchStatus` — la parole posée

```
G = { trames de l'étape 3 : Rms_dB > Gate_dB }
Y = { trames de G : IsVoiced_YIN }
V = { trames de Y : JitterPct > JitterMin }

Bouton de fin proposé :  n(V) ≥ VoicedMin
Fin d'étape :            geste du joueur,  ou expiration de Step2Timeout_s

PitchStatus, Rest_dB, F0_habituel :  voice-analysis.md, Formulas §4, avec ce VoicedMin
    Full         Rest_dB = médiane(Rms_dB) sur V    F0_habituel = médiane(F0) sur V
    NoJitter     Rest_dB = médiane(Rms_dB) sur G    F0_habituel = médiane(F0) sur Y
    Unavailable  Rest_dB = médiane(Rms_dB) sur G    pas de F0_habituel
    n(G) < VoicedMin → l'étape se rejoue
```

**Ce bloc applique la règle du système 1 ; en cas d'écart, c'est `voice-analysis.md` §4 qui
fait foi.** Ce document en fixe `VoicedMin`, `Step2Timeout_s`, et le parcours.

**Médianes sur le `Rms_dB` lissé, le même que la porte.** C'est la condition de la garantie
`Rest_dB > Gate_dB` : toutes les trames de `G` — donc de `V` — sont au-dessus de la porte, leur
médiane aussi. D'où `r' > 0` sur les trois chemins (`voice-analysis.md`, *Formulas* §5).

**Médiane, jamais moyenne.** Pour `F0`, une seule erreur d'octave de YIN déplacerait une
moyenne d'une demi-octave ; elle ne déplace pas une médiane. Pour `Rest_dB`, une toux ou un
raclement de gorge ferait le même dégât.

**`Unavailable` à la deuxième tentative seulement.** Un joueur qui chuchote par erreur produit
des trames dans `G` et aucune dans `Y`, exactement comme une voix réellement apériodique. La
première fois, le parcours rejoue l'étape en demandant une voix posée ; la seconde, il
accepte.

**Configuration de mesure de la hauteur.** `F0` est toujours mesuré sous la configuration non
calibrée du système 1 — 8 kHz, plage par défaut —, recalibration comprise. Son domaine est
celui du détecteur (`voice-analysis.md`, *Formulas* §5, ligne `F0_habituel`).

**Témoins.** À ~50 trames par seconde, `VoicedMin = 100` représente **2 secondes de parole
voisée**, environ 3 secondes de parole réelle pauses comprises : atteignable bien avant
`Step2Timeout_s = 15 s`. Un joueur muet ou un micro mort n'alimente pas `G` : l'étape expire
et se rejoue, avec un message qui distingue « on ne t'entend pas du tout » (rien au-dessus de la
porte) de « continue encore un peu ».

**Dépendance d'ordre.** `G` exige `Gate_dB`, donc `Floor_dB` : **l'étape 1 précède l'étape 3
pour une raison arithmétique**, en plus de la raison sociale.

### 2a. `Whisper_dB` — le chuchotement mesuré

```
W = { toutes les trames de l'étape 2 }              porte comprise, aucun filtrage
Whisper_dB = médiane( Rms_dB ) sur W

Fin d'étape :  arrêt demandé par le joueur, possible après WhisperMin_s
               ou expiration de WhisperTimeout_s
```

| Variable | Rôle |
|---|---|
| `W` | Toutes les trames de l'étape, **y compris celles sous `Gate_dB`** |
| `WhisperMin_s` | Durée minimale avant que le bouton de fin d'étape apparaisse |
| `WhisperTimeout_s` | Au-delà, l'étape se termine sur ce qui a été mesuré |

**Domaine atteignable** : `Whisper_dB ≥ MinDb` (`voice-analysis.md`, *Formulas* §5, ligne
`Rms_dB`). **Aucune relation garantie avec `Gate_dB` ni avec `Rest_dB`** : les deux ordres
s'observent, et c'est exactement ce que lit le diagnostic §4a.

**La position du chuchotement, ce que le système 11 consomme**

```
w = clamp( (Whisper_dB − Gate_dB) / (Scream_dB − Gate_dB) , 0 , 1 )
```

`w` n'est **pas un champ du profil** : il se recalcule, comme `r'`. Il vaut 0 pour un
chuchotement entièrement sous la porte — ce qui est juste : ce chuchotement ne pèse rien, et
un seuil ancré sur lui se confond alors avec la formule ordinaire.

**Médiane, jamais un centile haut.** Sur un micro-perche, les bouffées de souffle d'un
chuchotement atteignent le niveau de la voix posée : au prototype, le P90 du chuchotement
(−35,9 dB) dépassait la médiane de la voix posée (−39,4 dB) **sur une chaîne saine**. Une
ancre au P90 aurait déclaré la dynamique écrasée et accusé un micro qui n'y était pour rien
(*Revision History*, 2026-09-18).

**Témoins mesurés.** Sur sept calibrations réelles d'une même personne (prototype
`charge-vocale-etendue`, 17–18 septembre 2026), l'écart `Rest_dB − Whisper_dB` a valu
**−8,5 · 0,5 · 5,5 · 6,9 · 7,1 · 13,2 · 14,5 dB**. **Provenance** : chaîne du système 1
réimplémentée en JavaScript — mêmes dB, même enveloppe, même porte —, sans YIN, un micro-perche,
une pièce, une voix. Les deux plus faibles ont été mesurées avec un traitement de casque actif,
la valeur négative avec un souffle envoyé droit dans la capsule.

**Ce que cette étape ne mesure pas** : l'intelligibilité. Un chuchotement que le jeu entend peut
rester incompréhensible pour un coéquipier — c'est le système 14 qui en décide, pas celui-ci.

### 3. `Scream_dB` — la montée et son plateau

```
M(t)      = max( Rms_dB )  sur [début ; t]

Plateau   ⟺  t ≥ PlateauMinDuree_s                              ← le plancher de durée
          ET  t ≥ PlateauHold_s
          ET  M(t) − M(t − PlateauHold_s) < PlateauDelta_dB
          ET  M(t) − Gate_dB ≥ HardFloor_dB                     ← le calage, obligatoire

Scream_dB = M(t_fin)          t_fin = plateau, arrêt demandé, ou PeakTimeout_s
```

| Variable | Rôle |
|---|---|
| `PlateauDelta_dB` | Progression en deçà de laquelle on considère que ça ne monte plus |
| `PlateauMinDuree_s` | Durée en deçà de laquelle **aucun plateau n’est déclaré**, quelle que soit la stagnation |
| `PlateauHold_s` | Durée sur laquelle cette stagnation doit tenir ; **aucune évaluation avant qu'elle soit écoulée** |
| `PeakTimeout_s` | Au-delà, l'étape se termine sur le maximum atteint |

**La troisième condition est la plus importante.** Tant que la plage utile atteinte reste
sous le plancher dur, **aucun plateau n'est reconnu** : un joueur qui monte lentement ne voit
pas sa montée coupée puis son profil refusé alors qu'il a coopéré. Au-dessus du plancher dur
et sous la bande de qualité, le plateau **est** reconnu : le profil part en `LowRange`.

**Témoin** : `Gate_dB = −48`, maximum stable à `−45` pendant 1,2 s → `M − Gate = 3 < 6` → pas de
plateau, l'étape continue ; le joueur monte à `−36` et s'y tient → `12 ≥ 6` → plateau,
`Scream_dB = −36`.

**Le plancher de durée traite un cas mesuré, pas un confort.** Une montée progressive atteint
son maximum tôt, puis s'y tient le temps que le joueur y arrive vraiment. Sans plancher, la
stagnation est lue comme un plateau et l'étape est coupée : au prototype, deux montées se sont
arrêtées à 1,8 s sur un maximum atteint en 0,6 s, et le `Scream_dB` retenu était **plus faible
que le plus fort moment de la parole posée**. Le profil passait V1 et V2 — il était simplement
faux, avec une voix posée artificiellement collée au cri (*Revision History*, 2026-09-18).

**Témoin** : `PlateauMinDuree_s = 2`, maximum stable dès 0,6 s → aucun plateau avant 2 s, la
montée continue ; le joueur pousse à 2,4 s et le plateau se déclare à 3,6 s.

### 4. La validation — deux refus possibles, deux signalements

**Une constante de validation ne détecte qu'une mesure cassée.** Deux contrôles peuvent
refuser — l'ordre des mesures, et une plage inexploitable. Deux autres ne refusent jamais une
calibration : ils signalent.

#### V1 — l'ordre strict

```
Gate_dB < Rest_dB < Scream_dB           sinon REFUS
```

- **`Gate_dB < Rest_dB`** est garanti par construction pour une calibration (§2) ; le contrôle
  protège un profil chargé ou édité.
- **`Rest_dB < Scream_dB`** peut échouer en direct : une « montée » restée sous la voix posée.
  Le parcours rejoue l'étape 4.
- V1 implique la garde du système 1, `Scream_dB > Gate_dB`, sans laquelle `Loudness` s'inverse
  ou devient une marche (`voice-analysis.md`, *Formulas* §1, « Garde et plancher dur »).

#### V2 — la plage utile, en deux paliers

```
Δ' = Scream_dB − Gate_dB

Δ' <  HardFloor_dB                     → REFUS — deux niveaux ne sont pas distinguables
HardFloor_dB ≤ Δ' < QualityBand_dB     → ACCEPTÉ, LowRange = true
Δ' ≥ QualityBand_dB                    → ACCEPTÉ, LowRange = false
```

- **La plage se mesure au-dessus de la porte**, pas au-dessus du plancher : c'est la seule
  plage que `Loudness` parcourt. Le système 1 le fixe ainsi (`voice-analysis.md`, *Formulas*
  §1, « Garde et plancher dur »).
- **Le plancher dur ne détecte qu'une mesure cassée.** Témoin de sa valeur, à mesurer : environ
  **deux fois l'oscillation trame à trame de `Rms_dB` sur une voix tenue** — sous cet écart, le
  joueur ne peut pas produire deux niveaux distincts. Provenance actuelle : **pari de
  raisonnement, sans protocole** ; la valeur viendra des enregistrements bruts (B7) et de la
  session hors ligne (C9).
- **Témoin de refus** : `Gate_dB = −53`, `Scream_dB = −49` → `Δ' = 4 < HardFloor_dB` → REFUS.
  Cas réel : micro très éloigné ou gain d'entrée très bas.
- **Témoin `LowRange`** : `Gate_dB = −53`, `Scream_dB = −42` → `Δ' = 11` → ACCEPTÉ, `LowRange`.

#### V3 — la position de repos, qui signale et ne refuse pas

```
r' = (Rest_dB − Gate_dB) / (Scream_dB − Gate_dB)       r' ∈ ]0 ; 1[ garanti par V1

r' ≥ RestMax                           → ACCEPTÉ, LowRange = true
```

- **`r'` situe la voix posée dans la plage utile.** Sa formule et son domaine appartiennent au
  système 1 (`voice-analysis.md`, *Formulas* §1 et §5).
- **Plus de borne basse.** `r' > 0` par construction : une étape 3 ratée ne produit pas un `r'`
  proche de 0, elle produit `n(G) < VoicedMin` et se rejoue (§2).
- **Une voix posée proche de son maximum n'est pas une mesure cassée.** Elle peut venir d'un
  joueur qui ne peut pas ou ne veut pas crier — logement partagé la nuit, dysphonie,
  hypophonie, suites d'opération ORL. **Elle est acceptée et marquée `LowRange`** : la plage au
  dessus de sa voix posée est étroite de fait. Le message **invite** à refaire la montée, il ne
  l'exige pas.
- **Témoin** : `Floor_dB = −70`, `Rest_dB = −25`, `Scream_dB = −22` → `Gate_dB = −63`, `Δ' = 41`,
  `r' = 38 / 41 ≈ 0,93 ≥ RestMax` → ACCEPTÉ, `LowRange`.
- **Borne incluse** : `r' = RestMax` exactement lève le drapeau.

#### V4 — la hauteur de référence, contrôlée au chargement

```
PitchStatus ≠ Unavailable  ET  F0_habituel ∉ domaine du détecteur     → REFUS au chargement
```

- **Le domaine** est celui du système 1 (`voice-analysis.md`, *Formulas* §5, ligne
  `F0_habituel`) — `[69,6 ; 666,7] Hz` avec la configuration non calibrée actuelle. **Aucune
  borne propre à ce document** : ni plancher à 20 Hz, ni plafond à 500 Hz.
- **Une calibration ne peut pas produire une valeur hors domaine** : la hauteur y est mesurée
  sous cette configuration (§2). **Témoin atteignable** : un fichier corrompu ou édité, revalidé
  au chargement.
- **Aucune voix n'est refusée sur sa hauteur.** Une voix d'enfant, aiguë, est dans le domaine ;
  une voix que les détecteurs lisent mal est `NoJitter` ou `Unavailable`, jamais refusée.

#### Ordre, verdict et message

- Les validations sont des conditions indépendantes : **le verdict ne dépend pas de l'ordre
  d'évaluation**.
- **Priorité du message**, si plusieurs échouent : en direct, V1 puis V2 ; au chargement,
  version de schéma, puis V1, V2, V4.
- `LowRange` se lève si V2 **ou** V3 le demande.

### 4a. Le diagnostic de chaîne de capture — il signale, il n'accuse pas, il ne refuse jamais

Un casque de jeu peut traiter la voix avant que le jeu la reçoive : réduction de bruit,
compression, normalisation. Le traitement rapproche les registres, et **aucune calibration ne
recrée un écart qui n'arrive plus**. Le diagnostic existe pour que le joueur le sache, **pas
pour l'écarter**.

```
ÉcartChuchotement = Rest_dB − Whisper_dB
ÉcartCri          = Scream_dB − Rest_dB
ÉcartMontée       = Scream_dB − max( Rms_dB )  sur l'étape 3

souffle       ⟺  ÉcartChuchotement < 0
MontéeFaible  ⟺  ÉcartMontée < MonteeFaible_dB

DynamiqueEcrasee ⟺  NON souffle
                 ET ( ÉcartChuchotement < EcartVoixChuchote_dB
                      OU ( ÉcartCri < EcartCriVoix_dB ET NON MontéeFaible ) )
```

**Ce diagnostic n'est pas une validation.** Il ne refuse pas, ne lève pas `LowRange`, n'entre
dans aucune formule. `souffle` et `MontéeFaible` ne sont même pas stockés : ils ne servent
qu'à choisir le message affiché juste après la mesure. Seul `DynamiqueEcrasee` est écrit au
profil, pour le rappel en jeu.

#### L'ordre de lecture est la partie importante

Trois fausses accusations du matériel ont été trouvées au prototype en trois jours
(*Revision History*, 2026-09-18). Elles venaient toutes du même défaut : conclure au micro
avant d'avoir éliminé la mesure.

1. **`souffle` d'abord.** Un chuchotement arrivé **plus fort** que la voix posée n'est pas une
   compression : un compresseur rapproche des niveaux, il ne les inverse pas. La cause est le
   souffle envoyé droit dans la capsule. Le message propose de refaire le chuchotement en
   soufflant moins fort ou légèrement à côté du micro, **et ne nomme pas le matériel**.
   **Témoin** : `Whisper_dB = −29,0`, `Rest_dB = −37,5`, crête à −1,8 dBFS.
2. **`MontéeFaible` ensuite.** Si le cri ne dépasse que de peu le plus fort moment de la parole
   posée, c'est la montée qui a été écourtée, pas la dynamique qui manque. Le message propose de
   refaire l'étape 4. Le matériel n'est mis en cause **que si le chuchotement est lui aussi
   écrasé** — d'où le `ET NON MontéeFaible` sur la seule branche du cri.
   **Témoin** : deux montées coupées à 1,8 s, `Scream_dB` sous le plus fort moment de la parole
   posée ; la garde `PlateauMinDuree_s` (§3) traite la cause, ce test traite ce qui reste.
3. **`DynamiqueEcrasee` en dernier**, quand les deux autres explications sont écartées.

#### Les seuils sont des heuristiques, et le document le dit

`EcartVoixChuchote_dB` et `EcartCriVoix_dB` **ne détectent pas une mesure cassée** : ils séparent
deux chaînes de capture qui produisent toutes deux un profil valide. Ils ne sont donc pas des
constantes de validation au sens du principe des seuils personnels, et **c'est précisément
pourquoi ils ne peuvent rien refuser**.

**La marge mesurée est très mince** : sur les sept calibrations citées en §2a, une chaîne traitée
a donné 5,5 dB et une chaîne saine 6,9 dB. **1,4 dB sépare les deux populations connues**, sur une
seule personne. Valeur provisoire, à reprendre quand d'autres voix et d'autres micros auront été
mesurés (OQ-C17).

#### Ce que le joueur voit, et ce qu'on ne lui fait jamais

Décision du propriétaire, 2026-09-17 : **ne jamais bloquer, informer de ce qui est perdu,
inviter à désactiver le traitement, et laisser jouer en connaissance de cause** — « qu'il ne
puisse pas se dire *c'est le jeu qui est mal fait*, alors que c'est son micro qui l'a bridé ».

- Le message **nomme la perte**, pas le coupable : « ton cri n'arrive que 7 dB au-dessus de ta
  voix » dit ce qui manque et se vérifie ; « ton micro compresse » est un verdict que la mesure
  ne permet pas.
- Il **invite** à chercher le traitement dans le logiciel du casque ou les améliorations audio
  du système, et **propose** de recalibrer ensuite. Aucune de ces actions n'est exigée.
- Le profil est **écrit et jouable** dans tous les cas, sans mention dans un classement ni dans
  la partie des autres joueurs.
- En jeu, `DynamiqueEcrasee` autorise un rappel **au plus une fois par session** quand un
  chuchotement déclenche une alarme — sinon le joueur conclut que le jeu est injuste. Le rappel
  est une ligne, jamais un panneau modal (*UI Requirements*).

### 5. La cadence de décimation, décidée par le profil

```
DecimationHz = ( 2 · F0_habituel > 600  ET  SampleRate multiple de 12 000 )  ?  12 000  :  8 000

Plage de recherche = [ max(70 ; F0_habituel / 2) ; min(PlafondHz ; 2 · F0_habituel) ]
   PlafondHz = 600 Hz à 8 kHz · 900 Hz à 12 kHz

PitchStatus = Unavailable  →  aucune détection de hauteur
```

Ces règles reprennent le système 1 et ADR-0004. Ce document est **l'endroit où la décision
est prise**, puisque c'est le profil qui la détermine.

- **La branche 12 kHz n'existe que si le `SampleRate` d'entrée est un multiple de 12 000** — 48
  ou 96 kHz parmi les fréquences courantes. À 44,1 kHz, une voix aiguë reste à 8 kHz et sa
  plage est plafonnée à 600 Hz : les hauteurs de ses cris au-delà deviennent non voisées. Le
  contrat de fréquence du système 2 en décide (`voice-analysis.md`, *Formulas* §5).
- **Conséquence d'implémentation** : le `Decimator` et le `PitchDetector` du système 1 sont
  **reconstruits à la réception du profil**, jamais à la construction de l'analyseur.

### 6. La sortie de la boucle de refus — le profil approximatif

```
Refus consécutifs dans une même calibration  =  2   →   proposer le profil approximatif

Profil approximatif :
    Floor_dB, Rest_dB, F0_habituel, PitchStatus   de la dernière tentative
    Scream_dB = max( Scream_dB mesuré ; max Rms_dB de l'étape 3 )
    exige V1 :  Gate_dB < Rest_dB < Scream_dB
    Approximate = true,  LowRange = true
```

- **Le joueur consent explicitement** : « entrer avec une mesure approximative » ou
  « réessayer ».
- **Aucune valeur n'est inventée.** Le `Scream_dB` retenu est le plus fort niveau réellement
  mesuré sur les étapes 2 et 3 : il est donc au-dessus de la médiane `Rest_dB`, ce qui rétablit
  l'ordre strict sans substitution.
- **Le plancher dur ne s'applique pas au profil approximatif** : c'est précisément le refus que
  le joueur consent à dépasser. V1 s'applique, parce qu'elle garde `Loudness` d'une inversion.
- **Le seul cas où la porte reste fermée** est celui où V1 échoue malgré tout : **rien n'a
  franchi la porte**, ou le signal est parfaitement constant. Ce n'est pas une voix
  inhabituelle, c'est une capture qui ne fonctionne pas — le parcours bascule sur le diagnostic
  du périphérique.
- **Témoin** : deux refus V2 consécutifs, `Gate_dB = −53`, `Scream_dB = −49`, plus fort niveau de
  l'étape 3 à `−51` → `Scream_dB` retenu `−49`, `Δ' = 4` → profil approximatif commité,
  `Approximate` et `LowRange` levés ; V1 tient.
- **Le compte des refus** repart de zéro à chaque commit et à chaque retour à `Idle`. Une étape
  rejouée sans refus — parole pendant le silence, chuchotement, trop peu de parole — ne compte
  pas.
- Le profil approximatif **porte une invitation durable** à refaire la mesure au calme, sans
  jamais bloquer.

### Porte de mesure du système 6 — la liste canonique des valeurs provisoires

**Critère d'entrée : une valeur y figure si et seulement si elle attend une mesure.** Les
valeurs du système 1 y sont nommées, jamais chiffrées. Les nombres de cette table sont les
seuls de ce document ; partout ailleurs, on y renvoie.

| Valeur | Provisoire | Plage sûre | Propriétaire | Statut | Se fixe par |
|---|---|---|---|---|---|
| Durée de l'étape 1 | 7 s | 6 – 8 s | Système 6 | PROVISOIRE | Écart de `P95` entre deux calibrations d'une même pièce (B7) |
| `WarmUp_s` | 0,5 s | 0,3 – 1 s | Système 6 | PROVISOIRE | Convergence de l'enveloppe depuis `MinDb` |
| Centile du plancher | P95 | P90 – P98 | Système 6 | PROVISOIRE | B7 |
| `FloorMargin_dB` | 3 | 1 – 6 | Système 6 | PROVISOIRE | Part de trames à `Loudness = 0` quand le joueur se tait (B2), **avec** `Margin_dB` du système 1 |
| `StabilityMax_dB` — écart `P95 − P50` | 12 | 10 – 20 | Système 6 | PROVISOIRE depuis le 2026-09-18 | Silences réels ; un seuil bas marquerait une porte de bruit de casque (OQ-C3) |
| `SpeechRun` | 5 trames | 3 – 10 | Système 6 | PROVISOIRE | Enregistrements de silences avec et sans paroles |
| `DeviceCheck_s` | 5 s | 3 – 8 s | Système 6 | PROVISOIRE | Playtest du parcours |
| `VoicedMin` | 100 trames | 60 – 200 | Système 6 | PROVISOIRE | Stabilisation de la médiane ; ne pas allonger le mode réparation |
| `Step2Timeout_s` | 15 s | 12 – 20 s | Système 6 | PROVISOIRE | Playtest ; ne pas pénaliser une parole entrecoupée |
| `PlateauDelta_dB` | 1,5 | 1 – 3 | Système 6 | PROVISOIRE | Montées réelles, **avec** les deux suivants |
| `PlateauHold_s` | 1,2 | 0,8 – 2 | Système 6 | PROVISOIRE | idem |
| `PeakTimeout_s` | 10 | 8 – 15 | Système 6 | PROVISOIRE | idem |
| `HardFloor_dB`, sur `Δ'` | 6 | 4 – 8 | Système 6 | PROVISOIRE — pari de raisonnement, sans protocole | ≈ 2 × oscillation trame à trame de `Rms_dB` sur voix tenue (B7, C9) |
| `QualityBand_dB`, sur `Δ'` | 13 | 10 – 17 | Système 6 | PROVISOIRE — pari de raisonnement | B7, C9 |
| `RestMax`, sur `r'` | 0,80 | 0,70 – 0,90 | Système 6 | PROVISOIRE | Statistiques sur calibrations réelles |
| `WhisperMin_s` | 4 s | 3 – 6 s | Système 6 | PROVISOIRE | Stabilisation de la médiane du chuchotement sur calibrations réelles |
| `WhisperTimeout_s` | 20 s | 15 – 30 s | Système 6 | PROVISOIRE | Playtest ; un chuchotement continu est fatigant |
| `PlateauMinDuree_s` | 2 s | 1,5 – 3 s | Système 6 | PROVISOIRE — garde du prototype, 2026-09-18 | Montées réelles (B7) ; témoin : deux montées coupées à 1,8 s sans elle |
| `EcartVoixChuchote_dB` — diagnostic §4a | 6 | 5 – 9 | Système 6 | PROVISOIRE — **heuristique, ne refuse rien** | Écarts `Rest_dB − Whisper_dB` sur d'autres voix et d'autres micros (OQ-C17) |
| `EcartCriVoix_dB` — diagnostic §4a | 12 | 10 – 15 | Système 6 | PROVISOIRE — **heuristique, ne refuse rien** | idem |
| `MonteeFaible_dB` — diagnostic §4a | 3 | 2 – 5 | Système 6 | PROVISOIRE | Montées réelles ; distingue une montée écourtée d'une dynamique absente |
| `Margin_dB`, `JitterMin`, `N`, `γ`, `MinDb`, facteur `LowRange` | — | — | **Système 1** | voir `voice-analysis.md` | voir `voice-analysis.md` |

**Décisions, hors de la liste parce qu'elles n'attendent pas de mesure** : deux refus avant le
profil approximatif (décision du propriétaire, 2026-09-15) ; l’ordre des quatre étapes ; la
médiane plutôt que la moyenne.

**Ordre de mesure.** Ces valeurs ne se règlent pas indépendamment de celles du système 1 :
`FloorMargin_dB` et `Margin_dB` d'abord, **ensemble** ; puis le plancher dur et la bande de
qualité, qui portent sur `Δ'` que les premières déplacent ; `RestMax` en dernier, sur des
calibrations déjà passées. **La séquence canonique est écrite dans `voice-analysis.md`**,
*Open Questions*, OQ-4. **La règle qui la rend soutenable : enregistrer le signal brut une
fois, dériver hors ligne, rejouer toujours.**

## Edge Cases

Chaque entrée nomme la **condition exacte**, la **résolution exacte**, et sa sévérité :
**bloquant** (le système produit un profil faux sans le signaler), **dégradant** (profil
médiocre mais honnête) ou **cosmétique**.

### Avant et pendant la mesure

- **Si la permission micro est refusée** : écran de blocage dédié, qui dit ce qui manque et où
  l'accorder dans les réglages du système. **Bloquant si non traité** — la calibration
  échouerait en silence, sans aucun des messages prévus.

- **Si le périphérique sélectionné ne transmet rien** : l'étape 0 le détecte (« dis un mot ») et
  affiche le sélecteur. **Bloquant si non traité** — un micro mort traverserait l'étape de
  silence et échouerait deux étapes plus loin, sous un message qui parlerait d'orientation.

- **Si le micro coupe ou change pendant une étape** : l'étape est annulée, **le tampon est jeté
  en entier**, retour à `Idle`, profil actif intact. **Bloquant si non traité** — conserver « le
  `Scream_dB` atteint jusque-là » fabrique exactement les profils dégénérés que la validation
  existe pour refuser.

- **Si le joueur parle pendant l'étape de silence** : la garde de parole le reconnaît (*Formulas*
  §1) et l'étape se rejoue. **Bloquant si non traité** — `Floor_dB` se poserait au niveau de sa
  voix, et toute parole normale donnerait ensuite `Loudness = 0`.

- **Si un bruit transitoire survient pendant l'étape de silence** — porte, chien, notification :
  le P95 y est robuste, un transitoire court ne déplace pas un centile haut. **Cosmétique.** En
  revanche un bruit *soutenu* — aspirateur, circulation — élève légitimement le plancher :
  c'est l'environnement réel du joueur.

- **Si un bruit cyclique change d'état entre la calibration et le jeu** — compresseur de frigo,
  chauffage, ventilation. Les deux sens existent, et ils ne font pas le même dégât :
  - *calibré à l'arrêt, joué en marche* : le bruit peut franchir la porte → **entrée fantôme**,
    l'objet réagit quand le joueur se tait ;
  - *calibré en marche, joué à l'arrêt* : la porte reste trop haute → **le chuchotement devient
    invisible**, le registre que le Pilier 1 protège.

  **Dégradant, non détectable par la validation.** Mitigations : l'étape de 6 à 8 secondes
  réduit le tirage ; la relance rapide répare. Un contrôle de cohérence léger à l'entrée en
  partie est une piste nommée (OQ-C12).

- **Si le joueur ne parle pas assez à l'étape 3** : l'étape expire et se rejoue. **Dégradant.**
  Le message distingue « on ne t'entend pas du tout » de « continue encore un peu ».

- **Si le joueur chuchote à l'étape 3** : ses trames sont dans `G` mais pas dans `Y`. La première
  fois, l'étape se rejoue avec une demande de voix posée ; la seconde, le profil est accepté en
  `Unavailable`. **Le système se protège tout seul, sans exclure une voix réellement
  apériodique.**

- **Si la parole est entrecoupée** — bégaiement, dysarthrie : `VoicedMin` compte des trames, pas
  une continuité, et `Step2Timeout_s` laisse le temps. **Le message ne présume jamais une cause
  de volume.**

- **Si le signal écrête pendant l'étape 4** : `Scream_dB` mesure **le plafond du micro, pas celui
  de la voix**. Le profil reste utilisable, mais tout ce que le joueur produit au-delà devient
  indiscernable. **Dégradant, et à signaler** : le message demande de **baisser le gain d'entrée
  ou d'éloigner légèrement le micro** — un écrêtage analogique, dans le préampli du casque, ne
  disparaît pas en baissant un curseur logiciel.

- **Si le joueur monte très vite à l'étape 4** : le plateau est reconnu presque immédiatement.
  Ce n'est pas un défaut. **Cosmétique.**

- **Si le joueur change de distance au micro entre les étapes** : la calibration mélange deux
  référentiels. Les cas francs tombent sous V1 ou V2, **les cas légers passent**. **Dégradant,
  partiellement détectable** — l'UI demande de ne pas bouger.

- **Si le système d'exploitation ou le périphérique traite le signal avant le jeu** — AGC de
  communication de Windows, pilotes constructeur, AGC matériel des casques USB, bascule d'un
  casque Bluetooth en profil main libre. Le profil **dérive pendant la session** alors que
  chaque validation voit un instantané cohérent. **Dégradant, non détectable** : l'UI demande de
  désactiver les améliorations micro, au même rang que le prérequis du casque ; une mesure de
  dérive est à mener au POC audio (OQ-C12).

- **Si le gain d'entrée est très bas** : toutes les validations travaillent en décibels relatifs,
  et un profil sous-alimenté passe. Le rapport signal sur bruit se dégrade, surtout pour le
  chuchotement. **Dégradant, non détecté** (OQ-C13).

- **Si le joueur recalibre en jeu sur haut-parleurs** : les voix des coéquipiers entreraient dans
  l'étape de silence et gonfleraient `Floor_dB`. **Le chat vocal se tait dans les deux sens
  pendant la calibration** (système 14), ce qui ferme ce chemin quel que soit le matériel. Pour
  le reste du jeu, **aucune annulation d'écho ne protège l'analyse** : une annulation
  auto-référencée serait possible, elle est refusée pour son coût et parce que le casque est un
  prérequis (ADR-0003, alternatives 7 à 9).

### À la validation

- **Si la plage utile tombe juste sous le plancher dur** : refus, et **le joueur a coopéré**. Le
  message porte sur le micro et la pièce, jamais sur sa voix. Au deuxième refus, le profil
  approximatif est proposé. **Bloquant, mais c'est le comportement voulu.**

- **Si la voix posée est proche du maximum mesuré** (`r' ≥ RestMax`) : **accepté, `LowRange`**.
  Jamais un refus : ce n'est pas une mesure cassée.

- **Si les détecteurs du système 1 lisent mal une vraie voix** : `PitchStatus = NoJitter` ou
  `Unavailable`, profil accepté, drapeau « hauteur indisponible ». **Jamais un refus.**

- **Si la source n'est pas une voix humaine** — télévision, musique, une autre personne : aucun
  contrôle ne l'attrape. Les validations vérifient la cohérence des mesures, pas leur
  provenance. **Dégradant, non détectable, et il faut le dire.**

- **Si `2 · F0_habituel` tombe près de 600 Hz** : deux calibrations de la même personne peuvent
  basculer entre 8 et 12 kHz. **Cosmétique** — une hystérésis est une piste nommée (OQ-C14).

- **Si `2 · F0_habituel` dépasse 900 Hz même à 12 kHz** : la plage est clampée et la perte
  documentée. **Dégradant.** À surveiller en playtest **avec de vraies voix d'enfant**.

- **Si le `SampleRate` n'est pas un multiple de 12 000** : une voix aiguë n'a pas de branche
  12 kHz, et les hauteurs de ses cris sont perdues. **Dégradant** ; `Loudness` n'est pas
  touchée. Le contrat de fréquence du système 2 en décide.

- **Si deux refus se suivent** : profil approximatif proposé (*Formulas* §6). **Sauf si rien n'a
  franchi la porte** : c'est la capture qui ne marche pas, et le parcours passe au diagnostic
  du périphérique.

### Persistance et reprise

- **Si le profil sur disque est illisible ou corrompu** : il est traité comme **absent**.
  Calibration forcée. **Jamais de chargement partiel.**

- **Si le profil vient d'une version antérieure du format** : il se migre, ou il est traité
  comme absent. **Le profil porte un numéro de version de schéma.**

- **Si un profil valide à l'écriture devient invalide parce que la configuration a changé** —
  plancher dur relevé, `Margin_dB` monté au point que `Scream_dB ≤ Gate_dB` : **revalidation à
  chaque chargement**. Un profil qui échoue redevient absent, avec un message qui endosse la
  responsabilité — « nos réglages ont changé, il faut refaire une mesure ». **Bloquant si non
  traité** : un profil hors normes continuerait de piloter la normalisation sans que rien ne le
  signale.

- **Si `F0_habituel` sort du domaine du détecteur dans un profil chargé** : fichier corrompu ou
  édité → absent. **Bloquant si non traité.**

- **Si une étape est rejouée seule** : le profil n'est recommité qu'après une **validation
  complète**, valeurs anciennes et nouvelles mélangées. **Bloquant si non traité.**

- **Si un profil approximatif est rechargé** : il se charge normalement et garde son
  invitation, jusqu'au premier commit non approximatif. **Sa revalidation applique la version
  de schéma, V1 et V4, pas le plancher dur** — sans quoi le consentement du joueur serait
  annulé au lancement suivant et il retrouverait la porte fermée. **Bloquant si non traité.**

### Le profil qui devient faux sans que rien ne casse

- **Si le joueur calibre dans un environnement et joue dans un autre** — calibré au calme le
  matin, joue le soir avec la télévision allumée : entrée fantôme. **Dégradant.**

- **Si le joueur change de micro** : un changement de périphérique **ne force jamais de
  recalibration** — ces événements se déclenchent souvent à tort, et éjecter un joueur en plein
  contrat serait le pire moment. **Mais le profil peut devenir faux en silence.**

> **Ces cas ne se détectent pas de façon fiable, et c'est précisément pourquoi la calibration
> doit être relançable à tout moment et rapidement.** L'accès permanent n'est pas un confort :
> c'est **la seule mitigation** d'une classe de défauts que rien ne signale. Le joueur est le
> capteur, et le mode réparation est le filet de sécurité de tout le système.

## Dependencies

Ce document reprend la distinction posée par `voice-analysis.md` : une **dépendance de
conception** empêche de *spécifier* tant que l'autre ne l'est pas ; une **dépendance
d'exécution** empêche de *fonctionner* une fois en marche. Les confondre fabrique des cycles
fantômes.

### Le tableau

| Système | Nature | Sens | Interface |
|---|---|---|---|
| **1. Analyse vocale** | **DURE — conception** | mutuelle | Chaque champ du profil existe parce qu'une de ses formules le réclame. Nous en citons `Gate_dB`, `r'`, la règle `PitchStatus` (§4), la table des domaines atteignables (§5), la liste canonique de ses valeurs et la règle de fils d'exécution (*Edge Cases*, « Conséquence d'implémentation »). Il lit `LowRange` et multiplie ses constantes de temps `τ` |
| **2. Audio d'entrée** | **DURE — exécution** | il nous pousse | Les échantillons **par le même trajet qu'en jeu**, signal brut ; la fréquence d'échantillonnage livrée ; la liste des périphériques ; les événements de coupure, de changement et de « capture reprise » |
| **5. Réseau** | exécution | il transporte | **`r'` seul**, du client vers l'hôte, à la connexion et à chaque recalibration (ADR-0003, *Decision*, chaîne d'analyse, étape 5). Le profil ne traverse jamais le réseau |
| **8. Session / lobby** | consommateur | il lit | Le verdict « ce joueur a un profil valide », la porte d'entrée qui en découle, l'avancement du parcours pour l'affichage aux autres |
| **11. Effet voix → objets** | consommateur | il lit, via le système 5 | `r'` de chaque joueur, sur l'hôte — et `w`, la position du chuchotement, **si le seuil ancré est retenu** (*Detailed Rules*, `VoiceProfile`). Ses seuils sont des positions dans la plage utile ; il ne lit ni `Rest_dB` ni aucun champ en décibels |
| **14. Chat vocal** | **contraint** | il se tait | **Silence dans les deux sens pendant la calibration**, au lobby comme en jeu |
| **7. 3C** et **9. Portage** | contraint | ils immobilisent et posent | Ouvrir le menu immobilise le personnage ; un personnage immobilisé pose ce qu'il porte |
| **19. UI diégétique** | voisin | il signale | L'icône « micro coupé » visible par le joueur seul et l'option d'accessibilité « afficher mon volume », qui ramènent vers le diagnostic et la calibration |

**Une seule dépendance de conception, et elle est satisfaite** : le système 1 a été révisé
le premier dans la passe groupée. C'est ce qui rend ce document écrivable maintenant.

### Le cycle apparent 1 ↔ 6, et pourquoi ce n'en est pas un

L'index déclare que 6 dépend de 1 et 2 ; le système 1, lui, ne produit rien sans notre
profil. Cela ressemble à un cycle et n'en est pas un : **les deux vivent dans la même
assembly** (ADR-0006) et partagent les mêmes primitives internes. Ce n'est pas une
dépendance entre modules, c'est une collaboration interne. `voice-analysis.md` le démontre ;
ce document s'y range.

### La calibration vit dans deux assemblies, et la ligne compte

| Ce qui vit où | Assembly | Testable sans Unity |
|---|---|---|
| Mesures, médianes, ensembles `G`/`Y`/`V`, détection de plateau, **validations**, calcul de `r'` | `SUAC.Voice.Core` — `noEngineReferences` | **Oui** |
| **Machine à états du parcours**, compte des refus, profil approximatif | `SUAC.Voice.Core` | **Oui** |
| **Sérialisation du profil, version de schéma, revalidation au chargement** | `SUAC.Voice.Core` | **Oui** |
| Écrans, objet de l'étape 4, **E/S fichier** | Couche Unity | Non |

**Tout ce qui peut produire un profil faux est du côté testable.** La règle de partage :
**Unity lit et écrit des octets, et affiche ; Core décide de tout le reste.** Désérialiser,
versionner, revalider, refuser, proposer le profil approximatif et choisir l'étape à rejouer
sont des décisions ; l'accès disque et le rendu n'en sont pas. La revalidation au chargement
n'est pas un cas exotique : tant qu'une valeur de la liste canonique reste provisoire, des
profils enregistrés cesseront un jour de valider.

---

### Ce que les GDD voisins devront porter

Cohérence bidirectionnelle exigée par les règles du projet. Les systèmes 2, 5, 7, 8, 9, 14 et
19 n'ont pas encore de GDD ; les systèmes 1 et 11 en ont un.

**Système 1 — Analyse vocale** *(porté, `voice-analysis.md`)*
- `Gate_dB`, `r'` et sa disponibilité, la règle `PitchStatus`, la table des domaines, la règle
  de fils d'exécution, le facteur `LowRange` appliqué à `τ`.
- **Reste à porter** : exposer le détecteur d'écrêtage comme une information, et non plus
  seulement comme la condition d'un gel (OQ-C2).

**Système 2 — Audio d'entrée**
- Livrer les échantillons **par le même trajet qu'en jeu** : signal brut, **aucun traitement
  qui modifie la dynamique ou la forme d'onde dans la bande vocale** — la règle unique
  d'ADR-0003. Un AGC actif pendant la calibration rendrait la mesure absurde : il égaliserait
  justement l'écart qu'on cherche à mesurer.
- Même **cadence fixe** qu'en jeu. Calibrer sur un trajet et jouer sur un autre invaliderait la
  mesure sans que rien ne le signale.
- **Publier la fréquence d'échantillonnage livrée** : la branche 12 kHz n'existe que si elle
  est un multiple de 12 000 (*Formulas* §5).
- Être **déjà en marche** avant le lancement de la calibration.
- Signaler **coupure**, **changement de périphérique** et **capture reprise**, pour l'annulation
  d'étape et le diagnostic.

**Système 5 — Réseau**
- Acheminer **`r'`**, et lui seul parmi les grandeurs tirées du profil, vers l'hôte, à la
  connexion et à chaque recalibration — **plus `w` si le seuil ancré du système 11 est retenu**,
  auquel cas ADR-0003 change de décision, pas ce document.

**Système 8 — Session / lobby**
- Porter la **porte d'entrée** : un joueur sans profil valide ne rejoint pas.
- Rendre l'attente lisible pour les autres — l'étape en cours, ou « rencontre une
  difficulté » —, plutôt qu'un silence qui se lit comme un plantage.
- Trancher si le groupe peut démarrer sans le joueur en calibration (OQ-C10).

**Système 11 — Effet voix → objets** *(porté, `voice-object-effect.md`)*
- Consommer des **positions**, jamais un champ en décibels : aucun seuil ne lit `Rest_dB` ni `Whisper_dB`.
- **Trancher le seuil ancré** (OQ-11.20) : s'il est retenu, `w` rejoint `r'` parmi les grandeurs
  transmises à l'hôte, et ADR-0003 doit être amendé. Sinon, `Whisper_dB` ne sert qu'au diagnostic
  de *Formulas* §4a et reste local.
- **Rester jouable sur une chaîne de capture qui écrase la dynamique** : c'est la contrepartie de
  l'invitation non contraignante sur les améliorations micro (*UI Requirements*). Un joueur dont le
  chuchotement arrive au niveau de sa voix posée doit pouvoir jouer sans être puni en permanence.

**Système 14 — Chat vocal**
- **Pendant la calibration, rien ne part et rien n'arrive** : aucune diffusion de ce que le
  joueur produit, **et aucune restitution de ce que disent les autres**, au lobby comme en jeu.
  Le système 14 en est le propriétaire, et un critère `[INTEG]` le vérifie (CAL-54).
- **Cette règle ne découle d'aucun état de pause.** En réseau, ouvrir un menu ne gèle que le
  client local, et la voix transite par un canal découplé de cet état ; la première
  calibration, elle, a lieu au lobby, qui n'est jamais en pause.

**Systèmes 7 et 9 — 3C et Portage : rien à ajouter, une confirmation à obtenir**
- La recalibration en jeu repose sur un comportement générique : ouvrir le menu immobilise le
  personnage, et un personnage immobilisé **pose ce qu'il porte**. **Nous ne demandons aucun
  comportement spécial** : nous empruntons le chemin d'un porteur qui lâche.
- Il reste à vérifier, au moment d'écrire ces GDD, que ce chemin **existe** (OQ-C9).

**Système 19 — UI diégétique**
- **L'icône « micro coupé », visible par le joueur seul**, même si elle n'est pas diégétique :
  aucun sens corporel ne détecte un micro mort. Elle ouvre le diagnostic du périphérique et la
  calibration.
- **L'option d'accessibilité « afficher mon volume »**, désactivée par défaut. Sa conception lui
  appartient.
- **L'écran de calibration n'est pas le sien** : l'objet de l'étape 4 appartient à ce document
  (*Visual/Audio Requirements*), et il ne doit pas ressembler au sonomètre de jeu — confondre
  les deux dirait au joueur qu'il joue alors qu'il se règle.

---

### Le prérequis du casque — la seule mitigation, et ce qu'elle ne couvre pas

*Shut Up & Carry !* se joue **au casque avec micro** : c'est une condition d'entrée, pas une
recommandation de confort (décision du propriétaire du 2026-09-08). **Aucune annulation d'écho
ne protège l'analyse** : le casque est la seule mitigation (ADR-0003). Une annulation
auto-référencée serait réalisable — le jeu génère lui-même les voix qu'il restitue — ; elle est
refusée pour son coût et parce que la population concernée est écartée par le prérequis
(ADR-0003, alternatives 7 à 9). Un joueur sur haut-parleurs verra **son meuble s'alourdir quand
ses coéquipiers parlent**.

Pendant la calibration, le chemin le plus grave — les voix des coéquipiers mesurées comme bruit
ambiant, donc un `Floor_dB` gonflé que les validations ne voient pas — est fermé **quel que soit
le matériel** par le silence du chat dans les deux sens (système 14).

Deux limites restent, et elles sont nommées ailleurs : le prérequis **exclut structurellement**
des joueurs qui ne peuvent pas porter de casque (*UI Requirements*, « Accessibilité » ; OQ-C15),
et il ne dit rien des traitements que le système d'exploitation applique avant le jeu (*Edge
Cases* ; OQ-C12).

## Tuning Knobs

**Les valeurs sont dans la liste canonique** (*Formulas*, « Porte de mesure du système 6 ») et
nulle part ailleurs. Cette section dit **ce que chaque curseur fait au joueur** et **comment ils
se contrarient**.

### L'arbitrage à exposer avant tous les autres

> **Honnêteté du signalement contre friction du parcours.**

Depuis le principe du 2026-09-14, aucun curseur de ce document n'a le droit d'**exclure** une
voix : une voix inhabituelle est acceptée, au besoin marquée. Et depuis la décision D2, personne
ne reste devant la porte après deux refus. L'ancien axe « inclusion contre qualité » n'existe
donc plus sous cette forme. Ce qui reste :

- **Durcir** un seuil qui refuse — le plancher dur — envoie plus de joueurs dans la boucle
  refus, refus, profil approximatif : plus de friction, et des profils approximatifs qui
  auraient pu être propres.
- **Desserrer** un seuil qui signale — la bande de qualité, `RestMax` — marque moins de joueurs
  `LowRange` : moins de lissage inutile, mais des registres étroits qui jouent sans la
  protection prévue pour eux.

Ce que ces curseurs doivent faire, c'est **rendre l'arbitrage visible** plutôt que le figer
implicitement — même discipline qu'au système 1.

### Les curseurs

| Curseur | Ce qu'il gouverne | Trop haut | Trop bas |
|---|---|---|---|
| Durée de l'étape 1 | Stabilité du plancher d'une calibration à l'autre | le joueur attend en silence, plus inconfortable qu'il n'y paraît | le `P95` repose sur quelques trames de queue ; deux calibrations de la même pièce diffèrent de plusieurs décibels |
| `WarmUp_s` | Trames écartées pendant que l'enveloppe rejoint le bruit réel | on jette de la mesure utile | le plancher part de `MinDb` et s'abaisse à tort |
| Centile du plancher | Ce que le plancher tolère du bruit | les transitoires entrent, le plancher monte | le plancher descend sous le bruit réel : entrée fantôme |
| `FloorMargin_dB` | Distance entre le bruit mesuré et `Floor_dB` | la porte monte, la plage utile `Δ'` rétrécit, le chuchotement devient invisible | le bruit stationnaire et la respiration franchissent la porte |
| `StabilityMax_dB` | Tolérance d'une pièce instable à l'étape 1 | une pièce qui change d'état passe et fausse le plancher | on rejoue l'étape pour une pièce simplement vivante |
| `SpeechRun` | Longueur d'une parole reconnue pendant le silence | un « ok » bref passe et gonfle le plancher | un bruit brièvement périodique fait rejouer l'étape |
| `DeviceCheck_s` | Patience du test « dis un mot » | un micro mort fait attendre avant le sélecteur | un joueur lent à répondre voit le sélecteur à tort |
| `VoicedMin` | Stabilité des médianes de l'étape 3 | l'étape 3 s'éternise, insupportable en mode réparation | une erreur d'octave ou une toux pèse trop lourd |
| `Step2Timeout_s` | Temps laissé à une parole entrecoupée | un micro mort fait attendre | un bégaiement ou une dysarthrie ne finit pas l'étape |
| `PlateauDelta_dB` | Ce qu'on appelle « ça ne monte plus » | le plateau se déclare pendant la montée : `Scream_dB` sous-estimé | le plateau ne se déclare jamais, le délai termine l'étape |
| `PlateauHold_s` | Durée pendant laquelle le cri doit tenir | tenir un cri longtemps : fatigant, désagréable | une inspiration déclenche un faux plateau |
| `PeakTimeout_s` | Durée maximale de la montée | on laisse pousser trop longtemps, mauvais pour toute voix | on coupe la montée d'un joueur lent |
| `HardFloor_dB`, sur `Δ'` | Frontière entre plage inexploitable et plage étroite | des joueurs qui ont coopéré passent par la boucle de refus | deux niveaux indistinguables sont acceptés |
| `QualityBand_dB`, sur `Δ'` | Frontière du lissage renforcé | trop de joueurs lissés sans nécessité, jeu plus mou pour eux | des registres étroits jouent sans lissage, `Loudness` sautille |
| `RestMax`, sur `r'` | Voix posée proche du cri : signalement `LowRange` | des voix posées très hautes jouent sans lissage renforcé | des profils ordinaires sont marqués et lissés |
| `WhisperMin_s` | Matière minimale sous la médiane du chuchotement | chuchoter longtemps fatigue et pousse à forcer, donc à mesurer autre chose | la médiane tient sur quelques trames et varie d'une calibration à l'autre |
| `WhisperTimeout_s` | Patience de l'étape 2 | un joueur qui ne comprend pas la consigne reste bloqué | l'étape se termine avant qu'il ait commencé |
| `PlateauMinDuree_s` | Durée avant qu'un plateau puisse être déclaré | tenir un cri plus longtemps que nécessaire | une montée progressive est coupée à son premier palier, `Scream_dB` sous-estimé |
| `EcartVoixChuchote_dB` | Seuil du message « dynamique écrasée » sur le chuchotement | des chaînes saines reçoivent le message et le joueur soupçonne son matériel à tort | une chaîne qui écrase vraiment passe inaperçue et le joueur croit le jeu injuste |
| `EcartCriVoix_dB` | Idem, sur l'écart entre le cri et la voix posée | même défaut, sur les joueurs qui crient peu | idem |
| `MonteeFaible_dB` | Ce qui distingue une montée écourtée d'une dynamique absente | des montées honnêtes sont proposées à refaire | le message accuse le matériel alors que l'étape 4 a été bâclée |

> **Les trois derniers ne sont pas des curseurs de jouabilité.** Ils ne changent aucune règle du
> jeu : ils décident **d'un texte**. Mal réglés, ils ne cassent rien — ils font dire une bêtise au
> jeu sur le matériel du joueur, ce qui coûte de la confiance et rien d'autre (*Formulas* §4a).

**Le facteur `LowRange` n'est pas un curseur de ce document.** Le drapeau est décidé ici ; le
facteur qui multiplie les constantes de temps `τ` de l'enveloppe appartient au système 1 (sa
liste canonique ; *Tuning Knobs*, « Le facteur `LowRange` vient du système 6 »).

### Les interactions — tourner un curseur peut en annuler un autre

**`FloorMargin_dB` et `Margin_dB` s'empilent.** Le premier niveau que le jeu entend est
`P95 + FloorMargin_dB + Margin_dB` (*Formulas* §1). Monter l'un **ou** l'autre relève `Gate_dB`,
rétrécit `Δ' = Scream_dB − Gate_dB`, et rapproche des profils de `LowRange` puis du refus — sans
qu'on ait touché ni au plancher dur ni à la bande de qualité. **Ils se règlent ensemble, avant
eux** (ordre canonique : `voice-analysis.md`, OQ-4).

**Le plancher dur est désormais la seule défense contre le faux cri.** `RestMax` ne refuse plus :
il signale. Baisser le plancher dur au nom de l'inclusion n'a donc plus de filet derrière lui —
mais il n'en a plus besoin non plus, puisque le joueur refusé deux fois entre quand même.

**`RestMax` agit sur le jeu, pas seulement sur le drapeau.** Un joueur à `r'` élevé a ses seuils
d'objet haut placés dans sa plage utile (système 11) : sa voix posée déclenche l'alerte, et son
chuchotement dispose d'une large marge. Le baisser marque plus de joueurs `LowRange`, donc les
lisse, sans changer leurs seuils.

**Le trio du plateau — `PlateauDelta_dB`, `PlateauHold_s`, `PeakTimeout_s`.** Si le plateau
devient difficile à déclencher, **le délai devient le vrai terminateur** : la mesure dépend de la
patience du joueur, plus de l'endroit où il a plafonné. **Ces trois-là se règlent ensemble ou pas
du tout.**

**`VoicedMin` et `Step2Timeout_s` contre le mode réparation.** Plus de trames donnent une meilleure
médiane et une étape plus longue ; *Player Fantasy* pose qu'une relance doit être **rapide**, et
CAL-57 lui donne une cible. Régler `VoicedMin` sur la qualité seule dégrade le parcours qui compte
le plus ; régler `Step2Timeout_s` sur la vitesse seule exclut la parole entrecoupée.

**`HardFloor_dB` et le calage du plateau.** Le plateau ne se déclare pas sous le plancher dur
(*Formulas* §3). Monter le plancher dur allonge donc aussi l'étape 4 des joueurs discrets.

### Ce qui n'est pas un curseur

- **L’ordre des quatre étapes.** Silence, puis chuchotement, puis parole, puis montée. C'est un contrat, doublement :
  `G` exige `Gate_dB`, donc `Floor_dB` ; et commencer par le geste le moins exposant rend la suite
  acceptable.
- **Le calage du plateau sur le plancher dur.** On peut déplacer le plancher dur ; on ne peut pas
  **découpler** la détection de plateau de la validation, sans ramener le refus d'un joueur qui a
  coopéré.
- **V1, l'ordre strict `Gate_dB < Rest_dB < Scream_dB`.** Une garde de correction, sans valeur à
  choisir.
- **Médiane et non moyenne.** Une méthode, choisie pour la robustesse aux erreurs d'octave.
- **Le domaine de V4.** Il vient du détecteur du système 1 ; il n'y a pas de borne de hauteur
  propre à ce document.
- **La mesure de `F0` sous la configuration non calibrée**, recalibration comprise.
- **Deux refus avant le profil approximatif** — décision du propriétaire du 2026-09-15.
- **`r'` seul vers l'hôte** — décision E5.
- **La revalidation au chargement**, non négociable tant qu'une valeur de la liste canonique reste
  provisoire.
- **`γ`.** Il ne déplace aucun seuil : les seuils du système 11 comparent des positions dans la
  plage utile, en amont de `γ` (`voice-analysis.md` §1). Scinder `γ` en deux usages n'a plus
  d'objet.

## Visual/Audio Requirements

**Contrairement au système 1, celui-ci a une image et un son.** Le système 1 transforme un micro
en nombres et n'affiche rien ; la calibration est un écran qu'on regarde pendant deux minutes, et
c'est le premier du jeu.

La section reste au niveau **exigence** — ce qui doit être communiqué, jamais à quoi cela
ressemble. La direction visuelle évoluera quand un graphiste entrera dans l'équation.

### Le principe qui gouverne toute la section

> **Les canaux de retour de la calibration doivent être ceux du jeu.**

Si la calibration donne au joueur un retour qu'il n'aura plus ensuite, elle ne l'entraîne pas :
**elle lui apprend un mensonge**, et il devra désapprendre au premier contrat. Ce principe tranche
à lui seul le sidetone, l'exemple à imiter, la réécoute — **et ce que montre l'étape 4**.

### L'étape 4 montre une conséquence, pas un niveau

*Décision D1 du 2026-09-15.* En jeu, la voix qui monte **alourdit** le meuble porté. L'étape de
montée montre donc **un objet qui réagit** : il frémit, s'alourdit, devient récalcitrant à mesure
que la voix monte au-dessus de la porte. Une jauge qui monte enseignerait « fort, c'est bien » —
l'inverse du jeu, dans le seul moment d'apprentissage qu'il se donne.

- **Réponse en temps réel**, pilotée par le même `Rms_dB` lissé que la mesure : aucun lissage
  supplémentaire qui découplerait l'objet de la voix. Le joueur doit sentir le lien de cause à
  effet.
- **L'objet ne réagit à rien sous `Gate_dB`** : ce qui ne compte pas en jeu ne se montre pas ici.
- **Échelle élastique, jamais de butée.** `Scream_dB` n'existe pas encore pendant qu'on le mesure :
  la réaction de l'objet suit l'écart au-dessus de la porte, et l'échelle s'étend quand le joueur
  pousse. **Il reste toujours de la place au-dessus** ; l'objet n'atteint jamais un état final
  qu'on pourrait viser.
- **Aucune cible, aucun plafond, aucun score.** C'est le point le plus contre-intuitif de la
  section.
- **La clôture vient du plateau, pas d'une cible.** Quand le plateau est reconnu — ou que le joueur
  arrête —, l'objet se pose et une confirmation dit que la mesure est faite. Pas de cible ne veut
  pas dire pas de fin.

> **Pourquoi une cible ruinerait la mesure.** Montrer une zone à atteindre transforme l'étape en
> test, et un test appelle **l'effort minimal suffisant pour le réussir**. Le joueur pousserait
> jusqu'à la ligne puis s'arrêterait, et on mesurerait notre propre seuil au lieu de son amplitude.
> On ne mesure pas s'il atteint quelque chose : on mesure où il s'arrête tout seul.

**La forme exacte de la réaction — frémissement, poids, résistance — se choisit dans la
mini-calibration du prototype navigateur**, qui l'affiche avant toute implémentation.

### L'étape 0 et l'étape 3 confirment qu'on entend, sans mesurer

- **Étape 0** : quand le « dis un mot » arrive, une confirmation visible le dit.
- **Étape 3** : une **pulsation « on t'entend »** sur chaque trame au-dessus de la porte (*Detailed
  Rules*). **Binaire, sans amplitude** : ni niveau, ni cible, ni progression vers un seuil.

C'est ce qui donne au joueur sourd ou malentendant un retour sur **chaque** étape où il parle, et
à tout joueur la réponse à « est-ce que ça marche ».

### Ce qu'on ne montre jamais

- **Aucun indicateur de niveau pendant l'étape 1.** Un vumètre vivant pendant le silence **invite
  à le faire bouger** — exactement ce qui ruine la mesure du plancher. L'attente se signale par une
  progression neutre, qui ne réagit pas à la voix, et qui ne laisse **aucun doute que le jeu
  fonctionne**.
- **Aucune valeur chiffrée.** Ni décibels, ni hertz, ni pourcentage de « qualité ».
- **Aucun exemple à imiter.** Faire écouter « voilà un cri correct » pose une cible et transforme
  une mesure en imitation, donc en performance jugée.
- **Aucune réécoute.** Faire entendre au joueur ce qu'on a enregistré de lui est désagréable pour
  beaucoup, et suppose de conserver de l'audio.

### Les étapes se distinguent au premier regard — et jamais par la couleur seule

Elles demandent des choses différentes, et un joueur qui ne remarque pas le changement de consigne
exécute la précédente. **La distinction se porte visuellement**, par la forme, la disposition ou
l'objet présent, **jamais par la seule couleur** ; pas par un texte qu'on suppose lu, et pas par un
son (règle suivante).

### L'étape de silence est vraiment silencieuse

> **Aucun son n'est émis pendant l'étape 1.** Pas de clic d'interface, pas d'ambiance, pas de
> musique, pas de bip de transition.

Un casque fuit, et le pire mode d'échec du système est un **`Floor_dB` gonflé** — un plancher posé
au-dessus du bruit réel rend la voix posée invisible, sans qu'aucune validation ne le voie.
Quelques secondes de silence complet coûtent moins qu'un profil faux.

Le reste du parcours peut sonner normalement. Une confirmation à la fin est bienvenue : plus rien
ne peut être pollué.

### Pas de sidetone, pour la même raison qu'au système 1

Le jeu n'injecte pas de retour de la voix du joueur — ni en jeu, ni ici. **Un sidetone présent à la
calibration et absent en jeu apprendrait au joueur à s'écouter, alors que le jeu lui demandera de
regarder.**

### Les drapeaux — visibles, actionnables, jamais un verdict

`LowRange`, `Approximate` et « hauteur indisponible » changent ce que le joueur vivra ensuite. Les
cacher serait malhonnête ; les annoncer comme un défaut serait pire.

- **Toujours accompagnés de ce qu'ils changent et d'une action possible**, jamais obligatoire.
- **Jamais un badge, un score, ni une couleur d'alerte.** Ce n'est pas un échec : c'est le système
  qui fait son travail d'inclusion.
- **Jamais visibles par les autres joueurs.** Ce sont des informations sur le matériel, le logement
  et le corps de quelqu'un.

### Le langage visuel du refus

Un refus est un **réglage à reprendre**, pas une erreur commise. Le vocabulaire visuel de l'erreur
— rouge, croix, icône d'alerte — dirait au joueur qu'il a raté quelque chose, alors que la cause est
presque toujours son micro ou sa pièce. Le joueur ne doit jamais ressentir que **le jeu juge sa
voix**.

### Ce qu'on ne conserve pas

> **La calibration ne garde aucun audio. Jamais.** Le profil contient les champs du tableau
> `VoiceProfile` (*Detailed Rules*), et rien d'autre n'est écrit sur le disque. **Un seul nombre
> en est dérivé vers l'hôte, `r'`** ; ni décibels, ni hauteur ne quittent la machine.

C'est une exigence de confiance plus que technique. Un jeu qui demande le micro dès le premier
lancement et fait crier ses joueurs doit dire, en clair et sans qu'on le lui demande, **ce qu'il
garde, ce qu'il envoie, et ce qu'il ne garde pas**.

**Les enregistrements bruts qui fixeront les valeurs provisoires** (*Formulas*, « Ordre de mesure »)
sont un protocole de développement, avec des participants consentants. Ils n'existent pas dans le
jeu livré.

## UI Requirements

### Les écrans requis

- **Amorce de la permission micro** — avant toute mesure, et **écran de blocage** si elle est
  refusée
- **Test et sélecteur de périphérique** — « dis un mot »
- **Écran de calibration** — première utilisation, bloquant jusqu'au commit d'un profil, propre ou
  approximatif
- **Offre de profil approximatif** — après deux refus consécutifs
- **Accès à la calibration** depuis le menu du lobby **et** depuis le menu en jeu, dont **« Refaire
  ma mesure »**
- **Indicateur d'état vocal permanent** — `Uncalibrated` / `Calibrated` / `Degraded` — **distinct du
  sonomètre diégétique**
- **Écran de blocage** pour qui tente de rejoindre sans profil valide
- **Message de prérequis matériel** — le casque, et **l'invitation** à désactiver les améliorations micro, voir plus bas
- **Rappel de dynamique écrasée en jeu** — une ligne, au plus une fois par session, pour le profil marqué `DynamiqueEcrasee`

### Le parcours

Le vrai problème d'UX de ce jeu n'est pas technique : **il faut demander à quelqu'un de crier dans
son micro, et beaucoup de joueurs sont dans un salon avec d'autres gens.** La calibration se
présente comme **le réglage d'un instrument**, jamais comme une épreuve à réussir.

1. **La préparation** — permission, « dis un mot », amorce sociale (« dans un instant, il faudra
   parler, puis hausser un peu la voix »), casque. Rien n'est mesuré.
2. **Le silence** — « ne dis rien pendant quelques secondes, respire normalement ».
3. **Le chuchotement** — « chuchote, comme pour confier un secret à quelqu'un juste à côté ».
   Aucun retour de niveau, et **c'est le joueur qui met fin à l'étape**.
4. **La parole posée** — « parle normalement, comme si tu discutais ». **Le joueur y met fin
   lui-même** une fois qu'il en a assez dit ; le bouton apparaît quand la mesure est suffisante.
5. **La montée**, progressive, avec **l'objet qui réagit**. Le joueur pousse à son rythme ; un
   **bouton d'arrêt** reste toujours visible, jamais présenté comme un objectif ; **jamais d'ordre
   frontal** du type « crie le plus fort possible ».

> **Aucune mesure ne démarre sans le joueur.** Chaque étape affiche sa consigne et attend
> « **Je suis prêt** », puis un court décompte avant que la première trame soit prise. Sans cette
> porte, les étapes s'enchaînent avant qu'on ait fini de lire — constaté au prototype le
> 2026-09-17, où la consigne de l'étape suivante arrivait pendant qu'on exécutait la précédente,
> et où un mot de la préparation a été mesuré comme du silence.


Garanties non négociables :

- **Rien ne part et rien n'arrive** par le chat vocal pendant la calibration. Moment privé, même en
  multijoueur.
- **« Ne bouge pas par rapport au micro »**, dit explicitement : changer de distance entre les
  étapes mélange deux référentiels, et les cas légers passent toutes les validations.
- **Une étape se rejoue seule**, sans repasser par les précédentes.
- **« Si crier te fait mal, arrête-toi »** — dit avant la montée. Le bouton d'arrêt n'est pas une
  défaite, et la validation accepte ce que le joueur a donné.

### Deux modes, et ils ne se ressemblent pas

| | **Découverte** — la première fois | **Réparation** — toutes les suivantes |
|---|---|---|
| Ce que veut le joueur | Comprendre | Que ce soit fini |
| Rythme | Aucune hâte | **Le plus court possible** — cible en CAL-57 |
| Explications | Oui, c'est le moment d'onboarding | **Aucune** |
| Point d'entrée | Le parcours complet | **L'étape en cause, directement** ; ou le parcours complet via « Refaire ma mesure » |

**Traiter une relance comme une première fois est une faute** : lui réexpliquer le principe punit
le joueur d'avoir eu un incident. **L'inverse aussi** : un refus survenu pendant la toute première
calibration **garde le ton de la découverte**.

### Refus, reprises et signalements

**En direct, deux validations peuvent refuser (V1, V2) ; au chargement s'ajoutent la version de
schéma et V4 ; et plusieurs situations font rejouer une étape sans être des refus.** Chaque ligne de ce tableau a son propre
identifiant de message (CAL-35).

| Situation | Nature | Ce qu'on dit, en substance | Reprise |
|---|---|---|---|
| Rien ne sort du micro au test | Préparation | « On ne reçoit rien de ce micro — choisis-en un autre ou vérifie qu'il est branché » | Sélecteur de périphérique |
| Parole reconnue pendant le silence | Étape rejouée | « On a entendu quelque chose — on refait juste ces quelques secondes de silence » | Étape 1 |
| Rien au-dessus de la porte à l'étape 3 | Étape rejouée | « On ne t'entend pas du tout — vérifie le micro sélectionné » | Étape 3, sélecteur proposé |
| Trop peu de parole à l'étape 3 | Étape rejouée | « Continue encore un peu, comme si tu racontais quelque chose » | Étape 3 |
| Chuchotement, première tentative | Étape rejouée | « Parle à voix normale, pas en chuchotant » | Étape 3 |
| V1 — la montée reste sous la voix posée | Refus | « On n'a pas capté de montée — on refait juste cette étape, à ton rythme » | Étape 4 |
| V2 — plage inexploitable | Refus | « On n'arrive pas à distinguer ta voix calme de ta voix plus forte — rapproche un peu le micro » | Étape 4 |
| Deuxième refus consécutif | Offre | « Tu peux entrer avec une mesure approximative : le jeu réagira un peu moins finement, et tu pourras la refaire quand tu veux » — ou « Réessayer » | Profil approximatif ou étape en cause |
| Rien n'a franchi la porte, même approximativement | Diagnostic | « Ton micro ne semble pas nous parvenir » | Sélecteur de périphérique |
| Écrêtage pendant la montée | Accepté, signalé | « Ton micro sature : baisse son volume d'entrée **ou éloigne-le légèrement**, puis refais la montée » | Étape 4 proposée ; l'écrêtage est revérifié |
| Chuchotement arrivé plus fort que la voix posée | Étape proposée | « Ton chuchotement est arrivé plus fort que ta voix — le souffle a frappé le micro de plein fouet. Refais-le en soufflant moins, ou en parlant un peu à côté du micro » ; **le matériel n'est pas mis en cause** | Étape 2 proposée, jamais imposée |
| Montée trop proche de la parole posée | Étape proposée | « Ta voix forte n'est pas montée beaucoup plus haut que ta voix normale — tu peux refaire la montée si tu veux » | Étape 4 proposée |
| Dynamique écrasée par la chaîne de capture | Accepté, signalé | « Ton cri n'arrive que quelques décibels au-dessus de ta voix. Souvent, c'est un traitement du casque ou du système qui rapproche les volumes. Si tu le désactives et refais la mesure, le jeu distinguera mieux tes registres — sinon, tu peux jouer comme ça » | Aucune imposée ; « Refaire ma mesure » reste offert |
| `LowRange` par la plage (V2) | Accepté, signalé | « Ta plage est un peu étroite, le jeu s'y adapte — rapprocher le micro peut aider » | Aucune imposée |
| `LowRange` par la position (V3) | Accepté, signalé | « Ta voix de conversation est proche de ta voix forte — le jeu s'y adapte ; tu pourras refaire la montée quand tu veux » | Aucune imposée |
| Hauteur indisponible | Accepté, signalé | « Le jeu n'arrive pas à lire la hauteur de ta voix. Le volume et le portage marchent normalement ; certaines actions liées à la hauteur pourraient ne pas répondre » | Aucune imposée |
| Profil approximatif en vigueur | Rappel durable | « Ta mesure est approximative — la refaire au calme rendra le jeu plus précis » | « Refaire ma mesure » |
| Chargement : une validation échoue (V1, V2, V4) | Profil absent | « Nos réglages ont changé, il faut refaire une mesure » | Parcours complet, mode réparation |
| Chargement : fichier illisible ou ancien format | Profil absent | « On n'a pas pu relire ta mesure, il faut la refaire » | Parcours complet, mode réparation |

Règles de rédaction, valables pour toutes :

- **Aucun vocabulaire technique** — ni dB, ni plage, ni hauteur fondamentale.
- **Orienté cause probable, jamais verdict sur la personne.** Le ton est celui d'un réglage
  matériel imparfait, jamais celui d'une performance vocale insuffisante.
- **Ne jamais présumer une cause de volume** quand la parole manque : un bégaiement ou une
  dysarthrie produisent aussi une étape 3 lente.
- **Ne jamais renvoyer au début** quand une seule étape est en cause.
- **Le chargement endosse la responsabilité** : « nos réglages ont changé », jamais « ton profil
  est invalide », qui laisserait croire qu'il a mal fait quelque chose il y a trois semaines.
- **Priorité**, si plusieurs validations échouent : celle de *Formulas* §4.

> **L'écrêtage est le seul cas qui exige une action hors du jeu, et ne rien dire aurait un coût
> durable** : un micro qui sature aplatit tout le registre haut du joueur **pour toute la
> partie**, et il n'en saura jamais rien. Un écrêtage analogique, dans le préampli du casque, ne
> disparaît pas en baissant un curseur logiciel — d'où « éloigne-le légèrement ».

### La porte d'entrée en partie

Un joueur sans profil est bloqué, et ses amis l'attendent déjà. Le blocage se lit comme **une étape
restante, pas comme une exclusion** :

- Annoncer une durée courte et estimée, et enchaîner sur la calibration **en un seul geste**.
- Les autres joueurs du lobby voient **l'étape en cours**, ou « rencontre une difficulté » après un
  refus — plutôt qu'un « termine sa configuration » statique, qui finit par se lire comme un
  plantage.
- Tout le parcours reste opérable **au clavier et à la souris seuls**.

### Le casque et les améliorations micro

**Le casque avec micro est une condition d'entrée du jeu.** L'UI le dit **avant** que le joueur
découvre que ça marche mal.

- **Au premier lancement**, avant la calibration — pas enterré dans un menu d'options.
- Formulé comme un **prérequis matériel**, au même rang que la configuration minimale.
- **Il dit pourquoi.** Une consigne sans raison sera ignorée, et le joueur vivra un jeu **cassé
  sans soupçonner la cause**. Une phrase suffit — *« sur haut-parleurs, le jeu entend tes
  coéquipiers et croit que c'est toi »*.
- **Au même rang, et sur le même ton : les améliorations du micro** — égaliseur automatique de
  volume, suppression de bruit, effets du pilote ou du logiciel du casque. Elles changent la voix
  pendant la session, et le profil devient faux sans que rien ne le signale (*Edge Cases*). Un
  casque Bluetooth dont le micro est actif bascule en qualité réduite : le dire aussi.
- **C'est une invitation, jamais une exigence** (décision du propriétaire, 2026-09-17). Demander à
  un joueur de désactiver les fonctions de son casque pour jouer est une friction que beaucoup ne
  sauront pas lever : **l'idéal est qu'il joue avec son matériel tel qu'il l'utilise tous les
  jours**. Le message dit **ce qui est perdu**, propose le réglage, et laisse entrer dans tous les
  cas. La contrepartie est écrite ailleurs : le jeu doit rester jouable sur une chaîne traitée, ce
  que la mesure du chuchotement et les seuils du système 11 prennent en charge.
- **Le jeu ne peut pas contourner ce traitement, et parfois ne peut même pas le voir.** Mesuré le
  2026-09-17 : un traitement logé dans la carte son du casque arrive **avant** toute API que le jeu
  peut interroger — il perdait une vingtaine de décibels de dynamique, sans qu'aucun réglage côté
  jeu n'y change quoi que ce soit. Le seul recours honnête est *a posteriori* : le diagnostic de
  *Formulas* §4a, qui constate la perte sur les mesures et la nomme.
- **Aucun blocage technique.** On ne détecte pas un casque de façon fiable ; tenter de le faire
  empêcherait des joueurs équipés de jouer. On informe, on n'interdit pas.
- **Répéter le message si la configuration le suggère** — sortie sur haut-parleurs identifiée par le
  système d'exploitation, par exemple. Indice faible, jamais un blocage.

### La recalibration en cours de partie

La recalibration se lance depuis le menu ; le personnage pose ce qu'il porte et se fige (*Detailed
Rules*). **Les coéquipiers doivent comprendre pourquoi** : un état lisible sur son avatar ou dans le
bandeau d'équipe, sans quoi le comportement se confond avec une déconnexion ou un joueur parti
manger.

### `Degraded` et le micro coupé

L'état `Degraded` appartient au système 1, et l'icône « micro coupé » au système 19 ; **c'est vers
nous qu'ils conduisent**.

- **Toujours visible par le joueur concerné pendant `Degraded`**, dans le HUD et pas seulement dans
  un menu : un sonomètre à zéro est indiscernable d'un joueur qui se tait, et le sonomètre est lu
  par les autres.
- **Déclenché en moins d'une à deux secondes.** Au-delà, le joueur conclut au bug.
- **Accès immédiat au diagnostic** : choix du périphérique et relance de la calibration, en un geste
  depuis l'alerte.

> **Il n'existe aucune solution de repli.** La voix n'a pas d'équivalent clavier : la seule sortie
> de secours est de rétablir l'entrée micro, pas de la remplacer.

### Accessibilité

**Garanti, et vérifié par un critère** (*Acceptance Criteria*, H) : opérabilité complète au clavier
et à la souris sur tous les écrans ; texte redimensionnable ; toute instruction écrite ; **aucune
étape ne repose sur l'audition** — confirmation visible à l'étape 0, pulsation à l'étape 3, objet à
l'étape 4 ; aucune distinction par la couleur seule ; aucun flash ni pic sonore pendant la
calibration ; phrase de santé vocale avant la montée ; aucun message qui présume une cause de
volume.

**Inclus, et c'est l'objet du système** : un joueur qui ne peut pas ou ne veut pas crier —
voisinage, enfant qui dort, gêne, dysphonie, hypophonie, suites d'opération ORL — obtient un profil
`LowRange` ; une voix que les détecteurs lisent mal obtient « hauteur indisponible » ; un joueur
refusé deux fois entre avec un profil approximatif. **Aucune de ces populations n'est exclue.**

**Exclu, et nommé comme tel** — deux exclusions, pas une :

- **Un joueur qui ne peut pas produire de voix du tout.** Aucun mode clavier ne remplace l'entrée
  vocale sans redéfinir le pilier du jeu. Exclusion assumée.
- **Un joueur qui ne peut pas porter de casque** — implant cochléaire ou aide auditive
  incompatible, contre-indication médicale, hypersensibilité sensorielle. Le prérequis du casque
  l'exclut structurellement : il peut jouer, mais sur haut-parleurs le jeu entend ses coéquipiers.
  **Documenté, pas résolu** (OQ-C15).

L'option « afficher mon volume » du système 19 complète ce dispositif pour les joueurs sourds et
malentendants en jeu ; elle ne concerne pas la calibration.

## Acceptance Criteria

### Ce qu'un critère doit valoir ici

Même exigence qu'au système 1 : **un testeur doit pouvoir le vérifier sans avoir lu ce
document**. Étiquettes identiques — `[UNIT]` automatisable hors Unity et bloquant, `[INTEG]`
plusieurs systèmes ou persistance et bloquant, `[HUMAIN]` mesure ou playtest et consultatif sauf
mention. **EN ATTENTE** : écrit, non exécutable tant que la dépendance nommée n'est pas levée.

Le découpage d'ADR-0006 paie ici comme ailleurs : **toute la logique qui peut produire un profil
faux est en `[UNIT]`.** La couche Unity ne décide rien, donc elle n'a presque rien à prouver.

> **Les valeurs attendues se dérivent, elles ne se recopient pas.** Les nombres cités sont des
> repères de lecture, calculés avec la liste canonique (*Formulas*, « Porte de mesure du système
> 6 ») et, pour les valeurs du système 1, avec la sienne. **Le test lit la constante nommée**, et
> la configuration lui est injectée. Quand la mesure déplacera ces valeurs, les critères suivront
> sans être réécrits.

**Les identifiants sont stables.** Un critère retiré garde son numéro, qui n'est pas réattribué ;
les critères ajoutés prennent la suite (*Revision History*).

---

### A — Préparation et étape 1, le silence

| # | Critère | Type |
|---|---|---|
| CAL-40 | GIVEN la permission micro refusée THEN l'écran de blocage s'affiche et **aucun état de mesure n'est atteint** ; GIVEN un premier lancement THEN la demande de permission précède l'écran de l'étape 1 | `[INTEG]` |
| CAL-41 | GIVEN aucun signal reçu du périphérique sélectionné pendant `DeviceCheck_s` THEN le sélecteur de périphérique est proposé et `MeasuringFloor` **n'est pas atteint** ; GIVEN un signal reçu THEN la transition a lieu | `[UNIT]` |
| CAL-01 | GIVEN une étape sans parole reconnue THEN `Floor_dB = P95(Rms_dB lissé) + FloorMargin_dB`, calculé **sur les seules trames postérieures à `WarmUp_s`** | `[UNIT]` |
| CAL-02 | GIVEN un creux instantané isolé sous le bruit réel THEN il **n'abaisse pas** `Floor_dB` — propriété attendue du centile haut | `[UNIT]` |
| CAL-03 | GIVEN `SpeechRun` trames consécutives `IsVoiced_YIN` et `JitterPct > JitterMin`, **quel que soit leur niveau** THEN l'étape est rejetée et rejouée, aucun `Floor_dB` n'est écrit ; GIVEN `SpeechRun − 1` trames THEN elle ne l'est pas ; GIVEN un bourdonnement périodique sans jitter, ou un bruit apériodique THEN elle ne l'est pas. **La garde s'évalue sans `Floor_dB` ni profil** | `[UNIT]` |
| CAL-04 | GIVEN `P95 − P50 > StabilityMax_dB` sur l'étape THEN l'étape est rejetée et rejouée ; GIVEN un silence capté derrière une porte de bruit de casque — témoin mesuré à 8,3 dB d'écart THEN elle **ne l'est pas**. `StabilityMax_dB` est provisoire, et la statistique elle-même reste en question (OQ-C3) | `[UNIT]` |
| CAL-05 | GIVEN l'étape affichée THEN **aucun indicateur de niveau et aucun son** ne sont perceptibles | `[HUMAIN]` |
| CAL-42 | GIVEN des testeurs découvrant le jeu WHEN ils traversent l'étape 1 THEN aucun ne rapporte avoir cru que le jeu ne fonctionnait pas | `[HUMAIN]` |
| CAL-67 | GIVEN une étape de mesure atteinte THEN **aucune trame n'est accumulée** avant que le joueur ait validé « Je suis prêt » **et** que le décompte soit écoulé ; GIVEN qu'il ne valide jamais THEN aucune mesure ne démarre et aucun délai d'étape ne court | `[UNIT]` |
| CAL-68 | GIVEN des testeurs découvrant le parcours THEN **aucun ne rapporte avoir manqué le début d'une étape** faute de temps pour lire la consigne | `[HUMAIN]` |

### B bis — Étape 2, le chuchotement

| # | Critère | Type |
|---|---|---|
| CAL-69 | GIVEN une étape de chuchotement THEN `Whisper_dB` est la **médiane de toutes les trames**, y compris celles sous `Gate_dB` ; GIVEN un chuchotement entièrement sous la porte THEN l'étape est **acceptée**, `Whisper_dB < Gate_dB`, et `w = 0` | `[UNIT]` |
| CAL-70 | GIVEN une série dont le P90 dépasse la médiane de la voix posée alors que la médiane du chuchotement est 7 dB en dessous THEN `DynamiqueEcrasee` reste **faux** — témoin du 2026-09-17, où l'ancre au P90 accusait une chaîne saine | `[UNIT]` |
| CAL-71 | GIVEN `WhisperMin_s` non écoulées THEN le bouton de fin d'étape n'est pas disponible ; GIVEN `WhisperTimeout_s` atteint sans geste du joueur THEN l'étape se termine sur ce qui a été mesuré, **sans refus** | `[UNIT]` |
| CAL-72 | GIVEN l'étape affichée THEN **aucun indicateur de niveau, aucune pulsation, aucun son** — même règle qu'à l'étape 1, et pour la même raison : un retour pousserait à chuchoter plus fort | `[HUMAIN]` |

### B — Étape 3, la parole posée

| # | Critère | Type |
|---|---|---|
| CAL-06 | GIVEN `Gate_dB` connu THEN `G` contient exactement les trames de `Rms_dB` lissé `> Gate_dB`, `Y ⊆ G` les trames périodiques, `V ⊆ Y` celles dont `JitterPct > JitterMin` — les ensembles du système 1, §4 | `[UNIT]` |
| CAL-07 | GIVEN `n(G) < VoicedMin` à l'expiration de `Step2Timeout_s` THEN l'étape est rejouée **sans écrire** `Rest_dB`, `F0_habituel` ni `PitchStatus` ; GIVEN `n(G) = 0` THEN le message est « on ne t'entend pas du tout » ; GIVEN `0 < n(G) < VoicedMin` THEN il est « continue encore un peu » | `[UNIT]` |
| CAL-43 | GIVEN `n(V) ≥ VoicedMin` avant le délai THEN le bouton de fin d'étape **apparaît** et la mesure **continue** tant que le joueur ne l'actionne pas — l'étape ne se termine jamais d'elle-même au minimum ; GIVEN le geste du joueur THEN `PitchStatus = Full` et les médianes portent sur **tout** `V`, trames postérieures au minimum comprises ; GIVEN à l'expiration `n(V) < VoicedMin ≤ n(Y)` THEN `NoJitter`, `Rest_dB` sur `G`, `F0_habituel` sur `Y` — la table du système 1, §4, appliquée avec ce `VoicedMin` | `[UNIT]` |
| CAL-08 | GIVEN une série voisée à laquelle on **injecte une seule erreur d'octave** THEN `F0_habituel` est **inchangé** | `[UNIT]` |
| CAL-09 | GIVEN une tentative d'exécuter l'étape 3 **sans `Floor_dB` au tampon** THEN un état invalide est levé — la dépendance d'ordre est une garde, pas une convention | `[UNIT]` |
| CAL-10 | GIVEN un chuchotement simulé — trames dans `G`, aucune dans `Y` — à la **première** tentative THEN l'étape est rejouée avec la demande de voix posée ; à la **deuxième consécutive** THEN le profil est accepté en `Unavailable`, **sans `F0_habituel`**, `Rest_dB` médiané sur `G` | `[UNIT]` |
| CAL-44 | GIVEN une recalibration d'un profil dont `F0_habituel` vaut le **double** de la vraie hauteur THEN la nouvelle mesure est prise sous la configuration non calibrée et retrouve la vraie hauteur — l'erreur d'octave ne se reproduit pas | `[UNIT]` |
| CAL-45 | GIVEN chacun des trois chemins `Full`, `NoJitter`, `Unavailable` THEN `Rest_dB > Gate_dB` — la médiane est prise sur le même `Rms_dB` lissé que la porte | `[UNIT]` |

### C — Étape 4, la montée

| # | Critère | Type |
|---|---|---|
| CAL-11 | GIVEN une stagnation qualifiante MAIS `M(t) − Gate_dB < HardFloor_dB` THEN **aucun plateau n'est déclaré**, l'étape continue | `[UNIT]` |
| CAL-12 | GIVEN la même stagnation avec `M(t) − Gate_dB ≥ HardFloor_dB` THEN le plateau est déclaré et `Scream_dB = M(t)` | `[UNIT]` |
| CAL-46 | GIVEN un signal parfaitement plat au-dessus du plancher dur THEN **aucune évaluation de plateau** n'a lieu avant `PlateauHold_s` écoulé depuis le début de l'étape | `[UNIT]` |
| CAL-73 | GIVEN un maximum atteint à 0,6 s puis parfaitement stable THEN **aucun plateau n'est déclaré avant `PlateauMinDuree_s`** ; GIVEN la stagnation qui se poursuit au-delà THEN le plateau est déclaré. Témoin du 2026-09-18 : sans cette garde, deux montées se sont arrêtées à 1,8 s sur un `Scream_dB` inférieur au plus fort moment de la parole posée | `[UNIT]` |
| CAL-13 | GIVEN aucune stagnation avant `PeakTimeout_s` THEN l'étape se termine sur `Scream_dB = M(t_fin)` | `[UNIT]` |
| CAL-47 | GIVEN un arrêt demandé par le joueur THEN l'étape se termine sur `Scream_dB = M(t_arrêt)`, et la validation décide ensuite | `[UNIT]` |
| CAL-14a | GIVEN un écrêtage signalé par le détecteur du système 1 pendant l'étape THEN le profil reste committable **et** le résultat porte le signalement d'écrêtage ; GIVEN une montée refaite sans écrêtage THEN le signalement disparaît. **EN ATTENTE** — détecteur à exposer (OQ-C2), seuil d'écrêtage du système 1 sans valeur | `[UNIT]` |
| CAL-14b | GIVEN le message d'écrêtage affiché THEN des testeurs comprennent qu'il faut baisser le volume d'entrée **ou** éloigner le micro, et le font | `[HUMAIN]` |

### D — Les validations

| # | Critère | Type |
|---|---|---|
| CAL-15 | GIVEN `Gate_dB ≥ Rest_dB` ou `Rest_dB ≥ Scream_dB` THEN **REFUS** (V1) | `[UNIT]` |
| CAL-16 | GIVEN `Δ' = Scream_dB − Gate_dB < HardFloor_dB` THEN REFUS ; GIVEN `Δ' = HardFloor_dB` exactement THEN ACCEPTÉ, `LowRange` ; GIVEN `Δ' = QualityBand_dB` exactement THEN ACCEPTÉ, sans `LowRange`. **L'écart porte sur `Δ'`, jamais sur `Scream_dB − Floor_dB`** : `Floor −60 · Scream −42` avec `Margin_dB = 7` donne `Δ = 18` mais `Δ' = 11` → `LowRange` ; un calcul sur `Δ` ne le lèverait pas | `[UNIT]` |
| CAL-17 | GIVEN `Floor −70 · Rest −25 · Scream −22` avec `Margin_dB = 7` — `Δ' = 41`, `r' ≈ 0,93` THEN **ACCEPTÉ, `LowRange` levé par V3** ; jamais un refus | `[UNIT]` |
| CAL-18 | *Retiré le 2026-09-16 avec la borne basse de V3, qui était inatteignable* | — |
| CAL-19 | GIVEN `r' = RestMax` exactement THEN `LowRange` est levé (borne incluse) ; GIVEN `r'` juste sous `RestMax` et `Δ' ≥ QualityBand_dB` THEN il ne l'est pas. Témoin de la revue : `Floor −60 · Rest −35 · Scream −28` → `r' = 0,72` → **ACCEPTÉ sans drapeau** | `[UNIT]` |
| CAL-20 | GIVEN un profil chargé, `PitchStatus ≠ Unavailable`, `F0_habituel` hors du domaine du détecteur non calibré du système 1 THEN **REFUS au chargement** ; GIVEN `F0_habituel = 400 Hz` THEN pas de refus ; GIVEN `Unavailable` sans `F0_habituel` THEN V4 ne s'applique pas. **Le domaine est lu dans la configuration du détecteur**, jamais dans une constante de ce document | `[UNIT]` |
| CAL-21 | GIVEN un même profil évalué dans un ordre d'exécution différent THEN **le verdict est identique** — accepté, refusé, `LowRange` ; GIVEN V1 et V2 en échec simultané THEN le message est celui de V1 ; au chargement, l'ordre de priorité est schéma, V1, V2, V4 | `[UNIT]` |
| CAL-22 | GIVEN un profil accepté THEN `Rest_dB` **n'intervient dans aucune formule de sortie du système 1** : le modifier ne change aucune `VoiceFrame`. **Sa seule sortie dérivée est `r'`** | `[UNIT]` |
| CAL-48 | GIVEN un commit THEN `r'` est calculé sur le client par la formule du système 1 et appartient à `]0 ; 1[` | `[UNIT]` |

### D bis — Le diagnostic de chaîne de capture

**Aucun de ces critères ne porte sur un refus** : c'est la propriété à vérifier.

| # | Critère | Type |
|---|---|---|
| CAL-74 | GIVEN `Rest_dB − Whisper_dB < 0` — témoin : `Whisper_dB = −29,0`, `Rest_dB = −37,5` THEN la raison est `souffle`, le message **ne nomme pas le matériel** et propose de refaire le chuchotement ; `DynamiqueEcrasee` reste **faux** | `[UNIT]` |
| CAL-75 | GIVEN `Scream_dB − max(Rms_dB de l'étape 3) < MonteeFaible_dB` ET `Rest_dB − Whisper_dB ≥ EcartVoixChuchote_dB` THEN le message propose de refaire la montée **sans mettre le matériel en cause** ; GIVEN le chuchotement également écrasé THEN `DynamiqueEcrasee` est levé | `[UNIT]` |
| CAL-76 | GIVEN n'importe quel verdict du diagnostic THEN le profil est **commité et jouable** : `LowRange` inchangé, `Approximate` inchangé, aucune valeur de sortie du système 1 modifiée | `[UNIT]` |
| CAL-77 | GIVEN `DynamiqueEcrasee` vrai, en jeu, WHEN un chuchotement du joueur déclenche une alarme THEN le rappel s'affiche **au plus une fois par session** ; GIVEN le drapeau faux THEN jamais | `[INTEG]` |
| CAL-78 | GIVEN le message de dynamique écrasée montré à des testeurs THEN ils savent quoi faire, aucun ne croit être empêché de jouer, et **aucun ne rapporte que le jeu accuse son matériel** | `[HUMAIN]` |

### E — Tampon, atomicité, `LowRange`, profil approximatif

| # | Critère | Type |
|---|---|---|
| CAL-23 | GIVEN une coupure micro pendant une étape THEN le tampon est jeté **intégralement** et le profil actif reste identique **bit à bit** | `[UNIT]` |
| CAL-24 | **Propriété structurelle, pas course de fils** : `VoiceProfile` est une **classe** dont tous les champs sont en lecture seule (vérifié par réflexion) ; le commit publie la référence par `Interlocked.Exchange` ; l'analyse la lit par `Volatile.Read` (vérifié par inspection) | `[UNIT]` |
| CAL-25 | GIVEN une seule étape rejouée THEN **toutes les validations** sont réévaluées sur l'ensemble ancien + neuf avant tout commit | `[UNIT]` |
| CAL-26 | GIVEN une annulation en cours de parcours THEN **aucun fichier de profil n'est écrit** | `[INTEG]` |
| CAL-27 | GIVEN `LowRange = true` THEN l'`EnvelopeFollower` multiplie ses **constantes de temps `τ`** par le facteur du système 1 — jamais le coefficient `c` —, face à un profil identique en `LowRange = false` : le temps de montée sur un même échelon est multiplié par ce facteur | `[UNIT]` |
| CAL-28 | GIVEN `2 · F0_habituel > 600 Hz` **et** un `SampleRate` multiple de 12 000 THEN décimation à **12 kHz** ; GIVEN la même voix à 44,1 kHz THEN **8 kHz**, plage plafonnée à 600 Hz ; GIVEN `Unavailable` THEN aucune détection de hauteur. Le `Decimator` et le `PitchDetector` sont **reconstruits par le fil d'analyse à la réception du profil**, pas à la construction de l'analyseur | `[UNIT]` |
| CAL-49 | GIVEN deux refus consécutifs dans une même calibration THEN `OfferingApproximate` ; GIVEN un refus, un retour à `Idle`, puis un refus THEN pas d'offre ; GIVEN un refus puis une étape rejouée sans refus (parole pendant le silence, chuchotement) THEN le compte reste à un | `[UNIT]` |
| CAL-50 | GIVEN le profil approximatif accepté THEN `Scream_dB = max(Scream_dB mesuré ; max Rms_dB de l'étape 3)`, les autres champs sont ceux de la dernière tentative, `Approximate` et `LowRange` sont levés ; témoin de *Formulas* §6 → commité à `Δ' = 4` | `[UNIT]` |
| CAL-51 | GIVEN deux refus MAIS V1 en échec même après le calcul du profil approximatif — rien n'a franchi la porte THEN **aucune offre**, le parcours passe au diagnostic du périphérique | `[UNIT]` |
| CAL-52 | GIVEN un profil approximatif à `Δ' < HardFloor_dB` enregistré THEN il **se recharge** — schéma, V1 et V4 revalidés, pas le plancher dur — et garde `Approximate` jusqu'au premier commit non approximatif | `[UNIT]` |

### F — Persistance

| # | Critère | Type |
|---|---|---|
| CAL-29 | GIVEN un fichier corrompu ou incomplet THEN le profil est traité comme **absent** — jamais de chargement partiel | `[UNIT]` |
| CAL-30 | GIVEN un profil valide sous une configuration de seuils **A**, revalidé sous une configuration **B** — par exemple `Margin_dB` monté jusqu'à `Scream_dB ≤ Gate_dB` THEN il est rejeté — **et le test ne cite aucune valeur de production** | `[UNIT]` |
| CAL-31 | GIVEN un numéro de version de schéma absent ou inconnu THEN le profil est traité comme absent | `[UNIT]` |
| CAL-32 | GIVEN un profil rejeté au chargement WHEN le joueur tente de rejoindre THEN le système 8 **bloque l'entrée** | `[INTEG]` |

### G — Parcours, réseau, confidentialité

| # | Critère | Type |
|---|---|---|
| CAL-33 | GIVEN une calibration en cours, de `Preparing` à la sortie du parcours (`Committed` ou `Idle`), refus et offre compris THEN la sortie du joueur vers le jeu reste `Silence` | `[INTEG]` |
| CAL-54 | GIVEN une calibration en cours, **au lobby comme en jeu** THEN le chat vocal **ne diffuse rien** de ce que produit le joueur **et ne lui restitue rien** de ce que disent les autres ; à la sortie du parcours, les deux sens sont rétablis. Propriétaire : système 14 | `[INTEG]` |
| CAL-34 | GIVEN les types de messages réseau du système 5 THEN **la seule grandeur tirée du `VoiceProfile` qu'ils contiennent est `r'`** — vérifié par inspection des types, pas par capture. **EN ATTENTE** du GDD du système 5 et d'un transport installé | `[INTEG]` |
| CAL-53 | GIVEN un profil `LowRange`, `Approximate`, `DynamiqueEcrasee` ou « hauteur indisponible » THEN **aucun autre joueur** ne voit ni ne reçoit ces drapeaux | `[INTEG]` |
| CAL-35 | GIVEN chaque ligne du tableau « Refus, reprises et signalements » (*UI Requirements*) déclenchée une à une par des profils ou signaux synthétiques THEN **un identifiant de message distinct par ligne** est renvoyé, et la reprise désignée est celle du tableau | `[UNIT]` |
| CAL-36 | GIVEN un refus portant sur une seule étape THEN le parcours reprend **sur cette étape**, jamais au début | `[INTEG]` |
| CAL-55 | GIVEN le menu du lobby et le menu en jeu THEN la calibration s'y lance **en un geste** ; GIVEN « Refaire ma mesure » THEN le parcours complet démarre en mode réparation | `[INTEG]` |
| CAL-56 | GIVEN un joueur portant un objet WHEN il lance la recalibration depuis le menu THEN l'objet est **posé avant l'étape 0** et son poids ne change jamais du fait de la calibration. **EN ATTENTE** de la confirmation du système 9 (OQ-C9) | `[INTEG]` |
| CAL-57 | GIVEN le mode réparation WHEN un testeur rejoue **une seule étape** THEN le temps entre le geste de relance et le retour au jeu est **inférieur à 15 secondes** en médiane | `[HUMAIN]` |
| CAL-58 | GIVEN un joueur en calibration dans le lobby THEN les autres voient **l'étape en cours**, ou « rencontre une difficulté » après un refus. **EN ATTENTE** du système 8 (OQ-C10) | `[INTEG]` |
| CAL-37 | GIVEN le mode réparation THEN aucun contenu pédagogique n'apparaît ; GIVEN un refus pendant la toute première calibration THEN le ton reste celui de la découverte | `[HUMAIN]` |
| CAL-38 | GIVEN l'étape 4 affichée THEN **aucune cible, aucun plafond, aucun score** n'est visible, et l'objet n'atteint jamais un état final ; GIVEN la relecture du composant THEN il ne contient **aucun chemin de rendu** d'une cible, d'un score ou d'une butée — inventaire des éléments de l'écran en liste blanche | `[HUMAIN]` + relecture — voir cas difficile 3 |
| CAL-39 | GIVEN une valeur provisoire de ce document THEN elle apparaît **une seule fois**, dans la liste canonique, comme constante nommée ; aucune autre section ni aucun autre document ne la cite comme acquise | `[UNIT]` par inspection statique + `[HUMAIN]` |
| CAL-59 | GIVEN une calibration menée jusqu'à `Committed`, puis une autre jusqu'à `Idle` THEN **aucun tampon audio ne survit** : chaque tampon traversant la calibration est suivi par une `WeakReference`, et toutes sont mortes après `Collect`, `WaitForPendingFinalizers`, `Collect`. Catégorie de tests lente | `[INTEG]` |

### H — Accessibilité

| # | Critère | Type |
|---|---|---|
| CAL-60 | GIVEN un testeur au clavier et à la souris seuls THEN il traverse **tous** les écrans — permission, sélecteur, étapes, offre de profil approximatif, refus — sans blocage | `[HUMAIN]` |
| CAL-61 | GIVEN le son du jeu **entièrement coupé** THEN un testeur mène la calibration à son terme : toute instruction est écrite, et chaque étape où il parle lui donne un retour visible | `[HUMAIN]` |
| CAL-62 | GIVEN une capture de chaque étape **en niveaux de gris** THEN les étapes restent distinguables | `[HUMAIN]` |
| CAL-63 | GIVEN la calibration complète THEN aucun flash et aucun pic sonore ne se produisent | `[HUMAIN]` |
| CAL-64 | GIVEN le texte à sa taille maximale THEN chaque écran reste lisible, sans troncature | `[HUMAIN]` |
| CAL-65 | GIVEN une parole synthétique entrecoupée, voisée 40 % du temps THEN `n(V)` atteint `VoicedMin` avant `Step2Timeout_s` avec la liste canonique ; GIVEN le catalogue des messages de l'étape 3 THEN aucun ne présume une cause de volume | `[UNIT]` + `[HUMAIN]` |
| CAL-66 | GIVEN l'étape 4, **en découverte comme en réparation** THEN la phrase « si crier te fait mal, arrête-toi » est affichée avant la montée — une consigne de sécurité, pas de la pédagogie | `[HUMAIN]` |

---

### Ce que ces critères ne couvrent pas

1. **`StabilityMax_dB` a une valeur provisoire, pas une mesure** : CAL-04 est implémentable, mais la statistique `P95 − P50` mesure autant la chaîne de capture que la pièce (OQ-C3).
2. **La distance au micro entre étapes** reste partiellement indétectable. Seul un critère
   d'interface est possible — la consigne est affichée —, pas un critère de détection.
3. **L'hystérésis autour de `2 · F0_habituel ≈ 600 Hz`** est une piste, pas un comportement
   (OQ-C14).
4. **La dérive entre calibration et jeu** — bruit cyclique, traitements du système
   d'exploitation — ne se voit dans aucune validation (OQ-C12).
5. **Un gain d'entrée très bas** passe toutes les validations (OQ-C13).
6. **Une source non humaine** passe toutes les validations (OQ-C7).
7. **Plusieurs critères dépendent de systèmes sans GDD** — 5, 8, 9, 14. Ils ne bloquent pas la
   story de logique pure, qui ne contient que des `[UNIT]`.

### Les trois cas difficiles

**« Aucun audio n'est conservé. »** Une promesse de confiance, qu'une relecture de code ne vaut
pas. CAL-59 instrumente chaque tampon audio traversant la calibration par une `WeakReference`
et vérifie qu'elles sont toutes mortes après la sortie du parcours. Le double passage
`Collect` / `WaitForPendingFinalizers` / `Collect` absorbe la fragilité du ramasse-miettes sous
Mono et IL2CPP ; le test exige le vrai graphe d'objets, d'où la catégorie lente.

**La revalidation au chargement.** Tester qu'un profil enregistré sous d'anciens seuils est
rejeté quand ils bougent, **sans figer les seuils dans le test**. La réponse impose une
contrainte d'implémentation utile : **la fonction de validation prend sa configuration en
argument** au lieu de lire des constantes compilées. Le test construit un profil sous une
configuration A arbitraire, revalide sous une B, et vérifie le rejet sans citer une valeur de
production — ce que la norme « valeurs pilotées par la donnée » du projet exige déjà.

**« L'étape 4 n'a pas de cible. »** C'est l'absence d'une fonctionnalité, pas un comportement
observable. Les seules vérifications honnêtes sont un inventaire en liste blanche des éléments
de l'écran, une relecture qui confirme l'absence de tout chemin de rendu d'une cible, et un
playtest qui confirme que le joueur ne perçoit pas un test. Prétendre à un critère automatisé
donnerait une fausse assurance sur **l'exigence la plus contre-intuitive du document**.

### Ce qui reste hors de portée d'une machine

- La gêne sociale, l'impression de passer un test, la lecture d'un refus comme non jugeant.
- **Que l'objet de l'étape 4 enseigne le bon sens** — « ma voix alourdit » et non « fort, c'est
  bien ». Mini-calibration du prototype, puis playtest.
- Le réalisme des environnements bruyants réels — télévision, salon partagé, même pièce.
- **De vraies voix d'enfant face au domaine du détecteur, à la branche 12 kHz et aux
  périphériques à 44,1 kHz.** Sujets réels obligatoires ; c'est le point de cette liste qui
  peut produire une **injustice ciblée** s'il est laissé au raisonnement (OQ-C5).
- Le confort et la fatigue induits par `PlateauHold_s` et `PeakTimeout_s`.
- La fluidité perçue de la réaction de l'objet.

## Open Questions

### Comment lire cette section

Même classement qu'au système 1 — par **ce que la question empêche**, et non par thème. Les
identifiants sont stables : une question résolue garde son numéro.

---

### Bloque le code

#### OQ-C1 — Où le profil persiste-t-il ? Et doit-il suivre le joueur ?

La persistance appartient à ce système ; le *où* n'a pas de réponse arrêtée. Le choix évident
serait le Steam Cloud, puisqu'un profil « appartient au joueur ». **C'est probablement le mauvais
choix.**

> **Le profil décrit un micro et une pièce autant qu'une voix.** `Floor_dB` est le bruit du
> logement ; `Scream_dB` dépend du gain d'entrée du matériel. Synchroniser ce profil ferait suivre
> au joueur, sur son portable dans le train, une calibration faite au casque dans son salon — et
> **le jeu se tromperait d'autant plus qu'il croirait le connaître**.

| Option | Conséquence |
|---|---|
| **A — local, par machine** | Correct par construction. Le joueur recalibre en changeant de machine, ce qui est exactement ce qu'il faut faire |
| **B — cloud, un profil unique** | Faux dès la deuxième machine, et le défaut est silencieux |
| **C — cloud, un profil par machine** | Correct et pratique, mais suppose une identification stable de la machine |

> **Recommandation : A pour le MVP.** C est meilleur et peut attendre ; A ne ferme pas la porte à
> C. **La décision appelle un ADR** avant toute ligne de persistance.

#### OQ-C2 — Le détecteur d'écrêtage doit devenir une information

Le système 1 détecte l'écrêtage pour **geler sa `Continuity`**. Nous en avons besoin comme
**information**, pour avertir le joueur que son registre haut sera aplati pour toute la partie.
Tant que le détecteur reste enfoui dans la logique de gel, CAL-14a n'est pas exécutable.

**C'est un changement de surface sur `Voice.Core`**, donc de la liste blanche d'ADR-0004, à
décider avec le système 1. Il ne suffit pas : **le seuil d'écrêtage lui-même est EN ATTENTE** dans
la liste canonique du système 1, faute d'enregistrements de cris saturés.


---

### Bloque le réglage

#### OQ-C3 — La seconde garde de l'étape 1 : une valeur provisoire, et la bonne statistique

Deux gardes protègent l'étape de silence, et elles ne sont pas redondantes :

- **La garde de parole** (CAL-03) attrape une voix, par la périodicité et le jitter, sans porte de
  niveau.
- **La garde de stabilité** (CAL-04) attrape **une pièce instable** — ventilateur qui démarre, rue
  bruyante par intermittence —, c'est-à-dire du bruit fort et non voisé, que la première laisse
  passer.

La question n'est pas s'il faut la seconde, mais **à partir de quelle instabilité une pièce cesse
d'être caractérisable par un seul nombre** — et si l'écart `P95 − P50` est la bonne statistique.
Cela se mesure sur les enregistrements bruts de pièces réelles ; ça ne se raisonne pas.

**Ce que le prototype a apporté, 2026-09-18.** Cinq silences réels ont été mesurés. Les silences
propres tiennent entre **2,4 et 4,8 dB** d'écart `P95 − P50` ; une étape polluée par un mot donne
**57,8 dB** ; et un cas gênant apparaît entre les deux : **8,3 dB** sur un casque dont la porte de
bruit coupe le fond de la pièce. Ce dernier n'est pas une pièce instable — c'est l'inverse, une
chaîne qui *supprime* le bruit — et un seuil à 6 dB l'aurait rejeté. D'où la valeur provisoire
**12 dB**, et le fait que la question reste ouverte : l'écart `P95 − P50` mesure autant la chaîne
que la pièce.

**Ce qui manque encore** : des pièces réellement instables, enregistrées brutes. Aucune n'a été
mesurée — le prototype a tourné dans une seule pièce calme.

---

#### OQ-C4 — Les valeurs provisoires ne se règlent pas toutes de la même façon

| Groupe | Valeurs | Se règle par |
|---|---|---|
| La plage utile | `HardFloor_dB`, `QualityBand_dB` | Enregistrements bruts et session hors ligne (B7, C9), **après** `FloorMargin_dB` et `Margin_dB` |
| Le plancher | `FloorMargin_dB` avec `Margin_dB` du système 1, durée de l'étape 1, `WarmUp_s`, centile, `StabilityMax_dB`, `SpeechRun` | Essais en pièces réelles, étape de silence du prototype (B2) |
| La parole posée | `VoicedMin`, `Step2Timeout_s` | Enregistrements, et le mode réparation comme contrainte |
| La montée | `PlateauDelta_dB`, `PlateauHold_s`, `PeakTimeout_s` | Montées réelles — **ensemble** |
| La plausibilité | `RestMax` | Statistiques sur calibrations réelles, en dernier |
| Le parcours | `DeviceCheck_s` | Playtest |

> **L'ordre vit ailleurs.** Ces valeurs et celles du système 1 ne sont pas indépendantes — les
> marges déplacent `Δ'`, donc le plancher dur ne se règle pas avant elles. **La séquence canonique
> est écrite une seule fois**, dans `voice-analysis.md`, OQ-4.

#### OQ-C5 — Les voix d'enfant ne se valident pas au raisonnement — **condition de sortie d'`In Design`**

Aucune voix n'est plus refusée sur sa hauteur : V4 ne contrôle que le domaine du détecteur, au
chargement. **Le risque a changé de forme, pas de cible.** Une voix d'enfant peut encore obtenir un
jeu dégradé — « hauteur indisponible », cris dont la hauteur sort de la plage, branche 12 kHz
absente sur un périphérique à 44,1 kHz. Ce n'est plus une exclusion, c'est une **injustice ciblée**
sur une population que le projet a déjà dû corriger deux fois.

À vérifier sur de **vraies voix d'enfant**, et sur des voix adultes aiguës :

1. `F0_habituel` tombe dans le domaine du détecteur ;
2. la répartition `Full` / `NoJitter` / `Unavailable` — le seuil de jitter du système 1 ne les
   pousse-t-il pas hors de `Full` ?
3. la branche 12 kHz et son plafond à 900 Hz couvrent leurs cris ;
4. ce qu'elles perdent sur un périphérique à 44,1 kHz.

**Ce document ne sort pas d'`In Design` tant que ce protocole n'a pas tourné** (revue du
2026-09-11, souscrit par le creative-director).

#### OQ-C12 — La dérive entre calibration et jeu

Un profil cohérent au commit peut devenir faux pendant la session sans qu'aucune validation ne le
voie :

- **bruit cyclique** qui change d'état — compresseur de frigo, chauffage — dans les deux sens
  (*Edge Cases*) ;
- **traitements du système d'exploitation ou du périphérique** — AGC de communication de Windows,
  pilotes constructeur, AGC matériel des casques USB, bascule Bluetooth en profil main libre ;
- **notifications du système** pendant l'étape de silence ;
- **charge machine plus faible au menu qu'en jeu** : les ventilateurs tournent plus fort pendant la
  partie qu'à la calibration.

**À mesurer** : un POC audio enregistre la dérive de `Floor_dB` et `Scream_dB` sur 20 à 30 minutes
de vraie session. **Piste nommée, non décidée** : un contrôle de cohérence léger à l'entrée en
partie — comparer le niveau des trames hors voix au plancher du profil, et **proposer** « Refaire
ma mesure », jamais l'imposer. Propriétaires : ce système, avec le système 2.

#### OQ-C13 — Le gain d'entrée très bas

Toutes les validations travaillent en décibels **relatifs** : un profil sous-alimenté passe, et
le rapport signal sur bruit dégradé frappe d'abord le chuchotement. **Piste** : une garde en dBFS
absolus sur `Scream_dB`. Elle ne jugerait pas une voix mais un réglage de matériel ; **elle
signale, elle ne refuse pas**, conformément au principe du 2026-09-14. Valeur à mesurer.

#### OQ-C14 — L'hystérésis 8 / 12 kHz

Deux calibrations d'une même voix dont `2 · F0_habituel` tombe près de 600 Hz peuvent basculer
d'une cadence à l'autre. **Piste** : basculer vers 12 kHz au-dessus de 600 Hz, ne revenir à 8 kHz
que sous 550 Hz, ce qui suppose de connaître la branche du profil précédent. Second ordre ; même
population qu'OQ-C5.

---

### Le risque non levé

#### OQ-C6 — Toute la conception sociale de ce document est une hypothèse

C'est le vrai risque du système, et il n'est pas technique. L'ordre des étapes, l'objet sans cible,
le refus d'insister, le ton des messages : **tout repose sur une thèse non vérifiée** — qu'un joueur
gêné se mesure mieux si on ne lui demande rien frontalement.

Le mode d'échec est **invisible** : un joueur intimidé produit un profil au registre écrasé qui
**passe toutes les validations**, et trouve ensuite que le jeu réagit mal.

> **Le protocole qui tranche.** Faire calibrer les mêmes personnes **seules**, puis **en condition
> réelle** — les amis du sujet présents, au lancement d'une partie —, sur un échantillon plus large
> qu'une soirée. Comparer **`Scream_dB`, `Rest_dB`, `F0_habituel` et `r'`** : les trois derniers
> alimentent les seuils du système 11, pas seulement le premier.
>
> Si l'écart est faible, la conception tient. **S'il est large, elle a échoué** — et aucune valeur
> de la liste canonique n'y changera rien, parce que le problème ne sera pas dans les seuils.

Le test à plusieurs humains du plan de la passe groupée, **dont une session dans la même pièce**,
en est la première occasion.

#### OQ-C7 — La source non humaine, assumée

Une calibration faite sur la télévision, la musique ou la voix d'un tiers est **parfaitement valide
et parfaitement inutile**. Les validations vérifient la cohérence des mesures, jamais leur
provenance. Il n'y a pas de défense, ce n'est pas grave — personne n'a intérêt à saboter sa propre
calibration —, et cela reste écrit plutôt que tu.

---

#### OQ-C17 — Le diagnostic de chaîne de capture repose sur 1,4 dB

Le diagnostic §4a sépare une chaîne qui écrase la dynamique d'une chaîne saine par un seuil sur
`Rest_dB − Whisper_dB`. **Les deux populations connues sont distantes de 1,4 dB** : 5,5 dB pour une
calibration faite avec un traitement de casque actif, 6,9 dB pour une calibration propre du même
joueur. Sept calibrations, une personne, un micro, une pièce.

C'est assez pour écrire un message, **pas** pour écrire une règle. Trois garde-fous en découlent, et
ils sont déjà dans le document : le diagnostic ne refuse rien, il ne lève aucun drapeau qui change
une formule, et son message **nomme la perte** au lieu de désigner un coupable.

Ce qu'il faudrait pour trancher : les mêmes écarts mesurés sur d'autres voix, d'autres micros et
d'autres traitements — casques USB, micros de webcam, traitements logiciels du système. **Le test à
plusieurs humains est la première occasion** d'en collecter, à condition d'exporter les profils.

Piste écartée pour l'instant : mesurer la compression directement, en comparant l'enveloppe d'entrée
à un signal de test joué dans le casque. Elle demande une boucle audio que le jeu n'a pas, et elle
échoue si le traitement vit dans la carte son du casque — ce qui est le cas mesuré ici.


---

### Sans propriétaire, ou chez le voisin

| # | Question | Chez qui | État |
|---|---|---|---|
| OQ-C8 | **Le tutoriel n'existe pas.** Voir ci-dessous | **Personne** | Ouverte |
| OQ-C9 | Le portage prévoit-il qu'un porteur **lâche** en cours de transport ? La recalibration en jeu en dépend (CAL-56) | Système 9 | Ouverte |
| OQ-C10 | Comment le lobby affiche-t-il l'étape d'un joueur en calibration, et **le groupe peut-il démarrer sans lui** ? | Système 8 | Ouverte |
| OQ-C11 | La durée ressentie du mode réparation n'avait aucun critère | Ici | **Résolue** — CAL-57 |
| OQ-C15 | **Le prérequis du casque exclut structurellement** des joueurs — implant cochléaire, aide auditive, contre-indication médicale, hypersensibilité sensorielle. Documenté ; faut-il une réponse ? | Creative-director, avec l'accessibilité | Ouverte |
| OQ-C16 | **Un joueur sans casque n'a aucun signal en jeu** : `Degraded` détecte l'absence de capture, pas une sur-réaction aux voix des coéquipiers | Systèmes 1 et 19 | Ouverte |

> #### OQ-C8 — le tutoriel est cité et n'appartient à personne
>
> `mvp-scope.md` fait de la calibration la **porteuse de l'onboarding**, et `voice-analysis.md`
> écrit que le profil se crée « via le tutoriel ». **Aucun système « tutoriel » ne figure dans
> `systems-index.md`**, qui relève le même oubli. Deux issues : soit l'onboarding **est** la calibration, et les documents cessent de
> parler d'un tutoriel ; soit il en faut un, et c'est un **vingtième système**.
>
> La décision D1 réduit le problème — l'étape 4 enseigne désormais le bon sens — sans le supprimer :
> rien n'apprend au joueur à porter à plusieurs. **La question n'est pas la nôtre à trancher**,
> mais elle est nôtre à signaler.

**Différé sciemment**, avec ses raisons : export manuel du profil, guidage du placement du micro,
faux écrêtage sur les plosives — `design/gdd/reviews/voice-calibration-2026-09-11.md`, « Différé
sciemment ».

---

### État du code aujourd'hui

**Rien de ce document n'est implémenté.** `SUAC.Voice.Core` contient des primitives d'analyse
testées — mesure de niveau, décimation, YIN, enveloppe ; le `VoiceAnalyzer` et la normalisation
restent à écrire, et il n'existe aucune ligne de calibration : ni mesure d'étape, ni validation,
ni profil, ni persistance. Ce document est une spécification intégrale.

## Revision History

| Date | Changement | Source |
|---|---|---|
| 2026-09-07 | Création : squelette et *Overview* | — |
| 2026-09-08 | Document complet. *UI Requirements* rapatriée depuis `voice-analysis.md`, qui la portait faute de destinataire. Le casque devient un prérequis du jeu. La recalibration en jeu passe par le menu : le personnage pose ce qu'il porte (OQ-11 du système 1 résolue). `LowRange` devient un contrat entrant du système 1. La population « qui ne peut pas parler fort » n'est plus exclue. La sérialisation, la version de schéma et la revalidation entrent dans `Voice.Core`. L'annulation d'écho est retirée d'ADR-0003 : le casque devient la seule mitigation | Revue du système 1 du 2026-09-07 ; recherche du 2026-09-08 |
| 2026-09-11 | Revue `full` : MAJOR REVISION NEEDED | `design/gdd/reviews/voice-calibration-2026-09-11.md` |
| 2026-09-14 | Principe des seuils personnels ; règles d'atteignabilité, de provenance et de disponibilité | Décision du propriétaire ; `.claude/rules/design-docs.md` |
| 2026-09-15 | Dix décisions du propriétaire, dont D1 (l'étape 4 montre une conséquence), D2 (deux refus avant le profil approximatif), E5 (`r'` seul vers l'hôte), F2 (un détecteur ne refuse jamais seul), F5 (corriger en place) | `design/gdd/reviews/voice-analysis-2026-09-14.md` §6 |
| 2026-09-16 | **Révision, passe groupée, étape 4.** *Validations* : V2 sur `Δ'` ; V3 signale sur `r'`, sa borne basse est supprimée ; V4 contrôle le domaine du détecteur au chargement, `F0Min` et `F0Max` disparaissent ; le plancher dur et la bande de qualité, portés sur `Δ'`, passent de 13 et 20 dB à 6 et 13 dB — la même frontière, moins `Margin_dB` —, provenance « pari de raisonnement » ; priorité des messages. *Parcours* : étape 0 (permission, « dis un mot », amorce sociale) ; étape 1 de 3 s à 6–8 s en respirant ; garde de parole par périodicité et jitter sans porte de niveau (l'ancienne était circulaire) ; `Step2Timeout_s` ; ensembles `G`/`Y`/`V`, `PitchStatus`, `Unavailable` à la deuxième tentative ; hauteur mesurée sous la configuration non calibrée ; plateau calé sur `M − Gate_dB`, sans évaluation avant `PlateauHold_s`, bouton d'arrêt ; profil approximatif après deux refus. *Réseau* : « le profil ne traverse jamais le réseau » devient « seul `r'` en est dérivé vers l'hôte ». *Chat vocal* : silence dans les deux sens, lobby compris — l'ancien texte le faisait découler d'une pause qui n'existe pas en réseau. *Dépendances* : système 11 déclaré, CAL-22 recadré sur le système 1. *Écrans* : l'étape 4 montre un objet qui réagit ; pulsation « on t'entend » à l'étape 3 ; tableau des refus réécrit ; message d'écrêtage étendu au gain analogique ; améliorations micro au rang du casque ; exclusion structurelle du casque nommée. *Critères* : CAL-18 retiré ; CAL-14 scindé ; CAL-24 rendu structurel ; CAL-04 EN ATTENTE ; CAL-40 à CAL-66 ajoutés, dont l'accessibilité. *Questions* : OQ-C5 devient condition de sortie d'`In Design` ; OQ-C6 renforcée ; OQ-C11 résolue ; OQ-C12 à C16 ajoutées. Les encadrés datés sont fondus dans le texte, et les comptes de valeurs remplacés par un renvoi à la liste canonique | Revue du 2026-09-11 ; `design/gdd/reviews/voice-analysis-2026-09-14/impacts-passe-groupee.json` |
| 2026-09-18 | **Report du prototype étendu** (`prototypes/charge-vocale-etendue/`, essais 1 à 5, 17–18 septembre). *Parcours* : une **étape de chuchotement** s'insère entre le silence et la parole posée, les étapes suivantes sont renumérotées ; **chaque mesure attend « Je suis prêt »** puis un décompte ; l'étape 3 se termine **au geste du joueur**, jamais d'elle-même au minimum ; état `MeasuringWhisper`. *Profil* : `Whisper_dB` et le drapeau `DynamiqueEcrasee` ; `w`, position du chuchotement, dérivée comme `r'` ; un second scalaire quitterait la machine si le seuil ancré du système 11 était retenu — E5 d'ADR-0003 à amender, pas encore amendée. *Formulas* : §2a (`Whisper_dB`, médiane et non P90 — le P90 du chuchotement dépassait la médiane de la voix posée sur une chaîne saine) ; §4a, le **diagnostic de chaîne de capture**, qui ne refuse rien et lit `souffle` puis `MontéeFaible` avant d'incriminer le matériel ; `PlateauMinDuree_s` au plateau, après deux montées coupées à 1,8 s sur un `Scream_dB` inférieur au plus fort moment de la parole posée. *Valeurs* : `StabilityMax_dB` sort d'EN ATTENTE à 12 dB — un casque à porte de bruit donne 8,3 dB sans que la pièce soit instable ; six valeurs ajoutées à la liste canonique. *UI* : les améliorations micro passent du **prérequis à l'invitation** (décision du propriétaire du 2026-09-17 — jamais bloquer, informer de la perte, laisser jouer) ; trois messages ajoutés. *Critères* : CAL-04 et CAL-43 réécrits, CAL-53 étendu, CAL-67 à CAL-78 ajoutés, sections **B bis** et **D bis**. *Questions* : OQ-C3 passe de « bloque le code » à « bloque le réglage » ; **OQ-C17** ajoutée — le diagnostic tient sur 1,4 dB entre les deux populations mesurées | `prototypes/charge-vocale-etendue/README.md` ; journaux `sessions/2026-09-1{7,8}-essai-*.json` |
