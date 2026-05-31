# Release Notes: v0.9.2

`v0.9.2` is the recommended next beta patch release for the current commercial-ready package line.

## Highlights

- **Workflow runtime hardening**: duplicate workflow-start races are blocked, stale running executions can be reclaimed, and runtime SSRF protection now closes the private-DNS rebinding gap.
- **Trace privacy improvements**: sensitive values are redacted from workflow traces and final persisted workflow variable snapshots.
- **Workflow editor regression fix**: passive inspection no longer marks drafts dirty or triggers autosave without semantic edits.
- **Fresh-install smoke reliability**: the Windows and shell smoke installers were updated for Composer 2.2+, current PowerShell behavior, and Filament panel-provider fallback generation.

## Upgrade from v0.9.1

1. Update your `composer.json` constraint to `^0.9.2`.
2. Run `composer update heiner/filament-agentic-chatbot`.
3. Run `php artisan migrate`.
4. Run `php artisan filament-agentic-chatbot:doctor`.
5. Clear Laravel caches in deployed hosts if needed: `php artisan optimize:clear`.

No new manual config migration is required beyond adopting any optional new runtime hardening env flags you want to use.

## Notes

- This remains part of the beta `0.9.x` line.
- `pgvector` remains the recommended production vector backend.
- The package is still tested against `laravel/ai` `~0.1.5`.

## Links

- Full changelog: [CHANGELOG.md](CHANGELOG.md)
- Upgrade guide: [UPGRADING.md](UPGRADING.md)
- Known limitations: [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md)
- Previous release: [RELEASE_NOTES_v0.9.1.md](RELEASE_NOTES_v0.9.1.md)