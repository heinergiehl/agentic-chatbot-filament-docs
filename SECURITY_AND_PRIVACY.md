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
- Optional visitor-visible page context that is size-bounded, stripped of URL query/fragment/credentials, rejected for secret-like keys, encrypted at rest, and isolated from runtime authority and capability inputs
- Replay-stable widget lifecycle projections that expose only public turn state, declared business outcomes, opaque capability evidence, and the existing safe handoff state
- Server-issued anonymous conversation credentials; a session ID alone cannot authorize history, export, feedback, form drafts, turn polling, or deletion in production
- Request throttling by bot/session/IP
- Friendly provider errors without stacktrace leaks in widget output
- Bring-your-own-key provider configuration: the Composer package contains no maintainer-owned AI credential, while host and per-Agent keys remain installation-owned secrets
- URL ingestion safety checks (blocks localhost/private networks by default, revalidates redirects, enforces size and content-type limits)
- Workflow HTTP Request and API Connector safety checks for localhost/private-network targets by default
- Non-executing Integration Studio parsing that discards imported credentials, scripts, cookies, samples, file content, and remote references before AI or persistence
- Explicit Capability Bridge inspection that validates registered server-side contracts without reflecting or exposing arbitrary Filament actions
- Encrypted, draft-hash-bound synthetic Connector fixtures with a network-free canonical response replay path that cannot satisfy publication or live execution authority
- Workflow trace capture controls with key-based redaction for sensitive values
- Production doctor warnings for unsafe widget transport, empty domain allowlists, missing or invalid Agent deployments, Playbook trace posture, and credential decrypt failures
- Assistant-message feedback capture for analytics and quality review
- Durable knowledge-gap detection that requires committed runtime evidence and never classifies missing citations alone
- Gate-aware Agent Access Token admin authorization with optional strict Gate mode
- Gate-aware Data Resource admin authorization that defaults to strict Gate mode in production
- Gate-protected unknown-write reconciliation that defaults to strict Gate mode in production
- Hard monthly token/cost budget checks with in-flight request reservations
- Bot-scoped built-in internal data resources and hidden runtime safety scopes for `query_data_resource`
- Content-detected, hash-bound chat attachments on a non-public disk with scheduled retention cleanup
- Provider-authenticated Telegram, Slack, WhatsApp, Mailtrap, and Mailgun webhooks; bounded provider-host-only file downloads; and path-free durable email ingress staging
- Agent-bound outbound webhooks with public HTTPS/DNS pinning, no redirects, exact-body HMAC signatures, transactional outbox/idempotency evidence, encrypted payload storage, and PII-minimized outcome/handoff schemas
- Raw channel payload capture disabled by default; when explicitly enabled for debugging, secret-key values are redacted and strings, object breadth, nesting, and invalid UTF-8 are bounded before queue or database persistence
- Protected release credential scans over both release-eligible source files and every text file in the exact commercial ZIP; findings expose only SHA-256 fingerprints, and the release allowlist has no wildcard mechanism

Connector fixture inputs and bodies are encrypted and deliberately excluded
from replay evidence, logs, notifications, visitor output, and model context.
Only `Content-Type` and `Retry-After` response headers are accepted. Operators
must use synthetic data; fixtures are not a sanctioned store for captured
production payloads. Fixture rows are removed with their owning operation, and
an intentional contract change requires a new fixture instead of mutating old
evidence.

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

Personalized embeds may additionally send `X-Filament-Agentic-Chatbot-Context`. The host must issue it behind its own authenticated authorization boundary. It is signed but browser-readable, rejects secret-like fields and oversized payloads, and is bound to actor/tenant ownership before capability scopes are created. Its optional key falls back to the existing widget-signing key. See [Chat Widget](CHAT_WIDGET.md#signed-customer-and-tenant-context).

Visitor-visible `display_context` is a separate, deliberately untrusted input.
It may help the model discuss the page the visitor can already see, but it
cannot identify an actor or tenant, widen a scope, select a hidden record, or
authorize a capability. The server normalizes it independently of the SDK,
encrypts the accepted value on the durable Chat Turn, binds it to turn
idempotency, and appends it only inside an explicit untrusted-data prompt
boundary. The literal visitor message remains unchanged. Hosts must use the
signed customer-context contract for server-attested identity and authority.

The browser SDK's `outcome`, `capability`, and `handoff` events are derived from
a frozen committed projection. They omit exact capability keys, inputs,
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

External-channel files use the same content validation, published-model media
capability check, canonical turn hash, and final private chat storage. Telegram,
Slack, WhatsApp, and Mailtrap provider references are downloaded only over HTTPS
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

WhatsApp POST bodies are authenticated with the Meta App Secret and
`X-Hub-Signature-256`; its GET subscription challenge requires the independently
chosen Verify Token. Mailgun receiving-route and event payloads use the Webhook
Signing Key, timestamp, and token HMAC with a bounded clock window. Slack and
Telegram retain their signing-secret and webhook-secret checks. Mailtrap signs
the exact raw webhook body with HMAC-SHA256 and each connection stores separate
Inbound and Email Sending webhook secrets. These delivery
provider secrets are encrypted in channel credentials and never supplied to the
Agent or Playbooks.

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

Knowledge search failures return a generic user-facing error. Internal logs and retrieval diagnostics include the Agent ID/public ID where appropriate, exception class, and a SHA-256 query fingerprint, but not the raw query, provider secrets, credential values, or exception messages. Retrieval-query Playbook values are redacted from terminal run variables and trace payloads.

Scheduled knowledge-gap detection reads only terminal committed Chat Turns and requires the redacted `knowledge_searched` plus `safe_capability_fallback` evidence pair and an assistant message without sources. It stores a SHA-256 normalized-question fingerprint, an encrypted bounded question excerpt, and occurrence metadata limited to the Agent deployment hash and configured context area. Operator resolution and ignore notes are encrypted. Provider prompts, credentials, connector payloads, and complete model responses are not copied into the knowledge-gap ledger.

The built-in `bots` data resource is scoped to the current bot by default. Only override that resource in the host app when you intentionally want a global bot catalog exposed to workflow data queries.

Data Resource safety scope filters are always applied at runtime and do not have to be exposed as normal workflow filters. Use them for ownership boundaries such as bot, tenant, team, or customer IDs. Query results do not expose scope enforcement metadata; the concrete applied-scope map is not duplicated into result, state, persistence, trace, or model-facing context. A scope field can still appear in a record only when the host separately approves it as returnable. If no default returned field is selected, UI-managed resources fall back to one safe returnable field instead of returning every allowed field by default.

Actor, tenant, signed-widget, access-token, and conversation scopes come only from a transient `RuntimeAuthorityContext` attested from authenticated request and host objects. Public request fields, model-generated workflow variables, `variables_json`, and persisted workflow state cannot supply or override those identities. Tenant-aware hosts must attach their resolved tenant as a trusted request attribute as documented in [Data Resources](DATA_RESOURCES.md), or issue a signed widget context through their authenticated endpoint. Missing required authority fails closed. Data Resource result serialization also returns only the resolved select allow-list and never includes implicit Eloquent `$appends`.

Chroma retrieval never returns below-threshold chunks through a compatibility bypass. Retrieval candidates also have to match the active index version; vector evidence additionally has to match the stamped embedding provider, model, and dimensions.

## Record-Scoped Filament Gates

An admin Gate that accepts only the authenticated user is class-wide and can be applied without changing the Resource query. A record-aware Gate must accept both the model class used for class-level navigation/create checks and the concrete model instance used for direct routes, for example `fn (User $user, Bot|string $subject): bool => ...`.

If a configured view or manage Gate is record-aware, bind `Contracts\AdminAuthorizationQueryScope` to the host's SQL-level equivalent. Its `apply()` method receives the current Eloquent builder, the authorization config path that identifies the surface, and either `view` or `manage`. Add the attested tenant/ownership condition and return that same builder instance. In `view` mode the condition must admit the union of records allowed by the configured manage and view Gates; in `manage` mode it must admit only manageable records. One host implementation can switch on the config path and mode while remaining safe with Laravel's configuration cache.

The SQL scope and the record Gate are one authorization contract: the scope prevents list, filter, option, and aggregate disclosure, while the Gate still authorizes direct record routes and mutations. A record-aware Gate without this binding makes the affected list or assignment selector empty. A scope that throws or returns a different builder also fails closed. The package does not scan every conversation, usage event, or other admin row and invoke a Gate in PHP; large installations must use database/global tenant scopes rather than an unbounded per-record authorization pass.

## Handoff Desk Authorization And Privacy

Production should register the configured
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

Outbound endpoints are scoped to one Agent. Production defaults to strict view
and manage Gates; record-aware policies also require the SQL-level
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

## Data Resource Admin Authorization

Production requires explicit Data Resource Gates by default. Local and testing environments allow authenticated Filament panel users by default so initial setup remains convenient. Define these Gates before production launch:

```php
Gate::define('filament-agentic-chatbot.view-data-resources', fn ($user) => $user->canReviewDataResources());
Gate::define('filament-agentic-chatbot.manage-data-resources', fn ($user) => $user->canManageDataResources());
```

Once either Data Resource Gate is defined, administration becomes explicitly gated. The view Gate controls navigation/read access, an allowed manage Gate also grants read access, and the manage Gate controls create/edit/delete/sync actions. You can override the ability names under `filament-agentic-chatbot.data_resources.authorization`.

Strict mode defaults to `true` when `APP_ENV=production`. It can also be made explicit:

```env
AGENTIC_CHATBOT_DATA_RESOURCE_AUTHORIZATION_REQUIRE_GATES=true
```

Doctor fails in production when this authorization is disabled or relaxed without a registered Gate, and also when strict mode names a Gate that the host has not registered. Outside production, missing strict Gates remain warnings so setup can proceed without making a production-readiness claim.

## Side-Effect Reconciliation Admin Authorization

The Filament action for resolving unknown external write outcomes also defaults to strict Gate mode in production. Register `filament-agentic-chatbot.reconcile-side-effects` for the exact `BotSideEffectExecution` rows an operator may reconcile, and keep:

```env
AGENTIC_CHATBOT_SIDE_EFFECT_RECONCILIATION_AUTHORIZATION_REQUIRE_GATES=true
```

Local and testing environments retain the authenticated-operator default for low-friction development. Reconciliation still requires explicit audit evidence and no-retry acknowledgement in every environment.

## Agent Access Token Admin Authorization

Authenticated Filament panel users can manage Agent Access Tokens by default so new installs are immediately usable. Define Laravel Gates when the host app needs role separation:

```php
Gate::define('filament-agentic-chatbot.view-bot-access-tokens', fn ($user) => $user->canReviewIntegrations());
Gate::define('filament-agentic-chatbot.manage-bot-access-tokens', fn ($user) => $user->canManageIntegrations());
```

Once either Agent Access Token Gate is defined, token administration becomes explicitly gated. The view Gate controls navigation/read access, an allowed manage Gate also grants read access, and the manage Gate controls create/edit/rotate/revoke/delete actions. You can override the ability names under `filament-agentic-chatbot.bot_access_tokens.authorization`.

For locked-down production panels that should hide the resource until Gates exist, set:

```env
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_AUTHORIZATION_REQUIRE_GATES=true
```

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
calls observable; an expired unknown call is released exactly once without
fabricating actual usage. Reports label groups containing unpriced calls as
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
