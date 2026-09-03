# ADR-0001: Networking Framework and Topology — FishNet over Steam P2P

## Status

Accepted

## Date

2026-09-03 *(formalisation ; décisions d'origine prises les 2026-06-28, 2026-07-03 et 2026-07-04)*

## Last Verified

2026-09-03

## Decision Makers

Utilisateur (solo dev). Formalisé depuis `Obsedian_SUAC_FIA/05 - Journal/LOG - Décisions techniques.md`.

## Summary

Le jeu est un coop 2 à 8 joueurs sur PC/Steam sans budget d'infrastructure serveur ;
il fallait choisir un framework réseau, une topologie et un transport. Décision :
**FishNet** en mode Server Authoritative, topologie **Host + Clients** (un joueur
héberge), transport **Steam P2P** via **Facepunch.Steamworks + FishyFacepunch**.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Unity 6.3 LTS (`6000.3.18f1`) |
| **Domain** | Networking |
| **Knowledge Risk** | MEDIUM — FishNet, Facepunch.Steamworks et FishyFacepunch sont des dépendances tierces dont les versions évoluent indépendamment du moteur |
| **References Consulted** | `docs/engine-reference/unity/VERSION.md`, `docs/engine-reference/unity/deprecated-apis.md`, `docs/engine-reference/unity/modules/networking.md` |
| **Post-Cutoff APIs Used** | Aucune API Unity post-cutoff. Les dépendances sont tierces, hors du périmètre du moteur. |
| **Verification Required** | Confirmer la compatibilité de FishNet et FishyFacepunch avec Unity 6.3 au moment de l'installation — aucun des deux n'est encore dans `Packages/manifest.json`. Configurer l'AppID Steam avant tout test multijoueur. |

> **Note importante liée à la version d'Unity** : Unity 6.3 déprécie **Netcode for
> GameObjects 1.x** (voir `deprecated-apis.md`). Cela renforce le rejet de NGO comme
> alternative : la majorité de la documentation NGO disponible en ligne porte sur la
> 1.x, désormais dépréciée. Ce n'est pas la raison du choix d'origine (2026-06-28,
> antérieur), mais cela le conforte.

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | None — décision fondatrice |
| **Enables** | ADR-0002 (modèle d'autorité physique), ADR-0005 (transport du chat vocal, défini par opposition à celui-ci) |
| **Blocks** | Tout epic « Réseau » ; le système 9 du périmètre MVP (`design/mvp-scope.md`) |
| **Ordering Note** | Doit être Accepted avant toute ligne de netcode. ADR-0002 en dépend directement : l'autorité host n'a de sens que sur une topologie Host + Clients. |

## Context

### Problem Statement

Le jeu est coopératif de 2 à 8 joueurs (MVP : 4). Sans décision réseau, aucun système
du périmètre MVP ne peut être implémenté — le portage collectif, la réaction des
objets et la perception des habitants sont tous des états partagés. Le coût de ne pas
décider est un blocage total de la Production.

### Current State

Aucun code réseau n'existe. `Packages/manifest.json` ne contient aucun package
réseau hormis `com.unity.multiplayer.center` (outil d'aide au choix, pas un runtime).
`Voice.Core` est volontairement `noEngineReferences` et ignore tout du réseau.

### Constraints

- Budget d'infrastructure nul : pas de serveur dédié envisageable
- Cible PC / Steam uniquement (décision du 2026-07-06)
- Groupe d'amis, pas de matchmaking public à grande échelle
- Anti-triche nécessaire mécaniquement, pas contractuellement (pas de classement, pas d'économie réelle)

### Requirements

- Supporter 8 joueurs simultanés en cible finale, 4 au MVP
- Aucune configuration réseau demandée au joueur (pas d'ouverture de ports)
- Autorité unique pour éviter la désynchronisation sur la physique partagée

## Decision

### Architecture

**FishNet (Fish-Networking)**, en **Server Authoritative**, topologie **Host + Clients** :
un joueur héberge la session et fait autorité ; les autres sont clients. Le transport
est **Steam P2P**, via **Facepunch.Steamworks** (binding C#, NuGet) et
**FishyFacepunch** (transport officiel FishNet pour Facepunch).

Le Lobby Steam sert d'**annuaire**, pas de serveur : l'hôte y publie son `SteamID`
en métadonnée, le client le lit puis demande au transport de s'y connecter. Le NAT
punchthrough de Steam évite toute configuration réseau côté joueur.

### Key Interfaces

- `[ServerRpc]` — client → serveur (demande d'action)
- `[ObserversRpc]` — serveur → tous les clients (diffusion de résultat)
- `[TargetRpc]` — serveur → un client ciblé
- `[SyncVar]` — état serveur répliqué automatiquement, modifiable **par le serveur seul**
- `NetworkObject` — obligatoire sur tout objet répliqué ; le spawn est réservé au serveur
- `OnRemoteConnectionState` — arrivée/départ d'un joueur

### Implementation Guidelines

- Le serveur est autorité : le client demande, il ne décide pas.
- Tout préfab réseau doit figurer dans la **Spawnable Prefabs List** du `NetworkManager`,
  faute de quoi FishNet ne peut pas l'instancier côté client.
- Préférer les `SyncVar` aux RPC répétés pour les états (santé, porte ouverte/fermée).
- La migration d'hôte n'est **pas** implémentée au MVP : à la déconnexion de l'hôte,
  tout le monde est déconnecté (voir Risks).

## Alternatives Considered

### Alternative 1: Mirror

Communauté plus large, mais architecture jugée moins moderne et prédiction/physique
plus faibles. Rejetée.

### Alternative 2: Netcode for GameObjects (Unity)

Solide, mais moins de documentation Steamworks native au moment du choix. *Argument
renforcé depuis* : NGO 1.x est déprécié en Unity 6.3, ce qui périme l'essentiel de la
documentation communautaire existante. Rejetée.

### Alternative 3: Networking custom

Trop coûteux en développement, test et maintenance pour un projet solo. Rejetée.

### Alternative 4 (topologie): Peer-to-peer pur

Pas d'autorité unique : désynchronisation garantie sur la physique partagée et triche
triviale. Rejetée.

### Alternative 5 (topologie): Serveur dédié

Surdimensionné budgétairement, et latence inutile pour du coop casual entre amis. Rejetée.

### Alternative 6 (transport): Steamworks.NET

Binding obsolète, maintenu passivement. Rejetée au profit de Facepunch.Steamworks.

### Alternative 7 (transport): plugins Steam de l'Asset Store

Obscurs, dépendances cachées, support incertain. Rejetée — le choix NuGet donne un
versionning transparent.

## Consequences

### Positive

- Aucune infrastructure serveur à financer ou maintenir
- Anti-triche mécanique : l'hôte valide tout
- Aucune configuration réseau demandée au joueur (NAT punchthrough Steam)
- FishNet, Facepunch.Steamworks et FishyFacepunch sont gratuits et open source
- Intégration native Steam : lobbies et matchmaking sans wrapper

### Negative

- **Server Authoritative rend la prédiction client difficile** — accepté pour du coop casual
- L'hôte est un goulot d'étranglement s'il calcule lourd (voir ADR-0002 et ADR-0003 :
  l'analyse vocale a précisément été déplacée côté client pour cette raison)
- Déconnexion de l'hôte = fin de partie tant que la migration n'est pas implémentée
- Latence = latence Steam P2P (~50–100 ms intra-Europe, jugée acceptable)
- Courbe d'apprentissage FishNet ; documentation parfois éparse
- Installation NuGet plutôt qu'Asset Store : gestion de dépendances à apprendre

### Neutral

- L'hôte doit disposer d'un débit montant correct — sans objet pour un petit groupe
- Pas de GUI Steam intégrée : à implémenter ou à sourcer

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Incompatibilité FishNet / FishyFacepunch avec Unity 6.3 | Faible | Élevé | Vérifier à l'installation, avant d'écrire du netcode |
| Déconnexion de l'hôte en cours de partie | Moyenne | Moyen | Accepté au MVP (tout le monde est déconnecté). Migration d'hôte étudiée post-alpha |
| Instabilité de Facepunch.Steamworks | Faible | Moyen | Facepunch est un studio établi ; risque jugé faible |
| AppID Steam non configuré au moment des tests | Moyenne | Élevé | **Bloquant pour tout test multijoueur** — à traiter comme prérequis de fixture |
| Impossibilité de tester en local sur une seule machine | Élevée | Moyen | Le P2P Steam interdit la connexion à soi-même. Prévoir un **second transport** (LAN/local) pour l'itération de développement |

## Performance Implications

| Metric | Before | Expected After | Budget |
|--------|--------|---------------|--------|
| CPU (frame time) | n/a | non mesuré | 16,6 ms total (voir `technical-preferences.md`) |
| Network (features vocales) | n/a | ~5 floats × 20–30 Hz × N joueurs | à mesurer |
| Latence P2P Steam | n/a | ~50–100 ms intra-Europe | acceptable pour coop casual |

Les chiffres sont des estimations issues du LOG, **non mesurées**. À instrumenter dès
la première session réseau réelle.

## Migration Plan

Aucune migration : rien n'existe encore.

1. Installer Facepunch.Steamworks (NuGet) et FishNet + FishyFacepunch
2. Configurer l'AppID Steam (prérequis bloquant)
3. Mettre en place un second transport local pour l'itération sans Steam
4. Valider une session à 2 machines avant d'implémenter quoi que ce soit d'autre

**Rollback plan** : FishNet et le transport sont isolés derrière l'abstraction de
transport de FishNet. Un changement de transport (LAN, Mirror) n'affecterait pas la
logique de jeu. Un changement de *framework* serait en revanche une réécriture — d'où
l'importance de valider la compatibilité tôt.

## Validation Criteria

- [ ] Session à 4 joueurs établie via Steam P2P, sans configuration réseau côté joueur
- [ ] Spawn serveur répliqué correctement chez tous les clients
- [ ] Un client modifié ne peut pas modifier une `SyncVar`
- [ ] Latence mesurée intra-Europe conforme à l'estimation (~50–100 ms)
- [ ] Itération de développement possible sans Steam (second transport)

## GDD Requirements Addressed

| GDD Document | System | Requirement | How This ADR Satisfies It |
|-------------|--------|-------------|--------------------------|
| `design/gdd/game-concept.md` | Core Identity | « Coop 2 à 8 (cible finale) — MVP : 4 » | Topologie Host + Clients dimensionnée pour <8 joueurs |
| `design/gdd/game-concept.md` | Core Identity | « Platform : PC — Steam » | Transport Steam P2P, cohérent avec la cible unique |
| `design/mvp-scope.md` | Système 9 — Réseau 4 joueurs | « Prérequis de tout le reste » | Définit le framework, la topologie et le transport |

> Les TR-ID stables seront attribués par `/architecture-review` une fois les GDD par
> système écrits. Cette table sera complétée à ce moment-là.

## Related

- **ADR-0002** — Modèle d'autorité physique : en dépend directement
- **ADR-0005** — Transport du chat vocal : défini **par opposition** à cet ADR (le chat vocal ne passe délibérément pas par FishNet)
- **ADR-0003** — Pipeline d'analyse vocale : détermine ce qui transite sur le réseau (features, pas audio brut)
- Source : `Obsedian_SUAC_FIA/05 - Journal/LOG - Décisions techniques.md`, entrées des 2026-06-28, 2026-07-03 et 2026-07-04
- Note de référence : `Obsedian_SUAC_FIA/04 - Tech/TECH - FishNet.md`
