# Session State — Active

**Dernière mise à jour**: 2026-09-03

<!-- STATUS -->
Epic: Onboarding & cadrage
Feature: Migration vers la structure template
Task: game-concept.md relu et validé — prochaine étape /map-systems
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
- [ ] `/map-systems` sur les 13 systèmes du périmètre MVP **← prochaine étape**
- [ ] `/design-system` ×13
- [ ] `/create-control-manifest`, `/architecture-review` (bootstrap tr-registry)

## Décisions clés

| Sujet | Décision |
|---|---|
| Moteur | Unity 6.3 LTS `6000.3.18f1`, URP 17.3.0, C# |
| Réseau | FishNet retenu (ADR-0001). Vérifié actif : 4.7.2R, avril 2026 |
| Physique | Autorité hôte + **couche de retour local non autoritaire** (décalage amorti). Prédire l'avertissement, jamais le verdict (ADR-0002) |
| Analyse vocale | DSP maison en C# pur — **FMOD retiré du chemin d'analyse** (ADR-0003) |
| Chat vocal | **Interface maison, backend interchangeable.** Implémentation A gratuite (Steam natif + FMOD 3D) ; Dissonance en upgrade à 175 $, différé (ADR-0005) |
| Licences | FMOD **gratuit** sous 200 k$ de revenu. Dissonance 120 $ + pont FMOD 55 $ : **non engagés, non nécessaires au MVP** |
| Périmètre MVP | « La boucle de contrat tient », 4 joueurs — voir `design/mvp-scope.md` |
| GDD canonique | `Obsedian_SUAC_FIA/GDD_Shut_Up_And_Carry_1.md` |
| Convention de langue | Titres de sections en anglais (parsés par les skills), corps en français |
| Projet Unity | `Unity/Shut_up_and_carry/` fait foi ; `SEP26` ignoré (template vierge) |
| Review mode | `lean` |

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

## Rien n'a été commité

Toutes les modifications sont dans l'arbre de travail. Aucun commit effectué.
