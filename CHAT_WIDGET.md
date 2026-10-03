# Chat Widget

The chat widget is the embeddable UI layer that connects end users to your configured Agent. It is the front-end for the Agent, sources, retrieval, optional Playbooks, and conversation storage already set up in Filament.

Do not put Agent Access Tokens in widget markup or public JavaScript. Widgets use the signed widget token (`X-filament-agentic-chatbot-Token`) and Agent domain allow-lists; Agent Access Tokens are server-side secrets for trusted backend integrations only.

## What The Widget Does

- Renders a floating chat bubble on any website or product page
- Opens into a full chat panel with durable message history, committed responses, and retrieved source cards
- Connects to your Laravel backend via the plugin's API routes
- Supports signed tokens for access control
- Supports bounded image and document attachments when the exact Published Agent model is release-verified for them
- Supports assistant-message feedback buttons for quick helpful / not-helpful signals
- Adapts to desktop and mobile screen sizes

Chat requires a persistent Laravel queue and a worker for `agentic-chat` (or
the configured `CHAT_QUEUE` name). See [upgrade configuration](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md).
The widget receives an early `turn_accepted` event, displays saved progress and
retrieves the final committed answer through authenticated status requests.
Reloading restores an active turn from history without sending the message
again. A network interruption stops delivery, not accepted tool execution.
Uncertain execution remains paused for reconciliation rather than retried.

## Customization Options

Per bot, you can customize all of these from the Filament panel:

| Setting               | Description                                  | Example                         |
| --------------------- | -------------------------------------------- | ------------------------------- |
| **Title**             | Header text in the chat panel                | "Support Assistant"             |
| **Subtitle**          | Smaller text below the title                 | "Always here to help"           |
| **Welcome message**   | Greeting in an empty conversation           | "Hi! How can I help you today?" |
| **Empty-state hint**  | Short guidance below the welcome heading     | "Choose a topic or ask freely." |
| **Conversation starters** | Up to four titled prompts with optional icons | "Track my order"              |
| **Avatar**            | Agent image or the built-in fallback         | `/images/support-agent.png`      |
| **Accent color**      | Primary color for the header and send button | `#f97316` (orange)              |
| **Template**          | Visual style preset (see below)              | `aurora`                        |
| **Font preset**       | Typography style                             | `modern-sans`                   |
| **Compact mode**      | Smaller widget footprint for tight layouts   | `true` / `false`                |
| **Show sources**      | Whether to display retrieved source cards    | `true` / `false`                |
| **Input placeholder** | Placeholder text in the message input        | "Type a message..."             |
| **Response format**   | `markdown` or `plain_text`                   | `markdown`                      |
| **Language**          | Widget language for built-in texts           | `en`, `de`, `fr`, `es`          |
| **Attachments**       | Allow verified private image/document uploads | `true` / `false`                |

### Conversation Starters And Icons

A conversation starter has three fields:

- `label`: the short title visible in the empty state
- `prompt`: the exact visitor message sent when the starter is selected
- `icon`: an optional semantic key from the safe icon list

The Filament form lets an administrator select an icon without writing HTML or knowing an icon component name. The widget renders at most four starters, uses native buttons, and sends the selected prompt through the normal chat turn path. An area override may inherit the global list, replace it, or intentionally clear it.

The Website tab keeps access, code, installation guidance, and appearance together. Subtitle choices are **Standard**, **Custom text**, and **Hide**. A custom subtitle requires text; area overrides can also **Inherit** the base subtitle. Older configurations without a mode retain their existing default or custom subtitle. The appearance preview uses the same subtitle resolution as the delivered widget and runs no Agent conversation.

Starter titles and prompt descriptions wrap to remain readable. Keep the welcome message and starter labels concise so visitors can scan the choices. The message input also grows for a wrapped placeholder, recalculates its height when the available width changes, and scrolls once it reaches the size preset's height limit. The Glass template keeps the default avatar in the header and uses a quieter, left-aligned welcome; a configured avatar image remains visible in the welcome state.

Long welcome messages appear as body text below the localized “How can I help?” heading. The configured message is preserved in full. Short greetings remain the heading. All twelve templates share this hierarchy and the compact header actions, with template-specific colors and geometry in light and dark mode. The subtitle is descriptive text without an animated availability indicator.

Header titles, subtitles, and action states use the same theme palette in the Appearance preview and public widget. Clean uses an accent tint, Bold uses a deeper accent shade, and Aurora uses a quiet pastel or dark violet gradient. New-chat controls use a subtle theme surface; unavailable menu actions retain readable neutral text. Solar pairs separate day and night composer colors.

Developers can extend the safe list in the published configuration. The icon value is a registered Blade icon alias, not arbitrary markup:

```php
'widget' => [
    'conversation_starter_icons' => [
        'billing' => [
            'label' => 'Billing',
            'icon' => 'heroicon-o-credit-card',
        ],
    ],
],
```

Existing `quick_prompts` string lists are accepted when an older bot is loaded. The next save writes the structured `conversation_starters` format.

## File Attachments

When attachments are enabled for an Agent and its exact published model has a
verified image or document capability, the composer exposes an accessible file
picker. A turn may contain text, files, or both. Failed sends retain the
browser-owned `File` objects for an explicit retry or edit; a new chat and a
successful terminal turn clear them.

The browser limits are presentation only. The server independently enforces
the file count, per-file and total byte limits, detects MIME type from content,
checks images and text structure, canonicalizes untrusted names, binds file
hashes to the durable `client_turn_id`, and stores files on a private disk. It
rejects an unknown or unverified model capability instead of silently dropping
the file. Supported defaults are JPEG, PNG, WebP, PDF, JSON, CSV, Markdown, and
UTF-8 plain text.

```env
AGENTIC_CHATBOT_ATTACHMENTS_ENABLED=true
AGENTIC_CHATBOT_ATTACHMENTS_DISK=local
AGENTIC_CHATBOT_ATTACHMENTS_PATH=filament-agentic-chatbot/chat-attachments
AGENTIC_CHATBOT_ATTACHMENTS_MAX_FILES=3
AGENTIC_CHATBOT_ATTACHMENTS_MAX_FILE_BYTES=10485760
AGENTIC_CHATBOT_ATTACHMENTS_MAX_TOTAL_BYTES=20971520
AGENTIC_CHATBOT_ATTACHMENTS_RETENTION_DAYS=30
```

The configured disk must not be publicly served. The default Laravel `local`
disk is appropriate when it points outside `public/` and `serve` remains
disabled. See [Security and Privacy](SECURITY_AND_PRIVACY.md#private-chat-attachments)
and [Operations](OPERATIONS.md#chat-attachment-retention).

## Language

The widget shows one language per session. Its built-in texts (buttons,
status lines, errors, cards, progress labels, handoff states) come from
`resources/lang/{locale}/widget.php` for the Agent's widget language; English
and German are complete, French and Spanish are shipped too. A text field left
empty in the Website tab (title, subtitle in **Standard** mode, welcome
message, empty-state hint, input placeholder) shows the translated default.
Texts you write are shown as written, so write them in the widget language.

When the live Agent version allows several languages and the Agent has no
written visitor texts (welcome message, hint, placeholder, custom subtitle or
conversation starters), the widget follows the visitor's browser language
among those languages. Otherwise it keeps the widget language. The
"Choose a suggestion" line appears only when conversation starters exist; a
written hint always appears. Answers follow the visitor's language within the
Agent's languages independently of the widget texts.

To change a built-in text, publish the translations and edit
`lang/vendor/filament-agentic-chatbot/{locale}/widget.php` (see
[Localization](LOCALIZATION.md)). The widget script version changes with the
texts, so browsers load the new script.

## Appearance On Host Pages

The panel is opaque on every template, so host content never shows through
it. The widget switches to its dark palette when the host page has a `dark`
class or `data-theme="dark"` on an ancestor, as Filament panels do. Text,
cards, confirmation cards and progress labels meet WCAG AA contrast in light
and dark; links and the Confirm and Submit buttons derive an AA-readable shade
from the accent color. On screens up to 640 px wide the open panel becomes a
full-screen sheet within the safe areas, sized to the visible viewport so the
on-screen keyboard does not cover the composer. Every control has a visible
focus outline, and animations and smooth scrolling are off when the visitor
prefers reduced motion.

A host page can set these CSS custom properties on `:root` or any ancestor of
the widget:

| Property | Effect | Default |
| --- | --- | --- |
| `--fac-font` | Font family of the widget | the font preset |
| `--fac-z-index` | Stacking order of launcher and panel | `2147483000` |
| `--fac-offset-x` | Distance from the left or right edge (desktop) | `24px` |
| `--fac-offset-y` | Distance from the bottom | `24px` (phones: `12px` or the safe area) |
| `--fac-focus-ring` | Focus outline color | the accent color |

Colors come from the Agent's accent color and template; use
`data-accent="inherit"` with `data-accent-css-var` to take the accent from a
host CSS variable.

## Style Templates

The widget ships with twelve visual themes:

| Template     | Description                            |
| ------------ | -------------------------------------- |
| `clean`      | Balanced cards and a connected compact composer |
| `glass`      | Left-aligned welcome, quiet light cards, and an expanding composer |
| `bold`       | Large typography and stacked action rows |
| `neo-brutal` | Hard corners, thick borders, and offset shadows |
| `noir`       | Editorial rows on warm paper or a near-black night surface |
| `aurora`     | Colorful gradients, organic corners, and luminous depth |
| `control-plane` | Dense command rows for operational product surfaces |
| `minimal`    | Text-led links with almost no chrome   |
| `x-dark`     | Black social surface with outline chips |
| `imessage`   | Centered contact treatment and suggestion pills |
| `openai`     | Quiet neutral prompt cards and a floating composer |
| `solar`      | Warm cream daylight and solarized night palettes |

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

In Filament, open **Agents** and confirm that the Agent is active with one verified live Agent deployment. Then run the **Use as public widget** row action and add the component to your Blade layout or page:

```blade
<x-filament-agentic-chatbot::chat-widget />
```

The component resolves bots in this order:

1. An explicit component prop, such as `bot-public-id="YOUR_BOT_PUBLIC_ID"`
2. The bot marked **Public Widget** in the Bots table
3. `AGENTIC_CHATBOT_WIDGET_BOT_PUBLIC_ID`
4. The first runnable bot

At every level, runnable means that the Agent is active and its live deployment passes immutable artifact and dependency-closure verification. An invalid explicit or configured ID fails closed. A marked but unrunnable or multiply marked selection also fails closed instead of silently exposing a different Agent.

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
    data-empty-state-hint="Choose a topic or ask freely."
    data-compact="false"
    data-size-preset="comfortable"
    data-font-preset="modern-sans"
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
| `data-subtitle-mode` | `hidden` omits the subtitle; generated snippets use `custom` with the resolved text otherwise |
| `data-welcome` | Welcome message |
| `data-empty-state-hint` | Short guidance below the empty-state heading |
| `data-compact` | `true` or `false` |
| `data-size-preset` | `compact`, `comfortable`, or `spacious` |
| `data-font-preset` | `modern-sans`, `humanist-sans`, `friendly-rounded`, `editorial-serif`, or `technical-mono` |
| `data-show-sources` | `true` or `false` |
| `data-lang` | UI language code such as `en`, `de`, `fr`, or `es` |
| `data-context-endpoint` | Authenticated host endpoint returning a short-lived signed customer-context token |

The `data-*` attributes apply until the widget has loaded the Agent's configuration; the configuration then sets the texts, language, avatar and theme. Generated snippets carry only the texts you wrote.

### Option 3: NPM Package (for SPAs)

Install the helper package:

```bash
npm install @heiner/filament-agentic-chatbot-widget
```

Then mount it in your JavaScript:

```js
import { mountFilamentAgenticChatbotWidget } from "@heiner/filament-agentic-chatbot-widget";

const widget = mountFilamentAgenticChatbotWidget({
    botId: "YOUR_BOT_PUBLIC_ID",
    scriptUrl: "https://your-app.com/filament-agentic-chatbot/widget",
    apiBase: "https://your-app.com",
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

await widget.ready;
await widget.open();
```

The typed, framework-free SDK creates the script element, waits for the runtime, and returns one idempotent lifecycle handle per Agent. It exposes `open()`, `close()`, `toggle()`, `getState()`, `refreshConfig()`, `refreshContext()`, `startNewConversation()`, `sendSuggestedMessage()`, `updateDisplayContext()`, `on()`, and `destroy()`. Lifecycle events never include embed tokens, signed context tokens, conversation credentials, capability inputs, or provider results.

### Available NPM Options

| Option             | Type                  | Description                                |
| ------------------ | --------------------- | ------------------------------------------ |
| `botId`            | string                | **Required.** Bot public ID                |
| `scriptUrl`        | string                | URL to the widget script endpoint          |
| `apiBase`          | string                | Your Laravel app's base URL                |
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
| `showSources`      | boolean               | Show retrieved source cards                |
| `lang`             | string                | UI language code                           |
| `contextEndpoint`  | string                | Authenticated endpoint that returns a signed customer-context issuance |
| `contextTokenProvider` | function           | Async/sync token provider for an existing application API client |
| `contextToken`     | string                | Initial short-lived context token; cannot renew itself |
| `readyTimeoutMs`   | number                | SDK readiness timeout (1–60 seconds) |
| `displayContext`   | object \| null         | Initial visitor-visible, untrusted page context |

### Host actions and public lifecycle events

`sendSuggestedMessage(text, { open?: boolean })` sends bounded text through the same persistent chat endpoint, idempotency ledger, deployment, capability, and recovery boundaries as composer input. It does not create a second command path. The method fails explicitly for invalid text or an unavailable/busy widget.

`updateDisplayContext(context)` lets an SPA describe the page currently visible to the visitor. The context requires a short label and may include an absolute HTTP(S) URL plus at most 16 scalar attributes. URL query strings, fragments, and credentials are removed; secret-like keys, nested values, control characters, oversized fields, and payloads over 4 KiB are rejected. The normalized label is visibly rendered above the composer and can be cleared by the visitor.

Display context is **not signed authority**. It is encrypted with the durable turn, included in the turn's idempotency hash, and appended only to the model prompt inside an explicit untrusted-data boundary. The literal user message remains unchanged. Display context is never copied into workflow runtime variables, capability binders, actor/tenant identity, or authorization. Use signed customer and tenant context for server-attested identity and scope.

The SDK supports `outcome`, `capability`, and `handoff` in addition to the basic widget lifecycle events. The server freezes a minimal lifecycle projection into the committed turn so JSON, SSE, turn polling, and replay return the same evidence. The runtime deduplicates outcomes per turn, capabilities per opaque event ID, and handoffs per public state transition for the lifetime of the mounted conversation. These payloads expose only public turn status, declared business outcome data, generic capability kind/status, and the existing safe handoff projection. They never expose internal IDs, exact capability keys, inputs/results, secrets, operator identity, notes, or SLA data.

For new Knowledge capability events, status describes the search operation,
not answer quality or evidence delivery. Retrieval `success`, `empty`,
`insufficient_evidence` and `degraded` map to `succeeded`; `unavailable` and
`failed` map to `failed`. Missing or unrecognized diagnostics map to `unknown`.
A completed search can therefore succeed even when no context was delivered.
Private retrieval counts and failure details are never part of the event.
Previously committed lifecycle envelopes keep their original status and event
identity during replay.

## Event Stream And Failure Behavior

The final answer, retrieved source cards, and canonical operation status are
committed before delivery. JSON responses, SSE completion, authenticated turn
status, and reloaded history show that same outcome. A source card may have no
public URL; the widget displays its label without inventing a link. Cards
identify material delivered by an authorized read, including API, Data
Resource, and Knowledge results. They do not prove each sentence of the
assistant's prose. Operation completion, failure, and unknown status come from
the stored execution and Graph or Gateway state, never from that prose.

Streaming admission persists the turn and queues its execution before emitting `init` and `turn_accepted`. While the worker runs the turn, the same response relays the answer as it is written (ADR 0042):

| Event | Meaning |
| ----- | ------- |
| `delta` | Text appended to the current draft. |
| `draft_reset` | The draft is discarded (a tool step, a retry, or a blocking output check rejected it). |
| `draft_status` | A tool step started: `knowledge`, `lookup` or `action`; the widget shows a short translated label such as "Searching knowledge…". |
| `activity` | Persisted turn progress, as in turn polling. |

When the turn is committed while the response is open, the response sends the stored outcome (`activity`, then `message_complete` or `error`) exactly as a repeated request would, then `data: [DONE]`. After 15 seconds without an event the response sends an SSE comment (`: keep-alive`), so proxies keep it open and a disconnected client ends the request. When the client disconnects or `api.chat_stream.relay_seconds` (`AGENTIC_CHATBOT_CHAT_STREAM_RELAY_SECONDS`, default 100, capped at the PHP limit minus 10 seconds; 0 disables streaming) is used up first, the response ends with `data: [DONE]` and the widget reads the committed outcome from the authorized turn projection. The committed message replaces the draft; a draft is never kept beside or instead of the committed message, and a failed turn shows its error instead of the draft. A disconnect, reload or repeated request falls back to turn polling and history reconciliation without running the turn again. A repeated request for a completed turn delivers its canonical `message_complete` or `error` event without executing it again.

Drafts are presentation only. They are held in the cache store (`api.chat_stream.cache_store`, `AGENTIC_CHATBOT_CHAT_STREAM_CACHE_STORE`, default store), which web and queue processes must share; with a per-process store such as `array` the widget simply shows the committed answer. Before any draft text is sent, the output checks (standard profile and the Agent's Safety settings) accept the whole text written so far, masked personal data is shown masked, and the newest word plus 24 bytes are held back. A rejected draft is cleared and the committed answer carries the Agent's fallback message. After a Playbook step in a turn, only the committed answer is shown. The SSE request stays open while its turn runs and holds one PHP worker until then: size PHP-FPM workers for concurrent chats. A single-process server (`php artisan serve` or `php -S` without `PHP_CLI_SERVER_WORKERS`) still delivers the answer, but other requests wait until the turn ends; set `relay_seconds` to 0 there.

The terminal `message_complete` or `error` projection may contain the frozen `public_chat_turn_lifecycle.v1` envelope consumed by the SDK. It is transport-neutral and replay-stable.

Execution failures follow the authoritative turn and AgentGraph lifecycle. An uncertain external effect remains unknown for reconciliation; a transport error cannot mark it failed or authorize another dispatch. Terminal failures expose a safe error code and message through the committed projection. JSON `/complete` integrations use the same outcome contracts. Stack traces, provider secrets, and raw technical exception messages stay out of widget responses.

The stream encoder substitutes invalid UTF-8 before sending JSON events. If encoding still fails, the client receives a safe error event with code `stream_encoding_failed` instead of malformed SSE data.

The server reports progress as `chat_turn_progress.v2`. Authorized turn
status and completed JSON include safe `progress.activity`; committed SSE sends
an `activity` event before the final message/error. Consumers must close active
indicators when `activity.active` is false or the canonical turn is terminal,
including waiting, failure, cancellation and unknown outcome. The final answer
arrives directly in that response. `truncated` indicates omitted intermediate
events. Only public identity/category/status/time fields are delivered; counters,
native IDs, reasons and receipt references stay in the authorized admin debugger.
The widget reads v2 and the earlier v1 stages.

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

### Signed Customer And Tenant Context

Never trust a customer ID, tenant ID, plan, cart ID, or other authority value sent as ordinary JSON or a `data-*` attribute. For personalized Agents, issue a short-lived signed context from a host-owned authenticated endpoint:

```php
use Heiner\FilamentAgenticChatbot\Models\Bot;
use Heiner\FilamentAgenticChatbot\Support\WidgetContextToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/api/chatbot/customer-context', function (Request $request) {
    $user = $request->user() ?? abort(401);
    $bot = Bot::query()->where('public_id', $request->string('bot'))->firstOrFail();
    $origin = $request->header('Origin') ?: 'https://shop.example.com';
    $area = (string) $request->string('area', 'member');

    $issuance = WidgetContextToken::issueForBot(
        bot: $bot,
        origin: $origin,
        area: $area,
        actor: $user,
        tenant: ['type' => 'store', 'id' => (string) $user->store_id],
        attributes: [
            'plan' => (string) $user->plan,
            'cart_id' => (string) $user->active_cart_id,
        ],
    ) ?? abort(503);

    return response()->json($issuance->toArray())->withHeaders([
        'Cache-Control' => 'no-store, private',
        'Pragma' => 'no-cache',
    ]);
})->middleware('auth');
```

The endpoint must derive identity from its authenticated server session, enforce the requested Agent/area/tenant itself, and return `Cache-Control: no-store`. The token is signed, not encrypted: never include passwords, API keys, bearer tokens, secrets, or data that the browser must not read. The issuer rejects sensitive attribute names, unsafe keys, excessive nesting, more than 64 scalar attributes, strings over 1,000 characters, and payloads over the configured byte limit.

Mount the SDK with exactly one renewable source:

```js
const widget = mountFilamentAgenticChatbotWidget({
    botId: "YOUR_BOT_PUBLIC_ID",
    area: "member",
    contextEndpoint: "/api/chatbot/customer-context",
});
```

The widget calls this endpoint with `bot` and `area` query parameters, includes host cookies, disables caching, keeps the returned token in memory, and sends it only in `X-Filament-Agentic-Chatbot-Context`. The backend verifies the HMAC, token version, Agent, area, exact origin, issue time, and expiry before it creates or opens a conversation. Signed actor and tenant identity bind conversation ownership and deterministic data scopes; attributes are available as the reserved `__widget_context` workflow value and `widget_context` authority scope. Ordinary request input with the same names is stripped and cannot create authority.

Context can authenticate a non-public area only when it contains an actor type and ID and `AGENTIC_CHATBOT_WIDGET_CONTEXT_AUTHORIZES_NON_PUBLIC_AREAS=true`. The issuing endpoint is therefore the authorization boundary. Set `AGENTIC_CHATBOT_WIDGET_CONTEXT_REQUIRED_AREAS=member,checkout` when an area must never fall back to anonymous operation.

On login, logout, tenant switch, or another identity change, call `await widget.refreshContext()`. It starts a new conversation by default so two identities cannot share a conversation. Pass `{ startNewConversation: false }` only for renewal where the attested identity is guaranteed unchanged. Automatic renewal retries safe reads only; it never replays session creation, a chat send, form/feedback writes, or deletion.

| Env Variable | Description | Default |
| --- | --- | --- |
| `AGENTIC_CHATBOT_WIDGET_CONTEXT_ENABLED` | Accept and issue signed widget context | `true` |
| `AGENTIC_CHATBOT_WIDGET_CONTEXT_SIGNING_KEY` | Optional dedicated HMAC key | falls back to `AGENTIC_CHATBOT_WIDGET_SIGNING_KEY`, then `APP_KEY` |
| `AGENTIC_CHATBOT_WIDGET_CONTEXT_TTL_MINUTES` | Context lifetime (clamped to 1–60 minutes) | production `10`; otherwise `60` |
| `AGENTIC_CHATBOT_WIDGET_CONTEXT_REFRESH_BEFORE_SECONDS` | Renewal lead time | `120` |
| `AGENTIC_CHATBOT_WIDGET_CONTEXT_REQUIRED_AREAS` | Comma-separated areas that require signed context | empty |
| `AGENTIC_CHATBOT_WIDGET_CONTEXT_AUTHORIZES_NON_PUBLIC_AREAS` | Treat a signed actor as authentication for its exact area | `true` |
| `AGENTIC_CHATBOT_WIDGET_CONTEXT_MAX_PAYLOAD_BYTES` | Maximum decoded token payload | `4096` |

The context-signing key is optional by design: existing installs can use the current widget-signing key without adding another secret. A dedicated key is useful only when operators want independent rotation. Rotate all current context tokens for one Agent by incrementing `runtime_config.widget.context_token_version`; when absent, it follows the existing widget token version.

### Conversation Credentials

After obtaining widget access, the shipped loader calls `POST /api/filament-agentic-chatbot/chat/{botPublicId}/session`. The server returns a random session ID plus a separate high-entropy conversation credential over a `Cache-Control: no-store` response. The widget persists the pair locally and sends the credential only in the `X-Filament-Agentic-Chatbot-Conversation-Credential` header.

Only a SHA-256 hash of the credential is stored in `bot_conversations.meta`. The session ID remains a lookup key and may appear in history/turn URLs, but it is not sufficient to read, export, mutate, or delete an anonymous production conversation. A stale or invalid locally saved pair is discarded and safely bootstrapped again; write requests are not replayed by that recovery path. Authenticated area users, scoped Agent Access Tokens, and channel identities continue to use their stronger existing authority bindings.

### New Chat And History Deletion

Widget initialization and history requests have a 15-second deadline, including response-body loading. A stalled request shows the localized loading error and an explicit retry action. Late responses cannot update a newer session or its history. Host context-provider callbacks receive an optional `signal` for cancellation. Productive chat turns and external operations retain their own runtime deadlines; initialization recovery never replays a productive write.

The shipped widget exposes **Start new chat** directly in the header and **Delete history and memory** in the **Chat options** disclosure beside it. Escape dismisses the disclosure first and returns focus to its control; pressing Escape again closes the chat. Moving focus or clicking outside the disclosure also dismisses it. Starting a new chat rotates the local conversation session and credential without calling the deletion endpoint; it remains available while the previous turn or Playbook is still running, waiting, or being reconciled. Stale responses from the previous session cannot rebind or update the new chat.

History deletion remains an explicit, confirmed operation. A successful deletion immediately opens a fresh chat. If the lifecycle guard refuses deletion, the widget localizes the typed reason, keeps the old chat intact, and offers only safe recovery actions: retry when the response is retryable, or start a separate new chat while the prior conversation remains available for resolution or support.

History also preserves committed turn failures when no assistant message was
created. The existing visible user or assistant message carries a bounded
`terminal_error` projection; message IDs and pagination remain unchanged. Reload
uses the same localized error presentation and retry policy as the original
response. A safe explicit retry creates a new turn, while an unknown external
outcome still cannot retry. Attachment summaries cannot reconstruct browser
uploads, so reload does not offer an automatic retry that would drop files.
Reading history never creates messages, recovers a turn, or exposes exception
details and operator diagnostics.

After a failed send, empty or unchanged history and a saved user message without
an outcome preserve the local question and visible error. Bounded history checks
can replace that error with a committed assistant response or terminal failure
that arrives after the transport failed. These checks never resend the turn.
A stream that closes without a usable response follows the same visible error
path. The composer waits for reconciliation to finish before another send, while
starting a new chat excludes the previous send's late history and error updates.

### Human Handoff Continuity

When a conversation enters the Handoff Desk, the history response exposes only
a safe projection: whether takeover is active, its public status, who the
visitor is waiting for, the last update time, and the server-selected polling
interval. Operator identities, internal notes, SLA details, and assignment data
never enter the browser payload.

The widget remains messageable during takeover. It replaces the composer hint
with localized support copy, stores each visitor message normally, and polls
history only while the handoff is active so customer-visible human replies
appear in the same thread without a reload. The Agent/model path stays paused
until an operator resolves the case or explicitly returns control. Polling is
cancelled when the panel/session is reset and is not used for inactive chats.

### Domain Allowlists

Each bot can define a list of allowed domains. If set, the widget's CORS middleware only responds to requests from those domains. Wildcard subdomains are supported (e.g., `*.example.com`).

Empty allowlists are still allowed by default through `AGENTIC_CHATBOT_WIDGET_ALLOW_ALL_DOMAINS=true` for older installs. Treat that as a compatibility bridge, not a production target. Set `AGENTIC_CHATBOT_WIDGET_ALLOW_ALL_DOMAINS=false` and list the exact hosts before public rollout.

### Context Areas And Access Rules

| Area     | Behavior                                                            |
| -------- | ------------------------------------------------------------------- |
| `public` | No authentication required                                          |
| `member` | Requires an authenticated host user or an exact-area signed actor context |
| `admin`  | Requires the configured host authorization; enable signed-context issuance only from an equally protected endpoint |

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

Visitor texts (`name`, `subtitle`, `welcome_message`, `empty_state_hint`,
`input_placeholder`) are `null` when no text was written; the widget then shows
its translated default. `subtitle_mode` is `standard`, `custom` or `hidden`.
`widget_language` is the Agent's widget language and `languages` the languages
of its live version (empty without one).

## Content Security Policy

Same-origin embedding avoids cross-origin complexity, but it does not automatically bypass CSP.

- The widget is loaded through a script tag.
- The widget calls the chat API with `fetch()`.
- The widget script injects its own `<style>` tag for the UI.

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

Use the widget for browser embeds. Use Agent Access Tokens and the JSON complete endpoint for trusted server-side API clients, Telegram bots, Slack apps, or incident-management systems.

See [API Integrations](API_INTEGRATIONS.md) for the server-side request contract and webhook examples.

## Feedback And Session Controls

- Assistant messages expose helpful / not-helpful feedback buttons with optional note capture.
- Session history can be loaded back into the widget for returning users.
- Privacy workflows can export or delete a session through the chat API endpoints.
- Review feedback, citation coverage, and knowledge gaps from the bot's Analytics page inside Filament.

## Testing The Widget

The Agent's **Website** tab includes an appearance preview with sample messages.
It does not send a message or provide release-test evidence. Use the Agent's
**Test** area to check a selected version or candidate. To verify an external
installation, put the displayed script tag on an allowed host and send a
question there; this may call the configured provider and approved reads. The
admin page continues to report installation as unverified until an operator
checks it manually.

## Widget Script Source

The served script is the committed build `resources/dist/widget.js`; installing
the package needs no Node. `WidgetScriptController` fills in the package
defaults and the widget texts of every language and serves it at the
configured script route with an ETag (immutable caching for `?v=` URLs).
The sources are `resources/js/widget/src/*.js`; they share one closure and are
concatenated in a fixed order. After a change run
`node resources/js/widget/build.mjs` and commit the build;
`tests/widget/build.test.mjs` and `WidgetScriptTest` (when Node is installed)
fail when the build is out of date.

## Related Docs

- [Bots](BOTS.md)
- [Context Areas](CONTEXT_AREAS.md)
- [API Integrations](API_INTEGRATIONS.md)
- [Security And Privacy](SECURITY_AND_PRIVACY.md)

### Tool activity display

Enable **Show tool activity** in the existing Agent widget appearance settings,
or in a widget area override. The package default is
`widget.default_show_tool_activity` (`WIDGET_DEFAULT_SHOW_TOOL_ACTIVITY`), default
`false`. Bot `runtime_config.widget.show_tool_activity` overrides that default;
a selected non-default area's explicit value overrides the Bot, including
`false`. This follows the existing source-reference configuration pattern.
`data-show-tool-activity` and SDK `showToolActivity` supply the initial embed
value; the authoritative fetched Bot/area configuration then replaces it.
Appearance previews use the same setting. Existing defaults are unchanged.

When enabled, the public widget shows safe names and statuses grouped by
activity identity, distinguishes Capability execution from Tool handler, and
marks a partial history. Handler success alone does not prove external execution.
Names are escaped text. No arguments, private reasons, native IDs, receipt
references or model reasoning become public through this setting. Turning the
setting off hides the timeline without changing execution or answer delivery.

Canonical completion closes activity even when terminal telemetry is missing.
Later GET or SSE progress for the same turn cannot reopen a completed display,
including an equal or higher progress sequence. A new turn can show its own
progress. The queued, model, review and Capability phases use fixed localized
labels. The activity list is not announced on every event; the concise pending
status is announced politely. Failed and unknown outcomes use fixed public
guidance without exposing private cause codes.
Unfinished observations become “Outcome unknown” when their activity closes;
the widget does not invent success. Completed responses appear automatically.
Authenticated GET polling/history reconciliation recover interrupted delivery;
**Check status** remains a recovery action and never starts another execution.
Long-running recovery and graph waiting do not show a perpetual animated dot.
Legacy transcripts do not acquire reconstructed tool history.

The RC-05 operator diagnosis is a separate protected display. After an
authenticated operator obtains a conversation grant with both required Gates,
the SDK accepts it through `setDiagnosticAccess`; saved assistant messages
then expose a keyboard-operable `Diagnosis` disclosure and a read-only,
redacted export. The grant stays in memory, expires, and is cleared on new
chat; it must be reissued after reload. Each snapshot rechecks operator,
conversation, message and Bot scope. Without a grant, no diagnostic control
appears. Public tool activity never exposes arguments, private causes or
receipts. The controlled SDK/Widget fixtures verify these display boundaries;
real host and user acceptance remain pending.
