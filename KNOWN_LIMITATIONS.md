# Known Limitations

> **Version**: 1.0.0 (selected release candidate, unreleased)<br>
> **Last updated**: 2026-10-19

The last shipped version is `0.20.5`. These constraints apply when
evaluating the **1.0 candidate**, expected as `v1.0.0` subject to final acceptance.
The release contract conditionally authorizes `1.0.0` for intended publication
on `2026-10-19`; it does not certify a final source or archive.
The 0.20.5-to-1.0 procedure and development rehearsal are recorded in
`UPGRADING.md` and `docs/release/UPGRADE_REHEARSAL_1.0.md`. That evidence does
not certify an exact commercial archive, live provider behavior or remote
storage backups. Data conversions require backup restoration for rollback.

Check [Compatibility](COMPATIBILITY.md) for supported requirements and the
scope of recorded evidence. AI answers and Tool selection depend on the
configured content, provider and model. Your host owns customer identity,
record scopes, business policies and production validation.

This page documents known constraints, upstream limitations, and workarounds.

## Candidate verification limits

Final golden-path acceptance and exact-source/archive certification remain
pending. No measured setup-time promise or completed end-to-end shop acceptance
is made. The FAQ screenshot is historical and predates the citation-width fix;
it awaits a current live-flow capture. Other retained screenshots document only
their recorded UI states, not a new execution of the pictured conversation.

**No long-duration soak occurred**. Release policy
`release-1.0-risk-focused.v1` makes it optional and retains targeted risky-path
tests, simulated scheduler checks and all other release gates. Those bounded
checks do not establish production concurrency, automatic crash recovery or
long-duration resource stability. Operators still need supervision, monitoring,
backup restoration and deliberate reconciliation of Unverified actions.

---

## 1. `laravel/ai` provider behavior varies by version

The plugin depends on [`laravel/ai`](https://github.com/laravel/ai) at `^1.2.1`.
Provider and gateway support can still vary across SDK and upstream provider versions.

**Impact**:

- Per-step `temperature` and `maxTokens` overrides are passed to the SDK generation options, but exact behavior still depends on the selected provider gateway.
- Streaming support is limited to what the underlying SDK exposes.

**Workaround**: If a provider ignores a generation option, configure matching defaults in the provider or choose a model gateway that supports the option.

---

## 2. The default database vector backend is bounded

Fresh installs store knowledge vectors in the application's database (the
`database` backend) and score every chunk an Agent may search with exact
cosine similarity in the queue worker. Search time grows linearly with that
number, so the backend has per-Agent limits (Doctor warns above
`AGENTIC_CHATBOT_VECTOR_DATABASE_WARNING_CHUNKS`, imports stop at
`AGENTIC_CHATBOT_VECTOR_DATABASE_MAX_CHUNKS`). ADR 0047 records the
measurements.

**Impact**: Large knowledge bases do not fit the default backend. The
database matrix covers SQLite, MySQL 8.4, MariaDB 11.4 and PostgreSQL 15; see
`docs/COMPATIBILITY.md` for what each run proved.

**Workaround**: Move larger knowledge to pgvector or ChromaDB with
`php artisan filament-agentic-chatbot:switch-knowledge-backend`.

ChromaDB keeps similarity thresholds strict. Below-threshold candidates are not available through a compatibility escape hatch.

---

## 3. Workflow batch-map execution limits

`batchMap` steps enforce `maxItems` (maximum 100), and the workflow still
enforces its global step ceiling. Exceeding either limit terminates execution
with a bounded failure.

**Impact**: Very large collections are intentionally not processed in one chat
workflow.

**Workaround**: Page or pre-filter the source, or split long-running work into
a purpose-built queued integration instead of increasing chat-runtime scope.

---

## 4. LLM-generated workflow JSON

The "Generate from prompt" feature produces workflow JSON via the configured LLM. Generated workflows:

- Are always saved as **drafts** (never auto-published)
- Must pass the full structural + semantic validation pipeline before activation
- May occasionally require manual adjustment of paths or step data

**Best practice**: Always review generated workflows in the visual editor before publishing.

---

## 5. Widget SDK CSP restrictions

The embeddable chat widget is loaded through a `<script>` tag and calls the plugin's API endpoints directly. Sites with strict Content Security Policy headers must allow the widget script URL plus the API origin used by the chat endpoints. The current widget runtime also injects its own `<style>` tag, so CSP policies that forbid inline styles can still block the widget even on the same Laravel app.

Production embeds bootstrap short-lived tokens at runtime and send them in the widget token header. Query-string and request-body token compatibility is disabled by default in production but remains available in non-production for migration testing; enabling either mode publicly weakens the intended token boundary.

---

## 6. API knowledge source scope

API knowledge sources support authenticated `GET` JSON endpoints, field mapping, page-number/offset/cursor/next-URL pagination, scheduled full re-sync, per-sync safety limits, and full source replacement after successful sync. OAuth refresh flows and delta/incremental sync are intentionally not universal in this release.

**Impact**: APIs that require provider-specific auth flows, custom request signing, webhooks, or complex delta sync still need a curated endpoint or gateway.

**Workaround**: Start with curated JSON endpoints or API gateways. Use Workflow API tool steps for live/user-specific lookups instead of syncing private transactional data into the knowledge base.

---

## 7. Delay steps require a queue worker

Delay/timer steps dispatch a `ResumeWorkflowRunJob` to the queue. If your queue driver is `sync`, delay steps will block the HTTP request. The `filament-agentic-chatbot:doctor` command warns about this.

**Workaround**: Use `database`, `redis`, or `sqs` queue driver in production and ensure `php artisan queue:work` is running.

---

## 8. One active Workflow per conversation

An Agent can answer ordinary questions and use approved knowledge without a
Workflow, but it cannot start a second Workflow while one run is still active.

**Impact**: A new process request waits until the active Workflow completes or
is cancelled. This prevents two graphs from competing for the same user reply.

**Workaround**: Put ordered or dependent work in one bounded Workflow. Keep
unrelated chat and knowledge questions with the Agent, and cancel an abandoned
Workflow explicitly before starting another.

---

## 9. Agent interpretation is provider-sensitive

Natural wording, tool selection, and final response quality still vary by
provider and model. Model output is always an untrusted proposal.

**Impact**: A weak model may answer instead of selecting a matching Workflow,
or may ask for clarification. It still cannot grant a tool, bypass an
approval, change a deployment pin, or authorize a write.

**Workaround**: Add representative Agent tests for unexpected
wording, active Workflow replies, side questions, cancellation, and provider
failure. Use a model that reliably supports the declared tool contract.

---

## 10. AgentGraph and Laravel expose different operational records

AgentGraph is the graph-state authority. `WorkflowRun` and pending-interaction
rows are versioned operational projections of its checkpoints and interrupts.

**Impact**: During a crash or unavailable SDK store, an operational row can
temporarily lag the authoritative AgentGraph state and show reconciliation
required.

**Workaround**: Use the stored AgentGraph run, thread, checkpoint, and interrupt
identities and the supported reconciliation path; never edit projection state
as an execution shortcut.

---

## 11. Schema-v2 collectForm authoring has a runtime boundary

Schema-v2 Ask steps can compile structured fields into `collectForm` runtime nodes, including fields authored as JSON text. The runtime still validates the compiled workflow contract, not arbitrary UI-only draft data.

**Impact**: Invalid JSON or non-list structured field payloads are ignored by the compiler and will not become form fields.

**Workaround**: Keep structured fields as a JSON array of field objects or use the semantic editor controls, then run workflow validation before publishing.

---

## 12. Channels send the final answer

The web widget streams the answer while it is written. Telegram, Slack
and email send the committed answer once it is complete; Telegram
shows a typing indicator meanwhile.

**Impact**: long answers appear in channels only at the end of the turn.

---

## 13. Streaming needs a shared cache and one PHP worker per open chat

The widget's streaming request reads the draft the queue worker writes into the
cache. With a per-process store such as `array` the widget shows only the
final answer. Each open chat holds one PHP worker until its turn ends.

**Workaround**: share one cache store (database or Redis) between web and queue
processes, size PHP-FPM workers for concurrent chats, or set
`AGENTIC_CHATBOT_CHAT_STREAM_RELAY_SECONDS=0` to let the widget poll instead.

---

## 14. Not built yet

- Voice messages in channels are not transcribed.
- Website sources crawl only the exact host and accept HTML, XHTML and plain
  text. PDFs and other content types are skipped; upload them through Files.
  Maximum pages is 2,000; response/decompressed sitemap size is 5 MiB, link depth
  five, redirects five, sitemap nesting three levels below the root, and total
  requests are bounded. Bound-limited discovery retains unconfirmed old pages.
- Database vector capacity is per Agent: about 800 chunks warning / 3,000 hard
  at 1,536 dimensions and 400 / 1,500 at 3,072. Large Websites need pgvector or
  fewer pages / exclude patterns. Capacity refusal keeps the old generation.
- Website crawling needs an asynchronous ingestion worker, Laravel scheduler,
  and shared database or Redis cache. An empty candidate fails closed and keeps
  the old generation; a cancelled or heartbeat-expired run never activates.
- MCP resources are not offered as a knowledge source type, and MCP prompts are
  ignored.
- There is no inbound trigger endpoint that starts a Workflow or a proactive
  message from another system.
- Knowledge generations that no published version pins are kept; storage grows
  when re-synced content changes.

---

## 15. French and Spanish are machine translated

English and German are complete and reviewed. French and Spanish cover every
text but were machine translated and not reviewed by native speakers. Override
single texts in `lang/vendor/filament-agentic-chatbot/{locale}/`; see
[Localization](LOCALIZATION.md).

---

## 16. Agent tests run on demand

Agent tests run against the saved draft when an admin starts them, one test per
request. There is no scheduled test run, and failing tests warn but never block
publishing.

HTTP responses request `Accept-Encoding: identity` and disable automatic decoding.
Unexpected gzip or deflate encoding is streamed through a decoded-byte cap
(5 MiB for pages and sitemaps, or a lower configured limit); other encodings
are refused. The `deflate` encoding supports zlib-wrapped streams only; raw
(unwrapped) deflate is refused. robots.txt has a separate 500 KiB cap.

Website documents retain the full normalized page text in `meta.text` for
checkpoint recovery, carry-forward and reindexing. This adds up to 5 MiB per
page, plus JSON encoding overhead, alongside chunks and vectors. A 2,000-page
crawl can therefore retain about 9.8 GiB of page text per generation before
JSON overhead; retained generations add to that cost. Plan database storage
and generation retention for large Websites.

---

## 17. MySQL and MariaDB specifics (1.0 candidate)

The 1.0 candidate matrix passed on MySQL 8.4.11 and MariaDB
11.4.13-MariaDB-ubu2404 on 2026-10-16, including both Laravel `mariadb` and
`mysql` drivers against MariaDB, for the cases and exclusions recorded in
`docs/COMPATIBILITY.md`. Known differences:

- Remaining `TIMESTAMP` columns end on 2038-01-19 on these engines. A temporary
  table probe rejected 2040-01-01 with error 1292 on both. The pricing business
  dates `ai_model_prices.effective_from` and
  `ai_usage_calls.pricing_effective_from` use `DATETIME`, including the Unix epoch.
- A memory key longer than 255 characters is refused, and AgentGraph memory
  scope ids over 191 and tenant ids or namespaces over 128 characters are
  refused on every database; the package hashes longer actor identities.
- A sub-workflow step path longer than 760 characters cannot be published on
  any database.
- Recovery of a partly applied older migration chain is not certified by the
  fresh-install matrix. Preserve that database and validate the new installation
  in a separate empty database (see `UPGRADING.md`).
- The evidence covers the matrix and its slice. The full default suite is a
  separate in-memory SQLite check; production throughput and an entire suite on
  MySQL or MariaDB were not measured. SQLite 3.39 was not tested.

---

## 18. Customer identity limits (ADR 0057)

- **Personal steps after a long wait need a fresh sign-in.** A delayed
  Workflow step, an API connection completion or an approved Human Review that
  resumes for a signed-context visitor after the context that admitted the
  turn expired (10 minutes in production by default, at most 60) still runs
  its public steps, but every personal step and policy write refuses with
  `sign_in_required`. Personal work after long waits needs a same-origin
  session, where no expiry applies, or a new request by the visitor.
- **Scope-only identity without listed types.** With an empty
  `context.host_actors.types`, a personal tool is bound only by its attested
  scope values and is not rechecked against the host. A disabled account
  keeps access until its signed context expires, and a scope that binds
  `actor.id` without `actor.type` could match another type with the same ID.
  Bind both, and list your customer types.
- **Guards without a user provider.** A queued turn of a user from a guard
  without a configured user provider (for example Sanctum's token guard)
  cannot be rechecked in the worker; its personal tools need an allowed type.
- **Cross-site cookies.** An external-site context endpoint needs the session
  cookie of the endpoint's site. Browsers that block third-party cookies send
  none, so the visitor appears as a guest; use `contextTokenProvider` with a
  server-to-server token in that case.
- **`refreshContext()` fences in-flight requests.** It ignores chat and history
  answers still in flight, also when the renewed identity is unchanged.
