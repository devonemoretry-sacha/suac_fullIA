# Unity 6.3 LTS — Breaking Changes

**Last verified:** 2026-02-13

This document tracks breaking API changes and behavioral differences between Unity 2022 LTS
(likely in model training) and Unity 6.3 LTS (current version). Organized by risk level.

## HIGH RISK — Will Break Existing Code

### Entities/DOTS API Complete Overhaul
**Versions:** Entities 1.0+ (Unity 6.0+)

```csharp
// ❌ OLD (pre-Unity 6, GameObjectEntity pattern)
public class HealthComponent : ComponentData {
    public float Value;
}

// ✅ NEW (Unity 6+, IComponentData)
public struct HealthComponent : IComponentData {
    public float Value;
}

// ❌ OLD: ComponentSystem
public class DamageSystem : ComponentSystem { }

// ✅ NEW: ISystem (unmanaged, Burst-compatible)
public partial struct DamageSystem : ISystem {
    public void OnCreate(ref SystemState state) { }
    public void OnUpdate(ref SystemState state) { }
}
```

**Migration:** Follow Unity's ECS migration guide. Major architectural changes required.

---

### Input System — Legacy Input Deprecated
**Versions:** Unity 6.0+

```csharp
// ❌ OLD: Input class (deprecated)
if (Input.GetKeyDown(KeyCode.Space)) { }

// ✅ NEW: Input System package
using UnityEngine.InputSystem;
if (Keyboard.current.spaceKey.wasPressedThisFrame) { }
```

**Migration:** Install Input System package, replace all `Input.*` calls with new API.

---

### URP/HDRP Renderer Feature API Changes
**Versions:** Unity 6.0+

```csharp
// ❌ OLD: ScriptableRenderPass.Execute signature
public override void Execute(ScriptableRenderContext context, ref RenderingData data)

// ✅ NEW: Uses RenderGraph API
public override void RecordRenderGraph(RenderGraph renderGraph, ContextContainer frameData)
```

**Migration:** Update custom render passes to use RenderGraph API.

---

## MEDIUM RISK — Behavioral Changes

### Addressables — Asset Loading Returns
**Versions:** Unity 6.2+

Asset loading failures now throw exceptions by default instead of returning null.
Add proper exception handling or use `TryLoad` variants.

```csharp
// ❌ OLD: Silent null on failure
var handle = Addressables.LoadAssetAsync<Sprite>("key");
var sprite = handle.Result; // null if failed

// ✅ NEW: Throws on failure, use try/catch or TryLoad
try {
    var handle = Addressables.LoadAssetAsync<Sprite>("key");
    var sprite = await handle.Task;
} catch (Exception e) {
    Debug.LogError($"Failed to load: {e}");
}
```

---

### Physics — Default Solver Iterations Changed
**Versions:** Unity 6.0+

Default solver iterations increased for better stability.
Check `Physics.defaultSolverIterations` if you rely on old behavior.

---

## LOW RISK — Deprecations (Still Functional)

### UGUI (Legacy UI)
**Status:** Deprecated but supported
**Replacement:** UI Toolkit

UGUI still works but UI Toolkit is recommended for new projects.

---

### Legacy Particle System
**Status:** Deprecated
**Replacement:** Visual Effect Graph (VFX Graph)

---

### Old Animation System
**Status:** Deprecated
**Replacement:** Animator Controller (Mecanim)

---

## Platform-Specific Breaking Changes

### WebGL
- **Unity 6.0+**: WebGPU is now the default (WebGL 2.0 fallback available)
- Update shaders for WebGPU compatibility

### Android
- **Unity 6.0+**: Minimum API level raised to 24 (Android 7.0)

### iOS
- **Unity 6.0+**: Minimum deployment target raised to iOS 13

---

## Migration Checklist

When upgrading from 2022 LTS to Unity 6.3 LTS:

- [ ] Audit all DOTS/ECS code (complete rewrite likely needed)
- [ ] Replace `Input` class with Input System package
- [ ] Update custom render passes to RenderGraph API
- [ ] Add exception handling to Addressables calls
- [ ] Test physics behavior (solver iterations changed)
- [ ] Consider migrating UGUI to UI Toolkit for new UI
- [ ] Update WebGL shaders for WebGPU
- [ ] Verify minimum platform versions (Android/iOS)

---

**Sources:**
- https://docs.unity3d.com/6000.0/Documentation/Manual/upgrade-guides.html
- https://docs.unity3d.com/Packages/com.unity.entities@1.3/manual/upgrade-guide.html

---

## Unity 6.2 → 6.3 Upgrade — Verified Changes

**Last verified:** 2026-09-03
**Source:** https://docs.unity3d.com/6000.3/Documentation/Manual/UpgradeGuideUnity63.html

These are the changes introduced by the 6.3 release itself, as opposed to the
2022 LTS → Unity 6 changes documented above. All were confirmed against the
official upgrade guide.

### HIGH RISK — Will Break Existing Code

#### `[SerializeField]` is fields-only

Applying `[SerializeField]` to a property, method, type, or any non-field element
is now a **compile-time error**, not a silent no-op.

```csharp
// ❌ Compile error in 6.3
[SerializeField] public float MoveSpeed { get; set; }

// ✅ Correct — backing-field syntax
[field: SerializeField] public float MoveSpeed { get; private set; }

// ✅ Also correct — plain field
[SerializeField] private float _moveSpeed;
```

#### URP Compatibility Mode stripped by default

Compatibility Mode code is stripped by default to cut compile time and build size.
The `URP_COMPATIBILITY_MODE` scripting define exists **only** as a temporary
conversion aid and is unsupported in 6.4+. Do not build new rendering work on it —
target RenderGraph.

#### Netcode for GameObjects 1.x deprecated

NGO 1.x is deprecated in favour of 2.x. Overriding `NetworkTransform.Update` is no
longer supported.

- Non-authority instances → override `NetworkTransform.OnUpdate` instead.
- Authority-side logic → implement `INetworkUpdateSystem`.

> **Relevant to this project:** networking is still an open decision (FishNet is the
> current candidate). If NGO is chosen instead, it must be 2.x — do not follow
> 1.x-era tutorials, which are the majority of what exists online.

#### Experimental lightmapping APIs removed

| Removed / obsolete | Replacement |
|---|---|
| `AdditionalBakedProbes` (removed) | `LightTransport.IProbeIntegrator` |
| `CustomBake` (obsolete) | `LightTransport.IProbeIntegrator` |

### MEDIUM RISK — Behavior Changes

#### `UnityWebRequest` defaults to HTTP/2

Improves load times, but changes wire behavior. Verify against any backend that
assumes HTTP/1.1.

#### UI Toolkit USS parser is stricter

Invalid selectors, syntax errors, and unsupported CSS that were previously ignored
now surface as errors. Tune via **Unsupported Selector Action** in the importer
Inspector.

#### Accessibility enum type changes

- `AccessibilityRole` changed from a flags enum to a standard enum — bitwise
  combination now warns; set exactly one role per node.
- `AccessibilityRole` and `AccessibilityState` underlying type changed `int` → `byte`.
  Precompiled assemblies must be recompiled.

#### Entities ID type changes

- `GlobalIllumination` namespace: `instanceID` (`int`) fields renamed to `entityID`
  (`EntityId`).
- `Scene.handle` changed `int` → `SceneHandle`.

Implicit conversions keep C# source compiling, but **precompiled `.dll`s must be
rebuilt**.

### LOW RISK — Editor / Tooling

- Android: round and legacy icons deprecated (use adaptive icons); minimum Android
  version raised to 7.1 (API 25); Gradle 8.13 → 9.1.0, AGP 8.10.0 → 9.0.0.
- Android: `PlayerSettings.Android.androidIsGame` obsolete — replaced by the new
  **App Category** Player setting (affects Android 16+ large-screen behavior).
- Search Index Manager relocated to **Preferences > Search > Indexing**.
- Adaptive Performance core is now a module — delete modified package code to avoid
  compile errors.
- `UPM_NPM_CACHE_PATH` deprecated → use `UPM_CACHE_ROOT`.
- Multiplay Hosting service shut down 2026-03-31.
- Magic Leap XR Plugin deprecated; x86-64 target limited to existing projects.

### New in 6.3 worth knowing

- **Box2D v3** integration: multi-threaded, better determinism, visual debugging in
  Editor and Runtime. (2D only — this project is 3D/PhysX, so informational.)
- **Platform Toolkit**: one API for accounts, achievements, save data, controller
  ownership, and certification across PlayStation, Xbox, Switch, Steam, Android, iOS.
  Relevant if Steam integration is built later.
- 3D Mesh Renderer / Skinned Mesh Renderer can render alongside 2D sprites under 2D URP.
- Terrain shader support without coding; 8 texture coordinates for advanced materials.

---

**Sources (6.3 section):**
- https://docs.unity3d.com/6000.3/Documentation/Manual/UpgradeGuideUnity63.html
- https://docs.unity3d.com/6000.3/Documentation/Manual/WhatsNewUnity63.html
- https://discussions.unity.com/t/planned-breaking-changes-in-unity-6-3/1646418
- https://unity.com/blog/unity-6-3-lts-is-now-available
