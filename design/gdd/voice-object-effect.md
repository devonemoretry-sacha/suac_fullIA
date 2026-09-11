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

Les règles vivent en *Detailed Rules* ; cette section les rassemble sous leur forme
opposable, avec les variables, les exemples chiffrés et la liste des valeurs à mesurer.

**Une seule valeur de ce document est mesurée** — l'avertissement à 350 ms. Toutes les
autres sont **PROVISOIRES** et relèvent de la porte de mesure du système 1 : rien ailleurs
ne doit les citer comme acquises.

### 1. Les grandeurs personnelles

La calibration sait où se situe la voix de chaque joueur. C'est cette information qu'on
exploite, et c'est tout l'intérêt du système 6.

```
L_repos,i = ((Rest_dB,i − Floor_dB,i) / (Scream_dB,i − Floor_dB,i)) ^ γ
Seuil,i   = T_objet × L_repos,i
```

| Variable | Type | Plage | Description |
|---|---|---|---|
| `L_repos,i` | float | 0 … 1 | Le `Loudness` que produit la **voix posée** du joueur `i`. Dérivé de son profil, jamais mesuré en jeu |
| `T_objet` | float | **0,4 … 0,9** | Tolérance de l'objet, **en fractions de voix posée**. Propriété de l'objet, curseur de variété du système 13 |
| `Seuil,i` | float | 0 … 1 | Le `Loudness` à partir duquel la voix de `i` fait basculer **cet** objet en régime alarme |

> **`T_objet < 1` pour tout le MVP.** La conversation posée est déjà une alarme ; seul le
> chuchotement est sûr. Une valeur au-dessus de 1 ferait un objet qui tolère la
> conversation — exception délibérée, jamais le cas général.

### 2. Le régime, et la combinaison des voix

```
Régime = ALARME   s'il existe i tel que  L_i ≥ Seuil,i
       = MURMURE  sinon
```

**`L_i` est déjà atténué par la distance** *(PROVISOIRE — dépend du système 3)*.

```
MURMURE :  L_mur  = min(1, Σ L_i)

ALARME  :  N_z     = #{ i : Loudness_i ≥ T_zizanie }    ← NON atténué, voir ci-dessous
           Zizanie = 1 + z · (N_z − 2)   si N_z ≥ 3,  sinon  1
           L_eff   = min(1, max(L_i) × Zizanie)
```

> **La zizanie se compte sur le `Loudness` brut du joueur, pas sur sa contribution atténuée.**
> C'est la conséquence directe d'en avoir fait un **état du groupe** : si on comptait les
> voix telles qu'elles parviennent à l'objet, la zizanie deviendrait une propriété du meuble
> — trois hurleurs seraient « en zizanie » près du canapé et « calmes » près de l'armoire,
> ce qui n'a aucun sens et rendrait le comptage au score inintelligible.
>
> Elle décrit combien de joueurs braillent, pas combien de bruit arrive quelque part.

| Variable | Type | Provisoire | Description |
|---|---|---|---|
| `T_zizanie` | float | **0,75** | En `Loudness` direct — le cri est déjà l'ancre de la calibration, `Loudness = 1` **est** le cri de référence |
| `z` | float | **0,10** | Pas du multiplicateur par voix au-delà de deux |
| `N_z ≥ 3` | — | **décision** | Pas un curseur. À deux, on ne fait pas une zizanie |

### 3. La charge

```
MURMURE :  si charge < Plafond_murmure :
               charge = min(charge + L_mur · dt / (Remplissage × Lenteur), Plafond_murmure)
           sinon : inchangée                           ← ne redescend jamais ici

ALARME  :  charge += L_eff · dt / Remplissage

SILENCE :  charge −= dt / Vidange                      ← aucune voix n'atteint l'objet

           charge  = clamp(charge, 0, 1)
```

> **Corrigé le 2026-09-09.** La première écriture appliquait `charge = min(charge, Plafond)`
> après la montée — ce qui aurait **rabattu** à 0,30 une charge de 0,60 héritée d'un cri, dès
> que quelqu'un se remettait à chuchoter. Le murmure serait alors devenu une **stratégie de
> récupération plus rapide que le silence**, exactement l'inverse de la règle voulue. Le
> plafond ne borne que la **montée**, jamais la charge elle-même.

| Variable | Provisoire | Description |
|---|---|---|
| `Remplissage` | **1,5 s** | Durée jusqu'à charge pleine, **à pleine voix**. Plage aimée : 1,0 à 1,5 s |
| `Vidange` | **1,5 s** | Retour au transportable. Ne dépend pas du niveau précédent |
| `Lenteur` | **10** | Facteur de ralentissement du régime murmure |
| `Plafond_murmure` | **0,25 … 0,30** | Voir la contrainte ci-dessous |

> **`Plafond_murmure` doit rester juste au-dessus du seuil d'avertissement.** Ce n'est pas
> une valeur libre : le murmure doit faire entrer dans la **zone d'amorçage** — l'objet
> frémit, le joueur est très légèrement ralenti — et **jamais au-delà**. Le calage est donc
> `Plafond_murmure ≳ Avertissement / Remplissage`, soit ≈ 0,25 à 0,30 pour la configuration
> de référence.

### 4. De la charge au poids

Reprise directe du modèle éprouvé au banc d'essai.

```
seuil_av  = Avertissement / Remplissage
amorçage  = Amorçage · min(charge / seuil_av, 1)
principal = max(0, (charge − seuil_av) / (1 − seuil_av))
lourdeur  = min(1, amorçage + principal · (1 − Amorçage))
```

| Variable | Valeur | Description |
|---|---|---|
| `Avertissement` | **350 ms** — *mesuré, 2026-09-08* | L'objet « s'excite ». Optimum, pas frontière : falaise entre 400 et 430 ms |
| `Amorçage` | **15 %** *(PROVISOIRE)* | Ralentissement imperceptible dès la première trame — il fait partie de l'avertissement |

> **⚠️ Les 350 ms valent à pleine voix, et seulement là.** La charge monte à `L_eff / Remplissage` :
> l'avertissement arrive donc à `Avertissement / L_eff`. À `L_eff = 0,9` il tombe à **389 ms**,
> à `L_eff = 0,5` à **700 ms**.
>
> Ce n'est pas un défaut, c'est une propriété souhaitable : **une petite transgression laisse
> plus de temps qu'un cri.** Mais personne ne doit lire « 350 ms » comme une constante — c'est
> un **plancher**, atteint au maximum de la voix.

### 5. Exemples chiffrés

Configuration de référence — la meilleure connue : `Remplissage = 1,5 s` · `Avertissement = 350 ms`
· `Amorçage = 15 %` · `T_objet = 0,7` · `T_zizanie = 0,75` · `z = 0,10` · joueurs à
`L_repos = 0,5`, donc **`Seuil = 0,35`**.

| Situation | Régime | `L_eff` | Charge pleine en | Zizanie |
|---|---|---|---|---|
| Un joueur à 0,9, trois muets | alarme | 0,90 | **1,67 s** | non |
| Deux joueurs à 0,8 | alarme | 0,80 | **1,88 s** | non |
| **Quatre joueurs à 0,5** | alarme | 0,50 | **3,00 s** | non |
| Un à 0,9 et trois à 0,4 | alarme | 0,90 | 1,67 s | non |
| Trois joueurs à 0,8 | alarme | 0,88 | 1,70 s | **×1,10** |
| Quatre joueurs à 0,8 | alarme | 0,96 | 1,56 s | **×1,20** |
| Quatre chuchotements à 0,2 | murmure | 0,80 | *plafonne à 0,30* | non |

**La ligne qui justifie tout le modèle** : quatre joueurs modérés mettent **3,00 s**, deux
joueurs bruyants **1,88 s**. Un rapport de **1,6×** — l'intensité individuelle reste le
signal, le nombre de joueurs n'en est pas un. *(La somme saturante écartée donnait 1,28 s
contre 1,25 s : indiscernables.)*

**Le régime murmure** : quatre chuchoteurs très proches atteignent le plafond en **≈ 5,6 s**,
et la lourdeur s'y stabilise autour de **0,22**. L'objet frémit, il ne s'alourdit pas — et
il n'ira jamais plus loin tant que personne n'élève la voix.

**Aucune voix n'est invisible** : dans la ligne « un à 0,9 et trois à 0,4 », les trois
n'ajoutent rien *pendant que* le premier crie. Mais qu'il se taise, et le maximum devient
0,4 — au-dessus du seuil de 0,35. **La charge continue de monter**, simplement plus
lentement.

### Récapitulatif des valeurs

Une mesurée, huit provisoires. Elles s'ajoutent aux vingt-quatre des systèmes 1 et 6.

| Valeur | État | Se règle par |
|---|---|---|
| `Avertissement` = 350 ms | **mesuré** | Banc d'essai, 2026-09-08 |
| `Remplissage` = 1,5 s | provisoire | Banc — plage aimée 1,0 à 1,5 s, jamais resserrée |
| `Vidange` = 1,5 s | provisoire | Jamais isolée au banc |
| `Amorçage` = 15 % | provisoire | Jamais isolé au banc |
| `T_objet` ∈ [0,4 ; 0,9] | provisoire | **Par objet** — playtest, et c'est la variété du système 13 |
| `Lenteur` = 10 | provisoire | Playtest : « on voit l'objet frémir » sans qu'il s'alourdisse |
| `Plafond_murmure` ≈ 0,25–0,30 | provisoire | **Contraint** par `Avertissement / Remplissage` |
| `T_zizanie` = 0,75 | provisoire | Playtest à 3+ joueurs — n'a jamais été éprouvé |
| `z` = 0,10 | provisoire | Playtest — au-delà de 0,15 l'écart 4-modérés / 2-bruyants s'érode |

> **Sept de ces neuf valeurs n'ont jamais été éprouvées à plusieurs joueurs.** Le banc
> d'essai était monojoueur. Tout ce qui touche à la combinaison — `T_zizanie`, `z`, le
> régime murmure entier — est du raisonnement, pas de la mesure.

## Edge Cases

Chaque entrée nomme la **condition exacte**, la **résolution exacte**, et sa sévérité :
**bloquant** (le système produit un comportement faux sans le signaler), **dégradant**
(comportement médiocre mais honnête) ou **cosmétique**.

### La bascule de régime

- **Si une voix oscille autour du seuil d'un objet** : le régime alterne entre murmure et
  alarme à chaque trame. **Cosmétique** — la charge intègre sur 1,5 s et `Loudness` est déjà
  lissé par l'enveloppe du système 1. Aucune hystérésis, aucun paramètre.

- **Si un même joueur franchit le seuil d'un objet et pas d'un autre** : c'est **le
  comportement voulu**. Le régime est **par objet**, pas global — la même voix peut mettre un
  vase en alarme et laisser une armoire en murmure. C'est précisément ce que `T_objet` sert
  à produire.

- **Si la charge dépasse le plafond de murmure puis que tout le monde chuchote** : la charge
  **reste où elle est**. Elle ne redescend pas. **Bloquant si mal écrit** — voir la
  correction du 2026-09-09 en *Formulas* : rabattre la charge au plafond ferait du murmure
  une récupération plus rapide que le silence, et détruirait la règle « pour récupérer, il
  faut se taire ».

### Les seuils personnels

- **Si un joueur n'a pas de profil valide** — `Uncalibrated` ou `Degraded` : sa `VoiceFrame`
  est `Silence`, donc `L_i = 0`. **Il n'affecte plus aucun objet.** Correct par
  construction : on ne peut pas situer une voix qu'on ne sait pas mesurer.

  > **Exploit théorique, et pourquoi il s'annule.** Débrancher son micro rendrait
  > acoustiquement inoffensif tout en permettant de coordonner par un canal externe. Mais le
  > joueur perd aussi le chat vocal, et surtout **il ne peut plus rien faire de ce qui exige
  > d'émettre** — les objets à demande sonore du système 13 lui deviennent inaccessibles.
  > **Dégradant, auto-limitant, accepté.**

- **Si `Rest_dB` a été mal mesuré** : `L_repos` est faux, donc `Seuil` est faux. Trop bas, le
  joueur déclenche l'alarme en respirant ; trop haut, il crie sans conséquence.
  **Bloquant, et c'est le coût assumé du modèle** : sous une somme, une calibration douteuse
  se diluait ; sous un maximum, elle domine. La justesse du système 6 devient porteuse.

- **Si `L_repos` valait 0**, le seuil s'effondrerait et tout deviendrait alarme.
  **Impossible, et c'est le système 6 qui l'interdit** : sa validation V1 garantit
  `Floor < Rest`, et V3 impose `r ≥ RestMin` — soit `L_repos ≥ 0,15^γ ≈ 0,29`, donc
  `Seuil ≥ 0,20` avec `T_objet = 0,7`. **Le troisième point de la calibration protège notre
  seuil**, en plus de valider le profil.

### La zizanie

- **Si exactement trois joueurs franchissent `T_zizanie`** : zizanie ×1,10. C'est le seuil
  d'entrée, et il est **volontairement le minimum** — à deux, on ne fait pas une zizanie.

- **Si la partie compte deux joueurs** : la zizanie **ne se déclenche jamais**. **Ce n'est
  pas un défaut**, c'est la conséquence assumée d'en faire un phénomène de foule. Le système
  de base fonctionne à n'importe quel effectif.

- **Si le compte oscille autour de trois voix** : le multiplicateur clignote entre 1,00 et
  1,10. **Cosmétique** pour la charge, qui intègre. **Mais pas pour le comptage au score** —
  d'où la durée minimale d'une seconde, sans laquelle l'écran de fin afficherait
  « zizanie ×47 » pour des franchissements fugaces.

- **Si un joueur se déconnecte en pleine zizanie** : `N_z` retombe, l'épisode se termine
  normalement. **Cosmétique.**

### Le portage

- **Si l'objet est posé alors qu'il est chargé** : il **décharge à la vitesse normale**, et
  n'accumule plus rien quelles que soient les voix. Poser devient donc une **tactique de
  récupération** — « on le pose et on se tait » contre « on pousse et on assume ». C'est un
  choix de conception, pas une conséquence subie.

- **Si un porteur lâche et que les autres continuent** : la charge est **inchangée**. Elle
  appartient à l'objet, pas aux porteurs — c'est toute la règle.

- **Si tous les porteurs lâchent en pleine charge** : ce qui advient de l'objet lâché
  appartient au **système 9**. Nous n'en disons rien. *(Voir aussi la recalibration en cours
  de partie, système 6 : elle emprunte exactement ce chemin.)*

### Le conflit avec l'objet à demande sonore

> **Le contrepoids du Pilier 1 entre en collision frontale avec ce système, et il faut le
> dire.**

Le système 13 doit porter au moins un objet qui **n'avance que sous émission active**. Or
notre système **punit l'émission**. Un tel objet serait donc simultanément exigeant en son
et alourdi par le son — potentiellement injouable, ou au mieux incohérent.

**La résolution appartient au système 13**, et trois voies existent :

| Voie | Ce qu'elle donne |
|---|---|
| `T_objet` **très haut** — au-delà de 1, l'exception délibérée évoquée en *Formulas* | L'objet tolère la parole ; seul le cri le charge. Simple, et cohérent avec le reste |
| **Exemption totale** de la charge pour ce type | Le plus simple, mais l'objet sort du système et cesse d'obéir à ses règles |
| **Inversion** — la charge le fait *avancer* au lieu de l'alourdir | Le plus intéressant, et le plus coûteux à spécifier |

**Nous n'en tranchons aucune** : ce document ne possède pas ces objets. Il pose seulement
que **le conflit existe et qu'il n'est pas soluble sans décision explicite**.

### Numérique et réseau

- **Si la charge vaut exactement le seuil d'avertissement** : la lourdeur y est continue —
  `amorçage` atteint `Amorçage` et `principal` vaut zéro. **Aucune discontinuité.**

- **Si `Scream_dB = Floor_dB`** : `L_repos` diviserait par zéro. **Impossible** — la
  validation V2 du système 6 refuse ces profils au commit, avec un plancher dur d'écart
  dynamique. Nous en dépendons explicitement.

- **Si la charge prédite localement diverge de celle de l'hôte** : c'est **attendu et
  admis**. ADR-0002 : la prédiction locale ne porte que l'**avertissement** ; le poids réel
  vient de l'hôte. Un écart sur l'avertissement est le prix de son immédiateté.

- **Si un client ment sur ses `VoiceFrame`** : il peut se rendre acoustiquement invisible.
  **Accepté par ADR-0003** — « en coop entre amis sur invitation Steam, la triche n'est pas
  un modèle de menace ». Rappelé ici parce que le maximum y est **plus sensible qu'une
  somme** : un tricheur ne se dilue pas, il disparaît.

## Dependencies

Même distinction que dans les deux GDD précédents : une **dépendance de conception** empêche
de *spécifier* tant que l'autre ne l'est pas ; une **dépendance d'exécution** empêche de
*fonctionner* une fois en marche.

**Contrairement aux systèmes 1 et 6, celui-ci a deux dépendances de conception non
satisfaites.** C'est ce qui explique les mentions `PROVISOIRE` du document, et pourquoi
certaines sections nomment un trou plutôt que de le combler.

### Le tableau

| Système | Nature | Sens | Interface |
|---|---|---|---|
| **9. Portage** | **DURE — conception, NON satisfaite** | mutuelle | Nous consommons « qui porte quoi » ; il consomme notre `lourdeur`. **Sans lui, « lourd » n'a pas de définition** |
| **3. Propagation** | **DURE — conception, NON satisfaite** | il nous fournit | `L_i` atténué à la position de l'objet. **Sans lui, aucune dimension spatiale** |
| **6. Calibration** | **DURE — exécution** | il nous fournit | `L_repos,i`, d'où dérivent tous nos seuils. *Absent de l'index — voir ci-dessous* |
| **1. Analyse vocale** | **DURE — exécution** | il nous fournit | `Loudness` par joueur, via `VoiceFrame` |
| 5. Réseau | exécution | mutuelle | Achemine les `VoiceFrame` ; l'hôte fait autorité sur la charge (ADR-0002) |
| 12. Retour local | consommateur | il lit | La charge prédite, pour l'**avertissement seul** |
| 13. Mobilier réactif | consommateur | il fournit | Les valeurs de `T_objet` par type. *Faux cycle — voir ci-dessous* |
| 16 / 18. Contrat, résolution | consommateur | ils lisent | Les **épisodes de zizanie**. *Absent de l'index* |
| 14. Chat vocal | **structurant, sans donnée** | — | **Le canal d'attribution.** Sans lui, la charge est anonyme et le Pilier 2 ne produit rien |

### Deux dépendances que l'index ne mentionne pas

L'index déclare que le système 11 dépend de **3 et 9**. Il en manque deux, et elles sont
apparues en écrivant ce document.

**Le système 6.** Les seuils sont désormais **personnels** — `Seuil,i = T_objet × L_repos,i`.
Sans profil de calibration, ce système n'a plus de seuil du tout. C'est une dépendance dure,
d'exécution *et* de conception : on ne pouvait pas concevoir « un seuil en fractions de voix
posée » sans savoir que quelqu'un mesure la voix posée. **Elle est satisfaite** — le
système 6 est `Designed`.

**Les systèmes 16 et 18.** La zizanie produit des **épisodes comptés**, destinés à la
résolution de fin de contrat. L'index fait dépendre 18 du seul système 16. Il y a donc une
arête manquante, et elle est signalée dans l'index.

### Le faux cycle 11 ↔ 13

L'index fait dépendre 13 de 11, et ce document réclame `T_objet` au système 13. Cela
ressemble à un cycle et n'en est pas un.

**Nous définissons ce que `T_objet` signifie et comment il agit ; le système 13 en fournit
les valeurs.** Ce document se spécifie entièrement avec `T_objet` comme variable — c'est
exactement le rapport qu'entretiennent le système 1 et le `VoiceProfile`. Une dépendance de
paramètre n'est pas une dépendance de conception.

---

### Ce que les GDD voisins devront porter

Cohérence bidirectionnelle exigée par les règles du projet. Aucun de ces systèmes n'a de GDD.

**Système 3 — Propagation du son**

> **⚠️ L'exigence la plus structurante de ce document, et elle précède la question des bandes.**
>
> La propagation doit livrer **une valeur par source**, pas un agrégat. « Quel bruit
> perçoit-on ici » ne suffit pas : il nous faut **« quel bruit chaque joueur fait-il ici »**.
>
> Sans identité de source, `max(L_i)` est incalculable, et **tout le modèle s'effondre** —
> plus de coupable, plus d'attribution, retour au chaos anonyme que la *Player Fantasy*
> interdit. L'index posait la question « scalaire ou énergies par bande » ; **la question
> antérieure est « agrégé ou par source »**, et sa réponse n'est pas négociable.

- Être une **requête pure** — le bruit d'un joueur au point P — jamais un `SoundManager` à
  inscription d'auditeurs. *(Contrainte déjà posée par la revue directeurs.)*
- La question **scalaire ou bandes** reste ouverte, mais elle ne nous concerne pas : nous ne
  consommons que `Loudness`. Elle décide en revanche si le système 13 pourra un jour lire
  `Pitch` et `Continuity`.

**Système 9 — Portage d'objets**
- Nous dire **quels objets sont portés et par qui**.
- Consommer une `lourdeur ∈ [0,1]` et décider ce qu'elle veut dire — vitesse, inertie, chute.
  **Nous ne le décidons pas**, nous fournissons un scalaire.
- Trancher si `lourdeur = 1` rend le transport **impossible ou seulement pénible**.
- Gérer le cas « tous les porteurs lâchent en pleine charge ».
- **Prévoir qu'un porteur puisse lâcher en cours de transport** — chemin déjà réclamé par le
  système 6 pour la recalibration en jeu.

**Système 6 — Calibration vocale**
- Exposer **`L_repos` précalculé** sur le `VoiceProfile`, et non nous laisser le dériver.

  > **Ce n'est pas du confort.** Recalculer `L_repos` ici dupliquerait la constante `γ`, ce
  > que le critère **AC-43 du système 1 interdit explicitement** — chaque valeur provisoire
  > doit apparaître en un seul endroit. La porte de mesure impose la forme de cette
  > interface.

- Savoir que `Rest_dB` est devenu **un repère de gameplay** : un profil mal mesuré ne produit
  plus seulement un profil douteux, il déplace le seuil de déclenchement du joueur.

**Système 13 — Mobilier réactif**
- Porter les valeurs de `T_objet` par type — **c'est sa variété**, et elle ne lui coûte rien
  de plus que ce qu'il aurait dû inventer.
- **Résoudre le conflit de l'objet à demande sonore**, décrit en *Edge Cases*. Trois voies y
  sont posées, aucune n'est tranchée ici.

**Système 12 — Couche de retour local**
- Prédire **l'avertissement seul**, jamais le poids. ADR-0002.
- Sa prédiction diverge légitimement de l'hôte ; c'est le prix de l'immédiateté.

**Systèmes 16 et 18 — Boucle de contrat, résolution**
- Compter et présenter les **épisodes de zizanie**. Nous produisons l'événement, avec sa
  durée minimale d'une seconde ; nous ne décidons ni de sa pénalité, ni de son affichage.
- **Réserve de périmètre** : `mvp-scope.md` pose « écran succès / échec, pas d'évaluation
  détaillée ». Un score chiffré est hors MVP tel qu'écrit.

**Système 14 — Chat vocal de proximité**
- **Il est le premier canal d'attribution de ce système**, et c'est une raison plus forte que
  celle qu'invoquait le périmètre MVP. Sans voix spatialisée, le joueur subit une charge dont
  il ignore l'origine, et le Pilier 2 ne produit plus que de l'arbitraire.

**Système 19 — UI diégétique, le Sonomètre**
- **Il est le second canal d'attribution**, et sans lui l'exclusion des joueurs malentendants
  redevient totale.
- Il lit `Loudness`, **ce que le joueur émet, jamais ce que cela provoque** — limite posée par
  le GDD canonique § 2.4.5 et reprise par l'index. Il ne doit donc **jamais** refléter la
  charge d'un objet, qui est ce que la voix *provoque*.
- **L'aiguille est analogique et inerte**, ce qui n'est pas qu'un choix esthétique : son
  retard et son tremblement sont ce qui l'empêche de devenir un instrument de précision.
  L'index l'exige déjà — *« imprécis, retardé, jamais de seuil affiché »*.
- **On lit celui des autres, jamais le sien.** Ce document en dépend pour l'attribution
  croisée, pas pour le retour sur soi.

## Tuning Knobs

### L'arbitrage à exposer avant tous les autres

> **Punir la coopération sans décourager de coopérer.**

Si parler coûte trop cher, les joueurs se taisent : on obtient un jeu coopératif silencieux,
qui échoue au Pilier 1 **et** vide l'expérience sociale de sa substance. Si parler ne coûte
presque rien, le Pilier 2 devient décoratif et la friction disparaît.

**La pente dangereuse est l'adoucissement, et pour une raison contre-intuitive** : adoucir ce
système rend **le silence plus rentable**, donc aggrave exactement le défaut qu'on croyait
corriger. C'est le piège symétrique de celui du système 1 — là-bas, trop lisser rendait la
mesure molle ; ici, trop adoucir rend le mutisme optimal. Les deux erreurs se ressemblent et
n'ont pas le même remède.

### Les curseurs

| Curseur | Provisoire | Plage sûre | Trop haut | Trop bas |
|---|---|---|---|---|
| `Avertissement` | **350 ms** *(mesuré)* | 200 – 400 ms | **falaise à 430 ms** : le signal se décroche de sa cause, le joueur ne fait plus le lien | sous 200 ms, il se déclenche sur tout — y compris les mots qu'on allait cesser — et cesse d'informer |
| `Remplissage` | **1,5 s** | 1,0 – 1,5 s | la faute met trop longtemps à se payer, l'attribution s'étiole | la sanction arrive avant qu'on ait pu réagir : l'avertissement devient décoratif |
| `Vidange` | **1,5 s** | 1,0 – 2,0 s | une erreur pèse trop longtemps, la partie devient une punition continue | le bruit n'a plus de conséquence durable, on peut crier en boucle |
| `Amorçage` | **15 %** | 10 – 20 % | le ralentissement cesse d'être imperceptible : il devient une sanction *avant* l'avertissement | plus de préavis physique, seul le signal prévient |
| `T_objet` **(par objet)** | **0,4 – 0,9** | < 1 | au-delà de 1, l'objet tolère la conversation et le jeu perd sa tension | respirer déclenche : plus aucune zone sûre, le chuchotement lui-même devient inutile |
| `Lenteur` | **10** | 6 – 15 | le murmure ne fait plus rien : la nuance basse disparaît, tout devient binaire | chuchoter devient coûteux, et « permettre au mieux de chuchoter » tombe |
| `Plafond_murmure` | **0,25 – 0,30** | **contraint** | le murmure amène dans le **poids réel**, ce qu'il ne doit jamais faire | l'objet ne frémit plus, on ne voit rien du tout |
| `T_zizanie` | **0,75** | 0,65 – 0,85 | la zizanie ne se déclenche jamais : le multiplicateur est mort et le score n'a rien à compter | elle devient permanente dès que le groupe parle, et cesse de vouloir dire quoi que ce soit |
| `z` | **0,10** | 0,05 – 0,15 | **au-delà de 0,15 l'écart 4-modérés / 2-bruyants s'érode** : on retombe dans le défaut de la somme saturante | la panique collective ne se sent pas |
| Durée minimale d'épisode | **1 s** | 0,5 – 2 s | des zizanies réelles ne sont pas comptées | l'écran de fin affiche « zizanie ×47 » pour des franchissements fugaces |

### Les interactions — tourner un curseur peut en annuler deux

**`Remplissage` gouverne trois autres réglages, et personne ne le voit.** Le seuil
d'avertissement vaut `Avertissement / Remplissage`, et `Plafond_murmure` se cale juste
au-dessus de ce seuil.

> **Conséquence lourde : changer `Remplissage` invalide la seule mesure du document.** Les
> 350 ms ont été trouvés **à `Remplissage = 1,5 s`**. À 1,0 s, la même valeur absolue
> représente une fraction de charge très différente, et il faudrait remesurer. **Ne pas
> toucher à `Remplissage` sans rouvrir le banc d'essai.**

**`T_objet` contre `Lenteur`.** Ils se disputent l'importance, pas la valeur. Un `T_objet`
bas fait du régime alarme le cas courant, et `Lenteur` ne sert presque plus. Un `T_objet`
haut fait vivre le jeu en régime murmure, et `Lenteur` devient le curseur principal. **Régler
l'un change ce que l'autre gouverne.**

**`T_zizanie` contre `T_objet`.** S'ils se rapprochent, la zizanie se déclenche presque en
même temps que l'alarme et les deux états se confondent — un seul signal pour deux idées.
**Il leur faut une séparation franche** : le seuil d'objet est territoire de la parole, celui
de la zizanie territoire du cri.

**`Vidange` contre le régime murmure, et c'est le piège caché.** Le murmure **ne décharge
pas** : seul le silence total le fait. Le coût réel de `Vidange` dépend donc de **la
fréquence à laquelle le silence total survient**, qui dépend elle-même de `T_objet` et du
comportement du groupe. Dans une équipe bavarde, une `Vidange` même courte peut ne jamais
s'appliquer. **Ce curseur ne se règle pas dans l'abstrait, mais sur une partie réelle.**

**`z` contre la discrimination du modèle.** C'est le seul curseur dont le franchissement
détruit une propriété structurelle, et il est chiffré : à `z = 0,10`, quatre joueurs modérés
et deux bruyants restent séparés d'un facteur **1,36** ; la prime additive écartée le
réduisait à **1,06**. Au-delà de 0,15, on reconstruit le défaut qu'on a passé une journée à
écarter.

### Ce qui n'est pas un curseur

Six choses ressemblent à des réglages et n'en sont pas :

- **`N_z ≥ 3`** — le minimum de voix pour une zizanie est une **décision de conception**. À
  deux, on ne fait pas une zizanie. Le baisser à deux rendrait le phénomène banal ; le monter
  à quatre le rendrait impossible en partie normale.
- **Le `max` du régime alarme.** C'est le modèle, pas un réglage. Le changer, c'est rouvrir la
  décision du 2026-09-09 et son argumentaire chiffré.
- **La somme du régime murmure.** Idem, et pour la raison inverse : elle n'est acceptable
  *que* parce que le régime est lent et plafonné.
- **Le fait que seul le silence décharge.** C'est ce qui rend la panique collective coûteuse
  sans aucun paramètre — les quatre doivent se taire.
- **Le fait que la charge appartienne à l'objet.** C'est le Pilier 2 en structure de données.
- **Le comptage de la zizanie sur le `Loudness` brut**, et non atténué. C'est ce qui en fait
  un état du groupe plutôt qu'une propriété du mobilier.

> **Règle générale de report.** Les dix curseurs ci-dessus portent tous **une valeur
> provisoire, un déclencheur nommé et un propriétaire** — le test que le système 1 impose à
> tout report. Aucun trou avec un paragraphe dessus dans ce document.
>
> **Mais sept d'entre eux n'ont jamais été éprouvés à plusieurs joueurs**, le banc d'essai
> étant monojoueur. Tout ce qui touche à la combinaison relève du raisonnement, pas de la
> mesure — et c'est écrit ainsi partout où ils apparaissent.

## Visual/Audio Requirements

Le système 1 ne produisait ni image ni son ; le système 6 en produisait pour un écran de
réglage. **Celui-ci en produit dans le jeu, en permanence, et c'est par là que le joueur
apprend.**

Comme ailleurs, la section reste au niveau **exigence** — ce qui doit être perçu, jamais à
quoi cela ressemble. La direction visuelle évoluera avec un graphiste.

### L'avertissement doit être sonore avant d'être visuel

C'est l'exigence la plus structurante de la section, et elle vient de la situation :
**le joueur regarde où il va, pas le canapé qu'il porte.** Il traverse un couloir sombre à
reculons, il surveille une porte, il cherche son coéquipier.

> **Un signal visuel sur l'objet arriverait dans un angle mort.** L'avertissement doit être
> perceptible **sans regarder** — donc porté d'abord par le son, et par le mouvement de
> l'objet dans la main, pas par un effet qu'il faut avoir dans son champ de vision.

Le concept l'avait déjà écrit sans en tirer cette conséquence : *« du mobilier vivant et
hypersensible au bruit »*. **Un meuble qui grince quand on parle trop fort satisfait
l'exigence et le genre en même temps.**

- **Latence nulle sur le déclenchement.** L'avertissement se déclenche à 350 ms de charge, et
  ce délai est déjà tout le budget. Rien ne doit s'y ajouter — ni fondu d'entrée, ni montée
  progressive du son avant qu'il soit audible.
- **Distinct du poids.** L'avertissement dit *« ça commence »*, le poids dit *« c'est
  arrivé »*. Deux signaux, deux moments (ADR-0002).
- **Il doit inquiéter, pas informer.** Pilier 3 : le décalage entre panique intérieure et
  contrôle affiché se construit ici. Un bip neutre serait fonctionnel et raterait le jeu.

### Le poids ne se lit pas, il se sent

**Aucune jauge, aucune barre, aucun chiffre.** La lourdeur se perçoit dans la manœuvre —
l'objet répond moins vite, tourne mal, résiste — et **jamais dans un affichage**.

> Une jauge de charge deviendrait immédiatement **un instrument à optimiser** : les joueurs
> la regarderaient au lieu d'écouter, et joueraient contre un nombre plutôt que contre leur
> propre voix. C'est exactement la dérive que l'index interdit au sonomètre du système 19 —
> *« imprécis, retardé, jamais de seuil affiché »* — et elle vaut ici avec plus de force,
> puisque nous produisons la sanction et non la mesure.

**Corollaire pour le système 12** : sa prédiction porte l'avertissement, **jamais un verdict
annoncé**. Afficher « tu vas lâcher dans 0,4 s » violerait ADR-0002 et la contrainte que
l'index adresse au système 19.

### Le frémissement du régime murmure

Quand plusieurs personnes chuchotent tout près, l'objet doit **frémir sans menacer**.

- Perceptible, **mais jamais confondu avec l'avertissement**. Ce sont deux états différents,
  et le joueur doit pouvoir les distinguer sans y réfléchir.
- **Il plafonne.** Le frémissement se stabilise et n'empire plus — c'est le comportement que
  le plafond de murmure garantit, et le rendu doit le montrer : quelque chose qui *s'installe*
  plutôt que quelque chose qui *monte*.

C'est la nuance la plus fine du système, et la plus facile à rater : un rendu binaire —
calme ou alarmé — effacerait tout le régime murmure et rendrait le chuchotement inutile.

### La zizanie doit se sentir avant d'être facturée

**On ne pénalise pas un joueur pour un état qu'il ignorait.** Si l'écran de fin annonce
« zizanie ×3 », les trois moments doivent avoir été perceptibles sur le moment.

- **Un signal d'ambiance, pas un panneau.** La zizanie est un état de la scène : c'est
  l'atmosphère qui bascule, pas une bannière d'interface qui s'allume.
- **Distinct de l'avertissement d'objet.** L'un dit « ce meuble est en train de te punir »,
  l'autre « le groupe est en train de partir en vrille ».
- Le seuil d'entrée reste **invisible** : on sent qu'on y est, on ne voit pas à quelle
  distance on en était.

### L'attribution a deux canaux, et ils sont tous deux diégétiques

> **Corrigé le 2026-09-11.** Une version antérieure affirmait que l'attribution passait
> « intégralement par l'oreille » et refusait tout marqueur visuel. **Le GDD canonique en
> prévoit un depuis le début**, et il est meilleur que ce que j'aurais proposé.

Le joueur doit savoir **qui** charge son canapé. Il l'apprend de deux façons, qui se
complètent :

**Par la voix** — le chat de proximité. Il entend qui panique, et comprend au même instant
que le meuble s'alourdit. C'est le canal immédiat, et c'est celui qui porte la comédie.

**Par le Sonomètre** — le boîtier à aiguille collé sur le torse de chaque personnage
(§ 2.4.5 du GDD canonique). *« Porté par tous, et lisible par tous »*, *« plus lisible de
loin »*. **On lit celui des autres, jamais le sien** : il n'y a rien sur son propre torse
qu'on puisse regarder.

> **Ce n'est pas un marqueur d'interface, et c'est toute la différence.** Le refus posé plus
> haut visait un surlignage d'UI désignant le coupable — un relevé collé par-dessus le monde.
> Le Sonomètre est **un objet porté par un personnage**, qu'on lit en le regardant, comme on
> lirait une expression. Il ne court-circuite pas la scène, il en fait partie.

**Conséquence pour l'accessibilité, et elle est bonne.** L'exclusion nommée plus haut est
**plus étroite qu'annoncée** : un joueur sourd ou malentendant peut voir quelle aiguille part
dans le rouge. Il perd la nuance et l'immédiateté que donne la voix, il ne perd pas
l'attribution.

> **Le Sonomètre appartient au système 19**, pas à celui-ci. Mais il en est le **second canal
> d'attribution**, et ce document en dépend autant que du chat vocal. Contrat reporté en
> *Dependencies*.

**Et il ne renseigne jamais sur soi.** Ce qui apprend à un joueur son propre écart, c'est
**la réaction de l'objet qu'il porte** — donc ce système, et rien d'autre. La connaissance de
soi est proprioceptive ; celle des autres est instrumentée.

### Ce qu'on ne montre jamais

- **La charge**, sous quelque forme chiffrée ou graduée que ce soit.
- **Les seuils** — ni celui de l'objet, ni celui de la zizanie. Le joueur apprend où ils sont
  en jouant, jamais en lisant.
- **Un verdict prédit** — « tu vas lâcher », « plus que 2 secondes ». ADR-0002.
- **Qui est le coupable, par un surlignage d'interface.** La voix et le Sonomètre le disent
  déjà, tous deux depuis le monde. Un troisième canal, posé par-dessus, ne servirait qu'à
  dispenser de regarder et d'écouter.

## UI Requirements

**Ce système n'a presque pas d'interface, et c'est un résultat, pas un oubli.**

Tout ce qu'il produit passe par le monde : un meuble qui grince, qui résiste, une ambiance
qui bascule. La section *Visual/Audio Requirements* a consisté pour l'essentiel à **refuser
des affichages** — jauge de charge, seuils, verdict prédit, marqueur de coupable. Ce qui
reste ici tient en peu de lignes.

### Ce qui vient de nous et n'est pourtant pas de l'UI

| Ce que le joueur perçoit | Où ça vit |
|---|---|
| L'objet s'excite | Son et animation de l'objet — système 13, direction audio |
| L'objet est lourd | La manœuvre elle-même — système 9 |
| Le groupe part en vrille | Ambiance de scène — direction audio |
| Qui est le coupable | **Sa voix**, par le chat de proximité — système 14 |

Aucune de ces quatre lignes n'est un élément d'interface, et c'est délibéré.

### Le seul écran concerné, et il ne nous appartient pas

**La résolution de fin de contrat** affiche les épisodes de zizanie — *« zizanie ×3,
pénalité −300 »*. Nous produisons l'événement avec sa durée minimale ; **le système 18
décide de sa présentation et de son barème**.

> **Réserve de périmètre, déjà signalée** : `mvp-scope.md` pose « écran succès / échec, pas
> d'évaluation détaillée ». Un score chiffré est hors MVP tel qu'écrit. Le système produit
> l'événement dans tous les cas — ne pas l'afficher ne coûte rien et ne ferme aucune porte.

### La question d'accessibilité, à trancher

Les *Visual/Audio Requirements* refusent tout marqueur visuel désignant le coupable, et
nomment le coût : **un joueur sourd ou malentendant subit la sanction sans jamais pouvoir en
identifier la cause.**

C'est plus large que l'exclusion déjà assumée par le système 6 — celle-ci frappait qui ne
peut pas *produire* de voix ; celle-là frappe qui ne peut pas la *percevoir*, et un joueur
malentendant pourrait parfaitement jouer par ailleurs.

> ### ✅ Question close le 2026-09-11 — le Sonomètre y répondait déjà
>
> Cette section proposait une option d'accessibilité affichant le joueur responsable, et
> s'interrogeait sur sa cohérence avec la ligne éditoriale du projet.
>
> **Elle était sans objet.** Le GDD canonique prévoit depuis le début un **Sonomètre à
> aiguille porté sur le torse de chaque personnage**, *« lisible par tous »* et *« plus
> lisible de loin »* (§ 2.4.5). Un joueur malentendant voit quelle aiguille part dans le
> rouge.
>
> **Rien à ajouter, et surtout rien à mettre en option** : la réponse est diégétique,
> permanente, et identique pour tout le monde. Ce qui vaut infiniment mieux qu'une case à
> cocher dans un menu.
>
> L'exclusion demeure — un joueur malentendant perd la nuance et l'immédiateté de la voix —
> mais **elle est bien plus étroite que ce que j'avais écrit**, et elle ne porte plus sur
> l'attribution elle-même.

### Ce qu'aucun écran ne doit jamais montrer

Rappelé ici parce que c'est à l'UI qu'on demandera ces affichages, et qu'ils paraîtront tous
raisonnables au moment où on les demandera :

- **La charge**, sous quelque forme graduée ou chiffrée que ce soit
- **Les seuils** — ni celui de l'objet, ni celui de la zizanie
- **Un verdict prédit** — « tu vas lâcher », « plus que 2 secondes ». ADR-0002, et contrainte
  que l'index adresse déjà au système 19
- **Le coupable**, hors de l'option d'accessibilité ci-dessus

### Outillage — hors jeu, mais nécessaire

Dix curseurs, dont **sept jamais éprouvés à plusieurs joueurs**. Les régler exigera de les
modifier **pendant une partie à quatre**, pas entre deux compilations.

Un panneau de réglage en direct — même rudimentaire, même moche — est donc un **prérequis de
playtest**, pas un confort. Le banc d'essai `prototypes/charge-vocale/` a prouvé la valeur de
cette approche sur une seule variable ; il en faudra l'équivalent en jeu pour les dix.

## Acceptance Criteria

[À écrire]

## Open Questions

[À écrire]
