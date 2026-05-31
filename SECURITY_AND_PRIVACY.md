# Security and Privacy Notes

## Data Collected

- Conversation messages (`user`, `assistant`)
- Retrieval source metadata attached to assistant messages
- Session identifier used for conversation continuity

## Recommended Privacy Policy Clauses

- What user text is stored and for how long
- Which AI providers process prompts
- How users can request export or deletion of chat history
- How to contact support for privacy requests

## Controls in This Plugin

- Per-bot domain allowlist checks
- Optional signed embed tokens (`AGENTIC_CHATBOT_WIDGET_SIGNING_ENABLED=true`)
- Header-first widget token transport with query/body compatibility flags
- Request throttling by bot/session/IP
- Friendly provider errors without stacktrace leaks in widget output
- URL ingestion safety checks (blocks localhost/private networks by default, revalidates redirects, enforces size and content-type limits)
- Workflow HTTP Request and API Connector safety checks for localhost/private-network targets by default
- Workflow trace capture controls with key-based redaction for sensitive values
- Production doctor warnings for unsafe widget transport, empty domain allowlists, workflow routing conflicts, trace capture posture, and credential decrypt failures
- Assistant-message feedback capture for analytics and quality review
- Secure-default Bot Access Token admin authorization through explicit Laravel Gate abilities
- Hard monthly token/cost budget checks with in-flight request reservations
- Bot-scoped built-in internal data resources for `query_data_resource`

## Public Runtime Deprecations

The `0.x` line keeps compatibility defaults, but production hosts should opt into the stricter posture now:

```env
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_QUERY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_BODY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_ALLOW_ALL_DOMAINS=false
```

Use the `X-filament-agentic-chatbot-Token` header, configure per-bot domain allowlists, and run `php artisan filament-agentic-chatbot:doctor` before launch. Future releases may flip these defaults.

## Compliance Endpoints

- `GET /api/filament-agentic-chatbot/chat/{botPublicId}/history/export?session_id=...`
- `DELETE /api/filament-agentic-chatbot/chat/{botPublicId}/history` with JSON body `{ "session_id": "..." }`

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

Knowledge search failures return a generic user-facing error. Internal logs include the bot ID, public ID, exception class, and a short query preview, but not provider secrets or credential values.

The built-in `bots` data resource is scoped to the current bot by default. Only override that resource in the host app when you intentionally want a global bot catalog exposed to workflow data queries.

`AGENTIC_CHATBOT_CHROMA_ALLOW_THRESHOLD_BYPASS=false` keeps Chroma retrieval from returning below-threshold chunks. If you enable the bypass for compatibility, treat `threshold_bypassed=true` chunks as lower-confidence output and monitor the logs.

## Bot Access Token Admin Authorization

Bot Access Token administration is locked down by default. Define Laravel Gates for the Filament users that should read or manage tokens:

```php
Gate::define('filament-agentic-chatbot.view-bot-access-tokens', fn ($user) => $user->canReviewIntegrations());
Gate::define('filament-agentic-chatbot.manage-bot-access-tokens', fn ($user) => $user->canManageIntegrations());
```

Without these Gates, the token resource and mutation actions deny access. You can override the ability names under `filament-agentic-chatbot.bot_access_tokens.authorization`.

## Hard Budget Guard

Before an LLM prompt or stream starts, the plugin creates a short-lived budget reservation for estimated input tokens plus configured or default output tokens. Monthly budget checks include current usage events and active, unexpired reservations so parallel requests cannot all pass the same remaining budget window.

Successful provider responses settle the reservation and create one usage event. Synchronous provider-start failures release the reservation. Reservations expire automatically for budget calculations after `usage.reservation_ttl_seconds` so abandoned requests do not block budgets indefinitely.

Cost budgets require pricing entries under `filament-agentic-chatbot.usage.pricing`. If a bot or access token has a monthly cost budget but no pricing exists for the resolved provider/model, the request fails closed with `ai_cost_budget_pricing_missing`.

## Hardening Recommendations

- Use HTTPS only in production
- Place strict WAF or rate limits at edge
- Set retention schedule for old conversations
- Monitor AI provider quota and abuse spikes
