# Technical Preferences

<!-- Populated by /setup-engine. Updated as the user makes decisions throughout development. -->
<!-- All agents reference this file for project-specific standards and conventions. -->

## Engine & Language

- **Engine**: Unity 6.3 (6000.3.18f1)
- **Language**: C#
- **Rendering**: Universal Render Pipeline (URP 17.3.0)
- **Physics**: Unity built-in 3D physics (PhysX) — `com.unity.modules.physics`

## Input & Platform

<!-- Written by /setup-engine. Read by /ux-design, /ux-review, /test-setup, /team-ui, and /dev-story -->
<!-- to scope interaction specs, test helpers, and implementation to the correct input methods. -->

- **Target Platforms**: PC (Steam)
- **Input Methods**: Keyboard/Mouse, Microphone (core gameplay input), Gamepad (optional)
- **Primary Input**: Keyboard/Mouse
- **Gamepad Support**: Partial — supported, but no mechanic may require it
- **Touch Support**: None
- **Platform Notes**: The microphone is a first-class gameplay input (Voice-Physics), not only voice chat — mic permission, device selection, and per-player calibration are critical-path UX, not settings-menu extras. Input handled via the Input System package (`InputSystem_Actions.inputactions`), not legacy Input Manager. All UI must remain fully operable with keyboard/mouse alone.

## Naming Conventions

- **Classes**: PascalCase (e.g., `LoudnessMeter`)
- **Variables**: Public fields/properties PascalCase (`MoveSpeed`); private fields `_camelCase` (`_currentHealth`)
- **Signals/Events**: PascalCase events, `On` prefix for handlers (e.g., `VoiceFrameReady`, `OnVoiceFrameReady`)
- **Methods**: PascalCase (e.g., `TakeDamage()`)
- **Files**: PascalCase matching the class (e.g., `PitchDetector.cs`)
- **Scenes/Prefabs**: PascalCase (e.g., `ContractApartment.unity`, `PlayerRig.prefab`)
- **Constants**: PascalCase or UPPER_SNAKE_CASE (be consistent within an assembly)
- **Assemblies**: `Dot.Namespaced` runtime asmdefs (e.g., `Voice.Core`), tests as `<Assembly>.Tests.EditMode` / `.PlayMode`

## Performance Budgets

- **Target Framerate**: 60 fps (PC / Steam)
- **Frame Budget**: 16.6 ms total — voice analysis (DSP) must stay off the main thread and under 1 ms/frame of main-thread cost
- **Draw Calls**: < 1500 per frame (URP, SRP Batcher enabled)
- **Memory Ceiling**: 4 GB working set

<!-- Defaults set during /setup-engine. Revisit once minimum-spec hardware is chosen; -->
<!-- an 8-player networked physics game may need these tightened. -->

## Testing

- **Framework**: Unity Test Framework (NUnit) — `com.unity.test-framework` 1.6.0. EditMode for pure logic and formulas, PlayMode for integration.
- **Minimum Coverage**: 80% on pure-logic assemblies (e.g. `Voice.Core`); no coverage target enforced on MonoBehaviour/scene glue
- **Required Tests**: Balance formulas, gameplay systems, networking (if applicable), voice analysis DSP (loudness, pitch, envelope)

## Forbidden Patterns

<!-- Add patterns that should never appear in this project's codebase -->
- [None configured yet — add as architectural decisions are made]

## Allowed Libraries / Addons

<!-- Add approved third-party dependencies here -->
- [None configured yet — add as dependencies are approved]

<!-- Note: FishNet is under consideration for networking (see Obsedian_SUAC_FIA/04 - Tech/TECH - FishNet.md) -->
<!-- but is NOT in Packages/manifest.json yet. Add it here when integration actually begins, via an ADR. -->

## Architecture Decisions Log

<!-- Quick reference linking to full ADRs in docs/architecture/ -->
- [No ADRs yet — use /architecture-decision to create one]

## Engine Specialists

<!-- Written by /setup-engine when engine is configured. -->
<!-- Read by /code-review, /architecture-decision, /architecture-review, and team skills -->
<!-- to know which specialist to spawn for engine-specific validation. -->

- **Primary**: unity-specialist
- **Language/Code Specialist**: unity-specialist (C# review — primary covers it)
- **Shader Specialist**: unity-shader-specialist (Shader Graph, HLSL, URP materials)
- **UI Specialist**: unity-ui-specialist (UI Toolkit UXML/USS, UGUI Canvas, runtime UI)
- **Additional Specialists**: unity-dots-specialist (ECS, Jobs system, Burst compiler), unity-addressables-specialist (asset loading, memory management, content catalogs)
- **Routing Notes**: Invoke primary for architecture and general C# code review. Invoke DOTS specialist for any ECS/Jobs/Burst code — relevant if voice DSP or physics is moved to Jobs/Burst. Invoke shader specialist for rendering and visual effects. Invoke UI specialist for all interface implementation. Invoke Addressables specialist for asset management systems.

### File Extension Routing

<!-- Skills use this table to select the right specialist per file type. -->
<!-- If a row says [TO BE CONFIGURED], fall back to Primary for that file type. -->

| File Extension / Type | Specialist to Spawn |
|-----------------------|---------------------|
| Game code (.cs files) | unity-specialist |
| Shader / material files (.shader, .shadergraph, .mat) | unity-shader-specialist |
| UI / screen files (.uxml, .uss, Canvas prefabs) | unity-ui-specialist |
| Scene / prefab / level files (.unity, .prefab) | unity-specialist |
| Native extension / plugin files (.dll, native plugins) | unity-specialist |
| General architecture review | unity-specialist |
