# Prototype — Charge vocale

**Statut : en cours — premier essai concluant le 2026-09-08.** Les valeurs par défaut n'ont
pas été contredites. Il faut d'autres testeurs avant de figer quoi que ce soit.

## L'hypothèse testée

Toute la conception de la réponse du poids à la voix repose sur une thèse jamais éprouvée :
**qu'un joueur peut sentir que ça monte et avoir le temps de se taire.** Personne n'a jamais
ressenti cette mécanique — c'est le reproche central de la revue technique du 2026-09-08.

Le banc ne teste **que des constantes de temps**, et le temps est le même dans tous les
moteurs. Il cherche à répondre à une phrase, pas à un nombre :

> « J'ai senti que ça montait, j'ai eu le temps de me taire. »

Cible de ressenti et cahier des charges : `design/voice-weight-response.md`.

## Comment le lancer

```bash
node prototypes/charge-vocale/serve.js
```

Puis ouvrir **http://localhost:4321**.

> ### ⚠️ Pourquoi un serveur local et pas un simple fichier
>
> `getUserMedia` exige **deux** conditions : un contexte sécurisé **et** un document de
> premier niveau. `http://localhost` remplit les deux.
>
> Une **iframe d'artefact ne remplit pas la seconde** : le micro doit lui être délégué par
> `allow="microphone"`, ce qu'aucun artefact ne fait. Une première version publiée ainsi a
> échoué exactement pour cette raison — l'autorisation du navigateur ne sert à rien quand
> le blocage est au niveau de la frame. Un `file://` échoue également sur les navigateurs
> récents.
>
> Si la capture échoue malgré tout, la page affiche désormais le nom réel de l'erreur, plus
> l'état des deux conditions.

## Ce qu'il fait

- Capture avec `echoCancellation`, `noiseSuppression` et `autoGainControl` **désactivés** —
  les trois traitements que le GDD interdit sur le trajet d'analyse.
- RMS → dB → enveloppe **dans le domaine dB**, attaque 15 ms / relâchement 150 ms. Ce sont
  les constantes provisoires du système 1, avec la correction de domaine décidée le
  2026-09-08.
- Une **charge** qui se remplit en parlant et se vide en silence ; c'est elle, et non le
  niveau instantané, qui pilote le poids.
- Un **avertissement séparé du verdict** (ADR-0002) : halo ambre pendant que le canapé
  « s'excite », avant que la lourdeur ne se sente.
- Le poids se ressent comme une **inertie au glissement** : plus la charge est haute, plus
  le canapé traîne derrière le curseur.

## Les cinq curseurs

| Curseur | Défaut | Rôle |
|---|---|---|
| Seuil de parole | −45 dB | Remplace la calibration, absente ici. À poser au-dessus du bruit de la pièce |
| Temps de remplissage | 1,50 s | Durée jusqu'au poids maximal, à pleine voix |
| Temps de vidange | 1,50 s | Retour au transportable |
| Délai d'avertissement | 200 ms | Quand le canapé s'excite |
| Ralentissement d'amorçage | 15 % | Le poids bouge déjà, imperceptiblement |

Le relevé **« temps pour réagir » passe en rouge sous 400 ms** : en dessous, l'avertissement
est perçu en même temps que la sanction, donc ce n'est plus un avertissement.

## Le mode « fenêtre verrouillée »

Coché, il **asservit l'avertissement** au remplissage et à l'amorçage pour tenir une fenêtre
visée. On fait alors varier le tempo sans que le temps de réaction bouge — c'est le test qui
départage les deux hypothèses laissées ouvertes par les premiers essais.

En verrouillant, la cible reprend la fenêtre courante : on fige ce qu'on a, puis on bouge
autour.

### La fenêtre a une forme fermée

En cherchant comment asservir un curseur à l'autre, la relation s'est révélée **analytique**
et non empirique :

```
fenêtre = r · (remplissage − avertissement)      r = (0,5 − amorçage) / (1 − amorçage)
```

| Réglage retenu | Calcul | Mesuré |
|---|---|---|
| 1,50 s · 200 ms · 15 % | 0,4118 × 1,30 = **535 ms** | 540 ms |
| 1,20 s · 100 ms · 10 % | 0,4444 × 1,10 = **489 ms** | 490 ms |

L'écart n'était que le pas d'itération de l'ancienne recherche numérique, désormais
remplacée par la formule. **Le verrou est donc exact, pas approché.**

### Une contrainte que la formule fait apparaître

L'avertissement est borné à 0–900 ms, donc pour une fenêtre visée `W` le remplissage doit
tenir dans un **couloir de 900 ms de large** :

```
W/r  ≤  remplissage  ≤  W/r + 0,9
```

À 490 ms de fenêtre et 10 % d'amorçage, cela donne **1,10 s à 2,00 s** — et rien en dehors.
Hors couloir, le banc le dit et nomme le remplissage minimal requis. C'est une contrainte
qu'on n'aurait pas trouvée à la main, et elle borne d'emblée le domaine de réglage utile.

## Ce qu'il ne teste pas

La physique Unity, le portage à deux, le réseau, la normalisation par joueur. Et il ne
tranche pas les deux questions ouvertes du système 11 — la voix d'un non-porteur agit-elle
sur l'objet, et les charges de plusieurs porteurs s'additionnent-elles ?

## Résultats

Les réglages retenus alimenteront le GDD du système 11, qui n'est volontairement pas ouvert
avant ça. Le code ne sera pas migré : il sera réécrit.

| Date | Testeur | Réglages retenus | Mi-poids | **Réagir** | Verdict |
|---|---|---|---|---|---|
| 2026-09-08 | Sacha *(concepteur)* | 1,50 s · 1,50 s · 200 ms · 15 % | 740 ms | **540 ms** | *« J'aime bien ces réglages. Dans l'ensemble ça fonctionne plutôt bien. »* |
| 2026-09-08 | Sacha *(concepteur)* | 1,20 s · 1,00 s · 100 ms · 10 % | 590 ms | **490 ms** | *« Celui-là est top aussi. »* |

*(Colonnes : remplissage · vidange · avertissement · amorçage.)*

> ## ❌ L'hypothèse de la fenêtre est FAUSSE — réfutée le 2026-09-08
>
> La section ci-dessous est conservée telle qu'elle a été écrite, parce qu'elle documente un
> raisonnement plausible que quatre mesures ont démoli. **Ne pas s'y fier** : lire d'abord
> *Ce qui sépare réellement*, plus bas.
>
> Deux points suffisaient à la tuer : un réglage jugé **bon** à 399 ms de fenêtre, un jugé
> **mauvais** à 391 ms. Huit millisecondes d'écart, verdicts opposés.

### ~~La trouvaille : c'est la fenêtre de réaction qui est réglée, pas les curseurs~~

Le second jeu est **plus nerveux sur les quatre axes** — remplissage plus court, vidange
plus rapide, avertissement deux fois plus tôt, amorçage plus discret. Et pourtant :

> **540 ms et 490 ms.** La fenêtre de réaction ne bouge quasiment pas d'un réglage à
> l'autre, alors que tout le reste a changé.

Ce qui rend l'observation solide, c'est que **le testeur ne voyait pas cette grandeur** :
le relevé affichait encore la mauvaise valeur au moment du premier essai, et elle n'est
directement pilotée par aucun curseur. Il a réglé à l'oreille sur trois autres paramètres,
et il a convergé deux fois vers la même demi-seconde **sans la viser**.

**Hypothèse à tester, pas encore un résultat** : ce que le joueur ajuste réellement, c'est
le temps dont il dispose pour se taire — environ **500 ms**. Les constantes individuelles
seraient alors du tempo, réglable au goût, tant que leur *écart* tient cette valeur.

Cela corrobore par un autre chemin le plancher de ~400 ms tiré des temps de réaction
humains : les deux réglages retenus se posent **juste au-dessus**, ce qui est exactement où
l'oreille d'un concepteur devrait atterrir si ce plancher est réel.

> **Prochaine mesure, et elle est cheap** : faire varier remplissage et avertissement pour
> tenir la fenêtre à 500 ms, et vérifier que tous ces réglages sont jugés bons. Puis
> descendre la fenêtre sous 400 ms **en gardant le reste** — si la thèse tient, ça doit
> casser. **Trouver où ça casse vaut mieux que collectionner des réglages qui marchent.**

---

## Ce qui sépare réellement — le délai d'avertissement

Quatre essais supplémentaires le 2026-09-08, dont **deux volontairement mauvais**. C'est le
premier lot à contenir des rejets, et c'est lui qui tranche.

| Remplissage | Avertissement | Amorçage | Fenêtre | Verdict |
|---|---|---|---|---|
| 1,50 s | **200 ms** | 15 % | 535 ms | **bon** |
| 1,20 s | **100 ms** | 10 % | 489 ms | **bon** |
| 1,00 s | **40 ms** | 11 % | 421 ms | **bon** |
| 1,00 s | **30 ms** | 15 % | 399 ms | **bon** |
| 1,50 s | **430 ms** | 15 % | 441 ms | *mauvais* |
| 1,50 s | **550 ms** | 15 % | 391 ms | *mauvais* |

**La fenêtre ne sépare rien.** Bons entre 399 et 535 ms, mauvais à 391 et 441 : les deux
intervalles se chevauchent, et un bon à 421 ms est plus court qu'un mauvais à 441.

**Le délai d'avertissement sépare parfaitement.** Bons de 30 à 200 ms, mauvais à 430 et 550.
Aucun recouvrement, et un fossé de plus de 200 ms entre les deux groupes.

### Pourquoi c'est crédible

Le raisonnement d'origine — « il faut au joueur du temps pour réagir » — supposait qu'il
attende un signal. **Il ne l'attend pas : il est déjà en train de parler.** Ce dont il a
besoin n'est pas du délai, c'est de pouvoir **attribuer** le signal à ce qu'il vient de
faire.

À 30–40 ms, l'avertissement est simultané à la voix : la cause est évidente. À 500 ms, il
arrive plusieurs syllabes plus tard, et rien ne le rattache à un acte particulier. C'est la
promesse d'attribution du système 1 — *« quand un joueur échoue, il doit pouvoir dire de
quoi il est coupable »* — appliquée au temps.

La note de cadrage avait vu le phénomène mais placé la frontière au mauvais endroit : elle
disait « au-delà de ~1 s, le signal se décroche de sa cause ». **Le décrochage arrive bien
plus tôt — entre 200 et 430 ms.**

### ✅ Tranché le 2026-09-08 — c'est le délai **absolu**

L'essai discriminant a été mené, et il élimine la fraction.

| Remplissage | Avertissement | **Fraction** | Fenêtre | Verdict |
|---|---|---|---|---|
| 3,50 s | **430 ms** | **0,123** | 1 264 ms | *pas aimé* |
| 3,50 s | **300 ms** | 0,086 | 1 318 ms | *mieux* |

**La fraction 0,123 est en plein dans la plage des bons** — ils allaient de 0,030 à 0,133.
Si la fraction gouvernait, ce réglage aurait dû plaire. Il n'a pas plu. Le délai absolu, lui,
valait 430 ms, exactement celui d'un point déjà rejeté.

**Et la seconde ligne est la comparaison la plus propre de toute la série** : à remplissage
constant, **une seule variable a bougé** — 430 → 300 ms — et le jugement s'améliore. Aucun
confondant.

> **Ce que cela ferme aussi** : ces deux réglages ont des fenêtres de 1,26 et 1,32 s, bien
> plus larges que tout ce qui a été essayé, et l'un est mauvais. Une fenêtre généreuse ne
> sauve rien. La fenêtre est définitivement hors de cause.

**La frontière se resserre** : bons à 30, 40, 100, 200 et 300 ms ; mauvais à 430 et 550.
Elle se situe donc **entre 300 et 430 ms**.

### Une seconde variable, indépendante

Le testeur n'a « pas trop aimé » 3,50 s même après correction du délai — *« c'est mieux »*,
pas *« c'est bon »*. Or **tous ses verdicts enthousiastes sont à des remplissages de 1,00 à
1,50 s**.

Le remplissage semble donc compter pour lui-même, sur un axe distinct de l'attribution du
signal. Cela n'affaiblit pas la conclusion ci-dessus — celle-ci repose sur une comparaison à
remplissage constant — mais cela signifie qu'**il reste au moins deux paramètres à régler**,
pas un.

> **Prochain essai, court** : à un remplissage aimé (1,50 s), balayer l'avertissement à 300,
> 350 et 400 ms pour situer la bascule. Trois points, et la frontière est nommée.

### ~~La mesure qui reste ambiguë~~ *(close, voir ci-dessus)*

Avec ces six points, on ne peut pas distinguer deux explications, car les deux mauvais
partagent le même remplissage :

- **le délai absolu** (430 ms est tard, point) ;
- **la fraction** `avertissement / remplissage` — bons de 0,030 à 0,133, mauvais à 0,287 et
  0,367. Elle sépare tout aussi parfaitement.

> **L'essai qui trancherait : remplissage 3,50 s · avertissement 430 ms · amorçage 15 %.**
> Même délai absolu qu'un point connu mauvais, mais une fraction de 0,123 — dans la plage
> des bons. S'il est jugé **mauvais**, c'est le délai absolu qui compte. S'il est jugé
> **bon**, c'est la fraction.
>
> La fenêtre y vaudra 1,26 s, très au-delà de tout ce qui a été essayé — mais elle vient
> d'être écartée comme facteur, donc le confondant est acceptable. Les trois grandeurs sont
> liées par `fenêtre = r·(remplissage − avertissement)` : on ne peut en tenir que deux.

### Ce que ce premier essai vaut, et ce qu'il ne vaut pas

**Ce qu'il établit** : la mécanique n'est pas absurde au contact. C'est plus que rien —
c'était précisément l'inconnue que la revue technique reprochait au projet, et il existe
désormais une personne qui a *senti* un meuble s'alourdir parce qu'elle parlait.

**Ce qu'il n'établit pas**, et il faut le dire :

- **Un seul testeur, et c'est le concepteur.** Il sait ce qu'il cherche à ressentir, ce qui
  est exactement le biais que le playtest existe pour écarter.
- **Les valeurs par défaut n'ont pas bougé.** Le résultat est donc « aucune contradiction
  trouvée », pas « optimum localisé ». Un balayage volontaire vers les extrêmes dirait
  beaucoup plus — à quel réglage ça casse est plus informatif que le réglage qui va.
- **Rien n'est mesuré sur un joueur naïf**, ni sur quelqu'un qui découvre la mécanique sans
  savoir qu'il doit se taire.

### Un défaut de l'instrument, corrigé le même jour

Le relevé « fenêtre utile » affichait le **délai d'avertissement** (200 ms) et passait donc
en rouge, puisque la note de cadrage pose que sous 400 ms un avertissement n'est plus
actionnable. **Il mesurait la mauvaise grandeur.**

La fenêtre qui compte est l'écart entre l'apparition du signal et le moment où le poids
devient conséquent — soit ici **540 ms**, le mi-poids arrivant à 740 ms. Confortablement
au-dessus du seuil.

> **Le ressenti du testeur était juste, c'est le compteur qui avait tort.** Renommé « temps
> pour réagir », il calcule désormais `mi-poids − avertissement`.
