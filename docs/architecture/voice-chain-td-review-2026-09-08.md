# Revue technique — la chaîne vocale prise comme chaîne

| Champ | Valeur |
|---|---|
| **Date** | 2026-09-08 |
| **Auteur** | `technical-director` |
| **Périmètre** | GDD systèmes 1 et 6 · ADR-0003 à 0008 · `Voice.Core` (8 fichiers, 41 tests) · intégration vendorisée |
| **Nature** | Revue **de chaîne**, pas de document — les deux GDD avaient déjà été relus séparément |
| **Statut** | Rendue, **non traitée** |

---

## Vérifications indépendantes

Deux trouvailles principales ont été **recontrôlées dans les fichiers** avant archivage,
parce qu'elles portent sur le code et qu'une revue précédente avait affirmé deux choses
fausses.

| Affirmation | Contrôle | Résultat |
|---|---|---|
| Aucune cadence d'échantillonnage nommée dans `design/` ni `docs/` | `grep -riE "48 ?000\|44100\|sampleRate\|fréquence d'échantillonnage"` hors `engine-reference` | **Zéro occurrence — confirmé** |
| `Decimator` n'accepte qu'un facteur entier | `Decimator.cs:74` — `Decimator(int factor, float inputSampleRate, …)` | **Confirmé** |
| `PitchDetector` dérive `F0` de la cadence supposée | `PitchDetector.cs:162` — `float frequency = _sampleRate / refinedLag` | **Confirmé** |
| Aucune conversion en décibels dans `Voice.Core` | `grep -rn "log10\|Log10\|ToDb\|Decibel\|_dB"` sur tout `Voice.Core/` | **Zéro occurrence — confirmé** |
| L'enveloppe lisse une valeur linéaire | `EnvelopeFollower.cs:96` — `Process(float input)`, aucune conversion en amont | **Confirmé** |

---

## Les défauts, par gravité

### A. La chaîne n'a pas de fréquence d'échantillonnage — **vérifié**

Aucun document ne la nomme. Or `Decimator` exige un **facteur entier** : 48000/8000 = 6 et
48000/12000 = 4 fonctionnent, **44100/8000 = 5,5125 n'existe pas**. Et `PitchDetector`
calcule `F0 = _sampleRate / refinedLag` — une cadence supposée fausse produit un `F0` faux,
donc un `Pitch` en demi-tons faux, **sans exception ni NaN**.

Les GDD spécifient les fenêtres en millisecondes (21 / 46), le code en échantillons.
**Personne ne possède la conversion.**

*Correctif proposé* : nommer une cadence canonique comme contrat du système 2 — le
rééchantillonnage lui appartient, pas à Core — et ajouter une garde refusant un facteur non
entier.

### B. L'AEC n'a aucun propriétaire — **partiellement supposé**

14 mentions dans `design/` et `docs/`, toutes de la forme « échantillons post-AEC, livrés
par le système 2 ». **Aucune ne nomme qui l'implémente**, et le système 2 n'a pas de GDD.

Le point aigu, marqué *supposé* par la revue et **à vérifier** : `IMicrophoneCapture` de
Dissonance remplace la **capture**, tandis que son préprocesseur — dont l'AEC — s'applique
**en aval**, sur le PCM qu'on lui remet. Sur l'architecture actuelle, **la branche d'analyse
ne recevrait donc aucune AEC** : elle serait du mauvais côté de la fourche.

Si cela se confirme, l'amendement d'ADR-0003 qui reclasse l'AEC de « confort » en
**correction de gameplay** est un vœu, et le casque redevient l'unique mitigation.

*Trois issues* : AEC de Dissonance utilisable en amont (à vérifier) · plugin natif WebRTC-APM
· assumer le casque et **rétrograder l'amendement par écrit**.

### C. ADR-0007 : bonne règle, mécanisme trop étroit

Le constat qui a fondé l'ADR reste juste — aucun mécanisme Unity ne donne 50 Hz fixes, à ne
pas rouvrir. Deux corrections :

- **Le coût annoncé est surestimé.** `EnvelopeFollowerTests` porte **7 tests sur 41**, dont
  4 gardent leur sens tels quels. Une demi-journée, pas un chantier. Les 34 autres ne
  bougent pas.
- **L'ADR corrige un élément dépendant du temps sur cinq.** Restent implicites : les fenêtres
  21 / 46 ms, la fenêtre de jitter `N` (en trames), le TTL de l'anneau (en trames), la
  fenêtre de gel d'écrêtage (250 ms, comptée comment ?).

*Correctif proposé* : remplacer le `deltaTime` par un `AnalysisTiming { DeltaSeconds,
SampleRate }` fourni par trame, et réexprimer `N`, le TTL et la fenêtre de gel **en
secondes**. **Résout aussi A.** Retirer par ailleurs la règle « un intervalle aberrant
réutilise le dernier valide » — substituer en silence est le mode d'échec que le projet
traque.

### D. La frontière d'assemblies est au bon endroit, la charge ne l'est pas

Ne pas déplacer la ligne d'ADR-0006. Mais `voice-calibration.md` affirme que « toute la
logique qui peut produire un profil faux est du côté testable », **et c'est faux tel
qu'écrit** : le numéro de version de schéma et la revalidation au chargement (CAL-30,
CAL-31) n'ont pas de maison. Placés dans la couche de persistance, ces deux critères
deviennent intestables.

*Correctif proposé* : nommer un troisième morceau — sérialisation `VoiceProfile` + version
de schéma + revalidation — et le placer **dans Core**, en ne laissant que l'E/S fichier à
Unity.

### E. L'atomicité : vrai problème, mais pas celui qu'on croyait

Les quatre nombres ne sont pas le sujet. Un `VoiceProfile` **classe immuable** publié par
affectation de référence est atomique gratuitement en .NET — `Volatile.Read` côté analyse,
`Interlocked.Exchange` côté commit.

> **Piège à écrire noir sur blanc** : « optimiser » en `readonly struct` pour éviter
> l'allocation **casse l'atomicité** et produit exactement le bug qu'on voulait éviter.

Le vrai problème : les deux GDD exigent que `Decimator` et `PitchDetector` soient
**reconstruits à la réception du profil**. Ces objets sont à état — `Decimator` porte 81
coefficients et une ligne à retard — et ne se remplacent pas atomiquement.

*Règle proposée* : le fil de commit **publie la référence, rien d'autre**. Le fil d'analyse
lit la référence en tête de trame, constate le changement, reconstruit ses propres
instances, remet enveloppe et anneau à zéro. AC-21, AC-41b et CAL-24 ne deviennent testables
qu'avec cette règle écrite.

### F. Les 24 valeurs provisoires : le plan tient, l'ordre n'est pas écrit

Quatre dépendances d'ordre qu'aucun document n'énonce :

1. `FloorMargin_dB` **avant** `HardFloor_dB` / `QualityBand_dB` — il déplace `Δ` d'autant.
2. `FloorMargin_dB` **et** `Margin_dB` se règlent **ensemble** : deux marges empilées sur le
   même plancher, les régler séparément les double.
3. `γ` **après** stabilisation de `Floor` / `Scream`.
4. `RestMin` / `RestMax` **en dernier** — ils supposent des calibrations réelles déjà
   passées sous seuils provisoires.

*Proposition* : une seule session capturant le **signal brut**, dont tout se dérive hors
ligne et **se rejoue**. C'est la règle d'AC-40 — « mesurer une fois, rejouer toujours » —
généralisée aux 24.

### G. Le budget de performance est crédible, l'estimation fausse d'un facteur 3–4

Calcul refait sur le code : `ComputeDifference` coûte `maxLag × windowSize`. À 8 kHz,
70–600 Hz, fenêtre 256 → `maxLag = 115` → **29 440 itérations**. L'estimation d'ADR-0004
(~25 µs) suppose ~0,85 ns par itération, soit du SIMD et non du scalaire Mono/IL2CPP.
Attendre **60–120 µs**.

**Sans conséquence** : à 50 Hz hors thread principal, cela fait 0,3–0,6 % d'un cœur. Le pire
cas 12 kHz est même plus doux qu'annoncé — **~1,8× et non 2,25×**, parce que la quatrième
défense resserre aussi `minHz`, ce qui diminue `maxLag`.

> **Conclusion : la performance est le moindre des risques.** Cesser d'y consacrer de la
> conception. AC-42b garde sa valeur comme diagnostic, pas comme budget.

---

## Ce qui tient, et qu'il ne faut pas rouvrir

- **La frontière brut/normalisé opposable à la compilation** — ADR-0004 plus
  `PublicSurfaceTests`. *« La meilleure décision du projet. »* Quand `VoiceProfile` devra s'y
  ajouter : l'inscrire dans la liste blanche, **ne pas relâcher la règle**.
- **`noEngineReferences` sur Core** — ce qui rend le solo tenable.
- **ADR-0003, analyse locale et transmission de features** — charge hôte nulle, bande
  passante négligeable.
- **ADR-0008** — critère éliminatoire, choix Dissonance, écartement des services hébergés,
  vendorisation inerte. Repli Concentus/FishNet réel.
- **Le drapeau `LowRange`.**
- **V3, l'ancrage par `Rest_dB`** — les deux exemples chiffrés ont été recalculés et
  confirmés : 0,9375 et 0,08.
- **Le profil ne traverse jamais le réseau.**
- **L'ordre des trois étapes de calibration.**

---

## L'ordre de retrait des risques

1. **POC audio, une demi-journée, trois questions à la fois** — et la première n'est pas
   celle qu'on croyait : *(a)* quelle cadence la capture brute donne-t-elle réellement sur
   la cible, et est-elle stable ? *(b)* deux consommateurs peuvent-ils lire le
   périphérique ? *(c)* les 698 lignes vendorisées compilent-elles contre Dissonance 9.0.7
   et FishNet 4.7.2R ? **Seul (c) exige les 175 $.**
2. **La propriété de l'AEC**, avant d'écrire le GDD du système 2. Dernier point capable de
   faire pivoter l'architecture.
3. **Le prototype de physique partagée sous 50–100 ms** — hors chaîne vocale, mais prime sur
   tout : risque n°1 du projet, huit systèmes en dépendent.
4. La session de mesure des 24 valeurs, dans l'ordre du §F.
5. OQ-8, même pièce — une soirée, verrouille les GDD 3 et 12.

> **Ce qui peut tuer le projet** : ni le défaut #12, ni l'écart de version Dissonance, ni le
> partage du périphérique — tous ont une issue documentée. **Les deux vrais tueurs sont la
> disponibilité d'un signal brut à cadence connue sur la cible, et l'AEC.**

---

## Ce que personne n'avait vu

### Il manque une étape à la chaîne des dix — **vérifié**

L'étape 5 lisse `Rms` **linéaire** ; la formule 1 consomme `Rms_dB`. **Aucune des dix étapes
ne convertit en décibels**, et `grep` confirme qu'aucune conversion n'existe dans
`Voice.Core`.

La conséquence n'est pas triviale : les constantes d'enveloppe (10–20 ms / 120–200 ms) et le
facteur `LowRange ×1,5` sont définis dans le domaine **linéaire**, alors que tout le
raisonnement de réglage — `Floor_dB`, `Scream_dB`, « 2 dB font doubler `Loudness` » — est en
**dB**. Une décroissance exponentielle en amplitude est une **rampe droite en dB**, pas une
exponentielle.

**AC-14 ne dit pas dans quel domaine se mesure le temps de montée : selon la réponse, il
passe ou il échoue.** À trancher en une phrase, avant d'écrire le `VoiceAnalyzer`.

### `VoiceFrame` n'a aucun canal pour `Degraded` — **vérifié**

Le GDD consacre une sous-section entière à « `Degraded` est muet, et c'est un défaut
d'attribution », exige un affichage distinct d'un sonomètre à zéro, et **écarte
explicitement** un drapeau de confiance pour ne pas élargir la surface publique.

Résultat : les systèmes 12 et 19 doivent lire l'état de l'analyseur par **un second canal
que personne n'a spécifié**. Aujourd'hui, l'information n'a pas de chemin.

**Troisième orphelin de la même classe** — après la persistance du profil et le tutoriel.

### La critique demandée : oui, la chaîne est sur-conçue

2 755 lignes de GDD, 6 ADR, ~1 000 lignes de code, 41 tests, 24 constantes provisoires —
**pour une mécanique dont personne n'a jamais senti l'effet**. Aucun être humain n'a éprouvé
un meuble s'alourdir parce qu'il criait. Le système 11, effet voix → objets, n'a pas de GDD,
et l'index signale lui-même que sa question la plus structurante — *la voix d'un non-porteur
agit-elle sur l'objet porté ?* — n'est pas tranchée.

> **Le problème n'est pas le volume.** La rigueur de ces documents est réelle et a déjà évité
> plusieurs défauts silencieux. **Le problème est que les valeurs qui gouvernent le ressenti
> ne sont pas réglables sans la boucle qu'elles alimentent.** `γ`, l'attaque, le relâchement,
> `LowRange ×1,5` : les quatre se règlent « à l'oreille », et il n'y a rien à écouter. Les
> protocoles A et B mesurent des grandeurs physiques et de l'effort ressenti — **ni l'un ni
> l'autre ne dit si le jeu est bon.**

*Recommandation la plus forte de la revue* : avant le GDD du système 2 et avant celui du
système 11, un jetable dans `prototypes/` — un micro, un cube, un poids, seuils en dB codés
en dur, **ni calibration, ni réseau, ni normalisation**. Une journée. C'est la seule chose
capable d'invalider 2 755 lignes, et la seule qui puisse fermer OQ-11 et la question du
non-porteur pour de bon.

*« Ce n'est pas ma décision, c'est la vôtre — vous savez mieux que moi si ce corpus vous sert
de méthode de pensée ou de spécification. Mais si vous choisissez de continuer à documenter
d'abord, faites-le les yeux ouverts : les six premiers points se corrigent en une journée
cumulée, le septième ne se corrige pas du tout par de la documentation. »*
