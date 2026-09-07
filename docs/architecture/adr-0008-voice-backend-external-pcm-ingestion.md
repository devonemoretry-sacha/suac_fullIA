# ADR-0008: Voice Chat Backend — L'ingestion de PCM externe est un critère éliminatoire

## Status

**Proposed** — le critère est arrêté, le backend ne l'est pas.

## Date

2026-09-07

## Last Verified

2026-09-07

## Decision Makers

Utilisateur (solo dev). Déclenché par la revue `/design-review` du 2026-09-07 sur
`design/gdd/voice-analysis.md`, recadrage de la question ouverte OQ-7 par le
`unity-specialist`.

## Summary

Toute l'architecture vocale suppose que le système 2 **possède le périphérique micro et le
fourche** — une branche vers l'analyse, une branche vers le chat vocal, l'AEC en amont de
la fourche. Cette supposition présuppose une chose jamais établie : que le SDK de chat
vocal accepte du **PCM fourni de l'extérieur** au lieu de posséder lui-même la capture.
**La plupart des SDK possèdent la capture.** Décision : l'ingestion de PCM externe devient
un **critère éliminatoire** de sélection du backend, et cette sélection **précède** tout
test de partage de périphérique.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Unity 6.3 LTS (`6000.3.18f1`) |
| **Domain** | Audio / Networking / Third-party integration |
| **Knowledge Risk** | **HIGH** — cet ADR porte sur les capacités d'API de SDK tiers, qui évoluent indépendamment du moteur et dont aucune n'a été vérifiée sur ce projet |
| **References Consulted** | `docs/engine-reference/unity/VERSION.md`, `Unity/Shut_up_and_carry/Packages/manifest.json` (aucun paquet de transport installé à ce jour) |
| **Post-Cutoff APIs Used** | Aucune — aucun SDK n'est encore intégré |
| **Verification Required** | **Tout.** Chaque capacité affirmée sur un SDK candidat doit être vérifiée dans sa documentation courante avant d'être retenue. Ne rien inférer de la mémoire du modèle. |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | ADR-0005 (interface maison, implémentation interchangeable), ADR-0003 (fourche du signal, AEC en amont) |
| **Enables** | Système 2 — Audio d'entrée ; le POC audio |
| **Blocks** | Le test de partage de périphérique décrit en OQ-7, qui ne mesure rien tant que ce critère n'est pas résolu |
| **Ordering Note** | **Cet ADR précède le test, il ne le suit pas.** C'est tout l'objet du recadrage. |

## Context

### Problem Statement

`design/gdd/voice-analysis.md` (OQ-7) identifiait comme risque principal la question « le
micro peut-il vraiment être partagé entre l'analyse et le chat vocal ? », et proposait de
la lever par une demi-journée de test sur la cible.

**La question était mal posée.** Un test de partage suppose déjà résolu ce qui ne l'est
pas : que le SDK de chat accepte qu'on lui remette des échantillons. S'il possède la
capture — comportement le plus répandu — alors :

- le système 2 **ne peut pas** être propriétaire du périphérique ;
- il n'y a rien à fourcher, puisque deux composants réclament la même ressource ;
- l'AEC ne peut pas être placée en amont de la fourche, car il n'y a pas de fourche ;
- **le trajet décrit par ADR-0003 s'effondre**, quel que soit le résultat du test.

Mener le test d'abord reviendrait à mesurer soigneusement une hypothèse dont on ignore si
elle a un sens.

### Current State

`Packages/manifest.json` ne contient **aucun paquet de transport ni de chat vocal**.
ADR-0005 a retenu « interface maison, backend interchangeable », en pressentant une
implémentation gratuite. L'interface est bien à nous — mais **l'interchangeabilité n'est
réelle que parmi les backends capables d'ingérer du PCM externe**, et ce sous-ensemble n'a
jamais été établi.

Autrement dit : ADR-0005 a bien protégé le projet contre le verrouillage à un fournisseur,
mais n'a pas vérifié que le catalogue des fournisseurs acceptables était non vide.

### Constraints

- Le signal remis à l'analyse doit être **brut** : post-AEC uniquement, jamais de VAD,
  d'AGC ni de suppression de bruit (`design/gdd/voice-analysis.md`, *Visual/Audio
  Requirements*). Un SDK qui n'expose que du signal déjà traité est inutilisable **même
  s'il accepte du PCM externe** en entrée.
- L'AEC doit rester disponible et positionnable **en amont** de la fourche : c'est une
  question de justesse de mesure, pas de confort d'écoute (ADR-0003).
- Cible PC / Steam.

### Requirements

1. Établir quels SDK candidats acceptent du PCM fourni par l'application.
2. Parmi eux, lesquels exposent une AEC utilisable en amont de la fourche.
3. Retenir un backend, et seulement ensuite tester le partage sur la cible.

## Decision

### Le critère

**L'ingestion de PCM externe est éliminatoire.** Un SDK qui exige de posséder la capture
est écarté sans autre examen, quelles que soient ses autres qualités — qualité de codec,
gratuité, intégration Steam, simplicité d'API. Aucune de ces qualités ne compense
l'impossibilité de mesurer la voix du joueur.

Second critère, subordonné au premier : **l'accès à un signal non traité**, ou la
possibilité de désactiver les traitements de confort sur la branche qui nous revient.

### L'ordre des opérations

1. **Inventaire** des SDK candidats et de leur capacité d'ingestion PCM, sourcé sur leur
   documentation courante — pas sur une connaissance générale.
2. **Sélection** d'un backend, consignée en amendement à cet ADR, qui passe alors en
   `Accepted`.
3. **Alors seulement**, le test de partage de périphérique sur la cible (OQ-7).

Inverser 2 et 3 rend le test ininterprétable.

### Ce qui se passe si le sous-ensemble est vide

Ce cas doit être nommé avant d'être rencontré. Si aucun backend acceptable n'existe, les
issues sont, par ordre de préférence :

- **Capture unique, distribution interne** — l'application possède le périphérique et
  alimente le chat vocal par une API d'entrée personnalisée, si le SDK en offre une même
  partielle.
- **Renoncer à l'AEC en amont** et accepter une contamination mesurée, en la traitant comme
  une dégradation documentée plutôt que comme un défaut caché. Coût : la justesse de la
  mesure, c'est-à-dire le cœur du jeu. **Fortement défavorable.**
- **Renoncer au chat vocal intégré** au profit d'un chat externe (Discord), la voix
  redevenant un pur contrôleur. Coût de conception réel, mais **honnête** : le jeu perd une
  commodité, pas sa mécanique centrale.

> **La troisième issue est préférable à la deuxième.** Perdre le chat intégré coûte du
> confort ; perdre la justesse de la mesure coûte le pilier 1.

## Alternatives Considered

### Alternative 1 : tester le partage d'abord, choisir le SDK ensuite

**Rejetée.** C'est la formulation d'origine d'OQ-7. Elle mesure une propriété de la pile
audio système alors que le facteur déterminant est une propriété d'API tierce. Un test qui
réussit ne prouverait rien si le SDK retenu ensuite possède la capture.

### Alternative 2 : choisir le SDK sur d'autres critères et adapter l'architecture après

**Rejetée.** C'est ainsi qu'on découvre un blocage structurel après avoir écrit le système
2. La contrainte est connue maintenant ; elle doit s'appliquer maintenant.

### Alternative 3 : écrire notre propre transport vocal

Écartée du périmètre MVP, sans être exclue à terme. Elle supprime la question entièrement
— nous posséderions la capture et le trajet — au prix d'un chantier (codec, jitter buffer,
AEC) sans rapport avec ce que ce jeu doit prouver en premier.

## Consequences

### Positive

- Le risque le plus lourd du projet passe d'une inconnue diffuse à un **critère de
  sélection vérifiable**.
- La question se résout par de la lecture de documentation, sans écrire une ligne de code.
- Les issues du pire cas sont nommées et hiérarchisées **avant** d'être subies.

### Negative

- Réduit le catalogue des backends, peut-être fortement, et possiblement en écartant des
  solutions gratuites qui auraient convenu par ailleurs.
- Ajoute une étape avant le POC audio.

### Neutral

- ADR-0005 n'est pas invalidé : son principe d'interface maison tient, et c'est même lui
  qui rend ce filtrage possible sans réécriture. Cet ADR **précise le domaine de validité**
  de son interchangeabilité.

## Risks

| Risque | Probabilité | Impact | Atténuation |
|---|---|---|---|
| Aucun backend gratuit n'accepte de PCM externe | Moyenne | Élevé | Les trois issues ci-dessus, hiérarchisées à l'avance |
| Un SDK annonce la capacité sans la tenir en pratique | Moyenne | Élevé | Le test de partage (OQ-7) reste obligatoire **après** sélection — il valide, il ne présélectionne pas |
| Le signal ingéré ressort déjà traité malgré l'ingestion externe | Moyenne | Élevé | Second critère explicite ci-dessus ; à vérifier sur signal réel, pas sur documentation |

## Migration Plan

Aucune migration : rien n'est encore intégré. C'est précisément ce qui rend le moment
favorable — la contrainte s'applique avant le premier choix, non après.

## Validation Criteria

- Un inventaire écrit des SDK candidats et de leur capacité d'ingestion PCM, sourcé.
- Un backend retenu, consigné en amendement, l'ADR passant en `Accepted`.
- Le test de partage OQ-7 exécuté **sur ce backend**, et concluant.

## GDD Requirements Addressed

| GDD Document | System | Requirement | How This ADR Satisfies It |
|-------------|--------|-------------|--------------------------|
| `design/gdd/voice-analysis.md` | Open Questions — OQ-7 | « Le micro peut-il vraiment être partagé ? » | Recadre : la question préalable est la capacité d'ingestion du SDK |
| `design/gdd/voice-analysis.md` | Visual/Audio Requirements | « Livrer le signal brut : post-AEC uniquement, jamais de VAD, d'AGC ni de suppression de bruit » | En fait un critère de sélection du backend, pas un souhait adressé au système 2 |
| `design/gdd/voice-analysis.md` | Dependencies — Système 2 | « Posséder le périphérique et le fourcher — jamais un second lecteur » | Établit à quelle condition ce contrat est seulement réalisable |

> TR-ID stables à attribuer par `/architecture-review`.

## Related

- **ADR-0005** — Transport de la voix : cet ADR précise le domaine de validité de son
  interchangeabilité
- **ADR-0003** — Fourche du signal et AEC en amont : c'est le trajet que cette question
  peut invalider
- `design/gdd/voice-analysis.md` — OQ-7
- `design/gdd/reviews/voice-analysis-2026-09-07.md` — la revue qui a produit ce recadrage
