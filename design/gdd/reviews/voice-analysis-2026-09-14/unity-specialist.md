# Revue adversariale — Analyse vocale (système 1) — angle Unity/moteur

| Champ | Valeur |
|---|---|
| Reviewer | unity-specialist |
| Document cible | `design/gdd/voice-analysis.md` (1441 lignes) |
| Date | 2026-09-14 |
| Question posée | Le GDD décrit-il encore une chaîne implémentable sur Unity 6.3, maintenant qu'ADR-0007/0008 sont Accepted et ADR-0003 amendé — et son corps a-t-il été mis à jour en conséquence ? |
| Verdict court | **Non.** Le corps du texte (Core Rules, Interactions, Dependencies, Tuning Knobs, Visual/Audio, une partie d'Open Questions) contredit à plusieurs endroits les décisions déjà actées dans ADR-0003 (amendé), ADR-0007 et ADR-0008. Le code (`EnvelopeFollower.cs`) n'a pas non plus été mis à jour pour appliquer ADR-0007, alors que le GDD ne le signale pas. |

Sources consultées : `design/gdd/voice-analysis.md`, `design/gdd/reviews/voice-analysis-2026-09-07.md`, `design/gdd/reviews/voice-calibration-2026-09-11.md`, `design/gdd/reviews/voice-object-effect-2026-09-14.md`, `docs/architecture/adr-0003/0004/0006/0007/0008`, `docs/engine-reference/unity/VERSION.md`, `breaking-changes.md`, `deprecated-apis.md`, `modules/audio.md`, code sous `Unity/Shut_up_and_carry/Assets/_Project/Runtime/Voice.Core/` (`EnvelopeFollower.cs`, `Decimator.cs`, `LoudnessMeter.cs`, `PitchDetector.cs`, `Contract/VoiceFrame.cs`, `SUAC.Voice.Core.asmdef`), `Unity/Shut_up_and_carry/Assets/_Project/ThirdParty/DissonanceFishNet~/VENDORING.md`.

---

## F1 — [BLOQUANT] Le corps du GDD contredit ADR-0007 sur la nature de la cadence

**Emplacements** :
- Core Rules, en tête (`voice-analysis.md:114`) : *« La chaîne tourne à cadence fixe et connue (~50 Hz). »*
- Core Rules, étape 5 (`:128`) : *« Une fois par trame, à la cadence fixe »*
- Tuning Knobs, « Ce qui n'est pas un curseur » (`:828-829`) : *« La cadence de la chaîne (~50 Hz) — c'est un contrat, pas un curseur. La modifier casse le lissage de l'EnvelopeFollower en silence. »*
- Contrat système 2 (`:703-704`) : *« Pousser les échantillons à cadence fixe et connue (~50 Hz), accompagnés d'un AnalysisTiming{DeltaSeconds, SampleRate} (ADR-0007). »*
- Acceptance Criteria, « Les trois cas difficiles » (`:1195-1206`) : *« La cadence fixe. Pas de bonne réponse en l'état... il faudrait que la chaîne reçoive un deltaTime explicite... à traiter comme une décision technique à part entière. »*

**Preuve** : ADR-0007 est *Accepted* et tranche exactement l'inverse : *« Aucun mécanisme Unity ne fournit 50 Hz fixe »* (table des 4 mécanismes, `adr-0007:119-124`) — la cadence fixe **n'est pas un contrat qu'on peut tenir**, c'est justement ce que le `deltaTime`/`AnalysisTiming` explicite remplace. Le document se contredit lui-même : OQ-3, quelques dizaines de lignes plus loin (`:1282-1309`), dit correctement *« TRANCHÉ... le moteur a répondu à notre place »*, alors que la section AC qui la précède (« Les trois cas difficiles ») redit encore *« pas de bonne réponse en l'état »* comme si rien n'était décidé — et un lecteur qui lit les AC avant les OQ (ordre du document) rencontre la version non résolue en premier.

**Correctif concret** : réécrire les cinq emplacements pour refléter l'état post-ADR-0007 : la chaîne ne suppose plus de cadence fixe, elle reçoit `AnalysisTiming{DeltaSeconds, SampleRate}` à chaque trame et **expose l'écart au nominal** au lieu de le subir en silence. Supprimer ou fusionner le paragraphe « La cadence fixe » de « Les trois cas difficiles » avec OQ-3 (qui est déjà à jour), pour arrêter la redite contradictoire.

---

## F2 — [BLOQUANT] Le code n'a pas été mis à jour conformément à ADR-0007 ; le GDD ne le signale pas

**Emplacement** : « État du code aujourd'hui » (`:1433-1441`).

**Preuve** (lu dans `EnvelopeFollower.cs`) : le constructeur prend toujours `updateRateHz` en paramètre (ligne 69) et calcule les coefficients une fois pour toutes (`CoefficientFor`, ligne 118-131, formule `exp(-1/(timeConstantSeconds·updateRateHz))`). `Process(float input)` (ligne 96) n'a **aucun paramètre de temps par appel** — pas de `deltaTime`, pas d'`AnalysisTiming`. Rien dans le fichier ne correspond à l'étape 1 du plan de migration d'ADR-0007 (*« Modifier EnvelopeFollower pour accepter l'intervalle par appel »*), alors que l'ADR est *Accepted — élargi le 2026-09-08*.

**Correctif concret** : « État du code aujourd'hui » doit dire explicitement que **le code existant n'implémente pas encore ADR-0007** — ce n'est pas seulement « le VoiceAnalyzer n'existe pas », c'est « le seul type à état déjà écrit et testé (`EnvelopeFollower`) doit être modifié avant que quiconque écrive le `VoiceAnalyzer` », conformément à ce qu'ADR-0007 dit lui-même (*« Blocks : le VoiceAnalyzer ne doit pas être écrit avant application de cet ADR »*).

---

## F3 — [BLOQUANT] La formule per-call pour `DeltaSeconds` variable n'est spécifiée nulle part dans le GDD

**Emplacement** : Formulas (aucune section ne la couvre), AC-14 (`:1045`).

**Preuve** : le code actuel calcule un coefficient figé à la construction. ADR-0007 exige un recalcul par appel à partir de l'intervalle réel — la formule correcte, standard pour ce type de filtre, est `coefficient = exp(-DeltaSeconds / tau)`, recalculée quand `DeltaSeconds` dévie du précédent au-delà d'un epsilon (`adr-0007:154-155`). Le GDD ne donne cette formule **nulle part** : AC-14 continue de dire *« mesuré... à cadence nominale »* sans jamais définir le comportement sous cadence réellement variable, et sans reprendre le test explicite qu'ADR-0007 réclame au Migration Plan point 3 (*« même séquence de valeurs à deux cadences, lissage correct dans les deux cas »*).

**Correctif concret** : ajouter en Formulas une sous-section « Coefficient de l'EnvelopeFollower sous cadence variable » avec la formule `exp(-DeltaSeconds/tau)`, et un nouvel AC (par ex. AC-14e) testant deux cadences d'appel différentes produisant le même temps de montée réel — c'est le seul filet qu'ADR-0007 réclame et qu'aucun AC actuel ne couvre.

---

## F4 — [RECOMMANDÉ] `N` (fenêtre de jitter) et TTL de l'anneau : unités non alignées avec ADR-0007

**Emplacements** : Formulas §4 (`:429`, « Fenêtre du jitter `N` | int | 3…5 · PROVISOIRE 4 »), Tuning Knobs (`:798`, « TTL de l'anneau — à définir »).

**Preuve** : ADR-0007 énumère explicitement cinq horloges à corriger (`:144-152`) dont *« Fenêtre de jitter N | Un compte de trames | Exprimée en secondes »* et *« TTL de l'anneau médian | Un compte de trames | Exprimé en secondes »*. Le GDD continue de présenter `N` comme un entier sans unité (implicitement un compte d'observations, ce qui redevient ambigu sous cadence variable) et le TTL comme « à définir » sans jamais dire qu'il doit être exprimé en secondes — la conséquence de l'ADR n'est donc pas répercutée dans les deux endroits mêmes qu'elle visait à corriger.

**Correctif concret** : réexprimer `N` comme une durée (par ex. « fenêtre glissante de ~80 ms, convertie en nombre d'observations via `SampleRate`/cadence réelle ») et documenter dès maintenant que le TTL (OQ-6) devra être choisi en secondes, pas en trames — pour que sa future valeur ne retombe pas dans le même défaut.

---

## F5 — [RECOMMANDÉ] Fenêtre de gel sur écrêtage (~250 ms) : mode d'accumulation non précisé

**Emplacements** : Edge Cases, « Saturation du signal » (`:605`), Tuning Knobs (`:801`).

**Preuve** : ADR-0007 range explicitement cette fenêtre parmi les cinq horloges à corriger, consommant désormais `DeltaSeconds` plutôt qu'un compte de trames implicite à 50 Hz (`adr-0007:152`). Le GDD continue de dire « ~250 ms » sans jamais préciser si l'accumulation se fait en temps réel (`DeltaSeconds` cumulés) ou en nombre de trames — ce dernier dériverait sous cadence variable, exactement le défaut qu'ADR-0007 corrige ailleurs.

**Correctif concret** : préciser explicitement « accumulée en `DeltaSeconds`, jamais en nombre de trames ».

---

## F6 — [BLOQUANT] « post-AEC » et « fourche AEC » : texte contredit l'amendement du 2026-09-08 (AEC rétrogradée)

**Emplacements** :
- Core Rules, étape 1 (`:124`) : *« Audio d'entrée pousse les échantillons bruts (post-AEC). »*
- Interactions (`:208`) : *« échantillons bruts post-AEC »*
- Dependencies, système 2 (`:676`) : *« Pousse les échantillons bruts post-AEC à cadence fixe »*
- Contrat système 2 (`:722`) : *« Livrer le signal brut : post-AEC uniquement, jamais de VAD, d'AGC ni de suppression de bruit. »*
- Visual/Audio Requirements (`:870`) : *« Tout traitement situé en aval de la fourche AEC (ADR-0003) reste sur la branche chat vocal. »*
- Open Questions, OQ-7 (`:1370`) : *« ...avec l'AEC en amont de la fourche. »*

**Preuve** : ADR-0003, statut actuel (`:5-53`) — *« L'AEC cesse d'être une correction de gameplay... [et devient] absente de la branche d'analyse »*, et *« L'exigence "AEC en amont de la fourche" est retirée »*. Le document lui-même le reconnaît correctement dans un encart isolé, plus loin dans la même section (`:944-956`, « Corrigé le 2026-09-08 ») : *« l'AEC de Dissonance s'applique en aval, sur sa propre branche de transmission, et notre branche d'analyse n'en reçoit aucune »*. Les six emplacements ci-dessus n'ont **pas** été corrigés en conséquence : ils qualifient toujours le signal d'analyse de « post-AEC » et parlent d'une « fourche AEC », alors qu'il n'existe plus **aucune** AEC sur ce trajet. Ce n'est pas seulement un desync avec l'ADR, c'est une **contradiction interne au document** — l'encart correctif et le reste du texte s'affirment mutuellement faux.

**Correctif concret** : remplacer « post-AEC » par « brut, sans aucun traitement » partout hors de l'encart déjà corrigé ; renommer « fourche AEC » en « fourche du signal » (ou « fourche micro ») en Visual/Audio Requirements et OQ-7 ; le contrat système 2 doit dire que le signal transmis n'a subi **aucune** AEC — pas seulement « aucun VAD/AGC/suppression de bruit » — pour rester cohérent avec le reste du même document.

---

## F7 — [BLOQUANT] OQ-7 ne reflète pas l'état réel du risque après ADR-0008 *Accepted*

**Emplacement** : Open Questions, OQ-7 (`:1364-1394`).

**Preuve** : ADR-0008 est *Accepted*, Dissonance est retenu, l'intégration FishNet communautaire est auditée et vendorisée (`VENDORING.md`). Le « seul vrai inconnu » nommé par ADR-0008 et par `VENDORING.md` § *Ce qu'il reste à vérifier* est désormais la **compilation contre Dissonance 9.0.7 / FishNet 4.7.2R** (le dernier alignement documenté en amont est FishNet 4 / Dissonance **8**, d'avril 2024 — un écart de version majeure jamais confirmé publiquement), puis la correction du défaut d'authentification (issue #12), puis la vérification du canal non fiable/non ordonné — et **seulement ensuite** le test de partage de périphérique. Le corps d'OQ-7 continue de présenter le risque uniquement sous l'angle « le micro peut-il être partagé », sans mentionner cette file d'attente réelle posée par ADR-0008 lui-même, et cite encore l'AEC en amont de la fourche (stale, voir F6).

**Correctif concret** : réécrire OQ-7 pour lister l'ordre réel des vérifications restantes tel que `VENDORING.md` § *Procédure d'activation* (points 6 à 9) le fixe : compiler → corriger l'authentification → vérifier le canal → **alors seulement** tester le partage de périphérique. Retirer la mention de l'AEC en amont.

---

## F8 — [RECOMMANDÉ] Rééchantillonnage : contrat sous-spécifié, cas des périphériques à bande limitée non couvert

**Emplacement** : Dependencies, système 2 (`:705-707`) : *« Livrer une fréquence d'échantillonnage compatible avec la décimation... Le rééchantillonnage appartient au système 2, pas à Voice.Core. »*

**Preuve** : `Decimator` exige un facteur entier (vérifié dans `Decimator.cs`, constructeur, et confirmé par AC-14c) — 48 000 → 8 000 vaut 6, mais un périphérique livrant nativement autre chose (44 100 Hz sur certaines interfaces, 8/16 kHz en profil mains-libres Bluetooth — HFP/mSBC, courant sur casques sans fil) casse cette hypothèse. À 16 kHz, le facteur vers 8 kHz existe (÷2) mais vers 12 kHz n'existe pas (16000/12000 ≈ 1,33) : la branche « voix aiguë décimée à 12 kHz » qui porte la garantie d'équité d'AC-31 devient irréalisable sans suréchantillonnage — lequel n'ajoute aucune information réelle au-delà de la bande d'origine du micro. Le contrat actuel ne dit rien de cette limite physique, ni de la qualité de rééchantillonnage requise : un ré-échantillonneur médiocre (interpolation linéaire) peut lisser précisément le rapport crête/RMS dont dépend `Continuity` (AC-39). Le document ne clarifie pas non plus explicitement que le rééchantillonnage est autorisé sur la branche d'analyse — il n'est pas un des quatre traitements interdits nommés, mais ce n'est jamais dit.

**Correctif concret** : ajouter au contrat système 2 (a) une exigence de qualité minimale du ré-échantillonneur (filtre à phase linéaire, pas d'interpolation nue), justifiée par AC-39 ; (b) nommer explicitement le cas des périphériques à bande limitée comme dégradation documentée — soit un plafond de décimation propre à la capacité réelle du micro, soit la perte assumée et écrite de la garantie d'AC-31 pour ces joueurs ; (c) dire explicitement que le rééchantillonnage est permis sur la branche d'analyse.

---

## F9 — [NON VÉRIFIÉ] Contraintes de Dissonance sur le format PCM externe (fréquence / taille de trame)

ADR-0008 cite `IMicrophoneCapture` comme acceptant *« Mono, float, n'importe quelle fréquence, livré à cadence temps réel »* (sourcé sur la doc éditeur). **Non vérifié dans les sources consultées ici** : si le codec interne de Dissonance impose ensuite une contrainte de fréquence (les codecs vocaux type Opus n'acceptent typiquement qu'un sous-ensemble : 8/12/16/24/48 kHz) ou de taille de trame (souvent 20 ms), et si cette contrainte remonte jusqu'à contraindre le format que `IMicrophoneCapture` doit produire — ce qui affecterait indirectement la fréquence disponible pour la branche d'analyse, en amont de la fourche.

**À faire avant l'écriture du système 2** : vérifier ce point dans la documentation Dissonance (format audio interne / `IMicrophoneCapture`) ; si une contrainte existe, l'ajouter au contrat système 2 de ce GDD.

---

## F10 — [BLOQUANT] « L'analyse ne tourne pas sur le thread principal » n'est étayé par aucune architecture, et le backend retenu la rend probablement fausse par défaut

**Emplacement** : Acceptance Criteria §H, « Propriété du thread » (`:1125-1127`) : *« L'analyse ne tourne pas sur le thread principal. Ce que le budget de 1 ms/frame doit couvrir n'est pas le calcul mais la remise de la VoiceFrame au thread principal. »* AC-42 (`:1133`).

**Preuve** : `SUAC.Voice.Core.asmdef` a `"noEngineReferences": true` (vérifié) — Core ne peut donc jamais décider lui-même de son thread d'exécution ; c'est entièrement une décision de `Voice.Capture` (système 2), et **aucun document du projet ne la prend**. Or le backend retenu, Dissonance, expose la capture via `IMicrophoneCapture`, dont l'implémentation de référence (`BasicMicrophoneCapture`) s'appuie sur la classe `Microphone` d'Unity — qu'ADR-0007 caractérise lui-même comme *« API d'interrogation : aucun rappel, c'est l'appelant qui décide quand lire »* (`adr-0007:123`), ce qui en pratique Unity signifie un sondage depuis le thread principal (`Update`/`MonoBehaviour`) : la lecture du tampon de `Microphone` n'est ni documentée ni garantie thread-safe hors thread principal. Si le système 2 implémente son `IMicrophoneCapture` par-dessus `Microphone` — le chemin le plus probable, faute d'alternative native documentée dans ce projet — le point de fourche des échantillons bruts a lieu **sur le thread principal**, et faire tourner l'analyse « hors thread principal » exige un renvoi explicite (file, `Task`, thread dédié) qu'**aucun contrat système 2, ADR ou GDD ne spécifie ni ne budgète**.

**Correctif concret** : soit (a) le contrat système 2 nomme explicitement le mécanisme de renvoi (ex. file lock-free simple + thread dédié consommant les échantillons post-fork, avec son propre budget CPU), soit (b) le document assume franchement que l'analyse tourne en réalité sur le thread principal (dans `Update`, comme le reste d'une capture basée sur `Microphone`), et reformule AC-42/AC-42b et le budget de 1 ms/frame en conséquence — ce qui change la lecture de « 1 ms/frame » d'un simple hand-off à un vrai budget de calcul DSP sur le thread de rendu.

---

## F11 — [RECOMMANDÉ] Reconstruction de `Decimator`/`PitchDetector` au changement de profil : allocation potentiellement sur le thread principal

**Emplacement** : Edge Cases, « Conséquence d'implémentation » (`:550-579`), AC-41b.

**Preuve** : si F10 se confirme (fourche + analyse sur le thread principal), alors la reconstruction de `Decimator`/`PitchDetector` — décrite comme ayant lieu « sur le fil d'analyse » (`:575`) — alloue effectivement sur le thread principal lors d'un hot-swap de profil : exactement le moment que le document lui-même identifie comme sensible (*« le poids perçu du meuble changerait en pleine manipulation »*). Le document ne relie jamais cette conséquence à un risque de hitch GC en plein jeu.

**Correctif concret** : si F10 est tranché en faveur du thread principal, ajouter un edge case explicite sur le hitch GC potentiel au hot-swap de profil et sa mitigation (pré-allocation aux tailles maximales possibles plutôt que `new` à la demande, ou pool par palier de fréquence).

---

## F12 — [BLOQUANT] AC-42b (`ProfilerRecorder`) n'est pas réalisable dans `SUAC.Voice.Core` tel que rédigé

**Emplacement** : AC-42b (`:1134`) : *« un compteur ProfilerRecorder expose en continu le coût par instance en µs/frame et l'écart de cadence au nominal. »*

**Preuve** : `SUAC.Voice.Core.asmdef` a `"noEngineReferences": true` (vérifié). `Unity.Profiling.ProfilerRecorder` — et tout mécanisme permettant de publier un compteur qu'il puisse lire (`ProfilerCounterValue<T>`, `CustomSampler`, `ProfilerMarker`) — appartient au namespace `UnityEngine`/`Unity.Profiling`, donc à une assembly avec référence moteur. Voice.Core ne peut ni créer un `ProfilerRecorder`, ni exposer un compteur qui lui soit visible, sans violer ADR-0004/ADR-0006 (la frontière opposable à la compilation). AC-42b, tel qu'écrit et rattaché à la section Acceptance Criteria de ce document (qui documente `SUAC.Voice.Core`), attribue cette instrumentation au système sans jamais préciser qu'elle doit être **scindée** entre Core (mesure brute via `System.Diagnostics.Stopwatch`, .NET pur, compatible netstandard2.1 — aucune référence `UnityEngine` requise) et Capture (exposition du compteur visible par `ProfilerRecorder`).

**Correctif concret** : réécrire AC-42b pour spécifier explicitement cette séparation : Voice.Core expose une durée mesurée par `Stopwatch` via une propriété de diagnostic ; Voice.Capture consomme cette valeur et la publie comme compteur `ProfilerRecorder`. Sans cette précision écrite noir sur blanc, un implémenteur pressé référencera `UnityEngine` depuis Core pour satisfaire ce critère — exactement la dérive qu'ADR-0004/0006 interdisent et que ce projet traque par ailleurs avec rigueur.

---

## F13 — [RECOMMANDÉ / NON VÉRIFIÉ] `AudioSettings.OnAudioConfigurationChanged` comme crochet de changement de périphérique micro

**Emplacement** : Contrat système 2 (`:732-733`) : *« Le crochet moteur est AudioSettings.OnAudioConfigurationChanged (Unity 6.3), pas un sondage périodique. »*

**Preuve / doute** : `AudioSettings.OnAudioConfigurationChanged` est un événement ancien et stable, documenté pour se déclencher sur un changement de configuration audio (fréquence d'échantillonnage, mode haut-parleur, taille de tampon DSP, changement de périphérique par défaut) ou un appel explicite à `AudioSettings.Reset()`. **Non vérifié dans les sources consultées** (aucune des docs engine-reference disponibles ne couvre ce point précisément) : que cet événement se déclenche de façon fiable sur un changement de périphérique de **capture** (micro), par opposition à un changement de périphérique de **sortie** — la documentation Unity historique et les cas d'usage classiques de cet événement (perte du casque, reconfiguration du mixeur) concernent la sortie. Contrairement à ADR-0007, qui sourc chacun de ses comportements moteur invoqués, aucune source n'est citée dans le GDD pour cette affirmation — exactement le type d'affirmation que la colonne *Verification Required* de ce projet exige de sourcer avant de l'inscrire comme fait.

De plus, ADR-0008 change le terrain : Dissonance possède potentiellement la capture via `IMicrophoneCapture`, et l'implémentation la plus probable (par-dessus `Microphone`, cf. F10) n'a pas de callback de changement de périphérique connu — seul un sondage de `Microphone.devices` le permettrait, ce qu'ADR-0007 caractérise déjà comme « poll-only ». Le contrat système 2 affirme donc un mécanisme sans confirmer qu'il couvre le cas d'usage réel (perte/changement de micro), ni comment il s'articule avec la capture désormais partagée avec Dissonance.

**Correctif concret** : marquer cette ligne « à vérifier au POC » (comme ADR-0007 le fait déjà pour `dspBufferSize`/`AudioSettings.Reset()`), avec un plan de repli explicite (sondage périodique de `Microphone.devices`) si l'événement ne couvre pas en pratique les changements de périphérique d'entrée.

---

## F14 — [MINEUR] Écart de flush des dénormaux Mono vs IL2CPP : toujours non traité

**Emplacement** : Edge Cases, « Amorçage et silence prolongé » (`:634-636`) ; déjà signalé comme *Reste ouvert #6* dans `voice-analysis-2026-09-07.md`.

**Preuve** : la revue précédente listait ce point comme nice-to-have non appliqué ; le texte actuel ne mentionne toujours aucune différence de comportement entre Mono (éditeur/tests) et IL2CPP (backend probable du build Windows cible) sur le flush des dénormaux — et `EnvelopeFollower.cs` actuel n'implémente d'ailleurs encore aucune garde de dénormalisation (juste une décroissance exponentielle sans plancher), cohérent avec « reste à écrire » mais toujours non résolu depuis deux revues.

**Correctif concret** : ajouter une phrase en Edge Cases notant que le comportement de flush des dénormaux diffère entre backends de scripting et doit être vérifié sur la cible IL2CPP, pas seulement sous Mono/éditeur.

---

## F15 — [MINEUR] `Tick` sous cadence irrégulière : clarification bienvenue

**Emplacement** : Core Rules étape 10 (`:133`, « Tick++ monotone par instance »), AC-12 (`:1043`).

**Constat** : contrairement à `N` et au TTL (F4), `Tick` est déjà cohérent avec ADR-0007 en substance — c'est un compteur d'appels (un par trame produite), pas une mesure de temps, ce que confirment le code (`VoiceFrame.cs`, champ `uint Tick`, simple incrément) et AC-12. Il manque seulement une phrase explicite fermant toute lecture erronée : sous cadence variable, un écart de `Tick` entre deux trames ne correspond plus à un intervalle de temps fixe — pertinent pour le système 5 (Réseau), qui utilise `Tick` pour repérer des trous.

**Correctif concret (mineur)** : ajouter « `Tick` compte les appels, pas le temps : sous cadence variable, un écart de `Tick` ne traduit plus un intervalle constant » en Core Rules ou en Dependencies (contrat système 5).

---

## Points vérifiés et confirmés corrects (pas de finding)

- **`[SerializeField]` (`:735-738`)** : la règle citée (réservé aux champs, erreur de compilation, `[field: SerializeField]` pour une propriété auto-implémentée) est exacte et alignée mot pour mot avec `docs/engine-reference/unity/breaking-changes.md` et `deprecated-apis.md`. Rien à corriger.
- **ADR-0007 lui-même** (raisonnement sur `Update`/`FixedUpdate`/`Microphone`/`OnAudioFilterRead`) est correct et bien sourcé — c'est le corps du GDD qui n'a pas suivi la décision, pas l'ADR qui se trompe.

---

## Synthèse pour la passe de révision groupée (systèmes 1/6/11)

Les items **F1, F2, F3, F6, F7, F10, F12** bloquent l'écriture correcte du `VoiceAnalyzer` ou violent une frontière d'architecture déjà actée (ADR-0004/0006) ; ils doivent être traités dans la même passe que les autres findings de re-revue du système 1. **F4, F5, F8, F9, F11, F13** sont des trous de spécification réels mais contournables par une hypothèse documentée le temps du prototype. **F14, F15** sont des reliquats mineurs, dont un déjà signalé sans suite depuis la revue du 2026-09-07.

Le défaut commun à F1, F2, F3, F6, F7 : **le corps du texte n'a pas été réédité après que les ADR qu'il cite eux-mêmes ont changé d'état** (Accepted, puis amendé une seconde fois pour ADR-0003). C'est distinct du défaut d'atteignabilité déjà nommé dans les revues système 6 et système 11 — celui-ci est un défaut de **propagation**, pas de **dérivation**.
