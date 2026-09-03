# Filament Agentic Chatbot 0.17.2

**Release status:** Approved<br>
**Release date:** 2026-09-03<br>
**Upgrade baseline:** 0.16.1<br>
**Previous-line security/critical EOL:** 2026-11-17

Version 0.17.2 is the approved patch release for the 0.17 Agent-first runtime cutover. It carries the complete 0.17.0 runtime, security, authoring, and migration changes plus the v0.17.1 fanout replay gate correction. It changes no database, configuration, or productive runtime behavior from the v0.17.1 source tag.

## Release certification correction

The protected v0.17.1 tag workflow twice completed every expected external read and produced the complete deterministic answer from immutable evidence. Gemini then returned an invalid final response-selection contract, including after the single tool-free repair attempt. The runtime correctly used its documented `safe_evidence_fallback`, but the release eval still required the literal `answer` decision.

The protected gate now accepts `safe_evidence_fallback` only when all of these conditions hold:

- the exact expected capabilities and item counts completed successfully;
- no unexpected capability executed productively;
- every replay is uniquely bound to successful evidence from the same turn;
- the evidence guard identifies one of the runtime's bounded response-contract or evidence-selection failures;
- exactly one tool-free answer repair was attempted and rejected for an equally bounded reason; and
- the rendered response is complete and is not a clarification.

Partial evidence, wrong capabilities, additional productive calls, repeated replay loops, unsafe provider failures, missing repair evidence, and incomplete rendered answers remain release failures. Deterministic coverage exercises both the accepted fallback and a rejected fallback outside the runtime contract.

The `v0.17.0` and `v0.17.1` source tags were not promoted to immutable GitHub releases because their protected workflows exposed stale release assertions. Use `v0.17.2` or the Composer constraint `^0.17`.

## 0.17 runtime and migration scope

All buyer-facing capabilities, breaking changes, security boundaries, compatibility requirements, and migration steps remain those documented for [v0.17.0](RELEASE_NOTES_v0.17.0.md). Read the complete [upgrade guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md) before installing from 0.16.1 or earlier.
