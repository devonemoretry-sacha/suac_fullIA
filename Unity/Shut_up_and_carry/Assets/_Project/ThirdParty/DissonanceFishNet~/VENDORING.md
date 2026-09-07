# Dissonance ⇄ FishNet — intégration vendorisée

> **Ce dossier est inerte.** Son nom se termine par `~`, donc Unity l'ignore
> intégralement : rien n'est compilé, aucun `.meta` n'est généré, aucune erreur n'est
> levée. Il s'active par un **renommage**, et pas avant que ses deux dépendances existent.

## Pourquoi ce code est ici et pas en dépendance

Décidé par **ADR-0008** le 2026-09-07, après audit. Résumé du raisonnement :

L'intégration FishNet de Dissonance est **communautaire**, pas officielle. Son auteur
d'origine a renommé son compte `LambdaTheDev` en **`ltd-backup`** et n'a plus commité depuis
avril 2024. Le dépôt reste vivant par contributions extérieures — dont une de **Martin
Evans, l'auteur de Dissonance lui-même** — mais personne n'en assure le suivi de versions.

Le cœur fait **~27 Ko, environ 800 lignes**, sous licence **MIT**. À cette taille, ce n'est
pas une dépendance à subir : c'est un point de départ à adopter. Nous ne parions pas sur un
mainteneur, nous reprenons 800 lignes que nous saurons relire.

## Provenance

| Champ | Valeur |
|---|---|
| Dépôt | https://github.com/ltd-backup/DissonanceVoiceForFishNet |
| Commit épinglé | `18386e0fee21a3dfca0d121db10950fd10bc8d3c` |
| Date de récupération | 2026-09-07 |
| Licence | **MIT** — voir `LICENSE`, © 2022 LambdaTheDev |
| Chemin amont | `Assets/Dissonance/Integrations/FishNet/` |

**Import à l'identique.** Aucune modification n'a été apportée aux sources : indentation
irrégulière, commentaires et coquilles de l'amont sont conservés tels quels, pour que le
diff avec l'amont reste lisible. Toute modification de notre fait sera un commit séparé et
sera consignée plus bas.

### Ce qui a été repris

```
DissonanceFishNetComms.cs            7 564    orchestrateur — c'est ici que vit le défaut #12
DissonanceFishNetPlayer.cs           7 085
DissonanceFishNetServer.cs           3 991
DissonanceFishNetClient.cs           2 662
DissonanceFishNetConnection.cs       2 068
Broadcasts/…Broadcast.cs             2 083
Utils/BroadcastHelper.cs             1 182    contient du code `unsafe`
Utils/LoggingHelper.cs                 723
Constants/…Constants.cs                485
Editor/…CommsEditor.cs                 397
Editor/…PlayerEditor.cs                208
DissonanceVoip.FishNet.asmdef
Editor/DissonanceVoip.FishNet.Editor.asmdef
LICENSE
```

### Ce qui a été écarté

Le dossier `Demos/` de l'amont — contrôleur de menu de débogage, spawner et contrôleur de
personnage de démonstration. Environ 8 Ko sans intérêt pour ce projet, et qui traîneraient
des dépendances de scène.

## Ce qu'il faut savoir avant d'activer

### 1. Les deux dépendances n'existent pas encore

Au 2026-09-07, `Packages/manifest.json` ne contient **aucun paquet réseau**, et Dissonance
n'est pas dans `Assets/`. C'est la raison même du suffixe `~` : ce code ne compile pas sans
eux, et l'activer trop tôt mettrait le projet en erreur permanente — les 41 tests de
`SUAC.Voice.Core` compris.

### 2. Dissonance ne livre pas d'asmdef

C'est documenté par l'éditeur : Dissonance **ne fournit pas** d'assembly definitions, il est
seulement *prévu* pour qu'on en ajoute. Il faut donc les créer nous-mêmes après achat, selon
leur convention — `Dissonance.asmdef` sous `Assets/Plugins/Dissonance/`, plus
`DissonanceEditor.asmdef` et `DissonanceIntegrations.asmdef`.

### 3. Les références des asmdef sont par GUID — elles vont casser

Les deux asmdef repris référencent leurs dépendances **par GUID**, pas par nom :

```
"references": [ "GUID:61106e8dfb7a4e64a96af0eccfe1209f",
                "GUID:7c88a4a7926ee5145ad2dfa06f454c67" ]
```

Ces GUID sont ceux **du projet de l'auteur**. Ceux de FishNet ont une chance de résoudre,
puisqu'ils voyagent avec le paquet. **Ceux de Dissonance ne résoudront pas** : nous créerons
ses asmdef nous-mêmes (point 2), et Unity leur attribuera de nouveaux GUID aléatoires.

Il faudra donc réécrire les références **par nom**, ce qu'Unity accepte :

```json
"references": [ "Dissonance", "FishNet.Runtime" ]
```

…et pour l'éditeur, en y ajoutant `DissonanceEditor` et l'assembly éditeur de FishNet. Les
noms exacts sont à confirmer sur les paquets réellement installés — **ne pas recopier cette
ligne les yeux fermés.**

### 4. Un défaut connu nous attend

Issues [#11](https://github.com/ltd-backup/DissonanceVoiceForFishNet/issues/11) et
[#12](https://github.com/ltd-backup/DissonanceVoiceForFishNet/issues/12), ouvertes depuis le
2025-01-29, jamais corrigées en amont :

> Si le serveur utilise un **authenticator**, le client est éjecté —
> *« sent a broadcast which requires authentication, but client was not authenticated »*.
> Dissonance démarre et émet **avant** que le client soit authentifié.

**Nous traverserons ce chemin** : notre topologie est P2P Steam via FishyFacepunch
(ADR-0001), où un authenticator à ticket Steam est le motif standard.

La cause est visible dans `DissonanceFishNetComms.cs` : `ManageNetworkEvents` s'abonne à
`ClientManager.OnClientConnectionState`, et `AdjustDissonanceRunningMode()` se déclenche sur
`LocalConnectionState.Started`. Or `Started` est l'état **du transport**, pas de
l'authentification — il survient avant que l'authenticator ait tourné.

La piste de correction est d'attendre l'événement d'authentification de FishNet plutôt que
l'état de connexion du transport, côté client comme côté serveur. **À valider en
compilant** : les noms d'événements dépendent de la version de FishNet et ne sont pas
vérifiés ici.

### 5. Dissonance exige un canal non fiable et non ordonné

Sa documentation est explicite : *« Unreliable & Unordered packets (e.g. UDP); TCP is not
suitable for high quality voice chat. »* À vérifier sur le canal que cette intégration
utilise réellement.

### 6. L'écart de version est le seul vrai inconnu

| | Dernier alignement documenté en amont | Notre projet |
|---|---|---|
| FishNet | 4 *(avril 2024)* | 4.7.2R |
| Dissonance | **8** *(avril 2024)* | **9.0.7** |

Le README de l'amont **n'énonce aucune version supportée**. Une version majeure de
Dissonance sépare le dernier alignement de ce que nous installerons. Rien ne dit que ça
casse — l'activité d'avril 2026 suggère que des gens l'utilisent aujourd'hui — mais rien ne
dit que ça passe non plus. **C'est le point où ce choix peut encore se retourner, et il ne
se lève qu'en compilant.**

## Procédure d'activation

Dans cet ordre, sans en sauter.

1. Acheter et importer **Dissonance** (120 $) et le pont **Dissonance For FMOD (Playback)**
   (55 $).
2. Installer **FishNet** et **FishyFacepunch**.
3. Créer les asmdef de Dissonance selon la convention de l'éditeur (point 2 ci-dessus).
4. **Renommer ce dossier** `DissonanceFishNet~` → `DissonanceFishNet`. Unity le découvre et
   génère les `.meta`.
5. Réécrire les références des deux asmdef **par nom** (point 3).
6. Compiler. **Consigner ici le résultat** — c'est la levée du risque de version.
7. Corriger le défaut d'authentification (point 4), en commit séparé.
8. Vérifier le canal non fiable (point 5).
9. Alors seulement, mener le test de partage de périphérique d'**OQ-7**.

## Journal des modifications locales

Toute divergence d'avec le commit épinglé se consigne ici, avec sa date et sa raison.

| Date | Fichier | Modification | Raison |
|---|---|---|---|
| — | — | *(aucune à ce jour — import à l'identique)* | — |
