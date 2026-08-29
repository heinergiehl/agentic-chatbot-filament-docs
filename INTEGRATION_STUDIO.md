# Integration Studio

Integration Studio turns an OpenAPI document, Postman Collection, or pasted
cURL request into reviewed API Connector and Operation drafts. It is a guided
authoring assistant, not a second execution runtime: productive calls still
require the existing test, immutable publication, Agent deployment, capability
gateway, confirmation, idempotency, and reconciliation path.

## Operator Flow

Open **Agentic Chatbot > Connect > API Connectors** and choose **Import
integration**.

1. **Import source** uploads or pastes OpenAPI 3.x JSON/YAML, Postman Collection
   v2.0/v2.1 JSON, or one cURL request.
2. **Choose operations** starts with the largest supported authentication group
   selected and keeps between 1 and 50 operations with one exact compatible
   authentication contract. Import other groups as separate connectors.
3. **AI assistant** optionally improves only customer-facing names,
   descriptions, intent examples, and synthetic test input.
4. **Configure drafts** sets Agent/global scope and the imported service's
   encrypted credential.
5. **Review** shows the exact inactive draft plan and requires explicit
   approval.

Installation creates one inactive, untested connector plus inactive,
unpublished operation drafts in one database transaction. It never contacts
the imported API, activates a connector, creates a revision, publishes a
capability, or changes a live Agent.

## Filament Capability Bridge

Open **Agentic Chatbot > Connect > Capability Bridge** to review functions that
the host Laravel application explicitly registered through
`CapabilityProvider`. The page materializes each declaration through the same
`ActionRegistry` contract validator used at runtime and shows its version,
effect, confirmation rule, gateway idempotency mode, cardinality, schema shape,
and immutable contract hash.

The Bridge is intentionally an inspection and setup surface, not reflection.
It never scans Filament Resources, Eloquent models, controllers, or arbitrary
Actions and cannot make a UI button Agent-callable. Host code must declare the
function and its schemas explicitly; a reviewed Playbook route and Agent
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
encrypted Connector credential cast and is excluded from AI context, review
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
  compatible operations are installed per connector.
- The normalized, secret-free manifest is encrypted and authenticated between
  wizard requests. Raw upload/paste state is cleared after parsing and rejected
  by the installer if it reappears.

OpenAPI, Postman, and cURL are import formats, not execution formats. The
deterministic importer produces the same closed package operation contract
regardless of source.

## AI Authority Boundary

The optional assistant receives the selected secret-free operation catalog and
optional product context. Imported descriptions and schemas are explicitly
treated as untrusted data.

AI may propose:

- connector name and description;
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
server. Connector and operation authorization, Agent assignment authorization,
safe URL policy, credential shape, exact imported authentication, closed
schemas, presentation safety, confirmation, and suggested test input are
checked before mutation.

One transaction creates:

- the inactive connector;
- every inactive operation draft; and
- immutable actor-attributed installation evidence.

The idempotency key is bound to the authenticated operator, source manifest,
credential fingerprint, and exact reviewed request. A retry returns the same
connector. A changed request, different operator, cross-database custom model,
or host model that mutates the approved plan fails closed. A late failure rolls
back every artifact.

## After Installation

For each operation:

1. inspect the locked technical request and editable presentation metadata;
2. finish required write-integrity and result-identity policy;
3. activate the draft only when it is ready to test;
4. review the optional synthetic test input and run the governed read or
   isolated staging WRITE test;
5. publish the exact tested draft as an immutable revision; and
6. deliberately include that revision in the appropriate Agent candidate or
   Playbook, then follow **Publish candidate**, **Test release candidate**, and
   **Make candidate live**.

A WRITE import intentionally remains unpublishable until its complete
write-integrity contract and isolated staging evidence are configured.

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
ledger. Existing Connector publication evidence remains a separate table and
authority.

Provider failures affect only the optional metadata step. Turn AI off to use
the deterministic importer. Missing or unsupported central provider
credentials are not replaced by a wizard key field.

See [API Connectors](API_CONNECTORS.md) for the publication/runtime contract and
[Security and Privacy](SECURITY_AND_PRIVACY.md) for host authorization,
credential, network, and operational responsibilities.
