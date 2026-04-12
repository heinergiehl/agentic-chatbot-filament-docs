# Chat Widget

The chat widget is the embeddable UI layer that connects end users to your configured bot. It is the front-end for the bot, sources, retrieval, workflows, and conversation storage already set up in Filament.

## What The Widget Does

- Renders a floating chat bubble on any website or product page
- Opens into a full chat panel with message history, streaming responses, and source citations
- Connects to your Laravel backend via the plugin's API routes
- Supports signed tokens for access control
- Supports assistant-message feedback buttons for quick helpful / not-helpful signals
- Adapts to desktop and mobile screen sizes

## Customization Options

Per bot, you can customize all of these from the Filament panel:

| Setting | Description | Example |
|---------|-------------|---------|
| **Title** | Header text in the chat panel | "Support Assistant" |
| **Subtitle** | Smaller text below the title | "Always here to help" |
| **Welcome message** | First message shown when the chat opens | "Hi! How can I help you today?" |
| **Quick prompts** | Suggested starter questions shown as buttons | "How do I reset my password?" |
| **Accent color** | Primary color for the header and send button | `#f97316` (orange) |
| **Template** | Visual style preset (see below) | `aurora` |
| **Font preset** | Typography style | `modern-sans` |
| **Compact mode** | Smaller widget footprint for tight layouts | `true` / `false` |
| **Show sources** | Whether to display cited source references | `true` / `false` |
| **Input placeholder** | Placeholder text in the message input | "Type a message..." |
| **Response format** | `markdown` or `plain_text` | `markdown` |
| **Language** | Widget UI language code | `en`, `de`, `fr`, `es` |

## Style Templates

The widget ships with eleven visual themes:

| Template | Description |
|----------|-------------|
| `clean` | Neutral and professional (default) |
| `glass` | Frosted-glass translucent panels |
| `bold` | High-contrast, saturated colors |
| `neo-brutal` | Thick borders, raw geometric look |
| `noir` | Dark background, minimal chrome |
| `aurora` | Soft gradients and warm tones |
| `minimal` | Maximum whitespace, understated UI |
| `x-dark` | Bold dark surface inspired by X |
| `imessage` | Bubble-forward chat styling |
| `openai` | Clean assistant UI inspired by ChatGPT |
| `solar` | Warm, high-contrast light palette |

## Font Presets

| Preset | Stack |
|--------|-------|
| `modern-sans` | System UI sans-serif (default) |
| `humanist-sans` | Segoe UI, Helvetica Neue, Arial |
| `friendly-rounded` | Trebuchet MS, Avenir Next, Verdana |
| `editorial-serif` | Charter, Palatino, Georgia |
| `technical-mono` | System monospace |

## Embedding The Widget

### Same Laravel App / Same Origin

The simplest and recommended setup is to embed the widget from the same Laravel app that serves Filament Agentic Chatbot.

- The widget script is served by the same app.
- The chat API calls stay on the same origin by default.
- You do not need a separate frontend just to use the widget.
- In the common same-origin case, you can usually omit `data-api-base` and let the script infer the app origin from its own `src` URL.

If you render the widget from Blade, Livewire, or an Inertia page inside the same monolith, that is the easiest path operationally and from a security perspective.

### Option 1: Script Tag (simplest)

Add a single `<script>` tag to any HTML page:

```html
<script
  src="https://your-app.com/filament-agentic-chatbot/widget.js"
  data-bot="YOUR_BOT_PUBLIC_ID"
  data-token="SIGNED_TOKEN"
  data-area="public"
  data-template="aurora"
  data-accent="#f97316"
  data-title="Support Assistant"
  data-subtitle="Always here to help"
  data-compact="false"
  data-show-sources="true"
  data-lang="en"
  defer
></script>
```

**Required attributes:**

| Attribute | Description |
|-----------|-------------|
| `data-bot` | The bot's public ID (found in the bot edit page in Filament) |
| `data-token` | A signed embed token (required when `RAG_WIDGET_SIGNING_ENABLED=true`) |

All other `data-*` attributes are optional and override the bot's default settings.

### Option 2: NPM Package (for SPAs)

Install the helper package:

```bash
npm install @heiner/filament-agentic-chatbot-widget
```

Then mount it in your JavaScript:

```js
import { mountFilamentAgenticChatbotWidget } from '@heiner/filament-agentic-chatbot-widget';

mountFilamentAgenticChatbotWidget({
  botId: 'YOUR_BOT_PUBLIC_ID',
  scriptUrl: 'https://your-app.com/filament-agentic-chatbot/widget.js',
  apiBase: 'https://your-app.com',
  token: 'SIGNED_TOKEN',
  area: 'public',
  position: 'right',
  template: 'aurora',
  accent: '#f97316',
  title: 'Support Assistant',
  subtitle: 'Always here to help',
  welcome: 'Hi! How can I help?',
  inputPlaceholder: 'Type a message...',
  compactMode: false,
  fontPreset: 'modern-sans',
  showSources: true,
  lang: 'en',
});
```

The NPM loader creates and appends the `<script>` element with the right `data-*` attributes. It is a thin wrapper — no bundled UI framework and no iframe wrapper.

### Available NPM Options

| Option | Type | Description |
|--------|------|-------------|
| `botId` | string | **Required.** Bot public ID |
| `scriptUrl` | string | URL to widget.js |
| `apiBase` | string | Your Laravel app's base URL |
| `token` | string | Signed embed token |
| `area` | string | Context area (`public`, `member`, `admin`) |
| `position` | `'left'` \| `'right'` | Widget position on screen |
| `template` | string | Style template name |
| `accent` | string | Hex color for accent |
| `title` | string | Chat panel header title |
| `subtitle` | string | Chat panel header subtitle |
| `welcome` | string | Welcome message |
| `inputPlaceholder` | string | Input field placeholder |
| `compactMode` | boolean | Enable compact layout |
| `fontPreset` | string | Typography preset name |
| `showSources` | boolean | Show source citations |
| `lang` | string | UI language code |

## Widget Security

### Signed Tokens

When `RAG_WIDGET_SIGNING_ENABLED=true` (recommended for production), every widget request must include a valid signed token. Tokens are HMAC-SHA256 signed and include:

- the bot's public ID
- an expiration timestamp
- an optional host restriction

Generate a token from your backend:

```php
use Heiner\FilamentAgenticChatbot\Support\WidgetEmbedToken;

$token = WidgetEmbedToken::make(
    botPublicId: $bot->public_id,
    host: 'your-website.com'  // optional: restrict to this domain
);
```

**Token configuration:**

| Env Variable | Description | Default |
|-------------|-------------|---------|
| `RAG_WIDGET_SIGNING_ENABLED` | Require signed tokens | `true` |
| `RAG_WIDGET_SIGNING_KEY` | HMAC signing secret | falls back to `APP_KEY` |
| Token TTL | Configured in the config file | 30 days |

### Domain Allowlists

Each bot can define a list of allowed domains. If set, the widget's CORS middleware only responds to requests from those domains. Wildcard subdomains are supported (e.g., `*.example.com`).

### Context Areas And Access Rules

| Area | Behavior |
|------|----------|
| `public` | No authentication required |
| `member` | Requires an authenticated user (checked via configured auth guards) |
| `admin` | Requires an authenticated user with admin ability |

### Rate Limiting

| Env Variable | Default |
|-------------|---------|
| `RAG_MAX_REQUESTS_PER_MINUTE` | 40 |
| `RAG_MAX_REQUESTS_PER_MINUTE_PER_IP` | 120 |

## CORS Configuration

The plugin includes a `HandleWidgetCors` middleware that automatically sets CORS headers based on the bot's allowed domain list. No additional Laravel CORS configuration is needed for the widget endpoints.

If you embed the widget on pages served by the same Laravel monolith, CORS is usually a non-issue because the widget script and chat API calls stay on the same origin.

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

### Internal Widget

Best for admin support dashboard, back-office workflow assistance, authenticated internal knowledge.

Configuration: `area="member"` or `area="admin"`, requires auth guard, signing enabled.

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
- [Security And Privacy](SECURITY_AND_PRIVACY.md)
