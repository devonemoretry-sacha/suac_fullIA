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

### Précisions sur #11, #12 et #13

Confirmé par l'utilisateur le 2026-09-03 :

- **#11 — un seul appartement, fait à la main.** La génération procédurale et la
  variété des maps servent la rejouabilité, pas la validation de la boucle. Reportées.
  → Contrainte d'architecture : le level ne doit pas être *conçu* de façon à interdire
  la génération procédurale plus tard (voir *Consequences*).
- **#12 — résolution de fin minimale.** Un écran succès/échec suffit à fermer la
  boucle. L'évaluation détaillée et le scoring du GDD §2.9 sont reportés.

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

- `/map-systems` ne décompose **que** les 13 systèmes ci-dessus.
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
