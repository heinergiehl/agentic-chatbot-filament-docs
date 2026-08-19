# Chat Widget

The chat widget is the embeddable UI layer that connects end users to your configured bot. It is the front-end for the bot, sources, retrieval, workflows, and conversation storage already set up in Filament.

Do not put Bot Access Tokens in widget markup or public JavaScript. Widgets use the signed widget token (`X-filament-agentic-chatbot-Token`) and bot domain allow-lists; Bot Access Tokens are server-side secrets for trusted backend integrations only.

## What The Widget Does

- Renders a floating chat bubble on any website or product page
- Opens into a full chat panel with durable message history, committed responses, and source citations
- Connects to your Laravel backend via the plugin's API routes
- Supports signed tokens for access control
- Supports assistant-message feedback buttons for quick helpful / not-helpful signals
- Adapts to desktop and mobile screen sizes

## Customization Options

Per bot, you can customize all of these from the Filament panel:

| Setting               | Description                                  | Example                         |
| --------------------- | -------------------------------------------- | ------------------------------- |
| **Title**             | Header text in the chat panel                | "Support Assistant"             |
| **Subtitle**          | Smaller text below the title                 | "Always here to help"           |
| **Welcome message**   | First message shown when the chat opens      | "Hi! How can I help you today?" |
| **Quick prompts**     | Suggested starter questions shown as buttons | "How do I reset my password?"   |
| **Accent color**      | Primary color for the header and send button | `#f97316` (orange)              |
| **Template**          | Visual style preset (see below)              | `aurora`                        |
| **Font preset**       | Typography style                             | `modern-sans`                   |
| **Compact mode**      | Smaller widget footprint for tight layouts   | `true` / `false`                |
| **Show sources**      | Whether to display cited source references   | `true` / `false`                |
| **Input placeholder** | Placeholder text in the message input        | "Type a message..."             |
| **Response format**   | `markdown` or `plain_text`                   | `markdown`                      |
| **Language**          | Widget UI language code                      | `en`, `de`, `fr`, `es`          |

## Style Templates

The widget ships with twelve visual themes:

| Template     | Description                            |
| ------------ | -------------------------------------- |
| `clean`      | Neutral and professional (default)     |
| `glass`      | Frosted-glass translucent panels       |
| `bold`       | High-contrast, saturated colors        |
| `neo-brutal` | Thick borders, raw geometric look      |
| `noir`       | Dark background, minimal chrome        |
| `aurora`     | Soft gradients and warm tones          |
| `control-plane` | Product-grade panel styling for operational SaaS demos |
| `minimal`    | Maximum whitespace, understated UI     |
| `x-dark`     | Bold dark surface inspired by X        |
| `imessage`   | Bubble-forward chat styling            |
| `openai`     | Clean assistant UI inspired by ChatGPT |
| `solar`      | Warm, high-contrast light palette      |

## Font Presets

| Preset             | Stack                              |
| ------------------ | ---------------------------------- |
| `modern-sans`      | System UI sans-serif (default)     |
| `humanist-sans`    | Segoe UI, Helvetica Neue, Arial    |
| `friendly-rounded` | Trebuchet MS, Avenir Next, Verdana |
| `editorial-serif`  | Charter, Palatino, Georgia         |
| `technical-mono`   | System monospace                   |

## Embedding The Widget

### Same Laravel App / Same Origin

The simplest and recommended setup is to embed the widget from the same Laravel app that serves Filament Agentic Chatbot.

- The widget script is served by the same app.
- The chat API calls stay on the same origin by default.
- You do not need a separate frontend just to use the widget.
- In the common same-origin case, you can usually omit `data-api-base` and let the script infer the app origin from its own `src` URL.

If you render the widget from Blade, Livewire, or an Inertia page inside the same monolith, that is the easiest path operationally and from a security perspective.

### Option 1: Blade Component (recommended for same app)

In Filament, open **Bots** and confirm that the bot is active with one verified live workflow deployment. Then run the **Use as public widget** row action and add the component to your Blade layout or page:

```blade
<x-filament-agentic-chatbot::chat-widget />
```

The component resolves bots in this order:

1. An explicit component prop, such as `bot-public-id="YOUR_BOT_PUBLIC_ID"`
2. The bot marked **Public Widget** in the Bots table
3. `AGENTIC_CHATBOT_WIDGET_BOT_PUBLIC_ID`
4. The first runnable bot

At every level, runnable means that the bot is active and its live deployment passes immutable artifact and dependency-closure verification. An invalid explicit or configured ID fails closed. A marked but unrunnable or multiply marked selection also fails closed instead of silently exposing a different bot.

Use an explicit prop only when a page should intentionally override the selected public widget bot:

```blade
<x-filament-agentic-chatbot::chat-widget bot-public-id="YOUR_BOT_PUBLIC_ID" />
```

### Option 2: Script Tag

Add a single `<script>` tag to any HTML page:

```html
<script
    src="https://your-app.com/filament-agentic-chatbot/widget"
    data-bot="YOUR_BOT_PUBLIC_ID"
    data-area="public"
    data-template="aurora"
    data-accent="#f97316"
    data-title="Support Assistant"
    data-subtitle="Always here to help"
    data-compact="false"
    data-size="comfortable"
    data-font="modern-sans"
    data-show-sources="true"
    data-lang="en"
    defer
></script>
```

The script path is controlled by `widget.script_route`; update deployed snippets when you change it. The package registers that configured path only.

**Required attributes:**

| Attribute  | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| `data-bot` | The bot's public ID (found in the bot edit page in Filament) |

Common optional attributes:

| Attribute | Description |
| --------- | ----------- |
| `data-api-base` | Laravel app base URL when the API is not inferred from the script origin |
| `data-area` | Context area such as `public`, `member`, or `admin` |
| `data-position` | `left` or `right` |
| `data-template` | Style template such as `clean`, `aurora`, `control-plane`, `openai`, or `solar` |
| `data-accent` | Hex accent color |
| `data-title` | Chat panel title |
| `data-subtitle` | Chat panel subtitle |
| `data-welcome` | Welcome message |
| `data-compact` | `true` or `false` |
| `data-size` | `compact`, `comfortable`, or `spacious` |
| `data-font` | `modern-sans`, `humanist-sans`, `friendly-rounded`, `editorial-serif`, or `technical-mono` |
| `data-show-sources` | `true` or `false` |
| `data-lang` | UI language code such as `en`, `de`, `fr`, or `es` |

All optional `data-*` attributes override the bot's default settings.

### Option 3: NPM Package (for SPAs)

Install the helper package:

```bash
npm install @heiner/filament-agentic-chatbot-widget
```

Then mount it in your JavaScript:

```js
import { mountFilamentAgenticChatbotWidget } from "@heiner/filament-agentic-chatbot-widget";

mountFilamentAgenticChatbotWidget({
    botId: "YOUR_BOT_PUBLIC_ID",
    scriptUrl: "https://your-app.com/filament-agentic-chatbot/widget",
    apiBase: "https://your-app.com",
    token: "SIGNED_TOKEN",
    area: "public",
    position: "right",
    template: "aurora",
    accent: "#f97316",
    title: "Support Assistant",
    subtitle: "Always here to help",
    welcome: "Hi! How can I help?",
    inputPlaceholder: "Type a message...",
    compactMode: false,
    fontPreset: "modern-sans",
    sizePreset: "comfortable",
    showSources: true,
    lang: "en",
});
```

The NPM loader creates and appends the `<script>` element with the right `data-*` attributes. It is a thin wrapper — no bundled UI framework and no iframe wrapper.

### Available NPM Options

| Option             | Type                  | Description                                |
| ------------------ | --------------------- | ------------------------------------------ |
| `botId`            | string                | **Required.** Bot public ID                |
| `scriptUrl`        | string                | URL to the widget script endpoint          |
| `apiBase`          | string                | Your Laravel app's base URL                |
| `token`            | string                | Signed embed token                         |
| `area`             | string                | Context area (`public`, `member`, `admin`) |
| `position`         | `'left'` \| `'right'` | Widget position on screen                  |
| `template`         | string                | Style template name                        |
| `accent`           | string                | Hex color for accent                       |
| `title`            | string                | Chat panel header title                    |
| `subtitle`         | string                | Chat panel header subtitle                 |
| `welcome`          | string                | Welcome message                            |
| `inputPlaceholder` | string                | Input field placeholder                    |
| `compactMode`      | boolean               | Enable compact layout                      |
| `fontPreset`       | string                | Typography preset name                     |
| `sizePreset`       | string                | Size preset (`compact`, `comfortable`, `spacious`) |
| `showSources`      | boolean               | Show source citations                      |
| `lang`             | string                | UI language code                           |

## Event Stream And Failure Behavior

The widget consumes committed chat outcomes over server-sent events. Workflow execution and canonical persistence finish before the response is projected. The package emits `init`, `message_complete`, and `error` events, then closes with `data: [DONE]`; it does not manufacture token deltas from an already completed message.

If workflow execution fails after a run has been prepared, the server logs the failure, marks the run failed, emits a safe error event, and closes the stream. JSON `/complete` integrations receive the same safe error code/message shape as a normal chat failure. Stack traces, provider secrets, and raw technical exception messages should stay out of widget responses.

The stream encoder substitutes invalid UTF-8 before sending JSON events. If encoding still fails, the client receives a safe `stream_encoding_failed` error event instead of malformed SSE data.

## Widget Security

### Signed Tokens

When `AGENTIC_CHATBOT_WIDGET_SIGNING_ENABLED=true` (recommended for production), the browser loader calls `POST /api/filament-agentic-chatbot/chat/{botPublicId}/bootstrap` without a static token. The endpoint validates the area and exact browser origin against Allowed Domains, then returns a short-lived HMAC-SHA256 token with `Cache-Control: no-store`. Tokens include:

- a widget audience and token version
- the bot's public ID
- issue and expiration timestamps
- the exact browser origin

The loader retains access only in memory, refreshes it before expiry with a single in-flight request, and automatically retries only safe reads. It never replays chat sends, session creation, deletion, feedback, or form writes. `WidgetEmbedToken::make()` remains available for explicit server-to-server integrations, but browser snippets must not contain its result.

For a non-browser server integration that deliberately uses this lower-level boundary:

```php
use Heiner\FilamentAgenticChatbot\Support\WidgetEmbedToken;

$token = WidgetEmbedToken::make(
    botPublicId: $bot->public_id,
    host: 'your-website.com'  // optional: restrict to this domain
);
```

**Token configuration:**

| Env Variable                 | Description                   | Default                 |
| ---------------------------- | ----------------------------- | ----------------------- |
| `AGENTIC_CHATBOT_WIDGET_SIGNING_ENABLED` | Require signed tokens         | `true`                  |
| `AGENTIC_CHATBOT_WIDGET_SIGNING_KEY`     | HMAC signing secret           | falls back to `APP_KEY` |
| `AGENTIC_CHATBOT_WIDGET_SIGNING_TTL_MINUTES` | Signed token lifetime. Production default: `10` minutes; local/non-production default: `60` minutes. | env-specific |
| `AGENTIC_CHATBOT_WIDGET_SIGNING_REFRESH_BEFORE_SECONDS` | Browser renewal lead time | `120` |
| `AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_QUERY_TOKENS` | Accept `?token=` on API requests | production: `false`; otherwise: `true` |
| `AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_BODY_TOKENS`  | Accept `token` in JSON/form bodies | production: `false`; otherwise: `true` |
| `AGENTIC_CHATBOT_WIDGET_CONVERSATION_CREDENTIAL_REQUIRED` | Require the server-issued credential outside production too | production is always enforced |

The loader sends access through the `X-filament-agentic-chatbot-Token` header. Query-string and body tokens default to disabled in production. The bootstrap endpoint has independent per-bot/origin/IP and global-IP rate limits through `AGENTIC_CHATBOT_WIDGET_BOOTSTRAP_MAX_REQUESTS_PER_MINUTE` and `AGENTIC_CHATBOT_WIDGET_BOOTSTRAP_MAX_REQUESTS_PER_MINUTE_PER_IP`.

### Conversation Credentials

After obtaining widget access, the shipped loader calls `POST /api/filament-agentic-chatbot/chat/{botPublicId}/session`. The server returns a random session ID plus a separate high-entropy conversation credential over a `Cache-Control: no-store` response. The widget persists the pair locally and sends the credential only in the `X-Filament-Agentic-Chatbot-Conversation-Credential` header.

Only a SHA-256 hash of the credential is stored in `bot_conversations.meta`. The session ID remains a lookup key and may appear in history/turn URLs, but it is not sufficient to read, export, mutate, or delete an anonymous production conversation. A stale or invalid locally saved pair is discarded and safely bootstrapped again; write requests are not replayed by that recovery path. Authenticated area users, scoped Bot Access Tokens, and channel identities continue to use their stronger existing authority bindings.

### Domain Allowlists

Each bot can define a list of allowed domains. If set, the widget's CORS middleware only responds to requests from those domains. Wildcard subdomains are supported (e.g., `*.example.com`).

Empty allowlists are still allowed by default through `AGENTIC_CHATBOT_WIDGET_ALLOW_ALL_DOMAINS=true` for older installs. Treat that as a compatibility bridge, not a production target. Set `AGENTIC_CHATBOT_WIDGET_ALLOW_ALL_DOMAINS=false` and list the exact hosts before public rollout.

### Context Areas And Access Rules

| Area     | Behavior                                                            |
| -------- | ------------------------------------------------------------------- |
| `public` | No authentication required                                          |
| `member` | Requires an authenticated user (checked via configured auth guards) |
| `admin`  | Requires an authenticated user with admin ability                   |

### Rate Limiting

| Env Variable                         | Default |
| ------------------------------------ | ------- |
| `AGENTIC_CHATBOT_MAX_REQUESTS_PER_MINUTE`        | 40      |
| `AGENTIC_CHATBOT_MAX_REQUESTS_PER_MINUTE_PER_IP` | 120     |

The session and IP limits are independent. The IP limit is no longer raised to match the session limit, so keep both values explicit for your expected traffic shape.

## CORS Configuration

The plugin includes a `HandleWidgetCors` middleware that automatically sets CORS headers based on the bot's allowed domain list. No additional Laravel CORS configuration is needed for the widget endpoints.

If you embed the widget on pages served by the same Laravel monolith, CORS is usually a non-issue because the widget script and chat API calls stay on the same origin.

## Config Payload

`GET /api/filament-agentic-chatbot/chat/{botPublicId}/config` keeps its existing shape and adds `bot.knowledge_health`:

- `has_sources`
- `ready_sources`
- `chunk_count`
- `source_status_counts`
- `is_ready`

Use it for custom widget empty states such as "sources are still indexing" without guessing from source records.

## Content Security Policy

Same-origin embedding avoids cross-origin complexity, but it does not automatically bypass CSP.

- The widget is loaded through a script tag.
- The widget calls the chat API with `fetch()`.
- The current widget runtime injects its own `<style>` tag for the UI.

That means a very strict CSP can still block the widget even on the same app. In practice, pages that host the widget should allow the same-origin script and API calls, and should not block the widget's injected styles.

## Public vs Internal Widgets

### Public Widget

Best for marketing site chat, public documentation assistant, product onboarding help.

Configuration: `area="public"`, no auth required, domain allowlist recommended.

For production public widgets, use signed header tokens, a non-empty domain allowlist, and a supervised queue worker if the bot can trigger ingestion, delays, or workflows.

### Internal Widget

Best for admin support dashboard, back-office workflow assistance, authenticated internal knowledge.

Configuration: `area="member"` or `area="admin"`, requires auth guard, signing enabled.

## Server-Side Integrations

Use the widget for browser embeds. Use Bot Access Tokens and the JSON complete endpoint for trusted server-side API clients, Telegram bots, Slack apps, or incident-management systems.

See [API Integrations](API_INTEGRATIONS.md) for the server-side request contract and webhook examples.

## Feedback And Session Controls

- Assistant messages expose helpful / not-helpful feedback buttons with optional note capture.
- Session history can be loaded back into the widget for returning users.
- Privacy workflows can export or delete a session through the chat API endpoints.
- Review feedback, citation coverage, and knowledge gaps from the bot's Analytics page inside Filament.

## Testing The Widget

The bot edit page provides a built-in **Live Preview** section in Filament where you can test the widget for the current bot without embedding it on an external site.

## Related Docs

- [Bots](BOTS.md)
- [Context Areas](CONTEXT_AREAS.md)
- [API Integrations](API_INTEGRATIONS.md)
- [Security And Privacy](SECURITY_AND_PRIVACY.md)
