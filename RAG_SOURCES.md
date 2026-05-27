# Sources

This is the specific documentation page to share when someone asks:

- what sources are
- how to create a source
- which source types can be ingested
- what content the assistant can use for grounded answers

## What A Source Is

A source is a piece of content the bot is allowed to use for source-grounded answers.

Examples:

- a product FAQ
- a markdown guide
- an uploaded PDF
- a public documentation page
- a JSON API endpoint with product or CMS records
- a policy or onboarding article

The bot does not answer from "the internet in general". When source grounding is needed, it answers from the sources you attach and ingest.

## Which Source Types You Can Ingest

Filament Agentic Chatbot supports four source types:

- **Text**: paste content directly into the panel
- **File**: upload a supported document such as markdown, text, HTML, JSON, CSV, or a text-based PDF
- **URL**: fetch a public web page and extract readable content
- **API**: fetch JSON records through a saved API Connector and map fields into searchable content

## When To Use Each Source Type

### Text

Best for:

- FAQs
- policy snippets
- support instructions
- short product explanations

Use text sources when the content is short, curated, and easy to maintain directly in Filament.

### File

Best for:

- markdown docs
- uploaded runbooks
- exported guides
- static documentation files

Use file sources when you already have authoritative documents and want to keep them intact.

### URL

Best for:

- public docs pages
- help-center articles
- published landing pages
- public changelog or release pages

Use URL sources when the canonical source of truth is already published on the web.

### API

Best for:

- product catalogs
- CMS records
- help-center APIs
- structured public datasets
- relatively stable business records that should be searchable later

Use API sources when a JSON endpoint should sync records into the bot's knowledge base. Use workflow API Connector nodes instead for live, private, or user-specific data such as order status, customer accounts, or write actions.

## How To Create A Source

### Create A Text Source

1. Open **Sources**
2. Click **Create**
3. Select the target bot
4. Choose **Manual Text**
5. Paste the content
6. Give the source a descriptive name
7. Save and wait for `completed`

### Create A File Source

1. Open **Sources**
2. Click **Create**
3. Select the target bot
4. Choose **File Upload**
5. Upload the file
6. Give the source a descriptive name
7. Save and wait for `completed`

### Create A URL Source

1. Open **Sources**
2. Click **Create**
3. Select the target bot
4. Choose **URL**
5. Paste the public page URL
6. Give the source a descriptive name
7. Save and wait for `completed`

Private and local network URLs are blocked by default for SSRF safety.

### Create An API Source

1. Create an **API Connector** with the base URL, auth, headers, timeout, and SSL settings
2. Open **Sources**
3. Click **Create**
4. Select the target bot
5. Choose **API Source**
6. Select the connector and endpoint path
7. Configure the records JSON path, record ID path, title path, content template, and optional URL path
8. If the endpoint is paginated, choose page-number, offset, cursor, or next-URL pagination and set the safety limits
9. Optionally enable **Auto Sync** and set the sync interval
10. Save and wait for `completed`

API source ingestion supports authenticated `GET` JSON endpoints through API Connectors. Each mapped record becomes its own stored document for retrieval. Pagination supports page-number, offset, cursor, and response-provided next URL strategies. Auto sync is driven by `php artisan filament-agentic-chatbot:sync-rag-sources`, which should be called by Laravel Scheduler.

After a successful re-ingest, the source's previous API documents are replaced. Records that disappeared from the API response are removed from retrieval. If the new sync fails, the previous indexed content remains active.

## What Happens After You Save A Source

The source record itself is only the input.

During ingestion it becomes:

1. extracted content
2. one or more normalized documents
3. multiple searchable chunks
4. embeddings stored in the configured vector backend

The bot answers from the ingested chunks, not directly from the raw source record.

## What You Should Ingest

Good sources are:

- specific
- well-structured
- current
- written for the audience the bot serves
- rich in concrete product or support information

Strong examples:

- feature documentation
- setup guides
- troubleshooting articles
- support policies
- onboarding instructions

## What You Should Avoid Ingesting

Weak sources are:

- vague marketing fragments with no product detail
- duplicated versions of the same content
- very noisy pages with little readable text
- outdated internal notes mixed with current guidance
- content written for the wrong audience

If a page is mostly decorative or repetitive, it usually adds noise to retrieval.

## Source Naming And Organization

Use descriptive names so citations are understandable.

Good examples:

- `Sources`
- `Quickstart`
- `Security and Privacy`
- `Public Pricing FAQ`

Avoid generic names like:

- `Doc 1`
- `Homepage`
- `Notes`

## Source Statuses

### Pending

The source is queued or waiting for ingestion or retry.

### Processing

The ingestion job is actively extracting, chunking, embedding, or persisting the content.

### Completed

The latest ingest finished successfully and the source can contribute chunks to retrieval.

### Failed

The ingest did not finish. Inspect `meta.error` in the source details and retry after fixing the cause.

## Re-Ingesting Sources

Re-ingest when:

- the content changed
- the file or URL changed
- retrieval quality is weak
- embedding or chunking settings changed
- you want new citations or updated canonical links

## Best Practices

- Group sources by bot and audience.
- Prefer clean docs pages over noisy landing pages when possible.
- Use API sources for relatively stable records that should become searchable knowledge.
- Use workflow API Connector nodes for live lookups, user-specific data, and write actions.
- Re-ingest after editing or replacing important content.
- Use descriptive source names so citations are understandable.
- Keep public bots on public docs and internal bots on internal runbooks.

## Related Docs

- [Core Concepts](CORE_CONCEPTS.md)
- [Bots](BOTS.md)
- [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)
- [API Connectors](API_CONNECTORS.md)
- [Operations](OPERATIONS.md)
