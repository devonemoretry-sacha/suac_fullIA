# Revue adversariale — systems-designer — `voice-analysis.md` (système 1)

Méthode : injection de valeurs limites dans chaque formule (Loudness, conversion `Rms_dB`,
Pitch, Continuity, porte de voisement, jitter), vérification croisée avec
`voice-object-effect.md` (Formulas, système 11) et `voice-calibration.md` (validations
V1–V4, Tuning Knobs, provenance croisée), et avec les trois revues antérieures + le
rapport `audio-director.md` de cette semaine.

---

## Verdict sur les 5 candidats

| # | Candidat | Verdict |
|---|---|---|
| 1 | `Loudness` non nul au silence | **CONFIRMÉ, BLOQUANT** — le correctif correct n'est pas un gate a posteriori mais un décalage de domaine |
| 2 | Contradiction `Pitch` | **CONFIRMÉ, BLOQUANT** — AC-34 doit l'emporter, la phrase des *Formulas* §2 est fausse |
| 3 | Reachability des plages dérivées du profil | **AFFINÉ** — trois sous-points, trois verdicts différents |
| 4 | Liste provisoire incomplète | **CONFIRMÉ et chiffré** — 13 valeurs dans ce document, pas 5 ni 10 ; plus un double comptage 24→22 trouvé en creusant |
| 5 | `γ` à deux consommateurs | **CONFIRMÉ** — preuve arithmétique, plus une dépendance manquante trouvée (système 11 absent du tableau *Dependencies*) |

---

## 1. `Loudness` non nul au silence

### 1.1 Arithmétique du witness (validation du candidat)

`x = clamp((Rms_dB − Floor_dB)/(Scream_dB − Floor_dB), 0, 1)`, `Loudness = x^0,65`.

Witness donné : `Δ = 40 dB`, bruit à `Floor + 2 dB` → `x = 2/40 = 0,05` →
`Loudness = 0,05^0,65 = e^(0,65·ln0,05) = e^(-1,9472) ≈ 0,143`. **Arithmétique juste.**

Ce witness s'aggrave sur un profil `LowRange` (le cas que le découpage plancher dur / bande
de qualité est censé inclure honnêtement, pas empoisonner) : à `Δ = 13` (plancher dur, ligne
488), le même bruit à `Floor + 2 dB` donne `x = 2/13 = 0,1538` →
`Loudness = 0,1538^0,65 = e^(0,65·ln0,1538) = e^(-1,2167) ≈ 0,296`. **Un profil `LowRange`
lit presque 0,30 de `Loudness` sur du bruit de pièce**, contribution non négligeable dans la
somme `Σ Lᵢ` du système 11 (régime MURMURE).

### 1.2 Le correctif à écrire n'est pas celui qu'on croit

Un gate a posteriori (« si `Rms_dB ≤ Floor_dB + Margin_dB` alors `Loudness = 0`, sinon
formule inchangée ») **crée une discontinuité** : juste sous le seuil, `Loudness = 0` ; juste
au-dessus, `x = Margin_dB/Δ = 7/40 = 0,175` → `Loudness = 0,175^0,65 ≈ 0,322`. **Un saut de
0 à 0,32 au moment précis où la porte de voisement s'ouvre** — exactement le genre de
« pop » non signalé que ce document traite comme bloquant ailleurs (écrêtage, cf. la dérive
continue vers 0,5 plutôt qu'un gel abrupt).

**Le correctif correct décale le domaine, pas seulement le gate :**

```
x' = clamp((Rms_dB − (Floor_dB + Margin_dB)) / (Scream_dB − (Floor_dB + Margin_dB)), 0, 1)
Loudness = x' ^ γ
```

Continu par construction : `x' = 0` exactement à `Rms_dB = Floor_dB + Margin_dB`, `x' = 1`
exactement à `Rms_dB = Scream_dB`. Compatible avec AC-36 (chuchotement au-dessus de
`Floor + Margin` → `Loudness > 0` même non voisé) puisque tout `Rms_dB` strictement
au-dessus du nouveau zéro reste strictement positif.

**Ce correctif rend cohérente une phrase que le document contredisait déjà lui-même.** Les
*Tuning Knobs* (interaction « `γ` contre `Margin_dB` », ligne 817-819) affirment déjà : « la
marge de la porte [coupe] le [registre bas] par le bas. Étirer une zone qu'on vient de
tronquer ne sert à rien. » Cette phrase présuppose un modèle mental où `Margin_dB` tronque
effectivement le bas de l'échelle — mais la formule *Formulas* §1 ne tronquait que contre
`Floor_dB` seul. Le correctif aligne l'équation sur ce que le document affirme déjà en prose
ailleurs.

### 1.3 Effet sur le système 6 — le vrai `Δ` utile devient `Δ − Margin_dB`

Une fois ce correctif posé, le dénominateur qui produit un `Loudness` réellement gradué
n'est plus `Δ = Scream_dB − Floor_dB` mais `Δ' = Δ − Margin_dB`. Au plancher dur (`Δ = 13`,
`Margin_dB = 7`) : `Δ' = 6 dB`. **Six décibels de plage utile** entre « vient d'être reconnu
voisé » et « cri de référence » — c'est très peu pour discriminer un geste vocal gradué, et
`HardFloor_dB`/`QualityBand_dB` (13/20, *Edge Cases* lignes 488-491, dupliqués dans
`voice-calibration.md` V2 ligne 466) ont été calés sur `Δ` brut, pas sur `Δ'`.

C'est **exactement le même défaut** que celui déjà identifié sur `RestMax` par la revue
calibration du 2026-09-11 (« `RestMin(Δ) = k · Margin_dB / Δ`... un seuil fixe au-dessus d'un
plancher mobile referme la fenêtre sur les joueurs `LowRange` »). Recommandation : **re-dériver
`HardFloor_dB`/`QualityBand_dB` contre `Δ'` dans la même passe groupée qui re-dérive `RestMax`**
— les traiter séparément fabriquerait deux corrections incohérentes sur le même dénominateur.

### 1.4 Ce correctif ne règle pas le wobble à 2 dB — il le déplace

Vérification de l'exemple documenté (ligne 498) : à `Δ = 20`, `Loudness` passe de 0,148 à
0,286 pour un wobble de bruit de 2 dB. Recalcul : `0,148 = x^0,65 → x = 0,148^1,538 ≈ 0,053`
→ `Rms − Floor ≈ 1,06 dB`. `0,286 = x^0,65 → x ≈ 0,146` → `Rms − Floor ≈ 2,92 dB`. Écart
≈ 1,86 dB (≈ 2 dB, cohérent), ratio `0,286/0,148 ≈ 1,93` (« elle double », cohérent).
**L'arithmétique de la revue précédente est juste.**

Mais ce wobble se produisait à `Rms ≈ Floor + 1` à `Floor + 3 dB` — **une zone que le
correctif §1.2 fait désormais lire `Loudness = 0`** (sous `Floor + Margin`). Le problème
n'est pas supprimé : `x'^γ` avec `γ < 1` a toujours une pente infinie à l'origine, et
l'origine est maintenant `Floor + Margin` au lieu de `Floor`. Le même wobble de 2 dB
appliqué juste **au-dessus** du nouveau zéro produira le même doublement relatif. **À
documenter explicitement au moment d'appliquer le correctif** : il élimine la fuite de bruit
sous la porte de voisement (problème réel, ce candidat), mais ne règle pas le second
problème déjà nommé par ce document lui-même (« Attention au faux remède », ligne 501) —
celui-là ne se corrige que par la marge de mesure du système 6 sur `Floor_dB`, pas par un
déplacement de seuil.

### 1.5 Trou de couverture dans AC-40

AC-40 teste uniquement `Voiced = false` sur du bruit **sous `Floor_dB`**. Aucun critère
existant ne teste `Loudness` sur du bruit **entre `Floor_dB` et `Floor_dB + Margin_dB`** —
précisément la bande où ce candidat trouve la fuite. Une suite de tests peut passer AC-40 à
100 % pendant que `Loudness` fuit à 0,14–0,30 sur du bruit ambiant. **Ajouter un AC-40b** :
`GIVEN` un bruit stable dans `[Floor_dB, Floor_dB + Margin_dB)` `THEN Loudness = 0`.

### 1.6 Sur l'objection de l'audio-director — confirmée mais distincte

L'audio-director a raison : le vrai chuchotement phonétique vit plutôt 15–25 dB au-dessus du
plancher, pas dans les 7 premiers dB. **Le correctif ci-dessus ne résout pas cette
question-là** — il élimine la fuite de bruit pur sous la porte de voisement (ce candidat),
mais ne relocalise pas le registre que `γ` étire vers là où vit le vrai chuchomtement. Ce
sont deux défauts orthogonaux : l'un se corrige par la formule (fait), l'autre exige le
Protocole A étendu avec enregistrements étiquetés séparément (souffle / bruit de bouche /
chuchotement rapproché) que l'audio-director recommande déjà. **Ne pas laisser croire que ce
correctif clôt le point de l'audio-director.**

**Sévérité globale du point 1 : BLOQUANT.**

---

## 2. Contradiction `Pitch`

*Formulas* §2 (ligne 370) : « quand `Voiced` est faux, `VoiceFrame` force `Pitch` à 0. » AC-34
(ligne 1089) : « `Pitch` conserve sa dernière valeur lissée — il ne retombe pas à 0. » *Edge
Cases* (ligne 630) confirme le mécanisme d'AC-34 : « Si une trame est non voisée, le `F0`
rejeté n'entre pas dans l'anneau, **qui gèle**. »

**C'est AC-34 qui doit tenir, et la phrase des *Formulas* est un résidu à supprimer**, pour
trois raisons :

1. **Le mécanisme documenté produit déjà le comportement d'AC-34.** L'anneau gèle sur trame
   non voisée ; il ne se vide pas et n'insère pas de zéro. Rien dans la chaîne ne fabrique
   activement un `Pitch = 0` — la phrase des *Formulas* décrit un comportement que
   l'implémentation documentée ne produit pas.
2. **`Pitch = 0` n'est pas un sentinel, c'est une valeur légitime.** `Pitch = 0` signifie
   « `F0_Hz` égale exactement `F0_habituel` » — c'est-à-dire « le joueur est exactement sur
   sa hauteur habituelle ». Forcer cette valeur précise au moment où on n'a justement plus de
   mesure est le pire choix de sentinel possible : un consommateur (système 13) qui omettrait
   de vérifier `Voiced` lirait une affirmation positive et fausse (« il chante juste »), pas
   une absence de signal.
3. **Cohérence avec le reste du document.** `Continuity` gèle sur écrêtage plutôt que de
   sauter à une valeur ; l'anneau `F0` gèle plutôt que d'insérer un défaut. Forcer `Pitch` à
   0 romprait ce principe uniforme sans raison donnée.

**Fix concret** : supprimer la phrase « quand `Voiced` est faux, `VoiceFrame` force `Pitch`
à 0 » de *Formulas* §2 ; la remplacer par un renvoi à AC-34 et à l'*Edge Case* de gel de
l'anneau. Réécrire la note qui suit (« un consommateur qui lit `Pitch` sans vérifier `Voiced`
lit une valeur qui n'a pas de sens ») en « … lit une valeur **figée, potentiellement
ancienne** » — la nuance compte pour un lecteur du système 13.

**Sévérité : BLOQUANT** — deux sections normatives du même document (*Formulas* et
*Acceptance Criteria*) s'contredisent sur le comportement observable d'un champ public.

---

## 3. Reachability des plages dérivées du profil

### 3.1 `F0_habituel < 20 Hz` (AC-27) — branche mal justifiée, pas nécessairement morte

Le `PitchDetector` non calibré cherche dans `[70, 600] Hz` (*Detailed Rules*, ligne 127).
`F0_habituel` est la médiane de trames **voisées** captées par ce détecteur pendant la
calibration — donc structurellement dans `[70, 600]` dès qu'au moins un `F0` a été accepté.
**Le witness donné par le document (`F0_habituel = 0,01 Hz`, ligne 519) n'est pas atteignable
par la voie organique** (mesure de calibration) : rien dans cette voie ne peut produire une
valeur résiduelle de 0,01 Hz — soit une session de calibration capture des trames voisées et
`F0_habituel ∈ [70, 600]`, soit elle n'en capture aucune et la valeur qui en résulte (0 exact,
ou un défaut d'implémentation) n'est pas un résidu fractionnaire proche de zéro.

**Mais la branche n'est pas morte pour autant** — elle a un witness différent de celui écrit :
la même section *Edge Cases* nomme, séparément, « un profil invalide arrive malgré tout —
chargé du disque, reçu du réseau, corrompu ». Un profil manuellement édité ou corrompu par un
bug de désérialisation **peut** porter n'importe quelle valeur, y compris 0,01 Hz. C'est donc
une garde valide **contre l'intégrité du contrat de données à la frontière de commit**, pas
contre un défaut mesurable de la pipeline de calibration comme le texte le prétend.

**Sévérité : BLOQUANT au sens de la règle du projet** — le witness cité est faux pour la voie
qu'il prétend couvrir. **Fix** : réécrire la justification (« calibration n'ayant capté aucune
période voisée, ou résidu numérique ») en « profil corrompu, désérialisé, ou construit
manuellement — la voie de calibration organique ne peut structurellement pas produire cette
valeur, voir plage de recherche non calibrée ». Et ajouter la vraie garde manquante pour le cas
que le texte visait réellement : **un seuil sur le nombre de trames voisées acceptées pendant
la calibration** (ex. « moins de N échantillons voisés → refus »), parce qu'un défaut « zéro
échantillon capté » pourrait en théorie laisser un accumulateur non initialisé retomber sur
une valeur **à l'intérieur** de `[70, 600]` par coïncidence mémoire — un cas que le seuil
magnitude `< 20 Hz` ne détecterait jamais.

### 3.2 Biais d'octave systématique pour les voix graves sous 70 Hz — CONFIRMÉ, et un mode d'échec supplémentaire trouvé

Point déjà creusé par l'audio-director (finding 5) : une vraie F0 à 55 Hz, sous le plancher
de recherche de calibration (70 Hz), fait accrocher YIN sur une sous-harmonique haute ou
l'harmonique 2×F0 = 110 Hz, **systématiquement sur chaque trame** — la médiane de 5 valeurs
identiquement biaisées reste biaisée (`médiane(110, 110, 110, 110, 110) = 110`). `F0_habituel`
se fige à 110 Hz, une octave (12 demi-tons) au-dessus de la vraie valeur, sans qu'aucune
*Edge Case* ne revienne interroger `F0_habituel` après coup.

**Mode d'échec supplémentaire, non nommé par l'audio-director** : une fois calibré à
`F0_habituel = 110 Hz`, la plage de recherche en jeu se resserre à `médiane ± 1 octave =
[55, 220] Hz` (ligne 127) — **ce qui réadmet la vraie fondamentale à 55 Hz dans la plage de
recherche**. En jeu réel, YIN peut alors accrocher tantôt 55 Hz (la vraie fondamentale,
maintenant atteignable), tantôt 110 Hz (son harmonique, toujours dans la plage) d'une trame à
l'autre, sur la **même note tenue**. Cela donne `Pitch = 12·log2(55/110) = −12` sur certaines
trames et `Pitch = 12·log2(110/110) = 0` sur d'autres — **une oscillation de 12 demi-tons
trame à trame sur un son parfaitement stable**, pire qu'un simple décalage constant : le
filtre médian (protection contre l'aberration isolée) ne protège pas contre une oscillation
soutenue entre deux valeurs également plausibles au sein de la plage calibrée.

**Sévérité : BLOQUANT** — touche disproportionnellement les voix de basse réelles (85–140 Hz
et en dessous), aucune *Edge Case* ne re-questionne `F0_habituel` après la calibration, et le
défaut n'est pas seulement un biais mais une instabilité active en jeu.
**Fix** : abaisser le plancher de recherche **pendant la calibration uniquement** (le
document lui-même n'exclut pas cette option — il ne l'a simplement jamais posée), par exemple
50 Hz ; ou ajouter un témoin de calibration explicite (enregistrement de référence à
70–90 Hz vérifiant que `F0_habituel` calibré tombe dans ±5 % de la valeur mesurée par un outil
indépendant).

### 3.3 « Chicken-and-egg » du 12 kHz — RÉFUTÉ

La décision de décimation à 12 kHz se fonde sur `médiane × 2 > 600 Hz`, c'est-à-dire sur une
médiane de calibration typiquement bien à l'intérieur de `[70, 600]` (les F0 de repos, même
pour un enfant, dépassent rarement 300–350 Hz). Il n'y a pas de circularité réelle : mesurer
correctement une médiane confortablement sous 300 Hz à 8 kHz de décimation ne pose pas de
problème de résolution — la contrainte des 600/900 Hz ne concerne que le **cri** (le pic), pas
la **médiane de repos** qui déclenche la décision. Je ne trouve pas de witness où la mesure de
`F0_habituel` elle-même serait dégradée par le fait d'être prise à 8 kHz avant que la décision
12 kHz ne soit prise.

**Verdict : RÉFUTÉ comme formulé.** **MINEUR** à noter cependant : rien ne dit ce qui se
passe si, exceptionnellement, la F0 de repos elle-même dépasse 300 Hz (médiane × 2 > 600 au
repos, pas seulement au cri) — cas non couvert explicitement, mais sans witness concret d'une
voix de repos humaine à cette hauteur ; à laisser en observation de playtest, pas à traiter
comme un défaut de conception.

---

## 4. Liste des valeurs provisoires — comptage exact et propriétaires

### 4.1 Comptage exhaustif dans `voice-analysis.md`

Recherche exhaustive de toutes les occurrences de `PROVISOIRE` dans le document :

| # | Valeur | Ligne | Compte dans « dix » (AC-43/OQ-4) ? |
|---|---|---|---|
| 1 | `γ` = 0,65 | 289 | oui |
| 2 | `MinDb` = −120 dBFS | 314 | **non** |
| 3 | `CrestMinDb` = 8 | 385 | oui |
| 4 | `CrestMaxDb` = 20 | 386 | oui |
| 5 | `Margin_dB` = 7 | 426 | oui |
| 6 | `JitterMin` = 0,5 % | 428 | oui |
| 7 | `N` (fenêtre de jitter) = 4 | 429 | **non** |
| 8 | Plancher dur (`HardFloor_dB`) ≈ 12–15 | 488 | oui |
| 9 | Bande de qualité (`QualityBand_dB`) ≈ 20 | 491 | oui |
| 10 | Fenêtre de gel sur écrêtage ≈ 250 ms | 605 | oui |
| 11 | Attaque de l'enveloppe 10–20 ms | 838 | oui |
| 12 | Relâchement de l'enveloppe 120–200 ms | 838 | oui |
| 13 | Multiplicateur `LowRange` ×1,5 (borné 1,2–2,5) | 846 | **non** |

**Total réel : 13 valeurs**, pas 5, pas 10.

- **« Cinq »** (ligne 449) est stale sous toute lecture : au point où cette phrase apparaît
  dans le document, 7 valeurs provisoires ont déjà été introduites (γ, `MinDb`, `CrestMinDb`,
  `CrestMaxDb`, `Margin_dB`, `JitterMin`, `N`). Même en l'interprétant charitablement comme
  « les cinq valeurs des deux tableaux qui précèdent immédiatement » (`CrestMinDb`,
  `CrestMaxDb`, `Margin_dB`, `JitterMin`, `N`), le Protocole B qui suit dans la même section
  fixe `γ` — une sixième valeur non comptée dans ce sous-ensemble.
- **« Dix »** (AC-43, AC-44, section I, OQ-4) est cohérent en interne mais **exclut trois
  valeurs marquées `PROVISOIRE` ailleurs dans le même document** : `N`, `MinDb`, le
  multiplicateur `LowRange`. Conséquence concrète : **AC-43 (`[UNIT]`, bloquant) — « chacune
  des dix valeurs apparaît en un seul endroit, aucun littéral dupliqué » — ne protège pas ces
  trois-là.** Rien n'empêche `MinDb = -120` ou `N = 4` ou `×1,5` d'être dupliqués ailleurs
  dans l'assembly sans qu'aucun test statique ne le détecte.

**Sévérité : BLOQUANT** — un critère d'acceptation étiqueté bloquant (AC-43) protège une
liste incomplète. **Fix** : soit ajouter `N`, `MinDb` et le multiplicateur `LowRange` à la
liste canonique (treize, pas dix) et mettre à jour AC-43/44/OQ-4/section I en conséquence,
soit justifier explicitement pourquoi ces trois sont exclus (aucune raison de fond identifiée
ici — ce sont des constantes nommées au même titre que les autres, par construction, ADR-0004).
Remplacer aussi la ligne 449 par un renvoi à la liste canonique plutôt qu'un chiffre recopié —
c'est la même leçon qu'AC-01 applique déjà aux valeurs numériques, à appliquer au comptage
lui-même.

### 4.2 `HardFloor_dB` / `QualityBand_dB` — provenance erronée entre les deux documents, et double comptage

`voice-calibration.md` (lignes 538-539, 1444) attribue `HardFloor_dB` et `QualityBand_dB` au
**« Protocole A du système 1 »**. Vérification dans `voice-analysis.md` : le Protocole A
(ligne 452-455) ne mesure et ne fixe que `CrestMinDb` et `CrestMaxDb` — **rien dans le
Protocole A, ni ailleurs dans ce document, ne mesure `HardFloor_dB` ou `QualityBand_dB`**. Ces
deux valeurs apparaissent dans `voice-analysis.md` comme un arbitrage de raisonnement
(*Edge Cases*, ligne 481-504 — « l'écart dynamique fait deux métiers »), pas comme le produit
d'un protocole de mesure nommé. **La citation de provenance dans `voice-calibration.md` est
fausse** : elle attribue un chiffre à un protocole qui ne le produit pas — exactement le
défaut que la règle de provenance ajoutée le 2026-09-14 cible.

**Conséquence chiffrée sur le total « vingt-quatre » (OQ-4)** : `voice-calibration.md`
ligne 1444 classe `HardFloor_dB`/`QualityBand_dB` comme « Partagé avec le système 1 » **et**
les compte dans ses propres « quatorze » (ligne 1450 : « ces quatorze valeurs et les dix du
système 1 » = 24) ; `voice-analysis.md` les compte aussi dans ses « dix » (§4.1, lignes 8-9
du tableau ci-dessus). **Ces deux valeurs sont donc comptées deux fois dans le total de
vingt-quatre.** Le nombre réel de valeurs provisoires distinctes à travers les deux documents
est **22, pas 24** — sauf si on considère que la « propriété partagée » justifie le double
compte, ce qu'aucun des deux documents n'affirme explicitement (l'un dit « partagé », l'autre
ne le mentionne pas du tout comme partagé, il les liste simplement dans son « dix »).

**Sévérité : BLOQUANT (provenance)** — aucun protocole de mesure n'existe actuellement pour
`HardFloor_dB`/`QualityBand_dB` dans l'un ou l'autre document ; la citation croisée masque ce
vide en pointant vers un protocole qui ne les couvre pas. **Fix** : (a) écrire un protocole de
mesure réel pour ces deux valeurs (elles ne se déduisent pas des enregistrements de crête du
Protocole A — il faudrait des sessions de calibration réelles sur une population de test,
proche de ce que le Protocole B fait pour `γ`), ou documenter explicitement qu'elles restent
des paris de raisonnement sans protocole prévu ; (b) désigner **un seul propriétaire
canonique** du nombre (recommandation : système 6, qui les applique réellement à la
validation) et faire de l'autre document une simple référence, pas une seconde entrée de
liste ; (c) corriger le total « vingt-quatre » en 22 dans OQ-4, ou documenter explicitement
la règle de double comptage si elle est voulue.

---

## 5. `γ` à deux consommateurs

### 5.1 Preuve arithmétique du couplage silencieux

`voice-object-effect.md` (ligne 514) : `L_repos,i = ((Rest_dB − Floor_dB)/(Scream_dB −
Floor_dB))^γ` — même symbole `γ` que celui de `Loudness` dans ce document. Le Protocole B de
*ce* document (ligne 457-461) cale `γ` en demandant à des testeurs de noter leur **effort
ressenti** sur l'échelle du sonomètre — un critère de lisibilité perceptuelle, sans rapport
avec l'équilibrage des seuils d'objets.

Exemple chiffré : `Δ = 40`, `Rest_dB = Floor + 20` (mi-parcours), `r = 0,5`.
`γ = 0,65` → `L_repos = 0,5^0,65 ≈ 0,637` → à `T_objet = 0,7`, `Seuil ≈ 0,446`.
Si le Protocole B recale `γ` à 0,5 pour des raisons de lisibilité du sonomètre :
`L_repos = 0,5^0,5 ≈ 0,707` → `Seuil ≈ 0,495` — **une hausse de ~11 % de tous les seuils
d'alarme de tous les objets du jeu**, déclenchée par une session de test qui ne portait que
sur la lisibilité d'un cadran, sans qu'aucun playtest de gameplay ne l'ait validé.

**Sévérité : BLOQUANT au sens des règles du projet** — la fiche *Tuning Knobs* de `γ`
(ligne 789) ne documente que son effet perceptuel sur `Loudness` ; elle ne mentionne nulle
part qu'elle retune aussi tous les seuils d'objets du système 11. C'est exactement le type
d'effet de bord non documenté que les règles de conception interdisent pour un curseur de
réglage.

**Fix, déjà nommé par les deux revues précédentes et confirmé ici par le calcul** : scinder en
`γ` (système 1, perception) et `γ_seuil` (système 11, seuil de gameplay), initialisés égaux
par hypothèse documentée, réglables indépendamment ensuite. Documenter explicitement le
couplage initial dans les deux fiches *Tuning Knobs*.

### 5.2 Dépendance manquante trouvée en vérifiant la bidirectionnalité

`voice-object-effect.md` déclare une dépendance dure sur le système 1 (« 1. Analyse vocale —
DURE, exécution — il nous fournit — `Loudness` par joueur, via `VoiceFrame` », ligne 799). Le
tableau *Dependencies* de `voice-analysis.md` (lignes 671-682) liste ses consommateurs comme
3, 12, 5, 19 — **le système 11 n'y figure pas du tout**, ni comme consommateur de `Loudness`
ni comme second consommateur de `γ`.

**Sévérité : BLOQUANT** — violation directe de la règle du projet (« Dependencies must be
bidirectional »). **Fix** : ajouter une ligne « 11. Effet voix → objets — consommateur — il
lit — `Loudness` (via `VoiceFrame`) et `γ` (valeur de configuration partagée, voir
*Tuning Knobs* — scission recommandée en `γ_seuil`) ».

---

## Points complémentaires (« ALSO »)

### A. `Continuity` quand `Peak/Rms < 1` — vérifié propre, pas de bug

Mathématiquement, `Rms ≤ Peak` toujours pour un signal réel mesuré sur la même fenêtre (le
RMS est une moyenne quadratique bornée par le maximum absolu). `Peak/Rms < 1` n'a donc pas de
witness reachable — et `Rms = 0 ⟺ Peak = 0` sur la même fenêtre (si tous les échantillons
sont nuls, `Peak` l'est aussi ; sinon les deux sont strictement positifs), donc la garde
existante (`Rms = 0 → Continuity = 0`) couvre bien le seul cas dégénéré possible. Le domaine
`CrestDb ∈ [0, +∞)` annoncé par la table des variables (ligne 384) est donc correct et
complet. **Aucune correction nécessaire.**

### B. `Rms_dB` sous −120 vs `Floor_dB` — même classe que le cas F0, non traité explicitement

`Floor_dB` est une agrégation de valeurs de `Rms_dB` déjà bornées à `≥ MinDb = −120 dBFS` par
la conversion (ligne 314). Par construction, `Floor_dB < −120` n'est donc pas atteignable par
la voie organique de calibration — seul un profil corrompu ou édité à la main pourrait porter
une telle valeur (même classe de witness que §3.1). **Aucune garde explicite ne le dit** dans
ce document ; ce n'est pas un bug actif, mais **MINEUR** — l'absence de garde documentée pour
une propriété qui est en fait déjà vraie par construction invite un futur lecteur soit à
ajouter une garde morte, soit à ne pas remarquer que le cas est déjà couvert. Une ligne dans
*Edge Cases* suffirait.

### C. Amorçage du jitter (test passe par défaut) — vérifié correct

Comportement documenté et justifié (ligne 440-443, AC-10) : aucune faille trouvée. La
distinction entre l'anneau de jitter (`N`, PROVISOIRE 4, pair — mais **ce n'est pas une
médiane**, donc la parité n'a pas besoin d'être impaire) et l'anneau médian des F0 (5, impair
par nécessité de médiane) est correcte et n'entre pas en conflit — bien que le document ne le
dise jamais explicitement (ce sont deux tampons distincts sur deux grandeurs distinctes,
`T_i` contre `F0_Hz`). **RECOMMANDÉ** : une phrase explicite distinguant les deux tampons
éviterait qu'un futur lecteur les confonde.

### D. Biais de l'anneau médian sur nombre pair (OQ-1) — vérifié correctement résolu

Option A (élément bas des deux centraux) appliquée correctement : biais d'une valeur d'anneau
sur exactement 2 trames par prise de parole (n=2 et n=4 pendant le remplissage), déterministe
et testable. **Aucun résidu trouvé.**

### E. L'exemple du wobble à 2 dB — arithmétique vérifiée, voir §1.4 pour la mise en garde

Voir §1.4 ci-dessus : le calcul de la revue précédente est exact, mais le correctif du
candidat 1 déplace ce problème plutôt que de le résoudre.

### F. Débordement de `Tick` (~994 jours) — vérifié correct

`uint.MaxValue = 4 294 967 295`. À 50 trames/s : `4 294 967 295 / 50 = 85 899 345,9 s` =
`85 899 345,9 / 86400 ≈ 994,2 jours`. **Arithmétique juste, aucune correction nécessaire.**

### G. Étape 5 (`EnvelopeFollower.Process(Rms)`) contre « l'enveloppe lisse en dB » — CONFIRMÉ, BLOQUANT

Je co-signe intégralement le finding n°8 du rapport `audio-director.md` : le tableau des dix
étapes (*Core Rules*, ligne 128) dit encore `EnvelopeFollower.Process(Rms) → RMS lissé`
(entrée linéaire), alors que l'ajout du 2026-09-08 dans *Formulas* (lignes 302-343) est
explicite sur le contraire — la conversion en dB est « une étape à part entière, insérée
entre la mesure de niveau et le lissage ». Un lecteur qui implémente depuis le tableau des dix
étapes seul reproduit exactement le bug que l'ajout de *Formulas* dénonce. C'est une
divergence entre deux sections normatives du même document sur le point précis dont dépend
AC-14. **Fix** : renuméroter la chaîne à onze étapes, réécrire l'étape 5 en
`EnvelopeFollower.Process(Rms_dB) → Rms_dB lissé`, et insérer l'étape de conversion comme
étape distincte.

---

## Les correctifs de la revue précédente tiennent-ils ?

| Correctif (revue 2026-09-07) | Tient-il ? |
|---|---|
| `CrestMaxDb > CrestMinDb`, validée au chargement | **Oui** — aucun nouveau problème de reachability trouvé sur cette précondition (ce sont deux constantes sœurs du même système, pas un seuil sur une valeur produite en amont) |
| `F0_habituel < 20 Hz` rejeté (pas seulement `= 0`) | **Partiellement.** Le texte est correctement écrit et le test reste exécutable, mais **sa justification est fausse** sous la règle de reachability : le witness cité (`0,01 Hz` produit par la calibration organique) n'est pas atteignable, la vraie garde utile est contre un profil corrompu à la frontière de commit. Voir §3.1 — à corriger dans la passe groupée, pas à annuler |
| Écart dynamique scindé en plancher dur / bande de qualité | **Tient comme structure**, mais §1.3 montre que les deux constantes ont été calées contre `Δ` brut alors que le correctif du candidat 1 rend `Δ' = Δ − Margin_dB` la grandeur réellement pertinente — à re-dériver dans la même passe que `RestMax` (système 6) |
| Réarmement du gel d'écrêtage (timeout, dérive vers 0,5) | **Oui** — aucun défaut trouvé cette semaine sur ce point précis |

---

## Synthèse pour la passe de révision groupée (systèmes 1, 6, 11)

Ordre de dépendance suggéré, pour éviter de refaire un calcul deux fois :

1. Décaler le zéro de `Loudness` à `Floor_dB + Margin_dB` (§1.2) — condition préalable à toute
   re-dérivation de `HardFloor_dB`/`QualityBand_dB` et de `RestMax` (système 6), puisque toutes
   trois dépendent du même `Δ'`.
2. Re-dériver `HardFloor_dB`/`QualityBand_dB` contre `Δ'`, écrire ou documenter l'absence d'un
   vrai protocole de mesure, choisir un propriétaire unique (§4.2).
3. Scinder `γ` / `γ_seuil` (§5.1) et ajouter la ligne *Dependencies* manquante vers le système
   11 (§5.2).
4. Corriger la contradiction `Pitch` (§2) et la contradiction étape 5 / enveloppe en dB (§G).
5. Reformuler la justification d'AC-27 (§3.1) et traiter le biais d'octave des voix graves
   (§3.2) — indépendant du reste, peut se faire en parallèle.
6. Mettre à jour AC-43/44/section I/OQ-4 avec les treize valeurs réelles, corriger le total
   « vingt-quatre » en 22 ou justifier le double comptage (§4.1–4.2).
