# Revue de conception — Calibration vocale

| Champ | Valeur |
|---|---|
| **Document revu** | `design/gdd/voice-calibration.md` |
| **Date** | 2026-09-11 · archivée le 2026-09-14 |
| **Verdict** | **MAJOR REVISION NEEDED** |
| **Type** | Première revue · profondeur `full` |
| **Spécialistes** | systems-designer, game-designer, qa-lead, ux-designer, accessibility-specialist, audio-director, creative-director (synthèse) |
| **Suites** | Révision **groupée** avec les systèmes 1 et 11, après leurs propres revues — voir *Traitement* |

---

## Traitement — état au 2026-09-14

**Rien n'est encore appliqué, et c'est délibéré.** Les correctifs de cette revue touchent
aussi le système 1 (porte de voisement, plage par défaut du détecteur de hauteur, `γ`) et le
système 11 (preuve de sûreté sur `L_repos`, dépendance non déclarée). Réviser le système 6
seul obligerait à le réviser deux fois. Ordre décidé par l'utilisateur le 2026-09-14 :

1. Archiver cette revue, ajouter la règle de méthode aux règles de conception
2. Revue `full` du système 11, puis re-revue `full` du système 1
3. **Une seule passe de révision** sur les trois documents
4. Prototype étendu (mini-calibration + modèle du système 11 + trois voix simulées), puis test à plusieurs humains, **puis** les GDD suivants

### Arbitrages de l'utilisateur

> **Principe du 2026-09-14 — les seuils sont personnels.** La calibration existe pour poser
> des paliers **dynamiques, propres à chacun**. Aucune valeur universelle ne doit juger une
> voix. Une constante du pipeline n'a le droit de détecter qu'une **mesure physiquement
> cassée** (ordre inversé, écart inexploitable, trop peu de voix captée, micro coupé) —
> jamais une **voix inhabituelle**, qui doit être acceptée, au besoin en `LowRange`.

Ce principe tranche d'avance B1 (V3-haut et V4 ne refusent plus une voix) et B3 (personne
ne reste bloqué devant la porte). Il s'applique aussi aux revues des systèmes 11 et 1.

L'utilisateur a également confirmé : **profondeur `full` pour toutes les revues**, re-revues
comprises.

### Décisions encore ouvertes — à poser avant la passe de révision

| # | Question | Recommandation du creative-director |
|---|---|---|
| D1 | Que montre la jauge de l'étape 3 ? | **La conséquence, pas le niveau** — un objet qui s'alourdit. Alternatives : instrument de registre à deux bornes non valorisées ; garder la jauge montante et créer un 20ᵉ système « tutoriel » |
| D2 | Combien de refus avant le profil approximatif consenti ? | **2** |
| D3 | AEC auto-référencée : rouvrir ADR-0003 ? | **Non.** Mais reformuler « c'est irréalisable » en « c'est possible, nous le refusons, voici le prix » |


### Décisions du propriétaire — 2026-09-15

**Les dix recommandations du §6 sont acceptées telles quelles** (« d'accord sur tout »), ainsi que les points tranchés par le creative-director sans décision (Pitch = 0 hors voisement, pas de passe-haut avant mesure, voix < 70 Hz documentées, reformulation d'ADR-0003). La passe groupée démarre dans l'ordre du §4 : système 1 → ADR et documents transverses → système 6 → système 11 → `mvp-scope.md` / `game-concept.md`.

### Révision appliquée — 2026-09-16

`voice-calibration.md` réécrit à l'étape 3 de la passe groupée : B1 à B6 et « Important, non bloquant » appliqués ; « Différé sciemment » renvoyé ici depuis *Open Questions*. Re-revue à faire.

---

## Le constat central — sur six bornes de validation, deux fonctionnent

| Borne | État | Pourquoi |
|---|---|---|
| **V1** ordre strict | **Sain** | Test d'ordonnancement pur |
| **V2** écart Δ | **Sain** | Seuils sur une grandeur atteignable |
| **V3 bas** `RestMin = 0,15` | **Code mort** | `Rest_dB` est la médiane de trames **voisées**, donc `> Floor_dB + Margin_dB` (7 dB) par construction : `r > 7/Δ` toujours. `RestMin` n'est atteignable qu'à **Δ > 46,7 dB**, plus du double de `QualityBand_dB` |
| **V3 haut** `RestMax = 0,70` | **Piège actif** | À Δ = 13 (plancher `LowRange`), la fenêtre d'acceptation fait **2,1 dB** |
| **V4 bas** `F0Min = 20 Hz` | **Code mort** | Le `PitchDetector` non calibré cherche entre **70 et 600 Hz** (`voice-analysis.md`, *Detailed Rules*, étape 4) |
| **V4 haut** `F0Max = 500 Hz` | **Pur inconvénient** | Même clamp : V4 ne peut refuser que la bande 500–600 Hz, c'est-à-dire **uniquement des voix aiguës légitimes**. Une accroche d'harmonique ressort *à l'intérieur* de [70 ; 600] et n'est pas attrapable |

**Le témoin du piège V3-haut** (accessibility-specialist) :

```
Floor −60 · Rest −35 · Scream −28   →  Δ = 32 dB, profil propre (même pas LowRange)
                                       r = 25/32 = 0,78 > RestMax  →  REFUS
```

Message renvoyé : *« Ta voix forte ressemble trop à ta voix normale — tu peux pousser un peu
plus ? »* — à quelqu'un qui ne peut pas (logement partagé la nuit, dysphonie, hypophonie,
post-opératoire ORL). **V2 accepte une population que V3 refuse ensuite**, et c'est celle
que `LowRange` a été créé pour inclure. Trouvé indépendamment par le systems-designer, le
ux-designer et l'accessibility-specialist.

La découverte sur V4-haut est celle du creative-director, vérifiée le 2026-09-14 contre
`voice-analysis.md` ligne 127.

---

## Required Before Implementation

### B1 — Re-dériver V3 et V4 contre le domaine atteignable
*[systems-designer 1/2/7/9, ux-designer 3, accessibility 1/4, qa-lead CAL-18/CAL-22]*

- **Supprimer V3-bas.** Sa cible — « étape 2 ratée, voix hors axe » — est déjà attrapée par CAL-07 (`|V| < VoicedMin`), plus tôt. CAL-18 disparaît avec.
- **Re-dériver `RestMax` en fonction de Δ**, pas comme constante : le plancher de `r` vaut `Margin_dB / Δ`, un seuil fixe au-dessus d'un plancher mobile referme la fenêtre exactement sur les joueurs `LowRange`. Pistes du systems-designer : exprimer `r` relativement à la porte de voisement, `r' = (Rest − (Floor + Margin)) / (Scream − (Floor + Margin))` ; ou `RestMin(Δ) = k · Margin_dB / Δ`.
- **V3-haut en échec seul → `LowRange`, pas REFUS** (quand V1 et V2 passent). Conforme au principe du 2026-09-14.
- **V4 ne refuse plus une voix aiguë.** `F0Max` à 650–700 Hz au minimum ; au regard du principe, envisager de supprimer le refus V4-haut et d'élargir la plage de recherche du détecteur **pendant** la calibration. `F0Min` est mort : le retirer ou le justifier par le clamp à 70 Hz.
- **Corriger `voice-object-effect.md`** : sa preuve que `L_repos` ne s'effondre pas cite `RestMin` (« `L_repos ≥ 0,15^γ ≈ 0,29` »). La conclusion survit, le mécanisme est faux — le vrai plancher est `(Margin_dB / Δ)^γ`, plus haut.
- **Déclarer la dépendance 6 → 11** dans *Dependencies*. Le système 11 réclame `L_repos` précalculé sur le `VoiceProfile` et prévient que `Rest_dB` est devenu un repère de gameplay ; ce document ne mentionne le système 11 nulle part. **Rescoper CAL-22** : « aucune formule de sortie **du système 1** », pas « aucun effet de jeu ».

### B2 — L'étape 3 enseigne l'inverse du jeu
*[game-designer 1, élevé en tête par le creative-director]*

Le document se réfute lui-même : *« Si la calibration donne au joueur un retour qu'il n'aura
plus ensuite, elle lui apprend un mensonge. »* Or la jauge monte quand on pousse, alors qu'en
jeu monter en volume **alourdit** le meuble. Le seul moment d'apprentissage du jeu enseigne
« fort = récompensé », et OQ-C8 établit qu'aucun tutoriel n'existe pour le défaire.
Recommandation : **la jauge affiche la conséquence** — un objet qui s'alourdit, frémit,
devient récalcitrant. Même coût d'UI, bonne valence, aucune cible par nature, et le plateau
détecté donne enfin une **clôture** à l'étape (game-designer 4). Voir D1.

### B3 — Aucune sortie de la boucle de refus
*[accessibility 5, ux-designer 3, game-designer 2 en partie]*

Après N refus : ni compteur, ni profil dégradé consenti, ni contournement, avec les amis qui
attendent. Après **N = 2** refus, proposer un « profil approximatif » consenti, honnêtement
nommé, committé avec `LowRange = true` et un état persistant qui ramène vers la
recalibration. Même chemin de commit, un drapeau de plus. Voir D2.

### B4 — Quatre défauts de parcours qui empêchent l'implémentation
*[qa-lead, systems-designer 3/4, ux-designer 1/2, accessibility 7]*

- **CAL-03 est circulaire** : rejeter l'étape 1 sur des trames voisées exige `Floor_dB`, que l'étape 1 produit. Fix : périodicité YIN + jitter seuls, **sans porte de niveau** — plus protecteur, un chuchotement vocalisé est aussi détecté.
- **L'étape 2 n'a pas de délai** (étape 1 = 3 s, étape 3 = 10 s). Ajouter `Step2Timeout_s`, provisoire 12–15 s, qui déclenche le message « on ne t'entend pas assez ». Ne pas le rendre si court qu'il pénalise un bégaiement (accessibility 9).
- **Aucun amorçage de la permission micro.** La popup système peut tomber sur l'écran inerte de l'étape 1, et aucun cas ne couvre « pas de permission ». Écran de priming avant l'étape 1 + cas de blocage dédié.
- **Le mauvais périphérique est diagnostiqué faux** : un micro mort passe l'étape 1, échoue à l'étape 2 et s'entend dire « vérifie l'orientation ». Test « dis un mot » avec sélecteur de périphérique avant l'étape 1 ; distinguer « on ne t'entend pas du tout » de « on t'entend mal ».
- **Dans la même passe** : une **pulsation « voix perçue » non quantitative à l'étape 2**. Résout trois constats — joueurs sourds et malentendants sans aucun retour sur deux étapes sur trois, doute « est-ce que ça marche » (ux 12), diagnostic de périphérique. Meilleur rapport coût/valeur de la revue.

### B5 — Réécrire la table des messages de refus
*[accessibility 2, ux-designer 2/6, qa-lead CAL-35]*

- **V4** envoie un enfant ou son parent changer, tester, voire acheter du matériel pour une propriété de son corps — échoue à la règle du document et à WCAG 3.3.3 sur le fond. (Avec B1, ce refus devrait disparaître.)
- **V1** est le seul message non actionnable et le seul qui renvoie au début.
- **CAL-35 compte six causes, il y en a cinq** : l'écrêtage est un profil **accepté** avec avertissement (CAL-14 dit « committable »). Avec B1 supprimant V3-bas et V4, le compte change encore.
- Définir une **priorité de message** quand plusieurs validations échouent à la fois (systems-designer 8, qa-lead 14).

### B6 — Restaurer l'exigence sur le système 14
*[audio-director 6, trou de couverture qa-lead 15]*

Le document a retiré une exigence sur la foi de « le menu met en pause, donc la voix
entrante est coupée ». En réseau, ouvrir un menu ne gèle que le client local ; la voix
transite par Dissonance + FMOD sur Steam P2P, découplée de tout état de pause. **Et la
première calibration se fait dans le lobby, qui n'est pas en pause** — c'est celle que tous
les joueurs font. Réécrire : aucune diffusion **dans les deux sens** pendant la calibration,
lobby et en jeu, avec un propriétaire nommé et un critère `[INTEG]`.

---

## Important, non bloquant

- **Durée de l'étape 1 : 3 s → 6–8 s** (audio-director 2). ~150 trames à 50 Hz : le P95 repose sur les 7–8 échantillons de queue, deux calibrations de la même pièce peuvent différer de plusieurs dB. Ajouter le **cas symétrique** aux *Edge Cases* : calibré compresseur de frigo en marche, joué à l'arrêt → plancher trop haut → **écrase le chuchotement**.
- **Traitements en amont du jeu** (audio-director 1) : AGC de communication Windows (actif par défaut), APO constructeur, AGC matériel des casques USB, bascule Bluetooth HFP. Élever « désactiver les améliorations micro » au rang du prérequis casque. POC de dérive de `Floor_dB`/`Scream_dB` sur 20–30 min.
- **`FloorMargin_dB` + `Margin_dB` s'empilent** : le vrai seuil de parole est P95 + 10 dB. À documenter en *Tuning Knobs* avec B1 — c'est cette pile qui gouverne le plancher de `r`.
- **Scinder `γ`** en `γ` (système 1, perception) et `γ_seuil` (système 11, seuil de gameplay), initialisé égal par hypothèse documentée (systems-designer 10).
- **Nommer l'exclusion structurelle du prérequis casque** (accessibility 6) : implants cochléaires, aides auditives, contre-indication médicale, hypersensibilité sensorielle. **Documenter, pas résoudre.** La section *Accessibilité* affirme qu'une seule population reste exclue — c'est faux (voir aussi accessibility 4 et 7).
- **Lot propreté des critères** : CAL-24 réécrit en propriété **structurelle** (immuabilité par réflexion, `Interlocked.Exchange` en écriture, `Volatile.Read` en lecture), pas en course de threads non déterministe ; CAL-19 teste les bornes inclusives ; CAL-04 sorti de la table canonique tant qu'il n'est pas exécutable ; CAL-14 scindé en 14a `[UNIT]` / 14b `[HUMAIN]` ; contradiction **dix / quatorze** (lignes 529 et 632 contre 725, 909, 1231, 1450, 1490) avec une seule liste de référence, pour que CAL-39 ait un référentiel ; critères `[HUMAIN]` pour chaque garantie de la section *Accessibilité*, qui n'en a aucun.
- **Renforcer OQ-C6** : mesurer aussi `Rest_dB` et `F0_habituel`, pas seulement `Scream_dB` — ils alimentent les seuils du système 11. Reproduire la vraie condition (amis du sujet, lancement de partie), sur un échantillon plus large qu'une soirée (game-designer 6).
- **OQ-C5 devient une condition de sortie d'`In Design`** (accessibility 1, souscrit par le creative-director).
- **Plateau indéfini pour t < `PlateauHold_s`** : aucune évaluation avant que la fenêtre soit remplie (systems-designer 6).
- **La doctrine « les deux métiers se renforcent »** n'est vraie qu'à l'étape 3 ; l'étape 1 en est le contre-exemple assumé, à nommer comme tel (game-designer 3).
- **Refus pendant la première calibration** : garde le ton « découverte », jamais la sécheresse « réparation » (ux-designer 11).
- **Distinction des trois étapes** : jamais par la couleur seule (ux-designer 10).
- **Message d'écrêtage** : couvrir aussi le gain analogique — « ou éloigne légèrement le micro » — et revérifier après correction (audio-director 4, ux-designer 7).

## Différé sciemment

| Point | Raison |
|---|---|
| AEC auto-référencée (audio-director 5) | Voir arbitrage (b). Seule la formulation change |
| CAL-34 « aucun paquet ne contient le profil » | Un négatif universel ne se prouve pas par capture ; ni GDD réseau, ni transport installé. Réécrire en inspection des DTO réseau quand le système 5 existera |
| CAL-18 | Voir arbitrage (a) ; disparaît avec V3-bas |
| Hystérésis 8/12 kHz (bascule à 600 Hz, retour sous 550 Hz) | Réel, second. Même population que `F0Max` : à garder en tête |
| Garde de gain trop faible en dBFS absolus (audio-director 3) | Mérite une OQ nommée |
| Guidage du placement du micro, faux écrêtage sur plosives | Réels, seconds |
| Export manuel du profil (accessibility 10) | Préserve le raisonnement d'OQ-C1 ; après le MVP |
| Recalibration volontaire « par insatisfaction » (game-designer 7) | Seconde |
| Reliquat du clamp à 900 Hz (accessibility 3) | Déjà documenté ; point de veille playtest |
| Fragilité de `WeakReference` + `GC.Collect()` sous Mono/IL2CPP | Accepté : double passage `Collect / WaitForPendingFinalizers / Collect`, catégorie lente |
| Notifications système pendant l'étape 1, charge machine plus faible au menu qu'en jeu (audio-director 10) | À signaler comme risque mesurable |

---

## Specialist Disagreements — tranchés par le creative-director

### (a) CAL-18 — BLOQUANT ou RECOMMANDÉ ?

systems-designer : BLOQUANT, branche morte et exemple impossible (le plancher de `r` à
Δ = 25 est 0,28, l'exemple vise 0,08). qa-lead : RECOMMANDÉ, V3 est une fonction pure sur
trois flottants injectés, le critère reste exécutable.

**Tranché : le qa-lead a raison sur l'étiquette, le systems-designer sur la conséquence.**
C'est *un test vert qui ne garde rien* — pouvoir de détection nul, couverture affichée, pire
qu'un test absent. L'action est la même dans les deux lectures, et CAL-18 disparaît avec
V3-bas.

### (b) L'AEC auto-référencée — rouvrir ADR-0003 ?

audio-director : le jeu génère lui-même, échantillon par échantillon, les voix qu'il joue ;
une NLMS dans `Voice.Core` n'exige ni Dissonance ni le mixer Unity. « Il n'y a aucun filet »
est faux au sens strict.

**Tranché : ne pas rouvrir.** La décision du propriétaire du 2026-09-08 est explicite —
« on assume que si les gens n'ont pas de casque, le jeu sera dégradé, puis c'est tout » — et
chiffrer une Option C, c'est payer du DSP à retard acoustique variable pour une population
écartée, avant même d'avoir prototypé le pari central. **Mais corriger une phrase** :
« irréalisable » est une loi de la nature que personne ne rouvrira jamais ; « possible, nous
le refusons pour telles raisons, voici le prix » est un choix révisable si le playtest montre
30 % de joueurs sur haut-parleurs.

### (c) La porte bloquante — l'assouplir ?

game-designer : profil provisoire dégradé qui débloque l'entrée, calibration complète plus
tard. accessibility : profil approximatif consenti après N refus.

**Tranché : garder la porte, supprimer le cul-de-sac.** Argument qu'aucun spécialiste
n'avait avancé : le document accepte déjà des profils silencieusement faux en production
(calibré au calme et joué avec la télé ; changement de micro qui ne force jamais de
recalibration ; OQ-C7). « Valide » veut dire *cohérent*, pas *juste*. Mais le profil
provisoire détruit ce que la porte protège vraiment : **que le joueur traverse l'onboarding
une fois**. Avec ses amis dans le lobby, il reporterait à coup sûr, et aucun tutoriel
n'existe derrière. *« Le trait identitaire n'est pas "il est bloquant", c'est "on le traverse
une fois". »* → B3.

---

## Le défaut de méthode

`RestMin`, `F0Min`, `F0Max` et `RestMax` partagent une racine : **un seuil choisi en
raisonnant sur ce qu'il devrait attraper, jamais confronté à ce que le pipeline amont peut
produire.** Ce n'est pas de la négligence — le qa-lead juge ce document « nettement au-dessus
de la moyenne du projet ». C'est structurel : la rigueur à l'intérieur d'un document ne peut
pas détecter une contradiction avec le clamp d'un document voisin. Le correctif doit donc
être mécanique.

**Règle ajoutée à `.claude/rules/design-docs.md` le 2026-09-14** : domaine atteignable +
témoin pour tout seuil portant sur la valeur d'un autre système. Corollaire pour
`/design-review` : quand un GDD consomme la sortie d'un autre, charger la formule amont et
vérifier la reachability.

---

## Senior Verdict [creative-director]

> **Le jeu est-il juste ? Non — et l'injustice est ciblée, ce qui est pire qu'aléatoire.**
> Les deux défauts d'équité visent le même type de personne : quelqu'un dont la voix n'est
> pas une voix d'adulte forte dans une pièce privée. L'affirmation du document — « la
> troisième population n'est plus exclue » — est factuellement fausse. Et les joueurs sourds
> ou malentendants sont absents de la section *Accessibilité*.
>
> **L'onboarding ? Non — et pas « incomplet » : inversé.**
>
> **L'architecture de l'équité est juste** : normaliser contre un profil personnel, `LowRange`
> comme gradation, validation par un troisième point, séparation testable ADR-0006, commit
> atomique par référence immuable, revalidation au chargement. Tout cela survit. Ce sont les
> **nombres** et la **reachability** qui échouent — une révision, pas une reconception.

Recommandation d'ordre : recruter maintenant pour OQ-C5 et OQ-C6 ; réviser pendant l'attente ;
**ne pas écrire une ligne du système 6 avant d'avoir prototypé la Voice-Physics**, sans quoi
la moitié des seuils serait à refaire si la mécanique pivote.

## Scope Signal

- **Révision : M** — 2 à 3 sessions. B1 est une session de dérivation, B2 une session de conception UI, B3 à B6 une session de rédaction, le lot critères une après-midi détachable.
- **Implémentation après révision : L** — logique pure dans `SUAC.Voice.Core`, parcours Unity à trois écrans, persistance, porte côté système 8, machine à états des refus. **Un ADR neuf requis** (OQ-C1, persistance — recommandation A, local par machine) et un changement de surface sur `Voice.Core` (OQ-C2, exposer le détecteur d'écrêtage).

## Verdict : MAJOR REVISION NEEDED

Deux sections doivent être **re-dérivées, pas éditées** — *Formulas* §4 et l'écran de
l'étape 3 dans *Visual/Audio Requirements* — et une doit être **ajoutée** : la sortie de la
boucle de refus.

---

## Annexe — constats par spécialiste

Référence complète pour la passe de révision. Sévérités telles que rendues par chaque
spécialiste ; le classement final est celui ci-dessus.

### systems-designer
1. **BLOQUANT** — `RestMin` inatteignable, fenêtre `LowRange` de 2,1 dB (`r > Margin_dB/Δ`).
2. **BLOQUANT** — V3-bas mort sous Δ ≈ 47 dB ; CAL-18 impossible ; CAL-07 intercepte avant.
3. **BLOQUANT** — CAL-03 circulaire. Fix : YIN + jitter sans porte de niveau.
4. **BLOQUANT** — étape 2 sans délai. Fix : `Step2Timeout_s` 12–15 s.
5. RECOMMANDÉ — `FloorMargin_dB` + `Margin_dB` cumulés, non signalés comme couple.
6. MINEUR — `M(t − PlateauHold_s)` indéfini pour t < 1,2 s.
7. MINEUR — `F0Min` inatteignable (clamp 70 Hz) ; la plage `[max(70, F0/2), min(Plafond, 2·F0)]` s'inverse pour F0 < 35 Hz, protégée seulement par le clamp amont.
8. RECOMMANDÉ — CAL-21 tient pour le verdict, pas pour le message en cas d'échecs multiples.
9. RECOMMANDÉ — système 11 : `L_repos = r^γ`, garantie réelle mais mal attribuée ; CAL-22 à rescoper.
10. MINEUR — `γ` partagé entre deux usages ; proposer `γ_seuil`.

### qa-lead
1. **BLOQUANT** — CAL-03 circulaire. Réécriture : détecteur périodicité + jitter exposé comme primitive distincte de `Voiced`.
2. **BLOQUANT** — CAL-04 non exécutable dans la table canonique : le retirer ou le marquer EN ATTENTE.
3. RECOMMANDÉ — CAL-18 inatteignable mais exécutable ; relabelliser ou remplacer par un exemple atteignable.
4. RECOMMANDÉ — « dix / quatorze » : CAL-39 sans référentiel stable.
5. **BLOQUANT** — CAL-22 contredit par le système 11 ; dépendance non remontée.
6. **BLOQUANT** — CAL-24 : tester la structure, pas une course de threads.
7. RECOMMANDÉ — CAL-34 inexécutable et incapable de prouver une absence.
8. MINEUR — test `WeakReference` fragile sous Mono/IL2CPP.
9. Positif — revalidation par configuration injectée : bonne pratique.
10. MINEUR — « jauge sans cible » honnêtement `[HUMAIN]` ; option : inventaire UI en liste blanche.
11. **BLOQUANT** — CAL-35 : cinq causes de refus, pas six.
12. RECOMMANDÉ — CAL-14 à scinder, bloqué sur OQ-C2.
13. RECOMMANDÉ — CAL-19 sans bornes inclusives.
14. RECOMMANDÉ — priorité de message en cas d'échecs simultanés.
15. RECOMMANDÉ — silence du chat vocal pendant la calibration **initiale** (lobby) non couvert.
16. RECOMMANDÉ — garanties d'*Accessibilité* sans critère.
17. MINEUR — CAL-26/32/33/34/36 dépendent de systèmes sans GDD : ne pas bloquer la story Logic.
- Verdict : « nettement au-dessus de la moyenne du projet », pas livrable tel quel.

### game-designer
1. **BLOQUANT** — la calibration enseigne « fort = récompensé », le jeu punit le fort.
2. **BLOQUANT** — la porte bloquante fabrique l'audience que *Player Fantasy* interdit.
3. RECOMMANDÉ — « les deux métiers se renforcent » ne vaut qu'à l'étape 3.
4. RECOMMANDÉ — pas de cible ≠ pas de clôture ; trancher échelle élastique ou fixe.
5. RECOMMANDÉ — `LowRange` traite gêne passagère et registre étroit par un seul remède.
6. RECOMMANDÉ — protocole OQ-C6 trop faible.
7. MINEUR — pas de recalibration volontaire par insatisfaction.
8. MINEUR — OQ-C11 mérite une cible chiffrée (« sous 15 s pour une étape »).

### ux-designer
1. **BLOQUANT** — aucun amorçage de la permission micro.
2. **BLOQUANT** — mauvais périphérique détecté tard, message faux, boucle.
3. **BLOQUANT** — aucune échappatoire ; V3-haut en impasse, `LowRange` n'agit que sur V2.
4. RECOMMANDÉ — étape 3 sans bouton d'arrêt visible ni confirmation de fin.
5. RECOMMANDÉ — aucune amorce sociale avant l'étape 1 (« dans un instant, il faudra hausser un peu la voix »).
6. RECOMMANDÉ — message V1 non actionnable, seul à renvoyer au début.
7. RECOMMANDÉ — message d'écrêtage : renvoi à un panneau système sans guidage.
8. RECOMMANDÉ — le groupe peut-il démarrer sans le joueur en calibration ? À trancher avec le système 8.
9. RECOMMANDÉ — « X termine sa configuration » statique : indiquer l'étape, ou « rencontre une difficulté ».
10. RECOMMANDÉ — distinction des étapes jamais par la couleur seule.
11. RECOMMANDÉ — refus pendant la première calibration : garder le ton découverte.
12. MINEUR — silence de l'étape 1 : critère humain « aucun doute que le jeu fonctionne ».
13. MINEUR — joueur sans casque : aucun signal en jeu, `Degraded` détecte l'absence et pas la sur-réaction.

### accessibility-specialist
1. **BLOQUANT** — `F0Max` non mesuré, erreur asymétrique ; valeur permissive en attendant, protocole comme condition de sortie.
2. **BLOQUANT** — message V4 mensonger sur la cause (WCAG 3.3.3).
3. RECOMMANDÉ — clamp 900 Hz : `Pitch` moins fiable pour les voix aiguës acceptées.
4. **BLOQUANT** — V3 ne distingue pas un faux cri d'une restriction honnête (témoin Δ = 32, r = 0,78).
5. **BLOQUANT** — aucun échappement au refus répété ; profil approximatif consenti.
6. **BLOQUANT** — prérequis casque = exclusion structurelle non nommée.
7. **BLOQUANT** — Sourds et malentendants absents ; pulsation « voix perçue » à l'étape 2.
8. RECOMMANDÉ — coût vocal-santé jamais nommé ; phrase de permission « si crier te fait mal, arrête-toi ».
9. RECOMMANDÉ — dysarthrie, bégaiement : `VoicedMin` et message qui présume une cause de volume.
10. MINEUR — export manuel du profil.
- Conclusion : « une seule population reste exclue » ne tient pas.

### audio-director
1. **BLOQUANT** — le contrat de trajet ne couvre pas l'AGC Windows, les APO, l'AGC matériel, le Bluetooth HFP.
2. **BLOQUANT** — P95 sur 3 s : cycles de bruit domestique, cas symétrique non nommé, estimateur de queue à faible N.
3. RECOMMANDÉ — pas de détection de gain trop bas (dBFS absolus).
4. MINEUR — gain analogique vs numérique pour l'écrêtage.
5. **BLOQUANT** — AEC auto-référencée jamais évaluée.
6. **BLOQUANT** — la pause ne coupe pas la voix entrante en réseau ; propriétaire à nommer.
7. RECOMMANDÉ — aucune consigne de placement du micro (effet de proximité).
8. MINEUR — plosives et souffle : faux écrêtage.
9. MINEUR — hystérésis 8/12 kHz asymétrique précise.
10. RECOMMANDÉ — notifications système ; charge machine plus faible au menu qu'en jeu.
