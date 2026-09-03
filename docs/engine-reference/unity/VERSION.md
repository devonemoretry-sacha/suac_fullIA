# Unity Engine — Version Reference

| Field | Value |
|-------|-------|
| **Engine Version** | Unity 6.3 LTS (`6000.3.18f1`) |
| **Release Date** | December 2025 (6.3 LTS); patch `.18f1` is a later 6.3 patch release |
| **Project Pinned** | 2026-09-03 |
| **Last Docs Verified** | 2026-09-03 |
| **LLM Knowledge Cutoff** | May 2026 |
| **Risk Level** | MEDIUM |
| **LTS Support Until** | December 2027 |

## Knowledge Gap Warning

Unity 6.3 LTS shipped in **December 2025**, which is *within* the model's May 2026
training cutoff — the base 6.3 feature set and API surface are known. The gap is
narrower than for a bleeding-edge version, but it is not zero:

- **Patch-level changes** within 6.3 (this project is on `6000.3.18f1`, a mid-2026
  patch) are past the cutoff and unverified.
- **Unity 6.4 / 6.5** exist and carry their own breaking-change lists. Do not
  suggest 6.4+ APIs — this project is pinned to 6.3 LTS.
- **Package versions** move independently of the editor. Always check
  `Unity/Shut_up_and_carry/Packages/manifest.json` for the actual installed
  version before citing a package API.

**Rule**: cross-reference this directory before suggesting Unity API calls, and
use WebSearch to verify any API you are not certain exists in 6.3.

## Post-Cutoff Version Timeline

| Version | Release | Risk Level | Key Theme |
|---------|---------|------------|-----------|
| 6.0 | Oct 2024 | MEDIUM | Unity 6 rebrand, GPU Resident Drawer, Entities 1.3, DOTS improvements |
| 6.1 | Apr 2025 | MEDIUM | Deferred+ rendering, foldable screen support, performance work |
| 6.2 | 2025 *(exact date unverified)* | MEDIUM | Developer workflow integration, Unity AI Beta |
| 6.3 LTS | Dec 2025 | MEDIUM | **Pinned version.** Box2D v3 physics, Platform Toolkit, 3D-in-2D rendering, terrain/shader improvements |
| 6.4 | 2026 | DO NOT USE | Past the project pin — URP Compatibility Mode fully unsupported here |
| 6.5 | 2026 | DO NOT USE | Past the project pin |

## Project Package Baseline

Taken from `Unity/Shut_up_and_carry/Packages/manifest.json` on 2026-09-03:

| Package | Version |
|---------|---------|
| `com.unity.render-pipelines.universal` | 17.3.0 |
| `com.unity.inputsystem` | 1.19.0 |
| `com.unity.test-framework` | 1.6.0 |
| `com.unity.ai.navigation` | 2.0.13 |
| `com.unity.ugui` | 2.0.0 |
| `com.unity.timeline` | 1.8.12 |
| `com.unity.multiplayer.center` | 1.0.1 |

No networking transport package is installed yet. FishNet is under consideration
(see `Obsedian_SUAC_FIA/04 - Tech/TECH - FishNet.md`) but is not a dependency —
do not write code against it until an ADR accepts it and it lands in the manifest.

## Verified 6.3 Upgrade Changes

Verified against the official upgrade guide on 2026-09-03. Full detail in
`breaking-changes.md` and `deprecated-apis.md`.

- `[SerializeField]` is now **fields-only** — applying it to a property, method, or
  type is a **compile-time error**. Use `[field: SerializeField]` for auto-properties.
- **URP Compatibility Mode** code is stripped by default. `URP_COMPATIBILITY_MODE`
  is a conversion-only escape hatch and is unsupported in 6.4+.
- **Netcode for GameObjects 1.x is deprecated** (replaced by 2.x). Overriding
  `NetworkTransform.Update` is no longer supported.
- `UnityWebRequest` now uses **HTTP/2 by default**.
- **UI Toolkit USS parser is stricter** — previously-ignored invalid selectors now error.
- `AccessibilityNode.selected` → renamed `AccessibilityNode.invoked`.
- Experimental `AdditionalBakedProbes` **removed**; `CustomBake` obsolete — use
  `LightTransport.IProbeIntegrator`.

## Verified Sources

- Unity 6.3 upgrade guide: https://docs.unity3d.com/6000.3/Documentation/Manual/UpgradeGuideUnity63.html
- New in Unity 6.3: https://docs.unity3d.com/6000.3/Documentation/Manual/WhatsNewUnity63.html
- Unity 6.3 LTS announcement: https://unity.com/blog/unity-6-3-lts-is-now-available
- Unity 6 releases & support: https://unity.com/releases/unity-6/support
- Planned breaking changes in Unity 6.3: https://discussions.unity.com/t/planned-breaking-changes-in-unity-6-3/1646418
- 6.3 script reference: https://docs.unity3d.com/6000.3/Documentation/ScriptReference/index.html
