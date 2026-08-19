# API Integrations

Use Bot Access Tokens when a trusted server-side API client, widget bridge, Telegram bot, or Slack app needs to call a configured chatbot.

Bot Access Tokens are server-side secrets. Do not embed them in browser JavaScript, public widgets, mobile apps, screenshots, logs, or customer-visible configuration. Browser widgets should use the signed widget token flow; server integrations should send Bot Access Tokens from a trusted backend via `Authorization: Bearer fac_...` or `X-filament-agentic-chatbot-Access-Token`.

## Create A Bot Access Token

1. Open **Agentic Chatbot > Connect > Bot Access Tokens** in Filament.
2. Select the bot.
3. Give the token a clear name such as `Telegram production`.
4. Set **Channel** to classify where the token is used, for example `API`, `Web Widget Bridge`, `Telegram`, or `Slack`.
5. Optionally set a channel label such as a Telegram bot name, Slack workspace, API client, or environment.
6. Set **Allowed Areas** if the token should only work for specific context areas.
7. Keep only the abilities the integration needs. For chat integrations, `chat` is enough.
8. Add a per-token rate limit and monthly token/cost budgets for production integrations.
9. Store the generated token immediately. It is shown once.

Bot Access Tokens are credentials for your Laravel chatbot API. They are not Telegram or Slack provider tokens. External platforms keep their own credentials in your app config or secret manager, and your webhook/controller uses the Bot Access Token only when it calls the chatbot endpoint.

`last_used_at` writes are throttled to reduce write pressure on busy integrations. Configure the window with `AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_LAST_USED_THROTTLE_MINUTES` (default `5`). Per-token rate limits remain enforced on every request. Invalid token attempts are separately throttled with `AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_INVALID_ATTEMPTS_PER_MINUTE` (default `10`).

The dedicated `X-filament-agentic-chatbot-Access-Token` header always takes precedence. `Authorization: Bearer ...` is accepted only for tokens using the `fac_` prefix by default, so host-app Sanctum, Passport, or API guard Bearer tokens are not misclassified as chatbot API credentials.

## Optional Ownership Metadata

If your host app wants to assign tokens to users, teams, tenants, customers, or departments, configure allowed owner model classes:

```php
// config/filament-agentic-chatbot.php
'bot_access_tokens' => [
    'owner_types' => [
        'user' => \App\Models\User::class,
        'team' => \App\Models\Team::class,
    ],
],
```

The package stores `owner_type` and `owner_id` only. It does not create a user system, tenant system, or authorization policy. Use this metadata for reporting, filtering, support, and cleanup workflows; keep real access control in your application.

Conversation history, export, deletion, and feedback requests enforce this runtime scope. A token can access only conversations explicitly bound to that exact token with the same bot, owner, and channel. Unbound or partially bound conversations are never authorizable through a Bot Access Token.

Bot Access Tokens use HMAC-SHA256 hash version 2 with your app key or `AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_HASH_KEY`. The G25 migration revokes older hash versions because their plaintext cannot be recovered; rotate them before deploying the breaking release.

## Complete Chat Endpoint

```http
POST /api/filament-agentic-chatbot/chat/{botPublicId}/complete
Authorization: Bearer fac_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Accept: application/json
Content-Type: application/json
```

### Request Body

```json
{
  "message": "What is the current incident status?",
  "session_id": "telegram-123456789",
  "client_turn_id": "telegram-update-987654321",
  "area": "manager"
}
```

| Field | Required | Description |
| --- | --- | --- |
| `message` | Yes | User message passed to the bot or active workflow. |
| `session_id` | Yes | Stable conversation key controlled by the integration. Use one per external chat/user/thread. |
| `client_turn_id` | Recommended | Stable ID for this one user turn. Reuse it only when retrying the identical request. Alternatively send the same value as an `Idempotency-Key` header. |
| `area` | No | Context area, for example `public`, `member`, `admin`, or a custom area such as `manager`. |

Every accepted response includes `X-Chat-Turn-Id`. The server generates an ID when the request omits one, but integrations should provide their own stable delivery/event ID so a timeout retry cannot run the same workflow or external action twice. Reusing an ID with different message, resolution, area, or transport returns `409 chat_turn_input_mismatch`. A completed, waiting, failed, or cancelled turn returns its stored response without re-running the model or workflow; `X-Chat-Turn-Replayed: true` identifies that path.

Only one executing turn is allowed per conversation. A duplicate request for the currently executing ID returns `202 chat_turn_in_progress` with `Retry-After`. A different ID sent while that turn is active returns `409 conversation_turn_in_progress`. If the server cannot prove whether an interrupted turn completed, it records `unknown` and returns `409 chat_turn_outcome_unknown` instead of risking duplicate side effects. An operator must verify the external outcome and use the audited reconciliation command documented in the Operations guide; clients must not work around the lock with another ID.

### Success Response

The endpoint returns the final assistant message in a stable JSON shape. If an active workflow handles the message, workflow metadata and structured button/card fields are included.

```json
{
  "conversation_id": 1,
  "message_id": 2,
  "session_id": "telegram-123456789",
  "area": "manager",
  "content": "**QA incident status**\n\nNo active escalation.",
  "content_html": "<p><strong>QA incident status</strong></p>\n<p>No active escalation.</p>",
  "content_format": "markdown",
  "message": {
    "message_type": "buttons",
    "buttons": [
      {
        "label": "Open incidents",
        "value": "Show open incidents"
      }
    ]
  },
  "workflow_run": {
    "id": 10,
    "status": "completed"
  }
}
```

### Common Error Responses

| HTTP | `error` | Meaning |
| --- | --- | --- |
| `401` | `bot_access_token_invalid` | Missing or invalid Bearer token. |
| `403` | `bot_access_token_inactive` | Token exists but is disabled. |
| `403` | `bot_access_token_expired` | Token is past `expires_at`. |
| `403` | `bot_access_token_revoked` | Token was revoked and cannot be reactivated. |
| `403` | `bot_access_token_forbidden` | Token is for another bot, area, or ability. |
| `422` | `area_not_allowed` | The bot itself does not allow the requested area. |
| `422` | `ai_input_token_limit_exceeded` | Prompt was blocked before the provider call. |
| `409` | `chat_turn_input_mismatch` | The supplied turn ID was already used for a different request. |
| `409` | `conversation_turn_in_progress` | Another turn currently owns this conversation. Retry after it finishes. |
| `409` | `chat_turn_outcome_unknown` | The previous outcome cannot be proven; the server refuses unsafe automatic re-execution. |
| `429` | `bot_access_token_rate_limited` | Token-specific throttle was exceeded, or too many invalid token attempts came from the same bot/IP. |
| `429` | `ai_bot_monthly_token_budget_exceeded` | Bot monthly token budget is exhausted. |
| `429` | `ai_access_token_monthly_token_budget_exceeded` | Access token monthly token budget is exhausted. |
| `429` | `ai_bot_monthly_cost_budget_exceeded` | Bot monthly cost budget is exhausted. |
| `429` | `ai_access_token_monthly_cost_budget_exceeded` | Access token monthly cost budget is exhausted. |
| `429` | `ai_cost_budget_pricing_missing` | A cost budget is configured but provider/model pricing is missing, so the request is blocked fail-closed. |

## Laravel HTTP Client Example

```php
use Illuminate\Support\Facades\Http;

$response = Http::withToken(config('services.incident_chatbot.token'))
    ->acceptJson()
    ->withHeader('Idempotency-Key', $externalEventId)
    ->post(config('services.incident_chatbot.url').'/api/filament-agentic-chatbot/chat/incident-manager/complete', [
        'message' => $message,
        'session_id' => 'ops-'.$operatorId,
        'area' => 'manager',
    ])
    ->throw()
    ->json();

$answer = (string) data_get($response, 'content', '');
```

## Telegram Webhook Example

This example receives a Telegram update, forwards the user text to the chatbot, then sends the chatbot answer back to Telegram.

```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TelegramIncidentBotController
{
    public function __invoke(Request $request): array
    {
        $chatId = (string) data_get($request->all(), 'message.chat.id');
        $text = trim((string) data_get($request->all(), 'message.text'));

        if ($chatId === '' || $text === '') {
            return ['ok' => true];
        }

        $chatbot = Http::withToken(config('services.incident_chatbot.token'))
            ->acceptJson()
            ->post(config('services.incident_chatbot.url').'/api/filament-agentic-chatbot/chat/incident-manager/complete', [
                'message' => $text,
                'session_id' => 'telegram-'.$chatId,
                'area' => 'manager',
            ])
            ->throw()
            ->json();

        Http::post('https://api.telegram.org/bot'.config('services.telegram.bot_token').'/sendMessage', [
            'chat_id' => $chatId,
            'text' => (string) data_get($chatbot, 'content', 'No answer returned.'),
            'parse_mode' => 'Markdown',
        ])->throw();

        return ['ok' => true];
    }
}
```

```php
// routes/web.php
use App\Http\Controllers\TelegramIncidentBotController;

Route::post('/telegram/incident-bot', TelegramIncidentBotController::class);
```

```php
// config/services.php
return [
    'telegram' => [
        'bot_token' => env('TELEGRAM_BOT_TOKEN'),
    ],

    'incident_chatbot' => [
        'url' => env('INCIDENT_CHATBOT_URL', config('app.url')),
        'token' => env('INCIDENT_CHATBOT_TOKEN'),
    ],
];
```

```env
TELEGRAM_BOT_TOKEN=123456:telegram-secret
INCIDENT_CHATBOT_URL=https://your-laravel-app.test
INCIDENT_CHATBOT_TOKEN=fac_generated_bot_access_token
```

## Operational Checks

After migrations and token setup, run:

```bash
php artisan filament-agentic-chatbot:qa-enterprise-smoke --host=your-app.test
```

Use **Agentic Chatbot > Observe > AI Usage** to inspect recorded usage events, filter by token channel or owner type, and review token/cost trends on the bot **Analytics** page.
