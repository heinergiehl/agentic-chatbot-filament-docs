# Ingestion And Retrieval

This page explains how content enters the system and how the assistant finds relevant context at question time.

Retrieval is a deployment-pinned Agent capability. A published Agent receives a
closed knowledge-search tool only for the exact completed sources and retrieval
policy copied into its immutable deployment. A Playbook may also declare a
bounded Knowledge Capability step. Neither path reads mutable, implicit, or
globally available sources.

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
| Max bytes | `AGENTIC_CHATBOT_INGESTION_MAX_FETCH_BYTES` | 5 MiB | Caps cumulative response bytes for one URL redirect chain or API pagination fetch; headers and transfer progress are checked before mapping |
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

Each mapped API record becomes its own knowledge document, so citations can point back to the record URL when `url_path` is configured. API Connector authentication is reused for the fetch. Paginated APIs can use page-number, offset, cursor, or response-provided next URL pagination with `max_pages` and `max_records` safety limits. The same `AGENTIC_CHATBOT_INGESTION_MAX_FETCH_BYTES` budget applies across all pages in one fetch, so a chunked or misleadingly declared response cannot grow without bound before JSON mapping. Auto sync can periodically queue API sources through `php artisan filament-agentic-chatbot:sync-knowledge-sources`. After a successful re-ingest, previous API documents for that source are replaced, which removes records that no longer appear in the API response while preserving the old index if the new sync fails. Use workflow API Connector nodes instead for live/user-specific data such as order status, account balances, or actions that write to another system.

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

Chroma filtering is strict. If all nearest-neighbor results fall below the configured threshold, retrieval returns no chunks. There is no threshold-bypass compatibility path.

## Retrieval

Retrieval finds relevant chunks when the published Agent searches its pinned knowledge or a Playbook runs a knowledge Capability step.

### What Happens During Retrieval

1. The bot resolves one explicit strategy: `vector`, `hybrid`, or `lexical_only`.
2. Vector search embeds the message and applies `top_k` plus `min_similarity`; lexical search uses its configured engine, candidate limit, timeout, and named calibration profile.
3. Candidates must match the configured index version. Vector candidates must also match the embedding provider, model, and dimensions stamped during ingestion.
4. Hybrid retrieval combines the two ranked lists using weights from the selected calibration profile. It reports degradation if one configured modality is unavailable.
5. An optional reranker runs only when its provider/model has a verified reranking capability and its candidate/input-token budgets permit the call.
6. Only sufficient evidence is formatted into the G19 token-aware context budget. Insufficient evidence reaches the final answerability gate as an abstention signal, not as answer context.

This is what keeps the assistant grounded in your documentation instead of relying only on the base model's training data.

### Retrieval Settings

All settings are configurable per bot from the Filament panel and as global defaults in `.env`:

| Setting | Env / Config | Default | Description |
| --- | --- | --- | --- |
| **Strategy** | `AGENTIC_CHATBOT_RETRIEVAL_STRATEGY` / `retrieval.strategy` | `vector` | Explicitly selects `vector`, `hybrid`, or `lexical_only` |
| **Index version** | `AGENTIC_CHATBOT_RETRIEVAL_INDEX_VERSION` / `retrieval.index_version` | `g21-knowledge-index-v1` | Version stamped on chunks and checked at retrieval |
| **top_k** | `retrieval.top_k` | 6 | How many chunks to retrieve |
| **min_similarity** | `retrieval.min_similarity` | 0.65 | Minimum vector similarity |
| **Context budget** | `AGENTIC_CHATBOT_RETRIEVAL_CONTEXT_BUDGET_TOKENS` / `retrieval.context_budget_tokens` | G19 retrieved-evidence lane | Maximum token budget for formatted evidence |
| **Lexical engine** | `AGENTIC_CHATBOT_RETRIEVAL_LEXICAL_ENGINE` / `retrieval.lexical.engine` | `postgres_fts` | `postgres_fts` or explicitly bounded `simple_like` |
| **Lexical candidates** | `AGENTIC_CHATBOT_RETRIEVAL_LEXICAL_CANDIDATE_LIMIT` | 200 | Hard pre-scoring candidate bound |
| **Lexical timeout** | `AGENTIC_CHATBOT_RETRIEVAL_LEXICAL_STATEMENT_TIMEOUT_MS` | 750 ms | PostgreSQL transaction-local statement timeout |
| **Calibration profile** | `AGENTIC_CHATBOT_RETRIEVAL_LEXICAL_CALIBRATION_PROFILE` | `de_en_v1` | Named dataset/version with thresholds and rank weights |
| **Reranker** | `AGENTIC_CHATBOT_RETRIEVAL_RERANKER_ENABLED` | `false` | Explicit capability- and budget-gated reranking stage |

**Tuning guidance:**

- **top_k** — higher values give broader context but may include less relevant chunks and increase cost. Lower values are tighter but risk missing relevant content.
- **min_similarity** — higher values (e.g., 0.8) only return strong matches. Lower values (e.g., 0.5) are more forgiving but may include noise.
- **Context budget** — too low removes helpful context. Too high adds noise and increases token cost. It is enforced with the same model-aware token profiles as G19.
- **Lexical retrieval** — do not copy scoring weights or thresholds to another corpus without a versioned evaluation dataset. PostgreSQL FTS is the production default; unindexed `simple_like` requires an explicit bounded small-dataset opt-in.

### Retrieval resilience and answerability

Retrieval returns a typed result with `status`, `strategy`, `evidence_quality`, `evidence_score`, chunks, safe diagnostics, and error codes. Status is one of `success`, `empty`, `insufficient_evidence`, `degraded`, `unavailable`, or `failed`. In `hybrid` mode, a vector or lexical failure can produce a degraded result only when the remaining evidence is sufficient. `vector` and `lexical_only` never invoke the other modality implicitly.

Diagnostics contain a query fingerprint, per-stage latency/candidate counts, index version plus embedding identity, selected strategy, calibration dataset/version, and reranker budget/capability status. They do not contain the raw retrieval query. Workflow traces and terminal workflow variables also redact raw retrieval-query values.

The immutable Agent deployment pins the exact knowledge sources available to a
turn. `AgentKnowledgeTurn` exposes one bounded `search_agent_knowledge` tool only
when such pins exist, and every search crosses `CapabilityExecutionGateway`.
The gateway accepts only usable retrieval evidence from those sources; empty,
insufficient, degraded-below-threshold, unavailable, and failed results become
an explicit no-evidence result. The Agent must cite only supplied reference
numbers and answer naturally that reliable published evidence was unavailable
instead of inventing a grounded answer. There is no second answer-composer or
shadow answerability runtime that can override this result.

```php
'grounding' => [
    'default_mode' => 'optional',
    'source_backed_topics' => [],
    'minimum_evidence_count' => 1,
    'minimum_answerability' => 0.70,
    'abstain_when_unavailable' => true,
],
```

Knowledge retrieval output is an untrusted structured envelope containing the retrieval strategy, evidence quality, degradation state, evidence reference range, and bounded context. Citation IDs are checked against the final evidence pack; invalid IDs are removed before output. Context truncation happens at sentence or word boundaries rather than cutting a sentence mid-stream. Once retrieval has been attempted, an insufficient result cannot be rewritten into a grounded answer by the assistant or response composer.

Run `php artisan migrate` to create the PostgreSQL FTS index, then re-ingest every source after first adopting G21 or whenever the index version or embedding identity changes. Existing unstamped chunks are intentionally incompatible. Run `composer eval:retrieval-quality` before deployment and whenever a calibration dataset/profile changes.

### Knowledge Readiness

An Agent knowledge capability can retrieve evidence only when the Agent
deployment pins at least one completed source with chunks. Completed sources
without chunks, pending sources, failed sources, and mutable authoring-only
attachments do not make retrieval ready.

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
