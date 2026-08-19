# API Connectors

API Connectors turn an approved HTTP API operation into a versioned chatbot and
workflow capability. The connector owns the remote service
boundary: base URL, authentication, allowed methods and paths, network policy,
and environment identity. The operation owns one secret-free declarative
contract for request materialization, response interpretation, effect policy,
and execution limits.

The package has one productive operation contract (version 3) and one result
envelope. There is no v1/v2 execution adapter, mutable-draft fallback, separate
multi-item connector definition, or alternate result projection in the
productive runtime.

## Product model

The lifecycle is explicit:

1. Create or select an API Connector.
2. Save an operation draft.
3. Validate and test the exact draft hash.
4. Publish an immutable operation revision.
5. Select that revision in a workflow or allow its generated bot capability.
6. Upgrade each consumer deliberately when a newer revision is published.

Saving a draft never mutates a published revision. Drafts are not discoverable
or productively executable. The read-only operation workbench is the only
exception: it recompiles the current draft, issues an in-memory server-owned
permit for that exact hash, and records bounded test evidence. A persisted flag,
model output, or request value cannot grant draft execution.

Draft assignment itself is a security boundary, not merely a publication
check. Before mutable JSON reaches storage, standardized objects are closed,
credential-bearing headers and fields are rejected, serialized JSON/form/raw
bodies are inspected, schema values and annotations are scanned, and capability
presentation text is checked. Operation name, description, and intent examples
use the same guard because those strings can later reach a tool descriptor or an
LLM.

## Exact workflow pins

An authored API Connector node stores only the immutable operation pin and
flow-owned settings:

```json
{
  "apiOperationRevisionId": "47",
  "apiOperationContractHash": "<64-character SHA-256>",
  "apiOperationInputSchemaHash": "<64-character SHA-256>",
  "environmentBinding": {
    "key": "production",
    "version": 1,
    "change_policy": "requires_republish",
    "contract_hash": "<64-character SHA-256>",
    "base_url": "https://www.googleapis.com/calendar/v3"
  },
  "inputMapping": {
    "title": "{{event_title}}",
    "start_time": "{{event_start}}"
  },
  "outputVariable": "calendar_result",
  "continueOnFail": false
}
```

The node does not store a trusted HTTP method, executable request URL, headers,
credentials, request template, retry policy, response mapping, write policy, or
operation snapshot. `apiOperationInputSchemaHash` independently pins the closed
tool-input boundary. `environmentBinding` is server-generated evidence for the
connector environment, not a caller-selected URL override. Publishing a
workflow verifies the exact immutable revision, full contract hash, input-schema
hash, connector visibility, and environment binding. At every dispatch the
runtime resolves the revision again, verifies all pins and authority, and
materializes the executable request from that revision. Persisted executable
overrides, including a legacy `__operationSnapshot`, are removed rather than
trusted. A missing, stale, inactive, revoked, or unauthorized pin fails closed.

The default environment change policy is `requires_republish`: changing the
connector's bound base URL, authentication identity/configuration, or default
headers advances the binding version and invalidates the deployed binding until
the workflow is reviewed and republished. Automatic OAuth access-token refresh
does not represent an operator environment change. The explicit operator policy
`allow_without_republish` permits a connector-owned environment rotation without
turning node data into URL authority; revision, full-contract, input-schema,
owner, and request-policy checks still apply. The current secret-free binding
hash/version is also part of the request authority payload, so a previously
issued confirmation or side-effect grant cannot be replayed after a binding
change even when republishing is not required.

Connector request-environment changes must use eventful model or service writes.
They use an optimistic version compare-and-set, so a stale editor cannot reuse a
binding identity or overwrite newer credentials. Direct query-builder updates
and `saveQuietly()` are unsupported for connector configuration. The only
intentional quiet credential write is the internally row-locked OAuth token
refresh, which does not change the configured principal or request target.

## Canonical operation contract

Every published revision contains one canonical JSON document with schema
`filament-agentic-chatbot.connector-operation` and version `3`. It is
secret-free and safe to hash or diff. Contracts select registered strategy IDs;
they never contain PHP class names or executable code.

This shortened Google Calendar write shows the important boundaries:

```json
{
  "schema": "filament-agentic-chatbot.connector-operation",
  "version": 3,
  "operation_key": "create_google_calendar_event",
  "request": {
    "method": "POST",
    "path_template": "/calendars/primary/events",
    "query_params": { "sendUpdates": "none" },
    "extra_headers": {},
    "body_template": {
      "summary": "{{title}}",
      "start": {
        "dateTime": "{{start_time}}",
        "timeZone": "{{timezone}}"
      },
      "end": {
        "dateTime": "{{end_time}}",
        "timeZone": "{{timezone}}"
      }
    },
    "input_schema": {
      "type": "object",
      "required": ["title", "start_time", "end_time", "timezone"],
      "additionalProperties": false,
      "properties": {
        "title": { "type": "string", "minLength": 1 },
        "start_time": { "type": "string", "format": "date-time" },
        "end_time": { "type": "string", "format": "date-time" },
        "timezone": { "type": "string", "minLength": 1 }
      }
    },
    "request_schema": {
      "type": "object",
      "required": ["summary", "start", "end"],
      "additionalProperties": false,
      "properties": {
        "summary": { "type": "string", "minLength": 1 },
        "start": {
          "type": "object",
          "required": ["dateTime", "timeZone"],
          "additionalProperties": false,
          "properties": {
            "dateTime": { "type": "string", "format": "date-time" },
            "timeZone": { "type": "string", "minLength": 1 }
          }
        },
        "end": {
          "type": "object",
          "required": ["dateTime", "timeZone"],
          "additionalProperties": false,
          "properties": {
            "dateTime": { "type": "string", "format": "date-time" },
            "timeZone": { "type": "string", "minLength": 1 }
          }
        }
      }
    }
  },
  "response": {
    "schema": {
      "type": "object",
      "required": ["id", "status"],
      "properties": {
        "id": { "type": "string" },
        "status": { "type": "string" },
        "htmlLink": { "type": "string" }
      }
    },
    "json_path": "",
    "output_mapping": {},
    "error_mapping": {
      "code_path": "error.code",
      "message_path": "error.message"
    }
  },
  "effect": {
    "type": "write",
    "requires_confirmation": true,
    "idempotency_header": null,
    "write_integrity_policy": {
      "mode": "idempotent_replay",
      "scope": "bot",
      "business_key": {
        "components": [
          {
            "name": "title",
            "path": "input.title",
            "normalizer": "string"
          },
          {
            "name": "start_time",
            "path": "input.start_time",
            "normalizer": "datetime_utc"
          },
          {
            "name": "end_time",
            "path": "input.end_time",
            "normalizer": "datetime_utc"
          },
          {
            "name": "timezone",
            "path": "input.timezone",
            "normalizer": "string"
          }
        ]
      },
      "conflict_check": { "type": "none" }
    }
  },
  "execution": {
    "timeout": 30,
    "retry": {
      "attempts": 0,
      "delay_ms": 0,
      "backoff": true,
      "unsafe_methods": false
    },
    "pagination": {},
    "async_completion": {}
  },
  "strategies": {
    "request_codec": "core/json",
    "response_decoder": "core/json_or_text",
    "outcome_classifier": "core/http_status",
    "pagination": "core/none"
  },
  "auth": {
    "sensitive_headers": [],
    "sensitive_query_parameters": []
  },
  "metadata": {
    "batch_mode": "fanout_safe",
    "max_items": 25,
    "capability": {
      "label": "Create Google Calendar event",
      "description": "Create a confirmed event in Google Calendar.",
      "intent_examples": [
        "Schedule an appointment",
        "Add this meeting to my calendar"
      ]
    },
    "input_policies": {
      "title": {
        "source": "literal",
        "semantic_type": "string",
        "entity_type": "event_title",
        "exact_source_required": true,
        "normalization": ["trim"],
        "aliases": {},
        "ambiguity": "reject"
      }
    },
    "result_identity": {
      "requested": { "input_path": "title", "normalizer": "casefold" },
      "observed": { "response_path": "summary", "normalizer": "casefold" }
    }
  }
}
```

`request.input_schema` is the closed chatbot/tool input boundary. Publication
requires a root object and materializes `additionalProperties: false`. By
contrast, `request.request_schema` validates the HTTP body after templates have
been materialized; it is required whenever a body template is configured. These
schemas are intentionally different when ergonomic chat inputs map to a nested
provider payload.

`request.path_template` contains a path only. It starts with one `/` and cannot
contain a scheme, host, query, or fragment; repeated and ordinary query values
belong in `query_pairs` or `query_params`. The provider request/response schema
dialect is closed to the constraints the runtime actually enforces, so an
unknown keyword cannot masquerade as validation or hide static credentials.

Publication derives `metadata.capability` from the operation name,
description, and intent examples. `batch_mode` is one of `single_only`,
`fanout_safe`, or `native_batch`; `max_items` is the operation's `0..25`
bound. The immutable workflow release copies this declaration into each
connector tool's `batch_policy`. Authorized Entry Turn Plans permit separate
per-item calls only for `fanout_safe` and enforce the smallest bound across
every reachable connector. The historical `max_items: 0` sentinel resolves to
the global 25-item turn-plan ceiling; newly authored batch declarations store
an explicit `1..25` bound. `single_only`, `native_batch`, or missing release
evidence fail closed for multi-item planning; `native_batch` never implicitly
becomes fan-out. Every public
input has a declarative `input_policies` entry that controls source evidence,
semantic/entity type, normalization, aliases, and ambiguity. Optional
`result_identity` binds the canonical requested value to provider response
evidence. These are generic operation contracts, not API-specific planner code.
Tool descriptions can expose purpose, effect, and confirmation requirements,
but not connector secrets, private headers, base URLs, or request templates.

`response.schema` validates the full decoded provider response before
`response.json_path` selects the value exposed as result `data`. Schema
mismatches fail closed (`failed` for reads, `unknown` with reconciliation for
claimed writes), and the public error envelope contains only bounded violation
metadata rather than the provider payload. The operation does not own an output
variable; that presentation/state name belongs to each workflow node.

Every server-owned object is closed: the top-level document plus `request`,
`response`, `effect`, `execution`, `retry`, `strategies`, `auth`, `metadata`,
`metadata.capability`, and the write-integrity objects reject unknown fields.
This rule is enforced both by publication and by direct immutable-revision
persistence. Provider payload templates, response mappings, and registered
strategy policy objects remain intentionally extensible. Static credential
material is nevertheless rejected recursively from request templates, schema
defaults/constants/examples/enums and annotations, capability presentation,
and from outcome, pagination, async-completion, and write-integrity policies.
Authentication values belong only to encrypted connector configuration;
operation contracts may declare redaction names but never store credentials.

The registered strategy boundary makes the same contract usable for different
HTTP APIs:

- request codecs cover no body, JSON, form URL encoding, multipart, and bounded
  raw/text payloads;
- response decoders cover JSON, XML, text, and bounded artifact/binary data;
- outcome classifiers cover HTTP status, declarative body predicates, GraphQL,
  and Slack-style body outcomes;
- pagination covers cursor, next-URL, Link header, and page-number strategies;
- connector-owned authentication covers OAuth, bearer, API key, basic, and
  registered signing strategies.

Custom strategy registration is trusted application code under a stable ID.
Imported JSON and chat users can select only IDs that the installation already
registered. HTTP method never decides business effect: `effect.type` is the
authority for confirmation, retry, idempotency, and reconciliation policy.
Multipart artifact references must include a SHA-256 digest before planning or
confirmation. The runtime reads only from configured disks/prefixes and verifies
the exact bytes against that digest immediately before dispatch.

## One capability boundary

Workflow nodes, Authorized Entry Turn Plan items, and the operation workbench
are consumers of the same published contract and the same capability execution
gateway. A plan binds the exact published revision ID, full contract hash,
input-schema hash, and environment binding. If that binding changes before
dispatch or confirmation, execution fails closed and a new release-bound plan
is required.

## Owner-scoped connectors

A connector may be global, bot-scoped, or additionally scoped by
`owner_type`/`owner_id`. An owner-scoped operation is visible and executable
only when a transient, server-attested runtime authority context matches the
conversation, bot/token, actor/tenant, and owner pair. The normal catalog can
derive that context from the matching conversation; exact workflow and
Authorized Entry Turn Plan execution carry it through the same resolver and
gateway.

Owner scope is never accepted from model output, operation input, workflow
variables, persisted planner payloads, or checkpoints. Without matching
authority the operation is omitted from discovery and exact resolution fails
closed. Workflow and Authorized Entry Turn Plan execution carry the same
server-attested authority through the resolver and gateway. A global or
bot-scoped connector with blank owner fields retains its normal bot visibility.

## Canonical result envelope

Every consumer receives the same untrusted result shape with schema
`filament-agentic-chatbot.connector-result` and version `2`:

```json
{
  "schema": "filament-agentic-chatbot.connector-result",
  "version": 2,
  "outcome": "succeeded",
  "ok": true,
  "usable": true,
  "data": {
    "id": "evt_123",
    "status": "confirmed",
    "htmlLink": "https://calendar.google.com/..."
  },
  "semantic": {},
  "http": {
    "status": 201,
    "content_type": "application/json"
  },
  "error": null,
  "pagination": null,
  "execution": {
    "contract_version": 2,
    "operation_revision_id": "47",
    "capability_status": "succeeded",
    "capability_code": "connector_succeeded",
    "ledger_execution_id": 9021,
    "diagnostics_ref": "capability-ledger:9021"
  }
}
```

The revision, full contract hash, input-schema hash, environment binding, and
runtime authority are dispatch authority before the call; result diagnostics
are not authority for a later call. Workflows write the envelope to the
configured `outputVariable`, and multi-item plan consumers parse that same
envelope instead of inferring success from arbitrary provider JSON. When
`metadata.result_identity` is declared, a successful HTTP response is usable
only after the requested and observed canonical identities match.

| Outcome | `ok` | `usable` | Meaning |
| --- | ---: | ---: | --- |
| `succeeded` | true | true | The contract completed successfully. |
| `replayed` | true | true | A previously committed idempotent result was returned. |
| `partial` | false | true | Bounded useful data exists, but completion was incomplete. |
| `failed` | false | false | A terminal transport, protocol, schema, or provider failure occurred. |
| `blocked` | false | false | Validation, policy, authorization, or safety prevented dispatch. |
| `unknown` | false | false | A write may have happened; retry is blocked pending reconciliation. |

A `partial` envelope must contain usable `data` and a typed `error`; the
assistant must describe the incompleteness before using the data. `unknown`
never invites an automatic retry. Errors separate stable machine handling, safe
user copy, provider diagnostics, and retry hints:

```json
{
  "category": "rate_limit",
  "code": "provider_rate_limited",
  "user_message": "The weather service is busy. Please try again shortly.",
  "provider_code": "429",
  "provider_message": "",
  "retryable": true,
  "retry_after_seconds": 30,
  "details": {}
}
```

Provider messages, response bodies, links, and mapped values remain bounded,
redacted, untrusted data and are never promoted to instructions.

## Bounded continuations, not a scheduler

Pagination and async polling use a durable continuation journal. The next
target, checkpoint, and final outcome are encrypted at rest; only hashes,
bounded counters, timing data, status, and lease/fencing data remain queryable.
The identity binds connector, immutable operation revision, contract hash, and
request fingerprint.

Each follow-up step re-authorizes the target origin and path, redirect/SSRF
policy, runtime owner authority, and current environment binding. Page, item,
attempt, response-size, and elapsed-time budgets are hard ceilings. Claims use a
random lease token whose hash is stored; an expired lease may be reclaimed only
for the same continuation identity and exact next step.

The journal is not an autonomous queue and its repository does not schedule
work or own workflow state. The bounded continuation runner performs polling or
pagination inside the owning connector invocation. A retry of that invocation
may resume an expired leased checkpoint; no scheduler wakes a journal row by
itself. AgentGraph remains the authority for workflow checkpoint, wait, resume,
delay, and task semantics.

## Write integrity, fencing, and reconciliation

Every write contract requires confirmation and an explicit integrity policy:

- modes: `allow_duplicate`, `idempotent_replay`, or `reject_duplicate`;
- scopes: `bot`, `conversation`, `owner`, `workflow_run`, or `global`;
- non-duplicate modes require typed business-key components under canonical
  `input.*` paths;
- supported normalizers are `string`, `lower`, `email`, `datetime_utc`, `date`,
  and `sha256`;
- conflict checks are `none`, `data_resource`, or an exact
  `api_connector_operation` revision ID plus contract hash. Publication expands
  an API conflict dependency into its own input-schema hash and immutable
  environment binding; runtime execution accepts only that deployment binding.

Business identity is derived from validated canonical operation input, never
from model-selected transport fields, headers, deployment metadata, or caller
idempotency strings. Provider idempotency is derived from the server-owned
ledger/request identity.

The central side-effect ledger encrypts request payload, result, and metadata at
rest. A write claim uses a random hashed lease token. Terminal updates are
fenced by ledger row, `running` status, and that token hash; losing the fence
produces `unknown` rather than pretending success or issuing another write.
Expired running writes also become `unknown` and are never automatically
reclaimed or retried.

Reconciliation is operator-only and never dispatches an external request. First
verify the provider outcome out of band. For a workflow write, open its
**Workflow Run** in Filament and choose **Resolve unknown write**. The action is
scoped to unknown ledger rows from that run, requires an authenticated operator,
an explicit no-retry acknowledgement, the verified outcome, and audit evidence.
It derives operator identity from the authenticated account and never exposes
the encrypted request, result, or metadata in the selector.

Production hosts require a dedicated Gate by default. Keep
`AGENTIC_CHATBOT_SIDE_EFFECT_RECONCILIATION_AUTHORIZATION_REQUIRE_GATES=true` and
defining the configured `filament-agentic-chatbot.reconcile-side-effects`
ability for `BotSideEffectExecution`. Local and testing environments retain an authenticated-operator default for low-friction setup. Doctor blocks a relaxed production posture without a registered Gate. The console command remains the
privileged operations path for ledgers that are not attached to a workflow run:

```bash
php artisan filament-agentic-chatbot:reconcile-side-effect <id> \
  --outcome=succeeded|failed \
  --force \
  --reason="Verified in provider audit log" \
  --operator="operator@example.com"
```

Add the provider's remote identifier when available. Conflict and diagnostic
metadata are minimized and redacted; raw provider observations do not become a
new source of execution authority.

## Google Calendar golden path

The setup command creates or updates the OAuth connector and creates and
publishes the canonical `create_google_calendar_event` operation:

```bash
php artisan filament-agentic-chatbot:setup-google-calendar-connector \
  --bot=<bot-public-id> \
  --calendar=primary \
  --prompt-secrets
```

Prefer the hidden prompt or environment variables over secret command-line
arguments, which may be retained in shell history:

- `AGENTIC_CHATBOT_GOOGLE_CALENDAR_CLIENT_ID`
- `AGENTIC_CHATBOT_GOOGLE_CALENDAR_CLIENT_SECRET`
- `AGENTIC_CHATBOT_GOOGLE_CALENDAR_REFRESH_TOKEN`
- optional `AGENTIC_CHATBOT_GOOGLE_CALENDAR_ACCESS_TOKEN`

The generated closed input schema covers title, start/end time, timezone, and
optional description, location, and attendees. It maps those fields to Google's
nested event request, validates a response containing `id` and `status`, pins a
typed `input.*` business identity, and requires confirmation. Publish the
operation, reference that immutable revision from a workflow, and republish the
workflow deployment. There is no separate Google batch flag or duplicated raw
HTTP definition.

## Security invariants

- Production base URLs use HTTPS and must pass connector network policy.
- Redirects, pagination links, and polling targets are authorized again and may
  not escape the approved origin/path boundary.
- Connector credentials and default headers are encrypted at rest; operation
  contracts remain secret-free.
- Connector base URLs are structurally validated before persistence: absolute
  HTTP(S), no userinfo, query, fragment, or surrounding whitespace. Production
  HTTPS, DNS, and SSRF checks remain a separate stricter runtime policy.
- Environment-binding hash/version participates in request confirmation and
  side-effect grant fingerprints; changing request-semantic connector settings
  invalidates previously authorized writes.
- Operation headers cannot override protected authentication or transport
  headers.
- Provider idempotency header and key are server-attested after custom
  authentication and again at retry/continuation dispatch; a merely non-empty
  or case-variant replacement never enables an unsafe write retry.
- Multipart request artifacts require and reverify a pre-bound SHA-256 digest.
- Request, response, retry, page, item, poll, and elapsed-time sizes have global
  ceilings in addition to contract limits.
- Binary responses are bounded artifacts, not prompt text.
- Published revisions, full contract and input-schema hashes, workflow pins,
  Authorized Entry Turn Plan bindings, owner authority, and environment bindings are verified
  before dispatch.

## Breaking cutover

`2026_07_28_000002_cut_over_authorized_turn_plans_and_connector_v3.php`
performs the irreversible version-3 cutover. It creates v3 drafts and new
immutable published revisions, derives closed literal input policies, preserves
declared result identity, and converts a legacy `supports_batch: true`
declaration to `batch_mode: fanout_safe` with a bounded maximum of 25 items.
Old `compoundRequest`, `apiConnector`, and `loop` deployment artifacts are
retired instead of translated at runtime. Back up the database, run the
migration in a maintenance window, then test and republish every retired
workflow before reopening chat traffic.

`2026_07_15_000003_cut_over_api_connector_operation_contracts.php` is the
historical version-2 canonical-contract cutover. Back up the database and rehearse it on
a production-shaped staging copy. The migration:

- builds one canonical draft from legacy operation fields;
- creates a published immutable revision where required and sets the published
  pointer;
- rewrites compatible API-operation conflict checks to exact revision/hash
  targets;
- verifies canonical hashes; and
- removes the legacy operation/revision columns that could act as a second
  productive contract.

The cutover also reconstructs capability metadata from server-owned operation
fields, drops unknown legacy metadata, closes every standardized contract
object and runtime payload schema, and aborts if a legacy base URL, schema,
presentation field, serialized template, or extensible policy can retain static
credential material.

The migration aborts on invalid JSON/shape, missing parents, connector mismatch,
ambiguous or unresolvable conflict targets, and incompatible scopes. It does not
silently choose a target or emit a usable "lossy" result. Fix the source data in
the pre-cutover schema and retry from a verified backup/staging rehearsal. The
`down()` path is intentionally unavailable; rollback means restoring the
pre-upgrade database and application.

The following migrations add the encrypted continuation journal, bounded
operation-test evidence, and encrypted/fenced side-effect payload storage:

- `2026_07_15_000004_create_api_connector_continuations_table.php`
- `2026_07_15_000005_create_api_connector_operation_test_runs_table.php`
- `2026_07_15_000006_harden_side_effect_execution_journal.php`

Legacy workflow nodes and deployments are not silently rewritten into exact
pins. After the cutover, test and publish each operation as needed, select its
published revision on every affected workflow node, and republish so the node
receives the exact revision ID, full contract hash, input-schema hash, and
environment binding. Verify read, confirmed write, error, partial, and
unknown/reconciliation paths in staging before serving customer traffic.

Connector usage inspection is deliberately read-only and scans persisted
authoring/runtime references without compiling or executing a workflow. An
unpinned legacy `connectorId` reference is shown as **Migration required** on
the connector page and continues to fail closed at validation/publication and
runtime boundaries. This diagnostic path may be removed only after the upgrade
inventory reports zero unpinned connector references; it is not a productive
compatibility adapter.
