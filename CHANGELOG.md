# Changelog

All notable changes to this package will be documented in this file.

## [Unreleased]

### Added

- Added an evidence-backed conversation-outcome ledger with encrypted evidence references, immutable Agent/Playbook attribution, source-scoped idempotency, an after-commit event, and a supported host recording contract.
- Added automatic human-handoff outcomes, authorized operator recording from Conversation Review, and an Agent Analytics Outcomes tab with explicit success, handoff, and currency-safe attributed-value reporting.
- Added app-aware Solution Kits with a strict versioned provider contract, atomic/idempotent draft installation, immutable actor-attributed evidence, verified model and mapping selection, and an Agent Overview release path.
- Added the built-in Customer Support & Human Handoff Kit with optional approved app reads, a visitor-confirmed handoff Playbook, blocking current-draft quality coverage, widget copy, and outcome goals.
- Added a full-page Integration Studio that deterministically imports OpenAPI 3.x JSON/YAML, Postman Collection v2, or pasted cURL into reviewed inactive API Connector and Operation drafts without executing source content or contacting the service.
- Added optional AI-assisted connector/operation presentation using only centrally configured verified provider/model profiles. The wizard contains no LLM key field; server-encrypted receipts bind AI provenance while technical request, authentication, effect, confirmation, retry, and execution semantics remain locked.
- Added atomic/idempotent Integration Studio installation with strict authorization, raw-source rejection, credential-free immutable evidence, cross-connection/model-mutation guards, and schema-valid synthetic test-input suggestions that are only prefilled in the later governed test action.
- Added a production Handoff Desk with one-active-case database enforcement, business-hours SLAs, claim/assignment, encrypted internal notes, same-thread operator replies for web/Telegram/Slack, immutable activity, optimistic locking, idempotent actions, safe widget polling, and deterministic Agent pause/handback.
- Added origin-, Agent-, area-, and version-bound signed widget context for server-attested customer and tenant identity, deterministic Data Resource scoping, and encrypted delayed-continuation preservation without accepting browser-supplied authority.
- Added a typed, framework-free widget SDK with idempotent mounting, explicit lifecycle control and events, memory-only context renewal, deterministic cleanup, and safe-read-only credential retry semantics.
- Added typed suggested-message and visible page-context widget APIs plus replay-stable, privacy-minimized `outcome`, `capability`, and `handoff` events. Browser context is encrypted per turn, hash-bound, prompt-isolated, visitor-clearable, and never becomes runtime authority or capability input.
- Added scheduled Published Agent quality scenarios with atomic crash-recoverable claims, centrally configured provider credentials, per-scenario cadence, immutable run evidence, and explicit failure telemetry.
- Added exact candidate-versus-live Quality Lab comparisons with isolated no-write conversations, deterministic failure triage, deployment- and scenario-bound evidence, and optional candidate-activation gates. Knowledge-gap regressions enable the gate automatically.
- Added a high-confidence Knowledge Operations inbox that groups durable knowledge-search fallbacks, encrypts question excerpts and operator notes, creates citation/no-write regression tests, and permits resolution only with an active Knowledge Source plus a current passing Agent run.
- Added verified private chat attachments across the widget and canonical Agent turn, with content detection, model-capability checks, hash-bound idempotency, private storage, budget preflight, SDK support, and scheduled retention cleanup.
- Added production WhatsApp Cloud API, Mailtrap Email, and Mailgun Email channel drivers with guided setup, signed webhooks, text-first replies, provider diagnostics, test sends, and delivery-status ingestion.
- Added secure inbound Telegram, Slack, WhatsApp, Mailtrap, and Mailgun files through one canonical attachment boundary, including bounded provider-host downloads and path-free durable email queue staging.
- Added owner-deletion cleanup so channel connections and force-deleted Agents purge private attachment objects before database cascades remove their ledgers.
- Added a server-attested email presentation contract so email-channel turns produce self-contained asynchronous replies without allowing channel metadata to authorize capabilities or supply tool inputs.

### Changed

- Restored stable Gemini 2.5 Flash-Lite to the verified model selector and capability/pricing catalogs so Integration Studio can use the lowest-cost structured-output model without a host-only override.
- Made Slack and Mailtrap Email real-provider-tested but explicit deployment opt-ins, and kept WhatsApp Cloud API and Mailgun Email fail closed behind separate default-off provider flags until each completes its real-account acceptance run; Telegram remains available by default.
- Hardened the `0.17.0` candidate around the Agent-first production boundary: immutable Knowledge, Connector, Data Resource, and Playbook authority is pinned at publication and runtime drift fails closed.
- Made protected release evidence exact and blocking. Catalog cases must match the executed PHPUnit `test_file::test_method`; calibrated retrieval, real pgvector, live Knowledge citation retention, and the final all-jobs-green aggregator are required release jobs.

### Fixed

- Bound Mailtrap webhook-secret selection to the explicit `inbound_receiving` event type so Email Sending delivery events that also contain `inbox_id` are authenticated with the distinct Sending webhook secret.
- Made advanced Channel Connection JSON validation compile as Laravel rules instead of being evaluated as Filament dependency-injected UI closures, so guided provider connections can be saved reliably.
- Reconciled terminal AgentGraph chat turns before returning `busy`, prevented unmaterialized side-effect success from replaying a fabricated result, and persisted only sources actually cited by an Agent answer.
- Redacted direct Connector results, made Playbook cancellation require explicit re-attested user intent, and moved uploaded Knowledge files to private, ownership-authenticated storage with an explicit migration path.
- Made the irreversible action-review waitpoint migration reconcile pre-existing or partially created indexes idempotently, so a retried production upgrade does not fail on duplicate PostgreSQL relations.
- Made Agent Access Token filter discovery select only scalar filter columns, preventing PostgreSQL `DISTINCT` failures on JSON-backed token metadata.

### Migration

- Added `2026_08_28_000001_create_bot_conversation_outcomes_table.php`. Existing history is not inferred or backfilled; run migrations before recording outcomes.
- Added `2026_08_28_000002_create_agent_solution_kit_installations_table.php`. Existing Agents are not changed; run migrations before using the Solution Kit wizard.
- Added `2026_08_28_000003_create_integration_studio_installations.php`. Existing Connectors are not changed; run migrations before using Integration Studio.
- Added `2026_08_29_000001_build_production_handoff_desk.php`. It maps legacy `pending` cases to `waiting_operator`, adds version/SLA/team fields and immutable activity, and fails closed when a conversation already has competing active cases.
- Added `2026_08_29_000002_build_quality_operations.php`. It adds automation state to saved quality scenarios and creates encrypted knowledge-gap and immutable occurrence ledgers. Existing scenarios remain manual and existing conversations are not heuristically backfilled.
- Added `2026_08_29_000003_create_bot_message_attachments.php`. It creates verified private attachment and per-turn linkage ledgers; existing messages are not backfilled.
- Added `2026_08_29_000004_create_channel_inbound_attachments.php`. It creates idempotent, short-lived private ingress staging for queued channel uploads; existing channels are not backfilled.
- Added `2026_08_29_000007_add_widget_display_context_to_chat_turns.php`. It adds encrypted, nullable storage for bounded visitor-visible page context; existing turns are not backfilled.
- Added `2026_08_29_000008_add_candidate_quality_comparisons.php`. It adds opt-in candidate release gates and deployment-role/comparison bindings to quality runs; existing Published Agent runs are classified as live and remain valid under the prior hash-based current-run contract.

## [0.17.0] - 2026-08-19

### Breaking

- Completed the Agent-first runtime cutover. Every chat now requires one immutable, hash-verified live Agent deployment; ordinary answers and pinned read tools remain Agent-owned, while optional Playbooks are closed, deployment-pinned process tools. Legacy runtime profiles, top-level Knowledge bypass, compound planning, global-tool escape paths, and recursive Playbooks are no longer productive options.
- Removed runtime product-mode aliases, `RAG_*` environment fallbacks, fine-grained runtime enable/engine switches, compound shadow execution, duplicate AgentGraph workflow-node metadata, legacy Bot Access Token hash lookup, conversation-meta workflow memory, workflow-snapshot metadata reads, and compound-specific answer interpreter/composer aliases. See `UPGRADING.md` for the required Before/After migration.
- Removed API Connector V1/legacy field execution, mutable-draft fallback, workflow/deployment operation snapshots as execution authority, raw `compound_requests.api_connectors.capabilities`, the Google Calendar compound feature flag, and alternate connector result projections. Existing workflows must publish exact immutable revision, full-contract, input-schema, and environment pins after the irreversible cutover described in `UPGRADING.md`.
- Removed the PHPStan baseline and all temporary architecture exceptions after fixing the underlying findings.
- Replaced the monolithic published configuration with an executable host-key allowlist. Internal runtime defaults and built-in action schemas are no longer host configuration; removed keys and `AGENTIC_WORKFLOW_*` aliases are ignored and reported by Doctor with exact upgrade instructions.
- Made action result schemas mandatory and part of every immutable action contract. Custom `CapabilityProvider` actions without an explicit result schema now fail registration.
- Removed the Compound Request model, persistence, policy, planner, executor, confirmation graph, node, bot configuration, and the old `loop` node. Existing deployments containing `compoundRequest`, `apiConnector`, or `loop` are retired by the irreversible cutover and must be republished with pinned connector v3 contracts and `batchMap`.
- Replaced API Connector operation contract version 2 with version 3. Productive execution has no v2 adapter; the migration creates new immutable v3 revisions and intentionally removes the old runtime path.

### Added

- Added a rate-limited, origin-checked widget access bootstrap with short-lived versioned tokens, exact origin binding, memory-only single-flight renewal, machine-readable expiry/rotation responses, and safe-read-only retry. Browser and Blade snippets are now tokenless at rest.
- Added explicit `vector`, `hybrid`, and `lexical_only` retrieval strategies; typed retrieval status/evidence contracts; versioned index stamps; calibrated DE/EN lexical evaluation; PostgreSQL FTS indexing; and an optional capability- and budget-gated reranker.
- Added a durable chat-turn ledger with client idempotency keys, per-conversation execution serialization, monotonic turn sequences, workflow/deployment/run pinning, explicit lifecycle states, stale-turn `unknown` handling, and exact JSON/SSE response replay. Channel messages now derive stable turn IDs from provider delivery identities.
- Added `filament-agentic-chatbot:reconcile-chat-turn` for audited, force-and-reason-gated abandonment of unknown or expired active turns after external operator verification. Reconciliation never retries the turn.
- Added `filament-agentic-chatbot:reconcile-side-effect` plus doctor visibility for unknown external write outcomes. Operators must verify the provider result out of band and record `succeeded` or `failed`; the command never repeats the write.
- Added canonical `filament-agentic-chatbot.connector-operation` version `2` drafts and immutable revisions, closed chatbot input schemas, distinct materialized-request schemas, publisher-derived `metadata.capability`, strategy IDs, and bounded operation-test evidence.
- Closed every server-owned nested operation-contract object and runtime payload schema, made direct revision persistence use the full executable-contract validator, and rejected static credentials from serialized templates, schema values/annotations, capability presentation, and extensible outcome, pagination, async-completion, and write-integrity policies.
- Added one `filament-agentic-chatbot.connector-result` version `2` envelope across Agent, Playbook, and workbench consumers with explicit `succeeded`, `replayed`, `partial`, `failed`, `blocked`, and `unknown` outcomes.
- Added bounded canonical capability-result projection, durable workflow-state budgets, and terminal AgentGraph chat-turn recovery that finalizes a crashed turn without redispatching workflow nodes or external capabilities.
- Added an encrypted, leased continuation journal for bounded pagination and async polling. Connector invocations own continuation progress; the journal is not a scheduler and AgentGraph remains workflow checkpoint/wait authority.
- Added `filament-agentic-chatbot:setup-google-calendar-connector` to create or update the OAuth connector and publish the canonical confirmation-required `create_google_calendar_event` operation.
- Added generic connector input policies for literal/enum admission, normalization, aliases, ambiguity, semantic/entity types, bounded batch modes, and optional requested-versus-observed result-identity verification.
- Added the `batchMap` workflow node as the one bounded collection traversal primitive.

### Changed

- Multi-objective independent reads now remain Agent-owned and use separate bounded, deployment-pinned calls through `CapabilityExecutionGateway`. Ordered, dependent, interruptible, or write-bearing work belongs to an explicit Playbook; no API-specific or Compound Request planner remains.
- Kept the audited Guzzle 7/PSR-7 2 security floors while admitting the native Guzzle 8/PSR-7 3 dependency line used by Laravel 13, avoiding a needless framework dependency downgrade.

- Reworked bot readiness, overview, quality scenarios, and launch guidance around the single live-Agent path. Bots without a verified live Agent deployment remain explicitly blocked, including bots that already have indexed Knowledge.
- Removed reflection-based retrieval dispatch, implicit lexical fallback, and Chroma threshold bypass. Retrieval now fails closed on incompatible index identity or insufficient evidence, uses G19 token budgets, and keeps raw queries out of retrieval diagnostics and terminal workflow traces.
- Hardened workflow turn routing so negated or exploratory cancel mentions no longer cancel active runs, while explicit replacement turns can still interrupt and replace an open workflow.
- Restricted semantic continuation to usable task frames, preserved structured clarification prompts and options through the runtime target boundary, and removed stale task-frame ownership of fresh requests.
- Tightened deterministic workflow input validation for canonical dates, money rules, explicit pending interaction submissions, and runtime payload schemas.
- Prevented unrecognized semantic workflow-start classifier decisions from falling back to metadata token overlap as execution authority.
- Replaced model/workflow-controlled Data Resource identity scopes with a transient server-attested runtime authority context, fail-closed tenant/actor/token/conversation scopes, and exact allow-list record serialization that cannot leak Eloquent `$appends`.
- Replaced API Connector runtime snapshots with exact immutable revision ID, full-contract hash, input-schema hash, and server-generated environment pins that are re-resolved, scope-checked, and materialized at dispatch; executable node overrides and legacy `__operationSnapshot` payloads are ignored.
- Made published API Connector operations the single source for chatbot tools and compound capabilities. Compound confirmation now binds connector, revision/hash, schema/effect, environment, and materialized input fingerprints and fails closed when any binding changes.
- Extended transient server-attested runtime authority to owner-scoped API Connector discovery and execution; owner identity from model output, inputs, workflow variables, plans, or checkpoints is never accepted.
- Hardened writes with typed canonical `input.*` business identities, server-owned provider idempotency, encrypted ledger payload/result/metadata, hashed lease-token fencing, `unknown` on lost ownership, and operator-only reconciliation without redispatch.
- Made connector base URLs structurally secret-free at persistence/cutover and attested provider idempotency headers after custom authentication, at retries, and across continuations so case-variant or non-empty replacements cannot authorize duplicate unsafe writes.

### Migration

- Added the irreversible `2026_07_15_000002_migrate_breaking_runtime_cleanup_data.php` cutover. Rotate pre-HMAC Bot Access Tokens before deployment; the migration canonicalizes runtime modes and persisted memory/snapshots, revokes unsupported token hashes, and cancels obsolete shadow compound records.
- Added the irreversible `2026_07_15_000003_cut_over_api_connector_operation_contracts.php` cutover. It canonicalizes legacy operations, publishes exact revisions, upgrades compatible conflict references, verifies hashes, drops the legacy execution columns, and aborts on ambiguous or invalid source data.
- Added `2026_07_15_000004_create_api_connector_continuations_table.php`, `2026_07_15_000005_create_api_connector_operation_test_runs_table.php`, and `2026_07_15_000006_harden_side_effect_execution_journal.php` for encrypted/fenced continuations, bounded test evidence, and encrypted/fenced side-effect storage.
- Added `2026_07_13_000002_add_knowledge_retrieval_fts_index.php`. Run migrations and re-ingest sources before enabling G21 retrieval because legacy unstamped chunks are intentionally incompatible.
- Added the `2026_07_09_000001` through `2026_07_09_000004` runtime migrations for durable chat turns, chat reconciliation fields, encrypted connector default headers, and side-effect reconciliation fields. Production upgrades must run `php artisan migrate` before serving chat requests.

## [0.16.1] - 2026-06-17

### Fixed

- Fixed legacy/default `sendMessage` workflow nodes after internal action/tool nodes so inherited `internal` message visibility no longer hides the final user-facing workflow response.

## [0.16.0] - 2026-06-17

### Compound Requests

- Added explicit compound request engine modes: `legacy`, `shadow`, and `structured`.
- Added shadow-mode audit records so new planner behavior can be observed without changing the user-facing workflow path.
- Switched compound planning to Laravel AI structured output and added schema-driven repair for single required string item inputs.
- Added Laravel AI tool capabilities, capability schema validation, and safe execution for action and tool-backed compound plans.
- Added API Connector-backed compound capabilities so configured connectors can be exposed as schema-driven read/write actions while reusing connector auth, method/path policy, bot scope, SSRF protection, retries, and response mapping.
- Added planner relationship metadata (`all`, `alternative`, `duplicate`, `dependent`, `ambiguous`) plus deterministic deduping and clarification gates for unsafe alternatives or dependent plans.
- Added semantic pending-confirmation classification for write/mixed compound requests, with direct shortcuts kept as a cheap fast path.
- Persisted auto-executed read-only compound requests for audit, while write and mixed read/write plans continue to require confirmation.
- Added an optional AgentGraph execution path for long-running, write, mixed, or async compound requests.
- Added bot-level Admin UI controls for compound engine mode and included configured actions, tools, and API connectors in the per-bot capability allow-list.
- Changed AgentGraph compound execution so small read-only structured batches stay synchronous unless they cross `COMPOUND_GRAPH_SYNC_ITEM_THRESHOLD`, use async capabilities, or include writes.
- Kept workflow waiting, interruption, delay, resume, and human-in-the-loop behavior authoritative over compound execution.
- Kept incomplete single-item plans on the normal workflow path so collect-input and human-in-the-loop nodes can pause and resume instead of being intercepted by compound clarification.

### Workflow Turns and Authoring

- Added schema-v2 `collectForm` preservation for structured fields authored as JSON text in the semantic Ask inspector and backend compiler.
- Fixed AgentGraph-backed workflow interrupts so replacing an open run cancels the SDK run before the Laravel projection starts the replacement.
- Fixed AgentGraph interrupt reconciliation for SDK interrupts that do not carry an `interrupt_id` by matching the same synthetic identity used by pending-interaction projection.
- Fixed conversation recall ordering so pending workflow, pending interaction, compound, and continuation owners are resolved before session-memory recall can answer.
- Added task-frame source uniqueness plus MySQL/MariaDB one-pending database guards for pending interactions and compound confirmations.

## [0.15.0] - 2026-06-08

### Added

- Added a Filament-managed Data Resources setup flow for live `query_data_resource` reads, including searchable Eloquent model and database-column dropdowns, field policy flags, runtime scopes, config sync, and per-bot narrowing.
- Added optional strict Gate mode for Data Resource administration via `data_resources.authorization.require_gates`.
- Added bot launch-readiness and workflow-readiness copy coverage to the localization fallback catalog.

### Changed

- Renamed the admin-facing live database access surface from Data Sources to Data Resources to distinguish it from indexed Knowledge Sources.
- Reworked the Data Resources form into a guided setup flow with safer labels, chat-sized result guardrails, hidden safety scope copy, and no bulk delete action.
- Polished the chatbot widget setup and preview experience so admins can review theme, copy, area overrides, launcher behavior, and Markdown-style answers before embedding publicly.
- Improved dashboard and bot-page preview surfaces around runtime readiness, usage, feedback, citation coverage, and knowledge gaps so release decisions are easier to make from Filament.
- Expanded the marketplace-readiness script so it now runs platform checks, full dead-code coverage, workflow-editor lint/build, workflow-editor contract tests, PHPStan, Pint, PHPUnit, and Composer audit from one release gate.

### Fixed

- Fixed UI-managed Data Resources so missing default-returned fields fall back to answer-ready fields or one safe returnable field instead of exposing every returnable field by default.
- Fixed runtime safety scope filters so ownership columns do not have to be exposed as visitor-filterable fields.
- Fixed PHPStan and LocalizationCoverage release blockers in the bot setup, channel setup, and Data Resource readiness surfaces.
- Fixed quality-domain enum dead-code reporting by marking the serialized quality contracts as public API for static analysis.
- Fixed Windows full-suite release runs by removing PHP's execution-time ceiling from the Composer test command and marketplace PHPUnit runner.

## [0.14.0] - 2026-06-05

### Added

- Added the Chatbot Quality Loop with saved quality scenarios, workflow quality runs, citation checks, latency/cost budgets, failure summaries, and fix suggestions.
- Added the Quality Lab Filament resource, workflow Quality panel, and feedback-to-scenario actions so negative conversation feedback can become a repeatable regression check.
- Added the Human Handoff Inbox for conversations that need operator review, including handoff creation from conversation review pages and workflow quality failures.
- Added the Assistant Profile Studio for tone, behavior, target audience, escalation, and operating constraints on each bot.
- Added the simple workflow builder and authoring compiler, with recipes and guided Smart Steps for common support, lead capture, data-answer, and handoff flows.
- Added a shadcn-based workflow editor component foundation, extended UI primitives, lucide icon usage, dockable HUD controls, focus mode, lane semantics, richer debug/release panels, and responsive viewport checks.
- Added workflow node definition schemas, shared node catalogs, runtime contracts, validator reports, issue recovery guidance, and build-artifact coverage for the editor bundle.
- Added commercial hardening controls for widget token transports, domain allowlist compatibility, Chroma threshold bypass, hybrid lexical retrieval strategy, safe URL ingestion limits, workflow trace privacy, and Bot Access Token `last_used_at` throttling.
- Added knowledge readiness reporting to the public chat config payload and to the bot setup surface.
- Added safe HTTP fetching for URL ingestion, asynchronous Chroma vector cleanup on source deletion, workflow activation normalization, encrypted credential diagnostics, and clearer chat service boundaries.
- Added CI and release gates for marketplace readiness, a PostgreSQL/pgvector smoke job, workflow-editor build artifact checks, dead-code checks, and an opt-in widget E2E smoke job.

### Changed

- Completed the public naming move from legacy RAG language toward the Bot/Knowledge domain across models, migrations, runtime services, docs, and admin copy while keeping compatibility where required.
- Refactored workflow validation, workflow execution, and editor contract code into shared services so backend runtime rules and React editor validation stay aligned.
- Reworked the workflow editor settings surface around shadcn controls, compact panels, clearer node setup, stable sidebars, better variable picking, richer test/debug views, and less technical default copy.
- Scoped the built-in `bots` data resource to the current bot by default.
- Moved chat access checks, conversation persistence, and payload/config presentation out of the API controller into dedicated services.
- Hardened production doctor checks for widget token transport, domain allowlists, workflow routing conflicts, trace privacy, encrypted credential decryption, API connector readiness, and commercial profile completeness.
- Hardened API connector execution, auth/access scope validation, test feedback, safety warnings, and paginated knowledge-source ingestion behavior.
- Hardened Bot Access Tokens with HMAC hash-version support, access scope columns, budget reservations, widened budget columns, rate-limit posture, scoped conversation access, and clearer admin authorization hooks.
- Improved bot setup, bot edit, conversation review, submission detail, quality scenario review, workflow run debug, and workflow status panels for a more operator-friendly Filament experience.

### Fixed

- Fixed localization coverage for the new quality, handoff, workflow debug, and release-readiness UI strings.
- Fixed static-analysis issues in quality scenario forms, workflow editor memoization, workflow validation contracts, and editor dead-code coverage.
- Fixed workflow release readiness drift, validation state synchronization, runtime failure classification, trace count display, action/test submission handling, and workflow activation normalization.
- Fixed handoff request linking, citation quality checks, workflow handoff behavior, and conversation-review handoff creation.
- Fixed workflow editor layout regressions around toolbar gutters, compact sidebars, footer overflow, debug panel responsiveness, HUD popovers, passive scrolling, stale tooltips, dock zones, and narrow viewport catalog controls.
- Replaced dynamic assistant-message persistence state with an explicit DTO so streamed `message_complete.message_id` remains static-analysis safe.
- Sanitized external knowledge-search failures while keeping structured internal logs.

### Migration

- Added bot quality scenario/run tables, assistant profile fields, handoff request tables, feedback-source links, Bot Access Token budget reservation and access-scope fields, API connector hardening fields, and HMAC hash-version support.
- Added migrations that normalize legacy `rag_*` database object names and workflow variable names toward Bot/Knowledge naming. Existing compatibility paths remain where the package still needs them.
- Production upgrades should run `php artisan migrate`, then `php artisan filament-agentic-chatbot:doctor`, and should verify bot setup, workflow draft/publish, quality scenarios, handoff review, and widget/API access in staging before public rollout.

## [0.13.0] - 2026-05-28

### Added

- Added stable `heiner/agent-graph` `^0.13.0` as a required workflow runtime dependency and integrated AgentGraph execution for delays, interactive resumes, memory nodes, loops, subworkflows, AI nodes, and workflow side effects.
- Added AgentGraph workflow run inspection with SDK replay traces, runtime metadata, and translation fallbacks in the workflow run admin UI.
- Added the assistant graph as the default chat runtime (`chat.assistant_graph`), exposing knowledge search and workflow execution as tools without pre-running retrieval on every turn.
- Added the generic workflow turn planner (`workflow.turn_planner`) with provider-aware structured-output handling and Ollama JSON Schema support.
- Added bot feedback inbox analytics and chat behavior / knowledge-routing indicators in the Bot admin UI.
- Added workflow run output preview and audit-layout improvements in the workflow run resource.
- Added widget theme inheritance for host panel accent colors and vertical card-list rendering for rich assistant messages.
- Added an adversarial reliability workflow fixture and expanded workflow turn-routing eval coverage.

### Changed

- Made the workflow runner AgentGraph-only and removed the legacy in-package workflow runtime path.
- Widened `laravel/ai` support to `^0.7 || ^1.0`.
- Renamed the preferred chat configuration surface from `chat.parent_agent` to `chat.assistant_graph` while keeping deprecated compatibility keys and env aliases.
- Rebuilt workflow editor production assets and simplified workflow editor catalog copy.
- Removed the custom Composer repository requirement for local `agent-graph` checkouts from the supported customer install path.
- Trimmed unused default Bot Access Token channel labels (`mobile`, `backend`, `custom`) from package config defaults.

### Fixed

- Fixed Smart Data Query preset runtime mapping, dynamic routing, and admin preview accuracy.
- Fixed workflow cancel replacement routing and several workflow lifecycle edge cases around interruption and tool-message visibility.
- Fixed widget stream errors and pinned-scroll behavior in the embeddable chat widget.
- Fixed release readiness and marketplace validation for the `0.13.0` release line.

### Removed

- Removed the legacy workflow runtime implementation and related fallback execution services.

### Migration

- Added `2026_05_26_000001_cancel_legacy_workflow_runs_for_agentgraph_cutover`, which cancels in-flight legacy workflow runs that never received an AgentGraph `run_id` (irreversible).

> **Note:** The `v0.12.0` git tag marked an early preview commit. `v0.13.0` is the first recommended release that ships the documented agent-first runtime together with the AgentGraph workflow platform. See [docs/RELEASE_NOTES_v0.13.0.md](docs/RELEASE_NOTES_v0.13.0.md).

## [0.12.0] - 2026-05-18

### Added

- Added the parent-agent runtime as the default chat orchestration path, with knowledge search and workflow execution exposed as tools while keeping the legacy direct RAG path available for compatibility.
- Added semantic workflow turn routing for pending workflow runs, including resume, cancel, interrupt, side-question, and clarification decisions before a halted workflow consumes the next user message.
- Added structured-output workflow classifiers for turn routing and choice resolution, including provider-native schema handling and an Ollama native structured-output path with prompt-JSON fallback.
- Added workflow interruption and cancellation hardening so open runs can be cancelled cleanly, stale paused state does not own unrelated future turns, and workflow tool messages render predictably.
- Added generic user-driven query planning support for `query_data_resource` via validated `filter_clauses`, dynamic exact-template sort/mode/limit mappings, resource `field_metadata`, and single-record chat formatting.
- Added a bot-level Smart Data Queries configuration and workflow editor starter so admins can allow data sources once while generated workflows handle natural requests like newest, active, cheapest, highest, or matching records.
- Added a workflow navigator, node readiness UX, field-level validation helpers, inline variable pickers, readable data-resource labels, and a broader translated workflow editor text catalog.
- Added workflow turn-routing evals, focused unit coverage for workflow interruption/classification paths, utility-node tests, data-resource query tests, and expanded chat/workflow feature coverage.
- Added a Postgres sandbox smoke setup script and improved smoke-install handling for release validation.

### Changed

- Refactored chat routing around `ParentAgent`, `BaseConversationalAgent`, `RunWorkflowTool`, and shared assistant-message payload builders so normal chat, knowledge retrieval, and workflows share a clearer orchestration model.
- Simplified workflow editor defaults and node configuration across Collect Input, Send Message, Switch Router, structured fields, HTTP Request, Transform, Split, Condition, Action Data, and Submission nodes.
- Compact workflow editor chrome, toolbar behavior, map/popover navigation, drag performance, save behavior, publish feedback, and sidebar controls were tightened for a calmer builder experience.
- Simplified Bot Access Token admin screens and made AI usage summary widgets update immediately.
- Updated internal architecture, workflow, bot, JSON schema, and operations documentation for the agent-first runtime and smart data query model.

### Fixed

- Fixed workflow node catalog controls, workflow editor validation edge cases, lint issues, and several drag/rendering churn problems in the React editor.
- Fixed workflow lifecycle issues around duplicate starts, unresolved clarification release, replacement propagation, cancellation-as-workflow-switch handling, and final tool-message visibility.
- Fixed transient widget stream error and pinned-scroll behavior in the embeddable chat widget.
- Fixed smoke-install relative working-directory handling and moved the sandbox smoke path to Postgres.

## [0.11.1] - 2026-05-16

### Changed

- Renamed the published workflow draft status from `Unpublished` to `Draft changes` when a workflow already has a live version, making it clearer that only the saved draft is ahead of the published workflow.
- Removed the default `Scope: Public Demo` filter from the workflow list so admins see all workflows by default instead of landing on a narrowed demo-only view.
- Updated workflow memory editor guidance and release docs to keep the default surface focused on normal `conversation` and `workflow_run` memory usage.

### Fixed

- Fixed the floating workflow toolbar hover/active shadow so the elevated drag state appears only while dragging from the handle, not when clicking toolbar buttons such as zoom, lock, validate, keyboard shortcuts, or delete.
- Fixed release-status usage payload coverage so publishing from the editor verifies the draft is marked `Up to date` after a successful publish.

## [0.11.0] - 2026-05-16

### Added

- Added package-owned channel integrations for Telegram and Slack, including Channel admin resources, encrypted credentials, webhook routes, provider drivers, thread mapping, delivery events, and workflow runtime channel variables.
- Added a channel RichMessage rendering layer so workflow/widget output is translated into text-first Telegram and Slack replies with optional native Telegram inline keyboards and Slack Block Kit messages instead of duplicating bot logic per channel.
- Added text-option normalization for external channels so numbered replies such as `1` map back to the original workflow button value before runtime execution.
- Added channel hardening for Telegram and Slack, including dedicated webhook ingress rate limiting, Telegram callback acknowledgements, Slack request-signature verification, empty webhook acknowledgements, media attachment recognition, and channel capability metadata.
- Hardened production channel delivery with provider `Retry-After` handling, stale inbound-event reclamation, long-message splitting for Slack/Telegram, and Slack thread-scoped channel conversations.
- Hardened channel security defaults with production webhook-verification enforcement, opt-in raw provider payload storage, and redaction for sensitive payload keys before queue dispatch and persistence.
- Added channel operations for diagnostics, provider-native test sends, Telegram webhook/command setup, Telegram typing indicators, and built-in `/help`, `/status`, and `/reset` runtime commands.
- Added a generic channel activity-indicator lifecycle with provider-specific strategies, including Telegram native typing with async heartbeat pulses, Slack placeholders that update into final text replies or clean up after fallback sends, and optional immediate slash-command acknowledgements.
- Added configurable localized channel activity placeholder text resolution for Slack, using connection settings, bot widget language, provider config, and app locale fallbacks.
- Added safe Slack thread continuation for replies under known bot messages without enabling broad channel-message handling.
- Added workflow/channel compatibility diagnostics so active workflows are checked against Telegram and Slack capabilities with explicit fallback and truncation warnings.
- Added native outbound image delivery for channel workflows: Telegram sends workflow `imageUrl` output through `sendPhoto`, and Slack renders public image URLs as Block Kit image blocks by default.
- Added scoped workflow memory storage with `conversation`, `workflow_run`, `session`, `actor`, and `bot` runtime scopes, plus memory read/write nodes, context-builder integration, exports, cleanup behavior, trace redaction, and actor isolation by bot.

### Changed

- Simplified the workflow editor's visible memory choices so normal builders see `conversation` and `workflow_run` by default, while broader `session`, `actor`, `bot`, and `semantic` metadata remain supported for existing/imported advanced workflows.

## [0.10.0] - 2026-05-13

### Added

- Added an OpenAI-compatible chat provider option with custom base URL support for gateways such as Qwen DashScope compatible mode or private OpenAI-compatible endpoints.
- Added an incident-management blueprint for enterprise setups that combine knowledge sources, live workflow retrieval, scoped API access, and usage budgets.
- Added optional Bot Access Token channel and owner metadata for enterprise integrations, with admin filters and AI usage visibility.
- Added Bot Access Token ownership metadata using optional polymorphic owner/creator fields without adding a package-owned user or tenant system.
- Added AI usage reporting by Bot Access Token channel to compare API, Telegram, Slack, mobile, and backend traffic.
- Added scoped Bot Access Tokens for the JSON chat API, including per-token areas, abilities, rotation, revocation, expiration, per-token rate limits, and request/usage budgets.
- Added AI usage logging, bot/token monthly budget guards, max input/output token controls, and usage dashboard widgets.
- Added `filament-agentic-chatbot:qa-enterprise-smoke` to automate enterprise integration smoke checks for scoped tokens, the JSON complete endpoint, budget guards, and OpenAI-compatible provider aliases.
- Added API integration and OpenAI-compatible provider documentation, including a Telegram webhook example and Qwen/DashScope, DeepSeek, and private gateway base URL guidance.
- Added a runnable incident-management example with demo migrations, seed data, Eloquent models, data-resource definitions, and a workflow JSON fixture.
- Added Laravel translation loading, a broad PHP/Filament UI localization sweep, React workflow editor translations, and automated localization coverage tests for new admin UI strings.

### Changed

- Improved Bot Access Token admin operations with one-time token display, token rotation/revocation actions, budget status, channel/owner filters, and current-month usage summaries.
- Improved workflow editor localization coverage and tightened admin UI copy so new strings are routed through Laravel/React translation files.

### Fixed

- Hardened token budget checks so token-specific max input/output limits are applied without mutating the shared bot model instance.
- Fixed usage telemetry association so AI usage events retain the Bot Access Token that initiated the call, including workflow AI node calls.

## [0.9.8] - 2026-05-11

### Changed

- Clarified public docs so the workflow editor's `Data Retrieval` option is described as an `Action` preset backed by `query_data_resource`, and so supported vector backends are explicitly documented as pgvector and ChromaDB.
- Expanded the per-bot chat provider experience with curated model options for OpenRouter, DeepSeek, Groq, Mistral, Anthropic, xAI, Ollama, Azure OpenAI, Gemini, and OpenAI.
- Expanded embedding provider setup checks for Gemini, OpenAI, OpenRouter, Mistral, Ollama, Azure OpenAI, Cohere, Jina AI, and Voyage AI, including provider-specific dimension resolution.
- Improved credential readiness handling for separate chat and embedding providers, including same-provider chat-key reuse and local Ollama setups that do not require an API key.

### Fixed

- Fixed the bot Analytics page failing on a missing Heroicon component, and made the chat widget script available on the extensionless route, the legacy `.js` route, and any configured custom route.

## [0.9.7] - 2026-05-08

### Changed

- Added Laravel 13 support while keeping the Laravel 12 install path available.
- Updated the Laravel AI SDK constraint to `^0.6.7`.
- Expanded CI coverage so Laravel 12 and Laravel 13 dependency sets are validated separately.

### Fixed

- Removed PHPStan issues exposed by the Laravel 13 dependency graph around workflow generation metadata and embedding dimension checks.

## [0.9.6] - 2026-04-16

### Added

- Expanded workflow node catalog coverage in the visual editor and docs, including AI utility nodes, retrieval/data shaping nodes, guardrails, memory nodes, structured output, sentiment/intent routing, random split, expression, sub-workflow, and canvas notes.
- Dedicated `Data Retrieval` workflow node preset for the built-in `query_data_resource` action, so safe internal Eloquent lookups are easier to configure without hand-writing the action key.
- Focused regression tests for AI streaming fallback, API Connector non-2xx handling, missing HTTP URL failures, sentiment fallback routing, and base64 transform edge cases.
- `docs/RELEASE_NOTES_v0.9.6.md` for the current commercial early-access release.

### Changed

- Workflow editor copy, settings tips, sidebar behavior, and canvas layout were tightened for a more stable admin UX across Nodes, AI Draft, Runs, Versions, and Test panels.
- API Connector nodes now treat non-2xx HTTP responses like raw HTTP Request nodes: they preserve response/status/raw/error variables, but stop the flow when `continueOnFail` is disabled.
- Sentiment nodes now route unexpected provider responses or fallback failures through the documented `default` branch instead of silently treating them as neutral.
- The PHPStan baseline was reduced after replacing stale suppressions with stricter array shapes and type annotations.

### Fixed

- Workflow editor canvas height is now viewport-fixed and no longer depends on sidebar tab content height. Switching between Nodes, AI Draft, Runs, Versions, and Test tabs no longer causes a layout shift or changes the canvas size.
- AI Draft and Test sidebar tabs now use the same thin custom scrollbar as the Runs tab, giving all sidebar panels a consistent look.
- AI Agent streaming fallback now preserves configured provider/model overrides when falling back to synchronous execution.
- HTTP Request nodes now mark missing URLs as terminal failures when `continueOnFail` is disabled.
- Transform `base64decode` now preserves valid falsey decoded values such as `"0"` instead of falling back to the original encoded string.
- Marketplace readiness is green for this release candidate, with PHPUnit, PHPStan, Pint, and the workflow-editor production build all passing.

## [0.9.5] - 2026-04-13

### Fixed

- Workflow editor canvas height is now viewport-fixed and no longer depends on sidebar tab content height. Switching between Nodes, AI Draft, Runs, Versions, and Test tabs no longer causes a layout shift or changes the canvas size.
- AI Draft and Test sidebar tabs now use the same thin custom scrollbar as the Runs tab, giving all sidebar panels a consistent look.

## [0.9.4] - 2026-04-13

### Added

- Clearer Commercial Early Access messaging across buyer-facing docs and the local plugin listing.
- Empty-state guidance actions on the Conversations, Workflow Runs, and Submissions tables now link first-time operators to the next productive step with icons and navigation buttons.
- Knowledge-gap rows in bot analytics (Potential Knowledge Gaps widget) now link directly to the full conversation thread for immediate review.
- `docs/RELEASE_NOTES_v0.9.4.md` for the current commercial early-access release.

### Changed

- README and core docs now surface shipped analytics, widget feedback, preview/dry-run tooling, and operator confidence features earlier.
- Widget, API Connector, and workflow schema docs now match the current runtime behavior more precisely.
- Bot list analytics discoverability, embed guidance, and setup-check copy are being tightened around the real operator flow.

## [0.9.3] - 2026-04-12

### Added

- Publish-before-live workflow activation guards, release-state labels, and regression coverage so unpublished drafts cannot become the active chat runtime accidentally.
- Submission schema metadata now exposes normalized payload-relative dedupe paths plus validation feedback for invalid `meta.*` configurations.
- `docs/RELEASE_NOTES_v0.9.3.md` for the 0.9.3 commercial early-access release.

### Changed

- Workflow fingerprints now canonicalize node and edge ordering so reorder-only edits do not appear as dirty drafts or false release deltas.
- Bot setup/runtime surfaces plus workflow editor/list status badges now distinguish `Draft`, `Not live`, `Live`, `Up to date`, and `Setup required` states more clearly.
- README now treats extended docs, smoke tooling, and browser smoke coverage as source-repository assets instead of implying they ship inside distribution archives.

### Fixed

- `store_submission` dedupe resolution now uses payload-relative paths consistently and ignores invalid `meta.*` dedupe targets.
- Marketplace readiness is green again for the current release candidate, with PHPUnit, PHPStan, Pint, and the workflow-editor production build all passing.

## [0.9.2] - 2026-04-10

### Added

- Shared `OperationalHealthService` for queue/vector readiness checks across the doctor command and setup health UI.
- Workflow trace hardening controls for capture scope, string truncation, and key-based redaction.

### Changed

- Workflow HTTP Request nodes, API Connectors, ingestion URL checks, and workflow node inspection now share the same centralized server-request URL safety guard.
- `WorkflowRunner` no longer stores request-local stream callbacks in singleton state; streaming is passed explicitly through the execution path.

### Fixed

- Prevented concurrent duplicate workflow starts for the same conversation/workflow pair and added stale-run reclamation for abandoned `running` executions.
- Closed the DNS-rebinding/private-resolution gap in SSRF protection for server-side request targets.
- Redacted sensitive values from persisted workflow traces and completed/failed workflow variable snapshots before they are stored.
- Prevented passive workflow-editor inspection from arming autosave and creating non-semantic draft changes.
- Hardened the fresh-install smoke installers for current Windows PowerShell / Composer / Filament panel-generation behavior.

## [0.9.1] - 2026-04-10

### Added

- Twelve buyer-facing docs screenshots replacing the original six — adds workflow canvas, AI Draft tab, Runs tab, Releases tab, and API Connectors list screenshots.
- `SandboxBotSeeder` now seeds showcase API connectors, multi-version workflow with run history, and a richer conversation transcript for screenshot quality.
- Sandbox `AdminPanelProvider` displays a non-generic brand name to improve screenshot realism.
- `docs/OPERATIONS.md` — buyer-facing operational guide covering queue health, doctor command, cache recovery, and go-live checklist.

### Fixed

- `WorkflowJsonValidator::catalog()` fallback (non-container path) now constructs `WorkflowGenerationCatalog` with the full required dependency set, including `DataResourceRegistry`.
- `PackageMigration::ensureTablesExist()` no longer calls `getName()` on `ConnectionInterface` (method is not declared on the interface); uses `$this->configuredConnection` instead.

### Changed

- Internal-only demo/bootstrap commands (`DevBootstrapCommand`, `SeedDemoBotsCommand`, `WorkflowGenerationSmokeCommand`) are no longer registered by the service provider or shipped in the package.
- Release metadata and listing docs now consistently reference `v0.9.0-beta.1` first public beta release notes.
- Internal demo bootstrap defaults no longer assume a package-level seed command; seeding is now opt-in per host app.
- Maintainer-only release, marketing, and demo-platform collateral removed from the package repository — repo now contains only plugin source, tests, and buyer-facing docs.
- Workflow editor build (`vite.config.ts`) decoupled from any hardcoded demo-repo path; extra publish targets are now opt-in via `FILAMENT_AGENTIC_CHATBOT_EXTRA_PUBLISH_ROOTS` environment variable.
- PHPStan baseline regenerated (149 suppressions) to reflect line-number drift after Pint reformatting and the above bug fixes.
- All source files and test files auto-formatted by Pint (code style only, no logic changes).
- `FilamentAgenticChatbotServiceProvider` now follows the `PackageServiceProvider` / Package Tools pattern recommended by the Filament 5 plugin docs.
- `composer.json` now declares `spatie/laravel-package-tools` directly because the package imports it explicitly instead of relying on Filament to pull it in transitively.
- Bot capability mode now enforces more of the real workflow surface: custom actions can declare `capability: query|write`, and `httpRequest` / `apiConnector` nodes treat `GET` as query behavior and non-`GET` methods as write behavior for linked bots.

## [0.9.0-beta.1] - 2026-04-04

### Added

- Automated Playwright-based docs screenshot capture flow in the sandbox app.
- Six buyer-facing screenshots covering bot management, editing, sources, conversations, and desktop/mobile widget views.
- Cycle detection in workflow validator (iterative DFS).
- MaxSteps exceeded error surfacing in workflow runner.
- Concurrency guard (DB row-lock) in chat controller.
- Queue worker health check in doctor command.
- FuzzyMatch toggle for switch router in settings panel.
- Prompt length guard (`max_prompt_length`) in workflow generation.
- Temperature/maxTokens override resolution in AI agent executor (staged for SDK support).
- Duplicate collectInput variable lint rule in semantic linter.
- Widget SDK v1.0.0 with `fontPreset`, `showSources`, `lang` options.
- PHPStan baseline for CI stability (132 type-strictness suppressions).
- `.editorconfig` for consistent code style.
- `UPGRADING.md` starter guidance for future migration paths.
- `KNOWN_LIMITATIONS.md` documenting current caveats.
- New test suites: SwitchRouterExecutor, WorkflowState, and WorkflowFixtureValidation.

### Changed

- Removed PineconeVectorStore (pgvector and chroma backends only).
- Consolidated WorkflowGraphRepairer logic into `WorkflowJsonValidator::normalize()`.
- Enhanced normalization with dangling edge pruning and hallucinated handle cleanup.
- Improved `WorkflowGeneratorAgent` prompting with explicit `sourceHandle` instructions.
- Expanded buyer-facing docs with an early-access note, visual product tour, and clearer install guidance.
- Updated marketplace and release checks to reflect the `v0.9.0-beta.1` first public beta.

### Fixed

- Settings panel CSS corruption (JS widget code was prepended to CSS output).
- `finalizeAssistantMessage()` PHPDoc return shape (stale `preserve_sources` key).
- Widget `aria_scroll_to_bottom` translation keys.
