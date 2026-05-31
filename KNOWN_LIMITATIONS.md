# Known Limitations

> **Version**: 0.13.0<br>
> **Last updated**: 2026-05-31

This page documents known constraints, upstream limitations, and workarounds.

---

## 1. `laravel/ai` provider behavior varies by version

The plugin depends on [`laravel/ai`](https://github.com/laravel/ai) at `^0.7 || ^1.0`.
Provider and gateway support can still vary across SDK and upstream provider versions.

**Impact**:

- Per-node `temperature` and `maxTokens` overrides are passed to the SDK generation options, but exact behavior still depends on the selected provider gateway.
- Streaming support is limited to what the underlying SDK exposes.

**Workaround**: If a provider ignores a generation option, configure matching defaults in the provider or choose a model gateway that supports the option.

---

## 2. PostgreSQL + pgvector is still the default path

The package supports both PostgreSQL + `pgvector` and ChromaDB, but PostgreSQL remains the default and most battle-tested path.

**Impact**: Tests use an in-memory SQLite database with a pgvector shim, which is enough for package validation but not representative of production retrieval performance. If you do not want PostgreSQL, you should run ChromaDB explicitly instead of assuming SQLite can replace a vector backend.

**Workaround**: Use ChromaDB as an alternative vector store backend (see configuration).

ChromaDB now keeps similarity thresholds strict by default. `AGENTIC_CHATBOT_CHROMA_ALLOW_THRESHOLD_BYPASS=true` is available only as an explicit compatibility escape hatch and marks bypassed chunks.

---

## 3. Workflow loop execution limits

Loop nodes enforce a hard iteration ceiling (configurable via `workflow.max_steps`). Exceeding the limit terminates the workflow with a user-facing error.

**Impact**: Very large loop-count workflows will fail. Default is 50 steps.

**Workaround**: Increase `max_steps` in config, or break complex logic into smaller chat-focused workflows.

---

## 4. LLM-generated workflow JSON

The "Generate from prompt" feature produces workflow JSON via the configured LLM. Generated workflows:

- Are always saved as **drafts** (never auto-published)
- Must pass the full structural + semantic validation pipeline before activation
- May occasionally require manual adjustment of edge connections or node data

**Best practice**: Always review generated workflows in the visual editor before publishing.

---

## 5. Widget SDK CSP restrictions

The embeddable chat widget is loaded through a `<script>` tag and calls the plugin's API endpoints directly. Sites with strict Content Security Policy headers must allow the widget script URL plus the API origin used by the chat endpoints. The current widget runtime also injects its own `<style>` tag, so CSP policies that forbid inline styles can still block the widget even on the same Laravel app.

Query-string and request-body widget tokens are still accepted by default for compatibility. Production hosts should disable them and use the widget token header before public rollout.

---

## 6. API knowledge source scope

API knowledge sources support authenticated `GET` JSON endpoints, field mapping, page-number/offset/cursor/next-URL pagination, scheduled full re-sync, per-sync safety limits, and full source replacement after successful sync. OAuth refresh flows and delta/incremental sync are intentionally not universal in this release.

**Impact**: APIs that require provider-specific auth flows, custom request signing, webhooks, or complex delta sync still need a curated endpoint or gateway.

**Workaround**: Start with curated JSON endpoints or API gateways. Use workflow API Connector nodes for live/user-specific lookups instead of syncing private transactional data into the knowledge base.

---

## 7. Delay nodes require a queue worker

Delay/timer nodes dispatch a `ResumeWorkflowRunJob` to the queue. If your queue driver is `sync`, delay nodes will block the HTTP request. The `filament-agentic-chatbot:doctor` command warns about this.

**Workaround**: Use `database`, `redis`, or `sqs` queue driver in production and ensure `php artisan queue:work` is running.
