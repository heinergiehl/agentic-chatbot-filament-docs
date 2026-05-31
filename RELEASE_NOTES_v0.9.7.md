# Release Notes: v0.9.7

`v0.9.7` is a commercial early-access compatibility release in the `0.9.x` line. It adds Laravel 13 support while keeping the Laravel 12 install path available.

## Highlights

- **Laravel 13 support**: package constraints now allow Laravel 12 or 13 hosts.
- **PHP 8.3+ support**: the package can resolve on PHP 8.3 and PHP 8.4 by allowing the matching Symfony HTML Sanitizer line.
- **Updated Laravel AI SDK**: `laravel/ai` is now constrained to `^0.6.7`.
- **CI coverage for both majors**: the package test matrix now pins and validates Laravel 12 and Laravel 13 dependency sets separately.

## Upgrade from v0.9.6

1. Update your `composer.json` constraint to `^0.9.7`.
2. Run `composer update heiner/filament-agentic-chatbot laravel/ai symfony/html-sanitizer --with-dependencies`.
3. Run `php artisan filament:assets`.
4. Run `php artisan filament-agentic-chatbot:doctor`.

No new database migrations are required for this release.

## Notes

- This remains part of the commercial early-access `0.9.x` line.
- Laravel 12 remains supported; customers do not need a separate legacy branch.
- Per-node AI `temperature` and `maxTokens` values are still stored for future SDK support; the current Laravel AI SDK runtime uses the linked bot/provider defaults for those options.

## Links

- Full changelog: [CHANGELOG.md](CHANGELOG.md)
- Upgrade guide: [UPGRADING.md](UPGRADING.md)
- Known limitations: [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md)
- Previous release: [RELEASE_NOTES_v0.9.6.md](RELEASE_NOTES_v0.9.6.md)
