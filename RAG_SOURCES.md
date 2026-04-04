# RAG Sources

This is the specific documentation page to share when someone asks:

- what RAG sources are
- how to create a source
- which source types can be ingested
- what content the bot can learn from

## What A RAG Source Is

A RAG source is a piece of content the bot is allowed to learn from.

Examples:

- a product FAQ
- a markdown guide
- an uploaded PDF
- a public documentation page
- a policy or onboarding article

The bot does not answer from "the internet in general". It answers from the sources you attach and ingest.

## Which Source Types You Can Ingest

Filament RAG supports three source types:

- **Text**: paste content directly into the panel
- **File**: upload a supported document such as markdown, text, HTML, JSON, CSV, or a text-based PDF
- **URL**: fetch a public web page and extract readable content

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

## How To Create A Source

### Create A Text Source

1. Open **RAG Sources**
2. Click **Create**
3. Select the target bot
4. Choose **Manual Text**
5. Paste the content
6. Give the source a descriptive name
7. Save and wait for `completed`

### Create A File Source

1. Open **RAG Sources**
2. Click **Create**
3. Select the target bot
4. Choose **File Upload**
5. Upload the file
6. Give the source a descriptive name
7. Save and wait for `completed`

### Create A URL Source

1. Open **RAG Sources**
2. Click **Create**
3. Select the target bot
4. Choose **URL**
5. Paste the public page URL
6. Give the source a descriptive name
7. Save and wait for `completed`

Private and local network URLs are blocked by default for SSRF safety.

## What Happens After You Save A Source

The source record itself is only the input.

During ingestion it becomes:

1. extracted content
2. a normalized document
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

- `RAG Sources`
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
- Re-ingest after editing or replacing important content.
- Use descriptive source names so citations are understandable.
- Keep public bots on public docs and internal bots on internal runbooks.

## Related Docs

- [Core Concepts](/docs/core-concepts)
- [Bots](/docs/bots)
- [Ingestion and Retrieval](/docs/ingestion-and-retrieval)
- [Operations](/docs/operations)
