##### Navigation : [[MOC - Shut-up & Carry]] | [[BACKLOG - Points ouverts]] | 


## ##Date — Titre

**Contexte :** 

**Décision :** 

- 

**Pourquoi :**

- 

**Conséquences −:**


- 


## 2026-09-03 — Rendu : URP, sur une direction artistique lo-fi à pics de qualité ciblés

**Contexte :** Recréer le projet, c'est rechoisir le pipeline de rendu — un choix qu'aucune entrée de ce LOG ne portait, et que l'ancien projet tranchait implicitement en URP par son template. Le fichier `GDD - Direction Artistique.md` du vault est vide (0 octet) : la direction artistique n'existait qu'en filigrane dans le GDD, via la référence lo-fi / VHS de *Lethal Company* et la tonalité loufoque « façon *Overcooked* ».

**Décision :** Le nouveau projet est créé en **URP**. La direction artistique qui le justifie : **base lo-fi, avec des pics de qualité ciblés** là où le regard du joueur se porte — objets maudits, bestiaire, moments clés.

**Alternative écartée :** HDRP — écarté sur des arguments tirés du GDD, pas sur un principe général :

- le jeu vise une esthétique **lo-fi / VHS** que le photoréalisme de HDRP combattrait au lieu de servir ;
- l'éclairage y est **porteur de gameplay et non d'ambiance** (trois archétypes du bestiaire ont une parade qui exige de voir), avec interdiction explicite du noir total durable — ce qui neutralise l'avantage principal de HDRP ;
- HDRP relève le plancher matériel, et dans un jeu à 8 joueurs une configuration exclue retire un joueur **à tout le groupe**, pas seulement à lui-même.

**Pourquoi :**

- URP Forward+ gère nativement les nombreuses petites lumières dynamiques dont dépendent la Minuterie et la Lampe de Chevet Capricieuse
- Le lo-fi assumé protège un dev solo : une crudité lue comme délibérée vaut mieux qu'un « presque beau » mis en comparaison directe avec des productions de studio
- Les pics ciblés concentrent l'effort artistique sur ce que le joueur regarde vraiment, au lieu de le diluer sur le décor

**Conséquences −:**

- **URP 6.3 n'a toujours pas de brouillard volumétrique natif.** Rayons de lumière et brume au sol passeront par un asset tiers ou une passe custom — coût identifié, à provisionner quand l'ambiance sera travaillée.
- « Premium » réimporte par la petite porte le risque écarté avec HDRP : empiler Adaptive Probe Volumes, TAA, SSAO, ombres haute résolution et volumétrique tiers remonte le plancher matériel. **Un budget de performance cible doit être fixé avant de travailler l'ambiance**, pas après.
- Un écart de fidélité qui ne porte pas de sens se lit comme un défaut. Règle retenue : **les pics tombent sur ce qui est maudit ou anormal, le monde ordinaire reste lo-fi** — l'écart devient alors un signal de gameplay plutôt qu'une incohérence.
- Cette entrée est le **premier engagement écrit sur le style visuel** du jeu. Elle acte un cadre, elle ne remplace pas le chapitre du GDD : `GDD - Direction Artistique.md` reste à écrire.

---

## 2026-09-03 — Dissonance conservé, mais sur son propre transport (P2P Steam), pas sur FishNet

**Contexte :** Vérifié le jour même : Dissonance n'a **pas** d'intégration FishNet officielle — ce que le LOG du 2026-07-05 laissait en question ouverte. Dissonance supporte officiellement Mirror, Netcode for GameObjects, Photon (PUN/Fusion), Forge, DarkRift 2, TNet3, HLAPI et un mode WebRTC autonome. Côté FishNet, Dissonance figure parmi les intégrations *communautaires*, explicitement non maintenues par l'équipe FishNet ; le pont existant est l'œuvre d'un auteur unique, hébergé sur son compte de backup, sans matrice de compatibilité documentée.

**Décision :** Dissonance est **conservé**, et porté par **son propre transport, écrit par nous au-dessus du P2P Steam (Facepunch)** — ni par le pont communautaire, ni par FishNet. Rien n'est acheté ni codé avant l'étape réseau : ce qui est tranché ici, c'est la direction, pour ne pas glisser vers le pont par défaut le jour où ça pressera.

**Alternatives écartées :**

- **Pont communautaire Dissonance ↔ FishNet** : le moins d'effort immédiat, mais couple le chat vocal à deux API mouvantes à la fois, sans support d'aucun des deux éditeurs — et recouple ce que la décision du 2026-07-05 avait explicitement séparé.
- **Vivox** : gratuit jusqu'à 5 000 joueurs simultanés, voix positionnelle 3D native, indépendant du moteur réseau donc sans le problème FishNet par construction. Écarté pour deux raisons : la voix partirait dans le cloud d'Unity (dépendance à un service et à ses conditions) alors qu'on dispose déjà d'un transport P2P gratuit, et surtout la lecture ne passerait plus par FMOD.
- **Voix Steam native** : gratuite et déjà embarquée via Facepunch, mais l'API Steam ne fait que capturer et compresser — pas d'audio 3D, pas de rooms, pas d'annulation d'écho, pas de suppression de bruit. Tout serait à réécrire.

**Pourquoi :**

- Un adaptateur réseau doit exister **de toute façon** : le cœur de Dissonance ne transporte rien lui-même. La vraie question n'est donc pas s'il faut en écrire un, mais **à quelle API on accepte d'être couplé** — le P2P Steam, stable depuis une décennie et déjà une dépendance actée (« PC / Steam uniquement », 2026-07-06), plutôt que l'API FishNet qui casse entre versions majeures.
- Restaure la cohérence avec la décision « deux couches réseau découplées » du 2026-07-05, dont la justification était précisément de pouvoir remplacer Dissonance sans toucher FishNet.
- Dissonance apporte ce qu'aucune alternative gratuite ne donne : Opus, RNNoise, contrôle de gain, annulation d'écho acoustique, correction d'erreur en avant, système de rooms, audio 3D — et une **intégration FMOD officielle pour la lecture**, décisive pour un jeu d'horreur où la voix doit subir l'occlusion, la réverbération et la distance comme n'importe quel autre son du monde.

**Conséquences −:**

- **175 $ à budgéter** : 120 $ Dissonance + 55 $ l'intégration FMOD (playback). Aucune des deux n'est achetée à ce jour.
- Un adaptateur réseau à écrire **et à maintenir nous-mêmes** : Dissonance fournit les classes de base, à lui fournir un canal non fiable et non ordonné — ce que le P2P Steam donne nativement.
- Deux handshakes réseau à orchestrer (session FishNet + session Dissonance), conséquence déjà notée au 2026-07-05 et désormais pleinement assumée.
- L'adaptateur **ne sera pas testable sur une seule machine**, pour la même raison que FishyFacepunch : le P2P Steam interdit la connexion à soi-même. Le second transport prévu pour l'itération locale ne couvrira pas la voix.
- **Risque éditeur à surveiller** : le fil d'actualité public de Dissonance ne montre rien depuis 2023, même si le suivi des tickets reste vivant (ticket de mai 2026 marqué « Awaiting Release »). À re-vérifier au moment de l'achat, pas avant.

---

## 2026-09-03 — Version d'Unity : rester sur 6000.3 (Unity 6.3 LTS)

**Contexte :** Recréer le projet, c'est en choisir la version. Le BACKLOG portait depuis juillet un point ouvert sur la compatibilité de la stack (FishNet, FishyFacepunch, Dissonance) avec Unity 6000.3.18f1, jugée « très récente » et non vérifiée, à lever avant l'étape réseau.

**Décision :** Le nouveau projet est créé sur **Unity 6000.3.x, dernier patch disponible** au moment de la création.

**Pourquoi :**

- Unity 6.3 (6000.3.x) est passée **LTS**, supportée jusqu'à décembre 2027 : l'inquiétude de juillet sur une version trop fraîche est levée par le calendrier d'Unity lui-même
- Unity 6.0 LTS s'arrête en **octobre 2026** — repartir sur 6.0 « par prudence » aurait été le vrai piège, avec une migration forcée dans le mois
- FishNet annonce « Unity 6 LTS » entièrement supporté ; FishyFacepunch est maintenu par l'auteur de FishNet lui-même et couvre Windows/macOS/Linux, exactement le périmètre de la décision « PC / Steam uniquement » du 2026-07-06
- Le projet abandonné tournait déjà sur 6000.3.18f1 : aucune migration de version à absorber en plus de la remise à zéro

**Conséquences −:**

- **FishyFacepunch passe par le P2P Steam : impossible de se connecter à soi-même en local.** La boucle de test solo (deux instances sur la même machine) exige un second transport — Tugboat — à prévoir dès la mise en place du réseau, pas à découvrir au premier test
- La compatibilité de **Dissonance** n'est pas couverte par cette décision : Dissonance n'a pas d'intégration FishNet officielle, c'est un arbitrage distinct — cf. [[BACKLOG - Points ouverts]]
- Rester sur une LTS impose d'en suivre les patchs et de ne pas sauter sur 6.4 / 6.5 par curiosité : tout changement de branche redevient une décision à part entière

---

## 2026-09-03 — Sort du dépôt git du code : conservé, nettoyé par-dessus

**Contexte :** La reprise du projet Unity à zéro (cf. entrée du 2026-09-02) laissait ouvert le sort du dépôt `Shut_up_and_carry`, qui porte l'historique de la configuration Visual Studio abandonnée. La branche `feat/voice-core-analysis` (commit `e96ab0d`), où vit tout le code vocal et ses 41 tests, n'a jamais été fusionnée dans `main`.

**Décision :** Le dépôt existant est **conservé** — pas de nouveau dépôt. Dans l'ordre : `feat/voice-core-analysis` est d'abord fusionnée dans `main` après la relecture prévue depuis le 2026-07-27, puis l'arborescence du nouveau projet Unity est construite par-dessus dans ce même `main`. Le nettoyage porte sur les fichiers de configuration Visual Studio, pas sur l'historique.

**Alternative écartée :** Créer un dépôt neuf et repartir d'une page blanche. Écartée : le gain est cosmétique — l'arborescence Unity est recréée de toute façon, donc un dépôt neuf n'apporte rien de plus que le nettoyage de `main`, contre le coût réel de perdre l'historique de `Voice.Core` et de reconfigurer le dépôt GitHub.

**Pourquoi :**

- Le problème réel n'est pas l'historique git mais les fichiers de config VS présents dans l'arbre de travail — ils disparaissent avec la recréation du projet Unity
- L'historique de `Voice.Core` (itérations sur YIN, plage de recherche portée à 600 Hz) garde une valeur de référence au niveau du `git blame`, que le résumé en prose de ce LOG ne remplace pas
- Fusionner la branche avant reconstruction met le code vocal dans `main` : il reste disponible à la réutilisation, sous réserve de sa pertinence relue au cas par cas

**Conséquences −:**

- L'historique de `main` conservera la trace des commits de configuration Visual Studio — poids négligeable, mais à vérifier qu'aucun secret n'y traîne avant de considérer le sujet clos
- La fusion de `feat/voice-core-analysis` doit être précédée de sa relecture, pas expédiée pour débloquer la suite
- Le sort de `Assets/_Project/` (rapatrier tel quel vs réécrire) reste un arbitrage distinct, non tranché par cette décision — cf. [[BACKLOG - Points ouverts]]

---

## 2026-07-27 — Architecture du code : `Assets/_Project` et découpage en assemblies

**Contexte :** Premier code du projet. Il fallait fixer où vit notre code et comment il est découpé, avant que l'habitude ne s'installe toute seule.

**Décision :** Tout le code écrit pour le jeu vit sous **`Assets/_Project/`**, découpé en assemblies par fichier `.asmdef`.

- `SUAC.Voice.Core` — contrat de données, analyse du signal, calibration. **`noEngineReferences: true`** : interdiction d'accéder à UnityEngine.
- `SUAC.Voice.Capture` — accès micro et orchestration. Dépend de Core.
- `SUAC.Gameplay` — objets réactifs à la voix.
- `SUAC.Tests.EditMode` — tests unitaires. Dépend de Core.

Namespace racine : **`SUAC`**. Identifiants en anglais, commentaires en français.

**Pourquoi :**

- Séparer notre code des assets tiers d'un coup d'œil
- Compilation incrémentale : modifier un fichier ne recompile que son assembly
- Les dépendances deviennent explicites et **vérifiées par le compilateur**, pas par la discipline
- `noEngineReferences` sur Core rend le traitement du signal **testable sans micro, sans éditeur, en millisecondes**, et déterministe

**Bénéfice constaté le jour même :** Core a pu être compilé en netstandard2.1 hors Unity et ses tests exécutés contre le `nunit.framework.dll` livré avec Unity 6000.3.18f1 — 41 tests verts avant même d'ouvrir l'éditeur.

**Conséquences −:**

- Plus de fichiers et une arborescence à respecter
- Si du code de Core se met à avoir besoin d'Unity, il faut le déplacer dans Capture plutôt que d'assouplir la règle
- Les valeurs de réglage ne peuvent pas être des ScriptableObject dans Core : elles passent par constructeur, et le ScriptableObject qui les alimente vivra dans Capture

---

## 2026-07-27 — La frontière brut/normalisé est opposable à la compilation

**Contexte :** Les mesures brutes (amplitudes, hertz) dépendent de la voix et du micro du joueur. Si une seule atteignait le gameplay, deux joueurs fournissant le même effort obtiendraient des résultats différents — l'équité vocale s'effondrerait. Une règle écrite dans le GDD ne survit pas six mois.

**Décision :** Les types de mesure brute (`RawLoudness`, `RawPitch`, `LoudnessMeter`, `PitchDetector`, `Decimator`) sont **`internal` à `SUAC.Voice.Core`**. Le gameplay vivant dans une autre assembly, il ne *peut pas* les lire. Seule `VoiceFrame`, entièrement normalisée, est publique.

Un test (`PublicSurfaceTests`) affirme que la surface publique de Core est **exactement** `{ VoiceFrame }`, par liste blanche.

**Pourquoi :**

- C# interdit déjà qu'un membre public expose un type internal : la fuite par signature est impossible
- Le seul trou restant était qu'on passe un type de `internal` à `public` pour dépanner. Le test le ferme : pour le réparer, il faut inscrire le type dans la liste blanche — donc le décider consciemment
- Le préfixe `Raw` rappelle la règle à chaque site d'usage, sans ouvrir le fichier
- `InternalsVisibleTo("SUAC.Tests.EditMode")` ouvre l'accès aux seuls tests

**Conséquences −:**

- Toute la chaîne brut → normalisé doit se refermer à l'intérieur de Core : `Voice.Capture` envoie des échantillons et reçoit une `VoiceFrame`, jamais d'intermédiaire
- `VoiceProfile`, plus tard, sera public comme type mais ses valeurs mesurées resteront internes

---

## 2026-07-27 — Où vit l'état : Core lisse la mesure, Gameplay accumule le sens

**Contexte :** `Continuity` — « ce son dure-t-il ? » — semblait exiger une mémoire, contrairement au volume et à la hauteur qui se calculent sur une seule fenêtre. Il fallait trancher où cette mémoire vit avant que la séparation sans état / avec état ne se brouille.

**Décision :** Deux notions étaient confondues sous le même mot.

- **La texture** (percussif ↔ régulier) se lit sur une seule fenêtre, via le rapport crête/RMS. **Sans état.** C'est elle, et elle seule, que porte `VoiceFrame.Continuity`.
- **La durée** (« la note tient depuis quinze secondes ») **vit dans le Gameplay**, chez chaque objet consommateur.

Règle générale : **`Voice.Core` lisse la mesure, `Gameplay` accumule le sens.**

**Pourquoi :**

- `VoiceFrame` reste un instantané daté, donc valide comme paquet réseau — pas un cumul
- La politique de durée diffère par objet : le monte-meuble veut quinze secondes, apaiser un monstre en veut trois. L'imposer dans l'analyse forcerait une politique unique
- Le lissage qui rend une mesure *utilisable* (enveloppe, médiane, hystérésis) reste dans Core : tous les consommateurs doivent s'accorder sur « à quel point tu parles fort »

**Précisions actées :**

- L'état de Core sera **centralisé dans un seul type**, le futur `VoiceAnalyzer`. Partout ailleurs, des fonctions pures.
- **Un tampon de travail n'est pas un état — tant qu'un seul thread y touche.** Un objet d'analyse avec des tampons pré-alloués est conceptuellement pur, mais deux threads s'écraseraient mutuellement leurs calculs. **Règle : un objet d'analyse n'est jamais partagé entre threads.** Écrite dans le code, pas seulement ici.

**Conséquences −:**

- Chaque objet de gameplay devra implémenter sa propre accumulation, avec ses seuils et son hystérésis
- Si l'analyse passe un jour sur un worker, chaque worker aura ses propres instances

---

## 2026-07-27 — Pas de champ vide : un type par mesure réellement produite

**Contexte :** Il était prévu d'ajouter `F0Hz` et `Aperiodicity` au type de mesure brute existant. Or ce type est ce que retourne le mesureur d'intensité, qui ne calcule aucune hauteur.

**Décision :** **Un champ n'existe que le jour où quelque chose le remplit.** La mesure brute est scindée en deux types : `RawLoudness` (RMS, crête) et `RawPitch` (f0, apériodicité, voisement).

**Pourquoi :**

- Un champ qui vaut toujours zéro est un **mensonge silencieux** : quelqu'un le lira dans six mois en croyant à une vraie mesure. Un champ absent est honnête.
- Même raisonnement que la garde qui force `VoiceFrame.Pitch` à zéro quand `Voiced` est faux : on rend l'erreur impossible plutôt que documentée
- Chaque producteur retourne exactement ce qu'il mesure

**Conséquences −:**

- Deux types au lieu d'un, et un type combiné à créer le jour où le `VoiceAnalyzer` aura besoin d'assembler les deux

---

## 2026-07-27 — Détection de hauteur : YIN, décimation à 8 kHz, plage 70–600 Hz

**Contexte :** Il fallait un algorithme de détection de fréquence fondamentale robuste aux erreurs d'octave et assez léger pour tourner ~50 fois par seconde et par joueur.

**Alternatives écartées :**

- **Autocorrélation brute** : confond systématiquement une note et son octave inférieure
- **pYIN** : meilleur, mais lissage probabiliste par HMM — trop lourd pour le gain
- **CREPE** (réseau de neurones) : hors de question en temps réel dans un jeu

**Décision :** **YIN** (de Cheveigné & Kawahara, 2002), sur du son décimé à **8 kHz**, plage de recherche **70–600 Hz**, seuil d'apériodicité **0,15**, fenêtre de 256 échantillons. Tous ces paramètres passent par constructeur.

**Pourquoi 600 Hz et pas 400 :** un plafond trop bas ne rend pas la mesure prudente, il la **falsifie**. Si la vraie hauteur est au-dessus, le décalage correct est absent de la recherche et l'algorithme retourne le meilleur creux restant — c'est-à-dire une octave en dessous. On fabriquerait l'erreur qu'on cherche à éviter, précisément sur les cris et les rires dont le jeu est fait. Le coût est de +7 % de décalages à tester.

**Pourquoi 600 Hz et pas plus haut :** c'est la limite de résolution d'une décimation à 8 kHz. Deux décalages voisins sont séparés de 85 cents à 400 Hz, 128 cents à 615 Hz, mais 204 cents à 1000 Hz — au-delà de ~600 Hz on extrapole plus qu'on ne mesure.

**Les quatre défenses contre l'erreur d'octave :**

1. Normalisation cumulative de YIN — pénalise structurellement les décalages longs *(implémentée)*
2. Premier creux sous le seuil, jamais le minimum global *(implémentée)*
3. Filtre médian temporel sur ~5 trames *(à venir, dans le `VoiceAnalyzer`)*
4. Plage restreinte autour de la hauteur calibrée du joueur *(à venir)*

**Décimation :** obligatoirement précédée d'un filtre passe-bas. Sans lui, un sifflement à 7 900 Hz réapparaîtrait à 100 Hz, en pleine plage vocale. Filtre à sinus cardinal fenêtré (Blackman), 81 coefficients, coupure à 3 200 Hz — atténuation mesurée à **91 dB** à 7 900 Hz.

**Conséquences −:**

- La hauteur exige une fenêtre plus longue que le volume (~46 ms contre 21 ms) : les deux mesures lisent le même tampon, pas la même profondeur
- Estimations de coût (~6 µs décimation, ~25 µs YIN) **non mesurées** — à instrumenter quand le `VoiceAnalyzer` tournera dans Unity
- Si des cris au-delà de 600 Hz s'avèrent compter, la bonne réponse est de monter la cadence décimée à 12 kHz, pas d'élargir la plage de décalages

---

## 2026-07-27 — Le voisement exige une porte de volume, pas seulement l'apériodicité

**Contexte :** Découvert en écrivant les tests du détecteur de hauteur (YIN). Un sinus à 7 900 Hz passé dans le décimateur est atténué de **91 dB** — le filtre anti-repliement fonctionne parfaitement. Pourtant YIN déclare le résidu **voisé, à 100,0 Hz, avec une apériodicité de 0,0000**.

**Cause :** YIN est **aveugle au volume par construction**. Sa normalisation cumulative compare le signal à lui-même : un résidu minuscule mais parfaitement régulier reste parfaitement régulier. Aucun filtre, si raide soit-il, ne corrige cela — il rend seulement le résidu plus discret.

**Décision :** **Le voisement = périodique ET assez fort.** La porte de volume est obligatoire, et elle vit dans le `VoiceAnalyzer`, pas dans le `PitchDetector`.

**Pourquoi :**

- Le seuil de volume dépend du **profil calibré du joueur** — donnée que le détecteur de hauteur ne connaît pas, et ne doit pas connaître (il resterait pur et sans état)
- Sans cette porte, tout bourdonnement de fond serait entendu comme une note franche pendant les silences : un frigo, un ventilateur, un ronflement de secteur à 50 Hz. Le Matelas à Mémoire de Ton réagirait au frigo.
- C'est aussi la porte qui empêchera le bruit de fond de faire vibrer les meubles en permanence

**Conséquences −:**

- Un seuil de plus à calibrer par joueur (plancher de bruit), à mesurer pendant la calibration en même temps que le repos, la médiane et le cri
- Le `PitchDetector` retourne donc un `IsVoiced` **incomplet** : il signifie « périodique », pas « voisé au sens du jeu ». Le nom est conservé mais la nuance est documentée dans le test `UnAiguReplie_EstQuasiEfface_MaisResteJugePeriodique`, qui fige ce comportement pour que personne ne le « corrige » par erreur.

---

## 2026-07-27 — Séparation des voies audio : analyse = brut, communication = traité

**Contexte :** Les chaînes de préprocessing vocal (VAD, AGC, suppression de bruit) sont conçues pour isoler la parole et supprimer tout le reste. Or le gameplay repose sur des signaux que ces briques détruisent précisément : le chuchotement (faible énergie, largement non-voisé) et les sons percussifs type claquement de langue (transitoires non-parole). L'AGC, lui, normalise le volume — c'est-à-dire qu'il efface l'écart chuchotement/cri, la mécanique n°1 du jeu.

**Décision :** **Deux voies distinctes sur le même micro.**

- **Voie communication** → signal traité (VAD, AGC, suppression de bruit, AEC). Envoyée au chat vocal. Objectif : confort d'écoute.
- **Voie analyse** → signal **brut**, prélevé avant tout traitement. Envoyée à la FFT. Objectif : vérité du signal.

**Pourquoi :**

- Sans ça, le Vase de l'Écho (écholocation par claquements) ne fonctionne pas du tout : le son est supprimé en amont
- Le chuchotement, registre central du jeu, deviendrait instable ou muet
- L'AGC annulerait la distinction volume qui porte toute la Voice-Physics
- L'AEC reste souhaitable sur la voie communication — elle règle au passage le point larsen du BACKLOG
- Bonus gratuit : le **crest factor** (rapport crête/RMS) calculé sur le signal brut discrimine le percussif du continu — c'est exactement la 3ᵉ brique de la grille voice-physics, sans traitement supplémentaire

**Conséquences −:**

- Hypothèse de travail : Dissonance expose le buffer de capture **avant** VAD/AGC. **À confirmer dans l'API au POC audio** (tracé au BACKLOG)
- Si l'hypothèse est fausse : capture micro parallèle à Dissonance = deuxième accès au périphérique, complexité et risque de conflit de device
- Charge CPU : deux chaînes au lieu d'une
- Le VAD ne peut pas servir de garde pour économiser la FFT — l'analyse doit tourner même quand le VAD dit « pas de parole »

---

## 2026-07-27 — La portée du bruit n'est jamais affichée au joueur

**Contexte :** Le joueur doit-il voir le rayon de propagation de sa voix, ou savoir qu'il a alerté un monstre ?

**Alternatives écartées :**

- Onde de choc visuelle centrée sur le joueur : illisible à 4 joueurs dans une pièce, et coût GPU pour une information redondante
- Jauge d'alerte / indicateur de détection : transforme la paranoïa en lecture d'interface

**Décision :** **La portée sonore est de la plomberie interne. Aucun retour visuel, aucune jauge, aucun indicateur de détection.**

- Le sonomètre porté par le joueur mesure **ce qu'il émet**, jamais **ce que ça provoque**
- Le seul retour est diégétique : la réaction du monstre lui-même (il s'arrête, tourne la tête, change de direction)
- L'apprentissage de sa propre zone d'influence se fait par essai-erreur, partie après partie

**Pourquoi :**

- L'incertitude *est* la mécanique de paranoïa — l'afficher la supprime
- Un monstre lisible cesse d'être effrayant
- Coût nul : rien à produire, rien à synchroniser en réseau
- Cohérent avec la règle « pas de HUD informatif » du GDD Partie 1 §1.9

**Conséquences −:**

- Courbe d'apprentissage plus rude sur les premières parties (accepté : c'est un jeu de soirée répétée, pas un jeu à session unique)
- Le feedback de réaction des monstres devient critique en lisibilité — c'est le seul canal, il doit être irréprochable
- Impossible de debug le gameplay à l'œil : prévoir un mode debug visuel réservé au développement

---

## 2026-07-06 — Séparation LOG / BACKLOG

**Contexte :** Besoin de tracker les décisions finales vs les questions non résolues.

**Décision :** Deux fichiers distincts dans Obsidian.

- **LOG** = décisions tranchées uniquement (ce fichier)
- **BACKLOG** = points ouverts, à trancher plus tard

**Pourquoi :**

- LOG reste "stable", lisible, trace historique claire
- BACKLOG = zone de travail, évite la pollution du LOG
- Ctrl+F sur LOG = certitude (pas de "à trancher" mélangé)
- Backlog peut utiliser checkboxes/tags pour l'avancement

**Conséquences −:**

- Deux fichiers = deux endroits à consulter (mitigé par MOC)
- Risque de décision oubliée entre les deux (discipline requise)

---

## 2026-07-06 — MOC comme sommaire pur (redirecteur)

**Contexte :** Besoin d'une page d'accueil claire pour naviguer dans la documentation sans la surcharger.

**Décision :** MOC = Table des Matières UNIQUEMENT.

- Contient : vision du jeu, pitch, liens vers systèmes, stack technique
- Ne contient PAS : contenu détaillé, décisions, tâches (celles-ci vont dans leurs fichiers respectifs)

**Pourquoi :**

- MOC reste lisible même après 6 mois de dev
- Nouvelles personnes trouvent rapidement ce qu'elles cherchent
- Évite de gonfler le MOC = pas de "bullshit accumulation"
- Maintient une hiérarchie claire (MOC → Systèmes → Décisions/Tech)

**Conséquences −:**

- MOC n'est jamais "complet" (référence seulement, pas source)
- Faut mettre à jour les liens si on renomme un fichier (discipline)

---

## 2026-07-06 — Scope plateforme : PC / Steam uniquement

**Contexte :** Décision fondatrice de la cible de déploiement et des technologies.

**Décision :** Jeu développé et déployé **PC (Windows/Linux/Mac) via Steam uniquement**.

- Pas de consoles (PS5, Xbox)
- Pas de mobile
- Pas de web
- Pas de cross-plateforme serveur (tout sur Steam P2P)

**Pourquoi :**

- Scope contrôlé = dev plus rapide (jeu coop petit groupe, amis)
- Steam P2P = infra gratuite, pas de serveur dédié à maintenir
- API Steamworks = stable, mature, bien documentée
- Audience cible = joueurs PC hardcore (genre Lethal Company)

**Conséquences −:**

- Aucune flexibilité console ou mobile future (rewrite nécessaire)
- Dépendance totale à Steam (si Valve ferme l'API = bloqué)
- Pas de cross-plateforme : joueurs console/mobile exclus
- Implique que toute l'archi réseau (FishNet + Steamworks) doit être PC-first

---

## 2026-07-05 — Hotplug microphonique : à traiter en phase post-alpha

**Contexte :** Joueur peut débrancher son micro accidentellement pendant la partie ; faut-il le récupérer automatiquement ou forcer rejoin ?

**Décision :** **Nice-to-have, reporter après alpha 1.0.**

- Pour alpha : accepter que le joueur soit muet s'il débranche
- Post-alpha : implémenter reconnexion auto ou bouton "Reconnect Mic"

**Pourquoi :**

- Cas d'usage rare (playtests petit groupe contrôlé)
- Complexité d'implémentation moyenne (monitor + retry logic)
- Priorité plus basse que la stabilité core (voix + gameplay)

**Conséquences −:**

- Alpha aura ce "bug" mineur (joueur muet post-débranch)
- Faut tracker en BACKLOG pour ne pas oublier

---

## 2026-07-05 — Réseau pour l'audio : Dissonance + FishNet sessions parallèles

**Contexte :** Deux frameworks réseau potentiels : Dissonance gère déjà le transport voix ; faut-il l'utiliser ou passer tout par FishNet ?

**Décision :** **Deux couches réseau découplées.**

- Dissonance = transport audio (voix, codec optimisé)
- FishNet = sync gameplay (FFT data, objets, états)

**Pourquoi :**

- Chaque outil fait ce qu'il fait le mieux (séparation des responsabilités)
- Dissonance = low-latency codec vocal (optimisé pour la voix)
- FishNet = deterministic state sync (optimisé pour gameplay)
- Découplage = flexibilité future (swap Dissonance pour autre sans toucher FishNet)

**Conséquences −:**

- Deux "handshakes" réseau à gérer (Dissonance join channel + FishNet spawn)
- Config plus complexe (deux systèmes à initialiser en parallèle)
- Latence combinée à tester en prod (Dissonance + FishNet + FFT processing)
- À vérifier : Dissonance a-t-il une intégration FishNet officielle ?

---

## 2026-07-05 — Capture et analyse audio : analyse locale, transmission des features

> *Corrigé le 2026-07-27. La rédaction initiale décrivait une FFT côté serveur sur le flux reçu via Dissonance ; c'était une erreur de rédaction, l'intention a toujours été d'analyser en local. La correction est rendue nécessaire par la décision du 2026-07-27 sur la séparation des voies audio.*

**Contexte :** Chaque joueur a sa voix ; besoin de l'analyser indépendamment. Où place-t-on l'analyse ?

**Alternatives écartées :**

- **FFT côté host sur le flux Dissonance** : ce qui traverse le réseau est le signal *après* VAD, *après* réduction de bruit, et encodé par un codec vocal. Le VAD ne transmet pas les trames sous son seuil — chuchotements et sons percussifs n'arriveraient jamais au host — et le codec jette précisément la texture fine d'un murmure. Incompatible avec la décision « analyse sur signal brut ».
- **Envoi de l'audio brut au host pour analyse** : bande passante disproportionnée, et redondant avec le transport Dissonance.

**Décision :** **Analyse côté client sur le micro brut local, transmission des features au host.**

1. Client : capture micro **brute**, en amont de tout traitement de confort
2. Client : analyse locale (RMS, f0, crest factor, énergies par bande)
3. Client : normalisation sur son profil de calibration personnel
4. Client → Host : paquet de features à cadence fixe (~20-30 Hz)
5. Host : applique distance et cumul multi-joueurs, décide de la physique, broadcast

**Pourquoi :**

- Seul le client dispose du signal brut fidèle — c'est la condition de la décision du 2026-07-27
- Le host reste **autoritaire sur la physique** : l'autorité porte sur la décision de gameplay, pas sur la mesure
- Charge CPU du host quasi nulle (plus de N × FFT, plus de pool FMOD)
- Bande passante minimale (~5 floats par joueur et par trame)
- **Supprime la dépendance bloquante à l'API Dissonance** : le client n'a besoin que de son propre micro. Dissonance sort du chemin critique et redevient du transport vocal pur.
- Le format transmis épouse la grille à trois briques du GDD (volume / hauteur / forme temporelle)

**Conséquences −:**

- Un client modifié peut mentir sur ses features. Accepté : en coop entre amis sur Steam P2P, mentir n'allège que son propre objet, sans classement ni économie à truquer. Le host borne les valeurs reçues.
- La calibration devient une donnée de session à transmettre au host à la connexion
- L'ordre des blocs change : la capture d'analyse n'est plus alimentée par Dissonance mais par le micro directement (mettre à jour [[SYS - Audio & Voix]])

---

## 2026-07-04 — Analyse audio : FMOD + FFT natif (vs Vivox metrics)

**Contexte :** Besoin d'analyser **fréquences** de la voix (graves/aigus) pour trigger gameplay différencié.

**Alternatives écartées :**

- Vivox DSP metrics : fournirait volume + énergies globales, mais **pas granularité fréquences** (insuffisant)
- WebAudio FFT : natif browser, inapplicable à Unity
- Plugin DSP custom : trop complexe, trop lent

**Décision :** **FMOD + FFT local par joueur**

**Pourquoi :**

- FMOD = DSP professionnels, FFT haute-qualité intégré
- Accès direct buffer Dissonance → FMOD → FFT (pipeline clair)
- Temps-réel en CPU acceptable (<10% par joueur à ~1024 samples)
- Flexibilité : tu définis tes bandes fréquences (graves/médium/aigus) sans re-code

**Conséquences −:**

- Courbe d'apprentissage FMOD (mais asset store gratuit + docs)
- FFT tous les 20-40ms = cost CPU (acceptable pour <8 joueurs)
- Faut gérer buffers circulaires proprement (sinon memory leaks)
- À tester : latence FFT + traitement serveur (cumul avec réseau)

---

## 2026-07-04 — Transport réseau : Facepunch.Steamworks + FishyFacepunch

**Contexte :** FishNet choisie, mais quel transport P2P pour Steam ? Custom, asset store, ou Facepunch officiel ?

**Alternatives écartées :**

- Steamworks.NET (binding C#) : obsolète, maintenu passivement
- Asset Store Steam plugins : obscurs, dépendances cachées, support incertain
- Mirror + Steamworks custom : combinaison moins testée

**Décision :** **Facepunch.Steamworks (NuGet) + FishyFacepunch (transport officiel FishNet)**

**Pourquoi :**

- Facepunch.Steamworks = binding C# moderne, maintenu activement par Facepunch
- FishyFacepunch = transport plug-and-play pour FishNet (officiel FishNet)
- Pas d'Asset Store = contrôle total du code, versionning transparent
- Intégration native : Steam P2P, lobbies, matchmaking sans wrapper

**Conséquences −:**

- Installation via NuGet (vs Asset Store importer) = apprentissage gestion dépendances
- Dépend de la stabilité Facepunch.Steamworks (risque faible, Facepunch = studio responsable)
- **Critique :** AppID Steam doit être configuré avant test multijoueur (fixture)
- Pas de GUI Steam intégré (à implémenter soi-même ou trouver asset compatible)

---

## 2026-07-03 — Topologie réseau : Host + Clients (P2P Steam)

**Contexte :** Jeu coop petit groupe (amis), pas besoin de serveur dédié. Quelle archi réseau ?

**Alternatives écartées :**

- Peer-to-peer pur : pas d'autorité unique, risque de desync et cheat facile
- Serveur dédié : overkill budgétaire + latence inutile pour casual coop
- Client/Server classique : même coût serveur qu'un dédié

**Décision :** **Host + Clients via Steam P2P (FishNet Server Authoritative)**

**Pourquoi :**

- Host = un joueur fait autorité, valide toutes les actions (anti-cheat mécanique)
- P2P Steam = pas d'infra serveur externe à maintenir
- Scalable pour petit groupe : <8 joueurs sans souci
- Host migration supportée par FishNet (mais complexe, voir BACKLOG)

**Conséquences −:**

- Si host disconnect : faut implémenter migration (post-alpha, actuellement kick tout le monde)
- Latence = latence Steam P2P (~50-100ms intra-Europe, acceptable)
- Host doit avoir bandwidth upload correct (pas de soucis pour petit groupe)
- Host devient bottleneck si calculs lourds (FFT server-side = validé pour <8 joueurs)

---

## 2026-07-03 — Réactivité des objets : sensibilité par bande de fréquences

**Contexte :** Gameplay basé sur le fait que objets réagissent **différemment selon la voix**, pas juste volume.

**Alternatives écartées :**

- Réactivité sur volume seul : tous objets réagiraient pareil = monotone, pas fun
- Réactivité sur énergies globales (Vivox) : pas assez granularité fréquencielle

**Décision :** **Chaque objet "sensible" à une bande de fréquences (graves = lourd, aigus = fragile)**

- Typiquement 3-5 bandes : <100Hz, 100-500Hz, 500-2kHz, >2kHz
- Chaque objet a ses seuils par bande

**Pourquoi :**

- Crée de la diversité gameplay : joueurs doivent adapter **comment** ils parlent
- Réaliste : lit répond aux graves (résonance), lampe aux aigus
- Mécanique centrale du jeu = justifie la complexité FFT
- Accessibilité future : joueur peut choisir sa technique vocale

**Conséquences −:**

- FFT obligatoire (pas de shortcut sur volume seul)
- Faut tester si joueurs peuvent vraiment **contrôler** leur voix (playtests critiques)
- Tuning gameplay long (chaque objet = seuils différents)
- Accessibilité : peut être difficile pour joueurs avec dysphonie (à garder en tête)

---

## 2026-07-03 — Où calculer les effets physiques : Server (Host) only

**Contexte :** Objets doivent réagir à la voix ; où décider des mouvements pour garantir cohérence + anti-cheat ?

**Alternatives écartées :**

- Client-side prediction : chaque joueur calcule = risque de desync
- Client → Server → broadcast : travail dupliqué, latence
- Hybrid (client predict + server validate) : trop complexe pour coop casual

**Décision :** **Server (Host) calcule SEUL, broadcast résultat à tous clients**

- Server reçoit FFT data de tous les joueurs
- Server décide si objets bougent, comment, où
- Server broadcast nouvel état physique aux clients

**Pourquoi :**

- Source unique de vérité = pas de desync jamais
- Anti-cheat mécanique : joueur ne peut pas "fake" des fréquences
- Responsabilité claire : host = garant cohérence
- Déterminisme possible (si besoin de rejeu/replay)

**Conséquences −:**

- Host doit calculer FFT pour **tous** les joueurs (cost CPU acceptable <8 joueurs)
- Clients reçoivent états finaux (pas de contrôle local immédiat)
- Host lag = tout le monde lag (acceptable petit groupe, peut être intra-LAN)
- Host migration complexe (post-alpha) : nouveau host reprend calculs

---

## 2026-06-30 — Modularité audio : Blocs découplés (capture → analyse → effet)

**Contexte :** Besoin d'architecture maintenable pour futur (plus tard : autre système audio, autre analyse, autre gameplay).

**Alternatives écartées :**

- Tout dans un script "AudioManager" : spaghetti code, impossible à tester
- Pas de séparation : couplage fort, rigide

**Décision :** **Architecturer par blocs élémentaires, découplés via interfaces/events**

Architecture logique :

```
Dissonance (capture voix)
    ↓
VolumeWatcher (émet niveau audio)
    ↓
AudioAnalyzer (FFT, émet fréquences par bande)
    ↓
WhiteEffect / OtherEffects (consomment fréquences + volume)
```

**Pourquoi :**

- Chaque bloc = responsabilité unique, testable indépendamment
- Réutilisable : WhiteEffect peut consommer autres sources (pas juste Dissonance)
- Maintenable : swap FFT v2 sans toucher capture ou effet
- Scalable : facile d'ajouter nouveau bloc (ex: EmotionAnalyzer plus tard)
- Documentable : chaque bloc = contrat clair (inputs/outputs)

**Conséquences −:**

- Plus de fichiers (mais structure claire)
- Dépendances inter-scripts via interfaces (à documenter)
- Risk : sur-engineering si pas assez de complexité (mitigé : architecture légère au départ)

---

## 2026-06-28 — Framework réseau : FishNet

**Contexte :** Besoin d'un framework réseau robuste, scalable, maintenu activement pour jeu coop multijoueur Steam.

**Alternatives écartées :**

- Mirror : communauté large, mais architecture moins moderne
- Netcode for GameObjects (Unity) : bon, mais moins de doc Steamworks natif
- Custom networking : trop coûteux en dev/test/maintenance

**Décision :** **FishNet (Fish-Networking)**

**Pourquoi :**

- Moderne, bien maintenu, architecture claire (Server Authoritative par défaut)
- Transport Steam officiel (FishyFacepunch) = intégration native
- Gratuit, open-source, pas de dépendances obscures
- Communauté croissante avec bonnes docs + exemples
- Server authoritative = good for anti-cheat mécanique

**Conséquences −:**

- Dépend de stabilité FishyFacepunch (risque faible, Facepunch behind)
- Server Authoritative = pas de client-side prediction facile (ok pour casual coop)
- Courbe d'apprentissage (framework spécialisé, pas simple)
- Documentation parfois éparse (mais communauté Discord active)

---

## 2026-09-02 — Répartition du travail entre Claude Code et Claude (Cowork/chat)

**Contexte :** Le projet est maintenant travaillé en alternance entre Claude Code (accès natif complet au dossier `Shut_up_and_carry`, shell local) et Claude en mode Cowork/chat (accès au dossier via un pont distant, pas de shell local — chaque écriture d'un fichier existant passe par un aller-retour rapatrier/éditer/renvoyer). Il fallait fixer où chacun intervient, et si ce vault Obsidian restait la source de vérité unique.

**Décision :**

- **Claude Code** : implémentation — code C#/Unity, refactoring, tests, git. Travail mécanique en volume sur les fichiers du projet.
- **Claude (Cowork/chat)** : discussion d'architecture, arbitrages de game design / level design, rôle de Lead Architecte / Rubber Duck défini dans les instructions du Project. Écrit directement dans ce LOG et dans `BACKLOG - Points ouverts.md` une fois qu'une décision est actée en conversation.
- Le vault Obsidian (`Obsedian_SUAC/`) reste l'unique bible du projet — pas de fichier de décisions parallèle créé côté Project Claude.ai. Format markdown + wikilinks conservé tel quel, pas de migration vers un autre outil.

**Pourquoi :**

- Séparer le contexte de code (Claude Code) du contexte de discussion longue (Claude/Cowork) évite de polluer l'un avec l'autre
- Le markdown/Obsidian est déjà l'outil le plus portable entre les deux : aucune raison de dupliquer ou de migrer
- Deux plugins MCP vus installés dans le vault (`vault-mcp-connector`, `mcp-tools-istefox` — ce dernier expose un serveur MCP local sur le port 27200, pensé pour Claude Desktop/Claude Code) : à brancher pour donner à Claude Code (et potentiellement Claude/Cowork via le pont vers Claude Desktop) un accès plus riche que la lecture/écriture fichier brute — recherche sémantique, gestion de fichiers. Câblé le jour même côté Claude Desktop (extension .mcpb, vérifié via `get_server_info`) et côté Claude Code (`claude mcp add --scope user`, endpoint `http://127.0.0.1:27200/mcp`). `vault-mcp-connector` reste installé mais désactivé (absent de `community-plugins.json`) — pas de conflit, pas de nettoyage nécessaire pour l'instant.

**Conséquences −:**

- Toute décision actée en chat doit être répercutée ici pour que Claude Code (qui n'a pas accès à la conversation) la voie
- Si le MCP vault se branche, cette entrée est à mettre à jour avec le protocole d'accès effectif

---

## 2026-09-02 — Le vault devient son propre dépôt git privé, séparé du code

**Contexte :** Le vault n'avait aucune sauvegarde jusqu'ici. Il sert maintenant de source de vérité lue/écrite par deux agents IA (Claude Cowork, Claude Code) — une édition ratée sans filet de rattrapage devient un risque réel, pas hypothétique.

**Décision :** Dépôt git séparé du repo du code Unity, privé, sur le même compte GitHub (`devonemoretry-sacha`) : https://github.com/devonemoretry-sacha/Shut_up_and_carry-vault. Créé et poussé par Claude Code (`git init` / `gh repo create --private` / `git push`). `.gitignore` dédié exclut `.obsidian/plugins/` (dont le token MCP en clair de `mcp-tools-istefox`), `.obsidian/workspace.json` et `.obsidian/workspace-mobile.json`. Premier commit vérifié par le user (`git show --stat HEAD`) : rien de sensible dedans.

En même temps, le dossier a été renommé **`Obsedian SUAC/` → `Obsedian_SUAC/`** (espace retiré) par Claude Code au moment de la mise en place du repo.

**Pourquoi :**

- Pas de repo unique avec le code Unity : cycles de vie différents, et les plugins Obsidian embarquent des binaires (`main.js` compilés) et des secrets qui n'ont rien à faire dans un historique de code
- Un repo git local seul n'aurait pas résolu le problème de sauvegarde (rien hors machine) : il fallait un remote
- Exclusion du dossier `plugins/` non négociable : c'est le seul endroit du vault où un secret vit en clair

**Conséquences −:**

- Toute référence à l'ancien chemin `Obsedian SUAC/` (avec espace) est obsolète, y compris dans les notes de configuration côté Project Claude.ai — à corriger au fil de l'eau si on en recroise
- Le renommage a temporairement cassé l'accès MCP au vault côté Cowork (le serveur local du plugin ne retrouvait plus son propre `data.json` tant qu'Obsidian n'a pas rechargé le vault au nouveau chemin) — repris une fois Obsidian relancé sur `Obsedian_SUAC/`

---

## 2026-09-02 — Unity CLI branché en MCP, côté Claude Code uniquement

**Contexte :** Unity a proposé le Unity CLI au démarrage de l'Editor. Il remplace l'ancien serveur MCP intégré au package "AI Assistant" (désormais déprécié) et expose, via le package Pipeline, un pilotage de l'Editor en direct : scène, scripts, console, tests, build — plus une commande `unity command eval` qui exécute du C# arbitraire dans l'Editor en cours d'exécution.

**Décision :** Unity CLI + package Pipeline installés. MCP configuré côté **Claude Code uniquement** (`unity mcp configure claude-code`, qui délègue à `claude mcp add --scope user --transport stdio unity-editor-mcp unity mcp`). Connexion vérifiée : `claude mcp list` montre `unity-editor-mcp` connecté. **Pas branché côté Claude Desktop** (option `unity mcp configure claude` disponible mais délibérément pas utilisée).

**Pourquoi :**

- `eval` exécute du C# arbitraire dans l'Editor — plus proche en puissance d'un shell générique que d'un accès scopé comme le MCP Obsidian. Un vrai gain (boucle fix → test → vérification autonome pour Code) mais pas un outil à distribuer largement.
- Claude Desktop est l'appli qui héberge aussi les sessions Cowork (vérifié avec le connecteur Obsidian : tout ce qui est branché dans `claude_desktop_config.json` devient accessible aux sessions Cowork). Y brancher Unity CLI aurait donné cet accès à Cowork sans besoin identifié — contraire à la répartition Code = exécution / Cowork = discussion déjà actée plus haut dans ce LOG.
- Outil encore étiqueté expérimental par Unity — traiter la configuration comme provisoire, à revisiter si l'outil évolue.

**Conséquences −:**

- Ne pas activer `eval` en continu sans besoin actif — c'est la capacité la plus sensible du lot
- Si un jour Cowork a besoin d'un accès en lecture à l'état de l'Editor, ça devra être une décision explicite séparée, pas un effet de bord de la config Code

**Suivi :** Première vérification (`claude mcp list` → connecté) trompeuse — une session Code démarrée ensuite tombait en `CONNECTION_CLOSED`, `unity` introuvable dans son PATH. Cause : PATH utilisateur mis à jour par l'installeur Unity CLI pendant qu'une session Code/terminal plus ancienne tournait déjà (Windows n'actualise le PATH d'un processus qu'à son démarrage). Résolu en relançant Code avec un environnement frais — statut à re-confirmer si le symptôme réapparaît après un redémarrage de la machine.

---

## 2026-09-02 — Bascule de l'IDE : Visual Studio → JetBrains Rider

**Contexte :** Le plugin `unity-coding-skills` (Claude Code, installé le jour même) suppose un serveur MCP intégré à JetBrains Rider (2026.2.1+) pour ses skills `run-tests` et une partie de `fix-bug` — indisponible sous Visual Studio. Comparaison Rider/VS faite en conversation Cowork : Rider devant en refactoring, analyse statique (>1300 règles vs >600), debugging, performance sur grosses solutions, et intégration Unity native (compréhension des `.asmdef`, lecteur de logs Unity, Unity Test Framework intégré). VS garde l'avantage sur l'écosystème d'extensions et la gratuité inconditionnelle (édition Community). Le user ne maîtrise pas profondément VS — coût de bascule faible.

**Décision :** Bascule de l'IDE principal de Visual Studio vers JetBrains Rider, sur licence non-commerciale gratuite (couvre hobby/self-education/open source tant que le projet n'est pas commercialisé).

**Alternative écartée :** Garder Visual Studio et piloter les tests Unity via le mode CLI batch d'Unity depuis Claude Code (`-batchmode -runTests`), pour éviter toute dépendance supplémentaire. Écartée : le user est disposé à changer d'IDE et préfère le workflow packagé du plugin plutôt qu'un contournement à maintenir.

**Pourquoi :**

- Débloque le cycle complet de `unity-coding-skills` (`run-tests`, `fix-bug`) tel que conçu par le plugin
- Meilleure analyse statique / refactoring / debugging pour un dev solo qui porte seul la maintenance long terme du projet
- Coût de bascule faible : pas d'expertise Visual Studio acquise à perdre

**Conséquences −:**

- Licence non-commerciale à re-vérifier/basculer en payante au lancement commercial (Steam) — coût futur à budgéter, pas immédiat
- Migration technique à faire à la reprise (cf. section Outils & Environnement de [[BACKLOG - Points ouverts]])

---

## 2026-09-02 — Reprise du projet Unity à zéro

**Contexte :** Le projet Unity actuel porte des résidus de configuration Visual Studio (fichiers `.csproj`/`.sln` générés, ajustements `.gitignore`, `TargetFramework` modifié sur `Tests.csproj`) et d'External Script Editor. Peu de code de gameplay existe encore à ce stade — l'essentiel de ce LOG documente des décisions d'architecture (découpage assemblies, frontière brut/normalisé, FishNet), pas un gros corpus de code déjà écrit.

**Décision :** Le projet Unity est repris à zéro (nouveau projet propre) plutôt que migré/nettoyé en place, au moment de basculer sur Rider.

**Pourquoi :**

- Le faible volume de code existant rend une reprise à zéro moins coûteuse qu'un nettoyage résiduel de la config VS
- Garantit un projet configuré nativement pour Rider dès le départ, sans résidu

**Conséquences −:**

- Les décisions d'architecture déjà actées dans ce LOG (`Assets/_Project`, assemblies `SUAC.Voice.Core`/`Capture`/`Gameplay`/`Tests.EditMode`, frontière brut/normalisé, FishNet) restent valables et font foi — c'est ce LOG la référence à reproduire dans le nouveau projet, pas l'ancien code qui est écarté
- Le sort du repo git du code Unity actuel (nouveau repo vs reset de l'existant) n'est pas tranché — cf. [[BACKLOG - Points ouverts]]
- Le vault Obsidian n'est pas concerné par cette remise à zéro : aucune donnée du vault n'est perdue, il reste la source de vérité

---

## 2026-09-02 — Claude Code : nouvelle conversation dédiée au code

**Contexte :** La conversation Claude Code en cours a accumulé du contexte devenu obsolète avec la bascule Rider et la reprise à zéro du projet (nettoyage Visual Studio, expérimentation Unity CLI/MCP sur l'ancien projet, ancien chemin de fichiers).

**Décision :** Le user ouvrira une nouvelle conversation Claude Code, dédiée exclusivement à l'implémentation sur le projet repris à zéro, plutôt que de continuer la conversation existante.

**Pourquoi :**

- Évite que Code s'appuie sur des informations caduques (ancienne config VS, ancien état du projet)
- Garde son contexte concentré sur l'implémentation, conformément à la répartition déjà actée (cf. entrée 2026-09-02 « Répartition du travail entre Claude Code et Claude (Cowork/chat) »)

**Conséquences −:**

- Toute règle stable qu'on veut voir persister doit vivre dans le futur `CLAUDE.md`, pas dans l'historique de conversation qui sera abandonné — renforce d'autant la nécessité de ce fichier

---

## Navigation

[[MOC - Shut-up & Carry]] | [[BACKLOG - Points ouverts]] | Haut ↑