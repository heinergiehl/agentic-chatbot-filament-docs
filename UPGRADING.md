# Upgrading

This document covers required steps when upgrading between public releases.

## Workflow-only runtime cutover

Every chat now requires exactly one hash-verified live workflow deployment. **Simple Assistant** and **Knowledge Assistant** are the supported starter workflows; they are not alternate runtime modes. Former `runtime.product_mode`, direct Assistant/Knowledge answer paths, and top-level capability planning are removed and ignored.

Before opening chat traffic, classify every existing bot with a signed report and apply only the verified eligible starter migrations:

```bash
php artisan agentic-chatbot:runtime-starter-dry-run --actor="release-operator" --output="storage/app/runtime-starter-report.json"
php artisan agentic-chatbot:runtime-starter-dry-run --verify="storage/app/runtime-starter-report.json"
php artisan agentic-chatbot:runtime-starter-migrate --actor="release-operator" --report="storage/app/runtime-starter-report.json" --output="storage/app/runtime-starter-result.json"
php artisan filament-agentic-chatbot:doctor
```

The report and result paths must be new files. Bots with an existing verified live deployment remain bound to it. Eligible deploymentless bots receive the matching immutable starter; ambiguous or invalid release state blocks without overwrite. Any bot still lacking a verified live deployment is unavailable to widget, API, and channel chat until an operator publishes and activates one.

## Public API cutover

- `FilamentAgenticChatbotPlugin::contentExtractor()`, `textChunker()`, and
  `sourceUrlResolver()` were removed. Bind `ExtractsContent`, `ChunksText`, and
  `ResolvesSourceUrls` in the host application's service provider.
- Capability discovery classes and custom workflow actions now use one
  `CapabilityProvider` implementation tagged with `CapabilityProvider::class`.
  The former registry tag, `capabilities.discovery.providers`, and
  `workflow.actions` extension paths are not public.
- Every `CapabilityActionDefinition` must now provide a non-empty
  `resultSchema` in addition to `requestSchema`. Add a schema matching the
  handler's exact return value; registration fails before chat traffic when
  either contract is missing.
- The legacy `/filament-agentic-chatbot/widget.js` and canonical route aliases
  were removed. Use the named `filament-agentic-chatbot.widget.script` route.
- The complete supported host surface is listed in `docs/PUBLIC_API.md`.

## Configuration cutover

Republish `config/filament-agentic-chatbot.php` and carry forward only the
`config_keys` allowlisted in `docs/PUBLIC_API.md`. Runtime schemas,
dictionaries, planner topology, Eloquent model aliases, `workflow.actions`,
and `workflow.action_schemas` are internal or removed; values copied from an
older published file are ignored. Run
`php artisan filament-agentic-chatbot:doctor` after the update—Doctor fails and
prints an exact instruction for every removed key it detects.

Rename every `AGENTIC_WORKFLOW_GENERATION_*` variable to the matching
`AGENTIC_CHATBOT_WORKFLOW_GENERATION_*` name. Remove the old workflow-turn
planner and write-safety relaxation variables; turn-planner topology and the
write confirmation/schema/integrity baseline are no longer configurable.

Production now defaults Data Resource administration and Filament side-effect reconciliation to strict Gate mode. Register `filament-agentic-chatbot.view-data-resources`, `filament-agentic-chatbot.manage-data-resources`, and `filament-agentic-chatbot.reconcile-side-effects` before operators use those screens. Local and testing environments retain the authenticated-panel-user setup path. Doctor fails production when either surface is relaxed without a registered Gate.

The built-in `query_data_resource` capability result contract is version 2. It removes the concrete `scope_filters_applied` object without adding replacement scope metadata. Republish workflows that use Data Resources so their immutable capability binding pins version 2; do not add a compatibility field carrying scope names or values. Treat this as a maintenance-window cutover: Doctor fails and inventories active deployments that still pin an obsolete action contract.

Data Resource query contracts are now version 3 and pin an estimated-row budget plus a cross-driver statement timeout. Run the package migrations to add `agentic_data_resources.query_safety`, review **Allow text search** and **Database query budget** for every UI-managed resource, then republish workflows that bind those resources. Doctor fails when the migration is missing, an active deployment still pins a stale Data Resource hash, or an active production resource uses a database without supported plan/timeout budgets, so run it before reopening chat traffic. The runtime now rejects PostgreSQL/MySQL/MariaDB plans above that budget before execution; SQLite is limited to local/testing Data Resource queries.

## AgentGraph v0.15.1 runtime adoption

Current source builds require `heiner/agent-graph:^0.15.1`:

```bash
composer update heiner/agent-graph heiner/filament-agentic-chatbot --with-all-dependencies
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

No database migration is required for this SDK patch. Resume acceptance is now recoverable across process loss, queued frontiers can be redriven after dispatch loss, and SDK cancel atomically resolves a pending interrupt. Remove any application-level best-effort interrupt cleanup performed after `AgentGraphManager::cancel()`; duplicate resolution is no longer part of the integration contract.

The plugin Doctor now treats `AgentGraphManager::recover()` as required SDK surface. Existing graph versions and persisted v0.14/v0.15 runs remain readable.

## Current release status

The target Commercial Early Access release is **`v0.17.0`**. The source tree remains a release candidate until the protected release contract is explicitly approved and every protected job passes.

The public line still starts at `v0.9.0-beta.1`. No stable `v1.0` release exists yet. Read [CHANGELOG.md](CHANGELOG.md) and this `UPGRADING.md` before upgrading.

> The git tag `v0.12.0` points to an early preview commit. Do not stay on that tag; after `v0.17.0` is published, install `^0.17` instead.

When upgrading, always:

1. Read the [CHANGELOG.md](CHANGELOG.md) for breaking changes.
2. Run `php artisan filament-agentic-chatbot:doctor` to verify your environment.
3. Run `php artisan migrate` to apply any new migrations.
4. Clear caches: `php artisan config:clear && php artisan view:clear && php artisan route:clear`.
5. Re-publish config if needed: `php artisan vendor:publish --tag=filament-agentic-chatbot-config`.

---

## Upgrading to v0.17.0

### Tokenless browser widget bootstrap

Republish or recopy every browser embed snippet. The loader no longer reads `data-token`; a static token in markup would expire and make a long-lived page fail. Current snippets contain only the public bot and presentation configuration. At runtime the loader calls the origin-checked widget bootstrap endpoint, holds its short-lived token in memory, and renews it before expiration.

Before reopening public widget traffic:

1. add every intended production browser host to each bot's Allowed Domains (an empty production allowlist now blocks bootstrap);
2. set a dedicated `AGENTIC_CHATBOT_WIDGET_SIGNING_KEY`;
3. remove `data-token` from custom snippets and SDK mount options;
4. allow `POST /api/filament-agentic-chatbot/chat/{botPublicId}/bootstrap` through proxies/WAFs; and
5. monitor its independent rate limits and `429` responses.

The browser automatically retries only GET-based config, history, and exact-turn reads after renewal. It never automatically repeats chat sends or other writes.

### Authorized Turn Plan and API Connector v3 cutover

This cutover is irreversible and removes the productive Compound Request
subsystem. Back up the database and use a maintenance window:

```bash
php artisan down
php artisan migrate
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
php artisan up
```

`2026_07_28_000002_cut_over_authorized_turn_plans_and_connector_v3.php`:

- upgrades every non-empty API operation draft to connector contract version 3;
- creates a new immutable v3 revision for each published operation and moves
  the operation's published pointer to it;
- derives a closed literal/enum admission policy per public input, preserves
  declared result identity, and converts legacy batch metadata to bounded
  `batch_mode`;
- clears live pointers to deployments containing removed `compoundRequest`,
  `apiConnector`, or `loop` runtime nodes and cancels their active runs;
- removes `runtime_config.compound_requests`; and
- drops Compound Request tables and the obsolete side-effect foreign key.

Before reopening traffic, inspect every retired workflow, replace `loop` with
`batchMap`, bind API steps to exact published v3 revisions, test the draft, and
republish the workflow. Do not reintroduce an adapter for the old node or
connector contract. Database rollback requires restoring the pre-upgrade
database and application together.

Connector input aliases, normalization, ambiguity rules, and result-identity
checks now belong in the published operation contract. API-specific planner
branches are unsupported. Natural multi-objective read turns are represented by
one release-bound Authorized Entry Turn Plan with ordered tasks and items and
execute inside one AgentGraph-owned workflow run.

### G25 breaking runtime cleanup

This is a deliberately breaking cleanup. Before deploying it, back up the database, rotate every active Bot Access Token created before HMAC hash version 2 from **Connect > Bot Access Tokens**, and verify the replacement token in each server integration. Plaintext tokens are not recoverable from old hashes, so the migration revokes any still-active token whose `token_hash_version` is missing or not `2`.

Use a maintenance window and deploy in this order:

```bash
php artisan down
php artisan migrate
php artisan agentic-chatbot:materialize-workflow-deployments --dry-run
php artisan agentic-chatbot:materialize-workflow-deployments
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
php artisan up
```

The irreversible `2026_07_15_000002_migrate_breaking_runtime_cleanup_data.php` migration performs the durable-data cleanup before old readers disappear. It moves conversation-local workflow memory into `workflow_memories`, moves historical run snapshots into `workflow_runs.workflow_snapshot`, revokes unsupported token hashes, and cancels non-executable legacy planning records. If any prerequisite table or column is missing, the migration fails with an explicit ordering error.

Public configuration and API changes:

| Before | After |
| --- | --- |
| `RAG_*` environment aliases | matching `AGENTIC_CHATBOT_*` variables only |
| runtime-mode environment variables and Bot `product_mode` values | removed; one workflow-only runtime |
| fine-grained runtime enable/engine switches | removed; the verified deployment contract owns executable behavior |
| AgentGraph `workflow_node_id` / `workflow_node_type` metadata | SDK `nodeMeta` only |
| SHA-256 Bot Access Token lookup | HMAC-SHA256 hash version 2 only; rotate before upgrade or the migration revokes it |
| conversation-meta workflow memory | canonical `workflow_memories` rows |
| `WorkflowRun.meta.__workflow_snapshot` | `workflow_runs.workflow_snapshot` |
| top-level planning/interpreter configuration | removed; model-assisted work is declared inside workflow steps |

Prompt-JSON structured output remains available only for provider profiles that declare that transport capability. It is an external provider-format adapter and never grants routing, policy, or execution authority. The protected release matrix continues to test native structured tools, prompt-JSON tools, and restricted no-tools profiles.

After migration, clear cached configuration and run the Doctor again. Old environment names, per-bot modes, and engine switches are ignored rather than translated at request time. A bot without one verified live deployment fails closed. See [G25 Breaking Cleanup Evidence](docs/G25_BREAKING_CLEANUP_EVIDENCE.md) for the candidate-by-candidate migration and verification record.

### Canonical API Connector operation cutover

The unreleased API Connector architecture is deliberately breaking. Back up the database, confirm the production `APP_KEY`, and rehearse the complete migration on a production-shaped staging copy before the maintenance window. The cutover has no `down()` implementation; rollback means restoring both the pre-upgrade application and database.

Run the release in this order:

```bash
php artisan down
php artisan migrate
php artisan agentic-chatbot:materialize-workflow-deployments --dry-run
php artisan agentic-chatbot:materialize-workflow-deployments
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
php artisan up
```

`2026_07_15_000003_cut_over_api_connector_operation_contracts.php` builds the one `filament-agentic-chatbot.connector-operation` version `2` draft, creates immutable published revisions where needed, assigns published pointers, upgrades compatible API-operation conflict checks to exact revision/hash references, verifies hashes, and drops legacy operation/revision fields. It aborts on invalid JSON or shape, missing or mismatched parents, ambiguous/unresolvable conflict operations, and incompatible scopes. It does not silently select a target or leave a supported lossy contract. Fix the pre-cutover source data and retry the rehearsed migration.

The version-2 contract now closes every server-owned nested object, not only the document root and `auth`. Unknown request/response/effect/execution, retry, metadata/capability, or write-integrity fields are invalid. Request/response payload schemas are closed to the constraints the runtime enforces; provider templates, mappings, and registered strategy policy objects remain extensible. Static credentials in serialized bodies, schema value keywords or annotations, capability presentation, or extensible policies block draft persistence, publication, and cutover. Capability metadata is reconstructed from the operation record, so remove any application code that stored custom or credential-bearing values below `metadata`; keep secrets in encrypted connector authentication configuration instead.

Base URLs must now be absolute HTTP(S) URLs without userinfo, query, fragment, or surrounding whitespace before the model can save. Move fixed query values into operation `query_params`/`query_pairs`; keep provider credentials in encrypted connector authentication. The cutover aborts on structurally unsafe legacy base URLs without echoing their value. Custom authentication can no longer replace a server-generated provider idempotency header: unsafe write retries and continuation requests require the exact server-attested header/key pair after authentication.

The follow-up migrations are also required:

- `2026_07_15_000004_create_api_connector_continuations_table.php` creates the encrypted, leased, bounded continuation journal. It is not a queue or scheduler; polling and pagination remain inside the owning connector invocation, while AgentGraph retains workflow wait/resume authority.
- `2026_07_15_000005_create_api_connector_operation_test_runs_table.php` stores bounded draft/published test evidence without making a draft productively executable.
- `2026_07_15_000006_harden_side_effect_execution_journal.php` encrypts side-effect request, result, and metadata payloads, clears the legacy plaintext JSON columns, and adds hashed lease-token fencing.

Public contract and configuration changes:

| Before | After |
| --- | --- |
| Mutable operation columns or a V1 adapter | one canonical draft plus immutable version-2 revisions |
| Workflow/deployment operation snapshot | exact `apiOperationRevisionId` + `apiOperationContractHash` + `apiOperationInputSchemaHash` + server-generated `environmentBinding`; runtime re-resolves and materializes the revision at every dispatch |
| planner/tool metadata at `metadata.label`, `description`, or `intent_examples` | `metadata.capability.label`, `.description`, and `.intent_examples` |
| provider JSON or legacy success/error projection | one `filament-agentic-chatbot.connector-result` version `2` envelope for every consumer |
| raw `compound_requests.api_connectors.capabilities` definitions | removed; publish connector v3 input/capability metadata and bind the exact revision in a workflow |
| `AGENTIC_CHATBOT_GOOGLE_CALENDAR_COMPOUND_CAPABILITY_ENABLED` | no replacement flag; publish the operation and allow its generated `api_operation_<operation-id>` key |
| owner identity from input, model output, workflow variables, or persisted plans | transient server-attested runtime authority only; missing/mismatched authority fails closed |

Legacy workflow nodes and immutable deployments are not silently rewritten. For every affected node, select the published operation revision and republish the workflow. The node stores the exact revision ID, full contract hash, closed input-schema hash, server-generated environment binding, and flow-owned input mapping/output/failure settings. HTTP method, executable URL, headers, credentials, retry, response mapping, and write policy come only from the verified revision. Old `__operationSnapshot` data and executable node overrides are not authority.

The API Connector edit page now inventories these persisted references without compiling workflows. Legacy `connectorId` nodes are listed as **Migration required** instead of breaking connector administration, but they are never executed or treated as valid pins. Create or publish the intended operation, select its immutable revision in each listed workflow, test the draft, and republish. The read-only legacy diagnostic is removed only after the upgrade inventory reaches zero unpinned references.

Every write operation must require confirmation and declare an explicit integrity mode, scope, and typed canonical `input.*` business identity when duplicates are not allowed. Unknown or expired writes are never automatically reclaimed or retried. Verify the provider outcome out of band, then use `php artisan filament-agentic-chatbot:reconcile-side-effect <id> --outcome=succeeded|failed --force --reason="..." --operator="..."`; reconciliation records the result and never dispatches the write.

For the supported Google Calendar example, provide OAuth values through `AGENTIC_CHATBOT_GOOGLE_CALENDAR_CLIENT_ID`, `AGENTIC_CHATBOT_GOOGLE_CALENDAR_CLIENT_SECRET`, and `AGENTIC_CHATBOT_GOOGLE_CALENDAR_REFRESH_TOKEN` (or the optional access-token variable), then run:

```bash
php artisan filament-agentic-chatbot:setup-google-calendar-connector \
  --bot=<bot-public-id> \
  --calendar=primary \
  --prompt-secrets
```

The command creates or updates the OAuth connector and publishes the canonical confirmation-required `create_google_calendar_event` operation. Before customer traffic, verify a read success, confirmed write, provider error, partial result, owner-scope denial, stale pin, `unknown` write, and operator reconciliation path in staging. See [API Connectors](docs/API_CONNECTORS.md).

### Calibrated retrieval strategy and versioned indexes

Retrieval now uses one explicit `vector`, `hybrid`, or `lexical_only` strategy and returns typed evidence/status contracts. The old `vector.chroma.allow_threshold_bypass` and `retrieval.hybrid.lexical_strategy` compatibility settings are removed. Merge the new `retrieval` config block, run migrations to create the PostgreSQL lexical GIN index, and re-ingest all sources so chunks receive the active `retrieval.index_version` plus embedding provider/model/dimensions. Unstamped or incompatible chunks fail closed by design.

Production defaults use vector-only retrieval. Hybrid and lexical-only installs must select a named calibration profile and run:

```bash
composer eval:retrieval-quality
```

The shipped `de_en_v1` profile is tied to `evals/retrieval/de_en_v1.php`; do not reuse its thresholds as universal lexical weights for a different corpus. PostgreSQL FTS has a candidate limit, transaction-local statement timeout, and required index. `simple_like` now requires an explicit index declaration or bounded small-dataset opt-in. The optional reranker is disabled until a provider/model with verified reranking capability and explicit candidate/input-token budgets is configured.

Retrieval context now consumes the G19 token budget, not a character limit. Traces record only a query fingerprint plus strategy/index/stage metadata. If retrieval is attempted but evidence is insufficient, the assistant and response composer abstain instead of presenting a model-generated answer as grounded.

### Token-aware pure context compilation

Runtime V2 context budgets now use model-relevant tokens instead of characters. If the host publishes the package config or sets context-budget environment variables, replace `RUNTIME_V2_CONTEXT_*_CHARACTERS` with the corresponding `RUNTIME_V2_CONTEXT_*_TOKENS` values and merge the new `runtime.v2.context_pack.total_tokens` / `lane_tokens` config. The old character keys are not a second fallback budget path.

Chat and recall requests no longer backfill historical workflow-run memory. After deploying this change, run a bounded explicit repair if legacy conversations need those projections:

```bash
php artisan filament-agentic-chatbot:repair-conversation-memory --limit=100
```

The command is idempotent and can also target one conversation with `--conversation=<id>`. If more bulk candidates remain, continue with the printed `--after=<last-id>` cursor. No database migration is required for this cutover.

### API connector auth and policy services

`ApiConnector` no longer exposes runtime authentication, HTTP, header/URL policy, or credential-form helpers. Replace direct model helper calls with `ConnectorCredentialService`, or with `ConnectorAccessPolicy` plus `ConnectorDefinition::fromConnector($connector)`. Use `ConnectorCredentials::fromConnector($connector)` only when an integration explicitly needs credential values; its debug and serialized forms are redacted.

This is a PHP API migration only; no database migration is required. OAuth refresh now uses a per-connector/owner single-flight lock, compares the current credential fingerprint before write, and stores access-token plus refresh-token rotation atomically. Automatic OAuth refresh does not advance the environment binding. Operator changes to authentication configuration/credentials or default headers do advance the binding version; with the default `requires_republish` policy, republish affected workflows. Even under `allow_without_republish`, the new secret-free binding hash/version changes the request-authority fingerprint, so an earlier confirmation or side-effect grant cannot authorize the changed environment.

Update connector request configuration through eventful model/service writes. Those writes use an optimistic binding-version compare-and-set and reject stale editors. Direct query-builder updates and `saveQuietly()` are unsupported for connector configuration; the internally row-locked automatic OAuth token refresh is the sole intentional quiet credential write.

Multipart request artifact references now require a valid `sha256` value. Existing integrations that supplied only `disk` and `path` must calculate and include the digest before planning; dispatch rechecks the exact bytes and fails closed if they changed.

### Deployment-only workflow runtime cutover

Published workflows now execute only from an immutable `AgentWorkflowDeployment`. The runtime no longer compiles `agent_workflows.workflow_data`, selects the latest deployment implicitly, writes new snapshots into run metadata, or resumes a snapshotless historical run against the current live graph.

Use a maintenance window and run the cutover in this order:

```bash
php artisan down
php artisan migrate
php artisan agentic-chatbot:materialize-workflow-deployments --dry-run
php artisan agentic-chatbot:materialize-workflow-deployments
php artisan filament-agentic-chatbot:doctor
php artisan up
```

The materialization command is the only compatibility bridge. It creates immutable artifacts for existing workflow versions and sets each published workflow's concrete `active_deployment_id`. The dry run performs the same contract validation inside a rolled-back transaction, and the real cutover is atomic: one invalid legacy version reports its workflow/version context and leaves no partial upgrade state. The command is never invoked by a chat request. Active workflows with a missing pointer, missing artifact, corrupt hash, or incomplete `workflow_runs` deployment columns fail closed with an operator-facing diagnostic.

New workflow runs persist `agent_workflow_deployment_id`, `deployment_hash`, `runtime_schema_version`, and `workflow_snapshot`. Rollback selects the exact existing historical deployment hash atomically; it does not recompile the old authoring payload. Editor draft tests and trace replays use separately identified immutable `editor_preview` deployments and never change the live deployment pointer.

Sub-workflow nodes are also deployment-bound after `2026_07_12_000002_pin_subworkflow_deployments.php`. Republish or rerun the materialization command after migrating: each parent artifact records the exact direct and transitive child deployment IDs/hashes, includes the sorted closure in its own hash, and protects referenced child artifacts from deletion. Runtime compilation never resolves a newer child workflow implicitly.

`2026_07_12_000003_add_subworkflow_dependency_contracts.php` completes that boundary with hashed input/output schemas and mappings. Parent manifests aggregate namespaced child capabilities, write effects, confirmation requirements, and policy metadata; Runtime V2 grants identify both the parent and effective child deployment. Child state is isolated by default and only declared output mappings cross back into the parent. Parent publication fails if a transitive child write has no complete payload schema. Run the materialization command again after this migration so existing parent deployments receive the complete contract closure.

Runtime behavior no longer has a mode selector. New and upgraded installs use the same workflow-only entry path, and no request-time setting can enable a deploymentless answer or escape a closed workflow contract. Removed runtime aliases and top-level planner classes have no productive replacement; place model-assisted interpretation and capability work inside explicit workflow steps.

The workflow runtime now validates `date` inputs and `date` validation rules as canonical `YYYY-MM-DD` only. If a workflow currently expects natural-language dates such as "tomorrow", "next Friday", or locale-specific date strings, normalize them with semantic extraction or a transform step before they reach deterministic validation.

Money validation is available as a validation rule (`money`, `money:EUR`, `money:USD`, `money:GBP`) rather than as a separate `inputType`.

Data Resource identity scopes are now fail-closed and request-attested. Remove `actor`, `tenant`, `token`, and `conversation` values from `data_resources.scope_values` and bot `runtime_config.data_resources.scope_values`; those reserved namespaces are intentionally ignored. Authenticated actor and Bot Access Token context is attached automatically. Tenant-aware hosts must set `RuntimeAuthorityContextFactory::TENANT_REQUEST_ATTRIBUTE` from trusted Laravel middleware on every chat/resume request. Do not copy tenant or identity values from request input, model output, workflow variables, or checkpoints. Also verify any custom Eloquent `$appends` assumptions: Data Resource results now contain only fields in the resolved select allow-list.

A new migration is required. `2026_07_09_000001_create_bot_chat_turns_table.php` adds the durable chat-turn ledger used for per-conversation serialization, workflow/deployment pinning, request idempotency, unknown-outcome protection, and exact JSON/SSE response replay. Run `php artisan migrate` before directing chat traffic to the upgraded application; the new runtime intentionally fails rather than silently executing without its ledger.

The follow-up migration `2026_07_09_000002_add_reconciliation_to_bot_chat_turns_table.php` adds explicit operator reconciliation fields for installations that already ran an earlier development build of the ledger migration. If the doctor reports an unknown or expired chat turn, verify its external outcome first, then use `php artisan filament-agentic-chatbot:reconcile-chat-turn <id> --force --reason="..." --operator="..."`. The command only abandons and unlocks the turn; it never retries it. See [Operations](docs/OPERATIONS.md#durable-chat-turn-reconciliation).

`2026_07_09_000003_encrypt_api_connector_default_headers.php` encrypts existing API Connector default headers with the Laravel `APP_KEY`; back up the database and confirm the production key before migrating. Its earlier named-operation snapshot behavior is superseded by the canonical operation cutover above: current productive execution uses exact immutable revision, full-contract, input-schema, and environment pins and re-resolves the revision at dispatch. Republish a workflow intentionally after publishing a replacement operation revision; connector credentials and other connector-level secrets remain live encrypted configuration.

`2026_07_09_000004_add_reconciliation_to_bot_side_effect_executions_table.php` adds the audited outcome fields required for ambiguous external writes. When doctor reports an unknown side effect, verify the provider result out of band and run `php artisan filament-agentic-chatbot:reconcile-side-effect <id> --outcome=succeeded|failed --force --reason="..." --operator="..."`. This records the verified outcome and never dispatches the write again.

Top-level compound execution has been removed. Express multi-step work through published workflow steps and their explicit capability contracts.

API clients should send a stable `client_turn_id` in the JSON body or an `Idempotency-Key` header and reuse it only when retrying the same request. The server generates an ID when omitted, but a caller cannot receive retry deduplication unless it reuses the returned `X-Chat-Turn-Id`. Telegram and Slack channel deliveries derive this ID automatically from their provider message identity. Existing conversation history is not backfilled; durable tracking begins with the first turn after migration.

---

## Upgrading to v0.16.1

Run `composer update heiner/filament-agentic-chatbot --with-dependencies` from a `^0.16.1` constraint, or install the exact marketplace version you receive.

This patch release keeps the v0.16 runtime and database contracts unchanged. It fixes default `sendMessage` workflow nodes after internal action/tool steps so an inherited `internal` visibility flag cannot hide the final user-facing workflow response.

After deployment:

1. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
2. Run `php artisan filament-agentic-chatbot:doctor`.
3. Smoke-test one active workflow that sends a default/plain `sendMessage` after an internal action, tool, or AgentGraph-backed step.

No new migration is required when upgrading from `v0.16.0`.

---

## Upgrading to v0.16.0

Run `composer update heiner/filament-agentic-chatbot --with-dependencies` from a `^0.16.0` constraint, or install the exact marketplace version you receive.

This release adds structured Compound Request planning/execution, workflow turn-understanding hardening, schema-v2 structured form preservation, and additional database constraints for pending conversation state. The default compound engine is `structured`; use `shadow` to audit generated structured plans before enabling execution for a cautious production rollout.

The mode and shadow settings in this historical v0.16.0 procedure were removed by the current workflow-only cutover. Do not carry them into the current published config; follow [Workflow-only runtime cutover](#workflow-only-runtime-cutover) instead.

After deployment:

1. Run `php artisan migrate`.
2. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
3. Run `php artisan filament-agentic-chatbot:doctor`.
4. Re-publish and merge the then-current config if you maintain an installation that remains on v0.16.0.
5. Run the v0.16.0 workflow-turn and multi-item evaluation scripts with provider credentials in staging.
6. Verify one pending workflow input, one interruption/replacement turn, one read-only multi-item workflow node, and one write-confirmation workflow path before public rollout.

MySQL/MariaDB installs receive generated-column unique guards for one pending interaction/request per conversation. PostgreSQL and SQLite keep the existing partial unique indexes.

---

## Upgrading to v0.15.0

Run `composer update heiner/filament-agentic-chatbot --with-dependencies` from a `^0.15.0` constraint, or install the exact marketplace version you receive.

This release focuses on guided Data Resource administration, safer live database-answer defaults, complete readiness/localization coverage, and stricter release gates. No special destructive migration step is required, but run migrations normally and verify live data-answer policies in staging.

After deployment:

1. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
2. Run `php artisan filament-agentic-chatbot:doctor`.
3. Review **Connect > Data Resources** and confirm returned fields, filters, sorting, limits, and runtime safety scopes.
4. Open each production bot and approve only the Data Resources it should use.
5. Verify one workflow `query_data_resource` path and one normal widget/API answer.
6. Run channel diagnostics again if Telegram or Slack channels are part of the rollout.

If you need explicit production role separation for Data Resource administration, enable strict Gate mode with `AGENTIC_CHATBOT_DATA_RESOURCE_AUTHORIZATION_REQUIRE_GATES=true` and define the Data Resource view/manage Gates before opening the panel to operators.

---

## Upgrading to v0.14.0

Run `composer update heiner/filament-agentic-chatbot --with-dependencies` from a `^0.14.0` constraint, or install the exact marketplace version you receive.

Run migrations after updating. This release adds the Quality Loop, handoff, assistant profile, Bot Access Token hardening, API connector hardening, and legacy RAG database-object normalization migrations. The migration set is intended to preserve compatibility, but it touches old RAG-era names, indexes, and workflow variables, so take a production database backup and verify the upgrade in staging first.

If Filament assets are cached in deployment, run:

```bash
php artisan filament:assets
```

After deployment:

1. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
2. Run `php artisan filament-agentic-chatbot:doctor`.
3. Verify one normal knowledge answer and one widget/API request.
4. Verify one workflow draft, publish, and test run.
5. Verify one saved quality scenario and review any generated fix suggestions.
6. Verify one handoff review path if operators will use human escalation.
7. Review Bot Access Token scopes, pricing entries for cost budgets, widget signing posture, domain allowlists, workflow trace privacy, and API connector safety warnings.

The workflow editor assets were rebuilt around shadcn-style primitives and Tailwind `fac` prefixing. Host apps with aggressive asset caches should publish fresh assets and clear browser/CDN caches for the Filament panel.

---

## Commercial hardening compatibility window

This line adds stricter production controls without breaking older embeds by default. If you published the config file, merge these keys:

- `widget.signing.allow_query_tokens`
- `widget.signing.allow_body_tokens`
- `widget.allow_all_domains`
- `ingestion.max_fetch_bytes`
- `ingestion.max_redirects`
- `ingestion.allowed_content_types`
- `bot_access_tokens.last_used_throttle_minutes`
- `bot_access_tokens.accept_authorization_bearer`
- `bot_access_tokens.bearer_prefix_required`
- `bot_access_tokens.invalid_attempts_per_minute`
- `bot_access_tokens.allow_unscoped_legacy_conversations`
- `bot_access_tokens.hash_key`
- `data_resources.authorization.require_gates`

Recommended production posture:

```env
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_QUERY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_BODY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_ALLOW_ALL_DOMAINS=false
AGENTIC_CHATBOT_INGESTION_MAX_FETCH_BYTES=5242880
AGENTIC_CHATBOT_INGESTION_MAX_REDIRECTS=3
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_LAST_USED_THROTTLE_MINUTES=5
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_BEARER_PREFIX_REQUIRED=true
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_INVALID_ATTEMPTS_PER_MINUTE=10
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_ALLOW_UNSCOPED_LEGACY_CONVERSATIONS=false
```

Notes:

- Widget query/body token support and empty domain allowlists are compatibility bridges. Move browser embeds to the `X-filament-agentic-chatbot-Token` header and configure exact bot domains.
- `AGENTIC_CHATBOT_INGESTION_MAX_FETCH_BYTES` is now enforced before materialization and cumulatively across a URL redirect chain or all pages of one API-source fetch. Raise it deliberately if a trusted source legitimately needs a larger total response budget.
- `/api/filament-agentic-chatbot/chat/{botPublicId}/config` now includes additive `bot.knowledge_health`. Existing keys are unchanged.
- The built-in `bots` data resource is scoped to the current bot by default. Override it in the host app only if a global bot catalog is intentional.
- Data Resource admin now supports optional strict Gate mode through `AGENTIC_CHATBOT_DATA_RESOURCE_AUTHORIZATION_REQUIRE_GATES=true`. Define `filament-agentic-chatbot.view-data-resources` and `filament-agentic-chatbot.manage-data-resources` Gates when you need production role separation.
- UI-managed Data Resources no longer fall back to every returnable field when no default field is selected. They use answer-ready fields first, then one safe returnable field. Runtime safety scope filters can protect ownership columns without exposing those columns as normal workflow filters.
- URL ingestion now rejects oversized responses, unsupported content types, unsafe redirects, and private/reserved IP targets by default.
- Chroma threshold bypass was off by default in this historical compatibility window and is removed by the current G21 retrieval contract.

Run `php artisan filament-agentic-chatbot:doctor` after deploying. New warnings identify production posture issues before these compatibility defaults become stricter in a future release.

---

## Bot Access Token hardening

Releases that include Bot Access Token hardening keep the Filament admin usable by default: authenticated panel users can view and manage Bot Access Tokens unless you opt into stricter authorization. For production role separation, define Gates for panel users that may view or manage tokens:

```php
use Illuminate\Support\Facades\Gate;

Gate::define('filament-agentic-chatbot.view-bot-access-tokens', fn ($user) => $user->canReviewIntegrations());
Gate::define('filament-agentic-chatbot.manage-bot-access-tokens', fn ($user) => $user->canManageIntegrations());
```

Once a Bot Access Token Gate is defined, token administration becomes explicitly gated: the view Gate controls navigation/read access, an allowed manage Gate also grants read access, and the manage Gate controls create/edit/rotate/revoke/delete actions. The ability names can be changed in `filament-agentic-chatbot.bot_access_tokens.authorization`.

If you want the resource to deny access until Gates exist, set:

```env
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_AUTHORIZATION_REQUIRE_GATES=true
```

Disabling the authorization block is supported for legacy apps, but production hosts should keep it enabled and use Gates or strict gate mode where admin role separation matters.

Run migrations after updating. Budget columns are widened for large UI values, a new reservation table is added for hard monthly budget checks, conversations gain Bot Access Token owner/channel scope columns, and tokens gain a hash-version column for HMAC-SHA256. Cost budgets now require matching `usage.pricing` entries for the resolved provider/model; missing pricing blocks the request with `ai_cost_budget_pricing_missing` instead of allowing an unenforceable cost budget.

At the time of the original token-hardening release, SHA-256 token hashes remained valid until rotation. The current G25 breaking cleanup supersedes that window: rotate them before upgrading or the cutover migration revokes them. Existing unscoped conversations are not readable by Bot Access Tokens by default; temporarily enable `AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_ALLOW_UNSCOPED_LEGACY_CONVERSATIONS=true` only if you need a short persistence-migration window for active sessions.

---

## Data Resource hardening

Releases that include Data Resource hardening keep the Filament admin usable by default: authenticated panel users can view and manage Data Resources unless you opt into stricter authorization. For production role separation, define Gates for panel users that may view or manage approved live data access:

```php
use Illuminate\Support\Facades\Gate;

Gate::define('filament-agentic-chatbot.view-data-resources', fn ($user) => $user->canReviewDataResources());
Gate::define('filament-agentic-chatbot.manage-data-resources', fn ($user) => $user->canManageDataResources());
```

Once either Data Resource Gate is defined, administration becomes explicitly gated: the view Gate controls navigation/read access, an allowed manage Gate also grants read access, and the manage Gate controls create/edit/delete/sync actions. The ability names can be changed in `filament-agentic-chatbot.data_resources.authorization`.

If you want the resource to deny access until Gates exist, set:

```env
AGENTIC_CHATBOT_DATA_RESOURCE_AUTHORIZATION_REQUIRE_GATES=true
```

Review UI-managed resources after updating. Resources without an explicit default returned field now expose only one safe default field instead of every returnable field, and runtime safety scope filters remain active even when their ownership columns are not visitor-filterable fields.

---

## Upgrading to v0.13.0

Run `composer update heiner/filament-agentic-chatbot --with-dependencies` so Composer also installs `heiner/agent-graph`. Do not add a custom root `repositories` entry for AgentGraph in production.

Run migrations after updating. This release adds an **irreversible cutover migration** that cancels in-flight legacy workflow runs (`running`, `halted`, `delayed`) that never started on AgentGraph. Plan a short maintenance window if you depend on long-lived paused workflows.

If you already published the config file, merge or re-publish these keys:

- `chat.assistant_graph`
- `workflow.turn_planner`, `workflow.input_interruption`, `workflow.choice_resolution`, `workflow.turn_router`, `workflow.store_submission`
- `data_resources.smart_queries`

The legacy `chat.parent_agent.*` config tree and `PARENT_AGENT_*` environment fallbacks have been removed. Move any local overrides to `chat.assistant_graph.*` / `AGENTIC_CHATBOT_ASSISTANT_GRAPH_*`.

After deployment:

1. Run `php artisan filament:assets` if your deploy process caches Filament package assets.
2. Clear caches.
3. Run `php artisan filament-agentic-chatbot:doctor`.
4. Test one normal knowledge answer, one halted Collect Input / Confirmation workflow, and any Smart Data Query workflow you rely on.

For marketplace production hosts with `AGENTIC_CHATBOT_COMMERCIAL_MODE=true`, also set `AGENTIC_CHATBOT_WIDGET_SIGNING_KEY`, `AGENTIC_CHATBOT_ANYSTACK_ID`, `AGENTIC_CHATBOT_DOCS_URL`, and `AGENTIC_CHATBOT_SUPPORT_EMAIL` before launch.

---

## Upgrading to v0.12.0

Do **not** target `v0.12.0` for new installs. Use [Upgrading to v0.16.1](#upgrading-to-v0161) instead.

The `v0.12.0` documentation below is kept for historical context on features that shipped in the `0.13.0` line:

Run migrations after updating. The planned `0.12.0` line extended the workflow run status vocabulary with `cancelled` and introduced agent-first chat configuration keys.

If you already published the config file, merge the `chat.assistant_graph`, `workflow.input_interruption`, `workflow.choice_resolution`, `workflow.turn_router`, `workflow.store_submission`, and `data_resources.smart_queries` keys or re-publish the package config and apply your local overrides again.

---

## Upgrading to v0.11.1

v0.11.1 is a patch release on top of v0.11.0. It does not add new migrations.

Upgrade for workflow editor UI polish, clearer workflow release-status copy, workflow-list default filter behavior, and refreshed release documentation. If Filament assets are cached in your deployment process, run `php artisan filament:assets` after updating.

---

## Upgrading to v0.11.0

Run migrations after updating. v0.11.0 adds package-owned Telegram/Slack channel tables and workflow memory storage.

If you plan to use Telegram or Slack channels, create one Bot Access Token per channel, create a Channel connection for the bot, configure provider credentials, set a public HTTPS webhook URL, and run channel diagnostics before sending production traffic. Production installs should run a real queue worker for inbound webhook processing and channel activity indicators.

If you already published the config file, merge the new `channels` and workflow image transport configuration keys or re-publish the package config and apply your local overrides again.

---

## Upgrading to v0.10.0

Run migrations after updating. v0.10.0 adds optional Bot Access Token ownership and channel columns used for admin filtering and AI usage reporting.

If you already published the config file, add the new `bot_access_tokens` config block manually or re-publish the package config and merge your local changes. Configure `owner_types` only when your app wants token ownership assignment in the admin UI; the package does not create users, teams, or tenants.

---

## Migration note for users who installed before v0.9.4 release

Three migration files were renamed to fix duplicate sequence-number prefixes:

| Old filename                                                           | New filename                                                           |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `2026_04_02_000004_ensure_workflow_runs_has_workflow_snapshot.php`     | `2026_04_02_000005_ensure_workflow_runs_has_workflow_snapshot.php`     |
| `2026_04_02_000005_add_findings_to_workflow_generation_runs_table.php` | `2026_04_02_000006_add_findings_to_workflow_generation_runs_table.php` |
| `2026_04_02_000005_add_node_traces_to_workflow_runs_table.php`         | `2026_04_02_000007_add_node_traces_to_workflow_runs_table.php`         |

If you installed an earlier build, running `php artisan migrate` after upgrading may attempt to re-run these three migrations under their new filenames. All three are fully idempotent (they use `hasColumn`/`hasTable` guards) so re-running them is safe and causes no data changes. You can verify the current migration status with `php artisan migrate:status`.
