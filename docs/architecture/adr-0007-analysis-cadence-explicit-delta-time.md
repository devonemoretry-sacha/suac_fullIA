# ADR-0007: Analysis Cadence — Explicit `deltaTime`, Not an Implicit Contract

## Status

Accepted

## Date

2026-09-07

## Last Verified

2026-09-07

## Decision Makers

Utilisateur (solo dev). Déclenché par la revue `/design-review` du 2026-09-07 sur
`design/gdd/voice-analysis.md` (question ouverte OQ-3), sur constat du `unity-specialist`.

## Summary

L'`EnvelopeFollower` dérive ses coefficients de lissage d'un `updateRateHz` reçu à la
construction, et **rien ne vérifie que les appels arrivent réellement à ce rythme**. Une
dérive de cadence casse le lissage **sans exception, sans NaN et sans trace**. Le GDD
envisageait de garder cette cadence implicite comme simple contrat écrit ; **Unity ne
fournit aucun mécanisme capable de tenir ce contrat**. Décision : la chaîne d'analyse
reçoit un **`deltaTime` explicite** à chaque trame et recalcule ses coefficients en
conséquence, en exposant l'écart au nominal.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Unity 6.3 LTS (`6000.3.18f1`) |
| **Domain** | Audio / Scripting / Core |
| **Knowledge Risk** | LOW — les comportements invoqués (`Update`, `FixedUpdate`, `Microphone`, `OnAudioFilterRead`) sont anciens et stables, antérieurs à 6.3 |
| **References Consulted** | `docs/engine-reference/unity/VERSION.md` |
| **Post-Cutoff APIs Used** | Aucune |
| **Verification Required** | **Une seule** : confirmer au POC que `dspBufferSize` est bien modifiable à l'exécution via `AudioSettings.Reset()` et que `OnAudioFilterRead` en subit la taille. C'est le seul maillon du raisonnement qui n'ait pas été vérifié en pratique sur ce projet. |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | ADR-0006 (`SUAC.Voice.Core` est `noEngineReferences` — c'est ce qui interdit à l'assembly d'aller chercher l'heure elle-même), ADR-0004 (définit `VoiceFrame` et la frontière brut/normalisé) |
| **Enables** | Système 1 — l'écriture du `VoiceAnalyzer` |
| **Blocks** | **Le `VoiceAnalyzer` ne doit pas être écrit avant application de cet ADR** : la décision touche la signature publique du seul type à état de l'assembly |
| **Ordering Note** | Cet ADR **planifie**, il ne formalise pas de l'existant. Il impose une modification de code déjà écrit et testé. |

## Context

### Problem Statement

`EnvelopeFollower` est le seul type à état de `SUAC.Voice.Core`. Il calcule ses
coefficients d'attaque et de relâchement à partir d'un `updateRateHz` passé au
constructeur — soit environ 50 Hz. Le lissage n'est correct que si les appels arrivent
effectivement à cette cadence.

**Le mode d'échec est silencieux.** Si la cadence dérive, les coefficients deviennent faux
pour l'intervalle réel : le lissage est trop rapide ou trop lent, sans qu'aucune exception,
aucun `NaN`, aucun avertissement ne le signale. Le seul symptôme observable est un jeu qui
« répond mal » — et personne ne remonte de cette sensation jusqu'à cette cause.

C'est exactement la classe de défaut que `design/gdd/voice-analysis.md` se donne pour
mission de traquer, et c'était jusqu'ici le seul qu'il laissait passer.

### Current State

`Assets/_Project/Runtime/Voice.Core/EnvelopeFollower.cs` (133 lignes) prend `updateRateHz`
au constructeur et n'accepte aucune information temporelle par la suite. Les 41 tests
existants l'appellent en boucle serrée : ils vérifient que le lissage est correct **quand
la cadence est correcte**, jamais ce qui arrive quand elle ne l'est pas.

Aucun `VoiceAnalyzer` n'existe encore — c'est ce qui rend le moment favorable.

### Constraints

- `SUAC.Voice.Core` est en `noEngineReferences` (ADR-0006) : l'assembly **ne peut pas**
  appeler `Time.deltaTime` ni aucune horloge Unity. L'information temporelle doit donc lui
  être **fournie de l'extérieur**, quelle que soit la solution retenue.
- Les tests doivent rester exécutables hors éditeur, en millisecondes.
- Le coût sur le thread principal est plafonné à 1 ms/frame.

### Requirements

1. Le lissage doit rester correct lorsque l'intervalle réel s'écarte du nominal.
2. Un écart significatif doit devenir **observable**, et non rester silencieux.
3. La solution ne doit pas introduire de dépendance moteur dans `Voice.Core`.

## Decision

### Le constat qui ferme le débat

Le GDD présentait deux options : garder la cadence implicite comme contrat écrit tenu par
le système 2, ou passer un `deltaTime` explicite. **La première option n'existe pas**,
parce qu'elle suppose qu'une cadence fixe à 50 Hz soit atteignable sous Unity. Aucun
mécanisme du moteur ne la fournit :

| Mécanisme | Pourquoi il ne donne pas 50 Hz fixe |
|---|---|
| `Update` | Couplé à la fréquence d'affichage — variable par construction, et dépendant de la charge GPU |
| `FixedUpdate` | Ordonnanceur à rattrapage : zéro, une ou plusieurs exécutions dans la même frame selon le temps accumulé. La cadence *moyenne* est stable, l'intervalle *instantané* ne l'est pas |
| `Microphone` | API d'interrogation : aucun rappel, c'est l'appelant qui décide quand lire, donc le problème est déplacé et non résolu |
| `OnAudioFilterRead` | Piloté par le nombre d'échantillons du tampon DSP, dont la taille est **modifiable à l'exécution** — la cadence change alors sous les pieds du code sans qu'il en soit averti |

Le plus proche du besoin est `OnAudioFilterRead`, et c'est précisément celui dont la
cadence peut changer en cours de partie.

### Architecture

`EnvelopeFollower` — et par extension tout élément à état de la chaîne — reçoit
l'intervalle écoulé **à chaque appel**, au lieu de le supposer.

- Les coefficients sont recalculés lorsque l'intervalle s'écarte du précédent au-delà d'un
  epsilon. Un intervalle stable ne coûte donc rien de plus qu'aujourd'hui : le cas nominal
  reste un simple test de comparaison.
- Les constantes de temps d'attaque et de relâchement, exprimées en **millisecondes**
  (ADR ne fixe pas les valeurs — voir le GDD, PROVISOIRE 10–20 ms et 120–200 ms),
  deviennent la vérité de référence. La cadence n'est plus qu'une donnée d'entrée.
- L'écart au nominal est **exposé**, pas seulement absorbé : la chaîne publie une mesure de
  déviation de cadence, consommée par le compteur `ProfilerRecorder` du critère AC-42b.

### Implementation Guidelines

- L'intervalle est fourni en **secondes**, en `float`, par l'appelant — c'est-à-dire par
  `SUAC.Voice.Capture`, qui a le droit de connaître Unity.
- Un intervalle nul, négatif ou aberrant (au-delà d'un plafond) est **rejeté** : la trame
  réutilise le dernier intervalle valide. Un tampon audio en retard ne doit pas produire un
  coefficient absurde.
- Cette valeur n'entre **pas** dans `VoiceFrame` : elle est une donnée d'entrée de la
  chaîne, pas une mesure de la voix. La surface publique reste `{ VoiceFrame, VoiceProfile }`.

## Alternatives Considered

### Alternative 1 : garder la cadence implicite comme contrat écrit

**Rejetée — techniquement indisponible.** C'était l'option par défaut du GDD, et elle
suppose un mécanisme moteur qui n'existe pas. Un contrat que rien ne peut tenir n'est pas
un contrat, c'est un souhait. Coût zéro, garantie zéro.

### Alternative 2 : rééchantillonner l'entrée vers une cadence fixe

Interposer un tampon qui régularise le flux avant l'analyse. **Rejetée** : cela ajoute une
latence proportionnelle à la taille du tampon, sur le chemin le plus sensible à la latence
du jeu — celui qui doit faire sentir la voix comme un geste. On paierait en ressenti ce
qu'on gagne en simplicité de code.

### Alternative 3 : faire tourner l'analyse sur le thread audio, avec sa propre horloge

Séduisante, et partiellement retenue : l'analyse tourne bien hors du thread principal. Mais
elle ne résout pas le problème, elle le déguise — la cadence du thread audio est celle
d'`OnAudioFilterRead`, dont la taille de tampon est modifiable à l'exécution. On retombe
sur une cadence variable, avec en prime les contraintes du thread audio.

### Alternative 4 : détecter la dérive et journaliser un avertissement, sans corriger

**Rejetée comme solution, retenue comme complément.** Rendre le défaut visible sans le
corriger laisse le lissage faux. En revanche, l'exposition de l'écart est conservée — c'est
AC-42b.

## Consequences

### Positive

- Le dernier mode d'échec silencieux de la chaîne d'analyse disparaît.
- Le lissage devient correct sous cadence réelle, pas seulement sous cadence idéale.
- La chaîne cesse de dépendre d'une hypothèse invérifiable sur son appelant.
- L'écart de cadence devient une métrique observable en jeu, donc diagnosticable.

### Negative

- **Modification de code déjà écrit et testé.** `EnvelopeFollower` change de signature, et
  les tests qui l'exercent doivent suivre. C'est le coût réel de cet ADR.
- Un test de comparaison supplémentaire par trame. Négligeable au regard de YIN, qui domine
  le coût de la chaîne.
- L'appelant porte une responsabilité de plus : fournir un intervalle honnête. Un appelant
  qui mentirait produirait un lissage faux — le problème est déplacé vers un endroit où il
  est au moins **visible dans la signature**.

### Neutral

- La surface publique de `SUAC.Voice.Core` est inchangée du point de vue des consommateurs
  gameplay : ils lisent toujours des `VoiceFrame`.

## Risks

| Risque | Probabilité | Impact | Atténuation |
|---|---|---|---|
| L'appelant fournit un intervalle erroné, et le défaut se déplace sans disparaître | Moyenne | Élevé | Rejet des valeurs aberrantes ; exposition de la déviation (AC-42b) |
| La taille de tampon DSP se révèle non modifiable en pratique, affaiblissant la justification | Faible | Faible | La décision reste la bonne : `Update` et `FixedUpdate` suffisent à écarter l'alternative 1 |
| Le surcoût de recalcul devient sensible si la cadence est constamment instable | Faible | Faible | Mesuré par AC-42 sur le profil de charge nominal |

## Performance Implications

Une comparaison de `float` par trame dans le cas nominal ; un recalcul de deux coefficients
exponentiels lorsque l'intervalle change. À ~50 Hz, sur une seule instance par client
(ADR-0003), l'ordre de grandeur est négligeable devant YIN, qui est en O(fenêtre²) et
domine la chaîne — d'autant plus pour un joueur à voix aiguë décimé à 12 kHz, dont le coût
YIN est environ 2,25 fois celui du cas courant.

## Migration Plan

1. Modifier `EnvelopeFollower` pour accepter l'intervalle par appel.
2. Mettre à jour les tests EditMode existants qui l'exercent.
3. Ajouter un test de cadence variable : même séquence de valeurs à deux cadences, lissage
   correct dans les deux cas — **et non** un test qui affirme la divergence.
4. Écrire le `VoiceAnalyzer` sur cette base.
5. Brancher le compteur de déviation (AC-42b).

## Validation Criteria

- AC-14 — le temps de montée correspond à la constante déclarée, à cadence nominale.
- Le nouveau test de cadence variable ci-dessus.
- AC-42b — la déviation de cadence est exposée en continu.

## GDD Requirements Addressed

| GDD Document | System | Requirement | How This ADR Satisfies It |
|-------------|--------|-------------|--------------------------|
| `design/gdd/voice-analysis.md` | Tuning Knobs | « La cadence de la chaîne (~50 Hz) est un **contrat**, pas un curseur. La modifier casse le lissage en silence » | Rend le contrat vérifiable au lieu de seulement déclaré |
| `design/gdd/voice-analysis.md` | Open Questions — OQ-3 | « Cadence implicite ou `deltaTime` explicite » | Tranche : explicite, l'implicite étant indisponible |
| `design/gdd/voice-analysis.md` | Dependencies — Système 2 | « Pousser les échantillons à cadence fixe et connue » | Le contrat subsiste, mais l'analyse cesse d'en dépendre aveuglément |

> TR-ID stables à attribuer par `/architecture-review`.

## Related

- **ADR-0006** — `noEngineReferences` : c'est lui qui interdit à `Voice.Core` de lire
  l'horloge elle-même, et donc lui qui rend l'injection nécessaire
- **ADR-0004** — Frontière brut/normalisé : l'intervalle est une entrée, pas une mesure
- **ADR-0003** — Une seule instance d'analyse par client, ce qui borne le surcoût
- `design/gdd/voice-analysis.md` — OQ-3, AC-14, AC-42b
- `design/gdd/reviews/voice-analysis-2026-09-07.md` — la revue qui a déclenché cet ADR
