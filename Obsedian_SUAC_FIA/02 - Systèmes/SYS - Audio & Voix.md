Navigation : [[MOC - Shut-up & Carry]] | [[SYS - Réseau]] | [[SYS - Gameplay Physique]]

## 🎯 Rôle

Deux voies indépendantes sur le même micro :

- **Voie analyse** — capture brute locale, extraction des features vocales, normalisation sur le profil du joueur, émission vers le host. C'est elle qui pilote le gameplay.
- **Voie communication** — capture traitée (VAD, AGC, réduction de bruit), transport réseau via Dissonance. C'est elle que les joueurs entendent.

L'analyse ne transite jamais par la voie communication : le traitement de confort détruit le chuchotement et les sons percussifs. Cf. [[LOG - Décisions techniques]] (2026-07-27).

## 🗺️ Stack

- [[TECH - Dissonance]] — voie communication uniquement
- [[TECH - FMOD]] — à confirmer : nécessaire seulement si l'analyse native Unity s'avère insuffisante

## 🧩 Sous-blocs

**Voie analyse (client)**

- [[FUNC - Capture micro brute]]
- [[FUNC - Analyse vocale]] — RMS, f0, crest factor, bandes
- [[FUNC - Calibration joueur]] — normalisation en écart relatif
- [[FUNC - Emission des features]] — vers le host, cadence fixe

**Voie communication**

- [[FUNC - Dissonance (capture + transport)]]

**Côté host**

- [[FUNC - Agregation des voix]] — distance et cumul multi-joueurs

