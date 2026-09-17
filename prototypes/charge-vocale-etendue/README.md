# Prototype — Charge vocale étendue

**Statut : essai 1 fait le 2026-09-17, prototype corrigé, essai 2 attendu.** Suite du banc
`prototypes/charge-vocale/`, étape 4 du plan de la passe groupée.

Le banc testait des constantes de temps sur une seule voix, sans calibration. Celui-ci fait
tourner **le modèle révisé** des systèmes 1, 6 et 11 : la calibration personnelle, les seuils en
positions, la boucle à trois régimes, l'avertissement comme événement, la zizanie par pièce,
et trois voix simulées.

## Les questions posées

| # | Hypothèse | Ce qui la tranche |
|---|---|---|
| **H1** — décision E1 | L'avertissement « événement au franchissement » laisse le temps de se taire au moins aussi bien que l'indice dès l'attaque du banc | Comparaison aveugle ; question de la pré-charge |
| **H2** — décision E2, mesures B1 et B2 | Un chuchotement fait frémir l'objet sans alerte ni poids, et le silence est atteignable | Points de mesure : où tombe ton vrai chuchotement ; `p ≥ 0,84` sur le silence |
| **H3** | Avec trois voix, le maximum désigne un coupable identifiable, et la zizanie qui allonge la descente se sent | Cri mystère ; question « zizanie » dans les deux variantes |
| **H4** — décision E4 | La conversation soutenue près d'un objet ordinaire reste jouable, comparée à l'objet tolérant | Question « conversation soutenue » sur chaque type d'objet |

**Le risque le plus haut que ce prototype peut tester seul** : qu'une fenêtre de chuchotement
existe vraiment à l'échelle de ta voix. Si ton vrai chuchotement tombe au-dessus du seuil d'un
objet ordinaire, le Pilier 1 n'a plus de registre sûr. **Mesure-le en premier.**

## Comment le lancer

```bash
node prototypes/charge-vocale-etendue/serve.js
```

Puis ouvrir **http://localhost:4322** dans Chrome ou Edge, **casque sur les oreilles**. Le micro
exige `localhost` : un fichier ouvert directement ou une page d'artefact ne l'obtiennent pas
(voir le README du banc).

## Protocole — une première session d'environ 30 minutes

1. **Capture.** Active le micro. Vérifie dans le cadre « Capture » qu'`echoCancellation`,
   `noiseSuppression` et `autoGainControl` sont à `false`, et note la fréquence affichée. Coche
   l'enregistrement brut si tu veux garder les sons pour la session hors ligne.
2. **Calibration.** « Commencer », puis suis les consignes : silence, chuchotement, parole posée, montée.
   Accepte le profil.
3. **Points de mesure, dans cet ordre** : chuchotement, respiration, clavier, bruits de bouche,
   note douce, voix posée. Puis « Silence 8 s » deux fois, puis « Silence 30 s ». Puis « Note
   douce sur la porte ».
4. **Jeu — seul, voix simulées muettes.** Porte le canapé en parlant, en chuchotant, en criant.
   Réponds à la phrase « j'ai eu le temps de me taire ».
5. **Comparaison aveugle** de l'avertissement : joue V1, joue V2, choisis.
6. **Pré-charge** : chuchote quelques secondes, puis crie. Réponds à la question.
7. **Son coupé** (volume à 0) : l'avertissement se remarque-t-il par le tremblement seul ?
8. **Objet tolérant** : parle normalement en portant, sur « Ordinaire » puis « Tolérant ».
9. **Trois voix** : mets Lou et Max en pièce A en « Converse », puis les trois en « Panique ».
   Essaie les deux variantes de zizanie. Lance quelques cris mystère.
10. **Journal** : télécharge-le et dépose le fichier dans le dépôt, ou colle-le dans la conversation.

## Ce qu'il fait

- **Système 1** — RMS en dB avec `MinDb`, enveloppe `c = exp(−Δt/τ)` au pas réel, porte
  `Gate_dB = Floor_dB + Margin_dB`, position `x′`, `Loudness = x′^γ`, `ToPosition`. Facteur
  `LowRange` sur `τ`, commutable (B5). Réglages `τ`, `γ` et `Margin_dB` en direct (B4).
- **Système 6, version courte** — étape 0 « dis un mot » ; **étape chuchotement** (piste du 2026-09-17), entre le silence et la parole posée ; **chaque mesure attend « Je suis prêt »** ;
  silence de 7 s après un compte à rebours de 3 s, sans indicateur de niveau ; parole posée avec
  pulsation « on t'entend », **terminée par le joueur** avec « J'ai fini de parler » une fois le minimum
  atteint ; montée avec un objet qui s'alourdit, plateau calé sur le plancher dur, bouton d'arrêt. Validations V1, V2, V3 ; deux refus → profil approximatif.
- **Système 11** — la boucle normative de *Formulas* §3 : `SILENCE` prioritaire, murmure plafonné sous
  l'avertissement, alarme au maximum, objet posé qui ne décharge qu'au silence, seuils en positions,
  zizanie par pièce avec épisodes, avertissement événement ou banc. Hôte au tick fixe de 50 Hz ; en
  mode client, latence simulée et prédiction de ta seule voix.
- **Canaux** — trois états sonores (frémissement, texture de danger, signal bref), micro-tremblement
  caméra, halo facultatif, voix simulées audibles et spatialisées, Sonomètres sur les autres, option
  « afficher mon volume ».
- **Journal** — chaque réponse, mesure et épisode est daté avec la configuration complète ;
  export JSON.

## Ce qu'il ne fait pas

- **Ni YIN ni jitter** : `Rest_dB` est pris sur les trames au-dessus de la porte, le chemin de repli
  du système 1 ; pas de `PitchStatus`, pas de garde de parole à l'étape de silence — refais l'étape si
  tu as parlé.
- Pas de hauteur, de note tenue, d'écrêtage, de physique Unity, ni de réseau réel.
- **Le social** : l'attribution entre vrais humains, la comédie, la même pièce. C'est le test à
  plusieurs qui suit — le bouton « Même pièce, 30 s » prépare sa mesure bloquante.

## Vérifications faites à la construction

- **29 contrôles du modèle en Node** : les témoins chiffrés de `voice-object-effect.md` §5 et de
  `voice-calibration.md` §4 sont reproduits — plein en 1,67 s et avertissement à 389 ms à 0,9 ;
  rapport 1,6 indépendant de `z` ; plafond du murmure en 3,7 s et 14,9 s ; pré-charge en 52 ms ;
  descente de 2,25 s après une zizanie à trois ; VO-07, VO-09, VO-26, VO-42 ; refus V2, `LowRange`
  V2 et V3, témoin de la revue accepté sans drapeau.
- **Dans le navigateur, au générateur** : calibration complète acceptée ; deux refus puis profil
  approximatif ; points de mesure ; silence atteint puis perdu et regagné ; zizanie à trois voix et
  épisode compté ; en client à 150 ms, avertissement prédit à 385 ms contre 540 ms côté hôte.
- **Deux défauts trouvés et corrigés en route** : des voix simulées qui ne retombaient jamais
  exactement à zéro — le silence devenait inatteignable, le défaut que la passe groupée corrige dans
  le système 1 — et une réconciliation client qui retardait la prédiction au lieu de l'avancer.

## Résultats

### 2026-09-17 — premier essai, interrompu : la calibration va trop vite

**Constat du propriétaire** : les étapes s'enchaînaient sans laisser le temps de lire la consigne ni
de la faire. Chaque étape démarrait dès la fin de la précédente, et la parole posée s'arrêtait seule
dès 2 s de voix captée.

**Corrigé dans le prototype** : chaque mesure attend « Je suis prêt » ; le silence part après un
compte à rebours de 3 s ; la parole posée se termine par « J'ai fini de parler », qui n'apparaît qu'une
fois le minimum atteint, ou au délai ; les points de mesure laissent 1,5 s pour se préparer.

**Conséquence pour `voice-calibration.md`, à trancher à la re-revue** : le document fait finir
l'étape 2 « dès que `n(V) ≥ VoicedMin` » (CAL-43) et n'écrit aucune porte « prêt » entre les étapes.
Le mode découverte promet « aucune hâte » ; les règles ne la garantissaient pas.

### 2026-09-17 — essai 1, 11 h 22 – 11 h 40 · journal `sessions/2026-09-17-essai-1.json`

**Matériel** : Logitech PRO X Gaming Headset (USB). Traitements du navigateur coupés
(`echoCancellation`, `noiseSuppression`, `autoGainControl` à `false`). Piste à 48 kHz, contexte
audio à 44,1 kHz : la branche 12 kHz n'existerait pas sur ce poste.

#### Calibration — « ma voix de conversation est proche de ma voix forte »

| Tentative | Silence (P95 / P50) | `Rest_dB` | `Scream_dB` | Fin de la montée | `r′` | Lecture |
|---|---|---|---|---|---|---|
| 1, avant le correctif | −22,2 / −80,0 | — | — | — | — | Le mot de l'étape 0 a débordé sur le silence : porte à −12 dB, étape 2 impossible |
| 2, avant le correctif | −61,7 / −80,5 | −19,7 | −18,2 | plateau à 1,3 s | 0,95 | Montée coupée au niveau de la parole : les étapes s'enchaînaient |
| 3, après le correctif | −74,7 / −79,5 | −21,4 | **−14,3** | plateau à 2,6 s | **0,86** | Le cri n'a pas dépassé le maximum de la parole posée (−14,3) : **7 dB** entre voix posée et cri |
| 3 bis, parole et montée refaites | idem | −26,7 | −11,4 | plateau à 2,1 s | 0,71 | Accepté ; **15 dB** entre voix posée et cri |

**Points de mesure** (profil `r′` 0,71, porte à −64,7 dB) :

| Geste | Médiane | Au-dessus de la porte | Position | Lecture du prototype |
|---|---|---|---|---|
| Chuchotement | −27,2 dB | 37,5 dB | 0,70 | alarme sur un objet ordinaire |
| Clavier | −25,7 dB | 39,0 dB | 0,73 | alarme sur un objet ordinaire |
| Voix posée | −22,8 dB | 41,9 dB | 0,79 | alarme sur un objet ordinaire |
| Note chantée douce | −38,7 dB | 26,0 dB | 0,49 | à la limite du seuil (0,50) |
| Bruits de bouche | −51,5 dB (P90 −29,9) | 13,3 dB | 0,25 | alarme sur les pics |
| Respiration | −80,1 dB | −15,4 dB | 0 | ne pèse rien — **exactement le niveau du silence** |

**Lecture, à vérifier** : un chuchotement et un clavier aussi forts que la voix posée, une
respiration strictement au niveau du silence, un cri seulement 7 à 15 dB au-dessus de la parole.
C'est la signature d'un **traitement en amont du navigateur** : une porte de bruit, qui efface la
respiration, suivie d'un compresseur et d'un limiteur, qui ramènent tout au même niveau. Le
logiciel G HUB de Logitech en propose pour ce casque : « Blue VO!CE » comprend un filtre passe-haut, une réduction de bruit, un expandeur-porte, un de-esser, un compresseur et un limiteur (https://www.logitechg.com/en-us/software/guides/blue-voice, consulté le 2026-09-17). **Hypothèse non vérifiée** : la
saturation n'était pas encore mesurée pendant cette session.

**Si elle se confirme**, ce n'est pas un défaut des formules : c'est le cas limite « le périphérique
traite le signal avant le jeu » de `voice-calibration.md` (OQ-C12), observé sur le casque du
propriétaire. Le prérequis affiché au joueur devra nommer les logiciels des fabricants.

**Silence** : `p` = 1,000 sur 8 s, 0,915 sur 30 s — au-dessus de la cible de 0,84. Scintillement à
la porte : 0,33 bascule par seconde, pas de problème. Mesure « même pièce » : non interprétable, sans
étiquette ni seconde personne identifiée.

#### Jeu — réponses et ressenti

**Biais qui touche toutes les réponses** : la voix simulée Lou était réglée par défaut sur
« Converse », dans la pièce du canapé, contrairement au protocole. Sa conversation, à la position
0,47, dépassait le seuil de l'objet ordinaire (0,33) : **elle mettait elle-même le canapé en alarme et
empêchait tout silence complet**.

| Question | Réponse | Ce qu'on peut en tirer |
|---|---|---|
| « J'ai eu le temps de me taire » | Oui | L'avertissement événement fonctionne |
| Retour au calme | « Beaucoup trop long » | **Non concluant** : Lou empêchait le silence |
| Pré-charge | « Déjà nerveux », mais « trop vite » | `k` = 0,85 laisse 52 ms : à baisser, par exemple 0,6 pour environ 140 ms |
| Tremblement, son coupé | Remarqué | Le second canal passe (VO-48) |
| Conversation soutenue, objet ordinaire | Jouable, l'objet avance plus lentement ; **pas assez punitif** | Le propriétaire veut un objet **figé ou presque** : réponse à OQ-11.1, qui appartient au portage |
| Zizanie | Trop punitive dans les deux variantes | **À refaire** : les voix restaient actives pendant la descente |
| Cri mystère | 7 réponses justes sur 9 | Les deux erreurs confondent Lou et Max, dans la même pièce, avec Lou qui parlait en continu |

**Non fait** : comparaison aveugle de l'avertissement, objet tolérant, mode client.

#### Corrigé dans le prototype après cet essai

- **Les questions confirment la réponse** (« ✓ Noté dans le journal »). Les clics étaient enregistrés,
  sans rien montrer.
- **Les voix simulées sont muettes par défaut**, avec un bouton « Toutes muettes » et un avertissement
  tant qu'une voix est active.
- **Mobilité à pleine charge** réglable, jusqu'à 0 : l'objet ne bouge plus.
- **Crête et saturation** mesurées sur chaque étape de calibration et chaque point de mesure ; la
  calibration signale une saturation, ou un écart de moins de 12 dB entre voix posée et cri, en
  pointant le matériel et jamais la voix. Crête affichée en direct dans « Capture ».
- **Retour au calme journalisé** : durée totale, et part passée sans silence complet.
- **Horloge `?horloge=audio`**, pour les vérifications dans un onglet caché.

#### Pour l'essai 2

1. **Dans G HUB, coupe Blue VO!CE** et tout traitement du micro ; vérifie aussi les améliorations
   audio de Windows. Refais la calibration, puis chuchotement, clavier, respiration, voix posée.
2. **Jeu avec toutes les voix muettes** : le journal dira si le retour au calme dure `Vidange` ou s'il
   est bloqué.
3. Essaie `k` à 0,6 et la mobilité à pleine charge vers 0,2, puis 0.
4. Comparaison aveugle de l'avertissement ; objet tolérant ; zizanie, avec le relevé de descente.

#### Conséquences pour les documents, à trancher à la re-revue

- `voice-calibration.md` : nommer les logiciels des fabricants dans le prérequis ; détecter la
  saturation et la compression (OQ-C2, OQ-C12) ; la porte « prêt » et la fin de parole par le joueur
  (CAL-43).
- `voice-object-effect.md` : `k` trop haut (pré-charge) ; la zizanie, à remesurer.
- Système 9, sans document : « lourd » doit pouvoir figer l'objet sous une conversation soutenue
  (OQ-11.1).

### 2026-09-17 — retour du propriétaire : exiger de couper Blue VO!CE est une friction

**Constat** : demander aux joueurs de couper les fonctions de leur casque, ou de régler quoi que
ce soit hors du jeu, freine les joueurs qui ne maîtrisent pas leur ordinateur. **L'idéal : jouer
avec son installation habituelle.** Ce retour remet en cause l'exigence que `voice-calibration.md`
place « au même rang que le casque » (*UI Requirements*, « Le casque et les améliorations micro »).

**Trois endroits où un traitement peut se loger, trois réponses possibles** :

| Où est le traitement | Exemple | Ce que le jeu peut faire sans réglage externe |
|---|---|---|
| Dans le matériel du casque | PRO X : d'après un test, les réglages Blue VO!CE s'enregistrent dans la carte son USB — *à vérifier* | Rien pour le contourner : **mesurer et s'adapter** |
| Dans Windows, comme effet audio | Améliorations audio, effets de pilotes | Demander le flux brut au système (mode « raw » de WASAPI), si le pilote le permet — *piste pour le système 2, à vérifier* |
| Dans un micro virtuel | Logiciels qui créent un second micro « traité » | Proposer le micro physique dans le sélecteur du jeu |

**Ce que la calibration absorbe déjà, et ce qu'elle ne peut pas rendre** : un traitement stable est
mesuré tel quel, et les seuils personnels s'y rangent. Une porte de bruit aide même le silence. Mais
un compresseur écrase l'écart entre chuchotement, voix et cri, et aucune calibration ne recrée un
écart qui n'arrive plus. Le cœur « tais-toi » tient ; la nuance chuchoter / parler / crier se perd.

**Ce que les essais doivent mesurer avant de trancher** : l'essai 1 a été fait avec Blue VO!CE,
l'essai 2 sans. La comparaison dira combien de nuance on perd, et une partie jouée **avec** Blue VO!CE
dira si le jeu reste jouable. **Piste à prototyper ensuite** : ancrer le seuil de murmure sur le
chuchotement mesuré du joueur, plutôt que sur une fraction de sa voix posée.

**À trancher à la re-revue** : `voice-calibration.md` — l'exigence sur les améliorations micro, et un
éventuel point « chuchotement » dans la calibration ; système 2 et ADR-0003 — la capture en mode brut
et le choix du micro physique.

### 2026-09-17 — décision du propriétaire : ne jamais bloquer, dire ce qui est perdu

**Décision** : ne jamais bloquer un joueur dont le micro écrase la dynamique. **L'informer de ce qu'il perd
et d'où ça vient**, l'inviter à couper le traitement, puis le laisser jouer — qu'il y aille en connaissance
de cause, et qu'il ne puisse pas conclure que le jeu est mal fait quand c'est son micro qui le bride.
**Piste retenue pour le prototype** : calibrer le chuchotement.

**Ajouté au prototype** :

- **Étape « chuchotement »** : pas de pulsation, pour ne pas pousser à chuchoter plus fort ; l'ancre est
  le P90 de tout le chuchotement, porte comprise.
- **Seuil de murmure au choix** : « fraction de la voix posée » (GDD, `T_objet · r′`) ou « entre le
  chuchotement mesuré et la voix posée » (`w + T_objet · (r′ − w)`, jamais au-delà de `r′`).
- **Diagnostic de dynamique écrasée** : voix posée − chuchotement sous 6 dB, ou cri − voix posée sous
  12 dB. Valeurs du prototype : elles signalent la chaîne de capture, ne refusent jamais.
- **Message de fin de calibration** : ce que le micro fait perdre, en clair ; la cause probable ;
  « Tu peux jouer comme ça » ; bouton « Jouer avec cette mesure ».
- **Rappel en jeu, au moment où ça mord** : quand ta voix basse déclenche l'alarme, avec un profil
  écrasé, un bandeau rappelle que c'est le micro — au plus une fois toutes les 45 s, journalisé.

**Vérifié au générateur** : profil écrasé (chuchotement à 3 dB de la voix, cri à 7 dB) → message ; au
seuil du GDD, le chuchotement déclenche l'alarme et le rappel ; au seuil ancré, le même chuchotement reste
en murmure (seuil 0,78 contre 0,57). 36 contrôles Node, dont 7 pour la piste.

**Conséquences à trancher à la re-revue** : `voice-calibration.md` — une étape de plus, le message et le
drapeau de dynamique écrasée, le prérequis sur les améliorations micro remplacé par une invitation ;
`voice-object-effect.md` — la formule du seuil ; ADR-0003 et décision E5 — **un second nombre, la
position du chuchotement, partirait vers l'hôte** avec `r′`.

*Suite des résultats après l'essai 2.*
