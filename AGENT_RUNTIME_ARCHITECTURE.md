# Agent Runtime Architecture

This page documents the runtime model used by Filament Agentic Chatbot after the assistant chat graph refactor.

The important product distinction is:

- **Bot** is the persisted assistant configuration.
- **AssistantAgent** is the default conversational agent.
- **AssistantChatGraphRuntime** runs chat turns through the SDK graph.
- **Knowledge search** is an optional source-grounding capability, not the default chatbot mode.
- **Workflows** are executable playbooks exposed to the assistant as a tool.
- **ParentAgent** and **KnowledgeAgent** remain deprecated compatibility aliases only.

## Default Runtime

Every chat request first resolves the endpoint context and then passes through deterministic turn ownership before any model or workflow execution runs.

```text
ChatEndpointContextResolver
  -> ConversationTurnGateway
      -> pending interaction / active workflow / compound request / static response / assistant fallback
  -> ChatTurnCoordinator
      -> direct workflow handler or AssistantChatGraphRuntime
  -> persistence, usage, events, and response presentation
```

The assistant still decides how to answer once it owns the turn, but it does not get first chance to override active waitpoints, pending confirmations, or deterministic static/runtime outcomes.

The gateway records the last ownership decision in `conversation_turn_arbitration` metadata. This makes support review and regression tests easier because a turn can be traced to `pending_interaction`, `workflow_start`, `workflow_resume`, `compound`, `static`, or assistant fallback ownership.

## Knowledge Retrieval

Source-grounded retrieval remains a first-class capability. The source, document, chunk, embedding, and vector-store pipeline is still the grounding layer for factual answers when it is explicitly used.

```text
AssistantAgent -> KnowledgeSearchTool -> KnowledgeRetrievalService -> answer grounded in retrieved context
Workflow -> knowledgeBase node -> KnowledgeRetrievalService -> answer/contextBuilder/confidenceCheck
```

This keeps normal chat conversational while preserving source-backed answers and citations for assistants and workflows that need them.

## Workflow Execution

When the assistant graph owns a turn, it sees the active workflow as `run_workflow`. When a bot is configured for direct workflow routing, the workflow handler runs without asking the assistant to call a tool.

The workflow tool:

- runs the active workflow when the user requests task execution
- resumes an existing halted workflow when the user answers its last question
- refuses duplicate starts when a workflow is already waiting for input
- protects application-owned runtime variables such as `session_id`, `area`, `__bot`, actor context, and channel context
- plans run/resume execution under a conversation lock before executing the workflow

Both transports use the same planning boundary before execution. If execution fails after a run has been prepared, the runtime marks that run failed instead of leaving it `running`.

Stream responses emit structured error events and close with `data: [DONE]`. JSON `/complete` responses return a safe error payload and status code. Raw stack traces and provider secrets should stay in server logs, not in widget output.

## Pending Workflow Turn Routing

Open workflow runs are treated as paused state, not as ownership of every future user turn. When a workflow is halted on a `collectInput` or `confirmation` node, the runtime routes the next user message before resuming the run.

The turn router combines deterministic validation with a semantic LLM classifier. The classifier uses an isolated workflow LLM agent and returns this schema:

- `resume` means the message should be passed to the waiting workflow node as the answer or answer attempt.
- `cancel` means the user wants to abandon the pending workflow. The open run is closed before validation can reprompt.
- `interrupt` means the user has switched to a different task or topic. The open run is closed and the assistant handles the new request without stale workflow state.
- `side_question` means the user is asking about the pending question or process. The run stays paused so the assistant can answer and then continue later.
- `clarify` means the message is ambiguous enough that the assistant should ask whether to continue, cancel, or switch tasks.

This routing happens inside the workflow tool and in an assistant preflight step, so correctness does not depend on the model voluntarily calling the workflow tool for every cancellation or topic switch.

AgentGraph checkpoints and interrupts are the authority for SDK-backed waitpoints. `bot_pending_interactions` rows are projections used for chat routing, admin visibility, audit, TTL, draft persistence, and diagnostics.

Projection recovery is intentionally conservative:

- fresh `pending` and `resolving` rows are treated as active
- expired projections are closed before reuse
- stale `resolving` claims are released after `AGENTIC_CHATBOT_WORKFLOW_PENDING_RESOLVING_TIMEOUT_SECONDS` only when the AgentGraph interrupt still matches
- changed or missing interrupts mark projections stale instead of executing against outdated state

This prevents a browser refresh, abandoned request, or failed resolver attempt from blocking the next valid user answer forever.

## Result-Set Follow-Up Context

`query_data_resource` stores sanitized result-set context on the conversation after successful lookups. Follow-up turns such as "latest one", "only the first", "details", or "the second" can then resolve against the previous result set deterministically before an LLM continuation planner is used.

The resolver reuses only controlled resource metadata, selected fields, capped scalar records, and closed-vocabulary operation synonyms. It does not infer database follow-ups from free-form assistant prose.

## Memory

There are two memory layers:

- **Conversation memory** is recent stored user and assistant messages.
- **Session state memory** is deterministic application state for the same chat session.

The assistant may use these for conversational continuity, follow-up references, and current state. It must not use memory as evidence for new factual claims unless that fact also comes from retrieved knowledge or another trusted tool.

## Legacy Agent Names

`ParentAgent` is a deprecated alias of `AssistantAgent`.

`KnowledgeAgent` is a deprecated alias of `WorkflowLlmAgent`.

Legacy `Rag*` database and model names have been renamed to the Bot/Knowledge domain. Product copy should say "bot", "assistant", "knowledge", and "sources" instead of presenting RAG as the whole chatbot.

## Naming Rules

Use these terms in product and documentation copy:

| Use | Avoid as the main product term |
| --- | --- |
| Bot | RAG bot |
| Assistant | RAG chatbot |
| Assistant graph | Parent agent |
| Knowledge base | RAG system |
| Sources | Training data |
| Retrieval | The bot knows this |
| Workflow tool | Workflow takeover |

`Bot`, `KnowledgeSource`, `KnowledgeDocument`, and `KnowledgeChunk` are the canonical domain model names.

## Best Practices

- Keep the assistant graph enabled by default.
- Treat knowledge retrieval as an explicit tool or workflow node, not as a separate chatbot mode.
- Keep workflows as executable playbooks. Do not turn every answer into a workflow.
- Keep workflow LLM nodes for specialized substeps, classification, summarization, or structured output.
- Use capability mode to decide whether the bot may query knowledge, read internal data, or write structured records.
- Keep UI copy user-facing. Users care about the assistant, sources, tasks, and results, not about the RAG implementation detail.
