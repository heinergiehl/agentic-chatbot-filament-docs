# Release Notes: v0.16.0

`v0.16.0` is a workflow-runtime and compound-request release. It adds structured multi-part request handling, makes pending workflow turns more authoritative, preserves schema-v2 structured form fields across frontend and backend compilers, and adds database guards around pending conversation state.

## Highlights

- **Compound Request modes:** bots can now choose `legacy`, `shadow`, or `structured` from the Admin UI. `legacy` remains the safe upgrade default, `shadow` audits structured plans, and `structured` executes registered capabilities.
- **Structured compound execution:** action, Laravel AI tool, and API Connector-backed capabilities can be exposed as schema-driven read/write compound operations with bot-level allow-lists.
- **Safer AgentGraph usage:** write, mixed, async, and threshold-sized structured plans can use durable AgentGraph execution, while small read-only plans stay synchronous.
- **Workflow turn ownership:** pending workflow questions, pending interactions, compound approvals, continuations, interruptions, delays, and cancellations are resolved before session-memory recall or assistant fallback can answer.
- **AgentGraph interrupt repair:** replacement turns now cancel the SDK run before starting a new run, and reconciler logic understands SDK interrupts without explicit interrupt IDs.
- **Schema-v2 form preservation:** structured fields authored as JSON text in the semantic Ask inspector compile to `collectForm` nodes on both the frontend and backend compiler paths.
- **Database hardening:** task frames now have source uniqueness, and MySQL/MariaDB installs receive generated-column one-pending guards matching the existing PostgreSQL/SQLite partial-index semantics.

## What Changed

### Compound Requests

- Added explicit `legacy`, `shadow`, and `structured` engine modes.
- Added shadow audit records for evaluating structured planning without changing visitor-facing behavior.
- Switched structured planning to Laravel AI structured output with repair for single required string item inputs.
- Added capability schema validation and safe execution for action, tool, and API Connector-backed plans.
- Added planner relationship metadata for `all`, `alternative`, `duplicate`, `dependent`, and `ambiguous` plans.
- Kept incomplete single-item plans on the normal workflow path so collect-input and human-in-the-loop nodes can pause and resume.
- Added a bot-level engine selector and per-bot capability allow-list in **Behavior > Compound Requests**.

### Workflow Turns and AgentGraph

- Pending workflow ownership now runs before conversation recall in modern chat endpoints.
- Interrupt replacements cancel AgentGraph-backed runs through the SDK before closing the local projection.
- SDK interrupts without `interrupt_id` now reconcile against the same synthetic identity used by pending-interaction projection.
- Compound confirmation and execution stay traceable through AgentGraph metadata on pending requests and interactions.

### Schema-v2 Authoring

- Ask steps with JSON-authored `structuredFields` now compile to `collectForm` runtime nodes.
- Frontend and backend compilers preserve structured field names and slot contracts consistently.

### Database Constraints

- Added a unique source constraint for conversation task frames.
- Added MySQL/MariaDB generated nullable guard columns for one pending interaction/request per conversation.
- PostgreSQL and SQLite continue to use partial unique indexes for the same pending-state contracts.

## Upgrade from v0.15.0

1. Update the package constraint to `^0.16.0` or to the exact marketplace version you receive.
2. Run `composer update heiner/filament-agentic-chatbot --with-dependencies`.
3. Run `php artisan migrate`.
4. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
5. Run `php artisan filament-agentic-chatbot:doctor`.
6. Merge published config changes for `compound_requests.engine`, `compound_requests.graph.sync_item_threshold`, and registered compound capabilities.
7. Keep bots on `Legacy fallback` until structured capabilities have been verified in staging. Use `Shadow audit` before `Structured execution` for production bots.

## Release Validation

The release gate for this line should include:

- `composer validate --strict`
- `composer run-script pint:test`
- `composer run-script stan`
- `composer run-script test`
- `npm --prefix resources/js/workflow-editor run test:contracts`
- `npm --prefix resources/js/workflow-editor run build`
- `composer run-script eval:compound-requests`
- `composer run-script eval:workflow-turns`
- `composer run-script eval:workflow-understanding`
- `composer run-script release:marketplace-check`

Fresh path-install, VCS tag-install, and host-app smoke tests should still be run before tagging and publishing the GitHub release.

## Links

- Full changelog: [CHANGELOG.md](CHANGELOG.md)
- Upgrade guide: [UPGRADING.md](UPGRADING.md)
- Previous release: [RELEASE_NOTES_v0.15.0.md](RELEASE_NOTES_v0.15.0.md)
