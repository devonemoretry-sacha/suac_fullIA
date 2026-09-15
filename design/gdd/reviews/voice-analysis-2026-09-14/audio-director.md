# Revue adversariale DSP — `voice-analysis.md`

Lecture complète du document cible, d'ADR-0003 (rétrogradation AEC), et des trois revues antérieures. Les six candidats sont traités un par un, puis quatre problèmes supplémentaires trouvés en creusant la chaîne numérique elle-même.

---

## 1. Le zéro de la sonie — CONFIRMÉ, et affiné

**Hypothèse du document** : au-dessus de `Floor_dB`, toute énergie produit une `Loudness` non nulle et interprétable.

**Pourquoi ça échoue acoustiquement.** La bande 0–7 dB au-dessus d'un plancher correctement calibré (bruit de pièce + bruit propre du micro) n'est **pas** le registre du chuchotement phonétique — c'est celui du souffle sur la capsule, des bruits de bouche, du clavier, des chocs de bureau. Un vrai chuchotement, dans la littérature vocale, se situe environ **15 à 25 dB au-dessus du niveau de parole normale en moins** (donc, ramené au-dessus d'un plancher de pièce silencieuse, plutôt 15–25 dB au-dessus du plancher, pas 0–7). La bande dangereuse que `γ = 0,65` étire le plus n'est donc *pas* celle où vit le chuchotement réel — elle est celle où vivent le souffle et le bruit de manipulation. Le problème n'est pas seulement une question de zéro mal placé, c'est que **rien dans la chaîne ne distingue souffle et chuchotement**, qui partagent la même absence de périodicité (`Voiced = false` pour les deux) et probablement un `CrestDb` voisin — ni l'un ni l'autre n'a de signature crête/RMS spécifiée.

Le correctif déjà arbitré ailleurs (« `Loudness` doit valoir 0 sous `Floor_dB + Margin_dB`, pas seulement sous `Floor_dB` », `voice-object-effect` arbitrage (b)) **n'est pas encore répercuté dans les *Formulas* de ce document** — la formule affichée ligne 280 clampe toujours contre `Floor_dB` seul.

**Sévérité** : BLOQUANT.
**Fix concret** : (a) reporter dans *Formulas* le clamp effectif à `Floor_dB + Margin_dB` — c'est un correctif déjà décidé, pas à redébattre ; (b) ajouter au Protocole A des enregistrements étiquetés séparément « souffle sur capsule », « bruit de bouche », « chuchotement rapproché », et vérifier qu'ils ne se chevauchent pas dans la bande 0–15 dB au-dessus du plancher ; (c) la qualité de la mesure du plancher (déjà signalée comme fragile — P95 sur 3 s, cf. revue calibration) est directement load-bearing ici : un plancher mesuré trop haut resserre l'écart entre bruit de souffle et chuchotement réel.

---

## 2. Texte AEC obsolète — CONFIRMÉ, et le vrai trou est ailleurs que le wording

Quatre occurrences de « post-AEC » (lignes 124, 208, 676, 722), plus « en aval de la fourche AEC (ADR-0003) » (ligne 870) et « avec l'AEC en amont de la fourche » dans OQ-7 (ligne 1370) — six lieux qui décrivent une architecture rétrogradée le 2026-09-08. Correction de forme triviale (remplacer par « brut, sans AEC »).

**Le point qui dépasse le wording.** La revue calibration a déjà classé BLOQUANT (audio-director 1) l'absence de couverture des traitements *amont-du-jeu* : AGC de communication Windows (actif par défaut), APO constructeur, AGC matériel des casques USB, bascule Bluetooth HFP. Ce document — qui est le contrat canonique de la chaîne — **liste toujours uniquement les traitements que le jeu ne doit pas ajouter** (AGC, NS, VAD tiers, compression), jamais ceux que l'OS ou le périphérique appliquent avant que le jeu ne voie l'échantillon. C'est structurellement pire que l'AEC de Dissonance : au moins celle-ci était documentée et son trajet vérifiable. Un profil HFP Bluetooth (bande étroite, 8 ou 16 kHz, AGC et parfois NS embarqués dans le firmware du casque) ou les « améliorations audio » Windows actives par défaut sur l'onglet Communications sont **invisibles à l'API de capture** — aucune ligne de code du jeu ne peut les détecter a posteriori, et rien dans le contrat voisin du système 2 ne les couvre.

**Sévérité** : BLOQUANT (wording) + BLOQUANT (contrat manquant).
**Fix concret** : ajouter au contrat du système 2 (`Ce que les GDD voisins devront porter`) une exigence explicite : détection/documentation du mode partagé vs exclusif WASAPI (le mode partagé route par l'APO Windows), instruction utilisateur de désactiver les « améliorations micro », et un test de dérive de `Floor_dB`/`Scream_dB` sur 20–30 min avec/sans ces réglages (déjà recommandé par la revue calibration — à faire remonter ici, dans le document qui porte la formule).

---

## 3. Crest factor sur fenêtre 21 ms — CONFIRMÉ

**Hypothèse** : `CrestMinDb`/`CrestMaxDb` sont des bornes universelles pour « voyelle tenue » vs « claquement ».

**Pourquoi ça échoue.** Une voix grave à 85 Hz a une période de 11,76 ms : la fenêtre de 21 ms ne capture que **1,8 période**. Un enfant à 400 Hz en capture **8,4**. La crête mesurée sur moins de deux périodes dépend fortement de l'alignement de la fenêtre sur le pouls glottique (un bord de fenêtre tombant en plein pic ou en creux change radicalement `Peak/Rms`), alors que sur 8 périodes l'estimateur est statistiquement stable. Concrètement : pour la même voyelle tenue, une voix grave produira une `Continuity` bien plus bruitée trame à trame qu'une voix aiguë — **structurellement**, pas à cause d'un défaut de contrôle du joueur. C'est exactement le type de disparité que le principe des seuils personnels interdit : ici ce n'est même pas un seuil qui juge, c'est la **fenêtre de mesure elle-même** qui a une résolution différente selon le registre vocal.

Le Protocole A (une voix, trois gestes) ne peut pas détecter ce problème : il calibre `CrestMinDb`/`CrestMaxDb` sur une seule voix, probablement celle du développeur — aucune garantie que les bornes tiennent pour une voix grave ou un enfant.

**Sévérité** : BLOQUANT.
**Fix concret** : refaire le Protocole A avec au moins trois registres (grave ~85–100 Hz, médian, aigu/enfant ~300–400 Hz) avant de figer les bornes ; envisager un test explicite « nombre de périodes dans la fenêtre < 2 → confiance basse » qui bascule sur la dernière valeur tenue plutôt que d'accepter une crête calculée sur un échantillon insuffisant ; noter qu'aucun lissage n'existe sur `Continuity` (contrairement à `Loudness`), ce qui laisse passer le bruit de fenêtre sans filtrage.

---

## 4. Jitter comme discriminant de voix — CONFIRMÉ, et le pire cas n'est pas celui envisagé

**Hypothèse** : `JitterMin = 0,5 %` sépare voix humaine et bourdonnement.

**Pourquoi ça échoue, cas 1 — chanteurs entraînés.** Un jitter inférieur à 0,5 % sur une note tenue est **atteignable par une voix entraînée et stable** (jitter opératique documenté descendant vers 0,1–0,3 %). Le mécanisme central du jeu récompense précisément la tenue de note — ce seuil peut donc **rejeter la meilleure exécution possible du geste que le jeu demande**, et c'est un rejet universel, pas calibré par joueur : violation directe du principe « une constante ne juge jamais une voix inhabituelle », posé le 2026-09-14 dans les règles du projet, dans le document même qui l'a inspiré.

**Pourquoi ça échoue, cas 2 — laryngectomie/électrolarynx.** Un électrolarynx produit un ton mécaniquement périodique dont le jitter est du même ordre de grandeur qu'un bourdonnement secteur (quasi nul, par construction électromécanique). Un joueur utilisant ce dispositif **ne pourra jamais franchir la porte de voisement** — exclusion totale et permanente de la mécanique centrale, non nommée dans les trois revues d'accessibilité déjà menées (dysarthrie, bégaiement, hypophonie y figurent ; l'électrolarynx non).

**Cas 3, plus mineur — robustesse du témoin « bourdonnement ».** L'exemple documenté (frigo, jitter ≈ 0,05 %) est vrai pour un moteur synchrone secteur, quasi parfaitement stable. Un ventilateur à vitesse variable ou à roulement usé peut présenter un jitter période-à-période mesurable (turbulence aérodynamique, flottement mécanique) au-delà de 0,5 % — la généralisation « un bourdonnement est toujours trop stable » n'est vérifiée que sur un seul type de source.

**Sévérité** : BLOQUANT (chanteurs, contradiction directe avec le principe du projet) + BLOQUANT (électrolarynx, accessibilité) ; MINEUR (diversité des fixtures de bourdonnement, déjà signalée en filigrane par la revue précédente sous une autre forme).
**Fix concret** : puisque le principe des seuils personnels s'applique, `JitterMin` ne devrait probablement pas être une constante globale — capturer un jitter minimal plausible **pendant la calibration** (étape voyelle tenue), à la manière de `Rest_dB`, plutôt qu'un seuil universel. À défaut, documenter explicitement l'exclusion de l'électrolarynx comme le fait déjà la revue calibration pour d'autres populations, et tester le protocole avec au moins un enregistrement de voix chantée professionnelle avant de figer 0,5 %.

---

## 5. Plage non calibrée 70–600 Hz pendant la calibration — RÉFUTÉ en partie, et un bug plus net trouvé

**La médiane protège-t-elle ?** Non, pas contre le cas qui compte le plus. La médiane-de-5 protège contre une erreur d'octave **isolée** (un point aberrant au milieu de mesures correctes). Elle ne protège **pas** contre un biais **systématique** : si toutes les trames voisées d'un joueur souffrent de la même erreur, la médiane de valeurs uniformément biaisées reste biaisée.

**Le cas concret.** Une voix grave dont le F0 réel se situe **sous 70 Hz** (basses profondes, cas rare mais réel) ne peut, par construction, pas être détectée à sa vraie fréquence pendant l'étape de calibration non calibrée : le plancher de recherche à 70 Hz coupe cette énergie, et YIN accrochera systématiquement une sous-harmonique ou l'harmonique supérieure (souvent une octave au-dessus, ~2×F0). **Toutes** les trames voisées de cette session porteront le même biais — la médiane de cinq valeurs identiquement doublées reste doublée. `F0_habituel` se fige alors une octave trop haut, **de façon permanente** (rien dans les *Edge Cases* ne re-questionne `F0_habituel` après coup), et chaque `Pitch` calculé ensuite pour ce joueur sera décalé de −12 demi-tons de façon persistante pour sa voix réellement habituelle.

Le recadrage documenté (« si médiane/2 < 70 Hz, plage `[70, médiane×2]` ») **arrive après coup** et ne peut pas corriger une médiane déjà fausse à la source — il resserre autour d'une valeur déjà biaisée au lieu de la corriger.

Le risque symétrique en haut (décimation 8 kHz pendant que le F0 réel dépasserait 600 Hz au repos) est comparativement plus faible : le F0 de repos dépasse rarement 400 Hz même chez l'enfant, et l'hystérésis 8/12 kHz est déjà identifiée comme différée dans la revue calibration.

**Sévérité** : BLOQUANT pour les voix graves (85–140 Hz), MINEUR pour le cas haut déjà couvert ailleurs.
**Fix concret** : abaisser le plancher de recherche **pendant la calibration uniquement** (par exemple 50 Hz), ou ajouter un témoin explicite : enregistrer une voix de basse réelle (~70–90 Hz) et vérifier que `F0_habituel` calibré tombe dans une fenêtre de ±5 % de la valeur mesurée indépendamment (par un outil de référence), pas seulement que la médiane converge.

---

## 6. Le problème même-pièce — position CONFIRMÉE comme honnête, mesure concrète proposée

Le document a raison de ne pas inventer de solution DSP : **il n'existe structurellement aucune référence à soustraire** pour ce cas — contrairement à la fuite haut-parleur → micro, où le signal fuité est *connu* (c'est le jeu qui le joue), la voix d'un coéquipier dans la même pièce est un événement acoustique réel sans signal de référence disponible. Même une AEC auto-référencée hypothétique (soulevée puis écartée dans la revue calibration, arbitrage (b)) ne peut rien ici : elle annule ce que *le jeu* émet, pas ce qu'*un autre humain* émet. Ce point mérite d'être écrit noir sur blanc dans le document pour empêcher qu'une future relecture ne rouvre le débat AEC en croyant qu'il couvre aussi ce cas.

**Mesure bon marché proposée pour l'étape suivante** (prototype étendu déjà planifié) : deux personnes, deux casques micro-casque, une pièce calme, position assise normale à 1–2 m d'écart. Mesurer l'atténuation en dB entre (a) la voix de la personne A captée par son propre micro à volume de conversation normal, et (b) la même voix de A captée par le micro de B au même instant. L'effet de proximité et la directivité d'un micro-casque donnent typiquement 15–25 dB d'atténuation naturelle — l'enjeu est de vérifier si cette atténuation suffit à faire tomber la voix de A, telle que captée par B, **sous** `Floor_dB(B) + Margin_dB`. Trente secondes d'enregistrement, deux personnes, aucun matériel supplémentaire.

**Sévérité** : RECOMMANDÉ (mesure à ajouter, position déjà correcte).

---

## 7. Récupération de l'enveloppe depuis −120 dBFS — non couvert par les candidats, BLOQUANT

En jeu normal, un vrai silence de pièce se mesure *à* `Floor_dB`, pas à −120 dBFS — le plancher absolu ne sert que de garde anti-divergence pour `log10(0)`. Mais de nombreux micro-casques USB/Bluetooth grand public embarquent un **squelch matériel/firmware** qui coupe le signal à zéro numérique strict entre les prises de parole (fonctionnalité vendue comme « réduction de bruit » sur les casques gaming). Sur un tel périphérique, `Rms_dB` retombe à −120 dB entre chaque phrase, et non au niveau du plancher calibré.

L'enveloppe en dB étant un suiveur exponentiel, le temps pour remonter d'un pourcentage donné de la distance à parcourir est proportionnel au nombre de constantes de temps, **indépendamment de la distance totale** — mais la distance ici (de −120 dB au niveau de parole, potentiellement 100+ dB) est bien plus grande que celle envisagée par les constantes provisoires (10–20 ms d'attaque, calées pour un écart Plancher–Cri de l'ordre de 40 dB). Remonter une distance 2 à 3 fois plus grande avec la même loi exponentielle ajoute plusieurs dizaines de millisecondes de retard **supplémentaire et invisible** avant que le geste vocal ne franchisse la porte — précisément sur le début de chaque prise de parole après une pause, ce qui contredit « ma voix comme un geste ».

**Sévérité** : BLOQUANT — dépend d'un matériel courant (casques avec squelch), pas d'un cas exotique.
**Fix concret** : plancher opérationnel de l'enveloppe distinct du plancher numérique — clamper la valeur vers laquelle l'enveloppe peut descendre à `Floor_dB − K` (K petit, quelques dB), et ne laisser `MinDb = −120 dBFS` servir qu'à la conversion ponctuelle, jamais de cible de suivi pour l'`EnvelopeFollower`. Ajouter un critère : temps de remontée après un silence numérique strict de 2 s doit être identique (± 10 %) au temps de remontée après un silence à hauteur du plancher calibré.

---

## 8. Contradiction interne : où vit la conversion dB par rapport au lissage — BLOQUANT

L'étape 5 du tableau *Core Rules* (ligne 128) dit encore : `EnvelopeFollower.Process(Rms) → RMS lissé` — Rms **linéaire** en entrée. L'ajout du 2026-09-08 dans *Formulas* affirme le contraire, explicitement : « la conversion est une étape à part entière, insérée entre la mesure de niveau et le lissage » et « l'enveloppe lisse en dB, pas en linéaire ». Le tableau des dix étapes, qui sert de spécification d'implémentation, **n'a jamais été mis à jour** pour insérer cette étape de conversion ni pour changer la signature de l'étape 5. Un lecteur qui implémente depuis le tableau seul reproduit exactement le bug que l'ajout du 2026-09-08 dénonce.

**Sévérité** : BLOQUANT — c'est une divergence entre deux sections normatives du même document, sur le point précis dont dépend AC-14.
**Fix concret** : renuméroter la chaîne à 11 étapes (insérer la conversion dB entre la mesure de niveau et l'`EnvelopeFollower`), et réécrire l'étape 5 en `EnvelopeFollower.Process(Rms_dB) → Rms_dB lissé`.

---

## 9. Le garde-fou de dénormalisation est probablement un rameau mort — BLOQUANT (règle du projet elle-même)

L'*Edge Case* « si l'enveloppe descend sous un plancher de dénormalisation, elle est forcée à zéro » (et AC-15) décrit un risque **linéaire** : un flottant proche de zéro (~1e-38) coûte cher en cycles CPU sur certaines architectures. Mais une fois l'enveloppe migrée en domaine dB (finding #8), ses valeurs opèrent dans une plage normale du flottant (−120 à +20), à des ordres de grandeur du seuil de dénormalisation. **Aucune valeur en dB ne peut physiquement devenir un flottant dénormalisé.** Ni le `Decimator` (FIR à 81 coefficients, pas d'état à décroissance exponentielle) ni le `PitchDetector` (tampons de travail, pas d'accumulateur) n'ont de composant linéaire restant à risque.

Selon la règle d'atteignabilité que ce projet vient d'ajouter à ses propres règles de conception (« pas de témoin = rameau mort, à supprimer »), cette *Edge Case* et AC-15 ne citent aucun témoin qui reste valide après la migration en dB.

**Sévérité** : BLOQUANT au sens de la règle du projet — soit un témoin concret existe encore quelque part dans la chaîne (à nommer), soit l'edge case et AC-15 doivent être supprimés ou réattribués.
**Fix concret** : vérifier s'il reste un chemin linéaire à état exponentiel (aucun identifié ici) ; à défaut, retirer AC-15 et l'edge case associée, ou les réécrire comme concernant explicitement le flush de dénormaux Mono/IL2CPP déjà noté comme *nice-to-have* dans la revue de 2026-09-07 — mais ce dernier point ne concerne pas l'enveloppe, il resterait à documenter séparément s'il subsiste un besoin réel.

---

## 10. Seuil d'écrêtage non défini — BLOQUANT

« `Peak` atteint le seuil d'écrêtage sur plusieurs échantillons consécutifs » ne donne ni valeur numérique, ni nombre d'échantillons, ni traitement du format source. C'est exactement le type de spécification que les règles du projet interdisent (« no hand-waving »).

**Pourquoi c'est acoustiquement important, pas juste cosmétique.** L'écrêtage se caractérise par un **plateau plat** (des échantillons consécutifs à une valeur extrême quasi identique), pas par un seul échantillon proche du plein-échelle — une transitoire forte et légitime (un cri bien capté) peut ponctuellement toucher −1/+1 sans être écrêtée. Le seuil doit donc être défini comme un couple (valeur, nombre d'échantillons consécutifs), par exemple `|x| ≥ 0,998` sur `≥ 3` échantillons — pas une comparaison ponctuelle de `Peak`. De plus, le comportement diffère selon la source : un flux **int16** normalisé clippe exactement à ±1,0 (32767/32768), donc un test d'égalité quasi exacte est fiable ; un flux **float natif** issu d'une interface audio peut saturer analogiquement à une valeur différente du plein-échelle numérique (clipping matériel avant l'ADC), ou au contraire ne jamais toucher exactement ±1,0 tout en étant déjà distordu en amont — dans ce cas, un seuil basé sur la valeur numérique brute peut manquer l'écrêtage réel. Le document ne distingue jamais ces deux cas alors que le prérequis casque implique une variété de matériel USB/Bluetooth aux comportements de saturation hétérogènes.

**Sévérité** : BLOQUANT — AC-32 n'est pas exécutable sans ces deux nombres.
**Fix concret** : définir `ClipThreshold` (valeur, PROVISOIRE ~0,998) et `ClipRunLength` (nombre d'échantillons consécutifs, PROVISOIRE 3) comme constantes nommées au même titre que les dix autres valeurs provisoires du document (donc soumises à AC-43/44) ; noter explicitement que la détection opère au niveau échantillon, pas au niveau fenêtre de 21 ms ; ajouter un cas de test pour source int16-normalisée vs float native.

---

## 11. Absence de filtre passe-haut — BLOQUANT, et en tension avec ADR-0003

Aucune étape de la chaîne ne retire l'offset DC ni le rumble basse fréquence (chocs de bureau, grincements de chaise, ronflement HVAC sous ~40 Hz, souffle direct sur la capsule produisant des impulsions de pression très basse fréquence) avant que `RawLoudness.Rms` ne soit calculé.

**Pourquoi c'est acoustiquement grave, précisément pour ce jeu.** Un offset DC constant ajoute un terme additif à la moyenne quadratique — sa **contribution relative** à `Rms` est bien plus grande en régime faible (silence, chuchotement) qu'en régime fort (cri), puisque le signal utile y est lui-même faible. Cela corrompt disproportionnellement exactement le bas de l'échelle dynamique, là où vit la promesse « quand je me tais, rien ne bouge » (AC-40) et le registre du chuchotement — le point le plus sensible du système. Un choc de bureau ou un grincement de chaise, en plus d'ajouter de l'énergie basse fréquence dans le calcul de `Rms` (entrée fantôme potentielle), a une signature impulsionnelle à fort `CrestDb` — risque de collision avec le geste de claquement de langue que `Continuity` doit précisément isoler. Et l'énergie de choc mécanique recouvre en partie la bande de recherche de hauteur (70 Hz et au-dessus), avec un risque résiduel — faible mais non nul — qu'une résonance de bureau/support quasi périodique passe la porte de voisement.

**La tension avec ADR-0003.** Le texte de l'ADR est explicite : « c'est le seul traitement autorisé en amont de l'analyse : tout ajout à cet endroit doit être justifié par la même règle — soustraire un signal connu, jamais filtrer, seuiller ou normaliser ». Un passe-haut est, littéralement, un filtre — interdit tel qu'écrit. Mais son objectif diffère fondamentalement de l'AGC/NS/VAD proscrits : il ne touche ni la dynamique chuchotement–cri, ni la forme temporelle d'un vrai signal vocal (coupure bien en dessous de 70 Hz, plancher de recherche de hauteur), il retire une énergie qui **ne peut structurellement pas être de la voix**. C'est le même raisonnement qui a fait accepter l'AEC comme exception à la règle.

**Sévérité** : BLOQUANT.
**Fix concret** : proposer un passe-haut à un pôle, coupure PROVISOIRE 20–40 Hz, comme **seconde exception documentée** à ADR-0003 (à amender explicitement, pas à contourner en silence), avec la même justification que l'AEC : élimination d'énergie non vocale par construction, aucune interaction avec l'écart plancher–cri ni avec la crête d'un transitoire vocal réel. Ajouter au banc de fixtures d'AC-40 : offset DC synthétique, choc de bureau, grincement de chaise.