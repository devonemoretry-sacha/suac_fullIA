Navigation : [[MOC - Shut-up & Carry]] | [[LOG - Décisions techniques]]

## 🎙️ Audio & Voix

### ❓ Reconfirmer le zéro-allocation dans Unity

- **Problème** : les tests d'allocation de `SUAC.Voice.Core` tournent hors Unity, en netstandard2.1, via `GC.GetAllocatedBytesForCurrentThread()`. Ils prouvent que le code C# n'alloue pas — mais le GC d'Unity (Mono, et surtout IL2CPP en build) peut se comporter différemment : boxing implicite, allocations de marshalling, comportement du JIT.
- **Pistes** : un test PlayMode équivalent, ou un passage au Profiler (colonne GC Alloc) une fois le `VoiceAnalyzer` en fonctionnement réel dans l'éditeur. À refaire une fois en build IL2CPP.
- **Statut** : à faire quand le `VoiceAnalyzer` tourne pour de vrai. Le « zéro octet » doit rester vrai dans l'environnement final, pas seulement au banc de test.

### ❓ Accès simultané au micro (analyse + Dissonance)

- **Problème** : l'analyse capture le micro brut en local, Dissonance capture le même périphérique pour le transport. Deux accès concurrents au même device.
- **Pistes** : Dissonance expose-t-il son flux de capture avant traitement, qu'on pourrait dériver ? Sinon, deux `Microphone.Start` sur le même device — à tester sous Windows (WASAPI le permet généralement en mode partagé).
- **Statut** : à lever au POC audio. Sans blocage sur l'étape 0, qui n'utilise pas encore Dissonance.
- Cf. [[LOG - Décisions techniques]] — 2026-07-05 (analyse locale) et 2026-07-27 (séparation des voies)

### ❓ Extraction du pitch (f0) vs bandes FFT

- **Problème** : la FFT par bandes donne la répartition d'énergie (le timbre), pas la hauteur de la voix. Or l'équité inter-joueurs sur les objets sensibles au pitch (Matelas à Mémoire de Ton) exige un f0 par joueur, normalisé sur sa médiane personnelle.
- **Pistes** : autocorrélation / YIN sur le signal brut, en complément de la FFT FMOD
- **Statut** : les bandes suffisent pour le prototype ; le f0 devient obligatoire dès qu'un objet oppose grave et aigu

### ❓ Calibration vocale par joueur — ce qu'elle doit mesurer

- **Problème** : sur des seuils absolus, une voix grave, une voix aiguë, un micro saturé et un micro faible ne vivent pas le même jeu. Le Matelas avantage structurellement les voix graves.
- **Pistes** : mesure au premier lancement → tous les seuils s'expriment en écart relatif. Le profil doit remonter au host.
- **Quatre grandeurs à relever**, chacune ajoutée pour une raison précise :
    - le **niveau de repos** et le **niveau de cri** → normalisation du volume
    - la **hauteur médiane** → normalisation du pitch, et restriction de la plage de recherche (4ᵉ défense contre l'erreur d'octave)
    - la **hauteur en criant** → sans elle, la plage personnalisée exclurait les cris du joueur. On reproduirait le bug du plafond trop bas, en plus sournois puisque propre à chacun.
    - le **plancher de bruit** → porte de volume du voisement, cf. [[LOG - Décisions techniques]] 2026-07-27. Sans lui, un frigo passe pour une note.
- **Statut** : à intégrer au prototype, pas au polish. Le mutateur « Atmosphère à l'Hélium » s'applique **après** normalisation.

### ❓ Écrire l'adaptateur réseau Dissonance au-dessus du P2P Steam

- **Problème** : la décision du 2026-09-03 acte que Dissonance sera porté par notre propre transport plutôt que par le pont communautaire FishNet. Cet adaptateur reste à écrire : implémenter les classes de base réseau de Dissonance sur le P2P Steam (Facepunch), avec envoi/réception de paquets non fiables non ordonnés et les événements de session (arrivée, départ).
- **Pistes** : partir des classes de base fournies par Dissonance et de la doc « Custom Networks » ; s'appuyer sur la gestion de lobby Steam déjà nécessaire à FishyFacepunch pour connaître les pairs, plutôt que de dupliquer une découverte de session.
- **Statut** : à faire à l'étape réseau, pas avant. Non bloquant pour la création du projet.
- Cf. [[LOG - Décisions techniques]] 2026-09-03 (Dissonance sur son propre transport).

### ❓ Dissonance : licence

- **Problème** : Dissonance est un asset payant, non acquis à ce jour. Montant chiffré le 2026-09-03 : **120 $** pour Dissonance + **55 $** pour l'intégration FMOD (playback), soit **175 $** — l'intégration FMOD n'étant pas optionnelle au vu de la décision de faire passer la voix dans le pipeline FMOD.
- **Statut** : sans urgence — l'analyse locale ne dépend pas de Dissonance, qui n'intervient qu'au chat vocal. À acheter à l'étape réseau, en re-vérifiant à ce moment-là la vitalité de l'éditeur (fil d'actualité muet depuis 2023, mais tickets suivis en 2026).

### ❓ Echo / Larsen (voix qui reboucle dans le micro)

- **Problème** : sans casque, la voix qui sort des HP repart dans le micro
- **Pistes** : AEC natif Dissonance ? / imposer le casque ? / post-process ?
- **Statut** : à tester en playtest — priorité basse pour l'alpha

### ❓ Hotplug micro (débranchement en jeu)

- **Problème** : gérer débranchement/rebranchement du micro sans crash
- **Pistes** : Dissonance gère-t-il nativement ? / boucle de check custom + UI mute
- **Statut** : à investiguer dans la doc Dissonance

### ❓ Latence & jitter buffer

- **Problème** : cible <150ms pour du coop fluide
- **Pistes** : Dissonance gère-t-il le jitter buffer nativement ?
- **Statut** : à mesurer en POC réseau

## 🎨 Rendu & Direction artistique

### ❓ Budget de performance cible

- **Problème** : la décision du 2026-09-03 acte URP « lo-fi à pics ciblés ». Mais empiler APV, TAA, SSAO, ombres haute résolution et un volumétrique tiers remonterait le plancher matériel — exactement le reproche fait à HDRP. Dans un jeu à 8 joueurs, une configuration exclue retire un joueur à tout le groupe.
- **Pistes** : fixer une configuration de référence basse (le « PC du copain ») et une cible chiffrée en images par seconde, puis n'accepter une option de rendu que si elle y tient. Prévoir des paliers de qualité plutôt qu'un réglage unique.
- **Statut** : à fixer **avant** de travailler l'ambiance, pas après.

### ❓ `GDD - Direction Artistique.md` est vide

- **Problème** : le fichier fait 0 octet. La direction artistique n'existe qu'en filigrane — une ligne du GDD citant *Lethal Company* pour le lo-fi / VHS, une autre citant *Overcooked* pour la tonalité — plus le cadre acté au LOG le 2026-09-03 par le biais d'un choix technique.
- **Pistes** : écrire le chapitre à partir de ce qui est déjà tranché (base lo-fi, pics sur ce qui est maudit ou anormal, éclairage porteur de gameplay, noir total interdit dans la durée), puis compléter avec les références visuelles, la palette et le traitement de la caméra.
- **Statut** : à écrire. Non bloquant pour la création du projet, bloquant dès qu'un asset visuel sera produit.

## 🛠️ Outils & Environnement

### 📋 Prochaines étapes — reprise de session

Établi en conversation Cowork le 2026-09-02 (cf. [[LOG - Décisions techniques]], entrées « Bascule de l'IDE », « Reprise du projet Unity à zéro », « Claude Code : nouvelle conversation dédiée au code »).

**Logique de l'ordre :** la phase 0 d'abord parce qu'elle conditionne la façon dont toutes les conversations suivantes démarrent ; l'environnement ensuite (il conditionne le projet) ; le projet ; l'outillage Claude Code par-dessus, puisqu'il vit dans le repo du projet ; les skills maison en dernier, parce qu'ils ont besoin de séances réelles pour être calibrés sur autre chose que des suppositions.

**Phase 0 — Continuité des conversations Cowork/chat** *(à faire en premier : sans ça, la prochaine conversation repart aveugle)*

1. **Ajouter une routine d'ouverture de session aux instructions du Project** claude.ai — le pendant du `CLAUDE.md` côté Cowork, chargé automatiquement dans chaque conversation du Project. Doit imposer l'ordre de lecture : [[SESSIONS - Journal de travail]] (où on en est) → [[BACKLOG - Points ouverts]] (ce qui reste à trancher) → [[LOG - Décisions techniques]] (ce qui est déjà tranché, à ne pas rouvrir). Rédigé par Claude, collé par le user (les instructions du Project ne sont pas éditables par l'outil).
2. **Réactiver la discipline [[SESSIONS - Journal de travail]]** — le fichier de reprise existe déjà et remplit exactement ce rôle (section « Prochaine séance » en fin d'entrée), mais il n'était plus tenu depuis le 2026-07-27 alors que le LOG avançait. Aucun nouveau fichier à créer : une entrée en fin de chaque séance, c'est tout.
3. **Ouvrir la nouvelle conversation Cowork/chat** — une fois 1 et 2 en place, pas avant.

**Phase 1 — Environnement de développement**

4. ✅ **Installer JetBrains Rider** — fait le 2026-09-03. Version **2026.2.1**, licence non-commerciale activée.
5. 🟡 **Configurer Rider ↔ Unity** — partiellement fait le 2026-09-03 : **serveur MCP intégré activé** (`Settings | Tools | MCP Server`), le prérequis d'`unity-coding-skills`. **Reste à faire, après la Phase 2 car dépendant d'un projet existant** : package « JetBrains Rider Editor » via le Package Manager, Rider en External Script Editor dans les Preferences Unity, packages Test Helper / UI Test Helper, `.editorconfig` avec règles Roslyn ≥ warning.

**Phase 2 — Le projet Unity propre**

6. ✅ **Trancher le sort du repo git du code** — tranché le 2026-09-03 : dépôt **conservé**, fusion de `feat/voice-core-analysis` dans `main` après relecture, puis nettoyage des résidus VS par-dessus. Cf. [[LOG - Décisions techniques]].
7. ✅ **Confirmer la version d'Unity et la compatibilité de la stack** — tranché le 2026-09-03 : **Unity 6000.3.x, dernier patch** (6.3 est passée LTS, supportée jusqu'à décembre 2027). FishNet et FishyFacepunch validés. Dissonance : problème identifié, arbitrage distinct ci-dessous. Cf. [[LOG - Décisions techniques]].
8. **Créer le nouveau projet** + arborescence `Assets/_Project` avec les quatre assemblies actées au LOG + `.gitignore` couvrant Unity **et** Rider (`.idea/`, `*.DotSettings.user`) — plus de résidus VS.
9. **Arbitrer le sort de `Assets/_Project/` de l'ancien projet** (cf. point ouvert dédié) : rapatrier tel quel plutôt que réécrire, en toute logique — ce code ne référence pas Unity et ne dépend donc d'aucun réglage du projet abandonné.

**Phase 3 — Outillage Claude Code** *(tout vit dans le repo du projet, donc après la phase 2)*

10. **Ouvrir la nouvelle conversation Claude Code**, dédiée exclusivement à l'implémentation.
11. **Revérifier les MCP côté Code** : Unity CLI (`unity mcp configure claude-code`) et vault Obsidian — les chemins ont changé avec le nouveau projet.
12. **Reconfirmer `unity-coding-skills`** dans le nouveau contexte + **ajouter le plugin Unity officiel** (`claude.com/plugins/unity`, gratuit, complémentaire : briques moteur, là où nowsprinting couvre le workflow test-first).
13. **Écrire `CLAUDE.md`** à la racine de `02_PROJETS/Shut_up_and_carry/` : résumé projet, carte du code/assemblies, commande de build/tests (désormais via le MCP Rider), règle de routage vers le vault, discipline de journalisation LOG/BACKLOG/SESSIONS, conventions actées, renvoi aux guides `unity-coding-skills` pour éviter la redite.
14. **Écrire les règles passives `.claude/rules/`** — `fishnet-securite.md` (ne jamais faire confiance au client, validation serveur, RPC authentifiés), scopée aux `.cs`, et une règle de conventions C# reprenant ce qui est déjà tranché au LOG (namespace `SUAC`, `noEngineReferences` sur Core, frontière brut/normalisé).
15. **Écrire `REVIEW.md`** à la racine du repo — calibrage du `/code-review` natif de Claude Code (gratuit, tourne en subagent) sur nos priorités réelles : autorité serveur FishNet, frontière brut/interne de `Voice.Core`, aucun secret en clair.
16. **Créer le subagent `security-auditor`** dans `.claude/agents/`, en lecture seule (`tools: Read, Grep, Glob`), pour les audits ponctuels plus profonds que `/code-review`.
17. **Redémarrer Claude Code** une fois `.claude/` complet — `CLAUDE.md` et les règles ne sont chargés qu'au démarrage d'une session.

**Phase 4 — Skills sur mesure** *(en dernier : à calibrer sur des séances réelles, pas sur des suppositions)*

18. **Skills Cowork/chat** (côté discussion) : bonnes pratiques de game design et de level design, checklists d'arbitrage. Possibles via le mécanisme de proposition de skills — enregistrés au niveau du compte, donc actifs dans toutes les conversations : à nommer et cadrer en conséquence si on ne veut pas qu'ils se déclenchent hors projet.
19. **Skills Claude Code adaptés à la stack** : FishNet (patterns réseau récurrents), Dissonance/FMOD, `Voice.Core`. À écrire une fois qu'on a assez de répétition pour savoir quoi y figer.

### ❓ Rapatrier ou réécrire `Assets/_Project/`

- **Problème** : « repartir à zéro » a été décidé sur l'idée qu'il y a peu de code. Or `SUAC.Voice.Core` contient déjà `VoiceFrame`, `LoudnessMeter`, `EnvelopeFollower`, `Decimator` et un `PitchDetector` (YIN) — avec 41 tests verts et des comportements subtils déjà figés par des tests (l'aveuglement au volume de YIN, la plage de recherche portée à 600 Hz). Réécrire, c'est refaire ce chemin d'apprentissage.
- **Piste retenue par défaut** : la remise à zéro porte sur le **projet Unity** (config, artefacts VS, résidus du template URP), pas sur le code. `Voice.Core` est `noEngineReferences` — il ne dépend d'aucun réglage du projet abandonné, son rapatriement est un copier-coller, pas une migration.
- **Statut** : à confirmer par le user avant de recréer le projet

