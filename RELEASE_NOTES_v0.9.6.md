# Release Notes: v0.9.6

`v0.9.6` is a commercial early-access release in the `0.9.x` line delivering a workflow editor, node catalog, and runtime hardening pass on top of v0.9.5.

## Highlights

- **Broader node catalog**: the editor documentation now covers the full workflow surface, including grounded answers, query rewrite, summarize, structured output, confidence checks, guardrails, context builder, rerank, error handler, confirmations, internal data retrieval, memory, validation, transform, log, random split, intent/sentiment routing, expression, sub-workflow, end, join, loop, delay, and notes.
- **More stable editor UX**: workflow editor copy, settings tips, sidebar behavior, and canvas layout were tightened across Nodes, AI Draft, Runs, Versions, and Test panels.
- **Safer connector failures**: API Connector nodes now align with raw HTTP Request behavior for non-2xx responses. They keep response/status/raw/error variables for traces, but stop the flow when `continueOnFail` is disabled.
- **Runtime edge-case fixes**: AI streaming fallback preserves provider/model overrides, missing HTTP URLs fail clearly, sentiment fallbacks route to `default`, and `base64decode` preserves valid falsey decoded values such as `"0"`.
- **Release gates restored**: PHPUnit, PHPStan, Pint, workflow-editor production build, and marketplace readiness all pass for this release candidate.

## Workflow Editor And Node UX

The editor remains an admin-first power tool, but this release tightens the experience around the parts operators use most:

- stable canvas sizing while moving between sidebar tabs
- consistent scrolling in secondary panels
- clearer per-node settings help for AI runtime options that are stored for future SDK support
- visible runtime/testing tools for mapping previews, HTTP/API dry runs, saved-draft test chat, runs, versions, and trace replay
- clearer separation between executable nodes and editor-only notes

Only one workflow can be live for a bot at a time. Use extra workflow records as drafts, experiments, or release history for the same bot. For multiple public chatbot experiences, create multiple bots rather than exposing raw workflow selection to widget users.

## Runtime Hardening

This release closes several small but important runtime consistency gaps:

- API Connector non-2xx responses now fail by default unless `continueOnFail` is enabled.
- API Connector failures still expose `outputVariable`, `outputVariable_status`, `outputVariable_raw`, and `outputVariable_error` for fallback branches and debugging.
- HTTP Request nodes now report missing URLs as failures instead of silently producing an empty variable.
- AI Agent streaming fallback keeps provider/model overrides when it falls back to synchronous retry.
- Sentiment failure routing now uses the documented `default` branch.
- Transform `base64decode` no longer treats decoded falsey strings as failed decodes.

## Upgrade from v0.9.5

1. Update your `composer.json` constraint to `^0.9.6`.
2. Run `composer update heiner/filament-agentic-chatbot`.
3. Run `php artisan filament:assets`.

No new database migrations are required for this release.

## Notes

- This remains part of the commercial early-access `0.9.x` line.
- `pgvector` remains the recommended production vector backend.
- The package is still tested against `laravel/ai` `~0.1.5`.
- Per-node AI `temperature` and `maxTokens` values are still stored for future SDK support; the current Laravel AI SDK runtime uses the linked bot/provider defaults for those options.

## Links

- Full changelog: [CHANGELOG.md](CHANGELOG.md)
- Upgrade guide: [UPGRADING.md](UPGRADING.md)
- Known limitations: [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md)
- Previous release: [RELEASE_NOTES_v0.9.5.md](RELEASE_NOTES_v0.9.5.md)
