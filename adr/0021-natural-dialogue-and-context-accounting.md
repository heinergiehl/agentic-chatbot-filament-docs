# ADR 0021: Natural dialogue and separate context accounting

Status: accepted for the Agent runtime/compiler ABI v6 cutover.

## Decision

Keep one `AgentTurnLoop`, the native Laravel AI tool loop, the capability Gateway
and AgentGraph's transition authority. Models propose conversational meaning and
wording; contracts authorize execution. This change does not specialize runtime
behavior for a demonstration API or a cheap test model.

The structured answer can supply `questions` bound to an exact pending ID and
revision, `capability_description` claims grounded in the closed manifest, and a
`failure_summary` for eligible unsuccessful reads. The existing batched semantic
review checks these alongside factual claims. Questions cannot supply inputs,
consume pending work, create choices, confirm writes or change execution status.
Stale, foreign, duplicate and consumed references do not render. Graph controls
and unknown external outcomes retain their existing canonical presentation.

Remove the pre-model capability-overview shortcut and clipped request footer.
The normal answer step follows the published tone, language and length settings.
Exact source and pending-field fallbacks remain failure paths, not the preferred
conversation style. No per-field language-model call or extra formatting loop is
introduced. Free-form prose remains subject to the same source and scope review.

Remove the digit-matching prose heuristic. It rejected localized dates while
accepting contradictions expressed in words, so it was not a truth guarantee.
Evidence IDs, published field pointers, entity/time context and deterministic
arithmetic still bind exactly. Semantic review evaluates natural wording,
including dates and numbers; rejected wording falls back to admitted source
facts. This is fallible model assessment, not mathematical proof of prose truth.

Rejected Connector source/shape proposals and malformed Data Resource proposals
are local `not_started` outcomes. They do not fabricate a failed external read
or a new visitor question. The existing bounded native correction can select
only rejected tools, including a rejected subset beside successful results.
Admission and Gateway checks still run on every corrected proposal. Connector
proposal and accepted-call bounds are separate; successful independent calls
are never replayed merely to repair another proposal.

## Context and SDK ownership

Physical model-window admission uses the existing tokenizer/provider-profile
estimate, plus framing, attachments and reserved output. Financial reservation
and published input quotas retain their conservative UTF-8 byte upper bound.
This prevents a conservative billing estimate from falsely exhausting a model
window. Profile estimates are still estimates; an unknown tokenizer retains the
conservative fallback. Provider context rejection is still possible.

The existing preflight history reduction drops whole old turns and preserves
required native tool-history pairs. It does not summarize authoritative state.
AgentGraph checkpoints, confirmation payloads, operation receipts, unknown
outcomes and immutable deployment identities cannot be reconstructed from a
lossy conversational summary.

Installed Laravel AI v0.11.2 provides native tool calls, structured answers,
repair and `ToolSearch`; the latter currently requires a supporting OpenAI or
Anthropic provider. Its OpenAI implementation requires stored tool-search state.
`RememberConversation` stores conversation history; it is not an automatic
budget-aware compactor. AgentGraph v0.18.1 supplies durable state and optional
memory/retrieval, not a universal prompt compactor.

Large-manifest progressive tool loading is **not implemented by this slice**.
Current calls still offer the closed pinned catalogue. A follow-up must first
adapt native SDK tool search where supported and measure its schema budget,
authorization filtering and provider-state/privacy requirements. Any portable
alternative must select only pinned tools and share the existing loop; it must
not create another executor or rely on lexical rules for visitor intent.
Bounded tool outputs and whole-turn pruning help, but do not prove unlimited
catalogue or conversation scalability.

Comparable responsibility separation appears in
[Codex history management](https://github.com/openai/codex/blob/main/codex-rs/core/src/context_manager/history.rs)
and [OpenCode compaction](https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/session/compaction.ts):
model-visible history can be bounded or compacted without making the summary
the authority for effects. These implementations are references, not claims
that this plugin has reached feature parity.

Codex's [tool orchestrator](https://github.com/openai/codex/blob/main/codex-rs/core/src/tools/orchestrator.rs)
separately determines approval requirements, binds approval to an action/call,
executes under policy and handles classified failures. The transferable design
is that separation of responsibilities, not an absence of deterministic rules.
This plugin's existing free-text approval grammar remains a known limitation:
an offered label is not necessarily accepted as conversational approval. A
follow-up should consolidate consent on the existing payload-bound controls
instead of growing language-specific acceptance regexes. That policy change is
not part of the dialogue wording cutover here.

## Cutover and evidence

Publish, test and activate a fresh compatible Agent candidate. Never rewrite an
old deployment or convert its evidence to a newer ABI. Incompatible queued
admission has its own `agent_deployment_incompatible` error (503), not an access
failure (403). The widget shows a domain error only for `origin_not_allowed`.

Deterministic tests cover binding, safe fallback, local argument correction,
queue failure identity and context/cost separation. Live synthetic model tests
measure actual answer quality separately. A weak model failing to use tools or
emit the answer schema is not authorization to add model-specific routing or
to weaken payload, provenance, confirmation or idempotency contracts.

## R2 failure presentation refinement, 2026-09-20

A reviewed pending question cannot suppress a confirmed result-identity failure.
The answer retains the safe failure notice beside that question; rejected source
values remain unavailable. A partial whole-message review with verified omitted
spans adds a bounded generic incomplete-answer notice, without echoing visitor
text or creating an open-work inventory. This is a presentation-only extension
of the existing coverage receipt, not a completion controller. It performs no
additional inference or execution. Canonical JSON/SSE replay keeps the same text.

The response-language contract is unchanged: a valid permitted declaration in
the current bounded answer envelope selects the fallback language even when
completion fails. An absent, malformed or excluded declaration uses the
published default (or first permitted language). Visitor-language inference for
input admission is not response-language authority. No historical language state
is introduced by this repair.

## R2 public result projection and recent diagnostics, 2026-09-20

Current curated direct reads offer stable short public result references.
The normal generated answer uses `paragraphs: [{text, result}]`, plus language
and optional exact pending-ID/revision questions. Each paragraph selects one
unit from one evidence invocation. The existing evidence owner expands its
public fields, units, entity/time context and completeness into the existing
claim review and canonical presentation proof. Split records offer exact fields
for every part, including the short final part. References bind evidence identity
and canonical payload/presentation, not arrival order. Invented, stale and
nonpublic references supply no support. Missing review retains exact source
fallback; changed wording cannot reuse a prior review.

The old normal-case instruction to author a claim kind, evidence ID and JSON
pointer per curated record is removed. The shared claim contract remains for
Knowledge, interpretation, manifest descriptions, exact arithmetic and results
without curated units. This is one parser/evidence/review/runtime path, not a
second formatter or a legacy generation adapter. Persisted outcomes and their
readers are unchanged. The native provider's existing final formatting step is
retained. This internal answer projection does not change immutable capability
or deployment contract semantics and does not require an ABI bump.

A separate bounded context projection reads at most three individual past read
operations from up to twelve preceding turns within thirty minutes. It requires
the published session-memory setting, exact conversation/tenant/scope/deployment
bindings and a matching canonical assistant commit. At most 4800 JSON bytes and
6000 total prompt bytes contain only statuses, failure codes, public tool names
and admitted public scalar inputs. Sensitive, undeclared, write-only and duplicate
secret values are excluded; result payloads and pending identities are absent.
Oversized or unusable reads consume the three-operation allowance. These are
past diagnoses for the already configured model, not current facts or execution
or input authority. Ordinary zero-invocation conversation still adds no reviewer.
Free prose remains model-generated: diagnostics improve grounding but do not
provide a deterministic guarantee against invented capability claims.
