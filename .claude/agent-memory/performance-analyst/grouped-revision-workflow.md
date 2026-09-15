---
name: grouped-revision-workflow
description: This solo-dev project defers applying review fixes across dependent voice systems (1/6/11) until one grouped revision pass — don't read "not yet applied" as neglect
metadata:
  type: project
---

Reviews on `design/gdd/voice-analysis.md` (system 1), `voice-calibration.md` (system 6) and
`voice-object-effect.md` (system 11) are deliberately **not applied immediately** when a
review surfaces a cross-system issue. Decided by the owner on 2026-09-14 (see
`design/gdd/reviews/voice-calibration-2026-09-11.md`, section *Traitement*): fixing system 6
alone would mean revising it twice once system 1's re-review and system 11's review land
their own corrections to the same shared values (`Margin_dB`, `RestMax`, `L_repos`, `γ`,
decimation thresholds, etc.). The declared order is: archive individual reviews → full review
of system 11 → full re-review of system 1 → **one single grouped revision pass** across all
three documents → extended prototype → playtest → only then later GDDs.

**Why**: the three systems share thresholds and formulas (e.g. `Floor_dB`/`Margin_dB` feed
both system 1's voicing gate and system 6's validation bands; `L_repos` is computed in system
1's model but consumed by system 11). A fix applied to one document in isolation would very
likely need to be re-derived again once the sibling documents' own findings land — this
already happened once (`voice-calibration` review found `voice-object-effect`'s safety proof
cited a now-dead threshold, `RestMin`).

**How to apply**: when reviewing any of these three GDDs (or a later voice-pipeline GDD), do
not treat an unresolved BLOQUANT from a prior dated review as freshly discovered negligence —
check whether it's already logged as "differed to the grouped pass" before flagging it as new.
Cross-check findings against the sibling systems' review files before recommending a
system-local fix for a value another system also consumes (this is also now a written rule:
`.claude/rules/design-docs.md`, reachability/provenance/availability additions of 2026-09-14).
Individual specialist findings for this specific grouped pass are collected under
`production/session-logs/sys1-review-2026-09-14/<agent-key>.md`.
