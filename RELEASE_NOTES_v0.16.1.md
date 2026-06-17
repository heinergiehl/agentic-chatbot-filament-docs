# Release Notes: v0.16.1

`v0.16.1` is a focused patch release for the v0.16 workflow runtime.

## Fixed

- Default/plain `sendMessage` workflow nodes now reset inherited internal visibility and are treated as visible user-facing messages unless a node explicitly sets `internal` or `final`.
- This fixes legacy and schema-v1 active workflows where an internal action, tool, or AgentGraph-backed step computed the correct final variable, but the public chat response fell back to the generic workflow-configuration error because the final message still looked internal.

## Upgrade from v0.16.0

1. Update the package constraint to `^0.16.1` or to the exact marketplace version you receive.
2. Run `composer update heiner/filament-agentic-chatbot --with-dependencies`.
3. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
4. Run `php artisan filament-agentic-chatbot:doctor`.
5. Smoke-test one active workflow that sends a default/plain `sendMessage` after an internal action, tool, or AgentGraph-backed step.

No new migration is required when upgrading from `v0.16.0`.

## Links

- Full changelog: [CHANGELOG.md](CHANGELOG.md)
- Previous release: [RELEASE_NOTES_v0.16.0.md](RELEASE_NOTES_v0.16.0.md)
