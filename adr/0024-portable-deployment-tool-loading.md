# ADR 0024: Portable deployment tool loading

Status: Accepted for the unreleased Agent ABI v8 cutover.
Date: 2026-09-20.

Runtime Recovery v3 K4B implements the superseding pending-schema decision in
[ADR 0035](0035-budgeted-context-and-read-references.md): Lazy mode keeps compact
draft references and exact manifest tool names in context without forced schema
loading. Only explicit selection exposes capability schemas on the next step.
Permanent controls remain available; Eager semantics and every existing bound
remain unchanged. The historical pending-exposure statements below describe ABI v8.

## Decision

The immutable Agent contract publishes `tool_loading.mode = portable_exact_names.v1`.
The existing AgentTurnLoop and native SDK loop remain the productive owners.
Loading only changes model exposure; every original capability still executes
through its existing handler, Gateway and Graph authority. There is no provider
ToolSearch dependency, intent router, extra inference, or global registry.

At most 100 pinned capabilities and Playbooks may publish. Offers whose complete
canonical schemas occupy at most 8,000 UTF-8 bytes stay eager. Larger offers use
a complete directory of exact original names and **full** published purposes,
bounded to 20,000 UTF-8 JSON bytes. Purposes are never truncated. A configuration
that cannot meet this bound must be edited and republished. Long common prefixes
do not hide the distinguishing tail of a purpose.

`load_agent_tools` atomically replaces the selected schemas for the next native
step. Its small result contains selection status and names, not schemas or source
results. Complete selected descriptions and schemas appear under the original
tool names in the next request. No loading result creates a conversation
invocation, evidence, successful execution, or coverage. Reloading cannot execute
or invalidate a completed sibling. All pins remain in discovery scope.

Pending Connector tools, cancellation, Playbook controls and capability overview
remain fully available. Pending schema revisions refresh once per native step.
One turn-local offer freezes names, descriptions and schemas for request
projection, admission and wire serialization. Static SDK handlers also check that
same offer before dispatch. Loading and guessing a hidden tool in one batch
therefore cannot execute it. Native call/result history and proofs remain intact.

## Independent bounds

- Selected schemas plus permanent controls occupy at most 16,000 canonical UTF-8
  JSON bytes. Each single capability must fit with controls at publication.
  Oversized selections return `catalogue_selection_too_large`; unknown names
  return `invalid_selection`; exhausted loading returns `catalogue_load_limit`.
- At most five successful loads are permitted per turn. Native steps and the
  shared 90-second deadline bound rejected proposals as well. Multiple loads in
  one batch still consume load credit and cannot change that batch's offer.
- Lazy turns have eleven native steps, including the last tool-free answer step:
  five loads, five separate reads and finalization can fit in step count. Eager
  turns retain their existing six-step ceiling. This is a ceiling, not a promise
  of five reads after repairs, additional control calls or time exhaustion.
- The five admitted Connector calls, 24 proposals and published per-turn
  `batch_mode` / `max_items` bounds remain independent. One native batch of six
  items consumes one admitted external call. No incidental parallelism is added.
- New tool work stops when ten seconds or less remain. This is a start threshold,
  not a guarantee of ten seconds remaining after a call. Already admitted external
  calls are not shortened by this reserve. The existing final answer/review can
  use the remaining shared deadline. Review remains one separate, tool-free
  request requiring its own financial admission; neither time nor money is
  guaranteed when earlier work exhausts the turn.

Publication builds the actual configuration projection without dispatch or usage
reservation. Lazy publication checks the complete directory/system plus the full
16,000-byte selected-schema window and 4,096 conservative input units of explicit
publication headroom for native framing and subsequent context. Eager publication
checks its actual wire definitions plus the same headroom. This is deliberately
a conservative provisioning bound, **not** a claim about actual provider tokens
or exact per-step framing. Physical context includes reserved output separately.
Actual per-step accounting still uses the frozen native request, provider framing,
physical estimator, unchanged conservative UTF-8 input quota and separate money
reservation. Publication failure rolls back candidate promotion and explains that
configuration overhead, rather than visitor message size, exceeds capacity.

Dynamic history, pending schema growth and large results still require normal
per-step admission. They can exhaust a valid deployment's runtime capacity.
Pending schema overflow stops admission without deleting state or silently
dropping selected schemas. Increasing the native step count never replenishes
the deadline, money, dispatch or retry budgets. No arbitrary-size capacity or
weak-model routing-quality guarantee follows from these bounds.

## Migration and verification

### Bounded eager authoring option (2026-09-21)

Local public-demo acceptance found that Gemini 2.5 Flash-Lite repeatedly treated
unloaded directory entries as unavailable and selected a visible Playbook instead
of a direct book read. Raising the input quota alone did not correct that behavior.
An explicit `agent.tool_loading_mode = eager_bounded.v1` authoring option therefore
publishes a second closed exposure contract for modest catalogues. It exposes all
original schemas immediately, rejects offers above 32,000 canonical UTF-8 bytes
instead of falling back to lazy loading, and enforces that bound again when pending
schemas change. Existing portable releases retain their exact original contract.

This is an additive exposure policy within the same Agent/SDK loop. No tool is
selected or executed automatically. Pin verification, full per-request admission,
the Gateway, six eager native steps, final tool closure, call cardinality and the
shared deadline remain unchanged. Publication checks the actual complete eager
wire projection and existing 4,096-unit headroom against the published quota.
The option requires normal publication, exact-candidate tests and activation;
changing mutable authoring cannot alter an existing deployment. Arbitrary modes,
altered bounds and oversized configurations fail closed. There is no unpinned
fallback or change to the default portable mode.

Agent runtime/compiler ABI v8 requires exact loading-contract equality. Old
deployments must pass normal publication, candidate tests and activation again;
there is no compatibility adapter or release waiver. Playbook and Gateway ABIs
are unchanged. ADRs 0008, 0009, 0020 and 0023 retain their authority invariants.

Deterministic fixtures compare the same full schemas with eager serialization,
reach the last of 100 compact-purpose pins, reject the original oversized long
100-purpose directory, preserve purpose tails and loaded enums, and compare
admission with real Gemini/Ollama wire serialization. They include accumulated
results, bounded loading history, same-batch hidden dispatch, stale pending
revisions, low-quota/unsupported publication, and existing sibling replay and
deadline checks. Live host integration is a separate coordinator-owned step.
