# Side Effect Integrity

Side Effect Integrity is the package-wide guard for unsafe writes. It gives memory writes, API connection writes, raw HTTP writes, custom write actions, Workflow Tool and batch executions, and form-backed submissions one shared vocabulary for duplicate protection:

- policy mode
- invocation or business-key identity
- scope
- deterministic invocation or business key
- optional read-only conflict check
- local execution claim and replay ledger

The goal is provider-neutral. A calendar booking, CRM lead, support ticket, payment intent, webhook call, and host database write should not need separate duplicate-protection architecture.

## What The Package Guarantees

Memory, API connection, raw HTTP, and custom action writes that cross `CapabilityExecutionGateway` require a positive, lease-fenced ledger claim before handler or transport dispatch. Reads remain ledger-free. API connection, raw HTTP, and custom action writes must declare a write integrity policy. The package can:

- use the server-attested prepared invocation identity or build a deterministic business key from resolved workflow input
- claim that key before dispatching the unsafe write
- block concurrent duplicate attempts while the first claim is running
- reject a previously completed duplicate when policy mode is `reject_duplicate`
- replay the previous result when policy mode is `idempotent_replay`
- block retries after unknown external outcomes by default
- run read-only preflight conflict checks before dispatch
- record execution status, result preview, remote id, and conflict metadata in the local ledger

Write handlers may add domain uniqueness constraints, but those constraints never replace or bypass the gateway ledger. A write action without the gateway policy and positive claim is blocked before its handler runs.

Which writes may run at all is decided before the ledger: by the write tools the Agent's live version pins and the steps of its pinned Workflow versions (ADR 0054). There is no Agent permission mode; each write keeps its own confirmation setting (ADR 0038), and an action whose effect is not classified never runs. A live version published before 1.0 with a permission mode is refused before any claim when one of its tools or Workflow steps writes and the mode denied writes.

## What External Systems Must Still Guarantee

The package protects plugin-initiated writes. It cannot make an external API or host application globally unique by itself.

External systems should still provide their own atomic guarantees when correctness matters:

- unique database indexes for host records
- provider idempotency keys when supported
- external duplicate constraints for calendars, CRMs, ticketing systems, and payment providers
- reconciliation paths for provider timeouts where the local runtime cannot know whether the write succeeded
- authorization checks on the external API side

Use remote idempotency headers when the provider supports them. Their value is derived from the positive local ledger claim and cannot be replaced by caller-controlled transport fields.

Unknown write outcomes are never reclaimed automatically. The only valid unknown-result policy is `block_until_reconciled`: reconcile the provider result first and then record a definitive outcome in **Inbox > Unverified actions**, or configure pinned HTTP read-back verification (see [Unverified Actions](#unverified-actions)). This prevents a timeout or ambiguous 5xx response from becoming a duplicate write.

Every API connection write crosses `CapabilityExecutionGateway` from an exact
deployment pin, directly as an Agent tool or as a pinned Workflow Tool. Multi-item execution is only a
deterministic AgentGraph dispatch: each Tool or `batchMap` item is tied to
its immutable tool revision, exact normalized input, rendered outbound
payload, confirmation grant, and AgentGraph execution identity. A batch-level
boolean bypass is not accepted.

## Tool Classification Boundary

The tool contract accepts the closed vocabulary `none`, `read`, `write`,
`mixed`, and `workflow`. Unknown values and misspellings are blocked; they are
never downgraded to reads. Productive tool execution accepts only exact
`read` or `write` grants. `mixed` must be decomposed into separately authorized
read and write Tools, while `workflow` describes orchestration and is
rejected at the execution gateway used by actions, HTTP, API connections, and
memory writes.

The gateway ledger claim, explicit executor write policy, and `block_until_reconciled` unknown-outcome policy have no environment or runtime-config bypass. Other independently configurable write-safety controls retain their documented production checks. Run `php artisan filament-agentic-chatbot:doctor` to inspect that separate runtime posture.

## Policy Modes

`reject_duplicate`

Blocks a second write with the same business key after the first one succeeded. Use this for appointment slots, unique lead captures, one open request per customer/topic, and writes where a second result would be incorrect.

`idempotent_replay`

Returns the previous successful result for the same canonical identity. Use this when the user or workflow may retry the same command and should receive the already-created resource details.

## Identity Selection Guide

`invocation`

Uses the hash-bound `PreparedCapabilityInvocation.idempotencyKey`. Retry or resume of the same authorized prepared invocation reuses one claim and safely replays success. A later, separately confirmed invocation can obtain a new claim even when its payload matches.

`business_key`

Uses typed values from the authorized payload and server-attested context. Choose it when domain identity, such as an appointment slot or external customer key, must detect duplicates across separate invocations.

## Scope Selection Guide

`conversation`

Use for most chat-driven writes. The same business key is unique inside one conversation, but another conversation may create its own record.

`bot`

Use when the bot owns a shared namespace, such as one appointment slot or one CRM lead email per bot.

`owner`

Use when the same authenticated owner should not create duplicates across conversations.

`workflow_run`

Use when uniqueness only matters inside one workflow execution.

`global`

Use sparingly. This makes the business key unique across every bot that uses the package connection.

## Business Key Component Normalizers

Business keys are declared as ordered components. Each component reads a value from the write context and normalizes it before hashing.

Supported normalizers:

- `string`: trim and compare as text
- `lower`: trim and lowercase
- `email`: trim and lowercase an email identity
- `datetime_utc`: parse a datetime and compare in UTC
- `date`: parse a value and compare by date
- `sha256`: hash the normalized string or JSON value

Example:

```json
{
  "mode": "reject_duplicate",
  "identity": "business_key",
  "scope": "bot",
  "business_key": {
    "components": [
      {"name": "slot", "path": "body.starts_at", "normalizer": "datetime_utc"},
      {"name": "calendar", "path": "body.calendar_id", "normalizer": "lower"}
    ]
  }
}
```

Keep business keys stable, minimal, and domain-specific. Do not include volatile values such as generated ids, timestamps for the current request, random tokens, or full natural-language prompts unless the write is truly unique per prompt.

## Conflict Checks With API connections

Use an API connection conflict check when the external system has a read endpoint that can answer "does this already exist?" before the write runs.

The conflict operation must be read-only and available to the bot. It receives rendered input from the write context.

```json
{
  "type": "api_connector_operation",
  "operation_key": "find_appointment_by_slot",
  "input": {
    "calendar_id": "{{body.calendar_id}}",
    "starts_at": "{{body.starts_at}}"
  },
  "conflict_path": "found",
  "conflict_when": "true",
  "message": "That appointment slot is already booked."
}
```

Conflict checks are preflight checks, not the final correctness layer. The write policy ledger and the external API's own constraints still matter.

### Direct Agent writes

A write tool the Agent runs directly (without a Workflow) runs its API connection conflict check the same way. Publishing the Agent pins the check with the write: the Agent Version holds the check's `supporting_capabilities.conflict_check` (exact read-only revision, contract hash, input schema and Connection binding) next to the write, exactly as a Workflow binds it. Changing the check operation therefore changes the Version, and **Publish affected Agents** previews it as an authority change.

When the visitor confirmed the write (or an unconfirmed write is dispatched), the Gateway takes the ledger claim, renders the check input from the confirmed values (`{{ body... }}`), and reads through the flat Agent read pipeline: scope, credentials and host policy come from the server. Then:

- a conflict ends the call as `side_effect_conflict` (ledger status `conflict`, nothing sent);
- a check that cannot complete (provider error, unreadable or partial answer, an operation that changed since the Publish) releases the claim as `failed` with the error category `conflict` and the outcome code `connector_conflict_check_failed`. Nothing is sent, no ledger row stays `running`, and the write can be attempted again;
- a Version published before the check was pinned refuses the write with `agent_write_conflict_check_unpinned` ("Publish the Agent again to run it") before any claim is taken. A write never runs without its declared check.

An app data tool conflict check reads through a Workflow run, so an Agent cannot pin it to a direct write: the Tool cannot be added to an Agent, and the editor asks for a Workflow.

## Conflict Checks With app data tools

Use an app data tool conflict check when the duplicate can be detected in the host application database through a read-only resource approved for the bot.

```json
{
  "type": "data_resource",
  "resource_key": "crm_leads",
  "filters": [
    {"field": "email", "operator": "equals", "value": "{{body.email}}"}
  ],
  "message": "A lead with this email already exists."
}
```

App data tool conflict checks must stay read-only. They should query approved fields and rely on the app data tool's runtime scope filters.

## Form Duplicate Policies

Submission schemas expose the same duplicate vocabulary as API and action writes.

- `dedupe_key_path` defines the field used as the submission business identity.
- `duplicate_policy: idempotent_replay` keeps the existing behavior and reuses an existing saved submission.
- `duplicate_policy: reject_duplicate` blocks a second submission with the same key.

Example:

```php
'lead_capture' => [
    'label' => 'Lead Capture',
    'dedupe_key_path' => 'email',
    'duplicate_policy' => 'reject_duplicate',
    'payload_schema' => [
        'type' => 'object',
        'required' => ['email'],
        'properties' => [
            'email' => ['type' => 'string', 'format' => 'email'],
        ],
    ],
],
```

Form field validation stays separate. Validators check required fields, scalar values, types, and cross-field relationships. Duplicate checks happen at write time.

## Unverified Actions

Unverified-action database notifications use the Tool label. Their text is stored
in the recipient’s preferred language at delivery time, falling back to the
application language; later panel language changes do not translate stored text.
The Inbox Resolved filter lists manual and automatic reconciliations under the
same Agent and tenant scopes as unresolved actions.

A write whose external result is `unknown` (a timeout or ambiguous response
after dispatch, a lost lease fence, an expired running claim or a stopped
external job) is an **unverified action** (ADR 0050). It stays `unknown` until
a person, or later read-back reconciliation, settles it; nothing settles it
to `failed` automatically and nothing retries it.

- **Inbox > Unverified actions** lists every unknown write, newest first: the
  tool, the Agent, a link to the conversation, the confirmed values (from the
  confirmation card, or the ledger payload that was redacted before it was
  stored, both redacted again for display), the request time and the bounded
  last error. Operators (`operate`) see the rows of Agents the host lets them
  see; another tenant's rows are neither listed nor opened.
- **Resolve** needs `admin` (`unverified_actions.resolve`), a choice of
  completed or not completed in the provider, the provider evidence, a reason
  and a no-retry acknowledgement. The Workflow run page and
  `filament-agentic-chatbot:reconcile-side-effect` (now with a required
  `--evidence`) use the same finalizer.
- The finalizer is a terminal-state compare-and-set: only `unknown` moves to
  `succeeded` or `failed`. Of two concurrent resolutions (two operators, or an
  operator and read-back reconciliation) exactly one wins; the other is told
  the action was already resolved and changes nothing.
- In the same transaction the finalizer records a `reconciled` row in the
  write event outbox. A worker then moves the confirmation card from
  `unknown` to the verified status and appends one evidence pair to the
  conversation transcript (the write tool's call and a result that says the
  team verified the outcome and that the write must not be repeated), so the
  next turn replays it. Every step is idempotent; claim token, attempts,
  backoff and the scheduler sweep recover a worker that crashed between the
  ledger and the transcript. A Workflow write closes its unknown chat turn in
  the finalizer's transaction instead.
- When a write becomes unknown, the Agent's **Notify** users (the handoff
  setting) who may see the action receive one Filament database notification
  without the confirmed values. Without Notify users nobody is notified, the
  row still appears and the Agent's checklist warns. Delivery runs after
  commit from the outbox; a notification or webhook failure never changes the
  write outcome.
- Every transition into `succeeded`, `failed` or `unknown`, and every
  resolution, also produces the `capability_write.*` webhook events; see
  [Outbound webhooks](OUTBOUND_WEBHOOKS.md#external-write-events).

Explicitly unconfirmed writes record before dispatch that no card is expected
and propagate transcript evidence only. A missing card without that durable
marker fails closed and remains retryable.

The Gateway binds a confirmed write, including lead capture, inside the ledger
claim transaction before dispatch. Binding failure rolls back the claim.
Settlement recovers a missing binding only from the exact confirmed invocation.
Migration `2026_10_14_000023` classifies pre-upgrade running and unknown direct writes with
neither binding nor marker as legacy. If no exact confirmation is recoverable,
resolution skips card/transcript propagation and records
`legacy_projection_unavailable` as the delivered event reason. New missing
bindings remain retryable and fail closed. Unreadable metadata is logged with
only table, row id and exception class and left unmarked. Its projection still
fails closed and exhausted propagation reaches **Delivery needs attention**;
see UPGRADING.md for recovery before reopening write admission.
Late responses defer to a verified ledger settlement. Card metadata and native
transcript evidence updates take the conversation row lock, and verification
pairs within each message replay in outbox-id order. Missing bindings, assistant messages or an
unsupported transcript version keep propagation retryable, up to five attempts.
Exhausted deliveries appear in the separate **Delivery needs attention** tab,
including settled executions. The default tab lists unknown writes only. An
admin can use **Retry delivery**
(`unverified_actions.retry`), under the same host record scopes and ability as
**Resolve**. It retries propagation only. It never dispatches the write.
Notifications apply both execution and Agent SQL scopes in the recipient's
authentication context, even when the worker has another authenticated user.
Each list starts from its indexed status subset. The badge uses two counts,
excluding unknown writes from the failed-delivery count to avoid double counting.
Both apply host SQL scopes without scanning Agents. Lists rely on these scopes
for row visibility; opening, resolving and notifying also evaluate record grants.
Notification checks swap panel and default guards to the recipient. Workers have
no Filament tenant; tenant-dependent host scopes must deny access or derive scope
from recipient membership. Throwing scopes deny visibility.

Write event delivery uses `chat.chat_queue.connection` and
`chat.chat_queue.queue`. Delivered write event rows are retained for audit and
deduplication; pruning would allow a transition to be recorded with a new id
and duplicate its evidence or notification. Pending and failed rows are retained
until repaired. A future bounded retention policy requires deduplication
tombstones before it can safely prune delivered rows.

The visitor still hears that the result could not be verified and that the
team will check it; the queue, the notification and the propagation make that
statement true.

## Operator Review And Side-Effect Integrity

Operator review and side-effect integrity solve different problems.

- Operator review decides whether a human must approve a write.
- Side-effect integrity decides whether the write is safe to execute once approved.

When both are active, claim the write identity before queuing or executing the side effect so retries cannot create parallel review or execution paths for the same business key.

## Examples

### Appointment Slot Write With API Preflight

Use `reject_duplicate` at bot scope. The business key is the slot and calendar. A read-only API operation checks whether the slot already exists. Replace the example revision ID and hash with the exact published read you selected.

```json
{
  "mode": "reject_duplicate",
  "identity": "business_key",
  "scope": "bot",
  "business_key": {
    "components": [
      {"name": "calendar", "path": "body.calendar_id", "normalizer": "lower"},
      {"name": "starts_at", "path": "body.starts_at", "normalizer": "datetime_utc"}
    ]
  },
  "conflict_check": {
    "type": "api_connector_operation",
    "operation_revision_id": 42,
    "operation_contract_hash": "<SHA-256 of published read revision 42>",
    "input": {
      "calendar_id": "{{body.calendar_id}}",
      "starts_at": "{{body.starts_at}}"
    },
    "conflict_path": "found",
    "conflict_when": "true",
    "message": "That slot is already booked."
  },
  "remote_id_path": "id"
}
```

### CRM Lead Create With Email Business Key

Use `reject_duplicate` when one lead email should exist per bot. An app data tool checks the local CRM mirror before calling the CRM API.

```json
{
  "mode": "reject_duplicate",
  "identity": "business_key",
  "scope": "bot",
  "business_key": {
    "components": [
      {"name": "email", "path": "body.email", "normalizer": "email"}
    ]
  },
  "conflict_check": {
    "type": "data_resource",
    "resource_key": "crm_leads",
    "filters": [
      {"field": "email", "operator": "equals", "value": "{{body.email}}"}
    ],
    "message": "A lead with this email already exists."
  }
}
```

### Support Ticket Create With Replay

Use `idempotent_replay` when a retry should return the original ticket. Hash the issue text to avoid huge preview keys.

```json
{
  "mode": "idempotent_replay",
  "identity": "business_key",
  "scope": "owner",
  "business_key": {
    "components": [
      {"name": "customer", "path": "body.customer_email", "normalizer": "email"},
      {"name": "issue", "path": "body.issue_summary", "normalizer": "sha256"}
    ]
  },
  "remote_id_path": "ticket.id"
}
```

## Rollout Checklist

1. Run the package migrations and keep the queue worker and scheduler running.
2. Require explicit policies for raw HTTP writes first.
3. Add policies to every API connection write operation. Writes without one fail closed by default.
4. Add policies to every custom write action or mark built-ins as self-managed only when they have real constraints.
5. Choose scope and business key components from stable domain facts.
6. Add read-only conflict checks where an existing record can be queried safely.
7. Keep provider idempotency headers when available.
8. Verify duplicate attempts in the host app and confirm only one external or host write occurs.
9. Configure read-back or manual provider verification for unverified actions. Never replay uncertain writes.

## Business identity, conflict checks and read-back

For a calendar booking, use `identity: business_key`, scope `bot`, and
components `body.calendar_id` with `string` normalization and `body.starts_at`
with `datetime_utc`. Two independently confirmed requests for that same slot
then share a ledger identity. For a lead, `body.email` with `email`
normalization deduplicates case differences. A different payload under an
existing key is a conflict, even with `idempotent_replay`; it never changes
the original confirmed request. Use `invocation` when a later separately
confirmed request should be allowed to create another record.

An API conflict check pins `operation_revision_id` and
`operation_contract_hash` of a published read and maps its `input` from the
write payload. A positive conflict refuses dispatch and records conflict;
a failed pre-dispatch conflict check releases the claim as failed with
category `conflict`. A provider uniqueness constraint remains necessary:
a preflight read cannot prevent another system from booking the slot between
the read and the write. For example, a read returning an appointment under
`found: true` blocks a booking; an empty result permits the original confirmed
write once. The direct Agent deployment pins the supporting read too.

Read-back is the separate post-dispatch check for an unknown HTTP write.
`effect.reconcile_with` pins a read of the same Connection, input mapping and
strict comparisons against mapped confirmed values or the provider
idempotency key. A lookup by client reference returning that same reference
can prove success; merely returning an object with `status` cannot. Attempts
run after 30 seconds, 5 minutes and 30 minutes, never replay the write and
never automatically settle failed. Missing revisions, changed hashes,
credentials or policy blocks preserve unknown with a safe reason. The
original account/environment and payload identity stay pinned; current
Connection state and host policy still apply. See the exact grammar and
credential/authority limits in [API connections](API_CONNECTORS.md#read-back-reconciliation-of-unverified-writes).

The shared finalizer owns automatic and manual settlement, with one CAS winner
and the same durable card/transcript/webhook propagation. Three durable attempt
slots and the scheduler recover lost jobs; interrupted slots consume an
attempt, and stale workers cannot settle. Without a pin an action stays
manual-only. MCP tools and app data tool writes have no automatic read-back
reconciliation in 1.0. No provider-specific write replay is enabled.

Credential snapshots contain only fields needed by the pinned read, never
OAuth refresh tokens or client secrets. Every terminal ledger update and
manual or automatic finalizer CAS clears credentials, headers and the
credential fingerprint from the encrypted pin while retaining revision
identities, hashes, mapping, predicate and environment identity. The last
finished check also clears these fields
in the slot-finish transaction once no pending or running slot remains,
including interrupted checks finished by the sweep. Cleared pins cannot
authorize late read jobs. Only complete successful reads with a negative
predicate or explicit HTTP 404/410 responses for the mapped resource count as
"not confirmed". Provider failures, partial or truncated pages and rejected
result identities are read errors and show "Could not check" in the Inbox.
