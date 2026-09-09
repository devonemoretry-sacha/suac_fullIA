# Note — Réponse du poids à la voix

> **Ce document n'est pas un GDD.** C'est une note de cadrage, écrite le 2026-09-08, qui
> fige une cible de ressenti avant qu'elle se perde, et qui sert de **cahier des charges au
> prototype**.
>
> Elle ensemencera le GDD du **système 11 — effet voix → objets**, qui n'est
> volontairement pas ouvert : la revue technique du 2026-09-08 recommande de prototyper
> avant de le spécifier, et cette note existe pour rendre ce prototype **dirigé** plutôt
> qu'exploratoire.

## La cible de ressenti

Arbitrée par l'utilisateur, dans ses termes.

Un meuble porté à plusieurs qui, quand les porteurs parlent :

- **s'alourdit progressivement, jamais d'un coup** ;
- **prévient avant de punir** — le joueur doit avoir le temps de comprendre qu'il est en
  train de se mettre dedans, et de se taire ;
- **redevient transportable progressivement** quand le silence revient, symétriquement ;
- reste **linéaire et progressif** dans les deux sens, pour que le joueur trouve ça juste.

> **La fenêtre d'avertissement est le cœur de l'idée.** Sans elle, la sanction arrive avant
> la compréhension, et le Pilier 1 — « le contrôle est une compétence » — devient faux : on
> ne peut pas maîtriser ce qu'on découvre après coup.

## Deux horloges, à ne jamais confondre

C'est la clarification qui a motivé cette note, et elle doit survivre à la conversation qui
l'a produite.

| | **L'enveloppe de `Voice.Core`** | **La réponse du poids** |
|---|---|---|
| Système | 1 — analyse vocale | 11 — effet voix → objets |
| Ordre de grandeur | **10 à 200 ms** | **centaines de ms à ~2 s** |
| Métier | Empêcher `Loudness` de sauter à chaque syllabe | Produire le ressenti, la fenêtre d'avertissement, l'équité |
| Nature | Lissage de **mesure** | Règle de **jeu** |

> **Ne jamais chercher à obtenir le ressenti en allongeant l'enveloppe du système 1.** Réglée
> à deux secondes, elle ferait afficher au sonomètre que le joueur crie encore deux secondes
> après qu'il s'est tu. `Loudness` cesserait d'être « ce que j'émets maintenant », et toute
> la promesse d'attribution du système 1 s'effondrerait.
>
> **Le ressenti se construit en aval, par-dessus une mesure qui reste rapide et honnête.**

## Le découpage des signaux — ADR-0002 s'applique tel quel

L'utilisateur a confirmé le 2026-09-08 : **on sépare les signaux**. Et le principe existait
déjà, formulé par ADR-0002 pour la couche de retour local (système 12) :

> **« Prédire l'avertissement, jamais le verdict. »**

La correspondance est exacte, et elle n'a pas été cherchée :

| | Ce que c'est | Qui le porte | Autorité |
|---|---|---|---|
| **L'avertissement** | Le meuble « s'excite » — signal perceptible avant la gêne | Couche de retour local (12) | **Non autoritaire**, immédiat en local |
| **Le verdict** | Le poids réel qui rend le transport difficile | Physique (9, 11) | **Hôte**, avec sa latence réseau |

**L'architecture avait donc déjà une maison pour cette idée.** C'est ce qui permet à
l'avertissement d'être instantané côté joueur, là où le poids réel doit faire l'aller-retour
par l'hôte.

## Le découpage temporel — valeurs PROVISOIRES

L'utilisateur a explicitement écarté l'échelle de deux secondes pour l'avertissement — *« deux
secondes, c'est beaucoup trop long »* — et a laissé le choix des délais au métier.

> ### ✅ Premier essai au banc — 2026-09-08
>
> Ces valeurs ont été **éprouvées à la main** dans `prototypes/charge-vocale/`, et retenues
> telles quelles : *« j'aime bien ces réglages, dans l'ensemble ça fonctionne plutôt bien »*.
>
> **Un tour de correction en est sorti.** La ligne « sous ~400 ms l'avertissement n'est pas
> actionnable » reste vraie, mais elle ne porte pas sur le délai d'avertissement — elle porte
> sur **l'écart entre le signal et le moment où le poids devient conséquent**. Aux valeurs
> ci-dessous, l'avertissement arrive à 200 ms et le mi-poids à **740 ms** : le temps pour
> réagir est donc de **540 ms**, et non de 200. Le banc affichait la mauvaise grandeur et
> alertait à tort.
>
> **Portée de ce résultat** : un seul testeur, qui est le concepteur. Cela vaut « aucune
> contradiction trouvée », pas « optimum localisé ». Des joueurs naïfs restent nécessaires
> avant de figer.
>
> ### ❌ RÉFUTÉ le 2026-09-08 — c'est le délai d'avertissement, pas la fenêtre
>
> L'hypothèse ci-dessous a été démolie par quatre essais supplémentaires, dont **deux
> volontairement mauvais** — le premier lot à contenir des rejets.
>
> | Remplissage | **Avertissement** | Fenêtre | Verdict |
> |---|---|---|---|
> | 1,00 s | **40 ms** | 421 ms | bon |
> | 1,00 s | **30 ms** | 399 ms | bon |
> | 1,50 s | **430 ms** | 441 ms | *mauvais* |
> | 1,50 s | **550 ms** | 391 ms | *mauvais* |
>
> **La fenêtre ne sépare rien** : un bon à 399 ms, un mauvais à 391 — huit millisecondes
> d'écart, verdicts opposés. **Le délai d'avertissement sépare parfaitement** : bons de 30 à
> 200 ms, mauvais à 430 et 550, sans recouvrement.
>
> **Pourquoi c'est crédible.** Le raisonnement d'origine supposait que le joueur *attende*
> un signal. Il ne l'attend pas — **il est déjà en train de parler**. Ce dont il a besoin
> n'est pas du délai pour réagir, c'est de pouvoir **attribuer** le signal à ce qu'il vient
> de faire. À 30 ms la cause est évidente ; à 500 ms le signal arrive plusieurs syllabes
> plus tard et ne se rattache à rien.
>
> **Ce document avait vu le phénomène et mal placé la frontière** : il écrivait « au-delà de
> ~1 s, le signal se décroche de sa cause ». Le décrochage arrive **entre 200 et 430 ms**.
> Le tableau des phases plus bas est donc à relire avec cette correction : c'est
> l'**amorçage à ~200 ms** qui portait la valeur, pas la fenêtre utile.
>
> **Tranché le même jour : c'est le délai ABSOLU.** L'essai discriminant — remplissage
> 3,50 s, avertissement 430 ms — donne une fraction de **0,123**, en plein dans la plage des
> bons (0,030 à 0,133). Il a déplu. Puis, à remplissage constant, **une seule variable a
> bougé** — 430 → 300 ms — et le jugement s'est amélioré. C'est la comparaison la plus propre
> de la série.
>
> **La frontière est entre 300 et 430 ms** : bons à 30, 40, 100, 200, 300 ; mauvais à 430
> et 550.
>
> *(Ces deux essais avaient des fenêtres de 1,26 et 1,32 s — bien plus larges que tout le
> reste, et l'un était mauvais. Une fenêtre généreuse ne sauve rien : la fenêtre est
> définitivement hors de cause.)*
>
> **Une seconde variable, indépendante** : le testeur n'a pas aimé 3,50 s de remplissage même
> après correction du délai, alors que tous ses verdicts enthousiastes sont entre 1,00 et
> 1,50 s. Le tempo compte pour lui-même. **Il reste donc au moins deux paramètres à régler**,
> pas un.

> ### ~~La fenêtre de réaction est peut-être la seule vraie constante~~ *(réfuté, voir ci-dessus)*
>
> Un **second** jeu de réglages a été retenu dans la même session, plus nerveux sur les
> quatre axes : remplissage 1,20 s, vidange 1,00 s, avertissement 100 ms, amorçage 10 %.
>
> | Réglages | Mi-poids | **Temps pour réagir** |
> |---|---|---|
> | 1,50 s · 1,50 s · 200 ms · 15 % | 740 ms | **540 ms** |
> | 1,20 s · 1,00 s · 100 ms · 10 % | 590 ms | **490 ms** |
>
> Tout a changé sauf **la fenêtre de réaction**. Et le testeur ne la voyait pas : le relevé
> affichait encore la mauvaise grandeur, et aucun curseur ne la pilote directement. Il a
> convergé deux fois vers la même demi-seconde **sans la viser**.
>
> **Hypothèse de travail** : ce que le joueur règle réellement n'est aucun des quatre
> curseurs, c'est **le temps dont il dispose pour se taire — environ 500 ms**. Les
> constantes individuelles seraient alors du tempo, libres tant que leur *écart* tient cette
> valeur. Cela corrobore par un autre chemin le plancher de ~400 ms tiré des temps de
> réaction humains — les deux réglages se posant juste au-dessus.
>
> **Ce n'est pas encore un résultat** : deux points, un testeur. La mesure qui trancherait
> est de descendre la fenêtre sous 400 ms en gardant le reste, et de vérifier que ça casse.

| Phase | Valeur | Ce qui se passe |
|---|---|---|
| **Amorçage** | **350 ms** — *mesuré au banc, 2026-09-08* | Le signal d'avertissement apparaît. Le poids a commencé à bouger, **imperceptiblement** — le joueur est très légèrement ralenti, et ce ralentissement **fait partie de l'avertissement** |
| **Montée** | **jusqu'à ~1,5 s** *(remplissage aimé : 1,00 à 1,50 s)* | Le poids devient franchement gênant, progressivement et linéairement |
| **Retour** | **~1,0 à 1,5 s** — non isolé | Symétrique, au silence |

> ### La seule valeur réellement mesurée : l'amorçage à 350 ms
>
> Balayage à variable unique, remplissage 1,50 s, amorçage 15 % :
>
> | Avertissement | 200 | 300 | **350** | 400 | 430 | 550 |
> |---|---|---|---|---|---|---|
> | Verdict | bon | bon | **le meilleur** | moins bon | *mauvais* | *mauvais* |
>
> **C'est un optimum, pas une frontière.** On attendait « plus tôt, mieux c'est, jusqu'à
> rupture ». Faux : 350 ms bat 300 ms, et bat les 200 et 30 ms essayés avant.
>
> **La falaise est brutale — 80 ms séparent le meilleur du mauvais.** C'est donc une
> constante à tenir serré, pas un réglage tolérant.
>
> **Pourquoi trop tôt est moins bon** : sous 200 ms, le signal se déclenche sur tout, y
> compris les mots courts qu'on allait cesser de toute façon. Il devient constant, donc il
> cesse d'informer. L'avertissement doit être **attribuable** — ce qu'impose la falaise
> haute — **et rare**, ce qu'impose la pente basse. Le sommet est le compromis des deux.
>
> **Ligne d'origine corrigée** : ce document disait « fenêtre utile jusqu'à ~500 ms ». La
> fenêtre a été **écartée comme facteur** — deux réglages à 1,26 et 1,32 s de fenêtre ont
> déplu. Elle n'est plus une phase du découpage, seulement une grandeur dérivée.

### D'où viennent ces nombres

Le temps de réaction humain à un stimulus simple tourne autour de **200 à 250 ms**. Ici il
en faut davantage : percevoir le signal, comprendre qu'il veut dire « tais-toi », puis
s'arrêter — et **s'interrompre en pleine phrase coûte déjà 200 à 300 ms**.

- **Sous ~400 ms, l'avertissement n'est pas actionnable** : le joueur le perçoit en même
  temps que la sanction, donc ce n'est plus un avertissement, c'est un accompagnement.
- **Au-delà de ~1 s, le signal se décroche de sa cause** : le joueur ne fait plus le lien
  avec ce qu'il vient de dire, et l'attribution échoue par l'autre bout.

L'analogie retenue par l'utilisateur — **la mine qui s'arme avant de devenir dangereuse** —
correspond à cette fenêtre, et c'est celle qu'emploient les jeux de tir.

## Le mécanisme proposé — une charge, pas un niveau

Le poids ne suit pas le `Loudness` instantané mais une **charge accumulée** : elle monte
pendant qu'on parle, elle redescend pendant qu'on se tait, et c'est elle qui pilote le poids.

Ce modèle produit gratuitement tout ce que la cible demande — un délai avant conséquence
pendant que la jauge se remplit, une montée progressive, un retour progressif — et il est
**linéaire si les vitesses de remplissage et de vidange sont constantes**, ce qui est
exactement la demande.

Deux nombres à régler, et ils se règlent **à l'oreille et à la main** : temps de
remplissage, temps de vidange.

## Ce que le prototype doit permettre

C'est l'objet de cette note. Le jetable recommandé par la revue technique — un micro, un
cube, un poids, seuils en dB codés en dur, ni calibration ni réseau ni normalisation — doit
exposer **quatre curseurs manipulables pendant qu'on joue** :

1. Temps de remplissage de la charge
2. Temps de vidange
3. Instant d'apparition du signal d'avertissement
4. Amplitude du ralentissement imperceptible de la phase d'amorçage

**Le critère de réussite n'est pas un nombre, c'est une phrase** : le testeur doit pouvoir
dire *« j'ai senti que ça montait, j'ai eu le temps de me taire »* — et, quand il échoue,
nommer ce qu'il a fait de travers.

## Ce que cette note ne tranche pas

- **La voix d'un non-porteur agit-elle sur l'objet porté ?** Question la plus structurante du
  système 11, signalée non tranchée par l'index des systèmes. Le prototype peut la fermer.
- **Le poids maximal**, et s'il rend le transport impossible ou seulement pénible.
- **Le comportement à plusieurs porteurs qui parlent en même temps** — les charges
  s'additionnent-elles, prend-on la plus forte ?
- Tout ce qui relève de l'apparence du signal d'avertissement, qui appartient à l'art et à
  l'audio.
