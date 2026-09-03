# 📝 Fiche Mémo : Réseau Unity avec FishNet & Steamworks

## 🛑 Règle d'or absolue en réseau

> **Le serveur est ROI (Autorité Serveur).** Le client ne décide de rien, il demande poliment au serveur de faire les actions. Le serveur valide, applique, puis diffuse le résultat.

---

## 📦 Bloc 1 : L'Architecture (Serveur vs Client)

- **Rôles :**
    - `IsServer` (Vrai sur la machine qui héberge) : Gère la logique logique globale, les variables sensibles (points de vie, dégâts, inventaires).
    - `IsClient` (Vrai sur les joueurs connectés) : Gère le visuel, le son, la saisie clavier/souris (Input) et l'immersion.
    - `IsOwner` (Vrai sur l'objet qui vous appartient, ex: votre personnage) : Permet de déplacer localement votre avatar sans attendre le serveur.
- **La Prédiction Client :** Le client affiche immédiatement l'action en local pour éviter la sensation de latence (ex: bouger, tirer). Le serveur valide en arrière-plan. S'il y a désaccord (triche, collision manquée), le serveur applique un **rollback** (correction de position).
- **Le Délai (Exemple de la mine) :** Les petits délais visuels (comme le compte à rebours d'une mine) permettent de masquer le temps que l'information fasse l'aller-retour entre le client, le serveur, puis les autres joueurs.

---

## 📡 Bloc 2 : La Communication (Les RPCs)

Les RPC (Remote Procedure Calls) permettent d'envoyer des signaux d'une machine à une autre à travers des fonctions de script.

Copier le tableau

|Type de RPC|Qui l'appelle ?|Qui l'exécute ?|Exemple d'usage|
|:--|:--|:--|:--|
|**`[ServerRpc]`**|Un Client|Le **Serveur** uniquement|_"Serveur, s'il te plaît, j'ai cliqué pour ouvrir ce coffre / lancer cette grenade."_|
|**`[ObserversRpc]`**|Le Serveur|**Tous les Clients** connectés|_"Tout le monde, affichez l'effet de l'explosion à ces coordonnées !"_|
|**`[TargetRpc]`**|Le Serveur|**Un seul Client** ciblé|_"Toi, joueur 3, affiche 'Inventaire plein' sur ton écran."_|

---

## 🔄 Bloc 3 : La Synchronisation des Données (SyncVars)

Une `[SyncVar]` est une variable définie sur le serveur qui se synchronise automatiquement chez tous les clients dès qu'elle est modifiée.

- **Propriété essentielle :** Seul le **serveur** peut modifier la valeur d'une `[SyncVar]`. Si un client tente de la modifier, le changement sera ignoré ou écrasé.
- **Événement `OnChange` :** Permet d'attacher une fonction qui s'exécute chez les clients dès que la variable change.
    - _Exemple :_ Le serveur baisse la SyncVar `CurrentHP`. L'événement `OnChange` se déclenche sur les clients pour mettre à jour la barre de vie visuelle (UI).
- **Optimisation :** Idéal pour synchroniser des états (santé d'un joueur, état d'une porte ouverte/fermée) plutôt que d'utiliser des RPCs répétés.

---

## 🔨 Bloc 4 : La Création d'Objets (Spawning)

- **Le NetworkObject :** Tout objet qui doit exister sur le réseau (joueurs, monstres, objets interactifs, grenades) doit posséder le composant `NetworkObject`.
- **La Règle d'Or du Spawn :** Seul le serveur a le pouvoir de faire apparaître ou disparaître un objet sur le réseau.
- **Le Processus en 3 étapes :**
    1. Le client demande l'action via un `[ServerRpc]` (ex: _"Je jette une grenade"_).
    2. Le serveur fait un `Instantiate()` classique de l'objet Unity en local (sur le serveur).
    3. Le serveur appelle `InstanceFinder.ServerManager.Spawn(grenadeInstance)` pour l'instancier automatiquement chez tous les clients connectés.
- **Spawnable Prefabs List :** C'est le catalogue d'objets du `NetworkManager`. Si votre préfab n'y est pas enregistré, FishNet ne saura pas quel modèle 3D charger chez les clients et plantera.

---

## 🌐 Bloc 5 : Connexion, Lobby & Matchmaking (Steamworks)

- **Le Transport :** C'est le canal par lequel transitent les données. Dans un jeu P2P comme _Lethal Company_, on utilise un transport Steam (comme **FishyFacepunch**). Les paquets sont acheminés via les **SteamID** des joueurs.
- **Le Lobby Steam n'est pas le serveur de jeu :** C'est un simple **annuaire**.
    - L'hôte crée un Lobby Steam et y inscrit son `SteamID` dans les métadonnées.
    - Le client rejoint le Lobby, y lit le `SteamID` de l'hôte, puis demande au transport FishNet de s'y connecter.
- **Pas d'ouverture de ports :** Le protocole Steam (P2P / NAT Punchthrough) permet de traverser les pare-feux et les box internet. Vos joueurs n'ont rien à configurer chez eux.
- **Callbacks de connexion :** Le serveur écoute l'événement `OnRemoteConnectionState` pour savoir quand un joueur arrive (et faire apparaître son personnage) ou repart (pour nettoyer la partie).