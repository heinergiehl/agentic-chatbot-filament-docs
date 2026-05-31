# Agentic Workflows

Workflows are the biggest capability gap between a knowledge-only assistant and this plugin. They turn the assistant runtime into a guided, multi-step experience that can collect data, branch by intent, call APIs, and take backend actions.

## What A Workflow Is

A workflow is a visual graph that defines how a bot should behave over multiple conversation turns.

Without a workflow, the assistant can still answer directly, use memory, or search uploaded sources when that capability is available. A source-grounded exchange usually follows this path:

1. user asks a question
2. retrieve context from the knowledge base
3. answer

With a workflow, the bot can do something more structured:

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
- a sidebar with all available node types
- per-node configuration panels for prompts, conditions, and data mappings
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

To keep the catalog usable as it grows, the sidebar now exposes nodes in three tiers:

- **Essential** for the smallest reliable set used in most production workflows
- **Advanced** for common power features such as confidence checks, structured output, connectors, joins, and delay steps
- **Expert** for specialist nodes such as loops, sub-workflows, random splits, expressions, and other higher-complexity building blocks

Start in **Advanced** unless you have a reason to hide complexity further. Move to **Expert** only when the flow genuinely needs those capabilities.

## Node Types

Every workflow is built from these building blocks. The editor exposes a broad catalog, so a good practice is to start with the smallest useful set, then add advanced nodes only when the flow needs them:

- **Core conversation nodes**: Trigger, Send Message, Collect Input, Condition, Switch Router, Set Variable, End
- **Grounding and AI nodes**: Knowledge Base, Answer, AI Agent, Query Rewrite, Summarize, Structured Output, Confidence Check, Guardrail, Intent Classifier, Sentiment
- **Integration and data nodes**: Action, HTTP Request, API Connector, Entity Extractor, Transform, Rerank, Context Builder
- **Control and operations nodes**: Validation, Confirmation, Error Handler, Memory Read/Write, Log, Random Split, Expression, Sub-Workflow, Join, Loop, Delay, Note

The editor also exposes a dedicated **Data Retrieval** preset for safe internal reads. That preset still uses the **Action** node under the hood with the built-in `query_data_resource` action key, rather than a separate runtime node type.

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

### Query Rewrite

Uses an AI model to convert the raw user message or collected input into a cleaner internal search/query string. This is useful before Knowledge Base or data-resource lookups.

### Summarize

Uses an AI model to condense long context, API results, or conversation state before a later answer or extraction step.

### Structured Output

Uses an AI model to return JSON and then validates the decoded output against the configured schema. It routes through `valid` or `invalid` handles and writes both the parsed output variable and an `*_error` variable.

Supported schema styles:

- compact field maps, e.g. `{"email":"string","budget":"number"}`
- JSON Schema-style objects with `type`, `properties`, `required`, `items`, `enum`, and `additionalProperties`

### Knowledge Base

Runs knowledge retrieval inside the workflow. This lets the assistant stay grounded in your documentation while still following a multi-step process. Configure it with the same `top_k` and `min_similarity` controls available on the bot.

### Confidence Check

Checks whether retrieved context or structured data is strong enough to continue. It routes through `valid` or `invalid`.

### Guardrail

Checks user input or variables for unsafe content or configured PII patterns before allowing downstream work.

### Context Builder

Combines selected variables, retrieved records, and optional user input into one formatted context variable.

### Rerank

Orders retrieved records by query overlap and stores the trimmed result set plus scores. This is a deterministic relevance pass, not an embedding or cross-encoder reranker.

### Error Handler

Converts an upstream `*_error` variable into a clear success/failure branch. Use it after API, action, or retrieval nodes.

### Confirmation

Asks the user to confirm or cancel a sensitive operation. It resumes through `valid` or `invalid` branch handles.

### Action

Calls a backend action registered in your Laravel app. Typical examples:

- create a support ticket
- send an email notification
- save lead data to your CRM
- trigger a custom business process

Actions are registered via the plugin's `ActionRegistry` and can receive workflow variables as parameters.

Custom actions may declare `capability: query` or `capability: write` in config so the linked bot's capability mode can block incompatible actions before publish and at runtime.

In the editor UI, safe internal lookups are also surfaced as a dedicated **Data Retrieval** preset. It is still an Action node at runtime, preconfigured around the built-in `query_data_resource` action key.

Built-in action keys include:

- `store_submission` for schema-driven writes that appear in the `Submissions` review resource
- `query_data_resource` for read-only queries against allow-listed internal Eloquent resources on the linked bot

`query_data_resource` is only valid when the linked bot allows queries and the selected resource key is explicitly enabled for that bot.

For generic catalog questions such as newest, oldest, highest, lowest, cheapest, or filtered records, use a `structuredOutput` step to extract a query plan, then pass exact `{{planned_query.*}}` templates into `query_data_resource` via `filter_clauses`, `sort`, `mode`, and `limit`. Resource `field_metadata` should describe date, numeric, enum, and text fields so generated workflows can map natural language to safe allow-listed fields.

For no-code setup, use the bot Behavior tab's **Smart Data Queries** settings plus the workflow editor's **Smart Data Query** starter. The admin only selects allowed data sources and chat-sized result limits; the generated workflow handles the query-plan JSON and the data-retrieval mapping.

For request-style nodes, `GET` is treated as query behavior, while `POST`, `PUT`, `PATCH`, and `DELETE` are treated as write behavior when capability mode is enforced for the linked bot.

### HTTP Request

Calls an external URL directly from the workflow. Configure method, URL, headers, body, timeout, and whether the flow should continue on failure. Use this for one-off integrations where you do not need a reusable connector profile.

Non-2xx responses and missing URLs stop the workflow by default. Enable `continueOnFail` only when a downstream fallback branch reads the `*_status` or `*_error` variables and handles the failure intentionally.

### API Connector

Calls a saved API connector profile. Connectors store base URL, authentication, default headers, and timeout so you can reuse them across multiple workflows without duplicating credentials. See [API Connectors](API_CONNECTORS.md).

API Connector nodes follow the same failure model as raw HTTP Request nodes: non-2xx responses preserve response/status/raw/error variables, but stop the workflow unless `continueOnFail` is enabled.

### Set Variable

Stores a literal value or interpolated template result in the workflow state. Use Transform or Expression when you need actual data manipulation.

### Entity Extractor

Extracts simple fields such as email, dates, or regex matches from text and can write individual variables.

### Memory Read / Memory Write

Reads and writes small workflow memory values. Use the default `conversation` scope for normal chat follow-ups, such as `current_topic`, `selected_item`, or an intake draft. Use `workflow_run` only for temporary scratch state that should not survive beyond one execution.

The runtime and JSON import path also support broader `session`, `actor`, and `bot` scopes for advanced integrations, but the editor keeps the common path focused on `conversation` and `workflow_run`.

### Validation

Validates a variable with common rules such as email, URL, regex, length, required, numeric, or range, then routes `valid` or `invalid`.

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

Workflows follow a draft → publish lifecycle:

1. **Draft** — edit nodes, connections, and settings freely without affecting live behavior
2. **Publish** — snapshot the current draft as a new version with release notes
3. **Live** — the published version is what the bot actually executes
4. **Rollback** — revert to any previous published version if a new release causes issues

This means you can iterate on a workflow safely. Draft changes never affect users until you explicitly publish.

This is not extra ceremony. The draft/release split protects the live bot from half-finished edits, gives your team an audit trail with release notes, and makes rollback practical when a new automation path behaves unexpectedly.

## Workflow Generation

The **AI Draft** tab lets you describe the workflow you want in plain English:

> "Greet the user, ask for their name and issue type, search the knowledge base, and if confidence is low route to a human support form."

The AI generates a first-draft workflow graph that you can review, adjust, and refine before publishing. This is especially useful for:

- bootstrapping a new workflow quickly
- exploring what a flow could look like
- getting a starting point when you are not sure which nodes to use

Always review generated workflows before publishing. The AI draft is a starting point, not a finished product.

Generated workflows are saved as drafts and still pass through the same structural validator, semantic linter, capability checks, and publish guards as hand-built workflows.

## Execution Traces And Debugging

The **Runs** tab shows every execution of the workflow:

- **Status** — completed, failed, or halted
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

Use the per-workflow **Runs** tab when you are iterating on one workflow. Use the standalone **Workflow Runs** resource when you need a global operational view across all workflows, exports, and related submission outcomes.

If a run stores structured data through `store_submission`, review the resulting record in **Submissions** and jump back to the originating workflow or conversation from there.

## Linking A Workflow To A Bot

A workflow is linked to a bot from the workflow's settings. Once linked:

- the bot uses the workflow for all new conversations
- the workflow's trigger node receives user messages
- the bot's knowledge base is available to Knowledge Base nodes in the workflow

The important assignment rule is:

- a bot may store many workflow records for drafts, experiments, and release history
- a bot may route chat to only one enabled workflow at a time
- enabling a different linked workflow replaces the previous live chat assignment
- if you need multiple distinct chatbot experiences, create multiple bots

Activation uses a shared service in the edit page, list-page conflict repair action, and model-level safety net. If legacy data contains multiple active workflows for one bot, the Workflows list shows a routing conflict and **Fix routing conflicts** normalizes the bot back to one live workflow. The doctor command also warns about this state in production checks.

Sources make direct bots useful; active workflows must explicitly search sources. The workflow editor warns when a source-backed bot is assigned but the draft has no reachable Knowledge Base node, and the empty-canvas starter recommends **Knowledge Assistant** as the default source-grounded flow.

This is the intended UX model. Do not treat multiple workflows on one bot as multiple chatbot products. Treat them as alternate drafts or releases for one chatbot.

## Recommended Adoption Path

Do not start by making every bot fully agentic. A cleaner path:

1. Launch a simple knowledge-grounded assistant first
2. Confirm your sources, retrieval settings, and widget UX are solid
3. Identify a use case where pure Q&A is not enough (e.g., intake, triage, qualification)
4. Add a workflow only for that use case
5. Iterate using drafts, runs, and traces before publishing

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
