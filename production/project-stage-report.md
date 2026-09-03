# Project Stage Analysis Report

**Generated**: 2026-09-03
**Stage**: Systems Design
**Stage Confidence**: CONCERNS — signaux contradictoires (voir *Stage Classification Rationale*)
**Analysis Scope**: Full project

---

## Executive Summary

*Shut Up & Carry !* possède un **concept solide et profondément travaillé** (GDD de
1147 lignes, piliers clairs, mécanique centrale originale et défendue par des
arguments de design opposables) ainsi qu'un **noyau technique déjà écrit et testé**
(`Voice.Core`, ~2000 lignes de C#, 5 tests EditMode). C'est nettement au-dessus de
ce qu'on trouve habituellement à ce stade.

Le problème n'est pas la qualité du travail, c'est sa **localisation et son format**.
La totalité des artefacts vit hors de la structure attendue par le template :
les documents de design sont dans un vault Obsidian (`Obsedian_SUAC_FIA/`), le code
dans `Unity/`, et les répertoires `design/`, `src/`, `tests/`, `docs/architecture/`
du template sont vides. Aucune skill du template ne peut donc lire, valider ou
faire progresser ce travail en l'état.

Second écart, plus structurel : **le code a pris de l'avance sur le design et sur
l'architecture**. `Voice.Core` implémente déjà l'analyse DSP (loudness, pitch,
enveloppe) alors que la décomposition en systèmes est incomplète et qu'aucun ADR
n'existe. C'est légitime pour un spike de mécanique centrale — valider que la
Voice-Physics est faisable avant de tout concevoir autour — mais cela signifie
que ces décisions devront être **rétro-documentées**, pas conçues.

**Current Focus**: décomposition des systèmes + validation de la mécanique Voice-Physics
**Blocking Issues**: aucun artefact lisible par le template ; aucun ADR ; réseau non formalisé
**Estimated Time to Next Stage**: 1 à 2 sessions de migration (`/adopt`) + 3 à 5 ADR

---

## Completeness Overview

### Design Documentation
- **Status**: 45% complet
- **Files Found**: 13 documents markdown, **tous hors template** (`Obsedian_SUAC_FIA/`)
  - GDD : 2 fichiers réels (`GDD_Shut_Up_And_Carry.md`, `GDD_Shut_Up_And_Carry_1.md`)
  - GDD vides : 3 fichiers à 0 ligne (`GDD - Direction Artistique`, `- Game Design`, `- Level Design`)
  - Systèmes : 3 documents (`SYS - Audio & Voix`, `SYS - Gameplay Physique`, `SYS - Réseau`)
  - Tech : 1 note (`TECH - FishNet`)
  - Journal : `LOG - Décisions techniques` (52 Ko), `BACKLOG - Points ouverts` (14 Ko), `SESSIONS - Journal de travail`
  - `design/gdd/` du template : **0 fichier**
- **Key Gaps**:
  - [ ] Aucun `game-concept.md` au format template — bloque `/design-review`, `/gate-check`
  - [ ] Aucun `systems-index.md` — bloque `/create-epics`, empêche de savoir ce qui reste à concevoir
  - [ ] Les 3 GDD vides créent une fausse impression de couverture (art, level design, game design)
  - [ ] Aucune section « Acceptance Criteria » ni « Tuning Knobs » nulle part — rien n'est testable en l'état
  - [ ] Sections 3.2 à 3.6 du GDD explicitement marquées *(à rédiger)* / *(à définir)* — tout le volet technique

### Source Code
- **Status**: 15% complet (rapporté au périmètre MVP décrit dans le GDD)
- **Files Found**: 13 fichiers C# (~1989 lignes) — **tous hors template**, dans `Unity/Shut_up_and_carry/Assets/_Project/`
- **Major Systems Identified**:
  - ✅ `Voice.Core` (`Runtime/Voice.Core/`) — analyse DSP : `Decimator`, `EnvelopeFollower`, `LoudnessMeter`, `PitchDetector`, `RawLoudness`, `RawPitch`
  - ✅ Contrat de données (`Runtime/Voice.Core/Contract/VoiceFrame.cs`) — frontière propre entre analyse et consommateurs
  - ❌ Gameplay physique (portage collectif, points d'ancrage, ragdoll) — non commencé
  - ❌ Réseau (2 à 8 joueurs, réplication, autorité) — non commencé
  - ❌ IA des habitants (perception sonore, point d'intérêt unique) — non commencé
  - ❌ UI / HUD, boucle de contrat, économie — non commencés
- **Notes**:
  - L'organisation en assembly nommée (`SUAC.Voice.Analysis`) avec un contrat isolé est
    une **bonne décision d'architecture prise implicitement** — elle mérite un ADR.
  - Second projet Unity `Shut_Up_And_Carry_SEP26` (2 scripts) : statut à clarifier.

### Architecture Documentation
- **Status**: 5% complet
- **ADRs Found**: **0** dans `docs/architecture/` (seul `tr-registry.yaml`, vide de contenu projet)
- **Coverage**:
  - ⚠️ Séparation `Voice.Core` / consommateurs — implémentée, non documentée
  - ⚠️ Analyse vocale locale + réplication de valeurs — implicite dans `VoiceFrame`, non documentée
  - ⚠️ Choix réseau FishNet — évalué dans `TECH - FishNet.md`, non formalisé, **pas dans le manifest**
  - ❌ Modèle d'autorité pour la physique partagée (objet porté par 2-8 joueurs) — ni décidé ni documenté
  - ❌ Transport de la voix (Steam Voice / Dissonance / Vivox) — ni décidé ni documenté
  - ❌ Normalisation par joueur (voix graves/aiguës, micros hétérogènes) — décrit en §2.4 du GDD, aucune décision technique
- **Key Gaps**:
  - [ ] **ADR réseau** — bloque toute implémentation multijoueur, donc la majorité du MVP
  - [ ] **ADR autorité physique** — c'est le risque technique n°1 du projet (voir *Critical Gaps*)
  - [ ] **ADR pipeline voix** — sépare données de gameplay (petites, répliquées) et audio (lourd, transporté)

### Production Management
- **Status**: 10% complet
- **Found**:
  - `production/stage.txt` : `Systems Design` ✅
  - `production/review-mode.txt` : `lean` ✅
  - Sprint plans : **0**
  - Milestones : **0**
  - Roadmap : absente
  - Suivi externe (Jira / Trello / GitHub Projects) : **aucun** (confirmé par l'utilisateur)
- **Key Gaps**:
  - [ ] Aucun découpage en lots de travail — `BACKLOG - Points ouverts.md` (14 Ko) tient ce rôle de façon informelle
  - [ ] Aucune définition de MVP arrêtée — le GDD décrit beaucoup plus que ce qui sera construit d'abord

### Testing
- **Status**: 35% (estimation, sur le périmètre écrit uniquement)
- **Test Files**: 5 fichiers EditMode — **hors template**, dans `Assets/_Project/Tests/EditMode/`
  - `DecimatorTests`, `EnvelopeFollowerTests`, `LoudnessMeterTests`, `PitchDetectorTests`, `PublicSurfaceTests`
- **Coverage by System**:
  - `Voice.Core` : bonne couverture apparente — chaque classe d'analyse a son test, plus un test de surface publique
  - Tout le reste : 0% (rien d'autre n'est écrit)
- **Notes**:
  - `PublicSurfaceTests` est un choix mûr : verrouiller l'API publique d'un assembly cœur.
  - Aucun test PlayMode, donc rien qui valide l'intégration Unity (capture micro réelle, latence, threading).
- **Key Gaps**:
  - [ ] Aucun test d'intégration sur la capture micro réelle (device, permissions, latence)
  - [ ] Aucun harnais de test réseau — à prévoir avant la première ligne de netcode

### Prototypes
- **Active Prototypes**: 0 dans `prototypes/`
- **Notes**: aucun prototype formel. `Voice.Core` joue de fait le rôle de spike technique
  sur la mécanique centrale, mais sans rapport de prototype ni verdict PROCEED/PIVOT/KILL.
- **Key Gaps**:
  - [ ] La Voice-Physics n'a **jamais été validée en jeu** — l'analyse DSP fonctionne (tests unitaires),
        mais « est-ce que c'est amusant avec 4 joueurs qui crient » n'est pas répondu

---

## Stage Classification Rationale

**Why Systems Design?**

Le projet remplit les critères d'entrée du stade (concept de jeu complet et validé)
mais pas ceux de sortie (décomposition systèmes achevée, index des systèmes écrit).
L'utilisateur a confirmé explicitement que la liste des systèmes **n'est pas complète**
et reste en cours d'élaboration.

**Indicators for this stage**:
- Concept de jeu détaillé et stable (piliers, boucle, 3C, bestiaire, mobilier, économie)
- Moteur configuré et épinglé (Unity 6.3 LTS `6000.3.18f1`)
- Décomposition systèmes **partielle** : 3 documents systèmes sur un périmètre MVP non arrêté
- Aucun document d'architecture, aucun ADR

**Pourquoi CONCERNS et non PASS** :
Deux signaux contredisent le stade. D'une part `Voice.Core` (2000 lignes testées) est
un artefact de stade Production apparu pendant le Systems Design. D'autre part le GDD
contient une PARTIE 3 « Document technique » dont toutes les sections sont vides —
le document mélange donc deux stades dans un seul fichier. Ce n'est pas un défaut en
soi, mais cela rend la détection automatique de stade peu fiable tant que la migration
n'a pas eu lieu.

**Next stage requirements** (Systems Design → Technical Setup) :
- [ ] Périmètre MVP arrêté : quels systèmes sont dans la première version jouable
- [ ] `design/systems-index.md` écrit, avec dépendances et ordre de conception
- [ ] Un GDD par système MVP, au format à 8 sections
- [ ] `/review-all-gdds` puis `/gate-check` passés

---

## Gaps Identified

### Critical Gaps (block progress)

1. **Aucun artefact lisible par le template**
   - **Impact**: aucune skill (`/design-review`, `/gate-check`, `/create-epics`,
     `/dev-story`) ne peut fonctionner. Le template est, en l'état, un dossier vide
     posé à côté du vrai projet.
   - **Décision utilisateur**: refonte du GDD Obsidian selon les templates jugés pertinents ✅
   - **Suggested Action**: `/adopt` pour l'audit de conformité, puis migration guidée.

2. **Modèle d'autorité pour la physique partagée — non décidé**
   - **Impact**: c'est le **risque technique n°1**. Le GDD (§2.4) décrit des objets
     à plusieurs points d'ancrage portés par 2 à 8 joueurs, avec transfert d'inertie,
     secousses propagées au porteur et ragdoll collectif. La physique répliquée à
     propriétaire partagé est un des problèmes les plus difficiles du netcode. Aucune
     bibliothèque ne le résout à ta place — c'est une décision d'architecture.
   - **Question ouverte**: physique autoritative serveur avec prédiction client, ou
     propriétaire unique par objet avec lissage chez les autres ?
   - **Suggested Action**: `/architecture-decision` dédié, **avant** d'écrire du netcode.
     À valider par un prototype ciblé (un canapé, deux joueurs, une connexion dégradée).

3. ~~**Périmètre MVP non arrêté**~~ — **RÉSOLU le 2026-09-03**
   - **Impact initial**: le GDD décrit un jeu complet (bestiaire multiple, économie,
     déployables, progression, débriefing). Sans coupe explicite, `/create-epics` aurait
     produit un backlog ingérable.
   - **Résolution**: périmètre arrêté et figé dans `design/mvp-scope.md`.
     Objectif « la boucle de contrat tient », 4 joueurs, 13 systèmes IN, 8 reports
     explicites. Deux hypothèses restent à confirmer (appartement unique fait main,
     résolution de fin minimale).

### Important Gaps (affect quality/velocity)

4. **Aucun ADR alors que des décisions sont déjà prises**
   - **Impact**: `Voice.Core`, sa frontière `VoiceFrame`, l'assembly isolée, le choix
     FishNet — quatre décisions réelles, zéro trace exploitable. `LOG - Décisions
     techniques.md` (52 Ko) contient probablement la matière, mais dans un format que
     rien ne peut vérifier ni relier au code.
   - **Suggested Action**: extraire le LOG en ADR formels (rétro-documentation).

5. **Voice-Physics jamais validée en jeu**
   - **Impact**: l'analyse DSP est testée unitairement, mais le pari central du jeu —
     « moduler sa voix sous la panique est amusant à 4 » — n'a aucune preuve. Concevoir
     tous les systèmes autour d'une mécanique non validée est le risque de conception n°1.
   - **Suggested Action**: `/prototype` ciblé, verdict PROCEED/PIVOT/KILL, avant d'écrire
     les GDD système.

6. **Trois fichiers GDD vides**
   - **Impact**: `GDD - Direction Artistique`, `- Game Design`, `- Level Design` sont à
     0 ligne. Ils suggèrent une couverture qui n'existe pas et fausseront tout audit.
   - **Suggested Action**: supprimer, ou remplacer par les documents template correspondants.

7. **Second projet Unity au statut indéterminé**
   - **Impact**: `Unity/Shut_Up_And_Carry_SEP26/` (2 scripts) coexiste avec le projet
     principal (13 scripts). Ambiguïté sur la source de vérité.
   - **Question**: repartir de zéro abandonné, ou bac à sable volontaire ?

### Nice-to-Have Gaps

8. **Aucun suivi de production**
   - **Impact**: confirmé sans outil externe. `BACKLOG - Points ouverts.md` fait office
     de backlog informel. Acceptable en solo, à formaliser avant la première vraie sprint.
   - **Suggested Action**: `/sprint-plan` une fois le périmètre MVP arrêté.

9. **Aucun test PlayMode**
   - **Impact**: rien ne valide la capture micro réelle (device, permissions, latence,
     threading). Or c'est le chemin critique du jeu.

---

## Decisions Recorded This Session

| Sujet | Décision | Source |
|---|---|---|
| GDD canonique | `GDD_Shut_Up_And_Carry_1.md` fait foi (+81 lignes, −11 vs l'autre ; écart concentré sur §2.5 Bestiaire) | Utilisateur |
| Format GDD | Refonte selon les templates du dépôt | Utilisateur |
| Convention de langue | Titres de sections en anglais (parsés par les skills), corps de texte en français | Recommandation, à confirmer |
| Réseau | FishNet retenu | Utilisateur, confirmé par analyse |
| **Périmètre MVP** | **Arrêté — voir `design/mvp-scope.md`** : objectif « la boucle de contrat tient », 4 joueurs, 2-3 types de mobilier, 1 habitant, chat de proximité inclus ; communication non-verbale et économie reportées | Utilisateur |
| Fichiers GDD vides | `GDD - Direction Artistique.md`, `GDD - Game Design.md`, `GDD - Level Design.md` (0 octet) supprimés | Utilisateur |
| Projet Unity canonique | `Unity/Shut_up_and_carry/` fait foi. `Shut_Up_And_Carry_SEP26/` est un template URP vierge — ignoré, non supprimé | Décision assistant, validée |
| Suivi de production | Aucun outil externe | Utilisateur |

---

## Recommended Next Steps

### Immediate Priority
1. **`/adopt`** — audit de conformité du vault Obsidian et de `Voice.Core`, plan de
   migration numéroté. Rien d'autre ne débloque autant.
   - Effort : M

2. **Cadrage du périmètre MVP** — arrêter ce qui est dans la première version jouable.
   Sans cela, la migration produira des documents pour des systèmes qui ne seront pas construits.
   - Effort : S

### Short-Term
3. **`/architecture-decision` — autorité physique partagée** — le risque n°1, à trancher
   avant toute ligne de netcode.
   - Effort : M

4. **`/architecture-decision` — FishNet + transport voix** — deux ADR distincts :
   le netcode gameplay et le transport audio ne sont pas le même problème.
   - Effort : M

5. **`/prototype`** — valider la Voice-Physics en conditions réelles (verdict PROCEED/PIVOT/KILL).
   - Effort : M

### Medium-Term
6. **`/map-systems`** puis **`/design-system`** par système MVP — une fois le périmètre arrêté.
7. **`/create-architecture`** — document maître + liste des ADR requis.
8. **`/sprint-plan`** — première sprint réelle.

---

## Follow-Up Skills to Run

- `/adopt` — conformité de format des artefacts existants **(prioritaire)**
- `/architecture-decision` — autorité physique, FishNet, transport voix, frontière `Voice.Core`
- `/prototype` — validation de la mécanique centrale
- `/map-systems` — décomposition, après cadrage MVP
- `/reverse-document architecture Unity/Shut_up_and_carry/Assets/_Project` — rétro-documenter `Voice.Core`

---

## Appendix: File Counts by Directory

```
TEMPLATE (vide)
  design/gdd/            0 fichiers
  design/narrative/      0 fichiers
  design/levels/         0 fichiers
  src/                   0 fichiers (.gitkeep seul)
  docs/architecture/     0 ADR (tr-registry.yaml seul)
  production/sprints/    0 plans
  production/milestones/ 0 definitions
  tests/                 0 fichiers
  prototypes/            0 repertoires

REEL (hors template)
  Obsedian_SUAC_FIA/                     13 fichiers .md
    - GDD (reels)                     2  (1077 + 1147 lignes)
    - GDD (vides)                     3  (0 ligne)
    - 02 - Systemes/                  3
    - 04 - Tech/                      1
    - 05 - Journal/                   3  (~82 Ko)

  Unity/Shut_up_and_carry/           projet principal
    - Assets/_Project/               13 fichiers .cs (~1989 lignes)
        - Runtime/Voice.Core/         8
        - Tests/EditMode/             5

  Unity/Shut_Up_And_Carry_SEP26/      2 fichiers .cs (statut indetermine)
```

---

**End of Report**

*Generated by `/project-stage-detect` skill*
