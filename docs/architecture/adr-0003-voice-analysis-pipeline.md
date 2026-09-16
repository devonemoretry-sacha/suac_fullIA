# ADR-0003: Voice Analysis Pipeline — Local Raw Capture, Feature Transmission

## Status

**Accepted** — amendé le 2026-09-08 (aucune AEC sur la branche d'analyse, casque prérequis)
et le 2026-09-16 (seul `r'` quitte le client, règle de traitement unique en amont de
l'analyse, décimation et expiration des paquets à l'hôte). Historique en fin de document.

## Last Verified

2026-09-16

## Decision Makers

Utilisateur (solo dev). Formalisé depuis `Obsedian_SUAC_FIA/05 - Journal/LOG - Décisions techniques.md`.

## Summary

La mécanique centrale du jeu exige d'analyser la voix de chaque joueur (volume,
hauteur, texture) avec assez de fidélité pour distinguer un chuchotement d'un cri et
un claquement de langue d'un son tenu. Décision : **chaque client analyse son propre
micro sur le signal brut, en local, et ne transmet à l'hôte que des features
normalisées** — jamais de l'audio, et jamais son profil de calibration.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Unity 6.3 LTS (`6000.3.18f1`) |
| **Domain** | Audio / Networking |
| **Knowledge Risk** | LOW pour l'analyse — elle est écrite en C# pur dans `SUAC.Voice.Core`, sans dépendance moteur ni middleware. MEDIUM pour la capture : la contention de périphérique micro (deux consommateurs) n'est pas vérifiée |
| **References Consulted** | `docs/engine-reference/unity/modules/audio.md`, `docs/engine-reference/unity/VERSION.md` |
| **Post-Cutoff APIs Used** | Aucune API Unity post-cutoff |
| **Verification Required** | **Point ouvert critique** : la capture d'analyse lit le micro **directement**, indépendamment du chat vocal. Il y a donc deux consommateurs du même périphérique (analyse + chat vocal). Contention de device à vérifier au POC audio. |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | ADR-0006 (le découpage en assemblies conditionne où vit l'analyse) |
| **Enables** | ADR-0002 (définit ce que l'hôte reçoit), ADR-0004 (contrat de données produit par cette chaîne), ADR-0005 (retire Dissonance du chemin critique) |
| **Blocks** | Systèmes 1, 2 et 6 du périmètre MVP |
| **Ordering Note** | Cet ADR **corrige** la description initiale d'ADR-0002 : l'hôte n'analyse aucun signal. Les deux doivent être lus ensemble. |

## Context

### Problem Statement

Les chaînes de préprocessing vocal standard (VAD, AGC, suppression de bruit) sont
conçues pour isoler la parole et supprimer le reste. Or le gameplay repose précisément
sur ce qu'elles détruisent : le chuchotement (faible énergie, largement non voisé) et
les sons percussifs (transitoires non-parole). **L'AGC normalise le volume — donc
efface l'écart chuchotement/cri, qui est la mécanique n°1 du jeu.**

### Current State

`Voice.Core` implémente les primitives d'analyse (`LoudnessMeter`, `PitchDetector`,
`Decimator`, `EnvelopeFollower`) avec 41 tests. Le `VoiceAnalyzer` et la normalisation
restent à écrire (`design/gdd/voice-analysis.md`, « État du code aujourd'hui »). Aucune
capture micro n'est branchée : l'assembly est `noEngineReferences` et reçoit des
échantillons de l'extérieur.

### Constraints

- L'analyse doit tourner ~50 fois par seconde et par joueur
- L'hôte ne doit pas devenir un goulot d'étranglement
- La bande passante doit rester négligeable devant le chat vocal

### Requirements

- Analyser le signal **brut**, en amont de tout traitement de confort
- Préserver le chuchotement et les transitoires percussifs
- Garantir l'équité vocale entre joueurs aux micros et aux voix hétérogènes

## Decision

### Architecture

**Deux voies distinctes sur le même micro, sans aucun traitement en amont de la fourche** :

```
micro
  │
  ├── voie ANALYSE      → aucun traitement → analyse (RMS, crête, YIN).  Objectif : vérité du signal.
  └── voie COMMUNICATION → AEC, VAD, AGC, suppression de bruit → chat vocal.  Objectif : confort d'écoute.
```

- **Voie analyse** → signal **brut**, prélevé avant tout traitement → analyse locale.
- **Voie communication** → signal **traité** par le backend vocal (ADR-0008 : Dissonance, dont
  l'AEC s'applique sur sa propre branche de transmission) → chat vocal.

### Aucune annulation d'écho ne protège l'analyse — le casque est la seule mitigation

Les voix des coéquipiers sortent des haut-parleurs d'un joueur et rentrent dans son micro.
**Les trois défenses de l'analyse les laissent toutes passer** : la porte de volume s'ouvre,
YIN déclare voisé — *c'est une vraie voix humaine* — et le test de jitter passe. La porte
de voisement a été conçue pour rejeter ce qui n'est **pas** une voix ; elle n'a aucun moyen
d'écarter une voix véritable qui n'est simplement pas la bonne.

Conséquence : **sur haut-parleurs, un joueur se tait et son meuble s'alourdit**. Dans un
jeu coopératif où il faut se parler pour porter à deux, le jeu punit sa propre boucle
centrale pour ce joueur — et la gêne déborde sur le coéquipier qui porte l'autre bout. Le
pire cas est le **portable à micro et haut-parleurs intégrés**, quelques centimètres
d'écart, configuration très répandue.

**Le casque est donc une condition de fonctionnement du jeu**, pas un conseil de confort
(décision du 2026-09-08). Un joueur sur haut-parleurs aura un jeu dégradé, et c'est assumé.
Aucune solution n'est écartée par impossibilité : trois remèdes existent, et ils sont
**refusés ou reportés pour des raisons chiffrables** — voir *Alternatives Considered*,
alternatives 7 à 10. Ce refus est révisable si le playtest montre une part significative de
joueurs sur haut-parleurs.

**Ce que cette décision impose ailleurs.** Le message sur le casque ne peut pas être une
ligne dans les options : il apparaît au premier lancement, avant la calibration, et **dit
pourquoi** — sans quoi le joueur sur haut-parleurs vivra un jeu cassé sans jamais soupçonner
la cause. C'est une exigence de la section *UI Requirements* de `voice-calibration.md`.

### Chaîne d'analyse, entièrement côté client

1. Client : capture micro **brute**, sans traitement
2. Client : analyse locale (RMS, fréquence fondamentale par YIN, facteur de crête)
3. Client : **normalisation sur son profil de calibration personnel**
4. Client → Hôte : paquet de features à cadence fixe (~20–30 Hz), **décimé en conservant le
   maximum de `Loudness` de l'intervalle**. L'hôte **date chaque paquet à sa réception** et le
   tient pour **expiré** au-delà d'un délai court : une trame expirée vaut silence (valeur :
   `design/gdd/voice-object-effect.md`, liste canonique). Sans cette horloge, un paquet
   « silence » perdu laisserait un objet charger sur le dernier cri reçu
5. Client → Hôte : **`r'`, un seul nombre dérivé du profil**, à la connexion et à chaque
   recalibration — la place de la voix posée du joueur entre sa porte de volume et son cri
   (`design/gdd/voice-analysis.md`, *Formulas* §1). **Le `VoiceProfile` ne quitte jamais le
   client**
6. Hôte : applique distance et cumul multi-joueurs, compare des positions aux seuils
   personnels, décide de la physique, diffuse (ADR-0002)

**Blocs découplés** (décision du 2026-06-30, mise à jour) :

```
Micro (capture brute)
    ↓
Analyse (RMS, f0, crest factor)
    ↓
Normalisation (profil joueur)
    ↓
VoiceFrame → réseau → effets gameplay
```

Chaque bloc a une responsabilité unique et un contrat clair, testable indépendamment.

### Key Interfaces

- **Analyse : DSP maison en C# pur**, dans `SUAC.Voice.Core` — `Decimator`,
  `EnvelopeFollower`, `LoudnessMeter`, `PitchDetector` (YIN). Aucune dépendance
  moteur ni middleware. Voir ADR-0004.
- Sortie : `VoiceFrame` (voir ADR-0004), instantané daté valide comme paquet réseau
- Cadence réseau : ~20–30 Hz, ~5 floats par joueur et par trame ; plus `r'` hors cadence
- **Énergies par bande : non implémentées.** Elles viennent du modèle FFT abandonné le
  2026-07-27 (*Revision History*). Si un système en a besoin — la question est posée au
  système 3, propagation du son —, elles se décideront là, pas par héritage de cet ADR.

> **FMOD ne fait pas partie du chemin d'analyse.** L'analyse est écrite en C# pur dans une
> assembly qui s'interdit `UnityEngine` — donc a fortiori FMOD — et elle est testée hors
> éditeur. **FMOD reste retenu pour la restitution** (spatialisation 3D, occlusion,
> réverbération) : c'est une décision de direction audio, traitée en ADR-0005.

### Implementation Guidelines

- **Aucun traitement qui modifie la dynamique ou la forme d'onde dans la bande vocale** n'est
  autorisé en amont de l'analyse : ni AGC, ni suppression de bruit, ni VAD, ni compression,
  ni AEC. **C'est la règle unique** — elle ne connaît pas d'exception nommée, et un ajout
  futur se juge contre elle.
  - *Ce qu'elle permet* : soustraire un **offset continu** par une moyenne glissante d'environ
    1 s (coupure ≈ 0,16 Hz). C'est bien un filtre, et on le dit ; il ne touche ni la
    dynamique ni la forme d'onde dans la bande vocale. **Il n'est ajouté que si la mesure le
    justifie** (enregistrement du silence au prototype navigateur, `design/gdd/reviews/voice-analysis-2026-09-14.md`, liste B, point 7).
  - *Ce qu'elle exclut* : un passe-haut à 20–40 Hz. À 40 Hz, un filtre à un pôle donne
    −1,2 dB et +30° à 70 Hz : il déforme l'onde, donc le facteur de crête, précisément pour
    les voix graves.
- Le **crest factor** (rapport crête/RMS) sur signal brut discrimine le percussif du
  continu — troisième brique de la grille voice-physics, sans traitement supplémentaire
- **Le casque est un prérequis** — voir *Decision*. C'est la condition pour que la mesure
  vocale soit valide
- **Le VAD ne peut pas servir de garde pour économiser l'analyse** : elle doit tourner même
  quand le VAD dit « pas de parole », précisément parce que le chuchotement passe sous son
  seuil
- Gérer les buffers circulaires proprement (risque de fuite mémoire)

## Alternatives Considered

### Alternative 1: Analyse côté hôte sur le flux Dissonance

Ce qui traverse le réseau est le signal *après* VAD, *après* réduction de bruit, encodé
par un codec vocal. Le VAD ne transmet pas les trames sous son seuil — chuchotements et
sons percussifs n'arriveraient jamais à l'hôte — et le codec jette la texture fine d'un
murmure. **Rejetée** : incompatible avec l'exigence d'analyse sur signal brut.

### Alternative 2: Envoi de l'audio brut à l'hôte pour analyse

Bande passante disproportionnée, et redondant avec le transport Dissonance. **Rejetée.**

### Alternative 3: Vivox DSP metrics

Fournirait volume et énergies globales, mais **pas la granularité fréquentielle**
nécessaire pour que des objets différents réagissent à des bandes différentes. **Rejetée.**

### Alternative 4: WebAudio FFT

Natif navigateur, inapplicable à Unity. **Rejetée.**

### Alternative 5: FMOD pour l'analyse

Retenue le 2026-07-04 sous le modèle `buffer Dissonance → FMOD → FFT`, puis **rendue
sans objet** par la correction du 2026-07-27 : l'analyse ayant lieu en local sur le micro
brut, dans une assembly sans référence moteur, FMOD n'a plus de rôle à y jouer. FMOD reste
retenu pour la **restitution** — voir ADR-0005.

### Alternative 6: Plugin DSP natif custom (C++)

Envisagé au 2026-07-04 comme « trop complexe, trop lent ». **Sans objet** : le DSP en C#
managé s'est avéré suffisant et suffisamment rapide, avec l'avantage décisif d'être
testable hors éditeur en millisecondes.

### Alternative 7: AEC du backend vocal placée en amont de la fourche

Exigée par l'amendement du 2026-09-03, **abandonnée le 2026-09-08** après lecture de la
documentation de Dissonance. Trois raisons, par ordre de gravité :

1. **Elle s'applique en aval, sur sa propre branche.** *« The AEC filter is attached to the
   audio mixer on the output »* ; *« The filter will only process audio which passes through
   the mixer it is attached to »* ; elle retire les échos *« from the **transmitted** voice
   signal »*. Si nous fournissons le PCM par `IMicrophoneCapture` (ADR-0008), Dissonance
   applique son AEC après nous, pour son propre usage : la branche d'analyse n'en reçoit
   aucune.
2. **Son signal de référence exige le mixeur Unity**, que le pont *Dissonance For FMOD
   (Playback)* contourne en remplaçant l'`AudioSource` par FMOD. *(Déduit de deux sources
   concordantes ; la page AEC ne mentionne pas FMOD.)*
3. **Son mécanisme convient mal au jeu** : la calibration du délai prend plusieurs secondes
   et se perd pendant les silences prolongés — dans un jeu d'horreur bâti sur le silence.

Reprendre le signal post-AEC de Dissonance n'ouvre pas de voie : son préprocesseur applique
aussi VAD, suppression de bruit et AGC, rien n'indique un point de sortie *post-AEC mais
pré-reste*, et cette voie inverserait la prémisse d'ADR-0008.

**Sources** : [Acoustic Echo Cancellation](https://placeholder-software.co.uk/dissonance/docs/Tutorials/Acoustic-Echo-Cancellation.html) ·
[Dissonance For FMOD (Playback)](https://assetstore.unity.com/packages/tools/integration/dissonance-for-fmod-playback-213415)

### Alternative 8: Notre propre AEC native en amont (WebRTC-APM)

Une dépendance native de plus et un pont à écrire ; `Voice.Core` n'y touche pas et reste
`noEngineReferences`. **Reportée** : elle se rouvre si le playtest montre qu'un casque
**ouvert** fuit assez pour polluer la mesure.

### Alternative 9: AEC auto-référencée dans l'analyse

**Réalisable, et refusée.** Le jeu connaît, échantillon par échantillon, les voix qu'il
restitue : un filtre adaptatif (NLMS) calé sur ce signal de sortie, appliqué dans
`Voice.Core` avant l'analyse, n'exigerait ni Dissonance ni le mixeur Unity. Il soustrait un
signal connu, ce qui le rend compatible en principe avec la règle unique de traitement.

**Pourquoi refusée** : un coût DSP réel sur chaque client, un retard acoustique variable
selon le périphérique et le volume à estimer en continu, et tout cela pour une population
que le prérequis du casque écarte déjà — dans un projet dont le pari central n'est pas
encore prototypé. **Le prix est assumé et écrit** : le joueur sur haut-parleurs n'a aucune
protection. **Révisable** si le playtest montre une part significative de joueurs sur
haut-parleurs.

### Alternative 10: Couper l'analyse pendant la restitution d'une voix distante

On sait quand une voix distante est jouée, puisque c'est nous qui la jouons. Ce n'est pas
de l'AEC, c'est un squelch. **Rejetée** : le joueur ne pourrait plus agir sur les objets
pendant que ses coéquipiers parlent, dans un jeu où crier ensemble est le geste central.
On échangerait une entrée fausse contre une absence d'entrée.

## Consequences

### Positive

- Seul le client dispose du signal brut fidèle — condition sine qua non du gameplay
- **Charge CPU de l'hôte quasi nulle** : aucune analyse de signal
- **Bande passante minimale** (~5 floats par joueur et par trame, plus `r'` hors cadence)
- **Supprime la dépendance bloquante à l'API Dissonance** : le client n'a besoin que de
  son propre micro ; Dissonance sort du chemin critique et redevient du transport pur
- L'hôte reste autoritaire sur la physique : l'autorité porte sur la décision de
  gameplay, pas sur la mesure
- Le format transmis épouse la grille à trois briques du GDD (volume / hauteur / forme temporelle)
- **L'analyse n'a aucune dépendance tierce** : ni moteur, ni middleware, ni licence.
  Elle compile en netstandard2.1 et se teste hors Unity en millisecondes

### Negative

- **Un client modifié peut mentir sur ses features.** Accepté : en coop entre amis sur
  Steam P2P, mentir n'allège que son propre objet, sans classement ni économie à truquer.
  L'hôte borne les valeurs reçues.
- **Un seul nombre tiré de la calibration voyage : `r'`**, transmis à l'hôte à la connexion
  et à chaque recalibration. Sans lui, l'hôte ne peut poser aucun seuil personnel
  (`design/gdd/voice-object-effect.md`). Le `VoiceProfile` — niveaux sonores du domicile,
  hauteur de voix — ne quitte jamais la machine (`design/gdd/voice-calibration.md`)
- **Le joueur sur haut-parleurs a un jeu dégradé**, sans protection — voir *Decision* et
  l'alternative 9
- Deux chaînes audio au lieu d'une : coût CPU côté client
- La capture d'analyse et le chat vocal lisent le même micro : deux consommateurs à faire coexister

### Neutral

- L'ordre des blocs a changé par rapport au schéma de 2026-06-30 : `SYS - Audio & Voix.md` est à mettre à jour

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **Contention de périphérique** : analyse et chat vocal lisent le même micro | **Moyenne** | **Élevé** | Non vérifié. À lever au POC audio. C'est le point ouvert n°1 de cet ADR |
| **Entrée fantôme par les haut-parleurs** : un joueur sans casque injecte la voix de ses coéquipiers dans sa propre analyse | **Élevée sans casque** | **Élevé** | **Casque prérequis**, annoncé au premier lancement avec sa raison. Aucune AEC sur la branche d'analyse (alternatives 7 à 9). Le cas le plus visible : un cri d'un tiers écrase le meuble que vous portez, et vous accusez le jeu |
| **Fuite d'un casque ouvert** vers le micro | Faible | Moyen | Mesurer la fuite au POC audio : la voix d'un coéquipier restituée au casque doit rester sous la porte de volume du joueur. Si elle la franchit : rouvrir l'alternative 8 |
| Latence cumulée (analyse + réseau) trop élevée | Moyenne | Élevé | À mesurer dès le POC ; estimations du LOG non mesurées |
| Les joueurs ne parviennent pas à contrôler leur voix assez finement | Moyenne | **Élevé** | Playtests critiques. Risque de design, pas technique |
| Accessibilité : joueurs dysphoniques ou à voix atypique | Moyenne | Moyen | La normalisation par profil personnel atténue, sans annuler ; aucun détecteur ne refuse seul un profil (`voice-analysis.md`, *Formulas* §4) |

## Performance Implications

| Metric | Before | Expected After | Budget |
|--------|--------|---------------|--------|
| CPU client (analyse) | n/a | **Non mesuré.** L'estimation du LOG (« <10 % par joueur à ~1024 échantillons ») portait sur une FFT abandonnée et ne s'applique pas à la chaîne RMS/YIN/crête ; `voice-analysis.md`, AC-42, mesure deux profils | <1 ms/frame sur le thread principal |
| CPU hôte (analyse) | analyse par joueur *(modèle abandonné)* | **0** | — |
| Réseau | audio brut *(rejeté)* | ~5 floats × 20–30 Hz × N joueurs, plus `r'` hors cadence | négligeable |

## Migration Plan

Aucune migration de code : la capture n'est pas écrite. En revanche, **deux documents
portent encore l'ancien modèle** et doivent être corrigés :

1. `Obsedian_SUAC_FIA/02 - Systèmes/SYS - Audio & Voix.md` — l'ordre des blocs place encore Dissonance en tête de chaîne
2. Toute future rédaction s'appuyant sur les entrées LOG des 2026-06-30 et 2026-07-04 doit tenir compte de la correction du 2026-07-27

**Rollback plan** : si l'analyse ne peut pas lire un signal micro brut — contention de
périphérique insoluble, ou traitement imposé par le système — la mécanique centrale est
remise en cause. Ce n'est pas un rollback technique mais un **PIVOT de design**. D'où la
priorité absolue du POC audio, avant toute conception de système en dépendant.

## Validation Criteria

- [ ] La capture d'analyse et le chat vocal accèdent au micro simultanément, sans conflit de périphérique
- [ ] Le signal lu par l'analyse est bien brut — ni VAD, ni AGC, ni suppression de bruit, ni AEC en amont
- [ ] **Avec un casque, la voix d'un coéquipier restituée au casque ne franchit pas la porte de volume du joueur** — mesure de fuite au POC audio
- [ ] **Aucun paquet sortant ne contient un champ du `VoiceProfile`** ; seul `r'` en est dérivé
- [ ] Un paquet de features plus vieux que le délai d'expiration ne pèse plus sur aucun objet ; la décimation conserve le maximum de `Loudness` de l'intervalle
- [ ] Un chuchotement produit des features exploitables (non écrasées par un seuil)
- [ ] Un claquement de langue est distingué d'un son tenu par le crest factor
- [ ] La charge CPU client mesurée respecte le budget
- [ ] La bande passante mesurée reste négligeable devant le chat vocal
- [ ] Deux joueurs fournissant le même effort vocal produisent des features comparables après normalisation

## GDD Requirements Addressed

| GDD Document | System | Requirement | How This ADR Satisfies It |
|-------------|--------|-------------|--------------------------|
| `design/gdd/game-concept.md` | Pillar 1 — Voice-Physics | « Réagissent en temps réel au volume et au pitch de la voix » | Définit la chaîne qui produit ces mesures |
| `design/gdd/game-concept.md` | Core Mechanics | « Analyse vocale en temps réel → effet physique » | Fixe où l'analyse tourne et ce qui transite |
| `design/mvp-scope.md` | Systèmes 1, 2, 6 | Analyse vocale, effet sur les objets, chat de proximité | Sépare les deux voies audio et leurs objectifs distincts |
| `design/gdd/voice-object-effect.md` | Système 11 | Seuils personnels calculés sur l'hôte | Achemine `r'` vers l'hôte, sans le profil |

> TR-ID stables à attribuer par `/architecture-review`.

## Related

- **ADR-0004** — Contrat de données brut/normalisé : définit `VoiceFrame`, la sortie de cette chaîne
- **ADR-0002** — Autorité physique : cet ADR **corrige** sa description initiale (l'hôte n'analyse aucun signal)
- **ADR-0005** — Transport du chat vocal : cette décision retire Dissonance du chemin critique de l'analyse
- **ADR-0006** — Découpage en assemblies : `Voice.Core` porte l'analyse, `Voice.Capture` l'accès micro
- **ADR-0008** — Backend vocal : Dissonance, ingestion de PCM externe
- Source : `LOG - Décisions techniques.md`, entrées des 2026-06-30, 2026-07-04, 2026-07-05 (corrigée) et 2026-07-27

## Revision History

| Date | Changement | Source |
|---|---|---|
| 2026-06-30 → 2026-07-05 | Décisions d'origine au LOG : analyse locale, schéma de blocs, « FMOD + FFT natif » | `LOG - Décisions techniques.md` |
| 2026-07-27 | **Correction** : l'entrée du 2026-07-05 décrivait une FFT côté hôte sur le flux reçu via Dissonance — erreur de rédaction, l'intention a toujours été d'analyser en local. Le schéma du 2026-06-30 plaçait Dissonance en tête de chaîne : la capture d'analyse est désormais alimentée par le micro directement. Le modèle FFT, les énergies par bande et l'estimation CPU associée deviennent hérités | idem |
| 2026-09-03 | Formalisation en ADR. **Amendement** : l'AEC est reclassée de « confort d'écoute » en correction de gameplay et exigée en amont de la fourche, comme seul traitement autorisé avant l'analyse | Revue directeurs du 2026-09-03 |
| 2026-09-08 | **Amendement du 2026-09-03 rétrogradé** : l'AEC de Dissonance s'applique en aval, sur sa branche de transmission (alternative 7). Option A retenue : aucune AEC sur l'analyse, casque prérequis et mitigation unique | `docs/architecture/voice-chain-td-review-2026-09-08.md` ; décision du propriétaire |
| 2026-09-16 | Corrigé en place selon la règle « corriger en place » : le corps ne décrit plus l'AEC en amont ; **règle unique** « aucun traitement qui modifie la dynamique ou la forme d'onde dans la bande vocale » ; **seul `r'` quitte le client**, jamais le `VoiceProfile` (décision E5 précisée) ; AEC auto-référencée écrite comme **réalisable et refusée**, avec son prix (décision D3) ; passe-haut exclu, soustraction d'offset permise sur mesure ; modèle FFT et estimation CPU marqués hérités | `design/gdd/reviews/voice-analysis-2026-09-14.md` §3 (b) et §6 ; décisions du propriétaire du 2026-09-15 |
