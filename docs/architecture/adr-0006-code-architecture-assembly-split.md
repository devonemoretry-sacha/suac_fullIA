# ADR-0006: Code Architecture — `Assets/_Project` and Assembly Split

## Status

Accepted

## Date

2026-09-03 *(formalisation ; décisions d'origine des 2026-06-30 et 2026-07-27)*

## Last Verified

2026-09-03

## Decision Makers

Utilisateur (solo dev). Formalisé depuis `Obsedian_SUAC_FIA/05 - Journal/LOG - Décisions techniques.md`.

## Summary

Au moment d'écrire le premier code du projet, il fallait fixer où vit notre code et
comment il est découpé, avant que l'habitude ne s'installe toute seule. Décision : tout
le code du jeu vit sous **`Assets/_Project/`**, découpé en assemblies par `.asmdef`,
avec `SUAC.Voice.Core` en **`noEngineReferences`** — interdiction d'accéder à UnityEngine.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Unity 6.3 LTS (`6000.3.18f1`) |
| **Domain** | Core / Scripting |
| **Knowledge Risk** | LOW — les Assembly Definitions sont une fonctionnalité Unity stable et ancienne |
| **References Consulted** | `docs/engine-reference/unity/VERSION.md`, `docs/engine-reference/unity/deprecated-apis.md` |
| **Post-Cutoff APIs Used** | Aucune |
| **Verification Required** | Aucune. Vérifié en pratique le 2026-07-27 : Core compilé en netstandard2.1 **hors Unity**, tests exécutés contre le `nunit.framework.dll` livré avec Unity `6000.3.18f1` — 41 tests verts avant même d'ouvrir l'éditeur. |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | None — décision fondatrice |
| **Enables** | ADR-0004 (la frontière brut/normalisé n'est opposable que parce que le code est découpé en assemblies), ADR-0003 (sépare analyse et accès micro) |
| **Blocks** | Aucun — déjà implémenté |
| **Ordering Note** | Cet ADR **documente du code existant**. Il formalise après coup. |

## Context

### Problem Statement

Premier code du projet. Sans convention explicite, l'arborescence se serait constituée
par accumulation, mélangeant code du jeu et assets tiers, et rendant les dépendances
implicites — donc invérifiables.

### Current State

**Implémenté.** `Unity/Shut_up_and_carry/Assets/_Project/` contient `Runtime/Voice.Core/`
(8 fichiers) et `Tests/EditMode/` (5 fichiers), pour ~1989 lignes de C#.

### Constraints

- Projet solo : la structure doit être tenable sans revue d'équipe
- L'analyse du signal doit être testable sans micro et sans éditeur

### Requirements

- Séparer d'un coup d'œil le code du jeu des assets tiers
- Rendre les dépendances vérifiables par le compilateur, pas par la discipline
- Permettre des tests rapides et déterministes sur le traitement du signal

## Decision

### Architecture

Tout le code écrit pour le jeu vit sous **`Assets/_Project/`**, découpé en assemblies
par fichier `.asmdef` :

| Assembly | Rôle | Contrainte |
|---|---|---|
| `SUAC.Voice.Core` | Contrat de données, analyse du signal, calibration | **`noEngineReferences: true`** — interdiction d'accéder à UnityEngine |
| `SUAC.Voice.Capture` | Accès micro et orchestration | Dépend de Core |
| `SUAC.Gameplay` | Objets réactifs à la voix | — |
| `SUAC.Tests.EditMode` | Tests unitaires | Dépend de Core |

**Namespace racine** : `SUAC`.
**Convention de langue du code** : identifiants en **anglais**, commentaires en **français**.

### Implementation Guidelines

- Architecturer par **blocs élémentaires découplés** via interfaces/events, chacun avec
  une responsabilité unique et un contrat clair (entrées/sorties) — décision du 2026-06-30
- **Si du code de Core se met à avoir besoin d'Unity, il se déplace dans `Capture`**
  plutôt que d'assouplir la règle `noEngineReferences`
- Les valeurs de réglage ne peuvent pas être des ScriptableObject dans Core : elles
  passent par **constructeur**, et le ScriptableObject qui les alimente vit dans `Capture`

## Alternatives Considered

### Alternative 1: Tout dans un script « AudioManager »

Code spaghetti, impossible à tester unitairement. **Rejetée.**

### Alternative 2: Pas de séparation en assemblies

Couplage fort, rigide, dépendances implicites. **Rejetée** : le compilateur ne peut
alors rien vérifier, et la frontière brut/normalisé d'ADR-0004 deviendrait une simple
convention documentaire — donc caduque à six mois.

### Alternative 3: Code du jeu mêlé aux assets tiers à la racine d'`Assets/`

Le défaut Unity. **Rejetée** : impossible de distinguer d'un coup d'œil ce qui est à nous.

## Consequences

### Positive

- Séparation immédiate entre notre code et les assets tiers
- **Compilation incrémentale** : modifier un fichier ne recompile que son assembly
- Les dépendances deviennent explicites et **vérifiées par le compilateur**, pas par la discipline
- `noEngineReferences` sur Core rend le traitement du signal **testable sans micro, sans
  éditeur, en millisecondes**, et déterministe
- **Bénéfice constaté le jour même** : 41 tests verts avant même d'ouvrir l'éditeur Unity
- Chaque bloc est réutilisable et remplaçable (« swap FFT v2 sans toucher capture ou effet »)

### Negative

- Plus de fichiers, et une arborescence à respecter
- Contrainte réelle : la règle `noEngineReferences` **ne se négocie pas** — c'est elle qui
  porte tout le bénéfice de testabilité
- Dépendances inter-scripts via interfaces : à documenter
- Risque de sur-ingénierie si la complexité ne suit pas — mitigé par une architecture légère au départ

### Neutral

- Convention de langue mixte (identifiants anglais, commentaires français) — cohérente
  avec la convention retenue pour la documentation (titres anglais, corps français)

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Assouplissement de `noEngineReferences` « pour dépanner » | Moyenne | Élevé | La règle est écrite ici et dans le code. Le remède est de déplacer le code vers `Capture`, jamais d'ouvrir Core |
| Sur-ingénierie du découpage en blocs | Faible | Faible | Architecture légère au départ, blocs ajoutés au besoin |
| Le sort de `Assets/_Project/` reste ouvert | **Actuelle** | Moyen | **Arbitrage non tranché** : rapatrier le code existant tel quel ou le réécrire — voir `BACKLOG - Points ouverts.md`. Cet ADR fixe la structure, pas le sort du code déjà écrit |

## Performance Implications

| Metric | Before | Expected After | Budget |
|--------|--------|---------------|--------|
| Temps de compilation incrémentale | monolithique | recompilation limitée à l'assembly modifiée | — |
| Temps d'exécution des tests Core | n/a | millisecondes, hors éditeur | — |

Sans incidence sur les performances runtime : c'est une décision de structure.

## Migration Plan

Déjà implémenté pour `Voice.Core` et `Tests.EditMode`. `Voice.Capture` et `Gameplay`
sont déclarés mais pas encore écrits.

**Point ouvert lié** : la reprise du projet Unity (décision du 2026-09-02) laisse en
suspens le sort de `Assets/_Project/` — rapatrier tel quel ou réécrire. Cet ADR ne le
tranche pas ; il fixe la structure cible dans les deux cas.

**Rollback plan** : sans objet — revenir à un projet sans assemblies annulerait la
testabilité de Core et rendrait ADR-0004 inapplicable.

## Validation Criteria

- [x] Core compile en netstandard2.1 hors Unity
- [x] Les tests de Core s'exécutent sans éditeur ni micro — 41 tests verts au 2026-07-27
- [x] `noEngineReferences: true` est effectif sur `SUAC.Voice.Core`
- [ ] `Voice.Capture` et `Gameplay` respectent le découpage une fois écrits
- [ ] Aucun type d'UnityEngine n'apparaît dans Core à la revue

## GDD Requirements Addressed

**Foundational — no GDD requirement.**

Décision de structure de code sans exigence de design directe. Enables : elle rend
possible ADR-0004 (frontière brut/normalisé opposable à la compilation), qui lui répond
à l'exigence d'équité vocale, et conditionne l'organisation de tous les systèmes du
périmètre MVP.

## Related

- **ADR-0004** — Frontière brut/normalisé : n'est opposable que grâce à ce découpage
- **ADR-0003** — Pipeline d'analyse : `Voice.Core` porte l'analyse, `Voice.Capture` l'accès micro
- Code : `Unity/Shut_up_and_carry/Assets/_Project/`
- Source : `LOG - Décisions techniques.md`, entrées des 2026-06-30 et 2026-07-27
- Point ouvert : `BACKLOG - Points ouverts.md` — « Rapatrier ou réécrire `Assets/_Project/` »
