# Core Concepts

This page explains the main building blocks of Filament Agentic Chatbot and how the classic RAG layer connects to the newer workflow layer.

## The Short Version

Filament Agentic Chatbot gives you a Filament-native control plane for running AI assistants inside a Laravel app.

The core flow can be as simple as:

1. Create a **bot**
2. Add **RAG sources**
3. Let the system **ingest** those sources
4. Retrieve relevant **chunks** at question time
5. Answer through the **chat widget** or your own frontend

Or it can become more advanced:

1. Trigger a **workflow**
2. Collect input or inspect the conversation state
3. Retrieve knowledge from the knowledge base
4. Route through **conditions**, **switches**, and **AI agent** nodes
5. Call **actions** or **HTTP APIs**
6. Return a guided response or complete a task

## Concept Map

| Concept       | What It Means                                                                                                               | Learn More                                            |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Bot           | A configured assistant with its own prompt, model, retrieval settings, access rules, widget branding, and workflow behavior | [Bots](BOTS.md)                                       |
| RAG Source    | A piece of knowledge the bot can use, such as text, a file, or a URL                                                        | [RAG Sources](RAG_SOURCES.md)                         |
| Document      | The normalized stored version of a source after extraction                                                                  | [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md) |
| Chunk         | A smaller searchable section of a document used for retrieval and citations                                                 | [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md) |
| Ingestion     | The pipeline that extracts, normalizes, chunks, embeds, and stores source content                                           | [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md) |
| Retrieval     | The step where relevant chunks are selected for a user question or workflow step                                            | [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md) |
| Workflow      | A multi-step conversation graph that can ask questions, branch, retrieve context, and take actions                          | [Agentic Workflows](AGENTIC_WORKFLOWS.md)             |
| Node          | One workflow building block such as `collectInput`, `condition`, `aiAgent`, or `knowledgeBase`                              | [Workflow JSON Schema](WORKFLOW_JSON_SCHEMA.md)       |
| Action        | A backend capability invoked from a workflow, such as creating a ticket or sending data onward                              | [Agentic Workflows](AGENTIC_WORKFLOWS.md)             |
| API Connector | A saved external API profile (base URL, auth, headers, timeout) reusable across workflows                                   | [API Connectors](API_CONNECTORS.md)                   |
| Widget        | The embeddable chat UI for websites or product frontends                                                                    | [Chat Widget](CHAT_WIDGET.md)                         |
| Context Area  | The access scope for a bot, such as public, member, or admin                                                                | [Bots](BOTS.md)                                       |
| Conversation  | A stored chat session for one bot and one session identifier                                                                | [Product Overview](PRODUCT_OVERVIEW.md)               |

## How The Pieces Fit Together

### Bot

The bot is the main runtime definition. It decides:

- which model and provider respond
- which sources belong to it
- how strict retrieval should be
- which users or areas can access it
- how the widget looks and behaves
- whether the experience behaves like a straightforward chatbot or a workflow-driven assistant

### Sources, Documents, and Chunks

A source is the input. During ingestion, that source becomes a normalized document, and that document is split into chunks. Those chunks are what retrieval actually searches.

That means the bot does not search whole files or pages at once. It searches smaller grounded pieces of content.

### Retrieval and Answers

When a user asks a question, the system can:

1. embed the query
2. find relevant chunks
3. format those chunks as context
4. send that context to the model or workflow node
5. return an answer, often with citations

### Workflows and Actions

Workflows add orchestration on top of the RAG layer.

Instead of always producing one direct answer, a workflow can:

- ask follow-up questions
- classify intent
- route to different branches
- combine retrieval with AI processing
- call backend actions or external APIs
- send a final answer, summary, or next-step message

### Conversations and Widget Runtime

The widget is the interface layer. The bot, sources, workflows, retrieval, and conversations live in your Laravel app and are managed from Filament.

## Read These Next

- [Product Overview](PRODUCT_OVERVIEW.md)
- [How It Differs From Filament RAG](HOW_IT_DIFFERS_FROM_FILAMENT_RAG.md)
- [Agentic Workflows](AGENTIC_WORKFLOWS.md)
- [API Connectors](API_CONNECTORS.md)
- [Workflow Prompt Templates](WORKFLOW_PROMPT_TEMPLATES.md)
- [Quickstart](QUICKSTART.md)
