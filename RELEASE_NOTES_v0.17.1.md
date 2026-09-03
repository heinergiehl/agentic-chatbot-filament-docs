# Filament Agentic Chatbot 0.17.1

**Release status:** Superseded source tag, not published<br>
**Release date:** 2026-09-03<br>
**Upgrade baseline:** 0.16.1<br>
**Previous-line security/critical EOL:** 2026-11-17

Version 0.17.1 was the patch candidate for the 0.17 Agent-first runtime cutover. It carries the complete 0.17.0 runtime, security, authoring, and migration changes while correcting one stale assertion in the protected live-provider release gate.

## Release certification correction

- A fanout-safe Connector may execute one external request for each distinct authorized input.
- If the model repeats those already successful inputs while composing its answer, the runtime reuses the immutable evidence and performs no additional external request.
- The release gate now permits at most one such replay per distinct successful item. Repeated replay loops, new inputs beyond the pinned fanout budget, and any duplicate external execution still fail closed.
- Deterministic regression coverage proves that two distinct successful items can both be replayed without another network call.

The `v0.17.0` source tag was not promoted to an immutable GitHub release because its protected tag workflow exposed the stale single-replay assertion. The protected `v0.17.1` workflow then exposed a second stale assertion around the runtime's bounded deterministic evidence fallback, so that tag was not promoted either. Use `v0.17.2` or the Composer constraint `^0.17`.

## 0.17 runtime and migration scope

All buyer-facing capabilities, breaking changes, security boundaries, compatibility requirements, and migration steps remain those documented for [v0.17.0](RELEASE_NOTES_v0.17.0.md). Read the complete [upgrade guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md) before installing from 0.16.1 or earlier.
