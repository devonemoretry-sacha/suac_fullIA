# Prototype — Charge vocale étendue

**Statut : construit le 2026-09-17, en attente de ton premier essai.** Suite du banc
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
2. **Calibration.** « Commencer », puis suis les consignes. Accepte le profil.
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
- **Système 6, version courte** — étape 0 « dis un mot » ; **chaque mesure attend « Je suis prêt »** ;
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

*Suite des résultats après la prochaine session.*
