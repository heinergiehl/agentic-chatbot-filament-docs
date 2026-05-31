# Release Notes: v0.9.1

`v0.9.1` is a maintenance and polish release in the `0.9.x` beta line.

## Highlights

- **Buyer-facing operational guide** — `OPERATIONS.md` now ships with the plugin, covering queue worker setup, the `doctor` command, cache recovery, and a go-live checklist.
- **Expanded docs screenshots** — twelve screenshots covering the workflow canvas, AI Draft tab, Runs tab, Releases tab, and API Connectors list replace the original six.
- **Cleaner package surface** — internal demo commands removed from the service provider; workflow editor build is decoupled from any hardcoded demo-repo path.
- **Bug fixes** — `WorkflowJsonValidator::catalog()` and `PackageMigration::ensureTablesExist()` correctness fixes (see CHANGELOG for details).

## Upgrade from v0.9.0-beta.1

1. Update your `composer.json` constraint to `^0.9.1` (or `>=0.9.0-beta.1`).
2. Run `composer update heiner/filament-agentic-chatbot`.
3. Run `php artisan filament-agentic-chatbot:doctor`.
4. Run `php artisan migrate`.
5. Clear Laravel caches if the host app is deployed: `php artisan optimize:clear`.

No new migrations are required for this release. No configuration keys changed.

## Public Beta Notes

- This is still a beta release line. No stable `v1.0` release exists yet.
- The package is tested against `laravel/ai` `^0.1.5`.
- `pgvector` remains the recommended production vector backend.

## Links

- Full changelog: [CHANGELOG.md](CHANGELOG.md)
- Upgrade guide: [UPGRADING.md](UPGRADING.md)
- Known limitations: [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md)
- Previous release: [RELEASE_NOTES_v0.9.0-beta.1.md](RELEASE_NOTES_v0.9.0-beta.1.md)
