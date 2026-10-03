# ADR 0032: Source-bound direct-read drafts and committed questions

Status: Candidate in RC-02 on 2026-09-26. Requires later user and release acceptance.

## Context

The native model may ask a question, answer a side question and later receive a short value. A Connector task already retained some inputs, while a Data Resource still depended on an adjacent successful query. That adjacency lost the original field source after a side question. A proposed question also did not prove that the assistant actually displayed it.

## Decision

`AgentConversationState` is the single bounded owner of direct-read drafts for Connectors and Data Resources. The encrypted `chat_turn_connector_context.v4` snapshot carries a stable operation ID, revision, pinned capability, original visitor source and each retained field source. A patch names fields to set and fields to unset. Omission retains a field; a nullable value remains a value. The adapter rebinds retained sources and checks the complete proposal at the Gateway before dispatch. A stale revision or foreign scope fails closed. An explicitly proposed correction with a quoted source that fails field policy marks the old field unresolved without dispatching its old value.

The canonical assistant commit records question delivery only when the saved assistant content includes the exact proposed question. Readers recheck its message ID and content hash. No model proposal alone is an asked question. A pure text question without a draft can offer up to four recent, committed question turns from a bounded scan. A Data Resource continuation names one such turn together with an exact original visitor message and quote; the server rechecks deployment, conversation, scope, receipt, source age and committed content before binding. Multiple plausible questions remain a model selection problem; a tool type does not silently pick one.

Data Resource continuation copies a short offered handle. The server resolves its selected verified draft and revision, then uses its field sources instead of the immediately preceding successful query. Negative read outcomes remain tied to the query arguments; an admitted new correction can produce a new read. A local rejection and its repair carry a stable operation ID, so another rejected call to the same tool cannot consume its correction.

## Compatibility and verification

New publications use Agent runtime ABI v18 and compiler ABI v13. Older immutable deployments are not rewritten or run through a fallback executor. The v4 context reader accepts a valid v3 historical snapshot for read-only continuation checks, while new commits write v4. This decision supersedes ADR 0020's adjacent-successful-query rule and ADR 0029 N02's unbound plain-question continuation where a prior field source is reused. Their Gateway, source, authority and one-loop boundaries remain.

Deterministic tests cover HTTP and Data Resource continuation, side questions, committed question proof, same-tool operation selection, revision and scope mismatch, null versus unset, negative/corrected input and no-dispatch rejection. Provider language quality and host acceptance remain separate.
