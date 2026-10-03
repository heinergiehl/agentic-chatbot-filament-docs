# ADR 0029: Native text answers in one productive dialogue loop

Status: Accepted for N01–N03 on 2026-09-24. N04–N05 remain separate implementation and acceptance work.

RC-01 supersedes the N03 local read-recovery and successful-read-to-answer-only
rules below. See [ADR 0031](0031-typed-native-read-recovery.md) for the current
candidate contract; the remaining N03 limits and safety rules still apply.
RC-02's candidate [ADR 0032](0032-source-bound-read-drafts.md) defines durable
field patches, committed question delivery and bounded references for a pure
text question without a draft.

## Context

The deployed Agent already uses one Laravel AI native tool loop, but the answer path forced evidence-bearing turns into a Claims/paragraphs JSON document. A pre-stop `AgentNativeAnswerReview` and a terminal `AgentAnswerClaimVerifier` could veto or rewrite ordinary answers. Historical evidence was offered only when a language grammar recognized a reference, and the finalizer made a second decision about visitor intent and completeness. The resulting behavior blocked simple questions, mixed requests and valid natural continuations.

## Decision

`AgentTurnLoop` remains the sole productive conversation owner. Its `LaravelAiAgentTurnModel` constructs one `DeployedAgent` regardless of tools, provider schema support or historical content. The SDK receives native text and deployment-pinned tools. Native tool results return to that same invocation; the model answers or asks in ordinary text. The finalizer bounds and safely projects that text and attaches only source cards from delivered, execution-matched evidence. It does not parse Claims JSON, run a model review, infer omitted concerns or dispatch tools. A failed provider completion never promotes its unfinished draft to a completed answer. Technical recovery may continue within the same native invocation and existing usage budget.

Verified historical presentation receipts are offered independently of language markers. They remain bounded, scoped, untrusted context. The separate correction handle continues to require server resolution and current input admission. Neither historical text nor a source card grants execution authority or proves that every model sentence is true. Operational effects and status remain in the Gateway, Graph and ledger; model text never updates them.

The response language policy is expressed as an instruction to the model, without a general locale parser for natural prose. Application policy may still impose a narrowly published, risk-specific output contract in a later ADR; no such general policy is active in N01. Real dialogue quality remains to be tested in N05.

## Supersession and preserved boundaries

This ADR supersedes the general Claims/paragraphs format, universal semantic answer review, historical language selection and ordinary-question approval obligations in ADR 0020 sections “Answers and cutover”, ADR 0021, ADR 0022 where it prescribes ordinary response wording, ADR 0023, ADR 0025 sections S3/S4 on general prose review, and ADR 0028's historical-answer schema. Their verified source, scope, revision, confirmation and state-integrity requirements remain. ADR 0008/0009, usage settlement in ADR 0026 and canonical sensitive targets in ADR 0027 continue to govern execution.

N01 used runtime ABI v12 and native request projection v10. Old immutable deployments are not rewritten or given a legacy execution fallback; N04 owns versioned authoring migration, republishing and candidate verification. Existing committed answers remain readable. Their historical coverage metadata remains a read-only receipt, not a requirement for new answers.

## N02 input and question decision

N02 uses runtime ABI v13. A published `search_query` on a public read accepts a bounded UTF-8 query proposed from the conversation without requiring shared words with the latest visitor message. Publication still excludes writes, credential fields, exact targets, enum targets and resolver-bound inputs. Ordinary text questions can be asked by the native model without a tool call or a new pending record. A partial Connector proposal may still create a typed pending record to retain admitted conditions, exact revision and source provenance for later execution. The former general Connector context assessment is removed; deterministic source, schema, scope, confirmation, revision, read dependency and Gateway checks remain the execution boundary. Rejected or missing arguments return tool observations and do not prove a source lookup. A historical assistant statement remains context, never input or target authority.

The context review's old usage stage is retained solely for reading historical billing records. Previously published v12 deployments are incompatible with v13 and need N04 republishing before activation. Native projection remains v10 because the tool argument shape did not change. N02 does not claim that the model always chooses a complete context or a correct search query; N05 evaluates that quality.

## Follow-up boundaries

N03 uses runtime ABI v14. The native SDK loop retains its step ceiling, usage, deadline and provider continuation ownership. One invocation state grants at most two technical model continuations, including at most one answer-only continuation after a verified read. A `Continue` loop signal does not replace the provider's original finish reason in diagnostics. Parsed calls under `Length` or `Stop`, and a tool-call finish without a complete call, are nonexecuted proposals; their arguments and native function blocks are withheld from dispatch and a bounded continuation may correct them. Repeated plain read proposals with a new call ID return an existing local rejection or completed read observation; operational metadata is revalidated. The old per-tool read-repair counter is removed, so an invalid item cannot block an independent valid read.

When no model completion remains, technical presentation may show bounded raw data only from a delivered read matched to a successful execution receipt. It never reconstructs a write result or promotes unfinished model prose. Terminal AgentGraph recovery uses the same presentation with the original deployment, canonical commit and no model or graph redispatch. Unknown effects still require reconciliation. Old v13 deployments are immutable and require N04 republishing before activation; there is no compatibility executor or database migration in N03.

## N04 candidate publication and quality boundary

N04 uses runtime ABI v15 and `agent_contract.v2`. Agent 170 has a normally
published candidate with pinned holiday and Pokémon operation revisions; the
active deployment remains unchanged. Its short prompt, model and budgets are
recorded in the [N04 handoff](../archive/plans/runtime-dialogue-N04-handoff.md).
The holiday operation binds its year through the published
`attested_calendar_year` read policy. This narrow server value cannot be
proposed by the model or used for a write.

Canonical source cards from admitted delivered reads are retained with the
assistant message, including URL-less and uncited cards. An inline marker
selects a cited card but is not a prerequisite for showing retrieved evidence.
The shared quality evaluator checks durable executions and canonical messages;
it no longer treats a general answer coverage receipt or `agent_decision`
label as proof of task fulfillment. Independent offline graders inspect the
executed read set, action status, sources and user answer separately.

N05 still measures real conversations and the widget. The N04 candidate is
unreleased and unactivated; no live-model quality or host acceptance is claimed.
