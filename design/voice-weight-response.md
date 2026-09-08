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

| Phase | Provisoire | Ce qui se passe |
|---|---|---|
| **Amorçage** | **~200 ms** | Le signal d'avertissement apparaît. Le poids a commencé à bouger, **imperceptiblement** — le joueur est très légèrement ralenti, et ce ralentissement **fait partie de l'avertissement** |
| **Fenêtre utile** | **jusqu'à ~500 ms** | Le joueur perçoit, comprend, et peut se taire sans conséquence notable |
| **Montée** | **~500 ms → ~1,5–2 s** | Le poids devient franchement gênant, progressivement et linéairement |
| **Retour** | **~1,5–2 s** | Symétrique, au silence |

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
