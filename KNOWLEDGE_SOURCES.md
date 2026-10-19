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
Website or API source again. In the Agent editor, **Add from library** assigns
existing sources and **Remove** takes one off the Agent; the source stays in the
library.

An assignment is part of the Agent's draft. A live Agent searches only the
sources pinned in its published version, so adding or removing a source takes
effect for that Agent after its next Publish. What a re-sync changes depends on
the version's **Knowledge updates** setting (ADR 0046):

- **Current knowledge** (default for Agents created in the panel and by Solution
  Kits): the live version reads the newest completed content of each pinned
  source, so a completed re-sync reaches visitors without a Publish. A failed or
  running refresh keeps the previous content.
- **Published knowledge** (every Agent created before 1.0, and Agents without
  the setting): the live version keeps the exact content it was published with;
  the editor shows the re-synced content as a change to publish.

Changing the setting is a draft change and needs Publish. The source page names
the live Agents that receive completed refreshes automatically and those that
keep their published content until their next Publish. An admin can change only
assignments to Agents they may edit; assignments to other Agents are kept.
Editing, rebuilding or re-syncing a source also needs edit access to every live
Agent with current knowledge that uses it, because those Agents receive the new
content without a Publish; removing the source from an own Agent stays possible.

Ingestion and re-syncs embed every source with the app-wide embedding profile
and key: the key stored on the **Settings** page, then the `.env` key. No Agent
pays for a source, so adding or removing Agents never moves the cost (before
1.0 a source named the Agent billed for it; see `UPGRADING.md`). An API source can use an Agent-only API connection only while that
Agent is its only user; assigning another Agent is refused. Deleting an Agent
removes only its assignments; its sources stay in the library until they are
deleted themselves. A source that a live Agent version pins cannot be moved to
trash or deleted: the notice names those Agents, and the source can go once
they are published without it.

### Emergency revocation

When a source must stop answering at once (for example, it exposed internal
data), an administrator uses **Revoke Source** on the source page and enters a
reason. The package writes an audit record (`bot_knowledge_source_revocations`:
reason, actor, affected live Agents and versions, time) and changes no
published version. From then on every knowledge search of a live version that
uses the source fails closed (`knowledge_source_revoked`), the source is never
ingested or synced again, and Publish refuses a draft that still contains it.
Remove the source from the affected Agents and publish them; the source can then
be deleted. Revocation cannot be undone and needs the admin ability
(`knowledge.revoke`).

### Re-Sync

Website and API sources have a **Re-sync** setting: never, daily or weekly. A
re-sync fetches the source again, reuses unchanged Website embeddings,
keeps the previous index until the new one is ready, and shows a
failure with its error and a retry with backoff. Agents with current knowledge
read the new index once it is ready; superseded indexes that no version needs
are archived after the retention window (see
[Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md#retention)). It needs the Laravel scheduler
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

At runtime, a Knowledge search must be grounded in the visitor's latest request and the exact sources pinned into the live Agent deployment. An explicit request not to read or search a named source hides and blocks that tool. Retrieved claims are rendered only from delivered evidence with retained citations; malformed provider prose or an internal evidence-selection envelope is repaired once without tools or replaced by a safe evidence fallback.

## Which Source Types You Can Ingest

Filament Agentic Chatbot supports four source types:

- **Text**: paste content directly into the panel
- **Files**: upload up to 50 files per upload, with one document per file: Markdown, text, HTML, JSON, text-based PDF, Word (DOCX), CSV or Excel (XLSX). Tables become Markdown tables whose header is repeated in every chunk
- **Website**: crawl links from a start URL, read a sitemap URL, or fetch one page with discovery disabled
- **API**: fetch JSON records through a saved API connection and map fields into searchable content

From an Agent's **Add first content** link, the Agent is selected through an authorized context. The form shows only fields for the chosen type. A file name or web page path can suggest a source name while that field is empty; no URL is fetched before saving the source. After saving, the edit page shows the actual saved, processing, failed, or usable state and a bounded extracted-text view for an active generation. Saving does not automatically run a second ingestion job. A usable current generation is distinct from a generation pinned into the selected Agent version; use **Test changes** on the Agent to prepare a new version.

## When To Use Each Source Type

### Text

Best for:

- FAQs
- policy snippets
- support instructions
- short product explanations

Use text sources when the content is short, curated, and easy to maintain directly in Filament.

### Files

Best for:

- markdown docs
- uploaded runbooks
- exported guides
- static documentation files

Files requires at least one file. To remove the final file, remove the Source
from its Agents and delete the Source under the existing live-pin rules.

Use Files sources when you already have authoritative documents and want to keep them intact.

### Website

Best for:

- public docs pages
- help-center articles
- published landing pages
- public changelog or release pages

Use Website sources when the canonical source of truth is already published on the web.

Website mode is **Crawl from start URL**, **Sitemap URL**, or **Single page
(discovery disabled)**. Set **Maximum pages** (default 200, from 1 to 2,000;
Single page requires 1), optional **Include paths** and **Exclude paths**
(one glob per line, such as `/docs/*` or `/blog/*`), and **Re-sync** (off,
daily or weekly). Include/exclude patterns match the URL path, not its query.
Exclusions take precedence. The start page may be fetched solely for discovery when it does not match an include pattern. URLs are limited to 2,000 characters and each pattern list to 100 entries. Imported lists of individual URLs use Single page.

Only HTTP(S) URLs on the exact start/sitemap host and normalized port are
fetched, including every redirect hop. HTTP on port 80 may upgrade to HTTPS on
port 443. Other port changes, subdomains and HTTPS-to-HTTP redirects are refused. Every request
uses the existing network safety guard and connects to its checked public DNS
addresses. Website crawls do not permit the private-network development override.
The fixed user agent is `filament-agentic-chatbot/1.0`; the robots product token
is `filament-agentic-chatbot`. Under RFC 9309, matching product-token groups
are merged and used alone; only when none matches are `*` groups merged. With
neither, all paths are allowed. The longest matching Allow/Disallow rule wins
(Allow wins ties). The crawler clamps
Crawl-delay to 0.5 through 10 seconds. robots.txt is fetched once per crawl:
404/410 allows crawling, while any other failure fails the run closed.

The Source page shows status, pages found, fetched, indexed and failed, and up
to 50 URL/reason/message errors. Error URLs retain query keys with values replaced
by `[REDACTED]`. **Start crawl**, **Retry**, **Cancel**, and
schedule changes need the Source management ability and management of every
live current-knowledge Agent that uses it. The page polls only during an active
run. Cancel the crawl before editing its content settings. Only one queued or
running crawl per Source is allowed, including scheduled runs.

Each run prepares a staged generation. Discovery failure, capacity refusal,
cancellation and heartbeat expiry keep the old generation active. A transient
page failure retries three times with backoff, then carries forward the old
page's text and matching embeddings. A 404/410 confirms removal; a completely
read sitemap or an unbounded completed link crawl can also confirm absence.
Bounds and unconfirmed failures preserve content whose removal cannot be proved.
Explicit exclude patterns remove matching pages from the next complete generation.
A crawl with no indexable documents fails closed and keeps the old generation. Robots-blocked or unsupported pages retain previous text when available; these outcomes do not prove removal.
Only a completed run activates. Frozen Agent Versions keep their pinned generation.

Website content is limited to HTML, XHTML and plain text. PDFs and other formats
are skipped; upload them through Files instead. Pages are limited to 5 MiB,
redirects to 5, link depth to 5, sitemap nesting to 3 levels below the initial
sitemap, and each sitemap to 50,000 URLs. XML and gzip sitemaps are supported;
gzip expansion is also bounded to 5 MiB. Total HTTP requests, including robots,
redirects and retries, are capped at `maximum pages × 3 + 20`.

The database vector backend admits about 3,000 chunks per Agent at 1,536
dimensions (warning at 800), or 1,500 at 3,072 (warning at 400). Pages may create
multiple chunks. Capacity is checked before embedding and again at activation
against every affected Agent. Use pgvector, fewer pages or exclude patterns
for larger sites; a refusal names the configured limit.

Files accepts up to 50 files in one upload, retaining the existing size and
content-type rules for each file. Adding files adds documents to the next
generation; removing files removes their documents from that generation.
Old complete generations remain available to frozen Versions and retention.

Website work uses `ingestion.connection` and `ingestion.queue` (the existing
`AGENTIC_CHATBOT_INGESTION_QUEUE_CONNECTION` and `AGENTIC_CHATBOT_INGESTION_QUEUE`
settings). Run an asynchronous queue worker and the Laravel scheduler. Workers
must allow the crawl job's 300-second timeout, with queue `retry_after` greater
than 300 seconds. Discovery and provider batches checkpoint and re-dispatch;
a retried delivery resumes the same staged generation. The scheduler checks
heartbeats every minute and fails runs with no heartbeat for over 900 seconds,
except while a scheduled provider retry is still in the future.
The existing `filament-agentic-chatbot:sync-knowledge-sources` command dispatches
due daily/weekly Websites. Use a shared database or Redis cache for installation
wide host slots: at most two requests in flight and at least 500 ms between
starts, shared by all Sources on that host (or the larger Crawl-delay).

Website Sources use **Start crawl** / **Retry** for their durable runs.
Synchronous ingestion refuses Websites and directs operators to these actions.
Rebuild starts the same queued crawl; an already running crawl is skipped
without changing the Source status. The 900-second run heartbeat lease allows queue
redelivery after a 300-second worker timeout; configure queue `retry_after`
above 300 and below 900 seconds (for example, 330).

Website response and decompression bounds also honor a lower configured
`ingestion.max_fetch_bytes`; no configuration can raise the 5 MiB ceiling.
HTTP responses request `Accept-Encoding: identity` and disable automatic decoding.
Unexpected gzip or deflate encoding is streamed through a decoded-byte cap
(5 MiB for pages and sitemaps, or a lower configured limit); other encodings
are refused. robots.txt has a separate 500 KiB cap.

Unreadable pages are counted as failed with `no_readable_text`, preserving prior
content where available while other pages continue. Embedding-provider transient
failures release the job with 30-second, 2-minute and 10-minute backoff (10 minutes
for the fourth retry), with at most five consecutive failed provider attempts.
A successful embedding batch resets the failure count. Staged
pages and completed embedding batches are retained. Authentication and exhausted
quota failures stop immediately. Unexpected exceptions log a fixed diagnostic code,
exception class and crawl run ID, without the exception message or trace arguments;
stored errors contain only the exception class and the redacted page URL.
Unchanged completed crawls retain the active generation under the same index
contract and record `sync_result=unchanged`, without new embeddings.

### API

Best for:

- product catalogs
- CMS records
- help-center APIs
- structured public datasets
- relatively stable business records that should be searchable later

Use API sources when a JSON endpoint should sync records into the bot's knowledge base. Use workflow API connection nodes instead for live, private, or user-specific data such as order status, customer accounts, or write actions.

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

### Create A Website Source

1. Open **Knowledge Sources**
2. Click **Create**
3. Optionally choose the Agents under **Used by**
4. Choose **Website**
5. Choose crawl, sitemap or single-page mode and paste its public URL
6. Set the maximum pages and optional include/exclude path patterns
7. Give the source a descriptive name and save
8. Use **Start crawl** and wait for `completed`

Website sources always refuse private and local network destinations.

### Create An API Source

1. Create an **API connection** with the base URL, auth, headers, timeout, and SSL settings
2. Open **Knowledge Sources**
3. Click **Create**
4. Optionally choose the Agents under **Used by**
5. Choose **API Source**
6. Select the API connection and endpoint path
7. Configure the records JSON path, record ID path, title path, content template, and optional URL path
8. If the endpoint is paginated, choose page-number, offset, cursor, or next-URL pagination and set the safety limits
9. Optionally set **Re-sync** to daily or weekly
10. Save and wait for `completed`

API source ingestion currently supports authenticated `GET` JSON endpoints through API connections. Each mapped record becomes its own knowledge document. Pagination supports page-number, offset, cursor, and response-provided next URL strategies. After a successful re-ingest, the source's previous API documents are replaced in the new generation, so records that disappeared from the API response are no longer found; if the new sync fails, the previous indexed content remains active.

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

## Gap answers

In **Agent analytics**, the knowledge gap list shows occurrence counts and
redacted question examples. **Add answer** stores approved general information
in a Text Source owned by that Agent. It uses
`agentic_bots.answers_knowledge_source_id`, never a lookup by the name
`Answers`. The same name on another Source grants no access. An Answers Source
cannot be assigned to another Agent or changed from Text. Adding an answer requires Configure
(`agents.manage` and `knowledge.manage`) within both record scopes, including
the owner of an existing Answers Source. Source assignment, deletion, restore
and revocation also retain that owner scope and their existing permissions.

Creating or assigning the Source changes the Agent's **Draft**. Ingestion alone
does not add a new Source to **Live**: use **Publish** after indexing finishes.
For a Source already pinned by the Live Version, `current` mode serves a
successful refresh automatically; `frozen` mode requires Publish. Editing the
Draft update mode does not change the Live mode. A changed embedding profile
also needs Publish.

Each row shows one state badge: **Answer drafted**, **Indexing**, **Publish needed**
or **Available to Agent** once an answer exists, otherwise the gap status.
**Answer drafted** is the resting state while Publish cannot make the answer
available: the Agent is Paused or the Source was revoked. After Resume the next
check moves the badge to **Publish needed** or **Available to Agent**. Failed ingestion shows **Indexing failed** (danger colour) and keeps
the gap open and visible; inspect and retry the Source's ingestion. A **Publish needed** row offers a **Publish** link to the Agent's Publish page, only to users who may edit and publish that Agent. Without a configured embedding key, **Add answer** is refused with a notification that names the key to configure, and nothing is saved. The Open, In progress and Available cards above the list filter it to their status; the list shows Open and In progress by default. Saving text never addresses a gap.
Availability requires a deterministic retrieval probe against the verified Live
deployment, resolved Source generation and pinned profile and retrieval settings.
The probe uses the intended answer's stored vectors as known-answer queries
through the normal retrieval pipeline, without embedding requests or AI calls.
Every part of the intended answer must be present in the indexed content and
returned by that search. The stored evidence identifies the deployment, Source,
generation, chunks and answer hash. It verifies availability, not whether every
future model response will be correct or whether every visitor phrasing will
retrieve the answer.

An unavailable backend, revoked Source, corrupt binding, missing profile,
truncated answer, failed probe or an AI reranker leaves the gap unaddressed.
AI rerankers cannot be verified by this no-AI probe; such Agents show
**Manual review needed** once the Live Version pins the Source (before that the
row keeps **Publish needed**) until a deterministically verifiable
retrieval configuration is published. Ingestion completion, Publish, Pause,
Resume and Source revocation check availability after commit. Snapshots and
probes run outside row locks; their results are saved only if the gap, Source
and Live deployment still match. Failures produce a warning without logging visitor content or
backend exception messages.
The scheduled `filament-agentic-chatbot:collect-knowledge-gaps` command retries
interrupted checks and rechecks prior availability, least recently checked first so
unchanged rows cannot starve later gaps; `--dry-run` changes nothing.
An interrupted check cannot roll back or misreport a committed Publish or ingest.

Repeating the same Add answer submission appends and queues at most once. A
stale different answer is refused. Edit the owned Text Source to repair its
content; reopen a completed or ignored gap before proposing another answer.
Trashing an Answers Source requires restoring it before Add answer can continue.
Force deletion clears its ownership pointer; the next Add answer creates a new
owned Source. Publish and Restore reject any Version that pins another Agent's
owned Answers Source.

Reopening clears the old availability evidence. Historical operator resolutions
reopened by the 1.0 migration remain in `answer_evidence.legacy_resolution`; they
are not retrieval proof and are preserved for rollback. The answer text is
encrypted on the gap; the Source content follows the ordinary knowledge storage contract.
Do not put visitor-specific information in an answer that will reach visitors.

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

- Share ordinary library sources between Agents instead of uploading copies.
  Answers Sources belong to one Agent.
- Prefer clean docs pages over noisy landing pages when possible.
- Re-ingest after editing or replacing important content.
- Use descriptive source names so citations are understandable.
- Keep public bots on public docs and internal bots on internal runbooks.

## Related Docs

- [Core Concepts](CORE_CONCEPTS.md)
- [Bots](BOTS.md)
- [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)
- [Operations](OPERATIONS.md)
