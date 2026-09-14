---
name: project-voice-object-effect-review-2026-09-14
description: Adversarial qa-lead review of voice-object-effect.md (system 11) Acceptance Criteria, findings pending fix
metadata:
  type: project
---

Adversarial review of `design/gdd/voice-object-effect.md` Acceptance Criteria (VO-01..VO-36,
incl. VO-11b/VO-11c) performed 2026-09-14. Verdict: not deliverable as-is — several BLOQUANT
defects, none yet applied to the file.

**Why not yet fixed:** the calibration review (`design/gdd/reviews/voice-calibration-2026-09-11.md`)
already scheduled a **grouped revision pass** covering systems 1, 6 and 11 together (decided
2026-09-14): archive review → full review of 11 → re-review of 1 → **one single revision pass
on all three docs** → extended prototype → multi-human playtest → next GDDs. This review's
findings should be folded into that same pass rather than patched in isolation.

**Key blocking findings from this review (not yet in the file):**
- Formulas §2 (Régime: only ALARME/MURMURE) contradicts §3 (charge: three branches
  MURMURE/ALARME/SILENCE) — SILENCE is never defined as a subset of MURMURE or a peer regime,
  so "all voices literally silent" is ambiguous between "charge unchanged" (murmur math) and
  "charge decays" (silence math). Root cause of VO-15's contradiction with VO-07/formulas.
- VO-15 ("charge only decreases once the last voice drops BELOW THE OBJECT'S ALARM THRESHOLD")
  contradicts Formulas §3: dropping below the alarm threshold enters MURMURE, which never
  decreases charge — only true SILENCE (no voice reaches the object at all) does.
- SILENCE's reachability is undeclared: `L_i` comes from system 3 (no GDD, attenuation form
  unspecified — see VO-34/OQ-11.2). No witness proves "all L_i == 0 simultaneously" is ever
  achievable in real play. Per the reachability rule in `.claude/rules/design-docs.md`
  (added 2026-09-14 after [[voice-calibration-review]]), this is a candidate dead branch: the
  core promise "au silence, la charge retombe" (Overview) may be unreachable once system 3
  ships, and no acceptance criterion currently guards against that.
- VO-09 is self-contradictory: `Plafond_murmure > seuil_av` (the stated, correctly-calibrated
  inequality) logically means murmur crosses into the "principal" (real-weight) zone per the
  Formulas §4 amorçage/principal split — yet VO-09's own justification claims murmur "never"
  reaches real weight. Also only checks the reference configuration, a gap the document
  itself admits in "Ce que ces critères ne couvrent pas" but never escalates to blocking.
- Miscount: the document claims "vingt-six critères [UNIT]"; actual count is **28** (VO-11b
  and VO-11c, lettered rather than numbered, appear to have been dropped from the tally).
  Same class of error as the calibration review's "dix / quatorze" (CAL-39) finding — this
  project's GDDs have a recurring pattern of stale/incorrect tallies after late additions.
- Missing acceptance criterion for ADR-0002's core authority-separation guarantee: nothing
  tests that locally-predicted charge/lourdeur never reaches actual object physics, only the
  host-computed value does. This is arguably the most load-bearing rule in the whole document
  and has zero test coverage, blocking or otherwise.

**How to apply:** when the grouped revision pass on systems 1/6/11 happens, pull this file's
findings in alongside the calibration review's B1-B6. Do not treat this review as closed —
nothing has been written back to `voice-object-effect.md` yet as of 2026-09-14.
