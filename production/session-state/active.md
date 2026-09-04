# Session State — Active

**Dernière mise à jour**: 2026-09-03

<!-- STATUS -->
Epic: Onboarding & cadrage
Feature: Migration vers la structure template
Task: GDD Analyse vocale — Overview, Player Fantasy, Detailed Design écrites — Formulas à suivre
<!-- /STATUS -->

---

## Tâche en cours

Onboarding d'un projet existant (*Shut Up & Carry !*) dans le template Claude Code
Game Studios. Le travail réel — GDD Obsidian et code Unity — vit hors de la
structure attendue. L'objectif de la séquence en cours est de le rendre lisible
par les skills du template.

## Progression

- [x] `/start` — parcours D (travail existant), stage et review-mode posés
- [x] `/setup-engine` — Unity 6.3 LTS (`6000.3.18f1`) épinglé, docs de référence corrigées
- [x] `/project-stage-detect` — rapport écrit, stade confirmé *Systems Design* (CONCERNS)
- [x] Cadrage du périmètre MVP — figé dans `design/mvp-scope.md`
- [x] `/adopt` — audit fait, plan écrit dans `docs/adoption-plan-2026-09-03.md`
- [x] `design/gdd/game-concept.md` — extrait de PARTIE 1 du GDD canonique
- [x] 6 ADR formalisées depuis `LOG - Décisions techniques.md` (ADR-0001 à ADR-0006, toutes Accepted)
- [x] **Relecture collaborative de `game-concept.md`** — arbitrages MDA/PENS/Bartle actés, 14 points différés avec déclencheur
- [x] `/map-systems` — index écrit : 14 entrées de périmètre → 19 systèmes, 4 couches
- [x] Revue directeurs de la décomposition (TD/PR/CD) — corrections appliquées
- [x] ADR-0003 amendé — l'AEC remonte en amont de la fourche
- [x] `/gate-check` Technical Setup → Pre-Production, passée en **inventaire** — FAIL attendu, rapport dans `production/gate-checks/`
- [~] `/create-architecture` — **BLOQUÉ volontairement** : la skill exige une baseline TR extraite des GDD, or il n'y en a aucun. Reprise quand les premiers GDD existeront.
- [~] GDD Analyse vocale — **en pause**, Overview écrite, 12 sections restantes. Reprise avec `/design-system voice-analysis`
- [x] `/art-bible` — sections 1-3 écrites, **cadre provisoire assumé**. Section 4 différée : la direction visuelle évoluera avec un graphiste, et elle ne lève aucun risque de gameplay
- [ ] `/prototype` — étape sautée, toujours non rattrapée : la Voice-Physics n'a jamais été validée comme amusante
- [ ] POC audio — lève 3 questions d'un coup : contention de périphérique, non-dégradation par l'AEC, cadence des features
- [ ] `/design-system` ×18
- [ ] Reprendre `/create-architecture` une fois des GDD écrits
- [ ] `/test-setup` et `/ux-design` — parallélisables, ne dépendent d'aucun GDD
- [ ] `/create-control-manifest`, `/architecture-review` (bootstrap tr-registry)

## Décisions clés

| Sujet | Décision |
|---|---|
| Moteur | Unity 6.3 LTS `6000.3.18f1`, URP 17.3.0, C# |
| Réseau | FishNet retenu (ADR-0001). Vérifié actif : 4.7.2R, avril 2026 |
| Physique | Autorité hôte + **couche de retour local non autoritaire** (décalage amorti). Prédire l'avertissement, jamais le verdict (ADR-0002) |
| Analyse vocale | DSP maison en C# pur — **FMOD retiré du chemin d'analyse** (ADR-0003) |
| AEC | **En amont de la fourche**, protège analyse et communication. Reclassée de « confort » à **correction de gameplay** (ADR-0003 amendé le 2026-09-03). Sans AEC → **casque obligatoire**, prérequis de validité de la mesure |
| Chat vocal | **Interface maison, backend interchangeable.** Implémentation A gratuite (Steam natif + FMOD 3D) ; Dissonance en upgrade à 175 $, différé (ADR-0005) |
| Licences | FMOD **gratuit** sous 200 k$ de revenu. Dissonance 120 $ + pont FMOD 55 $ : **non engagés, non nécessaires au MVP** |
| Périmètre MVP | « La boucle de contrat tient », 4 joueurs — 14 entrées dans `design/mvp-scope.md`, décomposées en **19 systèmes** dans `design/gdd/systems-index.md` |
| Découpage en couches | Une couche = **ordre de conception**, pas dépendances de compilation. Foundation = aucune dépendance de conception envers un autre système |
| Audio d'entrée | **Propriétaire unique du micro**, fourche brut→analyse / traité→chat. Résout le conflit de ressource par conception (ADR-0003 : « deux voies sur le même micro ») |
| Canaux vocaux morts/vivants | **Routage codé maison** dans l'interface de chat vocal. Steam natif n'a pas de rooms ; on ne devance pas l'achat de Dissonance pour autant |
| GDD canonique | `Obsedian_SUAC_FIA/GDD_Shut_Up_And_Carry_1.md` |
| Convention de langue | Titres de sections en anglais (parsés par les skills), corps en français |
| Projet Unity | `Unity/Shut_up_and_carry/` fait foi ; `SEP26` ignoré (template vierge) |
| Review mode | **`full`** — bascule le 2026-09-03. Spécialistes convoqués à chaque section de GDD, CD-GDD-ALIGN par GDD, art-director actif. Coût en tokens nettement supérieur, assumé. |

## Fichiers créés ou modifiés cette session

| Fichier | Objet |
|---|---|
| `CLAUDE.md` | Stack technique renseignée ; import moteur repointé vers Unity |
| `.claude/docs/technical-preferences.md` | Moteur, input/plateforme, conventions, budgets perf, tests, routage specialists |
| `docs/engine-reference/unity/VERSION.md` | Réécrit : patch exact, timeline corrigée, risque MEDIUM, baseline packages |
| `docs/engine-reference/unity/breaking-changes.md` | Ajout des changements vérifiés 6.2 → 6.3 |
| `docs/engine-reference/unity/deprecated-apis.md` | Ajout des dépréciations 6.3 |
| `docs/engine-reference/{godot,unreal}/` | Supprimés (moteurs non utilisés) |
| `.claude/agents/unity-*.md` (×5) | Section Version Awareness ajoutée |
| `production/stage.txt` | `Systems Design` |
| `production/review-mode.txt` | `lean` |
| `production/project-stage-report.md` | Rapport d'analyse de stade |
| `design/mvp-scope.md` | **Périmètre MVP arrêté** |
| `docs/adoption-plan-2026-09-03.md` | Plan de migration |
| `docs/architecture/adr-0001..0006` | 6 ADR formalisées depuis le LOG |
| `design/gdd/game-concept.md` | Concept au format template, relu et arbitré |
| `production/session-state/active.md` | Ce fichier |
| `Obsedian_SUAC_FIA/GDD - *.md` (×3) | Supprimés (0 octet) |

## Questions ouvertes

1. **POC audio — contention de périphérique micro.** L'analyse et le chat vocal lisent
   le même micro. Non vérifié. **Bloquant** : si l'analyse ne peut pas lire un signal
   brut pendant que le chat vocal tourne, c'est un pivot de design, pas un bug (ADR-0003).
2. **FishyFacepunch** — compatibilité avec Unity 6.3 non confirmée (FishNet lui-même l'est).
3. **Cadence des features à 20–30 Hz** — suffisante pour dater un claquement de langue
   (transitoire 5–20 ms) ? Compte pour le Vase de l'Écho. À trancher au POC audio.
4. **Convention de langue** — appliquée à tous les documents de cette session,
   pas encore confirmée explicitement par l'utilisateur.

*(Résolues cette session : autorité physique partagée → ADR-0002 (hôte seul + couche de
retour local) ; transport de la voix → ADR-0005 (interface maison, implémentation A
gratuite). Le périmètre MVP ne comporte plus d'hypothèse ouverte.)*

## Suivi git

Dépôt : https://github.com/devonemoretry-sacha/suac_fullIA — branche `main`.
Commits au fil des étapes.

| Commit | Étape |
|---|---|
| `c8d1e9c` | Initial — template + projet + artefacts d'onboarding |
| `79900d4` | `/map-systems` — 19 systèmes, 4 couches |
| `5b4d817` | Revue directeurs + palier « Bac à sable Voice-Physics » |
| `b787542` | ADR-0003 amendé — AEC en amont de la fourche |
| `fd649a0` | Inventaire `/gate-check` Technical Setup → Pre-Production |
| `2a40531` | Contraintes moteur consignées, `/create-architecture` en pause |
