# ADR-0005: Voice Chat — Own Interface, Swappable Backend over Steam P2P

## Status

Accepted

## Date

2026-09-03 *(formalisation ; décision d'origine prise le 2026-09-03, remplaçant celle du 2026-07-05)*

## Last Verified

2026-09-03

## Decision Makers

Utilisateur (solo dev). Formalisé depuis `Obsedian_SUAC_FIA/05 - Journal/LOG - Décisions techniques.md`.

## Summary

Le chat vocal de proximité est un pilier du jeu, et Dissonance n'a **pas** d'intégration
FishNet officielle. Décision : le projet définit **sa propre interface de chat vocal**,
au-dessus du **P2P Steam (Facepunch)**, avec un backend interchangeable. L'implémentation
initiale est **gratuite** (voix native Steam + spatialisation FMOD maison) ; **Dissonance
devient une implémentation d'upgrade**, achetée seulement quand son apport (AEC,
suppression de bruit) devient nécessaire.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Unity 6.3 LTS (`6000.3.18f1`) |
| **Domain** | Audio / Networking |
| **Knowledge Risk** | LOW pour l'implémentation A (Steam natif + FMOD, tous deux gratuits et déjà dépendances). MEDIUM pour l'implémentation B (Dissonance, dépendance payante non achetée) |
| **References Consulted** | `docs/engine-reference/unity/modules/audio.md`, `docs/engine-reference/unity/modules/networking.md` |
| **Post-Cutoff APIs Used** | Aucune API Unity post-cutoff |
| **Verification Required** | Contention de périphérique micro entre l'analyse et le chat vocal (point traité en ADR-0003) — **à lever au POC audio, avant toute implémentation**. Vitalité de l'éditeur Dissonance vérifiée le 2026-09-03 : à re-vérifier uniquement au moment d'un éventuel achat. |
| **Licences** | FMOD : **gratuit** sous 200 000 $ de revenu annuel et 500 000 $ de financement. Voix native Steam : gratuite via Facepunch.Steamworks, déjà dépendance (ADR-0001). Dissonance + pont FMOD : 175 $, **non engagés**. |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | ADR-0001 (défini **par opposition** : le chat vocal ne passe délibérément pas par FishNet), ADR-0003 (retire Dissonance du chemin critique de l'analyse) |
| **Enables** | Système 6 du périmètre MVP — chat vocal de proximité |
| **Blocks** | Epic « Chat vocal » |
| **Ordering Note** | Rien n'est acheté ni codé avant l'étape réseau. Ce qui est tranché ici est **la direction**, pour ne pas glisser vers le pont communautaire par défaut le jour où ça pressera. |

## Context

### Problem Statement

Sans chat vocal de proximité, les testeurs passent par Discord — et l'atténuation par la
distance, qui est un pilier du jeu, disparaît du test. Il fallait décider par quoi la
voix transite, sachant que le jeu utilise déjà FishNet pour le gameplay.

### Current State

Rien n'est installé. Ni Dissonance, ni son intégration FMOD, ni aucun transport ne
figurent dans `Packages/manifest.json`.

### Constraints

- Cible PC / Steam uniquement (2026-07-06) — le P2P Steam est donc déjà une dépendance actée
- Budget d'un développeur solo
- Le jeu est un jeu d'horreur : la voix doit subir occlusion, réverbération et distance
  comme n'importe quel autre son du monde

### Requirements

- Voix positionnelle 3D
- Découplage des deux couches réseau, pour pouvoir remplacer l'une sans toucher l'autre
- Qualité de traitement (annulation d'écho, suppression de bruit) sur la voie communication

## Decision

### Architecture

**Le projet définit sa propre interface de chat vocal. Le backend est interchangeable.**

Deux sessions réseau distinctes coexistent :
- **FishNet** → synchronisation gameplay (features vocales, objets, états)
- **Chat vocal** → transport audio, sur son propre canal Steam P2P

L'interface expose le minimum nécessaire au jeu : rejoindre/quitter une room, envoyer une
trame de voix locale, recevoir un flux spatialisé par locuteur. Le gameplay ne connaît
que cette interface, jamais le middleware derrière.

**Deux implémentations prévues :**

| Implémentation | Coût | Ce qu'elle donne | Ce qui manque |
|---|---|---|---|
| **A — Steam natif + FMOD** *(initiale)* | **0 $** | Capture, compression, transport P2P Steam, **spatialisation 3D, occlusion et distance via FMOD** | **AEC → impose le casque obligatoire**, suppression de bruit, système de rooms |
| **B — Dissonance + FMOD** *(upgrade)* | 175 $ | Tout ce qui précède, plus Opus, RNNoise, **AEC**, contrôle de gain, FEC, rooms | — |

**Pourquoi ce découpage.** Un adaptateur réseau doit exister **de toute façon** : le cœur
de Dissonance ne transporte rien lui-même. La vraie question n'était donc pas s'il faut en
écrire un, mais **à quelle API on accepte d'être couplé** — et, dès lors qu'on en écrit
un, rien n'oblige à se coupler à un middleware payant avant d'en avoir besoin.

### Implementation Guidelines

- **Le gameplay ne référence jamais Dissonance ni l'API Steam directement** — uniquement
  l'interface maison. C'est ce qui rend le backend remplaçable.
- L'implémentation A décode les trames de voix Steam et les injecte dans un event FMOD 3D :
  c'est ce qui procure occlusion et atténuation par la distance sans middleware payant.
- L'implémentation B fournit à Dissonance un canal **non fiable et non ordonné** — ce que
  le P2P Steam donne nativement. Dissonance fournit les classes de base d'adaptateur.
- **L'AEC vit en amont de la fourche** (ADR-0003, amendé le 2026-09-03) et n'est plus
  un traitement de confort : sans elle, un joueur sans casque injecte la voix de ses
  coéquipiers dans **sa propre analyse gameplay**. Elle n'existe pourtant qu'en
  implémentation B. **Conséquence pour l'implémentation A : le casque est obligatoire**,
  comme prérequis de validité de la mesure et non comme recommandation de confort.
  Le point larsen du BACKLOG reste ouvert jusqu'à B.

## Alternatives Considered

### Alternative 1: Pont communautaire Dissonance ↔ FishNet

Le moins d'effort immédiat. **Rejetée** : Dissonance figure parmi les intégrations
*communautaires* de FishNet, explicitement non maintenues par l'équipe FishNet ; le pont
existant est l'œuvre d'un auteur unique, hébergé sur son compte de backup, sans matrice
de compatibilité documentée. Coupler le chat vocal à deux API mouvantes à la fois, sans
support d'aucun des deux éditeurs — et recoupler ce que la décision du 2026-07-05 avait
explicitement séparé.

### Alternative 2: Vivox

Gratuit jusqu'à 5 000 joueurs simultanés, voix positionnelle 3D native, indépendant du
moteur réseau donc sans le problème FishNet par construction. **Rejetée** pour deux
raisons : la voix partirait dans le cloud d'Unity (dépendance à un service et à ses
conditions) alors qu'on dispose déjà d'un transport P2P gratuit, et surtout **la lecture
ne passerait plus par FMOD**.

### Alternative 3: Voix Steam native, seule

Gratuite et déjà embarquée via Facepunch, mais l'API Steam ne fait que capturer et
compresser — pas d'audio 3D, pas de rooms, pas d'annulation d'écho, pas de suppression de
bruit. **Rejetée comme solution finale**, mais **retenue comme implémentation initiale (A)** :
combinée à FMOD, elle couvre la spatialisation, l'occlusion et la distance — c'est-à-dire
tout ce que le gameplay exige en matière de spatialisation. Ce qui manque en RNNoise et
en rooms relève du confort ; **l'AEC, elle, ne relève pas du confort** (ADR-0003 amendé) —
son absence est compensée par l'obligation du casque, pas ignorée.

### Alternative 5: Acheter Dissonance immédiatement

C'était la formulation retenue avant le passage à l'interface maison. **Rejetée** : 175 $
engagés avant que la mécanique centrale ne soit validée, sur un projet qui peut ne jamais
sortir. Le découplage rend cet achat différable sans coût architectural — l'adaptateur
étant à écrire dans les deux cas.

### Alternative 4 *(superseded)*: Dissonance porté par FishNet

C'était la formulation de l'entrée du 2026-07-05, qui laissait ouverte la question
« Dissonance a-t-il une intégration FishNet officielle ? ». **Vérifié le 2026-09-03 :
non.** Dissonance supporte officiellement Mirror, Netcode for GameObjects, Photon
(PUN/Fusion), Forge, DarkRift 2, TNet3, HLAPI et un mode WebRTC autonome. FishNet ne
figure pas dans cette liste.

## Consequences

### Positive

- Couplage au **P2P Steam**, stable depuis une décennie et déjà une dépendance actée,
  plutôt qu'à l'API FishNet qui casse entre versions majeures
- Restaure la cohérence avec la décision « deux couches réseau découplées » du
  2026-07-05, dont la justification était précisément de pouvoir remplacer Dissonance
  sans toucher FishNet
- **Le MVP se fait à 0 $** : l'implémentation A couvre tout ce que le gameplay exige.
  L'argent n'est engagé que sur un jeu déjà prouvé
- **L'occlusion et la distance sont acquises dès l'implémentation A**, via FMOD — c'est
  décisif pour un jeu d'horreur où la voix doit subir l'occlusion et la réverbération
  comme tout autre son du monde, et ça ne dépend d'aucun achat
- Le risque éditeur cesse d'être existentiel : si un backend disparaît, le changement est
  contenu derrière l'interface au lieu d'être une réécriture
- Dissonance reste disponible en upgrade et apporte ce qu'aucune alternative gratuite ne
  donne : Opus, RNNoise, contrôle de gain, **annulation d'écho acoustique**, correction
  d'erreur en avant, système de rooms — plus son intégration FMOD officielle

### Negative

- **175 $ différés, pas supprimés** : 120 $ Dissonance + 55 $ l'intégration FMOD
  (playback), le jour où l'on passe en implémentation B. Aucune des deux n'est achetée à
  ce jour, et **aucune n'est nécessaire pour le MVP**.
  *(Note : FMOD lui-même est **gratuit** sous 200 000 $ de revenu annuel et 500 000 $ de
  financement — les 55 $ ne concernent que le pont Dissonance→FMOD.)*
- **Pas d'AEC en implémentation A — et depuis l'amendement d'ADR-0003, ce n'est plus
  un simple inconfort.** Sans AEC, les haut-parleurs d'un joueur rejouent la voix de
  ses coéquipiers, son micro la capte, et elle entre dans **sa propre analyse
  gameplay** : le meuble qu'il porte réagit à la voix d'un autre. **Le casque devient
  donc un prérequis de validité de la mesure**, pas une recommandation de confort — à
  énoncer comme tel dans les consignes de playtest. Le larsen, lui, reste ouvert jusqu'à B.
- Une interface de plus à définir et maintenir — coût réel, mais faible : l'adaptateur
  était à écrire de toute façon
- Un adaptateur réseau à écrire **et à maintenir nous-mêmes**
- Deux handshakes réseau à orchestrer (session FishNet + session Dissonance) — conséquence
  déjà notée au 2026-07-05 et désormais pleinement assumée
- L'adaptateur **ne sera pas testable sur une seule machine**, pour la même raison que
  FishyFacepunch : le P2P Steam interdit la connexion à soi-même. Le second transport
  prévu pour l'itération locale ne couvrira pas la voix.

### Neutral

- Configuration plus complexe : deux systèmes à initialiser en parallèle
- Latence combinée (Dissonance + FishNet + analyse) à mesurer en conditions réelles

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| ~~**Risque éditeur** : Dissonance abandonné~~ | ~~Moyenne~~ | ~~Élevé~~ | **Levé le 2026-09-03** : Dissonance 9.0.9 publié le 27 avril 2026, intégration FMOD Playback 9.0.7 le même jour. Le fil d'actualité public est muet depuis 2023, mais le produit sort des versions. Risque désormais faible — et de toute façon contenu par l'interface maison |
| L'adaptateur maison s'avère plus coûteux que prévu | Moyenne | Moyen | Dissonance fournit les classes de base ; le P2P Steam donne nativement le canal non fiable non ordonné attendu |
| Impossibilité de tester la voix en local | **Certaine** | Moyen | Contrainte acceptée. Prévoir des sessions de test à 2 machines dès le POC audio |
| Budget 175 $ non engagé au moment où le système est nécessaire | Faible | Faible | **Neutralisé par l'implémentation A** : le MVP fonctionne à 0 $. L'achat devient un choix de confort, pas un blocage |
| L'implémentation A s'avère insuffisante (larsen ingérable en playtest) | Moyenne | Moyen | Bascule en implémentation B — changement contenu derrière l'interface, pas une réécriture |
| **Un testeur joue sans casque et fausse silencieusement la mesure** | **Élevée** | **Élevé** | L'absence d'AEC en implémentation A rend la voix des coéquipiers audible par le micro, donc active dans l'analyse gameplay. Consigne de playtest explicite : **casque obligatoire**. Le danger est que la donnée soit fausse *sans que personne ne s'en aperçoive* — le joueur accuse le jeu d'être injuste |
| Le décodage des trames Steam vers FMOD est plus coûteux que prévu | Moyenne | Moyen | À évaluer au POC audio, en même temps que la contention de périphérique (ADR-0003) |

## Performance Implications

| Metric | Before | Expected After | Budget |
|--------|--------|---------------|--------|
| Réseau (voix) | n/a | codec Opus, à mesurer | distinct du budget gameplay |
| CPU (traitement voix) | n/a | RNNoise + AEC + Opus, à mesurer | — |
| Latence voix | n/a | à mesurer en conditions réelles | — |

## Migration Plan

Rien n'est implémenté. Ordre prévu :

1. **POC audio** — lever la contention de périphérique d'ADR-0003 (analyse + chat vocal sur le même micro)
2. Définir l'**interface de chat vocal** maison
3. **Implémentation A** : voix native Steam décodée vers un event FMOD 3D — 0 $
4. Test à 2 machines (non testable en local : le P2P Steam interdit la connexion à soi-même)
5. *Plus tard, si et seulement si le larsen ou le bruit de fond deviennent pénibles en
   playtest* : achat de Dissonance + pont FMOD (175 $) et **implémentation B** derrière la
   même interface

**Rollback plan** : la bascule A ↔ B est contenue derrière l'interface. Si Dissonance
devenait indisponible, la troisième option resterait **Vivox** — au prix de la lecture
FMOD et d'une dépendance au cloud Unity. Dans les trois cas, le gameplay ne change pas.

## Validation Criteria

- [ ] Le gameplay ne référence que l'interface maison — aucun appel direct à Steam ou Dissonance
- [ ] L'adaptateur transporte la voix sur le P2P Steam sans passer par FishNet
- [ ] **La voix est spatialisée et subit occlusion et réverbération via FMOD, en implémentation A**
- [ ] Les deux sessions (FishNet + chat vocal) coexistent sans conflit de handshake
- [ ] Latence voix jugée acceptable en playtest à 4 joueurs
- [ ] *(implémentation B uniquement)* L'AEC supprime le larsen lorsqu'un joueur joue sans casque
- [ ] *(implémentation B uniquement)* Le passage de A à B ne touche aucun fichier de gameplay

## GDD Requirements Addressed

| GDD Document | System | Requirement | How This ADR Satisfies It |
|-------------|--------|-------------|--------------------------|
| `design/gdd/game-concept.md` | Inspiration — *Lethal Company* | « Chat de proximité obligatoire » | Fournit la voix positionnelle 3D avec atténuation par la distance |
| `design/gdd/game-concept.md` | Pillar 2 — Coopération sous contrainte | « La voix de chacun affecte tout le groupe » | La proximité conditionne qui entend qui |
| `design/mvp-scope.md` | Système 6 — Chat vocal de proximité | « Sans lui, les testeurs passent par Discord et l'atténuation par la distance disparaît du test » | Choisit la solution et son transport |

> TR-ID stables à attribuer par `/architecture-review`.

## Related

- **ADR-0001** — Framework réseau : cet ADR est défini **par opposition** (la voix ne passe pas par FishNet)
- **ADR-0003** — Pipeline d'analyse : retire Dissonance du chemin critique de l'analyse, ce qui rend ce découplage possible
- **Supersede** : l'entrée LOG du 2026-07-05 « Réseau pour l'audio : Dissonance + FishNet sessions parallèles », dont la question ouverte (« Dissonance a-t-il une intégration FishNet officielle ? ») a été tranchée par la négative le 2026-09-03
- Source : `LOG - Décisions techniques.md`, entrée du 2026-09-03
