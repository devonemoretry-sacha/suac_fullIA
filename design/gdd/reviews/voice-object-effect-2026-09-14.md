# Revue de conception — Effet voix → objets

| Champ | Valeur |
|---|---|
| **Document revu** | `design/gdd/voice-object-effect.md` |
| **Date** | 2026-09-14 |
| **Verdict** | **MAJOR REVISION NEEDED** |
| **Type** | Première revue · profondeur `full` |
| **Spécialistes** | systems-designer, game-designer, qa-lead, network-programmer, audio-director, accessibility-specialist, gameplay-programmer, creative-director (synthèse) |
| **Suites** | Révision **groupée** avec les systèmes 1 et 6 — voir `voice-calibration-2026-09-11.md`, *Traitement* |

---

## Traitement — état au 2026-09-14

**Rien n'est appliqué.** Même logique que pour le système 6 : la passe de révision est
groupée sur les trois documents après la re-revue du système 1. Plusieurs correctifs d'ici
touchent le système 1 (`Loudness` nul sous `Floor + Margin`), le système 6 (CAL-34, lien
avec la jauge D1) et deux ADR.

### Vérifié par l'orchestrateur avant la synthèse

| Affirmation | Source | Résultat |
|---|---|---|
| Le profil est transmis à l'hôte | `adr-0003`, ligne 337 : « La calibration devient une **donnée de session** à transmettre à l'hôte » | **Vrai** — contredit `voice-calibration.md` et CAL-34 (« jamais ») |
| Les clients reçoivent les `VoiceFrame` de tous | `adr-0003`, ligne 224 : « Client → Hôte » ; `adr-0002`, ligne 86 : « les clients reçoivent des **états finaux** » | **Faux** — aucun relais documenté |
| Le banc remplissait comme le GDD | `index.html`, ligne 619 : `charge += (0.35 + 0.65*above) * dt / K.fill` | **Faux** — plancher de 35 %, seuil dB manuel, aucune calibration |
| L'avertissement du banc était un événement à 350 ms | `index.html`, ligne 629 : `warnActive = charge>0 && charge < warnAt*1.6 && voiced` ; `heaviness()`, lignes 543–548 | **Faux** — état allumé **dès la première trame parlée**, éteint au silence ou à 1,6 × `warnAt` ; les 350 ms fixent **où le poids réel commence**. Le banc affichait en outre une **barre de charge visible** |
| 26 critères `[UNIT]` | décompte de la section *Acceptance Criteria* | **28** |

### Décisions à poser au propriétaire avant la passe de révision

Formulées par le creative-director pour un non-spécialiste. Elles s'ajoutent à D1–D3 de la
revue du système 6.

| # | Question | Recommandation |
|---|---|---|
| **E1** | **Qu'as-tu réellement jugé « le meilleur » au banc ?** Le halo s'allumait dès que tu parlais, et les 350 ms réglaient le début du poids. Le GDD en a fait « rien pendant 350 ms, puis un grincement ». | Le prototype étendu propose les deux sémantiques, commutables ; tu choisis en jouant |
| **E2** | **Le chuchotement peut-il faire sonner l'alerte ou peser, même un peu ?** Les formules actuelles le font peser d'environ 22 %. | **Non.** Il fait frémir et s'arrête juste sous l'alerte (`Plafond = k · seuil_av`, k < 1). Coût réel conservé : un cri qui suit arrive plus vite à l'alerte |
| **E3** | **Faut-il une tâche qui exige du son avant le premier test à plusieurs ?** Sans elle, une équipe muette gagne et le test paraît réussi. | **Oui**, grossière (une porte sur une note tenue), clause bloquante dans `mvp-scope.md`. Rien dans le système 11 |
| **E4** | **On garde « parler normalement déclenche l'alarme » sur tous les meubles ?** | **Garder la décision**, et mettre **un** meuble tolérant (`T_objet ≥ 1`) dans le prototype comme point de comparaison |
| **E5** | **Accepter que ton « niveau de voix normale » — un seul nombre, `L_repos` — parte vers l'hôte ?** Sans lui, l'hôte ne calcule aucun seuil et le système ne fonctionne pas en réseau. | **Oui.** Le profil en dB reste sur la machine ; amender ADR-0003 et CAL-34 dans la même passe |

---

## Trois constats ajoutés par le creative-director

**C1 — Le banc n'a pas mesuré « l'avertissement à 350 ms » tel que le GDD le définit.**
Voir le tableau de vérification. Le testeur a probablement jugé : *un indice immédiat quand
on parle, puis 350 ms de grâce avant le poids*. Le GDD spécifie : *350 ms sans rien de
perceptible, puis grincement et poids au même instant*. Le signal du banc était de surcroît
**visuel**, là où le GDD exige le son. C'est le **sens** du seul chiffre mesuré qui a
changé, pas seulement la fonction de remplissage.

**C2 — La zizanie est presque toujours neutralisée par `min(1, …)`.** Elle n'agit que si le
plus fort est sous 1/Zizanie (0,909 à trois voix, 0,833 à quatre). Trois joueurs à `L = 1,0`
donnent `L_eff = 1`, comme sans zizanie : **elle ne fait rien quand tout le monde hurle
vraiment.** Le document écrit par ailleurs « la panique collective est punie par la durée,
pas par le débit », puis fait agir la zizanie sur le débit.

**C3 — « Seul le chuchotement est sûr » n'a pas de témoin, et le défaut vise `LowRange`.**
Profil Δ = 13 dB, r = 0,62 → `L_repos = 0,73`, `Seuil = 0,51` à `T_objet = 0,7`. Un
chuchotement à plancher + 5 dB donne `L = 0,54` → **alarme**. Fenêtre de chuchotement sûr
≈ 4 dB ; à `T_objet = 0,4`, ≈ 2 dB même pour Δ = 40. Et `Loudness` n'étant pas conditionné par
`Voiced` (AC-36 du système 1), respiration et traîne du bruit de fond rendent `Σ L_i = 0`
probablement **inatteignable à quatre micros** : l'objet ne se déchargerait jamais.

---

## Classement

### A — À corriger avant le prototype étendu

Sinon le prototype teste un modèle contradictoire. Heures de papier, pas jours.

1. **Boucle de mise à jour unique, ordonnée, à trois régimes** *[systems-designer F1, gameplay-programmer 4, qa-lead]*. `SILENCE` si aucune contribution ; sinon `ALARME` si une voix dépasse son seuil ; sinon `MURMURE`. `Seuil,i` relu à chaque tick (gameplay-programmer 22). VO-15 réécrit. « Poser = décharge quelles que soient les voix » aligné sur « on le pose **et on se tait** » : la règle « pour récupérer il faut se taire » devient universelle et ferme la boucle crier / poser / reprendre (game-designer 3, F8).
2. **`Plafond_murmure = k · seuil_av`, k < 1** *[systems-designer F2, F3]*. VO-09 inversé. Voir arbitrage (a) et E2.
3. **L'avertissement devient un événement, et sa provenance est écrite honnêtement** *[gameplay-programmer 5, 7, 8 ; qa-lead ; audio-director 4.1 ; C1]*. Front montant à `seuil_av`, réarmement sous `seuil_av · (1 − h)`. Remplacer « éprouvé au banc » par « mesuré sous un autre modèle, écarts listés ». Le prototype implémente **les deux sémantiques**, commutables. Voir E1.
4. **Rendre les seuils atteignables** *[systems-designer F4, C3]*. Réécrire la preuve de sûreté avec le plancher réel `(Margin_dB / Δ)^γ`. Ancrer `T_zizanie` sur la voix posée — `T_zizanie,i = L_repos,i + k_z · (1 − L_repos,i)` — pour garantir par construction seuil d'objet < seuil de zizanie. `T_objet > 1` défini comme une interpolation vers le cri, jamais au-delà de 1. **Piste à dériver** : ancrer `Seuil,i` entre la porte de volume du système 1 (`Floor + Margin`) et la voix posée, plutôt qu'entre 0 et la voix posée — chuchotement sûr pour tous, `LowRange` compris, sans constante qui juge une voix.
5. **Rouvrir ce que la zizanie multiplie** *[C2, game-designer 6]*. Le prototype compare « débit hors plafond » et « durée (`Vidange` × Z) ». Recommandation : **la durée** — cohérente avec la thèse, insensible au plafond, perceptible à la seconde plutôt qu'à 120 ms.
6. **Lot mécanique** : « une minute / une quinzaine de secondes » contre 5,6 s (F6), « 1,36 » orphelin (F5), garde contre la division par zéro dans `principal` (F7), 28 critères et non 26.

### B — Ce que le prototype tranche, en curseurs

- **Au micro réel** : `L` d'un vrai chuchotement et de la respiration, avec un point « chuchotement » dans la mini-calibration — le témoin qui manque aux régimes murmure et silence. Pourcentage de trames à `L = 0` quand le joueur se tait.
- **Sémantique de l'avertissement** : fidèle au banc (indice dès l'attaque) ou front montant. Et la **pré-charge** : avec un plateau à k = 0,85, un cri après un murmure déclenche l'avertissement en ≈ 50 ms au lieu de 350 — « le meuble est déjà nerveux » (bien) ou « l'avertissement a disparu » (grave) ?
- `k`, `Lenteur`, forme et valeur de la zizanie.
- **Un objet témoin à `T_objet ≥ 1`** (E4).
- **Latence simulée sur les trois voix artificielles** : sa propre voix immédiate, celle des autres retardée. Une ligne.
- **Micro-tremblement de caméra** comme second canal de l'avertissement, joué sans le son, pour voir s'il est remarqué (accessibility 1).

### C — Avant l'implémentation Unity

- **Réseau** *[network-programmer 1–4]* — arbitrage (f). Le paragraphe faux « chaque client reçoit les `VoiceFrame` » est **supprimé dès la passe de révision** : une fausse prémisse s'hérite.
- **Horloge côté hôte** : tick fixe, dernière trame par joueur horodatée à réception, expiration à 150–250 ms qui ramène `L_i` à 0. Sans elle, un paquet « silence » perdu fait charger l'objet sur un silence réel.
- **Signature du point d'extension** *[gameplay-programmer 11, 12]* : `VoiceContribution { Player, AttenuatedLoudness, RawLoudness, PersonalThreshold, PlayerRoom }`, `IVoiceCombiner.Combine(contributions, objectRoom, config) → { Regime, LEffective, ZizanieApplied }`, `IRoomQuery`. Mention « substituable pour la règle, pas pour le périmètre de données ».
- **Machine à états de l'épisode de zizanie** : Closed / Open / PendingClose / Committed / Discarded ; fin de contrat pendant un épisode ouvert ; plafond de fusion (F9, gameplay-programmer 16–17).
- **Réplication des curseurs par l'hôte** et propriétaire nommé du panneau de réglage *[gameplay-programmer 14]* — nécessaire au seul test Unity en réseau.
- **Lot critères** *[qa-lead]* : VO-NET-01 `[INTEG]` (la prédiction locale ne pilote jamais la physique) ; témoin d'atteignabilité pour VO-17 ; critères de l'événement d'avertissement (déclenche une fois, se réarme) ; VO-26 aux bornes exactes et sous oscillation ; contrat d'injection généralisé ; VO-27–30 durcis (majorité des testeurs sur ≥ 2 sessions, et « aucun ne juge l'avertissement imperceptible ») ; propriétaire et déclencheur pour chaque `[BLOQUÉ]`.

### D — Important, non bloquant

- **Rétrograder « Question close » en question ouverte, scindée** *[accessibility 4]* : l'attribution est résolue par le Sonomètre, **l'avertissement minuté ne l'est pas**. Exigence écrite ici : avertissement multimodal, son + tremblement diégétique ; le rendu appartient au système 12.
- **Règles de mix de l'avertissement** *[audio 1.1–1.3]* : attaque courte, spectre hors des formants vocaux, pas de ducking du chat vocal, émetteur ancré au porteur.
- **Fuite du casque vers l'analyse** *[audio 2.1, 2.2]*, rétrogradé (le prérequis casque couvre l'essentiel) : « aucun contenu tonal » ne suffit pas puisque `Loudness` n'est pas conditionné par `Voiced` — plafonner le niveau de lecture, étendre le POC audio aux effets du jeu.
- **Territoire sonore mobilier / habitant** *[audio 3.3]*, rétrogradé : contrat à inscrire pour le système 15 avant production des sons (mobilier = matériaux, habitant = organique).
- **Lien avec D1 du système 6** *[game-designer 9]* : la jauge de l'étape 3 réutilise ce modèle charge → lourdeur. À écrire dans la passe groupée.
- « Réalise le Pilier 3 » → « y contribue », système 15 ajouté aux *Dependencies* *[game-designer 8]*.
- Le maximum sur `Loudness` normalisé peut désigner un autre coupable que celui que l'oreille entend *[game-designer 4]* — à surveiller en playtest.
- Biais de latence de l'hôte dans l'attribution, poids interpolé côté client *[network-programmer 5, 6]* — à documenter.
- Cadence réseau 20–30 Hz et non 50 Hz ; autorité hôte sur le comptage d'épisodes ; déconnexion de l'hôte en pleine zizanie *[network-programmer 7, 8]*.
- Ajouter l'audio-director aux attributions des systèmes 12 et 13 dans l'index *[audio 8.1]*.

### E — Différé sciemment

| Constat | Initial → retenu | Raison |
|---|---|---|
| Rythme `Remplissage` / `Vidange` réglable en option d'accessibilité (accessibility 5, 9) | BLOQUANT → OQ nommée | Compatible avec le principe des seuils personnels, mais découple la seule mesure ; attendre que le prototype la remesure |
| Canal de coordination non vocal comme condition de sortie du MVP (accessibility 7) | BLOQUANT → question de périmètre | Décision sur `mvp-scope.md`, pas sur ce système |
| Option contre les sons soudains (accessibility 11) | BLOQUANT → OQ | La logique reste instantanée, seule l'attaque perçue varie |
| Sonomètre codé par la seule couleur, illisible dans le noir (accessibility 8, game-designer 5) | BLOQUANT → contrat vers le système 19 | Ne vit pas ici |
| Joueurs `LowRange` désignés coupables par le maximum (accessibility 10) | BLOQUANT → absorbé | Traité à la racine par A.4 ; pas de marge fixe par classe de voix, que le principe du 2026-09-14 interdit |
| Santé vocale, dysarthrie (accessibility 5, 6) | → OQ portée depuis le système 6 | Documenter, pas résoudre avant le playtest |
| Pas de zizanie à deux joueurs, `AnalyzerState` non transmis, bus de mix streamers, hiérarchie LUFS, polyphonie, volume d'assets sonores | MINEUR | Plus tard |

---

## Arbitrages

**(a) Plafond du murmure contre avertissement — le systems-designer a raison sur la formule,
l'audio-director sur le rendu.** Au-dessus de `seuil_av`, la lourdeur vaut ≈ 0,22 de poids
réel, ce que le document interdit trois fois. Une texture sonore ne rend pas un canapé plus
léger. **On inverse** (`k · seuil_av`) **et** on garde trois états sonores : frémissement sous
`seuil_av` ; texture de danger continue tant que `charge ≥ seuil_av` — atteignable désormais
**seulement après une alarme**, ce qui règle F3 ; stinger sur front montant. Le vœu du
propriétaire, « l'exciter progressivement », est tenu. → E2.

**(b) Qui possède le zéro — les trois, chacun à son étage.** Le système 11 possède la
**règle de priorité** du silence. Le système 1 possède « **cette personne émet-elle** » :
`Loudness` doit valoir 0 sous `Floor + Margin`, pas seulement sous `Floor` (passe groupée).
Le système 3 possède « **ce son atteint-il l'objet** », avec une coupure dure contractuelle.
Le témoin exigé par le qa-lead se mesure au prototype. `Margin_dB` détecte du bruit, pas une
voix inhabituelle : conforme au principe.

**(c) Sémantique de l'avertissement — événement en production, mais A/B au prototype contre
la version fidèle au banc.** On ne choisit pas à froid : le testeur a peut-être validé
l'autre sémantique. → E1.

**(d) Contrepoids — le document a raison sur le lieu, le game-designer sur la séquence.**
Aucun mécanisme anti-silence dans le système 11 (l'adoucir rend le silence plus rentable).
Mais clause bloquante dans `mvp-scope.md` : aucun test à plusieurs humains ne vaut verdict
sur le plaisir sans au moins une tâche qui exige du son. Le prototype navigateur, test de
ressenti solo, n'en a pas besoin. → E3.

**(e) « La conversation est une alarme » — décision du propriétaire, non rouverte.**
L'objection du simulateur de chuchotement est surestimée : une annonce brève (« gauche ! »,
400 ms à `L = 0,5`) monte à 0,13, reste sous `seuil_av` et se vide en 0,2 s. Le jeu devient
télégraphique — littéralement *Shut up and carry*. Le risque réel est la conversation
**soutenue**, et il se mesure avec un objet témoin. → E4.

**(f) Réseau — prédire seulement sa propre voix, envoyer `L_repos` à l'hôte.** Le client
prédit l'avertissement de **sa** voix ; la contribution des autres arrive par l'état publié
par l'hôte, au rythme de leur voix dans le chat. Pas de relais de `VoiceFrame`, pas de seuils
des coéquipiers sur les clients. Contradiction ADR-0003 / CAL-34 résolue : **le profil en dB
ne quitte jamais la machine ; le scalaire `L_repos` part vers l'hôte** à la connexion et à
chaque recalibration. → E5.

---

## Le défaut de méthode — le même, et deux nouveaux

**Le même : l'atteignabilité.** Preuve de sûreté sur `RestMin` mort, `T_objet > 1`
inatteignable, seuil d'objet au-dessus de `T_zizanie`, zizanie neutralisée par le plafond,
chuchotement sans témoin, silence probablement inatteignable. La règle du 2026-09-14 en
aurait attrapé cinq sur six ; elle date d'après la rédaction.

**Nouveau n° 1 — la provenance.** Le seul chiffre mesuré a été transféré dans un modèle que
le banc n'a jamais fait tourner. Le document s'ouvre sur « le seul système qui ait été
ressenti », ce qui donne à ce transfert une autorité qu'il n'a pas.

**Nouveau n° 2 — l'atteignabilité des données.** Le document suppose qu'une donnée existe là
où le calcul s'exécute (`VoiceFrame` chez les clients, `L_repos` chez l'hôte) alors que les
ADR montrent qu'elle n'y arrive pas.

**En plus — la dérive par redites.** Chaque règle est énoncée trois ou quatre fois et les
versions ont divergé (deux états contre trois, 1,36, une minute contre 5,6 s, 26 contre 28).
« Ce document ne se doit aucune décision » était faux.

**Règles ajoutées à `.claude/rules/design-docs.md` le 2026-09-14** : provenance des valeurs
mesurées, disponibilité des données consommées. Et *Formulas* + la boucle de mise à jour
deviennent seules normatives dans la révision ; la prose y renvoie.

---

## Senior Verdict [creative-director]

> **Tel qu'écrit, le document ne tient pas ses promesses.**
> « C'est moi qui ai fait ça » repose sur un avertissement au sens incertain, exclusivement
> sonore, que le plateau du murmure empêche de se réarmer. « C'est lui qui a fait ça » n'a
> aucun chemin de données dans l'architecture acceptée. « Je tremble et je chuchote quand
> même » échoue deux fois : le murmure pèse réellement, et le chuchotement sûr n'existe pas
> pour les profils étroits ni sur les objets fragiles. « Punir la coopération sans décourager
> de coopérer » échoue par la décharge : si le silence collectif est inatteignable, un
> incident laisse l'objet chargé indéfiniment.
>
> **Le modèle central est sain et mérite d'être protégé** : charge portée par l'objet, somme
> sous le seuil et maximum au-dessus, seul le silence décharge, seuils personnels,
> avertissement séparé du verdict. Aucun constat ne demande de le remplacer. Deux défauts
> touchent la structure sans exiger de reconception — **l'ancrage** (ce que valent 350 ms) et
> **la tuyauterie** (où vivent `L_repos` et les voix des autres). Il faut les re-dériver, pas
> les retoucher.

## Scope Signal

- **Révision : M** — environ deux sessions dans la passe groupée : dérivation (A.1, A.2, A.4, A.5, et `Loudness` sous `Floor + Margin` côté système 1) ; rédaction (A.3, réseau, clôture d'accessibilité, lot critères).
- **Implémentation : L** — logique pure testable hors Unity, simulation côté hôte avec expiration, requête de pièce, machine à états des épisodes, réplication des curseurs.
- **ADR** : amender **ADR-0003** (seul `L_repos` va à l'hôte, flux client → hôte, expiration des trames) ; réécrire **CAL-34** ; addendum **ADR-0002** (avertissement local = prédiction de sa propre voix + état publié par l'hôte) ; **ADR neuf** sur la réplication des curseurs avant le premier test Unity en réseau.

## Verdict : MAJOR REVISION NEEDED

Trois sections à **re-dériver** : le régime et la charge (boucle unique) ; l'avertissement
(formule, provenance, canaux) ; la conséquence réseau (avec l'ADR). Plus les seuils contre
leur domaine atteignable. Le reste est mécanique ou différable.

---

## Annexe — constats par spécialiste

### systems-designer
- **F1 BLOQUANT** — SILENCE indéfini : §2 à deux régimes, §3 à trois branches ; à `Σ L_i = 0`, deux résultats. VO-15 faux (témoin : charge 0,60, quatre joueurs à 0,05 → murmure, charge ≥ plafond → inchangée). Fix : `SILENCE` prioritaire sur `Σ L_i = 0`.
- **F2 BLOQUANT** — `Plafond > seuil_av` ⇒ `principal > 0` : le plateau vit dans le poids réel (0,22). VO-09 vert sur un comportement cassé. Fix : `Plafond ≤ seuil_av`, défini `k · seuil_av`.
- **F3 BLOQUANT** — F1 + F2 : l'avertissement ne se réarme jamais après un plateau.
- **F4 BLOQUANT** — preuve de sûreté sur `RestMin` ; plancher réel de `Seuil` ≈ 0,11 et non 0,20 ; témoin `r = 0,8`, `T = 0,9` → `Seuil ≈ 0,78 > T_zizanie` ; `T_objet > 1` → `Seuil > 1` inatteignable ; voix étroites à seuil structurellement plus haut.
- **F5 BLOQUANT** — « 1,36 » orphelin : le rapport 4 modérés / 2 bruyants vaut 1,6, indépendant de `z`.
- **F6 BLOQUANT** — « une minute / une quinzaine de secondes » ignore le plafond ; *Formulas* : plafond en 5,6 s, jamais plein.
- F7 RECOMMANDÉ — `principal` divise par zéro si `Remplissage ≤ Avertissement`.
- F8 RECOMMANDÉ — la pose devient la seule décharge fiable si F1 est réel.
- F9 MINEUR — fusion d'épisodes non bornée (oscillation 3/2 toutes les 0,4 s pendant 10 min = un épisode).

### qa-lead
- **BLOQUANT** — contradiction SILENCE ; VO-15 faux ; atteignabilité de SILENCE non prouvée (VO-17 vert par injection) ; VO-09 auto-contradictoire et limité à la configuration de référence ; **aucun critère ne teste ADR-0002** → VO-NET-01.
- RECOMMANDÉ — 28 et non 26 ; `[UNIT]` légitimes par injection mais contrat écrit pour VO-16 seul ; VO-18–20 imprécis (brut ou atténué, zizanie = 1) ; VO-27–30 « au moins un testeur » trop faible ; VO-26 sans bornes exactes ni oscillation ; sémantique de l'événement d'avertissement non testée ; aucun critère d'accessibilité ; aucun audit des interdictions d'affichage ; `[BLOQUÉ]` sans propriétaire ni déclencheur.
- MINEUR — VO-05 présuppose un parcours ; VO-31 à préciser.
- Verdict : non livrable tel quel.

### game-designer
1. **BLOQUANT** — aucun contrepoids au silence garanti avant le MVP ; clause de séquencement ou mécanisme minimal.
2. **BLOQUANT** — « la conversation posée est une alarme » sur tous les objets : simulateur de chuchotement ; au moins un archétype tolérant. *(Conteste une décision du propriétaire — arbitrage (e).)*
3. RECOMMANDÉ — boucle crier / poser / reprendre jamais examinée.
4. RECOMMANDÉ — maximum sur `Loudness` normalisé ≠ plus fort à l'oreille ; aiguille « imprécise, retardée » contre fenêtre d'attribution de 1,5–2 s.
5. RECOMMANDÉ — Sonomètre illisible en portage à reculons dans le noir.
6. RECOMMANDÉ — zizanie : 120–180 ms d'écart, sous l'échelle d'attribution de 350 ms ; étiquette de score habillée en mécanique.
7. MINEUR — pas de zizanie à deux.
8. RECOMMANDÉ — « réalise le Pilier 3 » exagéré ; système 15 absent des *Dependencies*.
9. RECOMMANDÉ — lien avec D1 du système 6 non consigné.
10. MINEUR — marge de chuchotement réduite pour les voix étroites.

### network-programmer
1. **BLOQUANT** — « chaque client reçoit les `VoiceFrame` de tous » est faux ; aucun relais dans les ADR ; le document affirme les deux designs.
2. **BLOQUANT** — ADR-0003 (profil transmis) contre CAL-34 (jamais) ; sans `L_repos`, l'hôte n'a aucun seuil.
3. **BLOQUANT** — prédire l'avertissement d'un coéquipier exige son `L_repos` ; choisir voix propre seule, ou `Seuil,i` diffusé.
4. **BLOQUANT** — horloge d'intégration hôte non spécifiée ; un paquet silence perdu tient un cri.
5. RECOMMANDÉ — avantage de latence de l'hôte sur `max(L_i)`.
6. RECOMMANDÉ — budget voix → verdict 150–250 ms ; co-porteur non hôte sent le poids 2 RTT après ; poids interpolé.
7. RECOMMANDÉ — autorité du comptage d'épisodes, déconnexion de l'hôte.
8. RECOMMANDÉ — cadence réseau 20–30 Hz ; bande passante d'un relais non budgétée.
9. MINEUR — micro `Degraded` indiscernable d'un tricheur.

### audio-director
- 1.1 **BLOQUANT** — masquage : aucune règle de mix. 1.2 **BLOQUANT** — ducker le chat détruit l'attribution. 1.3 RECOMMANDÉ — émetteur au porteur.
- 2.1 **BLOQUANT** — fuite casque : un gémissement tonal passe la porte de voisement ; interdire le tonal, plafonner le niveau, étendre le POC. 2.2 **BLOQUANT** — boucle de rétroaction de l'ambiance de zizanie.
- 3.1 RECOMMANDÉ — cinq flux auditifs ; matrice de différenciation. 3.2 RECOMMANDÉ — apprentissage en couches. 3.3 **BLOQUANT** — territoire sonore mobilier / habitant. 3.4 MINEUR — part visuelle de la zizanie.
- 4.1 **BLOQUANT** — événement ou état ; retrigger, temps de recharge, variantes. 4.2 RECOMMANDÉ — polyphonie.
- 5.1 **BLOQUANT** — plateau au-dessus du seuil contre « jamais confondu » ; trois états sonores.
- 6.1 **BLOQUANT** — le Sonomètre ne couvre pas l'avertissement ; tremblement amplifié en option.
- 7.1 RECOMMANDÉ — confusion avant / arrière ; attribution par reconnaissance du locuteur et même pièce / autre pièce.
- 8.1 **BLOQUANT** (gouvernance) — l'audio-director absent des attributions de 12 et 13. 8.2 RECOMMANDÉ — volume d'assets sous-estimé. 8.3–8.4 MINEUR — bus streamers, LUFS.

### accessibility-specialist
1. **BLOQUANT** — avertissement exclusivement auditif pour un joueur sourd (pas d'haptique au clavier/souris, amorçage imperceptible par définition) ; micro-tremblement de caméra.
2. **BLOQUANT** — frémissement et zizanie sans équivalent visuel garanti.
3. **BLOQUANT** — connaissance de soi « proprioceptive » exclut les joueurs sourds de leur propre boucle ; tremblement plus marqué pour sa propre contribution.
4. **BLOQUANT** — « Question close » a répondu à une question plus facile ; rouvrir et scinder.
5. **BLOQUANT** — chuchotement comme seul registre sûr, sans considération de santé vocale ni de durée ; rythme réglable.
6. RECOMMANDÉ — le seuil personnel rééchelonne le niveau, pas la précision de modulation.
7. **BLOQUANT** — aucun canal de coordination non vocal au MVP.
8. **BLOQUANT** — Sonomètre codé par couleur dans le noir ; forme, pulsation, palette bleu → orange.
9. **BLOQUANT** — aucune fenêtre de réaction ajustable.
10. **BLOQUANT** — profils approximatifs / `LowRange` désignés coupables par le maximum.
11. **BLOQUANT** — stinger sans fondu, répété, sans option contre les sons soudains.

### gameplay-programmer
1–3 **BLOQUANT** — prédicat SILENCE : égalité flottante atteignable seulement avec une coupure dure du système 3.
4 **BLOQUANT** — aucun pseudocode de tick unique et ordonné.
5 **BLOQUANT** — avertissement : événement ou état ; le banc = état conditionné par `voiced` dans une bande ×1,6 ; aucune règle de retrigger.
6 RECOMMANDÉ — la zizanie ne peut jamais seule faire basculer en alarme ; voulu ?
7 **BLOQUANT** — « repris du banc » vrai pour `lourdeur(charge)`, faux pour `charge(voix)` (plancher 35 %, rampe 25 dB).
8 **BLOQUANT** — les 350 ms validés sur un état en bande conditionné par la parole, pas sur un événement.
9 RECOMMANDÉ — aucun seuil personnel dans le banc.
11 **BLOQUANT** — signature du point d'extension insuffisante ; `VoiceContribution` / `IVoiceCombiner`.
12 RECOMMANDÉ — `[UNIT]` suppose `IRoomQuery` non déclaré. *(Compte de 26 : erreur d'addition, 28 vérifié.)*
14 **BLOQUANT** — curseurs et panneau de réglage en réseau : désynchronisation avertissement local / verdict hôte ; réplication et propriétaire.
16–17 **BLOQUANT** — machine à états de l'épisode ; fin de contrat pendant un épisode.
18–19 RECOMMANDÉ — membres de la pièce changeant en cours d'épisode ; objet oscillant sur une embrasure.
22 RECOMMANDÉ — relire `Seuil,i` depuis le profil vivant à chaque tick, jamais en cache.
