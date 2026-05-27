# Core Concepts

This page explains the main building blocks of Filament Agentic Chatbot and links to the detailed docs for each one.

## The Short Version

Filament Agentic Chatbot gives you a Filament-native control plane for running grounded AI assistants inside a Laravel app.

The core flow is:

1. Create a **bot**
2. Add **knowledge sources**
3. Let the system **ingest** those sources
4. Let the **assistant graph** decide whether to answer directly, search sources, or run a workflow
5. Retrieve relevant **chunks** when the answer needs knowledge grounding
6. Optionally guide task execution through an **agent workflow**
7. Answer through the **chat widget** or your own frontend
8. Review **conversations**, workflow runs, and operating health inside Filament

## Concept Map

| Concept        | What It Means                                                                                             | Learn More                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Bot            | A configured assistant with its own prompt, model, retrieval settings, access rules, and widget branding  | [Bots](BOTS.md)                                             |
| Assistant Graph | The default chat runtime that orchestrates memory, optional knowledge search, workflow execution, and direct replies | [Agent Runtime Architecture](AGENT_RUNTIME_ARCHITECTURE.md) |
| Knowledge Source | A piece of knowledge you want the bot to use, such as text, a file, or a URL                            | [Sources](RAG_SOURCES.md)                                   |
| Document       | The normalized stored version of a source after extraction                                                | [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)       |
| Chunk          | A smaller searchable section of a document used for retrieval and citations                               | [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)       |
| Ingestion      | The pipeline that extracts, normalizes, chunks, embeds, and stores source content                         | [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)       |
| Retrieval      | The step where relevant chunks are selected for a user question                                           | [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)       |
| Agent Workflow | A visual runtime that adds branching, actions, handoffs, or integrations on top of grounded chat behavior | [Agentic Workflows](AGENTIC_WORKFLOWS.md)                   |
| API Connector  | A saved external API connection profile reusable across workflows (base URL, auth, headers, timeout)      | [API Connectors](API_CONNECTORS.md)                         |
| Widget         | The embeddable chat UI for websites or product frontends                                                  | [Chat Widget](CHAT_WIDGET.md)                               |
| Context Area   | The access scope for a bot, such as public, member, or admin                                              | [Context Areas](CONTEXT_AREAS.md)                           |
| Conversation   | A stored chat session for one bot and one session identifier                                              | [Conversations and Messages](CONVERSATIONS_AND_MESSAGES.md) |
| Message        | An individual user or assistant entry inside a conversation                                               | [Conversations and Messages](CONVERSATIONS_AND_MESSAGES.md) |

## How The Pieces Fit Together

### Bot

The bot is the central runtime definition. It decides:

- which model and provider answer questions
- which sources belong to it
- how strict retrieval should be
- which users or areas can access it
- how the widget looks and behaves

### Sources, Documents, and Chunks

A source is the input. During ingestion, that source becomes a normalized document, and that document is split into chunks. Those chunks are what retrieval actually searches.

That means the bot does not search entire files or pages at once. It searches smaller grounded pieces of content.

### Retrieval and Answers

When a user asks a question:

1. the assistant graph receives the latest message plus conversation state
2. the assistant decides whether uploaded sources are needed
3. knowledge search embeds the query and finds relevant chunks
4. retrieved chunks are formatted as context
5. the model returns a grounded answer, often with citations

### Agent Workflows

Workflows are optional, but they are what make this product more than a knowledge-only assistant.

They let you add branching logic, AI classification, backend actions, connector calls, and safer release management on top of the assistant answer flow.

### Runtime Naming

The codebase still contains names such as `RagBot`, `RagSource`, and `RagAgent` for backward compatibility. Product behavior should be understood differently:

- the **bot** is the persisted assistant configuration
- the **assistant graph** is the default chat runtime
- **knowledge search** is the source-grounding capability used through `KnowledgeSearchTool`
- `ParentAgent` and `RagAgent` are legacy compatibility aliases, not the main chatbot architecture

### Conversations and Widget Runtime

The widget is only the interface layer. The bot, sources, retrieval, workflows, and conversations live in your Laravel app and are managed from Filament.

## Read These Next

- [Product Overview](PRODUCT_OVERVIEW.md)
- [Agent Runtime Architecture](AGENT_RUNTIME_ARCHITECTURE.md)
- [Bots](BOTS.md)
- [Sources](RAG_SOURCES.md)
- [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)
- [Agentic Workflows](AGENTIC_WORKFLOWS.md)
- [API Connectors](API_CONNECTORS.md)
- [Chat Widget](CHAT_WIDGET.md)
