## Revue adversariale — Analyse vocale (`voice-analysis.md`), angle game-designer, re-revue du 2026-09-14

Contexte pris en compte : les quatre promesses, le protocole d'attribution, le principe des seuils personnels, et les constats déjà remontés par la revue du système 11 (`voice-object-effect-2026-09-14.md`) qui pointent leur racine dans ce document.

---

**1. BLOQUANT — Le zéro n'est pas là où la Promesse 4 l'exige, et ce document le sait déjà sans l'avoir corrigé.**

La formule de `Loudness` (section *Formulas*) donne `x = clamp((Rms_dB − Floor_dB)/(Scream_dB − Floor_dB), 0, 1)` : elle vaut zéro **sous `Floor_dB`**, pas sous `Floor_dB + Margin_dB`. La porte de voisement, elle, exige `Floor_dB + Margin_dB` (7 dB PROVISOIRE). Ce sont deux plancers différents pour deux sorties différentes — et `Loudness` n'est jamais conditionnée par `Voiced` (rappelé par AC-36 lui-même). Concrètement : un souffle ou un bruit de fond à 2 dB au-dessus du plancher donne `x = 0,05`, `Loudness = 0,05^0,65 ≈ 0,14`. Aucune trace, respiration ou traîne de bruit propre du micro ne fait donc `Loudness = 0` — seulement `x=0` en dessous du plancher dur, qui n'a aucune raison physique d'être atteint par 4 micros en permanence.

L'arbitrage (b) de la revue du système 11 a déjà nommé le correctif (« `Loudness` doit valoir 0 sous `Floor + Margin`, pas seulement sous `Floor` »), mais il est marqué **non appliqué** ici. Tant qu'il ne l'est pas, **ce document contredit sa propre Promesse 4** (« quand je me tais, mon objet cesse de réagir ») dans son propre système, avant même que le 11 en hérite le bug (silence collectif inatteignable, C3 de la revue système 11).

*Promesse cassée* : #4, et par ricochet le protocole d'attribution (« pourquoi mon meuble ne s'allège jamais » n'a pas de réponse nommant un acte vocal).

**Coût pour la Promesse 1** : si le zéro se déplace à `Floor + Margin`, tout chuchotement plus discret que la marge (7 dB PROVISOIRE) redevient silence — exactement le registre que la Promesse 1 protège. Aucun des deux plafonds ne peut bouger sans mordre sur l'autre promesse : ce n'est pas un oubli, c'est un vrai arbitrage à trancher et à documenter comme tel dans *Tuning Knobs* (il n'y figure pas actuellement — le tableau des curseurs ne traite que `Margin_dB` du point de vue de la porte de voisement, jamais du point de vue du plancher de `Loudness`).

*Fix concret* : ajouter une troisième constante nommée (ou réutiliser `Margin_dB` explicitement) dans la formule de `Loudness`, un AC qui caractérise le domaine `Rms_dB ∈ (Floor_dB, Floor_dB+Margin_dB)` — actuellement non couvert par AC-36 (qui ne teste qu'au-dessus de la marge) ni par AC-40 (qui ne teste qu'en dessous du plancher) — et documenter le coût sur le chuchotement dans *Tuning Knobs*.

---

**2. BLOQUANT — Le cadrage « corps » que Player Fantasy dit avoir écarté est déjà présent, sans les garde-fous qu'un cadrage assumé aurait exigés.**

*Portée future* affirme que le souffle et le tremblement sont volontairement hors MVP, « à rouvrir seulement si la maîtrise vocale s'avère trop facile en playtest ». Le Finding 1 montre que le souffle **agit déjà** sur `Loudness` — pas comme fantasme choisi et réglé, mais comme fuite non voulue d'un plancher mal placé. C'est l'inverse du procédé que le document prescrit pour lui-même (nommer la tension, exposer le curseur, nommer le déclencheur) : ici il n'y a ni curseur nommé pour ce cas, ni déclencheur, ni conscience du fait dans la section qui devrait le porter.

*Promesse/Pilier cassé* : Player Fantasy — la clause « le jeu ne punit pas ce qu'on ne contrôle pas » (Pilier 1) est déjà violée en germe, avant tout playtest, et Player Fantasy ne le sait pas encore : c'est une **affirmation obsolète** (surclaim) au sens où la section prétend qu'un choix de conception a été fait et tenu, alors que le comportement réel du système le contredit.

*Fix concret* : dans *Portée future*, remplacer « écarté du MVP » par une mention explicite que le plancher actuel laisse déjà passer un peu de souffle près du seuil, avec un renvoi au Finding 1 comme correctif obligatoire avant de pouvoir dire que le corps est vraiment hors MVP.

---

**3. BLOQUANT — Le tableau « Ce que le joueur doit voir de sa mesure » contredit la doctrine proprioceptive du 2026-09-11, et laisse le joueur en `Degraded` sans aucun canal vers lui-même.**

Le tableau (section *Visual/Audio Requirements*) dit encore : `Loudness` → **Permanent — le sonomètre**, raison « seule valeur dont l'attribution dépend en continu ». Mais l'encadré ⚠️ corrigé le 2026-09-11, juste au-dessus dans le même document, établit que **le joueur ne voit jamais son propre sonomètre** — seulement celui des autres. Un implémenteur qui lit ce tableau seul (sans remonter à l'encadré) construit exactement le retour visuel que la correction du 2026-09-11 vient d'exclure.

Plus grave que l'incohérence de rédaction : la conséquence côté `Degraded`. Le document exige que « le sonomètre doit afficher un état visuellement distinct de "je me tais" » pour réparer l'attribution — mais ce sonomètre appartient au torse du joueur et n'est lu **que par les autres**. Un joueur dont le micro tombe en `Degraded` ne voit donc **rien du tout** signalant son propre état : ni cadran, ni alerte nommée pour lui (l'« alerte sonore non diégétique » reste « recommandée en complément », non actée). Il découvre son `Degraded` uniquement par l'absence de réaction de l'objet qu'il porte (système 11) — un signal en aval, retardé, et strictement identique à ce que produirait « je n'ai pas assez crié ». **C'est exactement l'échec d'attribution que Player Fantasy interdit nommément** : le joueur en `Degraded` ne peut pas nommer un acte vocal, parce qu'il n'a commis aucun acte vocal fautif — mais il n'a pas non plus le moyen de savoir que ce n'en est pas un.

*Promesse cassée* : le protocole d'attribution lui-même, dans le cas précis que ce document consacre une sous-section entière à vouloir résoudre (« `Degraded` n'avait aucun chemin de sortie » / « `Degraded` est muet »).

*Fix concret* : (a) corriger le tableau pour dire explicitement « Permanent, mais lu par les coéquipiers, jamais par le joueur lui-même » ; (b) spécifier un canal **self-facing** pour `Degraded` — HUD non diégétique, icône, ou tout signal qui n'exige pas que le joueur observe son propre torse, qu'il ne peut par construction pas voir.

---

**4. RECOMMANDÉ — « Même effort, même résultat » est vérifié comme une formule, pas comme une promesse de jeu.**

AC-37 prouve que deux profils synthétiques à position relative identique produisent la même `Loudness` — c'est vrai par construction de la formule, ça ne teste rien que le code ne fasse déjà mécaniquement juste. AC-38 (4-5 testeurs, courbe monotone et sans croisement) est reconnu par la revue précédente elle-même comme un test **ordinal seulement** — il « passe sur des courbes de raideur très différentes ». Aucun des deux ne teste ce qui fait réellement la promesse : que la **calibration** (système 6) capture le vrai plancher et le vrai cri de deux joueurs différents avec la même fidélité — un joueur qui n'ose pas crier à fond pendant le protocole de calibration (gêne sociale, micro partagé, voisins) obtient un `Scream_dB` sous-mesuré, donc un `Δ` compressé, donc une `Loudness` qui grimpe plus vite pour le même effort réel — et rien dans ce document ne le détecte, puisque AC-37/38 opèrent après coup sur un profil déjà supposé fidèle.

*Promesse cassée* : #2, en mode « habillée en garantie mathématique alors que le vrai risque vit dans system 6 ».

*Fix concret* : ajouter un critère explicite qui borne la promesse à son domaine réel — par exemple, documenter dans *Formulas* ou *Dependencies* que « même effort, même résultat » n'est vraie que si `Scream_dB` reflète l'effort maximal réel du joueur, et renvoyer vers un futur AC de system 6 qui teste la fidélité de la mesure du cri en conditions sociales dégradées (pas en labo silencieux).

---

**5. BLOQUANT — Le facteur `LowRange ×1,5` n'a aucun critère d'acceptation, et son report ne satisfait pas les trois conditions que le document impose à tout autre report.**

Le document définit lui-même la règle : un report n'est légitime qu'avec (a) une valeur provisoire, (b) un déclencheur nommé, (c) un propriétaire — et audite les autres reports contre cette règle (`γ` la passe, le TTL de l'anneau y échoue explicitement). Le point « réouvrir l'exclusion d'accessibilité une fois `LowRange` en place » (listé comme encore ouvert dans la revue du 2026-09-07, section *Reste ouvert*) **échoue au même test** : pas de déclencheur nommé, pas de propriétaire assigné, et aucun critère d'acceptation ne vérifie que la constante ×1,5 (bornée 1,2–2,5) reste du côté « geste » et pas « curseur ».

Or c'est précisément la ligne que *Player Fantasy* trace comme non négociable (« la mesure doit rester assez rapide pour que le joueur sente sa propre voix comme un geste, pas comme un curseur »). Les joueurs marqués `LowRange` — par construction ceux dont la voix est la plus contrainte : timidité, voisinage, voix physiologiquement étroite — sont exactement la population que le découpage plancher-dur/bande-de-qualité visait à inclure, et ce sont eux qui reçoivent la version la plus lente, la plus « mousse » du contrôle. Le document obtient l'équité de magnitude (AC-37) sans jamais tester l'équité de réactivité — deux axes différents de la même promesse, dont un seul est instrumenté.

*Promesse cassée* : #2 sur son axe non testé (réactivité, pas magnitude) + Pilier 1 (« le contrôle est une compétence ») pour ce sous-groupe précisément.

*Fix concret* : soit fournir les trois éléments manquants au report (valeur provisoire déjà là — 1,5 — mais déclencheur et propriétaire manquants : nommer le POC audio comme lieu de test, assigner ux-designer + game-designer), soit ajouter dès maintenant un AC qui borne le ×1,5 par une mesure perceptuelle (ex. temps de montée max avant que 4-5 testeurs jugent le geste « mou »).

---

**6. BLOQUANT (risque de concept, pas seulement de système) — OQ-8 n'est résolu ni par le casque ni, probablement, par le plan de test actuel.**

Le document distingue correctement, dans OQ-8 même, deux problèmes physiques différents : le retour haut-parleur → micro (que le casque règle, d'où « le casque est un prérequis du jeu ») et le brouillage acoustique direct entre deux micros dans la même pièce (qu'**aucun DSP ne sépare**, et que le casque ne touche pas du tout — un casque ne rend pas le micro sourd à la voix du voisin). Le risque : la formulation générale plus haut dans le document — « c'est la raison pour laquelle le casque est un prérequis du jeu et non un conseil » — se lit, hors contexte, comme si le casque couvrait aussi OQ-8. Ce n'est pas ce que le document affirme en toutes lettres dans OQ-8, mais la proximité des deux passages crée un risque de lecture pour quiconque n'ouvre pas les deux sections ensemble.

Plus important : ce risque n'apparaît **nulle part** dans `game-concept.md` (*Design Risks* / *Technical Risks*), alors qu'il menace directement l'attribution — la promesse centrale que ce système entier existe pour garantir — dans une configuration que le pitch lui-même cible (« groupes d'amis », créateurs de contenu qui jouent fréquemment côte à côte pour le stream). Un risque de portée pilier, documenté seulement au niveau système 1, ne remonte pas.

Enfin, sur le déclencheur : OQ-8 exige un playtest **même-pièce, micros réels** avant l'écriture des GDD des systèmes 3 et 12. Le plan actuel du propriétaire (prototype navigateur étendu, puis test multi-humain) ne précise pas si ce test multi-humain sera **co-localisé**. Le prototype voix→objets utilise des voix artificielles simulées (« sa propre voix immédiate, celle des autres retardée ») — cela ne teste par construction aucun brouillage acoustique réel. Si le futur test multi-humain se fait à distance (chacun chez soi), la case « playtest fait » sera cochée sans que la condition réelle d'OQ-8 (deux micros vivants dans la même pièce) n'ait jamais été essayée — et les GDD 3/12 s'écriront sur une hypothèse non vérifiée malgré l'apparence de l'avoir été.

*Promesse cassée* : #2 et le protocole d'attribution en configuration multi-joueurs co-localisée — cas non marginal pour ce genre de jeu.

*Fix concret* : (a) ajouter OQ-8 (reformulé : « brouillage acoustique inter-joueurs en configuration co-localisée ») aux *Design Risks* de `game-concept.md` ; (b) préciser explicitement dans le plan de test que le test multi-humain à venir doit inclure au moins une session avec joueurs physiquement dans la même pièce, casque sur les deux, avant que les GDD des systèmes 3 et 12 soient écrits — sinon reporter cette clause de déclenchement littéralement dans `mvp-scope.md` comme condition bloquante, au même titre que E3 l'a été pour le système 11.

---

**7. MINEUR — Player Fantasy ne mentionne pas l'asymétrie `LowRange`, apparue après sa rédaction (2026-09-04).**

La section a été arbitrée avant que le découpage plancher-dur/bande-de-qualité et le facteur ×1,5 n'existent (ajoutés le 2026-09-08). Elle nomme une tension unique et globale (« attribution vs réactivité »— un seul curseur, pour tout le monde). Elle ne dit rien du fait que ce curseur est désormais **appliqué différemment selon le profil du joueur** — ce qui est une décision de fond (accepter les registres étroits plutôt que les refuser) qui mériterait sa propre ligne dans Player Fantasy, pas seulement dans *Tuning Knobs*.

*Fix concret* : une phrase ajoutée à *La tension à ne pas résoudre par la mollesse* : « cette tension ne se règle pas au même point pour tous les joueurs — un profil `LowRange` la règle plus loin vers la stabilité, par construction, et Finding 5 [ou son futur correctif] doit garantir que ce déplacement reste sous le seuil où le geste devient un curseur. »

---

### Synthèse

Sur les quatre promesses nommées par Player Fantasy, **deux sont aujourd'hui compromises dans ce document même** : la Promesse 4 (silence → objet muet) est structurellement en danger avant même d'atteindre le système 11 qui en hérite le symptôme (Finding 1) ; la Promesse 2 (même effort, même résultat) est prouvée mathématiquement mais pas comme promesse de jeu, et son application `LowRange` n'est vérifiée sur aucun axe expérientiel (Findings 4, 5). Le protocole d'attribution lui-même échoue dans le cas `Degraded` pour le joueur affecté (Finding 3) — précisément le cas que ce document dit avoir corrigé le 2026-09-08 et le 2026-09-11, mais dont la correction ne referme pas la boucle jusqu'au joueur concerné. Le cadrage « pas de corps, pas de punition de l'incontrôlable » n'est plus vrai en pratique (Finding 2). Aucun de ces points n'exige de reconception : ce sont tous des ajustements de constante, de table ou d'AC — mais ce sont exactement les « trous de valeur silencieusement fausse » que ce document dit lui-même traquer.