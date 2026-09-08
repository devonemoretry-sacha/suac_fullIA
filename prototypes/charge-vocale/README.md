# Prototype — Charge vocale

**Statut : en cours.** Aucun résultat consigné à ce jour.

## L'hypothèse testée

Toute la conception de la réponse du poids à la voix repose sur une thèse jamais éprouvée :
**qu'un joueur peut sentir que ça monte et avoir le temps de se taire.** Personne n'a jamais
ressenti cette mécanique — c'est le reproche central de la revue technique du 2026-09-08.

Le banc ne teste **que des constantes de temps**, et le temps est le même dans tous les
moteurs. Il cherche à répondre à une phrase, pas à un nombre :

> « J'ai senti que ça montait, j'ai eu le temps de me taire. »

Cible de ressenti et cahier des charges : `design/voice-weight-response.md`.

## Comment le lancer

```bash
node prototypes/charge-vocale/serve.js
```

Puis ouvrir **http://localhost:4321**.

> ### ⚠️ Pourquoi un serveur local et pas un simple fichier
>
> `getUserMedia` exige **deux** conditions : un contexte sécurisé **et** un document de
> premier niveau. `http://localhost` remplit les deux.
>
> Une **iframe d'artefact ne remplit pas la seconde** : le micro doit lui être délégué par
> `allow="microphone"`, ce qu'aucun artefact ne fait. Une première version publiée ainsi a
> échoué exactement pour cette raison — l'autorisation du navigateur ne sert à rien quand
> le blocage est au niveau de la frame. Un `file://` échoue également sur les navigateurs
> récents.
>
> Si la capture échoue malgré tout, la page affiche désormais le nom réel de l'erreur, plus
> l'état des deux conditions.

## Ce qu'il fait

- Capture avec `echoCancellation`, `noiseSuppression` et `autoGainControl` **désactivés** —
  les trois traitements que le GDD interdit sur le trajet d'analyse.
- RMS → dB → enveloppe **dans le domaine dB**, attaque 15 ms / relâchement 150 ms. Ce sont
  les constantes provisoires du système 1, avec la correction de domaine décidée le
  2026-09-08.
- Une **charge** qui se remplit en parlant et se vide en silence ; c'est elle, et non le
  niveau instantané, qui pilote le poids.
- Un **avertissement séparé du verdict** (ADR-0002) : halo ambre pendant que le canapé
  « s'excite », avant que la lourdeur ne se sente.
- Le poids se ressent comme une **inertie au glissement** : plus la charge est haute, plus
  le canapé traîne derrière le curseur.

## Les cinq curseurs

| Curseur | Défaut | Rôle |
|---|---|---|
| Seuil de parole | −45 dB | Remplace la calibration, absente ici. À poser au-dessus du bruit de la pièce |
| Temps de remplissage | 1,50 s | Durée jusqu'au poids maximal, à pleine voix |
| Temps de vidange | 1,50 s | Retour au transportable |
| Délai d'avertissement | 200 ms | Quand le canapé s'excite |
| Ralentissement d'amorçage | 15 % | Le poids bouge déjà, imperceptiblement |

Le relevé **« fenêtre utile » passe en rouge sous 400 ms** : en dessous, l'avertissement est
perçu en même temps que la sanction, donc ce n'est plus un avertissement.

## Ce qu'il ne teste pas

La physique Unity, le portage à deux, le réseau, la normalisation par joueur. Et il ne
tranche pas les deux questions ouvertes du système 11 — la voix d'un non-porteur agit-elle
sur l'objet, et les charges de plusieurs porteurs s'additionnent-elles ?

## Résultats

*(À remplir quand le prototype conclura. Les réglages retenus alimenteront le GDD du
système 11, qui n'est volontairement pas ouvert avant ça. Le code ne sera pas migré : il
sera réécrit.)*

| Date | Testeur | Réglages retenus | Verdict |
|---|---|---|---|
| — | — | — | — |
