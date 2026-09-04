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
l'exécution. **Foundation = aucune dépendance envers un système *non encore conçu*.**

La formulation compte : les systèmes 2 et 3 dépendent du système 1, qui est déjà
construit, testé et figé. Dépendre d'un acquis n'empêche pas de commencer ; dépendre
d'un système qui reste à concevoir, si. Cette distinction n'est pas cosmétique —
l'appliquer a fait remonter deux systèmes d'une couche et en a fait descendre un
autre (voir *Revision History*).

---

## Systems Enumeration

| # | System Name | Category | Priority | Status | Design Doc | Depends On |
|---|-------------|----------|----------|--------|------------|------------|
| 1 | Analyse vocale (`Voice.Core`) | Audio | MVP | **Designed** | `voice-analysis.md` | — ⚠️ |
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
| 12 | Couche de retour local *(inféré)* | Gameplay | MVP | Not Started | — | 1, 2, 5, 9, 11 |
| 13 | Mobilier réactif (2-3 types) | Gameplay | MVP | Not Started | — | 3, 11 |
| 14 | Chat vocal de proximité | Audio | MVP | Not Started | — | 2, 4, 5 |
| 15 | Habitant | Gameplay | MVP | Not Started | — | 3, 5, 10 |
| 16 | Boucle de contrat | Gameplay | MVP | Not Started | — | 8, 9, 10, 15 |
| 17 | Mort + espace des morts | Gameplay | MVP | Not Started | — | 14, 15, 16 |
| 18 | Résolution de fin de contrat | UI | MVP | Not Started | — | 16 |
| 19 | UI diégétique minimale *(inféré)* | UI | MVP | Not Started | — | 1, 6, 18 |

*(inféré)* = système non nommé dans `mvp-scope.md`, révélé par la décomposition.

> ⚠️ **Système 1 — « Depends On : — » vaut au sens de la *conception*, pas de l'exécution.**
> L'analyse vocale se spécifie sans qu'aucun voisin ne soit conçu, ce qui justifie sa place
> en Foundation. Mais **à l'exécution elle ne produit rien sans le profil de calibration du
> système 6** : hors calibration, sa sortie est `VoiceFrame.Silence`. Voir la section
> *Dependencies* de `design/gdd/voice-analysis.md`, qui distingue les deux notions et
> explique pourquoi les cycles apparents 1↔2 et 1↔6 n'en sont pas.

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
12. **Couche de retour local** — dépend de 1, 2 (voix locale, avant réseau), 5 (état autoritaire), 9, 11. Règles d'ADR-0002 : décalage additif amorti, borné, « prédire l'avertissement, jamais le verdict ». **Doit être spécifié comme solveur pur** (voix locale + temps → delta borné amorti) ; la *composition* avec la transformée autoritaire appartient au consommateur, avec **un ordre de composition unique et un seul écrivain** — sinon 9, 11, 12 et 13 écrivent tous la même transformée de rendu.
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
| — | 🔬 **SPIKE : POC audio** — deux consommateurs sur un micro. Timeboxé 2 sessions. Échec = pivot de design, pas correctif | — | — | prototyper | S |
| 2 | **Audio d'entrée** | MVP | Foundation | audio-director, unity-specialist | M |
| 3 | **Réseau** | MVP | Foundation | technical-director, network-programmer | L |
| 4 | **Propagation du son** ⟂ | MVP | Foundation | systems-designer | M |
| 5 | **Restitution spatialisée** ⟂ | MVP | Foundation | audio-director, technical-artist | M |
| 6 | Calibration vocale | MVP | Core | systems-designer, ux-designer | S |
| 7 | 3C | MVP | Core | game-designer, gameplay-programmer | M |
| 8 | Session / lobby | MVP | Core | network-programmer | S |
| — | 🔬 **SPIKE : latence physique** — un meuble, deux joueurs, connexion dégradée. Timeboxé 5 sessions. Invalide 9, 10, 11, 12, 13 s'il échoue | — | — | prototyper | M |
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

- **Propagation (3) / Restitution (4) ↔ Appartement (10)** — *identifiée par le
  directeur technique le 2026-09-03.* L'occlusion a besoin de la **topologie acoustique**
  de l'appartement (pièces, ouvertures, matériaux) : deux systèmes Foundation
  dépendraient d'un système Feature. *Résolution symétrique à la précédente* : **le
  système 3 possède le contrat de topologie acoustique**, l'appartement s'y conforme.
  Ce contrat doit rester compatible avec la génération procédurale reportée.

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

## Director Panel Review — 2026-09-03

Trois directeurs ont relu cette décomposition avant l'écriture des GDD.

| Directeur | Verdict |
|---|---|
| Technique (TD-SYSTEM-BOUNDARY) | **CONCERNS** — frontières saines, six points à fermer *dans les GDD*, pas par un redécoupage |
| Producteur (PR-SCOPE) | **OPTIMISTIC** — ~48 sessions pour les seuls GDD, 150-200 au total, soit 12-18 mois solo |
| Créatif (CD-SYSTEMS) | **CONCERNS** — aucun gonflement de périmètre, mais deux manques bloquants |

### Contraintes à porter dans les GDD

Ces points ne se règlent pas dans l'index : ils doivent être tranchés explicitement
dans la section *Detailed Rules* du GDD concerné.

| Système | Contrainte issue de la revue |
|---|---|
| **11. Effet voix → objets** | **La question la plus structurante de l'index** : la voix d'un joueur **non-porteur** affecte-t-elle un objet porté par autrui ? Si l'effet se limite au porteur, la maîtrise redevient individuelle, le Pilier 2 s'effondre et « la comédie survit à la maîtrise » avec lui. À trancher, pas à découvrir à l'implémentation. |
| **13. Mobilier réactif** | **Au moins un des 2-3 types doit être un objet à demande sonore** — qui ne se stabilise ou n'avance que sous émission active. Sans lui, aucun système ne porte le Pilier 1 et le MVP validerait une boucle où le silence est optimal. |
| **16. Boucle de contrat** | Porte l'invariant **« ≥ 1 élément d'obligation sonore par contrat »** comme critère d'acceptation. Doit aussi nommer deux propriétaires manquants : l'échéance de la tombée de la nuit, et le caractère **collectif** de la décision « on pousse ou on sort ? ». |
| **2. Audio d'entrée** | Doit écrire la liste de ce qu'il **ne fait pas** : ni normalisation (fermée dans Core, ADR-0004), ni calibration (6), ni routage de canaux (14), ni encodage/transport (14). C'est ce qui l'empêche de devenir un God Object. Doit aussi **posséder l'émission des `VoiceFrame` vers l'hôte** (ADR-0003 étape 4, ~20-30 Hz) — cette responsabilité n'appartenait à aucun des 19 systèmes. |
| **3. Propagation du son** | **Décision structurante** : la propagation transporte-t-elle un scalaire ou des **énergies par bande** ? Si scalaire, la sensibilité par bande de fréquences du système 13 ne survit pas à la distance. Doit être une **requête pure** (bruit perçu au point P), jamais un `SoundManager` à inscription d'auditeurs. |
| **5. Réseau** | Contrat de réplication, pas manager : classes de canaux, autorité, cadences ; chaque feature possède son schéma. **Il manque un budget de bande passante** — 8 dépendants, aucun chiffre, alors que CPU, mémoire et draw calls en ont un. |
| **19. UI diégétique** | Le sonomètre est le seul élément qui frôle un anti-pilier : c'est un HUD informatif, et il *aide à optimiser le silence*. À contraindre — imprécis, retardé, **jamais de seuil affiché**. Ne doit jamais afficher un verdict prédit (recoupe le système 12). |

### Contraintes moteur à porter dans les GDD

*Relevées le 2026-09-03 pendant le chargement de contexte de `/create-architecture`.
Aucun domaine Unity n'est en HIGH RISK, mais trois changements de la 6.3 ont un impact
nommé sur des systèmes précis.*

| Système | Contrainte moteur | Source |
|---|---|---|
| **2. Audio d'entrée** | `[SerializeField]` est **réservé aux champs** en 6.3 — l'appliquer à une propriété est une **erreur de compilation**, plus un no-op silencieux. Mordra dès que `Voice.Capture` recevra son ScriptableObject de réglages (ADR-0006 : « les valeurs de réglage passent par constructeur, et le ScriptableObject qui les alimente vit dans Capture »). Utiliser `[field: SerializeField]`. | `deprecated-apis.md` |
| **19. UI diégétique** | Le parseur USS d'UI Toolkit est **strict** en 6.3 : sélecteurs invalides et CSS non supporté autrefois ignorés lèvent désormais une erreur. S'applique **si** UI Toolkit est retenu — le choix UI Toolkit vs UGUI n'est pas tranché. | `breaking-changes.md` |
| **Tout futur render pass** | Le code URP *Compatibility Mode* est **supprimé par défaut**. `URP_COMPATIBILITY_MODE` est une aide à la conversion, non supportée en 6.4+. Cibler RenderGraph. | `breaking-changes.md` |

> **Le risque réel n'est pas dans le moteur, il est dans les dépendances tierces.**
> Unity 6.3 est sortie en décembre 2025, donc dans les données d'entraînement du modèle.
> FishNet, FMOD et Dissonance évoluent indépendamment — et **FishyFacepunch reste non
> vérifié** avec 6.3. Le patch `.18f1` du projet date de mi-2026, au-delà du cutoff.

**Convention retenue pour le futur `architecture.md`** : les avertissements de risque
moteur seront **marqués en ligne, système par système**, avec l'extrait de référence
correspondant — plutôt que regroupés en tête de document. L'avertissement doit être
là où le développeur travaille.

### Points ouverts non tranchés par cette revue

- **Persistance du profil de calibration** (système 6) — aucun propriétaire assigné, et la catégorie *Persistence* est déclarée inutilisée.
- ~~**Place de l'AEC dans ADR-0003**~~ — **résolu le 2026-09-03.** ADR-0003 amendé :
  l'AEC remonte **en amont de la fourche** et protège les deux voies. Elle est
  reclassée de « confort d'écoute » à **correction de gameplay** : sans elle, un
  joueur sans casque injecte la voix de ses coéquipiers dans sa propre analyse.
  Elle peut remonter sans violer le principe de l'ADR parce qu'elle soustrait un
  signal *connu* au lieu de filtrer — elle préserve donc le chuchotement.
  ADR-0005 amendé en conséquence : **le casque devient un prérequis de validité de
  la mesure** tant qu'on est en implémentation A (sans AEC), pas une consigne de confort.
  → Contrainte pour le système 2 : l'AEC est le **seul** traitement autorisé en
  amont de l'analyse.

---

## Progress Tracker

| Metric | Count |
|--------|-------|
| Total systems identified | 19 |
| Design docs started | **1** *(Analyse vocale — 7 sections sur 13)* |
| Design docs reviewed | 0 |
| Design docs approved | 0 |
| MVP systems designed | 0 / 19 |
| Systems implemented without GDD | **0** *(l'analyse vocale a désormais son GDD)* |

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
