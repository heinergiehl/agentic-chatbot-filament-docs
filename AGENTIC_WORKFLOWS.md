# Agentic Workflows

Workflows are the executable conversation and capability contract for every bot. They can answer, collect data, branch by intent, search knowledge, call APIs, and take approved backend actions.

## What A Workflow Is

A workflow is a visual graph that defines how a bot behaves over one or more conversation turns. Every live bot requires one verified workflow deployment. Simple Assistant and Knowledge Assistant are starter workflows for the common cases.

A structured workflow can:

1. greet the user
2. collect input (name, email, issue type)
3. classify intent with an AI agent node
4. branch into different paths based on the classification
5. retrieve knowledge where needed
6. call backend actions or external APIs
7. send the right response for each path

## Why Workflows Matter

Workflows are useful when the assistant must:

- ask clarifying questions before answering
- gather structured data (e.g., lead qualification forms)
- route users by intent (billing, technical, sales)
- create a ticket, send a webhook, or call an external API
- escalate when the knowledge base does not have a confident answer
- guide a user through an onboarding or troubleshooting flow

## The Visual Workflow Editor

The editor is embedded inside Filament on the workflow edit page. It provides:

- a drag-and-drop canvas for placing and connecting nodes
- one visual editor for the semantic workflow that is saved, versioned, and published
- simplified node names, canvas summaries, and setup fields for common workflow steps
- per-node configuration panels where advanced controls live inside each node inspector
- local validation plus a server-side **Validate workflow** action that runs the same validator used by save and publish
- keyboard shortcuts for common operations

### Editor Tabs

The workflow edit page combines five working areas:

| Tab          | Purpose                                                             |
| ------------ | ------------------------------------------------------------------- |
| **Nodes**    | The visual canvas where you build the graph                         |
| **AI Draft** | Describe a flow in natural language and get an AI-generated draft   |
| **Runs**     | Inspect execution history, per-node traces, variables, and outcomes |
| **Versions** | Manage published vs draft versions, release notes, and rollbacks    |
| **Test**     | Run the saved draft in a sandbox conversation before publishing     |

The editor also supports node mapping previews for action, HTTP Request, and API Connector nodes plus dry runs for HTTP Request and API Connector nodes. That means you can inspect mappings and live responses before you publish a release.

The editor uses one canvas and stores `schemaVersion: 2` semantic workflows as the authoring source of truth. The runtime graph is compiled from that semantic workflow at validation, preview, publish, activation, and execution boundaries. Structured Ask steps, including form and wizard presentations, compile to `collectForm` runtime nodes with the field contract, normalization, parsing, validation policy, examples, and canonicalization metadata preserved for execution.

The lower-level `schemaVersion: 1` graph is the executable runtime/API shape. It is useful for fixtures, diagnostics, and engine integrations, but it is not the lossless visual-editor authoring format. Importing or migrating runtime JSON into the editor requires conversion to schema v2 or rebuilding the workflow as semantic steps.

To keep the catalog usable as it grows, the sidebar exposes authoring choices in product tiers:

- **Builder** for the semantic steps most authors should use first
- **Expert** for common power features such as confidence checks, structured output, connectors, joins, and delay steps
- **Internal runtime** only for compiled-graph diagnostics and engine-level investigation

The UX goal is to keep Builder and Expert focused on chatbot behavior, with technical controls moved into contextual advanced sections inside each node inspector. Normal authors should not need to place raw runtime nodes. The engine compiles schema v2 semantic steps into the executable graph internally.

## Node Types

Every workflow is built from semantic behavior steps. A good practice is to start with the smallest useful set, then add expert features only when the flow needs them:

- **Core conversation steps**: Start, Ask, Respond, Route, Finish, Note
- **Grounding and answer steps**: Knowledge Answer, Data Answer, Respond
- **Integration and action steps**: API Connector, HTTP Request, Action, Approval
- **Expert processing steps**: Structured Output, Confidence Check, Guardrail, Query Rewrite, Summarize, Context Builder, Rerank, Delay, Join

The editor also exposes a dedicated **Data Retrieval** preset for safe internal reads. That preset compiles to the built-in `query_data_resource` action path under the hood, rather than asking authors to configure a separate runtime node type.

### Trigger

The entry point. Starts the workflow when a user message arrives from the chat widget.

Supported trigger types:

- `user_message` for conversational flows started from the chat UI

### Send Message

Sends text or Markdown content back to the user. Use this for greetings, confirmations, summaries, and fallback messages.

### Collect Input

Asks the user for structured input. Supports types such as text, email, number, and choice. The collected value is stored in a workflow variable for use in later nodes.

### Condition

Branches the workflow into two paths (true/false) based on a rule. Use this when the decision is binary, such as "did the user provide an email?"

### Switch Router

Branches the workflow into multiple paths based on a value or classification result. Use this when you have three or more possible routes, such as routing by department.

### AI Agent

Uses the configured AI model for tasks such as:

- intent classification
- summarization
- entity extraction
- response generation
- decision support

The AI agent node can reference workflow variables and previous conversation context. Per-node `temperature` and `maxTokens` values are passed through the Laravel AI SDK generation options where the selected provider supports them.

### Answer

Generates a grounded final answer from knowledge context, structured data, or both. Use this instead of a generic AI Agent when the node is responsible for the final user-facing response.

When a workflow output policy explicitly permits an LLM rewrite, the runtime first normalizes the result into an immutable Fact Envelope and validates the structured composer response before showing it. Action outputs remain deterministic by default. Identifier-, money-, booking-, compliance-, security-, and write-bearing results are always rendered deterministically even when a workflow requests `llm_rewrite`.

### Query Rewrite

Uses an AI model to convert the raw user message or collected input into a cleaner internal search/query string. This is useful before Knowledge Base or data-resource lookups.

### Summarize

Uses an AI model to condense long context, API results, or conversation state before a later answer or extraction step.

### Structured Output

Uses an AI model to return JSON and then validates the decoded output against the configured schema. It routes through `valid` or `invalid` handles and writes both the parsed output variable and an `*_error` variable.

Supported schema styles:

- compact field maps, e.g. `{"email":"string","budget":"number"}`
- JSON Schema-style objects with `type`, `properties`, `required`, `items`, `enum`, `additionalProperties`, `format`, `pattern`, string length bounds, and numeric `minimum` / `maximum`

### Knowledge Base

Runs knowledge retrieval inside the workflow. This lets the assistant stay grounded in your documentation while still following a multi-step process. Configure it with the same `top_k` and `min_similarity` controls available on the bot.

A Knowledge Base node may read an explicitly stored follow-up topic, but it never writes conversation memory implicitly. If a later turn should reuse a query or topic, connect an explicit Memory Write node and choose its scope, namespace, key, and value in the graph. This keeps persistence visible, deployable, and subject to the same capability policy and live-run authority as every other write.

### Confidence Check

Checks whether retrieved context or structured data is strong enough to continue. It routes through `valid` or `invalid`.

### Guardrail

Checks user input or variables for unsafe content or configured PII patterns before allowing downstream work.

### Context Builder

Combines selected variables, retrieved records, and optional user input into one formatted context variable.

### Rerank

Orders retrieved records and stores the trimmed result set plus scores. It can also act as a generic candidate resolver for API responses by reading a nested `recordsPath` such as `results` or `data.items`, scoring selected `textFields`, and adding structured `preferredValues` boosts such as `source = trusted_catalog`.

`scoringMode` defaults to `deterministic`, which is explainable and does not call an AI provider. Use `semantic` to rank fuzzy language, typos, and translated labels through Laravel AI SDK reranking. Use `hybrid` when the semantic score should still respect structured workflow preferences such as trusted sources or matching resource types. Optional `provider` and `model` fields override the Laravel AI SDK reranking defaults for this node. The node applies `limit` after scoring and ambiguity checks so hybrid preferences are not dropped before they can influence the result.

Runtime variables include `{{outputVariable}}`, `{{outputVariable_scores}}`, `{{outputVariable_top}}`, `{{outputVariable_top_score}}`, `{{outputVariable_top_match_count}}`, and `{{outputVariable_ambiguous}}`. Use the ambiguity flag to route to a clarification question instead of guessing when multiple candidates have the same top score.

### Error Handler

Converts an upstream `*_error` variable into a clear success/failure branch. Use it after API, action, or retrieval nodes.

### Runtime Retry

AgentGraph can retry a workflow node when that node throws a transient technical exception. Configure this with the common `nodeRetryAttempts`, `nodeRetryDelayMs`, and `nodeRetryBackoff` fields in the node data. This is for infrastructure-level failures such as temporary provider or network errors; it does not replace request-level HTTP/API retries, validation branches, `errorHandler` fallbacks, confirmation steps, or clarification questions.

### Confirmation

Asks the user to confirm or cancel a sensitive operation. It resumes through `valid` or `invalid` branch handles.

### Action

Calls a backend action registered in your Laravel app. Typical examples:

- create a support ticket
- send an email notification
- save lead data to your CRM
- trigger a custom business process

Host actions are supplied through the public `CapabilityProvider` extension seam as immutable `CapabilityActionDefinition` values. Each definition declares a stable key, version, side effect, closed request and result schemas, confirmation policy, idempotency policy, a required secret-free `CapabilitySemanticProfile`, and a handler. Duplicate or incomplete definitions fail during package boot or resolution; unknown contracts block publication and runtime.

At publication, the runtime follows each declared intent route and adds a bounded set of only the immutable action/API capabilities reachable from that route. The workflow intent classifier uses those descriptions, examples, aliases, entity types, and required inputs as semantic evidence. It still returns only a route from the workflow allowlist. A deterministic confidence threshold and primary/alternative margin accept an unambiguous route; low-confidence, ambiguous, unsupported, malformed, or unavailable model outcomes go to the workflow fallback with a structured clarification specification. Write confirmation remains a separate policy/gateway decision after routing and slot validation.

For domain names that require canonical external values, a host can tag an optional `CapabilityEntityResolver`. The resolver is selected only by the declared slot `entityType`; it cannot add routes or capabilities. A high-confidence resolved value is recorded with resolver provenance, while ambiguous, missing, low-confidence, or unavailable resolutions remain unfilled and therefore continue through the workflow's normal clarification path.

`CapabilityExecutionGateway` is the only execution boundary for workflow actions, API Connector operations, and raw HTTP. It fixes the order to contract resolution, exact materialized-payload validation, authority, confirmation, idempotency claim, dispatch, result validation, and ledger finalization; action execution may additionally queue operator review. Connector and raw HTTP transport starts only after claim, and a dispatched write whose outcome cannot be verified is recorded as `unknown` with `reconciliation_required=true` and is not automatically retried. Action handlers receive only the validated payload and readonly `CapabilityExecutionContext`.

Publish materializes the action contract version, contract hash, payload-schema hash, and secret-free contract snapshot into the immutable workflow deployment. Runtime resolution compares that pinned identity with the current registry and fails closed until the workflow is republished after a contract change.

Write actions use `idempotency_policy.mode: gateway` with an explicit write policy for central claim, replay, unknown-outcome handling, and reconciliation. Self-managed idempotency is not supported because it would create a second productive write lifecycle outside the capability execution gateway.

See [Public API](PUBLIC_API.md) for the supported provider registration example. Internal registries are not host extension APIs.

In the editor UI, safe internal lookups are also surfaced as a dedicated **Data Retrieval** preset. It is still an Action node at runtime, preconfigured around the built-in `query_data_resource` action key.

Built-in action keys include:

- `store_submission` for schema-driven writes that appear in the `Submissions` review resource
- `describe_capabilities` for a safe structured catalog of the linked bot's approved runtime capabilities. Its optional `categories` input accepts registered capability-provider category keys, including host-app extensions.
- `describe_data_resources` for a data-resource-only catalog, kept for workflows that only need database-source discovery
- `query_data_resource` for read-only queries against allow-listed internal Eloquent resources on the linked bot

Bounded meta questions such as "what can you do?" receive deterministic protocol text from the immutable live deployment's `public_capability` and `meta_capabilities` contract. The response can explain purpose, required inputs, next steps, connected APIs, side effects, confirmation, examples, and the closed workflow boundary in English, German, French, or Spanish. It does not create or advance a run, execute a capability, or consume an open waitpoint; a meta question during a waitpoint preserves that run and pending interaction.

Visitor discovery respects `capabilities.discovery.enabled` and the configured category allowlist. When a live workflow is bound, both its visitor catalog and planner-visible capabilities are restricted to the capability dependency closure pinned by that release; configured but unreachable APIs, actions, tools, and resources are not advertised. Operator inventory remains a separate, unscoped diagnostic view. Add `describe_capabilities` only when the workflow itself needs the structured catalog as data inside the flow.

`query_data_resource` is only valid when the linked bot allows queries and the selected resource key is explicitly enabled for that bot.

For generic catalog questions such as newest, oldest, highest, lowest, cheapest, or filtered records, use a `structuredOutput` step to extract a query plan, then pass exact `{{planned_query.*}}` templates into `query_data_resource` via `filter_clauses`, `sort`, `mode`, and `limit`. Resource `field_metadata` should describe date, numeric, enum, and text fields so generated workflows can map natural language to safe allow-listed fields.

For no-code setup, define safe live reads in **Data Resources**, approve the minimum resources on the bot's **Database Answers** section, then use the workflow editor's **Smart Data Query** starter. The generated workflow handles the query-plan JSON and the data-retrieval mapping.

For request-style nodes, `GET` is treated as query behavior, while `POST`, `PUT`, `PATCH`, and `DELETE` are treated as write behavior when capability mode is enforced for the linked bot.

### Batch Map

`batchMap` is the single explicit collection-traversal node. It reads a bounded
array from `collectionVariable`, exposes the current value and zero-based index
through declared variables, executes the `batchMap` branch, and returns through
the controller until the collection is exhausted. The `done` branch runs once
after ordered iteration output has been collected.

`maxItems` is a hard node-level safety bound. External calls inside the body
remain ordinary workflow capabilities and therefore retain their immutable
contract, gateway, confirmation, idempotency, and reconciliation rules.
`batchMap` is not a second request planner and does not grant write or connector
authority.

Natural multi-objective entry turns are not authored as a special node. The
runtime may admit one release-bound Authorized Entry Turn Plan containing tasks
and items; AgentGraph executes it inside one workflow run without reclassifying
items.

Published schema-v2 workflows also include `workflowReleaseContract.capability_contract`. It is the canonical workflow capability contract used by planner context, workflow prompts, capability discovery, deployment policy metadata, docs, and eval context. It is versioned, hashed, and snapshot-tested, and contains capability keys, labels, examples, slots, validators, side-effect class, confirmation policy, output frames, allowed follow-ups, and forbidden assumptions.

### HTTP Request

Calls an external URL directly from the workflow. Configure method, URL, headers, body, timeout, and whether the flow should continue on failure. Use this for one-off integrations where you do not need a reusable connector profile.

Non-2xx responses and missing URLs stop the workflow by default. Enable `continueOnFail` only when a downstream fallback branch reads the `*_status` or `*_error` variables and handles the failure intentionally.

Supported methods are `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`. Only `GET` requests are retried by default for temporary failures. `POST`, `PUT`, `PATCH`, and `DELETE` retry only when `retryUnsafeMethods` is enabled for an idempotent target API.

Raw HTTP request bodies and responses are bounded before they can become workflow data. Defaults are 256 KiB and 1 MiB respectively; trusted deployments can adjust them with `WORKFLOW_HTTP_REQUEST_MAX_REQUEST_BODY_BYTES` and `WORKFLOW_HTTP_REQUEST_MAX_RESPONSE_BODY_BYTES`. Oversized payloads use the `payload_too_large` status. A response-size failure after dispatch keeps a protected write in `unknown` for reconciliation.

### API Connector

Calls a saved API connector profile. Connectors store base URL, authentication, default headers, and timeout so you can reuse them across multiple workflows without duplicating credentials. See [API Connectors](API_CONNECTORS.md).

API Connector nodes follow the same failure model as raw HTTP Request nodes: non-2xx responses preserve response/status/raw/error variables, but stop the workflow unless `continueOnFail` is enabled.

Connector nodes use the same method whitelist and retry rules as raw HTTP nodes, plus connector-level bot scope, allowed-method, allowed-path, authentication, and SSRF checks.

### Set Variable

Stores a literal value or interpolated template result in the workflow state. Use Transform or Expression when you need actual data manipulation.

### Entity Extractor

Extracts simple fields such as email, dates, or regex matches from text and can write individual variables.

### Memory Read / Memory Write

Reads and writes small workflow memory values. Use the default `conversation` scope for normal chat follow-ups, such as `current_topic`, `selected_item`, or an intake draft. Use `workflow_run` only for temporary scratch state that should not survive beyond one execution.

The runtime and JSON import path also support broader `session`, `actor`, and `bot` scopes for advanced integrations, but the editor keeps the common path focused on `conversation` and `workflow_run`.

### Validation

Validates a variable with common deterministic rules such as email, URL, regex, length, required, numeric, canonical `YYYY-MM-DD` date, 24-hour `HH:MM` time, money, or currency-specific money (`money:EUR`, `money:USD`, `money:GBP`), then routes `valid` or `invalid`.

### Transform

Applies deterministic text or data transforms such as trim, uppercase, replace, JSON path extraction, or date formatting.

### Log

Writes a workflow log entry for audit and debugging.

### Random Split

Routes traffic by weighted split for experiments or A/B style flows.

### Intent Classifier

Classifies the user request into configured intents and routes by case handle.

### Sentiment

Classifies text as positive, negative, or neutral and routes to the matching case. Unexpected provider output or fallback failures route to the `default` branch.

### Expression

Evaluates a safe expression without `eval`. It supports arithmetic with parentheses, string concatenation, comparisons, and a small set of helper functions such as `upper`, `lower`, `trim`, `round`, `now()`, and `today()`.

### Sub-Workflow

Runs another workflow as a reusable child flow and stores its output. Treat this as an advanced node: keep child workflows small, avoid circular references, and prefer same-bot helper flows unless you have a clear reason to share a workflow more broadly.

### End

Stops the workflow intentionally with a final status and optional final message.

### Join

Merges multiple incoming branches into one explicit continuation point.

### Loop

Repeats a section of the workflow for each item in a list. Useful when processing multiple results from an API call or knowledge search.

### Delay

Pauses the workflow for a configured duration before continuing. The workflow run is suspended and resumed via the queue.

### Note

A non-executable annotation node. Use notes to document intent, leave reminders, or explain complex sections of the graph.

## Drafts, Publishing, And Releases

Workflows follow a save → validate → publish → enable lifecycle:

1. **Draft** — edit nodes, connections, and settings freely without affecting live behavior
2. **Validate** — run local canvas checks and server-side publish checks before release
3. **Publish** — snapshot the current draft as a new version and immutable deployment artifact with release notes
4. **Enable** — route chat to the published workflow for the assigned bot
5. **Rollback** — revert to any previous published version if a new release causes issues

This means you can iterate on a workflow safely. Draft changes never affect users until you explicitly publish.

New workflows start with a server-saved starter draft, not hidden browser-only default nodes. Empty payloads are treated as intentionally empty. Importing JSON, loading a preset, clearing the canvas, reconnecting edges, or replacing a draft resets the editor test session and run selection so old execution state does not point at a different graph.

Unpublished workflows cannot be enabled as normal chat routing. If the workflow has only a draft, publish it first, then enable it. The Workflows list shows assignment, release, and routing states directly: assigned/unassigned, live/standby, draft/published, and conflict.

This is not extra ceremony. The draft/release split protects the live bot from half-finished edits, gives your team an audit trail with release notes, and makes rollback practical when a new automation path behaves unexpectedly. Runtime starts use only the exact deployment selected by `active_deployment_id`; draft or direct authoring-field edits cannot change a new or paused run. Sub-workflow nodes pin the exact direct and transitive child deployment hashes at parent publish time, so a later child release cannot silently change an existing parent. Rollback atomically selects an existing historical deployment hash instead of recompiling the old payload.

Sub-workflows use an isolated state boundary. Their published contract defines input mappings, output mappings, schemas, allowed statuses, and cancellation behavior. The parent receives only explicitly exported fields; internal child variables and sensitive values are not merged into parent state. Child capabilities and writes appear in the parent deployment manifest under namespaced dependency paths and inherit their confirmation requirements.

## Workflow Generation

The **AI Draft** tab lets you describe the workflow you want in plain English:

> "Greet the user, ask for their name and issue type, search the knowledge base, and if confidence is low route to a human support form."

The AI generates a first-draft workflow graph that you can review, adjust, and refine before publishing. This is especially useful for:

- bootstrapping a new workflow quickly
- exploring what a flow could look like
- getting a starting point when you are not sure which nodes to use

Always review generated workflows before publishing. The AI draft is a starting point, not a finished product.

Generated workflows are saved as drafts and still pass through the same structural validator, semantic linter, capability checks, and publish guards as hand-built workflows.

## Follow-Up Clarification

When a completed workflow result is followed by an ambiguous message, the runtime may ask a clarification question instead of guessing. That pending clarification is tied to the conversation, active workflow, and previous run, then included in the next LLM continuation plan. If the user answers the clarification, the workflow receives a rewritten standalone input; if the next message is unrelated, the pending clarification is cleared so the bot does not stay trapped in the old workflow.

The continuation planner sees the canonical workflow capability contract for published schema-v2 workflows. Legacy runtime graphs still receive a sanitized compatibility summary. Neither path receives headers, request bodies, extra headers, URL query strings, credentials, or protected runtime variables.

## Execution Traces And Debugging

The **Trace** tab shows the latest workflow executions:

- **Status** — completed, failed, waiting, running, or delayed
- **Node trace** — which nodes ran, in what order, with what inputs and outputs
- **Variables** — the full workflow state at each step
- **Timing** — how long each node took
- **Error details** — if a node failed, the error message and context

Use traces to debug unexpected behavior, verify that conditions route correctly, and confirm that API calls return the expected data.

The editor also includes draft-only confidence tools before you create a release:

- **Mapping Preview** for action, HTTP Request, and API Connector nodes
- **Dry Run** for HTTP Request and API Connector nodes using current mapped inputs
- **Test chat** against the saved draft workflow instead of the live release
- **Replay / rerun** from recorded trace state when you need to debug a specific failure or regression

Use the per-workflow **Trace** tab when you are iterating on one workflow. Use the standalone **Workflow Runs** resource when you need a global operational view across all workflows, exports, and related submission outcomes.

If a run stores structured data through `store_submission`, review the resulting record in **Submissions** and jump back to the originating workflow or conversation from there.

## Linking A Workflow To A Bot

A workflow is linked to a bot from the workflow's settings. Once linked:

- a verified published deployment can be selected as the bot's live deployment
- the workflow's trigger node receives user messages
- the bot's knowledge base is available to Knowledge Base nodes in the workflow

The important assignment rule is:

- a bot may store many workflow records for drafts, experiments, and release history
- a bot may route chat to only one verified live deployment at a time
- making a different verified deployment live replaces the previous live selection
- draft-only workflows are visible in lists and bot overviews, but cannot receive live chat until a deployment is published and made live
- if you need multiple distinct chatbot experiences, create multiple bots

Publish, make-live, stop-live, and rollback use the shared release service. If legacy data contains conflicting pointers, the Workflows list and Doctor expose a blocking diagnostic; operators repair it through the verified release/migration path rather than choosing a workflow implicitly.

Attached sources become usable only through a reachable Knowledge step. The workflow editor warns when a source-backed bot's draft has no such step, and the empty-canvas starter recommends **Knowledge Assistant** for a source-grounded flow.

This is the intended UX model. Do not treat multiple workflows on one bot as multiple chatbot products. Treat them as alternate drafts or releases for one chatbot.

## Recommended Adoption Path

Start with the smallest workflow that covers the bot's job:

1. Choose Simple Assistant for general help or Knowledge Assistant for grounded answers.
2. Confirm the prompt, sources when used, and widget UX.
3. Add intake, routing, Data Resource, API Operation, or write steps only when the use case needs them.
4. Iterate with drafts, saved tests, runs, and traces.
5. Publish and make the verified deployment live only after review passes.

## Strong Early Workflow Use Cases

- Sales / lead qualification
- Support triage and escalation
- Onboarding wizards
- FAQ plus fallback-to-human
- Helpdesk intake forms
- Feedback collection

## Best Practices

- Keep workflows focused on one job per workflow
- Use Knowledge Base nodes where accuracy matters
- Use branching where the user journey genuinely changes
- Review AI-generated workflows before publishing
- Always include a default/fallback branch for unexpected inputs
- Enable `continueOnFail` only when the next step explicitly handles the error variable
- Run a real queue worker if you use Delay or resumable behavior
- Use release notes so your team knows what changed and why

## Related Docs

- [API Connectors](API_CONNECTORS.md) — reusable external API profiles
- [Workflow JSON Schema](WORKFLOW_JSON_SCHEMA.md) — full node schema reference
- [Workflow Prompt Templates](WORKFLOW_PROMPT_TEMPLATES.md) — ready-to-paste generation prompts
- [Bots](BOTS.md) — how bots connect to workflows
- [Core Concepts](CORE_CONCEPTS.md) — how all pieces fit together
