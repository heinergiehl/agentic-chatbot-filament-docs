# Integration Studio

Integration Studio turns an OpenAPI document, Postman Collection, or pasted
cURL request into reviewed API connection and Operation drafts. It is a guided
authoring assistant, not a second execution runtime: productive calls still
require immutable publication, an Agent Version, the tool
gateway, confirmation, idempotency, and reconciliation path.

## Operator Flow

Open **Agentic Chatbot > Connect > Tools & data** (API connections) and choose **Import
integration**.

1. **Source** uploads or pastes OpenAPI 3.x JSON/YAML, Postman Collection
   v2.0/v2.1 JSON, or one cURL request.
2. **Operations** starts with the largest supported authentication group
   selected and keeps between 1 and 50 operations with one exact compatible
   authentication contract. Import other groups as separate API connections.
3. **AI assistant** optionally improves only customer-facing names,
   descriptions, intent examples, and synthetic test input. Choose **Generate
   suggestions** to send one request to the selected central provider; **Next**
   keeps the current wording and never calls AI.
4. **Drafts** sets Agent/global scope and the imported service's
   encrypted credential.
5. **Review** shows destinations, input and response schemas, effects and the
   planned publication state. It requires explicit approval of that exact plan.

By default installation creates inactive, unpublished Tool drafts. An operator
must explicitly classify each read as retrieval without side effects and record
the provider contract review basis. Unreviewed or ambiguous operations are WRITE
Drafts, including GET requests. Neither HTTP methods, tool names nor discovery
hints prove the absence of side effects.

A reviewed read is eligible only when the import also classifies it as read.
Reviewing POST, PUT, PATCH or DELETE as read produces an ambiguous write Draft.
The single-Tool Save and enable action permits HTTP GET, HEAD and OPTIONS only;
other HTTP methods use the tested Publish flow. MCP reads keep their separately
reviewed effect even though the MCP transport uses POST.

A publisher may select **Save and enable reviewed reads**. One transaction
validates every reviewed READ, publishes an immutable revision with accountable
review evidence, enables those Tools and enables the new Connection. WRITES
remain inactive Drafts and require their existing staging tests and Publish.
Three reviewed reads and one write therefore create three published reads and
one write Draft. Installation never contacts the imported API or changes a live
Agent. Publish the Agent separately to pin the Tools.

The preview validates each reviewed read for publication and shows readiness or
a blocking result beside that Tool. A blocked read refuses the entire enablement
batch. Preview and success results show enabled-read and remaining-Draft counts.
Existing Connections, including Connections created by Studio, accept subsequent
imports with distinct installation keys and Tool keys. Installation-key
uniqueness still serializes duplicate submissions. Preview rejects Tool keys
already used in the selected Connection with a message on each colliding row.
An exact replay of a completed installation returns its existing result.
Database concurrency failures during read publication retry the whole transaction
up to three times; exhausted retries leave no partial installation.

Read review fingerprints bind destination, authentication identity and credential
fingerprint, scope, allowed methods and paths, TLS verification, active state and
staging bindings. Health checks, encrypted credential re-encoding and OAuth token
refresh bookkeeping do not invalidate the review. Configured credential or
authority changes require a new review.

Configure-only operators must select an existing authorized active Connection
with the exact destination, authentication and Agent scope. Import cannot edit
its credentials or destination, activate it or expand its scope. New Connections
and credentials still require admin permission. Configure-only imports stay
Drafts; a direct attempt to enable them is denied.

Back/Next navigation preserves the parsed source, reviewed wording, and valid
AI provenance. Returning to the source does not require uploading it again;
supplying a new source replaces the drafts. Changing the operation selection
invalidates AI provenance and review approval for the previous selection.

Generation shows pending, success, or recoverable error feedback. Replacing
edited wording or regenerating suggestions requires confirmation. A failed
generation leaves the existing drafts untouched, and **Next** remains available.
Provider/model changes apply only to the next explicit generation; existing
suggestions retain the provider/model authenticated by their AI receipt.

## Developer Tool Providers

Open **Agentic Chatbot > Settings**, then **Developer tool providers** (the page
formerly called Filament Tool Bridge; administrators only), to review functions that
the host Laravel application explicitly registered through
`CapabilityProvider`. The page materializes each declaration through the same
`ActionRegistry` contract validator used at runtime and shows its version,
effect, confirmation rule, gateway idempotency mode, cardinality, schema shape,
and immutable contract hash.

The Bridge is intentionally an inspection and setup surface, not reflection.
It never scans Filament Resources, Eloquent models, controllers, or arbitrary
Actions and cannot make a UI button Agent-callable. Host code must declare the
function and its schemas explicitly; a reviewed Workflow route and Agent
candidate are still required before use. Invalid or duplicate declarations are
shown as blocked and remain unavailable to productive execution.

## Existing AI Keys And Multiple Providers

Integration Studio does not ask for or store a separate LLM API key. Its
provider selector lists only centrally configured providers that have a
verified structured-output model. The selected provider reuses the existing
application-level key such as `GEMINI_API_KEY` or `OPENAI_API_KEY`.

Keeping several provider keys centrally configured is supported and useful
when a host wants provider choice, regional/account separation, or a controlled
migration path. Key entry and rotation remain in the host configuration; the
wizard contains only a provider/model selector and never reveals the key.

The credential entered under **External API authentication** is different: it
belongs to the imported business service. It is stored through the existing
encrypted API connection credential cast and is excluded from AI context, review
HTML, logs, hashes, and immutable installation evidence.

## Deterministic Import Boundary

Import parsing is local and does not execute source content.

- cURL is tokenized as data and is never passed to a shell.
- Remote and local OpenAPI references are rejected; supported local component
  references are resolved within the supplied document.
- Postman scripts, cookies, examples, certificate/file content, and saved
  authentication values are discarded.
- Imported headers, query values, samples, and URLs cannot copy credentials
  into a draft.
- Input is limited to 2 MiB, at most 100 operations are parsed, and at most 50
  compatible operations are installed per API connection.
- The normalized, secret-free manifest is encrypted and authenticated between
  wizard requests. Raw upload/paste state is cleared after parsing and rejected
  by the installer if it reappears.

OpenAPI, Postman, and cURL are import formats, not execution formats. The
deterministic importer produces the same closed package operation contract
regardless of source.

Required and optional OpenAPI query collections preserve their declared serialization:
flat arrays support `form` with either `explode` value and `spaceDelimited` or
`pipeDelimited` with `explode=false`; flat objects support `form` with either
value and `deepObject` with `explode=true`. Compound path/header parameters,
nested query collections, `content`, `allowReserved`, and unsupported styles
produce a specific import diagnostic instead of a request that silently changes
the source semantics. Optional query/header parameters stay optional in the
draft schema and are omitted from the request when absent. An optional whole
request body still needs an explicit body omission mapping and fails import with
a diagnostic instead of being converted to required.
See [Query parameter serialization](API_CONNECTORS.md#query-parameter-serialization).

OpenAPI 3.0 `nullable: true` and OpenAPI 3.1 types such as
`["string", "null"]` are preserved in input and response schemas. Required,
enum and nested schema constraints are retained. Unsupported input compositions
such as `oneOf`, `anyOf` and `allOf`, and other unsupported validation keywords,
remain visible in an inert draft and fail publication with their field path.
Ambiguous multi-type schemas fail import; the importer never chooses a branch
or flattens a composition.
An unsupported response schema is left unset with a visible warning. Supply a
reviewed response schema before testing and publication; an installed draft
does not establish response validation.

Imported operations retain strict literal/enum input policies. Without explicit
read enablement they remain inactive drafts.
Remote descriptions, HTTP methods and tool names do not enable public
interpretation. In the normal Operation workbench, choose the public read review
profile and explicitly review each public field path, including nested children
and array items. The publication preview compares the compiled candidate's field
policies with the current immutable revision, or the strict default for a new
operation. Use **Save and enable** for reviewed READS or the staging test and Publish
flow for WRITES; prior revisions and Agent Versions retain their pins. See
[API connection authoring](API_CONNECTORS.md).

## AI Authority Boundary

The optional assistant receives the selected secret-free operation catalog and
optional product context. Imported descriptions and schemas are explicitly
treated as untrusted data.

AI may propose:

- API connection name and description;
- operation name and description;
- visitor intent examples; and
- schema-valid fictional test input.

AI cannot change:

- base URL, method, path, request mapping, or media type;
- authentication type, placement, or credential;
- read/write classification or confirmation requirement;
- retry, publication, execution, or environment policy; or
- operation identity.

Every suggestion is revalidated deterministically. Invalid test input falls
back to a locally generated schema-valid synthetic value. A server-encrypted AI
receipt binds the imported manifest, selected operations, provider, and model;
client state cannot forge AI provenance in the immutable installation ledger.

## Atomic And Idempotent Installation

The final request is rebuilt from a strict allowlist and planned again on the
server. API connection and operation authorization, Agent assignment authorization,
safe URL policy, credential shape, exact imported authentication, closed
schemas, presentation safety, confirmation, and suggested test input are
checked before mutation.

One transaction creates:

- the new Connection, or a reference to an unchanged existing Connection;
- every Tool draft and the explicitly enabled immutable read revisions; and
- immutable actor-attributed installation evidence.

The idempotency key is bound to the authenticated operator, source manifest,
credential fingerprint, and exact reviewed request. A retry returns the same
API connection. A changed request, different operator, cross-database custom model,
or host model that mutates the approved plan fails closed. A late failure rolls
back every artifact, including already-created read revisions. Read enablement
compares the exact preview fingerprint before mutation and rechecks publication
permission for every Tool and before commit. A changed review, a concurrent edit
or revoked permission rolls back the entire batch. The existing installation
key uniqueness serializes competing submissions; an unchanged retry returns the
same installation and never creates another revision.

## After Installation

For each Tool:

1. inspect its technical request, effect, input schema and response schema;
2. select the fields the Agent may use and finish output mapping and context;
3. use **Save and enable** for a reviewed READ, unless already enabled in the
   reviewed import batch;
4. for a WRITE, finish the write-integrity policy, run the isolated staging test
   and Publish the exact tested draft; and
5. assign the Tool to the Agent draft or pin it in a Workflow, then Publish the
   Agent separately. Tool editing never changes an existing Agent Version.

A WRITE import intentionally remains unpublishable until its complete
write-integrity contract and isolated staging evidence are configured.

Imported operations start with `response.agent_output: "mapped"` and no
selected fields. No provider facts reach the Agent until fields are approved;
an empty selection never falls back to the full response. Approving the whole
selected response is a separate explicit option, suitable only after reviewing
its exposure. See [API connections](API_CONNECTORS.md) for nested records and
the published presentation contract.

### Offline fixture replay

The Operation workbench also supports **Add replay fixture** and **Replay
fixture**. A fixture contains synthetic input plus a synthetic HTTP status,
bounded `Content-Type`/`Retry-After` headers, response body, and expected
classification. Inputs and response content are encrypted at rest and bound to
the exact current draft contract hash.

Replay performs no network request. It resolves the request inputs and runs the
response through the canonical response decoder, outcome classifier, response
schema, JSON path, and output mapping. A changed draft makes the fixture stale
and the replay fails closed. Replay evidence contains only hashes, outcome,
status, stable issue codes, actor identity, and time.

Fixtures are an authoring regression aid only. They are never read by live chat,
never satisfy the real read/staging-WRITE publication gate, and never publish,
activate, confirm, or reconcile an operation. Use synthetic data only; create a
replacement fixture after an intentional contract change.

## Migration And Operations

Run:

```bash
php artisan migrate
```

`2026_08_28_000003_create_integration_studio_installations.php` adds the
optional `api_connector_operations.suggested_test_input` field and the immutable
`api_connector_integration_installations` ledger. Integration Studio checks the
schema before writing and reports a migration requirement instead of partially
installing an integration.

`2026_08_29_000006_create_api_connector_operation_fixtures.php` adds encrypted,
draft-hash-bound synthetic fixtures and the secret-free append-only replay
ledger. Existing API connection publication evidence remains a separate table and
authority.

Provider failures affect only the optional metadata action. Use **Next** to
continue with the current drafts without another AI request. Missing or unsupported
central provider credentials are not replaced by a wizard key field.

See [API connections](API_CONNECTORS.md) for the publication/runtime contract and
[Security and Privacy](SECURITY_AND_PRIVACY.md) for host authorization,
credential, network, and operational responsibilities.
