# Release Notes: v0.9.4

`v0.9.4` is a commercial early-access release in the `0.9.x` line, building on the stability and safety improvements shipped in v0.9.3 with a focused documentation quality pass and operator-experience improvements.

## Highlights

- **Documentation accuracy pass**: corrected hard inaccuracies across widget, API connector, and workflow schema docs — response format key, widget architecture (script tag, not iframe), theme count (11), and runtime behavior of temperature/maxTokens fields now all match the actual code.
- **Commercial Early Access messaging**: consistent Early Access positioning added to README, product overview, quickstart, and the plugin listing so buyers understand the pre-1.0 stage and know feedback is actively welcome.
- **Operator discoverability**: bot analytics, operator confidence tools, widget feedback, and dry-run/mapping-preview features are now documented and surface earlier in the operator flow.
- **Actionable empty states**: Conversations, Workflow Runs, and Submissions tables now show icons and navigation buttons that guide first-time operators to the next productive step instead of passive waiting messages.
- **Analytics drill-down**: knowledge-gap rows in bot analytics (Potential Knowledge Gaps widget) now link directly to the relevant conversation thread for immediate review.
- **CSP and same-origin guidance**: new documentation sections in the widget docs cover the same-Laravel-app embedding path, the widget's origin inference, and the interaction between the widget's `<style>` injection and strict Content Security Policies.

## Upgrade from v0.9.3

1. Update your `composer.json` constraint to `^0.9.4`.
2. Run `composer update heiner/filament-agentic-chatbot`.
3. Run `php artisan filament:assets`.
4. Run `php artisan filament-agentic-chatbot:doctor`.

No new database migrations are required for this release.

## Notes

- This remains part of the commercial early-access `0.9.x` line.
- `pgvector` remains the recommended production vector backend.
- The package is still tested against `laravel/ai` `~0.1.5`.
- `temperature` and `maxTokens` workflow fields are validated and stored but not yet applied per AI call at runtime — use bot/provider defaults for live behavior.

## Links

- Full changelog: [CHANGELOG.md](CHANGELOG.md)
- Upgrade guide: [UPGRADING.md](UPGRADING.md)
- Known limitations: [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md)
- Previous release: [RELEASE_NOTES_v0.9.3.md](RELEASE_NOTES_v0.9.3.md)
