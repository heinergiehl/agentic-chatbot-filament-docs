# Release Notes: v0.13.0

`v0.13.0` is the recommended Commercial Early Access release after `v0.11.1`. It ships the agent-first chat runtime, the smart data query model, the workflow UX refresh, and the **AgentGraph-only** workflow platform in one installable line.

> **About `v0.12.0`:** A preview git tag `v0.12.0` exists on an early commit and does **not** represent this release. Customers on `v0.11.1` should upgrade directly to `^0.13.0`. If you installed that early tag, treat this release as a required platform upgrade, not a patch.

## Highlights

- **AgentGraph workflow platform**: workflows now execute through stable `heiner/agent-graph` `^0.13.0`. The legacy in-package workflow runner was removed. Delays, interactive resumes, memory nodes, loops, subworkflows, and AI nodes route through the AgentGraph adapter and resume job.
- **Assistant graph chat runtime**: normal chat uses the assistant graph by default. Knowledge search and workflow execution are tools; retrieval is no longer forced on every turn. `ParentAgent` / `KnowledgeAgent` remain as deprecated compatibility aliases.
- **Smarter halted-workflow follow-ups**: semantic turn routing and the generic workflow turn planner classify resume, cancel, interrupt, side questions, and clarifications before a paused `collectInput` or `confirmation` step consumes the next message.
- **Smart Data Queries**: bot-level allow lists plus validated `query_data_resource` planning for natural admin/data requests (newest, active, filtered records, and similar). Post-release routing and preset mapping fixes are included.
- **Workflow editor refresh**: simplified node setup, navigator, readiness UX, inline variable pickers, quieter toolbar/save/publish behavior, rebuilt production assets, and clearer catalog copy.
- **Operations and admin UX**: workflow run inspector shows AgentGraph runtime details and replay traces; run audit/output previews improved; bot feedback inbox analytics added; chat behavior and knowledge-routing indicators in the bot admin UI.
- **Widget polish**: inherited accent colors from host panels, vertical card-list rendering for rich messages, and stream/scroll reliability fixes.
- **Release validation**: expanded PHPUnit coverage, workflow turn-routing evals, Postgres sandbox smoke improvements, and marketplace readiness checks updated for `0.13.0`.

## Upgrade from v0.11.1

1. Update your constraint to `^0.13.0` (or the exact marketplace version you receive).
2. Run `composer update heiner/filament-agentic-chatbot --with-dependencies`.
   - Composer will also install **`heiner/agent-graph`** transitively. Do not pin a local path repository in production.
3. Run `php artisan migrate`.
   - This applies the AgentGraph cutover migration that **cancels in-flight legacy workflow runs** (`running`, `halted`, `delayed`) that never started on AgentGraph. Plan a short maintenance window if you rely on long-lived paused workflows.
4. Merge or re-publish config keys for:
   - `chat.assistant_graph` (preferred) or legacy `chat.parent_agent`
   - `workflow.turn_planner`, `workflow.input_interruption`, `workflow.choice_resolution`, `workflow.turn_router`
   - `data_resources.smart_queries`
5. If Filament assets are cached in deployment, run `php artisan filament:assets`.
6. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
7. Run `php artisan filament-agentic-chatbot:doctor`.
8. Smoke-test:
   - one normal knowledge answer,
   - one workflow paused on Collect Input or Confirmation (resume + cancel),
   - one Smart Data Query workflow if you use internal data resources.

## Upgrade from the early `v0.12.0` preview tag

Follow the steps above. Pay special attention to:

- removing any custom Composer `repositories` entry that pointed at a local `agent-graph` checkout,
- re-testing workflows that were paused before upgrade (they will be marked `cancelled` by the cutover migration unless they already had an AgentGraph `run_id` in meta).

## Breaking and behavioral changes

| Area | What changed |
| --- | --- |
| Workflow runtime | Legacy runner removed; AgentGraph is required. |
| Composer | New required dependency `heiner/agent-graph`. `laravel/ai` constraint widened to `^0.7 \|\| ^1.0`. |
| Database | Cutover migration cancels legacy in-flight workflow runs (irreversible). |
| Config | `chat.assistant_graph.*` preferred; `chat.parent_agent.*` deprecated. `workflow.turn_planner.*` added. |
| Bot access token channels | Removed unused default channel labels `mobile`, `backend`, and `custom` from config defaults (existing stored values are unaffected). |

## Notes

- **Product model:** bot → assistant graph → tools (knowledge search optional, workflow as tool). Grounded answers still come from configured sources when the graph chooses retrieval.
- **Stable AgentGraph 0.13 line:** the runtime dependency now follows `^0.13.0`; no Composer prerelease flags are required for AgentGraph. The plugin keeps its product-specific `run_workflow` tool instead of directly replacing it with SDK `DurableGraphTool`.
- **No new package-owned tables** beyond what `v0.11.x` already introduced; this release adds the cutover data migration and workflow-run meta usage for AgentGraph IDs.
- **Commercial launch env:** before marketplace production traffic, set `AGENTIC_CHATBOT_COMMERCIAL_MODE=true` plus `AGENTIC_CHATBOT_WIDGET_SIGNING_KEY`, `AGENTIC_CHATBOT_ANYSTACK_ID`, `AGENTIC_CHATBOT_DOCS_URL`, and `AGENTIC_CHATBOT_SUPPORT_EMAIL` on the host documented in [OPERATIONS.md](OPERATIONS.md).

## Links

- Full changelog: [CHANGELOG.md](CHANGELOG.md)
- Upgrade guide: [UPGRADING.md](UPGRADING.md)
- Runtime architecture: [AGENT_RUNTIME_ARCHITECTURE.md](AGENT_RUNTIME_ARCHITECTURE.md)
- AgentGraph alignment: [AGENTGRAPH_SDK_USAGE.md](AGENTGRAPH_SDK_USAGE.md)
- Previous release: [RELEASE_NOTES_v0.11.1.md](RELEASE_NOTES_v0.11.1.md)
