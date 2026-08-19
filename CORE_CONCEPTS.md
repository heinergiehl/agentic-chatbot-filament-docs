# Core Concepts

This page explains the main building blocks of Filament Agentic Chatbot and links to the detailed docs for each one.

## The Short Version

Filament Agentic Chatbot gives you a Filament-native control plane for running grounded AI assistants inside a Laravel app.

The core flow is:

1. Create a **bot**
2. Create and assign its **main workflow**
3. Connect only the **Knowledge Sources**, **Data Resources**, **API Operations**, and other capabilities that workflow needs
4. Test the draft and its important saved scenarios
5. Review and **publish** a versioned deployment
6. Make that deployment the bot's single **live deployment**
7. Answer through the **chat widget** or your own frontend
8. Review **conversations**, workflow runs, and operating health inside Filament

## Concept Map

| Concept        | What It Means                                                                                             | Learn More                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Bot            | A configured assistant with its own prompt, model, permissions, access rules, and widget branding         | [Bots](BOTS.md)                                             |
| Main Workflow  | The visual conversation and capability contract assigned to a bot                                        | [Agentic Workflows](AGENTIC_WORKFLOWS.md)                   |
| Live Deployment | The one published main-workflow version currently receiving chat for a bot                               | [Agentic Workflows](AGENTIC_WORKFLOWS.md)                   |
| Capability     | An approved thing the bot or workflow may do, such as read knowledge, query data, call an operation, or write | [Bots](BOTS.md)                                          |
| Knowledge Source | A piece of knowledge you want the bot to use, such as text, a file, or a URL                            | [Knowledge Sources](KNOWLEDGE_SOURCES.md)                               |
| Data Resource  | A live Eloquent record set that workflows may read with approved columns, filters, sorting, limits, and scopes | [Data Resources](DATA_RESOURCES.md)                                      |
| Document       | The normalized stored version of a source after extraction                                                | [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)       |
| Chunk          | A smaller searchable section of a document used for retrieval and citations                               | [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)       |
| Ingestion      | The pipeline that extracts, normalizes, chunks, embeds, and stores source content                         | [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)       |
| Retrieval      | The step where relevant chunks are selected for a user question                                           | [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)       |
| Subworkflow    | A reusable workflow module pinned to a published deployment version                                       | [Agentic Workflows](AGENTIC_WORKFLOWS.md)                   |
| API Connector  | A saved external API connection profile reusable across workflows (base URL, auth, headers, timeout)      | [API Connectors](API_CONNECTORS.md)                         |
| API Operation  | A versioned action on a saved connector with fixed allowed inputs and side-effect policy                  | [API Connectors](API_CONNECTORS.md)                         |
| Widget         | The embeddable chat UI for websites or product frontends                                                  | [Chat Widget](CHAT_WIDGET.md)                               |
| Context Area   | The access scope for a bot, such as public, member, or admin                                              | [Context Areas](CONTEXT_AREAS.md)                           |
| Conversation   | A stored chat session for one bot and one session identifier                                              | [Conversations and Messages](CONVERSATIONS_AND_MESSAGES.md) |
| Message        | An individual user or assistant entry inside a conversation                                               | [Conversations and Messages](CONVERSATIONS_AND_MESSAGES.md) |

## How The Pieces Fit Together

### Bot

The bot is the central assistant definition. It decides:

- which model and provider answer questions
- which sources belong to it
- how strict retrieval should be
- which capabilities its workflow may use
- which users or areas can access it
- how the widget looks and behaves

### Sources, Documents, and Chunks

A source is the input. During ingestion, that source becomes a normalized document, and that document is split into chunks. Those chunks are what retrieval actually searches.

That means the bot does not search entire files or pages at once. It searches smaller grounded pieces of content.

### Data Resources

Data Resources are for live database answers, not semantic document search. Admins define approved Eloquent models and columns in **Data Resources**, then approve a narrowed subset per bot. Workflows can query those resources through `query_data_resource`, but they cannot invent columns, filters, sorts, or limits outside the configured policy.

### Retrieval and Answers

A reachable Knowledge step in the live workflow decides where approved sources are needed. Knowledge search embeds the query, finds relevant chunks, and supplies grounded context for the answer. Sources attached to a bot are never a deploymentless direct-answer path.

### Agent Workflows

The main workflow lets you add branching, questions, grounded answers, backend actions, API Operations, confirmation, and reusable subworkflows. Draft changes stay separate from the published live deployment until you explicitly publish and activate them.

Start with [the Quick Start golden path](QUICKSTART.md#7-golden-path-bot-to-live-deployment), recipes, and Simple Builder.

### Advanced Concepts

Custom actions, raw HTTP, expert nodes, schema details, and engine architecture are separate advanced topics. Read [Agentic Workflows](AGENTIC_WORKFLOWS.md), [Smart Workflow Builder](SMART_WORKFLOW_BUILDER.md), or [Agent Runtime Architecture](AGENT_RUNTIME_ARCHITECTURE.md) only when the normal path needs that depth.

### Conversations and Widget Runtime

The widget is only the interface layer. The bot, sources, retrieval, workflows, and conversations live in your Laravel app and are managed from Filament.

## Read These Next

- [Product Overview](PRODUCT_OVERVIEW.md)
- [Agent Runtime Architecture](AGENT_RUNTIME_ARCHITECTURE.md)
- [Bots](BOTS.md)
- [Knowledge Sources](KNOWLEDGE_SOURCES.md)
- [Data Resources](DATA_RESOURCES.md)
- [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)
- [Agentic Workflows](AGENTIC_WORKFLOWS.md)
- [API Connectors](API_CONNECTORS.md)
- [Chat Widget](CHAT_WIDGET.md)
