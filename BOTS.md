# Agents

The Agents list shows each Agent's status and its one open step (add content,
repair setup, Publish or Republish) as a row action. Create an Agent with the existing conversation or knowledge starting
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
- Safety settings (topic limits, blocked words, personal data)

In practice, this means you can create:

- a public product-help Agent
- an admin-only setup assistant
- a customer-facing onboarding Agent
- a tenant- or customer-specific knowledge Agent

## How To Create An Agent

1. Open **Agentic Chatbot > Build > Agents** in your Filament panel.
2. Choose **Create Agent** to open the existing wizard directly. **Use template** is the secondary entry to the Solution Kit wizard.
3. In **Purpose**, choose **Have a conversation** (the default) or **Answer from my content**. Enter the name and job, then edit the suggested boundaries. **AI connection** shows the configured provider and verified model; missing credentials or a model profile need repair before the Agent can answer. A configured credential does not prove a successful connection test.
4. **Review** summarizes the purpose and connection. Creating saves a paused, unpublished draft and opens **Overview**. The content starting point recommends adding the first source there; a conversation Agent has no required knowledge source. The starting point is authoring metadata only and grants no runtime authority.
5. Follow the [Quick Start golden path](QUICKSTART.md#7-golden-path-agent-to-live-deployment) to test and publish the Agent. Add a Playbook only when the job needs a bounded process.

Creating the Agent saves its settings. Visitor access also requires a published, verified version, enabled availability, and valid channel access. Publishing keeps a paused Agent paused.

### Creating From A Solution Kit

A Solution Kit creates one coherent, inactive authoring bundle instead of a live Agent. The built-in **Customer Support & Human Handoff** Kit includes support behavior, optional mappings to approved app reads, a confirmation-gated handoff Playbook, Agent tests, widget copy, and outcome goals.

Installation is atomic and idempotent. It does not publish, activate, call an external service, or execute a write. The Agent Overview then shows the next step: immutable Playbook publication, Agent assignment, testing in the playground, publishing, and enabling public traffic. See [Solution Kits](SOLUTION_KITS.md).

## Agent Control Center

After saving an Agent, use the edit page as your rollout checklist before you publish or embed it widely.

- The page header shows one release state for the Agent, the same as in the Agent list: **Not published**, **Live** (with its version), **Unpublished changes**, or **Republish needed** when the live version no longer verifies or uses an outdated pin format. Its one action is **Publish** (**Republish**).
- **Overview** shows availability (**Enabled** or **Paused**) and the release state, one next step and short repair links. Availability uses its separate action; pausing keeps the live version. Technical details start closed; the explicit `diagnose=overview` link opens them.
- **Readiness** shows the active chat provider, model, key path, embedding setup, and infrastructure status currently backing the Agent.
- **Production readiness** also surfaces widget signing/domain posture and the verified Knowledge generations pinned to the live release. A failed new indexing attempt does not by itself invalidate a usable pinned generation.
- **Appearance preview** opens explicitly in Website > Design and shows the current draft widget appearance without running the Agent or producing release-test evidence.
- **Test** opens a chat beside the editor that runs the saved draft: multi-turn, tool calls inline, write and Playbook approval cards decided in a sandbox (writes are simulated, never executed). **Reset conversation** starts over. It uses real provider calls and reads and never changes the live version.
- **Tests** lists saved conversations with checks (tool called or not, answer contains or not, a rubric graded by a model) and runs them against the saved draft in the test sandbox; see [Agent Tests](AGENT_TESTS.md).
- **Publish** makes the saved draft live as a new immutable version in one step; problems that prevent it are listed with links; failed or not run tests show as warnings. **Versions** lists published versions with number, time, author and note; **Restore** makes an earlier version live again after verifying it.
- **Technical checks** show provider, vector-backend, queue, and deployment readiness. Use the doctor command for the fuller release blocker.
- **Website** starts in **Set up**, with numbered steps to allow a website, paste valid code, and check the installation. **Design** contains appearance settings and an explicitly opened native preview dialog. The former Embed Snippet action links to this tab.
- **Analytics** becomes the next stop once you have live conversations, because it surfaces feedback, citation coverage, traffic, and knowledge gaps.

In **Knowledge & capabilities**, compact native sections show draft capabilities and knowledge sources separately. **Add capability** opens a type-first modal for knowledge, API/MCP reads, app data, or an optional Playbook. Its searchable selection uses the authorized library; contextual creation retains the Agent return path without automatically assigning the new definition. Rows show a short business description, read/write effect, version differences and **Edit**. The **More** menu opens version details or removes only the form assignment, never the shared definition. Shared configuration is identified in the chooser and row details.

Adding or removing a capability changes only the form draft and preserves other unsaved inputs. **Save** persists those changes after current scope, published-release, permission and conflict checks; it does not publish. Invalid or unavailable assignments remain visible for repair or removal. Leaving for a dedicated editor offers save, discard or stay; validation errors preserve the draft. Knowledge sources belong to the Agent and retain their dedicated ingestion/configuration editor and processing status.

**Permissions & technical details** is collapsed by default and groups the mode control, effective permissions, Data Resource field policies and limits, and capture rules. Blocking assignment warnings remain visible above the sections with a repair action. The mode labels remain **Read access**, **Approved write actions**, and **Read access and approved write actions**, mapped to `query_only`, `write_only`, and `query_and_write`. Direct writes and lead capture need a mode with approved write actions; Playbook writes additionally need their published confirmation and policy contracts. The tab query ID remains `behavior`.

### Read-only view

An admin whose Gates allow viewing Agents (`filament-agentic-chatbot.view-bots`) but not managing them (`filament-agentic-chatbot.manage-bots`) opens an Agent from the list in a read-only view at `/{panel}/bots/{record}`; the edit page stays forbidden for them. The view shows the saved draft with all fields disabled: Overview, AI Setup, Knowledge & capabilities, Website (with the embed code), Advanced and Versions, plus the release state and an **Analytics** link. It has no save, **Publish**, **Restore**, **Test** or assignment actions, and it leaves out the **Tests** tab and **API key overrides**. Knowledge, API/MCP, data and Playbook rows appear only when the viewer may see that record. Every write still checks `manage-bots` on the server, also for a user who could manage the Agent and opens the view. Users who can manage the Agent see an **Edit** action there, and the list opens the edit page for them.

The native page inherits the host font and primary color. Its scoped panel CSS is registered as a versioned package asset, so a standard Filament panel needs no package-source Tailwind scan or host theme build. A panel without the plugin receives no package assets from plugin registration.

### Safety

**AI setup > Safety** holds the Agent's safety settings. They take effect with
the next **Publish**; earlier versions and resumed turns keep the settings
they were published with.

- **Only talk about** and **Never talk about** describe topics in plain
  language. They become rules in the Agent's instructions, so the model
  applies them; they are not a hard filter.
- **Stay strictly on topic** (off by default) makes **Only talk about** the
  Agent's scope and requires it; what the Agent's tools, Playbooks and
  knowledge cover also counts. Before each answer a short check with the
  Agent's own model decides whether the message is in scope. A message
  outside it gets the **Refusal for other topics** (empty uses a translated
  default) without tools or a model answer. Greetings, thanks, questions
  about the Agent and follow-ups still get normal replies. The check costs
  one small model call per message (stage `scope_gate` in Usage); if it
  fails, the Agent answers under strict instructions instead. Replies to a
  Playbook that waits for the visitor are not checked. A Confirm or Cancel
  on a card always takes effect; text sent with it is checked, and when it
  is off topic the visitor gets the fixed outcome message instead of a model
  answer. The check reads only the message text: a message with
  only an attachment is not checked, and the content of attached files is
  left to the strict instructions.
  See [ADR 0044](adr/0044-strict-topic-scope-gate.md).
- **Blocked words** are matched as whole words, ignoring case: "Ass" does not
  match "Assistent". End a word with `*` to also match longer words
  ("Konkurrenz*"). Choose whether visitor messages, answers or both are
  checked. A blocked visitor message never reaches the model; a blocked answer
  is replaced.
- **Personal data**: email addresses, phone numbers and links can be allowed,
  masked or blocked, for visitor messages, answers or both. Masked details
  are replaced, for example by "[phone number removed]", before the message
  is stored, shown or sent on. Dates, prices, version numbers and order
  numbers are not treated as phone numbers.
- **Message for a blocked answer** replaces a blocked answer; empty uses the
  translated default.

Built-in protection against instruction overrides, credentials and prompt
leakage always applies. The checks inspect text, not attachments. They also run
on the streamed draft, so a blocked or masked detail never appears in the
widget before the committed answer.

### Built-in tools

**Knowledge & capabilities > Built-in tools** has two switches; neither needs a
Playbook.

- **Human handoff** (on for Agents created in the editor) adds a
  `request_human` tool. When a visitor asks for a person, the Agent creates a
  handoff with a reason and summary; it appears in the **Inbox**, the Agent's
  answer stays visible, and the next visitor message goes to the operator. It is
  offered only where an operator can reply (web widget, or a channel
  conversation with its thread) and never in test chats.
- **Collect leads** adds a `save_contact` tool bound to a submission form.
  The visitor confirms the contact details on a card, optionally with the
  consent text you set, and the lead is stored under **Insights >
  Submissions**. It needs a permission mode with approved write actions.

### Writes and confirmation

With a permission mode that allows writes, every assigned published write
becomes its own tool: a Data Resource insert or update, an API Connector write
or an MCP write. The model only proposes the call. The widget shows a card
with every value and **Confirm** and **Cancel**; the write runs once through
the capability gateway when the visitor confirms, and the Agent then reports
the outcome. Telegram, Slack and WhatsApp show the same card with buttons when
the connection verifies its webhooks; email offers no confirmation-required
writes.

- **Ask visitor to confirm** (per write operation, on by default) can be
  turned off for harmless writes. MCP writes and lead capture always confirm.
- A direct Data Resource update reaches only records the current visitor owns.
  For a resource scoped to the Agent, a tenant or all rows, the update tool is
  offered only after you enable **Allow updating any record**, which always
  asks the visitor.
- Cards expire after 30 minutes. A repeated click or delivery never writes
  twice, and an unknown outcome is reported as unknown, never as success.
- In **Test** and Agent tests a confirmed write is simulated.

### Conversation memory

**Advanced > Session Memory > Turns to remember** (1 to 100, default 20) caps
how many earlier turns are loaded. The runner also fits the history into the
model's context window: it drops the oldest whole turns first and shortens old
tool results before a request could fail, so long conversations keep
answering.

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
- Data Resource inserts and updates require write capability and an explicit resource write policy; they run as direct tools after visitor confirmation or as a Playbook `mutate_data_resource` step.
- `store_submission` requires write capability.
- `httpRequest` and `apiConnector` treat `GET` as query behavior and `POST` / `PUT` / `PATCH` / `DELETE` as write behavior.
- Request retries are conservative: `POST` and `PATCH` are not retried unless the Playbook uses an explicitly idempotent external API contract.
- Host actions are declared by a tagged `CapabilityProvider` as immutable `CapabilityActionDefinition` objects, including their side effect, request/result schemas, confirmation policy, idempotency policy, and required secret-free `CapabilitySemanticProfile`.
- Untagged custom actions are not auto-classified, so treat them as application-level responsibility.

### Allowed Internal Data Resources

Agents can opt into specific internal Data Resources. With natural data questions enabled, publishing the Agent freezes each approved resource as its own direct query tool, plus one confirmed write tool per enabled insert or update when the Agent may write. A Playbook may separately bind a resource for a governed query or a confirmed create/update step.

Each enabled resource is:

- defined globally in **Data Resources**
- optionally seeded from `filament-agentic-chatbot.data_resources.resources`
- allow-listed and optionally narrowed per Agent
- written only through an explicit write policy, with visitor confirmation for direct tools
- limited to the declared fields, filters, sort options, and max limit

Use this for conversational facts such as product availability or case status, or for a controlled Playbook step that needs internal business records without exposing arbitrary database access. Mutation policies allow only one scoped insert or optimistic update; arbitrary SQL, bulk mutation, and delete remain unavailable.

If records belong to an Agent, tenant, team, or customer, add that boundary as a Data Resource safety scope or through your model design. Safety scope filters are always applied by the runtime and do not need to appear as normal Playbook filters.

In the Filament panel, use **Agentic Chatbot > Connect > Data** to set up a resource on one screen: pick a model, review the proposed fields, choose whose records the Agent reads and, optionally, enable writes. **Preview** shows a sample query and the exact tool the Agent sees. The Agent edit page can only approve or narrow those global rules.

The package config remains useful for install-time seeds and code-reviewed defaults, but normal admin changes should happen in **Data Resources**. Use **Sync from config** only when you intentionally want to create or overwrite UI-managed resources from published config.

The built-in `bots` resource is scoped to the current Agent by default. Expose a global Agent catalog only by changing that resource in **Data Resources** or by syncing an intentional config override.

### Natural Data Questions

**Permissions & technical details > Data Resources** also includes **Understand natural data questions**. This is the admin-friendly layer above the same closed `query_data_resource` contract.

Admins choose:

- which data resources the Agent may read
- whether the Agent should publish those resources as independent direct read tools
- the default and maximum number of records for each direct query
- a preview of each selected resource's sorting, filters, returned fields, hidden safety scope, and result limits

The Agent maps a natural request to a complete typed query (list, first, count, search, or a total or count per group), and the runtime validates all fields, operators, types, sorting, and limits again at the central capability gateway. Playbooks still use explicit fixed or bounded AI-produced query plans when query order belongs to a controlled process.

For product catalogs, mark the important fields for **Filter**, **Sort**, **Search**, **Total** or **Group**, such as price, created date, availability and name. Natural requests like "cheapest product", "two newest products" or "revenue per month" then need one tool call.

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
