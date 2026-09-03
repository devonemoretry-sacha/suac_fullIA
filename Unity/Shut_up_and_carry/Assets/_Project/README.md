# Assets/_Project — le code du jeu

Tout ce qui est écrit pour *Shut Up & Carry* vit ici. Le reste de `Assets/` est réservé
aux assets tiers (packages, plugins achetés), pour qu'on puisse toujours distinguer d'un
coup d'œil « notre code » de « le code des autres ».

Le tiret bas devant `_Project` n'a qu'un rôle : garder le dossier en haut de la liste dans
la fenêtre Project d'Unity.

## Arborescence

```
_Project/
  Runtime/            le code qui tourne dans le jeu
    Voice.Core/       le coeur du système vocal — C# pur, sans Unity
    Voice.Capture/    l'accès au microphone (dépend d'Unity)
    Gameplay/         les objets qui réagissent à la voix
  Tests/
    EditMode/         tests unitaires, exécutés sans lancer le jeu
  Settings/           les ScriptableObject de réglage (valeurs de tuning)
  Scenes/             les scènes
```

## Les assemblies (fichiers .asmdef)

Un `.asmdef` découpe le code en **assemblies** compilées séparément. Deux bénéfices :
modifier un fichier ne recompile que son assembly (temps de compilation courts), et une
assembly ne peut utiliser que celles qu'elle déclare en référence (les dépendances sont
explicites et vérifiées par le compilateur).

| Assembly | Rôle | Dépend de |
|---|---|---|
| `SUAC.Voice.Core` | Contrat de données, analyse du signal, calibration | rien |
| `SUAC.Voice.Capture` | Lecture du microphone, orchestration | `Voice.Core` |
| `SUAC.Gameplay` | Objets réactifs à la voix | `Voice.Core`, `Voice.Capture` |
| `SUAC.Tests.EditMode` | Tests unitaires | `Voice.Core` |

### Pourquoi `Voice.Core` n'a aucune référence à Unity

Son `.asmdef` porte `"noEngineReferences": true` : le code de cette assembly **ne peut pas**
utiliser `UnityEngine`. C'est une contrainte volontaire, et c'est la décision structurante
du projet.

`Voice.Core` contient les mathématiques du traitement du signal — mesurer le volume d'un
son, en trouver la hauteur, dire s'il est tenu ou percussif. Ces calculs n'ont besoin que
de nombres. En les coupant d'Unity, on obtient :

- des **tests immédiats** : on vérifie l'analyse sur des sons calculés (un sinus pur, du
  bruit blanc, un clic) sans micro et sans lancer l'éditeur, en quelques millisecondes ;
- du **déterminisme** : mêmes entrées, mêmes sorties, toujours. Une régression se voit ;
- une **compilation rapide** sur toute la durée du projet.

Si un jour du code de `Voice.Core` a besoin d'Unity, c'est le signe qu'il n'est pas à sa
place : il appartient à `Voice.Capture`.

## Conventions

- **Namespaces** : `SUAC.<Domaine>.<SousDomaine>`, alignés sur les dossiers.
- **Valeurs de réglage** : jamais en dur dans le code. Elles vivent dans des
  ScriptableObject sous `Settings/`, pour être ajustées en playtest sans recompiler.
- **Chemin chaud** (analyse audio) : aucune allocation en régime permanent. Les tampons
  sont alloués une fois au démarrage, et un test vérifie que rien n'alloue.

## Documentation de référence

Les décisions de conception sont dans le GDD (`Note d'intention/`) et le vault Obsidian
(`Obsedian SUAC/05 - Journal/LOG - Décisions techniques.md`).
