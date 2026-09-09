# Effet voix → objets

> **Status**: In Design
> **Author**: Sacha (devonemoretry-sacha) + Claude
> **Last Updated**: 2026-09-09
> **Implements Pillar**: Pilier 1 — « La Voice-Physics récompense le contrôle, pas le silence »
> et Pilier 2 — « La coopération est sous contrainte, jamais confortable ».
> **Contrairement aux systèmes 1 et 6, celui-ci ne prépare pas les piliers : il les réalise.**
> **System**: #11 dans `design/gdd/systems-index.md` · Feature · MVP
> **Périmètre MVP**: entrée #2 de `design/mvp-scope.md` — « la moitié manquante »
> **Mesures**: `prototypes/charge-vocale/` · cible de ressenti dans `design/voice-weight-response.md`

> Titres de sections en anglais (lus par les skills), corps en français.
>
> **Portée** : ce document couvre la traduction d'une `VoiceFrame` en comportement physique
> d'un objet porté. Il ne couvre ni la mesure de la voix (système 1), ni sa normalisation
> (système 6), ni le portage lui-même (système 9), ni la propagation du son (système 3).

## Overview

**C'est ici que la voix agit enfin.** Le système 1 mesure, le système 6 rend la mesure
juste, le système 2 alimente — et rien de tout cela ne fait bouger quoi que ce soit. Ce
document est le point où la chaîne débouche sur du jeu.

Le Pilier 1 le décrit en une phrase, et c'est littéralement l'énoncé de ce système :

> **« La panique entraîne le bruit ; le bruit entraîne le chaos ; le chaos entraîne la
> chute. »**

Concrètement : un objet porté accumule une **charge** tant que des voix se font entendre
autour de lui, et cette charge le rend progressivement plus difficile à manœuvrer. Un
avertissement précède la gêne, pour que le joueur puisse se taire à temps. Au silence, la
charge retombe et l'objet redevient transportable.

### Le seul système qui ait été ressenti

Tous les autres documents de ce projet sont du papier. **Celui-ci s'ouvre sur des mesures.**

Le banc d'essai `prototypes/charge-vocale/` a établi qu'un humain peut sentir la charge
monter et se taire à temps — l'hypothèse centrale, jamais éprouvée jusque-là. Il a aussi
livré une valeur et tué deux explications :

- **L'avertissement se déclenche à 350 ms**, avec une falaise entre 400 et 430 ms. Ce n'est
  pas une frontière mais **un optimum** : plus tôt est moins bon, parce que le signal se
  met alors à répondre à tout et cesse d'informer.
- La « fenêtre de réaction » et la fraction `avertissement/remplissage` ont été **réfutées**
  comme facteurs, chacune par une mesure qui les contredit directement.

Un seul testeur, qui est le concepteur. C'est peu, mais c'est infiniment plus que zéro.

### Le paradoxe qu'il faut assumer, pas résoudre

**Le jeu punit la parole, et la coopération exige de parler.** Porter un canapé à deux
suppose de se coordonner ; se coordonner alourdit le canapé.

Ce n'est pas un défaut à corriger, **c'est le moteur comique du jeu**. Le Pilier 2 le pose
comme intention : *« bien faire sa part ne suffit pas, il faut composer avec les autres »*.
La friction est le produit, pas l'effet secondaire.

### Ce système, seul, rendrait le silence optimal — et c'est interdit

Le Pilier 1 pose un test de conception explicite : *« si un système permettrait de terminer
un contrat en restant silencieux du début à la fin sans coût ni risque, ce pilier dit qu'il
faut le retravailler. »*

**Pris isolément, ce système échoue à ce test.** Il ne fait que punir le bruit ; sa
stratégie optimale est le mutisme. Il est **délibérément déséquilibré**, et son contrepoids
vit ailleurs — dans l'« élément d'obligation sonore » que le système 13 doit porter et que
le système 16 doit garantir dans chaque contrat.

> **À écrire noir sur blanc parce que c'est un piège classique** : on ne rééquilibre pas ce
> système en l'adoucissant. L'adoucir ne fait que rendre le silence *plus* confortable. Le
> contrepoids est une obligation d'émettre, et elle n'est pas de notre ressort.

### Ce que ce document peut spécifier, et ce qu'il ne peut pas

Contrairement au système 1, celui-ci a de **vraies dépendances de conception** — sur le
portage (9) et la propagation (3), dont aucun n'a de GDD.

| Ce qui est spécifiable maintenant | Ce qui attend un voisin |
|---|---|
| Le modèle de charge, ses constantes de temps, l'avertissement | Ce que « lourd » veut dire mécaniquement — enveloppe de portage, nombre de porteurs, points d'ancrage **(9)** |
| La séparation avertissement / verdict, et son autorité (ADR-0002) | Quelles voix atteignent l'objet, et avec quelle atténuation **(3)** |
| Qui contribue à la charge — tranché par le Pilier 2, voir plus bas | Scalaire ou énergies par bande — décision structurante du système 3 |

Les sections concernées porteront la mention **PROVISOIRE — dépend de 3** ou **de 9**.

### La question du non-porteur est déjà tranchée

L'index des systèmes présente comme *« la question la plus structurante »*, à trancher, le
fait de savoir si la voix d'un **non-porteur** affecte un objet porté par autrui.

**Le Pilier 2 y répond déjà, textuellement** : *« les objets lourds se portent à plusieurs,
mais **la voix de chacun affecte tout le groupe** — bien faire sa part ne suffit pas »*. Et
son test de conception le confirme par la négative : *« si un joueur peut réussir un contrat
difficile en ignorant totalement ses coéquipiers, ce pilier dit que le système est mal
calibré »*.

Restreindre l'effet aux porteurs rendrait précisément possible d'ignorer ses coéquipiers.
**Le principe est donc acquis** ; ce qui reste ouvert est la *forme* — atténuation par la
distance, cumul ou maximum, pondération éventuelle des porteurs — et cela dépend du
système 3.

## Player Fantasy

**Les systèmes 1 et 6 garantissaient un fantasme. Celui-ci l'est.**

Le GDD de l'analyse vocale le disait en toutes lettres : *« le fantasme "ma voix agit sur le
monde" appartient à l'effet voix → objets »*. Il arrive ici, et il n'a plus personne à qui
le déléguer.

### Les trois moments que ce système doit produire

**« C'est moi qui ai fait ça. »**
Le joueur parle, sent l'objet se charger, et **fait le lien**. C'est l'attribution que le
système 1 protège depuis le début, et le banc d'essai l'a vérifiée sur un humain :
l'avertissement à 350 ms rend la cause lisible. Sans ce moment, il n'y a pas de compétence
à acquérir, et le Pilier 1 s'effondre.

**« C'est lui qui a fait ça. »**
Un coéquipier panique et crie ; le canapé que *je* porte devient lourd dans mes mains. C'est
le moment du Pilier 2, et **c'est le moteur comique du jeu**. Sans lui, la maîtrise
redevient individuelle et le jeu cesse d'être coopératif.

**« Je tremble, et je chuchote quand même. »**
Le Pilier 3 — la dissonance entre la panique intérieure et le contrôle affiché. Ce système
la produit à condition que le contrôle silencieux soit **possible mais coûteux**. Trivial,
il n'y a pas de dissonance ; impossible, il n'y a que de la frustration.

### L'attribution entre joueurs ne vient pas de nous — et c'est structurant

Le deuxième moment pose une exigence que ce système **ne peut pas satisfaire seul** : pour
que le joueur sache *qui* alourdit son canapé, il faut qu'il **entende qui parle**.

> **Le chat vocal de proximité n'est pas seulement de la communication : c'est le canal
> d'attribution de ce système.**

Sans lui, quatre voix chargent un objet de façon **anonyme**. Le joueur subit un poids qui
monte sans savoir d'où il vient, ne peut ni apprendre ni engueuler personne, et le chaos
cesse d'être drôle pour devenir arbitraire.

C'est un argument que le périmètre MVP ne formulait pas ainsi — il justifiait le chat vocal
par le fait que « les testeurs passeraient sinon par Discord et l'atténuation par la
distance disparaîtrait du test ». **La raison est plus forte que ça** : sans chat vocal
spatialisé, le Pilier 2 ne produit rien d'attribuable.

### Ce que le joueur ne doit jamais ressentir

- **« C'est devenu lourd et je ne sais pas pourquoi. »** Le chaos anonyme n'est pas comique,
  il est arbitraire.
- **« Je n'y peux rien. »** Subir sans recours n'est drôle que si l'on peut **répondre** —
  crier sur le coupable, ce qui empire la situation, est le ressort comique complet.
- **« J'ai été puni pour avoir joué correctement. »** Se coordonner doit coûter, jamais
  paraître injuste. La nuance tient entièrement au fait que le coût soit **visible et
  attribuable**.
- **« Autant se taire. »** C'est l'échec du Pilier 1, et ce système y mène par construction.
  Voir l'*Overview* : le contrepoids n'est pas ici.

### La tension à ne pas résoudre

> **Le jeu doit punir la coopération sans décourager de coopérer.**

Si parler coûte trop cher, les joueurs cessent de parler : on obtient un jeu coopératif
silencieux, qui échoue au Pilier 1 **et** vide l'expérience sociale de sa substance. Si
parler ne coûte presque rien, il n'y a plus de tension et le Pilier 2 devient décoratif.

**La pente dangereuse est l'adoucissement**, comme au système 1 mais pour une autre raison :
là-bas, trop lisser rendait la mesure molle ; ici, trop adoucir rend **le silence encore
plus rentable**. Les deux erreurs se ressemblent et n'ont pas le même remède.

C'est un axe de réglage, pas un problème à supprimer — et c'est celui que le prototype a
commencé à explorer, sans l'épuiser.

### Ce que ce système utilise de la `VoiceFrame` — proposition de périmètre

Le banc d'essai n'a éprouvé que **`Loudness`**. Le Pilier 1 parle pourtant « du volume *et*
du pitch ».

**Proposition** : ce système ne consomme que `Loudness` ; `Pitch` et `Continuity` sont la
matière du **système 13**, le mobilier réactif, dont l'index dit qu'il porte la *sensibilité
par bande de fréquences*.

Le pilier reste satisfait, mais **par 11 et 13 ensemble** et non par 11 seul. L'avantage est
qu'un objet générique garde un comportement simple et lisible, et que la différenciation —
donc la variété — vient des types de meubles.

> **À confirmer** : c'est une décision de découpage, pas une évidence. Elle est marquée ici
> pour être arbitrée avant les *Detailed Rules*, puisqu'elle détermine ce que ce document
> spécifie.

### Portée future

- **Les objets à demande sonore** — qui n'avancent ou ne se stabilisent *que* sous émission
  active. Contrepoids indispensable au Pilier 1, mais ils appartiennent au système 13.
- **La voix agissant sur autre chose que les objets portés** — portes, habitant,
  environnement. Systèmes 13 et 15.
- **L'effet du pitch et de la continuité**, si le découpage ci-dessus est confirmé.

## Detailed Rules

### Périmètre arrêté le 2026-09-09

Ce système ne consomme que **`Loudness`**. `Pitch` et `Continuity` sont la matière du
système 13 — sensibilité par bande de fréquences, et objet à demande sonore, qui réclame
une **note tenue** donc `Continuity`. Le Pilier 1 reste satisfait par **11 et 13 ensemble**.

> **Condition, et elle n'est pas acquise.** Pour que le système 13 puisse un jour lire
> `Pitch` et `Continuity`, il faut que la propagation lui livre des **trames par source,
> atténuées** — et non un scalaire agrégé du type « quel bruit perçoit-on ici ». Un scalaire
> les détruit au passage, quelle que soit la volonté du système 13. Contrat adressé au
> système 3, voir *Dependencies*.

---

### La charge appartient à l'objet, pas au joueur

**Chaque objet porté possède une charge**, un scalaire de 0 à 1. Elle monte tant que des
voix se font entendre autour de lui, elle redescend au silence, et c'est elle — et non le
`Loudness` instantané — qui détermine son comportement.

Ce choix découle du Pilier 2 : *« la voix de chacun affecte tout le groupe »*. Si la charge
appartenait au joueur, chacun porterait sa propre pénalité et la coopération redeviendrait
une somme d'efforts individuels. **Portée par l'objet, elle est subie par tous ses
porteurs à égalité** — y compris celui qui s'est tu.

**Un objet n'accumule que pendant qu'il est porté.** Un meuble posé dans un coin qui
s'alourdirait tout seul ne serait observé par personne. *(Le système 13 peut définir d'autres
règles pour ses types particuliers — un objet à demande sonore a de bonnes raisons de vivre
en dehors de celle-ci.)*

### Qui alimente la charge

**Toutes les voix à portée**, porteurs comme non-porteurs. C'est le Pilier 2, et l'*Overview*
explique pourquoi ce n'était pas une question ouverte.

**`L_i` est la contribution de la voix `i` telle qu'elle parvient à l'objet**, donc déjà
atténuée par la distance. *(PROVISOIRE — dépend du système 3.)* Sans atténuation, un joueur
à l'autre bout de l'appartement chargerait le canapé autant que celui qui le porte, et il
n'y aurait plus de jeu spatial.

---

### Deux régimes, deux règles de combinaison

C'est la structure centrale du système, et elle réconcilie deux règles qui semblaient
s'exclure.

| | **Régime murmure** | **Régime alarme** |
|---|---|---|
| Condition | Toutes les voix sous le seuil de l'objet | **Au moins une** voix au-dessus |
| Combinaison | **Somme** des contributions | **Maximum** — la plus forte pilote |
| Vitesse | Très lente, et **plafonnée** | Pleine |
| Coupable | Aucun — l'effet est collectif par nature | **Un seul, et tout le monde l'a entendu** |

> **Pourquoi la somme n'est pas injuste ici, alors qu'elle l'était là-bas.** L'objection —
> *« quatre chuchotements ne doivent pas valoir un cri »* — vise le régime alarme, où il faut
> un coupable identifiable. Dans le régime murmure, l'effet est **d'un ordre de grandeur plus
> lent** : à facteur de lenteur 10, un chuchoteur seul mettrait une minute à charger l'objet,
> quatre chuchoteurs très proches une quinzaine de secondes — contre **1,3 seconde pour un
> seul cri**. Il n'y a pas de faute à attribuer parce qu'il n'y a pas de faute.

#### Le régime murmure

Plusieurs personnes qui chuchotent tout près d'un meuble doivent le voir **frémir**, jamais
s'alourdir. C'est la contrepartie de « permettre au mieux de chuchoter » : le murmure est
très bon marché, mais **pas gratuit**.

```
L_mur   = min(1, Σ L_i)                       somme sur toutes les voix
charge += L_mur · dt / (Remplissage × Lenteur)
charge  = min(charge, Plafond_murmure)
```

**Le plafond est ce qui rend le chuchotement viable indéfiniment.** Sans lui, murmurer
assez longtemps finirait par tout charger, et traverser un appartement à voix basse
deviendrait impossible — l'inverse de l'intention. Avec lui, l'objet s'excite un peu, se
stabilise là, et n'ira jamais plus loin tant que personne n'élève la voix.

**Le murmure ne fait jamais redescendre la charge.** S'il en reste d'un cri précédent, elle
tient. **Pour récupérer, il faut réellement se taire** — ce qui crée une décision collective
à chaque incident : on se tait deux secondes, ou on continue en assumant ?

#### Le régime alarme

```
L_eff   = min(1, max(L_i) × Zizanie)
charge += L_eff · dt / Remplissage
```

Le maximum pilote. Les voix sous le seuil **ne s'ajoutent pas** : dès qu'il y a un coupable,
c'est lui qu'on entend et c'est lui qui charge.

> **Aucune voix n'est jamais réellement invisible**, contrairement à ce qu'on pourrait croire
> du maximum. Elle n'est masquée qu'à l'instant : **dès que le plus bruyant se tait, c'est le
> suivant qui devient le maximum.** Se cacher derrière quelqu'un ne coûte rien tant qu'il
> crie, et coûte tout dès qu'il s'arrête.

#### Le silence, et lui seul, décharge

```
si aucune voix n'atteint l'objet :   charge −= dt / Vidange
```

**La montée dépend du niveau, la descente non.** Un retour dont la durée dépendrait de la
faute passée serait perçu comme une punition, pas comme une mécanique — c'est ce que le banc
d'essai a mis en œuvre et ce que le testeur a jugé juste.

> **La panique collective est punie par la durée, pas par le débit.** Quatre joueurs qui
> hurlent ne chargent pas quatre fois plus vite — mais **les quatre** doivent se taire pour
> que ça redescende, là où un seul coupable suffit à se calmer. C'est gratuit, aucun
> paramètre ne le porte, et c'est ce qui donne son poids au chaos collectif.

---

### Les seuils sont personnels, et c'est tout l'intérêt de la calibration

Le système 6 mesure, pour chaque joueur, **où se situe sa voix posée** entre son plancher de
bruit et son cri. C'est exactement l'information dont ce système a besoin.

```
L_repos,i = ((Rest_dB,i − Floor_dB,i) / (Scream_dB,i − Floor_dB,i)) ^ γ
Seuil,i   = T_objet × L_repos,i
```

**`T_objet` s'exprime en fractions de la voix posée du joueur.** « Ce vase déclenche à 0,7×
ta voix normale » est une unité qu'un humain comprend, et qui garantit la même exigence pour
tout le monde.

> **La conversation posée est déjà une alarme.** `T_objet < 1` pour tous les objets du MVP —
> plage de travail **0,4 à 0,9**. Seul le chuchotement est sûr. Une valeur au-dessus de 1
> ferait un objet qui tolère la conversation : c'est possible, mais ce serait une exception
> délibérée et non le cas général.

**`T_objet` est le curseur de variété du système 13**, pas un paramètre de plus : un vase
fragile a un seuil bas, une armoire un seuil haut. C'est le réglage que le mobilier réactif
aurait dû inventer de toute façon.

> **Conséquence à reporter au système 6.** Son GDD pose que `Rest_dB` sert à **valider** un
> profil et jamais à normaliser. Cela reste vrai du système 1 — aucune `VoiceFrame` n'en
> dépend, et son critère CAL-22 tient. Mais `Rest_dB` devient ici **un repère de gameplay**,
> ce qui élève son importance : un `Rest_dB` mal mesuré ne produit plus seulement un profil
> douteux, il déplace le seuil de déclenchement du joueur.

### La zizanie

Plusieurs personnes qui **crient ensemble** font basculer la scène dans le chaos. C'est un
**état du groupe**, pas une propriété du mobilier — le canapé se moque de savoir combien de
gens hurlent.

```
N_z      = nombre de voix telles que  L_i ≥ T_zizanie
Zizanie  = 1 + z · (N_z − 2)     si  N_z ≥ 3
         = 1                     sinon
```

Trois voix donnent **×1,10**, quatre **×1,20** *(z PROVISOIRE 0,10)*.

**`T_zizanie` s'exprime directement en `Loudness`, sans passer par la voix posée.** L'unité
diffère de `T_objet` pour une raison : le cri est **déjà l'ancre** de la calibration —
`Loudness = 1` est le cri de référence de chaque joueur. Un seuil à 0,75 signifie donc « aux
trois quarts du chemin vers ton propre cri » et vaut la même exigence pour tous, sans autre
repère. La voix posée, elle, flotte entre 0,15 et 0,70 du registre selon les gens : c'est
pourquoi `T_objet` a besoin de son ancre et pas `T_zizanie`.

**Trois voix minimum, et c'est une décision, pas un curseur.** À deux, on ne fait pas une
zizanie. Conséquence assumée : **une partie à deux joueurs n'en connaît jamais**, et c'est
plutôt heureux pour un party-game — plus on est nombreux, plus ça part en vrille. Le système
de base, lui, fonctionne à n'importe quel effectif.

**Aucune hystérésis sur le multiplicateur** : la charge intègre sur plus d'une seconde, un
franchissement fugace ne produit rien.

#### La zizanie est aussi un épisode compté

Elle **commence** quand la troisième voix franchit `T_zizanie`, **finit** quand il en reste
moins de trois, et **ne compte que si elle a duré plus d'une seconde** *(PROVISOIRE)*.

Ce minimum n'est pas de l'hystérésis déguisée : il donne la sémantique de comptage dont
l'écran de fin de contrat a besoin, et évite d'afficher « zizanie ×47 » pour des
micro-franchissements.

> **Périmètre.** Le scoring de fin de contrat — étoiles, argent, « zizanie ×3, pénalité
> −300 » — est **hors MVP tel qu'écrit** : `mvp-scope.md` pose « écran succès / échec, pas
> d'évaluation détaillée » pour le système 18. Ce document **produit l'événement** ; qui
> l'affiche et le monétise reste à décider avec le périmètre.

### Le point d'extension, exigence de code

La combinaison des voix doit être **un point d'extension explicite**, pas une expression
noyée dans une boucle de mise à jour. La prime de zizanie n'est pas retenue aujourd'hui sous
sa forme additive, et le régime murmure pourrait changer de règle après playtest.

**Ce qui doit rester substituable sans rouvrir la structure** : la fonction qui prend
l'ensemble des `(L_i, joueur)` et rend un `L_eff` unique, régime compris.

### Avertissement et verdict — deux signaux, deux autorités

C'est l'application directe d'ADR-0002 : **« prédire l'avertissement, jamais le verdict »**.

| | **L'avertissement** | **Le verdict** |
|---|---|---|
| Ce que c'est | L'objet « s'excite » — signal perceptible | Le poids réel qui gêne la manœuvre |
| Déclenché à | **350 ms** *(mesuré, 2026-09-08)* | Progressivement ensuite |
| Autorité | **Aucune** — couche de retour local (12) | **Hôte** (ADR-0002) |
| Latence | Immédiate en local | Aller-retour réseau |

**Conséquence sur le réseau, et elle est favorable.** Chaque client reçoit les `VoiceFrame`
de tous les joueurs (ADR-0003) : il peut donc prédire la charge lui-même. **Sa propre
contribution à l'avertissement est instantanée** ; celle des autres arrive avec la latence du
réseau.

> Ce déséquilibre n'est pas un défaut à corriger — **il est juste**. Le joueur est
> immédiatement redevable de sa propre voix, et découvre celle des autres au rythme où il les
> entend. C'est exactement ce que le chat vocal lui donne par ailleurs.

### Comment la charge devient du poids

Reprise du modèle éprouvé au banc d'essai, à ceci près que « poids » y était une inertie de
glissement et devra ici être une grandeur physique. *(PROVISOIRE — dépend du système 9.)*

```
seuil       = Avertissement / Remplissage          fraction de charge à l'avertissement
amorçage    = Amorçage · min(charge / seuil, 1)    imperceptible, mais présent dès le début
principal   = max(0, (charge − seuil) / (1 − seuil))
lourdeur    = min(1, amorçage + principal · (1 − Amorçage))
```

**Le poids bouge dès la première trame**, très légèrement — et ce ralentissement
**fait partie de l'avertissement**, décision de l'utilisateur du 2026-09-08. Le joueur est
freiné avant d'être puni, et il le sent sans pouvoir le nommer.

### Ce que ce document ne peut pas encore fixer

| Question | Bloqué par |
|---|---|
| Ce que « lourdeur = 1 » veut dire mécaniquement — vitesse, inertie, points d'ancrage, chute | **Système 9** — enveloppe de portage |
| L'atténuation de `L_i` par la distance, et sa forme | **Système 3** — propagation |
| La lourdeur rend-elle le transport **impossible** ou seulement pénible ? | **Système 9**, et un arbitrage de gameplay |

Ces trois-là sont nommés plutôt que devinés. Les deviner produirait des règles qui seraient
contredites dès que les GDD voisins s'écriront.

## Formulas

[À écrire]

## Edge Cases

[À écrire]

## Dependencies

[À écrire]

## Tuning Knobs

[À écrire]

## Visual/Audio Requirements

[À écrire]

## UI Requirements

[À écrire]

## Acceptance Criteria

[À écrire]

## Open Questions

[À écrire]
