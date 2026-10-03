# ADR 0028: One conversation offer for historical and current work

Status: Accepted for R01 on 2026-09-24. R02–R05 of the [dialogue plan](../archive/plans/2026-09-24-runtime-dialogue-redesign.md) remain separate implementation and acceptance work.

## Context

The old `historyOnly` decision was inferred from a bounded language grammar. It removed all tools, selected `StructuredAgentHistoricalAnswer`, and reduced the invocation to one step. The F04 correction and weather-refresh phrase was classified this way even though it requested current work. The same model step could therefore never propose the pinned weather tool. A separate historical answer schema exposed source turn, evidence ID, and ordinal to the model while the server already had one verified target. Correction tools likewise exposed raw prior-read identities.

## Decision implemented in R01

`LaravelAiAgentTurnModel` always builds the normal deployment-pinned tool offer. Historical recognition admits a bounded, verified source catalog for presentation; it cannot remove current tools. `AgentTurnLoop` remains the conversation owner, and the existing native SDK step projection closes tools only when its technical final answer phase requires it. Purpose admission and `CapabilityExecutionGateway` remain the dispatch authority. Missing or ambiguous old records create no source facts or tool inputs.

Native-schema turns use `StructuredAgentConversationAnswer`. Its optional `historical` object contains `include: true` and optional visible child field names. The server resolves the unique source turn, evidence ID, ordinal, deployment and scope from `AgentHistoricalEvidence`; a forged technical ID is rejected before rendering. Prompt-only turns receive the same compact instruction. The old tool-free `StructuredAgentHistoricalAnswer` class and its activating branch are removed. The existing `composeHistorical` renderer still validates server-bound identities and renders original values; this is a current safe source fallback, not an alternative model or tool owner.

For a correction of a completed read, the offer contains a short turn-bound handle and public description. The model chooses the handle and `replace` or `refresh`; `AgentCorrectionSelection` resolves it against the verified, scope-matched history. Raw source turn and evidence IDs no longer appear in `__prior_read` or the correction offer. The handle alone grants no argument, target, permission, or execution authority. Stale, foreign, invented and ambiguous selections fail before connector dispatch.

A published `search_query` source permits a public read string to be proposed as a bounded interpretation of the visitor's current topic. Publication rejects write, credential, enum, exact-target, alias and resolver bindings for that source. The binder requires a current-message topic anchor and still validates the declared schema. Canonical entities continue through published aliases or versioned resolvers; sensitive and write targets retain their exact source, confirmation and Gateway contracts.

`agent_tool_projection.v9` and Agent runtime/compiler ABI v11 identify the changed model wire contract. New artifacts require normal publication. No stored receipt or public host API shape changes in R01; already committed JSON/SSE replay remains canonical. The R05 migration and host acceptance are still pending.

## Relationship to prior decisions

This replaces only ADR 0021/0023/0025 statements requiring a tool-free, single-step historical invocation or model-visible raw historical identity. Their verified presentation, bounded source lookback, source-only fallback, immutable deployment, budget accounting, native review and canonical replay rules remain. ADR 0008, ADR 0009, ADR 0026 and ADR 0027 retain their authority, usage and canonical-target guarantees. The grammar may help locate displayed evidence and select presentation; it is no longer a capability router. No generic request lifecycle or second pending owner is introduced.

## Deferred contracts

R02 owns persisted missing-input questions, correction continuation and bounded reuse. R03 owns unified recovery and finish-reason treatment. R04 owns the final answer, source and coverage contract. R05 owns artifact migration and real dialogue acceptance. This ADR does not mark those contracts implemented and does not infer live-model quality from deterministic tests.

## Evidence and limits

The F04 fixture and model-offer regression establish tool availability despite the former historical classification. Historical selection tests cover forged and foreign identities, visible-field bounds, mixed current evidence, replay and malformed replies. Correction-tool tests cover forged handles, rejected proposals, refresh limits and revoked connector authority. `AgentStepRequestProjection` still supplies the same effective request to budget admission and dispatch. The model may still choose an unnecessary or missing read; R03/R04 and R05 acceptance measure those semantic outcomes.
