# Release Notes: v0.9.5

`v0.9.5` is a commercial early-access release in the `0.9.x` line delivering a focused workflow editor UI polish pass on top of v0.9.4.

## Highlights

- **Stable canvas height**: the workflow editor canvas now always fills the available viewport height regardless of which sidebar tab is active. Switching between Nodes, AI Draft, Runs, Versions, and Test no longer causes layout shifts or changes the canvas size.
- **Consistent scrollbars**: the AI Draft and Test tabs now use the same slim custom scrollbar as the Runs tab, so all sidebar panels look and feel uniform.

## Upgrade from v0.9.4

1. Update your `composer.json` constraint to `^0.9.5`.
2. Run `composer update heiner/filament-agentic-chatbot`.
3. Run `php artisan filament:assets`.

No new database migrations are required for this release.

## Notes

- This remains part of the commercial early-access `0.9.x` line.
- `pgvector` remains the recommended production vector backend.
- The package is still tested against `laravel/ai` `~0.1.5`.

## Links

- Full changelog: [CHANGELOG.md](CHANGELOG.md)
- Upgrade guide: [UPGRADING.md](UPGRADING.md)
- Known limitations: [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md)
- Previous release: [RELEASE_NOTES_v0.9.4.md](RELEASE_NOTES_v0.9.4.md)
