# Release Notes: v0.9.3

`v0.9.3` was the commercial early-access release in the `0.9.x` line.

## Highlights

- **Publish-before-live workflow safety**: unpublished workflows can no longer be marked live accidentally, and the workflow UI now distinguishes draft, live, and release states more clearly.
- **Stable draft fingerprints**: reorder-only node and edge changes no longer create false dirty drafts or misleading release deltas.
- **Safer submission schema handling**: dedupe paths are treated as payload-relative, and invalid `meta.*` paths are surfaced in workflow metadata instead of being silently misread.
- **Cleaner release packaging**: the README now makes it explicit that extended docs, smoke tooling, and browser smoke tests live in the source repository rather than in distribution archives.
- **Green release gates**: PHPUnit, PHPStan, Pint, workflow-editor build, and marketplace readiness all pass for this candidate.

## Upgrade from v0.9.2

1. Update your `composer.json` constraint to `^0.9.3`.
2. Run `composer update heiner/filament-agentic-chatbot`.
3. Run `php artisan migrate`.
4. Run `php artisan filament:assets`.
5. Run `php artisan filament-agentic-chatbot:doctor`.
6. Revalidate one clean install path in staging if you distribute the package privately.

No manual config migration is required for this release.

## Notes

- This remains part of the commercial early-access `0.9.x` line.
- `pgvector` remains the recommended production vector backend.
- The package is still tested against `laravel/ai` `~0.1.5`.

## Links

- Full changelog: [CHANGELOG.md](CHANGELOG.md)
- Upgrade guide: [UPGRADING.md](UPGRADING.md)
- Known limitations: [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md)
- Previous release: [RELEASE_NOTES_v0.9.2.md](RELEASE_NOTES_v0.9.2.md)
