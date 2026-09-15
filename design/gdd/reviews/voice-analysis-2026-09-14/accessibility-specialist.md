# Revue adversariale — accessibilité — `voice-analysis.md`, re-revue du 2026-09-14

Angle : chaque **constante fixe** de la chaîne d'analyse, testée contre le principe des
seuils personnels (2026-09-14) — *« une constante ne peut détecter qu'une mesure
physiquement cassée, jamais juger une voix inhabituelle »* — sur la raison d'être déclarée
du système : *« rendre l'effort vocal comparable entre joueurs »*.

Lu en plus du document cible : `audio-director.md` et `game-designer.md` (même dossier).
Je ne rejoue pas leurs constats — je les cite, marque accord/désaccord, et couvre les
angles qu'ils ne couvrent pas (populations handicapées nommément, canal de retour à soi,
mécaniques de tenue de note, configuration d'assistance rapprochée).

**Ce que le document fait bien**, avant la liste : l'absence délibérée de `JitterMax`
(« Décision documentée ») est exactement la bonne forme de raisonnement — refuser de
plafonner une caractéristique vocale stable dans le temps (rugosité) parce que la
plafonner rejouerait le défaut d'équité déjà identifié ailleurs. Le principe `LowRange`
(accepter + marquer plutôt que refuser) est la bonne architecture, même si son exécution a
des trous (findings 4 et 9). Le chuchotement phonétique est correctement protégé de la
porte de voisement par construction (YIN le déclare non-voisé, la porte ne l'aggrave pas).
Aucun plafond n'existe non plus sur `Loudness` en registre haut. C'est une base saine —
les trous sont localisés, pas structurels à l'ensemble du document.

---

## 1. BLOQUANT — Seuil d'apériodicité YIN (0,15) : aucune protection au bout « voix
soufflée », alors que le document en a une explicite au bout « voix rugueuse »

**Constante exacte** : `IsVoiced_YIN` — apériodicité sous 0,15 (étape 6, ligne 425).
Document lui-même : *« Le toucher, c'est rouvrir un ADR »* (Tuning Knobs, « Ce qui n'est
pas un curseur ») — donc explicitement **non personnalisable, jamais**, par construction.

**Qui elle disqualifie sans que ce soit « pas une voix »** : les voix soufflées
(dysphonie de tension musculaire, insuffisance de fermeture glottique), la paralysie ou
parésie unilatérale des cordes vocales (fuite d'air constante = signal structurellement
moins périodique), certaines dysphonies spasmodiques dans leurs phases moins sévères
(irrégularité de fermeture sans être arythmique au point d'échouer aussi le test de
jitter). Ce ne sont pas des cas exotiques — la phonation soufflée est un registre vocal
documenté, pas un défaut de mesure.

**Détecte une mesure cassée ou juge une voix ?** Juge une voix. Le seuil de 0,15 vient
« de la littérature » pour discriminer voisé/non-voisé en général — pas pour discriminer
« assez périodique pour être une commande de jeu valide » d'une voix humaine réelle mais
irrégulière. Le document a construit une défense symétrique pour la rugosité (jitter) sans
en construire une équivalente pour la fuite d'air/l'irrégularité de fermeture, alors que
les deux viennent de la même famille de causes physiologiques.

**Fix compatible seuils personnels** : capturer, pendant la calibration, l'apériodicité
typique du joueur sur sa voyelle tenue de référence (déjà enregistrée pour `CrestMinDb`/
`CrestMaxDb` — même geste, aucune étape supplémentaire), et dériver un seuil **par
joueur** avec le 0,15 littérature comme plafond par défaut, jamais comme minimum imposé à
tous. Concrètement : `AperiodicityMax_joueur = max(0,15, apériodicité_mesurée_calibration
× marge)`.

**Owner** : système 1 (porte de voisement) + système 6 (ajout d'une mesure à la
calibration, pas d'une étape).

---

## 2. BLOQUANT — `JitterMin` (0,5 %) : accord avec `audio-director` #4, avec un ajout —
pas de protection symétrique à l'autre bout, exactement comme au point 1

Je rejoins entièrement le constat d'`audio-director` (chanteurs entraînés, électrolarynx)
et je ne le rejoue pas. Ce que j'ajoute : le document *croit* avoir déjà résolu ce
problème de symétrie côté haut du jitter (« pas de `JitterMax` protège les voix rugueuses
»), mais **la même logique n'a jamais été appliquée côté bas**. Le texte présente les deux
bouts du spectre comme si un seul avait besoin de protection — c'est une incohérence
interne, pas juste un seuil mal calé : le document connaît le problème (il l'a résolu pour
`JitterMax`) et ne l'a pas reconnu comme le même problème pour `JitterMin`.

**Qui échoue** : voix très stables et posées — parole monotone (aprosodie, certains
profils autistiques, certaines dysarthries hypokinétiques de Parkinson à variabilité
prosodique réduite), voix chantées/entraînées, électrolarynx (jitter quasi nul par
construction électromécanique — exclusion **totale et permanente**, il ne franchira
jamais cette porte, quel que soit son effort).

**Fix compatible seuils personnels** : mesurer le jitter minimal plausible du joueur
pendant la voyelle tenue de calibration (le protocole existe déjà pour `CrestMinDb`), et
dériver `JitterMin_joueur` de cette mesure avec `0,5 %` comme **plancher par défaut pour
qui n'a pas encore ce point de calibration**, jamais comme seuil imposé à une voix déjà
mesurée plus stable que ça.

**Owner** : système 1 + système 6 — identique à `audio-director`, je confirme la
sévérité BLOQUANT.

---

## 3. BLOQUANT — Effet cumulé des trois portes : l'électrolarynx est exclu par au moins
deux mécanismes indépendants, ce qui rend la personnalisation d'un seul insuffisante

Un électrolarynx échoue le test de jitter (point 2) **et**, selon les modèles, produit une
plage dynamique de sortie très étroite (la modulation de volume dépend de la pression
manuelle sur l'appareil, pas de l'effort respiratoire — le contrôle fin y est
notoirement plus difficile qu'à voix laryngée). Si l'écart `Scream_dB − Floor_dB` d'un tel
joueur tombe sous le plancher dur (~12–15 dB, voir point 4), son profil est **refusé au
commit**, avant même d'atteindre la porte de voisement en jeu.

**Ce que ça signifie pour la personnalisation** : corriger `JitterMin` seul (point 2) ne
suffit pas à inclure ce joueur si le plancher dur du profil le rejette en amont. Les deux
corrections doivent être traitées comme un seul chantier d'inclusion, pas deux tickets
indépendants — sinon on corrige la porte de voisement pour un joueur qui n'aura jamais de
profil validé.

**Owner** : système 1 (porte de voisement) + système 6 (validation du profil) —
coordination explicite requise, pas deux fixes isolés.

---

## 4. RECOMMANDÉ (BLOQUANT si des joueurs réels y tombent) — Le plancher dur de l'écart
dynamique (~12–15 dB) **refuse** là où le principe du projet exige d'**accepter et
marquer**

**Constante exacte** : plancher dur PROVISOIRE ~12–15 dB sur `Scream_dB − Floor_dB`
(*Edge Cases*, « L'écart dynamique fait deux métiers »). En dessous, **refus au commit**.

Le document justifie ce plancher par le risque de `NaN`/dégénérescence — mais ce
risque-là n'existe qu'à `Δ = 0` exactement (déjà couvert séparément par le retournement
`Floor_dB > Scream_dB`, refus au commit, point distinct). Un `Δ` de 5, 8 ou 11 dB ne
diverge pas : il est juste **instable** (la bande de qualité existe précisément pour
capturer « instable mais mesurable » et y répond par du lissage, pas par un refus).
Le plancher dur, tel que calé à 12–15 dB, mélange donc deux choses différentes : la garde
anti-division-par-zéro (qui n'a besoin que de `Δ > epsilon`) et un seuil de qualité
minimale (qui devrait être traité comme la bande de qualité l'est déjà — accepté et
marqué, pas refusé).

**Qui il disqualifie sans que ce soit une mesure cassée** : des voix dont l'écart
plancher–cri est *authentiquement* étroit — parésie ou paralysie des cordes vocales,
dysphonie de tension musculaire, capacité respiratoire réduite empêchant un « cri » de
référence à pleine puissance (BPCO, restriction respiratoire, certaines dysarthries
neuromusculaires). Ce ne sont pas des profils mal mesurés : ce sont des profils
correctement mesurés d'une voix dont le registre dynamique contrôlable est réellement
plus étroit que 12–15 dB. Le document accepte déjà ce raisonnement pour la bande de
qualité (« timidité, voisinage, voix faible ») — il s'arrête juste un cran trop tôt.

**Fix compatible seuils personnels** : abaisser le vrai plancher de refus à une garde
anti-dégénérescence minimale (`Δ > epsilon`, quelques dB tout au plus — juste assez pour
empêcher la division par une valeur proche de zéro), et étendre la logique `LowRange`
existante en un **lissage gradué** proportionnel à l'étroitesse du `Δ` réel, plutôt qu'un
palier binaire refusé/accepté. C'est la même mécanique que `LowRange` porte déjà — il
s'agit de lui retirer son plancher de refus, pas d'inventer un nouveau mécanisme.

**Owner** : système 6 (validation du profil) — système 1 hérite du contrat.

---

## 5. BLOQUANT — Le zéro de `Loudness` compte le souffle comme signal : accord avec
`audio-director` (finding 1) et `game-designer` (finding 1), avec l'angle accessibilité
qui manque aux deux

Je confirme le diagnostic technique déjà posé deux fois : `Loudness` clampe à zéro sous
`Floor_dB` seul, pas sous `Floor_dB + Margin_dB`, donc tout souffle au-dessus du plancher
produit un `Loudness` non nul même hors voisement. Les deux revues précédentes le
traitent comme un bug de zéro mal placé (game design) et comme une confusion
souffle/chuchotement (DSP). Aucune des deux ne nomme la population qui en paie
disproportionnellement le prix.

**Qui en paie le plus** : les conditions respiratoires audibles — respiration buccale
chronique, BPCO, asthme non contrôlé, allergies/congestion, ronflement ou respiration
sifflante — produisent une respiration mécaniquement plus forte et plus constante qu'une
respiration silencieuse typique. Pour ces joueurs, la promesse « quand je me tais, mon
objet cesse de réagir » (Promesse 4) est **structurellement moins vraie** qu'pour un
joueur à respiration silencieuse — pas parce que le système les traite différemment
explicitement, mais parce que le seuil global ne s'adapte à aucun profil de respiration.
C'est un impact disparate, pas une règle qui les nomme, ce qui le rend plus facile à
manquer en revue.

**Détecte une mesure cassée ou juge une voix ?** Ni l'un ni l'autre à proprement parler —
la respiration n'est pas une voix. Mais le fix déjà proposé (clamper à `Floor + Margin`,
avec `Margin_dB` global 6–8 dB) ne sera personnellement calibré que si le bruit de
respiration de calibration est mesuré **par joueur** plutôt que supposé uniforme.

**Fix compatible seuils personnels** : au-delà du correctif déjà nommé (clamp à
`Floor + Margin`), faire mesurer par le système 6 un échantillon de respiration
audible au repos pendant la calibration (peu coûteux — quelques secondes de silence sont
déjà enregistrées pour `Rest_dB`), et dériver `Margin_dB` de cette mesure plutôt que
d'un 6–8 dB unique pour tous. Sinon, un joueur à respiration bruyante reste
structurellement plus proche de la porte fantôme qu'un autre.

**Owner** : système 1 (formule de `Loudness`) + système 11 (hérite du symptôme) +
système 6 (mesure de respiration en calibration).

---

## 6. BLOQUANT — Fenêtre de crête à 21 ms : accord avec `audio-director` (finding 3),
angle accessibilité et fix complémentaire

Je confirme intégralement le diagnostic d'`audio-director` : la fenêtre fixe de 21 ms
capture ~1,8 période pour une voix grave (85 Hz) contre ~8,4 pour un enfant (400 Hz), ce
qui rend `Continuity` structurellement plus bruitée pour les voix graves — un défaut de
**résolution de la fenêtre elle-même**, pas un seuil, mais avec le même effet
d'inéquité que les seuils fixes dénoncés ailleurs.

**Populations concernées, au-delà de « voix grave » en général** : voix masculinisées
par hormonothérapie (baisse de F0 attendue et recherchée en transition de genre),
voix abaissées par une pathologie (hypothyroïdie, œdème, certains polypes), et plus
généralement toute voix dont le F0 habituel est bas — une caractéristique stable de
la personne, pas un signal instable à corriger.

**Fix complémentaire à celui d'`audio-director`** : en plus de refaire le Protocole A
sur plusieurs registres, la fenêtre de mesure de crête pourrait être **dérivée du
`F0_habituel` du joueur** plutôt que fixée à 21 ms pour tous — par exemple
`FenêtreCrête = max(21 ms, K / F0_habituel)` pour garantir un nombre minimal de
périodes constant entre joueurs. C'est une personnalisation dérivée de la calibration
(le `F0_habituel` est déjà mesuré), donc conforme au principe des seuils personnels,
et ça résout la cause plutôt que de simplement mieux mesurer le symptôme via un
indicateur de confiance basse (proposition d'`audio-director`, complémentaire, pas
contradictoire).

**Owner** : système 1 (fenêtre de mesure) + système 6 (fournir `F0_habituel` en amont
de la construction du `LoudnessMeter`, pas seulement du `PitchDetector`).

---

## 7. RECOMMANDÉ, hors du périmètre des constantes de système 1 — La mécanique « note
tenue » (système 13) n'a pas d'option d'assistance motrice

Question posée par la tâche : les mécaniques de son tenu excluent-elles structurellement
le bégaiement et la dysarthrie ? Réponse : **pas par un défaut de `Continuity`** — la
formule mesure honnêtement ce qu'elle mesure. L'exclusion, si elle existe, vient de la
**demande motrice elle-même** : tenir une phonation continue sans interruption est
précisément ce que le bégaiement (blocages, répétitions) et certaines dysarthries
(soutien respiratoire irrégulier, tremblement, pauses involontaires) rendent difficile
ou impossible à volonté. Ce n'est pas un problème de mesure à corriger dans système 1 —
`Continuity` rapporterait fidèlement une phonation interrompue comme interrompue, ce
qui est correct.

**Ce n'est donc pas une constante de ce document à corriger.** C'est un trou
d'accessibilité motrice au niveau de la **mécanique de jeu** (système 13), de la même
famille que les standards du projet : *« Adjustable input timing »*, *« No QTEs without
skip/auto-complete »*. Une mécanique qui exige une tenue continue sans option
d'assistance (tolérance aux micro-coupures, fenêtre de grâce, mode alternatif) reproduit
pour la voix ce qu'un QTE à appuis simultanés reproduit pour les mains.

**Fix** : ce n'est pas au propriétaire de ce document de le résoudre, mais de le signaler
en `Dependencies` comme contrat à porter par le système 13 : au minimum, une tolérance
configurable au nombre/durée de micro-coupures de voisement dans une fenêtre de tenue, ou
un mode alternatif validant la note par accumulation plutôt que par continuité stricte.

**Owner** : système 13 (mécanique), pas système 1 — mais système 1 doit documenter dans
*Dependencies* que `Continuity` seule ne porte pas la responsabilité d'accessibilité
motrice de ce qui la consomme.

---

## 8. BLOQUANT — La plage de recherche « médiane ± 1 octave » est un plafond
d'expressivité vocale, avec un témoin concret dans la mécanique centrale du jeu elle-même

**Constante exacte** : la recherche de F0 se resserre autour de la médiane calibrée ±
une octave (étape 4, ligne 127), et `Pitch` est borné à **−12…+12 demi-tons** par
construction de cette fenêtre (*Formulas*, section 2).

**Vérification d'atteignabilité (règle du projet)** : est-ce qu'un vrai geste vocal du
jeu peut dépasser ±1 octave depuis le F0 de repos ? **Oui, et le témoin est le geste
central du jeu lui-même** : un cri part fréquemment en voix de tête ou en rupture de
registre depuis la voix de poitrine de repos, un saut qui dépasse couramment une octave
chez de nombreuses voix. Ce n'est pas un cas exotique à chercher loin — c'est exactement
le mécanisme que le pilier 1 demande au joueur de maîtriser (crier). Le témoin existe
donc, la branche n'est pas morte.

**Qui est le plus exposé** : les chanteurs et voix entraînées à un grand ambitus, les
enfants (F0 de repos déjà élevé et grande variabilité rapport à l'adulte), les voix en
entraînement vocal trans (changement de registre habituel volontairement travaillé, où
le F0 « habituel » mesuré à la calibration peut être un point intermédiaire alors que
la cible pratiquée est délibérément bien au-delà), les locuteurs de langues à tons dans
des usages expressifs/prosodiques marqués. Pour ces joueurs, soit le détecteur ne trouve
rien hors de la fenêtre (le geste devient silencieux pour `Pitch`), soit il accroche une
sous-harmonique dans la fenêtre (erreur, pas un plafond honnête) — dans les deux cas,
l'expressivité vocale réelle du joueur dépasse ce que le système peut représenter, ce qui
n'est pas la même chose que « juger sa voix invalide », mais produit le même effet en
pratique : une partie du geste n'existe pas pour le jeu.

**Est-ce un jugement de voix ?** Le document le présente comme une défense DSP
(anti-erreur d'octave), pas comme un jugement — mais la conséquence pour le joueur est
identique à un seuil qui juge : au-delà d'un octave depuis *son propre* repos, sa voix
sort du domaine que le jeu sait lire. C'est un seuil personnel dans sa forme (dérivé de
`F0_habituel`) mais pas dans son ampleur (l'octave est un multiplicateur fixe, jamais
mesuré chez le joueur).

**Fix compatible seuils personnels** : ancrer la largeur de la fenêtre sur une seconde
mesure de calibration plutôt que sur une constante universelle — la calibration capture
déjà un `Scream_dB` ; lui adjoindre la capture du **F0 pendant ce cri** donnerait un
second point d'ancrage réel (`F0_cri`), et la fenêtre de recherche deviendrait
`[médiane / ratio_mesuré, médiane × ratio_mesuré]` au lieu d'un ±1 octave fixe pour tous.
C'est la même logique que l'ADR-0004 applique déjà à la décimation (« monter la cadence
pour les voix aiguës » plutôt que d'élargir universellement) — ici il s'agit d'élargir la
fenêtre **individuellement** plutôt que de la fixer globalement.

**Owner** : système 1 (fenêtre de recherche du `PitchDetector`) + système 6 (ajouter la
capture de F0 pendant l'étape du cri, déjà en cours pour `Scream_dB`).

---

## 9. BLOQUANT — `LowRange ×1,5` : accord avec `game-designer` (finding 5), angle
accessibilité additionnel — palier binaire au lieu d'une personnalisation continue

Je confirme le constat de `game-designer` : le facteur ×1,5 n'a aucun critère
d'acceptation, aucun déclencheur, aucun propriétaire nommé pour sa validation, et il
ralentit la réactivité précisément pour la population que le découpage plancher-dur /
bande-de-qualité visait à inclure — contredisant potentiellement Pilier 1 (« le contrôle
est une compétence ») pour ce sous-groupe sans qu'aucun test ne le vérifie.

**Ce que j'ajoute** : le mécanisme est un **palier binaire** — sous la bande de qualité,
lissage ×1 ; dans la bande, lissage ×1,5 uniforme, peu importe où dans la bande. Un
joueur à 12,1 dB d'écart (juste au-dessus du plancher dur, point 4) reçoit exactement le
même ×1,5 qu'un joueur à 19,9 dB (juste sous la bande de qualité), alors que leurs
besoins de lissage sont probablement très différents. C'est le même défaut de forme que
le plancher dur du point 4 : un seuil en marches d'escalier là où le principe des seuils
personnels appelle une réponse continue dérivée de la mesure réelle.

**Fix compatible seuils personnels** : remplacer le facteur binaire par une interpolation
continue entre 1,0 (à la bande de qualité) et une borne haute (1,5–2,5, à valider) au
plancher dur — chaque joueur reçoit le lissage proportionnel à son écart réel, pas à la
case dans laquelle il tombe. Combiné avec le fix du point 4 (suppression du plancher dur
au profit d'un epsilon anti-dégénérescence), la même formule d'interpolation s'étend
naturellement à toute la plage étroite, sans discontinuité au bord.

**Owner** : système 1 (`EnvelopeFollower`) + système 6 (fournir l'écart réel, pas
seulement le drapeau booléen `LowRange`) — je rejoins `game-designer` sur le besoin d'un
AC perceptuel avant de figer quelque forme que ce soit de ce facteur.

---

## 10. BLOQUANT — Aucun canal de retour sur sa propre voix, en fonctionnement normal :
exclusion structurelle des joueurs sourds et malentendants, au-delà du cas `Degraded`

**Ce que dit le document** : refus explicite du sidetone (*Visual/Audio Requirements*,
« Sidetone — le joueur doit-il s'entendre ? Non »), et confirmation que le sonomètre
« est collé sur le torse » et **lu par les autres, jamais par soi** (correctif du
2026-09-11). La doctrine affirmée est : *« la connaissance de soi est proprioceptive, la
connaissance des autres est instrumentée »*.

**Qui cette doctrine exclut** : les joueurs sourds ou malentendants (y compris
utilisateurs d'implant cochléaire ou d'aide auditive) ne disposent, par définition, pas
d'un retour auditif fiable sur leur propre voix. La littérature en orthophonie documente
que le contrôle de l'intensité et de la hauteur vocale chez les locuteurs sourds ou
malentendants dépend fortement du retour auditif — la proprioception seule (sensation
laryngée/respiratoire) ne suffit généralement pas à calibrer finement l'intensité perçue
par un tiers. **Pour ce joueur, la doctrine du document échoue dès le fonctionnement
normal, pas seulement en `Degraded`** : il n'a ni le retour auditif que le document
suppose acquis, ni de retour visuel (son propre sonomètre lui étant inaccessible par
construction). Il joue donc **en permanence sans aucun canal de vérité sur ce qu'il émet
réellement**, alors que la Promesse 2 (« même effort, même résultat ») et le protocole
d'attribution entier reposent sur l'idée que le joueur peut savoir ce qu'il a fait.

**Aggravation matérielle** : le casque fermé, présenté ailleurs dans le document comme
prérequis du jeu (contre le larsen et la fuite haut-parleur→micro), peut physiquement
gêner le port d'une aide auditive ou d'un processeur d'implant cochléaire, ou masquer
l'audition résiduelle qu'un joueur malentendant utilise encore pour se surveiller —
composant le problème plutôt que de le neutraliser.

**Ce n'est pas un défaut à corriger en assouplissant une constante** — cette fois, le
principe des seuils personnels ne s'applique pas directement (il n'y a pas de seuil en
jeu ici), mais le raisonnement qui a motivé le refus du sidetone mérite d'être
réexaminé : ce refus part de l'hypothèse qu'un retour auditif fiable existe déjà et qu'un
second canal visuel le désynchroniserait. **Cette hypothèse est fausse pour un joueur
sourd ou malentendant** — pour lui, un canal visuel synchronisé ne serait pas un second
retour concurrent, ce serait le **seul** retour disponible. L'objection du document ne
s'applique donc pas à cette population, et l'exclure au nom d'une règle pensée pour
l'entendant n'est pas une décision neutre.

**Fix recommandé** : une option d'accessibilité — non activée par défaut, pour ne pas
réintroduire la désynchronisation pour qui entend — affichant un indicateur personnel
non diégétique (HUD) de sa propre `Loudness` (et idéalement `Voiced`/`Degraded`),
réservée aux joueurs qui l'activent. Ceci est cohérent avec les standards Audio
Accessibility déjà écrits pour ce projet (« indicateurs visuels pour les sons
importants ») — appliqués ici à la propre voix du joueur plutôt qu'aux sons ambiants.

**Owner** : système 1 (doit exposer `Loudness`/`Voiced` localement, ce qu'il fait déjà
en interne) + système 19 (UI — nouvelle surface non diégétique, optionnelle) — à
coordonner avec `ux-designer` et `unity-ui-specialist`.

---

## 11. BLOQUANT — `Degraded` muet pour soi : accord et amplification de `game-designer`
(finding 3), avec une population pour qui le problème est doublement invisible

Je confirme entièrement le constat de `game-designer` : le sonomètre étant illisible par
son propre porteur, un joueur en `Degraded` n'a aucun canal direct pour apprendre que son
micro a coupé — il ne le déduit qu'indirectement, via l'absence de réaction de l'objet
qu'il porte (système 11), un signal en aval et retardé, indiscernable de « je n'ai pas
assez donné ».

**Ce que j'ajoute** : ce défaut **s'empile** sur le point 10 plutôt que de s'y ajouter
platement. Un joueur entendant dispose, en `Calibrated` normal, d'un vrai retour
proprioceptif+auditif sur son propre effort — il perd seulement ce retour en `Degraded`,
ce qui est déjà un problème d'attribution documenté. Un joueur sourd ou malentendant n'a
**jamais** ce retour, `Degraded` ou non (point 10) — pour lui, `Degraded` n'est pas une
perte d'un canal qu'il avait, c'est une **deuxième cause possible** d'un symptôme
(« rien ne réagit ») qu'il ne peut déjà pas distinguer de son propre échec, faute d'un
premier canal de vérification à côté duquel comparer. Le fix du point 10 (canal visuel
personnel optionnel), s'il inclut un état visuellement distinct pour `Degraded`, résout
les deux problèmes par la même surface — c'est un argument pour les traiter comme un seul
chantier UI, pas deux tickets séparés.

**Owner** : système 1 (état `AnalyzerState` déjà exposé, correctement) + système 19 —
même surface que le point 10.

---

## 12. RECOMMANDÉ — OQ-8 (même pièce) : reformuler comme risque d'accessibilité, pas
seulement comme scénario « amis sur le canapé »

Je rejoins `game-designer` (finding 6) et `audio-director` (finding 6) sur le diagnostic
technique — aucune séparation DSP n'existe pour deux voix captées par le même micro, et
c'est honnêtement non résolu, pas à inventer de solution ici. Ce que j'ajoute : la
configuration « même pièce » n'est pas seulement un cas social fréquent (amis, streaming)
— c'est aussi une configuration **d'accessibilité** : un parent assis près d'un enfant
qui a besoin d'assistance, un joueur malvoyant assis à côté d'une personne qui décrit
l'écran, un joueur à mobilité réduite avec un aidant à proximité pour tenir le matériel.
Dans tous ces cas, **le geste d'accessibilité lui-même (se rapprocher pour aider) dégrade
directement le signal de la personne aidée**, puisque le micro de celle-ci capte la voix
de l'aidant. Le risque n'est donc pas seulement fréquent, il est **corrélé positivement**
avec le besoin d'accessibilité — les joueurs qui ont le plus besoin d'un proche à côté
d'eux sont ceux pour qui ce défaut se déclenche le plus systématiquement.

**Fix** : pas une correction de constante — je rejoins les deux revues précédentes,
aucune n'existe. Recommandation : documenter explicitement ce risque comme item
d'accessibilité dans le playtest même-pièce déjà demandé par OQ-8 (pas seulement comme
risque social/technique), et prévoir au minimum une recommandation matérielle (micro
directionnel/cardioïde) dans la documentation destinée aux joueurs qui déclarent une
configuration d'assistance rapprochée.

**Owner** : systèmes 1/2 (capture), coordination avec `game-designer` finding 6 pour
l'ajout à `game-concept.md` *Design Risks*, et avec `qa-tester` pour le protocole de
playtest même-pièce.

---

## Synthèse pour la passe de révision groupée (systèmes 1, 6, 11, 13)

**Un seul motif structurel traverse la moitié de ces constats** : le document a déjà
inventé, une fois, la bonne forme de correctif — accepter et marquer plutôt que refuser
(`LowRange`), ne pas plafonner une caractéristique stable (`JitterMax` absent) — mais ne
l'a pas appliqué partout où le même raisonnement s'applique : l'apériodicité YIN (finding
1), `JitterMin` côté bas (finding 2), le plancher dur de l'écart dynamique (finding 4),
la largeur fixe de la fenêtre de pitch (finding 8). Ce n'est pas quatre problèmes
différents, c'est le même principe déjà accepté par le document, appliqué à moitié.

**Deux constats n'ont pas de fix de calibration possible et demandent une réponse UI/
mécanique plutôt qu'un ajustement de constante** : le canal de retour à soi pour les
joueurs sourds/malentendants (finding 10, amplifié par 11) et l'accessibilité motrice des
mécaniques de tenue de note (finding 7, hors périmètre système 1). Les deux doivent
remonter au `producer` comme items distincts des révisions de constantes, avec un
propriétaire UI/mécanique nommé plutôt qu'un ajustement de valeur PROVISOIRE.

**OQ-8 reste sans solution technique** (accord unanime des trois revues) mais gagne, par
cette lecture, une raison supplémentaire de ne pas rester un simple risque de confort :
il pénalise structurellement les configurations d'assistance qui sont elles-mêmes des
accommodements d'accessibilité (finding 12).
