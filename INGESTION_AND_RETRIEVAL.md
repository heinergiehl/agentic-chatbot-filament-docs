# Ingestion And Retrieval

This page explains how content enters the system and how the bot finds relevant context at question time.

## Ingestion

Ingestion is the pipeline that prepares source content for retrieval. It runs on Laravel queues so it does not block your application.

### Supported Source Types

| Source Type | Description | Example |
|-------------|-------------|---------|
| **Text** | Raw text content pasted directly | Product FAQ, policy text, release notes |
| **File** | Uploaded documents | PDF manuals, text files |
| **URL** | Public web pages crawled and extracted | Documentation sites, blog posts, help articles |

### What Happens During Ingestion

For each source, the plugin:

1. **Extracts** readable content (HTML parsing for URLs, PDF extraction for files, raw text for text sources)
2. **Normalizes** the text (strips boilerplate, normalizes whitespace)
3. **Chunks** the content into smaller searchable sections
4. **Embeds** each chunk using the configured embedding model
5. **Stores** the document and chunk records in the database
6. **Writes vectors** to the configured vector backend

If all steps succeed, the source status moves to `completed`. If any step fails, the source shows `failed` with error details visible in the Filament panel.

### Chunking Strategy

The plugin splits content into overlapping chunks to preserve context across boundaries:

| Setting | Env Variable | Default | Description |
|---------|-------------|---------|-------------|
| Chunk size | `RAG_CHUNK_SIZE_TOKENS` | 1200 chars | Maximum size of each chunk |
| Overlap | `RAG_CHUNK_OVERLAP_TOKENS` | 200 chars | How much text overlaps between adjacent chunks |
| Token mode | `RAG_CHUNK_USE_ESTIMATED_TOKENS` | `false` | Use token-based sizing instead of character-based |
| Tokenizer | `RAG_CHUNK_TOKENIZER_ENCODING` | `cl100k_base` | Tokenizer encoding when using token mode |
| Batch size | — | 20 | Number of chunks embedded per API call |
| Max chunks | — | 500 | Maximum chunks per source |

**When to adjust chunking:**

- Increase chunk size for long-form content where context spans many paragraphs
- Decrease chunk size for FAQ-style content where each answer is self-contained
- Increase overlap when answers frequently span chunk boundaries
- Switch to token mode when precise cost control matters

### Embedding Models

The embedding model converts text chunks into vector representations for similarity search. Configure it in `.env`:

```env
RAG_EMBEDDING_PROVIDER=gemini
RAG_EMBEDDING_MODEL=gemini-embedding-001
RAG_VECTOR_DIMENSIONS=1536
```

The plugin supports any embedding provider compatible with `laravel/ai`. Per-bot embedding provider overrides are also available.

## Vector Backends

Vectors are stored in a dedicated backend optimized for similarity search.

### pgvector (Recommended)

PostgreSQL with the `pgvector` extension. This is the recommended backend because:

- runs alongside your existing PostgreSQL database
- no additional infrastructure required
- supports exact and approximate nearest neighbor search
- production-proven at scale

```env
RAG_VECTOR_BACKEND=pgvector
RAG_DB_CONNECTION=rag_pgsql
RAG_DB_HOST=127.0.0.1
RAG_DB_PORT=5432
RAG_DB_DATABASE=filament_agentic_chatbot
RAG_DB_USERNAME=postgres
RAG_DB_PASSWORD=secret
```

> **Important:** The plugin uses its own database connection (`RAG_DB_CONNECTION`) so vector data stays separate from your main application database.

### ChromaDB

A standalone vector database. Use this when you want to separate vector storage from PostgreSQL entirely:

```env
RAG_VECTOR_BACKEND=chroma
RAG_CHROMA_URL=http://127.0.0.1:8001
RAG_CHROMA_TOKEN=your-token
RAG_CHROMA_COLLECTION=filament-agentic-chatbot
```

## Retrieval

Retrieval is the runtime step that finds relevant chunks when the user asks a question or a workflow Knowledge Base node runs.

### What Happens During Retrieval

1. The user message is embedded using the same model that embedded the chunks
2. The vector backend finds the nearest chunks by cosine similarity
3. Chunk filtering applies `top_k` and `min_similarity` thresholds
4. The selected chunks are formatted as context with metadata
5. The chat model generates an answer grounded in that context

This is what keeps the assistant grounded in your documentation instead of relying only on the base model's training data.

### Retrieval Settings

All settings are configurable per bot from the Filament panel and as global defaults in `.env`:

| Setting | Env / Config | Default | Description |
|---------|-------------|---------|-------------|
| **top_k** | `retrieval.top_k` | 6 | How many chunks to retrieve |
| **min_similarity** | `retrieval.min_similarity` | 0.65 | Minimum cosine similarity threshold |
| **Context budget** | `retrieval.max_context_chars` | 12000 | Maximum characters of context sent to the model |

**Tuning guidance:**

- **top_k** — higher values give broader context but may include less relevant chunks and increase cost. Lower values are tighter but risk missing relevant content.
- **min_similarity** — higher values (e.g., 0.8) only return strong matches. Lower values (e.g., 0.5) are more forgiving but may include noise.
- **Context budget** — too low removes helpful context. Too high adds noise and increases token cost.

## Citations

Each chunk stores metadata for citation display:

- Source name
- Section or heading
- Page number (for PDFs)
- Canonical source URL (when available)

The widget uses this metadata to show inline citations and deep links back to the original source.

## Re-Ingesting Sources

Re-ingest when:

- The source content has changed (updated docs, new FAQ entries)
- You changed the chunking strategy (size, overlap, token mode)
- You switched embedding models or dimensions
- You changed the vector backend
- Retrieval quality has degraded after configuration changes

Use the **Re-ingest** action on individual sources or the bulk re-ingest on the bot page inside Filament. Re-ingestion replaces all existing chunks for that source.

## Queue Behavior

Ingestion runs on Laravel queues by default. That means:

- Source status stays `pending` briefly while the worker picks it up
- Multiple sources can be ingested in parallel depending on your worker count
- Failed jobs are retried according to your queue retry configuration

Configure the ingestion queue in `.env`:

```env
RAG_INGESTION_QUEUE_CONNECTION=redis
RAG_INGESTION_QUEUE=ingestion
```

If ingestion stays `pending` too long:

1. Confirm the queue worker is running (`php artisan queue:work`)
2. Check the source's error details in the Filament panel
3. Run `php artisan filament-agentic-chatbot:doctor` for diagnostics

## Related Docs

- [RAG Sources](RAG_SOURCES.md) — creating and managing sources
- [Bots](BOTS.md) — per-bot retrieval configuration
- [Core Concepts](CORE_CONCEPTS.md) — how ingestion fits into the overall architecture
