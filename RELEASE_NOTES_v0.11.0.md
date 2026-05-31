# Release Notes: v0.11.0

`v0.11.0` is a commercial early-access channel and workflow-memory release. It adds package-owned Telegram and Slack channel integrations, production channel delivery hardening, native image delivery for channel workflows, and a simpler memory surface for everyday agentic workflows.

## Highlights

- **Telegram and Slack channels**: receive provider webhooks, map provider threads to package conversations, run the same bot/workflow runtime as the widget, and send replies through package-owned drivers.
- **Channel admin resources**: configure provider credentials, linked Bot Access Tokens, webhook URLs, presentation settings, diagnostics, test sends, Telegram webhook setup, and Telegram commands from Filament.
- **Text-first rich-message rendering**: workflow/widget output is normalized into channel-safe text, buttons, cards, sources, images, and HTML, with optional Telegram inline keyboards and Slack Block Kit where explicitly enabled.
- **Channel workflow compatibility checks**: active workflows are inspected against Telegram and Slack capabilities with explicit adaptation, truncation, and dynamic-output warnings.
- **Production delivery hardening**: inbound event claiming, provider event deduplication, retry-after aware outbound retries, long-message splitting, webhook verification, raw payload redaction, and separate webhook ingress rate limiting.
- **Activity indicators**: Telegram native typing with optional heartbeat pulses and Slack placeholder messages that update into final replies when possible.
- **Native channel image delivery**: Telegram can send workflow `imageUrl` / `imageArtifact` output through `sendPhoto`; Slack can render public image URLs or upload stored image artifacts.
- **Scoped workflow memory**: workflow memory now supports conversation, workflow-run, session, actor, and bot scopes, with editor defaults focused on the simple `conversation` and `workflow_run` choices.

## Upgrade from v0.10.0

1. Update your package constraint to allow `^0.11.0`.
2. Run `composer update heiner/filament-agentic-chatbot --with-dependencies`.
3. Run `php artisan migrate`.
4. If you published the package config, merge the new `channels` and workflow image transport configuration keys.
5. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
6. If Filament assets are cached in your deployment process, run `php artisan filament:assets`.
7. Run `php artisan filament-agentic-chatbot:doctor`.
8. For Telegram or Slack, create one Bot Access Token per channel, create a Channel connection, configure a public HTTPS webhook URL, and run channel diagnostics before production traffic.

## Database Changes

This release adds migrations for:

- `channel_connections`
- `channel_threads`
- `channel_delivery_events`
- `workflow_memories`
- Workflow memory scope hardening and actor-memory bot isolation

Existing installs should run migrations normally. Channel records are optional and only used when Telegram or Slack connections are configured.

## Notes

- The web widget remains the default browser chat surface. Telegram and Slack are additional realtime entry points over the same bot, workflow, conversation, usage, and budget runtime.
- Bot Access Tokens remain the product governance layer for channel traffic. Create separate tokens for Telegram, Slack, backend jobs, and other integrations when you need separate abilities, areas, budgets, or rate limits.
- Production channel installs should use an async queue worker. Telegram typing heartbeats and Slack placeholder behavior are designed for queued webhook processing.
- Webhook verification is enforced by default in production when channel verification is enabled. Telegram uses `webhook_secret`; Slack uses `signing_secret`.
- Workflow memory is intentionally simple by default. Use `conversation` for chat state and `workflow_run` for one-run scratch state. Broader `session`, `actor`, and `bot` scopes remain available for advanced imported/API-defined workflows.
- `memoryType: "semantic"` is metadata only in this release; it does not create vector-search memory by itself.

## Links

- Full changelog: [CHANGELOG.md](CHANGELOG.md)
- Upgrade guide: [UPGRADING.md](UPGRADING.md)
- Channel integrations: [CHANNELS.md](CHANNELS.md)
- API integrations: [API_INTEGRATIONS.md](API_INTEGRATIONS.md)
- Workflow JSON schema: [WORKFLOW_JSON_SCHEMA.md](WORKFLOW_JSON_SCHEMA.md)
- Known limitations: [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md)
- Previous release: [RELEASE_NOTES_v0.10.0.md](RELEASE_NOTES_v0.10.0.md)
