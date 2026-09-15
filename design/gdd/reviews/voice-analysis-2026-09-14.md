# Revue de conception — Analyse vocale (re-revue)

| Champ | Valeur |
|---|---|
| **Document revu** | `design/gdd/voice-analysis.md` |
| **Date** | 2026-09-14 · synthèse rendue le 2026-09-15 |
| **Verdict** | **NEEDS REVISION** — non majeure pour le document, mais **premier de la passe groupée** : sa formule de sonie est la racine commune des deux MAJOR REVISION de la semaine |
| **Type** | Re-revue (précédente : `voice-analysis-2026-09-07.md`, NEEDS REVISION) · profondeur `full` |
| **Spécialistes** | game-designer, qa-lead, audio-director, systems-designer, unity-specialist, performance-analyst, accessibility-specialist, puis creative-director (synthèse) |
| **Vérification adverse** | **Nouveau.** Trois contrôleurs (code/moteur/ADR, cohérence documentaire, arithmétique) : 154 affirmations contrôlées — 72 CONFIRMÉ, 67 PARTIEL, 11 RÉFUTÉ, 4 NON VÉRIFIABLE. Aucun point classé ne repose sur une affirmation réfutée |
| **Annexes** | `voice-analysis-2026-09-14/` : les sept rapports de spécialistes et `factcheck.json` |
| **Déroulement** | Deux interruptions par limite d’usage ; les quatre spécialistes coupés ont été relancés par workflow, puis la vérification et la synthèse |

---

## Traitement — état au 2026-09-15

**Rien n’est appliqué.** La passe groupée 1 → ADR → 6 → 11 attend les décisions du propriétaire (§6 ci-dessous, qui fusionne D1–D3 de la revue du système 6, E1–E5 de celle du système 11, et F1–F5 de celle-ci). La règle de méthode proposée en §4 (corriger en place, vérifier les recommandations de revue) **n’est pas encore ajoutée** aux règles de conception : c’est la décision n° 1.

---


**Verdict : NEEDS REVISION.** La révision est non majeure pour le document lui-même. Mais **il
passe en premier dans la passe groupée** : l'une de ses formules est la racine commune des deux
MAJOR REVISION de la semaine. Il n'est approuvable ni pour la conception aval tant que la liste A
n'est pas faite, ni pour l'implémentation tant que la liste C ne l'est pas.

**Bases** : 7 rapports de spécialistes et 3 vérifications adversariales, soit près de 150
affirmations contrôlées. Aucun point classé ne repose sur une affirmation RÉFUTÉE. Les NON
VÉRIFIABLES sont traitées comme des questions, rangées en B ou en C.

**Abréviations des sources** : gd game-designer · qa qa-lead · ad audio-director · sd
systems-designer · us unity-specialist · pa performance-analyst · acc accessibility-specialist ·
vérif vérificateurs.

---

## 1. Re-revue — les 12 bloquants du 2026-09-07

| # | Point | État | Ce qui reste, ou ce que le correctif a introduit |
|---|---|---|---|
| 1 | Validation `CrestMaxDb > CrestMinDb` | **Résolu** | — |
| 2 | `F0_habituel < 20 Hz` | Résolu sur le fond, **mal justifié** | Le témoin 0,01 Hz « issu de la calibration » est inatteignable : sans calibration, le détecteur ne voit que [69,6 ; 666,7] Hz. Le vrai témoin est un profil corrompu sur disque, et la borne devrait être ce domaine, pas 20 Hz |
| 3 | Fil d'exécution, charge nominale | **Partiel** | « Un analyseur par client » est juste. « Hors thread principal » n'a aucun mécanisme. « 2,25× » est mal posé et a été recopié dans ADR-0007:249 : le projet porte trois chiffres (2,25 / 1,8 / ≈ 1) |
| 4 | Blanchiment AC-01/04/25 | **Résolu** | — |
| 5 | OQ-3 → ADR-0007 | Résolu dans l'ADR, **non propagé** | Sept passages disent encore « cadence fixe », « contrat », « pas de bonne réponse » ou « ADR à écrire ». Code non migré. Aucun critère de cadence variable |
| 6 | OQ-7 → ADR-0008 | Résolu dans l'ADR, **non propagé** | OQ-7 présente le choix du SDK comme futur et cite l'AEC en amont |
| 7 | Sortie de `Degraded` | Contestation fondée, anti-rebond ajouté | « Échantillons valides » n'est défini nulle part (AC-20b). La sortie doit être un événement de périphérique, symétrique de l'entrée |
| 8 | Scission des 20 dB | Structure **résolue** | La justification NaN est fausse (Δ = 0 est déjà exclu par l'ordre strict V1 du système 6). Le ×1,5 n'a aucun critère. Valeur divergente (12–15 contre 13). Provenance « Protocole A » fausse côté système 6. Tout est à re-dériver sur la plage décalée (A1.1) |
| 9 | Constantes d'enveloppe | **Résolu** | Reste une phrase périmée, « laissées à mesurer » (l. 1213) |
| 10 | Réarmement du gel d'écrêtage | **Résolu** | Le seuil d'écrêtage n'a jamais eu de valeur, donc AC-32 n'est pas exécutable. Défaut antérieur, non vu le 07-09 |
| 11 | OQ-1, option A | **Résolu** | — |
| 12 | « Enables Pillar 1 » | **Résolu** | — |

**Bilan : six résolus, deux résolus sur le fond mais mal justifiés, quatre partiels.** Aucune
régression de conception.

**Le vrai résultat de cette re-revue est ailleurs : les correctifs ont fabriqué une famille de
défauts nouvelle et homogène.**

- **Encadrés datés, texte normatif intact.**
  - L'encadré dB du 08-09 laisse l'étape 5 en linéaire.
  - L'encadré AEC du 08-09 laisse six mentions « post-AEC ».
  - L'encadré sonomètre du 09-11 laisse le tableau « `Loudness` → Permanent ».
- **Un correctif devenu nuisible.** L'edge case des dénormaux et AC-15 ont été écrits pour une
  enveloppe linéaire. En dB, « forcer à 0 » veut dire 0 dBFS, la pleine échelle.
- **Quatre recommandations de la revue du 07-09 étaient fausses ou invérifiées**, et l'auteur les
  a appliquées fidèlement :
  - le 2,25×, calculé sur un modèle O(fenêtre²) qui n'est pas le code ;
  - `OnAudioConfigurationChanged` comme crochet du micro, alors que la doc 6.3 ne parle que de la
    sortie ;
  - un `ProfilerRecorder` dans une assembly sans moteur ;
  - le témoin 0,01 Hz.

  **Cette revue-là n'avait pas d'étape de vérification.** Celle-ci en a une, et elle a réfuté neuf
  prémisses des spécialistes, en tout ou en partie. Voir §4.

---

## 2. Classement

**Règle de rétrogradation appliquée.** Un BLOQUANT de spécialiste descend :

- en **C** s'il ne bloque que le code ;
- en **D** ou en **E** s'il n'a pas de témoin dans le MVP, ou s'il repose sur une plage de
  littérature qui ne mesure pas la même grandeur que le document.

### A — Dans la passe groupée, avant le prototype navigateur

Critère : sans ces corrections, le prototype teste un modèle contradictoire, ou les révisions de 6
et 11 recopient un texte faux. C'est exactement ainsi qu'elles ont hérité leurs erreurs.

#### A1 — Le contrat (suppose F1, E5 et F2)

**1. Un seul zéro : la porte de volume `Gate_dB = Floor_dB + Margin_dB`, atteinte en continu.**
*[gd 1, ad 1, sd 1.2, acc 5]*

```
x'       = clamp((Rms_dB − Gate_dB) / (Scream_dB − Gate_dB), 0, 1)
Loudness = x' ^ γ
```

- AC-01 et AC-02 sont réécrits sur `Gate_dB`. Les valeurs attendues restent dérivées des
  constantes, selon la règle de la section A.
- AC-40 est réécrit sur `Loudness`, et on retire la précondition « sous `Floor_dB` », qui le rend
  tautologique. Nouvelle forme : bruit ambiant réel enregistré, profil calibré dans la même pièce,
  `Loudness = 0` sur au moins p % des trames, avec p fixé par B2 *[qa 2]*.
- AC-40b `[UNIT]` : pour `Rms_dB ∈ [Floor_dB ; Gate_dB)`, `Loudness = 0` exactement *[sd 1.5]*.
- Écrire que le décalage **déplace** l'oscillation de 2 dB au-dessus de `Gate_dB` sans la
  supprimer *[sd 1.4]*.
- Le Tuning Knob `Margin_dB` documente son double rôle : porte de voisement et zéro de sonie.
  L'interaction « `γ` contre `Margin_dB` » (l. 817–819) devient enfin vraie.
- Voir l'arbitrage (a).

**2. Une table des domaines atteignables, publiée par le système 1.** *[ajout du
creative-director]* C'est ce que 6 et 11 citeront au lieu de re-dériver. Elle donne des **formules
de bornes**, pas des nombres recopiés.

- `Loudness = 0` ⇔ `Rms_dB ≤ Gate_dB`, et `Voiced` ⇒ `Loudness > 0`.
- `Rest_dB > Gate_dB` par construction (médiane de trames voisées). Donc `r' ∈ ]0 ; 1[` dès que
  `Rest_dB < Scream_dB`.
- F0 détectable sans calibration, à 8 kHz : `[SR / maxLag ; SR / (minLag − 1)]` = [69,6 ; 666,7] Hz.
  C'est **le** domaine valide de `F0_habituel`. Il remplace le 20 Hz d'AC-27 et les
  `F0Min`/`F0Max` du système 6.
- `Pitch` vaut 0 hors voisement. Voisé, il reste dans ≈ [−12 ; +12,9] (témoin : médiane à 200 Hz).
- La branche 12 kHz n'est réalisable que pour une entrée à 48 kHz.
- `Tick` compte des appels, pas du temps.

**3. Une liste canonique des valeurs provisoires, avec une colonne « propriétaire ».** *[qa 4, sd
4.1–4.2]* Aucun compte n'est plus recopié en prose : « cinq », « dix », « quatorze » et
« vingt-quatre » disparaissent.

- **Critère d'entrée** : « valeur en attente de mesure ». La taille d'anneau (5) et la cadence de
  décimation sont des décisions d'ADR-0004, listées à part.
- **Système 6** : `HardFloor_dB`, `QualityBand_dB`, `FloorMargin_dB`, `VoicedMin`.
- **Système 1** : `γ`, `MinDb`, `CrestMinDb`, `CrestMaxDb`, `Margin_dB`, `JitterMin`, `N`,
  attaque, relâchement, facteur `LowRange`, fenêtre de gel, TTL (EN ATTENTE).
- Chaque valeur figure dans une seule liste ; l'autre document y renvoie.
- La valeur canonique du plancher dur est celle du système 6. Sa provenance devient « pari de
  raisonnement, sans protocole » : le Protocole A ne la produit pas.
- AC-43 et AC-44 portent sur la liste, pas sur « les dix ».

**4. Sortir `γ` des seuils du système 11.** *[sd 5.1]* Forme recommandée, liée à E5 :

- l'hôte reçoit `r' = (Rest_dB − Gate_dB) / (Scream_dB − Gate_dB)` ;
- il compare `x'_i = Loudness_i^(1/γ)` à `T_objet · r'_i`.

Les seuils vivent alors en position dB, et ne bougent plus quand on recale `γ` : `γ` ne règle plus
que la perception. Aujourd'hui, un recalage de 0,65 à 0,5 déplace les seuils de +3 % (r = 0,8) à
+27 % (r = 0,2). **Repli** : scinder `γ` / `γ_seuil`.

**5. Ajouter le système 11 dans *Dependencies*** : il lit `Loudness` et consomme `Gate_dB`/`r'`.
Corriger aussi l'index, où 11 ne dépend pas de 1 *[sd 5.2]*.

**6. Écrire le coefficient d'enveloppe par intervalle** : `c = exp(−Δt / τ)`, recalculé au-delà
d'un epsilon. ADR-0007:154–155 ne donne que la règle de recalcul, pas la formule *[us F3]*.

- **Pourquoi en A et pas en C** : le prototype navigateur tourne à cadence variable. Des
  constantes d'attaque et de relâchement réglées là-bas sous un coefficient figé ne se
  transféreraient pas. C'est la règle de provenance appliquée d'avance.
- La migration du code et AC-14e restent en C.

**7. Aucun détecteur ne refuse seul un profil** (selon F2).

- Le profil porte un drapeau « hauteur indisponible », du même ordre que `LowRange`.
- Écrire le chemin de repli : `Rest_dB` est calculé sur les trames au-dessus de `Gate_dB`.
- Voir l'arbitrage (c).

#### A2 — Le lot éditorial

Mécanique, sans décision. Écrit **en place**, selon F5 : aucun nouvel encadré daté.

- **AEC.** Les six « post-AEC » ou « fourche AEC » (l. 124, 208, 676, 722, 870, 1370) deviennent
  « brut, sans traitement » et « fourche du signal » *[ad 2, us F6]*.
- **Cadence.**
  - Aligner sur ADR-0007 les lignes 114–120, 128, 676, 689, 703–704, 828–829 et 1195–1206.
  - OQ-3 : « ADR-0007 Accepted », et non « à écrire ».
  - « État du code » : `EnvelopeFollower` n'est pas migré, et ADR-0007 bloque l'écriture du
    `VoiceAnalyzer`.

  *[us F1–F2]*
- **Chaîne en onze étapes.**
  - Conversion dB avant l'enveloppe, et `Process(Rms_dB)`.
  - Un seul nom de constante, `MinDb`, en dB.
  - « RMS lissé » devient `Rms_dB`, dont la plage est [−120 ; 0].

  *[ad 8, sd G, vérif]*
- **AC-34** aligné sur `VoiceFrame.cs:101-103`. En interne, l'anneau gèle ; en public, `Pitch = 0`.
  Ajouter : « 0 hors voisement = aucune mesure ; lire `Voiced` ». Arbitrage (d) *[qa 1]*.
- **Dénormaux.** Supprimer l'edge case et AC-15. Les remplacer par une phrase : « l'enveloppe
  opère en dB bornés ; aucun état ne peut devenir dénormal ». Arbitrage (f) *[ad 9]*.
- **Coût du 12 kHz.** Arbitrage (g) *[pa 2, 10]*.
  - Retirer « 2,25× » du GDD et d'ADR-0007:249.
  - Marquer le « ~1,8× » d'ADR-0004:226–228 comme non mesuré.
  - Écrire les tailles réelles : fenêtre YIN de 256 échantillons (32 ms), tampon ≈ 46 ms.
  - Tuning Knob de la décimation : « surcoût non mesuré ».
  - AC-42 mesure **deux** profils : la voix aiguë à 12 kHz et la plage par défaut à 8 kHz.
- **Tableau « ce que le joueur doit voir ».** `Loudness` devient « lu par les coéquipiers, jamais
  par soi ». `Degraded` suit F3 *[gd 3]*.
- **OQ-7.** ADR-0008 est Accepted et Dissonance retenu. Les vérifications restantes sont listées
  **sans ordre**, puisque l'ordre est contesté (C10) *[us F7]*.
- **Critères à ranger.** AC-35 passe EN ATTENTE (OQ-6). AC-24 part au système 6. AC-23, doublon
  de CAL-32, garde un seul propriétaire : le système 6 *[qa 6, 11]*.
- **AC-27.** Nouvelle justification : « profil corrompu ou édité sur disque ». Borne : le domaine
  du détecteur (A1.2). Retirer « reçu du réseau », selon E5 *[sd 3.1, qa 9]*.
- **Plancher dur.** Retirer la justification NaN. « Écart inexploitable » se définit sur
  `Scream_dB − Gate_dB`, avec un témoin. Arbitrage (h) *[acc 4]*.
- **Casque.** « Prérequis » partout. Le passage même-pièce (l. 966–967) et OQ-8 (l. 1405–1406) ne
  disent plus « casque recommandé en attendant » : le casque ne règle pas le cas même-pièce
  *[gd 6]*.
- **Périmés.**
  - « Last Updated » (l. 5).
  - « Aucun voisin n'a de GDD » (l. 667–669 et 699).
  - « Cinq valeurs » (l. 449) et « quatre trous » (l. 1157).
  - « Laissées à mesurer » (l. 1213).
  - OQ-4 : les protocoles sont en *Formulas*, pas en *Edge Cases* (l. 1318).
  - *Portée future* : la fuite du souffle disparaît avec A1.1.

  *[vérif, gd 2]*
- **Hors du GDD.**
  - `systems-index.md:28, 112, 339` et `mvp-scope.md:30` disent « construit, testé et figé » ou
    « écrit et testé ». Remplacer par : « primitives testées ; `VoiceAnalyzer` et normalisation à
    écrire ».
  - `game-concept.md`, *Design Risks* : ajouter le brouillage en configuration même-pièce, y
    compris la configuration d'assistance, avec un aidant à côté du joueur.

  *[vérif, gd 6, acc 12]*

### B — Ce que le prototype mesure pour le système 1

À ajouter à la liste B de la revue du système 11.

**Le prototype n'implémente ni YIN ni jitter.** Il calcule `Rest_dB` sur les trames au-dessus de
`Gate_dB`, c'est-à-dire le chemin de repli de F2 : il teste donc ce repli au passage.

1. **Où tombent un vrai chuchotement, la respiration normale, le clavier et les bruits de
   bouche**, en dB au-dessus du P95 de la pièce, chez toi et chez les testeurs. Cette mesure fixe
   `Margin_dB` et tranche la scission de l'arbitrage (a).
2. **p, la part des trames à `Loudness = 0` quand le joueur se tait** en respirant normalement,
   sur une étape de silence de 6 à 8 s. C'est le témoin du régime SILENCE du système 11.
   - Arithmétique à garder en tête : si chaque joueur est à zéro sur une part p des trames, et
     indépendamment des autres, quatre joueurs n'y sont ensemble que sur p⁴.
   - p = 0,95 donne 81 % ; p = 0,99 donne 96 %.
   - Le système 11 doit dire ce qui lui suffit.
3. **Le scintillement à la porte.** Un chuchotement ou une note douce posés juste sur `Gate_dB`
   font-ils clignoter l'objet entre 0 et ≈ 0,15 après lissage ?
4. **Attaque et relâchement, en dB, sous `c = exp(−Δt/τ)`** (OQ-5). Le relâchement gouverne « le
   meuble s'allège quand je me tais ».
5. **Le ressenti `LowRange`.** Se calibrer avec un cri volontairement retenu : le ×1,5 transforme-t-il
   le geste en curseur ? La forme, palier ou progression continue, se tranche après
   *[gd 5, acc 9]*.
6. **Hygiène de capture.** Journaliser `getSettings()` pour vérifier qu'`echoCancellation`,
   `noiseSuppression` et `autoGainControl` sont bien à `false`. Noter aussi la fréquence
   d'échantillonnage réellement livrée, et l'état des améliorations micro de Windows *[ad 2, us F8]*.
7. **Enregistrer le signal brut**, en local : la calibration et le silence. C'est la session
   « enregistrer une fois » d'OQ-4, qui alimente C9 sans rendez-vous supplémentaire. La moyenne sur
   10 s de silence dira s'il existe un offset DC réel (arbitrage b).

**Hors prototype** : hauteur, jitter, apériodicité, écrêtage, fils d'exécution, API Unity.

### C — Avant d'écrire le `VoiceAnalyzer`

Après le prototype et le test à plusieurs.

1. **Migration ADR-0007.** *[us F2–F5, qa 3, 13]*
   - `EnvelopeFollower` reçoit l'intervalle à chaque appel.
   - AC-14e : même échelon, deux cadences, même temps de montée en dB.
   - `N`, le TTL et la fenêtre de gel s'expriment en secondes.
   - Trancher « trames » (l. 148) contre « périodes acceptées » (l. 420).
   - Critère du facteur `LowRange` : il multiplie les **secondes**, jamais le coefficient. Sur un
     relâchement de 200 ms, 1,5 × 0,905 = 1,36 > 1, et le filtre diverge.
2. **ADR neuf : fil d'exécution de l'analyse et remise des trames**, au technical-director.
   *[us F10–F11, pa 5, 7, 8]*
   - Choisir entre worker et callback. ADR-0007:201 impose déjà « hors thread principal » :
     l'option « thread principal » d'us F10 exigerait de le rouvrir.
   - Sur quel fil `IMicrophoneCapture` lit-il le micro ? NON VÉRIFIABLE aujourd'hui.
   - Ce que couvre « 1 ms ». Formulé comme aujourd'hui, c'est un test qui ne peut pas échouer.
   - Épingler le backend, Mono ou IL2CPP. `gcIncremental: 1` est déjà actif.
   - Trancher AC-41b : hors périmètre, mais borné. Environ 1,5 Ko par bascule, jamais sur un
     callback temps réel, et un nombre maximal de trames `Silence`, testé.
3. **AC-42b scindé.** *[us F12, pa 9 — BLOQUANT → C]*
   - `Stopwatch` dans Core, compteur dans Capture.
   - `ProfilerMarker` et `CustomSampler` sont dans CoreModule. `ProfilerCounterValue<T>` exige
     `com.unity.profiling.core`, qui n'est pas installé.
   - Pourquoi C : c'est bloquant pour le code, puisque sinon il ne compile pas, et sans objet pour
     le prototype.
4. **AC-21 en critères structurels.** *[qa 5, corrigé par vérif]*
   - 21a : immuabilité, qui garantit la cohérence.
   - 21b : `Interlocked.Exchange` et `Volatile.Read`, qui garantissent l'atomicité — ce qu'un test
     par réflexion ne prouve pas.
   - 21c : reconstruction avant toute trame non-`Silence`.
5. **Surface publique.** Adopter le `PublicSurfaceTests` existant et mettre sa liste blanche à jour
   quand les types existent *[qa 12]*.
6. **Écrêtage.** `ClipThreshold` ≈ 0,998 et `ClipRunLength` ≈ 3, au niveau échantillon *[ad 10]*.
   - `Peak` est une seule valeur par fenêtre : il ne peut pas exprimer « plusieurs échantillons
     consécutifs ».
   - Rejoint OQ-C2 du système 6 : exposer le détecteur d'écrêtage.
7. **Contrat de fréquence d'échantillonnage.** *[us F8–F9, qa 10]*
   - Vers 12 kHz, les facteurs sont 3,675 depuis 44,1 kHz et 1,33 depuis 16 kHz : AC-31 ne vaut
     qu'à 48 kHz.
   - Le refus d'un facteur non entier vit dans le `VoiceAnalyzer`, puisque le `Decimator` ne
     connaît pas de fréquence cible.
   - Exiger une qualité minimale du rééchantillonneur, et écrire que le rééchantillonnage est
     permis sur la branche d'analyse.
   - Contraintes de format de Dissonance : NON VÉRIFIABLE, à lire dans sa documentation.
8. **Contrat du système 2.** *[qa 7, us F13, ad 2]*
   - La sortie de `Degraded` est l'événement « capture reprise », signalé par le système 2.
   - `OnAudioConfigurationChanged` est marqué « à vérifier » : la doc 6.3 ne le décrit que pour la
     sortie. Repli : sonder `Microphone.devices`.
   - Nommer les traitements de l'OS : AGC et APO Windows, Bluetooth HFP.
9. **Session de mesure hors ligne**, sur les enregistrements de B7 et des enregistrements ciblés.
   *[ad 3–5, acc 1–3, 6 — BLOQUANT → C : rien ne touche le portage du MVP, et les plages de
   littérature ne mesurent pas la même grandeur]*
   - `JitterMin` et apériodicité : note tenue par une voix entraînée, parole monotone, voix
     soufflée, frigo, ventilateur, larsen.
   - Bornes de crête sur trois registres : grave, médian, enfant. Tester en option une fenêtre de
     crête d'au moins deux périodes de `F0_habituel` : coût nul, puisque `LoudnessMeter` est
     statique.
   - Une vraie voix de basse.
10. **Ordre d'activation de Dissonance.** ADR-0008:383–388 et VENDORING.md:152–155 se
    contredisent. Le technical-director tranche *[us F7, vérif]*.
11. **Squelch matériel — rehaussé de D à C.** *[ad 7, recalculé]*
    - Correctif : borner l'entrée de l'enveloppe à `max(Rms_dB, Floor_dB − K)`. Une ligne.
    - À l'attaque, l'effet tient en une trame, comme l'a montré la vérification.
    - Mais au **relâchement**, un casque qui coupe à zéro numérique franchit la porte 3 à 4 fois
      plus vite. Exemple : parole à −30, pièce à −62, porte à −48 dBFS. On obtient 0,83 τ contre
      0,22 τ, soit ≈ 130 ms contre ≈ 35 ms à τ = 160 ms.
    - C'est un avantage de matériel sur « le meuble s'allège », ce que le Pilier 1 exclut.

### D — Important, non bloquant

- **AC-42 sous charge complète** (Dissonance, FMOD, FishNet, système 11), au premier test Unity en
  réseau *[pa 4]*.
- **Latence** *[pa 6 — rétrogradé]*. Mesure par horodatage propagé, à la première intégration.
  - Le chemin de `Loudness` coûte ≈ 64 à 91 ms de latence structurelle, et non 80 à 150 ms.
  - Les 350 ms du système 11 sont un délai de charge mesuré au banc, pas un budget de latence.
- Un critère pour `Uncalibrated → Calibrated` sans échantillons *[qa 8]*.
- **« Même effort »** est borné par la fidélité de `Scream_dB` : une ligne vers OQ-C6 *[gd 4]*.
- **Player Fantasy** : une phrase sur l'asymétrie `LowRange` *[gd 7]*.
- **AC-38** : écrire la bande d'accord de forme avant de figer `γ` *[qa 14]*.
- **Contrat vers le système 13** : la tolérance aux micro-coupures d'une note tenue lui appartient
  *[acc 7]*.
- **Deux tampons distincts**, la fenêtre `N` du jitter et l'anneau médian de 5 : une phrase
  *[sd C]*.
- **`Floor_dB < −120`** est inatteignable par la calibration : une ligne *[sd B]*.
- **Populations structurellement exclues**, à nommer dans la section accessibilité du système 6 :
  électrolarynx, voix soufflées sévères, implants et aides auditives face au casque. Les
  documenter, pas les résoudre *[ad 4, acc 3, 10]*.

### E — Différé sciemment

| Constat | Sévérité → décision | Raison |
|---|---|---|
| Passe-haut 20–40 Hz *[ad 11]* | BLOQUANT → **rejeté** ; l'offset est mesuré en B7 | Arbitrage (b) |
| Biais d'octave pour F0 < 70 Hz *[ad 5, sd 3.2]* | BLOQUANT → **limite documentée** | Arbitrage (e). Déclencheur : la vraie voix de basse de C9 |
| Hauteur plafonnée à ±1 octave *[acc 8]* | BLOQUANT → **OQ nommée** | Aucune mécanique du MVP ne lit `Pitch` au-delà. Déclencheur : le premier GDD qui consomme `Pitch`. Piste : le F0 du cri, mesuré à l'étape 3 |
| Seuil d'apériodicité par joueur *[acc 1]* | BLOQUANT → **non** | ADR-0004 reste. F2 couvre l'exclusion |
| `JitterMin` par joueur *[ad 4, acc 2]* | BLOQUANT → **pas maintenant** | Arbitrage (c). Si C9 montre un conflit, l'ancre légitime est la pièce, pas la voix |
| Plancher dur ramené à un epsilon *[acc 4]* | RECOMMANDÉ → **retenu en partie** | Arbitrage (h) |
| Lissage `LowRange` continu *[acc 9]* | BLOQUANT → **après B5** | La forme se tranche au ressenti |
| Seuil de dénormalisation 1e-15f *[pa 11]*, flush IL2CPP *[us F14]* | → **sans objet** | L'enveloppe opère en dB |
| « Activer le GC incrémental » *[pa 8]* | → **déjà fait** | `gcIncremental: 1` |
| Recalculs de coût en flops et en µs *[pa 2–3]* | → **mesure** | AC-42 tranche, pas le papier |

**À ignorer franchement** — réfuté, ou invérifiable présenté comme un fait :

- **Voix graves** : l'oscillation [55, 220] Hz, et « BLOQUANT pour les voix de 85–140 Hz ».
- **Voyelle tenue** : tout correctif fondé sur « la voyelle tenue déjà enregistrée en
  calibration ». Elle n'existe pas.
- **Pitch** : « rien ne force `Pitch` à 0 ».
- **Gardes prétendument absentes** :
  - « la garde sur le nombre de trames voisées manque » : CAL-07 existe ;
  - « la voix de repos au-dessus de 300 Hz n'est pas couverte » : c'est la règle 12 kHz
    elle-même.
- **Coût** : « un joueur grave coûte plus cher en YIN qu'un joueur aigu ».
- **Chiffres de littérature donnés comme des faits** : les 15–25 dB du chuchotement, les 15–25 dB
  d'atténuation en même pièce, le jitter d'opéra, l'électrolarynx. Tout cela se mesure.
- **Latence et fil audio** :
  - la latence de 80–150 ms ;
  - « un dépassement dans `OnAudioFilterRead` abîme tout le son du jeu » : ce n'est pas le chemin
    de capture retenu.
- **Code** :
  - « `EnvelopeFollower` est le seul type à état » : le `Decimator` en a un aussi ;
  - « `noEngineReferences` empêche Core de créer un thread » : c'est ADR-0004 qui cadre les fils,
    pas l'asmdef.

---

## 3. Arbitrages

### (a) Le zéro de `Loudness`

**Option 1 — au plancher, comme aujourd'hui. Rejetée.**

- Le bruit stationnaire est déjà à 0, puisque `Floor_dB` vaut P95 + 3 dB : le « rien ne ramène
  jamais à 0 » du game-designer est exagéré.
- Mais tout transitoire au-dessus pèse : 0,14 à Δ = 40 dB, et 0,30 à Δ = 13 dB.
- **Ce qu'aucun rapport ne dit** : la note voisée la plus douce vaut déjà `(Margin_dB / Δ)^γ`,
  soit 0,32 à Δ = 40 dB et **0,67 à Δ = 13 dB**, la limite basse acceptée par le système 6. Entre
  un tiers et deux tiers de l'échelle sont dépensés sur du bruit, et précisément chez les profils
  `LowRange`.
- Contredit la Promesse 4, et rend le silence collectif du système 11 inatteignable.

**Option 2 — porte à `Gate_dB`, dénominateur inchangé** *[ad, gd]*. **Rejetée** : `Loudness`
saute de 0 à 0,32 à l'instant où la porte de voisement s'ouvre.

**Option 3 — conditionner `Loudness` par `Voiced`. Rejetée** : elle supprime le chuchotement
phonétique, qui est apériodique.

**Option 4 — une rampe douce entre `Floor_dB` et `Gate_dB`. Rejetée** : le souffle garde un poids,
alors que le régime SILENCE du système 11 est un état discret.

**Option 5 — décalage continu du domaine** *[sd]*. **Retenue.**

- C'est le même ancrage que le `r'` de la revue du système 6 (B1) et que la piste A.4 du système
  11 : trois documents, un seul point de départ.

**Coût réel pour le chuchotement.**

- **Nul pour tout ce qui est voisé.** La porte de voisement exige déjà `Rms_dB > Gate_dB` : toute
  note chantée, même douce, reste au-dessus de 0. Elle gagne même en finesse, puisqu'elle part de 0
  au lieu de 0,32 ou 0,67. Le Pilier 3, « chanter doucement », en profite.
- **Le coût tombe sur le chuchotement phonétique plus faible que `Gate_dB`**, soit P95 + 10 dB
  avec les valeurs provisoires. Il devient 0 : sûr, mais invisible.
- « 15–25 dB au-dessus du plancher » *[ad]* contre « dans les 7 dB » *[gd]* : aucune des deux
  positions n'est vérifiable. La déduction de l'audio-director est en outre incompatible avec
  `RestMax` à Δ ≈ 40 dB. B1 tranche.

**Déclencheur de scission** (corrigé par rapport à la première rédaction de ce raisonnement).

- Si B1 montre respiration < chuchotement < `Gate_dB`, on descend **seul** le zéro de sonie :
  `Margin_sonie < Margin_voisement`.
- Si le chuchotement tombe sous la respiration, aucune marge ne les sépare, et le prix est
  accepté.

**Conformité au principe des seuils personnels.**

- `Floor_dB` est personnel : c'est le P95 de ta pièce, **respiration comprise**, dès que l'étape 1
  dure 6 à 8 s en respirant normalement. C'est la réponse à acc 5, sans mesure supplémentaire.
- `Margin_dB` détecte du bruit, il ne juge pas une voix.

### (b) Le passe-haut comme « seconde exception » à ADR-0003 — non

- **La prémisse est caduque.** « Seul traitement autorisé en amont » (ADR-0003:271–273) fait
  partie de la puce AEC rétrogradée le 2026-09-08. Il n'y a aujourd'hui aucune exception sur la
  branche d'analyse, ni première ni seconde.
- **Aucun témoin.**
  - Un offset DC stationnaire entre dans le P95, donc dans `Floor_dB` : il comprime un peu le bas
    de l'échelle, sans créer d'entrée fantôme.
  - La fonction de différence de YIN annule un offset constant par construction.
  - Les chocs de bureau sont large bande : une coupure à 20–40 Hz ne les retire pas. C'est un
    raisonnement, pas une mesure.
- **Un prix.** Un filtre à un pôle à 40 Hz donne −1,2 dB et +30° à 70 Hz : il déforme l'onde, donc
  `CrestDb`, précisément pour les voix graves.
- **Suite honnête.**
  - B7 mesure l'offset.
  - S'il existe, on soustrait une moyenne glissante d'environ 1 s. C'est bien un filtre (coupure
    ≈ 0,16 Hz), et on le dit : il ne touche ni la dynamique ni la forme d'onde dans la bande
    vocale.
  - Le nettoyage d'ADR-0003 (étape 2 du §4) réécrit la règle dans ces termes : « aucun traitement
    qui modifie la dynamique ou la forme d'onde dans la bande vocale ». On évite ainsi d'accumuler
    des exceptions.

### (c) `JitterMin` doit-il devenir personnel ? — Pas maintenant, mais il ne doit jamais exclure

**Ce que c'est** : un détecteur de source non humaine. Le principe l'autorise s'il n'attrape aucune
voix humaine, et ce n'est vérifié dans aucun sens.

- La littérature mesure le jitter cycle à cycle. Le document mesure une variabilité de F0 trame à
  trame, qui inclut le vibrato et la dérive.
- À 220 Hz, 0,5 % représente ≈ 0,18 échantillon : l'ordre de l'erreur d'interpolation de YIN. On
  mesure peut-être le détecteur, pas la voix.
- Électrolarynx : NON VÉRIFIABLE.

**Les correctifs proposés reposent sur une prémisse fausse** : aucune voyelle tenue n'est
enregistrée pendant la calibration.

**Une version corrigée ne ferait pas mieux.** Dériver `JitterMin` de la parole de l'étape 2 ne
protège pas le cas redouté : la note tenue d'un chanteur entraîné est plus stable que sa parole.
Pour un détecteur de source non humaine, l'ancre personnelle légitime est **la pièce** (les sources
périodiques captées à l'étape 1), pas la voix. Piste à garder si C9 montre un conflit.

**L'enjeu réel est ailleurs, et plus grand que ne le disent les spécialistes.**

- Le système 6 définit `V` comme l'ensemble des trames de l'étape 2 où `Voiced = true`, porte
  complète comprise.
- Une voix que YIN ou le jitter rejettent n'atteint jamais `VoicedMin`. Pas de profil : elle est
  **exclue du jeu entier**, pas seulement des mécaniques de hauteur.
- Le mécanisme est le même pour une voix soufflée (apériodicité) et pour une vraie basse sous
  70 Hz.

**Tranché.**

- 0,5 % et 0,15 restent globaux et provisoires, vérifiés en C9.
- **Et, selon F2, un détecteur ne refuse jamais seul un profil.** Si les trames passent `Gate_dB`
  mais que la régularité ou la périodicité bloquent, le profil est accepté et marqué « hauteur
  indisponible ». `Rest_dB` est alors calculé sur les trames au-dessus de `Gate_dB`.
  - Si c'est le jitter qui bloquait, il est désactivé pour ce joueur.
  - Si c'est l'apériodicité, `Voiced` et `Pitch` restent indisponibles pour lui.
- **Prix.** Pour ce joueur, un bourdonnement fort peut passer pour une voix sur `Voiced`. Mais
  `Loudness`, donc le portage, n'en dépend pas.

### (d) `Pitch` hors voisement — *Formulas* §2 l'emporte, AC-34 est réécrit

- **Les deux spécialistes partent d'une prémisse fausse.** `VoiceFrame.cs:101-103` force déjà
  `Pitch` à 0, et `Silence()` aussi. Retenir AC-34 reviendrait à modifier un contrat public.
- **La contradiction n'est qu'à moitié réelle.** L'anneau gèle en interne (*Edge Cases*) **et** le
  champ public vaut 0. Seule la seconde moitié d'AC-34 est fausse.
- **L'argument de jeu est décisif.** Imaginons un consommateur qui oublie de lire `Voiced`.
  - Avec « garder la dernière valeur » : chanter une fois puis se taire tient la note indéfiniment.
    Le silence remplit la mécanique, l'anti-pilier est violé, et aucun symptôme ne le montre.
  - Avec 0 : la note casse à chaque consonne, ce qui se voit au premier playtest. Il reste un cas
    silencieux, beaucoup plus étroit : une cible placée exactement sur la hauteur habituelle.
  - **On préfère la panne bruyante.**
- **Le point juste du systems-designer** : 0 n'est pas une sentinelle. Le document écrit donc
  « 0 hors voisement = aucune mesure ; lire `Voiced` ». La tolérance aux micro-coupures appartient
  au système 13.

### (e) Les voix graves

- **Réfuté** : l'oscillation [55, 220] Hz. Le recadrage donne [70, médiane × 2], et maxLag = 115
  reste sous la période de 55 Hz (145,5 échantillons).
- **Réfuté** : « BLOQUANT pour 85–140 Hz ». Ces voix sont dans la plage détectable.
- **Reste le cas F0 < 70 Hz, rare.** YIN accroche 2 × F0 ou déclare la trame non voisée ; lequel
  des deux est NON VÉRIFIABLE sans signal.
  - S'il accroche, `Pitch` reste cohérent autour de la voix habituelle, et ne se trompe qu'aux
    hauteurs qui entrent dans la plage.
  - S'il déclare non voisé, c'était une exclusion totale : F2 la supprime.
- **Le correctif à 50 Hz coûte cher** : fenêtre d'au moins 320 échantillons, tampon de 60 ms au
  lieu de 46, YIN × 1,74.
- → **E**. Déclencheur : la vraie voix de basse de C9.

### (f) Branches mortes

- **Dénormaux : morts en dB, et nuisibles pris à la lettre.** Le seul témoin réel est le code
  linéaire actuel, que la migration C1 remplace. On les supprime, et le seuil 1e-15f et le flush
  IL2CPP deviennent sans objet.
- **`F0_habituel < 20 Hz` : pas mort, mal témoigné.** Le vrai témoin est un profil corrompu sur
  disque, revalidé au chargement. La borne devient le domaine du détecteur (A1.2).
- **« Profil reçu du réseau »** : mort, si E5 est retenue.
- **« Il manque une garde sur le nombre de trames voisées »** *[sd 3.1]* : faux, CAL-07 existe.
- **« Le budget d'1 ms couvre la remise de la trame »** : un test qui ne peut pas échouer.
  Reformulé en C2.
- **`RestMin`** (système 6) : disparaît avec `r'`.
- **`Peak / Rms < 1`** : aucun témoin, et le seul cas dégénéré est déjà couvert *[sd A]*. Rien à
  faire.

### (g) Autres désaccords

- **2,25× / 1,8× / ≈ 1× : ni vrai ni faux, mal posé.**
  - Pour une même voix passée de 8 à 12 kHz, YIN coûte bien ≈ 2,2× si la fenêtre garde sa durée.
  - Comme « pire cas », la voix aiguë à 12 kHz coûte à peu près autant que la plage par défaut à
    8 kHz (calibration, voix grave recadrée, maxLag 115) : ≈ 0,9× à 1,35× selon la fenêtre, qui
    n'est pas spécifiée à 12 kHz.
  - Rien n'est mesuré. On retire les trois chiffres, et AC-42 mesure les deux profils.
- **`ProfilerRecorder`, BLOQUANT *[us]* ou RECOMMANDÉ *[pa]* ?** Bloquant pour le code, sans objet
  pour le prototype → C3.
- **Thread principal *[us F10]* ou worker/callback *[pa]* ?** ADR-0007 tranche le principe (hors
  thread principal), pas le mécanisme → ADR neuf en C2. `OnAudioFilterRead` n'est pas le chemin de
  capture retenu (ADR-0008) : le scénario d'artefacts de pa ne s'applique pas en l'état.
- **AEC.** Chaque spécialiste lit une moitié d'ADR-0003, dont le corps n'a jamais suivi le statut
  → nettoyage des ADR (§4, étape 2).
- **Ordre d'activation de Dissonance.** Deux documents du projet se contredisent → C10. D'ici là,
  OQ-7 liste les vérifications sans ordre.
- **AC-31 atteignable *[qa]* ou non *[us]* ?** Les deux ont raison : il ne l'est qu'à 48 kHz → C7.
- **`Degraded` pour soi *[gd 3, acc 11]* et retour sur sa voix pour les joueurs sourds *[acc 10]*.**
  La doctrine proprioceptive couvre « ce que j'émets », pas « est-ce qu'on m'entend » : aucun sens
  corporel ne détecte un micro mort → F3.

### (h) Le plancher dur — refuser ou accepter ? *[acc 4 contre le document]*

- **La justification actuelle est fausse.** Le NaN n'apparaît qu'à Δ = 0, cas déjà exclu par
  l'ordre strict V1 du système 6.
- **Mais ton principe range nommément l'« écart inexploitable » parmi les mesures cassées.** Un
  refus reste donc légitime, à condition de détecter cela.
- **Tranché.**
  - On garde un refus, redéfini sur la plage utile `Scream_dB − Gate_dB`.
  - Il lui faut un témoin. Par exemple : sous environ deux fois l'oscillation trame à trame de
    `Rms_dB` sur une voix tenue, le joueur ne peut plus produire deux niveaux distincts.
  - La valeur viendra de B7 et C9, pas des 12–15 dB actuels.
  - Entre ce refus et la bande de qualité : `LowRange`. D2 donne la sortie après deux refus.

---

## 4. Motif, racine, et ordre de la passe groupée

### Le système 1 est-il la racine ? Oui, pour cinq défauts de la semaine

| Défaut en aval | Racine dans le système 1 |
|---|---|
| Système 6 : `RestMin` mort, `RestMax` piège les profils `LowRange` | **Deux planchers** : `Loudness` part de `Floor_dB`, la porte de voisement de `Floor_dB + Margin_dB`, d'où `r ≥ Margin / Δ` |
| Système 11 : chuchotement « sûr » sans témoin, silence collectif inatteignable (C3) | Les deux mêmes planchers, et `Loudness` non conditionnée par `Voiced` |
| Système 6 : `F0Min` mort, `F0Max` nuisible | Le domaine du détecteur n'a jamais été publié comme contrat |
| Système 11 : seuils déplacés par `γ` | Un seul `γ` pour deux métiers |
| Systèmes 6 et 1 : comptes 10 / 14 / 24, provenance de `HardFloor_dB` | Des valeurs listées deux fois, sans propriétaire |

**Pas la racine** de :

- la provenance des 350 ms, de la sémantique de l'avertissement, et de la zizanie neutralisée ;
- le relais des `VoiceFrame` vers les clients ;
- le profil envoyé à l'hôte : il vient d'ADR-0003:337, que le système 1 ne fait que répéter.

**Pourquoi la racine n'a pas été corrigée à la source** — c'est une lecture du creative-director,
appuyée sur deux indices :

- l'index (`systems-index.md:28`) et `mvp-scope.md:30` décrivent le système 1 comme « construit,
  testé et figé » ;
- le système 6 a **compensé** la formule au lieu de la contester : `FloorMargin_dB` empilé sur
  `Margin_dB`, `RestMin` pour soutenir `L_repos`.

On a traité une spécification inachevée comme une fondation coulée : c'est **le mythe de la
fondation figée**.

### Les défauts de méthode, tous présents ici

- **Atteignabilité** : deux planchers, témoin d'AC-27, dénormaux, AC-31 valable seulement à
  48 kHz, « 1 ms » infalsifiable.
- **Provenance** :
  - le 2,25× passé d'une revue à un ADR ;
  - « Protocole A » cité pour une valeur qu'il ne produit pas ;
  - des plages de littérature (0,15, 0,5 %) présentées comme des seuils ;
  - le tableau FFT d'ADR-0003, hérité d'un modèle abandonné.
- **Disponibilité des données et des API** : `ProfilerRecorder` dans une assembly sans moteur,
  `OnAudioConfigurationChanged` (sortie seulement), « reçu du réseau », fil où vivent les
  échantillons.
- **Propagation par redites** : cadence ×7, AEC ×6, comptes 5 / 10 / 13 / 24, trois encadrés qui
  contredisent leur section.
- **Nouveau : les recommandations de revue non vérifiées.**
  - Quatre points de la revue du 07-09 étaient faux ou invérifiés. Appliqués fidèlement, ils sont
    devenus des exigences et des lignes d'ADR.
  - Cette semaine, les spécialistes ont produit neuf prémisses réfutées, en tout ou en partie, et
    présenté deux plages de littérature comme des seuils.
  - **L'étape de vérification adversariale est porteuse.** Une recommandation de revue est une
    hypothèse tant qu'elle n'est pas vérifiée, pas une exigence.

**Règle proposée pour `.claude/rules/design-docs.md`** (décision F5) :

> Une correction ou un changement de statut d'ADR **modifie la section normative en place**, après
> recherche du terme dans tous les GDD et ADR. La note datée va dans un historique en fin de
> document ; un encadré qui contredit le texte au-dessus de lui est un défaut. Une valeur ou un
> compte ne s'écrit qu'une fois, avec son propriétaire ; ailleurs, on renvoie. Un GDD amont publie
> la **table des domaines atteignables** de ses sorties, et les GDD aval la citent. Toute
> affirmation technique issue d'une revue — chiffre, API, comportement moteur — est vérifiée contre
> le code ou la documentation avant d'être appliquée.

### Ordre consolidé

| Étape | Contenu | Débloqué par |
|---|---|---|
| **0** | Tes décisions du §6, en une conversation | — |
| **1** | **Système 1**, A1 puis A2, dans la même séance. En premier : `Gate_dB`, la table des domaines et la liste canonique, contre lesquels 6 et 11 se re-dérivent | F5, F1, E5, F2 |
| **2** | **ADR et documents transverses**, même séance. ADR-0003 : ligne 337 selon E5 ; corps AEC (189–217, 269–273, 350, 382–384) ; règle « aucun traitement » réécrite ; « irréalisable » devient « possible, refusé, voici le prix » (D3) ; tableau FFT marqué hérité. ADR-0007 : ligne 249 et formule du coefficient. ADR-0004 : 226–228. ADR-0008 : 33–34, 55, 93–98. Plus `systems-index.md` et `mvp-scope.md` | E5 |
| **3** | **Système 6.** V2/V3/V4 re-dérivés sur `Gate_dB` : `r' ∈ ]0 ; 1[`, `RestMin` disparaît, `RestMax` re-dérivé ou converti en `LowRange`. Plancher dur et bande de qualité sur `Scream_dB − Gate_dB`, avec témoin (h). Validité de F0 = domaine du détecteur. F2, D1, D2. Étape 1 de 6 à 8 s en respirant. CAL-34 selon E5 | F1, E5, F2, D1, D2 |
| **4** | **Système 11.** Seuils sur `r'`, `γ` sorti. Régime SILENCE avec témoin p à mesurer. Plateau E2. E1 écrit comme A/B. Meuble témoin E4. Paragraphe réseau supprimé | F1, E5, E1, E4 |
| **5** | `mvp-scope.md` : E3 et session même-pièce. `game-concept.md` : risque même-pièce | F4 |
| **6** | Prototype navigateur, avec les listes B des systèmes 1 et 11 | — |
| **ensuite** | Test à plusieurs humains ; puis la liste C et l'ADR neuf, avant toute ligne du `VoiceAnalyzer` | — |

---

## 5. Verdict

### NEEDS REVISION

**Ce qui tient.** L'architecture : normalisation par joueur, frontière entre brut et normalisé,
profil immuable publié par référence, états et transitions. Sa discipline — règle des
dénominateurs, décisions documentées — reste la meilleure du projet.

**Ce qui est à refaire, en réalité peu de chose.**

- **Re-dériver une seule formule** : le zéro de `Loudness`.
- **Créer une seule section** : la table des domaines atteignables.
- Tout le reste relève de la **propagation** : faire dire aux sections normatives ce que les ADR
  et les encadrés ont déjà décidé.

**Pourquoi pas MAJOR.** La différence avec les systèmes 6 et 11 est de nature. Chez eux, des
mécanismes centraux ne tenaient pas. Ici, un ancrage est mal placé : c'est la taille de ses
conséquences en aval, pas celle du correctif, qui en fait la priorité.

**Pourquoi ce n'est pas approuvable pour autant.**

- Sa formule de sonie est la racine commune des deux MAJOR de la semaine.
- Ses critères d'acceptation laisseraient passer un `VoiceAnalyzer` qui viole au moins trois
  garanties écrites : cadence variable, `LowRange`, surface publique.

**On saura que la révision était juste si :**

- les systèmes 6 et 11 se re-dérivent en ne citant, du système 1, que sa table des domaines ;
- au prototype, p est assez haut pour que p⁴ satisfasse le régime SILENCE ;
- ton vrai chuchotement tombe d'un côté identifié de `Gate_dB`, et la note chantée la plus douce
  part de près de 0.

### Scope signal

À vérifier par le producer.

- **Révision du système 1 : S–M.** Une séance : une demi-séance de dérivation, partagée avec 6 et
  11, puis l'éditorial.
- **Implémentation : L.** `VoiceAnalyzer`, migration ADR-0007, fil d'exécution et capture avec les
  inconnues de Dissonance, réécriture des critères.
- **Passe groupée entière : environ 5 à 6 séances.** Système 1 : 1 ; système 6 : 2 à 3 ;
  système 11 : 2.

### ADR

- **ADR-0003 (A)** :
  - ligne 337 selon E5 ;
  - retrait du corps AEC ;
  - règle « aucun traitement qui modifie dynamique ou forme d'onde » ;
  - reformulation D3 ;
  - tableau FFT marqué comme hérité.
- **ADR-0004** : « 1,8× » marqué non mesuré (A) ; liste blanche de surface (C).
- **ADR-0007** : ligne 249 et formule `c = exp(−Δt/τ)` (A) ; AC-14e et horloges en secondes (C).
- **ADR-0008** : lignes post-AEC (A) ; ordre d'activation réconcilié avec VENDORING.md (C).
- **ADR neuf (C)** : fil d'exécution de l'analyse, remise des trames, backend épinglé.
- **Rappels des revues 6 et 11** : ADR de persistance du profil (OQ-C1), addendum à ADR-0002, ADR de
  réplication des curseurs.

---

## 6. Tes décisions avant la passe groupée

**D3 est fermée sans décision.** Ta décision du 2026-09-08 — casque obligatoire, pas d'annulation
d'écho sur l'analyse — la tranche déjà. Il ne reste qu'à reformuler ADR-0003 (étape 2).

**Tranché par le creative-director sans décision de ta part** — conteste ce qui te gêne :

- `Pitch = 0` quand on ne produit pas de voix (d) ;
- pas de filtre passe-haut ; un offset éventuel est mesuré d'abord (b) ;
- seuils de régularité et d'apériodicité globaux et provisoires, vérifiés sur enregistrements (c)
  — mais voir la décision 4 ;
- voix très graves documentées, pas corrigées (e) ;
- dénormaux supprimés (f) ;
- plancher dur gardé, redéfini sur la plage utile avec un témoin (h) ;
- une hauteur habituelle est valide si le détecteur peut la mesurer (f) ;
- facteur 2,25× retiré, remplacé par une mesure (g) ;
- fil d'exécution et ordre d'activation de Dissonance confiés au technical-director (C).

**Dix décisions, dans l'ordre de ce qu'elles débloquent.**

| # | La question, en clair | Ma recommandation |
|---|---|---|
| **1 · F5** | **Comment corrige-t-on un document ?** Aujourd'hui, on ajoute un encadré daté sous le texte faux, sans toucher au texte. Résultat : à trois endroits du système 1, le texte dit une chose et l'encadré le contraire, et les systèmes 6 et 11 ont recopié la mauvaise version. | **Corriger le texte en place**, garder l'historique en fin de document, et ajouter la règle du §4 aux règles de conception — y compris « une recommandation de revue se vérifie avant d'être appliquée ». |
| **2 · F1 + E2** | **À partir de quand le jeu t'entend-il, et que fait un chuchotement ?** Aujourd'hui, le jeu compte ton volume dès 3 dB au-dessus du bruit de ta pièce, mais ne reconnaît une voix que 7 dB plus haut. Entre les deux, ta respiration ou ton clavier font peser l'objet : ≈ 14 %, jusqu'à 30 % si ta voix a peu d'écart entre normal et cri. Et ta note chantée la plus douce vaut déjà un tiers de l'échelle, deux tiers pour une voix à faible écart. À quatre, le silence complet n'arrive peut-être jamais. | **Un seul point de départ, là où commence la voix (≈ 10 dB au-dessus du bruit), atteint en douceur.** Toute note chantée, même très douce, compte, et gagne en finesse. **Prix** : un chuchotement soufflé plus faible que ce point devient « rien », sûr mais invisible. Au-dessus, il fait frémir l'objet sans jamais déclencher l'alerte (E2, inchangée). Le prototype mesure où tombe ton vrai chuchotement ; s'il est au-dessus de ta respiration mais sous ce point, on descend seulement le départ du volume. |
| **3 · E5, précisée** | **Quel nombre sur ta voix part vers l'hôte ?** Sans un nombre sur ta voix normale, l'hôte ne sait pas quand tu deviens une alarme, et le jeu ne marche pas en réseau. | **Oui, un seul nombre entre 0 et 1** : la place de ta voix posée entre ton point de départ et ton cri, mesurée en décibels. Ton profil ne quitte jamais ta machine. On le préfère à l'ancien `L_repos` parce que régler plus tard « comment le volume se ressent » ne déplacera plus en douce les seuils de tous les meubles (jusqu'à 27 % aujourd'hui). |
| **4 · F2** | **Une vraie voix que nos détecteurs lisent mal : refusée ou acceptée ?** Deux tests écartent ce qui n'est pas une voix : trop régulier (un frigo), pas assez périodique (un souffle). Personne ne sait si de vraies voix tombent dedans : chanteur très entraîné, voix soufflée par une maladie, larynx électronique, basse très profonde. Si c'est le cas, aujourd'hui, la calibration échoue et la personne **ne peut pas jouer du tout**. | **Accepter et signaler, comme `LowRange`.** Le volume et le portage marchent normalement ; seules les mécaniques de hauteur et de note tenue peuvent être indisponibles pour ce joueur. Les seuils eux-mêmes restent provisoires, et seront vérifiés sur enregistrements avant le code Unity. |
| **5 · D2** | **Combien de calibrations refusées avant de proposer un profil approximatif ?** Sans limite, un joueur peut rester bloqué pendant que ses amis attendent. | **Deux.** |
| **6 · D1** | **Pendant la calibration, quand tu cries, que montre l'écran ?** Une jauge qui monte apprend « fort = bien », l'inverse du jeu. | **La conséquence** : un objet qui s'alourdit. C'est aussi ce qu'affiche la mini-calibration du prototype. |
| **7 · E1** | **Au banc d'essai, qu'as-tu jugé « le meilleur » ?** Le halo s'allumait dès que tu parlais. Le document en a fait « rien pendant 350 ms, puis un grincement ». | **Ne pas trancher sur le papier.** Le prototype propose les deux versions, commutables, et tu choisis en jouant. |
| **8 · E4** | **Parler normalement doit-il déclencher l'alarme sur tous les meubles ?** | **Garder ta décision**, et mettre **un** meuble tolérant dans le prototype comme point de comparaison. |
| **9 · F3** | **Quand ton micro coupe, comment le sais-tu ?** Ton sonomètre est sur ta poitrine, et seuls les autres le lisent. Si ton micro meurt, rien ne te le dit, et tu crois que tu n'as pas assez crié. Quant à un joueur sourd ou malentendant, il n'a jamais de retour sur sa propre voix. | **Toujours une petite icône « micro coupé », pour toi seul**, même si elle n'est pas diégétique : aucun sens corporel ne détecte un micro mort, et « se connaître par son corps » ne couvre pas ce cas. **Et accepter le principe** d'une option d'accessibilité, désactivée par défaut, qui affiche ton propre volume. Sa conception va au GDD du système 19. |
| **10 · F4 + E3** | **Dans quelles conditions se fait le premier test à plusieurs ?** Sans tâche qui exige du son, une équipe muette gagne et le test a l'air réussi. Et si chacun joue chez soi, on ne verra jamais ce qui arrive quand le micro de l'un capte la voix de l'autre — alors que tu vises les groupes d'amis, les streamers, et le parent assis à côté d'un enfant. | **Deux conditions bloquantes dans `mvp-scope.md`.** (a) Au moins une tâche qui exige du son : une porte grossière sur une note tenue. (b) Au moins une session à deux dans la même pièce, casque sur les deux, avec 30 s de mesure : la voix de A captée par le micro de B passe-t-elle son point de départ ? Tant que (b) n'est pas fait, pas de GDD pour les systèmes 3 et 12. |
