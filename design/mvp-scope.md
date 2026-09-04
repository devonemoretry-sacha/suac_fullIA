# MVP Scope — Shut Up & Carry !

**Decided**: 2026-09-03
**Status**: Accepted
**Source**: session `/project-stage-detect`, arbitrages utilisateur

---

## Objective

**« La boucle de contrat tient. »**

La première version jouable doit prouver qu'une partie complète fonctionne de bout
en bout : arriver sur un contrat, vider l'appartement sous contrainte vocale,
subir la menace d'un habitant, s'extraire ou échouer. Ce n'est pas seulement la
validation de la Voice-Physics — c'est la validation de la **tension silence/chaos
sur une session entière**.

**Cible joueurs** : 4 joueurs simultanés.

---

## In Scope

Ces systèmes sont décomposés (`/map-systems`), spécifiés (`/design-system`) et
construits maintenant.

| # | Système | Justification | État actuel |
|---|---------|---------------|-------------|
| 1 | **Voice-Physics — analyse** | Mécanique centrale. Loudness, pitch, enveloppe. | ✅ `Voice.Core` écrit et testé |
| 2 | **Voice-Physics — effet sur les objets** | La moitié manquante : traduire `VoiceFrame` en comportement physique. | ❌ Non commencé |
| 3 | **Portage d'objets** | Solo et collectif, points d'ancrage multiples. Cœur de la coopération forcée. | ❌ Non commencé |
| 4 | **Mobilier réactif — 2 à 3 types contrastés** | Prouve que le système généralise à des comportements différents. | ❌ Non commencé |
| 5 | **Un habitant** | Perception sonore, point d'intérêt unique, états routine/alerte. Source de la peur. | ❌ Non commencé |
| 6 | **Chat vocal de proximité** | Sans lui, les testeurs passent par Discord et l'atténuation par la distance — un pilier — disparaît du test. | ❌ Non commencé |
| 7 | **Boucle de contrat** | Arrivée, vidage, extraction, échec. C'est l'objet même du MVP. | ❌ Non commencé |
| 8 | **Mort + espace des morts** | La capture tue ; le joueur mort observe et parle aux autres morts. Condition d'échec lisible. | ❌ Non commencé |
| 9 | **Réseau 4 joueurs** | Prérequis de tout le reste. FishNet retenu. | ❌ Non commencé |
| 10 | **3C — caméra FPS, contrôles, personnage** | Socle d'interaction. | ❌ Non commencé |
| 11 | **Un appartement unique, fait à la main** | Support physique du contrat. Pas de génération procédurale. | ❌ Non commencé |
| 12 | **Résolution de fin de contrat minimale** | Écran succès / échec. Pas d'évaluation détaillée. | ❌ Non commencé |
| 13 | **Calibration vocale par joueur** | **Techniquement obligatoire** (ADR-0004 : plancher de bruit, repos, médiane, cri) et **porteuse de l'onboarding** (voir `game-concept.md` § Flow State Design). | ❌ Non commencé |
| 14 | **Session / lobby** | **Prérequis de validation, pas un confort** : sans moyen de créer et rejoindre une partie, aucun test à 4 joueurs n'est possible. ADR-0001 décrit le Lobby Steam comme annuaire ; aucune entrée ne couvrait le flux. | ❌ Non commencé |

### Précisions sur #11, #12, #13 et #14

Confirmé par l'utilisateur le 2026-09-03 :

- **#11 — un seul appartement, fait à la main.** La génération procédurale et la
  variété des maps servent la rejouabilité, pas la validation de la boucle. Reportées.
  → Contrainte d'architecture : le level ne doit pas être *conçu* de façon à interdire
  la génération procédurale plus tard (voir *Consequences*).
- **#12 — résolution de fin minimale.** Un écran succès/échec suffit à fermer la
  boucle. L'évaluation détaillée et le scoring du GDD §2.9 sont reportés.

---

## Milestone intermédiaire — « Bac à sable Voice-Physics »

**Ajouté le 2026-09-03**, sur recommandation du producteur (gate PR-SCOPE).

### Le problème que ce palier résout

Les 19 systèmes de la décomposition sont **tous** en tier MVP. Aucun point d'arrêt
montrable n'existe entre « rien » et « la boucle de contrat tient ». Formulé
crûment par le producteur :

> « À 70 % du travail, vous n'avez pas 70 % d'un produit — vous avez zéro produit
> et un dépôt. »

Un tier ne sert pas seulement à délimiter le périmètre : il crée des **points
d'arrêt livrables**. Sans lui, les deux coupes les plus probables sous pression de
temps — le chat vocal et l'habitant — sont toutes deux **cassantes** : sans chat
vocal, l'atténuation par la distance disparaît du test ; sans habitant, il ne reste
pas d'horreur.

### Définition du palier

**Objectif** : répondre à « est-ce que moduler sa voix sous la panique est amusant ? »
— la question que la *Note de séquencement* de ce document identifie depuis le début
sans en avoir tiré la conséquence structurelle.

**Cible** : 2 joueurs, un meuble, un appartement. **Pas d'habitant, pas de boucle de
contrat, pas de mort, pas d'extraction.**

**Systèmes inclus** — 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13 *(numérotation de
`design/gdd/systems-index.md`)*, plus une version dégradée du 14 : **voix native
Steam**, sans occlusion. C'est suffisant — l'occlusion ne devient critique qu'avec
l'habitant et des pièces où se cacher, donc aux systèmes 15 et 16.

**Systèmes exclus du palier** : 8 (session/lobby — connexion directe suffit à deux),
15, 16, 17, 18, 19.

**Critère de réussite** : deux joueurs portent un meuble ensemble, leurs voix
l'affectent visiblement, et une tierce personne qui regarde la session **rit**.
C'est montrable, c'est filmable, et ça ne retire rien du périmètre final.

---

## Out of Scope

Ces éléments **restent dans le GDD comme vision**. Ils ne sont ni décomposés en
systèmes, ni spécifiés, ni estimés tant que le MVP n'est pas validé.

| Élément | Référence GDD | Pourquoi reporté |
|---|---|---|
| **Communication non-verbale** (suivi de tête, pointage du doigt) | §2.4 | Soupape utile, mais la boucle tient sans elle. Non retenu par l'utilisateur. |
| **Économie, boutique, déployables** (boîte à musique) | §2.7 | Ne prouve rien tant que la boucle n'est pas validée. |
| **Bestiaire complet** (habitants au-delà du premier) | §2.5 | Un habitant suffit à prouver la tension. Chaque habitant supplémentaire = un système d'IA + réseau. |
| **Mobilier au-delà de 3 types** (Frigo-Fusée, TV Perroquet…) | §2.6 | Comportements complexes, forte charge de design, d'équilibrage et de cas réseau. |
| **Évaluation & débriefing détaillés** | §2.9 | Réduit à une résolution succès/échec (voir #12). |
| **Progression** | §1.5 | La progression est « dans le joueur », donc émergente — rien à construire pour le MVP. |
| **Génération procédurale / variété des maps** | §2.8 | Sert la rejouabilité, pas la validation. |
| **Support 6 à 8 joueurs** | §1.1 | Cible finale conservée. Le GDD affirme que les seuils sonores sont invariants au nombre de joueurs — affirmation à tester après le MVP. |

---

## Consequences

- `/map-systems` ne décompose **que** les 14 systèmes ci-dessus. La décomposition
  effectuée le 2026-09-03 en a tiré **19 systèmes concevables** — voir
  `design/gdd/systems-index.md`. Les 5 systèmes supplémentaires sont des
  décompositions, pas des ajouts de périmètre.
- `/design-system` n'écrit un GDD à 8 sections que pour ceux-là.
- Tout ajout au périmètre passe par une révision datée de ce document, pas par
  une décision implicite en cours de sprint.
- Le passage à 8 joueurs et la génération procédurale sont les deux reports qui
  peuvent invalider des choix d'architecture. Les ADR réseau et level doivent donc
  être écrits **en les anticipant**, même s'ils ne sont pas construits.

## Note de séquencement

L'objectif retenu (« la boucle tient ») est plus large que la seule validation de
la mécanique centrale. La question « moduler sa voix sous la panique est-il amusant
à quatre ? » reste donc sans réponse jusqu'à ce que la boucle soit jouable. Rien
n'empêche de la tester tôt à l'intérieur de ce périmètre : les systèmes 1 à 4
suffisent à un test de plaisir, avant même l'habitant et l'extraction.

---

## Revision History

| Date | Changement | Auteur |
|------|-----------|--------|
| 2026-09-03 | Périmètre initial arrêté | Utilisateur, via `/project-stage-detect` |
| 2026-09-03 | #11 (appartement unique fait main) et #12 (résolution de fin minimale) confirmés — plus d'hypothèses ouvertes | Utilisateur |
| 2026-09-03 | **Ajout du système 13 — calibration vocale par joueur.** Découvert en relisant `game-concept.md` : obligatoire techniquement (ADR-0004) et porteuse de l'onboarding. Le périmètre passe de 12 à 13 systèmes. | Utilisateur |
| 2026-09-03 | **Ajout du système 14 — session / lobby.** Révélé par `/map-systems` : sans flux « créer / rejoindre une partie », aucun test à 4 joueurs n'est possible. Le périmètre passe de 13 à 14 entrées. | Utilisateur |
| 2026-09-03 | **Ajout du palier intermédiaire « Bac à sable Voice-Physics »** (gate PR-SCOPE). Le MVP monolithique n'offrait aucun point d'arrêt montrable ; les deux coupes probables sous pression étaient cassantes. Aucun retrait de périmètre. | Utilisateur |
| 2026-09-03 | **Décision Dissonance reportée au POC audio** (et non plus « jusqu'au système 14 »). Le palier bac à sable n'a pas besoin d'occlusion : voix native Steam suffit. La vraie décision se prend quand l'habitant et les pièces à contourner arrivent. | Utilisateur |
