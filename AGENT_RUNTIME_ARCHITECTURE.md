# Agent Runtime Architecture

This page documents the runtime model used by Filament Agentic Chatbot after the agent-first refactor.

The important product distinction is:

- **Bot** is the persisted assistant configuration.
- **ParentAgent** is the default conversational runtime.
- **RAG** is a knowledge capability, not the whole chatbot.
- **Workflows** are executable playbooks exposed to the parent agent as a tool.
- **RagAgent** is a compatibility path for legacy direct RAG calls and workflow AI nodes.

## Default Runtime

Every normal chat request should go through the parent agent unless `RAG_PARENT_AGENT_ENABLED=false` or the bot explicitly disables it.

```text
Bot configuration
  -> ParentAgent
      -> conversation memory
      -> session state memory
      -> KnowledgeSearchTool
          -> RagService
          -> vector backend
          -> sources, documents, chunks
      -> RunWorkflowTool
          -> WorkflowRunner
          -> WorkflowRun persistence
      -> registered tools
      -> direct natural-language answer when no tool is needed
```

The parent agent is responsible for orchestration. It decides whether to answer directly, search the knowledge base, run or resume a workflow, or ask a clarifying question.

## Knowledge Retrieval

RAG remains a first-class capability. The source, document, chunk, embedding, and vector-store pipeline is still the grounding layer for factual answers.

What changed is its position in the architecture:

```text
Old mental model:
RAG chatbot -> answer

Current mental model:
ParentAgent -> KnowledgeSearchTool -> RagService -> answer grounded in retrieved context
```

This keeps the user experience conversational while still preserving source-backed answers and citations.

## Workflow Execution

The parent agent sees the active workflow as `run_workflow`.

The workflow tool:

- runs the active workflow when the user requests task execution
- resumes an existing halted workflow when the user answers its last question
- refuses duplicate starts when a workflow is already waiting for input
- protects application-owned runtime variables such as `session_id`, `area`, `__bot`, actor context, and channel context
- plans run/resume execution under a conversation lock before executing the workflow

The direct workflow handler still exists for compatibility when the parent-agent runtime is disabled.

## Pending Workflow Turn Routing

Open workflow runs are treated as paused state, not as ownership of every future user turn. When a workflow is halted on a `collectInput` or `confirmation` node, the runtime routes the next user message before resuming the run.

The turn router combines deterministic validation with a semantic LLM classifier. The classifier uses a dedicated structured-output agent and returns this schema:

- `resume` means the message should be passed to the waiting workflow node as the answer or answer attempt.
- `cancel` means the user wants to abandon the pending workflow. The open run is closed before validation can reprompt.
- `interrupt` means the user has switched to a different task or topic. The open run is closed and the parent agent handles the new request without stale workflow state.
- `side_question` means the user is asking about the pending question or process. The run stays paused so the assistant can answer and then continue later.
- `clarify` means the message is ambiguous enough that the assistant should ask whether to continue, cancel, or switch tasks.

This routing happens inside the workflow tool and in a parent-agent preflight step, so correctness does not depend on the parent model voluntarily calling the workflow tool for every cancellation or topic switch.

Provider-specific structured-output handling is delegated to Laravel AI's provider gateways through `WorkflowTurnIntentClassifierAgent`. The same classifier schema is mapped to the native request shape per provider:

- OpenAI and Azure OpenAI use strict JSON Schema response formatting.
- Gemini uses JSON response MIME type plus response schema.
- Ollama local uses the `/api/chat` `format` JSON Schema field, so local Ollama testing can exercise the same structured classifier path.
- Anthropic uses native structured outputs when configured for them, otherwise the gateway falls back to a forced synthetic output tool.
- OpenRouter, Groq, Mistral, xAI, DeepSeek, and compatible providers use their gateway-supported schema/response-format paths where available.

If a provider or model rejects structured output, the classifier falls back to the older prompt-JSON classifier by default. Disable that fallback with `RAG_WORKFLOW_INPUT_INTERRUPTION_STRUCTURED_OUTPUTS_FALLBACK=false` only when you prefer a conservative `resume` decision over a second unstructured classifier call.

## Memory

There are two memory layers:

- **Conversation memory** is recent stored user and assistant messages.
- **Session state memory** is deterministic application state for the same chat session.

The parent agent may use these for conversational continuity, follow-up references, and current state. It must not use memory as evidence for new factual claims unless that fact also comes from retrieved knowledge or another trusted tool.

## Why RagAgent Still Exists

`RagAgent` should not be treated as the primary product architecture anymore.

It remains for:

- compatibility when the parent agent is disabled
- workflow AI nodes that need a simple knowledge-focused model call
- existing tests and integrations that instantiate the old agent directly

Do not remove `RagAgent` until every remaining caller has an explicit replacement path. Do not rename database tables or model classes just to remove the word `Rag`; that would create unnecessary migration and API risk. Product copy should say "bot", "assistant", "agent", "knowledge base", and "sources" instead of presenting RAG as the whole chatbot.

## Naming Rules

Use these terms in product and documentation copy:

| Use | Avoid as the main product term |
| --- | --- |
| Bot | RAG bot |
| Assistant | RAG chatbot |
| Parent agent | RAG agent |
| Knowledge base | RAG system |
| Sources | Training data |
| Retrieval | The bot knows this |
| Workflow tool | Workflow takeover |

`RagBot`, `RagSource`, `RagDocument`, and `RagChunk` remain internal storage names for backward compatibility.

## Best Practices

- Keep the parent agent enabled by default.
- Treat knowledge retrieval as a tool call, not as a separate chatbot mode.
- Keep workflows as executable playbooks. Do not turn every answer into a workflow.
- Keep workflow LLM nodes for specialized substeps, classification, summarization, or structured output.
- Use capability mode to decide whether the bot may query knowledge, read internal data, or write structured records.
- Keep UI copy user-facing. Users care about the assistant, sources, tasks, and results, not about the RAG implementation detail.
