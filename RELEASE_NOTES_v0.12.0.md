# Release Notes: v0.12.0

> **Superseded:** Install **`v0.13.0`** instead. The `v0.12.0` git tag marked an early preview; [RELEASE_NOTES_v0.13.0.md](RELEASE_NOTES_v0.13.0.md) is the current recommended release.

`v0.12.0` is the agent-first runtime, workflow UX, and smart data query release. It is the next recommended early-access target after `v0.11.1`.

## Highlights

- **Assistant graph runtime by default**: normal chat now routes through the assistant graph, which can answer directly, search uploaded sources, run the active workflow as a tool, or ask for clarification. Older agent class names remain available only as compatibility aliases.
- **Smarter workflow follow-ups**: paused workflow runs no longer blindly consume every next message. The runtime classifies follow-ups as resume, cancel, interrupt, side question, or clarify before resuming a `collectInput` or `confirmation` node.
- **Provider-aware structured classifiers**: workflow turn routing and choice resolution use structured-output classifiers with provider-native schema handling where available, including the Ollama JSON Schema path for local testing.
- **Large workflow editor UX pass**: node setup was simplified across common nodes, the catalog is easier to navigate, field-level validation is clearer, the workflow navigator helps with larger canvases, and editor drag/save/publish interactions are quieter.
- **Smart Data Queries**: admins can allow internal data resources once on the bot, then generated workflows can handle natural requests such as newest, active, highest, cheapest, or filtered records through validated `query_data_resource` plans.
- **More reliable release validation**: workflow turn-routing evals, expanded PHPUnit coverage, and a Postgres sandbox smoke setup make the release candidate easier to verify.

## Upgrade From v0.11.1

1. Update your package constraint to allow `^0.12.0`.
2. Run `composer update heiner/filament-agentic-chatbot --with-dependencies`.
3. Run `php artisan migrate`.
4. If you have published the config file, merge the new `chat.parent_agent`, `workflow.input_interruption`, `workflow.choice_resolution`, `workflow.turn_router`, `workflow.store_submission`, and `data_resources.smart_queries` keys, or re-publish the config and re-apply local overrides.
5. If Filament assets are cached in your deployment process, run `php artisan filament:assets`.
6. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
7. Run `php artisan filament-agentic-chatbot:doctor`.

## Notes

- Existing bots keep their knowledge-base behavior, but the product model should now be understood as bot -> assistant graph -> tools, with source-grounded knowledge as an optional capability.
- Existing workflows continue to run. The new turn router mainly affects halted `collectInput` and `confirmation` steps by handling cancellations, topic switches, and side questions more deliberately.
- `query_data_resource` remains allow-list based. Smart generated query flows still validate fields, filters, sorts, and limits against the linked bot's configured data resources.
- No new package-owned database tables are introduced in this release. The workflow run status vocabulary now includes `cancelled`.

## Links

- Full changelog: [CHANGELOG.md](CHANGELOG.md)
- Upgrade guide: [UPGRADING.md](UPGRADING.md)
- Runtime architecture: [AGENT_RUNTIME_ARCHITECTURE.md](AGENT_RUNTIME_ARCHITECTURE.md)
- Previous release: [RELEASE_NOTES_v0.11.1.md](RELEASE_NOTES_v0.11.1.md)
