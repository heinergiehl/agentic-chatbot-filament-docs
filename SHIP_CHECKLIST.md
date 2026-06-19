# Ship Checklist

## Composer Package Availability

- [x] Publish `heiner/agent-graph` to Packagist, Private Packagist, or another Composer repository available to customers before shipping the Filament plugin.
- [x] Verify a fresh Laravel/Filament host app can install only `heiner/filament-agentic-chatbot` and receives `heiner/agent-graph` transitively without adding a custom root `repositories` entry.
- [x] Remove local development-only repository assumptions from release docs and demo setup notes.

## Release Gates

- [ ] `composer validate --strict`
- [ ] `vendor/bin/pint --test`
- [ ] `composer test`
- [ ] `composer stan:ci`
- [ ] `composer run --timeout=0 deadcode`
- [ ] `composer audit --no-dev`
- [ ] `npm --prefix resources/js/workflow-editor run test:ci`
- [ ] `composer run --timeout=0 release:marketplace-check`
- [ ] PostgreSQL/pgvector CI job passes or a configured external host smoke verifies the package connection.
- [ ] Widget E2E smoke is run against a configured preview host when widget, streaming, auth, or theme changes are part of the release.
- [ ] Workflow chat smoke covers one streaming request, one JSON `/complete` request, one halted/resumed waitpoint, and one safe failure path.
- [ ] Data Resource workflows are validated against representative production-like data when `query_data_resource` is part of the release.
