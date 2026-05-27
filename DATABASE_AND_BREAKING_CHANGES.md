# Database And Breaking Changes

This page summarizes database and compatibility changes introduced by the post-`v0.12.0` AgentGraph SDK refactor.

Read this before upgrading a live app that already has workflow runs, paused conversations, workflow memory, custom workflow dashboards, or published config overrides.

## Short Version

- New AgentGraph SDK tables are required for database-backed SDK persistence.
- Existing product tables such as `rag_bots`, `rag_sources`, `rag_conversations`, and `workflow_runs` are not renamed.
- New workflow runs store their SDK linkage in `workflow_runs.meta.agent_graph`.
- Open legacy workflow runs without `meta.agent_graph.run_id` are intentionally cancelled by the cutover migration.
- `workflow_runs.node_traces` is no longer the source of truth for new run inspection.
- Workflow memory writes inside AgentGraph-backed runs go to SDK memory storage, with legacy memory reads kept as fallback.
- Custom code that depended on the old plugin-owned workflow runtime must move to the AgentGraph-backed runtime APIs.

## New AgentGraph SDK Tables

When the SDK store is database-backed, host apps need these tables:

| Table | Purpose |
| --- | --- |
| `agent_graph_runs` | SDK run identity, status, thread, and graph metadata |
| `agent_graph_checkpoints` | durable graph state snapshots |
| `agent_graph_writes` | state writes emitted during node execution |
| `agent_graph_tasks` | idempotent side-effect task records |
| `agent_graph_interrupts` | paused run and resume metadata |
| `agent_graph_memories` | AgentGraph memory records |
| `agent_graph_traces` | SDK trace events used by run inspection and timeline replay |

The plugin auto-loads the SDK migration directory through `AgentGraphManager::migrationsPath()`. In a normal host app, `php artisan migrate` should create these SDK tables together with the plugin tables.

`php artisan filament-agentic-chatbot:doctor` checks these tables unless the SDK store is configured as memory.

## Existing Tables Are Not Renamed

The refactor deliberately keeps existing package-owned table and model names for migration safety.

Do not expect a rename from:

- `rag_bots`
- `rag_sources`
- `rag_documents`
- `rag_chunks`
- `rag_conversations`
- `rag_messages`

Those names remain internal compatibility details. Product copy should say "bot", "assistant", "sources", "knowledge", and "workflow".

## Workflow Run Cutover

The migration `2026_05_26_000001_cancel_legacy_workflow_runs_for_agentgraph_cutover.php` updates old open workflow runs that cannot be resumed by the new AgentGraph-only runtime.

It targets `workflow_runs` with one of these statuses:

- `running`
- `halted`
- `delayed`

If a run does not have `meta.agent_graph.run_id`, the migration updates it to:

| Field | New value |
| --- | --- |
| `status` | `cancelled` |
| `halt_reason` | `null` |
| `resume_at` | `null` |
| `meta.legacy_cancelled_by_agentgraph_cutover` | `true` |
| `meta.legacy_cancelled_at` | cutover timestamp |
| `meta.system_failure_reason` | `agentgraph_only_cutover` |

Runs that already have `meta.agent_graph.run_id` are left alone.

This migration is intentionally irreversible. Its `down()` method does not restore old pending work because the old runtime path has been removed.

## Breaking Behavior

The main breaking behavior is for in-progress legacy workflows:

- A user paused at an old `collectInput`, `confirmation`, or `delay` step may not be able to resume that exact old run after the cutover.
- Operators will see those old runs as `cancelled`.
- The user can start the flow again under the AgentGraph runtime.

Before deploying this refactor to a production app:

1. Back up the database.
2. Check for open legacy runs.

For MySQL or SQLite-style JSON functions:

```sql
select id, status, rag_conversation_id, agent_workflow_id, created_at
from workflow_runs
where status in ('running', 'halted', 'delayed')
  and (meta is null or json_extract(meta, '$.agent_graph.run_id') is null);
```

For PostgreSQL JSONB, use:

```sql
select id, status, rag_conversation_id, agent_workflow_id, created_at
from workflow_runs
where status in ('running', 'halted', 'delayed')
  and coalesce(meta #>> '{agent_graph,run_id}', '') = '';
```

3. Let important paused workflows finish, or communicate that they will need to be restarted.
4. Deploy in a maintenance window if your app has active long-running workflows.
5. Run `php artisan migrate`.
6. Run `php artisan filament-agentic-chatbot:doctor`.
7. Test one normal chat turn, one source-grounded answer, one workflow start, and one paused workflow resume.

## Workflow Run Metadata

New AgentGraph-backed workflow runs store SDK linkage under:

```text
workflow_runs.meta.agent_graph
```

Important keys:

- `run_id`
- `status`
- `thread_id`
- `interrupt`

If you built custom dashboards, exports, or support tooling around workflow runs, read this metadata instead of assuming `node_history` or `node_traces` has the full runtime story.

## Trace And Inspection Changes

`workflow_runs.node_traces` was part of the older plugin-owned runtime. It may still exist for compatibility or historical records, but it is no longer the authoritative trace source for new AgentGraph-backed runs.

New run inspection reads from SDK state:

- AgentGraph run snapshot
- checkpoints
- writes
- interrupts
- timeline steps
- tasks
- memory
- traces

Breaking implication: custom admin screens or reports that only read `workflow_runs.node_traces` will miss new runtime details. Update them to use the plugin's run inspection surface or AgentGraph SDK inspection APIs.

## Workflow Memory Changes

The `workflow_memories` table remains in the package for compatibility and export behavior.

For AgentGraph-backed workflow runs:

- memory writes go through the AgentGraph memory store
- new records are stored in `agent_graph_memories`
- reads can fall back to existing `workflow_memories` records when no SDK memory record is found

Breaking implication: do not assume all current workflow memory lives in `workflow_memories` after the refactor. If you export, prune, or inspect workflow memory outside the plugin UI, include AgentGraph memory storage as well.

## Config And API Compatibility

New config should use:

- `chat.assistant_graph.*`
- `AGENTIC_CHATBOT_ASSISTANT_GRAPH_*`
- `workflow.turn_planner.*`
- `AGENTIC_WORKFLOW_*`

Legacy `chat.parent_agent.*` and `RAG_PARENT_AGENT_*` values are still read as compatibility fallbacks, but they are no longer the preferred public configuration names.

The old workflow runtime selection flags are no longer part of the runtime model. Custom code that relied on `workflow.agent_graph.enabled`, runtime `mode`, or `fallback_to_legacy` needs to be removed or rewritten.

## Custom Code To Audit

Audit host-app code for direct references to:

- `ParentAgent` as the main runtime class
- `RagAgent` as the main chat class
- old plugin-local workflow runtime classes
- `WorkflowRunner::run()`
- `WorkflowRunner::executeSubgraph()`
- `workflow_runs.node_traces` as the only trace source
- `workflow_memories` as the only memory store
- `workflow.agent_graph.enabled`, `mode`, or `fallback_to_legacy`

`ParentAgent` and `RagAgent` remain as class aliases for compatibility, but new code should use `AssistantAgent` and `WorkflowLlmAgent` intentionally.

## Rollback Considerations

The database cutover is not a clean rollback point:

- the legacy-open-run cancellation migration is intentionally irreversible
- new runs may have SDK state in `agent_graph_*` tables
- old runtime code is no longer the normal execution path

If you need rollback safety, take a database backup before migration and test the upgrade on staging with production-like workflow data.

## Related Docs

- [AgentGraph SDK Refactor Notes](RELEASE_NOTES_AGENTGRAPH_SDK_REFACTOR.md)
- [AgentGraph SDK Usage](AGENTGRAPH_SDK_USAGE.md)
- [Agent Runtime Architecture](AGENT_RUNTIME_ARCHITECTURE.md)
- [Operations](OPERATIONS.md)
- [Known Limitations](KNOWN_LIMITATIONS.md)
