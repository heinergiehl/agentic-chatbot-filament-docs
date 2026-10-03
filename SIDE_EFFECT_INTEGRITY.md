# Side Effect Integrity

Side Effect Integrity is the package-wide guard for unsafe writes. It gives memory writes, API Connector writes, raw HTTP writes, custom write actions, Playbook Capability and batch executions, and form-backed submissions one shared vocabulary for duplicate protection:

- policy mode
- invocation or business-key identity
- scope
- deterministic invocation or business key
- optional read-only conflict check
- local execution claim and replay ledger

The goal is provider-neutral. A calendar booking, CRM lead, support ticket, payment intent, webhook call, and host database write should not need separate duplicate-protection architecture.

## What The Package Guarantees

Memory, API Connector, raw HTTP, and custom action writes that cross `CapabilityExecutionGateway` require a positive, lease-fenced ledger claim before handler or transport dispatch. Reads remain ledger-free. API Connector, raw HTTP, and custom action writes must declare a write integrity policy. The package can:

- use the server-attested prepared invocation identity or build a deterministic business key from resolved workflow input
- claim that key before dispatching the unsafe write
- block concurrent duplicate attempts while the first claim is running
- reject a previously completed duplicate when policy mode is `reject_duplicate`
- replay the previous result when policy mode is `idempotent_replay`
- block retries after unknown external outcomes by default
- run read-only preflight conflict checks before dispatch
- record execution status, result preview, remote id, and conflict metadata in the local ledger

Write handlers may add domain uniqueness constraints, but those constraints never replace or bypass the gateway ledger. A write action without the gateway policy and positive claim is blocked before its handler runs.

## What External Systems Must Still Guarantee

The package protects plugin-initiated writes. It cannot make an external API or host application globally unique by itself.

External systems should still provide their own atomic guarantees when correctness matters:

- unique database indexes for host records
- provider idempotency keys when supported
- external duplicate constraints for calendars, CRMs, ticketing systems, and payment providers
- reconciliation paths for provider timeouts where the local runtime cannot know whether the write succeeded
- authorization checks on the external API side

Use remote idempotency headers when the provider supports them. Their value is derived from the positive local ledger claim and cannot be replaced by caller-controlled transport fields.

Unknown write outcomes are never reclaimed automatically. The only valid unknown-result policy is `block_until_reconciled`: reconcile the provider result first and then record a definitive outcome. This prevents a timeout or ambiguous 5xx response from becoming a duplicate write.

Every API Connector write crosses `CapabilityExecutionGateway` from an exact,
deployment-pinned Playbook Capability. Multi-item execution is only a
deterministic AgentGraph dispatch: each Capability or `batchMap` item is tied to
its immutable capability revision, exact normalized input, rendered outbound
payload, confirmation grant, and AgentGraph execution identity. A batch-level
boolean bypass is not accepted.

## Capability Classification Boundary

The capability contract accepts the closed vocabulary `none`, `read`, `write`,
`mixed`, and `workflow`. Unknown values and misspellings are blocked; they are
never downgraded to reads. Productive capability execution accepts only exact
`read` or `write` grants. `mixed` must be decomposed into separately authorized
read and write Capabilities, while `workflow` describes orchestration and is
rejected at the execution gateway used by actions, HTTP, API Connectors, and
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

## Conflict Checks With API Connectors

Use an API connector conflict check when the external system has a read endpoint that can answer "does this already exist?" before the write runs.

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

## Conflict Checks With Data Resources

Use a Data Resource conflict check when the duplicate can be detected in the host application database through a read-only resource approved for the bot.

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

Data Resource conflict checks must stay read-only. They should query approved fields and rely on the Data Resource's runtime scope filters.

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

## Operator Review And Side-Effect Integrity

Operator review and side-effect integrity solve different problems.

- Operator review decides whether a human must approve a write.
- Side-effect integrity decides whether the write is safe to execute once approved.

When both are active, claim the write identity before queuing or executing the side effect so retries cannot create parallel review or execution paths for the same business key.

## Examples

### Appointment Slot Write With API Preflight

Use `reject_duplicate` at bot scope. The business key is the slot and calendar. A read-only API operation checks whether the slot already exists.

```json
{
  "mode": "reject_duplicate",
  "scope": "bot",
  "business_key": {
    "components": [
      {"name": "calendar", "path": "body.calendar_id", "normalizer": "lower"},
      {"name": "starts_at", "path": "body.starts_at", "normalizer": "datetime_utc"}
    ]
  },
  "conflict_check": {
    "type": "api_connector_operation",
    "operation_key": "find_appointment_by_slot",
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

Use `reject_duplicate` when one lead email should exist per bot. A Data Resource checks the local CRM mirror before calling the CRM API.

```json
{
  "mode": "reject_duplicate",
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

1. Enable Side Effect Integrity globally.
2. Require explicit policies for raw HTTP writes first.
3. Add policies to every API connector write operation. Writes without one fail closed by default.
4. Add policies to every custom write action or mark built-ins as self-managed only when they have real constraints.
5. Choose scope and business key components from stable domain facts.
6. Add read-only conflict checks where an existing record can be queried safely.
7. Keep provider idempotency headers when available.
8. Verify duplicate attempts in the host app and confirm only one external or host write occurs.
9. Decide how unknown external outcomes are reconciled before enabling automatic retries.
