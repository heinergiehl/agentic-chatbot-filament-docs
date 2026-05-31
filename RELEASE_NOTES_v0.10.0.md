# Release Notes: v0.10.0

`v0.10.0` is a commercial early-access enterprise integration release. It focuses on server-side chatbot API access, token and cost controls, OpenAI-compatible provider gateways, localization, and patterns for operational systems that combine indexed RAG with live workflow retrieval.

## Highlights

- **JSON complete endpoint**: trusted backends can call a bot directly and receive a stable JSON response with rendered content, message metadata, workflow status, and conversation IDs.
- **Scoped Bot Access Tokens**: create server-side credentials per integration with bot, area, ability, expiration, active/revoked state, rotation, and one-time secret display.
- **Per-token controls**: apply per-token rate limits, max input/output token limits, monthly token budgets, and monthly estimated cost budgets.
- **Channel and owner metadata**: classify tokens by channel such as API, Telegram, Slack, mobile, or backend job, and optionally attach token ownership to app models without adding a package-owned user or tenant system.
- **AI usage dashboards**: inspect raw usage events, usage by model, usage by channel, per-bot usage trends, token budgets, and estimated cost when provider pricing is configured.
- **OpenAI-compatible providers**: configure custom base URLs for Qwen/DashScope compatible mode, DeepSeek/OpenAI-compatible endpoints, private gateways, and local OpenAI-compatible proxies.
- **Incident-management blueprint**: new docs and runnable app-side examples show how to combine knowledge sources, data resources, API connectors, workflows, and scoped API tokens for large operational datasets.
- **Localization pass**: Filament resources, dashboard widgets, workflow editor UI, notifications, labels, helper text, and many admin strings now route through Laravel or React translation files.
- **Enterprise smoke command**: `filament-agentic-chatbot:qa-enterprise-smoke` validates scoped tokens, JSON complete calls, input-budget blocking, rate-limit failures, and OpenAI-compatible provider aliasing.

## Upgrade from v0.9.8

1. Update your package constraint to allow `^0.10.0`.
2. Run `composer update heiner/filament-agentic-chatbot --with-dependencies`.
3. Run `php artisan migrate`.
4. If you published the package config, merge the new `bot_access_tokens`, `openai_compatible`, and usage configuration keys.
5. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
6. If Filament assets are cached in your deployment process, run `php artisan filament:assets`.
7. Run `php artisan filament-agentic-chatbot:doctor`.
8. For API integrations, optionally run `php artisan filament-agentic-chatbot:qa-enterprise-smoke --host=your-app.test`.

## Database Changes

This release adds migrations for:

- `bot_access_tokens`
- Bot Access Token request and monthly budget columns
- Bot Access Token revocation state
- Bot Access Token optional owner/creator and channel metadata
- `bot_usage_events`

Existing installs should run migrations normally. The ownership fields are optional metadata; the package does not create users, teams, tenants, memberships, or authorization policies.

## Notes

- Bot Access Tokens are Laravel chatbot API credentials. They are not Telegram or Slack provider tokens. External channel secrets remain in your app config or secret manager.
- Channel metadata is used for reporting and filtering only.
- Owner metadata is optional and intended to link tokens to models from the host application.
- Tenant isolation is not shipped as a package-owned tenant system. Apps that need tenant isolation should keep tenancy in the host Laravel/Filament app.
- Estimated cost dashboards require provider pricing entries under `filament-agentic-chatbot.usage.pricing`.
- For OpenAI-compatible gateways, set the bot provider to `openai_compatible` and provide a custom base URL on the bot or through `AGENTIC_CHATBOT_OPENAI_COMPATIBLE_BASE_URL`.

## Links

- Full changelog: [CHANGELOG.md](CHANGELOG.md)
- Upgrade guide: [UPGRADING.md](UPGRADING.md)
- API integrations: [API_INTEGRATIONS.md](API_INTEGRATIONS.md)
- OpenAI-compatible providers: [OPENAI_COMPATIBLE_PROVIDERS.md](OPENAI_COMPATIBLE_PROVIDERS.md)
- Incident management blueprint: [INCIDENT_MANAGEMENT_BLUEPRINT.md](INCIDENT_MANAGEMENT_BLUEPRINT.md)
- Known limitations: [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md)
- Previous release: [RELEASE_NOTES_v0.9.8.md](RELEASE_NOTES_v0.9.8.md)
