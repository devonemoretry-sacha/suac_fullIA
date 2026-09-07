# Revue de conception — Analyse vocale

| Champ | Valeur |
|---|---|
| **Document revu** | `design/gdd/voice-analysis.md` |
| **Date** | 2026-09-07 |
| **Verdict** | **NEEDS REVISION** — non majeure |
| **Type** | Première revue |
| **Spécialistes** | game-designer, systems-designer, ux-designer, unity-specialist, performance-analyst, qa-lead, creative-director (arbitrage) |
| **Suites** | GDD révisé le 2026-09-07 · ADR-0007 · ADR-0008 |

---

## Traitement — ce qui a été fait de cette revue

### Appliqué au GDD

| Point de la revue | Application |
|---|---|
| `CrestMinDb`/`CrestMaxDb` sans règle de validation | Précondition `CrestMaxDb > CrestMinDb` en *Formulas*, cas limite en *Edge Cases*, critère **AC-26b**. La revue désigne ce point comme sa meilleure trouvaille, et c'est justifié : c'est le même retournement silencieux que `Floor_dB > Scream_dB`, sur l'autre dénominateur du document |
| Rejet de `F0_habituel` en égalité exacte | Seuil porté à **20 Hz**. Cas de test obligatoire à 0,01 Hz, qui produisait ≈ +162 demi-tons sans jamais diverger. **AC-27** |
| Blanchiment de constantes provisoires dans AC-01, AC-04, AC-25 | Règle en tête de section A : le test **dérive** sa valeur attendue de la constante nommée. Les nombres du document deviennent des repères de lecture, pas des littéraux |
| Découpage du minimum de 20 dB | **Plancher dur** ~12–15 dB qui refuse, **bande de qualité** ~20 dB qui accepte en marquant `LowRange` avec lissage renforcé. Plus le contrat système 6 : mesurer `Floor_dB` avec une marge au-dessus du bruit propre du micro — c'est lui, et non le seuil, qui corrige l'oscillation à 2 dB |
| Gel d'écrêtage sans réarmement | Relâchement à la première trame non écrêtée ; dérive vers 0,5 au-delà d'une fenêtre de ~250 ms. **AC-32b, AC-32c**, et **AC-32d** pour la trame incohérente `Voiced=true` / `Loudness≈1` / `Continuity` gelée |
| Valeurs d'enveloppe absentes | **10–20 ms** d'attaque, **120–200 ms** de relâchement, marquées PROVISOIRE. Plus la règle générale de report : valeur provisoire + déclencheur nommé + propriétaire, faute de quoi ce n'est pas un report mais un trou |
| OQ-1 à fermer en option A | Fermé. Médiane sur nombre pair = élément bas des deux centraux |
| Revendication « Implements Pillar 1 » | Corrigée en **« Enables Pillar 1 »**, avec la raison en clair dans l'en-tête |
| `## Detailed Design` hors standard | Renommé **`## Detailed Rules`** |
| Anti-rebond `Degraded`, `OnAudioConfigurationChanged`, piège `[SerializeField]` 6.3 | Ajoutés au contrat de voisinage du système 2. **AC-20c** |
| Compteur `ProfilerRecorder` | **AC-42b** — coût par instance et **écart de cadence**, seule instrumentation rendant visible le défaut d'OQ-3 |
| Méthodologie de chauffe d'AC-41 | Boucle de chauffe + `GC.Collect()` avant fenêtre mesurée. **AC-41b** pour la bascule de profil à chaud |
| Coût du 12 kHz | ~2,25× le coût YIN, chiffré dans le profil de charge nominal |
| Date sur OQ-8 | Le playtest même-pièce doit avoir lieu **avant** l'écriture des GDD des systèmes 3 et 12, qui encoderont tous deux l'hypothèse « une voix par `VoiceFrame` » |

### Promu en ADR

| Point | Suite |
|---|---|
| OQ-3 — cadence implicite ou `deltaTime` explicite | **ADR-0007**, `Accepted`. Le constat du `unity-specialist` ferme le débat : aucun mécanisme Unity ne fournit 50 Hz fixe, donc la première option du GDD **n'existe pas**. À appliquer avant d'écrire le `VoiceAnalyzer` |
| OQ-7 — partage du micro | **ADR-0008**, `Proposed`. Recadré : la question préalable est l'ingestion de PCM externe par le SDK de chat. Le test d'une demi-journée ne mesure rien tant que ce point n'est pas tranché |

---

## Contestations

Deux points de la revue n'ont pas été appliqués. Ils sont consignés ici plutôt que
silencieusement ignorés.

### 1. « `VoiceAnalyzer` est par joueur, 2 à 8 joueurs » — **faux**

Item bloquant n° 3, du `performance-analyst`. ADR-0003 est explicite : *« chaque client
analyse son propre micro sur le signal brut, en local, et ne transmet à l'hôte que des
features »*. Il y a **un seul analyseur par client**, quel que soit le nombre de joueurs ;
les `VoiceFrame` des autres arrivent par le réseau et ne sont jamais recalculées. Le coût
de l'analyse ne dépend pas de la taille de la partie, et retenir « 8 joueurs » comme profil
nominal aurait fait dimensionner le système contre une charge inexistante.

**Ce qui a été retenu du fond.** La propriété du thread n'était effectivement écrite nulle
part, et le « profil de charge nominal » d'AC-42 était vide. Les deux sont corrigés — mais
le pire cas nominal est **un joueur à voix aiguë décimé à 12 kHz** (~2,25× le coût YIN),
et non une partie pleine.

### 2. « `Degraded` n'a pas de sortie » — **faux**, et la revue aggrave une erreur du document

Item bloquant n° 7, du `qa-lead`. La transition existe et a toujours existé : table des
transitions, `Degraded → Calibrated` sur **retour d'échantillons valides**, l'état étant
déjà propre. AC-20 ne la contredit pas — recevoir un **profil** ne rétablit pas
`Calibrated`, recevoir des **échantillons** si. Deux déclencheurs distincts.

L'erreur vient de loin : une version antérieure des *Open Questions* affirmait elle-même
que la sortie n'était pas spécifiée, alors qu'elle figurait dans un tableau du même
document. La revue a repris cette affirmation et l'a durcie en « il n'y a peut-être aucune
sortie ». **Les deux sont corrigés** — le GDD ne se contredit plus, et OQ-2 est fermée
comme fausse question.

**Ce qui manquait réellement** n'était pas la transition mais son **anti-rebond**. C'est
retenu, et c'est désormais un contrat du système 2.

### Non contesté, mais différé : le déplacement de *UI Requirements*

Le `creative-director` a raison sur le principe — un système sans interface n'a pas à
porter de section UI, et ce contenu appartient au GDD du système 6. **Il n'est pas déplacé
maintenant** : le GDD du système 6 n'existe pas, et sortir du contenu pour le reloger
« plus tard » est la manière ordinaire de le perdre. La section reste en place, marquée
**contrat hérité en transit**, à migrer telle quelle avec les trois réserves de l'UX
designer le jour où le système 6 s'écrit.

---

## Rapport original

> Reproduit intégralement. Les positions ci-dessus s'y ajoutent, elles ne le modifient pas.

**Specialists consulted**: game-designer, systems-designer, ux-designer, unity-specialist,
performance-analyst, qa-lead, creative-director (senior)
**Re-review**: No — first review (no `design/gdd/reviews/` directory exists)

### Completeness: 8/8 sections present

All required sections are present with substantive content, plus three extras
(Visual/Audio Requirements, UI Requirements, Open Questions).

One naming deviation: the heading is `## Detailed Design`, but `.claude/rules/design-docs.md`
and `design/CLAUDE.md` both specify **Detailed Rules**. Content fully satisfies the
requirement (Core Rules, States and Transitions, Interactions) — this is a label mismatch
that could trip automated section-checking, not a content gap.

### Dependency Graph

Every declared dependency is a system with no GDD on disk. The document discloses this
itself (« Aucun système voisin n'a de GDD à ce jour ») and compensates with explicit
neighbour-contract lists — which the creative-director identifies as the document's
highest-value content, and also where the review found the most omissions.

- ✗ 6. Calibration vocale — NOT FOUND (hard runtime dependency)
- ✗ 2. Audio d'entrée — NOT FOUND (hard runtime dependency)
- ✗ 3. Propagation du son — NOT FOUND (consumer)
- ✗ 12. Couche de retour local — NOT FOUND (consumer)
- ✗ 5. Réseau — NOT FOUND (consumer)
- ✗ 19. UI diégétique — NOT FOUND (consumer)

Cross-checked against ADR-0003, ADR-0004 and ADR-0006: every claim the GDD makes about
those ADRs is accurate (AEC upstream of the fork, YIN aperiodicity 0.15, 8 kHz decimation
with 12 kHz as the named high-voice remedy, 70–600 Hz range, calibration living inside
`SUAC.Voice.Core`, the `{VoiceFrame}` → `{VoiceFrame, VoiceProfile}` surface extension).
**No ADR contradictions found.**

### Required Before Implementation

Blocking items, in the creative-director's ranked order. All are localized edits — a table
row, a paragraph, or a constant — none require re-architecting.

1. **`CrestMinDb`/`CrestMaxDb` have no validation rule, while `Floor_dB`/`Scream_dB` do.**
   [systems-designer, endorsed as the review's best catch] The doc calls the inverted
   `Scream−Floor` denominator « le cas le plus dangereux du document » and guards it at
   commit. `(CrestMaxDb − CrestMinDb)` has the identical silent sign-flip failure mode,
   unguarded — transposed bounds make percussive read as held-note with no NaN and no error.
2. **`F0_habituel` rejection is exact equality (`= 0`).** [systems-designer] A 0.01 Hz value
   slips through and yields `Pitch ≈ 162` semitones, 13.5× outside the documented ±12 range.
   Needs an epsilon floor (~20 Hz).
3. **Thread ownership and N-player scaling are unstated.** [performance-analyst] The project
   budget caps main-thread DSP at 1 ms/frame total; `VoiceAnalyzer` is per-player at 2–8
   players; AC-42's « profil de charge nominal » is undefined. Not deferrable to System 5 —
   networking owns wire rate, not execution context. State 8 players as the nominal profile.
4. **AC-01, AC-04 and AC-25 launder provisional constants into "verified" expected outputs.**
   [qa-lead] AC-25 hardcodes `< 20 dB` inside the very document whose AC-43/44 forbid exactly
   that. AC-01's 0,64 only resolves with γ=0.65; AC-04's 0,87 only with CrestMin=8/CrestMax=20.
   Internal contradiction, not a nitpick.
5. **OQ-3 is already answered — write the ADR.** [unity-specialist] Unity offers no 50 Hz
   callback: `Update` is display-coupled, `FixedUpdate` is a catch-up scheduler, `Microphone`
   is poll-only, `OnAudioFilterRead` is sample-count-driven with a runtime-mutable buffer
   size. OQ-3's first option (« keep the implicit cadence as a written contract ») is not
   actually available. Must land before `VoiceAnalyzer` is written — it touches the public
   signature of the assembly's only stateful type.
6. **OQ-7 is mis-scoped — it's an SDK-selection question, not an audio test.**
   [unity-specialist, called the single highest-leverage finding] The real blocker is whether
   the chosen voice-chat SDK accepts externally-supplied PCM rather than owning capture
   itself. Most don't. The half-day test is meaningless until that precondition is answered.
7. **`Degraded` has no exit path — worse than self-reported.** [qa-lead] AC-20 specifies that
   a valid profile does not restore `Calibrated`, and no other path is defined. The doc's
   self-flagged gap #2 called it "unspecified"; combined with AC-20 there may be no exit at all.
8. **Split the 20 dB minimum into two constants** (see Conflict 1), and add the
   `Floor_dB`-vs-mic-self-noise margin to the System 6 contract.
9. **Ship provisional envelope attack/release values + an AC that fails while unset.**
   [game-designer] Suggested ~10–20 ms attack, ~120–200 ms release, marked PROVISOIRE like γ.
10. **Clipping-freeze needs a timeout/re-arm**, plus one AC covering the inconsistent frame
    `Voiced=true`, `Loudness≈1`, `Continuity=stale`. [systems-designer + qa-lead, independently]
11. **Adopt OQ-1 option A and close it** (low element of the two central values during ring
    warm-up).
12. **Fix the "Implements Pillar 1" header claim.** [game-designer] The body correctly argues
    this system guarantees a precondition for Pillar 1; the header overclaims and misleads
    anyone skimming the systems index for Pillar-1 coverage.

### Specialist Disagreements

**Conflict 1 — the 20 dB minimum dynamic range, pushed in opposite directions.**
`game-designer` argued to relax it (it's provisional; relaxing could include quiet-voice
players who can't scream but still produce comparable relative effort). `systems-designer`
argued it's already too low (at exactly 20 dB, a 2 dB wobble within mic self-noise moves
`Loudness` from 0.148 to 0.286 — nearly doubling from noise rather than gesture).

> **Creative-director ruling**: split the constant — it's doing two incompatible jobs. A hard
> floor (~12–15 dB) for denominator sanity that refuses the commit, and a quality band
> (~20 dB) that accepts the profile but marks it `LowRange` and applies heavier envelope
> smoothing. This gives the inclusion and the honesty simultaneously. Crucially: the
> noise-wobble complaint is **not fixed by moving the threshold at all** — it's fixed by
> requiring System 6 to measure `Floor_dB` with a stated margin above mic self-noise. The
> threshold is a red herring for that specific failure.

**Conflict 2 — how much the "delegated fantasy" framing may defer.** `game-designer` said the
framing is being used to justify an absent core-feel decision; `ux-designer` separately found
the calibration section asserting framing where it needs mechanism.

> **Creative-director ruling**: there's a pattern, but narrower than ux-designer implies. The
> document's method — name the tension, expose the knob, name the trigger — is legitimate and
> is why the doc is good. The specific failure mode is: **when the doc has no number, it
> substitutes an argued paragraph and drops the AC.** Uniform test: every deferral must carry
> (a) a provisional value, (b) a named trigger, (c) an owner. γ passes all three. TTL fails
> (a) and (b). Envelope attack/release fails all three. The calibration UX case is a different
> failure — not an unmade decision but a misplaced one, belonging to System 6.

**Creative-director overruled three specialists** — worth surfacing since they were briefed
adversarially:

- `ux-designer`'s three BLOCKINGs downgraded (calibration social discomfort, plateau/validation
  coupling, `Degraded` false-positive debounce). All are System 6 / System 2 territory. *"This
  GDD's sin is not failing to solve them; it is having written a UI Requirements section at all
  for a system with no UI."* One exception kept: the `Degraded` debounce belongs in this doc's
  System 2 neighbour contract, because this doc is currently the only place that contract exists.
- `qa-lead`'s AC-38 sample size (N=8–10) rejected — solo dev, pre-production, 4–5 testers is
  defensible. The substantive half (a shape-agreement band, since monotonic + non-crossing is
  ordinal-only and passes on wildly different curve steepness) is accepted.
- `qa-lead`'s AC-40 fixture diversity accepted but demoted to backlog rather than blocking.

### Recommended Revisions

- Set a **date, not a caveat**, on OQ-8 same-room mic bleed: the same-room playtest happens
  before any System 3 or 12 GDD is written, since both will encode the single-voice-per-`VoiceFrame`
  assumption. [game-designer]
- Complete the performance estimate — the current one covers ~30% of the 10-step chain (only
  decimation + YIN have numbers). [performance-analyst]
- Add a `ProfilerRecorder` runtime counter (per-instance µs/frame + cadence delta) and an
  automated CI smoke test complementing AC-42's manual on-target pass. [unity-specialist +
  performance-analyst, independently]
- Move the UI Requirements content into the System 6 GDD as inherited contracts, carrying all
  three ux-designer findings with it.
- Add to the System 2 neighbour contract: the `[SerializeField]`-on-property compile error
  (Unity 6.3), and `AudioSettings.OnAudioConfigurationChanged` as the device-change hook.
  [unity-specialist]
- AC-41 warm-up methodology (warm-up loop + `GC.Collect()` before the measured window);
  explicitly scope the profile hot-swap in or out. [unity-specialist + performance-analyst]
- Reopen the accessibility exclusion once `LowRange` profiles exist — it may be narrower than
  currently written. [game-designer + ux-designer]
- Quantify the 12 kHz decimation cost variance (~2.25× YIN cost for high-voiced players, YIN
  being ~O(window²)). [performance-analyst]

### Nice-to-Have

- Rename `## Detailed Design` → `## Detailed Rules` to match the project's section standard.
- Clarify whether `Pitch` is short-circuited before the `Voiced` gate or computed-then-masked
  (transient `log2(0) = −∞` could leak into logs). [systems-designer]
- AC-03 tolerance placement; AC-11's `≈ 0,05 %` in a deterministic fixture; AC-37's unspecified
  sample positions. [qa-lead]
- Note denormal-flush differences between Mono and IL2CPP. [unity-specialist]

### Senior Verdict [creative-director]

> *"This is the strongest first GDD I have reviewed on this project, and its self-audit is
> doing real work. But it is a Foundation document that 15 systems will build against, and it
> contains four silent-wrong-value holes of exactly the class it claims to be hunting."*

On what the document is for at this stage: it's the contract 15 unwritten GDDs will inherit,
authored by a solo dev with no neighbour to check against. Judged that way, its greatest value
is the neighbour-contract lists in *Dependencies* — and those are where the review found the
most omissions. **Spend the revision there first.**

### Scope Signal

Rough scope signal: **L** (producer should verify before sprint planning) — 3 formulas, 6
declared dependencies (none with a GDD), and this review generates at least one required ADR
(OQ-3 explicit `deltaTime`) plus likely a second (OQ-7 / voice-SDK PCM capability).

### Verdict: NEEDS REVISION

Not MAJOR — every blocking item is a table row, a paragraph, or a one-line constant.

---

## Reste ouvert après révision

| # | Point | Suite |
|---|---|---|
| 1 | TTL de l'anneau — sans valeur, sans déclencheur | Le dernier report du document qui ne satisfait aucun des trois critères. AC-35 reste non exécutable |
| 2 | Estimation de performance incomplète (~30 % de la chaîne chiffrée) | À compléter au POC |
| 3 | Diversité des fixtures d'AC-40 | Backlog, sur décision du creative-director |
| 4 | Bande d'accord de forme pour AC-38 | Retenu du qa-lead, à formuler |
| 5 | `Pitch` court-circuité ou masqué après calcul | Nice-to-have, à clarifier à l'écriture du `VoiceAnalyzer` |
| 6 | Écart de flush des dénormaux Mono / IL2CPP | Nice-to-have |
| 7 | Réouvrir l'exclusion d'accessibilité une fois `LowRange` en place | Elle est peut-être plus étroite qu'écrit |
| 8 | Migration de *UI Requirements* vers le système 6 | Au moment où ce GDD s'écrira |
