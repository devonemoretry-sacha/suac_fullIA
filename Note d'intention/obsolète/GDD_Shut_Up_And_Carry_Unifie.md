# 🎮 SHUT UP AND CARRY!
### Game Design Document — Version Unifiée
**Pitch Hook :** *Un jeu de déménagement coopératif et chaotique où votre pire ennemi est votre propre voix.*
**Genre :** Party-Game / Action-Physique / Horreur Comique Coopératif 
**Joueurs :** 2 à 8 (local ou en ligne via Steam) 
**Plateforme :** PC 
**Cible :** Créateurs de contenu (Twitch/YouTube), groupes d’amis, fans de Lethal Company / Phasmophobia
## 1. Résumé du Projet & Lore
Vous et vos amis êtes les **pires employés de *****Karma Logistics***, une entreprise de déménagement interdimensionnelle sous-payée. Votre mission ? Vider les appartements de créatures cosmiques ou de sorciers excentriques juste avant que leur dimension ne s’effondre.
**Le problème :** Les meubles sont vivants, maudits, et surtout **hypersensibles au bruit**.
Le jeu mélange la gestion de physique punitive de *Chained Together* / *Moving Out* avec la paranoïa vocale de *Lethal Company* / *Phasmophobia*. Chaque contrat est une course contre la montre où la coordination et le contrôle vocal sont plus importants que les réflexes.
**Direction Artistique :** Low-poly, esthétique *“Blue-**collar** de l’espace”* (ouvriers en combinaisons rafistolées au ruban adhésif et papier bulle) contrastant avec des intérieurs grandioses et inquiétants. Inspiration overcooked
**Pas de quota financier.** L’objectif est de monter son **Score de Crédit (Réputation)** de 1 à 5 étoiles pour débloquer de nouvelles dimensions et finir la campagne. Les meubles abîmés font baisser la note.
## 2. Les Piliers de Conception (Core Pillars)
### 2.1 — La “Voice-Physics”
*La voix IRL du joueur (captée par le micro) est un contrôleur physique.*
Le jeu détecte en temps réel le **Volume** (Silence, Chuchotement, Voix Normale, Cri), le **Pitch** (Grave / Aigu) et la **Continuité** (Son sec vs Son continu / ASMR). Le jeu punit la panique et récompense le contrôle vocal. Chaque objet maudit impose ses propres règles de interaction sonore.
**Règle d’or :** La panique entraîne le bruit. Le bruit entraîne le chaos. Le chaos entraîne la chute.
### 2.2 — L’Asymétrie Émotionnelle *(Le “Générateur de Clips”)*
*Le jeu force des situations absurdes où un joueur doit chuchoter une berceuse pendant que ses coéquipiers hurlent de terreur.*
L’oscillation constante entre terreur et contrôle de soi crée des moments cinématiques involontaires : un streamer qui tremble de peur en essayant de chanter doucement, un coéquipier qui étouffe un rire pour ne pas réveiller le monstre, une équipe entière figée dans le silence absolu alors qu’un Bibliothécaire fait trembler les murs.
### 2.3 — Le Sabotage Systémique
*Pas d’IA complexe nécessaire. L’environnement et les objets interagissent entre eux pour créer des réactions en chaîne.*
Un son déclenche un meuble, qui bouge, qui déclenche un piège, qui attire un monstre. Les joueurs ne sont jamais certains si le chaos vient d’eux, de l’environnement, ou de leurs partenaires.
## 3. Inspiration & ADN *(Game Feel)*
| Référence | Ce qu’elle apporte |
| --- | --- |
| **Lethal Company** | Le côté “job de l’enfer en entreprise”, la coop à 4, l’esthétique lo-fi/VHS, la survie sous pression |
| **Chained Together / Moving Out** | La physique volontairement lourde, la nécessité de se coordonner pour passer des obstacles, la frustration hilarante |
| **Phasmophobia** | La paranoïa liée au son, l’angoisse de l’invisible |
| **Les mods “Skinwalker”** | Les hallucinations auditives et visuelles délibérées |
## 4. Boucle de Gameplay *(Core Loop)*
┌─────────────────────────────────────────────────────────────────────  ┐
│                        CYCLE DE JEU                                                                                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     						           │
│  1. ARRIVÉE          Le camion Karma Logistics se gare             			           │
│                      à l'extérieur du bâtiment                      				           │
│                                                                     						           │
│         ↓                                                            					           │
│                                                                     						           │
│  2. POSE DE LA       Un joueur pose la "Bombe de Saisie"           			           │
│     BOMBE DE          (= minuteur de la mission). Elle bipe         			           │
│     SAISIE            de plus en plus vite.                         				           │
│                                                                     						           │
│         ↓                                                            					           │
│                                                                     						           │
│  3. INFILTRATION     Trouver les meubles maudits, les porter    			          │
│     & EXTRACTION      au camion malgré les pièges, monstres          		           │
│                      et la physique punitive                         				           │
│                                                                     						           │
│         ↓  (un joueur doit régulièrement sortir chanter            			           │
│                      pour ajouter du temps à la bombe)              				           │
│                                                                     						           │
│  4. SAS DE           Tableau des scores interactif.                				          │
│     DÉCOMPRESSION     Paie calculée selon les dégâts causés.        		          │
│                                                                     						          │
└─────────────────────────────────────────────────────────────────────┘
**La Spirale Infernale de la Bombe :** Les intervalles de la bombe se raccourcissent avec le temps. Début de mission : bip toutes les 3 minutes. Fin de mission : bip toutes les 45 secondes. Les joueurs sont à bout de nerfs, doivent prendre des risques et bâcler le travail — ce qui entraîne inévitablement des erreurs vocales catastrophiques.
## 5. Les Bibliothécaires *(L’Ennemi Principal)*
Les Bibliothécaires sont des **entités terrifiantes aux pas lourds**, sourdes au silence mais attirées par le moindre bruit (voix normale ou cri).
| Comportement | Détail |
| --- | --- |
| **Attraction au bruit** | Ils se dirigent vers toute voix non-chuchotée |
| **Immunité au silence** | Ignore les joueurs qui ne font aucun bruit |
| **Démontage progressif** | En arrière-plan du niveau 5 étoiles, ils “démontent” le décor petit à petit (effacement des murs, du ciel, des textures) |
### Le “Kite ASMR” *(Contre-mesure)** (OBJET?)*
Si un joueur **chante une berceuse douce et continue**, le Bibliothécaire ralentit, ses bras tombent, il bâille (un son grave et monstrueux), et finit par s’asseoir lourdement en ronflant, bloquant potentiellement un couloir.
**Potentiel comique :** Un joueur court pour sa vie, la voix tremblante, essayant de chanter une berceuse pendant qu’un coéquipier, caché dans un placard, essaie de ne pas exploser de rire — parce que s’il rit, il réveille le monstre à nouveau.
## 6. Catalogue des Objets Maudits
Chaque meuble à déménager possède sa propre règle vocale. Les joueurs doivent apprendre à les maîtriser collectivement.
### 6.1 — Meubles de Physique & Mouvement
#### 🛋️ Le Canapé de Plomb (Masse)
- *Chuchotement** → Léger comme une plume. Permet de sauter par-dessus des gouffres.
- *Cri / voix forte** → S’alourdit instantanément (masse ×100), plaquant les porteurs au sol.
- Concept :* Le poids collectif des émotions de l’équipe.
#### 🧊 Le Frigo [Explosif / Fusée] (Pression) ( VARIANTE : deux concepts coexistent )
**Variante A — Frigo Explosif :** Explose et repousse tout le monde si plusieurs joueurs parlent en même temps. Force la communication en “talkie-walkie” stricte. 
**Variante B — Frigo Fusée :** Silence = lourd et stable. Un joueur parle fort = tremble violemment. Plusieurs parlent = s’excite et explose en onde de choc. - *Concept :* Le stress des équipes qui paniquent simultanément. - *Note :* Choisir la variante qui s’intègre le mieux à la feel globale (les deux sont symétriquement satisfaisantes).
#### 🛏️ Le Matelas à Mémoire de Ton (Pitch)
- *Voix grave et posée** → Glisse parfaitement.
- *Voix aiguë (rires, cris)** → Devient un trampoline incontrôlable qui fait rebondir l’équipe.
- Concept :* La résonance émotionnelle de l’équipe affecte directement la surface de transport.
#### 🪞 Le Miroir Paranoïaque (Direction & Vision)
- Objet imposant qui bouche la vue. Le porteur voit dans le reflet (inversé) des monstres terrifiants juste derrière ses coéquipiers — ce sont de fausses hallucinations.
- *Règle vocale :** Il faut lui **chuchoter des mots rassurants en continu** pour qu’il avance droit, sinon il tire violemment sur les côtés.
- Concept :* La paranoïa est un piège : crier pour prévenir ses alliés les sabote.
#### 🪴 Le Vase de l’Écho (Écholocation)
- *Invisible** en temps normal.
- Les joueurs doivent faire des **bruits secs au micro** (*“tic-tic”, claquements de langue*) pour générer un sonar visuel et voir l’environnement.
- *Attention :** Faire trop de bruit réveille les Bibliothécaires.
- Concept :* L’équilibre sonar/stealth.
### 6.2 — Meubles de Perception & Effets
#### 💡 La Lampe de Chevet Capricieuse (Lumière)
- *Seule source de lumière** dans les zones sombres.
- *Silence** → S’éteint (noir total).
- *Voix douce / ASMR** → Éclaire normalement.
- *Cri** → Surchauffe et lâche une **Flashbang** (écran blanc de 3 secondes pour toute la pièce).
- Concept :* Demander de la lumière, c’est prendre le risque de tout révéler — y compris à soi-même.
#### 📺 La Télévision Perroquet (Trahison)
- Enregistre discrètement un cri, un rire ou une insulte d’un joueur via son micro pendant le transport.
- Plus tard, **elle s’allume seule et diffuse l’enregistrement à plein volume**, attirant les monstres et déclenchant la physique des autres meubles proches.
- Concept :* Les pires trahisons sont celles qu’on s’inflige à soi-même.
### 6.3 — Objets Utilitaires *(Inventaire — 1 à 2 slots)*
| Objet | Utilité | Twist Chaotique |
| --- | --- | --- |
| **Le Mégaphone Cassé** | Amplifie artificiellement la voix in-game (sans crier IRL) | Le son attire *tous* les Bibliothécaires — bon pour le sacrifice stratégique |
| **Pastilles “Miel & Camomille”** | Crée une fausse *Aura ASMR* pendant 15s (même en parlant normalement) | Le joueur doit surveiller le compte à rebours |
| **Grenade “Zone de Vide”** | Crée une bulle temporaire de silence absolu | Coupe le son d’un coéquipier paniqué ou désamorce un meuble explosif |
| **Le Diable de Manutention (Trolley)** | Déplacer un objet lourd seul (une personne au lieu de deux) | Ses roues grincent de façon aléatoire, attirant les monstres si on roule trop vite |
| **Spray “WD-4000” (Lubrifiant Quantique)** | Rend une zone totalement silencieuse <mark style="background:#000070">(?)</mark> <mark style="background:#000070">Permet le transport de certain objet</mark> | La zone devient une patinoire (friction = 0) — <mark style="background:#000070">si les joueurs marchent dessus en portant un meuble lourd, ils glissent </mark><mark style="background:#000070">dessus. Le diable ne grince pas</mark> |
| **Talkie-Walkie “Fisher-Price”** | outrepasse l’atténuation de distance | Il capte très mal et émet aléatoirement un grésillement strident (Larsen) très bruyant |
| **Casque Anti-Bruit “Égoïste”** <mark style="background:#000070">**Objet à acheter ou sur le stage?**</mark> | Immunise contre les Flashbangs et effets d’étourdissement | Le joueur n’entend plus *rien* du tout — détruit la coordination, il doit deviner par gestes |
### 6.4 — Objets Systémiques *(Pas portés, affects l’environnement)*
| Objet | Effet |
| --- | --- |
| **Le Rouleau de Scotch** | Permet de “muter” temporairement un coéquipier paniqué (applique un filtre étouffé sur sa voix in-game). |
| **Le Bouton “Poussette”** | Simple touche pour donner une pichenette à un collègue. Créateur ultime de trahisons “accidentelles”. |
| **Le Détecteur “T-Rex”** **(Tourelle?)** | Un laser qui ne capte que le **mouvement de la caméra** (souris/joystick). S’il s’active, il faut lâcher la souris sous peine de tout perdre. |
## 7. Level Design *(Environnements Systémiques)*
Les niveaux sont conçus pour **forcer la communication** et **piéger les réflexes** des joueurs.
| Zone | Description |
| --- | --- |
| **Le Gouffre Soufflerie** | Bourrasques de vent régulières. Les joueurs doivent **hurler** pour alourdir leur meuble et s’ancrer au sol, puis se taire instantanément quand le vent tombe. |
| **La Salle des Échos** | Enregistre la voix des joueurs et la répète avec 2 secondes de délai. Cet écho est compté comme du bruit → boucles de feedback infernales si les joueurs râlent. |
| **La Zone du Vide Spatial** | Le chat vocal in-game est **totalement coupé**. Les joueurs doivent se coordonner en silence avec des mouvements de caméra et une physique nouille ( IK). |
| **Le Sol Fragile** | Des dalles qui cèdent sous le poids d’un objet bruyant. Nécessite un silence absolu pour les franchir. |
## 8. Progression — Le Système “Karma Mover” *(1 à 5 Étoiles)*
Le système d’étoiles agit comme le **“Permis de Déménager”**. Plus la note est haute, plus *Karma Logistics* confie des contrats prestigieux, dangereux et déroutants.
| Niveau | Étoiles | Contrats | Objets | Menaces |
| --- | --- | --- | --- | --- |
| **Job d’Étudiant Cosmique** | ⭐⭐ | Studios gobelins, caves de nécromanciens | Canapé de Plomb, Matelas à Mémoire de Ton | Bibliothécaires rares ou endormis |
| **Bourgeoisie Dimensionnelle** | ⭐⭐⭐⭐ | Manoirs de vampires, laboratoires temporels | Frigo Fusée, Miroir Paranoïaque, Lampe Capricieuse | Bibliothécaires actifs, level design vicieux |
| **Le Déménagement Méta** *(Boss de Fin)* | ⭐⭐⭐⭐⭐ | Piliers de la Réalité / Saisie de la Dimension Zéro | Horloge du Temps, Maquette de la Terre, Serveur de l’Espace-Temps | Plusieurs Bibliothécaires géants qui démontent le décor en temps réel |
**Les Objets “Méta” à transporter :**
- *L’Horloge du Temps :** Une immense horloge comtoise. Si vous parlez trop vite, le compte à rebours de l’effondrement du niveau s’accélère.
- *La Maquette de la Terre (ou du Système Solaire) :** Un globe géant extrêmement lourd. S’il chute ou subit un choc, des catastrophes se déclenchent (changement de gravité, météorites qui traversent le toit).
## 9. Design des Personnages
Pas d’animations complexes — le focus est sur **l’expressivité sociale** et l’**univers visuel fort**.
| Élément | Détail |
| --- | --- |
| **Le Casque-Égaliseur** | La visière du scaphandre est un écran LED affichant en temps réel la *waveform* (forme d’onde) du micro du joueur. Impossible de mentir sur qui a fait du bruit. |
| **Physique “Nouilles” (IK)** | Les mains s’accrochent magnétiquement aux objets, les corps suivent avec une physique molle et ragdoll. Les collisions maladroites sont voulu |
| **L’Écran de Fin (Débriefing)** | Dans le camion de retour, un tableau des scores décerne des titres **passifs-agressifs** (*“Le plus bruyant”*, *“Le lâche”*, statistiques à l’appui) pour lancer les débats et les disputes entre joueurs. |
## 10. Intégration Twitch & Chat
### 10.1 — L’Interaction du Chat *(Optionnelle mais létale)*
Les viewers peuvent **dépenser des points de chaîne** pour déclencher des effets *uniquement dans le casque du streamer* :
- *Bruits de klaxon** → Alourdit les objets de l’équipe
- *Jumpscares visuels** → Font sursauter le streamer (qui crie → effet en cascade)
- *Fausse voix d’un coéquipier** → Provoque un réflexe de trahison
*Seul but : faire crier le streamer pour qu’il fasse tomber le meuble de l’équipe. C’est un game-over collectif orchestré par le chat.*
## 11. Contre-mesures & Objets Cosmétiques *(Quick Wins Dev Solo)*
Ces éléments sont **faciles à implémenter** et **très gratifiants** pour les joueurs.
### Cosmétiques
| Catégorie | Exemples |
| --- | --- |
| **Couleurs LED du Casque** | RGB, arc-en-ciel, glitch, onde monochromatique |
| **Skins de Scotch** | Ruban cadeau, scotch “Police Line Do Not Cross”, scotch doré premium |
| **Chapeaux / Accessoires** | Plot de chantier, oreilles de chat, cravate de bureau mal nouée |
### Améliorations du Camion *(Hub)*
| Amélioration | Effet |
| --- | --- |
| **Radio de Bord Pirate** | Musique d’ascenseur low-cost ou synthwave spatiale entre deux missions |
| **Klaxon Personnalisé** | Klaxon à pet, klaxon de clown, son personnalisé — pour trolley ses coéquipiers au déchargement |
## 12. “Contrats Poubelles” *(Mutateurs de Rejouabilité)*
Des modificateurs délirants pour gagner plus d’étoiles, sans créer de nouveaux niveaux :
| Mutateur | Effet |
| --- | --- |
| **Atmosphère à l’Hélium** | Le pitch de tous les micros est monté dans les aigus → Le Matelas à Mémoire de Ton devient extremely difficile |
| **Extinction des Feux** | Noir total → Obligation d’utiliser le Vase de l’Écho (écholocation) ou la Lampe Capricieuse |
| **Mode “Léthargique”** | Gravité réduite ×0.5 — les meubles tombent lentement, mais les Bibliothécaires se déplacent en fast-forward |
| **Mode “Cauchemar”** | Les Bibliothécaires entendent les *chuchotements* (réduction du seuil de détection) |
## 13. Résumé des Mécaniques Vocales
| Objet | Silence / Whisper | Voix Normale | Cri | Spécifique |
| --- | --- | --- | --- | --- |
| **Canapé de Plomb** | Léger (saute les gouffres) | Moyen | Lourd (plaque au sol) | — |
| **Frigo [Explosif/Fusée]** | Stable / Lourd | Tremble | Explose | Plusieurs voix = onde de choc |
| **Matelas à Mémoire de Ton** | — | Glisse (voix grave) | Trampoline (voix aiguë) | Sensible au pitch |
| **Lampe Capricieuse** | Éteinte (noir) | Éclaire (voix douce) | Flashbang | Seule source de lumière |
| **Miroir Paranoïaque** | — | — | — | Chuchoter des encouragements = avance droit |
| **Vase de l’Écho** | — | — | Réveille les monstres | Bruits secs = sonar visuel |
| **Télévision Perroquet** | — | Enregistre les bruits forts | — | Déclenchement tardif à plein volume |
