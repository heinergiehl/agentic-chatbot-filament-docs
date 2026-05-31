# Ingestion And Retrieval

This page explains how content enters the system and how the assistant finds relevant context at question time.

Retrieval is a capability used by the runtime. In the default architecture, the assistant calls `KnowledgeSearchTool` only when uploaded sources are available and the user question needs source-backed knowledge. Workflows can also call the same retrieval layer through Knowledge Base nodes.

## Ingestion

Ingestion is the pipeline that prepares source content for retrieval. It runs on Laravel queues so it does not block your application.

### Supported Source Types

| Source Type | Description                                      | Example                                        |
| ----------- | ------------------------------------------------ | ---------------------------------------------- |
| **Text**    | Raw text content pasted directly                 | Product FAQ, policy text, release notes        |
| **File**    | Uploaded documents                               | PDF manuals, text files                        |
| **URL**     | Public web pages crawled and extracted           | Documentation sites, blog posts, help articles |
| **API**     | JSON records fetched through a saved connector   | Product catalogs, CMS records, public datasets |

### What Happens During Ingestion

For each source, the plugin:

1. **Extracts** readable content (HTML parsing for URLs, PDF extraction for files, raw text for text sources, JSON field mapping for API sources)
2. **Normalizes** the text (strips boilerplate, normalizes whitespace)
3. **Chunks** the content into smaller searchable sections
4. **Embeds** each chunk using the configured embedding model
5. **Stores** the document and chunk records in the database
6. **Writes vectors** to the configured vector backend

If all steps succeed, the source status moves to `completed`. If any step fails, the source shows `failed` with error details visible in the Filament panel.

### Safe URL Fetching

URL sources are fetched through a safe HTTP fetcher before extraction:

| Setting | Env / Config | Default | Description |
| ------- | ------------ | ------- | ----------- |
| Max bytes | `AGENTIC_CHATBOT_INGESTION_MAX_FETCH_BYTES` | 5 MiB | Stops oversized responses before extraction |
| Max redirects | `AGENTIC_CHATBOT_INGESTION_MAX_REDIRECTS` | 3 | Follows a small redirect chain and revalidates every hop |
| Private network guard | `AGENTIC_CHATBOT_ALLOW_PRIVATE_NETWORK_URLS` | `false` | Blocks localhost, RFC1918, reserved, and private IP targets |
| Content types | `ingestion.allowed_content_types` | HTML, text, Markdown, PDF | Rejects unsupported response bodies for URL ingestion |

Redirect targets are resolved and checked per hop, so a public URL cannot redirect into localhost or a private subnet unless private-network ingestion is explicitly enabled. User-facing ingestion errors use stable categories such as unsafe URL, unsupported content type, oversized response, or too many redirects.

HTML table extraction now renders tables as valid Markdown with a header separator row, which gives the chunker and retrieval layer a more predictable text representation.

### API Knowledge Sources

API sources let an existing **API Connector** feed structured JSON records into the bot's knowledge base. In the source form, choose a connector, endpoint path, records JSON path, stable record ID path, and a content mapping template such as:

```text
{{name}}

{{description}}

Price: {{price}} EUR
```

Each mapped API record becomes its own knowledge document, so citations can point back to the record URL when `url_path` is configured. API Connector authentication is reused for the fetch. Paginated APIs can use page-number, offset, cursor, or response-provided next URL pagination with `max_pages` and `max_records` safety limits. Auto sync can periodically queue API sources through `php artisan filament-agentic-chatbot:sync-knowledge-sources`. After a successful re-ingest, previous API documents for that source are replaced, which removes records that no longer appear in the API response while preserving the old index if the new sync fails. Use workflow API Connector nodes instead for live/user-specific data such as order status, account balances, or actions that write to another system.

### Chunking Strategy

The plugin splits content into overlapping chunks to preserve context across boundaries:

| Setting    | Env Variable                     | Default       | Description                                       |
| ---------- | -------------------------------- | ------------- | ------------------------------------------------- |
| Chunk size | `AGENTIC_CHATBOT_CHUNK_SIZE_TOKENS`          | 1200 chars    | Maximum size of each chunk                        |
| Overlap    | `AGENTIC_CHATBOT_CHUNK_OVERLAP_TOKENS`       | 200 chars     | How much text overlaps between adjacent chunks    |
| Token mode | `AGENTIC_CHATBOT_CHUNK_USE_ESTIMATED_TOKENS` | `false`       | Use token-based sizing instead of character-based |
| Tokenizer  | `AGENTIC_CHATBOT_CHUNK_TOKENIZER_ENCODING`   | `cl100k_base` | Tokenizer encoding when using token mode          |
| Batch size | —                                | 20            | Number of chunks embedded per API call            |
| Max chunks | —                                | 500           | Maximum chunks per source                         |

**When to adjust chunking:**

- Increase chunk size for long-form content where context spans many paragraphs
- Decrease chunk size for FAQ-style content where each answer is self-contained
- Increase overlap when answers frequently span chunk boundaries
- Switch to token mode when precise cost control matters

### Embedding Models

The embedding model converts text chunks into vector representations for similarity search. Configure it in `.env`:

```env
AGENTIC_CHATBOT_EMBEDDING_PROVIDER=gemini
AGENTIC_CHATBOT_EMBEDDING_MODEL=gemini-embedding-001
AGENTIC_CHATBOT_VECTOR_DIMENSIONS=1536
```

The plugin supports any embedding provider compatible with `laravel/ai`. Per-bot embedding provider overrides are also available.

Supported embedding providers in the package credential checks are Gemini, OpenAI, OpenRouter, Mistral, Ollama, Azure OpenAI, Cohere, Jina AI, and Voyage AI. DeepSeek, Groq, Anthropic, and xAI are chat providers only in the current Laravel AI SDK, so keep `AGENTIC_CHATBOT_EMBEDDING_PROVIDER` on an embedding-capable provider even when the chat model uses one of those providers.

## Vector Backends

Vectors are stored in a dedicated backend optimized for similarity search.

### pgvector (Recommended)

PostgreSQL with the `pgvector` extension. This is the recommended backend because:

- runs alongside your existing PostgreSQL database
- no additional infrastructure required
- supports exact and approximate nearest neighbor search
- production-proven at scale

```env
AGENTIC_CHATBOT_VECTOR_BACKEND=pgvector
AGENTIC_CHATBOT_DB_CONNECTION=agentic_chatbot_pgsql
AGENTIC_CHATBOT_DB_HOST=127.0.0.1
AGENTIC_CHATBOT_DB_PORT=5432
AGENTIC_CHATBOT_DB_DATABASE=filament_agentic_chatbot
AGENTIC_CHATBOT_DB_USERNAME=postgres
AGENTIC_CHATBOT_DB_PASSWORD=secret
```

> **Important:** The plugin uses its own database connection (`AGENTIC_CHATBOT_DB_CONNECTION`) so vector data stays separate from your main application database.

### ChromaDB

A standalone vector database. Use this when you want to separate vector storage from PostgreSQL entirely:

```env
AGENTIC_CHATBOT_VECTOR_BACKEND=chroma
AGENTIC_CHATBOT_CHROMA_URL=http://127.0.0.1:8001
AGENTIC_CHATBOT_CHROMA_TOKEN=your-token
AGENTIC_CHATBOT_CHROMA_COLLECTION=filament-agentic-chatbot
```

Chroma filtering is strict by default. If all nearest-neighbor results fall below the configured threshold, retrieval returns no chunks. `AGENTIC_CHATBOT_CHROMA_ALLOW_THRESHOLD_BYPASS=true` restores the old lenient behavior, marks returned chunks with `threshold_bypassed=true`, and logs the bypass for diagnosis.

## Retrieval

Retrieval is the runtime step that finds relevant chunks when the assistant uses `KnowledgeSearchTool` or a workflow Knowledge Base node runs.

### What Happens During Retrieval

1. The user message is embedded using the same model that embedded the chunks
2. The vector backend finds the nearest chunks by cosine similarity
3. Chunk filtering applies `top_k` and `min_similarity` thresholds
4. The selected chunks are formatted as context with metadata
5. The assistant or workflow AI step generates an answer grounded in that context

This is what keeps the assistant grounded in your documentation instead of relying only on the base model's training data.

### Retrieval Settings

All settings are configurable per bot from the Filament panel and as global defaults in `.env`:

| Setting            | Env / Config                  | Default | Description                                     |
| ------------------ | ----------------------------- | ------- | ----------------------------------------------- |
| **top_k**          | `retrieval.top_k`             | 6       | How many chunks to retrieve                     |
| **min_similarity** | `retrieval.min_similarity`    | 0.65    | Minimum cosine similarity threshold             |
| **Context budget** | `retrieval.max_context_chars` | 12000   | Maximum characters of context sent to the model |
| **Lexical fallback** | `retrieval.hybrid.lexical_strategy` | `simple_like` | `simple_like`, `postgres_fts`, or `disabled` |

**Tuning guidance:**

- **top_k** — higher values give broader context but may include less relevant chunks and increase cost. Lower values are tighter but risk missing relevant content.
- **min_similarity** — higher values (e.g., 0.8) only return strong matches. Lower values (e.g., 0.5) are more forgiving but may include noise.
- **Context budget** — too low removes helpful context. Too high adds noise and increases token cost.
- **Lexical fallback** — `simple_like` is compatible with every database, `postgres_fts` is PostgreSQL-only, and `disabled` keeps retrieval vector-only.

### Knowledge Readiness

The assistant receives `KnowledgeSearchTool` only when a bot has at least one completed source with chunks. Completed sources without chunks, pending sources, and failed sources do not make the tool available.

The public config endpoint includes additive `bot.knowledge_health`:

```json
{
  "has_sources": true,
  "ready_sources": 1,
  "chunk_count": 42,
  "source_status_counts": {
    "completed": 1,
    "pending": 1
  },
  "is_ready": true
}
```

Use this to explain empty states in custom widgets or host dashboards without changing existing response keys.

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

Deleting a source queues vector cleanup. Chroma receives the collected chunk IDs and deletes matching vector IDs asynchronously; pgvector remains idempotent because vectors live on database chunk rows that are removed by cascade.

## Queue Behavior

Ingestion runs on Laravel queues by default. That means:

- Source status stays `pending` briefly while the worker picks it up
- Multiple sources can be ingested in parallel depending on your worker count
- Failed jobs are retried according to your queue retry configuration

Configure the ingestion queue in `.env`:

```env
AGENTIC_CHATBOT_INGESTION_QUEUE_CONNECTION=redis
AGENTIC_CHATBOT_INGESTION_QUEUE=ingestion
```

If ingestion stays `pending` too long:

1. Confirm the queue worker is running (`php artisan queue:work`)
2. Check the source's error details in the Filament panel
3. Run `php artisan filament-agentic-chatbot:doctor` for diagnostics

## Related Docs

- [Knowledge Sources](KNOWLEDGE_SOURCES.md) — creating and managing sources
- [Bots](BOTS.md) — per-bot retrieval configuration
- [Agent Runtime Architecture](AGENT_RUNTIME_ARCHITECTURE.md) — how retrieval fits into the parent-agent runtime
- [Core Concepts](CORE_CONCEPTS.md) — how ingestion fits into the overall architecture
