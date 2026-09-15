# Revue adversariale — Analyse vocale (système 1), section H Budget

**Rôle** : performance-analyst · **Cible** : `design/gdd/voice-analysis.md` (1441 lignes)
**Focus** : section H Budget (AC-41/41b/42/42b), Edge Cases (bascule de profil, flush dénormal),
Tuning Knobs (décimation 8/12 kHz)
**Lu** : `.claude/docs/technical-preferences.md`, `docs/architecture/adr-0003*.md`,
`adr-0007*.md`, `adr-0008*.md`, code sous `Unity/.../Runtime/Voice.Core/`,
`design/gdd/reviews/voice-analysis-2026-09-07.md`, `voice-calibration-2026-09-11.md`,
`voice-object-effect-2026-09-14.md`

---

## (1) La contestation « un seul analyseur par client » — correcte, ne pas rouvrir

ADR-0003 est sans ambiguïté (« chaque client analyse son propre micro sur le signal brut, en
local, et ne transmet à l'hôte que des features ») et le contexte de cette revue le confirme
(2–4 joueurs, un `VoiceAnalyzer` par client). **La contestation est fondée.**

Ses conséquences dans la section H sont **partiellement** bien écrites :
- « Le coût de l'analyse ne dépend pas de la taille de la partie » — correct.
- « Le pire cas nominal est un joueur à voix aiguë, pas une partie pleine » — correct comme
  principe.
- Le chiffrage qui en découle (**~2,25×**) est **faux**. Voir Finding 2.

---

## Finding 2 — BLOQUANT : le facteur « ~2,25× » ne correspond pas au code réel de `PitchDetector`/`Decimator`

**Affirmation du document** (`voice-analysis.md` ligne 1121, répétée dans `adr-0007-...md`
ligne 249) : *« YIN étant en O(fenêtre²), une fenêtre une fois et demie plus longue coûte
environ 2,25 fois plus cher. »*

**Ce que dit le code** (`PitchDetector.cs` lignes 172-189, `ComputeDifference`) : la boucle
externe parcourt `lag = 1..maxLag`, la boucle interne `j = 0..windowSize-1`. La complexité
réelle est **O(windowSize × maxLag)**, pas O(windowSize²). `maxLag = SampleRate / minHz`
(ligne 121) est fixé par la **borne basse de la plage de recherche**, pas par la taille de
fenêtre — les deux ne sont liées que si `minHz` reste constant quand la cadence de décimation
change, ce qui n'est **pas** le cas ici : après calibration, la plage se resserre à
`[médiane/2, médiane×2]` (GDD ligne 127), donc `minHz` **croît avec la médiane du joueur**,
et un joueur à voix aiguë a justement une médiane plus haute.

**Recalcul, avec les hypothèses écrites** (SR brut 48 kHz, fenêtre RMS 21 ms → 1008
échantillons, fenêtre pitch 46 ms, `Decimator` à 81 taps confirmés ligne 568) :

| Configuration | `Decimator` (MAC) | `PitchDetector.ComputeDifference` (flops) | Total approx. |
|---|---|---|---|
| 8 kHz, plage par défaut/voix grave clampée `[70, médiane×2]` (`maxLag=⌈8000/70⌉=115`, fenêtre 368 éch.) | 368×81=29 808 MAC ≈ 59 600 flops | 115×368×3 ≈ 127 000 flops | **≈ 191 000 flops** |
| 12 kHz, voix aiguë **frontière** médiane=300 Hz, plage `[150,600]` (`maxLag=⌈12000/150⌉=80`, fenêtre 552 éch.) | 552×81=44 712 MAC ≈ 89 400 flops | 80×552×3 ≈ 132 500 flops | **≈ 226 400 flops → ×1,19** |
| 12 kHz, voix aiguë médiane=450 Hz, plage `[225,900]` (`maxLag=⌈12000/225⌉=54`) | même Decimator ≈ 89 400 flops | 54×552×3 ≈ 89 400 flops | **≈ 183 400 flops → ×0,96** |

Le ratio réel se situe entre **0,96× et 1,19×**, jamais 2,25×. Deux erreurs dans le
raisonnement du document : (a) le modèle O(fenêtre²) suppose `maxLag` proportionnel à la
fenêtre, ce que le code ne fait pas ; (b) c'est le **`Decimator`** (FIR à 81 taps), pas YIN,
qui porte la plus grosse part de l'écart réel. Le tableau ci-dessus révèle même qu'un joueur
grave clampé à 70 Hz en 8 kHz peut coûter **plus cher en YIN seul** (115×368) qu'un joueur
aigu à la frontière 12 kHz (80×552) — le « pire cas » nominal du document n'est peut-être pas
le bon, une fois le `Decimator` mis de côté.

**Fix concret** : corriger le chiffre dans `voice-analysis.md` (ligne 1121) et
`adr-0007-analysis-cadence-explicit-delta-time.md` (ligne 249) — les deux portent la même
erreur. Remplacer par le ratio dérivé (≈1,1-1,2×, à confirmer par mesure) et attribuer
explicitement une part de l'écart au `Decimator`. Ce chiffre n'étant pas mesuré, il devrait
rejoindre la liste des dix valeurs provisoires d'AC-43/44, ou à défaut être marqué comme tel.

**Protocole de mesure** : test de performance (`Stopwatch`, boucle de chauffe identique à
AC-41) sur trois configurations — 8 kHz plage par défaut/grave-clampée, 12 kHz frontière
(médiane 300 Hz), 12 kHz haut de plage (médiane 450 Hz) — exécuté en CI sur une machine de
référence pour détecter toute régression.

---

## Finding 3 — RECOMMANDÉ : estimation de performance complétée (comble le ~30 % signalé par la revue précédente)

Le tableau du Finding 2 chiffre l'intégralité de la chaîne (RMS/pic 21 ms, `Decimator`,
`PitchDetector`), pas seulement YIN. Éléments négligeables mais réels, à ne pas oublier dans
le budget documenté :
- Normalisation cumulée (`ComputeNormalizedDifference`), recherche du creux, interpolation
  parabolique : O(maxLag), quelques centaines de flops.
- Anneau médian (5), test de jitter (N=4) : O(1) à O(N), négligeable.
- Conversions dB/`Pow`/`log2` (Loudness, Pitch, Continuity) : ~4 appels de fonctions
  transcendantes par trame. Chaque appel `Math.Log10`/`Math.Pow`/`Math.Log` coûte
  significativement plus cher **par appel** qu'une opération arithmétique de boucle (ordre de
  20-50 ns sur du code managé) — négligeable en absolu ici, mais c'est un poste que le modèle
  « flops de boucle » sous-estime structurellement, à garder en tête si d'autres formules
  transcendantes s'ajoutent plus tard.

**Ordre de grandeur, avec hypothèses explicites** — CPU de bureau milieu de gamme, code C#
scalaire (pas de vectorisation automatique, la chaîne n'est pas en Burst d'après ADR-0003) :

| Hypothèse de débit | 8 kHz (≈191 000 flops) | 12 kHz frontière (≈226 000 flops) |
|---|---|---|
| 1 GFLOP/s (Mono / éditeur, pessimiste) | ~191 µs | ~226 µs |
| 3 GFLOP/s (IL2CPP Release, boucle scalaire) | ~64 µs | ~75 µs |
| 5 GFLOP/s (optimiste, working-set en cache L1) | ~38 µs | ~45 µs |

**Conclusion** : le calcul DSP pur se situe très probablement entre **quelques dizaines et
~200 µs par trame**, soit 5 à 25× sous le budget de 1 ms. Ce n'est pas une mesure — c'est un
ordre de grandeur qui doit être validé par le profilage sur cible d'AC-42 (`[HUMAIN]`). Mais
il a une conséquence directe : **si le calcul lui-même est si loin sous le budget, ce que le
budget protège réellement n'est probablement pas le calcul.** Voir Finding 4.

---

## Finding 4 — BLOQUANT : AC-42 mesure l'instance seule, jamais sous charge partagée — le risque réel est caché

**Ce qui est écrit** (ligne 1125-1127) : *« Ce que le budget de 1 ms/frame doit couvrir n'est
pas le calcul mais la remise de la `VoiceFrame` au thread principal. »* Une remise d'une
`readonly struct` de ~20 octets (`VoiceFrame.cs`) au thread principal est de l'ordre de la
centaine de nanosecondes dans n'importe quelle implémentation lock-free raisonnable — tester
**ça** contre 1 ms n'est pas un test qui peut échouer.

**Le vrai risque, absent du document** : sur la machine du joueur tournent simultanément,
sur les mêmes cœurs — 2 à 4 joueurs, un PC de joueur, pas un serveur —
1. Dissonance (capture + encodage Opus, sur **son propre thread audio**),
2. FMOD (mixage/spatialisation, y compris la lecture des voix des coéquipiers),
3. FishNet/FishyFacepunch (I/O réseau P2P Steam),
4. et, côté hôte, le système 11 qui recalcule la charge par objet porté, par tick.

AC-42 tel qu'écrit (« **un** analyseur sur le profil de charge nominal ») **isole la
variable** — bonne pratique pour *attribuer* un coût, mauvaise pratique pour *valider
l'absence de saccade en jeu réelle*. Un test qui capture le coût de `VoiceAnalyzer` seul,
profileur en main, sur une scène vide, peut passer avec une marge confortable (Finding 3) et
ne rien dire de ce qui se passe quand l'encodeur Opus et le graphe de mixage FMOD tournent
sur le même cœur physique au même instant.

**Fix concret** : ajouter un second scénario à AC-42 — « profil de charge nominal **complet**
» : 4 sessions Dissonance actives (capture + 3 flux entrants décodés), FMOD en lecture
spatialisée, trafic FishNet représentatif, système 11 actif sur plusieurs objets portés —
et re-mesurer (a) le coût CPU de la chaîne DSP, (b) la latence bout-à-bout capture →
`VoiceFrame` disponible, (c) tout dépassement de deadline audio (voir Finding 5). Sans ce
second scénario, AC-42 valide un cas qui n'arrivera jamais en jeu.

---

## Finding 5 — BLOQUANT : modèle de fils d'exécution non tranché — deadline temps réel vs latence de file d'attente, deux régimes de panne incompatibles

Le document affirme « l'analyse ne tourne pas sur le thread principal » (ligne 1125) sans dire
**sur quel thread**. ADR-0007 (Alternative 3, lignes 199-204) discute de faire tourner
l'analyse « sur le thread audio, avec sa propre horloge » et la retient « partiellement » —
mais rejette seulement l'idée de s'appuyer sur `OnAudioFilterRead` comme **source d'horloge**,
sans jamais trancher si l'analyse **s'exécute** dans ce contexte ou sur un worker séparé
alimenté par un tampon.

Ce sont deux régimes de panne incompatibles, et le document n'en traite aucun explicitement :

- **Si la chaîne tourne dans `OnAudioFilterRead`** : c'est un contexte temps réel dur. Deadline
  = taille de tampon DSP / 48 kHz — **10 ms à 480 échantillons, 21,3 ms à 1024** (donnés dans
  la tâche). Un dépassement ne « saute » pas une trame comme une frame vidéo manquée : il
  corrompt le tampon envoyé à la carte son, produisant un artefact audible **pour tout le son
  du jeu**, pas seulement pour la voix. Avec ~100-200 µs de calcul (Finding 3), la marge est
  large **isolément** — mais rien n'est dit sur le partage de ce même callback avec
  l'encodeur Opus de Dissonance et le mixage FMOD (Finding 4), ni sur le comportement en cas
  de dépassement (glitch silencieux ? trame ignorée ? aucune règle écrite).
- **Si la chaîne tourne sur un worker dédié** : pas de deadline dur, mais une **latence de
  planification** ajoutée (réveil de thread, contention avec le thread audio de Dissonance et
  le thread réseau de FishNet), qui n'a **aucune borne écrite**. Voir Finding 6 pour ses
  conséquences sur les 350 ms du système 11.

**Fix concret** : trancher explicitement lequel des deux modèles est retenu, écrire la
deadline et le comportement de dépassement pour ce modèle précis, et si c'est le worker,
borner la latence de planification (percentile visé, méthode de mesure).

---

## Finding 6 — BLOQUANT : aucun budget de latence bout-à-bout ne relie la chaîne d'analyse aux 350 ms du système 11

Le document ne budgète que du **coût CPU** (µs/trame). Il ne budgète jamais la **latence**
(délai horloge murale entre l'instant du son et l'instant où la `VoiceFrame` normalisée est
disponible) — or c'est cette latence, pas le coût CPU, qui mange le budget d'avertissement à
350 ms du système 11 (`voice-object-effect-2026-09-14.md`, review C1/E1).

Estimation grossière de la latence **structurelle** (indépendante de toute contention) :
- Fenêtre pitch : 46 ms (le résultat n'existe qu'une fois la fenêtre remplie)
- Groupe de délai du FIR `Decimator` (81 taps) : ≈ 40 échantillons à 48 kHz ≈ 0,83 ms — négligeable
- Attaque de l'`EnvelopeFollower` : 10-20 ms (PROVISOIRE) avant que le lissage suive un cri
- Anneau médian pendant l'amorçage : jusqu'à ~4 trames supplémentaires avant stabilisation (~80 ms au pire, cf. ligne 441-443 sur le coût du jitter à l'amorçage)
- Cadence réseau 20-30 Hz (système 5) : 33-50 ms de plus avant que l'hôte voie la trame
- Tick hôte du système 11 : non spécifié ici, mais s'ajoute

Somme structurelle plausible **avant toute contention CPU** : de l'ordre de **80 à 150 ms**,
soit 23 % à 43 % du budget de 350 ms — et cela n'inclut aucune latence de planification de
thread (Finding 5) ni congestion réseau. Aucun document ne fait cette addition.

**Fix concret** : ajouter un critère de latence bout-à-bout explicite (p50/p95/p99, mesuré par
horodatage propagé de la capture jusqu'à la consommation par le système 11), budgété comme une
fraction nommée des 350 ms — pas seulement un coût CPU en µs/trame. C'est exactement le genre
de vérification inter-systèmes que la règle « disponibilité des données consommées » du
2026-09-14 demande.

---

## Finding 7 — BLOQUANT : AC-41b ne tranche rien, donc n'est pas testable

**Texte actuel** (ligne 1132) : *« une bascule de profil à chaud... est explicitement dans ou
hors du périmètre d'AC-41 »* — c'est une exigence que le document **se pose la question**, pas
une assertion vérifiable. `coding-standards.md` du projet est explicite : *« Acceptance
criteria must be testable — a QA tester must be able to verify pass/fail »*. Un testeur lisant
AC-41b ne peut rien vérifier tant que le choix (dans ou hors) n'est pas écrit.

Or la réponse découle du reste du document : la reconstruction de `Decimator` (nouveaux
`float[]` pour `_taps`/`_history`, ligne 96-98) et `PitchDetector` (`_difference`/`_normalized`,
lignes 131-132) **alloue nécessairement** — c'est déjà noté ligne 578 (« ces objets sont à
état »). La bascule doit donc être **explicitement hors** du périmètre zéro-allocation d'AC-41,
avec une borne positive à la place : nombre et taille exacts des tableaux alloués, une seule
fois par bascule, jamais de manière répétée.

**Conséquence croisée avec Finding 5** : si le modèle retenu est « analyse dans le callback
audio temps réel », alors **toute allocation dans ce contexte est une violation de sûreté
temps réel** (un GC déclenché en plein `OnAudioFilterRead` peut geler tout le pipeline audio
du jeu, pas seulement la voix) — pas seulement un problème de test mal formulé. La règle des
Edge Cases (ligne 576, « le fil qui commite ne doit jamais y toucher ») protège contre la
concurrence, mais rien ne protège contre l'allocation **sur le fil temps réel lui-même**.

**Fix concret** : (a) trancher AC-41b — hors périmètre, borné explicitement ; (b) si Finding 5
retient le callback audio, ajouter une règle : la reconstruction doit être **différée** hors du
contexte temps réel (ex. drapeau consommé au prochain passage sur un worker), jamais exécutée
en ligne dans le callback.

---

## Finding 8 — RECOMMANDÉ : comportement du GC (Mono vs IL2CPP, GC incrémental) non spécifié — durée du gel de bascule non bornée

La méthodologie d'AC-41 (boucle de chauffe + `GC.Collect()` avant la fenêtre mesurée) est
correcte pour l'état stable, mais ne dit rien du comportement **au moment de la bascule**. Le
projet cible PC/Steam, ce qui implique très probablement **IL2CPP** en build de release (Mono
n'étant pertinent qu'en éditeur) — ce choix de backend n'est écrit nulle part dans ce document
ni dans les ADR liés, alors qu'il détermine le comportement du GC (Boehm par défaut sous
IL2CPP, avec un mode incrémental disponible mais à activer explicitement dans les Player
Settings).

Le coût de l'allocation elle-même est trivial (quelques centaines d'octets, Finding 7). Le
risque est un **passage de collecte** déclenché par cette allocation, dont la durée n'est pas
bornée par le texte actuel : ligne 576 dit seulement « aucune trame n'est produite pendant la
reconstruction : elle renvoie `Silence` », sans dire combien de trames au pire cas. Si un GC
non incrémental se déclenche à ce moment, le nombre de trames de silence produites pourrait
dépasser largement l'unique trame implicite dans le texte.

**Fix concret** : nommer le backend cible (IL2CPP), exiger le GC incrémental en Player
Settings comme prérequis de ce système, et borner explicitement (par un test, pas seulement
par une phrase) le nombre maximal de trames `Silence` produites par une bascule de profil.

---

## Finding 9 — RECOMMANDÉ : le compteur `ProfilerRecorder` d'AC-42b ne peut pas vivre dans `SUAC.Voice.Core`

`SUAC.Voice.Core.asmdef` porte `"noEngineReferences": true` (ligne 13, vérifié dans le
fichier). `Unity.Profiling.ProfilerRecorder` et `ProfilerCounterValue<T>` sont des types du
namespace `Unity.Profiling`, livrés par `UnityEngine.CoreModule` — une assembly
`noEngineReferences` **ne peut pas les référencer**, point de compilation, pas de nuance.

AC-42b (ligne 1134) dit *« un compteur `ProfilerRecorder` expose en continu le coût par
instance »* sans dire où ce compteur vit. Si quelqu'un l'implémente littéralement dans
`Voice.Core`, ça ne compile pas.

**Fix concret** : `Voice.Core` expose la mesure sous forme de donnée CLR pure — un
`Stopwatch`/`long` en ticks pour le coût, et l'écart au nominal déjà porté par
`AnalysisTiming` (ADR-0007). C'est **`SUAC.Voice.Capture`** — qui, selon ADR-0007 ligne 169,
« a le droit de connaître Unity » — qui doit posséder le `ProfilerCounterValue<float>` et le
relais vers `ProfilerRecorder`. Ce partage de responsabilité doit être écrit noir sur blanc
dans AC-42b ou dans le contrat système 2/Capture, pas seulement supposé.

---

## Finding 10 — MINEUR : le Tuning Knob « cadence de décimation » attribue tout le surcoût à YIN

Ligne 802, colonne « Trop haut » : *« coût CPU inutile sur YIN »*. Le Finding 2 montre que
c'est le `Decimator` (FIR 81 taps) qui porte la plus grosse part de l'écart réel — pas YIN
seul. À corriger en même temps que le chiffre de la section Budget, pour que les deux endroits
du document racontent la même histoire.

---

## Finding 11 — MINEUR : le flush dénormal n'a ni valeur numérique ni implémentation

Edge Cases (ligne 634-636) et AC-15 exigent que l'enveloppe *« descendue sous un plancher de
dénormalisation »* soit forcée à zéro, mais **aucune valeur n'est donnée** pour ce plancher.
Vérification dans le code actuel : `EnvelopeFollower.cs`, méthode `Process` (lignes 96-107) —
**aucune garde de dénormalisation n'existe** ; c'est un filtre exponentiel nu. Cohérent avec
« État du code aujourd'hui » (le `VoiceAnalyzer` n'existe pas encore), mais à ne pas perdre
avant l'implémentation.

**Fix concret** : nommer une constante explicite (par exemple `1e-15f`, choisie nettement
au-dessus de la vraie plage dénormalisée du `float` — ~1,4e-45 à 1,18e-38 — pour que le flush
déclenche *avant* que le CPU exécute des micro-opérations dénormalisées, et nettement en
dessous de toute valeur audible/pertinente pour le gameplay), et l'ajouter au constructeur de
`EnvelopeFollower` comme les autres constantes nommées (cohérent avec la discipline AC-43).

---

## Finding 12 — MINEUR : le tableau « Performance Implications » d'ADR-0003 cite un modèle FFT abandonné

`adr-0003-...md` lignes 356-362 : *« CPU client (FFT) | <10 % par joueur à ~1024 échantillons
(estimation LOG, non mesurée) »*. Cette estimation date du modèle FFT abandonné le 2026-07-27
(le même ADR le documente dans ses *Alternatives*, ligne 302-308) ; le pipeline réellement
codé est YIN + `Decimator` + `EnvelopeFollower`, jamais réévalué sous ce nom. Au regard de la
règle de provenance ajoutée le 2026-09-14, ce chiffre est une valeur provisoire **héritée d'un
autre modèle**, pas une mesure du pipeline actuel — à marquer comme tel ou à retirer.

---

## Récapitulatif des sévérités

| # | Sévérité | Sujet |
|---|---|---|
| 2 | BLOQUANT | Facteur 2,25× faux (code : O(fenêtre×maxLag), pas O(fenêtre²)) |
| 4 | BLOQUANT | AC-42 mesure l'instance seule, jamais sous charge Opus+FMOD+FishNet+système 11 |
| 5 | BLOQUANT | Modèle de thread non tranché (callback temps réel vs worker) |
| 6 | BLOQUANT | Aucun budget de latence bout-à-bout vs les 350 ms du système 11 |
| 7 | BLOQUANT | AC-41b ne tranche pas dans/hors périmètre — intestable en l'état |
| 3 | RECOMMANDÉ | Estimation de performance complétée (~50-200 µs/trame, ordre de grandeur) |
| 8 | RECOMMANDÉ | Backend GC (IL2CPP/Mono, incrémental) non spécifié ; durée de gel de bascule non bornée |
| 9 | RECOMMANDÉ | `ProfilerRecorder` d'AC-42b ne peut pas vivre dans `Voice.Core` (`noEngineReferences`) |
| 10 | MINEUR | Tuning Knob décimation attribue tout le coût à YIN, pas au `Decimator` |
| 11 | MINEUR | Flush dénormal sans valeur numérique, absent du code actuel |
| 12 | MINEUR | Tableau perf d'ADR-0003 hérité du modèle FFT abandonné |

Point 1 (contestation) : confirmé fondé, conséquences globalement bien écrites sauf le
chiffrage (Finding 2).
