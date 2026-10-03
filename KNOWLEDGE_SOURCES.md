# Knowledge Sources

The knowledge list distinguishes saved, processing, available and failed sources.
Available requires a completed source with an active generation. Technical chunk
counts are hidden by default and can be restored with the native column selector.
Creation starts with text; API sources are marked advanced. File limits are shown
from the configured ingestion limit. Creating and processing retain their existing
explicit actions; opening a form performs no ingestion.

The optional Knowledge scope form stores public operator-authored facts in
`meta.knowledge_profile`: `summary` (2,000 characters), `topics` and `exclusions`
(1,000 each), `language` (120), and `validity` (500). Publication validates these
fields and pins only this allowlist, not the complete mutable source metadata.
Unknown keys are omitted; invalid or credential-bearing profile values are rejected.
Republish the Agent to change its profile. Ingestion dates are never presented as
content validity. All pinned sources remain reachable through the shared search
tool, including sources beyond the first eight; the complete offer is budgeted.

## Knowledge Library

**Knowledge** is a library of sources shared by Agents. A source can be used by
any number of Agents, or by none yet. The list shows which Agents use each
source (**Used by**, filterable by Agent), its state and its re-sync schedule;
**Agents** in the row actions changes the assignment, **Re-sync now** fetches a
URL or API source again. In the Agent editor, **Add from library** assigns
existing sources and **Remove** takes one off the Agent; the source stays in the
library.

An assignment is part of the Agent's draft. A live Agent searches only the
source versions pinned in its published deployment, so adding, removing or
re-syncing a source takes effect for that Agent after its next publish. An
admin can change only assignments to Agents they may edit; assignments to other
Agents are kept.

**Embeddings billed to** names the Agent whose embedding key and usage budget
the source's ingestion and re-syncs use; empty means the app key. It starts as
the first Agent chosen for the source and changes only when an admin picks
another assigned Agent they may edit, or removes that Agent from the source
(the source then uses the app key). Adding or removing other Agents never moves
the cost. An API source can use an Agent-only API Connector only while that
Agent is its only user; assigning another Agent is refused. Deleting an Agent
removes only its assignments; its sources stay in the library until they are
deleted themselves. A source that a live Agent version pins cannot be moved to
trash or deleted: the notice names those Agents, and the source can go once
they are published without it.

### Re-Sync

URL and API sources have a **Re-sync** setting: never, daily or weekly. A
re-sync fetches the source again, rebuilds the index only when the content
changed, keeps the previous index until the new one is ready, and shows a
failure with its error and a retry with backoff. It needs the Laravel scheduler
(`php artisan schedule:run`); see [Operations](OPERATIONS.md).

This is the specific documentation page to share when someone asks:

- what knowledge sources are
- how to create a source
- which source types can be ingested
- what content the bot can learn from

## What A Knowledge Source Is

A knowledge source is a piece of content the bot is allowed to learn from.

Examples:

- a product FAQ
- a markdown guide
- an uploaded PDF
- a public documentation page
- a JSON API endpoint with product or CMS records
- a policy or onboarding article

The bot does not answer from "the internet in general". It answers from the sources you attach and ingest.

At runtime, a Knowledge search must be grounded in the visitor's latest request and the exact sources pinned into the live Agent deployment. An explicit request not to read or search a named source hides and blocks that capability. Retrieved claims are rendered only from delivered evidence with retained citations; malformed provider prose or an internal evidence-selection envelope is repaired once without tools or replaced by a safe evidence fallback.

## Which Source Types You Can Ingest

Filament Agentic Chatbot supports four source types:

- **Text**: paste content directly into the panel
- **File**: upload Markdown, text, HTML, JSON, text-based PDF, Word (DOCX), CSV or Excel (XLSX). Tables become Markdown tables whose header is repeated in every chunk
- **Single web page**: fetch one public URL and extract readable content; this is not a site crawler
- **API**: fetch JSON records through a saved API Connector and map fields into searchable content

From an Agent's **Add first content** link, the Agent is selected through an authorized context. The form shows only fields for the chosen type. A file name or web page path can suggest a source name while that field is empty; no URL is fetched before saving the source. After saving, the edit page shows the actual saved, processing, failed, or usable state and a bounded extracted-text view for an active generation. Saving does not automatically run a second ingestion job. A usable current generation is distinct from a generation pinned into the selected Agent version; use **Test changes** on the Agent to prepare a new version.

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

1. Open **Knowledge Sources**
2. Click **Create**
3. Optionally choose the Agents under **Used by**
4. Choose **Manual Text**
5. Paste the content
6. Give the source a descriptive name
7. Save and wait for `completed`

### Create A File Source

1. Open **Knowledge Sources**
2. Click **Create**
3. Optionally choose the Agents under **Used by**
4. Choose **File Upload**
5. Upload the file
6. Give the source a descriptive name
7. Save and wait for `completed`

### Create A URL Source

1. Open **Knowledge Sources**
2. Click **Create**
3. Optionally choose the Agents under **Used by**
4. Choose **URL**
5. Paste the public page URL
6. Give the source a descriptive name
7. Save and wait for `completed`

Private and local network URLs are blocked by default for SSRF safety.

### Create An API Source

1. Create an **API Connector** with the base URL, auth, headers, timeout, and SSL settings
2. Open **Knowledge Sources**
3. Click **Create**
4. Optionally choose the Agents under **Used by**
5. Choose **API Source**
6. Select the connector and endpoint path
7. Configure the records JSON path, record ID path, title path, content template, and optional URL path
8. If the endpoint is paginated, choose page-number, offset, cursor, or next-URL pagination and set the safety limits
9. Optionally set **Re-sync** to daily or weekly
10. Save and wait for `completed`

API source ingestion currently supports authenticated `GET` JSON endpoints through API Connectors. Each mapped record becomes its own knowledge document. Pagination supports page-number, offset, cursor, and response-provided next URL strategies. After a successful re-ingest, the source's previous API documents are replaced in the new generation, so records that disappeared from the API response are no longer found; if the new sync fails, the previous indexed content remains active.

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

- `Knowledge Sources`
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

- Share one source between Agents instead of uploading copies.
- Prefer clean docs pages over noisy landing pages when possible.
- Re-ingest after editing or replacing important content.
- Use descriptive source names so citations are understandable.
- Keep public bots on public docs and internal bots on internal runbooks.

## Related Docs

- [Core Concepts](CORE_CONCEPTS.md)
- [Bots](BOTS.md)
- [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)
- [Operations](OPERATIONS.md)
