# Release Notes: v0.11.1

`v0.11.1` is a patch release on top of the `v0.11.0` channel and workflow-memory release. It focuses on workflow editor polish, clearer release-state language, and updated release documentation.

## Highlights

- **Workflow toolbar polish**: the floating toolbar now only shows its elevated drag shadow while dragging from the handle. Clicking normal toolbar buttons no longer makes the whole toolbar look dragged.
- **Clearer release status**: published workflows with saved draft changes now show `Draft changes` instead of `Unpublished`, avoiding the impression that the workflow was never published.
- **Workflow list visibility**: the workflow list no longer applies `Scope: Public Demo` by default, so admins see the complete workflow catalog unless they choose a filter.
- **Memory UX refinement**: editor guidance keeps everyday memory choices focused on `conversation` and `workflow_run`, while advanced scopes remain supported for imported/API-defined workflows.

## Upgrade from v0.11.0

1. Update your package constraint to allow `^0.11.1`.
2. Run `composer update heiner/filament-agentic-chatbot --with-dependencies`.
3. No new migrations are required for this patch release.
4. If Filament assets are cached in your deployment process, run `php artisan filament:assets`.
5. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.

## Notes

- `v0.11.0` remains the large Telegram/Slack channel and workflow-memory baseline.
- `v0.11.1` is the recommended install target for the polished workflow editor UI and clearer publish-state labels.
- A workflow marked `Draft changes` still has a published live version. The label only means the saved editor draft differs from the live version and can be published again when ready.

## Links

- Full changelog: [CHANGELOG.md](CHANGELOG.md)
- Upgrade guide: [UPGRADING.md](UPGRADING.md)
- Previous release: [RELEASE_NOTES_v0.11.0.md](RELEASE_NOTES_v0.11.0.md)
