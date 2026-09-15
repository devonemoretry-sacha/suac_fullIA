---
name: reference-design-docs-rules
description: Location and substance of the three design-doc rules added 2026-09-14 (reachability, personal thresholds, provenance) plus data-availability — check these before signing off on any voice-chain formula.
metadata:
  type: reference
---

`.claude/rules/design-docs.md` carries four rules added/clarified on
2026-09-14, all born from the Voice-Physics review cycle
([[project-voice-physics-grouped-revision]]):

1. **Reachability of thresholds** — any threshold applied to a value produced
   by another system (or by an earlier stage of the same pipeline) must state
   the value's *reachable domain* (after upstream gates/clamps/filters) and
   give a concrete witness input that fires the threshold. No witness = dead
   branch, delete it. Rationale doc:
   `design/gdd/reviews/voice-calibration-2026-09-11.md`.
2. **Personal thresholds** — voice thresholds are per-player, from
   calibration. A fixed pipeline constant may only catch a *physically broken
   measurement*, never judge an *unusual voice* — unusual voices get accepted
   (flagged as `LowRange` etc. if needed), never refused. This is a project
   principle, not just a doc-writing rule — it overrides local "this seems
   safer" instincts when tempted to add a rejection threshold.
3. **Provenance of measured values** — anything presented as *measured* must
   cite the code/model it was measured under and list every difference from
   the model the GDD now specifies. A cross-document citation that names a
   protocol which doesn't actually produce the cited value (e.g.
   `voice-calibration.md` attributing `HardFloor_dB`/`QualityBand_dB` to
   "Protocole A du système 1" when that protocol only measures
   `CrestMinDb`/`CrestMaxDb`) is a provenance violation, not a nitpick — it
   reads as BLOQUANT in review.
4. **Data availability** — any input a formula consumes must name where it is
   available at runtime (local client / host / every client) and cite the ADR
   line routing it there.

When reviewing any formula in the voice chain (systems 1, 6, 11), check all
four before anything else — most of this week's blocking findings across all
three GDDs trace back to one of these four rules, not to arithmetic errors in
the formulas themselves.
