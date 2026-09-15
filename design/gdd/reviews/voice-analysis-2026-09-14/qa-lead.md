# Revue adversariale — Acceptance Criteria de `voice-analysis.md`

**Document cible** : `design/gdd/voice-analysis.md` (AC-01…AC-44 + variantes)
**Comparé à** : `voice-analysis-2026-09-07.md`, `voice-calibration-2026-09-11.md`, `voice-object-effect-2026-09-14.md`, `ADR-0007`, `.claude/rules/design-docs.md`, code réel de `SUAC.Voice.Core`

---

## Statut des candidats fournis

### (1) AC-34 vs Formulas §2 — CONFIRMÉ, BLOQUANT

`Formulas §2` : « quand `Voiced` est faux, `VoiceFrame` force `Pitch` à 0. » — phrase explicite, avec justification (« un consommateur qui lit `Pitch` sans vérifier `Voiced` lit une valeur qui n'a pas de sens »).

`AC-34` : « son `F0` n'entre pas dans l'anneau, et `Pitch` conserve sa dernière valeur lissée — **il ne retombe pas à 0**. »

Ce sont deux comportements observables mutuellement exclusifs sur la même transition. Aucun `VoiceAnalyzer` ne peut satisfaire les deux tests à la fois — l'un des deux est nécessairement rouge. Fait aggravant : la revue précédente avait déjà repéré la question sœur (« `Pitch` court-circuité avant la porte, ou calculé-puis-masqué ? ») et l'avait classée *nice-to-have*, jamais tranchée. Elle a mûri en contradiction dure.

**Réécriture concrète** : trancher, pas patcher un des deux textes en silence.
- Si on garde la sémantique d'AC-34 (cohérente avec *Edge Cases* : « l'anneau gèle » sur non-voisement) : `Pitch` doit rester dérivé de la **dernière F0 acceptée dans l'anneau**, jamais forcé à 0 ; supprimer la phrase de Formulas §2 et la remplacer par « `Pitch` gèle sur sa dernière valeur voisée ; un consommateur doit lire `Voiced` pour savoir si cette valeur décrit l'instant présent. »
- Si on garde Formulas §2 : réécrire AC-34 en `Pitch = 0` et documenter le coût (perte du geste « ma voix garde sa hauteur entre deux syllabes »).
Les deux `Edge Cases` (gel de l'anneau) pointent vers la première option — c'est probablement l'erreur à corriger dans Formulas, pas dans AC-34.

### (2) AC-40 — CONFIRMÉ mais mal diagnostiqué dans l'énoncé, BLOQUANT

Le vrai défaut n'est pas que la fixture ne peut pas échouer « par construction » sur `Loudness` (elle le peut, `x = clamp(...)` colle `Loudness = 0` si `Rms_dB` reste sous `Floor_dB` — c'est correct par construction, pas un vice). Le vrai défaut est que **le critère teste le mauvais champ**. La promesse citée (« *Quand je me tais, mon objet cesse de réagir* ») porte sur ce que consomme le système 11 — `Loudness` — et ce document lui-même (AC-36) établit que `Loudness` **n'est pas** conditionné par `Voiced`. AC-40 n'affirme rien que sur `Voiced`, un état interne que le joueur ne voit jamais (*Visual/Audio Requirements* : « `Voiced` | Aucun [retour] »). Un `VoiceAnalyzer` bogué qui renverrait `Voiced = false` mais `Loudness = 0,3` sur exactement cette fixture — micro qui capte le clavier avec un `Floor_dB` mal calibré, par exemple — passerait AC-40 avec 100 % de vert **et casserait la promesse qu'AC-40 prétend garder**.

**Réécriture** :
```
AC-40 | GIVEN 30 s de bruit ambiant réel sous Floor_dB
      THEN Voiced = false ET Loudness = 0 sur 100 % des trames
      | [HUMAIN] puis [UNIT]
```
et ajouter un second témoin qui isole le champ que le système 11 lit réellement : un test unitaire injectant directement des `Rms_dB` juste sous `Floor_dB` (sans passer par la capture réelle) et vérifiant `Loudness == 0`, pour que la garantie ne dépende pas d'un fichier audio qui pourrait dériver.

### (3) ADR-0007 / AC-14 — CONFIRMÉ, BLOQUANT (critère fantôme, pas juste du texte périmé)

Vérifié contre `docs/architecture/adr-0007-analysis-cadence-explicit-delta-time.md`, `Accepted`, élargi le 2026-09-08 à cinq éléments dépendants du temps. Sa section *Validation Criteria* liste explicitement trois choses :
> « AC-14 — [...] à cadence nominale. **Le nouveau test de cadence variable ci-dessus** [étape 3 du *Migration Plan*]. AC-42b — [...] »

Le « nouveau test de cadence variable » n'a **aucun identifiant AC** dans `voice-analysis.md`. Ce n'est pas juste la prose des *Trois cas difficiles* qui est restée en l'état (« AC-14 ne devient un filet qu'après ce changement ») — c'est un critère que l'ADR lui-même exige et que le GDD n'a jamais ajouté. C'est exactement le trou « aucun critère ne teste ADR-0002 » trouvé dans la revue système 11, ici sur ADR-0007.

Vérifié aussi contre le code : `EnvelopeFollower.cs` prend encore `updateRateHz` **au constructeur** (`CoefficientFor` appelé une fois), sans paramètre `deltaTime` par appel. L'étape 1 du *Migration Plan* (« Modifier `EnvelopeFollower` pour accepter l'intervalle par appel ») n'est pas faite — cohérent avec le compte « 41 tests verts, rien ne produit de `VoiceFrame` » du document, mais ça veut dire qu'AC-14 tel qu'écrit ne peut aujourd'hui être vérifié que dans l'ancien régime (cadence fixe au constructeur), pas dans le régime que l'ADR impose.

**Ajout concret** :
```
AC-14e | GIVEN la même séquence d'échelons injectée à deux cadences différentes et valides
       (ex. dt = 10, 20, 40 ms) THEN le temps de montée en dB reste conforme à la constante
       déclarée (± 10 %) dans les deux cas — les coefficients sont recalculés à partir de
       DeltaSeconds, jamais figés à la construction | [UNIT]
```
Secondaire (RECOMMANDÉ) : `Formulas §4` définit `N` comme un `int` (compte), alors que l'amendement d'ADR-0007 classe la fenêtre de jitter parmi les éléments à réexprimer en secondes. À clarifier : `N` porte-t-il sur des **trames d'analyse** (dépendant de la cadence, donc concerné par l'ADR) ou sur des **périodes acceptées** (indépendant de la cadence, cadré uniquement par `SampleRate`) ? Le document ne le dit pas, et les deux lectures ont des implications de test différentes.

### (4) « Dix valeurs » — CONFIRMÉ, deux défauts de comptage distincts, BLOQUANT

**a) Comptage périmé dans *Formulas*.** La section *Formulas* (« ⚠️ Porte de mesure — ces valeurs ne sont pas validées ») dit encore « **Les cinq valeurs marquées PROVISOIRE** ». Cette phrase date d'avant la révision du 2026-09-07, qui a ajouté quatre valeurs (`HardFloor_dB`, `QualityBand_dB`, attaque, relâchement) — la section *Acceptance Criteria* (I) et OQ-4 disent toutes deux « dix », correctement. C'est le même défaut « dix / quatorze » que la revue système 6 a trouvé dans `voice-calibration.md`, non corrigé ici.

**b) `N` (fenêtre de jitter) est une onzième valeur orpheline.** `N` porte `PROVISOIRE 4` dans *Formulas §4* et dans *Tuning Knobs*, exactement au même titre que `γ` ou `Margin_dB`. Il n'apparaît **ni** dans la liste des « dix » de la section I, **ni** dans l'ancienne liste des « cinq » de *Formulas*. Conséquence directe : **AC-43 ne le couvre pas.** Un littéral `4` dupliqué ailleurs dans l'assembly pour ce paramètre ne serait détecté par aucun test — le filet que AC-43/44 prétend tendre a un trou nommé.

**Réécriture** : dans *Formulas §"Porte de mesure"*, remplacer « cinq » par « dix » (ou fusionner ce paragraphe avec la liste de la section I pour n'avoir qu'une seule liste de référence, comme demandé pour CAL-39). Ajouter `N` à la liste et la faire passer à **onze**, ou justifier explicitement pourquoi `N` en est exclu (aucune raison trouvée dans le texte).

### (5) AC-21 — CONFIRMÉ, même défaut que CAL-24, BLOQUANT

Le document se contredit lui-même sur ce point précis : la sous-section *Conséquence d'implémentation* affirme noir sur blanc « **Sans cette règle écrite, AC-21, AC-41b et CAL-24 ne sont pas testables — ils décrivent une garantie dont personne ne connaît le mécanisme.** » La règle est maintenant écrite (1. le fil de calibration publie une référence ; 2. le fil d'analyse la lit en tête de trame et reconstruit ; 3. aucune trame pendant la reconstruction). Mais **AC-21 n'a pas été réécrit** pour tester cette règle structurelle — il reste phrasé comme une propriété d'exécution observée (« aucune trame ne combine... »), soit exactement le anti-pattern relevé sur CAL-24 (« tester la structure, pas une course de threads »).

**Réécriture concrète**, en trois critères structurels remplaçant AC-21 :
```
AC-21a | GIVEN le type VoiceProfile THEN tous ses champs sont en lecture seule
       (vérifié par réflexion) — c'est ce qui rend sa publication par affectation
       de référence atomique sans verrou | [UNIT]
AC-21b | GIVEN le chemin de commit THEN la nouvelle référence est publiée par
       Interlocked.Exchange (ou équivalent), et le chemin de lecture par
       Volatile.Read — vérifié par inspection du code, pas par une course de fils | [UNIT]
AC-21c | GIVEN une référence de profil qui a changé, détectée en tête de trame
       THEN Decimator et PitchDetector sont reconstruits AVANT toute trame non-Silence,
       et la trame produite pendant la reconstruction est VoiceFrame.Silence | [UNIT]
```
AC-21c comble au passage un trou de couverture nommé plus bas (règle 3, actuellement sans aucun critère).

---

## Constats supplémentaires (« ALSO EXAMINE »)

### 6 — AC-24 duplique un territoire déjà cédé au système 6 — RECOMMANDÉ

Ce document a explicitement migré *UI Requirements* vers `voice-calibration.md` (« ce système n'a pas d'interface »), avec la justification que c'est de la responsabilité du système 6. AC-24 (« la calibration est atteignable depuis les menus lobby et en jeu ») est un critère de navigation menu — exactement le type de contenu migré. Il est resté en arrière dans la section *Acceptance Criteria* du système 1 sans être migré avec le reste. **Action** : déplacer AC-24 vers `voice-calibration.md` (vérifier d'abord qu'il n'entre pas en conflit avec un CAL-xx existant sur le même sujet), ou le remplacer ici par un renvoi explicite.

AC-22 (persistance inter-sessions) et AC-23 (porte de join) posent la même question à un degré moindre : la persistance est explicitement attribuée au système 6 dans *Dependencies* (« OQ-10... Système 6 »), et la porte de join ressemble à une responsabilité du système de lobby (8), non nommé ici. Pas de contradiction trouvée avec un CAL-xx existant, donc pas bloquant — mais à vérifier au moment de la passe groupée 1/6/11, pour éviter que deux documents testent la même règle avec des mots différents et dérivent l'un de l'autre (le défaut exact qui a produit « dix/quatorze » dans le système 6).

### 7 — AC-20b : « échantillons valides » n'est défini nulle part — CONFIRMÉ, BLOQUANT

`AC-20b` conditionne la sortie de `Degraded` sur « des échantillons **valides** » qui reviennent, mais aucune formule, aucune règle et aucun *Edge Case* de ce document ne dit ce qui rend un échantillon valide plutôt qu'invalide. C'est un prédicat sans domaine ni témoin — exactement la classe de défaut que la règle de *reachability* du 2026-09-14 cible, sauf qu'ici ce n'est pas un seuil numérique mais une porte booléenne sans définition. Un testeur ne peut pas construire de fixture « échantillons invalides revenus » vs « échantillons valides revenus » sans deviner.

Remarque structurelle : l'entrée dans `Degraded` est déclenchée par un **événement de périphérique** (coupure, changement), pas par le contenu du signal — la sortie devrait logiquement être symétrique (« Audio d'entrée signale la reprise de capture »), pas une propriété du signal lui-même. Tel qu'écrit, AC-20b laisse croire qu'il existe un filtre de qualité sur les échantillons revenants, ce qui contredirait le principe des seuils personnels (aucune constante ne doit juger la voix) si on l'interprétait ainsi.

**Réécriture** :
```
AC-20b | GIVEN Degraded WHEN Audio d'entrée signale la reprise de capture
       (indépendamment du contenu — silence inclus) THEN l'état repasse Calibrated
```

### 8 — Aucun critère sur la transition `Uncalibrated → Calibrated` en l'absence d'échantillons — MINEUR

La table des transitions déclenche cette transition sur « profil reçu » seul, sans dépendance aux échantillons — contrairement à `Degraded → Calibrated`, où le document distingue soigneusement profil reçu (ne suffit pas) et échantillons reçus (suffit). Aucun AC ne vérifie le cas asymétrique : profil reçu alors qu'aucun échantillon n'est encore arrivé (démarrage à froid, écran de chargement). Pas bloquant en soi, mais une inspection manquée dans une zone où le document a déjà montré qu'il pouvait se tromper sur des transitions d'état.

### 9 — Edge Cases : « profil invalide... reçu du réseau » est maintenant une branche morte — CONFIRMÉ, à corriger dans la passe groupée (déjà tracké)

Vérifié contre `voice-object-effect-2026-09-14.md`, arbitrage (f) : seul le scalaire `L_repos` part vers l'hôte ; **le `VoiceProfile` complet ne quitte jamais la machine**, résolution qui contredit et remplace l'ancienne lecture d'ADR-0003. La phrase d'*Edge Cases* de ce document — « chargé du disque, **reçu du réseau**, corrompu » — cite un canal désormais irréalisable pour un profil complet. AC-28 lui-même reste correct (formulé génériquement, sans mentionner le réseau), donc pas de faux positif de test, mais la prose justificative est fausse et doit être retirée. Déjà signalé dans ma mémoire de projet comme en attente de la passe groupée 1/6/11 — je le confirme ici avec la citation exacte à corriger.

### 10 — AC-31 : reachability — RÉFUTÉ (le critère est atteignable)

`médiane × 2 > 600 Hz` exige `médiane > 300 Hz`. La détection non calibrée cherche déjà dans `70–600 Hz` (défaut), donc une médiane de calibration à ~300–350 Hz est mesurable avec les réglages par défaut — témoin concret : un enfant ou une voix de soprano aiguë avec `F0_habituel ≈ 350 Hz`. Le critère est donc atteignable sans changement. Pas de défaut ici, contrairement à l'hypothèse du candidat.

### 11 — AC-35 dans la table canonique sans marqueur — CONFIRMÉ, BLOQUANT, récidive du défaut CAL-04

Le document dit lui-même, deux fois (« Ce que ces critères ne couvrent pas » et *Tuning Knobs*), qu'AC-35 « est écrit mais non exécutable tant que le curseur reste "à définir" ». Pourtant la table de la section F le liste comme un `[UNIT]` ordinaire, sans aucune marque distinctive. C'est exactement le défaut relevé sur CAL-04 dans la revue système 6 (« non exécutable dans la table canonique : le retirer ou le marquer EN ATTENTE ») — non corrigé ici alors que le principe était déjà établi la semaine précédente.

**Réécriture** : `AC-35 | [UNIT] — EN ATTENTE (bloqué sur OQ-6, TTL non défini)`, ou sortir la ligne de la table canonique et la lister à part avec les critères différés.

### 12 — Trou de couverture : le verrou de surface publique n'a pas de critère — CONFIRMÉ, BLOQUANT

Le document répète à plusieurs endroits que la surface publique de `Voice.Core` est verrouillée (`{ VoiceFrame }` → `{ VoiceFrame, VoiceProfile }` → `{ VoiceFrame, VoiceProfile, AnalyzerState }`, ADR-0004) et insiste : « la règle d'ADR-0004 n'est pas relâchée, sa liste blanche s'allonge ». C'est la garantie la plus répétée de tout le document. Aucun AC ne la teste. Un test d'inspection est trivial à écrire, sur le même modèle qu'AC-43 (inspection statique).

**Ajout concret** :
```
AC-XX | GIVEN l'assembly SUAC.Voice.Core THEN les seuls types publics visibles
       de l'extérieur sont VoiceFrame, VoiceProfile et AnalyzerState — aucun autre
       (RawLoudness, RawPitch, EnvelopeFollower, Decimator, PitchDetector restent
       internal) | [UNIT] par inspection de l'assembly
```

### 13 — Le multiplicateur `LowRange ×1,5` n'a aucun critère — CONFIRMÉ, BLOQUANT

*Tuning Knobs* introduit un contrat concret et chiffré (« l'`EnvelopeFollower` doit alors multiplier ses constantes d'attaque et de relâchement par un facteur PROVISOIRE ×1,5, borné 1,2–2,5 ») et avertit lui-même du risque : « Sans cela le drapeau est décoratif [...] et l'inclusion qu'on croyait avoir gagnée reste sur le papier. » Aucun AC ne vérifie que ce facteur est effectivement appliqué, ni **où** il s'applique dans le pipeline — un détail qui compte : le multiplicateur doit s'appliquer aux **constantes de temps en secondes** avant leur conversion en coefficient (`CoefficientFor`), jamais au coefficient résultant lui-même (la relation `coefficient = exp(-1/(τ·rate))` n'est pas linéaire en `τ`, multiplier le coefficient par 1,5 ne produirait pas un lissage 1,5× plus lent).

**Ajout concret** :
```
AC-XX | GIVEN un profil marqué LowRange THEN les constantes d'attaque et de
       relâchement passées à l'EnvelopeFollower sont celles du profil multipliées
       par le facteur LowRange (lu depuis sa constante nommée) — la multiplication
       porte sur les secondes, jamais sur le coefficient déjà calculé | [UNIT]
```

### 14 — AC-38 : bande d'accord de forme, retenue mais toujours pas écrite — SUIVI, pas nouveau

La revue du 2026-09-07 a accepté la substance de la proposition qa-lead (une bande d'accord de forme, puisque monotone + non-croisant est purement ordinal et laisse passer des pentes très différentes) et l'a mise en *Reste ouvert* (#4). Le texte actuel d'AC-38 n'a pas changé. Ce n'est pas un nouvel oubli — c'est un engagement pris et pas encore honoré. À rappeler au moment de figer `γ`, puisque ce protocole est listé comme bloquant *avant* de figer `γ` (« `[HUMAIN]` — bloquant avant de figer `γ` »).

---

## Statut des items qa-lead de la revue du 2026-09-07

| Item | Statut vérifié |
|---|---|
| Blanchiment de constantes (AC-01/04/25) | **Appliqué** — règle « le test dérive sa valeur attendue » écrite en tête de section A, confirmée à la lecture |
| Sortie de `Degraded` | **Appliqué** — AC-20/20b présents et cohérents entre eux ; **mais** j'ai trouvé un défaut dérivé non couvert par la revue d'origine : AC-20b repose sur un prédicat (« échantillons valides ») jamais défini (constat #7 ci-dessus) |
| AC-38 bande de forme | **Accepté en principe, non encore écrit** — toujours listé en *Reste ouvert* #4, texte d'AC-38 inchangé (constat #14) |
| AC-40 diversité de fixtures | **Rétrogradé en backlog, non bloquant, décision assumée** — correct tel quel. **Mais** j'ai trouvé un défaut distinct et plus grave sur ce même critère, non repéré par la revue d'origine : il teste le mauvais champ (constat #2, candidat confirmé) |

---

## Verdict : NON livrable tel quel à un programmeur écrivant `VoiceAnalyzer`

L'architecture et les formules restent saines — même diagnostic que sur les deux documents frères cette semaine : ce n'est pas à reconcevoir, c'est un **défaut d'atteignabilité et de cohérence interne à corriger avant l'implémentation**, concentré sur exactement les points où le document se cite lui-même sans se corriger (AC-21/AC-41b, AC-35, la porte de mesure) ou cite un ADR sans finir le travail que cet ADR exige (AC-14). Sur onze constats, quatre sont des critères manquants purs (règle 3 du swap de profil, verrou de surface, câblage de `LowRange`, test de cadence variable d'ADR-0007) — un `VoiceAnalyzer` écrit en suivant fidèlement la table actuelle des Acceptance Criteria passerait tous ses tests tout en violant au moins trois garanties que le document présente ailleurs comme non négociables.

**Avant d'écrire le `VoiceAnalyzer`** : trancher Formulas §2 vs AC-34 (contradiction dure, aucun code ne peut satisfaire les deux) ; réécrire AC-21 en critères structurels ; ajouter les quatre critères manquants ci-dessus ; corriger le compte « cinq » et le trou `N` dans la porte de mesure ; marquer AC-35 `EN ATTENTE`. Le reste (AC-24 mal placé, prose « réseau » périmée, AC-38 en attente) peut suivre la passe groupée 1/6/11 déjà planifiée sans bloquer le code.

**Fichiers de référence** :
- `C:\Users\camus\02_PROJETS\Shut_up_and_carry\suac_fullIA\design\gdd\voice-analysis.md`
- `C:\Users\camus\02_PROJETS\Shut_up_and_carry\suac_fullIA\docs\architecture\adr-0007-analysis-cadence-explicit-delta-time.md`
- `C:\Users\camus\02_PROJETS\Shut_up_and_carry\suac_fullIA\Unity\Shut_up_and_carry\Assets\_Project\Runtime\Voice.Core\Analysis\EnvelopeFollower.cs`
- `C:\Users\camus\02_PROJETS\Shut_up_and_carry\suac_fullIA\design\gdd\reviews\voice-analysis-2026-09-07.md`
- `C:\Users\camus\02_PROJETS\Shut_up_and_carry\suac_fullIA\design\gdd\reviews\voice-calibration-2026-09-11.md`
- `C:\Users\camus\02_PROJETS\Shut_up_and_carry\suac_fullIA\design\gdd\reviews\voice-object-effect-2026-09-14.md`