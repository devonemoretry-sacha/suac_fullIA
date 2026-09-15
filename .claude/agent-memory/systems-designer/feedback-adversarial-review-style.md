---
name: feedback-adversarial-review-style
description: Expected output shape for adversarial/re-review tasks on this project's GDDs — French prose, arithmetic-heavy, cite exact lines, verdict per candidate, no padding.
metadata:
  type: feedback
---

When asked to do an adversarial re-review of a GDD (as opposed to authoring or
a normal `/design-review`), the expected output shape is consistently:

- **Written in French**, even though section headers in the GDDs themselves
  are English by project convention.
- **Plug concrete numbers into every formula under scrutiny** rather than
  arguing qualitatively — the task always wants a computed witness (e.g.
  `x = 2/13 = 0.1538 → Loudness = 0.1538^0.65 ≈ 0.296`), not "this seems too
  sensitive."
- **Cite exact line numbers** from the target document for every claim: this
  project's reviewers (audio-director, qa-lead, etc.) all do this and
  cross-check each other's line citations, so an uncited claim reads as
  unverified.
- **Explicit verdict per candidate**: CONFIRMÉ / RÉFUTÉ / AFFINÉ, never a vague
  "there might be an issue." When refuting a candidate given by the task
  brief, show the arithmetic that fails to produce a witness rather than just
  disagreeing.
- **Severity labels are BLOQUANT / RECOMMANDÉ / MINEUR** (French), matching
  the labels already used in `design/gdd/reviews/*.md` — do not invent new
  severity vocabulary.
- **"Do not pad"** is stated explicitly in task briefs — skip restating things
  already confirmed clean without new information; a one-line "vérifié
  propre, aucun bug" is preferred over a paragraph when nothing was found.
- Findings that build on a same-week sibling report (e.g. `audio-director.md`
  in the same `session-logs` folder) should explicitly co-sign or extend
  rather than silently re-deriving the same point — this project tracks which
  specialist found what, and duplicated/unattributed findings have been
  flagged as a defect pattern in prior reviews (the object-effect review
  calls this out: "chaque règle est énoncée trois ou quatre fois").
- Output goes to **both**: a file at
  `production/session-logs/<review-folder>/<agent-key>.md` AND the full text
  returned as the final answer (the orchestrator reads the returned text, not
  the file) — see [[project-voice-physics-grouped-revision]].
