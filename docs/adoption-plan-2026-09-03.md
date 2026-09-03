# Adoption Plan

> **Generated**: 2026-09-03
> **Project phase**: Systems Design
> **Engine**: Unity 6.3 LTS (`6000.3.18f1`)
> **Template version**: v1.0+

Work through these steps in order. Check off each item as you complete it.
Re-run `/adopt` anytime to check remaining gaps.

**Context**: this project has no BLOCKING gaps because nothing yet exists in the
template's expected locations to be malformed. The real work — a 1147-line GDD, three
system notes, a 52 KB technical decision log, and a working `Voice.Core` assembly with
tests — lives entirely outside the template structure, in `Obsedian_SUAC_FIA/` and
`Unity/Shut_up_and_carry/`. This plan's job is ingestion, not correction: move real,
already-made decisions into the format the template's skills can read.

---

## Step 1: Fix Blocking Gaps

None. Nothing exists yet in a template location to produce silently wrong results.

---

## Step 2: Fix High-Priority Gaps

### 2a. Extract `design/gdd/game-concept.md` from the GDD's Pitch section

**Problem**: No game concept doc exists in the template location. `/map-systems`
cannot run without it.

**Source**: `Obsedian_SUAC_FIA/GDD_Shut_Up_And_Carry_1.md`, PARTIE 1 (lines 9–87) —
Fiche d'identité, Logline, Piliers, Synopsis, But et Progression, Inspirations.

**Fix**: Author `design/gdd/game-concept.md` using
`.claude/docs/templates/game-concept.md`. This is not a translation exercise —
PARTIE 1 already contains an Elevator Pitch, Core Identity, Game Pillars (with
opposable formulations — "the game does not reward silence, it rewards control"),
and Inspirations. Map section-to-section:

| Template section | Source |
|---|---|
| Elevator Pitch | §1.2 Logline |
| Core Identity | §1.1 Fiche d'identité |
| Core Fantasy / Unique Hook | §1.3 Piliers — Voice-Physics, Dissonance Émotionnelle |
| Core Loop | §1.4 Synopsis + §2.2 Boucle de Gameplay |
| Game Pillars | §1.3 (already opposable — keep as-is, do not water down) |
| Inspiration and References | §1.6 |
| MVP Definition | **`design/mvp-scope.md`** — already written and confirmed this session; use it verbatim as the source, do not re-derive |

**Language**: section headings in English (parsed by skills); body text in French,
matching this session's convention. Keep the opposable formulations exactly as
written — they are precise design claims, not decorative prose.

**Time**: 1 session
- [x] design/gdd/game-concept.md written (relecture collaborative en cours)

### 2b. Formalize the FishNet + Networking decisions as ADRs

**Problem**: Zero ADRs exist, but `LOG - Décisions techniques.md` already contains
six architecture decisions written in near-ADR form (Context / Alternatives
Considered / Decision / Why / Consequences). This is retrofit work, not design work
— the thinking is already done.

Create each with `/architecture-decision`, pointing it at the cited LOG section as
source material so it formalizes rather than re-decides. Suggested order follows
dependency (networking foundation → authority model → audio pipeline → data
contract → chat transport → code layout):

| # | ADR | Source (LOG entry, dated) | Note |
|---|---|---|---|
| 1 | Networking Framework & Topology | 2026-06-28 "Framework réseau : FishNet" + 2026-07-03 "Topologie réseau" + 2026-07-04 "Transport réseau : Facepunch.Steamworks + FishyFacepunch" | Merge these three — one decision made in three passes |
| 2 | Physics Authority Model | 2026-07-03 "Où calculer les effets physiques : Server (Host) only" | **This is the shared-object-physics authority decision** — already made: host-authoritative, full broadcast, no client prediction |
| 3 | Voice Analysis Pipeline | 2026-07-04 "Analyse audio : FMOD + FFT natif" + 2026-06-30 "Modularité audio" + 2026-07-05 "Capture et analyse audio : analyse locale, transmission des features" | |
| 4 | Voice Data Boundary — Raw vs Normalized | 2026-07-27 "La frontière brut/normalisé est opposable à la compilation" + "Où vit l'état" + "Détection de hauteur : YIN" + "Le voisement exige une porte de volume" + "Pas de champ vide" | Matches the existing `Voice.Core` code and `PublicSurfaceTests` exactly — this ADR documents code that already exists and is tested |
| 5 | Voice Chat Transport | 2026-09-03 "Dissonance conservé, mais sur son propre transport (P2P Steam), pas sur FishNet" | Supersedes the 2026-07-05 "Dissonance + FishNet sessions parallèles" entry — record the supersession in the ADR's history, don't silently drop it |
| 6 | Code Architecture — Assembly Split | 2026-07-27 "Architecture du code : `Assets/_Project` et découpage en assemblies" | Descriptive of what already exists in `Unity/Shut_up_and_carry/Assets/_Project/` |

Each ADR needs, beyond what the LOG already has: `## Status` (Accepted — these are
implemented or actively guiding implementation), `## Engine Compatibility` (check
against `docs/engine-reference/unity/VERSION.md` — ADR-1's Netcode choice should
note NGO 1.x deprecation in 6.3, even though FishNet was chosen, since it explains
why NGO was never a real alternative), `## ADR Dependencies` (ADR-2 depends on
ADR-1; ADR-4/5 depend on ADR-3), `## GDD Requirements Addressed` (left blank until
`game-concept.md` and per-system GDDs exist — fill in during `/architecture-review`).

**Optional 7th ADR**: Rendering Pipeline (2026-09-03 "Rendu : URP, direction
artistique lo-fi") — lower priority; this may belong in an art bible instead of an
ADR. Judgment call, not a migration blocker.

**Time**: ~30 min each × 6 = ~3 hours, mostly transcription and Engine Compatibility checks
- [x] ADR-0001 Networking Framework & Topology
- [x] ADR-0002 Physics Authority Model
- [x] ADR-0003 Voice Analysis Pipeline
- [x] ADR-0004 Voice Data Boundary — Raw vs Normalized
- [x] ADR-0005 Voice Chat Transport
- [x] ADR-0006 Code Architecture — Assembly Split

### 2c. Decompose the MVP into `design/gdd/systems-index.md`

**Problem**: No systems index exists. `/create-epics` and `/gate-check` need it.

**Fix**: Run `/map-systems` **after** 2a is done — it reads `game-concept.md`.
Scope it to the 12 systems already fixed in `design/mvp-scope.md`; do not let it
re-expand into the full GDD's complete vision (bestiary, economy, deployables are
already explicitly out of scope).

**Time**: 1 session
- [ ] `design/gdd/systems-index.md` created, limited to the 12 MVP systems

### 2d. Author per-system GDDs

**Problem**: 0 of 12 MVP systems have a template-format GDD.

**Fix**: `/design-system [system]` for each, after 2c. Two systems already have
partial source material to draw from instead of starting blank:
- **Voice-Physics analysis** → `Obsedian_SUAC_FIA/02 - Systèmes/SYS - Audio & Voix.md`
  + the `Voice.Core` code itself (it's already built — this GDD partly documents
  an implemented system, which `/reverse-document design` may handle better than
  `/design-system` for the parts already coded)
- **Networking** → `Obsedian_SUAC_FIA/02 - Systèmes/SYS - Réseau.md`

The other 10 (portage d'objets, mobilier, habitant, chat vocal, boucle de contrat,
mort, 3C, appartement, résolution de fin) have no existing draft —
`SYS - Gameplay Physique.md` is effectively empty (83 bytes) despite its filename.

**Time**: several sessions — this is the main Systems Design work, not a quick fix
- [ ] 12 per-system GDDs authored (track individually once `systems-index.md` exists)

### 2e. Create the control manifest

**Fix**: Run `/create-control-manifest` after Step 2b's ADRs are Accepted — it
reads ADR content to build the rules sheet.

**Time**: 30 min
- [ ] `docs/architecture/control-manifest.md` created

---

## Step 3: Bootstrap Infrastructure

### 3a. Register existing requirements (creates tr-registry.yaml content)
Run `/architecture-review` once the ADRs (2b) and at least the first per-system
GDDs (2d) exist — it reads GDDs and ADRs to populate
`docs/architecture/tr-registry.yaml`, which currently exists but is empty
(correctly scaffolded, nothing to register yet).
**Time**: 1 session
- [ ] `tr-registry.yaml` populated with real TR-IDs

### 3b. Create control manifest
Already covered in 2e above — listed here for pipeline-order visibility only.

### 3c. Create sprint tracking file
Run `/sprint-plan update` once the MVP systems have stories.
**Time**: 5 min
- [ ] `production/sprint-status.yaml` created

### 3d. Confirm project stage
`production/stage.txt` already reads `Systems Design`, set this session. Re-run
`/gate-check` once Steps 2a–2d are complete to advance it authoritatively.
**Time**: 5 min
- [ ] `/gate-check` run after Systems Design work is complete

---

## Step 4: Medium-Priority Gaps

### 4a. Create the architecture traceability matrix
`docs/architecture/architecture-traceability.md` does not exist. Low urgency until
ADRs and GDDs both exist — `/architecture-review` can generate it directly.
**Time**: included in `/architecture-review` (3a)
- [ ] `architecture-traceability.md` created

### 4b. Fill in `SYS - Gameplay Physique.md`
83 bytes — a stub in name only. This is exactly the "portage d'objets" +
"mobilier réactif" content from GDD §2.4/§2.6, which are both in the MVP scope.
Either fill it before running `/design-system` on those systems, or skip it and
let `/design-system` author directly from the GDD — the stub adds no information
either way.
**Time**: skip, or 30 min if you want an intermediate note
- [ ] Decision made: fill in or skip

### 4c. Reconcile `design/mvp-scope.md` with `game-concept.md`'s MVP Definition section
Once 2a is done, `game-concept.md` will have its own "MVP Definition" section per
the template. Two documents claiming to be the source of truth for scope will
drift. Recommendation: keep `design/mvp-scope.md` as the detailed, dated,
revision-tracked version (it already has a Revision History table), and have
`game-concept.md`'s MVP Definition section **link to it** rather than duplicate it.
**Time**: 5 min, once 2a is underway
- [ ] `game-concept.md` MVP Definition section references `design/mvp-scope.md` instead of restating it

### 4d. Set up sprint tracking
Covered in 3c — listed here for completeness since it's genuinely medium, not
high, priority at this stage (no stories exist yet to track).

---

## Step 5: Optional Improvements

### 5a. Archive the non-canonical GDD
`Obsedian_SUAC_FIA/GDD_Shut_Up_And_Carry.md` (1077 lines) is superseded by
`GDD_Shut_Up_And_Carry_1.md` (1147 lines, confirmed canonical this session — the
diff is concentrated in §2.5 Bestiaire). Recommend moving it to
`Obsedian_SUAC_FIA/05 - Journal/` or deleting it, so a future agent reading the vault
doesn't pick the wrong one.
**Time**: 5 min
- [ ] Non-canonical GDD archived or deleted

### 5b. Update the stale BACKLOG entry
`Obsedian_SUAC_FIA/05 - Journal/BACKLOG - Points ouverts.md` still has an open item
"`GDD - Direction Artistique.md` est vide" — that file was deleted this session
(along with two other 0-byte GDD files). Update or remove the backlog entry.
**Time**: 5 min
- [ ] BACKLOG entry updated

### 5c. No action needed — `Shut_Up_And_Carry_SEP26`
Verified this session: a vanilla URP template project (only Unity's own
`Readme.cs` / `ReadmeEditor.cs`, no authored code). `Unity/Shut_up_and_carry/` is
the canonical project. Nothing to migrate; delete at your convenience or leave it.
- [x] Resolved — no action required

---

## What to Expect from Existing Stories

No stories exist yet (`production/epics/` is empty), so there is nothing to worry
about breaking. Once stories are generated via `/create-stories` after Step 2d,
they will carry TR-IDs and ADR references natively — there is no legacy-story
compatibility concern for this project.

---

## Re-run

Run `/adopt` again after completing Step 2 to verify the HIGH gaps are resolved.
The new run will reflect the current state of the project.
