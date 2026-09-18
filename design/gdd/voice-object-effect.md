# Effet voix → objets

> **Status**: In Design — révisé le 2026-09-16 après la revue du 2026-09-14 (verdict MAJOR
> REVISION NEEDED), selon les décisions du propriétaire du 2026-09-15 ; quatrième document de
> la passe groupée
> **Author**: Sacha (devonemoretry-sacha) + Claude
> **Last Updated**: 2026-09-16
> **Implements Pillar**: Pilier 1 — « La Voice-Physics récompense le contrôle, pas le silence »
> et Pilier 2 — « La coopération est sous contrainte, jamais confortable » ; **contribue** au
> Pilier 3. Contrairement aux systèmes 1 et 6, celui-ci ne prépare pas les piliers : il les
> réalise.
> **System**: #11 dans `design/gdd/systems-index.md` · Feature · MVP
> **Périmètre MVP**: entrée #2 de `design/mvp-scope.md` — « la moitié manquante »
> **Revue**: `design/gdd/reviews/voice-object-effect-2026-09-14.md` ; décisions consolidées dans
> `design/gdd/reviews/voice-analysis-2026-09-14.md` §6
> **Mesures**: `prototypes/charge-vocale/` — sous un autre modèle, voir *Formulas* §6

> Titres de sections en anglais (lus par les skills), corps en français.
>
> **Portée** : ce document couvre la traduction des voix des joueurs en comportement physique
> d'un objet porté. Il ne couvre ni la mesure de la voix (système 1), ni sa normalisation
> (système 6), ni le portage lui-même (système 9), ni la propagation du son (système 3).
>
> **Ce qui fait foi.** *Formulas* et la boucle de mise à jour sont **seules normatives**. La
> prose les explique et y renvoie ; en cas d'écart, la formule l'emporte. Les grandeurs du
> système 1 — `Loudness`, `r'`, `ToPosition`, `Gate_dB` et leur disponibilité — vivent dans
> `voice-analysis.md`, qui est cité et non recopié.

## Overview

**C'est ici que la voix agit enfin.** Le système 1 mesure, le système 6 rend la mesure
juste, le système 2 alimente — et rien de tout cela ne fait bouger quoi que ce soit. Ce
document est le point où la chaîne débouche sur du jeu.

Le Pilier 1 le décrit en une phrase, et c'est littéralement l'énoncé de ce système :

> **« La panique entraîne le bruit ; le bruit entraîne le chaos ; le chaos entraîne la
> chute. »**

Concrètement : un objet porté accumule une **charge** tant que des voix se font entendre
autour de lui, et cette charge le rend progressivement plus difficile à manœuvrer. Un
avertissement précède la gêne, pour que le joueur puisse se taire à temps. **Au silence, et
seulement au silence**, la charge retombe et l'objet redevient transportable.

### Le seul système qui ait été ressenti — sous un autre modèle

Tous les autres documents de ce projet sont du papier. **Celui-ci s'appuie sur un banc
d'essai**, `prototypes/charge-vocale/`, qui a établi qu'un humain peut sentir une charge
monter et se taire à temps — l'hypothèse centrale, jamais éprouvée jusque-là.

**Mais le banc ne faisait pas tourner le modèle de ce document.** Il remplissait la charge
avec un plancher de 35 % au-dessus d'un seuil en décibels réglé à la main, sans calibration,
pour une seule voix, et son avertissement était un **état** allumé dès la première trame
parlée, là où ce document spécifie un **événement**. Les 350 ms qu'il a livrés fixaient
**où le poids réel commence**. La valeur est donc une **valeur provisoire avec un
historique**, pas une mesure du modèle actuel ; la liste de ses écarts est en *Formulas* §6.
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

**Le séquencement, lui, est écrit.** Aucun test à plusieurs humains ne vaut verdict sur le
plaisir sans au moins une tâche qui exige du son — une porte grossière sur une note tenue
suffit : c'est une clause bloquante de `mvp-scope.md` (décision du propriétaire du
2026-09-15). Rien de ce contrepoids ne vit dans ce système.

### Ce que ce document peut spécifier, et ce qu'il ne peut pas

Contrairement au système 1, celui-ci a de **vraies dépendances de conception** — sur le
portage (9) et la propagation (3), dont aucun n'a de GDD.

| Ce qui est spécifiable maintenant | Ce qui attend un voisin |
|---|---|
| Le modèle de charge, la boucle de mise à jour, l'avertissement | Ce que « lourd » veut dire mécaniquement — enveloppe de portage, nombre de porteurs, points d'ancrage **(9)** |
| La séparation avertissement / verdict, et son autorité (ADR-0002) | Quelles voix atteignent l'objet, et avec quelle atténuation **(3)** |
| Les seuils personnels, en positions | Le découpage en pièces **(10)** |
| Qui contribue à la charge — tranché par le Pilier 2, voir plus bas | Scalaire ou énergies par bande — décision structurante du système 3 |

Les sections concernées portent la mention **PROVISOIRE — dépend de 3**, **de 9** ou **de 10**.

### La question du non-porteur est déjà tranchée

L'index des systèmes présentait comme *« la question la plus structurante »* le fait de
savoir si la voix d'un **non-porteur** affecte un objet porté par autrui.

**Le Pilier 2 y répond textuellement** : *« les objets lourds se portent à plusieurs, mais
**la voix de chacun affecte tout le groupe** — bien faire sa part ne suffit pas »*. Et son
test de conception le confirme par la négative : *« si un joueur peut réussir un contrat
difficile en ignorant totalement ses coéquipiers, ce pilier dit que le système est mal
calibré »*.

Restreindre l'effet aux porteurs rendrait précisément possible d'ignorer ses coéquipiers.
**Le principe est donc acquis** ; ce qui reste ouvert est la *forme* de l'atténuation, et
cela dépend du système 3.

## Player Fantasy

**Les systèmes 1 et 6 garantissaient un fantasme. Celui-ci l'est.**

Le GDD de l'analyse vocale le dit : le fantasme « ma voix agit sur le monde » appartient à
l'effet voix → objets. Il arrive ici, et il n'a plus personne à qui le déléguer.

### Les trois moments que ce système doit produire

**« C'est moi qui ai fait ça. »**
Le joueur parle, sent l'objet se charger, et **fait le lien**. C'est l'attribution que le
système 1 protège depuis le début. Elle repose sur un **avertissement perceptible sans
regarder et sans entendre seulement** — son et tremblement de l'objet dans les mains —, qui
précède le poids. Sans ce moment, il n'y a pas de compétence à acquérir, et le Pilier 1
s'effondre.

**« C'est lui qui a fait ça. »**
Un coéquipier panique et crie ; le canapé que *je* porte devient lourd dans mes mains. C'est
le moment du Pilier 2, et **c'est le moteur comique du jeu**. Sans lui, la maîtrise
redevient individuelle et le jeu cesse d'être coopératif. Il n'existe que si la voix du
coéquipier atteint l'hôte, qui calcule la charge, et si le joueur **entend** ou **voit**
qui a parlé.

**« Je tremble, et je chuchote quand même. »**
Le Pilier 3 — la dissonance entre la panique intérieure et le contrôle affiché. Ce système
**y contribue** à condition que le contrôle silencieux soit **possible mais coûteux**.
Trivial, il n'y a pas de dissonance ; impossible, il n'y a que de la frustration. D'où deux
garanties, écrites en *Formulas* : **un chuchotement sous la porte du joueur ne pèse rien**,
et **un son resté sous le seuil de l'objet le fait frémir sans jamais déclencher l'alerte**.

### L'attribution entre joueurs ne vient pas de nous — et c'est structurant

Le deuxième moment pose une exigence que ce système **ne peut pas satisfaire seul** : pour
que le joueur sache *qui* alourdit son canapé, il faut qu'il **entende qui parle**, ou qu'il
le **voie**.

> **Le chat vocal de proximité n'est pas seulement de la communication : c'est le premier
> canal d'attribution de ce système.** Le Sonomètre porté sur le torse des personnages
> (système 19) est le second.

Sans eux, quatre voix chargent un objet de façon **anonyme**. Le joueur subit un poids qui
monte sans savoir d'où il vient, ne peut ni apprendre ni engueuler personne, et le chaos
cesse d'être drôle pour devenir arbitraire.

### Ce que le joueur ne doit jamais ressentir

- **« C'est devenu lourd et je ne sais pas pourquoi. »** Le chaos anonyme n'est pas comique,
  il est arbitraire.
- **« Je n'y peux rien. »** Subir sans recours n'est drôle que si l'on peut **répondre** —
  crier sur le coupable, ce qui empire la situation, est le ressort comique complet.
- **« J'ai été puni pour avoir joué correctement. »** Se coordonner doit coûter, jamais
  paraître injuste. La nuance tient entièrement au fait que le coût soit **visible et
  attribuable**.
- **« J'ai chuchoté et l'alarme a sonné. »** Le chuchotement est le registre que le jeu
  protège ; s'il déclenche l'alerte, le contrôle n'est plus possible.
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

C'est un axe de réglage, pas un problème à supprimer — et c'est celui que le prototype
étendu explore.

### Portée future

- **Les objets à demande sonore** — qui n'avancent ou ne se stabilisent *que* sous émission
  active. Contrepoids indispensable au Pilier 1, mais ils appartiennent au système 13.
- **La voix agissant sur autre chose que les objets portés** — portes, habitant,
  environnement. Systèmes 13 et 15.
- **L'effet du pitch et de la continuité** — système 13.

## Detailed Rules

### Périmètre arrêté le 2026-09-09

Ce système ne consomme que **`Loudness`**. `Pitch` et `Continuity` sont la matière du
système 13 — sensibilité par bande de fréquences, et objet à demande sonore, qui réclame
une **note tenue** donc `Continuity`. Le Pilier 1 est satisfait par **11 et 13 ensemble** :
un objet générique garde un comportement simple et lisible, et la variété vient des types
de meubles.

> **Condition, et elle n'est pas acquise.** Pour que le système 13 puisse un jour lire
> `Pitch` et `Continuity`, il faut que la propagation lui livre des **trames par source,
> atténuées** — et non un scalaire agrégé du type « quel bruit perçoit-on ici ». Un scalaire
> les détruit au passage. Contrat adressé au système 3, voir *Dependencies*.

---

### La charge appartient à l'objet, pas au joueur

**Chaque objet porté possède une charge**, un scalaire de 0 à 1. Elle monte tant que des
voix se font entendre autour de lui, elle redescend au silence, et c'est elle — et non le
`Loudness` instantané — qui détermine son comportement.

Ce choix découle du Pilier 2 : *« la voix de chacun affecte tout le groupe »*. Si la charge
appartenait au joueur, chacun porterait sa propre pénalité et la coopération redeviendrait
une somme d'efforts individuels. **Portée par l'objet, elle est subie par tous ses
porteurs à égalité** — y compris celui qui s'est tu.

**La charge vit sur l'hôte**, qui fait autorité (ADR-0002). Les clients ne la calculent pas ;
ils prédisent seulement l'avertissement de leur propre voix (plus bas).

### Qui alimente la charge

**Toutes les voix à portée**, porteurs comme non-porteurs. C'est le Pilier 2.

**`L_i` est la contribution de la voix `i` telle qu'elle parvient à l'objet**, donc déjà
atténuée par la distance, **avec une coupure dure** : au-delà de la portée, la contribution
vaut **exactement 0**, pas une petite valeur. *(PROVISOIRE — dépend du système 3.)* Sans
atténuation, un joueur à l'autre bout de l'appartement chargerait le canapé autant que celui
qui le porte ; sans coupure dure, le silence de l'objet ne serait jamais atteint.

---

### Qui possède le zéro — trois étages

Le régime `SILENCE` exige que **toutes** les contributions valent exactement 0. Trois
systèmes y concourent, chacun à son étage (arbitrage (b) de la revue) :

| Étage | Question | Propriétaire |
|---|---|---|
| La voix | « Cette personne émet-elle ? » — `Loudness = 0` exactement sous `Gate_dB` | **Système 1** (`voice-analysis.md`, *Formulas* §1) |
| L'espace | « Ce son atteint-il l'objet ? » — coupure dure au-delà de la portée | **Système 3** |
| La règle | « Le silence l'emporte-t-il ? » — priorité de `SILENCE` dans la boucle | **Ce système** |

Une respiration, un clavier, un souffle restent **sous la porte** du joueur, donc à 0 ; c'est
ce qui rend le silence collectif atteignable à quatre micros ouverts. La part des trames
réellement nulles quand un joueur se tait est une mesure du prototype (*Formulas* §7, `p`).

---

### La boucle de mise à jour — trois régimes, un ordre

**À chaque tick fixe de l'hôte, pour chaque objet porté**, dans cet ordre — la version
normative est *Formulas* §3 :

1. **Contributions.** Pour chaque joueur, la dernière trame reçue, si elle n'a pas expiré ;
   sinon 0. Atténuée par le système 3.
2. **Positions et seuils.** Chaque contribution est ramenée en position par `ToPosition`
   (système 1) ; chaque seuil est **relu à chaque tick** depuis le `r'` courant du joueur,
   jamais mis en cache.
3. **Régime**, par priorité :
   - **`SILENCE`** si toutes les contributions valent exactement 0 ;
   - sinon **`ALARME`** si au moins une position atteint le seuil de son joueur ;
   - sinon **`MURMURE`**.
4. **Charge**, selon le régime.
5. **Avertissement**, sur le front montant de la charge au seuil d'avertissement.
6. **Lourdeur**, publiée au système 9.

| | **Silence** | **Murmure** | **Alarme** |
|---|---|---|---|
| Condition | Aucune contribution | Toutes les voix sous le seuil de l'objet | **Au moins une** voix au seuil ou au-dessus |
| Combinaison | — | **Somme** des contributions | **Le plus grand dépassement** — celui qui s'écarte le plus de sa propre voix posée |
| Effet sur la charge | **Elle descend** | Elle monte très lentement, **jusqu'à un plafond sous l'avertissement** ; au-dessus, elle tient | Elle monte à pleine vitesse **jusqu'au plafond de ce niveau de voix**, puis s'y tient |
| Coupable | — | Aucun — l'effet est collectif | **Un seul, et tout le monde l'a entendu** |

> **Pourquoi la somme n'est pas injuste en murmure, alors qu'elle l'était en alarme.**
> L'objection — *« quatre chuchotements ne doivent pas valoir un cri »* — vise l'alarme, où il
> faut un coupable identifiable. En murmure, l'effet est **d'un ordre de grandeur plus lent et
> plafonné sous l'avertissement** : il n'y a pas de faute à attribuer parce qu'il n'y a pas de
> faute. Les durées sont en *Formulas* §5.

#### Le régime murmure

Plusieurs personnes qui chuchotent tout près d'un meuble doivent le voir **frémir**, jamais
s'alourdir. Le murmure est très bon marché, mais **pas gratuit**.

**Son plafond est sous le seuil d'avertissement** (décision E2 du 2026-09-15). Un chuchotement
fait frémir l'objet et s'arrête juste avant l'alerte ; il n'entre jamais dans le poids réel.
Sans plafond, murmurer assez longtemps finirait par tout charger ; avec un plafond au-dessus
de l'alerte, le chuchotement la ferait sonner.

**Le coût réel est conservé** : un objet qui a frémi est **déjà nerveux**. Un cri qui suit un
murmure atteint l'avertissement plus vite qu'un cri parti du calme. Que cette pré-charge se
lise comme « le meuble est déjà nerveux » ou comme « l'avertissement a disparu » est une
mesure du prototype.

**Le murmure ne fait jamais redescendre la charge.** S'il en reste d'un cri précédent, elle
tient. **Pour récupérer, il faut réellement se taire** — ce qui crée une décision collective
à chaque incident : on se tait deux secondes, ou on continue en assumant ?

#### Le régime alarme

**Le plus grand dépassement pilote, et il fixe une destination.** Les voix sous le seuil ne
s'ajoutent pas : dès qu'il y a un coupable, c'est lui qu'on entend et c'est lui qui charge. Ce qui
est comparé n'est pas le volume absolu mais **de combien chacun dépasse sa propre voix posée** —
entre deux joueurs aux registres différents, c'est bien celui que la pièce a entendu forcer.

**Et l'objet ne va pas plus loin que ce que ce niveau mérite.** Chaque niveau de voix a son plafond
de charge : il y monte à pleine vitesse, puis s'y tient. Chuchoter tout près d'un objet l'installe
à un poids léger et l'y laisse ; seul un cri le remplit. La version normative est *Formulas* §3,
« Chaque niveau de voix a sa destination ».

> **Aucune voix n'est jamais réellement invisible.** Elle n'est masquée qu'à l'instant : **dès
> que le plus bruyant se tait, c'est le suivant qui devient le dépassement maximal** — s'il est
> encore au seuil, l'objet reste en alarme, mais son plafond redescend au niveau de ce
> suivant, et la charge **tient** sans monter davantage. Se cacher derrière quelqu'un ne coûte
> rien tant qu'il crie, et ne fait rien redescendre quand il s'arrête.

#### Le silence, et lui seul, décharge

**La montée dépend du niveau, la descente non.** Un retour dont la durée dépendrait de la
faute passée serait perçu comme une punition, pas comme une mécanique.

> **La panique collective est punie par la descente, pas par le débit.** Quatre joueurs qui
> hurlent ne chargent pas quatre fois plus vite, et ne vont pas plus loin que le plus fort d'entre
> eux — mais **les quatre** doivent se taire pour que ça redescende, là où un seul coupable suffit
> à se calmer. Et une pièce passée en zizanie **allonge la descente** (plus bas).
>
> **Depuis le 2026-09-18, la durée seule ne punit plus** : un niveau donné a une destination, et
> parler longtemps n'y change rien (*Formulas* §3). Ce qui reste du raisonnement est ici, dans la
> descente collective.

#### Un objet posé

**Un objet posé n'accumule plus rien, quelles que soient les voix.** Il **décharge au silence,
et seulement au silence** ; tant qu'on parle autour de lui, sa charge tient.

« On le pose **et on se tait** » est donc la tactique de récupération, jamais « on le pose et
on continue » : la règle « pour récupérer, il faut se taire » devient universelle, et la
boucle crier / poser / reprendre ne contourne rien.

---

### Les seuils sont personnels, et comparent des positions

Le système 6 mesure, pour chaque joueur, **où se situe sa voix posée** entre sa porte et son
cri : c'est `r'`, un nombre entre 0 et 1, **le seul qui quitte sa machine** (décision E5). Ce
système y pose ses seuils.

**Les seuils comparent des positions, jamais des `Loudness`.** Le système 1 transmet
`Loudness`, qui porte l'exposant perceptif `γ` ; recalibrer `γ` déplacerait tous les seuils
sans le vouloir. L'hôte ramène donc chaque contribution en position avec `ToPosition` — la
fonction publique du système 1 — et la compare au seuil du joueur. `γ` n'entre dans aucun
seuil (`voice-analysis.md`, *Formulas* §1, « Position, repos, et où chaque grandeur existe »).

**`T_objet` s'exprime en fractions de la voix posée du joueur.** « Ce vase déclenche à 0,7×
ta voix normale » est une unité qu'un humain comprend, et qui garantit la même exigence pour
tout le monde — **dans son propre registre**. Au-delà de 1, un objet **tolérant** place son
seuil entre la voix posée et le cri, jamais au-delà du cri.

> **La conversation posée est une alarme — décision du propriétaire, maintenue (E4).**
> `T_objet < 1` pour les objets du MVP : parler normalement déclenche l'alarme, et le jeu
> devient télégraphique — littéralement *Shut up and carry*. **Le prototype étendu ajoute un
> objet témoin tolérant**, `T_objet ≥ 1`, pour mesurer le vrai risque : la conversation
> **soutenue**. Une annonce brève (« gauche ! ») reste sous l'avertissement et se vide en une
> fraction de seconde.
>
> **Attention, depuis le 2026-09-18** : « être une alarme » ne veut plus dire « finir par tout
> remplir ». Une conversation posée s’installe à une charge faible et, selon le profil du joueur,
> déclenche ou non l’avertissement — la frontière tombe à `r' ≈ 0,50` (*Formulas* §5). E4 reste
> la décision ; ce qu’elle produit concrètement est à reprendre (OQ-11.21).

**Ce que cet ancrage garantit, pour tous.** Tout ce qui reste sous la porte du joueur vaut 0 et
ne charge rien. Au-dessus, un son reste en murmure tant que sa position est sous
`T_objet · r'`, soit une fenêtre de `T_objet × (Rest_dB − Gate_dB)` décibels au-dessus de la
porte : **la même fraction du registre de chacun**, `LowRange` compris, sans aucune constante
qui juge une voix. Témoins en *Formulas* §1.

**`T_objet` est le curseur de variété du système 13**, pas un paramètre de plus : un vase
fragile a un seuil bas, une armoire un seuil haut.

> **`Rest_dB` est un repère de gameplay.** Le système 6 le mesure et le valide ; un `Rest_dB`
> mal mesuré ne produit plus seulement un profil douteux, il déplace `r'`, donc le seuil de
> déclenchement du joueur. Le système 6 le sait (`voice-calibration.md`, *Detailed Rules*).

### La zizanie

Plusieurs personnes qui **crient ensemble dans la même pièce** font basculer celle-ci dans le
chaos. C'est un **état de la pièce**, ni du mobilier ni du groupe dispersé.

- **La pièce décide qui compte.** Seuls les joueurs **dans la pièce de l'objet** entrent dans
  le compte — une partition franche, pas une distance continue. Trois hurleurs dispersés ne
  font pas une zizanie : ils ne s'entendent pas, et le porteur ne les entend pas.
- **La voix brute décide si la personne braille.** Le compte lit la position du `Loudness`
  **non atténué** : dans une même pièce l'atténuation est faible, et la question est « hurle-t-elle »,
  pas « combien de son arrive à ce meuble ».
- **Le seuil de zizanie est personnel et ancré sur la voix posée**, entre elle et le cri. Il est
  donc **au-dessus du seuil de tout objet ordinaire par construction** : le seuil d'objet est le
  territoire de la parole, celui de la zizanie le territoire du cri.
- **Trois voix minimum, et c'est une décision, pas un curseur.** À deux, on ne fait pas une
  zizanie ; une partie à deux joueurs n'en connaît jamais, et c'est plutôt heureux pour un
  party-game.

**Ce que la zizanie multiplie : la durée de la descente.** Un objet qui a traversé une zizanie
redescend plus lentement quand tout le monde se tait. **C'est devenu le seul endroit où la panique
collective coûte quelque chose** : depuis le plafond par niveau (*Formulas* §3), parler longtemps ne
remplit plus un objet, et la zizanie porte à elle seule ce que la durée portait avant. Insensible au
plafond de charge, et perceptible à la seconde. Deux objets d'une même pièce subissent la même zizanie : c'est le lieu qui est en
chaos, pas le meuble. *La variante « la zizanie accélère la montée » est comparée dans le
prototype.*

#### La zizanie est aussi un épisode compté

Un épisode **s'ouvre** quand la troisième voix franchit son seuil de zizanie, **se ferme** quand
il en reste moins de trois, et **ne compte que s'il a duré au moins la durée minimale**. Deux
épisodes séparés par moins que cette même durée **n'en font qu'un** ; une fusion ne s'étend pas
au-delà d'une durée maximale, sans quoi un compte oscillant pendant dix minutes ne ferait qu'un
épisode. La machine à états et la fin de contrat sont en *Formulas* §4.

**L'hôte fait autorité sur le comptage.** Ce document **produit l'événement** ; qui l'affiche et
le monétise reste à décider avec le périmètre — `mvp-scope.md` pose « écran succès / échec, pas
d'évaluation détaillée » pour le système 18.

#### Le cas de la porte

Un jeu qui consiste à sortir des meubles d'un appartement passe l'essentiel de son temps
**dans les embrasures**. Un canapé porté à deux peut avoir **un porteur de chaque côté d'une
cloison**, et l'objet à cheval.

**Règle : la pièce de l'objet fait foi**, pas celle des porteurs. Un seul lieu, une seule
zizanie, aucune ambiguïté. Franchir une porte peut faire *sortir* un objet d'une pièce en
zizanie ou l'y faire *entrer* : **le passage devient un acte tactique** — « on le sort d'ici
avant qu'ils ne recommencent ». *(Ce que « la pièce de l'objet » veut dire exactement dépend
des systèmes 9 et 10.)*

---

### Avertissement et verdict — deux signaux, deux autorités

C'est l'application directe d'ADR-0002 : **« prédire l'avertissement, jamais le verdict »**.

| | **L'avertissement** | **Le verdict** |
|---|---|---|
| Ce que c'est | L'objet « s'excite » — un **événement** perceptible | Le poids réel qui gêne la manœuvre |
| Déclenché | **Une fois**, quand la charge franchit le seuil d'avertissement en montant ; réarmé quand elle redescend nettement dessous | Progressivement ensuite |
| Autorité | **Aucune** — couche de retour local (12) | **Hôte** (ADR-0002) |
| Latence | Immédiate pour sa propre voix | Aller-retour réseau |

**L'avertissement est un événement, pas un état.** Il se déclenche sur le front montant et se
réarme sous le seuil diminué d'une marge ; il ne clignote donc pas quand la charge oscille.
Trois états sonores en découlent (*Visual/Audio Requirements*) : un **frémissement** sous le
seuil, une **texture de danger** tant que la charge est au-dessus — atteignable seulement après
une alarme, puisque le murmure plafonne dessous —, et un **signal bref** au franchissement.

**Le banc allumait l'avertissement dès la première trame parlée.** Le prototype étendu propose
**les deux sémantiques, commutables** (décision E1), et le propriétaire choisit en jouant.

**Ce que chaque machine connaît, et donc ce qu'elle peut prédire** (décision E5, arbitrage (f)) :

- **L'hôte** reçoit de chaque client sa `Loudness` à chaque trame et son `r'` à la connexion et à
  chaque recalibration. Il calcule seul la charge, le régime, la zizanie et la lourdeur, et
  publie l'état des objets.
- **Chaque client** connaît sa propre voix, instantanément. **Il prédit l'avertissement de sa
  voix seule** ; la contribution des autres lui arrive par l'état que publie l'hôte, au rythme
  où leur voix lui parvient par le chat.
- **Aucun client ne reçoit les `VoiceFrame` ni les `r'` des autres.** Aucun ADR n'achemine ces
  données vers les clients, et ce document n'en a pas besoin.

> Ce déséquilibre n'est pas un défaut à corriger — **il est juste**. Le joueur est
> immédiatement redevable de sa propre voix, et découvre celle des autres au rythme où il les
> entend.

**L'hôte date chaque trame à sa réception** et la considère expirée au-delà d'un délai court ;
une trame expirée vaut 0. Sans cette horloge, un paquet « silence » perdu laisserait l'objet
charger sur le dernier cri reçu.

### Comment la charge devient du poids

Le modèle de lourdeur est repris du banc, à ceci près que « poids » y était une inertie de
glissement et devra ici être une grandeur physique. *(PROVISOIRE — dépend du système 9.)* La
lourdeur **bouge dès le début de la charge**, très légèrement — une **amorce** imperceptible
qui fait partie de l'avertissement, décision de l'utilisateur du 2026-09-08. Le joueur est
freiné avant d'être puni, et il le sent sans pouvoir le nommer. Formule en *Formulas* §4.

**La calibration réutilise ce modèle.** L'étape de montée du système 6 montre un objet qui
s'alourdit à mesure que la voix monte (décision D1) : c'est le même vocabulaire — frémir,
s'alourdir, résister — que le joueur retrouvera en jeu.

### Le point d'extension, exigence de code

La combinaison des voix est **un point d'extension explicite**, pas une expression noyée dans
une boucle. Elle doit rester **substituable pour la règle, pas pour le périmètre de données** :
la variante de zizanie et la règle du murmure peuvent changer après playtest ; ce que la
combinaison reçoit, non.

```
VoiceContribution { Player, AttenuatedLoudness, RawLoudness, RestPosition, PlayerRoom }
IVoiceCombiner.Combine(contributions, objectRoom, config) → { Regime, LEffective, Zizanie }
IRoomQuery          « dans quelle pièce est ce point »   — système 10
```

`RestPosition` est le `r'` reçu du joueur. La configuration est **injectée**, jamais lue dans des
constantes compilées : c'est ce qui rend chaque règle testable hors Unity et chaque curseur
réglable pendant une partie.

### Ce que ce document ne peut pas encore fixer

| Question | Bloqué par |
|---|---|
| Ce que « lourdeur = 1 » veut dire mécaniquement — vitesse, inertie, points d'ancrage, chute | **Système 9** — enveloppe de portage |
| L'atténuation de `L_i` par la distance, sa forme et sa portée | **Système 3** — propagation |
| La lourdeur rend-elle le transport **impossible** ou seulement pénible ? | **Système 9**, et un arbitrage de gameplay |
| La partition en pièces et le point de référence d'un objet | **Systèmes 10 et 9** |

Ces quatre-là sont nommés plutôt que devinés. Les deviner produirait des règles contredites dès
que les GDD voisins s'écriront.

## Formulas

**Cette section et la boucle qu'elle contient sont normatives.** Chaque valeur provisoire vit
dans une seule liste, en fin de section (« Porte de mesure du système 11 ») ; les nombres cités
ailleurs sont des **témoins de lecture**, calculés avec les valeurs actuelles — dont, pour le
système 1, `γ = 0,65` et `Margin_dB = 7`, qui vivent dans sa propre liste. Un test lit la
constante nommée, jamais le nombre recopié.

### 1. Les seuils personnels — en positions

```
x_i       = ToPosition( L_i )                 position de la contribution atténuée      système 1
xb_i      = ToPosition( Loudness_i )           position de la voix brute, non atténuée   système 1

Seuil_i   = T_objet · r'_i                            si 0 < T_objet ≤ 1
          = r'_i + (T_objet − 1) · (1 − r'_i)         si 1 < T_objet ≤ 2      objet tolérant

T_ziz,i   = r'_i + k_z · (1 − r'_i)
```

| Variable | Type | Domaine | Disponible où | Description |
|---|---|---|---|---|
| `Loudness_i` | float | `[0 ; 1]`, **0 exactement sous `Gate_dB`** | hôte — `VoiceFrame`, ADR-0003:134, 224 | Sortie du système 1 pour le joueur `i` |
| `L_i` | float | `[0 ; 1]`, **0 exactement au-delà de la portée** | hôte | `Loudness_i` atténuée à la position de l'objet. *PROVISOIRE — dépend du système 3* |
| `r'_i` | float | `]0 ; 1[` — `voice-analysis.md` §5 | hôte — reçue à la connexion et à chaque recalibration, ADR-0003, *Decision*, étape 5 | Position de la voix posée du joueur entre sa porte et son cri |
| `ToPosition` | fonction | `[0 ; 1] → [0 ; 1]` | hôte, avec **son** `γ` | Inverse de `Loudness = x'^γ`. Exacte seulement si le `γ` de l'hôte est celui du client (*Edge Cases*) |
| `T_objet` | float | `]0 ; 2]` ; MVP dans la liste canonique | hôte — configuration de l'objet | Tolérance de l'objet, en fractions de voix posée. Curseur de variété du système 13 |
| `Seuil_i` | float | `]0 ; r'_i]` si `T_objet ≤ 1` ; `]r'_i ; 1]` au-delà | hôte, **relu à chaque tick** | Position à partir de laquelle la voix de `i` met **cet** objet en alarme |
| `k_z` | float | `]0 ; 1[` | hôte — configuration | Place du seuil de zizanie entre la voix posée et le cri |
| `T_ziz,i` | float | `]r'_i ; 1[` | hôte, relu à chaque tick | Position à partir de laquelle `i` compte dans une zizanie |

**`γ` n'entre dans aucun seuil.** Les seuils comparent des positions ; `Loudness` ne sert qu'aux
débits de charge (§3), qui suivent la sonie perçue.

**Ordre garanti par construction.** `Seuil_i < T_ziz,i ⟺ T_objet < 1 + k_z`. Tout objet
ordinaire (`T_objet ≤ 1`) déclenche son alarme avant qu'une voix compte dans une zizanie. Un
objet tolérant au-delà de `1 + k_z` est une exception délibérée : la pièce peut être en zizanie
pendant qu'il reste en murmure.

**Ce que vaut la fenêtre de murmure, en décibels.** Une position `x` correspond à
`Gate_dB + x · Δ'` ; le seuil `T_objet · r'` tombe donc à `T_objet × (Rest_dB − Gate_dB)` au-dessus
de la porte. L'hôte ne connaît aucun décibel : ce calcul sert à lire les témoins, pas à exécuter.

**Témoins** :

| Profil | `r'` | `T_objet` | Fenêtre de murmure au-dessus de la porte | `T_ziz` |
|---|---|---|---|---|
| `Gate −48 · Rest −30 · Scream −10` | 0,474 | 0,7 | **12,6 dB** — seuil à la position 0,332, `Loudness` ≈ 0,49 | 0,684, soit 26 dB au-dessus de la porte |
| `Gate −53 · Rest −48 · Scream −42` — `LowRange` | 0,455 | 0,7 | **3,5 dB** | — |
| même profil | 0,455 | 0,4 | **2,0 dB** | — |
| `Gate −48 · Rest −30 · Scream −10` | 0,474 | 1,2 — tolérant | **22 dB** : la voix posée reste en murmure | 0,684 |

**Sous la porte, rien ne pèse, pour personne.** Témoin de la revue : un chuchotement à
`Floor_dB + 5 dB` tombe à 2 dB sous `Gate_dB` → `Loudness = 0` → aucune contribution. La fenêtre
au-dessus de la porte est **la même fraction du registre de chacun** ; qu'elle couvre le vrai
chuchotement d'un joueur donné est une mesure du prototype (B1 du système 1).

#### Le chuchotement mesuré, et le seuil qu'on pourrait y ancrer

La dernière phrase ci-dessus est désormais mesurée, et la réponse est **non, pas avec cette
formule**. Sur le seul profil réel dont on dispose (`r' = 0,537`, prototype étendu, 2026-09-18) :

| | Position | Seuil d'un objet ordinaire (`T` 0,7) | Verdict |
|---|---|---|---|
| Chuchotement, médiane | **0,293** | 0,376 | murmure |
| Chuchotement, pointes (P90) | **0,425** | 0,376 | **alarme** |
| Chuchotement, extrêmes | 0,75 | 0,376 | alarme |

Sur un objet **fragile** (`T` 0,4, seuil 0,215), même la médiane passe en alarme. **Le registre que
le Pilier 1 protège n'a donc pas de marge** : le joueur qui chuchote correctement est classé
coupable dès qu'il souffle un peu.

**La piste, non retenue à ce stade** : ancrer le seuil sur le chuchotement mesuré plutôt que sur une
fraction de la voix posée, `w` étant sa position (`voice-calibration.md`, *Formulas* §2a) :

```
Seuil_i  =  w_i + T_objet · (r'_i − w_i)            si 0 < T_objet ≤ 1        ← variante ancrée
```

Le seuil de l'objet ordinaire passerait de 0,376 à **0,464** — environ 5 dB gagnés — et la médiane
**comme** les pointes du chuchotement redeviendraient du murmure.

**Ce qui la retient**, et c'est à trancher (OQ-11.20) :

- Elle exige un **second scalaire par joueur sur l'hôte**, ce qui amende la décision E5 d'ADR-0003
  (« un seul scalaire quitte la machine »).
- Le **plafond par niveau** (§3) a déjà retiré l'essentiel du mal : les pointes du chuchotement
  s'installent à une charge de 0,08 et n'alertent jamais. Ce qui reste est une question de
  **classement**, pas de punition — être désigné coupable au sonomètre pour un chuchotement.
- `w` est plus fragile que `r'` : il dépend de ce que le joueur appelle « chuchoter » un jour
  donné, et une chaîne de capture qui écrase la dynamique le remonte au niveau de la voix posée,
  auquel cas la variante ancrée **ne change plus rien** — elle dégénère en `Seuil ≈ T · r'`.


### 2. Le régime, et la combinaison des voix

```
SILENCE  ⟺  pour tout i :  L_i = 0
ALARME   ⟺  non SILENCE  ET  il existe i :  x_i ≥ Seuil_i            borne incluse
MURMURE  ⟺  sinon

MURMURE :  L_mur    = min( 1 , Σ L_i )

ALARME  :  excès_i  = clamp( (x_i − Seuil_i) / (1 − Seuil_i) , 0 , 1 )     0 si Seuil_i ≥ 1
           e        = max_i excès_i           dépassement, 0 au seuil et 1 au cri
           coupable = le i qui réalise ce maximum
           L_eff    = max( L_i )              variante « palier » seulement (§3)

ZIZANIE :  N_z(pièce) = #{ i dans la pièce :  xb_i ≥ T_ziz,i }
           Z(pièce)   = 1 + z · (N_z − 2)     si N_z ≥ 3,   sinon 1
```

- **`SILENCE` est prioritaire.** Il ne dépend d'aucun seuil : ni `T_objet`, ni `r'`. À
  `Σ L_i = 0`, il n'y a qu'un résultat.
- **`SILENCE` est atteignable avec de vraies trames**, pas seulement par injection : quatre joueurs
  sous leur porte, ou hors de portée, donnent `L_i = 0` exactement. Ce qu'il exige du système 1 est
  en §3, « Ce que le silence exige ».
- **Le dépassement est personnel, et c'est ce qui désigne le coupable.** `excès_i` mesure de combien
  `i` dépasse **son** seuil, pas combien il est fort dans l'absolu. Entre deux joueurs aux profils
  différents, celui qui pousse le plus **au-dessus de sa propre voix posée** l'emporte — ce qui est
  exactement ce que la pièce a entendu. Le maximum sur `L_i` désignait le plus fort en décibels
  normalisés, ce qui n'est pas la même personne.
- **La pièce et la voix brute**, deux filtres pour deux rôles : la pièce décide *qui compte*, la
  position brute *si la personne braille*. Deux objets d'une même pièce subissent la même `Z`.
- **Témoin de la borne** : `x_i = Seuil_i` exactement → `ALARME`, avec `e = 0` : l'objet passe en
  alarme et son plafond est celui du murmure. **Franchir le seuil n'est pas être puni** ; c'est
  être vu.

### 3. La boucle de mise à jour et la charge

```
à chaque tick de l'hôte, de durée dt :

  pour chaque joueur i :
      si  r'_i non reçu  OU  âge(dernière trame de i) > Expiration :   Loudness_i = 0

  pour chaque objet o :
      L_i         = Atténuation(i, o) · Loudness_i               système 3 ; 0 au-delà de la portée
      Régime      = §2, seuils relus depuis le r'_i courant
      si charge(o) > 0 :   Zmém(o) = max( Zmém(o) , Z(pièce(o)) )

      Plafond_mur = k · seuil_av                                 §4
      Plafond_al  = max( Plafond_mur , e ^ Douceur )             e = dépassement du seuil, §2

      si o est porté :
          SILENCE :  charge −= dt / (Vidange × Zmém(o))
          MURMURE :  si charge < Plafond_mur :  charge = min( charge + L_mur · dt / (Remplissage × Lenteur) , Plafond_mur )
                     sinon :                    inchangée
          ALARME  :  si charge < Plafond_al  :  charge = min( charge + dt / Remplissage , Plafond_al )
                     sinon :                    inchangée
      sinon, o est posé :
          SILENCE :  charge −= dt / (Vidange × Zmém(o))
          sinon :    inchangée

      charge = clamp( charge , 0 , 1 )
      si charge = 0 :   Zmém(o) = 1
      puis §4 : avertissement, lourdeur
```

| Variable | Description |
|---|---|
| `Remplissage` | Durée de 0 à charge pleine **en alarme** — la vitesse de montée ne dépend plus du niveau, seule la destination en dépend |
| `Vidange` | Durée de charge pleine à 0 en silence, hors zizanie. **Ne dépend pas du niveau précédent** |
| `Lenteur` | Facteur de ralentissement du murmure, `≥ 1` |
| `Douceur` | Exposant du dépassement. `1` = plafond proportionnel ; plus haut = bas de l'échelle plus permissif |
| `Plafond_mur` | `k · seuil_av` (§4) — **sous** l'avertissement |
| `Plafond_al` | Plafond du niveau de voix courant, jamais sous `Plafond_mur` |
| `Zmém(o)` | La plus forte zizanie traversée par l'objet depuis sa dernière charge nulle |
| `Expiration` | Âge au-delà duquel une trame reçue ne vaut plus rien |

#### Chaque niveau de voix a sa destination

**C'est le changement du 2026-09-18, et il vaut d'être dit en clair** : la charge ne monte plus
« à la vitesse du niveau, sans fin ». Elle monte **à pleine vitesse vers le plafond de ce
niveau-là**, puis s'y tient. Chuchoter près d'un objet l'installe à un poids léger et ne l'emmènera
jamais plus loin ; seul un cri le remplit.

**Pourquoi.** Sous l'ancien modèle, franchir le seuil suffisait : la charge montait ensuite
**presque aussi vite qu'au cri**, et il ne restait qu'une question de temps avant l'alerte et le
blocage. Mesuré au prototype avec un profil réel : les pointes d'un chuchotement remplissaient
l'objet en **2,6 s**, une voix posée en **2,2 s**, un cri en **1,5 s** — trois registres pour un
seul résultat. Le propriétaire l'a vécu ainsi : *« en deux phrases chuchotées, on est en alarme,
et le truc commence à bloquer »* (2026-09-18).

- **Le plafond ne borne que la montée, jamais la charge.** Une charge de 0,60 héritée d'un cri
  **reste à 0,60** quand on redescend à une voix posée : rabattre la charge ferait d'un registre
  plus bas une récupération, alors que **seul le silence décharge**. C'est la même règle qu'au
  murmure, généralisée.
- **`Plafond_al ≥ Plafond_mur` par construction.** Sans cette borne, une voix qui franchit tout
  juste le seuil chargerait **moins** qu'un murmure resté dessous : la frontière produirait une
  inversion absurde. Avec elle, le passage du murmure à l'alarme est continu en destination, et ce
  qui change au franchissement est ailleurs — l'avertissement, le coupable, la vitesse.
- **La zizanie multiplie la durée de la descente, pas le débit de la montée.** Aucune borne
  `min(1, …)` ne peut donc la neutraliser.

> **Ce que ce modèle affaiblit, et il faut le dire.** « La panique collective est punie par la
> durée » perd la moitié de sa force : **parler longtemps ne remplit plus un objet**, seul le
> niveau décide de la destination. Ce qui reste du raisonnement est la **descente** — les quatre
> doivent se taire pour que ça redescende, là où un seul coupable suffit à se calmer — et elle est
> intacte. La décision E4 tient tant que `Douceur` reste à 1 : une conversation soutenue déclenche
> encore l'avertissement, mais ne pèse presque rien (§5).

> **Statut : éprouvé seul, pas à plusieurs.** Le propriétaire a essayé les trois variantes au
> prototype et retenu celle-ci — *« je crois qu'on tient la bonne piste, mais il faudra l'éprouver
> à plusieurs »* (2026-09-18). Ce document la spécifie comme le modèle ; **le test à plusieurs
> humains peut encore la renvoyer** (OQ-11.6).

- **Variante comparée au prototype — « palier », le modèle d'avant le 2026-09-18** :
  `ALARME : charge += L_eff · dt / Remplissage`, sans plafond. Elle reste dans le prototype pour
  comparaison ; elle n'est plus le modèle.
- **Variante comparée — « débit hors plafond »** : `ALARME : charge += L_eff · Z(pièce) · dt / Remplissage`
  et `SILENCE : charge −= dt / Vidange`, sans `Zmém`. Elle n'est pas le modèle non plus.


#### Ce que le silence exige du système 1 — `p`

La charge ne descend que sur les ticks où **toutes** les contributions sont nulles. Si un joueur
qui se tait produit `Loudness = 0` sur une part `p` de ses trames, et que ces parts sont
indépendantes, quatre joueurs silencieux ne sont en `SILENCE` que sur `p⁴` des ticks, et la
descente dure `Vidange / p⁴`.

**Cible** : la descente à quatre ne dépasse pas deux fois `Vidange`, soit `p⁴ ≥ 0,5`, donc
**`p ≥ 0,84`**. C'est la part que le critère AC-40 du système 1 doit atteindre. **Hypothèse
d'indépendance non vérifiée** ; la valeur réelle de `p` se mesure à l'étape de silence du
prototype (B2).

#### Garde de configuration

Une configuration est **refusée au chargement** si l'une de ces conditions échoue :
`0 < Avertissement < Remplissage` — sinon `seuil_av ≥ 1` et `principal` divise par zéro ;
`0 < k < 1` ; `Lenteur ≥ 1` ; `Vidange > 0` ; `0 < h < 1` ; `0 < T_objet ≤ 2` ; `0 < k_z < 1` ;
`z ≥ 0`.

### 4. Avertissement, lourdeur, épisode

```
seuil_av   = Avertissement / Remplissage
Plafond_mur = k · seuil_av                     §3

AVERTISSEMENT — événement :
    armé  ET  charge(t − dt) < seuil_av ≤ charge(t)       →  émettre ; désarmer
    désarmé  ET  charge(t) < seuil_av · (1 − h)            →  réarmer

amorçage   = Amorçage · min( charge / seuil_av , 1 )
principal  = max( 0 , (charge − seuil_av) / (1 − seuil_av) )
lourdeur   = min( 1 , amorçage + principal · (1 − Amorçage) )
```

| Variable | Description |
|---|---|
| `Avertissement` | Durée jusqu'à l'avertissement **depuis une charge nulle, en alarme** — la vitesse de montée ne dépend plus du niveau (§3). Provenance en §6 |
| `h` | Marge de réarmement, en fraction de `seuil_av` |
| `k` | Hauteur du plafond du murmure, en fraction de `seuil_av`. **Aussi le plancher du plafond d'alarme** (§3) |
| `Amorçage` | Part de lourdeur atteinte au seuil d'avertissement — imperceptible, mais présente dès le début |

**L'avertissement est devenu une porte de niveau, pas seulement de durée.** Avec le plafond par
niveau (§3), l'objet n'atteint `seuil_av` que si le plafond de ce niveau le dépasse :

```
avertissement atteignable  ⟺  e ^ Douceur ≥ seuil_av  ⟺  e ≥ seuil_av ^ (1 / Douceur)
```

- **En deçà, il ne sonne jamais**, quelle que soit la durée. Une voix qui effleure le seuil de
  l'objet ne déclenche rien, même au bout d'une minute — ce que l'ancien modèle ne permettait pas.
- **Au-delà, le délai ne dépend plus du niveau** : depuis une charge `c₀`, `(seuil_av − c₀) · Remplissage`.
  Depuis le calme, c'est **`Avertissement` exactement** — 350 ms, la valeur mesurée, redevenue une
  constante au lieu d'un plancher.
- **Depuis le plafond du murmure — la pré-charge** : `(1 − k) · Avertissement`, soit **140 ms** avec
  `k = 0,6`. Mesuré au prototype : à `k = 0,85` (52 ms) le testeur rapportait « l'avertissement a
  disparu » ; à 0,6 il rapporte « le meuble est déjà nerveux », qui est l'effet visé.

**En murmure, la lourdeur ne dépasse jamais `k · Amorçage`** — 0,09 : l'amorce seule, jamais le poids
principal. **À `charge = seuil_av`, la lourdeur est continue** : `amorçage = Amorçage`, `principal = 0`.

**La prédiction du client.** Il part du dernier état de l'objet publié par l'hôte, y intègre **sa
seule contribution** avec les mêmes formules, et émet l'avertissement local sur son propre front
montant. La réconciliation avec l'état suivant de l'hôte appartient au système 12 (ADR-0002).

#### L'épisode de zizanie — machine à états

| État | Transition | Condition |
|---|---|---|
| `Closed` | → `Open` | `N_z ≥ 3` dans la pièce |
| `Open` | → `PendingClose` | `N_z < 3` |
| `PendingClose` | → `Open`, **même épisode** | `N_z ≥ 3` avant `DuréeMin` **et** épisode ouvert depuis moins de `FusionMax` |
| `PendingClose` | → `Committed`, et un **nouvel** épisode s'ouvre | `N_z ≥ 3` avant `DuréeMin` **mais** épisode ouvert depuis `FusionMax` ou plus |
| `PendingClose` | → `Committed` ou `Discarded` | `DuréeMin` écoulée sans reprise : `Committed` si la durée de l'épisode atteint `DuréeMin`, sinon `Discarded` |
| `Open`, `PendingClose` | → `Committed` ou `Discarded` | **Fin de contrat** : même règle de durée |

- **La durée d'un épisode** court de son ouverture à sa dernière fermeture.
- **`DuréeMin` fait deux métiers** : durée minimale pour compter, écart minimal pour séparer. `FusionMax`
  borne la fusion.
- **L'hôte fait autorité** ; les épisodes sont émis vers les systèmes 16 et 18 à l'état `Committed`.

### 5. Exemples chiffrés

Configuration de référence : valeurs de la liste canonique, joueurs au profil
`Gate −48 · Rest −30 · Scream −10` (`r' = 0,474`), `T_objet = 0,7` → seuil à la position 0,332,
soit `Loudness` ≈ 0,49 ; seuil de zizanie à la position 0,684, soit `Loudness` ≈ 0,78 ;
`seuil_av = 0,233`, `Plafond_mur = 0,14`, `Douceur = 1`.

| Situation | Régime | Position | Dépassement `e` | Plafond de ce niveau | Atteint en | Avertissement | Poids une fois posé |
|---|---|---|---|---|---|---|---|
| Cri, `L = 1,0` | alarme | 1,000 | 1,000 | **1,00** | 1,50 s | 0,35 s | 1,00 |
| `L = 0,9` | alarme | 0,850 | 0,776 | **0,78** | 1,16 s | 0,35 s | 0,75 |
| `L = 0,8` | alarme | 0,710 | 0,565 | **0,57** | 0,85 s | 0,35 s | 0,52 |
| `L = 0,63` — la voix la plus basse qui alerte | alarme | 0,488 | 0,233 | **0,23** | 0,35 s | 0,35 s, tout juste | 0,15 |
| **Quatre joueurs à 0,5** | alarme | 0,344 | 0,019 | **0,14** — celui du murmure | 0,21 s | **jamais** | 0,09 |
| Un à 0,9 et trois à 0,6 | alarme | 0,850 | 0,776 | 0,78 | 1,16 s | 0,35 s | 0,75 |
| Quatre chuchotements à 0,2 | murmure | 0,084 | — | 0,14 | 2,6 s | jamais | 0,09 |
| Un chuchotement à 0,2 | murmure | 0,084 | — | 0,14 | 10,5 s | jamais | 0,09 |

**Descente, depuis le plafond atteint** : `charge × Vidange × Zmém`. Depuis le plein, 1,5 s ; depuis
0,57, **0,85 s** ; depuis 0,14, 0,21 s. Une pièce passée en zizanie à trois voix multiplie ces durées
par 1,5 — 1,27 s depuis 0,57. **La zizanie n'agit que là**, jamais sur la montée.

**La ligne qui a changé de sens.** Sous l'ancien modèle, quatre joueurs modérés remplissaient l'objet
en 3,0 s et deux joueurs bruyants en 1,88 s : un rapport de 1,6, et les deux finissaient au plein.
Aujourd'hui **ils ne finissent pas au même endroit** : les quatre modérés s'installent à 0,14 et
n'alertent jamais ; les bruyants montent à 0,57 et alertent en 0,35 s. Le niveau individuel ne
change plus la vitesse — il change la **destination**, ce qui est plus lisible pour le joueur : « à
ce volume-là, l'objet devient *ça*. »

#### Le seuil d'alerte tombe à hauteur de la voix posée — et de quel côté dépend du joueur

L'avertissement se déclenche depuis la position `Seuil + seuil_av^(1/Douceur) · (1 − Seuil)`. En
remplaçant `Seuil = T_objet · r'`, une **conversation posée** déclenche l'avertissement d'un objet
ordinaire si et seulement si :

```
r'  ≥  seuil_av / ( 1 − T_objet + T_objet · seuil_av )
```

soit **`r' ≥ 0,50`** avec les valeurs de référence. Les deux seuls profils réels mesurés encadrent
cette frontière : **0,474** (la conversation n'alerte pas) et **0,537** (elle alerte, à 0,35 s, pour
un poids de 0,18 — vérifié au prototype le 2026-09-18).

**Ce n'est pas un défaut de calcul, c'est une décision à reprendre.** La décision E4 — « une
conversation soutenue près d'un objet ordinaire doit rester inconfortable » — était prise sous un
modèle où toute alarme finissait par tout remplir. Sous le plafond par niveau, elle se joue à
quelques centièmes de `r'`, c'est-à-dire **au hasard du profil vocal**. Trois curseurs la
déplacent : `Douceur`, le rapport `Avertissement / Remplissage`, et `T_objet` par objet (OQ-11.21).


### 6. Provenance de l'avertissement — mesuré sous un autre modèle

**Statut : PROVISOIRE, avec un historique.** Le banc `prototypes/charge-vocale/index.html` a
conduit à 350 ms, choisi au curseur par un seul testeur, le concepteur, avec `Remplissage = 1,5 s`
(valeur par défaut du code : 200 ms, ligne 328). Il faisait tourner un modèle différent :

| | **Banc** | **Ce document** |
|---|---|---|
| Débit de charge | `charge += (0,35 + 0,65 · above) · dt / fill`, `above` sur une rampe de 25 dB — **plancher de 35 %** dès le seuil franchi (l. 618–619) | `dt / Remplissage` vers un **plafond par niveau** `e^Douceur` (§3, 2026-09-18). Le banc n'avait ni plafond ni seconde voix |
| Seuil | Un niveau en dB **réglé à la main**, `thresh = −45` (l. 328, 613) ; aucune calibration | Positions contre `T_objet · r'_i`, personnelles |
| Avertissement | Un **état** : `warnActive = charge > 0 && charge < warnAt · 1,6 && voiced` (l. 629) — **allumé dès la première trame au-dessus du seuil**, éteint au silence ou à 1,6 × `warnAt` | Un **événement** au franchissement de `seuil_av`, réarmé sous `seuil_av · (1 − h)` |
| Ce que fixaient les 350 ms | `warnAt = warnMs / fill` (l. 616) : **le début du poids principal** dans `heaviness()` (l. 543–548) | Le seuil de l'événement **et** le début du poids principal |
| Voix, régimes | Une voix, aucun murmure, aucune zizanie | Plusieurs voix, trois régimes, zizanie |
| Affichage | **Barre de charge et niveau d'entrée visibles** (l. 632–638) | Aucune jauge (*Visual/Audio Requirements*) |
| Enveloppe | Attaque 15 ms, relâchement 150 ms, en dB (l. 336) | Constantes du système 1, provisoires |

**Ce qui en reste, honnêtement** : un humain sent une charge monter et se tait à temps ; et, dans la
sémantique du banc, un indice immédiat suivi d'environ 350 ms avant le poids a été jugé meilleur que
plus tôt ou plus tard, avec une chute nette entre 400 et 430 ms. **Ce que le testeur a jugé est peut-être
l'indice immédiat, pas un événement retardé** : le prototype étendu rejoue les deux (décision E1).

### Porte de mesure du système 11 — la liste canonique des valeurs provisoires

**Une valeur y figure si et seulement si elle attend une mesure.** Les nombres de cette table sont
les seuls de ce document ; partout ailleurs, on y renvoie.

| Valeur | Provisoire | Plage sûre | Statut | Se fixe par |
|---|---|---|---|---|
| `Avertissement` | 350 ms | 200 – 400 ms | PROVISOIRE — **mesuré sous un autre modèle** (§6) | Prototype étendu, deux sémantiques ; **couplé à `Remplissage`** |
| `Remplissage` | 1,5 s | 1,0 – 1,5 s | PROVISOIRE — banc, autre modèle | Prototype étendu, avec `Avertissement` |
| `Vidange` | 1,5 s | 1,0 – 2,0 s | PROVISOIRE — jamais isolée au banc | Prototype étendu |
| `Amorçage` | 15 % | 10 – 20 % | PROVISOIRE — jamais isolé | Prototype étendu |
| `h` — réarmement | 0,2 | 0,1 – 0,3 | PROVISOIRE | Prototype : aucun re-déclenchement sur une charge qui oscille |
| `k` — plafond du murmure, plancher du plafond d'alarme | **0,6** | 0,5 – 0,8 | PROVISOIRE — **une lecture réelle**, 2026-09-18 | Prototype : « déjà nerveux » à 0,6, « l'avertissement a disparu » à 0,85 (VO-49) |
| `Douceur` — exposant du plafond par niveau | 1 | 1 – 3 | PROVISOIRE — **jamais éprouvé à plusieurs** | Prototype à plusieurs humains ; à 1, une conversation alerte encore (OQ-11.21) |
| `Lenteur` | 10 | 6 – 15 | PROVISOIRE | Prototype : « l'objet frémit » sans s'alourdir |
| `T_objet`, objets du MVP | 0,4 – 0,9 | `]0 ; 2]` | PROVISOIRE — par objet, système 13 | Prototype, **avec un objet témoin à `T_objet ≥ 1`** |
| `k_z` | 0,4 | 0,3 – 0,6 | PROVISOIRE — jamais éprouvé | Prototype à trois voix simulées, puis playtest à trois ou plus |
| `z`, forme « durée » | 0,5 | 0,25 – 1,0 | PROVISOIRE — jamais éprouvé | idem |
| `DuréeMin` d'épisode | 1 s | 0,5 – 2 s | PROVISOIRE | Playtest |
| `FusionMax` | 10 s | 5 – 30 s | PROVISOIRE | Playtest |
| `Expiration` d'une trame | 200 ms | 150 – 250 ms | PROVISOIRE | Mesure réseau, système 5 |
| `p` — part des trames nulles d'un joueur silencieux | cible 0,84 | — | **Cible dérivée, EN ATTENTE** de B2 | Étape de silence du prototype |
| `γ`, `Margin_dB` | — | — | **Système 1** | voir `voice-analysis.md` |

**Décisions, hors de la liste parce qu'elles n'attendent pas de mesure** : trois voix minimum pour
une zizanie ; la priorité de `SILENCE` ; **le plus grand dépassement** en alarme et la somme en murmure ; la zizanie
sur la durée ; la cadence du tick de l'hôte, qui relève de l'ADR du fil d'exécution de l'hôte.

**Aucune de ces valeurs n'a été éprouvée à plusieurs joueurs.** Le banc était monojoueur ; tout ce
qui touche à la combinaison relève du raisonnement.

## Edge Cases

Chaque entrée nomme la **condition exacte**, la **résolution exacte**, et sa sévérité :
**bloquant** (le système produit un comportement faux sans le signaler), **dégradant**
(comportement médiocre mais honnête) ou **cosmétique**.

### La bascule de régime

- **Si une voix oscille autour du seuil d'un objet** : le régime alterne entre murmure et alarme.
  La charge intègre sur plus d'une seconde et `Loudness` est lissée par le système 1 ;
  l'avertissement, événement réarmé sous une marge, ne clignote pas. **Cosmétique.**
- **Si un même joueur franchit le seuil d'un objet et pas d'un autre** : **comportement voulu**. Le
  régime est par objet ; c'est ce que `T_objet` sert à produire.
- **Si la charge dépasse le plafond puis que tout le monde chuchote** : elle **reste où elle est**.
  **Bloquant si mal écrit** : rabattre au plafond ferait du murmure une récupération.
- **Si un seul joueur produit un souffle juste au-dessus de sa porte pendant que les autres se
  taisent** : `MURMURE`, la charge tient au lieu de descendre. **Dégradant** — c'est pourquoi la
  part `p` des trames nulles est une cible (*Formulas* §3).

### Les seuils personnels

- **Si un joueur n'a pas de profil valide** — `Uncalibrated`, `Degraded`, ou en cours de
  calibration : sa sortie est `Silence`, donc `L_i = 0`. **Il n'affecte plus aucun objet.**
  > **Exploit théorique, et pourquoi il s'annule.** Couper son micro rendrait inoffensif tout en
  > coordonnant par un canal externe. Mais le joueur perd le chat vocal, et **tout ce qui exige
  > d'émettre** — les objets à demande sonore du système 13. **Dégradant, auto-limitant, accepté.**
- **Si l'hôte n'a pas encore reçu le `r'` d'un joueur** : ses contributions valent 0 jusqu'à
  réception. **Aucun `r'` par défaut** : ce serait une constante qui juge une voix. **Dégradant**,
  borné aux premiers instants de la connexion.
- **Si un joueur recalibre** : sa sortie est `Silence` pendant la calibration ; au commit, le nouveau
  `r'` remplace l'ancien **au tick suivant**, et **aucune charge n'est recalculée rétroactivement**.
- **Si `Rest_dB` a été mal mesuré** : `r'` est faux, donc le seuil. Trop bas, le joueur déclenche
  l'alarme en parlant à peine ; trop haut, il crie sans conséquence. **Bloquant, et c'est le coût
  assumé du modèle** : sous un maximum, une calibration douteuse domine. Mitigations : validations
  du système 6, « Refaire ma mesure ».
- **Si `r'` est très petit** : le seuil est bas dans le registre, mais **toujours au-dessus de la porte**
  — `r' > 0` pour tout profil commité (`voice-analysis.md` §5), et sous la porte rien ne pèse. Le
  joueur a une fenêtre de murmure étroite **à l'échelle de son propre registre**. **Comportement voulu.**
- **Si un profil `LowRange` ou approximatif est souvent désigné coupable par le maximum** : les seuils
  étant relatifs au registre de chacun, aucun biais structurel n'est attendu. Un profil approximatif à
  plage très étroite amplifie en revanche de petites variations. **Dégradant, à surveiller en
  playtest** ; le système 6 invite ce joueur à refaire sa mesure.
- **Si le `γ` de l'hôte diffère de celui d'un client** : `ToPosition` rend une position fausse et les
  seuils de ce joueur glissent sans que rien ne le signale. **Bloquant si non traité** — la réplication
  de la configuration par l'hôte est une exigence (OQ-11.13).

### La zizanie

- **Si exactement trois joueurs de la pièce franchissent leur seuil de zizanie** : `Z = 1 + z`. **Volontairement
  le minimum.**
- **Si la partie compte deux joueurs** : **jamais de zizanie**. Conséquence assumée.
- **Si le compte oscille autour de trois voix** : `Z` clignote, mais `Zmém` retient le maximum, donc la
  descente n'en est pas affectée ; la fusion d'épisodes et `FusionMax` règlent le comptage. **Cosmétique.**
- **Si un joueur quitte la pièce ou se déconnecte en pleine zizanie** : `N_z` est recompté à chaque tick ;
  l'épisode continue s'il reste trois voix, sinon il passe en `PendingClose`. **Cosmétique.**
- **Si le contrat se termine pendant un épisode ouvert** : `Committed` si sa durée atteint `DuréeMin`,
  sinon `Discarded` (*Formulas* §4).
- **Si l'hôte se déconnecte en pleine zizanie** : la session s'arrête avec lui, épisodes compris.
  **Cosmétique au MVP**, qui ne score pas les épisodes.
- **Si un objet oscille sur une embrasure** : sa pièce change d'un tick à l'autre, `Z(pièce(o))` avec
  elle ; `Zmém` retient le maximum, et l'épisode est compté par pièce, pas par objet. **Cosmétique.**
- **Si un objet tolérant a `T_objet ≥ 1 + k_z`** : la pièce peut être en zizanie pendant qu'il reste en
  murmure. **Voulu** ; sa descente subit quand même `Zmém`.

### Le portage

- **Si l'objet est posé alors qu'il est chargé** : il n'accumule plus rien, **décharge au silence et
  seulement au silence**, et tient sinon. « On le pose et on se tait. »
- **Si un porteur lâche et que les autres continuent** : la charge est **inchangée**. Elle appartient à
  l'objet.
- **Si tous les porteurs lâchent en pleine charge** : ce qui advient de l'objet lâché appartient au
  **système 9**.
- **Si un porteur lance une recalibration** : le personnage pose ce qu'il porte (système 6) ; la règle
  de l'objet posé s'applique.

### Le conflit avec l'objet à demande sonore

> **Le contrepoids du Pilier 1 entre en collision frontale avec ce système.**

Le système 13 doit porter au moins un objet qui **n'avance que sous émission active**. Or ce système
**punit l'émission**. Un tel objet serait simultanément exigeant en son et alourdi par le son.

**La résolution appartient au système 13** :

| Voie | Ce qu'elle donne |
|---|---|
| **Objet tolérant**, `T_objet` au-delà de 1 | L'objet tolère la parole ; seul un niveau proche du cri le charge. Simple, cohérent, et c'est l'objet témoin du prototype |
| **Exemption totale** de la charge pour ce type | Le plus simple, mais l'objet sort du système |
| **Inversion** — la charge le fait *avancer* au lieu de l'alourdir | Le plus intéressant, et le plus coûteux à spécifier |

**Ce document n'en tranche aucune.** La tâche grossière qui exige du son avant le premier test à
plusieurs — une porte sur une note tenue — n'est pas un objet porté : elle ne passe pas par ce système.

### Numérique et réseau

- **Si la charge vaut exactement le seuil d'avertissement en montant** : l'événement est émis (borne
  incluse) ; la lourdeur est continue. **Aucune discontinuité.**
- **Si la configuration a `Avertissement ≥ Remplissage`**, ou toute autre garde de *Formulas* §3 en échec :
  **configuration refusée au chargement**. **Bloquant si non traité** — `principal` diviserait par zéro.
- **Si un paquet « silence » est perdu** : la dernière trame reçue tient au plus `Expiration`, puis vaut 0.
  **Dégradant, borné.**
- **Si une trame arrive après une trame plus récente** : elle est ignorée. **Cosmétique.**
- **Si la prédiction locale diverge de l'hôte** : **attendu et admis** (ADR-0002). La prédiction ne porte
  que l'avertissement de sa propre voix ; le poids réel vient de l'hôte.
- **Si la voix de l'hôte arrive sans délai réseau** : ses cris entrent dans le calcul du dépassement plus tôt que ceux des
  autres, d'environ un aller simple. **Dégradant, documenté** — un biais d'attribution en faveur des
  clients.
- **Si un co-porteur n'est pas l'hôte** : il sent le poids avec deux allers-retours de retard sur sa propre
  voix. Le client interpole la lourdeur publiée (systèmes 5 et 9). **Dégradant.**
- **Si la cadence réseau est de 20 à 30 Hz** alors que le système 1 produit 50 trames par seconde : la
  décimation du système 5 **conserve le maximum de `Loudness` de l'intervalle**. Une trame nulle n'est
  alors émise que si tout l'intervalle est nul, ce qui préserve le prédicat `SILENCE`. Exigence adressée
  au système 5.
- **Si un client ment sur ses trames ou sur son `r'`** : il peut se rendre inoffensif. **Accepté par
  ADR-0003** — la triche n'est pas un modèle de menace en coop entre amis. Le maximum y est plus sensible
  qu'une somme : un tricheur ne se dilue pas, il disparaît.
- **Si un son du jeu fuit du casque vers le micro** — texture de danger, signal d'avertissement, ambiance
  de zizanie : `Loudness` n'étant pas conditionnée par le voisement, il peut franchir la porte et
  **nourrir la charge qu'il signale**. **Dégradant** ; le prérequis du casque couvre l'essentiel. Le niveau
  de lecture de ces sons est plafonné, et le POC audio s'étend aux effets du jeu (*Visual/Audio
  Requirements*).

## Dependencies

Même distinction que dans les GDD précédents : une **dépendance de conception** empêche de
*spécifier* tant que l'autre ne l'est pas ; une **dépendance d'exécution** empêche de
*fonctionner* une fois en marche.

**Contrairement aux systèmes 1 et 6, celui-ci a deux dépendances de conception non
satisfaites** — le portage et la propagation. C'est ce qui explique les mentions `PROVISOIRE`
du document.

### Le tableau

| Système | Nature | Sens | Interface |
|---|---|---|---|
| **9. Portage** | **DURE — conception, NON satisfaite** | mutuelle | Nous consommons « qui porte quoi » et l'événement porté / posé ; il consomme notre `lourdeur`. **Sans lui, « lourd » n'a pas de définition** |
| **3. Propagation** | **DURE — conception, NON satisfaite** | il nous fournit | Un facteur d'atténuation **par source** à la position de l'objet, **nul au-delà de la portée**. **Sans lui, aucune dimension spatiale** |
| **1. Analyse vocale** | **DURE — exécution** | il nous fournit | `Loudness` par joueur, **nulle sous `Gate_dB`** ; la fonction publique `ToPosition` ; la part `p` de trames nulles (AC-40) |
| **6. Calibration** | **DURE — exécution** | il nous fournit | `r'` de chaque joueur, calculé à chaque commit de profil sur son client |
| **5. Réseau** | **DURE — exécution** | mutuelle | Achemine vers l'hôte la `Loudness` de chaque client et son `r'` ; publie vers les clients l'état des objets ; réplique la configuration de l'hôte |
| **10. Appartement** | **DURE — exécution** | il nous fournit | La partition en pièces et la requête « dans quelle pièce est ce point » |
| 12. Retour local | consommateur | il lit | L'événement d'avertissement prédit pour la voix du joueur local, et son rendu |
| 13. Mobilier réactif | fournisseur de paramètres | il fournit | Les valeurs de `T_objet` par type. *Faux cycle — voir plus bas* |
| 16 / 18. Contrat, résolution | consommateurs | ils lisent | Les **épisodes de zizanie** `Committed`, par pièce |
| 14. Chat vocal | **structurant, sans donnée** | — | **Le premier canal d'attribution.** Sans lui, la charge est anonyme |
| 19. UI diégétique | **structurant, sans donnée** | — | **Le second canal d'attribution** : le Sonomètre |
| 15. Habitant | voisin sonore | — | **Le partage du territoire sonore** : le mobilier sonne en matériaux, l'habitant en organique |

### Les dépendances que l'index ne mentionnait pas

**Les systèmes 1, 6 et 10** sont désormais déclarés dans l'index. **Le système 5 l'est avec
cette révision** : sans l'acheminement de `r'` et de `Loudness` vers l'hôte, les seuils n'ont
aucune donnée d'entrée. **Les systèmes 16 et 18** reçoivent les épisodes de zizanie ; l'index
fait dépendre 18 du seul système 16, et l'arête manquante y est signalée.

### Le faux cycle 11 ↔ 13

L'index fait dépendre 13 de 11, et ce document réclame `T_objet` au système 13. Cela ressemble
à un cycle et n'en est pas un : **nous définissons ce que `T_objet` signifie et comment il agit ;
le système 13 en fournit les valeurs.** Une dépendance de paramètre n'est pas une dépendance de
conception.

---

### Ce que les GDD voisins devront porter

Cohérence bidirectionnelle exigée par les règles du projet. Les systèmes 1 et 6 ont un GDD ; les
autres non.

**Système 1 — Analyse vocale** *(porté, `voice-analysis.md`)*
- `Loudness = 0` exactement sous `Gate_dB` ; `ToPosition` publique, inscrite dans la surface
  d'ADR-0004 ; la table de disponibilité des grandeurs.
- **La part `p`** : le critère AC-40 reçoit d'ici sa cible, `p ≥ 0,84` sous hypothèse
  d'indépendance (*Formulas* §3), à confirmer par la mesure B2.

**Système 3 — Propagation du son**

> **L'exigence la plus structurante de ce document, et elle précède la question des bandes.**
> La propagation doit livrer **une valeur par source**, pas un agrégat. Sans identité de source,
> le dépassement par joueur est incalculable, et **tout le modèle s'effondre** — plus de coupable, plus
> d'attribution. La question antérieure à « scalaire ou bandes » est « agrégé ou par source »,
> et sa réponse n'est pas négociable.

- Être une **requête pure** — le facteur d'une source au point P —, jamais un `SoundManager` à
  inscription d'auditeurs.
- **Couper net au-delà de la portée** : un facteur exactement nul, pas une traîne. Sans cette
  coupure, le régime `SILENCE` est inatteignable dès qu'un joueur parle ailleurs.
- La question **scalaire ou bandes** ne nous concerne pas ; elle décide si le système 13 pourra
  lire `Pitch` et `Continuity`.

**Système 5 — Réseau**
- Acheminer vers l'hôte la `Loudness` de chaque client, et son `r'` à la connexion et à chaque
  recalibration.
- **Décimer vers 20 – 30 Hz en conservant le maximum de `Loudness`** de chaque intervalle, pour
  préserver le prédicat `SILENCE`.
- Publier vers les clients l'état des objets — charge ou lourdeur — ; **ne jamais relayer les
  `VoiceFrame` ni les `r'` des autres joueurs**.
- **Répliquer la configuration de l'hôte**, `γ` compris, vers tous les clients avant la partie
  (OQ-11.13).

**Système 6 — Calibration vocale** *(porté, `voice-calibration.md`)*
- Calculer `r'` au commit et le remettre au système 5. Savoir que `Rest_dB` est un repère de
  gameplay : le système 6 l'écrit.

**Système 9 — Portage d'objets**
- Nous dire **quels objets sont portés et par qui**, et émettre l'événement porté / posé.
- Consommer une `lourdeur ∈ [0 ; 1]` et décider ce qu'elle veut dire — vitesse, inertie, chute.
  **Nous ne le décidons pas.**
- Trancher si `lourdeur = 1` rend le transport **impossible ou seulement pénible**.
- **Prévoir qu'un porteur lâche en cours de transport** — chemin réclamé aussi par le système 6.
- Interpoler côté client la lourdeur publiée par l'hôte.

**Système 10 — Appartement**
- Exposer **une partition franche en pièces** — un point appartient à une pièce et une seule — et
  la requête qui va avec. Un découpage flou rendrait le compte de zizanie ambigu aux endroits où le
  jeu se joue le plus, **les embrasures**.

**Système 12 — Couche de retour local**
- Prédire **l'avertissement de la voix du joueur local, et lui seul** — à partir du dernier état
  publié par l'hôte — ; jamais le poids (ADR-0002).
- **Rendre l'avertissement sur deux canaux** : le son, et un tremblement diégétique de l'objet
  dans les mains (*Visual/Audio Requirements*).

**Système 13 — Mobilier réactif**
- Porter les valeurs de `T_objet` par type ; **résoudre le conflit de l'objet à demande sonore**
  (*Edge Cases*).

**Système 14 — Chat vocal de proximité**
- **Il est le premier canal d'attribution.** Et **aucun son de ce système ne le fait baisser** :
  ducker le chat pendant un avertissement détruirait l'attribution au moment où elle compte.

**Système 15 — Habitant**
- **Territoire sonore** : les sons du mobilier sont des matériaux — bois, ressorts, grincements —,
  ceux de l'habitant sont organiques. Le contrat s'inscrit avant la production des sons, pour que
  le joueur ne confonde jamais « mon meuble s'excite » et « l'habitant m'a entendu ».

**Systèmes 16 et 18 — Boucle de contrat, résolution**
- Compter et présenter les épisodes `Committed`. **Réserve de périmètre** : `mvp-scope.md` pose
  « écran succès / échec, pas d'évaluation détaillée ».

**Système 19 — UI diégétique**
- **Le Sonomètre est le second canal d'attribution.** Il lit `Loudness` — ce que le joueur émet,
  **jamais la charge d'un objet**. Son aiguille est analogique et inerte : imprécise, retardée,
  jamais de seuil affiché.
- **Il ne doit pas être codé par la seule couleur** : un joueur qui porte à reculons dans le noir
  doit le lire par la forme ou le mouvement. Contrat reporté au système 19.
- **On lit celui des autres, jamais le sien.** Le retour sur sa propre voix passe par la réaction
  de l'objet, par l'icône « micro coupé » visible par soi seul, et par l'option d'accessibilité
  « afficher mon volume » (décision F3, conçues par le système 19).

## Tuning Knobs

**Les valeurs sont dans la liste canonique** (*Formulas*, « Porte de mesure du système 11 ») et
nulle part ailleurs. Cette section dit **ce que chaque curseur fait au jeu** et **comment ils se
contrarient**.

### L'arbitrage à exposer avant tous les autres

> **Punir la coopération sans décourager de coopérer.**

Si parler coûte trop cher, les joueurs se taisent : un jeu coopératif silencieux, qui échoue au
Pilier 1 **et** vide l'expérience sociale. Si parler ne coûte presque rien, le Pilier 2 devient
décoratif.

**La pente dangereuse est l'adoucissement, et pour une raison contre-intuitive** : adoucir ce
système rend **le silence plus rentable**, donc aggrave exactement le défaut qu'on croyait
corriger.

> **Le plafond par niveau est un adoucissement, et c'est assumé** (2026-09-18). Il a été adopté
> parce que l'inverse était pire : sous l'ancien modèle, chuchoter finissait par bloquer l'objet,
> donc **se taire était la seule tactique** — le défaut ci-dessus, en pire. Le plafond rend le bas
> de l'échelle jouable ; ce qu'il coûte est écrit en *Formulas* §3, et `Douceur` est le curseur par
> lequel il peut aller trop loin. **À `Douceur` élevée, parler cesse d'avoir une conséquence et le
> Pilier 2 redevient décoratif.**

### Les curseurs

| Curseur | Ce qu'il gouverne | Trop haut | Trop bas |
|---|---|---|---|
| `Avertissement` | Délai de l'événement depuis le calme, à pleine voix | le signal se décroche de sa cause ; au banc, chute nette entre 400 et 430 ms | il se déclenche sur tout, y compris les mots qu'on allait cesser, et cesse d'informer |
| `Remplissage` | Vitesse de la montée, désormais **la même à tous les niveaux** | la faute met trop longtemps à se payer, l'attribution s'étiole | la sanction arrive avant qu'on ait pu réagir |
| `Vidange` | Durée du retour au transportable | une erreur pèse trop longtemps, la partie devient une punition continue | le bruit n'a plus de conséquence durable |
| `Amorçage` | Ralentissement avant l'avertissement | il cesse d'être imperceptible et devient une sanction avant l'heure | plus de préavis physique |
| `h` | Réarmement de l'avertissement | un second cri proche n'avertit plus | l'événement se redéclenche sur une charge qui oscille |
| `k` | Hauteur du plafond du murmure, et plancher du plafond d'alarme | la pré-charge efface l'avertissement du cri qui suit — mesuré à 0,85 | le murmure ne se voit plus, et une voix qui effleure le seuil ne fait plus rien du tout |
| `Douceur` | Permissivité du bas de l'échelle : la destination d'un niveau de voix donné | chuchoter et parler cessent d'avoir des conséquences distinctes ; à 3, une conversation ne déclenche plus rien | le modèle retombe vers le palier : franchir le seuil coûte presque autant qu'un cri |
| `Lenteur` | Vitesse du murmure | le murmure ne fait plus rien, tout devient binaire | chuchoter devient coûteux |
| `T_objet` *(par objet)* | Tolérance de l'objet, en fractions de voix posée | l'objet tolère la conversation : exception délibérée | la fenêtre de murmure se referme sur la porte |
| `k_z` | Seuil de zizanie entre voix posée et cri | la zizanie ne se déclenche jamais | elle se déclenche dès que le groupe hausse le ton, et se confond avec l'alarme |
| `z` | Allongement de la descente par voix au-delà de deux | une zizanie rend la récupération interminable | la panique collective ne se sent pas |
| `DuréeMin` | Durée minimale et écart minimal d'un épisode | des zizanies réelles ne comptent pas | des franchissements fugaces comptent |
| `FusionMax` | Longueur maximale d'un épisode fusionné | dix minutes d'oscillation font un épisode | un épisode continu est découpé |
| `Expiration` | Durée de validité d'une trame reçue | un paquet « silence » perdu fait charger plus longtemps | la gigue réseau fait tomber des cris à 0, donc un faux silence qui décharge |

### Les interactions — tourner un curseur peut en annuler deux

**`Remplissage` gouverne trois autres grandeurs.** `seuil_av = Avertissement / Remplissage`, et le
plafond du murmure vaut `k · seuil_av`. **Changer `Remplissage` change le sens de `Avertissement`** :
les deux se remesurent ensemble.

**`k` contre `Avertissement` — la pré-charge.** Après un murmure, un cri atteint l'avertissement en
`(1 − k) · Avertissement` — 140 ms avec les valeurs actuelles, quel que soit le niveau depuis le
plafond par niveau. Monter `k` rend le murmure plus visible et raccourcit ce délai ; le baisser fait
l'inverse. **Ils se règlent ensemble, sur la lecture de la pré-charge.**

**`T_objet` contre `Lenteur`.** Un `T_objet` bas fait de l'alarme le cas courant, et `Lenteur` ne sert
presque plus. Un `T_objet` haut fait vivre le jeu en murmure, et `Lenteur` devient le curseur
principal.

**`T_objet` contre `k_z`.** L'ordre « alarme d'objet avant zizanie » tient tant que
`T_objet < 1 + k_z`. Baisser `k_z` rapproche la zizanie de la voix posée : les deux signaux se
confondent, un seul signal pour deux idées.

**`Vidange` contre la fréquence du silence — le piège caché.** Le murmure ne décharge pas : seul le
silence total le fait. La descente réelle dure `Vidange / p^N` à `N` joueurs. Dans une équipe
bavarde, une `Vidange` courte peut ne jamais s'appliquer. **Ce curseur ne se règle pas dans
l'abstrait.**

**`z` contre `Vidange`.** À quatre voix, la descente la plus longue vaut `Vidange × (1 + 2z)`. Monter
les deux ensemble fait d'une zizanie une punition sans fin.

**`z` ne touche plus la discrimination du modèle.** Dans la forme « durée », le rapport entre quatre
joueurs modérés et deux bruyants vaut `0,8 / 0,5` quel que soit `z`. **Dans la variante « débit »
comparée au prototype, il s'érode quand `z` monte** : c'est l'un des critères de la comparaison.

**`Expiration` contre le réseau.** Trop court, la gigue produit de faux silences qui déchargent pendant
un cri ; trop long, un silence perdu charge l'objet. La valeur se fixe sur la gigue réelle mesurée par
le système 5.

### Ce qui n'est pas un curseur

- **`N_z ≥ 3`** — une décision de conception. À deux, on ne fait pas une zizanie.
- **La priorité de `SILENCE`, et le fait que seul le silence décharge.** C'est ce qui rend la panique
  collective coûteuse sans paramètre.
- **Le plus grand dépassement en alarme, la somme en murmure.** C'est le modèle.
- **Un plafond de charge par niveau de voix** — chaque niveau a sa destination. `Douceur` se règle ;
  l'existence du plafond, non (2026-09-18).
- **La charge portée par l'objet.** C'est le Pilier 2 en structure de données.
- **Des seuils en positions**, et `γ` hors des seuils.
- **Le plafond sous l'avertissement** — décision E2. `k` se règle, `k < 1` non.
- **L'avertissement comme événement** en production. Le prototype compare les deux sémantiques ; la
  décision qui en sortira ne sera pas un réglage.
- **La zizanie comptée sur la voix brute et par pièce.**
- **Aucun `r'` par défaut.** Une valeur par défaut serait une constante qui juge une voix.

## Visual/Audio Requirements

Le système 1 ne produisait ni image ni son ; le système 6 en produit pour un écran de réglage.
**Celui-ci en produit dans le jeu, en permanence, et c'est par là que le joueur apprend.**

La section reste au niveau **exigence** — ce qui doit être perçu, jamais à quoi cela ressemble.

### L'avertissement se perçoit sans regarder — et sans entendre seulement

**Le joueur regarde où il va, pas le canapé qu'il porte.** Il traverse un couloir sombre à
reculons, surveille une porte, cherche son coéquipier.

> **Un signal visuel sur l'objet arriverait dans un angle mort.** L'avertissement est porté par le
> **son** et par le **mouvement de l'objet dans les mains**, pas par un effet qu'il faut avoir dans
son champ de vision.
>
> **Et il doit être ample.** Au prototype, le tremblement de caméra est passé inaperçu au premier
> essai, son coupé ; **doublé**, il a été remarqué (2026-09-18). Un tremblement « discret et
> élégant » est un avertissement raté pour qui n'entend pas.

**Et le son seul ne suffit pas.** Un joueur sourd ou malentendant n'a pas d'haptique au clavier et à
la souris, et l'amorce de lourdeur est imperceptible par définition. **L'avertissement est donc
multimodal** : un son **et** un tremblement diégétique — de l'objet, ou un micro-tremblement de la
caméra. Le prototype le joue **sans le son**, pour vérifier qu'il est remarqué. Une option
d'accessibilité peut **amplifier** ce tremblement ; elle n'ajoute aucune information. Le rendu
appartient au système 12.

- **Aucune latence ajoutée.** Ni fondu d'entrée, ni montée progressive avant que le signal soit
  perceptible : le délai de l'avertissement est déjà tout le budget.
- **Distinct du poids.** L'avertissement dit *« ça commence »*, le poids dit *« c'est arrivé »*.
- **Il doit inquiéter, pas informer.** Un meuble qui grince quand on parle trop fort satisfait
  l'exigence et le genre en même temps ; un bip neutre raterait le jeu.

### Trois états sonores, parce que l'avertissement est un événement

| État | Quand | Nature |
|---|---|---|
| **Frémissement** | Charge sous `seuil_av` et non nulle — murmure, ou début d'alarme | Continu, discret, **s'installe** plutôt qu'il ne monte |
| **Texture de danger** | Tant que la charge est au-dessus de `seuil_av` | Continue. **Atteignable seulement après une alarme**, puisque le murmure plafonne dessous |
| **Signal d'avertissement** | Au front montant, une fois, réarmé selon `h` | Bref, attaque courte, **plusieurs variantes** pour ne pas lasser |

**Le murmure et l'avertissement ne se confondent jamais, par construction** : la formule interdit au
murmure d'atteindre la texture de danger.

### Règles de mix

- **Attaque courte** pour le signal d'avertissement.
- **Spectre hors des formants vocaux** : le mobilier ne doit pas masquer les voix qui sont le canal
  d'attribution.
- **Aucun ducking du chat vocal.**
- **Émetteur ancré à l'objet**, spatialisé : on entend *quel* meuble s'excite.
- **Niveau de lecture plafonné** pour les sons de ce système et l'ambiance de zizanie : un casque
  fuit, et `Loudness` n'est pas conditionnée par le voisement — un grincement repris par le micro
  nourrirait la charge qu'il signale. **Le POC audio s'étend aux effets du jeu.** « Aucun contenu
  tonal » ne suffit pas.
- **Territoire sonore** : matériaux pour le mobilier, organique pour l'habitant (système 15).

### Le poids ne se lit pas, il se sent

**Aucune jauge, aucune barre, aucun chiffre.** La lourdeur se perçoit dans la manœuvre — l'objet
répond moins vite, tourne mal, résiste.

> Une jauge de charge deviendrait **un instrument à optimiser** : les joueurs la regarderaient au
> lieu d'écouter, et joueraient contre un nombre plutôt que contre leur propre voix. **Le banc
> affichait une barre de charge** : c'est l'un des écarts qui font des 350 ms une valeur provisoire.

**Corollaire pour le système 12** : sa prédiction porte l'avertissement, **jamais un verdict
annoncé** (ADR-0002).

### La zizanie doit se sentir avant d'être facturée

- **Un signal d'ambiance, pas un panneau.** C'est l'atmosphère de la pièce qui bascule.
- **Distinct de l'avertissement d'objet** : l'un dit « ce meuble te punit », l'autre « la pièce part
  en vrille ».
- **Le seuil reste invisible**, et l'ambiance **ne doit pas se nourrir d'elle-même** par la fuite du
  casque (règles de mix).

### L'attribution a deux canaux, tous deux diégétiques

**Par la voix** — le chat de proximité. Le joueur entend qui panique, et comprend au même instant que
le meuble s'alourdit. C'est le canal immédiat, celui qui porte la comédie.

**Par le Sonomètre** — le boîtier à aiguille porté sur le torse de chaque personnage (GDD canonique
§ 2.4.5), *« lisible par tous »*. **On lit celui des autres, jamais le sien.** Ce n'est pas un
marqueur d'interface : c'est un objet porté, qu'on lit en le regardant comme on lirait une
expression.

**Le Sonomètre règle l'attribution, pas l'avertissement.** Un joueur malentendant voit quelle aiguille
part dans le rouge ; il ne reçoit pas, par elle, l'instant où son propre meuble s'excite. C'est ce
que couvre le tremblement diégétique.

**Et sur soi ?** Ce qui apprend à un joueur son propre écart, c'est **la réaction de l'objet qu'il
porte**. Un micro mort, en revanche, ne se sent pas : l'icône « micro coupé » visible par soi seul et
l'option « afficher mon volume » (système 19, décision F3) couvrent ce que le corps ne détecte pas.

### Ce qu'on ne montre jamais

- **La charge**, sous quelque forme chiffrée ou graduée que ce soit.
- **Les seuils** — ni celui de l'objet, ni celui de la zizanie.
- **Un verdict prédit** — « tu vas lâcher », « plus que 2 secondes ».
- **Le coupable, par un surlignage d'interface.** La voix et le Sonomètre le disent depuis le monde.

## UI Requirements

**Ce système n'a presque pas d'interface, et c'est un résultat, pas un oubli.** Tout ce qu'il produit
passe par le monde.

### Ce qui vient de nous et n'est pourtant pas de l'UI

| Ce que le joueur perçoit | Où ça vit |
|---|---|
| L'objet s'excite | Son et tremblement de l'objet — systèmes 12 et 13, direction audio |
| L'objet est lourd | La manœuvre elle-même — système 9 |
| La pièce part en vrille | Ambiance de scène — direction audio |
| Qui est le coupable | Sa voix, par le chat — système 14 ; son Sonomètre — système 19 |

### Le seul écran concerné, et il ne nous appartient pas

**La résolution de fin de contrat** peut afficher les épisodes de zizanie. Nous produisons
l'événement ; **le système 18 décide de sa présentation**. Un score chiffré est hors MVP tel
qu'écrit ; ne pas l'afficher ne ferme aucune porte.

### Accessibilité — trois questions distinctes

La version précédente de ce document déclarait la question close par le Sonomètre. **Il répondait à
la plus facile des trois.**

| Question | État |
|---|---|
| **Qui a chargé l'objet ?** — attribution | **Couverte** par la voix et le Sonomètre, diégétiques et identiques pour tous. Reste le contrat « pas de couleur seule » vers le système 19 |
| **Quand mon objet s'excite-t-il ?** — avertissement minuté | **Couverte par l'exigence multimodale** : son et tremblement diégétique, tremblement amplifiable en option. À vérifier au prototype, son coupé |
| **Ma voix passe-t-elle ?** — retour sur soi | **Couverte hors de ce système** : icône « micro coupé » et option « afficher mon volume » du système 19 |

**Ouvertes, et nommées** (*Open Questions*) : un rythme de charge et de décharge réglable en option,
une option contre les sons soudains, un canal de coordination non vocal, la santé vocale et la
dysarthrie face à un jeu où le chuchotement est le registre sûr.

### Ce qu'aucun écran ne doit jamais montrer

Rappelé ici parce que c'est à l'UI qu'on demandera ces affichages, et qu'ils paraîtront tous
raisonnables au moment où on les demandera : **la charge** ; **les seuils** ; **un verdict prédit** ;
**le coupable** par un surlignage.

### Outillage — hors jeu, mais nécessaire

Aucune valeur de ce document n'a été éprouvée à plusieurs. Les régler exigera de les modifier
**pendant une partie à plusieurs**, pas entre deux compilations.

Un **panneau de réglage en direct** est donc un **prérequis de playtest**. **En réseau, c'est l'hôte
qui le possède et le réplique** : un client dont les curseurs diffèrent de l'hôte prédirait un
avertissement que l'hôte ne confirme pas, et un `γ` différent fausserait ses positions. Le
propriétaire de ce panneau et la forme de la réplication sont à fixer par un ADR avant le premier
test Unity en réseau (OQ-11.13).

## Acceptance Criteria

### Ce qu'un critère doit valoir ici

Mêmes étiquettes que dans les GDD précédents : `[UNIT]` automatisable hors Unity et bloquant ·
`[INTEG]` plusieurs systèmes, bloquant · `[HUMAIN]` playtest, consultatif sauf mention ·
**`[BLOQUÉ]`** dépend d'un système qui n'a pas de GDD, avec son propriétaire et son déclencheur ·
**EN ATTENTE** écrit, non exécutable tant que la dépendance nommée n'est pas levée.

**Presque tout est `[UNIT]`** : charge, régimes, seuils, combinaison, lourdeur, avertissement et
zizanie sont de l'arithmétique pure. **Contrat d'injection, valable pour tous** : chaque test reçoit
ses contributions, ses `r'`, son horloge virtuelle à pas fixes et sa configuration **par injection** —
jamais `Time.deltaTime`, jamais une constante compilée, jamais un système voisin réel.

> **Structure en unitaire, valeur en playtest.** Pour les grandeurs qui se **dérivent** — temps de
> charge, seuils, délai d'avertissement —, le test calcule sa valeur attendue depuis la constante
> nommée. Pour les seuils de ressenti — `k_z`, `z`, `Lenteur`, les durées d'épisode —, le test vérifie
> une **propriété de structure**, jamais une valeur.

**Les identifiants sont stables.** Un critère réécrit garde son numéro ; les critères ajoutés prennent
la suite (*Revision History*).

---

### A — Seuils, positions, régime

| # | Critère | Type |
|---|---|---|
| VO-01 | GIVEN `r'_i` et `T_objet ≤ 1` THEN `Seuil_i = T_objet · r'_i` ; GIVEN `1 < T_objet ≤ 2` THEN `Seuil_i = r'_i + (T_objet − 1)(1 − r'_i)` ; GIVEN `T_objet = 2` THEN `Seuil_i = 1` ; les deux branches coïncident à `T_objet = 1` | `[UNIT]` |
| VO-37 | GIVEN toutes les contributions exactement nulles THEN régime **`SILENCE`**, quels que soient `T_objet` et les `r'` | `[UNIT]` |
| VO-02 | GIVEN au moins une contribution non nulle et toutes les positions sous leur seuil THEN régime **murmure** | `[UNIT]` |
| VO-03 | GIVEN au moins une position `x_i ≥ Seuil_i` — **borne incluse** — THEN régime **alarme** | `[UNIT]` |
| VO-38 | **`γ` ne déplace aucun seuil.** GIVEN une même position de voix, encodée en `Loudness` puis ramenée par `ToPosition` sous deux valeurs de `γ` injectées identiquement côté client et côté hôte THEN le régime est **identique** | `[UNIT]` |
| VO-39 | GIVEN `T_objet < 1 + k_z` THEN `Seuil_i < T_ziz,i` pour des `r'` échantillonnés sur `]0 ; 1[` — propriété, aucune valeur figée | `[UNIT]` |
| VO-04 | GIVEN un joueur `Uncalibrated`, `Degraded` ou en calibration, **ou dont l'hôte n'a pas reçu `r'`** THEN sa contribution vaut 0 : il ne déclenche aucune alarme et ne pèse pas dans la somme | `[UNIT]` |
| VO-05 | GIVEN un `r'` modifié entre deux ticks THEN le seuil change **au second tick** — relu, jamais mis en cache — et **aucune charge n'est recalculée rétroactivement** | `[UNIT]` |
| VO-40 | GIVEN une configuration où `Avertissement ≥ Remplissage`, ou `k`, `h`, `k_z` hors de `]0 ; 1[`, ou `T_objet` hors de `]0 ; 2]`, ou `Lenteur < 1` THEN elle est **refusée au chargement** | `[UNIT]` |

### B — Régime murmure

| # | Critère | Type |
|---|---|---|
| VO-06 | GIVEN murmure et `charge < Plafond` THEN `charge` monte de `L_mur · dt / (Remplissage × Lenteur)`, bornée au plafond | `[UNIT]` |
| VO-07 | **Non-régression obligatoire.** GIVEN une charge de 0,60 héritée d'une alarme, régime murmure actif THEN `charge` **reste à 0,60**. Toute implémentation écrivant `charge = min(charge, Plafond)` échoue | `[UNIT]` |
| VO-08 | GIVEN quatre voix murmurant indéfiniment THEN `charge` converge vers `Plafond` **sans jamais le dépasser** | `[UNIT]` |
| VO-09 | **Le murmure n'avertit jamais.** GIVEN **toute configuration valide**, échantillonnée THEN `Plafond < seuil_av` ; en murmure pur, aucun événement d'avertissement n'est émis et `lourdeur ≤ k · Amorçage` | `[UNIT]` |

### C — Régime alarme et zizanie

| # | Critère | Type |
|---|---|---|
| VO-10 | GIVEN `N_z < 3` THEN `Z = 1` | `[UNIT]` |
| VO-11 | GIVEN `N_z ≥ 3` **dans la pièce de l'objet**, comptés sur `xb_i ≥ T_ziz,i` THEN `Z = 1 + z · (N_z − 2)` | `[UNIT]` |
| VO-11b | GIVEN trois hurleurs **dans trois pièces différentes** THEN **aucune zizanie nulle part** | `[UNIT]` |
| VO-11c | GIVEN deux objets **dans la même pièce** THEN ils subissent **la même** `Z` | `[UNIT]` |
| VO-12 | GIVEN `N_z` croissant THEN `Z` **croît strictement** — propriété de structure | `[UNIT]` |
| VO-13 | GIVEN l'alarme THEN la vitesse de montée vaut `dt / Remplissage`, **indépendante du niveau et de `Z`** ; GIVEN la variante « débit » activée par configuration THEN le pas est multiplié par `Z(pièce)`, **sans borne `min(1, …)`** | `[UNIT]` |
| VO-14 | **Aucune voix n'est invisible.** GIVEN deux joueurs en alarme WHEN le plus fort se tait THEN si le second est au seuil, la charge **continue de monter** ; s'il est sous le seuil, le régime passe en murmure et la charge **tient** | `[UNIT]` |
| VO-15 | **Punition par la descente.** GIVEN quatre hurleurs qui passent un par un **sous leur porte** THEN la charge **ne décroît pas** tant qu'une contribution reste non nulle, et décroît dès que la dernière est nulle | `[UNIT]` |
| VO-16 | GIVEN le calcul de `N_z` THEN il lit la position du `Loudness` **brut**, jamais `L_i` | `[UNIT]` |
| VO-41 | GIVEN un objet ayant traversé une zizanie `Z = 1 + z`, puis le silence THEN la descente depuis le plein dure `Vidange × (1 + z)` ; GIVEN la charge revenue à 0 THEN `Zmém = 1` et la descente suivante dure `Vidange` | `[UNIT]` |
| VO-52 | **Le plafond par niveau.** GIVEN une voix tenue au-dessus du seuil THEN la charge monte à `dt / Remplissage` jusqu'à `max(Plafond_mur, e^Douceur)` et **n'y monte plus** ; GIVEN une charge héritée supérieure à ce plafond THEN elle est **inchangée** — le plafond ne rabat jamais | `[UNIT]` |
| VO-53 | **Pas d'inversion à la frontière.** GIVEN `x_i = Seuil_i` exactement — `e = 0` THEN le plafond vaut celui du murmure ; GIVEN une voix juste sous le seuil et une voix juste au-dessus THEN la seconde ne charge **jamais moins** que la première | `[UNIT]` |
| VO-54 | **L'avertissement est une porte de niveau.** GIVEN `e^Douceur < seuil_av` maintenu THEN **aucun avertissement n'est émis**, quelle que soit la durée ; GIVEN `e^Douceur ≥ seuil_av` depuis le calme THEN il tombe à `Avertissement` exactement, indépendamment du niveau | `[UNIT]` |
| VO-55 | **Le coupable est le plus grand dépassement.** GIVEN deux joueurs, le premier plus fort en `Loudness` mais moins au-dessus de son propre seuil THEN le coupable désigné est **le second** | `[UNIT]` |

### D — Silence, objet posé, discrimination

| # | Critère | Type |
|---|---|---|
| VO-17 | GIVEN `SILENCE` THEN `charge −= dt / (Vidange × Zmém)`, **indépendamment de la charge précédente**. **Témoin d'atteignabilité** : GIVEN quatre joueurs dont le `Rms_dB` est **sous leur `Gate_dB`**, passés par la formule de `Loudness` du système 1 — pas des zéros injectés — THEN le régime est `SILENCE` et la charge descend | `[UNIT]` |
| VO-31 | GIVEN un objet marqué **posé** par injection THEN il n'accumule rien quelles que soient les voix, **décharge en `SILENCE` seulement**, et tient sinon. *L'événement porté / posé réel : `[BLOQUÉ]` système 9, déclencheur : son GDD* | `[UNIT]` |
| VO-18 | GIVEN 4 joueurs à `L = 0,5` en alarme THEN le temps de charge pleine vaut `Remplissage / 0,5`, **dérivé de la constante** | `[UNIT]` |
| VO-19 | GIVEN 2 joueurs à `L = 0,8` THEN le temps vaut `Remplissage / 0,8` | `[UNIT]` |
| VO-20 | **La propriété qui a fait rejeter le modèle précédent.** GIVEN VO-18 et VO-19 THEN leur rapport vaut `0,8 / 0,5`, **calculé**, et il est **identique à `z = 0` et à `z = 1`** dans la forme « durée » | `[UNIT]` |

### E — Avertissement et poids

| # | Critère | Type |
|---|---|---|
| VO-21 | GIVEN `charge = 0` THEN `lourdeur = 0` ; GIVEN `charge = 1` THEN `lourdeur = 1` | `[UNIT]` |
| VO-22 | GIVEN `charge = seuil_av` THEN `lourdeur = Amorçage` **exactement** | `[UNIT]` |
| VO-23 | **Les 350 ms sont devenus une constante, sous condition de niveau.** GIVEN un niveau dont le plafond atteint `seuil_av` THEN l'événement survient après `Avertissement` exactement depuis une charge nulle, et après `(1 − k) · Avertissement` depuis `Plafond_mur` — **indépendamment du niveau** ; GIVEN un niveau dont le plafond reste sous `seuil_av` THEN **aucun événement**. Le test lit les constantes nommées ; une assertion en dur à « 350 ms » échoue la revue | `[UNIT]` |
| VO-42 | **L'avertissement est un événement.** GIVEN une charge qui franchit `seuil_av` en montant THEN **un** événement ; GIVEN une charge qui oscille ensuite entre `seuil_av · (1 − h)` exclu et 1 THEN **aucun autre** ; GIVEN une redescente strictement sous `seuil_av · (1 − h)` puis un nouveau franchissement THEN **un second** événement. Borne exacte : `charge = seuil_av` en montant → émis | `[UNIT]` |

### F — La zizanie comme épisode

| # | Critère | Type |
|---|---|---|
| VO-24 | GIVEN une horloge virtuelle et un épisode de `1,4 × DuréeMin` simulées THEN il est `Committed` | `[UNIT]` |
| VO-25 | GIVEN un épisode de `0,6 × DuréeMin` THEN il est `Discarded` | `[UNIT]` |
| VO-26 | GIVEN deux épisodes séparés d'un écart **strictement inférieur** à `DuréeMin` THEN ils n'en font qu'un ; GIVEN un écart **égal** à `DuréeMin` THEN deux ; GIVEN un compte qui oscille entre trois et deux voix toutes les 0,4 s pendant dix minutes THEN **aucun épisode ne dépasse `FusionMax`** | `[UNIT]` |
| VO-43 | GIVEN une fin de contrat pendant un épisode `Open` ou `PendingClose` THEN `Committed` si sa durée atteint `DuréeMin`, sinon `Discarded` | `[UNIT]` |

### G — Réseau et architecture

| # | Critère | Type |
|---|---|---|
| VO-44 | GIVEN la dernière trame d'un joueur plus vieille que `Expiration` sur l'horloge injectée de l'hôte THEN sa contribution vaut 0 ; GIVEN une trame arrivée après une trame plus récente THEN elle est ignorée | `[UNIT]` |
| VO-45 | **Données du client.** GIVEN les types de données de la prédiction côté client THEN ils ne contiennent **ni la `Loudness` ni le `r'` d'un autre joueur** — inspection des types | `[UNIT]` par inspection |
| VO-46 | **Point d'extension.** GIVEN la boucle de mise à jour THEN la combinaison passe **uniquement** par `IVoiceCombiner` ; basculer la variante « débit » ne modifie aucune ligne de la boucle — inspection statique, comme le test de surface publique du système 1 | `[UNIT]` par inspection |
| VO-NET-01 | **La prédiction locale ne pilote jamais la physique.** GIVEN une prédiction client divergente de l'hôte THEN la lourdeur appliquée à l'objet est **celle de l'hôte** ; la prédiction ne pilote que le rendu de l'avertissement. **EN ATTENTE** du système 5 | `[INTEG]` |
| VO-47 | GIVEN un client dont la configuration diffère de l'hôte THEN elle est **remplacée** par celle de l'hôte avant la partie, `γ` compris. **EN ATTENTE** de l'ADR de réplication (OQ-11.13) | `[INTEG]` |

### H — Ce qui exige des humains

Chaque critère vaut sur **au moins deux sessions**, et « la majorité » s'entend des testeurs de chaque
session.

| # | Critère | Type |
|---|---|---|
| VO-27 | GIVEN quatre joueurs réels WHEN l'un panique et crie THEN la majorité **identifie qui** a alourdi l'objet — par sa voix ou par son Sonomètre | `[HUMAIN]` |
| VO-28 | GIVEN un joueur qui chuchote THEN la majorité rapporte un **frémissement perceptible**, et **aucun** ne rapporte d'alerte ni de poids | `[HUMAIN]` |
| VO-29 | GIVEN une session complète à plusieurs THEN la majorité rapporte **avoir perçu et exploité l'avertissement** pour se taire à temps, et **aucun** ne le juge imperceptible. *Hypothèse à réfuter* | `[HUMAIN]` |
| VO-30 | GIVEN une zizanie en cours THEN la majorité **sait qu'elle y est** avant de la voir à l'écran de fin | `[HUMAIN]` |
| VO-48 | GIVEN le son du jeu **coupé** THEN la majorité remarque l'avertissement **par le tremblement seul** | `[HUMAIN]` |
| VO-49 | GIVEN un cri qui suit un murmure THEN les testeurs disent si l'objet leur a paru « déjà nerveux » ou si « l'avertissement a disparu » ; **la seconde réponse majoritaire est un échec** qui rouvre `k` | `[HUMAIN]` |
| VO-50 | GIVEN chaque écran et chaque HUD du jeu THEN aucun n'affiche la charge, un seuil, un verdict prédit, ni un coupable surligné — inventaire en liste blanche | `[HUMAIN]` + relecture |
| VO-51 | GIVEN un avertissement pendant une conversation THEN le chat vocal **n'est jamais atténué**, et la voix des coéquipiers reste intelligible | `[HUMAIN]` |

### I — Bloqués par un système sans GDD

| # | Critère | Bloqué par | Déclencheur |
|---|---|---|---|
| VO-32 | Les porteurs subissent **la même** lourdeur | **9** | GDD du portage |
| VO-33 | Un porteur qui lâche ne change pas la charge ; le sort de l'objet lâché | **9** | GDD du portage |
| VO-34 | À `Loudness` égal, le plus éloigné contribue moins ; **au-delà de la portée, exactement 0** | **3** | GDD de la propagation |
| VO-35 | GIVEN un objet à cheval sur une embrasure THEN **la pièce de l'objet** détermine sa zizanie | **9 et 10** | GDD du portage et de l'appartement |
| VO-36 | GIVEN un objet franchissant une porte pendant une zizanie THEN `Z(pièce(o))` change au passage, et `Zmém` retient le maximum | **10** | GDD de l'appartement |

---

### Ce que ces critères ne couvrent pas

1. **Les seuils de ressenti n'ont pas de critère de valeur, par construction.** `k_z`, `z`, `Lenteur`,
   `DuréeMin`, `FusionMax` ne se dérivent d'aucune formule. La valeur appartient au playtest.
2. **La part `p` de trames nulles** : sa cible se dérive ici, sa valeur se mesure au système 1 (AC-40),
   EN ATTENTE de B2.
3. **La sémantique de l'avertissement** : la production spécifie un événement, le prototype compare
   les deux ; si le propriétaire retient l'autre, VO-42 et VO-23 se réécrivent.

### Les cas difficiles

**Les 350 ms.** Bannir toute assertion à valeur unique, exiger un test paramétré, y compris depuis le
plafond. Et ne jamais écrire « mesuré » sans la provenance (*Formulas* §6).

**Le plafond du murmure.** VO-07 défend « pour récupérer, il faut se taire » ; VO-09 défend « le
murmure n'avertit jamais » **sur toute configuration valide**, pas sur la seule configuration de
référence.

**L'atteignabilité du silence.** Un `SILENCE` vérifié par des zéros injectés ne prouve rien : VO-17
passe par la formule du système 1. La part réelle de trames nulles reste une mesure.

**L'épisode de zizanie.** L'horloge virtuelle règle la stabilité ; `FusionMax` règle la fusion non
bornée.

### Ce qui reste hors de portée d'une machine

Le ressenti de l'avertissement et de la pré-charge, l'attribution sociale, la lisibilité du frémissement
— et **tout ce qui suppose plusieurs joueurs calibrés**, jamais éprouvé. Aucune métrique ne remplace la
question *« est-ce drôle, ou est-ce frustrant ? »*.

## Open Questions

### Comment lire cette section

Même classement que dans les GDD précédents — par **ce que la question empêche**. Les identifiants sont
stables.

**Le modèle est fermé sur le papier, pas dans le jeu.** La version précédente affirmait que ce document
« ne se doit aucune décision » ; la revue a trouvé six contradictions internes. Ce qui reste ouvert chez
nous se tranche **au prototype étendu** — la sémantique de l'avertissement, la variante de zizanie, la
pré-charge, l'objet tolérant. Le reste vient des voisins.

---

### Bloqué par un voisin qui n'a pas de GDD

| # | Question | Chez qui |
|---|---|---|
| OQ-11.1 | **Ce que « lourdeur = 1 » veut dire mécaniquement**, et si cela rend le transport **impossible ou seulement pénible**. Le plafond par niveau change la donne : un poids plein ne s'obtient plus qu'en criant, donc rarement et brièvement — un blocage total y serait plus supportable qu'auparavant | **9 — Portage** |
| OQ-11.2 | **La forme et la portée de l'atténuation**, et ses exigences préalables : **une valeur par source**, **une coupure nette** | **3 — Propagation** |
| OQ-11.3 | **La partition en pièces**, et la requête « dans quelle pièce est ce point » | **10 — Appartement** |
| OQ-11.4 | **Le point de référence d'un objet** pour déterminer sa pièce — décisif dans les embrasures | **9 et 10** |

### Bloque le code

| # | Question | Chez qui |
|---|---|---|
| OQ-11.13 | **Réplication de la configuration** par l'hôte, `γ` compris, et **propriétaire du panneau de réglage en direct**. Sans elle, les positions d'un client divergent et le seul test Unity en réseau est faux | **ADR neuf**, technical-director, avant le premier test Unity en réseau |
| OQ-11.14 | **L'horloge de l'hôte** : cadence du tick, fil d'exécution, datation des trames à réception | ADR du fil d'exécution de l'analyse et de la remise des trames, technical-director ; système 5 |

### Bloque le réglage

#### OQ-11.5 — Aucune valeur n'a été éprouvée sous ce modèle

| Famille | Valeurs | Méthode |
|---|---|---|
| **À remesurer sous le nouveau modèle** | `Avertissement`, `Remplissage`, `Vidange`, `Amorçage`, `h`, `k`, `Lenteur` | Prototype étendu, une variable à la fois — la méthode du banc a fonctionné |
| **Seuils de ressenti** | `T_objet`, `k_z`, `z`, `DuréeMin`, `FusionMax` | Prototype à trois voix simulées, puis playtest ; les tests unitaires ne vérifient que la structure |
| **Réseau** | `Expiration` | Gigue réelle, système 5 |
| **Chez le système 1** | `p` | Étape de silence du prototype (B2) |

> **Rappel de couplage** : `Remplissage` fixe le sens de `Avertissement` et la hauteur du plafond.
> Ils se remesurent ensemble.

---

### Le risque qui domine tous les autres

#### OQ-11.6 — Le paradoxe central n'a jamais été éprouvé

Ce système repose sur une thèse que rien ne valide : **qu'on peut punir la parole sans que les joueurs
cessent de parler.**

Si le coût s'avère trop élevé, les joueurs se taisent — un jeu coopératif silencieux qui échoue au
Pilier 1 *et* vide l'expérience sociale. Le mode d'échec est traître : **il ressemble à de la
maîtrise.** Une équipe silencieuse et efficace paraît avoir bien joué.

**Le contrepoids n'existe pas encore**, mais son absence ne peut plus passer inaperçue : `mvp-scope.md`
interdit tout verdict sur le plaisir d'un test à plusieurs sans **au moins une tâche qui exige du son**
(décision du propriétaire du 2026-09-15).

> **C'est le seul point de ce document qui puisse invalider le jeu plutôt que le système.**

#### OQ-11.7 — La combinaison est du raisonnement, pas de la mesure

Trois régimes, un maximum, une somme plafonnée, une zizanie par pièce qui allonge la descente : **rien
de tout cela n'a été ressenti.** Le rapport de 1,6 entre quatre joueurs modérés et deux bruyants est
calculé ; un rapport calculé n'est pas un ressenti vérifié.

#### OQ-11.20 — Le seuil ancré sur le chuchotement : un second scalaire, ou rien

**Mesuré** (*Formulas* §1, « Le chuchotement mesuré ») : avec `Seuil = T_objet · r'`, les pointes
d'un chuchotement réel passent en alarme sur un objet ordinaire, et sa médiane y passe sur un objet
fragile. **Le registre que le Pilier 1 protège n'a pas de marge.** La variante ancrée
`Seuil = w + T_objet · (r' − w)` la lui rend — seuil à 0,464 au lieu de 0,376, environ 5 dB.

Ce qu'il faut trancher, et ce n'est pas seulement un réglage :

| | Garder `T · r'` | Passer à l'ancrage sur `w` |
|---|---|---|
| Réseau | un scalaire par joueur, décision E5 d'ADR-0003 intacte | **deux** — ADR-0003 à amender |
| Chuchotement | classé en alarme dès qu'il souffle, **mais** ne charge presque rien depuis le plafond par niveau | classé en murmure, médiane et pointes |
| Ce qui reste faux | le coupable désigné et le Sonomètre pointent quelqu'un qui chuchote | `w` dépend de ce que le joueur appelle « chuchoter » ce jour-là |
| Chaîne de capture écrasée | sans effet | **dégénère** : si le chuchotement arrive au niveau de la voix, `w → r'` et le seuil revient à `r'` |

**Le plafond par niveau a désamorcé l'urgence** : être en alarme en chuchotant coûte 0,03 de charge
et aucun avertissement. Ce qui reste est une question de **justesse du classement**, pas de
punition — ce qui rend la question moins pressante, et pas moins réelle.

**Ce qui la tranchera** : le test à plusieurs humains, où l'attribution se vit. Un joueur montré du
doigt par le Sonomètre alors qu'il chuchotait est un défaut que le solo ne peut pas révéler.

#### OQ-11.21 — La décision E4 se joue à quelques centièmes de `r'`

Sous le plafond par niveau, une conversation posée ne déclenche l'avertissement d'un objet ordinaire
que si `r' ≥ 0,50` (*Formulas* §5). Les deux profils réels mesurés tombent **de part et d'autre** :
0,474 et 0,537.

E4 disait « une conversation soutenue près d'un objet ordinaire doit rester inconfortable ». Telle
quelle, la règle est devenue **dépendante du profil vocal du joueur** : deux joueurs côte à côte,
même comportement, verdicts différents. Trois curseurs la déplacent — `Douceur`, le rapport
`Avertissement / Remplissage`, et `T_objet` par objet — et le choix appartient au propriétaire, pas
au document.

#### OQ-11.22 — Déplacer la contrainte vers le chat vocal

Piste du propriétaire, 2026-09-18 : **ne pas exiger le chuchotement pour la physique** — seuils
permissifs — et **filtrer le chat vocal** pour que les joueurs doivent parler fort pour s'entendre.
Ce ne sont plus les objets qui obligent à se taire, c'est **le besoin d'être compris** qui oblige à
parler ; les objets facturent.

**Ce que ça apporte** : la mesure n'a plus besoin d'être fine, donc un micro qui écrase la dynamique
cesse d'être un problème ; le dosage devient continu ; le chuchotement redevient une tactique.

**Ce que ça coûte** : un chat externe — Discord — contourne toute la contrainte, qui serait alors la
seule ; l'intelligibilité baisse pour les joueurs malentendants et les non-natifs ; l'attribution
s'affaiblit, puisque la voix en est le premier canal ; et **le Pilier 1 change de formulation**.

**Ce n'est pas notre question à trancher** : elle appartient au système 14 pour le filtre, à
`game-concept.md` pour le pilier et à `mvp-scope.md` pour le chat de proximité, qui deviendrait
bloquant. Elle est ici parce que **nos seuils en dépendent** : permissifs sous cette piste, mesurés
sans elle. Un curseur de filtre existe au prototype ; ce que le joueur doit faire pour être entendu
**ne se teste qu'à plusieurs**.


### Ce que le prototype étendu a fait, et ce qu'il n'a pas pu faire

**Phase solo close le 2026-09-18** — `prototypes/charge-vocale-etendue/`, cinq essais, journaux dans
`sessions/`. Le README porte le détail ; voici ce qui remonte ici.

| Fait | Résultat |
|---|---|
| Mini-calibration avec l'objet qui s'alourdit, **point « chuchotement »** | Le chuchotement n'a pas de marge avec `T · r'` (§1) |
| Les deux sémantiques de l'avertissement (E1) | **Non fait** — la comparaison aveugle n'a pas été menée |
| Les deux variantes de zizanie | « Durée » jugée juste une fois, sur un épisode de 3,9 s ; jamais comparée à « débit » en aveugle |
| Le micro-tremblement, joué sans le son | **Remarqué, après avoir doublé l'amplitude** (*Visual/Audio Requirements*) |
| La lecture de la pré-charge (VO-49) | « Déjà nerveux » à `k = 0,6` ; « l'avertissement a disparu » à 0,85 → `k` corrigé |
| Le régime alarme en chuchotant et en parlant | **Brutal en bas d'échelle** → plafond par niveau (*Formulas* §3) |
| Un objet témoin tolérant, `T_objet ≥ 1` (E4) | **Non fait** |
| La mesure de `p` sur l'étape de silence | **Non faite** sans traitement de casque |

**Ce que ça ne teste pas, et ça n'a pas changé** : le social — l'attribution entre vrais joueurs, la
comédie, la zizanie vécue, la même pièce. C'est l'objet du test à plusieurs humains, **dont une
session dans la même pièce**, condition bloquante de `mvp-scope.md`. S'y ajoutent désormais le
plafond par niveau à plusieurs voix (OQ-11.6), le seuil ancré (OQ-11.20) et le filtre du chat
(OQ-11.22).


### Appartient ailleurs

| # | Question | Chez qui |
|---|---|---|
| OQ-11.8 | **Le conflit de l'objet à demande sonore** — trois voies en *Edge Cases*, aucune tranchée | **13** |
| OQ-11.9 | Les **valeurs de `T_objet`** par type de meuble | **13** |
| OQ-11.10 | Le **barème et l'affichage** des épisodes. Hors MVP tel qu'écrit | **16 et 18** |
| OQ-11.11 | La perte de **nuance pour les joueurs malentendants** — le Sonomètre donne l'attribution, pas le ton ; et un Sonomètre **lisible sans la couleur**, dans le noir | **19** |
| OQ-11.12 | La partition en pièces sert-elle **aussi** à l'occlusion ? En créer deux serait une faute | **3 et 10** |
| OQ-11.15 | **Un rythme de charge et de décharge réglable** en option d'accessibilité. Compatible avec les seuils personnels, mais il découplerait la seule valeur à historique : attendre que le prototype la remesure | Accessibilité, après le prototype |
| OQ-11.16 | **Une option contre les sons soudains** : la logique reste instantanée, seule l'attaque perçue du signal varierait | Accessibilité, direction audio |
| OQ-11.17 | **Un canal de coordination non vocal** comme condition de sortie du MVP | Périmètre — `mvp-scope.md` |
| OQ-11.18 | **Santé vocale et dysarthrie** dans un jeu où le chuchotement est le registre sûr, sur la durée d'une partie | Accessibilité ; question portée aussi par le système 6 |
| OQ-11.19 | **Le coupable désigné peut n'être pas celui que l'oreille entend** : le plus fort pour lui-même n'est pas le plus fort dans la pièce. Le passage au plus grand dépassement (2026-09-18) **ne la résout pas** — il compare une autre grandeur normalisée, et l'écarte encore du volume absolu | Playtest — à surveiller |

**Différé sciemment**, avec ses raisons — pas de zizanie à deux, bus de mix pour les streamers,
hiérarchie de sonie, polyphonie, volume d'assets sonores : `design/gdd/reviews/voice-object-effect-2026-09-14.md`,
« Différé sciemment ».

---

### État du code aujourd'hui

**Rien n'est implémenté.** Mais **le cœur de ce système est écrivable dès maintenant** : charge,
régimes, seuils, combinaison, lourdeur, avertissement et zizanie sont de l'arithmétique pure, sans
dépendance moteur — exactement comme `SUAC.Voice.Core`. Les critères `[UNIT]` passeraient sans
qu'aucun des systèmes 3, 5, 9 ou 10 n'existe.

**Ce qui est bloqué, ce n'est pas le modèle, c'est son branchement.**

## Revision History

| Date | Changement | Source |
|---|---|---|
| 2026-09-08 et 09 | Banc d'essai `prototypes/charge-vocale/` : la fenêtre de réaction et la fraction `avertissement / remplissage` réfutées ; optimum d'avertissement à 350 ms, sous le modèle du banc | Commits `a7359f0`, `390731e`, `f1cb607` |
| 2026-09-09 | Création. Périmètre `Loudness` seule ; deux régimes, maximum et somme plafonnée ; le plafond borne la montée, pas la charge | Décisions de l'utilisateur du 2026-09-09 |
| 2026-09-11 | La zizanie se compte **par pièce** ; les épisodes voisins fusionnent ; le Sonomètre devient le second canal d'attribution, et se lit sur les autres | Arbitrage de l'utilisateur ; GDD canonique § 2.4.5 |
| 2026-09-14 | Revue `full` : MAJOR REVISION NEEDED | `design/gdd/reviews/voice-object-effect-2026-09-14.md` |
| 2026-09-15 | Décisions du propriétaire E1 à E5 et F1 à F5 acceptées | `design/gdd/reviews/voice-analysis-2026-09-14.md` §6 |
| 2026-09-16 | **Révision, passe groupée, étape 4.** *Boucle* : une boucle unique à trois régimes, `SILENCE` prioritaire ; objet posé qui ne décharge qu'au silence. *Seuils* : `L_repos` remplacé par `r'` ; comparaison de positions par `ToPosition`, `γ` hors des seuils ; `T_objet` au-delà de 1 défini jusqu'au cri ; seuil de zizanie ancré sur la voix posée. *Murmure* : plafond sous l'avertissement, `k · seuil_av` (E2) ; les durées de murmure corrigées, « 1,36 » supprimé. *Avertissement* : un événement réarmé ; provenance des 350 ms écrite avec ses écarts ; deux sémantiques au prototype (E1) ; canal multimodal, règles de mix. *Zizanie* : elle allonge la descente au lieu d'accélérer la montée, variante comparée au prototype ; machine à états d'épisode, `FusionMax`. *Réseau* : « chaque client reçoit les `VoiceFrame` » supprimé ; `r'` seul vers l'hôte (E5) ; horloge et expiration à l'hôte ; prédiction de sa seule voix. *Accessibilité* : « Question close » rouverte et scindée en trois. *Dépendances* : systèmes 5 et 15 ; cible `p` adressée au système 1. *Critères* : VO-09, VO-13, VO-15, VO-17, VO-23, VO-26, VO-27 à VO-30 réécrits ; VO-31 rendu `[UNIT]` par injection ; VO-37 à VO-51 et VO-NET-01 ajoutés ; déclencheur pour chaque `[BLOQUÉ]`. *Questions* : OQ-11.13 à OQ-11.19 ajoutées. Encadrés datés fondus dans le texte, comptes supprimés | Revue du 2026-09-14 ; `design/gdd/reviews/voice-analysis-2026-09-14/impacts-passe-groupee.json` |
| 2026-09-18 | **Report du prototype étendu** (`prototypes/charge-vocale-etendue/`, phase solo close). *Boucle* : **un plafond de charge par niveau de voix** remplace la montée sans fin — la charge monte à vitesse constante vers `max(Plafond_mur, e^Douceur)` puis s'y tient ; le plafond ne rabat jamais une charge héritée ; `Plafond_al ≥ Plafond_mur` interdit l'inversion à la frontière. *Coupable* : le **plus grand dépassement de son propre seuil** remplace le maximum sur `Loudness` — OQ-11.19 n'en est pas résolue. *Avertissement* : devenu une **porte de niveau** — sous `e^Douceur < seuil_av` il ne sonne jamais ; au-dessus, le délai vaut `Avertissement` exactement, et les 350 ms cessent d'être un plancher. *Valeurs* : `k` 0,85 → **0,6** sur la lecture de la pré-charge (VO-49) ; `Douceur` ajoutée. *Thèse* : « la panique collective est punie par la durée » est réduite à la descente, dont la zizanie devient le seul porteur. *Seuils* : le chuchotement réel n'a pas de marge avec `T · r'` — mesures en *Formulas* §1 ; la variante ancrée sur `w` est décrite et **non retenue** (OQ-11.20). *Critères* : VO-13, VO-15 et VO-23 réécrits, VO-52 à VO-55 ajoutés. *Questions* : OQ-11.20 (seuil ancré), OQ-11.21 (E4 se joue à `r' ≈ 0,50`), OQ-11.22 (déplacer la contrainte vers le chat vocal) | `prototypes/charge-vocale-etendue/README.md` ; essais des 2026-09-17 et 18 |
