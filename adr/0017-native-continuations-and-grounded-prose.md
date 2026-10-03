# ADR 0017: Native input continuation and grounded conversational prose

- Status: Accepted implementation target; live acceptance in progress.
- Date: 2026-09-12
- Mandate: The product owner requested removal of legacy conversational protocols,
  authorized breaking changes, and required natural, useful responses across
  partial inputs, independent reads, source failures and Playbooks.
- Extends ADRs 0015/0016. Supersedes the requirement in ADR 0014 that structured
  source statements always replace the proposed wording with field projections.

## Evidence and problem

The local widget conversation 760 used a verified v3 Agent deployment and valid
Connector revisions. Pokemon succeeded, weather needed input, the next short
reply produced an unrecorded question, and a rejected native proposal became a
request-ID question to the visitor. The provider completed normally. AgentGraph
was not involved in this direct-read path.

The implementation still combined incompatible answer instructions, redundant
request/task handles, whole-message purposes for independent reads, and a final
renderer that discarded natural wording before its existing semantic review.
Fixing the technical error message alone did not make the live dialog succeed.

## Decision

1. Laravel AI remains the only native model/tool loop. New reads carry the exact
   relevant visitor purpose in their existing native proposal; there is no
   prerequisite inventory, planner or word-coverage tool. Server state binds
   unique request/task identities. Model-visible handles distinguish competing
   work; decision 30 uses an explicit continuation choice for a sole prior
   taskless read. Neither mechanism confers authority.
2. A single verified pending Connector input uses the same SDK first-step named
   tool choice already used for Playbook waitpoints. Its normal native tool
   accepts a field proposal or a local `defer` decision. Deferral changes no
   input, request, confirmation or execution state; independent conversation
   continues after the SDK releases its first-step choice. Playbook decisions
   retain priority. Multiple pending tasks never select an arbitrary target.
   Its native schema requires the model's continuation action. A proposed
   correction of a resolved input must either pass the existing attested
   revision contract or ask about that field through `__clarify_input`.
   The latter preserves unrelated values and unresolved conditions, skips
   context inference, and requires a fresh visitor reply before execution.
   A unique prior-turn pending task may enter that same no-effect clarification
   when `continue` supplies exactly one changed, freshly bound public input.
   An unbound but schema-valid guess for an already unresolved/pending context
   field may remain unresolved; no proposed value or condition is adopted.
   Malformed context and changes to resolved conditions still reject.
   Competing tasks, malformed/unbound input replacements, confirmations and
   read proofs remain local rejections. `AgentConnectorTurn` enforces the same
   fresh-reply boundary and preserves the question on repeated native calls.
3. The productive answer has one claims/open-items contract. A claim's request
   handle is optional when its verified evidence has one current owner. The old
   second clarification format is absent from the native answer schema.
   Historical committed replies retain their original decoders and content.
4. Natural factual prose reaches the existing single semantic review after
   deterministic source, pointer and numeric admission. The reviewer assesses
   whether the unchanged wording preserves units, identity, context and meaning;
   equivalent natural wording needs no duplicated field-label suffix.
   Each proposed prose claim is one paragraph: line wrapping is normalized
   before review and text binding, never after approval. Exact source values
   retain their original whitespace. Paragraphs between claims remain separate.
   Supported wording is rendered as reviewed. Rejected or unreviewed wording
   may preserve exact structured facts through the deterministic projection,
   but cannot complete the request. Interpretation alone does not establish
   complete factual coverage. This is semantic verification, not a claim of
   deterministic natural-language entailment.
5. SDK-successful tool handler returns can still reject an application
   proposal. Recognized unresolved rejections cannot become healthy free-form
   answers merely because their SDK result has `failed=false`.
6. Every native step receives the current server request/task projection through
   the shared dispatch and budget projection. Constructor snapshots must not
   keep resolved questions or completed Connector tasks in active context.
   Presentation omits an earlier question only when the verified task records
   that field as resolved; explicit resolver choices remain protected.
7. The local update tool is limited to qualified Data Resource field changes and
   published dependent-read grouping. Standalone Connector work uses its native
   tool directly, including distinct source-bound purposes for the same tool.
   Published cardinality and all input authority checks still apply. The update
   tool is absent when no eligible capability exists and cannot manage an
   unrelated Connector merely because the Agent also has a Data Resource.
8. A rejected proposal is not an admitted conversation change. If its normal
   invalid-arguments result has no execution, evidence, task, cancellation or
   independent request change, restore its exact pre-binding request projection
   and checkpoint. Exceptions and possible effects retain their existing state
   and recovery owner. Completion diagnostics distinguish absence of execution
   from retry eligibility: retry additionally requires unchanged projections.
   An unbound or malformed replacement of a resolved input is also rejected
   atomically; failure to bind cannot erase the previous source or admit
   sibling conditions.
9. The server-resolved response language constrains the native answer schema,
   prompt and final answer admission. Tool data cannot select another locale.
   Current task context carries data only; proposal rules live in the native
   tool schema and shared instructions, without a second copy in task context.
   For a short pending correction, the server can supply the exact latest
   source message to the existing change-admission check. A bare changed value
   still does not authorize a scope change.
10. The persisted visitor-message timestamp grounds relative dates in both the
    productive prompt and its existing claim review. Its offset is explicitly
    the server record offset; it does not invent the visitor's timezone.
    Terminal requests stay in canonical history without occupying active task
    context. A final formatting step omits its trailing unverified text draft
    from the wire request while retaining native history, usage and opaque
    provider replay blocks. It formats from current records and actual results.
11. A model `needs_input` item cannot reopen an input after successful execution
    when no canonical field or task remains pending. Admitted evidence,
    supported claims and whole-request review still determine completion.
    A rejected proposal can repeat a safe stored question only for its exact
    pinned native tool and one unambiguous pending read. Unknown SDK failures,
   unrelated tools and ambiguous tasks cannot borrow that question. This is
   presentation, not an execution receipt, retry or new recovery owner.
   If no question prose was stored, the verified public pending-field schema
   supplies the question. Unsafe supplied prose still cannot be reused.
12. Failed provider steps retain bounded operator code-site diagnostics in the
    existing usage record and log: at most four exception causes, trusted
    package/vendor-relative PHP locations and opaque fingerprints. Messages,
    arguments, absolute host paths and provider payloads are excluded. This
    changes neither visitor output nor unknown-usage reconciliation or retries.
13. Publication rejects an explicitly selected Data Resource that cannot be
    resolved under the Agent's enabled query policy. It must not silently shrink
    the new manifest because a host registration is absent. Explicitly disabled
    queries still omit those tools. Runtime registry filtering is unchanged;
    the check runs at publication, without another model validation step.
14. A native Connector proposal need not repeat the entire `__context` object.
    Its omission supplies no proposed context values and enters the existing
    source-bound context assessment/admission. It does not clear conditions or
    authorize an unresolved field. An explicitly supplied context object still
    follows its complete declared schema, types and conflict checks. This removes
    a duplicate prerequisite before the existing context check, not the check.
15. Pure malformed JSON argument shapes return bounded field/reason diagnostics
    to the existing native loop before execution or task creation. Only declared
    input paths are named. Mixed missing-value, provenance or semantic failures
    retain their existing admission and visitor-clarification path. This uses
    the current binder's diagnostics, not another validator or model call.
16. A natural question after a failed read can use the existing single claim
    review batch. Its exact wording is bound to one request, canonical task,
    published pending field and task issue. Review support contains verified
    visitor values and a bounded failure category, never rejected provider facts.
    This approves wording only; it cannot resolve input, create a confirmation
    offer, admit a retry or complete the request. Published choices retain their
    exact presentation; unreviewed or unsupported questions use the safe fallback.
17. Mixed current/historical turns use the same native `claims`/`open_items`
    format with one optional, pinned historical selection. Only this field is
    stripped before the existing current-claim review. The historical reader
    validates and renders it separately; prior facts cannot supply current
    evidence, inputs or execution authority. The pure-history contract remains
    unchanged. The obsolete mixed `sections` prompt and parser are removed.
18. Invalid answer claims are suppressed and cannot grant authority. Their
    number does not veto completion when the surviving validated displayed
    claims receive the exact whole-request review verdict `answered`. Missing
    requested facts still require `missing_parts` or `uncertain`; no surviving
    claim, unreviewed fallback or foreign request reference can supply coverage.
    Malformed whole envelopes and invalid bound open items still fail closed.
    Every canonical request requires its own admitted evidence and semantic
    coverage verdict; bounded Connector scope follows ADR 0018.
19. A reference to an actual small curated record may select its published
    public descendants. Each leaf enters the existing source, context, unit and
    completeness checks and the same semantic review. Raw containers and hidden
    fields are never review support. Overlapping references are rejected; both
    each group and the whole claim are limited to 24 fields without truncation.
20. A package-local rejected read proposal can receive one correction opportunity
    inside the existing native step budget before the provider adapter closes
    tools for final formatting. Only trusted current-turn no-dispatch argument
    rejections qualify. Mixed batches, source results, denied operations and
    possible effects do not. Native history owns the once-only bound; the same
    tools and admission checks remain authoritative. No external call is retried.
21. The single claim review uses a lossless wire projection of repeated request
    and support metadata. Exact request context, source identity, completeness,
    scope, labels and units are referenced through shared dictionaries. Values,
    pointers and record context stay attached to their support. Admission and
    dispatch use the same 24-claim / 48,000-byte bound; assessment hashes remain
    bound to the original expanded claims. Metadata sharing cannot merge source
    authority, hide qualifiers or grant coverage to unreviewed claims.
22. Purpose rejection feedback identifies `request_evidence` and carries a
    bounded exact current visitor message with explicit truncation. This is
    diagnostic source data, not a selected purpose or default argument. The
    corrected native proposal still passes normal source, scope and input
    admission. Routing examples are explicitly labeled as non-source examples.
23. For a language-neutral reply, response language may continue from one
    unambiguous unresolved visitor request read through the existing verified
    conversation-state reader. Current explicit language takes priority and
    the deployment's allowed languages still constrain the result. Mutable
    conversation metadata, assistant wording, closed or unverified history do
    not supply this preference. It conveys no input or execution authority.
    Error presentation uses only current text and the deployment policy, so a
    rejected conversation receipt cannot throw again while rendering its error.
24. A canonical no-dispatch input clarification uses the same question review
    as a failed read. The proposal must name the exact pending published field
    of one verified task; other unresolved fields remain visible to review.
    Unreviewed stored questions and draft open items cannot override that field.
    Rejected wording falls back to the published field label. This approves
    wording only and cannot adopt a proposed replacement or complete a request.
25. A duplicate continuation against a closed task returns a local
    `use_existing_result` outcome without another execution, task transition or
    clarification receipt. Existing completion and evidence remain unchanged.
    A separately attested new request still enters normal admission.
26. A pure omitted required public argument is a proposal defect until the
    model distinguishes supplied text from genuinely missing information.
    Package-local no-dispatch feedback can use the same bounded native repair
    opportunity. The existing pending task remains available for a truthful
    question if correction stops. A corrected value still needs ordinary
    current-message binding; `__clarify_input` records an explicit ambiguity
    and requires a fresh reply. Repeated identical omissions reuse the recorded
    wait instead of consuming its question budget or granting another repair.
    Mixed validation failures, source failures and confirmation evidence do not
    qualify for this omission path. No argument is inferred by the server.
27. Generic Connector protocol instructions are presented once in the shared
    Agent instructions. Each native tool retains its published description,
    input schema, source identity, cardinality and operation-specific policies.
    The full seven-operation catalogue remains within its tested 30,000-token
    input limit without increasing the limit or dropping catalogue entries.
28. An unusable model answer after a successful curated read may use the
    original bounded deterministic fact rendering as the candidate for the
    same single semantic review. Only hash-matching presentation receipts and
    their visible public fact pointers may supply claims; required context
    must also be visible. Hidden fields, truncated records and raw model drafts
    supply no coverage. Normal request, execution, source and completeness
    gates still apply. The reviewed facts retain their exact rendering, while
    canonical pending notices follow the resulting coverage verdicts. A
    rejected or unavailable review leaves the request partial. Operational
    model-completion diagnostics remain recorded even when the displayed
    source facts fully answer the request. This adds no API call, legacy
    selection repair or second review.
29. Automatic curated Markdown lists can use the existing table renderer when
    records have uniform published fields and bounded cell values. Repeated
    labels appear once in the header; exact values, units, required context and
    visibility receipts remain intact. Explicit authored or visitor layouts
    and plain text retain their behavior. Section and global budgets do not grow.
30. For a sole prior taskless read that cannot bind implicitly, the native schema
    requires the existing `__task_action` choice: `continue` selects that unique
    recorded request and `new` creates separate work. No opaque ID is copied for
    this unique choice. Missing or contradictory choices reject before mutation.
    The decorator consumes the taskless selection control before ordinary read
    input admission; pending Connector task actions retain their semantics.
    Fresh purpose and input evidence remain required. Unknown or running outcomes
    retain their existing rejection. This proposes request identity, without
    replaying stored payloads, inferring intent or granting execution authority.

31. A nonempty early read-answer draft is not by itself evidence that every
    part of the current visitor message was attempted. When current read facts
    exist and at least two native steps remain, the existing package step adapter
    permits one completion opportunity in that same SDK invocation. It refreshes
    the current server conversation projection and asks the model to compare the
    original message with its results before finishing or proposing a distinct
    unattempted read. The unverified draft is not shown. An invocation-local
    once-only marker survives intervening tool results; it is not persisted as
    request state or authority. No-source conversation, Playbook work, unknown
    or running effects and exhausted steps do not qualify. Normal tools,
    source admission, receipt reuse, deadline and usage budgets remain binding.
    This is not a post-finalizer retry or an additional execution owner.

No second conversation scheduler, generic executor, automatic write retry,
source-specific keyword router or new semantic validation call is introduced.
Deployment pins, source admission, the capability gateway, confirmation binding,
unknown outcomes and AgentGraph recovery remain authoritative. SDK facilities
replace custom mechanics only after the same required behavior is established.

## Validation and limits

Use deterministic native transcripts for first-step release, short input,
deferral, competing tasks, malformed proposals, independent evidence, rejected
wording and missing answer coverage. Public-host evidence must distinguish a
source contract requiring more input from a failed source call or runtime bug.

The original weather revision 229 requires a literal period that is unused by
its HTTP request and response projection. Revision 231 removes that dead input
and truthfully describes the provider's dated forecast. Revisions 232 and 233
name the city input separately and describe the retained administrative region.
Candidate 123 pins revision 233 after the normal operation test and publication
gates. Exact candidate and public-widget acceptance remain required before activation.
Location/region authority and source dates remain protected; no city-specific
typo rule or invented date is introduced to make the fixture pass.

AgentGraph's protected accepted-resume recovery gap and release acceptance are
separate from this direct-read incident. Local package tests alone do not
establish a finished customer release.
