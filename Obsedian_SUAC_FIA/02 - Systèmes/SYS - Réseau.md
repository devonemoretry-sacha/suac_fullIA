Navigation : [[MOC - Shut-up & Carry]] | [[SYS - Audio & Voix]] | [[SYS - Gameplay Physique]]
MAP : [[MAP - Réseau.canvas]]

## 🎯 Rôle

Gérer la connexion multijoueur (host + clients) via Steam P2P et synchroniser l'état du jeu entre serveur et clients (server authoritative).

## Architecture

🔌 P1 — Connexion & Session
🗺️ P2 — Gestion des entités réseau (spawn + état, inclut le transport des états modifiés)
🎙️ P3 — Transport de la voix
📊 P4 — Transport des données d'analyse vocale
🎬 P5 — Événements & Synchronisation de partie


CÔTÉ CLIENT                    CÔTÉ HÔTE (autorité)
─────────────                  ────────────────────
Voix → Analyse (P4)  ──réseau──►  Reçoit les données
                                       │
                                       ▼
                              🎮 SYSTÈME GAMEPLAY
                              calcule l'effet (cri→lourd)
                                       │
                                       ▼
                              change l'état de l'objet
                                       │
                          ──réseau (P2)──► synchro à tous
                                       ▼
                              Tous les clients affichent
## 🗺️ Stack

- [[TECH - FishNet]]


## 🧩 Sous-blocs

- [[FUNC - Connexion & Lobby]]
- [[FUNC - Sync État Joueurs]]
- [[FUNC - Sync État Objets]]
- [[FUNC - Host Migration]]

