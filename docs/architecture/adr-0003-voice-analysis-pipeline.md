# ADR-0003: Voice Analysis Pipeline — Local Raw Capture, Feature Transmission

## Status

Accepted

## Date

2026-09-03 *(formalisation ; décisions d'origine des 2026-06-30, 2026-07-04, 2026-07-05, corrigées le 2026-07-27)*

## Last Verified

2026-09-03

## Decision Makers

Utilisateur (solo dev). Formalisé depuis `Obsedian_SUAC_FIA/05 - Journal/LOG - Décisions techniques.md`.

## Summary

La mécanique centrale du jeu exige d'analyser la voix de chaque joueur (volume,
hauteur, texture) avec assez de fidélité pour distinguer un chuchotement d'un cri et
un claquement de langue d'un son tenu. Décision : **chaque client analyse son propre
micro sur le signal brut, en local, et ne transmet à l'hôte que des features
normalisées** — jamais de l'audio.

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
| **Ordering Note** | Cet ADR **corrige** la description initiale d'ADR-0002 : l'hôte ne calcule pas la FFT. Les deux doivent être lus ensemble. |

## Context

### Problem Statement

Les chaînes de préprocessing vocal standard (VAD, AGC, suppression de bruit) sont
conçues pour isoler la parole et supprimer le reste. Or le gameplay repose précisément
sur ce qu'elles détruisent : le chuchotement (faible énergie, largement non voisé) et
les sons percussifs (transitoires non-parole). **L'AGC normalise le volume — donc
efface l'écart chuchotement/cri, qui est la mécanique n°1 du jeu.**

### Current State

`Voice.Core` implémente déjà l'analyse (`LoudnessMeter`, `PitchDetector`, `Decimator`,
`EnvelopeFollower`) avec 41 tests. Aucune capture micro n'est branchée : l'assembly
est `noEngineReferences` et reçoit des échantillons de l'extérieur.

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

**Deux voies distinctes sur le même micro** :

- **Voie communication** → signal **traité** (VAD, AGC, suppression de bruit, AEC) → chat vocal. Objectif : confort d'écoute.
- **Voie analyse** → signal **brut**, prélevé avant tout traitement → FFT. Objectif : vérité du signal.

**Chaîne d'analyse, entièrement côté client** :

1. Client : capture micro **brute**, en amont de tout traitement de confort
2. Client : analyse locale (RMS, f0, crest factor, énergies par bande)
3. Client : **normalisation sur son profil de calibration personnel**
4. Client → Hôte : paquet de features à cadence fixe (~20–30 Hz)
5. Hôte : applique distance et cumul multi-joueurs, décide de la physique, diffuse (ADR-0002)

**Blocs découplés** (décision du 2026-06-30, mise à jour) :

```
Micro (capture brute)  ← corrigé : la source n'est plus Dissonance
    ↓
Analyse (RMS, f0, crest factor, bandes)
    ↓
Normalisation (profil joueur)
    ↓
VoiceFrame → réseau → effets gameplay
```

Chaque bloc a une responsabilité unique et un contrat clair, testable indépendamment.

> **Correction historique.** L'entrée du 2026-07-05 décrivait initialement une FFT
> côté hôte sur le flux reçu via Dissonance. C'était une erreur de rédaction, corrigée
> le 2026-07-27 : l'intention a toujours été d'analyser en local. De même, le schéma de
> blocs du 2026-06-30 plaçait Dissonance en tête de chaîne — la capture d'analyse est
> désormais alimentée par le micro directement. `SYS - Audio & Voix.md` doit être mis à
> jour en conséquence.

### Key Interfaces

- **Analyse : DSP maison en C# pur**, dans `SUAC.Voice.Core` — `Decimator`,
  `EnvelopeFollower`, `LoudnessMeter`, `PitchDetector` (YIN). Aucune dépendance
  moteur ni middleware. Voir ADR-0004.
- Bandes de fréquences typiques : `<100 Hz`, `100–500 Hz`, `500 Hz–2 kHz`, `>2 kHz`
- Sortie : `VoiceFrame` (voir ADR-0004), instantané daté valide comme paquet réseau
- Cadence réseau : ~20–30 Hz, ~5 floats par joueur et par trame

> **FMOD ne fait pas partie du chemin d'analyse.** La décision du 2026-07-04 retenait
> « FMOD + FFT natif », mais elle a été prise sous le modèle abandonné
> (`buffer Dissonance → FMOD → FFT`). Le code effectivement écrit fait l'analyse en C#
> pur dans une assembly qui s'interdit `UnityEngine` — donc a fortiori FMOD — et il est
> testé (41 tests verts, hors éditeur). **FMOD reste retenu pour la restitution**
> (spatialisation 3D, occlusion, réverbération) : c'est une décision de direction audio,
> traitée en ADR-0005, pas une décision de Voice-Physics.

### Implementation Guidelines

- Le **crest factor** (rapport crête/RMS) sur signal brut discrimine le percussif du
  continu — troisième brique de la grille voice-physics, sans traitement supplémentaire
- L'AEC reste souhaitable **sur la voie communication** — elle règle au passage le point larsen
- **Le VAD ne peut pas servir de garde pour économiser la FFT** : l'analyse doit tourner
  même quand le VAD dit « pas de parole », précisément parce que le chuchotement passe sous son seuil
- Gérer les buffers circulaires proprement (risque de fuite mémoire)

## Alternatives Considered

### Alternative 1: FFT côté hôte sur le flux Dissonance

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
brut, dans une assembly sans référence moteur, FMOD n'a plus de rôle à y jouer. Le DSP
maison (YIN, RMS, crest factor) était déjà écrit et testé au 2026-07-27. FMOD reste
retenu pour la **restitution** — voir ADR-0005.

### Alternative 6: Plugin DSP natif custom (C++)

Envisagé au 2026-07-04 comme « trop complexe, trop lent ». **Sans objet** : le DSP en C#
managé s'est avéré suffisant et suffisamment rapide, avec l'avantage décisif d'être
testable hors éditeur en millisecondes.

## Consequences

### Positive

- Seul le client dispose du signal brut fidèle — condition sine qua non du gameplay
- **Charge CPU de l'hôte quasi nulle** (plus de N × FFT, plus de pool FMOD)
- **Bande passante minimale** (~5 floats par joueur et par trame)
- **Supprime la dépendance bloquante à l'API Dissonance** : le client n'a besoin que de
  son propre micro ; Dissonance sort du chemin critique et redevient du transport pur
- L'hôte reste autoritaire sur la physique : l'autorité porte sur la décision de
  gameplay, pas sur la mesure
- Le format transmis épouse la grille à trois briques du GDD (volume / hauteur / forme temporelle)
- **L'analyse n'a aucune dépendance tierce** : ni moteur, ni middleware, ni licence.
  Elle compile en netstandard2.1 et se teste hors Unity en millisecondes — bénéfice
  qu'aucune solution middleware n'aurait donné

### Negative

- **Un client modifié peut mentir sur ses features.** Accepté : en coop entre amis sur
  Steam P2P, mentir n'allège que son propre objet, sans classement ni économie à truquer.
  L'hôte borne les valeurs reçues.
- La calibration devient une **donnée de session** à transmettre à l'hôte à la connexion
- Deux chaînes audio au lieu d'une : coût CPU côté client
- La capture d'analyse et le chat vocal lisent le même micro : deux consommateurs à faire coexister

### Neutral

- L'ordre des blocs a changé par rapport au schéma de 2026-06-30 : `SYS - Audio & Voix.md` est à mettre à jour

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **Contention de périphérique** : analyse et chat vocal lisent le même micro | **Moyenne** | **Élevé** | Non vérifié. À lever au POC audio, **avant tout achat de middleware vocal** (voir ADR-0005). C'est le point ouvert n°1 de cet ADR |
| Latence cumulée (analyse + réseau) trop élevée | Moyenne | Élevé | À mesurer dès le POC ; estimations du LOG non mesurées |
| Les joueurs ne parviennent pas à contrôler leur voix assez finement | Moyenne | **Élevé** | Playtests critiques. Risque de design, pas technique |
| Accessibilité : joueurs dysphoniques ou à voix atypique | Moyenne | Moyen | La normalisation par profil personnel atténue, sans annuler. À traiter en accessibilité |

## Performance Implications

| Metric | Before | Expected After | Budget |
|--------|--------|---------------|--------|
| CPU client (FFT) | n/a | <10 % par joueur à ~1024 échantillons *(estimation LOG, non mesurée)* | <1 ms/frame sur le thread principal |
| CPU hôte (analyse) | ~N × FFT *(modèle abandonné)* | **0** | — |
| Réseau | audio brut *(rejeté)* | ~5 floats × 20–30 Hz × N joueurs | négligeable |

## Migration Plan

Aucune migration de code : la capture n'est pas écrite. En revanche, **deux documents
portent encore l'ancien modèle** et doivent être corrigés :

1. `Obsedian_SUAC_FIA/02 - Systèmes/SYS - Audio & Voix.md` — l'ordre des blocs place encore Dissonance en tête de chaîne
2. Toute future rédaction s'appuyant sur les entrées LOG des 2026-06-30 et 2026-07-04 doit tenir compte de la correction du 2026-07-27

**Rollback plan** : si l'analyse ne peut pas lire un signal micro brut — contention de
périphérique insoluble, ou traitement imposé par le système — la mécanique centrale est
remise en cause. Ce n'est pas un rollback technique mais un **PIVOT de design**. D'où la
priorité absolue du POC audio, avant tout achat et avant toute conception de système en
dépendant.

## Validation Criteria

- [ ] La capture d'analyse et le chat vocal accèdent au micro simultanément, sans conflit de périphérique
- [ ] Le signal lu par l'analyse est bien brut — ni VAD, ni AGC, ni suppression de bruit en amont
- [ ] Un chuchotement produit des features exploitables (non écrasées par un seuil)
- [ ] Un claquement de langue est distingué d'un son tenu par le crest factor
- [ ] La charge CPU client mesurée est conforme à l'estimation
- [ ] La bande passante mesurée reste négligeable devant le chat vocal
- [ ] Deux joueurs fournissant le même effort vocal produisent des features comparables après normalisation

## GDD Requirements Addressed

| GDD Document | System | Requirement | How This ADR Satisfies It |
|-------------|--------|-------------|--------------------------|
| `design/gdd/game-concept.md` | Pillar 1 — Voice-Physics | « Réagissent en temps réel au volume et au pitch de la voix » | Définit la chaîne qui produit ces mesures |
| `design/gdd/game-concept.md` | Core Mechanics | « Analyse vocale en temps réel → effet physique » | Fixe où l'analyse tourne et ce qui transite |
| `design/mvp-scope.md` | Systèmes 1, 2, 6 | Analyse vocale, effet sur les objets, chat de proximité | Sépare les deux voies audio et leurs objectifs distincts |

> TR-ID stables à attribuer par `/architecture-review`.

## Related

- **ADR-0004** — Contrat de données brut/normalisé : définit `VoiceFrame`, la sortie de cette chaîne
- **ADR-0002** — Autorité physique : cet ADR **corrige** sa description initiale (l'hôte ne calcule pas la FFT)
- **ADR-0005** — Transport du chat vocal : cette décision retire Dissonance du chemin critique de l'analyse
- **ADR-0006** — Découpage en assemblies : `Voice.Core` porte l'analyse, `Voice.Capture` l'accès micro
- Source : `LOG - Décisions techniques.md`, entrées des 2026-06-30, 2026-07-04, 2026-07-05 (corrigée) et 2026-07-27
