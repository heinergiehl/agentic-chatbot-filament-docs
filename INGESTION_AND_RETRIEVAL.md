# Ingestion and Retrieval

This page explains how content enters the system and how the bot finds relevant context later.

## Ingestion

Ingestion is the pipeline that prepares source content for retrieval.

### What Happens During Ingestion

For each source, Filament RAG:

1. extracts readable content
2. normalizes the text
3. splits the content into chunks
4. creates embeddings for those chunks
5. stores the document and chunks
6. writes vectors to the configured backend

If all steps succeed, the source moves to `completed`.

## Retrieval

Retrieval is the runtime step that finds relevant chunks when the user asks a question.

### What Happens During Retrieval

1. the user message is embedded
2. the vector backend finds nearby chunks
3. chunk filtering applies `top_k` and `min_similarity`
4. the selected chunks are formatted as context
5. the chat model answers from that context

This is what makes the chatbot grounded in your docs instead of relying only on the base model.

## Important Retrieval Settings

### `top_k`

Controls how many chunks are retrieved.

- higher = broader context
- lower = tighter context

### `min_similarity`

Controls how strict the relevance filter is.

- higher = only strong matches
- lower = more forgiving retrieval

### Context Budget

Limits how much retrieved text can be sent into the answer prompt.

Too low can remove helpful context. Too high can add noise and cost.

## Why Citations Work

Each chunk keeps metadata such as:

- source name
- section or heading
- page number for PDFs when available
- canonical source link when available

That metadata is used to show citations and deep links in the widget.

## Re-Ingesting Sources

Re-ingest when:

- the source content changed
- chunking strategy changed
- embedding model changed
- vector backend changed
- retrieval quality dropped after config changes

Use the source or bot re-ingest actions inside Filament to rebuild indexed content.

## Queue Behavior

Ingestion normally runs on Laravel queues.

That means source status can stay `pending` for a short time while the worker picks it up.

If it stays pending too long:

- confirm the queue worker is running
- inspect the source error details
- run `php artisan filament-agentic-chatbot:doctor`

## Related Docs

- [RAG Sources](/docs/rag-sources)
- [Operations](/docs/operations)
- [Security and Privacy](/docs/security-and-privacy)
