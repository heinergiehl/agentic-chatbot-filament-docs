# Security and Privacy Notes

## Data Collected

- Conversation messages (`user`, `assistant`)
- Retrieval source metadata attached to assistant messages
- Session identifier and a one-way hash of the separate conversation credential used for conversation continuity

## Recommended Privacy Policy Clauses

- What user text is stored and for how long
- Which AI providers process prompts
- How users can request export or deletion of chat history
- How to contact support for privacy requests

## Controls in This Plugin

- Per-bot domain allowlist checks
- Optional signed embed tokens (`AGENTIC_CHATBOT_WIDGET_SIGNING_ENABLED=true`)
- Header-first widget token transport with query/body compatibility flags
- Server-issued anonymous conversation credentials; a session ID alone cannot authorize history, export, feedback, form drafts, turn polling, or deletion in production
- Request throttling by bot/session/IP
- Friendly provider errors without stacktrace leaks in widget output
- URL ingestion safety checks (blocks localhost/private networks by default, revalidates redirects, enforces size and content-type limits)
- Workflow HTTP Request and API Connector safety checks for localhost/private-network targets by default
- Workflow trace capture controls with key-based redaction for sensitive values
- Production doctor warnings for unsafe widget transport, empty domain allowlists, workflow routing conflicts, trace capture posture, and credential decrypt failures
- Assistant-message feedback capture for analytics and quality review
- Gate-aware Bot Access Token admin authorization with optional strict Gate mode
- Gate-aware Data Resource admin authorization that defaults to strict Gate mode in production
- Gate-protected unknown-write reconciliation that defaults to strict Gate mode in production
- Hard monthly token/cost budget checks with in-flight request reservations
- Bot-scoped built-in internal data resources and hidden runtime safety scopes for `query_data_resource`

## Public Runtime Deprecations

The `0.x` line keeps compatibility defaults, but production hosts should opt into the stricter posture now:

```env
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_QUERY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_BODY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_ALLOW_ALL_DOMAINS=false
AGENTIC_CHATBOT_WIDGET_CONVERSATION_CREDENTIAL_REQUIRED=true
```

Browser snippets contain no token. The loader obtains short-lived, exact-origin-bound access from `POST /api/filament-agentic-chatbot/chat/{botPublicId}/bootstrap`, keeps it in memory, and sends it through `X-filament-agentic-chatbot-Token`. Configure explicit per-bot production domain allowlists and run `php artisan filament-agentic-chatbot:doctor` before launch; production bootstrap rejects an empty allowlist. Anonymous conversation credentials are always enforced in production even if a stale published config omits or relaxes the setting.

## Compliance Endpoints

- `GET /api/filament-agentic-chatbot/chat/{botPublicId}/history/export?session_id=...`
- `DELETE /api/filament-agentic-chatbot/chat/{botPublicId}/history` with JSON body `{ "session_id": "..." }`

The shipped browser widget supplies the corresponding `X-Filament-Agentic-Chatbot-Conversation-Credential` header automatically. A custom anonymous browser client must first bootstrap widget access, then create or resume its conversation through `POST /api/filament-agentic-chatbot/chat/{botPublicId}/session`, and keep both credentials out of URLs and logs.

Both API and Filament use one `ConversationPrivacyLifecycleService`. Deletion is serialized on the conversation row and fails closed while a chat turn, workflow, AgentGraph run/subrun, interaction, delayed delivery, external effect, action review, AI usage reservation, or channel delivery is active or requires reconciliation. The success response distinguishes deleted live history from retained operational/accounting/audit records and never returns their payloads. Treat this endpoint as scoped session-history deletion, not as proof that backups, logs, long-term actor memory, business submissions, or every data-subject record have been erased.

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

Knowledge search failures return a generic user-facing error. Internal logs and retrieval diagnostics include the bot ID/public ID where appropriate, exception class, and a SHA-256 query fingerprint, but not the raw query, provider secrets, credential values, or exception messages. Retrieval-query workflow values are redacted from terminal run variables and trace payloads.

The built-in `bots` data resource is scoped to the current bot by default. Only override that resource in the host app when you intentionally want a global bot catalog exposed to workflow data queries.

Data Resource safety scope filters are always applied at runtime and do not have to be exposed as normal workflow filters. Use them for ownership boundaries such as bot, tenant, team, or customer IDs. Query results do not expose scope enforcement metadata; the concrete applied-scope map is not duplicated into result, state, persistence, trace, or model-facing context. A scope field can still appear in a record only when the host separately approves it as returnable. If no default returned field is selected, UI-managed resources fall back to one safe returnable field instead of returning every allowed field by default.

Actor, tenant, access-token, and conversation scopes come only from a transient `RuntimeAuthorityContext` attested from authenticated request and host objects. Public request fields, model-generated workflow variables, `variables_json`, and persisted workflow state cannot supply or override those identities. Tenant-aware hosts must attach their resolved tenant as a trusted request attribute as documented in [Data Resources](DATA_RESOURCES.md). Missing required authority fails closed. Data Resource result serialization also returns only the resolved select allow-list and never includes implicit Eloquent `$appends`.

Chroma retrieval never returns below-threshold chunks through a compatibility bypass. Retrieval candidates also have to match the active index version; vector evidence additionally has to match the stamped embedding provider, model, and dimensions.

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

Doctor fails a production posture that disables or relaxes this authorization without a registered Gate, and warns when strict mode is safe but the configured Gate has not yet been registered.

## Side-Effect Reconciliation Admin Authorization

The Filament action for resolving unknown external write outcomes also defaults to strict Gate mode in production. Register `filament-agentic-chatbot.reconcile-side-effects` for the exact `BotSideEffectExecution` rows an operator may reconcile, and keep:

```env
AGENTIC_CHATBOT_SIDE_EFFECT_RECONCILIATION_AUTHORIZATION_REQUIRE_GATES=true
```

Local and testing environments retain the authenticated-operator default for low-friction development. Reconciliation still requires explicit audit evidence and no-retry acknowledgement in every environment.

## Bot Access Token Admin Authorization

Authenticated Filament panel users can manage Bot Access Tokens by default so new installs are immediately usable. Define Laravel Gates when the host app needs role separation:

```php
Gate::define('filament-agentic-chatbot.view-bot-access-tokens', fn ($user) => $user->canReviewIntegrations());
Gate::define('filament-agentic-chatbot.manage-bot-access-tokens', fn ($user) => $user->canManageIntegrations());
```

Once either Bot Access Token Gate is defined, token administration becomes explicitly gated. The view Gate controls navigation/read access, an allowed manage Gate also grants read access, and the manage Gate controls create/edit/rotate/revoke/delete actions. You can override the ability names under `filament-agentic-chatbot.bot_access_tokens.authorization`.

For locked-down production panels that should hide the resource until Gates exist, set:

```env
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_AUTHORIZATION_REQUIRE_GATES=true
```

## Hard Budget Guard

Before an AI transport starts, the plugin creates a short-lived `AiUsageCall` reservation for a concrete provider/model/profile/stage call plan. Model-profile token estimators size reservations; the atomic `AiBudgetPeriod` row is the authority that prevents parallel requests from overspending the same remaining monthly limit.

Successful provider responses settle input, output, reasoning, and cache tokens from provider usage and pin the pricing version effective when the call started. Provider failures, missing usage, and settlement failures become `reconciliation_required`. Queued retries and the scheduled `filament-agentic-chatbot:reconcile-ai-usage` sweep make unresolved calls observable; an expired unknown call is released exactly once without fabricating actual usage.

Costs and hard limits use integer micro-minor-units throughout. Cost budgets require an effective, versioned pricing entry under `filament-agentic-chatbot.usage.pricing`; missing pricing fails closed with `ai_cost_budget_pricing_missing`.

## Hardening Recommendations

- Use HTTPS only in production
- Place strict WAF or rate limits at edge
- Set retention schedule for old conversations
- Monitor AI provider quota and abuse spikes
