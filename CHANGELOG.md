# Changelog

All notable changes to this package will be documented in this file.

## [Unreleased]

## [0.20.2] - 2026-10-04

A drop-in update of the 0.20 line: no migrations and no configuration changes. The widget script version changes, so browsers load the new widget.

### Widget

- Answers use the full width of the panel: a sender line above the answer shows the Agent's avatar, name and time ("Support team" for operator replies), and the avatar column beside the answer is gone. In the normal panel size the answer text is about a sixth wider, and lists, nested lists and quotes take less room, so long answers need less scrolling. Visitor messages keep their right-aligned bubble without an avatar.
- Widget text keeps its own colors and sizes when the host page styles bare elements such as `p` or `li` (for example a global gray paragraph color made answer headings gray).

## [0.20.1] - 2026-10-04

A drop-in update of the 0.20 line: no migrations and no configuration changes. The widget script version changes, so browsers load the new widget.

### Widget

- Streamed answers flow evenly instead of jumping in bursts: the widget reveals the received draft at a pace that follows the backlog and trails the stream by about a quarter second. Markdown answers render as Markdown while they stream, with the rules of the committed HTML: nested lists, code blocks in list items, aligned tables, numbered lists that start above 1, setext headings and escapes render as they will stay, and raw HTML and images are left out as on the server. Open emphasis and code show in their final form and a link shows as its label until its target is complete, so raw syntax never appears and the committed answer replaces the preview without a visible jump. Finished blocks are kept between frames, so long answers stream as smoothly as short ones. A pulsing caret marks the end of the text while it is written.
- Until the first words arrive, the status line shows the elapsed time from the third second on, for example "Thinking… · 7s".
- On screens wider than 640 px, **Expand chat** in the header turns the panel into a tall panel above the launcher (`clamp(560px, 46vw, 760px)` wide, `--fac-expanded-width` to change it); Escape or **Collapse chat** restores it, and the choice is remembered per Agent and area. Hide the button with `data-expandable="false"`, the component's `:expandable="false"` or the SDK option `expandable: false`.

### Installation

- `filament-agentic-chatbot:install` ends with the current next steps (create an Agent, try it with **Test**, then **Publish** it) instead of the removed release candidate flow.

## [0.20.0] - 2026-10-04

This release overhauls the plugin. Breaking changes are allowed in the `0.x` line; follow "Upgrading to v0.20.0" in [UPGRADING](UPGRADING.md) and publish every Agent and Playbook again. Several migrations drop tables and columns and cannot be rolled back: back up the database first; the way back is restoring that backup with the 0.19.0 package.

### Agent runtime

- One transcript-based Agent loop (ADR 0037) answers every chat turn: `AgentRunner` runs the `laravel/ai` tool loop over the persisted conversation, including earlier tool calls and results, until the model answers. Every published read, write and Playbook is a flat tool whose arguments are the operation's own input schema; server-bound values (tenant, visitor identity, credentials, fixed parameters) never appear in it. Validation and API errors return to the model as short tool results so it can correct itself or ask. The model writes the answer; the server only substitutes technical failure messages. The former dialogue runtime (request envelopes, literal-input provenance, answer review, recovery credits and runtime ABI versions) is removed. Agent deployments stay immutable and hash-verified but are no longer bound to a runtime ABI.
- Long conversations keep answering: the history fits a token budget from the model's context window (minus reserved output, instructions, tool schemas, the current turn and a reserve for its tool calls) and the configured input limit. The oldest whole turns are left out first, then the tool results of the last earlier turn are shortened. "This conversation has become too long" appears only when the current message alone does not fit. An API client's access token input and output limits also bound the history budget and model step admission.
- The Agent's assistant profile (role, audience, tone, answer length, uncertainty, boundaries, languages, citation policy) is part of its instructions, so wizard Agents without a system prompt keep their configured behavior. The reply-language rule closes the instructions and names the visitor's language when an English or German message makes it clear; fixed runtime texts use the visitor's conversation language.
- Operator replies from the handoff desk are replayed to the model as human operator messages instead of the Agent's own words.
- A call to a tool the Agent does not offer returns an error naming the available tools instead of failing the turn; after three such calls in a turn the Agent answers without them. Single questions are no longer answered as a numbered list. Turn traces no longer show the free text of lead capture and handoff arguments.
- The empty-answer retry keeps the turn's attachments and uses the same rate-limit retry as the first request; a rate-limited request is repeated only when the backoff leaves execution budget.
- Upgrade note (breaking): "Messages to keep in context" (0 to 50 messages) is now **Turns to remember** (1 to 100 turns, default 20, `CHAT_SESSION_MEMORY_HISTORY_TURNS`), an upper bound; `CHAT_HISTORY_MESSAGES` and `CHAT_SESSION_MEMORY_HISTORY_MESSAGES` are gone.

### Agents, publishing and tests

- Publish is one step (ADR 0041): **Publish** saves the form, compiles an immutable, hash-verified version with pinned dependencies and makes it live at once, in one transaction (a failure leaves the previous version live). An optional note is kept with the version. The **Versions** tab lists each published version (number, time, author, note) with **Restore**, which makes an earlier version live again after verifying it and replaces only the live version shown when the list was opened. Problems that prevent publishing are listed with links; failing Agent tests and a missing API key are warnings that never block. The editor header and the Agent list show one release state: Not published, Live (with version), Unpublished changes, or Republish needed, with **Republish** as its one action. The Agents list shows each Agent's one open step as its row action.
- Test chat: **Test** saves the form and opens a chat beside the editor that runs the saved draft as a verified, never activated deployment. It keeps the conversation over several turns and shows each tool call and the cards of writes and Playbook approvals. Writes are simulated and never reach the Gateway's write path; **Reset conversation** starts over.
- Agent tests (docs/AGENT_TESTS.md): the **Tests** tab holds tests made of visitor messages; each message can check that a tool was or was not called, that the answer contains or does not contain a text, and a rubric graded by the tested version's own model (recorded in usage as `test_grading`; `AGENTIC_CHATBOT_AGENT_TESTS_GRADING_MODEL` picks another model of the same provider). **Run** and **Run all** use the saved draft in the test chat's sandbox; a result counts only for the draft and test it ran with, otherwise it shows **Outdated**. **Create test** on a conversation, a negative rating or a knowledge gap and **Save as test** in the test chat create a test from the visitor messages and the tools the Agent called. A run cut off by the PHP time limit ends as an error after 15 minutes without progress.
- Safety (ADR 0043): **AI setup > Safety** holds **Only talk about** and **Never talk about** (plain-language topics that become rules in the instructions), **Blocked words** (whole words, any case, Unicode-aware, `*` for longer words; visitor messages, answers or both) and **Personal data** (email addresses, phone numbers, links: allow, mask or block, per direction). Masked text is what is stored, sent to the model, streamed and delivered. Phone detection ignores dates, prices, version numbers, IBANs, card numbers and labelled order numbers. An optional message replaces a blocked answer. A baseline safety block in an Agent conversation answers in Agent wording in the visitor's language. The settings are published with the Agent.
- Strict topic mode (ADR 0044): **Stay strictly on topic** in the Safety section makes **Only talk about** the Agent's required scope (tools, Playbooks and knowledge count as in scope). The instructions get firm scope rules, and before each answer one small call with the Agent's own model (temperature 0, at most 256 output tokens with low or no thinking where the provider allows it, usage stage `scope_gate`) decides whether the message is in scope. An off-topic message gets the **Refusal for other topics** (or a translated default) without tools or a model answer; conversation diagnostics show the decision `out_of_scope` and the topic check. If the check fails, the turn continues under the strict instructions. Replies to a Playbook that waits for the visitor and messages without text are not checked; a Confirm or Cancel always takes effect, and off-topic text sent with it gets the fixed outcome message instead of a model answer. The settings are part of the published version only when the mode is on, so existing versions keep their hash. **Add off-topic checks** in the Tests tab creates a test with four off-topic requests and one in-scope request, checked by text.
- Built-in tools (ADR 0039): **Knowledge & capabilities > Built-in tools** has two switches. **Human handoff** (on for new Agents) adds a `request_human` tool that moves the conversation to the Inbox; the Agent's answer stays visible and the next visitor message goes to the operator. **Collect leads** (needs approved write actions) adds a `save_contact` tool that stores contact details as a submission after the visitor confirms a card with the values and a consent notice. Admin test conversations never get the handoff tool; a lead is only simulated there.
- The **Job / outcome** field accepts up to 1,000 characters (was 255).
- Upgrade note (breaking): the release candidate, its test evidence, routing coverage and waivers, "Live test: Required", the candidate quality gate and the candidate comparison are removed; the migrations make each Agent's live deployment version 1. `AgentReleaseService` offers `publish`, `restore` and `versions`; `AgentDeploymentPublisher::publishCandidate` is `persist`. The **Quality Tests** resource, scheduled quality runs (`run-due-quality-scenarios`), Playbook draft tests and their publish gate, and the release gate tooling (`RuntimeReleaseGate`, provider eval gate and release matrix and their composer scripts) are removed; the migrations drop the quality tables without converting stored scenarios, and `quality_operations` config is now `knowledge_gaps`. Solution Kits declare `tests` instead of `quality_scenarios`. The Guardrail Policies resource, "Required terms", advisory mode, "Rules JSON" and `guardrails.authorization.*` are removed; recreate the checks in each Agent's Safety section. An Agent version published with guardrail policies does not answer until it is published again.

### Writes with confirmation

- Direct write tools (ADR 0038): published write operations of API Connectors and MCP servers, and inserts and updates of assigned Data Resources with a write policy, are flat Agent tools. A call only proposes the write: the widget shows a card with every value and **Confirm** and **Cancel**, and the write runs once through the Capability Execution Gateway (ledger claim, provider idempotency key, unknown-outcome handling) when the visitor confirms. Cards expire after 30 minutes; double clicks, retries and concurrent confirms never write twice; an unknown outcome is shown as unknown. The outcome is added to the transcript so the Agent can answer about it. The chat API takes `confirmation: {id, decision}` and returns `confirmations` and `confirmation_result`. A card must show the payload in full (at most 24 values of 2,000 characters), and a direct update cannot change the record's identity fields.
- Each assigned write has an **Ask visitor to confirm** switch, on by default; MCP writes always confirm.
- A direct Data Resource update reaches only records the current visitor owns: it is published only when the resource scope binds the attested actor's id and type or the conversation. For an Agent-wide or tenant scope the update needs **Allow updating any record** and then always asks the visitor.
- Telegram, Slack and WhatsApp confirm writes with native buttons on a separate card message. Only a verified button callback in the card's own conversation from the channel user who asked decides; typed text never does and a repeated callback writes nothing. A connection gets writes that need confirmation only with its webhook secret configured (Telegram `webhook_secret`, Slack `signing_secret`, WhatsApp `app_secret`). Email never offers them. Custom channel drivers opt in with `ConfirmsAgentWrites`.
- A direct API write whose integrity policy uses a business key or a bot-wide scope never returns another conversation's stored result; the duplicate is rejected without dispatch.
- Upgrade note: an Agent with write permission and an assigned Data Resource with a write policy gains its create and update tools on its next publish. Republish Agents with update tools; older update pins are refused until then.

### Data Resources

- One setup screen instead of a five-step wizard: pick a model and every column is proposed as a table row with label, type and the switches **Show**, **Filter**, **Sort**, **Search**, **Total**, **Group**, **Linked record** and (with writes) **Write**. Passwords, tokens, secret-like names, hidden attributes and encrypted casts are never proposed. **Records** chooses whose rows the Agent reads: the visitor's, this Agent's, the tenant's, all rows (with a confirmation) or custom scope filters. **Preview** shows a sample of the unsaved settings and the exact tools the Agent gets. Saving unchanged settings keeps the contract hash, including the stored field order and settings the screen hides. "When to use" is required.
- Totals and breakdowns from one tool call: **Total** allows `sum`, `avg`, `min` and `max` (dates: earliest and latest), **Group** gives one count or total per value, and date fields group per day, week, month or year on MySQL, MariaDB, PostgreSQL and SQLite (50 groups by default). A `search` argument matches up to five words across the text-search fields, case-insensitively on every database. **Linked record** returns a column of a `belongsTo` record next to its key, discovered only from methods declared to return `BelongsTo`. All of this works only on returnable, non-sensitive fields inside the same scope filters, cost guard and statement budget. A `sum` beyond PHP's integer range is returned as an exact decimal string.
- Upgrade note (breaking): `filter_input_policies` (aliases, date formats, relative dates) are removed; they were never applied. A resource that set them has a new contract hash; republish its Agents and Playbooks.
- A Playbook query step with a fixed query failed at run time ("query_data_resource input contains unknown fields: mode"): the request schema's default `mode` next to the query object is now ignored; a conflicting flat mode still fails.

### Playbooks

- Playbooks are flat Agent tools (ADR 0040): a Playbook declares its inputs as one schema on its Entry step; missing or invalid values come back to the model by name and nothing starts, so the Agent asks naturally, and all values in one message start and finish the run in one turn. `cancel_playbook` is offered whenever a run is open. Approvals are decided on the confirmation card, never by text; surfaces without cards do not get Playbooks with approvals. A handoff a Playbook creates is the turn's own handoff, so the visitor reads the Agent's answer.
- Editor: a Playbook opens as a vertical step list with **Add step** between steps and paths as sub-lists, so it cannot create unconnected steps or forget a path; the canvas is a second view of the same steps. Selecting Entry opens **Collect details** (at most 20 fields of nine types); Request Input is **Ask mid-process**. One palette grouped into Operations, Flow, AI, Values and Finish. A new Playbook starts from **Describe your process** (AI draft) or one of seven templates (callback request, appointment request, lead qualification, order status, return request, support ticket, quote request). One problem list with in-place fixes replaces the review counters. The editor autosaves; Publish is one click and ends with a summary of what the Agent can now do. The test chat highlights the waiting step, simulates writes and can **Play sample**. Editor colors and font follow the panel.
- Editor header and menu: one header with back, the name (click to rename) and the save state on the left; List/Canvas, undo/redo, the problem count (only when there is something to fix), **Test** and **Publish** (**Published** when nothing changed) on the right. The Filament gear menu is gone; its actions and the editor's own menu are one "..." menu grouped into Playbook, Build, View and Danger zone. The header stays on one line at 1280 and 1024 px: labels collapse to icons in a fixed order, undo and redo stay. On narrow screens the step list stays readable next to an open step instead of wrapping letter by letter.
- Plain wording: Setup asks "What does this Playbook do?", "When should the Agent start it?", "When should it not start?" and "What might visitors say?" with example placeholders; the create form's "Bounded outcome" is "What does this Playbook do?". **Hand over to team** and **Ask visitor to confirm** replace Human handoff and Approval in step names. Visitor-facing names keep two fields; per-step texts and the safety boundary sit under Advanced, as do the Agent instructions in **Describe your process**.
- Agent and data where they are missing: without an Agent, one problem offers **Choose Agent** (also in the test, describe and versions panels and in a data step); a query step without data is one problem, "Choose the data this step reads.", with **Choose data** (a Data Resource the Agent may read or may be given, added to the Agent's draft) or **Create Data Resource** in a new tab. Every counter reads one settled problem list that does not jump while a check runs.
- Faster: the editor opens with the server's findings for the saved draft (no first check round trip; settled problems at first paint), the autosave reports findings for edits instead of a second check, and bridge calls skip the page re-render.
- **Create Playbook** asks how to start (Describe your process, one of the seven templates, or empty); the editor applies it once when it opens.
- Test chat: the linked Agent's model fills Entry's details from what the visitor wrote, as in a chat (one extra model call per start, recorded in AI usage); a missing or invalid value gets a short question and the next message is read together with the earlier ones. The **Details** fields are an optional prefill that wins. A failed step shows the reason its failure code gives (only a real rate limit says rate limit), translated.
- The editor's code loads once: no chunk imports the entry by its plain URL any more (it ran a second copy of the editor).
- A Playbook release no longer contains the Agent's behavior, so changing the Agent's tone never requires republishing a Playbook.
- Upgrade note (breaking): `request_evidence`, text-classified approvals and the cancellation phrase list are gone. Republish each Playbook (move up-front Request Input steps to Entry inputs) and then the Agent; until then the Agent does not offer it, and an open run of an older version can only be cancelled. Run the migrations (`agent_tool_confirmations.workflow_run_id`).

### Knowledge

- **Knowledge** is a library of sources shared by Agents: a source can serve several Agents or none, the list shows **Used by** and offers **Agents** and **Re-sync now**, and the Agent editor adds sources with **Add from library**. Assignments are draft changes; a live Agent searches only the source versions pinned at its last publish. **Embeddings billed to** names the Agent whose embedding key and budget ingestion uses.
- URL and API sources re-sync never, daily or weekly through the scheduled `filament-agentic-chatbot:sync-knowledge-sources` (every 15 minutes); unchanged content keeps its index without embedding calls.
- File sources accept DOCX, CSV and XLSX; tables become Markdown tables chunked with their header. Office files are checked for size, compression ratio and document type declarations before parsing (`AGENTIC_CHATBOT_INGESTION_MAX_EXTRACTED_BYTES`, default 10 MiB).
- A source that a live Agent version pins cannot be moved to trash or deleted. Knowledge gaps are detected again from the recorded knowledge retrieval status.
- Upgrade note (breaking): `bot_knowledge_sources.bot_id` is replaced by `bot_knowledge_source_assignments` (owners are migrated); `KnowledgeSource::bot()` is now `bots()` and `Bot::sources()` is many-to-many. A host `AdminAuthorizationQueryScope` that filtered knowledge sources by `bot_id` must filter through `bots`. `meta.api.sync` is replaced by `sync_frequency`. The built-in `bot_knowledge_sources` Data Resource is removed. `openspout/openspout` and `ext-zip` are required.

### APIs and MCP servers

- **MCP data sources** are now **MCP servers**. **Import tools** lists every tool of a server: a tool the server marks read-only starts as **Read**, every other tool starts **Off**; **Write** imports a draft that still needs its own write review and staging test. One signed review covers the whole import; reopening it marks tools that changed or disappeared.
- API Connectors and MCP servers can serve **Selected Agents** besides one Agent or all Agents: one connection and its credentials with explicit assignments, editable only for Agents the admin may edit; removing an Agent denies its next call.
- **One Agent** requires an Agent when saving, and a connection for **One Agent** serves no Agent when that Agent is deleted (before, it became available to every Agent).
- Google Docs setup compiles again with a source-reviewed HTTP write-result contract; only a final HTTP 200 with a valid, identity-matching response succeeds.
- Upgrade note: run the migrations (`2026_10_03_000012` adds assignments, `agent_access`, definition marks and import reviews; `000013` marks existing Agent-only connections).

### Webhooks and read API

- New webhook events `conversation.started`, `conversation.ended` (no message for 30 minutes and no open handoff; `OUTBOUND_WEBHOOK_CONVERSATION_IDLE_MINUTES`), `submission.created`, `feedback.received`, `playbook.completed`, `playbook.failed`, `action_review.requested` and `usage.budget_threshold` (80 and 100 percent of a monthly budget, once per month), each recorded in the transaction of its outcome. Per endpoint an admin can opt into **Submission fields** and **Last messages**, redacted and capped at `OUTBOUND_WEBHOOK_MAX_PAYLOAD_BYTES` (64 KiB); a submission whose schema cannot be read has every field masked. Changing the opt-in pauses the endpoint until a new signed test.
- Read API v1 under `/api/filament-agentic-chatbot/read/v1`: a submission, a cursor-paginated submission list, a conversation with its redacted messages, and a handoff. Agent access tokens need the scopes **Read API: submissions**, **conversations** or **handoffs**; `*` (now **All chat abilities**) does not grant them. A token reads only its own Agent and allowed areas and is rate limited (`READ_API_RATE_LIMIT_PER_MINUTE`, default 60).
- Upgrade note: conversations, submissions, Playbook runs and action reviews get a `public_id`; conversations get `activity_period`, `last_activity_at` and `ended_at`. `filament-agentic-chatbot:maintain-outbound-webhooks` also ends idle conversations and is scheduled every minute even when webhook delivery is off. Handoff payloads add `data.conversation.id`; the lead tool's `reference` is the submission's public id.

### Usage and prices

- **Usage** opens on this month's overview: cost, tokens, conversations and cost per conversation, cost per day, Agents by cost with budget use, the most expensive conversations and a model table; tests and editor AI are shown apart. The per-call ledger moved to **All calls**.
- Default model prices for Gemini, OpenAI, Anthropic and Mistral models (list prices, verify against your contract); Ollama models cost nothing by default. **Usage > Model prices** sets a price per model and wins over `usage.pricing`, which wins over the defaults; the form validates each rate to the currency's precision. `filament-agentic-chatbot:price-ai-usage` prices earlier calls that ran without a price.
- Upgrade note (breaking): the **Review receipt** action and the old usage widgets are gone; usage call pages moved to `ai-usage/calls`. A host `usage.pricing` entry replaces the default for that model instead of being merged into it.

### Widget and channels

- The widget streams answers (ADR 0042): while the queue worker runs a turn, the chat request sends the answer as it is written and short tool states ("Searching knowledge…"). The committed answer replaces the draft; disconnects and reloads fall back to polling without running the turn again. Output checks and Safety settings run on the draft before it is sent. Web and queue processes must share the cache store (`AGENTIC_CHATBOT_CHAT_STREAM_CACHE_STORE`); `AGENTIC_CHATBOT_CHAT_STREAM_RELAY_SECONDS` (default 100, 0 disables) bounds the relay. Channels still send the final text.
- One language per widget session from `resources/lang/{en,de,fr,es}/widget.php`; without written visitor texts the widget follows the browser among the Agent's languages. The panel is opaque on every template, text and cards meet WCAG AA in light and dark, phones get a full-screen sheet, and hosts can set `--fac-font`, `--fac-z-index`, `--fac-offset-x`, `--fac-offset-y` and `--fac-focus-ring`. Rendered HTML is stripped of `style`, `xlink:href` and `javascript:` form actions; the admin preview accepts messages only from the panel's origin.
- Expanded conversation starters collapse again: **More suggestions** turns into **Show fewer** (translated in en, de, fr and es) in the empty state and the composer panel, and the toggle keeps focus instead of moving it to the first new chip.
- The widget script is built from `resources/js/widget/src` into the committed `resources/dist/widget.js`; installing the package needs no Node.
- Conversation starters: up to eight per Agent (was four), each with an optional group. The widget shows them as compact chips (label and icon; the prompt is the tooltip and accessible description), four at once with **More suggestions**, and groups as small headings. After the first message a **Suggestions** button next to the input reopens them. The default "Choose a suggestion" hint is gone; a written hint still shows. Upgrade note (breaking): `quick_prompts` and plain-string starters are no longer read; a migration rewrites stored widget settings to `conversation_starters`.
- Attachments by paste and drop: Ctrl/Cmd+V of an image or file in the message field and files dropped on the open panel join the pending attachments with the existing type, size and count checks. A calm "Drop files to attach" overlay (en, de, fr, es) shows while files are dragged over the panel. Pending images show a small thumbnail in the tray; pasted screenshots get a name like `screenshot-2026-10-04-1132.png`. Plain text paste is unchanged, and nothing happens when attachments are off.
- Upgrade note (breaking): `resources/views/widget/script.blade.php` is gone; a published copy is no longer used. The `widget.default_*` text settings default to unset (the translated texts); the config endpoint returns `null` for unwritten texts. Widget approval quick prompts are removed.

### Admin navigation and languages

- One navigation group with **Build** (Agents, Playbooks, Knowledge), **Connect** (Channels, APIs & MCP, Data, Webhooks, and an overview with access tokens), **Inbox** (handoffs waiting for an operator and pending action reviews, one badge) and **Insights** (Conversations, Submissions, Usage). The plugin class configures group, sort, shown sections, labels and icons. Playbook runs are listed on each Playbook and conversation. Conversations stay in the menu; a denied user sees "No access to conversations". Action reviews open on pending ones with readable names.
- Admin text uses namespaced PHP translation files with semantic keys, one file per area, publishable with `php artisan vendor:publish --tag=filament-agentic-chatbot-translations` and overridable per key. English and German are complete; French and Spanish cover every admin, runtime, widget and editor text by machine translation (not reviewed by native speakers). Helper texts and disclaimers that restated the obvious were removed, and release jargon replaced.
- The turn inspector, the conversation page's diagnostics, Knowledge error notices and Playbook version summaries are translated; label and value lines on the Agent's Website tab follow each language's punctuation.
- Upgrade note (breaking): `UiText`, the SHA-1 `raw` keys and the old `filament-agentic-chatbot.php` group files are removed; republish translation files and move overrides to the new keys. Overrides for removed keys are ignored.

### Dependencies and fixes

- `league/commonmark` requires `^2.10.2` (GHSA-97jj-33gv-5xf9 raw-HTML filter bypass, GHSA-3q6v-r5mr-hxv8 table denial of service). `symfony/process` is no longer a runtime requirement; `ext-intl` is suggested for Unicode normalization of Safety blocked words.
- `filament-agentic-chatbot:setup-google-calendar-connector` works again: the event insert declares its reviewed write evidence (final HTTP 200 with the created event; anything else stays unknown).
- A Playbook step that reads through an owner-scoped connection publishes for an Agent without write permission: the permission follows the pinned revision's published effect, not whether the editor can run the operation.
- A turn over an access token's or the Agent's input token limit is answered with HTTP 200 and the fixed "conversation has become too long" notice (no model call); the API docs no longer list a 422 for it.
- The Agent test grader delimits its data blocks like the scope gate (all angle brackets replaced, long texts keep start and end).

### Removed

- The Launch Dashboard (`agentic-chatbot-launch`), the top-level Playbook Runs list (`workflow-runs`; the run inspector keeps its URL), **Observe** and **Improve**.
- Old dialogue-runtime leftovers: the `clarification` routing expectation, the `clarification_required` status, input-clarification and batch fields of `ChatTurnExecutionEvidence` (now `chat_turn_execution_evidence.v7`), the Candidate 165 non-dispatch reconciliation (a migration drops `ai_usage_non_dispatch_resolutions`), the unused `grounding.*` and `agent_runtime.*` configuration keys.

## [0.19.0] - 2026-09-05

### Fixed

- Kept save and validation feedback tied to its own operation, including successive requests and editor sessions. Long messages wrap on narrow screens; native dialogs leave canvas focus mode so they and their notifications remain visible.
- Added a direct Rename action in Playbook settings and clarified the separate title shown to visitors.
- Bounded Widget initialization and history requests so stalled connections show a retry action instead of an indefinite loading state. Late responses cannot replace a newer chat session.
- Preserved distinct repair targets for equally named Playbook steps, combined duplicate reports of the same repair, and kept nonblocking checks out of blocker counts.
- Made Playbook panel widths depend on the editor container, preserving preferred widths and focused fields through drawer changes.
- Kept the mobile inspector closed when no step is selected, including after reload, while retaining desktop width preferences.
- Made focus mode fill the viewport in the published Playbook viewer and linked its step explorer to the actual process steps.
- Matched step finder labels and search terms to the capability types shown on canvas cards, including Search knowledge.
- Preserved canvas framing when panels resize and kept nested control shortcuts from clearing the selected step.
- Bound editor saves and publications to the reviewed draft and published revisions. Conflicts keep autosave and mutations paused until the current draft is loaded, preventing stale tabs from silently overwriting it.
- Aggregated approved Connector output fields across pagination, preserved verified earlier pages when a later response is rejected, and reported item/page limits as partial results. Later partial responses keep their status through continuation recovery. Conflicting page context cannot label records with another page's metadata.
- Allowed registered authentication strategies to return headers without query parameters.
- Kept all validated DNS addresses in one cURL resolve entry, allowing reachable IPv4 or IPv6 addresses to be used without weakening destination pinning.
- Preserved OpenAPI response nullability and reported unsupported unions instead of selecting a branch silently.
- Kept short free-text acknowledgements and side requests out of automatic Playbook continuation. Valid free-text answers still use source-bound Agent proposals.
- Supplied the current verified Playbook question to the Agent before interpreting a reply, without relying on chat history or exposing future steps. Only an authorized continuation can save that reply and advance the process.
- Preserved Gemini's original tool-call IDs in both conversation history and tool results. Internal correlation IDs are no longer sent as provider IDs for calls that originally had none.
- Preserved terminal provider completion errors even with nonempty text, retained verified facts and canonical Playbook outcomes, and prevented unfinished prose or whole-turn retries from replacing them.
- Made Request Input type changes consistent across authoring and compilation. Decision path renames preserve connected transitions, and connected paths require explicit disconnection before deletion.
- Saved changes to Playbook invocation rules while typing, with consistent autosave and undo behavior.

### Changed

- Replaced the Playbook status map with a compact step finder linked to Review. Removed the duplicate Suggested catalog and repeated inspector status panels.
- Added visual form-field and verified-result authoring, with advanced fallbacks for unsupported structures and explicit references.
- Added guarded process starters and separated direct process tests from Agent conversation tests. Versions now reports the current release's actual active-Agent assignment.
- Added schema-aware API argument controls for numbers, booleans, enums, lists and objects, retaining variable mappings and visible invalid input.
- Added explicit OpenAPI query parameter serialization through the existing immutable request contract.
- Distinguished existing releases that need attention from unpublished Playbook drafts in the list.

### Migration

- Connector implementation bindings changed. Test and republish operations, then dependent Playbooks and Agent candidates before resuming traffic; see [Upgrading](UPGRADING.md#0190-connector-contracts-and-editorruntime-corrections).
- No database migration is added. Refresh the compiled Filament editor assets in the host application.

## [0.18.0] - 2026-09-04

### Added

- Added structured Widget conversation starters with separate labels, exact submitted prompts, and optional allowlisted icon aliases.
- Added a permission-checked read-only Playbook viewer for inspecting published process structure without exposing mutation controls.

### Changed

- Refined all Widget themes, empty and welcome states, composer behavior, responsive layout, and preview fidelity.
- Closed Widget dialogs are removed from the accessibility tree, expose their expanded state on the launcher, and return keyboard focus to that launcher.
- Simplified the responsive Playbook Builder shell, sidebar, checks, settings, and review presentation while preserving the existing authoring and runtime contracts.
- Advanced the built-in Customer Support and Human Handoff Solution Kit to `1.1.0` for its structured Widget starter definition.

### Migration

- Existing saved Bot settings using `quick_prompts` remain readable and are normalized to structured `conversation_starters` when edited. Custom widget clients must consume the new response field.
- Host-defined Solution Kits must replace `quick_prompts` with `conversation_starters` objects containing `label`, `prompt`, and an optional supported `icon`.
- No database migration, dependency change, Agent recreation, or Playbook republish is required solely for this release. Run both Doctor commands, refresh Filament assets, and smoke-test the Widget and Playbook viewer in the host application.

## [0.17.5] - 2026-09-04

### Fixed

- Resumed active text and choice Playbook waitpoints deterministically for short, unambiguous whole-message replies before model dispatch.
- Kept side questions, cancellation, conditional or uncertain statements, quoted text, multiline input, mixed statements, approvals, forms, and operator reviews on their existing guarded paths.
- Avoided an unnecessary provider request for admitted standalone waitpoint answers while preserving the visitor's exact submitted text.

### Migration

- No database migration, configuration key, dependency change, or Playbook republish is required when upgrading from 0.17.4. Run both Doctor commands and repeat a saved candidate test for each live Playbook waitpoint path.

## [0.17.4] - 2026-09-04

### Fixed

- Made Data Resource tool descriptions name their exact immutable arguments, including the deployment-pinned `sort_by` or legacy `sort_field` contract, so native structured-tool providers do not need to guess aliases.
- Kept undeclared Data Resource arguments fail closed while returning bounded, field-specific diagnostics that permit only one correction with the exact published schema. The rejected proposal never reaches the database or capability gateway.
- Added regression coverage for current and legacy immutable Data Resource pins and for the safe correction response after an undeclared `order_by` argument.
- Superseded the `v0.17.3` source tag, which was not promoted to an immutable GitHub release after its protected native Gemini routing gate rejected an undeclared sort alias.

### Migration

- No database migration, dependency change, or republish is required when upgrading from a completed v0.17.3 candidate. Run both Doctor commands and repeat the saved Data Resource candidate tests before activation.

## [0.17.3] - 2026-09-04

### Changed

- Raised the Laravel AI SDK requirement to `^0.11.2` and the exact AgentGraph runtime dependency to `0.16.2`.
- Moved Gemini Connector tool-name recovery to Laravel AI's shared multi-step generation loop while retaining exact-match and ambiguity rejection rules.

### Fixed

- Preserved Gemini thought signatures across tool-result continuations so Gemini 2.5 Flash-Lite can complete Knowledge, Connector, Data Resource, and Playbook turns after a tool call instead of returning an empty terminal answer.
- Retained disjoint Gemini cache, prompt, tool-use, completion, and reasoning usage accounting on the updated SDK gateway.
- Kept Laravel AI approval continuations outside the productive authorization surface; AgentGraph interrupts and the capability gateway remain the only approval and write authorities.

### Migration

- No plugin database migration is added. Stop workers, update the package and AgentGraph together, run both Doctor commands, then recompile and republish Playbooks and their Agent candidates because productive artifacts pin the exact AgentGraph runtime release.

## [0.17.2] - 2026-09-04

### Fixed

- Aligned the protected live-provider gate with the runtime's documented deterministic evidence fallback. The gate now accepts that fallback only after the exact expected reads succeeded, the evidence guard identifies a repairable response-contract failure, and the single tool-free repair attempt was rejected.
- Bound one non-executed Data Resource grounding rejection to its exact fail-closed runtime contract, while malformed rejections and repeated proposal loops remain release failures.
- Made contextual follow-up assertions count only productive capability executions; separately bounded evidence replays remain visible and must still reference a unique successful result without another external request.
- Added deterministic release-eval coverage proving that the bounded fallback is accepted while unrelated provider failures remain release failures.
- Superseded the `v0.17.0` and `v0.17.1` source tags. Neither tag was promoted to an immutable GitHub release after its protected workflow exposed a stale release assertion.

## [0.17.1] - 2026-09-03

### Fixed

- Aligned the protected live-provider release gate with the runtime's bounded fanout replay contract. Each distinct successful read may be replayed once from immutable evidence, while repeated replay loops still fail the release.
- Added regression coverage proving that two distinct fanout items can both be reused without issuing another external request.
- Superseded the `v0.17.0` source tag, which was not promoted to an immutable GitHub release after its tag workflow exposed the stale gate assertion.

## [0.17.0] - 2026-09-03

### Added

- Added a fail-closed release credential scanner for every release-eligible source file and every text file in the exact commercial ZIP. Findings expose only SHA-256 fingerprints, exact exceptions are path/line/rule/fingerprint bound, and the shipped allowlist starts empty.
- Added deterministic, evidence-bound Playbook result composition for selected capability fields, bounded iterations, and mapped child results without another model call; partial and unknown outcomes remain explicit.
- Added immutable per-Agent input/output Guardrail Policy assignments through candidate publication, exact-candidate testing, and activation, including historical resume protection.
- Added an authorized read-only channel Delivery view with accepted chunk IDs and explicit unknown-outcome guidance.
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

- Made direct Agent reads require exact latest-message purpose evidence across Knowledge, Connectors, and Data Resources; explicit named opt-outs hide and block those tools, while a bounded adjacent Connector follow-up requires an immediately preceding attested successful read and one uniquely eligible pinned operation.
- Promoted the exact AgentGraph runtime dependency from `0.16.0-rc.2` to the stable `0.16.0` release after the unchanged runtime tree passed PHP 8.3/8.4 with Laravel 12/13 and a fresh public Composer install.
- Advanced the exact AgentGraph runtime dependency to `0.16.1`, whose idempotent schema migration tolerates already-present runtime columns without silently marking an incomplete migration as applied.
- Raised the Filament security floor to `5.7.6`, excluding releases affected by the audited MFA-bypass, MFA-code-reuse, and panel-login disclosure advisories published before release.
- Bound protected release jobs and the commercial archive/SBOM to one retained, source- and hash-verified Composer resolution; ordinary compatibility jobs retain their distinct target resolutions.
- Made Agent onboarding distinguish appearance samples from behavior tests, show direct-read setup before optional Playbooks, retain Knowledge navigation context, and evaluate live pinned Knowledge separately from a newer failed index.
- Restored stable Gemini 2.5 Flash-Lite to the verified model selector and capability/pricing catalogs so Integration Studio can use the lowest-cost structured-output model without a host-only override.
- Made Slack and Mailtrap Email real-provider-tested but explicit deployment opt-ins, and kept WhatsApp Cloud API and Mailgun Email fail closed behind separate default-off provider flags until each completes its real-account acceptance run; Telegram remains available by default.
- Hardened the `0.17.0` candidate around the Agent-first production boundary: immutable Knowledge, Connector, Data Resource, and Playbook authority is pinned at publication and runtime drift fails closed.
- Made protected release evidence exact and blocking. Catalog cases must match the executed PHPUnit `test_file::test_method`; calibrated retrieval, real pgvector, live Knowledge citation retention, and the final all-jobs-green aggregator are required release jobs.

### Fixed

- Prevented generic Data Resource field words from authorizing unrelated default reads, preserved the exact sort argument frozen into older immutable deployments, suppressed duplicate reads for an already completed purpose, and removed query/resource metadata from model-facing answer payloads.
- Rendered selected records and record lists as deterministic visitor-facing fields instead of leaking internal JSON paths, and routed malformed or empty Knowledge/direct-read answer contracts through one tool-free evidence repair or a safe fallback.
- Synchronized the isolated sandbox with the published configuration and current Playbook/Handoff state contracts, restoring a clean Fresh install, seed, Doctor, and route smoke.
- Made the external-host workflow-editor E2E cleanup remove immutable Connector publication evidence in foreign-key order and fail visibly on cleanup errors, and froze the token-backpressure TTL assertion so the release suite cannot fail at a one-second boundary.
- Persisted Telegram chunk progress before dispatch and after provider acknowledgment, preventing known retries from resending accepted chunks or rerunning the Agent; uncertain delivery stops for reconciliation.
- Prevented busy channel turns from consuming a second accepted inbound message; ordered admission retries the same durable turn identity and keeps staged attachments until terminal handling.
- Removed sensitive default headers from Connector duplicates, made Bridge/preview failures visible without exposing diagnostics, checked participant commands against Agent access, and stopped displaying unpriced usage as zero cost.
- Extended Doctor's release-quality schema checks and synchronized public documentation and archive-safe links with the canonical package contracts.
- Bound Mailtrap webhook-secret selection to the explicit `inbound_receiving` event type so Email Sending delivery events that also contain `inbox_id` are authenticated with the distinct Sending webhook secret.
- Made advanced Channel Connection JSON validation compile as Laravel rules instead of being evaluated as Filament dependency-injected UI closures, so guided provider connections can be saved reliably.
- Reconciled terminal AgentGraph chat turns before returning `busy`, prevented unmaterialized side-effect success from replaying a fabricated result, and persisted only sources actually cited by an Agent answer.
- Redacted direct Connector results, made Playbook cancellation require explicit re-attested user intent, and moved uploaded Knowledge files to private, ownership-authenticated storage with an explicit migration path.
- Made the irreversible action-review waitpoint migration reconcile pre-existing or partially created indexes idempotently, so a retried production upgrade does not fail on duplicate PostgreSQL relations.
- Made Agent Access Token filter discovery select only scalar filter columns, preventing PostgreSQL `DISTINCT` failures on JSON-backed token metadata.

### Migration

- Added `2026_08_30_000005_add_channel_delivery_progress.php`. It adds nullable delivery progress without inventing historical receipts; rollback refuses to erase recorded delivery evidence.
- Added `2026_08_28_000001_create_bot_conversation_outcomes_table.php`. Existing history is not inferred or backfilled; run migrations before recording outcomes.
- Added `2026_08_28_000002_create_agent_solution_kit_installations_table.php`. Existing Agents are not changed; run migrations before using the Solution Kit wizard.
- Added `2026_08_28_000003_create_integration_studio_installations.php`. Existing Connectors are not changed; run migrations before using Integration Studio.
- Added `2026_08_29_000001_build_production_handoff_desk.php`. It maps legacy `pending` cases to `waiting_operator`, adds version/SLA/team fields and immutable activity, and fails closed when a conversation already has competing active cases.
- Added `2026_08_29_000002_build_quality_operations.php`. It adds automation state to saved quality scenarios and creates encrypted knowledge-gap and immutable occurrence ledgers. Existing scenarios remain manual and existing conversations are not heuristically backfilled.
- Added `2026_08_29_000003_create_bot_message_attachments.php`. It creates verified private attachment and per-turn linkage ledgers; existing messages are not backfilled.
- Added `2026_08_29_000004_create_channel_inbound_attachments.php`. It creates idempotent, short-lived private ingress staging for queued channel uploads; existing channels are not backfilled.
- Added `2026_08_29_000007_add_widget_display_context_to_chat_turns.php`. It adds encrypted, nullable storage for bounded visitor-visible page context; existing turns are not backfilled.
- Added `2026_08_29_000008_add_candidate_quality_comparisons.php`. It adds opt-in candidate release gates and deployment-role/comparison bindings to quality runs; existing Published Agent runs are classified as live and remain valid under the prior hash-based current-run contract.

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

> **Note:** The `v0.12.0` git tag marked an early preview commit. `v0.13.0` is the first recommended release that ships the documented agent-first runtime together with the AgentGraph workflow platform. See [docs/RELEASE_NOTES_v0.13.0.md](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/RELEASE_NOTES_v0.13.0.md).

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
