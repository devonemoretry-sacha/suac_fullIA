# Session State — Active

**Dernière mise à jour**: 2026-09-07

<!-- STATUS -->
Epic: Onboarding & cadrage
Feature: Migration vers la structure template
Task: GDD Calibration vocale — Overview + Player Fantasy ecrites, 9 sections restantes
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
- [x] **GDD Analyse vocale — COMPLET**, 11 sections, 1353 lignes
- [x] `/design-review voice-analysis` — verdict **NEEDS REVISION**, révisions appliquées le 2026-09-07. Rapport et traitement dans `design/gdd/reviews/voice-analysis-2026-09-07.md`
- [x] **ADR-0007** (`Accepted`) — cadence d'analyse par `deltaTime` explicite. Unity ne fournit aucun rappel à 50 Hz fixe : l'option « contrat implicite » n'existait pas
- [x] **ADR-0008** (`Accepted`) — l'ingestion de PCM externe est un critère éliminatoire ; inventaire fait, backend retenu, intégration auditée et vendorisée
- [ ] Re-revue du GDD analyse vocale après révisions
- [x] `/art-bible` — sections 1-3 écrites, **cadre provisoire assumé**. Section 4 différée : la direction visuelle évoluera avec un graphiste, et elle ne lève aucun risque de gameplay
- [ ] `/prototype` — étape sautée, toujours non rattrapée : la Voice-Physics n'a jamais été validée comme amusante
- [x] **Inventaire des SDK vocaux** (ADR-0008) — fait le 2026-09-07, sourcé. 4 candidats passent le critère d'ingestion PCM ; **Steam Voice échoue deux fois** et invalide l'implémentation A d'ADR-0005
- [x] **Backend vocal retenu : Dissonance** (2026-09-07). 120 $ + 55 $ pont FMOD, **dès le départ et non en upgrade** — ADR-0005 amendé
- [x] Audit de `DissonanceVoiceForFishNet` — verdict **vendoriser, ne pas dépendre** : 698 lignes MIT, auteur d'origine parti mais dépôt vivant (l'auteur de Dissonance y a lui-même contribué)
- [x] **Intégration vendorisée** — `Assets/_Project/ThirdParty/DissonanceFishNet~/`, commit amont `18386e0` épinglé, import à l'identique, **inerte** (suffixe `~` : Unity l'ignore). Procédure d'activation dans sa `VENDORING.md`
- [ ] Acheter Dissonance + pont FMOD, installer FishNet et FishyFacepunch — **rien ne compile avant**
- [ ] **Compiler l'intégration contre Dissonance 9.0.7 / FishNet 4.7.2R** — dernier alignement documenté : Dissonance **8**. Seul vrai inconnu du choix
- [ ] Réécrire les références des asmdef **par nom** — celles de l'amont sont par GUID et celles de Dissonance ne résoudront pas
- [ ] Corriger le démarrage avant authentification (issue #12) — notre topologie Steam a un authenticator, on traversera ce chemin
- [ ] Vérifier le canal non fiable et non ordonné exigé par Dissonance
- [ ] POC audio — lève 3 questions d'un coup : contention de périphérique, non-dégradation par l'AEC, cadence des features. **Conditionné à ADR-0008**
- [ ] Playtest « même pièce » (OQ-8) — **avant** d'écrire les GDD des systèmes 3 et 12, qui encoderont tous deux « une voix par `VoiceFrame` »
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
| Analyse vocale | DSP maison en C# pur — **FMOD retiré du chemin d'analyse** (ADR-0003). Une seule instance par client : chaque client analyse son propre micro, les `VoiceFrame` des autres arrivent par le réseau |
| Cadence d'analyse | **`deltaTime` explicite** (ADR-0007). Unity n'offre aucun rappel à 50 Hz fixe — `Update` suit l'affichage, `FixedUpdate` rattrape, `Microphone` est en polling, `OnAudioFilterRead` dépend d'un tampon modifiable. À appliquer **avant** d'écrire le `VoiceAnalyzer` |
| Backend vocal | **L'ingestion de PCM externe est éliminatoire** (ADR-0008, `Accepted`). Si aucun backend acceptable n'existe : renoncer au chat intégré est préférable à renoncer à l'AEC en amont — le premier coûte du confort, le second coûte le Pilier 1 |
| AEC | **En amont de la fourche**, protège analyse et communication. Reclassée de « confort » à **correction de gameplay** (ADR-0003 amendé le 2026-09-03). Sans AEC → **casque obligatoire**, prérequis de validité de la mesure |
| Chat vocal | **Interface maison, backend interchangeable** (ADR-0005). Backend retenu le 2026-09-07 : **Dissonance**, 175 $ **dès le départ**. L'implémentation A gratuite est morte — Steam Voice n'accepte pas de PCM externe et applique un VAD (ADR-0008). Intégration FishNet **vendorisée**, pas subie : 698 lignes MIT |
| Licences | FMOD **gratuit** sous 200 k$ de revenu. Dissonance 120 $ + pont FMOD 55 $ : **engagés, et nécessaires au MVP** depuis ADR-0008 — l'alternative gratuite n'existe pas |
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
| `production/review-mode.txt` | `full` *(passé de `lean` à `full` le 2026-09-03)* |
| `production/project-stage-report.md` | Rapport d'analyse de stade |
| `design/mvp-scope.md` | **Périmètre MVP arrêté** |
| `docs/adoption-plan-2026-09-03.md` | Plan de migration |
| `docs/architecture/adr-0001..0006` | 6 ADR formalisées depuis le LOG |
| `design/gdd/game-concept.md` | Concept au format template, relu et arbitré |
| `design/gdd/systems-index.md` | 19 systèmes, 4 couches, compteurs de progression |
| **`design/gdd/voice-analysis.md`** | **GDD complet — 11 sections, révisé après revue** |
| `design/gdd/reviews/voice-analysis-2026-09-07.md` | Rapport de revue + traitement + **deux contestations argumentées** |
| `docs/architecture/adr-0007-*.md` | Cadence d'analyse par `deltaTime` explicite (`Accepted`) |
| `docs/architecture/adr-0008-*.md` | Ingestion de PCM externe, critère éliminatoire (`Proposed`) |
| `design/art/art-bible.md` | Sections 1-3, cadre provisoire |
| `production/session-state/active.md` | Ce fichier |
| `Obsedian_SUAC_FIA/GDD - *.md` (×3) | Supprimés (0 octet) |

## Questions ouvertes

1. **Le SDK de chat vocal accepte-t-il du PCM externe ?** *(recadrage du 2026-09-07 —
   remplace « contention de périphérique micro »)*. La question du partage de micro en
   présupposait une autre, jamais posée : la plupart des SDK **possèdent la capture**. S'il
   possède la capture, il n'y a rien à fourcher et le trajet d'ADR-0003 s'effondre — quel
   que soit le résultat du test de partage. **Bloquant, et il précède le POC.** → ADR-0008.
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
