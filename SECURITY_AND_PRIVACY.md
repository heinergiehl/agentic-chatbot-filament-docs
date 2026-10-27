# Security and Privacy Notes

## Data Collected

- Conversation messages (`user`, `assistant`)
- Evidence-backed business outcomes and encrypted evidence references
- High-confidence knowledge-gap cases with encrypted question excerpts, encrypted operator notes, and payload-free occurrence evidence
- Retrieval source metadata attached to assistant messages
- Private chat-attachment content plus encrypted original names, bounded metadata, hashes, and retention state
- Temporary private channel-ingress attachments for queued multipart email processing, with encrypted original names, opaque queue references, hashes, and short retention state
- Session identifier and a one-way hash of the separate conversation credential used for conversation continuity
- Optional visitor-visible page context encrypted on the durable Chat Turn after URL and attribute minimization

## Recommended Privacy Policy Clauses

- What user text is stored and for how long
- Which AI providers process prompts
- How users can request export or deletion of chat history
- How to contact support for privacy requests

## Controls in This Plugin

- Per-bot domain allowlist checks
- Optional signed embed tokens (`AGENTIC_CHATBOT_WIDGET_SIGNING_ENABLED=true`)
- Header-first widget token transport with query/body compatibility flags
- Optional short-lived signed customer context bound to the exact Agent, area, and origin; unsigned request fields cannot create actor, tenant, or workflow authority
- Optional visitor-visible page context that is size-bounded, stripped of URL query/fragment/credentials, rejected for secret-like keys, encrypted at rest, and isolated from runtime authority and tool inputs
- Replay-stable widget lifecycle projections that expose only public turn state, declared business outcomes, opaque tool evidence, and the existing safe handoff state
- Server-issued anonymous conversation credentials; a session ID alone cannot authorize history, export, feedback, form drafts, turn polling, or deletion in production
- Request throttling by bot/session/IP
- Friendly provider errors without stacktrace leaks in widget output
- Bring-your-own-key provider configuration: the Composer package contains no maintainer-owned AI credential, while host and per-Agent keys remain installation-owned secrets
- URL ingestion safety checks (blocks localhost/private networks by default, revalidates redirects, enforces size and content-type limits)
- Workflow HTTP Request and API connection safety checks for localhost/private-network targets by default
- Per-Agent Safety settings: blocked words and email/phone/link masking or blocking for visitor messages and answers, enforced before storage, model input, streaming and delivery (see [Agent Safety Settings](#agent-safety-settings))
- Non-executing Integration Studio parsing that discards imported credentials, scripts, cookies, samples, file content, and remote references before AI or persistence
- Explicit developer tool provider inspection (Settings > Developer tool providers) that validates registered server-side contracts without reflecting or exposing arbitrary Filament actions
- Encrypted, draft-hash-bound synthetic API connection fixtures with a network-free canonical response replay path that cannot satisfy publication or live execution authority
- Workflow trace capture controls with key-based redaction for sensitive values
- Production doctor warnings for unsafe widget transport, empty domain allowlists, missing or invalid Agent deployments, Workflow trace posture, and credential decrypt failures
- Assistant-message feedback capture for analytics and quality review
- Durable knowledge-gap detection that requires committed runtime evidence and never classifies missing citations alone
- Explicit administration authorization: four host-granted abilities for new installations and per-surface Gates (`strict` mode) for upgraded ones; panel membership alone grants nothing and no environment grants administration (see [Administration Abilities](#administration-abilities))
- Hard monthly token/cost budget checks with in-flight request reservations
- Bot-scoped built-in internal app data tools and hidden runtime safety scopes for `query_data_resource`
- Content-detected, hash-bound chat attachments on a non-public disk with scheduled retention cleanup
- Provider-authenticated Telegram, Slack, Mailtrap, and Mailgun webhooks; bounded provider-host-only file downloads; and path-free durable email ingress staging
- Agent-bound outbound webhooks with public HTTPS/DNS pinning, no redirects, exact-body HMAC signatures, transactional outbox/idempotency evidence, encrypted payload storage, PII-minimized schemas and redacted, explicitly opted-in payload content
- A token-scoped, rate-limited read API for submissions, conversations and handoffs with explicit read scopes
- Raw channel payload capture disabled by default; when explicitly enabled for debugging, secret-key values are redacted and strings, object breadth, nesting, and invalid UTF-8 are bounded before queue or database persistence
- Local release credential scans over both release-eligible source files and every text file in the exact commercial ZIP; findings expose only SHA-256 fingerprints, and the release allowlist has no wildcard mechanism

API connection fixture inputs and bodies are encrypted and deliberately excluded
from replay evidence, logs, notifications, visitor output, and model context.
Only `Content-Type` and `Retry-After` response headers are accepted. Operators
must use synthetic data; fixtures are not a sanctioned store for captured
production payloads. Fixture rows are removed with their owning operation, and
an intentional contract change requires a new fixture instead of mutating old
evidence.

## Agent Safety Settings

Each Agent's **Safety** section (Agent editor, Instructions) is published with the
Agent version; `WorkflowSafetyBoundary` enforces it.

- Personal data masking replaces email addresses, phone numbers or links with
  a translated placeholder. For visitor messages the masked text is what is
  stored and sent to the AI provider; the original is not persisted. For
  answers the masked text is stored, shown, streamed and sent to channels and
  webhooks. Masking does not apply to attachments, tool results kept for the
  conversation transcript, knowledge source links, confirmation cards (they
  show the values a write will use) or messages exchanged with a human
  operator during a handoff.
- Masking or blocking visitor email addresses or phone numbers also hides
  them from lead capture, handoff and Workflows, because the model never
  receives them; the Safety section says so when this is selected. Use it
  only where the Agent should not collect them.
- Phone detection accepts international numbers, national numbers with a
  trunk prefix and North American numbers. It does not treat dates, prices,
  version numbers, IBANs, card numbers or labelled order and customer numbers
  as phone numbers, and it does not recognize every possible format; it is a
  data-minimization aid, not a guarantee.
- Blocked words match whole words; topic limits are model instructions, not
  deterministic filters.
- Strict topic mode adds a scope check before the Agent loop: one call to the
  Agent's own provider with the scope text, the names and descriptions of the
  Agent's tools, the knowledge source names, the previous answer and the
  visitor's message, recorded in usage as `scope_gate`. Its decision is a
  model judgment, not a guarantee. It fails open: when the check fails, the
  Agent answers under strict instructions. An off-topic message gets the
  refusal without tools, so nothing is read or written for it. Attachments
  are not sent to the check: a message with only an attachment skips it,
  and what a file asks for is left to the strict instructions.
- Built-in checks for instruction overrides, credentials and prompt leakage
  cannot be switched off.

## Public Runtime Deprecations

The `0.x` line keeps compatibility defaults, but production hosts should opt into the stricter posture now:

```env
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_QUERY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_BODY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_ALLOW_ALL_DOMAINS=false
AGENTIC_CHATBOT_WIDGET_CONVERSATION_CREDENTIAL_REQUIRED=true
AGENTIC_CHATBOT_WIDGET_CONTEXT_ENABLED=true
AGENTIC_CHATBOT_WIDGET_CONTEXT_REQUIRED_AREAS=
```

Browser snippets contain no token. The loader obtains short-lived, exact-origin-bound access from `POST /api/filament-agentic-chatbot/chat/{botPublicId}/bootstrap`, keeps it in memory, and sends it through `X-filament-agentic-chatbot-Token`. Configure explicit per-bot production domain allowlists and run `php artisan filament-agentic-chatbot:doctor` before launch; production bootstrap rejects an empty allowlist. Anonymous conversation credentials are always enforced in production even if a stale published config omits or relaxes the setting.

A successful bootstrap from an allowed website host also records that host and the path of the page (never a query string or fragment) in `agentic_widget_installations`, so the Agent's **Channels & handoff** tab can show where the widget was seen. The record holds no visitor, session or IP data, is limited to 50 hosts per Agent and is deleted with the Agent. See [Chat Widget](CHAT_WIDGET.md#installation-status).

Personalized embeds may additionally send `X-Filament-Agentic-Chatbot-Context`. The host must issue it behind its own authenticated authorization boundary. It is signed but browser-readable, rejects secret-like fields and oversized payloads, and is bound to actor/tenant ownership before tool scopes are created. The issuer signs a user model as its class and key only and never copies its name, email address or other attributes into the token. Its optional key falls back to the existing widget-signing key. A signed context is not a permanent grant: a queued turn keeps its expiry and the Agent's context token version, and personal tools refuse an expired or rotated identity. See [Chat Widget](CHAT_WIDGET.md#signed-customer-and-tenant-context).

The supported `context.host_actors.types` configuration maps signed actor aliases
to host Eloquent models implementing `Authenticatable`. Setup and the resolver
reject invalid classes. With session auth context enabled, a signed alias and
session user may coexist only when the mapped class and authentication ID both
match. The signed alias remains the authority type in scopes and queued turns.
Different IDs, different types and unmapped session classes are refused with
`403 widget_context_invalid`; a valid signed request may run without a session
user. Keep the resolver's account and tenant rechecks configured as described in
[App data tools](DATA_RESOURCES.md#signed-in-customers-and-personal-tools).

An App data update is checked against the actor's pinned record scope before
showing a confirmation card. Missing and foreign records receive the same
refusal; neither produces a card or ledger claim. The locked execution repeats
scope, version and policy checks after Confirm.

Signed tokens remain reusable until expiry. Chat request replay protection
depends on a stable `client_turn_id` (or `Idempotency-Key`) and identical input,
not on the signature. The widget supplies this ID. The
`api.require_client_turn_id` setting (`AGENTIC_CHATBOT_CHAT_REQUIRE_CLIENT_TURN_ID`) defaults to
`true` in production and `false` elsewhere. If it is disabled and the ID is
omitted, replaying a signed request creates a new turn and may call the model
again. A persisted confirmation card independently prevents a second execution
once decided; a new turn ID does not renew its write authority.

Visitor-visible `display_context` is a separate, deliberately untrusted input.
It may help the model discuss the page the visitor can already see, but it
cannot identify an actor or tenant, widen a scope, select a hidden record, or
authorize a tool. The server normalizes it independently of the SDK,
encrypts the accepted value on the durable Chat Turn, binds it to turn
idempotency, and appends it only inside an explicit untrusted-data prompt
boundary. The literal visitor message remains unchanged. Hosts must use the
signed customer-context contract for server-attested identity and authority.

The browser SDK's `outcome`, `capability`, and `handoff` events are derived from
a frozen committed projection. They omit exact tool keys, inputs,
results, credentials, database identifiers, operator identity, internal notes,
and SLA metadata. Event payloads are safe transport projections, not an
authorization or accounting ledger; the corresponding server-side records
remain authoritative.

## Compliance Endpoints

- `GET /api/filament-agentic-chatbot/chat/{botPublicId}/history/export?session_id=...`
- `DELETE /api/filament-agentic-chatbot/chat/{botPublicId}/history` with JSON body `{ "session_id": "..." }`

The shipped browser widget supplies the corresponding `X-Filament-Agentic-Chatbot-Conversation-Credential` header automatically. A custom anonymous browser client must first bootstrap widget access, then create or resume its conversation through `POST /api/filament-agentic-chatbot/chat/{botPublicId}/session`, and keep both credentials out of URLs and logs.

Both API and Filament use one `ConversationPrivacyLifecycleService`. Deletion is serialized on the conversation row and fails closed while a chat turn, workflow, AgentGraph run/subrun, interaction, delayed delivery, external effect, action review, AI usage reservation, or channel delivery is active or requires reconciliation. The success response distinguishes deleted live history from retained operational/accounting/audit records and never returns their payloads. Retained business outcomes are detached from the deleted conversation, remain scoped to their Agent, and disclose only their category and count through the deletion result. A knowledge-gap case supported only by the deleted conversation is removed; a case with other occurrences is atomically rebound to a remaining canonical user message and its stored count/excerpt are recomputed before deletion. Treat this endpoint as scoped session-history deletion, not as proof that backups, logs, long-term actor memory, business submissions, business outcomes, or every data-subject record have been erased.

## Private Chat Attachments

Attachment filenames are encrypted at rest. Storage paths are randomized and
never returned by the public API; history and exports expose only a public ID,
display name, detected MIME type, byte size, and availability status. The
package refuses a filesystem disk configured with public visibility, Laravel
temporary serving, or a local root inside `public/`. Files are always written
with private visibility as a second defense.

Client MIME declarations and extensions are not trusted. The server uses
`finfo`, validates image structure and bounded dimensions, verifies PDF magic,
rejects binary or invalid UTF-8 text, and validates JSON. SHA-256 fingerprints
are part of the durable turn-input hash so the same idempotency key cannot be
replayed with different bytes. Conversation deletion purges the files before
deleting their metadata. The scheduled retention command purges expired file
content while retaining bounded audit metadata marked `purged`.

Follow-up Agent requests can include original private files on their retained
historical user messages. Selection is limited to the same Agent, conversation,
and area and the published session-history window. Current uploads take priority
within the shared file-count and byte limits; remaining space admits the newest
historical sources. Each invocation rechecks private storage, exact ownership
and path binding, expiry, size, SHA-256, detected content type and the current
published model's media support, then snapshots the verified bytes for SDK
serialization. Missing, purged, expired, unsupported or unverifiable files are
omitted with a bounded incomplete-context cue asking for the source again if
needed. Retention expiry applies even before scheduled pruning. Original files
remain untrusted user data and never become instructions or tool authority.
Input-token preflight counts historical files and removes them with their whole
turn when compacting history. Disabled session memory and answer repair do not
load historical files; summaries do not recreate omitted attachment contents.

External-channel files use the same content validation, published-model media
capability check, canonical turn hash, and final private chat storage. Telegram,
Slack, and Mailtrap provider references are downloaded only over HTTPS
from an explicit provider host allowlist, without redirects, credentials in URLs,
or unbounded reads. Mailtrap downloads and Mailgun multipart uploads are verified
before queue dispatch and staged under a randomized path. Queue payloads contain only an opaque ingress
ID and bounded file metadata; they never contain raw bytes, disk names, storage
paths, or provider credentials.

Email ingress records are transport state, not conversation history. The
daily `filament-agentic-chatbot:prune-channel-inbound-attachments` command
purges expired staged and consumed objects after
`AGENTIC_CHATBOT_ATTACHMENTS_CHANNEL_INGRESS_RETENTION_HOURS` (24 hours by
default). The normal chat-attachment retention policy still applies to the
canonical copy attached to a committed Chat Turn.

Mailgun receiving-route and event payloads use the Webhook
Signing Key, timestamp, and token HMAC with a bounded clock window. Slack and
Telegram retain their signing-secret and webhook-secret checks. Mailtrap signs
the exact raw webhook body with HMAC-SHA256 and each connection stores separate
Inbound and Email Sending webhook secrets. These delivery
provider secrets are encrypted in channel credentials and never supplied to the
Agent or Workflows.

## Workflow Trace Controls

If you use workflows in regulated or sensitive environments, tune the trace controls before rollout:

- `AGENTIC_CHATBOT_WORKFLOW_TRACE_CAPTURE_INPUT`
- `AGENTIC_CHATBOT_WORKFLOW_TRACE_CAPTURE_OUTPUT`
- `AGENTIC_CHATBOT_WORKFLOW_TRACE_CAPTURE_VARIABLES`
- `AGENTIC_CHATBOT_WORKFLOW_TRACE_CAPTURE_META`
- `AGENTIC_CHATBOT_WORKFLOW_TRACE_MAX_STRING_LENGTH`
- `AGENTIC_CHATBOT_WORKFLOW_TRACE_REDACT_KEYS`
- `AGENTIC_CHATBOT_WORKFLOW_TRACE_REDACT_VALUE`

These let you reduce trace volume and scrub sensitive keys before values are persisted.

Doctor warns in production when input, output, variables, and meta are all captured. Keep full capture only when you have a clear retention policy; otherwise lower capture levels and tune `AGENTIC_CHATBOT_WORKFLOW_TRACE_REDACT_KEYS`.

## Knowledge And Retrieval Privacy

Knowledge search failures return a generic user-facing error. Internal logs and retrieval diagnostics include the Agent ID/public ID where appropriate, exception class, and a SHA-256 query fingerprint, but not the raw query, provider secrets, credential values, or exception messages. Retrieval-query Workflow values are redacted from terminal run variables and trace payloads.

Scheduled knowledge-gap detection reads only terminal committed Chat Turns and requires a knowledge retrieval status of `empty` or `insufficient_evidence` and an assistant message without sources. It stores a SHA-256 normalized-question fingerprint, an encrypted bounded question excerpt, and occurrence metadata limited to the Agent deployment hash and configured context area. Operator resolution and ignore notes are encrypted. Provider prompts, credentials, API connection payloads, and complete model responses are not copied into the knowledge-gap ledger.

The built-in `bots` and `agent_workflows` App data tools were removed in 1.0. Only `bot_submissions` remains. A host that needs the removed resources must explicitly allowlist their models and define reviewed host config entries; see [Upgrading](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md#package-internal-app-data-tool-models).

App data tool safety scope filters are always applied at runtime and do not have to be exposed as normal workflow filters. Use them for ownership boundaries such as bot, tenant, team, or customer IDs. Query results do not expose scope enforcement metadata; the concrete applied-scope map is not duplicated into result, state, persistence, trace, or model-facing context. A scope field can still appear in a record only when the host separately approves it as returnable. If no default returned field is selected, UI-managed resources fall back to one safe returnable field instead of returning every allowed field by default.

Actor, tenant, signed-widget, access-token, and conversation scopes come only from a transient `RuntimeAuthorityContext` attested from authenticated request and host objects. Public request fields, model-generated workflow variables, `variables_json`, and persisted workflow state cannot supply or override those identities. Tenant-aware hosts must attach their resolved tenant as a trusted request attribute as documented in [App data tools](DATA_RESOURCES.md), or issue a signed widget context through their authenticated endpoint. Missing required authority fails closed. App data tool result serialization also returns only the resolved select allow-list and never includes implicit Eloquent `$appends`.

Personal app data tools and Workflow data steps (ADR 0057) return the typed `sign_in_required` outcome without trusted identity, after the signed context expired, or after the Agent's context token version was rotated: no query, no confirmation card, no new write. Identity never comes from a name, email address, order number or model output. Host model policies and the optional execution-time recheck evaluate the customer resolved through `Contracts\HostActorResolver` from the attested actor type and ID only. The attested type must be allowed in `context.host_actors.types`; no class is instantiated from browser, model or queued data, and a queued admission carries identity only as snapshot claims. Policies run as `Gate::forUser($customer)` and never read an auth guard, so a queue worker evaluates the right customer and the next job cannot inherit it. There is no fallback to an access token owner, an operator, a panel administrator or the ambient guard. A disabled account, lost tenant membership or host refusal (`host_actor_denied`) and an unsupported setup (`host_actor_unsupported`) are denials. When `context.host_actors.types` lists any type, every other attested type is refused for personal tools (`host_actor_unsupported`). A queued same-origin turn rechecks its guard user through the configured user provider of that guard; a deleted or soft-deleted user refuses the turn. Delayed continuations, API connection completions and approved Human Reviews are refused when the stored identity was rotated or the host no longer allows it; after mere expiry they resume, but their personal steps refuse. Identity refusal blocks only a new dispatch: an exactly bound earlier ledger outcome is recovered first, so a completed write is never reported as failed and an unknown one is never dispatched again. Pending confirmations stay bound to the identity, values and Agent version they were proposed with; another identity or a revoked account closes them, an expired or rotated context leaves them pending until the same customer signs in again, and nothing ever transfers them. User models are attested by class and key only, so names and email addresses do not enter tokens, queued admissions or continuation tokens.

Chroma retrieval never returns below-threshold chunks through a compatibility bypass. Retrieval candidates also have to match the active index version; vector evidence additionally has to match the stamped embedding provider, model, and dimensions.

## Administration Abilities

Panel membership is necessary but not sufficient for Agentic Chatbot
administration (ADR 0053). `authorization.mode`
(`AGENTIC_CHATBOT_AUTHORIZATION_MODE`) selects one of two models:

- `abilities`, the default for new installations: the host grants five
  abilities. `filament-agentic-chatbot.operate` covers the Inbox (handoffs and
  action approvals), conversations, submissions, Workflow runs and operational
  metrics. `filament-agentic-chatbot.configure` covers Agent, knowledge,
  Workflow and tool drafts, tests and the playground.
  `filament-agentic-chatbot.publish` covers publication, version restore,
  pausing and resuming and dependent publication.
  `filament-agentic-chatbot.admin` covers credentials, global settings (model
  prices, the app default Agent), access tokens, website access
  and write policy, connection destinations, MCP tool access review and
  publication overrides, reconciliation of unverified writes, diagnostic
  payloads, conversation deletion, adding approved handoff email recipients
  (`agents.handoff_email_recipients`) and webhook secrets and retries.
  `filament-agentic-chatbot.view` opens the Agent, knowledge, Workflow, tool,
  Inbox, conversation, run, usage and Health pages read-only: no saving,
  testing, publishing, credentials, diagnostics, access tokens, webhooks or
  global settings (ADR 0060). Admin implies the other four for the same
  record; no other ability implies another one.
- `strict`: the per-surface view and manage Gates described below. Upgraded
  installations keep it until they switch deliberately.

Every package administration path names an action of the tested
action-to-ability map (`Support\Authorization\AdminActionMap`): Filament
resources, pages and actions, Livewire endpoints, service entry points and
reads of sensitive fields. One central boundary
(`Support\Authorization\AdminAuthorizer`) decides them. It first requires
access to the hosting panel (Filament's own rule: `FilamentUser::canAccessPanel`,
or the local environment for users that do not implement `FilamentUser`), then
a grant, then the host record scope. Configure alone cannot publish, change
availability, website access, credentials or write policy, approve MCP tool
access or override a publication test. Turning off visitor confirmation for a
write or allowing updates of any record needs admin; keeping or tightening
them is a draft edit. Operate alone cannot edit Agents, knowledge, tools or
connections and cannot finalize unverified writes. Hidden controls are also
refused when called directly. Publishing from an editor saves the draft first
and therefore needs configure as well; a publisher without configure publishes
the saved draft from the read-only Agent view, restores versions and pauses or
resumes the Agent.

Grants are deliberate host code. `FilamentAgenticChatbotPlugin::make()->authorizeUsing()`
receives `(Authenticatable $user, string $ability, ?Model $record)` and grants
only by returning `true`; `false`, `null` or an exception deny. With a callback
on the panel, Gates of the same names are not consulted, so a denial is final.
Without a callback, a Gate defined with the ability name grants; a
`Gate::before()` rule alone never turns an undeclared ability on. A grant
never widens panel access, the host SQL scope, record ownership or the
Capability Execution Gateway, and administration abilities add no customer
authority: chat runtime identity still comes only from the host's
authenticated user or signed customer context. Configuration cannot grant
anything: an unsupported `authorization.mode` denies every administration path,
and local, testing and staging environments receive no grant.

A callback that declares the `$record` parameter is record-aware, like a
record-aware Gate: lists then need the `AdminAuthorizationQueryScope` binding
described below and stay empty without it. Panel users without any grant see
an **Access** page that names the five abilities and nothing else: no users,
configuration values, records or secrets. Doctor reports the mode, a missing
grant and a record-aware grant without a query scope.

Global settings (the Settings page, its signing-key rotation and model prices)
act on the whole installation, so they are authorized with a `null` record. A
record-aware callback usually returns `true` for `null`, because `null` also
means "class-level check", which would hand every tenant administrator the
installation's provider keys. Global settings therefore stay denied whenever
the grant is record-aware (a callback that declares `$record`, or a
record-aware ability Gate), and the Settings actions never take a record.
Grant them with a callback or Gate that does not take a record. In the
`strict` mode the Settings page needs the class-wide Gate
`filament-agentic-chatbot.manage-settings`; a record-aware version of that
Gate is refused as well.

The Health page and the heartbeat banner follow the same split. Any of operate,
configure or publish (`setup.view`; in `strict` mode the Agents view Gate) sees
the required group with titles, status and a one-line fix, and the heartbeat
message. Details (connection and queue names, tables, Agent IDs, configuration
keys), shell commands, the other groups and the measured heartbeat facts are
installation-wide diagnostics and need `setup.diagnostics`: admin without a
record-aware grant (`strict`: the `filament-agentic-chatbot.manage-settings`
Gate). Groups a user may not see are not evaluated. A check that throws is shown
as a failure without its exception message.

An installation without an explicit mode is treated as upgraded, and keeps
`strict`, when its published `config/filament-agentic-chatbot.php` has no
top-level `authorization` key, when any per-surface environment variable
(`AGENTIC_CHATBOT_*_AUTHORIZATION_REQUIRE_GATES`, `*_AUTHORIZATION_ENABLED`,
`*_VIEW_ABILITY`, `*_MANAGE_ABILITY`) is set, or when a per-surface Gate is
registered. `filament-agentic-chatbot:authorization-preview` lists, read-only,
which users gain or lose which actions under the other mode before a host sets
the mode explicitly. CLI commands that change state are trusted shell paths:
they do not consult panel abilities and record an accountable `--operator` or
`--actor` identity.

## Settings Page Secrets

Provider API keys, base URLs and the website signing key stored on the
Settings page live in `agentic_settings`, encrypted with Laravel's encrypter
(`APP_KEY`). The page never fills a stored key into a form or the Livewire
state; it shows where a key comes from and at most its last four characters.
The connection test sends a key only to the provider's official host or to the
base URL already saved for that provider, through the outbound destination guard
(no private networks, numeric IP aliases or redirects; a saved Ollama or
OpenAI-compatible address may be private). An unsaved base URL never receives a
stored key. It stores only the time, the result category and a keyed fingerprint
of the tested endpoint and key, never a key or a provider message. The provider's error text is never read or shown; the
notification names a generic reason and the HTTP status. The query string of a
saved base URL stays on the server and is not copied into the Livewire form state.
Base URLs are shown without user info or query string, and a base URL with
user info is refused. Values are hidden from model serialization and not
written to logs. A value that no longer decrypts (for example after an
`APP_KEY` change) counts as unset, so the `.env` key applies; the logged
warning names only the model and attribute, never the value. Each change
records the acting panel user.

A key stored on the page never overrides an Agent-specific key, so a tenant's
own Agent key stays that tenant's credential; Agents without their own key use
the app-wide key exactly as they used the `.env` key before. Ingestion of
shared Sources always uses the app-wide embedding key; no Agent's key or
budget pays for another tenant's Source.

## Record-Scoped Filament Gates

The record scope below applies to record-aware Gates in the `strict` mode and
to record-aware ability grants in the `abilities` mode.

An admin Gate that accepts only the authenticated user is class-wide and can be applied without changing the Resource query. A record-aware Gate must accept both the model class used for class-level navigation/create checks and the concrete model instance used for direct routes, for example `fn (User $user, Bot|string $subject): bool => ...`.

If a configured view or manage Gate is record-aware, bind `Contracts\AdminAuthorizationQueryScope` to the host's SQL-level equivalent. Its `apply()` method receives the current Eloquent builder, the authorization config path that identifies the surface, and either `view` or `manage`. Add the attested tenant/ownership condition and return that same builder instance. In `view` mode the condition must admit the union of records allowed by the configured manage and view Gates; in `manage` mode it must admit only manageable records. One host implementation can switch on the config path and mode while remaining safe with Laravel's configuration cache.

The SQL scope and the record Gate are one authorization contract: the scope prevents list, filter, option, and aggregate disclosure, while the Gate still authorizes direct record routes and mutations. A record-aware Gate without this binding makes the affected list or assignment selector empty. A scope that throws or returns a different builder also fails closed. The package does not scan every conversation, usage event, or other admin row and invoke a Gate in PHP; large installations must use database/global tenant scopes rather than an unbounded per-record authorization pass.

Agent Analytics uses the same Resource SQL scopes for conversation, message,
Knowledge, usage, token and outcome reads. Class denial produces unavailable
states; an authorized empty scope can legitimately contain zero records.
Related drill-down links additionally recheck the record Gate. Whole-Agent
usage totals and budget assessments are unavailable under restricted usage
access; visible receipt subsets cannot establish a complete monthly total.
Token tables do not execute the Resource's usage projection callbacks when
usage access is restricted. Cached Knowledge-gap totals, timing and excerpts
combine conversations, so their widgets are unavailable with denied or
record-scoped conversation access. These are admin reporting boundaries;
runtime accounting and budget enforcement retain their original authority.

## Handoff Desk Authorization And Privacy

The Inbox needs `filament-agentic-chatbot.operate` in the abilities mode. In
the strict mode, register the configured
`filament-agentic-chatbot.view-bot-handoff-requests` and
`filament-agentic-chatbot.manage-bot-handoff-requests` Gates. Record-aware
policies must also use `AdminAuthorizationQueryScope`, so queue rows, filters,
counts, direct routes, and mutations enforce the same tenant/team boundary.

All desk mutations are server-authorized, row-locked, version-checked, and
idempotent. Direct Eloquent changes to protected handoff state are rejected.
Internal notes and activity content use the package encrypted-string cast;
the append-only activity row retains actor and transition evidence. External
channel replies are committed only when the conversation has a verified channel
thread, and their delivery job is dispatched after the database commit.

The public widget receives only the minimal active/status/waiting/update/poll
projection. It never receives assignee identity, internal notes, customer
contact fields, SLA timestamps, or activity metadata. An active handoff blocks
conversation-history deletion; completed handoff activity may remain under the
host's declared support/audit retention policy.

## Outbound Webhook Authorization And Privacy

Outbound endpoints are scoped to one Agent. They need
`filament-agentic-chatbot.admin` in the abilities mode and the outbound webhook
view and manage Gates in the strict mode; record-aware policies also require
the SQL-level
`AdminAuthorizationQueryScope`. Signing secrets and retained event payloads are
encrypted at rest and hidden from normal model serialization. Changing a URL or
secret deactivates its endpoint and invalidates the previous signed test.

Delivery validates and pins public DNS answers immediately before the HTTPS
request, disables proxies and redirects, and rejects private, reserved,
localhost, metadata, fragment, credential-bearing, and unresolved targets. It
stores only request/response hashes and bounded error classifications, never the
response body. Versioned payload allowlists omit conversation text, customer
contact data, handoff reason/summary, internal notes, operator identity,
evidence references, credentials, and database IDs. Manual dead-letter retries
require an identifiable authorized operator and an encrypted reason audit.

Payload content is off by default. An admin may opt an endpoint into the fields
of new submissions and the last 5, 10 or 20 messages of the event's
conversation. The opt-in is part of the verified contract: changing it pauses
the endpoint until a new signed test passes. Opted-in content is captured with
the event, stored encrypted, and redacted before it is stored: credential-like
field names, schema fields marked `sensitive`, bearer and basic credentials
and runtime secrets are removed; email, phone and link types that the Agent's
live Safety settings mask or block are masked (all three when those settings
cannot be read). Each delivery sends only the content its endpoint opted into,
within `outbound_webhooks.max_payload_bytes`. Deleting a conversation's
history also removes its messages and feedback comment from stored events, so
pending deliveries and retries no longer send them. Admin playground, Agent
test and editor test records never produce events.

## Read API

The read API (`docs/READ_API.md`) returns submissions, conversations and
handoffs by the public ids used in webhook payloads. It accepts only Agent
access tokens (HMAC-hashed at rest) that grant `submissions:read`,
`conversations:read` or `handoffs:read` by name; `*` grants none of them, and
a read-only token cannot chat. A token reads only its own Agent's records and,
when it has allowed areas, only conversations in those areas. Records of other
Agents, other areas and admin tests answer `404`. Revoked, inactive and expired
tokens answer `401`; each token has a per-minute limit and invalid tokens are
limited per IP. Responses never contain internal numeric ids, secrets or tool
arguments, and text passes the same redaction as webhook content. Cursors are
encrypted and bound to the token's Agent.

## Strict Mode Per-Surface Gates

In the `strict` mode every administration surface has a view and a manage
Gate under `filament-agentic-chatbot.<surface>.authorization`, for example:

```php
Gate::define('filament-agentic-chatbot.view-data-resources', fn ($user) => $user->canReviewDataResources());
Gate::define('filament-agentic-chatbot.manage-data-resources', fn ($user) => $user->canManageDataResources());
Gate::define('filament-agentic-chatbot.reconcile-side-effects', fn ($user, $execution) => $user->canReconcile($execution));
Gate::define('filament-agentic-chatbot.view-bot-access-tokens', fn ($user) => $user->canReviewIntegrations());
Gate::define('filament-agentic-chatbot.manage-bot-access-tokens', fn ($user) => $user->canManageIntegrations());
```

The view Gate controls navigation and reads, an allowed manage Gate also
grants reads, and the manage Gate controls create, edit, delete, sync, rotate,
revoke and the surface's actions. `require_gates` defaults to `true` in every
environment since 1.0: a surface whose Gate is not registered is denied, also
locally. Setting `AGENTIC_CHATBOT_<SURFACE>_AUTHORIZATION_REQUIRE_GATES=false`
or `..._AUTHORIZATION_ENABLED=false` deliberately opens a surface to every
panel user without a Gate; Doctor reports it as unsafe and fails in
production. Doctor also fails in production when strict mode names a Gate that
the host has not registered. Reconciliation of unknown writes requires explicit
audit evidence and a no-retry acknowledgement in every environment and mode.

## Hard Budget Guard

Before an AI transport starts, the plugin creates a short-lived `AiUsageCall` reservation for a concrete provider/model/profile/stage call plan. Model-profile token estimators size reservations; the atomic `AiBudgetPeriod` row is the authority that prevents parallel requests from overspending the same remaining monthly limit.

Conversational preflight includes instructions, retained history, current
input, tool schemas, and a conservative local-attachment bound. It prunes only
oldest history, enforces the smaller configured/provider output maximum on the
actual request, and rejects attachments whose content size cannot be bounded.
Tool-enabled agents reserve the verified worst-case envelope for all permitted
model steps; unknown context windows fail closed instead of weakening a hard
monthly budget.

Successful provider responses settle disjoint input, output, reasoning,
cache-read, and cache-write tokens from provider usage and pin the pricing
version effective when the call started. Provider failures, missing usage, and
settlement failures become `reconciliation_required`. Queued retries and the
scheduled `filament-agentic-chatbot:reconcile-ai-usage` sweep make unresolved
calls observable. Expiry without a complete receipt changes the call to
`awaiting_evidence` and retains its reservation; unknown spend is not released
as available budget. A later complete receipt can settle the original call
without fabricating actual usage. Reports label groups containing unpriced calls as
incomplete and may show an explicitly labelled known subtotal, never a free or
complete aggregate.

Costs and hard limits use integer micro-minor-units throughout. Cost budgets require an effective, versioned, exact canonical `provider:model` pricing entry under `filament-agentic-chatbot.usage.pricing`; provider-wide or model-wide fallbacks are ignored, and missing pricing fails closed with `ai_cost_budget_pricing_missing`.

The internal catalog includes effective-dated Google Gemini standard-paid text rates for the release-verified 3.7 Flash, 3.6 Flash, and 3.5 Flash Lite models. Through December 31, 2026, Gemini 3.7/3.6 Flash are `$0.75` per million uncached input tokens, `$0.075` per million cached input tokens, and `$3.75` per million output tokens including thinking; the catalog automatically switches to the published January 1, 2027 rates at that boundary. Gemini 3.5 Flash Lite is `$0.30`, `$0.03`, and `$2.50` for the same buckets. Google resource-name aliases are normalized before lookup. Explicit cache storage is not converted into a per-call token price; when Google reports a cache-write bucket, the known token receipt settles without a guessed cost and later calls in the affected hard cost-budget scope fail closed until the unpriced ledger entry is operationally resolved. See the [official Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing).

Host-provided action contracts include a hash of the directly reflected handler
source. A code change invalidates existing deployment pins and requires
deliberate republication; unreadable or non-reflectable implementations cannot
be published. Indirect dependency behavior remains the host's responsibility
and should be represented by an explicit action version when it changes.

## Hardening Recommendations

- Use HTTPS only in production
- Place strict WAF or rate limits at edge
- Set retention schedule for old conversations
- Monitor AI provider quota and abuse spikes

## Optional host read policies

App data tools can add **Check host policies for reads** to their required
visitor and tenant scopes. Direct and Workflow reads resolve the customer only
through the ADR 0057 host actor resolver and evaluate the current Laravel policy
with `Gate::forUser($actor)`. No panel or administrator identity is substituted.
Missing identity, revoked accounts, unsupported actor types and foreign tenant
membership fail closed. The required host execution ability remains responsible
for current account status and tenant membership.

The published contract pins the option, host policy class, source fingerprint
and read abilities. Missing policies refuse saving of an active tool,
publication and execution; an administrator can still deactivate such a tool.
The fingerprint covers the policy class file, its parent classes and traits
outside the host's `vendor/` directory (package code is pinned by version), and
the abilities. A change there requires review and republication. It does not
cover `Gate::before` or `Gate::after` callbacks, services the policy calls, or
vendor code. The fingerprint triggers review and is not a security boundary:
current policy decisions and revocation apply on every read, with or without a
matching fingerprint. Package implementation versions (ADR 0058) do not
substitute for this host fingerprint.

Every returned record passes `view`, and collection reads also require
`viewAny`. Bounded candidate scans never return raw counts or candidate offsets.
Incomplete lists say so; exact counts and aggregates fail with
`policy_count_unavailable` beyond the bound, and so does `first` when no
candidate within the bound is authorized. Related-record labels are always
suppressed when the option is on; no policy pin exists for related models. Policy exception
text cannot enter results or logs. See [the read contract](DATA_RESOURCES.md#optional-host-policy-checks-for-reads)
for the candidate limit, cursor and export restrictions.

Residual risk: `policy_filtered_incomplete` and `policy_count_unavailable` show
that the scoped candidate set, rows the policy denied included, is larger than
the limit. A visitor can use filters to test a condition on denied rows inside
the same visitor or tenant scope, learning one bit per query. Keep the scope
filters narrow and the policy free of information that must stay hidden from
that scope.
