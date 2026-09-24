# API Connectors

Published capability labels (255 characters) and descriptions (2,000 characters)
are validated and retained in full in new Agent pins and tool definitions. OpenAPI
parameter and schema descriptions are deduplicated when identical and labelled by
origin when different. Schema titles allow 200 characters; combined descriptions
allow 2,000. Overlength is an import/validation error, not silent truncation. Typed
examples, including `false`, `0` and `null`, remain annotations, never defaults.
Full metadata counts toward deployment and request budgets. See [upgrade steps](../UPGRADING.md).

Remote [MCP data sources](MCP_CONNECTIONS.md) use the same saved operation,
test/publication and Agent/Playbook execution boundaries. Their tools are
discovered through MCP and use an explicit protocol transport; ordinary API
Connectors define HTTP and MCP operations. Both support published reads and
confirmed Playbook writes through the existing capability gateway. MCP writes
add a separate signed create/update review and isolated exact-candidate staging
evidence; direct Agent tools remain read-only. See
[MCP connections](MCP_CONNECTIONS.md) and
[governed integration writes](INTEGRATION_WRITE_CAPABILITIES.md).

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

### Integration Studio import path

From the Connector list, **Import integration** opens a five-step full-page
assistant for OpenAPI 3.x JSON/YAML, Postman Collection v2, or pasted cURL. The
source is parsed locally and never executed. Authentication samples, scripts,
cookies, file content, remote references, and other secret-bearing material are
discarded. After parsing, the raw source is cleared and only an encrypted,
authenticated, secret-free manifest continues through the wizard.

The optional AI step reuses an existing centrally configured provider key. It
has no API-key field and may suggest only names, descriptions, intent examples,
and fictional schema-valid test input. A server-encrypted receipt binds that
assistant run to the manifest, selected operations, provider, and model. HTTP,
authentication, effect, confirmation, retry, and execution semantics remain
deterministic and locked.

Final installation is authorized, idempotent, actor-attributed, and atomic. It
creates only an inactive, untested connector and inactive, unpublished
operation drafts plus immutable evidence; it does not contact the service.
Continue through the normal governed test and immutable publication lifecycle.
See [Integration Studio](INTEGRATION_STUDIO.md) for formats, limits, key
handling, failure behavior, and the complete operator flow.

Saving a draft never mutates a published revision. Drafts are not discoverable
or productively executable. The operation workbench is the only exception: it
recompiles the current draft and issues an in-memory server-owned permit for
that exact hash. Reads use the normal connector target. A confirmation-required
WRITE may run only against an explicitly linked staging-only connector whose
origin, environment binding, and credential material are provably separate
from production. That request traverses the same capability gateway,
payload-specific confirmation, idempotency, side-effect ledger, and result
identity checks as a Playbook. A persisted flag, model output, or request value
cannot grant draft execution.

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
does not represent an operator environment change. Before contacting the token
endpoint, the runtime durably records one refresh attempt for the exact saved
credential fingerprint. A transport or persistence ambiguity is terminally
classified as `unknown` and cannot be dispatched again; reconnecting the
connector creates a new credential fingerprint and is the only safe recovery.
The explicit operator policy
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

Some model providers append a convenience field to an otherwise valid native
tool call. Direct read execution discards undeclared top-level fields without
interpreting, persisting, or forwarding their values. The remaining declared
fields still have to satisfy source binding, input policy, the closed published
schema, and the independent execution-gateway check. An ignored field can never
supply a required input or alter the HTTP request; undeclared fields inside a
declared nested object remain invalid.

`request.path_template` contains a path only. It starts with one `/` and cannot
contain a scheme, host, query, or fragment; repeated and ordinary query values
belong in `query_pairs` or `query_params`. The provider request/response schema
dialect is closed to the constraints the runtime actually enforces, so an
unknown keyword cannot masquerade as validation or hide static credentials.

### Query parameter serialization

Use `request.query_pairs` when an API requires an ordered, repeated, or
structured parameter. Each pair has `name` and `value`; collection parameters
also declare `serialization`. The value may be a literal or an exact input
expression. For example, this sends `tag=red&tag=blue` for `tags: ["red", "blue"]`:

```json
{
  "query_pairs": [
    {
      "name": "tag",
      "value": "{{tags}}",
      "serialization": { "type": "array", "style": "form", "explode": true }
    }
  ]
}
```

The supported collection shapes are flat arrays or objects with finite scalar
values. Names and values are percent-encoded separately from structural
delimiters; booleans are serialized as `true` and `false`. Object properties use
a canonical key order so equivalent values produce identical bound requests;
array item order is preserved.

| Type | Style | `explode` | Example |
| --- | --- | --- | --- |
| Array | `form` | `true` | `tag=red&tag=blue` |
| Array | `form` | `false` | `tag=red,blue` |
| Array | `spaceDelimited` | `false` | `tag=red%20blue` |
| Array | `pipeDelimited` | `false` | `tag=red%7Cblue` |
| Object | `form` | `true` | `color=red&size=large` |
| Object | `form` | `false` | `filter=color,red,size,large` |
| Object | `deepObject` | `true` | `filter%5Bcolor%5D=red&filter%5Bsize%5D=large` |

Empty collections produce no query pair. Nested collections, null collection
members, unsupported style combinations, literal spaces in space-delimited
items, literal pipes in pipe-delimited items, and brackets in deep-object names
are rejected with an explicit mapping error. Configure an API-specific mapping
or registered strategy for those cases. Review imported optional parameters
manually; the importer does not send missing optional values as literals.

Serialization belongs to the immutable operation contract. Materialized
parameters retain their exact shape through authentication, signing,
confirmation, and continuation. Changes require a new test and publication.

### Capability discovery and input policy

Publication derives `metadata.capability` from the operation name,
description, intent examples, ability aliases, and entity types. These fields
are the model-visible discovery contract when a published read is assigned
directly to an Agent. Every public input policy may additionally declare
visitor-value aliases such as `Bisaflor -> venusaur`; runtime admission applies
them deterministically after proving that the visitor phrase occurred in the
latest message. `batch_mode` is one of `single_only`, `fanout_safe`, or
`native_batch`; `max_items` is the operation's `0..25`
bound. The immutable Playbook release copies this declaration into each
connector capability's `batch_policy`. A bounded For Each step may issue
separate per-item calls only for `fanout_safe` and enforces the smallest
published bound. The historical `max_items: 0` sentinel resolves to the global
25-item ceiling; newly authored batch declarations store an explicit `1..25`
bound. `single_only`, `native_batch`, or missing release evidence fail closed
for fan-out; `native_batch` never implicitly becomes per-item execution. Every
public input has a declarative `input_policies` entry that controls source evidence,
semantic/entity type, normalization, aliases, and ambiguity. Optional
`result_identity` binds the canonical requested value to provider response
evidence. These are generic operation contracts, not API-specific planner code.
Tool descriptions can expose purpose, effect, and confirmation requirements,
but not connector secrets, private headers, base URLs, or request templates.

Every direct Connector call carries an exact purpose phrase from the visitor's
latest message. A named request not to use or read through that Connector hides
and blocks it, and an unrelated phrase cannot be borrowed merely because it
contains one of the operation's input values. After one committed successful
read, a short adjacent follow-up such as `and Dortmund?` may target the same
Connector only when persisted turn evidence, the published single-input schema,
and the immutable binder identify exactly one eligible operation. Current or
live data is never answered from stale conversation history.

The native model tool accepts omitted arguments so a missing essential does not
force a guessed value. Published input titles, descriptions, semantic meanings
and requiredness are included in its field descriptions. The runtime still
validates the full required API schema before dispatch. A missing or ambiguous
field can instead create pending input through the same native proposal. This
executes no external operation. Its validated question remains alongside independently completed
results, and an unresolved request cannot be dispatched after that question in
the same turn. The dialogue can retain separately admitted inputs and declared
conditions for the visitor's reply, as described under
[Pending direct-read context](#pending-direct-read-context). Direct API calls
retain their separate, required routing evidence.

Direct Agent input shapes are bounded: closed objects have at most 24 fields,
nesting has at most five levels, and lists have at most 25 items. Explicit list
bounds above that ceiling fail Agent publication instead of silently changing
the native contract. A list may be empty when its schema permits it, including
`maxItems: 0`. Unbounded lists use the same 25-item runtime ceiling.

Direct visitor-input schemas cannot declare `default`. A JSON-schema default
does not prove visitor intent, and the direct binder does not materialize one.
Put fixed API values in the published request templates; leave visitor fields
required or optional according to the API contract. Playbook input mapping and
its explicitly governed defaults remain separate. Imported MCP schemas retain
their existing default-normalization behavior.

Direct Agent input policies accept `literal`, `search_query`, schema-backed
`enum`, published alias maps (`local_resolver`), or a host-registered
`capability_resolver` source. `search_query` is limited to a public string input
of a read operation. It permits a short query interpreted from the visitor's
current topic; the query is a candidate, not evidence of a canonical entity.
The binder validates the published input schema and does not transfer this
policy to writes, credential
fields, exact targets, alias maps or resolvers. Use `literal` or a published
resolver when a particular entity or sensitive target must be bound.
An Agent release may separately authorize an exact scalar read dependency;
this does not add a generic provider-output input policy. A
published input may opt into `typo_tolerance: safe_v1`. That versioned local
strategy compares only against the immutable alias map, automatically accepts
only one unique close match, and sends ambiguous matches through the published
`ambiguity` policy (`clarify` or `reject`). For a `literal` source, values with
no alias candidate remain unchanged, so an
open field such as a city name does not become a closed allowlist. Exact aliases
remain the default when `typo_tolerance` is `none` or omitted. A capability
resolver is selected by its registered `entity_type` and must return
a bounded resolved, ambiguous, not-found, or unavailable outcome. Direct Agent
use additionally requires `VersionedCapabilityEntityResolver`: its stable key,
version, and SHA-256 behavior hash are copied into the immutable Agent
deployment and reverified before admission and again at the execution gateway.
Changing aliases or canonicalization rules therefore blocks old deployments
until the Agent is republished instead of silently changing their behavior. An
unversioned resolver remains available to an explicitly bound Playbook but is
not deployable as a direct Agent tool. `system_value` and `prior_task_output`
remain Playbook-owned; assigning such an operation directly fails closed rather
than turning a server value into visitor input. Installing a host resolver does
not alter `literal`, `enum`, or `local_resolver` admission; host-resolver
execution requires the published `capability_resolver` source.

For a published direct read, `attested_calendar_year` binds an integer
`calendar_year` input from one explicit year in the current visitor message or
from the recorded turn clock. The model cannot supply or override that field.
Multiple explicit years require clarification. Publication rejects the policy
for writes, noninteger inputs and other entity types. The policy does not
extend Playbook `system_value` authority to ordinary model arguments.

Literal numeric grounding uses an exact signed/decimal token boundary. A value
such as `42` is not accepted merely because the latest message contains `-42`,
and `1` is not accepted from `1.5`; signs, decimal fractions, exponents, and
adjacent numeric separators remain part of the number being matched.

A scalar read input may explicitly publish
`continuation_mode: exact_previous_success`. Only the immediately preceding
persisted user message's successful, server-attested value may fill an omitted
field, subject to the bounded follow-up grammar and expiry. Version-2 bindings
include `source_message_id` in their conversation/deployment/capability scope;
a current turn does not overwrite the previous turn's binding. Different
targets for the same capability and source leave a sticky empty `[]` binding,
so a later call cannot silently choose the last target. Version-1 rows stay
encrypted until TTL cleanup and cannot execute. See [Upgrading](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md)
for the required source-scope migration. This opt-in does not authorize the
model to copy arbitrary historical values into arguments.

For direct calls, `fanout_safe` authorizes repeated per-item requests only up to
the smaller of `max_items` and the Agent's five-call per-turn budget; the sixth
model step remains available for the final answer. `single_only` and
`native_batch` authorize one call; a native batch receives multiple items only
through its declared input schema, and the runtime overlays the published
`max_items` ceiling on every array in that direct-tool schema. Ambiguous
resolver output is returned as bounded candidates for a deterministic visitor
choice. Provider partial data and explicit failed attempts are treated as
incomplete evidence. An identical successful request with the same admitted
inputs and context conditions in the same turn replays its already bounded
evidence without another provider call and does not consume a distinct-item
slot. Model-visible Connector results are limited to 16 KB per
call and 48 KB across the turn. Truncation is recorded as incomplete evidence,
so a large provider payload cannot crowd out the final answer or be presented
as a complete result.

For paginated or partial direct reads, the result presentation includes a
server-derived `result_scope` with completeness, a bounded partial reason,
and available page/item counts. A published item or page stop is named only
when the runtime observed that exact bound. This metadata does not turn a
partial provider result into complete collection evidence.

### Inputs from another approved read

Configure `runtime_config.agent.read_dependencies` on the Agent and publish a
new Agent deployment to permit an exact read relationship. The immutable link
declares `source_capability_key`, `target_capability_key`, `source_pointer`,
`target_input`, `value_type` and `entity_domain`; both capabilities must already
be pinned reads in that Agent. See the
[configuration and runtime contract](AGENT_RUNTIME_ARCHITECTURE.md#published-read-dependencies).
Changing an operation alone does not create a dependency grant.

For an eligible target input, the native tool exposes an optional
`__read_inputs` object. A proposal supplies the ordinary input and its proof:

```json
{
  "customer_id": 41,
  "__read_inputs": {
    "customer_id": {
      "evidence_id": "<actual 64-character delivered evidence id>",
      "pointer": "/data/0/id"
    }
  }
}
```

Normal request-routing arguments remain required. The reference must address
the exact published source field in successful, complete, redacted evidence
from this active turn and this same recorded request. Each traversed collection
must contain exactly one eligible entity. A Data Resource source needs a
complete list with one match; a `first` record is insufficient. The target value
must equal the source's canonical scalar value, and the target schema and
declared entity domain still apply.

The input binder and the existing execution gateway both resolve this proof.
Missing links, wrong pointers, changed values, partial results, another request
or changed scope are rejected before HTTP/MCP dispatch. Invalid model proofs
receive argument-correction feedback without consuming a visitor question.
Verified proof provenance is recorded in the execution trace. These values do
not become retained visitor inputs or `exact_previous_success` defaults.
There are at most 16 acyclic published links and no new execution loop or
budget. Knowledge, Playbook outputs, write operations, private fields and
authority scope values cannot use this path.

### Bounded public location selection

The opt-in [Open-Meteo location profile](examples/open-meteo-location-selection-v1.json)
uses the implementation-pinned `open-meteo/geocoding-v1` response decoder through
the normal Connector pipeline. Search results are explicitly not globally
complete. A `bounded_selection_v1` offer confirms an exact returned public ID;
the separate ID lookup verifies that ID and supplied country/region context.
The adapter only validates and projects provider fields, with decimal string
rendering of IDs. It does not generate query echoes or infer geographic aliases.

That profile supplies location selection only. See
[ADR 0026](adr/0026-bounded-provider-location-selection.md) for its boundary.
The separate [forecast profile](examples/open-meteo-forecast-v1.json) adds
`canonical.mode: request_tuple_v1` links for public ID, latitude and longitude
from the verified flat lookup. Every target input must be required, linked to
the same fresh source receipt, and covered by the pinned request-bound decoder.
The final authorized URL must carry that exact coordinate pair and the fixed
forecast options. Missing proofs, altered receipts, mixed sources and extra
selectors fail before dispatch. Workbench may use explicit diagnostic inputs.

The output separates `request_binding` (local adapter provenance) from `grid`
and `current` (provider forecast facts). The grid coordinates can differ from
the requested place. This is a model forecast, not a location-ID echo or station
observation. No coordinate-equality or proximity heuristic is applied. See
[ADR 0027](adr/0027-canonical-request-tuples-and-grid-forecasts.md). Normal
Workbench evidence and fresh Connector/Agent publication are required; the
local weather candidate remains paused pending model/UI acceptance.

### Pending direct-read context

A question can leave a direct read pending across several visitor replies.
For example, a product lookup may already have a product identifier and a
maximum price while still needing the supplier. The runtime can retain each
admitted public input independently and ask for the missing field. Bounded
arrays and objects are supported when their full schema is safe for retention;
sensitive nested fields exclude the value from this path. The runtime binds
new values to the latest visitor message. Before reuse, it checks each retained
value against its original persisted user message, message hash, and exact
published input policy. A generated question or assistant answer cannot supply
visitor input. A provider result can supply a current read dependency only
under the explicit contract above, and is never retained as a visitor source.
Invalid replacement values cannot silently
reuse an older value for the same field.

A normal `continue` fills pending or unresolved fields and preserves already
resolved API inputs as well as conditions. A source-bound value for the open
region, for example, cannot silently replace the stored city. A changed resolved
value requires the existing explicitly attested `revise` action. Published
context dependencies may invalidate affected inputs; those inputs then accept
a fresh value. A model proposal cannot replace a resolved input without this
authority. An unchanged canonical alias or
object with reordered keys is still the same value; list order remains material.
This rejection is atomic even when the replacement fails its type or source
check: it neither erases the verified old value nor adopts sibling inputs or
conditions from the rejected proposal.

When a short reply might correct a different retained API input, the native
model can name that field in `__clarify_input` and omit its value. This records
an unresolved field through the existing task owner while preserving unrelated
values and unanswered conditions. It skips context inference and waits for a
fresh visitor reply before execution. A clarification cannot simultaneously
supply the selected value, confirm an offer, or revise the task.
The same clarification transition can be admitted when `continue` proposes
exactly one changed, freshly source-bound public input on a unique prior-turn
pending task. A schema-valid but unbound guess for an already pending context
field can remain unresolved while the valid input receives its question. No
proposed replacements or sibling conditions are adopted. The task
owner records the selected field as unresolved and requires a fresh reply.
Malformed or unbound input replacements, malformed context, changes to resolved
conditions, competing tasks, confirmations and read proofs remain atomic
`invalid_arguments` rejections for local correction.

Conditions that are distinct from API arguments require an optional
`metadata.context_contract` on the published operation. The advanced authoring
field is **Agent direct-read conversation conditions**. This example assumes
the API input schema declares a numeric `price_limit` and the provider returns
`supplier.company` and `price`:

```json
{
  "version": 1,
  "fields": {
    "company": {"type": "string", "title": "Company"},
    "max_price": {"type": "number", "title": "Maximum price"}
  },
  "checks": [
    {"field": "company", "source": "result", "path": "supplier.company", "operator": "equals", "normalizer": "casefold"},
    {"field": "max_price", "source": "input", "path": "price_limit", "operator": "lte", "normalizer": "numeric"},
    {"field": "max_price", "source": "result", "path": "price", "operator": "lte", "normalizer": "numeric"}
  ]
}
```

The closed contract allows 1–16 named scalar fields and 1–32 checks within
32 KB. Fields have a public title, an optional description, and one of `string`,
`integer`, `number`, or `boolean`. Strings may declare a bounded alias map.
Every field needs at least one check. Context is optional visitor input;
checks run only for conditions actually admitted from a source message.
Declaring a field does not supply a default or force a condition on every call.

For a country explicitly named by the visitor, a published alias such as
`context_contract.fields.country.aliases: {"Deutschland": "Germany"}` can
normalize that name to the provider's value. Configure context aliases in the
operation's **Context contract** JSON and publish a new revision and Agent
candidate. This does not infer an unstated country from a city or region.

An `input` check compares already admitted API arguments before dispatch. Its
path must reference a compatible field in the published input schema. A
`result` check compares returned provider metadata before result identity,
answer projection, or evidence admission. Paths are concrete dot paths, at most
eight segments and 256 bytes, with numeric array indices but no wildcards or
executable expressions. The operators are `equals`, `lte`, and `gte`; `lte`
means the observed value must be no greater than the admitted condition.
Strings use `exact` or `casefold`, numbers require `numeric`, and booleans use
`exact`. Credential-bearing field names and paths are rejected.

Missing or incompatible provider metadata fails the check. A conflict returns
only the declared field and a machine reason; it never exposes the rejected
provider value as a fact or as question context. Independent successful reads
remain available. The model can ask which condition or identifier the visitor
intends, but cannot waive a failed predicate. A provider location, company,
variant, or other relationship is evidence only when the published contract
identifies metadata the provider actually supplies. Model world knowledge is
not a substitute for that evidence.

For an operation with a context contract, the native call may omit `__context`
or supply `null` or an empty object when there are no new conditions. Within
the object, omitted known fields and null values also mean no new value; they
never erase retained conditions. Supplied values must satisfy the declared
types and source checks. Unknown keys, invalid shapes and wrong types remain
rejected without coercion. The optional `__ambiguous_context` list names
genuinely ambiguous conditions whose new values are omitted or null; an absent
optional condition is not an ambiguity. Invalid or unbound proposals receive
local correction before dispatch or task changes.

The focused tool-free assessment verifies the complete admitted API/context
proposal using the exact deployment provider and model. It receives published
field meanings, the current message, exact pending selection, verified sources
and value-free association hints. It supplies no replacement values or questions.
Negative or malformed/unavailable verdicts return `correct_arguments` with
`not_started`, without mutating pending state. The ordinary source binder and
gateway remain authoritative. These checks do not prove model understanding;
representative model tests remain necessary.

The assessment uses one model step, at most 1,024 output tokens and 20 seconds
within the existing turn deadline. Usage is recorded as
`agent_connector_context_assessment`. Its 16-entry per-turn cache includes failures
and binds the complete canonical proposal, selected live revision and source
hashes, deployment, pin and authority scope. Operations without context or
source reassignment incur no assessment call.

An earlier field assignment can be corrected with optional `__rebind`, for
example `[{"from":"input:location","to":"context:region"}]` alongside current
`location: "Miami"` and `__context: {"region": null}`. This requires exact
`__pending: {id, revision, action: "revise"}` for the same live open task and a
published target opt-in: `metadata.input_policies.<field>.pending_source_rebinding`
or `metadata.context_contract.fields.<field>.pending_source_rebinding` must be
strictly `true`. Absence or false denies reassignment. The input-policy authoring
row offers **Allow correcting an earlier field assignment**; context fields use
the advanced JSON contract. Publish a new operation revision and Agent candidate
to change these permissions.

Both endpoints must be public scalar visitor-literal fields using exact binding,
`latest_message_only` and no resolver. Up to 16 closed references may name concrete
root fields; duplicate donors/targets, cycles, self-references, conflicting current
assignments, confirmations and read-proof collisions are rejected. Donors are
read from the original verified snapshot before applying current replacements.
Their original literals must pass the target schema and its own aliases. The
original source message/hash and task age remain unchanged; a donor disappears
unless a separately admitted current value replaces it. Required missing donors
and dependent inputs remain unresolved. The reviewer checks the resulting
proposal with the verified references; shared source admission runs again before
partial persistence/reuse and independently at the gateway before dispatch.
Invalid references create no question, execution receipt or checkpoint change.
Existing result predicates and task isolation remain enforced. See
[ADR 0022](adr/0022-coherent-connector-continuations.md) for the coordinated ABI v7
candidate boundary.

The same native Connector tool handles partial inputs and clarification. There
is no separate clarification catalogue. Only the selected operation's closed,
typed fields enter source admission.

A pure omitted required public argument receives local correction feedback
before the model treats it as missing visitor information. The model can supply
the value from the current message or use `__clarify_input` to record a genuine
question. Ordinary source binding still decides whether the proposed value is
admissible. The canonical pending task remains available when correction cannot
finish; repeating the same omission does not consume another question or grant
another native repair opportunity. This does not retry an external API request.

The native model selects an offered pending task through the exact `__pending`
ID and revision, with action `continue` or `revise`. These controls are never API
arguments; public API fields beginning with `__` are reserved. Omission denotes
an independent read and leaves other tasks open. A bare reply may supply a new
literal under explicit revision; quoting old text alone does not authorize a
source move. Rebinding requires the separate published exception above. The
`cancel_connector_request` tool removes only the selected local pending read;
it does not call the provider or cancel a Playbook or remote job.

Questions are bounded by unresolved state, not wording or operation name. A
repeated state with the same admitted values and issue stops further questions;
progress to another missing field or condition can continue, up to six distinct
question states for a request. At most 16 requests fit in the private 64 KB
snapshot. Adding another request never evicts an existing one. These bounds do
not extend the Agent's model-step or capability-call budgets.

Resolver choices also retain the pending request, so a subsequent choice can
continue it. Every supplied field is schema-validated before partial input is
retained. Reverified original values remain available to explain a later result
mismatch and enforce the question budget; they do not become new user input or
authorize a different lookup.

The snapshot is a separate encrypted `bot_chat_turns.connector_context` envelope,
committed with the canonical assistant outcome. Answer receipts remain
presentation evidence and cannot restore pending values. Within an executing
turn, input admission may re-read that turn's own private checkpoint to correct
a tool proposal without losing admitted fields. The exact current turn,
deployment, scope, and user-source hash must match; earlier source messages
still require canonically committed turns. An empty current checkpoint takes
precedence over older pending requests. This does not permit a later turn to
read an uncommitted checkpoint or bypass an explicit request for a visitor reply.
Reuse across turns requires the
same bot, conversation, exact Agent deployment ID and hash, pinned capability,
context area, and freshly attested authority scope. The reader inspects at most
32 consecutive earlier turns and does not skip incompatible, incomplete, or
unverifiable turns to reach older context. Completion and cancellation persist
an empty snapshot when no requests remain, so older requests cannot reappear.
The internal `agent_runtime.connector_context_ttl_minutes` policy defaults to
30 minutes and is bounded to 1–1440. Expiry is measured from the request's
original creation time;
another question does not renew it. This TTL limits reuse, not physical storage
retention or deletion. A value-only reply can continue only a matching open
request or a verified immediately adjacent successful lookup. After context is
lost, a bare value cannot start an unconstrained replacement lookup. The runtime
asks for a complete request with its conditions and stores no replacement task
from that value. This admission also runs independently at the execution gateway.
Every semantically unresolved condition also stays open until a current
source-bound answer resolves that field. Answering one question cannot discard
other ambiguities, and null cannot accept an old value as a new answer. A known
condition that conflicts with provider results remains available for a corrected
lookup. An explicitly pending API input must be supplied even if its base schema
marks it optional.

The context contract is pinned in the immutable operation revision and Agent
deployment. Adding or changing it requires testing and republishing both;
absent contracts leave existing serialized pins and hashes unchanged. Run the
additive migration described in [Upgrading](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md#unreleased-source-bound-connector-clarification-context).
Existing questions are not backfilled into authoritative context.

This mechanism applies to direct Agent reads. Publication rejects nonempty
context contracts on writes, and Playbooks keep their own input, policy, and
pre-execution validation. An arbitrary OpenAPI `string` does not provide a
geographic, business, or identity relation automatically. Publish the relevant
schema, aliases, deterministic resolver, identity evidence, and context checks
for the operation. This feature adds no external resolver service, background
job, or second conversation scheduler. The architectural decision is recorded
in [ADR 0010](adr/0010-source-bound-connector-clarification-context.md).

### Direct-read answer evidence

Current Agent turns use the same claim contract for direct reads and other
answers. Laravel AI supplies native structured output when the deployed model
supports it; the ordinary admission rules also validate prompt-only JSON:

```json
{"language":"en","claims":[{"text":"The package weighs 2 kilograms.","kind":"source_statement","support":[{"evidence_id":"exact-delivered-evidence-id","pointer":"/data/weight"}]}],"open_items":[]}
```

Each claim cites public fields of the exact delivered evidence. The example
requires a published kilogram unit; a bare numeric value does not establish
that unit. The server derives the request binding when the cited evidence
belongs to exactly one current request. For ambiguous shared evidence the
model uses the exact server-issued request ID. Internal identifiers and input
JSON do not appear in visitor-facing prose. RFC 6901 pointers address `/data`
fields and array indices; knowledge uses `/context`.

The existing single semantic review checks natural wording and whole-request
coverage. Invalid claim proposals are discarded without granting completion;
unverified wording falls back to admitted original fields. Published identity,
units, labels, context and collection bounds remain mandatory. A pending input
must already be recorded by the native Connector tool before an `open_items`
question can describe it. An incomplete answer cannot invent a new input task.

The former `sections` selection document remains an internal deterministic
rendering and historical-answer path, not the current Agent conversation
protocol. Its legacy output-only repair cannot complete a current unresolved
request. Current turns add no second repair/review loop or repeated API call
to turn that fallback into a claimed success. The complete rendered answer,
including markup and provenance, is limited to 3,000/8,000/16,000 UTF-8 bytes
for `short`/`balanced`/`detailed`; factual sentences are never cut into a
different claim. See [Runtime architecture](AGENT_RUNTIME_ARCHITECTURE.md)
and [ADR 0017](adr/0017-native-continuations-and-grounded-prose.md).

Connector routing quality is evaluated explicitly rather than inferred with a
global vocabulary. In **Test live bot**, an operator may select one or more
direct reads from the active immutable Agent deployment and state the expected
distinct item count for each one in a representative prompt. This supports
compound checks such as Pokémon plus weather without introducing a second
planner. The committed operator trace records only the capability key, bounded
status/cardinality facts, and whether fan-out calls were distinct; request
values and provider payloads are excluded. The eval counts distinct successful
calls for `fanout_safe` and distinct canonical items in the largest declared
array dimension for `native_batch`. Every expected route must have exact
coverage, no incomplete attempt, and an actual Agent answer decision. This
catches weak-model omissions such as answering only Berlin when Berlin and New
York were requested without pretending that a generic runtime heuristic can
understand every future API domain.

`safe_evidence_fallback` is not a passing answer in these checks. Optional
allowlisted `evidence_guard` and `answer_repair` fields in committed v5 evidence
explain format/reference failures and the repair outcome without exposing raw
provider data. Regressions should verify distinct returned values in their
actual call and nested-record context, including APIs that do not echo inputs.

`response.schema` validates the full decoded provider response before
`response.json_path` selects the value exposed as result `data`. Schema
mismatches fail closed (`failed` for reads, `unknown` with reconciliation for
claimed writes), and the public error envelope contains only bounded violation
metadata rather than the provider payload. `response.output_mapping` selects
stable semantic facts for workflows and a separate, closed Agent projection.
`response.agent_output: "mapped"` shares only approved mapped values, including
when the mapping is empty or every value is missing/hidden. There is no fallback
from an empty mapped result to the provider object. `"response"` explicitly
permits the full selected response and cannot coexist with a nonempty mapping.
An absent mode preserves existing published meaning: nonempty mappings are
curated, otherwise the selected response is exposed. New operation forms and
Integration Studio imports default to `mapped`.

A numeric mapping may declare bounded `scale`, `offset`, and
`precision` values so provider units are normalized deterministically before a
model sees them. For example, `{"path":"response.height","scale":0.1,
"precision":1}` can publish a `height_meters` fact from a decimeter source.
Invalid or non-numeric transformations omit that semantic fact instead of
silently publishing a mislabeled raw value. The operation does not own an
output variable; that presentation/state name belongs to each Playbook step.

In **Mapping → Fields the Agent may answer with**, edit selected fields rather
than a raw output JSON document. A field has a stable key, source path, readable
label, unit and visibility. Optional details include a description for relevance
selection, labels for `de`/`en`/`fr`/`es`, exact localized labels for returned
enum/code values, numeric conversion and explicit context fields. `summary` is
the default overview; `detail` remains available for a
specific question; `hidden` never reaches the Agent. These are published
operation settings, not visitor-selectable permissions. A label does not perform
a unit conversion, and hiding a field from the Agent does not remove its
workflow value, audit retention or host authorization requirements.

**Answer presentation** defaults to **Automatic** and requires no template.
The deterministic renderer adapts one fact, one object, and record collections,
adds a short localized intro when useful, and falls back from Markdown tables to
a readable channel-safe layout. It is available only for `mapped` output because
the visible semantic fields are its validation and evidence boundary; full
response mode keeps its basic generic rendering. **Precise presentation controls** can bind the
subject to an exact input or visible response field, choose a semantic record
title such as `books.title`, lock or allow an explicit visitor layout request,
configure localized intro/closing text, or publish an exact safe template.
The semantic selectors come from this operation's input schema and nested output
mapping, so the mechanism is provider-independent and does not contain
Pokémon-, weather-, or book-specific code.

These exact presentation settings govern the deterministic source renderer,
including selection, fallback and historical answers. Successful conversational
prose uses the Agent response policy and reviewed source claims. Rendering
templates and internal selection proofs remain in canonical evidence; they are
not copied into the model's source facts or treated as factual citations.

Safe templates support only `{{subject}}`, `{{count}}`, `{{input:key}}`, and
`{{field:semantic.path}}`. Publication rejects unknown or hidden references,
malformed placeholders, credential literals, oversized text, and unknown
configuration keys. Dynamic values always come from the admitted input or the
verified evidence envelope; provider strings and template text are escaped as
literal output. A misconfigured static sentence can still be misleading, so
Automatic remains the recommended default and representative preview/live tests
remain required before activation.

For example, this response policy answers a temperature question without also
displaying humidity, while retaining the place that the reading belongs to:

```json
{
  "agent_output": "mapped",
  "output_mapping": {
    "place": {
      "path": "response.location.name",
      "presentation": {"label": "Location", "labels": {"de": "Ort"}, "visibility": "detail"}
    },
    "temperature": {
      "path": "response.current.temperature_c",
      "presentation": {"label": "Temperature", "labels": {"de": "Temperatur"}, "unit": "°C", "visibility": "summary", "context": ["place"]}
    },
    "humidity": {
      "path": "response.current.humidity",
      "presentation": {"label": "Humidity", "labels": {"de": "Luftfeuchtigkeit"}, "unit": "%", "visibility": "detail", "context": ["place"]}
    }
  },
  "answer_presentation": {
    "version": 1,
    "mode": "auto",
    "allow_user_layout": true,
    "subject": {"source": "input", "key": "city"},
    "intro": {"mode": "auto"}
  }
}
```

Context references are visible sibling mapping keys, never arbitrary paths or
expressions. Missing context removes the dependent fact. Containers may inherit
context from their parent scope. For an object or record collection, declare
`fields` on its mapping definition and use relative child paths, for example
`{"path":"response.products","fields":{"sku":{"path":"sku"},"price":{"path":"price","presentation":{"context":["sku"]}}}}`.
Every record keeps its original index; objects cannot expose unlisted children,
and wildcard columns cannot stand in for record mappings. Existing string path
shorthand, path aliases and numeric transforms remain supported; workflow roles
cannot fill another declared field or widen Agent disclosure.

The model receives only the approved values and bounded, revision-owned field
metadata. It selects an exact field for a narrow question, an object for the
summary, `fields` for several literal child keys, or `detail: "all"` for a full
approved overview. The server adds required context and renders readable labels
and units, without request JSON or internal `/data/...` paths. Output validation,
the existing evidence hash, bounded repair and canonical JSON/SSE replay remain
in force. Useful relevance selection still requires representative model tests;
this contract does not prove that arbitrary model intent interpretation is right.

Every server-owned object is closed: the top-level document plus `request`,
`response`, `effect`, `execution`, `retry`, `strategies`, `auth`, `metadata`,
`metadata.capability`, and the write-integrity objects reject unknown fields.
This rule is enforced both by publication and by direct immutable-revision
persistence. Provider payload templates, response mappings, and registered
strategy policy objects remain intentionally extensible; the nested
`presentation` object is closed and bounded. Static credential
material is nevertheless rejected recursively from request templates, schema
defaults/constants/examples/enums and annotations, capability and output-field presentation,
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

Direct Agent read tools, Playbook Capability steps, and the operation workbench
are consumers of the same published contract and the same capability execution
gateway. Production binds the exact published revision ID, full contract hash,
input-schema hash, and environment binding into the immutable Agent or Playbook
deployment. A direct Agent tool is allowed only for a read-only operation;
writes, approvals and durable waits require a Playbook. Scalar inputs from
another direct read require an explicit Agent read-dependency link and the
current evidence proof described above. If
an operation or environment binding changes before dispatch or confirmation,
execution fails closed and the owning deployment must be republished.

Workbench tests do not save the operation form implicitly. Save contract or
connection changes before opening the test. The dialog binds the saved
operation ID, compiled contract, connection/environment, operator and trusted
tenant context; these are checked again before execution. WRITE confirmation
also binds the current input values. Editing those inputs clears confirmation,
and a changed candidate, expired dialog or substituted input requires a new
confirmation. Expected candidate and staging-binding hashes reach the staging
test service as well. WRITE publication still requires successful staging
evidence for the exact saved candidate; its persistent publication gate is
unchanged.

## Owner-scoped connectors

A connector may be global, bot-scoped, or additionally scoped by
`owner_type`/`owner_id`. An owner-scoped operation is visible and executable
only when a transient, server-attested runtime authority context matches the
conversation, bot/token, actor/tenant, and owner pair. The normal catalog can
derive that context from the matching conversation; exact Playbook execution
carries it through the same resolver and gateway.

Owner scope is never accepted from model output, operation input, workflow
variables, persisted planner payloads, or checkpoints. Without matching
authority the operation is omitted from discovery and exact resolution fails
closed. Playbook execution carries the same server-attested authority through
the resolver and gateway. A global or
bot-scoped connector with blank owner fields retains its normal bot visibility.

The confirmed staging WRITE test creates an isolated, marked admin-test
conversation and attests the authenticated operator through the same authority
factory. Tenant-owned connectors additionally require the host middleware's
`filament_agentic_chatbot.tenant_context` request attribute. The admin action
passes only that server-side attribute; ordinary request parameters, modal
inputs and connector owner fields cannot supply tenant authority. This context
is preserved through planning, confirmation and the capability gateway. The
generic connection/read test does not gain owner authority from this path.

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

For a resolver-to-read chain, an Agent may explicitly publish a
`read_dependencies[].canonical` freshness policy. Both Connector operations
require result identity and the target identity must exactly check its sole
required schema input, such as `location_id`. Additional target schema inputs,
including optional fields, and composite identities are not supported by this
policy. Fixed options can use static request configuration. That input always
needs a current verified source receipt, including
when an identical literal is present in the visitor message. Country and region
remain source-bound conditions checked by the resolver's `context_contract`.
Public-name confirmation supplies only the name; it grants no permission to
invent coordinates or IDs. See [published read dependencies](AGENT_RUNTIME_ARCHITECTURE.md#published-read-dependencies)
and the [versioned provider-contract example](examples/canonical-location-v1.json).
The example is a deterministic integration fixture, not a claimed mapping for
the external demo's existing weather provider. Existing exact-name revisions
retain their meaning until explicitly republished.

Input titles, descriptions and constraints should state their actual meaning
and required specificity. A JSON `string` alone cannot distinguish a region
from a city, a product family from a variant, or an incomplete reference from
an exact identifier. The Agent uses the published contract to ask for missing
or ambiguous details. Deterministic input admission and result identity checks
remain mandatory. A provider's approximate or nearest match is not proof of
exact identity; publish a resolver or identity contract the provider can satisfy
rather than relying on prompt wording to waive a mismatch.

Design each operation's fields together with its request mapping, normalization
policy and result identity. State whether a field contains one entity name or a
combined search expression; put separate qualifications in their declared fields.
Every required value must serve the actual request or an implemented condition.
An unused required value can create unnecessary visitor questions even when the
contract hash is valid. Test complete input, missing input and conflicting
qualifications through the published Agent. A draft HTTP test alone does not
exercise conversational admission or answer coverage.

Pure malformed native JSON arguments return a bounded declared field path and
reason to the existing model loop before execution or task creation. Missing
visitor values, ambiguity and source-binding failures retain their existing
admission path. No global field names, API-specific parsing or automatic retry
of an executed operation are introduced.

Direct Agent reads support a contextual question before dispatch or after an
unverifiable result, while preserving successful independent results.
[Pending direct-read context](#pending-direct-read-context) preserves source-bound
values across replies and applies declared conditions before and after a call.
Repeated unresolved states and the bounded question budget produce a stated
limit instead of an endless sequence of questions. The mechanism is generic;
its optional relationship checks still require an explicit published contract.

### Read failure explanations

Direct API, MCP, and Data Resource reads carry a bounded failure category and
next action to the model and answer renderer. Provider bodies, error messages,
credentials, and rejected result facts are not public explanations.
The canonical operator receipt retains the category, next action, retry flag,
and bounded retry delay, so these distinctions remain diagnosable after a turn
finishes. It stores no provider error text or rejected input values.

| Verified failure | Response and recovery |
| --- | --- |
| Result identity or declared condition mismatch | Preserve the intended identity and conditions; ask a bounded useful question or state the unresolved limit. Do not retry the unchanged request as a temporary outage. |
| Resource not found by the service | Explain the lookup result and verify the identifier or coverage. HTTP 404 alone does not prove that the user's entity does not exist. |
| Request rejected as invalid | Distinguish provider validation from local field admission. Ask the user to change a value only when a verified field diagnostic supports that request; a Connector mapping may be responsible. |
| Authentication or authorization | Explain that the connection or its access needs administrator attention. Do not ask the visitor for credentials. |
| Rate limit, service outage, or transport failure | Explain the temporary failure. Preserve a bounded `Retry-After` when available, without automatically repeating the request. |
| Unreadable, incompatible, or missing required response | Explain the response-contract problem and request operator attention, rather than another user value. |
| MCP `isError` | Explain that the tool reported a failure; do not infer a more specific cause from arbitrary error text. |
| Rejected database query or failed database read | Keep these separate from a successful query returning zero matches. Published fields, filters, and access scope still constrain recovery. |

Mixed answers preserve verified successful results and identify failed sibling
reads within the answer budget. A failure in one operation does not silently
replace another operation's outcome. Uncertain writes remain subject to the
existing reconciliation contract, including when an ambiguous HTTP response
contains malformed JSON; this read explanation contract never grants a retry.

The Connector circuit breaker requires a shared cache store implementing
Laravel atomic locks. Cache transitions are locked briefly; HTTP runs outside
the lock. The open marker survives cooldown and a single leased probe owns
recovery. Its lease covers the admitted request timeout. Only the owning probe
can close or reopen that recovery; stale outcomes cannot release a replacement
probe. A lost probe admits one replacement after lease expiry. Workers must
share the cache for this protection across processes.

| Outcome | `ok` | `usable` | Meaning |
| --- | ---: | ---: | --- |
| `succeeded` | true | true | The contract completed successfully. |
| `replayed` | true | true | A previously committed idempotent result was returned. |
| `pending` | false | false | A durable job was accepted; its final result is not yet available. |
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

## Inline continuations and durable background jobs

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

Pagination accumulates accepted items at the configured concrete `items_path`
and reapplies the published output mapping to that combined result. Hidden
fields remain hidden. If a later response fails HTTP, schema, or mapped-context
validation, previously accepted items remain available as a partial result;
the failed page does not contribute records. Page and item truncation are also
partial results. A provider's accepted partial response retains its partial
status even when it occurs after the first page or before a journal resume.

A successful prefix stopped solely at the published page or item limit can
carry a server-attested bounded selection for conversational answers. Its
execution remains partial. The existing answer review can approve positive
search results with a visible limitation, but cannot infer absence, uniqueness,
derived totals or exhaustive coverage from that prefix. Failed pages,
provider-declared partial results and changed context do not receive this
proof. See [ADR 0018](adr/0018-bounded-connector-answer-selection.md).

Map only stable business context outside the item collection. If an approved
global context value changes between pages, pagination stops with
`pagination_context_changed`; it cannot label later records with the first
page's currency, scope, or other metadata. Page counters and next links should
remain pagination controls rather than global answer context. Transport,
policy, and lease exceptions continue through the gateway's failure and
unknown-outcome handling instead of becoming successful partial responses.

The journal is not an autonomous queue and its repository does not schedule
work or own workflow state. Existing contracts without an explicit durable mode
retain bounded inline polling/pagination and their original hashes. A retry may
resume an expired inline lease only for the same authorized invocation.

An operation may instead publish `execution.async_completion.mode: durable`
and run inside a Playbook. The initial acceptance is committed before yielding;
the existing AgentGraph delay/resume path then performs bounded status reads
through `CapabilityExecutionGateway`. An optional signed webhook accelerates
that same path. Pending is not usable output, and accepted writes remain
protected from resubmission. See [Durable Connectors](DURABLE_CONNECTORS.md) for
the completion protocol, structured backend controls, signatures, diagnostic
limits and recovery behavior.

## Write integrity, fencing, and reconciliation

Every write contract requires confirmation and an explicit integrity policy:

- modes: `idempotent_replay` or `reject_duplicate`;
- identity: `invocation` or `business_key`;
- scopes: `bot`, `conversation`, `owner`, `workflow_run`, or `global`;
- `business_key` identity requires typed components under canonical `input.*`
  paths, while `invocation` uses the server-attested prepared invocation key;
- supported normalizers are `string`, `lower`, `email`, `datetime_utc`, `date`,
  and `sha256`;
- conflict checks are `none`, `data_resource`, or an exact
  `api_connector_operation` revision ID plus contract hash. Publication expands
  an API conflict dependency into its own input-schema hash and immutable
  environment binding; runtime execution accepts only that deployment binding.

Business identity is derived from validated canonical operation input, never
from model-selected transport fields, headers, deployment metadata, or caller
idempotency strings. Invocation identity binds the authorized bot/authority,
immutable deployment and contract, Playbook run, turn/message, execution path,
node, and payload. Provider idempotency is derived from the positive ledger
claim, not from a caller-controlled header value.

The central side-effect ledger encrypts request payload, result, and metadata at
rest. Every connector write must obtain a positive claim before transport; read
operations remain ledger-free. A write claim uses a random hashed lease token. Terminal updates are
fenced by ledger row, `running` status, and that token hash; losing the fence
produces `unknown` rather than pretending success or issuing another write.
Expired running writes also become `unknown` and are never automatically
reclaimed or retried.

Reconciliation is operator-only and never dispatches an external request. First
verify the provider outcome out of band. For a Playbook write, open its
**Playbook Run** in Filament and choose **Resolve unknown write**. The action is
scoped to unknown ledger rows from that run, requires an authenticated operator,
an explicit no-retry acknowledgement, the verified outcome, and audit evidence.
It derives operator identity from the authenticated account and never exposes
the encrypted request, result, or metadata in the selector.

Production hosts require a dedicated Gate by default. Keep
`AGENTIC_CHATBOT_SIDE_EFFECT_RECONCILIATION_AUTHORIZATION_REQUIRE_GATES=true` and
defining the configured `filament-agentic-chatbot.reconcile-side-effects`
ability for `BotSideEffectExecution`. Local and testing environments retain an authenticated-operator default for low-friction setup. Doctor blocks a relaxed production posture without a registered Gate. The console command remains the
privileged operations path for ledgers that are not attached to a Playbook run:

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

The setup command creates or updates the OAuth connector and saves the
canonical `create_google_calendar_event` operation as a draft. It does not
publish the operation automatically:

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
typed `input.*` business identity, and requires confirmation. Before testing,
link the production connector to a staging-only Google Calendar connector with
a different origin, environment binding, and OAuth credentials. Publish the
operation in Filament only after that exact draft succeeds through the staging
WRITE path and its succeeded side-effect ledger entry is bound to the evidence.
WRITE publication has no production override. Then reference that immutable
revision from a workflow and republish the workflow deployment. There is no
separate Google batch flag or duplicated raw HTTP definition.

## Google Docs golden path

The idempotent setup command creates or updates one bot-scoped OAuth connector
and two explicit operation drafts. It never publishes either draft:

```bash
php artisan filament-agentic-chatbot:setup-google-docs-connector \
  --bot=<bot-public-id> \
  --prompt-secrets
```

Prefer the hidden prompt or these environment variables over secret
command-line arguments:

- `AGENTIC_CHATBOT_GOOGLE_DOCS_CLIENT_ID`
- `AGENTIC_CHATBOT_GOOGLE_DOCS_CLIENT_SECRET`
- `AGENTIC_CHATBOT_GOOGLE_DOCS_REFRESH_TOKEN`
- optional `AGENTIC_CHATBOT_GOOGLE_DOCS_ACCESS_TOKEN`
- optional `AGENTIC_CHATBOT_GOOGLE_DOCS_SCOPE`

The default scope is Google's recommended per-file scope,
`https://www.googleapis.com/auth/drive.file`. It is sufficient for documents
created by, or explicitly opened for, the app. Editing an arbitrary existing
document requires an explicitly approved broader scope such as
`https://www.googleapis.com/auth/documents`; do not replace the default with
the restricted full-Drive scope.

`create_google_document` calls `documents.create` with a closed title-only
request and requires a closed Document response containing `documentId` and
`title`. It maps the generated ID to semantic output and verifies the returned
title against the admitted input. A server-generated `documentId` cannot be
compared with a pre-request input, so the ID is instead required by the response
schema and captured in the encrypted replay result.

`insert_text_into_google_document` calls `documents.batchUpdate` for a known
`document_id`. Its one-item `insertText` request is closed at every object
boundary; the response must carry the same `documentId`, and the gateway rejects
a mismatched successful response. Both writes require a payload-bound
confirmation, disable unsafe HTTP retries, and use gateway replay protection.
Creation is keyed to one workflow-run invocation; insertion uses
`(document_id, index, text)` within the workflow run, so retrying an interrupted
node does not create a second document or insert the same text twice.

As with every connector WRITE, first link a staging-only Google Docs connector
with separate endpoint and OAuth credentials. Test each exact draft hash there,
publish only the ledger-backed candidate, pin that immutable revision in the
workflow, and republish the workflow deployment. The setup command performs
none of those authority transitions on behalf of an operator.

## Security invariants

- Production base URLs use HTTPS and must pass connector network policy.
- Productive requests, OAuth token refresh, read workbench tests, staging WRITE tests, and
  connector-backed API sources use the same connector-scoped egress authority.
  The default denies every non-public target in every environment; the global
  `network.allow_private_request_urls` setting does not authorize connectors.
- A private-network exception requires a host-server binding for
  `ConnectorEgressPolicyResolver` and an explicit decision for the selected
  persisted connector and concrete target URL. Host implementations should
  exact-allowlist each required base-URL or OAuth origin; a connector-ID-only
  exception is too broad. Connector, operation, workflow, and model payloads
  cannot select or configure that resolver. A resolver failure denies access.
- Method and path policy runs before DNS. Every permitted target is resolved
  once and the validated addresses are pinned into the transport. Loopback, private,
  link-local, shared, benchmark, documentation, multicast, reserved, and cloud
  metadata targets fail closed at testing, publication, and runtime.
- Pinned connector requests disable ambient HTTP proxy environment settings;
  a proxy must not become a second, remote DNS-resolution path around the pin.
- Automatic HTTP redirects are disabled. Pagination links and polling targets
  may not escape the approved origin/path boundary and are DNS-authorized and
  pinned again immediately before every continuation dispatch.
- Connector credentials and default headers are encrypted at rest; operation
  contracts remain secret-free.
- Offline workbench fixtures accept only operator-confirmed synthetic data,
  encrypt input and response content at rest, and bind it to the exact draft
  hash. Replays use the canonical response mapper without transport and write
  only secret-free authoring evidence. Fixture runs are never eligible as
  publication evidence or productive responses.
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
- Published revisions, full contract and input-schema hashes, Playbook pins,
  Agent deployment bindings, owner authority, and environment bindings are verified
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
- `2026_08_29_000006_create_api_connector_operation_fixtures.php`

Playbook capabilities bind exact published operation revisions. Each deployed
capability carries the revision ID, full contract hash, input-schema hash, and
environment binding. Verify read, confirmed write, error, partial, and
unknown/reconciliation paths in staging before serving customer traffic.

Connector usage inspection is deliberately read-only and scans current
semantic Playbook references without compiling or executing a workflow. Only
published operation revisions with exact contract pins count as executable
references; unpinned connector snapshots are not a supported authoring or
runtime format.
