# Agent Runtime Architecture

This page documents the runtime model used by Filament Agentic Chatbot after the assistant chat graph refactor.

The important product distinction is:

- **Bot** is the persisted assistant configuration.
- **AssistantAgent** is the default conversational agent.
- **AssistantChatGraphRuntime** runs chat turns through the SDK graph.
- **Knowledge search** is an optional source-grounding capability, not the default chatbot mode.
- **Workflows** are executable playbooks exposed to the assistant as a tool.
- **ParentAgent** and **RagAgent** remain deprecated compatibility aliases only.

## Default Runtime

Every normal chat request runs through the assistant chat graph unless a live workflow is explicitly configured to use the direct workflow handler for compatibility.

```text
Bot configuration
  -> AssistantChatGraphRuntime
      -> prepare turn state
      -> AssistantAgent
          -> conversation memory
          -> session state memory
          -> KnowledgeSearchTool only when uploaded sources exist
          -> RunWorkflowTool when a live workflow exists
          -> registered tools
          -> direct natural-language answer when no tool is needed
      -> finalize and persist
```

The assistant decides whether to answer directly, search uploaded sources, run or resume a workflow, or ask a clarifying question. Default chat no longer performs a hidden retrieval call before the assistant runs.

## Knowledge Retrieval

Source-grounded retrieval remains a first-class capability. The source, document, chunk, embedding, and vector-store pipeline is still the grounding layer for factual answers when it is explicitly used.

```text
AssistantAgent -> KnowledgeSearchTool -> RagService -> answer grounded in retrieved context
Workflow -> knowledgeBase node -> RagService -> answer/contextBuilder/confidenceCheck
```

This keeps normal chat conversational while preserving source-backed answers and citations for assistants and workflows that need them.

## Workflow Execution

The assistant sees the active workflow as `run_workflow`.

The workflow tool:

- runs the active workflow when the user requests task execution
- resumes an existing halted workflow when the user answers its last question
- refuses duplicate starts when a workflow is already waiting for input
- protects application-owned runtime variables such as `session_id`, `area`, `__bot`, actor context, and channel context
- plans run/resume execution under a conversation lock before executing the workflow

The direct workflow handler still exists for compatibility when the assistant graph is disabled for a bot.

## Pending Workflow Turn Routing

Open workflow runs are treated as paused state, not as ownership of every future user turn. When a workflow is halted on a `collectInput` or `confirmation` node, the runtime routes the next user message before resuming the run.

The turn router combines deterministic validation with a semantic LLM classifier. The classifier uses an isolated workflow LLM agent and returns this schema:

- `resume` means the message should be passed to the waiting workflow node as the answer or answer attempt.
- `cancel` means the user wants to abandon the pending workflow. The open run is closed before validation can reprompt.
- `interrupt` means the user has switched to a different task or topic. The open run is closed and the assistant handles the new request without stale workflow state.
- `side_question` means the user is asking about the pending question or process. The run stays paused so the assistant can answer and then continue later.
- `clarify` means the message is ambiguous enough that the assistant should ask whether to continue, cancel, or switch tasks.

This routing happens inside the workflow tool and in an assistant preflight step, so correctness does not depend on the model voluntarily calling the workflow tool for every cancellation or topic switch.

## Memory

There are two memory layers:

- **Conversation memory** is recent stored user and assistant messages.
- **Session state memory** is deterministic application state for the same chat session.

The assistant may use these for conversational continuity, follow-up references, and current state. It must not use memory as evidence for new factual claims unless that fact also comes from retrieved knowledge or another trusted tool.

## Legacy Agent Names

`ParentAgent` is a deprecated alias of `AssistantAgent`.

`RagAgent` is a deprecated alias of `WorkflowLlmAgent`.

Do not rename database tables or model classes just to remove the word `Rag`; that would create unnecessary migration and API risk. Product copy should say "bot", "assistant", "knowledge", and "sources" instead of presenting RAG as the whole chatbot.

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

`RagBot`, `RagSource`, `RagDocument`, and `RagChunk` remain internal storage names for backward compatibility.

## Best Practices

- Keep the assistant graph enabled by default.
- Treat knowledge retrieval as an explicit tool or workflow node, not as a separate chatbot mode.
- Keep workflows as executable playbooks. Do not turn every answer into a workflow.
- Keep workflow LLM nodes for specialized substeps, classification, summarization, or structured output.
- Use capability mode to decide whether the bot may query knowledge, read internal data, or write structured records.
- Keep UI copy user-facing. Users care about the assistant, sources, tasks, and results, not about the RAG implementation detail.
