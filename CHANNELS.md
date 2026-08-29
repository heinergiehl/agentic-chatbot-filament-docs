# Channel Integrations

Channels let the package receive and answer messages from external systems while keeping Agent authority, optional Playbook execution, conversation, usage, and budget logic inside the Filament plugin.

The web widget remains the default web chat surface. Telegram is the currently supported external provider. Slack, WhatsApp Cloud API, and Mailgun Email are implemented but intentionally disabled until their separate real-provider acceptance is complete. Every enabled entry point calls the same Agent runtime, stores the same conversations, and reuses the Agent's configured AI provider credential; each channel connection stores only the credentials required by that delivery provider.

## Release Availability

| Surface | Current status | Default |
| --- | --- | --- |
| Web widget | Supported | Available |
| Telegram Bot API | Supported and real-provider tested | Available |
| Slack App | Staged for later real-provider acceptance | Disabled |
| WhatsApp Cloud API | Deferred because provider onboarding is not yet accepted | Disabled |
| Mailgun Email | Staged for later asynchronous-email acceptance | Disabled |

Disabled providers are absent from the Filament setup wizard. Existing records remain visible for deactivation or deletion, but their diagnostics, test-send, activation, inbound webhook, and outbound runtime paths fail closed. Enabling a staged provider is an explicit deployment decision:

```env
AGENTIC_CHATBOT_CHANNELS_SLACK_ENABLED=false
AGENTIC_CHATBOT_CHANNELS_WHATSAPP_ENABLED=false
AGENTIC_CHATBOT_CHANNELS_EMAIL_ENABLED=false
```

Set one of these values to `true` only in the environment where that provider is being acceptance-tested. An implementation or mocked contract test is not a live-provider certification.

## Architecture

Channel support is package-owned:

- `channel_connections` stores one provider connection per bot.
- `channel_threads` maps provider thread/user identifiers to package session IDs.
- `channel_delivery_events` records inbound/outbound delivery state and deduplicates provider events.
- `channel_inbound_attachments` durably stages multipart provider uploads on the configured private attachment disk before queue dispatch.
- `RichMessage` normalizes Agent and Playbook output into text, buttons, cards, sources, image URLs, and HTML.
- `ChannelMessageRenderer` implementations convert rich messages into channel-safe text-first replies, with optional provider-native Telegram or Slack payloads when explicitly enabled.
- `ChannelAgentCompatibilityService` verifies the active Agent deployment and all of its exact Playbook pins, then reports provider adaptation, truncation, and dynamic-output limits in channel diagnostics.
- `ChannelDriver` implementations normalize provider payloads and send rendered replies.
- Attachment-capable drivers resolve provider file references only through bounded, provider-allowlisted HTTPS downloads or durable private ingress records before the canonical chat turn begins.
- `ChannelActivityManager` starts and finishes provider-specific activity indicators before long-running Agent work, using native typing, placeholder messages, or a no-op fallback depending on the channel.
- `ProcessChannelInboundMessage` claims inbound events before running the Agent, records the answer, and sends it back through the driver.
- `SendChannelOutboundMessage` retries provider rate-limited outbound sends without running the Agent or Playbook a second time.
- `BotAccessToken` remains the authoritative product-level governance layer for abilities, areas, budgets, and per-token rate limits.
- Channel setup only lists active, unexpired Agent Access Tokens that allow the selected default area and the `chat` ability. Create one token per channel connection for clean reporting and runtime isolation.
- Channel webhooks use a separate ingress rate limiter to protect the queue before the bot runtime is reached.
- Outbound drivers split long replies into provider-safe message chunks instead of silently truncating Agent output.

The host app only supplies credentials, queue workers, and public webhook reachability. Do not create app-level controllers for these providers unless you are intentionally overriding the package drivers or renderers.

Renderer behavior defaults to text-first for external realtime channels. This keeps Agents and Playbooks channel-agnostic, avoids noisy button menus, and lets users continue with natural language. Playbook choices are rendered as numbered text options unless native controls are explicitly enabled.

| Capability | Telegram | Slack | WhatsApp Cloud | Mailgun Email |
| ---------- | -------- | ----- | -------------- | ------------- |
| Text | Native text message | Native message text | Native text message | Plain-text threaded email |
| Choices | Numbered text by default; optional callback buttons | Numbered text by default; optional Block Kit buttons | Numbered text | Numbered text |
| Inbound files | Photos and supported documents | Supported Slack files | Images and supported documents | Supported multipart attachments |
| Outbound images | Public URL or direct stored-file upload | Block image or direct stored-file upload | Text/media-link fallback | Text/media-link fallback |
| Cards and sources | Compact text fallback | Text fallback; optional Block Kit | Compact text fallback | Compact text fallback |
| Delivery statuses | Send result | Send result | Sent, delivered, read, failed | Accepted, delivered, opened, failed |
| Activity indicator | Native typing | Configurable placeholder | None | None |

Text options keep Playbook waitpoint semantics intact:

```text
Next steps:
1. Show sources
2. Check connector
3. Human handoff
Reply with the number, the label, or continue in your own words.
```

The inbound runtime maps `1`, `2`, or the typed label back to the original Playbook choice before the Agent processes the next turn.

Native controls are opt-in:

```env
AGENTIC_CHATBOT_CHANNELS_TELEGRAM_NATIVE_BUTTONS=true
AGENTIC_CHATBOT_CHANNELS_TELEGRAM_NATIVE_IMAGES=true
AGENTIC_CHATBOT_CHANNELS_SLACK_NATIVE_BUTTONS=true
AGENTIC_CHATBOT_CHANNELS_SLACK_NATIVE_BLOCKS=true
AGENTIC_CHATBOT_CHANNELS_SLACK_NATIVE_IMAGES=true
AGENTIC_CHATBOT_CHANNELS_SLACK_ACCEPT_THREAD_REPLIES_TO_BOT_MESSAGES=true
AGENTIC_CHATBOT_CHANNELS_ACTIVITY_ENABLED=true
AGENTIC_CHATBOT_CHANNELS_TELEGRAM_ACTIVITY_MODE=native_typing
AGENTIC_CHATBOT_CHANNELS_TELEGRAM_ACTIVITY_PULSE_INTERVAL_SECONDS=4
AGENTIC_CHATBOT_CHANNELS_TELEGRAM_ACTIVITY_PULSE_MAX_SECONDS=240
AGENTIC_CHATBOT_CHANNELS_SLACK_ACTIVITY_MODE=placeholder
AGENTIC_CHATBOT_CHANNELS_SLACK_ACTIVITY_PLACEHOLDER_TEXT="Working on it..."
AGENTIC_CHATBOT_CHANNELS_SLACK_ACTIVITY_PLACEHOLDER_TEXT_EN="Working on it..."
AGENTIC_CHATBOT_CHANNELS_SLACK_ACTIVITY_PLACEHOLDER_TEXT_DE="Bin dran..."
AGENTIC_CHATBOT_CHANNELS_SLACK_ACTIVITY_IMMEDIATE_RESPONSE=false
AGENTIC_CHATBOT_CHANNELS_SLACK_ACTIVITY_IMMEDIATE_RESPONSE_TYPE=ephemeral
AGENTIC_CHATBOT_CHANNELS_SLACK_ACTIVITY_UPDATE_FINAL_MESSAGE=true
AGENTIC_CHATBOT_CHANNELS_SLACK_ACTIVITY_EPHEMERAL_PLACEHOLDER=false
```

You can also set `"presentation_mode": "native"` on an individual channel connection. Keep `"presentation_mode": "text"` for the most predictable cross-channel behavior.

Image delivery supports two generic forms. Public `http` or `https` `imageUrl` values are sent natively when Telegram or Slack can fetch the URL. Stored `imageArtifact` values (`disk`, `path`, `mime`, optional `public_url`) are read from Laravel storage and uploaded directly to Telegram or Slack, which is better for local tunnels, private disks, and cloud disks where the app can read the object. WhatsApp and Email deliberately remain text-first in this release and render media as safe links or text fallbacks. Playbooks can return image URLs from API connector output, formatted data-resource records, or the provider-neutral `generate_image` capability. `generate_image` stores returned image bytes on a configured Laravel disk by default; set the disk/path config to a cloud disk such as S3/R2 when production storage should live outside the app server. Cloud or local synchronous APIs can use `http_json`.

## Admin Setup

1. Open **Agentic Chatbot > Connect > Agent Access Tokens**.
2. Create one token per enabled external channel, for example `Telegram Support`.
3. Set its channel to the matching enabled provider channel.
4. Scope areas, abilities, budgets, and rate limits for that channel.
5. Open **Agentic Chatbot > Connect > Channels**.
6. Create a channel connection for the Agent and select the matching Agent Access Token.
7. Save, copy the generated webhook URL, and configure it in the provider dashboard.

New connections stay inactive until the operator deliberately activates them. For an explicitly enabled staged provider, a correctly authenticated Slack URL-verification or WhatsApp subscription challenge is still answered while inactive so provider setup can finish; ordinary inbound messages remain rejected until activation. A disabled provider is rejected before challenge or payload processing. **Test Send** is outbound-only and can be used before activation.

The **Channels** table includes operational actions:

- **Diagnostics** checks Agent/link/token readiness, the active Agent deployment and its Playbook pins, provider credentials, webhook URL shape, webhook verification, raw payload storage, private attachment storage, queue mode, saved provider errors, and provider-specific state such as Telegram webhook info, Slack `auth.test`, WhatsApp phone-number metadata, or Mailgun domain state.
- **Test Send** sends a provider-native test message and records the outbound delivery event.
- **Set Telegram Webhook** configures Telegram with `message`, `edited_message`, and `callback_query` updates.
- **Set Telegram Commands** publishes `/start`, `/help`, `/status`, and `/reset` to Telegram clients.

Release checklist for customer environments:

1. Confirm that only providers with completed real-provider acceptance are enabled, then run a queue worker under a supervisor, not an interactive terminal.
2. Set a stable public HTTPS webhook base URL on each channel connection or through `AGENTIC_CHATBOT_CHANNELS_WEBHOOK_BASE_URL`.
3. Enable webhook verification in production and configure the provider verification secret: Telegram `webhook_secret`, Slack `signing_secret`, WhatsApp `app_secret`, or Mailgun `webhook_signing_key`.
4. Run **Diagnostics** after saving credentials and after every tunnel/domain change.
5. For Telegram, run **Set Telegram Webhook** after the public URL changes.
6. For Slack, reinstall the app after changing OAuth scopes such as `files:write`.
7. For WhatsApp, subscribe the Meta app to message webhooks and test inside an open customer-service conversation window; proactive messages outside that window require an approved template and are not emitted by this reply-only driver.
8. For Mailgun, use a receiving route with `forward("<generated-webhook-url>")` and configure delivery-event webhooks separately when status tracking is wanted.
9. Send one real inbound message through each channel and confirm inbound and outbound delivery events are completed.
10. If an Agent or Playbook returns images for Telegram or Slack, keep `native_images` enabled and either provide a public `imageUrl` or a readable Laravel storage `imageArtifact`.

For local development on `localhost:8000`, expose the app with HTTPS:

```bash
ngrok http 8000
```

or:

```bash
cloudflared tunnel --url http://localhost:8000
```

## Playbook Runtime Variables

When the Agent invokes a Playbook for a channel message, the Playbook receives channel context:

| Variable | Description |
| -------- | ----------- |
| `channel` | `telegram`, `slack`, `whatsapp`, or `email` |
| `channel_provider` | Provider key such as `telegram_bot`, `slack_app`, `whatsapp_cloud`, or `mailgun_email` |
| `channel_external_thread_id` | Provider chat or Slack workspace/channel/user/thread key |
| `channel_external_user_id` | Provider user identifier |
| `channel_external_user_label` | Display name or username |
| `channel_provider_message_id` | Provider message/update ID |
| `__channel` | Full channel context array |

Use these in Decision, AI Task, Capability, or submission mappings. Credentials and provider secrets are never exposed to Playbook variables.

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

For local tunneling, set `AGENTIC_CHATBOT_CHANNELS_WEBHOOK_BASE_URL=https://your-ngrok-host.ngrok-free.app` or add `"webhook_base_url": "https://your-ngrok-host.ngrok-free.app"` to the channel connection settings before using the Filament webhook action.

Telegram callback clicks are acknowledged with `answerCallbackQuery` by default so the Telegram client does not keep showing a loading state. Set `"answer_callback_query": false` in channel settings to disable this.

Telegram replies send a `sendChatAction` activity indicator before Agent execution when possible. With an async queue connection, the runtime also schedules a heartbeat job that repeats `sendChatAction` every few seconds while the inbound event is still processing. Set `"activity_indicator_mode": "none"` on the channel connection or `AGENTIC_CHATBOT_CHANNELS_TELEGRAM_ACTIVITY_MODE=none` to disable it. The runtime also handles operational commands before the Agent is called:

| Command | Behavior |
| ------- | -------- |
| `/start` | Shows the short channel start prompt without running the bot or workflow |
| `/help` | Shows the channel command list |
| `/status` | Runs local channel diagnostics and returns the summary |
| `/reset` | Starts a fresh channel session for the thread without deleting historical conversations |

## Slack

Provider: `Slack App`

Release status: staged and disabled by default. Set `AGENTIC_CHATBOT_CHANNELS_SLACK_ENABLED=true` only for the later Slack acceptance environment.

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
- Slack button values, typed labels, and numbered text choices are normalized back to Playbook choice values.
- Slash-command conversations are scoped by workspace, channel, and user so multiple users can use the bot in the same channel without sharing session state.
- Event and button conversations in public/private channels are scoped by Slack `thread_ts`, so two active Slack threads in the same channel do not share workflow state. Direct messages remain user-scoped.
- Plain Slack `message` events in public/private channels are ignored by default, except replies inside a thread that started from one of the bot's own messages. Set `"accept_channel_messages": true` only when the app is intentionally allowed to answer broad channel messages.
- App mentions strip the bot mention before the text reaches the workflow.
- Replies are text-first by default. Public workflow `imageUrl` output is rendered as a Block Kit image block by default. Stored workflow `imageArtifact` output is uploaded through Slack files when native images are enabled, which avoids relying on Slack fetching a local tunnel URL. Set `AGENTIC_CHATBOT_CHANNELS_SLACK_NATIVE_BLOCKS=true` or `"presentation_mode": "native"` when you intentionally want Block Kit sections, cards, sources, and buttons for the full message.
- Set `"slack_response_mode": "ephemeral"` in channel settings to send private Slack replies with `chat.postEphemeral`; otherwise replies use `chat.postMessage`.
- Set `"use_threads": false` in channel settings if you do not want replies to continue in Slack threads when an inbound event has a thread timestamp.
- Slack does not expose a native bot typing indicator. Slack activity therefore uses a normal placeholder message by default and updates it in place with `chat.update` for text/block replies. When a reply cannot be updated in place, for example a file upload, the placeholder remains visible until the final reply is sent successfully and is deleted afterwards. This avoids leaving a private slash-command acknowledgement stuck in the channel UI. Set `"activity_immediate_response": true` or `AGENTIC_CHATBOT_CHANNELS_SLACK_ACTIVITY_IMMEDIATE_RESPONSE=true` only when you prefer an immediate ephemeral slash-command acknowledgement before the queue worker starts. Ephemeral activity placeholders are disabled by default because Slack does not provide a reliable delete/update path for them.
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

## WhatsApp Cloud API

Provider: `WhatsApp Cloud API`

Release status: deferred and disabled by default. Set `AGENTIC_CHATBOT_CHANNELS_WHATSAPP_ENABLED=true` only when Meta onboarding and a real inbound/outbound acceptance run are intentionally in scope.

Credentials JSON:

```json
{
  "access_token": "permanent-system-user-token",
  "phone_number_id": "112233445566",
  "app_secret": "meta-app-secret",
  "verify_token": "your-own-random-verification-token"
}
```

WhatsApp setup:

1. Add WhatsApp to a Meta business app and connect the sending phone number.
2. Create a permanent system-user access token with the permissions required to send WhatsApp messages.
3. Copy the numeric Phone Number ID, permanent access token, and Meta App Secret into the channel form.
4. Generate your own high-entropy Verify Token and enter the same value in Filament and the Meta webhook configuration.
5. Set the Callback URL to the generated package webhook URL and subscribe the WhatsApp account to `messages`.
6. Run **Diagnostics**, then send a real customer message before using **Test Send** so the customer-service conversation window is open.

The GET verification challenge is accepted only when `hub.verify_token` matches the configured `verify_token`. POST bodies are authenticated with `X-Hub-Signature-256` and the Meta App Secret before messages or statuses are processed. Text, button replies, and list replies enter the normal Agent turn. Images and supported documents are fetched with the permanent access token from Meta's allowlisted HTTPS media hosts, with redirects disabled, configured byte limits enforced while streaming, and a provider digest checked when supplied. Audio and video are rejected as unsupported attachment types rather than being silently ignored.

Outbound replies are deliberately text-first, split at WhatsApp's text limit, and use the inbound customer's WhatsApp ID. The driver records provider message IDs plus sent/delivered/read/failed status events. It does not originate approved template messages; a proactive test outside Meta's customer-service window may therefore be rejected by Meta. Set `"preview_urls": true` to enable link previews or override the pinned Graph API version with `"graph_api_version": "v26.0"` after validating that version in your Meta app.

## Mailgun Email

Provider: `Email via Mailgun`

Release status: staged and disabled by default. Set `AGENTIC_CHATBOT_CHANNELS_EMAIL_ENABLED=true` only for the later Mailgun sandbox/real-provider acceptance environment. Email is treated as an asynchronous support surface, not as a realtime chat substitute.

Credentials JSON:

```json
{
  "api_key": "key-...",
  "domain": "mg.example.com",
  "from_address": "assistant@example.com",
  "from_name": "Example Assistant",
  "inbound_recipient": "support@example.com",
  "webhook_signing_key": "mailgun-webhook-signing-key"
}
```

Mailgun setup:

1. Verify the sending domain and choose the matching `us` or `eu` API region in the channel form.
2. Add a receiving route that matches the exact configured `inbound_recipient` and forwards to the generated package webhook URL. Do not append `/mime`; the driver expects Mailgun's parsed fields and multipart attachments.
3. Copy the domain API key and the account's Webhook Signing Key into the channel form. The webhook key is not the API key.
4. Optionally point the domain's accepted, delivered, opened, temporary-failure, and permanent-failure event webhooks to the same package URL.
5. Run **Diagnostics**, then send one real inbound email and confirm the reply remains in the same mail thread.

Both form-encoded receiving routes and JSON delivery events are authenticated with Mailgun's timestamp/token HMAC. The timestamp must be inside the configured tolerance. Inbound mail is accepted only for the exact configured recipient. `Auto-Submitted`, list, bulk, bounce, and package-generated messages are suppressed to prevent reply loops.

Inbound multipart attachments are validated and durably staged on the configured private attachment disk before the webhook dispatches its queue job. The serialized job contains only an opaque ingress ID and bounded metadata—never a storage path or raw attachment bytes. Repeated delivery of the same provider message and attachment ordinal must match the original hash and size. Plain-text bodies are preferred; HTML-only mail is reduced to bounded plain text and HTML is never passed through to the Agent. Replies are plain text with `In-Reply-To`, `References`, `Auto-Submitted: auto-replied`, and loop-suppression headers. The US endpoint is used by default; set `"api_region": "eu"` for an EU Mailgun domain.

The Agent also receives a server-attested, presentation-only email contract derived from the persisted conversation channel. It asks for a self-contained asynchronous reply with a clear next action and prevents realtime-chat filler or unverified attachment claims. The contract grants no capability authority, never supplies tool input, and cannot be activated by browser payload or email content.

## Inbound Attachments

Incoming Telegram photos/documents, Slack files, WhatsApp images/documents, and Mailgun multipart attachments all cross the same canonical attachment contract before the Agent model sees them. The global attachment switch, count/byte limits, detected MIME allowlist, image/PDF/text validation, published-model media capability, private storage, durable turn hashing, and AI budget preflight are shared with widget attachments. A channel's **Accept incoming attachments** toggle is independent from the widget's attachment toggle; this lets an operator permit files on one channel without exposing an upload control on the public widget.

Provider-declared MIME types and filenames are hints only. File content is detected and verified. Remote downloads require HTTPS on port 443, reject credentials/fragments and redirects, allow only the provider's known media hosts, enforce limits while streaming, and return bounded user-safe failures. Mailgun ingress filenames are encrypted, paths are random, and storage paths are never serialized into a queued job.

Relevant global limits:

```env
AGENTIC_CHATBOT_ATTACHMENTS_ENABLED=true
AGENTIC_CHATBOT_ATTACHMENTS_DISK=local
AGENTIC_CHATBOT_ATTACHMENTS_MAX_FILES=3
AGENTIC_CHATBOT_ATTACHMENTS_MAX_FILE_BYTES=10485760
AGENTIC_CHATBOT_ATTACHMENTS_MAX_TOTAL_BYTES=20971520
AGENTIC_CHATBOT_ATTACHMENTS_CHANNEL_INGRESS_RETENTION_HOURS=24
AGENTIC_CHATBOT_ATTACHMENTS_DOWNLOAD_TIMEOUT_SECONDS=15
```

The disk must be private and writable from both web and queue workers. Channel ingress is temporary transport storage; the canonical chat turn copies accepted bytes into normal chat-attachment storage. The package schedules `filament-agentic-chatbot:prune-channel-inbound-attachments` daily at `02:35` to purge expired staged or consumed ingress objects. Deleting a channel connection, or force-deleting its Agent, purges owned ingress files before database cascades remove their ledgers.

## Queues

Inbound webhooks dispatch `ProcessChannelInboundMessage`. In production, run a queue worker so providers receive fast HTTP 200 responses:

```bash
php artisan queue:work
```

Optional queue overrides:

```env
AGENTIC_CHATBOT_CHANNELS_QUEUE_CONNECTION=redis
AGENTIC_CHATBOT_CHANNELS_QUEUE=channels
AGENTIC_CHATBOT_CHANNELS_PROCESSING_TIMEOUT_SECONDS=300
```

`AGENTIC_CHATBOT_CHANNELS_PROCESSING_TIMEOUT_SECONDS` controls when an inbound delivery event stuck in `processing` can be reclaimed by a retry. This protects against worker crashes without allowing fresh duplicate provider retries to double-run the same message.

Repeated Telegram typing indicators require a real async queue connection. When the channel queue resolves to Laravel's `sync` driver, the first `sendChatAction` is still sent, but no background heartbeat is scheduled.

If a provider returns a retry-after response while sending a channel reply, the inbound event is marked completed and the outbound delivery event stays in `processing`. The queued outbound retry sends the saved reply text again later, so the Agent, knowledge search, Playbook execution, budgets, and usage accounting are not run twice for the same inbound message.

Ingress rate-limit overrides:

```env
AGENTIC_CHATBOT_CHANNELS_RATE_LIMITER=agentic-chatbot-channels
AGENTIC_CHATBOT_CHANNELS_MAX_WEBHOOK_REQUESTS_PER_MINUTE=120
AGENTIC_CHATBOT_CHANNELS_MAX_WEBHOOK_REQUESTS_PER_MINUTE_PER_IP=240
```

These ingress limits are only abuse protection for provider webhooks. Agent-level product limits should be configured on the channel's Agent Access Token.

Security defaults:

```env
AGENTIC_CHATBOT_CHANNELS_REQUIRE_WEBHOOK_VERIFICATION=true
AGENTIC_CHATBOT_CHANNELS_STORE_RAW_WEBHOOK_PAYLOADS=false
AGENTIC_CHATBOT_CHANNELS_ERROR_REPLY_MESSAGE="The bot could not process this message. Please try again later."
```

`AGENTIC_CHATBOT_CHANNELS_REQUIRE_WEBHOOK_VERIFICATION` defaults to `true` in production and `false` outside production. When enabled, Telegram requires `webhook_secret`, Slack requires `signing_secret`, WhatsApp requires `app_secret`, and Mailgun requires `webhook_signing_key`. Raw provider payload storage is disabled by default; enable it only for short-lived debugging. Stored and queued payloads redact token, secret, signature, password, and API-key fields and bound string length, object breadth, and nesting depth before persistence. `AGENTIC_CHATBOT_CHANNELS_ERROR_REPLY_MESSAGE` is used when the bot runtime returns an error payload without a user-safe message.

WhatsApp always needs `verify_token` for the GET subscription challenge and uses `app_secret` for POST signatures. Mailgun uses `webhook_signing_key` for both receiving-route and event signatures. The provider API credentials remain encrypted in `channel_connections`; they are never copied into Agent prompts, Playbook variables, delivery payload snapshots, or attachment descriptors.

## Provider Notes

- Telegram is the best first local test because setup is simple and replies are plain text.
- Slack is the best B2B/backoffice channel after Telegram. Prefer slash commands and interactions over broad channel-history reads.
- WhatsApp is the best customer-facing realtime channel when the business already has a Meta WhatsApp setup. This driver is reply-oriented and intentionally does not bypass template policy.
- Mailgun Email is appropriate for asynchronous support intake and document-heavy requests. Use a dedicated inbound address and keep loop-suppression headers intact.
