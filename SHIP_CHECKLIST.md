# Ship Checklist

## Composer Package Availability

- [x] Publish `heiner/agent-graph` to Packagist, Private Packagist, or another Composer repository available to customers before shipping the Filament plugin.
- [x] Verify a fresh Laravel/Filament host app can install only `heiner/filament-agentic-chatbot` and receives `heiner/agent-graph` transitively without adding a custom root `repositories` entry.
- [x] Remove local development-only repository assumptions from release docs and demo setup notes.

## Release Gates

- [ ] `composer validate --strict`
- [ ] `vendor/bin/pint --test`
- [ ] `composer test`
- [ ] `composer stan`
- [ ] `composer release:marketplace-check`
- [ ] PostgreSQL/pgvector CI job passes.
- [ ] Widget E2E smoke is run against a configured preview host when widget changes are part of the release.
