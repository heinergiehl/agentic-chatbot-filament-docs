# Release Notes: v0.9.0-beta.1

`v0.9.0-beta.1` is the first public beta of Filament Agentic Chatbot.

## Highlights

- Grounded chatbot runtime with `pgvector` as the default vector backend and Chroma as an optional alternative.
- Filament-native management for bots, sources, workflows, conversations, submissions, and workflow runs.
- Visual workflow editor with branching, publish history, rollback support, and AI-assisted draft generation.
- Embeddable chat widget with signed embeds, domain allowlists, theming, and optional source references.
- Operational readiness tooling including `php artisan filament-agentic-chatbot:doctor` and install smoke coverage.

## Public Beta Notes

- This is a beta release line. No stable `v1.0` release exists yet.
- The package is tested against `laravel/ai` `^0.1.5`; runtime per-call temperature and max-token overrides remain limited by upstream SDK capabilities.
- `pgvector` is the recommended production backend for this release line.

## Upgrade Guidance

For a fresh install, follow [QUICKSTART.md](QUICKSTART.md).

When upgrading between beta releases:

1. Read [CHANGELOG.md](CHANGELOG.md) for behavior changes.
2. Run `php artisan filament-agentic-chatbot:doctor`.
3. Run `php artisan migrate`.
4. Clear Laravel caches if the host app is already deployed.

## Links

- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Upgrade guide: [UPGRADING.md](UPGRADING.md)
- Known limitations: [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md)
