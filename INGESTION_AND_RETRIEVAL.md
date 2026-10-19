# Ingestion And Retrieval

This page explains how content enters the system and how the assistant finds relevant context at question time.

Retrieval is a deployment-pinned Agent tool. A published Agent receives a
closed knowledge-search tool only for the exact sources, index profile and
retrieval policy copied into its immutable deployment. A Workflow may also
declare a bounded Knowledge Tool step. Neither path reads mutable,
implicit, or globally available sources. Which completed generation of a pinned
source is read depends on the version's knowledge update mode (ADR 0046, see
Knowledge update modes below).

## Ingestion

Ingestion is the pipeline that prepares source content for retrieval. It runs on Laravel queues so it does not block your application.

### Supported Source Types

| Source Type | Description                                      | Example                                        |
| ----------- | ------------------------------------------------ | ---------------------------------------------- |
| **Text**    | Raw text content pasted directly                 | Product FAQ, policy text, release notes        |
| **Files**    | Up to 50 uploaded files, one document per file   | PDF manuals, DOCX files, CSV and XLSX tables   |
| **Website**     | Same-host crawl, sitemap or explicit single page | Documentation sites, blog posts, help articles |
| **API**     | JSON records fetched through a saved API connection   | Product catalogs, CMS records, public datasets |

### What Happens During Ingestion

For each source, the plugin:

1. **Extracts** readable content (HTML parsing for URLs, PDF, DOCX, CSV and XLSX extraction for files, raw text for text sources, JSON field mapping for API sources)
2. **Normalizes** the text (strips boilerplate, normalizes whitespace)
3. **Chunks** the content into smaller searchable sections
4. **Embeds** each chunk using the configured embedding model
5. **Stores** the document and chunk records in the database
6. **Writes vectors** to the configured vector backend

If all steps succeed, the source status moves to `completed`. If any step fails, the source shows `failed` with error details visible in the Filament panel.

### Safe Website Fetching

Website sources use the shared outbound SSRF guard on every request and every
redirect, pinning checked public DNS addresses into the connection. Only the
exact host is allowed, with no HTTPS downgrade and no private-network override.
The user agent is `filament-agentic-chatbot/1.0`. robots.txt failure other than
404/410 fails discovery closed. Shared cache locks enforce two in-flight
requests per host and a shared start interval of at least 500 ms, increased by
Crawl-delay (clamped to 0.5 through 10 seconds).

Bounds: 5 MiB per response and decompressed sitemap, five redirects, link depth
five, sitemap nesting three levels below the root, 50,000 URLs per sitemap,
maximum pages 1 through 2,000 (default 200), and total requests no more than
`maximum pages × 3 + 20`. Website pages accept HTML, XHTML and plain text only;
PDFs and other formats are skipped. Sitemaps accept XML and gzip.

`bot_website_crawl_runs` holds durable status, progress counters, up to 50
translated errors, a work checkpoint and `dateTime` business dates. Each queue
delivery performs one discovery/fetch unit or one provider batch. Interrupted
deliveries resume the staged generation. Only completion activates it, under
the existing source and Agent locks. Cancellation, discovery failure, capacity
refusal and a heartbeat older than the run’s 900-second timeout cannot activate.

All candidate pages are prepared and capacity checked before new embeddings.
Unchanged pages reuse embeddings when their profile matches. Three transient
page attempts with backoff precede carry-forward of retained text/vectors.
Only a 404/410, complete sitemap absence or unbounded completed link discovery
confirms removal. Bounds and other failures preserve unconfirmed old content;
an empty candidate fails closed. Daily/weekly runs use the existing scheduled
sync command and ingestion queue configuration. A shared database/Redis cache,
asynchronous worker and scheduler are required. Set worker timeout to at least
300 seconds and queue retry_after above 300. The source UI polls active runs only.

See [Website and Files sources](KNOWLEDGE_SOURCES.md#website) for fields, operator
actions, limits and the database capacity remedy (pgvector or fewer pages).

### Office Files And Tables

| Format | Extraction |
| ------ | ---------- |
| DOCX | Body text of `word/document.xml`: headings (from heading styles or outline levels), list items, paragraphs and tables. Headers, footers, comments and images are skipped. |
| CSV | One Markdown table; the first row is the header. Comma, semicolon, tab and pipe delimiters are detected from the first line; a UTF-8 BOM is removed and non-UTF-8 text is read as Windows-1252. |
| XLSX | One Markdown table per visible sheet under a `## Sheet name` heading, read with OpenSpout. Dates are formatted, hidden sheets are skipped, at most 200 columns are kept. |

DOCX and XLSX files are ZIP containers. Before any part is parsed the archive is
checked: at most 5,000 parts, a part may not expand past
`AGENTIC_CHATBOT_INGESTION_MAX_EXTRACTED_BYTES` (default 10 MiB), all parts
together may not expand past four times that limit, and a part above 1 MiB may
not expand more than 200 times its compressed size. Every XML part is scanned
in full: a part that is not UTF-8, contains a document type declaration or
declares a worksheet row wider than 16,384 columns is refused, so no entity is
expanded. A table may hold at most 50,000 rows, and the same byte limit applies
to the Markdown it renders (short rows count with the empty cells that pad them
to the widest row). A damaged or oversized file fails ingestion with a stable
error; the previous index stays active.

The chunker keeps tables together while they fit one chunk. A larger table is
split into row groups and every group repeats the header row and separator, so
each chunk still names its columns.

### API Knowledge Sources

API sources let an existing **API connection** feed structured JSON records into the bot's knowledge base. In the source form, choose an API connection, endpoint path, records JSON path, stable record ID path, and a content mapping template such as:

```text
{{name}}

{{description}}

Price: {{price}} EUR
```

Each mapped API record becomes its own knowledge document, so citations can point back to the record URL when `url_path` is configured. API connection authentication is reused for the fetch. Paginated APIs can use page-number, offset, cursor, or response-provided next URL pagination with `max_pages` and `max_records` safety limits. The same `AGENTIC_CHATBOT_INGESTION_MAX_FETCH_BYTES` budget applies across all pages in one fetch, so a chunked or misleadingly declared response cannot grow without bound before JSON mapping. After a successful re-ingest, the new generation holds only the records of the latest response, so records that disappeared are no longer found; the old index stays active if the new sync fails. API and Website sources can be re-synced on a schedule (see Scheduled Re-Sync). Use workflow API connection nodes instead for live/user-specific data such as order status, account balances, or actions that write to another system.

### Scheduled Re-Sync

Website and API sources can be fetched again **never**, **daily** or **weekly**
(`sync_frequency`). The package schedules
`filament-agentic-chatbot:sync-knowledge-sources` every 15 minutes, so the host
must run `php artisan schedule:run` every minute (see Operations). **Re-sync
now** on the source queues the same run at once.

A re-sync fetches through `SafeHttpFetcher` (Website) or the API connection (API)
with the usual size limits, then compares the SHA-256 content hash with the
active generation built under the current index contract:

- unchanged: the source returns to `completed`, the active generation stays,
  no chunks are written and no embedding call is made;
- changed: a new generation is staged and embedded; the previous generation
  stays active until the new one is ready;
- failed: the source shows `failed` with the error, the active generation stays,
  and the next attempt follows a backoff of 15 minutes, 1 hour, 4 hours, then
  12 hours, never later than the interval. A success resets the backoff.

### Knowledge update modes

Every published Agent version pins its source set, its index profile (index
version, embedding provider, model and dimensions) and its retrieval settings.
The draft setting **Knowledge updates** (`runtime_config.knowledge.update_mode`)
decides, at Publish, which generations retrieval reads (ADR 0046):

- **Current knowledge** (`current`, the default of Agents created in the
  panel): each retrieval reads, per pinned source, the newest
  completed generation built with the pinned profile. A completed re-sync
  reaches visitors without a Publish. A queued, running, failed or partial
  refresh never replaces the last usable generation. The version is stored as
  `knowledge_authority.v2` with `update_mode: current` and pins no generation.
- **Published knowledge** (`frozen`): every source pins the exact generation
  (id, content hash and contract hash) that was active at publish time, and
  retrieval reads only those generations. A re-sync shows as a change to
  publish. This is the unchanged `knowledge_authority.v1` format. Every Agent
  created before 1.0, and every Agent without the setting, is frozen; an upgrade
  never switches an Agent to current knowledge.

A retrieval resolves its generations once, before any search, and the vector
stage, the lexical stage and the Gateway's scope check read that same set; a
refresh that completes during a search cannot mix generations. The selected
generation must verify completely (contract hash, documents, chunks) and be
searchable in the configured vector backend, or the search fails closed with
`knowledge_generation_unavailable`; it never falls back to older content or
another profile. The diagnostics record the mode and the
`(source_id, generation_id)` pairs read; the turn's execution evidence stores
them and a replayed turn returns them unchanged.

Adding or removing a source and changing the update mode are draft changes that
need Publish. Restoring a current version restores its sources, profile and
mode, not the content its sources had when it was published; restoring a frozen
version restores its exact generations. Restore is refused when a pinned source
was revoked or no retained generation can serve the version any more. Workflow
knowledge steps keep frozen pins.

### Embedding profile changes

Query embeddings always use the pinned provider, model and dimensions with the
credentials resolved for that provider, never the current global default. When
the Settings page changes the embedding profile, the sources are rebuilt under
the new profile while live versions keep answering with their pinned profile
(a current version keeps reading the newest generation of that profile). The
Agent shows **Publish needed**; Publish is the cutover and is refused until
every source has a completed generation under the new profile. If the pinned
provider has no usable key, the vector stage reports
`embedding_credentials_missing` and the launch check names the provider.

### Retention

`filament-agentic-chatbot:prune-knowledge-generations` (scheduled daily at
02:50, `knowledge_sources.generation_retention.schedule_enabled`) archives
generations that nothing needs any more. A generation is kept while it is a
source's active or staging generation, is pinned by any frozen Agent version
(live or restorable) or Workflow deployment, is read by a live current version
now, or was superseded or failed less than
`knowledge_sources.generation_retention.days` ago
(`AGENTIC_CHATBOT_KNOWLEDGE_GENERATION_RETENTION_DAYS`, default 30, minimum 1).
Archiving sets the status `archived` and `archived_at`, removes documents,
chunks, vectors in the configured backend and backend-switch copies, and keeps
the row with its public id, hashes, counts and index contract as provenance.
Stored citations keep their own label and preview. Vectors of an archived
generation in a backend other than the configured one are not removed. Use
`--dry-run` to list eligible generations and `--days` to override the window
for one run.

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

Chunk text and metadata always live in the package tables. The vectors live in
the configured backend (`AGENTIC_CHATBOT_VECTOR_BACKEND`):

| Backend | Storage | Search | Use it for |
| --- | --- | --- | --- |
| `database` (default) | `bot_knowledge_vectors` on the package connection (MySQL, MariaDB, PostgreSQL or SQLite) | exact cosine similarity in PHP | small and medium knowledge without extra infrastructure |
| `pgvector` | `vector(N)` column on a PostgreSQL package connection | pgvector; ivfflat index up to 2,000 dimensions, exact above | larger knowledge |
| `chroma` | a Chroma collection | Chroma | a separate vector service |

### database (default)

Each vector is stored as little-endian float32 values with its precomputed
norm, its dimension and the identity of its embedding profile (index version,
provider, model, dimensions). Vectors that are not a list of numbers, contain a
value that is not finite in float32, have a zero norm or the wrong dimension
are rejected before anything is written.

A search first restricts the rows to the exact source generations the
published Agent version pins and to their embedding identity, then streams
them in batches, scores each with cosine similarity and keeps the best
`top_k` in bounded memory. Equal scores are ordered by chunk id, so results are
deterministic. Results match an exact cosine reference and pgvector exact
search (`VectorBackendParityTest`). Lexical and hybrid retrieval read the same
pinned generations.

Because every pinned chunk is scored, the backend limits what one Agent may
search. Doctor warns above `AGENTIC_CHATBOT_VECTOR_DATABASE_WARNING_CHUNKS`
(default 800 chunks) and the hard limit is
`AGENTIC_CHATBOT_VECTOR_DATABASE_MAX_CHUNKS` (default 3,000). Both are counted
at 1,536 dimensions; larger embeddings lower them proportionally, so 3,072
dimensions allow 400 and 1,500. The hard limit is checked:

- before an import is embedded, for every Agent the source is assigned to;
- again when the new version is activated, under locks, so parallel imports
  of shared sources cannot pass together;
- when an Agent is published (assigning an indexed source to another Agent
  cannot bypass it);
- at search time, failing closed.

Activation locks assigned Agents in id order before the Source, matching
Publish and Add answer. It checks the assignment set again under these locks;
a concurrent assignment change fails ingestion and keeps the previous complete
generation active. Retry ingestion after assignments have settled.

A refused import marks the source failed with the remedy, keeps the previous
complete version active and is not retried. ADR 0047 records the measured
latencies behind the defaults.

### pgvector

PostgreSQL with the `pgvector` extension. Set a PostgreSQL package connection
(the application's default connection, or `AGENTIC_CHATBOT_DB_CONNECTION`):

```env
AGENTIC_CHATBOT_VECTOR_BACKEND=pgvector
AGENTIC_CHATBOT_DB_CONNECTION=agentic_chatbot_pgsql
AGENTIC_CHATBOT_DB_HOST=127.0.0.1
AGENTIC_CHATBOT_DB_PORT=5432
AGENTIC_CHATBOT_DB_DATABASE=filament_agentic_chatbot
AGENTIC_CHATBOT_DB_USERNAME=postgres
AGENTIC_CHATBOT_DB_PASSWORD=secret
```

The package registers that connection only because `AGENTIC_CHATBOT_DB_DATABASE`
(or `AGENTIC_CHATBOT_DB_URL`) is set and `config/database.php` does not define
it. Migrations create the extension, the `vector(N)` column and, up to 2,000
dimensions, an ivfflat index when the backend is `pgvector` at migration time.

### ChromaDB

A standalone vector database:

```env
AGENTIC_CHATBOT_VECTOR_BACKEND=chroma
AGENTIC_CHATBOT_CHROMA_URL=http://127.0.0.1:8001
AGENTIC_CHATBOT_CHROMA_TOKEN=your-token
AGENTIC_CHATBOT_CHROMA_COLLECTION=filament-agentic-chatbot
```

Chroma filtering is strict. If all nearest-neighbor results fall below the configured threshold, retrieval returns no chunks. There is no threshold-bypass compatibility path.

### Switching backends

`php artisan filament-agentic-chatbot:switch-knowledge-backend {database|pgvector|chroma}`
copies every ready knowledge generation's vectors into the target backend for
the same chunk rows and verifies each copy (count, checksum and a retrieval
probe) while the configured backend keeps serving. `--dry-run` shows the plan
and writes nothing. Vectors are copied only when the chunks carry the
generation's embedding identity; otherwise the source must be re-embedded with
a normal ingestion (`--reembed` queues it). When everything that sources and
live Agent versions need is verified, the command prints the configuration
cutover. It never edits configuration, never deletes the old vectors and never
moves package tables. After the cutover, published versions keep their pins
and read the verified copies. See [Operations](OPERATIONS.md#switching-backends)
for the full procedure.

## Retrieval

Retrieval finds relevant chunks when the published Agent searches its pinned knowledge or a Workflow runs a knowledge Tool step.

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
turn. The Agent loop offers one bounded `search_knowledge` tool (`KnowledgeTool`)
only when such pins exist, and every search crosses `CapabilityExecutionGateway`,
which resolves the generations once (`LiveKnowledgeGenerationResolver`) and
blocks the search when a pinned source was revoked (`knowledge_source_revoked`)
or no verified generation matches the pinned profile
(`knowledge_generation_unavailable`).
The gateway accepts only usable retrieval evidence from those sources; empty,
insufficient, degraded-below-threshold, unavailable, and failed results become
an explicit no-evidence result. The Agent must cite only supplied reference
numbers and answer naturally that reliable published evidence was unavailable
instead of inventing a grounded answer. There is no second answer-composer or
shadow answerability runtime that can override this result.

Knowledge retrieval output is an untrusted structured envelope containing the retrieval strategy, evidence quality, degradation state, evidence reference range, and bounded context. Citation IDs are checked against the final evidence pack; invalid IDs are removed before output. Context truncation happens at sentence or word boundaries rather than cutting a sentence mid-stream. Once retrieval has been attempted, an insufficient result cannot be rewritten into a grounded answer by the assistant or response composer.

Run `php artisan migrate` to create the PostgreSQL FTS index, then re-ingest every source after first adopting G21 or whenever the index version or embedding identity changes. Existing unstamped chunks are intentionally incompatible. Run `composer eval:retrieval-quality` before deployment and whenever a calibration dataset/profile changes.

### Knowledge Readiness

An Agent knowledge tool can retrieve evidence only when the Agent
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
- Retrieval quality has degraded after configuration changes

A vector backend change does not need re-ingestion; use the switch command
described above.

Use the **Re-ingest** action on individual sources or the bulk re-ingest on the bot page inside Filament. Re-ingestion builds a new generation for that source; Agents with current knowledge read it when it completes, frozen versions after their next Publish. A revoked source is never ingested again.

Deleting a source queues vector cleanup. Chroma receives the collected chunk IDs and deletes matching vector IDs asynchronously; the database and pgvector backends remain idempotent because their vectors are removed with the chunk rows by cascade.

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

Website extraction passes the already fetched `body`, `content_type` and
canonical `url` through `ExtractsContent`; custom extractors never fetch the
Website URL themselves. Unchanged-vector reads are limited to one document
batch on database, pgvector and Chroma. Lower `ingestion.max_fetch_bytes`
limits apply to responses and expanded sitemaps as well.
