# ADR-0004: Voice Data Boundary — Raw vs Normalized, Enforced at Compile Time

## Status

Accepted

## Date

2026-09-03 *(formalisation ; décisions d'origine du 2026-07-27)*

## Last Verified

2026-09-03

## Decision Makers

Utilisateur (solo dev). Formalisé depuis `Obsedian_SUAC_FIA/05 - Journal/LOG - Décisions techniques.md`.

## Summary

Les mesures vocales brutes (amplitudes, hertz) dépendent de la voix et du micro de
chaque joueur ; si une seule atteignait le gameplay, l'équité vocale s'effondrerait.
Décision : la frontière brut/normalisé est **opposable à la compilation** — les types
bruts sont `internal` à `SUAC.Voice.Core`, seule `VoiceFrame` normalisée est publique,
et un test verrouille cette surface publique par liste blanche.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Unity 6.3 LTS (`6000.3.18f1`) |
| **Domain** | Audio / Scripting |
| **Knowledge Risk** | LOW — repose sur les règles d'accessibilité de C#, pas sur des API Unity |
| **References Consulted** | `docs/engine-reference/unity/VERSION.md`, `docs/engine-reference/unity/deprecated-apis.md` |
| **Post-Cutoff APIs Used** | Aucune |
| **Verification Required** | Aucune côté moteur. `SUAC.Voice.Core` est compilable hors Unity (netstandard2.1) et ses tests tournent contre le `nunit.framework.dll` livré avec Unity `6000.3.18f1` — vérifié le 2026-07-27, 41 tests verts. |

> **Note Unity 6.3** : `[SerializeField]` est désormais réservé aux champs (erreur de
> compilation sinon). Sans effet sur `Voice.Core`, qui n'a aucune référence au moteur,
> mais applicable dès que les valeurs de réglage remonteront via un ScriptableObject
> dans `Voice.Capture`.

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | ADR-0006 (la frontière n'est opposable que parce que le code est découpé en assemblies), ADR-0003 (définit la chaîne qui produit ces mesures) |
| **Enables** | Systèmes 2, 3 et 4 du périmètre MVP — tout consommateur gameplay de la voix |
| **Blocks** | Aucun — déjà implémenté et testé |
| **Ordering Note** | Cet ADR **documente du code existant et testé**. Il formalise après coup, il ne planifie pas. |

## Context

### Problem Statement

Deux joueurs fournissant le même effort vocal doivent obtenir le même effet en jeu,
quels que soient leur voix et leur micro. Une règle écrite dans un GDD ne survit pas
six mois : il fallait un mécanisme que le compilateur fasse respecter.

### Current State

**Implémenté et testé.** `SUAC.Voice.Core` contient `RawLoudness`, `RawPitch`,
`LoudnessMeter`, `PitchDetector`, `Decimator`, `EnvelopeFollower` et le contrat public
`VoiceFrame`. `PublicSurfaceTests` verrouille la surface publique.

### Constraints

- Le gameplay vit dans une autre assembly que l'analyse
- L'analyse doit rester testable sans micro, sans éditeur, en millisecondes

### Requirements

- Aucune mesure brute ne doit pouvoir atteindre le gameplay
- La règle doit être vérifiée par un outil, pas par la discipline
- La violation doit exiger une décision consciente, pas un oubli possible

## Decision

### Architecture

**1. Frontière opposable à la compilation.**
Les types de mesure brute (`RawLoudness`, `RawPitch`, `LoudnessMeter`, `PitchDetector`,
`Decimator`) sont **`internal` à `SUAC.Voice.Core`**. Le gameplay vivant dans une autre
assembly, il ne *peut pas* les lire. Seule **`VoiceFrame`**, entièrement normalisée,
est publique. `PublicSurfaceTests` affirme que la surface publique de Core est
**exactement** `{ VoiceFrame }`, par liste blanche.
`InternalsVisibleTo("SUAC.Tests.EditMode")` ouvre l'accès aux seuls tests.

**2. Où vit l'état : Core lisse la mesure, Gameplay accumule le sens.**
Deux notions étaient confondues sous le mot « continuité » :
- **La texture** (percussif ↔ régulier) se lit sur une seule fenêtre, via le rapport
  crête/RMS. **Sans état.** C'est elle, et elle seule, que porte `VoiceFrame.Continuity`.
- **La durée** (« la note tient depuis quinze secondes ») **vit dans le Gameplay**,
  chez chaque objet consommateur.

**3. Pas de champ vide : un type par mesure réellement produite.**
Un champ n'existe que le jour où quelque chose le remplit. La mesure brute est scindée
en `RawLoudness` (RMS, crête) et `RawPitch` (f0, apériodicité, voisement).

**4. Détection de hauteur : YIN.**
YIN (de Cheveigné & Kawahara, 2002), son décimé à **8 kHz**, plage **70–600 Hz**, seuil
d'apériodicité **0,15**, fenêtre de 256 échantillons. Tous ces paramètres passent par
constructeur. Décimation obligatoirement précédée d'un filtre passe-bas (sinus cardinal
fenêtré Blackman, 81 coefficients, coupure 3 200 Hz — atténuation mesurée **91 dB** à 7 900 Hz).

**5. Le voisement exige une porte de volume.**
YIN est **aveugle au volume par construction** : un résidu minuscule mais parfaitement
régulier est déclaré voisé. Le voisement au sens du jeu = **périodique ET assez fort**.
La porte de volume vit dans le futur `VoiceAnalyzer`, **pas** dans le `PitchDetector`,
car le seuil dépend du profil calibré du joueur — donnée que le détecteur ne connaît
pas et ne doit pas connaître.

### Key Interfaces

- `VoiceFrame` — seul type public de `SUAC.Voice.Core` ; instantané daté, normalisé, valide comme paquet réseau
- `VoiceProfile` (à venir) — public comme type, mais ses valeurs mesurées resteront internes
- `VoiceAnalyzer` (à venir) — porte **tout** l'état de Core ; partout ailleurs, des fonctions pures

### Implementation Guidelines

- Toute la chaîne brut → normalisé se referme **à l'intérieur de Core** : `Voice.Capture`
  envoie des échantillons et reçoit une `VoiceFrame`, jamais d'intermédiaire
- Le préfixe `Raw` rappelle la règle à chaque site d'usage
- **Un objet d'analyse n'est jamais partagé entre threads.** Un tampon de travail n'est
  pas un état tant qu'un seul thread y touche ; deux threads s'écraseraient mutuellement
- Si du code de Core se met à avoir besoin d'Unity, il se déplace dans `Voice.Capture` —
  on n'assouplit pas la règle

**Les quatre défenses contre l'erreur d'octave** :
1. Normalisation cumulative de YIN — pénalise structurellement les décalages longs *(implémentée)*
2. Premier creux sous le seuil, jamais le minimum global *(implémentée)*
3. Filtre médian temporel sur ~5 trames *(à venir, dans le `VoiceAnalyzer`)*
4. Plage restreinte autour de la hauteur calibrée du joueur *(à venir)*

## Alternatives Considered

### Alternative 1 (frontière): Règle documentée dans le GDD

Rejetée explicitement : « une règle écrite dans le GDD ne survit pas six mois ». Le
compilateur, lui, ne se lasse pas.

### Alternative 2 (hauteur): Autocorrélation brute

Confond systématiquement une note et son octave inférieure. **Rejetée.**

### Alternative 3 (hauteur): pYIN

Meilleur que YIN, mais lissage probabiliste par HMM — trop lourd pour le gain. **Rejetée.**

### Alternative 4 (hauteur): CREPE (réseau de neurones)

Hors de question en temps réel dans un jeu. **Rejetée.**

### Alternative 5 (plage): plafond à 400 Hz

**Rejetée, et c'est un point important** : un plafond trop bas ne rend pas la mesure
prudente, il la **falsifie**. Si la vraie hauteur est au-dessus, le décalage correct est
absent de la recherche et l'algorithme retourne le meilleur creux restant — c'est-à-dire
une octave en dessous. On fabriquerait l'erreur qu'on cherche à éviter, précisément sur
les cris et les rires dont le jeu est fait. Coût du passage à 600 Hz : +7 % de décalages à tester.

### Alternative 6 (plage): plafond au-delà de 600 Hz

Limite de résolution de la décimation à 8 kHz : deux décalages voisins sont séparés de
85 cents à 400 Hz, 128 cents à 615 Hz, mais 204 cents à 1 000 Hz. Au-delà de ~600 Hz on
extrapole plus qu'on ne mesure. **Rejetée.**

## Consequences

### Positive

- La fuite de mesure brute vers le gameplay est **impossible par construction** :
  C# interdit qu'un membre public expose un type internal
- Le seul trou restant (passer un type de `internal` à `public` pour dépanner) est fermé
  par le test : pour le rouvrir, il faut inscrire le type dans la liste blanche — donc le décider consciemment
- Un champ absent est honnête ; un champ qui vaut toujours zéro est un **mensonge silencieux**
- `VoiceFrame` reste un instantané, donc valide comme paquet réseau — pas un cumul
- La politique de durée peut différer par objet (le monte-meuble veut quinze secondes,
  apaiser un monstre en veut trois) sans imposer une politique unique dans l'analyse

### Negative

- Chaque objet de gameplay devra implémenter **sa propre accumulation**, avec ses seuils et son hystérésis
- Deux types de mesure brute au lieu d'un, et un type combiné à créer le jour où le `VoiceAnalyzer` assemblera les deux
- Un seuil de plus à calibrer par joueur (plancher de bruit), à mesurer pendant la calibration
- Le `PitchDetector` retourne un `IsVoiced` **incomplet** : il signifie « périodique »,
  pas « voisé au sens du jeu ». Le nom est conservé mais la nuance est figée par le test
  `UnAiguReplie_EstQuasiEfface_MaisResteJugePeriodique`, pour que personne ne le « corrige » par erreur
- Si l'analyse passe un jour sur un worker, chaque worker aura ses propres instances
- La hauteur exige une fenêtre plus longue que le volume (~46 ms contre 21 ms) : les deux
  mesures lisent le même tampon, pas la même profondeur

### Neutral

- Les valeurs de réglage ne peuvent pas être des ScriptableObject dans Core : elles
  passent par constructeur, et le ScriptableObject qui les alimente vivra dans `Voice.Capture`

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Des cris au-delà de 600 Hz s'avèrent compter en jeu | Moyenne | Moyen | **La bonne réponse est de monter la cadence décimée à 12 kHz, pas d'élargir la plage de décalages** |
| Bruit de fond interprété comme note franche | Élevée sans porte de volume | Élevé | Porte de volume obligatoire dans le `VoiceAnalyzer` — sans elle, « le Matelas à Mémoire de Ton réagirait au frigo » |
| Coût CPU réel supérieur aux estimations | Moyenne | Moyen | Estimations (~6 µs décimation, ~25 µs YIN) **non mesurées** — à instrumenter quand le `VoiceAnalyzer` tournera dans Unity |
| Quelqu'un « corrige » le comportement figé par les tests | Faible | Moyen | Les tests portent des noms explicites et la liste blanche force la décision consciente |

## Performance Implications

| Metric | Before | Expected After | Budget |
|--------|--------|---------------|--------|
| CPU décimation | n/a | ~6 µs *(estimé, non mesuré)* | <1 ms/frame total pour l'analyse |
| CPU YIN | n/a | ~25 µs *(estimé, non mesuré)* | idem |
| Fenêtre volume | n/a | ~21 ms | — |
| Fenêtre hauteur | n/a | ~46 ms | — |

## Migration Plan

Déjà implémenté. Reste à faire, tracé dans le LOG :

1. Créer le `VoiceAnalyzer` : centralise l'état de Core, porte la porte de volume et le filtre médian temporel
2. Ajouter la plage restreinte autour de la hauteur calibrée (4ᵉ défense contre l'erreur d'octave)
3. Instrumenter les coûts réels dans Unity

**Rollback plan** : sans objet — retirer la frontière reviendrait à abandonner l'équité
vocale, qui est une exigence de design, pas une préférence technique.

## Validation Criteria

- [x] La surface publique de `SUAC.Voice.Core` est exactement `{ VoiceFrame }` — vérifié par `PublicSurfaceTests`
- [x] Core compile hors Unity (netstandard2.1) et ses tests passent — 41 tests verts au 2026-07-27
- [x] Un aigu replié par la décimation est quasi effacé (91 dB d'atténuation mesurée)
- [ ] La porte de volume empêche un bruit de fond continu d'être lu comme une note
- [ ] Deux joueurs au même effort produisent des `VoiceFrame` comparables après calibration
- [ ] Coûts CPU mesurés dans Unity, conformes aux estimations

## GDD Requirements Addressed

| GDD Document | System | Requirement | How This ADR Satisfies It |
|-------------|--------|-------------|--------------------------|
| `design/gdd/game-concept.md` | Technical Risks | « Normalisation vocale entre joueurs (micros et voix hétérogènes) » | Rend la fuite de mesure brute impossible à la compilation |
| `design/gdd/game-concept.md` | Pillar 1 — Voice-Physics | « Le jeu récompense le contrôle » — donc l'effort doit être comparable entre joueurs | La normalisation est structurellement obligatoire, pas optionnelle |
| `design/mvp-scope.md` | Système 1 — Voice-Physics analyse | « Loudness, pitch, enveloppe » | Définit le contrat de sortie et l'algorithme de hauteur |

> TR-ID stables à attribuer par `/architecture-review`.

## Related

- **ADR-0006** — Découpage en assemblies : c'est lui qui rend cette frontière opposable
- **ADR-0003** — Pipeline d'analyse : produit les mesures que cet ADR encadre
- **ADR-0002** — Autorité physique : consomme `VoiceFrame` comme paquet réseau
- Code : `Unity/Shut_up_and_carry/Assets/_Project/Runtime/Voice.Core/`
- Tests : `Unity/Shut_up_and_carry/Assets/_Project/Tests/EditMode/PublicSurfaceTests.cs`
- Source : `LOG - Décisions techniques.md`, entrées du 2026-07-27 (quatre entrées distinctes)
