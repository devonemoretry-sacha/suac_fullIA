# ADR-0007: Analysis Cadence — Explicit `deltaTime`, Not an Implicit Contract

## Status

**Accepted — élargi le 2026-09-08** par la revue de chaîne
(`voice-chain-td-review-2026-09-08.md`).

> ### Amendement du 2026-09-08 — l'ADR ne corrigeait qu'un défaut sur cinq
>
> La décision d'origine reste juste : aucun mécanisme Unity ne fournit 50 Hz fixes, le
> `deltaTime` explicite est la seule voie. **Ce n'est pas rouvert.**
>
> Mais l'ADR n'injectait le temps que dans l'`EnvelopeFollower`, laissant **quatre horloges
> implicites** en place — les fenêtres d'analyse, la fenêtre de jitter, le TTL de l'anneau
> et la fenêtre de gel sur écrêtage, toutes trois exprimées en trames ou en millisecondes
> sans référence. Une dérive de cadence les fausse toutes.
>
> **Le `deltaTime` devient un `AnalysisTiming { DeltaSeconds, SampleRate }.`** L'ajout du
> `SampleRate` ferme du même geste un défaut que personne n'avait vu : **aucun document du
> projet ne nomme la fréquence d'échantillonnage**, alors que le code en dépend pour
> décimer et pour convertir une période en hertz.
>
> **Le coût était surestimé.** L'ADR annonçait le remaniement des tests comme « le coût
> réel » : `EnvelopeFollowerTests` porte **7 tests sur 41**, dont quatre gardent leur sens
> tels quels. Une demi-journée, et les 34 autres ne bougent pas.

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

> **⚠️ Élargi le 2026-09-08 par la revue de chaîne.** La version d'origine n'injectait qu'un
> `deltaTime`, et **ne corrigeait qu'un élément dépendant du temps sur cinq**. Voir
> l'amendement en tête de document. Ce qui suit est la version en vigueur.

La chaîne reçoit **à chaque trame** un descripteur de temps, et non un simple intervalle :

```
AnalysisTiming {
    float DeltaSeconds;   // intervalle réel écoulé depuis la trame précédente
    int   SampleRate;     // relevés par seconde du signal entrant
}
```

Tout élément dépendant du temps le consomme. Il y en a **cinq**, pas un :

| Élément | Dépendait implicitement de | Consomme désormais |
|---|---|---|
| `EnvelopeFollower` | `updateRateHz` du constructeur | `DeltaSeconds` |
| Fenêtres d'analyse (21 / 46 ms) | Une cadence d'échantillonnage supposée | `SampleRate` |
| Fenêtre de jitter `N` | Un compte de **trames** | Exprimée en **secondes** |
| TTL de l'anneau médian | Un compte de **trames** | Exprimé en **secondes** |
| Fenêtre de gel sur écrêtage | 250 ms, comptés sans référence | `DeltaSeconds` |

- Les coefficients sont recalculés lorsque l'intervalle s'écarte du précédent au-delà d'un
  epsilon. Un intervalle stable ne coûte donc rien de plus qu'aujourd'hui.
- Les constantes de temps, exprimées en **millisecondes ou en secondes**, deviennent la
  vérité de référence. Cadence d'appel et cadence d'échantillonnage ne sont plus que des
  données d'entrée.
- L'écart au nominal est **exposé**, pas seulement absorbé — consommé par le compteur
  `ProfilerRecorder` du critère AC-42b.

> **Pourquoi `SampleRate` voyage avec `DeltaSeconds`.** Ce sont les deux faces du même
> défaut. Si l'intervalle dérive, le nombre de relevés par trame dérive avec lui : les
> séparer laisserait la moitié du problème en place. Les injecter ensemble ferme d'un seul
> geste la dérive de cadence **et** l'absence de fréquence d'échantillonnage documentée.

### Implementation Guidelines

- `AnalysisTiming` est fourni par l'appelant — `SUAC.Voice.Capture`, qui a le droit de
  connaître Unity. `DeltaSeconds` en secondes, en `float`.
- **Un `SampleRate` incompatible avec la décimation demandée est refusé à la construction.**
  `Decimator` n'accepte qu'un **facteur entier** : 48 000 → 8 000 vaut 6, mais
  44 100 → 8 000 vaudrait 5,5125, ce qui n'existe pas. Le refus est explicite ; **arrondir
  serait le pire des comportements**, puisque toutes les hauteurs seraient alors fausses en
  silence.
- **Un intervalle nul, négatif ou aberrant est signalé, pas substitué.** *(Règle corrigée le
  2026-09-08 : la version d'origine réutilisait le dernier intervalle valide. Substituer une
  valeur en silence est précisément le mode d'échec que ce projet traque — le lissage
  redevenait faux sans que rien ne l'indique. La trame est marquée comme suspecte et la
  déviation remonte au compteur.)*
- `AnalysisTiming` n'entre **pas** dans `VoiceFrame` : c'est une entrée de la chaîne, pas une
  mesure de la voix.

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
