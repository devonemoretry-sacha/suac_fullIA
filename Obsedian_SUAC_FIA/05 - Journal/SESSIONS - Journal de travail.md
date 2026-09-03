##### Navigation : [[MOC - Shut-up & Carry]] | [[LOG - Décisions techniques]] | [[BACKLOG - Points ouverts]]

> **Rôle de ce fichier.** Le récit de ce qui a été fait, séance par séance — le « comment on en est arrivé là ».
> Il complète les deux autres journaux sans empiéter dessus :
> - [[LOG - Décisions techniques]] — **ce qui a été tranché**, et rien d'autre. Consultable au Ctrl+F sans ambiguïté.
> - [[BACKLOG - Points ouverts]] — **ce qui reste à trancher**.
> - **Ce fichier** — ce qui a été *fait*, dans l'ordre, avec ce qu'on a appris en chemin.
>
> Règle : aucune décision ne vit ici. Si une séance produit un arbitrage, il va dans le LOG et ce fichier s'y réfère.
> Ordre antichronologique, comme le LOG.

---

## 2026-09-03 — Rider installé, et quatre verrous levés avant de recréer le projet

**Objectif de départ :** reprendre le plan à la Phase 1 — installer et configurer Rider — puis aller aussi loin que possible vers la création du nouveau projet Unity et les skills sur mesure.

### Ce qui a été fait

**1. Rider 2026.2.1 installé et configuré** : licence non-commerciale activée, serveur MCP intégré activé — le prérequis d'`unity-coding-skills` qui avait motivé toute la bascule d'IDE. La moitié restante de la configuration (package Rider Editor, External Script Editor, Test Helper, `.editorconfig`) dépend d'un projet Unity existant : reportée après la Phase 2.

**2. Quatre décisions actées au LOG**, dans l'ordre où elles bloquaient la suite : le sort du dépôt git, la version d'Unity, Dissonance, et le pipeline de rendu.

**3. Un brief de recréation du projet écrit** à la racine de `Shut_up_and_carry\`, destiné à la nouvelle conversation Claude Code : fusion de la branche vocale, vidage de l'arbre de travail, création du projet URP, réinjection du code, `.gitignore` Unity + Rider.

**4. Un skill proposé** — `suac-arbitrage` — pour que les invariants du projet soient *appliqués* plutôt que simplement *trouvables*. Les skills de level design prévus au plan ont été écartés pour l'instant : le chapitre correspondant du GDD est vide, il n'y aurait rien à y figer que des généralités.

### Ce qu'on a appris en chemin

**Le pilotage d'écran ne peut pas lancer un installeur.** Les fenêtres des applications non autorisées sont masquées, et un installeur fraîchement téléchargé ne peut pas être autorisé puisqu'il n'est pas encore une application installée. Ce n'est pas un incident, c'est une limite structurelle : téléchargement et configuration pilotables, installation non.

**La bonne réponse dormait dans le GDD depuis des mois.** Sur le pipeline de rendu, le raisonnement spontané « jeu d'horreur, donc HDRP » était faux, et le GDD le disait déjà : esthétique lo-fi / VHS, éclairage porteur de gameplay et non d'ambiance, interdiction du noir total durable. Le réflexe à garder : chercher dans le GDD **avant** de raisonner. C'est ce qui a motivé le skill proposé.

**Une question ouverte sans échéance ne se rappelle pas d'elle-même.** Le LOG du 2026-07-05 se terminait sur « À vérifier : Dissonance a-t-il une intégration FishNet officielle ? ». Deux mois plus tard, personne n'avait vérifié — et la réponse est non. La question n'a resurgi que parce que la vérification de compatibilité de la stack était, elle, inscrite dans une étape datée.

**La direction artistique n'existait nulle part par écrit.** `GDD - Direction Artistique.md` fait 0 octet ; le style visuel ne vivait que dans une ligne de comparaison au milieu d'un GDD de 83 Ko. Le choix du pipeline l'a forcée à exister — une décision de design prise par la bande, via un choix technique. À ne pas laisser se reproduire.

**Le LOG a une incohérence d'ordre.** Les six entrées du 2026-09-02 ont été ajoutées en fin de fichier alors qu'il est antichronologique. Les entrées du jour ont été posées en haut, selon la convention ; le bloc du 02/09 reste mal placé, déplacement proposé et non fait.

### Décisions produites

Quatre entrées au [[LOG - Décisions techniques]] datées du 2026-09-03 : sort du dépôt git (conservé, nettoyé par-dessus), version d'Unity (6000.3.x, LTS jusqu'à décembre 2027), Dissonance sur son propre transport P2P Steam, rendu URP sur une direction artistique lo-fi à pics ciblés.

Trois points ajoutés au [[BACKLOG - Points ouverts]] : l'adaptateur réseau Dissonance à écrire, le budget de performance cible, et le chapitre de direction artistique à rédiger. Trois points fermés : sort du dépôt, compatibilité de la stack, intégration FishNet de Dissonance.

### Prochaine séance

**1. Ouvrir la nouvelle conversation Claude Code** et lui donner `BRIEF - Recreation du projet Unity.md`. C'est le point 8 du plan, devenu du travail git et système de fichiers par l'effet de la décision de garder le dépôt.

**2. Finir la configuration Rider côté projet** une fois celui-ci créé — c'est la moitié du point 5 restée en suspens.

**3. Enchaîner sur la Phase 3** (points 11 à 17 du BACKLOG). Avec une recommandation à trancher au passage : mettre `CLAUDE.md` et `.claude/` **dans le dépôt du code** plutôt qu'à la racine `02_PROJETS/Shut_up_and_carry/` comme le prévoyait le plan — cette racine n'est dans aucun dépôt git, l'outillage y serait non versionné et non sauvegardé.

Le sort de `Assets/_Project/` (point 9) reste ouvert et l'assume : le user a choisi de juger la pertinence du code existant au moment de l'écrire, pas avant. La fusion de la branche le met en sécurité dans `main` en attendant.

---

## 2026-09-02 — Outillage : sauvegarde du vault, agents, et bascule d'IDE

**Objectif de départ :** mettre en place l'outillage autour du projet — sauvegarder le vault, brancher les accès des agents, et se doter d'un dispositif de bonnes pratiques et de revue automatisée. Aucun code de jeu écrit ce jour.

### Ce qui a été fait

**1. Le vault est devenu son propre dépôt git privé**, séparé du code Unity, avec exclusion des plugins Obsidian (secrets en clair) — il n'avait aucune sauvegarde jusque-là. Dossier renommé `Obsedian SUAC/` → `Obsedian_SUAC/` au passage.

**2. Les accès des agents ont été câblés** : MCP du vault (`mcp-tools-istefox`) côté Claude Desktop et Claude Code ; Unity CLI en MCP côté Claude Code uniquement, délibérément pas côté Desktop.

**3. La répartition Claude Code / Claude Cowork a été actée** — implémentation d'un côté, architecture et arbitrages de l'autre, avec écriture directe dans ce journal et le LOG.

**4. Revue du marché des plugins de bonnes pratiques Unity.** `nowsprinting/unity-coding-skills` retenu (workflow test-first, conventions C#, sans concurrent sérieux) et installé ; `tjboudreaux/cc-plugin-unity-gamedev` écarté (immature, ne couvre pas notre stack) ; le plugin Unity officiel identifié comme complément gratuit, pas comme concurrent.

**5. Un dispositif de revue conçu mais pas encore écrit** : règles passives `.claude/rules/` pour les réflexes FishNet/sécurité et les conventions C#, `REVIEW.md` pour calibrer le `/code-review` natif de Claude Code, et un subagent `security-auditor` en lecture seule pour les audits profonds.

### Ce qu'on a appris en chemin

**Un plugin peut imposer un outil qu'on n'avait pas prévu.** `unity-coding-skills` s'installe sans rien dire, mais ses skills `run-tests` et une partie de `fix-bug` passent par le serveur MCP intégré à Rider — inexistant sous Visual Studio. La dépendance ne se voit qu'en lisant les prérequis, pas à l'installation.

**Ce qui a fait basculer la décision n'est pas le plugin.** Le contournement existait (mode CLI batch d'Unity, piloté depuis Code, sans rien installer). C'est la comparaison Rider/VS sur le fond — refactoring, analyse statique, intégration Unity native — pesée pour un dev solo qui portera seul la maintenance, qui a tranché. Un plugin ne justifie pas un changement d'IDE ; une analyse statique deux fois plus dense sur dix ans de projet, oui.

**La gratuité de Rider a une date de péremption.** La licence non-commerciale couvre le développement en cours, pas un jeu vendu sur Steam. Coût futur identifié maintenant plutôt que découvert au lancement.

**Le journal de séances avait décroché.** Aucune entrée ici depuis le 2026-07-27, alors que le LOG en accumulait quatre pour la seule journée du 02/09. Le fichier censé porter le fil de reprise ne le portait plus — corrigé par cette entrée, et par une routine d'ouverture de session ajoutée aux prochaines étapes.

### Décisions produites

Six entrées au [[LOG - Décisions techniques]] datées du 2026-09-02 : répartition Code/Cowork, dépôt git du vault, Unity CLI en MCP, bascule d'IDE vers Rider, reprise du projet Unity à zéro, nouvelle conversation Claude Code dédiée.

### Prochaine séance

Le plan complet et ordonné vit dans [[BACKLOG - Points ouverts]], section « Prochaines étapes — reprise de session » : routine d'ouverture de session côté Cowork d'abord, puis installation et configuration de Rider, puis recréation du projet Unity propre, puis l'outillage Claude Code (`CLAUDE.md`, règles, `REVIEW.md`, subagent de revue), et les skills sur mesure en dernier.

**Deux arbitrages attendent le user avant de recréer le projet** : le sort du repo git actuel, et celui de `Assets/_Project/` — le code vocal existant (41 tests verts, YIN) mérite d'être rapatrié tel quel plutôt que réécrit, puisqu'il ne dépend pas du moteur.

---

## 2026-07-27 — Fondations documentaires et premier code vocal

**Objectif de départ :** finir la Partie 1 du GDD, et en profiter pour challenger les idées avant d'attaquer le développement.

### Ce qui a été fait

**1. Relecture de tout le corpus.** Les cinq `.docx` de `Note d'intention`, le GDD unifié, et le vault Obsidian. Le corpus contenait des idées fortes mais dispersées, et surtout **deux univers incompatibles** qui avaient dérivé l'un de l'autre sans qu'aucune décision ne soit écrite.

**2. Complétion de la Partie 1**, directement dans `PARTIE 1  LE PITCH (High Concept).docx`, en épousant son formatage existant. Ajouts : le corollaire du dilemme sonore au pilier Voice-Physics, le Sonomètre Réglementaire en 2.1, la sous-section « Le dilemme sonore » et « L'équité vocale » en 2.4.1, une note de design en 2.4.3 sur la portée du bruit, et le remplissage complet du §2.5 avec le Monte-meuble. Le §3.3 (architecture du projet) a été rempli en fin de séance, une fois le code posé.

**3. Un document de critique** — `CHALLENGE - Fondations du projet.md` — listant quatre points bloquants, quatre tensions et huit trous. Les quatre bloquants ont tous été tranchés dans la journée.

**4. Un export Markdown du GDD**, généré depuis le `.docx` avec sommaire cliquable. Le `.docx` reste la source ; le `.md` est un dérivé à régénérer après chaque modification.

**5. L'arborescence du code** sous `Assets/_Project`, avec quatre assemblies et un README expliquant le découpage à un lecteur extérieur.

**6. Le cœur du système vocal**, en deux lots :
- *Lot 1* — `VoiceFrame` (le contrat), `RawLoudness`, `LoudnessMeter`, `EnvelopeFollower`.
- *Lot 2* — `Decimator`, `PitchDetector` (algorithme YIN), `RawPitch`.

**41 tests unitaires, tous verts.** Compilés en netstandard2.1 — la cible d'Unity — et exécutés contre le `nunit.framework.dll` livré avec Unity 6000.3.18f1.

### Ce qu'on a appris en chemin

**Le dividende du `noEngineReferences` est arrivé le jour même.** Parce que `Voice.Core` ne référence pas Unity, tout le traitement du signal a pu être compilé et testé **sans ouvrir l'éditeur**. Ce n'était plus une promesse d'architecture, c'était 41 tests verts en deux secondes.

**Un test qui ne rate jamais ne teste rien.** Le garde-fou de surface publique a échoué à son premier essai — il a détecté des types publics non déclarés et affiché son message d'explication. Sa valeur a été prouvée par son échec.

**YIN est aveugle au volume.** Découvert en testant l'anti-repliement : le filtre de décimation atténue un sifflement à 7 900 Hz de **91 dB**, et pourtant l'algorithme déclare le résidu voisé à 100,0 Hz avec une confiance totale. Aucun filtre ne corrige cela. Conséquence actée dans le LOG : le voisement exige une porte de volume, qui vivra dans le `VoiceAnalyzer`. Sans elle, un frigo passerait pour une note. Le test a été réécrit pour figer ce comportement plutôt que pour le masquer.

**Une correction de rédaction dans le LOG.** L'entrée du 2026-07-05 décrivait une FFT côté serveur sur le flux Dissonance. C'était une erreur de rédaction — l'intention avait toujours été d'analyser en local — mais elle est devenue incompatible avec la décision de séparer les voies audio. L'entrée porte désormais sa mention de correction. Effet de bord bienvenu : **Dissonance sort du chemin critique.**

**Un plafond trop bas falsifie une mesure au lieu de la rendre prudente.** La plage de recherche du détecteur de hauteur devait s'arrêter à 400 Hz par prudence. Elle a été portée à 600 Hz : au-dessous, les cris et les rires — les sons mêmes qui font le jeu — auraient produit des erreurs d'octave *fabriquées par notre propre limite*.

**Un champ vide ment, un champ absent est honnête.** Formulé à propos de `RawMeasurement`, appliqué ensuite partout : les types ne portent que les champs que quelqu'un remplit vraiment.

### Décisions produites

Huit entrées au [[LOG - Décisions techniques]], toutes datées du 2026-07-27 : architecture du code, frontière brut/normalisé, où vit l'état, pas de champ vide, YIN, porte de volume, séparation des voies audio, portée du bruit non affichée. Plus la correction de l'entrée du 05/07.

Six points ajoutés au [[BACKLOG - Points ouverts]].

### Méthode de travail retenue

Échange point par point : proposer, attendre validation, traiter. Aucun code écrit sans accord préalable sur la logique. Commentaires rédigés pour un développeur débutant extérieur au projet. Qualité version finale dès le premier fichier — pas de prototype jetable, mais des valeurs de réglage sorties du code.

### Prochaine séance

**1. Un dépôt Git pour la documentation.** Aujourd'hui seul `Unity/Shut_up_and_carry/` est versionné ; le GDD et ce vault ne le sont pas du tout, alors qu'ils sont à ce stade les biens les plus précieux du projet. Direction retenue : **un dépôt dédié à la doc**, plutôt qu'un dépôt unique à la racine — pour garder le dépôt Unity léger. Reste à décider ensemble ce qui y entre : la doc pertinente et à jour, pas les archives. Plusieurs `.docx` de `Note d'intention` sont des notes brutes antérieures qui n'ont plus vocation à faire référence.

**2. Le `VoiceAnalyzer`.** L'unique porteur d'état de `Voice.Core` : il assemblera intensité et hauteur, appliquera la porte de volume, le filtre médian sur la hauteur et l'hystérésis sur le voisement, puis produira la `VoiceFrame`. C'est aussi le moment de mesurer le coût réel en microsecondes et de reconfirmer le zéro-allocation dans Unity.

### État du dépôt à la fin de la séance

Branche `feat/voice-core-analysis`, commit `e96ab0d`, poussée sur `origin`. Non fusionnée dans `main` — à relire avant intégration.

Point ouvert signalé mais non traité : `Assets/TutorialInfo/`, `Assets/Readme.asset` et les deux assets de rendu `Mobile_*` sont des restes du template URP. Les `Mobile_*` sont morts par la décision « PC / Steam uniquement » du 2026-07-06. Suppression à confirmer.
