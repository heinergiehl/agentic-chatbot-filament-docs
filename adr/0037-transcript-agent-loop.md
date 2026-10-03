# ADR 0037 Transcript-based Agent loop

Status: Accepted by the user on 2026-10-02 after Phase 0 evidence. The write trust boundary of decision 6 is implemented by [ADR 0038](0038-direct-agent-writes-with-visitor-confirmation.md): published writes are flat tools whose calls only propose; the visitor confirms. Playbooks became flat tools in the same style with [ADR 0040](0040-playbooks-as-flat-tools.md): their arguments are the Playbook's input schema, a waiting run keeps one tool, `cancel_playbook` is always offered and approvals use the confirmation card. All deployments are test data; breaking changes are allowed and affected host records are recreated. Cut over on the `runtime-v2` branch: `AgentRunner` is bound to `ChatTurnRequestExecutor` and `AGENTS.md` names it as the turn owner. The superseded runtime classes are removed in follow-up commits.

## Context

Real dialogues fail although 2,176 deterministic tests pass. Two documented host dialogues on 2026-10-01 ([review](../archive/audits/2026-10-01-runtime-dialogue-review.md), [brief](../archive/reviews/2026-10-01-chatgpt-runtime-review-brief.md)) show turns with one model call, zero tool proposals and zero Gateway executions, a repeated greeting after a numbered follow-up, and claimed background work that never existed.

Code reading on `15dd1747` found causes in the runtime contract, not only in the model:

- Tool calls are wrapped in an envelope (`input`, `request.ref/action/repair/remove/unresolved`, `conditions`, `evidence`) with typed rejections.
- Public read inputs must be literally present in the latest visitor message (`exact_source_required`, `typo_tolerance: none`), so the model may not translate "Bisaflor" to "venusaur".
- History replay is limited to 12 visible text messages; earlier tool calls and results are replaced by server drafts, handles and evidence blocks.
- On non-success outcomes the server replaces model prose with catalog text and buffers streaming.

Each failed dialogue since August added another contract layer (36 ADRs, 976 commits). The dialogue core in `src/Services/AgentRuntime` has about 23,500 lines.

## Decision

Replace the productive dialogue core with one transcript-based Agent loop on `laravel/ai`:

1. **One loop.** An `AgentRunner` behind `ChatTurnRequestExecutor` runs the SDK loop until the model answers without a tool call, bounded by steps, time and tokens. No finish-reason rewriting or recovery credits.
2. **Flat tools.** A tool is name, description and the operation's own input schema. Server-bound parameters (tenant, visitor identity, credentials, fixed parameters) are absent from the schema and set by the server.
3. **Transcript as state.** Assistant messages with their tool calls and all tool results are persisted and replayed natively. A clarifying question is an ordinary assistant message.
4. **Errors are tool results.** Validation and API errors return to the model as short, actionable messages; the model corrects itself or asks.
5. **The model writes the answer.** The server no longer replaces model prose; it keeps only technical failure messages.
6. **Trust boundary by tool class.** Reads: the model supplies business arguments freely; the server enforces schema, scope, credentials, host policy and limits. Writes: the model proposes a complete payload; the visitor confirms it; idempotency, side-effect ledger and unknown-outcome reconciliation stay. Identity-bound data: identity fields come only from the authenticated context.

### What stays

`CapabilityExecutionGateway` with authorization, credentials, host policy, idempotency, side-effect ledger and unknown-outcome handling; connector infrastructure; MCP, knowledge and data-resource services with query validation; `ChatTurnLedger` and duplicate-delivery reconciliation; usage accounting, channels, widget SDK, handoff and privacy; Playbooks and AgentGraph, offered to the loop as a tool through a thin adapter.

The rule "semantic models propose meaning; deterministic contracts and policy authorize" stays. It applies at the Gateway, not as provenance proof for public read arguments.

### Deployments

An Agent deployment remains an immutable, hash-verified snapshot of prompt, model and tool list with schemas. It is no longer coupled to a runtime ABI, so runtime updates do not disable published Agents.

## Supersession

This ADR supersedes the dialogue-contract decisions of ADRs 0010 to 0012, 0014 to 0018 and 0020 to 0036, and the `AgentTurnLoop` ownership rule in `AGENTS.md`, effective with the cutover commit. ADR 0013 (reviewed writes) and ADR 0019 (write result evidence) are reviewed separately against the new write path. Classes that Playbooks, connector publishing, MCP or `ChatTurnLedger` still use stay until those owners change (see the caller inventory in `evals/runtime-v2/README.md`).

## Cutover

There is no per-Agent switch. The `AgentRunner` replaces `AgentTurnLoop` at the `ChatTurnRequestExecutor` binding on the `runtime-v2` branch; the branch isolates the work until the host dialogue passes. No compatibility path for old deployments or conversations is kept.

## Phase 0 evidence

The opt-in prototype in `evals/runtime-v2/` replays the failed host dialogues against deterministic tool backends. `gemini-3.5-flash-lite` passed 30 of 30 dialogues, including the original four-concern dialogue in 10 of 10 runs; `qwen3.5:4b` passed 5 of 30. Details are in `evals/runtime-v2/README.md`. These are measurements, not release evidence. The acceptance model is `gemini-3.5-flash-lite`; `qwen3.5:4b` is measured for comparison.

## Consequences

- Public read arguments may be wrong when the model infers them. Results name the values used, and the visitor corrects them in the next turn. Identity fields cannot be set by the model.
- Prompt injection from tool results cannot trigger a write without visible visitor confirmation.
- Dialogue quality becomes a measured rate per model, not a deterministic guarantee. Weak models remain weak; the runtime no longer tries to compensate with protocol.
- Tests that assert removed internal contracts are deleted with their classes and replaced by behavior tests and eval scenarios.
