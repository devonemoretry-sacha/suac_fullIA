---
name: project-voice-physics-grouped-revision
description: Voice-Physics core (systems 1 voice-analysis, 6 voice-calibration, 11 voice-object-effect) is under a single grouped revision pass as of 2026-09-14, not three independent ones.
metadata:
  type: project
---

The user (Sacha, devonemoretry-sacha) ordered on 2026-09-14 that systems 1
(`design/gdd/voice-analysis.md`), 6 (`design/gdd/voice-calibration.md`) and 11
(`design/gdd/voice-object-effect.md`) be revised **together, once**, rather than
patching each GDD independently, because fixes in one document's formulas
routinely change reachable domains/witnesses in the other two (e.g. `Margin_dB`
shifting `Loudness`'s zero point changes the effective `Δ` that system 6's
`HardFloor_dB`/`RestMax` validations are calibrated against; `γ` is reused
verbatim by system 11's `L_repos` formula).

**Why**: reviewing system 6 alone would have required re-reviewing it a second
time once systems 1 and 11 landed their own fixes. Order decided by the user:
1. Archive individual reviews for 6 and 11 (both landed MAJOR REVISION NEEDED).
2. Full-depth review of 11, then full-depth **re-review** of 1 (this is that
   re-review, dated 2026-09-14).
3. One single revision pass across all three documents.
4. Extended prototype (mini-calibration + system-11 model + three simulated
   voices), then multi-human playtest, **then** any further downstream GDDs.

**How to apply**: when asked to review or revise any one of systems 1/6/11,
check whether the other two have open findings that touch the same formula
(especially anything involving `Δ = Scream_dB − Floor_dB`, `Margin_dB`, `γ`,
or `Loudness`/`L_repos`) before proposing a fix — a fix that looks local to one
document is very likely to be one of the shared-dependency defects this
project keeps finding. Review outputs are written to
`production/session-logs/sys1-review-<date>/<agent-key>.md` (one file per
specialist), separate from the canonical review file in
`design/gdd/reviews/<system>-<date>.md`. See also
[[feedback-adversarial-review-style]] and
[[reference-design-docs-rules]].
