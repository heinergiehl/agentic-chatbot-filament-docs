# Agents

The Launch Dashboard shows one next step and keeps optional setup in a closed
section. Create an Agent with the existing conversation or knowledge starting
point. Valid host provider/model defaults are shown and retained; missing chat
credentials have a visible repair path. Knowledge and Playbooks are optional.

This is the specific documentation page to share when someone asks:

- what an Agent is
- how to create an assistant in Filament Agentic Chatbot
- what can be customized per Agent
- how public and internal Agents differ

## What An Agent Is

An Agent is one assistant configuration inside Filament Agentic Chatbot.

Think of it as the persisted product definition for one assistant experience. An Agent tells the system:

- what the assistant is for
- which knowledge sources it can use
- how retrieval should behave
- which knowledge, capabilities, and optional Playbooks its published Agent may use
- who can access it
- how the widget should look

This is why one Laravel + Filament app can run multiple assistants with different behavior from one panel.

## One Live Agent, Optional Playbooks

Every Agent answers chat through exactly one verified live deployment. The Agent owns ordinary conversation, intent understanding, clarifications, grounded answers, and user-facing failure responses. It does not need a canvas for simple or knowledge-backed chat.

An Agent may have zero or more Playbooks for bounded processes. A Playbook is an optional tool for explicit input collection, deterministic branching, approvals, delays, bounded iteration, or external operations. Drafts and unassigned Playbooks grant no authority. Publishing the Agent pins the exact knowledge sources, capabilities, budgets, and immutable Playbook deployments it may use.

The Agent Overview shows the active deployment, version/hash, knowledge, capabilities, assigned Playbooks, budgets, and integration health without exposing engine diagnostics as normal configuration.

## What You Can Customize Per Agent

Each Agent owns its own:

- name and public ID
- system prompt and response behavior
- provider and model
- retrieval settings
- capability mode
- allowed internal data resources
- allowed domains
- context areas
- widget branding and prompts
- linked sources
- explicitly assigned input and output Guardrail Policies

In practice, this means you can create:

- a public product-help Agent
- an admin-only setup assistant
- a customer-facing onboarding Agent
- a tenant- or customer-specific knowledge Agent

## How To Create An Agent

1. Open **Agentic Chatbot > Build > Agents** in your Filament panel.
2. Choose **Create Agent** to open the existing wizard directly. **Use template** is the secondary entry to the Solution Kit wizard.
3. In **Purpose**, choose **Have a conversation** (the default) or **Answer from my content**. Enter the name and job, then edit the suggested boundaries. **AI connection** shows the configured provider and verified model; missing credentials or a model profile need repair before a test version can be prepared. A configured credential does not prove a successful connection test.
4. **Review** summarizes the purpose and connection. Creating saves a paused, unpublished draft and opens **Overview**. The content starting point recommends adding the first source there; a conversation Agent has no required knowledge source. The starting point is authoring metadata only and grants no runtime authority.
5. Follow the [Quick Start golden path](QUICKSTART.md#7-golden-path-agent-to-live-deployment) to test, publish, and activate the Agent. Add a Playbook only when the job needs a bounded process.

Creating the Agent saves its settings. Visitor access also requires a verified active release, enabled availability, and valid channel access. Selecting a tested release keeps a paused Agent paused.

### Creating From A Solution Kit

A Solution Kit creates one coherent, inactive authoring bundle instead of a live Agent. The built-in **Customer Support & Human Handoff** Kit includes support behavior, optional mappings to approved app reads, a confirmation-gated handoff Playbook, saved quality tests, widget copy, and outcome goals.

Installation is atomic and idempotent. It does not publish, activate, call an external service, or execute a write. The Agent Overview then shows the required release path through current-draft tests, immutable Playbook publication, Agent assignment, candidate testing, activation, and public traffic enablement. See [Solution Kits](SOLUTION_KITS.md).

## Agent Control Center

After saving an Agent, use the edit page as your rollout checklist before you publish or embed it widely.

- **Overview** is the first stop. A compact context shows availability (**Enabled** or **Paused**) and the verified selected version separately. One deterministic next step, a summary of completed checks and short repair links replace the full repeated release checklist. Name and role use the explicit draft save; availability uses its separate action. Pausing retains the selected version and its evidence. Technical details start closed; the explicit `diagnose=overview` link opens them.
- **Readiness** shows the active chat provider, model, key path, embedding setup, and infrastructure status currently backing the Agent.
- **Production readiness** also surfaces widget signing/domain posture and the verified Knowledge generations pinned to the live release. A failed new indexing attempt does not by itself invalidate a usable pinned generation.
- **Appearance preview** opens explicitly in Website > Design and shows the current draft widget appearance without running the Agent or producing release-test evidence.
- **Test release candidate** tests the published candidate. **Test live Agent** always tests the selected active release, including when a different candidate exists. Both use real provider calls and reads while blocking productive writes; neither enables availability.
- **Technical checks** show provider, vector-backend, queue, and deployment readiness. Use the doctor command for the fuller release blocker.
- **Website** starts in **Set up**, with numbered steps to allow a website, paste valid code, and check the installation. **Design** contains appearance settings and an explicitly opened native preview dialog. The former Embed Snippet action links to this tab.
- **Analytics** becomes the next stop once you have live conversations, because it surfaces feedback, citation coverage, traffic, and knowledge gaps.

In **Knowledge & capabilities**, compact native sections show draft capabilities and knowledge sources separately. **Add capability** opens a type-first modal for knowledge, API/MCP reads, app data, or an optional Playbook. Its searchable selection uses the authorized library; contextual creation retains the Agent return path without automatically assigning the new definition. Rows show a short business description, read/write effect, version differences and **Edit**. The **More** menu opens version details or removes only the form assignment, never the shared definition. Shared configuration is identified in the chooser and row details.

The row's **Test changes** action saves through the existing draft boundary, prepares or reuses a matching verified version, and opens the test workspace with that published ability selected. The workspace puts the question and conversation before diagnostics. It has one expected-ability choice, the existing published examples, a compact coverage summary and closed status/details lists. Results separate assistant text from recorded capability calls and the existing pass/failure decision; unavailable execution evidence stays unknown. Productive writes remain blocked. **Free exploration** supports follow-up questions without release evidence. Historical conversations retain their exact version and become read-only after the target changes. Rendering, version/purpose switches and history reads create no candidate, conversation or model call.

Adding or removing a capability changes only the form draft and preserves other unsaved inputs. **Save draft** persists those changes after current scope, published-release, permission and conflict checks; it does not publish, prepare or activate a version. Invalid or unavailable assignments remain visible for repair or removal. Leaving for a dedicated editor offers save, discard or stay; validation errors preserve the draft. Knowledge sources belong to the Agent and retain their dedicated ingestion/configuration editor and processing status.

**Permissions & technical details** is collapsed by default and groups the mode control, effective permissions, Data Resource field policies and limits, capture rules, and guardrails. Blocking assignment warnings remain visible above the sections with a repair action. The mode labels remain **Read access**, **Approved write actions**, and **Read access and approved write actions**, mapped to `query_only`, `write_only`, and `query_and_write`. A direct Connector write cannot be assigned; controlled Playbook writes still require compatible Agent permissions, their published confirmation and policy contracts. The tab query ID remains `behavior`.

The native page inherits the host font and primary color. Its scoped panel CSS is registered as a versioned package asset, so a standard Filament panel needs no package-source Tailwind scan or host theme build. A panel without the plugin receives no package assets from plugin registration.

### Assigning Guardrail Policies

In **Knowledge & capabilities > Permissions & technical details**, assign enabled Guardrail Policies separately to incoming and
outgoing text. Up to 16 policies per direction can be selected. An enabled policy
record alone protects no Agent: **Publish candidate** freezes the assignments
and policy contents, **Test release candidate** checks that exact candidate, and
**Select tested release** selects it through the normal release gates without changing availability.

Editing, disabling, or deleting an authoring policy does not rewrite an existing
release. Historical and resumed turns use their pinned policy snapshot. Publish,
test, and activate a new candidate to change live protection; a policy edit also
invalidates candidate evidence based on the old policy contents.

The policy list distinguishes enabled authoring records from verified live
assignments and reports changed, unavailable, or restricted evidence honestly.
The existing runtime safety boundary remains active. These deterministic text
checks do not inspect image/PDF/file contents and are not a general semantic
safety guarantee. Opaque Rules JSON has no productive interpreter and cannot be
published as an assigned policy.

## Important Agent Fields

### Name

The human-readable label used in Filament and often in the widget header.

Use a name that tells the visitor what the Agent is for, such as:

- `Filament Agentic Chatbot Guide`
- `Customer Onboarding Assistant`
- `Internal Ops Assistant`

### Public ID

The stable identifier used by the widget and public chat endpoints.

This is what your embed snippet references. Keep it predictable and slug-like because it is part of the integration surface.

### Instructions

The instructions field defines the Agent's role, scope, tone, and response rules.

Use it for:

- role definition
- audience targeting
- answer style
- boundaries and fallback behavior
- docs-linking behavior

Do not use it as a substitute for real source content. Instructions guide behavior; sources provide the grounded knowledge.

### Provider And Model

You can choose which provider and model an Agent uses for chat.

This lets you optimize different Agents for:

- speed
- response quality
- cost
- provider-specific capabilities

The built-in provider picker supports Gemini, OpenAI, Anthropic, xAI, OpenRouter, DeepSeek, Groq, Mistral, Ollama, Azure OpenAI, and OpenAI-compatible gateways. The package catalogue records common provider model IDs, but the recommended selector exposes only entries that also have an explicit verified assistant capability profile. The **Manual ID** option lets you enter an exact model identifier after its profile has been configured.

Catalogue membership and manual IDs are safe by default: neither implicitly receives developer-instruction, tool-calling, streaming, or native JSON-schema support from its name. For a private, preview, or self-hosted model whose capabilities you have verified, declare a profile under `filament-agentic-chatbot.models.capabilities`; the form, runtime, and doctor command then validate the configured model against the required Agent profile. Playbook generation additionally requires a verified structured-output profile and fails closed when none is available.

Use OpenRouter for routed models such as Qwen or DeepSeek variants without adding a provider-specific integration for each model family. Use **OpenAI-Compatible** when the provider exposes a chat-completions-style API with a custom base URL, such as Qwen DashScope compatible mode or a private gateway. Enter the base URL on the Agent, or configure it globally with:

```env
AGENTIC_CHATBOT_OPENAI_COMPATIBLE_DRIVER=openrouter
AGENTIC_CHATBOT_OPENAI_COMPATIBLE_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
AGENTIC_CHATBOT_OPENAI_COMPATIBLE_API_KEY=...
```

The custom base URL is used by both normal Agent replies and bounded Playbook AI Tasks. It should include the provider's `/v1` path when that provider requires it.

For production examples, see [OpenAI-Compatible Providers](OPENAI_COMPATIBLE_PROVIDERS.md).

### Retrieval Settings

The most important retrieval settings are:

- `top_k`: how many chunks to retrieve
- `min_similarity`: how strict the relevance filter is
- context budget: how much retrieved content can be passed into the answer prompt

These settings strongly influence whether the Agent feels too vague, too strict, or well-grounded.

### Capability Mode

Capability mode controls what the published Agent and its pinned Playbooks may do at runtime:

- `query_only` allows knowledge queries and read-only internal data lookups
- `write_only` allows structured writes or capture flows, but blocks query behavior
- `query_and_write` allows both

This matters most once an Agent is linked to Playbooks.

- `query_data_resource` and knowledge search require query capability.
- `mutate_data_resource` requires write capability and is available only inside a published Playbook with an explicit resource mutation policy.
- `store_submission` requires write capability.
- `httpRequest` and `apiConnector` treat `GET` as query behavior and `POST` / `PUT` / `PATCH` / `DELETE` as write behavior.
- Request retries are conservative: `POST` and `PATCH` are not retried unless the Playbook uses an explicitly idempotent external API contract.
- Host actions are declared by a tagged `CapabilityProvider` as immutable `CapabilityActionDefinition` objects, including their side effect, request/result schemas, confirmation policy, idempotency policy, and required secret-free `CapabilitySemanticProfile`.
- Untagged custom actions are not auto-classified, so treat them as application-level responsibility.

### Allowed Internal Data Resources

Agents can opt into specific internal Data Resources. With natural data questions enabled, publishing the Agent freezes each approved resource as its own direct read-only tool. A Playbook may separately bind a resource for a governed query or, when the global resource defines an explicit write policy, a confirmed create/update step.

Each enabled resource is:

- defined globally in **Data Resources**
- optionally seeded from `filament-agentic-chatbot.data_resources.resources`
- allow-listed and optionally narrowed per Agent
- read-only when exposed directly to the Agent; optional writes are Playbook-only and separately governed
- limited to the declared fields, filters, sort options, and max limit

Use this for conversational facts such as product availability or case status, or for a controlled Playbook step that needs internal business records without exposing arbitrary database access. Mutation policies allow only one scoped insert or optimistic update; arbitrary SQL, bulk mutation, and delete remain unavailable.

If records belong to an Agent, tenant, team, or customer, add that boundary as a Data Resource safety scope or through your model design. Safety scope filters are always applied by the runtime and do not need to appear as normal Playbook filters.

In the Filament panel, use **Agentic Chatbot > Connect > Data Resources** to follow the guided setup: choose records, approve information, set result guardrails, and add safety scope. The Agent edit page can only approve or narrow those global rules.

The package config remains useful for install-time seeds and code-reviewed defaults, but normal admin changes should happen in **Data Resources**. Use **Sync from config** only when you intentionally want to create or overwrite UI-managed resources from published config.

The built-in `bots` resource is scoped to the current Agent by default. Expose a global Agent catalog only by changing that resource in **Data Resources** or by syncing an intentional config override.

### Natural Data Questions

The **Tools & Data** tab also includes **Understand natural data questions**. This is the admin-friendly layer above the same closed `query_data_resource` contract.

Admins choose:

- which data resources the Agent may read
- whether the Agent should publish those resources as independent direct read tools
- the default and maximum number of records for each direct query
- a preview of each selected resource's sorting, filters, returned fields, hidden safety scope, and result limits

The Agent maps a natural request to a complete typed query. Filter values must be grounded in the latest visitor message, and the runtime validates all fields, operators, types, sorting, and limits again at the central capability gateway. Playbooks still use explicit fixed or bounded AI-produced query plans when query order belongs to a controlled process.

For product catalogs, give important values friendly labels, types, visitor phrases, and usage notes, such as price, created date, availability, and name. Natural requests like "cheapest product" or "two newest products" work best when those fields are clearly marked as sortable or filterable.

### Allowed Domains

Allowed domains limit where the widget can be embedded.

Use this when you want a public Agent on your marketing site but do not want the widget embedded elsewhere.

Empty allowlists are compatibility-only when `AGENTIC_CHATBOT_WIDGET_ALLOW_ALL_DOMAINS=true`. Production Agents should list exact hosts.

### Context Areas

Context areas help separate different assistant experiences such as:

- `public`
- `member`
- `admin`

Use different Agents when access scope or audience meaningfully changes.

### Widget Settings

Website access and appearance have separate explicit save actions and conflict checks. Saving the Agent draft does not save either form. Tab switches retain their unsaved values; reloading saved settings requires confirmation. An exact domain and each subdomain need separate permissions. The domain details explain HTTP(S) URL normalization and explicit wildcards without extending access automatically.

The embed code uses saved settings and is available only when a valid public ID, allowed website host, verified selected version, signing and area settings, and enabled visitor access are present. Missing prerequisites show a repair action. Copying confirms only clipboard success; installation remains **not yet checked** until there is real evidence. The provided manual steps can make real visitor requests and incur provider usage.

**Design** puts template, accent, language and size first. Texts and suggested questions, further display options including the existing widget fonts, and area overrides are separate sections. **Open preview** shows current draft appearance inside a native dialog without saving or running the Agent. Closing it restores focus to the opener; leaving Design or Website, reloading or navigating away removes the preview and its listeners. System labels follow the widget language; saved customer text, including the welcome message, is preserved. Use **Open test area** to test replies. The host panel keeps its own font and theme.

Each Agent can have its own:

- title
- subtitle
- welcome message
- empty-state hint
- up to four structured conversation starters with optional safe icons
- accent color
- style template
- compact mode

This matters because the widget is what the end user actually sees. The title and subtitle should explain why the assistant exists on that page.

### Agent To Playbook Assignment

One Agent can have multiple Playbooks, but Playbooks never own live chat traffic. The single active Agent deployment owns the conversation and pins each allowed Playbook by ID, deployment ID, and hash.

Use that model like this:

- keep extra Playbooks as drafts, alternatives, or release history for the same Agent
- publish an immutable Playbook, assign it, then publish a new Agent deployment to grant that exact version
- create a separate Agent when you need a genuinely different chatbot experience

The Agent edit page shows its published contract and assigned Playbooks. The Playbook list shows publication and Agent-usage state. A mutable draft cannot be invoked, and publishing a Playbook does not silently change an already active Agent deployment.

This keeps authority, analytics, sessions, and UX understandable.

## How Agent Customization Affects The User Experience

### Prompt + Sources

This controls what the Agent is supposed to do and what it can answer from.

### Retrieval Settings

This controls whether the Agent feels grounded, noisy, or too narrow.

### Capability Mode And Data Access

This controls whether the Agent and its pinned Playbooks can search knowledge, capture structured data, or safely query internal records.

### Context And Access

This controls whether the Agent is public, member-only, or admin-only.

### Widget Copy And Branding

This controls whether a visitor instantly understands the purpose of the assistant.

For example:

- a vague Agent title creates confusion
- a clear subtitle explains why the Agent is on the page
- focused conversation starters help users reach a useful first turn

## When To Create A Separate Agent

Create a separate Agent when you need a different:

- audience, such as public visitors vs internal admins
- source set, such as product docs vs internal runbooks
- tone or prompt behavior
- widget design or onboarding copy
- provider/model combination
- access policy
- capability and Playbook authority

Do not create separate Agents only to change one small answer. Start with the Agent prompt and source set first.

## Typical Agent Patterns

### Public Product Guide

Use for:

- presales questions
- onboarding questions
- public documentation
- feature discovery

### Internal Ops Assistant

Use for:

- admin-only support
- runbooks
- setup help
- maintenance Playbooks
- safe internal data lookups via `query_data_resource`

### Customer-Specific Assistant

Use when you need:

- customer-specific docs
- tenant-specific knowledge
- branded per-customer assistants

## Best Practices

- Keep each Agent focused on one job and one audience.
- Use different Agents when source quality or permissions differ.
- Write a system prompt that explains exactly what the Agent is for.
- Give the widget title and subtitle a clear user-facing purpose.
- Add conversation starters that reflect real user intent. Give each one a short visible label and a complete prompt to send.
- Test retrieval after adding or changing sources.
- Keep every answer and capability inside the published Agent contract.
- Start without a Playbook for general help and source-grounded replies.
- Add a Playbook only for a bounded process that benefits from explicit state, branching, approval, or external work.

## Related Docs

- [Core Concepts](CORE_CONCEPTS.md)
- [Agent Runtime Architecture](AGENT_RUNTIME_ARCHITECTURE.md)
- [Knowledge Sources](KNOWLEDGE_SOURCES.md)
- [Data Resources](DATA_RESOURCES.md)
- [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)
- [Context Areas](CONTEXT_AREAS.md)
- [Chat Widget](CHAT_WIDGET.md)
- [API Integrations](API_INTEGRATIONS.md)
- [OpenAI-Compatible Providers](OPENAI_COMPATIBLE_PROVIDERS.md)
