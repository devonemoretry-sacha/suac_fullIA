---
paths:
  - "design/gdd/**"
---

# Design Document Rules

- Every design document MUST contain these 8 sections: Overview, Player Fantasy, Detailed Rules, Formulas, Edge Cases, Dependencies, Tuning Knobs, Acceptance Criteria
- Formulas must include variable definitions, expected value ranges, and example calculations
- Edge cases must explicitly state what happens, not just "handle gracefully"
- Dependencies must be bidirectional — if system A depends on B, B's doc must mention A
- Tuning knobs must specify safe ranges and what gameplay aspect they affect
- Acceptance criteria must be testable — a QA tester must be able to verify pass/fail
- No hand-waving: "the system should feel good" is not a valid specification
- Balance values must link to their source formula or rationale
- Design documents MUST be written incrementally: create skeleton first, then fill
  each section one at a time with user approval between sections. Write each
  approved section to the file immediately to persist decisions and manage context
- **Reachability of thresholds** (added 2026-09-14, after the voice-calibration review):
  any threshold applied to a value produced by another system must first state that
  value's **reachable domain** — the range it can actually take once upstream gates,
  clamps and filters are applied — then give a **witness**: one concrete input that
  makes the threshold fire. **No witness = dead branch, delete it.** When reviewing a
  GDD that consumes another system's output, load the upstream formula and check
  reachability explicitly. Rationale and the four dead or harmful bounds that motivated
  this rule: `design/gdd/reviews/voice-calibration-2026-09-11.md`
- **Personal thresholds** (project principle, 2026-09-14): voice thresholds are
  per-player, derived from calibration. A fixed constant in the voice chain may only
  detect a **physically broken measurement**, never an **unusual voice** — unusual
  cases are accepted (flagged if needed), not refused
- **Provenance of measured values** (added 2026-09-14, after the voice-object-effect
  review): any value presented as *measured* must cite the code and model it was
  measured under (file, line, formula) and list every difference with the model the
  GDD now specifies. A number measured under another model is a provisional value
  with a history, not a measurement of the new one
- **Availability of consumed data** (added 2026-09-14): any input a formula consumes
  must name **where** it is available at runtime (local client, host, every client)
  and cite the ADR line that routes it there. No routing = the formula cannot run
- **Correct in place** (owner decision F5, 2026-09-15, after the voice-analysis re-review):
  a correction or an ADR status change **edits the normative section in place**, after
  searching the term across every GDD and ADR. The dated note goes to a *Revision History*
  section at the end of the document; a callout that contradicts the text above it is a
  defect. A value or a count is written **once**, with its owner; elsewhere, link to it.
  An upstream GDD publishes a **table of reachable domains** for its outputs, and
  downstream GDDs cite it instead of re-deriving. Any technical claim coming from a
  review — a number, an API, an engine behaviour — is **verified against the code or the
  documentation before being applied**: a review recommendation is a hypothesis, not a
  requirement
