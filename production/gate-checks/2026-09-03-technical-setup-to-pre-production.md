# Gate Check: Technical Setup → Pre-Production

**Date**: 2026-09-03
**Checked by**: `/gate-check` skill
**Review mode**: `lean`
**Stage réel du projet**: `Systems Design` — *cette porte a été passée comme **inventaire prospectif**, pas comme tentative de franchissement*

> **Pourquoi cette porte, à ce stade ?** Le projet a une forme non linéaire : les
> artefacts de Technical Setup existent déjà en partie (6 ADR acceptées, moteur épinglé,
> docs de référence) alors que ceux de Systems Design sont à zéro. C'est la conséquence
> de la rétro-documentation — les décisions techniques étaient prises dans
> `LOG - Décisions techniques.md`, les GDD ne l'étaient pas. Passer cette porte
> maintenant sert à **inventorier ce qui manquera de toute façon**, et à vérifier que
> ce travail ne dépend pas des GDD.

---

## Required Artifacts : 3 présents / 2 partiels / 8 absents

| État | Artefact | Détail |
|---|---|---|
| ✅ | Moteur choisi | Unity 6.3 LTS `6000.3.18f1` dans `CLAUDE.md` |
| ✅ | Préférences techniques | `.claude/docs/technical-preferences.md` renseignée intégralement |
| ✅ | Docs de référence moteur | `docs/engine-reference/unity/` — corrigées et enrichies des changements 6.2 → 6.3 |
| ⚠️ | ≥ 3 ADR sur systèmes Foundation | **6 ADR, toutes `Accepted`** — mais aucune ne couvre les systèmes que la porte nomme explicitement (gestion de scène, architecture événementielle, sauvegarde). Les 6 portent sur réseau, autorité physique, pipeline vocal, frontière de données, chat vocal, découpage en assemblies. |
| ⚠️ | Au moins un test d'exemple | 5 fichiers de test EditMode existent, mais dans `Unity/Shut_up_and_carry/Assets/_Project/Tests/EditMode/` — **pas** dans `tests/`. Le harnais du template n'existe pas ; celui d'Unity, si. |
| ❌ | `design/art/art-bible.md` | absent |
| ❌ | `tests/unit/` + `tests/integration/` | le répertoire `tests/` n'existe pas |
| ❌ | `.github/workflows/tests.yml` | `.github/` n'existe pas |
| ❌ | `docs/architecture/architecture.md` | absent |
| ❌ | Index de traçabilité | absent — voir *Défaut de template* plus bas |
| ❌ | Rapport `/architecture-review` | jamais lancé |
| ❌ | `design/accessibility-requirements.md` | absent |
| ❌ | `design/ux/interaction-patterns.md` | absent |

---

## Quality Checks : 5 passent / 4 échouent

### Ce qui passe — vérifié fichier par fichier

- ✅ **Les 6 ADR portent leur section `Engine Compatibility`**, avec version moteur estampillée
- ✅ **Les 6 ADR portent leur section `GDD Requirements Addressed`** (ADR-0006 utilise la forme sanctionnée « Foundational — no GDD requirement »)
- ✅ **Les 6 ADR portent leur section `ADR Dependencies`**
- ✅ **Toutes déclarent la même version moteur** — une seule valeur distincte au grep : `Unity 6.3 LTS (6000.3.18f1)`. Aucune référence de version obsolète.
- ✅ **Aucune API dépréciée utilisée.** Les deux mentions de *Netcode for GameObjects* sont des **alternatives rejetées** (ADR-0001 § Alternatives, ADR-0005 § liste des intégrations Dissonance), pas des usages.
- ✅ **Conventions de nommage et budgets de performance fixés** dans les préférences techniques
- ✅ **Aucun domaine moteur HIGH RISK non traité** — `VERSION.md` classe le risque global en MEDIUM ; les versions 6.4 et 6.5 marquées *DO NOT USE* ne sont référencées par aucun ADR

### Ce qui échoue

- ❌ **Les décisions d'architecture ne couvrent pas les systèmes cœur nommés par la porte** : rien sur le rendu, l'input, ni la gestion d'état. La décision URP existe dans `LOG - Décisions techniques.md` (2026-09-03) et avait été identifiée comme ADR-0007 optionnelle dans le plan d'adoption — jamais écrite.
- ❌ **Palier d'accessibilité non défini.** « Basic » serait acceptable ; *indéfini* ne l'est pas.
- ❌ **Aucune spec UX commencée.**
- ❌ **Matrice de traçabilité inexistante**, donc l'exigence « zéro trou en couche Foundation » n'est pas vérifiable.

---

## ADR Circular Dependency Check : ✅ AUCUN CYCLE

Graphe construit depuis les sections `Depends On` des 6 ADR :

```
ADR-0001  ← racine (None)
ADR-0006  ← racine (None)

ADR-0002 → ADR-0001
ADR-0003 → ADR-0006
ADR-0004 → ADR-0006, ADR-0003
ADR-0005 → ADR-0001, ADR-0003
```

Graphe acyclique, deux racines fondatrices. Aucune ADR n'est empêchée d'atteindre
`Accepted` — et toutes y sont déjà.

---

## Engine Validation : ✅

- Toutes les ADR portent un champ `Knowledge Risk` renseigné
- Toutes s'accordent sur `6000.3.18f1`
- Aucun usage d'API dépréciée
- ❌ L'audit moteur de `/architecture-review` n'a pas été lancé (l'outil lui-même manque, pas son résultat)

---

## Le résultat utile de cet inventaire

**Aucun des huit artefacts manquants ne dépend des GDD.** Ce travail est parallélisable
avec l'écriture des 19 GDD — il n'attend rien.

**Trois commandes comblent six des huit trous :**

| Commande | Comble |
|---|---|
| `/test-setup` | `tests/unit/`, `tests/integration/`, workflow CI, test d'exemple |
| `/create-architecture` | `architecture.md` **et** la liste des ADR requis — qui révélerait les trous rendu / input / gestion d'état |
| `/ux-design` | `accessibility-requirements.md` **et** `interaction-patterns.md` en une passe |

Restent `/art-bible`, et `/architecture-review` — ce dernier ayant besoin des GDD pour
peupler le registre TR.

---

## Défaut de template relevé au passage

La définition de cette porte réclame `docs/architecture/requirements-traceability.md`.
Mais `docs/CLAUDE.md` prescrit `docs/architecture/architecture-traceability.md`.

**Deux noms pour le même fichier.** Quel que soit celui qu'on crée, une des deux
références sera fausse. À trancher au moment de générer le fichier — et à corriger
dans l'autre document.

---

## Verdict : **FAIL**

Attendu et sans gravité : le projet n'a jamais prétendu être en fin de Technical Setup.
`production/stage.txt` reste sur `Systems Design`.

La valeur de ce passage n'est pas le verdict, c'est la **liste de courses** ci-dessus.

*Chain-of-Verification : 5 questions vérifiées, dont 3 par relecture de fichiers
(statuts ADR, cohérence de version moteur, absence d'API dépréciée) — verdict inchangé.*

---

## Prochaine action retenue

`/create-architecture` — pour produire le document maître **et** la liste des ADR requis,
qui devrait faire remonter les décisions rendu / input / gestion d'état absentes.
