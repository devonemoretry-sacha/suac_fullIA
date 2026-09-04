# Systems Index: Shut Up & Carry !

> **Status**: Approved
> **Created**: 2026-09-03
> **Last Updated**: 2026-09-03
> **Source Concept**: `design/gdd/game-concept.md`
> **Scope Authority**: `design/mvp-scope.md`

> Titres de sections en anglais (lus par les skills), corps en français.

---

## Overview

Décomposition du périmètre MVP en systèmes concevables. Le périmètre lui-même est
arrêté et daté dans `design/mvp-scope.md` — cet index ne le rouvre pas, il le
décompose.

La décomposition part des **14 entrées explicites** du périmètre et fait apparaître
**5 systèmes implicites** que ces entrées ne nommaient pas mais impliquent
structurellement, pour un total de **19 systèmes**. Tous sont en tier **MVP** :
la question des priorités se réduit donc à l'**ordre de conception**.

**Principe de découpage en couches retenu** : une couche traduit *ce qui doit être
spécifié avant quoi*, pas les flèches de compilation ni le flux de données à
l'exécution. **Foundation = aucune dépendance de conception envers un autre système
de jeu.** Cette distinction n'est pas cosmétique — l'appliquer a fait remonter deux
systèmes d'une couche et en a fait descendre un autre (voir *Revision History*).

---

## Systems Enumeration

| # | System Name | Category | Priority | Status | Design Doc | Depends On |
|---|-------------|----------|----------|--------|------------|------------|
| 1 | Analyse vocale (`Voice.Core`) | Audio | MVP | **Implemented** *(GDD manquant)* | — | — |
| 2 | Audio d'entrée *(inféré)* | Audio | MVP | Not Started | — | 1 |
| 3 | Propagation du son *(inféré)* | Gameplay | MVP | Not Started | — | 1 |
| 4 | Restitution spatialisée *(inféré)* | Audio | MVP | Not Started | — | — |
| 5 | Réseau | Core | MVP | Not Started | — | — |
| 6 | Calibration vocale | Audio | MVP | Not Started | — | 1, 2 |
| 7 | 3C — caméra, contrôles, personnage | Core | MVP | Not Started | — | 5 |
| 8 | Session / lobby | Core | MVP | Not Started | — | 5 |
| 9 | Portage d'objets | Gameplay | MVP | Not Started | — | 5, 7 |
| 10 | Appartement | Level | MVP | Not Started | — | 7, 9 |
| 11 | Effet voix → objets | Gameplay | MVP | Not Started | — | 3, 9 |
| 12 | Couche de retour local *(inféré)* | Gameplay | MVP | Not Started | — | 7, 11 |
| 13 | Mobilier réactif (2-3 types) | Gameplay | MVP | Not Started | — | 3, 11 |
| 14 | Chat vocal de proximité | Audio | MVP | Not Started | — | 2, 4, 5 |
| 15 | Habitant | Gameplay | MVP | Not Started | — | 3, 5, 10 |
| 16 | Boucle de contrat | Gameplay | MVP | Not Started | — | 8, 9, 10, 15 |
| 17 | Mort + espace des morts | Gameplay | MVP | Not Started | — | 14, 15, 16 |
| 18 | Résolution de fin de contrat | UI | MVP | Not Started | — | 16 |
| 19 | UI diégétique minimale *(inféré)* | UI | MVP | Not Started | — | 1, 6, 18 |

*(inféré)* = système non nommé dans `mvp-scope.md`, révélé par la décomposition.

**Correspondance avec `mvp-scope.md`** : les entrées 1 à 14 du périmètre se
retrouvent ici sous les numéros 1, 11, 9, 13, 15, 14, 16, 17, 5, 7, 10, 18, 6 et 8.
Les cinq systèmes inférés (2, 3, 4, 12, 19) sont des décompositions, pas des ajouts
de périmètre — sauf la **session/lobby**, ajoutée au périmètre le 2026-09-03 comme
entrée 14 de `mvp-scope.md`.

---

## Categories

| Category | Systems |
|----------|---------|
| **Core** | Réseau, 3C, Session/lobby |
| **Gameplay** | Propagation du son, Portage, Effet voix→objets, Retour local, Mobilier, Habitant, Boucle de contrat, Mort |
| **Audio** | Analyse vocale, Audio d'entrée, Restitution spatialisée, Calibration, Chat vocal |
| **Level** | Appartement |
| **UI** | Résolution de fin, UI diégétique |

Catégories non utilisées : Progression, Economy, Persistence, Narrative, Meta —
toutes hors périmètre MVP (voir `design/mvp-scope.md`, *Out of Scope*).

---

## Priority Tiers

**Les 19 systèmes sont en tier MVP.** Le périmètre ayant été arrêté avant la
décomposition, aucun système ici n'appartient à un tier ultérieur. Les éléments
Vertical Slice / Alpha / Full Vision existent comme vision dans le GDD source mais
**ne sont pas décomposés** — c'est une conséquence explicite de `mvp-scope.md`.

| Tier | Systèmes | Statut |
|------|----------|--------|
| **MVP** | les 19 ci-dessus | décomposés |
| **Vertical Slice** | — | *(différé → après verdict du MVP)* |
| **Alpha** | — | *(différé)* |
| **Full Vision** | bestiaire étendu, économie, déployables, progression, génération procédurale, 6-8 joueurs, communication non-verbale, débriefing détaillé | **non décomposés, volontairement** |

---

## Dependency Map

### Foundation Layer (aucune dépendance de conception)

1. **Analyse vocale** ✅ — implémentée et testée (41 tests hors éditeur). Pure DSP.
2. **Audio d'entrée** — possède le périphérique micro et le **fourche** :
   voie brute → analyse, voie traitée → chat vocal. Conforme à ADR-0003
   (« deux voies distinctes **sur le même micro** »). Un seul lecteur du device.
3. **Propagation du son** — modèle mathématique pur : distance, atténuation, cumul
   multi-joueurs. Spécifiable et testable sans réseau, sans Unity, sans micro.
4. **Restitution spatialisée** — configuration FMOD, events 3D, occlusion.
   Aucune dépendance de conception, mais **doit s'accorder avec la propagation** (3).
5. **Réseau** — modèle de réplication, autorité, cadences. Gouverné par ADR-0001 et ADR-0002.

### Core Layer (dépend de Foundation)

6. **Calibration vocale** — dépend de 1 (quoi mesurer) et 2 (micro vivant). Couche mince sur l'audio d'entrée.
7. **3C** — dépend de 5 : le modèle de propriété (`IsOwner`) détermine si l'avatar bouge en local.
8. **Session / lobby** — dépend de 5 : transport et annuaire Steam.

### Feature Layer (dépend de Core)

9. **Portage d'objets** — dépend de 5, 7. **Définit l'enveloppe de portage** (dimensions max, nombre de porteurs, rayon de braquage) — contrat consommé par 10.
10. **Appartement** — dépend de 7, 9. Ne peut pas être dessiné sans l'enveloppe de portage.
11. **Effet voix → objets** — dépend de 3, 9.
12. **Couche de retour local** — dépend de 7, 11. Règles d'ADR-0002 : décalage additif amorti, borné, « prédire l'avertissement, jamais le verdict ».
13. **Mobilier réactif** — dépend de 3, 11. Sensibilité par bande de fréquences.
14. **Chat vocal de proximité** — dépend de 2, 4, 5. Porte le **routage de canaux** (vivants / morts), codé maison.
15. **Habitant** — dépend de 3, 5, 10.
16. **Boucle de contrat** — dépend de 8, 9, 10, 15. Système orchestrateur.

### Presentation Layer (dépend de Feature)

17. **Mort + espace des morts** — dépend de 14 (canal des morts), 15, 16.
18. **Résolution de fin de contrat** — dépend de 16.
19. **UI diégétique minimale** — dépend de 1 (sonomètre), 6 (écran de calibration), 18.

### Polish Layer

Vide au MVP.

---

## Recommended Design Order

| Order | System | Priority | Layer | Agent(s) | Est. Effort |
|-------|--------|----------|-------|----------|-------------|
| 1 | Analyse vocale *(rétro-documentation)* | MVP | Foundation | systems-designer, unity-specialist | S |
| 2 | **Audio d'entrée** | MVP | Foundation | audio-director, unity-specialist | M |
| 3 | **Réseau** | MVP | Foundation | technical-director, network-programmer | L |
| 4 | **Propagation du son** ⟂ | MVP | Foundation | systems-designer | M |
| 5 | **Restitution spatialisée** ⟂ | MVP | Foundation | audio-director, technical-artist | M |
| 6 | Calibration vocale | MVP | Core | systems-designer, ux-designer | S |
| 7 | 3C | MVP | Core | game-designer, gameplay-programmer | M |
| 8 | Session / lobby | MVP | Core | network-programmer | S |
| 9 | **Portage d'objets** | MVP | Feature | systems-designer, gameplay-programmer | L |
| 10 | Appartement | MVP | Feature | level-designer | M |
| 11 | **Effet voix → objets** | MVP | Feature | systems-designer, game-designer | L |
| 12 | Couche de retour local | MVP | Feature | gameplay-programmer, technical-artist | M |
| 13 | Mobilier réactif | MVP | Feature | systems-designer, game-designer | M |
| 14 | Chat vocal de proximité | MVP | Feature | audio-director, network-programmer | M |
| 15 | Habitant | MVP | Feature | ai-programmer, game-designer | L |
| 16 | Boucle de contrat | MVP | Feature | game-designer | M |
| 17 | Mort + espace des morts | MVP | Presentation | game-designer | S |
| 18 | Résolution de fin | MVP | Presentation | ux-designer | S |
| 19 | UI diégétique | MVP | Presentation | ux-designer, unity-ui-specialist | S |

⟂ = **à concevoir en binôme.** La propagation (4) décide de ce que l'habitant
*perçoit* ; la restitution (5) décide de ce que le joueur *entend*. Si les deux
modèles d'occlusion divergent, le jeu ment au joueur — il entend un cri étouffé par
un mur alors que le monstre l'a entendu en clair, et il accuse le jeu d'être injuste,
à raison. Modèle d'occlusion partagé obligatoire.

*Effort* : S = 1 session · M = 2-3 sessions · L = 4+ sessions.

**Les ordres 2 et 3 peuvent être menés en parallèle** — aucune dépendance entre eux,
et ce sont les deux plus gros porteurs de risque.

---

## Circular Dependencies

**Aucun cycle dans le graphe.** Deux tensions bidirectionnelles ont toutefois été
identifiées et résolues par contrat, plutôt que laissées implicites :

- **Portage (9) ↔ Appartement (10)** — le niveau contraint les dimensions du mobilier,
  le mobilier contraint la largeur des couloirs. *Résolution* : le portage définit
  l'**enveloppe de portage** (dimensions max, nombre de porteurs, rayon de braquage) ;
  l'appartement se conçoit contre ce contrat. 9 avant 10.
- **Propagation (3) ↔ Restitution (4)** — les deux modélisent l'atténuation du son dans
  l'espace, l'un pour le gameplay, l'autre pour le joueur. *Résolution* : un modèle
  d'occlusion partagé, conception en binôme.

**Conflit de ressource, pas de dépendance** : l'analyse et le chat vocal consomment le
même micro. Résolu par conception en faisant du système 2 le **propriétaire unique du
périphérique**, qui fourche vers les deux consommateurs.

---

## High-Risk Systems

| System | Risk Type | Risk Description | Mitigation |
|--------|-----------|-----------------|------------|
| **Audio d'entrée** (2) | Technical | Si l'analyse ne peut pas lire un signal brut pendant que le chat vocal tourne, la mécanique centrale tombe — c'est un **pivot de design**, pas un bug (ADR-0003) | Le système possède le device et fourche : le conflit est résolu par conception. **POC audio avant tout le reste** pour confirmer |
| **Réseau** (5) | Technical | 8 systèmes en dépendent. Compatibilité **FishyFacepunch / Unity 6.3 non vérifiée** | Vérifier à l'installation, avant d'écrire du netcode. Second transport local pour itérer sans Steam |
| **Effet voix → objets** (11) + **Retour local** (12) | Design | **Risque n°1 du projet.** Le ressenti de la physique partagée sous 50-100 ms de latence n'a jamais été testé (ADR-0002) | Prototype ciblé : un meuble, deux joueurs, connexion dégradée. **Avant** de bâtir 13, 15 et 16 dessus |
| **Portage d'objets** (9) | Design | Physique répliquée à propriétaire partagé, multi-ancrage — un des problèmes les plus durs du netcode | Même prototype que ci-dessus. Enveloppe de portage figée tôt |
| **Propagation du son** (3) | Design | Goulot silencieux : 3 systèmes en dépendent, modèle entièrement à concevoir, avec la contrainte dure du cumul invariant au nombre de joueurs (GDD §2.4) | Spécifier en formules et tester unitairement hors Unity — la méthode qui a réussi sur `Voice.Core` |
| **Chat vocal** (14) | Scope | Le routage de canaux (vivants / morts) est **codé maison** : l'implémentation gratuite (Steam natif) n'a pas de rooms | Filtrage à deux groupes dans l'interface maison. Bascule Dissonance si insuffisant (ADR-0005) |
| **Propagation (3) ↔ Restitution (4)** | Design | Divergence des deux modèles d'occlusion = le jeu ment au joueur | Modèle partagé, conception en binôme |

---

## Progress Tracker

| Metric | Count |
|--------|-------|
| Total systems identified | 19 |
| Design docs started | 0 |
| Design docs reviewed | 0 |
| Design docs approved | 0 |
| MVP systems designed | 0 / 19 |
| Systems implemented without GDD | 1 *(Analyse vocale)* |

---

## Revision History

| Date | Changement |
|------|-----------|
| 2026-09-03 | Création. 14 entrées de périmètre décomposées en 19 systèmes. |
| 2026-09-03 | **Correction de méthode** : les couches traduisent l'ordre de conception, pas les dépendances de compilation. `Audio d'entrée` et `Propagation du son` remontent de Core en Foundation ; `Calibration` remonte de Feature en Core ; `Appartement` descend de Core en Feature (dépend de l'enveloppe de portage). |
| 2026-09-03 | **Audio d'entrée redéfini** comme propriétaire unique du micro, qui fourche vers analyse et chat vocal — conforme à ADR-0003, résout le conflit de ressource par conception. |
| 2026-09-03 | Conflit `mvp-scope.md` ↔ ADR-0005 tranché : le routage de canaux vocaux (morts / vivants) sera codé maison sur l'implémentation gratuite, plutôt que d'avancer l'achat de Dissonance. |

---

## Next Steps

- [ ] Rétro-documenter l'**Analyse vocale** (code implémenté et testé, GDD manquant)
- [ ] **POC audio** — lever la contention de périphérique avant tout le reste
- [ ] `/design-system` sur les systèmes 2 et 3 (parallélisables)
- [ ] Prototype ciblé sur la physique partagée sous latence, avant les systèmes 13, 15, 16
- [ ] `/design-review` sur chaque GDD terminé
- [ ] `/gate-check systems-design` quand les GDD MVP sont écrits
