# Changelog

All notable changes to this package will be documented in this file.

## [0.16.1] - 2026-06-17

### Fixed

- Fixed default/plain `sendMessage` workflow responses after internal action/tool steps so inherited `internal` visibility no longer hides the final user-facing reply in legacy and schema-v1 workflows.

## [0.16.0] - 2026-06-17

### Added

- Added explicit Compound Request engine modes: `legacy`, `shadow`, and `structured`.
- Added shadow-mode audit records for evaluating structured plans without changing visitor-facing behavior.
- Added Laravel AI structured-output planning, capability schema validation, action/tool/API Connector-backed compound capabilities, and safe execution for read/write plans.
- Added bot-level Admin UI controls for compound engine mode and per-bot compound capability allow-lists.
- Added schema-v2 structured Ask/`collectForm` authoring docs and workflow turn-understanding docs.

### Changed

- Kept `legacy` as the default-safe compound engine while documenting `shadow` and `structured` rollout paths.
- Routed small read-only structured compound plans synchronously unless they cross `COMPOUND_GRAPH_SYNC_ITEM_THRESHOLD`, use async capabilities, or include writes.
- Kept workflow waiting, interruption, delay, resume, and human-in-the-loop behavior authoritative over compound execution and conversation recall.

### Fixed

- Fixed AgentGraph-backed workflow interrupt replacements so the SDK run is cancelled before a new run starts.
- Fixed AgentGraph interrupt reconciliation when SDK interrupts do not include an `interrupt_id`.
- Fixed schema-v2 structured fields authored as JSON text so frontend and backend compilers preserve them as `collectForm` runtime fields.
- Fixed conversation recall ordering so pending workflow/interaction owners are resolved first.
- Added task-frame source uniqueness plus MySQL/MariaDB one-pending database guards for pending interactions and compound confirmations.

## [0.15.0] - 2026-06-08

### Added

- Added a Filament-managed Data Resources setup flow for live `query_data_resource` reads.
- Added optional strict Gate mode for Data Resource administration.
- Added bot launch-readiness and workflow-readiness copy coverage to the localization fallback catalog.

### Changed

- Renamed the admin-facing live database access surface from Data Sources to Data Resources.
- Reworked the Data Resources form into a guided setup flow with safer labels, result guardrails, safety scope copy, and no bulk delete action.
- Polished the chatbot widget setup and preview experience before public embedding.
- Expanded the marketplace-readiness script into a stricter release gate.

### Fixed

- Fixed UI-managed Data Resources so missing default-returned fields fall back to answer-ready fields or one safe returnable field.
- Fixed runtime safety scope filters so ownership columns do not have to be exposed as visitor-filterable fields.
- Fixed PHPStan, localization, and Windows full-suite release blockers.

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

> **Note:** The `v0.12.0` git tag marked an early preview commit. `v0.13.0` is the first recommended release that ships the documented agent-first runtime together with the AgentGraph workflow platform. See [RELEASE_NOTES_v0.13.0.md](RELEASE_NOTES_v0.13.0.md).

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

## [0.9.6] - 2026-04-16

### Added

- Expanded workflow node catalog coverage in the visual editor and docs, including AI utility nodes, retrieval/data shaping nodes, guardrails, memory nodes, structured output, sentiment/intent routing, random split, expression, sub-workflow, and canvas notes.
- Dedicated `Data Retrieval` workflow node preset for the built-in `query_data_resource` action, so safe internal Eloquent lookups are easier to configure without hand-writing the action key.
- Focused regression tests for AI streaming fallback, API Connector non-2xx handling, missing HTTP URL failures, sentiment fallback routing, and base64 transform edge cases.
- `RELEASE_NOTES_v0.9.6.md` for the current commercial early-access release.

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
- `RELEASE_NOTES_v0.9.4.md` for the current commercial early-access release.

### Changed

- README and core docs now surface shipped analytics, widget feedback, preview/dry-run tooling, and operator confidence features earlier.
- Widget, API Connector, and workflow schema docs now match the current runtime behavior more precisely.
- Bot list analytics discoverability, embed guidance, and setup-check copy are being tightened around the real operator flow.

## [0.9.3] - 2026-04-12

### Added

- Publish-before-live workflow activation guards, release-state labels, and regression coverage so unpublished drafts cannot become the active chat runtime accidentally.
- Submission schema metadata now exposes normalized payload-relative dedupe paths plus validation feedback for invalid `meta.*` configurations.
- `RELEASE_NOTES_v0.9.3.md` for the 0.9.3 commercial early-access release.

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
- `OPERATIONS.md` — buyer-facing operational guide covering queue health, doctor command, cache recovery, and go-live checklist.

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
