# Chat Widget

The chat widget is the embeddable UI layer for a bot.

## What The Widget Does

It gives end users a chat interface that connects to your configured bot through your Laravel app.

The widget does not contain the knowledge base by itself. It is the frontend for the bot, sources, retrieval, and conversation storage already configured in Filament.

## What You Can Customize

Per bot, you can customize:

- title
- subtitle
- welcome message
- quick prompts
- accent color
- template
- compact mode
- response format

## How To Embed It

### Script Tag

```html
<script
  src="https://your-app.com/filament-agentic-chatbot/widget.js"
  data-bot="YOUR_BOT_PUBLIC_ID"
  data-token="SIGNED_TOKEN"
  defer
></script>
```

### NPM Loader

Use the NPM package when you want tighter control in React, Vue, or another SPA frontend.

## Widget Security

The widget supports:

- signed tokens
- per-bot domain allowlists
- area-based access rules
- rate limiting

That means you can expose a public bot on a website while still keeping internal bots restricted.

## Public vs Internal Widgets

### Public Widget

Best for:

- marketing site questions
- public docs
- onboarding help

### Internal Widget

Best for:

- admin support
- back-office workflows
- authenticated internal knowledge

## Related Docs

- [Bots](/docs/bots)
- [Context Areas](/docs/context-areas)
- [Security and Privacy](/docs/security-and-privacy)
