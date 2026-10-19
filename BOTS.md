# Agents

The Agents list shows each Agent's name, state, channels, recent conversations
and last update (see [The Agents list](#the-agents-list)). Create an Agent with the existing conversation or knowledge starting
point. Valid host provider/model defaults are shown and retained; missing chat
credentials have a visible repair path. Knowledge and Workflows are optional.

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
- which knowledge, tools, and optional Workflows its published Agent may use
- who can access it
- how the widget should look

This is why one Laravel + Filament app can run multiple assistants with different behavior from one panel.

## One Live Agent, Optional Workflows

Every Agent answers chat through exactly one verified live deployment. The Agent owns ordinary conversation, intent understanding, clarifications, grounded answers, and user-facing failure responses. It does not need a canvas for simple or knowledge-backed chat.

An Agent may have zero or more Workflows for bounded processes. A Workflow is an optional tool for explicit input collection, deterministic branching, approvals, delays, bounded iteration, or external operations. Drafts and unassigned Workflows grant no authority. Publishing the Agent pins the exact knowledge sources, tools, budgets, and immutable Workflow deployments it may use.

The Agent Overview shows the active deployment, version/hash, knowledge, tools, assigned Workflows, budgets, and integration health without exposing engine diagnostics as normal configuration.

## What You Can Customize Per Agent

Each Agent owns its own:

- name and public ID
- system prompt and response behavior
- provider and model
- retrieval settings
- assigned tools (App data, API and MCP tools, Workflows, Handoff and Lead capture)
- allowed internal app data tools
- allowed domains
- audiences (context areas)
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
2. Choose **Create Agent** to open the wizard directly. The empty Agents list shows the same template cards as step 1.
3. In **Start with**, choose a [template](AGENT_TEMPLATES.md) or keep **Start from scratch** (the default). A template prefills the later steps, which you can still edit. Then choose the **Purpose**, **Have a conversation** (the default) or **Answer from my content**. Enter the name and job, then edit the suggested boundaries. **AI connection** shows the configured provider and verified model; missing credentials or a model profile need repair before the Agent can answer. A configured credential does not prove a successful connection test.
4. **Review** summarizes the purpose and connection. Creating saves the Agent as a **Draft** and opens **Overview**. The content starting point recommends adding the first source there; a conversation Agent has no required knowledge source. The starting point is authoring metadata only and grants no runtime authority.
5. Follow the [Quick Start golden path](QUICKSTART.md#7-golden-path-agent-to-live-deployment) to test and publish the Agent. Add a Workflow only when the job needs a bounded process.

Creating the Agent saves its settings. An Agent has one lifecycle (ADR 0045):

- **Draft**: no version is published yet. Visitors get no answers.
- **Live**: a version is published and visitors get answers from it.
- **Paused**: a version is published but visitor answering is switched off, on websites and in channels.

The first **Publish** of a Draft has the checkbox **Make the Agent live for visitors now**, checked by default. Keep it checked to go Live at once, or uncheck it to publish and stay Paused. Later publications never change Live or Paused. **Pause** and **Resume** are separate header actions with a confirmation and apply at once; they keep the draft and the live version. Resume needs a published version, so a Draft goes Live only through Publish. Publishing, restoring, pausing and resuming need the `filament-agentic-chatbot.publish` ability. Visitors also need valid website or channel access.

### Creating From A Template

A template starts a **Draft** with prefilled instructions and, where the use case needs them, built-in Tools. The built-in templates are **FAQ from your website**, **Customer support with handoff**, **Lead capture** and **Order status**. Creating from a template needs the same ability as creating any Agent; the Agent is never live, and no Tool of your app is assigned for you.

**FAQ from your website** opens the form to add a Source after creation. **Order status** records that it needs an app data tool: the Agent's checklist shows a blocking check until one is assigned to the draft, **Publish** stays disabled, and creation opens the form to set up an app data tool. See [Agent templates](AGENT_TEMPLATES.md) for the details and for adding your own templates.

## The Agents list

The list has five columns and nothing else, so it stays readable at 375 px (the Channels column appears from the medium breakpoint and Conversations from the large one):

| Column | Shows |
| --- | --- |
| **Agent** | The name, with a small **App default** badge on the Agent that the Blade component shows when it has no `agent` attribute. Search matches the name. |
| **State** | **Draft** (gray), **Live** (green) or **Paused** (orange), the lifecycle of ADR 0045. A Live or Paused Agent whose live version no longer verifies, or uses a format the runtime now refuses, shows **Publish needed** (red), as in the editor header. The list checks the loaded live version without further queries, so it does not show "unpublished changes", the changed knowledge profile (**Publish needed** in the editor), or a version from 0.20.x whose pinned Workflows break its old permission mode; the editor and every visitor turn check those. |
| **Channels** | **Website · 3 hosts** when the widget of this Agent has been seen on website hosts (the Channels tab records them), with a tooltip that lists at most five hosts, most recent first, on one line. **Not installed yet** when no host was seen. |
| **Conversations (last 7 days)** | Conversations that started in the last seven days, counted for the whole page in one aggregate query. Test chats of the editor are not counted. |
| **Updated** | Relative time of the last change; click to sort. |

Choose a row to open the Agent. The Agent's open steps (what is missing, what to publish) are in its Overview checklist, not in the list. The row menu has **Analytics**, **View** or **Edit**, and **Pause** (Live Agents) or **Resume** (Paused Agents) for users with the publish ability; both open the same confirmation as on the Agent page.

## Agent Control Center

After saving an Agent, use the edit page as your rollout checklist before you publish or embed it widely. The editor has seven tabs in the order of the work, and two ways to save. Each tab states once, with a badge at its top, whether its changes reach visitors after **Publish** (**Goes live on Publish**) or when you save (**Applies immediately**):

| Tab | What it holds | Saves with | Reaches visitors |
| --- | --- | --- | --- |
| **Overview** | The Agent's state, its checklist and the next step | no save button | n/a |
| **Instructions** | Name, job, boundaries, audience, tone, answer length, uncertainty, languages, fallback and citation guidance, default language, custom instructions, **Safety**, and the **Model** (provider, model and a badge that shows where the key comes from: **Agent key**, **Settings key**, **.env key** or **Key missing**) | **Save draft** | after **Publish** |
| **Knowledge** | Assigned Sources, retrieval settings, the knowledge update mode (**Current** or **Frozen**) and session memory | **Save draft** | after **Publish** |
| **Tools** | App data tools, API tools, MCP tools, Workflows, and the built-in Handoff and Lead capture tools | **Save draft** | after **Publish** |
| **Channels** | Embed code (script tag, Blade component, this admin panel), allowed websites and audiences, **Customize widget** (appearance with a live preview, in a slide-over), the other channels connected to the Agent | **Save** | **Applies immediately** |
| **Handoff and access** | **Pause** and **Resume**, who is notified of a handoff, business hours, and, collapsed under **Advanced**, the Agent's own API keys | **Save** | **Applies immediately** |
| **Test & versions** | Agent tests, published versions, restore | their own actions | n/a |

**Save draft** appears on Instructions, Knowledge and Tools and saves all three together; nothing the draft tabs hold reaches visitors until **Publish**. **Save** on Channels saves the allowed websites, **Save** in **Customize widget** saves the appearance and **Save** on Handoff and access saves the handoff settings and the Agent's API keys; each change is live at once (the badge says so). The default language is an Instructions field: the widget texts follow it as soon as you save the draft, while answers change on Publish. Each part keeps its own permission: allowed websites and the Agent's API keys need the admin ability, handoff settings and appearance need `configure` (adding an email recipient to Notify needs the admin ability),  **Pause** and **Resume** need `publish` (ADR 0053). A part you may not change is shown read-only and is never saved.

- The page header shows one status for the Agent, the same as in the Overview and, as Draft, Live, Paused or Publish needed, the **State** column of the Agents list (there without the version, the unpublished changes and the changed knowledge profile): **Draft**, **Live** or **Paused** (with its version), **Live, unpublished changes** or **Paused, unpublished changes** when the saved draft differs from the live version, or **Publish needed** when the live version no longer verifies or uses an outdated pin format. Its one action is **Publish**. **Pause** (when Live) and **Resume** (when Paused) sit next to it, in **Handoff and access** and in the Agents list; all open the same confirmation. After a Publish that makes the Agent live, the notification links to **Get embed code** on the Channels tab.
- **Overview** shows that status with its version, the checklist and one next step. Technical details start closed; the explicit `diagnose=overview` link opens them.
- The **checklist** is the one list of what is missing. The Publish dialog and the Overview show the same blocking checks, because they read one readiness service (see below).
- **Appearance preview** shows the current draft widget appearance without running the Agent or producing test evidence.
- **Test** opens a chat beside the editor that runs the saved draft: multi-turn, tool calls inline, write and Workflow approval cards decided in a sandbox (writes are simulated, never executed). **Reset conversation** starts over. It uses real provider calls and reads and never changes the live version.
- Under an answer that used knowledge, the test chat shows a collapsed **Sources used** list: the Source title once and, for a Website Source, the page URL, at most five. It reads the citations stored with that answer; chunk text is not shown, and an answer without knowledge shows no list.
- **Test & versions** lists saved conversations with checks (tool called or not, answer contains or not, a rubric graded by a model) and runs them against the saved draft in the test sandbox; see [Agent Tests](AGENT_TESTS.md). Below it, **Versions** lists published versions with number, time, author and note; **Restore** makes an earlier version live again after verifying it.
- **Publish** makes the saved draft live as a new immutable version in one step. The Publish dialog (in the editor and in the read-only Agent view) lists the readiness checks: blocking checks first, each with its message and a link to fix it, then warnings and suggestions. A blocking check disables the **Publish** button, and the action checks again on the server when it runs, so a stale dialog or a forced request publishes nothing. Warnings and suggestions never block.
- When the draft would publish an older API tool revision or Workflow version than the live version uses (for example after a Workflow rollback), Publish lists them as warnings and needs the checkbox **Publish the older versions listed above**; without it nothing is published (ADR 0055).
- **Technical checks** show provider, vector-backend, queue, and deployment readiness. Use the doctor command for the fuller release blocker. **Test knowledge search** inside it searches the Sources assigned to the saved draft, so an Agent that was never published can run it. It uses the retrieval of the live Agent (ADR 0046): only this Agent's assigned Sources, only their active completed generation, the draft's retrieval settings. A Source that is still processing, failed, revoked or built with another embedding profile stops the test with the reason Publish would give.
- **Analytics** shows operational metrics, feedback, recorded outcomes, traffic and knowledge gaps.

### Operational analytics (1.0 candidate)

The existing Analytics **Overview** offers **This Agent** and **All Agents you may
view**, without another navigation item. The aggregate uses the current tenant
and host Agent visibility scope. Select 7, 30 (default), or 90 calendar days.
Every card opens its exact contributing rows in a read-only list on the same
page. The feedback, unverified-action, knowledge-gap and usage drill-downs share
the counting queries, rather than linking to an unfiltered inbox. Specialized
tabs retain their own stated reporting periods and operational actions.

All windowed metrics use today plus the previous N-1 days in the display timezone:
the existing `FilamentTimezone` helper, which defaults to `app.timezone` and
respects a host's panel/user override.
Local midnight on the first day is inclusive; local midnight after today is
exclusive. Boundaries are converted to the process default storage timezone
for stored timestamps, including daylight-saving transitions. Counts have no denominator unless the table
specifies one. Conversation, handoff, feedback and reply-coverage metrics exclude
Agent tests and playground conversations.

| Metric | Definition and denominator | Time and duplicate rule |
| --- | --- | --- |
| Conversations | Conversations started in the window, excluding Agent tests and playground conversations. | `created_at`; one per conversation. |
| Conversations without handoff | Count and share of those conversations with no handoff of any status, divided by Conversations. It does not establish resolution. | Conversation `created_at`; no handoff date restriction; each conversation counts once. |
| Positive / negative feedback | Explicit latest visitor votes on assistant replies created in the window. | Reply `created_at`, even for an older conversation; the existing per-session reply feedback field stores one latest vote per reply and visitor. Repeated votes and delivery events add nothing. |
| Response coverage | Assistant replies created in the window that received explicit feedback / all assistant replies created in the window. | Reply `created_at`; each reply counts once. Withdrawn votes do not count. |
| Handoff rate | Conversations started in the window with at least one handoff / Conversations. | Conversation `created_at`; any handoff status/date; multiple handoffs count once. |
| Succeeded writes | Verified succeeded executions, including verified operator reconciliations. Unknown, failed, unverified, pending, running and merely confirmed actions are excluded. | Completion `succeeded_at`; the ledger's unique Agent, surface, operation, identity type, scope and identity hash count once. Replays, retries and event delivery never add a success. |
| Open unverified actions | Executions currently `unknown`. | Current snapshot, independent of period; one per ledger idempotency identity. Delivery failures on a settled execution do not reopen it. |
| Open knowledge gaps | Gaps not yet recorded by W9.2 as **Available to Agent** (`resolved` with `answer_state=available`). Excludes operator-ignored gaps; includes legacy resolved gaps without that verification. | Current snapshot, independent of period; one per gap, not per occurrence. Drafted, indexing, failed and Publish needed answers remain open. |
| AI cost | Known actual cost of `ai_usage_calls`, grouped by verified pricing currency and monetary scale; no currency conversion. | Call `started_at`; one per call, including real spend on tests, playground and editor AI. Only settled usage with a valid matching pricing snapshot and nonnegative actual cost is priced. Every other call is explicitly counted as a call without a price. |
| AI cost per conversation | Each currency's known visitor-traffic AI cost / visitor Conversations started in the window. Agent tests, playground calls and editor AI are excluded from this numerator. Calls can belong to conversations started earlier or have no conversation. | Visitor calls only, with the same call window and duplicate rule as AI cost; same visitor denominator as Conversations. |

An empty denominator displays **— No data**, never 0%. If no call has a verified
price, cost also displays **— No data**, with the number of calls without a price.
Known subtotals retain that missing-price count and are not a complete bill.
Window and duplicate definitions are available in the keyboard- and touch-accessible
Definitions list and each contributing-row table. Table rows link to authorized
records; feedback opens the rated reply and gaps open their focused Knowledge inbox.
Whole-Agent conversation or usage access is required for the respective metrics;
otherwise they display **Unavailable**. Write metrics require the existing
unverified-action permission without a record-scoped grant, so a partial subtotal
is never shown as a whole-Agent total. Details cannot expand the
authorized Agent scope. No absence of handoff or negative feedback is labelled
as resolution, deflection or time saved. Explicit `ConversationOutcome` evidence
remains under the separately labelled recorded outcomes tab.

### Readiness checks

One service, `AgentReadiness`, returns the ordered checks of an Agent. Each has a key, a severity, a message and, when you may perform it, a fix action.

| Severity | Checks |
| --- | --- |
| **Blocks Publish** | no model; no usable API key for the selected provider (the Agent's own key, then the Settings page, then the environment); a pinned Tool or Workflow that cannot compile |
| **Warning** | a Source that is still processing or failed; handoff on with nobody in **Notify**; no allowed website and no channel; failing Agent tests; and the problems of the live version (a version that needs a new Publish, a live provider that lost its key, a Source that cannot be read, an API or MCP tool that changed or failed its test) |
| **Suggestion** | no Agent tests yet; tests without a result for the draft; a frozen version that does not use newer indexed content |

The **Channels** tab lists the prerequisites of the embed code from the same service. The embed code appears when none is open.

### Tools and Knowledge

In **Tools**, compact native sections show the assigned tools and the built-in tools. **Add tool** opens a type-first modal for API/MCP reads, app data, or an optional Workflow. Its searchable selection uses the authorized library; contextual creation retains the Agent return path without automatically assigning the new definition. Rows show a short business description, read/write effect, version differences and **Edit**. The **More** menu opens version details or removes only the form assignment, never the shared definition. In **Knowledge**, the same layout lists the assigned Sources; **Add from library** and **Add source** assign them.

Assigning or removing a tool changes only the form draft and preserves other unsaved inputs. **Save draft** persists those changes after current scope, published-release, permission and conflict checks; it does not publish. Invalid or unavailable assignments remain visible for repair or removal. Leaving for a dedicated editor offers save, discard or stay; validation errors preserve the draft. Sources belong to the Agent and retain their dedicated ingestion/configuration editor and processing status.

**App data tool and save settings** (in **Tools**) is collapsed by default and groups the app data tool limits (App data reads on or off, list sizes, per-resource field policies) and the switch **Approved save types only**. Blocking assignment warnings remain visible above the sections. There is no permission mode (ADR 0054): the assigned tools are the Agent's authority. The tab query ID is `tools`; the others are `overview`, `instructions`, `knowledge`, `website` and `tests-versions`.

### Authority follows the assigned tools

An Agent may read through every assigned read tool and its assigned Sources, and may propose writes through every assigned write tool:

- **Knowledge**: the assigned Sources.
- **App data tools**: the read tool of each assigned resource while App data reads are on, and one write tool per enabled insert or update of each explicitly assigned resource with a write policy. Each App data write has an **Allow** switch next to it; turning it off keeps the read tool. Turning a write back on is write policy (`agents.write_policy`).
- **API and MCP tools**: each assigned published operation with its read or write effect.
- **Workflows**: every step of the pinned Workflow version, including its sub-Workflows.
- **Built-in tools**: **Human handoff** and **Collect leads**, each with its own switch. Lead capture is a write tool.

Each write tool keeps its own confirmation setting (ADR 0038). Agents created before 1.0 were converted by the upgrade so that they keep exactly their former authority; when the upgrade removed something from a draft, the **Tools** and **Knowledge** tabs show a notice with the removed items until you dismiss it, and the Overview lists it as a warning.

The save types themselves (their fields, version, duplicate check, consent variable and patterns) are no longer edited in the Agent editor. Define them in the `submissions.schemas` configuration; save types stored on an Agent by an earlier version keep working unchanged.

### Read-only view

An admin whose Gates allow viewing Agents (`filament-agentic-chatbot.view-bots`) but not managing them (`filament-agentic-chatbot.manage-bots`) opens an Agent from the list in a read-only view at `/{panel}/bots/{record}`; the edit page stays forbidden for them. The view shows the saved draft with all fields disabled: Overview, Instructions, Knowledge, Tools, Channels (with the embed code), Handoff and access and Versions, plus the release state and an **Analytics** link. It is the same editor without save controls, so there is one layout to learn. It has no save, **Publish**, **Restore**, **Test** or assignment actions, and it leaves out the tests and the Agent's API keys. Knowledge, API/MCP, data and Workflow rows appear only when the viewer may see that record. Every write still checks `manage-bots` on the server, also for a user who could manage the Agent and opens the view. Users who can edit the Agent are sent to the editor when they open this address; the list opens the editor for them.

The native page inherits the host font and primary color. Its scoped panel CSS is registered as a versioned package asset, so a standard Filament panel needs no package-source Tailwind scan or host theme build. A panel without the plugin receives no package assets from plugin registration.

### Safety

**Instructions > Safety** holds the Agent's safety settings. They take effect with
the next **Publish**; earlier versions and resumed turns keep the settings
they were published with.

- **Only talk about** and **Never talk about** describe topics in plain
  language. They become rules in the Agent's instructions, so the model
  applies them; they are not a hard filter.
- **Stay strictly on topic** (off by default) makes **Only talk about** the
  Agent's scope and requires it; what the Agent's tools, Workflows and
  knowledge cover also counts. Before each answer a short check with the
  Agent's own model decides whether the message is in scope. A message
  outside it gets the **Refusal for other topics** (empty uses a translated
  default) without tools or a model answer. Greetings, thanks, questions
  about the Agent and follow-ups still get normal replies. The check costs
  one small model call per message (stage `scope_gate` in Usage); if it
  fails, the Agent answers under strict instructions instead. Replies to a
  Workflow that waits for the visitor are not checked. A Confirm or Cancel
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

**Tools > Built-in tools** has two switches; neither needs a
Workflow.

- **Human handoff** (on for Agents created in the editor) adds a
  `request_human` tool. When a visitor asks for a person, the Agent creates a
  handoff with a reason and summary; it appears in the **Inbox**, the Agent's
  answer stays visible, and the next visitor message goes to the operator. It is
  offered only where an operator can reply (web widget, or a channel
  conversation with its thread) and never in test chats.
- **Collect leads** adds a `save_contact` tool bound to a submission form.
  The visitor confirms the contact details on a card, optionally with the
  consent text you set, and the lead is stored under **Conversations >
  Submissions**. It is a write tool; its switch is its assignment.

### Handoff notifications and business hours

**Human handoff** starts on for new Agents. Editing preserves the stored switch;
existing Agents without a stored choice stay off. The switch assigns the built-in
tool and takes effect after **Publish**. In **Handoff and access**,
**Notify**, channels, business hours and the outside-hours text are live settings:
**Save** applies them immediately, without Publish.

**Notify** lists only panel users the host authorizes to view and manage this
Agent's Inbox, including its tenant. Choose up to 25 users and their panel
notification and/or email channels. A newly created Agent starts with its creator
only if that user can operate its Inbox. Saving checks newly selected users;
stored recipients who lost access show a clear label and can be removed. Delivery
and readiness recheck access. A revoked recipient is recorded as skipped.
An active webhook does not clear the missing-Notify readiness warning.

An admin may also approve up to 10 email addresses. Addresses are validated,
normalized to lowercase and deduplicated. Adding one requires
`agents.handoff_email_recipients`; editing the other handoff settings requires
`agents.handoff_settings`, both for this Agent. Email recipients get no app access.
Viewers without `agents.handoff_settings` see only the approved email recipient
count; their form state contains no recipient addresses.
Notifications contain the Agent name and the existing redacted handoff summary,
with a normal panel Inbox link. The link requires login and Inbox authorization.
The database channel appears in Filament's notification mailbox. Each logical
handoff, recipient and channel has one durable delivery row. Test conversations
notify nobody.

Business hours use an IANA timezone and zero or more intervals per weekday. A
closing time before or equal to its opening time ends the next day. Empty weekdays
are closed; an empty schedule is always open. Hours follow the local clock across
DST changes; overlapping intervals count once for SLA time. On spring-forward
days a nonexistent time moves forward by the clock change. Repeated fall-back
boundary times use PHP's timezone resolution; intervals spanning the change count
the elapsed real minutes.

Outside hours a handoff is still created and notifications are still sent. The
visitor receives the **Outside business hours** text (up to 1,000 characters), or a
translated default. If neither the handoff nor its conversation has a known email
address, the notice also asks for one. A saved contact email or email-channel
sender counts as known; this does not authenticate the visitor.

The handoff in the Inbox shows delivery status and attempts. Delivery retries use
backoff, and exhausted failures expose **Retry notifications** to operators with
`handoffs.manage`. The action queues only failed deliveries, reusing the same
handoff and delivery rows; successful deliveries stay sent. If a worker dies while
sending email, its outcome is uncertain: operators see that state and must check
the mail transport. Automatic retries do not resend uncertain mail. **Resend**
requires `handoffs.manage` and confirmation that the recipient may get the email
twice. Skipped deliveries show the reason, such as revoked Inbox access.
Queue recovery details are in `docs/OPERATIONS.md`.

### Writes and confirmation

Every assigned published write becomes its own tool: an app data tool insert or update, an API connection write
or an MCP write. The model only proposes the call. The widget shows a card
with every value and **Confirm** and **Cancel**; the write runs once through
the tool gateway when the visitor confirms, and the Agent then reports
the outcome. Telegram and Slack show the same card with buttons when
the connection verifies its webhooks; email offers no confirmation-required
writes.

- **Ask visitor to confirm** (per write operation, on by default) can be
  turned off for harmless writes. MCP writes and lead capture always confirm.
- A direct app data tool update reaches only records the current visitor owns.
  For a resource scoped to the Agent, a tenant or all rows, the update tool is
  offered only after you enable **Allow updating any record**, which always
  asks the visitor.
- Cards expire after 30 minutes. A repeated click or delivery never writes
  twice, and an unverified action is reported as unknown, never as success.
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

The built-in provider picker supports Gemini, OpenAI, Anthropic, xAI, OpenRouter, DeepSeek, Groq, Mistral, Ollama, Azure OpenAI, and OpenAI-compatible gateways. The package catalogue records common provider model IDs, but the recommended selector exposes only entries that also have an explicit verified assistant capability profile. The **Manual ID** option lets you enter an exact model identifier.

Catalogue membership and manual IDs are safe by default: neither implicitly receives developer-instruction, tool-calling, streaming, or native JSON-schema support from its name. For a private, preview, or self-hosted model whose capabilities you have verified, declare a profile under `filament-agentic-chatbot.models.capabilities`; the form, runtime, and doctor command then validate the configured model against the required Agent profile. Workflow generation additionally requires a verified structured-output profile and fails closed when none is available.

A manual ID that neither that configuration nor the package profiles know shows **Tool calling (required)**, **Structured output** and **Vision (images)** below the model field. The Agent saves only when tool calling is declared; the error names the missing capability. Declaring tool calling also declares that the model takes system instructions. Declarations are stored per provider and model in `agentic_model_capabilities` and apply to every Agent on that model; host configuration and package profiles always win over them, and the package does not verify them. The first declaration is part of the Agent draft (configure); changing a stored declaration needs an installation-wide admin grant. On a saved Agent, **Check model** sends one billed request with a fixed prompt and one test tool to the selected provider and model and shows whether a tool call came back; the result does not change the declaration. It uses the Agent's own key only for the Agent's saved provider and the saved or app-wide base URL.

The create wizard preselects the default provider from the **Settings** page only when it has a usable key; otherwise it preselects the first provider with a key, or none.

Use OpenRouter for routed models such as Qwen or DeepSeek variants without adding a provider-specific integration for each model family. Use **OpenAI-Compatible** when the provider exposes a chat-completions-style API with a custom base URL, such as Qwen DashScope compatible mode or a private gateway. Enter the base URL on the Agent, or configure it globally with:

```env
AGENTIC_CHATBOT_OPENAI_COMPATIBLE_DRIVER=openrouter
AGENTIC_CHATBOT_OPENAI_COMPATIBLE_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
AGENTIC_CHATBOT_OPENAI_COMPATIBLE_API_KEY=...
```

The custom base URL is used by both normal Agent replies and bounded Workflow AI Tasks. It should include the provider's `/v1` path when that provider requires it.

For production examples, see [OpenAI-Compatible Providers](OPENAI_COMPATIBLE_PROVIDERS.md).

### Retrieval Settings

The most important retrieval settings are:

- `top_k`: how many chunks to retrieve
- `min_similarity`: how strict the relevance filter is
- context budget: how much retrieved content can be passed into the answer prompt

These settings strongly influence whether the Agent feels too vague, too strict, or well-grounded.

### Tool Authority

The published version's tool manifest is the Agent's whole authority; 1.0 has no permission mode (ADR 0054). A Workflow step runs because the Agent's live version pins that Workflow version:

- `query_data_resource` and knowledge search are reads; app data tool inserts and updates are writes that need an explicit resource write policy and run as direct tools after visitor confirmation or as a Workflow `mutate_data_resource` step.
- `store_submission` is a write.
- `apiConnector` steps take their effect from the pinned operation contract; `httpRequest` treats `GET` as a read and `POST` / `PUT` / `PATCH` / `DELETE` as a write.
- A host action whose effect is not classified never runs.
- A live version published before 1.0 with a permission mode runs only when its tools reach nothing that mode denied; otherwise visitors see that it must be republished, and `filament-agentic-chatbot:upgrade` names the Agent before the upgrade.
- Request retries are conservative: `POST` and `PATCH` are not retried unless the Workflow uses an explicitly idempotent external API contract.
- Host actions are declared by a tagged `CapabilityProvider` as immutable `CapabilityActionDefinition` objects, including their side effect, request/result schemas, confirmation policy, idempotency policy, and required secret-free `CapabilitySemanticProfile`.
- Untagged custom actions are not auto-classified, so treat them as application-level responsibility.

### Allowed Internal app data tools

Agents can opt into specific internal app data tools. With natural data questions enabled, publishing the Agent freezes each approved resource as its own direct query tool, plus one confirmed write tool per enabled insert or update of an explicitly assigned resource whose write is not turned off. A Workflow may separately bind a resource for a governed query or a confirmed create/update step.

Each enabled resource is:

- defined globally in **App data tools**
- optionally seeded from `filament-agentic-chatbot.data_resources.resources`
- allow-listed and optionally narrowed per Agent
- written only through an explicit write policy, with visitor confirmation for direct tools
- limited to the declared fields, filters, sort options, and max limit

Use this for conversational facts such as product availability or case status, or for a controlled Workflow step that needs internal business records without exposing arbitrary database access. Mutation policies allow only one scoped insert or optimistic update; arbitrary SQL, bulk mutation, and delete remain unavailable.

If records belong to an Agent, tenant, team, or customer, add that boundary as an app data tool safety scope or through your model design. Safety scope filters are always applied by the runtime and do not need to appear as normal Workflow filters.

In the Filament panel, use **Agentic Chatbot > Connect > Tools & data > App data tools** to set up a resource on one screen: pick a model, review the proposed fields, choose whose records the Agent reads and, optionally, enable writes. **Preview** shows a sample query and the exact tool the Agent sees. The Agent edit page can only approve or narrow those global rules.

The package config remains useful for install-time seeds and code-reviewed defaults, but normal admin changes should happen in **App data tools**. Use **Sync from config** only when you intentionally want to create or overwrite UI-managed resources from published config.

The built-in `bots` and `agent_workflows` App data tools were removed in 1.0. Only `bot_submissions` remains. A host that needs the removed resources must explicitly allowlist their models and define reviewed host config entries; see [Upgrading](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md#package-internal-app-data-tool-models).

### Natural Data Questions

**Permissions and app data tool settings > App data tool settings** also includes **Understand natural data questions**. This is the admin-friendly layer above the same closed `query_data_resource` contract.

Admins choose:

- which app data tools the Agent may read
- whether the Agent should publish those resources as independent direct read tools
- the default and maximum number of records for each direct query
- a preview of each selected resource's sorting, filters, returned fields, hidden safety scope, and result limits

The Agent maps a natural request to a complete typed query (list, first, count, search, or a total or count per group), and the runtime validates all fields, operators, types, sorting, and limits again at the central tool gateway. Workflows still use explicit fixed or bounded AI-produced query plans when query order belongs to a controlled process.

For product catalogs, mark the important fields for **Filter**, **Sort**, **Search**, **Total** or **Group**, such as price, created date, availability and name. Natural requests like "cheapest product", "two newest products" or "revenue per month" then need one tool call.

### Allowed hosts

Allowed domains limit where the widget can be embedded.

Use this when you want a public Agent on your marketing site but do not want the widget embedded elsewhere.

Empty allowlists are compatibility-only when `AGENTIC_CHATBOT_WIDGET_ALLOW_ALL_DOMAINS=true`. Production Agents should list exact hosts.

### Audiences

Audiences (context areas) help separate different assistant experiences such as:

- `public`
- `member`
- `admin`

Use different Agents when access scope or audience meaningfully changes.

### Widget Settings

Website access and appearance have separate explicit save actions and conflict checks. Saving the Agent draft does not save either form. Tab switches retain their unsaved values; reloading saved settings requires confirmation. An exact domain and each subdomain need separate permissions. The domain details explain HTTP(S) URL normalization and explicit wildcards without extending access automatically.

The embed code is always shown on **Channels**, also for a Draft or a Paused Agent (W4.2). Below it the tab lists the readiness prerequisites (a valid public ID, an allowed website host, a verified selected version, signing and area settings, and Live), each with a repair action when you may perform it. Copying confirms only clipboard success. The installation status says "Seen on {host}, last {time}" for every host whose page loaded the widget, and "Not seen yet" for an allowed host that did not. The tab also shows the three placements: the script tag for any website, the Blade component with `agent="..."` (with **Use as app default**, administrators only) and the chat bubble inside this admin panel (W4.3).

**Customize widget** on the Channels tab opens a slide-over with its own **Save**. It shows the live preview first, then the basic appearance (template, accent, size), texts and suggested questions, further display options including the existing widget fonts, and appearance by audience. The preview shows the current, unsaved options without saving or running the Agent; **Open preview** shows it inside a native dialog, and closing it restores focus to the opener. System labels follow the widget language; saved customer text, including the welcome message, is preserved. Use **Open test chat** to test replies. The host panel keeps its own font and theme.

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

### Agent To Workflow Assignment

One Agent can have multiple Workflows, but Workflows never own live chat traffic. The single active Agent deployment owns the conversation and pins each allowed Workflow by ID, deployment ID, and hash.

Use that model like this:

- keep extra Workflows as drafts, alternatives, or release history for the same Agent
- publish an immutable Workflow, assign it, then publish a new Agent deployment to grant that exact version
- create a separate Agent when you need a genuinely different chatbot experience

The Agent edit page shows its published contract and assigned Workflows. The Workflow list shows publication and Agent-usage state. A mutable draft cannot be invoked, and publishing a Workflow does not silently change an already active Agent deployment.

### Updating Agents when a Tool changes

A live version pins the exact published version of every API tool and Workflow it uses, so a new API tool revision reaches no live version by itself. The API tool page offers **Publish affected Agents** (W3.3, ADR 0055). Its preview lists:

- every Agent whose live version uses an older revision, with its status (Live or Paused), the version change, what changed (new version, inputs, description, stricter confirmation) and whether its draft keeps other unpublished changes;
- Agents that need their own **Publish** because the new revision would change what the Agent may do: weaker visitor confirmation, reading instead of writing or the reverse, another destination, scope or input rules, or a removed Tool;
- Drafts that use the Tool (they are never published; their first Publish uses the new revision);
- Workflows whose live version uses an older revision; publish them in the Workflow editor.

Publishing gives each listed Agent a new version: its live version with only this Tool updated, never its draft. Unpublished draft changes, Live and Paused stay as they are, and earlier versions stay restorable. It needs the `filament-agentic-chatbot.publish` ability on every listed Agent and publishes nothing otherwise. Each Agent is updated on its own and only if its live version is still the one in the preview; an Agent that another publisher changed in the meantime is skipped and reported, never overwritten. When some Agents failed (for example a missing credential), **Resume publication** retries them; Agents that are already updated are not published again.

A Workflow belongs to one Agent, so its update reaches that Agent from the Workflow editor: **Publish and update {Agent}** publishes the Workflow version and a version derived from the Agent's live version in one transaction (W3.4, ADR 0048). It needs the `filament-agentic-chatbot.publish` ability on the Workflow and on the Agent; the Agent's other draft changes stay unpublished, and Live or Paused stays. **Publish only** keeps the Workflow off the Agent until its next Publish.

This keeps authority, analytics, sessions, and UX understandable.

## How Agent Customization Affects The User Experience

### Prompt + Sources

This controls what the Agent is supposed to do and what it can answer from.

### Retrieval Settings

This controls whether the Agent feels grounded, noisy, or too narrow.

### Tools And Data Access

The assigned tools control whether the Agent and its pinned Workflows can search knowledge, capture structured data, or safely query internal records.

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
- Tool and Workflow authority

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
- maintenance Workflows
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
- Keep every answer and tool inside the published Agent contract.
- Start without a Workflow for general help and source-grounded replies.
- Add a Workflow only for a bounded process that benefits from explicit state, branching, approval, or external work.

## Related Docs

- [Core Concepts](CORE_CONCEPTS.md)
- [Agent Runtime Architecture](AGENT_RUNTIME_ARCHITECTURE.md)
- [Knowledge Sources](KNOWLEDGE_SOURCES.md)
- [App data tools](DATA_RESOURCES.md)
- [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)
- [Audiences (context areas)](CONTEXT_AREAS.md)
- [Chat Widget](CHAT_WIDGET.md)
- [API Integrations](API_INTEGRATIONS.md)
- [OpenAI-Compatible Providers](OPENAI_COMPATIBLE_PROVIDERS.md)

### Claude 5.5 configuration

Anthropic defaults to Claude Haiku 5.5; Sonnet 5.5 and Opus 5.5 are also
adapter-qualified for text, tools, structured output and streaming. Configure
`runtime_config.agent.anthropic_effort` with `low`, `medium`, `high`, `xhigh`
or `max`, then publish. The conversational loop uses medium without the key;
the bounded topic-scope classifier uses low independently. The release
acceptance fixture pins low (owner decision 2026-10-18). The package uses a
conservative 8,192-token output cap for these profiles and a 1,000,000-token
context limit. Images and documents remain unqualified. Tool choice stays
automatic with adaptive thinking; assistant prefill and thinking budgets fail
before a request is sent.
