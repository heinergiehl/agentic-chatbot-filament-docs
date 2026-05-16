# Channel Integrations

Channels let the package receive and answer messages from external systems while keeping the bot, workflow, conversation, usage, and budget logic inside the Filament plugin.

The web widget remains the default web chat surface. Telegram and Slack are additional realtime entry points that call the same bot engine and store the same conversations.

## Architecture

Channel support is package-owned:

- `channel_connections` stores one provider connection per bot.
- `channel_threads` maps provider thread/user identifiers to package session IDs.
- `channel_delivery_events` records inbound/outbound delivery state and deduplicates provider events.
- `RichMessage` normalizes widget/workflow output into text, buttons, cards, sources, image URLs, and HTML.
- `ChannelMessageRenderer` implementations convert rich messages into channel-safe text-first replies, with optional provider-native Telegram or Slack payloads when explicitly enabled.
- `ChannelWorkflowCompatibilityService` inspects the active workflow against provider capabilities and reports adaptation, truncation, and dynamic-output limits in channel diagnostics.
- `ChannelDriver` implementations normalize provider payloads and send rendered replies.
- `ChannelActivityManager` starts and finishes provider-specific activity indicators before long-running workflow work, using native typing, placeholder messages, or a no-op fallback depending on the channel.
- `ProcessChannelInboundMessage` claims inbound events before running the bot/workflow, records the answer, and sends it back through the driver.
- `SendChannelOutboundMessage` retries provider rate-limited outbound sends without running the bot/workflow a second time.
- `BotAccessToken` remains the authoritative product-level governance layer for abilities, areas, budgets, and per-token rate limits.
- Channel webhooks use a separate ingress rate limiter to protect the queue before the bot runtime is reached.
- Outbound drivers split long replies into provider-safe message chunks instead of silently truncating workflow output.

The host app only supplies credentials, queue workers, and public webhook reachability. Do not create app-level controllers for these providers unless you are intentionally overriding the package drivers or renderers.

Renderer behavior defaults to text-first for external realtime channels. This keeps workflows channel-agnostic, avoids noisy button menus, and lets users continue with natural language. Workflow buttons are rendered as numbered text options unless native controls are explicitly enabled.

| Capability | Telegram | Slack |
| ---------- | -------- | ----- |
| Text | Native text message | Native message text |
| Buttons | Numbered text options by default; optional inline keyboard callback buttons | Numbered text options by default; optional Block Kit buttons |
| Images | Public `imageUrl` values are sent with `sendPhoto`; stored `imageArtifact` values are uploaded directly | Public `imageUrl` values are rendered as Block Kit image blocks; stored `imageArtifact` values are uploaded as Slack files |
| Cards | Text fallback with title/body/media links | Text fallback by default; optional Block Kit sections/images/buttons |
| Sources | Compact source list | Compact source list |
| Activity indicator | `sendChatAction` native typing | Configurable placeholder message before the normal final reply |
| Unsupported rich UI | Text fallback | Text fallback |

Text options keep the workflow semantics intact:

```text
Next steps:
1. Show sources
2. Check connector
3. Human handoff
Reply with the number, the label, or continue in your own words.
```

The inbound runtime maps `1`, `2`, or the typed label back to the original workflow button value before the workflow runs again.

Native controls are opt-in:

```env
RAG_CHANNELS_TELEGRAM_NATIVE_BUTTONS=true
RAG_CHANNELS_TELEGRAM_NATIVE_IMAGES=true
RAG_CHANNELS_SLACK_NATIVE_BUTTONS=true
RAG_CHANNELS_SLACK_NATIVE_BLOCKS=true
RAG_CHANNELS_SLACK_NATIVE_IMAGES=true
RAG_CHANNELS_SLACK_ACCEPT_THREAD_REPLIES_TO_BOT_MESSAGES=true
RAG_CHANNELS_ACTIVITY_ENABLED=true
RAG_CHANNELS_TELEGRAM_ACTIVITY_MODE=native_typing
RAG_CHANNELS_TELEGRAM_ACTIVITY_PULSE_INTERVAL_SECONDS=4
RAG_CHANNELS_TELEGRAM_ACTIVITY_PULSE_MAX_SECONDS=240
RAG_CHANNELS_SLACK_ACTIVITY_MODE=placeholder
RAG_CHANNELS_SLACK_ACTIVITY_PLACEHOLDER_TEXT="Working on it..."
RAG_CHANNELS_SLACK_ACTIVITY_PLACEHOLDER_TEXT_EN="Working on it..."
RAG_CHANNELS_SLACK_ACTIVITY_PLACEHOLDER_TEXT_DE="Bin dran..."
RAG_CHANNELS_SLACK_ACTIVITY_IMMEDIATE_RESPONSE=false
RAG_CHANNELS_SLACK_ACTIVITY_IMMEDIATE_RESPONSE_TYPE=ephemeral
RAG_CHANNELS_SLACK_ACTIVITY_UPDATE_FINAL_MESSAGE=true
RAG_CHANNELS_SLACK_ACTIVITY_EPHEMERAL_PLACEHOLDER=false
```

You can also set `"presentation_mode": "native"` on an individual channel connection. Keep `"presentation_mode": "text"` for the most predictable cross-channel behavior.

Image delivery supports two generic forms. Public `http` or `https` `imageUrl` values are sent natively when the provider can fetch the URL. Stored `imageArtifact` values (`disk`, `path`, `mime`, optional `public_url`) are read from Laravel storage and uploaded directly to Telegram or Slack, which is better for local tunnels, private disks, and cloud disks where the app can read the object. Workflows can send image URLs from a `sendMessage` image node, API connector output, formatted data-resource records, or the built-in provider-neutral `generate_image` action. `generate_image` stores returned image bytes on a configured Laravel disk by default; set the disk/path config to a cloud disk such as S3/R2 when production storage should live outside the app server. Cloud or local synchronous APIs can use `http_json`.

## Admin Setup

1. Open **Agentic Chatbot > Bot Access Tokens**.
2. Create one token per external channel, for example `Telegram Support`.
3. Set its channel to `Telegram` or `Slack`.
4. Scope areas, abilities, budgets, and rate limits for that channel.
5. Open **Agentic Chatbot > Channels**.
6. Create a channel connection for the bot and select the matching Bot Access Token.
7. Save, copy the generated webhook URL, and configure it in the provider dashboard.

The **Channels** table includes operational actions:

- **Diagnostics** checks bot/link/token readiness, active workflow channel compatibility, provider credentials, webhook URL shape, webhook verification, raw payload storage, queue mode, saved provider errors, and provider-specific state such as Telegram webhook info or Slack `auth.test`.
- **Test Send** sends a provider-native test message and records the outbound delivery event.
- **Set Telegram Webhook** configures Telegram with `message`, `edited_message`, and `callback_query` updates.
- **Set Telegram Commands** publishes `/start`, `/help`, `/status`, and `/reset` to Telegram clients.

Release checklist for customer environments:

1. Run a queue worker under a supervisor, not an interactive terminal.
2. Set a stable public HTTPS webhook base URL on each channel connection or through `RAG_CHANNELS_WEBHOOK_BASE_URL`.
3. Enable webhook verification in production and configure Telegram `webhook_secret` or Slack `signing_secret`.
4. Run **Diagnostics** after saving credentials and after every tunnel/domain change.
5. For Telegram, run **Set Telegram Webhook** after the public URL changes.
6. For Slack, reinstall the app after changing OAuth scopes such as `files:write`.
7. Send one real inbound message through each channel and confirm inbound and outbound delivery events are completed.
8. If workflows generate or forward images, keep `native_images` enabled and either provide a public `imageUrl` or a readable Laravel storage `imageArtifact`.

For local development on `localhost:8000`, expose the app with HTTPS:

```bash
ngrok http 8000
```

or:

```bash
cloudflared tunnel --url http://localhost:8000
```

## Workflow Variables

When a message arrives through a channel, workflows receive channel context:

| Variable | Description |
| -------- | ----------- |
| `channel` | `telegram` or `slack` |
| `channel_provider` | Provider key such as `telegram_bot` or `slack_app` |
| `channel_external_thread_id` | Provider chat or Slack workspace/channel/user/thread key |
| `channel_external_user_id` | Provider user identifier |
| `channel_external_user_label` | Display name or username |
| `channel_provider_message_id` | Provider message/update ID |
| `__channel` | Full channel context array |

Use these in conditions, prompts, HTTP actions, or submissions. Credentials and provider secrets are never exposed to workflow variables.

## Telegram

Provider: `Telegram Bot API`

Credentials JSON:

```json
{
  "bot_token": "123456:telegram-secret",
  "webhook_secret": "random-secret"
}
```

Configure the webhook with Telegram:

```bash
curl "https://api.telegram.org/bot<bot_token>/setWebhook" \
  -d "url=https://your-public-host.test/api/filament-agentic-chatbot/channels/<webhook-key>/webhook" \
  -d "secret_token=random-secret" \
  -d 'allowed_updates=["message","edited_message","callback_query"]'
```

The package verifies `X-Telegram-Bot-Api-Secret-Token` when `webhook_secret` is configured. Telegram renders workflow choices as numbered text options by default. If native buttons are enabled, `callback_query` is used for inline button clicks. Typed labels and numbered choices are normalized back to the workflow button value. Workflow `imageUrl` output is sent with `sendPhoto` by URL, and workflow `imageArtifact` output is sent with multipart `sendPhoto`; set `"native_images": false` on the channel connection to fall back to text links.

For local tunneling, set `RAG_CHANNELS_WEBHOOK_BASE_URL=https://your-ngrok-host.ngrok-free.app` or add `"webhook_base_url": "https://your-ngrok-host.ngrok-free.app"` to the channel connection settings before using the Filament webhook action.

Telegram callback clicks are acknowledged with `answerCallbackQuery` by default so the Telegram client does not keep showing a loading state. Set `"answer_callback_query": false` in channel settings to disable this.

Telegram replies send a `sendChatAction` activity indicator before workflow execution when possible. With an async queue connection, the runtime also schedules a heartbeat job that repeats `sendChatAction` every few seconds while the inbound event is still processing. Set `"activity_indicator_mode": "none"` on the channel connection or `RAG_CHANNELS_TELEGRAM_ACTIVITY_MODE=none` to disable it. The runtime also handles operational commands before the workflow is called:

| Command | Behavior |
| ------- | -------- |
| `/help` | Shows the channel command list |
| `/status` | Runs local channel diagnostics and returns the summary |
| `/reset` | Starts a fresh channel session for the thread without deleting historical conversations |

## Slack

Provider: `Slack App`

Credentials JSON:

```json
{
  "bot_token": "xoxb-...",
  "signing_secret": "slack-signing-secret",
  "bot_user_id": "optional-bot-user-id"
}
```

Slack setup:

1. Create a Slack app at <https://api.slack.com/apps>.
2. Add bot scopes for the surfaces you want to use:
   - `chat:write`
   - `files:write` when workflows should upload generated/stored images
   - `commands`
   - `app_mentions:read` when using app mentions
   - `im:history` when subscribing to direct-message events
3. Create a slash command such as `/agent`.
4. Set its Request URL to the generated package webhook URL.
5. Enable Interactivity and set the Request URL to the same package webhook URL.
6. Optionally enable Event Subscriptions with the same Request URL and subscribe to `app_mention` or direct-message events.
7. Install the app to your workspace and copy the Bot User OAuth Token into `bot_token`.

The package verifies `X-Slack-Signature` and `X-Slack-Request-Timestamp` using `signing_secret`. Slack URL verification is answered by the same webhook controller. Slash commands and interactive actions are acknowledged with an empty `200` response so Slack does not display transport JSON to users.

Runtime behavior:

- Slash command text is sent to the workflow. Empty `/agent` becomes `/start`.
- `/agent help`, `/agent status`, and `/agent reset` map to the built-in channel commands.
- Slack button values, typed labels, and numbered text choices are normalized back to workflow values.
- Slash-command conversations are scoped by workspace, channel, and user so multiple users can use the bot in the same channel without sharing session state.
- Event and button conversations in public/private channels are scoped by Slack `thread_ts`, so two active Slack threads in the same channel do not share workflow state. Direct messages remain user-scoped.
- Plain Slack `message` events in public/private channels are ignored by default, except replies inside a thread that started from one of the bot's own messages. Set `"accept_channel_messages": true` only when the app is intentionally allowed to answer broad channel messages.
- App mentions strip the bot mention before the text reaches the workflow.
- Replies are text-first by default. Public workflow `imageUrl` output is rendered as a Block Kit image block by default. Stored workflow `imageArtifact` output is uploaded through Slack files when native images are enabled, which avoids relying on Slack fetching a local tunnel URL. Set `RAG_CHANNELS_SLACK_NATIVE_BLOCKS=true` or `"presentation_mode": "native"` when you intentionally want Block Kit sections, cards, sources, and buttons for the full message.
- Set `"slack_response_mode": "ephemeral"` in channel settings to send private Slack replies with `chat.postEphemeral`; otherwise replies use `chat.postMessage`.
- Set `"use_threads": false` in channel settings if you do not want replies to continue in Slack threads when an inbound event has a thread timestamp.
- Slack does not expose a native bot typing indicator. Slack activity therefore uses a normal placeholder message by default and updates it in place with `chat.update` for text/block replies. When a reply cannot be updated in place, for example a file upload, the placeholder remains visible until the final reply is sent successfully and is deleted afterwards. This avoids leaving a private slash-command acknowledgement stuck in the channel UI. Set `"activity_immediate_response": true` or `RAG_CHANNELS_SLACK_ACTIVITY_IMMEDIATE_RESPONSE=true` only when you prefer an immediate ephemeral slash-command acknowledgement before the queue worker starts. Ephemeral activity placeholders are disabled by default because Slack does not provide a reliable delete/update path for them.
- Slack placeholder text is resolved from connection-level `activity_placeholder_texts.{locale}` first, then `activity_placeholder_text`, provider config, and finally `Working on it...`. Locale candidates come from connection settings such as `activity_locale` or `locale`, bot widget language, app config, and `en`.

Recommended local settings:

```json
{
  "webhook_base_url": "https://your-ngrok-host.ngrok-free.app",
  "accept_channel_messages": false,
  "accept_thread_replies_to_bot_messages": true,
  "slack_response_mode": "in_channel",
  "use_threads": true,
  "activity_indicator_mode": "placeholder",
  "activity_locale": "de",
  "activity_placeholder_text": "Working on it...",
  "activity_placeholder_texts": {
    "en": "Working on it...",
    "de": "Bin dran..."
  },
  "activity_immediate_response": false,
  "activity_immediate_response_type": "ephemeral",
  "activity_update_final_message": true,
  "activity_ephemeral_placeholder": false
}
```

## Queues

Inbound webhooks dispatch `ProcessChannelInboundMessage`. In production, run a queue worker so providers receive fast HTTP 200 responses:

```bash
php artisan queue:work
```

Optional queue overrides:

```env
RAG_CHANNELS_QUEUE_CONNECTION=redis
RAG_CHANNELS_QUEUE=channels
RAG_CHANNELS_PROCESSING_TIMEOUT_SECONDS=300
```

`RAG_CHANNELS_PROCESSING_TIMEOUT_SECONDS` controls when an inbound delivery event stuck in `processing` can be reclaimed by a retry. This protects against worker crashes without allowing fresh duplicate provider retries to double-run the same message.

Repeated Telegram typing indicators require a real async queue connection. When the channel queue resolves to Laravel's `sync` driver, the first `sendChatAction` is still sent, but no background heartbeat is scheduled.

If a provider returns a retry-after response while sending a channel reply, the inbound event is marked completed and the outbound delivery event stays in `processing`. The queued outbound retry sends the saved reply text again later, so the chat responder, RAG search, workflow execution, budgets, and usage accounting are not run twice for the same inbound message.

Ingress rate-limit overrides:

```env
RAG_CHANNELS_RATE_LIMITER=rag-channels
RAG_CHANNELS_MAX_WEBHOOK_REQUESTS_PER_MINUTE=120
RAG_CHANNELS_MAX_WEBHOOK_REQUESTS_PER_MINUTE_PER_IP=240
```

These ingress limits are only abuse protection for provider webhooks. Bot-level product limits should be configured on the channel's Bot Access Token.

Security defaults:

```env
RAG_CHANNELS_REQUIRE_WEBHOOK_VERIFICATION=true
RAG_CHANNELS_STORE_RAW_WEBHOOK_PAYLOADS=false
RAG_CHANNELS_ERROR_REPLY_MESSAGE="The bot could not process this message. Please try again later."
```

`RAG_CHANNELS_REQUIRE_WEBHOOK_VERIFICATION` defaults to `true` in production and `false` outside production. When enabled, Telegram requires `webhook_secret` and Slack requires `signing_secret`. Raw provider payload storage is disabled by default; enable it only for short-lived debugging. Stored and queued payloads are redacted for token, secret, signature, password, and API-key fields. `RAG_CHANNELS_ERROR_REPLY_MESSAGE` is used when the bot runtime returns an error payload without a user-safe message.

## Provider Notes

- Telegram is the best first local test because setup is simple and replies are plain text.
- Slack is the best B2B/backoffice channel after Telegram. Prefer slash commands and interactions over broad channel-history reads.
