# ADR-0008: Voice Chat Backend — L'ingestion de PCM externe est un critère éliminatoire

## Status

**Accepted** — critère arrêté, inventaire fait, **backend retenu : Dissonance**, intégration
FishNet auditée et vendorisée plutôt que subie.

> Reste à valider par la pratique : compilation contre Dissonance 9.0.7, et le test de
> partage de périphérique d'OQ-7. Voir *Validation Criteria*.

> **Effet de bord établi le 2026-09-07 : ADR-0005 doit être amendé.** Son « implémentation A
> gratuite (Steam natif + FMOD 3D) » n'est pas réalisable — Steam Voice n'accepte pas de PCM
> externe et ne rend pas de signal brut. Le principe d'ADR-0005 tient, son implémentation par
> défaut tombe.

## Date

2026-09-07

## Last Verified

2026-09-07

## Decision Makers

Utilisateur (solo dev). Déclenché par la revue `/design-review` du 2026-09-07 sur
`design/gdd/voice-analysis.md`, recadrage de la question ouverte OQ-7 par le
`unity-specialist`.

## Summary

Toute l'architecture vocale suppose que le système 2 **possède le périphérique micro et le
fourche** — une branche vers l'analyse, une branche vers le chat vocal, l'AEC en amont de
la fourche. Cette supposition présuppose une chose jamais établie : que le SDK de chat
vocal accepte du **PCM fourni de l'extérieur** au lieu de posséder lui-même la capture.
**La plupart des SDK possèdent la capture.** Décision : l'ingestion de PCM externe devient
un **critère éliminatoire** de sélection du backend, et cette sélection **précède** tout
test de partage de périphérique.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Unity 6.3 LTS (`6000.3.18f1`) |
| **Domain** | Audio / Networking / Third-party integration |
| **Knowledge Risk** | **HIGH** — cet ADR porte sur les capacités d'API de SDK tiers, qui évoluent indépendamment du moteur et dont aucune n'a été vérifiée sur ce projet |
| **References Consulted** | `docs/engine-reference/unity/VERSION.md`, `Unity/Shut_up_and_carry/Packages/manifest.json` (aucun paquet de transport installé à ce jour) |
| **Post-Cutoff APIs Used** | Aucune — aucun SDK n'est encore intégré |
| **Verification Required** | **Tout.** Chaque capacité affirmée sur un SDK candidat doit être vérifiée dans sa documentation courante avant d'être retenue. Ne rien inférer de la mémoire du modèle. |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | ADR-0005 (interface maison, implémentation interchangeable), ADR-0003 (fourche du signal, AEC en amont) |
| **Enables** | Système 2 — Audio d'entrée ; le POC audio |
| **Blocks** | Le test de partage de périphérique décrit en OQ-7, qui ne mesure rien tant que ce critère n'est pas résolu |
| **Ordering Note** | **Cet ADR précède le test, il ne le suit pas.** C'est tout l'objet du recadrage. |

## Context

### Problem Statement

`design/gdd/voice-analysis.md` (OQ-7) identifiait comme risque principal la question « le
micro peut-il vraiment être partagé entre l'analyse et le chat vocal ? », et proposait de
la lever par une demi-journée de test sur la cible.

**La question était mal posée.** Un test de partage suppose déjà résolu ce qui ne l'est
pas : que le SDK de chat accepte qu'on lui remette des échantillons. S'il possède la
capture — comportement le plus répandu — alors :

- le système 2 **ne peut pas** être propriétaire du périphérique ;
- il n'y a rien à fourcher, puisque deux composants réclament la même ressource ;
- l'AEC ne peut pas être placée en amont de la fourche, car il n'y a pas de fourche ;
- **le trajet décrit par ADR-0003 s'effondre**, quel que soit le résultat du test.

Mener le test d'abord reviendrait à mesurer soigneusement une hypothèse dont on ignore si
elle a un sens.

### Current State

`Packages/manifest.json` ne contient **aucun paquet de transport ni de chat vocal**.
ADR-0005 a retenu « interface maison, backend interchangeable », en pressentant une
implémentation gratuite. L'interface est bien à nous — mais **l'interchangeabilité n'est
réelle que parmi les backends capables d'ingérer du PCM externe**, et ce sous-ensemble n'a
jamais été établi.

Autrement dit : ADR-0005 a bien protégé le projet contre le verrouillage à un fournisseur,
mais n'a pas vérifié que le catalogue des fournisseurs acceptables était non vide.

### Constraints

- Le signal remis à l'analyse doit être **brut** : post-AEC uniquement, jamais de VAD,
  d'AGC ni de suppression de bruit (`design/gdd/voice-analysis.md`, *Visual/Audio
  Requirements*). Un SDK qui n'expose que du signal déjà traité est inutilisable **même
  s'il accepte du PCM externe** en entrée.
- L'AEC doit rester disponible et positionnable **en amont** de la fourche : c'est une
  question de justesse de mesure, pas de confort d'écoute (ADR-0003).
- Cible PC / Steam.

### Requirements

1. Établir quels SDK candidats acceptent du PCM fourni par l'application.
2. Parmi eux, lesquels exposent une AEC utilisable en amont de la fourche.
3. Retenir un backend, et seulement ensuite tester le partage sur la cible.

## Decision

### Le critère

**L'ingestion de PCM externe est éliminatoire.** Un SDK qui exige de posséder la capture
est écarté sans autre examen, quelles que soient ses autres qualités — qualité de codec,
gratuité, intégration Steam, simplicité d'API. Aucune de ces qualités ne compense
l'impossibilité de mesurer la voix du joueur.

Second critère, subordonné au premier : **l'accès à un signal non traité**, ou la
possibilité de désactiver les traitements de confort sur la branche qui nous revient.

### L'ordre des opérations

1. **Inventaire** des SDK candidats et de leur capacité d'ingestion PCM, sourcé sur leur
   documentation courante — pas sur une connaissance générale.
2. **Sélection** d'un backend, consignée en amendement à cet ADR, qui passe alors en
   `Accepted`.
3. **Alors seulement**, le test de partage de périphérique sur la cible (OQ-7).

Inverser 2 et 3 rend le test ininterprétable.

### Ce qui se passe si le sous-ensemble est vide

> **Mise à jour du 2026-09-07 : le sous-ensemble n'est pas vide.** Quatre candidats passent
> le critère éliminatoire. Cette branche ne se déclenche pas, et la hiérarchie ci-dessous
> reste consignée à titre de garde-fou si les quatre venaient à tomber en pratique.

Ce cas devait être nommé avant d'être rencontré. Si aucun backend acceptable n'existait, les
issues seraient, par ordre de préférence :

- **Capture unique, distribution interne** — l'application possède le périphérique et
  alimente le chat vocal par une API d'entrée personnalisée, si le SDK en offre une même
  partielle.
- **Renoncer à l'AEC en amont** et accepter une contamination mesurée, en la traitant comme
  une dégradation documentée plutôt que comme un défaut caché. Coût : la justesse de la
  mesure, c'est-à-dire le cœur du jeu. **Fortement défavorable.**
- **Renoncer au chat vocal intégré** au profit d'un chat externe (Discord), la voix
  redevenant un pur contrôleur. Coût de conception réel, mais **honnête** : le jeu perd une
  commodité, pas sa mécanique centrale.

> **La troisième issue est préférable à la deuxième.** Perdre le chat intégré coûte du
> confort ; perdre la justesse de la mesure coûte le pilier 1.

## Inventaire des candidats — 2026-09-07

> Premier critère de validation de cet ADR, rempli. Chaque ligne est sourcée sur la
> documentation courante de l'éditeur, **non sur la mémoire du modèle**. Le backend reste
> à retenir : cet inventaire informe la décision, il ne la prend pas.

### Critère 1 — ingestion de PCM externe

| Candidat | Verdict | Mécanisme documenté |
|---|---|---|
| **Dissonance** (Placeholder Software) | ✅ **Passe, et le plus proprement** | Interface `IMicrophoneCapture`. Un composant frère de `DissonanceComms` qui l'implémente **remplace intégralement** le système de capture ; à défaut, Dissonance instancie son `BasicMicrophoneCapture`. Mono, `float`, n'importe quelle fréquence, livré à cadence temps réel |
| **Photon Voice 2** | ✅ Passe | `Recorder.InputFactory` renvoyant un `IAudioReader` ou `IAudioPusher`, avec `SourceType = Factory`. `AudioClipWrapper` sert d'implémentation de référence |
| **ODIN** (4Players) | ✅ Passe | Remplacement du composant `MicrophoneReader`. L'intégration FMOD officielle de 4Players **est exactement ce motif** — elle lit le micro via FMOD et pousse vers ODIN |
| **Agora** | ✅ Passe | `setExternalAudioSource` avant `joinChannel`, puis `pushExternalAudioFrame` sur une piste créée par `createCustomAudioTrack` |
| **Vivox** (Unity) | ⚠️ **Inversé — incompatible en l'état** | Pas d'ingestion externe. Le motif est l'inverse : **Vivox garde le périphérique**, et on intercepte puis écrase ses trames PCM. Deux conséquences rédhibitoires : le signal injecté **repasse par leur VAD, AEC et AGC**, et surtout **les callbacks n'existent que dans une session de canal** — donc aucune analyse hors chat vocal, ce qui interdit la calibration au menu |
| **Steam Voice** (`ISteamUser`) | ❌ **Échoue** | Aucune API d'injection. Le flux est `StartVoiceRecording` → `GetAvailableVoice` → `GetVoice` : **Steam capture, toujours** |

### Critère 2 — accès à un signal non traité

Un seul candidat échoue ici, et c'est le même — mais pour une raison **indépendante et
plus grave** que la première.

La documentation de `ISteamUser` est explicite sur son flux « non compressé » : *« ce ne
sont pas les données brutes du micro »*, elles *« peuvent avoir traversé des filtres de
pré-traitement ou avoir eu leurs silences retirés »*, et *« les données peuvent n'être
disponibles que si des niveaux audibles de parole sont détectés »*.

**C'est un VAD.** Le GDD interdit nommément tout VAD sur le trajet d'analyse : il tronque
les attaques et supprime le chuchotement, qui est un registre central du jeu. Steam Voice
ne peut donc **pas** alimenter l'analyse, même si l'on renonçait à lui fournir notre PCM.

### La conséquence la plus lourde : ADR-0005 est atteint

ADR-0005 avait retenu « interface maison, backend interchangeable », avec pour
**implémentation A gratuite : Steam natif + FMOD 3D**. Cet inventaire établit que
**cette implémentation A n'est pas réalisable**. Steam Voice ne prend pas notre PCM et ne
rend pas de signal brut ; l'utiliser en parallèle de notre propre capture reviendrait à
ouvrir un **second lecteur sur le micro**, ce qu'ADR-0003 interdit explicitement.

Le principe d'ADR-0005 tient — c'est même lui qui permet ce changement sans réécriture.
C'est son implémentation par défaut qui tombe.

> **Steam survit comme transport, pas comme SDK vocal.** Rien n'empêche d'envoyer notre
> propre audio encodé sur le canal P2P Steam. Ce qui est écarté, c'est l'API `ISteamUser`
> de voix, pas Steam.

### Les quatre qui passent se divisent en deux familles

C'est le vrai découpage, et il ne porte pas sur l'audio.

**Famille A — bibliothèque, portée par notre P2P existant**

**Dissonance** est une bibliothèque, pas un service. Pas de serveur, pas de plafond de
joueurs simultanés, pas d'abonnement : **120 $ une fois**, plus 55 $ pour le pont de
lecture FMOD dont on aura besoin pour la spatialisation (système 3), soit les 175 $ déjà
anticipés par ADR-0005. Version 9.0.7 datée d'avril 2026 : activement maintenu.

*Réserve à lever* : l'intégration FishNet existe mais est **communautaire**
(`DissonanceVoiceForFishNet`), non officielle. À auditer avant engagement — c'est le seul
point d'incertitude de ce candidat.

**Famille B — service hébergé, coût récurrent et plafond de connexions**

Photon Voice 2, ODIN et Agora sont des services. Ils ajoutent **une seconde topologie
réseau** à côté du P2P hôte-autoritaire retenu par ADR-0001, avec sa propre facture, ses
propres pannes et son propre plafond.

- **Photon Voice 2** — le palier gratuit 20 CCU est **licencié développement et non
  commercial uniquement** : *publier sur Steam n'est pas couvert*. Les paliers sous
  500 CCU sont à plafond dur, les clients excédentaires étant rejetés.
- **ODIN** — gratuit en développement, à partir de 9,90 €/mois au lancement.
  Auto-hébergement possible à 350 €/mois pour une instance.
- **Agora** — facturation à l'usage.

> **Pour un jeu coopératif à quatre joueurs, en P2P, sans serveur, la famille B introduit
> un coût récurrent et un plafond là où l'architecture n'en avait aucun.** Ce n'est pas un
> détail de budget : c'est une seconde infrastructure à maintenir pour une fonction
> secondaire.

### La piste maison est plus accessible qu'écrit plus haut

L'alternative 3 de cet ADR jugeait l'écriture d'un transport vocal « un chantier sans
rapport avec ce que ce jeu doit prouver en premier ». **L'inventaire la rend moins lourde
qu'annoncé** :

- Le transport **existe déjà** — FishNet et FishyFacepunch, retenus par ADR-0001. Il n'y a
  pas de couche réseau à écrire, seulement un canal à utiliser.
- **Concentus** fournit Opus en **C# pur, sans bibliothèque native** — ce qui cadre avec
  `SUAC.Voice.Core` en netstandard2.1 et supprime la question du portage.
- **UniVoice** existe comme implémentation de référence de ce motif exact : transport
  interchangeable, encodage interchangeable.

Restent le tampon de gigue et la spatialisation. Ce n'est plus un chantier de fondation,
c'est un composant.

### Recommandation

**Dissonance**, sous réserve de l'audit de l'intégration FishNet. C'est le seul candidat
qui satisfasse le critère éliminatoire *sans* introduire de service tiers, de coût
récurrent ni de plafond de joueurs — et son `IMicrophoneCapture` est littéralement
l'interface que ce projet réclame.

**Le transport maison** (Concentus sur FishNet) reste le repli, et il est réel : coût nul,
aucune dépendance tierce, au prix d'un composant à écrire. À retenir si les 175 $ sont un
obstacle, ou si l'audit de l'intégration FishNet est défavorable.

**La famille B est écartée** sauf raison nouvelle : elle résout un problème que ce jeu n'a
pas — la montée en charge — en créant deux problèmes qu'il n'a pas non plus, une facture
et un plafond.

## Audit de l'intégration FishNet — 2026-09-07

> Réserve posée par l'inventaire, levée ici. **Backend retenu : Dissonance.**

`DissonanceVoiceForFishNet` — dépôt `ltd-backup/DissonanceVoiceForFishNet`, licence **MIT**,
78 étoiles, 21 forks.

### Le signal qui inquiétait, et ce qu'il vaut réellement

Le compte d'origine `LambdaTheDev` **redirige vers `ltd-backup`** — l'auteur a renommé son
compte en « backup ». Le dernier commit de sa main date du **2024-04-18**, et c'était le
dernier alignement de versions explicite : *« BREAKING: Changed Unity version to 2021 LTS,
and updated to FishNet 4 & Dissonance 8! »*

Mais le dépôt n'est pas mort pour autant. Trois contributions extérieures ont été fusionnées
depuis :

| Date | Auteur | Objet |
|---|---|---|
| 2025-04-03 | **Martin Evans** | `base.OnDisable` — *c'est l'auteur de Dissonance lui-même* |
| 2025-12-02 | Yazan Yahya | Refonte de `DissonanceFishNetPlayer` |
| 2026-04-30 | Holly Newlands | Correction d'une `NullReference` à la destruction du joueur |

**L'éditeur de Dissonance a lui-même contribué à cette intégration.** Ce n'est pas un
support officiel — la documentation de Dissonance la classe explicitement en
*community-developed*, aux côtés de PurrNet et par opposition à dix intégrations
officielles — mais ce n'est pas non plus un dépôt abandonné dans un coin.

### Le vrai risque technique : un écart de version majeure

| | Dernier alignement documenté | Notre projet |
|---|---|---|
| FishNet | 4 | **4.7.2R** (avril 2026) |
| Dissonance | **8** | **9.0.7** (avril 2026) |

**Personne n'a publiquement confirmé la compatibilité avec Dissonance 9.** Le README
n'énonce *aucune* version supportée — pas de matrice de compatibilité, seulement un lien
Discord. L'activité d'avril 2026 laisse penser que des gens l'utilisent aujourd'hui, à une
date où Dissonance 9.0.7 était déjà sorti, mais **c'est une inférence, pas une
vérification**. À établir en compilant.

### Un défaut connu, non corrigé, et qui nous concerne presque sûrement

Issues **#11 et #12** — le même défaut, signalé deux fois le même jour, ouvert depuis le
2025-01-29 :

> Si `DissonanceFishNetComms` est présent et que le serveur utilise un authenticator, le
> client peut être éjecté : *« sent a broadcast which requires authentication, but client
> was not authenticated »*. Dissonance démarre et tente d'émettre **avant que le client soit
> authentifié**.

Notre topologie est P2P Steam via FishyFacepunch (ADR-0001), où un authenticator à ticket
Steam est le motif standard. **Nous traverserons donc ce chemin.** La bonne nouvelle est que
le rapporteur a diagnostiqué précisément et nommé le correctif : ne démarrer Dissonance
qu'une fois l'authentification terminée, dans `DissonanceFishNetComms.cs`. Un fichier, un
point d'entrée.

Deux autres issues sont ouvertes : #11 est un doublon de #12, et #10 (`ArgumentNullException`,
août 2024) a plausiblement été traitée par le correctif d'avril 2026 sans que le lien soit
fait.

### Le chiffre qui change la question

| Périmètre | Taille |
|---|---|
| Cœur de l'intégration (9 fichiers) | **≈ 27 Ko, ~800 lignes** |
| Démos et éditeur (6 fichiers) | ≈ 8 Ko, non nécessaires |

Les deux plus gros fichiers font 7,5 Ko et 7 Ko. C'est un **adaptateur mince** au-dessus des
classes de base de Dissonance — ce que sa documentation confirme : *« Dissonance includes
base classes which can be extended to create a new network integration relatively easily. »*

### Décision : on l'intègre au projet, on n'en dépend pas

La question n'était pas la bonne. « Faut-il dépendre d'un dépôt communautaire dont
l'auteur est parti ? » — non. Mais à **800 lignes sous licence MIT**, ce n'est pas une
dépendance, c'est **un point de départ**.

- **Vendoriser** le cœur dans `Assets/_Project/`, sous notre contrôle de version. La licence
  MIT l'autorise explicitement.
- **Corriger le défaut d'authentification** nous-mêmes — il est déjà diagnostiqué, et nous
  aurions eu à le corriger de toute façon.
- **Ne pas reprendre** les démos ni les scripts d'éditeur.
- **Remonter le correctif en amont** si l'occasion se présente, sans en dépendre.

La question de maintenance se dissout : nous ne parions pas sur un mainteneur, nous
adoptons 800 lignes que nous saurons relire.

### Vendorisation faite le 2026-09-07

| Champ | Valeur |
|---|---|
| Emplacement | `Unity/Shut_up_and_carry/Assets/_Project/ThirdParty/DissonanceFishNet~/` |
| Commit épinglé | `18386e0fee21a3dfca0d121db10950fd10bc8d3c` |
| Contenu | 11 fichiers `.cs`, 2 `.asmdef`, `LICENSE` (MIT), `VENDORING.md` |
| Écarté | Le dossier `Demos/` de l'amont |
| État | **Import à l'identique, aucune modification locale** |

**Le dossier est délibérément inerte.** Son nom se termine par `~`, donc Unity l'ignore
entièrement — ni compilation, ni `.meta`, ni erreur. C'est nécessaire : au 2026-09-07,
**ni FishNet ni Dissonance ne sont installés** (aucun paquet réseau dans le manifeste, pas
de Dissonance dans `Assets/`). Activer ce code maintenant mettrait le projet en erreur de
compilation permanente et emporterait les 41 tests verts de `SUAC.Voice.Core` avec lui.
L'activation se fait par un simple renommage, une fois les dépendances en place.

> **Piège rencontré et corrigé.** Le `.gitignore` du projet contenait `*~`, la règle usuelle
> pour les fichiers de sauvegarde d'éditeur — elle excluait **tout le dossier vendorisé**.
> Sans exception explicite, la vendorisation aurait commité du vide, sans le moindre
> avertissement. Deux lignes de négation ont été ajoutées, commentées sur place.

Trois découvertes de l'import, consignées en détail dans `VENDORING.md` :

1. **`BroadcastHelper` contient du code `unsafe`** — l'asmdef amont porte bien
   `allowUnsafeCode: true`.
2. **Dissonance ne livre pas d'asmdef.** Il faudra les créer nous-mêmes après achat, selon
   la convention de l'éditeur.
3. **Les asmdef amont référencent par GUID, pas par nom.** Ces GUID sont ceux du projet de
   l'auteur : ceux de Dissonance **ne résoudront pas**, puisque nous créerons ses asmdef
   nous-mêmes et qu'Unity leur donnera de nouveaux GUID. À réécrire par nom à l'activation.

### Ce qu'il reste à vérifier, et dans cet ordre

1. **Compiler contre Dissonance 9.0.7 et FishNet 4.7.2R.** C'est le seul vrai inconnu.
2. **Vérifier que FishNet expose un canal non fiable et non ordonné.** Dissonance l'exige
   nommément — *« TCP is not suitable for high quality voice chat »*. FishNet propose des
   canaux non fiables ; à confirmer que l'intégration les utilise bien.
3. **Corriger le démarrage avant authentification** (#12).
4. **Alors seulement**, le test de partage de périphérique d'OQ-7.

### Écarté en cours d'audit

Dissonance possède une intégration **officielle** Steamworks.NET (P2P), qui éviterait le
code communautaire. Elle est écartée : notre stack utilise **Facepunch.Steamworks**, pas
Steamworks.NET. Introduire un second wrapper Steam dans le projet coûterait plus cher, et
en durabilité et en confusion, que de vendoriser 800 lignes qu'on relit une fois.

## Alternatives Considered

### Alternative 1 : tester le partage d'abord, choisir le SDK ensuite

**Rejetée.** C'est la formulation d'origine d'OQ-7. Elle mesure une propriété de la pile
audio système alors que le facteur déterminant est une propriété d'API tierce. Un test qui
réussit ne prouverait rien si le SDK retenu ensuite possède la capture.

### Alternative 2 : choisir le SDK sur d'autres critères et adapter l'architecture après

**Rejetée.** C'est ainsi qu'on découvre un blocage structurel après avoir écrit le système
2. La contrainte est connue maintenant ; elle doit s'appliquer maintenant.

### Alternative 3 : écrire notre propre transport vocal

Écartée du périmètre MVP, sans être exclue à terme. Elle supprime la question entièrement
— nous posséderions la capture et le trajet — au prix d'un chantier (codec, jitter buffer,
AEC) sans rapport avec ce que ce jeu doit prouver en premier.

## Consequences

### Positive

- Le risque le plus lourd du projet passe d'une inconnue diffuse à un **critère de
  sélection vérifiable**.
- La question se résout par de la lecture de documentation, sans écrire une ligne de code.
- Les issues du pire cas sont nommées et hiérarchisées **avant** d'être subies.

### Negative

- Réduit le catalogue des backends, peut-être fortement, et possiblement en écartant des
  solutions gratuites qui auraient convenu par ailleurs.
- Ajoute une étape avant le POC audio.

### Neutral

- ADR-0005 n'est pas invalidé : son principe d'interface maison tient, et c'est même lui
  qui rend ce filtrage possible sans réécriture. Cet ADR **précise le domaine de validité**
  de son interchangeabilité.

## Risks

| Risque | Probabilité | Impact | Atténuation |
|---|---|---|---|
| Aucun backend gratuit n'accepte de PCM externe | Moyenne | Élevé | Les trois issues ci-dessus, hiérarchisées à l'avance |
| Un SDK annonce la capacité sans la tenir en pratique | Moyenne | Élevé | Le test de partage (OQ-7) reste obligatoire **après** sélection — il valide, il ne présélectionne pas |
| Le signal ingéré ressort déjà traité malgré l'ingestion externe | Moyenne | Élevé | Second critère explicite ci-dessus ; à vérifier sur signal réel, pas sur documentation |

## Migration Plan

Aucune migration : rien n'est encore intégré. C'est précisément ce qui rend le moment
favorable — la contrainte s'applique avant le premier choix, non après.

## Validation Criteria

- [x] **Un inventaire écrit des SDK candidats et de leur capacité d'ingestion PCM, sourcé.**
      Fait le 2026-09-07 — voir ci-dessus.
- [x] **Un backend retenu.** **Dissonance**, décidé le 2026-09-07. 120 $ + 55 $ pour le pont
      de lecture FMOD.
- [x] **Audit de l'intégration `DissonanceVoiceForFishNet`.** Fait — voir ci-dessus.
      Verdict : **vendoriser**, ne pas dépendre. 800 lignes MIT, auteur d'origine parti mais
      dépôt vivant, un défaut connu et déjà diagnostiqué à corriger.
- [x] **Vendoriser l'intégration.** Fait le 2026-09-07, import à l'identique au commit
      `18386e0`, sous `Assets/_Project/ThirdParty/DissonanceFishNet~/`, **inerte** tant que
      les dépendances manquent.
- [ ] Acheter Dissonance (120 $) + pont FMOD (55 $), installer FishNet et FishyFacepunch.
- [ ] **Compiler contre Dissonance 9.0.7 et FishNet 4.7.2R.** Dernier alignement documenté :
      Dissonance **8**. C'est le seul vrai inconnu de ce choix.
- [ ] Vérifier que le canal utilisé est **non fiable et non ordonné** — exigence explicite de
      Dissonance.
- [ ] Corriger le démarrage avant authentification (issue #12) dans `DissonanceFishNetComms.cs`.
- [ ] Le test de partage OQ-7 exécuté **sur ce backend**, et concluant.
- [ ] **ADR-0005 amendé** — son implémentation A gratuite n'est plus réalisable.

## Sources

Consultées le 2026-09-07. Documentation éditeur de préférence à toute source secondaire.

| Sujet | Source |
|---|---|
| Dissonance — capture personnalisée | [Writing A Custom Microphone Capture System](https://placeholder-software.co.uk/dissonance/docs/Tutorials/Custom-Microphone-Capture.html) · [IMicrophoneCapture](https://placeholder-software.co.uk/dissonance/docs/Reference/Audio/IMicrophoneCapture.html) |
| Dissonance — prix et maintenance | [Unity Asset Store](https://assetstore.unity.com/packages/tools/audio/dissonance-voice-chat-70078) · [Dissonance For FMOD (Playback)](https://assetstore.unity.com/packages/tools/integration/dissonance-for-fmod-playback-213415) |
| Dissonance — intégration FishNet | [DissonanceVoiceForFishNet](https://github.com/LambdaTheDev/DissonanceVoiceForFishNet) · [Choosing A Network](https://placeholder-software.co.uk/dissonance/docs/Basics/Choosing-A-Network.html) |
| Photon Voice 2 — source personnalisée | [Recorder Component](https://doc.photonengine.com/voice/v2/getting-started/recorder) |
| Photon — licence et plafonds | [Photon Pricing & CCU Plans](https://doc.photonengine.com/photon/current/pricing) · [Photon Voice Pricing](https://www.photonengine.com/voice/pricing) |
| ODIN — entrée audio personnalisée | [ODIN Voice Unity SDK](https://docs.4players.io/voice/unity/) · [FMOD Integration](https://docs.4players.io/voice/unity/guides/odin-fmod/) |
| ODIN — tarifs | [ODIN Pricing](https://odin.4players.io/pricing/) · [Starter Plans](https://odin.4players.io/mini/) |
| Agora — source audio externe | [Voice Calling — Custom audio source](https://docs.agora.io/en/voice-calling/advanced-features/custom-audio) |
| Vivox — accès aux buffers | [How to: Access client-side audio buffers](https://support.unity.com/hc/en-us/articles/4418149054356-Vivox-How-to-Access-client-side-audio-buffers) |
| Steam Voice — pas d'injection | [Steam Voice](https://partner.steamgames.com/doc/features/voice) |
| Steam Voice — signal non brut, VAD | [ISteamUser Interface](https://partner.steamgames.com/doc/api/isteamuser) |
| Opus en C# pur | [Concentus](https://github.com/lostromb/concentus) |
| Motif transport maison | [UniVoice](https://github.com/adrenak/univoice) |
| Intégration FishNet — dépôt, commits, issues, tailles | [DissonanceVoiceForFishNet](https://github.com/ltd-backup/DissonanceVoiceForFishNet) *(API GitHub, 2026-09-07)* |
| Intégration FishNet — statut communautaire | [Choosing A Network](https://placeholder-software.co.uk/dissonance/docs/Basics/Choosing-A-Network.html) |

## GDD Requirements Addressed

| GDD Document | System | Requirement | How This ADR Satisfies It |
|-------------|--------|-------------|--------------------------|
| `design/gdd/voice-analysis.md` | Open Questions — OQ-7 | « Le micro peut-il vraiment être partagé ? » | Recadre : la question préalable est la capacité d'ingestion du SDK |
| `design/gdd/voice-analysis.md` | Visual/Audio Requirements | « Livrer le signal brut : post-AEC uniquement, jamais de VAD, d'AGC ni de suppression de bruit » | En fait un critère de sélection du backend, pas un souhait adressé au système 2 |
| `design/gdd/voice-analysis.md` | Dependencies — Système 2 | « Posséder le périphérique et le fourcher — jamais un second lecteur » | Établit à quelle condition ce contrat est seulement réalisable |

> TR-ID stables à attribuer par `/architecture-review`.

## Related

- **ADR-0005** — Transport de la voix : cet ADR précise le domaine de validité de son
  interchangeabilité
- **ADR-0003** — Fourche du signal et AEC en amont : c'est le trajet que cette question
  peut invalider
- `design/gdd/voice-analysis.md` — OQ-7
- `design/gdd/reviews/voice-analysis-2026-09-07.md` — la revue qui a produit ce recadrage
