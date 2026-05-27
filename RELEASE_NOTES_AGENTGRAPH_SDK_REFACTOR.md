# AgentGraph SDK Refactor Notes

These notes cover the post-`v0.12.0` refactor that moves chat and workflow execution onto the AgentGraph SDK.

## Highlights

- **Assistant graph runtime**: normal chat now runs through `AssistantChatGraphRuntime` and `AssistantAgent`.
- **Optional knowledge search**: default chat no longer pre-runs retrieval for every message. The assistant uses `KnowledgeSearchTool` when uploaded sources are available and relevant.
- **AgentGraph-only workflows**: `WorkflowRunner` now delegates normal workflow execution to the SDK runtime. The old plugin-local workflow runtime is no longer the primary execution path.
- **SDK sub-workflows**: workflow `subWorkflow` nodes now use SDK `SubgraphNode` behavior, including child run and child interrupt resume metadata.
- **Compatibility aliases**: `ParentAgent` aliases `AssistantAgent`; `RagAgent` aliases `WorkflowLlmAgent`.
- **SDK persistence**: host apps get SDK migrations for `agent_graph_*` tables through the plugin migration loader.
- **Database cutover**: open legacy workflow runs without AgentGraph run metadata are cancelled by an irreversible migration because the old runtime path has been removed.
- **Doctor checks**: `php artisan filament-agentic-chatbot:doctor` now checks SDK tables unless the SDK store is configured as memory.
- **Generation options**: workflow AI node `temperature` and `maxTokens` values are passed through Laravel AI generation options where the selected provider supports them.

## Upgrade Notes

1. Ensure Composer can resolve `heiner/agent-graph`.
2. Run `composer update heiner/filament-agentic-chatbot heiner/agent-graph --with-dependencies`.
3. Read [Database And Breaking Changes](DATABASE_AND_BREAKING_CHANGES.md) and check for open legacy workflow runs before production migration.
4. Run `php artisan migrate` so the SDK tables are created and the workflow-run cutover migration is applied.
5. If you published config, merge the new `chat.assistant_graph.*`, `workflow.turn_planner.*`, and `AGENTIC_WORKFLOW_*` naming updates.
6. Keep legacy `RAG_PARENT_AGENT_*` values only as fallback compatibility. New deployments should prefer `AGENTIC_CHATBOT_ASSISTANT_GRAPH_*`.
7. Run `php artisan filament-agentic-chatbot:doctor`.
8. Test a normal chat turn, a source-grounded answer, a workflow start, and a paused workflow resume.

## Compatibility

Existing persisted table and model names such as `RagBot`, `RagSource`, `rag_bots`, and `rag_sources` remain unchanged for migration safety.

Product copy should use "bot", "assistant", "sources", "knowledge", "assistant graph", and "workflow" instead of presenting the whole product as a "RAG bot".

## Related Docs

- [Agent Runtime Architecture](AGENT_RUNTIME_ARCHITECTURE.md)
- [AgentGraph SDK Usage](AGENTGRAPH_SDK_USAGE.md)
- [Database And Breaking Changes](DATABASE_AND_BREAKING_CHANGES.md)
- [Bots](BOTS.md)
- [Agentic Workflows](AGENTIC_WORKFLOWS.md)
- [Operations](OPERATIONS.md)
- [Known Limitations](KNOWN_LIMITATIONS.md)
