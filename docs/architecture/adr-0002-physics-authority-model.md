# ADR-0002: Physics Authority Model — Host-Only Computation

## Status

Accepted

## Date

2026-09-03 *(formalisation ; décision d'origine prise le 2026-07-03)*

## Last Verified

2026-09-03

## Decision Makers

Utilisateur (solo dev). Formalisé depuis `Obsedian_SUAC_FIA/05 - Journal/LOG - Décisions techniques.md`.

## Summary

Les objets du jeu réagissent à la voix des joueurs et sont fréquemment portés par
plusieurs joueurs à la fois ; il fallait décider où la physique est calculée pour
garantir la cohérence et empêcher la triche. Décision : **l'hôte calcule seul** les
effets physiques et diffuse le résultat — aucun client ne prédit la position. Une
**couche de retour local non autoritaire** (décalage additif amorti, piloté par la voix
du joueur local) masque la latence sur la réaction, sans jamais anticiper un verdict.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Unity 6.3 LTS (`6000.3.18f1`) |
| **Domain** | Physics / Networking |
| **Knowledge Risk** | MEDIUM — la physique 3D d'Unity (PhysX) est stable et bien couverte, mais son comportement en réplication autoritaire à propriétaire partagé n'est pas validé sur ce projet |
| **References Consulted** | `docs/engine-reference/unity/modules/physics.md`, `docs/engine-reference/unity/modules/networking.md`, `docs/engine-reference/unity/VERSION.md` |
| **Post-Cutoff APIs Used** | Aucune. Le projet utilise la physique 3D intégrée (`com.unity.modules.physics`, PhysX), pas Box2D v3 (nouveauté 6.3, 2D uniquement). |
| **Verification Required** | Comportement du portage collectif (un objet, plusieurs porteurs, plusieurs points d'ancrage) sous réplication autoritaire, en conditions de latence réelle. **Jamais testé.** |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | ADR-0001 (l'autorité hôte suppose une topologie Host + Clients) |
| **Enables** | Les systèmes 2, 3 et 4 du périmètre MVP (effet de la voix sur les objets, portage, mobilier réactif) |
| **Blocks** | Tout epic « Gameplay physique » |
| **Ordering Note** | ADR-0001 doit être Accepted d'abord. ADR-0003 définit ce que l'hôte **reçoit** (des features, pas de l'audio) — les deux se lisent ensemble. |

## Context

### Problem Statement

Le GDD décrit des objets à plusieurs points d'ancrage portés par 2 à 8 joueurs, avec
transfert d'inertie au porteur, secousses propagées aux joueurs proches, ragdoll
collectif et éjection à la séparation. La physique répliquée à propriétaire partagé
est l'un des problèmes les plus difficiles du netcode : sans décision d'autorité
explicite, la désynchronisation est certaine.

### Current State

Aucun code de gameplay physique n'existe. Seule l'analyse vocale (`Voice.Core`) est
écrite, et elle est délibérément ignorante du réseau comme de la physique.

### Constraints

- Topologie Host + Clients imposée par ADR-0001
- Coop casual entre amis : la complexité d'implémentation doit rester proportionnée
- Groupe de moins de 8 joueurs

### Requirements

- Cohérence stricte : deux joueurs ne doivent jamais voir un objet à deux endroits
- Anti-triche mécanique : un joueur ne doit pas pouvoir « simuler » des fréquences pour alléger un objet
- Responsabilité claire de la cohérence

## Decision

### Architecture

**L'hôte calcule SEUL et diffuse le résultat à tous les clients.**

1. L'hôte reçoit les **features vocales** de tous les joueurs (voir ADR-0003)
2. L'hôte applique la distance et le cumul multi-joueurs
3. L'hôte décide si les objets bougent, comment et où
4. L'hôte diffuse le nouvel état physique aux clients

Les clients reçoivent des **états finaux**. Ils n'ont pas de contrôle local immédiat
sur la physique des objets réactifs.

> **Précision importante — l'autorité porte sur la décision, pas sur la mesure.**
> La formulation d'origine (2026-07-03) indiquait « le serveur reçoit les données FFT
> de tous les joueurs » et que l'hôte devait « calculer la FFT pour tous les joueurs ».
> Cette partie a été **corrigée le 2026-07-27** : l'analyse vocale est calculée
> localement par chaque client, qui ne transmet que ses features normalisées
> (voir ADR-0003). L'hôte reste autoritaire sur la **physique** ; il ne calcule plus
> l'analyse. La conséquence « coût CPU de N × FFT sur l'hôte » de l'entrée d'origine
> est donc **caduque**.

### Couche de retour local — prédire la réaction, jamais l'état

**Aucun client ne prédit la transformée d'un objet.** Si quatre porteurs prédisaient
chacun la position du canapé depuis leur propre voix, ils divergeraient : c'est le pire
cas, celui qui produit du rubber-banding sur un objet partagé.

Ce qui est prédit localement, c'est la **manifestation**, pas l'état :

```
position rendue = transformée autoritaire (hôte)
                + décalage local additif, amorti
```

Le décalage local est :

- **piloté par la seule voix du joueur local**, sur son seul écran
- **borné en amplitude** — il doit lire comme une contrainte, une secousse ou une
  déformation, jamais comme un déplacement
- **amorti vers zéro** en ~150–200 ms, de lui-même

Comme il retourne toujours à zéro, il ne peut pas diverger durablement et **il n'y a
jamais de correction brutale** : l'état autoritaire arrive pendant que le décalage
s'éteint déjà. C'est ce qui distingue ce mécanisme de la prédiction classique — il n'y
a rien à réconcilier, donc pas de snap.

#### Pourquoi cette couche est nécessaire ici et pas ailleurs

Dans un jeu multijoueur ordinaire, on masque la latence parce que le joueur ignore ce
que le serveur a décidé. **Ici, le joueur s'entend crier instantanément** : il dispose
d'une vérité terrain à latence zéro sur sa propre entrée. Un aller-retour de 50–100 ms
avant que *son* objet réagisse à *son* cri est donc anormalement visible.

En revanche, **seul le joueur qui crie a ce problème**. Les autres entendent son cri via
le chat vocal, avec sa propre latence (50–150 ms) : pour eux, la cause et l'effet
arrivent tous deux décalés, d'à peu près autant. Leur chaîne cause-effet est déjà
cohérente sans intervention.

> **L'objectif n'est donc pas que tous les joueurs voient la même chose au même instant.
> C'est que chacun ait une cause-effet serrée de son propre point de vue. La cohérence
> est par observateur, pas globale.**

#### Ce qui ne doit jamais être prédit

**Prédire l'avertissement, jamais le verdict.**

La chute de l'objet, le réveil d'un habitant, le ragdoll collectif, la mort : ces états
viennent **exclusivement** de l'hôte. Un « tu as lâché le canapé » prédit puis annulé est
infiniment pire qu'un verdict tardif de 100 ms.

#### Portage solo

Même mécanisme, même chemin de code. Ne pas traiter le portage solo en cas particulier :
cela doublerait la surface de bug pour un gain nul. Si le ressenti reste insuffisant en
solo après prototype, l'option de repli est l'autorité locale au porteur unique
— défendable puisque la triche n'a pas d'enjeu ici (voir ADR-0003) — mais à n'ouvrir
qu'en dernier recours.

### Implementation Guidelines

- Aucune prédiction client sur la **transformée** des objets réactifs à la voix
- Couche de retour local **non autoritaire** obligatoire (voir ci-dessus) — pas optionnelle
- L'amplitude du décalage local doit rester **inférieure** à la réponse autoritaire
  typique, faute de quoi le joueur voit le mouvement deux fois : la secousse prédite,
  puis le vrai déplacement
- L'hôte **borne les valeurs de features reçues** avant de les appliquer (un client
  modifié peut mentir — voir ADR-0003)
- Les états physiques diffusés sont la seule vérité ; les clients n'extrapolent **pas la position**

## Alternatives Considered

### Alternative 1: Prédiction côté client

Chaque joueur calcule la physique localement. **Rejetée** : risque de désynchronisation
dès que deux clients divergent sur un objet partagé.

### Alternative 2: Client → Serveur → diffusion

Le client calcule, le serveur valide, puis diffuse. **Rejetée** : travail dupliqué et
latence supplémentaire pour aucun gain de cohérence.

### Alternative 3: Hybride (prédiction client + validation serveur)

Le modèle le plus réactif, utilisé par les jeux compétitifs. **Rejetée** : trop
complexe pour un coop casual, et la réactivité gagnée ne compense pas le coût
d'implémentation et de débogage sur un projet solo.

## Consequences

### Positive

- **Source unique de vérité : pas de désynchronisation possible**
- Anti-triche mécanique : un joueur ne peut pas fabriquer de fausses fréquences pour
  alléger un objet (l'hôte borne les valeurs reçues)
- Responsabilité claire : l'hôte garantit la cohérence
- Déterminisme possible si un rejeu/replay devient nécessaire

### Negative

- Les clients n'ont **pas de contrôle local immédiat sur l'état** : tout verdict passe
  par l'aller-retour vers l'hôte. Atténué, mais non supprimé, par la couche de retour local
- La couche de retour local est un **coût d'implémentation supplémentaire** : chaque objet
  réactif doit exposer une manifestation locale (secousse, contrainte, déformation) en plus
  de son comportement autoritaire
- **Le lag de l'hôte est le lag de tout le monde** — acceptable en petit groupe, potentiellement en LAN
- La migration d'hôte devient complexe : le nouvel hôte doit reprendre les calculs (post-alpha)

### Neutral

- Charge CPU de l'hôte concentrée sur la physique — allégée depuis que l'analyse
  vocale est passée côté client (ADR-0003)

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Le portage collectif « ne se sent pas bien » sous latence | **Élevée** | **Élevé** | **Risque n°1 du projet.** À valider par un prototype ciblé (un meuble, deux joueurs, connexion dégradée) avant d'implémenter le reste du gameplay physique |
| Le décalage local est mal calibré et le joueur voit le mouvement deux fois | Moyenne | Moyen | Amplitude du décalage strictement inférieure à la réponse autoritaire ; à régler au prototype |
| La couche de retour local ne suffit pas à masquer la latence | Moyenne | Élevé | Repli : autorité locale au porteur unique en solo. En collectif, il n'y a pas de repli simple — ce serait un nouvel ADR (modèle hybride) |
| L'hôte devient un goulot d'étranglement avec 8 joueurs | Faible | Moyen | L'analyse vocale ne pèse plus sur l'hôte (ADR-0003). À mesurer avec 8 joueurs avant la cible finale |
| Déconnexion de l'hôte | Moyenne | Élevé | Hors périmètre MVP (voir ADR-0001) |

## Performance Implications

| Metric | Before | Expected After | Budget |
|--------|--------|---------------|--------|
| CPU hôte (physique) | n/a | non mesuré | 16,6 ms total |
| CPU hôte (analyse vocale) | ~N × FFT *(modèle d'origine)* | **0** — déplacé côté client (ADR-0003) | — |
| Latence perçue sur objets | n/a | ~50–100 ms (aller-retour P2P) | à valider en playtest |

## Migration Plan

Aucune migration : rien n'est implémenté.

**Rollback plan** : la couche de retour local fait désormais partie de l'architecture,
elle n'est plus la porte de sortie. Si le ressenti reste inacceptable **malgré elle**
après prototype, les portes de sortie restantes sont, dans l'ordre : (1) autorité locale
au porteur unique pour le portage solo, (2) un modèle hybride prédiction + réconciliation
— ce dernier serait un nouvel ADR remplaçant celui-ci.

## Validation Criteria

- [ ] Un meuble porté par 2 joueurs reste cohérent sur les deux écrans en conditions de latence normale
- [ ] Un client modifié envoyant des features aberrantes ne modifie pas anormalement la physique (bornage effectif)
- [ ] **Le joueur qui crie perçoit une réaction de son objet en moins de 50 ms** (couche locale)
- [ ] **Aucune correction visible (snap) quand l'état autoritaire arrive** — le décalage local s'est amorti
- [ ] **Aucun verdict n'est prédit** : chute, réveil d'habitant et ragdoll viennent exclusivement de l'hôte
- [ ] Le ressenti du portage collectif est jugé acceptable en playtest à 4 joueurs
- [ ] Aucune désynchronisation observée sur une session complète

## GDD Requirements Addressed

| GDD Document | System | Requirement | How This ADR Satisfies It |
|-------------|--------|-------------|--------------------------|
| `design/gdd/game-concept.md` | Pillar 1 — Voice-Physics | « Le poids, la texture et le comportement des objets réagissent en temps réel à la voix » | Définit qui calcule cette réaction et diffuse le résultat |
| `design/gdd/game-concept.md` | Technical Risks | « Physique répliquée à propriétaire partagé » | Tranche le modèle d'autorité, condition préalable à toute implémentation |
| `design/mvp-scope.md` | Systèmes 2, 3, 4 | Effet de la voix sur les objets, portage collectif, mobilier réactif | Fixe où ces calculs vivent |

> TR-ID stables à attribuer par `/architecture-review`.

## Related

- **ADR-0001** — Framework et topologie réseau : prérequis
- **ADR-0003** — Pipeline d'analyse vocale : **corrige** la partie « l'hôte calcule la FFT » de la décision d'origine
- Source : `LOG - Décisions techniques.md`, entrée du 2026-07-03 « Où calculer les effets physiques : Server (Host) only », corrigée par l'entrée du 2026-07-27 sur la séparation des voies audio
