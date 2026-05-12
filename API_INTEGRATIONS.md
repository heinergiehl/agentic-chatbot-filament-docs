# API Integrations

Use Bot Access Tokens when a backend service, mobile app, scheduled job, Telegram bot, or another trusted server needs to call a configured chatbot without rendering the embeddable widget.

## Create A Bot Access Token

1. Open **Agentic Chatbot > Bot Access Tokens** in Filament.
2. Select the bot.
3. Give the token a clear name such as `Telegram production`.
4. Set **Allowed Areas** if the token should only work for specific context areas.
5. Keep only the abilities the integration needs. For chat integrations, `chat` is enough.
6. Add a per-token rate limit and monthly token/cost budgets for production integrations.
7. Store the generated token immediately. It is shown once.

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
  "area": "manager"
}
```

| Field | Required | Description |
| --- | --- | --- |
| `message` | Yes | User message passed to the bot or active workflow. |
| `session_id` | Yes | Stable conversation key controlled by the integration. Use one per external chat/user/thread. |
| `area` | No | Context area, for example `public`, `member`, `admin`, or a custom area such as `manager`. |

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
| `401` | `bot_access_token_inactive` | Token exists but is disabled. |
| `401` | `bot_access_token_expired` | Token is past `expires_at`. |
| `403` | `bot_access_token_forbidden` | Token is for another bot, area, or ability. |
| `422` | `area_not_allowed` | The bot itself does not allow the requested area. |
| `422` | `ai_input_token_limit_exceeded` | Prompt was blocked before the provider call. |
| `429` | `bot_access_token_rate_limited` | Token-specific per-minute throttle was exceeded. |
| `429` | `ai_bot_monthly_token_budget_exceeded` | Bot monthly token budget is exhausted. |
| `429` | `ai_access_token_monthly_token_budget_exceeded` | Access token monthly token budget is exhausted. |
| `429` | `ai_bot_monthly_cost_budget_exceeded` | Bot monthly cost budget is exhausted. |
| `429` | `ai_access_token_monthly_cost_budget_exceeded` | Access token monthly cost budget is exhausted. |

## Laravel HTTP Client Example

```php
use Illuminate\Support\Facades\Http;

$response = Http::withToken(config('services.incident_chatbot.token'))
    ->acceptJson()
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

Use **Agentic Chatbot > AI Usage** to inspect recorded usage events and the bot **Analytics** page to review per-bot token/cost trends.
